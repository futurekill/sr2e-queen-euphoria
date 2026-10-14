#!/usr/bin/env node
/**
 * Soundboard audio (tools/data/qe-audio.json) → assets/audio/<id>.mp3 and the
 * Soundboard pack (packs-src/qe-audio). Speech and sound effects come from the
 * ElevenLabs API (ELEVENLABS_API_KEY in the environment). Existing files are kept,
 * so a re-run only fills in what's missing; a clip whose voice has no id is skipped.
 * `loop: true` on a clip makes it repeat until stopped (ambience).
 *
 *   node tools/gen-audio.mjs            # generate missing clips, write the pack
 *   node tools/gen-audio.mjs --pack     # write the pack only, no API calls
 * Then: npm run build-packs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODULE = "modules/sr2e-queen-euphoria";
const AUDIO = "assets/audio", PACK = path.join(ROOT, "packs-src/qe-audio");
const data = JSON.parse(readFileSync(path.join(ROOT, "tools/data/qe-audio.json"), "utf8"));
const packOnly = process.argv.includes("--pack");
const KEY = process.env.ELEVENLABS_API_KEY;
const id16 = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);
const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.103.1" };

async function generate(clip) {
  const isSfx = !!clip.sfx;
  const url = isSfx ? "https://api.elevenlabs.io/v1/sound-generation"
    : `https://api.elevenlabs.io/v1/text-to-speech/${data.voices[clip.voice].id}?output_format=mp3_44100_128`;
  const body = isSfx ? { text: clip.sfx, duration_seconds: clip.seconds ?? null }
    : { text: clip.text, model_id: "eleven_multilingual_v2" };
  const res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${clip.id}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

mkdirSync(path.join(ROOT, AUDIO), { recursive: true });
let made = 0, skipped = [];
if (!packOnly) {
  if (!KEY) { console.error("ELEVENLABS_API_KEY is not set (or use --pack)."); process.exit(1); }
  for (const pl of data.playlists) for (const clip of pl.clips) {
    const file = path.join(ROOT, AUDIO, `${clip.id}.mp3`);
    if (existsSync(file)) continue;
    if (!clip.sfx && !data.voices[clip.voice]?.id) { skipped.push(clip.id); continue; }
    writeFileSync(file, await generate(clip));
    made++; console.log(`  + ${clip.id}`);
  }
}

// The pack: one Soundboard-Only playlist per entry, only clips whose file exists.
rmSync(PACK, { recursive: true, force: true }); mkdirSync(PACK, { recursive: true });
data.playlists.forEach((pl, n) => {
  const _id = id16(`playlist:${pl.name}`);
  const sounds = pl.clips.filter(c => existsSync(path.join(ROOT, AUDIO, `${c.id}.mp3`))).map((c, i) => ({
    _id: id16(`sound:${c.id}`), name: c.label, path: `${MODULE}/${AUDIO}/${c.id}.mp3`,
    description: c.text ?? "", repeat: !!c.loop, volume: 0.8, fade: null, sort: (i + 1) * 100000,
    channel: "", playing: false, pausedTime: null, flags: {}, _stats: STATS
  }));
  const doc = { _id, name: pl.name, description: "Click a sound to play it for everyone.", mode: -1,
    channel: "music", playing: false, fade: null, folder: null, sorting: "m", seed: null,
    sort: n * 100000, sounds, ownership: { default: 0 }, flags: {}, _stats: STATS,
    _key: `!playlists!${_id}` };
  writeFileSync(path.join(PACK, `${pl.name.replace(/[^A-Za-z0-9]+/g, "_")}_${_id}.json`), JSON.stringify(doc, null, 2) + "\n");
});
console.log(`${made} clip(s) generated${skipped.length ? `; waiting on a voice id: ${skipped.join(", ")}` : ""}. Pack written.`);
