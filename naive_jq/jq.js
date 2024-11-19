// A naive implementation of jq in Node.js, only for quick testing

const fs = require("fs");
const { parseArgs } = require("node:util");

const options = {
    path: {
        type: "string",
        short: "p"
    },
    help: {
        type: "boolean",
        short: "h"
    }
};
const args = parseArgs({ options, allowPositionals: true, args: process.argv.slice(2) });

if (args.values.help) {
    console.log(`Usage: node jq.js [options] [input]
Options:
  -p, --path <path>    Specify the JSON path to extract
  -h, --help           Show this help message and exit

If no input is provided, the script will read from stdin.`);
    process.exit(0);
}

const path = args.values.path ?? "";
// console.log(args);

const str = args.positionals[0] ?? fs.readFileSync(0, "utf-8");
const data = JSON.parse(str.trim());
// console.log(data);

let result = data;
for (const part of path.split(".").slice(1)) {
    result = result?.[part];
}
console.log(result);
