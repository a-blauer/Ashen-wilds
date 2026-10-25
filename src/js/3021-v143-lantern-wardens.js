// ================= v143 The Lantern Road (Kindlelight I main quest) — the Lantern Wardens =================
// Seven armoured animal warriors hold a small outpost on the road and guard the Portal Ripper (3022, 3023). They are town-folk
// bodies (2800: the v114 beast engine on the town-folk skeleton, v142 anatomy) wearing the heroes' heavy armour: mdChestO builds
// the plate (cuirass, warplate, wall, hauberk, aegis …) straight onto the folk body's rings, so it fits every species. On top:
//  * mqw143Helm: a steel helm loft over the sculpted skull (ears come out through it), brow band, rivets, nasal, crest, cheek
//    guards, a kettle brim for small-eared species, a plume for the captain; leather cap + goggles for the engineer
//  * mqw143Sigil: the Wardens' lantern sigil (brass cage, glowing heart) on the chest
//  * greaves / vambraces of the hero kit, a teal tabard where the style has none
// Weapons are rigid kits (lgGroup) parented to a bone: a planted polearm / a sword point-down in front / a shield on the forearm;
// slung on the back while walking (the escorts walk beside the Ripper with czWalkPose103).
// Every warden: MQW143.D[key] = {lab (FK137.out label), sp, fur, sc, st (heavy chest style), helm, wpn, sh (shield), pose, n (name)}.
// mqw143Make(key) → THREE.Group with g.bones, g.userData.rest (folk rest), g.userData.mq = {D, pose, wpn, sh, mode}.
// mqw143Anim(g, now, walkPh) poses it every frame: folk rest + guard pose + v93 idle (+ tail and ears), or the walk.
var MQW143={
  steel:0x6e737c,steelD:0x4a4e56,brass:0xb8933e,teal:0x2a6a64,tealD:0x173c3a,leather:0x4a3222,leatherD:0x2e1e14,glow:0xd8ff7a,
  D:{
    captain:{n:'Warden-Captain Harrow',sp:'wolf',fur:1,sc:1.16,st:'aegis',helm:'plume',wpn:'sword',pose:'pommel',shirt:0x2a2e34},
    sergeant:{n:'Sergeant Bristleback',sp:'boar',fur:1,sc:1.14,st:'warplate',helm:'kettle',wpn:'halberd',pose:'pole',shirt:0x3a2e24},
    ironpaw:{n:'Ironpaw',sp:'bear',fur:2,sc:1.2,st:'wall',helm:'kettle',wpn:'maul',pose:'pole',shirt:0x2e2a26},
    rook:{n:'Rook',sp:'hound',fur:1,sc:1.1,st:'hauberk',helm:'cap',wpn:'spear',sh:'round',pose:'pole',shirt:0x34302a},
    thistle:{n:'Thistle',sp:'fox',fur:0,sc:1.06,st:'cuirass',helm:'cap',wpn:'spear',pose:'pole',shirt:0x2e3236},
    vesk:{n:'Vesk',sp:'lynx',fur:0,sc:1.08,st:'cuirass',helm:'cap',wpn:'glaive',sh:'kite',pose:'pole',shirt:0x2a2e2a},
    gearwick:{n:'Old Gearwick',sp:'beaver',fur:0,sc:1.02,st:'mail',helm:'goggles',wpn:'wrench',pose:'tinker',shirt:0x3a3026}}};
// labels for the folk system (species, fur, scale) and the costumes
Object.keys(MQW143.D).forEach(k=>{const D=MQW143.D[k];D.key=k;D.lab='Lantern Warden · '+k;FK137.out[D.lab]={sp:D.sp,fur:D.fur,sc:D.sc};
  FKO[D.lab]=function(o,S,C){return mqw143Outfit(D,S,C)}});

// ---------------- the costume ----------------
function mqw143Outfit(W,S,C){const Q=MQW143,M=Q.steel,A=Q.teal,T=Q.brass;
  const quilt=m=>(Math.floor(m.y*38)+(m.c>0?0:1))%2?W.shirt:mdSh(W.shirt,.82);
  return {
    paint(P){FKG.paint(P,C,{shirt:W.shirt,sleeve:'long',pants:mdSh(W.shirt,.8),legs:'long',patt:quilt,cuffs:Q.leatherD})},
    build(B,P){
      // the heroes' heavy chest on the folk body (plate, pauldrons, faulds, tassets, arm plates)
      const d={a:W.st=='mail'?'heavy':'heavy',sl:'chest',st:W.st,M:W.st=='mail'?0x5a5e66:M,A,T,dk:mdSh(M,.6),lv:2,ti:2,r:1,G:null,R:null};
      try{mdChestO(B,P,d,'warrior')}catch(e){console.warn('v143 warden chest',W.key,e)}
      const k=dkKit();
      // greaves over the shins, sabaton plates over plantigrade feet, knee cops
      try{const legT=S.hoof||(typeof FK142!='undefined'&&FK142.sp&&FK142.sp[S.key]&&FK142.sp[S.key].leg=='digi');
        [-1,1].forEach(s=>{mdLS(B,P,s,3,5,.016,{t:'m',col:m=>m.i<3.3?T:mdSh(M,m.c*s>0?1.05:.85)});
          const L=mdLeg(P,s),kn=L[3]||L[2];k.p(s<0?'lh1':'rh1','hem','m',mdSh(M,1.08),kn.p[0],kn.p[1]+.01,kn.p[2]+(kn.f||kn.rx)*.85,.05,.045,.034,1.35,0,0);
          if(!legT)mdFS(B,P,s,.008,{t:'m',col:m=>m.y<.03?Q.steelD:M})})}catch(e){console.warn('v143 warden legs',W.key,e)}
      // the tabard: teal, brass hem (aegis brings its own)
      if(W.st!='aegis'&&W.st!='mail')try{FKG.skirt(B,P,{y0:.585,hem:th=>.3+.03*Math.cos(th*2),col:fkTrim(Q.tealD,T,{hem:.88}),lin:mdSh(Q.tealD,.6),
          keep:m=>{const th=m.u*Math.PI*2,a=Math.min(th,Math.PI*2-th);return a<.5||Math.abs(th-Math.PI)<.5},flare:.03,folds:[6,.006],rows:5,clear:.012})}catch(e){console.warn('v143 tabard',e)}
      // the engineer: a leather apron over the mail, tool loops, heavy gloves
      if(W.key=='gearwick'){FKG.apron(B,P,Q.leather,{hem:.3,w:1.2,bibTop:.9});FKG.cuff(B,P,4,7,Q.leatherD,.02);
        FKG.pouch(k,P,.57,.9,Q.leatherD);FKG.pouch(k,P,.57,-.9,Q.leatherD);
        const t0=mdTP(P,.58,-.6,(P.tOff||0)+.01);k.L('pelvis','m',0x8a8070,t0,[t0[0]-.01,t0[1]-.16,t0[2]+.02],.008,.006,4)}
      mqw143Sigil(B,P,k,W);
      mqw143Helm(B,P,k,S,W);
      mdKit(B,k)}}}

// the Wardens' sigil: a small brass lantern with a glowing heart, on the chest plate
function mqw143Sigil(B,P,k,W){const y=W.key=='gearwick'?.86:.8,f=mdTorsoAt(P,y).f+(P.tOff||0)+.014,w=mdTorsoW(y),Q=MQW143,E=(g,t,c,x,yy,z,a,b,cc,r1,r2,r3)=>{k.p('chest',g,t,c,x,yy,z,a,b,cc,r1,r2,r3);mdOW(k,w)};
  E('box','m',Q.steelD,0,y,f-.004,.05,.062,.008);E('tor','m',Q.brass,0,y+.04,f,.014,.012,.008,Math.PI/2,0,0);
  E('cone4','m',Q.brass,0,y+.026,f+.002,.024,.014,.01,0,Math.PI/4,0);E('box','m',Q.brass,0,y-.024,f+.002,.03,.008,.012);
  [-1,1].forEach(s=>E('box','m',Q.brass,s*.016,y,f+.004,.005,.044,.006));E('oct','g',Q.glow,0,y,f+.006,.012,.018,.006)}

// ---------------- helms ----------------
// a shell loft over the folk skull rings (D.SN, measured from the v142 sculpt), from the back of the skull to the brow
function mqw143Helm(B,P,k,D,W){const Q=MQW143,st=W.helm;if(!st||!D.SN||!D.EYEP)return;const S=D.SN,E=D.EYEP,z0=S[0][0],z1=E[2]-.012;
  const yMin=E[1]+(st=='goggles'?.012:-.004),tilt=.55,off=st=='goggles'?.007:.011,col=st=='goggles'?Q.leather:Q.steel;
  const R=[];S.forEach(q=>{if(q[0]>=z0-.001&&q[0]<=z1+.001)R.push({p:[0,q[1],q[0]],rx:q[2]+off,f:q[3]+off,b:q[4]+off,w:[['head',1]]})});
  if(R.length<2)return;{const q=R[0];R.unshift({p:[0,q.p[1]+.004,q.p[2]-.012],rx:q.rx*.55,f:q.f*.55,b:q.b*.55,w:q.w})}   // close the dome at the back
  const edge=m=>yMin+tilt*(m.z-z1);
  mdLoft(B,R,{seg:20,ref:[0,1,0],capA:true,t:st=='goggles'?'c':'m',col:m=>{if(m.y<edge(m)+.016)return st=='goggles'?Q.leatherD:Q.brass;if(st!='goggles'&&m.s>.93)return mdSh(col,1.18);return col},keep:m=>m.y>edge(m)});
  const surf=(z,phi,o)=>fkSurf(D,z,phi,o),zm=(z0+z1)/2;
  if(st=='goggles'){// a leather cap with brass goggles pushed up on the brow
    const z=z1-.01,c=surf(z,0,.012);[-1,1].forEach(s=>{const p=surf(z,s*.62,.016);k.p('head','cyl','m',Q.brass,p[0],p[1],p[2]+.004,.024,.012,.024,-.9,0,s*-.55);k.p('head','cyl','g',0x9ad8c8,p[0],p[1]+.004,p[2]+.009,.017,.004,.017,-.9,0,s*-.55)});
    k.p('head','box','c',Q.leatherD,c[0],c[1]-.006,c[2]-.004,.018,.01,.012);return}
  // rivets along the band, a nasal guard, a crest ridge
  for(let i=0;i<9;i++){const ph=-1.45+i*(2.9/8),zz=z1-.01-Math.abs(ph)*.035,p=surf(zz,ph*1.0,off+.002);if(p[1]<edge({z:zz})+.004)continue;k.p('head','sph','m',0xd8c890,p[0],p[1]-.002,p[2],.0045)}
  {const p=surf(z1-.004,.05,off+.004);k.p('head','box','m',mdSh(Q.steel,1.1),0,p[1]-.03,p[2]+.004,.012,.06,.008,.32,0,0)}
  for(let z=z0+.02;z<z1-.01;z+=.014){const p=surf(z,0,off);k.p('head','box','m',st=='plume'?Q.brass:mdSh(Q.steel,1.15),0,p[1]+.004,p[2],.008,.012,.016)}
  // cheek guards hanging below the band (not for the boar's tusks)
  if(D.key!='boar')[-1,1].forEach(s=>{const p=surf(zm+.01,s*1.75,off+.002),n=new THREE.Vector3(p[0],p[1]-brSkullAt(D,zm).yc,0).normalize();
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n),e=new THREE.Euler().setFromQuaternion(q);
    k.p('head','box','m',Q.steel,p[0],p[1]-.024,p[2],.036,.05,.006,e.x,e.y,e.z)});
  if(st=='kettle'){// a broad brim (bears and boars have small ears)
    const q=brSkullAt(D,zm),y=yMin+tilt*(zm-z1)+.004;k.p('head','cyl','m',Q.steel,0,y,zm+.006,(q.rx+off)*1.3,.008,(Math.max(q.f,q.b)+off)*1.24,-.1,0,0);
    k.p('head','tor','m',Q.brass,0,y-.002,zm+.006,(q.rx+off)*1.32,.006,(Math.max(q.f,q.b)+off)*1.26,-.1,0,0)}
  if(st=='plume'){// the captain's horsehair plume falls back from the crest
    const zc=(z0+z1)/2+.01,top=surf(zc,0,off+.01);
    for(let j=-1;j<=1;j++){const pts=[];for(let i=0;i<=6;i++){const u=i/6,z=zc-u*.2,y=top[1]+.03*Math.sin(u*Math.PI*.9)-u*u*.16;pts.push([j*.009,y,z])}
      for(let i=0;i<6;i++)k.L('head','c',j?0x7a1414:0x9a2020,pts[i],pts[i+1],.016*(1-i/8),.016*(1-(i+1)/8),5)}
    k.p('head','box','m',Q.brass,0,top[1]-.002,zc,.016,.014,.03)}}

// ---------------- weapons and shields (rigid kits; the grip is at the origin, the shaft along +y) ----------------
function mqw143Weapon(kind){const Q=MQW143,wood=0x3a2a1c,iron=0x5a5e66,dk=0x2a2a2e;
  return lgGroup('MQW143|'+kind,k=>{
    if(kind=='spear'||kind=='glaive'||kind=='halberd'){const L=kind=='halberd'?2.1:1.95;k.L('','c',wood,[0,-.75,0],[0,L-.75,0],.022,.02,6);
      k.p('','tor','m',Q.brass,0,L-.78,0,.03,.04,.03);k.p('','cone4','m',dk,0,-.77,0,.026,.05,.026,Math.PI);
      for(let i=0;i<3;i++)k.p('','ring','c',Q.leatherD,0,-.05+i*.035,0,.026,.3,.026);
      if(kind=='spear'){k.p('','oct','m',iron,0,L-.6,0,.045,.17,.012);k.p('','box','m',Q.brass,0,L-.73,0,.06,.014,.02);k.S('',Q.teal,.012,L-.76,0,.03,.16,0,0,3)}
      if(kind=='glaive'){const t=L-.75;k.p('','box','m',iron,.03,t+.16,0,.07,.3,.008,0,0,-.12);k.p('','cone4','m',iron,.012,t+.36,0,.04,.12,.008,0,0,-.2);k.p('','box','m',Q.brass,0,t+.02,0,.05,.03,.026)}
      if(kind=='halberd'){const t=L-.75;k.p('','oct','m',iron,0,t+.12,0,.03,.16,.01);k.p('','box','m',iron,.1,t-.02,0,.16,.18,.008);k.p('','box','m',mdSh(iron,1.2),.18,t-.02,0,.02,.2,.01);
        k.p('','cone4','m',iron,-.07,t-.02,0,.025,.1,.008,0,0,Math.PI/2);k.p('','box','m',Q.brass,0,t-.1,0,.04,.04,.03)}}
    if(kind=='maul'){k.L('','c',wood,[0,-.7,0],[0,.75,0],.026,.024,6);k.p('','box','m',iron,0,.82,0,.32,.16,.16);[-1,1].forEach(s=>k.p('','box','m',mdSh(iron,.8),s*.17,.82,0,.03,.18,.18));
      k.p('','box','m',Q.brass,0,.82,0,.1,.17,.17);k.p('','cone4','m',dk,0,.92,0,.04,.08,.04);for(let i=0;i<4;i++)k.p('','ring','c',Q.leatherD,0,-.1+i*.04,0,.03,.3,.03)}
    if(kind=='sword'){// point down: pommel at the top
      k.p('','oct','m',Q.brass,0,.13,0,.03,.035,.03);k.L('','c',Q.leatherD,[0,-.06,0],[0,.11,0],.017,.017,6);k.p('','box','m',Q.brass,0,-.07,0,.2,.03,.035);
      k.p('','box','m',iron,0,-.46,0,.06,.76,.012);k.p('','box','m',mdSh(iron,1.25),0,-.46,0,.012,.74,.016);k.p('','cone4','m',iron,0,-.86,0,.03,.07,.008,Math.PI,Math.PI/4,0);
      k.p('','oct','g',Q.glow,0,-.07,.02,.012,.016,.008)}
    if(kind=='wrench'){k.L('','m',iron,[0,-.18,0],[0,.32,0],.016,.014,6);k.p('','box','m',iron,0,.37,0,.1,.06,.026);k.p('','box','c',0x14100c,.02,.39,0,.04,.04,.03);
      for(let i=0;i<3;i++)k.p('','ring','c',Q.leatherD,0,-.12+i*.04,0,.02,.3,.02)}
    if(kind=='round'){k.p('','cyl','c',wood,0,0,0,.27,.03,.27,Math.PI/2,0,0);k.p('','tor','m',iron,0,0,.002,.28,.035,.28,Math.PI/2,0,0);
      k.p('','cyl','c',Q.teal,0,0,.017,.23,.006,.23,Math.PI/2,0,0);k.p('','hem','m',Q.brass,0,0,.02,.06,.04,.06,Math.PI/2,0,0);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','sph','m',0xd8c890,Math.cos(a)*.2,Math.sin(a)*.2,.022,.008)}}
    if(kind=='kite'){const sh=lgGeoC('mqKite',()=>{const s=new THREE.Shape();s.moveTo(0,.34);s.quadraticCurveTo(.22,.32,.21,.12);s.quadraticCurveTo(.18,-.16,0,-.38);s.quadraticCurveTo(-.18,-.16,-.21,.12);s.quadraticCurveTo(-.22,.32,0,.34);
        const g=new THREE.ExtrudeGeometry(s,{depth:.03,bevelEnabled:false,curveSegments:5});g.translate(0,0,-.015);return g});
      k.p('',sh,'c',wood,0,0,0,1,1,1);k.p('',sh,'c',Q.teal,0,.01,.012,.86,.86,.5);k.p('','box','m',Q.brass,0,.02,.03,.02,.44,.01);k.p('','box','m',Q.brass,0,.12,.03,.24,.02,.01);
      k.p('','oct','g',Q.glow,0,.12,.036,.018,.024,.008)}
  },.12)}

// ---------------- the figure ----------------
// pose offsets added to the folk rest (radians, per bone [x, y, z]); 'pole' holds a planted polearm at the right side,
// 'pommel' rests both paws on a sword planted point-down in front, 'tinker' carries a wrench low in the right paw
var MQW143_POSE={
  pole:{aL0:[0,0,.05],aL1:[-.3,0,-.62],aR0:[.18,0,-.06],aR1:[-.1,.1,.34],aR2:[0,0,0],head:[.04,0,0]},
  pommel:{aL0:[0,0,0],aR0:[0,0,0],aL1:[.05,0,.06],aR1:[.05,0,-.06],head:[.02,0,0]},
  tinker:{aL0:[0,0,.04],aL1:[-.25,0,-.55],aR0:[.05,0,-.04],aR1:[-.08,0,.3],head:[.08,0,0]}};
function mqw143Pose(g,pose){const P=MQW143_POSE[pose]||MQW143_POSE.pole;for(const b in P){const B=g.bones[b];if(!B)continue;B.rotation.x+=P[b][0];B.rotation.y+=P[b][1];B.rotation.z+=P[b][2]}}
// put a rigid kit on a bone so that, in the current pose, it sits at world transform (pos, quat) relative to the figure's group
function mqw143Mount(g,bone,obj,pos,quat){g.updateMatrixWorld(true);const B=g.bones[bone]||g,W=new THREE.Matrix4().compose(pos.clone().applyMatrix4(g.matrixWorld),
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(g.matrixWorld)).multiply(quat),new THREE.Vector3(1,1,1));
  const L=new THREE.Matrix4().copy(B.matrixWorld).invert().multiply(W);L.decompose(obj.position,obj.quaternion,obj.scale);B.add(obj);return obj}
function mqw143Make(key,o){o=o||{};const W=MQW143.D[key];if(!W)throw new Error('v143: no warden '+key);
  const opt={label:W.lab},rig=idlNpcBody(opt),g=new THREE.Group();rig.meshes.forEach(m=>{m.castShadow=true;g.add(m)});g.bones=rig.bones;g.userData.npcO=opt;g.userData.psNo=1;
  g.userData.rest=czRest103(g);const mq={D:W,pose:W.pose,mode:'stand',wpn:null,sh:null,ph:0};g.userData.mq=mq;
  // weapons: placed with the guard pose on, measured from the paws
  mqw143Pose(g,W.pose);g.updateMatrixWorld(true);const V=THREE.Vector3,inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),hp=n=>g.bones[n].getWorldPosition(new V()).applyMatrix4(inv),sc=g.bones.pelvis.scale.x;
  if(W.wpn){const w=mqw143Weapon(W.wpn);mq.wpn=w;
    if(W.pose=='pole'){const h=hp('aR2');h.y-=.02*sc;h.z+=.035*sc;h.x+=.01*sc;mqw143Mount(g,'aR2',w,h,new THREE.Quaternion())}
    else if(W.pose=='pommel'){const a=hp('aL2'),b=hp('aR2'),m=a.add(b).multiplyScalar(.5);m.y+=.04*sc;m.z+=.04*sc;mqw143Mount(g,'aR2',w,m,new THREE.Quaternion())}
    else{const h=hp('aR2');h.y-=.06*sc;h.z+=.03*sc;mqw143Mount(g,'aR2',w,h,new THREE.Quaternion().setFromEuler(new THREE.Euler(.15,0,.25)))}}
  if(W.sh){const s=mqw143Weapon(W.sh);mq.sh=s;const a=hp('aL1'),b=hp('aL2'),m=a.lerp(b,.55);m.x-=.075*sc;m.z+=.03*sc;
    mqw143Mount(g,'aL2',s,m,new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-1.25,0)))}
  czReset103(g);return g}
// every frame: rest → guard pose → idle (stand), or the folk walk with the weapon on the shoulder (walkPh != null)
function mqw143Anim(g,now,walkPh,amp){const mq=g.userData.mq;if(!mq)return;
  if(walkPh!=null){if(mq.mode!='walk'){mq.mode='walk';g._idl=null}czWalkPose103(g,walkPh,amp==null?1:amp);mqw143Pose(g,'walkHold');return}
  if(mq.mode!='stand'){mq.mode='stand';g._idl=null}
  czReset103(g);mqw143Pose(g,mq.pose);try{idlNpc(g,now)}catch(_){}}
// while walking the right paw stays on the weapon (elbow bent, held upright at the side); the left arm swings
MQW143_POSE.walkHold={aR0:[.12,0,-.02],aR1:[.2,.1,-.28]};
