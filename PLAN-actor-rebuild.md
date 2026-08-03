# Plan: rebuild the Queen Euphoria actors from the printed stat blocks
_Round 2 — revised after two Codex rounds_

## Goal

`docs/CONVERSION-AUDIT.md` now holds every printed stat block in the adventure,
each read from a 300 dpi render (status: COMPLETE). Of 15 blocks, **3 are
accurate and 12 are wrong or missing** — the accurate ones being exactly those
that went through `docs/CAST-STATS.md`.

Rebuild `packs-src/qe-actors` so every actor derives from the transcribed table,
add the missing combatants, and stop the invented one from shipping. The
generator becomes the single source of truth so this drift cannot recur.

**Scope boundary, stated up front:** this fixes the *distributed module*. It does
**not** silently rewrite anyone's existing world. Those are different problems
and the plan treats them separately (Step 6).

## Approach

### Step 1 — Transcriptions become data with citations

`tools/data/qe-actors.json` is an **actor manifest covering every emitted
document**, not just the printed ones — because the Strice host, the four IC,
the Hive Queen set-piece and Stone's elementals are *modeled*, and they still
need permanent ids and art. Two kinds of entry, explicitly marked:

- `source: "printed"` — carries a **page citation**, and for every SR1 damage
  code **which p.283 method was used** (A = substitute a real SR2 item;
  B = fold the staging digit);
- `source: "modeled"` — derived rather than transcribed, with a one-line note
  saying what it was derived from. The stat-block validator checks only
  `printed` entries against the audit.

`gen-actors.mjs` holds no stat literals.

### Step 2 — Identity is PINNED, not recomputed  *(was the biggest flaw)*

The v0.2.0 pack is already in futurekill's world. `idFor(s) = sha1("qe:"+s)`
means renaming changes a document's id, and a changed id is a **different
document** — re-importing produces a duplicate while existing tokens stay bound
to the old actor. Hashing a new "stable slug" fixes the *future* and does
nothing for the identity already shipped.

So: `qe-actors.json` carries an explicit permanent `_id` per entry, **seeded
with the ids currently on disk** for all 18 existing actors:

```
adf7c8acc476c171 Corporate / Venue Security      b5363a843c6735ae Craft
07633edb47f6c337 Euphoria                        04e23b7806026164 Euphoria's Bodyguard
ef2a8ee358b3f451 Hive Queen                      f139ed747f2833e6 Lone Star Officer
1dece01022748b01 Osprey                          5e033754c9d374b4 Robert Carrone
5ca2bfcd68b562a5 Soldier Ant (Flesh F4)          68c86edeb4715b6b Soldier Ant (True F4)
2b6a986a58820472 Stone                           8a26e7df5c0982a8 Strice Barrier IC
613124d3b87809ff Strice Foods Host               e377a04489c95550 Strice Scramble IC
6812a823df0eae29 Strice Tar Pit IC               0490c4c216bb2588 Strice Trace-and-Dump IC
96c308d2b016c4f9 Worker Ant (Flesh F3)           e6c0660fae6813ab Worker Ant (True F3)
```

Renaming an actor therefore changes its *display name only*. New actors get new
random ids, recorded permanently on first generation.

**Build assertions** (the first draft's single assertion was self-contradictory —
it demanded every v0.2.0 id be emitted while Step 4 retires one):
- the **17 retained** ids are all emitted;
- the **retired set** (`e6c0660fae6813ab`) is absent, disjoint from the active
  ids, and **permanently reserved** so it can never be reused;
- all emitted ids are globally unique.

**Legacy id mapping — this decides what existing tokens silently become.** The
two Force-4 Soldiers must each inherit a specific new block:

| v0.2.0 actor | id | becomes |
|---|---|---|
| Soldier Ant (Flesh Form, Force 4) | `5ca2bfcd68b562a5` | **Flesh Form Soldiers (Force 3)** |
| Soldier Ant (True Form, Force 4) | `68c86edeb4715b6b` | **True Form Soldiers (Force 3)** |
| Worker Ant (Flesh Form, Force 3) | `96c308d2b016c4f9` | **Flesh Form Worker (Force 1)** |
| Worker Ant (True Form, Force 3) | `e6c0660fae6813ab` | *retired* |

Force 3 rather than Force 5 because it is the lower-powered reading, so an
existing token becomes weaker, not stronger, than the GM expected. The Force 5
variants are new actors with new ids. This mapping goes in `UPGRADING.md`.

Portrait paths get the same treatment: an explicit `art` field per entry, never
derived from the name (`gen-actors.mjs:122` currently does
`n.img ?? portraitPath(n.name)`, and the files on disk are slugified names — the
`sr2e-generator-wipes-art` trap, which renaming would trigger for every ant).

### Step 3 — Generation is atomic

The generator writes current outputs but never removes files whose names
disappeared, so a rename leaves the old JSON behind **and the pack loads both**.
Generate into a **uniquely named sibling directory under `packs-src/`** (a temp
dir elsewhere risks `EXDEV` on rename, defeating the whole swap), **validate
it**, then `target → backup`,
`temp → target`, and delete the backup only on success, rolling back otherwise.
("Replace the directory" is not a single atomic rename when the target is
non-empty; a naive implementation deletes the destination first and leaves
nothing if the move then fails.) Finally assert the emitted filename set exactly
equals the expected roster.

### Step 4 — Roster

**Re-stat, name unchanged:** Craft, Euphoria, Carrone (add only their printed
cyberware); **Corporate / Venue Security → renamed** *Pacific Towers Security
Guard* and corrected on six counts (p.15: C2 I2 W2, Ceska Black Scorpion 3M2,
Armor Vest 2/1, Etiquette (Corporate) 2).

**Correct + rename:** Euphoria's Bodyguard → *Knight Errant Security Guard*.
The block is printed **twice** — p.15 "KNIGHT ERRANT SECURITY GUARD" (singular)
and p.19 "…GUARDS" (plural, the four assigned to Euphoria). They agree on every
attribute and skill; **p.15 supplies the Armor column (5/3)** and **p.19 supplies
the fuller gear list (adds the H&K MP-5TX and specifies two grenades)**. Both are
cited deliberately because each carries something the other omits.
Also: Osprey (p.20); Stone (p.21); Lone Star Officer (p.14 gear).

**Add — 11 definitions, but only 8 NET-NEW documents.** The distinction matters
because three of the definitions reuse retained ids and therefore *replace*
existing actors rather than adding to the roster:

- *reuse a retained id* (3): Flesh Worker F1, Flesh Soldiers F3, True Soldiers F3
  — see the legacy mapping in Step 2;
- *net-new documents* (8): Pride, Vincent Burroughs, The Strice Boys, Flesh
  Soldiers F5, True Soldiers F5, and Stone's three bound elementals (Fire F5,
  Fire F4, Earth F5).

**Final roster: 25 actors** (18 shipped − 1 retired + 8 net-new).

Portraits: the 8 net-new documents need art, but **the three elementals reuse
the `sr2e` system's existing spirit portraits** rather than generating new ones,
so only **5 new portraits** are actually required (Pride, Burroughs, The Strice
Boys, Flesh Soldiers F5, True Soldiers F5 — the last two may reuse their Force-3
counterparts' art if the renders are indistinguishable).

**Elemental services — do not invent numbers.** `SpiritData` requires `services`
and `maxServices`, but the printed Stone block gives *assignments* ("Fire
Elemental Force 5 assigned to Spell Defense"), not service counts. Generate them
as **0 / unknown** with a prominent GM-adjustment note, record each printed
assignment verbatim in the bio, and never present an invented count as printed.

**Retire (1):** `Worker Ant Spirit (True Form, Force 3)` — no such block is
printed. Removed from the pack and Adventure. Its id `e6c0660fae6813ab` is
recorded as retired; **nothing auto-deletes it from a world** (that would break
any token placed on a user scene).

**Vehicles (3):** blocked on the armour ruling — see open questions.

### Step 5 — What the data model can and cannot represent  *(corrected)*

Checked against `../sr2e-foundryvtt/module/data/actor-data.mjs`. The previous
draft promised mechanics the system does not have:

- **Stone must be a `character`, not an `npc`.** `NPCData` has no
  `boundSpirits`, no `astralState`, no `magic.skill`, and the NPC sheet renders
  no spells — a "playable full magician" as an npc is not achievable, and strict
  data-model cleaning would discard the undeclared fields. Two consequences to
  handle explicitly:
  - `CharacterData.chargen.inProgress` **defaults to `true`**, which would make
    Stone behave as an unfinished PC and change purchase behaviour. Generation
    must set it `false`, verified *after* schema preparation.
  - `professionalRating` and `threatRating` are **NPC-only fields** and will be
    stripped. Record his recalculated Threat Rating in the biography and state
    that these two ratings are deliberately unavailable on a character sheet —
    the stat-block validator must not assert them for Stone.
- **Powers and Weaknesses are not npc fields.** They exist only on `SpiritData`,
  and switching the insects to `spirit` is worse: `SpiritData.prepareDerivedData`
  **overwrites** printed attributes from Force/domain, which is exactly what the
  audit is trying to stop. So under the current system these are **prose**, in the
  **actor biography only** — the encounter journals are out of scope in this
  plan, so promising them there would be a contradiction. The plan says so instead of implying the
  sheet models them. First-class NPC powers/weaknesses is filed as follow-up
  system work, explicitly out of scope here.
- **Astral initiative +5 is a manual note.** `NPCData` has one reaction and one
  initiative tuple and no astral mode; `initiative.mod` is extra dice, not an
  astral-only bonus. Do not bake +5 into `reaction` (it would inflate dodge and
  defence too).
- **Essence: store the exact printed number.** 1, 3 and 5 all fit under
  `max: 6`; only the `A` qualifier is unrepresentable, and that goes in the bio.
  The previous draft's "keep the field ≤6 and put the true value in the bio"
  wrongly implied the numbers themselves needed approximating.

### Step 6 — Existing worlds: a separate, non-destructive procedure

Installing a module update does **not** rewrite world documents. Pinned ids make
a re-import *update in place* rather than duplicate, which is necessary but not
sufficient. Re-import matches purely on `_id` (`prepareImport` partitions on
`collection.has(d._id)`) and then overwrites matching actors wholesale with
`diff:false, recursive:false` after a single warning. Two things follow:

- a pinned id matches **any** world actor with that id, not only one imported
  from Queen Euphoria;
- **GM edits to a matching actor are overwritten**, not merged.

`docs/UPGRADING.md` must therefore tell the GM to **duplicate or export any
actor they have edited before re-importing**, and to run the report macro first
to see exactly which world actors and tokens match by id and name. The macro
lists the retired `e6c0660fae6813ab` too. It reports; it never deletes.

### Step 7 — Verification

Beyond "stats match the data file":

- global **id uniqueness**; all **17 retained** ids present; every **reserved
  retired** id absent and never reused;
- emitted **filename set == expected roster** (catches stale files);
- **Adventure bundle == source packs** (no divergence);
- every actor's **portrait exists on disk**;
- embedded items validate against the item schema;
- `hostUuid` (and the elemental links) **resolve after a real Adventure import**,
  not just textually;
- **two import tests, not one.** A clean import proves the content loads; it does
  NOT exercise the riskiest path. Also re-import over a **v0.2.0 fixture world**
  containing Stone plus both a linked and an unlinked token of him, and verify
  that updating him in place from `npc` to `character` preserves the token
  references and replaces the old embedded items rather than merging them;
- prototype token dimensions/disposition, actor type, and ownership unchanged
  where not deliberately altered.

## Key decisions & tradeoffs

1. **Pin ids explicitly; regenerate everything else.** Determinism for content,
   stability for identity — the two must not be conflated.
2. **Stone becomes a `character`.** The only way the spells are playable.
3. **Bound elementals: real linked `spirit` actors** — but only *because* Stone
   becomes a character, with permanent ids, reciprocal `conjurerUuid`, and an
   import test proving the UUIDs resolve. Without those prerequisites, notes
   would be more honest than links that silently vanish.
4. **Powers/Weaknesses stay prose for now**, stated plainly rather than promised.

## Risks / open questions

1. ~~Vehicle armour~~ — **RULED (futurekill, 2026-08-02): apply the conversion
   rules; we are building for SR2, so all the updates apply.** Core p.283,
   verified at 300 dpi: *"Multiply the Vehicle Armor Ratings… by 3 to make the
   values compatible with the SRII rules. Also, divide the armor cost by 3, and
   multiply the maximum allowed by 3."* All three QE vehicles print Armor 1, so
   each becomes **Armor 3**.
2. ~~Lone Star attributes~~ — **RULED: use SR2's own stats.** SR2 core p.205
   prints a **Corporate Security Guard** archetype: Body 4, Quickness 3,
   Strength 3, Charisma 2, Intelligence 2, Willpower 2, Essence 6, Reaction 2,
   **Professional Rating 2**; Etiquette (Corporate) 2, Firearms 3,
   Interrogation 2, Unarmed Combat 3.

   **This is identical to QE's own printed Pacific Towers Security Guard
   (p.15)** — same eight attributes, same skills except SR2 adds Interrogation 2.
   That is a strong cross-check: the SR1 adventure and the SR2 core are printing
   the same archetype, so using it for the Lone Star officers is not a
   substitution so much as the same block by its SR2 name. It also supplies the
   **Professional Rating**, which the QE blocks omit.

   Lone Star officers keep their **printed p.14 gear** (Browning Max-Power 4M2,
   stun baton 5L2 Stun + Special, Armor Vest 2/1) on top of these attributes.
3. **Five** new portraits needed (Pride, Burroughs, The Strice Boys, and the two
   Force-5 Soldiers); the three elementals reuse the `sr2e` system's existing
   spirit portraits. Image-gen credits available since 2026-08-01.
4. The insects' **Weaknesses are the intended route to winning the climax** and
   will only be prose. Acceptable for a GM-facing module, but it is the strongest
   argument for doing the system work later.

## Out of scope

- The six battlemaps; encounter journals; Legwork dossiers.
- First-class NPC powers/weaknesses in the `sr2e` system (follow-up).
- Any automatic mutation of an existing world.
