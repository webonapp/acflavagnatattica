#!/usr/bin/env python3
"""Bundle the existing static board into the authenticated Sites Worker."""
import base64
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
WORKER = ROOT / "worker" / "index.js"
ASSETS = ["index.html", "style.css", "board.js", "fiorentina.png", "pallone.png", "CommutersSans-Regular.otf", "CommutersSans-Bold.otf"]
MIME = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".otf": "font/otf"}

assets = {}
for name in ASSETS:
    path = DIST / name
    if not path.is_file():
        raise SystemExit(f"Asset richiesto mancante: {path}")
    assets["/" + name] = {"body": base64.b64encode(path.read_bytes()).decode("ascii"), "type": MIME.get(path.suffix, "application/octet-stream")}

worker = WORKER.read_text(encoding="utf-8")
marker = "__EMBEDDED_ASSETS__"
if worker.count(marker) != 1:
    raise SystemExit("Segnaposto degli asset non valido nel Worker.")
worker = worker.replace(marker, json.dumps(assets, ensure_ascii=True, separators=(",", ":")))
(DIST / "server").mkdir(parents=True, exist_ok=True)
(DIST / ".openai" / "drizzle").mkdir(parents=True, exist_ok=True)
(DIST / "server" / "index.js").write_text(worker, encoding="utf-8")
shutil.copy2(ROOT / ".openai" / "hosting.json", DIST / ".openai" / "hosting.json")
shutil.copytree(ROOT / "drizzle", DIST / ".openai" / "drizzle", dirs_exist_ok=True)
print("Creato Worker Sites con asset incorporati e migrazione D1.")
