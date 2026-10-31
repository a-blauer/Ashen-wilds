# Model detail recipe (detail without triangles)

The standing method for every new or reworked model: enemies, bosses, folk, creatures. Owner (Oct 31 2026): *"To get detail,
you usually start adding more and more triangles. This is expensive and doesn't typically give you a better result. Research
weight painting, texture mapping and coloring to get the desired detail, so we keep the low poly feel and get more detail."*
The look stays **dark fantasy, not cartoony, low poly, faceted**; detail comes from colour, shading and good bends.

Tags: **[proven]** = works in this game today (file named). **[try]** = researched, not built yet: build it small, take
pictures, keep it only if it looks better, then change the tag here.

Read first: `src/js/3393-v181-cage.js` (cage bodies: `cg181Body`, `cgSub`, `cgEmit`, `cgShell`, `cgSculpt`, `cgSeat`),
`1400-v94-model-track-clean-low-poly.js` + `1410-v94-mdb.js` (`mdMats`, `mdTri`, `mdBake`, `mdGeo`), `3235-v164-cheddar-skins.js`
(`skn164Patch`, a shader that sticks to the body) and the top of `0060-v52-dark-fantasy-renderer-setup-shader.js` (world-space grime).

## 1. The core rule and the triangle budget

**Geometry is for the outline and for bending. Everything inside the outline is paint.**

- Geometry: the silhouette (horns, spikes, claws, tail, ears, hood, coat flaps, fur clumps, weapon shapes, hunched posture),
  big forms that show in profile (jaw, brow, chest, the curve of a muscle), and joint rings that must bend.
- Paint (colour, texture, shading): eyes, sockets, lips, runes, sigils, scars, stitches, belts, buckles, rivets, seams, plate
  edges, dirt, wear, fur pattern, stripes, veins, glow.
- Test: *does it change the outline from the front or the side?* No → paint it.

**Budget (count both layers c + m + g, weapons included):**

| Model | Target | Notes |
|---|---|---|
| Regular enemy | **3k–6k tris** (8k hard ceiling) | 35–60 live in a zone, no mesh LOD, c and m layers draw twice (shadow pass) |
| Elite / mini boss | ~1.5× its base enemy | |
| Boss | **~2× its base creature** (BOSS_RECIPE) | a lone boss in its arena may go higher if measured |

Why: hand-painted-era characters ran ~700–2,000 tris (WoW's HD remake: under 1k → ~5k); the owner's older enemies were 2–5k;
the v181 cage foes are ~11–16k, so 40 foes ≈ 600k triangles before shadows. Apply this to new and reworked models; don't rework
others only to cut triangles unless the owner asks.

**Getting there on the cage system.** One Catmull-Clark step (`cgSub`) turns every cage quad into 4 quads = **8 triangles**, so
one ring band of n vertices costs 8n triangles, and every shell (`cgShell`, `cgFur`) emits its faces again.

- **Ring count around** (`S.n`, default 24): 16 is enough for thin or small foes (saves a third of the torso and head).
- **Head rings** are the biggest cost: the Vampire Thrall's 2 neck + 15 head rings × 24 are ~40% of its body cage (estimated
  from its spec). Keep the rings that shape the profile (under the chin, mouth, nose base, brow, crown, top): about 8–10. Paint
  the sockets, lip line, nostrils and cheek hollows (the Thrall already paints `sock` and `lip` in its colour function) **[proven]**.
  Sculpt (`cgSculpt`) only what changes the side view: nose, brow ridge, jaw.
- **Limb rings:** three rings per joint (the pivot plus one either side, see §3), plus one ring per bulge that shows in the
  outline (biceps, calf). A straight taper needs no middle rings.
- **Shells only when they stand off the body:** a flaring coat, a hood, fur clumps, plates. Tight breeches, sleeves, wraps and
  belts are a colour band in `col(m)` (by `m.part`, `m.y`). Never emit skin under a shell (`f6_reg`, 3396) **[proven]**.
- Small kit parts (fingers, toes, teeth, horns): 4–6 sides, never 12–16.
- Keep the CC step (it gives the joined shoulders, hips and neck the owner asked for in v181); make the cage coarser instead.

## 2. The toolbox, in the order to use it

Work down the list. Most models need only 1–4.

### 2.1 Colour design in `col(m)` (cgEmit) [proven]

`cgEmit(B,M,col,o)` calls `col(m)` once per smoothed quad, where `m = {x,y,z, nx,ny,nz, s (front/back), c (side), part}`.
This is the single colour hook for every cage foe. Both triangles of the quad get one colour (crisp regions, the v94 rule).

- **Value first.** Plan light/dark before hue: one dominant body colour (60–70% of the surface), one secondary (cloth, bone,
  armour, 20–30%), one accent (glow or blood red, under 5%). The body's value must differ from the ground of its zone.
- **Regions follow form:** belly or chest lighter, back darker, joints and armpits darker, plate rims lighter, the inside of the
  mouth and sockets near black. Use `m.part`, `m.y`, `m.s`, `m.ny`.
- **Height gradient and top light, per face, today:** darken toward the feet and on down-facing faces, e.g.
  `mdSh(base, .6+.4*smoothstep(y/H))` and `mdSh(c, .85+.2*(.5*m.ny+.5))`. After the CC step the faces are small, so the steps read
  as a soft gradient on facets.
- **Cool shadows, warm lights, small shifts:** `mdMix(c, coolTint, t)` toward blue-violet in low or back regions, a touch warm on
  lit tops. A few degrees of hue, ±5–10% saturation. Saturated bodies look like toys; save saturation for the accent.
- **Noise:** smooth and object-space only (`a181Nz`, `n3Sn`, seeded), at most ~3–5% value on skin (`a181Nz` amt ≤ .15–.2),
  no hue noise. More only for a deliberately mottled hide, checked in pictures.
- **Never random colour per face** (the owner rejected "pixel camouflage"). Every variation follows form: height, facing,
  cavity, distance from a glowing core.

### 2.2 Baked shading into the vertex colours (cavity, edge wear, AO) [try]

Free at runtime: computed once per enemy type (geometry is cached per key in `mdGeo`), zero triangles.

- **Needs one core change:** `mdTri` (1410) writes one colour to all 3 corners. Let a vertex carry a shade factor, e.g.
  `v.k` multiplied into its colour (default 1), and have `cgEmit`'s `vx(i)` pass `k: o.shade ? o.shade[i] : 1`. The face keeps
  its crisp region colour and the shade blends smoothly across faces, because it is computed per **smoothed-cage vertex index**,
  which neighbouring faces share. 1410 is core: run the full suite.
- **Cavity / edge wear** (Blender "Dirty Vertex Colours"): for each vertex of the smoothed cage `C.M`, average the unit directions to
  its edge neighbours; the angle between that and the vertex normal is < 90° in a crease (dirt) and > 90° on a ridge (wear).
  Blur 1–3 times over neighbours. Map creases to ×0.65–0.85 and ridges to ×1.05–1.12. Measure on the whole body, not per part.

  ```js
  // a colour multiplier per smoothed-cage vertex (tone t = Blender's dirt angle / π: <.5 crease, .5 flat, >.5 ridge)
  function cgCavity(M,blur){const V=M.V,N=M.N||(M.N=cgNormals(M)),nb=V.map(()=>new Set());
    M.F.forEach(f=>f.v.forEach((a,i)=>{const b=f.v[(i+1)%f.v.length];nb[a].add(b);nb[b].add(a)}));
    let t=V.map((v,i)=>{let d=[0,0,0];nb[i].forEach(j=>{d=add3(d,nrm3(sub3(V[j],v)))});const l=Math.hypot(d[0],d[1],d[2]);
      if(l<1e-6)return .5;const c=(N[i][0]*d[0]+N[i][1]*d[1]+N[i][2]*d[2])/l;return Math.acos(Math.max(-1,Math.min(1,c)))/Math.PI});
    for(let k=0;k<(blur||2);k++)t=t.map((x,i)=>{let s=x;nb[i].forEach(j=>s+=t[j]);return s/(nb[i].size+1)});
    return t.map(x=>x<.5?1-(.5-x)*.6:1+(x-.5)*.25)}   // crease ×0.7 … ridge ×1.12; clamp and tune by eye
  ```
- **AO** (armpits, under the jaw, between the legs): rays from each vertex against the body. `cgRay` is brute force over every
  face, far too slow per vertex; use a few (8–16) short rays against the coarse cage (`C.cage`) or test points along the normal
  against the builder's own known shapes. Budget ≤ 50 ms per type, measured with `performance.now()`. Clamp at ≥ 0.45 (dark, never
  black). Do cavity first; AO only if pictures still look flat.
- Order: `base × height × AO × cavity`, each term kept within 0.5–1.0 so they don't crush to black. Keep the g (glow) layer out.
- Scenery already does this kind of bake: `dt168Weather` (3345) writes grime, moss and streaks into the `color` attribute
  **[proven for scenery]**.

### 2.3 Emissive accents [proven]

The g layer (`mdMats().g`, a MeshBasic with vertex colours) draws unlit; anything bright enough passes the bloom threshold
(~.95) and glows for free. Eyes, a core, rune lines, embers in cracks: the cheapest readability win in a dark scene.

- Keep glow under ~5% of the surface and make it the only high-saturation, high-value colour on the model.
- Set it in a dark surround (socket, crack, engraved band) so it reads at game distance.
- MeshBasic is fogged; a boss glow material can use `fog:false` (`svGlowMat`). Pulsing glow is for bosses (`mb144Post`, 3031).

### 2.4 One shared tiling detail texture, in bind-pose object space [try]

Fine grain that vertex colours can't hold (pores, grain, scratches, weave, scale cells), shared by every enemy.

- One 256² RGBA DataTexture of tileable noise: R = fBm (stone, hide), G = Worley cells (scales, chitin), B = streaks (fur, grain),
  A = fine grain. About 340 KB on the GPU with mipmaps, one upload, generated once at load.
- Sample it **triplanar from `position` and `normal`** (the bind-pose attributes, before skinning), so it sticks to the skin and
  needs no UVs. md geometry has face normals, so the triplanar blend is per face and stays faceted.
- Multiply it into `diffuseColor` as greyscale (0.82–1.06), so each model's vertex colours give the tint. Per-region strength
  (skin vs cloth vs metal) comes from vertex data, because the material is shared (see §4).
- Hook: after `#include <color_fragment>` in an `onBeforeCompile` on `mdMats().c` (and `.m`), chained like `skn164Patch`:

  ```js
  function mdDetailPatch(m,tex){const ob=m.onBeforeCompile,ck=m.customProgramCacheKey,P=THREE.Material.prototype;
    m.onBeforeCompile=(sh,rn)=>{if(ob&&ob!==P.onBeforeCompile)ob.call(m,sh,rn);sh.uniforms.uDet={value:tex};sh.uniforms.uDetS={value:9};
      sh.vertexShader='varying vec3 vDP,vDN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDP=position;vDN=normal;');
      sh.fragmentShader='uniform sampler2D uDet;uniform float uDetS;varying vec3 vDP,vDN;\n'+sh.fragmentShader.replace('#include <color_fragment>',
        `#include <color_fragment>
        {vec3 w=pow(abs(normalize(vDN)),vec3(4.));w/=dot(w,vec3(1.));vec3 q=vDP*uDetS;
         float d=texture2D(uDet,q.yz).r*w.x+texture2D(uDet,q.xz).r*w.y+texture2D(uDet,q.xy).r*w.z;
         diffuseColor.rgb*=mix(.82,1.06,d);}`)};
    m.customProgramCacheKey=()=>(ck&&ck!==P.customProgramCacheKey?ck.call(m):'')+'|det';m.needsUpdate=true}
  ```
- **Fix the sliding grime at the same time.** 0060 patches every lit ShaderLib program with value noise of the **world** position
  (`vPsxW`, ×0.70–1.16). On a walking enemy that pattern most likely swims across the body (not yet checked in a picture). For
  skinned programs (`#ifdef USE_SKINNING`) compute it from `position` instead (scaled so the blotch size stays the same), or let
  the detail texture replace it on enemies. Don't stack two noises.
- Cost: 3 texture reads per pixel on every foe; give it a strength uniform, 0 on the low `QLV` levels.
- Precedent: `skn164Patch` (3235) does this on skinned, flat-shaded md models (`vP164=position`, fbm, Voronoi, vertex-colour
  masks) **[proven on hero / companion / mount own materials]**.

### 2.5 A small shared decal / emissive atlas (eyes, runes, sigils, scars) [try]

For shapes too sharp for vertex colour: slit pupils, rune rows, a branded sigil, stitched scars, teeth rows.

- One 256² canvas atlas, 32–64 px cells, drawn once (reuse the glyph drawing of the rune sigils `MS145`, 3040). `magFilter =
  NearestFilter` (crisp texels suit the faceted look), mipmapped min filter, 2–4 px gutters, no RepeatWrapping.
- Needs UVs **only for the decal faces**: add a `uv` array to `mdBuf`/`mdTri`/`mdBake` (1410); every other vertex of that layer
  points at a plain cell (white for a colour map). This touches core files: run the full suite.
- Put the decal on the body with `cgShell` (offset 1–2 mm, `keep` picks the faces, u/v from the angle round the limb and the
  height), so it bends with the skin and copies its weights.
- Glowing decals go on the g layer (the atlas as its `map`): a white rune on black, times the glow vertex colour. The black
  background reads as an engraved, burnt-in band or a socket, which suits dark fantasy, and needs no transparency.

### 2.6 Rim light [proven on hero skins, try on foes]

A dim, cool rim cuts a dark enemy out of a dark background. `skn164Patch` adds `pow(1.-abs(dot(normal,normalize(vViewPosition))),2.4)`
to `totalEmissiveRadiance` after `emissivemap_fragment`. On the shared foe material: one global per-zone uniform colour
(moonlight blue, sickly green), strength 0.2–0.4; check the darkest zones. Half-Lambert would mean replacing Standard's lighting
chunks: not worth it now.

### 2.7 Bump maps: rarely [proven on one boss]

Skarrith (3251) has a painted `map` + `bumpMap` (`bumpScale .045`) with its own UVs. The faceted flat shading already sets the
look, and the owner removed smooth procedural normal maps on purpose in v83 (`lpsMat` in 0750 deletes canvas `normalMap`s on
materials not tagged `userData.lps`). Use bump only on a boss surface seen close up (scales, carved runes). Never use normal maps.

## 3. Weights: clean bends with few rings

Good weights let three well-placed rings bend a joint cleanly, so triangles go to the outline instead of extra loops.

- **Rings at the joint** [proven layout, tune it]: one ring at the pivot (arm `t=1`, wrist `t=2`, knee `t=1` in the spec), one on
  each side about 0.3–0.5 × the limb radius away. `cg181Body` gives the pivot ring 50/50 weights (elbow, knee) or 40/60 (wrist,
  ankle), and the CC step blends one ring further. Evenly spaced rings waste triangles mid-limb and starve the joint: move them.
- **Rigid parts are 100% one bone** [proven]: hands, feet and the skull above the neck already are (`cgCap … [[bn+'2',1]]`,
  `[['head',1]]`). So are plates, helmets, horns, weapons and shields. A big hard part that crosses a joint is split in two or
  rides the parent bone and overlaps.
- **Soft layers copy the skin** [proven]: `cgShell` and `cgFur` reuse the body vertices' own weights, so clothes and fur bend
  exactly with the skin. Prefer a shell to a separate tube.
- **Smoothing** [try]: on the smoothed cage, 2–3 passes of `w ← (1−λ)w + λ·mean(neighbours)` (λ≈0.5) over the weight slots
  (`V[i][3..]`), with rigid parts and the middle half of each limb segment locked. Then the existing `cgEmit` step: drop weights
  under ~0.02, keep the top 4 (largest first), renormalise.
- **Attached parts by surface, not nearest vertex** [try]: `cgWAt` (3394) and `sn179SkinW` (3380) copy the nearest *vertex*, which
  can pick the wrong side of a thin part or another limb. Better: find the nearest point on the nearest triangle (only triangles
  whose main bone is the part's bone or its parent or child), blend its three corners' weight vectors by barycentric weights, then
  top 4. Small rigid parts (studs, eyes, a horn) use one lookup at their base for all their vertices; soft wraps one per vertex.
- **Volume** [try]: scale the pivot ring 5–10% up in the bind pose (LBS shrinks it when bent) and pinch it a little on the inside of
  the bend, so the fold has room. Twist: spread it along the forearm rings (the spec's `S.pron` already twists the forearm
  geometry). Twist or helper bones change the shared `HB` skeleton, so only add them if pictures demand it. Skip dual-quaternion
  skinning: it bulges bent elbows and knees.
- `mdW` keeps the **first** four entries, not the largest: sort before calling it.
- Painted detail can't tear or float; separate pieces can. One more reason to paint.

## 4. three.js r128 gotchas

- **Colours are linear:** no `outputEncoding` is set (r128 default Linear), ACES runs in post, `setHex` does no sRGB
  conversion. Keep every texture at the default `LinearEncoding`, or it shifts against every palette in the game.
- **DataTexture defaults** are Nearest, no mipmaps, `flipY=false` (row 0 = bottom). Set `minFilter`, `generateMipmaps`, `wrapS/T`
  and `needsUpdate` yourself. Use RGBA, not RGB.
- **Power of two** (64/128/256/512): on WebGL1 a repeating or mipmapped texture must be 2ⁿ (canvases get shrunk silently).
- **`onBeforeCompile`:** the default `customProgramCacheKey` is the hook's source text, so two hooks with the same text and
  different baked-in numbers share one wrong program. Set your own key, chain the old hook and the old key (as `skn164Patch` does),
  and put values in uniforms. Never remove the `skinning_*`, `fog_*` or `project_vertex` includes.
- **`skinning:true`** must stay on materials of a SkinnedMesh in r128 (removed only in r129).
- **`position` / `normal` in the vertex shader are bind-pose** (before `skinning_vertex`): use them for anything that should stick
  to the body. `worldPosition` exists only with shadows or an env map: compute `modelMatrix*vec4(transformed,1.)` yourself.
- **Lambert in r128 lights per vertex and has no `bumpMap`, `normalMap` or `flatShading`.** The foe materials are
  MeshStandard (fine); some scenery is Lambert.
- An `emissiveMap` shows only when `emissive` is not black. `aoMap` needs `uv2` and only darkens indirect light: bake AO into
  the vertex colours instead.
- **Shared materials:** `mdMats()` c / m / g serve every foe **and the town folk** (heroes get clones), so a patch changes all
  of them: test broadly. A per-model value can't be a uniform changed before each draw (r128 re-uploads material uniforms only
  when the material switches; verify if you rely on it): put it in vertex data or use a per-type clone. Global values (time,
  zone rim colour) are fine as uniforms.
- **Memory:** RGBA8 = w×h×4 bytes +⅓ for mipmaps (256² ≈ 340 KB, 512² ≈ 1.3 MB). A few shared textures are fine on phones; a
  unique 512² per enemy type (~90 MB) never. Each new cache key is one more shader compile: share one hook and key.
- Don't call `.toNonIndexed()` on geometry that is already non-indexed (the roster test fails on the warning).

## 5. Checklist for every new or reworked model

1. **Silhouette:** front and side pictures. Every triangle-heavy feature changes the outline; everything else is paint.
2. **Triangles:** `cd test && ONLY=<key> python3 v181_models.py` and the compare sheet print the count. Regular foe 3–6k,
   boss ~2× its base.
3. **Old vs new:** `cd test && ONLY=<key> OLD=<old build html, or out/v181_cmp_old.json> python3 v181_compare.py` (front, 3/4,
   back, face, with heights and tris). The new one must look at least as detailed.
4. **Value check:** greyscale the sheet (`python3 -c "from PIL import Image;Image.open('out/v181_cmp_0.jpg').convert('L').save('out/grey.jpg')"`).
   Head, body, limbs and gear must still separate, and the foe must separate from its zone's ground.
5. **No camouflage:** no random per-face speckle; every colour change follows form.
6. **Glow:** under ~5% of the surface, the brightest thing on the model, readable from the game camera. The compare renderer
   has no bloom: check an in-game picture too (`test/v143_look.py`).
7. **Bends:** idle, walk and attack poses: elbows, knees, shoulders and neck keep their volume; rigid parts stay rigid.
8. **Nothing floats:** `cd test && ONLY=<key> python3 v179_enemy_parts.py` (floating pieces, seated parts, feet on the ground).
9. Add a focused test to `test/full.txt` and `test/affects.txt` if you built a new tool; then the CI steps from CLAUDE.md.

## Sources

Depth, citations and the reasoning behind every number: `research_notes/Low poly detail without triangles/` (texture mapping
and case studies, procedural textures in r128, vertex colour and shading, weight painting, the current pipeline).
