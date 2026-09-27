#!/bin/zsh
# Battle maps for Craft's Magic Shop (both levels) and MegaMedia (office, studio),
# the same way as the Lobby / Condo / Royal Meadows (PLAN-battlemap-art.md):
# OUR authored layout rendered as a schematic (tools/render-plan.py) is the first
# reference, the interior renders set materials and mood, and each scene gets two
# variants for futurekill to choose from. MegaMedia uses the "touch more tech"
# v2 interiors. Usage: tools/gen-remaining-maps.sh [scene-key ...]
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
INT="$MODULE/_work/incoming/Interiors"
WORK=${TMPDIR:-/tmp}/qe-remaining
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

COMMON='CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down. No perspective, no
  vanishing point, no visible wall faces, no ceiling, no isometric tilt.
- This is a BATTLE MAP: the floor is the subject. Walls read as thick solid
  bands seen from above. Rooms stay open enough to place figures in.
- LIGHT IT: real sources (fixtures, screens, lamps, a window) pooling light, with
  soft contact shadows under furniture. Flat uniform lighting is the single thing
  that makes a map look like a diagram instead of a place.
- Furniture and fittings seen from directly above.
- NO grid lines, NO labels, NO numbers, NO legend, NO text, NO border, NO people.
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

# ── Craft's Magic Shop — Upper Level (17 × 6 m, QE p.40) ───────────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" ms-upper "* ]]; then
cat > $WORK/ms-upper.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the ground floor of Craft's
Magic Shop, a small occult/talismonger shop in 2050s Seattle that has NOT been
open for business in a long time — dusty, cobwebbed, shelves half-stripped.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic of a long
narrow building (17 m wide by 6 m deep). Reproduce its layout exactly:
- MAIN STORE (left, most of the building): the street door is in the middle of
  the LEFT wall. Display shelves and cases of fetish material along the walls, a
  sales counter, a couple of display tables; dust sheets over some of it.
- In the store, against the TOP wall about half-way along, a narrow STAIRCASE
  goes DOWN (the hatched box marked "Stairs down"): draw stairs descending, seen
  from above, inside a short walled nook.
- BACK ROOM (right): through a door in the dividing wall. Storage, crates,
  a worktable with herbs and ritual materials; the back door to the alley is in
  the middle of the RIGHT wall and looks recently used.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of this shop — use them for
materials, palette and mood.

$COMMON
- Light: dim street light through a grimy front window, one working bulb in the
  back room, dust in the air.
- The building is a very wide strip (17:6). Make the image the WIDEST landscape
  size you can, with the building filling the full width; any leftover space
  above and below it must be plain black.

Save to _work/mapout/ms-upper-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/ms-upper-b.webp
Report both saved paths.
EOF
run ms-upper $WORK/ms-upper.txt -i "$REFS/magic-shop-upper-floorplan.png" -i "$INT/craft-shop-store.webp" -i "$INT/craft-shop-backroom.webp"
fi

# ── Craft's Magic Shop — Lower Level (17 × 6 m, QE p.40, the book's arrangement) ──
if [ -z "$ARGS" ] || [[ " $ARGS " == *" ms-lower "* ]]; then
cat > $WORK/ms-lower.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the basement living quarters
under Craft's Magic Shop in 2050s Seattle, where a disturbed man lived — a
Shadowrun crime-scene location. Grim, squalid, unsettling; not gory for its own
sake.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic of a long
narrow basement (17 m wide by 6 m deep). Reproduce its layout exactly:
- LIVING AREA (middle, the largest room): the STAIRCASE UP is against the TOP
  wall about half-way along (the hatched box marked "Stairs up") — draw stairs
  rising, seen from above. A kitchenette runs along the BOTTOM wall with a
  microwave and a sink; a battered table in the middle; trideo, audio gear and a
  simsense player on a low unit near the top-left; empty Amber Gel containers
  and food wrappers scattered everywhere; a crudely drawn map pinned or lying out.
- BEDROOM (left), through a door in its right wall: a large decadent bed, a
  closet with a rail of costume clothing and wig stands, photos and illustrations
  of one woman pinned, stuck and strewn everywhere, and dark dried bloodstains on
  the floor and bedding — a crime scene.
- BATH (right), through a door in its left wall: filthy toilet, basin and shower,
  months of grime, a few roaches.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of these rooms — use them for
materials, palette and mood.

$COMMON
- Light: one flickering bulb in the living area, the glow of a trideo screen,
  a lamp by the bed, darkness in the bath.
- The building is a very wide strip (17:6). Make the image the WIDEST landscape
  size you can, with the building filling the full width; any leftover space
  above and below it must be plain black.

Save to _work/mapout/ms-lower-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/ms-lower-b.webp
Report both saved paths.
EOF
run ms-lower $WORK/ms-lower.txt -i "$REFS/magic-shop-lower-floorplan.png" -i "$INT/craft-living-area.webp" -i "$INT/craft-bedroom.webp"
fi

# ── MegaMedia — Carrone's Office (12 × 9 m, GM-invented layout) ────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" mm-office "* ]]; then
cat > $WORK/mm-office.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the executive floor of
MegaMedia, a mid-tier media corporation in 2050s Seattle — corporate, polished,
a touch high-tech (slim screens, LED accent strips, a smart-glass partition),
trying to look cutting-edge on a budget.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic (12 m by 9 m).
Reproduce its layout exactly:
- RECEPTION (top-left): the entrance from the lift lobby is in its LEFT wall. A
  curved reception desk with a terminal, waiting chairs, a wall of screens.
- MEETING AREA (top-right): a conference table with chairs, a wall screen.
- CORRIDOR across the middle, full width, with doors up into reception and the
  meeting area and one door down into the office.
- CARRONE'S OFFICE (the full-width room at the bottom): a large executive desk
  with terminal, a leather couch and low table for meetings, award shelves, and
  a floor-to-ceiling window along the BOTTOM wall over the rainy city at night.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of MegaMedia — use them for
materials, palette and mood.

$COMMON
- Light: warm desk lamps and cove lighting, the cool glow of screens, city light
  and rain through the office window.
- Landscape, about 4:3.

Save to _work/mapout/mm-office-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/mm-office-b.webp
Report both saved paths.
EOF
run mm-office $WORK/mm-office.txt -i "$REFS/megamedia-office-floorplan.png" -i "$INT/megamedia-reception-v2.webp" -i "$INT/megamedia-office-v2.webp"
fi

# ── MegaMedia — Simsense Studio (18 × 12 m, GM-invented layout) ────────────────
if [ -z "$ARGS" ] || [[ " $ARGS " == *" mm-studio "* ]]; then
cat > $WORK/mm-studio.txt <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: MegaMedia's simsense
recording studio in 2050s Seattle — technical, dim, a touch high-tech (slim
monitors, LED strips, status lights), everything pointed at the middle.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, a labelled schematic (18 m by 12 m).
Reproduce its layout exactly:
- RECORDING FLOOR (the big room on the left): a raised performance platform in
  the middle, sensor rigs and boom arms, lighting trusses seen from above, cable
  runs taped to the floor, acoustic panels on the walls. The entrance is in its
  BOTTOM wall.
- Down the right side, three rooms, each with a door onto the recording floor:
  CONTROL BOOTH (top): a mixing desk and banks of monitors facing a glass wall
  onto the recording floor; EQUIPMENT (middle): racks, flight cases, spare rigs;
  GREEN ROOM (bottom): a couch, a lit make-up counter and mirror, a costume
  rail, a small fridge.
THE REMAINING REFERENCE IMAGES ARE INTERIORS of MegaMedia — use them for
materials, palette and mood.

$COMMON
- Light: spotlights pooling on the platform, blue instrument glow in the control
  booth, warm bulbs round the green-room mirror, darkness at the edges.
- Landscape, 3:2.

Save to _work/mapout/mm-studio-a.webp
Then generate a SECOND variation — same layout and constraints, different floor
and light treatment — and save it to _work/mapout/mm-studio-b.webp
Report both saved paths.
EOF
run mm-studio $WORK/mm-studio.txt -i "$REFS/megamedia-studio-floorplan.png" -i "$INT/megamedia-studio-floor-v2.webp" -i "$INT/megamedia-control-booth-v2.webp" -i "$INT/megamedia-green-room-v2.webp"
fi
