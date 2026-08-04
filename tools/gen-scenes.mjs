// Generate the Queen Euphoria scenes into packs-src/qe-scenes.
//
// Dimensions come from tools/data/qe-scenes.json, where they are MEASURED off the
// printed floorplans (docs/SCENE-SPEC.md has the method). This file computes
// nothing about size except metres x 100 — the estate convention of 100 px/cell
// at 1 m.
//
// The previous version hardcoded `const W = 1600, H = 1200` for every scene
// regardless of what it depicted, which made Euphoria's 25 x 24 m condo smaller
// than her actual living room and quietly broke every range, movement and
// blast-radius judgement made on the map. It also listed six scenes when the
// adventure prints seven floorplans.
//
// Same two guarantees as gen-actors.mjs: ids are pinned, and generation is atomic.
import { writeFileSync, readdirSync, readFileSync, mkdirSync, rmSync, renameSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const DIR = "packs-src/qe-scenes";
const MANIFEST = "tools/data/qe-scenes.json";
const PX_PER_M = 100;            // estate convention: 100 px/cell, 1 m per cell

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
mkdirSync("assets/scenes", { recursive: true });

const safeName = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.1.0",
  createdTime: 1784000000000, modifiedTime: 1784000000000, lastModifiedBy: null,
  compendiumSource: null, duplicateSource: null, exportSource: null };

// Assign permanent ids to placeholders, then write them back so they are fixed
// from this moment on. Never derive an id from the name: renaming would then
// produce a different document that re-imports as a duplicate.
let assigned = 0;
for (const s of manifest.scenes) {
  if (s._id.startsWith("SCENE-")) { s._id = randomBytes(8).toString("hex"); assigned++; }
}
if (assigned) {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`assigned ${assigned} permanent scene id(s) — written back to ${MANIFEST}`);
}

const ids = manifest.scenes.map(s => s._id);
const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dupes.length) throw new Error(`Duplicate scene ids: ${dupes.join(", ")}`);

// ── Walls ───────────────────────────────────────────────────────────────────
// Wall coordinates are in scene pixels, so every metre figure here is x100 — the
// same measured dimensions the background uses, which is why the two can never
// drift apart.
//
// `interior` entries are optional per-scene room partitions, given in METRES as
// [x1,y1,x2,y2]. A scene with none still gets its perimeter, which is correct
// and useful on its own: it stops tokens walking off the map and, on the dark
// Hive level, stops vision leaking past the building envelope.
//
// door: "none" (default) solid | "door" a normal door | "secret".
// Set `breakable: true` for a wall the book says can be attacked through — the
// Hive's Lower Level walls are Barrier Rating 3 and the Soldiers are meant to
// come through them, so they are modelled as doors set to open rather than as
// impassable boundaries a GM would have to delete mid-fight.
function wall(x1, y1, x2, y2, opts = {}) {
  return {
    _id: null, c: [x1, y1, x2, y2],
    light: opts.sense ?? 20, sight: opts.sense ?? 20, sound: opts.sense ?? 20,
    move: opts.move ?? 20,
    door: opts.door === "secret" ? 2 : opts.door === "door" ? 1 : 0,
    ds: 0, doorSound: null, dir: 0, threshold: { light: null, sight: null, sound: null, attenuation: false },
    flags: opts.flags ?? {}
  };
}

// Rooms are authored, not traced. We keep what matters — the real scale and the
// printed room list and adjacencies — and draw our own layout inside it, which is
// both far more robust than extracting a scanned plan and squarely within the
// module's "no reproduced layout" rule.
//
// Everything below derives from the SAME room rectangles that draw the floor, so
// walls and art cannot drift apart.
const key = (a, b, c, d) => [a, b, c, d].map(v => Math.round(v * 100)).join(",");

/** Every room edge, deduplicated: a shared partition is emitted once, not twice. */
function roomEdges(rooms) {
  const seen = new Map();
  for (const r of rooms) {
    const { x, y, w, h } = r;
    const edges = [
      [x, y, x + w, y], [x + w, y, x + w, y + h],
      [x, y + h, x + w, y + h], [x, y, x, y + h]
    ];
    for (const e of edges) {
      const k = key(...e);
      if (!seen.has(k)) seen.set(k, e);
    }
  }
  return [...seen.values()];
}

/** Cut `door` out of any collinear wall it lies on, returning the leftovers. */
function punch(segs, doors) {
  let out = segs;
  for (const d of doors) {
    const [dx1, dy1, dx2, dy2] = d.seg;
    const next = [];
    for (const [x1, y1, x2, y2] of out) {
      const vert = Math.abs(x1 - x2) < 0.01 && Math.abs(dx1 - dx2) < 0.01 && Math.abs(x1 - dx1) < 0.06;
      const horiz = Math.abs(y1 - y2) < 0.01 && Math.abs(dy1 - dy2) < 0.01 && Math.abs(y1 - dy1) < 0.06;
      if (!vert && !horiz) { next.push([x1, y1, x2, y2]); continue; }
      const [a, b] = vert ? [Math.min(y1, y2), Math.max(y1, y2)] : [Math.min(x1, x2), Math.max(x1, x2)];
      const [c, e] = vert ? [Math.min(dy1, dy2), Math.max(dy1, dy2)] : [Math.min(dx1, dx2), Math.max(dx1, dx2)];
      if (e <= a || c >= b) { next.push([x1, y1, x2, y2]); continue; }   // no overlap
      if (c > a) next.push(vert ? [x1, a, x1, c] : [a, y1, c, y1]);
      if (e < b) next.push(vert ? [x1, e, x1, b] : [e, y1, b, y1]);
    }
    out = next;
  }
  return out;
}

/** The solid wall runs, in METRES, with doorways already cut out. */
function solidSegments(s) {
  const rooms = s.layout ?? [];
  const segs = rooms.length
    ? roomEdges(rooms)
    : [[0, 0, s.widthM, 0], [s.widthM, 0, s.widthM, s.heightM],
       [0, s.heightM, s.widthM, s.heightM], [0, 0, 0, s.heightM]];
  return punch(segs, s.doors ?? []);
}

function walls(s, W, H) {
  const M = PX_PER_M;
  const doors = s.doors ?? [];
  const segs = solidSegments(s);

  const out = segs.map(([x1, y1, x2, y2]) =>
    wall(x1 * M, y1 * M, x2 * M, y2 * M, {
      // A Barrier-3 partition should not behave like bedrock. The Hive's Soldiers
      // are meant to come through these, so they are flagged for the GM.
      flags: s.breakableInterior ? { "sr2e-queen-euphoria": { barrierRating: 3, breakable: true } } : {}
    }));

  for (const d of doors)
    out.push(wall(...d.seg.map(v => v * M), { door: d.secret ? "secret" : "door" }));

  return out;
}

function build(s) {
  const width  = s.widthM  * PX_PER_M;
  const height = s.heightM * PX_PER_M;
  const img = `modules/sr2e-queen-euphoria/assets/scenes/${s.art}`;

  const provenance = s.source === "printed"
    ? `<p><em>Layout derived from the printed floorplan on Queen Euphoria p.${s.folio}. ` +
      `Measured ${s.widthM} × ${s.heightM} m by ${s.measuredBy} — the map carries a ` +
      `"□ = 1 metre" legend, so the scale is the book's, not an estimate.</em></p>`
    : `<p><em><strong>GM-invented layout.</strong> The adventure plays scenes at this ` +
      `location but prints no floorplan for it, so nothing here carries the book's ` +
      `authority. Resize or replace freely.</em></p>`;

  return {
    _id: s._id, name: s.name,
    navigation: s.nav ?? true, navName: "", active: false,
    width, height, padding: 0.25, backgroundColor: "#15151f",
    background: { src: img, anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0,
      fit: "fill", scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff", alphaThreshold: 0 },
    foreground: null, foregroundElevation: null, thumb: null,
    // distance:1 units:"m" is what makes Foundry's ruler and the system's
    // in-combat movement limit agree with the book's metres.
    grid: { type: 1, size: PX_PER_M, style: "solidLines", thickness: 1,
      color: "#000000", alpha: 0.2, distance: 1, units: "m" },
    initial: null,
    // The Hive's Lower Level is printed as having neither light nor power, so it
    // is the one scene that gets real darkness rather than global light.
    tokenVision: !!s.dark,
    fog: { exploration: !!s.dark, reset: 0, overlay: null },
    globalLight: { enabled: !s.dark },
    darkness: s.dark ? 1 : 0,
    environment: {},
    drawings: [], tokens: [], lights: [], notes: [], sounds: [], regions: [],
    templates: [], tiles: [], walls: walls(s, width, height),
    folder: null, sort: 0,
    flags: { "sr2e-queen-euphoria": {
      source: s.source, folio: s.folio ?? null,
      metres: { w: s.widthM, h: s.heightM },
      measuredBy: s.measuredBy ?? "", rooms: s.rooms ?? "" } },
    _stats: STATS, ownership: { default: 0 },
    _key: `!scenes!${s._id}`,
    description: `${s.notes ?? ""}<p><strong>Rooms:</strong> ${s.rooms ?? "—"}</p>${provenance}`
  };
}

// ── Backgrounds ─────────────────────────────────────────────────────────────
// Rendered procedurally as SVG, not generated as AI art. For a BATTLE map that
// is the correct call: rooms have to land on the 1 m grid, and a diffusion model
// cannot be made to put a wall exactly on a cell boundary. This produces exact
// dimensions, exact grid alignment, and a deterministic re-runnable result.
//
// It is also original artwork rather than a reproduction of the printed plan,
// which the module's copyright stance requires.
function background(s) {
  const M = PX_PER_M;
  const W = s.widthM * M, H = s.heightM * M;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const dark = !!s.dark;
  const rooms = s.layout ?? [];
  const voidFill = dark ? "#0a0908" : "#101018";
  const ink = dark ? "#8d7355" : "#9aa0c0";
  const accent = dark ? "#c2843c" : "#7fb0d8";

  // Deterministic per-position jitter, so decals never land in the same place
  // twice but never move between runs either.
  const hash = (a, b) => { let h = (a * 73856093) ^ (b * 19349663); h = (h ^ (h >>> 13)) >>> 0; return h / 4294967296; };

  // ── material tiles ────────────────────────────────────────────────────────
  // One <pattern> per material actually used. 400px = 4m, the scale the tiles
  // were generated for.
  const TILE = 400;
  const mats = [...new Set(rooms.map(r => r.material).filter(Boolean))];
  const defs = mats.map(m =>
    `<pattern id="m-${m}" patternUnits="userSpaceOnUse" width="${TILE}" height="${TILE}">
       <image href="assets/textures/${m}.webp" x="0" y="0" width="${TILE}" height="${TILE}"
              preserveAspectRatio="none"/>
     </pattern>`).join("");

  // ── floors ────────────────────────────────────────────────────────────────
  let floors = "", decals = "";
  for (const r of rooms) {
    const x = r.x * M, y = r.y * M, w = r.w * M, h = r.h * M;
    floors += r.material
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#m-${r.material})"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d1d27"/>`;
    // Boundary-safe wear: soft blobs at a frequency unrelated to the tile pitch,
    // which is what breaks up the repeat without needing edge-matched variants.
    // Small and many, not few and huge. The first pass used a 0.5-1.9 m radius,
    // which drew stains up to 4 m across — they read as craters, not wear, and
    // they fought the texture instead of breaking up its repeat.
    const n = Math.max(6, Math.round(r.w * r.h * 1.6));
    for (let k = 0; k < n; k++) {
      const u = hash(Math.round(x + k * 31), Math.round(y + k * 57));
      const v = hash(Math.round(y + k * 13), Math.round(x + k * 91));
      const t = hash(k * 7919, Math.round(x + y));
      const rad = (0.06 + u * 0.28) * M;
      decals += `<ellipse cx="${(x + u * w).toFixed(1)}" cy="${(y + v * h).toFixed(1)}"
                   rx="${rad.toFixed(1)}" ry="${(rad * (0.55 + v * 0.7)).toFixed(1)}"
                   fill="#000" opacity="${(0.03 + t * 0.07).toFixed(3)}"/>`;
    }
  }

  // ── props ─────────────────────────────────────────────────────────────────
  // Top-down sprites, positioned and sized in METRES. With room labels gone,
  // these are what tells a player which room they are standing in — a bed means
  // bedroom, a toilet means bathroom. Decoration only: nothing mechanical reads
  // them and they never define geometry.
  let props = "";
  for (const r of rooms) {
    for (const [kind, px, py, pw, ph] of (r.props ?? [])) {
      // px,py is the prop's CENTRE in metres. Assert it stays inside its room:
      // the first pass put bed centres a bed-length from the room's top edge, so
      // both beds rendered outside the flat entirely and nothing complained.
      const tol = 0.05;
      if (px - pw/2 < r.x - tol || px + pw/2 > r.x + r.w + tol ||
          py - ph/2 < r.y - tol || py + ph/2 > r.y + r.h + tol)
        throw new Error(`${s.name}: prop "${kind}" at (${px},${py}) ${pw}x${ph} m ` +
          `escapes room "${r.name}" (${r.x},${r.y} ${r.w}x${r.h})`);
      const w2 = pw * M, h2 = ph * M, x2 = px * M - w2 / 2, y2 = py * M - h2 / 2;
      props += `<image href="assets/props/${kind}.webp" x="${x2.toFixed(1)}" y="${y2.toFixed(1)}"
                  width="${w2.toFixed(1)}" height="${h2.toFixed(1)}"
                  preserveAspectRatio="none"/>`;
    }
  }

  // ── grid ──────────────────────────────────────────────────────────────────
  let g = "";
  for (let x = M; x < W; x += M) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = M; y < H; y += M) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;

  // ── walls, from the SOLID segments only ───────────────────────────────────
  // walls() also returns door Wall documents; stroking those would paint a solid
  // wall straight through every doorway.
  const TH = 16;
  let wsvg = "";
  for (const [x1, y1, x2, y2] of solidSegments(s)) {
    const a = [x1 * M, y1 * M, x2 * M, y2 * M];
    wsvg += `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}"
               stroke="#0c0c11" stroke-width="${TH}" stroke-linecap="square"/>`
          + `<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}"
               stroke="#4a4a5e" stroke-width="${TH * 0.35}" stroke-linecap="square" opacity="0.85"/>`;
  }

  // ── doors: state-neutral ──────────────────────────────────────────────────
  // Jambs and a threshold only. The background is static and Foundry creates
  // doors closed, so drawing an open leaf would permanently contradict the
  // actual door state and its line of sight.
  let dsvg = "";
  for (const d of s.doors ?? []) {
    const [x1, y1, x2, y2] = d.seg.map(v => v * M);
    const vert = Math.abs(x1 - x2) < 1;
    const jamb = TH * 1.1;
    dsvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#171720" stroke-width="${TH}"/>`;
    dsvg += vert
      ? `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1 + jamb*0.5}" stroke="#0c0c11" stroke-width="${TH}"/>
         <line x1="${x1}" y1="${y2}" x2="${x1}" y2="${y2 - jamb*0.5}" stroke="#0c0c11" stroke-width="${TH}"/>`
      : `<line x1="${x1}" y1="${y1}" x2="${x1 + jamb*0.5}" y2="${y1}" stroke="#0c0c11" stroke-width="${TH}"/>
         <line x1="${x2}" y1="${y1}" x2="${x2 - jamb*0.5}" y2="${y1}" stroke="#0c0c11" stroke-width="${TH}"/>`;
    dsvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}"
               stroke-width="3" opacity="0.5" stroke-dasharray="10 8"/>`;
  }

  const tag = s.source === "printed"
    ? `p.${s.folio} · ${s.widthM} × ${s.heightM} m`
    : `${s.widthM} × ${s.heightM} m · GM-invented layout`;

  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${dark ? 0.85 : 0.5}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${voidFill}"/>
  ${floors}
  <g filter="url(#soft)">${decals}</g>
  <rect width="${W}" height="${H}" fill="#0b0b12" opacity="${dark ? 0.5 : 0.28}"/>
  <g stroke="#000" stroke-width="1.5" opacity="0.3">${g}</g>
  ${props}
  ${wsvg}
  ${dsvg}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  ${dark ? `<rect width="${W}" height="${H}" fill="#000" opacity="0.45"/>` : ""}
  <text x="${W/2}" y="${H - 18}" fill="${ink}" font-family="Helvetica,Arial,sans-serif"
        font-size="20" text-anchor="middle" opacity="0.5">${esc(tag)} · 1 square = 1 metre</text>
</svg>`;

  // rsvg-convert must read from a FILE inside the repo, not stdin: piped SVG has
  // no base URI, so relative <image href> silently renders empty under librsvg.
  const tmp = `.scene-${process.pid}.svg`;
  writeFileSync(tmp, svg);
  try {
    const png = execFileSync("rsvg-convert",
      ["-f", "png", "-w", String(W), "-h", String(H), tmp], { maxBuffer: 1 << 29 });
    execFileSync("magick", ["png:-", "-quality", "86", `assets/scenes/${s.art}`],
      { input: png, maxBuffer: 1 << 29 });
  } finally { rmSync(tmp, { force: true }); }
}

for (const s of manifest.scenes) background(s);

const TMP = `${DIR}.tmp-${process.pid}`;
const BAK = `${DIR}.bak-${process.pid}`;
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

try {
  const expected = new Set();
  for (const s of manifest.scenes) {
    const doc = build(s);
    const file = `${safeName(s.name)}_${doc._id}.json`;
    expected.add(file);
    writeFileSync(`${TMP}/${file}`, JSON.stringify(doc, null, 2) + "\n");
  }
  const written = new Set(readdirSync(TMP));
  if (written.size !== manifest.scenes.length)
    throw new Error(`Wrote ${written.size} files for ${manifest.scenes.length} scenes`);
  for (const f of written) if (!expected.has(f)) throw new Error(`Unexpected file ${f}`);

  if (existsSync(DIR)) renameSync(DIR, BAK);
  try { renameSync(TMP, DIR); }
  catch (err) { if (existsSync(BAK)) renameSync(BAK, DIR); throw err; }
  rmSync(BAK, { recursive: true, force: true });
} catch (err) {
  rmSync(TMP, { recursive: true, force: true });
  if (existsSync(BAK) && !existsSync(DIR)) renameSync(BAK, DIR);
  throw err;
}

const printed = manifest.scenes.filter(s => s.source === "printed").length;
console.log(`wrote ${manifest.scenes.length} scene(s): ${printed} from printed floorplans, ` +
  `${manifest.scenes.length - printed} GM-invented`);
for (const s of manifest.scenes)
  console.log(`  ${s.name.padEnd(34)} ${String(s.widthM).padStart(2)} x ${String(s.heightM).padStart(2)} m` +
    ` -> ${s.widthM * PX_PER_M} x ${s.heightM * PX_PER_M}${s.dark ? "  [dark]" : ""}`);
