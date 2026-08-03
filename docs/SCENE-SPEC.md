# Queen Euphoria — scene specification

Measured from the printed floorplans, which all carry a **`□ = 1 metre`** legend.
Scene pixel size is **metres × 100**, per the estate convention that a module
scene is 100 px/cell at 1 m. Battle maps must be real-scale — a 1080p-sized
background is not a map, it is a picture of one.

## How these were measured

Not by eye. Each floorplan is cropped to the grid block, then the dark-pixel
profile along each axis is autocorrelated to recover the grid period in pixels;
block width ÷ period = metres. **The check that it worked is that the X and Y
periods come out equal** — the printed grid is square, so an axis mismatch means
the crop caught a caption or a page rule instead of the map. Every measurement
below passed that check.

Where the printed map is an irregular shape (the Hive), the figure is the
**bounding box**, which is what a Foundry scene needs.

## The scene list was wrong, independently of the actors

The module ships **six** scenes. The adventure prints **seven** floorplans, and
the two sets do not match:

| module scene | printed floorplan? |
|---|---|
| Euphoria's Penthouse | ✅ folio 18 ("Euphoria's Condo") |
| Pacific Towers | ✅ folio 14 (Lobby) |
| Magic Crafts Shop | ⚠️ folio 40 prints **two levels**; the module has one scene |
| The Hive | ⚠️ folios 44 **and** 45 are two levels; the module has one scene |
| MegaMedia Office | ❌ **no printed floorplan exists** |
| MegaMedia Studio | ❌ **no printed floorplan exists** |
| — | ❌ **Royal Meadows Flat** (folio 12) has a floorplan and no scene |

So three printed maps have no scene (Magic Shop's second level, the Hive's Lower
Level, Royal Meadows), and two scenes were invented for locations the book never
mapped. This is the same failure mode the actor audit found — content that came
from somewhere other than the page — and it was found the same way: by going back
to the page and counting.

**Royal Meadows matters.** It is the flat where Euphoria is held early in the
adventure, keyed with a full room list. It is not a minor location.

The two MegaMedia scenes are not necessarily wrong to *exist* — the adventure has
scenes set there — but they must be labelled as **GM-invented layouts**, not
presented as if derived from a floorplan.

## Measured scenes

| scene | folio | metres | scene px | notes |
|---|---|---|---|---|
| **Pacific Towers Lobby** | 14 | 27 × 20 | 2700 × 2000 | 10 keyed areas; guard station, bar, meeting + lecture rooms, store, garden courtyard, storeroom, two restrooms, pool. Three elevators (E). |
| **Euphoria's Condo** | 18 | 25 × 24 | 2500 × 2400 | 14 keyed rooms; entrance hall, foyer, living room, recording studio, greenhouse balcony, workout room, closet, bathroom, kitchen, dining, Osprey's bedroom, spare bedroom (Stone's), master bedroom, master bathroom. One elevator (E). |
| **Magic Shop — Lower Level** | 40 | 17 × 6 | 1700 × 600 | Rooms 2–4: living area, bathroom, bedroom (the blood-splattered one). |
| **Magic Shop — Upper Level** | 40 | 17 × 6 | 1700 × 600 | Room 1, the main store area. Same grid pitch as the lower level. |
| **The Hive — Main Level** | 44 | 24 × 12 | 2400 × 1200 | Bounding box of an L-shaped plan. Loading dock, Amber Gel processing equipment, freight elevator, small office group, stairway to roof and down. |

## Not yet measured

| scene | folio | why |
|---|---|---|
| **Royal Meadows Flat** | 12 | The automatic grid-block finder failed on both of these — they need a visual crop the way the five above were done. Straightforward, just not yet done. |
| **The Hive — Lower Level** | 45 | as above |

The Lower Level is worth doing carefully: it is the climax, and **folio 45 prints
the insect placements room by room** — Room 3 holds six Flesh Form Workers
(Force 1) and two Flesh Form Soldiers (Force 3), Room 8 two Workers, Room 14 four
Workers and two Soldiers, with rooms 4–7 and 9–13 repeating Room 1. Those are
exactly the Forces the rebuilt actors now use, which is a nice independent
confirmation that the roster is right. The rooms have **Barrier Rating 3** walls
and the Soldiers are explicitly said to attack *through* them.

## Art

Backgrounds must be **original art**, not the scanned plan — the module's
copyright stance is no reproduced layout. So these dimensions and room keys are
the brief for generated art, not a tracing target. The room list per scene above
is what the art has to satisfy; the metre figures are what the scene document
must be set to regardless of what the art looks like.
