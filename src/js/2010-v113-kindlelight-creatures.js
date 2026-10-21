// ================= v113 Kindlelight: Amalgam, Akidon (II · Glowmire Hollows) · Lichen, Akorror (III · Rotwood) =================
// The Caustic Goo of instance I evolves into the Amalgam: a walking mass of goo with arms and legs, full of the earth,
// twigs and bones it has swallowed. The Bloat Maggot's larvae hatch into the Akidon, a caustic bipedal insectoid with a dark
// carapace and scythe claws, which grows into the Akorror: huge, plated in dark chitin, all fangs and talons. In the
// Rotwood the forest floor itself gets up and walks: the Lichen, a humanoid of vines, goo and dirt.
(function(){
// ===================================================================== Amalgam =====================================================================
const AG={g1:0x3c8a26,g2:0x1f5214,g3:0x6abd38,dirt:0x4e3a26,dirt2:0x6a5236,glow:0xc8ff5a,bone:0xb8ae8c,bone2:0x8a8068,bark:0x3a2a1a};
n3Def('amalgam',{n:'Amalgam',e:'🟩',fam:'Earth',mt:'p',w:{hp:1.35,pa:1.15,ma:.5,pd:1.05,md:.85},
 hum:{skin:[76,170,48],tunic:0x2a6a1a,cape:[42,106,26],pants:[42,106,26],sc:1.24,wpn:'none'},
 moves:['strike','mudslam','clodhurl'],basic:{strike:'am_swat'},
 body(B,P,k){const C=AG;P.build=2;P.belly=.16;P.af=1.4;P.lf=1.3;P.wf=1.04;P.sq=.12;P.head={w:1.22,jaw:1.32,top:.8,fwd:.035};
  Object.assign(P.col,{skin:C.g1,torso:C.g1,sleeve:C.g1,fore:C.g1,hand:C.g2,pants:C.g1,shin:C.g1,boot:C.g2,sole:C.dirt,belt:null,neck:C.g1});
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,11,1),r=n3Nz(m.x,m.y,m.z);if(n>.84)return r<.5?C.dirt:C.dirt2;if(part=='hand')return C.g2;if(m.y<.16&&part=='leg')return mdMix(C.g2,C.dirt,.5);
    if(n>.74)return mdMix(C.g1,C.dirt,.45);if(m.s<-.35||n<.25)return mdMix(C.g1,C.g2,.6);if(n<.36)return C.g3;return C.g1});
  mdBody(B,P);
  mdHead(B,P,{noFace:true,headCol:m=>{const n=n3Sn(m.x,m.y,m.z,14,2);return n>.78?C.dirt:m.s<-.2?mdMix(C.g1,C.g2,.6):n<.3?C.g3:C.g1}});
  // three small mismatched eyes sunk in the goo (glowing, slit pupils), a sagging lopsided maw
  const ez=y=>mdHeadZ(P,y);
  [[-.055,1.165,.026],[.06,1.18,.021],[.0,1.215,.014]].forEach(q=>{k.p('head','sph','c',0x081004,q[0],q[1],ez(q[1])-q[2]*.6,q[2]*1.5,q[2]*1.2,q[2]);k.p('head','sph','g',C.glow,q[0],q[1],ez(q[1])-q[2]*.15,q[2],q[2]*.8,q[2]*.6);k.p('head','box','c',0x000000,q[0],q[1],ez(q[1])+q[2]*.4,q[2]*.18,q[2]*1.3,q[2]*.12)});
  const mz=ez(1.085);[[-.045,.12,.1],[.035,.1,-.14]].forEach(q=>k.p('head','box','c',0x0a1404,q[0],1.084,mz-.006,q[1],.05,.03,0,0,q[2]));
  k.p('head','sph','c',C.g2,.0,1.055,mz-.01,.09,.03,.035,.15,0,-.1);
  for(let i=0;i<9;i++){const x=-.075+i*.018;k.p('head','cone4','c',0xc8c0a0,x,1.104-Math.abs(i-3)*.003,mz-.002,.005,.022+((i*5)%3)*.009,.005,Math.PI,0,(i-4)*.06);if(i%2)k.p('head','cone4','c',0xb8b090,x,1.06,mz-.002,.005,.02,.005,0,0,(i-4)*.05)}
  // goo bulging over the frame: a hump over the shoulders, a sagging belly, blobs on the limbs
  k.p('chest','sph2','c',C.g1,0,.97,-.1,.2,.14,.15).p('chest','sph2','c',mdMix(C.g1,C.g2,.5),0,1.02,-.05,.15,.1,.12).p('spine','sph2','c',C.g1,0,.6,mdTorsoAt(P,.62).f-.08,.18,.12,.12);
  [-1,1].forEach(s=>{const A=P.bones[s<0?'aL0':'aR0'];k.p(s<0?'aL0':'aR0','sph2','c',C.g1,A[1]+s*.03,A[2]+.02,A[3],.1,.09,.1);const q=n3ArmAt(P,s,1.4);k.p(q[3],'sph2','c',C.g1,q[0]+s*.01,q[1],q[2],.075,.09,.075);
    const l=s<0?'lh0':'rh0',H=P.bones[l];k.p(l,'sph2','c',mdMix(C.g1,C.g2,.4),H[1]+s*.02,H[2]-.12,H[3],.105,.12,.1)});
  // drips off the chin and the arms
  for(let i=0;i<4;i++){const x=-.06+i*.04;k.L('head','c',C.g2,[x,1.06,mz-.02],[x+.004,1.0-(i%2)*.03,mz-.01],.016,.003,4)}
  [-1,1].forEach(s=>{for(let i=0;i<3;i++){const p=n3ArmAt(P,s,.6+i*.45);k.L(p[3],'c',C.g2,[p[0]+s*.02,p[1]-.03,p[2]+.02],[p[0]+s*.025,p[1]-.12-i*.02,p[2]+.03],.02,.003,4)}});
  // goo fists: lumpy, with three stubby fingers
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];k.p(a,'sph','c',C.g2,W[1]+s*.01,W[2]-.07,W[3]+.01,.085,.08,.085);
    for(let f=0;f<3;f++)k.L(a,'c',C.g1,[W[1]+s*.01+(f-1)*.035,W[2]-.11,W[3]+.04],[W[1]+s*.012+(f-1)*.045,W[2]-.19,W[3]+.07],.026,.012,5)});
  // the earth it has swallowed: clods on the shoulders, back and belly, stones, a drowned skull and ribs in the belly
  [[.98,.9,.06],[.98,-.9,.06],[.85,2.6,.08],[.72,3.2,.07],[.62,-2.5,.06],[.66,.5,.05],[.9,0.2,.045],[.52,-.3,.05]].forEach((q,i)=>{const p=n3Surf(P,q[0],q[1],-.01);k.p(n3TB(q[0]),'dod','c',i%2?C.dirt:C.dirt2,p[0],p[1],p[2],q[2],q[2]*.8,q[2]*.9,i,i*.7,0)});
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',A=P.bones[a];k.p(a,'dod','c',C.dirt,A[1]+s*.06,A[2]+.04,A[3]-.01,.085,.06,.08,.3,0,s*.4);k.p(a,'dod','c',0x6a6a5a,A[1]+s*.03,A[2]+.08,A[3]+.04,.03)});
  const bz=mdTorsoAt(P,.7).f;k.p('spine','sph','c',C.bone,.03,.72,bz-.07,.075,.07,.07).p('spine','box','c',C.bone2,.03,.68,bz-.03,.055,.03,.04);
  [-1,1].forEach(s=>k.p('spine','sph','c',0x101008,.03+s*.03,.73,bz-.01,.02,.02,.01));
  for(let i=0;i<4;i++)k.L('chest','c',C.bone2,[-.12+i*.035,.86,bz-.02],[-.09+i*.035,.8,bz+.01],.007,.006,4);
  // twigs and roots poking out of the goo every which way
  const tw=[[.92,.4,[.08,.14,.06]],[.88,2.8,[-.1,.16,-.12]],[.8,3.4,[.1,.12,-.14]],[.7,1.6,[.14,.08,0]],[.62,-1.7,[-.14,.1,.02]],[.98,-2.6,[-.06,.2,-.1]],[.55,2.2,[.1,-.02,-.12]],[.84,-.6,[-.06,.1,.12]]];
  tw.forEach((q,i)=>{const p=n3Surf(P,q[0],q[1],-.03),bn=n3TB(q[0]),e=[p[0]+q[2][0],p[1]+q[2][1],p[2]+q[2][2]];k.L(bn,'c',C.bark,p,e,.012,.004,4);
    if(i%2)k.L(bn,'c',C.bark,[p[0]+q[2][0]*.6,p[1]+q[2][1]*.6,p[2]+q[2][2]*.6],[e[0]+.04,e[1]+.03,e[2]-.02],.006,.002,3)});
  [-1,1].forEach(s=>{const p=n3ArmAt(P,s,.4),q=n3ArmAt(P,s,1.5);k.L(p[3],'c',C.bark,[p[0]+s*.05,p[1],p[2]-.02],[p[0]+s*.17,p[1]+.08,p[2]-.08],.01,.003,4);k.L(q[3],'c',C.bark,[q[0]+s*.04,q[1],q[2]+.02],[q[0]+s*.14,q[1]-.02,q[2]+.1],.009,.003,4)});
  // glowing bubbles caught in the goo
  for(let i=0;i<16;i++){const y=.5+n3Nz(i,1,2)*.48,a=n3Nz(i,3,4)*6.283,p=n3Surf(P,y,a,-.004);k.p(n3TB(y),'sph','g',i%3?C.glow:0xf0ffb0,p[0],p[1],p[2],.012+n3Nz(i,5,6)*.016)}
  // feet spread into a dirty puddle
  [-1,1].forEach(s=>{const l=s<0?'lh2':'rh2',F=P.bones[l];k.p(l,'sph','c',C.g2,F[1],.025,F[3]+.05,.11,.035,.14);for(let i=0;i<3;i++)k.p(l,'sph','c',C.dirt,F[1]+(i-1)*.05,.012,F[3]+.12+i%2*.03,.03,.012,.03)});
 },
 bfx(e,a){const p=gY(e.m.position,.9).addScaledVector(a.d,1.2);burst(p,AG.g3,14,1.6,1.2,.45);burst(p,AG.dirt2,6,1.2,1,.5);n3Slash(gY(e.m.position,1.1).addScaledVector(a.d,.7),a.d,AG.glow,1.5,220,.5)}});
// swat: a backhand smash with the whole body behind it
n3Hum('am_swat',[[.55,{sy:.7,py:.3,sx:-.12,ax:-2.4,az:.9,ex:-1.2,lx:-.4,lz:-.3,le:-.5,lh:-.1,rk:.3,dy:-.03}],[1,{sy:.82,py:.34,sx:-.16,ax:-2.6,az:1.05,ex:-1.3,dy:-.05}],
  [1.42,{sy:-.45,py:-.25,sx:.34,ax:-1.4,az:-.35,ex:-.15,lx:.2,lz:-.2,lh:-.35,rh:.25,lk:.42,rk:.1,dy:-.08,Bz:.18}],[1.78,{sy:-.75,py:-.38,sx:.4,ax:-.8,az:-.75,ex:-.3,dy:-.09,Bz:.14}],
  [2.4,{sy:-.2,py:-.1,sx:.15,ax:-.5,az:-.2,ex:-.4,lx:0,lz:0,lh:-.1,rh:.05,lk:.1,rk:.05,dy:-.03,Bz:0}]]);
// earthquake slam: rises up, both fists high, then crashes down
n3Hum('am_slam',[[.45,{sx:-.2,ax:-2.2,lx:-2.2,az:.3,lz:-.3,ex:-.8,le:-.8,hx:-.15}],[.95,{sx:-.4,ax:-3.05,lx:-3.05,az:.2,lz:-.2,ex:-.5,le:-.5,hx:-.28,lk:.02,rk:.02,By:.16}],
  [1.85,{sx:.72,ax:-.6,lx:-.6,az:.15,lz:-.15,ex:-.05,le:-.05,hx:.22,lh:-.45,rh:.35,lk:.92,rk:.62,dy:-.18,By:-.04}],[2.35,{sx:.66,ax:-.5,lx:-.5,dy:-.17,By:0}],
  [2.75,{sx:.25,ax:-.4,lx:-.4,ex:-.3,le:-.3,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// clod hurl: the right hand digs into its own belly, tears a clod loose, rears back and throws
n3Hum('am_hurl',[[.3,{sy:-.3,sx:.25,ax:-.7,az:-.35,ex:-1.9,rw:.5,lx:-.3,le:-.6,dy:-.04}],[.55,{sy:-.35,sx:.3,ax:-.6,az:-.4,ex:-2.0,rw:.7,dy:-.05}],
  [.88,{sy:.85,py:.32,sx:-.22,ax:-2.75,az:.35,ex:-1.7,rw:-.3,lx:-1.5,lz:-.1,le:-.15,lh:-.25,rh:.15,rk:.3,dy:-.03}],
  [1.08,{sy:-.45,py:-.28,sx:.3,ax:-1.45,az:-.1,ex:-.1,rw:.6,lx:-.3,lz:.2,le:-1.0,lh:-.3,rh:.2,lk:.38,rk:.05,dy:-.06}],[1.5,{sy:-.7,py:-.38,sx:.34,ax:-.75,az:-.35,ex:-.3,dy:-.06}],
  [2.4,{sy:-.15,py:-.08,sx:.1,ax:-.4,az:-.1,ex:-.45,lx:-.1,le:-.4,lh:0,rh:0,lk:.05,rk:0,dy:-.02}]]);
n3Mv('mudslam',{nm:'Earthquake Slam',ic:'🌋',an:'am_slam',rmin:0,rmax:3,wind:1.05,act:.3,rec:.8,cd:4.4,dmg:1.3,sh:'circle',r:4.4,at:'self',
 x6:{tick(e,a,ph,k,dt,now){if(ph==0&&k>.5&&Math.random()<.5)burst(gY(e.m.position,s6R(.4,2)),AG.g3,1,.3,.6,.4)},
  land(e,a){const p=e.m.position.clone();n3Flash(p,AG.g3,2.4,460);ring(p,AG.glow,3.2,420);burst(gY(p,.3),AG.g3,30,3.2,2.2,.6);n3Chunks(gY(p,.3),AG.dirt,9,4.2,8,.16);fxCracks(gY(p,0),0x2a1a0a,9,2.6,900);
   n3Shake(p,.16);n3Snd(p,'boom',.8);
   if(s6InC(a,p,2.2)){s6Hit(e,a,1.3);n3Shove(a,p,1.6,240)}
   n3Shock(e,a,p,4.4,AG.g3,620,.55,'p',t=>{if(t===pl)s6Deb(a,'Mired','🟩',{mspd:-.4},2500,'Goo and mud: −40% move speed')},1.1);
   for(let i=0;i<4;i++){const an=i/4*6.283+s6R(0,.6),q=V(p.x+Math.cos(an)*2.6,0,p.z+Math.sin(an)*2.6);if(s6Free(q.x,q.z))n3Later(.25,()=>s6Pool(e,q,.9,0x8ad83a,3000,0,['Mired','🟩',{mspd:-.25},'Goo underfoot: −25% move speed']))}}}});
n3Mv('clodhurl',{nm:'Clod Hurl',ic:'🪨',an:'am_hurl',rmin:2.6,rmax:9,wind:.95,act:.75,rec:.6,cd:4.2,dmg:1.15,sh:'circle',r:1.8,at:'tg',
 x6:{start(e,a){a.sp=[];for(let i=0;i<3;i++){const an=i/3*6.283+s6R(0,1),q=V(a.tp.x+Math.cos(an)*2.1,0,a.tp.z+Math.sin(an)*2.1);if(s6Free(q.x,q.z)){a.sp.push(q);s6Tel(a,q,1)}}},
  tick(e,a,ph,k){if(ph==0){if(k>.3&&!a.cl){a.cl=new THREE.Mesh(n3Geo('rock'),n3Mat(AG.dirt));a.cl.scale.setScalar(.34*a.sz);a.cl.userData.lpsSkip=1;scene.add(a.cl);burst(kqHand(e,V()),AG.g3,10,.6,.8,.4)}
    if(a.cl){a.cl.position.copy(kqHand(e,V()));a.cl.rotation.x+=.1;if(Math.random()<.4)burst(a.cl.position,AG.g3,1,.2,-.4,.4)}}},
  rel(e,a){if(a.cl){scene.remove(a.cl);a.cl=null}const g=new THREE.Group(),r=new THREE.Mesh(n3Geo('rock'),n3Mat(AG.dirt));r.scale.setScalar(.42*a.sz);g.add(r);g.userData.spin=r;
   const gl=new THREE.Mesh(n3Geo('sph'),addMat(AG.g3));gl.scale.setScalar(.5*a.sz);g.add(gl);s6Lob(g,kqHand(e,V()),a.tp,2.8,a.M.act*1000,()=>gl.material.dispose(),AG.g3)},
  land(e,a){const p=a.tp.clone();n3Flash(p,AG.g3,1.6,380);burst(gY(p,.4),AG.g3,24,2,1.6,.5);n3Chunks(gY(p,.4),AG.dirt,6,2.6,6,.14);n3Snd(p,'brk',.6);
   if(s6InC(a,p,1.8))s6Hit(e,a,1.15);s6Pool(e,p,1.2*a.sz,0x8ad83a,2500,.18,null);
   (a.sp||[]).forEach((q,i)=>{const g=kqShot('glob',AG.g3,.9);s6Lob(g,gY(p,.4),q,1.2,320+i*40,()=>{burst(gY(q,.3),AG.g3,14,1.4,1,.45);n3Chunks(gY(q,.3),AG.dirt2,3,1.6,4,.1);if(s6InC(a,q,1))s6Hit(e,a,.5)},AG.g3)})},
  end(e,a){if(a.cl){scene.remove(a.cl);a.cl=null}s6TelRm(a)}}});

// ===================================================================== Akidon =====================================================================
const AK={c1:0x15140e,c2:0x29261a,c3:0x080806,edge:0x3e3c28,acid:0x9aff3a,acid2:0x5aa81e,bone:0xcfc6a8};
// a mantis scythe on the forearm: dark chitin blade with a pale cutting edge, curving forward and down past the hand
function akScythe(k,P,s,len,w,col,edge){const p=n3ArmAt(P,s,1.7),bn=s<0?'aL1':'aR1';let a=[p[0]+s*.04,p[1],p[2]+.01],d=[s*.06,-1,.22];const n=5;
  for(let i=0;i<n;i++){const L=len/n,b=[a[0]+d[0]*L,a[1]+d[1]*L,a[2]+d[2]*L],r=w*(1-i/n*.75),ln=Math.hypot(d[1],d[2]);k.p(bn,'cone4','c',col,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r*.32,L*1.15,r,Math.atan2(d[2],d[1]),0,0);
    k.p(bn,'box','c',edge,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2+r*.55,.006,L*1.02,r*.3,Math.atan2(d[2],d[1]),0,0);a=b;const c=Math.cos(-.42),sn=Math.sin(-.42);d=[d[0],(d[1]*c-d[2]*sn),(d[1]*sn+d[2]*c)]}}
function akHead(B,P,k,C,big){P.head={w:big?1.12:.86,len:big?1.3:1.38,fwd:.04,top:.78,jaw:big?1.3:.92};
  mdHead(B,P,{noFace:true,headCol:m=>m.s>.45&&m.y<1.14?C.c3:Math.round(m.y*44+m.c*2)%3==0?C.edge:m.s<-.2?C.c1:C.c2});
  const z=y=>mdHeadZ(P,y),hx=y=>mdHeadX(P,y);
  // compound eyes: big glowing domes on the sides of the head, faceted
  [-1,1].forEach(s=>{k.p('head','sph2','c',C.c3,s*(hx(1.17)-.012),1.17,z(1.17)-.05,.05,.045,.055);k.p('head','sph2','g',C.acid,s*(hx(1.17)-.004),1.172,z(1.17)-.045,.042,.038,.048);
    for(let i=0;i<3;i++)k.p('head','box','c',C.c3,s*(hx(1.17)+.03),1.15+i*.02,z(1.17)-.045,.002,.004,.05)});
  // mandibles: curved hooks either side of the mouth (on the jaw line), dripping acid
  [-1,1].forEach(s=>{const y=1.075;let a=[s*.045,y,z(y)-.01],d=[s*.25,-.25,1];for(let i=0;i<4;i++){const L=big?.05:.038,b=[a[0]+d[0]*L,a[1]+d[1]*L,a[2]+d[2]*L];k.L('head','c',i<2?C.c2:C.bone,a,b,(big?.022:.016)*(1-i*.2),(big?.02:.014)*(1-(i+1)*.2)+.003,4);a=b;d=[d[0]-s*.35,d[1]+.05,d[2]-.15]}
    k.p('head','sph','g',C.acid,a[0],a[1]-.012,a[2],.008,.014,.008)});
  k.p('head','box','c',0x050308,0,1.07,z(1.07)-.02,.05,.025,.02);
  // antennae (the Akorror has a horned crest instead)
  if(!big)[-1,1].forEach(s=>{let a=[s*.03,1.24,z(1.24)-.03],d=[s*.25,.6,.75];for(let i=0;i<5;i++){const b=[a[0]+d[0]*.05,a[1]+d[1]*.05,a[2]+d[2]*.05];k.L('head','c',C.c2,a,b,.008,.006,3);a=b;d=[d[0]+s*.06,d[1]-.18,d[2]+.05]}k.p('head','sph','g',C.acid,a[0],a[1],a[2],.008)})}
n3Def('akidon',{n:'Akidon',e:'🪲',fam:'Swarm',mt:'p',w:{hp:1.0,pa:1.25,ma:.6,pd:1.0,md:.85},
 hum:{skin:[40,30,50],tunic:0x1c1622,cape:[28,22,34],pants:[28,22,34],sc:1.14,wpn:'none'},
 moves:['strike','akrake','akspit'],basic:{strike:'ak_swipe'},stance:{sx:.22,hx:-.2,lk:.12,rk:.12,dy:-.03,ax:-.25,lx:-.25,ex:-.5,le:-.5},
 body(B,P,k){const C=AK;P.af=.8;P.lf=.86;P.wf=.92;P.armX=.01;
  Object.assign(P.col,{skin:C.c1,torso:C.c1,sleeve:C.c1,fore:C.c1,hand:C.c3,pants:C.c1,shin:C.c1,boot:C.c3,sole:C.c3,belt:null,neck:C.c3});
  n3Paint(P,(m,s,part)=>{if(part=='hand')return C.c3;if(!part){if(m.s>.35&&m.y<.95&&m.y>.5)return Math.round(m.y*30)%2?C.c2:C.c3;return Math.round(m.y*26)%2?C.c1:C.edge}
    return Math.round(m.y*34)%3==0?C.c3:m.s>.2?C.c2:C.c1});
  mdBody(B,P);akHead(B,P,k,C,false);
  // carapace: overlapping back plates down the spine, ridge spikes, shoulder plates
  for(let i=0;i<6;i++){const y=1.0-i*.08,p=n3Surf(P,y,Math.PI,.012);k.p(n3TB(y),'hem','c',i%2?C.c2:C.c1,p[0],p[1],p[2]-.015,.17-i*.008,.06,.06,-1.35,0,0);k.p(n3TB(y),'cone4','c',C.edge,0,y+.02,p[2]-.04,.014,.07,.012,-1.0)}
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',A=P.bones[a];k.p(a,'hem','c',C.c2,A[1]+s*.03,A[2]+.03,A[3],.085,.05,.09,0,0,s*.5);k.p(a,'cone4','c',C.edge,A[1]+s*.07,A[2]+.07,A[3]-.02,.012,.07,.012,0,0,-s*.7)});
  // ventral acid sacs glowing through the plates
  [.66,.74,.82].forEach((y,i)=>{const p=n3Surf(P,y,0,.003);k.p(n3TB(y),'sph','g',C.acid2,p[0],p[1],p[2],.05-i*.008,.018,.012)});
  // mantis scythes on the forearms, three-clawed hands
  [-1,1].forEach(s=>{akScythe(k,P,s,.46,.075,C.c2,C.bone);const a=s<0?'aL2':'aR2',W=P.bones[a];for(let f=0;f<3;f++)n3Claw(k,a,C.c3,[W[1]+(f-1)*.018,W[2]-.06,W[3]+.02],[0,-.8,.6],.08,.012,.5,3)});
  // the hanging abdomen (gaster): segments with acid glowing between them
  for(let i=0;i<5;i++){const t=i/4,y=.56-t*.2,z=-.14-t*.3,r=.11-Math.abs(t-.35)*.08;k.p('pelvis','sph2','c',i%2?C.c1:C.c2,0,y,z,r*1.05,r*.9,r);if(i<4)k.p('pelvis','ring','g',C.acid2,0,y-.02,z-.06,r*.8,.3,r*.75,-.6,0,0)}
  k.p('pelvis','cone4','c',C.edge,0,.33,-.47,.02,.08,.02,-2.2);
  // spurred knees, two-toed clawed feet
  [-1,1].forEach(s=>{const kb=s<0?'lh1':'rh1',K=P.bones[kb];k.p(kb,'cone4','c',C.edge,K[1],K[2]+.02,K[3]+.06,.016,.08,.016,1.2);const l=s<0?'lh2':'rh2',F=P.bones[l];
    for(let f=0;f<2;f++)n3Claw(k,l,C.bone,[F[1]+(f-.5)*.05,.03,F[3]+.12],[0,-.2,1],.07,.014,.6,3);n3Claw(k,l,C.bone,[F[1],.05,F[3]-.07],[0,-.3,-1],.05,.012,.6,2)});
 },
 bfx(e,a){const p=gY(e.m.position,1.0).addScaledVector(a.d,.9);n3Slash(p,a.d,AK.acid,1.6,230,.9);burst(p,AK.acid,10,1.2,.8,.4)}});
n3Hum('ak_swipe',[[.6,{sy:.65,py:.25,sx:-.1,ax:-2.7,az:.6,ex:-1.4,rw:-.3,lx:-1.0,lz:.2,le:-1.2,lh:-.15,rk:.25}],[1,{sy:.78,py:.28,ax:-2.9,az:.72,ex:-1.55,dy:-.04}],
  [1.42,{sy:-.5,py:-.25,sx:.36,ax:-1.1,az:-.6,ex:-.2,rw:.4,lx:-.6,le:-1.1,lh:-.38,rh:.2,lk:.45,dy:-.08,Bz:.22}],[1.8,{sy:-.72,ax:-.6,az:-.9,ex:-.35,Bz:.16}],
  [2.4,{sy:-.2,py:-.08,sx:.1,ax:-.6,az:-.3,ex:-.8,lh:-.05,rh:.05,lk:.1,dy:-.02,Bz:0}]]);
// caustic rake: crouched low with both scythes raised in an X, it darts forward and rakes them down across you
n3Hum('ak_rake',[[.6,{sx:.18,ax:-2.6,lx:-2.6,az:.9,lz:-.9,ex:-1.5,le:-1.5,lh:-.3,rh:.15,lk:.6,rk:.45,dy:-.1,hx:-.18}],[1,{sx:.22,ax:-2.75,lx:-2.75,az:1.0,lz:-1.0,dy:-.13}],
  [1.3,{sx:.32,lh:-.55,rh:.4,lk:.4,rk:.2,dy:-.08,hx:-.1}],[1.52,{sx:.48,ax:-.9,lx:-.9,az:-.55,lz:.55,ex:-.2,le:-.2,lh:-.45,rh:.3,lk:.55,rk:.2,dy:-.11,hx:.1}],
  [1.9,{sx:.52,ax:-.45,lx:-.45,az:-.85,lz:.85,ex:-.3,le:-.3}],[2.4,{sx:.2,ax:-.7,lx:-.7,az:-.25,lz:.25,ex:-.9,le:-.9,lh:-.1,rh:.05,lk:.15,rk:.1,dy:-.03,hx:0}]]);
// acid spray: rears back, the gland in its throat swells, then it hoses a sweeping arc of acid
n3Hum('ak_spit',[[.7,{sx:-.32,hx:-.45,ax:-1.0,az:1.25,lx:-1.0,lz:-1.25,ex:-1.0,le:-1.0,lh:.1,rk:.2,dy:-.02,Bry:-.75}],[1,{sx:-.36,hx:-.5,Bry:-.8}],
  [1.12,{sx:.25,hx:.2,ax:-1.2,lx:-1.2,Bry:-.65}],[1.9,{sx:.28,hx:.22,Bry:.75}],[2.3,{sx:.1,hx:0,ax:-.6,lx:-.6,az:.3,lz:-.3,ex:-.6,le:-.6,Bry:.3}]]);
n3Mv('akrake',{nm:'Caustic Rake',ic:'🦗',an:'ak_rake',rmin:0,rmax:4.2,wind:.75,act:.45,rec:.65,cd:3.8,dmg:1.15,sh:'line',w:1.6,l:4.4,
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(2.2,Math.max(.4,d2(a.o,a.tp)-1))))},
  tick(e,a,ph,k){if(ph==1){if(k<.5){n3Glide(e,a.o,a.to,ATK_E.out(k/.5));if(Math.random()<.8)burst(gY(e.m.position,.3),AK.acid2,2,.6,.6,.35)}
    if(k>=.5&&!a.hit){a.hit=1;const p=gY(e.m.position,1.05).addScaledVector(a.d,.9);n3Slash(p,a.d,AK.acid,1.8,300,.7);n3Slash(p,a.d,AK.acid,1.8,300,-.7);burst(p,AK.acid,22,1.8,1.2,.45);n3Snd(p,'stab',.7);
      if(s6InCone(a,e.m.position,a.d,2.5,.75)){s6Hit(e,a,1.15);s6Dot(e,a,.1,4,1,AK.acid,'Caustic Burn')}}}}}});
n3Mv('akspit',{nm:'Acid Gland',ic:'🧪',an:'ak_spit',rmin:0,rmax:4,wind:.8,act:.8,rec:.6,cd:4.6,dmg:.6,sh:'cone',r:4.3,ang:.85,mt:'m',
 x6:{tick(e,a,ph,k,dt,now){const m=e.m;if(ph==0&&k>.4&&Math.random()<.6)burst(gY(m.position,1.25*m.bs).addScaledVector(a.d,.2),AK.acid,1,.2,.3,.3);
   if(ph!=1)return;const yaw=HUP113.ak_spit.at(1+k).Bry||0,d=s6Rot(a.d,yaw),o=gY(m.position,1.2*m.bs).addScaledVector(d,.35);
   if(Math.random()<.95)fxStream(o,d,AK.acid,2,4.3,.08,380,'sph',.16);a.pt=(a.pt||0)-dt;if(a.pt<=0&&k>.1){a.pt=.26;const q=m.position.clone().addScaledVector(d,s6R(2.2,3.6));if(s6Free(q.x,q.z))s6Pool(e,q,.85,0xa8e83a,3200,.12,['Corroded','🧪',{pdP:-.2},'Acid: −20% physical defence'])}
   const t=s6T(a);if(t&&!a.hit){const v=V(t.position.x-m.position.x,0,t.position.z-m.position.z),L=v.length();if(L<4.4*a.sz&&Math.acos(Math.max(-1,Math.min(1,(v.x*d.x+v.z*d.z)/(L||1))))<.28){a.hit=1;s6Hit(e,a,.6,'m');s6Deb(a,'Corroded','🧪',{pdP:-.2},4000,'Acid: −20% physical defence')}}}}});

// ===================================================================== Lichen =====================================================================
const LI={soil:0x43341f,soil2:0x302517,moss:0x3e5a22,moss2:0x56722c,vine:0x26401a,vine2:0x3a5420,lich:0x8a926a,goo:0x8aff4a,bark:0x3a2a1a,cap:0xc8b088,cap2:0x8a6a4a};
// a vine wound around a limb chain (helix of short segments)
function liWrap(k,P,s,arm,turns,col){const n=18;let prev=null;for(let i=0;i<=n;i++){const t=i/n;let p,bn;
  if(arm){const q=n3ArmAt(P,s,t*1.9);p=[q[0],q[1],q[2]];bn=q[3]}else{const l=s<0?'lh':'rh',H=mdV(P.bones[l+'0']),K=mdV(P.bones[l+'1']),A=mdV(P.bones[l+'2']),v=t<.5?H.clone().lerp(K,t*2):K.clone().lerp(A,(t-.5)*2);p=[v.x,v.y,v.z];bn=t<.5?l+'0':l+'1'}
  const an=t*turns*6.283,r=arm?.068:.09,q=[p[0]+Math.cos(an)*r*s,p[1],p[2]+Math.sin(an)*r];if(prev)k.L(bn,'c',col,prev,q,.013,.013,4);prev=q}}
n3Def('lichen',{n:'Lichen',e:'🌿',fam:'Earth',mt:'p',w:{hp:1.3,pa:.95,ma:1.05,pd:1.1,md:1.05},
 hum:{skin:[74,58,40],tunic:0x3a2c1e,cape:[60,80,40],pants:[60,80,40],sc:1.3,wpn:'none'},
 moves:['strike','vinesnare','sporebloom'],basic:{strike:'li_lash'},
 body(B,P,k){const C=LI;P.build=2;P.af=1.1;P.lf=1.15;P.sq=.22;P.head={w:1.04,jaw:.92,top:1.08,fwd:.01};
  Object.assign(P.col,{skin:C.soil,torso:C.soil,sleeve:C.soil,fore:C.soil,hand:C.soil2,pants:C.soil,shin:C.soil,boot:C.soil2,sole:C.soil2,belt:null,neck:C.soil2});
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,10,5),r=n3Nz(m.x,m.y,m.z,7);if(r>.965)return C.lich;if(n>.62)return n>.74?C.moss2:C.moss;if(n<.3)return C.soil2;return r>.6?mdMix(C.soil,C.soil2,.5):C.soil});
  mdBody(B,P);
  mdHead(B,P,{noFace:true,headCol:m=>{const n=n3Sn(m.x,m.y,m.z,14,3);return m.y>1.18&&n>.45?C.moss:n<.3?C.soil2:C.soil}});
  // a hollow face: dark cavity, two glowing eyes deep inside, a wet glowing mouth slit
  const z=y=>mdHeadZ(P,y);[-1,1].forEach(s=>{k.p('head','sph','c',0x0c0806,s*.034,1.152,z(1.152)-.018,.03,.024,.02);k.p('head','sph','g',C.goo,s*.034,1.152,z(1.152)-.004,.013,.01,.008)});
  k.p('head','box','c',C.soil2,0,1.178,z(1.178)+.002,.1,.022,.02,-.1);
  k.p('head','box','g',0x5ad82a,0,1.09,z(1.09)-.008,.04,.006,.01);
  // a crown of gnarled roots and a mushroom shelf on the shoulder
  for(let i=0;i<7;i++){const an=-1.5+i*.5,p=[Math.sin(an)*.07,1.24,z(1.2)-.06+Math.cos(an)*-.04];let a=p,d=[Math.sin(an)*.4,1,-.3];for(let j=0;j<3;j++){const b=[a[0]+d[0]*.05,a[1]+d[1]*.05,a[2]+d[2]*.05];k.L('head','c',C.bark,a,b,.014-j*.004,.01-j*.003,4);a=b;d=[d[0]*1.3,d[1]-.3,d[2]-.25]}}
  [-1,1].forEach(s=>{const A=P.bones[s<0?'aL0':'aR0'];if(s<0)for(let i=0;i<3;i++)k.p('aL0','hem','c',i%2?C.cap:C.cap2,A[1]-.05-i*.015,A[2]+.07-i*.045,A[3]-.04+i*.02,.07-i*.012,.025,.06,0,0,.25);
    else{k.p('aR0','dod','c',C.soil2,A[1]+.04,A[2]+.04,A[3],.07,.055,.065);for(let i=0;i<4;i++)k.p('aR0','sph','c',C.lich,A[1]+.02+i*.02,A[2]+.08,A[3]-.03+i*.015,.018,.008,.018)}});
  // vines wound round the arms and legs and across the chest, tendrils hanging off the forearms
  [-1,1].forEach(s=>{liWrap(k,P,s,true,2.2,C.vine);liWrap(k,P,s,false,2.6,C.vine2);for(let i=0;i<3;i++){const q=n3ArmAt(P,s,1.2+i*.25);k.S(q[3],i%2?C.vine:C.moss,q[0]+s*.05,q[1],q[2]-.02+i*.02,.03,.22+i*.05,s*1.4,0,i)}});
  for(let i=0;i<10;i++){const t=i/9,y=.58+t*.4,an=t*5.2-2.6,p=n3Surf(P,y,an,.01),q=n3Surf(P,y+.04,an+.5,.01);k.L(n3TB(y),'c',C.vine,p,q,.016,.016,4)}
  // the glowing goo heart showing through the cracked chest, goo seeping from cracks
  const hz=mdTorsoAt(P,.86).f;k.p('chest','oct','g',C.goo,.03,.87,hz-.01,.05,.06,.03);[[-.05,.84,1.1],[.08,.9,-.6],[.0,.78,.2],[.06,.8,.9]].forEach(q=>k.p('chest','box','g',0x6ae02a,q[0],q[1],hz+.004,.006,.06,.004,0,0,q[2]));
  for(let i=0;i<5;i++){const y=.62+i*.08,an=-1.2+n3Nz(i,2,3)*2.4,p=n3Surf(P,y,an,.002);k.p(n3TB(y),'sph','g',C.goo,p[0],p[1],p[2],.012,.02,.008)}
  // a mossy beard of hanging strands, lichen crusts on the hips
  for(let i=0;i<6;i++){const x=-.06+i*.024;k.S('head',i%2?C.moss:C.moss2,x,1.06,z(1.06)-.02,.025,.12+(i%3)*.04,0,-.15,i)}
  for(let i=0;i<6;i++){const an=n3Nz(i,9,1)*6.283,p=n3Surf(P,.5+n3Nz(i,1,9)*.08,an,.004);k.p('pelvis','sph','c',C.lich,p[0],p[1],p[2],.03,.008,.03,Math.cos(an)*1.3,0,Math.sin(an)*1.3)}
  // feet are root bundles gripping the ground
  [-1,1].forEach(s=>{const l=s<0?'lh2':'rh2',F=P.bones[l];for(let i=0;i<5;i++){const an=-1.2+i*.6;k.L(l,'c',C.bark,[F[1],.05,F[3]+.02],[F[1]+Math.sin(an)*.14,.0,F[3]+.03+Math.cos(an)*.14],.022,.006,4)}});
 },
 bfx(e,a){const p=gY(e.m.position,1.1).addScaledVector(a.d,1.1);n3Slash(p,a.d,LI.moss2,2.1,260,.15,true);burst(p,LI.moss2,12,1.6,.8,.45);burst(p,LI.soil,6,1.2,.6,.5)}});
n3Hum('li_lash',[[.6,{sy:-.8,py:-.3,ax:-1.6,az:1.4,ex:-.6,rw:.3,lx:-.4,lz:-.2,le:-.5,sx:-.05,rh:-.1,lk:.2}],[1,{sy:-.95,py:-.35,az:1.55,ex:-.7}],
  [1.42,{sy:.55,py:.28,ax:-1.5,az:-.3,ex:-.05,sx:.22,lh:-.3,rh:.2,lk:.35,rk:.1,dy:-.05,Bz:.12}],[1.78,{sy:.85,py:.4,az:-.75,ax:-1.2,Bz:.1}],
  [2.4,{sy:.2,py:.08,sx:.08,ax:-.6,az:-.1,ex:-.4,lx:0,lz:0,lh:0,rh:0,lk:.05,rk:0,dy:-.02,Bz:0}]]);
// strangling roots: both arms rise, then plunge into the ground; the roots run underground and burst up around you
n3Hum('li_root',[[.5,{ax:-2.9,lx:-2.9,az:.3,lz:-.3,ex:-.5,le:-.5,sx:-.28,hx:-.25,By:.06}],[.88,{sx:.9,ax:-.35,lx:-.35,az:.12,lz:-.12,ex:-.1,le:-.1,lh:-.4,rh:.2,lk:.95,rk:.75,dy:-.21,hx:.25,By:-.03}],
  [2.1,{sx:.88,dy:-.2}],[2.6,{sx:.3,ax:-.5,lx:-.5,ex:-.4,le:-.4,lh:-.1,rh:.05,lk:.3,rk:.25,dy:-.06,hx:.05,By:0}]]);
// spore bloom: it throws its arms wide, its chest swells and bursts open in a cloud of glowing spores
n3Hum('li_bloom',[[.55,{ax:-2.0,az:1.2,lx:-2.0,lz:-1.2,ex:-.6,le:-.6,sx:-.18,hx:-.2,dy:-.04,lk:.15,rk:.15}],[1,{ax:-2.5,az:1.4,lx:-2.5,lz:-1.4,ex:-.3,le:-.3,sx:-.38,hx:-.42,By:.08}],
  [1.25,{ax:-1.4,az:1.7,lx:-1.4,lz:-1.7,ex:-.05,le:-.05,sx:.12,hx:.1,lk:.35,rk:.35,dy:-.07,By:0}],[2.2,{ax:-1.3,az:1.4,lx:-1.3,lz:-1.4,sx:.1}],[2.7,{ax:-.6,az:.4,lx:-.6,lz:-.4,ex:-.4,le:-.4,sx:0,hx:0,lk:.05,rk:.05,dy:-.01}]]);
n3Mv('vinesnare',{nm:'Strangling Roots',ic:'🌱',an:'li_root',rmin:0,rmax:8.5,wind:.95,act:.7,rec:.75,cd:5,dmg:.9,sh:'circle',r:1.7,at:'tg',mt:'m',
 x6:{rel(e,a){const p=e.m.position;burst(gY(p,.2),LI.soil,24,1.8,1.4,.5);n3Chunks(gY(p,.2),LI.soil2,5,2,4,.12);n3Shake(p,.06);n3Snd(p,'blunt',.6);a.sn=0},
  tick(e,a,ph,k){if(ph==1){const L=d2(a.o,a.tp),n=Math.max(3,Math.round(L*1.4));const q=Math.floor(k*n);for(;a.sn<=q&&a.sn<n;a.sn++){const t=(a.sn+1)/n,pp=V(a.o.x+(a.tp.x-a.o.x)*t,0,a.o.z+(a.tp.z-a.o.z)*t);
     burst(gY(pp,.15),LI.soil,6,.7,1,.4);if(a.sn%2==0)n3Chunks(gY(pp,.1),LI.soil2,1,.6,2.5,.08);fxCracks(gY(pp,0),0x1a120a,3,.5,500)}}},
  land(e,a){const p=a.tp.clone();n3Flash(p,LI.goo,1.5,500);for(let i=0;i<9;i++){const an=i/9*6.283,r=i%2?1.3:.9,q=V(p.x+Math.cos(an)*r,0,p.z+Math.sin(an)*r);
     n3Spike(q,i%3?LI.vine:LI.bark,s6R(1.0,1.5),.22,1.6,{tx:-Math.sin(an)*.5,tz:Math.cos(an)*.5,delay:i*.02})}
   burst(gY(p,.3),LI.moss2,22,1.6,1.4,.5);n3Snd(p,'brk',.6);
   if(s6InC(a,p,1.7)){s6Hit(e,a,.9,'m');s6Deb(a,'Strangled','🌱',{mspd:-1},1400,'Held by roots (dash out)');if(s6T(a)===pl)fxWeb(gY(pl.position,0),LI.vine2,.9,1400)}}}});
n3Mv('sporebloom',{nm:'Spore Bloom',ic:'🍄',an:'li_bloom',rmin:0,rmax:3.2,wind:.9,act:.3,rec:.9,cd:7,dmg:.4,sh:'circle',r:3.3,at:'self',mt:'m',
 x6:{tick(e,a,ph,k){if(ph==0&&Math.random()<.5)burst(gY(e.m.position,s6R(.8,1.6)*e.m.bs),LI.goo,1,.4,.2,.5)},
  land(e,a){const p=e.m.position.clone();n3Flash(p,0xd8ff6a,3.2,600);burst(gY(p,1.3),0xe8ff8a,40,3.4,1.4,.9);fxWaves(gY(p,1.1),a.d,0xc8ff6a,3,3.6,520,3.1);n3Snd(p,'hiss',.6);
   fxRise(gY(p,0),14,3,2.4,2400,(i,q,fn)=>x5('sph',i%2?0xd8ff6a:0x9aff4a,2400,(kk,m)=>{fn(kk,m);m.scale.setScalar(.09)},{p:q}));
   if(s6InC(a,p,3.3))s6Hit(e,a,.4,'m');s6Pool(e,p,3.1*a.sz,0xb8e05a,5000,.16,['Spore-choked','🍄',{mspd:-.25,as:-.15},'Spores: −25% move speed, −15% attack speed']);
   if(!e.mir){const h=Math.round(M(e.c)*.08);e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#9aff6a',-10)}}}});

// ===================================================================== Akorror =====================================================================
const AO={c1:0x100f0b,c2:0x211f16,c3:0x060604,edge:0x36341f,acid:0xb8ff3a,acid2:0x5a9a1a,fang:0xe8e0c8,claw:0x2a2430};
n3Def('akorror',{n:'Akorror',e:'🦂',fam:'Swarm',mt:'p',w:{hp:1.7,pa:1.35,ma:.5,pd:1.4,md:1.0},
 hum:{skin:[30,24,36],tunic:0x120e15,cape:[24,18,28],pants:[24,18,28],sc:1.5,wpn:'none'},
 moves:['strike','akrend','akleap'],basic:{strike:'ao_maul'},stance:{sx:.2,hx:-.18,lk:.1,rk:.1,dy:-.025,ax:-.15,lx:-.15,az:.12,lz:-.12,ex:-.35,le:-.35},
 body(B,P,k){const C=AO;P.build=2;P.af=1.45;P.lf=1.35;P.belly=.03;P.wf=1.08;P.armX=.03;
  Object.assign(P.col,{skin:C.c1,torso:C.c1,sleeve:C.c1,fore:C.c1,hand:C.c3,pants:C.c1,shin:C.c1,boot:C.c3,sole:C.c3,belt:null,neck:C.c3});
  n3Paint(P,(m,s,part)=>{if(part=='hand')return C.c3;if(!part&&m.s>.35&&m.y<.95&&m.y>.5)return Math.round(m.y*24)%2?C.c2:C.c3;return Math.round(m.y*20)%2?C.c1:C.edge});
  mdBody(B,P);akHead(B,P,k,C,true);
  // heavy plate shells over chest, belly and limbs, with raised rims
  mdTS(B,P,.66,1.0,.022,{col:m=>Math.round(m.y*22+m.c*1.5)%2?C.c2:C.c1,keep:m=>!(m.s>.85&&m.y>.96)});
  mdTS(B,P,.5,.64,.02,{col:m=>Math.round(m.y*30)%2?C.c2:C.edge});
  [-1,1].forEach(s=>{mdAS(B,P,s,0,3,.02,{col:m=>Math.round(m.y*30)%2?C.c2:C.c1});mdAS(B,P,s,4,5,.02,{col:C.c2});mdLS(B,P,s,1,3,.022,{col:m=>Math.round(m.y*24)%2?C.c2:C.c1});mdLS(B,P,s,4,6,.02,{col:C.c2})});
  // crest of horns sweeping back off the head, huge curved fangs
  const z=y=>mdHeadZ(P,y);[-1,0,1].forEach(s=>{let a=[s*.05,1.24,z(1.24)-.04],d=[s*.25,.5,-.8];for(let j=0;j<4;j++){const b=[a[0]+d[0]*.07,a[1]+d[1]*.07,a[2]+d[2]*.07];k.L('head','c',j<2?C.c2:C.edge,a,b,.03-j*.006,.024-j*.006,5);a=b;d=[d[0]*1.1,d[1]-.25,d[2]-.1]}});
  [-1,1].forEach(s=>{k.p('head','cone4','c',C.fang,s*.03,1.04,z(1.07)+.0,.016,.09,.016,Math.PI+.25,0,s*.15);k.p('head','cone4','c',C.fang,s*.075,1.05,z(1.08)-.03,.012,.06,.012,Math.PI+.4,0,s*.35)});
  k.p('head','box','g',0x8a1a0a,0,1.075,z(1.075)-.015,.05,.012,.012);
  // massive spiked pauldrons, spine ridge, plated back and a weighty spiked tail stub
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',A=P.bones[a];k.p(a,'hem','c',C.c2,A[1]+s*.05,A[2]+.04,A[3],.15,.09,.15,0,0,s*.45);k.p(a,'hem','c',C.edge,A[1]+s*.06,A[2]+.02,A[3],.135,.06,.135,0,0,s*.75);
    for(let i=0;i<3;i++)k.p(a,'cone4','c',C.c3,A[1]+s*(.07+i*.03),A[2]+.12-i*.02,A[3]-.04+i*.04,.024,.14-i*.02,.024,-.3,0,-s*(.4+i*.2))});
  for(let i=0;i<7;i++){const y=1.04-i*.08,p=n3Surf(P,y,Math.PI,.03);k.p(n3TB(y),'cone4','c',i%2?C.c2:C.edge,0,y,p[2]-.02,.03,.16-Math.abs(i-2)*.015,.028,-1.05)}
  // a heavy segmented tail sweeping down behind it, plated and spiked
  {const T=[[0,.56,-.16],[0,.46,-.36],[0,.34,-.55],[0,.24,-.74],[0,.2,-.92],[0,.21,-1.06]];for(let i=0;i<T.length-1;i++){const r0=.1-i*.017,r1=.1-(i+1)*.017;k.L('pelvis','c',i%2?C.c1:C.c2,T[i],T[i+1],r0,Math.max(.012,r1),7);
    k.p('pelvis','ring','c',C.edge,(T[i][0]+T[i+1][0])/2,(T[i][1]+T[i+1][1])/2,(T[i][2]+T[i+1][2])/2,r0*1.05,.35,r0*1.05,Math.atan2(T[i+1][2]-T[i][2],T[i+1][1]-T[i][1]),0,0);
    if(i<4)k.p('pelvis','cone4','c',C.c3,0,T[i][1]+r0*.9,T[i][2],.02,.07,.02,-.7)}k.p('pelvis','cone4','c',AO.fang,0,.21,-1.12,.03,.14,.025,-Math.PI/2)}
  // great talons on the hands and forearm blades
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];k.p(a,'sph','c',C.c2,W[1]+s*.01,W[2]-.05,W[3]+.01,.075,.07,.08);
    for(let f=0;f<3;f++)n3Claw(k,a,f==1?C.fang:C.claw,[W[1]+s*.01+(f-1)*.035,W[2]-.09,W[3]+.04],[(f-1)*.2,-.7,.7],.22,.024,.55,4);n3Claw(k,a,C.claw,[W[1]-s*.04,W[2]-.06,W[3]+.02],[-s*.6,-.4,.6],.12,.02,.5,3);
    akScythe(k,P,s,.26,.045,C.c2,C.edge);const kb=s<0?'lh1':'rh1',K=P.bones[kb];k.p(kb,'cone4','c',C.edge,K[1],K[2]+.04,K[3]+.08,.03,.12,.03,1.15)});
  // acid glowing at the joints, feet with hooked toe-claws
  [[.62,0],[.7,0],[.78,0]].forEach((q,i)=>{const p=n3Surf(P,q[0],0,.025);k.p(n3TB(q[0]),'box','g',C.acid2,p[0],p[1],p[2],.07-i*.01,.006,.006)});
  [-1,1].forEach(s=>{const l=s<0?'lh2':'rh2',F=P.bones[l];for(let f=0;f<3;f++)n3Claw(k,l,C.fang,[F[1]+(f-1)*.045,.04,F[3]+.12],[(f-1)*.2,-.2,1],.1,.02,.6,3)});
 },
 bfx(e,a){const p=gY(e.m.position,1.2).addScaledVector(a.d,1.3);fxClaw(p.clone().setY(GH(p.x,p.z)),a.d,AO.acid,3,1.2,260);burst(p,AO.acid,12,1.6,1,.45);n3Shake(e.m.position,.05)}});
n3Hum('ao_maul',[[.6,{sy:.5,py:.2,sx:-.2,ax:-2.9,az:.5,ex:-1.2,lx:-1.2,lz:.1,le:-.9,hx:-.1,rk:.3,dy:-.03}],[1,{sy:.62,sx:-.26,ax:-3.0,az:.58,ex:-1.32}],
  [1.42,{sy:-.4,py:-.2,sx:.46,ax:-1.0,az:-.4,ex:-.2,lx:-.7,le:-1,lh:-.42,rh:.3,lk:.6,rk:.2,dy:-.12,Bz:.28}],[1.8,{sy:-.62,ax:-.5,az:-.72,ex:-.3,dy:-.13,Bz:.22}],
  [2.4,{sy:-.15,py:-.05,sx:.15,ax:-.5,az:-.2,ex:-.5,lx:-.3,le:-.5,lh:-.1,rh:.05,lk:.15,rk:.05,dy:-.04,hx:0,Bz:0}]]);
// rending frenzy: right claw, left claw, then both crash down; it steps in with every blow
n3Hum('ao_rend',[[.7,{sy:.6,py:.25,sx:-.1,ax:-2.5,az:1.0,ex:-1.3,lx:-1.6,lz:-.6,le:-1.1,dy:-.06,rk:.3}],[1,{sy:.66,py:.28,ax:-2.6,az:1.05,dy:-.07}],
  [1.22,{sy:-.6,py:-.25,sx:.35,ax:-1.2,az:-.6,ex:-.2,lx:-2.2,lz:-.9,le:-1.3,lh:-.35,rh:.25,lk:.45,rk:.05,dy:-.1}],[1.36,{sy:-.78,py:-.3,lx:-2.6,lz:-1.05,le:-1.4,ax:-1.0,az:-.8,ex:-.4}],
  [1.52,{sy:.6,py:.25,sx:.38,lx:-1.2,lz:.6,le:-.2,ax:-1.5,az:.5,ex:-1.0,rh:-.35,lh:.25,rk:.45,lk:.1,dy:-.1}],
  [1.68,{sy:0,py:0,sx:-.3,ax:-3.0,lx:-3.0,az:.25,lz:-.25,ex:-.6,le:-.6,hx:-.2,lk:.1,rk:.1,lh:-.05,rh:.05,dy:-.01,By:.18}],
  [1.86,{sx:.72,ax:-.6,lx:-.6,az:.1,lz:-.1,ex:-.05,le:-.05,hx:.22,lh:-.45,rh:.35,lk:.88,rk:.6,dy:-.19,By:0}],[2.25,{sx:.7,dy:-.18}],
  [2.65,{sy:0,sx:.25,ax:-.5,lx:-.5,ex:-.4,le:-.4,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// carapace crash: it coils down, springs high into the air and comes down claws-first where you stand
n3Hum('ao_leap',[[.75,{sx:.45,ax:.5,lx:.5,az:.35,lz:-.35,ex:-.5,le:-.5,lk:1.05,rk:1.05,lh:-.65,rh:-.65,dy:-.24,hx:-.25}],[1,{sx:.5,dy:-.26,lk:1.1,rk:1.1}],
  [1.18,{sx:-.25,ax:-2.6,lx:-2.6,az:.3,lz:-.3,ex:-.5,le:-.5,lk:.15,rk:.55,lh:-.25,rh:.35,dy:0,hx:-.18}],[1.72,{sx:.3,ax:-2.95,lx:-2.95,lk:.55,rk:.55,lh:-.7,rh:-.7,hx:0}],
  [2.0,{sx:.78,ax:-.5,lx:-.5,az:.15,lz:-.15,ex:-.05,le:-.05,lk:1.0,rk:.82,lh:-.5,rh:.4,dy:-.24,hx:.25}],[2.35,{sx:.72,dy:-.22}],
  [2.75,{sx:.25,ax:-.5,lx:-.5,ex:-.4,le:-.4,lk:.3,rk:.25,lh:-.1,rh:.1,dy:-.06,hx:0}]]);
n3Mv('akrend',{nm:'Rending Frenzy',ic:'🩸',an:'ao_rend',rmin:0,rmax:2.8,wind:.7,act:1.1,rec:.7,cd:4.6,dmg:.75,sh:'cone',r:3.1,ang:.85,
 x6:{start(e,a){a.st=[]},
  tick(e,a,ph,k){if(ph!=1)return;const H=[.22,.52,.86];for(let i=0;i<3;i++){const h=H[i];
    // step in just before each blow
    if(k>h-.14&&k<h&&!a['g'+i]){a['g'+i]=1;a['f'+i]=e.m.position.clone();a['t'+i]=n3Reach(e.m.position,e.m.position.clone().addScaledVector(a.d,.55))}
    if(a['f'+i]&&k<h+.02)n3Glide(e,a['f'+i],a['t'+i],Math.min(1,(k-(h-.14))/.14));
    if(k>=h&&!a.st[i]){a.st[i]=1;const p=gY(e.m.position,1.2).addScaledVector(a.d,1.2);
      if(i<2){fxClaw(gY(e.m.position,0).addScaledVector(a.d,1.3),s6Rot(a.d,i?-.35:.35),AO.acid,3,1.3,260);n3Slash(p,a.d,AO.acid,2.2,260,i?-.8:.8);burst(p,AO.acid,14,1.6,1,.4);n3Snd(p,'stab',.7);
        if(s6InCone(a,e.m.position,a.d,2.9,.85))s6Hit(e,a,.75)}
      else{const q=gY(e.m.position,0).addScaledVector(a.d,1.5);n3Flash(q,AO.acid,1.8,420);ring(q,AO.acid,2.2,360);fxCracks(gY(q,0),0x1a1a10,7,2,700);n3Chunks(gY(q,.2),0x3a3428,6,2.6,6,.12);n3Shake(q,.12);n3Snd(q,'boom',.7);
        if(s6InCone(a,e.m.position,a.d,3.1,.85)){s6Hit(e,a,1.1);n3Shove(a,e.m.position,2.2,260);s6Dot(e,a,.12,3,1,0xd04a4a,'Rent')}}}}}}});
n3Mv('akleap',{nm:'Carapace Crash',ic:'💥',an:'ao_leap',rmin:3,rmax:9,wind:.8,act:.7,rec:.75,cd:5.2,dmg:1.45,sh:'circle',r:2.5,at:'tg',
 x6:{start(e,a){const L=n3Reach(a.o,a.tp,.6);a.L=L;n3Aim(a,L)},
  rel(e,a){const p=e.m.position;burst(gY(p,.2),0x3a3428,22,2,1.4,.5);n3Chunks(gY(p,.2),0x3a3428,5,2,6,.12);n3Snd(p,'blunt',.6)},
  tick(e,a,ph,k,dt,now,P){if(ph==1){n3Glide(e,a.o,a.L,ATK_E.io(k));P.y=Math.sin(Math.PI*k)*2.8/(e.m.bs||1);if(Math.random()<.5)burst(gY(e.m.position,1+P.y*e.m.bs),AO.acid,1,.3,.2,.3)}},
  land(e,a){const p=a.L.clone();e.m.position.x=p.x;e.m.position.z=p.z;n3Flash(p,AO.acid,2.6,520);ring(p,AO.acid,3,420);burst(gY(p,.3),0x5a5040,30,3,2,.6);n3Chunks(gY(p,.3),0x3a3428,10,3.6,7,.16);
   for(let i=0;i<10;i++){const an=i/10*6.283,q=V(p.x+Math.cos(an)*1.9,0,p.z+Math.sin(an)*1.9);n3Spike(q,i%2?AO.c2:AO.edge,s6R(.75,1.1),.34,1.1,{geo:'shard',tx:Math.sin(an)*.4,tz:-Math.cos(an)*.4,delay:.03*i%3})}
   n3Shake(p,.18);n3Snd(p,'boom',.9);
   if(s6InC(a,p,2.5)){s6Hit(e,a,1.45);n3Shove(a,p,1.8,260)}n3Shock(e,a,p,4.6,AO.acid,560,.45,'p',null,1)}}});

// ---------------- where they live ----------------
n3Zone(0,1,{roam:[['amalgam',3],['akidon',3],['goo',1],['spitter',1]],camps:[
  {n:'Amalgam Seep',mem:[['amalgam',3],['spitter',1]],b:'bog'},{n:'Akidon Brood',mem:[['akidon',3],['maggot',1]],b:'mire'},{n:'Glowmire Warren',mem:[['amalgam',1],['akidon',2]],b:'web'}]});
n3Zone(0,2,{roam:[['lichen',3],['akorror',2],['akidon',2],['amalgam',1]],camps:[
  {n:'Lichen Grove',mem:[['lichen',3],['amalgam',1]],b:'shroom'},{n:'Akorror Hive',mem:[['akorror',2],['akidon',2]],b:'web'},{n:'Rotheart Hollow',mem:[['lichen',2],['akorror',1]],b:'haunt'}]});
})();
