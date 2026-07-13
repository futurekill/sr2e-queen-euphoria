// Generate placeholder Scenes for Queen Euphoria. Each ships a labeled
// placeholder background (assets/scenes/*.png) — swap the image for a final map
// later; the Scene keeps its grid/size. Re-run to regenerate. Mirrors DE.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const idFor = (s) => createHash("sha1").update("qe-scene:" + s).digest("hex").slice(0, 16);
const W = 1600, H = 1200, GRID = 100;
mkdirSync("assets/scenes", { recursive: true });

// The adventure's mapped locations (SOURCE-INVENTORY.md) — plain labelled
// placeholders; real map art is Phase 2.
const SCENES = [
  "Euphoria's Penthouse",
  "Pacific Towers",
  "MegaMedia Office",
  "Magic Crafts Shop",
  "MegaMedia Studio",
  "The Hive"
];

function placeholderPng(name, file) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let lines = "";
  for (let x = 0; x <= W; x += GRID) lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#2a2a3a" stroke-width="1"/>`;
  for (let y = 0; y <= H; y += GRID) lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#2a2a3a" stroke-width="1"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#15151f"/>${lines}
    <text x="${W/2}" y="${H/2 - 20}" fill="#e0d4f0" font-family="sans-serif" font-size="54" font-weight="bold" text-anchor="middle">${esc(name)}</text>
    <text x="${W/2}" y="${H/2 + 40}" fill="#8a7fb0" font-family="sans-serif" font-size="26" text-anchor="middle">placeholder map — replace with final art</text>
  </svg>`;
  writeFileSync("/tmp/qe-scene.svg", svg);
  execFileSync("rsvg-convert", ["-o", file, "/tmp/qe-scene.svg"]);
}

const safeName = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");

let n = 0;
for (const name of SCENES) {
  const _id = idFor(name);
  const safe = safeName(name);
  const img = `modules/sr2e-queen-euphoria/assets/scenes/${safe}.png`;
  placeholderPng(name, `assets/scenes/${safe}.png`);
  const doc = {
    _id, name, navigation: true, navName: "", active: false,
    width: W, height: H, padding: 0.25, backgroundColor: "#15151f",
    background: { src: img, anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0, fit: "fill", scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff", alphaThreshold: 0 },
    foreground: null, foregroundElevation: null, thumb: null,
    grid: { type: 1, size: GRID, style: "solidLines", thickness: 1, color: "#000000", alpha: 0.2, distance: 1, units: "m" },
    initial: null, tokenVision: false, fog: { exploration: false, reset: 0, overlay: null },
    globalLight: { enabled: true }, darkness: 0, environment: {},
    drawings: [], tokens: [], lights: [], notes: [], sounds: [], regions: [], templates: [], tiles: [], walls: [],
    folder: null, sort: 0, flags: {},
    _stats: { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.1.0", createdTime: 1784000000000, modifiedTime: 1784000000000, lastModifiedBy: null, compendiumSource: null, duplicateSource: null, exportSource: null },
    ownership: { default: 0 }, _key: `!scenes!${_id}`
  };
  writeFileSync(`packs-src/qe-scenes/${safe}_${_id}.json`, JSON.stringify(doc, null, 2) + "\n");
  n++;
}
console.log(`wrote ${n} placeholder scenes`);
