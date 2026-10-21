// ================= v113 Searing Sands: Tomb Priest, Sun Scarab (II · Sunken Temple) · Salt Golem, Dust Wyrm (III · Salt Wastes) =================
// The buried temple still has its priests (wrapped in linen, cursing with scarabs) and its sacred beetles; out on the salt
// flats the ground itself rises up as golems of salt crystal, and great wyrms swim through the dust.
(function(){
// ===================================================================== Tomb Priest =====================================================================
const TP={wrap:0xa8946a,wrap2:0x6e5e40,dark:0x2e2418,gold:0xc8a040,lapis:0x2a4a8a,eye:0xffb030,glow:0xffd060,scarab:0x2a3a2a};
n3Def('tombpriest',{n:'Tomb Priest',e:'🧟',fam:'Spirit',mt:'m',ranged:1,role:'caster',w:{hp:.95,pa:.5,ma:1.35,pd:.9,md:1.25},
 hum:{skin:[200,180,138],tunic:0x9a8660,cape:[60,70,120],pants:[150,130,96],sc:1.18,wpn:'staff',wcol:0xc8a040},
 moves:['bolt','bindwraps','scarabplague'],stance:{sx:.08,hx:-.05},
 body(B,P,k){const C=TP;P.af=.85;P.lf=.9;P.wf=.94;
  Object.assign(P.col,{skin:C.wrap,torso:C.wrap,sleeve:C.wrap,fore:C.wrap,hand:C.wrap2,pants:C.wrap,shin:C.wrap,boot:C.wrap2,sole:C.dark,belt:C.gold,neck:C.wrap});
  // linen bandages in diagonal bands, darker where they are stained, gaps showing the dried body underneath
  n3Paint(P,(m,s,part)=>{const b=Math.round(m.y*30+m.c*2.5+m.s*1.5)%3,n=n3Nz(m.x,m.y,m.z,4);if(n>.9)return C.dark;return b==0?C.wrap2:b==1&&n>.5?mdMix(C.wrap,C.wrap2,.45):C.wrap});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.eye,brow:false,ears:false,nose:false,mouth:false,noHair:true,headCol:m=>Math.round(m.y*40+m.c*2)%3==0?C.wrap2:C.wrap});
  // a striped nemes headdress, a gold collar and a scarab pectoral, a kilt of linen and gold
  const nem=mdD('cloth','linen',C.lapis,C.gold);mdHelm(B,P,nem);mdTS(B,P,.9,1.0,.03,{t:'m',col:m=>Math.round(m.y*60)%2?C.gold:C.lapis,lip:.04});
  const z=mdTorsoAt(P,.82).f;k.p('chest','sph','m',C.gold,0,.83,z+.02,.05,.04,.02);k.p('chest','sph','g',C.glow,0,.835,z+.035,.025,.02,.01);[-1,1].forEach(s=>k.p('chest','box','m',C.gold,s*.06,.84,z+.015,.06,.02,.01,0,0,s*.4));
  mdSkirt(B,P,.6,.44,.025,.025,{col:m=>Math.round(m.c*8)%2?mdSh(C.wrap2,.8):C.gold,n:5});mdTS(B,P,.58,.62,.03,{t:'m',col:C.gold});
  // trailing loose bandages
  for(let i=0;i<6;i++){const q=n3ArmAt(P,i%2?1:-1,.5+i*.25);k.S(q[3],C.wrap2,q[0],q[1],q[2]-.02,.03,.18+(i%3)*.06,(i%2?1:-1)*1.3,.1,i)}
  for(let i=0;i<4;i++){const a=Math.PI+(-1+i*.66)*.6,p=n3Surf(P,.55,a,.02);k.S('pelvis',C.wrap2,p[0],p[1],p[2],.04,.3+(i%2)*.1,a,0,i+2)}
 },
 bfx0(e,a){burst(kqHand(e,V()),TP.glow,12,1,1,.35);x5emo('🪲',kqHand(e,V()),400,(k,s)=>{s.position.y+=.01;s.material.opacity=1-k},.3)}});
// binding wraps: sweeps both arms out, the bandages whipping off them toward you
n3Hum('tp_wraps',[[.6,{sy:.5,ax:-1.4,az:.9,ex:-1.2,lx:-1.4,lz:-.9,le:-1.2,sx:-.1,hx:-.1}],[1,{sy:.55,ax:-1.5,az:1.0,lx:-1.5,lz:-1.0}],[1.15,{sy:-.15,ax:-1.6,az:-.2,ex:-.05,lx:-1.6,lz:.2,le:-.05,sx:.25,lk:.3,dy:-.05}],
  [1.9,{sy:-.1}],[2.5,{sy:0,ax:-.4,az:0,ex:-.4,lx:-.4,lz:0,le:-.4,sx:0,hx:0,lk:0,dy:0}]]);
// scarab plague: raises the staff, then points it down at the ground ahead, beetles pouring from beneath its robes
n3Hum('tp_plague',[[.6,{ax:-2.9,az:.2,ex:-.3,lx:-1.0,lz:-.4,le:-.6,sx:-.2,hx:-.3}],[1,{ax:-3.0,sx:-.25,hx:-.35}],[1.2,{ax:-1.1,az:.1,ex:-.1,lx:-.8,lz:-.6,le:-.4,sx:.3,hx:.15,lk:.25,rk:.1,dy:-.04}],[2.1,{ax:-1.15,sx:.3}],
  [2.6,{ax:-.4,az:0,ex:-.4,lx:-.3,lz:0,le:-.4,sx:0,hx:0,lk:0,rk:0,dy:0}]]);
n3Mv('bindwraps',{nm:'Binding Wraps',ic:'🎗️',an:'tp_wraps',rmin:1.5,rmax:7.5,wind:.8,act:.5,rec:.6,cd:5.4,dmg:.75,sh:'line',w:1.0,l:7.8,mt:'m',
 x6:{rel(e,a){a.ws=[];for(let i=0;i<3;i++){const g=new THREE.Mesh(n3Geo('box'),n3Mat(i%2?TP.wrap:TP.wrap2,{side:THREE.DoubleSide}));g.userData.lpsSkip=1;scene.add(g);a.ws.push(g)}n3Snd(e.m.position,'hiss',.6)},
  tick(e,a,ph,k){if(ph!=1||!a.ws)return;const o=gY(e.m.position,1.1*e.m.bs),L=7.6*Math.min(1,k/.55);a.ws.forEach((g,i)=>{const d=s6Rot(a.d,(i-1)*.08*(1-k)),q=o.clone().addScaledVector(d,L/2);q.y+=Math.sin(k*20+i*2)*.12;g.position.copy(q);g.scale.set(.14,.012,Math.max(.05,L));g.lookAt(o.clone().addScaledVector(d,L));g.rotation.z+=Math.sin(k*14+i)*.6});
   if(!a.hit&&k>.25){const t=s6T(a);if(t&&s6InLine(a,a.o,a.d,1.0,L)){a.hit=1;s6Hit(e,a,.75,'m');if(n3Me(a)){s6Deb(a,'Bound','🎗️',{mspd:-1},1100,'Wrapped in grave linen (dash out)');n3Pull(a,e.m.position,1.6,300,2.2)}}}},
  land(e,a){if(a.ws){a.ws.forEach(g=>scene.remove(g));a.ws=null}},end(e,a){if(a.ws){a.ws.forEach(g=>scene.remove(g));a.ws=null}}}});
n3Mv('scarabplague',{nm:'Scarab Plague',ic:'🪲',an:'tp_plague',rmin:0,rmax:8,wind:.95,act:.9,rec:.6,cd:5.6,dmg:.3,sh:'line',w:1.8,l:8.2,mt:'m',
 x6:{tick(e,a,ph,k,dt){if(ph==0&&k>.4&&Math.random()<.4)burst(gY(e.m.position,.2),TP.scarab,2,.8,.3,.4);if(ph!=1)return;
   // a carpet of beetles scurries out along the ground, hurting whatever it runs over
   a.bt=(a.bt||0)-dt;if(a.bt<=0){a.bt=.04;for(let i=0;i<2;i++){const off=s6R(-.8,.8),side=s6Rot(a.d,Math.PI/2),start=e.m.position.clone().addScaledVector(side,off*.3).addScaledVector(a.d,.6);
     const b=new THREE.Mesh(n3Geo('sph'),n3Mat(i%2?TP.scarab:0x1a2214,{metalness:.5,roughness:.3}));b.scale.set(.2,.1,.26);b.userData.lpsSkip=1;scene.add(b);let t=0;const sp=s6R(6,8),wob=s6R(0,6);
     kqFx({tick(dt2){t+=dt2;const L=t*sp,p=start.clone().addScaledVector(a.d,L).addScaledVector(side,off*Math.min(1,L/3)+Math.sin(t*14+wob)*.12);b.position.set(p.x,GH(p.x,p.z)+.05,p.z);b.rotation.y=Math.atan2(a.d.x,a.d.z)+Math.sin(t*20+wob)*.4;return L<8.2&&!solid(p.x,p.z)},end(){scene.remove(b)}})}}
   a.tk=(a.tk||0)-dt;if(a.tk<=0&&k>.2){a.tk=.3;if(s6InLine(a,a.o,a.d,1.8,8.2*Math.min(1,k*1.3))){s6Hit(e,a,.3,'m');if(!a.dd){a.dd=1;s6Dot(e,a,.08,4,1,0x6a8a3a,'Scarab Bites')}}}}}});

// ===================================================================== Sun Scarab =====================================================================
const SC={shell:0x8a6a2a,shell2:0xb8902e,gold:0xe8c050,dark:0x2a1e10,glow:0xfff0a0,horn:0x3a2a14};
n3Def('scarab',{n:'Sun Scarab',e:'🪲',fam:'Swarm',mt:'p',w:{hp:1.4,pa:1.2,ma:.9,pd:1.45,md:1.1},
 rig:{name:'SunScarab',base:'Stoneshell',col:SC.shell,sc:1.6,noBaseKit:true,
  geo(C,c){return LPR.Stoneshell.geo(C,c)},
  kit(k,c,C,red){
   const domeY=(x,z)=>.22+.33*Math.sqrt(Math.max(0,1-(x/.36)**2-((z+.04)/.5)**2));
   // polished metallic elytra (two wing-cases over the rocky body), a seam between them, a gold sun disc
   [-1,1].forEach(sd=>{k.p('spine','hem','m',SC.shell,sd*.17,.2,-.05,.215,.38,.53,0,0,sd*.12);k.p('spine','hem','m',SC.shell2,sd*.2,.22,-.05,.16,.3,.46,0,0,sd*.18)});
   k.p('spine','box','m',SC.dark,0,.575,-.05,.014,.02,.9);for(let i=0;i<6;i++)[-1,1].forEach(sd=>k.p('spine','box','m',SC.gold,sd*(.08+i*.035),.56-i*i*.008,-.05,.012,.012,.7-i*.08,0,0,sd*(.2+i*.15)));
   k.p('spine','cyl','m',SC.gold,0,.585,.1,.08,.012,.08);k.p('spine','cyl','g',SC.glow,0,.59,.1,.04,.012,.04);
   k.L('head','c',SC.horn,[0,.33,.55],[0,.5,.66],.05,.025,6);k.L('head','c',SC.horn,[0,.5,.66],[0,.6,.58],.025,.004,5);[-1,1].forEach(s=>{k.p('head','sph2','g',red?0xff2a2a:0xd8a020,s*.07,.33,.55,.03,.025,.03);k.L('head','c',SC.horn,[s*.06,.3,.6],[s*.1,.28,.68],.012,.003,4)});
   [['fl2',-.155,.19],['fr2',.155,.19],['hl2',-.165,-.21],['hr2',.165,-.21]].forEach(f=>{[-1,1].forEach(i=>k.p(f[0],'cone4','c',SC.dark,f[1]+i*.03,.012,f[2]+.075,.012,.05,.012,Math.PI/2));k.L(f[0],'c',SC.dark,[f[1],.1,f[2]],[f[1]*1.4,.04,f[2]+.04],.02,.01,4)});
  }},
 moves:['bite','sunflare','hornheave']});
// solar flare: the wing-cases lift and the sun disc on its back blazes
n3Cr('sc_flare',[[.7,{nk:-.4,by:.06,fh:-.25,hh:.2,ex:.1,Brx:-.12,By:.06}],[1,{nk:-.45,ex:.14,Brx:-.15,By:.1}],[1.12,{nk:.2,ex:0,by:-.06,Brx:.06,By:0}],[2.3,{nk:0,by:0,fh:0,hh:0,Brx:0}]]);
// horn heave: drops its head, charges two steps and flicks its horn up
n3Cr('sc_heave',[[.6,{nk:.4,hd:.35,by:-.08,fh:-.2,hk:.5,Brx:.12}],[1,{nk:.45,hd:.4,Brx:.15}],[1.35,{nk:.5,hd:.4,Bz:.2,Brx:.18}],[1.55,{nk:-.6,hd:-.5,jw:.4,Brx:-.3,Bz:.25,By:.08}],[2.2,{nk:-.2,hd:-.1,Brx:0,Bz:0,By:0}],[2.6,{nk:0,hd:0,jw:0,by:0,fh:0,hk:0}]]);
n3Mv('sunflare',{nm:'Solar Flare',ic:'☀️',an:'sc_flare',rmin:0,rmax:3.4,wind:.9,act:.35,rec:.8,cd:5.4,dmg:.85,sh:'circle',r:3.8,at:'self',mt:'m',
 x6:{tick(e,a,ph,k){const p=gY(e.m.position,.6*e.m.bs);if(ph==0){if(!a.gl){a.gl=1;kqFlash(p,SC.glow,2.2,a.M.wind*900)}if(Math.random()<.6)burst(p,SC.gold,1,.6,.6,.35)}},
  land(e,a){const p=e.m.position.clone();n3Flash(p,SC.glow,3.4,520);kqFlash(gY(p,1),0xffffe0,7,320);try{fxaFlash(gY(p,1.5),0xffe8a0,8,320)}catch(_){}
   for(let i=0;i<12;i++){const an=i/12*6.283;x5('box',SC.glow,420,(kk,m)=>{m.material.opacity=1-kk;m.scale.set(.06,.06,3.6*kk)},{p:gY(p,.8),r:[0,an,0]}).position.addScaledVector(V(Math.sin(an),0,Math.cos(an)),0)}
   ring(p,SC.gold,3.6,420);n3Snd(p,'zap',.8);
   if(s6InC(a,p,3.8)){s6Hit(e,a,.85,'m');s6Deb(a,'Dazzled','☀️',{as:-.3,crit:-.1},3500,'Dazzled: −30% attack speed')}}}});
n3Mv('hornheave',{nm:'Horn Heave',ic:'🦏',an:'sc_heave',rmin:0,rmax:3.4,wind:.75,act:.6,rec:.75,cd:4.6,dmg:1.3,sh:'line',w:1.4,l:3.6,
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(1.6,Math.max(.2,d2(a.o,a.tp)-1.2))))},
  tick(e,a,ph,k){if(ph!=1)return;if(k<.5){n3Glide(e,a.o,a.to,ATK_E.in2(k/.5));if(Math.random()<.6)burst(gY(e.m.position,.1),0xd8b880,2,.8,.4,.35)}
   if(k>=.55&&!a.hit){a.hit=1;const p=gY(e.m.position,.4).addScaledVector(a.d,1.2*e.m.bs*.6);burst(p,SC.gold,14,1.2,1.4,.4);n3Snd(p,'blunt',.7);
    if(s6InLine(a,e.m.position,a.d,1.4,2.2)){s6Hit(e,a,1.3);if(n3Me(a)){s6Deb(a,'Tossed','🦏',{mspd:-1,as:-1},650,'Tossed into the air');n3Move(a.d,2.4,360);n3Later(.36,()=>{burst(gY(pl.position,.2),0xd8b880,18,1.6,1.2,.45);ring(pl.position,SC.gold,1.4,260)})}}}}}});

// ===================================================================== Salt Golem =====================================================================
const SG={salt:0x8e847c,salt2:0x6e655e,pink:0xa07c76,dark:0x4a403a,cry:0xd8ccc8,cry2:0xc8a6a2,core:0xff9a6a,glow:0xffd0b0};
n3Def('saltgolem',{n:'Salt Golem',e:'🧂',fam:'Earth',mt:'p',w:{hp:1.8,pa:1.3,ma:.7,pd:1.6,md:1.2},
 hum:{skin:[232,224,216],tunic:0xc8bcb4,cape:[200,190,180],pants:[200,190,180],sc:1.62,wpn:'none'},
 moves:['strike','saltring','saltshatter'],basic:{strike:'sg_punch'},stance:{sx:.1,hx:-.08,az:.12,lz:-.12},
 body(B,P,k){const C=SG;P.build=2;P.af=1.45;P.lf=1.3;P.sq=.6;P.wf=1.1;P.armX=.04;
  Object.assign(P.col,{skin:C.salt,torso:C.salt,sleeve:C.salt2,fore:C.salt,hand:C.salt2,pants:C.salt2,shin:C.salt,boot:C.salt2,sole:C.dark,belt:null,neck:C.salt2});
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,9,4);return n>.7?C.pink:n<.3?C.salt2:Math.round(m.y*20)%2?C.salt:mdSh(C.salt,.93)});
  mdBody(B,P);P.head={w:1.1,jaw:1.2,top:.8};mdHead(B,P,{noFace:true,headCol:m=>n3Sn(m.x,m.y,m.z,14,1)>.65?C.pink:C.salt});
  const z=y=>mdHeadZ(P,y);k.p('head','box','c',0x3a2a28,0,1.155,z(1.155)-.008,.12,.03,.02);[-1,1].forEach(s=>k.p('head','box','g',C.core,s*.035,1.155,z(1.155)+.004,.03,.012,.006));
  // crystal spires growing out of the shoulders and back, a molten glowing core cracked open in the chest
  const cr=(bn,x,y,zz,h,rx,rz,c2)=>{k.p(bn,'oct','c',c2==C.pink?C.cry2:C.cry,x,y+h*.4,zz,h*.22,h*.6,h*.22,rx,0,rz)};
  [-1,1].forEach(s=>{const A=P.bones[s<0?'aL0':'aR0'],a=s<0?'aL0':'aR0';for(let i=0;i<4;i++)cr(a,A[1]+s*(.04+i*.03),A[2]+.04,A[3]-.04+i*.03,.18-i*.03,-.2,-s*(.3+i*.2),i%2?C.pink:C.salt)});
  for(let i=0;i<7;i++){const y=.8+n3Nz(i,1,4)*.2,a=Math.PI+(n3Nz(i,2,4)-.5)*2,p=n3Surf(P,y,a,-.01);cr(n3TB(y),p[0],p[1],p[2],.16+n3Nz(i,3,4)*.12,-Math.cos(a)*.6-.3,Math.sin(a)*.6,i%3?C.salt:C.pink)}
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2,p=n3Surf(P,.86,0,-.01);k.p('chest','oct','g',i%2?C.core:C.glow,p[0]+Math.cos(a)*.035,p[1]+Math.sin(a)*.035,p[2],.02,.045,.015,0,0,a)}
  k.p('chest','oct','g',C.core,0,.86,mdTorsoAt(P,.86).f-.01,.05,.06,.03);
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];k.p(a,'dod','c',C.salt2,W[1]+s*.01,W[2]-.07,W[3]+.01,.09,.09,.09);for(let f=0;f<3;f++)cr(a,W[1]+(f-1)*.04,W[2]-.13,W[3]+.04,.1,Math.PI*.9,0,C.salt)});
 },
 bfx(e,a){const p=gY(e.m.position,1).addScaledVector(a.d,1.5);burst(p,SG.salt,14,1.6,1,.45);n3Chunks(p,SG.salt2,3,1.6,3,.08);n3Shake(e.m.position,.05)}});
// punch: a heavy straight punch with the whole body turning into it
n3Hum('sg_punch',[[.6,{sy:.6,py:.25,sx:-.08,ax:-1.2,az:.4,ex:-1.9,lx:-1.2,lz:-.2,le:-1.5,rk:.25,dy:-.03}],[1,{sy:.7,py:.3,ax:-1.25,ex:-2.0}],
  [1.4,{sy:-.45,py:-.25,sx:.3,ax:-1.55,az:-.05,ex:-.02,lx:-.6,le:-1.6,lh:-.35,rh:.25,lk:.45,dy:-.08,Bz:.25}],[1.8,{sy:-.5,ax:-1.5,Bz:.22}],[2.4,{sy:-.1,sx:.1,ax:-.5,az:.1,ex:-.4,lx:-.4,le:-.4,lh:0,rh:0,lk:.05,dy:-.02,Bz:0}]]);
// crystal eruption: drops to one knee and drives both fists into the ground
n3Hum('sg_quake',[[.6,{sx:-.25,ax:-2.6,lx:-2.6,az:.5,lz:-.5,ex:-1.1,le:-1.1,hx:-.2}],[1,{sx:-.35,ax:-2.9,lx:-2.9,ex:-.9,le:-.9,By:.06}],
  [1.5,{sx:.85,ax:-.2,lx:-.2,az:.2,lz:-.2,ex:-.1,le:-.1,hx:.25,lh:-.6,rh:.2,lk:1.1,rk:.4,dy:-.24,By:0}],[2.3,{sx:.8,dy:-.22}],[2.75,{sx:.25,ax:-.5,lx:-.5,ex:-.4,le:-.4,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// brine boulder: reaches over its shoulder, rips a crystal from its back and hurls it two-handed
n3Hum('sg_hurl',[[.5,{sy:-.2,ax:-2.9,az:-.4,ex:-1.4,lx:-2.9,lz:.4,le:-1.4,sx:-.2,hx:-.2}],[1,{sy:0,ax:-3.05,lx:-3.05,ex:-1.6,le:-1.6,sx:-.35,By:.04}],[1.1,{ax:-1.6,lx:-1.6,az:.1,lz:-.1,ex:-.1,le:-.1,sx:.4,lh:-.35,rh:.25,lk:.45,dy:-.08,By:0}],
  [1.8,{ax:-1.1,lx:-1.1,sx:.35}],[2.4,{ax:-.4,az:0,lx:-.4,lz:0,ex:-.4,le:-.4,sx:0,hx:0,lh:0,rh:0,lk:.05,dy:-.02}]]);
n3Mv('saltring',{nm:'Crystal Eruption',ic:'💎',an:'sg_quake',rmin:0,rmax:3.4,wind:1.0,act:.7,rec:.8,cd:5,dmg:1.1,sh:'circle',r:5,at:'self',
 x6:{tick(e,a,ph,k){if(ph!=1)return;if(!a.sl){a.sl=1;const p=e.m.position;n3Flash(p,SG.glow,2,420);n3Shake(p,.14);n3Snd(p,'brk',.8);burst(gY(p,.2),SG.salt,24,2.4,1.6,.5)}
   [0,.45].forEach((h,w)=>{if(k>=h&&!a['r'+w]){a['r'+w]=1;const R=w?4.2:2.4,n=w?16:10,p=e.m.position.clone();
     for(let i=0;i<n;i++){const an=i/n*6.283+w*.2,q=V(p.x+Math.cos(an)*R,0,p.z+Math.sin(an)*R);if(!s6Free(q.x,q.z))continue;n3Spike(q,i%3?SG.cry:SG.cry2,s6R(.7,1.15),.24,.95,{geo:'shard',tx:Math.sin(an)*.35,tz:-Math.cos(an)*.35,delay:.015*i,mat:{roughness:.25,metalness:.1,emissive:0x2a1a14}})}
     ring(p,SG.glow,R,360);const t=s6T(a);if(t){const dd=d2(t.position,p);if(Math.abs(dd-R)<1.0*a.sz&&!a['h'+w]){a['h'+w]=1;s6Hit(e,a,1.1);s6Deb(a,'Salt-scoured','💎',{pdP:-.2},4000,'Salt in your wounds: −20% physical defence')}}}})}}});
n3Mv('saltshatter',{nm:'Brine Boulder',ic:'🪨',an:'sg_hurl',rmin:2.6,rmax:9,wind:1.0,act:.7,rec:.65,cd:5,dmg:1.1,sh:'circle',r:1.9,at:'tg',
 x6:{tick(e,a,ph,k){if(ph==0&&k>.35){if(!a.cb){a.cb=new THREE.Mesh(n3Geo('shard'),n3Mat(SG.cry,{roughness:.25,emissive:0x2a1a14}));a.cb.scale.setScalar(.5);a.cb.userData.lpsSkip=1;scene.add(a.cb);burst(kqHand(e,V()),SG.salt,10,.8,1,.4)}
    const h=kqHand(e,V());a.cb.position.copy(h);a.cb.position.y+=.25*e.m.bs;a.cb.rotation.z=.3}},
  rel(e,a){if(a.cb){scene.remove(a.cb);a.cb=null}const g=new THREE.Group(),m=new THREE.Mesh(n3Geo('shard'),n3Mat(SG.cry,{roughness:.25,emissive:0x2a1a14}));m.scale.setScalar(.55);g.add(m);g.userData.spin=m;s6Lob(g,kqHand(e,V()),a.tp,3,a.M.act*1000,null,SG.salt)},
  land(e,a){const p=a.tp.clone();n3Flash(p,SG.glow,1.8,380);burst(gY(p,.4),SG.salt,30,2.4,1.8,.5);n3Snd(p,'brk',.8);n3Shake(p,.1);if(s6InC(a,p,1.9))s6Hit(e,a,1.1);
   // the boulder shatters: six shards skid outward along the ground
   for(let i=0;i<6;i++){const an=i/6*6.283+s6R(0,.5),d=V(Math.cos(an),0,Math.sin(an)),m=new THREE.Mesh(n3Geo('shard'),n3Mat(i%2?SG.cry:SG.cry2,{roughness:.3}));m.scale.setScalar(.22);m.userData.lpsSkip=1;scene.add(m);let L=0,hit=0;
     kqFx({tick(dt){const st=7*dt;L+=st;const q=m.position;q.set(p.x+d.x*L,GH(p.x+d.x*L,p.z+d.z*L)+.2,p.z+d.z*L);m.rotation.y+=.3;m.rotation.x=1.3;if(Math.random()<.5)burst(q,SG.salt,1,.2,.2,.3);
       const t=s6T(a);if(!hit&&t&&d2(t.position,q)<.7){hit=1;s6Hit(e,a,.35)}return L<3.6&&!solid(q.x,q.z)&&!hit},end(){burst(m.position,SG.salt,6,.6,.6,.3);scene.remove(m)}})}},
  end(e,a){if(a.cb){scene.remove(a.cb);a.cb=null}}}});

// ===================================================================== Dust Wyrm =====================================================================
const DW={sand:0xb89a62,sand2:0x8a6a3a,belly:0xd8c8a0,glass:0xff9a3a,tooth:0xf0e8d0};
n3Def('dustwyrm',{n:'Dust Wyrm',e:'🐛',fam:'Dragon',mt:'p',w:{hp:1.7,pa:1.3,ma:1.0,pd:1.3,md:1.1},
 rig:{name:'DustWyrm',base:'Gravewyrm',col:DW.sand,sc:2.1,
  kit(k,c,C,red){
   // a ring of glassy teeth around a round maw, armoured plates down the back, a sand-scoured crest
   for(let i=0;i<10;i++){const a=i/10*6.283;k.L('head','c',DW.tooth,[Math.cos(a)*.07,.38+Math.sin(a)*.07,.6],[Math.cos(a)*.035,.38+Math.sin(a)*.035,.68],.012,.002,3)}
   k.p('head','sph','c',0x2a0a04,0,.38,.62,.06,.06,.02);k.p('head','sph','g',DW.glass,0,.38,.6,.03,.03,.01);
   [-1,1].forEach(s=>k.p('head','sph','g',red?0xff2a2a:0xffb040,s*.07,.46,.52,.014));
   [[.3,'chest'],[.15,'chest'],[0,'spine'],[-.15,'spine'],[-.3,'pelvis'],[-.5,'tail0'],[-.7,'tail1'],[-.9,'tail1'],[-1.1,'tail2']].forEach((q,i)=>{const w=.16-i*.009;k.p(q[1],'box','c',i%2?DW.sand2:dkShade(DW.sand2,.75),0,.4-i*.012,q[0],w*1.6,.025,.12,-.25);[-1,1].forEach(sd=>k.p(q[1],'box','c',dkShade(DW.sand2,.85),sd*w*.75,.33-i*.01,q[0],.025,.1,.11,-.2,0,sd*.6));k.p(q[1],'cone4','c',dkShade(DW.sand2,.6),0,.44-i*.012,q[0]-.03,.015,.07,.02,-.7)});
  }},
 moves:['bite','wyrmbreach','glassbreath']});
// breach: rears up, dives into the ground; a ripple races through the sand and it erupts under you
n3Cr('dw_breach',[[.5,{nk:-.4,hd:-.3,jw:.3,tl:.3,Brx:-.3,By:.2}],[.75,{nk:.5,hd:.3,jw:.2,Brx:.6,By:.1}],[1,{By:-1.6,Brx:.7}],[1.85,{By:-1.6,Brx:.4}],[1.95,{By:.5,Brx:-.7,nk:-.3,jw:1.0}],[2.4,{By:0,Brx:0,nk:0,hd:0,jw:0,tl:0}]]);
// glassing breath: rears and lowers its head, then a jet of white-hot sand
n3Cr('dw_breath',[[.6,{nk:-.45,hd:-.35,jw:.4,ex:.12,tl:.3,Brx:-.3,By:.15}],[1,{nk:-.5,jw:.5,ex:.15,Brx:-.35,By:.2}],[1.1,{nk:.3,hd:.25,jw:1.1,ex:0,Brx:-.1,By:.12}],[1.95,{nk:.25,jw:1.05}],[2.4,{nk:0,hd:0,jw:0,tl:0,Brx:0,By:0}]]);
n3Mv('wyrmbreach',{nm:'Sand Breach',ic:'🌋',an:'dw_breach',rmin:2.6,rmax:9,wind:.75,act:.9,rec:.7,cd:5,dmg:1.4,sh:'circle',r:2.1,at:'tg',
 x6:{start(e,a){a.L=n3Reach(a.o,a.tp);n3Aim(a,a.L)},
  rel(e,a){const p=e.m.position;burst(gY(p,.1),DW.sand,30,2.4,1.8,.5);n3Chunks(gY(p,.1),DW.sand2,6,2.4,5,.12);n3Shake(p,.08);n3Snd(p,'blunt',.7);e.m.visible=true},
  tick(e,a,ph,k){if(ph==1){const u=Math.min(1,k/.85),q=V(a.o.x+(a.L.x-a.o.x)*u,0,a.o.z+(a.L.z-a.o.z)*u);if(Math.random()<.9){burst(gY(q,.1),DW.sand,3,1.2,1,.4);if(Math.random()<.3)fxCracks(gY(q,0),0x5a4020,3,.8,400)}
    if(k>.88&&!a.mv){a.mv=1;e.m.position.x=a.L.x;e.m.position.z=a.L.z}}},
  land(e,a){const p=a.L.clone();n3Flash(p,DW.glass,2.1,420);burst(gY(p,.3),DW.sand,40,3,3,.6);n3Chunks(gY(p,.2),DW.sand2,10,3,8,.15);ring(p,DW.belly,2.6,380);n3Shake(p,.16);n3Snd(p,'boom',.8);
   if(s6InC(a,p,2.1)){s6Hit(e,a,1.4);n3Shove(a,p,2,260)}}}});
n3Mv('glassbreath',{nm:'Glassing Breath',ic:'🔥',an:'dw_breath',rmin:0,rmax:7,wind:.85,act:.85,rec:.6,cd:5.4,dmg:.4,sh:'line',w:1.4,l:7.5,mt:'m',
 x6:{tick(e,a,ph,k,dt){const o=gY(e.m.position,.5*e.m.bs).addScaledVector(a.d,.7*e.m.bs);if(ph==0&&k>.5&&Math.random()<.6)burst(o,DW.glass,1,.3,.2,.3);if(ph!=1)return;
   if(!a.bm){a.bm=1;fxBeam(()=>o,()=>o.clone().addScaledVector(a.d,7.5).setY(GH(o.x+a.d.x*7.5,o.z+a.d.z*7.5)+.2),0xffd0a0,.32,a.M.act*1000,DW.glass);n3Snd(o,'hiss',.8)}
   if(Math.random()<.9)fxStream(o,a.d,Math.random()<.5?DW.glass:0xffe0b0,2,7.5,.06,360,'ico',.16);
   a.tk=(a.tk||0)-dt;if(a.tk<=0){a.tk=.22;if(s6InLine(a,a.o,a.d,1.4,7.5))s6Hit(e,a,.4,'m')}
   a.gp=(a.gp||0)-dt;if(a.gp<=0&&k>.2){a.gp=.18;const q=a.o.clone().addScaledVector(a.d,1.5+k*5.5);if(s6Free(q.x,q.z))s6Pool(e,q,.75,0xff8a3a,3000,.12,['Burning Glass','🔥',{mspd:-.2},'Molten glass: −20% move speed'])}}}});

// ---------------- where they live ----------------
n3Zone(3,1,{roam:[['tombpriest',2],['scarab',3],['scorp',2],['selem',1]],camps:[
  {n:'Temple Sanctum',mem:[['tombpriest',2],['scarab',2]],b:'tomb'},{n:'Scarab Hatchery',mem:[['scarab',3],['scorp',1]],b:'web'},{n:'Priests\' Necropolis',mem:[['tombpriest',3],['selem',1]],b:'ritual'}]});
n3Zone(3,2,{roam:[['saltgolem',2],['dustwyrm',2],['selem',1],['scarab',1]],camps:[
  {n:'Salt Pillars',mem:[['saltgolem',3]],b:'mega'},{n:'Wyrm Hollow',mem:[['dustwyrm',2],['saltgolem',1]],b:'wyrm'},{n:'Bleached Oasis',mem:[['saltgolem',1],['dustwyrm',1],['scorp',2]],b:'tomb'}]});
})();
