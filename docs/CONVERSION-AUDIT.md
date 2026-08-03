# Queen Euphoria — conversion audit

Working record of checking every shipped actor against the printed page and the
core rulebook's official conversion rules.

> **Source changed 2026-08-02.** The scan was replaced with the owner's
> purchased copy, which has a **real text layer** — sweep with
> `_work/text/pNN.txt` (folio-named) instead of the old tesseract OCR. The PDF
> page offset is now **+2** (book p.19 = PDF 21). Digits still need a render
> check: the text layer renders `15 (clip)` as `t 5 (clip)`. Everything below
> was verified from 300dpi renders and re-confirmed against the new text layer.

**Status: IN PROGRESS.** Pages verified so far are listed below; the rest are
still to do. Do not treat an unlisted page as clean.

## The governing rule

Core rulebook, **UPDATING ADVENTURES** (book p.283 = PDF 308), verified at
300 dpi. This is the official instruction for converting a pre-SRII adventure
such as Queen Euphoria, and neither `PLAN.md` nor `docs/CAST-STATS.md` cites it:

> Adventures released prior to *Shadowrun, Second Edition* have some different
> notations, particularly for weapons… For non-player characters provided in the
> adventures, **recalculate Threat Ratings** based on the SRII rules. **Weapon
> and spell codes should be translated to their second-edition versions.**
>
> For unique weapons and Damage Codes… **Either find a comparable weapon, item,
> power, or ability and use that code, or add the first-edition Staging value**
> (the final part of the first-edition three-digit Damage Code, e.g. 4M3) **to
> the Power Rating** to determine the second-edition Power Rating.

So there are exactly two sanctioned methods per item, and each conversion should
record which one it used:

- **(A) Substitute** a comparable SR2 item and take its printed SR2 code.
- **(B) Fold the staging digit**: SR1 `PWR / LVL / STAGE` → SR2 Power
  `PWR + STAGE`, same level. `4M3 → 7M`, `6M2 → 8M`, `5M3 → 8M`, `5S4 → 9S`,
  `5L2 → 7L`, `6L3 → 9L`, `9M2 → 11M`.

Method A is preferred where the weapon genuinely exists in SR2 (Ares Predator,
Uzi III, Ceska vz/120). Method B is for anything with no SR2 counterpart.

## SR1 three-digit codes present in the source

**16 pages, 14 distinct codes.** From the purchased copy's text layer
(`_work/text/pNN.txt`), to be confirmed on the render before any value is used.

| page | codes |
|------|-------|
| 14 | 4M2, 5L2 |
| 15 | 5M3, 6M2 |
| 16 | 5S3 |
| 19 | 4M3, 5M3, 6M2 |
| 20 | 4M2, 5M3, 6S4 |
| 21 | 3M2, 4M2 |
| 25 | 3M2, 4M3, 5L2 |
| 26 | 6L3, 6M2, 6S3 |
| 38 | 7M2 |
| 42 | 5S4 |
| 49 | 6M2 |
| 50 | 8M2 |
| 51 | 7M2 |
| 52 | 9M2 |
| 62 | 4M2 |
| 64 | 3M2 |

Distinct: 3M2, 4M2, 4M3, 5L2, 5M3, 5S3, 5S4, 6L3, 6M2, 6S3, 6S4, 7M2, 8M2, 9M2.

> **Extraction gotcha, and why this table was wrong the first time.** A strict
> `\b\d{1,2}[LMSD]\d\b` scan silently under-counts, because OCR turns the
> closing bracket into a letter — `Survival Knife [6L3]` comes through as
> `6L3J`, and `\b` then refuses to match. The first pass missed **two whole
> pages (16, 51)** and three codes (5S3, 6S3, 6S4). Only the LEADING boundary
> can be strict; the trailing one must reject just a digit:
> `(?<![A-Za-z0-9])(\d{1,2})([LMSD])(\d)(?!\d)`.

## Both scans agree — the earlier verifications stand

When the source PDF was swapped, the two copies were diffed page by page on
their damage codes. Four pages appeared to disagree; all four turned out to be
extraction artifacts of the kind above, not content differences. Craft (p.62)
was independently re-read from the new text layer and matches the old render
exactly, attribute for attribute. **Same printing — nothing verified before the
swap needs redoing.**

---

## Findings

### p.19 — Knight Errant Security Guards — **VERIFIED FROM RENDER, MULTIPLE ERRORS**

Printed block (four guards on Euphoria at all times; two precede her vehicle in
a modified Ford Americar, one drives her Nightsky, one stays in the condo):

- **Attributes:** Body 4, Quickness 4, Strength 4, Charisma 3, Intelligence 2,
  Willpower 4, Essence 6, Reaction 3
- **Skills:** Armed Combat 3, Car 3, Etiquette (Corporate) 3, Firearms 4,
  Throwing 3, Unarmed Combat 4
- **Dice Pools:** Defense (Armed) 3, Defense (Unarmed) 4, Dodge 4 *(derived by
  the SR2E data model — not re-entered)*
- **Cyberware:** None
- **Gear:** (2) Airfoil IPE Concussion Grenades (5M3 Stun); Ares Predator II
  [15 (clip), 2 extra clips, Laser Sight, 6M2]; Armor Jacket (5/3);
  H&K MP-5TX [20 (clip), 2 extra clips, Laser Sight, 4M3]

Shipped as **"Euphoria's Bodyguard"**, and wrong in six ways:

| field | printed | shipped | verdict |
|-------|---------|---------|---------|
| Intelligence | 2 | 3 | wrong |
| Willpower | 4 | 3 | wrong |
| Essence | 6 | 5 | wrong |
| Unarmed Combat | 4 | 3 | wrong |
| Car 3, Etiquette (Corporate) 3, Throwing 3 | present | absent | missing |
| Stealth 3 | *not printed* | present | invented |
| Ares Predator II (6M2) | present | replaced with Ceska vz/120 (6L) | wrong weapon, and weaker |
| H&K MP-5TX (4M3) | present | absent | missing |
| 2x Airfoil IPE Concussion Grenades (5M3 Stun) | present | absent | missing |

Correct as shipped: Body 4, Quickness 4, Strength 4, Charisma 3, Reaction 3,
Armed Combat 3, Firearms 4, Armor Jacket 5/3.

Identification is confirmed: the book has no separate "bodyguard" block — the
only guard headings in the whole text are KNIGHT ERRANT SECURITY GUARD(S), so
the module's "Euphoria's Bodyguard" is this block.

Notes for the fix:
- The name should reflect the book: these are **Knight Errant** guards, not a
  generic "bodyguard".
- Predator II → method A (SR2 Ares Predator, 9M). MP-5TX has no SR2 entry under
  that name → either A (SR2 SMG) or B (`4M3 → 7M`); pick one and record it.
- Concussion grenades → the SR2 offensive grenade entry, method A; they are the
  reason Throwing 3 matters, so both were dropped together.

### p.62 — Craft / Thomas Dorin — **VERIFIED FROM RENDER, CLEAN**

Printed: Body 4, Quickness 3, Strength 3, Charisma 5, Intelligence 5,
Willpower 6, Essence 6, Magic 6, Reaction 4. Skills Conjuring 5,
Etiquette (Corporate) 1, Etiquette (Street) 4, Firearms (Pistols) 4,
Magic Theory 6, Negotiation 4, Sorcery (Spellcasting) 6, Stealth (Urban) 4,
Unarmed Combat 3; Special Evaluate Magical Goods 5, Metalworking 3,
Woodworking 3. Gear: Ares Predator [10 (clip), 2 extra clips, **4M2**],
Real Leather Clothing (0/2), Sleep Spell Focus (2).

Shipped actor matches, including Essence 6 / Magic 6 / shamanic / Ant totem
(these live in `{value,max}` fields, not `{base}` — an audit script reading
`.base` will report them as unset and produce a false finding).

His Predator is the one place a conversion decision was actually made and it is
**correct**: printed `4M2`, shipped as the SR2 catalogue Ares Predator **9M** —
method A (substitute the real SR2 weapon), which p.283 sanctions and which is
preferable to method B's `4M2 → 6M` because the Predator exists in SR2.

### Remaining pages — NOT YET AUDITED

14, 15, **16**, 20, 21, 25, 26, 38, 42, 49, 50, **51**, 52, 63, 64.

(16 and 51 were absent from the first inventory — see the extraction gotcha
above. Both carry a stat block that has never been checked.)

## Emerging pattern

Craft (a principal, transcribed into `docs/CAST-STATS.md`) is accurate. The
Knight Errant guards (a supporting block that never made it into CAST-STATS)
are substantially invented. **Prioritise the blocks with no CAST-STATS entry** —
those are where the errors are concentrated.
