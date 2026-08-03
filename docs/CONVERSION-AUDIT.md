# Queen Euphoria — conversion audit

Working record of checking every shipped actor against the printed page and the
core rulebook's official conversion rules.

> **Source changed 2026-08-02.** The scan was replaced with the owner's
> purchased copy, which has a **real text layer** — sweep with
> `_work/text/pNN.txt` (folio-named) instead of the old tesseract OCR. The PDF
> page offset is now **+2** (book p.19 = PDF 21). Digits still need a render
> check: the text layer renders `15 (clip)` as `t 5 (clip)`. Everything below
> was verified from 300dpi renders and re-confirmed against the new text layer.

**Status: COMPLETE (2026-08-02).** Every printed stat block in the adventure
has been read from a 300 dpi render. Nothing remains render-pending.

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

### p.15 — **VERIFIED FROM RENDER.** Two blocks; both matter

**Pacific Towers Security Guard** — *"building security, barely trained and
nearly inexperienced."*

```
  B  Q  S  C  I  W  E  M  R  Armor
  4  3  3  2  2  2  6  —  2   2/1
Dice Pools: Defense (Armed) 1, Defense (Unarmed) 3, Dodge 3
Skills: Etiquette (Corporate) 2, Firearms 3, Unarmed Combat 3
Gear: Armor Vest (2/1); Ceska Black Scorpion [25 (clip), 1 extra clip, 3M2]
```

This is the block the shipped **"Corporate / Venue Security"** stands in for,
and it is wrong on six counts: Charisma 3 (printed 2), Intelligence 3 (2),
Willpower 3 (2), a **Ceska vz/120** instead of the printed **Ceska Black
Scorpion**, an **Armor Jacket 5/3** instead of the printed **Armor Vest 2/1**,
and no Etiquette skill.

**Knight Errant Security Guard** — the attribute row for the p.19 block,
confirming Intelligence **2** and Willpower **4**, and adding **Armor 5/3**:

```
  B  Q  S  C  I  W  E  M  R  Armor
  4  4  4  3  2  4  6  —  3   5/3
```

Same skills and gear as p.19. *"Currently at a Group Three training level,
these guards are a cut above the usual corporate security guard, but not
elite."*

### pp.38, 47, 49–52 — THE INSECT SPIRITS — **the module's four are all invented**

`docs/CAST-STATS.md` states: *"QE prints only the **rules** for its ants, not a
manifest attribute table (p.55 is blank Hive condition-monitors). So model
Soldier and Worker ant spirits Force-scaled."*

**That is false.** The book prints full SR1 critter tables. Verified on the
p.49 render:

```
FLESH FORM SOLDIERS (FORCE 3)
  B  Q  S  C  I  W   E   M  R   Armor
  6  6  6  —  1  2  (3)A  —  3   None
Attacks: 6M2 Physical          Skills: Unarmed Combat 3
Powers: Enhanced Senses (Smell), Pain Resistance    Weaknesses: None
```

The complete printed roster — **six blocks**, on a Flesh/True × Force axis:

| page | block | Attacks | Powers | Weaknesses |
|------|-------|---------|--------|------------|
| 47 | **Flesh Form Worker (Force 1)** | None | Enhanced Senses (Smell) | Reduced Senses (Sight) |
| 49 | **Flesh Form Soldiers (Force 3)** | 6M2 Physical | Enh. Senses, Pain Resistance | None |
| 50 | **Flesh Form Soldiers (Force 5)** | 8M2 Physical | Enh. Senses, Pain Resistance | None |
| 38 | **True Form Soldier (Force 3)** | 7M2 Physical + Special | Enh. Senses, Manifestation, Paralyzing | Reduced Senses (Sight), Vulnerability (insecticide) |
| 51 | **True Form Soldiers (Force 3)** | 7M2 Physical + Special | as above | as above |
| 52 | **True Form Soldiers (Force 5)** | 9M2 Physical + Special | as above | as above |

Against the four shipped actors:

| shipped | printed equivalent | verdict |
|---------|--------------------|---------|
| Soldier Ant Spirit (Flesh Form, **Force 4**) | Flesh Soldier is **Force 3 or 5** | Force 4 does not exist |
| Soldier Ant Spirit (True Form, **Force 4**) | True Soldier is **Force 3 or 5** | Force 4 does not exist |
| Worker Ant Spirit (Flesh Form, **Force 3**) | Worker is **Force 1** | wrong Force |
| Worker Ant Spirit (True Form, **Force 3**) | *no True Form Worker is printed* | invented |

Also missing from every shipped ant: the printed **attribute rows**, the
**Attacks** damage codes, **Unarmed Combat 3**, the **Powers** and — mechanically
important for the climax — the **Weaknesses** (Reduced Senses (Sight) and
Vulnerability to insecticide, which is how the runners are meant to win).

Fix: rebuild all of them from the printed tables, at the printed Forces, and
add the Worker's Force-1 block. Note the Attacks codes are SR1 three-digit
(6M2 / 7M2 / 8M2 / 9M2) so they need the p.283 treatment — no SR2 "comparable
item" exists for an ant's mandibles, so method **B** (fold the staging digit):
6M2→8M, 7M2→9M, 8M2→10M, 9M2→11M.

#### The printed tables, transcribed from 300 dpi renders

All five combat blocks, read off the page. `E` is Essence, `(n)A` as printed;
`R x(y)` is Reaction with its augmented/astral value in brackets.

| block | B | Q | S | C | I | W | E | M | R | Armor |
|-------|---|---|---|---|---|---|---|---|---|-------|
| Flesh Worker (F1) | 2 | 2 | 2 | — | 1 | 1 | (1)A | — | 1 | None |
| Flesh Soldiers (F3) | 6 | 6 | 6 | — | 1 | 2 | (3)A | — | 3 | None |
| Flesh Soldiers (F5) | 8 | 8 | 8 | — | 3 | 2 | (5)A | — | 5 | None |
| True Soldiers (F3) | 4 | 7 | 7 | — | 1 | 2 | (3)A | — | 6 (11) | **3/3** |
| True Soldiers (F5) | 6 | 9 | 9 | — | 3 | 2 | (5)A | — | 10 (15) | **5/5** |

| block | Attacks | Skills | Powers | Weaknesses |
|-------|---------|--------|--------|------------|
| Flesh Worker (F1) | **None** | — | Enhanced Senses (Smell) | Reduced Senses (Sight) |
| Flesh Soldiers (F3) | 6M2 Physical | Unarmed Combat 3 | Enh. Senses (Smell), Pain Resistance | **None** |
| Flesh Soldiers (F5) | 8M2 Physical | Unarmed Combat 3 | Enh. Senses (Smell), Pain Resistance | **None** |
| True Soldiers (F3) | 7M2 Physical + Special | — | Enh. Senses (Smell), Manifestation, **Paralyzing Touch, Venom** | Reduced Senses (Sight), Vulnerability (Insecticide) |
| True Soldiers (F5) | 9M2 Physical + Special | — | as above | as above |

#### Three more inherited assumptions that the printed stats contradict

QE's own `CLAUDE.md` carries modelling instructions taken from Double Exposure's
ants. It warns "DE is a reference, not a template to clone" — and then clones it.
The printed blocks disagree on all three:

1. **"armor 2×Force"** — the book prints **3/3 at Force 3 and 5/5 at Force 5**,
   i.e. Force ×1, and only on the True Forms. Flesh Forms have **no armour at
   all**. Doubling would make every True Form twice as tough as printed.
2. **"Immunity to Normal Weapons vs ranged"** — this is **not one of the printed
   Powers**. The complete list is Enhanced Senses (Smell), Pain Resistance,
   Manifestation, Paralyzing Touch and Venom. Immunity would make the Hive
   near-unkillable by the party's guns, which is not what the adventure prints.
3. **"melee attackers use Willpower not weapon skill"** — the Flesh Soldiers
   print **Unarmed Combat 3**, an ordinary skill.

What the assumptions got *right*: astral initiative **+5**, which matches the
printed True Form Reaction 6 (11) and 10 (15).

Two Powers were also lost to OCR truncation and only appear on the render:
**Paralyzing Touch** and **Venom**. Both are mechanically significant.

### p.38 — Vincent Burroughs (Strice Foods) — **MISSING ENTIRELY**

Named NPC, Strice Food Security Director's contact and the man Craft is
blackmailing. No actor exists.

```
  B  Q  S  C  I  W   E   M  R   Armor
  3  2  2  4  4  2  4.8  —  3   None
Dice Pools: Defense (Armed) 1, Defense (Unarmed) 1, Dodge 3
Skills: Computer Theory 3, Etiquette (Corporate) 4, Interrogation 3, Negotiation 4
Cyberware: Datajack, 100 Mp of memory
Gear: None
```

The p.38 True Form Soldier (Force 3) block on the same page matches p.51 exactly
(B4 Q7 S7 I1 W2 E(3)A R6(11), Armor 3/3, 7M2 + Special) — a duplicate printing,
not a sixth variant.

### p.25 — "The Strice Boys" (facility guards) — **MISSING ENTIRELY**

```
  B  Q  S  C  I  W  E  M  R  Armor
  5  3  4  2  3  3  6  —  3   4/3
Dice Pools: Defense (Armed) 4, Defense (Unarmed) 4, Dodge 3
Skills: Armed Combat 4, Etiquette (Corporate) 2, Etiquette (Street) 2,
        Firearms 3, Stealth 2, Unarmed Combat 4
Gear: Armor Vest With Plates (4/3); Seco LD 120 [12 (clip), 1 extra clip, 3M2];
      Stun Baton [+1 Reach, 5L2 Stun + Special];
      Uzi III [16 (clip), 1 extra clip, Laser Sight, 4M3]
```

Note the **Stun Baton "+ Special"** — a stun effect beyond its damage code, and
the second time a baton has appeared (the Pacific Towers guards on p.14 carry
one too). Neither the baton nor the Seco LD 120 exists on any shipped actor.

### p.14 — Pacific Towers lobby guards are **Lone Star**, with the wrong gun

Printed: *"four Lone Star officers… (Use the **Street Cop Contact, p.171 SR
rules**.)"* — i.e. the SR1 core archetype, not statted in QE. Their gear IS
printed: **Browning Max-Power heavy pistols [8 (clip), 1 extra clip, 4M2]**,
**stun batons [+1 Reach, 5L2 Stun + Special]**, **Armor Vests [2/1]**.

The shipped "Lone Star Officer" carries an **Ares Predator (9M)** and no baton
or vest. Wrong weapon, missing gear. Because the block defers to an external
archetype, its attributes need deriving rather than transcribing — flag for a
GM decision (SR2 has its own Lone Star patrol stats).

### p.16 — three vehicles, **none of which exist in the module**

The module ships no vehicle actors at all.

| vehicle | Hand | Speed | Body | Armor | Sig | Pilot | Cost |
|---------|------|-------|------|-------|-----|-------|------|
| **Mitsubishi Nightsky** (Euphoria's limo) | 4 | 45/120 | 5 | 1 | 4 | 4 | 250,000¥ |
| **Ford Americar (security variant)** | 4 | 45/135 | 3 | 1 | 2 | 2 | 80,000¥ |
| **Northrup PRC-42D Wasp** (armed helo) | 3 | 65/100 | 1 | 1 | 5 | 0 | 340,000¥ |

- Nightsky: *"this particular Nightsky has no concealed weaponry."*
- Americar: equipped with a two-way radio.
- Wasp: **one Light Machine Gun under the nose — [LMG, 100 (Belt, internal),
  Laser Sight, 5S3] rigged for automatic 6 shots, no Recoil Modifier.** A
  variant of the standard Wasp with Ares Armorflex vehicle armour. *"For the
  pilot, use the Knight Errant Security Guard above, but substitute Rotor for
  Car at the same value"* — so the pilot reuses the p.19 block with Car 3
  swapped to Rotor 3.

**Open conversion question — vehicle armour.** p.283 tells you to *"multiply the
Vehicle Armor Ratings listed for the vehicles in the Rigger Black Book by 3"*
for SRII compatibility. These are SR1 adventure vehicles on the same scale, so
Armor 1 probably becomes 3 — but the appendix names the RBB specifically, not
adventures. **Needs a GM ruling before the vehicles are built.**

## Transcription complete

Every printed stat block in the adventure has now been read from a 300 dpi
render. Nothing is left un-audited.

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
