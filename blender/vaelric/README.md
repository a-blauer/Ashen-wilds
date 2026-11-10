# Lord Vaelric in Blender (review copy)

The final boss (the Citadel Sovereign) rebuilt as a Blender model. **Not in the game yet** — this is for the owner to review.

| File | What it is |
|---|---|
| `vaelric.blend` | The model: one object per armour piece, a rig with the game's joint names, collections `Vaelric`, `PhaseII` (wings, halo) and `GameReference` (the game's current model, hidden) |
| `vaelric.glb` | The same model as glTF (skinned, vertex colours), ready for a game loader |
| `renders/` | Pictures: `compare.png` (game model on top, new below), `turn`, `head`, `torso`, `legs`, `sword`, `phase2`, `pose` (bend test), `hero` |
| `build_vaelric.py` | Builds the .blend and .glb from scratch (`pip install bpy`, then `python3 build_vaelric.py`) |
| `kit.py` | The small low-poly modelling kit the build uses (rings, lofts, tubes, sheets, mirrored sides) |
| `render_vaelric.py` | Renders the pictures (`python3 render_vaelric.py turn head …`) |
| `ref/` | The game's own model and joints exported from the game (`game_model.json`) and pictures of it |

What stayed the same: his size, proportions and skeleton (joints read from the game export, so the game's poses and attacks fit),
the palette (`VLR202C`), flat-shaded low-poly facets, vertex-colour paint, glow as its own layer, the three layers c / m / g.
His face is the game's own sculpt.

What is new: layered plate armour (cuirass with a pointed belly plate, fauld, pointed tassets, shaped greaves, pointed sabatons,
knee and elbow cops), shingled pauldrons with curved horns, a taller swept collar, swept-back white hair, a thorned crown,
a cape with real folds and a torn hem, a wave-edged flamberge with a winged guard, an open clawed left hand, better skull
trophies, scalloped bat wings, and real ambient-occlusion shading baked into the vertex colours by Cycles.

Size: about 7,800 triangles (the game model: about 10,000 plus the sword and wings).
