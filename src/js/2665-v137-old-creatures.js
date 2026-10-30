// ================= v137: the v83 Kindlelight / Sands creatures touched up =================
// Goo and Acid Spitter: the flat black box of a mouth becomes a rounded, sagging maw with a slimy inner lip and strands of
// drool; a few half-dissolved trophies (a helmet, a sword) float inside. Maggot: hooked mandibles, a glistening slime coat,
// pale veins. Scorpion: serrated plate edges, spines along the arching tail and a glowing venom bulb.
(function(){
  // run a kit through a filter that drops some of its parts (f returns true to drop)
  function kDrop(k,f){const P={p(...a){if(!f(a))k.p(...a);return P},L(...a){k.L(...a);return P}};return new Proxy(P,{get(t,n){return n in t?t[n]:k[n]}})}
  if(LPR.Goo){const k0=LPR.Goo.kit;LPR.Goo.kit=function(k,c,C,red){
    k0.call(this,kDrop(k,a=>a[0]=='jaw'&&a[1]=='box'),c,C,red);
    const main=bzC(C).lerp(bzC(0x40502a),.22),lite=main.clone().lerp(bzC(0xf4ffb8),.5).getHex(),dk=dkShade(main.getHex(),.45);
    // the maw: a dark sagging pit, an inner lip on the jaw bone, drool strands
    k.p('head','sph','c',0x0a1404,0,.485,.39,.13,.05,.05).p('jaw','sph','c',0x0a1404,0,.45,.39,.12,.05,.05,0,0,.05);
    k.p('jaw','sph','c',dk,0,.42,.405,.13,.025,.04,0,0,.05);k.p('jaw','sph','c',0x6a2a1a,0,.44,.39,.07,.015,.03);
    for(let i=0;i<4;i++){const x=-.08+i*.055;k.L('jaw','g',lite,[x,.43,.43],[x+.005,.33-i%2*.05,.44],.008,.012,3)}
    // trophies drifting inside: a rusted helmet and a broken blade
    k.p('spine','hem','m',0x5a4a3a,.14,.3,-.12,.08,.06,.08,.4,0,.3);k.L('spine','m',0x6a6a70,[-.2,.18,.06],[-.05,.34,.16],.016,.008,4);
  }}
  if(LPR.Maggot){const k0=LPR.Maggot.kit;LPR.Maggot.kit=function(k,c,C,red){k0.apply(this,arguments);
    const mz=.6,my=bzMagR(.6)*.82+.004;
    // hooked mandibles either side of the mouth, a slime coat and pale veins along the back
    [-1,1].forEach(s=>{k.L('head','c',0x2a1a10,[s*.07,my,mz-.01],[s*.1,my-.02,mz+.06],.016,.01,4).L('head','c',0x1a0e08,[s*.1,my-.02,mz+.06],[s*.05,my-.035,mz+.1],.01,.002,4)});
    for(let z=-1.3;z<.4;z+=.21){const r=bzMagR(z),bn=wyrmBones(z),b=bn[2]>.5?bn[1]:bn[0],y=r*.82+.004;
      const x=(z*7%2-1)*r*.4,on=x=>y+r*.74*Math.sqrt(Math.max(0,1-Math.pow(x/r,2)));   // (v176) on the skin, which dips between the rolls
      k.p(b,'sph','g',0xf4f0c0,x,on(x),z,.012,.008,.012);k.L(b,'c',0xe8d8c0,[-r*.3,on(r*.3),z],[r*.3,on(r*.3),z-.06],.004,.004,3)}
    // a drip of slime hanging off the mouth
    k.L('head','g',0xe8f0b0,[0,my-.06,mz+.02],[0,.01,mz+.04],.01,.004,3)}}
  if(LPR.Scorpion){const k0=LPR.Scorpion.kit;LPR.Scorpion.kit=function(k,c,C,red){k0.apply(this,arguments);
    const M=lpMain(C,.15).getHex(),dark=dkShade(M,.5),edge=lpMain(C,.15).lerp(bzC(0xead6a8),.35).getHex();
    // serrated plate edges on the back, a ridge of spines along the arched tail, a glowing venom bulb
    [.23,.03,-.17,-.36].forEach((z,i)=>[-1,1].forEach(s=>{const bn=z>.12?'chest':z>-.07?'spine':z>-.3?'pelvis':'tail0';for(let j=0;j<3;j++)k.p(bn,'cone4','c',edge,s*(.19-j*.04),.47+j*.02,z,.012,.04,.012,0,0,-s*(1.2-j*.3))}));
    [[.62,-.69],[.8,-.77],[.96,-.71],[1.07,-.6]].forEach((q,i)=>k.p(i<1?'tail2':'tail3','cone4','c',dark,0,q[0]+.065,q[1],.014,.05,.014,-.3+i*.5));
    k.p('tail3','sph','g',0xffb030,0,1.08,-.37,.05,.05,.05)}}
})();

// ---------------- Fungal Shambler: its own body (it was a purple Gloomcap) ----------------
// A hunched, rotting stump of a man overgrown with fungus: grooved bark hide, a hollow face with glowing eyes, long arms that
// hang to its knees and end in root claws, stumpy legs, a cluster of drooping caps on its head and shoulders, shelf fungi up
// its back and glowing spore pores.
(function(){const n='Shambler';SPEC[n]=Object.assign({},SPEC.Gloomcap);
  const K={bark:0x4a3a2a,bark2:0x2e2418,moss:0x3e4e22,cap:0x6a2a6a,cap2:0x8a4a8a,gill:0x2a1420,glow:0xc8ff6a,spore:0xe0ff9a,dark:0x080604};(window.VARK176=window.VARK176||{})[n]=K;   // v176: per-enemy palettes (3371)
  LPR[n]={head:['head',0,.94,0],up:.08,back:[['chest',0,.7,-.18],['spine',0,.5,-.2],['pelvis',0,.3,-.18]],
    geo(C,c){const b=new THREE.Color(K.bark),b2=new THREE.Color(K.bark2),mo=new THREE.Color(K.moss),ca=new THREE.Color(K.cap);
      const paint=(o,r,s,cc,i)=>{o.copy((Math.round((cc+1)*6)+(i%2))%2?b:b2);if(r.k=='leg'&&r.p[1]<.03)o.copy(b2);if(s<-.5&&r.p[1]>.3&&r.p[1]<.6)o.lerp(mo,.5);if(r.p[1]>.78&&s<-.2)o.lerp(ca,.3)};
      const R=(x,y,z,rx,f,bk,bn,j)=>({p:[x,y,z],rx,ryT:f,ryB:bk,b:bn,j});
      const body={rings:[R(0,.08,0,.14,.13,.14,['pelvis','pelvis',0]),R(0,.2,0,.2,.19,.2,['pelvis','pelvis',0],.08),R(0,.32,-.01,.23,.22,.22,['pelvis','spine',.5],.1),R(0,.45,-.02,.24,.23,.24,['spine','spine',0],.1),
        R(0,.56,-.01,.23,.21,.24,['chest','chest',0],.1),R(0,.66,.01,.2,.17,.22,['chest','neck',.5],.08),R(0,.74,.03,.16,.13,.17,['neck','head',.4],.06),R(0,.81,.04,.14,.12,.14,['head','head',0],.05),
        R(0,.87,.03,.11,.09,.11,['head','head',0]),R(0,.91,.02,.05,.04,.05,['head','head',0])],seg:12,ref:[0,0,1],capA:1,capB:1,paint};
      const L=[body];[-1,1].forEach(s=>{const f=s<0?'fl':'fr',h=s<0?'hl':'hr';
        L.push(e137Limb([[[s*.2,.63,.01],.075,['chest',f+'0',.5]],[[s*.27,.53,.04],.062,[f+'0',f+'0',0]],[[s*.3,.43,.07],.056,[f+'0',f+'1',.5]],[[s*.31,.33,.09],.05,[f+'1',f+'1',0]],[[s*.32,.24,.11],.052,[f+'1',f+'2',.5]],[[s*.32,.16,.12],.05,[f+'2',f+'2',0]],[[s*.32,.11,.13],.025,[f+'2',f+'2',0]]],paint,7));
        L.push(e137Limb([[[s*.1,.22,0],.085,['pelvis',h+'0',.6]],[[s*.1,.12,.01],.075,[h+'0',h+'1',.5]],[[s*.1,.045,0],.07,[h+'1',h+'2',.5]],[[s*.1,.015,.04],.065,[h+'2',h+'2',0]],[[s*.1,.008,.1],.03,[h+'2',h+'2',0]]],paint,7))});
      return lpGeo('E137|'+n,n,L,99)},
    kit(k,c,C,red){
      // the hollow face
      k.p('head','sph','c',K.dark,0,.8,.14,.08,.07,.04);[-1,1].forEach(s=>k.p('head','sph','g',red?0xff2a2a:K.glow,s*.035,.82,.165,.016,.012,.01));
      k.p('jaw','box','c',K.dark,0,.745,.15,.05,.012,.02);for(let i=-1;i<=1;i++)k.p('jaw','cone4','c',0x6a5a3a,i*.018,.752,.16,.006,.018,.006,Math.PI);
      // drooping caps: a big one on the head, smaller ones on the shoulders
      [[0.03,.87,-.01,.2,.1,-.12,.12,'head'],[-.2,.72,-.02,.11,.06,-.2,-.5,'chest'],[.18,.74,-.05,.085,.05,.3,.6,'chest'],[-.08,.98,-.06,.08,.05,.4,-.3,'head']].forEach(q=>{
        k.p(q[7],'hem','c',K.cap,q[0],q[1],q[2],q[3],q[4],q[3],q[5],0,q[6]);k.p(q[7],'cyl','c',K.gill,q[0],q[1]-.005,q[2],q[3]*.92,.01,q[3]*.92,q[5],0,q[6]);
        // (v176) spots sit on the tilted cap's surface (they hovered over it)
        const on=(r,a)=>{const v=new THREE.Vector3(Math.sin(a)*r*q[3],Math.sqrt(1-r*r)*q[4]*.97,Math.cos(a)*r*q[3]).applyEuler(new THREE.Euler(q[5],0,q[6]));return [q[0]+v.x,q[1]+v.y,q[2]+v.z]};
        for(let i=0;i<4;i++){const p=on(.5,i*1.7);k.p(q[7],'sph','c',K.cap2,p[0],p[1],p[2],.014,.008,.014)}
        if(q[7]=='head'&&q[3]>.15)for(let i=0;i<5;i++){const p=on(.62,i*1.3);k.p('head','sph','g',K.spore,p[0],p[1],p[2],.012,.006,.012)}});
      // shelf fungi up the back, moss hanging from the arms, root claws
      for(let i=0;i<6;i++){const y=.3+i*.08,s=i%2?1:-1;k.p(y>.5?'chest':y>.38?'spine':'pelvis','hem','c',i%2?0x8a6a4a:0x6a4a3a,s*.08,y,-.21-(y>.5?0:.01),.09,.03,.06,-.3,0,s*.2)}
      [-1,1].forEach(s=>{const f=s<0?'fl':'fr';for(let i=0;i<3;i++)k.L(f+'1','c',K.moss,[s*.33,.42-i*.06,.06],[s*.35,.34-i*.06,.05],.016,.004,3);
        for(let i=0;i<4;i++)k.L(f+'2','c',K.bark2,[s*.32+(i-1.5)*.018,.12,.14],[s*.32+(i-1.5)*.03,.02,.17+i%2*.02],.014,.003,4)});
      }};
  if(EN.shambler)EN.shambler.rig=n;
})();
