# Model review checklist (owner's request, Oct 30 2026; made lighter Nov 2 2026)

Why it exists: the owner kept finding bugs in models before Claude did (floating ears and beaks, wings clipping into the
body). Why it was made lighter (Nov 2 2026): review rounds kept looping on taste, which costs a lot and is the owner's call.
So the rule now is: **catch clear bugs, then show the owner pictures. The owner judges the look and style.**

## The steps (before showing the owner any new or changed creature model)
1. **Render a review set** — on GitHub, with `tools/sheet.sh` (README, Testing), not locally. `test/v180_look.py` at W=480 or more:
   - whole body, 4 views: idle, walkA, bite, atk, and the creature's special poses;
   - close-ups (dist 0.5–0.9, aim with `b=BONE@dx,dy,dz`) of the joins: head and face, mouth / beak / jaw at rest and in the bite,
     ears / horns, limb tops, wing roots, tail root;
   - `NOEVO=1` for the bare body, the evolution levels the change touches, a few traits / variants.
2. **Run the automatic checks** (`tools/ci.sh changed`, or the scripts through `tools/sheet.sh` / locally):
   - floating pieces: `test/v180_comp_float.py` (companions) / `test/v179_enemy_parts.py` (enemies). Keep the defaults —
     **all poses including bite** (`POSES=idle,walkA,walkB,bite`) and **all sets** (`SETS=base,trait,var,fuse`). Narrowing
     `SP` to the changed species is fine; dropping the bite pose or the trait / variant / fusion sets is not.
   - a new animated part (wing, tail): measure its clipping into the body in its posed frames.
3. **One fresh-agent review, only one.** Hand the pictures to one fresh agent (Agent tool, read-only; check `git status` after)
   that has not seen the design reasoning, with the bug list below. It lists clear bugs, worst first, each with the picture
   and the spot.
4. **Fix only clear bugs:**
   - floating or detached parts (a gap, edge or shadow line between a part and the body, at rest or in motion);
   - clipping (a part passing through the body or another part in any pose);
   - broken faces or mouths (eyes off the head, a jaw that splits or turns inside out in the bite, missing teeth plates);
   - test failures.
   Taste notes (colour, proportions, "could look better", style) are **not** fixed by Claude: pass them to the owner as notes.
5. **At most 2 fix rounds per model** (fix → re-render → check what you fixed; no second review agent). After round 2, show
   the owner anyway, listing anything still open.
6. **Show the owner the pictures**, with one line on what the reviewer found and what was fixed. The owner decides the look.

## Reference: what to look at
- Attachment: every piece's root inside the body, at rest and in motion.
- Clipping: folded wings, tails, capes, weapons stay outside the body.
- Faces and mouths: eyes, jaw, beak halves line up in every pose.
- Motion (`test/v182_clip.py` contact sheet): nothing spins, drifts or snaps.
- Look and style (owner's call, keep as notes): dark fantasy, not cute; no lumpy surfaces, no cel-shaded colour steps;
  proportions close to the real animal; the detail recipe (`docs/MODEL_DETAIL_RECIPE.md`).
