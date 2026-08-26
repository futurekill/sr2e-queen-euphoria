# Changelog

## Unreleased — Visual handouts

**Juan Diablo** joins the cast. The adventure names him at the first meet
(p.10) but prints no block — it says to use the Street Samurai archetype with
Gunnery 4. That is a 1st-edition pointer, so the stats here are the **SR2E**
Street Samurai (core p.62, read from a 300dpi render) plus the Gunnery 4 the
adventure adds, with the loadout QE specifies: Uzi III with shock pads and a
Smartgun Adapter, armored vest with plates, and an armed Harley — the bike
weaponry being the reason he has Gunnery at all. His portrait is cropped out of the *Off and Running* handout — he is the
razorguy on the Harley in it, so the face on his token and the scene the
players get shown are the same picture.


Twenty-one pieces of player-facing art, wired as image pages in a new
**Queen Euphoria — Visual Handouts** journal. Foundry shows image pages
full-bleed and a GM can right-click one and *Show Players*, which is the whole
point of them. Pages are in the order the adventure reaches them: the star and
her press, the Amber Gel campaign, the Act 1 meet, Pacific Towers, Royal
Meadows.

Three of the images are annotated **layout references, not battle maps** —
Pacific Towers lobby, Euphoria's condo, and the Royal Meadows flat. Their
captions say so and point at the matching playable scene, so nobody drops
tokens on a picture.

`npm run handouts` converts the delivered PNGs (kept in gitignored `_work/`,
never modified) to WebP capped at 1920px: 46.6MB becomes 3.7MB. The manifest at
`tools/data/qe-handouts.json` drives both the conversion and the journal pages,
so the two cannot drift apart. `npm run validate` now asserts every journal
image exists on disk — a missing handout used to be discoverable only by trying
to show it to five people.


## 0.2.0 — Cast & IC portraits

All 17 Queen Euphoria actors now have custom painterly portraits (square
1024px, rotation-locked): 13 cast NPCs and the 4 Strice IC as digital
constructs, replacing placeholder icons.

## 0.1.0 — Phase 1: the adventure

First release of *Queen Euphoria* (FASA 7304) for the SR2E system — the 1st-Ed
adventure modernized to SR2E (attributes 1:1; skills, gear, spells, decking and
rewards rebuilt with cited conversions). Four packs: **cast & combatants**
(`qe-actors`), **GM journals** (`qe-journals`, scene-by-scene prep + the reward
table converted to SR2E), **scene maps** (`qe-scenes`, labeled placeholder
grids), and the **Adventure bundle** (`queen-euphoria`) for one-click import.

- Scaffold: module.json (4 packs), tooling from Double Exposure with the
  extractor journal-page round-trip fixed; `packs/` git-ignored (rebuilt in CI).
- `docs/SOURCE-INVENTORY.md`: page-by-page inventory + Phase-1/Phase-2 counts.
- Plan locked via grill + 4 Codex rounds (see PLAN.md / PLAN-REVIEW-LOG.md).
