# Plan Review Log: Queen Euphoria SR2E content module
Act 1 (grill) complete — plan locked with James. MAX_ROUNDS=5.

Grill outcomes:
- Fidelity: MODERNIZE to SR2E (rebuild stats/gear/spells/decking/rewards, not verbatim SR1).
- Insect spirits: reuse DE's already-shipped ant Hive pattern (Force-scaled npc spirits, baked manifest init). [resolved by codebase exploration]
- Pregens: none — QE ships no pregen PCs. [resolved by source exploration]
- Cast breadth: principals + combatants; social contacts → journals.
- Maps: labeled placeholders (DE approach).
- Matrix run: full SR2E host + IC for Strice Foods.

## Round 1 — Codex
VERDICT: REVISE — 28 findings. Full critique captured; my arbitration below.

### Claude's response (final arbiter)
ACCEPTED (concrete, verified against code/source):
- Essence cap: NPCData.essence is max:6 (actor-data.mjs:773); DE's Hive Queen Essence 10 is silently clamped. CONFIRMED bug. → true Essence in bio, field ≤6.
- Reaction inflation: baking init bonus into reaction corrupts dodge/defense. → prefer init-only field, else document; decide by reading the model.
- Extractor lacks journal:["pages"] (grep confirmed none in DE extract-packs.mjs) → add it + round-trip diff.
- .gitignore !packs/**/*.log is a no-op negation → deliberately track packs/ with a clear comment.
- Copy-tools-unsafe: DE hard-codes ids/paths/prose → enumerate substitutions + repo-wide grep gate.
- Mixed actor schemas (npc/host/ic) need type-specific emitters, not one npc().
- Host underspecified + printed map exists: QE p.34 prints the FULL Strice system map (SAN Red-5, SPU/CPU/DS-1/2/3 with codes + paydata). Codex #9 fully validated — converting, not inventing. Single host (multi-node unsupported); full HostData + IC UUID links + per-node/IC mapping.
- Re-derive ants from QE p.54, not DE: QE has Soldier+Worker only (Queen is a non-combat set-piece), True+Flesh forms, astral +5 (DE used +10), armor 2×Force, Immunity-to-Normal-Weapons, Willpower melee defense. Codex #10/#13 validated by source.
- Spells/skills as embedded ITEMS; Craft npc-vs-character by capability test; Ant totem encoded in bio (not automated).
- Social-NPC cutoff softened: mechanically-opposed recurring NPCs get lightweight actors.
- SR1→SR2 conversion checklist (docs/CONVERSION.md) per category with citations.
- Reward mapping table in Picking Up The Pieces journal.
- Source inventory + expected counts (docs/SOURCE-INVENTORY.md) as Step 0 before any generator.
- Validator extended to embedded ids / asset paths / UUID links.
- Scenes contradiction resolved by SIMPLIFYING to plain labeled grids (no walls/lights/geometry until real maps) — matches the user's placeholder choice.
- spirit-vs-npc rationale corrected: system DOES have a first-class spirit actor; npc chosen deliberately for the Force-formula mismatch, accepting lost spirit-sheet features.
- Phased delivery (Codex's 'simpler safer') adopted: Phase 1 core ships first.

SCOPED DOWN (accepted intent, rejected gold-plating — personal-use, non-distributed module):
- Full clean-install CI round-trip matrix → ONE in-Foundry import smoke in the live world.
- Scripted tabletop playtest matrix → a short smoke checklist (spell / ant / host-alert+IC).
- Formal asset manifest + prompt policy + documented similarity review → a one-paragraph copyright/asset note (original copy, generated art, private posture).
- 'Remove release automation' → kept (mirrors DE; packages James's own private zip); documented personal posture. Release is Phase 2, a separate go.

## Round 2 — Codex
VERDICT: REVISE — 8 findings (most prior addressed).

### Claude's response (final arbiter)
ACCEPTED (verified against actor-data.mjs + DE release.yml):
- IC→host link is ICData.hostUuid (1120,1156), host is single source of truth. My 'host holds IC links' was backwards → set system.hostUuid on each IC to Actor.<stableId>; validate reverse links.
- Adventure-import UUID resolution (fromUuidSync at 1158): real risk → Phase-1 gate: prototype one-host+one-IC import in a clean world, confirm hostUuid resolves, fix remapping before the full suite.
- character emitter: decide Craft's type up front by capability test; build ONLY the needed emitter (add character emitter iff character, else constrain to npc).
- Insect special rules (Immunity to Normal Weapons, ranged-only 2×Force armor, Willpower melee) aren't automated → marked MANUAL with exact roll instructions in bio/journal; smoke test exercises them specifically.
- _work absent: added Step 0a render/OCR prerequisite + page-offset check (QE offset ≈ 0).
- LevelDB tracking is churn (DE release.yml rebuilds packs from packs-src and ships them) → flipped .gitignore to ignore ALL of packs/; packs-src is sole source of truth.
- Phase 1 'ship' → 'internal playable build' with its own reduced expected-count subset; 'complete'/release reserved for inventory-complete Phase 2.

PARTIAL / PUSH-BACK (logged reason):
- #1 'one host per node': REJECTED host-per-node. The SR2E Matrix has no node-traversal mechanic and a run is decker-vs-single-host, so 7 host actors = 7 disconnected objects with no mechanical link — more objects, no more fidelity. Modeling: one Strice host at a representative Security Code, IC ratings DERIVED from the printed per-node color-codes, full node map + paydata documented in bio/journal. Offered host-per-node as a Phase-2 option if per-datastore granularity is wanted. Information preserved without fabricating traversal the system can't run.

## Round 3 — Codex
VERDICT: REVISE — 1 material + 2 editorial.
- IC ratings come directly from the printed SR1 IC numbers (Trace-and-Dump 3, Tar Pit 4, etc.), NOT derived from node color codes; the color code drives required successes + IC Reaction Time, the numeric System Rating sets operation TNs.
- "Phase 1 ships first" contradicts the turn:null/internal-build decision → "built first".
- "Real/final map art" was in both Phase 2 and out-of-scope → clarify it's out of scope for Phase 1 only.

### Claude's response
ACCEPTED all 3. Step 5 now copies each printed IC rating directly, keeps one representative host code, and marks per-node operation TNs/success thresholds/Reaction-Time differences MANUAL (linked IC inherit the one host code). Reworded Goal + Approach header to "built in phases". Qualified map art as Phase 2 / out-of-scope-for-Phase-1.

## Round 4 — Codex
VERDICT: APPROVED
Plan is sound enough to implement; single-host Matrix abstraction clearly identifies what stays manual. Two non-blocking nits: a stale parenthetical still said "per-node codes drive IC ratings" (contradicts the corrected rule); relabel the out-of-scope map bullet as "out of scope for Phase 1".

### Claude's response
ACCEPTED both nits (non-blocking): rewrote the parenthetical to "printed IC ratings are copied directly; per-node codes drive the manual operation thresholds and Reaction Time"; relabelled the map-art out-of-scope bullet. Plan CONVERGED — APPROVED after 4 rounds.

## Act 3 — Build (gen-actors.mjs)
Claude wrote tools/gen-actors.mjs (7→8 npc actors: Craft/Euphoria/Carrone + Soldier/Worker ant × True/Flesh + Hive Queen set-piece) from docs/CAST-STATS.md, mirroring DE's generator. Codex (blocked from --yolo writes by auto-mode; used read-only instead) reviewed the generator + emitted JSON.

### Codex review — 9 findings (thread 019f5bea)
1. HIGH ants used DE combat numbers (armor F/2F, reaction F+10) not QE's rules (armor 2×Force, +5 astral only).
2. HIGH Craft's spells used hand-typed defaults, not the system's canonical spell definitions (wrong drain/area/target).
3. HIGH 4 concentrations encoded as specializations (+4 vs +2).
4. MED essence max written from printed value (Euphoria 5/5) instead of max 6 for cybered humans.
5. MED Craft magic.type "shaman" (noncanonical) vs "full_magician"; Sleep focus bio-only.
6. MED magical skills (Conjuring/Sorcery) marked isMagical:false.
7. MED cyberware biography-only, not items.
8. LOW Queen display actor absent.
9. LOW some DE fields omitted (safe defaults); confirmed QE ×3 run is correct (not DE's ×5).

### Claude's response (arbiter)
ACCEPTED 1,2,3,4,5(type),6,8: ants → armor [2F,2F] + reaction=Force; spells → loaded from ../sr2e-foundryvtt/packs-src/spells canonical defs (force overridden); spec→conc; essence max 6 for humans / =Force for spirits; magic.type full_magician; isMagical on Conjuring+Sorcery; added Hive Queen set-piece.
KEPT AS-IS with reason: #5 Sleep focus stays bio-only (system foci add to EVERY spell — a Sleep-only focus item would be wrong); #7 cyberware bio-only (DE precedent; NPC essence is static/authoritative, so items add nothing mechanically); #9 omitted fields default safely. Concentration +2 (vs book's flat rating) accepted as the SR2E modernization.
Proof: `node tools/gen-actors.mjs && npm run build-packs qe-actors` → 8 docs, pack builds, `npm run validate` clean.

### Codex review — Strice host + IC (thread 019f5bea)
Findings: (M) IC prototypes had actorLink:false, defeating the system's singleton-IC design + host alert-propagation (iterates world actors) → set actorLink:true. (L) IC initiative source = rating only; runtime derives icReactionBase(orange=7)+rating → set base/value = 7+rating for accurate pack data. Confirmed CORRECT: one-host Orange-4 reduction faithful (per-node codes MANUAL), all 4 IC type/rating mappings (gray/black/white/white, 3/4/4/3), schema conformance, and the Adventure-import UUID gate (Actor.<deterministic hostId> resolves; Foundry preserves bundled ids). Both fixes applied.

### Codex review — journals + Adventure bundle (thread 019f5bea)
Confirmed CORRECT: JournalEntry/page schema (V13), build-packs page splitting, Adventure assembly + _key stripping, the bundled IC→host UUID resolves (host in same adventure.actors), the Insect Spirits primer (rules-faithful), scene scope.
Findings + Claude's responses:
- (HIGH) Karma table over-awarded (~8-16/runner) + cited wrong page → REWROTE per SR2 p.199 as a ~6-8 team target with milestones as placement guidance, removed the Threat-Rating conflation.
- (HIGH) journals skipped Act 1 (the runners themselves pull the FIRST Ludivenko kidnapping; Carrone hires the SAME team for the second) → REWROTE the overview "How the Adventure Runs" as two acts + added ACT 1 (The Job) and ACT 2 (The Twist: Meeting Carrone) scene-prep pages; retitled the old Carrone page to Legwork dossiers.
- (MED) missing core combatants → ADDED 5 representative actors (Euphoria's Bodyguard, Corporate/Venue Security, Lone Star Officer, Osprey, Stone).
- (MED) per-scene journal depth < full inventory → deferred to Phase 2 (the plan's Phase-1 subset is met: 18 pages, core combatants, single host, plain scenes, Adventure bundle).
Rebuild: 18 actors / 5 journals (18 pages) / 6 scenes / 1 Adventure; all packs valid.
