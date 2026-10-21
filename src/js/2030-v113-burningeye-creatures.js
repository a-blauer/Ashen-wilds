// ================= v113 Burningeye Summit: Rimeshell Crawler, Frost Wendigo (II · Rimecaverns) · Stormborn Jotun, Storm Harpy (III · Stormcrown) =================
// Deep in the ice caves: a crystal-backed spider of living ice and a starving antlered wendigo. On the frozen peak: a giant
// who calls lightning down with his hammer, and storm harpies diving out of the blizzard.
(function(){
// ===================================================================== Rimeshell Crawler =====================================================================
const RC={shell:0x8ab8d8,dark:0x2a3e58,ice:0xbfeaff,glow:0x5ad8ff,eye:0x9af0ff};
n3Def('rimecrawler',{n:'Rimeshell Crawler',e:'🕷️',fam:'Swarm',mt:'p',w:{hp:1.15,pa:1.2,ma:.9,pd:1.2,md:1.0},
 rig:{name:'Rimecrawler',base:'Cryptspider',col:0x4a6e94,sc:1.5,spit:RC.ice,
  geo(C,c){return n3Recolor('rc|'+C,LPR.Cryptspider.geo(C,c),0x7a1410,0x9ad8ff,.2)},
  kit(k,c,C,red){
   // a cluster of ice crystals growing out of the abdomen, frost on the legs' joints, glowing eyes
   [[0,.75,-.32,.06,.3,0,0],[.08,.72,-.38,.045,.22,.3,-.45],[-.08,.72,-.27,.045,.24,-.3,.45],[.05,.73,-.2,.035,.16,.2,.55],[-.06,.7,-.45,.04,.2,-.45,-.3],[.12,.66,-.28,.03,.14,.6,.25],[-.12,.66,-.36,.03,.14,-.5,-.6]].forEach((q,i)=>{const bn=q[2]<-.42?'tail1':q[2]<-.3?'tail0':'pelvis';
     k.p(bn,'cone4','g',i%2?RC.ice:RC.glow,q[0],q[1]+q[4]*.35,q[2],q[3],q[4],q[3],q[5],0,q[6]);k.p(bn,'cone4','c',RC.shell,q[0],q[1]+q[4]*.1,q[2],q[3]*1.4,q[4]*.45,q[3]*1.4,q[5],0,q[6])});
   for(let i=0;i<8;i++)k.p('head','sph','g',red?0xff2a2a:RC.eye,(i%4-1.5)*.03,.53+(i>3?.03:0),.5,.012+(i%3==0?.006:0));
   [-1,1].forEach(s=>k.p('head','cone4','c',RC.ice,s*.05,.45,.55,.014,.09,.014,Math.PI*.6,0,s*.2));
  }},
 moves:['bite','icelance','frostweb']});
// ice lances: rears up on its hind legs and stamps down; lines of ice spikes run out in a fan
n3Cr('rc_lance',[[.65,{fh:-1.0,fk:.4,by:.08,nk:-.3,jw:.4,Brx:-.4,By:.12}],[1,{fh:-1.15,Brx:-.48,By:.16}],[1.25,{fh:.35,fk:.1,by:-.1,nk:.3,jw:.9,Brx:.15,By:0}],[2.2,{fh:.2,by:-.06,Brx:.08}],[2.6,{fh:0,by:0,nk:0,jw:0,Brx:0}]]);
// frost web: lifts its abdomen and flicks a ball of frozen silk
n3Cr('rc_web',[[.6,{by:.04,nk:-.2,tl:.6,Brx:.25,Bz:-.06}],[1,{tl:.7,Brx:.3}],[1.15,{tl:-.2,nk:.2,jw:.7,Brx:-.1,Bz:.06}],[2,{tl:0,nk:0,jw:0,Brx:0,Bz:0}]]);
n3Mv('icelance',{nm:'Ice Lances',ic:'🧊',an:'rc_lance',rmin:0,rmax:6,wind:.8,act:.6,rec:.65,cd:4.6,dmg:1.05,sh:'cone',r:6,ang:.55,mt:'m',
 x6:{rel(e,a){burst(gY(e.m.position,.2),RC.ice,20,1.6,1.2,.45);n3Shake(e.m.position,.08)},
  tick(e,a,ph,k){if(ph!=1)return;const n=Math.floor(k*8);for(;(a.sn|0)<=n&&(a.sn|0)<8;a.sn=(a.sn|0)+1){const j=a.sn;[-.42,0,.42].forEach((an,li)=>{const d=s6Rot(a.d,an),q=a.o.clone().addScaledVector(d,1+j*.68);if(!s6Free(q.x,q.z))return;
     n3Spike(q,j%2?RC.ice:RC.shell,s6R(.7,1.1)*(1+j*.05),.2+j*.012,.9,{geo:'shard',mat:{emissive:0x0a2a40,roughness:.3}});burst(gY(q,.3),RC.ice,4,.6,1,.35);
     if(!a.hit){const t=s6T(a);if(t&&d2(t.position,q)<.8*a.sz+.25){a.hit=1;s6Hit(e,a,1.05,'m');s6Deb(a,'Chilled','❄️',{mspd:-.35},2500,'Chilled: −35% move speed')}}});
     if(j==0)n3Snd(a.o,'brk',.6)}}}});
n3Mv('frostweb',{nm:'Frost Web',ic:'🕸️',an:'rc_web',rmin:2.4,rmax:8.5,wind:.65,act:.6,rec:.5,cd:5.2,dmg:.6,sh:'circle',r:1.9,at:'tg',mt:'m',
 x6:{rel(e,a){const g=kqShot('orb',RC.ice,1.2);s6Lob(g,gY(e.m.position,.7*e.m.bs),a.tp,1.8,a.M.act*1000,null,RC.ice)},
  land(e,a){const p=a.tp.clone();fxWeb(p,0xd8f6ff,2,3200);fxWeb(p,RC.glow,1.2,3200);burst(gY(p,.4),RC.ice,26,2,1.4,.5);n3Snd(p,'hiss',.6);
   if(s6InC(a,p,1.9)){s6Hit(e,a,.6,'m');s6Deb(a,'Frost-webbed','🕸️',{mspd:-1},1000,'Stuck in frozen silk (dash out)')}
   s6Pool(e,p,1.9*a.sz,0x9ad8ff,3200,0,['Frost-webbed','🕸️',{mspd:-.5},'Frozen silk: −50% move speed'])}}});

// ===================================================================== Frost Wendigo =====================================================================
const WD={fur:0x46423c,fur2:0x2e2b28,skin:0x50565a,bone:0xd8d2c0,bone2:0xa8a090,eye:0x7ae8ff,claw:0x1a1a1e,blood:0x5a1a1a};
n3Def('wendigo',{n:'Frost Wendigo',e:'🦌',fam:'Spirit',mt:'p',w:{hp:1.15,pa:1.35,ma:.8,pd:.95,md:1.0},
 hum:{skin:[106,110,104],tunic:0x5e6268,cape:[90,94,98],pants:[90,94,98],sc:1.42,wpn:'none'},
 moves:['strike','wendrend','wendhowl'],basic:{strike:'wd_claw'},stance:{sx:.3,hx:-.3,lk:.15,rk:.15,dy:-.035,ax:-.1,lx:-.1,ex:-.3,le:-.3},
 body(B,P,k){const C=WD;P.af=.72;P.lf=.78;P.wf=.86;P.belly=-.02;
  Object.assign(P.col,{skin:C.skin,torso:C.skin,sleeve:C.fur,fore:C.skin,hand:C.skin,pants:C.fur,shin:C.skin,boot:C.skin,sole:C.claw,belt:null,neck:C.fur});
  // gaunt grey skin stretched over the ribs, ragged fur on the shoulders and hips
  n3Paint(P,(m,s,part)=>{if(!part){if(m.y>.92||m.y<.58)return Math.round(m.y*28+m.c*4)%2?C.fur:C.fur2;if(m.s>.3&&Math.round(m.y*46)%2)return mdSh(C.skin,.7);return C.skin}
    if(part=='arm')return m.y>.8?C.fur:C.skin;if(part=='leg')return m.y>.32?(Math.round(m.y*30)%2?C.fur:C.fur2):C.skin;return C.skin});
  mdBody(B,P);
  // the head is a deer skull: long bony muzzle, empty sockets with cold light, great branching antlers
  P.head={w:.82,len:1.2,top:.85,jaw:.85};mdHead(B,P,{noFace:true,headCol:m=>m.y>1.12?C.bone:mdSh(C.bone,.9)});
  const z0=mdHeadZ(P,1.12)-.04;mdLoft(B,[[0,1.13,.07,.05,.05],[.08,1.115,.055,.04,.04],[.16,1.1,.04,.03,.03],[.21,1.095,.025,.02,.02]].map(q=>({p:[0,q[1],z0+q[0]],rx:q[2],f:q[3],b:q[4],w:[['head',1]]})),{seg:7,ref:[0,1,0],capB:true,col:m=>m.s<-.3?C.bone2:C.bone});
  [-1,1].forEach(s=>{k.p('head','sph','c',0x050506,s*.045,1.165,z0+.01,.03,.026,.02);k.p('head','sph','g',C.eye,s*.046,1.165,z0+.022,.011,.009,.006);
    for(let i=0;i<5;i++)k.p('head','cone4','c',C.bone2,s*(.035-i*.003),1.07,z0+.03+i*.035,.006,.022,.006,Math.PI);
    let a=[s*.06,1.25,z0-.05],d=[s*.5,.8,-.2];for(let j=0;j<5;j++){const b=[a[0]+d[0]*.09,a[1]+d[1]*.09,a[2]+d[2]*.09];k.L('head','c',j<2?C.bone2:C.bone,a,b,.018-j*.003,.014-j*.003,5);
      if(j==1||j==3){const t=[b[0]+s*.02,b[1]+.12,b[2]+.06];k.L('head','c',C.bone,b,t,.01,.003,4)}a=b;d=[d[0]*1.05,d[1]-.12,d[2]-.08]}});
  // jutting ribs, a mane of frozen fur, long clawed fingers, bony knees
  for(let i=0;i<5;i++){const y=.78+i*.035;[-1,1].forEach(s=>{const p=n3Surf(P,y,s*.5,.004),q=n3Surf(P,y-.015,s*1.2,.004);k.L('chest','c',C.bone2,p,q,.008,.006,3)})}
  for(let i=0;i<14;i++){const a=-1.4+i*.2,p=n3Surf(P,1.0,a+Math.PI,.01);k.p('chest','cone4','c',i%2?C.fur:C.fur2,p[0],p[1],p[2],.03,.14,.02,-1.9+Math.cos(a)*.4,0,Math.sin(a)*.6)}
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',W=P.bones[a];for(let f=0;f<4;f++)n3Claw(k,a,C.claw,[W[1]+(f-1.5)*.018,W[2]-.07,W[3]+.02],[(f-1.5)*.1,-.9,.3],.2,.012,.35,4);
    const kb=s<0?'lh1':'rh1',K=P.bones[kb];k.p(kb,'sph','c',C.bone2,K[1],K[2],K[3]+.04,.035,.03,.03);
    const l=s<0?'lh2':'rh2',F=P.bones[l];for(let f=0;f<2;f++)k.p(l,'cone4','c',C.claw,F[1]+(f-.5)*.04,.03,F[3]+.13,.014,.07,.012,Math.PI/2)});
  for(let i=0;i<5;i++){const y=.56,p=n3Surf(P,y,-1+i*.5,.01);k.S('pelvis',i%2?C.fur:C.fur2,p[0],p[1],p[2],.05,.12+(i%2)*.05,(-1+i*.5),0,i)}
 },
 bfx(e,a){const p=gY(e.m.position,0).addScaledVector(a.d,1.3);fxClaw(p,a.d,0xbfeaff,4,1.1,240);burst(gY(p,1),0xd8f4ff,10,1.2,.6,.4)}});
// raking claw: the whole arm swings down and across
n3Hum('wd_claw',[[.55,{sy:.6,py:.2,sx:-.05,ax:-2.8,az:.8,ex:-.6,rw:-.4,lx:-.6,le:-.8,rk:.2}],[1,{sy:.7,ax:-2.95,az:.9,ex:-.7}],
  [1.42,{sy:-.5,py:-.25,sx:.4,ax:-.9,az:-.5,ex:-.05,rw:.5,lx:-1.2,le:-.6,lh:-.35,rh:.25,lk:.45,dy:-.08,Bz:.25}],[1.8,{sy:-.7,ax:-.45,az:-.8,Bz:.2}],
  [2.4,{sy:-.15,sx:.1,ax:-.4,az:-.2,ex:-.4,lx:-.3,le:-.4,lh:0,rh:0,lk:.05,dy:-.02,Bz:0}]]);
// hungering rend: two lunges, a slash at the end of each, frost streaking behind
n3Hum('wd_rend',[[.6,{sx:.45,ax:-2.6,az:.9,ex:-1.0,lx:-2.6,lz:-.9,le:-1.0,lk:.7,rk:.55,lh:-.4,rh:.1,dy:-.14,hx:-.25}],[1,{sx:.5,dy:-.16}],
  [1.3,{sx:.55,ax:-.6,az:-.6,ex:-.1,lx:-2.7,lz:-1.0,lh:-.55,rh:.45,lk:.4,rk:.2,dy:-.08,Bz:.15}],[1.42,{sy:.4,lx:-2.8}],
  [1.72,{sy:-.4,sx:.55,lx:-.6,lz:.6,le:-.1,ax:-2.4,az:.6,lh:.4,rh:-.5,lk:.2,rk:.4,dy:-.08}],[2.3,{sy:0,sx:.3,ax:-.6,az:0,lx:-.6,lz:0,ex:-.5,le:-.5,lh:0,rh:0,lk:.2,rk:.2,dy:-.04,Bz:0}]]);
// hunger howl: throws its head back and screams, arms flung wide
n3Hum('wd_howl',[[.6,{sx:.3,hx:.25,ax:-.6,lx:-.6,az:-.2,lz:.2,ex:-1.3,le:-1.3,lk:.3,rk:.3,dy:-.06}],[1,{sx:.38,hx:.3,dy:-.08}],[1.18,{sx:-.4,hx:-.6,ax:-1.6,az:1.4,lx:-1.6,lz:-1.4,ex:-.2,le:-.2,lk:.1,rk:.1,dy:0,By:.05}],
  [2.1,{sx:-.35,hx:-.55}],[2.6,{sx:.1,hx:0,ax:-.4,az:.1,lx:-.4,lz:-.1,ex:-.4,le:-.4,By:0}]]);
n3Mv('wendrend',{nm:'Hungering Rend',ic:'🩸',an:'wd_rend',rmin:0,rmax:5.5,wind:.65,act:.85,rec:.6,cd:4.4,dmg:.85,sh:'line',w:1.6,l:5.6,
 x6:{start(e,a){const L=Math.min(4.6,Math.max(1.4,d2(a.o,a.tp)+.4));a.m1=n3Reach(a.o,a.o.clone().addScaledVector(a.d,L*.55));a.m2=n3Reach(a.m1,a.m1.clone().addScaledVector(a.d,L*.45))},
  tick(e,a,ph,k){if(ph!=1)return;if(k<.35)n3Glide(e,a.o,a.m1,ATK_E.out(k/.35));else if(k>.5&&k<.85)n3Glide(e,a.m1,a.m2,ATK_E.out((k-.5)/.35));
   if((k<.35||(k>.5&&k<.85))&&Math.random()<.9){burst(gY(e.m.position,s6R(.3,1.6)),0xd8f4ff,2,.4,.3,.4);if(Math.random()<.35)x5('sph',0xbfeaff,420,(kk,m)=>{m.material.opacity=.22*(1-kk);m.scale.setScalar(.16*(1-kk))},{p:gY(e.m.position,s6R(.6,1.4))})}
   [.33,.83].forEach((h,i)=>{if(k>=h&&!a['h'+i]){a['h'+i]=1;const p=gY(e.m.position,1.1).addScaledVector(a.d,.9);n3Slash(p,a.d,0xbfeaff,1.9,260,i?-.9:.9);burst(p,0xd8f4ff,14,1.4,.8,.4);n3Snd(p,'stab',.6);
     if(s6InCone(a,e.m.position,a.d,2.3,.8)){s6Hit(e,a,.85);if(i)s6Deb(a,'Frostbitten','🥶',{as:-.2},3000,'Frostbite: −20% attack speed')}}})}}});
n3Mv('wendhowl',{nm:'Hunger Howl',ic:'😱',an:'wd_howl',rmin:0,rmax:4,wind:.75,act:.6,rec:.6,cd:6,dmg:.5,sh:'cone',r:4.4,ang:.8,mt:'m',
 x6:{rel(e,a){const p=gY(e.m.position,1.6*e.m.bs);fxWaves(p,a.d,0xbfeaff,5,4.6,560,.85);fxStream(p,a.d,0xe8f8ff,26,4.6,.7,600,'oct',.12);n3Snd(p,'hiss',.8);n3Shake(e.m.position,.06)},
  land(e,a){if(s6InCone(a,a.o,a.d,4.4,.8)){s6Hit(e,a,.5,'m');s6Deb(a,'Dread','😱',{mspd:-.3,paP:-.15,maP:-.15},4000,'Dread: −30% move speed, −15% damage');n3Shove(a,e.m.position,2.2,300)}}}});

// ===================================================================== Stormborn Jotun =====================================================================
const JT={skin:0x7a9ab8,skin2:0x5a7898,beard:0xe8f0f8,fur:0x6a5a48,fur2:0x4a3e30,iron:0x4a4e58,rune:0x8ae0ff,leather:0x3a2a1c};
n3Def('jotun',{n:'Stormborn Jotun',e:'⚡',fam:'Earth',mt:'p',w:{hp:1.75,pa:1.35,ma:1.0,pd:1.35,md:1.2},
 hum:{skin:[122,154,184],tunic:0x6a5a48,cape:[90,80,64],pants:[74,62,48],sc:1.78,wpn:'hammer',wcol:0x6a8aa8},
 moves:['strike','thunderclap','stormcall'],
 body(B,P,k){const C=JT;P.build=2;P.af=1.3;P.lf=1.2;P.belly=.08;P.head={w:1.06,jaw:1.2,top:.95};
  Object.assign(P.col,{skin:C.skin,torso:C.skin,sleeve:C.skin,fore:C.skin,hand:C.skin2,pants:C.fur2,shin:C.leather,boot:C.fur2,sole:0x1a140e,belt:C.leather,neck:C.skin});
  P.look={hair:C.beard,hairStyle:2,face:3,eye:C.rune};
  // glowing storm runes painted over the chest and arms
  n3Paint(P,(m,s,part)=>{if(part=='leg')return m.y<.32?C.leather:(Math.round(m.y*26)%2?C.fur2:C.fur);if(!part&&m.y<.6)return Math.round(m.c*6)%2?C.fur:C.fur2;return C.skin});
  mdBody(B,P);mdHead(B,P,{eyes:'glow',glow:C.rune,brow:C.beard,ears:false});
  // a braided frost beard, a horned iron helm, a fur mantle, bracers and glowing runes
  const z=y=>mdHeadZ(P,y);mdLoft(B,[{p:[0,1.07,z(1.06)-.03],rx:.085,f:.04,b:.04,w:[['head',1]]},{p:[0,.98,z(1.0)+.0],rx:.07,f:.04,b:.03,w:[['head',1]]},{p:[0,.88,z(1.0)+.01],rx:.035,f:.025,b:.02,w:[['head',1]]}],{seg:7,capB:{dy:-.03},col:C.beard});
  [-1,1].forEach(s=>{k.L('head','c',C.beard,[s*.05,1.0,z(1.0)-.01],[s*.07,.86,z(1.0)],.016,.008,4);k.p('head','ring','c',0x8a7a5a,s*.07,.9,z(1.0),.02,.25,.02)});
  mdHelm(B,P,mdD('heavy','horned',C.iron,0x8a9aa8,{G:C.rune}));
  [-1,1].forEach(s=>{k.L('head','c',0xd8d0b8,[s*.11,1.24,-.02],[s*.2,1.34,-.05],.03,.018,5).L('head','c',0xd8d0b8,[s*.2,1.34,-.05],[s*.22,1.46,.02],.018,.003,5)});
  for(let i=0;i<16;i++){const a=-1.6+i*.21,p=n3Surf(P,.99,a+Math.PI*(i%2?0:0),.02);k.p('chest','cone4','c',i%2?C.fur:C.fur2,p[0],p[1],p[2],.04,.1,.03,Math.cos(a)*.5,0,-Math.sin(a)*1.3)}
  [-1,1].forEach(s=>{mdAS(B,P,s,4,6,.02,{t:'m',col:C.iron});mdAS(B,P,s,4,5,.024,{t:'g',col:C.rune,keep:m=>Math.round(m.y*40)%3==0&&m.s>.2})});
  [[.86,0],[.8,.4],[.8,-.4],[.92,.25],[.92,-.25]].forEach((q,i)=>{const p=n3Surf(P,q[0],q[1],.002);k.p('chest','box','g',C.rune,p[0],p[1],p[2],.01,.07,.004,0,q[1],(i%2?.5:-.5))});
  mdStrap(B,P,C.leather);mdBoots(B,P,mdD('medium','pelt',C.fur2,C.fur));
 },
 bfx(e,a){const p=gY(e.m.position,.1).addScaledVector(a.d,1.6);n3Bolt(p,JT.rune,3.2,200,gY(e.m.position,2.6*e.m.bs).addScaledVector(a.d,.8));burst(gY(p,.3),JT.rune,12,1.2,1,.4)}});
// thunderclap: lifts the hammer with both hands, lightning crawling over it, and smashes it into the ground
n3Hum('jt_clap',[[.55,{sx:-.2,ax:-2.4,lx:-2.3,az:.25,lz:-.25,ex:-.9,le:-.9,hx:-.2,sy:.2}],[1,{sx:-.38,ax:-3.05,lx:-2.95,ex:-.6,le:-.6,hx:-.3,sy:.05,By:.08}],
  [1.85,{sx:.75,ax:-.5,lx:-.55,az:.1,lz:-.1,ex:-.05,le:-.1,hx:.2,lh:-.45,rh:.35,lk:.9,rk:.6,dy:-.18,sy:0,By:-.03}],[2.3,{sx:.72,dy:-.17,By:0}],[2.7,{sx:.25,ax:-.5,lx:-.5,ex:-.4,le:-.4,hx:0,lh:-.1,rh:.1,lk:.25,rk:.15,dy:-.05}]]);
// call the storm: raises the hammer to the sky, the other arm pointing out where the bolts will fall
n3Hum('jt_call',[[.5,{ax:-2.6,az:.2,ex:-.3,lx:-1.3,lz:-.3,le:-.2,sx:-.2,hx:-.35,sy:-.25}],[1,{ax:-3.1,az:.1,ex:-.1,lx:-1.5,sx:-.28,hx:-.45}],[1.4,{ax:-3.1,lx:-1.55,sx:-.25}],[2.0,{ax:-2.9,lx:-1.4}],
  [2.6,{ax:-.5,az:0,ex:-.4,lx:-.4,lz:0,le:-.4,sx:0,hx:0,sy:0}]]);
n3Mv('thunderclap',{nm:'Thunderclap',ic:'⚡',an:'jt_clap',rmin:0,rmax:3.4,wind:1.1,act:.3,rec:.85,cd:4.8,dmg:1.25,sh:'circle',r:5.2,at:'self',mt:'m',
 x6:{tick(e,a,ph,k){if(ph==0&&k>.4&&Math.random()<.6){const h=kqHand(e,V());burst(h,JT.rune,2,.6,.6,.3);if(Math.random()<.15)bolt(h,h.clone().add(V(s6R(-1,1),s6R(-.5,1),s6R(-1,1))),JT.rune)}},
  land(e,a){const p=e.m.position.clone(),q=p.clone().addScaledVector(a.d,1.4);n3Flash(q,JT.rune,2.6,480);n3Bolt(q,0xd8f4ff,8,300);fxCracks(gY(q,0),JT.rune,8,2.4,900);n3Chunks(gY(q,.2),0x6a7080,8,3.4,7,.15);n3Shake(p,.2);n3Snd(p,'boom',.9);
   if(s6InC(a,q,1.8))s6Hit(e,a,1.25,'m');[0,.22,.44].forEach((dl,i)=>n3Later(dl,()=>n3Shock(e,a,q,5.2-i*.6,i%2?0xd8f4ff:JT.rune,520,.4,'m',t=>{if(t===pl)s6Deb(a,'Shocked','⚡',{as:-.25},2500,'Shocked: −25% attack speed')},.8)))}}});
n3Mv('stormcall',{nm:'Call the Storm',ic:'🌩️',an:'jt_call',rmin:0,rmax:10,wind:.9,act:1.3,rec:.6,cd:6,dmg:.95,sh:'circle',r:1.4,at:'tg',mt:'m',
 x6:{start(e,a){a.sp=[];for(let i=0;i<4;i++)a.sp.push(null)},
  tick(e,a,ph,k){if(ph==0&&k>.5&&Math.random()<.5)burst(kqHand(e,V()),JT.rune,2,.4,.8,.3);if(ph!=1)return;
   for(let i=0;i<4;i++){const ts=i*.22,tl=ts+.18;const t=s6T(a);
     // each strike is marked on the ground where you stand, then falls a moment later
     if(k>=ts&&!a.sp[i]){const tp=t?t.position:a.tp,q=V(tp.x+s6R(-.6,.6),0,tp.z+s6R(-.6,.6));a.sp[i]=q;s6Tel(a,q,1.4);fxSigil(q,JT.rune,1.3,400,6)}
     if(k>=tl&&a.sp[i]&&!a['b'+i]){a['b'+i]=1;const q=a.sp[i];n3Bolt(q,0xd8f4ff,10,300);burst(gY(q,.3),JT.rune,20,1.6,1.8,.45);ring(q,JT.rune,1.8,300);n3Snd(q,'zap',.8);n3Shake(q,.06);
       if(s6InC(a,q,1.4))s6Hit(e,a,.95,'m');const xt=a.xt&&a.xt.shift();if(xt){scene.remove(xt);xt.traverse(o=>o.geometry&&o.geometry.dispose())}}}},
  end(e,a){s6TelRm(a)}}});

// ===================================================================== Storm Harpy =====================================================================
const SH={feather:0x2c323c,dark:0x22262e,glow:0x8ad8ff,beak:0xc8b070,claw:0x1a1a1e};
n3Def('galeharpy',{n:'Storm Harpy',e:'🦅',fam:'Sky',mt:'p',w:{hp:.95,pa:1.3,ma:.9,pd:.85,md:.95},
 rig:{name:'GaleHarpy',base:'Skyhawk',col:SH.feather,sc:1.45,
  kit(k,c,C,red){
   // a crest of storm-charged feathers, crackling eye, long hooked talons
   for(let i=0;i<6;i++)k.p('head','cone4','g',i%2?SH.glow:0xd8f4ff,(i-2.5)*.02,1.02,.33-i*.015,.012,.12,.006,-.8,0,(i-2.5)*.12);
   [-1,1].forEach(s=>{k.p('head','sph','g',red?0xff2a2a:SH.glow,s*.05,.95,.43,.016,.016,.012)});
   for(let i=0;i<5;i++)k.p('pelvis','cone4','c',i%2?SH.dark:SH.feather,(i-2)*.04,.66,-.32-i%2*.04,.02,.2,.008,-1.9,0,(i-2)*.15);
  }},
 moves:['bite','galedive','gustshriek']});
// gale dive: beats up into the air, hangs for a heartbeat, then folds its wings and dives
n3Cr('sh_dive',[[.5,{nk:-.3,hd:-.2,by:.05,Brx:-.3,By:.6}],[1,{nk:-.45,hd:-.3,Brx:-.4,By:1.8}],[1.5,{nk:.4,hd:.3,jw:.6,Brx:.7}],[1.95,{nk:.45,jw:.9,Brx:.4}],[2.3,{nk:0,hd:0,jw:0,Brx:0}]]);
// gust shriek: rears back flaring its wings, then screams a blast of wind
n3Cr('sh_shriek',[[.6,{nk:-.45,hd:-.4,ex:.12,Brx:-.3,By:.15}],[1,{nk:-.5,hd:-.45,ex:.14,Brx:-.34,By:.2}],[1.15,{nk:.4,hd:.35,jw:1.0,ex:0,Brx:.15,By:.1}],[1.9,{nk:.35,jw:.9}],[2.4,{nk:0,hd:0,jw:0,Brx:0,By:0}]]);
n3Mv('galedive',{nm:'Gale Dive',ic:'🌪️',an:'sh_dive',rmin:2.2,rmax:8.5,wind:.9,act:.5,rec:.6,cd:4.8,dmg:1.3,sh:'circle',r:2.2,at:'tg',
 x6:{start(e,a){a.L=n3Reach(a.o,a.tp,.2);n3Aim(a,a.L)},
  tick(e,a,ph,k,dt,now,P){if(ph==0&&Math.random()<.5)burst(gY(e.m.position,.3),0xc8d0d8,2,1.4,.3,.4);
   if(ph==1){const u=ATK_E.in2(k);n3Glide(e,a.o,a.L,u);P.y=(1.8*(1-u))/(e.m.bs||1)+0;if(Math.random()<.6)burst(gY(e.m.position,1+1.8*(1-u)),SH.glow,2,.3,.1,.3)}},
  land(e,a){const p=a.L.clone();n3Flash(p,SH.glow,2.2,420);ring(p,0xd8f4ff,2.6,380);fxWaves(gY(p,.4),a.d,0xd8f4ff,3,3,420,3.1);burst(gY(p,.3),0xc8d0d8,28,2.6,1.4,.5);n3Snd(p,'blunt',.7);
   if(s6InC(a,p,2.2)){s6Hit(e,a,1.3);n3Shove(a,p,1.8,240)}}}});
n3Mv('gustshriek',{nm:'Gale Shriek',ic:'💨',an:'sh_shriek',rmin:0,rmax:4.5,wind:.7,act:.45,rec:.55,cd:5,dmg:.55,sh:'cone',r:5,ang:.6,mt:'m',
 x6:{rel(e,a){const p=gY(e.m.position,.95*e.m.bs).addScaledVector(a.d,.4);fxWaves(p,a.d,0xd8f4ff,5,5.2,520,.6);fxStream(p,a.d,0xe8f4ff,30,5.2,.55,520,'plane',.18);n3Snd(p,'hiss',.8)},
  land(e,a){if(s6InCone(a,a.o,a.d,5,.6)){s6Hit(e,a,.55,'m');n3Shove(a,e.m.position,3,340);s6Deb(a,'Buffeted','💨',{mspd:-.3},2500,'Battered by the wind: −30% move speed')}}}});

// ---------------- where they live ----------------
n3Zone(2,1,{roam:[['rimecrawler',3],['wendigo',3],['troll',1],['trollsh',1]],camps:[
  {n:'Rimeshell Nest',mem:[['rimecrawler',3],['wendigo',1]],b:'web'},{n:'Wendigo Larder',mem:[['wendigo',3]],b:'wolf'},{n:'Frozen Hollow',mem:[['wendigo',2],['rimecrawler',1],['trollsh',1]],b:'ritual'}]});
n3Zone(2,2,{roam:[['jotun',2],['galeharpy',3],['wendigo',1],['yeti',1]],camps:[
  {n:'Jotun Hold',mem:[['jotun',2],['galeharpy',1]],b:'mega'},{n:'Harpy Eyrie',mem:[['galeharpy',4]],b:'nest'},{n:'Stormcaller Ring',mem:[['jotun',1],['galeharpy',2],['yeti',1]],b:'ritual'}]});
})();
