# Queen Euphoria — scene specification

Measured from the printed floorplans, which all carry a **`□ = 1 metre`** legend.
Scene pixel size is **metres × 100**, per the estate convention that a module
scene is 100 px/cell at 1 m. Battle maps must be real-scale — a 1080p-sized
background is not a map, it is a picture of one.

## How these were measured

Not by eye, and by **two different methods**, because the plans are not drawn
consistently.

**Method 1 — grid period.** Crop to the drawn grid, autocorrelate the dark-pixel
profile on each axis to recover the grid pitch, divide the block size by it. The
check that it worked is that the **X and Y periods come out equal**: the printed
grid is square, so an axis mismatch means the crop caught a caption or page rule
rather than the map.

**Method 2 — the legend square.** Two plans defeated method 1. Royal Meadows has
**no drawn grid at all** — it is a clean furnished plan whose only scale
reference is the legend — and the Hive Lower Level has large open areas with no
vertical hatch, which corrupts the X period. For those, measure the `□` legend
square itself and use it as the metre stick. The check here is that the legend
comes out square: Royal Meadows' measured 128 × 129 px, within 1 px.

Where both methods apply they agree — the Hive Lower Level gives 12.1 m by legend
and 12.5 m by grid period on the Y axis. And the two Hive levels independently
measure 24 × 12 and 23 × 12: the same building, which is the strongest
confirmation available that the method is sound.

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
| **The Hive — Lower Level** | 45 | 23 × 12 | 2300 × 1200 | 16 rooms, irregular plan. The climax. Elevator bottom-right; **Room 16 is the Hive Room**. Measured by legend (1 m = 44.5 px), cross-checked against the drawn grid pitch of 43 px. |
| **Royal Meadows Flat** | 12 | 8 × 3 | 800 × 300 | Living room/kitchenette, bedroom (two double beds crammed side by side), closet, bathroom. **No drawn grid** — measured off the legend square. 24 m² total, which is not an error: the text says these rented units are packed with people and crowded with extra beds. |

**All seven printed floorplans are now measured.** Nothing is outstanding.

### The Hive Lower Level is half the encounter journal already

Folio 45 prints the insect placements **room by room**, and the Forces it names
are exactly the ones the rebuilt actors carry — independent confirmation that the
roster is right:

| room | occupants |
|---|---|
| 1 | Elevator unloads here. Empty unless the Hive is alerted. |
| 2, 4–7, 9–13 | See Room 1. |
| 3 | Six **Flesh Form Workers (F1)**, two **Flesh Form Soldiers (F3)** |
| 8 | Stairway exit. Two **Flesh Form Workers (F1)** |
| 14 | Four **Flesh Form Workers (F1)**, two **Flesh Form Soldiers (F3)** |
| 15 | Five **Flesh Form Workers (F1)**, one **Flesh Form Soldier (F5)** |
| 16 | **The Hive Room** — the climax |

Two mechanics to carry onto the scene: the Lower Level is **fully dark, with no
power** — no light source at all — and **every internal wall is Barrier Rating 3**,
with the book explicitly noting that Soldiers making an all-out attack *"will use
the thin walls to their advantage"*. Walls should be built breakable, not as
hard scene boundaries.

## Art

Backgrounds must be **original art**, not the scanned plan — the module's
copyright stance is no reproduced layout. So these dimensions and room keys are
the brief for generated art, not a tracing target. The room list per scene above
is what the art has to satisfy; the metre figures are what the scene document
must be set to regardless of what the art looks like.


## Walls

**Perimeter walls are built on all nine scenes**, derived from the same measured
dimensions as the background, so the two cannot drift apart. On the dark Hive
Lower Level this also stops vision leaking past the building envelope.

`gen-scenes.mjs` takes an optional per-scene `interior` list — wall segments in
**metres**, with `door` and `breakable` flags — and emits them alongside the
perimeter. The machinery is done; the segment data is not.

### Why interior walls were not auto-extracted

The obvious approach is the one that worked for dimensions: profile the plan's
dark pixels and call a column that is dark down most of its height a wall. It
finds nothing. **Interior walls are broken by doorways**, so no interior wall is
ever continuous down its full extent — at a threshold loose enough to catch them
(0.55) the same test also catches bed and counter edges, and at a threshold tight
enough to reject furniture (0.75+) only the perimeter survives. Verified on Royal
Meadows: the loose pass returned eight candidate lines of which most are
furniture, the tight pass returned exactly the two outer walls.

Extracting them properly needs **line-segment detection** (Hough or connected
components) that can join collinear fragments across a door gap and report the
gap as the door. That is a real piece of work, not a threshold tweak.

**Estimating the positions by eye was the other option and it was rejected.** A
wall half a metre out of place is worse than no wall: it silently changes cover,
line of sight and movement cost in a way nobody will question mid-fight, and the
whole point of measuring these plans was to stop shipping numbers that came from
somewhere other than the page.
