// ================= v113 The Citadel: Rampart Gargoyle, Blood Hound (II · Outer Ramparts) · Crimson Executioner, Nosferatu (III · Inner Keep) =================
// Gargoyles crawl down off the siege walls and the vampires' hounds run the ramparts; inside the keep the Executioner keeps
// his block, and the oldest of the vampires, the Nosferatu, stalks the blood gardens.
(function(){
// ===================================================================== Rampart Gargoyle =====================================================================
const GG={st:0x58565a,st2:0x3e3d42,dark:0x222126,moss:0x4a5a3a,eye:0xff5a2a,claw:0x1a1a1e};
n3Def('gargoyle',{n:'Rampart Gargoyle',e:'🗿',fam:'Earth',mt:'p',w:{hp:1.45,pa:1.25,ma:.6,pd:1.55,md:1.0},
 hum:{skin:[106,106,112],tunic:0x4a4a52,cape:[74,74,82],pants:[74,74,82],sc:1.38,wpn:'none'},
 moves:['strike','stonedive','stoneskin'],basic:{strike:'gg_rake'},stance:{sx:.32,hx:-.32,lk:.3,rk:.3,lh:-.15,rh:-.15,dy:-.06,ax:-.3,lx:-.3,az:.15,lz:-.15,ex:-.6,le:-.6},
 body(B,P,k){const C=GG;P.build=2;P.af=1.15;P.lf=1.15;P.head={w:1.12,jaw:1.25,top:.85,fwd:.03};P.sq=.3;
  Object.assign(P.col,{skin:C.st,torso:C.st,sleeve:C.st,fore:C.st,hand:C.st2,pants:C.st2,shin:C.st,boot:C.st2,sole:C.dark,belt:null,neck:C.st2});
  // weathered stone: cracks and lichen where the rain has run down it
  n3Paint(P,(m,s,part)=>{const n=n3Sn(m.x,m.y,m.z,10,6),r=n3Nz(m.x,m.y,m.z,6);if(r>.94)return C.dark;if(n>.74&&m.s>-.2)return C.moss;return n<.35?C.st2:C.st});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.eye,brow:C.st2,ears:false,nose:false,mouth:false,noHair:true,headCol:m=>n3Sn(m.x,m.y,m.z,15,3)>.72?C.moss:C.st});
  const z=y=>mdHeadZ(P,y);
  // a snarling grotesque: curled ram horns, pointed ears, a fanged snout, a stone brow
  mdNose(k,P,C.st2,1.4);k.p('head','box','c',0x0a0a0c,0,1.075,z(1.075),.08,.03,.02);[-1,1].forEach(s=>{k.p('head','cone4','c',0xd8d0c0,s*.03,1.09,z(1.09)+.002,.01,.04,.01,Math.PI);k.p('head','cone4','c',0xd8d0c0,s*.035,1.06,z(1.06)+.002,.009,.03,.009)});
  mdEars(k,P,C.st,1.4,.02);[-1,1].forEach(s=>{let a=[s*.07,1.22,-.0],d=[s*.6,.5,-.6];for(let i=0;i<6;i++){const b=[a[0]+d[0]*.05,a[1]+d[1]*.05,a[2]+d[2]*.05];k.L('head','c',i%2?C.st2:C.dark,a,b,.026-i*.003,.022-i*.003,5);a=b;d=[d[0]-s*.15,d[1]-.35,d[2]+.25]}});
  // great folded stone wings on the back (membranes between finger-bones), spines down the back, a curling tail
  [-1,1].forEach(s=>{const root=[s*.1,.98,-.12],el=[s*.42,1.28,-.3];k.L('chest','c',C.st2,root,el,.04,.03,6);
    for(let f=0;f<4;f++){const tip=[s*(.36+f*.1),1.28-f*.24,-.36-f*.03];k.L('chest','c',C.st2,el,tip,.022,.008,5);if(f<3){const t2=[s*(.46+(f+1)*.1),1.28-(f+1)*.24,-.39-f*.03];
      k.p('chest','cone4','c',C.dark,(el[0]+tip[0]+t2[0])/3,(el[1]+tip[1]+t2[1])/3,(el[2]+tip[2]+t2[2])/3-.01,.11,.22,.008,0,s*.25,-s*(.6+f*.35))}}});
  for(let i=0;i<6;i++){const y=.98-i*.07,p=n3Surf(P,y,Math.PI,.01);k.p(n3TB(y),'cone4','c',C.dark,0,y,p[2]-.02,.022,.08,.02,-1.2)}
  {const T=[[0,.56,-.13],[0,.4,-.3],[0,.24,-.4],[.08,.12,-.5],[.2,.1,-.56],[.28,.16,-.6]];for(let i=0;i<T.length-1;i++)k.L('pelvis','c',C.st2,T[i],T[i+1],.05-i*.008,.042-i*.008,6);k.p('pelvis','cone4','c',C.dark,.3,.18,-.62,.04,.1,.012,0,0,-1)}
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];for(let f=0;f<3;f++)n3Claw(k,a,C.claw,[W[1]+(f-1)*.025,W[2]-.08,W[3]+.03],[(f-1)*.15,-.8,.6],.13,.016,.5,3);
    const l=s<0?'lh2':'rh2',F=P.bones[l];for(let f=0;f<3;f++)n3Claw(k,l,C.claw,[F[1]+(f-1)*.04,.04,F[3]+.13],[0,-.3,1],.08,.016,.6,3)});
 },
 bfx(e,a){const p=gY(e.m.position,0).addScaledVector(a.d,1.2);fxClaw(p,a.d,0xd8d8e0,3,1.1,240);burst(gY(p,1),GG.st,10,1.2,.8,.4)}});
n3Hum('gg_rake',[[.55,{sy:.6,py:.2,ax:-2.6,az:.9,ex:-.9,rw:-.4,lx:-.5,le:-.8,rk:.2}],[1,{sy:.7,ax:-2.8,az:1.0}],[1.42,{sy:-.5,py:-.25,sx:.42,ax:-.9,az:-.5,ex:-.1,rw:.5,lh:-.35,rh:.25,lk:.5,dy:-.08,Bz:.2}],
  [1.8,{sy:-.7,ax:-.5,az:-.8,Bz:.16}],[2.4,{sy:-.15,sx:.1,ax:-.4,az:-.2,ex:-.4,lx:-.3,le:-.4,lh:0,rh:0,lk:.05,dy:-.02,Bz:0}]]);
// rampart dive: crouches, beats its stone wings and leaps high, then drops onto you like a falling statue
n3Hum('gg_dive',[[.7,{sx:.5,ax:.4,lx:.4,az:.6,lz:-.6,ex:-.4,le:-.4,lk:1.1,rk:1.1,lh:-.7,rh:-.7,dy:-.25,hx:-.3}],[1,{sx:.55,dy:-.27}],[1.2,{sx:-.3,ax:-2.4,az:1.2,lx:-2.4,lz:-1.2,ex:-.3,le:-.3,lk:.4,rk:.4,lh:-.3,rh:-.3,dy:0,hx:-.2}],
  [1.75,{sx:.6,ax:-.5,lx:-.5,az:.4,lz:-.4,lk:.7,rk:.7,lh:-.8,rh:-.8,hx:.1}],[2.0,{sx:.8,ax:-.3,lx:-.3,lk:1.2,rk:1.0,lh:-.6,rh:-.2,dy:-.26,hx:.2}],[2.4,{sx:.75,dy:-.25}],[2.8,{sx:.35,ax:-.3,lx:-.3,lk:.35,rk:.35,lh:-.15,rh:-.15,dy:-.06,hx:-.1}]]);
// granite shell: curls up into a crouch, wings wrapped round itself, and turns to solid stone; then bursts out
n3Hum('gg_shell',[[.5,{sx:.7,ax:-1.6,lx:-1.6,az:-.6,lz:.6,ex:-2.2,le:-2.2,lk:1.2,rk:1.2,lh:-.9,rh:-.9,dy:-.3,hx:.4}],[1,{sx:.75,dy:-.32}],[1.85,{sx:.75,dy:-.32}],
  [2.0,{sx:-.35,ax:-2.4,az:1.4,lx:-2.4,lz:-1.4,ex:-.2,le:-.2,lk:.2,rk:.2,lh:0,rh:0,dy:0,hx:-.3,By:.15}],[2.6,{sx:.3,ax:-.5,lx:-.5,az:.2,lz:-.2,ex:-.6,le:-.6,lk:.3,rk:.3,dy:-.06,hx:-.2,By:0}]]);
n3Mv('stonedive',{nm:'Rampart Dive',ic:'🦇',an:'gg_dive',rmin:3,rmax:9,wind:.75,act:.7,rec:.8,cd:5,dmg:1.45,sh:'circle',r:2.4,at:'tg',
 x6:{start(e,a){a.L=n3Reach(a.o,a.tp,.4);n3Aim(a,a.L)},rel(e,a){const p=e.m.position;burst(gY(p,.2),GG.st,20,2,1.2,.5);n3Chunks(gY(p,.1),GG.st2,4,2,5,.1);n3Snd(p,'blunt',.6)},
  tick(e,a,ph,k,dt,now,P){if(ph==1){n3Glide(e,a.o,a.L,ATK_E.io(k));P.y=Math.sin(Math.PI*Math.min(1,k*1.1))*3/(e.m.bs||1);if(Math.random()<.4)burst(gY(e.m.position,1+P.y*e.m.bs),GG.st,1,.3,-.5,.4)}},
  land(e,a){const p=a.L.clone();n3Flash(p,0xd8d0c8,2.4,460);ring(p,0xd8d0c8,3,400);n3Chunks(gY(p,.3),GG.st2,12,3.6,8,.16);fxCracks(gY(p,0),0x1a1a1a,10,2.6,900);burst(gY(p,.3),GG.st,30,3,2,.6);n3Shake(p,.2);n3Snd(p,'boom',.9);
   if(s6InC(a,p,2.4)){s6Hit(e,a,1.45);n3Shove(a,p,1.8,260);s6Deb(a,'Staggered','🗿',{mspd:-.4},1500,'Staggered: −40% move speed')}}}});
n3Mv('stoneskin',{nm:'Granite Shell',ic:'🛡️',an:'gg_shell',rmin:0,rmax:3,wind:.45,act:1.6,rec:.7,cd:9,dmg:.85,sh:'circle',r:3.2,at:'self',
 x6:{start(e,a){if(!e.mir){a.sh0=e.sh||0;e.sh=Math.max(e.sh||0,M(e.c)*.3)}popT(e.m.position,'Granite Shell!','#c8c8d0')},
  tick(e,a,ph,k){if(ph==1){if(!a.dm){a.dm=1;fxDome(()=>e.m.position,0xb8b8c0,1.1*e.m.bs,a.M.act*1000,true)}if(Math.random()<.3)burst(gY(e.m.position,s6R(.2,1.2)),GG.st,1,.2,.1,.5)}},
  land(e,a){const p=e.m.position.clone();if(!e.mir)e.sh=Math.min(e.sh||0,a.sh0||0);n3Flash(p,0xd8d0c8,3,460);n3Chunks(gY(p,1),GG.st,14,4.2,6,.14);ring(p,0xd8d0c8,3.4,420);n3Snd(p,'brk',.9);n3Shake(p,.12);
   for(let i=0;i<10;i++){const an=i/10*6.283;n3Spike(V(p.x+Math.cos(an)*2.2,0,p.z+Math.sin(an)*2.2),GG.st2,s6R(.5,.8),.22,.7,{geo:'shard',tx:Math.sin(an)*.6,tz:-Math.cos(an)*.6})}
   if(s6InC(a,p,3.2)){s6Hit(e,a,.85);n3Shove(a,p,1.6,220)}},end(e,a){if(!e.mir&&a.sh0!=null&&e.sh>a.sh0)e.sh=a.sh0}}});

// ===================================================================== Blood Hound =====================================================================
const BH={fur:0x2a1416,fur2:0x2a0a0e,blood:0xc81a2a,glow:0xff3a4a};
n3Def('bloodhound',{n:'Blood Hound',e:'🐺',fam:'Beast',mt:'p',w:{hp:1.05,pa:1.35,ma:.7,pd:.95,md:.9},
 rig:{name:'BloodHound',base:'Ashwolf',col:BH.fur,sc:1.35,
  kit(k,c,C,red){const P=wolfP;
   // raw, flayed flanks glistening red, glowing eyes, a spiked iron collar, blood drooling from its jaws
   [-1,1].forEach(s=>{k.p('head','sph','g',BH.glow,...P([s*.06,.72,.6]),.016,.012,.012);[0,1,2,3].forEach(i=>k.p(i<2?'chest':'spine','box','c',i%2?0x5a0a10:0x7a1018,...P([s*.135,.6-i*.015,.2-i*.09]),.01,.035+i%2*.01,.07,.2*i,0,s*.1))});
   for(let i=0;i<8;i++){const a=i/8*6.283;k.p('neck','cone4','m',0x3a3a40,...P([Math.cos(a)*.11,.62+Math.sin(a)*.1,.36]),.012,.05,.012,Math.sin(a)*1.5,0,-Math.cos(a)*1.5)}k.p('neck','ring','m',0x2a2a30,...P([0,.62,.36]),.12,.4,.11,Math.PI/2,0,0);
   for(let i=0;i<3;i++)k.L('jaw','c',BH.blood,P([(i-1)*.03,.6,.66]),P([(i-1)*.035,.5-i*.02,.68]),.008,.003,3);
  }},
 moves:['bite','bloodscent','savagemaul'],
 bfx(e,a){const p=gY(e.m.position,.6).addScaledVector(a.d,1.2);fxJaws(p,BH.glow,.7,240,Math.atan2(a.d.x,a.d.z));burst(p,BH.blood,10,1,.6,.4)}});
// hunting howl: throws back its head and howls; your scent is marked in blood
n3Cr('bh_howl',[[.6,{nk:-.6,hd:-.5,jw:.3,ex:.12,fh:-.15,Brx:-.2}],[1,{nk:-.7,hd:-.6,jw:.9,Brx:-.24}],[1.8,{nk:-.65,jw:1.0}],[2.4,{nk:0,hd:0,jw:0,ex:0,fh:0,Brx:0}]]);
// savage maul: springs onto you and savages you with two more bites
n3Cr('bh_maul',[[.6,{fh:-.15,fk:.6,hh:-.25,hk:.85,by:-.16,nk:-.2,jw:.3,tl:-.2,Brx:.1}],[1,{by:-.18,hk:.95}],[1.2,{fh:-.9,hh:.75,nk:-.2,jw:.6,Brx:-.35,By:.6}],[1.42,{fh:-.4,fk:.3,hh:-.3,hk:.5,jw:1.0,nk:.35,Brx:.3,By:0}],
  [1.52,{jw:.05}],[1.66,{nk:.1,jw:.9,sp:.4}],[1.76,{nk:.5,jw:.05,sp:-.4}],[1.88,{nk:.1,jw:.9,sp:.3}],[1.98,{nk:.5,jw:.05,sp:0}],[2.5,{fh:0,fk:0,hh:0,hk:0,by:0,nk:0,jw:0,tl:0,Brx:0}]]);
n3Mv('bloodscent',{nm:'Blood Scent',ic:'🩸',an:'bh_howl',rmin:0,rmax:9,wind:.7,act:.8,rec:.5,cd:9,dmg:.3,sh:'circle',r:1.5,at:'tg',mt:'m',
 x6:{tick(e,a,ph,k){if(ph==1&&!a.hw){a.hw=1;const p=gY(e.m.position,1.2*e.m.bs);fxWaves(p,a.d,BH.glow,4,4,600,3.14);n3Snd(p,'hiss',.7)}if(ph==1&&Math.random()<.4)burst(gY(a.tp,s6R(.3,1.6)),BH.blood,1,.3,.3,.5)},
  land(e,a){const p=a.tp.clone();fxSigil(p,BH.glow,1.4,700,5);fxPillar(p,BH.blood,.6,2.6,420);
   if(s6InC(a,p,1.5)){s6Hit(e,a,.3,'m');s6Deb(a,'Hunted','🩸',{pdP:-.2,mdP:-.2,mspd:-.15},7000,'Marked by the pack: −20% defence, −15% move speed')}
   // every hound nearby picks up the scent
   enemies.forEach(o=>{if(o!==e&&!o.dead&&o.c&&o.c.en=='bloodhound'&&d2(o.m.position,e.m.position)<14){o.agg=1;o.cd=Math.min(o.cd||0,.4)}})}}});
n3Mv('savagemaul',{nm:'Savage Maul',ic:'🐺',an:'bh_maul',rmin:2.4,rmax:7,wind:.65,act:.95,rec:.55,cd:4.6,dmg:.7,sh:'circle',r:1.8,at:'tg',
 x6:{start(e,a){a.L=n3Reach(a.o,a.tp,.9);n3Aim(a,a.L)},
  tick(e,a,ph,k,dt,now,P){if(ph!=1)return;if(k<.42){n3Glide(e,a.o,a.L,ATK_E.io(k/.42))}
   [[.42,'land'],[.66,'b1'],[.88,'b2']].forEach((q,i)=>{if(k>=q[0]&&!a[q[1]]){a[q[1]]=1;const p=gY(e.m.position,.6).addScaledVector(a.d,1);fxJaws(p,BH.glow,.8,240,Math.atan2(a.d.x,a.d.z)+(i%2?.4:-.4));burst(p,BH.blood,12,1.2,.8,.4);n3Snd(p,'stab',.6);
     if(i==0){ring(e.m.position,BH.blood,1.8,300);burst(gY(e.m.position,.1),0x4a2a20,14,1.6,.8,.4)}
     if(s6InC(a,e.m.position.clone().addScaledVector(a.d,.9),1.8)){s6Hit(e,a,.7);if(i==2)s6Dot(e,a,.1,4,1,0xd04a4a,'Bleeding')}}})}}});

// ===================================================================== Crimson Executioner =====================================================================
const EX={hood:0x34080e,hood2:0x4a0c14,skin:0x7a6252,leather:0x2a1a14,iron:0x3a3a40,blood:0xa01a24,glow:0xff3040};
n3Def('executioner',{n:'Crimson Executioner',e:'🪓',fam:'Spirit',mt:'p',w:{hp:1.7,pa:1.45,ma:.5,pd:1.35,md:1.1},
 hum:{skin:[184,160,144],tunic:0x2a1a14,cape:[90,16,24],pants:[42,26,20],sc:1.45,wpn:'ga',wcol:0x8a2a30},
 moves:['strike','verdict','crimsonwhirl'],basic:{strike:'ex_chop'},
 body(B,P,k){const C=EX;P.build=2;P.belly=.12;P.af=1.35;P.lf=1.2;
  Object.assign(P.col,{skin:C.skin,torso:C.skin,sleeve:C.skin,fore:C.skin,hand:C.leather,pants:C.leather,shin:C.leather,boot:C.leather,sole:0x0a0806,belt:C.iron,neck:C.skin});
  P.look={hair:0x1a1010,hairStyle:5,face:0};
  // a bare, scarred, blood-spattered torso under a leather apron; the pointed crimson hood with eye holes
  n3Paint(P,(m,s,part)=>{const r=n3Nz(m.x,m.y,m.z,9);if(r>.93)return 0x5a1016;if(!part&&m.s>.6&&Math.abs(m.c)<.25&&m.y>.78&&Math.round(m.y*50)%3==0)return mdSh(C.skin,.7);return null});
  for(const kk of['torso','sleeve','fore','hand','leg','torsoLo']){const f=P.paint[kk];P.paint[kk]=(m,s,pt)=>f(m,s,pt)||(kk=='hand'?C.leather:kk=='leg'?(m.y<.35?C.leather:mdSh(C.leather,1.3)):kk=='torsoLo'?C.leather:C.skin)}
  mdBody(B,P);mdHead(B,P,{noFace:true,headCol:()=>C.hood});
  const H=mdHeadR(P);mdLoft(B,H.map(r=>Object.assign({},r)),{seg:10,off:.012,capB:true,col:m=>m.y>1.22?C.hood2:C.hood});
  mdLoft(B,[{p:[0,1.24,0],rx:.07,f:.06,b:.07,w:[['head',1]]},{p:[0,1.34,-.03],rx:.035,f:.03,b:.035,w:[['head',1]]},{p:[0,1.42,-.07],rx:.008,f:.008,b:.008,w:[['head',1]]}],{seg:8,col:C.hood2});
  const z=mdHeadZ(P,1.15);[-1,1].forEach(s=>{k.p('head','box','c',0x050304,s*.04,1.15,z+.014,.035,.022,.01);k.p('head','box','g',C.glow,s*.04,1.15,z+.019,.015,.007,.004)});
  mdLoft(B,[{p:[0,1.03,0],rx:.2,f:.13,b:.14,w:[['neck',1]]},{p:[0,.98,0],rx:.26,f:.17,b:.17,w:[['chest',1]]},{p:[0,.9,0],rx:.27,f:.18,b:.18,w:[['chest',1]]}],{seg:12,off:.01,col:m=>Math.round(m.c*6)%2?C.hood:C.hood2});
  mdSkirt(B,P,.86,.36,.03,.02,{col:m=>m.y<.45?mdSh(C.leather,.7):C.leather,keep:m=>m.s>.1,n:5});mdStrap(B,P,C.iron);
  [-1,1].forEach(s=>{mdAS(B,P,s,4,6,.018,{col:C.leather});k.p(s<0?'aL0':'aR0','hem','m',C.iron,P.bones[s<0?'aL0':'aR0'][1]+s*.02,.985,0,.1,.07,.1,0,0,s*.35)});
  mdNeck(k,0xe8e0c8,C.iron,9);mdBoots(B,P,mdD('heavy','tread',C.leather,C.iron));
 },
 bfx(e,a){const p=gY(e.m.position,1.1).addScaledVector(a.d,1.2);n3Slash(p,a.d,EX.glow,2.2,260,.6);burst(p,EX.blood,12,1.4,.8,.45)}});
n3Hum('ex_chop',[[.6,{sy:.5,py:.2,sx:-.2,ax:-2.8,az:.5,ex:-1.1,lx:-2.6,lz:.2,le:-1.2,hx:-.1,rk:.25}],[1,{sy:.6,ax:-2.95,lx:-2.8,ex:-1.2}],
  [1.42,{sy:-.35,py:-.2,sx:.45,ax:-1.0,az:-.4,ex:-.1,lx:-1.0,lz:.3,le:-.3,lh:-.4,rh:.3,lk:.55,rk:.2,dy:-.1,Bz:.2}],[1.8,{sy:-.55,ax:-.6,lx:-.6,az:-.7,dy:-.11,Bz:.16}],
  [2.5,{sy:-.1,sx:.12,ax:-.6,az:-.1,ex:-.6,lx:-.5,lz:0,le:-.6,hx:0,lh:-.05,rh:.05,lk:.12,rk:.05,dy:-.03,Bz:0}]]);
// headsman's verdict: lifts the great axe high behind its head, holds it there, and brings it straight down
n3Hum('ex_verdict',[[.6,{sx:-.25,ax:-2.9,lx:-2.9,az:.15,lz:-.15,ex:-1.6,le:-1.6,hx:-.15}],[1,{sx:-.38,ax:-3.1,lx:-3.1,ex:-1.9,le:-1.9,hx:-.2,By:.04}],
  [1.6,{sx:.85,ax:-.5,lx:-.5,ex:-.05,le:-.05,hx:.25,lh:-.5,rh:.4,lk:.95,rk:.6,dy:-.2,By:-.02}],[2.4,{sx:.82,dy:-.19,By:0}],[2.8,{sx:.25,ax:-.6,lx:-.6,ex:-.5,le:-.5,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// crimson whirl: spins twice with the axe held out at arm's length, walking forward
n3Hum('ex_whirl',[[.6,{sy:-.8,py:-.4,sx:.15,ax:-1.4,az:1.3,ex:-.3,lx:-1.3,lz:1.0,le:-.9,lk:.4,rk:.4,dy:-.08}],[1,{sy:-.9,py:-.45}],
  [1.08,{sy:.2,py:.1,ax:-1.5,az:1.45,ex:-.05,lx:-1.5,lz:1.2,le:-.5,Bry:.5}],[1.9,{Bry:12.57}],[2.05,{Bry:12.57,sy:.4,py:.2,az:.5,lz:.4}],[2.6,{sy:0,py:0,sx:0,ax:-.5,az:0,ex:-.5,lx:-.5,lz:0,le:-.5,lk:.1,rk:.1,dy:-.02}]]);
n3Mv('verdict',{nm:'Headsman\'s Verdict',ic:'⚖️',an:'ex_verdict',rmin:0,rmax:4.4,wind:1.45,act:.35,rec:1.0,cd:6,dmg:2.0,sh:'line',w:1.3,l:4.8,
 x6:{tick(e,a,ph,k){if(ph==0&&k>.6&&Math.random()<.5)burst(kqHand(e,V()),EX.glow,1,.3,.4,.3);
   if(ph==1&&k>=.6&&!a.hit){a.hit=1;const p=a.o.clone().addScaledVector(a.d,2.4);n3Flash(p,EX.glow,1.4,420);fxCracks(gY(p,0),0x2a0a0a,7,2.2,900);burst(gY(p,.3),EX.blood,26,2,1.6,.5);n3Chunks(gY(p,.2),0x3a2a24,6,2.4,5,.12);n3Shake(p,.2);n3Snd(p,'crit',.9);
    x5('box',EX.glow,420,(kk,m)=>{m.material.opacity=1-kk},{p:gY(a.o,.1).addScaledVector(a.d,2.4),s:[1.2,.02,4.6],r:[0,Math.atan2(a.d.x,a.d.z),0]});
    if(s6InLine(a,a.o,a.d,1.3,4.8)){const low=s6T(a)===pl&&hero.hp<heroMax()*.4;s6Hit(e,a,low?2.8:2.0);if(low)popT(pl.position,'EXECUTED','#ff3040',true);s6Dot(e,a,.12,3,1,0xd04a4a,'Bleeding')}}}}});
n3Mv('crimsonwhirl',{nm:'Crimson Whirl',ic:'🌀',an:'ex_whirl',rmin:0,rmax:3.6,wind:.65,act:.9,rec:.7,cd:5,dmg:.85,sh:'circle',r:2.8,at:'self',
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(2.6,Math.max(.5,d2(a.o,a.tp)))))},
  tick(e,a,ph,k){if(ph!=1)return;n3Glide(e,a.o,a.to,ATK_E.io(k));if(Math.random()<.8)burst(gY(e.m.position,1),EX.blood,2,2.4,.3,.3);
   [.35,.85].forEach((h,i)=>{if(k>=h&&!a['h'+i]){a['h'+i]=1;const p=e.m.position.clone();x5(new THREE.RingGeometry(1.6,2.5,32),EX.glow,300,(kk,m)=>{m.material.opacity=.8*(1-kk);m.rotation.z=kk*3},{p:gY(p,1),r:[-Math.PI/2,0,0]});n3Snd(p,'stab',.7);
     if(s6InC(a,p,2.8)){s6Hit(e,a,.85);if(i)s6Dot(e,a,.1,3,1,0xd04a4a,'Bleeding')}}})}}});

// ===================================================================== Nosferatu =====================================================================
const NF={skin:0xa8a49a,skin2:0x7e7a70,cloak:0x0e0608,cloak2:0x220609,claw:0x2a2420,eye:0xff2030,blood:0xb01020};
n3Def('nosferatu',{n:'Nosferatu',e:'🧛',fam:'Spirit',mt:'m',w:{hp:1.2,pa:1.2,ma:1.3,pd:1.0,md:1.2},
 hum:{skin:[200,196,184],tunic:0x1a0a10,cape:[58,10,20],pants:[26,10,16],sc:1.3,wpn:'none'},
 moves:['strike','exsang','bloodnova'],basic:{strike:'nf_claw'},stance:{sx:.25,hx:-.25,ax:-.6,lx:-.6,ex:-1.3,le:-1.3,az:-.15,lz:.15,lk:.1,rk:.1},
 body(B,P,k){const C=NF;P.af=.72;P.lf=.82;P.wf=.85;P.head={w:.92,len:1.1,top:1.15,jaw:.85};
  Object.assign(P.col,{skin:C.skin,torso:C.cloak,torsoLo:C.cloak,sleeve:C.cloak,fore:C.skin,hand:C.skin,pants:C.cloak,shin:C.cloak,boot:C.cloak,sole:0x0a0608,belt:null,neck:C.skin});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.eye,brow:false,ears:false,nose:false,mouth:false,bald:true,noHair:true,headCol:m=>m.s<-.3?C.skin2:C.skin});
  const z=y=>mdHeadZ(P,y);
  // the rat-like face: long hooked nose, two front fangs, deep sockets, great bat ears
  mdNose(k,P,C.skin2,1.8);[-1,1].forEach(s=>{k.p('head','cone4','c',0xf0ece0,s*.012,1.07,z(1.08)+.002,.008,.045,.008,Math.PI);k.p('head','box','c',C.skin2,s*.04,1.16,z(1.16)-.004,.04,.03,.01)});
  k.p('head','box','c',0x2a0a0e,0,1.082,z(1.082),.04,.006,.006);
  [-1,1].forEach(s=>{k.p('head','cone4','c',C.skin,s*(mdHeadX(P,1.17)+.04),1.2,-.01,.05,.16,.015,0,0,-s*.7);k.p('head','cone4','c',0x8a5a5a,s*(mdHeadX(P,1.17)+.045),1.2,.0,.03,.11,.01,0,0,-s*.7)});
  // a ragged high collar and a cloak that opens into bat wings, long clawed fingers
  dkHighCollar(k,C.cloak2,true);mdCape(B,P,C.cloak,{len:.55,w:1.25,trim:C.cloak2});
  [-1,1].forEach(s=>{const a=s<0?'aL1':'aR1';for(let i=0;i<3;i++){const q=n3ArmAt(P,s,.9+i*.35);k.p(q[3],'cone4','c',i%2?C.cloak:C.cloak2,q[0]+s*.06,q[1]-.04,q[2]-.03,.06,.2,.008,0,s*.3,s*(.3+i*.15))}
    const w=s<0?'aL2':'aR2',W=P.bones[w];for(let f=0;f<4;f++)n3Claw(k,w,C.claw,[W[1]+(f-1.5)*.016,W[2]-.07,W[3]+.02],[(f-1.5)*.08,-.95,.25],.2,.01,.25,4)});
  for(let i=0;i<9;i++){const x=-.2+i*.05;k.S('chest',i%2?C.cloak:C.cloak2,x,.98,-.16-Math.abs(x)*.1,.06,.8+((i*5)%4)*.08,0,.12,i)}
 },
 bfx(e,a){const p=gY(e.m.position,0).addScaledVector(a.d,1.2);fxClaw(p,a.d,NF.eye,4,1.1,240);burst(gY(p,1),NF.blood,10,1.2,.8,.4)}});
n3Hum('nf_claw',[[.55,{sy:.5,py:.2,sx:.1,ax:-2.4,az:.7,ex:-1.0,rw:-.3,lx:-.7,le:-1.0,rk:.2}],[1,{sy:.6,ax:-2.6,az:.8,ex:-1.1}],
  [1.42,{sy:-.5,py:-.25,sx:.45,ax:-.9,az:-.5,ex:-.05,rw:.4,lh:-.35,rh:.25,lk:.45,dy:-.08,Bz:.25}],[1.8,{sy:-.65,ax:-.5,az:-.8,Bz:.2}],[2.4,{sy:-.1,ax:-.6,az:-.15,ex:-1.0,lh:0,rh:0,lk:.05,dy:-.02,Bz:0}]]);
// exsanguinate: lunges, seizes you and drinks
n3Hum('nf_drain',[[.6,{sx:.5,ax:-1.2,lx:-1.2,az:.6,lz:-.6,ex:-.6,le:-.6,lk:.6,rk:.5,lh:-.3,dy:-.1,hx:-.2}],[1,{sx:.55,dy:-.12}],
  [1.25,{sx:.6,ax:-1.5,lx:-1.5,az:-.1,lz:.1,ex:-.5,le:-.5,lk:.4,rk:.2,lh:-.5,rh:.35,dy:-.08,hx:.2,Bz:.15}],[1.9,{sx:.65,hx:.3}],[2.4,{sx:.2,ax:-.6,lx:-.6,ex:-1.1,le:-1.1,lk:.1,rk:.1,lh:0,rh:0,dy:-.02,hx:-.1,Bz:0}]]);
// blood nova: rises off the ground, arms spread, pulling the blood out of the earth into itself, then bursts
n3Hum('nf_nova',[[.6,{sx:-.2,hx:-.3,ax:-1.9,az:1.3,lx:-1.9,lz:-1.3,ex:-.4,le:-.4,lk:.4,rk:.4,By:.5}],[1,{sx:-.3,hx:-.4,ax:-2.6,az:1.1,lx:-2.6,lz:-1.1,lk:.6,rk:.6,By:.9}],
  [1.1,{sx:.3,hx:.2,ax:-1.4,az:1.6,lx:-1.4,lz:-1.6,ex:-.05,le:-.05,lk:.2,rk:.2,By:.7}],[2.0,{By:.3}],[2.5,{sx:.2,hx:-.1,ax:-.6,az:-.1,lx:-.6,lz:.1,ex:-1.1,le:-1.1,lk:.1,rk:.1,By:0}]]);
n3Mv('exsang',{nm:'Exsanguinate',ic:'🩸',an:'nf_drain',rmin:0,rmax:3.4,wind:.75,act:1.0,rec:.6,cd:6,dmg:.45,sh:'line',w:1.2,l:3.6,mt:'m',
 x6:{start(e,a){a.to=n3Reach(a.o,a.o.clone().addScaledVector(a.d,Math.min(2.2,Math.max(.2,d2(a.o,a.tp)-1.1))))},
  tick(e,a,ph,k,dt){if(ph!=1)return;if(k<.22)n3Glide(e,a.o,a.to,ATK_E.out(k/.22));
   if(k>=.22&&!a.gr){a.gr=1;const t=s6T(a);if(t&&d2(t.position,e.m.position)<1.9*a.sz+.3){a.held=t;s6Hit(e,a,.45,'m');n3Snd(e.m.position,'stab',.7);if(t===pl&&hero.iv<=0)s6Deb(a,'Seized','🧛',{mspd:-1},800,'Held fast (dash out)')}else{n3Slash(gY(e.m.position,1.1).addScaledVector(a.d,.8),a.d,NF.eye,1.6,220,.3)}}
   if(a.held){a.tk=(a.tk||0)-dt;if(a.tk<=0&&k<.92){a.tk=.2;const t=a.held;if(d2(t.position,e.m.position)>2.6)a.held=null;else{s6Hit(e,a,.16,'m');
     for(let i=0;i<3;i++)n3Later(i*.05,()=>x5('oct',NF.blood,380,(kk,o)=>{if(!t.position)return;o.position.copy(gY(t.position,1).lerp(gY(e.m.position,1.2*e.m.bs),kk));o.position.y+=Math.sin(kk*Math.PI)*.3;o.scale.setScalar(.1)},{p:gY(t.position,1)}));
     if(!e.mir){const h=Math.round(M(e.c)*.025);e.c.h=Math.min(M(e.c),e.c.h+h);dn(e.m.position,'+'+h,'#ff6a8a',-10)}}}}}}});
n3Mv('bloodnova',{nm:'Blood Nova',ic:'💥',an:'nf_nova',rmin:0,rmax:4,wind:1.1,act:.35,rec:.8,cd:6,dmg:1.2,sh:'circle',r:3.8,at:'self',mt:'m',
 x6:{tick(e,a,ph,k){if(ph==0){if(Math.random()<.7){const an=s6R(0,6.283),r=s6R(2,4),q=V(e.m.position.x+Math.cos(an)*r,0,e.m.position.z+Math.sin(an)*r);
     x5('oct',NF.blood,500,(kk,o)=>{const c=gY(e.m.position,1.6*e.m.bs);o.position.copy(gY(q,.1).lerp(c,kk));o.scale.setScalar(.1*(1-kk*.5))},{p:gY(q,.1)})}
    if(k>.5&&!a.gl){a.gl=1;kqFlash(gY(e.m.position,1.6*e.m.bs),NF.eye,2,a.M.wind*500)}}},
  land(e,a){const p=e.m.position.clone();n3Flash(p,NF.blood,3.6,500);ring(p,NF.eye,3.6,420);burst(gY(p,1.4),NF.blood,40,3.6,1.4,.6);n3Snd(p,'boom',.8);n3Shake(p,.1);
   for(let i=0;i<6;i++){const d=V(Math.cos(i/6*6.283),0,Math.sin(i/6*6.283));s6Own(e,{tg:s6T(a)},'orb',NF.eye,d,9,.35,'m',.9,null,7)}
   if(s6InC(a,p,3.8)){s6Hit(e,a,1.2,'m');s6Dot(e,a,.1,3,1,0xd04a4a,'Bleeding')}}}});

// ---------------- where they live ----------------
n3Zone(5,1,{roam:[['gargoyle',3],['bloodhound',3],['vamp',1],['bloodbat',1]],camps:[
  {n:'Gargoyle Parapet',mem:[['gargoyle',3]],b:'fort'},{n:'Hound Kennels',mem:[['bloodhound',3],['vamp',1]],b:'wolf'},{n:'Siege Breach',mem:[['gargoyle',1],['bloodhound',2],['vampk',1]],b:'orc'}]});
n3Zone(5,2,{roam:[['executioner',2],['nosferatu',3],['bloodhound',1],['vampm',1]],camps:[
  {n:'Execution Yard',mem:[['executioner',2],['vamp',1]],b:'fort'},{n:'Nosferatu Crypt',mem:[['nosferatu',3]],b:'grave'},{n:'Blood Garden',mem:[['nosferatu',2],['executioner',1]],b:'ritual'}]});
})();
