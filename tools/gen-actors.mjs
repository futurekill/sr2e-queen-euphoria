// Generate the Queen Euphoria cast into packs-src/qe-actors.
//
// THIS FILE HOLDS NO STAT LITERALS. Every number lives in tools/data/qe-actors.json
// with a page citation, and every SR2 damage code is read out of the system's own
// weapons pack rather than re-typed here. That split is the whole point: the
// module previously shipped 12 invented or missing stat blocks because stats and
// generation logic were tangled together in one file nobody could audit.
//
// Two properties this generator guarantees, both of which it used to violate:
//
//   1. IDENTITY IS PINNED. _id comes from the manifest, never from hashing a name.
//      Foundry's Adventure import matches on _id alone, so a changed id is a
//      DIFFERENT document — renaming an actor used to mean re-importing produced a
//      duplicate while existing tokens stayed bound to the old one.
//
//   2. GENERATION IS ATOMIC. It writes to a sibling directory, validates, then
//      swaps. The old version wrote current outputs but never removed files whose
//      names had disappeared, so a rename left the stale JSON behind AND THE PACK
//      LOADED BOTH.
import { writeFileSync, readdirSync, readFileSync, mkdirSync, rmSync, renameSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";

const SYS = "../sr2e-foundryvtt";
const DIR = "packs-src/qe-actors";
const MANIFEST = "tools/data/qe-actors.json";

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

// ── Canonical definitions pulled from the system, never hand-typed ───────────
function loadPack(name) {
  const dir = `${SYS}/packs-src/${name}`;
  const map = new Map();
  for (const f of readdirSync(dir).filter(f => f.endsWith(".json") && !f.startsWith("_folder"))) {
    const d = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
    if (d.name) map.set(d.name, d);
  }
  return map;
}
const SYS_SPELLS   = loadPack("spells");
const SYS_WEAPONS  = loadPack("weapons");
const SYS_VEHICLES = loadPack("vehicles");

const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.1.0",
  createdTime: 1784000000000, modifiedTime: 1784000000000, lastModifiedBy: null,
  compendiumSource: null, duplicateSource: null, exportSource: null };

const safeName = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
const art = (a) => a === "$fromSystem" ? null
  : a.startsWith("systems/") ? a
  : `modules/sr2e-queen-euphoria/assets/portraits/${a}`;

// Deterministic per-actor item ids. Derived from the actor's PINNED id, so they
// are stable across runs but cannot collide between two actors carrying the same
// weapon — which a name-only hash would have done.
let itemSeq = 0;
const itemId = (actorId, kind, name) =>
  (actorId.replace(/[^a-f0-9]/gi, "0").slice(0, 8) +
   Buffer.from(`${kind}:${name}:${itemSeq++}`).toString("hex")).slice(0, 16).padEnd(16, "0");

const SKILL_ATTR = {
  conjuring: "charisma", sorcery: "willpower", "magic theory": "intelligence",
  "magical theory": "intelligence", firearms: "quickness", "unarmed combat": "strength",
  "armed combat": "strength", stealth: "quickness", etiquette: "charisma",
  negotiation: "charisma", electronics: "intelligence", acting: "charisma",
  dance: "quickness", "simsense acting": "charisma", interrogation: "charisma",
  leadership: "charisma", demolitions: "intelligence", "throwing weapons": "strength",
  "computer theory": "intelligence", "evaluate magical goods": "intelligence",
  metalworking: "intelligence", woodworking: "intelligence", car: "reaction"
};

const base = (id, name, type, img) => ({
  _id: id, name, type, img, effects: [], flags: {}, _stats: STATS,
  folder: null, sort: 0, ownership: { default: 0 }
});

function skillItem(aid, s) {
  const key = s.name.toLowerCase().replace(/\s*\(.*\)$/, "");
  return {
    ...base(itemId(aid, "skill", s.name), s.name, "skill", "icons/svg/book.svg"),
    system: {
      category: s.category ?? "active",
      linkedAttribute: s.attr ?? SKILL_ATTR[key] ?? "intelligence",
      rating: s.rating,
      concentration: { name: s.conc ?? "", rating: s.conc ? s.rating : 0 },
      specialization: { name: s.spec ?? "", rating: s.spec ? s.rating : 0 },
      isMagical: !!s.magical, notes: ""
    }
  };
}

// QE prints SR1 spell names. p.283 says spell codes must be translated to their
// second-edition versions, and SR2 both renamed and MERGED spells (SR1's
// per-wound-level Treat variants became one Treat). spellTranslations maps the
// printed name onto the system's canonical spell so the sheet gets SR2's real
// drain code — or, where SR2 has no equivalent at all, keeps the SR1 spell as a
// flagged custom item rather than silently dropping it.
function spellItem(aid, s) {
  const t = manifest.spellTranslations?.[s.name];
  const provenance = (extra) =>
    `<p><em>Queen Euphoria conversion (core p.283 — translate spell codes). ${extra}</em></p>`;

  if (t?.custom) {
    return {
      ...base(itemId(aid, "spell", s.name), s.name, "spell", "icons/svg/daze.svg"),
      system: { ...t.system, force: s.force, sustaining: false, sustainedForce: 0,
        spellLocked: false, quickened: false, quickeningKarma: 0,
        notes: (s.notes ? `<p>${s.notes}</p>` : "") +
          provenance(`<strong>No SR2 equivalent — custom spell.</strong> ${t.note}`) }
    };
  }

  const lookup = t?.sysName ?? s.name;
  const sys = SYS_SPELLS.get(lookup);
  if (!sys) {
    throw new Error(
      `No system spell "${lookup}"${t ? ` (translated from "${s.name}")` : ""} — ` +
      `either fix the name, add a spellTranslations entry in ${MANIFEST}, or mark it custom.`);
  }
  return {
    ...base(itemId(aid, "spell", lookup), lookup, "spell", "icons/svg/daze.svg"),
    system: { ...sys.system, force: s.force, sustaining: false, sustainedForce: 0,
      spellLocked: false, quickened: false, quickeningKarma: 0,
      notes: (s.notes ? `<p>${s.notes}</p>` : "") +
        (t ? provenance(`Printed in Queen Euphoria as <strong>${s.name}</strong>. ${t.note}`)
           : (sys.system.notes ?? "")) }
  };
}

// Method A reads the SR2 catalogue entry whole. Method B builds from the folded
// code, and records the SR1 original in the notes so the arithmetic stays visible
// on the sheet itself.
function weaponItem(aid, key) {
  const w = manifest.weapons[key];
  if (!w) throw new Error(`Unknown weapon key "${key}"`);

  if (w.method === "A") {
    const src = SYS_WEAPONS.get(w.sysName);
    if (!src) throw new Error(`Method A weapon "${w.sysName}" not in the system pack`);
    return {
      ...base(itemId(aid, "weapon", w.sysName), src.name, "weapon", src.img),
      system: { ...src.system, equipped: true,
        notes: `${src.system.notes ?? ""}<p><em>Queen Euphoria conversion (core p.283, method A — substitute the SR2 item). Printed SR1 code: <code>${w.from}</code>. ${w.note ?? ""}</em></p>` }
    };
  }

  const fm = { ss: false, sa: false, bf: false, fa: false };
  for (const m of (w.modes ?? "").split(",").filter(Boolean)) fm[m.trim()] = true;
  return {
    ...base(itemId(aid, "weapon", w.name), w.name, "weapon",
            w.weaponType === "melee" ? "icons/svg/sword.svg" : "icons/svg/target.svg"),
    system: {
      weaponType: w.weaponType, skill: w.skill, damageCode: w.damageCode,
      damageType: "physical", concealability: w.conceal ?? 4, reach: w.reach ?? 0,
      firingModes: fm,
      ammo: w.ammo ? { current: w.ammo[0], max: w.ammo[0], type: w.ammo[1] }
                   : { current: 0, max: 0, type: "" },
      recoilComp: 0,
      ranges: w.ranges ? { short: w.ranges[0], medium: w.ranges[1], long: w.ranges[2], extreme: w.ranges[3] }
                       : { short: 0, medium: 0, long: 0, extreme: 0 },
      cost: w.cost ?? 0, availability: w.avail ?? "", legality: "Restricted", equipped: true,
      notes: `<p><em>Queen Euphoria conversion (core p.283, method B — fold the staging digit). Printed SR1 <code>${w.from}</code> → <code>${w.damageCode}</code>. ${w.note ?? ""}</em></p>`
    }
  };
}

function armorItem(aid, key) {
  const a = manifest.armor[key];
  if (!a) throw new Error(`Unknown armor key "${key}"`);
  return {
    ...base(itemId(aid, "armor", a.name), a.name, "armor", "icons/svg/shield.svg"),
    system: { ballistic: a.av[0], impact: a.av[1], concealability: 0, weight: 0,
      cost: 0, availability: "", legality: "Legal", equipped: true,
      notes: "<p>Worn armor, as printed in the Queen Euphoria stat block.</p>" }
  };
}

const simpleItem = (aid, kind, g, img) => ({
  ...base(itemId(aid, kind, g.name), g.name, kind, img),
  system: { rating: g.rating ?? 0, quantity: g.qty ?? 1, cost: 0, availability: "",
    legality: "Legal", equipped: true, essence: g.essence ?? 0, notes: g.notes ?? "" }
});

function focusItem(aid, f, spellIds = new Map()) {
  return {
    ...base(itemId(aid, "focus", f.name), f.name, "focus", "icons/svg/aura.svg"),
    system: { focusType: f.focusType, force: f.force, bonded: !!f.bonded,
      active: !!f.active, expendable: false, bondedWeaponId: "",
      // sr2e 0.89.0: a spell focus serves ONE bound spell from a per-action pool
      // (SR2E p.137). boundSpellId is resolved from the spell NAME at generation,
      // because item ids are assigned here and the manifest cannot know them.
      spellSubtype: f.spellSubtype ?? "specific",
      // Resolved from the ACTUAL generated spell items, never recomputed. Calling
      // itemId() again would only coincidentally agree: it folds a global sequence
      // counter into the hash, and that counter differs between the two calls —
      // the ids matched purely because slice(0,16) happened to truncate the
      // sequence away for these particular names. A shorter kind/name would have
      // produced a silently unbound focus.
      boundSpellId: f.boundSpell ? (spellIds.get(f.boundSpell) ?? "") : "",
      spent: 0,
      notes: f.notes ?? "" }
  };
}

const attr = (v) => ({ base: v, mod: 0, value: v, racial: 0 });

function protoToken(name, img, opts = {}) {
  return {
    name, displayName: 20, actorLink: opts.linked ?? false,
    width: opts.w ?? 1, height: opts.h ?? 1,
    texture: { src: img, anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0,
      fit: opts.fit ?? "cover", scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff",
      alphaThreshold: 0.75 },
    lockRotation: true, rotation: 0, alpha: 1,
    disposition: opts.disposition ?? -1, displayBars: opts.bars ?? 20,
    ...(opts.bar1 ? { bar1: { attribute: opts.bar1 } } : {}),
    ...(opts.bar2 ? { bar2: { attribute: opts.bar2 } } : {})
  };
}

// ── Builders per actor type ─────────────────────────────────────────────────
function buildNpc(e) {
  const a = e.attrs, id = e._id;
  const reactionBase = Math.floor((a.qui + a.int) / 2);
  const reactionMod  = (e.reaction ?? reactionBase) - reactionBase;
  const reactionVal  = reactionBase + reactionMod;
  const img = art(e.art);

  // Spells first, so a focus can bind to the id that was actually emitted.
  const spellItems = (e.spells ?? []).map(s => spellItem(id, s));
  const spellIds = new Map(spellItems.map(s => [s.name, s._id]));

  const items = [
    ...(e.skills ?? []).map(s => skillItem(id, s)),
    ...spellItems,
    ...(e.foci ?? []).map(f => focusItem(id, f, spellIds)),
    ...(e.weapons ?? []).map(k => weaponItem(id, k)),
    ...(e.armorKey ? [armorItem(id, e.armorKey)] : []),
    ...(e.cyberware ?? []).map(g => simpleItem(id, "cyberware", g, "icons/svg/biohazard.svg")),
    ...(e.gear ?? []).map(g => simpleItem(id, "gear", g, "icons/svg/item-bag.svg"))
  ];

  return {
    ...base(id, e.name, "npc", img),
    system: {
      biography: e.bio ?? "", race: e.race ?? "human",
      professionalRating: e.pro ?? 0,
      body: attr(a.body), quickness: attr(a.qui), strength: attr(a.str),
      charisma: attr(a.cha), intelligence: attr(a.int), willpower: attr(a.wil),
      essence: { value: e.essence ?? 6, max: 6 },
      magic: { value: e.magic ?? 0, max: e.magic ?? 0, tradition: e.tradition ?? "none",
               type: e.magicType ?? "none", totem: e.totem ?? "" },
      reaction: { base: reactionBase, mod: reactionMod, value: reactionVal },
      conditionMonitor: { physical: { value: 0, max: 10, overflow: 0 },
                          stun: { value: 0, max: 10, overflow: 0 }, overflow: 0 },
      // armorKey puts the rating on a real equipped item, which the data model
      // adds on top of this base — so the base must stay 0 or it double-counts.
      armor: e.armorKey ? { ballistic: 0, impact: 0 }
                        : { ballistic: e.armor?.[0] ?? 0, impact: e.armor?.[1] ?? 0 },
      dicePools: { combat: { value: 0, max: 0, bonus: 0 },
                   // NPCData derives the combat pool but NOT this one, so a
                   // transcribed printed Magic Pool survives untouched.
                   magic: { value: e.magicPool ?? 0, max: e.magicPool ?? 0, bonus: 0 } },
      initiative: { base: reactionVal, dice: e.initDice ?? 1, mod: 0, value: reactionVal },
      threatRating: e.threat ?? 0, nuyen: 0,
      movement: { walk: a.qui, run: a.qui * 3 }
    },
    items,
    prototypeToken: protoToken(e.name, img, {
      disposition: e.disposition, bar1: "conditionMonitor.physical", bar2: "conditionMonitor.stun"
    }),
    _key: `!actors!${id}`
  };
}

function buildSpirit(e) {
  const img = art(e.art);
  return {
    ...base(e._id, e.name, "spirit", img),
    system: {
      spiritType: e.spiritType, force: e.force, domain: e.domain ?? "",
      services: e.services ?? 0, maxServices: e.maxServices ?? 0,
      conjurerUuid: "", powers: e.powers ?? [], weaknesses: e.weaknesses ?? [],
      notes: e.bio ?? ""
    },
    items: [],
    prototypeToken: protoToken(e.name, img, { linked: true, disposition: e.disposition }),
    _key: `!actors!${e._id}`
  };
}

function buildHost(e) {
  const img = art(e.art), r = e.systemRating;
  return {
    ...base(e._id, e.name, "host", img),
    system: {
      securityCode: e.securityCode, systemRating: r, attempts: 0, alert: "none",
      subsystems: { access: r, control: r, index: r, files: r, slave: r },
      securityValueOverride: 0, notes: e.notes ?? ""
    },
    items: [],
    prototypeToken: protoToken(e.name, img, { linked: true, w: 2, h: 2, fit: "contain", bars: 0 }),
    _key: `!actors!${e._id}`
  };
}

function buildIc(e) {
  const img = art(e.art), r = e.rating;
  return {
    ...base(e._id, e.name, "ic", img),
    system: {
      icType: e.icType, rating: r, hostUuid: `Actor.${e.hostId}`,
      securityCode: "orange", alert: "none",
      bod: r, evasion: r, masking: r, sensor: r, attack: r,
      conditionMonitor: { value: 0, max: r * 2 },
      // Orange base 7 (SR2E p.169) + rating. Re-derived at runtime from the
      // linked host's Security Code.
      initiative: { base: 7 + r, dice: 1, value: 7 + r },
      specialAbilities: e.abilities ?? [], notes: e.notes ?? ""
    },
    items: [],
    prototypeToken: protoToken(e.name, img, { linked: true, bar1: "conditionMonitor" }),
    _key: `!actors!${e._id}`
  };
}

function buildVehicle(e) {
  const src = SYS_VEHICLES.get(e.sysVehicle);
  if (!src) throw new Error(`Method A vehicle "${e.sysVehicle}" not in the system pack`);
  const img = e.art === "$fromSystem" ? src.img : art(e.art);
  const id = e._id;
  return {
    ...base(id, e.name, "vehicle", img),
    system: { ...src.system, ...(e.overrides ?? {}),
      notes: (e.notes ?? "") + (src.system.notes ?? "") },
    items: [
      ...(e.weapons ?? []).map(k => weaponItem(id, k)),
      ...(e.gear ?? []).map(g => simpleItem(id, "gear", g, "icons/svg/item-bag.svg"))
    ],
    prototypeToken: protoToken(e.name, img, { w: 2, h: 2, fit: "contain",
      disposition: e.disposition, bars: 0 }),
    _key: `!actors!${id}`
  };
}

const BUILDERS = { npc: buildNpc, spirit: buildSpirit, host: buildHost, ic: buildIc, vehicle: buildVehicle };

// ── Assign permanent ids to net-new entries, then write them back ────────────
// A placeholder ending in -NEW means "no id yet". It gets a random one ONCE and
// the manifest is rewritten, so the id is permanent from that moment. Deriving it
// from the name instead would make every future rename a new document.
let assigned = 0;
for (const e of manifest.actors) {
  if (e._id.endsWith("-NEW")) {
    e._id = randomBytes(8).toString("hex");
    delete e.$idNote;
    assigned++;
  }
}
if (assigned) {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`assigned ${assigned} permanent id(s) — written back to ${MANIFEST}`);
}

// ── Pre-flight assertions (cheap, and each one has bitten before) ────────────
const ids = manifest.actors.map(a => a._id);
const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dupes.length) throw new Error(`Duplicate actor ids: ${dupes.join(", ")}`);

for (const rid of Object.keys(manifest.retiredIds ?? {})) {
  if (ids.includes(rid)) throw new Error(`Retired id ${rid} is being re-used — it is permanently reserved`);
}

// ── Atomic generation: build into a sibling, validate, then swap ─────────────
const TMP = `${DIR}.tmp-${process.pid}`;
const BAK = `${DIR}.bak-${process.pid}`;
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const expected = new Set();
try {
  for (const e of manifest.actors) {
    const builder = BUILDERS[e.type];
    if (!builder) throw new Error(`No builder for actor type "${e.type}" (${e.name})`);
    const doc = builder(e);
    const file = `${safeName(e.name)}_${doc._id}.json`;
    expected.add(file);
    writeFileSync(`${TMP}/${file}`, JSON.stringify(doc, null, 2) + "\n");
  }

  const written = new Set(readdirSync(TMP));
  const extra = [...written].filter(f => !expected.has(f));
  if (extra.length) throw new Error(`Unexpected files: ${extra.join(", ")}`);
  if (written.size !== manifest.actors.length)
    throw new Error(`Wrote ${written.size} files for ${manifest.actors.length} actors`);

  // Swap. Non-empty directories can't be replaced by a single rename, so the old
  // one moves aside first and is only deleted once the new one is in place.
  if (existsSync(DIR)) renameSync(DIR, BAK);
  try {
    renameSync(TMP, DIR);
  } catch (err) {
    if (existsSync(BAK)) renameSync(BAK, DIR);   // roll back
    throw err;
  }
  rmSync(BAK, { recursive: true, force: true });
} catch (err) {
  rmSync(TMP, { recursive: true, force: true });
  if (existsSync(BAK) && !existsSync(DIR)) renameSync(BAK, DIR);
  throw err;
}

const byType = manifest.actors.reduce((m, a) => (m[a.type] = (m[a.type] ?? 0) + 1, m), {});
const printed = manifest.actors.filter(a => a.source === "printed").length;
console.log(`wrote ${manifest.actors.length} actor(s): ` +
  Object.entries(byType).map(([t, n]) => `${n} ${t}`).join(", "));
console.log(`  ${printed} printed (cited), ${manifest.actors.length - printed} modeled`);
