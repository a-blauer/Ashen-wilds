// ================= v137: the older humanoid foes brought up to the v113 standard =================
// The v94 foes (built in mdFoeB, 1450) were mostly a plain body with one or two pieces on it. Each now has its own builder
// (registered like the v113 foes in N3.humB, so the v113 wrapper builds it inside its proportion preset): the same base
// look plus the detail the newer foes have — fur, scales, rock plates, rags, trophies, glowing seams.
var FOE137={};
function f137(B,P,k,L){const C=P.col;return {C,skin:C.skin,lt:0x3a2618,
  body(){P._T=mdTorso(P);mdBody(B,P)},head(o){mdHead(B,P,Object.assign({},o))},
  human(o){P.look=Object.assign({hair:0x2a1a12,hairStyle:0,face:0,eye:0x4a3a2a},o||{})},
  // a tuft / strand standing out of the torso at height y, angle a (0 front, π/2 right side, π back)
  tuft(y,a,col,len,r,drop){const p=n3Surf(P,y,a,-.005),q=n3Surf(P,y-(drop==null?.05:drop),a,len||.05);k.L(n3TB(y),'c',col,p,q,r||.03,.003,3)},
  // on an arm at t (0 shoulder … 2 wrist), pointing out and down
  armTuft(s,t,col,len,r){const p=n3ArmAt(P,s,t),bn=p[3];k.L(bn,'c',col,[p[0]+s*.03,p[1],p[2]],[p[0]+s*(.03+(len||.05)),p[1]-.05,p[2]-.01],r||.026,.003,3)},
  armRing(s,t,col,r,typ){const p=n3ArmAt(P,s,t);k.p(p[3],'tor',typ||'c',col,p[0],p[1],p[2],r||.06,.02,r||.06,Math.PI/2,0,0)},
  legAt(s,t){const l=s<0?'lh':'rh',b=P.bones,a=mdV(b[l+'0']),c=mdV(b[l+'1']),d=mdV(b[l+'2']),p=t<=1?a.clone().lerp(c,t):c.clone().lerp(d,t-1);return [p.x,p.y,p.z,t<.98?l+'0':l+'1']},
  legTuft(s,t,a,col,len,r){const p=this.legAt(s,t),x=Math.sin(a),z=Math.cos(a),R=.075;k.L(p[3],'c',col,[p[0]+x*R,p[1],p[2]+z*R],[p[0]+x*(R+(len||.04)),p[1]-.06,p[2]+z*(R+(len||.04))],r||.026,.003,3)}}}
function f137Reg(key,fn){FOE137[key]=fn;N3.humB[key]={body:fn}}

// ---------------- Yeti: a shaggy coat all over, fur cuffs over the hands and feet, icicles, black claws, a trophy necklace ----------------
f137Reg('yeti',function(B,P,k,L){const X=f137(B,P,k,L),C=X.C;const f1=0xc4c8d0,f2=0xa4aab4,f3=0xe4e8ee;P.build=2;P.belly=.04;P.af=1.25;P.lf=1.2;
  Object.assign(C,{skin:0x5a6a7a,torso:f1,sleeve:f1,fore:f1,hand:0x5a6a7a,pants:f1,shin:f1,boot:f2,sole:0x5a6a7a});
  const fur=m=>Math.round(m.y*22+m.c*3)%2?f1:f2;P.paint.torso=fur;P.paint.sleeve=P.paint.fore=fur;P.paint.leg=fur;X.body();
  X.head({eyes:'glow',glow:0x7ad8ff,noHair:true,brow:false,ears:false,nose:false,headCol:m=>m.s>.3&&m.y<1.2?0x5a6a7a:fur(m)});mdLoft(B,mdHeadR(P).slice(1,7),{seg:10,off:.012,col:fur,keep:m=>!(m.s>.25&&m.y<1.2)});   // v177: the shag lies on the skull (3 cm off it before)
  [-1,1].forEach(s=>k.L('head','c',0xb8ad90,[s*.1,1.22,0],[s*.2,1.3,-.04],.03,.02).L('head','c',0xb8ad90,[s*.2,1.3,-.04],[s*.22,1.4,.02],.02,.003));mdTS(B,P,.9,1.02,.04,{col:fur,lip:.04});
  for(let i=-2;i<=2;i++)k.p('head','cone4','c',0xe8e0c8,i*.016,1.095,mdHeadZ(P,1.095)+.006,.007,.03,.007,Math.PI);
  // shaggy coat: rows of tufts round the torso, heavier on the shoulders and back
  for(let y=.58;y<=.98;y+=.065)for(let i=0;i<12;i++){const a=i/12*Math.PI*2+(Math.round(y*50)%2)*.26;if(Math.cos(a)>.75&&y>.7)continue;X.tuft(y,a,i%3?f1:i%2?f2:f3,.035+(y>.85?.02:0),.05,.075)}
  [-1,1].forEach(s=>{for(let t=.15;t<1.95;t+=.22)X.armTuft(s,t,(t*10|0)%2?f1:f3,.04,.045);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const p=n3ArmAt(P,s,1.85);k.L(p[3],'c',f3,[p[0]+Math.sin(a)*.05,p[1],p[2]+Math.cos(a)*.05],[p[0]+Math.sin(a)*.08,p[1]-.09,p[2]+Math.cos(a)*.08],.028,.004,3)}
    for(let t=.1;t<1.9;t+=.25)for(let a=0;a<6.28;a+=1.25)X.legTuft(s,t,a+t,(a*3|0)%2?f1:f2,.03,.045);
    for(let a=0;a<6.28;a+=.9){const p=X.legAt(s,1.85);k.L(p[3],'c',f3,[p[0]+Math.sin(a)*.08,p[1],p[2]+Math.cos(a)*.08],[p[0]+Math.sin(a)*.11,.02,p[2]+Math.cos(a)*.1],.03,.005,3)}
    // black claws, icicles hanging off the forearm fur
    const w=n3ArmAt(P,s,2);for(let f=0;f<4;f++)n3Claw(k,s<0?'aL2':'aR2',0x14161a,[w[0]+(f-1.5)*.022,w[1]-.1,w[2]+.03],[0,-.4,.9],.07,.011,.5,3);
    for(let i=0;i<3;i++){const p=n3ArmAt(P,s,1.2+i*.2);k.p(p[3],'cone4','g',0xc8f0ff,p[0]+s*.07,p[1]-.07,p[2],.012,.07,.012,Math.PI)}});
  // a necklace of beast fangs
  for(let i=0;i<9;i++){const a=(i-4)*.22,p=n3Surf(P,.93-Math.abs(i-4)*.012,a,.02);k.p('chest','cone4','c',0xe8e0c8,p[0],p[1]-.02,p[2],.012,.05,.01,Math.PI)}});

// ---------------- Sand Elemental: cracked rock plates over a sand body, glowing seams, a girdle of stones on the hips, a rocky crown ----------------
f137Reg('selem',function(B,P,k,L){const X=f137(B,P,k,L),C=X.C;const s1=0xc8a060,s2=0xa8844a,s3=0xd8b878,rk=0x8a6a3a,gl=0xffa030;P.sq=.6;P.af=1.25;P.lf=1.15;P.build=2;
  Object.assign(C,{skin:s1,torso:s1,sleeve:s2,fore:s1,hand:s2,pants:s2,shin:s1,boot:s2,sole:s2,belt:s2,neck:s2});
  P.paint.torso=m=>m.y>.8?s3:Math.round(m.y*14)%2?s1:s2;X.body();X.head({eyes:'glow',glow:gl,noHair:true,brow:false,ears:false,nose:false,mouth:false,headCol:m=>m.y>1.2?s3:s1});
  k.p('chest','oct','g',gl,0,.86,mdTorsoAt(P,.86).f+.01,.06,.07,.03);[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0';k.p(a,'dod','c',s2,P.bones[a][1]+s*.03,.99,0,.1);k.p('chest','dod','c',s3,s*.12,1.02,-.04,.06)});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('pelvis','cone4','c',s2,Math.cos(a)*.16,.4,Math.sin(a)*.12,.05,.22,.05,Math.PI+Math.sin(a)*.3,0,Math.cos(a)*.3)}
  // rock plates on chest, back and arms, glowing cracks between them
  [[.92,-.7],[.92,.7],[.8,-.5],[.8,.5],[.7,0],[.95,Math.PI],[.8,Math.PI-.5],[.8,Math.PI+.5],[.66,Math.PI]].forEach(([y,a],i)=>{const p=n3Surf(P,y,a,.01);k.p(n3TB(y),'dod','c',i%2?rk:mdSh(rk,.85),p[0],p[1],p[2],.07,.06,.035,0,a,0)});
  for(let i=0;i<5;i++){const a=-.9+i*.45,p=n3Surf(P,.74+(i%2)*.06,a,.012),q=n3Surf(P,.64+(i%3)*.04,a+.15,.012);k.L(n3TB(.7),'g',gl,p,q,.006,.004,3)}
  [-1,1].forEach(s=>{for(let t=.3;t<1.9;t+=.45){const p=n3ArmAt(P,s,t);k.p(p[3],'dod','c',t>1?rk:mdSh(rk,.9),p[0]+s*.04,p[1],p[2],.05,.045,.05,t,t,0)}
    const w=n3ArmAt(P,s,2);k.p(w[3],'dod','c',rk,w[0],w[1]-.06,w[2]+.01,.075,.07,.075);k.L(w[3],'g',gl,[w[0]-.02,w[1]-.04,w[2]+.06],[w[0]+.02,w[1]-.09,w[2]+.06],.005,.004,3)});
  // a girdle of stones grown into the hips (v177: they hung in a ring 10 cm out from the waist), a crown of jagged rock
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,y=.55+Math.sin(a*3)*.04,p=n3Surf(P,y,a,.004);k.p('pelvis','dod','c',i%3?s2:rk,p[0],p[1],p[2],.03+(i%3)*.01)}
  for(let i=0;i<5;i++){const a=(i-2)*.45;k.p('head','cone4','c',i%2?rk:s3,Math.sin(a)*.08,1.28,-.01+Math.cos(a)*.03,.03,.12-Math.abs(i-2)*.025,.03,-.1,0,-a*.6)}});

// ---------------- Grave Ghoul: bare ribs, a hunched spine of knuckled vertebrae, burial rags, boils and stitches ----------------
f137Reg('ghoul',function(B,P,k,L){const X=f137(B,P,k,L),C=X.C,skin=X.skin;P.af=.8;P.lf=.85;P.head={w:.95,jaw:1.1,fwd:.02};
  Object.assign(C,{torso:skin,sleeve:skin,fore:skin,hand:mdSh(skin,.8),pants:0x2e2e28,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:0x2a2a24});
  P.paint.torso=m=>m.y>.72&&m.y<.92&&Math.round(m.y*44)%2&&m.s>-.2?mdSh(skin,.78):skin;X.body();X.head({eyes:'glow',glow:0x9aff6a,noHair:true,brow:mdSh(skin,.55),ears:false});mdEars(k,P,skin,.6);mdTusks(k,P,0xc8c0a0,.5);
  [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',A2=P.bones[a];for(let f=0;f<4;f++)k.L(a,'c',0x2a2420,[A2[1]+s*.005+(f-1.5)*.013,A2[2]-.08,A2[3]+.02],[A2[1]+(f-1.5)*.02,A2[2]-.18,A2[3]+.06],.008,.002,4)});mdLoin(B,P,0x2e2e28,0x1e1e1a,.4);
  // ribs standing out of the chest, knuckled vertebrae down the back, boils, stitched wounds
  for(let i=0;i<4;i++){const y=.9-i*.05;[-1,1].forEach(s=>{const p=n3Surf(P,y,s*.25,.004),q=n3Surf(P,y-.03,s*1.1,.004);k.L('chest','c',0xc8c0a0,p,q,.008,.008,3)})}
  for(let i=0;i<7;i++){const y=1.0-i*.065,p=n3Surf(P,y,Math.PI,.01);k.p(n3TB(y),'sph','c',0xb8b098,p[0],p[1],p[2],.022,.018,.02)}
  [[.75,.6],[.68,-1.2],[.85,2.1],[.62,-2.6]].forEach(([y,a])=>{const p=n3Surf(P,y,a,.006);k.p(n3TB(y),'sph','c',0x8a9a5a,p[0],p[1],p[2],.022,.02,.018)});
  {const p=n3Surf(P,.72,-.4,.006),q=n3Surf(P,.62,-.2,.006);k.L('spine','c',0x3a1a14,p,q,.006,.006,3);for(let i=0;i<4;i++){const t=i/3,m=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t+.004];k.p('spine','box','c',0x1a1210,m[0],m[1],m[2],.022,.004,.004,0,0,.6)}}
  // burial rags hanging from one shoulder and the belt
  [[.98,-.9],[.98,-.5],[.9,-1.3]].forEach(([y,a],i)=>{const p=n3Surf(P,y,a,.01);k.L(n3TB(y),'c',i%2?0x4a4636:0x3a382c,p,[p[0]*1.05,p[1]-.22,p[2]+.01],.035,.012,3)});
  [-1,1].forEach(s=>{X.armRing(s,1.75,0x4a4636,.045)})});

// ---------------- Frost Troll / Troll Rimecaller: hulking, warty, frosted shoulders, shaggy hair on arms and back, bone trophies ----------------
['troll','trollsh'].forEach(key=>f137Reg(key,function(B,P,k,L){const X=f137(B,P,k,L),C=X.C,skin=X.skin;P.build=2;P.head={w:1.1,jaw:1.2,top:.92};P.af=(P.af||1)*1.1;
  X.human({hairStyle:4,hair:0xd8e8f0});Object.assign(C,{torso:skin,sleeve:skin,fore:skin,pants:0x5a5e66,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:X.lt});
  P.paint.torso=m=>{const r=n3Nz(m.x,m.y,m.z,4);return r>.9?mdSh(skin,.8):r<.06?mdSh(skin,1.15):skin};X.body();
  X.head({eyes:'glow',glow:0x6ad8ff,brow:mdSh(skin,.55),ears:false,nose:false});mdNose(k,P,mdSh(skin,.92),1.5);mdTusks(k,P,0xe8e0c8,1.3,1.1);mdEars(k,P,skin,.7);
  for(let i=0;i<7;i++)k.p('head','cone4','c',0xd8e8f0,(i-3)*.03,1.25-Math.abs(i-3)*.01,-.03,.022,.14,.022,-.6,0,(i-3)*.18);
  if(key=='troll'){mdLoin(B,P,0x6a6e72,0x4a4e54);mdNeck(k,0xd8d0b0,0x8a9aa8,9);[-1,1].forEach(s=>mdAS(B,P,s,4,5,.016,{col:0xd8dce4}))}
  else{mdChest(B,P,mdD('cloth','robe',0x26344e,0x9ad8ff));k.p('chest','oct','g',0x9ad8ff,0,.8,mdTorsoAt(P,.8).f+P.tOff+.012,.03,.045,.014);[-1,1].forEach(s=>k.L('head','c',0x8a8270,[s*.08,1.24,-.02],[s*.18,1.36,-.08],.022,.012).L('head','c',0x8a8270,[s*.18,1.36,-.08],[s*.2,1.46,-.04],.012,.002))}
  const hair=0xd8e8f0,frost=0xc8f0ff;
  // warts, frost crust and icicles on the shoulders, white hair down the spine and along the forearms
  for(let i=0;i<14;i++){const y=.62+n3Nz(i,2,5)*.36,a=(n3Nz(i,7,1)-.5)*6.2;if(key=='trollsh'&&y<.95)continue;const p=n3Surf(P,y,a,.004);k.p(n3TB(y),'sph','c',mdSh(skin,.82),p[0],p[1],p[2],.014,.012,.012)}
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',q=P.bones[a];for(let i=0;i<4;i++)k.p(a,'dod','c',i%2?frost:0xe8f8ff,q[1]+s*(.03+i*.02),q[2]+.05-i*.012,q[3]+(i-1.5)*.04,.035,.022,.035,i,0,0);
    for(let i=0;i<3;i++)k.p(a,'cone4','g',frost,q[1]+s*(.06+i*.02),q[2]-.01,q[3]+(i-1)*.04,.01,.07,.01,Math.PI);
    for(let t=1.1;t<1.9;t+=.2)X.armTuft(s,t,hair,.05,.025);
    const w=n3ArmAt(P,s,2);for(let f=0;f<4;f++)n3Claw(k,s<0?'aL2':'aR2',0x2a2a30,[w[0]+(f-1.5)*.025,w[1]-.11,w[2]+.03],[0,-.5,.85],.06,.012,.5,3)});
  for(let i=0;i<6;i++){const y=1.0-i*.07,p=n3Surf(P,y,Math.PI,0);k.L(n3TB(y),'c',hair,p,[p[0],p[1]-.08,p[2]-.06],.03,.003,3)}
  // a string of skulls and bones at the hip
  for(let i=0;i<4;i++){const a=-1.4+i*.3,p=n3Surf(P,.52,a,.03);k.p('pelvis',i%2?'sph':'box','c',0xd8d0b0,p[0],p[1]-.04,p[2],i%2?.03:.012,i%2?.032:.05,i%2?.028:.012)}}));

// ---------------- Naga Warrior / Archer / Shaman: a cobra hood, scale belly plates, gold bands and a beaded collar ----------------
['nagaw','nagaa','nagas'].forEach(key=>f137Reg(key,function(B,P,k,L){const X=f137(B,P,k,L),C=X.C,skin=X.skin;
  Object.assign(C,{torso:skin,sleeve:skin,fore:skin,hand:skin,pants:skin,shin:skin,boot:skin,sole:mdSh(skin,.6)});
  const bel=mdMix(skin,0xe8d8a0,.55);P.paint.torso=m=>m.s>.55&&m.y<.95?(Math.round(m.y*36)%2?bel:mdSh(bel,.85)):Math.round(m.c*8+m.y*30)%2?skin:mdSh(skin,.85);X.body();mdNagaHead(B,P,skin,0xffd020);
  if(key=='nagaw'){mdChest(B,P,mdD('heavy','mail',0x8a6a2a,0xb08a3a));mdSpikePad(k,P,-1,0x8a6a2a,0xb08a3a,2);[-1,1].forEach(s=>mdAS(B,P,s,4,5,.014,{t:'m',col:0x8a6a2a}))}
  else if(key=='nagaa'){mdChest(B,P,mdD('medium','vest',0x5a4426,0x8a6a3a));mdQuiver(B,P)}
  else{mdChest(B,P,mdD('cloth','robe',0x1a4444,0xd8c060));mdNeck(k,0xe8e0c8,0x2a8a6a,9);for(let i=0;i<5;i++)k.p('head','cone4','c',[0x2a8a6a,0xd8c060,0x2a6a8a][i%3],-.08+i*.04,1.28,-.08,.02,.16,.008,-.4,0,(i-2)*.25)}
  const gold=0xc8a040,sd=mdSh(skin,.65),hood=mdMix(skin,0x1a2a14,.3);
  // the hood: a broad flared fan behind the head with a dark eye pattern, ribbed
  k.p('neck','sph','c',hood,0,1.12,-.06,.17,.16,.025,-.15,0,0);k.p('neck','sph','c',mdMix(skin,0xe8d8a0,.4),0,1.11,-.045,.13,.13,.012,-.15,0,0);
  [-1,1].forEach(s=>{k.p('neck','tor','c',0x141410,s*.07,1.15,-.055,.03,.008,.03,Math.PI/2-.15,0,0);for(let i=0;i<3;i++)k.L('neck','c',sd,[s*.02,1.1,-.07],[s*(.13-i*.02),1.04+i*.08,-.085],.006,.004,3)});
  // gold arm bands and a beaded collar
  [-1,1].forEach(s=>{X.armRing(s,.55,gold,.055,'m');X.armRing(s,1.7,gold,.045,'m')});
  for(let i=0;i<11;i++){const a=(i-5)*.2,p=n3Surf(P,.99-Math.abs(i-5)*.008,a,.02);k.p('chest','sph',i%3?'m':'g',i%3?gold:0x40d8a0,p[0],p[1],p[2],.012)}
  // a fin ridge down the tail
  for(let i=0;i<6;i++)k.p('pelvis','cone4','c',sd,0,.52-i*.075,-.1-i*.13,.012,.05,.03,-.9)}));

// ---------------- Skeleton Warrior / Bone Archer: a cold soul-light caged in the ribs, rusted scraps, a torn banner rag ----------------
{const f=mdFoeB;mdFoeB=function(key){const B=f.apply(this,arguments);if(key!='skel'&&key!='archer')return B;
  const k=dkKit(),glow=key=='skel'?0x6aff9a:0x7ad8ff;
  k.p('chest','ico','g',glow,0,.86,.01,.045);k.p('chest','ico','g',0xffffff,0,.86,.01,.022);
  for(let i=0;i<3;i++)k.L('chest','g',glow,[0,.86,.01],[(i-1)*.05,.98,.02],.006,.001,3);
  if(key=='skel'){[[-.16,.98],[.1,.62]].forEach(([x,y],i)=>k.p(i?'pelvis':'chest','box','m',0x6a4630,x,y,.08,.06,.05,.012,0,.2,.3))}
  else k.L('chest','c',0x2a2a24,[.12,1.0,-.1],[.18,.7,-.16],.04,.015,3);
  mdKit(B,k);return B}}
