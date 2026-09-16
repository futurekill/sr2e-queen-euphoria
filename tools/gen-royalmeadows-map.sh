#!/bin/zsh
# Royal Meadows flat — hybrid battle map (see tools/gen-lobby-map.sh for why).
# The floorplan reference is OUR OWN authored layout rendered as a schematic,
# not a book scan: this scene's geometry was authored rather than traced.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
IN="$MODULE/_work/incoming/Royal Meadows"
WORK=${TMPDIR:-/tmp}/qe-rmmap
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: a cheap one-bedroom flat in
Royal Meadows, a run-down residential block in 2050s Seattle, plus the shared
building corridor outside it. This is low-rent housing — worn, grimy, cramped.
It is NOT luxurious and must not look it.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN, drawn as a labelled schematic.
Reproduce its layout exactly. This flat has NO internal hallway — do not invent
one. Reading it left to right: a LIVING ROOM WITH KITCHENETTE takes up the left
half; the front door is in its bottom wall and opens straight onto the building
corridor. The living room turns a corner into a short open ALCOVE (marked "open
to living room" — it is the SAME room, with no wall or door between them). A
small BATH sits above that alcove and opens down into it. A BEDROOM fills the
right end and opens west into the same alcove. Inside the bedroom's top wall is
a shallow CLOSET — a reach-in wardrobe with bifold louvre doors, about half a
metre deep, NOT a room you walk into. Below the flat, separated from it, a wide
BUILDING CORRIDOR spans the full width with three more doors along its far side
to neighbouring flats that are not part of this map.

THE REMAINING REFERENCE IMAGES ARE INTERIORS from this building — use them for
materials, palette and mood.

CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down. No perspective, no
  vanishing point, no visible wall faces, no ceiling, no isometric tilt.
- This is a BATTLE MAP: the floor is the subject. Walls read as thick solid
  bands seen from above. Rooms stay open enough to place figures in.
- LIGHT IT, but cheaply: one bare fixture per room, a flickering strip in the
  building corridor, cold daylight through a grubby window in the living room,
  soft contact shadows under the furniture. Flat uniform lighting is the single
  thing that makes a map look like a diagram instead of a place.
- Furniture seen from directly above: a mattress or cheap bed, a hanging rail in
  the closet, toilet/basin/shower in the bath, a sagging couch, a small table
  with mismatched chairs, a kitchenette counter with a hotplate and sink.
- Worn carpet, cracked lino, stained concrete in the corridor, scuffed paint.
- NO grid lines, NO labels, NO numbers, NO legend, NO text, NO border, NO people.
- Dark and drab, but light-coloured character tokens must read clearly on top.
- Landscape, roughly 12:7 — noticeably wider than tall.

Save to _work/mapout/rm-hybrid-a.webp
Then generate a SECOND variation of the same map — same layout, same constraints,
different flooring and light treatment — and save it to
_work/mapout/rm-hybrid-b.webp
Report both saved paths.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$REFS/royal-meadows-floorplan.png" \
  -i "$IN/Gritty Cyberpunk Apartment Interior.png" \
  -i "$IN/Typical Apartment.png" \
  -i "$IN/Grimy Royal Meadows Lobby.png" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in rm-hybrid-a rm-hybrid-b; do
  [ -f "_work/mapout/$f.webp" ] && echo "OK   $f" || echo "MISS $f"
done
