#!/usr/bin/env python3
"""Serve quiz/ and exam audio from the repo root (stdlib only)."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST, PORT = "127.0.0.1", 8765
CHUNK = 65536


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _file_path(self):
        path = Path(self.translate_path(self.path))
        return path if path.is_file() else None

    def _parse_range(self, size):
        header = self.headers.get("Range")
        if not header or not header.startswith("bytes="):
            return None
        spec = header.split("=", 1)[1].split(",", 1)[0].strip()
        left, _, right = spec.partition("-")
        try:
            if left and right:
                start, end = int(left), int(right)
            elif left:
                start, end = int(left), size - 1
            elif right:
                start, end = max(0, size - int(right)), size - 1
            else:
                return None
        except ValueError:
            return None
        if start < 0 or start >= size:
            return "unsatisfiable"
        end = min(end, size - 1)
        if end < start:
            return "unsatisfiable"
        return start, end

    def do_GET(self):
        path = self._file_path()
        if path is None:
            super().do_GET()
            return
        self._send_file(path, include_body=True)

    def do_HEAD(self):
        path = self._file_path()
        if path is None:
            super().do_HEAD()
            return
        self._send_file(path, include_body=False)

    def _send_file(self, path, include_body):
        size = path.stat().st_size
        byte_range = self._parse_range(size)
        if byte_range == "unsatisfiable":
            self.send_error(416, "Requested Range Not Satisfiable")
            return
        if byte_range:
            start, end = byte_range
            length = end - start + 1
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            start, length = 0, size
            self.send_response(200)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Last-Modified", self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        if not include_body:
            return
        with path.open("rb") as handle:
            handle.seek(start)
            remaining = length
            while remaining:
                chunk = handle.read(min(CHUNK, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except BrokenPipeError:
                    return
                remaining -= len(chunk)


class Server(ThreadingHTTPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    print(f"Quiz: http://{HOST}:{PORT}/quiz/", flush=True)
    Server((HOST, PORT), Handler).serve_forever()
