# Battle-map art: generate the map, fit the walls to it

_Rewritten 2026-09-16, after three maps were approved. The previous plan is kept
at `docs/PLAN-battlemap-art-SUPERSEDED.md` because its reasoning is worth
reading — it is a well-argued case for the wrong trade._

## What the old plan got wrong

It ruled out whole-image generation on one premise:

> A battle map has to align to a 1 m grid: a wall must sit exactly on a cell
> boundary [...] No diffusion model places geometry to the pixel.

The premise is true. The weight on it was wrong. **Foundry walls are separate
vector objects.** They do not have to coincide with the painted walls to the
pixel — they have to agree with what a player can see. Nothing in the two
Double Exposure maps futurekill likes sits on a cell boundary, and they play
fine.

What the composite bought in pixel-exact alignment, it paid for in everything
that makes a map read as a place:

| | composited | generated |
|---|---|---|
| light | flat ambient, no source anywhere | real fixtures, pooled light, cast shadows |
| ground | one 4 m tile repeating ~6x per room | unique everywhere |
| furniture | sprites pasted flat, no contact | sits on the floor, occludes, shadows |
| height | 1 px wall strokes | wall bands with thickness |
| direction | textures and props from separate batches | one coherent pass |

The verdict from the table was blunt: *"these maps have been crap."*

## What actually works

Whole-image generation **with the floorplan supplied as an image reference.**

The condo's first attempt failed the opposite way — generated with no layout
reference at all, it invented a floorplan nobody would live in (*"that's not
even close to how humans live"*). So neither pure approach is right:

- generate freely → looks like a place, layout is invented
- composite → layout is exact, looks like a diagram
- **generate against a reference → both**

## The procedure

1. **Get a floorplan reference.** In order of preference:
   - **Our own authored layout rendered as a schematic** (`tools/data/qe-scenes.json`
     → a labelled plan image). This is the best input. The generator followed it
     noticeably more closely than it followed guide art, there is no copyright
     question, and the layout it paints back is the one we asked for — Royal
     Meadows' walls fit with *no* adjustment.
   - A floorplan panel cropped from our own guide art.
   - Never a page scan.

   When two rectangles are one space (a room and its alcove), **erase the wall
   between them in the schematic** or the generator will paint one there.

2. **Add the interior renders** as further `-i` references for materials, palette
   and mood. They are what stop a luxury lobby coming out like a tenement.

3. **Prompt for a battle map, not a picture.** Flat orthographic top-down, floor
   as the subject, walls as bands seen from above, no grid, no labels, no text,
   no people, dark enough for light tokens. **Demand lighting explicitly** —
   uniform light is the single thing that makes a map look like a diagram.
   Ask for two variants; they cost almost nothing and futurekill picks.

4. **Scale to 100 px/m** (`widthM * 100` x `heightM * 100`).
   - *Below* target resolution: 2x Lanczos overshoot, unsharp, then back down.
     A direct 1.85x jump is mushier.
   - *Above* target: plain Lanczos reduction. The overshoot only adds ringing.

5. **Measure the ART, author the layout from it.** Overlay a 100 px grid on the
   scaled map, read the room rectangles off it, write them into
   `tools/data/qe-scenes.json`. The art is the authority for geometry now, not
   the printed plan.

6. **Set `externalArt: true`** on the scene. `gen-scenes.mjs` then skips the SVG
   compositor and leaves the raster alone, but still builds walls and doors from
   the rectangles. Without it the next run repaints the composite over a finished
   map — the way re-running `gen-portraits` once un-wired every Rigger Black Book
   vehicle portrait.

7. **Verify by overlay.** Draw the generated walls onto the map and look. Doors
   should land on painted doors.

Working examples: `tools/gen-lobby-map.sh`, `tools/gen-condo-map.sh`,
`tools/gen-royalmeadows-map.sh`.

## What survives from the old plan

- Geometry still lives in `tools/data/qe-scenes.json` and walls are still
  generated from it, so art and walls cannot drift.
- Everything is still deterministic and re-runnable, except the generation step
  itself — which is why the approved raster is committed and guarded.
- The SVG compositor is still there and still correct for a scene with no art.
  It is a good wireframe. It is not a good battle map.

## Still to do

The Hive Main and Lower levels are perimeter-only — their layouts must be
authored and signed off before art, exactly as before. Craft's Magic Shop
(both levels) and the two MegaMedia scenes already have layouts and are ready
for step 1.
