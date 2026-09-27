#!/usr/bin/env python3
"""Render a scene's AUTHORED layout (tools/data/qe-scenes.json) as a labelled
floorplan schematic — the reference image for battle-map generation
(PLAN-battlemap-art.md step 1). Same look as the Royal Meadows reference:
dark floor, light walls, blue door gaps, room labels, a faint 1 m grid.

  python3 tools/render-plan.py "Craft's Magic Shop — Lower Level" _work/mapref/magic-shop-lower-floorplan.png
"""
import json, sys
from PIL import Image, ImageDraw, ImageFont

PX = 150          # pixels per metre in the schematic (the generator doesn't need more)
MARGIN = 1        # metres of empty border
BG, FLOOR, GRID = (14, 14, 18), (30, 30, 36), (40, 40, 48)
WALL, DOOR, TEXT, HINT = (236, 236, 244), (80, 170, 255), (230, 230, 238), (170, 175, 190)

def font(size):
    for f in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf"):
        try: return ImageFont.truetype(f, size)
        except OSError: pass
    return ImageFont.load_default()

def main(name, out):
    scenes = json.load(open("tools/data/qe-scenes.json"))
    scenes = scenes.get("scenes", scenes) if isinstance(scenes, dict) else scenes
    s = next(x for x in scenes if x["name"] == name)
    W, H = s["widthM"], s["heightM"]
    img = Image.new("RGB", ((W + 2 * MARGIN) * PX, (H + 2 * MARGIN) * PX), BG)
    d = ImageDraw.Draw(img)
    to = lambda m: int(round((m + MARGIN) * PX))
    for gx in range(W + 2 * MARGIN + 1): d.line([(gx * PX, 0), (gx * PX, img.height)], fill=GRID, width=1)
    for gy in range(H + 2 * MARGIN + 1): d.line([(0, gy * PX), (img.width, gy * PX)], fill=GRID, width=1)
    rooms = s.get("layout", [])
    for r in rooms:
        d.rectangle([to(r["x"]), to(r["y"]), to(r["x"] + r["w"]), to(r["y"] + r["h"])], fill=FLOOR)
    for r in rooms:
        d.rectangle([to(r["x"]), to(r["y"]), to(r["x"] + r["w"]), to(r["y"] + r["h"])], outline=WALL, width=8)
    # Doors: a gap in the wall, marked blue (as in the Royal Meadows reference).
    for door in s.get("doors", []):
        x1, y1, x2, y2 = door["seg"]
        if x1 == x2: d.rectangle([to(x1) - 6, to(y1), to(x1) + 6, to(y2)], fill=FLOOR)
        else:        d.rectangle([to(x1), to(y1) - 6, to(x2), to(y1) + 6], fill=FLOOR)
        d.line([(to(x1), to(y1)), (to(x2), to(y2))], fill=DOOR, width=5)
    # Glass (windows): cyan, drawn over the wall.
    for w in s.get("windows", []):
        x1, y1, x2, y2 = w["seg"]
        d.line([(to(x1), to(y1)), (to(x2), to(y2))], fill=(90, 230, 255), width=10)
    # Features that aren't rooms (stairs): hatched, labelled.
    for f in s.get("features", []):
        x0, y0, x1, y1 = to(f["x"]), to(f["y"]), to(f["x"] + f["w"]), to(f["y"] + f["h"])
        d.rectangle([x0, y0, x1, y1], outline=HINT, width=3)
        for k in range(x0 - (y1 - y0), x1, 22):
            d.line([(max(k, x0), y0 + max(0, x0 - k)), (min(k + (y1 - y0), x1), y1 - max(0, k + (y1 - y0) - x1))], fill=HINT, width=2)
    f1, f2 = font(34), font(24)
    inside = lambda a, b: a is not b and a["x"] >= b["x"] and a["y"] >= b["y"] \
        and a["x"] + a["w"] <= b["x"] + b["w"] and a["y"] + a["h"] <= b["y"] + b["h"]
    for r in rooms:
        # A room holding other rooms is labelled in its middle, so the nested
        # rooms' corner labels don't pile up on top of it.
        if any(inside(o, r) for o in rooms):
            tw = d.textlength(r["name"], font=f1)
            pos = (to(r["x"] + r["w"] / 2) - tw / 2, to(r["y"] + r["h"] / 2) - 17)
        else:
            pos = (to(r["x"]) + 18, to(r["y"]) + 14)
        d.text(pos, r["name"], fill=TEXT, font=f1)
        if r.get("hint"): d.text((pos[0], pos[1] + 44), r["hint"], fill=HINT, font=f2)
    for f in s.get("features", []):
        d.text((to(f["x"]) + 10, to(f["y"] + f["h"]) + 6), f["name"], fill=HINT, font=f2)
    img.save(out)
    print(out, img.size, f"{W}x{H} m")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
