#!/bin/zsh
# Daytime pass of the Pacific Towers exterior.
#
# The APPROVED NIGHT MAP goes in as reference 1, so this is the same street at a
# different hour rather than a second street that merely resembles it. Geometry
# is already settled and the walls are fitted to the night art, so the day art
# has to match it building for building or the walls will not line up.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
IN="$MODULE/_work/incoming/Pacific Towers"
WORK=${TMPDIR:-/tmp}/qe-extday
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

THE FIRST REFERENCE IMAGE IS AN EXISTING TOP-DOWN BATTLE MAP of the street
outside Pacific Towers at night. Generate THE SAME STREET IN DAYLIGHT.

This must be the same place, not a similar one. Keep every piece of geometry
exactly where it is: the tower frontage across the top with its four sets of
double doors, the covered drop-off on columns in front of them, the kerb line,
the bollards, the planters, the street lamps, the carriageway and its lane
markings, the far pavement, the two opposite blocks and the alley mouth between
them, and the waterfront promenade with its railing down the left flank. Same
proportions, same positions, same footprints. The second reference is the layout
schematic if you need to confirm anything.

WHAT CHANGES — the light, and only the light:
- Overcast Seattle daylight, flat and grey-blue, the way it is most of the year.
- The ground is still damp from earlier rain, so keep some sheen and a few
  puddles, but lose the mirror-bright reflections and the long lamp streaks.
- Street lamps and the door lighting are OFF or barely visible. No warm pools on
  the pavement, no headlight beams, no neon.
- Soft, diffuse shadows from an overcast sky rather than hard pools of lamplight.
- Colours read properly now: the tower's black glass and dark metal, the grey
  concrete, the green of the planters.

KEEP: perfectly flat TOP-DOWN orthographic view, straight down, no perspective,
no building sides, no skyline. Vehicles seen from directly above — a car under
the drop-off and one or two at the far kerb. NO grid lines, NO labels, NO text,
NO border, NO people. Landscape 3:2. Light-coloured tokens must still read on
top, so keep the overall value mid-to-dark rather than bright.

Save to _work/mapout/pt-exterior-day-a.webp
Then a SECOND variation — same street, same constraints, a brighter break in the
cloud — saved to _work/mapout/pt-exterior-day-b.webp
Report both saved paths.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$MODULE/_work/mapout/pt-exterior-a.webp" \
  -i "$REFS/pt-exterior-floorplan.png" \
  -i "$IN/Pacific Towers Outside.png" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in pt-exterior-day-a pt-exterior-day-b; do
  [ -f "_work/mapout/$f.webp" ] && echo "OK   $f" || echo "MISS $f"
done
