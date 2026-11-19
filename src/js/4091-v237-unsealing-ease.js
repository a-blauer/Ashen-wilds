// ================= v237 the Unsealing, easier (owner, Nov 15 2026) =================
// "The unsealing quest is too hard. Reduce spawn rates by 30%, make them spawn more scattered and have most spawn farther away and
//  make cheddar's health regen slowly. enemies are also getting stuck in the corner next to the sealed gate."
//  * Spawn rate: the time between waves ×US205.spK (1/0.49 since v238: two 30% cuts, 49% of the old spawns a minute; 3733's us205Tick reads it).
//  * Where they come from: the six old mist pools sat on the gate side of the clearing, two in the narrow neck beside the gate
//    towers. Now (us205Spots, replaced) a near ring of six pools, 8.5–12 m from Cheddar, spread over the road side and never in
//    the gate's neck (local a ≤ F.reach − US237.gate), and (us205Far) a far ring of up to ten points 14–22 m out on the road side.
//    Thralls, bats and stalkers come from the far ring US237.far (70%) of the time, the rest from the near ring; magisters walk to
//    the near ring as before; the Gate-Breaker from the farthest point. Each one lands somewhere in a disc of US237.sc m round its
//    point, always on open ground with room round it (us237Room), so the court arrives scattered.
//  * Cheddar heals US205.rg (0.5) health a second while no siphon holds him and he has not been hurt for US205.rgW (4) seconds
//    (the region host: his health goes out to partners in 'c5ue' as before).
//  * Stuck creatures (us237Unstick, from an eTick wrapper, every court creature but the stalkers in mist): one standing partly
//    inside a blocked tile (the walker then refuses every step, which is what held them in the corner by the gate) is put back on
//    the nearest open ground; one that has not moved US237.st m in US237.stT s while still US237.near m or more from its target steps
//    sideways for US237.dT s (it slides round a key bowl or a tower), trying the other side next time.
// Co-op: the host spawns and moves the court (3760: partners' copies follow its positions) and owns Cheddar's health, so a
// partner sees the same.
var US237={gate:7,far:.7,sc:3,minR:9.5,st:.25,stT:1.5,dT:.9,dsp:1.7,near:1.9,err:0};   // near: closer than this to its target counts as arrived (thralls and bats fight from ~1.3 m)
US205.spK=1/(0.7*0.7);   // v238 (owner, Nov 15 2026: "Reduce enemy spawns during the unsealing by an additional 30% during the phase spawns"): 0.7 × 0.7 = 49% of the v236 rate
US205.rg=.8;US205.rgW=3;   // v240: was 0.5 / 4 s
// open ground with room round it: every tile within r m (plus the walker's body) open, inside this instance, not in the cliffs
function us237Room(x,z,r){const F=cq205F(0);for(let dx=-r;dx<=r+1e-6;dx+=.5)for(let dz=-r;dz<=r+1e-6;dz+=.5){if(dx*dx+dz*dz>r*r+1e-6)continue;
    const X=Math.round(x+dx),Z=Math.round(z+dz);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;if(solid(X,Z))return false;const J=insAt(X,Z);if(!J||J.g!==F.I.g)return false;if(MAP.DW[Z*W+X]>-1.3)return false}
  return true}
// points on a ring round Cheddar's circle, on the road side (θ = 0 straight down the road), never in the gate's neck
function us237Ring(th,rs,n,sep){const F=cq205F(0),c=ch205Spots().circ,[ca,cb]=F.L2(c.x,c.z),out=[];
  th.forEach(t=>{if(out.length>=n)return;for(const r of rs){const a=ca-Math.cos(t)*r,b=cb+Math.sin(t)*r;if(a>F.reach-US237.gate)continue;const [x,z]=F.W2(a,b);
    if(!us237Room(x,z,1.6))continue;if(out.some(o=>Math.hypot(o.x-x,o.z-z)<sep))continue;out.push({x,z,y:GH(x,z),a:Math.atan2(c.x-x,c.z-z)});break}});
  return out}
us205Spots=function(){if(us205Spots.c)return us205Spots.c;const D=Math.PI/180;
  let L=us237Ring([-105,-63,-21,21,63,105].map(d=>d*D),[11,12,10.5,12.5],6,4);   // v240: was 8.5–12 m
  if(L.length<4)L=L.concat(us237Ring([-125,-84,-42,0,42,84,125].map(d=>d*D),[11,12.5,10.5,13],6-L.length,3.5));   // a narrow clearing: fill in
  return us205Spots.c=L};
function us205Far(){if(us205Far.c)return us205Far.c;const D=Math.PI/180,th=[];for(let i=0;i<10;i++)th.push((-75+i*150/9)*D);
  let L=us237Ring(th,[18,16,20,14,22],10,4);if(L.length<3)L=L.concat(us205Spots());return us205Far.c=L}
// a scattered landing place round point p: open with room for the spawn's own ±1 m jitter
function us237Land(p){const c=ch205Spots().circ;for(let i=0;i<16;i++){const u=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*US237.sc,x=p.x+Math.cos(u)*r,z=p.z+Math.sin(u)*r;if(Math.hypot(x-c.x,z-c.z)<US237.minR+1.45)continue;   /* us205Spawn nudges up to 1.41 m after this */ if(us237Room(x,z,1.5))return {x,z,y:GH(x,z),a:p.a}}return p}   // v240: never inside minR of Cheddar
{const f=us205Spawn;us205Spawn=function(kind,at){try{if(!at){const far=us205Far(),near=us205Spots();let L;
      if(kind==='brk'){const c=us205C();L=[far.reduce((a,p)=>!a||!c||Math.hypot(p.x-c.x,p.z-c.z)>Math.hypot(a.x-c.x,a.z-c.z)?p:a,null)]}
      else L=kind==='siph'?near:Math.random()<US237.far?far:near;
      const p=L.length?L[Math.floor(Math.random()*L.length)]:null;if(p)at=us237Land(p)}
    else if(kind==='brk'){const c=us205C(),far=us205Far();if(far.length&&c)at=far.reduce((a,p)=>Math.hypot(p.x-c.x,p.z-c.z)>Math.hypot(a.x-c.x,a.z-c.z)?p:a,far[0])}}catch(err){if(!US237.err++)console.warn('v237 spawn',err)}
  const e=f.call(this,kind,at);
  try{if(e&&!us237Free(e.m.position)&&at){e.m.position.x=at.x;e.m.position.z=at.z}}catch(_){}
  return e}}
// Cheddar heals slowly (host)
{const f=us205Tick;us205Tick=function(dt,now){const E=US205.E;let pre=null;
  try{if(E&&E.go&&us205Host()){if(E.lhp!=null&&E.hp<E.lhp-.01)E.rgT=US205.rgW;pre=E.hp}}catch(_){}
  const r=f.apply(this,arguments);
  try{const X=US205.E;if(X&&X===E&&X.go&&us205Host()&&pre!=null){if(X.hp<pre-.01)X.rgT=US205.rgW;X.rgT=Math.max(0,(X.rgT||0)-dt);
      if(!X.rgT&&!X.siN&&X.hp>0&&X.hp<US205.hpM){X.hp=Math.min(US205.hpM,X.hp+US205.rg*dt);X.rgOn=1}else X.rgOn=0;X.lhp=X.hp}}catch(err){if(!US237.err++)console.warn('v237 regen',err)}
  return r}}
// ---------- stuck creatures ----------
function us237Free(p){return !CR.some(([a,b])=>solid(p.x+a,p.z+b))}
function us237Out(e){const p=e.m.position;for(const r of [.4,.7,1,1.4,1.9,2.5])for(let i=0;i<12;i++){const u=i*Math.PI/6,x=p.x+Math.cos(u)*r,z=p.z+Math.sin(u)*r;if(us237Free({x,z})){p.x=x;p.z=z;return true}}return false}
// where it is trying to go: its last target (recorded below) or Cheddar
{const f=eTarget;eTarget=function(e,m,dpl){const tg=f.apply(this,arguments);if(e&&e.us205&&tg&&tg.position)e.us237T=tg;return tg}}
function us237Unstick(e,dt,now){if(e.us205==='mist'&&e.usM&&e.usM.st!=='hunt')return;if(e.us205==='siph'&&e.usS&&e.usS.st==='drain')return;
  const p=e.m.position;
  // partly inside a blocked tile: back onto open ground
  if(!us237Free(p)){us237Out(e);e.us237P=null;return}
  // a sideways step under way
  if(e.us237D>0){e.us237D-=dt;const t=e.us237T||{position:us205C()||p},dx=t.position.x-p.x,dz=t.position.z-p.z,L=Math.hypot(dx,dz)||1,s=e.us237S||1;
    walkM(e.m,(-dz/L*s*.8+dx/L*.35)*US237.dsp*dt,(dx/L*s*.8+dz/L*.35)*US237.dsp*dt);return}
  const S=e.us237P||(e.us237P={x:p.x,z:p.z,t:now});if(now-S.t<US237.stT*1000)return;
  const moved=Math.hypot(p.x-S.x,p.z-S.z);S.x=p.x;S.z=p.z;S.t=now;
  const t=e.us237T||{position:us205C()||p},far=Math.hypot(t.position.x-p.x,t.position.z-p.z);
  const busy=e.atk||e.stun>0||e.root>0||(e.us205==='brk'&&e.usB&&e.usB.st!=='march')||(e.us205==='siph'&&e.usS&&e.usS.st!=='walk');
  if(moved<US237.st&&far>US237.near&&!busy){e.us237S=-(e.us237S||-1);e.us237D=US237.dT}}
{const f=eTick;eTick=function(e,dt,now){try{if(e&&e.us205&&!e.dead&&!e.mir&&US205.E&&dt>0)us237Unstick(e,dt,now)}catch(err){if(!US237.err++)console.warn('v237 unstick',err)}return f.apply(this,arguments)}}
// the far points get mist pools too (the court rises out of them)
{const f=us205MistMake;us205MistMake=function(){if(US205.mist.length)return f.apply(this,arguments);const o=us205Spots();us205Spots.c=o.concat(us205Far());try{return f.apply(this,arguments)}finally{us205Spots.c=o}}}
