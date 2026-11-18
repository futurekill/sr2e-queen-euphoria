// The Act 2 newscast (docs/newscast-second-disappearance.md): speech (eleven_v4) and SFX (eleven_text_to_sound_v3)
// into _work/newscast/raw/ (git-ignored). Then: python3 tools/newscast/mix.py. Key: ELEVENLABS_API_KEY.
// Generates the newscast's speech (eleven_v4) and SFX (eleven_text_to_sound_v3) into raw/. Sequential (3-request limit).
// The key comes from the environment (ELEVENLABS_API_KEY); it is never printed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const KEY = process.env.ELEVENLABS_API_KEY, here = new URL(".", import.meta.url).pathname, dir = new URL("../../_work/newscast/", import.meta.url).pathname;
const d = JSON.parse(readFileSync(here + "newscast.json", "utf8"));
mkdirSync(dir + "raw", { recursive: true });
async function get(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}
for (const s of d.speech) {
  const out = `${dir}raw/${s.id}.mp3`; if (existsSync(out)) continue;
  const id = d.voices[s.voice]; if (!id) throw new Error(`no voice chosen for ${s.voice}`);
  writeFileSync(out, await get(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_192`, { text: s.text, model_id: "eleven_v4" }));
  console.log("speech", s.id);
}
for (const s of d.sfx) {
  const out = `${dir}raw/${s.id}.mp3`; if (existsSync(out)) continue;
  writeFileSync(out, await get("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192", { text: s.text, duration_seconds: s.seconds, model_id: "eleven_text_to_sound_v3" }));
  console.log("sfx", s.id);
}
