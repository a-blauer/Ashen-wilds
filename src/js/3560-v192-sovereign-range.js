// ================= v192: Sovereigns reach twice as far with ranged attacks; Tab cycles a signature's targets =================
// Owner (Nov 2 2026): "Sovereign bosses are too easy to kite with ranged weapons of all types ... increase the range of all
// boss projectiles and spells by double." and "I had a hard time tab targeting chalices in the Citadel boss fight."
//
// 1. Ranged reach × SOV192.K (2), one knob, applied here to the six Sovereigns' move definitions (SVB[i].M) and to the
//    shared helpers those moves draw and hit through:
//    * the AI range: a ranged move's r[1] (the farthest distance at which the boss picks it) × K (capped at SOV192.cap);
//    * the reach of lines, beams, cones and sweeping streams aimed out from the boss: hit shapes l (lines) and r (cones 'a',
//      rings 'r') × K; targeted circles placed on the hero ('c') keep their size (they already land where you stand);
//    * the helpers with a length written into them: argBeam / argSweepStart (+ argSweepTick, drawn up to the den wall),
//      hydBreath, hydStreamTick, rwrChain, rwrSpikes, rwrCrescent (+ Frostbrand's wave hits), ssrSpray, ssrBeam (+ Sun
//      Lance's Phase II re-burst), the Butcher's Hook throw, Bone Furrow's spikes, the Amber Furrow lines, vlrWave,
//      vlrThorns (a second run of thorns continues each lane), vlrTendrils. Visuals stop at the den wall (sov192Exit), and
//      during a den fight every red warning / hit flash is clipped to the den (svShapeGeo wrapper; a warning circle that
//      lies wholly outside the den is not drawn).
//    * Projectiles (eye bolts, venom globs, icicles, quills, rot globs, blood spears, Reach) are thrown at the hero's spot
//      with a fixed flight time, so they always reached the whole den: only their AI range (and the far pick below) changes.
//    * Melee swings, gap-closing dashes / leaps and the self-centred blasts (novas, stomps, whirls) are unchanged, and so are
//      the arena-wide signatures and den hazards.
//    * Far pick: when the hero stands SOV192.far+ tiles away, svPick answers with a ranged move whenever one is ready
//      (SOV192.pFar of the time when its own pick was a gap closer, always when it had nothing), instead of only walking.
// 2. Tab during a Sovereign signature (Blood Covenant's chalices, and the eyes / braziers / glands / scars / carcasses of
//    the others): the v150 Tab list was every live target within 34 tiles sorted only by distance, with the boss in it, and
//    started after whatever was targeted, so a press from the boss jumped past the nearest chalice; chalices on the far side
//    of the doubled hall (pedestals 16.8 tiles from its centre) were beyond 34 tiles and not in the list at all, any
//    target beyond 30 tiles counted as not visible (the main loop hides models past 30, and v150 skipped hidden ones), and a
//    target more than 32 tiles away was dropped the next frame (tgtTick). Now while a signature's targets stand: Tab goes
//    through them first, nearest first, then the boss (then anything else), and on round; they are never dropped for
//    distance inside the fight; when the targeted one breaks the nearest one left is targeted (the boss when none is left);
//    ranged aim and homing shots follow a targeted one anywhere in the den (v89 only aimed at a target within 24 / 26 tiles);
//    clicking near a chalice's cup picks it even with the boss behind it; a shot homing on a targeted one flies through
//    the (warded) boss instead of stopping on him; and hero shots reach the chalices at all: they stand on pedestals that
//    are solid den tiles (2x2 tiles since the den doubled) and a shot was removed on the pedestal's edge, before it came
//    within 0.75 of the cup, so arrows, bolts and thrown knives could never hit one (melee and area spells could).
// Co-op: the move definitions and helpers are the same code on every machine; the driver picks (the far pick is driver-
// only like svPick) and relays the cast with its seed, so a partner's copy plays the same doubled timeline and hits the
// partner on their own screen. Signature targets are each player's own copies (v146), so Tab is local on each screen.
var SOV192={K:2,on:1,far:9,pFar:.5,cap:80,orig:{},ranged:{},err:0,picks:0,swaps:0,
  // per boss: move -> {r: AI range × K and counts as a ranged move for the far pick, h: hit indices (or 'all') whose
  // line length / cone or ring radius × K}
  M:{0:{gaze:{r:1,h:'all'},gaze2:{h:'all'},sweep:{r:1,h:'all'},furrow:{r:1},furrow3:{r:1},barrage:{r:1},reach141:{r:1}},
     1:{spit:{r:1},geyser:{r:1},deluge:{r:1},breath:{r:1,h:'all'},maelstrom:{r:1,h:'all'},reach141:{r:1}},
     2:{icicles:{r:1},wraithchain:{r:1,h:[0]},prison:{r:1},cleave:{h:[1]},frostbrand:{},reach141:{r:1}},
     3:{spray:{r:1,h:'all'},glare:{r:1,h:'all'},sinkhole:{r:1},quills:{r:1},spit:{r:1},reach141:{r:1}},
     4:{vomit:{r:1,h:'all'},hook:{r:1,h:[0]},furrow:{r:1,h:[0]},burst:{r:1},reach141:{r:1}},
     5:{wave:{r:1,h:'all'},waves:{r:1,h:'all'},thorns:{r:1,h:'all'},grasp:{r:1,h:[0]},skyfall:{r:1},reach141:{r:1}}}};
// distance from (x,z) along yaw a (forward = sin a, cos a) to the den wall; Infinity outside a den
function sov192Exit(A,x,z,a){A=A||(typeof AF!='undefined'?AF:null);if(!A)return Infinity;const ux=Math.sin(a),uz=Math.cos(a),px=x-A.cx,pz=z-A.cz,b=ux*px+uz*pz,c=px*px+pz*pz-ARENA_R*ARENA_R,q=b*b-c;
  return q<0?0:Math.max(0,-b+Math.sqrt(q))}
// a callback on the game clock after T seconds
function sov192After(T,fn){let t=0;kqFx({tick(dt){t+=dt||0;if(t<T)return true;try{fn()}catch(err){if(!SOV192.err++)console.error('v192 after',err)}return false},end(){}})}
function sov192Shape(s){const K=SOV192.K;if(!s||s.v192)return;s.v192=1;if(s.k==='l')s.l*=K;else if(s.k==='a'||s.k==='r')s.r*=K}
// warnings and hit flashes stay inside the den: vertices past the wall are pulled onto it; a circle wholly outside is skipped
{const f=svShapeGeo;svShapeGeo=function(S,an,k,lift){const g=f.apply(this,arguments);try{const A=(typeof AF!='undefined'&&AF&&AF.f)?AF:null;if(!A||!an||Math.hypot(an.x-A.cx,an.z-A.cz)>ARENA_R)return g;
    const P=g.attributes.position,R=ARENA_R+.3;let n=0;for(let i=0;i<P.count;i++){const dx=P.getX(i)-A.cx,dz=P.getZ(i)-A.cz,d=Math.hypot(dx,dz);if(d>R){const nx=A.cx+dx/d*R,nz=A.cz+dz/d*R;P.setXYZ(i,nx,GH(nx,nz)+(lift||.15),nz);n++}}
    if(n){P.needsUpdate=true;g.computeBoundingSphere()}}catch(_){}return g}}
{const f=svWarn;svWarn=function(S,an,T,o){try{const A=(typeof AF!='undefined'&&AF&&AF.f)?AF:null;if(A&&S&&S.k==='c'&&an&&Math.hypot(an.x-A.cx,an.z-A.cz)>ARENA_R+S.r*.6)return {kill(){}}}catch(_){}return f.apply(this,arguments)}}
// ---------------- 1. the move definitions ----------------
function sov192Apply(){const K=SOV192.K;
  for(const i in SOV192.M){const B=SVB[i];if(!B||!B.M)continue;const O=SOV192.orig[i]=SOV192.orig[i]||{},R=SOV192.ranged[i]=SOV192.ranged[i]||new Set();
    for(const id in SOV192.M[i]){const D=B.M[id],o=SOV192.M[i][id];if(!D||D.v192)continue;D.v192=1;
      O[id]={r:D.r?D.r.slice():null,s:(D.hit||[]).map(h=>h&&h.s?Object.assign({},h.s):null)};
      if(o.r){R.add(id);if(D.r)D.r=[D.r[0],Math.min(SOV192.cap,Math.max(D.r[1],D.r[1]*K))]}
      if(o.h&&D.hit)D.hit.forEach((h,k)=>{if(h&&(o.h==='all'||o.h.includes(k)))sov192Shape(h.s)})}}
  // ---- Argus: Amber Furrow — twice as many spike circles down each line ----
  try{const mk=lines=>{const hit=[],N=1+Math.round((14.1*K-2.7)/1.9);lines.forEach((da,li)=>{for(let k=0;k<N;k++){const d=2.7+k*1.9,t=1.2+k*.085;
      hit.push({t,s:{k:'c',r:1.45},w:t-.42,nohit:1,o:c=>{const a=c.m.rotation.y+da,p=c.m.position;return {x:p.x+Math.sin(a)*d,z:p.z+Math.cos(a)*d,a}},fx:(c,an)=>argSpikeAt(c,an,k,li)})}});return hit};
    const M=SVB[0]&&SVB[0].M;if(M&&M.furrow&&!M.furrow.h192){M.furrow.h192=1;M.furrow.hit=mk([0])}if(M&&M.furrow3&&!M.furrow3.h192){M.furrow3.h192=1;M.furrow3.hit=mk([0,-.42,.42])}}catch(err){console.warn('v192 argus furrow',err)}
  // ---- Rime Wraith: Frostbrand's frost wave runs twice as far (the same speed: more hits, a longer move) ----
  try{const D=SVB[2]&&SVB[2].M.frostbrand;if(D&&!D.h192){D.h192=1;const W=D.hit.filter(h=>h.s&&h.s.k==='l'),rest=D.hit.filter(h=>!W.includes(h));
      if(W.length>1){const f0=W[0].f,f1=W[W.length-1].f*K,n=Math.round(W.length*K),sp=(W[1].t-W[0].t)/(W[1].f-W[0].f),add=[];
        for(let j=0;j<n;j++){const f=f0+(f1-f0)*j/(n-1);add.push(Object.assign({},W[0],{f,t:W[0].t+(f-f0)*sp}))}
        D.hit=rest.concat(add);D.dur=Math.max(D.dur,add[add.length-1].t+.3)}}}catch(err){console.warn('v192 frostbrand',err)}
  // ---- Ssith'ra: Sun Lance's Phase II re-burst covers the doubled line ----
  try{const D=SVB[3]&&SVB[3].M.glare;if(D&&!D.e192){D.e192=1;const L=()=>17*SOV192.K;
      D.ev=D.ev.map(v=>{if(v[0]===1.72)return [1.72,c=>{const an=c.M.an.h0;if(c.S.ph>1&&an)c.M.warn.push(svWarn({k:'l',w:2.4,l:L(),b:0},an,.6,{col:0xff8a10}))}];
        if(v[0]===2.32)return [2.32,c=>{const an=c.M.an.h0;if(c.S.ph<2||!an)return;svHitNow(c.e,{k:'l',w:2.4,l:L(),b:0},an,1.1,{col:SSR.glass});
          const end=Math.min(L(),sov192Exit(c.A,an.x,an.z,an.a)+.5);for(let d=1.5;d<end;d+=1.2){const x=an.x+Math.sin(an.a)*d,z=an.z+Math.cos(an.a)*d;burst(new THREE.Vector3(x,GH(x,z)+.6,z),SSR.glass,5,2.4,3,.6)}svSnd('ice',1,.6);shake(.25)}];
        return v})}}catch(err){console.warn('v192 glare',err)}
  // ---- Bloated One: the hook is thrown twice as far; Bone Furrow's spikes race twice as far; the vomit spray reaches out ----
  try{const M=SVB[4]&&SVB[4].M;const H=M&&M.hook;if(H&&!H.e192){H.e192=1;H.ev=H.ev.map(v=>v[0]!==1.3?v:[1.3,c=>{const a=c.m.rotation.y,p=c.m.position,L=Math.min(14.3*SOV192.K,sov192Exit(c.A,p.x,p.z,a)+.5),
        end=new THREE.Vector3(p.x+Math.sin(a)*L,GH(p.x,p.z)+1,p.z+Math.cos(a)*L);c.M.an.hk=bloHookFx(c,end,.16);svSnd('swing',1.1,.8);svSnd('crack',.5,1.5)}])}
    const F=M&&M.furrow;if(F&&!F.e192){F.e192=1;const N=1+Math.round((14.6*K-3.4)/1.6);
      for(let k=8;k<N;k++)F.ev.push([1.45+k*.07,c=>{const m=c.m,a=m.rotation.y,f=3.4+k*1.6,x=(k%2?.35:-.35),p=c.at(f,x),an={x:p.x,z:p.z,a};const A=c.A;if(A&&Math.hypot(p.x-A.cx,p.z-A.cz)>ARENA_R-1)return;
        const mat=bloBoneMat();for(let q=0;q<3;q++){const o=new THREE.Vector3(p.x+(Math.random()-.5)*1.1,0,p.z+(Math.random()-.5)*1.1);svSpike(o,mat,1.3+Math.random()*1.1+(q?0:.6),.22+Math.random()*.12,1.3,.7)}
        svDecal(p,0x1a1408,1.3,4,.55);burst(gY(p,.3),0x6a5a40,14,1.6,2.2,.5);if(k%2===0)svSnd('crack',.7,.7+k*.04);if(k%4===2)shake(.2);
        if(!c.M.an.fh&&c.hit({k:'c',r:1.45},an,1.15,{kb:2.2,col:0xd8ccb0}))c.M.an.fh=1}])}
    const V=M&&M.vomit,h=V&&V.hit&&V.hit[0];if(h&&!h.f192){h.f192=1;const f0=h.fx;h.fx=function(c,an,hit){f0&&f0.apply(this,arguments);
      try{const R=h.s.r;for(let k=0;k<40;k++){const d=9+Math.random()*Math.max(0,Math.min(R,sov192Exit(c.A,an.x,an.z,an.a))-9),a=an.a+(Math.random()-.5)*.9;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.5+Math.random()*1.2,an.z+Math.cos(a)*d),BLO.bile,2,1,.6,.8)}}catch(_){}}}}catch(err){console.warn('v192 bloated',err)}
  // re-register (no new ids, but harmless) so every relayed id still maps to its move
  for(let i=0;i<6;i++)try{if(SVB[i])svRegMoves(i)}catch(_){}}
try{sov192Apply()}catch(err){console.error('v192 sovereign range',err)}
// ---------------- the helpers with a length written into them ----------------
// Argus: the gaze beam (to the den wall), the searing sweep (length, and drawn only up to the wall)
{const f=argBeam;argBeam=function(c,an,L){return f.call(this,c,an,Math.min(L*SOV192.K,sov192Exit(c.A,an.x,an.z,an.a)+1))}}
{const f=argSweepStart;argSweepStart=function(c){const r=f.apply(this,arguments);try{const B=c.M.an.sw;if(B&&!B.v192){B.v192=1;B.L*=SOV192.K}}catch(_){}return r}}
argSweepTick=function(c,dt){const e=c.e,M=c.M,B=M.an.sw;if(!B)return;const m=e.m,o=svWP(e,'brow',0,.02,.3),y1=argSweepYaw(e),y0=B.y;B.y=y1;B.t+=dt;
  const Lv=Math.max(4.5,Math.min(B.L,sov192Exit(c.A,m.position.x,m.position.z,y1)+.5));
  const end=new THREE.Vector3(m.position.x+Math.sin(y1)*Lv,0,m.position.z+Math.cos(y1)*Lv);end.y=GH(end.x,end.z)+.3;const len=o.distanceTo(end),w=1+.12*Math.sin(B.t*40);
  [B.b1,B.b2].forEach(b=>{b.position.copy(o);b.lookAt(end)});B.b1.scale.set(.62*w,.62*w,len);B.b2.scale.set(.2,.2,len);B.tip.position.copy(end);
  B.dc-=dt;if(B.dc<=0){B.dc=.07;const s=4+c.rnd()*(Lv-4),q=new THREE.Vector3(m.position.x+Math.sin(y1)*s,0,m.position.z+Math.cos(y1)*s);svDecal(end,0x2a1804,1.3,3.2,.6);svDecal(q,0x2a1804,.9,2.4,.45);burst(gY(end,.3),ARG.col,5,2,2.2,.45)}
  if(!M.an.got&&dt>0&&AF){const da=svAng(y1-y0),an={x:m.position.x,z:m.position.z,a:y0+da/2},S={k:'a',r:B.L+.5,h:Math.abs(da)/2+.07};
    if(svIn(S,an,pl.position,.35)&&svHitNow(e,S,an,1.5,{flash:false,kb:2}))M.an.got=1}};
// Hydra: venom breath cones and the maelstrom's streams
hydBreath=function(c,s,a0,T){const e=c.e,R=10*SOV192.K,S2={k:'a',r:R,h:.42},o=hydBase(c,s),an={x:o.x,z:o.z,a:c.m.rotation.y+a0};svFlash(S2,an,HYD.ven,700);
  const m=hydMouth(c,s),Lv=Math.max(3,Math.min(R,sov192Exit(c.A,o.x,o.z,an.a)));for(let k=0;k<Math.round(26*SOV192.K);k++){const d=2+Math.random()*(Lv-2),a=an.a+(Math.random()-.5)*.8;burst(new THREE.Vector3(o.x+Math.sin(a)*d,GH(o.x,o.z)+1+Math.random()*2.5,o.z+Math.cos(a)*d),HYD.ven,2,1.4,.6,.9)}
  burst(m,HYD.ven,20,3,1,.6);svSnd('hiss',.9,.8);svHitNow(e,S2,an,1.1,{flash:false,on:()=>dqDebuff('Venom','🟢',{mspd:-.3},2500,'Slowed by venom')})};
hydStreamTick=function(c,dt,on){const e=c.e,M=c.M,m=e.m;if(!M.st)return;M.ht=Math.max(0,(M.ht||0)-dt);M.dc=(M.dc||0)+dt;const drop=M.dc>.22;if(drop)M.dc=0;const R=10*SOV192.K,HS={k:'a',r:R,r0:2.8,h:.2};
  M.st.forEach(q=>{const mo=hydMouth(c,q.s),a=Math.atan2(mo.x-m.position.x,mo.z-m.position.z),Lv=Math.max(3.5,Math.min(R-.5,sov192Exit(c.A,m.position.x,m.position.z,a))),gp=new THREE.Vector3(m.position.x+Math.sin(a)*Lv,0,m.position.z+Math.cos(a)*Lv);gp.y=GH(gp.x,gp.z)+.1;
    q.o.position.copy(mo);const d=gp.clone().sub(mo),L=d.length();q.o.lookAt(gp);q.o.scale.set(1+.15*Math.sin(c.t*31),1+.15*Math.cos(c.t*27),L);q.m.opacity+=((on?.62:0)-q.m.opacity)*Math.min(1,dt*10);
    if(!on)return;if(Math.random()<.9){const r=3+Math.random()*(Lv-3);burst(new THREE.Vector3(m.position.x+Math.sin(a)*r,GH(m.position.x,m.position.z)+.4,m.position.z+Math.cos(a)*r),HYD.ven,2,1.2,2.4,.6)}
    if(drop){const r=4+Math.random()*(Lv-4);svDecal(new THREE.Vector3(m.position.x+Math.sin(a)*r,0,m.position.z+Math.cos(a)*r),0x4adf2a,1.1,2.4,.32)}
    if(M.ht<=0&&svIn(HS,{x:m.position.x,z:m.position.z,a},pl.position,.25)){if(svHitNow(e,HS,{x:m.position.x,z:m.position.z,a},.75,{flash:false,on:()=>dqDebuff('Venom','🟢',{mspd:-.3},1800,'Slowed by venom')}))M.ht=.5}})};
// Rime Wraith: the chain, the cleave's ice spikes, Frostbrand's crescent
{const f=rwrChain;rwrChain=function(c,an,L,caught){return f.call(this,c,an,Math.min(L*SOV192.K,sov192Exit(c.A,an.x,an.z,an.a)+.5),caught)}}
{const f=rwrSpikes;rwrSpikes=function(c,an,L,w,dm){const a=an.a||0,x=an.x,z=an.z;return f.call(this,c,an,Math.max(Math.min(L,4),Math.min(L*SOV192.K,sov192Exit(c.A,x,z,a)+.5)),w,dm)}}
{const f=rwrCrescent;rwrCrescent=function(c,an,f0,f1,T){const K=SOV192.K,f2=Math.max(f0+1,Math.min(f0+(f1-f0)*K,sov192Exit(c.A,an.x,an.z,an.a)-.3));return f.call(this,c,an,f0,f2,T*(f2-f0)/Math.max(.01,f1-f0))}}
// Ssith'ra: the acid spray cones and the Sun Lance beam
ssrSpray=function(c,a0){const e=c.e,o=svWP(e,'head',0,0,1.2),R=9*SOV192.K,S2={k:'a',r:R,h:.38},an={x:e.m.position.x,z:e.m.position.z,a:e.m.rotation.y+a0},Lv=Math.max(3,Math.min(R,sov192Exit(c.A,an.x,an.z,an.a)));
  for(let k=0;k<Math.round(22*SOV192.K);k++){const d=1.5+Math.random()*(Lv-1.5),a=an.a+(Math.random()-.5)*.7;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.3+Math.random()*1.5,an.z+Math.cos(a)*d),SSR.acid,2,1,1.2,.6)}
  burst(o,SSR.acid,16,3,1,.5);svSnd('hiss',.8,1.1);svHitNow(e,S2,an,.9,{col:SSR.acid,on:()=>dqDebuff('Acid','🟡',{pdP:-.15},3000,'Armour melting')});
  for(let d=3;d<Lv;d+=2.5)svDecal(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),0x3a5a08,1.2,2.5,.4)};
{const f=ssrBeam;ssrBeam=function(c,an,L){return f.call(this,c,an,Math.min(L*SOV192.K,sov192Exit(c.A,an.x,an.z,an.a)+.5))}}
// Vaelric: blood waves, thorn lanes (a second run continues each lane), the grasping tendrils
{const f=vlrWave;vlrWave=function(c,a0,spd,L,dm){const p=c.m.position,a=c.m.rotation.y+(a0||0);return f.call(this,c,a0,spd,Math.min(L*SOV192.K,sov192Exit(c.A,p.x,p.z,a)+1),dm)}}
{const f=vlrThorns;vlrThorns=function(c,an,dm){const r=f.apply(this,arguments);try{const K=SOV192.K,seg=12*1.35,sa=Math.sin(an.a),ca=Math.cos(an.a);
    for(let j=1;j<Math.ceil(K-1e-6);j++){const a2={x:an.x+sa*seg*j,z:an.z+ca*seg*j,a:an.a};if(sov192Exit(c.A,an.x,an.z,an.a)<seg*j)break;sov192After(12*.055*j,()=>{if(c.e.dead||!AF)return;f.call(this,c,a2,dm)})}}catch(err){if(!SOV192.err++)console.error('v192 thorns',err)}return r}}
vlrTendrils=function(c,an,hit){const e=c.e,o=svWP(e,'hdL',0,-.16,.04),N=5,L=9.2*SOV192.K,mat=new THREE.MeshBasicMaterial({color:0xb0102a,fog:false}),
  g=svG('vl2_tnd',()=>{const P=[],r=[];for(let k=0;k<=7;k++){const u=k/7;P.push([Math.sin(u*9)*.06*(1-u),Math.cos(u*7)*.05*(1-u),u]);r.push(.11*(1-u*.9))}return svTube(P,r,5)}),T=[];
  for(let k=0;k<N;k++){const a=an.a+(k-(N-1)/2)*.15,l=Math.min(L*(k===2?1:.82+.06*Math.abs(k-2)),sov192Exit(c.A,an.x,an.z,a)),ms=new THREE.Mesh(g,mat);ms.position.copy(o);ms.userData.lpsSkip=1;ms.renderOrder=19;ms.frustumCulled=false;scene.add(ms);
    const tip=new THREE.Vector3(an.x+Math.sin(a)*l,GH(an.x,an.z)+1.0,an.z+Math.cos(a)*l);T.push({ms,tip})}
  let t=0;svSnd('blood',1,.8);svSnd('hiss',.7,.7);
  kqFx({tick(dt){t+=dt||0;const p=svWP(e,'hdL',0,-.16,.04);
    const ext=t<.16?svEase.o(t/.16):t<(hit?.62:.4)?1:Math.max(0,1-svEase.io((t-(hit?.62:.4))/.28));
    T.forEach((q,k)=>{let tip=q.tip;if(hit&&k===2){tip=gY(pl.position,1.0)}q.ms.position.copy(p);const d=tip.clone().sub(p),len=Math.max(.01,d.length()*ext);q.ms.lookAt(tip);q.ms.scale.set(1,1,len);
      if(ext>.9&&Math.random()<.25){const b=p.clone().addScaledVector(d,Math.random()*ext);burst(b,VLR.blood,1,.5,.4,.4)}});
    return t<(hit?.95:.72)&&!e.dead},end(){T.forEach(q=>scene.remove(q.ms));mat.dispose()}})};
// ---------------- the far pick: a ranged answer to a hero who keeps away ----------------
// signature moves, the awakening and the broken stagger are never swapped for a ranged move
function sov192Sig(id){return id==='awaken'||id==='broken'||id==='stagger'||id==='intro'||(typeof SIG163!='undefined'&&Object.prototype.hasOwnProperty.call(SIG163.W,id))}
function sov192Side(e){const m=e.m,ang=Math.abs(svAng(svYawTo(m,pl.position)-m.rotation.y));return ang<1.0?'f':ang>2.1?'b':'s'}
function sov192PickRanged(e){const S=e.sv,B=S.B,R=SOV192.ranged[S.i];if(!R||!R.size)return null;const L=d2(pl.position,e.m.position),side=sov192Side(e),C=[];let tot=0;
  R.forEach(id=>{const D=B.M[id];if(!D||!D.wt||(D.ph||1)>S.ph||(D.ph1only&&S.ph>1))return;if((S.cd[id]||0)>0||S.last[0]===id)return;
    const r=D.r||[0,99];if(L<r[0]||L>r[1])return;const a=D.a||'f';if(a!=='any'&&!(a===side||(a==='fs'&&side!=='b')||(a==='sb'&&side!=='f')))return;
    try{if(D.when&&!D.when(e,L,side))return}catch(_){return}let w=1;try{w=typeof D.wt==='function'?(+D.wt(e,L,side)||0):D.wt}catch(_){w=0}if(S.last[1]===id)w*=.5;if(w>0){C.push([id,w]);tot+=w}});
  if(!C.length)return null;let u=Math.random()*tot;for(const [id,w] of C){u-=w;if(u<=0)return id}return C[C.length-1][0]}
{const f=svPick;svPick=function(e,loose){const S=e&&e.sv;if(!S||!SOV192.on||loose||S.force||!SOV192.ranged[S.i]||e.mb144)return f.apply(this,arguments);
  const id=f.apply(this,arguments);try{if(d2(pl.position,e.m.position)<SOV192.far)return id;const R=SOV192.ranged[S.i];SOV192.picks++;
    if(id&&(R.has(id)||sov192Sig(id)))return id;if(id&&Math.random()>=SOV192.pFar)return id;const q=sov192PickRanged(e);if(q){SOV192.swaps++;return q}}catch(err){if(!SOV192.err++)console.error('v192 pick',err)}return id}}
// a v133 spacing plan that would walk the boss in toward a far hero (for a move with a shorter reach) gives way, as often,
// to a ready ranged move cast from where it stands
{const f=svPlan133;svPlan133=function(e,force){const P=f.apply(this,arguments);try{const S=e&&e.sv;if(!P||force||!S||!SOV192.on||!SOV192.ranged[S.i])return P;
    const L=d2(pl.position,e.m.position);if(L<SOV192.far||P.r[1]>=L||Math.random()>=SOV192.pFar)return P;const q=sov192PickRanged(e);
    if(q){S.plan=null;S.force=q;SOV192.swaps++;return null}}catch(err){if(!SOV192.err++)console.error('v192 plan',err)}return P}}
// ---------------- 2. Tab during a Sovereign signature ----------------
var TAB192={cyc:null,t:0,mem:4000};
// the live targets of the running signature (each player's own copies)
function tab192Props(){try{if(typeof AF=='undefined'||!AF||!AF.f||!AF.s146)return [];return sk146Alive(AF.s146.props).filter(p=>enemies.includes(p)&&p.m&&!p.hid&&!p.mpGhost)}catch(_){return []}}
{const f=selectTarget;selectTarget=function(){const P=tab192Props();if(!P.length){TAB192.cyc=null;return f.apply(this,arguments)}
  const p=pl.position,B=bossEnt(AF.i),now=nowP(),byD=(a,b)=>d2(a.m.position,p)-d2(b.m.position,p);
  const others=enemies.filter(e=>fx150Ok(e)&&e!==B&&!P.includes(e)&&d2(e.m.position,p)<34).sort(byD);
  const all=P.slice().sort(byD).concat(B&&fx150Ok(B)?[B]:[],others);
  let L=TAB192.cyc;const fresh=!L||now-TAB192.t>TAB192.mem;
  if(fresh)L=all;else{L=L.filter(e=>all.includes(e));all.filter(e=>!L.includes(e)).forEach(e=>{if(P.includes(e)){const k=L.findIndex(q=>!P.includes(q));L.splice(k<0?L.length:k,0,e)}else L.push(e)})}
  TAB192.cyc=L;TAB192.t=now;const i=L.indexOf(tgt);
  setTarget(i<0||(fresh&&!P.includes(tgt))?L[0]:L[(i+1)%L.length])}}
// inside the fight a signature target (or the boss) is never dropped for being far away
{const f=tgtTick;tgtTick=function(now,dt){const e=tgt;
  try{if(e&&!e.dead&&!e._gone&&AF&&AF.f&&enemies.includes(e)&&((e.sv&&e.ar===AF.i)||tab192Props().includes(e))){
    tgRing.position.copy(gY(e.m.position,.1));tgRing.scale.setScalar((e.m.bs||1)*(e.boss?1.6:1)*(1+.06*Math.sin(now/180)));tgRing.rotation.z+=(dt||0)*1.5;return}}catch(_){}
  return f.apply(this,arguments)}}
// when the targeted one breaks (or is eaten, or the rite ends) the nearest one left is targeted next frame (the boss when
// none is left: the end-of-rite cleanup removes them one after another, so the choice waits until it is done)
{const f=dqPropGone;dqPropGone=function(e,killed){let was=false;try{was=!!(e&&!e._gone&&typeof tgt!='undefined'&&tgt===e&&AF&&AF.f&&AF.s146&&(AF.s146.props||[]).includes(e))}catch(_){}
  const r=f.apply(this,arguments);
  if(was)try{const A0=AF;sov192After(0,()=>{if(tgt||AF!==A0||!AF||!AF.f)return;const p=pl.position,P=tab192Props().sort((a,b)=>d2(a.m.position,p)-d2(b.m.position,p)),B=bossEnt(AF.i),n=P.length?P[0]:(B&&!B.dead?B:null);if(n)setTarget(n)})}catch(_){}
  return r}}
// ranged aim and homing (v89: only within 24 / 26 tiles) reach a signature target anywhere in the den
{const f=bfxTgtOk;bfxTgtOk=function(t,maxD){try{if(t&&maxD<40&&tab192Props().includes(t))maxD=40}catch(_){}return f.call(this,t,maxD)}}
// clicking near a signature target's cup / body picks it, even with the boss standing behind it
{const f=bfxPick;bfxPick=function(cx,cy){const r0=f.apply(this,arguments);try{const P=tab192Props();if(!P.length)return r0;const r=gl.getBoundingClientRect();if(!r.width)return r0;
    const th=Math.tan(cam.fov*Math.PI/360),v=new THREE.Vector3();let best=null,bs=1;
    for(const e of P){const q=gY(e.m.position,(e.dprop&&e.dprop.cupY)||1.6);v.copy(q).project(cam);if(v.z>1||v.z<-1)continue;const sx=r.left+(v.x+1)/2*r.width,sy=r.top+(1-v.y)/2*r.height,dist=cam.position.distanceTo(q)||1;
      const pr=Math.max(30,1.1/(dist*th)*r.height/2),k=Math.hypot(sx-cx,sy-cy)/pr;if(k<bs){bs=k;best=e}}
    return best||r0}catch(_){return r0}}}
// hero shots reach a signature target: a shot homing on one flies through the (warded) boss instead of stopping on him, and
// the solid tiles of the pedestal a live one stands on (its den tile image, 2x2 tiles since the den doubled) do not stop
// shots: a shot was removed on the pedestal's edge before it came within 0.75 of the cup
TAB192.sh=null;
function tab192Ped(P){const K=new Set();P.forEach(p=>{try{const q=p.m.position,L=typeof denImg=='function'?denImg(q.x,q.z):null;if(L)L.forEach(k=>K.add(k));else if(solid(q.x,q.z))K.add(Math.round(q.z)*W+Math.round(q.x))}catch(_){}});return K.size?K:null}
{const f=solid;solid=function(x,z){const K=TAB192.sh;if(K&&K.has(Math.round(z)*W+Math.round(x)))return false;return f.apply(this,arguments)}}
{const f=shotTick;shotTick=function(dt){const ad=[];let B=null;
  try{if(AF&&AF.f&&AF.s146&&shots.length){const P=sk146Alive(AF.s146.props);if(P.length){TAB192.sh=tab192Ped(P);B=bossEnt(AF.i);
      if(B&&!B.dead)for(const sh of shots){const t=sh.htg;if(t&&t!==B&&P.includes(t)&&sh.hit&&!sh.hit.has(B)&&d2(sh.m.position,B.m.position)<.75+1.2+.6){sh.hit.add(B);ad.push(sh)}}}}}catch(_){}
  try{return f.apply(this,arguments)}finally{TAB192.sh=null;ad.forEach(sh=>{try{sh.hit.delete(B)}catch(_){}})}}}
