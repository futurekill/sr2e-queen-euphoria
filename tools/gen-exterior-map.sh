#!/bin/zsh
# Pacific Towers exterior — hybrid battle map (see PLAN-battlemap-art.md).
# GM-invented geometry: the book prints no exterior plan. The frontage is set to
# the Lobby's measured 26 m so the two scenes agree at the door line.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
IN="$MODULE/_work/incoming/Pacific Towers"
WORK=${TMPDIR:-/tmp}/qe-extmap
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the street outside Pacific
Towers, a luxury residential arcology in 2050s Seattle, at night in the rain.
This is where a team might try to grab someone crossing the pavement to a
waiting car, so the street has to be readable and usable.

THE FIRST REFERENCE IMAGE IS THE LAYOUT SCHEMATIC. Follow it exactly. Across the
top, the TOWER FRONTAGE — a solid black-glass building edge with FOUR SETS OF
DOUBLE DOORS in the middle, warm light spilling out of them onto the wet ground.
In front of the doors, a COVERED DROP-OFF supported on columns, not walls — a
car can pull right up under it. Then the near PAVEMENT with a kerb, bollards,
planters and street lamps. Then WARD STREET itself, a wet asphalt carriageway
with lane markings, running the full width. Then the FAR PAVEMENT, and along the
bottom two OPPOSITE BUILDING BLOCKS with an ALLEY MOUTH between them. Down the
west (left) flank, a WATERFRONT PROMENADE behind a railing, with dark water
beyond it.

THE SECOND REFERENCE IS THE TOWER ITSELF — match its architecture, materials and
palette: tapering black glass and dark metal, warm amber light at street level.
The third and fourth are its interiors, for the colour of the light coming out.

CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down, as if from a drone
  directly overhead. NO perspective, NO vanishing point, NO building sides or
  facades visible, NO skyline, NO horizon. You are looking at the GROUND.
- The tower is seen as its FOOTPRINT only — a solid mass meeting the pavement.
  Do not draw the tower rising; this is a floor plan of the street.
- LIGHT IT: street lamps pooling on wet asphalt, warm light from the door line,
  headlights, neon spill, reflections in standing water, soft contact shadows
  under every vehicle and object. Night, wet, moody.
- Place a few VEHICLES: one at the kerb under the drop-off with its doors on the
  pavement side, one or two parked along the far kerb. Seen from directly above.
- NO grid lines, NO labels, NO numbers, NO legend, NO text, NO border, NO people.
- Dark overall, but light-coloured character tokens must read clearly on top.
- Landscape, roughly 3:2.

Save to _work/mapout/pt-exterior-a.webp
Then generate a SECOND variation of the same street — same layout and
constraints, different weather and light treatment — and save it to
_work/mapout/pt-exterior-b.webp
Report both saved paths.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$REFS/pt-exterior-floorplan.png" \
  -i "$IN/Pacific Towers Outside.png" \
  -i "$IN/Lobby.png" \
  -i "$IN/Lobby - Security Desk.png" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in pt-exterior-a pt-exterior-b; do
  [ -f "_work/mapout/$f.webp" ] && echo "OK   $f" || echo "MISS $f"
done
