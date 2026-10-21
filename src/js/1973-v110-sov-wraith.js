// ================= v110 Sovereign 2 — The Rime Wraith (Burningeye Summit) =================
// A floating reaper of the summit: a hood of frost over a pale skull, an ice crown, a torn robe that trails into mist,
// long bone arms, and a great scythe whose blade is a single shard of ice.
// Pattern (learnable):
//  close in front ── Reaping Sweep: the scythe is drawn back to its right (tremble), then a wide sweep; it almost always
//                   reverses into a second sweep — wait for the second one before you punish.
//  mid           ── Overhead Cleave: the scythe is raised high and held; a line slam, then ice bursts along the same line a
//                   heartbeat later (don't step back into it).
//  far           ── Glide Reap: it drifts back, then rushes straight through you with the blade low.
//                   Icicle Volley: five icicles gather over its head and fire one by one at your feet; keep moving.
//  close, any    ── Frost Nova: arms rise, frost crystals gather around it — leave the circle.
//  Phase II (55%) "The Blizzard Wakes": the crown blazes; adds Winter's Step (it vanishes in a snow burst and re-forms
//                   behind you with a sweep), Glacial Prison (ice bursts under you, then a ring around that spot: step out,
//                   then back in) and a three-hit reaping spin.
var RWR={col:0x9ad8ff,ice:0xd8f4ff,deep:0x4a90d8};
function rwrBuild(R,e){
  const robe=svMat(R,0x1e2838,{roughness:.95,emissive:0x060a14,side:THREE.DoubleSide}),robe2=svMat(R,0x2c3a52,{roughness:.9,side:THREE.DoubleSide}),bone=svMat(R,0xd8dce4,{roughness:.55,emissive:0x101418}),
    ice=svMat(R,0xa8dcff,{roughness:.15,metalness:.1,emissive:0x3a88c0,transparent:true,opacity:.97}),ice2=svMat(R,0x8ac8f0,{roughness:.2,emissive:0x1a4a7a}),wood=svMat(R,0x2a2430,{roughness:.6,metalness:.3}),
    eye=svGlowMat(R,0x9ae8ff),crown=svGlowMat(R,0x6ab0e0);R.crownG=crown;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('body','root',0,2.5,0);J('robe','body',0,0,0);J('chest','body',0,.05,0);
  // ---- robe: a tattered bell that frays into strips ----
  svM(R,'robe',svG('rw_rb',()=>svLoft([[0,.55,.48],[-.6,.78,.7],[-1.3,1.05,.95],[-1.95,1.3,1.15]],11,{cap:false})),robe);
  for(let k=0;k<13;k++){const a=k/13*6.283,l=.9+.5*Math.sin(k*2.3)+.3*(k%2),n='tt'+k;J(n,'robe',Math.sin(a)*1.15,-1.85,Math.cos(a)*1.05,.15*Math.cos(a),0,-.15*Math.sin(a));
    svM(R,n,svG('rw_tt'+(k%3),()=>svBlade([[-.22,0],[.22,0],[.12,-.6-(k%3)*.15],[.18,-1.0-(k%3)*.2],[0,-1.35-(k%3)*.25],[-.1,-.9],[-.2,-.5]],.03)),k%2?robe:robe2,0,0,0,0,a,0,1,l,1)}
  // ---- torso: a narrow cage of ribs under a frosted mantle, ice shards growing from the shoulders ----
  svM(R,'chest',svG('rw_ch',()=>svLoft([[0,.5,.42],[.5,.68,.5],[1.0,.78,.52,0,-.04],[1.35,.58,.45]],9)),robe2);
  for(let k=0;k<4;k++)[-1,1].forEach(s=>svM(R,'chest',svG('rw_rib',()=>svHorn(.05,.7,0,-.3,4,3)),bone,s*.12,.45+k*.2,.42,0,s*1.25,s*(.3+k*.05)));
  svM(R,'chest',svG('rw_mt',()=>svLoft([[.85,.95,.7],[1.15,.98,.72],[1.45,.62,.5]],10,{cap:false})),robe);
  [-1,1].forEach(s=>{for(let k=0;k<4;k++)svM(R,'chest',svG('rw_sh'+k,()=>svHorn(.16-.02*k,.8+.25*k,0,0,5,3)),ice,s*(.62+.1*k),1.3+.05*k,-.1-.08*k,-.5-.2*k,0,s*(-.9-.15*k))});
  for(let k=0;k<5;k++)svM(R,'chest',svG('rw_cr',()=>svLump(.18,0,.5,k+3)),ice2,(k-2)*.22,.6+.15*(k%2),-.42,0,k,0,.7,1.4,.7);
  // ---- head: a deep frost hood, a skull in its shadow, an ice crown ----
  J('neck','chest',0,1.38,0);J('head','neck',0,.3,.05);
  svM(R,'head',svG('rw_hd',()=>svLoft([[-.15,.42,.45,0,-.05],[.25,.5,.52,0,-.04],[.65,.42,.46,0,-.1],[1.0,.12,.15,0,-.25]],9,{cap:false})),robe);
  svM(R,'head',svG('rw_sk',()=>svLump(.3,1,.15,8)),bone,0,.28,.2,0,0,0,.9,1,1);svM(R,'head',svG('rw_jw',()=>svLoft([[0,.2,.18],[-.22,.14,.13]],6)),bone,0,.05,.28);
  [-1,1].forEach(s=>{svM(R,'head',svG('rw_ey',()=>new THREE.SphereGeometry(.07,6,5)),eye,s*.11,.32,.46);svSpr(R,'head',RWR.col,.5,s*.11,.32,.5)});
  const cw=J('crown','head',0,.62,-.02);for(let k=0;k<7;k++){const a=(k-3)*.42;svM(R,cw,svG('rw_cw'+(k%2),()=>svHorn(.08,.75+.35*(1-Math.abs(k-3)/3),0,-.15,5,3)),ice,Math.sin(a)*.4,0,Math.cos(a)*.38-.05,-1.25+Math.abs(a)*.2,a,0)}
  svM(R,cw,svG('rw_cwr',()=>{const q=new THREE.TorusGeometry(.42,.05,4,12);q.rotateX(Math.PI/2);return q.toNonIndexed()}),crown,0,0,0);
  // ---- arms: long bones, ice-clawed hands ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*.78,1.15,0,0,0,s*.25);
    svM(R,'sh'+L,svG('rw_pa',()=>svLump(.32,0,.3,6)),robe,0,0,0,0,0,0,1.1,.8,1);
    svM(R,'sh'+L,svG('rw_ua',()=>svLoft([[0,.15,.15],[-.6,.12,.12],[-1.15,.09,.09]],6)),bone);svM(R,'sh'+L,svG('rw_sl',()=>svLoft([[-.05,.3,.28],[-.7,.42,.38]],8,{cap:false})),robe2,0,0,0);
    J('el'+L,'sh'+L,0,-1.15,0,-.3);svM(R,'el'+L,svG('rw_fa',()=>svLoft([[0,.09,.09],[-1.05,.07,.07]],5)),bone);
    J('hd'+L,'el'+L,0,-1.05,0);svM(R,'hd'+L,svG('rw_hn',()=>svLump(.12,0,.2,2)),bone,0,-.05,0,0,0,0,1,1.3,.7);
    for(let c=0;c<4;c++)svM(R,'hd'+L,svG('rw_cl',()=>svHorn(.035,.5,0,.25,4,3)),ice,(c-1.5)*.06,-.12,.02,Math.PI/2+.2,0,(c-1.5)*.15)});
  // ---- the scythe (held in the right hand) ----
  const sc=J('scy','hdR',0,-.1,0,0,0,0);
  svM(R,sc,svG('rw_haft2',()=>svLoft([[.75,.065,.065],[-3.3,.06,.06]],6)),wood);
  [.55,-1.2,-3.0].forEach(y=>svM(R,sc,svG('rw_band',()=>svLoft([[-.06,.095,.095],[.06,.095,.095]],6)),ice2,0,y,0));
  svM(R,sc,svG('rw_bl2',()=>svBlade([[0,.12],[.5,.22],[1.4,.12],[2.4,-.25],[3.0,-.9],[2.45,-.55],[1.4,-.28],[.4,-.2],[0,-.14]],.05)),ice,0,-3.22,0,0,-Math.PI/2,0,1.3,1.3,1);
  svM(R,sc,svG('rw_bk',()=>svHorn(.08,.6,0,0,4,2)),ice2,0,-3.25,0,Math.PI/2,Math.PI,0);
  R.blade=sc;
}
function rwrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2);O.body[4]+=.25*Math.sin(t*1.3);O.body[0]+=.08*a;O.body[2]+=.03*Math.sin(t*.9);
  O.robe[0]+=-.12*a+.03*Math.sin(t*1.7);O.robe[2]+=.04*Math.sin(t*1.1);
  for(let k=0;k<13;k++){const o=O['tt'+k];o[0]+=.12*Math.sin(t*2.4+k*1.3)+.25*a;o[2]+=.08*Math.sin(t*1.9+k)}
  O.head[1]+=.15*Math.sin(t*.6);O.head[0]+=.06*Math.sin(t*.9);
  // scythe held diagonally across the body, the left hand near the haft
  O.shR[0]+=-.35+.05*Math.sin(t*1.2);O.elR[0]+=-.55;O.shR[2]+=-.1;O.shL[0]+=-.75+.04*Math.sin(t*1.4);O.shL[2]+=.35;O.elL[0]+=-.85;O.scy[0]+=.3;O.scy[2]+=.55}
function rwrPost(e,S,dt,now){const R=S.R,on=S.ph>1;R.crownG.color.setHex(on?0xd8f8ff:0x6ab0e0);if(Math.random()<dt*(on?14:5)){const p=svWP(e,'robe',(Math.random()-.5)*2,-1.9,(Math.random()-.5)*2);burst(p,0xe8f8ff,1,.6,.3,1.2)}
  e.m.visible=!S.gone&&e.m.visible}
var RWRP={
  // reaping sweep: drawn back to the right, sweep to the left; mirrored for the return
  rUp:{body:[0,-.65,.1],chest:[0,-.3,0],shR:[-.4,0,-1.35],elR:[-.4,0,0],hdR:[0,0,0],shL:[-1.0,0,-.3],elL:[-.9,0,0],scy:[.0,0,1.4],head:[0,.3,0],robe:[0,.2,0]},
  rHit:{body:[.1,.75,-.08,0,0,.6],chest:[0,.35,0],shR:[-1.35,0,.25],elR:[-.1,0,0],shL:[-1.2,0,.75],elL:[-.4,0,0],scy:[.2,0,-.3],head:[0,-.2,0],robe:[-.2,-.3,0]},
  rRec:{body:[.05,.5,0],chest:[0,.2,0],shR:[-.9,0,.1],elR:[-.3,0,0],shL:[-.9,0,.4],elL:[-.6,0,0],scy:[.1,0,.2]},
  rUp2:{body:[0,.75,.05],chest:[0,.35,0],shR:[-1.45,0,.55],elR:[-.2,0,0],shL:[-1.25,0,.9],elL:[-.4,0,0],scy:[.25,0,-.7],head:[0,-.3,0]},
  rHit2:{body:[.1,-.7,.08,0,0,.5],chest:[0,-.35,0],shR:[-.35,0,-1.4],elR:[-.3,0,0],shL:[-1.1,0,-.2],elL:[-.8,0,0],scy:[0,0,1.3],head:[0,.25,0],robe:[-.2,.3,0]},
  // overhead cleave
  oUp:{body:[-.25,0,0,0,.4,-.2],chest:[-.2,0,0],shR:[-2.6,0,-.15],elR:[-.3,0,0],shL:[-2.5,0,.25],elL:[-.4,0,0],scy:[-.6,0,0],head:[-.2,0,0],robe:[.1,0,0]},
  oHit:{body:[.45,0,0,0,-.55,.4],chest:[.3,0,0],shR:[-.9,0,-.1],elR:[-.1,0,0],shL:[-.95,0,.2],elL:[-.2,0,0],scy:[1.25,0,0],head:[.3,0,0],robe:[-.3,0,0]},
  oRec:{body:[.25,0,0,0,-.35,.2],chest:[.15,0,0],shR:[-.8,0,-.1],shL:[-.85,0,.2],scy:[1.0,0,0]},
  // glide reap: lean back, then rush with the blade low
  gBack:{body:[-.3,-.4,0,0,.3,-.4],shR:[.4,0,-.6],elR:[-.3,0,0],shL:[-.6,0,.2],scy:[.2,0,1.0],robe:[.3,0,0],head:[.1,.2,0]},
  gRush:{body:[.55,.3,0,0,-.4,.3],shR:[-.3,0,-1.1],elR:[0,0,0],shL:[-1.3,0,.4],scy:[.1,0,1.5],robe:[-.6,0,0],head:[-.25,-.2,0]},
  gCut:{body:[.2,.7,0,0,0,.2],shR:[-1.4,0,.3],shL:[-1.1,0,.8],scy:[.2,0,-.4],robe:[-.4,-.2,0]},
  // frost nova
  nUp:{body:[-.15,0,0,0,.6,0],shR:[-2.4,0,-.7],elR:[-.2,0,0],shL:[-2.4,0,.7],elL:[-.2,0,0],scy:[0,0,.3],head:[-.45,0,0],robe:[.25,0,0]},
  nDn:{body:[.25,0,0,0,-.5,0],shR:[-.4,0,-1.2],elR:[0,0,0],shL:[-.4,0,1.2],elL:[0,0,0],head:[.2,0,0],robe:[-.3,0,0]},
  // icicle volley: the left hand conducts
  vUp:{body:[-.1,0,0,0,.3,0],shL:[-2.7,0,.2],elL:[-.1,0,0],shR:[-.5,0,-.3],head:[-.3,0,0]},
  vThr:{body:[.1,0,0,0,.2,0],shL:[-1.4,0,.1],elL:[-.1,0,0],shR:[-.5,0,-.3],head:[0,0,0]},
  // roar / phase change
  roar:{body:[-.35,0,0,0,.8,0],chest:[-.25,0,0],shR:[-1.8,0,-1.1],elR:[-.3,0,0],shL:[-1.8,0,1.1],elL:[-.3,0,0],head:[-.6,0,0],robe:[.3,0,0],scy:[0,0,.5]},
  hunch:{body:[.35,0,0,0,-.6,0],chest:[.3,0,0],shR:[-.2,0,-.2],elR:[-1.2,0,0],shL:[-.2,0,.2],elL:[-1.2,0,0],head:[.5,0,0],robe:[-.3,0,0]},
  // spin (phase II third hit)
  spin:{body:[.1,3.1,0,0,0,0],shR:[-1.5,0,.2],shL:[-1.2,0,.7],scy:[.2,0,-.4],robe:[-.5,0,0]},
  stag:{body:[.45,0,.2,0,-1.2,0],chest:[.35,0,0],head:[.6,0,.3],shR:[.3,0,-.4],elR:[-.3,0,0],shL:[.2,0,.5],elL:[-.4,0,0],scy:[.8,0,.6],robe:[-.4,0,0]},
  dead:{body:[1.3,0,.3,0,-2.2,0],chest:[.4,0,0],head:[.8,0,0],shR:[.6,0,-.6],shL:[.5,0,.7],scy:[1.5,0,.5],robe:[-.8,0,0]}};
function rwrSpikes(c,an,L,w,dm){const e=c.e,mat=c.R.mats.find(m=>m.opacity<1)||c.R.mats[0];for(let d=1.5;d<L;d+=1.1){const p=new THREE.Vector3(an.x+Math.sin(an.a)*d+(Math.random()-.5)*w*.6,0,an.z+Math.cos(an.a)*d+(Math.random()-.5)*w*.6);svSpike(p,mat,1.6+Math.random()*1.2,.32,1.3,.5);burst(gY(p,.3),RWR.ice,4,1.5,2,.5)}
  svSnd('ice',1);shake(.2);svHitNow(e,{k:'l',w,l:L},an,dm,{col:RWR.ice})}
function rwrRing(c,an,r0,r1,n,dm){const e=c.e,mat=c.R.mats.find(m=>m.opacity<1)||c.R.mats[0];for(let k=0;k<n;k++){const a=k/n*6.283,r=r0+(r1-r0)*Math.random(),p=new THREE.Vector3(an.x+Math.cos(a)*r,0,an.z+Math.sin(a)*r);svSpike(p,mat,1.4+Math.random(),.3,1.2,.5)}
  svSnd('ice',1,.8);svHitNow(e,r0>0?{k:'r',r0,r:r1}:{k:'c',r:r1},an,dm,{col:RWR.ice})}
function rwrIcicle(c,i){const e=c.e,S=c.S,R=S.R,L=S.icc||[];const o=L[i];if(!o)return;const p=o.getWorldPosition(new THREE.Vector3());o.visible=false;
  const q=c.inA(pl.position.clone(),.8),S2={k:'c',r:1.7},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,.6));svSnd('whoosh',.5,1.6);
  const m=new THREE.Mesh(svG('rw_icm',()=>{const g=new THREE.ConeGeometry(.22,1.4,5);g.rotateX(Math.PI/2);return g}),R.mats.find(x=>x.opacity<1));
  svShot(p,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),.6,RWR.ice,.8,.8,P=>{if(e.dead||!AF)return;burst(P,RWR.ice,20,2.4,2,.5);svSnd('ice',.7,1.3);svDecal(P,0xcfefff,1.5,3,.5);svHitNow(e,S2,an,.85,{col:RWR.ice})},m)}
function rwrIcicles(c,on){const S=c.S,R=S.R;if(S.icc){S.icc.forEach(o=>o.parent&&o.parent.remove(o));S.icc=null}if(!on)return;S.icc=[];
  for(let k=0;k<5;k++){const o=new THREE.Mesh(svG('rw_icm2',()=>{const g=new THREE.ConeGeometry(.22,1.4,5);g.rotateX(Math.PI);return g}),R.mats.find(x=>x.opacity<1));o.position.set((k-2)*.75,2.4+.2*Math.abs(k-2),-.2);o.scale.setScalar(.01);R.J.chest.add(o);S.icc.push(o)}}
// Winter's Step: vanish, re-form behind the hero
function rwrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;if(on){burst(gY(e.m.position,2),0xe8f8ff,70,4,3,1);svShock(e.m.position,RWR.ice,4,.4)}}
var RWRM={
  intro:{dur:2.8,trk:[[.4,'hunch','io'],[1.1,'hunch','l',.02],[1.7,'roar','o'],[2.4,'roar','l',.02],[2.8,'rRec','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hum',.6,.8)],[1.6,c=>{svSnd('shriek',.9,.7);svSnd('ice',1,.6);shake(.3);svShock(c.m.position,RWR.ice,8,.7);burst(gY(c.m.position,2.5),RWR.ice,60,5,3,1)}]]},
  reap:{wt:10,r:[0,7.2],a:'f',mel:1,dur:1.35,lock:.52,trk:[[.55,'rUp','io'],[.7,'rUp','l',.02],[.86,'rHit','s'],[1.05,'rRec','io'],[1.35,'rRec','l']],
    hit:[{t:.84,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.1}],tr:[[.72,.95,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.2]],ev:[[.25,c=>svSnd('hum',.3,1.4)],[.76,c=>svSnd('swing',1,.8)]],nx:[['reap2',.8,9]],rec:.1},
  reap2:{dur:1.45,mel:1,lock:.3,trk:[[.32,'rUp2','io'],[.44,'rUp2','l',.015],[.6,'rHit2','s'],[.95,'rRec','io'],[1.45,'rRec','l']],
    hit:[{t:.58,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.1}],tr:[[.46,.7,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.2]],ev:[[.5,c=>svSnd('swing',1,.7)]],nx:[['spinR',.5,8]],rec:.35},
  spinR:{dur:1.6,ph:2,mel:1,lock:.25,trk:[[.3,'rUp','io'],[.4,'rUp','l',.02],[.75,'spin','l'],[1.0,'rRec','io'],[1.6,'rRec','l']],
    hit:[{t:.62,s:{k:'c',r:7.2},dm:1.25,w:.5}],tr:[[.42,.8,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.25]],ev:[[.42,c=>svSnd('whoosh',1,.6)]],rec:.5},
  cleave:{wt:8,r:[2.5,10],a:'f',dur:2.3,lock:.85,armor:1,trk:[[.7,'oUp','io'],[1.0,'oUp','l',.025],[1.12,'oHit','s'],[1.7,'oRec','l'],[2.3,'rRec','io']],
    hit:[{t:1.1,s:{k:'l',w:2.6,l:9,b:0},f:.5,dm:1.45,w:.4,fx:(c,an)=>{shake(.35);svSnd('heavy',1,1.2);for(let d=2;d<9;d+=1.5)burst(gY(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),.3),RWR.ice,6,2,2,.5);c.M.an.cl=an}},
      {t:1.68,s:{k:'l',w:3.2,l:11,b:0},f:.5,dm:1.1,w:.5,nohit:1,fx:(c,an)=>rwrSpikes(c,c.M.an.cl||an,11,3.2,1.1)}],
    tr:[[1.0,1.18,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.2]],ev:[[.3,c=>svSnd('hum',.5,1)],[1.0,c=>svSnd('swing',1,.6)]],rec:.4},
  glide:{wt:8,r:[7,26],a:'f',dur:2.2,lock:.9,armor:1,trn:[[0,.9,3]],trk:[[.55,'gBack','io'],[.88,'gBack','l',.02],[1.1,'gRush','o'],[1.35,'gCut','s'],[2.2,'rRec','io']],
    rm:[[.2,.85,-2.2,'io'],[.92,1.36,'tgt','o',-3,24]],hit:[{t:1.3,s:{k:'l',w:3.2,l:16,b:0},f:0,dm:1.35,w:.75}],
    tr:[[.95,1.4,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.22]],ev:[[.92,c=>{svSnd('whoosh',1.2,.7);burst(gY(c.m.position,1),RWR.ice,40,3,1,.8)}],[1.28,c=>svSnd('swing',1,.6)]],
    tk(c,dt){if(c.M.t>.9&&c.M.t<1.36&&Math.random()<.8)burst(gY(c.m.position,.8),0xe8f8ff,3,1,.5,.9)},rec:.45},
  nova:{wt:7,r:[0,6.5],a:'any',dur:2.2,armor:1,trn:[[0,.5,2]],trk:[[.55,'nUp','io'],[1.2,'nUp','l',.025],[1.35,'nDn','s'],[2.2,'rRec','io']],
    hit:[{t:1.33,s:{k:'c',r:7},dm:1.4,w:1.15,nohit:1,fx:c=>{rwrRing(c,{x:c.m.position.x,z:c.m.position.z},0,7,22,1.4);svShock(c.m.position,RWR.ice,8,.5);flash('rgba(200,240,255,.3)')}}],
    ev:[[.2,c=>{svSnd('charge',.6,.8);for(let k=0;k<6;k++){const a=k/6*6.283;svCharge(c.e,'chest',RWR.ice,1.2,1.1,Math.sin(a)*1.4,.5,Math.cos(a)*1.4)}}]],rec:.5},
  icicles:{wt:7,r:[8,45],a:'any',dur:3.0,armor:1,trn:[[0,3,2.5]],trk:[[.5,'vUp','io'],[1.0,'vUp','l',.02],[1.15,'vThr','s'],[1.5,'vUp','io'],[1.65,'vThr','s'],[2.0,'vUp','io'],[2.3,'vThr','s'],[3.0,'rRec','io']],
    go(c){rwrIcicles(c,true)},tk(c,dt){const L=c.S.icc;if(L)L.forEach((o,k)=>{if(o.visible)o.scale.setScalar(Math.min(1,Math.max(.01,(c.M.t-.15*k)/.5)))})},end(c){rwrIcicles(c,false)},
    ev:[[.15,c=>svSnd('ice',.8,.7)]].concat([0,1,2,3,4].map(i=>[1.1+i*.32,c=>rwrIcicle(c,i)])),rec:.4},
  // ---- Phase II ----
  awaken:{dur:3.3,inv:[0,3.3],armor:1,trk:[[.5,'hunch','io'],[1.2,'hunch','l',.03],[1.6,'roar','o'],[2.8,'roar','l',.02],[3.3,'rRec','io']],trn:[[0,3,1]],
    hit:[{t:1.65,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,RWR.ice,10,.8);burst(gY(c.m.position,2),0xffffff,90,6,3,1.2)}}],
    ev:[[.05,c=>{banner('THE BLIZZARD WAKES','The Rime Wraith calls the storm','');svSnd('hum',.8,.6)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(220,245,255,.45)');svSnd('shriek',1.1,.6);shake(.5)}]]},
  step:{wt:8,ph:2,r:[0,30],a:'any',dur:2.7,armor:1,trn:[[0,.1,1]],trk:[[.35,'hunch','io'],[.5,'hunch','l'],[1.4,'rUp','io'],[1.62,'rUp','l',.02],[1.8,'rHit','s'],[2.2,'rRec','io'],[2.7,'rRec','l']],
    ev:[[.4,c=>{rwrGone(c.e,true);svSnd('whoosh',1,.5)}],[1.25,c=>{const e=c.e,m=e.m,d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:Math.sin(pl.rotation.y),z:Math.cos(pl.rotation.y)},q=c.inA(pl.position.clone().add(new THREE.Vector3(-d.x*4.2,0,-d.z*4.2)),2.5);
      m.position.set(q.x,0,q.z);m.rotation.y=svYawTo(m,pl.position);rwrGone(e,false);svSnd('bell',.8,1.6);burst(gY(q,2),RWR.ice,60,3,2,.8);svShock(q,RWR.ice,3,.3)}]],
    hit:[{t:1.78,s:{k:'a',r:7,h:1.35},f:-.3,dm:1.25,w:.45}],tr:[[1.64,1.9,'scy',[0,-3.6,2.7],[0,-2.9,.4],0xbfe8ff,.2]],end(c){if(c.S.gone)rwrGone(c.e,false)},inv:[.4,1.25],rec:.4},
  prison:{wt:7,ph:2,r:[0,16],a:'any',dur:2.8,armor:1,trn:[[0,2.8,2]],trk:[[.5,'vUp','io'],[1.25,'vUp','l',.02],[1.4,'nDn','s'],[1.9,'nUp','io'],[2.05,'nDn','s'],[2.8,'rRec','io']],
    hit:[{t:1.4,s:{k:'c',r:3.2},o:'tgt',dm:1.2,w:1.1,nohit:1,fx:(c,an)=>{c.M.an.pr=an;rwrRing(c,an,0,3.2,14,1.2)}},
      {t:2.05,s:{k:'r',r0:3.2,r:6.8},o:c=>c.M.an.pr||c.inA(pl.position.clone()),dm:1.2,w:.6,nohit:1,fx:(c,an)=>rwrRing(c,c.M.an.pr||an,3.2,6.8,26,1.2)}],
    ev:[[.2,c=>svSnd('charge',.6,1.1)]],rec:.4}};
svReg(2,{name:'Rime Wraith',col:RWR.col,body:1.6,ph2:.55,poise:.17,headJ:'head',turnA:4.5,
  ai:{pref:5,walk:2.6,run:4,turn:2.6,rest:[.75,1.35],ph2r:.7,strafe:.6,back:1},
  build:rwrBuild,loco:rwrLoco,post:rwrPost,P:RWRP,M:RWRM,
  stag:[[.3,'stag','o'],[2.0,'stag','l',.02],[2.6,'rRec','io']],stagT:2.6,
  die:[[.5,'stag','o'],[1.4,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dn&&A.dn.ea!=null?A.dn.ea:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){if(e.sv.gone)rwrGone(e,false);rwrIcicles({S:e.sv},false)},
  dying(e,t){if(Math.random()<.5)burst(gY(e.m.position,1.5+Math.random()*2),0xe8f8ff,3,1.5,1,1)}});
