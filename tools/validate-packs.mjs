// Pre-flight validator for the Double Exposure packs (QA-PLAN §0). Runs with no
// Foundry: checks every packs-src/*/*.json document for valid JSON, required
// keys, correct _key form, and duplicate _ids; reports per-pack counts. Exits
// non-zero if anything fails. Run: `node tools/validate-packs.mjs`.
//
// Unlike the Item-only content modules, DE ships several document types, so the
// collection is mapped per pack and type/system are only required for the doc
// types that actually have them (Actors and Items).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "packs-src";
// pack name -> Foundry collection (the !collection! prefix in _key)
const COLLECTION = {
  "qe-actors": "actors",
  "qe-journals": "journal",
  "qe-scenes": "scenes",
  "queen-euphoria": "adventures"
};
const HAS_TYPE_SYSTEM = new Set(["actors", "items"]); // only these carry type+system
let problems = 0;
const note = (m) => { console.error("  ✗ " + m); problems++; };

let packs;
try { packs = readdirSync(ROOT).filter((p) => statSync(join(ROOT, p)).isDirectory()); }
catch { console.error(`no ${ROOT}/ directory`); process.exit(1); }

for (const pack of packs.sort()) {
  const dir = join(ROOT, pack);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const ids = new Map();
  const collection = COLLECTION[pack];
  if (!collection) { note(`${pack}: unknown pack (add it to COLLECTION)`); continue; }
  console.log(`\n${pack}  (${files.length} docs, expecting !${collection}!…)`);

  for (const f of files) {
    const path = join(dir, f);
    let doc;
    try { doc = JSON.parse(readFileSync(path, "utf8")); }
    catch (e) { note(`${f}: invalid JSON — ${e.message}`); continue; }

    const required = ["_id", "_key", "name"];
    if (HAS_TYPE_SYSTEM.has(collection)) required.push("type", "system");
    for (const k of required) {
      if (doc[k] === undefined) note(`${f}: missing "${k}"`);
    }
    if (doc._id && doc._key && doc._key !== `!${collection}!${doc._id}`) {
      note(`${f}: _key "${doc._key}" should be "!${collection}!${doc._id}"`);
    }
    if (doc._id) {
      if (ids.has(doc._id)) note(`${f}: duplicate _id with ${ids.get(doc._id)}`);
      else ids.set(doc._id, f);
    }
    if (doc.system !== undefined && typeof doc.system !== "object") note(`${f}: system is not an object`);
  }
}

if (problems) { console.error(`\n${problems} problem(s) found.`); process.exit(1); }
console.log("\nAll packs valid.");
