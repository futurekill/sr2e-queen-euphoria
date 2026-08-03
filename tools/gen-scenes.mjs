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

function walls(s, W, H) {
  const M = PX_PER_M;
  const out = [
    wall(0, 0, W, 0), wall(W, 0, W, H), wall(W, H, 0, H), wall(0, H, 0, 0)
  ];
  for (const r of s.interior ?? []) {
    const [x1, y1, x2, y2] = r.seg.map(v => v * M);
    out.push(wall(x1, y1, x2, y2, {
      door: r.door,
      // A Barrier-3 partition should not behave like bedrock. Flagged so the GM
      // can see which walls the book explicitly says are breakable.
      flags: r.breakable ? { "sr2e-queen-euphoria": { barrierRating: r.barrier ?? 3, breakable: true } } : {}
    }));
  }
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
  const W = s.widthM * PX_PER_M, H = s.heightM * PX_PER_M;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const dark = !!s.dark;
  const floor  = dark ? "#14110f" : "#1b1b24";
  const panel  = dark ? "#1c1815" : "#232331";
  const line   = dark ? "#2b241d" : "#33334a";
  const ink    = dark ? "#8d7355" : "#9aa0c0";
  const accent = dark ? "#c2843c" : "#7fb0d8";

  let g = "";
  for (let x = PX_PER_M; x < W; x += PX_PER_M)
    g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${line}" stroke-width="1"/>`;
  for (let y = PX_PER_M; y < H; y += PX_PER_M)
    g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${line}" stroke-width="1"/>`;
  // every 5 m, a heavier rule so distance is countable at a glance
  for (let x = 5 * PX_PER_M; x < W; x += 5 * PX_PER_M)
    g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${line}" stroke-width="3"/>`;
  for (let y = 5 * PX_PER_M; y < H; y += 5 * PX_PER_M)
    g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${line}" stroke-width="3"/>`;

  const fs = Math.max(28, Math.min(64, Math.round(Math.min(W, H) / 9)));
  const sub = Math.round(fs * 0.42);
  const tag = s.source === "printed"
    ? `p.${s.folio} · ${s.widthM} × ${s.heightM} m · measured`
    : `${s.widthM} × ${s.heightM} m · GM-invented layout, no printed floorplan`;

  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${floor}"/>
  ${g}
  <rect x="12" y="12" width="${W-24}" height="${H-24}" fill="none" stroke="${panel}" stroke-width="8"/>
  <text x="${W/2}" y="${H/2 - sub}" fill="${ink}" font-family="Helvetica,Arial,sans-serif"
        font-size="${fs}" font-weight="bold" text-anchor="middle">${esc(s.name)}</text>
  <text x="${W/2}" y="${H/2 + sub}" fill="${accent}" font-family="Helvetica,Arial,sans-serif"
        font-size="${sub}" text-anchor="middle">${esc(tag)}</text>
  <text x="${W/2}" y="${H - 26}" fill="${ink}" font-family="Helvetica,Arial,sans-serif"
        font-size="${Math.round(sub*0.8)}" text-anchor="middle" opacity="0.65">1 square = 1 metre</text>
</svg>`;

  // rsvg-convert (librsvg), not ImageMagick's built-in SVG reader: the latter has
  // no fontconfig and dies with "unable to read font `'" on any <text> element.
  const out = `assets/scenes/${s.art}`;
  const png = execFileSync("rsvg-convert", ["-f", "png", "-w", String(W), "-h", String(H)],
    { input: svg, maxBuffer: 1 << 28 });
  execFileSync("magick", ["png:-", "-quality", "88", out], { input: png, maxBuffer: 1 << 28 });
  return out;
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
