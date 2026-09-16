#!/bin/zsh
# Euphoria's Condo — hybrid battle map (see tools/gen-lobby-map.sh for why).
# Layout comes in as an image reference; the look comes from the model.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
IN="$MODULE/_work/incoming/Pacific Towers"
WORK=${TMPDIR:-/tmp}/qe-condomap
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: Euphoria's private condo on
the 21st floor of Pacific Towers, a luxury arcology in 2050s Seattle. She is a
simsense superstar; this is her sanctuary, and it is expensive.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN. Reproduce its room layout exactly —
same rooms, same relative sizes, same positions, same adjacencies, same doorways.
The numbers on it are: 1 ENTRANCE HALL and 2 FOYER forming a narrow spine down
the middle, with the private ELEVATOR opening into the top of the hall. 3 LIVING
ROOM across the bottom centre. 4 RECORDING STUDIO bottom right. 5 GREENHOUSE
BALCONY bottom left. 6 WORKOUT ROOM on the left. 7 CLOSET and 8 BATHROOM along
the top centre. 9 KITCHEN and 10 DINING ROOM on the right. 11 OSPREY'S BEDROOM
top right. 12 SPARE BEDROOM on the right below it. 13 MASTER BEDROOM top left.
14 MASTER BATHROOM on the left below it. Do not rearrange, add or drop rooms.

THE REMAINING REFERENCE IMAGES ARE THE ACTUAL INTERIORS of these rooms — use
them for materials, palette and mood.

CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down. No perspective, no
  vanishing point, no visible wall faces, no ceiling, no isometric tilt.
- This is a BATTLE MAP: the floor is the subject. Walls read as thick solid
  bands seen from above. Rooms stay open enough to place figures in.
- LIGHT IT. Warm pools from fixtures, cold blue city glow spilling in through
  the floor-to-ceiling glass on the outer walls, the greenhouse lit differently
  from the studio, soft contact shadows under every piece of furniture. Flat
  uniform lighting is the single thing that makes a map look like a diagram.
- Furniture seen from directly above: a circular sofa pit and holo-table in the
  living room, a mixing desk and monitors in the studio, planting beds and a
  sunken spa in the greenhouse, gym equipment, a long dining table, a kitchen
  island, beds in each bedroom, a freestanding tub in the master bathroom.
- NO grid lines, NO labels, NO numbers, NO legend, NO text, NO border, NO people.
- Dark and moody, but light-coloured character tokens must read clearly on top.
- Roughly SQUARE, about 25:24.

Save to _work/mapout/condo-hybrid-a.webp
Then generate a SECOND variation of the same map — same layout, same constraints,
different marble and lighting treatment — and save it to
_work/mapout/condo-hybrid-b.webp
Report both saved paths.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$REFS/condo-floorplan.png" \
  -i "$IN/Condo Livingroom.png" \
  -i "$IN/Euphoria’s Cyberpunk Condo Guide.png" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in condo-hybrid-a condo-hybrid-b; do
  [ -f "_work/mapout/$f.webp" ] && echo "OK   $f" || echo "MISS $f"
done
