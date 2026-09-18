# Changelog



## 0.5.0 — Ward Street

### Added — Ward Street, outside Pacific Towers, night and day

There was no map for outside the building, and the players may well try to take
Euphoria as she crosses the pavement to a waiting car. Two scenes, 36 x 24 m:
**Pacific Towers — Ward Street (Night)** and **(Day)**.

They are the same street at different hours, not two streets that resemble each
other: the approved night map went into the daytime generation as an image
reference, and the night walls were then checked against the day art — every
building edge, the water, both opposite blocks and the door line land exactly.
One geometry, two backgrounds; switch scene for time of day.

The book prints no exterior plan, so the geometry is GM-invented and says so. The
tower frontage is set to the Lobby's measured 26 m with the door line centred on
it, so the two scenes agree when the players come out through the lobby, and the
four sets of double doors match p.14. For an exterior the layout describes
BUILDING MASSES rather than rooms, which walls the frontage, Elliott Bay and the
opposite blocks while leaving the carriageway completely open — walling the
street as a "room" would have been exactly wrong. The alley mouth opposite is
deliberate: a grab on the pavement needs somewhere to go that is not the road,
and four Lone Star officers arrive five minutes after the PANICBUTTON.

Named "Ward Street" rather than "Exterior" because a journal handout already
carries the name *Pacific Towers — Exterior* (the tower photo); Ward Street is
the book's own name for it.

## 0.4.0 — Real battle maps

### Changed — Euphoria's Condo and the Royal Meadows flat are real battle maps

Both generated whole with a floorplan supplied as an image reference, the same
way as the Lobby. The Condo had no room layout at all before — it now carries 15
rooms and 14 doors measured off the art. Royal Meadows was re-laid-out first:

- **The flat's internal hallway is gone.** The old plan ran a 0.8 m corridor the
  full width of a 24 m2 flat with every room opening off it, which belongs in a
  much larger apartment. The flat's own interior guide settles it — the front
  door opens straight into the living/kitchenette, and the closet is a shallow
  reach-in wardrobe with bifold louvre doors, not a room. The living room now
  turns a corner into a short open alcove serving the bath and the bedroom, and
  the only corridor left is the building's.

Its floorplan reference was OUR OWN authored layout rendered as a schematic
rather than a book scan, and the generator followed it noticeably more closely
than it followed the Pacific Towers guide art. That is now the preferred pattern
for the remaining scenes.

### Changed — the Pacific Towers Lobby is a real battle map

The composited maps read as diagrams, and the reason was a bad trade in
`PLAN-battlemap-art.md`. It ruled out whole-image generation because a diffusion
model cannot place a wall on a grid line. True, and over-weighted: Foundry walls
are separate vector objects that only have to agree with what a player can SEE.
What the composite bought in pixel-exact alignment it paid for in flat ambient
light, one floor tile repeating six times a room, and props pasted with no
contact shadow.

The Lobby is now generated whole, with the floorplan supplied as an image
REFERENCE so the layout still comes from the book — the missing half of the
earlier condo attempt, which was generated with no layout reference at all and
invented a floorplan nobody would live in. Room rectangles and walls are now
measured off the ART; the doors land on the painted doors.

- `externalArt: true` on a scene makes the generator skip the SVG compositor and
  leave the raster alone. Without it, re-running silently paints the composite
  back over a finished map — the way re-running gen-portraits once un-wired every
  Rigger Black Book vehicle portrait.

### Fixed — every material tile was a kaleidoscope

The generator's cheap route to "seamless" is to mirror one quadrant into all
four. It *is* seamless, and the mirror axes read as hard diagonal lattices across
the floor. All ten tiles were built this way, including the four from August, so
Royal Meadows has it too. `tools/check-textures.mjs` is now a build gate that
measures both axes and rejects a mirrored tile; the prompt forbids it explicitly.
Six new lobby materials pass; **the four original tiles still need regenerating.**

## 0.3.1 — Paparazzi

### Added
- Four **paparazzi shots of Euphoria**, bringing the visual handouts to 25. They
  sit between her portrait and the Amber Gel campaign — the press pack a team
  would study while casing her. The Elysium shot shows Knight Errant riot armour
  plainly marked, which makes it the one to put in front of players doing the
  *Security Around Euphoria* legwork (p.58).

## 0.3.0 — Visual handouts, the Act 1 cast, and the real Player Handouts

### Changed
- **Player Handouts are now verbatim transcriptions** of the four handouts the
  book prints (p.63–65), replacing text that had been authored from scratch and
  matched nothing in the adventure. Book typos are preserved deliberately —
  "conclusionn", "neccessary", "MEGAGMEDIA", and the MegaMedia clause numbering
  that restarts at 5 — so what the players read is what the book prints.

### Fixed
- **Every NPC was silently missing most of their items.** `itemId` hex-ENCODED
  `kind:name:seq` instead of hashing it; hex doubles the length, so
  `slice(0,16)` kept only the first four characters — `skil`, `weap`, `cybe` —
  and the name never reached the id. Every skill on an actor shared one id, and
  Foundry keeps the last document written under a given id. **137 of 195
  embedded items, 70%, never reached the table.** Juan Diablo imported with one
  skill out of seven and one weapon out of four. `npm run validate` now asserts
  embedded item ids are unique per actor.


**The Act 1 meet is now fully cast** — Juan Diablo, Mr. Johnson and Johnson's
bodyguard. All three are cropped out of the *Off and Running* handout: Diablo
on the Harley, Johnson facing camera by the Toyota Elite, and the chauffeur
holding its door, which is exactly his job in the book.

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
