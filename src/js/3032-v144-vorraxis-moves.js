// ================= v144 Vorraxis — the moves (Sovereign move format, v110 engine) and the engine glue =================
// He runs on the v110 timeline engine (svStart / svTickMove / svApply / svCast / svAfterMove / svPoise and the stagger, death and
// hit-flash hooks), but not in a Sovereign den: the lair (3033) is his arena. Two small wrappers point the engine at it: svCtx
// gives his moves the lair's clamp (c.inA) and hit test, svHitNow checks hits without the den flag (AF). He never sets e.ar, so his
// death is not a Sovereign defeat, and e.boss keeps him out of co-op sharing (each player fights their own copy; see 3033).
// Pattern (learnable; cooldowns, no repeats, combo strings):
//  close, front ── Scythe Rend: right cut, left cut, a pause… then he rears and drops a crossing double cut down a line (late).
//  mid, front   ── Caustic Lunge: low, scythes swept back, then a long dash through you with jaws wide; acid pools on his path.
//  behind/side  ── Tail Lash: he winds the tail to one side and whips it round: a ring around him (stand close in, or far out).
//  any          ── Ooze Geyser: rears, stabs both scythes into the floor; three geysers erupt under you, each aimed ahead of you.
//  far, front   ── Spine Volley: arches back, the dorsal spines bristle, five spines fly out in a fan. Stand in a gap.
//  close, any   ── Carapace Burst: he curls up and trembles, the ooze in his seams flares; a close blast, then his scales fire out
//                  along eight lanes, then eight more in the gaps. Step into a gap, then shift.
//  Phase II (55%) "The Seeping": a roar, his seams split and the edge of the lair floods with ooze (3033); he rests less and gains
//                  Frenzied Rend (five cuts and a leaping double cut), Caustic Eruption (a ring of geysers closing on you), a double
//                  Spine Volley, and Crystal Siphon: he leaps to the crystal and drinks from it (80% less damage). Three ooze sacs swell
//                  around the lair; burst all three and he is torn out of it, staggered for a long time. If the siphon completes he
//                  heals and floods the whole floor: only the three stone islands that rise out of it are safe.
// Weakness: posture (the yellow bar); every break staggers him (+35% damage). Big moves have armour.
var MB144A=null;   // the lair arena while he exists: {cx, cz, r (his reach), hr (the hero's), y}
{const f=svCtx;svCtx=function(e){const c=f.apply(this,arguments);if(e&&e.mb144){c.A=MB144A;c.inA=(p,mg)=>mb144Clamp(p,mg==null?1.2:mg);c.hit=(s,an,dm,o)=>mb144HitNow(e,s,an,dm,o||{})}return c}}
{const f=svHitNow;svHitNow=function(e,s,an,dm,o){if(e&&e.mb144)return mb144HitNow(e,s,an,dm,o||{});return f.apply(this,arguments)}}
function mb144Clamp(p,mg){const A=MB144A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz),lim=A.r-(mg||0);if(d>lim){p.x=A.cx+dx/d*lim;p.z=A.cz+dz/d*lim}return p}
function mb144HitNow(e,s,an,dm,o){if(!MB144A||!MB144A.f||e.dead)return false;let hit=false;if(o.flash!==false)svFlash(s,an,o.col||MB144.col,o.fms);
  if(hero.hp>0&&svIn(s,an,pl.position,o.pad)){hit=true;SVX.st.hits++;if(o.pre)try{o.pre()}catch(_){}const iv=hero.iv>0;bossHit(e,dm);
    if(!iv&&hero.hp>0){if(o.kb){const dx=pl.position.x-an.x,dz=pl.position.z-an.z,l=Math.hypot(dx,dz)||1,q=mb144HeroIn(pl.position.clone().add(new THREE.Vector3(dx/l*o.kb,0,dz/l*o.kb)));
        pl.step={x:(q.x-pl.position.x)/(o.kb||1),z:(q.z-pl.position.z)/(o.kb||1),t:.22,sp:(o.kb||1)/.22}}
      if(o.on)try{o.on()}catch(err){console.error('mb on hit',err)}}}
  return hit}
function mb144HeroIn(p){const A=MB144A;if(!A)return p;const dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz);if(d>A.hr){p.x=A.cx+dx/d*A.hr;p.z=A.cz+dz/d*A.hr}return p}
// ---------------- effects ----------------
var MB144X={m:null};
function mb144OozeMat(){return MB144X.m||(MB144X.m=new THREE.MeshStandardMaterial({color:0x2a6a14,emissive:0x5ad01a,emissiveIntensity:.9,roughness:.25,flatShading:true}))}
function mb144ChitMat(){return MB144X.c||(MB144X.c=new THREE.MeshStandardMaterial({color:0x1a1c12,roughness:.35,metalness:.3,flatShading:true}))}
const MB144_DEB=['Caustic','🧪',{pdP:-.15,mspd:-.2},'Caustic ooze: −15% physical defence, −20% move speed'];
function mb144Pool(e,p,r,ms){if(!MB144A||!MB144A.f)return;const q=mb144Clamp(p.clone(),.3);s6Pool(e,q,r,0x8ae82a,ms||3500,.16,MB144_DEB)}
// a geyser: a column of ooze bursting out of the floor, chunks of chitin thrown up, a pool left behind
function mb144Geyser(e,p,big){const s=big?1.25:1,col=new THREE.Mesh(svG('mb_gy',()=>{const g=new THREE.CylinderGeometry(.5,.9,1,9,1,true);g.translate(0,.5,0);return g}),
    new THREE.MeshBasicMaterial({color:0xa8ff3a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  const y0=GH(p.x,p.z);col.position.set(p.x,y0,p.z);col.userData.lpsSkip=1;col.renderOrder=21;scene.add(col);let t=0;
  for(let k=0;k<5;k++){const a=k/5*6.283+Math.random(),r=.5+Math.random()*.6;svSpike(new THREE.Vector3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r),k%2?mb144OozeMat():mb144ChitMat(),(1.0+Math.random()*.7)*s,.22*s,1.1,.6)}
  burst(gY(p,.5),0xb8ff3a,40,2.4,5.5,.9);burst(gY(p,.3),0x2a2a1c,14,2,3,.7);svDecal(p,0x2a5a10,1.9*s,3.4,.6);svShock(p,0xb8ff3a,2.4*s,.4);svSnd('splash',1,1.1);
  kqFx({tick(dt){t+=dt||0;const k=t/.75;col.scale.set(s*(1+.3*k),s*(4.5*Math.sin(Math.min(1,k)*Math.PI)+.01),s*(1+.3*k));col.material.opacity=.85*(1-k*.6);return k<1},end(){scene.remove(col);col.material.dispose()}});
  mb144Pool(e,p,1.3*s,3500)}
// a spine flying along a line from the boss; hits once
function mb144Spine(c,an,dm,spd){const e=c.e,a=an.a,L=15,o=new THREE.Vector3(an.x,0,an.z);
  const ms=new THREE.Mesh(svG('mb_spn',()=>{const g=new THREE.ConeGeometry(.09,1.1,5);g.rotateX(Math.PI/2);return g}),mb144ChitMat()),gl=kqSpr(0xb8ff3a,.9);ms.add(gl);ms.userData.lpsSkip=1;scene.add(ms);
  let t=0,hit=false;const T=L/(spd||17);
  kqFx({tick(dt){t+=dt||0;const d=(spd||17)*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+1.3,p.z);ms.rotation.y=a;
    if(Math.random()<.8)burst(ms.position,0xb8ff3a,1,.2,.1,.35);
    if(!hit&&!e.dead&&svIn({k:'l',w:1.1,l:1.2,b:.6},{x:p.x,z:p.z,a},pl.position,.25)){hit=true;mb144HitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a},dm,{flash:false,on:()=>dqDebuff(MB144_DEB[0],MB144_DEB[1],MB144_DEB[2],3000,MB144_DEB[3])});burst(ms.position,0xb8ff3a,16,1.6,1,.4)}
    const A=MB144A;if(A&&Math.hypot(p.x-A.cx,p.z-A.cz)>A.r+1.2)return false;return t<T&&!hit&&!e.dead},end(){scene.remove(ms);if(gl.parent)gl.parent.remove(gl)}})}
// a lane of scale-spikes erupting outward from the boss (Carapace Burst); hits once per lane
function mb144Lane(c,an,dm){const e=c.e,N=10,step=1.05,sa=Math.sin(an.a),ca=Math.cos(an.a);let t=0,k=0,hit=false;
  kqFx({tick(dt){t+=dt||0;while(k<N&&t>=k*.045){const d=1.2+k*step,x=an.x+sa*d,z=an.z+ca*d;k++;const A=MB144A;if(A&&Math.hypot(x-A.cx,z-A.cz)>A.r+.8){k=N;break}
      const p=new THREE.Vector3(x,0,z);svSpike(p,k%3?mb144ChitMat():mb144OozeMat(),1.1+(k%3)*.25,.24,.85,.5);if(k%2)burst(gY(p,.4),0xb8ff3a,4,1.2,1.6,.4);if(k%3===1)svSnd('crack',.45,1.2+k*.04);
      if(!hit&&!e.dead&&svIn({k:'c',r:.72},{x,z,a:0},pl.position,.25)){hit=true;mb144HitNow(e,{k:'c',r:99},{x,z,a:0},dm,{flash:false})}}
    return k<N&&!e.dead},end(){}})}
// where the hero will be (lead seconds ahead), inside the lair
function mb144Aim(c,lead){const v=c.S.hv||{x:0,z:0};return mb144HeroIn(new THREE.Vector3(pl.position.x+v.x*lead,0,pl.position.z+v.z*lead))}
// trails along the scythes: [t0, t1, joint, a, b, colour, life]
const MB144_TR=(t0,t1,j)=>[t0,t1,j,[.28,-.62,0],[.08,-1.48,0],0xc8ff5a,.16];
const MB144_NO141=D=>{D._h141=null;return D};   // keep the v141 wind-up speed-up off: these timings are designed as they are
// ---------------- the moves ----------------
var MB144M={
  intro:MB144_NO141({dur:3.4,inv:[0,3.4],armor:1,trn:[[0,3.4,1.5]],trk:[[.6,'curl','io'],[1.35,'curl','l',.02],[1.65,'roar','o'],[2.9,'roar','l',.025],[3.4,'cRec','io']],
    ev:[[.3,c=>{svSnd('hiss',.8,.7);c.S.chg=0}],[.6,c=>{c.S.chgT=.8}],[1.6,c=>{svSnd('roar',1.1,.75);svSnd('shriek',.6,.8);shake(.4);svShock(c.m.position,MB144.col,9,.8);burst(gY(c.m.position,2),0xb8ff3a,60,5,3,1);c.S.chgT=0}]]}),
  // Scythe Rend (Phase I): right, left, the late crossing cut down a line
  combo:MB144_NO141({wt:10,cd:2.6,r:[0,5.4],a:'f',mel:1,dur:2.55,lock:.4,trn:[[0,.4,5],[.82,.94,5],[1.36,1.62,3.6]],
    trk:[[.4,'rUp','io'],[.52,'rUp','l',.012],[.64,'rCut','s'],[.88,'rCut','l'],[1.0,'lUp','io'],[1.1,'lCut','s'],[1.38,'xUp','io'],[1.64,'xUp','l',.016],[1.78,'xCut','s'],[2.15,'cRec','io'],[2.55,'cRec','l']],
    rm:[[.56,.66,.8,'o'],[1.02,1.12,.7,'o'],[1.68,1.8,1.6,'o']],
    hit:[{t:.63,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.9},{t:1.09,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.9},
      {t:1.78,s:{k:'l',w:2.4,l:5.6,b:0},f:.4,dm:1.35,w:.42,fx:c=>{const p=c.at(2.6);svShock(p,MB144.col,3,.35);burst(gY(p,.3),0xb8ff3a,30,3,2,.5);svDecal(p,0x2a5a10,2,3,.55);shake(.25);svSnd('heavy',1,1.15);mb144Pool(c.e,p,1.4,3000)}}],
    tr:[MB144_TR(.55,.72,'blR'),MB144_TR(1.0,1.16,'blL'),MB144_TR(1.68,1.84,'blL'),MB144_TR(1.68,1.84,'blR')],
    ev:[[.56,c=>svSnd('swing',.85,1.15)],[1.02,c=>svSnd('swing',.85,1.25)],[1.4,c=>svSnd('hiss',.5,1.2)],[1.7,c=>svSnd('whoosh',.95,1.0)]],nx:[['lunge',.25,11],['tail',.3,6]],rec:.3}),
  // Caustic Lunge: the dash through you; acid pools along the path
  lunge:MB144_NO141({wt:8,cd:6,r:[3.6,12],a:'f',armor:1,dur:2.15,lock:.78,trn:[[0,.78,4.5]],
    trk:[[.6,'luLow','io'],[.88,'luLow','l',.014],[1.0,'luGo','s'],[1.24,'luBite','o'],[1.62,'luBite','l'],[2.15,'cRec','io']],
    rm:[[.96,1.22,'tgt','o',-1.4,11.5]],hit:[{t:1.2,s:{k:'l',w:2.6,l:12,b:0},f:0,dm:1.3,w:.75}],
    tr:[MB144_TR(.96,1.25,'blL'),MB144_TR(.96,1.25,'blR')],
    ev:[[.35,c=>{svSnd('hiss',.7,.9);burst(gY(c.m.position,.3),0x3a3428,14,2,1,.5)}],[.96,c=>{svSnd('whoosh',1.2,.9);burst(gY(c.m.position,.6),0xb8ff3a,30,3,1.2,.6)}],
      [1.24,c=>{svSnd('crack',1,.7);svSnd('squelch',.8,.9);burst(c.wp('head',0,-.1,.5),0xb8ff3a,24,2,1.5,.5)}]],
    tk(c){const M=c.M;if(c.t<.96||c.t>1.3)return;M.an.pd=(M.an.pd||0);const p=c.m.position;if(!M.an.lp)M.an.lp=p.clone();if(p.distanceTo(M.an.lp)>1.6){M.an.lp=p.clone();mb144Pool(c.e,p.clone(),.95,4200)}},rec:.35}),
  // Tail Lash: a ring around him (only from behind or the side)
  tail:MB144_NO141({wt:(e,L,side)=>side==='b'?14:side==='s'?6:0,cd:5,r:[0,5.8],a:'sb',dur:1.95,lock:.55,trn:[[0,.5,2]],
    trk:[[.55,'tlWind','io'],[.82,'tlWind','l',.015],[1.0,'tlWhip','s'],[1.36,'tlWhip','l'],[1.95,'cRec','io']],
    hit:[{t:1.0,s:{k:'r',r0:1.1,r:5.8},dm:1.1,kb:3,w:.8,fx:c=>{svShock(c.m.position,MB144.col,6,.4);burst(gY(c.m.position,.6),0xb8ff3a,30,5,1,.5);svSnd('whoosh',1.1,.75);svSnd('heavy',.7,1.3)}}],
    tr:[[.88,1.2,'tail5',[0,0,-.4],[0,0,-1.0],0xc8ff5a,.22]],ev:[[.4,c=>svSnd('hiss',.6,1.1)]],rec:.35}),
  // Ooze Geyser: three eruptions under you, aimed ahead
  geyser:MB144_NO141({wt:8,cd:7,r:[2.5,30],a:'any',armor:1,dur:2.95,lock:.7,trn:[[0,.7,3.5]],
    trk:[[.6,'gUp','io'],[.95,'gUp','l',.016],[1.1,'gStab','s'],[2.45,'gStab','l',.006],[2.95,'cRec','io']],
    hit:[1.5,1.88,2.26].map((t,i)=>({t,s:{k:'c',r:1.9},o:c=>{const p=mb144Aim(c,.45+i*.1);return {x:p.x,z:p.z,a:0}},w:.68,dm:1.0,fx:(c,an)=>mb144Geyser(c.e,new THREE.Vector3(an.x,0,an.z))})),
    ev:[[.5,c=>{svSnd('hiss',.8,.8);svCharge(c.e,'head',MB144.col,.8,.5,0,-.08,.4)}],[1.1,c=>{const p=c.at(1.8);svShock(p,MB144.col,4,.4);burst(gY(p,.3),0x3a3428,24,2.5,2,.6);shake(.3);svSnd('heavy',1.1,.9)}]],rec:.4}),
  // Spine Volley: five spines in a fan (Phase II: two fans)
  volley:MB144_NO141({wt:(e,L)=>L>6?9:3,cd:6.5,r:[4,30],a:'f',dur:2.2,lock:.95,trn:[[0,.95,4]],ph1only:1,
    trk:[[.75,'vArch','io'],[1.0,'vArch','l',.012],[1.12,'vSnap','s'],[1.6,'vSnap','l'],[2.2,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:.8,ay,nohit:1,w:.8,fx:(c,an)=>mb144Spine(c,an,.85)})),
    ev:[[.4,c=>{svSnd('crack',.6,.7);svSnd('hiss',.6,1.3)}],[1.12,c=>svSnd('whoosh',1,1.3)]],rec:.35}),
  // Carapace Burst: a close blast, eight lanes, eight more in the gaps
  burst:MB144_NO141({wt:(e,L)=>L<5?9:2,cd:9,r:[0,6.5],a:'any',armor:1,dur:3.15,trn:[[0,.5,2]],
    trk:[[.7,'curl','io'],[1.78,'curl','l',.022],[1.9,'burst','s'],[2.6,'burst','l'],[3.15,'cRec','io']],
    hit:[{t:1.9,s:{k:'c',r:3.2},dm:1.3,w:1.3,kb:3,fx:c=>{svShock(c.m.position,MB144.col,4,.35);burst(gY(c.m.position,1.5),0xb8ff3a,60,5,3,.7);svDecal(c.m.position,0x2a5a10,3.5,3,.55);shake(.35);svSnd('heavy',1.2,.9);svSnd('crack',.8,.8)}}]
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.12,s:{k:'l',w:1.4,l:10.6,b:-1.2},f:0,ay:k*Math.PI/4,nohit:1,w:.75,fx:(c,an)=>mb144Lane(c,an,1.0)})))
      .concat([0,1,2,3,4,5,6,7].map(k=>({t:2.55,s:{k:'l',w:1.4,l:10.6,b:-1.2},f:0,ay:k*Math.PI/4+Math.PI/8,nohit:1,w:.6,fx:(c,an)=>mb144Lane(c,an,1.0)}))),
    ev:[[.5,c=>{svSnd('charge',.7,.6);c.S.chgT=1.4}],[1.1,c=>svSnd('hiss',.8,.9)],[1.9,c=>{c.S.chgT=0}]],rec:.45}),
  // ---------------- Phase II ----------------
  awaken:MB144_NO141({dur:3.7,inv:[0,3.7],armor:1,trn:[[0,3.5,1.2]],trk:[[.6,'curl','io'],[1.25,'curl','l',.025],[1.6,'roar','o'],[3.1,'roar','l',.03],[3.7,'cRec','io']],
    hit:[{t:1.62,s:{k:'c',r:7},dm:.55,kb:6,w:1.2,fx:c=>{svShock(c.m.position,MB144.col,11,.85);burst(gY(c.m.position,2),0xb8ff3a,100,6,4,1.1);svDecal(c.m.position,0x2a5a10,6,5,.55)}}],
    ev:[[.05,c=>{try{zt116Show(ZT116.Z[0],'Vorraxis · Phase II','The Seeping','His seams split and the lair floods with ooze','Stay off the edge','z0')}catch(_){}svSnd('hiss',1,.6);c.S.chgT=1.2}],
      [1.6,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.chgT=0;try{flash('rgba(120,220,40,.3)')}catch(_){}svSnd('roar',1.2,.65);svSnd('shriek',.8,.7);shake(.55);try{mb144Flood(true)}catch(err){console.error('mb flood',err)}}]]}),
  combo5:MB144_NO141({wt:9,cd:3.6,ph:2,r:[0,5.6],a:'f',mel:1,dur:3.45,lock:.32,trn:[[0,.32,5],[.66,.74,5],[1.02,1.1,5],[1.38,1.46,5],[2.0,2.3,3.6]],
    trk:[[.3,'rUp','io'],[.44,'rCut','s'],[.62,'lUp','io'],[.78,'lCut','s'],[.96,'rUp','io'],[1.12,'rCut','s'],[1.32,'lUp','io'],[1.48,'lCut','s'],[1.95,'leap','o'],[2.28,'xUp','io'],[2.42,'xCut','s'],[2.95,'cRec','io'],[3.45,'cRec','l']],
    rm:[[.38,.46,.7,'o'],[.72,.8,.6,'o'],[1.06,1.14,.6,'o'],[1.42,1.5,.6,'o'],[1.9,2.42,'tgt','io',.4,7]],
    hit:[{t:.44,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.8},{t:.78,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.8},{t:1.12,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.8},{t:1.48,s:{k:'a',r:4.3,h:1.1},f:.3,dm:.8},
      {t:2.42,s:{k:'c',r:3.0},o:'tgt',dm:1.45,w:.5,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,MB144.col,4.5,.45);burst(gY(p,.4),0xb8ff3a,50,4,3,.7);svDecal(p,0x2a5a10,3,3,.55);shake(.4);svSnd('heavy',1.2,1);mb144Pool(c.e,p,1.6,3500)}}],
    tr:[MB144_TR(.36,.5,'blR'),MB144_TR(.7,.84,'blL'),MB144_TR(1.04,1.18,'blR'),MB144_TR(1.4,1.54,'blL'),MB144_TR(2.32,2.46,'blL'),MB144_TR(2.32,2.46,'blR')],
    ev:[[.38,c=>svSnd('swing',.8,1.2)],[.72,c=>svSnd('swing',.8,1.3)],[1.06,c=>svSnd('swing',.8,1.25)],[1.42,c=>svSnd('swing',.8,1.35)],[1.9,c=>svSnd('whoosh',1.1,.8)]],rec:.4}),
  eruption:MB144_NO141({wt:8,cd:9,ph:2,r:[0,30],a:'any',armor:1,dur:3.0,lock:.6,trn:[[0,.6,3]],
    trk:[[.6,'gUp','io'],[.95,'gUp','l',.018],[1.1,'gStab','s'],[2.5,'gStab','l',.006],[3.0,'cRec','io']],
    hit:[0,1,2,3,4,5].map(k=>({t:1.6,s:{k:'c',r:1.6},o:c=>{if(!c.M.an.er){const p=pl.position.clone();c.M.an.er=p}const P=c.M.an.er,a=k/6*Math.PI*2,q=mb144Clamp(new THREE.Vector3(P.x+Math.sin(a)*3.2,0,P.z+Math.cos(a)*3.2),.5);return {x:q.x,z:q.z,a:0}},w:.8,dm:.9,fx:(c,an)=>mb144Geyser(c.e,new THREE.Vector3(an.x,0,an.z))}))
      .concat([{t:2.15,s:{k:'c',r:2.2},o:c=>{const P=c.M.an.er||pl.position;return {x:P.x,z:P.z,a:0}},w:.6,dm:1.2,fx:(c,an)=>mb144Geyser(c.e,new THREE.Vector3(an.x,0,an.z),true)}]),
    ev:[[.5,c=>{svSnd('hiss',.9,.7);c.S.chgT=.8}],[1.1,c=>{c.S.chgT=0;const p=c.at(1.8);svShock(p,MB144.col,4,.4);shake(.3);svSnd('heavy',1.1,.85)}]],rec:.4}),
  volley2:MB144_NO141({wt:(e,L)=>L>5?10:4,cd:7,ph:2,r:[3.5,30],a:'f',dur:2.6,lock:.95,trn:[[0,.95,4],[1.35,1.45,3]],
    trk:[[.75,'vArch','io'],[1.0,'vArch','l',.012],[1.12,'vSnap','s'],[1.3,'vArch','io'],[1.5,'vSnap','s'],[1.95,'vSnap','l'],[2.6,'cRec','io']],
    hit:[-.5,-.25,0,.25,.5].map(ay=>({t:1.14,s:{k:'l',w:1.1,l:14,b:0},f:.8,ay,nohit:1,w:.8,fx:(c,an)=>mb144Spine(c,an,.8,18)}))
      .concat([-.62,-.37,-.12,.12,.37,.62].map(ay=>({t:1.52,s:{k:'l',w:1.1,l:14,b:0},f:.8,ay,nohit:1,w:.4,fx:(c,an)=>mb144Spine(c,an,.8,18)}))),
    ev:[[.4,c=>{svSnd('crack',.7,.7);svSnd('hiss',.7,1.3)}],[1.12,c=>svSnd('whoosh',1,1.3)],[1.5,c=>svSnd('whoosh',1,1.45)]],rec:.4}),
  // Crystal Siphon: he leaps to the crystal and drinks; burst the three sacs, or the floor floods (stand on an island)
  siphon:MB144_NO141({wt:(e,L)=>e.sv.sipN?12:30,cd:26,ph:2,r:[0,40],a:'any',armor:1,dur:12.8,inv:[0,1.2],trn:[[0,.3,2]],
    trk:[[.35,'luLow','io'],[.6,'leap','o'],[1.05,'siph','i'],[1.3,'siph','l'],[9.9,'siph','l',.012],[10.3,'roar','o'],[11.6,'roar','l',.02],[12.2,'gStab','s'],[12.8,'cRec','io']],
    ev:[[.3,c=>{svSnd('hiss',.9,.6);c.M.an.from=c.m.position.clone();c.M.an.to=mb144DaisSpot()}],
      [1.05,c=>{const p=c.m.position;svShock(p,MB144.col,5,.45);burst(gY(p,.3),0x3a3428,30,3,2,.6);shake(.35);svSnd('heavy',1.1,.8);c.S.dr=.2;c.e.sv.sipN=(c.e.sv.sipN||0)+1;try{mb144SiphonStart(c.e)}catch(err){console.error('mb siphon',err)}}],
      [9.9,c=>{try{mb144SiphonEnd(c.e,false)}catch(err){console.error('mb siphon end',err)}c.S.dr=0;mb144Heal(c.e,.12);svSnd('roar',1,.8);try{mb144Islands(c.e)}catch(err){console.error('mb islands',err)}}]],
    hit:[{t:12.2,s:{k:'c',r:99},nohit:1,w:0,show:false,fx:c=>{try{mb144Deluge(c.e)}catch(err){console.error('mb deluge',err)}}}],
    tk(c,dt){const M=c.M;if(c.t<1.05&&M.an.from&&M.an.to){const k=svEase.io(Math.min(1,Math.max(0,(c.t-.35)/.7)));c.m.position.x=M.an.from.x+(M.an.to.x-M.an.from.x)*k;c.m.position.z=M.an.from.z+(M.an.to.z-M.an.from.z)*k;
        if(c.t>.35)c.m.rotation.y+=svAng(svYawTo(c.m,{x:MB144A.cx,z:MB144A.cz})-c.m.rotation.y)*Math.min(1,dt*6)}
      if(c.t>1.05&&c.t<9.9)c.S.chg=.5+.5*Math.sin(c.t*6)},
    end(c,silent){c.S.dr=0;c.S.chg=0;try{mb144SiphonEnd(c.e,true)}catch(_){}},rec:.5}),
  // torn out of the siphon: a long stagger
  broken:MB144_NO141({dur:4.6,trk:[[.3,'stag','o'],[4.0,'stag','l',.03],[4.6,'cRec','io']],
    go(c){c.S.stg=4.6;svSnd('stag',1.2,.8);svSnd('shriek',.8,.9);popT(c.m.position,'TORN FROM THE CRYSTAL','#d8ff7a',true);burst(gY(c.m.position,2),0xb8ff3a,60,4,3,.8);svShock(c.m.position,0xd8ff7a,5,.5)},
    tk(c,dt){c.S.stg=Math.max(0,4.6-c.t);if(Math.random()<dt*8){const p=svWP(c.e,'head',0,0,0);burst(p,0xffe08a,1,.5,.6,.5)}},end(c){c.S.stg=0}})};
// Frenzied Rend and the second volley take over from their Phase I versions
MB144M.combo.ph1only=1;
