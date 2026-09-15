#!/bin/zsh
# Whole-image battle map for the Pacific Towers Lobby, generated WITH the
# floorplan as an image reference.
#
# WHY THIS EXISTS. PLAN-battlemap-art.md rejected whole-image generation because
# a diffusion model cannot place a wall on a grid line. That premise is true and
# the weight was wrong: Foundry walls are separate vector objects and only have
# to LOOK right, not coincide to the pixel. The composited maps it produced are
# geometrically exact and read as diagrams — flat ambient light, one floor tile
# repeating six times a room, props pasted with no contact shadow. The two
# Double Exposure maps futurekill likes were single generated images.
#
# The condo failed the other way: generated whole with NO layout reference, it
# invented a floorplan nobody would live in. So this does both — the layout
# comes in as a reference image, the look comes from the model.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=$MODULE/_work/mapref
IN="$MODULE/_work/incoming/Pacific Towers"
WORK=${TMPDIR:-/tmp}/qe-lobbymap
mkdir -p $WORK "$MODULE/_work/mapout"
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ONE top-down battle map for a tabletop RPG: the ground-floor lobby of
Pacific Towers, a luxury residential arcology tower in 2050s Seattle.

THE FIRST REFERENCE IMAGE IS THE FLOORPLAN. Reproduce its room layout exactly —
same rooms, same relative sizes, same positions, same adjacencies. Reading it
left to right, top to bottom: a planted GARDEN COURTYARD across the top left; a
narrow ELEVATOR CORE with three lifts in the top centre; stacked MEN'S and
WOMEN'S RESTROOMS to its right; a long POOL ROOM with an oval swimming pool
across the top right. Below all of that, a wide open CONCOURSE running the full
width. Below that a MEETING ROOM on the left, a LECTURE ROOM and a small
STOREROOM on the right, separated by a central corridor. Below that a BAR on the
left and a retail STORE on the right, still split by the corridor. The corridor
runs down to a FRONT ENTRANCE with a security desk and four sets of double doors
at the bottom. Do not rearrange, add or drop rooms.

THE REMAINING REFERENCE IMAGES ARE THE INTERIORS of this same building — use
them for materials, palette and mood: dark green-grey marble, brass and bronze
fittings, warm pooled lighting, expensive and a little cold.

CRITICAL RENDERING REQUIREMENTS:
- Perfectly flat TOP-DOWN orthographic view, straight down. No perspective, no
  vanishing point, no visible wall faces, no ceiling.
- This is a BATTLE MAP: the floor is the subject. Walls read as thick solid
  bands seen from above. Rooms are open so tokens can be placed in them.
- LIGHT IT. Warm pools under the lobby fixtures, cool light off the pool water,
  soft shadows where furniture meets the floor. Uniform flat lighting is the
  single thing that makes a map look like a diagram instead of a place.
- Furniture seen from directly above, casting a soft contact shadow: seating
  and planters in the garden, loungers around the pool, a long bar with stools,
  a boardroom table, rows of lecture seating, display cases in the store, a
  curved security desk at the entrance.
- NO grid lines, NO room labels, NO numbers, NO legend, NO text anywhere, NO
  border or frame. Just the map.
- Dark enough overall that light-coloured character tokens read clearly on top.
- Landscape, roughly 5:4 — slightly wider than tall.

Save to _work/mapout/lobby-hybrid-a.webp
Then generate a SECOND variation of the same map, same layout and constraints,
and save it to _work/mapout/lobby-hybrid-b.webp
Report both saved paths.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$REFS/lobby-floorplan.png" \
  -i "$IN/Lobby.png" \
  -i "$IN/Bar.png" \
  -i "$IN/Pool.png" \
  -i "$IN/Lobby - Security Desk.png" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in lobby-hybrid-a lobby-hybrid-b; do
  [ -f "_work/mapout/$f.webp" ] && echo "OK   $f" || echo "MISS $f"
done
