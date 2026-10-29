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
| v148 owner's list: gathering tools aimed (`SK148`), camp clears (`CAMP148`: 5-min return, XP, chest), aimed spells during mouse-look, building footprints only where the model stands (`fp148Filter`), Duskhold outskirts one-time harvest (`OUT148`, saved `x2.out148`), Cheddar's quest board (`CHQ148`, `CHQD148`), decorations (`DC148_COST`, six new); v148.1 board tiers and companion and boss splash (`SPL148`, `BSPL148`); v148.2 co-op revive (`RV148`) and boss credit (`BC148`) | `3070`–`3079`, `3085`–`3086` (edits in `0104`, `0108`, `1010`, `1270`, `0250`, `2350`, `3040`) |
| v149 Ssith'ra's body: the chain layout (`ssr149Post`: path = last frame's body, bend limits `SSR149.th0`/`th`, self-avoidance, smooth rearing curve, the dive pours down the hole), the flesh core tube (`ssr149Core`) and the remodelled segment armour (`ssr149Body`) | `3078-v149-ssithra-body.js` |
| v150 owner's co-op list: partners' effects clean up and mounts show (`V150`, `3090`), monsters go for partners' companions (`AG150`, `3091`), shared progress (kills, camp clears `['cc']`, lamps `['m143']`, sigils `['m145']`, instance reach `ir`, rituals fought together `['r145']`/`['p145']`, `CP150`, `3092`), sigil rituals 50 wolves, ¼ XP / loot, stuck wolves blink (`GW150`, `3093`), the host's Duskhold for guests (`DK150`, `['ks']` / `['kd']` / `['kdo']`, `3094`), Sovereign moves start from the driver's pose (`BS150`, `3096`), Tab in boss fights, chests off the hatch, raven robes follow the legs (`FX150`, `RV150`, `3097`); bats keep only hind legs (0630, 2640); the hatchet's edge keeps one side (3070) | `3090`–`3097` |
| v151 intro cinematic for new characters (`ic151Play` after `ccBegin`; own canvas/renderer `#ic151`; the main loop waits while `IC151.on`; every shot is `ic151Frame(S,t)`; score `ic151Score`; narration is text only (`IC151.lines`; `IC151.speak` / `IC151.voiceUrl` for a voice later); v151b: an earthquake opens the ground (no hand): one intensity curve `ic151Q(t)` drives the camera shake, the trees and undergrowth swaying in their own material (`S.matT`, `S.quakeU`), birds, falling leaves and hopping pebbles (`ic151Quake`/`ic151QuakeAt`) and the plates heaving until 21.1 s (`ic151Heave`); cracks spread from the middle (`S.crk`, `S.cracks`) out of five split points `S.tip0`; the ground breaks into Voronoi pieces (`ic151Shatter`) and caves in through a small rigid-body simulation run once (`ic151PhysInit`/`ic151PhysStep`, time-sliced live; support gives way via `ic151Ropen`, walls `ic151Env`, impacts → dust `S.efx`; the big jolt `IC151G.imp`); the rat's slab hinges on the meadow lip (`ic151RatCellM`); the rat walks on a precomputed path (`ic151RatTrack`, idle keys `IC151RK`) with IK legs (`ic151RatPoseIK`; v157: each paw has its own ankle, `ic151PawLevel` keeps it flat while planted and lifts the heel at push-off — it used to follow the shin, toes up in front, tiptoe behind); floating spread out with closed eyes (`P.out`, `R.eye`); the upright rat is the game's bare rat posed from a settled base (`ic151HeroPose`); skip = button/Esc/Enter/Space; not played under automation unless `window.KQ_INTRO`); part 2 from 55.9 s in the real Duskhold scene (`ic151Dusk`, 3081): the hero walks a precomputed route (`ic151DuskInit` legs, `ic151DPos`) to the Steward → Innkeeper → Blacksmith → Merchant (name cards) → Cheddar at his quest board (the game's own Cheddar, `CHQ148.P.ch`, posed and put back), out of the south gate, then the voice lines over portal cuts (only a faint Sovereign face `IC151.SF`, no titles: v151e); shot list and timings in `IC151D`; cameras `ic151DCam`; name tags over the town folk hidden (`ic151DTags`); subtitles break only between words; the game starts on the Portal Road (40, 349.4). v151c, the flow (`3082`): a new game (New Game / Begin on the title, the layout picker without a save, New game in the save prompt) plays part one (`ic151Play(null,'p1')`, to `IC151.p1End`, then the light fades into the hero creator); "Begin your journey" plays part two (`'p2'`, `ic151BuildP2`: no woodland, from `IC151.cut`) with the hero and companion just made; `'all'` = the whole film (tests, video); Skip: part one → the creator, part two → the game; a greeted shopkeeper stops working (`_wk.ic151H`, wraps `wkAnim103`: the smith stops hammering). **Video: rendered on GitHub** (`tools/render.sh <changed ranges>|all`, `.github/workflows/render.yml`: 5 s pieces drawn at the same time, the rest from the last render in the Actions cache; `IC151.noDraw` lets a piece replay the town up to its start) | `3080-v151-intro-cinematic.js`, `3081-v151-intro-duskhold.js`, `3082-v151-intro-flow.js`; test/preview video: `v151_intro.py` (`VIDEO=1` renders an MP4 with sound; `F0`/`F1` frame range, `NOENC`), `v151_intro_live.py`; `tools/render.sh`, `tools/render_plan.py`, `tools/render_join.py` |
| v160 The lantern line (owner): Kindlelight I's lampposts and the Ripper's route follow a smoothed copy of the road (`mq158Line`: zigzags cut inside open ground, clear of ponds and bushes, corners rounded) instead of the raw zigzag path: 34 lamps at least 7 tiles apart, none crowded, the ride ~23% shorter (~83 s); v151–v159 saves refunded a bulb per lit lamp | `3020`, `3023` |
| v162 co-op fixes found by steadier tests: no health regrows behind the co-op death screen (a `heroTick` wrapper keeps it at 0 while `AWD.dead`; partners took a dead hero at 1% for one still standing, so a downed partner never died and Abeksi's snakes could see the body); a fallen Ascent rider waits up to ~20 s for the winner to reach III (`cs155Downed`, 28 tries) | `3085-v148-coop-revive.js`, `3180-v155-coop-levels.js` |
| v167 Hilltop Ascent obstacles (owner): fallen logs (jump them, or ride round a short one), rolling boulders (off the wall, across the trail, off the lip), narrow ledges (keep to the wall or fall), seeded in `ch167Obs` (3160, which also carves the narrows); collision true to the drawn shape (`ch167HitLog` cylinder, `ch167HitRock` sphere, `ch167Edge` the broken edge) against the mount's box (`CH167.ml/mw/mh`); a crash slows (×`CH167.crashK` for `CH167.crashT` s, no health); Skarrith smashes logs and boulders; venom keeps off them (`ch167Keep`); the mount 35% faster (`CH153V.spd` 11.07, Skarrith scaled); Skarrith's mouth corners joined (`ch167Cheek`, 3251) and its jaw / head tilt eased (no snaps at the reveal); the Pilgrim's Stair peaks moved off the trail (3260); Space jumps in the chase (0860's companion command steps aside, `cmd167Free`). Tests `v167_obstacles.py`, `v153_ascent.py` | `3330-v167-ascent-obstacles.js` (hooks in `3160`, `3250`, `3251`, `3260`, `0860`) |
| v168 drill repairs rework (owner): the Mountain Drill's mini-game windows are gone; each box fix is timed work at the box with its own tool and motion (thaw 3 s torch, rewire 6 s spanner, rebuild 10 s hammer: `dr170Open`, `dr170WTick`, `DR170W`, `DR170_T`, `dr170Aim`, ring `#dr170r`), and the drill bores ×0.4 slower per box offline (`dr170Rate`, HUD in words) | `3170` (`0860` `cmd167Free` no longer checks the drill) |
| v166 HUD tidy-up (owner): the target frame has one owner on phones (`bfxTgtCls` only sets the `bfxT` class; the den spot under the boss bar is in `ui161Lay` / a `ui161Desk` wrapper), `ui161Z` snaps to the stylesheet zoom (`ui166CssZoom`) so 0.4 s layouts stop nudging frames; the level / gold plate `#chInfo` is hidden (gold in the Inventory title `#gold166`, buffs moved under the companion panel `#bf166`), unspent points are a badge on ☰ (`#pt166`, counts on Character / Abilities, `pt166Sync`); the top Co-op pill `#mpBtnH` is hidden; touch buttons fade and let taps through while ☰ is open (`body.sm166`). Test `v166_hud.py` (`v166_flip.js` lists any HUD style / class / box that keeps flipping) | `3320-v166-hud-tidy.js` |
| v167 combat fixes (owner): monsters start a melee move once you are inside its red warning (rmax raised to the hit reach less `V167.mg` for monster-centred cones / circles, `V167.raised`; melee monsters wait at that range, `kqPref` wrapper); no backwards unwinding after a spin (the body turn is kept within one turn; the Sand Elemental's Sandstorm unwound ~4 turns, Death Roll / Shell Spin / Crimson Whirl 2 turns: `n3Body` wrapper) and a smooth turn to the target for `V167.turnT` s after an attack; monsters move 30% faster (one knob `ESPD167.k`: the 0104 main loop's chase / back-off / circle / wander, and the bosses' footwork `ai.walk` / `ai.run`; not attack moves, knock-backs, projectiles, hero or companions); after a perfect dodge you can attack at once (`atkCd` cleared, and it counts real time during the slow motion, 0104). Test `v167_combat.py` | `3340-v167-combat-fixes.js` (edits in `0104`) |
| v168 quest set pieces in detail (owner: "the angel graves look way too low detail ... bring everything up to par and make them look correct physically"): the detail kit (`dt168*`: turned / bevelled / extruded / swept shapes, feathered wings, skulls, weathering baked into vertex colours, `dt168Up` refining an old builder's primitives); the Dirge's weeping angel, 14 graves, open graves and stair, the scattered mourning angel (`d_angel`), the quay as a raised canal (the raft floated on dry ground), prism plinths, the Reliquary, the Sanctum's knights and sarcophagus; the Sands court (papyrus columns, rift horns, the Warden's kin), urns, temple; Abeksi's cleft, the hydra door's wind stones, Burningeye's bench and caches; test `v168_ground.py`, pictures `v168_detail_look.py` | `3345-v168-detail-kit.js` (edits in `1680`, `3155`, `3160`, `3170`, `3260`, `327x`–`329x`, `3301`, `3312`–`3317`) |
| v169 see-through walls (owner: "I'd rather everything just become semi transparent, I don't like the vignette with the speckled look"; a house's inside black, not its floors; outside the map black): one rule and one look for everything between the camera and the hero (scenery, terrain, plants, den walls). Each material computes a ghost weight (`gh169W`: a smooth window round the hero `GH169.R`, anything within `GH169.N` of the camera, never below the hero's knees); the normal draw leaves those pixels out (`GH169.GATE`) and `POST.after` (3350) draws them again as glass: a depth pass (nearest surface only), then colour at `GH169.a` opacity over what is behind, which is darkened to `GH169.k` unless it writes stencil 1 (`gh169Clear`: characters, ground, plants, water, sky). Meshes join the passes on layer `GH169L` (`gh169Cand` from `Mesh.onBeforeRender`; a mesh wholly below its material's floor rule `gh169Fl`, such as grass, is skipped). Outside the instance's rectangle the ground is black (`uGhV`; from one tile inside when the camera is out past the edge) over a black floor (`GH169C.vo`); with the camera out of the map (inside the rock or past the edge) the view fades to black but for the window (`gh169Away`, in the composite); the water stops at the edge; scenery out there is left alone (Abeksi's north wall stands past its rectangle). The intro keeps the old look (`M157` 0). Tests `v169_seethrough.py`, pictures `v169_ghost_look.py` | `0061-v169-see-through-core.js`, `3350-v169-see-through.js`, `0060`, `2420`, `3190`, `0960`, `1100` |
| v165 The Dirge main quest (owner): I the Keeper's grave (14 graves, the weeping angel's clue, digging) and the Hidden Sanctum (`sanctum`, g 33: pendulums, spike bands, plate + fire walk gate run, crumbling chasm, closing walls + knights, ossuary, flooded stair); II the raft down the Black Channel (`channel`, g 34: drowned dead tear the planks off, the raft breaks under `RT165.min`); III the five prisms and the Reliquary (one charge at a time, the dead rise round the carrier, five runes open the Den); co-op shared | `3310`–`3318` (hooks in `3150`, `1680`, `3242`) |
| v164 Cheddar's board: 8 quests per zone and an exclusive skin per finished zone (`SKN164`, shader skins for the hero's fur, companions and the ridden mount) | `3235-v164-cheddar-skins.js` |
| v164 owner's list: Abeksi fights (tougher, faster, pathing, sight hunting, bell elites `AB164`) and the city gate (`ab164GateBuild`); hero and companion XP −25% (`HXP164`, `hxp164` in 0120: kills, quests, camp clears) | `3231-v164-abeksi-hunt.js`, `0120` |
| v163 element buildup: element hits fill a meter per enemy (`e.eb`, `EB163.F`), a full meter primes it (`e.el`, 6 s, ground ring), a different element sets off the reaction (`EB163.R`, `eb163React`); health bar border tint / primed glow, shimmer and icon (`eb163Vis`, `eb163Frame` from a `loop` wrapper), boss bar (`eb163Boss`, `#eb163bi`); replaces 0320's `applyEl` and 2300's wrapper | `3210-v163-element-buildup.js` |
| v163 owner's list: page stylesheet moved to `<head>` first thing (`0001`: on claude.ai the page is wrapped and its `<head>` lands in the outer `<body>`, after every runtime `<style>`); attribute Reset under the list (`#ch163Rs`); desktop quest trackers stacked by the layout (`ui163TrkDesk`, `ui161Desk` replaced, `chqTrkPos132`/`mq143TrkPos`/`sp152TrkPos` → `ui161Lay`); one title card at a time (`TC163`); attacks aim when they land (`aim163`, `SW163`); Sovereign signatures 60 s apart, Argus' eyes 10 m out with twice the time (`SIG163`); weapons never spin (`EDGE163`: planned edge roll `edge163Plan`, capped turn `edge163Step`, fight stance `edge163Fight`) | `0001-v163-style-order.js`, `3220-v163-owner-fixes.js` |
| v164 Hilltop Ascent rework (owner): no obstacles, strikes or hit points; broken trail to jump (`ch153Course().gaps`, carved in `ch153Terrain`, dressed by `ch164Abyss`), venom that slows (`ch153SpitPlan`/`ch153SpitSpawn`, `ch164Pool`, `ch164Slow`), Skarrith at its own speed (`ch164SnakeV`) with the chomp, the distance meter; Skarrith rebuilt in detail (`ch153Snake`, `ch153SnakeHead`, `ch153SnakeLay`, `ch164HeadAnim`); pictures `test/v164_look.py` | `3250-v164-ascent-chase.js`, `3251-v164-skarrith-model.js` (edits in `3160`–`3162`, `3192`, `3180`) |
| v151 The Lantern Road rework (owner): the outpost by Kindlelight I's entrance (`mq151Cfg().A` 36 steps down the road), lampposts along the whole road ~7 apart (`mq151Cfg().gap`, 47) at 1 glowbulb each (`MQ143.per`), every kill drops one until enough are carried (`MQ143.drop` 1), the Ripper rolls at 3 tiles/s, pre-v151 saves refunded; the entrance camp moves to the nearest open side field (`mq151MoveCamp`, called from 0045 after every seeded map step) | `3020`, `3023` (hook in `0045`) |
| v151 Armored trait look: a riveted war harness (leather blanket, overlapping iron spine plates, rivets, flank flaps, `lpArmor151`) replaces the grey back domes that read as stones; picture sheet `test/v151_armor_look.py` | `0610` (`lpExtras`) |
| v152–v155 Hillside Crest main quest (v155: played together in co-op, `3180`): special instances (`SP152`, `3150`), Abeksi city stealth level (`3151`–`3155`), the Hilltop Ascent chase (`3160`–`3162`), the Gate of the Hydra puzzle (`HD154`, `3170`) | `3150`–`3170` (hooks in `0045`) |
| v159 intro preview page (owner, Oct 27 2026): a separate private page to play and scrub the intro on your own computer instead of waiting for a video render. `tools/build_preview.sh` → `dist/preview/` (index.html + game.js, not committed; published as its own private artifact https://claude.ai/artifact/BFERsVoeLZ7rEFSKtgxHWE, never over the game: republish `dist/preview/index.html` with files `{"game.js": "dist/preview/game.js"}` to that URL after intro changes). It is the game build with `window.KQ_PREVIEW` set (`tools/preview_page.py`); `3083` then makes a hero (class and companion picked in its panel, kept in localStorage `kqpv`, the page reloads), never saves, builds the film with `ic151Cap` and draws `ic151Seek(t)`. Timeline with every shot (`kqpvShots`: part one's times written there, the town's from `IC151D`), play/pause, frame and second steps, speed, loop shot, sound (the score rendered once offline), copy time. A jump into the town replays it from the cut without drawing (`kqpvGo(t,true)`, companions reset to where they stood), so the frame matches the video; it stops just before the hand-back (`IC151.dEnd`). Test `v159_preview.py`. |
| detail test page (owner, Oct 29 2026): "how much more detailed can the game be and still run smoothly?" A separate private page, never the game: `tools/build_detail.sh` → `dist/detail/` (index.html + game.js, not committed) and `dist/detail.html`; published as its own private artifact https://claude.ai/artifact/7DZbMEn1bk594UYwCnWeUw (republish `dist/detail/index.html` with files `{"game.js": "dist/detail/game.js"}` to that URL, never over the game). `tools/detail_page.py` puts `tools/detail/pre.js` in front of the game script and `tools/detail/post.js` after it, in the same script (pre.js must replace `lpsObj` before 0750 runs); the game build itself never contains them. Detail 1× / 2× / 4× (localStorage `kqd` {m, cls}, page reloads): 1× is the game as it is; 2× / 4× split every triangle of every drawn mesh in two / four (`kdRefine`: welded corners, flat normals smoothed within a 55° crease, per-face colours blended in the same groups, split points on smooth edges moved onto the PN curve, bone weights merged, groups kept) and turn the low-poly look off (no flat shading via a `Material.prototype.flatShading` accessor, the v83 style pass skipped, the shared round props `G_SPH/G_CYL/G_CONE` at full segments, the ground shader blended instead of painted per triangle). The game's geometry is never changed: each renderer (`THREE.WebGLRenderer` wrapped at creation, r128 makes `render` per instance) swaps in the cached refined copy of every visible mesh's geometry for the draw and gives it back after (`kdSwap`); geometry the game rewrites twice within 3 s is left as it is. The test (`kdtBoot`): a level-30 hero (class picker) in rare+ gear, six abilities, two final-evolution companions, Kindlelight I, the detailed copies built behind a loading bar (`kdtWarm`), quality auto-drop off (`QL.auto`), can't-die, never saves. Panel: fps, slowest frame, triangles and draw calls per frame (`ren.info`), game work per frame (`loop` time), GPU name; Big fight (+20 aggro monsters), Measure 20 s (table in localStorage `kqdR`), Copy results. Test `kqd_detail.py` (MODES=1,2,4, SHOT=1). |
| Published together (Oct 26 2026): the v151 intro, the Burningeye Summit main quest (v151) and the Hillside Crest main quest (v152–v155). The co-op Ascent restart issue known at that publish (when every rider fell, one restarted and the other could stay spectating) is fixed in v156 (numbered tries, `CS155.rd`). Full suite otherwise green (`v119_abprev.py` and `v150_coop.py` failed on GitHub once each and pass on a re-run / locally). | `3180-v155-coop-levels.js` |
| loot, secrets, treasure maps, gathering nodes | `1330`–`1360` (v89 loot), `0102-gathering.js` |
| UI theme, icons, menus | `0020`–`0040` (v88 icons), `1040`–`1080` (v88 menus/theme), `1660`–`1670` (v90 ui) |
| hero / humanoid models | `0090`, `0800` (v83), `1400`–`1530` (v94), `1540`–`1550` (v95 armour), `0010` (v99 proportions), `2100`–`2130` (v114 beast races) |
| Beast races (v114: rat Warrior, cat Assassin, frog Mage (the raven since v134), badger Paladin, weasel Ranger): rig, body rings, paws, tails (`2100`), helmets over each skull (`2110`), the five races' heads and shapes (`2120`), creator/barber/saves/co-op (`2130`) | `2100`–`2130` (v114; replaces the v112 rat file) |
| v113 instance creatures: 24 new monsters for field instances II/III (`N3`, `n3Def`, `n3Mv`, `n3Zone`, keyframe tracks `n3Hum`/`n3Cr`) | `2000-v113-instance-creatures-core.js`, one file per zone `2010`–`2050`, `2090` (camps) |
| v123 camp sites: every camp's size (`C.r`), ground shape (`cs123Plan`, `cs123Terrain` from 0045), tile paint (`cs123Map`), set pieces (`cs123Designs`), title card on entry (`cs123Card`); no signposts | `2270-v123-camp-sites.js` |
| v164 camps (owner: "much larger, more integrated, much more detail"): sizes and spots (`cs164Sites`, `cs164Rd`, moves like v151), bigger clearings (`cs164Grow` from 0045), ground and tiles (`cs123Terrain` / `cs123Map` / `cs123Setup` / `cs123Rad` replaced), recipes (`cs164Rec`), the dressing (`cs164Dress`, palettes `cs164Pal`), merge by material kind (`cs164Merge`, `CS164.M`), camp lights (`CS164.lights`), keep-outs (`cs164Keep`, `cs164Avoid`) | `3240-v164-camps-plan.js`, `3241-v164-camps-kit.js`, `3242-v164-camps-dress.js` (hooks in `0045`, `1680`, `2280`, `3040`, `3160`, `3170`) |
| v165 Searing Sands main quest (owner): I dig + Qarsul (`3270`–`3274`), II court, urns, Kheprit, the rift (`3280`–`3283`), III salt columns, Sandskimmer, yard and vista (`3290`–`3292`), the Sandstorm Run (`3300`–`3302`, record `sandrun` in 3150), co-op (`3305`); the Pilgrim's Stair trailhead (`3260`) | `3260`, `3270`–`3305` (hooks in `0045`, `1680`, `3150`) |
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
| v157 camera: nothing moves the camera on its own (the v132 tilt and the Abeksi roof tilt `ab152CamFit` are off); it rides above gentle ground only (`cam157Floor`, null behind a wall step `CAM157.step`). What stands between it and the hero is cut away: scenery (`f135Patch`, 2420) in a round window around the hero (`R157`, inner/outer radius at the hero's depth; v164: 2.3 / 5.4, twice the old 1.35 / 2.4 with a ~3× wider dithered edge), fully near the camera (`N157`) and the inside of two-sided meshes; steep terrain (caves, instance edges) in the same window (`cam157Terrain`, 3190; flat ground below the waist stays). The intro keeps the v135 tube (`M157` 0, `CAM157U` 0). Test `v157_cam.py`. v169: the cut became see-through glass (see v169) | `0104`, `2420-v135-camera-fade.js`, `3190-v157-camera-cutaway.js` |
| v161 UI size and keys (owner): every HUD group is scaled with CSS `zoom` from variables on `<html>` (`--kqHud`, `--kqBar` (shrinks to fit), `--kqMap`, `--kqTouch`, `--kqMenu`; auto fit `ui161Base` × the sliders in Settings → Interface size, saved as `SET.ui161`); anything placed by script goes through `ui161Pos` (screen px ÷ the element's zoom). Phone layout (`body.mob` + `kqP` upright / `kqL` sideways, `kqRows` two hotbar rows, `kqTight` no Power box, `kqLH` left-handed): `ui161Lay` places the minimap column, bar, joystick, touch-button arc, prompt, log, target frame and quest trackers (it replaces `v90Lay`); the hotbar's attack and dash slots are hidden on phones (dash charges show on the dash button). Keys: `0005-v161-keymap.js` runs first and rewrites `e.key` (`KB161`: actions, `kb161Build`, `kb161H`), bindings in `SET.keys` (Settings → Keyboard, swaps on conflict); hotbar / ☰ / help line show the chosen keys (`kb161Labels`). New HUD widgets: add their id to `UI161_HUD` (and `UI161_TRK` for a quest tracker). Tests `v161_keys.py`, `v161_mobile_shot.py` | `0005-v161-keymap.js`, `3200-v161-ui-scale-keybinds.js` (edit in `0180` joystick) |
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
| v151 Burningeye Summit main quest (the ice zone): I The Frozen Maw (cave mouth `gb151CaveMouth`, the cave = Burningeye's unused Wave Trial `INSL[14]` `GB151L`, Gorthrak the Glacierback: model `gb151Build` / poses `GB151P` / moves `GB151M`, Frostbite `gb151Frost`, Rimelock and the Glacier Shell (v168, were the ice pillars and the Glacial Rampage), quest `MQ151`; v168 the cave openings `gb168Cave` in `3330`); II The Frozen Gate (`mq160Plan`, caches + elite wardens, workbench, flamespitter `fs160Spitter`, the melt event `MQ160.E`, ice spiders `EN.icespider`); III The Mountain Drill (`mq170Plan`, cliff / drill / 4 control boxes, the drill event `MQ170.E`, speed `dr170Rate`, timed repairs `dr170Open` / `dr170WTick` thaw / wire / rebuild with tools and motions `DR170W` / `DR170_T` / `dr170Aim`, Frost Troll wreckers `dr170Troll`) | `3150`–`3152`, `3160`, `3170`, co-op `3180` (edit in 1680) |

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
- **See-through walls (v169, `0061`, `3350`; owner: "there are inconsistencies on when the camera passes through a solid object.
  Sometimes it does the vignette, other times it just makes the object transparent"; then "I'd rather everything just become semi
  transparent, I don't like the vignette with the speckled look", "the inside [of a house] is black instead of showing the floors, still
  transparent so we can see our character", "outside of the map black so we can't see under the map")**: before, four systems cut things
  away, each its own way (scenery: a dithered window plus anything within 3.4–5 of the camera removed whole; terrain: a window with no
  veil; plants: an older narrow tube; dens: their own tube), ~480 objects (glowing windows, plain materials) were never cut, and new
  scenery waited up to 2 s. Now every world material shares one rule (`gh169W` in 0061) and one look, drawn by real blending, never by
  dither: what stands between the camera and the hero is glass (`GH169.a` .4 opacity) in a smooth window round the hero (`GH169.R`
  2.3–5.4 at the hero's distance, the v164 size) or within `GH169.N` (1.2–3.4, a soft edge) of the camera; floors below the knees stay solid.
  Behind the glass, buildings and props are darkened to `GH169.k` (.06: a house's inside reads black); the hero, companions, monsters,
  the ground, plants, water and the sky are seen clearly (stencil 1). Plants are glass without the dark inside, and only above the hero's waist (grass stays). The inside faces of
  two-sided houses (Abeksi) are black glass. Outside the instance's rectangle the ground is black (not scenery: Abeksi's north wall stands past
  its rectangle), over a black floor far below, so the void past an edge is black; with the camera out past the edge the black starts one tile inside (`GH169.vin`), the cliff the
  ground drops off. With the camera out of the map, inside the rock (behind a wall step it stays where the player
  put it) or out past the instance's edge (owner's screenshots from Hillside Crest III: fog under the map, then the water sheet
  spanning the void as a pale veil over everything), the whole view fades to black in `GH169.fadeT` .35 s but for the round
  window round the hero (`gh169AwayTick` on the game clock, `gh169Away` places the window; drawn in the final composite, 0060
  `mComp` `ghU/ghC/ghR/ghA`, so it covers sky, water, buried boulders and characters alike), the background with it, and fades
  back when the camera returns. The water stops at the instance's edge (`gh169Water`). How it draws (3350): the normal draw skips see-through pixels; `POST.after` then draws only the meshes on layer
  `GH169L` (the rest of the scene hidden for the walk, shadows not redrawn, background not cleared): depth pass, then the colour pass
  twice with a stencil test (dark inside / clear). Any new world material that should turn to glass: compute `float ghw` at the top of
  main, add `GH169.GATE`, call `gh169Shader(sh, m, worldPosVarying)` in its `onBeforeCompile` and `gh169Flag(m)` when it is made.
  Settings to tune by eye: `GH169.a`, `GH169.k`, `GH169.R`, `GH169.N`. Tests `v169_seethrough.py` (hero visible through a cave wall,
  the void black, inside the rock black but for the window and the fade back, the renderer left as it was, stencil marks); pictures `v169_ghost_look.py` (ALT=1 adds the same view with it off).
- **Owner's list (v168, `3330`, `3151`, `3152`, `2270`)**: *Ice caves*: the Frozen Maw's mouth at the end of Burningeye I and both
  openings inside the cave (the way out, the passage at the back) are one builder, `gb168Cave` (3330): an arch-shaped passage lining
  that darkens to black with depth (a short one still does: `o.fall`), a snow floor fading into it, smooth sculpted rock round it
  (rim, buttresses, a block over the arch, the hill behind; tilted strata ledges, snow on upward faces, all in vertex colours), a
  glacier cap, an ice lip with icicles (never below head height over the way in), drifts and frost. Nothing may stand in an opening:
  rock vertices inside the passage's shape are pushed to its wall (`gb168Push`; the hill behind has those triangles cut), the cave's
  wall rocks are pushed out too (`gb168PushW`), and the zone's scenery standing where a passage runs is hidden (`gb168Clear`: a snowy
  edge boulder stood inside the passage at the back); floors are laid over rising ground (`gb168Ground`). Before: jittered `svLump`
  rocks (each triangle corner moved on its own: cracked and spiky), two of them and a glow sprite inside the throat. The cave walls
  are smooth layered rocks now (`gb168RockG`, one merged mesh). The fight's seal and the wall over the passage are plugs of ice
  shaped to the arch. *Gorthrak*: the pillars are gone (kiting him into them was "too easy and kind of a slog"). New mechanic,
  **Rimelock**: when his maul is frozen in the floor the glacier on his back cracks open and glows, the ground behind him lights gold,
  and hits from behind deal ×1.5 (`GB151R`; "behind" = more than 105° round from his front, `gb151Behind`). Phase I: a Glacier
  Charge that misses skids into Rimelock (`skid`, 1.75 s), the lesson. Signature **Glacier Shell** (move id still `rampage`): armoured
  (85% less damage, heals), he leaps at you three times (`rleap`: the ring marks where he lands, locked .62 s in, 1 s before the
  landing), each landing Rimelocks him ~1.9 s while ice shards burst out in front of him: two hits on the glowing crack from behind
  (one counted each .22 s; damage over time does not count) crack the shell; the third crack shatters it at once (`broken`);
  fewer after three leaps: he heals and the Avalanche (shelters) as before. Co-op: a partner's counted hit goes to the driver as
  `['g1b']` (`['g1p']` is gone). *Serpent Shrine*: the 'tiers' ground (2270 `cs123Op`) has a flat top plateau now: the top terrace
  only reached its height at the centre point, so the coiled idol stood on a cone ~.8 above the ground round its base (also the
  centrepieces of Jotun Hold, Elemental Ruins, Temple Sanctum, Blood Coven, Blood Garden). Tests: `v151_frozen_maw.py` (Rimelock,
  the leaps, cracks, the openings clear), `v151_coop.py` (the partner's cracks), `v168_tiers.py`; pictures `v168_look.py`.
- **Quest set pieces in detail (v168, `3345`; owner: "the angel graves look way too low detail")**: build new set pieces from the
  detail kit, not from 6-sided cylinders and boxes. `dt168Lathe(profile, n)` turns a profile (n 4: a square section with mouldings:
  plinths, obelisks, altars); `dt168BBox` is a bevelled box; `dt168Ext(key, outline, depth, bevel)` extrudes an outline (headstones,
  crosses, blades); `dt168Sweep` stacks elliptical rings with drapery folds (robes; `reg` gives the even lobes of a bundled column);
  `ch164Tube` (3251) for limbs, horns, coils; `dt168Rock` / `dt168Mound` lumpy stones and closed heaps; `dt168Wing`, `dt168Angel`,
  `dt168Skull` (two cached merged geometries per detail level), `dt168Candle`, `dt168Lantern`. Parts are pushed with `dt168P(k, geo,
  kind, colour, matrix)` (geometry cached by its numbers in `dt168Geo`, never disposed), moved as a block with `dt168Xf`. `dt168Group(key,
  build, W)` is lgGroup plus weathering baked once into the vertex colours (`W` per material kind: `g` grime toward the ground, `n`
  mottling, `s` rain streaks, `m` moss on upward faces, `l` lichen); soil goes in kind `s` so it never turns mossy. An old builder gets
  finer for free with `dt168Up(k)` as its first line (boxes bevelled with one segment, `bmin` for a city of boxes, rounder cylinders /
  spheres / cones / rings, dodecahedron rocks lumpy; its numbers, colliders and logic unchanged; `dt168G` = dt168Group + dt168Up).
  *Physically right*: everything stands on the ground under it (the grave kits sample `GH` under the headstone and the mound, the
  Reliquary's columns stand on their own ground and share one lintel height, footings run below ground on a slope); nothing rests
  on a tip or hangs unsupported (a broken arch's lintel lies on the ground); the Dirge II raft floats in a raised stone canal (the
  world's water lies under the ground there). Scattered decorations (`d_angel`, 1680) are built at load, before 3345 runs: kit code they
  call must be hoisted functions only (no `const` such as `lgCol`: use `dt168Mix`). Budgets (`v168_ground.py`): a grave or the angel
  under 9k triangles, a prism plinth 12k, the quay with its raft 40k, the court 140k; it also casts rays up from under each piece's
  footprint and fails when the first surface met is above the ground (floating). Pictures: `v168_detail_look.py views.json`.
- **Owner's list (v166, `3320`)**: *HUD flicker*: never let two pieces of code set the same style of a HUD element (one sets, the other
  clears, and the element jumps every few frames: v165's target frame on phones, between `ui161Lay` and `bfxTgtCls`). Place HUD
  widgets only in `ui161Lay` / `ui161Desk`; other code toggles classes. `test/v166_flip.js` (run by `v166_hud.py`) watches every
  element with an id in town, with windows open and in field and den fights, and reports any value that flips back and forth.
- **Owner's list (v164, `3230`, `0860`)**: *See-through window* twice as large with a soft edge (`R157` 2.3 → 5.4, was 1.35 → 2.4; scenery
  and steep terrain both use it). *Dash grip*: the dash's tuck (`haDodge`) plays in the attack slot (`HA.cur`), so the grip took it
  for a swing: strike grip, an edge roll planned from the tuck's arm motion (the halberd ~176°, blade backwards) and the 2 s
  strike hold after it; the raven's arm hold (2100 `_brS`) also let go, swinging the wand into its pointer pose. Now the tuck is
  marked `HA.cur.mv164` and the grip (`gripTick` wrapper in 3230) and the beast arm hold ignore it: the weapon keeps the grip it had
  (carry when calm, the strike hold and roll in a fight). Test `v164_dodge_grip.py` (every class and weapon, calm and in a fight,
  two dashes: FAIL over 12° from the pre-dash grip or 30° in a frame; before: 40-176°).
  *Companion command* (Space, `commandAttack`): the quick first strike (`cdA` cut to .15) comes once per companion every `CMD164.gap`
  (6 s); before, every press cut it, so mashing Space made them attack as fast as you pressed (14 attacks in 6 s vs 6).
  *Kiting*: a magic companion stepped back whenever a foe came within 2.2 m, so it walked out of every telegraphed wind-up while
  still casting (the dragon took 2 of 9 blows aimed at it, the wisp 2 of 6; the fox 10 of 10). Now a step back (`kite164`) lasts at
  most `KITE164.T` .7 s, once every `KITE164.cd` 4 s, never starts while a monster winds up an attack on that companion, and it does
  not cast while stepping back (now ~90% of blows land; its own attack count is unchanged). Test `v164_kite.py`.
- **Owner's list (v163, `0001`, `3220`)**: *Live site*: claude.ai wraps the published page in an outer page, so index.html's `<head>`
  (the main stylesheet) ends up inside the outer `<body>`, after every `<style>` the game adds to `<head>` while it runs: base rules then
  beat runtime rules of equal weight, on the live site only. That broke v161's phone layout live (hotbar as one tall column, touch
  buttons pushed to the top). `0001` moves the page's stylesheets into `<head>` before any game code runs. `v161_mobile_shot.py` with
  `WRAP=1` loads the page wrapped the same way (full suite: `WRAP=1 SIZES=cs,pp,pl`; `cs` = 412×720, the owner's phone in the Claude
  app) and fails on a tall hotbar or touch buttons pushed up. *Trackers*: on desktop `ui161Desk` used to clear the trackers' place every
  0.4 s while the older placement code set it again on every text change (jumping, Cheddar's over the main quest's); the layout now
  stacks them (main quest first, `UI161_TRK` reordered) and the older functions just run the layout. *Title cards*: "Welcome back" waits
  for a zone card and the reverse. *Aim*: for 1.5 s after an attack is pressed `aimDir` answers `aim163` (a locked target in reach, an
  aimed ground point, else the camera with mouse-look on or on a phone, else the mouse pointer); a melee swing's direction is updated
  every frame of its wind-up and at its hit. *Sovereigns*: the six v146 signatures have `cd` 60 (was 30) and weight 4 after the first
  cast; Argus' Hundred Eyes runs its move clock at half speed while eyes are open (~19.8 s to shut them, was ~9.5) and the eyes open
  `SIG163.argR` 10 m from the centre (were 26.8 m out, ~38 m apart: out of reach at 4.5 m/s). Vorraxis and Gorthrak checked, unchanged.
  *Weapons*: the edge roll is planned before a swing moves (`edge163Plan` poses the arm along the swing's own curve, cached per
  animation and hand), set at once while the hand comes from the carry hold, then turned at most `EDGE163.wind` (wind-up) /
  `EDGE163.rate` (blow, following the blade but ignoring readings over `EDGE163.jump` away) rad/s, never wrapping; for 2 s after an
  attack and while a fight is on (locked target, a monster hunting within 10 m) the hands keep the strike hold, coming up into it over
  0.35 s. Others (partners, humanoid foes) pick the roll once per blow and turn at the capped rate. Tests: `v163_fixes.py`,
  `v163_weapons.py` (every class and weapon: FAIL over 30° in a frame or 120° in 0.1 s; before: halberd 375° in 0.1 s, twin axes 72°
  and the bow 104° in a frame), `v148_edges.py` (edges still lead every combo step).
- **Element reactions (v163, `3210`)**: the v45 rule (any second element reacts at once, ×1.2–×2 on that hit) is replaced by
  buildup. An element hit fills `e.eb.v` by `EB163.F`: hero hit .24 × (raw ÷ attack, clamped .4–2.5), companion .13, status (burn,
  poison) .1; elites ×.75, bosses ×.5. Idle 3 s → drains .3/s. A different element while building pushes the meter back (tug of war).
  Full → primed for 6 s (`e.el`, not refreshed). A different element on a primed enemy reacts (`EB163.R`): Melt ×2.5, Combust ×2
  (+1.1 splash), Overload ×1.8 (+.9 splash), Conduct ×1.6 (chains .9), Brittle ×1.5 (+8 s weakened), Steam / Spread ×1.5, Frozen
  (stun, then Shatter); frost+poison and poison+shock do nothing. A companion never reacts with its own priming (`CH127`).
  Look: the 3D health bar gets a border in the element's colour while building (opacity grows with the meter); primed it glows,
  pulses, a light streak runs along the fill and the element's icon sits at its left (calmer with reduced motion / shake off). The
  bar's own back and fill are switched to the transparent pass so the glow draws behind them. Test: `v163_elements.py` (`SHOT=1`
  pictures `out/v163_bars.png`, `out/v163_boss.png`).
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
  feedComp, kqrUp/kqsBuy, breakBoulder/digTreasure, hatch, mountTick, a rune poll); since v150 a co-op partner's kills count too (3092).
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
- **Version 150 (owner's co-op list, Oct 25 2026)**: *Effects*: a replayed ground decal (Venom Flask cloud, Caltrops, warning
  circles) was never removed on the partner's screen (its `D.rm` is a method the replay never got): the caster now tags each
  recorded decal (extra argument) and sends `['D', id, ms]` when it is removed; replayed decals and the mesh stand-ins (`mpvStub`)
  also time out (`V150.decT` 15 s, `V150.stubT` 4 s). *Mounts*: presence carries `mt` [kind, speed]; partners build the mount
  model under the rider, walk it and seat the hero (`v150MtTick` after `mpTick`). *Aggro*: a host monster weighs partners'
  companions (the 2170 copies) like your own (only when clearly closer, two per companion); the attack target is relayed as
  `"peer#slot"` and played on the owner's `fols[slot]` (`3091`). *Shared progress* (`3092`): every kill of a shared monster you
  are near counts for your Cheddar quests (`chqKill132` redefined: copies and partner kills count); the region host sends
  `['cc', camp]` on a camp clear and each player near it gets the XP, its own chest, the camp quests and the clear (the Glowmire
  hatch opens for guests too); a lit lamppost (`['m143', i]`) and an attuned sigil (`['m145', i]`) are shared; presence carries
  `ir` (INSR) and everyone reaches as far as the furthest partner; a sigil ritual is run by the region host (a guest's F sends
  `['r145', i]`), its ghost wolves are shared monsters (not minions) that hunt the nearest hero, it holds while any hero stays
  near (the host's checks run with the nearest partner's spot lent) and the host sends `['p145', i, slain, total]` for the
  partners' tracker / prompt. *Sigils* (`3093`): `MQ145.total` 50; ghost wolves and their co-op copies give ¼ XP (`gw150X` in
  `gainXP`) and drop loot one kill in four; a hunting wolf that moved < 0.6 tiles in 2.5 s while > 2.6 tiles from its hero
  blinks to free ground 3–5 tiles from that hero. *Duskhold* (`3094`): the kingdom host (join-code host; on the artifact room
  the lowest peer id) sends its kingdom (`dk150Pack`: shops, upgrades, lots, turns, houses + citizens, decorations, stage, shop
  levels, harvested outskirts) as `['ks', id, part, n, text]` on `ev` with `r` −7; a guest keeps its own kingdom aside
  (`DK150.stash`, what its saves keep: an outer `x2Save` wrapper) and shows the host's (`dk150Apply` = the kingdom parts of the
  save loaders + `shApply` / `lotSync103` / `dc103Sync` / `kfApply109`; `kfStage109` returns the host's stage); leaving brings its
  own back. A guest's Steward builds (shop, upgrade, house, decoration, shop level) are paid by the guest and sent as
  `['kd', what, key, lot]`; the host builds them free (`dk150Do`: gold and every cost material lent, then put back; saves
  deferred); outskirts gathered by a guest are taken from the host's too (`['kdo', ci]`); moving, turning, decoration switches
  and villagers stay with the host; the guest's own citizens rest. *Sovereigns* (`3096`): a relayed cast carries the boss's
  spot and facing (extra fields 4–6 of the `'b'` entry); a partner's copy starts the move from there; between moves it turns to
  the driver's facing and glides to the synced spot; the spot sync runs every 120 ms. *Tab* (`3097`): in a boss fight (v31 arena
  or the Seeping Lair) Tab cycles every live visible target within 34 tiles; outside fights, with nothing in front, the nearest
  enemy within 20. *Hatch*: a chest that would stand within 2.8 of the Kindlelight II hatch moves just beyond it (`makeChest`).
  *Raven robes*: for race 3 the skirt takes the thigh's swing fully by the knee and blends into the shin below it (`gkSkW`
  wrapper, `RV150`), so the long bird legs stay inside. *Bats* (Batwing, Duskwing, Blood Bat): only the hind legs are built (the
  wings are the forelimbs; the front-leg bones stay unused). *Hatchet*: the edge keeps the side that leads the down-swing all
  through the chop (it flipped round during the wind-up). Tests: `v150_checks.py`, `v150_coop.py` and `v150_ritual.py` (two
  windows over the fake room; run directly, they start `mpt.py` themselves).
- **Version 150 companions**: the higher tiers that reused a lower species' body in another colour now have their own bodies on
  the same skeletons (RV137 rig variants, each with its own evolution looks and trait anchors; enemies and mounts on these rigs
  keep the base bodies): `3110` Direfang (sabre-toothed dire wolf), Skollmaw (long-jawed eclipse wolf), Emberlynx (lynx);
  `3120` Pyrewing (lava-cracked fire wyvern), Elderdrake (ancient armoured dragon, club tail), Stormtalon (storm eagle with a
  lightning crest), Rocsovereign (crowned golden roc); `3130` Cragback (bladed crag tortoise), Titanshell (titan turtle carrying a
  ruined fortress), Bogmaw (angler-lured swamp maw toad); `3140` Widowqueen (crowned black widow), Hivemother (brood-mother with a
  swollen egg sac and spiderlings), Lichbone (robed, crowned lich hound with a phylactery and soul-fire). Pictures:
  `v137_creature.py` with `LIST=C:<species>:<evo>`.
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
- **Version 164 Cheddar's board (`3235`; owner: "reduce the amount of cheddar quests in each zone to 8 total and award the player with an
  exclusive and extra cool looking cosmetic skin variant for either a playable animal race or a companion or mount if they do all the
  quests in a zone")**: every zone's `CHQD148` list is exactly 8 (3 Easy, 3 Medium, 2 Hard); Kindlelight and Hillside Crest lost menu
  chores (their ids stay in `CHQ132_ID` so old saves load), the Sands / Dirge / Citadel gained `c3h`, `c4h`, `c5g`, `c5h`. Turning in a
  zone's last quest unlocks its skin (`SKN164.D`, `SKN164_Z[zone]`: Lanternbound hero, Stormmane mount, Rimeborn companion, Sunforged
  hero, Wraithveil companion, Bloodcrown mount) with a title card and splash, worn at once (`skn164Unlock`, `skn164Check` after
  `chqTurnIn132`, on load and after the quests cheat). The skins are shaders (`skn164Patch`: base palette + model-space pattern, Voronoi
  crackle veins with per-skin motion `fx` 0 flow / 1 lightning / 2 sparkle / 3 mist bands, rim light, own roughness / metalness; time
  `SKN164.t` from a `loop` wrapper). Hero skins touch the fur only: `mdLookOf` gives the model the sentinel fur `SKN164.SENT` (0xff00ff)
  and `L.skn164`, `mdHeroApply` patches the hero's own cloth material (mode 0 finds the sentinel-derived vertex colours, so armour keeps
  its colours); companions get skin copies of their materials on every follower (mode 1, `skn164Dress`), the ridden mount on its coat
  (mode 2: vertex colours matching `MDL100_S[k]` c / c2 / bel / m, so the tack stays); shared materials are never changed (`SKN164.MC`
  copies, `SKN164.O` / `.B` weak maps). The board shows the zone's skin card above its quests (progress, Wear / Take off). Saved as
  `x2.skn164 {u, e}`; co-op sends the hero skin as look index 9. Tests `v164_skins.py` (`SHOT=1`: the board), pictures
  `v164_skins_look.py`.
- **Version 148.1**: *Cheddar's board*: each tier (Easy → Medium → Hard → Heroic) of a zone opens only once every quest of the tier
  before it there is turned in (`chq148Open`); gold and XP are 35% of before (`CHQ148_PAY`); the Sovereign-kill quests are gone.
  *Companion splash* (`3077`, `SPL148.k`=.3): an enemy area attack aimed at the hero also hits each active companion standing in its
  red shape (downward ray at the companion vs. `a.tel`/`a.xt`), once per attack, at 30% — when the hero is hit, or when the strike ends
  after the hero dodged out. Projectiles are left out. Test: `v148_splash.py`.
  *Boss splash* (`3079`): the same 30% for the six Sovereigns and Vorraxis — every strike (`svHitNow` / `mb144HitNow`, shape vs. each
  active companion, hero hit or not), the v146 ring waves (`sk146RingWave`), Vorraxis's Deluge (companions off the islands) and the
  Wraith's Absolute Zero (companions away from a lit brazier). Catch-all hits (shape r 99: spines, blood drops) and lingering ground
  hazards stay hero-only. Test: `v148_boss_splash.py` (`BL=`, `SEC=`).
- **Version 148.2 (co-op)**: *Revive* (`3085`, `RV148`): at 0 HP with a partner still standing in the same map you are downed, not dead:
  `RV148.T` (30) s to bleed out, no moving / attacking / casting, nothing hits you (monsters turn to partners, a standing partner drives
  the Sovereign). A partner beside you gets "F · Revive …" and stays close `RV148.need` (3) s; you rise with 40% health and 2.5 s of
  safety. Bleed-out, "Give up" or nobody standing in the map = the normal death (`rv148Die` → `arenaFail` → `down_base`); an arena is
  only lost when everyone in it is down. Phoenix Heart, Unbreakable and the god cheat still come first; solo is unchanged. Presence
  carries `dn`/`bt`; the revive is the `ev` entry `['rv', peer]`. *Boss credit* (`3086`, `BC148`): whoever kills a Sovereign (or
  Vorraxis, `'v144'`) sends `['bk', id, name]`; every other player in the game gets the one-time progress wherever they are
  (`bossDefeated({ar:i})`: map cleared, power, next portal, kingdom; Vorraxis: `MQ144.st` 2, the crystal waits in the lair). Players in
  that same fight still get the kill and its loot (0520). Fix: in co-op the world runs behind the death screen, so a dead hero lying in
  an arena used to restart the fight (and the arena wall pulled them back after "Rise Again"); `arenaTick` now starts no fight while
  the hero is dead. Test: `v148_revive.py` (two windows, fake signaling, real WebRTC; includes the arena case). The random v141_sov
  check "boss 3: Reach used against kiting" is in `test/ci_known_fail.txt` (owner's request).
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
- **Camera next to walls (v157, owner: "the camera aggressively shifts upwards" in caves, at map edges and in Abeksi; pulling it in had been tried and was disorienting too)**: the
  camera keeps the player's tilt and distance. Walls are cut away around the hero instead (2420 scenery, 3190 terrain): a round dithered window on
  screen (fully cut inside `R157.x` = 1.35, solid from 2.4, measured at the hero's depth so it stays the same size whatever the zoom), anything
  within `N157` (3.4–5) of the camera and in front of the hero cut fully, and two-sided meshes seen from inside (Abeksi houses) not drawn.
  Floors and anything below the hero's knees stay solid. `cam157Floor` keeps the camera above gentle ground with the usual smoothing; behind
  a wall (a step of more than `CAM157.step` 0.55 between hero and camera) the camera stays inside the wall, whose faces then point away.
  Test `v157_cam.py`: turns the camera a full circle next to a cave wall, an instance edge and in two Abeksi streets (old build: up to 47° and 71°).
  v169: the dithered window, the near-camera cut and the hidden two-sided insides are replaced by see-through glass (see v169 above).
- **Camera on slopes (v132; since v135 only the ground counts, scenery fades instead; replaced by v157, kept for history)**: when the ground behind the hero blocks the camera ray (`blk` in the main loop, 0104), the camera first
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
  * Layout (`3020`, `mq143Plan`, a pure function of the map data, cached): since v151 the outpost stands near the entrance, `A` = 36
    steps down the road (`mq151A`, settings in the hoisted `mq151Cfg()` because 0045 and 0070 call this file before it runs; v143 put it
    `N-52` steps before the gateway); since v160 the lampposts stand on the lantern line (`mq160Line`: the raw road path cut where it
    zigzags — a shortcut is kept while it stays `mq151Cfg().clr` (5) tiles inside open ground, within `.dev` (6) of the path and `.wat`
    (2.6) from ponds and rock, `.obs` (1.6) from bushes — then
    rounded with Catmull-Rom and nudged clear of those again; `R.line` / `R.lineD` / `R.lineLen`), every 7 tiles of distance from 8 past the outpost to 10 before the
    gateway, evenly at least 7 apart and 1.5 clear of those clumps (34 in Kindlelight I, closest pair ~7.6; v151 put 47 every 7 path steps, and the road's V and W zigzags left 12 of them
    within 5 tiles of another), `lamp.i` = distance along the line, alternating sides 2.7
    off the road; the Ripper starts on the road at `A+2` and parks beside
    the gateway on the side away from Cheddar's gateway spot. `mq143Keep` keeps decorations out of the outpost, the lampposts and the
    parking spot: 1680's `place` returns true without placing (counted as placed, so the seeded stream and every other decoration are
    unchanged). Roaming groups whose home is within 17 of the outpost are dropped (`rosterBuild` wrapper).
  * The entrance camp (v151, `mq151MoveCamp`): Kindlelight I's camp 0 stood where the outpost is now. 0045 calls this right after the
    map's last seeded step (before `v112Map` / `cs123Map`), so tiles, water and harvest nodes everywhere else stay as they were. It moves
    the camp record in place (`I.cl[j]`, shared with `PMAP[0].cl`) to the nearest branch-end field (r ≥ 15, 24+ off the road, away from
    the entrance, gateway, outpost and other camps: (185,143), up the side path that leaves the road at the outpost), clears water and
    harvest nodes within 14 there, and keeps its number (design `0_0_0` Caustic Pool, theme, saves). The old clearing stays open ground.
  * Wardens (`3021`): 7 armoured animals (wolf captain, boar, bear, hound, fox, lynx, beaver engineer) built as town folk
    (`FK137.out` / `FKO` labels `Lantern Warden · <key>`) wearing the heroes' heavy chest armour (`mdChestO` with a hand-made design:
    aegis / warplate / wall / hauberk / cuirass / mail), greaves, a tabard, the lantern sigil and a steel helm lofted over the folk skull
    (`mqw143Helm`: cap, kettle brim, crest, cheek guards, the captain's plume, the engineer's goggles). Weapons and shields are rigid kits
    mounted on the paw bones in the guard pose (`MQW143_POSE`); `mqw143Anim` = folk rest + guard pose + v93 idle, or the folk walk.
  * Quest (`3023`): `MQ143.st` 0 not met · 1 met · 2 rolling · 3 done; done also when II is reached (`mq143Done`). Glowbulbs are a quest item
    (`MQ143.b`, not a material, no other use): every Kindlelight I kill drops one at `MQ143.drop` (100% since v151, was 55%; in addition to its normal loot) while more are needed (`mq143Need`:
    dark lamps × `MQ143.per` (1 since v151, was 3) − carried − on the ground); kind `mq143` drops go through `take`. F at a lamppost with a bulb lights it; the last lamp
    starts the roll (`MQ143.speed` 3 tiles/s since v151, was 1.9 along a Catmull-Rom route, wheels spin, chimney smoke, two escorts walk beside it), then the
    fire-up (jacks, claws open, coil charges, arcs to the arch, flash) opens the gateway (st 3). Leaving the instance mid-roll finishes it;
    a mid-roll save loads as done. Saved as `x2.mq143 {v,st,b,lit[one per lamp],seen}`; saves without it start at 0 (or done if II was reached); saves before v151 (`v` < 151,
    8 lamps) get 3 bulbs back per lamp they had lit and start the new road dark. Saves from v151–v159 (`v` < 160, ~47 lamps) get 1 bulb back per lit lamp and
    start the lantern line dark.
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
- **Hillside Crest main quest (v152–v154)**: three chapters, one per field instance; none of its gateways is a portal.
  * Special instances (`3150`, `SP152`): one-time levels with their own instance records (`sp152Defs`, painted by `sp152Map` /
    `sp152Terrain` from 0045; `insAt` falls back to `spIns` for rows below the zone grid). `sp152Gate(key,{ig,where,build,prompt,r})`
    hides an instance's 'next' portal and puts the level's own entrance there (`sp152GateSpot`: the gateway clearing's far edge).
    `SP152.R[key]` rules while inside: `park` (companions hidden), `noMount` / `forceMount`, `noFight`, `noRecall`, `onLoad`.
    Tracker `#mqt152` (`SP152.trk[key]`), atmosphere `sp152Theme`.
  * **Abeksi city (v152, I → II, `3151`–`3155`)**: "F · Sneak through Abeksi city" at a carved archway in I. Pure stealth through a
    snake city in six districts (Breach, Market, Dwellings, Rat Warrens, Great Kitchen, Gate Yard), 6 checkpoints; seen = caught → back to the last checkpoint (v157: caught now rouses the whole city, see below). Ctrl (tap, toggles; holding Ctrl+W would close the tab) or C crouches: quieter, smaller to see.
    Sight and hearing numbers `AB152V`; actors (`ab152MakeActor`, routines, poses `AB152P`) sit, eat, talk, work, patrol, investigate.
    Plan `ab152Plan`, models `3152`, actors `3153`, poses `3154`, the level `3155`. Saved `x2.ab152`; done when II was reached.
    Tests `v152_abeksi.py`, `v152_route.py` (an unseen route through every district), pictures `v152_look.py`.
  * **Abeksi alive (v157, `3191`)**: `ab157Plan` (wraps `ab152Plan`) adds prop kinds to `AB152_K`/`AB152KB` (feast, alembic, vat/vatV, shelfV,
    sculptA–D, jewel, altar, idol, offer, bannerP, dummy, wrack, butcher, hutchT, carpet, chest, drum, censer), lights (`alch`, `vio`, `altar`), a
    fourth rat pen, the folk list `P.F` and rooftop list `P.RF`; props bake and turn solid through 3155 as before; `ab157Dress` / `ab157Roof` bake
    wall hangings and roof furniture per district. By district: Breach (sacrifice shrine: idol, bloodied altar with a rat, offerings, censers,
    chanting mystic, worshippers; a training yard), Market (steel sculpture court, three jewellers, shoppers, a flute player on the fountain),
    Dwellings (alchemists' lane: stills, glowing vials, bubbling vats with coloured smoke; rooftop feast, dye beaters, flutes), Rat Warrens (rat
    butchery, cauldron and spit, breeding hutches, a fourth pen), Great Kitchen (two feasting halls, 22 diners, servers, flute and drum), Gate
    Yard (a caravan, two steel guardians). Folk (`AB157.S.folk`, 128) are made with `ab152MakeActor` and are ambient: they never spot the hero
    (only the 49 plan snakes do), stand off the sneaking routes, are posed only within `AB157V.R` (36) tiles, placed deterministically (co-op).
    New poses in `AB152P` (spar, kneel, chant, offer, flute/fluteSit/fluteFloor, drumSit, admire, browse, polish, pour, grind, feast,
    feastFloor, eatFloor, sitTalk, lean, beat, skin), tools `ab157Tool`/`AB157PT`; a soft synthesized flute near the six players
    (`ab157FluteTick`, `AB157V.flR`); coloured smoke `ab157FxTick` (two shared particle objects). *Torches*: flames used to flicker by stretching
    from the ground, so they floated above tall torches; `ab157Pivot` scales each flame from its own base, and `ab157FixLights` turns the six
    torches/lanterns standing inside Dwellings walls into wall sconces (`ab157Sconce`). Pictures `v157_look.py`.
  * **The alarm bell and the hunt (v158, `3193`; owner: "players don't have to kill every single abeksi - they can just fight their way to
    the gate if seen ... a substantial amount of abeksi in the immediate area actively look for you and attack")**: the alarm is a bell
    (`ab158Bell`: three tolls, bronze partials, over the drums of `ab157Horn(true)`). It calls up to `AB158.bell.n` (16) of the nearest
    residents by street distance (within `AB158.bell.r` 44 steps; roof folk excluded) to hunt: `ab158Flow` is a breadth-first flow field
    from the heroes over the city grid (`ab158Ok`: not `G.sol`, `G.cls`<2), rebuilt every 0.35 s; `ab158Step` runs a hunter down it
    (guards `AB158.spd.g` 4.4, townsfolk 3.7 tiles/s; every client moves them, the host's `rs` states mark them `3`). Within `AB158.eng`
    (7) steps a hunter, or any standing resident, becomes one of the game's enemies (`ab157Rouse`, nearest first, up to `AB157K.cap` 10
    fighting); with the fight full the others wait in a ring `AB158.hold` (4) steps out. A fighter cut off more than `AB158.drop` (14)
    steps away by walls for 2 s in a row (`e.ab158far`) goes back to the streets as a hunter, keeping its wounds (`a.hpK`). Every `AB158.bell.re` (24) s the bell tolls
    again and calls `AB158.bell.rn` (5) more. The city gate is open as soon as the bell rings ("F · Escape through the city gate"):
    killing everyone is no longer needed. Banner `#ab157al` and tracker: "Hunting you" (`AB157A.hunt`). Only heroes on their feet can be seen (`ab158Up`; a
    partner downed or dead is not), and each hero has `AB158.grace` (4) s of not being seen after getting up or being moved far at once
    (`ab158Fresh`, co-op). For `AB158.grace` s after the city calms (`AB157A.calmT`) nobody can be caught: in co-op a partner who died still lay in a guard's view until rising, and the host's
    snakes rang the bell again. When a death calms the city, the whole party wakes at the checkpoint (`ab158Wake`: a partner lying downed
    gets up, healed). Test `v157_abeksi_alarm.py`; co-op `v155_coop_levels.py` (the host lies downed when the partner dies: both wake).
  * **Assassinate and the city alarm (v157, `3193`)**: "F · Assassinate" (`ab157Target`) within `AB157K.r` (1.6) behind a calm Abeksi
    (inside `AB157K.back`, not on a roof), red ring on the target; `ab157Assassinate` lunges, the snake falls and its body stays.
    `ab157Witness`: a snake that sees the kill (or a nearby townsperson facing it) = caught; `ab157Bodies`: a calm guard who finds a body goes
    to look (no alarm by itself). Caught (`ab152AfterCaught` in 3155 → `ab157Alarm`) no longer sends the hero back: horns and drums, "The City
    Is Roused!", crouch / stealth bar / view cones off, fighting allowed, and every resident (`ab157Res()`: plan snakes then folk, 177) is
    hostile: `ab157Rouse` turns them into nagaw/nagaa/nagas enemies (`e.ab157`) nearest first, up to `AB157K.cap` (8) within `AB157K.act`
    (24) tiles of a hero, at city levels; townsfolk ×`AB157K.civ` (55% HP, 60% damage, cleavers); XP / loot rate ×`AB157K.xp` / `.loot`
    (guards 0.6 / 45%, townsfolk 0.3 / 15%, on top of ECON96/PACE). `AB157A.left` feeds the tracker and the `#ab157al` banner. The gate
    (`AB157K.gate`) was barred while any resident stood (v158: open as soon as the bell rings); F leaves like the drain (`ab152Finish('gate')`); the drain works during the
    alarm too. Death during the alarm: `ab157Rise` → `ab152Restart` + `ab157Calm(true)` (calm at the last checkpoint, everyone alive).
    Co-op: the host spawns the hostile residents; `['ab','x',i,u,v,hu,hv]` knife kill (the host checks witnesses), `['ab','d',i,u,v]` a
    resident fell, `['ab','rs',states]` resident states every 0.6 s, `['ab','calm']`, `['ab','out',gate]`. Test `v157_abeksi_alarm.py`.
  * **A real fight and a gate you can't miss (v164, `3231`; owner: "residents are too easy when they become aggressive ... any abeksi path
    towards you and attack if you're in their line of sight. When the bell tolls, it summons 2 elite guards each time instead" and "make the
    exit gate much more obvious ... and more detailed")**: roused guards ×`AB164.g` (1.5 health, 1.3 attack), townsfolk at full health and
    .85 attack (`AB157K.civ`, were .55 / .6), every city fighter moves ×`AB164.spd` 1.85 (`walkM` wrapper, `m.userData.spk164`) and attacks
    `AB164.cdK` faster (`aiLod` wrapper), cap 12. A fighter that can't see its target walks the street flow field (`ab164Route`, `eTarget`
    wrapper: a waypoint `AB164.look` steps down `AB158.fl`) instead of into a wall. While the city is roused any street resident with a clear
    line of sight (`ab152LOS`) to a hero within `AB164.see` (28) joins the hunt (`ab164Sight`, host, every 0.25 s). The bell no longer calls
    residents: `ab158Call` now summons `AB164.elN` (2) elite guards per toll (`ab164Elites`: `nagaw`, elite, city level +1, a gold crest,
    out of every hero's sight 16–30 street steps away, at most 8 alive; `e.ab164e`, also tagged `e.ab157` so they leave on calm and count as
    guards for XP/loot); an elite beyond 28 tiles keeps running the streets (`ab164ElTick`). *The gate*: the plank slab (`AB152KB.gate`) is
    replaced by a gatehouse porch on the Gate Yard tower (`ab164GateBuild`, plan spot `AB164GATE`): carved pylons (2x3 footprints,
    `AB152_K.pylon`, added by `ab164Plan`, which also moves four crates out of the porch and puts the tower lamp guard `f3` on the battlement
    walk, lift 8.2) with serpent reliefs, rearing jade serpents and braziers, a voussoir arch with a serpent-skull keystone, a barrel vault,
    a serpent-sun tympanum, banners, a floor mosaic and two iron-bound leaves (`ab164Leaf`). In the alarm the leaves swing open on a lit
    passage, the serpents' eyes and the braziers flare, and the way out is marked: a pillar of light, a floating ESCAPE sign (no depth
    test), a glowing ring and a light in the porch, chevrons on the street along the shortest way (`ab164ChevTick` on `ab164GateFlow`), an
    arrow at the screen edge with the distance (`#ab164ga`), a minimap mark (`ab164Marks`) and the tracker's step count. Tests
    `v164_abeksi.py`; pictures `v164_gate_look.py` (`ALARM=1`).
  * **The Hilltop Ascent (v153, II → III, `3160`–`3162`; reworked in v164, `3250`/`3251`)**: "F · Ascend to the hilltops" at a hill road
    in II (a mount needed). A mounted chase up a spiral trail (`ch153Path`); A / D steer, Space jumps; every mount runs at `CH153V.spd`.
    The crack at the summit leads to III. Saved `x2.ch153`. Tests `v153_ascent.py` (an autopilot rides the whole trail: about 100 s),
    pictures `v164_look.py` (`v153_look.py` is the older set).
  * **v164 rework (owner: "remove the obstacles, the attack from behind and the health system; the snake spits venom that slows you;
    the trail has broken portions to jump; if he catches you he chomps you")**: no boulders, logs, spikes, pillars, rockslides, plank
    bridge, strikes or hit points (the 💚 hearts and `CH153V.hp` are gone; the hero's health is never touched). *Broken trail*:
    `ch153Course().gaps` (seeded, 13 stretches, ~80 tiles apart and 2.4 long at the foot → ~45 apart and 3.2 long near the summit;
    `ch153GapAt`), the ground carved ~11 deep there (`ch153Terrain`), each dressed by `ch164Abyss` (lit cracked lip slabs tipped
    toward the hole, unlit rock walls dropping into black, a dark mouth so it reads as a drop) plus crack decals and stones crumbling
    off the near lip as you come; a "Broken trail — JUMP!" cue. Space jumps it (the mount leaps at least at full stride, ×`CH164.leap`,
    even when slowed, and keeps its speed in the air); land in it and you fall (`ch153Die('fall')`): you drop into the gap, Skarrith
    reaches the lip and dives after you, its jaws close (`ch164Bite`), then the chase starts again. *Venom*: in phases by trail
    position (`ch153Course().venom`: [from s, seconds between volleys, most globs]) it rears and spits (`ch164SpitTick`): one glob at
    your lane, two as a slalom (`CH164.slalom` apart, other side), or a wall of three (jump it). Each glob arcs through the air with a
    pulsing target ring and a growing shadow where it will land (`ch164Ring`), lands with a splash and leaves a bubbling puddle for
    `CH164.poolT` 7 s (`ch164Pool`). A puddle or a glob landing on you slows the mount to ×`CH164.slowK` .42 for `CH164.slowT` 1 s
    (`ch164Slow`: green screen tint `#ch164v`, squelch, hiss; ~6 tiles lost). Volleys never land within `CH164.gapB` 12 before /
    `CH164.gapA` 6.5 after a gap, and one or two always leave a lane `CH164.lane` wide. *The chase*: Skarrith runs at its own speed
    (`ch164SnakeV`: `CH164.snV` 8.55 → 8.85 up the trail, a surge only past `CH164.far` 28 behind), between a mount (8.2) and steady
    boosting; held to `CH153V.slow0` for the first 3 s. Without boosting it reaches you in ~45 s; each slow lets it close in, boosts open
    the gap. Within `CH164.catch` 2.6 it rears and chomps (`ch153Die('chomp')`: a lunge, jaws over hero and mount, shake, red flash) and
    the chase starts again. *HUD*: a distance meter (🐍 … 🐎 bar, "Skarrith · N m behind", glowing red under 10), the chase camera
    pulls back and swings out over the drop as it closes (`CH153CAM.near` / `.side`) so its head looms behind you.
  * **Skarrith's model (v164, `3251`)**: one smooth body tube along a Catmull-Rom curve through the spine points (`ch153SnakeLay`:
    `CH164B.sub` 4 rings per point × `CH164B.ns` 22 sides, analytic normals, rebuilt in place in one geometry), a flatter belly, a
    painted skin texture with a bump map (`ch164SkinTex`: shingled keeled scales, a dorsal diamond chain with bronze rims, flank
    blotches, wide pale ventral plates) laid by length ÷ radius so scales shrink toward the tail; keeled dorsal scutes and spines
    (two InstancedMeshes on the tube's frame). Head (`ch153SnakeHead`): lofted wedge skull and hinged jaw (`ch164Loft`), heavy brow
    ridges, head shields, a horn crown and crest, slit-pupil glowing eyes in dark sockets, nostrils and heat pits, rows of teeth, two
    fangs that swing forward as the jaw opens, a forked tongue that flicks, venom dripping from the fangs (`ch164HeadAnim`), a ribbed
    cobra hood (pale banded front, dark scaled back with eye-spots). Smooth MeshStandard materials of its own (kept out of 2420's
    fade); textures, materials and fixed geometries are made once (`CH164B`); nothing is made per frame.
  * **Ascent boost and danger (v157, `3192`)**: Shift (desktop) or the 💨 dash button gives `ch157Boost()`: ×`CH157.mul` 1.55 for `CH157.T` 0.9 s,
    `CH157.n` 2 charges each refilling in `CH157.refill` 5 s (not while boosting); it carries through a jump; 3250's
    speed reads `ch157Mul(R)`; co-op: each rider boosts themselves. Effects `ch157Fx`/`ch157Hud`: speed FOV, wind streaks (`#ch157c`), hoof
    dust, pulsing red edge (`#ch157e`, v164: from ~18 tiles in, stronger and faster as it closes), surge thuds and shake, a looping rumble/hiss
    (`ch157Snd`), the VENOM warning (v164: the side strike arrows `#ch157sL/R` stay hidden); `ch157Calm()` (Screen shake off or reduced motion) tones them down. *Emergence*: Skarrith bursts from the trail behind the rider at
    `CH153V.hole` (1; `ch153Course().start` 15) at `ch153EmT(R)` s into the intro (3250 poses it via `N.em`/`N.drop`; 3192 adds the crack
    `ch157CrackMesh`, debris `ch157Erupt`, dust); intro camera `CH153CAM`; off-trail spots follow the ground (`ch153Ext`). Old bug: before the
    trail's foot the serpent was placed 10–30 above the slope, out of the intro camera's view. v164: under `CH153CAM.near` 15 tiles the chase camera pulls back, rises and swings out over the drop so Skarrith's head stays in view behind the rider. Tests: `v153_ascent.py` (emergence, boost; the autopilot boosts),
    `v155_coop_levels.py` (a co-op boost).
  * **The Gate of the Hydra (v154, III → Den, `3170`)**: a great carved stone door in the mountain replaces the Den portal
    (`sp152Gate('hydra')`), five Hydra heads on its lintel. Five Wind Stones (`hd154Plan`: off the road at 12/30/48/66/84 %, open
    ground, apart) each with a bronze serpent vane: F turns it an eighth; facing the door (`want`) its wind ribbon flows and a head
    lights. With five winds, the Song of the Mother: the heads sing 3, 4, then 5 notes; strike the five chime stones before the door in
    the same order (a wrong one hisses and the verse is sung again). Then the doors open (`hd154Open`) and F enters the Den (INSL[8]).
    State `HD154` saved `x2.hd154 {st,vane,on,vs}`; done also when the Den was reached. The cheat "All quests complete" finishes all
    three chapters. Tests `v154_hydra.py`, pictures `v154_look.py`.
  * **Together in co-op (v155, `3180`)**: the chapters are one party's. *Abeksi*: F takes every partner in Hillside Crest I in
    (the leader's checkpoint, side by side); the map's host runs the snakes, which look at every hero (presence `cr` crouch, `af`
    frozen), hear partners' steps and rats (`['ab','n',…]`) and are sent to the others (`['ab','s',…]`, the snakes near each
    partner, ~6/s; guests show them, `ab155Follow`); anyone seen = everyone back to the party checkpoint (`['ab','c',…]`, the
    furthest reached: `['ab','cp',i]`); the drain takes everyone out (`['ab','out']`). Partners crouch on screen. *Ascent*: F takes
    every partner in Mistmere up (all need a mount: presence `hm`; no joining a chase under way); one Skarrith driven by the host
    after the rearmost rider (`cs155Snake`: `['cs','n',s,v]`; v164: its own speed `ch164SnakeV`, its distance measured to that rider;
    venom at a rider picked at random, `ch153SpitPlan` / `ch153SpitSpawn` → `['cs','v',…]`; no strikes, `['cs','k']` is gone); each
    rider's own world checks its puddles, the gaps (seeded: the same for everyone) and the chomp; riders send
    `['cs','p',s,o,y,ph,slowed,v,rd]` and are drawn on the trail; stones crumble off gaps ahead of the leading rider (`ch164LeadS`). A fallen rider (chomped or into a gap) spectates (`R.ph` 'spec': hero
    hidden, the camera on the leading rider); all fallen → `['cs','re',rd]`, everyone starts again (v156: tries are numbered, `CS155.rd`, sent in `p`; a fallen rider
    whose partner is already on a later try starts again with them instead of watching them, the cause of the old stuck watcher); a rider through the crack
    (`['cs','w']`) → the fallen arrive in III downed (3085 revive, `RV155.T` 180 s). *Hydra*: stone turns, song starts, chime
    strikes and the opening are sent (`['hd',…]`), plus the whole state every 3 s (`hd155Merge` keeps the most progress).
    Test `v155_coop_levels.py` (two windows, `mpt.py`).
- **The Dirge main quest (v165, `3310`–`3318`)**: three chapters, one per field instance, each done also when the next instance
  has been reached (`dg165GDone` … `dg165ODone`, 3311). Plans are pure and hoisted in `3310` (0045 paints the two special instances
  through `sp152Map` / `sp152Terrain`; 1680 and 3242 keep decorations off the graves, prisms and Reliquary with `dg165Keep`). State
  `DG165Q` saved as `x2.dg165` (3318); the cheat "All quests complete" finishes all three. Shared kit (3311): `dg165Snd` (whispers,
  heartbeat, creaks, splashes…), `dg165Hurt` (trap damage as a share of health), the reading card `#dg165c`, the fear vignette
  `#dg165v`, candle flames and a light pool `dg165LPool` (a few point lights follow the nearest light spots). Tracker `#mqt152`.
  * **I · The Keeper's Grave** (`3312`): Dirge I's gateway portal is hidden behind a weeping angel (`sp152Gate('sanctum')`): reading
    it gives the clue (a broken stone, a raven, undying candles) and the gravedigger's spade (`DG165Q.g.st` 1). Fourteen graves
    (`dg165GravePlan`: road fractions 7–93 %, alternate sides, 6–14 off the road, apart; headstone / emblem / offering in `DG165G.F`,
    names in `.N`; only grave `DG165G.K` 9 has all three marks). F reads a grave (card), F again digs (3.2 s, `dg165DigTick`;
    moving or a hit stops it). A wrong grave stays open and lets out 2–3 of the Dirge's dead (local, `e.dg165r`, little XP/loot);
    the Keeper's caves in on a stair: F · Descend into the Hidden Sanctum (st 2). Minimap marks for read graves.
  * **The Hidden Sanctum** (`3313` models, `3314` level; special instance `sanctum`, g 33, floor at y 20 so the world's water
    never shows): instanced flagstones of mixed sizes, ashlar walls with buttresses and cornices, skull niches in the ossuary.
    Halls (`dg165SanPlan`): Stair Hall · Hall of Pendulums (5 blades, `DG165SP.amp`, cut = 30 % + knock-back) · Spike Hall
    (2×2 plates in bands rolling toward the entrance every `spkStep`, red glow `spkWarn` before) · Antechamber plate → the
    portcullis at the end of the Fire Walk (5 skull jets, `jetPer` / `jetOn`) stays up `gateT` 16 s · the Chasm (slabs crack
    `slabT` after you step on, then fall; on a fallen slab you fall: −30 %, back at the edge, the bridge whole) · the Closing Walls
    (doors slam, spiked walls close over `cwT` 42 s; turn the four weeping knights (F, 90°) to face the altar; time out = crushed)
    · the Ossuary Gallery (a shade passes, lights out) · the Keeper's Tomb (the lid slides; the flooded stair: F → Dirge II).
    Checkpoints `DG165Q.s.cp` 0–5; dying wakes you at the last one (`down_base` → `awDie` → `dg165SRise`). Companions wait, no mount,
    no recall (the stair back up is in the first hall). The hero stands on the bridge slabs by `homeTick` (the ground below is the chasm).
  * **II · The Black Channel** (`3315` drowned, `3316` raft; special instance `channel`, g 34): Dirge II's gateway is a quay with a
    tunnel mouth and a moored raft (`sp152Gate('channel')`). The channel (`dg165ChPath`, ~750 tiles, Catmull-Rom; water half width
    `dg165CCfg().hw`, walks, walls) is the world's own water (terrain below y 0.02) dressed with instanced masonry, arches with lanterns,
    statues, pillars, grates, drifting debris, and grey daylight over a bone beach at the end. The raft: `RT165.cols×rows` planks of
    `RT165.cs` (`RT165R.cells`, each `RT165.hp`); walking is turned into deck moves (`rt165Walk`, never off the planks; the 0570
    unstick rescue is off on it). The Drowned Wretch (`EN.dgwretch`, registered by hand: gaunt, hair over the face, claws) and twice
    a Drowned Hulk (the Thrall, elite, `RT165.hulk`) are real enemies whose `eTick` is `rt165WTick`: swim (hidden, ripples), rise,
    cling to an open plank side (`rt165Open`), rake (`RT165.rake`; a hulk slams two planks and rocks the raft) or lunge at a hero
    beside the edge; dead ones sink (`kill` wrapper). Poses are set fresh each frame on the rig (`dg165WPose` / `dg165WApply`).
    Waves by progress `RT165.ph`; scripted: something passing under, the hands at the lull. A torn plank drifts off and sinks; at
    `RT165.min` planks the raft breaks: everyone goes down (`rt165Shatter`, no revive) and wakes on a fresh raft. 🏳 abandons it.
  * **III · The Five Runes** (`3317`): five prisms (`dg165PrismPlan`, colours `OS165.col`) and the Reliquary near the middle of
    the map (5 rune pillars, an altar). F siphons a prism (`OS165.sip` 2.2 s) = one charge; while carrying the dead rise round you
    every `OS165.gap` s (cap `OS165.cap`, `e.os165`, little XP/loot), no mount or recall; F at the matching rune lights it; falling
    gives it back to its prism. Five lit: the Den gateway (sealed through `portalPrompt`, glyphs on its arch) opens (`DG165Q.o.st`).
  * **Co-op** (`3318`, messages `['dg',…]`): the Keeper's grave, checkpoints, the gate, the walls and knights, the stairs out, the
    raft's boarding / drift (`rs`) / planks (`rd`, `rb`, `rc`, `rx`) / drowned states (`rw`) and lunges (`lg`), the prisms and runes are
    shared; the host runs the drowned and raises the dead round every carrier (presence `oc`). Tests `v165_dirge.py`, `v165_dirge_coop.py`,
    pictures `v165_look.py` (VIEWS=angel,grave,keeper,stair,s_*,c_*,o_*).
  * **The Pilgrim's Stair (v165, `3260`; owner: "more detail on that piece of the map so it really feels like a place where you're
    leaving and going up a mountain")**: Mistmere's way up to the Hilltop Ascent is a trailhead cut into the NE rock band (`th165Plan`:
    a trail of stair runs, landings and a ramp, `TH165`). Map (`th165Map`, from 0045 after `cs123Map`): the trail is walkable, the
    mountain round it solid with DW 9.5 (no v124 edge stones or oaks on it); terrain (`th165Terrain`): the ledge cut, a gorge notch,
    the slope and crags (`th165Hs`). Dressing (`th165Build`): stairs with cheek walls, flagstones, parapets, rope rails, serpent
    pillars, a signpost, hitching rail and trough, a wayshrine, prayer flags, the Pilgrims' Gate (towers, voussoir arch, keystone),
    gorge boulders, pines, scree, a waterfall into a tarn (`th165Falls`) and a snow peak shown only from the trail (`th165Peak`). The
    v153 gateway's spot is the top of the stair (`G.where`). Decorations keep off (`th165Keep`, 1680).
- **Burningeye Summit main quest (v151, `3150`–`3170`)**: the ice zone's three chapters, one per field instance. Each replaces the
  instance's end gateway (the old `RPORT` record stays, its model is hidden and its prompt replaced) and is done also when the next
  instance has been reached (`insReach(2)`), so heroes who are already further on are never blocked. Every scene is built lazily the
  first time the hero is in its instance and hidden elsewhere; the solid tiles (`CBLK`) are registered at load (`mq151Solid`,
  `mq160Solid`, `mq170Solid`) so Cheddar's gateway spot and the roaming creatures see them; `mq151Keep` / `mq160Keep` / `mq170Keep` keep
  1680's decorations off them. Trackers use `#mqt143` (class `z2`). Co-op (`3180`, `CO151`): shared. Gorthrak is one troll: the
  driver `gb180Drv()` (lowest peer id among the standing heroes in the cave who have him, presence `g1`) runs his AI and relays
  each cast with its seed (`['g1c',…]`) and his health / phase / spot every 120 ms (`['g1s',…]`); partners play the same moves on
  their copy, glide to his spot between moves (`gb180Glide`) and send their damage to the driver (`['g1h',dmg]`); his kill is
  everyone's (`['g1k']`), a partner whose own Gorthrak is slain fights a visiting copy (`e.gbV`). The gate melt and the drill
  run on the region host (`co151Host()`): partners ask to start (`f2rq` / `d3rq`), one hero carries the flamespitter at a time
  (`f2c`), the carrier's flame goes to the host (`f2f`, spider burns `f2k`), the host sends the state (`f2e` / `d3e`); anyone
  switches on or repairs any box (`d3o`); spiders and wreckers are the host's shared monsters and hunt the nearest hero. An
  event is lost only when every hero in the instance is down. Progress (a slain Gorthrak, each part, the assembly, the gate,
  the drill) is credited to every player in the game (`['bq151',key]`, sent 3×).
  * **I · The Frozen Maw** (`3150` model, `3151` moves, `3152` cave and quest): the road ends at an ice cave mouth (`gb151CaveMouth`: a
    cliff of rocks, an arch hung with icicles, a dark throat, a troll totem). F: into the Frozen Maw = Burningeye's Wave Trial instance
    (`INSL[14]`, renamed, Lv 21, its own dim blue atmosphere `TH112.byG[14]`; the old trial's war-camp dressing `ARK_TRIAL[2]` is
    removed): frozen floor with ice veins, rock and crystal walls, icicles, frozen falls, a mammoth in a block of ice, the throne of ice
    and bone, the passage at the back sealed by a wall of ice (v168: the six ice pillars are gone; the openings are `gb168Cave`). **Gorthrak the Glacierback**: a towering warlord troll,
    nothing like the zone's blue Frost Trolls (dark umber hide, red war paint, white mane, a glacier of crystals on his back, a mammoth
    skull pauldron, the Glacier Maul and the Rime Fist; ~34k triangles, `GB151.tris`). Built and fought like Vorraxis
    (`docs/BOSS_RECIPE.md`): Sovereign engine moves (Skullbreaker, Glacier Charge, Wrecking Whirl, Cave-in Roar, Glacier Hurl,
    Permafrost Slam; Phase II at 55% Glacial Fury: the ceiling keeps dropping icicles (`gb151Quake`), Warlord's Fury, Avalanche Hurl,
    Icefall Storm), springs on ears and loincloth, posture bar. **Frostbite** (`gb151Frost`): frost hits stack on the hero; the third
    freezes you solid for 1.3 s (dash out). **Rimelock** (v168, replaced the ice pillars): his maul frozen in the floor, the
    crack on his back glows, hits from behind ×1.5; a missed Glacier Charge skids into it. **Glacier Shell** (v168, was the Glacial
    Rampage; signature): 85% damage reduction while his shell holds and his troll blood heals him; three leaps, each Rimelocks him:
    two hits on his back crack the shell; three cracks = SHATTERED (long stagger) at once; fewer = he heals 12% and the ceiling
    comes down (Avalanche: only the three rock shelters at the wall are safe). When he dies the ice over the passage bursts: F takes you to II.
    `MQ151.st` 0 · 1 entered · 2 slain · 3 through; saved as `x2.mq151 {st,seen}`; a save in the cave loads at the cave mouth.
  * **II · The Frozen Gate** (`3160`): a great stone gate filled with ancient ice stands where the gateway was, a workbench beside it.
    Three flamespitter parts (Essence Core, Ember Nozzle, Bellows Tank) lie in salvage caches off II's road (`mq160Plan`, orange
    beacons), each guarded by an elite warden (Frost Wendigo, Frost Troll, Rimeshell Crawler, Lv 24) that rises when you come near.
    F at the bench assembles the **essence-charged flamespitter**; F again starts **the melt** (`MQ160.E`), which cannot be stopped: the
    hero is held in the gate yard (leash 15.5), recall and mounts are blocked, and a death ends it (the gate freezes over, the
    flamespitter goes back on the bench). C (the Character key during the melt, or F / tapping the prompt) picks it up and drops it;
    carrying it you are slower and cannot swing or cast, and both hands hold its grips (arm IK `fs160Hold`). Hold the left button to
    spray where you aim: on the gate it melts (60 s of flame); 5 s of spraying overheats it and it must cool right down (4 s). Ice
    spiders (`EN.icespider`, rig `Iceskitter`) come from all round the yard all the time, faster as the melt goes on, and always hunt
    you. v166: **twice as many** (two or more per spawn, up to 32 alive, 40 in co-op: `MQ160.cap` / `capC`), and the flame no
    longer one-hits them: it burns every spider in it once every 0.3 s (`fs160Burn`, host only; a partner's flame sends `f2k`),
    each burn 36% of the spider's health (3 burns). The **essence charge** (the 💠 bar, 100) is a bonus: while it lasts each burn
    blazes for 55% (2 burns) and costs 4 charge; it refills 5 a second while the flamespitter is not spraying. Empty, the flame
    still burns at the normal rate (before v166 an empty charge made the flame stop killing spiders: the bug). HUD `#fs160` says so.
    `MQ160.st` 0 parts · 1 all parts · 2 assembled · 3 open; saved as `x2.mq160 {st,p,fd}`.
  * **III · The Mountain Drill** (`3170`): the road to the Den ends at a sheer cliff with a great essence drill against it, wired to
    four control boxes. F at the console starts **the drill** (`MQ170.E`; held in the yard, no recall, a death ends it): 90 s of
    boring at full speed with all four boxes lit. v168 (owner): with boxes offline it keeps boring, only slower: ×0.4 for each box
    offline (`MQ170.slow`, `dr170Rate`: 100% · 40% · 16% · 6.4%), and with no box running it has no power; the HUD (`#dr170h`) and the
    tracker say the speed in plain words. Boxes start dark (F switches each on); running boxes **freeze** or **malfunction** on their
    own, and **Frost Troll wreckers** (`dr170Troll`) walk to a box, raise their fists over it (a warning ring) and **smash** it (hit one
    and it turns on you). v168: the mini-game windows are gone; each fix is timed work at the box (`dr170Open` → `dr170WTick`,
    `MQ170.rt`) with its own tool and motion (`DR170W`, body tracks `DR170_T`, the hands put on the tool by arm IK in `dr170Aim`) and a
    ring over the box (`#dr170r`): **Thaw** 3 s (a lit torch waved over the ice, which melts down and steams), **Rewire** 6 s (on one
    knee with a spanner, pushing the three loose cables up into their sockets one by one), **Rebuild** 10 s (a hammer: the cabinet is
    knocked upright, then the panel, the gauges and the lever jump back into place). The game keeps going while you work; moving, a
    dodge or Esc steps away and a hit knocks you away, but the work done stays (`E.box[i].rp`) and F carries on; the box changing state
    starts it afresh. Bored through, the cliff bursts open on a tunnel to the Den. `MQ170.st` 0 · 1 open; saved as `x2.mq170 {st}`.
  Tests: `v151_frozen_maw.py`, `v160_frozen_gate.py`, `v170_mountain_drill.py`, `v151_coop.py` (two windows); model sheets `v143_look.py PROPS=gorthrak,gorthrakShell,
  fgate,fbench,fspitter,fcache,ddrill2,dbox,dbox2,dbox3` and `PROPS=gbP:<pose>` (a trailing `+` shows the Rampage shell); the repairs'
  pictures `v168_drill_look.py` (VIEWS=thaw,wire,rebuild,strike,hud).
- **Searing Sands main quest (v165, `3270`–`3305`)**: the owner's design, one chapter per field instance; none of the three gateway
  portals is used any more (`ss165HidePortals`). Shared state `SS165` (`c1` dig / Qarsul, `c2` urns / pieces / Kheprit / rift, `c3`
  columns / parts / build, `run`), saved as `x2.ss165` (old saves load with nothing done; a chapter also counts as done when the next
  instance has been reached, `ss165Done`). Each chapter's frame is `ss165F(k)` at its gateway clearing (`W2`/`L2`: a along the way out,
  b across). Tracker lines `SP152.trk.sands`. Map/terrain/keep hooks: `ss165Map` and `ss165Terrain` (0045), `ss165Keep` (1680).
  * **I · The Buried Temple (`3271`–`3274`)**: the temple entrance lies under a dune at the end of the road (`ss165T1`, `sd165Build`).
    F digs (the gathering spade and motion, `sd165Start/Next`): each stroke scoops the dune's height grid (`SD165.D`, `sd165Stroke`
    with slumping), the spoil flies onto three heaps that grow (`sd165Heaps`), the strokes are saved (`c1.dig`, packed, replayed on
    load). Cleared (`ss165DigP` ≥ `SD165.done`): the heaps rise as **Qarsul, the Living Dune** (mini boss to the Vorraxis standard:
    model `3272`, moves `3273` `QS165MV`, fight `3274`): a sand wall closes the yard, no recall or mounts (`qs165Held`); phase II
    sandstorm with dust devils; the Heart of the Dune shell game (three mounds, seeded swaps: break the right one); slabs and the
    Sandstorm Burial. A wipe puts him back in the heaps; he rises again when a hero returns. Slain: the doors open (`sd165Open`), F
    enters II. Test `v165_temple.py`.
  * **II · The Last Warden (`3280`–`3283`)**: a walled temple court (`ss165T2`, `cy165Build`: mosaic floor, colonnade, gate pylons,
    obelisks, ant statues, the dais and altar, the rift horns). 14 urns (`kh165Urns`: hidden-model adds, 3 blows break one) hold the 11
    pieces of **Kheprit** (model `3281`, an ant-headed six-legged warden; `kh165PartShow`/`kh165PartMesh`), two hold scarab nests.
    Pieces lie glowing where their urn stood (walk over them); F at the altar lays them (`kh165LayAll`, one rig in the `laid` pose).
    All 11: he wakes (`kh165Wake`, ~9 s) and steps down; F speaks (`XR.kh165`). "Begin" starts the rift (`3283`, `RF165`): he
    channels 60 s (`RF165.T`) by the horns (a swirl shader `rf165Rift`), cultists (`ss165zealot`, `ss165caller`) pour in through
    the gates, about half go for him (`eTarget`/`hitTarget` wrappers with a proxy target `e.rfP`), a pulse throws them back every
    12 s; his health is the bar at the top (`#rf165H`). At zero the rift collapses (retry by speaking again). Open: run in before he
    falls (`rf165Enter` → III). Afterwards (`rf165After`): he lies dead by the rift among ~320 cultist bodies (`RF165|bodies`), the
    rift stays open as the way on. Test `v165_courtyard.py`.
  * **III · The Sandskimmer (`3290`–`3292`)**: five salt columns by the road (`sc165Spots`) each hold a part (`SK165.parts`); F mines
    with the pick (9 blows, `SC165.N`; the 6th breaks a Salt Golem loose), the part drops free. The machine (`3291`, `sk165Build`:
    hull, ram prow, skis, turbine, twin-cannon turret, helm) stands bare on its cradle in the salt-cutters' yard (`cs165Build`) at the
    clearing's end, where the rim is cut away (`ss165T3Map/Terrain`) over a desert vista only seen from III (`ss165Vista`: hand-shaded
    dunes, mesas, the Den's peak, a storm wall). With all five, F builds it (`cs165Assemble`); F boards it (`cs165Board`).
  * **The Sandstorm Run (`3300`–`3302`, special instance `sandrun`, g 32, x 714–1174, y 1452–2022)**: a ~1580-tile course
    (`sr165Path`, Catmull-Rom through `sr165Cfg().cp`) between dune walls (`sr165Map`/`sr165Terrain`, called from 3150's hooks;
    `freeSpot` skips the region so older worlds' secrets stay put), boulders, salt spires and sand traps (`sr165Obs`), checkpoints at
    ¼ ½ ¾ (`sr165CPs`), the Den's cave at the end. The machine's physics `sr165Drive` (W/S, A/D, Shift boost); solo, Cheddar drives
    (`sr165Auto`: lane planner over the hazards ahead, boosts on clear straights) and the hero fires the turret (mouse aim with assist,
    left button: `sr165Aim`/`sr165Fire`). Foes (`3302`, host-run, their own AI): scarab swarms that cling (boost flings them), scorpions
    that spit venom where you are going, worms that arc over the course. Wrecked → the last checkpoint. The cave → the Den
    (`sr165Win`, `SS165.run.st`); later rides from the yard go straight there. 🏳 turns back. Test `v165_run.py` (~105 s run).
  * **Co-op (`3305`)**: every chapter is shared (messages `s5…`/`q1…`): strokes and the uncovering; Qarsul with one driver (moves with
    seeds, health sync, partners' damage to the driver, mounds); urns, pieces, laying, waking; the host runs the rift; columns, parts,
    the build; the Run's crews (two to a machine, the boarder drives; an odd one out shoots with Cheddar driving), each machine
    simulated by its driver and sent 10×/s, shots shown everywhere, creatures' damage from the host, first into the cave takes all.
    Credit for the group: `['bq165', c1|c2|c3|run]`. Test `v165_coop.py` (mpt).
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
- **Camps, bigger and set into the land (v164, `3240`–`3242`)**: owner: "make each camp much larger and make them feel more integrated
  in the map with much more detail, structures and landscape and accessories."
  * *Size and spot* (`cs164Sites`, a pure function of the map data, cached): each camp wants `cs164Rd(r123)` = 1.9 r + 2 (18..30 tiles;
    v123's 8..16). What fits is worked out against the instance edge (10 tiles kept), the gateway clearing, the entrance, the Lantern
    Road outpost and the other camps (crowded pairs give back what they grew, in proportion; 8 tiles between rings). A camp that can't
    reach its size moves up to 21 tiles (36 when it could hardly grow) to open ground (moves cost a little; Kindlelight II's furthest camp stays the furthest, so
    `mq144Camp` is still the Glowmire Warren). The record in `I.cl` is moved in place (like `mq151MoveCamp`). Result: 51 of 54 camps
    are 1.5–2.3× their v123 radius (most at the full 1.9×+2); Cliffside Lair, Frozen Hollow, Sunken Ossuary, Bleached Oasis and a few
    others are boxed in by cliffs, the gateway or a neighbour and grow less (never smaller than v123).
  * *Clearing* (`cs164Grow`, from 0045 after `v112Map`): a lobed walkable clearing (r + 2) at the final spot, the trail to the road,
    the rim redrawn behind it, water and harvest nodes cleared inside.
  * *Rings*: the core `C.rc` (≈ r123..1.15 r123) holds the v123 design (built unchanged by `cs123Build` with `C.r = C.rc`); the
    settlement ring out to the fence `C.rf` (≈ .8 r) holds dwellings, works and filler; the outskirts out to r + 5 hold towers,
    lanterns, banners, cairns and the zone's own scenery (trees, fungus, pines, cacti, dead trees, ruins…), thinning into the land.
  * *Ground* (`cs123Terrain` replaced): the v123 shape on the core, the settlement ring levelled (lighter than the core), the fort's
    earth bank and a shallow ditch outside it (gaps at every gate), hummocks in the outskirts, blended into the natural ground out to
    r + 7; a ramp along the trail. Wet camps sink by their core's lowest ground. *Tiles* (`cs123Map` replaced): the core keeps its
    v123 tile, trodden bare ground and dirt fade into the land toward the edge, dirt paths from every gate to the heart, the trail.
  * *Gates and trails* (`cs164Gates`): where the road (or a side branch) crosses the fence ring the fence opens; a camp the road
    misses gets a gate toward the nearest road point, a back gate, and a trail out to the road when it is more than a few tiles away
    (only over open ground). `cs164Keep` (1680 `place`) keeps decorations off trails.
  * *Dressing* (`cs164Dress`, recipes `cs164Rec` per camp key: fort kind, dwellings, works, outskirts, clutter, light colours; palettes
    `cs164Pal` per zone/instance): bonfire with log seats (the main light), halls, huts, yurts, snow huts, stilt houses, pavilions,
    tents with guy ropes, lean-tos, tombs, kennels, burrows; spits, racks, forges, stores, bedroll circles, woodpiles, targets, totems,
    altars, cages, meat racks, carts, nets, boats, graves, pyres, statues; rope lines with pennants between dwellings; boardwalks in wet
    camps; the fence (palisade with rails and the odd skull, stake lines, dry-stone, ruined walls, ice, iron railings, bone, hedge,
    roots, reeds) with breaches; gates with posts and lintel or an arch, braziers, a banner and, for wooden forts, two watchtowers.
    Seeded from the camp (`C.seed`); nothing on the road, the trail or the main quests' keep-out spots (`mq143Keep`, `mq145Keep`…).
  * *Performance* (`cs164Merge`): every static part is baked with its colour into vertex colours and merged per material *kind*
    (shared materials `CS164.M`: lit / metal / glow strength / transparency), so a camp is ~6–16 draw calls (v123: 6–42) for ~10–65k
    triangles; build ~10–150 ms (once, lazily, as before). Breakable boxes: at most `CS164.box` (10) per camp, each merged per look;
    extra crates are scenery. Lights: 1–2 per camp (bonfire, gate brazier) as plain scene point lights (the v98 pool picks the
    nearest 4), on only while the camp is shown and within 70 tiles. Far cull (v111) and frozen matrices work on the camp group as
    before.
  * *Gameplay*: `C.r` is the v164 radius (`campAt`, the zone map circle, box breaking, the title card, the roaming-group and decoration
    keep-out rings via `CAMPS_PRE`/`cs123Rad`); `C.r0` the v123 one; garrison spread `C.sp` = .42 r (6.5..12, was .62 r 4.5..9.5).
    Sigils (3040), the Frozen Gate caches (3160) and the Hydra door's chime stones (3170) avoid camp radius + 3 (`cs164Avoid`); v124
    groves keep r + 6 away. Tests: `python3 probe.py v164_camps.js` (sizes, moves, draw calls, triangles, lights, reachability of
    every camp's walkable ground, chest spot and garrison spots), `v164_shots.py` (overview `_a` and ground-level `_g` pictures,
    `ZONES= KS= JS= VIEWS= TAG=`).
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
**Retries and steady tests (Oct 27 2026, owner: "make you complete tasks faster")**: a failed test runs once more (`test/ci_run.py`,
`CI_RETRY`, default 1; each try's browsers are killed by their `KQ_ATT` marker); a pass on the second try counts and shows as
`PASS (retry)` (Summary: "N only on a second try"). `CI_RETRY=0` to see whether a test is steady. The browser install on GitHub is
cut off after 7 min and tried up to 3 times (it once hung for a job's whole hour); `tools/ci.sh` now also lists cancelled jobs and
names the step that failed when a job left no test output. Fixed that day (both kept every check):
- *Two-player tests*: the game advances at most 0.05 s per frame, so fixed real-time waits saw far less game time on slow runners.
  They now wait for conditions with generous deadlines. `test/mpt.py` waits for the server port, each creation step and both windows
  seeing each other; helpers `mp_until`, `mp_roles` (same instance, agreed host), `mp_fps`; `SLOW=<n>` slows both windows' CPU n× to
  try a test the way a slow machine runs it. `fakeroom.js` keeps a quiet peer 30 s (was 4 s: a window busy building an instance
  dropped out and the host changed mid-test); `fakesig.js` waits 4 s for a slow window to answer.
- *v141_sov*: melee fights last `MEL` s (3 × SEC); per boss new ≥ old − 1 different moves, plus a stricter all-boss check (new ≥ old
  + 1 per boss); the kiting fight goes on (up to 3 × SEC) until Reach is used (hits still counted over SEC). *v119_abprev*: an
  ability that should hit and didn't gets up to 4 more preview loops (Comet Storm's 8 comets land at random). *v117_wclip*:
  `Math.random` seeded while measuring (`SEED`, default 1). *v137_evolve*: the Cleave comparison rolls no crits and a fixed spread.
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
python3 v163_elements.py     # v163: element buildup, priming, reactions, tug of war, drain, companion rule, bar look (SHOT=1 pictures)
python3 v163_fixes.py        # v163: Reset placement, desktop trackers, title cards, attack aim, Sovereign signatures, Argus' eyes
python3 v163_weapons.py      # v163: no weapon spins in the hand (every class and weapon, a monster nearby; CLS=, MAXF=, MAXW=)
WRAP=1 SIZES=cs python3 v161_mobile_shot.py   # v163: the phone layout as claude.ai serves the page (wrapped)
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
python3 v165_dirge.py        # v165: The Dirge main quest: graves, the Sanctum's traps and puzzles, the raft, the prisms, saves
python3 v165_dirge_coop.py   # v165: the Dirge main quest in co-op (two windows)
python3 v151_frozen_maw.py    # v151: The Frozen Maw (Burningeye I): the cave mouth (v168: openings clear), Gorthrak, Rimelock and the Glacier Shell (v168), Frostbite, Phase II, the Rampage both ways, the passage, saves
python3 v160_frozen_gate.py   # v151: The Frozen Gate (Burningeye II): caches and wardens, the flamespitter, the melt (carry, spray, overheat, spiders x2, burns, charge bonus/refill), saves
python3 v170_mountain_drill.py # v151: The Mountain Drill (Burningeye III): boxes, failures, speed per box offline, the three timed repairs, troll wreckers, the bore, the tunnel, saves
python3 v151_coop.py          # v151: the three chapters with two players (shared Gorthrak, shared melt and carrier, shared drill and repairs, credit)
python3 v168_tiers.py         # v168: terraced camps have a flat top (the Serpent Shrine's idol no longer stands on a cone)
VIEWS=mouth,rlk python3 v168_look.py   # v168 pictures: the ice cave openings, Rimelock, the Serpent Shrine (AW_TMP=<dir>)
python3 v169_seethrough.py    # v169: see-through walls: the hero through a cave wall, the void past an edge black, the renderer left clean
VIEWS=cave,abhouse ALT=1 python3 v169_ghost_look.py   # v169 pictures: house, housein, cave, edge, edge3, edgein, dusk, abeksi, abhouse
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
* **Companions**: every species, its 4 evolution looks, basic attack and its 4 abilities. Since v150 the 14 higher-tier species that used to be
  recoloured lower tiers show their own bodies (3110–3140), and the bats (Batwing, Duskwing, Blood Bat) have wings and hind legs only.
* **Monsters**: every creature that can spawn, grouped by the zone it lives in (the bestiary's `dex141Where`), plus quest
  creatures (the ghost wolf), and each of its moves (basic + signature moves, red warnings shown).
* **Bosses**: the six Sovereigns, each in its own den with the real fight started, and the main-quest bosses in their own arenas:
  Vorraxis in the Seeping Lair, Gorthrak in the Frozen Maw (Burningeye Summit I's ice cave) and Qarsul in the Sunken Gate's yard
  (Searing Sands I: the viewer marks the dig done, `SS165.c1.st` 2, and he forms out of the heaps for real; his Heart of the Dune's
  16 s wait under the sand, `hidden`, is not listed on its own, it plays inside the signature). Moves that only happen inside another
  are listed after it (`BOSSFOL` / `BOSSSUB`: Gorthrak's skid after a missed charge, a single Glacier Shell leap, the shell holding;
  Qarsul's time-out). Phase II moves switch the place too (Gorthrak's falling ice, Qarsul's storm), like the Sovereigns' dens.
  The Monsters tab lists quest-only creatures (`QMON`: ghost wolf, ice spider, the rift cultists, drowned wretch) apart from
  "Other creatures" (no zone field or camp has them now: the old roster).
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
Rebuild and republish it after changing models, attacks, abilities or bosses: read the live page (~100 KB, Artifact `read`
with no `path`), then publish `dist/viewer/index.html` with `files: {"game.js": "dist/viewer/game.js"}` and `url` = the URL above.
