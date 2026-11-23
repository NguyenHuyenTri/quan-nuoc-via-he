"""Serve the cafe game on this PC."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from subprocess import DEVNULL, TimeoutExpired, run
from tempfile import TemporaryDirectory
from threading import BoundedSemaphore, Timer
from urllib.parse import parse_qs, urlsplit
import os
import sys
import webbrowser


class CafeHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        request = urlsplit(self.path)
        if request.path in ("/", "/index.html"):
            page = (ROOT / "index.html").read_bytes().replace(
                b"</head>", b'<meta name="cafe-piper" content="1"></head>', 1)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(page)
            return
        if request.path != "/host-voice":
            return super().do_GET()
        if self.headers.get("Host") not in {f"{HOST}:{PORT}", f"localhost:{PORT}"} or self.headers.get("Sec-Fetch-Site") == "cross-site":
            return self.send_error(403)
        text = parse_qs(request.query).get("text", [""])[0].strip()
        if not text or len(text) > 300 or "\x00" in text:
            return self.send_error(400)
        model = select_voice_model(ROOT)
        if model is None:
            return self.send_error(503, "Vietnamese Piper model missing")
        if not VOICE_SLOT.acquire(blocking=False):
            return self.send_error(429)
        try:
            with TemporaryDirectory() as directory:
                output = Path(directory) / "voice.wav"
                python = ["py", "-3.12"] if os.name == "nt" and sys.version_info[:2] != (3, 12) else [sys.executable]
                result = run([*python, "-m", "piper", "-m", str(model),
                              "-f", str(output), "--", text],
                             stdout=DEVNULL, timeout=12)
                if result.returncode or not output.is_file():
                    return self.send_error(503, "Piper unavailable")
                wave = output.read_bytes()
        except (OSError, TimeoutExpired):
            return self.send_error(503, "Piper unavailable")
        finally:
            VOICE_SLOT.release()
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(wave)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(wave)

    def translate_path(self, path):
        resolved = Path(super().translate_path(path)).resolve()
        if resolved.parent == ROOT and resolved.name in {"index.html", "styles.css"}:
            return str(resolved)
        if resolved == ROOT:
            return str(ROOT / "index.html")
        return str(ROOT / ".missing-local-page")


ROOT = Path(__file__).resolve().parent
VOICE_MODELS = ("vi_VN-vivos-x_low.onnx", "vi_VN-vais1000-medium.onnx")
VOICE_SLOT = BoundedSemaphore(1)
HOST, PORT = "127.0.0.1", 21315


def select_voice_model(directory):
    for name in VOICE_MODELS:
        model = directory / name
        if model.is_file() and model.with_suffix(".onnx.json").is_file():
            return model
    return None


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
