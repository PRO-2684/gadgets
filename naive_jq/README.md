# Naive jq

A naive implementation of `jq` in Node.js, only for quick testing.

## Usage

```sh
node jq.js [options] [input]
```

### Options

- `-p, --path <path>`: Specify the JSON path to extract
- `-h, --help`: Display this help message and exit

### Positional Arguments

- `input`: JSON data. If input is not provided, the script will read from standard input.

## Examples

### Read from command-line arguments

```sh
node jq.js -p .data '{"data": "hello"}'
```

### Read from standard input

```sh
cat example.json | node jq.js -p .data
```

### Display help message

```sh
node jq.js --help
```
