// Generates the Private Screening's speech (eleven_v4) and SFX (eleven_text_to_sound_v3) into
// _work/private-screening/raw/. Sequential (3-request limit). The key comes from ELEVENLABS_API_KEY; never printed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const KEY = process.env.ELEVENLABS_API_KEY, here = new URL(".", import.meta.url).pathname;
const d = JSON.parse(readFileSync(here + "screening.json", "utf8")), raw = here + "../../_work/private-screening/raw/";
if (!KEY) throw new Error("ELEVENLABS_API_KEY is not set");
mkdirSync(raw, { recursive: true });
async function get(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}
for (const s of d.speech) {
  const out = `${raw}${s.id}.mp3`; if (existsSync(out)) continue;
  writeFileSync(out, await get(`https://api.elevenlabs.io/v1/text-to-speech/${d.voices[s.voice]}?output_format=mp3_44100_192`, { text: s.text, model_id: "eleven_v4" }));
  console.log("speech", s.id);
}
for (const s of d.sfx) {
  const out = `${raw}${s.id}.mp3`; if (existsSync(out)) continue;
  writeFileSync(out, await get("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192", { text: s.text, duration_seconds: s.seconds, model_id: "eleven_text_to_sound_v3" }));
  console.log("sfx", s.id);
}
