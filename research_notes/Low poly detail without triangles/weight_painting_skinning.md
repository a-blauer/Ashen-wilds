# Weight painting & skinning for low-poly animated characters (three.js r128, procedural JS)

> Research note, 30 Oct 2026. Source caveat: in this session WebFetch could not reach most hosts (people.csail.mit.edu,
> users.cs.utah.edu, alecjacobson.com, docs.blender.org, help.autodesk.com, polycount.com, discourse.threejs.org were all
> blocked by the network allow-list). Findings from those sites come from search-result summaries of the pages, not full
> reads, so exact numbers from inside the papers (e.g. Pinocchio's c constant) are listed as gaps unless a summary gave them.
> three.js r128 shader/JS source was read directly from raw.githubusercontent.com. Game code was read from the repo.

## 1. What weights are and what they control (elbows, knees, shoulders, hips, neck; candy-wrapper; collapse; armour)

### Takeaway
Skin weights say, per vertex, how much each bone moves it; in three.js r128 the GPU literally averages up to 4 bone matrices
with those weights (linear blend skinning, LBS). Because an *average of rotations is not a rotation*, joints bent or twisted
far lose volume (elbow "cardboard tube" crease, forearm "candy wrapper"); the weights decide where and how badly that happens,
and whether rigid things (armour, weapons, horns) bend at all.

### Cited Findings
- r128's vertex skinning is a plain weighted sum of four bone matrices: `skinned += boneMatX * skinVertex * skinWeight.x; …`
  for X/Y/Z/W, wrapped in `bindMatrix` / `bindMatrixInverse` — [three.js r128 skinning_vertex.glsl.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinning_vertex.glsl.js)
- Bone matrices are fetched from `skinIndex.x..w` (four slots, so four influences max per vertex) — [three.js r128 skinbase_vertex.glsl.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinbase_vertex.glsl.js)
- Normals are skinned with the same blended matrix (`skinMatrix = Σ w·boneMat`, then `bindMatrixInverse * skinMatrix * bindMatrix`),
  so shading at a joint follows the same blend as position — [three.js r128 skinnormal_vertex.glsl.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinnormal_vertex.glsl.js)
- Bone matrices come from a uniform array `boneMatrices[MAX_BONES]` or, when supported, a float `boneTexture` — [three.js r128 skinning_pars_vertex.glsl.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js)
- Root cause of the artifacts: "linear blend of rigid motions [is] not rigid" (arm-twist / candy-wrapper problem) — [UT Austin CS384G lecture 15](https://www.cs.utexas.edu/~fussell/courses/cs384g/lectures/lecture15.pdf)
- Maya's docs describe the same artifact as the mesh losing volume "as a bone twists on its axis", seen at wrist/elbow — [Autodesk Maya: Smooth skinning methods](https://help.autodesk.com/cloudhelp/ENU/MayaCRE-CharacterAnimation/files/GUID-630C335C-B63E-4F2E-A4A4-AEA1DD00B0D6.htm) (via search summary)
- LBS collapse at a flexed elbow is described as a crease "like a bent cardboard tube"; DQS avoids the loss but bulges the joint — [Gravitee corpus: Skinning](https://gravitee.io/corpus/gen-1783/computer-animation/skinning.html) (secondary, via search summary)
- Too much bone influence on a vertex warps the geometry; too little and it doesn't follow the bone — [ModDB dev blog 03: rigging and animation](https://www.moddb.com/news/dev-blog-03-rigging-and-animation-process)
- Pinocchio's automatic weights were explicitly built *for* LBS: weights "based on the proximity of the embedded bones, smoothed by a diffusion equilibrium equation over the character's surface" — [Baran & Popović 2007, CSAIL abstract](https://publications.csail.mit.edu/abstracts/abstracts07/ibaran/ibaran.html)

### Inferences
- Per joint, what weights control in practice:
  - **Elbow / knee (hinge):** the width of the blend band decides between a sharp "paper fold" (too narrow → the inside
    vertices interpenetrate, outside stretches into a point) and a "rubber hose" (too wide → whole limb bends like a noodle,
    and the bend middle shrinks toward the joint axis). A short band centred slightly *past* the pivot on the outside reads best.
  - **Shoulder / hip (ball joints, 3 axes):** the worst LBS joints, because they rotate a lot on every axis. Upper-chest /
    pelvis vertices near the joint need partial weight to the limb so the armpit/groin doesn't tear, but not so much that the
    chest caves in when the arm lifts.
  - **Neck:** a gradient over the whole neck (chest → neck → head) makes head turns look like twisting flesh rather than a
    head on a stick; weighting the jaw/skull 100% head keeps the face rigid.
  - **Twist (forearm, neck, spine, tails):** twisting a single joint with LBS pinches the cross-section to a point (candy
    wrapper); the fix is to spread twist over several bones or vertices (see §5).
  - **Armour/clothing:** plates, helmets, weapons, horns and shields should be rigid (100% one bone) so they never bend; soft
    cloth/fur/robes should copy the weights of the body surface beneath so they follow it exactly and do not poke through.
- Because normals use the same blend, poor weights also produce shading "kinks" at joints even when the silhouette is fine.

### Gaps
- No primary source in reach quantified volume loss vs bend angle for LBS (e.g. "% radius lost at 90°"). Can be measured in code
  (bend a cylinder 90° and read the minimum radius).

## 2. Low-poly joint topology: loops at joints, wedges, rigid vs smooth for plates/accessories

### Takeaway
Practitioners converge on: at least 2–3 edge rings around each bending joint (one weighted to each bone, plus one in the middle
for the blend), an extra wedge/loop on the *inside* of elbows and knees, extra rings along twisting segments, no star-points in
the crease, and a relaxed bind pose (arms ~45° down) rather than a T-pose. Hard-surface parts stay 100% on one bone. PS1-style
characters avoid the problem entirely by using rigid separate segments.

### Cited Findings
- "Two full loops, one weighted to each bone," to avoid volume loss; adding full loops around knee and elbow reduces collapse;
  connecting two edge loops at the inside of knees and elbows is recommended for better bending — [Polycount comment 1353327](https://polycount.com/discussion/comment/1353327), [Polycount comment 1353341](https://polycount.com/discussion/comment/1353341), [Polycount comment 1402970](https://polycount.com/discussion/comment/1402970) (via search summary)
- Extra loops along a twisting section reduce volume collapse when LBS meets twisting — [Polycount comment 1353341](https://polycount.com/discussion/comment/1353341)
- Elbow deformation loops should run opposite to knee loops because they bend the opposite way — [Polycount comment 1344052](https://polycount.com/discussion/comment/1344052)
- A star point in the elbow crook was flagged as a likely deformation problem; reviewer recommended more loops on long limb
  segments — [Tech-Artists.org: feedback on edgeflow before rigging](https://www.tech-artists.org/t/feedback-on-edgeflow-before-i-jump-in-to-rigging/10511)
- T-pose causes twisting for most motions; an arms-down (~45°) bind pose reduces deformation problems — [Polycount comment 1354602](https://polycount.com/discussion/comment/1354602)
- PS1-style characters built from separate parts: "nothing actually bends and it's just rigid parts rotating around each
  other" — [Overscore: Low-poly character rigging with Blender and Mixamo](https://overscore.media/posts/low-poly-character-rigging-with-blender-and-mixamo)
- Mixamo's automatic weights "does not tend to work very well with some lowpoly models, and esp not ps1 style" — [itch.io comment, PSX Viking asset](https://titaniumrat42.itch.io/psx-viking-armor-chad/comments)
- 2D-mesh (Spine) advice for joints: add a bone at the knee/elbow and weight the collapsing vertices to it — [Esoteric Software forum: best practices for rigging mesh joints](https://ja.esotericsoftware.com/forum/d/7673-best-practices-for-rigging-mesh-joints)

### Inferences
- For a procedurally lofted limb (this game's `lofts` with `seg`/`N` rings), "edge loops at the joint" = **ring placement**:
  put a ring exactly at each joint pivot plus one ring on each side at roughly 0.3–0.5 × the limb radius away. Rings that are
  evenly spaced along the limb waste triangles on the straight middle and starve the joint. Moving existing rings toward joints
  improves bends at zero triangle cost.
- A cheap procedural "inside wedge": on the flexion side of a hinge, the middle ring can be scaled slightly smaller in the
  flex direction (pre-creased), so the inside fold has somewhere to go instead of interpenetrating.
- A 45°-down arm bind pose matters for us too: the game builds in rest pose; if arms are mostly animated down, binding with
  them down means the common poses are near the bind and deform least.
- Rigid vs smooth rule for the procedural kits: **hard part → single bone 1.0** (current `bakeMesh` already does SI=[bone,0,0,0],
  SW=[1,0,0,0]); **soft part that sits on the skin → copy the body's weights at the nearest surface point** (what the v179
  "nearest vertex weights" helper does). Large hard parts that span a joint (pauldrons, knee cops, long robes) are the hard
  case: split them into two rigid pieces, or let them ride the parent bone and overlap so the gap never shows.

### Gaps
- Could not reach Synty/Quaternius documentation; no confirmed statements on how many rings their low-poly characters use at
  joints (search returned nothing specific).
- Could not open the Polycount "Rigging low-poly ('PS1 Demake') style characters" thread for its details.

## 3. Weight smoothing, normalisation, falloff lengths, how many influences matter

### Takeaway
Weights must sum to 1 (r128 provides `normalizeSkinWeights()`), small influences should be pruned before normalising, and 4
influences is the standard real-time cap—most low-poly vertices need only 1–2, occasionally 3 at shoulders/hips. Smoothing the
weight field over the mesh (a few Laplacian passes) is the single biggest quality step after the raw assignment.

### Cited Findings
- r128 `SkinnedMesh.normalizeSkinWeights()` divides the four weights by their sum (Manhattan length); if all are zero it sets
  `(1,0,0,0)` — [three.js r128 SkinnedMesh.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/objects/SkinnedMesh.js)
- r128 `SkinnedMesh.boneTransform(index, target)` reproduces the GPU skinning on the CPU for one vertex (useful for testing
  weights/poses in JS) — [three.js r128 SkinnedMesh.js](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/objects/SkinnedMesh.js)
- Real-time engines commonly cap influences at 4 (sometimes 8), because 4 weights pack efficiently for shader skinning — [Tech-Artists.org: Maya max influence](https://www.tech-artists.org/t/maya-max-influenece/2266)
- Simply truncating to 4 "rarely gives desirable results"; rebalance excess influences, then prune near-zero weights — [Tech-Artists.org: Maya max influence](https://www.tech-artists.org/t/maya-max-influenece/2266)
- Prune tiny influences before normalising; then normalise and test several poses — [Seeles DCC skin-weight normalization checklist](https://www.seeles.ai/features/tools/dcc-skin-weight-normalization-checklist) (vendor guide)
- glTF-Transform sorts weights high→low and removes the least significant so no vertex exceeds the limit — [gltf-transform sortPrimitiveWeights](https://gltf-transform.dev/modules/functions/functions/sortPrimitiveWeights)
- Unreal's skin-weight tools cull the smallest influences and renormalise (`EnforceMaxInfluences`, smoothing with `MaxNumInfluences`) — [Unreal SkinWeightModifier Python API](https://dev.epicgames.com/documentation/en-us/unreal-engine/python-api/class/SkinWeightModifier), [Unreal FSmoothDynamicMeshVertexSkinWeights::MaxNumInfluences](https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/DynamicMesh/Operations/FSmoothDynamicMeshVertexSkinWeig-/MaxNumInfluences?application_version=5.5)
- One engine-tool source argues dropping the smallest and rescaling is "visually invisible at four", and recommends keeping
  weights unbounded while authoring and pruning once at export — [s&box Geppetto SkinWeights.cs](https://sbox.game/pooh/geppetto/source?file=Editor%2FEffigy%2FRig%2FSkinWeights.cs)
- Maya's Geodesic Voxel bind default Max Influences is 5, "works well for most characters" — [Autodesk Maya 2017 Bind Skin Options](https://help.autodesk.com/cloudhelp/2017/ENU/Maya/files/GUID-CF2C698A-44BB-4CA0-BCB9-DB36500DA812.htm) (via search summary)
- Maya's geodesic-voxel bind exposes a single "falloff" (bind stiffness) in [0..1] — [Maya geomBind command](https://help.autodesk.com/cloudhelp/ENU/MayaCRE-Tech-Docs/CommandsPython/geomBind.html) (via search summary)

### Inferences
- Recommended pipeline for generated weights (all in JS at build time, cached per look):
  1. compute a raw weight for *every* candidate bone (unbounded list per vertex);
  2. smooth over the mesh: 2–5 passes of `w_i ← (1-λ)·w_i + λ·mean(w_neighbours)` with λ≈0.5, but **lock rigid parts and
     vertices inside a bone's "core"** (e.g. middle half of a limb segment) so smoothing cannot spread a hand bone into the chest;
  3. prune `w < ~0.02`, keep the top 4 (sort high→low), renormalise to sum 1;
  4. write `skinIndex` (Uint16) / `skinWeight` (Float32) attributes; zero-pad unused slots with weight 0.
- Falloff length rule of thumb for low-poly limbs: blend zone about 1× the limb radius centred on the joint (≈0.5 r either side).
  Thick creatures (yeti, jotun) need relatively wider blends at shoulders/hips; thin limbs (harpy wings, spider legs) can be
  near-rigid with a 1-ring blend. This is a starting heuristic, not a sourced number—tune by eye with test poses.
- Influence count: a vertex mid-limb should have 1 bone, a joint ring 2, shoulder/hip/neck base up to 3. Using 4 everywhere
  just smears motion. Since r128 always runs all four slots, fewer influences cost nothing extra but also save nothing on the GPU.
- Use `mesh.boneTransform()` in tests to pose the mesh on the CPU and check, e.g., minimum limb radius at 90° bend, or that no
  armour vertex moves relative to its bone.

### Gaps
- No primary source found for specific falloff distances in low-poly game rigs; numbers above are inferred.

## 4. Automatic weight algorithms implementable in JavaScript (envelope, heat diffusion, geodesic voxel, BBW): cost & quality on 3–15k tris

### Takeaway
Best value for this game: **nearest-bone-segment / envelope weights + Laplacian smoothing on the surface** (milliseconds, no
solver), optionally upgraded to **Pinocchio-style heat diffusion** (one sparse linear solve per bone, feasible in JS for
≤15k triangles, a few hundred ms). Geodesic voxel binding is the robust choice for messy multi-part meshes (like our baked
kit parts) but needs a voxel grid + per-bone geodesic flood. Bounded biharmonic weights are highest quality but need a
constrained QP solver and take seconds per bone in 3D—too heavy for runtime generation.

### Cited Findings
- **Pinocchio / heat diffusion (Baran & Popović, SIGGRAPH 2007):** two stages, skeleton embedding then skin attachment; skin
  attachment uses "Laplace's diffusion equation to generate weights for attaching mesh vertices to the skeleton using linear
  blend skinning"; weights start from bone proximity, then are smoothed by diffusion over the surface; whole system runs in
  under a minute on a midrange PC (2007); rigged 13 of 16 unseen bipeds automatically, the other 3 with one joint hint — [Pinocchio paper (CSAIL)](https://people.csail.mit.edu/ibaran/papers/2007-SIGGRAPH-Pinocchio.pdf), [CSAIL abstract](https://publications.csail.mit.edu/abstracts/abstracts07/ibaran/ibaran.html) (via search summary)
- The heat-weighting method is what Blender's "automatic weights" use, and a Maya script (PM_heatWeight) ports it because it
  gives "much better default weights than Maya's bind skin weights" — [HighEnd3D: PM_heatWeight for Maya](https://community.highend3d.com/maya/script/pm_heatweight-for-maya) (via search summary)
- Blender "Bone Heat Weighting: failed to find solution" is caused mostly by mesh errors: duplicate vertices, intersecting
  geometry, flipped normals "blocking the bone heat", overlapping layers such as clothing on a body; scaling the model up ~10×
  sometimes helps (anecdotal) — [CG Cookie: the mystery of Rigify](https://cgcookie.com/community/6826-the-mystery-of-rigify), [Blender Artists thread](https://blenderartists.org/t/another-bone-heat-weighting-failed-to-find-solution-problem/618636), [Blender issue #51250](https://projects.blender.org/blender/blender/issues/51250)
- Volumetric alternative: each bone a heat source diffused through a voxel model; the article argues the original bone heat
  "incorrectly uses surface diffusion instead of volumetric" — [Game Developer: Volumetric heat diffusion skinning](https://gamedeveloper.com/programming/volumetric-heat-diffusion-skinning) (via search summary)
- **Geodesic Voxel Binding (Dionne & de Lasa, SCA 2013):** voxelises the rest-pose mesh, computes geodesic distances from each
  bone's voxels through non-exterior voxels, runs at interactive rates "without iteration parameters or costly optimization",
  and is designed for production meshes that are non-manifold, non-watertight, self-intersecting or multi-component — [Eurographics DL: Geodesic Voxel Binding](https://diglib.eg.org/handle/10.2312/15001), [video](https://vimeo.com/69268846)
- Maya's implementation (`geomBind`): default method, max voxel resolution a power of two (default 256), optional post-voxel
  validation, falloff 0..1, GPU accelerated (no headless batch) — [Maya geomBind docs](https://help.autodesk.com/cloudhelp/ENU/MayaCRE-Tech-Docs/CommandsPython/geomBind.html)
- **Bounded Biharmonic Weights (Jacobson, Baran, Popović, Sorkine, SIGGRAPH 2011):** minimise Laplacian (biharmonic) energy
  subject to bounds 0≤w≤1 and partition of unity; computed once at bind time; it is a sparse QP; timings roughly milliseconds
  per handle in 2D and roughly seconds per handle in 3D — [BBW paper](https://homes.cs.washington.edu/~jovan/papers/jacobson-2011-bbw.pdf), [Jacobson SIGGRAPH slides](https://www.inf.usi.ch/faculty/hormann/nsfworkshop/presentations/Jacobson.pdf), [Jacobson: QP solver choices for BBW](https://www.cs.toronto.edu/~jacobson/weblog/1996.html)
- No established open-source JS/three.js library for bone-heat weights was found as of 2023; forum replies suggested bone
  envelopes or per-vertex nearest-bone-segment with thresholding — [three.js forum: Programmatic bone weight calculation in 2023](https://discourse.threejs.org/t/programmatic-bone-weight-calculation-in-2023/57067) (via search summary)
- A Rust crate (oxihuman-mesh) implements heat-diffusion-style weights from bone endpoints with linear and quadratic falloff,
  a possible porting reference — [oxihuman-mesh mesh_skin_weights.rs](https://docs.rs/crate/oxihuman-mesh/0.2.1/source/src/mesh_skin_weights.rs)
- Direct Delta Mush (Le & Lewis, SIGGRAPH 2019) gets Delta-Mush-like quality "requiring no weight painting" via a direct per-
  vertex computation; costs more than LBS but much less than iterative Delta Mush — [EA SEED: Direct Delta Mush](https://ea.com/seed/news/siggraph2019-direct-delta-mush), [MeshDeformUnity (UPenn CIS565)](https://github.com/PacosLelouch/MeshDeformUnity)

### Inferences
Practical algorithm menu for our procedural meshes (my design sketches, not taken from a source):
- **A. Segment-distance envelope (cheapest, O(V·B)):** for each vertex, distance `d_b` to each bone *segment* (parent→child
  line, not the joint point). Raw weight `w_b = 1/(d_b^p + ε)` with p≈4 (sharper) or a smooth envelope
  `w_b = smoothstep(r_out, r_in, d_b)`. Keep top 4, normalise. For 1–3k verts × 30 bones that's ~100k distance tests: <5 ms.
  Weakness: "leaks" across gaps (inner thigh picks up the other leg, arm picks up torso). Fix by restricting candidates to the
  bone the vertex was lofted from + its parent/child (we *know* this for lofts) — a "topological mask" that most auto-riggers
  don't have.
- **B. Envelope + surface smoothing (recommended upgrade):** A, then 3–5 Laplacian smoothing passes on the mesh's own
  adjacency (from the index buffer, welding duplicate positions first), with "core" vertices locked. Cost: a few ms. This
  approximates heat diffusion's look (smooth, follows the surface) without a solver.
- **C. Pinocchio heat diffusion:** per bone solve `(−Δ + H) w_b = H p_b` on the surface, where p_b = 1 if b is the vertex's
  nearest visible bone, H = c / d² for visible nearest bone. One sparse SPD system of size V, factor once (or conjugate
  gradient, warm-started from B), solve B times. In plain JS a CG solve on 5k verts with ~7 non-zeros per row converges in
  ~100–300 iterations → ~1–3 ms per bone, so ~0.1 s for 30 bones. The "visibility" test (segment-from-vertex-to-bone not
  crossing the mesh) is the expensive/fragile part; our multi-part kit meshes (overlapping shells) are exactly the case where
  Blender's bone heat fails, so use the topological mask from A instead of a raycast visibility test.
- **D. Geodesic voxel binding:** voxelise the bind pose at 64³–128³ (enough for game creatures), mark interior voxels by flood
  fill from outside, then per bone do a Dijkstra/BFS from voxels on the bone through interior voxels; weight by inverse
  geodesic distance with a falloff, and map each vertex to its voxel. 128³ = 2M voxels × 30 bones is heavy in JS (seconds,
  memory); 64³ (262k voxels) × 30 BFS ≈ 8M visits is ~hundreds of ms. Its big win is robustness to overlapping/disconnected
  parts (armour, hair, belts) — they get weights through the volume without needing a "nearest vertex" hack.
- **E. BBW:** needs a QP with box constraints on a tetrahedral volume mesh (also needs TetGen-like tetrahedralisation). Not
  practical at runtime in browser JS; skip.
- Quality order for our case: E ≳ D ≈ C > B > A; cost order the reverse. B (with loft-aware masks) gives most of the visual
  gain. Results should be cached per look (the game already caches baked geometry per key in `BK`).

### Gaps
- Exact Pinocchio constants (the value of c in H = c/d², reported as 1 in my memory of the paper) and their exact solver/timing
  table could not be verified because the PDF host was blocked.
- Geodesic Voxel Binding paper's timing numbers and the exact weight function (inverse-distance exponent) were not readable.
- No benchmark found of any of these methods in JavaScript; the JS timings above are estimates.

## 5. Deformation fixes beyond weights: DQS vs LBS in three.js r128, twist bones, helper/corrective bones, volume

### Takeaway
three.js r128 ships only LBS. DQS is implementable by replacing the skinning shader chunks (via `onBeforeCompile`) and
uploading per-bone dual quaternions, costing a few extra shader instructions, but it bulges bent joints and doesn't support
scale—so for low-poly game creatures the cheaper, more controllable fixes are: twist bones (or twist *weights*) on forearms
and necks, a helper bone at elbow/knee/shoulder to hold volume, and good ring placement. Many shipping engines also stick to LBS.

### Cited Findings
- r128 skinning chunks are LBS only (see §1 sources: [skinning_vertex](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinning_vertex.glsl.js), [skinnormal_vertex](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinnormal_vertex.glsl.js))
- Custom skinning in three.js is done with `Material.onBeforeCompile()` replacing `skinbase_vertex`, `skinning_vertex`,
  `skinning_pars_vertex`, `skinnormal_vertex`; skinning is vertex-shader only — [three.js forum: Custom skinning](https://discourse.threejs.org/t/custom-skinning/2164) (via search summary)
- A 2025 three.js forum user has a working GLSL DQS shader injected via `mesh.material.onBeforeCompile` under WebGL, but it is
  ignored under WebGPU/TSL and porting was hard — [three.js forum: TSL for WebGPU support – DQS implementation](https://discourse.threejs.org/t/having-a-hard-time-figuring-out-tsl-for-webgpu-support-dqs-implementation/84845) (via search summary)
- Kavan et al. DQS (I3D 2007): removes LBS skinning artifacts "at a small cost in computational efficiency and no cost at all
  in character setup"; ~7 more vertex-shader instructions than LBS; scale/shear need an extra two-phase pass; Cg shader source
  published — [Kavan DQ project page](https://users.cs.utah.edu/~ladislav/dq/), [Kavan 2007 paper](https://users.cs.utah.edu/~ladislav/kavan07skinning/kavan07skinning.pdf) (via search summary)
- Antipodality: q and −q encode the same transform, so signs must be made consistent before blending (2008 paper section
  "Coping with Antipodality"); the approximate method "blends linearly and then normalises" and is GPU-efficient — [Kavan 2008 Geometric Skinning with Approximate DQ Blending](https://users.cs.utah.edu/~ladislav/kavan08geometric/kavan08geometric.pdf), [TCD tech report 2006](https://publications.scss.tcd.ie/tech-reports/reports.06/TCD-CS-2006-46.pdf)
- DQS "will help candy wrapper issues when twisting bones, but creates ballooning in other areas"; suggestion to blend LBS and
  DQS — [Polycount comment 1353341](https://polycount.com/discussion/comment/1353341), [Polycount comment 2681217](https://polycount.com/discussion/comment/2681217/)
- Unreal Engine 4 supported only LBS (forum claim, possibly outdated) — [Polycount comment 2681217](https://polycount.com/discussion/comment/2681217/)
- Babylon.js users have also asked for DQS, suggesting it's not default in web engines — [Babylon.js forum: Dual quaternion skinning?](https://forum.babylonjs.com/t/dual-quaternion-skinning/10595); Unigine exposes a DQS toggle — [Unigine Skinned Mesh docs](https://developer.unigine.com/ru/docs/2.18/objects/objects/mesh_skinned/)
- Twist bones: "additional roll/twist bones driven by maths to stop the candy wrapper effect"; some split forearm/upper arm into
  3–4 sections, though "a lot of game characters only seem to have one twist joint"; more bones alone "only moves the shrinking
  from one point to another" unless weights are repainted — [Polycount comment 2681302](https://polycount.com/discussion/comment/2681302), [Polycount comment 2681297](https://polycount.com/discussion/comment/2681297), [Polycount comment 2681188](https://polycount.com/discussion/comment/2681188) (via search summary)
- Production advice: distribute rotation across twist joints and repaint with LBS first; only blend DQS through mid-forearm if
  the engine supports it — [Seeles DCC skinning deformation methods guide](https://www.seeles.ai/features/tools/dcc-skinning-deformation-methods-guide) (vendor guide)
- Corrective morphs "optimised for the linear skinning used in most game engines such as Unreal Engine and Unity" are a common
  fix — [SideFX forum: DAZ to game engines HDA](https://www.sidefx.com/forum/topic/88713/lofi); helper bones that rotate with the hand
  plus stretch-to constraints, with gimbal-lock risk — [Polycount comment 2681217](https://polycount.com/discussion/comment/2681217/)
- Stretchable/twistable bones (Jacobson & Sorkine 2011) is a research approach that adds twist/stretch degrees of freedom to
  bones to avoid these artifacts — [SIGGRAPH history: Stretchable and Twistable Bones](https://history.siggraph.org/?p=197630)
- Direct Delta Mush gives better deformation than LBS at "comparable performance" but mishandles non-rigid (scale) joint
  transforms — [Enhanced Direct Delta Mush, arXiv 2101.02798](https://arxiv.org/abs/2101.02798v1)

### Inferences
- **DQS in r128 is feasible**: in `onBeforeCompile`, replace `skinning_pars_vertex` to read 2 vec4s per bone (real + dual) from
  a second DataTexture or uniform array; in `skinning_vertex`/`skinnormal_vertex` flip each quaternion to the hemisphere of the
  first (`if (dot(q0,qi)<0) qi=-qi`), blend with weights, normalise, apply. CPU side: each frame convert
  `bone.matrixWorld × boneInverse` to a dual quaternion (needs rigid matrices—this game's v99 proportion warp / any bone scaling
  would break DQS unless scale is handled separately). Also needs patching of the depth/distance materials used for shadows.
  Cost: one extra texture fetch and ~tens of ALU per vertex—cheap at our vertex counts.
- But DQS's known downside (bulging at bent elbows/knees) shows up exactly where low-poly creatures bend most; for stylised
  creatures with chunky limbs LBS + good weights + twist distribution is likely the better default. DQS mostly helps twisty
  parts (necks, forearms, tails, serpent bodies like Naga/Gravewyrm).
- **Twist without extra bones (procedural trick):** we generate vertices, so we can simulate a twist bone by weighting the
  forearm rings with a gradient between the elbow bone and a *twist-only copy* of the wrist bone—or simply add one extra bone
  per forearm/neck whose rotation is set each frame to ~50% of the child's twist (swing-twist decomposition). One extra bone per
  limb is cheap in r128 (bones live in a texture).
- **Helper bone for volume:** an elbow/knee helper parented to the upper bone, rotated each frame to half the joint angle, with
  the joint ring weighted to it, keeps the joint ring from collapsing toward the pivot (it acts like a halfway "average" that
  is still a proper rotation). This is the LBS-compatible equivalent of what DQS does at hinges.
- **Volume preservation in the mesh:** pre-scale the joint ring slightly larger (5–10%) in the bind pose so its LBS shrink at
  typical bends lands near the intended size (a static corrective that costs nothing).

### Gaps
- Could not confirm whether any three.js release (r128 or newer, incl. WebGPU/TSL `SkinningNode`) ships DQS; search found only
  LBS docs ([three.js SkinningNode](https://threejs.org/docs/pages/SkinningNode.html)) and user ports. Assumed not built in.
- No source compared LBS vs DQS on *low-poly* creatures specifically.

## 6. How weights interact with visual detail (texture vs geometry; why good weights allow fewer triangles)

### Takeaway
Detail that lives in colour (vertex colours, textures, painted shading) moves with the vertices and can't tear—it only stretches
—whereas detail built from separate geometry (spikes, plates, belts, eyes, small boxes) can float off, intersect or tear if its
weights don't match the surface under it. Good weights let a few well-placed rings bend convincingly, so triangles can go to
silhouette instead of being spent on extra loops to hide bad deformation.

### Cited Findings
- Automatic weighting tools fail most on overlapping layers (e.g. clothing over a body) — the case of separate geometry detail —
  [Blender Artists: bone heat failed](https://blenderartists.org/t/another-bone-heat-weighting-failed-to-find-solution-problem/618636), [CG Cookie](https://cgcookie.com/community/6826-the-mystery-of-rigify)
- Geodesic Voxel Binding exists precisely because production meshes are multi-component/self-intersecting (detail as separate
  pieces) — [Eurographics DL: Geodesic Voxel Binding](https://diglib.eg.org/handle/10.2312/15001)
- r128 normals are skinned with the same blended matrix, so lighting detail follows the weights too — [skinnormal_vertex r128](https://raw.githubusercontent.com/mrdoob/three.js/r128/src/renderers/shaders/ShaderChunk/skinnormal_vertex.glsl.js)
- Extra loops on joints and twisting segments are the usual (triangle-costly) way to fight LBS collapse — [Polycount comment 1353341](https://polycount.com/discussion/comment/1353341)
- In this game, separate attached parts already take the weights of the nearest body vertex (`sn179LpW` grid search within
  0.06 units; only for small parts, and only when the nearest vertex already includes the part's own bone) — repo file
  `src/js/3380-v179-enemy-attach.js` line ~102; baked kit parts are otherwise rigid 1.0 to one bone — `src/js/0080-creature-rigs-skinned-meshes.js` `bakeMesh` (line ~193)

### Inferences
- Rule for attached geometry detail: **small decals/studs/eyes/scales → copy the surface weights at their attachment point**
  (all of its vertices get the same copied weights, so it stays rigid but rides the skin exactly); **large hard pieces → 100%
  one bone** and placed so they don't cross a joint; **soft wraps (belts, sleeves, fur collars) → per-vertex copy** of the
  nearest-surface weights (each vertex its own lookup, interpolated over the nearest triangle via barycentric weights rather
  than nearest single vertex, to avoid stepping).
- Weakness of the current helper: nearest *vertex* (not nearest surface point) can pick a vertex from the wrong side of a thin
  part or a different limb; barycentric interpolation from the nearest triangle, restricted to triangles whose dominant bone is
  the part's bone or its parent/child, would be more robust. Parts bigger than ~0.36 are skipped and stay rigid, which is right
  for armour but means large soft parts (capes, robes) stay rigid too.
- Moving detail into colour (vertex colour bands for muscles, darkening in the elbow crease, painted plate edges) rather than
  geometry makes it immune to deformation errors and costs zero triangles.

### Gaps
- No published measurement found of "triangles saved by better weights"; this is a practitioner principle, not a measured result.

## 7. Low-poly game case studies & tutorials (PS1, Synty, Quaternius, Blender, Mixamo)

### Takeaway
The low-poly/PS1 tradition is to avoid soft deformation entirely (rigid segments rotating at joints, overlapping at the seams),
or to use a simple skeleton with automatic weights then hand fixes. Auto tools (Mixamo, Blender bone heat) often struggle on
low-poly/segmented meshes; hand or rule-based weighting is the norm.

### Cited Findings
- PS1-style rig: "nothing actually bends and it's just rigid parts rotating around each other" — [Overscore](https://overscore.media/posts/low-poly-character-rigging-with-blender-and-mixamo)
- Mixamo auto weights work poorly on low-poly / PS1 models; repaint manually or parent in Blender with Mixamo tools — [itch.io post](https://itch.io/post/12114961), [itch.io comments](https://titaniumrat42.itch.io/psx-viking-armor-chad/comments)
- General low-poly Blender rigging tutorials rely on "parent with automatic weights" then fixes — [BlenderNation: Rig a character with Blender](https://www.blendernation.com/2017/01/09/rig-character-blender/), [Tuts+: basic low poly character rig in Blender](https://design.tutsplus.com/tutorials/building-a-basic-low-poly-character-rig-in-blender--cg-16955)
- Auto-rig add-ons for game export (e.g. Rig It Quick) generate armature + auto weights but no corrective bones — [Superhive: Rig It Quick docs](https://superhivemarket.com/products/rig-it-quick/docs)
- Blender auto-weight failures on overlapping parts push users to Envelope or Empty-group parenting and hand painting — [CG Cookie](https://cgcookie.com/community/6826-the-mystery-of-rigify)

### Inferences
- Our creatures sit between PS1 rigid and full smooth skin: lofted bodies smooth-skinned, kit parts rigid. That hybrid is the
  right model; the gains come from (1) ring placement at joints, (2) smoother blend zones with smoothing passes, (3) correct
  attachment weights, (4) optional twist/helper bones on necks, forearms and serpent bodies.

### Gaps
- No primary material reached on Synty or Quaternius rig internals (bone counts, weight style); search returned nothing specific.
- No GDC talk on low-poly skinning was found in this pass.
