# Vertex colour, baked AO/lighting and stylised shading for low-poly models (three.js r128, procedural meshes)

> Research conditions (read first): this session's network blocked most sites for direct fetching (discourse.threejs.org,
> iquilezles.org, polycount.com, 80.lv, gamedeveloper.com, developer.nvidia.com, blog.camposanto.com, advances.realtimerendering.com
> were all refused). Facts below come from (a) **primary source code / docs fetched from GitHub** (three.js r128 shader chunks and
> docs, Blender's `vertexpaint_dirt.py`, three-mesh-bvh and vertex-ao READMEs), which are high confidence, and (b) **web-search
> result summaries** of the other pages, which are lower confidence (a summary of a page, not the page itself). Search-summary items are
> marked "(search summary)". Engineering sketches written by me are under "Inferences", not "Cited Findings".
>
> Context from this repo (grep of `/home/user/Ashen-wilds`, `.js`/`.html`, built copies included): the code already uses
> `MeshStandardMaterial` (~6.4k occurrences), `flatShading:true` (~4.4k), `vertexColors:true` (~2.2k), `MeshLambertMaterial` (~680),
> `HemisphereLight` (~360) and `FogExp2` (~90). So the notes below focus on what fits that setup.

## 1. Vertex colour painting: how it adds detail, how much detail vertex density allows, flat vs smooth colour

### Takeaway
Vertex colour is RGB(A) stored per vertex (or per face corner) and blended across each triangle by the GPU, so it gives smooth gradients,
crevice darkening, dirt and tint variation for free, but **detail can never be finer than the triangle spacing**. A faceted (flat-shaded)
look needs each triangle to have its own vertices (a non-indexed / "split" mesh). Random per-face colour noise looks like camouflage;
variation driven by geometry (normal, height, curvature, AO) looks deliberate.

### Cited Findings
- Vertex colours are RGBA stored **per polygon corner**, which is why one shared vertex position can hold different colours for different
  faces; Autodesk says they are commonly used in games for baked lighting and texture blending — [Autodesk Softimage docs, Vertex Colors](https://download.autodesk.com/global/docs/softimage2014/en_us/files/scel_vertexcolor.htm) (search summary)
- In Cinema 4D's polygon-points mode, a vertex can only give one averaged colour (per-point storage averages the corners) — [Maxon C4D Vertex Color Operator](https://help.maxon.net/c4d/2025/en-us/Content/html/GVVERTEXCOLORMAP.html) (search summary)
- A single vertex can carry position, UV, normal, material ID, colour and alpha; vertex colour or smoothing splits can raise the real
  vertex count the GPU sees — [Polycount forum thread](https://polycount.com/discussion/comment/524021) (search summary)
- Flat shading uses one vertex's colour for the whole primitive; smooth (Gouraud) shading blends the vertex colours across it — [OpenGL glShadeModel notes, Bucknell](https://www.eg.bucknell.edu/~cs367/gl/shademodel.html) (search summary)
- A triangle is just three vertex indices, so it cannot carry its own colour apart from its vertices; the usual fix for per-face colour
  is to duplicate vertices so each triangle has its own copies — [GameDev.net, Flat shading and vertex arrays](https://www.gamedev.net/forums/topic/521236-flat-shading-and-vertex-arrays/) (search summary)
- Advice for random colour variation on low-poly meshes: multiply the vertex colour by a random amount, but **seed the random value from
  the face normal / orientation** so the variation stays consistent (faces with the same angle get the same value) instead of
  flickering — [Unreal forum, Flat shading tips](https://forums.unrealengine.com/t/ue4-crash-reporting-and-troubleshooting/10147) (search summary)
- Autodesk's 3ds Max Low Poly modifier colours faces by their **orientation along Z**: faces pointing up get brighter, faces pointing
  down get darker, and it also nudges vertices so each facet catches the light differently — [Autodesk Live Design blog](https://blogs.autodesk.com/live-design-stories/?p=198) (search summary)
- A gamedev.tv low-poly dinosaur project used **height** as a filter for subtle shading variation rather than harsh per-face changes — [GameDev.tv community](https://community.gamedev.tv/t/my-low-poly-dinosaur-shading-might-be-out-of-hand/251391) (search summary)
- A hobbyist recreation of the Old School RuneScape look recommends a vertex-colour base tint, a low-poly mesh with hard edges, roughness 1
  and specular 0 (i.e. matte, no shine). This is a fan's advice, not documentation of the real client — [Unreal Engine forum, OSRS shader](https://forums.unrealengine.com/t/trying-to-make-a-shader-that-looks-like-old-school-runescape-in-ue-5-8-2/2834060) (search summary)
- Blender's "Dirty Vertex Colors" tool (paint mode) is the classic auto-detail tool for vertex colour: it darkens creases and can lighten
  protruding parts (see question 2 for its exact algorithm) — [Blender manual, Vertex Paint editing](https://www.blender.org/manual/en/sculpt_paint/vertex_paint/editing.html) (search summary)

### Inferences
- **Detail limit:** a vertex colour value lives at a corner and is blended across the triangle, so the finest feature is about one triangle
  wide. On a 3–15k triangle monster, that is enough for: a dark-to-light gradient up the body, darker joints/armpits/under-jaw, a lighter
  belly or chest, coloured bands on armour, a darker rim around eye sockets. It is **not** enough for scratches, scales, runes or text
  (those need texture, decals or extra geometry).
- **Flat vs smooth in this codebase:** with `flatShading:true` on `MeshStandardMaterial`, the *lighting* is per face (r128 rebuilds the
  normal from screen-space derivatives in the fragment shader), but the *vertex colour* is still blended across the triangle. So:
  - indexed (shared) vertices + flat shading = faceted lighting with smooth colour gradients (often the nicest "painted low-poly" look);
  - non-indexed with all 3 corners the same colour = fully faceted "gem" look, with a hard colour step at every edge;
  - non-indexed with per-corner colours computed from shared values (e.g. AO computed on welded positions and copied to every corner) =
    faceted lighting **plus** smooth AO/gradients. This is usually the best choice for baked AO on a flat-shaded mesh.
- **Rule against "pixel camouflage":** never pick a random colour per face on its own. Drive variation from something the eye can read as
  form: height, facing (up = lighter), AO/cavity, distance from a "core". If a little randomness is wanted, keep it to a few percent of
  **value** (brightness) only, use a smooth noise in object space (neighbouring faces get similar values), and seed it per model so it
  never changes between frames.

### Gaps
- No primary Polycount wiki page on vertex colour could be fetched (site blocked); the Polycount items are search summaries of forum
  threads.
- No authoritative source on how the real Old School RuneScape client computes its model colours/lighting was found (the OSRS wiki and
  RuneLite source would be the place to check).

## 2. Baked per-vertex ambient occlusion and cavity / curvature colouring

### Takeaway
Three practical ways to compute per-vertex AO in code: (1) **hemisphere ray casting** from each vertex against the mesh's own triangles
(best quality, needs a BVH for speed; three-mesh-bvh exists for this); (2) **disk/element approximation** (Bunnell, GPU Gems 2: treat
each vertex as a disk with area and normal, add up how much the other disks block it — no rays); (3) **cheap local cavity** from
normals vs neighbour directions (Blender's Dirty Vertex Colors: one pass over edges, plus blur). The cavity method also gives
"edge wear" (convex = lighter), which is the curvature colouring asked about.

### Cited Findings
**Blender Dirty Vertex Colors (exact algorithm, from source code)**
- The algorithm compares each vertex normal with the **average of the normalised directions to its edge-connected neighbours**; angle =
  `acos(dot(normal, avgDir))`. Comments: "< 90 – dirt has accumulated in the crease; > 90 – surface has been worn or buffed; ~ 90 –
  surface is flat". Vertices with no neighbours are treated as flat (90°). It says the method "is limited by the complexity or lack there of
  in the geometry". Original method by Keith "Wahooney" Boshoff — [Blender source, vertexpaint_dirt.py](https://github.com/blender/blender/blob/main/scripts/startup/bl_operators/vertexpaint_dirt.py)
- The angle is clamped (`clamp_dirt` minimum, `clamp_clean` maximum unless "dirt only"), then **blurred** over neighbours for N iterations:
  `tone[j] = (tone[j] + blur_strength * Σ tone[neighbours]) / (count * blur_strength + 1)`, then normalised to 0–1 (by min/max or by the
  clamp range), and the existing colour is **multiplied** by the tone. With "dirt only", `tone = min(tone, 0.5) * 2` so convex areas
  stay at full brightness — [Blender source, vertexpaint_dirt.py](https://github.com/blender/blender/blob/main/scripts/startup/bl_operators/vertexpaint_dirt.py)
- Blender manual: Dirt Angle clamps concave areas (90 = flat, 0 = very deep crevice); Blur Strength is the clamp for convex areas; turning
  Normalize off gives consistent results across multiple objects — [Blender manual](https://www.blender.org/manual/en/sculpt_paint/vertex_paint/editing.html); [Blender manual (de)](https://docs.blender.org/manual/de/dev/sculpt_paint/vertex_paint/editing.html) (search summary)
- A commercial Blender add-on lists separate "Curvature" (scale-independent) and "Edge Wear" (convex edges only, with threshold,
  contrast, blur, an up-facing bias and noise breakup) modes; internals not verified — [Vertex Channel Kit, Superhive](https://superhivemarket.com/products/vertex-channel-kit) (search summary)

**Disk-based AO approximation (Bunnell, GPU Gems 2, ch. 14) — classic (2005)**
- The mesh is turned into surface elements, one oriented **disk per vertex** with position, normal and area; the area comes from the
  triangles sharing the vertex (Heron's formula; a third of each triangle's area, a quarter for quads) — [GPU Gems 2 ch. 14](https://developer.nvidia.com/gpugems/gpugems2/part-ii-shading-lighting-and-shadows/chapter-14-dynamic-ambient-occlusion-and) (search summary)
- Occlusion between two elements uses an approximation of the **solid angle of an oriented disk**; the first pass sums the shadowing from
  every other element, a second pass corrects double shadowing, and blending pass 1 and 2 gets close to the final result. Naive cost is
  O(n²); a hierarchy brings it to about O(n log n) in practice. It ignores directional light, so it is only a coarse approximation — [GPU Gems 2 ch. 14](https://developer.nvidia.com/gpugems/GPUGems2/gpugems2_chapter14.html) (search summary)

**Ray-cast per-vertex AO**
- A Unity proof-of-concept writes per-vertex AO into vertex colours; pipeline: tessellate → per-vertex AO → adaptive simplify (keeps
  triangles where AO detail is). Bake of Crytek Sponza (~800k triangles) took **3.43 s** on a Ryzen 7 4800H + GTX 1660 Ti using compute
  shaders and Unity's Job System; author calls the algorithms "mostly naive" — [Delt06/vertex-ao README](https://github.com/Delt06/vertex-ao)
- A Rust BVH-based baker casts **64 hemisphere rays per vertex by default**, and its maximum ray distance decides which hits count — [oxihuman-mesh source](https://docs.rs/crate/oxihuman-mesh/0.2.1/source/src/mesh_ambient_occlusion.rs) (search summary)
- three-mesh-bvh: setting `raycaster.firstHitOnly = true` makes `Mesh.raycast` use the BVH's first-hit query, which returns faster
  (ideal for AO, where we only need "hit or not") — [three-mesh-bvh README](https://github.com/gkjohnson/three-mesh-bvh)
- A three.js forum answer suggests raycasting from each vertex to get an occlusion ratio, storing it as a per-vertex value and reading it
  in a material or shader; no maintained npm package for per-vertex AO baking was found — [three.js forum, bake AO into vertex colour](https://discourse.threejs.org/t/how-would-i-begin-to-bake-lighting-ao-into-vertex-color-data/48689) (search summary)
- Unity's docs warn that mesh topology strongly affects baked AO quality and that very thin triangles cause visible interpolation
  artefacts — [Unity Industry Toolkit, Bake Ambient Occlusion](https://docs.unity3d.com/Packages/com.unity.industry.toolkit@3.2/manual/Actions/Autogenerated/BakeAmbientOcclusion.html) (search summary)
- Voxel-style per-vertex AO (count blocked neighbour cells at each corner, store as a vertex attribute, strength via a shader uniform) is
  common for block meshes — [three.js forum, paid task](https://discourse.threejs.org/t/paid-task-200-shader-pack-style-ambient-occlusion-for-a-three-js-viewer/94398) (search summary; a job post, not a reference)

### Inferences
- **Recommended pipeline for this game (procedural creatures, 3–15k tris, built at load):**
  1. **Weld** positions first (hash rounded x,y,z → index), so AO is computed once per real corner, not 3× per flat-shaded triangle.
     Build neighbour lists from triangle edges.
  2. **Cavity pass (cheap, always on):** Blender's dirt formula on welded vertices, 1–3 blur iterations. Cost is one pass over edges —
     milliseconds in JS for 15k triangles. Map concave → darker (×0.6–0.85), convex → slightly lighter (×1.05–1.15) for edge wear.
     Note: on very low-poly parts (a box limb with 8 corners) every corner looks "convex", so scale the effect down for small or simple
     parts, or measure the angle across the whole assembled creature, not per part.
  3. **Occlusion pass (better, optional):** for real "armpit / under the jaw / between the legs" darkness, cast ~16–32 cosine-weighted
     hemisphere rays per welded vertex against the **merged creature mesh** (all parts together, so the arm darkens the side of the
     torso), with a short max distance (≈ 10–30 % of the creature's height). Start each ray a tiny step along the normal to avoid hitting
     its own face. Use three-mesh-bvh with `firstHitOnly`. Rough budget (my estimate, untested): 5k welded vertices × 24 rays = 120k ray
     queries — plausibly tens to a few hundred ms in one JS thread; cache per enemy type, or run in a Web Worker, or bake at build time.
  4. **Store** AO as a multiplier into the existing `color` attribute (multiply the base colour), or as its own attribute if lighting
     should treat it separately. Copy each welded value back to every split corner so the flat-shaded mesh keeps smooth AO.
  5. **Clamp** the minimum (e.g. never below 0.35–0.5) so crevices go dark but not black, and keep emissive parts (eyes, runes) out of the
     AO multiply.
- A **cheaper occlusion substitute** without rays: for each vertex, sample a few points along the normal (e.g. 0.05, 0.1, 0.2 × height)
  and count how many fall inside other parts' bounding shapes (spheres/capsules of the creature's limbs, which the procedural builder
  already knows). This is the SDF-style AO idea, but using the generator's own primitive shapes.
- **Bent normals** (the average un-blocked direction from the ray pass) can also be saved and used for the hemisphere/sky lookup instead
  of the true normal; it is a refinement with modest visible gain on low-poly models — probably not worth it here.
- Animated (skinned) creatures: baked AO is computed in bind pose and moves with the vertices. That is fine for self-shadowing that
  doesn't change much (armpits, under the jaw), and wrong only for big pose changes — an acceptable, standard trade-off.

### Gaps
- Inigo Quilez's articles on AO (and the bent-normal literature) could not be fetched (iquilezles.org blocked); no cited formulas here.
- No measured timings for per-vertex AO in three.js / three-mesh-bvh were found; the timing in the inferences is my estimate.
- The full Bunnell equations (exact disk solid-angle formula) were only seen in search summaries, not read.

## 3. Baked directional / gradient lighting; how classic and stylised games used vertex-colour lighting

### Takeaway
"Baked lighting" in vertex colours is the PS1/N64-era classic: lighting is computed once and stored per vertex, and the GPU only blends it
(identical in look to Gouraud shading). For creatures, the most useful baked terms are a **height gradient** (darker feet, lighter head),
a **top-light bias** (up-facing = lighter) and AO. Modern stylised games (Firewatch, Sable) get most of their mood from **lighting + fog
+ colour grading in layers** rather than detailed textures.

### Cited Findings
- PS1 offered flat shading (one brightness per polygon) or Gouraud shading (a brightness per vertex, interpolated by hardware); much of the
  lighting players saw was baked in ahead of time. (The forum claim that PS1 had "no hardware lighting" is a simplification — its GTE
  coprocessor could do lighting maths.) — [Polycount discussion](https://polycount.com/discussion/comment/2128690/) (search summary)
- Vertex colours "work in a similar way but without the real time math" — values are saved in each vertex permanently, so baking lighting
  into vertex colours and showing only those looks just like Gouraud — [Polycount discussion](https://polycount.com/discussion/comment/1172714) (search summary)
- A Unity "Vertex Lightmapper" tool stores lighting in vertex colours and tints the mesh in a shader; its bake adds ambient colour, then
  directional and point light colours, then multiplies by "colour sponges" (occluders) — [bigsnake09/Vertex-Lightmapper](https://github.com/bigsnake09/Vertex-Lightmapper) (search summary)
- PS1-style spec lists for modern retro games include "vertex painting (Gouraud shading)" and baked/painted lighting — [itch.io post](https://itch.io/post/15542442) (search summary)
- RuneLite HD (a fan client for Old School RuneScape) changed its lighting to convert colours to **linear space before lighting** and back
  to gamma afterwards; the modder said the old gamma-space lighting looked "high contrast, washed out … plastic-y" — [NME](https://www.nme.com/news/runelite-hd-mod-for-old-school-runescape-gets-major-lighting-upgrade-3057236) (search summary; a fan mod, not the vanilla game)
- Firewatch (GDC 2015 "The Art of Firewatch", Jane Ng): lighting was supplemented with **fog for depth and distance**; colours are laid out
  in bold layers that lighten toward the horizon; Campo Santo said much of the colour comes from **lighting + fog + colour correction**;
  the game used two fog systems plus god rays and a colour-correction post effect; skies use a three-colour (top / middle / bottom)
  gradient plus sun disc and halo — [Thumbsticks GDC 2015 recap](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch); [Campo Santo blog](https://blog.camposanto.com/post/112703721804/this-blog-post-is-an-in-detail-explanation-of-part); [GDC Vault](https://gdcvault.com/play/1022295/The-Art-of) (search summaries)
- Sable (GDC 2022, Gregorios Kythreotis): because the game uses **flat shading**, the team had fewer tools for depth and built scenes in
  **layers of lighting, fog and lines**; fog and lines also hide distant objects fading in, preventing pop-in — [Game Developer](https://www.gamedeveloper.com/marketing/how-shedworks-refined-the-art-of-sable-in-pursuit-of-readability) (search summary)
- Valve has applied a "Half Lambert" curve since Half-Life (1998): `(0.5·N·L + 0.5)²`, which pulls light around the back of the form so
  shadow sides keep shape instead of going black — [Valve GDC 2008, Stylization with a Purpose](https://cdn.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf) (search summary)
- Valve's "ambient cube" pre-computes irradiance samples through the environment and looks them up by normal, to ground characters in the
  world — [Valve GDC 2008 slides](https://cdn.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf); [Auckland lecture notes](https://cs.auckland.ac.nz/compsci715s2c/archive/2007/lectures/Nathan_lectures/715Pt2Lecture11.pdf) (search summaries)

### Inferences
- **Height gradient** (very cheap, strong effect for creatures): `t = (y - minY) / (maxY - minY)`; `colour *= mix(0.55, 1.0, smoothstep(0,1,t))`,
  optionally also shifting hue slightly cooler/darker at the feet. It grounds the model, keeps the eye on the head/face, and hides the
  "floating" look. Use object-space height at bind pose so it moves with the model.
- **Top-light bias:** `colour *= mix(0.75, 1.1, 0.5*normal.y + 0.5)` gives a baked "sky from above" even under weak scene lights. On a
  flat-shaded mesh compute it per face for a faceted look, or per welded vertex for a smooth look.
- Order that combines well: `final = base × heightGradient × AO × cavity`, then let the real-time lights (hemisphere + one directional)
  add the dynamic part. Keep baked terms modest (each 0.5–1.0 range) so stacking doesn't crush the colour to black.
- A dark-fantasy variant: invert the top-light idea for things lit from below (lava, a glowing core): bake a warm light from the core
  position (distance falloff × facing toward the core) into vertex colours.

### Gaps
- No primary source was reachable on how Tunic, Death's Door or Hollow-Knight-like 3D games light their models. Search results for Death's
  Door were unreliable (one headline wrongly called it "2D pixel-art"; it is a 3D isometric game), and results for Tunic gave no usable
  information, so nothing is claimed about either.
- The GDC talks themselves (Firewatch, Sable) were not watched/read; only recaps.

## 4. Stylised shading: ramps, rim/fresnel, hemisphere light, fog, emissive accents, posterisation, dithering

### Takeaway
Most of what's needed is either built into three.js r128 (HemisphereLight, Fog/FogExp2, `emissive`, `dithering`, MeshToonMaterial +
`gradientMap`) or is a few lines added with `onBeforeCompile` (rim/fresnel, half-Lambert, posterise). For dark fantasy that is not cartoony:
use a **soft ramp** (not a hard 2-band toon), a **cool rim** to separate silhouettes from dark backgrounds, **fog** for depth, and
**emissive accents** as the brightest, most saturated thing on screen.

### Cited Findings
- Toon shading works by quantising lighting into a set number of bands; "cel-shading" popularly also means adding ink outlines — [EPFL Graph Search, cel shading](https://graphsearch.epfl.ch/concept/697990) (search summary)
- Team Fortress 2 (SIGGRAPH 2007, Mitchell, Francke, Eng): a **diffuse light-warping function** (a ramp texture looked up by the
  half-Lambert term) plus a **rim lighting** formulation; Valve's wiki says the light-warp texture creates high-contrast shadows with
  **red-tinged terminators**, and rim highlights accentuate character silhouettes so they don't blend into scenery — [Mitchell et al. course notes](https://www.advances.realtimerendering.com/s2007/Mitchell-IllustrativeRenderingInTF2(Siggraph07%20Course%20Notes).pdf); [Valve Developer wiki, Lightwarp](https://developer.valvesoftware.com/wiki/Lightwarp); [Valve Developer wiki, $rimmask](https://developer.valvesoftware.com/wiki/$rimmask) (search summaries)
- Sable-inspired fan shaders draw shadow outlines by comparing quantised lighting values of neighbouring pixels against a threshold (a
  post-process; not Sable's own code) — [80.lv, Sable-inspired Godot shader](https://80.lv/articles/have-a-look-at-this-bright-godot-shader-inspired-by-sable/) (search summary); Moebius-style post-processing with normal-buffer edge detection is documented for three.js — [Maxime Heckel blog](https://blog.maximeheckel.com/posts/moebius-style-post-processing) (search summary)
- **three.js r128 HemisphereLight** (shader source): `weight = 0.5·dot(N, up) + 0.5; irradiance = mix(groundColor, skyColor, weight)`
  (× PI unless physically-correct lights) — i.e. a two-colour gradient by facing — [three.js r128 lights_pars_begin.glsl.js](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/lights_pars_begin.glsl.js)
- **three.js r128 MeshToonMaterial:** `gradientMap` is a ramp looked up by `dotNL·0.5+0.5`; the texture must use `NearestFilter` for min
  and mag filters; with no gradientMap it uses a hard 2-step (0.7 below, 1.0 above `coord.x = 0.7`) — [r128 gradientmap_pars_fragment](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/gradientmap_pars_fragment.glsl.js); [r128 MeshToonMaterial docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/MeshToonMaterial.html)
- **three.js r128 `Material.dithering`:** "Whether to apply dithering to the color to remove the appearance of banding." Default false — [r128 Material docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/Material.html)
- Gradient fog textures (RGB over distance and height) are a known technique in other engines, e.g. Valve's SteamVR environments — [Valve SteamVR fog tutorial](https://developer.valvesoftware.com/wiki/SteamVR/Environments/Fog_Tutorial) (search summary)

### Inferences
- **Soft ramp, not cartoon:** a hard 2-band toon reads as cartoony. For dark fantasy, either (a) keep MeshStandard/Lambert lighting and
  apply half-Lambert wrap `pow(0.5*NdotL+0.5, 2)` for gentle shadow sides, or (b) MeshToonMaterial with a **4–6 step** gradientMap whose
  dark end is a desaturated cool colour (blue/violet) and whose shadow edge has a narrow, slightly warm/red step (the TF2 "terminator"
  trick, toned down).
- **Rim / fresnel** in r128 via `onBeforeCompile`, add after lighting: `float rim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition*-1.0))), 3.0); outgoingLight += rimColor * rim * rimStrength;`
  Use a cold, dim rim (moonlight blue / sickly green per biome) at low strength (0.2–0.5) — enough to cut the silhouette out of dark
  backgrounds. On flat-shaded meshes the rim jumps face by face; that's fine and fits the faceted look.
- **Hemisphere light settings for dark fantasy:** sky colour a desaturated cool blue-grey, ground colour a dark warm brown/red-brown, plus
  one directional "moon" or "torch" key light. The ground colour lighting the undersides is what makes creatures feel set in the world.
- **Fog:** keep `FogExp2` (already used) and match fog colour to the sky/background so distant creatures lose contrast first —
  the Firewatch/Sable depth trick. Emissive parts are also fogged in r128 standard materials, so very bright eyes fade with distance;
  if eyes should glow through fog, set `fog:false` on those small eye materials.
- **Emissive accents:** a small part (eyes, rune lines, a core) with `emissive` set and a dark body around it is the cheapest readability
  win in a dark scene. Keep them the **only** high-saturation, high-value pixels on the creature. Bloom is optional and costly on mobile;
  a fake glow (a slightly larger additive, transparent copy or sprite) is cheaper.
- **Posterise** (quantise final brightness into N steps) gives a painterly/retro look; combine with `dithering:true` (or ordered Bayer
  dithering in a shader) to avoid banding in dark gradients — dark fog-heavy scenes band badly on 8-bit displays.

### Gaps
- Exact TF2 light-warp function and rim formula were not read (PDF blocked); only summaries.
- No primary source on how Death's Door, Tunic or similar games do rim/emissive was reachable.

## 5. Making many models read distinctly with colour alone (and avoiding noisy per-face colour)

### Takeaway
Readability comes from **value** (light/dark) first, then hue, then saturation. Give each enemy family a small fixed palette (a few ramps),
shift shadows cooler and lights warmer modestly, save high saturation for accents/emissives, and check in greyscale. Random per-face colour
noise destroys the value structure and makes models read as camouflage.

### Cited Findings
- Readability comes from value contrast, not colour; a greyscale check shows whether shapes still read; different hues with similar
  brightness still look blurry — [Wayline, Colour and limited palettes](https://www.wayline.io/learn/pixel-art/2); [Wayline colour-palettes course](https://www.wayline.io/learn/color-palettes/2) (search summaries)
- Common advice: shift shadows toward cool and highlights toward warm; darkening by brightness alone tends to look flat and muddy — [Wayline colour-palettes course](https://www.wayline.io/learn/color-palettes/2) (search summary)
- Limited palettes force cohesion and read better at small sizes; suggested range 8–32 colours per scene (another guide: start at 8–16);
  Sword & Sworcery uses a cool muted palette with warm oranges/yellows reserved for emphasis — [Wayline blog, limited palettes](https://www.wayline.io/blog/art-of-limited-color-palettes-game-design) (search summary)
- Counterpoint from a game style guide: heavy hue shifting can make an object look like it is under a different light than the rest of the
  scene; keep lighting consistent and shift hue only modestly — [Pocket Worlds creator docs, material art guide](https://github.com/pocketzworld/creator-docs/blob/main/pages/learn/designer-resources/artguides/material.md) (search summary)
- An Aseprite forum reply argues hue shifting is an oversimplification but some shift is usually wanted — [Aseprite community](https://community.aseprite.org/t/designing-a-palatte-advice-needed/11637) (search summary)
- TF2's art direction used rim highlights specifically so characters do not blend into scenery — [Valve Developer wiki, $rimmask](https://developer.valvesoftware.com/wiki/$rimmask); [Valve GDC 2008](https://cdn.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf) (search summaries)
- Seed colour variation from face orientation (not random per face) so it is consistent; tie colour to normal so the result looks
  intentional — [Unreal forum](https://forums.unrealengine.com/t/ue4-crash-reporting-and-troubleshooting/10147); [Autodesk Live Design](https://blogs.autodesk.com/live-design-stories/?p=198) (search summaries)

### Inferences
- **Per-enemy colour recipe:** 1 dominant body colour (60–70 % of the surface), 1 secondary (armour/cloth/bone, 20–30 %), 1 accent
  (emissive or blood-red, under 5 %). Make the body value clearly different from the ground of the biome it spawns in.
- **Families by value and hue, not detail:** e.g. undead = desaturated pale on dark; vampires = deep red-black with pale skin; frost = cold
  light values; ooze/cursed = dark with saturated accent glow. A greyscale screenshot of a crowd should still separate player, elites and
  minions.
- **Hue-shifted shadows in code:** instead of `colour * ao`, use `mix(shadowTint * colour, colour, ao)` where `shadowTint` is a cool,
  slightly more saturated colour (e.g. toward blue-violet), and for lit tops a slight warm shift. Keep shifts small (a few degrees of hue,
  ±5–10 % saturation) for "not cartoony".
- **Saturation control:** dark fantasy reads best with low-to-mid saturation bodies and high saturation reserved for accents. Very
  saturated bodies look toy-like.
- **Noise budget:** allowed variation per face ≤ ~3–5 % value, 0 % hue, from smooth object-space noise; never more than the AO/gradient
  contrast, or it competes with the form.

### Gaps
- No quantitative study of "how much per-face noise is too much" was found; the noise budget above is my judgement.
- No game-specific art bible (Death's Door, Tunic, Hollow Knight-likes) on palette per enemy type was reachable.

## 6. three.js r128 specifics (vertexColors, flatShading, aoMap/uv2, hemisphere light, colour space)

### Takeaway
In r128: `vertexColors: true` multiplies the material colour by the `color` attribute; **MeshLambertMaterial lights per vertex (Gouraud)
and has no `flatShading`** (that arrived later, e.g. r145 docs list it); MeshStandardMaterial supports `flatShading`; `aoMap` needs a
`uv2` attribute and **only darkens indirect (ambient/hemisphere) light**, so for procedural meshes it is easier and stronger to bake AO into
vertex colours.

### Cited Findings
- `Material.vertexColors` is a boolean in r128 ("Defines whether vertex coloring is used. Default is false") — [r128 Material docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/Material.html)
- Shader: `vColor = vec3(1.0); vColor *= color;` (and `*= instanceColor` for instanced meshes) — the vertex colour then multiplies the
  material's diffuse colour — [r128 color_vertex.glsl.js](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/color_vertex.glsl.js)
- r128 MeshLambertMaterial: "Shading is calculated using a Gouraud shading model. This calculates shading per vertex (i.e. in the vertex
  shader) and interpolates the results over the polygon's faces." Its docs list no `flatShading` property, while the r145 Lambert docs do — [r128 MeshLambertMaterial docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/MeshLambertMaterial.html); [r145 MeshLambertMaterial docs](https://github.com/mrdoob/three.js/blob/r145/docs/api/en/materials/MeshLambertMaterial.html)
- r128 Lambert vertex shader accumulates `vLightFront`/`vIndirectFront` (ambient, light probe, point/spot/directional/hemisphere) per
  vertex — [r128 lights_lambert_vertex.glsl.js](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/lights_lambert_vertex.glsl.js)
- r128 MeshStandardMaterial computes lighting per pixel and has `flatShading` ("Define whether the material is rendered with flat
  shading. Default is false") — [r128 MeshStandardMaterial docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/MeshStandardMaterial.html)
- `aoMap`: "The red channel of this texture is used as the ambient occlusion map … The aoMap requires a second set of UVs"; the shader
  declares `attribute vec2 uv2` only when `USE_LIGHTMAP` or `USE_AOMAP`, and applies `ambientOcclusion = (texture2D(aoMap, vUv2).r - 1.0) * aoMapIntensity + 1.0; reflectedLight.indirectDiffuse *= ambientOcclusion;` (plus specular occlusion with an envMap on Standard) — [r128 MeshStandardMaterial docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/materials/MeshStandardMaterial.html); [r128 uv2_pars_vertex](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/uv2_pars_vertex.glsl.js); [r128 aomap_fragment](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/aomap_fragment.glsl.js)
- r128 HemisphereLight: constructor `(skyColor, groundColor, intensity)`, defaults white/white/1; irradiance is `mix(ground, sky, 0.5·N·up + 0.5)` — [r128 HemisphereLight docs](https://github.com/mrdoob/three.js/blob/r128/docs/api/en/lights/HemisphereLight.html); [r128 lights_pars_begin](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/lights_pars_begin.glsl.js)
- r128 `WebGLRenderer` defaults: `outputEncoding = LinearEncoding`, `toneMapping = NoToneMapping` — [r128 WebGLRenderer.js](https://github.com/mrdoob/three.js/blob/r128/src/renderers/WebGLRenderer.js)
- A GPU ray-traced AO lightmapper extension exists for the three.js editor; it outputs textures and auto-generates `uv2`, i.e. not
  per-vertex — [three.js forum, Quick AO Lightmapper](https://discourse.threejs.org/t/quick-ao-lightmapper-is-now-available-for-three-js-editor/92030.md) (search summary)

### Inferences
- **Why vertex-colour AO beats aoMap here:** procedural meshes have no UVs (and no `uv2`), and aoMap only scales *indirect* light — a
  creature lit mostly by a directional light would barely show it. AO multiplied into vertex colour darkens direct and indirect light
  alike. If AO should affect only ambient (more "correct"), store AO in a custom attribute and multiply `reflectedLight.indirectDiffuse`
  by it in `onBeforeCompile` (same place `aomap_fragment` does it) — no texture or uv2 needed.
- **Lambert vs Standard:** Lambert (per-vertex) is cheaper on mobile but cannot be flat-shaded in r128; on low-poly meshes its per-vertex
  lighting also smears across big triangles. For the faceted look keep `MeshStandardMaterial` with `flatShading:true` (roughness ~1,
  metalness 0), or use Lambert on a **non-indexed** geometry with face normals computed (`toNonIndexed()` + `computeVertexNormals()`),
  which gives flat lighting even with Gouraud.
- **Colour space caution (r128):** `Color.setHex()` in r128 does not convert sRGB→linear, and the default output encoding is linear, so
  vertex colours behave as "what you type is what you see" only if the project keeps the linear default. If the renderer is ever switched
  to `sRGBEncoding`, all hand-picked vertex colours will look lighter and washed out unless converted (`color.convertSRGBToLinear()`).
  (The RuneLite HD note in Q3 shows the same gamma-vs-linear lighting issue.)
- **Vertex count cost:** baking AO/gradients into the existing `color` attribute costs zero extra triangles and zero extra GPU memory
  if the attribute already exists. A separate float attribute costs 4 bytes per vertex.
- **Mobile cost ranking (cheapest → most expensive):** baked vertex colour terms (free at runtime) < HemisphereLight (a few ALU ops) <
  rim/half-Lambert via `onBeforeCompile` (a few ops per pixel) < fog (cheap) < MeshToonMaterial < post-process outlines/posterise
  (full-screen pass) < bloom (several full-screen passes).
- **onBeforeCompile tip for r128:** materials with different shader code must have distinct `customProgramCacheKey()` results or three.js
  may reuse the wrong compiled program.

### Gaps
- Exact three.js release where MeshLambertMaterial switched from per-vertex to per-fragment lighting was inferred from docs (r128 says
  Gouraud, r145 lists flatShading); the precise version number was not confirmed from release notes.
- No mobile GPU benchmarks for these options in three.js were found; the cost ranking is reasoning, not measured.
