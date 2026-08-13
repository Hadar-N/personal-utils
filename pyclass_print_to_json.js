// making a python object print into workable json

const example =
""

const REPLACABLE_STRUCTURES = {
    // tuples
    "\\(([^=:]+?)\\)": "[$1]",

    // custom classes
    "[a-zA-Z]+?\\((.+?)\\)": "{$1}",

    // special marks/symbols
    "=": ":",
    "'": `"`,
    "([,\\[\\{\\s])([a-zA-Z0-9_]+):": `$1"$2":`,

    // keywords
    ":\\s?None": ":null",
    ":\\s?True": ":true",
    ":\\s?False": ":false",
    };


const py_print_to_newstr = (str, REPLACABLE_STRUCTURES) => {
    res = Object.entries(REPLACABLE_STRUCTURES).reduce((acc, curr) => {
    re = new RegExp(curr[0], "g");
    while (acc.match(re)) {
        acc = acc.replaceAll(re, curr[1]);
    }
    return acc;
    }, str);

    return res;
}

const res_str = py_print_to_newstr(example, REPLACABLE_STRUCTURES)
const res_json = JSON.parse(res_str)

console.log(res_json)