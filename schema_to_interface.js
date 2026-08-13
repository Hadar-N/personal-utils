schema = ``;

SPLIT_BY_CLASS = /^class /m;
SKIP_STR = /^(from |import )/;
SCHEMA_META =
  /^(?<name>.+?)\((?<parent>.+?)\)\:(?<content>[\s\S]+?)(?=$|@|model_config)/;
BASE_MODEL_STR = "BaseModel";
PASS_STR = "pass";
IGNORED_PROPS = /^[#_"]/;

SIMPLE_SCHEMA_TYPE_TO_INTERFACE_TYPE = {
  UUID: "string",
  str: "string",
  datetime: "string",
  int: "number",
  float: "number",
  bool: "boolean",
  dict: "object",
  Dict: "object",
  None: "null",
};

COMPLEX_SCHEMA_TYPES = {
  optional: "Optional",
  array: ["list", "List"],
  object: "Dict"
};

all_names = [];

regexp_per_schematype = (schematype, str) => {
  re = new RegExp(`^${typeof schematype == "string" ? schematype : `(${schematype.join("|")})`}\\[(?<internaltype>.+)\\]`);
  found = str.match(re);
  if (found && found.groups) return found.groups.internaltype;
  else return null;
};

schema_type_to_interface_type = (str) => {
  if (SIMPLE_SCHEMA_TYPE_TO_INTERFACE_TYPE[str])
    return SIMPLE_SCHEMA_TYPE_TO_INTERFACE_TYPE[str];
  else {
    arr_inside = regexp_per_schematype(COMPLEX_SCHEMA_TYPES.array, str);
    if (arr_inside) return `${schema_type_to_interface_type(arr_inside)}[]`;

    obj_inside = regexp_per_schematype(COMPLEX_SCHEMA_TYPES.object, str);
    if (obj_inside) return `object`;

    if (all_names.includes(str)) return str;
  }

  return `${str} // TODO: HANDLE import`;
};

handle_property = (str) => {
  if (!str.trim()) return;

  [propname, fulltype] = str.split(":").map((str) => str.trim());
  if (propname.match(IGNORED_PROPS)) return;

  [typename, defval] = fulltype.split("=").map((i) => i.trim());

  if (defval && !typename.startsWith(COMPLEX_SCHEMA_TYPES.optional))
    typename = `${COMPLEX_SCHEMA_TYPES.optional}[${typename}]`;

  opt_inside = regexp_per_schematype(COMPLEX_SCHEMA_TYPES.optional, typename);
  if (opt_inside) {
    propname += "?";
    typename = opt_inside;
  }

  return `${propname}: ${schema_type_to_interface_type(typename)}`;
};

make_interface = (schema) =>
  schema
    .split(SPLIT_BY_CLASS)
    .map((cl) => {
      if (cl.match(SKIP_STR)) return "";

      meta = cl.match(SCHEMA_META).groups;
      if (!meta)
        throw Error("invalid schema does not comply with structure: ", schema);

      all_names.push(meta.name);

      content = `export interface ${meta.name}`;
      if (meta.parent !== BASE_MODEL_STR) content += ` extends ${meta.parent}`;
      content += " {";

      if (meta.content.trim() !== PASS_STR) {
        content +=
          "\n  " +
          meta.content
            .split("\n")
            .map((i) => handle_property(i))
            .filter((i) => i && i.trim())
            .join("\n  ") +
          "\n";
      }

      content += "}";
      return content;
    })
    .join("\n\n");
