# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG: five hero classes, hatchable companions, the floating stronghold Duskhold,
six portal zones (three field instances and a Sovereign's Den each; the Wave Trials were removed in v135), mounts, fishing, crafting at town stations and online co-op.
Published as the claude.ai artifact https://claude.ai/artifact/FEvfiU5RumGQJEgpwsDobC (v114 onward, as `dist/artifact/index.html` + `game.js`; saves are per link — move a hero with Settings → Export / Import save). Older links: v113 at Aa14wfN7jNYFh5b1yN8EQu, v106–v112 at QG2zZH4KMW4zTTfaJQGots, v105 at GZsCSNZGgULRRkVLdYHPmw, v102 at CMvAWZi8x1qbMZp9SkBpGL (each stopped at that version because a single-file page is too large for a new session to re-read before republishing). (The pre-v102 link was retired.)

## Layout

```
src/page.html      the page: markup, with /*@@CSS@@*/ and //@@JS@@ where the stylesheet and the game script go
src/style.css      the head stylesheet
src/js/NNNN-*.js   the game script in load order (one file per feature section; ~190 files, none over ~60 KB)
build/assemble.py  joins the three into one page
build/split.py     -> dist/artifact/index.html (markup + stylesheet, loads game.js) + dist/artifact/game.js, for publishing
build.sh           -> dist/ashen-wilds.html, then `node --check` on the script, then the split
test/              headless Playwright tests (see Testing)
tools/deadcode/    finds top-level code nothing can reach (see Cleaning up)
```

The files in `src/js` are plain JavaScript concatenated in file-name order into one `<script>`. What you read is
exactly what runs: there is no patch step. The number prefix is the load order (gaps of 10 leave room; a new feature
goes in a new file, numbered after the code it depends on, usually at the end: `1860-v103-<topic>.js`).
The name says which version added the section; files without a version are the original game.

Find things with grep: `grep -n "function hud\b" src/js/*.js`. Useful starting points:

| system | file(s) |
|---|---|
| main loop `loop()`, prompts, vendors | `0104-vendors-main-loop.js` |
| classes, skills, talents (unused since v139), item templates `ITPL`, creature families | `0110-v2-*` |
| enemies, damage, XP, loot (`genItem`) | `0120-v2-*`, `0410-v49-9-gear-sets*` |
| zones (`PMAP`, `pmGen`, `pmDen`), zone instances (`INSL`, `insAt`/`rgAt`, `insG`), Sovereigns (`BOSSES`) | `0045-game-data-world-zones-bosses.js`, `1680`–`1690` (v89/v97 world), `1940` (v106/v108 instances) |
| save / load (`gameSnapshot`, `loadGame`, `x2Save`); export / import save codes (v114, `KQSX`, `kqsxEncode/Decode`, Settings + title screen) | `0230-v36-save-load*`, `0450-shared-prompts*`, `2140-v114-save-export-import.js` |
| co-op (`MP`); v116: `MP.room` relay over backends (`MPX`, `mpUse`, `mpAttach`, `mpSolo`) | `0520-v58-online-co-op*` |
| v116 character slots (`KQSL`, `kqSlotSet`, `kqSlotInfo`, title slot list) | `0230` (keys), `2145-v116-character-slots.js` |
| v116 join-code co-op: WebRTC + PeerJS signaling (`KQN`, `kqnRoom`), join window / co-op box (`kqjOpen`, `kqcHost`, `kqcJoin`) | `2150-v116-code-coop-net.js`, `2160-v116-code-coop-ui.js` |
| v116 co-op visuals: partners' companions, poses, effects, ghost shots, companion moves (`MPV`) | `2170-v116-coop-visuals.js` |
| Duskhold (v101: one Grand Square, Portal Road with gates I–VI; v109: walls sized by stage, see Kingdom size), portals, `enterMap` | `0510-v56-duskhold*`, `0045` (layout numbers `TWN100_*`, `PCOURT`), `1020`–`1030` (v88 town), `1820`–`1850` (v100/v101 town) |
| stronghold shops `SHOPS` / upgrades `SHU` | `0530-v62-stronghold*` |
| v103 kingdom: building lots `LOT103` (`SH.pos`), houses + citizens `HS103`, the one Steward window, working shopkeepers `WK103` | `1860`–`1900` (v103) |
| v109 kingdom size (`KF109`, `kf109()`, `kfApply109`: walls, tiles, paving, dressing, outskirts per stage), turning buildings (`SH.rot`, `kfRotate109`, `kfDoors109`), shop upgrades (`SHP109`, `shpP109` discount, stock hooks) | `1960-v109-kingdom-growth-shop-upgrades.js` (hooks in `0140`, `0170`, `0430`, `0490`, `0590`, `0860`, `1820`, `1860`, `1870`, `1880`, `1900`, `1910`) |
| v104 decorations (`DECO103`, the Steward's Decorations tab), citizen trades (`CZR104`: gatherer, egg collector, fisherman, hunter) | `1910-v104-decorations.js`, `1870` (roles), `1880` (menu) |
| v105 companion abilities: one motion + effect per spell (`SPX105`, motions `MV105`, effect toolkit `fx*`) | `1930-v105-companion-ability-moves.js` |
| v107 zone monster signature moves: per monster `MSIG107` (basic + 2 signatures), move handlers `MV107[n].x6` | `1950-v107-monster-signature-moves.js` |
| v105 flail: wide 3-hit sweeps (baked `flail0..2`) | `1920-v105-flail-wide-swings.js`, `test/v100_anim_moves.js` |
| v103 evolution preview (now → next stage in the Spells & Evolution tab) | `1890-v103-evolve-preview.js` |
| zone roster + respawn (`ROST`, `RESP_T`), atmosphere, grades | `0550-v71-*` |
| companions & eggs window, fusion window | `0570-v74-*`, `1780-v100-fusemenu*` |
| weapon types / mounts / Stable | `0580-v78-*`, `0590-v78-*`, `0790-v83-*` (gaits, specs), `1790`/`1810` (v100 mount models) |
| Sovereign fights (v110, souls-style): engine `SVB`/`svAI`/moves, then one file per boss (model, poses, moves) | `1970-v110-sov-core.js`, `1971`–`1976` (Argus, Hydra, Rime Wraith, Ssith'ra, Bloated One, Vaelric) |
| Sovereign dens (scenery, seal, colliders; their v86 hazards are off since v110) | `0910`–`0970` (v86 dens 0–5), `1100` (boss fx), `1180`–`1200` (v89 dens), `1650` (Ssith'ra) |
| abilities (points, ranks, effects) | `0990`–`1000` (v88), `1090` (v90 ranks), `1230`–`1240` (v91 fx) |
| cheats | `0980-v87-cheats*`, `1370-v89-misc*`, `1660-v90-ui*` (password), `3060-v147-cheats*` (all quests complete `cheatQuests147`, Max Duskhold `cheatDusk147`) |
| v148 owner's list: gathering tools aimed (`SK148`), camp clears (`CAMP148`: 5-min return, XP, chest), aimed spells during mouse-look, building footprints only where the model stands (`fp148Filter`), Duskhold outskirts one-time harvest (`OUT148`, saved `x2.out148`), Cheddar's quest board (`CHQ148`, `CHQD148`), decorations (`DC148_COST`, six new); v148.1 board tiers and companion and boss splash (`SPL148`, `BSPL148`) | `3070`–`3079` (edits in `0104`, `0108`, `1010`, `1270`, `0250`, `2350`, `3040`) |
| v149 Ssith'ra's body: the chain layout (`ssr149Post`: path = last frame's body, bend limits `SSR149.th0`/`th`, self-avoidance, smooth rearing curve, the dive pours down the hole), the flesh core tube (`ssr149Core`) and the remodelled segment armour (`ssr149Body`) | `3078-v149-ssithra-body.js` |
| loot, secrets, treasure maps, gathering nodes | `1330`–`1360` (v89 loot), `0102-gathering.js` |
| UI theme, icons, menus | `0020`–`0040` (v88 icons), `1040`–`1080` (v88 menus/theme), `1660`–`1670` (v90 ui) |
| hero / humanoid models | `0090`, `0800` (v83), `1400`–`1530` (v94), `1540`–`1550` (v95 armour), `0010` (v99 proportions), `2100`–`2130` (v114 beast races) |
| Beast races (v114: rat Warrior, cat Assassin, frog Mage (the raven since v134), badger Paladin, weasel Ranger): rig, body rings, paws, tails (`2100`), helmets over each skull (`2110`), the five races' heads and shapes (`2120`), creator/barber/saves/co-op (`2130`) | `2100`–`2130` (v114; replaces the v112 rat file) |
| v113 instance creatures: 24 new monsters for field instances II/III (`N3`, `n3Def`, `n3Mv`, `n3Zone`, keyframe tracks `n3Hum`/`n3Cr`) | `2000-v113-instance-creatures-core.js`, one file per zone `2010`–`2050`, `2090` (camps) |
| v123 camp sites: every camp's size (`C.r`), ground shape (`cs123Plan`, `cs123Terrain` from 0045), tile paint (`cs123Map`), set pieces (`cs123Designs`), title card on entry (`cs123Card`); no signposts | `2270-v123-camp-sites.js` |
| creature models | `0080`, `0610`–`0730` (v81), `0770` (v83), `1710`–`1770` (v100 evolve), `1800` |
| animation | `0740` (v81), `0890`–`0900` (v85), `1270`–`1320` (v93 grip/idle), `1700`–`1705` (v100) |
| performance (enemy LOD, light pool, shadows, frozen matrices) | `1610`, `1620`, `1630`, `1640` (v98) |
| performance: far-scenery cull (`FC`, `fcPass`) | `1980-v111-perf-far-cull.js` |
| v117 menus: ☰ list (no Fusion / Sovereigns; Kingdom button, B), Kingdom window tabs (Construction / Villagers `vlRender116` / Decorations), Companions ⇄ Fusion tabs (`cfTabs116`), forge only at the Blacksmith (`KQM_SMITH`), crossbow muzzle (`xbowMuzzle116`, `xbowLevel116`) | `2200-v117-menus-kingdom-villagers.js` (edits in `1880`, `1910`, `1050`, `0140`, `1010`) |
| v117 zone title cards (`zt116Show`, `ZT116.Z` styles per zone; replace the arrival banners) | `2210-v117-zone-title-cards.js` |
| v117 Mage carry hold (`FC116`: arm IK, upright staff, wand, orb; the frog's, since v134 the raven's) | `2220-v117-frog-carry.js` |
| v134 raven Mage gear: cloth head pieces fitted to the beak skull (`rvHood`, `rvHat`, `rvBand`, `rvEll`), the tail fan's robe opening, bird footwear (`rvBoots`) | `2370-v134-raven-gear.js` (the raven himself is race 3 in `2120`) |
| v117 creator class step (`cc116Model`: current beast + starting gear, heroic poses `CC116.P`, effects `CC116.FX`) | `2230-v117-creator-heroic.js` |
| v119 ability preview in the Abilities window: the real ability on a training stage (`abxShow`, sandbox `abxIn`/`abxOut`, `ABX`) | `2240-v119-ability-preview.js` |
| v122 companion heal / shield / buff spells pick their target: the hero or any companion, whoever needs it most (`supPick122`, `compSup122`; companion shields and buffs in `SUP122`, never saved) | `2260-v122-companion-support-targets.js` (edits in `0130` compCast, `0870` compSpells, `1930` recipes draw at `x.hp`) |
| v124 clean map edges: the rim of every zone instance is a tidy row of themed ledge stones with a spaced row of themed scenery behind (`v124Edge`, kits per instance), the old rim trees and boulders are no longer drawn (`v124Rim`), choppable trees grow in groves inside the fields (`v124Groves`) | `2280-v124-clean-edges.js` (hooks in `0045`, `0060`, `0070`, `1680`) |
| v127 balance: companion spells (`BAL127_CSP`), ability factors (`KQR_TUNE`), class knobs, weapon identities (`WTYPE.k`, `MW`, `WB127`), companion self-reaction fix (`CH127`), knife volleys | `2300-v127-balance.js` (knobs `WB127` in `0580`, no-lunge throws `SWNOL` in `1710`) |
| v128 Whirlwind hold: while the warrior spins, two-handed weapons (greatsword, great axe, halberd) are held out level in both hands (arm IK `fc116IK`), dual axes one in each outstretched hand, edge leading (`WW128`, `ww128Tick`, after every animation layer; visual only). Companions follow the facing from before the spin (`plFaceY`, used in `compTick`), so they no longer circle the hero | `2310-v128-whirlwind-hold.js` (edit in `0860`) |
| v132 Cheddar, the quest-giving mouse: model (`chd132Model`, from the Cheddar NPC Model concept page, game-ready: 3 skinned meshes) and per-instance quests (`CHQD132`, state `CHQ132.st`, window `XR.chq132`, tracker `#chqt132`, events `chqEv132`) | `2340-v132-cheddar-model.js`, `2350-v132-cheddar-quests.js` |
| v133 Sovereign footwork: sturdier posture (`POS133`), retreat after heavy damage (`RT133`), spacing plans (`PL133`, `svPlan133`) | `2360-v133-sov-spacing.js` |
| v135 Cheddar at both ends: in front of every arrival spot (`chqSpot132`) and before every field's end gateway (`chqSpotEnd135`, posts `CHQ132` / `CHQ132.e`), marked on the minimap and the N map | `2350-v132-cheddar-quests.js`, `2380-v135-cheddar-map.js` |
| v135 bow: one string while drawing (the model's string is material `s`, hidden while `BOW_FX` shows), a smaller shallower bow (`BOW_K`, `BOW_KX`, `BOW_T` in 0780), carried level across the front of the hips (`V100A_BOW.x135`, `bow135Carry` after every animation layer) | `0780`, `0890`, `2390-v135-bow.js` |
| v135 the entrance portal of an instance opens the travel window (`XR.portal135`: reached instances, "you are here", Duskhold) | `2400-v135-instance-travel.js` |
| v135 ability preview: the main loop sees the world's hero spot while a preview runs (`loop` wrapper, `ABX135`) | `2410-v135-abil-preview-pin.js` |
| v135 camera: only the ground moves it (0104 `blk`); scenery between camera and hero fades (dithered, `F135`, `f135Patch` on plain and `txa1` materials) | `0104`, `2420-v135-camera-fade.js` |
| v135 nothing of a neighbouring instance shows (`CLIP135` rect: terrain, plants, faded scenery discard outside it; far cull hides whole objects outside it) | `2430-v135-instance-clip.js` |
| v135 no Wave Trials (portal row, trial portals, `waveStart` gone; old saves in a trial go home) | `0510`, `2440-v135-no-wave-trials.js` |
| v135 hatch reveal: the list works without Continue (`hatch135Free`) | `2450-v135-hatch-no-continue.js` |
| v135 second ring slot `ring2` (`SLOTS`, `eqSlot135`, `RING135.to` for drag and drop, paper doll under the boots) | `0110`, `0140`, `1050`, `1670`, `2460-v135-second-ring.js` |
| v135 deaths: a short shove, the body topples onto its side, lies 1.5 s and fades (`death135Ease/Lift/Fade`) | `0120`, `0350`, `2470-v135-death-fall.js` |
| v135 cat head remade (round skull, whisker pads, ruffs, `brCatEyes135` slit eyes under heavy lids, wide ears) | `2120` |
| v135 uniques: an amulet, a ring and a weapon per zone (`UNQ135`, `it.u`, bespoke kits; weapons get the zone's ornaments `UNQ135_ORN`), 1 in 2,000 kills / 1 in 300 elites in field instances; fishing-only uniques (`src:'fish'`, `UNQ135_FISH`) | `2480-v135-zone-uniques.js`, `2490-v135-fishing-rares.js` |
| v135 right click toggles mouse-look (middle button still turns the camera while held) | `0108` |
| v136 gear redesign: measured cloth kit (`gkPts`/`gkRows` hulls, `gkSurf` grids, `gkHood`, `gkSkirt`, `gkCape`, `gkCollar`, `gkSleeve`, trinkets `gkSkull`/`gkBook`/`gkVial`/`gkCandle`/`gkChain`…, late builds `gkLater`), hoods for every race (`GK_HOOD`, `GK_HELM`), the Mage's robes and head pieces (`MG_ST`, `mgRobe`, `mgHat`), the Assassin's gear (`AS_ST`, `mdChL`, masks `asMask`, footwraps `asBoots`), hanging skirts + Warrior / Paladin / Ranger details (`hvExtra`, `mdExtra`), weapon details (`wpX`), item pictures on the animal (`mdItemKit`) | `2500`–`2560` (v136) |
| v137 companion bodies: rig variants (`RV137`, `rv137`) — Gloomcap / Sporelord, Wispling / Lumenwisp / Soulwarden (cowl `wsp137Hood`), Gravewyrm / Venomcoil (`WY137`), Batwing / Duskwing fur | `2600`–`2630` (v137) |
| v137 enemy bodies: toolkit (`e137B`, `e137Rows`, `e137Limb`, `e137Quad`, `e137Claws`), own bodies for Blood Hound, Bone Hound, Blood Bat (rig `BloodBat`), Mire Croaker, Basilisk, Snapper, Sun Scarab (middle legs `x.mid137`), Rimeshell Crawler, Storm Harpy, Dust Wyrm, Banshee, Fungal Shambler (rig `Shambler`); older foes rebuilt (`FOE137`, `f137Reg` into `N3.humB`), Goo / Maggot / Scorpion touch-ups | `2640`–`2665` (v137) |
| v137 animal townsfolk: every Duskhold NPC is a warm-blooded animal (`FK137`, `fkBody` via `idlNpcBody`, parametric skulls `fkSN`, ears / horns / antlers / paws / hooves, 21 species, `FKO` costumes per keeper, citizens by trade `FK_ROLE`, tail + ear animation `fk137Anim`) | `2800`–`2830` (v137) |
| v142 townsfolk anatomy: sculpted heads per species (`FKH` recipes, `fksLoft`, `fksEars`), carriage, lean, digitigrade / hoofed / bird legs, necks, eyes, trinkets on clothes (`FK142`, `fk142Deform`, `fk142Eyes`, `fk142Hug`) | `3010`–`3013` (v142) |
| v137 ability evolution: every class ability evolves at rank 5 (`EVO137` per class, `ev137Evolve`, `ev137Cost` = last rank + 4 ⚡, saved as `hero.tal['__ev:<name>']`), evolved copy cast through `cast` (`ev137Sk`), new effects (`ev137Sigil/Column/Shock/Flare/Lance/Fall/Crescent/Shards/Orbit/Rift/Impact`, projectile models `ev137Proj`), poses `ATK.evoCast/evoRaise/evoNova/evoFlex` | `2700-v137-ability-evo-core.js`, `2710-…-fx.js`, `2715-…-kit.js`, `2720`–`2740` (warrior, paladin, assassin, ranger, mage) |
| v138 ability balance: every damaging ability valued by delivery type, area and extras (`KQR_TUNE`), evolved forms (`BAL138_EVO`, per class `BAL138_EVOC`), spread-shot volleys (`BAL138.vol`), Death Mark, class knobs | `2900-v138-ability-balance.js` |
| v137 new gear: 150 templates appended to `ITPL` (`ITPL_V137`, `v7` model key, `A137L` armour lines), `genItem_base` empty-pool fix, armour motifs measured onto the built body (`a7Ring`, `a7Put`, `A7MOT`), weapon recipes (`W137`, `w7Blade`), shields (`SH137`), jewellery (`J137`, worn pendant / ring fitted with `j7Put`) | `2750`–`2790` (v137) |
| v139 attributes (replace talents): `ATR139` (6 attributes, points per level, per-point stats, 10/25/50/75 bonuses, Auto mix per class), points in `hero.tal['__at:<key>']`, staged spending (`atr139Add/Apply/Undo/Auto/Reset`), `talMods`/`talRank`/`talSpent` redefined, flat level gains ×`ATR139.flat`; the inventory block under the hero | `2930-v139-attributes.js` (`tpFree` in 0120) |
| v139 Character window (C; the old `#tal` window): hero model on `PV`, attributes, all stats with pending previews, attribute bonuses (`ch139Render`, `ch139PV`) | `2940-v139-character-window.js` (keys in `0108`, `1010`) |
| v139 power scale (`pwr139` = 4·√old, `recPower` on the same scale, `rpTxt139` labels), flail trail at the ball's reach (`FL139`, `fl139Reach`), preview loop restart (`pvKick139`), enemy size / ground guard (`G139`, `g139Tick`) | `2950-v139-fixes.js` |
| v140 creator fixes: Ranger victory pose (`CC116.P.ranger`, `cc140Bow`); the Mage hold's frame (`fc140Fwd`, `fc140Scale` in 2220); whole-word material hints (0840) | `2960-v140-creator-fixes.js` |
| v141 owner's list: Q feeds the most hurt companion (`feedLowest141`), Z / X potions, 6 ability keys (`KQS_SLOTS`), the second companion slot (`actN141`, `cs141*`, Beast Trainer "Companion Bond", `hero.tal.__cs2`), break poise ×2 (`KQP.pz`, `cbHeavy`), quieter effect text (`FX141`), level growth −60% (`LV141`), power signs repainted (`rp141Refresh`), outskirts wood / stone (`OUT141`) | `2970-v141-owner-list.js` (edits in 0104, 0108, 0130, 0170, 0990, 1010, 2350 quests, 1960 pines) |
| v141 minimap: fog of war per instance (`MF141`, `mmFog` drawn after `mmB`, saved as `x2.fog141`), found gathering spots, facing arrow (`miniArrow`), N-map arrow | `2975-v141-minimap-explore.js` |
| v141 menus keep their scroll (`KS141`, MutationObserver per window, `rX` wrapper); compact item panel (`#idt` CSS) | `2980-v141-menus.js` |
| v141 bestiary pages: picture (`dex141Make` on `CPIC.r`), stats (`enStats`), where it lives (`dex141Where`), drop table (`dex141Drops`), Sovereign stats | `2985-v141-bestiary.js` |
| v141 orb attack: hand out, orb floating over the palm (`ORB141`, `orb141K` from `HA.cur.k`), bolt from the orb (`orbChain`) | `2990-v141-orb-cast.js` |
| v141 gathering motions and tools (`SK141`, `SK141_T`: chop / mine / dig / forage / wade / cast / hold / jerk; hatchet, pickaxe, spade, rod with line); the Bard's lute (`bard141`) | `2995-v141-skilling.js` |
| v141 Sovereigns: quicker charged wind-ups (`sv141K`), disengage from melee (`sv141Force`), Reach eruptions + chase vs kiting (`reach141`), fought once (`spawnBoss` wrapper, `sv141Clear`) | `3000-v141-sovereigns.js` |
| v143 The Lantern Road (Kindlelight I main quest): outpost layout `mq143Plan` / decoration keep-out `mq143Keep` (called from 1680 `place`), the Lantern Wardens (`MQW143`, `mqw143Make`, `mqw143Anim`, helms `mqw143Helm`), models (`MQM143`: `mqm143Ripper`, `mqm143Lamp`, outpost pieces, `mqm143Bulb`), quest state `MQ143` (glowbulb drops, lampposts, the Ripper's roll and fire-up, dormant gateway, tracker `#mqt143`, window `XR.mq143`, map marks) | `3020`–`3023` (edit in 1680) |
| v144 The Glowmire Crystal (Kindlelight II main quest): Vorraxis model (`MB144`, `mb144Build`, poses `MB144P`, `mb144Loco`/`mb144Post`), his moves (`MB144M`, lair arena `MB144A`, `svCtx`/`svHitNow` wrappers), the hatch, the Seeping Lair (INSL[4]), the fight controller `mb144AI`, quest state `MQ144`, crystal, sealed II→III gateway | `3031`–`3033` |
| v145 The Three Sigils (Kindlelight III main quest): sigil layout `mq145Plan` / keep-out `mq145Keep` (called from 1680 `place`), sigil model `ms145Sigil`, ghost wolves (`EN.ghostwolf`, look `gw145Look` via a `cr` wrapper), the essence charging ritual (`MQ145.R`, `mq145Start`/`mq145RTick`/`mq145Attune`/`mq145Fail`), sealed Den gateway, tracker, map marks | `3040` (edit in 1680) |
| v146 Sovereigns to the Vorraxis standard: shared kit (`sk146*`: springs `B.spr`, effects, props, ring waves, den state `A.s146`, smoother strike ease), Argus rebuilt (`argBuild146`), and per boss a Phase II den change + signature mechanic + model/effect upgrades | `3050` kit, `3051` Vaelric, `3052` Rime Wraith, `3053` Bloated One, `3054` Argus, `3055` Hydra, `3056` Ssith'ra |

## Conventions (read before changing code)

- **Later definitions win.** Many systems were built by later sections wrapping earlier functions:
  `{const f=hud;hud=function(){f.apply(this,arguments);…}}`. Before changing a function, grep for every
  `name=function` and `const f=name` to see the whole chain; the last wrapper runs first.
  Prefer adding a wrapper in a new file (keeps earlier behaviour) or editing the one definition when it has no wrappers.
- Code runs at load in file order. Use `var` and function declarations for anything the main loop may reach early
  (avoids "cannot access before initialization").
- **Never insert into or reorder `ITPL`** (item templates): saves store the index. Append only.
- **Saves**: `localStorage` key `SAVE_KEY`; `gameSnapshot()` builds it, `loadGame()` restores it, extra state rides
  in `x2Save()/x2Load()`. Companion objects and `hero.tal` save automatically. Old saves must keep loading
  (they may still contain fields of retired systems such as `realm`, `incS`, `have`, `bounties`; load ignores or migrates them).
- **Co-op**: anything that spawns or simulates enemies must respect the region host (`MP.host===MP.me`).
  The artifact's `room` topics `es, ev, hit, bs, trade, chat` stay declared as `"interact"`.
- **Point lights** go straight into the scene (`scene.add`), never inside groups: they join the fixed light pool
  (`PGL`); a light inside a group changes the light count and recompiles every lit material.
- **Frozen matrices** (`PST`): still objects stop recomputing their matrices. Move objects as usual; only when you
  set `o.matrix` by hand on an object with `matrixAutoUpdate=false` also set `o.matrixWorldNeedsUpdate=true`.
  `userData.psNo=1` on a top-level object keeps it from ever freezing.
- Loot and XP are tuned down on purpose (`ECON96`, `PACE`); don't raise them unless asked. Since v139 kill XP ignores the level gap.
- **Kill XP growth (v118)**: base kill XP in `gainXP` is `8 + 12·level` (was `8 + 6·level`): twice the growth per creature level,
  about half the kills to reach 50 (~7,400 instead of ~14,400 at your own level). Companions share it, so they level faster too.
- **Ability balance (v138)**: measured with `test/v138_abilities/` (every ability of every class at level 50, base form at rank 1 and
  evolved form at rank 5, on a dummy with 4 dummies close by and 4 further out; every hit logged; `abl.py` → `step.py` prints what is off
  its target, `niche2.py` lists strictly-worse pairs). Each damaging ability is sorted by what it does in the game: single target, burst
  area (one moment), intermittent area (2–4 pulses), constant area (5+ pulses over 2.5 s+), and by area size (small / medium: reaches
  the close ring / large: reaches the far ring). Damage per target per second of cooldown, against attack × skill bonus, follows one
  table for all classes: single 1.00, burst .75, intermittent .75, constant .55; × small 1.00, medium .93, large .85; × (1 − extras),
  extras (`an2.py` `utility`): stun .12–.15, root .10, slow .05, debuff/mark .12 (Death Mark .40), pull .06, knockback .04, silence .05,
  dash/leap .08, invulnerability / shield / big heal .12, at most .40. Cooldown does not change the rate (long = bigger hit, short =
  steadier). Evolved forms follow the table at ×2.18 (rank 5 ×1.48, −15% cooldown, evolution ×1.25) in whatever shape the evolution
  gives them. Every one of the 62 damaging abilities (base and evolved) lands within ~12% of its target (random-landing barrages, Comet
  Storm and Heaven's Wrath, on average over many casts). Not tuned by the table: pure buffs, shields, heals, movement and summons.
  Projectiles fired together by one cast hit each enemy once at full damage (`BAL138.dup` 30% for the rest; Arcane Missiles exempt).
  Classes re-checked with `test/v127_balance/` at rank 1 (levels 10–50) and with every ability evolved at rank 5 (levels 40–50; use
  `TUNE=` a file that wraps `V90.setup` to set rank 5 and `hero.tal['__ev:'+name]`): within ~±10% of each other.
- **Balance (v127)**: measured with `test/v127_balance/` (every class × every weapon at levels 10–50: 30 s fights with the class's best
  four abilities against one target and against two crowd shapes (a tight pack of 3 around the target, a spread pack of 5), plus
  every companion spell; ~12 min headless: `python3 test/v127_balance/mat.py` then `python3 test/v127_balance/rep.py out/mat_x.json`).
  Melee heroes fight at ~70% of their weapon's reach, ranged and thrown weapons at 2.2. Each weapon has an identity and lands within
  ~10% of its target against the average of all 16 pairs: one target (+8 alone / −8 in a crowd: Twin Axes, Daggers, Claws, Bow, Wand),
  a crowd (−8 / +8: Greataxe, Halberd, Warhammer, Flail, Throwing Knives; Orb −12 / +12), balanced (Greatsword, Mace, Crossbow, Sling,
  Staff). The five classes are within ~±10% of each other; companion damage spells are 0.7–1.35× a typical spell (lingering area
  spells keep the crowd lead). Group numbers move ±10 between runs (crowd shape, positions), single-target numbers ±3.
  Fixes found on the way: a companion's own spell status (poison, burn) no longer reacts with its own family element on the same
  target (Venomcoil's Toxic Cloud set off COMBUST! on every tick, ~7× a normal spell); the sling and throwing knives no longer lunge
  forward on each throw (`SWNOL`: the hero walked into the enemy and stones, knives and ability shots spawned past it); a knife fan
  hits each enemy with one knife at full damage (`WB127.knDup` for the rest of that throw). When tuning, change the numbers in
  `2300-v127-balance.js` and re-run the harness; `hpP` class knobs do not reach max health (it is computed before them; see `BAL127_HP`).
- **Balance (v112)**: kill XP `ECON96.xp` .1875 (another 75% off); ability ranks cost twice as many points (`kqrCost`);
  elites are about a third as common (camps 1.8% + 0.4%·tier, wanderers 1.2%, in `rosterBuild`); Sovereign health ×4.5
  (`PACE.hp`, was 1.5: three times v110) with posture rescaled so staggers come as often as before; `svPick` never repeats
  either of the last two moves (falls back to barring only the last) and halves the 3rd/4th most recent.
- Design: dark fantasy, no cutesy models. Hatchable creatures are "companions" (never "Eudemon").
  Grade C is the norm (S and F ≈2% each). Shops in Duskhold (except the Trading Post) are built at the Stronghold Steward.
- **Kingdom lots (v103, v109)**: every shop, upgrade structure (not Bastion Walls) and house stands on one of the 20 lots in
  `LOT103` (v109 layout: NW NE NM CW CE round the fountain, then rows 1..5 south of the plaza, 7.5 tiles apart. Since v112 each row is `SkW`/`SkE` at x ∓7 facing the gate avenue and `SkM`
  at x −14 (odd rows) / +14 (even rows) facing north onto the open court left by the row before; no lot square comes within 3.5 of x=0
  (`KF109_AVE`, `kfAve109`), so a straight avenue runs from the plaza to the south gate at every stage and turn;
  `l.st` = the stage that opens it). The player picks the lot when building and can move it for free. `SH.pos[key]` = lot id (key: shop key,
  `u:`+upgrade, `h:`+house index), saved as `x2.kpos`; a saved id that is not in the table (older layouts) is dropped and the building gets
  the first free lot. Shop footprints are solid map tiles marked through `lotMark103` (counted, so they can overlap safely);
  fields older code reads (`T.mv`, `T.st2`, `STB`, `T.vsp`) follow the lots in `lotSpots103`. Keep the lots and their door spots clear of new
  fixed scenery (`v109_kingdom_shops.py` checks every stage with everything built and every decoration on).
- **Turning (v109)**: `SH.rot[key]` = 1..3 quarter turns (saved as `x2.krot`). `lotOf103(key)` returns the turned lot (same id and spot,
  `ry` turned); everything that places a building reads its lot through `lotOf103`, never `LOTM103` directly. A turn or a move that would
  leave any door unreachable from the spawn (`kfDoors109`, flood fill) is refused; a new building that closes off a turned neighbour's
  door turns that neighbour back (`kfFixDoors109`).
- **Kingdom size (v109)**: stage `s` = Sovereigns defeated (first kills only), at most 5; an older save with more buildings than its stage
  holds starts at the stage that fits them (`kfNeed109`). Walls at x = ±`KF109.WX` (20) from z = -TS to `KF109.SZ[s]` (11, 21, 29, 36, 44, 51);
  plots 5 + 3·s. `kfApply109` (load, and a first Sovereign kill) rewrites the map tiles of the old 72x72 square (paving inside, the ring,
  open ground outside, a 3-tile paved road from the gate to z 51), rebuilds the ring (`kdWalls`, kits keyed by stage), the paving stones,
  the lantern posts / benches / crates (`TWN100_wardK`), shows the old v83 dressing only inside the walls and off every lot, scatters the
  outskirts (`KFWILD|s`: trees, rocks, bushes on the island outside the walls, clear of the prestige buildings and the road), rebuilds the
  decorations that follow the walls (`spf(F)` in `DECO103`, keyed by stage) and the citizens' grid. `T.sz` stays 51 (the island's town
  area); use `kf109()` / `kfIn109(x,z,m)` for the current walls. The prestige buildings (granary, chapel, barracks, keep) stand outside.
  Empty open lots show a dim white outline on the ground (`KL103.ring`; just-opened ones glow gold for a minute, `KL103.ringN`).
  Tests that build everything add all six Sovereigns and call `kfApply109()` first.
- **Shop upgrades (v109)**: the Trading Post and every Steward shop except the Bard's Stage have levels 0..3 (`SHP109.lv`, saved as
  `x2.shpu`), bought at the Steward (gold ×[1.5,5,12] of the build cost, build materials ×[1,2.5,5], 0/2/4 Sovereigns).
  Each level is 5% off everything that shop sells: every price site calls `shpP109(shop, price)`. Stock: Trading Post +2 gear per
  level with better rarities (`shpGear109`), Magic Shop +1 egg, Curio Shop +1 ware (rune, egg, rune), higher-tier egg chance
  (`shpEgg109`); the Hearth / Alchemy market sells crops one tier higher per level. A new shop that sells for gold needs `shpP109`
  at both its price display and its charge.
- **Citizens (v103)**: two per house, up to `HS103_MAX` houses. A gather task (material from a zone whose Sovereign is
  defeated) pays `HS103_LOAD` every `HS103_TRIP`; catch-up after being away is capped (`HS103_CAP`). Saved as `x2.khs`,
  `x2.kcit`. They walk on an A* grid built from the town's own collision (`czGrid103`).
- **Trades (v104)**: a citizen is a gatherer until trained at the Steward (gold): egg collector (one egg of a chosen
  species of a completed zone per 10 min, stops while the egg bag holds `CZ104_EGGMAX`), fisherman (3 fish of the zone's
  tier per trip, zones with water), hunter (4 simulated kills at the zone's level: gold, family parts, rare gear — never
  eggs). Role is `c.r`, task strings per role are documented at `CZR104`. Each trade has its own look (`czLook103`, `czProps104`).
- **Trips (v105)**: a trip starts only when the bag holds food rations (`czFood105`: raw food/crops 1, cooked meals 3;
  cost = zone tier, gatherers 1). Goods are computed when the trip ends and wait in `c.bag` until the player presses F at
  the house (`czCollectHouse105`); the next trip starts after that. Ranks (`c.rk`, 1..5) cap the zone tier a citizen may
  work; each rank is bought at the Steward (`czUpCost105`).
- **Support targets (v122)**: heal goes to the ally (hero or companion) with the lowest health share below 70%; shield to the
  one under the most pressure (`sup122Threat`: enemies winding up on it, enemies next to it, hurt in the last 3s, low health) without
  a strong shield; attack buffs to a fighting ally (hero first), defence buffs like shields; allies that already have the buff are
  skipped. Effect recipes for these spells draw at `x.hp` / `x.hpf` (the target), never `pl.position`.
- **Companion abilities (v105)**: every CSP spell needs a recipe in `SPX105` (motion `m`, amplitude `a`, speed `d`, effect
  `fx`/`shot`/`zone`); `v105_abil.py` casts all of them and fails when one is missing or two share the same motion settings.
  The spell lands at the motion's strike moment (`MV105[m].h`). Bites play the motion in place of the generic lunge.
- **Attack step (v121)**: a hero melee basic attack's small step (`pl.step`) and swing lunge (1710) only close the gap to
  the enemy being swung at (`swPlan`/`swRoom` in `2250-v121-attack-step-to-range.js`): no movement when already in range,
  a step in when not, re-measured every frame during the lunge. Swinging at nothing keeps the old step.
- **Baked attack keys**: re-baking with `BAKE=1 python3 v100_anim.py` nudges every move a little (the IK is not fully
  deterministic). When adding moves, splice only the new lines into `1705-v100-anim-baked-keys.js` (as v105 did for the flail).
- **Monster moves (v107)**: each of the 18 zone monsters has one basic attack (strike/bite/spit/throw/bolt) and two signature
  moves of its own (`MSIG107`); no zone monster uses charge or pounce. A signature move is a normal `MV` entry (timings, red
  warning shape) plus hooks in `x6` (`start`, `tick`, `rel` at the end of the wind-up, `land` at the end of the act, `when` to
  gate the AI). Effects on the hero are buffs via `dqDebuff` (slow, root = `mspd:-1`, defence/damage/attack-speed cuts) and
  damage over time (`s6Dot`). Self-heals run only on the monster's owner (`!e.mir`). A new monster needs its own entry in
  `MSIG107` with two moves no other monster uses (`v107_sig.py` checks). Serpent rigs (`anim:'slither'`) reset tail
  `rotation.x` every frame; attack poses lift a serpent's tail gently and never into the ground (`crApply`).
- **Zone instances (v106, v108)**: every zone (`PMAP[i]`) is five instances on row i of the world grid, 6 tiles of void apart:
  three field instances I, II, III (`PMW`x`PMH` = 248x234 since v108, a quarter of a v97 zone), the Sovereign's Den (k 3,
  136x176) and the Wave Trial (k 4, 84x84). `p.ins` = I, II, III, Den (the ones you reach in turn, `PMI`=4; `PMF`=3 fields),
  `p.tri` = the Trial; all five are in the flat list `INSL[g]`, g = `insG(zone,k)` = zone*5+k. Each record has its own
  `x0,y0,w,h` and flags `fld`/`den`/`tri`. `regionAt` gives the zone, `rgAt` the instance key, `insAt` the instance record
  (`x0,y0,w,h,wp,path,cl,ba,wa,en,lv,n`). Levels: the zone's range split in thirds over the fields (`pmLvSplit`), rising along
  each road (`zoneLv`); the Den and Trial use the zone's top level. In I and II `ba` is a gateway clearing to the next field;
  III's gateway leads to the Den (`RPORT` k `'next'`). The Den (`pmDen`) is a short road from its north edge into the den
  clearing (`PM_DENR`); it has a Duskhold portal at its entrance and no roaming creatures. The Trial holds only the sealed arena
  (`wa`), entered from the zone's portal once the zone is cleared. Zone-level fields older code reads: `p.ba`, `p.path`,
  `p.wp` are the Den's, `p.wa` the Trial's, `p.en`, `p.x0/y0` instance I's, `p.cl` all 9 camps (3 per field, `C.ig` = the
  camp's instance). The roster (33 groups per field), co-op region (`MP.rg`), treasure maps (`m.r` zone + `m.k` field
  instance; maps found in the Den or Trial lead to III), the local map and chunk visibility (`cvOK`) all work per instance.
  `INSR[i]` = furthest instance reached (0..3, saved as `x2.insr`); the zone's portal lists the reached ones. Creatures come
  back `RESP_T` (50 since v112) s after death, not while a hero is within `RESP_NEAR` (14) tiles of the spot (beyond any aggro reach). Recall saves `INST` (instance + spot + the
  creatures' timers; also in the Den); T in Duskhold goes back. World layout version `WD_WL` 108; older saves go to instance
  I's entrance of their zone and get every instance of every open zone (v106/v107 saves that reached III also reach the Den).
- **Cheddar's quests (v132)**: one Cheddar (`chd132Model({game:true})`, scaled `CHQ132_SC` 1.1, ~0.86 tall) stands beside the Duskhold
  portal of every field instance and Den (`chqSpot132`: 2.7 tiles to the portal's side on free ground, burrow 1.3 beyond, a CBLK tile
  under him, grass cleared around both); he moves to the instance you are in and climbs out of his burrow when you arrive. Gold "!"
  over his head = a quest here not yet accepted, "?" = one ready to turn in (a Sprite, `fog:false`). F beside him opens `XR.chq132`.
  Quests live in `CHQD132['zone_k']` (k 0..2 = field I..III; Kindlelight and Hillside Crest, "the plains", have them so far):
  `{id,t,d,o:[[kind,count,label]],rw:'weapon'|'chest'|'helm'|'boots'|'egg',w}`. An accepted quest counts only while you are in its
  instance and only shows in the tracker there (`#chqt132`, under the minimap column); progress is kept when you leave. State
  `CHQ132.st[id]={s:1 active|2 ready|3 done,p:[...],cj}` saved as `x2.chq`. Rewards (`chqReward132`): XP and gold from the instance's
  top level (≈ (14+L)×a kill's XP, (16+L)×a kill's gold, × `w`), gear from `genItem` at min(top level, hero+2) (uncommon+, rare+ in III)
  or a zone egg. Objective kinds come from wrappers at the end of 2330 (kill, gFinish, fishCatch, fishTreasure, the fusion button,
  feedComp, kqrUp/kqsBuy, breakBoulder/digTreasure, hatch, mountTick, a rune poll); a co-op partner's kill only counts for camp clears.
  Hillside Crest I gets one extra secret boulder for "Under the Stone" (appended to `SECRETS`). To add quests for another zone, add
  `'z_k'` lists to `CHQD132` (kinds listed above the table). Test: `v132_cheddar_test.py` (`v132_cheddar.js`; `v132_shot.js` for
  framed screenshots). v132.1: empower kills need a companion actively empowering you (E / R), not a buff spell; "New Blood" counts
  a Tier 2+ egg arriving in the egg bag (`chqEggs132`, Cheddar's own reward eggs excluded); ability = a rank-up to 2+; forged = +2; quest
  XP ×0.7; the window is a grid of cards with a large reward panel and an SVG "mystery" medallion per reward type (`chqIco132`).
- **Version 135 (owner's list, Oct 2026)**: *Cheddar* stands 4.2 tiles down the road in front of each arrival spot facing it (the camera
  looks down the road on arrival) and a second Cheddar (`CHQ132.e`) stands 5.4+ tiles before each field's end gateway (past its F reach), so
  quests are handed in before stepping through; both show a gold mouse mark (with ! / ?) on the minimap and the N map. *Bow*: the model's
  straight string is its own mesh and hides while the drawn string shows; the bow is 66% tall and 40% deep (scaled about the riser, so the
  grip and the drawn string's tips `BOW_T` still line up); carried level across the front of the hips like the owner's reference pictures.
  *Travel*: F at an instance's entrance portal opens the zone's travel window with Duskhold as a row. *Ability preview*: the stage uses the
  hero's world coordinates, so the main loop now sees the hero at its world spot each frame. *Camera*: rocks, walls and buildings no longer
  tilt the camera up (only the ground does); materials of the world's scenery fade (screen-door dither, ~35% left, never below the hero's
  knees or near the hero) around the line of sight. *Instance clip*: chunks along an instance edge hold the neighbour's terrain (cave and keep
  themes raise walls ~100 high), seen across the void as a grey wall with a sky patch; terrain / plants / faded scenery discard pixels outside
  the current instance (+3 tiles) and the far cull drops objects lying outside it. *Wave Trials* are removed (the trial instances stay in the
  grid so nothing moves). *Deaths* fall over and fade (material copies, freed after). *Uniques* (`it.u`): legendary rarity, own name
  (`itName`), fixed bonus (`itStats`), tooltip block, own models (icon `v89Kit`/`v89Key`, ground `lgDropModel`, hand `v89Wpn`, worn gem
  colour via `mdGD`). Tests: `v135_checks.py`, `v135_uniques.py`, `v135_bow.py`, `v132_cheddar_test.py`; pictures `v135_cheddar_shot.py`,
  `v135_fade_shot.py`, `v135_edge_look.py` (SRC= an older build for before/after), `v135_cat_head.py`, `v135_far_shots.py`, `v135_pick.py`.
- **Version 149 (owner's request, Oct 25 2026): Ssith'ra's body is one creature.** The owner: "he clips into himself and the
  segments of his body do not seem like one whole creature". The v112 layout followed the path the head had taken, so turning
  around, circling the hero or the burrow chain folded the body through itself and the head (up to 1.1 deep; the neck bent 180°),
  and the barrel-shaped segments opened gaps at bends. `3078` replaces `B.post` (keeps v146's sand) and adds to `B.build`:
  *Chain*: the path is the body itself (last frame) plus where the neck has gone, so it still slithers; heights first with a fixed
  3D spacing; the neck bends at most 60° from the head, every joint 22° (14 segments can't close a ring); a segment that would sink
  into the head or a segment 2+ ahead is pushed out sideways; the body leans into turns. *Rearing* is one smooth curve (steep under
  the neck, landing flat, longer the higher it rears). *Diving*: once the neck is under, the body slides along its path into the hole
  and down it (`SSR149.pour`, all under before v112's vanish at 1.45 s; the `dive` pose plunges a little deeper). *Model*: a flesh
  core (a tube rebuilt each frame along a curve from inside the skull to the stinger, glowing at the seams, brighter in Phase II)
  replaces the rigid neck sleeves; each segment wears a domed dorsal shield instead of a full barrel, narrow at the front where it
  tucks under the one ahead, one pattern down the back (dark shield, bronze rim and keel); studs, runes, veins, trophies, rings,
  rags, side plates and belly plates moved onto the new shapes. Moves, timings and hit boxes are unchanged. Test `v149_ssithra.py`
  (self-clipping depth, sharpest bend and chain gaps while turning round, spinning, circling, every move and a free fight; studio
  pictures `out/v149ss_<TAG>_*.png`).
- **Version 148 (owner's list, Oct 25 2026)**: *Tools*: the hatchet and pickaxe are aimed in the world after the animation
  (`SK148` key directions in the hero's frame; the pick's head lies in the swing plane, the hatchet's edge leads its motion) and the off
  hand takes the handle (two-bone IK, bones put back before the next frame). *Weapon edges* (1270 `gripEdge`): only frames at least 40%
  as fast as the swing's peak turn the edge, and for the hero only until the hit moment + .1, so the recovery never flips the edge round
  (the halberd's finishing sweep showed its blade backwards in the follow-through); the hammer's faces lead like a double edge. Test
  `v148_edges.py`. *Mouse*: only the left button attacks (the middle one turns the camera); an aimed ability started with mouse-look on
  turns it off for the aim and back on after the cast or a right-click / ✕ cancel (not after Esc) (`3072`). *Camps*: a camp's creatures
  wait 300 s and the whole camp returns 5 minutes after its clear; a clear gives `CAMP148.xp` (2.5) kills' XP and a chest of 2-3 different
  kinds from the area's loot table (`camp148Loot`). *Sigils*: 12 ghost wolves at once, each one that falls replaced until 100 are slain;
  they hunt the hero on rising (`e.hunt`, 0104). *Footprints*: a shop / house marks only the tiles where downward rays meet its model
  (yards are walkable); a door turned to face the town wall counts as blocked (`3073`). *Outskirts*: every pine, dead tree, rock and
  bush of the wild kit can be gathered once (wood, stone, fibre) and is gone for good: its mesh part collapses (per-item vertex ranges in
  the baked kit), its collider goes, saved by candidate index (`3074`). *Cheddar*: gone from the instances (no burrows, colliders or
  grass clearings); one Cheddar on a crate beside a quest board east of the plaza (`CHQ148.at`); a tab per open zone, quests count in
  every instance of their zone (menu kinds anywhere, `CHQ148_ANY`), four difficulties `CHQ148_DF` (XP/gold ×1/1.8/3/5, gear rarity and
  count, an egg on Heroic), v132 quests keep their ids; turning in only at the board (`3075`). *Decorations*: cheaper, many material-only
  (`DC148_COST`), and six new big ones: Duskhold Obelisk, Plaza Torches, Lantern Pavilion, Elder Oak, Moonflower Gardens, Great Beacon
  (the four square pieces appear as the kingdom grows over their square) (`3076`). Tests: `v148_tools.py`, `v148_edges.py`, `v148_mouse.py`,
  `v148_camps.py`, `v148_outskirts.py`, `v148_cheddar.py` (replaces `v132_cheddar_test.py`), `v148_deco.py`.
- **Version 148.1**: *Cheddar's board*: each tier (Easy → Medium → Hard → Heroic) of a zone opens only once every quest of the tier
  before it there is turned in (`chq148Open`); gold and XP are 35% of before (`CHQ148_PAY`); the Sovereign-kill quests are gone.
  *Companion splash* (`3077`, `SPL148.k`=.3): an enemy area attack aimed at the hero also hits each active companion standing in its
  red shape (downward ray at the companion vs. `a.tel`/`a.xt`), once per attack, at 30% — when the hero is hit, or when the strike ends
  after the hero dodged out. Projectiles are left out. Test: `v148_splash.py`.
  *Boss splash* (`3079`): the same 30% for the six Sovereigns and Vorraxis — every strike (`svHitNow` / `mb144HitNow`, shape vs. each
  active companion, hero hit or not), the v146 ring waves (`sk146RingWave`), Vorraxis's Deluge (companions off the islands) and the
  Wraith's Absolute Zero (companions away from a lit brazier). Catch-all hits (shape r 99: spines, blood drops) and lingering ground
  hazards stay hero-only. Test: `v148_boss_splash.py` (`BL=`, `SEC=`).
- **Version 141 (owner's list, Oct 2026)**: *Consume* raises only the eaten companion's best stat (same amount per stat as before;
  refused when that stat is maxed); the Fusion preview shows gains under 2 points with one decimal. *Keys*: Q feeds the most hurt
  active companion, Z health potion, X mana potion, 1–6 abilities. *Companions*: one active companion until the Beast Trainer teaches
  the Companion Bond (800 gold, after two Sovereigns); party[1] rests until then (no follower, XP or spells; code that means "the active
  team" reads `actN141()`). *Balance*: hero level growth ×0.4 (attribute points unchanged); normal enemies need twice the poise damage to
  break, and a finisher adds poise instead of breaking outright. *Sovereigns*: wind-ups of 1.2 s+ play faster (0.9 + (t−0.9)×0.55),
  two close casts in a row → a back-step and an out-of-range move, Reach (3 aimed eruptions) and a 40% faster walk once the hero has kept
  8+ tiles away for 2.5 s, and a defeated Sovereign never respawns. *Gear*: the four new greatswords' grips reach the hand, the Glaive
  has a solid core (`test/v141_grips.py` slices every weapon at the grip). *Quests*: Kindlelight I wood only; II 8 stone + 5 iron ore
  (old progress moved to the iron objective). *Shop*: the Tome of Unlearning is gone (the Character window's Reset stays).
  Tests: `v141_consume.py`, `v141_sov.py`; pictures `v141_look.py <file.js>` (parts split at `//SHOT name`), `v141_grips.py` (CLS=…).
- **Camera on slopes (v132; since v135 only the ground counts, scenery fades instead)**: when the ground behind the hero blocks the camera ray (`blk` in the main loop, 0104), the camera first
  tilts up in steps (up to pitch 1.25) until the ray is clear and keeps its distance; it only pulls in (old rule) when tilting can't clear it.
- **Sovereign footwork (v133, `2360-v133-sov-spacing.js`)**: posture now needs `POS133.mul` (2) times the damage, +15% per stagger already
  taken (max +45%), fills at half speed for 3.5 s after a stagger ends and drains a little after 2.5 s unhit. Damage of 40% of the stagger
  threshold within 3 s (`RT133`) makes the boss back away fast for 1–1.5 s (sliding along the den wall, `svStep133`), at most every 14 s
  (10 s in Phase II), then answer quickly from the new range. After each move the boss may make a spacing plan (`svPlan133`, chance
  `PL133`, 80% when the hero has stood still for 3 s): a front/any move it has not used lately whose range does not cover the current
  distance; it walks or backs off to that range (up to 3.2 s) and casts it (`S.force`, read by `svPick`). Driver-only, like the rest of the AI.
  Test: `v133_sov_spacing.py` (old vs new per boss with the hero standing still in melee: staggers, retreats, far-range casts).
- **Beast races (v114, replaces the v112 rat)**: every hero is its class's animal, there is no human option: rat (Warrior), cat
  (Assassin), raven (Mage; the frog until v134), badger (Paladin), weasel (Ranger). `BR_CLS` maps class → race; `brRace` ignores the look and returns the
  class's animal, `lkFull`/`mdLookN` (2130) set `race` and keep fur/eye only when they are that animal's colours (`brFur`), so old human
  saves and co-op partners load as animals. One engine (`2100`): `brDef(id,D)` registers a race (`BRD[id]`), `brPlan` = the v99 preset
  `D.pre` + hunch shear + crouch, `brRig` retargets the hero skeleton in place (tail bones `tl0…`; since v120 animated by `brTailAnim`: an integrated sway phase + one damped spring per bone, tuned in `BRT`). While a beast is built `BR.on` scales
  the human torso/arm/leg/foot rings per ring (`D.TR`, `armK`, `legK`, `foot`; the arm's first ring stays inside the torso like the
  human's, so sleeves need no cap), `D.head` builds the skull from `D.SN` rings (+ `brEyes`, `brNose`, `brJaw`, `brWhiskers`; whiskers
  root on the cloth under a face mask, `BR_MASK`), `brPaws`/`brToes` grow fingers, claws, pads, webbing, `brTail` lofts `D.TP`.
  Helmets (`2110`, `brHelm`) are built over the skull: ear openings and rims from the ear ellipsoids `D.earE` (`brEarIn`, `brEarRimK`),
  eye slits at `D.EYEP`, goggles / monocle sized from the eyes (`D.eyeR`, `D.eyeFw`), hoods with the face opening behind the eyes and
  an open underside, ear pockets (`D.earPocket`); the Mage's animal has its own cloth head pieces (`D.helmSet.cloth`, since v134 the raven's in `2370`; the frog had slouch caps, floating
  halos). Amulet on the shoulder slope and ring on the outer finger (`2115`, `brFinger`); every outfit / armour loft leaves an opening
  where the tail passes (`brTailNear`, `BR_BODY` marks body builds). Animation: posture layer (`D.pose` standing, `D.run` added at
  full run, arm hold eased out during attacks), head levelled from the chest frame (`D.look`), crouch, tail sway. All offsets go
  through `brAddR`/`brUndo`, which restore the exact values, so the v93 idle layer's `===` undo never stacks its breathing.
  Look fields: `skin` = fur/hide, `eye` = eye colour; co-op look array index 8 = race. Tests: `v114_beasts.py` (sheets per race),
  `v114_race.py` (creator → save → reload → barber, every class casts every ability; TITLE=1), `v114_clip.py` (armour clipping: every
  item of the class on its animal, bind pose + idle/run/attack; `HUMAN=1` gives the human baseline; `dbg_clip.py` marks the points).
- **Raven Mage (v134, replaces the frog as race 3)**: built with the v114 engine in `2120`: skull + beak loft (`SN`), bristles,
  gape line, hackles and nape feathers (one shared low-poly blade, `rvFeather`), talon paws (3 fingers + thumb), bird feet
  (`toesB`, `toeList`: three toes forward, one back, knee fringe), a wedge tail fan on one tail bone (`tailB`, `FAN`), wing
  feathers along each forearm pointing to the elbow (`wings`: they lie on the outermost surface round the forearm, measured from
  the model's vertices by `rvArmR`, so they sit on top of any sleeve; bare models also get upper-arm coverts and a belly skirt).
  Gear (`2370`): every cloth head piece is built for his head (hats sit over the crown on a brim above the brows, circlets ring
  the head where it is at that height, hoods are a snug shell + a cowl round the back of the neck, open in front); the nape
  feathers are left off under any head piece (`RV.helm`); robes open a slot for the fan (`D.tailNear` replaces the round
  `brTailNear`); footwear keeps the bird's feet (`rvBoots`: wrapped shank, straps / sock / plates / claw sheaths per style; the
  foot stays scaly). The frog's FC116 carry hold now applies to the raven (`fc116Race`, key 'raven'). Old frog saves load as
  ravens (race 3; frog colours fall back to raven black). Pictures: `raven_show.py`, `raven_gear.py` (SLOT=helm,chest,boots).
- **Gear redesign (v136, `2500`–`2560`)**: armour is cloth and plate built round what is already there, not shells pushed off the body.
  * Measuring (`2500`): `gkPts(B,y0,y1,filt,exRe)` samples every triangle built so far (vertices, edges and the inside of big ones;
    `exRe` leaves out bones by name, e.g. arms / tail / cape for skirts); `gkRows` makes one convex hull per height (cloth spans hollows),
    `gkHullR` reads the hull's radius at an angle (θ = 0 front, π/2 the hero's right). `gkSurf(B,G,o)` turns a grid of vertices with
    weights into triangles (one colour per quad; `m.u` across, `m.v` down, `m.i`/`m.j`).
  * Hoods (`gkHood`): rows from the shoulders to above the crown, each the hull of its section (head, ears, neck, collar, pauldrons,
    cape) + clearance; at the back and sides cloth falls straight from the widest part above (the hanging rule); folds deepen toward
    the neck; the face opening is cut behind the eyes (`zf`, an overhanging brim `over`), closed under the chin (`close`) or open to the
    hem (`open`, the raven); a darker lining, a rolled edge, a dagged mantle hem, an optional point lying down the back (`tip`).
    Hoods are built after the rest of the hero (`gkLater`: chest, outfit extras, cape first, so they measure them); outside a hero build
    (item pictures) they are built at once. Styles: `GK_HOOD[st] = {race?, pre(X), hood(X)→options, post(X,Hd)}` (pre runs before the hood
    is measured — masks; post decorates it with `gkHoodAt`); `GK_HELM[st]` the same without a hood. The quiver goes over a hood's mantle.
  * Skirts (`2505`, `gkSkirt`): from the waist down, never narrower going down (it hangs), flare, pleats, hem per angle (`hem(θ)`),
    `dag` cut teeth, `open` (front of coats), `slit` (back, for tails), a lining; weights hips + each thigh (`legW`) and the cape bones at
    the back (`flow`): running lifts the back of robes and coat tails. Every v94 `mdSkirt` of a hero (mail skirts, coats, tabards) now
    goes through it (`2540`). `gkCape` (capelet over the shoulders, `keep` for a half-cape), `gkCollar` (standing collar, taller at the
    back), `gkSleeve` (fitted to the elbow, then a bell `bell` that trails a point `trail` metres behind the wrist).
  * Mage (`2530`, `2535`): `MG_ST` per robe (under-robe, open over-robe, sleeves, capelet / collar, belt and its hanging things, chest
    pieces); the raven's hem remap (`RV_HEM`) is off while a robe is built and his wing feathers stay inside wide sleeves (`P.gkNoWing`).
    Hats `mgHat` (crumpled crown clear of the skull, wavy dagged brim, band, buckle, patches), circlet / diadem / crown, three hoods.
  * Assassin (`2520`, `2525`): `AS_ST` per chest (jerkin pattern, flaps or coat, shoulder, harness, belts, bracers with hidden
    blades, set pieces), the class outfit is the T0 Rag Wraps; masks `asMask`, goggles `asGoggles`, footwraps `asBoots` (toes free).
  * Warrior / Paladin / Ranger (`2540`): class details over the v95 armour (`hvExtra` by `BR.R.cls`, `mdExtra`), helm details.
  * Weapons (`2550`): `wpX` adds notches, skulls, chains, ribbons, feathers, a raven skull on the staff, a bone-caged orb.
  * Item pictures (`2560`): helms / chests / boots are drawn on their class's animal (body built first, then dropped).
  Tests: `v136_gear.py` (every piece on its animal at rarity 0 and 4: builds, speed, triangles, hoods built, robes on the cape bones,
  hood clearance), `v136_icons.py` (every armour icon renders, not empty); pictures: `v136_sheet.py` (RACE=, SETS="helm:x,chest:y;…",
  VIEWS=front,34,side,back,hf,h34,hs,hb,cf,c34,cb,legs,run,runb,windup,strike), `v136_weapons.py`; clipping as before `v114_clip.py`
  (its `hide` count includes small parts lying on the body — read `poke`).
- **Companion and enemy bodies (v137, `2600`–`2665`)**: no enemy uses a companion's body any more, and species that share a
  companion skeleton have their own bodies.
  * Rig variants (`2600`): `RV137.var[rig]` lists the species on one skeleton (first = default). While a model builds, `RV137.cur[rig]`
    holds the species; the colour key gets the variant index in its low bits so the body / kit / evolution caches never mix them.
    `rv137(rig,c)` gives the species, `rv137I` its index. Evolution looks (`EVO100.D`) read `RV137.cur`.
  * Gloomcap / Sporelord (`2600`), Wispling family with a real cowl (`2610`), Gravewyrm / Venomcoil (`2620`), Batwing / Duskwing (`2630`).
  * Enemies (`2640`–`2650`): each v113 enemy that was a companion body (`n3Def` `rig.base`) now has `LPR[name].geo/kit/post` of its own
    on the same skeleton, so every move still plays. The Blood Bat has its own rig (`BloodBat`), the Fungal Shambler too (`Shambler`);
    the old v2 wild monsters point at these rigs. Toolkit: `e137Rows` (body rows along z), `e137Limb` (limb loft through points),
    `e137Quad` (four legs from a skeleton), `e137Claws`, `e137Rib`. The Sun Scarab's middle legs are pivots that copy the opposite front
    leg's swing (`x.mid137`, applied in a `rigAnim` wrap).
  * Older foes (`2660`): naga, trolls, yeti, sand elemental and ghoul are rebuilt as `N3.humB` builders (`f137Reg`) with fur, scales,
    rock plates, rags and trophies; skeletons get a soul-light. `2665`: Goo / Maggot / Scorpion touch-ups and the Shambler.
  Tests: `v137_enemies.py` (every spawnable enemy builds, finite bones through idle / walk / attack, no companion body; variant bodies
  differ; scarab legs swing). Pictures: `LIST="C:Gloomcap:0;E:bloodhound" VIEWS=front,34,side,back,face,walk,attack TAG=x python3 v137_creature.py`.
- **Animal townsfolk (v137, `2800`–`2830`)**: every Duskhold townsperson is a warm-blooded animal.
  * Bodies use the v114 beast engine on the town-folk skeleton `idlNB` + tail bones `tl…`, ear bones `erL`/`erR` and cape bones
    `cp0…cp2` (`fkNB`), so the v93 idle, the v103 work stations, the citizens' walk and held tools work unchanged. `idlNpcBody(o)` →
    `fkBody(o)`: one cached geometry per species + costume + fur (`fkKey`); meshes carry `userData.fk` = species.
  * Heads: one parametric skull + muzzle (`fkSN(hp)`, the v114 ring format, so `brEyes` / `brNose` / `brJaw` / `brWhiskers` work),
    ears on the ear bones (`fkEars`: tri / round / long / leaf / small / tuft), horns (`fkHornLoft`), antlers (`fkAntlers`), paws from the
    folk wrists (`fkPaws`), hooves (`fkHooves`). Species (`fkSpecies`, 2810–2811): fox, wolf, bear, hare, stag, doe, boar, owl, mouse,
    raccoon, lynx, otter, goat, ram, sheep, hedgehog, squirrel, beaver, mole, ferret, bat, hound.
  * Keepers (`FK137.out`, costumes `FKO[label]` in 2825): Steward stag (navy coat, chain of office), Blacksmith bear (leather apron,
    gloves, boots, kerchief), Trading Post Merchant raccoon (vest, purse, ledger, beret), Magic Vendor lynx (starry robe, pointed hat),
    Innkeeper boar (waistcoat, long apron, towel, keys), Cook otter (chef's whites, toque), Alchemist goat (robe, vial bandolier,
    goggles), Stable Master ram (dungarees, straw hat, rope), Curio Merchant fox (travel coat, pack, feathered hat), Beast Trainer wolf
    (jerkin, fur mantle, whistle), Bard hare (slashed doublet, ruff, feathered cap), Rune Sage owl (rune robe, cowl, rune stones).
  * Citizens: species from their trade (`FK_ROLE`) and name + look number, fur and clothes from the look (`FKO.cit`: tunic, trousers,
    skirt / dress, apron, scarf or collar, cap / coif); the same citizen is always the same animal (co-op guests build the same).
  * `npc()` is re-declared (hoisted) only to remember each figure (`npc.all`, `g.userData.npcO`); figures built before 2800 runs are
    rebuilt as animals on first animation or 1.2 s after loading (`fkRebuild`). Tails sway (more when walking) and ears flick
    (`fk137Anim`, layered on `idlNpc` and `czWalkPose103`, absolute from rest).
  Tests: `v137_npcs.py` (every keeper and 16 citizens: sheets front / 3/4 / side / back / face / walk / work; FAIL on a human model,
  NaN vertices, a hand / foot / head bone with no body mesh near it in idle, walk or work, a held tool off the hand, live NPCs not
  animal). `SP=fox,bear` draws species sheets; `ONLY=keep|cit`, `PICK=Blacksmith`, `NOSHEET=1`.
- **Townsfolk anatomy (v142, `3010`–`3013`)**: a layer over the v137 folk (owner's request: heads, necks, proportions and posture
  that read as the animal, natural eyes, no floating parts). `FK142.sp[key]` per species (3011): `hs` head scale, `hz`/`hy` head
  forward / up, `pitch`, `lean` (upper body forward per metre above the hips), `sh` shoulder width, `neck` thickness, `leg`
  ('plant' flat feet · 'digi' on the toes, heel raised: fox, wolf, lynx, hound · 'hoof': deer, goat, sheep, ram, boar · 'bird': owl),
  `eye` {sz, back, up, g gaze, lid, rim}, `hp` overrides of the v137 head numbers. How it works (3010):
  * `fkNB` returns a *pre* skeleton (legs moved: knee forward, hock raised) while `fkBuild` builds, and a *final* one for the
    bind; after the build `fk142Deform` moves every vertex with its bones (skin-weight blend): lean and shoulders are offsets,
    the head and ear bones get one matrix (`fk142Xf`: scale about the top of the neck, then forward / down), so hats and horns
    follow and the neck bends smoothly. Ear bones are moved by the same matrix.
  * Heads are sculpted per species (`3012` engine, `3013` recipes; owner's request: shaped freely, in the heroes' style).
    A recipe (`D.sculpt`) is anatomy as distance functions — ellipsoids (`FKH.E`: brain case, brow, cheekbones, whisker pads,
    nose pad), round cones (`FKH.RC`: muzzle, lower jaw, snout), spheres carved out (`sub`: eye sockets), smooth unions (`k`),
    mirrored — in head-local metres from `FKS.C0` (+z forward). `fksLoft` meshes it like the heroes' skulls: rings from the back
    of the skull to the nose (rays from each slice's centre find the surface), 14 sides, flat facets; `paint(p, n, C)` colours
    each quad (so pattern edges follow the facets). The recipe also gives the eye (`eye.c` centre, `eye.g` gaze, `eye.r`), the ear
    base (sunk 9 mm under the sculpt, `earSink`), the neck's attachment (`neck` [y, z, r]), whisker rows and `extra` parts
    (teeth, tusks, horns, beards, wool; `extra(){}` drops the v137 `face`). `fksSetup` measures `D.SN` from the sculpt, so hats,
    coifs, goggles, antlers and wool fit. `mesher:'nets'` gives the smooth surface-nets mesh instead (not used).
    Ears (`fksEars`, owner's request: no edge off the head, both ears alike): a loft of 8-sided rings root → tip shaped per type
    (`FKS_EAR`: tri / leaf / round / small / long); every root vertex is pushed down the ear's axis until 5 mm inside the
    skull; the root ring is weighted to the head and the next ring half to the ear bone (flicks bend the ear at the root);
    built once on the right and mirrored, so both ears are identical; the front is cupped and the inner ear is painted on those
    faces (a separate inner piece stuck out past the edges); the dark tip is part of the same loft; tufts start inside the tip.
    The owl keeps its feather tufts (`fkEars`).
    Eyes on sculpted heads (`fk142Eyes`): an almond with a bright iris and the species' pupil, a level brow line above (calm,
    not angry, per the owner), `eye.round` for round eyes (owl), `eye.slant` / `open` / `brow` per species.
  * Species without a recipe use `fk142SN` (same ring format as `fkSN`): lower occiput, brow ridge, stop, fuller cheeks.
  * Neck (`fk142Neck`, inside `fk142Head` which replaces `fkHead` for v140 species): from the collar to the back-lower skull,
    slimmer than the head, the throat filling up to the jaw.
  * Eyes (`fk142Eyes` replaces `brEyes` for the folk): at the stop above the muzzle line (prey further back and out), aimed
    (`g`), iris fills the eye, slit pupils (fox, lynx), bar pupils (deer, goat, sheep, ram), dark rim, fur lid; size from the
    skull (`R`) × `eye.sz`. `D.EYEP` is moved there, so face masks and coifs follow.
  * Feet: `mdFoot` for digi / hoof / bird runs from the hock down to the ball; `fk142Toes` roots toes on the actual foot rings
    (plantigrade too: v137 toes of big species stood past the foot); `fkHooves` puts cloven hooves at the ball; `mdLeg` gets one
    more ring weighted to the foot bone so the foot never parts from the shin. Whiskers root per whisker (`fk142Whiskers`).
  * Fixed with it (v137 floating bits): deer nostrils, belt buckle and hip pouch now sit on the body; wolf / lynx cheek ruffs
    grow from the cheek (`fk142Ruff`).
  * Torso lean is a shear by each vertex's height (pieces on one torso bone move with the cloth that blends two). Trinkets rest
    on what is built: `fk142Hug(B, P, y, a, off)` casts a ray at the body and returns the first surface (clothes included) —
    buttons (`FKG.buttons` for the folk), chains, cords, pendants, rune stones, keys. Skirts and aprons start on the waist
    (`FKG.skirt` clearance 4 mm, apron 6 mm; they used to hang 16–20 mm off it); boots have a thin sole shell.
  * `FK142.on=false` builds the v137 models; `FK142.reset(key, A)` re-tunes a species while the game runs.
  Test: `v142_folk.py` (every species and keeper + 6 citizens; FAIL on a floating piece — any separate piece of mesh more than
  4 mm from the body that does not pierce it and is not enclosed by it — in rest, idle, two walk phases and the work pose, feet
  off the ground in idle, NaN, a human model; sheets `out/v142_folk_sp*.jpg` / `keep*.jpg`: front, side, head 3/4, head side).
  `SP=fox,bear`, `KEEP=0`, `NOSHEET=1`, `POSES=rest,idle`, `V137=1` (old models, for comparison).
- **Ability evolution (v137, `2700`–`2740`)**: when an ability reaches rank 5, the Abilities window offers to evolve it into a
  stronger form with a new name (Fireball → Phoenix Barrage, Cleave → Rending Crescent…). Cost: the last rank's cost + 4 ability points
  (12–16 ⚡, counted by `apSpent`, refunded by "Reset abilities", which also removes evolutions). Saved as `hero.tal['__ev:<name>']=1`
  (`__` keys survive the talent reset). "👁 Preview evolution" plays it in the ability preview before you buy (`EV137.pv`).
  * Every evolution (`EVO137[name]`: `en` name, `d` what changed) changes the mechanic: `mod` field changes on a copy of the ability
    (`r`, `rng`, `n2` projectiles, `jumps`, `dur`, `ticks`, `stun`, `L`/`w`, `buff`; `'*1.4'` multiplies, `'+2'` adds), `post(c)` extra
    mechanics after the cast (extra waves, falling weapons, second rings, more summons…), `run(c,orig)` a replacement handler
    (Thousand Cuts, Rapid Fire, Aimed Shot, Disintegrate, Avenger's Shield…). Evolved casts also hit 25% harder (`EV137.dmg`, via `kqrP`).
  * How a cast becomes evolved: the outermost `cast` wrapper puts the evolved copy (`ev137Sk`: `Object.create` of the ability, same `n`)
    into the loadout slot for the call, so every layer (ground targeting, fxA/fxB, `cast_base`, `KQH` handlers) uses it; `EV137.cur` is
    carried into timers, tweens, `kqsObj` and `kqsChan` callbacks made during the cast. `aimPoint` honours an evolved `rng`.
  * Look: every evolved cast draws a turning rune circle, a light column and orbiting sparks; while `EV137.cur` is set the old effects
    get evolved companions (ring → `ev137Shock`, big burst → `ev137Flare`, area hit → glyph, bolt → `ev137Lance`, pillar → `ev137Column`;
    rate limited by `evxLimit`); shots get class models (`ev137Proj`: mage astral comet, ranger spectral arrow, assassin shadow star),
    a wake (`ev137Trail`) and an impact (`ev137Impact`). New cast poses replace cast/raise/nova/flex (`EV137.poseMap`, `kindPose`).
    Effects are tweens with their own materials disposed at the end (shared shapes/textures in `EVX`), and are added to `MPV.FX`, so
    co-op partners see them. Hotbar keys of evolved abilities glow and show ✦.
  Tests: `v137_evolve.py` (PART=checks,cast,sheets · CLS= · ONLY=): coverage of all 85, Evolve rules / cost / save / reset / window,
  mechanics measured in game (projectile counts, Frost Nova reach, Chain Lightning jumps, Cleave crescent and damage), every evolved
  ability cast for every class with no errors and no scene leftovers, preview sheets `out/v137_evolve_<cls>.jpg`.
- **New gear (v137, `2750`–`2790`)**: 150 templates appended to `ITPL` after the 200 older ones (`ITPL_V137` = 200; never insert
  before them, saves store indices): 50 weapons (3–4 per class weapon type), 8 Paladin shields, 72 armour pieces (`A137L`: 24 lines
  of helm + chest + boots, 6 per armour type, each with a palette in `MD_SETPAL`, a base shape per slot and a motif), 10 amulets,
  10 rings. Fields as v78 (`nw`, `imp`) plus `v7` (model key; `V137[v7]` → template index, `v137T(it)`). Every one has its own model:
  * Weapons (`2770`): `W137[v7](k,c,it)` builds the weapon in the usual frame (grip at the origin, head down -y, same size per type)
    from bevelled slab blades (`w7Blade` = edge slab + inset core, `w7Wavy` for flame / kris blades), grips, hafts and trinkets;
    bows / crossbows / slings dress the v83/v135 frame so the string and draw animations are unchanged. Hooked in `v89WpnKit`, so the
    held weapon (`LW89|tp|r`), the picture and the drop all show it. Shields (`2785`): `SH137`, the face dressed on both sides.
  * Armour (`2755`, `2760`): `mdGD` gives the piece its line's base shape (`d.st`) and motif (`d.mot`); after the piece (inside a
    hero: after everything, `gkLater`) the motif is built from `A7MOT[motif].helm/chest/boots(ctx)`. Spots are measured on what is
    built: `a7Ring(B,y,h,exRe)` = the convex hull of the triangles at that height (arms / cape / legs left out as needed), `S.at(θ,clr)`
    a point just outside it; `ctx.sh(s)` the top of each shoulder; `ctx.path([[y,θ]…])` a line over the torso. Small pieces are built in
    a local frame (+z out of the surface, +y up) and placed with `a7Put`. Motifs: chain, bone, thorn, candle, spike, eye, fang,
    feather, root, horn, skull, moon, blade, web, vial, ribbon, crystal, scroll, rune.
  * Jewellery (`2790`): `J137[v7]` kit (amulet: bail at the origin, pendant down; ring: band round z, setting on +y) for the picture
    and drop; worn, the pendant is the same kit small on the beast chain, the ring the same kit round the paw's finger (`j7Put`).
  * `genItem_base` is redefined (`2750`): a slot with no template of that tier and class falls back to the nearest tier (was tp -1).
  Tests: `v137_items.py` (350 templates, every new one drops for its class, stats finite, shop offers them, every model differs
  from every other item's, heroes build with each, save + reload keeps them); sheets: `SHEET=models SEL=weapon|offhand|helm|chest|
  boots|amulet|ring|all`, `SHEET=worn SEL=helm|chest|boots ARM=heavy|medium|light|cloth`, `SHEET=hand SEL=<class>`, `SHEET=jewel`.
- **The Lantern Road (v143, Kindlelight I main quest, `3020`–`3023`)**: the first chapter of a main quest line per zone (one chapter per
  field instance; only Kindlelight I so far). Kindlelight I's gateway to II is dormant until the quest is done: its F prompt is locked by a
  `portalPrompt` wrapper (`insGo` itself is not gated, so travel from the portal window, co-op joins and tests still work).
  * Layout (`3020`, `mq143Plan`, a pure function of the map data, cached): the outpost on the road's last straight, `N-52` steps before the
    gateway; 8 lampposts from `A+8` to `N-10`, alternating sides 2.7 off the road; the Ripper starts on the road at `A+2` and parks beside
    the gateway on the side away from Cheddar's gateway spot. `mq143Keep` keeps decorations out of the outpost, the lampposts and the
    parking spot: 1680's `place` returns true without placing (counted as placed, so the seeded stream and every other decoration are
    unchanged). Roaming groups whose home is within 17 of the outpost are dropped (`rosterBuild` wrapper).
  * Wardens (`3021`): 7 armoured animals (wolf captain, boar, bear, hound, fox, lynx, beaver engineer) built as town folk
    (`FK137.out` / `FKO` labels `Lantern Warden · <key>`) wearing the heroes' heavy chest armour (`mdChestO` with a hand-made design:
    aegis / warplate / wall / hauberk / cuirass / mail), greaves, a tabard, the lantern sigil and a steel helm lofted over the folk skull
    (`mqw143Helm`: cap, kettle brim, crest, cheek guards, the captain's plume, the engineer's goggles). Weapons and shields are rigid kits
    mounted on the paw bones in the guard pose (`MQW143_POSE`); `mqw143Anim` = folk rest + guard pose + v93 idle, or the folk walk.
  * Quest (`3023`): `MQ143.st` 0 not met · 1 met · 2 rolling · 3 done; done also when II is reached (`mq143Done`). Glowbulbs are a quest item
    (`MQ143.b`, not a material, no other use): every Kindlelight I kill drops one at `MQ143.drop` (55%) while more are needed (`mq143Need`:
    dark lamps × 3 − carried − on the ground); kind `mq143` drops go through `take`. F at a lamppost with 3+ lights it; the last lamp
    starts the roll (`MQ143.speed` 1.9 tiles/s along a Catmull-Rom route, wheels spin, chimney smoke, two escorts walk beside it), then the
    fire-up (jacks, claws open, coil charges, arcs to the arch, flash) opens the gateway (st 3). Leaving the instance mid-roll finishes it;
    a mid-roll save loads as done. Saved as `x2.mq143 {st,b,lit[8],seen}`; saves without it start at 0 (or done if II was reached).
    The scene is built lazily the first time the hero is in Kindlelight I and hidden elsewhere (its pooled point lights go to 0).
  * UI: tracker `#mqt143` sits above Cheddar's (`chqTrkPos132` wrapper), captain window `XR.mq143`, minimap / N-map marks, the bag's
    Materials tab lists glowbulbs under Quest items (`kqmMatTab` wrapper), icon `KQI.glowbulb` (emoji 🪔).
  Tests: `v143_lantern_road.py` (plan, keep-out, drops, pickup, bag, scene, prompts, window, lighting, tracker, saves, roll, fire-up,
  roster); pictures `v143_look.py` (`WHO=captain,...` warden sheets, `PROPS=ripper,lamp,lampOn,tent,...` model sheets, `VIEWS=`).
- **Boss fights:** `docs/BOSS_RECIPE.md` is the standard for new bosses (how Vorraxis was designed, modelled, animated, scripted and tested).
- **The Glowmire Crystal (v144, Kindlelight II main quest, `3031`–`3033`)**: chapter 2. Kindlelight II's gateway to III is sealed (its F
  prompt is locked by a `portalPrompt` wrapper) until the Glowmire Crystal is claimed.
  * Clearing the Glowmire Warren (II's camp furthest from the entrance, `mq144Camp`) opens a hatch in it (`MQ144.st` 1). F at the hatch:
    down into the Seeping Lair = Kindlelight's unused Wave Trial instance `INSL[4]` (renamed, Lv 7; round arena, `MB144L`), dressed as a
    goo cave (`mb144LairBuild`: painted ooze-veined floor, boulder walls, stalagmites, ooze falls and pools, fungus, husks, ladder, dais with
    the floating crystal inside an ooze shell). Built lazily, hidden outside the lair. A save made in the lair loads at the hatch
    (`wv135Out` wrapper); recall is blocked mid-fight.
  * Vorraxis, the Seeping King (`3031`): a bigger Akorror built with about twice the triangles (`MB144.tris`), shield scales laid in
    patterns (`mb144Cover`, `MB144.pat`), glowing ooze between them, scythe forearms, a stinger tail. He runs on the Sovereign engine
    (`svRig`/moves/poses/stagger/poise/die) with his own controller (`mb144AI` from an `eTick` wrapper, not a den: `e.mb144`, `e.sv.i='mb'`).
  * Moves (`3032`): intro, scythe combo, lunge (leaves pools), tail sweep, aimed geysers, spine volley, close burst + ooze lanes; at 55%
    `awaken` → Phase II (the edge floods and burns: `mb144Flood`), five-hit combo, eruption ring, bigger volley, and Crystal Siphon (he
    leaps to the dais, takes 80% less damage, a beam heals him; burst the three Ooze Sacs to break it → 4.6 s stagger, else he heals 12%,
    stone islands rise and the Deluge hits everyone not standing on one). Caustic debuff: −15% phys def, −20% speed.
  * The fight starts when you come within 9.5 or hit him; the ladder seals. A wipe or leaving resets him. When he dies (`MQ144.st` 2) the
    shell bursts; F at the dais claims the crystal (st 3): the II gateway wakes and the crystal floats over its arch.
  * Saved as `x2.mq144 {st,seen}`; done also when III was reached (`mq144Done`). Co-op: each player fights their own copy. Tracker uses
    `#mqt143` in II and the lair; minimap / N-map mark the hatch.
  Tests: `v144_glowmire.py`; pictures `v143_look.py` (`PROPS=` with MB144 sheet keys, `bossP:<pose>`).
- **The Three Sigils (v145, Kindlelight III main quest, `3040`)**: chapter 3. Kindlelight III's gateway to the Den is sealed (F prompt locked
  by a `portalPrompt` wrapper; three dark glyphs hang in the arch) until three rune sigils are attuned.
  * Layout (`mq145Plan`, pure function of the map data, cached): one sigil off the road at 30% / 56% / 82% of III's road, alternating
    sides, 9–18 tiles out, on open ground with room for a fight, away from the entrance, gateway, camps and each other (constraints relax
    in steps if nothing fits). `mq145Keep` keeps decorations off them (1680 `place`, like v143); roaming groups within 15 are dropped.
  * Sigil (`ms145Sigil`): flagstone disc with a carved rune circle and a glow layer, six leaning standing stones with glowing runes, a
    plinth with a floating glyph (Fang / Moon / Howl) and halo, a charge ring, and a pillar of light (faint while dark so it can be found).
    Violet while dark, bright violet while charging, green once attuned.
  * Coming within `MQ145.see` (22) finds a sigil (title card, map mark). F starts the essence charging ritual: `MQ145.waves` (4) waves
    `MQ145.gap` (5 s) apart, `MQ145.total` (100) ghost wolves, 25 a wave (`mq145Per`), level `MQ145.lv0` (4) + sigils already attuned.
    Dying wolves stream essence into the sigil; all slain → attuned. Falling, straying past `MQ145.leash` (30) or leaving fails it (wolves
    dissolve; retry any time). Ghost wolves: `EN.ghostwolf` (Ashwolf rig, dark translucent cloned materials, glowing eyes, aura, shadow
    puffs), spawned as minions (local in co-op).
  * Saved as `x2.mq145 {at[3], fd[3]}`; done also when the Den was reached (`mq145Done`). Tracker uses `#mqt143` in III.
  Tests: `v145_sigils.py`.
- **Sovereigns to the Vorraxis standard (v146, `3050`–`3056`)**: every Sovereign follows `docs/BOSS_RECIPE.md` now. Each keeps its
  v110/v112 poses and moves and gains (all in Phase II): a den change and a signature mechanic with a success and a failure outcome.
  | Boss | Den change (Phase II) | Signature (props → BROKEN / failure) |
  |---|---|---|
  | Argus (model rebuilt, `argBuild146`) | The Drowned Fog: fog, will-o'-wisps that burst on you (Hexed) | The Hundred Eyes: 4 Watcher Eyes on the walls fire at you; fail = heal + bolt storm |
  | Hydra | The Mere Rises: water floods the shore, sandbars stay dry (Wading) | Sever and Sear: 3 venom glands on pinned heads (bursting one severs a head); fail = heal + 2 venom rings |
  | Rime Wraith | The Whiteout: blizzard, fog banks, ice floor (you slide), wind | Frozen Heart: 3 frozen braziers to light; fail = heal + Absolute Zero (safe only by a lit brazier) |
  | Ssith'ra | The Sinking Sands: sinkholes that pull you in | The Rune Scars: 3 scars moving with the body; fail = heal + it bursts out under you + 2 sand rings |
  | Bloated One | The Rot Spills: spreading rot pools (Rotting) | The Feast: 3 carcasses he walks to and eats (each heals + rot burst); cut them all down first |
  | Vaelric | The Crimson Tide: blood rain, 3 blood channels sweeping the floor (Bleeding) | Blood Covenant: 4 chalices tethered to him; fail = heal + Exsanguinate (2 blood rings) |
  * While channelling a signature the boss is warded (`e.sv.dr`, a `hurt` wrapper in 3050). Props are v86 `dqProp` den props (targetable,
    no XP/loot). Breaking all of them casts the generic `broken` move (`sk146Broken`, ~4.6 s). Moves are registered with `svRegMoves`.
  * Den state lives in `A.s146` (`sk146Den`); `sk146DenClear` (from each boss's `denClear`) removes every object and resets it.
    Phase II scenery starts only while a fight is on (`A.f`).
  * Models: Vaelric (sculpted face, fitted hair, heavier cape, filigree, mail skirt, halo/glyph in Phase II), Rime Wraith (folded robes,
    sculpted skull, ice clusters, soul lanterns), Bloated One (fat rolls, sculpted head, sores, flies), Argus rebuilt from scratch
    (~340 shingled fur tufts, rib windows, antlers, 50+ eyes), Hydra (barnacles, weed, spines, venom drips), Ssith'ra (sand from the seams).
  * Motion: `B.spr` springs give follow-through to capes, hair, robes, tails, ears, jaws, tongues and wings (`sk146Spring`, a `svApply`
    wrapper); the strike ease `svEase.s` is now `1-(1-k)^2.6` (it was `^5`, a one-frame pop) — the same timings and hits.
  * Effects kit: debris, droplets, flash lights (2 pooled), ground cracks, shock walls, columns, beams, swarms, weather; `sk146AutoFx`
    gives every hit without its own effect a liquid spray / sparks.
  Tests: `v146_sovs.py` (BOSS=0..5): model, springs, every move runs, the den change, the signature both ways, the den clean afterwards.
- **Character slots (v116)**: three saves, `KQSL.keys` = `et_save_v1` (the old single save, so it becomes slot 1), `et_save_v1_s2`,
  `et_save_v1_s3`; the last slot used is `localStorage.kq_slot`. `SAVE_KEY` is a `var` that follows the slot (`kqSlotSet`), so all save code
  is unchanged. The title lists the slots (filled → Continue, empty → New, 🗑 twice to delete) plus "Join a friend". From the in-game main
  menu another slot means save → switch → reload (sessionStorage `kq_cont` / `kq_new`). Export / Import work on the current slot.
- **Join-code co-op (v116)**: works without a Claude account, in any browser. `MP.room` (0520) is now a relay that forwards to the live
  backend (`MPX.be`): the claude.ai room when the page has one, or a join-code room (`kqnRoom`, 2150) with the same calls (on, onPeers,
  emit, presence, peers). The host gets a 6-letter code (peer id `kq116-CODE` on the public PeerJS signaling server 0.peerjs.com, spoken
  directly over WebSocket, no library); joiners connect over WebRTC data channels in a star, the host relays and stamps senders. Up to 8
  players; the game ends when the host leaves. The join window picks the slot (or pastes a save code into one); `?join=CODE` fills the
  code. Handlers in 0520 are looked up per message, so wrappers of `mpOnEV` etc. keep working. Tests set `KQNET_SIG` / `KQNET_ICE`
  (`test/fakesig.js` fakes the signaling server; the WebRTC is real).
- **Co-op visuals (v116, 2170)**: visual only on the partner. Presence adds `pv` 116, `cf` (companion spots) and `ck` (companion looks →
  `cr()`). Every local `haPlay` is sampled (11 keys) and replayed on the partner's model (it replaces the v58 sword swing for v116 peers).
  While a swing / cast / companion spell runs (`MPV.cap`, carried into tweens, timers, hit callbacks, ability objects), calls to the effect
  functions in `MPV.FX` are recorded with their arguments and the hero's spot and replayed in order; `launch` becomes a ghost shot, companion
  lunge / bolt / spell motion replay on the partner's companion model. Entries ride the `ev` topic (types V P L C B). During a replay
  (`MPV.rep`) hurt / area / zones / shots are blocked. A new effect function only shows for partners once it is added to `MPV.FX` (it must
  not deal damage itself). Summoned models (wolves, clones) and effects built straight from meshes outside these functions are not sent.
- **Web version (v116)**: `build.sh` also writes `dist/web/` (the same `index.html` + `game.js`) and `dist/kill-quest-web.zip` for a static
  host such as itch.io (HTML game) or Netlify Drop. Its saves live on that site; players bring a hero with Export / Import.
- **Sovereign fights (v110)**: every Sovereign is a souls-style boss registered with `svReg(i,B)` (`SVB[i]`). Its model is
  rigid parts on named joints (`R.J`), built by `B.build` inside the old enemy group (scaled `1/e.m.bs`, so models are in world
  units; the old skinned body is hidden; static meshes on one joint are merged per material, `userData.noMerge` keeps one apart).
  Animation = `B.loco` (procedural base: breathing, gait) + the action track of the running move (`trk`: `[time, pose, ease,
  tremble]`, poses in `B.P` as joint offsets `[rx,ry,rz,px,py,pz]`; a name ending in `~` is the left/right mirror). A move
  (`B.M[id]`) is a timeline: `trn` turn windows (it commits after its lock), `rm` root motion, `hit` (shape `{k:'c'|'r'|'a'|'l'}`,
  checked once at its time, so a dash with i-frames dodges it; melee moves `mel` show only a faint warning in the last 0.32 s,
  area moves the full red warning), `ev` events, `tr` weapon trails, `nx` combo follow-ups, `rec` extra rest. The AI picks by
  range / angle (`r`, `a`: f, b, s, fs, sb, any), weight `wt`, cooldown `cd`, phase `ph`. Poise: damage fills the posture bar
  (`B.poise` × max health); a break casts `stagger` (+35% damage taken; `armor` moves finish first). Phase II at `B.ph2`
  (0.55) through the `awaken` move. Co-op: only the driver (`svAuth`) picks; every cast is relayed as BMV `sv<i>_<id>` with the
  seed in `en` (1 + seed/1000, the relay clamps en to 0.5–2), so partners replay the same timeline and random choices.
  The v86 den hazards and den AIs are switched off by `svDenTakeover` (scenery, seal and colliders stay).
- **Clean edges (v124, `2280-v124-clean-edges.js`)**: rim tiles ('#' and 'R', 0–2.6 tiles past the walkable edge) stay solid and keep
  their minimap colour, but no longer draw a choppable tree or three random boulders each (`v124Rim` is checked in 0060 and 0070; the
  Citadel keeps its void rim and castle walls). `v124Edge` (end of `wdDeco`) lines every instance's edge from a kit per instance
  (`K[g]`: stone colour + top, back-row kinds with weights, density `bd`, band `bw`): ledge stones on one contour (d ≈ .55) turned
  along the edge, then on the rising slope behind them themed scenery (big background oaks/pines `e_oak_*`/`e_pine_*`, or the theme's
  own stalagmites, crystals, cacti, pillars, dead trees), kept apart by an occupancy grid that also holds the bank decorations. None of
  it can be chopped. Wood comes from groves (`v124Groves`, end of the 0045 map build): 3–6 choppable trees ('#' tile + `'tree'` prop,
  a free tile round each trunk) per grove, about 9 groves per field instance, off the road, camps, gateway and entrance (caves use
  tighter limits). Seeded per instance. Tests: `v124_edges.js` (`python3 probe.py v124_edges.js`), `v124_edges.py` (edge screenshots).
- **Instance themes (v112, `1981-v112-instance-themes.js`)**: field instances II and III of every zone have their own sub-theme (own
  `BIOMES` entry with the zone's name, own tiles via `v112Map`, wall profile via `v112Ht`, decoration set via `v112Deco` in 1680, glowing
  ribbons, per-instance atmosphere and arrival name). Kindlelight: Glowmire Hollows (caves, goo streams, mushrooms) / Rotwood (decaying
  forest); Hillside Crest: Mistmere / Galecliffs; Burningeye Summit: Rimecaverns / Stormcrown; Searing Sands: Sunken Temple / Salt Wastes;
  The Dirge: Drowned Crypts / Ossuary Fields; The Citadel: Outer Ramparts / Inner Keep. Instance I keeps its v108 ground. `WD_WL` 112: a
  v108 save standing in II or III goes to that instance's entrance. `test/v112_instances.py` (walkability, determinism, saves),
  `v112_shots.py` (contact sheet).
- **Instance creatures (v113, `2000`–`2090`)**: field instances II and III of every zone have two new creatures each (24 in all;
  instance I keeps the zone's originals). Kindlelight II Amalgam (the Caustic Goo evolved), Akidon (what the Bloat Maggot's larvae
  become); III Lichen, Akorror (the evolved Akidon). Hillside Crest II Mire Croaker, Gharial Reaver; III Galecliff Basilisk, Shellback
  Snapper. Burningeye II Rimeshell Crawler, Frost Wendigo; III Stormborn Jotun, Storm Harpy. Searing Sands II Tomb Priest, Sun Scarab;
  III Salt Golem, Dust Wyrm. The Dirge II Drowned Thrall, Wailing Banshee; III Ossuary Colossus, Ossuary Hound. The Citadel II Rampart
  Gargoyle, Blood Hound; III Crimson Executioner, Nosferatu. `n3Def(key,D)` registers one: humanoids give `D.hum` (a HUMLOOK) and
  `D.body(B,P,k)` built with the v94 toolkit (big ones are in the v99 `BRUTE` list in `0010`); creatures give `D.rig` (a base rig's
  low-poly body in their colour + their own `kit`, optional `geo`, `noBaseKit`/`noBasePost`). `D.moves` = [basic, sig, sig] (the
  v107 rule: own signatures, no charge/pounce; `v107_sig.py` checks them with the rest); `D.basic` maps the basic attack to the
  creature's own animation, `D.bfx` adds a hit effect to it, `D.stance` a permanent pose offset (hunches, crouches). Every move has
  its own keyframe track (`n3Hum` humanoid channels as absolute HUM_ATK-style values, `n3Cr` creature channels as offsets, plus body
  channels `Brx Bry Bz By`), time 0..1 wind-up, 1..2 act, 2..3 recovery, sampled with the v100 monotone cubic. Moves are ordinary
  `MV107` entries (`n3Mv`) with `x6` hooks; effects only hurt through `s6Hit`/`hitHero`, knock-backs/pulls move the local hero only
  and never through a dash. `n3Zone(z,k,{roam,camps})` sets an instance's roaming list (weights) and its three camp themes
  (`CTH['v113_z_k_i']`, applied to `CAMPS` by `n3Camps` in `2090`). Tests: `v113_roster.py` (rosters and camps per instance, a free
  fight per creature), `v113_models.py` (contact sheets in the viewer build: idle views + 5 frames per move; `ONLY=key`).
- **Camp sites (v123)**: all 54 field camps are designed one by one (`2250`). The plan (`cs123Plan`, key `'z_k_j'` = zone, field
  instance, camp number in `I.cl` order) gives each its radius `r` (8..16, inside the 17-tile walkable clearing), ground ops (bowl,
  mound, ridge, tiers, shelf, tilt, bumps, dunes, spire, dip) applied to `HF` at load before the terrain mesh, grass and nodes are
  placed, the tile it paints underneath (dithered) and the title-card line. Dry camps are lifted so no ground sits under the world's
  water surface (y .02); `wet` camps sink to that depth so the zone's own water fills their low ground (wadeable). `cs123Setup` (from
  0250) puts `C.r`, `C.sp` (garrison spread), `C.des`, `C.ang` and a position-based `C.seed` on every camp, so co-op partners build
  identical camps. `buildCamp` now builds the design (`cs123Build`: a kit of set pieces, merged by material; breakable boxes and
  animated pieces stay separate, animated by `cs123Tick`). The wooden name sign is gone; walking into a camp shows a small title card
  in the zone's lettering instead. Camp radius is used by `campAt`, the zone map circle, box breaking, the roaming-group and
  decoration keep-out rings (`CAMPS_PRE` returns `[x,y,r]`). Test: `v123_camps.py` (`NOSHOT=1` for checks only; `BRIGHT=1` for
  well-lit review shots).
- **Terrain height fix (v112)**: `GHv` clamps the row by `H` (it used `W`, so everything south of row 1182 — all of The Citadel and the
  Crimson Throne Hall — read row 1182's heights). `test/v112_arena.py` checks arrival height and floor flatness in all six dens.
- **Sovereigns (v112)**: every boss file (1971–1976) has a far more detailed model, three new special attacks, cooldowns on every move and
  its own `DSTXT[i]` den-sign text at the end of the file. Rime Wraith's scythe and the Bloated One's cleaver are held blade-down;
  Ssith'ra surfaces head-only (`burrowH`/`burrowB`) when another burrow follows and only whole on the last (`burrowC`). Tests:
  `test/v112_<argus|hydra|wraith|ssithra|bloated|vaelric>.py`.
- **Far-scenery cull (v111)**: top-level objects (and the children of groups wider than `FC.big` tiles) whose world
  bounding sphere is beyond the fog's reach (`FC.k`/density, clamped to FARR+`FC.pad`..cam.far) are hidden only while
  `POST.render` runs, so game code never sees their `visible` change. Chunk props (CHL), lights, the hero, enemy models,
  Points/Sprites and anything with a `fog:false` material are never culled; `userData.noFarCull` opts an object out.
  `test/v111_farcull.py` renders 49 spots with it on and off and checks the pixels match. Measured and not kept (v111):
  drawing small clutter a shorter distance (~1-2% fewer triangles) and props in 64x64 blocks (28% fewer draw calls but
  +15% triangles and no faster frames); shadows were already cheap (v98).
- **Den size (v89, v108)**: the den files build each den at its original size; `1180` maps it outward by `DK` (2 since v108,
  was 1.35) and heights by `DKY` (1.3). `ARENA_R` = 14*DK, `PM_DENR` grows with DK. Den runtime numbers are written `n*DK`.
- **Decorations (v104)**: fixed spots outside every lot and door spot (checked by `PART=deco python3 v103_kingdom.py`);
  `SH.deco[k]` 1 shown / 0 owned but hidden, saved as `x2.kdeco`. Wall pieces (`D.wall`: banners, ivy, ravens) measure the wall
  of the current Bastion Walls level by ray casts (`dcWall104`) and are rebuilt when it changes (`PART=tiers` checks every level).

- **Version 139 (owner's list, Oct 2026)**: *Attributes replace talents* (`2930`): every level gives `ATR139.per` (3) points for Intellect,
  Strength, Dexterity, Vigor, Wisdom and Luck (`ATR139.D[k].p` per point; 10/25/50/75 points unlock a bonus each, `D[k].T`); the old
  automatic growth per level is cut to `ATR139.flat` (55%) for health, attacks and defenses (mana keeps its growth). Talents are gone:
  `talRank` is 0, `talMods` returns the attribute bonuses (HS_base adds them where it added talents), `tpFree` counts unspent attribute
  points; old saves lose their talent ranks on load (`atr139Migrate`, flag `hero.tal.__at138`) and get every point of their level back
  to spend. Companion talents are unchanged. Spending is staged (+ / − then Apply; Auto fills the free points in the class's mix,
  `ATR139.auto`; Reset costs 40 gold per level, as does the Magic Shop's Tome, which used to wipe `hero.tal` including ability ranks).
  With Auto, a gearless hero lands at ~1.0–1.2× the old gearless power from level 10 to 50 (warrior highest), which makes up for the
  lost talents. *Keys*: C opens the Character window (the old `#tal` modal, `2940`: model, attributes, every stat with "→" previews of
  pending points, bonuses), K opens Abilities. *Power* is shown on a smaller scale (`pwr139` = 4·√old: ~100 at level 1, ~600 at 50 with
  gear); `recPower` uses the same scale. *Recommended power replaces enemy level ranges* everywhere an instance or zone was labelled
  (location box, title cards, portal window and signs, gateway prompts, local map, treasure maps, den sign). *Kill XP* no longer has a
  bonus or penalty for the level gap (`gainXP`). *Flail*: the sweep trail and the crash ring are drawn at the ball's measured reach
  (~1.4 tiles; the hit area stays 3.6, v127). *Inventory preview*: reopening the bag restarts the preview's render loop, so equipment
  changes show at once. *Giant monsters under the map* (owner's report) could not be reproduced (`v139_giant_fight.js` soak:
  every field instance, fights, deaths, respawns; `v139_skin_check.js`: every skinned body's bone indices and weights); `g139Tick`
  now puts a drawn monster's scale back to its size and lifts it onto the ground when either is far off, and logs it (`G139.log`).
  Test: `v139_checks.py`; pictures: `VW=1280 VH=800 WIN=keyc,bag python3 v139_ui_shot.py` (`JS=` a setup snippet).
- **Version 140 (owner's list, Oct 2026), creator fixes**: picking the Stoneshell companion no longer pops the "Stone" material hint
  (0840 `msrcFind` matches material names as whole words, never inside the creator `#start`). The raven Mage's carry hold (2220)
  works in the model's own frame (`fc140Fwd`: facing from the world quaternion, parents included; `fc140Scale`: size against the game
  hero), so dragging him round in the Look step / barber (and the inventory and Character previews, which turn the model on a pivot) no
  longer swings his arm toward fixed world points. The Ranger's creator pose is new (`2960`, `CC116.P.ranger` + `cc140Bow`: bow raised
  high and upright, other fist to his chest). The creator's ability hint says K. Test: `v140_creator.py` (`SHOT=1` pictures).
- **Menus (v117)**: the ☰ list has no Fusion or Sovereigns button (both kept hidden in the markup: `ui()`, the hotkey map and later
  wrappers look them up; G still opens fusion, J does nothing; sealed portals still open the portal list). Fusion is a tab of the
  Companions & Eggs window (`cfTabs116`, a row under each window's header; closing Fusion opened from there goes back to Companions).
  Talents (K) and Abilities (C) were separate windows (v139: talents are gone, C is the Character window, K Abilities).
  **Kingdom window** (B or ☰ → 🏰 Kingdom, from anywhere; still `xwMode 'hold'`, also opened by the Steward and house doors):
  tabs `KM103.tab` = `kingdom` (🏗️ Construction: plan + shops/upgrades/houses; the citizens list moved out of it), `vill`
  (👥 Villagers: one card per villager with state, trip progress, trade buttons, job chips, rank-up, Collect; goods can be collected
  from the window as well as at the house) and `deco`. A house door opens the Villagers tab with that house's villagers highlighted.
  **Forge**: the bag's Forge tab and the item Upgrade button exist only while the bag was opened with F at the Blacksmith
  (`KQM_SMITH`, cleared when the bag closes); `doUpgrade` refuses otherwise. Tests: `v117_menus.py`.
- **Zone arrival (v117)**: no recommendation pop-up; the recommended power (`zoneRec`, now for every zone and per instance:
  `recPower(I.lv[0])`) sits on line 2 of the location box, red ⚠ when your power is lower. The arrival banners (v56 + v112) are muted
  and one themed title card shows instead (`zt116Ins`: zone kicker, place name in the zone's lettering, emblem ornament, line, enemy
  levels + rec. power); Duskhold's first-visit banner is a card too. Fonts: Cinzel Decorative, IM Fell English SC, Pirata One (page
  font link). Tests: `v117_titles.py`.
- **Weapons (v117)**: no elites in Kindlelight I (`noElite116` in `rosterBuild`). The crossbow bolt starts at the crossbow's front end
  (`xbowMuzzle116`, measured once per model from its geometry) and the crossbow is turned level along the aim while aiming
  (`xbowLevel116`, after every animation layer). The Mage's paw (frog, since v134 raven) holds the weapon in its channel (v117.2: `fc117Frame` measures the paw from the skinned mesh: fingers, knuckle axis, curl side, grip point; staff/wand sit along the knuckle axis in every pose, the wand turns along the fingers during attacks, the orb stands in the upturned palm; frog `paw.curl` 1.05). His carry hold (`FC116`) poses his weapon arm by a two-bone IK and
  orients the weapon (staff upright beside him, foot angled away from the hem; wand ahead; orb above the paw in front); it fades out
  with the beast arm hold during attacks, and every change is restored before the next frame. The Mage also spreads his shoulders
  during attacks (`D.atk.shz`). v118: his elbow bends back and a little out (`FC116.pole`; it pointed forward and in, so the arm bent backwards); the
  staff/wand head points toward the paw's knuckle side as it faces forward in the bind pose (`fc118Sign`; it was learned from the first
  carry frame and could come out reversed, head-down in every attack); while the hold fades in and out the shaft swings to its carry
  direction and the twist round the shaft blends separately (`H._fcth`), so the weapon cannot tumble end over end. `v117_wclip.py` measures weapon points inside the robe/armour shell (`v117_wclip_lib.js`; idle/run
  frames must be 0), `v117_wclip_live.py` the real attacks. Blacksmith keeper hammer head runs across the swing plane (face down).
- **Rings (v117)**: the finger ring is a 6 mm band (`ring` torus y-scale .024; it was .35, an 8 cm tube). `v117_grip.py` (PART=rings) shows it on every race, PART=grip the Mage's paw; `v117_grip_atk.py` the paw in the real attack / cast poses.
- **Creator (v117)**: the class step builds each class's own model (`cc116Model`, cached per look): current beast + exactly the
  starting gear of `ccBegin`, framed on its skinned body, a heroic pose (`CC116.P`, restored every frame) and class effects
  (`CC116.FX`: embers, holy light + halo, shadow smoke, arcane rings, leaves). v119: the badger Paladin holds his shield low at his
  side (it covered his face). Tests: `v117_creator.py` (`ROT=` fixed turn).
- **Ability preview (v119)**: the Abilities window's detail panel runs the ability itself on a small stage (shared `PV` renderer):
  the real hero model (`pl`, lent to the stage while the window is open), the real `cast()` against a straw training dummy (a fake
  enemy record, `abxDummy`), so every pose, projectile, decal, summon and particle is the one played in a fight. It loops (a loop
  ends when everything has played out, at most ~6 s of game time); ↻ replays. Safety: all ability code runs inside `abxIn()/abxOut()`,
  which swap the hero's fields, `KQS`, `tgt`, `hAgro` and the effect lists (`tws`, `enemies`, `shots`, `zones`, `traps`, `FXB_DEB`,
  `FXA.live`, `KQ.fx`, `DTL.live`) for the preview's own, mute sounds, empty `UIO_EL` (so `uiOpen()` is false in there) and route
  `scene.add` to the stage and `burst` to the stage's particles; timers/tweens made in there run in there; hits only make the dummy
  flinch (`heroHit`/`hurt`/`compHit`/`eStatus` do nothing in the sandbox); town walls and `solid()` don't block. While it runs the
  preview owns `HA`, the riding state and the ground heights under the stage (`HF` flattened, radius 22); `abxStop()` gives them back
  (window closed / other tab / other preview: a MutationObserver on `#xw`, a 300 ms check, the `pvShow` wrapper), and `saveGame`
  saves the world's hero position. In co-op (the world keeps running) it only shows a note. If a new effect system keeps its own
  list ticked by the main loop, add it to `abxSwap`/`abxStep`/`abxClean`. Tests: `v119_abprev.py` (every ability of every class:
  casts, hits the dummy, world state unchanged; frames in `out/v119_abprev_<cls>.jpg`).

## Retired systems

Removed in v103: the Garden park in the south half of the Grand Square (its trees, rocks, walls and the ring that grew with
every completed zone); the South Ward's building lots took its place. `CYD` stays as an empty record.
Removed in v102 (they had been switched off many versions earlier but still shipped): the Realm (building, farming,
crafting window, habitats, sky island), dungeons, bounty boards, world events, the team-up attack, the v34 incubator
slots, the v83 mount models (every mount is built by the v100 model track), and code that later versions replaced at load.
Removed in v115 (review pass): the Realm's block meshes, sky island pieces and its three point lights (still added to the scene
and drawn every frame), `dkHeroKit`, the v78 weapon models (0780 builds every weapon), the v81 swing/cast animations (0900 replaces them),
the 1150 look fallback hooks, and the unreachable statements `tools/deadcode` listed.
Kept on purpose: dungeon entrance *spots* (`DUNS`, emptied at load) still steer where camps and secrets go;
soil mounds and shallow water still give the old Realm terrain items (`ITEMS['t:…']`, shown under "Realm items" in the
bag) — removing those would change the world, so it is a design decision for later.
Everything removed is in git history: branch `claude/v100-integrate` is the last version before the cleanup.

## Build

```bash
./build.sh          # -> dist/ashen-wilds.html (BUILD_OK + size)
```

## Testing

**How to test (owner's standing request; back on GitHub Actions since Oct 25 2026, the repo is public so minutes are free):**
1. **After a change:** commit, then `tools/ci.sh changed` — the smoke suite plus the tests that `test/affects.txt` maps the changed
   files to (compared with `main`); core engine files or test tools run the full suite. `python3 test/run_suite.py changed --list`
   only prints the choice.
2. **Before a publish:** `tools/ci.sh` (full suite, `test/full.txt`, on the exact commit). Publish only when it is green.
`tools/ci.sh` pushes HEAD to a scratch branch `ci/<branch>` (a push there starts `.github/workflows/tests.yml`; smoke / changed are
started by hand on it), waits, prints a PASS / FAIL line per test and saves it to `test/out/suite/gh-<suite>.summary.txt`. Every test
is its own parallel job in **fast mode**; the run's last job, Summary, lists the results. It also prints the `FAIL …` lines of
failed tests (from the run's annotations; this workspace can't download Actions logs or artifacts, the Actions tab shows them).
`tools/ci.sh full v57t.py v60t.py` re-runs only those tests (branch `ci-run/…`). The Actions tab's Run workflow does the same by hand.
**Local fallback** (and for re-running one test while fixing it): `cd test && python3 run_suite.py changed|full [test.py …]`.
`run_suite.py` snapshots `dist/` first, runs one test at a time in **fast mode** (`test/fast.py`: the main game view skips drawing
except right before each screenshot, which still gets a full-quality frame; the game loop runs ~14 fps instead of ~0.5), stops
each test's browser afterwards, and writes `test/out/suite/<suite>.log` and `.summary.txt`. `FAST=0` before a suite line turns fast
mode off for that test; `python3 fast.py <test.py>` runs any single test fast by hand. Don't run two suites at once on the 2-core
session machine (helper agents share it too).
Each test runs through `test/ci_run.py`, which fails on any `FAIL …` line or crash except the stale checks listed in
`test/ci_known_fail.txt`; screenshots are uploaded per test. Locally, still run one test at a time while developing the change.
New tests for a feature go into `full.txt` (and into `smoke.txt` only if they are short and cover something central).


Headless Playwright (Chromium, software WebGL, ~1 fps). `play.py` is the harness: it rewrites CDN URLs to
`test/vendor/`, skips the title screen (`window.AW_NOTITLE`; `TITLE=1` keeps it) and writes screenshots/logs to
`test/out/`. `SRC=<other.html>` tests another build, `AW_TMP=<dir>` uses another output folder (needed to run two at once).
Run tests one at a time on a small machine; two in parallel can time out at page load.

```bash
cd test
python3 v38t.py              # save/load
python3 v32t.py              # portal → Sovereign kill → wave trial
python3 v57t.py              # grades, XP, skills, consume, fusion
python3 v60t.py              # zone roster (per instance, 30 s respawn)
python3 v108_instances.py    # v108: instances (fields, Den, Trial), levels, gateways, respawn, recall back, portal window, saves, chunk visibility, den size
python3 v113_roster.py       # v113: instance creatures per field instance, camps, a free fight with each new creature
python3 v114_beasts.py       # v114: model sheets per beast race (RACE=, PART=base,helms,gear, FURI=)
python3 v114_clip.py         # v114: armour clipping per class item on its animal (HUMAN=1 baseline, POSED=0 bind only); dbg_clip.py RACE= ITEMS= pictures
python3 v136_gear.py         # v136: every armour piece on its animal (builds, speed, triangles, hoods, swinging robes, hood clearance)
python3 v136_icons.py        # v136: every armour icon renders (out/v136_icons_<arm>.jpg)
RACE=raven SETS="helm:hat,chest:pyre;chest:star" python3 v136_sheet.py   # v136: gear pictures, VIEWS= and TAG= options in the file
python3 v136_weapons.py      # v136: every weapon type at rarity 0, 2, 4
python3 v137_enemies.py      # v137: enemy bodies (no companion bodies), companion variant bodies, scarab legs
LIST="C:Sporelord:3;E:basilisk" python3 v137_creature.py   # v137: creature sheets (VIEWS=, TAG=)
python3 v137_npcs.py         # v137: animal townsfolk — every keeper + citizens, sheets and limb checks (SP=fox,bear species sheets)
python3 v143_lantern_road.py  # v143: The Lantern Road (Kindlelight I main quest): drops, lampposts, the Ripper, the gateway, saves
python3 v144_glowmire.py      # v144: The Glowmire Crystal (Kindlelight II main quest): hatch, lair, Vorraxis, crystal, gateway, saves
python3 v145_sigils.py        # v145: The Three Sigils (Kindlelight III main quest): sigils, ghost wolf waves, attuning, the Den gateway, saves
python3 v146_sovs.py          # v146: Sovereigns: den changes, signature mechanics, springs, every move, clean dens (BOSS=0..5)
python3 v142_folk.py         # v142: townsfolk anatomy — floating parts, feet on the ground, sheets (SP=, KEEP=0, NOSHEET=1, V137=1)
TITLE=1 python3 v114_race.py # v114: creator → save → reload → barber; every class casts every ability as its beast (ABIL_ONLY=1 for just that)
python3 v114_save.py         # v114: save export / import, the split publish build boots
python3 probe.py v115_review.js # v115 review pass: save-import checks, portal board kept, slow cleanse, root+slow, shared ring/bar shapes, uiOpen, legendary powers, 4 point lights, shadow pass, boss tremble
python3 probe.py v120_idle_tilt.js # v120: idle wandering enemies never pitch their whole body (the old v42 sniff tilt/wobble is gone); expects maxPitch 0
python3 probe.py v121_step.js     # v121: melee swings only step into hitting range; expects inRange/touching to stay 0, outOfRange to stop ~0.8×reach away, air to keep the old step
python3 probe.py v120_tail.js # v120: beast tails stop smoothly after a run (stopMaxStep now ≪ old), lift a little while running, drag behind turns (turnLag > 0)
python3 v111_farcull.py      # v111: far-scenery cull, pixels match with it on/off at 49 spots (slow: ~10 min)
python3 v106_instances.py    # (v106 version, superseded by v108_instances.py)
python3 mpt.py mp_v106.py    # v106 co-op: host and shared monsters per instance
MODE=make SRC=<old> AW_TMP=<dir> python3 v106_oldsave.py; MODE=check OLDSAVE=<dir>/oldsave.json python3 v106_oldsave.py  # v97 save -> v106
python3 v73t.py              # hit feedback, low health, death, Rise Again   (TITLE=1 python3 v73d.py: title → Continue)
python3 v78t.py              # every weapon type's attack, Stable + mounts, items
python3 mpt.py mpsteps.py    # two-player co-op over a fake room
python3 v116_coop.py         # v116: join-code co-op over real WebRTC (fake signaling): code, wrong code, join, shared monsters, chat, trade, 3rd player, leave, host ends
python3 v116_vis.py          # v116: partner's companions, attack/ability poses, effects, ghost shots, companion spells show (visual only)
python3 v116_slots.py        # v116: three character slots, switching from the menu, delete, join window with a pasted save code
python3 v100_town.py         # Duskhold layout, reachability, shops, portals (portal3-5 / portal prompt checks are stale since v101)
python3 v109_kingdom_shops.py # v109: the kingdom's stages (walls, tiles, plots, outskirts), locked lots, old saves, turning buildings, every stage clear with everything built, shop upgrades (v109_shot.py: screenshots)
MODE=make SRC=<v108 build> AW_TMP=<dir> python3 v109_oldsave.py; MODE=check OLDSAVE=<dir>/oldsave109.json python3 v109_oldsave.py  # v108 kingdom save -> v109
python3 v103_kingdom.py      # lots, houses, citizens + trades/food/ranks, decorations at every tier, Steward window, evolution preview, keepers
python3 v105_abil.py         # every companion ability: cast, effect, strike moment (sheets out/v105_abil_*.png)
python3 v128_whirl.py         # v128: Whirlwind holds the weapon out level (two hands / dual axes out), companion does not circle (frames in out/v128_whirl.jpg)
python3 v122_support.py      # v122: companion heal / shield / buff go to whoever needs it most (hero or companion)
python3 v124_edge_test.py      # v124: clean edges (no choppable rim trees, groves choppable, edge pieces apart); v124_edges.py: edge screenshots
python3 v107_sig.py          # every zone monster's signature moves hit, debuff, no shared signatures, no lunges (SHOT=1 sheets out/v107_*.png)
python3 v107_ai.py           # the AI picks signature moves in each zone;  v107_tail.py: Gravewyrm/Venomcoil tail during abilities (viewer build)
python3 v103_poses.py        # close-ups of the working shopkeepers (KEEP=smith,cook  SIDE=.8);  v103_walk.py: a walking citizen
python3 probe.py file.js     # run one JS snippet in a started game, print the full JSON result (OUTF=out.json)
python3 v110_moves.py         # v110: every Sovereign move: contact sheets at the track keys, hits (BL=0 MV=claw,snap SHOT=0 LIT=1 CAM=play)
python3 v110_fight.py         # v110: free fights with the real AI (moves chosen, stagger, Phase II, death, wipe); avg AI ms per frame
python3 v133_sov_spacing.py   # v133: posture, retreat and spacing plans vs the old AI, hero standing still in melee
python3 v110_mp.py            # v110: co-op relay (driver queues, partner replays with the same seed, Phase II from health)
python3 v86_den0.py … v86_den5.py, v89_dens.py   # every Sovereign den (stale since v110 for the den hazards they check: scenery parts still apply)
```

Every other `v*.py` is the check written for that version's feature (the first comment line says what it covers;
most accept `PART=`, `NOSHOT=1`, `SRC=<old build> TAG=before` for before/after comparisons).
For faster simulation stub rendering and the frame clock in `page.evaluate`:
`POST.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)`.
`python3 v94_probe.py file.js` runs one JS snippet in a started game and prints the result.
`COV_OUT=out/cov.json python3 covrun.py <test.py>` records which functions ran (V8 coverage).
`BAKE=1 python3 v100_anim.py` re-bakes `src/js/1705-v100-anim-baked-keys.js` from `test/v100_anim_moves.js`.
`v79t.py` renders a music preview to `test/out/` (`NOREN=1` skips it).

## Cleaning up

`tools/deadcode/run.sh` (needs `npm i -g typescript`) lists top-level declarations that nothing can reach, writing
a stripped copy to `/tmp/kq_stripped.html`, and checks it for names or element ids that would go missing. Names used
inside the tests' JavaScript and the few looked up dynamically (`window[name]`) are kept. Treat the output as a
suggestion: rebuild, run the tests and load the game before keeping anything.

## Publishing

Since v114 the artifact is two files: publish `dist/artifact/index.html` as the page with `files: {"game.js": "dist/artifact/game.js"}`
to the artifact URL above (pass it as `url`). The page is ~44 KB, so a new session can read it in full (Artifact `read`) and republish;
only the page needs reading, the script goes up as a supporting file. Omitting `capabilities` on a redeploy keeps the co-op room;
if they must be re-declared: `{"room":{"topics":{"es":"interact","ev":"interact","hit":"interact","bs":"interact","trade":"interact","chat":"interact"}}}`.
`dist/ashen-wilds.html` (single file) stays the build the tests load.

## Animation viewer (separate artifact)

`viewer/` builds `dist/kq-anim-viewer.html` (one file, what the tests load) and `dist/viewer/index.html` + `dist/viewer/game.js`
(not committed), published on its own as the claude.ai artifact https://claude.ai/artifact/CFMkqW7fCZR1DhZoRZ5Qxk since Oct 25 2026
(the old single-file link QE5i4p6m1KaMduTUe453Qm stopped there: too large to re-read before republishing). It is the game build plus a viewer panel that plays the real
game code on a quiet stage (Hillside Crest I's road; natural spawns off). Four tabs:
* **Companions**: every species, its 4 evolution looks, basic attack and its 4 abilities.
* **Monsters**: every creature that can spawn, grouped by the zone it lives in (the bestiary's `dex141Where`), plus quest
  creatures (the ghost wolf), and each of its moves (basic + signature moves, red warnings shown).
* **Bosses**: the six Sovereigns, each in its own den with the real fight started, and Vorraxis in the Seeping Lair.
  Every move by name (`BOSSN` maps the move ids to the names in each den's guide `DSTXT`; follow-ups marked), Phase II moves
  (turn Phase II and the den change on), the signature move, entrance, stagger, broken, Reach and a defeat preview (the fall
  track on the living boss). The AI is held still while the viewer runs: `svPick` returns nothing, `svMoveFree` /
  `mb144Move` only walk back to the mark, retreats and plans are cleared after each move; the boss keeps full health.
* **Hero**: every class (as its beast), every weapon type (each combo hit, full combo) and all 17 class abilities, base
  form (rank 1) or evolved form (rank 5, v137), cast for real through `cast(0)` with the loadout holding only that ability.
Speed (1×–⅒×), pause, frame step, camera presets (relative to the boss's facing in the Bosses tab), loop, Play all.
`viewer/pre.js` runs before the game and puts performance.now / requestAnimationFrame / setTimeout on a virtual clock
(`KVCLK`); `viewer/viewer.js` runs after it. Build with `./viewer/build_viewer.sh` (the build is committed), check with
`cd test && python3 kv_viewer.py` (`TABS=comp,mon,boss,hero,abil`, `ONLY=`, `SHOT=1` for contact sheets; in the full suite).
Rebuild and republish it after changing models, attacks, abilities or bosses: read the live page (~90 KB, Artifact `read`
with no `path`), then publish `dist/viewer/index.html` with `files: {"game.js": "dist/viewer/game.js"}` and `url` = the URL above.
