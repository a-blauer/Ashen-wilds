// ================= v83: low-poly enemies, Sovereigns and eggs (toolkit in zzD_lowpoly.js) =================
// Every creature rig the companions did not already cover gets an LPR entry, so lpRig builds it as one chunky,
// flat-shaded, vertex-painted body skinned to the rig's OLD skeleton (same bones → same walk/attack animation,
// same boss sizes and hit areas):
//   Goo (Caustic Goo, Acid Spitter) · Maggot · Scorpion · EyeWolf (Argus) · Hydra · IceWraith (Rime Wraith) · Centipede (Ssith'ra)
// The two humanoid Sovereigns (The Bloated One, Lord Vaelric) are built by mkHumanoid like the other humanoid enemies.
// Eggs (hatch preview, hatch animation and eggs dropped in the world) become faceted, speckled low-poly eggs.
function bzC(h){return new THREE.Color(h)}
function bzClamp(v,a,b){return v<a?a:v>b?b:v}

// ---------------- Caustic Goo / Acid Spitter: a lumpy, translucent slime with a drowned skull inside ----------------
// Bones (model space): pelvis (0,.2,0) spine .36 chest .5 neck .6 head (0,.66,.06) jaw (0,.5,.22); pseudopods fl/fr 0→2 out to (±.46,.08,.24). Anim 'waddle'.
LPR.Goo={
  head:['head',0,.78,.06],up:.1,
  back:[['chest',0,.7,-.12],['spine',0,.58,-.26],['pelvis',0,.42,-.36]],
  mat:{transparent:true,opacity:.72,roughness:.32,side:THREE.FrontSide,emissive:0x081404},
  geo(C){
    const main=bzC(C).lerp(bzC(0x40502a),.22),deep=main.clone().multiplyScalar(.42),lite=main.clone().lerp(bzC(0xf4ffb8),.38),crust=main.clone().lerp(bzC(0x2e2a1c),.62);
    // vertical blob: [y, half width, front, back, bone A, bone B, blend, jitter]
    const B=[[0,.44,.42,.4,'pelvis','pelvis',0,.06],[.03,.52,.5,.48,'pelvis','pelvis',0,.12],[.12,.53,.5,.5,'pelvis','pelvis',0,.1],[.24,.5,.47,.47,'pelvis','spine',.5,.1],
      [.36,.46,.43,.44,'spine','spine',0,.09],[.47,.41,.39,.4,'spine','chest',.6,.08],[.57,.34,.33,.33,'chest','chest',0,.07],[.66,.26,.26,.24,'chest','head',.5,.06],
      [.74,.17,.17,.16,'head','head',0,.05],[.8,.08,.08,.08,'head','head',0,0],[.82,.015,.015,.015,'head','head',0,0]];
    const lofts=[{rings:B.map(q=>({p:[0,q[0],0],rx:q[1],ryT:q[2],ryB:q[3],b:[q[4],q[5],q[6]],j:q[7]})),seg:11,ref:[0,0,1],capA:1,capB:1,paint:(o,r,s,c,i)=>{
      const y=r.p[1];o.copy(main);
      if(y<.05)o.copy(crust);else if(y<.14)o.lerp(crust,.45);   // crusted, dirty base where it drags on the ground
      else if(y>.6)o.lerp(lite,.5);else if(s<-.2)o.lerp(deep,.35);
      if((i*7+Math.round(c*5))%5==0&&y>.1)o.lerp(deep,.45);        // dark blotches of whatever it has dissolved
    }}];
    // two dripping pseudopods
    ['fl','fr'].forEach((k,j)=>{const s=j?1:-1;lofts.push({rings:[
      {p:[s*.2,.36,.04],rx:.14,b:['chest',k+'0',.4]},{p:[s*.3,.3,.1],rx:.12,b:[k+'0',k+'0',0],j:.15},{p:[s*.4,.2,.18],rx:.1,b:[k+'0',k+'1',.6],j:.15},
      {p:[s*.46,.09,.24],rx:.075,b:[k+'1',k+'2',.6],j:.15},{p:[s*.5,.02,.28],rx:.04,b:[k+'2',k+'2',0]},{p:[s*.52,-.01,.3],rx:.01,b:[k+'2',k+'2',0]}],
      seg:7,ref:[0,1,0],capB:1,paint:(o,r)=>{o.copy(main);if(r.p[1]<.12)o.lerp(crust,.4)}})});
    return lpGeo('Goo|'+C,'Goo',lofts,61);
  },
  kit(k,c,C,red){
    const main=bzC(C).lerp(bzC(0x40502a),.22),bone=0xb8ae8c,bone2=0x8a8068,eye=red?0xff2a2a:0xb0b830,lite=main.clone().lerp(bzC(0xf4ffb8),.5).getHex(),crust=dkShade(main.clone().lerp(bzC(0x2e2a1c),.62).getHex(),.8),R=dkRng(5);
    // a drowned skull and loose bones floating in the slime
    k.p('chest','sph','c',bone,0,.44,.0,.11,.1,.12).p('chest','box','c',bone2,0,.39,.07,.08,.04,.06);
    [-1,1].forEach(s=>k.p('chest','sph','c',0x141008,s*.042,.45,.1,.032,.03,.02));
    for(let i=-2;i<=2;i++)k.p('chest','cone4','c',0xd8d0b0,i*.016,.36,.11,.007,.03,.007,Math.PI);
    k.L('spine','c',bone,[-.18,.26,-.08],[.12,.2,.08],.02,.016,5).L('spine','c',bone2,[.16,.3,-.14],[.04,.4,-.24],.016,.014,5);
    for(let i=0;i<4;i++)k.L('spine','c',bone2,[-.12+i*.05,.3,-.1],[-.08+i*.05,.24,.04],.01,.008,4);   // a ribcage fragment
    // eyes: glowing slits sunk into the surface
    // three mismatched eyes adrift near the surface: glowing balls with black slit pupils
    [[-.09,.6,.28,.032],[.11,.65,.25,.024],[.02,.72,.19,.016]].forEach(   // (v177: smaller, duller — they read as cartoon eyes)
      q=>{k.p('head','sph','c',0x050805,q[0],q[1],q[2]-q[3]*.5,q[3]*1.25);k.p('head','sph','g',eye,q[0],q[1],q[2]+q[3]*.35,q[3]);k.p('head','box','c',0x000000,q[0],q[1],q[2]+q[3]*1.3,q[3]*.18,q[3]*1.1,q[3]*.12)});
    // wide jagged maw (the lower lip is on the jaw bone, so it gapes on attack)
    k.p('jaw','box','c',0x0a1404,0,.47,.4,.26,.07,.04,0,0,.1).p('jaw','box','c',crust,0,.43,.41,.24,.025,.05,0,0,.1);
    for(let i=0;i<9;i++){const x=-.11+i*.0275,h=.03+((i*5)%3)*.012;k.p('head','cone4','c',0xd8d0b0,x,.505,.41,.009,h,.009,Math.PI);if(i%2)k.p('jaw','cone4','c',0xc8c0a0,x,.445,.415,.008,h*.8,.008)}
    // bubbles rising through it, drips and a caustic puddle at its base
    for(let i=0;i<14;i++){const a=R()*Math.PI*2,y=.12+R()*.55,rr=(.52-y*.5)*(.85+R()*.1);k.p(y>.5?'chest':'spine','sph','g',i%3?lite:0xf8ffc0,Math.cos(a)*rr,y,Math.sin(a)*rr,.015+R()*.022)}
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3,rr=.5,h=.1+R()*.08;k.L('pelvis','c',dkShade(main.getHex(),.75),[Math.cos(a)*rr,.06+h,Math.sin(a)*rr],[Math.cos(a)*(rr+.03),.05,Math.sin(a)*(rr+.03)],.026,.008,5)}
    k.p('pelvis','cyl','c',crust,0,.008,0,.66,.016,.62);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2,rr=.6+R()*.08;k.p('pelvis','sph','c',crust,Math.cos(a)*rr,.012,Math.sin(a)*rr,.075,.012,.06)}
    // the Acid Spitter has a puckered spout on top that it spits from
    if(c&&c.g&&c.g[0]=='spitter'){k.L('head','c',dkShade(main.getHex(),.7),[0,.74,.04],[0,.88,.12],.08,.05,7);k.p('head','ring','g',0xf8ff70,0,.885,.125,.05,.4,.05,-.6);k.p('head','sph','c',0x101804,0,.888,.128,.035,.01,.035,-.6)}
  }};

// ---------------- Bloat Maggot: a pale, segmented grub with a lamprey mouth ----------------
// Gravewyrm bones (tail3 −1.35 … head .5, y≈.25). Body lies low on the ground; no neck lift.
function bzMagR(z){const t=bzClamp((z+1.6)/.6,0,1);let r=.035+.18*Math.sin(t*Math.PI/2);if(z>.3)r*=1-.42*bzClamp((z-.3)/.3,0,1);return r}
LPR.Maggot={
  head:['head',0,.27,.48],up:.07,
  back:[['chest',0,.36,.2],['spine',0,.39,0],['pelvis',0,.4,-.27],['tail0',0,.38,-.52]],
  geo(C){
    const main=bzC(C).lerp(bzC(0xcdbf9c),.35),fold=main.clone().lerp(bzC(0x8a7240),.45),under=main.clone().lerp(bzC(0xa89080),.35),gut=main.clone().lerp(bzC(0x3a2a18),.55),wet=main.clone().lerp(bzC(0xf2ead8),.4);
    const rings=[];let i=0;
    for(let z=-1.62;z<=.6001;z+=.074,i++){const pinch=i%2==1,r=bzMagR(z)*(pinch?.86:1),ryB=r*.82;rings.push({p:[0,ryB+.004,z],rx:r*1.04,ryT:r*.96,ryB,b:wyrmBones(z),pinch,z})}
    return lpGeo('Maggot|'+C,'Maggot',[{rings,seg:9,capA:1,capB:1,paint:(o,r,s,c,i)=>{
      if(s<-.5){o.copy(under);if(r.pinch)o.multiplyScalar(.85);return}
      o.copy(r.pinch?fold:main);
      if(!r.pinch&&s>.2&&s<.7)o.lerp(wet,.35);                           // glistening tops of the rolls
      if(s>.82&&r.z<.25&&r.z>-1.3)o.lerp(gut,.55);                         // the dark gut shows through the skin
    }}],83);
  },
  kit(k,c,C,red){
    const main=bzC(C).lerp(bzC(0xcdbf9c),.35),dk=dkShade(main.getHex(),.45),R=dkRng(13);
    // lamprey mouth: a dark red pit ringed with hooked teeth, and a puckered lip
    const mz=.6,my=bzMagR(.6)*.82+.004;
    k.p('head','cyl','c',0x3a080c,0,my,mz+.004,.072,.02,.072,Math.PI/2).p('head','sph','c',0x120204,0,my,mz+.005,.045,.045,.01);
    k.p('head','ring','c',dkShade(0xb07870,.9),0,my,mz,.09,.09,.09,Math.PI/2);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.cos(a)*.064,y=my+Math.sin(a)*.064;k.L('head','c',0xece4cc,[x,y,mz+.01],[x*.4,my+(y-my)*.4,mz+.045],.011,.002,3)}
    // clusters of tiny black eyes
    // (v177) set into the skin of the head (they hovered over it)
    const top=(x,z)=>{const r=bzMagR(z);return r*.82+.004+r*.96*Math.sqrt(Math.max(0,1-Math.pow(x/(r*1.04),2)))};
    [-1,1].forEach(s=>[[.05,.47],[.065,.5],[.035,.5]].forEach(q=>k.p('head','sph',red?'g':'c',red?0xff2a2a:0x0a0606,s*q[0],top(q[0],q[1])-.004,q[1],.013)));
    // bristles on every roll, stubby prolegs underneath
    for(let z=-1.36;z<.35;z+=.148){const r=bzMagR(z),bn=wyrmBones(z),b=bn[2]>.5?bn[1]:bn[0],y=r*.82+.004;
      [-1,1].forEach(s=>{k.L(b,'c',dk,[s*r*.95,y+r*.25,z],[s*(r*1.3),y+r*.5+R()*.03,z-.03],.007,.002,3);k.p(b,'sph','c',dkShade(main.getHex(),.62),s*r*.6,.025,z,.035,.025,.04)})}
    // two fleshy tail spurs
    [-1,1].forEach(s=>k.L('tail3','c',dkShade(main.getHex(),.8),[s*.02,.05,-1.56],[s*.06,.09,-1.7],.022,.004,4));
  }};

// ---------------- Dune Scorpion: flat plated body, big pincers and an arched stinger ----------------
// Cryptspider bones: legs a0-3/b0-3 (anim 'spider'), body pelvis −.15 … head .4 (y≈.4), abdomen chain tail0 −.3 … tail3 −.62.
LPR.Scorpion={
  head:['head',0,.48,.36],up:.08,
  back:[['chest',0,.5,.2],['spine',0,.5,.02],['pelvis',0,.51,-.16],['tail0',0,.5,-.34]],
  geo(C){
    const main=lpMain(C,.15),dark=main.clone().multiplyScalar(.48),edge=main.clone().lerp(bzC(0xead6a8),.35),under=main.clone().multiplyScalar(.68),tip=bzC(0x2a1a10);
    // carapace + plated abdomen: [z, y, half width, above, below, bones]
    const body=[[.53,.37,.02,.015,.015,['head','head',0]],[.49,.375,.1,.05,.04,['head','head',0]],[.43,.385,.16,.07,.05,['head','head',0]],[.34,.395,.2,.08,.06,['chest','head',.6]],
      [.23,.4,.215,.085,.065,['chest','chest',0]],[.12,.4,.205,.08,.062,['spine','chest',.5]],[.03,.405,.2,.078,.06,['spine','spine',0]],[-.07,.41,.215,.088,.066,['pelvis','spine',.4]],
      [-.17,.415,.215,.08,.064,['pelvis','pelvis',0]],[-.27,.42,.205,.088,.066,['tail0','pelvis',.4]],[-.36,.425,.18,.074,.06,['tail0','tail0',0]],[-.45,.43,.15,.07,.056,['tail1','tail0',.3]],
      [-.52,.44,.11,.06,.05,['tail1','tail1',0]]];
    const lofts=[{rings:body.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],i})),seg:10,capA:1,capB:1,paint:(o,r,s,c,i)=>{
      o.copy(main);if(s<-.3){o.copy(under);return}
      if(i>=6&&i%2==0&&s>.3)o.copy(edge);                                // pale rims of the overlapping back plates
      else if(s>.75)o.lerp(dark,.35);
      if(i<4&&s>.6&&Math.abs(c)<.3)o.lerp(dark,.55);                     // dark eye mound on the carapace
    }}];
    // metasoma: the segmented tail arching up over the back
    const T=[[.44,-.5,.08,['tail1','tail1',0]],[.5,-.61,.077,['tail1','tail2',.6]],[.6,-.7,.072,['tail2','tail2',0]],[.74,-.76,.07,['tail2','tail3',.5]],
      [.88,-.75,.067,['tail3','tail3',0]],[1.01,-.68,.064,['tail3','tail3',0]],[1.09,-.57,.06,['tail3','tail3',0]],[1.11,-.46,.062,['tail3','tail3',0]],
      [1.08,-.37,.078,['tail3','tail3',0]],[1.03,-.29,.07,['tail3','tail3',0]],[.98,-.23,.03,['tail3','tail3',0]]];
    lofts.push({rings:T.map((q,i)=>({p:[0,q[0],q[1]],rx:q[2]*(i%2?.9:1),b:q[3],i})),seg:7,ref:[1,0,0],capA:1,capB:1,paint:(o,r,s,c,i)=>{
      o.copy(i>=8?dark:main);if(i%2&&i<8)o.lerp(edge,.4);if(s<-.5&&i<8)o.copy(under)}});
    // eight jointed legs on the spider leg chains, thinner and darker-tipped
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const L=spidLeg(s,i),k=L.k,rs=.78-i*.03,R=(p,r,b,jt)=>({p,rx:r*rs,b,jt});
      lofts.push({rings:[R(spidLerp(L.p0,L.p1,-.1),.046,[k+'0',k+'0',0]),R(spidLerp(L.p0,L.p1,.5),.044,[k+'0',k+'0',0]),R(spidLerp(L.p0,L.p1,.9),.036,[k+'0',k+'1',.5]),
        R(L.p1,.042,[k+'1',k+'1',0],1),R(spidLerp(L.p1,L.p2,.5),.034,[k+'1',k+'1',0]),R(spidLerp(L.p1,L.p2,.92),.026,[k+'1',k+'2',.5]),
        R(L.p2,.03,[k+'2',k+'2',0],1),R(spidLerp(L.p2,L.p3,.6),.018,[k+'2',k+'2',0]),R(L.p3,.005,[k+'2',k+'2',0])],
        seg:5,ref:[0,0,1],capA:1,capB:1,paint:(o,r)=>{o.copy(r.jt?edge:main);if(r.p[1]<.15)o.copy(tip)}})}));
    return lpGeo('Scorpion|'+C,'Scorpion',lofts,47);
  },
  kit(k,c,C,red){
    const main=lpMain(C,.15),M=main.getHex(),dark=dkShade(M,.5),edge=main.clone().lerp(bzC(0xead6a8),.35).getHex(),eye=red?0xff2a2a:0xff5020,venom=0xffb030;
    [-1,1].forEach(s=>{
      // pincers: upper arm, forearm, swollen claw with a fixed and a hooked moving finger
      k.L('chest','c',M,[s*.13,.39,.38],[s*.25,.38,.52],.045,.036,6).L('chest','c',edge,[s*.25,.38,.52],[s*.31,.38,.63],.036,.044,6);
      k.p('chest','sph','c',M,s*.32,.38,.72,.075,.055,.11,0,s*.15,0).p('chest','box','c',edge,s*.32,.42,.72,.05,.012,.09,0,s*.15,0);
      k.L('chest','c',dark,[s*.29,.38,.79],[s*.26,.38,.92],.034,.006,5).L('chest','c',dark,[s*.36,.39,.78],[s*.3,.4,.9],.03,.005,5);
      for(let i=0;i<3;i++)k.p('chest','cone4','c',dark,s*(.34+i*.01),.43,.62+i*.05,.01,.035,.01,0,0,-s*.4);
      // main and side eyes
      k.p('head','sph','c',0x080606,s*.028,.465,.36,.022).p('head','sph','g',eye,s*.03,.472,.37,.013);
      [[.12,.42,.46],[.135,.415,.44],[.11,.425,.48]].forEach(q=>k.p('head','sph','g',eye,s*q[0],q[1],q[2],.008));
      // little chelicerae on the jaw
      k.L('jaw','c',dark,[s*.03,.37,.5],[s*.035,.35,.56],.02,.008,4);
    });
    // spines down the plated back, the stinger and its venom drop
    [['chest',.24],['spine',.04],['pelvis',-.16],['tail0',-.35]].forEach(q=>[-1,1].forEach(s=>k.L(q[0],'c',dark,[s*.08,.48,q[1]],[s*.1,.53,q[1]-.04],.016,.002,4)));
    [[.6,-.71],[.88,-.76],[1.09,-.58]].forEach(q=>k.L('tail3','c',dark,[0,q[0]+.06,q[1]],[0,q[0]+.11,q[1]-.02],.016,.002,4));
    k.L('tail3','c',0x1a120a,[0,1.0,-.24],[0,.9,-.12],.03,.004,5).L('tail3','c',0x1a120a,[0,.9,-.12],[0,.84,-.12],.01,.002,4);
    k.p('tail3','sph','g',venom,0,.83,-.12,.014,.02,.014);
  }};

// ---------------- Argus, the Hundred-Eyed: the dire-wolf frame studded with staring eyes ----------------
// Same skeleton and template space as Ashwolf, so the wolf body is reused; the eyes and bone spurs are its own.
LPR.EyeWolf={
  sc:LPR.Ashwolf.sc*1.15/1.05*.96,head:LPR.Ashwolf.head,back:LPR.Ashwolf.back,up:.12,
  geo(C){return LPR.Ashwolf.geo(C)},
  kit(k,c,C,red){
    LPR.Ashwolf.kit(k,c,C,red);
    const P=wolfP,R=dkRng(21),irises=red?[0xff2a2a]:[0xffd040,0xff3a2a,0xe8ff60,0xffa020],lid=dkShade(wolfCols(C).main.getHex(),.75);
    // eyes in the hide: socket, a puffy lid, a glowing iris and a black slit
    const eye=(bn,tz,ang,big)=>{const r=WOLF_BODY.reduce((a,q)=>Math.abs(q[0]-tz)<Math.abs(a[0]-tz)?q:a),rx=r[2]*1.1,ry=r[3]*1.2,sz=big||1,
      x=Math.sin(ang)*rx,y=r[1]+Math.cos(ang)*ry,ox=Math.sin(ang),oy=Math.cos(ang),q=P([x,y,tz]),q2=P([x+ox*.012,y+oy*.012,tz]),q3=P([x+ox*.02,y+oy*.02,tz]);
      k.p(bn,'sph','c',lid,q[0],q[1],q[2],.036*sz,.03*sz,.04*sz).p(bn,'sph','c',0x050404,q2[0],q2[1],q2[2],.028*sz,.022*sz,.03*sz)
       .p(bn,'sph','g',irises[(R()*irises.length)|0],q3[0],q3[1],q3[2],.019*sz,.016*sz,.02*sz).p(bn,'box','c',0x000000,q3[0]+ox*.012*sz,q3[1]+oy*.012*sz,q3[2],.006*sz,.026*sz,.012*sz,0,0,-ang)};
    [['neck',.36,.5],['neck',.3,-.7],['chest',.2,.9],['chest',.15,-.35],['chest',.08,.25],['chest',.05,-1.1],['spine',-.02,.7],['spine',-.06,-.2],['spine',-.12,1.05],
     ['spine',-.15,-.9],['pelvis',-.22,.3],['pelvis',-.26,-.6],['pelvis',-.3,1.2],['neck',.4,-.15],['chest',.12,1.35],['spine',-.04,-1.4]].forEach(e=>eye(e[0],e[1],e[2],e[1]>.3?.85:1));
    // the great third eye in the brow
    const f=P([0,.67,.585]);k.p('head','sph','c',lid,f[0],f[1],f[2],.05,.035,.03).p('head','sph','c',0x050404,f[0],f[1],f[2]+.01,.04,.028,.025).p('head','sph','g',red?0xff2a2a:0xffd040,f[0],f[1],f[2]+.02,.028,.022,.016).p('head','box','c',0x000000,f[0],f[1],f[2]+.036,.008,.034,.006);
    // jagged bone spurs along the spine and a crown of horns
    [[.33,.65,'neck'],[.24,.66,'chest'],[.15,.65,'chest'],[.05,.62,'chest'],[-.06,.6,'spine'],[-.17,.6,'spine'],[-.27,.6,'pelvis']].forEach((q,i)=>{
      const a=P([0,q[1],q[0]]),b=P([0,q[1]+.11+(i%2)*.05,q[0]-.07]);k.L(q[2],'c',i%2?0xc8bca0:0x9a907a,a,b,.03,.003,5)});
    [-1,1].forEach(s=>{k.L('head','c',0xc8bca0,P([s*.05,.66,.5]),P([s*.12,.78,.4]),.026,.012,5).L('head','c',0x9a907a,P([s*.12,.78,.4]),P([s*.14,.86,.3]),.012,.002,5)});
  },
  post(x,c,C,mat){LPR.Ashwolf.post(x,c,C,mat)}};

// ---------------- shared serpent head (Hydra) ----------------
// wedge head rings relative to the head base point: [dz, dy, half width, above, below]
var BZ_HEAD=[[0,0,.11,.08,.06],[.09,.01,.13,.08,.055],[.19,.005,.105,.065,.042],[.28,-.002,.072,.05,.03],[.35,-.008,.036,.03,.02],[.4,-.01,.008,.008,.008]];
function bzHeadKit(k,bn,h,sc,eye,bone,col){const x=h[0],y=h[1],z=h[2],S=sc;
  k.p(bn,'cone4','c',0xb8a878,x,y-.05*S,z+.2*S,.08*S,.34*S,.022*S,Math.PI/2).p(bn,'box','c',0x4a1014,x,y-.035*S,z+.2*S,.085*S,.008,.2*S);
  [-1,1].forEach(s=>{
    k.p(bn,'box','c',0x0a0908,x+s*.1*S,y+.03*S,z+.1*S,.026*S,.036*S,.05*S,0,s*.3,0).p(bn,'box','g',eye,x+s*.11*S,y+.032*S,z+.102*S,.012*S,.03*S,.036*S,0,s*.3,0);
    k.p(bn,'box','c',col,x+s*.09*S,y+.06*S,z+.09*S,.05*S,.018*S,.08*S,0,s*.3,s*.35);
    k.p(bn,'cone4','c',0xf0eadc,x+s*.045*S,y-.07*S,z+.26*S,.012*S,.055*S,.012*S,Math.PI).p(bn,'cone4','c',0xf0eadc,x+s*.075*S,y-.06*S,z+.18*S,.008*S,.03*S,.008*S,Math.PI);
    // swept-back frill of horns
    k.L(bn,'c',bone,[x+s*.06*S,y+.06*S,z],[x+s*.17*S,y+.14*S,z-.16*S],.028*S,.004,5).L(bn,'c',dkShade(bone,.8),[x+s*.11*S,y+.02*S,z-.02*S],[x+s*.22*S,y+.04*S,z-.12*S],.02*S,.003,4);
  });
  k.L(bn,'c',bone,[x,y+.07*S,z+.02*S],[x,y+.17*S,z-.12*S],.026*S,.003,5)}

// ---------------- The Crest Hydra: a thick serpent body with three raised heads ----------------
// Gravewyrm bones. The middle neck rises from the chest to a head on the head bone (so attacks lunge it forward);
// the two side necks grow from the chest/neck bones.
var HYD_SIDE=s=>[[s*.08,.34,.14],[s*.2,.48,.2],[s*.32,.64,.25],[s*.4,.8,.3],[s*.44,.9,.36],[s*.46,.94,.44]];
LPR.Hydra={
  sc:1.1,head:['head',0,1.12,.62],up:.12,
  back:[['chest',0,.4,.16],['spine',0,.42,0],['pelvis',0,.42,-.27],['tail0',0,.37,-.52]],
  geo(C){
    const main=lpMain(C,.12),back=main.clone().multiplyScalar(.55),belly=bzC(0xc8b88a),blot=main.clone().lerp(bzC(0x141a0c),.5),band=main.clone().lerp(bzC(0xb0a060),.3);
    const body=WYRM_BODY.filter(q=>q[0]<.3).map(q=>{const z=q[0],r=q[1]*1.2,ryB=r*.72;return {p:[wyrmCurve(z),ryB+.006,z],rx:r,ryT:r*.85,ryB,b:wyrmBones(z)}});
    // middle neck: rises up to the head bone
    const mid=[[.28,.36,.17,'chest','neck',.5],[.34,.5,.15,'neck','neck',0],[.38,.65,.135,'neck','head',.3],[.4,.8,.125,'neck','head',.7],[.44,.92,.12,'head','head',0],[.52,.98,.12,'head','head',0]];
    const neckRings=mid.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[2]*.95,ryB:q[2]*.9,b:[q[3],q[4],q[5]]}));
    const head=(h,bn,S)=>BZ_HEAD.map(q=>({p:[h[0],h[1]+q[1]*S,h[2]+q[0]*S],rx:q[2]*S,ryT:q[3]*S,ryB:q[4]*S,b:[bn,bn,0],hd:1}));
    const paint=(o,r,s,c,i)=>{
      if(s<-.45){o.copy(belly);if(i%2)o.multiplyScalar(.82);return}
      o.copy(main);if(r.hd){if(s>.4)o.lerp(back,.7);return}
      if(s>.6)o.copy(i%2?back:band.clone().lerp(back,.35));else if(i%2==0&&s>-.3)o.copy(blot);else if(s>.2)o.lerp(band,.4)};
    const lofts=[{rings:body.concat(neckRings,head([0,.99,.58],'head',1.4)),seg:8,capA:1,capB:1,paint}];
    [-1,1].forEach(s=>{const N=HYD_SIDE(s),rr=[.13,.12,.11,.105,.1,.1];
      lofts.push({rings:N.map((p,i)=>({p,rx:rr[i],ryT:rr[i]*.95,ryB:rr[i]*.9,b:i<2?['chest','chest',0]:['chest','neck',.6]})).concat(head([s*.47,.95,.5],'neck',1.2)),seg:8,capA:1,capB:1,paint})});
    return lpGeo('Hydra|'+C,'Hydra',lofts,29);
  },
  kit(k,c,C,red){
    const main=lpMain(C,.12),bone=0xd0c4a0,eye=red?0xff2a2a:0xffc020,col=dkShade(main.getHex(),.5);
    bzHeadKit(k,'head',[0,.99,.58],1.4,eye,bone,col);
    [-1,1].forEach(s=>bzHeadKit(k,'neck',[s*.47,.95,.5],1.2,eye,bone,col));
    // a tall finned crest down the spine
    [['neck',.42,.14],['chest',.3,.16],['chest',.18,.19],['spine',.06,.21],['spine',-.06,.225],['pelvis',-.19,.228],['pelvis',-.32,.22],['tail0',-.46,.205],['tail0',-.6,.186],['tail1',-.74,.168],['tail1',-.88,.145],['tail2',-1.02,.12],['tail2',-1.16,.096],['tail3',-1.3,.07]].forEach((q,i)=>{
      const z=q[1],r=q[2]*1.2,y=z>.3?.5:r*.72+.006+r*.85,x=wyrmCurve(z);k.L(q[0],'c',i%2?bone:dkShade(bone,.75),[x,y-.03,z+.02],[x,y+r*.6,z-.1],r*.32,.004,4)});
    [-1,1].forEach(s=>k.L('tail3','c',bone,[wyrmCurve(-1.56),.03,-1.55],[wyrmCurve(-1.7)+s*.04,.06,-1.74],.024,.002,4));
  }};

// ---------------- The Rime Wraith: a translucent ice-blue shroud around a frost-bitten skull ----------------
LPR.IceWraith={
  head:['head',0,1.2,-.02],up:.12,
  back:LPR.Wispling.back,
  mat:{transparent:true,opacity:.72,depthWrite:false,emissive:0x0c2a40},
  geo(C){return LPR.Wispling.geo(C)},
  kit(k,c,C,red){
    const bone=0xc8d8e2,bone2=0x8aa0b0,ice=0xd8f4ff,ice2=0x9ad8ff,eye=red?0xff2a2a:0x9ff0ff,R=dkRng(17);
    // skull: cranium, cheekbones, sockets, a hanging jaw full of teeth
    k.p('head','sph','c',bone,0,1.0,.01,.1,.11,.11).p('head','box','c',bone2,0,.94,.07,.075,.04,.06);
    [-1,1].forEach(s=>{k.p('head','box','c',0x030608,s*.042,.995,.095,.042,.034,.02,0,s*.2,s*.2).p('head','box','g',eye,s*.044,.995,.107,.024,.012,.008,0,s*.2,s*.2);
      k.p('head','box','c',bone2,s*.07,.96,.07,.03,.02,.05,0,s*.4,0)});
    k.p('jaw','box','c',bone,0,.9,.08,.07,.022,.06);for(let i=-2;i<=2;i++){k.p('head','cone4','c',0xe8f0f4,i*.016,.928,.115,.006,.02,.006,Math.PI);k.p('jaw','cone4','c',0xd8e4ea,i*.016,.91,.11,.006,.016,.006)}
    // crown of ice shards
    for(let i=0;i<9;i++){const a=-Math.PI*.8+i/8*Math.PI*1.6,x=Math.sin(a)*.1,z=-.01+Math.cos(a)*.09,h=.12+(4-Math.abs(i-4))*.035;k.L('head',i%2?'g':'c',i%2?ice:ice2,[x,1.08,z],[x*1.35,1.08+h,z*1.2-.02],.024,.003,4)}
    // shoulder shards, a frozen heart, icicles hanging from the shroud
    [-1,1].forEach(s=>{k.L('chest','c',ice2,[s*.15,.84,-.02],[s*.28,1.0,-.08],.04,.004,4).L('chest','g',ice,[s*.12,.86,-.06],[s*.2,1.05,-.12],.026,.003,4).L('chest','c',ice2,[s*.17,.8,.02],[s*.3,.86,.02],.03,.003,4)});
    k.p('chest','ico','g',0xbff4ff,0,.72,.04,.055).p('chest','oct','c',ice2,0,.72,.04,.075,.09,.06);
    [['pelvis',.47,.13],['tail0',.36,.1],['tail1',.25,.07]].forEach(q=>{for(let i=0;i<7;i++){const a=i/7*Math.PI*2+R(),x=Math.cos(a)*q[2],z=-.05+Math.sin(a)*q[2];k.L(q[0],i%2?'g':'c',i%2?ice:ice2,[x,q[1],z],[x*1.1,q[1]-.08-R()*.06,z],.016,.002,4)}});
    // long ice talons
    [['fl2',-.225],['fr2',.225]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'g',ice,[f[1],.57,.09],[f[1]+i*.03,.42,.14],.012,.002,4)));
    k.p('tail3','oct','g',ice,0,.02,-.31,.035,.06,.035);
  }};

// ---------------- Ssith'ra the Endless: a vast plated centipede ----------------
function bzCenR(z){const t=bzClamp((z+1.62)/.45,0,1);return (.045+.115*Math.sin(t*Math.PI/2))*(z>.38?1-.3*bzClamp((z-.38)/.24,0,1):1)}
function bzCenY(z){return z>.3?.03*bzClamp((z-.3)/.3,0,1):0}
LPR.Centipede={
  sc:.98,head:['head',0,.26,.52],up:.08,
  back:[['chest',0,.24,.2],['spine',0,.25,0],['pelvis',0,.25,-.27],['tail0',0,.24,-.52]],
  geo(C){
    const main=lpMain(C,.1),plate=main.clone().multiplyScalar(.62),rim=main.clone().lerp(bzC(0xe08a3a),.45),under=main.clone().lerp(bzC(0xc89060),.35),hd=main.clone().multiplyScalar(.45);
    const rings=[];let i=0;
    for(let z=-1.62;z<=.6201;z+=.062,i++){const seam=i%2==1,r=bzCenR(z)*(seam?.88:1),ryB=r*.55;rings.push({p:[wyrmCurve(z)*.6,ryB+.006+bzCenY(z),z],rx:r*1.15,ryT:r*.62,ryB,b:wyrmBones(z),seam,hd:z>.38})}
    return lpGeo('Centipede|'+C,'Centipede',[{rings,seg:10,capA:1,capB:1,paint:(o,r,s,c,i)=>{
      if(s<-.4){o.copy(under);if(r.seam)o.multiplyScalar(.8);return}
      if(r.hd){o.copy(hd);if(s<.3)o.lerp(main,.4);return}
      o.copy(r.seam?rim:plate);if(!r.seam&&Math.abs(c)>.75)o.lerp(rim,.5);
    }}],71);
  },
  kit(k,c,C,red){
    const main=lpMain(C,.1),leg=dkShade(main.getHex(),.5),legTip=main.clone().lerp(bzC(0xe8a050),.5).getHex(),dk=dkShade(main.getHex(),.35),eye=red?0xff2a2a:0xffb030;
    // a pair of jointed legs for every body plate
    let n=0;for(let z=-1.42;z<.36;z+=.124,n++){const r=bzCenR(z),bn=wyrmBones(z),b=bn[2]>.5?bn[1]:bn[0],x0=wyrmCurve(z)*.6,y0=r*.55,sp=(n%2)*.02;
      [-1,1].forEach(s=>{const hip=[x0+s*r*1.05,y0,z],knee=[x0+s*(r*1.05+.14+sp),y0+.12,z+.02],foot=[x0+s*(r*1.05+.24+sp),0,z+.05];
        k.L(b,'c',leg,hip,knee,.024,.018,5).L(b,'c',legTip,knee,foot,.018,.004,5)})}
    // dorsal spikes on every other plate
    for(let z=-1.3;z<.3;z+=.248){const r=bzCenR(z),bn=wyrmBones(z),b=bn[2]>.5?bn[1]:bn[0],x0=wyrmCurve(z)*.6,y=r*.55+r*.62;[-1,1].forEach(s=>k.L(b,'c',dk,[x0+s*r*.5,y,z],[x0+s*r*.7,y+.06,z-.04],.018,.002,4))}
    // head: forcipules (on the jaw, so they snap on attack), mandibles, eye clusters, antennae
    const hy=bzCenR(.55)*.55+bzCenY(.55);
    [-1,1].forEach(s=>{
      k.L('jaw','c',dk,[s*.06,hy-.02,.56],[s*.13,hy-.03,.66],.03,.02,5).L('jaw','c',0x1a0806,[s*.13,hy-.03,.66],[s*.05,hy-.04,.76],.02,.003,5);
      k.L('head','c',legTip,[s*.03,hy,.6],[s*.02,hy-.03,.67],.014,.003,4);
      [[.05,.045,.56],[.065,.04,.55],[.055,.05,.53]].forEach(q=>k.p('head','sph','g',eye,s*q[0],hy+q[1],q[2],.011));
      k.L('head','c',dk,[s*.04,hy+.04,.6],[s*.13,hy+.16,.74],.012,.008,4).L('head','c',dk,[s*.13,hy+.16,.74],[s*.26,hy+.2,.86],.008,.003,4);
      // long tail feelers
      k.L('tail3','c',dk,[s*.03,.05,-1.58],[s*.13,.1,-1.8],.016,.008,4).L('tail3','c',legTip,[s*.13,.1,-1.8],[s*.2,.12,-1.98],.008,.002,4);
    });
  }};

// ---------------- eggs: faceted, speckled shells split along a zigzag crack ----------------
var BZEG={};
// part: 0 whole egg, 1 bottom half, 2 top half (unit size: height −1…1, radius 1 at the equator, like the old sphere)
function bzEggGeo(ec,part){
  const key=ec+'|'+part;if(BZEG[key])return BZEG[key];
  const seg=10,rows=part?6:10,R=dkRng(ec%9973+part*7),base=bzC(ec).lerp(bzC(0x3a2e24),.32),dark=base.clone().multiplyScalar(.5),lite=base.clone().lerp(bzC(0xf0e8d0),.35),tmp=new THREE.Color();
  const crack=k=>.05+(k%2?.09:-.07),P=[],Cc=[],IX=[];
  const rad=v=>Math.sqrt(Math.max(0,1-v*v))*(1-.13*v);
  const spot=[];for(let i=0;i<rows*seg;i++)spot.push(R());
  for(let i=0;i<rows;i++)for(let k=0;k<seg;k++){
    const t=i/(rows-1),v0=part==2?crack(k):-1,v1=part==1?crack(k):1,v=v0+(v1-v0)*t,a=k/seg*Math.PI*2+(i%2)*.0,r=rad(v);
    P.push(Math.cos(a)*r,v,Math.sin(a)*r);
    const q=spot[i*seg+k];tmp.copy(base);if(q<.22)tmp.copy(dark);else if(q>.9)tmp.copy(lite);else tmp.multiplyScalar(.88+q*.2);
    if(v>.75)tmp.lerp(dark,.3);Cc.push(tmp.r,tmp.g,tmp.b)}
  for(let i=0;i<rows-1;i++)for(let k=0;k<seg;k++){const a=i*seg+k,b=i*seg+(k+1)%seg,c=a+seg,d=b+seg;IX.push(a,c,b,b,c,d)}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();return BZEG[key]=G}
function bzEggMat(ec,glow){return new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.7,metalness:0,emissive:ec,emissiveIntensity:glow||0,side:THREE.DoubleSide})}
// hatch preview and hatch animation (same parts and fields as before: g, bot, top, mat, ec)
function ceEggMesh(e){
  const ec=parseInt(RAR[e.tier][1].slice(1),16),mat=bzEggMat(ec,0);
  const bot=new THREE.Mesh(bzEggGeo(ec,1),mat),top=new THREE.Mesh(bzEggGeo(ec,2),mat);bot.castShadow=top.castShadow=true;
  const g=new THREE.Group();g.add(bot,top);g.scale.set(.55,.72,.55);g.position.y=.72;return {g,bot,top,mat,ec}}
// eggs dropped in the world: same size and bob as before, now a shaded low-poly egg with a soft glow
{const f=drop;drop=function(kind,data,p,r){const n=drops.length,o=f.apply(this,arguments);
  try{if((kind=='egg'||kind=='megg')&&drops.length>n){const d=drops[drops.length-1],ec=parseInt(RAR[r][1].slice(1),16),s=kind=='megg'?1.5:1;
    d.gem.geometry=bzEggGeo(ec,0);d.gem.material=bzEggMat(ec,.35);d.gem.scale.set(.16*s,.205*s,.16*s);d.gem.castShadow=true}}catch(e){console.warn('egg drop',e)}
  return o}}

// rank ornaments (horns, spines and shoulder plates on Sovereigns and alphas) sit on SPEC.hd / SPEC.bk:
// move them onto the new bodies (these specs are only used by the low-poly rigs above)
Object.assign(SPEC.Goo,{hd:[0,.76,.08],bk:[['chest',.66,-.22],['spine',.5,-.4],['pelvis',.34,-.47]]});
Object.assign(SPEC.Maggot,{hd:[0,.19,.5],bk:[['chest',.36,.2],['spine',.38,0],['pelvis',.38,-.27]]});
Object.assign(SPEC.Scorpion,{hd:[0,.47,.38],bk:[['chest',.49,.22],['spine',.49,.03],['pelvis',.5,-.17]]});
Object.assign(SPEC.Hydra,{hd:[0,1.08,.66],bk:[['chest',.36,.16],['spine',.38,0],['pelvis',.38,-.27]]});
Object.assign(SPEC.Centipede,{hd:[0,.17,.52],bk:[['chest',.19,.2],['spine',.19,0],['pelvis',.19,-.27]]});

