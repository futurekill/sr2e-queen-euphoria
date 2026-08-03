# Plan: rebuild the Queen Euphoria actors from the printed stat blocks
_Round 3 — Step 5 rewritten after the NPC-sheet finding; both rulings resolved_

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
  Fire F4, Earth F5) — plus the **3 vehicles** above, for 11 new documents total.

  **Pride's block is now fully transcribed** (audit re-read 2026-08-03). The
  first crop stopped short and lost **Body 6**, **Armed Combat 4** and three
  spells (**Fireball 5, Mind Probe 6, Entertainment 3**); all are captured. He is
  a Lion-totem full magician with Magic 6 and a printed **Magic Pool of 4**, so he
  depends on the Step 5 sheet fix exactly as Craft and Stone do.

**Final roster: 28 actors** (18 shipped − 1 retired + 8 net-new + **3 vehicles**).
The vehicles were absent from the Round-2 count only because they were blocked on
the armour ruling; that ruling has landed, so they are in.

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

**Vehicles (3) — unblocked, and all three already exist in the system pack.**
`../sr2e-foundryvtt/packs-src/vehicles/` ships **Mitsubishi Nightsky**, **Ford
Americar** and **Northrup PRC-42B Wasp**, each with a portrait. So these are
**method A** substitutions — the same call already made for Craft's Predator
(printed `4M2` → the SR2 catalogue's 9M) — not SR1 numbers carried across:

| | QE printed (SR1) | SR2 catalogue | built as |
|---|---|---|---|
| Mitsubishi Nightsky | H4 S45/120 B5 **A1** Sig4 Pilot4 250,000¥ | H4 S120 B4 **A2** Sig2 Pilot0 250,000¥ | SR2 entry + QE notes |
| Ford Americar | H4 S45/135 B3 **A1** Sig2 Pilot2 80,000¥ | H4 S105 B3 **A0** Sig2 Pilot0 20,000¥ | SR2 entry + security variant |
| Northrup PRC-42**D** Wasp | H3 S65/100 B1 **A1** Sig5 Pilot0 340,000¥ | **42B**: H3 S130 B2 **A0** Sig3 Pilot0 122,000¥ | 42B chassis + **Armor 3** + LMG |

*(Ruled by futurekill 2026-08-03 — see Risks #1. This is a superseding ruling,
not an inference: method A changes more than armour, so it was put back to the
user rather than decided in the plan.)*

**This supersedes the flat "all three go Armor 1 → 3" stated when the first
ruling landed.** The ×3 rule converts SR1 armour that is actually being carried
over;
after a method-A substitution nothing is carried over, and the SR2 entry already
prints SR2-scale armour. Applying ×3 *and* substituting would double-count. So:

- **Nightsky, Americar** — take the SR2 entry wholesale (Armor 2 and 0 as
  printed there). QE deltas on top: the Nightsky *"has no concealed weaponry"*
  and carries the autopilot the adventure gives it; the Americar is the security
  variant with a two-way radio and QE's 80,000¥ price.
- **PRC-42D Wasp** — the D variant is **not** in SR2, so the ×3 rule does apply
  to it: printed **Armor 1 → 3** (QE explicitly calls the armour Ares Armorflex).
  Built on the 42B chassis, renamed, plus the printed **LMG under the nose
  [100 (Belt, internal), Laser Sight, `5S3`]** rigged for automatic 6 shots with
  no Recoil Modifier. `5S3` folds by method B to **8S**.
- Pilot: *"for the pilot, use the Knight Errant Security Guard above, but
  substitute Rotor for Car at the same value"* — so the Wasp's pilot is the p.19
  block with Car 3 → Rotor 3. That is a **note**, not a 26th actor.

Art is free: all three reuse the system's existing vehicle portraits.

### Step 5 — Fix the sheet once, in the system  *(revised — Round 3)*

The Round-2 draft said **"Stone must be a `character`, not an `npc`"**, because
the NPC sheet renders no spells. The premise is right and the conclusion was
wrong: that is a fact about the *sheet*, not about Stone. Re-checked against the
system repo:

- `actor-sheet.mjs:1137` computes `context.spells` for the NPC sheet;
- `npc-sheet.hbs` never references it (Skills and Weapons are its only item
  sections);
- `actor-sheet.mjs:1113` — the NPC action map has no `castSpell`.

So **Craft has already shipped with eight invisible spells**, and the audit
marked him CLEAN because it only compared numbers. Pride (6 spells) would have
shipped the same way. Three actors, one cause.

**Do the system fix instead.** In `../sr2e-foundryvtt` *(scope widened in Round 4
— casting alone is not playable)*:

1. `npc-sheet.hbs` — a **Spells** fieldset mirroring the existing Weapons one:
   name → `data-action="castSpell"`, Force, a **sustain toggle** →
   `data-action="toggleSustain"`, and edit;
2. `npc-sheet.hbs` — a **Foci** fieldset (name, type, Force, bonded state, edit);
3. `actor-sheet.mjs:1134` — the NPC `_prepareContext` computes `skills`,
   `weapons`, `gear` and `spells` but **not `foci`**; add
   `context.foci = actor.items.filter(i => i.type === "focus")`, or the fieldset
   renders empty and Craft's focus stays unreachable;
4. the NPC sheet's action map — register **`castSpell: SHARED_ACTIONS.castSpell`**
   and **`toggleSustain: SHARED_ACTIONS.toggleSustain`**. *Not* `onCastSpell`:
   that name is never exported from `sheet-actions.mjs` and never imported by
   `actor-sheet.mjs:4`, and `toggleSustain` is an inline function on
   `SHARED_ACTIONS` (`sheet-actions.mjs:3164`) with no standalone binding at all.
   `SHARED_ACTIONS` *is* already imported.

Both fieldsets render only when the actor has such items, so no existing NPC
sheet changes appearance.

**Why the sustain toggle is not optional.** A successful sustained spell calls
`setSustaining(true)` automatically (`item.mjs:1378`), and the Active Effects it
copies onto the caster are removed **only** by `setSustaining(false)`
(`item.mjs:1051`). Without the toggle, an NPC who casts Armor or Mask can never
drop it, and hand-editing the item leaves orphaned effects behind. Craft has five
sustained-capable spells, so this would have bitten on his first cast.

**The Foci fieldset is read-only on purpose.** The *character* magic tab has no
focus-active toggle either — `system.active` is set through the item sheet via
`editItem`, which the NPC action map already has. Matching that rather than
inventing new NPC-only UX keeps the two sheets consistent.

`onCastSpell` is already actor-type-agnostic (`this.document.items` →
`promptSpellOptions` → `item.roll`), and `NPCData` already declares
`magic{value,max,tradition,type,totem}` and `dicePools.magic`. This is a smaller
diff than converting one actor, and it fixes every content module at once
(Double Exposure's casters have the same latent problem).

**What that buys the rebuild.** All three magicians stay `npc`, which means they
keep `professionalRating` and `threatRating` — both NPC-only fields that a
`character` conversion would have stripped — and none of them inherits
`CharacterData.chargen.inProgress` defaulting to `true`. The Round-2 draft's two
special-case workarounds for Stone are both deleted rather than generalised to
three actors.

**Craft's Sleep Spell Focus becomes a real `focus` item, shipped INACTIVE.**
It is currently biography prose, so the printed +2 never reaches a roll. The
bonus loop (`item.mjs:1148`) is actor-type-agnostic and needs only
`focusType: "spell", bonded: true, active: true` — but it also sums **every**
active bonded spell focus into **every** spell, because `FocusData` does not bind
a focus to a category. Shipping it active would therefore hand Craft +2 on Mana
Bolt as well, which the page does not grant. So it ships `bonded: true,
active: false`, exactly as a player's would, and the GM activates it when he
casts Sleep — **and deactivates it afterwards**, since the bonus is global while
active. That instruction goes in **Craft's biography only**; encounter journals
are out of scope in this plan (see Out of scope), so promising it there would be
the same contradiction Round 2 removed from the Powers/Weaknesses section.

**Magic pools are transcribed, not derived.** `NPCData.prepareDerivedData`
derives the combat pool but deliberately leaves `dicePools.magic` alone, so the
printed values survive exactly: **Stone Magic 7**, **Pride Magic 4**. This is
better than deriving them — the page is authoritative.

**The cost: Stone's three bound elementals lose their reciprocal link.**
`boundSpirits` is a `CharacterData` field; `NPCData` has none. The Round-2 draft
was explicit that linked spirit actors were justified *only* because Stone was
becoming a character, and that "without those prerequisites, notes would be more
honest than links that silently vanish." That reasoning still holds, so:
generate the three elementals as **standalone `spirit` actors** (they are useful
tokens for the fight and reuse the system's spirit portraits), record the printed
assignment verbatim in both Stone's bio and each elemental's, and **do not
fabricate a link the data model cannot hold**. Services stay 0/unknown with a GM
note, exactly as before — the page gives assignments, not service counts.

Unchanged from Round 2, and still true:

- **Powers and Weaknesses are not npc fields.** They exist only on `SpiritData`,
  and switching the insects to `spirit` is worse: `SpiritData.prepareDerivedData`
  **overwrites** printed attributes from Force/domain, which is exactly what this
  audit exists to stop. So they are **prose in the actor biography**. First-class
  NPC powers/weaknesses stays filed as follow-up system work.
- **Astral initiative +5 is a manual note.** `NPCData` has one reaction and one
  initiative tuple and no astral mode; `initiative.mod` is extra dice. Do not
  bake +5 into `reaction` — it would inflate dodge and defence too.
- **Essence: store the exact printed number.** 1, 3 and 5 all fit under `max: 6`;
  only the `A` qualifier is unrepresentable, and that goes in the bio.

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
- `hostUuid` **resolves after a real Adventure import**, not just textually.
  (Round 2 also asserted "the elemental links"; Step 5 removed those, so the
  assertion is dropped rather than left to fail. What replaces it: the three
  elementals exist as standalone `spirit` actors, and the printed assignment
  appears in **both** Stone's bio and each elemental's.)
- **two import tests, not one.** A clean import proves the content loads; it does
  NOT exercise the riskiest path. Also re-import over a **v0.2.0 fixture world**
  containing Stone plus both a linked and an unlinked token of him, and verify
  that the in-place update preserves the token references and **replaces** the
  old embedded items rather than merging them. (Round 2 framed this as an
  `npc`→`character` type change; with Step 5 revised there is no type change, but
  the item-replacement half is the part that was actually risky and it still
  needs proving — Stone's shipped data is Osprey's, so every item he owns is
  wrong and must go, not merge.)
- **Craft's spells are castable from his sheet** — the regression that motivated
  the Step 5 change, and the one thing no stat comparison would have caught.
  Initiating a cast is not enough on its own, so also prove the two features that
  Step 5 newly depends on:
  - a sustained spell cast by an NPC can be **dropped again**, and the Active
    Effects `setSustaining(true)` copied onto him are **gone** afterwards
    (`item.mjs:1051` is the only cleanup path — if the toggle is missing or
    mis-registered, the effects survive and silently keep modifying him);
  - **activating Craft's Sleep focus adds +2 dice and deactivating removes it** —
    which also demonstrates the global-bonus caveat that made `active: false` the
    right shipping default.
- prototype token dimensions/disposition, actor type, and ownership unchanged
  where not deliberately altered.

## Key decisions & tradeoffs

1. **Pin ids explicitly; regenerate everything else.** Determinism for content,
   stability for identity — the two must not be conflated.
2. **Fix the NPC sheet in the system; everyone stays an `npc`.** Two small
   changes in `sr2e-foundryvtt` beat converting three actors to `character` and
   losing their Professional/Threat Ratings — and they fix Double Exposure too.
3. **Bound elementals: standalone `spirit` actors, no fake link.** `NPCData` has
   no `boundSpirits`, and Round 2 already ruled that a link the model cannot hold
   is worse than a note. The printed assignment is recorded verbatim on both
   sides instead.
4. **Powers/Weaknesses stay prose for now**, stated plainly rather than promised.

## Risks / open questions

1. ~~Vehicle armour~~ — **RULED TWICE. The second ruling supersedes the first.**

   **First (2026-08-02):** *"apply the conversion rules; we are building for SR2,
   so all the updates apply."* Core p.283, verified at 300 dpi: *"Multiply the
   Vehicle Armor Ratings… by 3 to make the values compatible with the SRII rules.
   Also, divide the armor cost by 3, and multiply the maximum allowed by 3."*
   Read literally, all three QE vehicles print Armor 1 and each becomes Armor 3.

   **Then the vehicles turned out to already exist** in
   `../sr2e-foundryvtt/packs-src/vehicles/` — Mitsubishi Nightsky, Ford Americar
   and Northrup PRC-42B Wasp, with portraits. That opens **method A**
   (substitute the real SR2 item), which is what the module already did for
   Craft's Predator. But method A changes Body, Speed, Signature, Pilot and cost
   as well as armour, so it **supersedes** the armour ruling rather than
   implementing it. Codex flagged exactly that, correctly, and it was put back to
   futurekill instead of being decided here.

   **Second (2026-08-03) — RULED: use the SR2 compendium entries.** Chosen for
   consistency with how every weapon in the module was converted. Therefore:

   - **Nightsky** → SR2 entry: H4 S120 B4 **Armor 2** Sig2 Pilot0, 250,000¥.
   - **Americar** → SR2 entry: H4 S105 B3 **Armor 0** Sig2 Pilot0, **20,000¥**
     (not QE's 80,000¥ — the SR2 catalogue price comes with the substitution).
   - **PRC-42D Wasp** → the D variant is **not** in SR2, so it is the one vehicle
     where the ×3 armour ruling still applies: 42B chassis, printed **Armor 1 →
     3** (QE names the armour Ares Armorflex), plus the nose LMG (`5S3` → **8S**).

   So the ×3 rule survives on exactly one of the three, and **the earlier "all
   three become Armor 3" is superseded.** QE's adventure-specific facts remain as
   deltas on top: the Nightsky *"has no concealed weaponry"*, the Americar is the
   security variant with a two-way radio, and the Wasp's pilot is the p.19 Knight
   Errant block with Car 3 → Rotor 3.
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
   Force-5 Soldiers). The three elementals reuse the system's spirit portraits
   and the three vehicles reuse the system's vehicle portraits, so neither adds
   to the count. Image-gen credits available since 2026-08-01.
4. The insects' **Weaknesses are the intended route to winning the climax** and
   will only be prose. Acceptable for a GM-facing module, but it is the strongest
   argument for doing the system work later.

## Out of scope

- The six battlemaps; encounter journals; Legwork dossiers.
- First-class NPC powers/weaknesses in the `sr2e` system (follow-up).
- Any automatic mutation of an existing world.
