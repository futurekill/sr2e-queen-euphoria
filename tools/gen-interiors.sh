#!/bin/zsh
# Interior reference art for the locations that have none.
#
# These are INPUTS to the map generation (see PLAN-battlemap-art.md step 2) —
# what stopped the Lobby coming out like a tenement was having real interiors to
# feed in. They double as journal handouts. Skips anything already generated.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
TSV=$MODULE/tools/interior-prompts.tsv
OUT="$MODULE/_work/incoming/Interiors"
WORK=${TMPDIR:-/tmp}/qe-interiors
mkdir -p $WORK "$OUT"
cd $MODULE || exit 1

PREAMBLE='Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback). Generate INTERIOR REFERENCE images for a Shadowrun 2nd Edition tabletop campaign set in 2050s Seattle. These are mood and material references, not battle maps. REQUIREMENTS: (1) Normal eye-level interior photography, a person standing in the room looking across it — NOT top-down, NOT a floorplan. (2) Cinematic but plausible lighting with a real source in frame or implied. (3) Gritty near-future realism, lived-in, a little grimy: this is Shadowrun, not a showroom. (4) NO people, NO text, NO logos of real companies, NO watermarks, NO borders. (5) Landscape 3:2. Save each as webp to the EXACT path given. If a path exists, SKIP it. Report each saved path.'

TODO=$WORK/todo.tsv; : > $TODO
while IFS=$'\t' read -r rel body; do
  [ -f "$OUT/$rel" ] || print -r -- "$rel\t$body" >> $TODO
done < $TSV
echo "TODO interiors: $(wc -l < $TODO | tr -d ' ')"
[ -s $TODO ] || exit 0

# chunked: one oversized request tends to drop the tail silently
CHUNK=5; c=1; n=0; block=""
while IFS=$'\t' read -r rel desc; do
  block="$block
- Save to $OUT/$rel — $desc"
  n=$((n+1))
  if (( n % CHUNK == 0 )); then
    print -r -- "$PREAMBLE$block" > $WORK/chunk_$c.txt
    echo "=== chunk $c ($(date +%H:%M:%S)) ==="
    timeout 1800 codex exec --skip-git-repo-check -s workspace-write < $WORK/chunk_$c.txt >> $WORK/chunk_$c.log 2>&1
    echo "   exit $?"
    block=""; c=$((c+1))
  fi
done < $TODO
if [ -n "$block" ]; then
  print -r -- "$PREAMBLE$block" > $WORK/chunk_$c.txt
  echo "=== chunk $c (tail) ==="
  timeout 1800 codex exec --skip-git-repo-check -s workspace-write < $WORK/chunk_$c.txt >> $WORK/chunk_$c.log 2>&1
  echo "   exit $?"
fi

echo "=== missing ==="
while IFS=$'\t' read -r rel body; do [ -f "$OUT/$rel" ] || echo "MISS $rel"; done < $TSV
