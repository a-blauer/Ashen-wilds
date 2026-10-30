# Creature recipe (v172 remaster, work in progress)

The standard for companion and enemy models (not Sovereigns or mini bosses). Worked example: the Ashwolf,
`src/js/3370-v172-ashwolf.js`, built with the kit in `3360-v172-creature-kit.js` and `3361-v172-anatomy.js`.

## The owner's direction (Oct 30 2026)

- Each new model follows its original's direction but is a more serious, detailed version: real anatomy, no goofy or
  childish expressions or proportions, no clipping, no floating parts.
- Owner's reference: a hand-painted low-poly wolf. **Detail is painted, not modelled.** Don't crowd the surface with small
  triangles to make texture; it looks cluttered.

## The method

1. **Simple, smooth body.** Lofts on the rig's own bones (`B.loft`), smooth shading (`CM172.smooth`), moderate polygon count.
   Get the anatomy right: proportions, joints where the bones are, chest / waist / haunch masses, a real skull and jaw.
2. **Painted texture for the surface.** A shared grey detail texture per kind (`cm172Tex`: fur, fine, scale, chitin, skin),
   multiplied by vertex colours. One texture serves every creature and colour. Fur flows along each loft (+v).
3. **A few big, jagged clumps for the silhouette** (`B.fringe`): mane spikes, cheek ruff, chest tuft, elbow and haunch tufts,
   a flame-shaped tail. Few and large, placed where the reference animal really has long fur. Not many small locks.
4. **Bold colour design.** Strong value contrast: a dark back fading to a pale underside (counter-shading). One theme accent
   colour from the creature's name and spell (the Ashwolf's ember), used sparingly: face markings, socks, tail tip, a back streak.
5. **Crisp markings as painted strokes** (`B.stroke`): thin, tapered ribbons on the surface. Vertex-colour blotches look smudged.
6. **The face sells it:** narrow eyes under a heavy brow (`cmEye`), dark lips, teeth and fangs, a jaw that hinges where a jaw
   does (`cm172Hinge`). Never big round eyes.
7. **Everything sits on the surface.** Place parts from surface points (`B.at`, `B.row`). Build with `CM172.chk=1`, and the
   float check must report nothing.

## Checking

`cd test && LIST="old|C:Ashwolf:0;C:Ashwolf:0" VIEWS=34,side,face34,back,walk,attack CHECK=1 TAG=x python3 v172_look.py`
(`old|` = the model before v172, `flat|` = flat shading). Look at idle, walk and attack, and at the face close up.

## Still to do

- The evolution looks (stages 1-3) are the old faceted parts. They need redesigning in the new style.
- Every other companion and enemy.
