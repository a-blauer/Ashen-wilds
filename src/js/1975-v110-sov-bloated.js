// ================= v110 Sovereign 4 — The Bloated One (The Dirge) =================
// A rot-king giant: a vast stitched belly, a hunched back crusted with glowing pustules, a tarnished crown pushed into a
// small head, and a butcher's cleaver the size of a door. Slow, heavy, and every blow lands with a delay you must learn.
// Pattern (learnable):
//  close in front ── Cleaver Chop: the cleaver rises overhead and HANGS there (wait for it…), then crashes down a line.
//                   Gut Sweep: the cleaver is hauled across to its left, then a wide sweep to its right; often followed by a chop.
//  close, any    ── Ground Pound: it lifts a leg high — the stomp sends a ring out around it.
//  mid           ── Bile Vomit: it rears back and the belly heaves — a cone of bile in front, leaving a slowing pool.
//  far           ── Belly Flop: a heavy jump onto where you stand; it lies there afterwards — the best punish of the fight.
//  Phase II (55%) "The Rot Spills": the belly splits and glows; adds Butcher's Frenzy (chop, sweep, chop) and
//                   Pustule Burst (the back erupts and rot rains around you — keep moving), and the flop becomes a double.
var BLO={col:0x9aff6a,rot:0x6ad020,bile:0xb8d040};
function bloBuild(R,e){
  const fl=svMat(R,0x6e6c4c,{roughness:.8,emissive:0x0a0c04}),fl2=svMat(R,0x50563a,{roughness:.9}),bruise=svMat(R,0x4a3448,{roughness:.85}),
    iron=svMat(R,0x4a4440,{roughness:.5,metalness:.55}),rust=svMat(R,0x6a3a20,{roughness:.8,metalness:.3}),gold=svMat(R,0x8a7030,{roughness:.4,metalness:.7}),
    cloth=svMat(R,0x3a3028,{roughness:.95,side:THREE.DoubleSide}),bone=svMat(R,0xd8ccb0,{roughness:.6}),stitch=svMat(R,0x1a1410,{roughness:.9}),
    pus=svGlowMat(R,0x6a9a30),eye=svGlowMat(R,0xd8ff70);R.pus=pus;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('hips','root',0,2.25,0);J('spine','hips',0,.35,0);J('chest','spine',0,.95,-.1);J('belly','spine',0,-.15,.55);
  // ---- body: a barrel chest over an enormous belly, a hunched back ----
  svM(R,'hips',svG('bl_hp',()=>svLoft([[-.55,1.05,.85],[0,1.25,1.0],[.4,1.3,1.05]],11)),fl2);
  svM(R,'hips',svG('bl_bt',()=>svLoft([[.25,1.36,1.12],[.5,1.36,1.12]],12,{cap:false})),iron);
  for(let k=0;k<5;k++){const a=-1.2+k*.6;svM(R,'hips',svG('bl_ch2',()=>new THREE.TorusGeometry(.16,.04,4,8)),rust,Math.sin(a)*1.38,.2-.12*(k%2),Math.cos(a)*1.14,0,a,0)}
  [[.7,.4,.9],[-.8,.2,.85],[.2,-.35,1.05],[-.4,.6,1.0]].forEach(([x,y,z],k)=>svM(R,'belly',svG('bl_br'+k,()=>svLump(.42,0,.25,40+k)),bruise,x,y,z,0,0,0,1,.8,.35));
  svM(R,'hips',svG('bl_lc',()=>svLoft([[-.7,1.32,1.08],[.15,1.3,1.06]],12,{cap:false})),cloth);
  svM(R,'belly',svG('bl_bl',()=>svLump(1.35,1,.12,21)),fl,0,0,0,0,0,0,1.1,1.0,1.0);
  for(let k=0;k<4;k++)svM(R,'belly',svG('bl_st',()=>new THREE.BoxGeometry(.06,.5,.06)),stitch,-.5+k*.32,.15-.1*k,1.33,0,0,.6);
  svM(R,'belly',svG('bl_wd',()=>svLump(.38,0,.2,4)),bruise,.5,.3,1.2,0,0,0,1,.6,.5);
  R.gash=svM(R,'belly',svG('bl_gs',()=>svLump(.55,0,.15,22)),pus,-.1,-.15,1.15,0,0,.4,1.4,.35,.4);R.gash.visible=false;R.gash.userData.noMerge=1;
  svM(R,'chest',svG('bl_ch',()=>svLoft([[-.7,1.25,1.0],[.1,1.45,1.12,0,-.1],[.7,1.35,1.05,0,-.25],[1.05,.95,.8,0,-.35]],11)),fl);
  svM(R,'chest',svG('bl_hm',()=>svLump(1.05,1,.25,24)),fl2,0,.6,-.75,0,0,0,1.3,.9,1);
  // pustules on the back (they glow and burst in Phase II)
  R.pz=[];[[.5,.95,-1.45],[-.45,1.1,-1.4],[0,.45,-1.6],[.85,.35,-1.25],[-.8,.5,-1.3],[.2,1.35,-1.25],[-.25,-.05,-1.5]].forEach(([x,y,z],k)=>{const g=new THREE.Group();g.position.set(x,y,z);R.J.chest.add(g);
    svM(R,g,svG('bl_pz',()=>svLump(.26,0,.2,30+k)),fl2,0,0,0,0,0,0,1,1,.8);const p=svM(R,g,svG('bl_pg',()=>new THREE.SphereGeometry(.17,7,5)),pus,0,0,-.12);R.pz.push(g)});
  // ---- head: small, sunk between the shoulders, a nail-crown ----
  J('neck','chest',0,1.0,.35);J('head','neck',0,.25,.1);
  svM(R,'head',svG('bl_hd',()=>svLump(.48,1,.15,26)),fl,0,.15,0,0,0,0,1,1.05,.95);svM(R,'head',svG('bl_jw',()=>svLoft([[-.25,.42,.36],[.12,.46,.4]],9)),fl2,0,-.18,.05);
  [-1,1].forEach(s=>{svM(R,'head',svG('bl_ey',()=>new THREE.SphereGeometry(.07,6,5)),eye,s*.17,.22,.42)});
  svM(R,'head',svG('bl_cr',()=>svLoft([[0,.42,.42],[.22,.44,.44]],10,{cap:false})),gold,0,.42,0);
  for(let k=0;k<8;k++){const a=k/8*6.283;svM(R,'head',svG('bl_nl',()=>svHorn(.04,.45,0,0,4,2)),rust,Math.sin(a)*.43,.6,Math.cos(a)*.43,-Math.PI/2+.25*Math.cos(a),a,0)}
  // ---- arms: thick, mottled; the right holds the cleaver ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*1.35,.75,0,0,0,s*.15);
    svM(R,'sh'+L,svG('bl_ua',()=>svLoft([[.25,.62,.62],[-.45,.58,.56],[-1.2,.42,.42]],9)),fl);svM(R,'sh'+L,svG('bl_pa',()=>svLump(.6,0,.25,28)),iron,0,.25,0,0,0,0,1.1,.7,1.1);
    J('el'+L,'sh'+L,0,-1.25,0,-.2);svM(R,'el'+L,svG('bl_fa',()=>svLoft([[.1,.42,.42],[-.6,.44,.42],[-1.1,.32,.32]],8)),fl2);
    J('hd'+L,'el'+L,0,-1.15,0);svM(R,'hd'+L,svG('bl_hn',()=>svLump(.36,0,.2,29)),fl,0,-.15,0,0,0,0,1,1.2,.8);
    for(let k=0;k<3;k++)svM(R,'hd'+L,svG('bl_fg',()=>svLoft([[0,.09,.09],[-.32,.07,.07]],5)),fl,(k-1)*.17,-.4,.15)});
  const cv=J('clv','hdR',0,-.3,.05,0,0,0);
  svM(R,cv,svG('bl_hl',()=>svLoft([[.4,.1,.1],[-.9,.11,.11]],6)),rust);
  svM(R,cv,svG('bl_cb2',()=>{const g=svBlade([[0,0],[2.6,-.05],[2.85,-.45],[2.75,-1.5],[.2,-1.35],[0,-.9]],.09);g.rotateZ(-Math.PI/2);g.rotateY(Math.PI/2);return g}),iron,0,-.85,0);
  svM(R,cv,svG('bl_ce',()=>new THREE.BoxGeometry(.04,2.6,.08)),bone,0,-2.25,1.42,0,0,0);
  for(let k=0;k<3;k++)svM(R,cv,svG('bl_rv',()=>new THREE.SphereGeometry(.07,5,4)),gold,0,-1.1-k*.6,.15+.15*k);
  // ---- legs: short trunks ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('th'+L,'hips',s*.72,-.3,0);svM(R,'th'+L,svG('bl_th',()=>svLoft([[.1,.58,.62],[-.6,.5,.52],[-1.05,.38,.4]],9)),fl2);
    J('kn'+L,'th'+L,0,-1.05,0);svM(R,'kn'+L,svG('bl_sh',()=>svLoft([[.05,.38,.4],[-.85,.32,.34]],8)),fl);
    J('ft'+L,'kn'+L,0,-.88,0);svM(R,'ft'+L,svG('bl_ft',()=>svLump(.38,0,.2,31)),fl2,0,-.15,.2,0,0,0,1,.5,1.5);svM(R,'ft'+L,svG('bl_wr',()=>svLoft([[.0,.36,.38],[.25,.36,.38]],8,{cap:false})),cloth,0,.05,0)});
}
function bloLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/1.6);S.gp=(S.gp||0)+dt*(1.6+S.spd*1.4);const g=S.gp;
  const br=Math.sin(t*1.1);O.belly[4]+=.03*br;O.chest[0]+=.02*br;O.hips[4]+=.08*Math.abs(Math.sin(g))*a;O.hips[2]+=.08*Math.sin(g)*a;O.chest[2]+=-.06*Math.sin(g)*a;
  O.head[1]+=.1*Math.sin(t*.5);O.head[0]+=.05*Math.sin(t*.8);
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.45*a,lf=Math.max(0,Math.cos(ph))*.6*a;O['th'+s][0]+=-sw;O['kn'+s][0]+=lf;O['ft'+s][0]+=-lf*.3;
    O['th'+s][2]+=(j?-1:1)*.08});
  O.shL[0]+=.2*Math.sin(g+Math.PI)*a+.04*br;O.shL[2]+=.25;O.elL[0]+=-.35;O.shR[0]+=-.25+.08*Math.sin(g)*a;O.shR[2]+=-.3;O.elR[0]+=-.6;O.clv[0]+=.4}
function bloPost(e,S,dt,now){const R=S.R,on=S.ph>1,k=.6+.4*Math.sin(now/220);R.pus.color.setHex(on?0xb8ff50:0x6a9a30);if(on)R.pus.color.multiplyScalar(k);R.gash.visible=on;
  const hv=S.heave||0;R.J.belly.scale.set(1+.12*hv,1+.18*hv,1+.15*hv);S.heave=Math.max(0,hv-dt*.6);
  if(on&&Math.random()<dt*4){const p=svWP(e,'belly',(Math.random()-.5)*.6,-.3,1.2);burst(p,BLO.rot,1,.4,-.2,.8)}}
var BLOP={
  // cleaver chop (overhead, long hang)
  cUp:{hips:[0,.15,0],spine:[-.15,0,0],chest:[-.2,.2,0],shR:[-2.75,0,-.2],elR:[-.35,0,0],hdR:[-.2,0,0],clv:[.3,0,0],shL:[-.4,0,.5],elL:[-.6,0,0],head:[-.15,0,0],thR:[.2,0,0],thL:[-.25,0,0],knL:[.3,0,0]},
  cDn:{hips:[0,-.1,0,0,-.3,0],spine:[.3,0,0],chest:[.35,-.1,0],shR:[-.7,0,-.1],elR:[0,0,0],hdR:[.2,0,0],clv:[.9,0,0],shL:[.3,0,.6],head:[.3,0,0],thR:[-.35,0,0],knR:[.5,0,0],thL:[.2,0,0]},
  cRec:{spine:[.2,0,0],chest:[.2,0,0],shR:[-.6,0,-.15],hdR:[.1,0,0],clv:[.8,0,0],head:[.1,0,0]},
  // gut sweep (to its right)
  sUp:{hips:[0,.4,0],chest:[0,.5,0],shR:[-1.4,0,.9],elR:[-.7,0,0],clv:[.2,0,.9],shL:[-.5,0,.2],head:[0,-.2,0]},
  sHit:{hips:[0,-.45,0,0,-.1,.2],chest:[.1,-.6,0],shR:[-1.3,0,-1.3],elR:[-.1,0,0],clv:[.3,0,-.4],shL:[-.2,0,.7],head:[0,.3,0]},
  sRec:{hips:[0,-.2,0],chest:[0,-.3,0],shR:[-.9,0,-.8],elR:[-.3,0,0],clv:[.3,0,0]},
  // ground pound (left foot)
  pUp:{hips:[0,0,-.15,0,.25,0],thL:[-1.5,0,.25],knL:[1.4,0,0],ftL:[.2,0,0],thR:[.1,0,0],chest:[-.15,0,.12],shL:[-.4,0,.9],shR:[-.4,0,-.9]},
  pDn:{hips:[0,0,.05,0,-.35,0],thL:[-.15,0,.15],knL:[.4,0,0],thR:[-.3,0,0],knR:[.6,0,0],chest:[.25,0,0],shL:[-.2,0,.6],shR:[-.2,0,-.6]},
  // bile vomit
  vBack:{spine:[-.35,0,0],chest:[-.35,0,0],head:[-.5,0,0],shL:[-.2,0,.9],shR:[-.2,0,-.9],hips:[0,0,0,0,-.05,-.25]},
  vOut:{spine:[.35,0,0],chest:[.4,0,0],head:[.2,0,0],shL:[-.5,0,.6],shR:[-.5,0,-.6],hips:[0,0,0,0,-.1,.2]},
  // belly flop
  fCr:{hips:[0,0,0,0,-.55,0],spine:[.25,0,0],chest:[.2,0,0],thL:[-.9,0,0],thR:[-.9,0,0],knL:[1.5,0,0],knR:[1.5,0,0],ftL:[-.5,0,0],ftR:[-.5,0,0],shL:[.4,0,.4],shR:[.4,0,-.4]},
  fAir:{root:[0,0,0,0,4.2,0],hips:[-.3,0,0],spine:[-.2,0,0],thL:[-.6,0,0],thR:[-.6,0,0],knL:[.8,0,0],knR:[.8,0,0],shL:[-2.4,0,.6],shR:[-2.4,0,-.6],elL:[-.4,0,0],elR:[-.4,0,0],head:[-.4,0,0]},
  fLand:{root:[0,0,0,0,-.8,1.2],hips:[1.35,0,0,0,-.6,0],spine:[.2,0,0],chest:[.1,0,0],thL:[.3,0,0],thR:[.3,0,0],shL:[-2.6,0,.5],shR:[-2.6,0,-.5],head:[-.8,0,0]},
  fUp:{root:[0,0,0,0,-.3,.5],hips:[.6,0,0,0,-.3,0],spine:[.2,0,0],thL:[-.7,0,0],thR:[-.4,0,0],knL:[1.2,0,0],knR:[.8,0,0],shL:[-.6,0,.4],shR:[-.4,0,-.5],head:[-.2,0,0]},
  // roar / phase change
  roar:{spine:[-.3,0,0],chest:[-.35,0,0],head:[-.6,0,0],shL:[-1.6,0,1.2],shR:[-1.6,0,-1.2],elL:[-.4,0,0],elR:[-.4,0,0],thL:[-.2,0,.15],thR:[-.2,0,-.15],knL:[.3,0,0],knR:[.3,0,0]},
  hunch:{hips:[0,0,0,0,-.3,0],spine:[.35,0,0],chest:[.35,0,0],head:[.4,0,0],shL:[.2,0,.3],shR:[.2,0,-.3],elL:[-1.1,0,0],elR:[-1.1,0,0],knL:[.5,0,0],knR:[.5,0,0],thL:[-.4,0,0],thR:[-.4,0,0]},
  // pustule burst
  pzB:{spine:[.25,0,0],chest:[.4,0,0],head:[.5,0,0],shL:[-.2,0,1.2],shR:[-.2,0,-1.2],elL:[-.6,0,0],elR:[-.6,0,0],hips:[0,0,0,0,-.35,0]},
  stag:{hips:[.2,0,.15,0,-.9,0],spine:[.35,0,.1],chest:[.3,0,0],head:[.6,0,.3],thL:[-1.0,0,.2],thR:[-.5,0,-.1],knL:[1.6,0,0],knR:[1.1,0,0],shL:[.5,0,.6],shR:[.2,0,-.5],clv:[1.2,0,0]},
  dead:{root:[0,0,0,0,-.6,1.0],hips:[1.4,0,.2,0,-.7,0],spine:[.2,0,0],head:[-.5,.4,0],shL:[-2.8,0,1.0],shR:[-2.6,0,-1.0],thL:[.2,0,0],thR:[.3,0,0],clv:[1.0,0,0]}};
function bloPool(c,p,r,life){const e=c.e,S2={k:'c',r};let tk=0,t=0;svDecal(p,0x8ac030,r,life,.55);svDecal(p,0x2a3a08,r*.75,life,.5);
  kqFx({tick(dt){t+=dt||0;tk-=dt||0;if(!AF||e.dead)return false;if(Math.random()<.25)burst(gY(p,.2).add(new THREE.Vector3((Math.random()-.5)*r,0,(Math.random()-.5)*r)),BLO.bile,1,.3,.6,.7);
    if(svIn(S2,{x:p.x,z:p.z,a:0},pl.position,0)){dqDebuff('Bile','🤢',{mspd:-.35},600,'Slowed by bile');if(tk<=0&&hero.iv<=0&&hero.hp>0){tk=.6;bossHit(e,.18)}}return t<life}})}
function bloSplat(p,n,r){burst(gY(p,.3),BLO.rot,n||30,r||3,2.5,.7);burst(gY(p,.3),0x4a3a2a,(n||30)/2,(r||3)*.8,2,.6);svShock(p,0x9ab060,(r||3)*1.2,.45);svDecal(p,0x3a4010,(r||3)*.6,3,.5)}
function bloGlob(c,from,q,T){const e=c.e,S2={k:'c',r:2.1},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,BLO.rot,1.3,6,P=>{if(e.dead||!AF)return;bloSplat(P,18,2);svSnd('squelch',.6,1.1);svHitNow(e,S2,an,.85,{col:BLO.rot});if(c.rnd()<.4)bloPool(c,P,1.7,3.5)})}
var BLOM={
  intro:{dur:3.0,trk:[[.5,'hunch','io'],[1.2,'hunch','l',.02],[1.8,'roar','o'],[2.6,'roar','l',.03],[3.0,'cRec','io']],trn:[[0,3,1]],
    ev:[[.3,c=>svSnd('squelch',.8,.6)],[1.75,c=>{svSnd('roar',1.2,.6);shake(.45);svShock(c.m.position,BLO.col,8,.8);c.S.heave=1}]]},
  chop:{wt:10,r:[0,8],a:'f',dur:2.35,lock:1.05,trk:[[.6,'cUp','io'],[1.25,'cUp','l',.025],[1.38,'cDn','s'],[1.95,'cRec','l'],[2.35,'cRec','io']],
    hit:[{t:1.36,s:{k:'l',w:3,l:8.5,b:0},f:.6,dm:1.6,w:.4,fx:(c,an)=>{const p=new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5);bloSplat(p,40,3);shake(.45);svSnd('heavy',1.2,.9)}}],
    tr:[[1.22,1.42,'clv',[0,-3.5,1.35],[0,-1.3,.9],0xd8ffb0,.2]],ev:[[.35,c=>svSnd('hum',.4,.7)],[1.26,c=>svSnd('swing',1,.5)]],nx:[['sweep',.3,8]],rec:.45},
  sweep:{wt:9,r:[0,7.5],a:'f',mel:1,dur:1.7,lock:.7,trk:[[.65,'sUp','io'],[.88,'sUp','l',.02],[1.05,'sHit','s'],[1.35,'sRec','io'],[1.7,'sRec','l']],
    hit:[{t:1.02,s:{k:'a',r:7.2,h:1.35},f:0,dm:1.3,kb:2.5}],tr:[[.9,1.12,'clv',[0,-3.5,1.35],[0,-1.3,.9],0xd8ffb0,.2]],ev:[[.92,c=>svSnd('swing',1.1,.55)]],nx:[['chop',.45,8]],rec:.3},
  stomp:{wt:8,r:[0,6.5],a:'any',dur:1.9,armor:1,trn:[[0,.4,1.5]],trk:[[.75,'pUp','io'],[.98,'pUp','l',.02],[1.1,'pDn','s'],[1.9,'cRec','io']],
    hit:[{t:1.08,s:{k:'c',r:6},dm:1.3,w:.85,kb:3.5,fx:c=>{svShock(c.m.position,0x9ab060,7,.55);bloSplat(c.m.position,40,3.5);shake(.5);svSnd('heavy',1.2,.7)}}],ev:[[.4,c=>svSnd('hum',.4,.5)]],rec:.4},
  vomit:{wt:7,r:[0,10],a:'f',dur:2.5,lock:.85,armor:1,trn:[[0,.85,2]],trk:[[.75,'vBack','io'],[1.05,'vBack','l',.02],[1.2,'vOut','s'],[1.9,'vOut','l'],[2.5,'cRec','io']],
    hit:[{t:1.2,s:{k:'a',r:9.5,h:.55},f:.5,dm:1.0,w:.7,on:()=>dqDebuff('Bile','🤢',{mspd:-.35},2500,'Slowed by bile'),fx:(c,an)=>{const m=svWP(c.e,'head',0,-.2,.5);
      for(let k=0;k<40;k++){const d=1+Math.random()*8,a=an.a+(Math.random()-.5)*1;burst(new THREE.Vector3(an.x+Math.sin(a)*d,GH(an.x,an.z)+.5+Math.random()*1.2,an.z+Math.cos(a)*d),BLO.bile,2,1,.6,.8)}
      burst(m,BLO.bile,30,3,.5,.7);bloPool(c,new THREE.Vector3(an.x+Math.sin(an.a)*5.5,0,an.z+Math.cos(an.a)*5.5),2.8,5);svSnd('squelch',1.2,.6)}}],
    ev:[[.4,c=>{svSnd('squelch',.8,.5);c.S.heave=1.4}]],rec:.45},
  flop:{wt:8,r:[5,22],a:'fs',dur:3.2,lock:.85,armor:1,trn:[[0,.85,3]],trk:[[.75,'fCr','io'],[.9,'fCr','l',.02],[1.25,'fAir','o'],[1.6,'fLand','i'],[2.6,'fLand','l'],[3.0,'fUp','io'],[3.2,'cRec','io']],
    rm:[[.92,1.6,'tgt','l',.6,24]],hit:[{t:1.6,s:{k:'c',r:4.8},o:'tgt',dm:1.7,w:.8,kb:3,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0x9ab060,7,.6);bloSplat(p,70,4.5);shake(.6);svSnd('heavy',1.4,.6);svSnd('squelch',1,.5)}}],
    ev:[[.9,c=>svSnd('whoosh',1,.5)]],nx:[['flop2',.0]],rec:.3},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'hunch','io'],[1.25,'hunch','l',.035],[1.7,'roar','o'],[2.9,'roar','l',.03],[3.4,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,BLO.col,10,.8);bloSplat(c.m.position,90,6)}}],
    ev:[[.05,c=>{banner('THE ROT SPILLS','The Bloated One bursts open','');svSnd('squelch',1,.4)}],[1.25,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.heave=2;flash('rgba(160,255,90,.3)');svSnd('roar',1.3,.55);shake(.6)}]]},
  frenzy:{wt:9,ph:2,r:[0,8],a:'f',dur:3.6,lock:.6,armor:1,trn:[[0,.6,3],[1.2,1.5,3],[2.2,2.55,3]],
    trk:[[.55,'cUp','io'],[.72,'cUp','l',.02],[.85,'cDn','s'],[1.3,'sUp','io'],[1.62,'sHit','s'],[2.1,'cUp','io'],[2.55,'cUp','l',.03],[2.68,'cDn','s'],[3.2,'cRec','l'],[3.6,'cRec','io']],
    hit:[{t:.83,s:{k:'l',w:3,l:8.5},f:.6,dm:1.3,w:.35,fx:(c,an)=>{bloSplat(new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5),30,2.5);shake(.35);svSnd('heavy',1,1)}},
      {t:1.6,s:{k:'a',r:7.2,h:1.35},dm:1.2,mel:1,kb:2.5},{t:2.66,s:{k:'l',w:3.4,l:9},f:.6,dm:1.7,w:.4,fx:(c,an)=>{bloSplat(new THREE.Vector3(an.x+Math.sin(an.a)*5,0,an.z+Math.cos(an.a)*5),60,3.5);shake(.55);svSnd('heavy',1.3,.8)}}],
    tr:[[.72,.9,'clv',[0,-3.5,1.35],[0,-1.3,.9],0xd8ffb0,.2],[1.45,1.68,'clv',[0,-3.5,1.35],[0,-1.3,.9],0xd8ffb0,.2],[2.56,2.74,'clv',[0,-3.5,1.35],[0,-1.3,.9],0xd8ffb0,.2]],
    ev:[[.75,c=>svSnd('swing',1,.6)],[1.5,c=>svSnd('swing',1,.5)],[2.58,c=>svSnd('swing',1.1,.45)]],rec:.6},
  burst:{wt:7,ph:2,r:[0,40],a:'any',dur:3.0,armor:1,trn:[[0,3,1.5]],trk:[[.6,'hunch','io'],[1.1,'hunch','l',.03],[1.3,'pzB','s'],[2.4,'pzB','l'],[3.0,'cRec','io']],
    ev:[[.3,c=>{svSnd('squelch',.9,.5);c.S.heave=1}],[1.3,c=>{svSnd('squelch',1.2,.8);shake(.3);c.R.pz.forEach(g=>{const p=new THREE.Vector3();g.getWorldPosition(p);burst(p,BLO.rot,20,3,4,.7)})}]].concat(
      [0,1,2,3,4,5,6,7].map(i=>[1.35+i*.13,c=>{const from=new THREE.Vector3();c.R.pz[i%c.R.pz.length].getWorldPosition(from);const a=c.rnd()*6.283,r=i<2?0:1.5+c.rnd()*4.5,d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0};
        const q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*r+d.x*i*.4,0,Math.sin(a)*r+d.z*i*.4)),.8);bloGlob(c,from,q,1.0+i*.05)}])),rec:.5},
  flop2:{ph:2,dur:3.0,lock:.6,armor:1,trn:[[0,.6,3]],trk:[[.45,'fUp','io'],[.6,'fCr','io'],[1.0,'fAir','o'],[1.35,'fLand','i'],[2.4,'fLand','l'],[2.8,'fUp','io'],[3.0,'cRec','io']],
    rm:[[.65,1.35,'tgt','l',.6,24]],hit:[{t:1.35,s:{k:'c',r:5.2},o:'tgt',dm:1.8,w:.7,kb:3,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0x9ab060,8,.6);bloSplat(p,80,5);shake(.65);svSnd('heavy',1.5,.55);bloPool(c,p,3,5)}}],
    ev:[[.65,c=>svSnd('whoosh',1,.45)]],rec:.4}};
BLOM.flop.nx=[['flop2',.55,26]];
svReg(4,{name:'Bloated One',col:BLO.col,body:2.4,ph2:.55,poise:.19,headJ:'head',turnA:2.6,
  ai:{pref:5,walk:1.7,run:2.6,turn:1.5,rest:[.95,1.6],ph2r:.72,strafe:.3},
  build:bloBuild,loco:bloLoco,post:bloPost,P:BLOP,M:BLOM,
  stag:[[.3,'stag','o'],[2.2,'stag','l',.03],[2.8,'cRec','io']],stagT:2.8,
  die:[[.5,'stag','o'],[1.4,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dqA!=null?A.dqA:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  dying(e,t){if(t>1.3&&t<1.35){bloSplat(e.m.position,80,4);shake(.4)}}});
