#!/usr/bin/env node
// Reject kaleidoscope tiles.
//
// The image generator's cheap route to "seamless" is to mirror one quadrant out
// to all four. That IS seamless, and it looks like a Rorschach test the moment
// it tiles: the mirror axes read as strong diagonal lattices across the floor.
// Every texture generated before 2026-09-13 was mirrored this way and it shipped
// unnoticed, so this check is now a build gate rather than an eyeball job.
import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = "assets/textures";
let bad = 0;
for (const f of readdirSync(DIR).filter(f => f.endsWith(".webp"))) {
  // Decode via python+PIL: node has no webp reader in core.
  const out = execFileSync("python3", ["-c", `
from PIL import Image
import numpy as np, sys
a = np.asarray(Image.open("${DIR}/${f}").convert("L"), dtype=float)
lr = np.abs(a - np.fliplr(a)).mean()
tb = np.abs(a - np.flipud(a)).mean()
print(f"{lr:.3f} {tb:.3f} {a.shape[1]}x{a.shape[0]}")
`]).toString().trim();
  const [lr, tb, size] = out.split(" ");
  const mirrored = Number(lr) < 2 || Number(tb) < 2;
  if (mirrored) bad++;
  console.log(`${mirrored ? "MIRRORED" : "ok      "} ${f.padEnd(22)} ${size}  lr ${lr}  tb ${tb}`);
}
if (bad) {
  console.error(`\n${bad} tile(s) are mirrored kaleidoscopes — they will lattice when tiled.`);
  process.exit(1);
}
console.log("\nall tiles carry independent content on both axes");
