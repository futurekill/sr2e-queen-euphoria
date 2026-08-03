// Generate Queen Euphoria GM journals into packs-src/qe-journals.
// Content is ORIGINAL GM-facing summary/prep authored for this module — no
// verbatim book text; page numbers point back to the adventure. Mirrors DE.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const DIR = "packs-src/qe-journals";
const idFor = (s) => createHash("sha1").update("qe-journal:" + s).digest("hex").slice(0, 16);
const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.1.0", createdTime: 1784000000000, modifiedTime: 1784000000000, lastModifiedBy: null, compendiumSource: null, duplicateSource: null, exportSource: null };
const safeName = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");

function page(journalName, name, html, level = 1) {
  return {
    _id: idFor(journalName + "::" + name), name, type: "text",
    title: { show: true, level },
    text: { format: 1, content: html.replace(/\n\s+/g, " ").trim() },
    image: {}, video: { controls: true, volume: 0.5 }, src: null,
    system: {}, sort: 0, ownership: { default: -1 }, flags: {}, _stats: STATS
  };
}
function journal(name, pages) {
  const _id = idFor(name);
  return { _id, name, pages, folder: null, sort: 0, flags: {}, ownership: { default: 0 }, _stats: STATS, _key: `!journal!${_id}` };
}

const JOURNALS = [
  journal("GM Overview — Queen Euphoria", [
    page("GM Overview — Queen Euphoria", "The Premise",
      `<p><em>Queen Euphoria</em> (FASA 7304) is a Shadowrun adventure set in the Tacoma, Puyallup, and Redmond districts of 2050s Seattle, here <strong>modernized to Shadowrun 2nd Edition</strong>. The megasimsense star <strong>Euphoria</strong> has been kidnapped — twice — and the runners are hired to find and recover her. Behind the abductions is something far worse than a media stunt: an <strong>insect-spirit Hive</strong> in the making.</p>
       <p>The adventure uses a <strong>decision-tree</strong> structure: the team can reach the same encounters by different routes depending on their choices, and can miss planned scenes entirely. Read the whole thing first — key groundwork is laid early.</p>`),
    page("GM Overview — Queen Euphoria", "Plot Synopsis (GM Eyes Only)",
      `<p><strong>Thomas Dorin</strong>, streetname <strong>Craft</strong>, is an Ant-totem shaman quietly building a <strong>Hive</strong> in preparation for a Queen Spirit he has not yet summoned. He discovers that the secretion of his Hive's Worker ants, mixed with food thickeners, makes a cheap, mildly addictive stuffer. To fund the Hive he offers the substance to <strong>Vincent Burroughs</strong> of <strong>Strice Foods</strong>, who — desperate for a corporate win and not knowing the true source — turns it into the wildly successful junk food <strong>Amber Gel</strong>.</p>
       <p>To promote Amber Gel, Strice hires reclusive megasimstar <strong>Euphoria</strong> for a series of public appearances. Rival <strong>Ludivenko</strong> wants to spoil the launch and arranges (through a Fixer and a team of shadowrunners) to make Euphoria <em>disappear</em> before the first appearance. She is recovered — but Ludivenko then cuts a copycat deal for its own product, <strong>Blue Bacosoy</strong>.</p>
       <p>Fearing the fiasco plus Ludivenko's competition, Burroughs tells Craft to "take care of Euphoria." The near-mad shaman — psychotically fixated on the star — instead seizes his chance to make her his <strong>Queen</strong>. Craft's Soldiers raid Euphoria's penthouse during a home-studio simsense recording session, slaughter her bodyguards, and take her to the Hive to begin the Queen-summoning and place her in a cocoon for metamorphosis. Unknown to Craft, her sim-rig kept recording throughout.</p>
       <p>With Euphoria gone again, <strong>MegaMedia</strong> puts her former manager, now VP, <strong>Robert Carrone</strong>, in charge of getting her back. Carrone hires the runners. The clock is the cocoon: the players must find and free Euphoria before her metamorphosis completes.</p>`),
    page("GM Overview — Queen Euphoria", "How the Adventure Runs (Two Acts)",
      `<p>The adventure runs in <strong>two acts</strong> with a twist between them:</p>
       <p><strong>Act 1 — The Job (p.8–24).</strong> A Fixer puts the team in front of a Johnson working for <strong>Ludivenko</strong>. The job: make simstar <strong>Euphoria</strong> <em>disappear</em> before her first Amber Gel appearance — a kidnapping, not a hit. The runners case her, grab her (<em>To Catch A Star</em>), hold her (<em>Holding Euphoria</em>), and get paid (<em>Payday</em>). As far as they know, that's the run.</p>
       <p><strong>Act 2 — The Hunt (p.25+).</strong> Later, Craft's Soldiers take Euphoria from her penthouse for real. MegaMedia — tipped by Ludivenko about who pulled the first job — has <strong>Robert Carrone</strong> hire the <em>same team</em> to find her, half-suspecting they're involved again. The twist: the runners are hired to rescue someone they themselves kidnapped weeks ago, for a client who doesn't fully trust them. From the penthouse the trail runs through Strice Foods (physical and Matrix), Craft's <strong>Magic Crafts</strong> shop, MegaMedia, and finally the <strong>Hive</strong>.</p>
       <p>Each scene follows the standard SR2 format: <strong>Tell It To Them Straight</strong> (read-aloud), <strong>Behind The Scenes</strong>, and GM notes. Cast stats (and the Strice host + IC) are in the <em>Queen Euphoria — Cast</em> compendium; placeholder maps are in <em>Queen Euphoria — Scenes</em>.</p>`)
  ]),

  journal("The Adventure — Scene Prep", [
    page("The Adventure — Scene Prep", "ACT 1 — The Job: Wake Up Call / Off and Running (p.8–10)",
      `<p><strong>The hook.</strong> A Fixer (e.g. Diablo) puts the team in front of a Johnson working — deniably — for <strong>Ludivenko</strong>. The job pays well and sounds simple: make simstar <strong>Euphoria</strong> <em>vanish</em> for a while, before her first public appearance promoting Strice Foods' <em>Amber Gel</em>. It's a snatch-and-hold, not a hit; the client wants her embarrassed and off the schedule, not hurt.</p>
       <p><strong>GM notes.</strong> Don't reveal Ludivenko or the Amber Gel angle yet. Let the team do the legwork to case Euphoria — reclusive, guarded, and at Pacific Towers / her studio. This is a straightforward run whose whole point is the later twist: everything the team learns about Euphoria here pays off when they're hired to <em>find</em> her in Act 2.</p>`),
    page("The Adventure — Scene Prep", "ACT 1 — To Catch A Star / Holding Euphoria / Payday (p.13–24)",
      `<p><strong>The grab.</strong> Pacific Towers and the surrounding scenes let the team scout and then take Euphoria (<em>To Catch A Star</em>). She is arrogant and uncooperative but not a fighter (see her stat block). The team holds her (<em>Holding Euphoria</em>) until the client's window passes, then hands her back and collects (<em>Payday</em>). Ludivenko gets its sabotaged launch; the runners get paid and move on.</p>
       <p><strong>GM notes.</strong> Keep it clean — the tone here is a caper, in deliberate contrast to the horror of Act 2. Note who the team is and how they operate; Ludivenko later sells that description to MegaMedia. Map: <em>Pacific Towers</em>.</p>`),
    page("The Adventure — Scene Prep", "ACT 2 — The Twist: Meeting Carrone (p.28–29)",
      `<p><strong>The hire.</strong> Weeks later, <strong>Robert Carrone</strong> — MegaMedia VP and Euphoria's manager — hires the <em>same team</em> to find and recover Euphoria after her <em>second</em> disappearance. The twist: Ludivenko tipped MegaMedia about who pulled the first kidnapping, so Carrone is hiring the very runners who took her before — half to use their knowledge of her, half because he suspects they're involved again.</p>
       <p><strong>GM notes.</strong> Carrone is calm, ruthless, and watching them. He won't volunteer that he knows about Act 1 unless the players force it; play the tension. He is the paymaster and information broker for the hunt. This time Euphoria was taken for real — by Craft's Hive.</p>`),
    page("The Adventure — Scene Prep", "Missing Again — Euphoria's Condo (p.30–33)",
      `<p><strong>Tell it to them straight.</strong> The penthouse is a slaughterhouse. Euphoria's bodyguards have been torn apart in ways nothing Human could manage — chitin gouges, dissolved tissue, the reek of formic acid. The home simsense studio is wrecked.</p>
       <p><strong>The key clue.</strong> Searching the studio turns up the <strong>simsense recording</strong> Euphoria was making at the moment of the attack (a Perception or Electronics test to notice the rig kept running). Played back, it shows — in first person — something monstrous breaking in, killing the guards, and seizing her. A sharp viewer catches glimpses that point toward an <strong>insect spirit</strong> and, faintly, the Ant motif.</p>
       <p><strong>GM notes.</strong> This scene sells the horror and hands the players their thread: this was not a normal snatch. Map: <em>Euphoria's Condo</em>.</p>`),
    page("The Adventure — Scene Prep", "Royal What? — Royal Meadows (p.12)",
      `<p><strong>Where Euphoria is actually being held</strong> in the early adventure — a cheap rented flat at Royal Meadows, supplied by <strong>Ludivenko</strong>. This location has a printed floorplan and, until this revision, had no scene in the module at all.</p>
       <p><strong>Play it cramped.</strong> The flat is <strong>8 × 3 metres</strong> — 24 m² for a living room/kitchenette, a bedroom with two double beds squeezed side by side, a closet and a bathroom. That is not a mistake in the map: the book says these units are packed with people and that the owners have accommodated the overcrowding by adding more beds. There is nowhere to take cover and nowhere to flank.</p>
       <p><strong>What a search turns up.</strong> The cupboards hold sealed dehydrated food, courtesy of Ludivenko. The dresser drawers and the closet hold women's clothing in average size, <em>still in plastic wrap</em> — bought for Euphoria, not by her. That detail alone tells the runners someone is keeping her here rather than hiding with her.</p>
       <p><strong>Texture for the squalor:</strong> one of the two chairs will break if anyone sits on it, the refrigerator's freezer does not work, the sink's water filters are disgusting, the living-room ceiling air filter badly needs changing, and the bathroom's hot water faucet does not work.</p>
       <p><strong>If the runners annoy the building manager</strong>, about <strong>100¥</strong> calms him down.</p>
       <p>Map: <em>Royal Meadows — Flat</em>.</p>`),
    page("The Adventure — Scene Prep", "Legwork — Dossiers (p.56–61)",
      `<p>Legwork around Strice Foods, Ludivenko, and MegaMedia fills in the corporate triangle behind both abductions. Key names:</p>
       <ul>
         <li><strong>Vincent Burroughs</strong> — the Strice Foods exec who secretly buys Craft's substance to make Amber Gel, and who tells Craft to "take care of" Euphoria (a social contact / journal dossier, not a combatant).</li>
         <li><strong>Solomon Daniels</strong> — Craft's Fixer, who offered him the run that restarted his shadow career.</li>
         <li><strong>Osprey</strong> and <strong>Stone</strong> — muscle in Craft's orbit (representative combatant actors are in the Cast compendium).</li>
         <li><strong>Ludivenko / Strice / MegaMedia</strong> — the corps; Ludivenko is the hidden hand behind Act 1.</li>
       </ul>
       <p><strong>Rewards funnel.</strong> The paydata trail (see Hacking Strice) links Amber Gel to a mysterious supplier and to Craft's talismonger shop, <strong>Magic Crafts</strong> — the door to the Hive.</p>`),
    page("The Adventure — Scene Prep", "Hacking Strice (p.34)",
      `<p>If the team decks Strice Foods, run it against the <strong>Strice Foods Host</strong> actor (see the Cast compendium) and its IC. The system holds no vital clue, but it is profitable and it ties Amber Gel to Craft: purchase-order records (DS-1) show the plant receives only jars, blue coloring, and low-grade nutrisoy — no way to make a stuffer from that alone — plus the MegaMedia payment (1,280,000¥ for Euphoria's three appearances) and Knight Errant security expenditures. A rent memo or payment can point at <strong>Magic Crafts</strong> and Craft.</p>
       <p><strong>Paydata:</strong> DS-1 4×70 Mp (~28,000¥), DS-2 3×80 Mp (~60,000¥), DS-3 2×40 Mp (~4,000¥). <strong>Trap:</strong> an external alert shuts the whole system down within two minutes; a Trace prints at Burroughs' terminal and he calls Lone Star. Per-node Security Codes and TNs are documented on the host actor's notes.</p>`),
    page("The Adventure — Scene Prep", "The Magic Shop — Magic Crafts (p.39–40)",
      `<p><strong>Craft's talismonger shop.</strong> The trail leads here. Craft appears (when present) as a filthy, unkempt man reeking of regurgitation, his behavior swinging between the affable merchant and the Ant-crazed shaman. The shop is a front and a bolthole; astral traces, ritual materials, and the smell of the Hive are all present to a careful investigator.</p>
       <p><strong>GM notes.</strong> Craft is a dangerous full magician (Sorcery 6 / Conjuring 5, Ant totem) — see his stat block. Do not let the team corner him easily; he would rather flee to the Hive with his prize than fight to the death in his shop. Map: <em>Craft's Magic Shop — Upper Level</em>.</p>`),
    page("The Adventure — Scene Prep", "A MegaMedia Production (p.41–42)",
      `<p>A MegaMedia studio scene — pressure from the corp, a public-appearance angle, or a staged event tied to the Amber Gel promotion. Use it to raise the stakes and the clock, and to give social characters room to work. Map: <em>MegaMedia — Simsense Studio</em>.</p>`),
    page("The Adventure — Scene Prep", "Audience With The Queen — The Hive (p.43–52)",
      `<p><strong>The climax.</strong> The team descends into Craft's Hive to free Euphoria before her metamorphosis completes. It is a nest of chambers, cocoons, and larvae, defended by <strong>Soldier</strong> and <strong>Worker</strong> ant spirits (true and flesh forms — see the Insect Spirits primer and the Cast compendium). Craft is here, at the height of his madness, summoning his Queen.</p>
       <p><strong>Euphoria</strong> is cocooned and mid-metamorphosis; every round of delay is a round closer to losing her. Freeing her is a matter of cutting her loose and getting out — through the Hive's defenders.</p>
       <p><strong>GM notes.</strong> Workers scream to summon Soldiers and throw themselves at attackers near the cocoons or the Queen. <strong>Read the Insect Spirits primer first</strong> — it was rewritten from the printed tables and three rules this module previously used were wrong (there is no Immunity to Normal Weapons, armour is Force × 1 and only on True Forms, and melee uses ordinary skill).</p>
       <p><strong>Maps:</strong> <em>The Hive — Main Level</em> (p.44) then <em>The Hive — Lower Level</em> (p.45). The Lower Level is <strong>dark: neither light nor power</strong>, and every internal wall is <strong>Barrier Rating 3</strong> — the book says Soldiers making an all-out attack will use the thin walls to their advantage, so let them come through walls.</p>
       <p><strong>Printed occupants of the Lower Level</strong> — place these rather than improvising:</p>
       <ul>
         <li><strong>Room 1</strong> — the elevator arrives here. Empty unless the Hive has been alerted.</li>
         <li><strong>Room 3</strong> — six Flesh Form Workers (F1), two Flesh Form Soldiers (F3).</li>
         <li><strong>Room 8</strong> — the stairway exits here. Two Flesh Form Workers (F1).</li>
         <li><strong>Room 14</strong> — four Flesh Form Workers (F1), two Flesh Form Soldiers (F3).</li>
         <li><strong>Room 15</strong> — five Flesh Form Workers (F1) and a lone Flesh Form Soldier (<strong>Force 5</strong>).</li>
         <li><strong>Room 16</strong> — the Hive Room. The climax.</li>
         <li>Rooms 2, 4–7 and 9–13 are as Room 1.</li>
       </ul>`)
  ]),

  journal("Insect Spirits in SR2E — GM Primer", [
    page("Insect Spirits in SR2E — GM Primer", "Running the Ant Spirits",
      `<p><strong>This page was rewritten on 2026-08-03 and previously taught three rules the book does not contain.</strong> If you read the old version, discard it — the corrections are called out below, because each one changes the climax substantially.</p>
       <p>Queen Euphoria <em>prints full critter tables</em> for its insects (p.38, 47, 49–52). The actors in the Cast compendium are transcribed from them. There are <strong>five printed blocks</strong>, on a Flesh/True × Force axis:</p>
       <table><thead><tr><th>Block</th><th>B Q S / I W</th><th>Armour</th><th>Attack</th></tr></thead><tbody>
         <tr><td>Flesh Form Worker (F1)</td><td>2 2 2 / 1 1</td><td>none</td><td><strong>none</strong></td></tr>
         <tr><td>Flesh Form Soldiers (F3)</td><td>6 6 6 / 1 2</td><td>none</td><td>8M</td></tr>
         <tr><td>Flesh Form Soldiers (F5)</td><td>8 8 8 / 3 2</td><td>none</td><td>10M</td></tr>
         <tr><td>True Form Soldiers (F3)</td><td>4 7 7 / 1 2</td><td><strong>3/3</strong></td><td>9M + Special</td></tr>
         <tr><td>True Form Soldiers (F5)</td><td>6 9 9 / 3 2</td><td><strong>5/5</strong></td><td>11M + Special</td></tr>
       </tbody></table>
       <p>There is <strong>no True Form Worker</strong> and <strong>no Force 4 anything</strong>. Attack codes are the printed SR1 values converted by core p.283 method B.</p>
       <h3>The three corrections</h3>
       <ul>
         <li><strong>There is no Immunity to Normal Weapons.</strong> It is not among the printed Powers. The old primer said bullets simply do not hurt a manifested ant — they do, and the whole fight is balanced on that. The complete printed Powers list is Enhanced Senses (Smell), Pain Resistance, Manifestation, Paralyzing Touch and Venom.</li>
         <li><strong>Armour is Force × 1, and only on True Forms.</strong> Not 2 × Force, and <strong>Flesh Forms have no armour at all</strong>. Doubling made every True Form twice as tough as printed.</li>
         <li><strong>Melee uses ordinary skill.</strong> The Flesh Soldiers print <strong>Unarmed Combat 3</strong>. Attackers do not roll Willpower.</li>
       </ul>
       <p>All three came from Double Exposure's ants and were never true of this adventure's.</p>
       <h3>What the sheet does not automate</h3>
       <ul>
         <li><strong>Powers and Weaknesses are prose on each actor's bio</strong> — the NPC data model has no field for them. Read them before the fight.</li>
         <li><strong>Astral:</strong> +5 Initiative when acting astrally (the bracketed second Reaction on the printed block). Deliberately not baked into Reaction, which would also inflate dodge and defence.</li>
         <li><strong>Essence</strong> is printed with an <code>A</code> qualifier the model cannot store; the number itself is exact.</li>
       </ul>
       <h3>Weaknesses — how the runners are meant to win</h3>
       <p>The True Forms have <strong>Reduced Senses (Sight)</strong> and <strong>Vulnerability (Insecticide)</strong>. The Flesh Worker has Reduced Senses (Sight). <strong>The insecticide vulnerability is the intended route through the climax</strong> — an Amber Gel plant is exactly where a party would find some. Do not let it go unnoticed.</p>
       <p><strong>Flesh Form rule:</strong> a Soldier adds its Force to the host's Physical attributes; a Worker reduces the host's Physical by 1; both use the spirit's Mental attributes. Flesh Forms are dual beings and cannot astrally project. Workers are cowards — they screech to warn the Hive and throw themselves in front of attacks aimed at the cocoons or the Queen.</p>
       <p>Defeat one by destroying its physical body, <strong>banishing</strong> it, or beating it in <strong>astral combat</strong>. The <strong>Queen is a non-combat set-piece</strong> — the book says outright she does not appear.</p>`)
  ]),

  journal("Picking Up The Pieces (p.53)", [
    page("Picking Up The Pieces (p.53)", "Resolution & Payment",
      `<p><strong>Success</strong> is freeing Euphoria before her metamorphosis completes and getting her out of the Hive alive. MegaMedia (Carrone) pays the agreed fee; a clean, quiet recovery earns a bonus and a powerful media contact. If the team also cracked the Amber Gel / Craft / Strice conspiracy, they hold leverage worth selling — or worth keeping their heads down over.</p>
       <p><strong>Partial or failed</strong> outcomes: if Euphoria is lost, transformed, or the story goes public the wrong way, MegaMedia's gratitude curdles and Carrone looks for someone to blame. Ludivenko, Strice, and Lone Star all have reasons to remember the team.</p>`),
    page("Picking Up The Pieces (p.53)", "Awarding Karma (SR2E)",
      `<p>Award Karma per SR2 <strong>p.199</strong>. This is a horror-tinged run, so aim for a <strong>team award of about 6–8</strong> total, then add small individual awards on top — <em>not</em> a bonus for every plot beat. Use the milestones below to <em>place</em> that team total, not to sum it:</p>
       <ul>
         <li><strong>Survived the adventure:</strong> the baseline team award (≈1–2).</li>
         <li><strong>Solved the mystery</strong> (penthouse simsense clue → Amber Gel / Craft / Strice trail): ≈2.</li>
         <li><strong>Achieved the objective</strong> — freed Euphoria before her metamorphosis completed: ≈3–4. A clean, quiet extraction is the top of that band; losing or transforming her drops it toward 0.</li>
         <li><strong>Defeating or banishing Craft</strong> and surviving the Hive folds into the objective award rather than stacking on it.</li>
       </ul>
       <p>Then add <strong>individual</strong> awards (≈1–3 each, SR2 p.199) for good roleplaying, clever solutions, and personal heroics. Nuyen is the negotiated MegaMedia fee plus any Strice paydata fenced. (Note: "Threat/Professional Rating" is an NPC stat, not a Karma award — don't add it here.)</p>`)
  ]),

  journal("Player Handouts", [
    page("Player Handouts", "Newsnet — Successful Recovery",
      `<blockquote><p><strong>KSAF NEWSNET —</strong> Simsense superstar <strong>Euphoria</strong> was recovered unharmed today after what MegaMedia Entertainment calls "a private security matter." The megastar's spokesperson thanked "the professionals who brought her home" and confirmed she is resting in seclusion. MegaMedia declined to comment on rumors linking the incident to the snack-food maker <strong>Strice Foods</strong> and its runaway hit <em>Amber Gel</em>.</p></blockquote>
       <p><em>Hand out on a clean rescue.</em></p>`),
    page("Player Handouts", "Newsnet — Failed Recovery",
      `<blockquote><p><strong>KSAF NEWSNET —</strong> Fans held a candlelight vigil outside MegaMedia Tower tonight after the entertainment giant confirmed that simstar <strong>Euphoria</strong> "remains missing and is presumed lost." No group has claimed responsibility. Sources hint at a botched private recovery operation; MegaMedia would say only that "every effort was made." Meanwhile <em>Amber Gel</em> sales continue to climb.</p></blockquote>
       <p><em>Hand out if Euphoria is lost or transformed.</em></p>`),
    page("Player Handouts", "The Simsense Recording (penthouse clue)",
      `<p><em>Playback, first person, Euphoria's point of view:</em> the studio lights, a joke half-spoken — then the wall gives way. Something huge and <strong>wrong</strong> comes through: chitin, too many angles, a smell like an anthill and acid. Screams that are cut short. The recording jars, tilts, and a clawed, glistening limb fills the frame before everything lurches and goes to static.</p>
       <p><em>Hand out (edited) when the team recovers and plays the penthouse simchip.</em></p>`)
  ])
];

let n = 0, pg = 0;
for (const j of JOURNALS) {
  writeFileSync(`${DIR}/${safeName(j.name)}_${j._id}.json`, JSON.stringify(j, null, 2) + "\n");
  n++; pg += j.pages.length;
}
console.log(`wrote ${n} journals (${pg} pages)`);
