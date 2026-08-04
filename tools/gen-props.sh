#!/bin/zsh
# Top-down furniture sprites for the battle-map compositor. These are DECORATION —
# they identify what a room is, since the maps carry no room labels. Nothing
# mechanical depends on them and they never define structural geometry.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
TSV=$MODULE/tools/prop-prompts.tsv
WORK=${TMPDIR:-/tmp}/qe-props
mkdir -p $WORK "$MODULE/assets/props"; cd $MODULE || exit 1
P='Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback). Generate TOP-DOWN FURNITURE SPRITES for a tabletop battle map. ABSOLUTE REQUIREMENTS: (1) TRUE ORTHOGRAPHIC BIRD-EYE VIEW looking straight down — NO perspective, NO sides of objects visible, NO horizon, as if photographed from a ceiling camera directly overhead. (2) The object ONLY, centred, on a FULLY TRANSPARENT background — no floor, no shadow plate, no backdrop, no frame, no groundplane. Save as webp WITH ALPHA. (3) A soft contact shadow directly beneath the object is fine and wanted, but nothing else. (4) Square 512x512, object filling most of the frame. (5) Gritty near-future Shadowrun realism — worn, cheap, lived-in, slightly grimy. Dark enough to sit on a dark floor without glowing. Save each to the EXACT path given; SKIP any that exists. Report each saved path.'
TODO=$WORK/todo.tsv; : > $TODO
while IFS=$'\t' read -r rel body; do [ -f "assets/props/$rel" ] || print -r -- "$rel\t$body" >> $TODO; done < $TSV
echo "TODO props: $(wc -l < $TODO | tr -d ' ')"; [ -s $TODO ] || exit 0
block=""; while IFS=$'\t' read -r rel desc; do block="$block
- Save to assets/props/$rel — $desc"; done < $TODO
print -r -- "$P$block" > $WORK/c.txt
timeout 1500 codex exec --skip-git-repo-check -s workspace-write < $WORK/c.txt >> $WORK/c.log 2>&1
echo "exit: $?"
while IFS=$'\t' read -r rel b; do [ -f "assets/props/$rel" ] || echo "MISS $rel"; done < $TSV
