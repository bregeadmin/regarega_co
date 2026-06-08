#!/usr/bin/env python3
# Migrate news photos (src/data/news.json) from tildacdn -> Supabase Storage
# (bucket "guide", path news/<slug>/NN.ext), then rewrite news.json (image + photos).
# Drops the bre.ge logo placeholder (___12.png) and filename-duplicates.
# Key read from env SUPA_KEY. Never hardcoded.
import os, json, sys, urllib.request, urllib.error, mimetypes

PROJ = "qkzinjawtumhjbezlyog"
BASE = f"https://{PROJ}.supabase.co"
BUCKET = "guide"
NEWS = os.path.join(os.path.dirname(__file__), "..", "src", "data", "news.json")
KEY = os.environ.get("SUPA_KEY", "").strip()
if not KEY:
    print("ERROR: set SUPA_KEY"); sys.exit(1)

def up(path, blob, ctype):
    h = {"apikey": KEY, "Authorization": "Bearer " + KEY,
         "Content-Type": ctype or "image/jpeg", "x-upsert": "true"}
    r = urllib.request.Request(f"{BASE}/storage/v1/object/{BUCKET}/{path}", data=blob, headers=h, method="POST")
    try:
        with urllib.request.urlopen(r, timeout=60) as resp: return resp.status
    except urllib.error.HTTPError as e: print("  ! upload", path, e.code, e.read()[:120]); return e.code

def ext_of(url, ctype):
    for e in (".jpg", ".jpeg", ".png", ".webp"):
        if url.lower().split("?")[0].endswith(e): return ".jpg" if e == ".jpeg" else e
    g = mimetypes.guess_extension((ctype or "").split(";")[0].strip()) if ctype else None
    return (".jpg" if g == ".jpeg" else g) or ".jpg"

data = json.load(open(NEWS, encoding="utf-8"))
ok = 0
for n in data:
    slug = n["slug"]
    raw = (n.get("photos") or [])
    if n.get("image"): raw = [n["image"]] + raw
    # drop logo + filename dupes, keep order
    seen = set(); clean = []
    for u in raw:
        if "___12.png" in u: continue
        base = u.split("/")[-1]
        if base in seen: continue
        seen.add(base); clean.append(u)
    new = []
    for i, src in enumerate(clean, 1):
        try:
            with urllib.request.urlopen(src, timeout=60) as resp:
                blob = resp.read(); ctype = resp.headers.get("Content-Type", "")
        except Exception as e:
            print("  ! download", slug, e); continue
        path = f"news/{slug}/{i:02d}{ext_of(src, ctype)}"
        if up(path, blob, ctype) in (200, 201):
            new.append(f"{BASE}/storage/v1/object/public/{BUCKET}/{path}"); ok += 1
    if new:
        n["image"] = new[0]; n["photos"] = new
        print(f"  ok {slug}: {len(new)} photos")
json.dump(data, open(NEWS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"\nDONE. uploaded {ok}. news.json rewritten.")
