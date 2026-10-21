// ================= v110 Sovereign 1 — The Crest Hydra (Hillside Crest) =================
// A coiled serpent mound in the mere with three long necks, each ending in a frilled, horned head; a heavy tail behind.
// Pattern (learnable):
//  any range ── Fang Strike: one head (the one on your side) rears back, mouth wide, then strikes down a line at you.
//              Serpent Fury: left, centre, right in a fixed rhythm — sidestep three times.
//  close    ── Neck Sweep: all three heads drop low to one side, then sweep the front — dash through it or get far away.
//              Coil Surge: the coils tighten and the water bursts out in a ring around the body.
//  behind   ── Tail Slam: the tail rears up behind it and crashes down along a line.
//  far      ── Venom Spit: the centre head gulps and lobs three globs onto you; they leave burning pools.
//  Phase II (55%) "The Crests Flare": the crests glow and spread; adds Venom Breath (three cones: left and right first,
//              then the centre — stand in the centre gap, then leave it) and Venom Deluge (drops rain around you; keep moving).
var HYD={col:0x7ac850,ven:0x9aff4a,crest:0xd8ff60};
function hydBuild(R,e){
  const sk=svMat(R,0x24482c,{roughness:.62,metalness:.15,emissive:0x061006}),sk2=svMat(R,0x3a6234,{roughness:.6}),bel=svMat(R,0xc8c08a,{roughness:.8,emissive:0x100e04}),
    dk=svMat(R,0x203a24,{roughness:.8}),horn=svMat(R,0xd8ccb0,{roughness:.55}),fang=svMat(R,0xf0ead8,{roughness:.4}),gum=svMat(R,0x7a2030,{roughness:.6}),
    mem=svMat(R,0x8a3a48,{roughness:.6,side:THREE.DoubleSide,emissive:0x200408}),eye=svGlowMat(R,0xe8ff60),crestG=svGlowMat(R,0x5a7a30);R.crestG=crestG;R.memM=mem;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('body','root',0,0,0);
  // ---- the coiled mound: three stacked coils, scaled belly plates, a trunk rising out of them ----
  // a spiral of serpent body: two and a half turns rising toward the centre, thick at the bottom
  svM(R,'body',svG('hy_coil',()=>{const P=[],Rr=[];const N=46;for(let i=0;i<=N;i++){const k=i/N,a=k*Math.PI*3.3+.6,r=3.35-1.75*k,y=.55+1.3*k+.18*Math.sin(k*9);P.push([Math.sin(a)*r,y,Math.cos(a)*r]);Rr.push([1.05-.3*k,.9-.22*k])}
    return svTube(P,Rr,10)}),sk);
  svM(R,'body',svG('hy_coilb',()=>{const P=[],Rr=[];const N=46;for(let i=0;i<=N;i++){const k=i/N,a=k*Math.PI*3.3+.6,r=3.35-1.75*k-(.5-.12*k),y=.3+1.3*k+.18*Math.sin(k*9);P.push([Math.sin(a)*r,y,Math.cos(a)*r]);Rr.push([.5-.12*k,.5-.12*k])}
    return svTube(P,Rr,6)}),bel);
  svM(R,'body',svG('hy_trk',()=>svLoft([[0,1.7,1.7],[1.4,1.5,1.45],[2.4,1.25,1.2],[3.0,1.1,1.0,0,-.2],[3.4,.9,.8,0,-.3]],10)),sk);
  for(let k=0;k<10;k++){const a=k/10*6.283;svM(R,'body',svG('hy_bp',()=>svLump(.5,0,.25,4)),bel,Math.sin(a)*2.95,.35,Math.cos(a)*2.95,0,a,0,.9,.35,.6)}
  for(let k=0;k<14;k++){const a=k/14*6.283+.2,y=.6+(k%3)*.6,r=2.6-(k%3)*.55;svM(R,'body',svG('hy_sp',()=>svHorn(.16,.8,0,-.3,5,4)),horn,Math.sin(a)*r,y+.5,Math.cos(a)*r,-1.0,a,0)}
  // ---- three necks (five segments each) and crowned heads ----
  const NK=[['C',0,3.2,.35,0],['L',1.05,2.9,-.1,.35],['R',-1.05,2.9,-.1,-.35]];
  NK.forEach(([s,x,y,z,ry])=>{let p='body';for(let k=0;k<5;k++){const n='n'+k+s,r0=.8-.075*k,r1=r0-.075;J(n,p,k?0:x,k?0:y,k?.92:z,k?.2:-1.2,k?0:ry,0);
      svM(R,n,svG('hy_nk'+k,()=>svLoftZ([[-.08,r0,r0*.92],[.5,r0*.96,r0*.9,0,.02],[.98,r1,r1*.9]],9)),sk);
      svM(R,n,svG('hy_nb'+k,()=>svLoftZ([[0,r0*.62,r0*.3,0,-r0*.72],[.9,r1*.62,r1*.3,0,-r1*.72]],6)),bel);
      if(k<4)svM(R,n,svG('hy_ns',()=>svHorn(.1,.5,0,-.18,4,3)),horn,0,r0*.85,.45,-1.3,0,0);p=n}
    const h=J('h'+s,p,0,0,.92,.6);
    svM(R,h,svG('hy_hd',()=>svLoftZ([[-.35,.52,.5,0,.05],[.1,.58,.5,0,.1],[.6,.46,.36,0,.04],[1.1,.32,.24,0,-.04],[1.45,.18,.14,0,-.06]],9)),sk);
    svM(R,h,svG('hy_brw',()=>svLoftZ([[.0,.5,.12,0,.42],[.75,.36,.08,0,.3]],6)),dk);
    [-1,1].forEach(q=>{svM(R,h,svG('hy_eye',()=>new THREE.SphereGeometry(.09,6,5)),eye,q*.36,.24,.55);
      svM(R,h,svG('hy_hn',()=>svHorn(.12,1.1,0,.35,6,5)),horn,q*.3,.36,-.05,-2.6,q*.35,0);
      for(let f=0;f<4;f++)svM(R,h,svG('hy_fg',()=>svHorn(.05,.32,0,0,4,2)),fang,q*(.24-.03*f),-.12,.75+f*.17,1.65,0,0)});
    // the crest: a fan of spines with membrane between them
    const cr=J('cr'+s,'h'+s,0,.45,-.2);for(let f=0;f<7;f++){const a=-1.2+f*.4;svM(R,cr,svG('hy_cs',()=>svHorn(.07,1.25,0,-.25,4,4)),horn,0,0,0,-2.2+Math.abs(a)*.2,a,0)}
    svM(R,cr,svG('hy_mem',()=>{const P=[0,0,0];for(let f=0;f<=6;f++){const a=-1.2+f*.4;P.push(Math.sin(a)*1.05,Math.cos(a)*.9,-.55)}const pos=[];for(let f=0;f<6;f++)pos.push(0,0,0,P[3+f*3],P[4+f*3],P[5+f*3],P[6+f*3],P[7+f*3],P[8+f*3]);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}),mem,0,0,0,-.35,0,0);
    for(let f=0;f<3;f++)svM(R,cr,svG('hy_cg',()=>new THREE.SphereGeometry(.07,5,4)),crestG,(f-1)*.4,.62,-.35);
    const jw=J('j'+s,'h'+s,0,-.2,.05);svM(R,jw,svG('hy_jw',()=>svLoftZ([[-.15,.44,.14],[.6,.32,.11,0,-.03],[1.25,.16,.07]],8)),sk);svM(R,jw,svG('hy_tg',()=>svLoftZ([[0,.28,.05,0,.08],[.95,.1,.03,0,.07]],6)),gum);
    for(let f=0;f<3;f++)[-1,1].forEach(q=>svM(R,jw,svG('hy_fg2',()=>svHorn(.045,.25,0,0,4,2)),fang,q*(.22-.04*f),.06,.5+f*.2,-1.6,0,0))});
  // ---- the tail behind the coils ----
  let p='body';for(let k=0;k<6;k++){const n='t'+k,r=.7-.1*k;J(n,p,0,k?0:.5,k?-1.0:-2.6,k?-.04:0,0,0);svM(R,n,svG('hy_t'+k,()=>svLoftZ([[.1,r,r*.85],[-1.05,r*.86,r*.75]],8)),sk);
    svM(R,n,svG('hy_ts',()=>svHorn(.12,.55,0,.2,4,3)),horn,0,r*.8,-.5,-2.1,0,0);p=n}
  svM(R,'t5',svG('hy_tc',()=>svHorn(.3,1.4,0,.3,6,5)),horn,0,0,-.9,-3.0,0,0);
  R.mouth={C:null,L:null,R:null};
}
function hydLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/1.4);O.body[4]+=.04*Math.sin(t*1.2);O.body[1]+=.05*Math.sin(t*.4);
  const m=e.m,dy=AF?svAng(svYawTo(m,pl.position)-m.rotation.y):0;
  [['C',0],['L',2.1],['R',4.2]].forEach(([s,ph])=>{for(let k=0;k<5;k++){const o=O['n'+k+s];o[0]+=.07*Math.sin(t*1.3+ph-k*.5)*(1+a);o[1]+=.09*Math.sin(t*.8+ph-k*.6)+dy*.06}
    O['h'+s][0]+=.06*Math.sin(t*1.7+ph);O['j'+s][0]+=.06+.05*Math.max(0,Math.sin(t*1.1+ph*1.7));O['cr'+s][0]+=.05*Math.sin(t*2+ph)});
  for(let k=0;k<6;k++){O['t'+k][1]+=Math.sin(t*1.1-k*.6)*(.08+.03*k)*(1+a*1.5)}}
function hydPost(e,S,dt,now){const R=S.R,on=S.ph>1,k=on?.55+.45*Math.sin(now/180):0,c=on?HYD.crest:0x5a7a30;R.crestG.color.setHex(c);if(on)R.crestG.color.multiplyScalar(.6+.4*k)}
var HYDP={
  // fang strike, left head (mirror for the right); the centre head has its own
  rearL:{n0L:[-.35,-.15,0],n1L:[-.35,0,0],n2L:[-.3,0,0],n3L:[-.25,0,0],n4L:[-.1,0,0],hL:[-.55,0,0],jL:[.85,0,0],crL:[-.3,0,0],body:[0,.12,0],n0C:[0,.15,0],n0R:[.1,.2,0]},
  strL:{n0L:[.55,-.2,0],n1L:[.35,0,0],n2L:[.3,0,0],n3L:[.2,0,0],n4L:[.05,0,0],hL:[.15,0,0],jL:[.15,0,0],crL:[.25,0,0],body:[0,-.12,0,0,0,.1]},
  recL:{n0L:[.35,-.15,0],n1L:[.25,0,0],n2L:[.2,0,0],n3L:[.1,0,0],hL:[.2,0,0],jL:[.25,0,0]},
  rearC:{n0C:[-.3,0,0],n1C:[-.35,0,0],n2C:[-.3,0,0],n3C:[-.25,0,0],n4C:[-.1,0,0],hC:[-.55,0,0],jC:[.85,0,0],crC:[-.3,0,0],n0L:[0,.25,0],n0R:[0,-.25,0]},
  strC:{n0C:[.55,0,0],n1C:[.35,0,0],n2C:[.3,0,0],n3C:[.2,0,0],n4C:[.05,0,0],hC:[.15,0,0],jC:[.15,0,0],crC:[.25,0,0],body:[.04,0,0,0,0,.12]},
  recC:{n0C:[.35,0,0],n1C:[.25,0,0],n2C:[.2,0,0],n3C:[.1,0,0],hC:[.2,0,0],jC:[.25,0,0]},
  // neck sweep: all three heads low to the right, then across to the left
  lowR:{body:[0,-.5,0],n0C:[.45,-.4,0],n1C:[.3,-.2,0],n2C:[.2,0,0],hC:[.1,0,0],jC:[.6,0,0],n0L:[.45,-.55,0],n1L:[.3,-.2,0],n2L:[.2,0,0],hL:[.15,0,0],jL:[.6,0,0],n0R:[.45,-.3,0],n1R:[.3,-.25,0],n2R:[.2,0,0],hR:[.1,0,0],jR:[.6,0,0]},
  swpL:{body:[0,.6,0],n0C:[.5,.4,0],n1C:[.3,.25,0],n2C:[.2,0,0],hC:[.1,0,0],jC:[.3,0,0],n0L:[.5,.35,0],n1L:[.3,.2,0],n2L:[.2,0,0],hL:[.1,0,0],jL:[.3,0,0],n0R:[.5,.55,0],n1R:[.3,.3,0],n2R:[.2,0,0],hR:[.1,0,0],jR:[.3,0,0]},
  // spit: the centre head rears high and gulps, then thrusts
  gulp:{n0C:[-.45,0,0],n1C:[-.3,0,0],n2C:[-.25,0,0],n3C:[-.15,0,0],hC:[-.2,0,0],jC:[.05,0,0],crC:[-.4,0,0],n0L:[.1,.3,0],n0R:[.1,-.3,0]},
  spit:{n0C:[-.1,0,0],n1C:[.05,0,0],n2C:[.1,0,0],n3C:[.1,0,0],hC:[-.3,0,0],jC:[1.0,0,0],crC:[.2,0,0]},
  // tail slam
  tUp:{t0:[-.6,0,0],t1:[-.45,0,0],t2:[-.35,0,0],t3:[-.2,0,0],t4:[-.1,0,0],t5:[.1,0,0],body:[0,0,0,0,0,.25],n0C:[0,0,0],hC:[-.2,0,0],n0L:[-.15,-.4,0],n0R:[-.15,.4,0],jL:[.5,0,0],jR:[.5,0,0]},
  tDn:{t0:[.35,0,0],t1:[.25,0,0],t2:[.15,0,0],t3:[.1,0,0],t4:[.05,0,0],t5:[0,0,0],body:[0,0,0,0,0,-.2]},
  // coil surge: everything tightens, then bursts
  tight:{body:[0,0,0,0,-.35,0],n0C:[.3,0,0],n0L:[.3,.3,0],n0R:[.3,-.3,0],n1C:[.2,0,0],n1L:[.2,0,0],n1R:[.2,0,0],hC:[.3,0,0],hL:[.3,0,0],hR:[.3,0,0],jC:[.4,0,0],jL:[.4,0,0],jR:[.4,0,0]},
  burst:{body:[0,0,0,0,.25,0],n0C:[-.3,0,0],n0L:[-.25,-.4,0],n0R:[-.25,.4,0],hC:[-.5,0,0],hL:[-.5,0,0],hR:[-.5,0,0],jC:[.9,0,0],jL:[.9,0,0],jR:[.9,0,0],crC:[-.3,0,0],crL:[-.3,0,0],crR:[-.3,0,0]},
  // roar (intro / awakening): all three heads to the sky
  roar:{n0C:[-.35,0,0],n1C:[-.3,0,0],n2C:[-.25,0,0],n3C:[-.2,0,0],hC:[-.9,0,0],jC:[1.0,0,0],crC:[-.4,0,0],n0L:[-.3,-.35,0],n1L:[-.25,0,0],n2L:[-.2,0,0],hL:[-.85,0,0],jL:[1.0,0,0],crL:[-.4,0,0],
    n0R:[-.3,.35,0],n1R:[-.25,0,0],n2R:[-.2,0,0],hR:[-.85,0,0],jR:[1.0,0,0],crR:[-.4,0,0],t0:[-.3,0,0],t1:[-.2,0,0]},
  // venom breath: side heads aim out, centre forward
  brW:{n0L:[-.2,.5,0],n0R:[-.2,-.5,0],n0C:[-.25,0,0],hL:[-.3,0,0],hR:[-.3,0,0],hC:[-.3,0,0],jL:[.2,0,0],jR:[.2,0,0],jC:[.2,0,0],crL:[-.3,0,0],crR:[-.3,0,0],crC:[-.3,0,0]},
  brS:{n0L:[.15,.65,0],n0R:[.15,-.65,0],n1L:[.15,0,0],n1R:[.15,0,0],hL:[.2,0,0],hR:[.2,0,0],jL:[1.0,0,0],jR:[1.0,0,0],n0C:[-.2,0,0],hC:[-.3,0,0],jC:[.3,0,0]},
  brC:{n0L:[0,.5,0],n0R:[0,-.5,0],hL:[0,0,0],hR:[0,0,0],jL:[.2,0,0],jR:[.2,0,0],n0C:[.2,0,0],n1C:[.15,0,0],hC:[.2,0,0],jC:[1.0,0,0]},
  // stagger and death
  stag:{body:[0,0,.12,0,-.4,0],n0C:[.5,0,.2],n1C:[.35,0,.1],hC:[.5,0,.3],jC:[.6,0,0],n0L:[.6,-.3,.3],n1L:[.4,0,0],hL:[.5,0,0],jL:[.7,0,0],n0R:[.55,.3,-.2],n1R:[.4,0,0],hR:[.4,0,0],jR:[.5,0,0]},
  dead:{body:[0,0,0,0,-1.0,0],n0C:[1.0,0,.2],n1C:[.4,0,0],n2C:[.2,0,0],hC:[.2,0,.4],jC:[.6,0,0],n0L:[1.0,-.5,.5],n1L:[.4,0,0],n2L:[.2,0,0],hL:[.2,0,0],jL:[.7,0,0],n0R:[.95,.5,-.4],n1R:[.4,0,0],n2R:[.2,0,0],hR:[.3,0,0],jR:[.5,0,0]}};
// which head: the one on the hero's side
function hydSide(e){const da=svAng(svYawTo(e.m,pl.position)-e.m.rotation.y);return da>.35?'L':da<-.35?'R':'C'}
function hydBase(c,s){return svWP(c.e,'n0'+s,0,0,0)}
function hydMouth(c,s){return svWP(c.e,'h'+s,0,-.1,1.3)}
function hydLine(c,s){const p=hydBase(c,s),q=c.inA(pl.position.clone(),.6);return {x:p.x,z:p.z,a:Math.atan2(q.x-p.x,q.z-p.z)}}
function hydPool(c,p,r,life){const e=c.e,o=svDecal(p,0x5aff2a,r,life,.5),S2={k:'c',r};let tk=0,t=0;svDecal(p,0x1a3a08,r*.8,life,.4);
  kqFx({tick(dt){t+=dt||0;tk-=dt||0;if(!AF||e.dead)return false;if(Math.random()<.3)burst(gY(p,.2).add(new THREE.Vector3((Math.random()-.5)*r,0,(Math.random()-.5)*r)),HYD.ven,1,.3,.8,.6);
    if(tk<=0&&hero.iv<=0&&hero.hp>0&&svIn(S2,{x:p.x,z:p.z,a:0},pl.position,0)){tk=.5;bossHit(e,.22);dqDebuff('Venom','🟢',{mspd:-.25},800,'Slowed by venom')}return t<life}})}
function hydGlob(c,from,q,T,big){const e=c.e,S2={k:'c',r:big?2.4:2},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const g=new THREE.Mesh(svG('hy_glob',()=>new THREE.IcosahedronGeometry(.35,0)),kqBas(HYD.ven));g.scale.setScalar(big?1.4:1);
  svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.2,q.z),T,HYD.ven,1,4,P=>{if(e.dead||!AF)return;burst(P,HYD.ven,22,2.4,2,.6);svSnd('splash',.6,1.3);svHitNow(e,S2,an,big?.9:.8,{});hydPool(c,P,big?2.2:1.8,4)},g)}
function hydBreath(c,s,a0,T){const e=c.e,S2={k:'a',r:10,h:.42},o=hydBase(c,s),an={x:o.x,z:o.z,a:c.m.rotation.y+a0};svFlash(S2,an,HYD.ven,700);
  const m=hydMouth(c,s);for(let k=0;k<26;k++){const d=2+Math.random()*8,a=an.a+(Math.random()-.5)*.8;burst(new THREE.Vector3(o.x+Math.sin(a)*d,GH(o.x,o.z)+1+Math.random()*2.5,o.z+Math.cos(a)*d),HYD.ven,2,1.4,.6,.9)}
  burst(m,HYD.ven,20,3,1,.6);svSnd('hiss',.9,.8);svHitNow(e,S2,an,1.1,{flash:false,on:()=>dqDebuff('Venom','🟢',{mspd:-.3},2500,'Slowed by venom')})}
function hydSplash(p,n){burst(gY(p,.2),0xbfe8e0,n||30,4,4,.7);svShock(p,0xbfe8e0,5,.5)}
var HYDM={
  intro:{dur:2.8,trk:[[.4,'tight','io'],[1.0,'tight','l',.02],[1.6,'roar','o'],[2.4,'roar','l',.02],[2.8,'recC','io']],trn:[[0,2.8,1]],
    ev:[[.3,c=>svSnd('hiss',.7,.6)],[1.55,c=>{svSnd('roar',1,1.15);svSnd('shriek',.5,.8);shake(.35);hydSplash(c.m.position,40)}]]},
  bite:{wt:10,r:[0,13],a:'any',dur:1.75,lock:.62,
    go(c){c.M.s=hydSide(c.e);const s=c.M.s;c.M.D=Object.assign({},c.M.D,{trk:s==='C'?[[.55,'rearC','io'],[.72,'rearC','l',.015],[.9,'strC','s'],[1.25,'recC','l'],[1.75,'recC','io']]:[[.55,'rear'+(s==='L'?'L':'L~'),'io'],[.72,'rear'+(s==='L'?'L':'L~'),'l',.015],[.9,'str'+(s==='L'?'L':'L~'),'s'],[1.25,'rec'+(s==='L'?'L':'L~'),'l'],[1.75,'rec'+(s==='L'?'L':'L~'),'io']]});c.S.trk=c.M.D.trk},
    hit:[{t:.9,s:{k:'l',w:2.6,l:10.5,b:0},o:c=>hydLine(c,c.M.s),dm:1.2,w:.55,fx:(c,an)=>{const p=new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8);hydSplash(p,24);svSnd('crack',.8,.8);shake(.18)}}],
    ev:[[.25,c=>svSnd('hiss',.7)],[.8,c=>svSnd('whoosh',.8,.9)]],nx:[['bite',.3]],rec:.15},
  fury:{wt:7,r:[0,13],a:'f',dur:2.9,lock:.5,trn:[[0,2.6,2.6]],
    trk:[[.45,'rearL','io'],[.6,'rearL','l',.015],[.78,'strL','s'],[.98,'rearL~','io'],[1.36,'strL~','s'],[1.56,'rearC','io'],[1.98,'strC','s'],[2.5,'recC','l'],[2.9,'recC','io']],
    hit:[{t:.78,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'L'),dm:1,w:.45},{t:1.36,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'R'),dm:1,w:.45},{t:1.98,s:{k:'l',w:2.8,l:11},o:c=>hydLine(c,'C'),dm:1.3,w:.5,fx:(c,an)=>{hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8),30);shake(.25)}}],
    ev:[[.3,c=>svSnd('hiss',.8)],[.7,c=>svSnd('whoosh',.7)],[1.28,c=>svSnd('whoosh',.7,1.1)],[1.9,c=>svSnd('whoosh',.9,.8)]],rec:.55},
  sweep:{wt:9,r:[0,8.5],a:'f',dur:2.0,lock:.7,armor:1,trk:[[.6,'lowR','io'],[.92,'lowR','l',.02],[1.15,'swpL','o'],[1.55,'swpL','l'],[2.0,'recC','io']],
    hit:[{t:1.08,s:{k:'a',r:8.6,h:1.25},f:0,dm:1.3,w:.5,kb:3}],tr:[[.95,1.2,'hC',[0,0,1.2],[0,0,0],0xbfe8a0,.22]],ev:[[.35,c=>svSnd('hiss',.8,.7)],[.98,c=>{svSnd('whoosh',1,.6);svSnd('splash',.5)}]],rec:.35},
  coil:{wt:6,r:[0,5.5],a:'any',dur:1.9,armor:1,trk:[[.5,'tight','io'],[1.0,'tight','l',.025],[1.15,'burst','s'],[1.9,'recC','io']],
    hit:[{t:1.12,s:{k:'c',r:6.2},dm:1.1,w:.95,kb:4,fx:c=>{hydSplash(c.m.position,60);svShock(c.m.position,0xbfe8e0,7,.6);shake(.3);svSnd('splash',1,.7)}}],ev:[[.3,c=>svSnd('hum',.5,.6)]],rec:.4},
  tail:{wt:11,r:[0,13],a:'b',dur:1.9,lock:.5,trn:[[0,.1,1]],trk:[[.65,'tUp','io'],[.85,'tUp','l',.02],[1.05,'tDn','s'],[1.9,'recC','io']],
    hit:[{t:1.02,s:{k:'l',w:3,l:11},o:c=>{const p=svWP(c.e,'t0',0,0,0);return {x:p.x,z:p.z,a:c.m.rotation.y+Math.PI}},dm:1.35,w:.75,fx:(c,an)=>{for(let d=3;d<11;d+=2.5)hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*d,0,an.z+Math.cos(an.a)*d),14);shake(.3);svSnd('heavy',1)}}],
    ev:[[.4,c=>svSnd('hiss',.5,.5)]],rec:.3},
  spit:{wt:8,r:[6,40],a:'any',dur:2.3,lock:.9,trk:[[.6,'gulp','io'],[1.0,'gulp','l',.02],[1.15,'spit','s'],[1.5,'spit','l'],[2.3,'recC','io']],
    ev:[[.3,c=>svSnd('squelch',.7,.8)],[1.15,c=>{const m=hydMouth(c,'C');svSnd('squelch',.8,1.2);[0,1,2].forEach(i=>{const off=[[0,0],[3,-1.4],[-3,-1.4]][i],a=svYawTo(c.m,pl.position),
      q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*off[0]+Math.sin(a)*off[1],0,-Math.sin(a)*off[0]+Math.cos(a)*off[1])),.8);hydGlob(c,m,q,.85+i*.12)})}]],rec:.4},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'tight','io'],[1.1,'tight','l',.03],[1.7,'roar','o'],[2.9,'roar','l',.02],[3.4,'recC','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{hydSplash(c.m.position,80);svShock(c.m.position,HYD.crest,10,.8)}}],
    ev:[[.05,c=>{banner('THE CRESTS FLARE','The Hydra rises in fury','');svSnd('hiss',.9,.5)}],[1.1,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(160,255,90,.3)');svSnd('roar',1.2,1.1);svSnd('shriek',.7,.9);shake(.5)}]]},
  breath:{wt:9,ph:2,r:[0,12],a:'f',dur:3.2,lock:.6,armor:1,trn:[[0,.6,2]],trk:[[.6,'brW','io'],[1.15,'brW','l',.02],[1.35,'brS','o'],[1.9,'brS','l'],[2.05,'brC','io'],[2.5,'brC','l'],[3.2,'recC','io']],
    hit:[{t:1.38,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'L');return {x:p.x,z:p.z,a:c.m.rotation.y+.62}},nohit:1,w:1.0,fx:c=>hydBreath(c,'L',.62)},
      {t:1.38,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'R');return {x:p.x,z:p.z,a:c.m.rotation.y-.62}},nohit:1,w:1.0,fx:c=>hydBreath(c,'R',-.62)},
      {t:2.2,s:{k:'a',r:10,h:.42},o:c=>{const p=hydBase(c,'C');return {x:p.x,z:p.z,a:c.m.rotation.y}},nohit:1,w:.7,fx:c=>hydBreath(c,'C',0)}],
    ev:[[.35,c=>svSnd('charge',.6,.5)]],rec:.5},
  deluge:{wt:7,ph:2,r:[0,40],a:'any',dur:3.4,armor:1,trk:[[.55,'gulp','io'],[.95,'gulp','l',.02],[1.1,'roar','s'],[1.6,'roar','l'],[2.4,'recC','io'],[3.4,'recC','l']],
    ev:[[.3,c=>svSnd('squelch',.8,.7)],[1.1,c=>{const m=hydMouth(c,'C');svShot(m,m.clone().add(new THREE.Vector3(0,9,0)),.45,HYD.ven,2.4,0);svSnd('splash',.8,1.4)}]].concat(
      [0,1,2,3,4,5,6,7,8].map(i=>[1.45+i*.2,c=>{const a=i*2.4+c.rnd(),r=i==8?0:2.6+(i%3)*1.4,q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r)),.8);
        hydGlob(c,new THREE.Vector3(q.x+(c.rnd()-.5)*2,GH(q.x,q.z)+12,q.z+(c.rnd()-.5)*2),q,.9,i==8)}])),rec:.5},
  furyX:{wt:6,ph:2,r:[0,13],a:'f',dur:3.0,lock:.4,trn:[[0,2.8,3]],
    trk:[[.38,'rearC','io'],[.52,'rearC','l',.015],[.68,'strC','s'],[.85,'rearL','io'],[1.18,'strL','s'],[1.3,'rearL~','io'],[1.62,'strL~','s'],[1.78,'rearC','io'],[2.18,'strC','s'],[2.6,'recC','l'],[3.0,'recC','io']],
    hit:[{t:.68,s:{k:'l',w:2.6,l:11},o:c=>hydLine(c,'C'),dm:1,w:.4},{t:1.18,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'L'),dm:1,w:.4},{t:1.62,s:{k:'l',w:2.5,l:10.5},o:c=>hydLine(c,'R'),dm:1,w:.4},
      {t:2.18,s:{k:'l',w:3,l:11.5},o:c=>hydLine(c,'C'),dm:1.4,w:.5,fx:(c,an)=>{hydSplash(new THREE.Vector3(an.x+Math.sin(an.a)*8,0,an.z+Math.cos(an.a)*8),40);shake(.3)}}],
    ev:[[.25,c=>svSnd('hiss',.9)],[.6,c=>svSnd('whoosh',.7)],[1.1,c=>svSnd('whoosh',.7,1.1)],[1.55,c=>svSnd('whoosh',.7,1.2)],[2.1,c=>svSnd('whoosh',1,.8)]],rec:.6}};
HYDM.fury.ph1only=1;
svReg(1,{name:'Hydra',col:HYD.col,body:3.0,ph2:.55,poise:.17,headJ:'hC',turnA:2.4,edge:4,
  ai:{pref:7,walk:1.3,turn:1.6,rest:[.8,1.5],ph2r:.72,strafe:.25,style:'slither'},
  build:hydBuild,loco:hydLoco,post:hydPost,P:HYDP,M:HYDM,
  stag:[[.3,'stag','o'],[2.1,'stag','l',.02],[2.7,'recC','io']],stagT:2.7,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=typeof HY!='undefined'&&HY.ent!=null?HY.ent:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  dying(e,t){if(t>.6&&t<.7)hydSplash(e.m.position,60)}});
