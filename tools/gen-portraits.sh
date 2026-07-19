#!/bin/zsh
# Generate actor portraits for the Missions cast via the Codex imagegen skill.
# Resumable (skips portraits that already exist). Run from the module root:
#   zsh tools/gen-portraits.sh
# Requires Codex CLI logged in with image-generation quota.
set -u
MODULE=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-queen-euphoria
REFS=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-foundryvtt/assets/creature_portraits
TSV=$MODULE/tools/portrait-prompts.tsv
WORK=${TMPDIR:-/tmp}/qe-portraits
mkdir -p $WORK "$MODULE/assets/portraits"
cd $MODULE || exit 1

PREAMBLE='Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback). The FOUR attached images are STYLE REFERENCES ONLY for the painterly RENDERING and dark cinematic mood — gritty Shadowrun cyberpunk-fantasy, highly detailed. These are ACTOR PORTRAITS. Each item is tagged PERSON (a character portrait, head-and-shoulders to waist-up, a real individual with personality) or CREATURE (a full creature portrait). Perfect SQUARE 1:1 (1024x1024), the subject centred and comfortably inside the frame with a little margin so nothing important clips (these become battlemap tokens). CRUCIAL: VARY the palette, lighting and mood to suit each subject — do NOT default to purple/violet, that colour is overused; pull from the full range (steel, teal, amber, green, red, white, brown, gold, bone). Generate a SEPARATE new square image for EACH subject and SAVE it as webp to the EXACT path given. If a path already exists, SKIP it. Report each saved path.'

TODO=$WORK/todo.tsv; : > $TODO
while IFS=$'\t' read -r rel body; do
  [ -f "assets/portraits/$rel" ] || print -r -- "$rel\t$body" >> $TODO
done < $TSV
echo "TODO portraits: $(wc -l < $TODO | tr -d ' ')  $(date +%H:%M:%S)"

CHUNK=5
lines=("${(@f)$(cat $TODO)}")
i=1; c=1
while (( i <= ${#lines[@]} )); do
  block=""; n=0
  while (( n < CHUNK && i <= ${#lines[@]} )); do
    line="${lines[$i]}"; rel="${line%%$'\t'*}"; desc="${line#*$'\t'}"
    block="$block
- Save to assets/portraits/$rel — $desc"
    i=$((i+1)); n=$((n+1))
  done
  print -r -- "$PREAMBLE$block" > $WORK/chunk_$c.txt
  echo "=== CHUNK $c ($n) $(date +%H:%M:%S) ==="
  timeout 900 codex exec --skip-git-repo-check -s workspace-write \
    -i $REFS/banshee.webp -i $REFS/barghest.webp -i $REFS/cockatrice.webp -i $REFS/ghoul.webp \
    < $WORK/chunk_$c.txt >> $WORK/chunk_$c.log 2>&1
  echo "   chunk $c exit: $? $(date +%H:%M:%S)"
  c=$((c+1))
done

echo "=== DONE. Missing: ==="
while IFS=$'\t' read -r rel body; do [ -f "assets/portraits/$rel" ] || echo "MISS $rel"; done < $TSV