#!/usr/bin/env python3
# Migrate guide_places photos from tildacdn -> Supabase Storage (bucket "guide"),
# then rewrite guide_places.photos + image to the new public Storage URLs.
# Key is read from env SUPA_KEY (a secret / service_role key). Never hardcoded.
import os, json, sys, urllib.request, urllib.error, mimetypes

PROJ = "qkzinjawtumhjbezlyog"
BASE = f"https://{PROJ}.supabase.co"
BUCKET = "guide"
KEY = os.environ.get("SUPA_KEY", "").strip()
if not KEY:
    print("ERROR: set SUPA_KEY env var with a Supabase secret/service key"); sys.exit(1)

def req(method, url, data=None, headers=None, raw=False):
    h = {"apikey": KEY, "Authorization": "Bearer " + KEY}
    if headers: h.update(headers)
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            b = resp.read()
            return resp.status, (b if raw else b.decode("utf-8", "replace"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")

# 1) ensure public bucket
st, body = req("POST", f"{BASE}/storage/v1/bucket",
               data=json.dumps({"id": BUCKET, "name": BUCKET, "public": True}).encode(),
               headers={"Content-Type": "application/json"})
print(f"bucket: {st} {body[:120]}")  # 200 created, or 400 already exists -> fine

# 2) read places
st, body = req("GET", f"{BASE}/rest/v1/guide_places?select=slug,photos,image&status=eq.published")
places = json.loads(body)
print(f"places: {len(places)}")

def ext_of(url, ctype):
    for e in (".jpg", ".jpeg", ".png", ".webp"):
        if url.lower().split("?")[0].endswith(e): return ".jpg" if e == ".jpeg" else e
    if ctype:
        g = mimetypes.guess_extension(ctype.split(";")[0].strip())
        if g: return ".jpg" if g == ".jpeg" else g
    return ".jpg"

ok = fail = patched = 0
for p in places:
    slug = p["slug"]
    photos = p.get("photos") or []
    if isinstance(photos, str): photos = [photos]
    if not photos and p.get("image"): photos = [p["image"]]  # image-only places (no photos array)
    # de-dupe exact urls, keep order
    seen = set(); photos = [u for u in photos if not (u in seen or seen.add(u))]
    new_urls = []
    for i, src in enumerate(photos, 1):
        try:
            with urllib.request.urlopen(src, timeout=60) as resp:
                blob = resp.read(); ctype = resp.headers.get("Content-Type", "")
        except Exception as e:
            print(f"  ! download fail {slug} {src[:60]}: {e}"); fail += 1; continue
        ext = ext_of(src, ctype)
        path = f"{slug}/{i:02d}{ext}"
        st, b = req("POST", f"{BASE}/storage/v1/object/{BUCKET}/{path}", data=blob,
                    headers={"Content-Type": ctype or "image/jpeg", "x-upsert": "true"}, raw=True)
        if st in (200, 201):
            new_urls.append(f"{BASE}/storage/v1/object/public/{BUCKET}/{path}"); ok += 1
        else:
            print(f"  ! upload fail {slug} {path}: {st} {str(b)[:120]}"); fail += 1
    if new_urls:
        patch = json.dumps({"photos": new_urls, "image": new_urls[0]}).encode()
        st, b = req("PATCH", f"{BASE}/rest/v1/guide_places?slug=eq.{slug}", data=patch,
                    headers={"Content-Type": "application/json", "Prefer": "return=minimal"})
        if st in (200, 204): patched += 1; print(f"  ok {slug}: {len(new_urls)} photos")
        else: print(f"  ! patch fail {slug}: {st} {str(b)[:120]}")

print(f"\nDONE. uploaded {ok}, failed {fail}, places patched {patched}/{len(places)}")
