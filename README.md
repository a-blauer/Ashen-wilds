# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG with hatchable companions, six portal zones, Sovereign bosses, wave trials, a buildable stronghold and online co-op.
Published as a claude.ai artifact: https://claude.ai/artifact/2xVbSBw1i6dpRGSRQqPQoC (v86 = this commit's `dist/ashen-wilds.html`).

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
