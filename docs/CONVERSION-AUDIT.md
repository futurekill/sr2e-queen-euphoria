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

### p.20 — Osprey / "Adams" (Craft's muscle) — **VERIFIED FROM RENDER, WHOLLY WRONG**

Printed: Body 5, Quickness 5, Strength 4, Charisma 5, Intelligence 4,
Willpower 5, **Essence: .3** (printed exactly so), **Reaction 5 (9)**.
Skills: Armed Combat 5, Car 3, **Demolitions 2**, **Etiquette (Corporate) 2**,
Etiquette (Media) 4, Etiquette (Street) 4, **Firearms 7**, Interrogation 3,
Leadership 2, Negotiation 4, Stealth 5, Unarmed Combat 5.
Cyberware: (2) Chipjacks, Datasoft Link, Retinal Modification w/ Thermographic,
Retractable Razors, **Skillwire (6)** with skillsofts Car (4), Demolitions (4),
French (4), Interrogation (5), Japanese (4), **Monofilament Whip (5)**,
Smartgun Link, **Wired Reflexes (2)**.
Gear: Armor Jacket (5/3), BMW 330LS sportscar, Colt Manhunter [16 (clip),
1 extra clip, Smartgun Link, 4M2], Explosive Ammunition 5M3,
**Monofilament Whip (+2 Reach, 6S4)**.

Shipped: Body 5, Q 4, S 5, C 3, I 3, W 4, E 5, R 3; four skills at 3–4;
Uzi III + Knife. **Nine of nine attributes/skills checked are wrong**, the
entire cyberware suite is absent, and both signature weapons are replaced by an
Uzi he does not carry. Wired Reflexes (2) exactly explains the printed
Reaction 5 (9) — +4 — so the augmented value is real, not a typo.

Also relevant to the system's skillsoft work: he is a **skillwire user with two
LinguaSofts (French, Japanese) and a Monofilament Whip activesoft**.

### p.21 — Stone / Alexander Cross (Craft's muscle) — **VERIFIED FROM RENDER, WHOLLY WRONG**

**Stone is a full magician**, not a gunman. Printed: Body 4, Quickness 2,
Strength 3, Charisma 4, Intelligence 5, Willpower 6, Essence 6, **Magic 6**,
Reaction 4. Skills: Etiquette (Street) 3, **Magical Theory 8**, **Sorcery 7**,
Stealth 2, Unarmed Combat 2. Dice Pools include **Magic: 7**.
Gear: Armor Clothing (3/0), Browning Max-Power [8 (clip), 2 extra clips,
Silencer, 4M2], **6 Expendable Manipulation Fetishes**, Staff [+2 Reach,
3M2 Stun].
Spells — Combat: Mana Bolt 5, Powerball 5, Sleep 6. Detection: Detect
Enemies 3. Health: Increase Strength +2: 4, Treat Severe Wounds 5.
**Manipulation (all known requiring a fetish):** Armor 8, Control Thoughts 5,
Petrify 6.
**Notes: Stone has three Elementals bound** — Fire Force 5 (assigned to Spell
Defense), Fire Force 4 (bound to him, for Combat Spells), Earth Force 5.

Shipped: **byte-identical to Osprey** — the same generic thug, Magic 0, no
spells, no fetishes, no elementals, an Uzi III. A spellcaster with nine spells
and three bound elementals is currently unplayable.

### p.26 — "Pride" (Lion-totem shaman) — **MISSING ENTIRELY**

Printed: Quickness 5, Strength 6, Charisma 4, Intelligence 4, Willpower 6,
Essence 6, Magic 6, Reaction 5. Skills: Etiquette (Corporate) 1, Etiquette
(Street) 2, Etiquette (Tribal) 4, Firearms 3, Magical Theory 5, Negotiation 4,
**Sorcery (Ritual) 6**, Stealth 5, **Thrown Weapon (Spear) 6**, Unarmed
Combat 5. Dice Pools: Astral 14, Defense (Armed) 4, Defense (Unarmed) 5,
Dodge 5, Magic 4. Gear includes a 6M2 firearm, **Spear [+2 reach, 6S3]**,
**Survival Knife [6L3]**, Medicine Lodge Materials (4), 4 Plastic Restraints,
Real Leather Clothing. Spells include Power Missile 5, Detox Deadly Toxin 5.
Lion totem.

**There is no actor for this character.** (Body was not captured in the crop —
read it before generating.)

### p.63 / p.64 — Euphoria and Carrone — **attributes CLEAN, gear incomplete**

Every printed attribute and skill matches the shipped actor for both. But the
printed cyberware never became items: Euphoria's **Datajack** and **Sense Link
(w/ internal transmitter)**, Carrone's **Datajack, Display Link, Headware
Memory 30 Mp**, plus his Pocket Secretary and Wristphone.

### p.15 — a second security block — **TEXT LAYER ONLY, RENDER CHECK PENDING**

Reads: Skills Etiquette (Corporate) 2, Firearms 3, Unarmed Combat 3;
Gear **Armor Vest (2/1)**, **Ceska Black Scorpion** [25 (clip), 1 extra clip…].
The module's "Corporate / Venue Security" carries an Armor Jacket (5/3) and a
Ceska vz/120 — different armour and a different weapon. Confirm on the render
before changing anything.

### Remaining pages — NOT YET AUDITED

14, **16**, 25, 38, 42, 49, 50, **51**, 52.

(16 and 51 were absent from the first inventory — see the extraction gotcha
above. Both carry a stat block that has never been checked.)

## Verdict so far

The pattern is now conclusive across eight blocks. **Every NPC transcribed into
`docs/CAST-STATS.md` is accurate** (Craft, Euphoria, Carrone). **Every NPC that
was not is either invented or missing** — the Knight Errant guards, Osprey and
Stone are generic filler bearing no relation to the printed stats, and Pride
does not exist at all. Osprey and Stone are literally the same actor data twice.

This is not a conversion problem — those three blocks were never converted. The
fix is to transcribe them from the page and then apply the p.283 rules, not to
adjust what is there.

## Emerging pattern

Craft (a principal, transcribed into `docs/CAST-STATS.md`) is accurate. The
Knight Errant guards (a supporting block that never made it into CAST-STATS)
are substantially invented. **Prioritise the blocks with no CAST-STATS entry** —
those are where the errors are concentrated.
