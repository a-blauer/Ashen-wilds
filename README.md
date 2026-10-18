# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG with hatchable companions, six portal zones, Sovereign bosses, wave trials, a buildable stronghold and online co-op.
Published as a claude.ai artifact: https://claude.ai/artifact/2xVbSBw1i6dpRGSRQqPQoC (v88 = this commit's `dist/ashen-wilds.html`).

## Build

```bash
./build.sh            # -> dist/ashen-wilds.html, then `node --check` on the inline script
```

The build is a **patch chain**, not a bundler:

1. `src/base.html` — the original v27 game (one HTML file, all code inline).
2. `build/pV2.py` … `build/pV6.py` — run in order. Each one does exact-text replacements on the HTML (`rep(old,new)` asserts the old text occurs exactly once) and splices modules from `src/modules/` in front of the marker line `$('talBtn').onclick=openTal;`.
   - **pV2**: `b_logic.js`, `c_ui.js`, `d_css.css` (v2 systems: classes, talents, gear, families).
   - **pV3**: the big module list `a0_new` … `zz_portal`, text patches, and the world section — it cuts `src/modules/w0_world.js` on `//@@TOP`, `//@@BOSSES`, `//@@BIOMES`, `//@@MAP`, `//@@HF` markers into the base file.
   - **pV4**: `zzz_mp.js` (co-op) + main-loop hooks (`mpAct`, `mpNear`, `mpLive`).
   - **pV5**: `zzzz_more.js` (stronghold/shops, shiny & rare, companion talents), name/text cleanups, lore & bounty removal.
   - **pV6**: world size `W=920,H=568`, Duskhold layout scale (`TS=21,TK=1.5`), XP/loot balance, anti-stuck, `zzzzz_fish.js` (map + fishing), `zz7_v71.js` (zone population, atmosphere, unlockable skills, grades, Consume), `zz8_danger.js` (title screen, death screen with "Rise Again", hit flash + damage-direction arcs, low-health vignette and heartbeat; adds `dth` to `uiOpen()` so death pauses single-player), `zz9_cmpegg.js` (Companions & Eggs: one window for both, egg preview + in-window hatch scene in `#cvw`/`#cd`; the old `#inc`/`#hatch` popups stay in the HTML but are no longer shown).

   - **pV6 (v78/v79)**: `zzA_arsenal.js`, `zzB_mounts.js` and `zzC_music.js` are spliced last (see below).

## v78: Arsenal and mounts

- **Weapon types** (`zzA_arsenal.js`): `WTYPE` gains `axes, halberd, flail, claws, knives, crossbow, sling, wand, orb`. Each class has 3-4 types. A basic attack is chosen by the equipped weapon's type, not the class: `WBEH[wt]` (melee combos come from the `MW` tables run by `wMelee`; ranged types are their own functions). Types without an entry (`gs, dagger, bow, staff`) fall through to the old `swing`. Projectile side effects ride on `s.wfx` and run from a `heroHit` wrapper (`WFX`). `WDESC` is the text shown on the item. Models: `mkWpn` wrapper (`NWM` builders, `WALIAS` for reused meshes) and a `refreshGear` wrapper for dual-wield/left-hand placement.
- **100 new templates** are appended to `ITPL` from index `ITPL_V78` (=100). Never insert or reorder `ITPL`: saves store the index. New templates carry `nw:1` and an innate bonus `imp:{stat:value}` that `itStats` adds (scaled by upgrade level). Wands and orbs give magical attack and mana like staves.
- **Mounts** (`zzB_mounts.js`): the `MOUNTS` table is replaced by 10 new mounts with their own procedural models (`mkMountRig(k)`, returned through `mountModel`). Riding is `toggleMount` (V), the list is `openMounts` (H / `#mntBtn`). Mounts are only sold for gold by the Stable Master; the Stable is a `SHOPS` entry (`stable`) built at the Steward, placed at `STB` (Duskhold offset −7,−8) and shown/hidden with its colliders by `stableSync()` from `shApply`. Old-roster mounts in saves are mapped to a same-tier mount and old mount eggs are refunded (`mFix` after `loadGame`).

## v79: Music and sound

- `zzC_music.js` is a generative soundtrack built with Web Audio (no audio files). `MTH` holds one theme per place: `title` (title screen and new-hero setup), `town` (Duskhold), `z0`…`z5` (the six zones, by `regionAt`) and `boss` (an aggroed Sovereign within 45 tiles). Each theme sets key, mode, tempo, chord progression and instruments (pad, drone, harp/lute arpeggio, bells, melody, bass, drums). Pattern strings are 16 steps: `X` loud, `x` normal, `g` ghost.
- `muTick` (every 50 ms) picks the theme (`muWant`), cross-fades through `MU.xg`, and schedules notes 0.3 s ahead with `muStep`. Fighting nearby (`muFight`: an aggroed enemy within 24 tiles, or a running Wave Trial) fades in each theme's `f` drum/bass set. Death and the 7 s after a Sovereign falls are silent.
- New effects (`mSfx`): level up, coins (any gold gain), item pickup / rare pickup, enemy and elite deaths, boss victory, dodge, potion, mount, portal travel, window open/close and button ticks.
- Settings → Sound: Music volume (`SET.mus`) and Sound effects volume (`SET.sfxV`, which also drives the old `SET.sfx` on/off).
- `test/v79t.py` checks theme switching, fight intensity, volumes and death silence, and renders every theme offline to `test/out/v79_music.wav`/`.mp3`. `preview/kill-quest-music-preview.mp3` is that render.
## v83: the whole world in the low-poly style
- `zzG_0style.js` runs first: lower-segment spheres/cylinders/cones/rings and flat shading for every lit material (opt out with `userData.lpsSkip`).
- `zzG_humans.js` hero, humanoid enemies, NPCs · `zzG_beasts.js` remaining creature rigs, Sovereigns, eggs · `zzG_town.js` + `build/pG_town.py` Duskhold, Portal Court · `zzG_nature.js` + `build/pG_nature.py` terrain, trees, grass, props, camps, zone portals · `zzG_gear*.js` weapons, drops, chests, mounts · `zzG_arena.js` boss arenas, wave-trial grounds, boulders, bobber.
- `build.sh` also runs any `build/pG_*.py` patch after pV6; pV6 splices `zzG_*.js` (sorted) after `zzF`.
- Screenshot helpers: `test/tour.py` (town, court, every zone) plus the per-area scripts in `test/`.

## v81: Valheim-style low-poly creatures

- `zzD_lowpoly.js` is a shared toolkit: `lpGeo` lofts faceted, vertex-painted rings into one skinned body; `lpMat` is the flat-shaded material; `lpSpikeGeo`/`lpPart` make animated non-skinned parts (ears, wings); `lpExtras` adds variant (Ember/Frost/Golden/Shadow) and trait (Horned/Spiked/Armored/Universal) extras; `lpRig` assembles everything and `crRig` is wrapped to use it for any rig registered in `LPR`.
- Each of the 12 companion rigs has its own file `zzE_<Rig>.js` (Foxlet, Ashwolf, Boneling, Stoneshell, Mossfrog, Batwing, Skyhawk, Drakelet, Gravewyrm, Cryptspider, Gloomcap, Wispling); pV6 splices every `zzE_*.js` after the toolkit. Bodies are skinned to the rig's original `SPEC[rig].bones`, so `rigAnim` (walk, hop, fly, slither, spider, float, attack) is unchanged. Wild monsters that use these rigs get the new look too; the other monster rigs are untouched.
- `zzE_Batwing.js` also holds the shared wing builders (`lpwWing`, `lpwPair`) used by Skyhawk and Drakelet.
- Preview any species: `cd test && SP=Ashwolf,Direfang python3 lpview.py` → `out/lp_<species>_*.png` (angles, walk, attack, variants, old-vs-new, in-game). Run previews one at a time; the build and tests accept `AW_OUT`/`AW_TMP` for separate output paths.

- `zzF_combatanim.js` (spliced after the creatures) is the v81 combat-animation update published from another session (hero upper body driven by one action at a time, eased transitions); it was recovered from the live page.

## v84: world tidy-up, HUD rework, companion care

`build/pV7.py` (text patches, runs after the `pG_*` patches) splices `zzH_v84.js` and `zzH_limbs.js` last.
- **Harvest nodes** (`w0_world.js`): placed as small clusters (3–5 of one kind), about a quarter of the old count; rocks stay off the road.
- **Courtyard** (`CYD` in `w0_world.js`): walled woodland north-east of Duskhold, joined to the Portal Court by a path; trees (`#`) and rocks (`r`) regrow like any node. Walls/sign are drawn in `zzC_v79.js`; the town map (N) includes it.
- **Balance**: kill gold ×0.65, wave-trial XP ×0.525 (was ×0.75), raw meat 10%/25% (elite)/boss 2–3, companions regen 0.6%/s after 8s out of combat (`s_fix.js`), combo finishers no longer lunge forward.
- **HUD**: companions get their own bars (top-left) with a rendered head portrait (`cpic`, bones are named in `mkBones`), ⚡ empower and 🍖 feed (best food first); location box top-middle (`#locBox`); level, gold, talent points and buffs above the hotbar (`#chInfo`). The "Your team" strip and the team-up attack are gone.
- **Feeding** heals over 8s (`c.fhot`, ticked from `compRegen`).
- **Companion window**: each stat shows base + level bonus = total; Universal shows as a modifier chip.
- **Material hints**: clicking a material label in any window shows where to get it (`msrcBuild`).
- **Kindlelight**: greener, thicker fog, drifting ground mist sprites, darker by day (`kGloom`).
- **Fixes**: fishing window has a fixed size; boss shockwave/beam/pool effects draw over terrain.

## v85: recall runs, growing courtyard, readable attacks, smoother animation

`build/pV8.py` (text patches, runs after pV7) splices `zzI_v85.js`, `zzI_combat.js` and `zzI_anim.js`.
- **Numbers**: level ups restore 50% health/mana; healing potion cooldown 9s; gear upgrades cost 35% less gold.
- **Companions** (`zzI_v85.js`): magic-family companions (Spirit, Dragon) cast a bolt from 5.5 tiles (`compTick`, `compBolt`) instead of biting; **Space** (`commandAttack`, 📣 on mobile) sends the team at your target for 12s (`CMD`, via `teamFoe`).
- **Consume** eats another companion (not an egg): gain by its tier, a little more for level/evolution (`conGainC`); locked companions can't be picked.
- **Beast Trainer**: one purchase raises a companion to your level, `trainCost` ≈ 1.9 × Σ(level + 1.1) (Lv 1→20 ≈ 400).
- **Fishing** gives no gold; each catch has a chance (10–40% by rarity, ×1.5 when flawless) of a gold pouch, ring or amulet (`fishTreasure`).
- **Recall runs**: recalling (or the zone's home portal) saves the zone run (`INST`: roster with dead flags + position, saved in `x2Save`). In Duskhold, T channels you back (`RECBACK`). Entering that zone's portal asks "Restart zone instance?" (Continue / Restart / Cancel).
- **Courtyard** (`CYD` in `w0_world.js`, runtime `cySync`/`cyWalls`): a grove at the heart, then one ring per zone with 6 nodes of each of that zone's node types; rings unlock with `bossDone`, the wall moves out (`r0 9`, `+1.3` per zone, max 16.8). Courtyard nodes regrow after 10 minutes.
- **Inventory preview** re-syncs whenever equipment or class changes while the bag is open.
- **Enemy attacks** (`zzI_combat.js`): wind-up glows at the hand/mouth, travelling arrows/stones/globs/bolts with impacts, meteors for fire rain, boss projectile moves with visuals; ranged moves usable at range (min range 0), casters keep distance; companion spells only cast in range; red warnings dimmed 35%; Rime Wraith orbs spawn at the arena edge.
- **Animation** (`zzI_anim.js`): see that file's header.

## v86: Sovereign dens

The round stone arena is gone. `zzK_dens.js` strips the old arena dressing and gives each boss a `DEN[i]` hook set (`build/start/tick/ai/clear/seal`, `denBlock` for solid tiles); `build/pV9.py` splices it, then every `zzK_den<i>.js`, then `denBuildAll()`. The playable circle is still `ARENA_R` (14). During a den fight the floating 3× boss bar is hidden (the top boss bar shows health).
- **0 Argus — the Drowned Hollow** (`zzK_den0.js`, shared `d01*` helpers): eye-stalks sweep gaze cones (SEEN → MARKED → leap), root pillars block line of sight, stalks can be burst; `argusgaze` tracking beam; Phase III Lights Out + `argstalk`.
- **1 Crest Hydra — the Serpent Mere** (`zzK_den1.js`): brood necks with own health that regrow as two unless seared with Serpent-fire from a brazier; brood guard (−35% damage taken at 3+ necks); `tide` waves (stand on a stepping stone or dash).
- **2 Rime Wraith — the Frozen Sepulchre** (`zzK_den2.js`): Deep Cold meter (Chilled → Freezing → Frozen) countered by four Warmfires; Snuff (relight by standing near); Thaw (frozen statues → adds); Phase III Whiteout.
- **3 Ssith'ra — the Sunken Pit** (`zzK_den3.js`): quicksand vortex toward the sinkhole; burrow-hunt + eruption → EXPOSED (×1.6); Ram into a column → STUCK; Sandstorm with tail lashes.
- **4 The Bloated One — the Charnel Pit** (`zzK_den4.js`, shared `dq*` toolkit: hittable props, cancellable telegraphs, den scheduler, co-op relay, wall cutaway shader): spreading rot pools, swelling corpse piles → maggots, bile pustules (pop all three → reel), belch cone, Phase III Rot Tide.
- **5 Lord Vaelric — the Crimson Throne Hall** (`zzK_den5.js`): Blood Chalices heal him; bat swarm lanes; Crimson Doubles (only the real one has a shadow); Blood Moon flood with moonlight safe spots; Phase III Crimson Rite (break four obelisks or eat a hall-wide cataclysm).
- Den mechanics run on the player driving the boss and relay to co-op partners as boss moves (`kqBmv`); damage is only applied to your own hero.
- Tests: `test/v86_den<i>.py` (one at a time), `v86_den01_mp.py`, `v86_den45_mp.py`.

## v87: Cheats

Settings → Cheats (`zzL_cheats.js`, spliced by pV9 after the dens; flags saved in `SET.cheat`): **Unlock all portals** (`pUnlocked` patched in pV9 to honour `CHEAT.portals`), **Infinite money** (gold pinned at 9,999,999; turning it off restores the old amount), **God mode** (`down()` is cancelled, health never below 1), **Level up** (+1 / max level buttons); v89 adds **Unlock all shops** and **Add 100 of all resources** (`zzN_misc_cheats.js`). Tests: `test/v87_cheats.py`, `test/v89_misc.py`.

## v88: dark-fantasy UI, slot menus, living Duskhold, ability points

`build/pV10.py` splices `zzM_skills.js`, `zzM_town.js`, `zzM_menus.js`, `zzM_ui.js` (in that order) and inserts `zzM_uiicons.js` right after `<script>`; each track's text patches sit in its own `# --- <track> ---` block.
- **UI theme** (`zzM_ui.js`): `--kq-*` tokens; leather/iron panels with grain, bronze bevel frames and gilded corners (border-image, layout unchanged); Cinzel headings; themed buttons, tabs, rows, inputs, HUD (hotbar, orbs, bars, plates, banners), mobile.
- **Icons** (`zzM_uiicons.js`): 183 original SVG icons; `KQE` maps every emoji the game uses to an icon + tint (unknown → rune fallback, counted in `KQ_MISS`). DOM: `innerHTML`/`insertAdjacentHTML`/`textContent` hooks rewrite emoji to `<i class="kqi …">` masks (MutationObserver fallback); canvas `fillText`/`strokeText` draw icon bitmaps (signs, map labels).
- **Menus** (`zzM_menus.js`, wraps `rB0`/`rC0`/`rC`/shop renderers — keep it after modules that inject into `#cd` or the bag): inventory paper-doll + 48-slot bag grid with filter/sort, gear lock (`it.lock`, never sold), new marker (`it.kqn`); bag tabs 7 = Forge (upgrade), 8 = Stats; hover/tap tooltip `#kqmTip` with ▲/▼ comparison to the equipped item; every shop is a priced slot grid (original rows stay hidden in `.kqm-hold` and are clicked by the buy bar); companion window tabs Overview / Stats & Grades / Spells & Evolution / Care / Talents. Remembered tabs/sort in localStorage `kqm_menus`.
- **Town** (`zzM_town.js`): one procedural texture atlas (19 materials) mapped at world scale on every town part (pV10 renames the v83 bakers to `*_0` and tags parts by material); new `sign()` (two-sided planks, iron straps, painted Cinzel text, posts beside the board); `kdSync()` (from `shApply`) rebuilds visible upgrades: Bastion Walls 0 palisade → 1 stone footing → 2 stone wall → 3 fortified wall with towers and gatehouse; Training Grounds, Scholar's Tower, Treasury, Beast Den, Hatchery each have 3 visible stages; total level adds banners, braziers and pennants.
- **Abilities** (`zzM_skills.js`, header explains it): ability points (1 per level, `apFree()` = earned − spent, migration bonus `hero.tal.__apB`); heroes start with the class default; 17 abilities per class (4 original + 3 v71 + 10 new in `KQN`), cost `1+floor(lv/6)` AP, some need a prerequisite; 4 equip slots (`__ld`); K opens Talents | Abilities tabs; ground targeting (circle/line/wall/cone reticle, click to cast, Esc/right-click cancels, drag on touch) for 26 new abilities and the old ground skills. Old saves keep their skills and get the talent points back.
- Tests: `test/v88_ui_*.py`, `v88_menus.py`, `v88_town_*.py`, `v88_skills*.py`.

## v89: gear

`build/pN_gear.py` (makes `icoOf` reassignable) · `src/modules/zzN_gear.js` · `src/modules/zzN_gear_icons.js`.
- **Vampire collar** (`zzN_gear.js`): `dkHighCollar` is replaced by a high, stiff standing collar — two mirrored curved panels (`v89CollarGeo`) rise from the shoulders behind the neck, wrap both sides, flare at the top and stay open at the front; red inner face, near-black outer face, edge trim (gold on Lord Vaelric and the Blood Magister) and ribs. On the chest bone, clear of head and hair. Used by Vampire Thrall, Blood Magister, Blood Knight and Lord Vaelric (and his Crimson Doubles).
- **Item icons** (`zzN_gear_icons.js`): `icoOf(it)` returns a picture of the actual item, rendered from its 3D model on the companion-portrait renderer (`CPIC.r`, no new WebGL context): 3/4 view, three-point light, orthographic fit (centred), rarity-tinted vignette and frame, blob URL cached per template + rarity (LRU `V89I.max`=400), geometry disposed after each render. Lazy: the first call returns the old emoji in a `[data-kqg]` placeholder and queues the render (`v89Pump`, a few per frame); placeholders are swapped in place. No WebGL → old emoji. Covers bag, paper doll, forge, every shop grid/buy bar, tooltips, loot popup, co-op trade.
- **Models**: weapons/shields = `lgWpnKit` tinted by tier material (`v89WCol`, `v89Tint`) and rarity; helms, chests, boots, amulets, rings = `v89ArmorKit` (shape by armour type and tier, tier colours, own accent per v78 set, gem colour from the item's innate bonus). The hero and co-op partners hold the same weapon/shield model (`mkWpn` is swapped inside `refreshGear`), and gear loot on the ground uses it too (`lgDropModel`).
- Tests/previews: `test/v89_gear.py` (icons in bag/doll/shop/tooltip/popup, held model, cache cap, fallback, collar halves), `v89_iconsheet.py` (every template → `v89_icons_all.png`), `v89_collar_view.py` (`KEYS=vamp,vlord`: front/back/sides/3-4 + walk/attack/slam/head-turn poses).
## v89: misc

Modules `src/modules/zzN_misc_*.js` (spliced by pV11); test `test/v89_misc.py` (screenshots `out/v89_*.png`).
- **Floating lantern** (`zzN_misc_lantern.js`): the v71 belt lantern (`LANT`) is taken off the hero and kept hidden; its visibility flag (lantern zones, not in dungeons/realm) now shows `FLAN`, an enchanted lantern hovering over the hero's left shoulder, a little behind (`FLAN_OFF`). A damped spring (`flanStep`) makes it lag, sway and bob as you move, turn, dash or ride (raised by the saddle height); it snaps on jumps over 9 tiles (teleport, recall, portals). Halo sprite + sparkle motes; the hero light `torch` is moved onto it with the same colour, intensity and distance. Co-op heroes (`MP.rh`) get one too in lantern zones (`FLANR`, glow only).
- **Citadel minimap** (`zzN_misc_minimap.js`): every zone's ground is rimmed with trees/rock tiles, which the minimap image `mmB` draws as the dark/light outline of the road, branches, camps and arena. The Citadel's rim is void (floating castle) and void is baked in the ground colour, so its minimap had no outline. `mmRimPaint()` paints a two-tone rim onto `mmB` wherever void touches walkable ground inside a zone (world map too, it draws `mmB`); tiles are unchanged.
- **Cheats** (`zzN_misc_cheats.js`): **Unlock all shops** (`cheatShops`: `SH.shop[k]=1` for every `SHOPS` entry → `shApply()` → save, like the Steward without the cost); **Add 100 of all resources** (`cheatRes`/`cheatResKeys`: `RES`, family and upgrade materials, every material a shop/upgrade/recipe uses, and supplies of kind ingredient/crop (seeds become crops anyway); not gold, gear, runes, food, potions, eggs or companions).
## v89: bossfx

`src/modules/zzN_bossfx.js` (spliced by pV11):
- **Sub-targets**: Hydra brood necks, Argus eye-stalks and Wailing Orbs get inert proxy enemies in `enemies` (`e.bfx`, built on the den4 `dprop` hooks, synced every frame from `arenaTick`). Damage on a proxy (`hurt` wrapper) is handed to `hyHitNeck` / `arHitStalk` (sever/sear/regrow, open-eye bonus, eye burst) — the den hit paths (`DEN[i].hitA`, `d01Shots`) use the proxy too, so nothing is hit twice. Proxies are never synced to co-op peers (`mpElig`).
- **Targeting in a den fight**: Tab cycles boss + sub-targets + adds nearest first; left click / tap picks the enemy under the pointer (`bfxPick`); a non-boss target shows the target frame below the boss bar (`body.bfxT`) and a red chevron over it. Ranged weapons aim at the target up to 24 tiles (`aimDir`) and launched shots home onto it (`launch`/`homeShot` wrappers).
- **Orbs**: any hit (hero, shot, skill, companion) shatters an orb; an orb that drifts within 1.7 of a lit Warmfire dissolves in steam (snuffed fires don't). Orbs are per-player copies in co-op, so breaking one is local. New sounds `sfx('shatter')`, `sfx('hiss')`.
- **Den cutaway**: dens 0–3 get `bfxCutMat` (dens 4–5 already use `dqCut`): scenery above the floor dithers away along the camera→hero line of sight, and the wall arc on the camera's side when the camera is beyond the wall.
- Tests: `test/v89_bossfx.py`; screenshots of every den edge: `test/v89_bossfx_view.py` (`DENS=`, `CFG=`).
## v89: sands

Ssith'ra (den 3) no longer flails. `src/modules/zzN_sands.js` drives the Centipede rig on its own (`ssrRig`; `rigAnim` skips the old slither code and the generic attack overlay for it). Old problems: the slither wave put up to ±0.3 rad on every chained body bone (the swings added up, the pelvis swung the whole body, the front half's wave ran toward the head); the Sovereign attack overlay added tail lift with `+=` every frame and nothing reset it (the tail curled up more and more); every hit pitched the whole 8-tile body 0.45 rad; the instant AI turn spun the body around its middle.
- **Body**: follow-the-leader. The head eases toward the facing (heavy spring, speed-capped), each segment eases toward the heading of the one in front at the speed the body travels, bends are limited, and the body turns about the model origin (the pelvis bone is moved to match). On top: a travelling wave head → tail (0 at the head, largest at the tail, speed matched to ground speed).
- **Poses** (rear, head pitch, jaw, tail lift, curl, crouch, dive tilt) ease through critically damped springs. Moves are read by wrapping `BMV` (so co-op partners see them too): tail sweep coils, then whips through exactly at the telegraph's end (`.75*en`); spit rears and thrusts on the cast flash; mines rear and slam; vortex/sandstorm rear and roar; ram coils during the wind-up, drives low, shakes its head when it misses; it dives head-first, bursts up from the sand and lies slack when EXPOSED, tugs at the rubble when STUCK. A hit is a small head recoil.
- **Death**: it curls and rolls over, then sinks into the sand. `build/pN_sands.py` holds the corpse 1.5 s before it shrinks (only for this model) and drops the exposed roll shiver for it.
- Test: `test/v89_sands.py` takes frame sheets from the side and from above for idle, move, turn, every attack, stuck and death (`out/v89s_<tag>_<state>.jpg`; `SRC=<other build> TAG=before` for a comparison). It also prints per-frame bone rotation deltas.
## v89: loot

`src/modules/zzN_loot.js` + `build/pN_loot.py` (two small `rep()` patches in `gFinish`).
- **Secrets**: walk up to a cracked boulder → `F · Uncover the secret` (keyboard F, the prompt pill or the mobile F button all call `interact()`); `lnUncover` plays a short shake/glow, then the old `breakBoulder` makes one hidden-cache chest. Attacks still crack boulders. Each player has their own secrets/chests (nothing is relayed in co-op).
- **Treasure maps**: a map belongs to one zone (`m.r`, plus `m.id`); `giveMap` picks the ✕ with `tmPick`/`tmOk`: a tile reachable from the zone entrance (`lnReach` flood fill over `!solid` tiles, cached per zone, sized from `PMAP`/`PMW` at runtime), away from the den, wave arena, camps, secrets and the entrance. Old bug: maps were placed by tier (Sands/Derge swapped, Kindlelight maps could land in Duskhold) without a reachability check (e.g. inside the sealed wave arena). `x2Load` migrates old maps (`tmMigrate`). Maps show in the bag (Gear grid and Supplies tab, tooltip `tm:<id>`, can't be sold) until dug up; red ✕ on the minimap (edge arrow when off-view), on the zone map (N) and on the ground; other zones' map windows say which zone your maps are for.
- **Gathering nodes**: every node kind has its own instanced model (`LNM`): stone, iron vein (`lnV`: ~30% of plain rocks; always gives iron ore, plain stone rarely), crystal, fiber grass, berry bush (~40% of bushes; always gives berries), flowers, glow caps, bones. `lnSwapNodes` replaces the old prop instances at load with the same tiles/scale, re-points `NODE` (depletion/regrowth unchanged) and adds the meshes to the existing chunks. The F prompt names the material (`Mine Iron Ore`, `Pick Berries & Fiber`, …).
- Test: `test/v89_loot.py` (`ONLY=nodes|secret|maps`), screenshots `out/v89_*.png` (node lineup: `v89_nodes_lineup.png`).
## v89: dens

Track files: `build/pN_dens.py`, `src/modules/zzN_dens.js`, `zzN_dens_sign.js`, `zzN_dens_tele.js`. Test: `test/v89_dens.py` (`DL=0,3` picks dens, `PART=scale,tele,sign`).
- **35% bigger dens**: `DK=1.35` (width) and `DKY=1.15` (height) are defined at the top of the script. `ARENA_R` is `14*DK`; the map clearing, flattened ground, keep-clear radii for camps/roster/dungeons and the den's distance from the zone edge (36) scale with it (pN_dens.py). The den files still build at the old size; `denScaleAll()` then maps every den mesh vertex (x/z × DK about the centre, height above ground × DKY, re-draped on the terrain), moves placed objects, scales centred ones (seals, curtains, sinkhole, blood flood), moves every stored mechanic position (pillars, pools, stones, braziers, neck slots, Warmfires, statues, columns, vats, piles, pedestals, fountains, throne via `D5.L`) and rebuilds the solid tiles as the scaled image of the old footprint (`DENS.img`; runtime `denBlock/denUnblock` of a den object covers its whole new footprint). Runtime radii inside den code (gaze length, Lights-Out ring, warm circle, sinkhole core, vortex, rot tide, bat lanes, moon spots, obelisks, cutaway radius…) are patched in pN_dens.py.
- **Red warnings**: the low-poly pass (`lpsGeo`) used to swap tele()'s draped rings and the dq toolkit's flat discs for fresh copies at the origin/standing upright ~0.1 s after they appeared; it now keeps any geometry whose box no longer matches its parameters, and warnings opt out. Warnings ignore fog, run on game time (`tele`, `kqTimed` advance with dt, like den timers), and have a crisp 90% edge that pulses in the last quarter. `DTL.live`/`DTL.log` track them for tests.
- **Warning signs**: a two-post sign (`twPostG` + `sign()`) beside the road just outside each den (`DSIGN`); F (`worldPrompt`) opens `#xw` mode `densign`: attacks with how to avoid them, weaknesses/counters (`DSTXT`), recommended level (`dsignLv`: max(boss level, road level + 1)) and the matching power (`recPower`), with your level and power in green/red.

## Conventions (read before changing code)

- **Later definitions win.** Modules override base functions by re-declaring them (`function x(){}` is hoisted) or by chaining: `{const f=x;x=function(){f.apply(this,arguments);…}}`. Prefer chaining so earlier behavior stays.
- `const`/arrow functions in the base cannot be reassigned — patch their text in a `pV*.py` with `rep()` instead.
- Module code runs at load: use `var` + function declarations for anything the main loop may touch early (avoid TDZ errors).
- **Saves**: `localStorage` key `SAVE_KEY`, snapshot built by `gameSnapshot()`; extra state rides in `x2Save()/x2Load()` (stronghold levels `sh`, shops `shp`). Companion objects (talents `c.tal`, shiny `c.shn`, rare `c.rv`) and `hero.tal` (incl. unlocked skills `sk:<name>` and loadout `__ld`) save automatically. Keep old saves loading.
- **Co-op** (`zzz_mp.js`) uses the artifact `room` capability; topics `es, ev, hit, bs, trade, chat` must stay declared as `"interact"` when publishing.

## World

- `PMAP` (in `w0_world.js`): six 260×270 regions. Each map is generated by `pmGen()` from a seed: winding road (`wp`/`path`), side branches (`br`), open fields (`fd`), 3 camps (`cl`), boss arena (`ba`), sealed wave arena (`wa`), entrance (`en`). `regionAt(x,y)` → map index or −1 (Duskhold).
- Monster level rises along the road: `zoneLv()` uses `pmProg()`.
- Zone population (`zz7_v71.js`): a fixed roster per visit (`ROST`), streamed in within 78 tiles; kills stay dead until the zone is re-entered.
- Duskhold: `TOWNS[0]`, Portal Court at `PCOURT`. Shops must be built through the Stronghold Steward (`SHOPS`, `SHU` upgrades in `zzzz_more.js`).

## Testing

Headless Playwright (Chromium) harness in `test/`:

```bash
cd test && python3 v38t.py      # save/load
python3 v32t.py                 # portal → boss kill → wave trial
python3 v57t.py                 # grades, XP, skills, consume, fusion, zone atmosphere screenshots
python3 v60t.py                 # zone roster (no respawn)
python3 v74t.py                 # Companions & Eggs window: egg select, in-window hatch, close mid-hatch
python3 v78t.py                 # every weapon type's attack, mounts + Stable, new items
python3 v79t.py                 # music themes, fight layer, volume settings; renders a music preview (NOREN=1 to skip)
python3 lpview.py               # low-poly companion preview: SP=Ashwolf,Direfang python3 lpview.py → out/lp_*.png
python3 v73t.py                 # hit/low-health/death/respawn; TITLE=1 python3 v73d.py for title → Continue
python3 v84_ui.py               # HUD bars, feeding over time, stat breakdown, material hints
python3 v84_fish.py             # fishing window size, kill gold, no finisher lunge
python3 mpt.py mpsteps.py       # two-player co-op via a fake room over BroadcastChannel
```

`play.py` skips the title screen (sets `window.AW_NOTITLE`) unless `TITLE=1`. It rewrites CDN URLs to `test/vendor/` and writes screenshots/logs to `test/out/`.
Headless runs at ~1 fps: stub `ren.render`/`POST.render` and use `requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)` for faster loops; drive state with `page.evaluate`.

## Publishing

Publish `dist/ashen-wilds.html` to the same artifact URL with capabilities
`{"room":{"topics":{"es":"interact","ev":"interact","hit":"interact","bs":"interact","trade":"interact","chat":"interact"}}}` (or omit `capabilities` on a redeploy to keep them).
