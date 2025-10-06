# `etag_server`

## 🪄 Function

Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.

## 📖 Usage

```text
usage: etag_server.py [-h] [--port PORT] [--directory DIRECTORY]

Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.

options:
  -h, --help            show this help message and exit
  --port PORT, -p PORT  Port to listen on (default: 8000)
  --directory DIRECTORY, -d DIRECTORY
                        Directory to serve (default: ./)
```
