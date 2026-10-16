# Kill Quest (formerly Ashen Wilds)

A single-file three.js (r128) action RPG with hatchable companions, six portal zones, Sovereign bosses, wave trials, a buildable stronghold and online co-op.
Published as a claude.ai artifact: https://claude.ai/artifact/2xVbSBw1i6dpRGSRQqPQoC (v79 = this commit's `dist/ashen-wilds.html`).

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
python3 v73t.py                 # hit/low-health/death/respawn; TITLE=1 python3 v73d.py for title → Continue
python3 mpt.py mpsteps.py       # two-player co-op via a fake room over BroadcastChannel
```

`play.py` skips the title screen (sets `window.AW_NOTITLE`) unless `TITLE=1`. It rewrites CDN URLs to `test/vendor/` and writes screenshots/logs to `test/out/`.
Headless runs at ~1 fps: stub `ren.render`/`POST.render` and use `requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)` for faster loops; drive state with `page.evaluate`.

## Publishing

Publish `dist/ashen-wilds.html` to the same artifact URL with capabilities
`{"room":{"topics":{"es":"interact","ev":"interact","hit":"interact","bs":"interact","trade":"interact","chat":"interact"}}}` (or omit `capabilities` on a redeploy to keep them).
