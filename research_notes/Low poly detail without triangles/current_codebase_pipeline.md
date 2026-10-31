# Current Kill Quest enemy-model pipeline: rendering, colour, lighting and skinning (codebase investigation)

Scope: read-only look at /home/user/Ashen-wilds at commit `de260d0` ("v181: rebuild with all four restored batches").
Sources are file:line references in this repo (paths relative to the repo root). Source files are concatenated in
file-name order into one script (`build.sh`), so later files patch earlier ones.

## 1. Materials used by enemy models

### Takeaway
Every enemy body (old md humanoids, v81 creature rigs, and the new v181 cage bodies) uses a **small shared set of
`MeshStandardMaterial`s with `vertexColors:true`, `flatShading:true`, `skinning:true`**, plus a `MeshBasicMaterial` for
glowing parts. All humanoid foes share ONE material per layer (cloth/skin 'c', metal 'm', glow 'g'), so a whole enemy is
1–3 skinned draw calls and all foes share shader programs. A global style pass forces flat shading on every lit material.

### Cited Findings
- md toolkit shared materials (foes and town folk; heroes get clones): `c` = MeshStandard roughness .92 metalness 0 DoubleSide; `m` = MeshStandard roughness .48 metalness .5 DoubleSide; `g` = MeshBasic; all `vertexColors:true`, `flatShading:true` (Basic has no flat flag), `skinning:true`; cached once in `MDL.M` — [src/js/1400-v94-model-track-clean-low-poly.js:20-24](src/js/1400-v94-model-track-clean-low-poly.js)
- Heroes get their own clones (`mdOwnMats`, `userData.mdOwn`) — [1400:25](src/js/1400-v94-model-track-clean-low-poly.js)
- The design rule written into the v94 header: "few smooth lofted shapes, flat shading, crisp per-face colour regions (no random jitter, no per-vertex mottling) and a small, coherent palette per character"; geometry merged "into at most three geometries per model — cloth/skin ('c'), metal ('m'), glow ('g') — so a whole character is one to three draw calls (+ its weapons)" — [1400:1-12](src/js/1400-v94-model-track-clean-low-poly.js)
- Humanoid foe assembly: the body SkinnedMesh gets `G.c` + `M.c` (shared), and separate SkinnedMeshes for `m` and `g` bound to the same skeleton; `castShadow` on c and m, not g; `frustumCulled=false` on m/g — [src/js/1450-v94-model-track-humanoid-foes-humanoid.js:107-112](src/js/1450-v94-model-track-humanoid-foes-humanoid.js)
- v54 faceted restyle (older path, still the base `mkHumanoid`): `dkM()` = MeshStandard c (rough .9, metal .04), m (rough .4, metal .62), MeshBasic g, plus static (non-skinned) variants sc/sm/sg; all vertexColors + flatShading — [src/js/0470-v54-dark-restyle-character-rebuilt-faceted.js:4-7](src/js/0470-v54-dark-restyle-character-rebuilt-faceted.js); `mkHumanoid` defined at [0470:202](src/js/0470-v54-dark-restyle-character-rebuilt-faceted.js) and wrapped by many later files (0010:65, 0800:75, 0890:300, 1270:91, 1450:107, 2000:145, 3381:36, 3390:19, 3391:28).
- v81 creature toolkit materials: `LPMT[k]` cache of MeshStandard `{vertexColors, flatShading, roughness .95, metalness 0, skinning, DoubleSide}`, emissive only for 'Ember'/'Golden' variants (0x2a0c00 / 0x2a1e00) — [src/js/0610-v81-low-poly-creature-toolkit-valheim.js:42-43](src/js/0610-v81-low-poly-creature-toolkit-valheim.js)
- Sovereign/boss kit (`svMat`): MeshStandard `{color, roughness .82, metalness .08, flatShading:true}` per part colour (uniform colour, not vertex colours), stored in `R.mats` so emissive can be animated; `svGlowMat` = MeshBasic fog:false — [src/js/1970-v110-sov-core.js:66-67](src/js/1970-v110-sov-core.js). Vorraxis's ooze material uses `emissive` + `emissiveIntensity:.5`, pulsed by `mb144Post` — [src/js/3031-v144-vorraxis-model.js:48](src/js/3031-v144-vorraxis-model.js), [docs/BOSS_RECIPE.md:47-48](docs/BOSS_RECIPE.md)
- Global v83 style pass `lpsMat`: any MeshStandard/Phong/Lambert material not tagged `userData.lps`/`lpsSkip` gets `flatShading=true`, and a **CanvasTexture normalMap is removed** (`m.normalMap=null`); runs on everything added to the scene (Object3D.add hook, flushed every 100 ms, sweep every 2.5 s) — [src/js/0750-v83-low-poly-look-whole-world.js:1-27](src/js/0750-v83-low-poly-look-whole-world.js)
- Emissive on regular enemies: none on md materials (glow is a separate MeshBasic layer `g`); emissive is used on bosses, eggs (`bzEggMat` 0770:296), some 0770 enemy materials (0770:16, 0770:223), and the v164 shader skins — [src/js/0770-v83-low-poly-enemies-sovereigns-eggs.js:16,223,296](src/js/0770-v83-low-poly-enemies-sovereigns-eggs.js)

### Inferences
- Because all foes share `mdMats()`, any per-enemy texture or uniform would need either per-enemy material clones (more programs/state changes) or data carried in vertex attributes / a shared atlas so the shared material can stay shared.
- `flatShading:true` is enforced by both the material definitions and the v83 sweep; a technique needing smooth normals must opt out with `userData.lpsSkip` (or `lps=1` + flatShading false).
- The `m` layer is the only metallic surface; with `scene.environment` being a flat-coloured PMREM (see §5) metal reads as uniform grey-blue.

### Gaps
- Did not inspect every one of the ~68 enemy builders; a few (bosses in 3050–3056, 3031) build their own materials.

## 2. Textures in the game today, and procedural texture code to reuse

### Takeaway
Enemy models use **no textures and no uv attributes**. Textures (almost all `CanvasTexture`, painted procedurally at load)
are used for terrain, town walls/signs, sprites, FX, boss arena floors, rune sigils and one quest boss (Skarrith).
The most reusable "texture-like" assets for enemies are UV-free shader patterns: the global world-space grime noise
(0060) and the v164 object-space shader skins (3235), plus a v81 procedural texture painter (0080) that the v83 pass
stripped.

### Cited Findings
- Grep for `CanvasTexture|DataTexture|TextureLoader` hits ~42 files; none of the enemy builders (1400–1530, 0610, 3380–3399) — none of `0610, 0080, 14xx, 339x, 3380, 1970` set a `'uv'` attribute (grep count 0). `mdBake` writes only position, color, skinIndex, skinWeight — [src/js/1410-v94-mdb.js:48-53](src/js/1410-v94-mdb.js)
- No `TextureLoader` use found: all textures are generated in code (canvas or DataTexture).
- Terrain: `GTX.main` / `GTX.town` canvas ground textures with max anisotropy — [src/js/0060-v52-dark-fantasy-renderer-setup-shader.js:214-216](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js); 0070 world: CanvasTexture (anisotropy 4), a DataTexture (RGBA, linear filter), an AO blob texture `AOT`, a sprite texture `SPR` — [src/js/0070-world-terrain-towns-water-trees.js:11,48,122,171](src/js/0070-world-terrain-towns-water-trees.js)
- Town: textured Duskhold walls (`TXA`, NearestFilter mag, mipmapped min) — [src/js/1020-v88-town-textured-duskhold-readable-signs.js:121](src/js/1020-v88-town-textured-duskhold-readable-signs.js); readable signs as sprite CanvasTextures — [src/js/1030-v88-2-signs.js:290](src/js/1030-v88-2-signs.js)
- Boss arenas: Vorraxis floor = MeshStandard with canvas `map`, `emissiveMap` (glowing veins), `alphaMap` — [src/js/3033-v144-glowmire-lair.js:71](src/js/3033-v144-glowmire-lair.js); same pattern for Frozen Maw — [src/js/3152-v151-frozen-maw.js:93](src/js/3152-v151-frozen-maw.js); crack decals `sk146CrackTex` — [src/js/3050-v146-sov-kit.js:79-81](src/js/3050-v146-sov-kit.js); rune glyph textures `MS145` — [src/js/3040-v145-rune-sigils.js:88-93](src/js/3040-v145-rune-sigils.js)
- The one textured creature: Skarrith (v164 quest boss) — a painted skin canvas (`map`) plus a **bump map** (`bumpMap`, `bumpScale .045`), RepeatWrapping, own uv attributes, iris and hood textures; materials made once in `CH164B` — [src/js/3251-v164-skarrith-model.js:48-49,58,72,76,94,112,193,208](src/js/3251-v164-skarrith-model.js); README: "painted skin texture with a bump map (`ch164SkinTex`: shingled keeled scales …); textures, materials and fixed geometries are made once (`CH164B`)" — [README.md:1025-1033](README.md)
- Legacy procedural creature texture painter `rigTex` (v-early 0080): paints a 384×384 colour canvas with hash noise + banded AO, and derives a **normal map from a height field** (finite differences), returned as `{map, nm}` — [src/js/0080-creature-rigs-skinned-meshes.js:35-49](src/js/0080-creature-rigs-skinned-meshes.js); used by 0610 for a `MeshStandardMaterial({map, normalMap})` — [src/js/0610-v81-low-poly-creature-toolkit-valheim.js:116](src/js/0610-v81-low-poly-creature-toolkit-valheim.js); the v83 pass deletes CanvasTexture normal maps on sight — [src/js/0750-v83-low-poly-look-whole-world.js:11](src/js/0750-v83-low-poly-look-whole-world.js)
- **Global world-space grime shader (UV-free):** when `PSXON` (default on: `PSXSET.psx!==false`, 0060:3), every `standard/physical/lambert/phong/toon` ShaderLib program gets a world-position varying `vPsxW` and, after `color_fragment`, `diffuseColor.rgb *= .78 + .3*n1 + .16*(n2-.5)` from two octaves of 3D value noise (`psxN(vPsxW*2.3)`, `psxN(vPsxW*.55+7.)`) — [src/js/0060-v52-dark-fantasy-renderer-setup-shader.js:3-14](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js)
- **v164 shader skins (UV-free, object space, reusable):** `skn164Patch(m,id,mode,cols)` patches a material via `onBeforeCompile` + `customProgramCacheKey`: vertex shader passes `vP164=position` (pre-skinning object space, so the pattern moves with the body); fragment adds hash/value noise `k164n`, 4-octave fbm `k164f`, animated Voronoi crackle `k164v`; it mixes base colours by pattern, overrides roughness/metalness, adds emissive veins, pulses, sparkles and a Fresnel rim. Masks choose where it applies: mode 0 = vertices whose vertex colour is a sentinel magenta, mode 1 = whole material, mode 2 = vertex colours near up to 4 given colours — [src/js/3235-v164-cheddar-skins.js:7-21,46-97](src/js/3235-v164-cheddar-skins.js). Applied only to the hero/companion/mount own materials; "shared materials are never changed" — [README.md:554-556](README.md)
- Another `color_fragment` patch exists for FX (`fxBase`/`fxMix`) — [src/js/1230-v91-fxa-real-models-animation-piercing.js:68](src/js/1230-v91-fxa-real-models-animation-piercing.js)

### Inferences
- The grime noise is in **world space** (`modelMatrix * transformed` after skinning, 0060:8), so on a walking enemy the mottling should slide across the body rather than stick to it; an object-space (`position`, as in SKN164) variant would stick. (Not verified visually.)
- SKN164 proves the engine already supports UV-free procedural surface detail on skinned, vertex-coloured, flat-shaded md models, with masks driven by vertex colour — the closest existing plug-in point for "detail via shader instead of triangles" on enemies.
- Adding real UV textures to enemies would mean adding a `uv` attribute in `mdTri`/`mdBake` (and to `cgEmit`) and a map on the shared materials (an atlas, since materials are shared), and `lpsMat` must not strip it (it strips only CanvasTexture `normalMap`; `map`/`bumpMap` survive, as Skarrith shows).

### Gaps
- No measurement of the grime shader's cost or of how visible the sliding is on moving enemies.

## 3. UVs and normals on enemy geometry

### Takeaway
No uv attribute on any enemy geometry. Geometry is **non-indexed with one colour per face**; normals come from
`computeVertexNormals()` on the non-indexed buffer (= face normals) and materials are `flatShading:true`, so enemies are
fully faceted. Smooth normals exist only inside the cage builder (for sculpting/shell offsets), never in the final mesh.

### Cited Findings
- `mdTri` pushes 3 separate vertices per triangle with the triangle's single colour and each vertex's 4 skin indices/weights — [src/js/1410-v94-mdb.js:8-9](src/js/1410-v94-mdb.js)
- `mdBake`: per layer, `position`, `color`, `skinIndex` (Uint16×4), `skinWeight` (Float32×4), then `computeVertexNormals()`; no index, no uv — [1410:48-53](src/js/1410-v94-mdb.js)
- `mdLoft` makes one colour/keep decision per quad "so colour regions have straight edges" — [1410:37-41](src/js/1410-v94-mdb.js)
- Cage: `cgNormals` computes area-weighted smooth vertex normals of the cage/subdivided mesh, used by `cgShell` (push faces out along normals for clothes/armour) and `cgSculpt` (move vertices along normals for nose, brow, sockets, cheekbones) — [src/js/3393-v181-cage.js:55-68](src/js/3393-v181-cage.js); the final emit still goes through `mdTri` (non-indexed, flat) — [3393:50-53](src/js/3393-v181-cage.js)
- v81 creature `lpGeo` is indexed with `computeVertexNormals` (smooth by index) but the material is flatShading — [src/js/0610-v81-low-poly-creature-toolkit-valheim.js:14,37,42](src/js/0610-v81-low-poly-creature-toolkit-valheim.js)
- The private detail test page (not the game) experiments with the opposite: `kdRefine` welds corners, smooths flat normals within a 55° crease, blends per-face colours, PN-curve split points, merges bone weights, and turns flat shading off via a `Material.prototype.flatShading` accessor — [README.md:86](README.md), [tools/detail/pre.js:31,172](tools/detail/pre.js)

### Inferences
- Because every triangle has its own three vertices, per-vertex (not per-face) colour gradients are already possible at no vertex cost: `mdTri` simply writes the same colour three times; writing three different colours would give smooth gradients within a face.
- Normal-map/bump detail without UVs would need triplanar or object-space procedural normals in a shader; with flat shading, the shader's normal is derived from screen-space derivatives, which a bump perturbation could still modify.

### Gaps
- Results of the detail page measurements (fps / triangles / draw calls at 1×/2×/4×) are stored in the owner's browser localStorage (`kqdR`), not in the repo — no numbers available.

## 4. How per-vertex / per-face colours are chosen

### Takeaway
Colours are hex palettes per enemy (HUMLOOK / VAR179 palettes, recipe constants), chosen **per face** by small
functions of the face's centroid, normal and part tag, blended with `mdMix`/`mdSh`, and optionally shaded with
`a181Nz` (a sum-of-sines noise). Weathering (grime/moss/streaks) baked into vertex colours exists for scenery
(`dt168Weather`), not for enemies.

### Cited Findings
- Helpers: `mdC` (hex/array → int), `mdMix(a,b,t)` (THREE.Color lerp), `mdSh(a,f)` (multiply brightness, clamp), `mdHash` — [src/js/1400-v94-model-track-clean-low-poly.js:27-30](src/js/1400-v94-model-track-clean-low-poly.js)
- Body colour regions: `mdP` palette `col:{skin,torso,torsoLo,belt,sleeve,fore,hand,pants,shin,boot,sole,neck}` and `paint:{…}` per-region functions — [src/js/1420-v94-mdp.js:2-6](src/js/1420-v94-mdp.js); example `P.paint.torso=m=>…mdMix(skin,0xc8b890,.3)…` — [src/js/1450-v94-model-track-humanoid-foes-humanoid.js:99-100](src/js/1450-v94-model-track-humanoid-foes-humanoid.js)
- Cage colour hook: `cgEmit(B,M,col,o)` calls `col(m)` once per subdivided quad with `m = cgInfo(...)` = `{x,y,z centroid, nx,ny,nz normal, s (=nz front/back), c (=nx side), part}`; both triangles of the quad get that one colour; `o.keep(m,fi)` drops faces; `o.t` picks the layer c/m/g; `o.pos` overrides positions for shells — [src/js/3393-v181-cage.js:47-53](src/js/3393-v181-cage.js)
- Part tags available to colour functions: 'torso','arm','hand','leg','foot','neck','head','tail' — [3393:86-127](src/js/3393-v181-cage.js)
- Recipe examples: `cgEmit(B,M,m=>m.part=='leg'||m.part=='foot'?lt:m.s<-.4?sk2:a181Nz(sk,m,.18,16))` — [src/js/3394-v181-cage-foes.js:189](src/js/3394-v181-cage-foes.js); naga head bands/belly/mouth line by height and normal — [src/js/3395-v181-cage-naga.js:36](src/js/3395-v181-cage-naga.js); brutes `M.b7col` — [src/js/3397-v181-cage-brutes.js:30](src/js/3397-v181-cage-brutes.js); undead wraps `u8_wrapCol` — [src/js/3398-v181-cage-undead.js:152,161](src/js/3398-v181-cage-undead.js); face paint (sockets, lip line painted as dark faces) `cgFacePaint` — [src/js/3396-v181-cage-folk.js:19-21](src/js/3396-v181-cage-folk.js)
- Noise shading: `a181Nz(base,m,amt,f,seed)` = `mdSh(base, …)` driven by `n3Sn(m.x,m.y,m.z,f,seed)` — [src/js/3390-v181-foe-redo.js:26](src/js/3390-v181-foe-redo.js); `n3Sn` is a sum of sines clamped 0..1 — [src/js/2000-v113-instance-creatures-core.js:163](src/js/2000-v113-instance-creatures-core.js); README: "`a181Nz` shades a colour with soft noise (no stripes)" — [README.md:691](README.md)
- Geometry noise (not colour) also used: `cgRocky` sculpts rock bumps with `n3Sn` along normals — [src/js/3399-v181-cage-creatures.js:6](src/js/3399-v181-cage-creatures.js)
- Palette swaps per enemy (`VAR179[rig]`, `VARK179`) with own cache keys — [README.md:729-733](README.md)
- Baked weathering for scenery: `dt168Weather(G,W)` writes grime toward the ground, mottling, rain streaks, moss on up-facing (ny) faces, lichen into the `color` attribute — [src/js/3345-v168-detail-kit.js:123-126](src/js/3345-v168-detail-kit.js); zone grade `env177Look` on decoration vertex colours — [src/js/3370-v177-env-pass.js:65](src/js/3370-v177-env-pass.js), [README.md:69](README.md)

### Inferences
- `cgEmit` is the single choke point where cage enemies get colour: making it write per-vertex colours (call `col` per vertex instead of per face, or blend neighbour faces) or extra attributes (AO, cavity, mask IDs for an SKN164-style shader) would apply to all 27 cage foes at once.
- `dt168Weather` is a ready-made "bake detail into vertex colours" routine that already reads position/normal/color on a BufferGeometry; it could be pointed at enemy geometry after `mdBake`.

### Gaps
- No ambient-occlusion / curvature bake exists for enemies (searched helpers; only the scenery weathering and AO blob texture `AOT` for ground shadows found).

## 5. Lighting, fog, shadows and renderer settings

### Takeaway
One main WebGL renderer, **no antialias, no tone mapping on the renderer (ACES done in a post pass), default
(linear) output encoding**, pixel ratio ≤ 1.5 with an automatic 4-level quality drop. Lights: one hemisphere, one
shadow-casting directional sun (PCF, 2048 map), a 4-light point-light pool, a flat PMREM environment, exponential fog.
Post: bloom, optional god rays, saturation/tint grade, vignette, film grain, optional PSX dither.

### Cited Findings
- `new THREE.WebGLRenderer({antialias:false, powerPreference:'high-performance'})`, `shadowMap.enabled`, `PCFShadowMap`, `toneMapping=NoToneMapping`, `setPixelRatio(min(devicePixelRatio,1.5))` — [src/js/0045-game-data-world-zones-bosses.js:278](src/js/0045-game-data-world-zones-bosses.js); no `outputEncoding` set anywhere in src/js (grep), so r128's default LinearEncoding applies.
- Environment: `scene.environment` = PMREM of a single-colour (0x4a5470) back-side sphere — [0045:279](src/js/0045-game-data-world-zones-bosses.js)
- Fog `FogExp2(sky 0x9fb4c8, .0185)`; `HemisphereLight(0x9fb8e0, 0x4a3c2c, .75)`; `DirectionalLight(0xffe0b0, 2)` sun with `castShadow`, 2048² map, bias −.0006, normalBias .04, radius 2.5; torch PointLight — [0045:282-285](src/js/0045-game-data-world-zones-bosses.js)
- Post chain `POST`: render to half-float target (MSAA ×4 render target when WebGL2 for some targets), bright pass, 2× separable blur bloom, god rays (off by default, `rk` 0), composite with exposure, **ACES** curve, saturation, shadow/highlight tint, vignette, grain, optional PSX Bayer dither at low resolution — [src/js/0060-v52-dark-fantasy-renderer-setup-shader.js:15-47](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js); zone palettes drive exposure/sat/vignette — [src/js/0460-v52-dark-fantasy-look-nebula-skies.js:5-14](src/js/0460-v52-dark-fantasy-look-nebula-skies.js), [src/js/0550-v71-roaming-wildlife-zone-atmosphere-unlockable.js:97](src/js/0550-v71-roaming-wildlife-zone-atmosphere-unlockable.js)
- Quality levels `QLV`: pixel-ratio factor 1/.78/.62/.5, far 104/84/68/56, shadow map 2048/2048/1024/1024; `qualityTick` steps down when the average frame > 25 ms and up when < 13.5 ms (auto on except file://) — [0060:50-56](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js)
- Optional PSX vertex snap (`PSXH>0`) in `project_vertex` — [0060:5-6](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js)
- Point-light pool: all PointLights become virtual sources; `PGL.n` (default 4) real lights copy the nearest ones, so the light count (and shader programs) never changes — [src/js/1620-v98-perf-gpu-fixed-pool-point.js:1-21](src/js/1620-v98-perf-gpu-fixed-pool-point.js); boss recipe: "Up to 2–3 point lights (they are pooled: `PGL`, 4 total)" — [docs/BOSS_RECIPE.md:80-82](docs/BOSS_RECIPE.md)
- Shadows (v98): 40×40-tile square pushed ahead of the hero, casters outside hidden during the shadow pass, small clutter never casts, map redrawn every 2nd frame, PCF (was PCF-soft) — [src/js/1630-v98-perf-shadow-cheaper-sun-shadows.js:1-19](src/js/1630-v98-perf-shadow-cheaper-sun-shadows.js)
- Mobile: phone layout is a UI concern (`body.mob`, v161) — [README.md:117](README.md); no separate low-quality material/model path was found besides `QLV` and the PSX toggles.

### Inferences
- With linear output and ACES in post, vertex/texture colours are effectively treated as linear values; any new texture should keep the same (non-sRGB) convention or colours will shift relative to existing palettes.
- Lighting is mostly a hemi + one directional light, so faceted shading carries most of the form; baked AO/cavity in vertex colours or a Fresnel/rim term (as SKN164 has) would add read-ability that the light rig does not.
- Bloom picks up anything bright (> .95 threshold), so emissive/glow (`g` layer) detail is amplified for free.

### Gaps
- Did not check per-zone hemi/sun intensity changes in 1981/3370 in detail (v177 notes say zone light was toned down: [README.md:69](README.md)).

## 6. Skinning and bone weights

### Takeaway
Up to **4 influences per vertex** everywhere (`skinIndex`/`skinWeight` vec4). In the cage pipeline each cage vertex
stores a full per-bone weight vector; Catmull-Clark smooths weights exactly like positions, then `cgEmit` keeps the
top 4 and renormalises. Rigid add-on parts take the weights of the nearest skin vertex (`cgWAt`, `sn179SkinW`).

### Cited Findings
- md: `mdW` turns `[[bone,w],…]` into 4 indices + 4 weights, normalised; >4 entries are truncated (first four, not largest) — [src/js/1410-v94-mdb.js:6](src/js/1410-v94-mdb.js); `mdWb(a,b,t)` two-bone blend — [1410:11](src/js/1410-v94-mdb.js)
- Cage vertex = Float64Array `[x,y,z, w0..w(nb-1)]` (one slot per bone), weights normalised at creation — [src/js/3393-v181-cage.js:15-19](src/js/3393-v181-cage.js)
- `cgSub`: "one Catmull-Clark step (n-gons in, quads out); every attribute (position and weights) is smoothed the same way" — [3393:31-45](src/js/3393-v181-cage.js)
- Authored weights on cage rings: arms banded by parameter t (chest .35/aX0 .65 at the root; 50/50 at the elbow; 40/60 at the wrist) — [3393:96](src/js/3393-v181-cage.js); legs (pelvis .4/l0 .6 near the hip, 50/50 knee, 40/60 ankle) — [3393:112](src/js/3393-v181-cage.js); torso by height between pelvis/spine/chest/neck (`cgTorsoW`) and neck/head (`cgNeckW`) — [3393:129-131](src/js/3393-v181-cage.js); feet and hands rigid on one bone — [3393:99,114-117](src/js/3393-v181-cage.js)
- `cgEmit` weight conversion: collect weights > 1e-4, sort descending, keep top 4, renormalise (cached per vertex) — [3393:50-51](src/js/3393-v181-cage.js)
- `cgWAt(M,p)`: nearest subdivided vertex (brute force over all vertices), weights > .01, top 4 — used for straps/tubes hung on shells — [src/js/3394-v181-cage-foes.js:59](src/js/3394-v181-cage-foes.js), [src/js/3396-v181-cage-folk.js:36](src/js/3396-v181-cage-folk.js)
- v179 `sn179SkinW`: each small rigid kit part takes the nearest body vertex's weights (4 cm spatial hash, within 8 cm) if that vertex follows the part's bone; big parts (> .36 diagonal, except shoulder pads) stay rigid on their own bone — [src/js/3380-v179-enemy-attach.js:116-125](src/js/3380-v179-enemy-attach.js); README v179 summary — [README.md:713-727](README.md)
- Rigid kit parts merged through `mdKit` with one bone each (or `p.w` ring weights) — [1410:44-47](src/js/1410-v94-mdb.js)
- Proportion warp v99: every baked vertex moved by its own bone weights through per-bone rest transforms; cage bodies skip it (`B.kqPre='none'`) and register their own joint plan — [src/js/0010-v99-model-track-realistic-humanoid-proportions.js:3-14](src/js/0010-v99-model-track-realistic-humanoid-proportions.js), [3393:137-140](src/js/3393-v181-cage.js)
- Clothes/armour shells reuse the body's own vertices' weights (`cgShell` emits the same vertex indices pushed out) — [3393:59-64](src/js/3393-v181-cage.js)
- Skeleton: humanoid `HB` bone table shared by heroes and foes; naga add five tail bones `nt0`–`nt4` — [README.md:695-698](README.md)

### Inferences
- Weight smoothness is limited by cage density: one CC step only spreads weights one ring further, so joints get roughly one-subdivided-ring-wide blends from the hand-authored ring bands.
- Since the skinning shader is the stock three.js one (4 influences), the "weights" lever for detail is better weight distribution (e.g., smoothing over more rings, corrective bones), not more influences.

### Gaps
- No skin-weight smoothing pass (Laplacian or heat diffusion) exists in the codebase; weights are authored per ring.

## 7. Triangle counts, subdivision, draw calls and enemy counts

### Takeaway
Cage foes target **~11–16k triangles** (restore pass aims "near 15k"), produced by ONE Catmull-Clark step that turns
every cage quad into 4 quads = 8 triangles. Each enemy is 1–3 skinned meshes (c/m/g layers) + weapons; zones hold
35–60 live enemies around the player.

### Cited Findings
- `cg181Body` builds the cage (torso rings `S.n||24` vertices, arm rings 8, leg rings half-torso+3, foot rings 8, neck/head rings same as torso), orients faces, then `const SM=cgSub(M)` — one subdivision — [src/js/3393-v181-cage.js:81-128](src/js/3393-v181-cage.js)
- `cgSub` emits n quads per n-gon (`out.F.push` per corner) — [3393:44](src/js/3393-v181-cage.js); `cgEmit` writes 2 triangles per quad — [3393:53](src/js/3393-v181-cage.js)
- "skin under clothes is no longer drawn (f6_reg), to stay near 15k triangles" — [src/js/3396-v181-cage-folk.js:9,44-49](src/js/3396-v181-cage-folk.js); commit e678152: "skin under clothes not drawn (~11-16k tris)" (git log)
- 27 cage registrations (`cg181Reg(` count): 3394 ×6, 3395 ×3, 3396 ×1 (plus f6_reg foes), 3397 ×5, 3398 ×5, 3399 ×7 (grep counts)
- Tests print triangles per model — [test/v181_models.py:13,50](test/v181_models.py), side-by-side old vs new with tri counts — [test/v181_compare.py:45-46](test/v181_compare.py)
- Boss budget: "about 2× the triangles of the normal creature it is based on … Vorraxis came out at ~28k" — [docs/BOSS_RECIPE.md:43-44](docs/BOSS_RECIPE.md); Glacier boss ~34k (`GB151.tris`) — [README.md:1135](README.md); scenery budgets: grave/angel < 9k, plinth 12k, quay 40k, court 140k — [README.md:261-262](README.md)
- Draw calls per humanoid enemy: body c + optional m + optional g SkinnedMeshes (+ weapons) — [src/js/1400-v94-model-track-clean-low-poly.js:8-10](src/js/1400-v94-model-track-clean-low-poly.js), [src/js/1450-v94-model-track-humanoid-foes-humanoid.js:108-111](src/js/1450-v94-model-track-humanoid-foes-humanoid.js); body and metal also render into the shadow map (castShadow).
- Geometry cache: `mdGeo(key,…)` caches baked geometry per key (foe = type), so all enemies of one type share one geometry; hero entries evicted beyond 48 — [src/js/1410-v94-mdb.js:55-60](src/js/1410-v94-mdb.js)
- Enemy counts: "The zones doubled their mobs (35–60 live enemies around the player)"; AI/animation LOD by distance (r1 25 tiles full rate, every 2nd/3rd frame beyond), off-screen pose skip, sleeping enemies beyond 30 tiles skip bone matrices — [src/js/1610-v98-perf-ai-level-detail-enemy.js:1-19](src/js/1610-v98-perf-ai-level-detail-enemy.js)
- No geometric LOD for enemy meshes was found (the v98 "LOD" is update-rate only); far-scenery cull never culls enemy models — [README.md:1360-1363](README.md)
- Camps: merged per material kind for "~6–16 draw calls … for ~10–65k triangles" — [README.md:1343-1345](README.md); v111 measured that fewer draw calls (+15% triangles) gave no faster frames — [README.md:1366-1367](README.md)

### Inferences
- At ~15k triangles × up to a few dozen visible foes, enemies alone can reach several hundred thousand triangles (plus the shadow pass for c/m layers). This is an estimate from the cited numbers, not a measurement.
- Removing the CC step would cut a cage foe's triangles ~4×; detail lost could then be put back through vertex colours/shader detail — the main trade-off the report should examine.
- Because geometry is shared per enemy type, per-vertex data (colours, masks, AO) is paid once per type in memory, not per instance.

### Gaps
- No in-repo measurement of fps or GPU time per enemy; detail-page results live in the owner's browser (`kqdR`), not the repo.
- Exact triangle count per cage foe not extracted (would need running `test/v181_models.py`, out of scope).

## 8. Build/size constraints and performance budgets

### Takeaway
The game ships as one HTML (`dist/ashen-wilds.html`, ~6.9 MB) and as a two-file artifact (`index.html` 44 KB +
`game.js` ~6.9 MB). All textures are generated at runtime, so procedural textures cost code bytes, not asset bytes.
No explicit byte-size limit is written in README/build; the hosting tool's limit is 16 MB per page/file.

### Cited Findings
- `build.sh`: concatenates `src/page.html + src/style.css + src/js/*.js` (file-name order), `node --check`, prints size, splits into `dist/artifact` (index.html + game.js) and a web zip — [build.sh:1-15](build.sh)
- Current sizes: `dist/ashen-wilds.html` 6,914,381 B; `dist/artifact/game.js` 6,870,285 B; `index.html` 44,110 B; `kill-quest-web.zip` 2,447,140 B (`ls -la dist`, Oct 30 2026)
- Perf budget mechanisms rather than numbers: auto quality targets 13.5–25 ms average frame ([0060:52-56](src/js/0060-v52-dark-fantasy-renderer-setup-shader.js)); per-asset triangle budgets in tests (§7); the detail test page exists to answer "how much more detailed can the game be and still run smoothly?" — [README.md:86](README.md)
- Tests run headless Chromium with software WebGL (~1 fps) and fast mode — [README.md:1491,1500](README.md)

### Inferences
- Shader-based detail adds a few KB of GLSL; canvas-painted textures add JS but also runtime memory (e.g., 384² RGBA ≈ 0.6 MB GPU per texture before mipmaps) and paint time at load.

### Gaps
- No documented target device/GPU or minimum fps; the owner tests on a phone (412×720 "cs" size, [README.md:284-285](README.md)).

## 9. Art-style rules relevant to texture/colour detail

### Takeaway
House style is "dark fantasy, non-cartoony", low-poly faceted with crisp per-face colour regions; the owner keeps asking
for *more detail* and *less simple/goofy* models. Bosses explicitly use surface detail (scales, emissive maps) to sell the
theme. Smooth procedural normal maps were deliberately removed in v83.

### Cited Findings
- v94: "flat shading, crisp per-face colour regions (no random jitter, no per-vertex mottling) and a small, coherent palette" — [src/js/1400-v94-model-track-clean-low-poly.js:2-4](src/js/1400-v94-model-track-clean-low-poly.js)
- v83: "Every mesh … gets the same chunky, flat-shaded style … smooth procedural normal maps are removed" — [src/js/0750-v83-low-poly-look-whole-world.js:1-5](src/js/0750-v83-low-poly-look-whole-world.js)
- v177 owner: "keep them looking non-cartoony (this is a dark fantasy game) or too simple" — [README.md:69](README.md); v179: "less cartoony / less plain" — [README.md:713-714](README.md); v181: "too simple, goofy looking, bad anatomy or didn't fit the game's style" — [README.md:65](README.md)
- v181 cage header (owner): "facial detail looks cluttered and lost"; the face is now sculpted out of the head rather than glued boxes — [src/js/3393-v181-cage.js:1-9](src/js/3393-v181-cage.js)
- Boss recipe: "Surface detail that sells the theme" (shingled scales, patterns per scale picking materials), "Living materials" (pulsing emissive), arena "painted floor texture with glowing veins (emissive map)" — [docs/BOSS_RECIPE.md:45-49,80](docs/BOSS_RECIPE.md); each boss its own theme — [CLAUDE.md](CLAUDE.md)
- v168 detail kit: "weathering baked into vertex colours" accepted as the way to add detail to scenery — [README.md:64](README.md)

### Inferences
- A texture/colour-detail approach must respect the "crisp regions" rule: low-frequency, object-space shading (AO, cavity, gradients, subtle noise) and masked patterns fit; high-frequency photo-like textures or blurry smooth normals conflict with the v83/v94 decisions.
- The cage system is new (v181, Oct 30 2026) and not yet documented in README (no `cg181`/"cage" entry found), so the report should treat its API as still in flux.

### Gaps
- No written colour-count or palette-size rule beyond "small, coherent palette".
