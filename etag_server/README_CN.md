# `etag_server`

## 🪄 功能
简易的提供文件服务的 HTTP 服务器，但使用 `ETag` 而不是 `Last-Modified` 进行缓存。

## 📖 使用
```text
usage: etag_server.py [-h] [--port PORT] [--directory DIRECTORY]

Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.

options:
  -h, --help            show this help message and exit
  --port PORT, -p PORT  Port to listen on (default: 8000)
  --directory DIRECTORY, -d DIRECTORY
                        Directory to serve (default: ./)
```
