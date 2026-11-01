# Model review checklist (owner's request, Oct 30 2026)

The owner kept finding problems in models before Claude did (floating ears and beaks, wings clipping into the body, lumpy
feathers, a chunky beak, odd shading). Why it happened: pictures were checked small, from a few fixed angles, by the same
session that built the model (it sees what it meant to build), and the automatic test only catches pieces floating more
than 4 mm. So before showing the owner any new or changed creature model:

## 1. Render a full review set (`test/v180_look.py`, W=480 or more)
- Whole body, 4 views (3/4 front, side, 3/4 back, top): idle, walkA, atk (attack) — and the special poses the creature has.
- Close-ups (dist 0.5–0.9) of every join: head and face, beak / jaw / muzzle (rest and bite), ears / horns / crest,
  shoulder and hip (limb tops), wing roots and the folded wing, tail root, feet. Aim with `b=BONE@dx,dy,dz`.
- `NOEVO=1` for the bare body, and the evolution levels the change touches; a few traits / variants.
- Motion: `test/v182_clip.py` (idle with a settle, walk, run, attack) and a contact sheet of its frames.

## 2. Check every picture against this list (be adversarial: assume something is wrong and find it)
- **Attachment:** every piece's root is inside the body — no visible gap, edge or shadow line between a part and the body
  (ears, horns, crests, beak halves, jaw, limb tops, wing roots, tail, ornaments), at rest AND in motion.
- **Clipping:** nothing passes through the body or another part (folded wings, tails, capes, weapons) in any pose.
- **Surface:** no lumpy / bumpy / scaly look where it should be fur or feathers; no plates standing off the surface.
- **Proportions:** compare with the real animal — head size, beak / muzzle length and thickness, leg length, wing span,
  tail length; nothing chunky or blocky where it should be slim and sharp.
- **Shading and colour:** no flat colour steps across big faces (cel-shaded look), no colour bleeding into a mask
  (a gradient spreading over large triangles), no unwanted bright or dark facets.
- **Motion:** nothing spins, drifts, accumulates or snaps; parts move with the body; folds and spreads look natural.
- **Style:** dark fantasy, not cute or cartoony (no big round eyes, no candy colours), consistent detail level across the
  whole model (body as detailed as the wings, head as detailed as the body).

## 3. Get a second opinion
Hand the review set to a fresh agent (Agent tool) that has not seen the design reasoning, with this checklist, and ask
it to list every problem it sees, worst first, each with the picture and the spot. Fix everything real, re-render, and
only then show the owner — saying what the reviewer found and what was fixed.

## 4. Automatic checks
- `test/v180_comp_float.py` (companions) / `test/v179_enemy_parts.py` (enemies): floating pieces.
- Clipping of separately animated parts (wings, tails) into the body: measure it (fold / pose the part, check its
  vertices against the real body mesh) for any new animated part.
