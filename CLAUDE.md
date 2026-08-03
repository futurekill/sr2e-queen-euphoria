# Queen Euphoria Module — Development Notes

A FoundryVTT **V13** content module packaging the *Queen Euphoria* adventure
(FASA 7304) for the **Shadowrun 2nd Edition system** (`sr2e`). Separate package
from the system: its own repo, its own packs, no shared code. It depends on the
system via `module.json` → `relationships.systems` (sr2e ≥ 0.30.0), so its
actors use the system's data models and sheets.

The sibling system repo lives at `../sr2e-foundryvtt`; the reference content
module is `../sr2e-double-exposure` (DE). Read the system's `CLAUDE.md` for the
data-model contract. **DE is a reference, not a template to clone** — its ids,
prose, and one stat block (Hive Queen Essence 10, silently clamped by the NPC
model's `max:6`) are DE-specific; re-derive everything from QE's own printed
values. The full locked plan is `PLAN.md` (grilled + 4 Codex rounds → APPROVED).

## Source material
Queen Euphoria is **1st Edition** (©1990) — this module **modernizes it to
SR2E**. The official conversion procedure is the core rulebook's **UPDATING
ADVENTURES** section (SRII book p.283): recalculate Threat Ratings per SRII,
translate weapon and spell codes to their 2nd-ed versions, and for a unique SR1
three-digit Damage Code either substitute a comparable SR2 item **or** add the
staging digit to Power (`4M3 → 7M`). Findings and per-item decisions live in
`docs/CONVERSION-AUDIT.md`.

**The source PDF was replaced on 2026-08-02** with the owner's purchased
DriveThruRPG copy (watermarked "James Candalino (Order #52723605)"),
`../Shadowrun 1e - Queen Euphoria {FASA7304}.pdf`. Two things changed, and both
invalidate the old workflow:

- **It has a real text layer.** `pdftotext -layout` works directly; the old
  tesseract OCR pass is obsolete. Verified against a 300dpi render of book p.19
  — every attribute and damage code matched exactly.
- **The page offset is now +2, not 0.** Book folio N = PDF page N+2
  (book p.19 = PDF 21). 71 pages, folios 2–65. Any citation written before this
  date assumed offset 0 and must be re-checked.

Still true: **verify any number on the render before trusting it.** The text
layer is itself OCR-derived and mangles digits — observed `"t 5 (clip)"` for
`15 (clip)` and `"t ,000 nuyen"` for `1,000 nuyen`. Prose is reliable; digits
are not. `_work/` (git-ignored, never shipped) holds the page renders.

**And it truncates.** A `pdftotext` sweep returned Euphoria's gear as *"she wears
a Long Coat"* with the `(4/2)` silently dropped onto the next line, which read as
invented armour until the render showed it printed. Earlier, `Survival Knife
[6L3]` came through as `6L3J` and a `\b`-anchored scan skipped two whole pages.
Both were **false findings** — the sweep said something was wrong when it was
fine. So: the text layer is for *locating* a line and never for *trusting* one,
and that cuts both ways. Render before concluding something is wrong, not only
before concluding it is right.

**The printed maps carry a `□ = 1 meter` scale legend**, so scene dimensions are
derivable directly from the floorplans — count grid squares, don't estimate.

## Authoring conventions
- **Cast** are `npc` actors (principals: Craft, Euphoria, Carrone; plus
  mechanically-opposed recurring NPCs — Knight Errant and Pacific Towers guards,
  Osprey, Stone, Pride, the Strice Boys, Burroughs, Lone Star).
  **The npc-vs-character question is settled: everyone stays `npc`.** It was open
  because the NPC sheet rendered no spells, which would have made Craft, Stone and
  Pride unplayable — Craft shipped that way for two releases with eight invisible,
  uncastable spells. Fixed in the system (sr2e 0.88.1+) rather than per-actor:
  `npc-sheet.hbs` now has Spells and Foci sections and the NPC action map has
  `castSpell` + `toggleSustain`. Keeping them as NPCs preserves
  `professionalRating` and `threatRating`, which are NPC-only and would be
  stripped by a `character` conversion.
  Consequence to remember: **`NPCData` has no `boundSpirits`**, so Stone's three
  bound elementals are standalone `spirit` actors with the assignment recorded in
  prose on both sides — do not fabricate a link the model cannot hold.
  Also: `NPCData.prepareDerivedData` derives the **combat** pool but leaves
  `dicePools.magic` alone, so a transcribed Magic Pool survives exactly. Use the
  printed number (Stone 7, Pride 4) rather than deriving one.
- **Insect Hive** — **the book prints full SR1 critter tables; transcribe them.**
  An earlier note here claimed QE gives only rules and no attribute table, and
  told you to Force-scale DE's ants instead. That is wrong and it produced four
  invented actors. The printed blocks (all verified at 300 dpi) are:
  **Flesh Worker F1** (p.47), **Flesh Soldiers F3/F5** (p.49/50),
  **True Soldiers F3/F5** (p.51/52), plus a singular True Soldier F3 (p.38).
  Full tables in `docs/CONVERSION-AUDIT.md`. Three DE assumptions the printed
  stats contradict: armour is **Force ×1 and only on True Forms** (not 2×Force,
  and Flesh Forms have none); **Immunity to Normal Weapons is NOT a printed
  power**; and the Flesh Soldiers use an ordinary **Unarmed Combat 3**, not
  Willpower. Astral init **+5** was right. Do not lose **Paralyzing Touch** and
  **Venom** — OCR truncates the Powers line, so read the render. The
  **Weaknesses** (Reduced Senses (Sight), Vulnerability to insecticide) are the
  intended route to winning the climax and must reach the sheet.
  One schema trap remains: baking the astral init bonus into `reaction` also
  inflates dodge/defense — prefer an init-only field.
  **The Essence note used to be wrong and is now corrected:** store the *exact*
  printed number. The printed values are 1, 3 and 5, all of which fit under
  `max: 6` with no approximation; only the `A` qualifier is unrepresentable and
  that goes in the bio. The old "keep the field ≤6" wording implied the numbers
  themselves needed rounding, which they do not.
- **Strice Matrix** — convert the printed system map (QE p.34) to **one** `host`
  actor (multi-node hosts are unsupported) at one representative Security Code;
  copy each printed IC rating directly (Trace-and-Dump 3, Tar Pit 4, Barrier 3/4,
  Scramble 3); the IC→host link lives on each IC's `system.hostUuid`
  (`Actor.<stableId>`). Per-node operation TNs / success thresholds / Reaction
  Time are MANUAL (linked IC inherit the one host code). Prototype the
  Adventure-import UUID resolution early (Phase-1 gate).
- **Journals** — original GM prep (paraphrase + page refs), never verbatim book
  text; reward table converted to SR2E in Picking Up The Pieces.
- **Handouts** — wholly original short copy (no scanned art, no reproduced layout).
- **Scenes** — plain labeled placeholder grids (no walls/lighting/geometry until
  real maps exist; those are Phase 2).

## Build workflow
`packs-src/` (per-document JSON) is the source of truth; `packs/` is the LevelDB
build (**git-ignored** — rebuilt locally and in release CI). Generators emit the
JSON, then `npm run build-packs [name]`. `tools/build-packs.mjs` splits journal
`pages`; `tools/extract-packs.mjs` re-nests them (fixed here — DE's omitted it).
After copying any DE tooling, grep for leftover `double-exposure` / `de-` / DE
prose and fail if any remain.

## Copyright
*Queen Euphoria* / *Shadowrun* are © FASA and rights holders. This module is for
the owner's **personal** table use from a PDF they own, not for distribution.
Keep `_work/` out of git; original copy only in journals/handouts.
