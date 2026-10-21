// ================= v110 Sovereign 5 — Lord Vaelric, the Crimson King (The Citadel) =================
// The last Sovereign: a tall vampire lord in black-and-crimson plate, a high collar, a thorned crown, a long cape, and a
// slender blood-forged greatsword. Fast, precise, and every pattern has a rhythm. In Phase II great bat wings tear free.
// Pattern (learnable):
//  close in front ── Crimson Combo: a slash, a backhand, a pause… and a thrust (dodge the third late).
//  mid           ── Crimson Lunge: he draws the blade back level with his eyes, then lunges a long line.
//  far           ── Blood Wave: an overhead cut that sends a crescent of blood travelling down a line.
//  any           ── Bat Step: he bursts into bats and re-forms at your side for a rising slash (listen for the bell).
//  close, any    ── Sanguine Nova: he plants the sword and kneels; a blood circle bursts around him.
//  Phase II (55%) "The Blood Moon": wings, a crimson aura; adds Skyfall (he rises, blood spears rain on your trail, then he
//                   plunges onto you), Triple Wave (three crescents fanning out) and a five-hit combo.
var VLR={col:0xff2040,blood:0xd01030,gold:0xd8b060};
function vlrBuild(R,e){
  const plate=svMat(R,0x1c1418,{roughness:.35,metalness:.65,emissive:0x0a0204}),plate2=svMat(R,0x4a0c18,{roughness:.4,metalness:.55,emissive:0x140206}),gold=svMat(R,0xb08a3a,{roughness:.35,metalness:.8}),
    skin=svMat(R,0xd8d0d8,{roughness:.6,emissive:0x141014}),cape=svMat(R,0x5a0816,{roughness:.8,side:THREE.DoubleSide,emissive:0x100206}),capeIn=svMat(R,0x1a0a10,{roughness:.9,side:THREE.DoubleSide}),
    steel=svMat(R,0x8a1424,{roughness:.2,metalness:.7,emissive:0x5a0614}),hair=svMat(R,0xe8e4ec,{roughness:.7}),mem=svMat(R,0x2a0810,{roughness:.7,side:THREE.DoubleSide,emissive:0x0a0004}),
    eye=svGlowMat(R,0xff3050),rune=svGlowMat(R,0x8a1020);R.rune=rune;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('hips','root',0,1.8,0);J('spine','hips',0,.25,0);J('chest','spine',0,.6,0);
  // ---- armoured body: tasset skirt, a narrow waist, a broad plated chest ----
  svM(R,'hips',svG('vl_hp',()=>svLoft([[-.15,.36,.26],[.25,.34,.24]],9)),plate);
  for(let k=0;k<7;k++){const a=-1.4+k*.47;svM(R,'hips',svG('vl_ts',()=>svBlade([[-.16,0],[.16,0],[.13,-.62],[0,-.72],[-.13,-.62]],.03)),k%2?plate:plate2,Math.sin(a)*.38,0,Math.cos(a)*.3,-.12*Math.cos(a),a,0)}
  svM(R,'spine',svG('vl_wa',()=>svLoft([[-.05,.3,.22],[.35,.32,.23],[.6,.42,.28]],9)),plate2);
  svM(R,'chest',svG('vl_ch',()=>svLoft([[-.1,.42,.28],[.25,.52,.33,0,.02],[.5,.55,.34],[.68,.42,.27]],10)),plate);
  svM(R,'chest',svG('vl_bp',()=>svLump(.3,0,.2,51)),plate2,0,.3,.24,0,0,0,1.2,1.1,.45);
  svM(R,'chest',svG('vl_rn',()=>new THREE.OctahedronGeometry(.08,0)),rune,0,.33,.38,0,0,0,1,1.6,1);
  // the high collar
  for(let k=0;k<6;k++){const a=-2.0+k*.8;svM(R,'chest',svG('vl_cl',()=>svBlade([[-.12,0],[.12,0],[.08,.5],[0,.62],[-.08,.45]],.03)),plate2,Math.sin(a)*.3,.66,Math.cos(a)*.22-.05,-.25*Math.cos(a),a,0)}
  // ---- head: pale, long white hair, thorned crown ----
  J('neck','chest',0,.7,.02);J('head','neck',0,.17,0);
  svM(R,'neck',svG('vl_nk',()=>svLoft([[0,.09,.09],[.2,.08,.08]],6)),skin);
  svM(R,'head',svG('vl_hd',()=>svLoft([[-.08,.12,.13],[.05,.16,.17,0,.01],[.2,.16,.17],[.32,.12,.13]],8)),skin,0,0,0);
  svM(R,'head',svG('vl_hr',()=>svLoft([[-.25,.12,.1,0,-.12],[.05,.19,.18,0,-.05],[.3,.18,.18]],8)),hair,0,0,-.02);
  [-1,1].forEach(s=>{svM(R,'head',svG('vl_ey',()=>new THREE.SphereGeometry(.025,5,4)),eye,s*.06,.15,.15);svSpr(R,'head',VLR.col,.2,s*.06,.15,.17)});
  svM(R,'head',svG('vl_cr',()=>svLoft([[0,.18,.18],[.07,.19,.19]],9,{cap:false})),gold,0,.3,0);
  for(let k=0;k<7;k++){const a=k/7*6.283;svM(R,'head',svG('vl_th',()=>svHorn(.025,.22,0,-.05,4,2)),gold,Math.sin(a)*.18,.34,Math.cos(a)*.18,-Math.PI/2+.3*Math.cos(a),a,0)}
  // ---- arms: plate pauldrons, gauntlets ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*.55,.5,0,0,0,s*.1);
    svM(R,'sh'+L,svG('vl_pd',()=>svLump(.24,1,.15,52)),plate2,s*.05,.08,0,0,0,0,1.25,.85,1.1);
    for(let k=0;k<3;k++)svM(R,'sh'+L,svG('vl_ps',()=>svHorn(.05,.32,0,-.1,4,2)),gold,s*.12,.22,-.12+k*.12,-1.3,0,s*-.4);
    svM(R,'sh'+L,svG('vl_ua',()=>svLoft([[0,.1,.1],[-.6,.085,.085]],7)),plate);
    J('el'+L,'sh'+L,0,-.6,0,-.15);svM(R,'el'+L,svG('vl_fa',()=>svLoft([[0,.09,.09],[-.5,.11,.1],[-.58,.08,.08]],7)),plate2);
    J('hd'+L,'el'+L,0,-.58,0);svM(R,'hd'+L,svG('vl_hn',()=>svLump(.08,0,.2,53)),plate,0,-.06,0,0,0,0,1,1.4,.8)});
  // the sword (right hand): a long, slightly curved blood-steel blade, gold guard
  const sw=J('swd','hdR',0,-.1,.02,0,0,0);
  svM(R,sw,svG('vl_gp',()=>svLoft([[-.32,.04,.04],[.02,.04,.04]],6)),plate,0,0,0,Math.PI/2,0,0);svM(R,sw,svG('vl_pm',()=>new THREE.OctahedronGeometry(.07,0)),gold,0,0,-.34);
  svM(R,sw,svG('vl_gd',()=>svBlade([[-.3,0],[.3,0],[.36,.08],[0,.14],[-.36,.08]],.05)),gold,0,.02,0,Math.PI/2,0,0);
  svM(R,sw,svG('vl_bl',()=>svBlade([[-.07,0],[.07,0],[.06,1.6],[.02,2.25],[-.04,2.3],[-.06,1.6]],.025)),steel,0,.06,0,Math.PI/2,0,0);
  // ---- legs: plated, long ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('th'+L,'hips',s*.18,-.1,0);svM(R,'th'+L,svG('vl_th',()=>svLoft([[0,.15,.16],[-.82,.11,.12]],7)),plate);
    J('kn'+L,'th'+L,0,-.84,0);svM(R,'kn'+L,svG('vl_kp',()=>svLump(.1,0,.2,54)),plate2,0,0,.08);svM(R,'kn'+L,svG('vl_sh',()=>svLoft([[0,.1,.11],[-.8,.09,.1]],7)),plate2);
    J('ft'+L,'kn'+L,0,-.82,0);svM(R,'ft'+L,svG('vl_ft',()=>svLoft([[-.1,.09,.06,0,-.02],[.26,.06,.04,0,-.05]],6)),plate,0,-.05,.05,Math.PI/2,0,0)});
  // ---- cape (three joints, sways) ----
  J('cp0','chest',0,.62,-.24);J('cp1','cp0',0,-.85,0);J('cp2','cp1',0,-.85,0);
  [['cp0',.55,.62],['cp1',.62,.72],['cp2',.72,.8]].forEach(([n,w0,w1])=>{svM(R,n,svG('vl_'+n,()=>svBlade([[-w0,0],[w0,0],[w1,-.88],[-w1,-.88]],.02)),cape,0,0,-.02);svM(R,n,svG('vl_'+n+'i',()=>svBlade([[-w0+.02,0],[w0-.02,0],[w1-.02,-.88],[-w1+.02,-.88]],.01)),capeIn,0,0,.02)});
  // ---- bat wings (Phase II) ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';const w=J('wg'+L,'chest',s*.2,.45,-.3,0,s*-.3,0);
    svM(R,w,svG('vl_wb',()=>svHorn(.05,2.2,0,.5,4,5)),plate,0,0,0,0,s*Math.PI/2,0);
    svM(R,w,svG('vl_wm'+L,()=>{const pts=[[0,0,0],[s*2.2,.55,0],[s*2.0,-.4,0],[s*1.5,-1.2,0],[s*.9,-.9,0],[s*.5,-1.5,0],[0,-.5,0]],pos=[];for(let k=1;k<pts.length-1;k++)pos.push(...pts[0],...pts[k],...pts[k+1]);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}),mem);
    w.scale.setScalar(.01);R['wing'+L]=w});
}
function vlrWings(R,k){['L','R'].forEach(s=>{const w=R['wing'+s];w.scale.setScalar(Math.max(.01,k));w.visible=k>.02})}
function vlrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.2);S.gp=(S.gp||0)+dt*(2+S.spd*2.3);const g=S.gp;
  O.hips[4]+=.03*Math.sin(t*1.4)+.05*Math.abs(Math.sin(g))*a;O.chest[0]+=.015*Math.sin(t*1.4);O.head[1]+=.08*Math.sin(t*.5);
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.6*a,lf=Math.max(0,Math.cos(ph))*.8*a;O['th'+s][0]+=-sw;O['kn'+s][0]+=lf;O['ft'+s][0]+=-lf*.2});
  // guard stance: sword held low and forward, left hand open
  O.shR[0]+=-.45+.04*Math.sin(t*1.2);O.shR[2]+=-.15;O.elR[0]+=-.75;O.hdR[0]+=.25;O.shL[0]+=.15*Math.sin(g)*a+.1;O.shL[2]+=.18;O.elL[0]+=-.3;
  O.cp0[0]+=.15+.06*Math.sin(t*1.6)+.4*a;O.cp1[0]+=.05+.05*Math.sin(t*1.6-.8)+.15*a;O.cp2[0]+=.04*Math.sin(t*1.6-1.6)+.1*a;
  if(S.ph>1){O.wgL[1]+=.12*Math.sin(t*1.8);O.wgR[1]-=.12*Math.sin(t*1.8);O.wgL[2]+=.06*Math.sin(t*1.8);O.wgR[2]-=.06*Math.sin(t*1.8)}}
function vlrPost(e,S,dt,now){const R=S.R,on=S.ph>1;S.wk=Math.min(1,(S.wk||0)+(on?dt*1.2:-dt*3));vlrWings(R,on?svEase.o(Math.max(0,S.wk)):0);
  R.rune.color.setHex(on?0xff3050:0x8a1020);e.m.visible=!S.gone&&e.m.visible;
  if(on&&Math.random()<dt*10){const p=svWP(e,'chest',(Math.random()-.5)*.8,(Math.random()-.5)*1.2,0);burst(p,VLR.blood,1,.4,.6,.7)}}
var VLRP={
  // crimson combo: slash (right to left), backhand (left to right), thrust
  s1Up:{hips:[0,-.35,0],chest:[0,-.45,0],shR:[-1.2,0,-1.25],elR:[-.6,0,0],hdR:[1.25,0,0],shL:[-.4,0,.4],head:[0,.3,0],thL:[-.4,0,0],knL:[.4,0,0]},
  s1Hit:{hips:[0,.45,0,0,-.05,.25],chest:[.1,.55,0],shR:[-1.45,0,.55],elR:[-.1,0,0],hdR:[1.3,0,0],shL:[-.2,0,.8],head:[0,-.3,0],thL:[-.6,0,0],knL:[.5,0,0],thR:[.3,0,0]},
  s2Hit:{hips:[0,-.5,0,0,-.05,.3],chest:[.1,-.6,0],shR:[-1.0,0,-1.45],elR:[-.2,0,0],hdR:[1.3,0,0],shL:[-.4,0,.3],head:[0,.35,0],thR:[-.6,0,0],knR:[.5,0,0],thL:[.3,0,0]},
  thUp:{hips:[0,.4,0,0,0,-.25],chest:[0,.55,0],shR:[-.35,0,-.25],elR:[-1.9,0,0],hdR:[.5,0,0],shL:[-1.3,0,.6],elL:[-.3,0,0],head:[0,-.4,0],thR:[.3,0,0],thL:[-.4,0,0],knL:[.5,0,0]},
  thHit:{hips:[.1,-.15,0,0,-.15,.55],chest:[.15,-.2,0],shR:[-1.55,0,-.05],elR:[0,0,0],hdR:[0,0,0],shL:[.3,0,.4],head:[0,.1,0],thL:[-1.0,0,0],knL:[.7,0,0],thR:[.55,0,0],knR:[.1,0,0]},
  cRec:{hips:[0,0,0],shR:[-.8,0,-.2],elR:[-.6,0,0],hdR:[.2,0,0]},
  // lunge: sword drawn back level with the eyes
  lDraw:{hips:[0,.6,0,0,-.15,-.2],chest:[0,.5,0],shR:[-1.5,0,-.6],elR:[-1.8,0,0],hdR:[.9,0,0],shL:[-1.4,0,.1],elL:[-.2,0,0],head:[0,-.5,0],thL:[-.8,0,0],knL:[1.0,0,0],thR:[.4,0,0],knR:[.6,0,0]},
  lGo:{hips:[.2,-.1,0,0,-.35,.3],chest:[.15,-.15,0],shR:[-1.6,0,0],elR:[0,0,0],hdR:[0,0,0],shL:[.5,0,.5],head:[-.1,.1,0],thL:[-1.2,0,0],knL:[.6,0,0],thR:[.8,0,0],knR:[.3,0,0],cp0:[.9,0,0],cp1:[.3,0,0]},
  // blood wave: overhead cut
  wUp:{chest:[-.2,0,0],shR:[-2.9,0,-.15],elR:[-.4,0,0],hdR:[-.4,0,0],shL:[-2.7,0,.2],elL:[-.5,0,0],head:[-.2,0,0],thR:[.2,0,0],thL:[-.3,0,0]},
  wDn:{hips:[.1,0,0,0,-.2,.2],chest:[.4,0,0],shR:[-1.0,0,-.1],elR:[0,0,0],hdR:[.3,0,0],shL:[-.9,0,.2],head:[.25,0,0],thL:[-.6,0,0],knL:[.6,0,0],thR:[.3,0,0]},
  // rising slash (after the bat step)
  rLow:{hips:[0,.3,0,0,-.35,0],chest:[.3,.3,0],shR:[.4,0,-.4],elR:[-.3,0,0],hdR:[.4,0,0],shL:[-.3,0,.4],thL:[-.8,0,0],knL:[1.3,0,0],thR:[-.2,0,0],knR:[.9,0,0],head:[.1,-.2,0]},
  rHigh:{hips:[0,-.3,0,0,.1,0],chest:[-.25,-.4,0],shR:[-2.6,0,-.4],elR:[0,0,0],hdR:[-.2,0,0],shL:[-.3,0,.6],head:[-.3,.2,0],thR:[.2,0,0]},
  // sanguine nova: plant and kneel
  kneel:{hips:[0,0,0,0,-.85,0],spine:[.2,0,0],chest:[.15,0,0],shR:[-.9,0,-.05],elR:[-.3,0,0],hdR:[1.5,0,0],shL:[-.9,0,.05],elL:[-.3,0,0],thL:[-1.6,0,0],knL:[1.6,0,0],thR:[.3,0,0],knR:[1.9,0,0],ftR:[-.3,0,0],head:[.3,0,0]},
  rise:{hips:[0,0,0,0,.05,0],chest:[-.35,0,0],shR:[-1.8,0,-1.0],elR:[0,0,0],shL:[-1.8,0,1.0],head:[-.5,0,0],cp0:[.4,0,0]},
  // skyfall
  sUp:{root:[0,0,0,0,7,0],hips:[-.2,0,0],shR:[-1.8,0,-.4],elR:[-.2,0,0],shL:[-1.4,0,.8],thL:[-.4,0,0],knL:[.8,0,0],thR:[.1,0,0],knR:[.5,0,0],cp0:[.6,0,0]},
  sDive:{root:[0,0,0,0,0,0],hips:[.4,0,0,0,-.4,0],chest:[.4,0,0],shR:[-.5,0,-.05],elR:[0,0,0],hdR:[1.4,0,0],shL:[-.6,0,.4],thL:[-1.4,0,0],knL:[1.5,0,0],thR:[.2,0,0],knR:[1.6,0,0]},
  roar:{chest:[-.35,0,0],head:[-.55,0,0],shR:[-1.6,0,-1.1],elR:[-.2,0,0],shL:[-1.6,0,1.1],elL:[-.2,0,0],cp0:[.7,0,0],cp1:[.3,0,0]},
  bow:{hips:[0,0,0,0,-.05,0],chest:[.35,0,0],head:[.4,0,0],shR:[-.4,0,-.5],elR:[-.5,0,0],shL:[.3,0,.3],elL:[-1.3,0,0]},
  stag:{hips:[.1,0,.1,0,-.55,0],spine:[.3,0,.1],chest:[.3,0,0],head:[.5,0,.3],shR:[.3,0,-.3],elR:[-.2,0,0],hdR:[1.2,0,0],shL:[.1,0,.4],thL:[-1.3,0,0],knL:[1.6,0,0],thR:[-.2,0,0],knR:[1.2,0,0]},
  dead:{root:[0,0,0,0,-1.5,0],hips:[-.3,0,0,0,0,0],spine:[-.2,0,0],chest:[-.4,0,0],head:[-.4,.4,0],shR:[-.4,0,-1.2],shL:[-.3,0,1.3],thL:[-1.5,0,0],knL:[1.8,0,0],thR:[-1.4,0,0],knR:[1.9,0,0]}};
function vlrWave(c,a0,spd,L,dm){const e=c.e,o=c.m.position.clone(),a=c.m.rotation.y+a0,S2={k:'c',r:1.6};const g=svG('vl_cres',()=>{const q=new THREE.RingGeometry(1.0,1.6,14,1,-1.1+Math.PI/2,2.2);q.rotateX(-Math.PI/2);return q});
  const m=new THREE.MeshBasicMaterial({color:VLR.col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,m);ms.renderOrder=24;ms.userData.lpsSkip=1;scene.add(ms);
  let t=0,hit=false;const T=L/spd;svSnd('blood',.9,1.2);
  kqFx({tick(dt){t+=dt||0;const d=1+spd*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+1.0,p.z);ms.rotation.y=a+Math.PI;ms.scale.set(1.3,1,1);
    if(Math.random()<.9)burst(gY(p,1),VLR.blood,3,1,.8,.5);if(!hit&&AF&&!e.dead&&svIn({k:'l',w:3.4,l:1.6,b:.8},{x:p.x,z:p.z,a},pl.position,.3)){hit=true;svHitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a},dm,{flash:false})}
    return t<T&&!e.dead},end(){scene.remove(ms);m.dispose()}})}
function vlrSpear(c,q,T){const e=c.e,S2={k:'c',r:1.5},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const m=new THREE.Mesh(svG('vl_sp',()=>{const g=new THREE.ConeGeometry(.16,2.6,5);g.rotateX(Math.PI/2);return g}),kqBas(VLR.blood));
  svShot(new THREE.Vector3(q.x+(c.rnd()-.5)*3,GH(q.x,q.z)+14,q.z+(c.rnd()-.5)*3),new THREE.Vector3(q.x,GH(q.x,q.z)+.4,q.z),T,VLR.col,1.1,0,P=>{if(e.dead||!AF)return;burst(P,VLR.blood,20,2.2,2.5,.5);svDecal(P,0x4a0008,1.4,3,.6);svSnd('crack',.6,1.4);svHitNow(e,S2,an,.85,{col:VLR.col})},m)}
function vlrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;const p=e.m.position;for(let k=0;k<24;k++)burst(gY(p,1+Math.random()*2.2),0x1a0408,2,2.5,1.5,.9);burst(gY(p,1.8),VLR.blood,30,2,2,.6);svSnd('whoosh',.8,1.4)}
var VLRM={
  intro:{dur:3.0,trk:[[.5,'bow','io'],[1.3,'bow','l',.005],[1.9,'rise','o'],[2.6,'rise','l'],[3.0,'cRec','io']],trn:[[0,3,1]],
    ev:[[.4,c=>svSnd('bell',.7,.8)],[1.85,c=>{svSnd('blood',1,.6);svSnd('shriek',.5,1.4);shake(.3);svShock(c.m.position,VLR.col,8,.7);flash('rgba(200,20,40,.25)')}]]},
  combo:{wt:10,r:[0,6.2],a:'f',mel:1,dur:2.35,lock:.38,trn:[[0,.38,5],[.75,.85,5],[1.2,1.5,4]],
    trk:[[.38,'s1Up','io'],[.5,'s1Up','l',.01],[.62,'s1Hit','s'],[.82,'s1Hit','l'],[.98,'s2Hit','s'],[1.3,'thUp','io'],[1.55,'thUp','l',.012],[1.68,'thHit','s'],[2.0,'cRec','io'],[2.35,'cRec','l']],
    rm:[[.55,.66,1,'o'],[.9,1.0,.8,'o'],[1.6,1.72,2.5,'o']],
    hit:[{t:.61,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:.97,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:1.68,s:{k:'l',w:1.6,l:6.5,b:0},f:.4,dm:1.3,w:.38}],
    tr:[[.52,.7,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[1.58,1.75,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.55,c=>svSnd('swing',.8,1.3)],[.9,c=>svSnd('swing',.8,1.4)],[1.62,c=>svSnd('whoosh',.8,1.6)]],nx:[['lunge',.25,9]],rec:.25},
  lunge:{wt:8,r:[4.5,15],a:'f',dur:1.9,lock:.7,armor:1,trn:[[0,.7,5]],trk:[[.55,'lDraw','io'],[.8,'lDraw','l',.012],[.95,'lGo','s'],[1.3,'lGo','l'],[1.9,'cRec','io']],
    rm:[[.86,1.1,'tgt','o',-1.5,14]],hit:[{t:1.0,s:{k:'l',w:2.2,l:15,b:0},f:0,dm:1.4,w:.6}],tr:[[.86,1.15,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],
    ev:[[.3,c=>svSnd('hum',.4,1.6)],[.86,c=>{svSnd('whoosh',1.1,1.1);burst(gY(c.m.position,1),VLR.blood,30,3,1,.6)}]],rec:.4},
  wave:{wt:8,r:[6.5,40],a:'f',dur:1.9,lock:.75,trn:[[0,.75,4]],trk:[[.6,'wUp','io'],[.85,'wUp','l',.015],[.98,'wDn','s'],[1.4,'wDn','l'],[1.9,'cRec','io']],
    hit:[{t:.96,s:{k:'l',w:3.4,l:22,b:0},f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,0,16,22,1.2)}],tr:[[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.88,c=>svSnd('swing',1,1)]],rec:.35},
  batstep:{wt:7,r:[0,40],a:'any',dur:2.6,armor:1,inv:[.35,1.35],trn:[[0,.1,1]],trk:[[.3,'bow','io'],[1.35,'rLow','io'],[1.65,'rLow','l',.012],[1.8,'rHigh','s'],[2.2,'cRec','io'],[2.6,'cRec','l']],
    ev:[[.32,c=>vlrGone(c.e,true)],[1.3,c=>{const e=c.e,m=e.m,a=svYawTo(m,pl.position)+(c.rnd()<.5?1.4:-1.4),q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.sin(a)*3.2,0,Math.cos(a)*3.2)),2);
      m.position.set(q.x,0,q.z);m.rotation.y=svYawTo(m,pl.position);vlrGone(e,false);svSnd('bell',.9,1.3)}]],
    hit:[{t:1.78,s:{k:'a',r:5.2,h:.9},f:0,dm:1.3,w:.45}],tr:[[1.68,1.88,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],end(c){if(c.S.gone)vlrGone(c.e,false)},rec:.35},
  nova:{wt:6,r:[0,6],a:'any',dur:2.2,armor:1,trn:[[0,.4,2]],trk:[[.5,'kneel','io'],[1.25,'kneel','l',.01],[1.4,'rise','s'],[2.2,'cRec','io']],
    hit:[{t:1.38,s:{k:'c',r:7},dm:1.5,w:1.2,kb:3,fx:c=>{svShock(c.m.position,VLR.col,8,.5);burst(gY(c.m.position,1),VLR.blood,70,6,4,.8);svDecal(c.m.position,0x3a0008,6,4,.55);shake(.4);svSnd('blood',1.2,.7)}}],
    ev:[[.25,c=>{svSnd('charge',.6,.7);svDecal(c.m.position,0x8a0018,7,1.4,.35)}]],rec:.4},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'bow','io'],[1.2,'bow','l',.02],[1.7,'roar','o'],[2.9,'roar','l',.02],[3.4,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,VLR.col,10,.8);burst(gY(c.m.position,2),VLR.blood,90,6,4,1)}}],
    ev:[[.05,c=>{banner('THE BLOOD MOON','Vaelric casts off his mortal shape','');svSnd('bell',.9,.6)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(220,20,50,.4)');svSnd('shriek',1,.8);svSnd('roar',.8,1.3);shake(.5)}]]},
  skyfall:{wt:8,ph:2,r:[0,40],a:'any',dur:4.2,armor:1,inv:[.7,3.1],trn:[[0,4.2,2.5]],trk:[[.45,'kneel','io'],[1.0,'sUp','o'],[2.95,'sUp','l'],[3.25,'sDive','i'],[3.8,'sDive','l'],[4.2,'cRec','io']],
    ev:[[.5,c=>svSnd('whoosh',1.2,.6)],[.9,c=>{c.S.ghost=1}]].concat([0,1,2,3,4,5].map(i=>[1.15+i*.28,c=>{const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0},q=c.inA(pl.position.clone().add(new THREE.Vector3(d.x*2.2,0,d.z*2.2)),.8);vlrSpear(c,q,.62)}])),
    rm:[[2.85,3.25,'tgt','i',0,40]],hit:[{t:3.25,s:{k:'c',r:4.6},o:'tgt',dm:1.7,w:.75,kb:3.5,fx:(c,an)=>{c.S.ghost=0;const p=new THREE.Vector3(an.x,0,an.z);svShock(p,VLR.col,7,.6);burst(gY(p,.5),VLR.blood,80,5,4,.8);svDecal(p,0x3a0008,4,4,.6);shake(.55);svSnd('heavy',1.2,1.1)}}],
    end(c){c.S.ghost=0},rec:.5},
  waves:{wt:7,ph:2,r:[5,40],a:'f',dur:2.3,lock:.8,trn:[[0,.8,4]],trk:[[.6,'wUp','io'],[.88,'wUp','l',.015],[1.0,'wDn','s'],[1.5,'wDn','l'],[2.3,'cRec','io']],
    hit:[{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:-.45,f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,-.45,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},f:1,nohit:1,w:.75,fx:c=>vlrWave(c,0,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:.45,f:1,nohit:1,w:.75,fx:c=>vlrWave(c,.45,15,20,1.1)}],
    tr:[[.9,1.06,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.9,c=>svSnd('swing',1,.8)]],rec:.4},
  combo5:{wt:9,ph:2,r:[0,6.5],a:'f',mel:1,dur:3.1,lock:.3,trn:[[0,.3,5],[.6,.7,5],[1.0,1.1,5],[1.4,1.5,5],[2.0,2.25,4]],
    trk:[[.3,'s1Up','io'],[.45,'s1Hit','s'],[.62,'s1Hit','l'],[.78,'s2Hit','s'],[.95,'s1Up','io'],[1.12,'s1Hit','s'],[1.3,'s1Up','io'],[1.48,'s2Hit','s'],[1.9,'thUp','io'],[2.2,'thUp','l',.012],[2.33,'thHit','s'],[2.7,'cRec','io'],[3.1,'cRec','l']],
    rm:[[.4,.5,.8,'o'],[.72,.82,.6,'o'],[1.05,1.15,.6,'o'],[1.42,1.52,.6,'o'],[2.25,2.38,2.6,'o']],
    hit:[{t:.44,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:.77,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.11,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.47,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:2.33,s:{k:'l',w:1.8,l:7,b:0},f:.4,dm:1.4,w:.4}],
    tr:[[.38,.52,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[.7,.84,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.04,1.18,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.4,1.55,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[2.22,2.4,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.38,c=>svSnd('swing',.8,1.3)],[.72,c=>svSnd('swing',.8,1.4)],[1.05,c=>svSnd('swing',.8,1.3)],[1.42,c=>svSnd('swing',.8,1.5)],[2.25,c=>svSnd('whoosh',.9,1.6)]],rec:.4}};
VLRM.combo.ph1only=1;
svReg(5,{name:'Vaelric',col:VLR.col,body:1.3,ph2:.55,poise:.17,headJ:'head',turnA:5,
  ai:{pref:4,walk:2.8,run:5.2,turn:3.4,rest:[.6,1.2],ph2r:.7,strafe:.65,back:1},
  build:vlrBuild,loco:vlrLoco,post:vlrPost,P:VLRP,M:VLRM,
  stag:[[.25,'stag','o'],[2.0,'stag','l',.02],[2.5,'cRec','io']],stagT:2.5,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dqA!=null?A.dqA:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){const S=e.sv;if(S.gone)vlrGone(e,false);S.ghost=0;S.wk=0},
  dying(e,t){if(Math.random()<.6)burst(gY(e.m.position,1+Math.random()*2),0x1a0408,2,2,1.5,.9)}});
