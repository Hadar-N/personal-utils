// making a python object print into workable json

const example =
    ""

const regexp_to_replace = {
    // tuples
    "datetime\\.datetime\\(([\\d,\\s]+).+?\\)": `"Date($1)"`,
    "(?:[a-zA-Z0-9]+)?\\(([^=:]+?)\\)": "[$1]",
    // custom classes
    "[a-zA-Z0-9]+?\\((.+?)\\)": "{$1}",
    // special marks/symbols
    "=": ":",
    "'": `"`,
    "([,\\[\\{\\s])([a-zA-Z0-9_]+):": `$1"$2":`,
    // keywords
    ":\\s?None": ":null",
    ":\\s?True": ":true",
    ":\\s?False": ":false"
}

const REPLACABLE_STRUCTURES = (str, regexp_list) => {
    const as_str = Object.entries(regexp_list).reduce((acc, curr) => {
        let re = new RegExp(curr[0], "g");
        while (acc.match(re)) {
            acc = acc.replaceAll(re, curr[1]);
        }
        return acc;
    }, str);
    //    console.log("pre: ", as_str)

    res = JSON.parse(as_str)
    //    console.log("post: ", res)
    return res
}


let res = py_print_to_json(example, regexp_to_replace)
console.log(res)