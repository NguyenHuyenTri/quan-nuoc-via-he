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
        if not VOICE_SLOT.acquire(blocking=False):
            return self.send_error(429)
        try:
            voice = synthesize_voice(text)
        except (OSError, TimeoutExpired):
            voice = None
        finally:
            VOICE_SLOT.release()
        if voice is None:
            return self.send_error(503, "Vietnamese speech unavailable")
        audio, content_type = voice
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(audio)

    def translate_path(self, path):
        resolved = Path(super().translate_path(path)).resolve()
        if resolved.parent == ROOT and resolved.name in {"index.html", "styles.css"}:
            return str(resolved)
        if resolved == ROOT:
            return str(ROOT / "index.html")
        return str(ROOT / ".missing-local-page")


ROOT = Path(__file__).resolve().parent
VOICE_SLOT = BoundedSemaphore(1)
HOST, PORT = "127.0.0.1", 21315


def synthesize_voice(text):
    model = ROOT / "vi_VN-vais1000-medium.onnx"
    if not model.is_file() or not model.with_suffix(".onnx.json").is_file():
        return None
    python = ["py", "-3.12"] if os.name == "nt" and sys.version_info[:2] != (3, 12) else [sys.executable]
    with TemporaryDirectory() as directory:
        output = Path(directory) / "voice.wav"
        result = run([*python, "-m", "piper", "-m", str(model),
                      "-f", str(output), "--", text], stdout=DEVNULL, timeout=12)
        if result.returncode == 0 and output.is_file() and output.stat().st_size:
            return output.read_bytes(), "audio/wav"
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
