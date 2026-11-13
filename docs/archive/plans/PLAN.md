# Plan: Queen Euphoria — SR2E content module
_Locked via grill — by Claude + James; hardened by Codex review_

## Goal
Package FASA 7304 *Queen Euphoria* (Shadowrun **1st Edition**, ©1990) as a
standalone FoundryVTT V13 content module for the `sr2e` system, mirroring
`sr2e-double-exposure`'s structure (one-click **Adventure** bundle + Cast /
Journals / Scenes packs). SR1 content is **modernized to SR2E** against the
system's real data models. GM text is original prep, never verbatim book copy.
Codex review reframed this from "copy DE + fill in" to **"inventory the source
first, re-derive every stat from QE's own printed values against the SR2E
schema, and build in phases."** DE is a *reference*, not a template to clone.

## Approach (phased — Phase 1 is built first, per Codex's "simpler safer" note)

### Step 0 — Source inventory with expected counts (do BEFORE any generator)
Page-by-page matrix from the `_work/` OCR + renders: every encounter/location,
every named NPC (with mechanical role → actor vs journal), every insect form,
the full Strice Matrix node list, and each handout. Freeze **expected counts**
(encounters, actors by type, scenes, IC, handouts) so omissions are detectable.
Commit as `docs/SOURCE-INVENTORY.md`. Nothing generates until this exists.

### Step 0a — Extraction prerequisite (before Step 0)
Render + OCR the source into the module's git-ignored `_work/`: `pdftoppm`
(150dpi grayscale) + `tesseract` per page (already prototyped in scratch; move it
in). Verify the **page-number offset** (QE TOC shows book p.7 ≈ PDF pg-07, so
offset ≈ 0 — confirm before citing pages) and record the chosen resolution.
OCR is noisy — Step 0 and every stat transcription reads the page **render**.

### Step 1 — Scaffold `../sr2e-queen-euphoria`
`git init`; `module.json` (id `sr2e-queen-euphoria`, depends on `sr2e`, compat
min 13); four packs (`queen-euphoria` Adventure, `qe-actors`, `qe-journals`,
`qe-scenes`). Copy DE's `tools/` as a **starting point, then**: (a) enumerate
every substitution (ids, pack names, module id, asset paths, page refs,
descriptions, portraits) and (b) run a repo-wide grep for `double-exposure`,
`de-`, and DE-specific prose after wiring, failing the build if any remain.
Fix two DE tooling defects rather than inherit them:
- **`.gitignore`:** ignore **all** of `packs/` and rebuild it locally
  (`npm run build-packs`) and in release CI (DE's release workflow already runs
  `build-packs` from `packs-src` and ships the built LevelDB) — avoids committing
  churning generated databases. Drop DE's no-op `!packs/**/*.log` negation.
  `packs-src/` is the sole tracked source of truth.
- **Extractor symmetry:** add `journal: ["pages"]` to `extract-packs.mjs` (DE's
  builder splits journal pages but its extractor doesn't re-nest them, so a
  build→edit-in-Foundry→extract round trip drops page content). Prove it with a
  build→extract→diff before authoring journals.

### Step 2 — SR1→SR2E conversion checklist (`docs/CONVERSION.md`)
The keystone of "modernize." A per-category table — printed SR1 value → chosen
SR2 value → rationale/page — covering: attributes (carry 1:1), initiative
augmentation, skills + **concentrations→specializations**, armor layering,
weapon codes/ranges, cyberware **Essence** (note the ≤6 field cap, below),
spells (→ embedded SR2 spell **items**, not prose), pools, professional/threat
ratings, and Matrix procedures. Every actor cites the row that produced it.

### Step 3 — Cast actors (`gen-actors.mjs`, **type-specific emitters** — npc / host / ic)
Not one `npc()` helper (DE's mistake): schema-correct generators per type with
correct prototype-token config. Roster from Step 0. Principals: Craft (Ant
shaman), Euphoria, Robert Carrone. **Mechanically-opposed recurring NPCs get at
least a lightweight actor** (bodyguards, Osprey, Stone, Strice/venue security,
Lone Star/Knight Errant response) — the "social NPCs need no actor" cutoff was
too aggressive (negotiation/perception/resistance/surprise all roll dice); only
never-opposed names stay journal-only.
- **Craft's magic** is embedded **spell + skill items** with Sorcery/Conjuring
  and totem noted. **Decide his actor type up front** by an in-Foundry capability
  test (does the sheet actually roll his spells/drain?) and build **only the
  needed emitter** — add a schema-complete `character` emitter if he's a
  `character`, otherwise constrain him to `npc` once npc is shown to support
  spell/drain rolls. No guessing, no half-built type. The **Ant totem** is not a
  system-configured totem — encode its effects in his bio/journal; do not imply
  automation.

### Step 4 — Insect Hive, **re-derived from QE p.54–55** (not DE's ants)
QE's printed rules differ from DE: **Soldier** and **Worker** ant spirits only
(the **Queen is a non-combat set-piece** — "does not actually appear"); two
forms — **True Form** and **Flesh Form** (spirit possessing a human host, a
distinct actor/overlay); astral init **+5** (DE used +10); armor **2×Force**;
**Immunity to Normal Weapons** vs ranged; melee attackers use **Willpower** not
weapon skill. Model with the DE-proven `npc`+`race:"spirit"` shape but with QE's
numbers, and handle two schema traps Codex caught:
- **Essence cap:** `NPCData.essence` is `max:6` (verified `actor-data.mjs:773`);
  DE's Hive Queen (Essence 10) is **silently clamped** on import. Any Force>6
  spirit stores true Essence in the bio and keeps the field ≤6 (or ≤Force where
  legal). Verified, not assumed.
- **Reaction inflation:** baking the manifest/astral init bonus into `reaction`
  also inflates dodge/defense/Reaction tests. Prefer an **initiative-only**
  field if one exists; if not, keep Reaction = true value and state the manifest
  bonus prominently in the bio. Decide by reading the model, not by copying DE.
Choose `npc` over the first-class `spirit` actor deliberately: compare
field-by-field and accept the lost spirit-sheet services/conjurer-link
functionality (insect Force formulas don't match the generic spirit derivation).
**Mark the automation gaps as MANUAL rules** in each insect's bio + the journal
primer, with exact roll instructions — the ordinary NPC attack/resist workflow
will *not* enforce Immunity to Normal Weapons, ranged-only 2×Force armor, or
Willpower-instead-of-skill melee defense; the GM applies these by hand. The
smoke test (Step 8) exercises these specific procedures, not just "an ant fights."

### Step 5 — Strice Foods Matrix: **convert the printed system map** (QE p.34)
QE prints a full SR1 map — this is a conversion, not an invention. The SR2E
Matrix models a run as **decker-vs-a-single-host** (one `HostData.securityCode`,
pushed to linked IC via `ICData.hostUuid` — verified `actor-data.mjs:1120,1156`);
there is **no node-traversal mechanic**. So model **one Strice `host` actor** at
one explicit representative Security Code + System Rating (the CPU/SAN tier).
**Copy each printed IC rating directly** — the SR1 numbers (Trace-and-Dump 3,
Tar Pit 4, Barrier 3/4, Scramble 3) *are* the IC ratings. A node's color-code
governs required successes + IC Reaction Time and its numeric part sets
system-operation TNs; since all linked IC inherit the one representative host
code, **per-node operation TNs, success thresholds, and Reaction-Time
differences are MANUAL** (documented in the journal). Record the full node map +
paydata in the host bio + journal so nothing is lost:
- SAN Red-5 Access 5; SPU-1 Orange-3 Trace-and-Dump 3; CPU Orange-4 Barrier 3
  Tar Pit 4; DS-1 Orange-3 Barrier 4 (28,000¥, the MegaMedia/Knight Errant
  clues); DS-2 Orange-5 Scramble 3 (60,000¥); DS-3 Green-3 (4,000¥).
- *(Push-back on Codex #1's "one host per node": 7 host actors would be 7
  disconnected objects — the system can't link or traverse them — so it adds
  objects, not fidelity. Printed IC ratings are copied directly; per-node codes
  drive the manual operation thresholds and Reaction Time. If James later wants
  per-datastore granularity, host-per-node is a Phase-2 option.)*
- Set the host's Security Code, System Rating, and initial alert explicitly. The
  **link lives on each IC**: set `system.hostUuid` on every defending IC to the
  host's stable world UUID (`Actor.<stableId>`), not a list on the host. Build
  each IC by exact schema (type, rating, hostUuid, condition track) mapped from
  the SR1 IC — Trace-and-Dump, Tar Pit, Scramble, Barrier — not generic monsters.
  Note the external-alert → 2-minute-shutdown → Lone Star trigger.
- **Adventure-import link risk (Codex #3):** `hostUuid` resolves at runtime via
  `fromUuidSync`; a compendium/source id won't resolve to the imported world
  host. **Prototype early** — assemble a one-host+one-IC Adventure, import into a
  clean world, and confirm the imported IC's `hostUuid` resolves to the imported
  host (its Security Code/alert propagate). Fix assembly/remapping before
  authoring the full suite. This is a Phase-1 gate.

### Step 6 — Journals (`gen-journals.mjs`, original prep)
Overview/synopsis + running notes; per-encounter prep (paraphrased *Tell It To
Them Straight* / *Behind The Scenes* / mechanics, linked to Cast & Scenes);
Legwork dossiers; an "Insect Spirits in SR2E" primer; Picking Up The Pieces with
an **explicit reward mapping table** (individual/group/objective/survival karma
+ nuyen → SR2E awards, marking which are published vs newly recommended); and
Player Handouts as **wholly original** short copy (no scanned art, no reproduced
layout — page refs don't legalize derivative text).

### Step 7 — Scenes (`gen-scenes.mjs`, **plain labeled grids**)
Resolve the DE contradiction: placeholders are plain labeled grids sized to the
book's scale — **no walls/lighting/token geometry** until real maps exist (wall
coords against a generic placeholder are arbitrary and break when art is
swapped). One Scene per mapped location from Step 0.

### Step 8 — Assemble, validate, smoke-test
`gen-adventure.mjs` bundles the packs; `npm run build-packs`. **Extend the
validator** beyond DE's (JSON keys + dup top-level ids) to also check embedded
ids, asset-path existence, and actor/host/IC UUID links resolve. Then a **single
in-Foundry smoke** in James's live V13 world: import the Adventure once, confirm
Craft rolls a spell, an ant fights, and the Strice host escalates alert + an IC
fights. (A full clean-install CI round-trip matrix is out of scope for a
personal module — the live-world import is the proof.)

### Phasing
- **Phase 1 (internal playable build — NOT "complete"):** Steps 0a–1, the
  one-host+one-IC **import-resolution prototype** (gate), essential cast
  (principals + core combatants), the single Strice host + minimal IC, journals,
  plain scenes, Adventure bundle, validate + live-world import smoke. Has its
  **own reduced expected-count set** from Step 0 (labelled "Phase-1 subset"); it
  is a runnable internal build, not the inventory-complete release.
- **Phase 2 (completeness + release):** the remaining frozen Step-0 roster,
  reward/journal polish, richer IC, real map art. The **full** expected-count
  gate must pass here. "Complete" and any release (tag/push) are Phase 2 and a
  separate explicit go.

## Key decisions & tradeoffs
- **Modernize, re-derived from QE's own printed values** — attributes carry 1:1;
  skills/gear/spells/Matrix/rewards rebuilt to SR2E with a cited conversion row
  each. DE is reference code, not a template (its ids/prose/logic are DE-specific
  and one of its stat blocks ships a clamped Essence bug).
- **Insects from QE p.54, not DE** — Soldier+Worker, True+Flesh forms, Queen as
  set-piece, astral +5, armor 2×Force. `npc` over `spirit` deliberately.
- **Strice = one host, printed map converted** — single-host (multi-node
  unsupported), every SR1 node/IC/paydata mapped explicitly.
- **Principals + mechanically-opposed recurring NPCs** get actors; only
  never-rolled names stay journal-only.
- **Plain labeled scenes**, no geometry until real maps.
- **Content module only** — zero `sr2e` system changes.

## Risks / open questions
- SR1→SR2 conversion is judgment-heavy; mitigated by the cited `CONVERSION.md`
  table and the live-world smoke, expecting James to spot-fix post-playtest.
- Essence>6 and Reaction-inflation are schema traps with documented workarounds
  (verify against the model at build time, don't copy DE).
- Manifest insect **stat numbers** on p.54 are OCR-garbled into the page art —
  read the render to transcribe them.
- Host Security Code/System Rating aren't printed in SR1 terms — derived from the
  printed color-codes (Red-5/Orange/Green) with the mapping documented.

## Out of scope
- Verbatim SR1 text and reproduced/scanned art or layout (copyright) — original
  copy + page cites only; assets are generated/original, distribution stays
  private/personal (the release workflow just packages James's own zip).
- Real/final map art and scene geometry — out of scope for Phase 1 (done in Phase 2).
- Pregen PCs (QE ships none) and Sprawl Sites content (pointer only).
- Any `sr2e` system change; multi-node host topology; full CI clean-install/
  scripted-playtest matrices (a personal module — live-world smoke suffices).
