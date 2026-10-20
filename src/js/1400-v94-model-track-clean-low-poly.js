// ================= v94 (model track): one clean low-poly style for every humanoid =================
// The hero (all classes, co-op partners, bag and creator previews), every humanoid foe, the humanoid Sovereigns and the
// town folk are rebuilt in the look of the v81 companions: few smooth lofted shapes, flat shading, crisp per-face colour
// regions (no random jitter, no per-vertex mottling) and a small, coherent palette per character.
//  * Skeletons are untouched: every body is skinned to the SAME bones (HB for heroes and foes, idlNB for town folk), the
//    bone names, rest positions and hand bones (aL2/aR2) are the old ones, so the v85 animation, v91 ability poses,
//    v93 grips and v93 idle layer work as before. Only geometry and materials change.
//  * Builder (mdB): lofts of rings (like lpGeo) skinned with up to 4 bone weights per vertex, plus rigid dkKit parts on a
//    bone, merged into at most three geometries per model — cloth/skin ('c'), metal ('m'), glow ('g') — so a whole
//    character is one to three draw calls (+ its weapons). Faces are coloured one colour each (non-indexed geometry), so
//    colour regions have hard, clean edges. Geometry is cached by a key (hero: class + look + worn items; foe: type).
//  * Equipment is built against the body (zzN_model_gear.js): armour pieces are shells of the body's own ring profile,
//    pushed out by a small offset, with the body's bone weights — so they deform with every pose and never float.
//  * Hero look (contract with the creator track): heroLook(h) (defined by that track) returns
//    {skin,hair,hairStyle 0-5,face 0-5,eye,build 0-2,height .94-1.06,sex 0|1}; without it hero.look or defaults are used.
//    heroRebuild(h) rebuilds a hero model in place; heroBuildPreview(look,cls) makes a stand-alone preview model.
var MDL;
function mdS(){return MDL||(MDL={G:new Map(),cap:48,M:null,stat:{built:0,ms:0}})}
// ---------------- materials (shared for foes and town folk; heroes get their own copies) ----------------
function mdMats(){const S=mdS();if(S.M)return S.M;const f=o=>Object.assign({vertexColors:true,flatShading:true,skinning:true},o);
  S.M={c:new THREE.MeshStandardMaterial(f({roughness:.92,metalness:0,side:THREE.DoubleSide})),
    m:new THREE.MeshStandardMaterial(f({roughness:.48,metalness:.5,side:THREE.DoubleSide})),
    g:new THREE.MeshBasicMaterial({vertexColors:true,skinning:true,side:THREE.DoubleSide})};
  for(const k in S.M)S.M[k].userData.lps=1;return S.M}
function mdOwnMats(){const M=mdMats(),o={};for(const k in M){o[k]=M[k].clone();o[k].userData.lps=1;o[k].userData.mdOwn=1}return o}
// ---------------- colour helpers ----------------
function mdC(h){return typeof h=='string'?parseInt(h.replace('#',''),16):Array.isArray(h)?dkHex(h.map(v=>Math.max(0,Math.min(255,Math.round(v))))):h}
function mdMix(a,b,t){return new THREE.Color(mdC(a)).lerp(new THREE.Color(mdC(b)),t).getHex()}
function mdSh(a,f){const c=new THREE.Color(mdC(a));c.multiplyScalar(f);c.r=Math.min(1,c.r);c.g=Math.min(1,c.g);c.b=Math.min(1,c.b);return c.getHex()}
function mdHash(s){let h=7;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}

// =====================================================================================================
// the builder
