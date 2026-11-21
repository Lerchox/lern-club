"""Baut data/karten.js (Karten-Quiz) aus den offenen Grenzdaten von swisstopo.

Aufruf (im Projektordner):   python tools/build_karten.py

Quelle: swisstopo swissBOUNDARIES3D, als TopoJSON im npm-Paket «swiss-maps» (Interactive Things).
Die Datei wird beim ersten Lauf nach tools/.cache/ geladen (nicht im Repo).

NEUE KARTE: unten in KARTEN einen Eintrag ergänzen und das Skript laufen lassen.
  kind = "cantons"    → Kantone (alle oder eine Auswahl per BFS-Kantonsnummer in "ids")
  kind = "districts"  → Bezirke eines Kantons, über die BFS-Gemeindenummern in "ranges"
Die "key" einer Karte nie ändern: daran hängen Bestzeit und Fortschritt des Kindes.
"""
import json, math, os, sys, urllib.request

YEAR = "2025"
SRC_URL = f"https://unpkg.com/swiss-maps@4/{YEAR}/ch-combined.json"
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache", f"ch-combined-{YEAR}.json")
OUT = os.path.join(HERE, "..", "data", "karten.js")

CANTONS = {1: ("ZH", "Zürich"), 2: ("BE", "Bern"), 3: ("LU", "Luzern"), 4: ("UR", "Uri"), 5: ("SZ", "Schwyz"), 6: ("OW", "Obwalden"),
           7: ("NW", "Nidwalden"), 8: ("GL", "Glarus"), 9: ("ZG", "Zug"), 10: ("FR", "Freiburg"), 11: ("SO", "Solothurn"),
           12: ("BS", "Basel-Stadt"), 13: ("BL", "Basel-Landschaft"), 14: ("SH", "Schaffhausen"), 15: ("AR", "Appenzell Ausserrhoden"),
           16: ("AI", "Appenzell Innerrhoden"), 17: ("SG", "St. Gallen"), 18: ("GR", "Graubünden"), 19: ("AG", "Aargau"),
           20: ("TG", "Thurgau"), 21: ("TI", "Tessin"), 22: ("VD", "Waadt"), 23: ("VS", "Wallis"), 24: ("NE", "Neuenburg"),
           25: ("GE", "Genf"), 26: ("JU", "Jura")}

# ---- Die Karten der App (Reihenfolge = Reihenfolge in der App) ----
KARTEN = [
    {
        "key": "ag", "kind": "districts", "canton": 19, "width": 600,
        "title": {"de": "Bezirke im Aargau", "en": "Districts of Aargau", "es": "Distritos de Argovia"},
        "ranges": [("aarau", "Aarau", 4001, 4013), ("baden", "Baden", 4021, 4049), ("bremgarten", "Bremgarten", 4061, 4084),
                   ("brugg", "Brugg", 4091, 4124), ("kulm", "Kulm", 4131, 4147), ("laufenburg", "Laufenburg", 4161, 4184),
                   ("lenzburg", "Lenzburg", 4191, 4210), ("muri", "Muri", 4221, 4240), ("rheinfelden", "Rheinfelden", 4251, 4264),
                   ("zofingen", "Zofingen", 4271, 4289), ("zurzach", "Zurzach", 4301, 4330)],
    },
    {
        "key": "ch", "kind": "cantons", "width": 640, "small": True,
        "title": {"de": "Kantone der Schweiz", "en": "Cantons of Switzerland", "es": "Cantones de Suiza"},
    },
]


def load():
    if not os.path.exists(CACHE):
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        print("lade", SRC_URL)
        urllib.request.urlretrieve(SRC_URL, CACHE)
    return json.load(open(CACHE, encoding="utf-8"))


d = load()
sx, sy = d["transform"]["scale"]; tx, ty = d["transform"]["translate"]
arcs = []
for a in d["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring(idx):
    pts = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts


def polys(g):
    if g["type"] == "Polygon": return [[ring(r) for r in g["arcs"]]]
    if g["type"] == "MultiPolygon": return [[ring(r) for r in p] for p in g["arcs"]]
    return []


def area(r):
    return abs(sum(r[k - 1][0] * r[k][1] - r[k][0] * r[k - 1][1] for k in range(len(r)))) / 2


def centroid(poly):
    r = poly[0]; A = cx = cy = 0
    for k in range(len(r)):
        x1, y1 = r[k - 1]; x2, y2 = r[k]
        c = x1 * y2 - x2 * y1; A += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c
    return r[0] if A == 0 else (cx / (3 * A), cy / (3 * A))


def pip(pt, poly):
    x, y = pt; inside = False
    for r in poly:
        for k in range(len(r)):
            x1, y1 = r[k]; x2, y2 = r[k - 1]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                inside = not inside
    return inside


def simplify(pts, eps):
    """Douglas-Peucker"""
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
        best, bi = 0, -1
        for i in range(a + 1, b):
            x, y = pts[i]
            # geschlossener Ring (Anfang = Ende): Abstand zum Punkt statt zur Linie
            dd = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L if (dx or dy) else math.hypot(x - x1, y - y1)
            if dd > best: best, bi = dd, i
        if best > eps and bi > 0:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


cantons = {int(g["id"]): polys(g) for g in d["objects"]["cantons"]["geometries"]}
districts = [polys(g) for g in d["objects"]["districts"]["geometries"]]
munis = {int(g["id"]): polys(g) for g in d["objects"]["municipalities"]["geometries"] if g.get("id") is not None}
lakes = [polys(g) for g in d["objects"]["lakes"]["geometries"]]


def regions_for(cfg):
    """Liefert [(id, name, kürzel|None, polygone)]"""
    if cfg["kind"] == "cantons":
        ids = cfg.get("ids") or sorted(cantons)
        return [(CANTONS[i][0].lower(), CANTONS[i][1], CANTONS[i][0], cantons[i]) for i in ids]
    if cfg["kind"] == "districts":
        out = []
        for key, name, lo, hi in cfg["ranges"]:
            votes = {}
            for i, mp in munis.items():
                if not lo <= i <= hi: continue
                c = centroid(max(mp, key=lambda p: area(p[0])))
                for j, dg in enumerate(districts):
                    if any(pip(c, p) for p in dg):
                        votes[j] = votes.get(j, 0) + 1; break
            if not votes: sys.exit(f"Keine Gemeinden für {name} gefunden – stimmen die BFS-Nummern?")
            out.append((key, name, None, districts[max(votes, key=votes.get)]))
        return out
    sys.exit("unbekannte kind: " + cfg["kind"])


def build(cfg):
    regs = regions_for(cfg)
    W, pad = cfg.get("width", 600), 12
    allpts = [pt for _, _, _, ps in regs for p in ps for r in p for pt in r]
    k = math.cos(math.radians(sum(p[1] for p in allpts) / len(allpts)))
    xs = [p[0] * k for p in allpts]; ys = [p[1] for p in allpts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    s = (W - 2 * pad) / (maxx - minx)
    H = round((maxy - miny) * s + 2 * pad)
    eps = 0.6 * W / 600
    P = lambda pt: (round((pt[0] * k - minx) * s + pad, 1), round((maxy - pt[1]) * s + pad, 1))

    def path(ps, min_area=0):
        out = []
        for p in ps:
            for r in p:
                q = simplify([P(pt) for pt in r], eps)
                if len(q) < 3 or area(q) < min_area: continue
                xs_ = [x for x, _ in q]; ys_ = [y for _, y in q]
                if max(xs_) < 0 or min(xs_) > W or max(ys_) < 0 or min(ys_) > H: continue  # ausserhalb
                out.append("M" + "L".join(f"{x:g},{y:g}" for x, y in q) + "Z")
        return "".join(out)

    m = {"title": cfg["title"], "w": W, "h": H, "regions": []}
    if cfg.get("small"): m["small"] = True
    if cfg["kind"] == "districts":
        m["outline"] = path(cantons[cfg["canton"]])  # Seen werden darauf zugeschnitten
    for rid, name, ab, ps in regs:
        lx, ly = P(centroid(max(ps, key=lambda p: area(p[0]))))
        r = {"id": rid, "name": name, "d": path(ps, 2), "lx": lx, "ly": ly}
        if ab: r["ab"] = ab
        m["regions"].append(r)
    m["lakes"] = "".join(path(l, 3) for l in lakes)
    print(f"{cfg['key']}: {len(regs)} Gebiete, {W}x{H}")
    return m


maps = {cfg["key"]: build(cfg) for cfg in KARTEN}
js = ("/* Karten für das Karten-Quiz. NICHT VON HAND BEARBEITEN – erzeugt mit tools/build_karten.py.\n"
      "   Quelle: Bundesamt für Landestopografie swisstopo (swissBOUNDARIES3D, OGD), via npm-Paket swiss-maps; vereinfacht. */\n"
      "window.MAPS = " + json.dumps(maps, ensure_ascii=False, separators=(",", ":")) + ";\n")
open(OUT, "w", encoding="utf-8").write(js)
print("geschrieben:", os.path.relpath(OUT), len(js) // 1024, "KB")
