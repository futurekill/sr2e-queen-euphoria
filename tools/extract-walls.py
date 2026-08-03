#!/usr/bin/env python3
"""Extract wall segments from Queen Euphoria's printed floorplans.

Why this exists
---------------
Scene dimensions were measured by profiling the plan's dark pixels (see
docs/SCENE-SPEC.md). That technique cannot find interior walls, because interior
walls are broken by doorways and are therefore never continuous down their full
extent. Loosen the threshold enough to catch them and it also returns bed and
counter edges; tighten it enough to reject furniture and only the perimeter
survives.

So this works on SEGMENTS instead of profiles:

  1. binarise the plan,
  2. morphologically open it with a long, thin horizontal kernel — and again with
     a vertical one. A wall is long AND thin, so it survives; furniture, hatching
     and text do not,
  3. take connected components of what survives; each is a wall run,
  4. merge runs that are collinear and close, recording the gap between them as a
     DOOR rather than deleting it,
  5. convert to metres with the scale established in SCENE-SPEC.

Output is metres, ready to paste into tools/data/qe-scenes.json as `interior`.

EVERY RESULT MUST BE EYEBALLED against the render before it ships. This is a
measurement aid, not an oracle — `--debug` writes an overlay image for exactly
that purpose.
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

import cv2
import numpy as np

PDF = Path(__file__).resolve().parents[2] / "Shadowrun 1e - Queen Euphoria {FASA7304}.pdf"


def render(page, dpi=150):
    with tempfile.TemporaryDirectory() as td:
        out = Path(td) / "p"
        subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(page), "-l", str(page),
                        "-png", str(PDF), str(out)], check=True, capture_output=True)
        png = next(Path(td).glob("p-*.png"))
        return cv2.imread(str(png), cv2.IMREAD_GRAYSCALE)


def segments(bw, horizontal, min_len_px, thick_min, thick_max):
    """Long runs along one axis, as (x1,y1,x2,y2) in plan pixels.

    Thickness is a BAND, not a ceiling. On these plans walls are drawn heavy and
    furniture is drawn light, so a thin long run is a counter or a bed edge, not
    a wall — the first version of this filter had the test inverted and returned
    almost nothing but furniture.
    """
    k = (min_len_px, 1) if horizontal else (1, min_len_px)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, k)
    opened = cv2.morphologyEx(bw, cv2.MORPH_OPEN, kernel)
    # Close small gaps ALONG the line only, so a dashed rule becomes one run while
    # a doorway (handled later, and much wider) stays a genuine break.
    opened = cv2.morphologyEx(opened, cv2.MORPH_CLOSE,
                              cv2.getStructuringElement(cv2.MORPH_RECT,
                                                        (5, 1) if horizontal else (1, 5)))
    n, _, stats, _ = cv2.connectedComponentsWithStats(opened, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        length, thick = (w, h) if horizontal else (h, w)
        if length < min_len_px or not (thick_min <= thick <= thick_max):
            continue
        if horizontal:
            out.append((x, y + h / 2, x + w, y + h / 2))
        else:
            out.append((x + w / 2, y, x + w / 2, y + h))
    return out


def merge_collinear(segs, horizontal, tol, max_gap):
    """Join runs on the same line, recording each closed gap as a door."""
    key = (lambda s: s[1]) if horizontal else (lambda s: s[0])
    lo = (lambda s: s[0]) if horizontal else (lambda s: s[1])
    hi = (lambda s: s[2]) if horizontal else (lambda s: s[3])
    lanes = {}
    for s in sorted(segs, key=key):
        for k in lanes:
            if abs(k - key(s)) <= tol:
                lanes[k].append(s)
                break
        else:
            lanes[key(s)] = [s]

    merged, doors = [], []
    for k, group in lanes.items():
        group.sort(key=lo)
        cur = list(group[0])
        for s in group[1:]:
            gap = lo(s) - hi(tuple(cur))
            if gap <= max_gap:
                if gap > 2:                     # a real opening, not anti-aliasing
                    a, b = hi(tuple(cur)), lo(s)
                    doors.append((a, k, b, k) if horizontal else (k, a, k, b))
                cur[2 if horizontal else 3] = hi(s)
            else:
                merged.append(tuple(cur)); cur = list(s)
        merged.append(tuple(cur))
    return merged, doors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", type=int, required=True, help="PDF page (folio + 2)")
    ap.add_argument("--crop", required=True, help="x0,y0,x1,y1 of the plan in the render")
    ap.add_argument("--scale", type=float, required=True, help="pixels per metre")
    ap.add_argument("--min-len", type=float, default=0.7, help="shortest wall, metres")
    ap.add_argument("--thick-min", type=float, default=0.045, help="thinnest wall, metres")
    ap.add_argument("--thick-max", type=float, default=0.16, help="thickest wall, metres")
    ap.add_argument("--max-door", type=float, default=2.0, help="widest doorway, metres")
    ap.add_argument("--name", default="")
    ap.add_argument("--debug", help="write an overlay PNG here")
    a = ap.parse_args()

    x0, y0, x1, y1 = (int(v) for v in a.crop.split(","))
    img = render(a.page)[y0:y1, x0:x1]
    bw = (img < 150).astype(np.uint8) * 255

    min_len = int(a.min_len * a.scale)
    thick_min = max(3, int(a.thick_min * a.scale))
    thick_max = max(thick_min + 2, int(a.thick_max * a.scale))
    max_gap = int(a.max_door * a.scale)

    walls, doors = [], []
    for horiz in (True, False):
        segs = segments(bw, horiz, min_len, thick_min, thick_max)
        m, d = merge_collinear(segs, horiz, tol=thick_max, max_gap=max_gap)
        walls += m
        doors += d

    to_m = lambda s: [round(v / a.scale, 2) for v in s]
    result = {
        "name": a.name, "page": a.page, "scalePxPerM": a.scale,
        "planMetres": [round((x1 - x0) / a.scale, 2), round((y1 - y0) / a.scale, 2)],
        "interior": [{"seg": to_m(w)} for w in walls],
        "doors": [{"seg": to_m(d), "door": "door"} for d in doors],
    }
    print(json.dumps(result, indent=2))
    print(f"\n# {len(walls)} wall segment(s), {len(doors)} doorway(s) — "
          f"VERIFY against the render before using", file=sys.stderr)

    if a.debug:
        vis = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        for (px, py, qx, qy) in walls:
            cv2.line(vis, (int(px), int(py)), (int(qx), int(qy)), (0, 0, 255), 3)
        for (px, py, qx, qy) in doors:
            cv2.line(vis, (int(px), int(py)), (int(qx), int(qy)), (0, 190, 0), 3)
        cv2.imwrite(a.debug, vis)
        print(f"# overlay → {a.debug} (red = wall, green = doorway)", file=sys.stderr)


if __name__ == "__main__":
    main()
