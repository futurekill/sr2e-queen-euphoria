#!/bin/zsh
# Battle maps for the Hive (Amber Gel facility), both levels, the same way as
# tools/gen-remaining-maps.sh: the authored layout (traced from the printed plans,
# QE p.43-45) rendered as a schematic is the first reference, the interior renders
# set materials and mood, two variants each. Usage: tools/gen-hive-maps.sh [hive-exterior|hive-main|hive-lower ...]
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
INT="$MODULE/_work/incoming/Interiors"
WORK=${TMPDIR:-/tmp}/qe-hive
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

COMMON='CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down. No perspective, no
  vanishing point, no visible wall faces, no ceiling, no isometric tilt.
- This is a BATTLE MAP: the floor is the subject. Walls read as thick solid
  bands seen from above. Rooms stay open enough to place figures in.
- Walls, doors and openings go EXACTLY where the floorplan puts them: every
  blue door mark is a door, every gap is an open doorway, and nothing (crates,
  machinery, debris) may block a door or doorway.
- LIGHT IT: real sources pooling light, soft contact shadows. Flat uniform
  lighting is what makes a map look like a diagram instead of a place.
- NO grid lines, NO labels, NO numbers, NO legend, NO text, NO border, NO people,
  NO creatures.
- Dark enough overall that light-coloured character tokens read clearly on top.'

run() {   # run <key> <prompt-file> <refs...>
  local key=$1 pf=$2; shift 2
  echo "=== $key ($(date +%H:%M:%S)) ==="
  timeout 1800 codex exec --skip-git-repo-check -s workspace-write "$@" < $pf > $WORK/$key.log 2>&1
  echo "   exit $?"
  for v in a b; do [ -f "_work/mapout/$key-$v.webp" ] && echo "   OK   $key-$v" || echo "   MISS $key-$v"; done
  if grep -q '"type":"error"\|usage limit' $WORK/$key.log; then echo "   !! codex reported an error — see $WORK/$key.log"; fi
}

ARGS="$*"

# ── The Hive — Exterior (40 × 35 m compound, QE p.43) ─────────────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" hive-exterior "* ]]; then
cat > $WORK/hive-exterior.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the fenced compound of a
run-down food-processing plant on the edge of 2050s Seattle, in flat overcast
DAYLIGHT (the GM darkens it in Foundry for the night-time raid, so the art
itself must be neutral daylight). Deserted-looking: nothing moving.

THE FIRST REFERENCE IMAGE IS THE SITE PLAN, a schematic of a 40 m by 35 m lot.
Reproduce it exactly:
- GREEN areas are rough, overgrown grass and weeds; GREY areas are cracked,
  stained asphalt pavement (a car park, a driveway, paths). Keep the exact
  shapes of both.
- THE BUILDING (the dark L-shaped block): seen from directly above as a flat
  industrial ROOF — tar and gravel, vents, a couple of rooftop HVAC units,
  skylights, puddles. The small hatched square at its top-left corner is the
  ROOF ACCESS hatch. The blue marks on its edges are its doors: draw a door and
  a small concrete step at each.
- Below the lower right wing's double doors: a loading apron.
- The cyan outline round the lot is a chain-link FENCE; the two gaps in it (top
  right, bottom middle) are open gateways where the pavement runs out.
- Outside the fence: plain black.
THE REMAINING REFERENCE IMAGES show the building and the loading dock — use
them for materials and palette.

$COMMON
- Light: grey Seattle overcast daylight, soft short shadows from the building,
  a damp sheen on the asphalt. No lamps lit, no night tint.
  (Overrides the "dark enough overall" rule above: keep it mid-toned, not bright.)
- Nearly square, 8:7.

Save to _work/mapout/hive-exterior-a.webp
Then generate a SECOND variation — same layout and constraints, different
ground wear and light treatment — and save it to _work/mapout/hive-exterior-b.webp
Report both saved paths.
EOF
run hive-exterior $WORK/hive-exterior.txt -i "$REFS/hive-exterior-floorplan.png" -i "$INT/hive-main-floor.webp" -i "$INT/hive-loading-dock.webp"
fi

# ── The Hive — Main Level (24 × 14 m incl. the dock, QE p.44) ──────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" hive-main "* ]]; then
cat > $WORK/hive-main.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the ground floor of a
run-down food-processing plant in 2050s Seattle, a front for something worse.
Dusty, poorly maintained, only the loading dock sees daily use.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic (24 m wide by
14 m deep, an L-shaped building). Reproduce its layout exactly:
- MAIN AREA: one big open factory floor of concrete, the full width across the
  top. Draw no internal walls except where the schematic has them.
- FOOD-PROCESSING PLANT (hatched box, left of centre): a large raised platform
  with a big round mixing vat, control panels and hoppers, a low rail round it.
- PIPEWORK AND TANKS (hatched box, centre-right): a sprawl of tanks, pumps and
  overhead pipe runs linking back to the plant. Keep walkable gaps through it.
- TOP-LEFT CORNER, THE STAIRWELL (the two yellow arrows): TWO separate narrow
  flights side by side, split by a thin rail, both starting at the small landing
  on their RIGHT where the stairwell opens onto the factory floor:
    * the TOP flight goes UP to the roof: treads climb toward the left wall, so
      its LEFT end is the high end (lighter, nearer the viewer);
    * the BOTTOM flight goes DOWN to the basement: treads descend toward the
      left wall into darkness, so its LEFT end drops away (darkest).
  They must read as one flight up and one flight down, NOT one single flight.
- Below the stairwell: three tiny empty offices off a narrow hall, exactly as
  drawn — abandoned desks, a filing cabinet.
- DOCK BAY (the lower-right wing): open floor with drums of amber gel stacked on
  pallets ready for collection, a pallet jack; the FREIGHT ELEVATOR (a caged
  steel platform, control panel on its left side) against its right wall.
- LOADING DOCK (hatched strip outside the bottom double doors): a raised concrete
  dock edge with bumpers; beyond the building, plain black.
- Four doors in the outer walls where the blue marks are.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of this building — use them for
materials, palette and mood.

$COMMON
- Light: pale green-tinted daylight falling from high windows along the walls,
  fluorescents off, the stairway dark.
- Landscape, 12:7. Everything outside the building's L-shaped outline is plain black.

Save to _work/mapout/hive-main-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/hive-main-b.webp
Report both saved paths.
EOF
run hive-main $WORK/hive-main.txt -i "$REFS/hive-main-floorplan.png" -i "$INT/hive-main-floor.webp" -i "$INT/hive-offices.webp" -i "$INT/hive-loading-dock.webp"
fi

# ── The Hive — Lower Level (24 × 12 m, QE p.45) ────────────────────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" hive-lower "* ]]; then
cat > $WORK/hive-lower.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the basement under a
food-processing plant in 2050s Seattle, taken over by an insect-spirit hive — a
Shadowrun horror climax. Unsettling, organic creeping into the industrial; no
gore for its own sake.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic (24 m wide by
12 m deep) of sixteen rooms. Reproduce its walls, doors and openings exactly —
room shapes, positions and every door. Rooms that share a name are one room.
- ROOMS 1-15: small, dirty, debris-strewn storerooms of thin partition walls;
  some hold piles of crates of basic soy food, full or empty; waxy resin and
  papery comb starting to crust the corners and ceilings.
- ROOM 16, THE HIVE ROOM (the large central space, open to Room 11 below-left):
  the heart of the hive — floor and walls crusted with resinous comb, glistening
  cells and pale cocoons clustered round a central raised mass. Leave open floor
  to fight across.
- STAIRWAY (top-left corner, inside Room 8, the yellow arrow): this is the
  BOTTOM floor, so the only flight goes UP. Its foot is at the RIGHT, on Room 8's
  floor; the treads climb toward the LEFT wall and disappear upward, so the LEFT
  end is the high end (lighter, closer to the viewer) and the RIGHT end is at
  floor level. Nothing about it may suggest it goes further down.
- The whole SOUTH edge of the left block is ONE continuous outer wall, from the
  left corner all the way to where it meets Room 1; Rooms 11 and 16 are closed
  on that side. Draw every wall in the schematic, and only those.
- ROOM 1 (bottom right): where the FREIGHT ELEVATOR arrives — a caged steel
  platform against the right wall.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of this level — use them for
materials, palette and mood.

$COMMON
- Light: NO power down here. Almost dark: a faint sickly bioluminescent glow
  from the comb in the Hive Room, a little spill from the elevator car, deep
  shadow elsewhere (players will bring light; the map must still read).
- Landscape, 2:1.

Save to _work/mapout/hive-lower-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/hive-lower-b.webp
Report both saved paths.
EOF
run hive-lower $WORK/hive-lower.txt -i "$REFS/hive-lower-floorplan.png" -i "$INT/hive-lower-room.webp" -i "$INT/hive-queen-room.webp"
fi
