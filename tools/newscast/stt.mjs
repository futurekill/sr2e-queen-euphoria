import { readFileSync } from "node:fs";
const KEY = process.env.ELEVENLABS_API_KEY;
for (const id of process.argv.slice(2)) {
  const form = new FormData();
  form.append("file", new Blob([readFileSync(new URL(`../../_work/newscast/raw/${id}.mp3`, import.meta.url))]), `${id}.mp3`);
  form.append("model_id", "scribe_v1");
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": KEY }, body: form });
  const j = await res.json();
  console.log(`== ${id}\n${j.text ?? JSON.stringify(j).slice(0, 200)}\n`);
}
