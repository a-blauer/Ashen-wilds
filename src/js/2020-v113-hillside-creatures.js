// ================= v113 Hillside Crest: Mire Croaker, Gharial Reaver (II · Mistmere) · Galecliff Basilisk, Shellback Snapper (III · Galecliffs) =================
// The serpent-folk's plains give way to cold-blooded beasts: a giant warty toad and a crocodile-man in the misty meres,
// a petrifying lizard and a huge spiked snapping turtle on the windswept cliffs.
(function(){
// ===================================================================== Mire Croaker (toad) =====================================================================
const CK={skin:0x55663a,dark:0x2c3a1e,belly:0xb8b48a,wart:0x3a4a24,sac:0xd8c890,eye:0xe8b830,tongue:0xc85a6a};
n3Def('croaker',{n:'Mire Croaker',e:'🐸',fam:'Earth',mt:'p',w:{hp:1.4,pa:1.1,ma:.6,pd:1.15,md:.9},
 rig:{name:'Croaker',base:'Mossfrog',col:CK.skin,sc:1.65,
  kit(k,c,C,red){
   // warts and lumps all over the back, a fold of skin over each eye, a pale throat sac that swells when it croaks
   for(let i=0;i<22;i++){const z=-.26+n3Nz(i,1,2)*.62,a=(n3Nz(i,3,4)-.5)*2.4,y=.29+Math.cos(a)*.17,x=Math.sin(a)*.21;k.p(z>.2?'chest':z>-.1?'spine':'pelvis','sph','c',i%3?CK.wart:dkShade(CK.wart,.7),x,y,z,.022+n3Nz(i,5,6)*.02,.018,.022)}
   [-1,1].forEach(s=>{k.p('head','sph','c',CK.dark,s*.1,.5,.39,.06,.03,.07,0,0,s*.3);k.p('head','box','c',0x050505,s*.1,.475,.43,.012,.03,.012)});
   k.p('jaw','sph','c',CK.sac,0,.2,.36,.12,.08,.1);k.p('jaw','sph','c',dkShade(CK.sac,.8),0,.19,.33,.1,.06,.08);
   // bony ridge down the spine
   for(let i=0;i<6;i++){const z=.2-i*.09;k.p(z>.1?'chest':z>-.15?'spine':'pelvis','cone4','c',CK.dark,0,.47+Math.sin(i*.5)*.01,z,.025,.05,.03)}
  }},
 moves:['bite','tonguelash','toadleap'],
 bfx(e,a){const p=gY(e.m.position,.5).addScaledVector(a.d,1.2);burst(p,0x8aa070,12,1.4,.8,.4);fxJaws(gY(p,.2),0xd8e0b0,.8,260,Math.atan2(a.d.x,a.d.z))}});
// tongue lash: rears back with its throat swelling, then the tongue shoots out
n3Cr('ck_tongue',[[.55,{nk:-.4,hd:-.35,jw:.25,ex:.14,by:-.05,fh:-.15,Brx:-.18}],[1,{nk:-.45,hd:-.4,jw:.3,ex:.16,Brx:-.2}],[1.1,{nk:.4,hd:.35,jw:1.0,ex:0,by:-.08,fh:-.4,Brx:.12,Bz:.12}],
  [1.75,{nk:.35,hd:.3,jw:.95,Brx:.1,Bz:.1}],[2.1,{nk:0,hd:0,jw:.2,Brx:0,Bz:0}]]);
// belly crush: squats, springs up and comes down belly-first
n3Cr('ck_leap',[[.6,{by:-.16,fh:.3,fk:.6,hh:-.3,hk:.9,nk:-.15,Brx:.15}],[1,{by:-.2,hk:1.0,Brx:.18}],[1.2,{by:.05,fh:-.9,fk:.1,hh:.8,hk:.1,nk:-.3,Brx:-.4}],
  [1.8,{fh:-.4,fk:.4,hh:-.3,hk:.6,nk:.1,Brx:.2}],[2,{by:-.18,fh:.5,fk:.7,hh:-.2,hk:.9,nk:.25,Brx:.05}],[2.4,{by:-.1}]]);
n3Mv('tonguelash',{nm:'Tongue Lash',ic:'👅',an:'ck_tongue',rmin:1.6,rmax:7,wind:.6,act:.55,rec:.55,cd:4.2,dmg:.9,sh:'line',w:.9,l:7.2,
 x6:{tick(e,a,ph,k){const mouth=gY(e.m.position,.5*e.m.bs).addScaledVector(a.d,.62*e.m.bs);
   if(ph==0&&k>.5&&Math.random()<.4)burst(mouth,CK.sac,1,.2,.2,.3);
   if(ph==1){if(!a.tg2){const g=new THREE.Group(),t=new THREE.Mesh(n3Geo('sph'),n3Mat(CK.tongue,{roughness:.4}));t.scale.set(.09,.09,1);t.position.z=.5;g.add(t);const tip=new THREE.Mesh(n3Geo('sph'),n3Mat(dkShade(CK.tongue,1.15),{roughness:.3}));tip.scale.setScalar(.22);g.add(tip);g.userData.tip=tip;g.userData.lpsSkip=1;scene.add(g);a.tg2=g;a.tl=0}
    const L=Math.min(7.2,Math.max(1.5,d2(a.o,a.tp)+.6)),out=k<.42?ATK_E.out(k/.42):1-ATK_E.in2((k-.42)/.58),len=L*out,g=a.tg2;
    g.position.copy(mouth);g.lookAt(mouth.x+a.d.x,mouth.y-.05,mouth.z+a.d.z);g.children[0].scale.set(.13,.11,Math.max(.01,len));g.children[0].position.z=len/2;g.userData.tip.position.z=len;
    const tipW=mouth.clone().addScaledVector(a.d,len);if(Math.random()<.4)burst(tipW,0xd8a0a8,1,.2,.1,.3);
    if(!a.hit&&k<.6){const t=s6T(a),vx=t?t.position.x-mouth.x:0,vz=t?t.position.z-mouth.z:0,u=vx*a.d.x+vz*a.d.z,pp=Math.abs(vx*a.d.z-vz*a.d.x);if(t&&u>-.3&&u<len+.4&&pp<.8*a.sz+.2){a.hit=1;s6Hit(e,a,.9);burst(tipW,0xd8a0a8,14,1,1,.4);n3Snd(tipW,'hit',.6);
      if(n3Me(a)){s6Deb(a,'Snagged','👅',{mspd:-.5},900,'Caught by the tongue');n3Pull(a,e.m.position,Math.max(0,d2(pl.position,e.m.position)-1.6),300,1.5)}}}}},
  land(e,a){if(a.tg2){scene.remove(a.tg2);a.tg2=null}},end(e,a){if(a.tg2){scene.remove(a.tg2);a.tg2=null}}}});
n3Mv('toadleap',{nm:'Belly Crush',ic:'💦',an:'ck_leap',rmin:2.8,rmax:8,wind:.65,act:.65,rec:.75,cd:4.8,dmg:1.35,sh:'circle',r:2.4,at:'tg',
 x6:{start(e,a){a.L=n3Reach(a.o,a.tp,.3);n3Aim(a,a.L)},rel(e,a){burst(gY(e.m.position,.1),0x6a7a5a,18,1.6,1.2,.4)},
  tick(e,a,ph,k,dt,now,P){if(ph==1){n3Glide(e,a.o,a.L,ATK_E.io(k));P.y+=Math.sin(Math.PI*k)*2.4/(e.m.bs||1)}},
  land(e,a){const p=a.L.clone();n3Flash(p,0x9ac0a0,2.4,480);ring(p,0xc8e0d0,3,420);burst(gY(p,.3),0x8ab0c0,36,3,2.6,.6);burst(gY(p,.2),0x5a4a30,18,2.4,1.6,.6);n3Shake(p,.14);n3Snd(p,'boom',.7);
   fxWaves(gY(p,.3),a.d,0xb8d8e0,3,3.6,520,3.14);if(s6InC(a,p,2.4)){s6Hit(e,a,1.35);n3Shove(a,p,1.4,220)}
   s6Pool(e,p,2*a.sz,0x5a6a3a,3500,0,['Mud-bogged','💦',{mspd:-.35},'Mud: −35% move speed'])}}});

// ===================================================================== Gharial Reaver (crocodile-man) =====================================================================
const GH={sk:0x3a4a2a,sk2:0x2a3620,belly:0x8a8a5a,scute:0x24301c,tooth:0xe8e0c0,eye:0xe8c020,cloth:0x4a3a26,bone:0xb8a888};
n3Def('gharial',{n:'Gharial Reaver',e:'🐊',fam:'Dragon',mt:'p',w:{hp:1.35,pa:1.25,ma:.5,pd:1.15,md:.9},
 hum:{skin:[58,74,42],tunic:0x2a3620,cape:[50,60,36],pants:[50,60,36],sc:1.3,wpn:'halberd',wcol:0x8a9080},
 moves:['strike','deathroll','jawtrap'],basic:{strike:'gh_thrust'},stance:{sx:.12,hx:-.12,lk:.08,rk:.08},
 body(B,P,k){const C=GH;P.build=2;P.af=1.2;P.lf=1.2;P.belly=.06;P.head={w:1.0,len:1.15,fwd:.03,top:.72,jaw:1.15};
  Object.assign(P.col,{skin:C.sk,torso:C.sk,sleeve:C.sk,fore:C.sk,hand:C.sk2,pants:C.cloth,shin:C.sk,boot:C.sk2,sole:C.sk2,belt:0x2a1a10,neck:C.sk});
  n3Paint(P,(m,s,part)=>{if(!part&&m.s>.45&&m.y>.5&&m.y<.98)return Math.round(m.y*36)%2?C.belly:mdSh(C.belly,.85);if(!part&&m.y<.6)return Math.round(m.c*6)%2?C.cloth:mdSh(C.cloth,.8);
    const t=Math.round(m.y*30+m.c*3)%2;return m.s<-.2?(t?C.sk2:C.scute):(t?C.sk:C.sk2)});
  mdBody(B,P);mdHead(B,P,{noFace:true,headCol:m=>m.s<-.1||m.y>1.18?(Math.round(m.y*40)%2?C.sk2:C.scute):C.sk});
  // the long crocodile snout: an upper jaw loft out from the face, rows of interlocking teeth, nostril knobs
  const z0=mdHeadZ(P,1.11)-.05,R=[[0,1.12,.085,.06,.05],[.08,1.11,.075,.045,.045],[.17,1.1,.062,.036,.038],[.26,1.095,.05,.03,.032],[.32,1.093,.04,.028,.026],[.35,1.094,.02,.016,.014]];
  mdLoft(B,R.map(q=>({p:[0,q[1],z0+q[0]],rx:q[2],f:q[3],b:q[4],w:[['head',1]]})),{seg:9,ref:[0,1,0],capB:true,col:m=>m.s<-.5?C.belly:Math.round(m.z*30)%2?C.sk:C.sk2});
  for(let i=0;i<9;i++){const t=i/8,z=z0+.04+t*.28,x=.075-t*.04;[-1,1].forEach(s=>{k.p('head','cone4','c',C.tooth,s*x,1.06-t*.008,z,.008,.034-((i%2)*.012),.008,Math.PI+(i%2?.2:-.15))})}
  k.p('head','box','c',0x120a08,0,1.072,z0+.15,.12,.008,.3);k.p('head','sph','c',C.sk2,.0,1.12,z0+.33,.03,.022,.025);
  // a lower jaw on the jaw line, heavy brows and eyes on top of the head
  mdLoft(B,R.map(q=>({p:[0,q[1]-.055,z0+q[0]*.95],rx:q[2]*.92,f:q[3]*.6,b:q[4],w:[['head',1]]})),{seg:8,ref:[0,1,0],capB:true,col:m=>m.s>.3?C.belly:C.sk2});
  [-1,1].forEach(s=>{k.p('head','sph','c',C.sk2,s*.055,1.19,z0-.02,.035,.03,.04);k.p('head','sph','g',C.eye,s*.06,1.195,z0+.008,.016,.012,.01);k.p('head','box','c',0x050505,s*.06,1.195,z0+.018,.003,.014,.004)});
  // bony scutes in rows down the back and along the tail
  for(let r=0;r<8;r++){const y=1.02-r*.075;[-1,1].forEach(s=>{const p=n3Surf(P,y,Math.PI+s*.32,.008);k.p(n3TB(y),'cone4','c',C.scute,p[0],p[1],p[2],.022,.045,.03,-1.2,0,0)})}
  const T=[[0,.56,-.12],[0,.44,-.32],[0,.3,-.55],[0,.18,-.8],[0,.1,-1.04],[0,.07,-1.24]];for(let i=0;i<T.length-1;i++){const r0=.11-i*.02;k.L('pelvis','c',i%2?C.sk:C.sk2,T[i],T[i+1],r0,Math.max(.01,r0-.02),7);[-1,1].forEach(s=>k.p('pelvis','cone4','c',C.scute,s*r0*.5,T[i][1]+r0*.8,T[i][2]-.05,.016,.04,.022,-1.0))}
  // a harness of hide straps, a belt of trophies, claws
  mdStrap(B,P,0x2a1a10);mdLoin(B,P,C.cloth,0x2a1a10);mdNeck(k,C.tooth,0x5a3a20,9);
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];for(let f=0;f<3;f++)k.L(a,'c',0x1a1a10,[W[1]+(f-1)*.02,W[2]-.08,W[3]+.03],[W[1]+(f-1)*.024,W[2]-.13,W[3]+.06],.008,.002,3);
    const l=s<0?'lh2':'rh2',F=P.bones[l];k.p(l,'box','c',C.sk2,F[1],.03,F[3]+.06,.07,.05,.16);for(let f=0;f<3;f++)k.p(l,'cone4','c',0x1a1a10,F[1]+(f-1)*.025,.02,F[3]+.15,.01,.05,.01,Math.PI/2)});
 },
 bfx(e,a){const p=gY(e.m.position,1.05).addScaledVector(a.d,1.6);burst(p,0xd8d0b0,10,1,.6,.35);x5('box',0xe8e0c0,220,(k,m)=>{m.material.opacity=1-k},{p:gY(e.m.position,1.05).addScaledVector(a.d,1.2),s:[.05,.05,1.6],r:[0,Math.atan2(a.d.x,a.d.z),0]})}});
// a spear thrust: draws back, steps in and drives the halberd straight out
n3Hum('gh_thrust',[[.6,{sy:.55,py:.2,sx:-.1,ax:-1.2,az:.3,ex:-1.7,rw:.2,lx:-1.1,lz:.25,le:-1.4,lh:.1,rh:-.15,rk:.25,dy:-.03,Bz:-.08}],[1,{sy:.62,ax:-1.25,ex:-1.85,Bz:-.1}],
  [1.42,{sy:-.15,py:-.1,sx:.28,ax:-1.55,az:-.05,ex:-.02,rw:0,lx:-1.45,lz:.05,le:-.5,lh:-.45,rh:.3,lk:.5,rk:.1,dy:-.08,Bz:.3}],[1.75,{sx:.3,ax:-1.5,ex:-.05,Bz:.28}],
  [2.4,{sy:.1,sx:.08,ax:-.6,az:0,ex:-.6,lx:-.5,le:-.6,lh:0,rh:0,lk:.1,rk:.05,dy:-.02,Bz:0}]]);
// death roll: crouches with the halberd hugged in, then spins forward twice like a crocodile rolling its prey
n3Hum('gh_roll',[[.6,{sx:.4,ax:-1.0,az:-.4,ex:-2.0,lx:-1.0,lz:.4,le:-2.0,lk:.7,rk:.7,lh:-.4,rh:-.4,dy:-.15,hx:-.15}],[1,{sx:.45,dy:-.17}],
  [1.15,{sx:.3,ax:-1.4,az:1.2,ex:-.3,lx:-1.4,lz:-1.2,le:-.3,lk:.4,rk:.4,lh:-.2,rh:-.2,dy:-.1,Bry:.5,By:.1}],[1.9,{Bry:12.57,By:.05}],[2.05,{Bry:12.57,By:0,sx:.35,dy:-.12}],
  [2.5,{sx:.15,ax:-.5,az:.1,ex:-.5,lx:-.5,lz:-.1,le:-.5,lk:.15,rk:.15,lh:0,rh:0,dy:-.03}]]);
// ambush jaws: lifts the halberd high and drives it into the mud; jaws of mud and bone burst up and snap shut under you
n3Hum('gh_plunge',[[.55,{ax:-2.9,lx:-2.7,az:.1,lz:-.1,ex:-.5,le:-.4,sx:-.25,hx:-.2,By:.08}],[1,{ax:-3.05,lx:-2.9,sx:-.3,By:.1}],[1.35,{sx:.85,ax:-.35,lx:-.35,ex:-.05,le:-.05,lh:-.4,rh:.3,lk:.8,rk:.55,dy:-.18,hx:.2,By:-.02}],
  [2.3,{sx:.8,dy:-.17}],[2.7,{sx:.3,ax:-.5,lx:-.5,ex:-.4,le:-.4,lk:.25,rk:.15,lh:-.1,rh:.1,dy:-.05,hx:0,By:0}]]);
n3Mv('deathroll',{nm:'Death Roll',ic:'🌀',an:'gh_roll',rmin:0,rmax:4.5,wind:.6,act:1.0,rec:.6,cd:4.6,dmg:.8,sh:'line',w:2.2,l:4.8,
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(3.6,Math.max(1.2,d2(a.o,a.tp)+.8))))},
  tick(e,a,ph,k){if(ph!=1)return;n3Glide(e,a.o,a.to,ATK_E.io(Math.min(1,k/.9)));if(Math.random()<.9)burst(gY(e.m.position,s6R(.2,1.3)),0x8a9a7a,2,1.4,.4,.35);if(Math.random()<.5)burst(gY(e.m.position,.1),0x5a6a4a,2,1,.8,.4);
   for(let i=0;i<2;i++){const h=[.35,.8][i];if(k>=h&&!a['h'+i]){a['h'+i]=1;arc(e.m.position,s6Rot(a.d,i*Math.PI),0xd8e0c8,2.2,260);n3Snd(e.m.position,'blunt',.6);if(s6InC(a,e.m.position,1.9)){s6Hit(e,a,.8);if(i==1)n3Shove(a,e.m.position,1.6,220)}}}}}});
n3Mv('jawtrap',{nm:'Ambush Jaws',ic:'🐊',an:'gh_plunge',rmin:0,rmax:8,wind:1.0,act:.45,rec:.7,cd:5,dmg:1.3,sh:'circle',r:1.7,at:'tg',
 x6:{tick(e,a,ph,k){if(ph==1&&k>.3){if(!a.pl){a.pl=1;const p=gY(e.m.position,0).addScaledVector(a.d,.9);burst(gY(p,.2),0x5a4a30,20,1.4,1.4,.5);fxCracks(p,0x2a1a10,6,1.2,600);n3Snd(p,'brk',.5)}
     if(Math.random()<.7)burst(gY(a.tp,.1),0x5a4a30,2,1.2,1,.4)}},
  land(e,a){const p=a.tp.clone();fxJaws(gY(p,.1),0xe8e0c0,1.6,520,Math.atan2(a.d.x,a.d.z));for(let i=0;i<12;i++){const an=i/12*6.283;n3Spike(V(p.x+Math.cos(an)*1.3,0,p.z+Math.sin(an)*1.3),GH.tooth,s6R(.6,.9),.16,.7,{tx:-Math.sin(an)*.6*0+Math.cos(an)*0,tz:0,delay:.02*(i%3)})}
   burst(gY(p,.3),0x8a7a50,26,2,2,.5);n3Shake(p,.1);n3Snd(p,'crit',.6);
   if(s6InC(a,p,1.7)){s6Hit(e,a,1.3);s6Deb(a,'Jaws','🐊',{mspd:-1},900,'Caught in the jaws (dash out)');s6Dot(e,a,.1,3,1,0xd04a4a,'Bleeding')}}}});

// ===================================================================== Galecliff Basilisk =====================================================================
const BS={skin:0x3e4a30,dark:0x262e1c,frill:0x7a2e22,frill2:0xa8542a,eye:0xffe060,stone:0xa8a090,horn:0xd8ccb0};
n3Def('basilisk',{n:'Galecliff Basilisk',e:'🦎',fam:'Dragon',mt:'m',w:{hp:1.2,pa:1.0,ma:1.25,pd:1.1,md:1.05},
 rig:{name:'Basilisk',base:'Drakelet',col:BS.skin,sc:1.5,noBasePost:true,spit:BS.stone,
  kit(k,c,C,red){
   // a fan-shaped frill behind the head: spines with a membrane between them, a crown of horns, glowing eyes
   for(let i=0;i<9;i++){const a=-1.25+i*.3125,x=Math.sin(a),y=Math.cos(a);k.L('head','c',BS.horn,[x*.04,.72+y*.04,.5],[x*.24,.72+y*.22,.42],.014,.004,4);if(i<8){const a2=a+.3125;k.p('head','cone4','c',i%2?BS.frill:BS.frill2,(Math.sin(a)+Math.sin(a2))*.08,.72+(Math.cos(a)+Math.cos(a2))*.075,.455,.06,.18,.008,0,0,-(a+.156))}}
   [-1,1].forEach(s=>{k.L('head','c',BS.horn,[s*.05,.76,.58],[s*.09,.83,.46],.018,.004,4);k.p('head','sph','c',0x080806,s*.058,.735,.66,.026,.02,.022);k.p('head','sph','g',red?0xff2a2a:BS.eye,s*.064,.736,.672,.017,.014,.012)});
   // stony scales on the flanks
   for(let i=0;i<12;i++){const z=.2-i*.07,s=i%2?1:-1;k.p(z>.1?'chest':z>-.15?'spine':'pelvis','dod','c',i%3?BS.stone:dkShade(BS.stone,.8),s*.11,.52,z,.03,.02,.03)}
  }},
 moves:['spit','stonegaze','shardspit']});
// petrifying gaze: rears up, the frill flares and the eyes blaze, then it stares down the line
n3Cr('bs_gaze',[[.6,{nk:-.45,hd:-.25,ex:.1,fh:-.3,by:.02,tl:.2,Brx:-.22}],[1,{nk:-.5,hd:-.3,ex:.12,fh:-.35,Brx:-.26}],[1.12,{nk:.15,hd:.25,jw:.4,fh:-.1,Brx:-.05,Bz:.08}],[1.9,{nk:.1,hd:.2,jw:.35}],[2.3,{nk:0,hd:0,jw:0,Brx:0,Bz:0}]]);
// shard spit: three quick jerks of the head, a stone shard each
n3Cr('bs_spit3',[[.6,{nk:-.35,hd:-.3,ex:.08,Brx:-.1}],[1.08,{nk:.35,hd:.3,jw:.8,Bz:.08}],[1.25,{nk:-.3,hd:-.25,jw:.1,Bz:0}],[1.42,{nk:.35,hd:.3,jw:.8,Bz:.08}],[1.58,{nk:-.3,hd:-.25,jw:.1,Bz:0}],[1.78,{nk:.4,hd:.35,jw:.85,Bz:.1}],[2.2,{nk:0,hd:0,jw:0,Bz:0,Brx:0}]]);
n3Mv('stonegaze',{nm:'Petrifying Gaze',ic:'👁️',an:'bs_gaze',rmin:0,rmax:6.5,wind:1.0,act:.6,rec:.6,cd:5.5,dmg:.7,sh:'cone',r:6.8,ang:.3,mt:'m',
 x6:{tick(e,a,ph,k){const eye=gY(e.m.position,.78*e.m.bs).addScaledVector(a.d,.62*e.m.bs);
   if(ph==0&&Math.random()<.5)burst(eye,BS.eye,1,.15,.1,.3);if(ph==0&&k>.5&&!a.fl){a.fl=1;kqFlash(eye,BS.eye,1.4,a.M.wind*500)}
   if(ph==1){if(!a.bm){a.bm=1;fxBeam(()=>eye,()=>eye.clone().addScaledVector(a.d,6.8),0xfff0a0,.18,a.M.act*1000,BS.stone);fxWaves(eye,a.d,0xfff0a0,4,6.6,500,.32);n3Snd(eye,'zap',.6)}
    if(Math.random()<.8){const q=eye.clone().addScaledVector(s6Rot(a.d,s6R(-.28,.28)),s6R(1,6.5));burst(q,BS.stone,1,.2,.2,.4)}
    if(!a.hit&&k>.3){a.hit=1;if(s6InCone(a,a.o,a.d,6.8,.3)){s6Hit(e,a,.7,'m');const b=hero.buffs.find(q=>q.n=='Petrifying');
      if(b&&s6T(a)===pl){s6Deb(a,'Petrified','🗿',{mspd:-1,as:-.5},1300,'Turned to stone (dash out)');fxDome(()=>pl.position,BS.stone,.8,1300,true)}else s6Deb(a,'Petrifying','🪨',{mspd:-.45},3500,'Stiffening: −45% move speed (a second gaze petrifies)')}}}}}});
n3Mv('shardspit',{nm:'Shard Spit',ic:'🪨',an:'bs_spit3',rmin:2.4,rmax:9,wind:.6,act:.8,rec:.5,cd:4.4,dmg:.55,sh:'line',w:.7,l:9,
 x6:{tick(e,a,ph,k){if(ph!=1)return;[.1,.52,.98].forEach((h,i)=>{if(k>=h-.06&&!a['s'+i]){a['s'+i]=1;const t=s6T(a),d=t?n3Dir(e.m.position,t.position):a.d;
   s6Own(e,a,'rock',BS.stone,d,15,.55,'m',1.2,h=>{if(h===pl)burst(gY(pl.position,1),BS.stone,10,1,.8,.4)},10);burst(kqHand(e,V()),BS.stone,6,.6,.5,.3);n3Snd(e.m.position,'arrow',.5)}})}}});

// ===================================================================== Shellback Snapper =====================================================================
const SN={shell:0x4e5a3a,moss:0x3a4e22,spike:0x2a2a20,skin:0x5a5a40,beak:0x1a1a14,eye:0xd8a020};
n3Def('snapper',{n:'Shellback Snapper',e:'🐢',fam:'Earth',mt:'p',w:{hp:1.75,pa:1.2,ma:.5,pd:1.6,md:1.0},
 rig:{name:'Snapper',base:'Stoneshell',col:SN.shell,sc:1.85,noBaseKit:true,
  kit(k,c,C,red){
   // a hooded, mean face: sunken glowing eyes under a heavy brow, beak-edged jaw, clawed feet
   [-1,1].forEach(s=>{k.p('head','box','c',0x080806,s*.07,.335,.535,.032,.024,.02,0,s*.5,-s*.15);k.p('head','box','g',red?0xff2a2a:SN.eye,s*.084,.337,.54,.022,.012,.01,0,s*.5,-s*.2);k.p('head','box','c',SN.beak,s*.066,.36,.53,.05,.02,.04,0,s*.45,s*.35)});
   k.L('jaw','c',0x4a4a36,[0,.272,.47],[0,.272,.625],.05,.014,5);
   [['fl2',-.155,.19],['fr2',.155,.19],['hl2',-.165,-.21],['hr2',.165,-.21]].forEach(f=>[-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0x1a1812,f[1]+i*.03,.012,f[2]+.075,.012,.05,.012,Math.PI/2)));
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=Math.sin(a)*.355,z=Math.cos(a)*.44-.02;k.p('spine','dod','c',i%2?0x2e3424:0x3e4630,x,.215,z,.045,.03,.045,i,i*.5,0)}
   // rows of jagged spikes along the shell ridges, a hooked beak, a spiked tail
   const domeY=(x,z)=>.22+.33*Math.sqrt(Math.max(0,1-(x/.36)**2-((z+.04)/.5)**2));
   [[0,0],[-.16,.0],[.16,0]].forEach((q,j)=>{for(let i=0;i<6;i++){const z=.28-i*.11,x=q[0]*(1-Math.abs(z+.04)*.6),y=domeY(x,z);k.p(z>.2?'chest':z<-.3?'pelvis':'spine','cone4','c',j?dkShade(SN.spike,1.2):SN.spike,x,y-.01,z,j?.03:.045,j?.09:.14,j?.03:.045,-.25,0,x*1.2)}});
   for(let i=0;i<14;i++){const a=i/14*6.283,x=Math.cos(a)*.37,z=-.04+Math.sin(a)*.5;k.p(z>.25?'chest':z<-.3?'pelvis':'spine','cone4','c',SN.spike,x,.2,z,.028,.08,.028,Math.sin(a)*1.3,0,-Math.cos(a)*1.3)}
   k.p('head','cone4','c',SN.beak,0,.27,.655,.03,.06,.03,Math.PI*.82);k.p('jaw','cone4','c',SN.beak,0,.262,.635,.02,.04,.02,Math.PI*.2);
   for(let i=0;i<3;i++)k.p('tail1','cone4','c',SN.spike,0,.25,-.5-i*.05,.016,.05,.016,-.4);
   for(let i=0;i<8;i++){const x=(n3Nz(i,2,3)-.5)*.5,z=(n3Nz(i,4,5)-.5)*.7;k.p('spine','sph','c',SN.moss,x,domeY(x,z)+.005,z,.05,.015,.05)}
  }},
 moves:['bite','shellspin','snapjaw']});
// shell spin: pulls in head and legs and whirls across the ground at you
n3Cr('sn_spin',[[.6,{nk:-.7,hd:-.3,by:-.12,fh:.5,hh:-.5,fk:.6,hk:.6,tl:-.3}],[1,{nk:-.75,by:-.14}],[1.1,{Bry:.6,By:.06}],[1.92,{Bry:18.85,By:.06}],[2.1,{Bry:18.85,By:0,nk:-.4,by:-.08}],[2.5,{nk:0,by:0,fh:0,hh:0,fk:0,hk:0,tl:0}]]);
// bonecrusher bite: draws its long neck back into the shell, then shoots it out with the beak gaping
n3Cr('sn_snap',[[.7,{nk:-.6,hd:-.4,jw:.35,by:-.06,Bz:-.12,Brx:-.06}],[1,{nk:-.65,hd:-.45,jw:.45,Bz:-.14}],[1.18,{nk:.75,hd:.55,jw:1.15,by:-.1,Bz:.45,Brx:.08}],[1.32,{nk:.7,hd:.5,jw:.05,Bz:.42}],[1.9,{nk:.5,hd:.35,jw:.1,Bz:.3}],[2.4,{nk:0,hd:0,jw:0,by:0,Bz:0,Brx:0}]]);
n3Mv('shellspin',{nm:'Shell Spin',ic:'🌀',an:'sn_spin',rmin:1.5,rmax:7,wind:.65,act:1.0,rec:.7,cd:5.2,dmg:1.1,sh:'line',w:2.4,l:7,
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(6.5,d2(a.o,a.tp)+1.6)))},
  tick(e,a,ph,k){if(ph!=1)return;n3Glide(e,a.o,a.to,ATK_E.io(Math.min(1,k/.92)));if(Math.random()<.9)burst(gY(e.m.position,.3),0x8a8a6a,3,2.2,.5,.35);
   if(!a.hit){const t=s6T(a);if(t&&d2(t.position,e.m.position)<1.5*a.sz+.2){a.hit=1;s6Hit(e,a,1.1);n3Snd(e.m.position,'blunt',.7);burst(gY(t.position,.8),0xd8d0b0,14,1.4,1,.4);
     if(n3Me(a)){const side=s6Rot(a.d,Math.PI/2),sg=(pl.position.x-e.m.position.x)*side.x+(pl.position.z-e.m.position.z)*side.z<0?-1:1;n3Move(V(side.x*sg,0,side.z*sg),1.8,240)}}}},
  land(e,a){ring(e.m.position,0xc8c0a0,2,300);burst(gY(e.m.position,.2),0x8a8a6a,16,2,.8,.4)}}});
n3Mv('snapjaw',{nm:'Bonecrusher Bite',ic:'🦴',an:'sn_snap',rmin:0,rmax:2.6,wind:.85,act:.3,rec:.8,cd:4.4,dmg:1.75,sh:'cone',r:2.8,ang:.42,
 x6:{tick(e,a,ph,k){if(ph==1&&k>=.45&&!a.hit){a.hit=1;const p=gY(e.m.position,.5).addScaledVector(a.d,2);fxJaws(p,0xd8d0b0,1.0,300,Math.atan2(a.d.x,a.d.z));burst(p,0xe8e0c8,16,1.2,1,.35);n3Shake(p,.1);n3Snd(p,'crit',.7);
   if(s6InCone(a,a.o,a.d,2.8,.42)){s6Hit(e,a,1.75);s6Deb(a,'Crushed','🦴',{pdP:-.3},5000,'Bones crushed: −30% physical defence')}}}}});

// ---------------- where they live ----------------
n3Zone(1,1,{roam:[['croaker',3],['gharial',3],['nagaw',1],['nagaa',1]],camps:[
  {n:'Croaker Shallows',mem:[['croaker',3],['gharial',1]],b:'bog'},{n:'Reaver Wallow',mem:[['gharial',3],['croaker',1]],b:'mire'},{n:'Drowned Serpent Shrine',mem:[['gharial',2],['nagas',1]],b:'shrine'}]});
n3Zone(1,2,{roam:[['basilisk',3],['snapper',2],['gharial',1],['nagaa',1]],camps:[
  {n:'Basilisk Roost',mem:[['basilisk',3]],b:'nest'},{n:'Shellback Rocks',mem:[['snapper',2],['basilisk',1]],b:'tort'},{n:'Cliffside Lair',mem:[['basilisk',2],['snapper',1]],b:'mega'}]});
})();
