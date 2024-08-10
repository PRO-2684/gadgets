import os
from argparse import ArgumentParser
from hashlib import md5
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, test
from urllib import parse


class ETagHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Simple HTTP request handler with GET and HEAD commands, but using `ETag` instead of `Last-Modified` for caching.

    This serves files from the current directory and any of its
    subdirectories.  The MIME type for files is determined by
    calling the .guess_type() method.

    The GET and HEAD requests are identical except that the HEAD
    request omits the actual contents of the file.
    """
    def send_head(self):
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            parts = parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                new_parts = (parts[0], parts[1], parts[2] + '/',
                             parts[3], parts[4])
                new_url = parse.urlunsplit(new_parts)
                self.send_header("Location", new_url)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.isfile(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        # check for trailing "/" which should return 404. See Issue17324
        # The test for this was added in test_httpserver.py
        # However, some OS platforms accept a trailingSlash as a filename
        # See discussion on python-dev and Issue34711 regarding
        # parseing and rejection of filenames with a trailing slash
        if path.endswith("/"):
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None

        try:
            fs = os.fstat(f.fileno())
            timestamp = str(fs.st_mtime).encode('utf-8') # Use timestamp's hash as ETag to avoid reading the whole file
            etag = md5(timestamp).hexdigest()
            etag = f'W/"{etag}"'

            # Use browser cache if possible
            self.log_message(f"Request etag: {self.headers.get('If-None-Match')}, file etag: {etag}")
            if self.headers.get('If-None-Match') == etag:
                self.send_response(HTTPStatus.NOT_MODIFIED)
                self.end_headers()
                f.close()
                return None

            self.send_response(HTTPStatus.OK)
            self.send_header("Content-type", ctype)
            self.send_header("Content-Length", str(fs.st_size))
            self.send_header("Cache-Control", "public, max-age=604800, s-maxage=43200")
            self.send_header("ETag", etag)
            self.end_headers()
            return f
        except:
            f.close()
            raise

if __name__ == '__main__':
    parser = ArgumentParser(description="Simple HTTP server that serves files, but using `ETag` instead of `Last-Modified` for caching.")
    parser.add_argument("--port", "-p", type=int, default=8000, help="Port to listen on (default: 8000)")
    parser.add_argument("--directory", "-d", default="./", help="Directory to serve (default: ./)")
    args = parser.parse_args()

    os.chdir(args.directory)
    test(
        HandlerClass=ETagHTTPRequestHandler,
        port=args.port,
        protocol="HTTP/1.1" # HTTP/1.1 is required for ETag to work
    )
