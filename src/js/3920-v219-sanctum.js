// ================= v219: The Hidden Sanctum — fair spikes, a steady bridge, a still tomb, a real flooded stair (owner, Nov 10 2026) =================
// Owner: "In the hidden sanctum, the floor spikes need a delay to give the player a chance to step to the next spot. On the tiles that
// fall, the character drops briefly when they first step on and step off the last one. In the last room the coffin shifts for no
// reason, and the flooded stair is just a flat wall. Add an actual flooded stairway"
//  * The Spike Hall (3314 dg165SSpikes): the bands rolled on every .62 s with a .36 s red warning, too quick to read and step. They now
//    move every 1.05 s (DS218.step) and glow red for .65 s first (DS218.warn): each safe spot stays safe long enough to step into.
//  * The Chasm: next to the bridge the ledge's ground dips toward the pit below it (the ground's corners are shared with the pit), so
//    the hero sank for a moment stepping onto the first slab and off the last. On the ledges the hero now stands on the floor.
//  * The Keeper's Tomb: the sarcophagus lid slid and turned by itself as you walked in (a scare); it stays shut now (the whisper
//    still comes).
//  * The flooded stair: the steps were built going down past the end wall, outside the level, so only the wall showed. Now a
//    stairwell is cut into the tomb's floor before the end wall (DS218.well): an arched entrance, nine stone steps going down
//    between walls into green water that fills the bottom, the ground lowered under it so the hero can walk down into it.
//    "F · Descend the flooded stair" works on the steps as before.
// v226: a step of 1.2 s, and the next band rises .55 s after the last one drops (DG165SP.spkGap, 3314): see dg165SSpikes
var DS218={on:true,step:1.2,warn:.7,gap:.55,well:{u0:90.6,u1:93.4,v0:313,v1:319.8,n:9,dy:.32,water:1.45},err:0};
if(DS218.on){DG165SP.spkStep=DS218.step;DG165SP.spkWarn=DS218.warn;DG165SP.spkGap=DS218.gap}
// ---------- the stairwell: no floor slabs over it, the ground lowered under it ----------
function ds218InWell(u,v){const w=DS218.well;return u>=w.u0-.6&&u<w.u1+.6&&v>=w.v0&&v<w.v1+.2}
{const f=dg165SFloor;dg165SFloor=function(I){DS218.cut=1;try{return f.apply(this,arguments)}finally{DS218.cut=0}}}
{const f=dg165SanFloor;dg165SanFloor=function(u,v){if(DS218.cut&&DS218.on&&ds218InWell(u,v))return 'pit';return f.apply(this,arguments)}}
function ds218StepTop(v){const w=DS218.well,F0=dg165SY(),d=(w.v1-.5-w.v0)/w.n;const i=Math.max(0,Math.min(w.n-1,Math.floor((v-w.v0)/d)));return F0-w.dy*(i+1)}
function ds218Ground(){const I=dg165SI(),w=DS218.well,HI=(i,j)=>(j+HPD)*HW+i+HPD;if(!I)return;let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,n=0;
  for(let Z=Math.floor(I.y0+w.v0-2);Z<=I.y0+w.v1+2;Z++)for(let X=Math.floor(I.x0+w.u0-2);X<=I.x0+w.u1+2;X++){const u=X-I.x0+.5,v=Z-I.y0+.5;if(u<w.u0-.2||u>w.u1+.2||v<w.v0+.4||v>w.v1+.1)continue;
    const h=ds218StepTop(v)-.3;if(HF[HI(X,Z)]>h){HF[HI(X,Z)]=h;n++;x0=Math.min(x0,X);z0=Math.min(z0,Z);x1=Math.max(x1,X);z1=Math.max(z1,Z)}}
  if(n&&typeof ts218Redraw=='function')ts218Redraw(x0-1,z0-1,x1+1,z1+1);DS218.n=n}
try{if(DS218.on)ds218Ground()}catch(e){console.warn('v219 sanctum well ground',e)}
// ---------- the stairwell's stone: steps, walls down into the water, an arch over the top, the water ----------
function ds218Kit(k){const C=DG165SM.c,w=DS218.well,F0=dg165SY(),W2=(u,v)=>dg165SW(u,v),cu=(w.u0+w.u1)/2,wd=w.u1-w.u0,d=(w.v1-.5-w.v0)/w.n;
  for(let i=0;i<w.n;i++){const top=F0-w.dy*(i+1),[x,z]=W2(cu,w.v0+d*(i+.5));k.p('','box','c',lgCol(0x4a4a4e,0x16201c,i/w.n),x,top-.5,z,wd,1.0,d*1.02);if(i%2==0)k.p('','box','c',C.st3,x,top+.01,z-d*.48,wd*.98,.02,.06)}
  // the side walls (from the floor's edge down past the water) and the end wall
  [[w.u0-.32,.64],[w.u1+.32,.64]].forEach(([u,t])=>{const [x,z]=W2(u,(w.v0+w.v1)/2);k.p('','box','c',C.st2,x,F0-1.55,z,t,3.4,w.v1-w.v0+.4);k.p('','box','c',C.st,x,F0+.08,z,t+.06,.16,w.v1-w.v0+.45)});
  {const [x,z]=W2(cu,w.v1+.12);k.p('','box','c',C.st2,x,F0-1.55,z,wd+1.3,3.4,.34)}
  {const [x,z]=W2(cu,w.v0-.12);k.p('','box','c',C.st3,x,F0+.02,z,wd+1.3,.06,.28)}
  // the arch over the way down: two pillars and a lintel with a carved skull
  [w.u0-.32,w.u1+.32].forEach(u=>{const [x,z]=W2(u,w.v0+.2);k.p('','box','c',C.st,x,F0+1.3,z,.58,2.6,.58);k.p('','box','c',C.st2,x,F0+2.66,z,.7,.14,.7)});
  {const [x,z]=W2(cu,w.v0+.2);k.p('','box','c',C.st,x,F0+2.92,z,wd+1.4,.42,.62);k.p('','sph','c',C.bone,x,F0+2.92,z-.33,.2,.18,.12)}
  // bones on the steps above the water
  for(let i=0;i<4;i++){const [x,z]=W2(cu+(i%2?.6:-.7),w.v0+d*(i+.4));k.p('','sph','c',C.bone2,x,F0-w.dy*(i+1)+.05,z,.12,.05,.14)}}
{const f=dg165SBuild;dg165SBuild=function(){const had=!!DG165S.S,S=f.apply(this,arguments);if(had||!DS218.on||!S)return S;try{
    if(S.stair)S.stair.visible=false;const g=dt168G('DG218|well',ds218Kit,0);S.root.add(g);S.well218=g;
    const w=DS218.well,F0=dg165SY(),[x,z]=dg165SW((w.u0+w.u1)/2,(w.v0+w.v1+1.2)/2);
    if(S.water){const og=S.water.geometry;S.water.geometry=new THREE.PlaneGeometry(w.u1-w.u0,w.v1-w.v0-1.2).rotateX(-Math.PI/2);S.water.position.set(x,F0-w.water+.03,z);og.dispose()}
    const wm=new THREE.Mesh(new THREE.PlaneGeometry(w.u1-w.u0,w.v1-w.v0-1.2).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x123a30,roughness:.08,metalness:.3,transparent:true,opacity:.82}));
    wm.material.userData.noFade135=1;wm.position.set(x,F0-w.water,z);S.root.add(wm);S.water218=wm;
    S.spots.push({x,y:F0-w.water+.4,z,c:0x3affb0,i:1.4,r:8,fq:1.2})}catch(e){console.warn('v219 sanctum well',e)}return S}}
// ---------- each frame: the ledges hold the hero up; the lid stays put; the water moves ----------
{const f=dg165STick;dg165STick=function(dt,now){
  // the tomb's scare without the sliding lid: claimed here first, the whisper played here
  try{if(DS218.on&&dg165SIn()&&DG165S.S&&!DG165S.scare.tomb){const [hu,hv]=dg165SL(pl.position.x,pl.position.z);if(hv>291){DG165S.scare.tomb=1;
      setTimeout(()=>{try{dg165Snd('whisper',.8,.7);say('🕯 <i>“…below… what lies below, I keep…”</i>')}catch(_){}},900)}}}catch(_){}
  const r=f.apply(this,arguments);
  try{if(DS218.on&&dg165SIn()&&!DG165S.fall&&!(typeof AWD!='undefined'&&AWD.dead)){const H=pl.position,[hu,hv]=dg165SL(H.x,H.z),room=dg165SanFloor(hu,hv),F0=dg165SY();
      if(room==='ledge'&&H.y<F0)H.y=F0;
      const S=DG165S.S;if(S&&S.water218){const t=now/1000;S.water218.position.y=F0-DS218.well.water+Math.sin(t*1.3)*.03}}}catch(e){if(!DS218.err++)console.warn('v219 sanctum tick',e)}
  return r}}
