# QA plan — Queen Euphoria

Automated: `npm run validate` (pack shape, unique ids including scene walls,
regions and behaviours, embedded item ids, journal images on disk) and
`npm run lint`. Everything below is manual, in a world with sr2e enabled.

## Import
- [ ] **Queen Euphoria (Adventure) → Import** brings in the cast, journals and
      scenes with no errors in the console.
- [ ] A scene dragged alone from **Queen Euphoria — Scenes** has its walls, doors
      and regions (fixed in 0.6.1).

## Scenes
- [ ] Hive Exterior, Main and Lower Level: walls line up with the art, doors open.
- [ ] Stepping onto a stair, elevator or doorway region offers to move the token
      to the linked floor, and the view follows.
- [ ] Glass walls block movement but not sight.

## Cast and journals
- [ ] Each cast member's sheet opens with its items, spells and portrait.
- [ ] The Visual Handouts journal shows every image; **Show Players** works.

## Soundboard (qe-audio)
- [ ] Import **Queen Euphoria — Soundboard → QE Soundboard — Act 1: The Job**.
- [ ] Clicking a sound plays it for every connected client; it doesn't loop, and the
      playlist never plays on its own.
- [ ] Each line sounds right for its character and says what its label says.
