// Generate Queen Euphoria cast actors (npc type) into packs-src/qe-actors.
// Stats transcribed from the adventure's Cast of Characters (book p.62-64) and
// Insects Among Us (p.54), modernized to SR2E — see docs/CAST-STATS.md.
// Re-run after editing CAST; it overwrites the per-name files (stable _id by name).
// Mirrors ../sr2e-double-exposure/tools/gen-actors.mjs.
import { writeFileSync, readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Canonical spell definitions from the sr2e system pack — so Craft's spells carry
// the system's real drain/target/area/subcategory (not hand-typed guesses).
const SYS_SPELLS_DIR = "../sr2e-foundryvtt/packs-src/spells";
const SYS_SPELLS = new Map();
for (const f of readdirSync(SYS_SPELLS_DIR).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(`${SYS_SPELLS_DIR}/${f}`, "utf8"));
  if (d.name) SYS_SPELLS.set(d.name, d.system);
}

const DIR = "packs-src/qe-actors";
const idFor = (s) => createHash("sha1").update("qe:" + s).digest("hex").slice(0, 16);
const SKILL_ATTR = {
  conjuring: "charisma", sorcery: "willpower", "magic theory": "intelligence",
  firearms: "quickness", "unarmed combat": "strength", "armed combat": "strength",
  stealth: "quickness", etiquette: "charisma", negotiation: "charisma",
  electronics: "intelligence", acting: "charisma", dance: "quickness",
  "simsense acting": "charisma", "evaluate magical goods": "intelligence",
  metalworking: "intelligence", woodworking: "intelligence"
};
const STATS = { coreVersion: "13.351", systemId: null, systemVersion: null, createdTime: null, modifiedTime: null, lastModifiedBy: null, compendiumSource: null, duplicateSource: null, exportSource: null };

const safeName = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
const portraitPath = (name) => `modules/sr2e-queen-euphoria/assets/portraits/${safeName(name)}.png`;

function attr(base, mod = 0) {
  return { base, mod, value: Math.max(1, base + mod), racial: 0 };
}

function skillItem(s) {
  const key = s.name.toLowerCase().replace(/\s*\(.*\)$/, "");
  return {
    _id: idFor("skill:" + s.name + ":" + s.rating), name: s.name, type: "skill",
    img: "icons/svg/book.svg",
    system: {
      category: s.category ?? "active", linkedAttribute: s.attr ?? SKILL_ATTR[key] ?? "intelligence",
      rating: s.rating, concentration: { name: s.conc ?? "", rating: s.conc ? s.rating : 0 },
      specialization: { name: s.spec ?? "", rating: s.spec ? s.rating : 0 },
      isMagical: !!s.magical, notes: ""
    },
    effects: [], flags: {}, _stats: STATS, folder: null, sort: 0, ownership: { default: 0 }
  };
}

// s = { name, force, notes? }. Uses the canonical system spell definition, only
// overriding the Force to Craft's rating (and a per-actor note if any).
function spellItem(s) {
  const sys = SYS_SPELLS.get(s.name);
  if (!sys) throw new Error(`No canonical system spell named "${s.name}" — check the spelling against ../sr2e-foundryvtt/packs-src/spells/`);
  return {
    _id: idFor("spell:" + s.name), name: s.name, type: "spell", img: "icons/svg/daze.svg",
    system: {
      ...sys, force: s.force,
      sustaining: false, sustainedForce: 0, spellLocked: false, quickened: false, quickeningKarma: 0,
      notes: s.notes ?? sys.notes ?? ""
    },
    effects: [], flags: {}, _stats: STATS, folder: null, sort: 0, ownership: { default: 0 }
  };
}

const WEAPONS = {
  aresPredator: { name: "Ares Predator", type: "firearm", skill: "firearms", dmg: "9M", modes: "sa", ammo: [15, "pistol"], ranges: [5, 20, 40, 60], conceal: 5, cost: 450, avail: "4/5 days", notes: "Heavy pistol (SR2E p.94)." },
  ceska120:     { name: "Ceska vz/120", type: "firearm", skill: "firearms", dmg: "6L", modes: "sa", ammo: [18, "pistol"], ranges: [5, 15, 30, 50], conceal: 8, cost: 200, avail: "4/4 days", notes: "Light pistol, high concealability (SR2E p.94)." }
};

function weaponItem(key) {
  const w = WEAPONS[key];
  const fm = { ss: false, sa: false, bf: false, fa: false };
  for (const m of (w.modes ? w.modes.split(",") : [])) fm[m.trim()] = true;
  return {
    _id: idFor("weapon:" + w.name), name: w.name, type: "weapon",
    img: w.type === "melee" ? "icons/svg/sword.svg" : "icons/svg/target.svg",
    system: {
      weaponType: w.type, skill: w.skill, damageCode: w.dmg, damageType: "physical",
      concealability: w.conceal ?? 4, reach: w.reach ?? 0, firingModes: fm,
      ammo: w.ammo ? { current: w.ammo[0], max: w.ammo[0], type: w.ammo[1] } : { current: 0, max: 0, type: "" },
      recoilComp: 0,
      ranges: w.ranges ? { short: w.ranges[0], medium: w.ranges[1], long: w.ranges[2], extreme: w.ranges[3] }
                       : { short: 0, medium: 0, long: 0, extreme: 0 },
      cost: w.cost ?? 0, availability: w.avail ?? "", legality: "Restricted", equipped: true, notes: w.notes ?? ""
    },
    effects: [], flags: {}, _stats: STATS, folder: null, sort: 0, ownership: { default: 0 }
  };
}

function armorItem(name, av) {
  return {
    _id: idFor("armor:" + name), name, type: "armor", img: "icons/svg/shield.svg",
    system: {
      ballistic: av?.[0] ?? 0, impact: av?.[1] ?? 0, concealability: 0, weight: 0,
      cost: 0, availability: "", legality: "Legal", equipped: true,
      notes: "Worn armor (Queen Euphoria stat block)."
    },
    effects: [], flags: {}, _stats: STATS, folder: null, sort: 0, ownership: { default: 0 }
  };
}

function actor(n) {
  const _id = idFor(n.name);
  const a = n.attrs;
  const reactionBase = Math.floor((a.qui + a.int) / 2);
  const reactionMod = (n.reaction ?? reactionBase) - reactionBase;
  const reactionVal = reactionBase + reactionMod;
  const wornArmor = n.armorName ? [armorItem(n.armorName, n.armor)] : [];
  const items = [
    ...(n.skills ?? []).map(skillItem),
    ...(n.spells ?? []).map(spellItem),
    ...(n.weapons ?? []).map(weaponItem),
    ...wornArmor
  ];
  const armorField = n.armorName ? { ballistic: 0, impact: 0 } : { ballistic: n.armor?.[0] ?? 0, impact: n.armor?.[1] ?? 0 };
  const img = n.img ?? portraitPath(n.name);
  return {
    _id, name: n.name, type: "npc", img,
    system: {
      biography: n.bio ?? "", race: n.race ?? "human", professionalRating: n.pro ?? 0,
      body: attr(a.body), quickness: attr(a.qui), strength: attr(a.str),
      charisma: attr(a.cha), intelligence: attr(a.int), willpower: attr(a.wil),
      // Metahumans keep max 6 (current Essence reflects cyberware loss); spirits'
      // Essence = Force (both capped at the NPC schema's max of 6).
      essence: n.race === "spirit"
        ? { value: Math.min(n.essence ?? 6, 6), max: Math.min(n.essence ?? 6, 6) }
        : { value: n.essence ?? 6, max: 6 },
      magic: { value: n.magic ?? 0, max: n.magic ?? 0, tradition: n.tradition ?? "none", type: n.magicType ?? "none", totem: n.totem ?? "" },
      reaction: { base: reactionBase, mod: reactionMod, value: reactionVal },
      conditionMonitor: { physical: { value: 0, max: 10, overflow: 0 }, stun: { value: 0, max: 10, overflow: 0 }, overflow: 0 },
      armor: armorField,
      dicePools: { combat: { value: 0, max: 0, bonus: 0 }, magic: { value: 0, max: 0, bonus: 0 } },
      initiative: { base: reactionVal, dice: n.initDice ?? 1, mod: 0, value: reactionVal },
      threatRating: n.threat ?? 0, nuyen: 0, movement: { walk: a.qui, run: a.qui * 3 }
    },
    items, effects: [], folder: null, sort: 0, flags: {},
    _stats: { ...STATS, systemId: "sr2e", systemVersion: "0.1.0", createdTime: 1784000000000, modifiedTime: 1784000000000 },
    prototypeToken: {
      name: n.name, displayName: 20, actorLink: false, width: 1, height: 1,
      texture: { src: img, anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0, fit: "contain", scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff", alphaThreshold: 0.75 },
      lockRotation: false, rotation: 0, alpha: 1, disposition: n.disposition ?? -1, displayBars: 20,
      bar1: { attribute: "conditionMonitor.physical" }, bar2: { attribute: "conditionMonitor.stun" }
    },
    ownership: { default: 0 }, _key: `!actors!${_id}`
  };
}

// Bio boilerplate shared by every insect actor (the MANUAL combat rules the NPC
// workflow won't enforce — SR2 rules re-derived from QE p.54).
const INSECT_RULES = "<p><strong>MANUAL rules (QE p.54 — the sheet does NOT enforce these):</strong> "
  + "Immunity to Normal Weapons vs <em>all ranged</em> attacks (firearms etc., not spells); "
  + "\"armor\" = 2×Force. A mundane weapon in melee attacks with <strong>Willpower</strong>, not weapon skill "
  + "(magic / Vulnerability attacks exempt). In astral space stats derive from Force with <strong>+5 Initiative</strong> "
  + "(attack/defend only, no powers). Defeat by destroying the body, banishing, or astral combat.</p>";

// ---------------------------------------------------------------------------
// CAST — Queen Euphoria (FASA 7304). See docs/CAST-STATS.md.
// ---------------------------------------------------------------------------
const CAST = [
  {
    name: "Craft (Thomas Dorin)",
    pro: 4, threat: 6, essence: 6, magic: 6, magicType: "full_magician", tradition: "shamanic",
    totem: "Ant", disposition: -1, armorName: "Real Leather Clothing", armor: [0, 2],
    weapons: ["aresPredator"],
    bio: "<p>Ant-totem shaman and the adventure's villain. Former Coyote shaman turned talismonger — he runs the <strong>Magic Crafts</strong> shop and took a run from his Fixer, Solomon Daniels. Under the Ant totem he is crazed with power, and his psychotic fixation on the simstar Euphoria drives the plot: he means to make her his \"Queen.\"</p>"
      + "<p><strong>Totem:</strong> Ant — the book grants it no special mechanical benefits; the shamanic bond is roleplay/flavour.</p>"
      + "<p><strong>Focus:</strong> Sleep Spell Focus (Force 2) — bond it to the Sleep spell for +2 dice when casting Sleep.</p>"
      + "<p><em>Cast of Characters, Queen Euphoria p.62.</em></p>",
    attrs: { body: 4, qui: 3, str: 3, cha: 5, int: 5, wil: 6 },
    reaction: 4, initDice: 1,
    skills: [
      { name: "Conjuring", rating: 5, magical: true },
      { name: "Sorcery", rating: 6, conc: "Spellcasting", magical: true },
      { name: "Firearms", rating: 4, conc: "Pistols" },
      { name: "Etiquette (Corporate)", rating: 1, conc: "Corporate" },
      { name: "Etiquette (Street)", rating: 4, conc: "Street" },
      { name: "Magic Theory", rating: 6 },
      { name: "Negotiation", rating: 4 },
      { name: "Stealth", rating: 4, conc: "Urban" },
      { name: "Unarmed Combat", rating: 3 },
      { name: "Evaluate Magical Goods", rating: 5, category: "knowledge" },
      { name: "Metalworking", rating: 3, category: "knowledge" },
      { name: "Woodworking", rating: 3, category: "knowledge" }
    ],
    spells: [
      { name: "Mana Bolt", force: 5 },
      { name: "Sleep", force: 5, notes: "Bonded Sleep Spell Focus (Force 2) adds 2 dice when casting Sleep." },
      { name: "Clairvoyance", force: 4 },
      { name: "Confusion", force: 5 },
      { name: "Mask", force: 6 },
      { name: "Stimulation", force: 4 },
      { name: "Armor", force: 6 },
      { name: "Levitate Person", force: 4 }
    ]
  },
  {
    name: "Euphoria (Amanda Lockhart)",
    pro: 2, threat: 2, essence: 5, disposition: 0, armorName: "Long Coat", armor: [4, 2],
    bio: "<p>Megasimsense star and the adventure's abductee. Arrogant 21-year-old recluse, daughter of two trideo stars, discovered/managed by Robert Carrone. Her sim-rig kept recording during the kidnapping — the recording is the key clue at her penthouse.</p>"
      + "<p><strong>Cyberware:</strong> Datajack; Sense Link (with internal transmitter). (Essence 5.)</p>"
      + "<p><em>Cast of Characters, Queen Euphoria p.63.</em></p>",
    attrs: { body: 2, qui: 4, str: 2, cha: 6, int: 4, wil: 2 },
    reaction: 4, initDice: 1,
    skills: [
      { name: "Electronics", rating: 3, conc: "Simsense Equipment" },
      { name: "Etiquette (Corporate)", rating: 2, conc: "Corporate" },
      { name: "Etiquette (Media)", rating: 3, conc: "Media" },
      { name: "Etiquette (Street)", rating: 1, conc: "Street" },
      { name: "Negotiation", rating: 2 },
      { name: "Acting", rating: 5, category: "knowledge" },
      { name: "Dance", rating: 2, category: "knowledge" },
      { name: "Simsense Acting", rating: 6, category: "knowledge" }
    ]
  },
  {
    name: "Robert Carrone",
    pro: 3, threat: 3, essence: 5.4, disposition: 0, armorName: "Armor Clothing", armor: [3, 0],
    weapons: ["ceska120"],
    bio: "<p>MegaMedia vice-president and Euphoria's former manager — the Johnson who hires the runners to find her. Born corp man, calm, ruthless, loyal to MegaMedia only until a better deal appears.</p>"
      + "<p><strong>Cyberware:</strong> Datajack; Display Link; Headware Memory (30 Mp). (Essence 5.4.)</p>"
      + "<p><strong>Gear:</strong> Pocket Secretary, Wristphone with vidscreen.</p>"
      + "<p><em>Cast of Characters, Queen Euphoria p.64.</em></p>",
    attrs: { body: 3, qui: 4, str: 2, cha: 3, int: 4, wil: 3 },
    reaction: 4, initDice: 1,
    skills: [
      { name: "Etiquette (Corporate)", rating: 6, conc: "Corporate" },
      { name: "Etiquette (Media)", rating: 5, conc: "Media" },
      { name: "Firearms", rating: 3 },
      { name: "Negotiation", rating: 5 }
    ]
  },
  {
    name: "Soldier Ant Spirit (True Form, Force 4)",
    race: "spirit", pro: 4, threat: 4, essence: 4, disposition: -1, armor: [8, 8],
    bio: "<p>An insect spirit soldier in its true form — a roughly man-sized, chitin-armoured ant-horror that exists to protect the Queen. Aggressive, fearless, terrifying. Attributes scale with Force (here F = 4); manifest Reaction = Force.</p>"
      + INSECT_RULES
      + "<p><em>Insects Among Us, Queen Euphoria p.54.</em></p>",
    attrs: { body: 5, qui: 16, str: 8, cha: 4, int: 4, wil: 4 },
    reaction: 4, initDice: 1
  },
  {
    name: "Soldier Ant Spirit (Flesh Form, Force 4)",
    race: "spirit", pro: 4, threat: 4, essence: 4, disposition: -1, armor: [8, 8],
    bio: "<p>A soldier ant spirit inhabiting a human host — a gruesome human/giant-ant hybrid, permanently bound to the body (a Dual Being that cannot astrally project). <strong>Flesh Form rule:</strong> a Soldier adds its Force to the host's Physical attributes; Mental attributes are the spirit's True-Form values. (Representative host below: Physical 3 + Force 4 = 7.)</p>"
      + INSECT_RULES
      + "<p><em>Insects Among Us, Queen Euphoria p.54. Scale the host's Physical attributes to the individual it possesses.</em></p>",
    attrs: { body: 7, qui: 7, str: 7, cha: 4, int: 4, wil: 4 },
    reaction: 5, initDice: 1
  },
  {
    name: "Worker Ant Spirit (True Form, Force 3)",
    race: "spirit", pro: 3, threat: 2, essence: 3, disposition: -1, armor: [6, 6],
    bio: "<p>An insect spirit worker in its true form — the colony's labour caste, tending cocoons and larvae. Cowardly and ineffective in combat: when attacked it emits a piercing screech to warn the Hive, and it will throw itself in the path of an attack to protect the cocoons or the Queen. Attributes scale with Force (here F = 3); manifest Reaction = Force.</p>"
      + INSECT_RULES
      + "<p><em>Insects Among Us, Queen Euphoria p.54.</em></p>",
    attrs: { body: 1, qui: 9, str: 5, cha: 3, int: 1, wil: 3 },
    reaction: 3, initDice: 1
  },
  {
    name: "Worker Ant Spirit (Flesh Form, Force 3)",
    race: "spirit", pro: 3, threat: 2, essence: 3, disposition: -1, armor: [6, 6],
    bio: "<p>A worker ant spirit inhabiting a human host — a Dual Being that cannot astrally project. <strong>Flesh Form rule:</strong> a Worker reduces the host's Physical attributes by 1; Mental attributes are the spirit's True-Form values. (Representative host below: Physical 3 − 1 = 2.) Still a poor combatant that screeches and self-sacrifices to protect the Hive.</p>"
      + INSECT_RULES
      + "<p><em>Insects Among Us, Queen Euphoria p.54. Scale the host's Physical attributes to the individual it possesses.</em></p>",
    attrs: { body: 2, qui: 2, str: 2, cha: 3, int: 1, wil: 3 },
    reaction: 1, initDice: 1
  },
  {
    name: "Hive Queen (set-piece)",
    race: "spirit", pro: 5, threat: 10, essence: 6, disposition: -1, armor: [12, 12],
    bio: "<p><strong>Non-combat set-piece.</strong> Queen Euphoria states the Queen Spirit \"does not actually appear in the adventure\" — Craft's Hive is still forming and the Queen has not yet been summoned. This actor exists only as a display token for the climax at the Hive (the cocooned Euphoria awaiting metamorphosis); it is not statted for a fight.</p>"
      + "<p>If a GM extends the adventure and needs the Queen in play, she is an extremely high-Force insect Queen spirit — scale her to the group and see the DE Hive Queen (Force 10) for a worked example. Attributes below are nominal placeholders (Force ~10); armor 2×Force.</p>"
      + INSECT_RULES,
    attrs: { body: 15, qui: 16, str: 10, cha: 10, int: 10, wil: 10 },
    reaction: 10, initDice: 1
  }
];

let n = 0;
for (const c of CAST) {
  const doc = actor(c);
  writeFileSync(`${DIR}/${safeName(c.name)}_${doc._id}.json`, JSON.stringify(doc, null, 2) + "\n");
  n++;
}
console.log(`wrote ${n} cast actor(s)`);
