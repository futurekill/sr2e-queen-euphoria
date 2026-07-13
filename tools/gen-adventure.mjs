// Assemble the one-click Adventure document from the qe-actors / qe-scenes /
// qe-journals pack sources. Re-run whenever that content changes, then
// `npm run build-packs queen-euphoria`. Mirrors DE.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ID = createHash("sha1").update("qe-adventure:Queen Euphoria").digest("hex").slice(0, 16);

function load(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => {
      const d = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
      delete d._key;            // embedded copies have no LevelDB key
      return d;
    });
}

const actors  = load("packs-src/qe-actors");
const scenes  = load("packs-src/qe-scenes");
const journal = load("packs-src/qe-journals");

const adventure = {
  _id: ID, name: "Queen Euphoria",
  img: "modules/sr2e-queen-euphoria/assets/scenes/The_Hive.png",
  description: "<p>A Shadowrun 2nd Edition adventure (FASA 7304), modernized to the sr2e system. The megasimsense star Euphoria has been kidnapped by an Ant-totem shaman building an insect Hive, and the runners are hired to recover her before her metamorphosis completes. Importing this adventure adds its cast, the insect Hive, the Strice Foods Matrix host and IC, GM journals, and scenes to your world.</p>",
  caption: "Queen Euphoria (FASA 7304) — SR2E",
  folders: [],
  actors, scenes, journal,
  items: [], cards: [], macros: [], playlists: [], tables: [], combats: [],
  sort: 0, flags: {}, ownership: { default: 0 },
  _stats: { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.1.0", createdTime: 1784000000000, modifiedTime: 1784000000000, lastModifiedBy: null, compendiumSource: null, duplicateSource: null, exportSource: null },
  _key: `!adventures!${ID}`
};

writeFileSync(`packs-src/queen-euphoria/Queen_Euphoria_${ID}.json`, JSON.stringify(adventure, null, 2) + "\n");
console.log(`wrote Adventure: ${actors.length} actors, ${scenes.length} scenes, ${journal.length} journals`);
