#!/usr/bin/env node
/**
 * Convert the delivered handout art into module assets.
 *
 *   npm run handouts
 *
 * Sources live in _work/incoming (gitignored — the originals are never
 * committed and never modified). Outputs are WebP in assets/handouts, capped
 * at 1920px on the long edge: these are viewed in Foundry's image lightbox,
 * not printed, and the PNGs average 2MB apiece.
 *
 * The manifest (tools/data/qe-handouts.json) is the single source of truth for
 * which file is which — it also drives the journal pages in gen-journals.mjs,
 * so a file cannot appear in the journal without existing here.
 */
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const SRC_DIR = "_work/incoming";
const OUT_DIR = "assets/handouts";
const MAX_EDGE = 1920;

const { handouts } = JSON.parse(readFileSync("tools/data/qe-handouts.json", "utf8"));
mkdirSync(OUT_DIR, { recursive: true });

const missing = handouts.filter(h => !existsSync(join(SRC_DIR, h.src)));
if (missing.length) {
  console.error(`Missing ${missing.length} source image(s) under ${SRC_DIR}:`);
  for (const m of missing) console.error(`  - ${m.src}`);
  process.exit(1);
}

let totalIn = 0, totalOut = 0;
for (const h of handouts) {
  const src = join(SRC_DIR, h.src);
  const out = join(OUT_DIR, h.out);
  execFileSync("magick", [
    src, "-resize", `${MAX_EDGE}x${MAX_EDGE}>`, "-quality", "82", "-strip", out
  ]);
  const i = statSync(src).size, o = statSync(out).size;
  totalIn += i; totalOut += o;
  const dim = execFileSync("magick", ["identify", "-format", "%wx%h", out]).toString();
  console.log(`  ${h.out.padEnd(38)} ${dim.padEnd(10)} ${(o / 1024).toFixed(0)}KB`);
}
// Cast portraits cropped out of the scene art (square, 1024, per the module's
// portrait convention) so the faces match the places they appear in.
const { portraits = [] } = JSON.parse(readFileSync("tools/data/qe-handouts.json", "utf8"));
if (portraits.length) {
  mkdirSync("assets/portraits", { recursive: true });
  console.log("");
  for (const p of portraits) {
    const src = join(SRC_DIR, p.src);
    if (!existsSync(src)) { console.error(`  MISSING source for ${p.out}: ${p.src}`); process.exit(1); }
    const out = join("assets/portraits", p.out);
    execFileSync("magick", [
      src, "-crop", p.crop, "+repage", "-resize", "1024x1024!",
      "-unsharp", "0x0.75+0.6+0.02", "-quality", "88", "-strip", out
    ]);
    console.log(`  portrait ${p.out.padEnd(28)} ${(statSync(out).size / 1024).toFixed(0)}KB  (${p.name})`);
  }
}

const mb = n => (n / 1024 / 1024).toFixed(1);
console.log(`\n${handouts.length} handouts: ${mb(totalIn)}MB PNG -> ${mb(totalOut)}MB WebP`);
