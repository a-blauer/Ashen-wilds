# Procedural textures for procedural (skinned) meshes in three.js r128

Scope note: most facts below were read directly from the three.js **r128 source** (github.com/mrdoob/three.js, tag r128),
downloaded during this research, plus the three.js Migration Guide, MDN's WebGL best-practices page (MDN content repo) and
discourse.threejs.org search results. threejs.org, iquilezles.org and bgolus.medium.com could **not** be reached from this
session (blocked hosts), so the three.js manual, Inigo Quilez's articles and Ben Golus's triplanar article are not quoted
directly; claims that would need them are in the Gaps.

Game context (checked in this repo): the game loads r128 from cdnjs
([src/page.html line 106](src/page.html); [README.md line 3](README.md)), creates
`new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'})` with `shadowMap.enabled=true`,
`PCFShadowMap`, `NoToneMapping`, and never sets `outputEncoding` ([src/js/0045-game-data-world-zones-bosses.js line 278](src/js/0045-game-data-world-zones-bosses.js);
grep for `outputEncoding|sRGBEncoding` in `src/js` finds nothing). The game already makes `CanvasTexture`s at runtime
(e.g. [3251-v164-skarrith-model.js](src/js/3251-v164-skarrith-model.js) sets `RepeatWrapping` and
`anisotropy=Math.min(8, ren.capabilities.getMaxAnisotropy())`; [3152-v151-frozen-maw.js](src/js/3152-v151-frozen-maw.js) uses a
canvas `map` + `emissiveMap`) and already chains `onBeforeCompile` hooks
([2430-v135-instance-clip.js](src/js/2430-v135-instance-clip.js), [3190-v157-camera-cutaway.js](src/js/3190-v157-camera-cutaway.js),
[1100-v89-bossfx-rime-wraith-orbs-melt.js](src/js/1100-v89-bossfx-rime-wraith-orbs-melt.js)).

## 1. Creating textures at runtime in r128 (CanvasTexture, DataTexture, filtering, mipmaps, POT, anisotropy, encoding)

### Takeaway
In r128 a `CanvasTexture` is just a `Texture` with `needsUpdate=true` and the normal defaults (linear + trilinear mipmaps,
flipY, clamp), while a `DataTexture` defaults to **Nearest filtering, no mipmaps, flipY=false**, so it must be configured by
hand. Under WebGL1 any texture that repeats or uses mipmaps must be power-of-two (canvases get silently down-scaled, DataTextures
don't); r128 asks for WebGL2 first, where that rule disappears. The game renders with `outputEncoding = LinearEncoding`, so
procedural textures should stay at the default `LinearEncoding` to match the existing vertex colours.

### Cited Findings
- `Texture` constructor defaults in r128: `wrapS/wrapT = ClampToEdgeWrapping`, `magFilter = LinearFilter`,
  `minFilter = LinearMipmapLinearFilter`, `format = RGBAFormat`, `type = UnsignedByteType`, `anisotropy = 1`,
  `encoding = LinearEncoding`; also `generateMipmaps = true`, `flipY = true`, `premultiplyAlpha = false`, `unpackAlignment = 4`,
  and `offset/repeat/center/rotation` build a `uvTransform` matrix — [Texture.js r128](https://github.com/mrdoob/three.js/blob/r128/src/textures/Texture.js)
- Texture.js comment: "Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap", and changing
  encoding after a material has used the texture needs `material.needsUpdate = true` (recompile) — [Texture.js r128](https://github.com/mrdoob/three.js/blob/r128/src/textures/Texture.js)
- `CanvasTexture(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy)` only calls `super(...)` and sets
  `this.needsUpdate = true` — [CanvasTexture.js r128](https://github.com/mrdoob/three.js/blob/r128/src/textures/CanvasTexture.js)
- `DataTexture(data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding)` stores
  `image = {data, width, height}` and defaults `magFilter = minFilter = NearestFilter`, `generateMipmaps = false`, `flipY = false`,
  `unpackAlignment = 1`, `needsUpdate = true` — [DataTexture.js r128](https://github.com/mrdoob/three.js/blob/r128/src/textures/DataTexture.js)
- r128's renderer tries contexts in the order `['webgl2', 'webgl', 'experimental-webgl']` — [WebGLRenderer.js r128 line ~213](https://github.com/mrdoob/three.js/blob/r128/src/renderers/WebGLRenderer.js)
- Power-of-two rule: `textureNeedsPowerOfTwo()` returns false on WebGL2; on WebGL1 it returns true if wrapS/wrapT is not
  `ClampToEdgeWrapping` **or** minFilter is not `NearestFilter`/`LinearFilter` (i.e. any mipmap filter) — [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js)
- `resizeImage()`: if POT is needed (or the image exceeds `maxTextureSize`), an `HTMLImageElement`/`HTMLCanvasElement`/`ImageBitmap`
  is redrawn onto a canvas at `MathUtils.floorPowerOfTwo` size, with the warning "Texture has been resized from (WxH) to (wxh)".
  A DataTexture is **not** resized; it only warns "Image in DataTexture is too big" — [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js)
- `supportsMips = isPowerOfTwo(image) || isWebGL2`; mipmaps are generated (`gl.generateMipmap`) only when
  `texture.generateMipmaps && supportsMips && minFilter` is a mipmap filter. For non-POT textures on WebGL1 r128 falls back
  filters (`filterFallback`) and warns that wrap should be ClampToEdge and minFilter Nearest/Linear — [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js)
- Anisotropy is applied only if `EXT_texture_filter_anisotropic` exists and `texture.anisotropy > 1`, clamped with
  `Math.min(texture.anisotropy, capabilities.getMaxAnisotropy())`; `getMaxAnisotropy()` returns 0 when the extension is missing — [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js); [WebGLCapabilities.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLCapabilities.js)
- `capabilities` exposes `maxTextures` (MAX_TEXTURE_IMAGE_UNITS), `maxVertexTextures`, `maxTextureSize`, `maxCubemapSize`,
  `maxVaryings`, `maxFragmentUniforms`, `floatFragmentTextures` (WebGL2 or OES_texture_float); WebGLTextures warns when a
  material needs more texture units than `maxTextures` — [WebGLCapabilities.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLCapabilities.js); [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js)
- Colour decoding in r128 happens **in GLSL**: `map_fragment` does `texelColor = mapTexelToLinear(texelColor); diffuseColor *= texelColor;`
  and `emissivemap_fragment` uses `emissiveMapTexelToLinear`; `encodings_pars_fragment` defines `sRGBToLinear`/`LinearTosRGB`
  etc. — [map_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/map_fragment.glsl.js); [encodings_pars_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/encodings_pars_fragment.glsl.js)
- `WebGLRenderer.outputEncoding` defaults to `LinearEncoding` in r128, and `outputEncoding` is part of the program cache key — [WebGLRenderer.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/WebGLRenderer.js); [WebGLPrograms.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLPrograms.js)
- Newer versions: r136→137 "sRGB decode in GLSL has been removed" and sRGB textures must be `RGBAFormat`+`UnsignedByteType`;
  r152 "`Texture.encoding` has been replaced with `Texture.colorSpace`" (default `NoColorSpace`), `outputEncoding` →
  `outputColorSpace` (default sRGB), and `ColorManagement.enabled` is true by default; r163 drops WebGL1 — [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- The official r128 terrain example builds its texture by drawing into a 2D canvas: `getImageData` → write RGBA bytes in a loop →
  `putImageData`, then redraws it 4× bigger with `context.scale(4,4); drawImage(...)` and adds `~~(Math.random()*5)` grain per pixel,
  and wraps it as `new THREE.CanvasTexture(canvas)` with `ClampToEdgeWrapping` — [webgl_geometry_terrain.html r128](https://github.com/mrdoob/three.js/blob/r128/examples/webgl_geometry_terrain.html)
- MDN: use mipmaps for any texture seen in 3D ("only 30% overhead", better texture-cache locality when minified); skip them only for
  2D resources that are never zoomed out — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- MDN: three-channel formats are often emulated; "RGB8 in particular is often surprisingly slow" — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)

### Inferences
- Recipe for a CanvasTexture in this game: canvas sized 2^n (64/128/256/512) so it also works on WebGL1 with repeat + mipmaps;
  `t.wrapS = t.wrapT = THREE.RepeatWrapping` for tiling noise; keep default `LinearMipmapLinearFilter` + `generateMipmaps` for
  models seen at a distance; `t.anisotropy = Math.min(4..8, ren.capabilities.getMaxAnisotropy())` only for textures seen at grazing
  angles (ground, long bodies) — anisotropy costs bandwidth.
- Recipe for a DataTexture: `new THREE.DataTexture(u8 /*Uint8Array w*h*4*/, w, h, THREE.RGBAFormat)` then set
  `magFilter = LinearFilter`, `minFilter = LinearMipmapLinearFilter`, `generateMipmaps = true`, `wrapS/T = RepeatWrapping`,
  `needsUpdate = true`. Use RGBA rather than RGB (alignment and RGB8 slowness). Remember `flipY=false` (row 0 = v 0 = bottom).
  A DataTexture skips canvas `getImageData`/`putImageData` round trips and avoids canvas colour-management/premultiply surprises,
  so it is the cleaner path for pure noise; canvas is better when you want paths, gradients, text (runes) or `drawImage` blur/scale.
- NearestFilter (mag) gives a crisp pixel-art / "texel" look that suits a low-poly style and hides low resolution; LinearFilter
  looks smooth but blurry on small textures. Mipmaps still matter for minification either way (`NearestMipmapLinearFilter` /
  `LinearMipmapLinearFilter`).
- Encoding: because the game outputs Linear (no sRGB conversion) and colours its models with raw vertex colours, a texture drawn
  with CSS colours will look "as painted" only if it stays at `LinearEncoding` (the default). Setting `texture.encoding = sRGBEncoding`
  without also switching `renderer.outputEncoding = sRGBEncoding` would darken the texture; switching the renderer would change the
  look of the whole game. So: leave both alone, and if the game ever moves past r152, the equivalent is `colorSpace` settings plus
  the ColorManagement default change.
- Greyscale "detail" textures that multiply the vertex colour (values around 0.6–1.0, average near 0.85–1.0) let the existing per-vertex
  palette keep working: `material.map = detail` multiplies `diffuseColor` before `color_fragment` multiplies by `vColor`.

### Gaps
- Exact r128 behaviour of `premultiplyAlpha`/`UNPACK_COLORSPACE_CONVERSION` for canvas uploads was not checked; for opaque canvases it
  should not matter.
- No measured numbers for canvas vs DataTexture generation speed on mobile were found.

## 2. Giving procedural geometry UVs (projections, atlas layout, lofts, triplanar instead)

### Takeaway
r128 materials read UVs from a BufferGeometry attribute named `uv` (vec2, set with `geometry.setAttribute('uv', new THREE.BufferAttribute(Float32Array, 2))`),
and only compile UV code when some map is set. For lofted/swept enemy parts the natural mapping is u = angle around the ring,
v = ring index (or arc length); simple parts can use spherical/cylindrical/box projection computed per vertex; many parts can be
packed into one atlas by scaling/offsetting each part's UVs into its own tile. Triplanar mapping in a shader needs no UVs at all.

### Cited Findings
- A program gets `USE_UV`/`vUv` only when the material has a `map`, `bumpMap`, `normalMap`, `specularMap`, `alphaMap`, `emissiveMap`
  (or Standard-only maps); `uv2` is used by `aoMap`/`lightMap` in r128 — [WebGLPrograms.js r128 line 212](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLPrograms.js); [uv_pars_vertex r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/uv_pars_vertex.glsl.js)
- `uv_pars_vertex` declares `varying vec2 vUv` and `uniform mat3 uvTransform` (built from texture offset/repeat/rotation) — [uv_pars_vertex r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/uv_pars_vertex.glsl.js); [Texture.js r128](https://github.com/mrdoob/three.js/blob/r128/src/textures/Texture.js)
- Later naming change: in r152 the uv attributes `uv, uv2, uv3, uv4` became `uv, uv1, uv2, uv3`, and since r151 `aoMap`/`lightMap`
  no longer use `uv2` — [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- Tangents are not required for bump or normal maps in r128: `bumpmap_pars_fragment` computes the surface gradient from
  `dFdx/dFdy(vUv)` and screen-space position derivatives (Mikkelsen, "Bump Mapping Unparametrized Surfaces on the GPU"), and
  `normalmap_pars_fragment` uses a derivative-based `perturbNormal2Arb` when `USE_TANGENT` is not defined — [bumpmap_pars_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/bumpmap_pars_fragment.glsl.js); [normalmap_pars_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/normalmap_pars_fragment.glsl.js)
- Triplanar in three.js is done by users with `onBeforeCompile`; a forum answer says it is not planned for the default materials.
  A reported "too dark" triplanar result was fixed by normalising blend weights: `bf /= dot(bf, vec3(1.0));` — [discourse: Triplanar and lighting](https://discourse.threejs.org/t/triplanar-and-lighting/35241); [discourse: Features like... coming in 3js?](https://discourse.threejs.org/t/features-like-coming-in-3js/38985); [discourse: Wrap texture around object without stretching](https://discourse.threejs.org/t/wrap-texture-around-object-without-stretching-with-meshstandardmaterial/56948) (via search-result summaries; the threads themselves were not opened)
- r128 skinning happens on `transformed` inside `skinning_vertex` (`transformed = (bindMatrixInverse * skinned).xyz`) after
  `begin_vertex` sets `vec3 transformed = vec3(position)` — [skinning_vertex r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/skinning_vertex.glsl.js); [meshlambert_vert r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_vert.glsl.js)

### Inferences
- Loft / tube parts (torso, limbs, tails, naga body): for ring i of N rings with M segments, u = j/M, v = i/(N-1) (or cumulative
  length / circumference to keep texels square). Emit **M+1** vertices per ring so the seam vertex at u=1 duplicates u=0 (same
  position, normal and skin weights, different u); otherwise the last strip interpolates u from ~1 back to 0 and smears the whole
  texture across one face. With flat-shaded/non-indexed geometry (each triangle owns its vertices) this is automatic.
- Spherical projection for heads/blobs: u = atan2(z,x)/(2π)+0.5, v = asin(y/r)/π+0.5 (pole pinching and a seam). Cylindrical:
  u from angle, v from height. Box projection: pick the dominant axis of the face normal and use the other two coordinates (per-face,
  so works naturally on non-indexed faceted geometry). Always compute UVs from **bind-pose** positions so they don't change while
  bones move.
- Atlas: give each part type a tile (e.g. 4×4 tiles in a 512² atlas = 128² each); per part: `u' = tileX/4 + u*(1/4)`, likewise v.
  With mipmaps, neighbouring tiles bleed at small mip levels: leave a gutter (pad 2–8 px, duplicate edge pixels) and keep
  `RepeatWrapping` off for atlas textures — tiling inside an atlas tile needs `fract()` in a shader. For noise that should repeat,
  a separate small repeating texture (e.g. 128² noise) is simpler than an atlas.
- Triplanar alternative: in the vertex shader pass object-space (bind-pose) `position` and `objectNormal` as varyings (capture them
  before `skinning_vertex`), then in the fragment shader sample a tiling noise texture 3 times with `pos.yz`, `pos.xz`, `pos.xy`
  and weights `w = pow(abs(n), vec3(k)); w /= dot(w, vec3(1.0));`. Object-space coordinates make the pattern stick to the skin as
  it animates; world-space coordinates would make it "swim". Cost: 3 texture fetches per pixel (9 if colour+bump+... ), versus 1
  for UV mapping — acceptable for a few enemies on screen, worth a quality toggle on mobile. Scale the coordinates per model
  (e.g. `pos * 4.0 / modelSize`) so big and small enemies get similar texel density.
- Instead of a texture, triplanar/3D noise can be evaluated procedurally in GLSL (value/simplex noise of object position) — no UVs,
  no texture memory, but ALU cost grows quickly with octaves; precompute into a texture when possible.

### Gaps
- Ben Golus's "Normal Mapping for a Triplanar Shader" (UDN / Whiteout / RNM blends, sign flips) and Inigo Quilez's biplanar
  mapping article could not be fetched (hosts blocked); their exact formulas are not quoted here.

## 3. Procedural noise textures, bump/normal maps from height, emissive maps — and which r128 materials support them

### Takeaway
In r128, `MeshLambertMaterial` supports `map`, `emissiveMap`, `specularMap`, `alphaMap`, `aoMap`, `lightMap`, `envMap` but **not**
`bumpMap`/`normalMap`, and it lights **per vertex** (Gouraud), so per-pixel relief is impossible with it. `MeshPhongMaterial`
(and Standard) support `bumpMap`, `normalMap`, `displacementMap`, all usable without tangents. So: colour/noise detail and glowing
runes work on the existing Lambert materials; bump/normal relief requires switching those meshes to Phong (or Standard).

### Cited Findings
- `MeshLambertMaterial` r128 properties: `color, map, lightMap, lightMapIntensity, aoMap, aoMapIntensity, emissive (default 0x000000),
  emissiveIntensity, emissiveMap, specularMap, alphaMap, envMap, combine, reflectivity, refractionRatio, wireframe, skinning,
  morphTargets, morphNormals` — no bumpMap/normalMap — [MeshLambertMaterial.js r128](https://github.com/mrdoob/three.js/blob/r128/src/materials/MeshLambertMaterial.js)
- `MeshPhongMaterial` r128 adds `bumpMap`, `bumpScale`, `normalMap`, `normalMapType` (default `TangentSpaceNormalMap`), `normalScale`,
  `displacementMap`, plus specular/shininess — [MeshPhongMaterial.js r128](https://github.com/mrdoob/three.js/blob/r128/src/materials/MeshPhongMaterial.js)
- r128 Lambert computes light in the vertex shader: the vertex shader includes `lights_lambert_vertex` and outputs
  `varying vec3 vLightFront; varying vec3 vIndirectFront;` (+Back when double-sided); the fragment shader only multiplies these by
  `BRDF_Diffuse_Lambert(diffuseColor.rgb)` and has no per-fragment normal — [meshlambert_vert r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_vert.glsl.js); [meshlambert_frag r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_frag.glsl.js)
- r144: "`MeshLambertMaterial` now uses per-fragment shading"; the per-vertex version lives on as `MeshGouraudMaterial` in
  `examples/jsm/materials` — [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide); [discourse: Accessing Lambert Light intensity](https://discourse.threejs.org/t/accessing-lambert-light-intensity/55300) (forum adds that per-fragment Lambert is still much cheaper than Standard; from search summary)
- r128 bump mapping samples the height map's **red channel** three times (`texture2D(bumpMap, vUv).x`, at `vUv`, `vUv+dSTdx`, `vUv+dSTdy`)
  scaled by `bumpScale` — so a greyscale canvas is a valid bump map — [bumpmap_pars_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/bumpmap_pars_fragment.glsl.js)
- In WebGL1, r128 adds `#extension GL_OES_standard_derivatives : enable` automatically when the material uses `bumpMap`, a tangent-space
  `normalMap`, `flatShading`, or `material.extensions.derivatives` — [WebGLProgram.js r128 generateExtensions](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLProgram.js)
- Emissive maps: Lambert starts with `totalEmissiveRadiance = emissive` and `emissivemap_fragment` multiplies it by the map's rgb, so the
  material's `emissive` colour must be non-black for an emissiveMap to show (default emissive is black) — [meshlambert_frag r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_frag.glsl.js); [emissivemap_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/emissivemap_fragment.glsl.js); [MeshLambertMaterial.js r128](https://github.com/mrdoob/three.js/blob/r128/src/materials/MeshLambertMaterial.js)
- The r128 terrain example imports `ImprovedNoise` (Perlin) from `examples/jsm/math/ImprovedNoise.js` to build a height field, then bakes
  lighting into the colour texture from neighbour height differences (`data[j-2]-data[j+2]`, `data[j-width*2]-data[j+width*2]`,
  dot with a sun vector) — [webgl_geometry_terrain.html r128](https://github.com/mrdoob/three.js/blob/r128/examples/webgl_geometry_terrain.html)

### Inferences
- Practical split for this game: (a) keep Lambert + vertex colours, add a shared greyscale noise `map` (multiplies albedo) and an
  `emissiveMap` for eyes/runes → cheapest, no lighting change; (b) for "hero" bosses, switch to `MeshPhongMaterial` with `bumpMap`
  (same greyscale height canvas, `bumpScale` ~0.01–0.05 in world units) and low `shininess`/dark `specular` so it still reads as matte;
  Phong is per-pixel, so it costs more than r128 Lambert. (c) As a middle path on Lambert, "bake" fake relief into the colour texture
  as the terrain example does (light from a fixed direction) — free at runtime but doesn't react to real lights.
- Height → normal map (for `normalMap` on Phong): central differences on the height grid, `n = normalize(vec3(-(h[x+1]-h[x-1])*s, -(h[y+1]-h[y-1])*s, 1))`,
  store as `n*0.5+0.5` in RGB. Usually `bumpMap` is simpler (one grey texture, no tangent/sign issues) and cheaper in memory, at the cost of
  3 fetches; a normal map is 1 fetch but needs consistent UV orientation (derivative-based TBN handles that in r128).
- Noise families and what they suit (standard techniques, not verified against a source in this session): value noise (blotchy skin,
  cloth dye), gradient/Perlin or simplex fBm (stone, rust patches, mottled hide), Worley/cellular (scales, chitin plates, cracked stone,
  hex-like reptile skin — use F2−F1 for cell borders), stretched noise along v (fur/hair streaks, wood grain), sine-of-noise / stripes
  (cloth weave, banding). Make noise tileable by sampling on a torus or by wrapping lattice coordinates modulo the period, so
  `RepeatWrapping` has no seams.
- Glow: emissiveMap drawn on a canvas (runes with `ctx.fillText`/paths, eye dots with radial gradients) on black, `emissive` set to the
  glow colour; it is not affected by lights or fog darkness except fog blending, and pairs with the game's existing bloom-less look.

### Gaps
- Inigo Quilez's noise/Voronoi articles and The Book of Shaders could not be fetched (iquilezles.org blocked; thebookofshaders.com not
  tried); the noise descriptions above are general knowledge, not quoted.

## 4. `Material.onBeforeCompile` in r128: injecting GLSL into Lambert/Phong while keeping skinning and fog

### Takeaway
`onBeforeCompile(shader, renderer)` gets `shader.vertexShader`, `shader.fragmentShader` (still containing `#include <chunk>` lines) and
`shader.uniforms`; replace or extend includes with `String.replace`, never remove `skinning_*`, `fog_*`, `project_vertex`. Because the
default `customProgramCacheKey()` returns `onBeforeCompile.toString()`, two materials whose hook has the same source but different
baked-in constants will wrongly share a program — override `customProgramCacheKey` or pass values as uniforms. In r128 a SkinnedMesh
material still needs `skinning: true`.

### Cited Findings
- `Material.prototype.onBeforeCompile = function (/* shaderobject, renderer */) {}` and
  `customProgramCacheKey = function () { return this.onBeforeCompile.toString(); }` — [Material.js r128](https://github.com/mrdoob/three.js/blob/r128/src/materials/Material.js)
- The program cache key array includes `parameters.customProgramCacheKey` and `renderer.outputEncoding` — [WebGLPrograms.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLPrograms.js)
- Official r128 example `webgl_materials_modified`: adds `shader.uniforms.time = {value:0}`, prepends `uniform float time;`, replaces
  `'#include <begin_vertex>'` with code that defines `vec3 transformed = ...`, keeps `material.userData.shader = shader` to update the
  uniform later, and overrides `material.customProgramCacheKey = () => amount` so "WebGLRenderer doesnt reuse a single program" — [webgl_materials_modified.html r128](https://github.com/mrdoob/three.js/blob/r128/examples/webgl_materials_modified.html)
- `skinning: material.skinning && maxBones > 0` drives `#define USE_SKINNING` in r128; the `skinning` material property was removed in
  r129 ("The same material can now be reused between Mesh and SkinnedMesh") — [WebGLPrograms.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLPrograms.js); [WebGLProgram.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLProgram.js); [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- Lambert vertex chunk order: `uv_vertex, uv2_vertex, color_vertex, beginnormal_vertex, morphnormal_vertex, skinbase_vertex,
  skinnormal_vertex, defaultnormal_vertex, begin_vertex, morphtarget_vertex, skinning_vertex, project_vertex, ..., worldpos_vertex,
  envmap_vertex, lights_lambert_vertex, shadowmap_vertex, fog_vertex`. Fragment: `map_fragment, color_fragment, alphamap_fragment,
  alphatest_fragment, specularmap_fragment, emissivemap_fragment`, lighting, then `tonemapping, encodings, fog, premultiplied_alpha,
  dithering` — [meshlambert_vert r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_vert.glsl.js); [meshlambert_frag r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderLib/meshlambert_frag.glsl.js)
- `color_fragment` does `diffuseColor.rgb *= vColor` (vertex colours) — [color_fragment r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js)
- `worldpos_vertex` only defines `worldPosition` when `USE_ENVMAP`, `DISTANCE` or `USE_SHADOWMAP` is defined — [worldpos_vertex r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/worldpos_vertex.glsl.js)
- `project_vertex` computes `mvPosition = modelViewMatrix * vec4(transformed,1)` and `gl_Position` — [project_vertex r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/shaders/ShaderChunk/project_vertex.glsl.js)
- This game already uses the safe chaining pattern: save `const ob = m.onBeforeCompile`, then in the new hook call
  `if (ob && ob !== THREE.Material.prototype.onBeforeCompile) ob.call(m, sh, rn);` before adding its own uniforms/replacements — [src/js/2430-v135-instance-clip.js](src/js/2430-v135-instance-clip.js); [src/js/3190-v157-camera-cutaway.js](src/js/3190-v157-camera-cutaway.js)

### Inferences
- Skeleton of a "detail" hook for an r128 Lambert skinned enemy (keeps skinning + fog because every include stays):
  ```js
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uNoise = { value: NOISE_TEX }; sh.uniforms.uScale = { value: 3.0 };
    sh.vertexShader = 'varying vec3 vOP; varying vec3 vON;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vOP = position; vON = normal;'); // bind pose, before skinning
    sh.fragmentShader = 'uniform sampler2D uNoise; uniform float uScale; varying vec3 vOP; varying vec3 vON;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 w = pow(abs(normalize(vON)), vec3(4.0)); w /= dot(w, vec3(1.0));
        float n = texture2D(uNoise, vOP.yz*uScale).r*w.x + texture2D(uNoise, vOP.xz*uScale).r*w.y + texture2D(uNoise, vOP.xy*uScale).r*w.z;
        diffuseColor.rgb *= mix(0.7, 1.1, n);                       // triplanar mottling
        diffuseColor.rgb *= mix(0.75, 1.0, smoothstep(-0.2, 1.0, vOP.y)); // darker toward feet (height gradient)
      `);
  };
  m.customProgramCacheKey = () => 'kqDetail1';
  ```
  Values that differ per model go in uniforms (or a different cache key), never baked into the source string.
- Rim/curvature tint: r128 Lambert has **no** per-fragment normal or view vector, so add your own varyings
  (e.g. `vec3 vVN = normalize(normalMatrix * objectNormal)` after `defaultnormal_vertex`, and `-mvPosition.xyz` after `project_vertex`)
  and compute `rim = pow(1.0 - max(dot(normalize(vVN), normalize(vView)),0.0), 3.0)`; add it to `totalEmissiveRadiance` (after
  `emissivemap_fragment`) for a glow edge, or to `diffuseColor` for a tint. Using `objectNormal` after `skinnormal_vertex` makes the rim
  follow the animated pose. Curvature/cavity darkening needs data per vertex (e.g. bake an "occlusion" value into the vertex colour or
  an extra attribute at build time) because a fragment shader can't see neighbouring geometry cheaply.
- Don't rely on `worldPosition` in the injected code (it only exists with shadows/envmap); compute `modelMatrix * vec4(transformed,1.0)`
  yourself if world space is needed.
- Fog keeps working as long as `fog_vertex`/`fog_fragment` remain and the material keeps `fog: true`; injected colour code should run
  before `fog_fragment` (anything that edits `diffuseColor` or `totalEmissiveRadiance` does).
- Each unique cache key = one extra shader program compile (a startup/hitch cost); share one hook + key across all enemies and vary only
  uniforms/textures.

### Gaps
- Whether the extra varyings fit within `MAX_VARYING_VECTORS` on the weakest target GPUs was not measured (WebGL1 minimum is 8 vec4;
  not verified against a spec in this session). Lambert already uses several varyings.

## 5. One shared atlas vs per-model textures: draw calls, GPU memory, upload cost, startup time on mobile

### Takeaway
Textures don't add draw calls by themselves — draw calls are per mesh × material — but a separate texture per enemy forces a separate
material (and texture bind) per enemy, while one shared atlas or one shared tiling noise set lets all enemies share materials and one
upload. Memory is width × height × 4 bytes for RGBA8, plus ~1/3 for mipmaps: 512² ≈ 1 MiB → ~1.33 MiB; 1024² ≈ 4 MiB → ~5.3 MiB.
A handful of small shared textures is negligible even on phones; the real risks are many unique large canvases and generating them
synchronously at startup.

### Cited Findings
- MDN: mipmaps cost "only 30% overhead" in memory — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- MDN: WebGL cannot query available VRAM; Google Maps' "per-pixel VRAM budget" approach: pick a max VRAM on one system, divide by the
  pixels of a maximised window (`innerWidth*dpr * innerHeight*dpr`), and cap all GPU caches to that constant × current window pixels;
  mobile screens are smaller so the budget scales down — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- MDN: texture uploads from DOM elements (`texImage2D` from canvas/video/image) usually involve an internal processing pass that can
  cause a pipeline flush; "Prefer doing uploads before starting drawing" — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- MDN: on WebGL2 some drivers allocate the whole mip chain (+30%) even for one level; prefer `texStorage` — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- MDN: GPU-compressed formats (S3TC, ETC, PVRTC, ASTC, Basis) use less memory/bandwidth than RGBA8 but are not something a runtime
  canvas produces — [MDN WebGL best practices](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md)
- r128 uploads a texture when `texture.version` changes (`needsUpdate = true` bumps it) and when first used; non-POT canvases on WebGL1
  get an extra resize draw on a temporary canvas — [WebGLTextures.js r128](https://github.com/mrdoob/three.js/blob/r128/src/renderers/webgl/WebGLTextures.js)
- The game turns off `ren.info.autoReset` and its detail test page already reports triangles and draw calls per frame via `ren.info` — [src/js/0045-game-data-world-zones-bosses.js](src/js/0045-game-data-world-zones-bosses.js); [README.md (detail test page row)](README.md)

### Inferences
- Memory arithmetic (RGBA8, UnsignedByte): 128² = 64 KiB (85 KiB with mips), 256² = 256 KiB (~341 KiB), 512² = 1 MiB (~1.33 MiB),
  1024² = 4 MiB (~5.33 MiB). The browser also keeps the source canvas in CPU memory (another w×h×4) unless the canvas is dropped
  after upload (r128 keeps `texture.image` referenced, so the canvas lives as long as the texture).
- Recommended layout for ~70 enemy types: 2–4 shared **tiling** detail textures (e.g. 256² noise in RGBA channels: R = fBm, G = Worley
  cells, B = streaks/fibres, A = fine grain), used triplanar or with per-part UV scale; plus one small shared emissive "rune/eye" atlas.
  Total ≈ 1–2 MB GPU. Per-enemy colour still comes from vertex colours, so no per-enemy texture is needed and materials can stay shared.
- Packing four greyscale noises into RGBA of one texture = one fetch for four patterns, and a single upload.
- Startup: generating a 256² fBm (4 octaves) is ~260k noise evaluations — typically tens of ms in JS on a phone (estimate, not measured);
  1024² is 16× that. Generate once, cache in a module-level object (the game already caches canvas textures, e.g. `CZ105_SG[key]`,
  `VLR146.tt`), spread generation over frames or do it behind the existing loading flow, and call `renderer.initTexture`-style warm-up
  (in r128: render once off-screen or rely on first use) before combat to avoid a hitch.
- Per-model unique textures (one 512² each for 70 enemies) would be ~93 MB with mips — too much for low-end mobile; an atlas only
  helps if the per-enemy art truly differs; shared tiling detail is the better fit for a vertex-coloured low-poly game.

### Gaps
- No authoritative numbers found for mobile texture-upload time or canvas-noise generation time; measure with `performance.now()` in
  the game's detail test page.
- r128 `renderer.initTexture()` availability was not checked (it exists in later versions).

## 6. Examples and references for procedural texturing in three.js

### Takeaway
The best directly-usable r128 references are the official examples `webgl_geometry_terrain` (noise → canvas → CanvasTexture) and
`webgl_materials_modified` (onBeforeCompile + customProgramCacheKey), the r128 shader chunks themselves, and this game's own existing
canvas-texture and onBeforeCompile code. Forum threads confirm triplanar is a user-side onBeforeCompile job.

### Cited Findings
- `webgl_geometry_terrain` (r128): Perlin heightfield via `ImprovedNoise`, texture generated on a canvas with baked shading and grain — [webgl_geometry_terrain.html r128](https://github.com/mrdoob/three.js/blob/r128/examples/webgl_geometry_terrain.html)
- `webgl_materials_modified` (r128): onBeforeCompile vertex-shader injection pattern with per-material cache keys — [webgl_materials_modified.html r128](https://github.com/mrdoob/three.js/blob/r128/examples/webgl_materials_modified.html)
- Forum threads on triplanar with onBeforeCompile (Glitch demo `triplanar-mapping.js` linked in one; normalisation fix in another) — [discourse: Wrap texture around object without stretching](https://discourse.threejs.org/t/wrap-texture-around-object-without-stretching-with-meshstandardmaterial/56948); [discourse: Triplanar and lighting](https://discourse.threejs.org/t/triplanar-and-lighting/35241)
- In-game precedents: canvas textures with RepeatWrapping + anisotropy ([3251-v164-skarrith-model.js](src/js/3251-v164-skarrith-model.js),
  [3051-v146-vaelric.js](src/js/3051-v146-vaelric.js)), canvas map + emissiveMap on a MeshStandardMaterial
  ([3152-v151-frozen-maw.js](src/js/3152-v151-frozen-maw.js)), `minFilter = LinearFilter` canvas text textures
  ([2350-v132-cheddar-quests.js](src/js/2350-v132-cheddar-quests.js)), and chained onBeforeCompile hooks on Lambert/Phong/Standard/Basic
  materials ([1100-v89-bossfx-rime-wraith-orbs-melt.js](src/js/1100-v89-bossfx-rime-wraith-orbs-melt.js))

### Inferences
- Since the game is one file loaded from the cdnjs `three.min.js` build (no `examples/jsm`), any helper such as `ImprovedNoise` or a
  simplex implementation has to be inlined into game.js (they are small, ~100 lines).

### Gaps
- Inigo Quilez (iquilezles.org), Ben Golus (bgolus.medium.com) and threejs.org docs/manual were unreachable from this session (DNS
  blocked by network policy); they need to be allowed in the session's network settings to quote them. No open-source procedural
  three.js game with skinned procedural textures was reviewed.
