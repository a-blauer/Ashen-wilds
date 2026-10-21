// ---- hero: skinned humanoid with cape; gear is attached to bones so it moves with the body ----
const HB={pelvis:[null,0,.55,0],spine:['pelvis',0,.65,0],chest:['spine',0,.85,0],neck:['chest',0,1.0,0],head:['neck',0,1.1,0],
 lh0:['pelvis',-.1,.55,0],lh1:['lh0',-.1,.3,.02],lh2:['lh1',-.1,.07,0],rh0:['pelvis',.1,.55,0],rh1:['rh0',.1,.3,.02],rh2:['rh1',.1,.07,0],
 aL0:['chest',-.22,.95,0],aL1:['aL0',-.24,.77,0],aL2:['aL1',-.25,.59,0],aR0:['chest',.22,.95,0],aR1:['aR0',.24,.77,0],aR2:['aR1',.25,.59,0],
 cp0:['chest',0,.95,-.13],cp1:['cp0',0,.68,-.2],cp2:['cp1',0,.42,-.24]};
const HL=[{c:[[0,.5,0],[0,.62,0],[0,.8,0],[0,.95,0],[0,1.03,0]],r:[[.14,.1],[.16,.11],[.19,.12],[.2,.12],[.07,.07]],b:['pelvis','spine','chest','chest','neck'],seg:14,N:24,v:[0,.2]},
 {c:[[0,1.0,0],[0,1.06,0],[0,1.14,0],[0,1.22,0],[0,1.27,0]],r:[[.05,.05],[.09,.1],[.1,.11],[.09,.1],[.01,.01]],b:['neck','head','head','head','head'],seg:14,N:20,v:[.2,.15]},
 {c:[[0,.98,-.13],[0,.7,-.2],[0,.45,-.24],[0,.3,-.25]],r:[[.18,.012],[.2,.014],[.21,.014],[.2,.012]],b:['chest','cp0','cp1','cp2'],seg:10,N:16,v:[.35,.15]}];
[['lh',-.1],['rh',.1]].forEach(a=>HL.push({c:[[a[1],.56,0],[a[1],.3,.02],[a[1],.07,0],[a[1],0,.09]],r:[[.085,.09],[.06,.06],[.045,.045],[.05,.1]],b:[a[0]+'0',a[0]+'1',a[0]+'2',a[0]+'2'],seg:10,N:16,v:[.5,.25]}));
[['aL',-.22],['aR',.22]].forEach(a=>HL.push({c:[[a[1],.97,0],[a[1]*1.09,.78,0],[a[1]*1.14,.6,0],[a[1]*1.14,.54,0]],r:[[.055,.055],[.045,.045],[.04,.04],[.05,.05]],b:[a[0]+'0',a[0]+'1',a[0]+'2',a[0]+'2'],seg:10,N:14,v:[.75,.25]}));
const HSPEC={id:'H',bones:HB,lofts:HL,st:'hero',pal:{dk:[28,20,14],bel:[200,170,90],skin:[217,179,140],cape:[110,26,32],pants:[58,48,42],boot:[24,20,18],nz:.6}};
function buildHero(){
const pl=new THREE.Group();
{
  const mb=mkBones(HSPEC),bones=mb.bones,mesh=new THREE.SkinnedMesh(rigGeo(HSPEC),rigMat(HSPEC,0x2e4a52,''));
  mesh.castShadow=true;mesh.frustumCulled=false;mesh.add(bones.pelvis);pl.add(mesh);pl.mat=mesh.material=mesh.material.clone();mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  const ax=mkAx(HSPEC,bones);pl.bones=bones;pl.ax=ax;pl.legs=[bones.lh0,bones.rh0];pl.arms=[bones.aL0,bones.aR0];pl.torso=bones.spine;pl.gearG=[];
  [-1,1].forEach(s=>{ax('head',RS,0xf4f0e8,s*.04,1.15,.098,.016,.012,.01);ax('head',RS,0x14110e,s*.04,1.15,.108,.009,.009,.006);ax('head',RS,0x2a1c14,s*.04,1.178,.1,.03,.006,.01)});
  ax('head',RS,0xc9976f,0,1.115,.112,.014,.018,.014);
  ax('head',HEM,0x23232e,0,1.15,-.02,.125,.13,.13,-.2,0);
  ax('chest',RS,0xc8a24a,0,.5+.1,.125,.022,.022,.01);
}
(function(){
  const ax=pl.ax,SK=0xd9b38c,cl=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8,side:THREE.DoubleSide});
  [['aL2',-.25],['aR2',.25]].forEach(a=>{[0,1,2,3].forEach(i=>ax(a[0],RB,SK,a[1]+(i-1.5)*.017,.52,.03,.014,.05,.016));ax(a[0],RB,SK,a[1]+(a[1]<0?.04:-.04),.55,.02,.016,.04,.016,0,a[1]<0?-.6:.6)});
  [['lh2',-.1],['rh2',.1]].forEach(a=>{ax(a[0],RTO,0x1a1410,a[1],.13,0,.075,.075,.5,Math.PI/2);ax(a[0],RB,0x120e0b,a[1],.012,.04,.09,.024,.2)});
  ax('spine',RTO,0x1a120c,0,.6,0,.17,.17,.5,Math.PI/2);
  [[-.19,.55,.05],[.19,.55,.05],[0,.52,-.15]].forEach(q=>ax('pelvis',RB,0x4a3320,q[0],q[1],q[2],.07,.08,.05));
  ax('pelvis',new THREE.CylinderGeometry(.17,.25,.22,14,1,true),cl(0x2e4a52),0,.42,0);
  ax('neck',RTO,0xa83a3a,0,1.0,0,.1,.1,.9,Math.PI/2);ax('chest',RB,0xa83a3a,0,.9,-.12,.06,.2,.02);ax('chest',RTO,0x3a5a62,0,.98,0,.14,.14,.6,Math.PI/2);
  [['aL1',-.24],['aR1',.24]].forEach(a=>ax(a[0],RTO,0x4a3320,a[1],.68,0,.05,.05,.8,Math.PI/2));
  [[-.06,1.2,.05],[0,1.22,.07],[.06,1.2,.05],[-.08,1.18,0],[.08,1.18,0]].forEach(q=>ax('head',RC,0x3a2a1a,q[0],q[1],q[2],.04,.09,.04,-.5));
  [-1,1].forEach(s=>{ax('head',RS,SK,s*.105,1.13,0,.02,.03,.015);ax('chest',RS,0xc8a24a,s*.12,.96,.1,.02,.02,.02)});
  ax('head',RB,0x7a3a2a,0,1.08,.108,.03,.006,.006);
})();
return pl;
}
const pl=buildHero();
let combo=0,comboT=0,hstop=0,shk=0;
const shake=a=>{if(SET.shake)shk=Math.max(shk,a)};
function slashFx(d,st,rg){
  const g=new THREE.Group(),col=st==2?0xffe0a0:0xf2ead8,m=new THREE.Mesh(new THREE.RingGeometry(rg*.42,rg*1.02,28,1,st==2?.35:-1.05,st==2?2.4:2.1),addMat(col));
  m.material.opacity=.85;g.add(m);g.position.copy(gY(pl.position,st==2?.15:.85));const yaw=Math.atan2(d.x,d.z);
  if(st==2){m.rotation.y=Math.PI/2;g.rotation.y=yaw;m.position.y=.0}else{m.rotation.x=-Math.PI/2;g.rotation.y=yaw-Math.PI/2;m.rotation.z=0;g.rotation.z=st?-.18:.18}
  scene.add(g);const s0=st==1?-1:1;
  tw(st==2?260:200,k=>{m.material.opacity=.85*(1-k);if(st<2)m.rotation.z=s0*(.6-k*.9);else m.rotation.x=-.4+k*.6;g.scale.setScalar(.85+k*.25)},()=>{scene.remove(g);m.geometry.dispose()});
}
pl.position.set(START[0],0,START[1]);scene.add(pl);
// creatures built from simple shapes
function cr(c){
  if(EN[c.g[0]]&&EN[c.g[0]].hum)return mkHumanoid(EN[c.g[0]].hum);{const rn=rigOf(c.g[0]);if(SPEC[rn]){try{return crRig(c,rn)}catch(e){console.error('rig failed',rn,e)}}}
  const f=c.f,C=c.cl[0],C2=c.cl[1]||C,g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const G=n=>c.g.includes(n),ghost=G('Wispling'),lift=ghost?.45:0,bulk=c.tr=='Bulky'?1.18:1;
  const sp=new THREE.SphereGeometry(.5,24,16),co=new THREE.ConeGeometry(.15,.35,10),cy=new THREE.CylinderGeometry(.05,.07,.3,8).translate(0,-.15,0),bx=new THREE.BoxGeometry(1,1,1);
  const add=(geo,col,x,y,z,sx=1,sy=1,sz=1,rz=0,rx=0)=>{const m=new THREE.Mesh(geo,mt(col));m.position.set(x,y+lift,z);m.scale.set(sx,sy,sz);m.rotation.z=rz;m.rotation.x=rx;m.castShadow=true;b.add(m);return m};
  const SD=[-1,1],wg=(s,...a)=>{const m=add(...a);m.userData={rz:m.rotation.z,sd:s,amp:.5};g.wings.push(m);return m};
  add(sp,C,0,.38,0,(G('Mossfrog')?.75:.55)*bulk,.45*bulk,.7*bulk);
  add(sp,C2,0,.62,.38,.38,.34,.36);add(sp,C2,0,.56,.58,.18,.14,.2);
  SD.forEach(s=>{add(sp,0xf4f0e0,s*.1,.69,.52,.12,.12,.12);add(sp,0x111111,s*.1,.69,.57,.07,.07,.07)});
  if(!ghost&&!G('Gravewyrm')&&!G('Cryptspider'))[[-.2,.22],[.2,.22],[-.2,-.22],[.2,-.22]].forEach(([x,z],i)=>{const m=add(cy,C,x,.28,z,1.1,1,1.1);m.userData.ph=(i==0||i==3)?0:Math.PI;g.legs.push(m)});
  c.g.forEach((n,gi)=>{
    const C=c.cl[gi];
    if(n=='Foxlet'||n=='Ashwolf'){SD.forEach(s=>add(co,C,s*.1,.88,.34));g.tails.push(add(sp,n=='Foxlet'?0xfff2e0:C,0,.45,-.55,.2,.2,.5),add(sp,C,0,.48,-.35,.2,.2,.4));
      if(n=='Ashwolf')for(let i=0;i<4;i++)add(co,0x2a2a32,0,.8-.03*i,.2-.18*i,.5,.8,.5,0,-.3)}
    if(n=='Mossfrog'){SD.forEach(s=>add(sp,C,s*.14,.84,.4,.2,.2,.2));add(sp,0xcfe0a0,0,.32,.2,.4,.3,.3);for(let i=0;i<4;i++)add(sp,0x3a7a2a,(i%2?1:-1)*.25,.55,-.1-.1*i,.08,.08,.08)}
    if(n=='Stoneshell'){add(sp,0x5a6b4a,0,.55,-.05,.64,.42,.8);for(let i=0;i<5;i++)add(co,0x8a8a78,(i-2)*.14,.8,-.05,.4,.5,.4)}
    if(n=='Skyhawk'){SD.forEach(s=>{wg(s,bx,C,s*.5,.5,-.05,.7,.05,.35,s*.5);wg(s,bx,0x2a5a98,s*.8,.58,-.1,.4,.04,.28,s*.7)});add(co,0xf0a030,0,.58,.64,.6,.8,.6,0,Math.PI/2);for(let i=-1;i<2;i++)add(bx,C2,i*.1,.4,-.5,.08,.03,.4)}
    if(n=='Drakelet'){SD.forEach(s=>{add(co,0xffe0a0,s*.1,.88,.34,.8,1.2,.8);wg(s,bx,0x5a2f90,s*.5,.62,-.1,.6,.05,.5,s*.6);wg(s,co,0x3a1a6a,s*.85,.8,-.1,.5,1.4,.5,s*-.9)});g.tails.push(add(sp,C,0,.4,-.55,.16,.16,.5));add(co,0xffe0a0,0,.4,-.85,.7,1,.7,0,-Math.PI/2);for(let i=0;i<3;i++)add(co,0xffe0a0,0,.78,.1-.2*i,.5,.7,.5)}
    if(n=='Batwing'){SD.forEach(s=>{add(co,C,s*.1,.92,.34,1.2,2,1.2);wg(s,bx,0x3a2f4a,s*.55,.55,-.05,.8,.04,.45,s*.4);wg(s,co,0x3a2f4a,s*.95,.5,-.05,.5,1.6,.5,s*-1.1);add(co,0xf4f0e0,s*.05,.5,.64,.3,.5,.3,0,Math.PI)})}
    if(n=='Cryptspider'){add(sp,C,0,.42,-.4,.7,.6,.8);for(let k=0;k<4;k++)SD.forEach(s=>{const lg=wg(s*(k%2?1:-1),bx,0x1a1620,s*.4,.32,(k-1.5)*.16,.5,.04,.04,s*-.6);lg.userData.amp=.25;lg.userData.spd=110;add(bx,0x1a1620,s*.62,.12,(k-1.5)*.16,.04,.3,.04)});SD.forEach(x=>[.62,.7].forEach(y=>add(sp,0xff3030,x*.08,y,.6,.05,.05,.05)))}
    if(n=='Gloomcap'){add(sp,C,0,.9,.1,.8,.35,.8);[[-.2,0],[.2,.1],[0,-.2]].forEach(([x,z])=>add(sp,0xf4f0e0,x,1.07,.1+z,.1,.05,.1));add(sp,0xd8cdb0,0,.3,0,.42,.5,.42)}
    if(n=='Boneling'){for(let i=0;i<3;i++)add(bx,0xe8e0c8,0,.38,.2-.2*i,.62,.05,.06);SD.forEach(s=>add(sp,0x6aff9a,s*.1,.69,.6,.07,.07,.07));for(let i=0;i<5;i++)add(sp,0xe8e0c8,0,.35-i*.02,-.45-.12*i,.12-.01*i,.12-.01*i,.12-.01*i)}
    if(n=='Wispling')for(let i=0;i<3;i++)add(co,C,(i-1)*.15,.15,-.5-.1*i,1.3,2.5,1.3,0,-1.9);
    if(n=='Gravewyrm'){for(let i=1;i<6;i++)g.tails.push(add(sp,C,0,.3-.02*i,-.4*i,.5-.05*i,.4-.04*i,.55-.05*i));SD.forEach(s=>add(co,0xd8d0b8,s*.12,.86,.4,.7,1.1,.7,s*-.3))}
  });
  if(c.tr=='Horned')SD.forEach(s=>add(co,0xe8e0c8,s*.14,.9,.42,.8,1.5,.8,s*-.3));
  if(c.tr=='Spiked')for(let i=0;i<4;i++)add(co,0x3a3a44,0,.8,.2-.2*i,.6,.9,.6);
  if(c.tr=='Armored')[0,-.25].forEach(z=>add(bx,0x6a6a78,0,.66,z,.5*bulk,.07,.28));
  if(c.v=='Ember'){add(co,0xff8a2a,0,.78,-.2,1.1,1.6,1.1);add(co,0xffc040,0,.74,-.35,.8,1.2,.8)}
  if(c.v=='Frost')[-.15,0,.15].forEach(x=>add(co,0xe8fbff,x,.78,-.15,.6,1.1,.6));
  if(c.v=='Shadow')SD.forEach(s=>add(sp,0xff3030,s*.1,.68,.59,.1,.1,.1));
  if(c.v=='Golden')add(new THREE.TorusGeometry(.18,.03,6,14),0xffd84a,0,.83,.36).rotation.x=Math.PI/2;
  if(ghost)b.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.65}});
  g.bs=1.15*(1+.07*f)*c.z;g.scale.setScalar(g.bs);return g;
}

// ---------- animation helpers ----------
const tws=[];function tw(ms,fn,done){tws.push({t:performance.now(),ms,fn,done})}
function animC0(g,now,mv,sp){
  if(g.rig){g.rig(now,mv,sp);return}
  const t=now/(mv?110:400)*(sp?Math.max(1,sp/1.6):1);
  g.legs.forEach(l=>{l.rotation.x=mv?Math.sin(t*1.6+l.userData.ph)*.7:0});
  g.wings.forEach(w=>{const u=w.userData;w.rotation.z=u.rz+Math.sin(now/(u.spd||(mv||g.atk?70:200)))*u.amp*(g.atk?1.4:mv?1:.4)*u.sd});
  g.tails.forEach(tl=>{tl.position.x=Math.sin(now/(mv?120:260)+tl.position.z*3)*(mv?.12:.06)});
  g.b.position.y=mv?Math.abs(Math.sin(t*1.6))*.06:Math.sin(now/350)*.02;
}
const shrink=(g,done)=>tw(500,k=>g.scale.setScalar(g.bs*(1-k)),done);

