#!/bin/zsh
# MegaMedia interiors, a touch more high-tech (futurekill, 2026-09-26: "a little
# more high tech. Not much, just a touch"). Each v1 image goes in as the
# reference for its own v2, so the room, camera and palette carry over and only
# the tech level moves. The v1 files are kept; v2 feeds the battle maps.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
IN="$MODULE/_work/incoming/Interiors"
WORK=${TMPDIR:-/tmp}/qe-mm-v2
mkdir -p $WORK
cd $MODULE || exit 1

cat > $WORK/prompt.txt <<'EOF'
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

The five reference images are interiors of MegaMedia, a MID-TIER media
corporation in 2050s Seattle (Shadowrun 2nd Edition). Make a new version of EACH
one, in the same order:
  1. reception      2. executive office      3. simsense studio floor
  4. control booth  5. green room

For each: KEEP the same room, camera angle, layout, furniture and colour
palette. Change only the technology level — nudge it up A TOUCH:
- a few slim flatscreen or projected AR panels where old screens or bare wall
  were; thin LED accent strips along a desk edge, ceiling cove or skirting;
- a sleeker terminal or deck, tidier cable management, a smart-glass partition
  or window here and there; small status lights on equipment.
RESTRAINT IS THE BRIEF: this is a company that wants to look cutting-edge and
can't quite afford it. It is NOT a megacorp showroom, NOT science fiction, NOT
neon-drenched. Someone who saw the original should recognise the room at once.

Same rules as the originals: normal eye-level interior photography, plausible
lighting with a real source, gritty near-future realism, lived-in. NO people,
NO text, NO real company logos, NO watermarks, NO borders. Landscape 3:2.

Save, in order, as webp to EXACTLY:
  _work/incoming/Interiors/megamedia-reception-v2.webp
  _work/incoming/Interiors/megamedia-office-v2.webp
  _work/incoming/Interiors/megamedia-studio-floor-v2.webp
  _work/incoming/Interiors/megamedia-control-booth-v2.webp
  _work/incoming/Interiors/megamedia-green-room-v2.webp
If a path already exists, SKIP it. Report each saved path.
EOF

timeout 1800 codex exec --skip-git-repo-check -s workspace-write \
  -i "$IN/megamedia-reception.webp" -i "$IN/megamedia-office.webp" -i "$IN/megamedia-studio-floor.webp" \
  -i "$IN/megamedia-control-booth.webp" -i "$IN/megamedia-green-room.webp" \
  < $WORK/prompt.txt > $WORK/run.log 2>&1
echo "codex exit: $?"
for f in reception office studio-floor control-booth green-room; do
  [ -f "$IN/megamedia-$f-v2.webp" ] && echo "OK   $f" || echo "MISS $f"
done
