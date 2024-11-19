# 简易 jq

一个在 Node.js 中实现的简易 `jq`，仅用于快速测试。

## 使用方法

```sh
node jq.js [options] [input]
```

### 选项

- `-p, --path <path>`: 指定要提取的 JSON 路径
- `-h, --help`: 显示此帮助信息并退出

### 位置参数

- `input`: JSON 数据。如果未提供输入，脚本将从标准输入读取。

## 示例

### 从命令行参数读取

```sh
node jq.js -p .data '{"data": "hello"}'
```

### 从标准输入读取

```sh
cat example.json | node jq.js -p .data
```

### 显示帮助信息

```sh
node jq.js --help
```
