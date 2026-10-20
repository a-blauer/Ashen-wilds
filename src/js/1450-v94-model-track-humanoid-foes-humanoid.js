// ================= v94 (model track): humanoid foes and the humanoid Sovereigns =================
// mkHumanoid is wrapped: the HB skeleton, weapon, shield, bow helpers and animation hooks of the old model stay; the
// textured body and the v54/v56 detail kits (dkEnemyKit/dkNewKit, many small overlapping boxes) are replaced by one
// clean body per foe type in the companion style, built with the same toolkit as the hero (and the same armour
// builders, so a Hollow Knight's plate fits like a hero's). Every instance of a type shares the cached geometry and the
// shared materials (one to three draw calls + weapon). Each type keeps its signature: goblin ears and noses, orc and
// troll tusks, skeleton bones, the vampires' standing collar (v89 dkHighCollar), naga snake heads and tails, etc.
function mdD(a,st,M,A,o){return Object.assign({a,st,ti:2,r:0,M,A,G:null,dk:mdSh(M,.6),gem:A,sl:''},o||{})}
function mdLoin(B,P,c,c2,y1,y0){mdSkirt(B,P,y0||.6,y1||.36,.02,.02,{col:m=>m.y<(y1||.36)+.04?c2||mdSh(c,.75):c,keep:m=>Math.abs(m.c)<.36,n:4});mdTS(B,P,(y0||.6)-.02,(y0||.6)+.03,.016,{col:mdSh(c2||c,.8)})}
function mdStrap(B,P,c,sd){mdTS(B,P,.6,.99,(P.tOff||0)+.008,{col:c,keep:m=>Math.abs(m.c+(sd||1)*m.s*.55)<.12})}
function mdTusks(k,P,c,len,w){const z=mdHeadZ(P,1.07);[-1,1].forEach(s=>k.p('head','cone4','c',c,s*.04*(w||1),1.072+len*.022,z-.004,.014*len*1.4,.05*len,.014*len*1.4,0,0,-s*.2))}
function mdEars(k,P,c,len,up){const x=mdHeadX(P,1.15);[-1,1].forEach(s=>k.p('head','cone4','c',c,s*(x+.03*len),1.16+(up||0),-.01,.03,.14*len,.018,0,0,-s*(1.25-(up||0)*3)))}
function mdNose(k,P,c,len){k.p('head','cone4','c',c,0,1.12,mdHeadZ(P,1.12)+.02*len,.024,.07*len,.022,Math.PI/2+.3)}
function mdNeck(k,c,bead,n){for(let i=0;i<(n||7);i++){const a=-1.1+i*(2.2/((n||7)-1));k.p('chest','cone4','c',i%2?c:bead,Math.sin(a)*.13,.95-Math.cos(a)*.03,Math.cos(a)*.115,.01,.04,.01,Math.PI)}}
function mdSpikePad(k,P,s,c,sp,n){const a=s<0?'aL0':'aR0',x=P.bones[a][1];k.p(a,'hem','m',c,x+s*.02,.985,0,.11,.08,.115,0,0,s*.35);for(let i=0;i<(n||2);i++)k.L(a,'m',sp,[x+s*(.05+i*.03),1.03,-.02+i*.04],[x+s*(.1+i*.03),1.14,-.03+i*.04],.02,.003,5)}
function mdGlowEyes(k,P,c,y){const ey=y||1.145,z=mdHeadZ(P,ey);[-1,1].forEach(s=>{k.p('head','box','c',0x080606,s*.04,ey,z-.002,.036,.022,.01);k.p('head','box','g',c,s*.04,ey,z+.004,.024,.011,.008)})}
// skeleton: skull, spine, banded ribcage, pelvis, thin bones for limbs
function mdSkel(B,P,bone,eye){const bd=mdSh(bone,.72),k=dkKit();P.noTorso=1;P.af=.42;P.lf=.42;P.col=Object.assign(P.col,{skin:bone,torso:bone,sleeve:bone,fore:bone,hand:bone,pants:bone,shin:bone,boot:bone,sole:bd});
  mdBody(B,P);mdHead(B,P,{eyes:'none',noHair:true,brow:false,ears:false,nose:false,mouth:false,headCol:m=>m.s>.55&&m.y<1.1&&m.y>1.07?bd:bone});
  mdGlowEyes(k,P,eye);k.p('head','cone4','c',0x080606,0,1.115,mdHeadZ(P,1.115)+.004,.016,.03,.008,Math.PI);for(let i=-3;i<=3;i++)k.p('head','box','c',0xe8e0c8,i*.013,1.078,mdHeadZ(P,1.078)+.004,.008,.016,.006);
  mdLoft(B,[[.5,.03],[.62,.034],[.75,.03],[.9,.03],[1.04,.025]].map(q=>({p:[0,q[0],-.04],rx:q[1],w:mdTorsoW(q[0])})),{seg:6,col:m=>Math.round(m.y*30)%2?bone:bd});
  mdLoft(B,Array.from({length:12},(_,i)=>.71+i*.022).map((y,i)=>({p:[0,y,-.004],rx:(.11+Math.sin(i/11*Math.PI)*.045),f:.1+Math.sin(i/11*Math.PI)*.02,b:.1,w:mdTorsoW(y)})),{seg:12,col:m=>m.s>.85?bd:bone,keep:m=>Math.floor(m.i)%2==0&&!(m.s>.9&&m.y<.9)});
  mdLoft(B,[{p:[0,.47,0],rx:.1,f:.06,b:.07,w:[['pelvis',1]]},{p:[0,.54,0],rx:.135,f:.08,b:.08,w:[['pelvis',1]]},{p:[0,.58,0],rx:.12,f:.07,b:.07,w:[['pelvis',1]]}],{seg:10,col:bd});
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0';k.L('chest','c',bone,[s*.04,.96,.02],[s*.2,.97,0],.016,.014,5);k.p(a,'sph','c',bd,P.bones[a][1],P.bones[a][2],0,.035)});mdKit(B,k)}
// naga: long snake head (on the head bone) and a tail from the pelvis
function mdNagaHead(B,P,sk,eye){const sd=mdSh(sk,.65),k=dkKit();P.head={w:.9,len:1.45,fwd:.035,top:.9};
  mdHead(B,P,{eyes:'none',noHair:true,brow:false,ears:false,nose:false,mouth:false,headCol:m=>m.y<1.1&&m.s>-.2?mdSh(sk,1.18):Math.round(m.c*6+m.y*30)%2?sk:sd});
  [-1,1].forEach(s=>{const z=mdHeadZ(P,1.17)-.02;k.p('head','box','c',0x080606,s*.06,1.17,z,.03,.024,.03);k.p('head','box','g',eye,s*.064,1.17,z+.012,.012,.026,.012);k.p('head','cone4','c',0xe8e0c8,s*.03,1.075,mdHeadZ(P,1.08)-.01,.008,.04,.008,Math.PI)});
  k.L('head','c',0xb02030,[0,1.09,mdHeadZ(P,1.09)],[0,1.09,mdHeadZ(P,1.09)+.07],.006,.003,3);
  for(let i=0;i<5;i++)k.p('head','cone4','c',sd,0,1.27-i*.03,-.02-i*.04,.03,.06,.02,-.6-i*.3);mdKit(B,k);
  mdLoft(B,[{p:[0,.5,-.06],rx:.1,f:.08,b:.08},{p:[0,.36,-.3],rx:.085},{p:[0,.16,-.6],rx:.06},{p:[.06,.06,-.86],rx:.035},{p:[.14,.04,-1.06],rx:.01}].map(r=>Object.assign(r,{w:[['pelvis',1]]})),{seg:8,capB:true,col:m=>m.s<-.5?mdSh(sk,.9):Math.round(m.i*3)%2?sk:sd})}
// cache + build per foe type
function mdFoeGeo(key){return mdGeo('F|'+key,()=>mdFoeB(key))}
function mdFoeB(key){const L=HUMLOOK[key]||{},B=mdB(HB),skin=mdSh(dkHex(L.skin||[200,160,130]),key=='skel'||key=='archer'?.9:.86),k=dkKit(),lt=0x3a2618,iron=0x4a4e56;
  const P=mdP({col:{skin}}),C=P.col,body=()=>{P._T=mdTorso(P);mdBody(B,P)},head=o=>mdHead(B,P,Object.assign({},o));
  const human=(o)=>{P.look=Object.assign({hair:0x2a1a12,hairStyle:0,face:0,eye:0x4a3a2a},o||{});};
  const goblin=(eye)=>{P.head={w:1.08,jaw:1.08,top:.95};P.af=.92;P.lf=.9;P.belly=.02;Object.assign(C,{torso:skin,sleeve:skin,fore:skin,hand:skin,pants:0x4a3a22,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:lt});body();
    head({eyes:'glow',glow:eye,noHair:true,brow:mdSh(skin,.6),ears:false,nose:false});mdEars(k,P,skin,1.1);mdNose(k,P,mdSh(skin,.9),1.1);mdTusks(k,P,0xe0d8b8,.6,.9)};
  switch(key){
  case 'hob':goblin(0xffc020);mdLoin(B,P,0x5a4628);mdStrap(B,P,lt);mdSpikePad(k,P,-1,0x5a4028,0x8a8a90,3);mdNeck(k,0xd8d0b0,0x6a3a2a);break;
  case 'sling':goblin(0xffc020);mdLoin(B,P,0x6a5434);mdHelm(B,P,mdD('medium','hood',0x5a4630,0x3a2a1a));k.p('pelvis','sph','c',0x4a3420,.17,.5,.05,.05,.06,.045);mdStrap(B,P,lt,-1);break;
  case 'shaman':goblin(0x7aff6a);mdChest(B,P,mdD('cloth','robe',0x3a5434,0x8a7a4a));mdNeck(k,0xe8e0c8,0x2a6a3a,9);
    k.p('head','sph','c',0xc8bea4,0,1.2,mdHeadZ(P,1.2)-.04,.09,.08,.07);[-1,1].forEach(s=>k.p('head','box','c',0x14100c,s*.035,1.2,mdHeadZ(P,1.2)+.02,.024,.016,.01));
    for(let i=0;i<5;i++)k.p('head','cone4','c',[0x8a2a1a,0x2a6a8a,0xc8a02a,0x2a2a2a,0x8a2a1a][i],-.08+i*.04,1.3,-.06,.022,.14,.008,-.5,0,(i-2)*.22);break;
  case 'bandit':human({hairStyle:5});Object.assign(C,{torso:0x34343c,pants:0x2e2a30,boot:0x2a2018,belt:lt});body();head({noHair:true});
    mdChest(B,P,mdD('light','garb',0x34343c,0x6a2222));mdHelm(B,P,mdD('light','ashcowl',0x2a2a30,0x6a2222));mdBoots(B,P,mdD('medium','trail',0x2a2018,0x4a3020));mdCape(B,P,0x2a1c1e,{len:.5,trim:0x4a1a1a});break;
  case 'brigand':human({face:3,hair:0x3a2414});body();head({});mdChest(B,P,mdD('heavy','hauberk',0x6a6c72,0x8a6a2a));mdTabard(B,P,0x6a1e18,0x3a0e0a);mdHelm(B,P,mdD('heavy','nasal',0x4a4e56,0x6a6c72));
    mdBoots(B,P,mdD('medium','pelt',0x3a2a1c,0x5a4a3a));mdSpikePad(k,P,-1,0x4a4e56,0x8a8e96,2);mdCape(B,P,0x4a1410,{len:.45});break;
  case 'cultist':human();body();head({eyes:'glow',glow:0xff6a20,noHair:true,headCol:()=>0x120a08});mdChest(B,P,mdD('cloth','robe',0x6a1610,0x2a0a08));mdHelm(B,P,mdD('cloth','linen',0x4a0c0a,0x2a0806));
    [-1,1].forEach(s=>k.L('head','c',0x2a2420,[s*.08,1.24,-.01],[s*.15,1.33,-.03],.022,.012).L('head','c',0x2a2420,[s*.15,1.33,-.03],[s*.14,1.42,-.06],.012,.002));
    k.p('chest','oct','g',0xff6a20,0,.8,mdTorsoAt(P,.8).f+P.tOff+.012,.03,.045,.014);mdBoots(B,P,mdD('cloth','slipper',0x1a1210,0x2a1a10));break;
  case 'orc':P.build=2;P.wf=1.05;P.head={w:1.1,jaw:1.25,top:.95};human({hair:0x141010,hairStyle:2,eye:0xff3a1a});Object.assign(C,{torso:skin,sleeve:skin,fore:0x4a3420,pants:0x4a3a2a,shin:0x4a3a2a,boot:0x3a2a1c,belt:lt});body();
    head({eyes:'glow',glow:0xff3a1a,brow:mdSh(skin,.55)});mdTusks(k,P,0xe8e0c8,1.2,1.1);mdEars(k,P,skin,.5,.02);mdStrap(B,P,lt);mdStrap(B,P,lt,-1);mdLoin(B,P,0x4a3a2a,0x2a1d14);
    [-1,1].forEach(s=>{mdSpikePad(k,P,s,0x5a4630,0x8a8a90,2);mdAS(B,P,s,4,5,.012,{col:m=>Math.round(m.y*40)%2?0x4a3420:0x5a4430})});mdBoots(B,P,mdD('medium','pelt',0x3a2a1c,0x6a5a48));mdNeck(k,0xd8d0b0,0x2a2a2a);break;
  case 'skel':mdSkel(B,P,0xc8bea4,0x6aff9a);mdHelm(B,P,mdD('heavy','nasal',0x6a4630,0x5a3a24));mdSpikePad(k,P,-1,0x6a4630,0x6a4630,0);mdLoin(B,P,0x3a3a34,0x2a2a24,.4);break;
  case 'archer':mdSkel(B,P,0xc8bea4,0x7ad8ff);mdHelm(B,P,mdD('medium','hood',0x34342c,0x24241e));mdQuiver(B,P);mdLoin(B,P,0x34342c,0x24241e,.42);mdCape(B,P,0x2a2a24,{len:.55});break;
  case 'knight':human();body();head({noHair:true});const K1=0x2a2c32,K2=0x44474f;mdChest(B,P,mdD('heavy','warplate',K1,K2,{ti:3}));mdHelm(B,P,mdD('heavy','great',K1,K2,{G:0xff2a1a}));
    [-1,1].forEach(s=>k.L('head','c',0x8a8270,[s*.1,1.22,-.02],[s*.14,1.32,-.06],.026,.016).L('head','c',0x8a8270,[s*.14,1.32,-.06],[s*.13,1.42,-.12],.016,.002));
    mdBoots(B,P,mdD('heavy','sabaton',K1,K2));mdCape(B,P,0x18141e,{len:.42,trim:0x2a1e30});break;
  case 'giant':P.build=2;P.head={w:1.05,jaw:1.15};human({hairStyle:5,face:3,hair:0xc8e8ff});Object.assign(C,{torso:skin,sleeve:skin,fore:0x5a6070,pants:0x5a5040,shin:skin,boot:0x3a3026,belt:0x3a2a1a});body();
    head({eyes:'glow',glow:0x6ac8ff,brow:0xc8e8ff});mdLoin(B,P,0x6a5e4e,0x4a4030);mdTS(B,P,.9,1.0,.03,{col:m=>Math.round(m.c*7)%2?0x6a5e4e:0x5a4e40,lip:.03});
    [-1,1].forEach(s=>{mdAS(B,P,s,4,5,.014,{t:'m',col:0x5a6070});mdAS(B,P,s,4,4,.02,{t:'g',col:0x6ac8ff,keep:m=>m.s>.3})});k.p('head','ring','g',0x6ac8ff,0,1.19,0,mdHeadX(P,1.19)+.012,.12,mdHeadZ(P,1.19)+.012);
    [0,1,2].forEach(i=>k.p('chest','box','g',0x6ac8ff,-.05+i*.05,.85-Math.abs(i-1)*.04,mdTorsoAt(P,.85).f+.003,.012,.1,.006,0,0,(i-1)*.5));mdBoots(B,P,mdD('medium','pelt',0x3a3026,0x6a5e4e));break;
  case 'revenant':{const w1=0xb8a47c,w2=0x8a7a58;Object.assign(C,{torso:w1,sleeve:w1,fore:w1,hand:w1,pants:w1,shin:w1,boot:w2});P.paint.torso=m=>Math.round(m.y*28+m.c)%2?w1:w2;P.paint.sleeve=P.paint.fore=m=>Math.round(m.y*30)%2?w1:w2;P.paint.leg=m=>Math.round(m.y*28)%2?w1:w2;
    body();head({eyes:'glow',glow:0xffc040,noHair:true,headCol:m=>Math.round(m.y*36)%2?w1:w2,brow:false,ears:false});
    const nem=mdD('cloth','linen',0x2a3a6a,0xc8a040);mdHelm(B,P,nem);mdTS(B,P,.9,1.0,.032,{t:'m',col:m=>Math.round(m.y*60)%2?0xc8a040:0x2a3a6a,lip:.04});
    mdChest(B,P,mdD('cloth','robe',0x6a5a3a,0xc8a040));break}
  case 'nagaw':case 'nagaa':case 'nagas':{Object.assign(C,{torso:skin,sleeve:skin,fore:skin,hand:skin,pants:skin,shin:skin,boot:skin,sole:mdSh(skin,.6)});P.paint.torso=m=>m.s>.6&&m.y<.9?mdSh(skin,1.2):skin;body();mdNagaHead(B,P,skin,0xffd020);
    if(key=='nagaw'){mdChest(B,P,mdD('heavy','mail',0x8a6a2a,0xb08a3a));mdSpikePad(k,P,-1,0x8a6a2a,0xb08a3a,2);[-1,1].forEach(s=>mdAS(B,P,s,4,5,.014,{t:'m',col:0x8a6a2a}))}
    else if(key=='nagaa'){mdChest(B,P,mdD('medium','vest',0x5a4426,0x8a6a3a));mdQuiver(B,P)}
    else{mdChest(B,P,mdD('cloth','robe',0x1a4444,0xd8c060));mdNeck(k,0xe8e0c8,0x2a8a6a,9);for(let i=0;i<5;i++)k.p('head','cone4','c',[0x2a8a6a,0xd8c060,0x2a6a8a][i%3],-.08+i*.04,1.28,-.08,.02,.16,.008,-.4,0,(i-2)*.25)}break}
  case 'troll':case 'trollsh':P.build=2;P.head={w:1.1,jaw:1.2,top:.92};human({hairStyle:4,hair:0xd8e8f0});Object.assign(C,{torso:skin,sleeve:skin,fore:skin,pants:0xc8ccd4,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:lt});body();
    head({eyes:'glow',glow:0x6ad8ff,brow:mdSh(skin,.55),ears:false,nose:false});mdNose(k,P,mdSh(skin,.92),1.5);mdTusks(k,P,0xe8e0c8,1.3,1.1);mdEars(k,P,skin,.7);
    for(let i=0;i<7;i++)k.p('head','cone4','c',0xd8e8f0,(i-3)*.03,1.25-Math.abs(i-3)*.01,-.03,.022,.14,.022,-.6,0,(i-3)*.18);
    if(key=='troll'){mdLoin(B,P,0xc8ccd4,0x9aa0a8);mdNeck(k,0xd8d0b0,0x8a9aa8,9);[-1,1].forEach(s=>mdAS(B,P,s,4,5,.016,{col:0xd8dce4}))}
    else{mdChest(B,P,mdD('cloth','robe',0x26344e,0x9ad8ff));k.p('chest','oct','g',0x9ad8ff,0,.8,mdTorsoAt(P,.8).f+P.tOff+.012,.03,.045,.014);[-1,1].forEach(s=>k.L('head','c',0x8a8270,[s*.08,1.24,-.02],[s*.18,1.36,-.08],.022,.012).L('head','c',0x8a8270,[s*.18,1.36,-.08],[s*.2,1.46,-.04],.012,.002))}break;
  case 'yeti':{const f1=0xc4c8d0,f2=0xa4aab4;P.build=2;P.belly=.04;P.af=1.25;P.lf=1.2;Object.assign(C,{skin:0x5a6a7a,torso:f1,sleeve:f1,fore:f1,hand:0x5a6a7a,pants:f1,shin:f1,boot:f2,sole:0x5a6a7a});
    const fur=m=>Math.round(m.y*22+m.c*3)%2?f1:f2;P.paint.torso=fur;P.paint.sleeve=P.paint.fore=fur;P.paint.leg=fur;body();
    head({eyes:'glow',glow:0x7ad8ff,noHair:true,brow:false,ears:false,nose:false,headCol:m=>m.s>.3&&m.y<1.2?0x5a6a7a:fur(m)});mdLoft(B,mdHeadR(P).slice(1,7),{seg:10,off:.03,col:fur,keep:m=>!(m.s>.25&&m.y<1.2)});
    [-1,1].forEach(s=>k.L('head','c',0xb8ad90,[s*.1,1.22,0],[s*.2,1.3,-.04],.03,.02).L('head','c',0xb8ad90,[s*.2,1.3,-.04],[s*.22,1.4,.02],.02,.003));mdTS(B,P,.9,1.02,.04,{col:fur,lip:.04});
    for(let i=-2;i<=2;i++)k.p('head','cone4','c',0xe8e0c8,i*.016,1.095,mdHeadZ(P,1.095)+.006,.007,.03,.007,Math.PI);break}
  case 'selem':{const s1=0xc8a060,s2=0xa8844a,s3=0xd8b878;P.sq=.6;P.af=1.25;P.lf=1.15;P.build=2;Object.assign(C,{skin:s1,torso:s1,sleeve:s2,fore:s1,hand:s2,pants:s2,shin:s1,boot:s2,sole:s2,belt:s2,neck:s2});
    P.paint.torso=m=>m.y>.8?s3:Math.round(m.y*14)%2?s1:s2;body();head({eyes:'glow',glow:0xffa030,noHair:true,brow:false,ears:false,nose:false,mouth:false,headCol:m=>m.y>1.2?s3:s1});
    k.p('chest','oct','g',0xffa030,0,.86,mdTorsoAt(P,.86).f+.01,.06,.07,.03);[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0';k.p(a,'dod','c',s2,P.bones[a][1]+s*.03,.99,0,.1);k.p('chest','dod','c',s3,s*.12,1.02,-.04,.06)});
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('pelvis','cone4','c',s2,Math.cos(a)*.16,.4,Math.sin(a)*.12,.05,.22,.05,Math.PI+Math.sin(a)*.3,0,Math.cos(a)*.3)}break}
  case 'ghoul':P.af=.8;P.lf=.85;P.head={w:.95,jaw:1.1,fwd:.02};Object.assign(C,{torso:skin,sleeve:skin,fore:skin,hand:mdSh(skin,.8),pants:0x2e2e28,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:0x2a2a24});
    P.paint.torso=m=>m.y>.72&&m.y<.92&&Math.round(m.y*44)%2&&m.s>-.2?mdSh(skin,.78):skin;body();head({eyes:'glow',glow:0x9aff6a,noHair:true,brow:mdSh(skin,.55),ears:false});mdEars(k,P,skin,.6);mdTusks(k,P,0xc8c0a0,.5);
    [-1,1].forEach(s=>{const a=s<0?'aL2':'aR2',A2=P.bones[a];for(let f=0;f<4;f++)k.L(a,'c',0x2a2420,[A2[1]+s*.005+(f-1.5)*.013,A2[2]-.08,A2[3]+.02],[A2[1]+(f-1.5)*.02,A2[2]-.18,A2[3]+.06],.008,.002,4)});mdLoin(B,P,0x2e2e28,0x1e1e1a,.4);break;
  case 'vamp':case 'vampm':human({hair:0x0a0808,hairStyle:key=='vamp'?0:5,eye:0xff2030});C.skin=mdSh(dkHex(L.skin),.92);Object.assign(C,{pants:0x1e1418,boot:0x140a0c});body();
    head({eyes:'glow',glow:0xff2030,brow:0x0a0808,noHair:key=='vampm'});[-1,1].forEach(s=>k.p('head','cone4','c',0xf0ece4,s*.016,1.083,mdHeadZ(P,1.083)+.002,.006,.024,.006,Math.PI));
    if(key=='vamp'){mdChest(B,P,mdD('light','shroud',0x2a0a12,0x9a7a30));[-1,1].forEach(s=>mdAS(B,P,s,6,8,.006,{col:0x1a0a10}));mdBoots(B,P,mdD('medium','strider',0x140a0c,0x6a0c16));dkHighCollar(k,0x6a0c16,false);mdCape(B,P,0x6a0c16,{len:.36})}
    else{mdChest(B,P,mdD('cloth','vestments',0x3a0a14,0x6a0c16));mdHelm(B,P,mdD('cloth','linen',0x2a0610,0x6a0c16));dkHighCollar(k,0x6a0c16,true);k.p('chest','oct','g',0xff2030,0,.8,mdTorsoAt(P,.8).f+P.tOff+.012,.03,.045,.014)}break;
  case 'vampk':human();body();head({noHair:true});mdChest(B,P,mdD('heavy','warplate',0x2a1a20,0x5a2a30,{ti:3}));mdHelm(B,P,mdD('heavy','winged',0x2a1a20,0x5a2a30,{G:0xff2030}));
    mdBoots(B,P,mdD('heavy','sabaton',0x2a1a20,0x5a2a30));dkHighCollar(k,0x6a0c16,false);mdCape(B,P,0x5a0a14,{len:.36,trim:0x2a0610});break;
  case 'vlord':human({hair:0x0a0808,hairStyle:0,eye:0xff2030});C.skin=mdSh(dkHex(L.skin),.92);body();head({eyes:'glow',glow:0xff2030,brow:0x0a0808});
    P.noTabard=1;mdChest(B,P,mdD('heavy','aegis',0x24161c,0x9a7a30,{ti:4}));mdTabard(B,P,0x5a0a14,0x9a7a30,null);mdHelm(B,P,mdD('cloth','crown',0x9a7a30,0xc8a040,{gem:0xff2030}));mdBoots(B,P,mdD('heavy','tread',0x24161c,0x9a7a30));
    dkHighCollar(k,0x6a0c16,true);mdCape(B,P,0x6a0c16,{len:.22,w:1.12,trim:0x9a7a30});break;
  case 'abom':P.belly=.22;P.armX=.05;P.build=2;P.head={w:.92};Object.assign(C,{torso:skin,sleeve:skin,fore:skin,pants:0x4a4030,shin:skin,boot:skin,sole:mdSh(skin,.6),belt:0x2a1a14});
    P.paint.torso=m=>m.s>.3&&Math.abs(m.c)<.07&&m.y<.86?0x3a2418:m.y<.8&&m.y>.52&&m.s>.25?mdMix(skin,0xc8b890,.3):skin;body();head({eyes:'glow',glow:0xffd040,noHair:true,brow:mdSh(skin,.55)});
    mdLoin(B,P,0x4a4030,0x2a2418,.36,.5);[-1,1].forEach(s=>mdAS(B,P,s,4,5,.012,{col:0x3a2a1a}));
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,q=mdTorsoAt(P,.95);k.L('chest','m',0x5a5a60,[Math.cos(a)*q.rx*.95,1.0,Math.sin(a)*q.f*.95],[Math.cos(a)*q.rx*1.15,.76,Math.sin(a)*q.f*1.3],.012,.012,4);k.p('chest','cone4','m',0x6a6a70,Math.cos(a)*q.rx*1.15,.73,Math.sin(a)*q.f*1.3,.02,.07,.02,Math.PI)}
    for(let i=0;i<6;i++){const y=.58+i*.05;k.p('spine','box','c',0x2a1a14,0,y,mdTorsoAt(P,y).f+.004,.05,.006,.006)}break;
  default:human();body();head({})}
  mdKit(B,k);return B}
// swap the body of a freshly built humanoid foe; the old kit is never baked (DKBK entry pre-filled with nothing)
{const f=mkHumanoid;mkHumanoid=function(key){DKBK=DKBK||{};if(HUMLOOK[key]&&!DKBK['E|'+key])DKBK['E|'+key]={};const g=f.apply(this,arguments);
  try{const h=g.h,body=huBody(h);if(body&&body.skeleton&&HUMLOOK[key]){const G=mdFoeGeo(key),M=mdMats();
      h.children.filter(o=>o.isSkinnedMesh&&o!==body).forEach(o=>h.remove(o));
      body.geometry=G.c;body.material=M.c;body.castShadow=true;body.userData.lowpoly=1;
      ['m','g'].forEach(t=>{if(!G[t])return;const m=new THREE.SkinnedMesh(G[t],M[t]);m.dk=1;m.castShadow=t!='g';m.frustumCulled=false;h.add(m);m.bind(body.skeleton,body.bindMatrix)})}}
  catch(e){console.error('foe model',key,e)}return g}}

