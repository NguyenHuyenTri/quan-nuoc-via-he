"""Serve the cafe game on this PC."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser


class CafeHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        resolved = Path(super().translate_path(path)).resolve()
        if resolved.parent == ROOT and resolved.name in {"index.html", "styles.css"}:
            return str(resolved)
        if resolved == ROOT:
            return str(ROOT / "index.html")
        return str(ROOT / ".missing-local-page")


ROOT = Path(__file__).resolve().parent
HOST, PORT = "127.0.0.1", 21315


def main():
    handler = partial(CafeHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer((HOST, PORT), handler)
    except OSError as error:
        raise SystemExit(f"Cannot open port {PORT}: {error}") from error
    url = f"http://{HOST}:{PORT}/"
    with server:
        print(f"Quán Nước Vỉa Hè: {url}", flush=True)
        print("Giữ cửa sổ này mở trong lúc chơi. Ctrl+C để dừng.", flush=True)
        opener = Timer(0.2, webbrowser.open, args=(url,))
        opener.daemon = True
        opener.start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
