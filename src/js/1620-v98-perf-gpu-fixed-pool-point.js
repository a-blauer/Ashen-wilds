// ================= v98 perf_gpu: a fixed pool of point lights + shader warm-up at load =================
// Point lights. Every lit fragment loops over every point light in the scene, and adding or removing a light (or
// toggling .visible) changes the light count, which recompiles every lit material. The game used to keep 12 point
// lights in the scene all the time (hero torch, 4 town lamps TPL, 3 realm lights RLT, 4 dungeon/flash lights DLT).
// Now those 12 (and any PointLight later passed to scene.add) are *virtual light sources*: they are taken out of the
// scene and kept in PGL.src, and the code that moves, colours and flickers them works on them as before. Before each
// render of the main scene, pglTick copies the PGL.n sources nearest the hero (that are on: intensity > 0, visible) onto
// PGL.n real PointLights that never leave the scene. Unused pool lights are parked at intensity 0, so the light count
// never changes. When there are more sources than pool lights, the last slot fades with the gap to the next candidate
// (PGL.fade tiles), so a light swapping in or out never pops.
var PGL={n:+window.AW_PGLN||4,pool:[],src:[],fade:3,far:40,on:true,tmp:[]};
function pglReg(l){if(l&&PGL.src.indexOf(l)<0)PGL.src.push(l);if(l)l.userData.pglV=1;return l}
function pglUnreg(l){const i=PGL.src.indexOf(l);if(i>=0)PGL.src.splice(i,1)}
{
  const add=scene.add,rem=scene.remove;
  for(let i=0;i<PGL.n;i++){const l=new THREE.PointLight(0xffffff,0,10);l.userData.pgl=1;l.name='pgl'+i;PGL.pool.push(l);add.call(scene,l)}
  [torch].concat(typeof TPL!='undefined'?TPL:[],typeof DLT!='undefined'?DLT:[]).forEach(l=>{rem.call(scene,l);pglReg(l)});
  // later point lights become sources too (they never enter the scene, so the light count stays PGL.n)
  scene.add=function(){const a=[];for(let i=0;i<arguments.length;i++){const o=arguments[i];if(o&&o.isPointLight&&!o.userData.pgl){if(o.parent)o.parent.remove(o);pglReg(o)}else a.push(o)}
    return a.length?add.apply(this,a):this};
  scene.remove=function(){for(let i=0;i<arguments.length;i++){const o=arguments[i];if(o&&o.userData&&o.userData.pglV)pglUnreg(o)}return rem.apply(this,arguments)};
}
function pglTick(){
  const P=(typeof pl!='undefined'&&pl)?pl.position:cam.position,C=PGL.tmp;C.length=0;
  for(let i=0;i<PGL.src.length;i++){const s=PGL.src[i];if(!(s.intensity>0)||s.visible===false)continue;
    const p=s.position,d=Math.hypot(p.x-P.x,p.y-P.y,p.z-P.z),r=s.distance>0?s.distance:PGL.far;if(d>r+PGL.far)continue;
    C.push([d-r*.25,s])}
  C.sort((a,b)=>a[0]-b[0]);
  for(let i=0;i<PGL.n;i++){const L=PGL.pool[i],c=C[i];
    if(!c){L.intensity=0;continue}
    const s=c[1];let w=1;if(i==PGL.n-1&&C.length>PGL.n){const g=Math.min(1,Math.max(0,(C[PGL.n][0]-c[0])/PGL.fade));w=g*g*(3-2*g)}
    L.position.copy(s.position);L.color.copy(s.color);L.distance=s.distance;L.decay=s.decay;L.intensity=s.intensity*w}
}

// ---------------- shader warm-up ----------------
// A WebGL program is compiled the first time a material with a new combination of shader features (material type,
// map / vertex colours / skinning / instancing / double side / fog, custom onBeforeCompile key, light counts, shadows)
// is drawn: a one-frame stall (seconds on software GL) whenever a new monster type, effect or loot first comes into view.
// 1. ren.debug.checkShaderErrors=false: three no longer reads the compile/link logs after every compile, which made the
//    driver finish each compile on the spot (set window.AW_SHDBG=1 before load to keep the checks while editing shaders).
// 2. Programs are pinned (pgwPin): three destroys a program when the last material using it is disposed, so effects and
//    summons that dispose their materials compiled the same program again on every cast. Every program now keeps one
//    extra use and lives for the session (there are only a few dozen).
// 3. Warm-up queue (pgwStep, a slice per frame from the first render on, while the title / hero screens are up): first
//    every object already in the scene (all zones, dens, bosses, town, props), then a staging model of every monster
//    type (normal and elite), companion species and colour variant, mount, ground-loot kind and gear slot / weapon type,
//    then plain effect materials (PGW_FX). Each slice goes through ren.compile(scene,cam) with scene.traverse narrowed to
//    the slice, so the programs are built with the real lights (hemi + sun with shadow + the PGL.n pool), fog and
//    environment, and match what the render will ask for. A slice stops after PGW.maxNew new programs or PGW.budget ms,
//    so no single frame takes much longer than a normal first sight of one new monster did. Staging models are dropped
//    after compiling (their programs stay pinned). window.AW_NOWARM=1 before load turns the queue off.
var PGW={done:false,on:!window.AW_NOWARM,q:null,budget:12,maxNew:2,t0:0,ms:0,work:0,frames:0,p0:0,p1:0,n:0,err:[]};
if(!window.AW_SHDBG)ren.debug.checkShaderErrors=false;
function pgwPin(){const P=ren.info.programs;if(P.__pgw)return;P.__pgw=1;P.forEach(p=>p.usedTimes++);const push=P.push;
  P.push=function(){for(let i=0;i<arguments.length;i++)arguments[i].usedTimes++;return push.apply(this,arguments)}}
pgwPin();
// compile the materials of `list` (objects, in the scene or not) against the main scene's lights, fog and environment
function pgwCompile(list){const tr=scene.traverse;scene.traverse=function(f){for(let i=0;i<list.length;i++)list[i].traverse(f)};
  try{ren.compile(scene,cam)}finally{scene.traverse=tr}}
// a small box; with vertex colours it needs a colour attribute (itemSize 3), which is part of the program key (vertexAlphas)
function pgwGeo(vc){const g=new THREE.BoxGeometry(.2,.2,.2);if(vc)g.setAttribute('color',new THREE.Float32BufferAttribute(new Array(g.attributes.position.count*3).fill(1),3));return g}
// a one-bone skinned box, to compile the skinned variants of plain materials
function pgwSkinBox(m){const g=pgwGeo(m.vertexColors),n=g.attributes.position.count;
  g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Array(n*4).fill(0),4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(new Array(n*4).fill(0).map((_,i)=>i%4?0:1),4));
  const b=new THREE.Bone(),s=new THREE.SkinnedMesh(g,m);s.add(b);s.bind(new THREE.Skeleton([b]));return s}
// plain effect materials: [kind, options]; kind b=MeshBasic, s=MeshStandard, l=LineBasic, p=Points, sp=Sprite; options
// vc (vertex colours), sk (skinned), ds / bs (double / back side), nf (fog off), mp (texture map), fl (flat), in (instanced +
// instance colour), na (points without size attenuation). The list is the combinations the game's effects use (from a
// run that cast every ability of every class, fought, looted and summoned mounts); a combination nobody draws costs a
// compile at load for nothing, so keep it short.
var PGW_FX=[['b',''],['b','ds'],['b','bs'],['b','nf'],['b','ds nf'],['b','vc'],['b','vc ds'],['b','vc nf'],['b','sk'],['b','vc sk'],['b','vc sk ds'],['b','sk ds'],
  ['b','mp'],['b','mp ds'],['b','mp nf'],['b','mp ds nf'],['b','mp vc'],['b','in'],
  ['s',''],['s','fl'],['s','fl ds'],['s','vc fl'],['s','vc fl ds'],['s','vc fl sk'],['s','fl sk'],
  ['l',''],['l','vc'],['p',''],['p','mp'],['p','mp vc'],['p','na nf'],['sp','mp']];
var PGW_TEX=null;
function pgwFx(kind,o){const f=' '+o+' ',has=k=>f.indexOf(' '+k+' ')>=0;PGW_TEX=PGW_TEX||new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);
  const p={};if(has('vc'))p.vertexColors=true;if(has('ds'))p.side=THREE.DoubleSide;if(has('bs'))p.side=THREE.BackSide;if(has('na'))p.sizeAttenuation=false;if(has('nf'))p.fog=false;if(has('mp'))p.map=PGW_TEX;
  if(kind=='s'&&has('fl'))p.flatShading=true;if(has('sk'))p.skinning=true;
  const m=kind=='b'?new THREE.MeshBasicMaterial(p):kind=='s'?new THREE.MeshStandardMaterial(p):kind=='l'?new THREE.LineBasicMaterial(p):kind=='p'?new THREE.PointsMaterial(p):new THREE.SpriteMaterial(p);
  const g=pgwGeo(has('vc'));
  if(kind=='l')return new THREE.Line(g,m);if(kind=='p')return new THREE.Points(g,m);if(kind=='sp')return new THREE.Sprite(m);
  if(has('sk'))return pgwSkinBox(m);
  if(has('in')){const im=new THREE.InstancedMesh(g,m,1);im.setMatrixAt(0,new THREE.Matrix4());im.setColorAt(0,new THREE.Color(1,1,1));return im}
  return new THREE.Mesh(g,m)}
// the work queue: each entry is [name, () => object or array of objects to compile]
function pgwQueue(){
  const Q=[],T=(n,f)=>Q.push([n,f]);
  // everything already in the scene, a few top-level objects per entry
  const K=scene.children.slice();for(let i=0;i<K.length;i+=64){const s=K.slice(i,i+64);T('scene '+i,()=>s)}
  // monsters: every EN type, normal and elite
  if(typeof EN!='undefined')Object.keys(EN).forEach(k=>{T('en '+k,()=>cr(enemyC(k,10,{})));T('en* '+k,()=>cr(enemyC(k,10,{al:1})))});
  // companions: every species, and every colour variant / shiny on one species
  if(typeof SP2!='undefined'){Object.keys(SP2).forEach(n=>T('cp '+n,()=>cr(mkC(n,1,0,''))));
    const n0=Object.keys(SP2)[0];if(typeof VAR!='undefined')Object.keys(VAR).forEach(v=>{if(v)T('cpv '+v,()=>cr(mkC(n0,1,0,v)))});
    T('shiny',()=>{const c=mkC(n0,1,0,'');c.shn=1;return cr(c)})}
  if(typeof MOUNTS!='undefined'&&typeof mountModel=='function')Object.keys(MOUNTS).forEach(k=>T('mount '+k,()=>mountModel(k)));
  // ground loot: every drop kind, gear of every slot / weapon type, common and best rarity
  if(typeof lgDropModel=='function'){['egg','megg','potion','mat','item','sup','gold'].forEach(k=>T('drop '+k,()=>lgDropModel(k,null,1)));
    if(typeof ITPL!='undefined'){const seen={};ITPL.forEach((t,i)=>{const key=t.sl+'.'+(t.wt||'');if(seen[key])return;seen[key]=1;
      [0,4].forEach(r=>T('gear '+key+r,()=>lgDropModel('gear',{tp:i,lv:1,r,up:0,aff:[]},r)))})}}
  // effect models with their own materials: Hammer of Light, Explosive / Piercing Arrow, and the fresnel ghost material
  // (fxaFres: Shadow Clone, Call of the Wild) on plain and skinned meshes, with and without vertex colours
  ['fxbHammerModel','fxaBombModel','fxaPierceModel'].forEach(n=>{if(typeof window[n]=='function')T(n,()=>window[n]())});
  if(typeof fxaFres=='function')[[0,0],[1,0],[0,1],[1,1]].forEach(([vc,sk])=>T('fres '+vc+sk,()=>{const m=fxaFres({rim:0x9a7aff,k:1,base:0x201830,op:.6,vc,skin:sk});
    return sk?pgwSkinBox(m):new THREE.Mesh(pgwGeo(vc),m)}));
  PGW_FX.forEach(([k,o])=>T('fx '+k+' '+o,()=>pgwFx(k,o)));
  return Q}
// one slice of the queue (called before a render of the main scene until the queue is empty)
function pgwStep(){
  if(PGW.done||!PGW.on)return;const t=performance.now();
  if(!PGW.q){PGW.q=pgwQueue();PGW.t0=t;PGW.p0=ren.info.programs.length;PGW.n=PGW.q.length}
  const p0=ren.info.programs.length;PGW.frames++;
  while(PGW.q.length&&performance.now()-t<PGW.budget&&ren.info.programs.length-p0<PGW.maxNew){const [n,f]=PGW.q.shift();
    try{let o=f();if(o){if(!Array.isArray(o))o=[o];pgwCompile(o)}}catch(err){PGW.err.push(n+': '+(err&&err.message))}}
  PGW.work+=performance.now()-t;
  if(!PGW.q.length){PGW.done=true;PGW.q=null;PGW.ms=Math.round(performance.now()-PGW.t0);PGW.work=Math.round(PGW.work);PGW.p1=ren.info.programs.length;
    if(PGW.err.length)console.warn('pgw: '+PGW.err.length+' warm-up builders failed: '+PGW.err.slice(0,6).join(' | '))}
}
{const r=ren.render;ren.render=function(sc){if(sc===scene){try{if(PGL.on)pglTick();if(!PGW.done)pgwStep()}catch(err){console.error('perf_gpu',err)}}return r.apply(this,arguments)}}

