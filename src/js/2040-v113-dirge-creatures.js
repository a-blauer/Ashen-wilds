// ================= v113 The Dirge: Drowned Thrall, Wailing Banshee (II · Drowned Crypts) · Ossuary Colossus, Ossuary Hound (III · Ossuary Fields) =================
// The flooded vaults are haunted by bloated drowned dead dragging their anchors and by banshees wailing over the water;
// on the plains of bones walk giants assembled from a thousand skeletons, and skeletal hounds burning with grave-fire.
(function(){
// ===================================================================== Drowned Thrall =====================================================================
const DR={skin:0x4a625c,skin2:0x34463f,rot:0x2a3424,weed:0x2a4a2a,weed2:0x4a6a2a,barn:0xb8b0a0,iron:0x3a3e44,rust:0x6a3a20,eye:0xa8fff0,cloth:0x2a3436};
function drAnchor(k,bn,x,y,z){// an anchor held by its shank (in the right hand), flukes hanging low
  k.L(bn,'m',DR.iron,[x,y+.04,z],[x,y-.62,z+.03],.03,.03,6);k.p(bn,'ring','m',DR.rust,x,y+.08,z,.06,.5,.06,0,0,Math.PI/2);
  k.p(bn,'box','m',DR.iron,x,y-.5,z+.03,.05,.04,.26);[-1,1].forEach(s=>{k.L(bn,'m',DR.iron,[x,y-.62,z+.03],[x,y-.48,z+.03+s*.22],.03,.022,5);k.p(bn,'cone4','m',DR.rust,x,y-.44,z+.03+s*.25,.04,.09,.02,s*.6)});
  for(let i=0;i<5;i++)k.p(bn,'ring','m',i%2?DR.iron:DR.rust,x,y+.13+i*.05,z,.025,.4,.025,i%2?Math.PI/2:0,0,i%2?0:Math.PI/2)}
n3Def('drowned',{n:'Drowned Thrall',e:'🧟',fam:'Spirit',mt:'p',w:{hp:1.5,pa:1.25,ma:.6,pd:1.1,md:1.0},
 hum:{skin:[106,138,132],tunic:0x2a3436,cape:[40,52,54],pants:[40,52,54],sc:1.4,wpn:'none'},
 moves:['strike','anchorhook','brinewave'],basic:{strike:'dr_swing'},stance:{sx:.15,hx:-.1,sy:-.1},
 body(B,P,k){const C=DR;P.build=2;P.belly=.2;P.af=1.25;P.lf=1.2;P.head={w:1.1,jaw:1.1,top:.92};
  Object.assign(P.col,{skin:C.skin,torso:C.skin,sleeve:C.cloth,fore:C.skin,hand:C.skin2,pants:C.cloth,shin:C.skin,boot:C.skin2,sole:C.rot,belt:C.iron,neck:C.skin});
  // bloated waterlogged flesh, blotched with rot and clumps of barnacles, rags of a sailor's shirt
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,12,8),r=n3Nz(m.x,m.y,m.z,8);if(r>.95)return C.barn;if(n>.72)return C.rot;if(!part&&m.y>.7&&m.s<.3&&Math.abs(m.c)>.3)return C.cloth;if(n<.28)return C.skin2;return C.skin});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.eye,brow:false,ears:false,nose:false,mouth:0x101a18,noHair:true,headCol:m=>{const n=n3Sn(m.x,m.y,m.z,16,2);return n>.7?C.rot:n<.3?C.skin2:C.skin}});
  // a slack jaw, strands of seaweed hair, a chain round the neck and torso
  const z=y=>mdHeadZ(P,y);k.p('head','box','c',0x0a1210,0,1.07,z(1.07),.05,.03,.012);for(let i=0;i<4;i++)k.p('head','box','c',C.barn,-.03+i*.02,1.085,z(1.085)+.002,.007,.012,.004);
  for(let i=0;i<9;i++){const a=-2+i*.5,p=[Math.sin(a)*.1,1.22,Math.cos(a)*.09];k.S('head',i%2?C.weed:C.weed2,p[0],p[1],p[2],.025,.25+(i%3)*.08,a,-.2,i)}
  for(let i=0;i<10;i++){const a=i/10*6.283,p=n3Surf(P,.97,a,.012);k.p('chest','ring','m',i%2?C.iron:C.rust,p[0],p[1],p[2],.022,.4,.022,0,a,i%2?Math.PI/2:0)}
  for(let i=0;i<9;i++){const t=i/8,a=-1.2+t*2.6,y=.95-t*.35,p=n3Surf(P,y,a,.016);k.p(n3TB(y),'ring','m',i%2?C.iron:C.rust,p[0],p[1],p[2],.022,.4,.022,0,a,i%2?Math.PI/2:0)}
  // barnacle clusters on the shoulders and back, weed hanging off the arms
  for(let i=0;i<14;i++){const y=.7+n3Nz(i,3,1)*.32,a=Math.PI+(n3Nz(i,1,3)-.5)*3,p=n3Surf(P,y,a,0);k.p(n3TB(y),'cone','c',C.barn,p[0],p[1],p[2],.022,.03,.022,Math.cos(a)*1.4,0,Math.sin(a)*1.4)}
  [-1,1].forEach(s=>{for(let i=0;i<3;i++){const q=n3ArmAt(P,s,.4+i*.5);k.S(q[3],i%2?C.weed:C.weed2,q[0]+s*.05,q[1],q[2],.03,.2,s*1.5,0,i+3)}});
  drAnchor(k,'aR2',P.bones.aR2[1]+.01,P.bones.aR2[2]-.06,P.bones.aR2[3]+.02);mdLoin(B,P,C.cloth,0x1a2426);
 },
 bfx(e,a){const p=gY(e.m.position,.8).addScaledVector(a.d,1.5);burst(p,0x5a8a8a,14,1.6,1,.45);burst(p,0x1a2a2a,8,1,.6,.5);n3Shake(e.m.position,.05)}});
// anchor swing: a heavy one-armed sweep of the anchor on its chain
n3Hum('dr_swing',[[.6,{sy:.8,py:.3,sx:-.1,ax:-1.6,az:1.3,ex:-.4,lx:-.5,lz:-.3,le:-.6,lh:-.1,rk:.25,dy:-.03}],[1,{sy:.95,py:.36,az:1.45}],
  [1.42,{sy:-.5,py:-.3,sx:.3,ax:-1.5,az:-.4,ex:-.1,lh:-.3,rh:.25,lk:.4,dy:-.08,Bz:.15}],[1.8,{sy:-.85,py:-.42,ax:-1.1,az:-.9,Bz:.12}],[2.5,{sy:-.2,py:-.1,sx:.1,ax:-.5,az:-.2,ex:-.4,lx:-.2,lz:0,le:-.4,lh:0,rh:0,lk:.05,dy:-.02,Bz:0}]]);
// anchor hook: whirls the anchor overhead and hurls it on its chain
n3Hum('dr_hook',[[.35,{sy:.3,ax:-2.6,az:.6,ex:-.4,lx:-.8,le:-.6,sx:-.15}],[.65,{sy:.6,ax:-2.9,az:1.2,ex:-.3}],[.9,{sy:.9,py:.3,ax:-2.4,az:.5,ex:-1.1,sx:-.2,rk:.3}],
  [1.08,{sy:-.45,py:-.25,sx:.3,ax:-1.4,az:-.05,ex:-.05,lx:-.3,lz:.2,le:-.9,lh:-.3,rh:.2,lk:.4,dy:-.06}],[1.8,{sy:-.3,ax:-1.2,ex:-.4,sx:.15,lk:.2}],[2.4,{sy:.2,py:.1,sx:-.1,ax:-1.1,ex:-.8,rk:.2,lk:0}],
  [2.8,{sy:0,py:0,sx:0,ax:-.4,az:0,ex:-.4,lx:0,lz:0,le:-.3,lh:0,rh:0,rk:0,dy:0}]]);
// brine surge: doubles over and heaves a wave of black water out of itself
n3Hum('dr_retch',[[.6,{sx:-.3,hx:-.3,ax:-.6,lx:-.6,az:.4,lz:-.4,ex:-1.2,le:-1.2,By:.04}],[1,{sx:-.35,hx:-.35,By:.05}],[1.18,{sx:.75,hx:.35,ax:-.2,lx:-.2,ex:-.6,le:-.6,lk:.45,rk:.45,dy:-.08,By:0,Bz:.12}],
  [1.9,{sx:.7,hx:.3}],[2.5,{sx:.1,hx:0,ax:-.3,lx:-.3,az:0,lz:0,ex:-.4,le:-.4,lk:.1,rk:.1,dy:-.02,Bz:0}]]);
n3Mv('anchorhook',{nm:'Anchor Hook',ic:'⚓',an:'dr_hook',rmin:2.4,rmax:8,wind:.95,act:.5,rec:.9,cd:5.2,dmg:1.15,sh:'circle',r:1.6,at:'tg',
 x6:{rel(e,a){const g=new THREE.Group(),an=new THREE.Mesh(n3Geo('spike'),n3Mat(DR.iron,{metalness:.6,roughness:.5}));an.scale.set(.35,.6,.35);an.rotation.x=Math.PI;g.add(an);g.userData.spin=an;
    a.ag=g;s6Lob(g,kqHand(e,V()),a.tp,2.2,a.M.act*1000,null,0x6a7a7a);a.ch=[];for(let i=0;i<10;i++){const r=new THREE.Mesh(n3Geo('box'),n3Mat(i%2?DR.iron:DR.rust,{metalness:.5}));r.scale.set(.07,.07,.12);r.userData.lpsSkip=1;scene.add(r);a.ch.push(r)}},
  tick(e,a,ph,k){if(a.ch){const A=kqHand(e,V()),Bp=a.ag&&a.ag.parent?a.ag.position:(a.hk||gY(a.tp,.2));a.ch.forEach((r,i)=>{const t=(i+.5)/10;r.position.copy(A).lerp(Bp,t);r.position.y-=Math.sin(Math.PI*t)*.4;r.lookAt(Bp)})}},
  land(e,a){const p=a.tp.clone();a.hk=gY(p,.2);burst(gY(p,.3),0x8a9a9a,20,1.6,1.2,.45);n3Chunks(gY(p,.2),0x4a4a40,5,2,4,.12);fxCracks(gY(p,0),0x1a1a14,6,1.4,600);n3Snd(p,'brk',.7);
   if(s6InC(a,p,1.6)){s6Hit(e,a,1.15);if(n3Me(a)){s6Deb(a,'Chained','⛓️',{mspd:-.55},2200,'Chained to the anchor: −55% move speed');
     // the chain drags you back toward the thrall
     n3Later(.15,()=>n3Pull({tg:pl},e.m.position,Math.max(0,d2(pl.position,e.m.position)-1.8),420,1.6))}}
   n3Later(.7,()=>{if(a.ch){a.ch.forEach(r=>scene.remove(r));a.ch=null}})},
  end(e,a){if(a.ch){a.ch.forEach(r=>scene.remove(r));a.ch=null}}}});
n3Mv('brinewave',{nm:'Brine Surge',ic:'🌊',an:'dr_retch',rmin:0,rmax:4,wind:.8,act:.6,rec:.65,cd:5,dmg:.75,sh:'cone',r:4.4,ang:.6,mt:'m',
 x6:{tick(e,a,ph,k){if(ph==0&&k>.5&&Math.random()<.4)burst(gY(e.m.position,1.3*e.m.bs),0x1a2a2a,1,.2,-.2,.4);
   if(ph==1&&Math.random()<.95){const o=gY(e.m.position,1.25*e.m.bs).addScaledVector(a.d,.4);fxStream(o,a.d,k<.5?0x1a2a2a:0x3a6a6a,2,4.4,.5,500,'sph',.24)}},
  rel(e,a){fxWaves(gY(e.m.position,.4),a.d,0x5a9a9a,4,4.6,560,.6);n3Snd(e.m.position,'hiss',.7)},
  land(e,a){if(s6InCone(a,a.o,a.d,4.4,.6)){s6Hit(e,a,.75,'m');n3Shove(a,e.m.position,2.4,320);s6Deb(a,'Waterlogged','🌊',{mspd:-.3,as:-.15},3500,'Soaked: −30% move speed, −15% attack speed')}
   const q=e.m.position.clone().addScaledVector(a.d,2.6);if(s6Free(q.x,q.z))s6Pool(e,q,1.6,0x1a3a3a,3000,.12,null)}}});

// ===================================================================== Wailing Banshee =====================================================================
const BN={glow:0xa8e8ff,pale:0xd8f0f8,dark:0x3a5a6a,eye:0xe8ffff,hair:0xc8d8e0};
n3Def('banshee',{n:'Wailing Banshee',e:'👻',fam:'Spirit',mt:'m',ranged:1,w:{hp:.9,pa:.4,ma:1.35,pd:.75,md:1.3},
 rig:{name:'Banshee',base:'Wispling',col:0x7aa8c0,sc:1.4,spit:BN.glow,noBaseKit:true,
  kit(k,c,C,red){
   // a tattered pale hood, inside it a gaunt wailing face with hollow glowing eyes and a gaping mouth; long drifting hair; skeletal hands
   k.p('head','hood','c',0x7a8e9a,0,.83,-.01,.185,.35,.195);k.p('head','sph','c',0x0a1218,0,.98,.0,.115,.125,.1);
   k.p('head','sph','c',0xb8c8d0,0,.975,.05,.07,.088,.055);k.p('head','sph','c',0x050a0e,0,.935,.095,.026,.045,.02);
   [-1,1].forEach(s=>{k.p('head','sph','c',0x050a0e,s*.028,1.0,.09,.02,.018,.012);k.p('head','sph','g',red?0xff2a2a:BN.eye,s*.028,1.0,.1,.009,.008,.005);k.p('head','box','c',0x8a9aa4,s*.045,.955,.08,.01,.05,.01,0,0,s*.2)});
   for(let i=0;i<11;i++){const a=-1.5+i*.3;k.L('head','c',i%2?BN.hair:0x9aaab4,[Math.sin(a)*.13,1.07,Math.cos(a)*.1-.04],[Math.sin(a)*.2,.62-n3Nz(i,2,1)*.18,Math.cos(a)*.06-.14],.016,.003,4)}
   for(let i=0;i<7;i++){const a=-1.2+i*.4;k.S('chest',i%2?0x8aa0b0:0x6a8090,Math.sin(a)*.16,.86,Math.cos(a)*.12-.04,.05,.35+(i%3)*.08,a,.1,i)}
   ['fl2','fr2'].forEach((b,j)=>{const s=j?1:-1;k.p(b,'sph','c',0xc8d4da,s*.225,.575,.09,.025,.02,.03);for(let f=0;f<4;f++)k.L(b,'c',0xd8e4ea,[s*.225+(f-1.5)*.014,.565,.1],[s*.24+(f-1.5)*.022,.44,.16],.007,.002,3)});
   k.p('chest','oct','g',BN.glow,0,.74,.06,.04,.05,.03);
  }},
 moves:['spit','banwail','soulgrasp']});
// mourning wail: drifts back and up, arms spread, and screams
n3Cr('bn_wail',[[.6,{nk:-.4,hd:-.4,ex:.12,Brx:-.25,By:.25,Bz:-.15}],[1,{nk:-.5,hd:-.5,jw:.5,ex:.15,Brx:-.3,By:.32,Bz:-.2}],[1.12,{nk:.25,hd:.3,jw:1.1,ex:0,Brx:.15,By:.2,Bz:0}],[1.95,{nk:.2,jw:1.0}],[2.5,{nk:0,hd:0,jw:0,Brx:0,By:0,Bz:0}]]);
// soul grasp: reaches out and clenches, pulling at your soul from afar
n3Cr('bn_grasp',[[.6,{nk:.2,Brx:.25,Bz:.15,By:.1}],[1,{nk:.3,hd:.2,Brx:.32,Bz:.22,By:.12}],[1.2,{nk:-.3,hd:-.2,jw:.6,Brx:-.2,Bz:-.12,By:.25}],[1.9,{nk:-.25,Brx:-.18}],[2.4,{nk:0,hd:0,jw:0,Brx:0,Bz:0,By:0}]]);
n3Mv('banwail',{nm:'Mourning Wail',ic:'😭',an:'bn_wail',rmin:0,rmax:5,wind:.85,act:.75,rec:.55,cd:5,dmg:.45,sh:'circle',r:5.2,at:'self',mt:'m',
 x6:{rel(e,a){n3Snd(e.m.position,'hiss',.9);x5emo('😭',gY(e.m.position,2),700,(k,s)=>{s.position.y+=.01;s.material.opacity=1-k},.6)},
  land(e,a){},tick(e,a,ph,k){if(ph!=1)return;[0,.3,.6].forEach((h,i)=>{if(k>=h&&!a['w'+i]){a['w'+i]=1;n3Shock(e,a,e.m.position.clone(),5.2,i%2?BN.pale:BN.glow,560,.45,'m',t=>{if(t===pl)s6Deb(a,'Despair','😭',{paP:-.2,maP:-.2},5000,'Despair: −20% damage')},.9);
     fxWaves(gY(e.m.position,1.2),a.d,BN.glow,1,5,560,3.14)}})}}});
n3Mv('soulgrasp',{nm:'Soul Grasp',ic:'🫳',an:'bn_grasp',rmin:0,rmax:9,wind:1.0,act:.8,rec:.6,cd:6,dmg:.4,sh:'circle',r:1.8,at:'tg',mt:'m',
 x6:{start(e,a){a.sg=fxSigil(a.tp,BN.glow,1.7,(a.M.wind+a.M.act)*1000+200,5)},
  tick(e,a,ph,k){const t=s6T(a);if(ph==0&&k<.6&&t){n3Aim(a,t.position);if(a.sg)a.sg.position.copy(gY(a.tp,.06))}
   if(ph==1){if(!a.hd){a.hd=1;for(let i=0;i<6;i++){const an=i/6*6.283,q=V(a.tp.x+Math.cos(an)*.9,0,a.tp.z+Math.sin(an)*.9);
       x5('cone',BN.pale,900,(kk,m)=>{const u=kk<.3?kk/.3:kk>.75?1-(kk-.75)/.25:1;m.scale.set(.09,1.1*u,.09);m.position.set(q.x+Math.cos(an)*(-.3*u),GH(q.x,q.z),q.z+Math.sin(an)*(-.3*u));m.material.opacity=.85*u},{p:q.clone(),r:[Math.sin(an)*-.5,0,Math.cos(an)*.5]})}
      n3Snd(a.tp,'hiss',.6)}
     if(!a.hit&&k>.3){a.hit=1;if(s6InC(a,a.tp,1.8)){s6Hit(e,a,.4,'m');s6Dot(e,a,.12,3,.5,BN.glow,'Soul-drained');if(s6T(a)===pl){s6Deb(a,'Grasped','🫳',{mspd:-1},900,'Held by spectral hands (dash out)');
       for(let i=0;i<6;i++)n3Later(i*.08,()=>x5('oct',BN.glow,420,(kk,o)=>{o.position.copy(gY(pl.position,1).lerp(gY(e.m.position,1.2*e.m.bs),kk));o.position.y+=Math.sin(kk*Math.PI)*.5;o.scale.setScalar(.12)},{p:gY(pl.position,1)}));
       if(!e.mir){const h=Math.round(M(e.c)*.1);e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#a8e8ff',-10)}}}}}}}});

// ===================================================================== Ossuary Colossus =====================================================================
const CO={bone:0x968c74,bone2:0x6e6652,dark:0x3e3a2e,eye:0x7aff9a,fire:0x5aff7a,iron:0x3a3a38};
n3Def('colossus',{n:'Ossuary Colossus',e:'💀',fam:'Spirit',mt:'p',w:{hp:1.85,pa:1.35,ma:.8,pd:1.5,md:1.1},
 hum:{skin:[200,190,164],tunic:0x5a5444,cape:[90,84,68],pants:[90,84,68],sc:1.8,wpn:'none'},
 moves:['strike','bonequake','skullbarrage'],basic:{strike:'co_smash'},stance:{sx:.12,hx:-.1},
 body(B,P,k){const C=CO;mdSkel(B,P,C.bone,C.eye);
  // limbs doubled up with extra bones lashed alongside
  [-1,1].forEach(s=>{const A=n3ArmAt(P,s,0),Bv=n3ArmAt(P,s,1),Cv=n3ArmAt(P,s,1.95);k.L(A[3],'c',C.bone2,[A[0]+s*.03,A[1]-.03,A[2]+.02],[Bv[0]+s*.03,Bv[1]+.03,Bv[2]+.02],.05,.042,6);k.L(Bv[3],'c',C.bone2,[Bv[0]+s*.025,Bv[1]-.03,Bv[2]+.02],[Cv[0]+s*.02,Cv[1]+.04,Cv[2]+.02],.045,.04,6);
    const l=s<0?'lh':'rh',H=P.bones[l+'0'],K=P.bones[l+'1'],F=P.bones[l+'2'];k.L(l+'0','c',C.bone2,[H[1]+s*.03,H[2]-.04,H[3]+.02],[K[1]+s*.03,K[2]+.04,K[3]+.02],.06,.05,6);k.L(l+'1','c',C.bone2,[K[1]+s*.025,K[2]-.04,K[3]+.02],[F[1]+s*.02,F[2]+.05,F[3]+.02],.052,.045,6);k.p(l+'1','sph','c',C.bone,K[1],K[2],K[3]+.04,.055)});
  // a giant built from a thousand bones: a heaped torso of fused ribcages and skulls, skulls on the shoulders, a femur club
  for(let i=0;i<8;i++){const y=.64+i*.045,r=.15+Math.sin(i/7*Math.PI)*.045;k.p(n3TB(y),'ring','c',i%2?C.bone:C.bone2,0,y,.0,r,.22,r*.72)}
  for(let i=0;i<12;i++){const y=.6+n3Nz(i,1,7)*.42,a=n3Nz(i,4,2)*6.283,r=.2+Math.sin((y-.6)/.42*Math.PI)*.06;k.p(n3TB(y),'sph','c',i%2?C.bone:C.bone2,Math.sin(a)*r,y,Math.cos(a)*r*.75,.045,.05,.05);
    k.p(n3TB(y),'box','c',0x0a0a08,Math.sin(a)*(r+.035),y+.005,Math.cos(a)*(r+.035)*.75,.012,.012,.012)}
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',A=P.bones[a];k.p(a,'sph','c',C.bone,A[1]+s*.04,A[2]+.06,A[3],.085,.09,.09);k.p(a,'box','c',0x080806,A[1]+s*.04,A[2]+.05,A[3]+.078,.045,.018,.012);
    [-1,1].forEach(t=>k.p(a,'box','g',C.eye,A[1]+s*.04+t*.025,A[2]+.07,A[3]+.085,.012,.008,.004));for(let i=0;i<4;i++)k.p(a,'cone4','c',C.bone2,A[1]+s*(.06+i*.02),A[2]+.12,A[3]-.05+i*.03,.015,.08,.015,-.3,0,-s*.5)});
  // a crown of bone spikes and green grave-fire in the chest
  for(let i=0;i<7;i++){const a=-1.3+i*.43;k.p('head','cone4','c',C.bone2,Math.sin(a)*.08,1.26,Math.cos(a)*.07-.01,.016,.12,.016,-Math.cos(a)*.35,0,Math.sin(a)*.35)}
  k.p('chest','oct','g',C.fire,0,.85,.0,.07,.1,.06);k.p('chest','sph','g',0x2ae05a,0,.83,0,.1,.12,.08);
  // the club: a giant's thigh bone with bone shards lashed to the head
  const W=P.bones.aR2,x=W[1]+.01,y=W[2]-.06,z=W[3]+.02;k.L('aR2','c',C.bone,[x,y+.06,z],[x,y-.5,z+.05],.035,.05,7);k.p('aR2','sph','c',C.bone,x,y-.55,z+.05,.09,.08,.08);k.p('aR2','sph','c',C.bone2,x,y+.08,z,.05,.045,.05);
  for(let i=0;i<5;i++){const a=i/5*6.283;k.p('aR2','cone4','c',C.bone2,x+Math.cos(a)*.07,y-.55,z+.05+Math.sin(a)*.07,.02,.12,.02,Math.sin(a)*1.4,0,-Math.cos(a)*1.4)}
  k.p('aR2','ring','c',CO.iron,x,y-.42,z+.04,.06,.3,.06);mdLoin(B,P,C.dark,0x2a2a20,.4);
 },
 bfx(e,a){const p=gY(e.m.position,0).addScaledVector(a.d,1.8);n3Flash(p,CO.fire,1.2,320);burst(gY(p,.3),CO.bone,12,1.6,1.2,.45);n3Chunks(gY(p,.2),CO.bone2,3,2,4,.1);n3Shake(p,.06)}});
// smash: an overhead blow with the femur club that drives into the ground
n3Hum('co_smash',[[.6,{sy:.35,py:.15,sx:-.25,ax:-3.0,az:.25,ex:-.9,lx:-1.0,le:-.6,hx:-.15,rk:.2}],[1,{sy:.4,sx:-.3,ax:-3.1,ex:-1.0}],
  [1.42,{sy:-.1,py:-.05,sx:.55,ax:-.65,az:0,ex:-.05,lx:-.5,le:-.5,hx:.15,lh:-.4,rh:.3,lk:.6,rk:.3,dy:-.12,Bz:.15}],[1.85,{sx:.58,ax:-.55,dy:-.13}],
  [2.5,{sy:0,py:0,sx:.15,ax:-.5,ex:-.4,lx:-.2,le:-.3,hx:0,lh:-.1,rh:.05,lk:.15,rk:.05,dy:-.03,Bz:0}]]);
// ossuary quake: both fists high, then hammers the ground; bones burst up across a widening arc
n3Hum('co_quake',[[.55,{sx:-.25,ax:-2.6,lx:-2.6,az:.4,lz:-.4,ex:-.9,le:-.9,hx:-.2}],[1,{sx:-.4,ax:-3.05,lx:-3.05,az:.25,lz:-.25,ex:-.5,le:-.5,hx:-.3,By:.1}],
  [1.6,{sx:.8,ax:-.45,lx:-.45,az:.05,lz:-.05,ex:-.05,le:-.05,hx:.25,lh:-.5,rh:.35,lk:.95,rk:.65,dy:-.2,By:-.04}],[2.3,{sx:.76,dy:-.19,By:0}],[2.75,{sx:.25,ax:-.5,lx:-.5,ex:-.4,le:-.4,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// skull barrage: tears skulls from its own chest and hurls them, one, two, three
n3Hum('co_throw',[[.5,{sy:-.3,sx:.2,ax:-.9,az:-.5,ex:-1.8,lx:-1.2,le:-.8}],[1,{sy:.7,py:.25,sx:-.15,ax:-2.8,az:.4,ex:-1.4}],[1.15,{sy:-.4,py:-.2,sx:.3,ax:-1.4,ex:-.1,lk:.35}],
  [1.3,{sy:.6,py:.2,sx:-.1,ax:-2.7,ex:-1.3,lk:.1}],[1.48,{sy:-.45,py:-.2,sx:.3,ax:-1.4,ex:-.1,lk:.35}],[1.63,{sy:.6,py:.2,sx:-.1,ax:-2.7,ex:-1.3,lk:.1}],[1.82,{sy:-.5,py:-.25,sx:.35,ax:-1.3,ex:-.1,lk:.4}],
  [2.5,{sy:0,py:0,sx:.05,ax:-.4,az:0,ex:-.4,lx:-.2,le:-.3,lk:0}]]);
n3Mv('bonequake',{nm:'Ossuary Quake',ic:'🦴',an:'co_quake',rmin:0,rmax:5,wind:1.05,act:.8,rec:.8,cd:5,dmg:1.2,sh:'cone',r:6,ang:.7,
 x6:{tick(e,a,ph,k){if(ph!=1)return;if(!a.sl){a.sl=1;const p=e.m.position.clone().addScaledVector(a.d,1.4);n3Flash(p,CO.fire,1.8,400);n3Chunks(gY(p,.2),CO.bone2,6,3,6,.12);n3Shake(p,.16);n3Snd(p,'boom',.8)}
   const n=Math.floor(k*5);for(;(a.sn|0)<=n&&(a.sn|0)<5;a.sn=(a.sn|0)+1){const j=a.sn,R=1.6+j*1.0,cnt=3+j*2;
     for(let i=0;i<cnt;i++){const an=-.6+1.2*(i+.5)/cnt,d=s6Rot(a.d,an),q=a.o.clone().addScaledVector(d,R);if(!s6Free(q.x,q.z))continue;
       n3Spike(q,i%2?CO.bone:CO.bone2,s6R(.7,1.2),.15,.8,{geo:i%3?'spike':'bone',tx:d.z*.4,tz:-d.x*.4});burst(gY(q,.2),CO.fire,2,.4,.8,.35)}
     const t=s6T(a);if(!a.hit&&t){const dd=d2(t.position,a.o);if(Math.abs(dd-R)<.75&&s6InCone(a,a.o,a.d,6,.7)){a.hit=1;s6Hit(e,a,1.2);s6Deb(a,'Impaled','🦴',{mspd:-.4},2000,'Bone splinters: −40% move speed')}}}}}});
n3Mv('skullbarrage',{nm:'Skull Barrage',ic:'💀',an:'co_throw',rmin:2.6,rmax:10,wind:.95,act:.9,rec:.6,cd:5.4,dmg:.75,sh:'circle',r:1.5,at:'tg',mt:'m',
 x6:{start(e,a){a.sp=[a.tp.clone()];for(let i=0;i<2;i++){const an=s6R(0,6.283),q=V(a.tp.x+Math.cos(an)*1.7,0,a.tp.z+Math.sin(an)*1.7);if(s6Free(q.x,q.z)){a.sp.push(q);s6Tel(a,q,1.3)}}},
  tick(e,a,ph,k){if(ph!=1)return;[.12,.46,.8].forEach((h,i)=>{if(k>=h&&!a['t'+i]&&a.sp[i]){a['t'+i]=1;const q=a.sp[i],g=new THREE.Group(),sk=new THREE.Mesh(n3Geo('sph'),n3Mat(CO.bone));sk.scale.set(.3,.28,.32);g.add(sk);
     const ey=new THREE.Mesh(n3Geo('sph'),addMat(CO.fire));ey.scale.setScalar(.42);g.add(ey);g.userData.spin=sk;
     s6Lob(g,kqHand(e,V()),q,2.4,560,()=>{ey.material.dispose();n3Flash(q,CO.fire,1.4,380);burst(gY(q,.3),CO.fire,22,1.8,1.6,.5);n3Chunks(gY(q,.2),CO.bone,4,2,5,.1);n3Snd(q,'boom',.5);
       if(s6InC(a,q,1.4)){s6Hit(e,a,.75,'m');s6Dot(e,a,.08,3,1,CO.fire,'Grave-fire')}s6Pool(e,q,1.1,0x3ae05a,2200,.1,null)},CO.fire)}})},
  end(e,a){n3Later(.7,()=>s6TelRm(a))}}});

// ===================================================================== Ossuary Hound =====================================================================
const OH={bone:0x968c74,fire:0x5aff7a,fire2:0x2ad04a};
n3Def('bonehound',{n:'Ossuary Hound',e:'🐕',fam:'Spirit',mt:'p',w:{hp:1.0,pa:1.3,ma:.9,pd:.95,md:1.0},
 rig:{name:'BoneHound',base:'Boneling',col:0x8a8270,sc:1.45,
  kit(k,c,C,red){
   // grave-fire burning in the eye sockets, the chest and along the spine
   const P=boneP;[-1,1].forEach(s=>k.p('head','sph','g',red?0xff2a2a:OH.fire,...P([s*.05,.72,.6]),.02,.016,.016));
   k.p('chest','oct','g',OH.fire,...P([0,.5,.2]),.05,.07,.05);k.p('chest','sph','g',OH.fire2,...P([0,.5,.2]),.07,.08,.07);
   [['chest',.2],['chest',.08],['spine',-.04],['spine',-.14],['pelvis',-.24]].forEach((q,i)=>k.p(q[0],'cone4','g',i%2?OH.fire:OH.fire2,...P([0,.66,q[1]]),.02,.12,.02,-.3));
   [-1,1].forEach(s=>k.L('head','c',0xd8d0b8,P([s*.04,.76,.5]),P([s*.1,.86,.42]),.016,.004,4));
  }},
 moves:['bite','marrowbite','ghastflame'],
 bfx(e,a){const p=gY(e.m.position,.6).addScaledVector(a.d,1.1);fxJaws(p,OH.fire,.6,240,Math.atan2(a.d.x,a.d.z));burst(p,OH.fire,8,1,.6,.35)}});
// marrow rend: a lunge and two savage bites, shaking its head
n3Cr('oh_rend',[[.5,{nk:-.35,hd:-.3,jw:.3,fh:-.2,hk:.5,by:-.08,tl:-.3,Bz:-.1}],[1,{nk:-.4,hk:.6,by:-.1,Bz:-.12}],[1.25,{nk:.5,hd:.4,jw:1.0,fh:-.6,hh:.4,by:-.02,Bz:.3}],[1.35,{jw:.05}],
  [1.55,{nk:.2,hd:.1,jw:.8,sp:.4}],[1.72,{nk:.55,hd:.45,jw:.05,sp:-.4,Bz:.35}],[2.0,{nk:.3,sp:0,jw:.1}],[2.5,{nk:0,hd:0,jw:0,fh:0,hh:0,hk:0,by:0,tl:0,Bz:0}]]);
// ghastfire breath: lowers its head, the fire in its chest swells, then it breathes a cone of green flame
n3Cr('oh_breath',[[.6,{nk:-.3,hd:-.2,ex:.12,by:-.04,fh:-.1}],[1,{nk:-.35,ex:.14}],[1.1,{nk:.25,hd:.15,jw:.9,ex:0,by:-.06,Bz:.06}],[1.9,{nk:.2,jw:.85}],[2.4,{nk:0,hd:0,jw:0,by:0,fh:0,Bz:0}]]);
n3Mv('marrowbite',{nm:'Marrow Rend',ic:'🦴',an:'oh_rend',rmin:0,rmax:3.6,wind:.6,act:.7,rec:.55,cd:4,dmg:.75,sh:'line',w:1.4,l:3.8,
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(2.4,Math.max(.3,d2(a.o,a.tp)-1.1))))},
  tick(e,a,ph,k){if(ph!=1)return;if(k<.3)n3Glide(e,a.o,a.to,ATK_E.out(k/.3));[.3,.75].forEach((h,i)=>{if(k>=h&&!a['b'+i]){a['b'+i]=1;const p=gY(e.m.position,.6).addScaledVector(a.d,1.2);fxJaws(p,OH.fire,.8,260,Math.atan2(a.d.x,a.d.z)+(i?.4:-.4));burst(p,OH.bone,10,1,.8,.35);n3Snd(p,'stab',.6);
   if(s6InCone(a,e.m.position,a.d,2,.7)){s6Hit(e,a,.75);if(i)s6Dot(e,a,.1,4,1,0xd04a4a,'Bleeding')}}})}}});
n3Mv('ghastflame',{nm:'Ghastfire Breath',ic:'🔥',an:'oh_breath',rmin:0,rmax:4,wind:.75,act:.8,rec:.55,cd:4.8,dmg:.3,sh:'cone',r:4.2,ang:.5,mt:'m',
 x6:{tick(e,a,ph,k,dt){if(ph==0&&k>.5&&Math.random()<.5)burst(gY(e.m.position,.6*e.m.bs).addScaledVector(a.d,.5*e.m.bs),OH.fire,1,.3,.3,.3);if(ph!=1)return;
   const o=gY(e.m.position,.6*e.m.bs).addScaledVector(a.d,.6*e.m.bs);if(Math.random()<.95)fxStream(o,a.d,Math.random()<.5?OH.fire:OH.fire2,2,4.2,.45,420,'ico',.2);
   a.tk=(a.tk||0)-dt;if(a.tk<=0){a.tk=.25;if(s6InCone(a,a.o,a.d,4.2,.5))s6Hit(e,a,.3,'m')}},
  land(e,a){if(s6InCone(a,a.o,a.d,4.2,.5))s6Dot(e,a,.1,3,1,OH.fire,'Grave-fire')}}});

// ---------------- where they live ----------------
n3Zone(4,1,{roam:[['drowned',3],['banshee',3],['skeleton',1],['ghoul',1]],camps:[
  {n:'Sunken Ossuary',mem:[['drowned',3],['banshee',1]],b:'grave'},{n:'Wailing Pool',mem:[['banshee',3]],b:'haunt'},{n:'Flooded Vault',mem:[['drowned',2],['skeleton',1],['banshee',1]],b:'fort'}]});
n3Zone(4,2,{roam:[['colossus',2],['bonehound',3],['bonearcher',1],['banshee',1]],camps:[
  {n:'Colossus Barrow',mem:[['colossus',2],['bonehound',1]],b:'mega'},{n:'Hound Pit',mem:[['bonehound',4]],b:'wolf'},{n:'Field of Skulls',mem:[['colossus',1],['bonehound',2],['bonearcher',1]],b:'grave'}]});
})();
