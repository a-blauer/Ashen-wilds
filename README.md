# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG: five hero classes, hatchable companions, the floating stronghold Duskhold,
six portal zones (three field instances, a Sovereign's Den and a Wave Trial each), wave trials, mounts, fishing, crafting at town stations and online co-op.
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
| classes, skills, talents, item templates `ITPL`, creature families | `0110-v2-*` |
| enemies, damage, XP, loot (`genItem`) | `0120-v2-*`, `0410-v49-9-gear-sets*` |
| zones (`PMAP`, `pmGen`, `pmDen`), zone instances (`INSL`, `insAt`/`rgAt`, `insG`), Sovereigns (`BOSSES`) | `0045-game-data-world-zones-bosses.js`, `1680`–`1690` (v89/v97 world), `1940` (v106/v108 instances) |
| save / load (`gameSnapshot`, `loadGame`, `x2Save`); export / import save codes (v114, `KQSX`, `kqsxEncode/Decode`, Settings + title screen) | `0230-v36-save-load*`, `0450-shared-prompts*`, `2140-v114-save-export-import.js` |
| co-op (`MP`) | `0520-v58-online-co-op*` |
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
| cheats | `0980-v87-cheats*`, `1370-v89-misc*`, `1660-v90-ui*` (password) |
| loot, secrets, treasure maps, gathering nodes | `1330`–`1360` (v89 loot), `0102-gathering.js` |
| UI theme, icons, menus | `0020`–`0040` (v88 icons), `1040`–`1080` (v88 menus/theme), `1660`–`1670` (v90 ui) |
| hero / humanoid models | `0090`, `0800` (v83), `1400`–`1530` (v94), `1540`–`1550` (v95 armour), `0010` (v99 proportions), `2100`–`2130` (v114 beast races) |
| Beast races (v114: rat Warrior, cat Assassin, frog Mage, badger Paladin, weasel Ranger): rig, body rings, paws, tails (`2100`), helmets over each skull (`2110`), the five races' heads and shapes (`2120`), creator/barber/saves/co-op (`2130`) | `2100`–`2130` (v114; replaces the v112 rat file) |
| v113 instance creatures: 24 new monsters for field instances II/III (`N3`, `n3Def`, `n3Mv`, `n3Zone`, keyframe tracks `n3Hum`/`n3Cr`) | `2000-v113-instance-creatures-core.js`, one file per zone `2010`–`2050`, `2090` (camps) |
| creature models | `0080`, `0610`–`0730` (v81), `0770` (v83), `1710`–`1770` (v100 evolve), `1800` |
| animation | `0740` (v81), `0890`–`0900` (v85), `1270`–`1320` (v93 grip/idle), `1700`–`1705` (v100) |
| performance (enemy LOD, light pool, shadows, frozen matrices) | `1610`, `1620`, `1630`, `1640` (v98) |
| performance: far-scenery cull (`FC`, `fcPass`) | `1980-v111-perf-far-cull.js` |

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
- Loot and XP are tuned down on purpose (`ECON96`, `PACE`); don't raise them unless asked.
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
- **Companion abilities (v105)**: every CSP spell needs a recipe in `SPX105` (motion `m`, amplitude `a`, speed `d`, effect
  `fx`/`shot`/`zone`); `v105_abil.py` casts all of them and fails when one is missing or two share the same motion settings.
  The spell lands at the motion's strike moment (`MV105[m].h`). Bites play the motion in place of the generic lunge.
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
- **Beast races (v114, replaces the v112 rat)**: `hero.look.race` 0 human · 1 rat (Warrior) · 2 cat (Assassin) · 3 frog (Mage) · 4 badger
  (Paladin) · 5 weasel (Ranger); `BR_CLS` maps class → race and `lkFull`/`mdLookN`/`brRace` drop any other value (old saves are human or rat).
  One engine (`2100`): `brDef(id,D)` registers a race (`BRD[id]`), `brPlan` = the v99 preset `D.pre` + hunch shear + crouch, `brRig`
  retargets the hero skeleton in place (tail bones `tl0…` appended per race) whenever the race changes, so `pl` itself turns beast/human.
  While a beast is built `BR.on` scales the human torso/arm/leg/foot rings per ring (`D.TR`, `armK`, `legK`, `foot`: same ring count and
  parts, so every armour shell fits), `D.head` builds the skull loft from `D.SN` rings (+ `brEyes`, `brNose`, `brJaw`, `brWhiskers`),
  `brPaws`/`brToes` grow fingers, claws, pads and webbing (`D.paw`, `D.toes`), `brTail` lofts `D.TP`, and `brHelm` (`2110`) builds every
  helm style of the game over that skull (ear openings at `D.EAR`, eye slits at `D.EYEP`, `D.topW` keeps the frog's eye domes free;
  `muzzleZ`, `hoodZ`, `crownZ`, `hatZ`, `bandY/Z` place the pieces). `animHero` adds the crouch (not when riding) and the tail sway
  (`D.tailSway`). Look fields: `skin` = fur/hide, `eye` = eye colour; co-op look array index 8 = race. Creator/barber: a Race row
  offers Human and the class's animal (`2130`). Tests: `v114_beasts.py` (sheets per race: base, head/paws, helmets, gear; `RACE=`, `FURI=`),
  `v114_race.py` (creator → save → reload → barber, then every class casts every ability as its beast; TITLE=1).
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

## Retired systems

Removed in v103: the Garden park in the south half of the Grand Square (its trees, rocks, walls and the ring that grew with
every completed zone); the South Ward's building lots took its place. `CYD` stays as an empty record.
Removed in v102 (they had been switched off many versions earlier but still shipped): the Realm (building, farming,
crafting window, habitats, sky island), dungeons, bounty boards, world events, the team-up attack, the v34 incubator
slots, the v83 mount models (every mount is built by the v100 model track), and code that later versions replaced at load.
Kept on purpose: dungeon entrance *spots* (`DUNS`, emptied at load) still steer where camps and secrets go;
soil mounds and shallow water still give the old Realm terrain items (`ITEMS['t:…']`, shown under "Realm items" in the
bag) — removing those would change the world, so it is a design decision for later.
Everything removed is in git history: branch `claude/v100-integrate` is the last version before the cleanup.

## Build

```bash
./build.sh          # -> dist/ashen-wilds.html (BUILD_OK + size)
```

## Testing

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
TITLE=1 python3 v114_race.py # v114: creator → save → reload → barber; every class casts every ability as its beast (ABIL_ONLY=1 for just that)
python3 v114_save.py         # v114: save export / import, the split publish build boots
python3 v111_farcull.py      # v111: far-scenery cull, pixels match with it on/off at 49 spots (slow: ~10 min)
python3 v106_instances.py    # (v106 version, superseded by v108_instances.py)
python3 mpt.py mp_v106.py    # v106 co-op: host and shared monsters per instance
MODE=make SRC=<old> AW_TMP=<dir> python3 v106_oldsave.py; MODE=check OLDSAVE=<dir>/oldsave.json python3 v106_oldsave.py  # v97 save -> v106
python3 v73t.py              # hit feedback, low health, death, Rise Again   (TITLE=1 python3 v73d.py: title → Continue)
python3 v78t.py              # every weapon type's attack, Stable + mounts, items
python3 mpt.py mpsteps.py    # two-player co-op over a fake room
python3 v100_town.py         # Duskhold layout, reachability, shops, portals (portal3-5 / portal prompt checks are stale since v101)
python3 v109_kingdom_shops.py # v109: the kingdom's stages (walls, tiles, plots, outskirts), locked lots, old saves, turning buildings, every stage clear with everything built, shop upgrades (v109_shot.py: screenshots)
MODE=make SRC=<v108 build> AW_TMP=<dir> python3 v109_oldsave.py; MODE=check OLDSAVE=<dir>/oldsave109.json python3 v109_oldsave.py  # v108 kingdom save -> v109
python3 v103_kingdom.py      # lots, houses, citizens + trades/food/ranks, decorations at every tier, Steward window, evolution preview, keepers
python3 v105_abil.py         # every companion ability: cast, effect, strike moment (sheets out/v105_abil_*.png)
python3 v107_sig.py          # every zone monster's signature moves hit, debuff, no shared signatures, no lunges (SHOT=1 sheets out/v107_*.png)
python3 v107_ai.py           # the AI picks signature moves in each zone;  v107_tail.py: Gravewyrm/Venomcoil tail during abilities (viewer build)
python3 v103_poses.py        # close-ups of the working shopkeepers (KEEP=smith,cook  SIDE=.8);  v103_walk.py: a walking citizen
python3 probe.py file.js     # run one JS snippet in a started game, print the full JSON result (OUTF=out.json)
python3 v110_moves.py         # v110: every Sovereign move: contact sheets at the track keys, hits (BL=0 MV=claw,snap SHOT=0 LIT=1 CAM=play)
python3 v110_fight.py         # v110: free fights with the real AI (moves chosen, stagger, Phase II, death, wipe); avg AI ms per frame
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

`viewer/` builds `dist/kq-anim-viewer.html`: the game build plus a viewer that shows every companion (all 4 evolution
looks, basic attack and its 4 abilities), every zone monster and each of its attack moves, and every hero class and
weapon (each combo hit, full combo, class skills) on a quiet stage, using the real game code. Speed (1×–⅒×), pause,
frame step, camera presets, loop. `viewer/pre.js` runs before the game and puts performance.now / requestAnimationFrame /
setTimeout on a virtual clock (`KVCLK`); `viewer/viewer.js` runs after it. Build with `./viewer/build_viewer.sh`,
check with `cd test && python3 kv_viewer.py` (SHOT=1 for contact sheets). Rebuild and republish it after changing
models or attacks.
