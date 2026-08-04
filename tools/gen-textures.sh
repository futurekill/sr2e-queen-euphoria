#!/bin/zsh
# Seamless material tiles for the battle-map compositor. ONE base tile per
# material — see PLAN-battlemap-art.md for why variants were rejected (tiles that
# are each seamless against themselves are NOT seamless against each other).
# Variety comes from overlay decals, not from swapping bases.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
TSV=$MODULE/tools/texture-prompts.tsv
WORK=${TMPDIR:-/tmp}/qe-textures
mkdir -p $WORK "$MODULE/assets/textures"
cd $MODULE || exit 1

PREAMBLE='Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback). Generate SEAMLESS TILING TEXTURES for a top-down tabletop battle map. CRITICAL REQUIREMENTS: (1) Each image must TILE SEAMLESLY — the left edge must continue into the right edge and the top into the bottom, with NO visible seam, border, vignette or framing. (2) Perfectly flat TOP-DOWN orthographic view of a floor surface, as if photographed from directly overhead. NO perspective, NO horizon, NO walls, NO objects, NO furniture, NO shadows cast by anything outside the surface. (3) Square 1024x1024. (4) The tile represents roughly 4 x 4 METRES of real floor, so the scale of the material detail must look right at that size — floorboards, carpet pile, tile joints and concrete aggregate all sized accordingly. (5) Gritty near-future Shadowrun realism, slightly grimy and lived-in, dark enough that light-coloured tokens read clearly on top. Save each as webp to the EXACT path given. If a path exists, SKIP it. Report each saved path.'

TODO=$WORK/todo.tsv; : > $TODO
while IFS=$'\t' read -r rel body; do
  [ -f "assets/textures/$rel" ] || print -r -- "$rel\t$body" >> $TODO
done < $TSV
echo "TODO textures: $(wc -l < $TODO | tr -d ' ')"
[ -s $TODO ] || exit 0

block=""
while IFS=$'\t' read -r rel desc; do
  block="$block
- Save to assets/textures/$rel — $desc"
done < $TODO
print -r -- "$PREAMBLE$block" > $WORK/chunk.txt
timeout 1200 codex exec --skip-git-repo-check -s workspace-write < $WORK/chunk.txt >> $WORK/chunk.log 2>&1
echo "exit: $?"
while IFS=$'\t' read -r rel body; do [ -f "assets/textures/$rel" ] || echo "MISS $rel"; done < $TSV
