# Texture mapping techniques that add detail to low-poly characters (with game case studies)

> **Method note for the report writer.** In this session WebFetch was blocked for every host tried (80.lv, polycount.com,
> wowhead, itch.io, generationamiga.com all failed DNS: "outside the session's allowed network domains"). Every cited finding
> below therefore comes from **web-search result summaries**, not from reading full pages. The URLs are the pages the search
> tool attributed the claims to. Treat numbers as "reported by that page", and prefer re-checking the key ones if network access
> to those domains is enabled later. Items marked *Inference* are my reasoning (including general three.js r128 API knowledge),
> not sourced facts.

## 1. UV unwrapping for small low-poly enemies (islands, texel density, seams)

### Takeaway
For small enemies seen at game distance, use few, large UV islands, put seams on hidden edges, give the face/head more texels
than the back, and mirror symmetric halves to double effective resolution for free. Exact texel-density numbers are pipeline
starting points, not standards.

### Cited Findings
- Set texel density by how important an area is to the camera, not just by object size — [lowpoly3d UV guide](http://lowpoly3d.com/en/tools/uv-unwrap-low-poly)
- A character's face can get about **2x** the texel density of the back, since players look at faces most; keep the rest of the body consistent — [bitsoulhosting UV guide](https://bitsoulhosting.com/marketplace/blog/uv-mapping-game-assets-complete-guide)
- Ready Player Me suggests about **10.24 px/cm** as a starting texel density, and says fewer, larger islands are better because each UV split adds vertex data — [Ready Player Me modeling guidelines](https://docs.readyplayer.me/ready-player-me/customizing-guides/create-custom-assets/modeling-guidelines)
- Leave padding between UV islands split along hard edges, or you get artifacts; padding also matters for mipmaps and compression — [Ready Player Me](https://docs.readyplayer.me/ready-player-me/customizing-guides/create-custom-assets/modeling-guidelines); [lowpoly3d](http://lowpoly3d.com/en/tools/uv-unwrap-low-poly)
- Put seams on hidden edges, undersides, hard material breaks and natural panel lines; avoid running seams through large visible gradients, where mipmaps bleed colour across the seam — [lowpoly3d](http://lowpoly3d.com/en/tools/uv-unwrap-low-poly)
- Mirroring symmetric halves onto the same UV space roughly doubles effective density at no extra texture memory — [nastyrodent UV best practices](https://nastyrodent.com/uv-unwrapping-for-games/)
- Old Polycount advice: merge hands and feet onto shared islands to reduce visible seams — [Polycount "Character UVs"](https://polycount.com/discussion/218742/character-uvs)
- 2048 px is suggested only for characters/hero or close-inspection assets; 512–1024 px for most props (a mid/high-poly, not retro, guideline) — [lowpoly3d](http://lowpoly3d.com/en/tools/uv-unwrap-low-poly)
- Check density and stretching with a checker texture before painting/baking — [nastyrodent](https://nastyrodent.com/uv-unwrapping-for-games/); [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- For palette workflows, UV layout is very different: islands are tiny or collapsed into a swatch, not spread out by texel density (see section 2) — [savedpixel: unwrapping for low-poly and palette textures (2026)](https://savedpixel.com/blog/unwrap-uv-blender/)

### Inferences
- For *procedurally generated* enemies (this project), classic hand unwrapping is not needed. Each generated primitive (box,
  cylinder, cone, sphere segment) can get planar/cylindrical UVs computed in code into its own atlas cell. Body parts mirrored
  left/right can share the same cell (mirroring rule above).
- At game distance an enemy may cover only ~100–300 screen pixels in height; a 128–256 px texture per enemy is probably already at
  or above the screen's ability to show it, so extra texel density mostly matters for the head/face and any glowing details.
- Every UV seam and every hard (flat-shaded) edge duplicates vertices. That costs vertex count, not triangle count, so it does
  not hurt the "triangle budget", but very fragmented UVs on generated meshes raise memory slightly.

### Gaps
- No sourced texel-density numbers specific to retro/PS1-style enemies (e.g. "N px per metre in Dusk"). Only general guides found.

## 2. Palette / gradient-atlas texturing (Imphenzia / Synty style)

### Takeaway
One tiny texture of colour swatches or gradient strips is shared by every model; UVs (often collapsed to a point or a short line)
pick a colour or a slice of a gradient. It gives one material for everything (great for batching), instant recolouring by moving
UVs or swapping the palette image, and gradients add cheap fake shading. The downside is little surface detail (no wear, runes,
scars) unless extra swatches/decals are added.

### Cited Findings
- Gradient texturing uses compact, low-resolution palette textures with organized gradient strips to simulate lighting, shadows and colour transitions; UVs point at strips of the palette — [80.lv: elevating gradient texturing to a standard workflow in Blender](https://80.lv/articles/elevating-gradient-texturing-to-a-standard-workflow-in-blender) (content seen only via search summary)
- Recolouring/relighting a model is done by moving UVs or swapping the palette image, not repainting — [80.lv](https://80.lv/articles/elevating-gradient-texturing-to-a-standard-workflow-in-blender); a commercial mecha asset uses "overlapping UV mapping" on a single gradient palette for exactly this — [Unreal forums, IGANIX Vermilion Phantom](https://forums.unrealengine.com/t/iganix-art-vermilion-phantom-stylized-low-poly-mid-poly-mecha-asset-rigged/2835990)
- The "PixPal" palette texture is described as the palette used in Imphenzia's videos; a Japanese CG World masterclass article credits the shared-palette method to Imphenzia's published work — [PixPal (payhip)](https://payhip.com/b/8KOlD); [CGWORLD masterclass](https://cgworld.jp/special/masterclass-online/vol19/page/kiyotako.html)
- Tools exist that automate it: Palette Grid (Blender add-on: palette creation, live editing, strip selection, one-click UV snapping); MV Low Poly Painter (builds a UV atlas with palette rows) — [Palette Grid](https://superhivemarket.com/products/palettegrid); [MV Low Poly Painter docs](https://superhivemarket.com/products/mv-low-poly-painter/docs)
- Free CC0 gradient palette textures exist (e.g. "Texture Gradient Palette") — [itch.io: Texture Gradient Palette](https://tenebra23.itch.io/texture-gradient-palette); [Gradient Palette Generator](https://enfpdev.itch.io/gradient-palette-generator)
- Blender tutorial showing palette texturing of low-poly art (model → UV unwrap → shader) — [BlenderNation: texturing low poly art with color palettes](https://www.blendernation.com/2020/05/21/texturing-low-poly-art-with-color-palettes/)
- Sketchfab ran a "#gradientchallenge" spotlighting gradient-textured low-poly models — [Sketchfab Art Spotlight: Kaya](https://sketchfab.com/blogs/community/art-spotlight-kaya-gradientchallenge)
- Atlasing many objects onto one texture + one material lets them batch, reducing draw calls and memory (useful on mobile) — [Unity Learn: Texture Atlases](https://learn.unity.com/tutorial/texture-atlases-7428); Three.js is named as a case where a shared atlas/material minimises WebGL state changes — [Sloyd glossary](https://www.sloyd.ai/glossary/texture-atlas)
- Caveat: an atlas only cuts draw calls if its contents are actually on screen together — [O3DE docs](https://www.docs.o3de.org/docs/user-guide/interactivity/user-interface/canvases/texture-atlases/texture-atlases-using-texture-atlases-to-reduce-ui-draw-calls/)

### Inferences
- Fit with this project: the game's enemies are generated in code with flat colours. A palette atlas is the *smallest change*:
  generate one shared `CanvasTexture` (e.g. 256×256, `NearestFilter`) of dark-fantasy swatches and gradient strips, and give each
  generated face UVs into a strip. A vertical gradient strip mapped along a limb (dark at joints/bottom, lighter at top) adds
  "painted ambient occlusion" with zero extra triangles.
- Because all enemies could share one material, enemies that are not skinned differently could be merged per type, saving draw calls.
  (Skinned meshes in three.js r128 still need one draw call per `SkinnedMesh`; atlasing helps by letting each enemy be *one* mesh
  instead of many coloured sub-meshes.)
- Pure palette texturing reads "clean/toy-like" (Synty look). For gritty dark fantasy, the gradient strips should be desaturated and
  noisy (dirty gradients), or combined with a small detail/grime texture (section 5).

### Gaps
- Could not read Imphenzia's own description (YouTube) or Synty's official pipeline docs; no sourced numbers for Synty atlas sizes.

## 3. Hand-painted textures (World of Warcraft, Torchlight, Darksiders style)

### Takeaway
Hand-painted style puts light, shadow, form and wear directly into the colour (diffuse) texture, often starting from baked AO,
curvature or the green channel of a normal map, then painted over. Community/portfolio budgets for such characters are roughly
**700–2,000 triangles with 256–512 px textures**; classic WoW characters were reportedly **under ~1,000 triangles** before their
HD remake.

### Cited Findings
- WoW: a Blizzard art director's post about the Warlords of Draenor character remake said polygon counts rose significantly, in
  some cases **from less than 1,000 to over 5,000**, and texture resolution more than doubled — [Wowhead CN news 226814](https://cn.wowhead.com/news=226814) (seen only via search summary; vanilla numbers not stated directly)
- A newer WoW Malfurion model is cited at **5,560 tris** in a modding forum comparison — [Polycount comment](https://polycount.com/discussion/comment/1621000) (search-attributed; low reliability)
- WoW's M2 format has a reported triangle limit of 21,845 per model, bypassed from Mists of Pandaria via geometry levels — [WoW modding archive](https://elijahketchersid.com/forums/thread-127.html) (community source)
- Darksiders (Vigil): stylized games often skip PBR and bake lighting into diffuse "typically through overlaying the green channel
  of an Object Space Normal Map over the painted colour", with highlights and shadows painted in; Darksiders characters had
  "a decent amount of lighting information baked into the diffuse", which later caused problems balancing PBR lighting in Unreal — [Steven Skidmore, Darksiders postmortem](https://www.exp-points.com/steven-skidmore-darksiders-and-houdini)
- Darksiders 2 forum account: textures were "mostly just AO maps with curvature maps or desaturated normals" set to soft-light
  blending to add lighting to the diffuse; another reply says Darksiders used the full range of texture maps (sources disagree) — [Polycount: Darksiders art workflow](https://polycount.com/discussion/140010/darksiders-art-workflow)
- Torchlight: no source found on the original art pipeline; only a fan retexture mod that says it adjusted lighting so textures
  "no longer look like cardboard" — [ModDB TET mod](https://www.moddb.com/games/torchlight/addons/tet-torchlight-enhanced-textures-v095)
- Mobile/portfolio budgets: one character built to a **1,000-tri** limit with **256×256** diffuse/normal/spec maps; an ArtStation
  mobile test capped at 2,000 polys came in at **705 tris + 100-tri weapon with one 512×512 texture**; one assignment allowed
  **256 px total texture space for the whole character** — [search summary of Polycount threads](https://polycount.com/discussion/comment/1980895); [Samantha Howze ArtStation](https://samanthahowze.artstation.com/projects/lxe1Xk)
- A commercial Unity pack ships 18 sets of hand-painted **512×512** atlas textures — [Unity Asset Store](https://assetstore.unity.com/packages/slug/20159)
- A 2023 thesis covers hand-painting low-poly characters in 2D and 3D programs without a high-poly base — [Theseus: Texturing process in hand painted low poly game art](https://www.theseus.fi/handle/10024/804299)
- Polycount has a long thread on whether to combine normal maps with hand-painted textures — [Polycount: normal mapping with hand painted textures](https://polycount.com/discussion/55064/thoughts-on-using-normal-mapping-with-hand-painted-textures); and on baking normal-map lighting into diffuse — [Polycount: baking normal map lighting into diffuse](https://polycount.com/discussion/124757/max-baking-normal-map-lighting-info-into-diffuse-map)

### Inferences
- The project can *procedurally imitate* hand-painting: when generating each enemy's texture in a canvas, paint (a) a vertical
  top-light gradient, (b) darker edges/joints (fake AO), (c) noise and scratches, (d) a rim of lighter colour on upper edges.
  This is the "AO + curvature + green-channel overlay" recipe from Darksiders, done in code.
- Baked-in lighting fights dynamic lighting (Darksiders' PBR problem). With `MeshLambertMaterial`/`MeshStandardMaterial` in three.js,
  keep baked shading subtle so torches/spell lights still read; or use `MeshBasicMaterial` for a fully painted, unlit look.
- The budgets above (700–2,000 tris) suggest the owner's old 2–5k-triangle enemies were already generous for this style; 10–15k is
  far above hand-painted-era norms.

### Gaps
- No primary source for vanilla WoW creature/character triangle counts or texture sizes (the 1,000 figure is "in some cases").
- No source for Torchlight's texture sizes or whether it used normal maps.

## 4. Low-resolution pixel textures / PS1 style (Dusk, Ultrakill, Iron Lung, Signalis, Dread Delusion, Lunacid, King's Field)

### Takeaway
The look comes from tiny textures (32–128 px, PS1 max 256) shown with nearest-neighbour filtering, a limited colour palette,
very low triangle counts, and optional affine warping and vertex snapping. Gritty detail is painted into the pixels rather than
modelled. Developers of these games describe it as a deliberate style; specific per-game texture sizes were not found.

### Cited Findings
- PS1 texture pages: 256×256 absolute maximum, 256×128 rare, **128×128 the common maximum in practice**; the console had only
  **1 MB VRAM** — [32-bit jam thread: texture resolution / polygon count](https://itch.io/jam/32-bit-jam/topic/981913/texture-resolution-polygon-count) (community)
- Affine texture warping was a flaw PS1 developers worked to avoid; Final Fantasy's Koji Sugimoto says he is puzzled by fans' love for it — [Notebookcheck](https://www.notebookcheck.org/El-desarrollador-de-Final-Fantasy-Koji-Sugimoto-desconcertado-por-la-atraccion-de-los-fans-por-los-encantadores-graficos-retro-de-bajo-poligonaje-de-la-PS1.1084404.0.html)
- PS1 games worked around affine distortion by tessellating large polygons; a three.js PSX project advises **32–128 px textures with
  `THREE.NearestFilter`** and subdividing large floors/walls into ~2 m triangles — [threejs-psx-shader (GitHub)](https://github.com/lferreira457/threejs-psx-shader)
- three.js PSX implementations: vertex snapping, affine mapping, low-res render, ordered dithering, reduced colour depth, fog,
  CRT filter, applied as material patches via `onBeforeCompile` — [threejs-psx-shader](https://github.com/lferreira457/threejs-psx-shader); npm `three-psx` (vertex snapping, affine mapping, 15-bit dithered output) — [jsDelivr three-psx](https://www.jsdelivr.com/package/npm/three-psx)
- Vertex snapping = scale clip-space X/Y, floor to a grid, scale back; grid resolution tunes the jitter — [Roman Liutikov: PS1 style graphics in Three.js](https://romanliutikov.com/blog/ps1-style-graphics-in-threejs); [Codrops PS1 jitter shader (2024)](https://tympanus.net/codrops/2024/09/03/how-to-create-a-ps1-inspired-jitter-shader-with-react-three-fiber/)
- Affine mapping in a shader = remove perspective correction from UV interpolation — [three.js forum thread](https://discourse.threejs.org/t/affine-texture-mapping-in-shader-ps1-style-graphics/5945/8); [gist](https://gist.github.com/bandinopla/497bcd86ba2bb662e0ab4cb47190748e)
- Current three.js TSL docs list a `.retroPass()` (vertex snapping, affine mapping, low-res render) — [three.js TSL docs](https://threejs.org/docs/pages/TSL.html)
- **Dusk** (David Szymanski): deliberately low-res textures with a **limited colour palette** and low polygon counts; KillScreen
  stresses it was "not just lower res textures, but textures that had a smaller color palette"; it started from a low-poly
  shotgun fixed to the camera to emulate Quake — [KillScreen](https://www.killscreen.com/dusk-90s-style-shooter-mind-teenager/); [Wikipedia: Dusk](https://en.wikipedia.org/wiki/Dusk_(video_game))
- Dusk ships an in-game slider for texture filtering/pixelation from modern to "very crunchy" — [Grimoire of Horror review](https://www.grimoireofhorror.com/the-banshee/dusk-2018-game-review)
- Dusk's free HD update (Dec 2023, largely by David "Garumin" Bonin) involved changing texel densities and redoing textures and
  weapon models — [NoobFeed](https://www.noobfeed.com/news/highly-praised-boomer-shooter-dusk-is-getting-an-hd-upgrade); [Wikipedia](https://en.wikipedia.org/wiki/Dusk_(video_game))
- **Signalis** (rose-engine, Alex Zwerger): low-poly 3D models plus 2D sprites for "pixel-perfect visuals"; the style is "a direct
  result of my personal art style" — [IndieGraze interview (2018)](https://indiegraze.com/?p=989); reviewers describe simplified
  PS1-like textures, lighting and shadows — [Gamecell review](https://gamecell.co.uk/reviews/signalis)
- **Dread Delusion**: by Lovely Hellplace, Unity engine; "old-school graphics, creepy creatures"; compared to King's Field and Morrowind — [Wikipedia: Dread Delusion](https://en.wikipedia.org/wiki/Dread_Delusion); [Steam discussion](https://steamcommunity.com/app/1574240/discussions/0/3825284144456970611)
- **Lunacid**: described as the closest commercial King's Field-like on Steam, with "carefully realized retro environments" — [ResetEra Lunacid thread](https://www.resetera.com/threads/lunacid-kings-field-like-on-steam-fan-club-now-out-of-early-access.721213/); [GameRant: games inspired by King's Field](https://gamerant.com/best-modern-games-inspired-by-fromsoftwares-kings-field/)
- Indie devs say low-poly limits suit horror because they "encourage weird unique compromises" — [inkl / indie devs on low poly horror](https://www.inkl.com/news/indie-devs-discuss-why-low-poly-works-so-well-for-horror-i-actually-think-those-limitations-encourage-weird-unique-compromises)

### Inferences
- For three.js **r128**: `texture.magFilter = THREE.NearestFilter` (and `minFilter = NearestFilter` or `NearestMipmapNearestFilter`)
  gives the crisp-pixel look. TSL/`retroPass()` belongs to the newer node/WebGPU system and is **not available in r128**; use the
  `onBeforeCompile` approach instead.
- A 64×64 or 128×128 canvas texture per enemy type, painted procedurally with a 16–32 colour dark palette, plus nearest filtering,
  is likely the strongest "gritty dark fantasy without triangles" option, and matches King's Field-like games.
- Affine warping and vertex jitter are optional flavour; on characters they may look like bugs, so test before adopting. Nearest
  filtering + limited palette are the core of the look.
- Silhouettes in these games are very simple (hundreds to low thousands of triangles); detail like ribs, eyes, rust and blood is
  pixels.

### Gaps
- No sourced texture sizes or triangle counts for Dusk, Ultrakill, Iron Lung, Signalis, Dread Delusion, Lunacid or King's Field
  enemies. No developer interview found for Lunacid. Ultrakill and Iron Lung were not covered by any result.

## 5. Trim sheets, tiling detail textures, atlases and decals (eyes, runes, scars, blood, belts)

### Takeaway
Detail that sits *inside* the silhouette (eyes, runes, scars, stitches, belts, blood, rust) should be painted/decalled, not
modelled. Atlases let many such details share one texture and one material. Little sourced material was found specifically on
trim sheets or decals for characters.

### Cited Findings
- Keep outline and functional form in geometry; move bevels, stamped marks, scratches and wear into maps — [3DSkillUp high-to-low poly guide](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- Hybrid approach: bake large/mid detail, then add painted or photo-sourced fine detail (fabric weave, scratches, pores) — [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- Atlas + shared material → batching → fewer draw calls and less memory — [Unity Learn](https://learn.unity.com/tutorial/texture-atlases-7428); [GarageFarm on texture atlases](https://garagefarm.net/blog/texture-atlas-optimizing-textures-in-3d-rendering)
- Mobile WebGL: draw calls and overdraw are the top bottlenecks; a rough ceiling of **200–500 draw calls** on mobile WebGL; instancing
  has setup overhead and is not worth it under ~10–20 instances, where merging geometry is simpler — [abratabia (unverified, low-quality source)](https://abratabia.com/mobile-browser-performance/reducing-draw-calls.php)

### Inferences
- Practical recipe: one shared "detail atlas" (e.g. 256×256) with cells for glowing eyes, mouths/teeth, rune bands, stitched
  scars, belt/strap strips, rivets, blood splats. Generated meshes put UVs for the head front into the eye cell, for a band of
  torso faces into a belt strip, etc. That is a character "trim sheet".
- Glowing eyes/runes: paint them into the texture and use the same texture as `emissiveMap` (or a second small emissive atlas)
  so they glow without extra geometry or lights.
- A *tiling* grime/noise texture multiplied over flat colours (second UV scale or `onBeforeCompile` world-space noise) adds grit
  to any enemy at almost no cost.
- Blood or damage could be swapped at runtime by changing the texture (or a second decal texture), not the mesh.

### Gaps
- No sourced case study of trim sheets or decals on low-poly *characters* (search returned only environment/general results).

## 6. Normal maps and bump maps on low-poly models

### Takeaway
Normal maps change lighting but never the silhouette, and they make faces read as smooth bumps rather than facets, so they fight a
deliberate flat-shaded look. They also add a second texture per material. For this style they are usually the wrong tool; painted
shading is cheaper and matches the look.

### Cited Findings
- A normal map cannot change the silhouette; the outer profile must be in the low-poly mesh; outline changes are geometry's (or
  displacement's) job — [Polycount wiki: Normal map](http://wiki.polycount.com/wiki/Normal_map); [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- If a fold changes the silhouette or must deform in animation, it needs real low-poly topology — [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- Flat-shaded low-poly style uses no texture; its look comes from facets catching light differently. If you want facets, leave
  out normal-map detail, or the surface reads as smooth bumps — [lowpoly3d: Flat-shaded vs textured](https://lowpoly3d.com/en/styles/low-poly-texture)
- Mirrored normal maps show a seam if (127,127,255) is used as flat colour; 128 is better — [Polycount wiki](http://wiki.polycount.com/wiki/Normal_map)
- Overview of how normal maps add lighting detail to flat surfaces — [DEV Community: Normal maps explained](https://dev.to/veronicaaalin/normal-maps-explained-for-game-devs-turn-a-flat-texture-into-surface-detail-191h); [Wikipedia: Normal mapping](https://en.wikipedia.org/wiki/Normal_mapping)
- Mobile character example used 256×256 diffuse + normal + specular on a 1,000-tri character (normal maps are used even at low budgets) — [Polycount summary](https://polycount.com/discussion/comment/1980895)

### Inferences
- In three.js r128 a normal map needs tangent-space math in the fragment shader (r128 can derive tangents from screen-space
  derivatives) and a second texture fetch; cheap on desktop, noticeable but usually fine on mobile. The bigger problem is style,
  not speed.
- A small `bumpMap` (greyscale, can reuse the painted texture's luminance) gives a subtle "carved" feel for runes/scales with no
  extra asset; worth testing only on smooth-shaded parts.
- If the game keeps `flatShading: true`, skip normal maps entirely; put all shading in colour.

### Gaps
- No sourced measurements of normal-map cost on mobile WebGL.

## 7. Geometry vs texture: the silhouette rule

### Takeaway
Spend triangles only on what changes the outline (horns, spikes, claws, tails, weapon shapes, hunched posture) or must bend in
animation; everything inside the outline (eyes, ribs drawn on skin, armour plates' edges, runes, belts, scars, fur pattern) can be
colour/texture.

### Cited Findings
- Outline must exist in geometry; maps handle surface detail — [Polycount wiki: Normal map](http://wiki.polycount.com/wiki/Normal_map)
- Geometry for outline and functional form (handles, jaws, openings, major cast transitions); maps for bevels, stamped marks,
  scratches, wear — [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- Features that deform in animation need topology — [3DSkillUp](https://3dskillup.art/high-poly-to-low-poly-workflow/)
- Low-poly as a style: Wikipedia overview of low-poly meshes — [Wikipedia: Low poly](https://en.wikipedia.org/wiki/Low_poly)

### Inferences
- Applied to the 10–15k-triangle enemies: audit each generated part — anything that is a small bump *inside* the outline (rivets,
  teeth rows seen from the front, eye sockets, belt buckles, stitched seams, scale rows) can become texture, and round parts can
  drop segments (e.g. cylinders from 12–16 sides to 6–8), likely bringing enemies back toward the old 2–5k range.
- Keep extra triangles at joints that bend (elbows, knees, neck) so skinning still looks right.

### Gaps
- No single authoritative "silhouette rule" source; the rule is stated across normal-map guides rather than as a named principle.

## 8. Old School RuneScape / early-2000s MMO approach (flat colours, very few triangles)

### Takeaway
RuneScape-family models use **per-face colours (HSL), not textures**, on very low-poly meshes, with hard-edged banded shading. It
is the cheapest possible approach (no texture memory) but carries detail only through how many faces you cut and colour.

### Cited Findings
- OSRS models carry a face colour, not a PBR material; shading is done in HSL, which gives the banded look (from a project
  rebuilding OSRS-style rendering in three.js) — [rebuilding-runescape-browser (GitHub)](https://github.com/iniGlowee/rebuilding-runescape-browser)
- The 317-era RuneScape 2 client's `Model.java` works with HSL colour values — [RuneScape-317 Model.java](https://github.com/thedaneeffect/RuneScape-317/blob/01295ef7f90011f8c9faa696308b0e014b50b8e2/src/main/java/Model.java)
- RuneScape Classic's OB3 format stores a colour per face fill at 15-bit precision (RS2's OB3 is a different format) — [RSC Wiki: OB3](https://classic.runescape.wiki/w/OB3)
- RS3 format has per-segment face colours, face alphas and LOD index lists — [RS3 model format gist](https://gist.github.com/windwakr/c1b2a455bce93053117f765277ab63a9)
- Community recreation of the OSRS look: vertex colour base tint, hard-edged low-poly mesh, roughness 1 / specular 0; "essentially
  baked-looking vertex lighting" — [Unreal forums OSRS shader thread](https://forums.unrealengine.com/t/trying-to-make-a-shader-that-looks-like-old-school-runescape-in-ue-5-8-2/2834060)
- A Polycount comment (game not clearly named) says the engine offers textured and untextured modes so models must look good
  without textures; suggests separate flat-colour bands for shading and textures no larger than **128×128** — [Polycount comment](https://polycount.com/discussion/comment/1406012)
- Flat shading: one base colour per object, lighter/darker tones per face — [Britannica: flat shading](https://www.britannica.com/art/flat-shading)

### Inferences
- The project's current flat-coloured enemies are already close to the RuneScape approach. Its lesson: when you have no
  texture, detail comes from *colouring individual faces* (darker face rows at the base, lighter at the top, a contrasting face
  ring for a belt). In three.js that is vertex colours (`vertexColors: true`) — zero texture memory, one material for all enemies.
- A middle path for this game: vertex colours for big colour zones + one small shared grime/detail texture (sections 4–5) for grit.

### Gaps
- No sourced triangle counts for OSRS/RS2 NPCs or other early-2000s MMO characters (EverQuest, Ultima Online 3D, etc.).
