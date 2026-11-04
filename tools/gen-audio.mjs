#!/usr/bin/env node
/**
 * Soundboard audio (tools/data/qe-audio.json) → assets/audio/<id>.mp3 and the
 * Soundboard pack (packs-src/qe-audio). Speech and sound effects come from the
 * ElevenLabs API (ELEVENLABS_API_KEY in the environment). Existing files are kept,
 * so a re-run only fills in what's missing; a clip whose voice has no id is skipped.
 * `loop: true` on a clip makes it repeat until stopped (ambience); `radio: true` passes a
 * speech clip through a radio filter (ffmpeg on the PATH) after it's generated.
 *
 *   node tools/gen-audio.mjs            # generate missing clips, write the pack
 *   node tools/gen-audio.mjs --pack     # write the pack only, no API calls
 *   node tools/gen-audio.mjs --verify   # transcribe every speech clip and flag any
 *                                       # whose words don't match its script
 * Then: npm run build-packs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, renameSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODULE = "modules/sr2e-queen-euphoria";
const AUDIO = "assets/audio", PACK = path.join(ROOT, "packs-src/qe-audio");
const DATA_FILE = path.join(ROOT, "tools/data/qe-audio.json");
const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
const packOnly = process.argv.includes("--pack") || process.argv.includes("--verify");   // --verify generates nothing
const KEY = process.env.ELEVENLABS_API_KEY;
const id16 = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);
const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.103.1" };

async function generate(clip) {
  const isSfx = !!clip.sfx;
  const url = isSfx ? "https://api.elevenlabs.io/v1/sound-generation"
    : `https://api.elevenlabs.io/v1/text-to-speech/${data.voices[clip.voice].id}?output_format=mp3_44100_128`;
  const body = isSfx ? { text: clip.sfx, duration_seconds: clip.seconds ?? null, model_id: "eleven_text_to_sound_v3" }
    : { text: clip.text, model_id: clip.model ?? "eleven_v4" };   // v4 performs [audio tags] like [whispers]
  const res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${clip.id}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

// A handheld radio: telephone band, a little drive, squashed dynamics.
function radioize(file) {
  const tmp = `${file}.radio.mp3`;
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", file, "-af",
    "highpass=f=400,lowpass=f=3000,acompressor=threshold=-20dB:ratio=6,volume=2,alimiter=limit=0.9,loudnorm=I=-16:TP=-1.5",
    "-ar", "44100", "-ac", "1", "-b:a", "128k", tmp]);
  renameSync(tmp, file);
}

/**
 * Sound-effect loudness: ElevenLabs' SFX models differ in level (v3 comes out 10–20 dB quieter than v2), so a clip
 * with `lufs` in the data is levelled to it as it's generated: the soundboard mix stays as authored. The integrated
 * loudness is measured (EBU R128), the exact gain applied, and peaks capped. `--record-lufs` writes each existing
 * effect's current loudness into the data file (run it once before regenerating).
 */
function lufsOf(file) {
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-nostdin", "-i", file, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
  return parseFloat([...stderr.matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].at(-1)?.[1]);
}
function level(file, target) {
  const measured = lufsOf(file);
  if (!Number.isFinite(measured)) return;
  const tmp = file.replace(/\.mp3$/, ".level.mp3");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", file,
    "-af", `volume=${(target - measured).toFixed(2)}dB,alimiter=limit=0.89:level=false`, "-b:a", "128k", tmp]);
  renameSync(tmp, file);
}
if (process.argv.includes("--record-lufs")) {
  let n = 0;
  for (const pl of data.playlists) for (const clip of pl.clips) {
    const file = path.join(ROOT, AUDIO, `${clip.id}.mp3`);
    if (!clip.sfx || !existsSync(file)) continue;
    const l = lufsOf(file);
    if (Number.isFinite(l)) { clip.lufs = Math.round(l * 10) / 10; n++; }
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
  console.log(`Recorded the loudness of ${n} sound effect(s).`);
  process.exit(0);
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
    if (clip.sfx && Number.isFinite(clip.lufs)) level(file, clip.lufs);
    if (clip.radio) radioize(file);
    made++; console.log(`  + ${clip.id}`);
  }
}

// --verify: what was actually said, against the script ([tags] and punctuation ignored).
const words = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\[[^\]]*\]/g, " ").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
async function verify() {
  let checked = 0, flagged = 0;
  for (const pl of data.playlists) for (const clip of pl.clips) {
    const file = path.join(ROOT, AUDIO, `${clip.id}.mp3`);
    if (!clip.text || !existsSync(file)) continue;
    const form = new FormData();
    form.append("model_id", "scribe_v1");
    form.append("file", new Blob([readFileSync(file)]), `${clip.id}.mp3`);
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: form });
    if (!res.ok) throw new Error(`${clip.id}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const heard = words((await res.json()).text ?? ""), want = words(clip.text);
    const hit = want.filter(w => heard.includes(w)).length / Math.max(want.length, 1);
    checked++;
    // shortcut: bag-of-words overlap, so spelling variants ("Lonestar") still flag; read the diff
    if (hit < 0.9) { flagged++; console.log(`  ? ${clip.id} (${Math.round(hit * 100)}%)\n      script: ${want.join(" ")}\n      heard:  ${heard.join(" ")}`); }
  }
  console.log(`${checked} clip(s) checked, ${flagged} to listen to.`);
}
if (process.argv.includes("--verify")) {
  if (!KEY) { console.error("ELEVENLABS_API_KEY is not set."); process.exit(1); }
  await verify(); process.exit(0);
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
    // Environment, not Music: players who turn the score down must still hear the dialogue and SFX.
    channel: "environment", playing: false, fade: null, folder: null, sorting: "m", seed: null,
    sort: n * 100000, sounds, ownership: { default: 0 }, flags: {}, _stats: STATS,
    _key: `!playlists!${_id}` };
  writeFileSync(path.join(PACK, `${pl.name.replace(/[^A-Za-z0-9]+/g, "_")}_${_id}.json`), JSON.stringify(doc, null, 2) + "\n");
});
console.log(`${made} clip(s) generated${skipped.length ? `; waiting on a voice id: ${skipped.join(", ")}` : ""}. Pack written.`);
