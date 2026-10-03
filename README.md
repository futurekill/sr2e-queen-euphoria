# Shadowrun 2E: Queen Euphoria

A Foundry VTT V13 module bringing *Queen Euphoria* (FASA 7304) to the [Shadowrun 2nd Edition system](https://github.com/futurekill/sr2e-foundryvtt) (`sr2e`). The 1st-edition adventure **modernized to SR2E** (using the core book's *Updating Adventures* rules): the cast, the insect Hive, the Strice Foods Matrix host, GM journals, visual handouts, and battle maps with walls, doors and links between floors.

## Contents

| Pack | Contents |
|---|---|
| Queen Euphoria (Adventure) | everything, for one-click import |
| Queen Euphoria — Cast | 31 actors |
| Queen Euphoria — GM Journals | 6 journals |
| Queen Euphoria — Scenes | 12 scenes |

## Notes

- Import the **Queen Euphoria (Adventure)** pack: it keeps the scenes' ids, so the stairs, elevators and doors that link floors (Teleport Token regions) connect up.
- Scenes are 1 m squares at 100 px, measured from the book's floorplans where it prints one.
- Conversion decisions for each stat block and item are in `docs/CONVERSION-AUDIT.md`.

## Requirements

- Foundry VTT V13
- The `sr2e` system, version 0.30.0 or later

## Installation

In Foundry, **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/futurekill/sr2e-queen-euphoria/releases/latest/download/module.json
```

Then enable it in your world (**Game Settings → Manage Modules**).

## Development

`packs-src/` (one JSON file per document) is the source of truth. `packs/` is built from it, gitignored, and rebuilt by the release workflow.

```bash
npm install
npm run build-packs     # packs-src/ JSON -> packs/ LevelDB (close Foundry first)
npm run extract-packs   # pull edits made in Foundry back to packs-src/
npm run validate        # pre-flight checks on the pack sources
npm run lint
```

To release: add a `## X.Y.Z — date` section to `CHANGELOG.md` (the release notes come from it), bump `module.json`, then tag and push `vX.Y.Z`.

## Copyright

*Queen Euphoria* and *Shadowrun* are © FASA and their rights holders. This is a fan-made, non-commercial module for personal table use by owners of the book. GM journals are original summaries with page references; the four player handouts are transcribed as printed.
