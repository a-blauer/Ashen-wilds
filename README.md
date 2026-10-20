# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG: five hero classes, hatchable companions, the floating stronghold Duskhold,
six portal zones each ending in a Sovereign den, wave trials, mounts, fishing, crafting at town stations and online co-op.
Published as the claude.ai artifact https://claude.ai/artifact/GZsCSNZGgULRRkVLdYHPmw (`dist/ashen-wilds.html`; v103 onward — v102 is still at CMvAWZi8x1qbMZp9SkBpGL). (The pre-v102 link was retired.)

## Layout

```
src/page.html      the page: markup, with /*@@CSS@@*/ and //@@JS@@ where the stylesheet and the game script go
src/style.css      the head stylesheet
src/js/NNNN-*.js   the game script in load order (one file per feature section; ~190 files, none over ~60 KB)
build/assemble.py  joins the three into one page
build.sh           -> dist/ashen-wilds.html, then `node --check` on the script
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
| zones (`PMAP`, `pmGen`), Sovereigns (`BOSSES`) | `0045-game-data-world-zones-bosses.js`, `1680`–`1690` (v89/v97 world) |
| save / load (`gameSnapshot`, `loadGame`, `x2Save`) | `0230-v36-save-load*`, `0450-shared-prompts*` |
| co-op (`MP`) | `0520-v58-online-co-op*` |
| Duskhold (v101: one Grand Square, Portal Road with gates I–VI), portals, `enterMap` | `0510-v56-duskhold*`, `0045` (layout numbers `TWN100_*`, `PCOURT`), `1020`–`1030` (v88 town), `1820`–`1850` (v100/v101 town) |
| stronghold shops `SHOPS` / upgrades `SHU` | `0530-v62-stronghold*` |
| v103 kingdom: building lots `LOT103` (`SH.pos`), houses + citizens `HS103`, the one Steward window, working shopkeepers `WK103` | `1860`–`1900` (v103) |
| v104 decorations (`DECO103`, the Steward's Decorations tab), citizen trades (`CZR104`: gatherer, egg collector, fisherman, hunter) | `1910-v104-decorations.js`, `1870` (roles), `1880` (menu) |
| v105 companion abilities: one motion + effect per spell (`SPX105`, motions `MV105`, effect toolkit `fx*`) | `1930-v105-companion-ability-moves.js` |
| v105 flail: wide 3-hit sweeps (baked `flail0..2`) | `1920-v105-flail-wide-swings.js`, `test/v100_anim_moves.js` |
| v103 evolution preview (now → next stage in the Spells & Evolution tab) | `1890-v103-evolve-preview.js` |
| zone roster, atmosphere, grades | `0550-v71-*` |
| companions & eggs window, fusion window | `0570-v74-*`, `1780-v100-fusemenu*` |
| weapon types / mounts / Stable | `0580-v78-*`, `0590-v78-*`, `0790-v83-*` (gaits, specs), `1790`/`1810` (v100 mount models) |
| Sovereign dens | `0910`–`0970` (v86 dens 0–5), `1100` (boss fx), `1180`–`1200` (v89 dens), `1650` (Ssith'ra) |
| abilities (points, ranks, effects) | `0990`–`1000` (v88), `1090` (v90 ranks), `1230`–`1240` (v91 fx) |
| cheats | `0980-v87-cheats*`, `1370-v89-misc*`, `1660-v90-ui*` (password) |
| loot, secrets, treasure maps, gathering nodes | `1330`–`1360` (v89 loot), `0102-gathering.js` |
| UI theme, icons, menus | `0020`–`0040` (v88 icons), `1040`–`1080` (v88 menus/theme), `1660`–`1670` (v90 ui) |
| hero / humanoid models | `0090`, `0800` (v83), `1400`–`1530` (v94), `1540`–`1550` (v95 armour), `0010` (v99 proportions) |
| creature models | `0080`, `0610`–`0730` (v81), `0770` (v83), `1710`–`1770` (v100 evolve), `1800` |
| animation | `0740` (v81), `0890`–`0900` (v85), `1270`–`1320` (v93 grip/idle), `1700`–`1705` (v100) |
| performance (enemy LOD, light pool, shadows, frozen matrices) | `1610`, `1620`, `1630`, `1640` (v98) |

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
- Design: dark fantasy, no cutesy models. Hatchable creatures are "companions" (never "Eudemon").
  Grade C is the norm (S and F ≈2% each). Shops in Duskhold (except the Trading Post) are built at the Stronghold Steward.
- **Kingdom lots (v103)**: every shop, upgrade structure (not Bastion Walls) and house stands on one of the 31 lots in
  `LOT103`; the player picks the lot when building and can move it for free. `SH.pos[key]` = lot id (key: shop key,
  `u:`+upgrade, `h:`+house index), saved as `x2.kpos`. Anything built without a lot (old saves, cheats) goes to its old
  spot (`DEF103`). Shop footprints are solid map tiles marked through `lotMark103` (counted, so they can overlap safely);
  fields older code reads (`T.mv`, `T.st2`, `STB`, `T.vsp`) follow the lots in `lotSpots103`. Keep the lot grid clear of new
  fixed scenery (a collider inside a lot would block a building's door spot: `v103_kingdom.py` checks every door).
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
python3 v60t.py              # zone roster (no respawn)
python3 v73t.py              # hit feedback, low health, death, Rise Again   (TITLE=1 python3 v73d.py: title → Continue)
python3 v78t.py              # every weapon type's attack, Stable + mounts, items
python3 mpt.py mpsteps.py    # two-player co-op over a fake room
python3 v100_town.py         # Duskhold layout, reachability, shops, portals (portal3-5 / portal prompt checks are stale since v101)
python3 v103_kingdom.py      # lots, houses, citizens + trades/food/ranks, decorations at every tier, Steward window, evolution preview, keepers
python3 v105_abil.py         # every companion ability: cast, effect, strike moment (sheets out/v105_abil_*.png)
python3 v103_poses.py        # close-ups of the working shopkeepers (KEEP=smith,cook  SIDE=.8);  v103_walk.py: a walking citizen
python3 probe.py file.js     # run one JS snippet in a started game, print the full JSON result (OUTF=out.json)
python3 v86_den0.py … v86_den5.py, v89_dens.py   # every Sovereign den
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

Publish `dist/ashen-wilds.html` to the artifact URL above (pass it as `url`). Omitting `capabilities` on a redeploy keeps the co-op room;
if they must be re-declared: `{"room":{"topics":{"es":"interact","ev":"interact","hit":"interact","bs":"interact","trade":"interact","chat":"interact"}}}`.

## Animation viewer (separate artifact)

`viewer/` builds `dist/kq-anim-viewer.html`: the game build plus a viewer that shows every companion (all 4 evolution
looks, basic attack and its 4 abilities), every zone monster and each of its attack moves, and every hero class and
weapon (each combo hit, full combo, class skills) on a quiet stage, using the real game code. Speed (1×–⅒×), pause,
frame step, camera presets, loop. `viewer/pre.js` runs before the game and puts performance.now / requestAnimationFrame /
setTimeout on a virtual clock (`KVCLK`); `viewer/viewer.js` runs after it. Build with `./viewer/build_viewer.sh`,
check with `cd test && python3 kv_viewer.py` (SHOT=1 for contact sheets). Rebuild and republish it after changing
models or attacks.
