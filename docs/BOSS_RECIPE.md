# Boss fight recipe (the Vorraxis standard)

The owner's reference for every new boss and mini boss: **Vorraxis, the Seeping King** (v144, Kindlelight II, the Seeping Lair).
Files: `src/js/3031-v144-vorraxis-model.js` (model, poses, animation), `3032-v144-vorraxis-moves.js` (moves),
`3033-v144-glowmire-lair.js` (lair, fight controller, mechanics, quest). Read those three files before building a new boss: copy
their structure and change the content.

**Copy the method, not the theme.** Everything about ooze, acid, scales, the crystal, the flood and the goo cave belongs to Vorraxis
only: it is the worked example. Every new boss gets its own theme (from the owner's request and the zone), its own look, moves,
debuff, arena and signature mechanic, built with the same structure and to the same standard of polish. The fight should match this standard: a readable pattern, telegraphed moves, a phase change
that changes the arena, one signature mechanic the player must answer, and a model and animations polished enough to sell it.

## 1. Design the fight on paper first

Write the pattern as a comment block at the top of the moves file (see 3032), before any code:

- **A theme that drives everything.** Vorraxis = caustic ooze. His model (ooze seeping between scales), his moves (pools, geysers,
  spines, lanes), his debuff (Caustic), his arena (goo cave) and his phase change (the lair floods) all come from it.
- **6 Phase I moves, each with its own job and its own answer**, chosen by range and side so the player can learn them:
  - close front: a multi-hit melee combo (Scythe Rend: two cuts, a pause, a late crossing cut that punishes early dodges);
  - mid front: a gap closer that leaves hazards (Caustic Lunge: dash through you, acid pools on the path);
  - behind / side: an anti-flank move (Tail Lash: a ring; stand very close or far out);
  - any range: an aimed ground attack that leads the player (Ooze Geyser: 3 geysers aimed ahead of the hero's movement, using
    the hero's velocity `S.hv`);
  - far front: a ranged punish (Spine Volley: a fan with gaps to stand in);
  - close any: an area denial "get out" move with a second beat (Carapace Burst: close blast, 8 lanes, then 8 more in the gaps).
- **Phase II at 55% health** with a dramatic transition move (`awaken`: armoured, invulnerable, roar, title card) that **changes the
  arena** (the edge floods and burns) and swaps in harder versions (5-hit combo, eruption ring, double volley). He rests less.
- **One signature mechanic** that is a puzzle, not just damage: Crystal Siphon. He leaps to the dais and drinks from the crystal
  (80% damage reduction, a beam into his chest). Three Ooze Sacs swell around the lair. Burst all three in time and he is torn out
  of it into a long stagger (a big reward window). Fail and he heals, stone islands rise, and the Deluge floods the floor: only the
  islands are safe. Success and failure both stay exciting.
- **A weakness:** posture (the yellow bar under the health bar). Breaking it staggers him (+35% damage). Big moves have armour.
- **Fairness rules:** every hit has a ground warning (`svWarn`) long enough to react (melee ~.32 s, big moves ~.9 s); no move
  repeats twice in a row (svPick); cooldowns per move; a rest after each move (the punish window).

## 2. The model (3031)

- Built like a Sovereign: rigid parts hung on **named joints** (`svRig`, `svJ`, `svM`, `svLoft`/`svLoftZ`, `svTube`, `svHorn`,
  `svLump`, `svBlade`, `svSpr`), then `svRest` and `svMerge` (merges parts per joint and material for fewer draw calls).
- **Joint list in the header comment** (root, hips, spine, chest, neck, head, jaw L/R, shoulder/elbow/blade/wrist L/R, thigh/knee/
  hock/foot L/R, tail0–5). Left = +x.
- **Detail budget:** about 2× the triangles of the normal creature it is based on. Measure, don't guess: `MB144.tris` counts them on
  the first build (Vorraxis came out at ~28k). The tests print it.
- **Surface detail that sells the theme:** an emissive ooze core wrapped in **shingled shield-scales** (`mb144Cover`: rows of curved
  scales laid down a loft, each turned to the surface, gaps showing the glowing core). Scale **patterns** (`MB144.pat`: chevrons on
  the back, rings on the limbs, tiger stripes on the tail) pick black / olive / bone materials per scale. Bone-tipped spikes, compound
  eyes (sprites), drool and drips.
- **Living materials:** `mb144Post` pulses the ooze emissive with breathing, brighter in Phase II and while charging (`S.chg`), and
  spawns drip particles.
- Keep geometries in the `svG` cache (one geometry per key). Don't call `.toNonIndexed()` on geometries that are already non-indexed
  (octahedrons, icosahedrons): three.js logs a warning and the roster test fails on it.

## 3. Poses and animation (3031)

- **A pose table** (`MB144P`): each pose is offsets `[rx,ry,rz,px,py,pz]` per joint from the rest pose; `'~'` mirrors left/right.
  Vorraxis has ~24: idle, wind-ups and strikes for each arm (`rUp/rCut`, `lUp/lCut`, `xUp/xCut`), lunge low/go/bite, tail wind/whip,
  ground-stab, arch/snap (volley), curl/burst, roar, siphon, leap, stagger, dead.
- **Moves play tracks** `[time, pose, ease, tremble]`: hold a wind-up with a small tremble (`'l', .02`) so the player sees it
  coming, snap the strike with ease `'o'`, then recover (`cRec`). Anticipation → strike → follow-through → recovery.
- **Procedural layer** (`mb144Loco`): breathing, a digitigrade walk cycle driven by the real speed (`S.spd`), tail wave, head
  tracking the hero, mandible twitch. It runs under every move, so he never freezes.
- **Death** (`B.die` track) and **stagger** (`B.stag`, plus `svStagDef`) are poses too.

## 4. The moves (3032)

Sovereign move format (see the comment above `svStart` in `1970-v110-sov-core.js`):
`{dur, trk, trn, rm, hit:[{t, s:{k:'c'|'r'|'a'|'l'}, f, ay, o, dm, w, kb, fx, nohit}], ev, tr, tk, go, end, armor, inv, r, a, wt, cd,
ph, ph1only, nx, rec, mel}`.

- `r` range and `a` side ('f' front, 'b' behind, 's' side, 'sb', 'any') decide when a move can be picked; `wt` can be a function of
  distance/side; `nx` chains combos.
- Hit shapes: circle, rectangle (lanes), arc, line. `w` = warning lead time. `fx` spawns the visuals (pools, geysers, shockwaves).
- Wrap every move in `MB144_NO141(...)` (keeps the v141 wind-up speed-up off: the timings are designed as they are).
- Effects kit used: `svWarn`, `svFlash`, `svTrail` (blade trails), `svShock`, `svDecal`, `svShot`, `s6Pool` (damaging pools with
  a debuff), `burst`, `shake`, `svSnd` (sounds: roar, hiss, squelch, splash, crack, charge, heavy, bell…), `zt116Show` (title cards).

## 5. The arena and the controller (3033)

- **A themed arena** with set dressing that tells the story: painted floor texture with glowing veins (emissive map), boulder walls,
  stalagmites, ooze falls and pools, fungus, husks of earlier victims, the dais with the prize (the floating crystal in an ooze
  shell). Up to 2–3 point lights (they are pooled: `PGL`, 4 total). Hide everything outside the instance.
- **Own controller instead of a den** (an `eTick` wrapper returns true for `e.mb144`): waits at home and heals until the hero comes
  within 9.5 or hits him → `mb144Start` (title card, the exit seals with ooze, recall blocked). Then: tick the current move, cast
  `awaken` at 55%, otherwise move (`mb144Move`: close to preferred range, strafe, back off when crowded) and `svPick` a move when the
  rest runs out. Clamp him and the hero to the arena; push the hero out of his body.
- **Reset** on a wipe or leaving (full health, Phase I, flood off, adds and islands removed). **Win** (`kill` wrapper): the shell
  bursts, title card, the prize can be claimed (F).
- **HUD:** reuse `#boss` (name · title · phase) and add the posture bar.
- **Adds as mechanics, not filler:** the Ooze Sacs are ordinary enemies with a hidden model and their own look, no AI (`eTick`
  returns true), and a custom kill (`kill` wrapper → `mb144SacPop`, no loot/XP). Note: `hurt_base` sets `e.dead=1` *before* calling
  `kill`, so a custom kill handler must not bail out on `e.dead` (use its own flag, like `s.popped`).
- **Engine glue** (when the boss is not in a Sovereign den): wrap `svCtx` (arena clamp + hit test) and `svHitNow` (skip the den flag
  `AF`) for that boss only; don't set `e.ar`. `e.boss=1` keeps it local in co-op.
- **Saves:** quest state in `x2Save`/`x2Load`; old saves must load; a save made inside the arena loads outside it.

## 6. Checking it

- **Pictures first**, before tuning: `test/v143_look.py` with `PROPS=` (model sheets: front, side, back, close-ups) and
  `bossP:<pose>` for each pose. Fix proportions and silhouettes from the pictures (the first Vorraxis render had too much glow,
  sparse scales, a tail pointing up, a small head and scythes curving the wrong way).
- **Also look at the arena in game** from the entrance, beside the boss, and from above, and look for leftovers from whatever
  the space was before (the lair is the old Wave Trial: its red "Leave trial" portal had to be hidden).
- **A focused test** like `test/v144_glowmire.py`: the arena builds, the boss spawns (level, triangle count), the fight starts and
  seals, **every move runs to its end without errors**, Phase II and the arena change, the signature mechanic both ways (succeed →
  stagger; the shield works), reset on a wipe, the kill, the reward, saves (round trip, old saves, saves made inside).
  Add it to `test/full.txt` and `test/affects.txt`.

## 7. Checklist for the next boss

1. Theme, the 6 + Phase II moves, the signature mechanic, the weakness, all written as the moves file's header comment.
2. Model (~2× the base creature's triangles, measured), joint list, living materials.
3. Pose table, tracks with anticipation/tremble/recovery, the procedural layer, stagger and death.
4. Moves in the Sovereign format with warnings, ranges, sides, weights, cooldowns, combos.
5. Arena dressing, controller (start/seal/reset/win), HUD, adds, rewards, saves.
6. Pictures → fix → focused test → `run_suite.py changed` → publish.
