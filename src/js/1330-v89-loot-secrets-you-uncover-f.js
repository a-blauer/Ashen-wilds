// ================= v89 loot: secrets you uncover with F, treasure maps that name their zone, distinct gathering nodes =================
// 1. SECRETS  — walk up to a cracked boulder and press F (or tap the prompt / mobile F) to uncover the hidden cache.
//               Works for every class and weapon; attacks still crack it too (harmless). Each player uncovers their own cache.
// 2. MAPS     — every treasure map belongs to one zone (m.r) and sits in the bag as an item until its treasure is dug up.
//               The ✕ is placed at runtime on a tile reachable from the zone entrance (flood fill over !solid tiles),
//               away from the den, the sealed wave arena, camps and water. Old saves are migrated in x2Load.
//               (Old bug: maps were placed by tier, so Sands/Dirge maps swapped zones and Kindlelight maps could land in
//               Duskhold; spots were never checked for reachability, e.g. inside the sealed wave arena.)
// 3. NODES    — every gathering node kind has its own low-poly model (stone, iron vein, crystal, fiber grass, berry bush,
//               flowers, glow caps, bones), one instanced mesh per part, and the F prompt names the material.

// ---------------- shared helpers ----------------
function lnHash(x,y,s){const k=Math.sin(x*127.1+y*311.7+(s||0)*74.7)*43758.5453;return k-Math.floor(k)}
var LN={};

// =====================================================================================================
// 1. secrets: F to uncover
