// ================= v181: the undead on the new bodies (batch 3) =================
// Skeleton Warrior, Bone Archer and the Ossuary Colossus are bones (cgBones: a skull, a vertebral column, real ribs, collarbones,
// shoulder blades, a pelvis, limb bones with knobbed joints that overlap so nothing parts, finger and toe bones) on the same
// re-proportioned skeleton as the cage foes. Desert Revenant, Tomb Priest, Grave Ghoul, Drowned Thrall and Drowned Wretch are
// cage bodies.
function cgBoneTube(B,a,b,r0,r1,w0,w1,col,n){const R=[];n=n||4;for(let i=0;i<=n;i++){const t=i/n,bulge=1+.35*Math.pow(Math.abs(t-.5)*2,4);R.push({p:lerp3(a,b,t),rx:(r0+(r1-r0)*t)*bulge,f:(r0+(r1-r0)*t)*bulge,b:(r0+(r1-r0)*t)*bulge,w:t<.5?w0:w1})}
  mdLoft(B,R,{seg:8,capA:true,capB:true,col})}
function cgBones(B,k,S,o){const J=S.J,bone=o.bone,bd=o.bone2||mdSh(o.bone,.72),th=o.th||1,T=S.torso,col=m=>a181Nz(bone,m,.2,24);
  // the skull: a loft of the head rings, a separate jaw; sockets, a nose hole, teeth
  const H=S.head,skull=H.slice(3).map(q=>({p:[0,q[0],q[4]],rx:q[1]*.95,f:q[2]*.92,b:q[3]*.95,w:[['head',1]]}));mdLoft(B,skull,{seg:16,capA:true,capB:true,col});
  const jaw=H.slice(0,4).map((q,i)=>({p:[0,q[0]+.004,q[4]+.004],rx:q[1]*.86,f:q[2]*.9,b:q[3]*.55,w:[['head',1]]}));mdLoft(B,jaw,{seg:14,capA:true,capB:true,col:bd});
  const fz=y=>{const q=cgAt(H,y);return (q[4]||0)+q[2]*.92};const ey=S.hp(0,1.629,0)[1],nyy=S.hp(0,1.597,0)[1],my=S.hp(0,1.562,0)[1];
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.034*S.hs,ey,fz(ey)-.014*S.hs,.019*S.hs,.014*S.hs,.016*S.hs,0,0,s*-.25);if(o.eye)k.p('head','sph','g',o.eye,s*.036*S.hs,ey,fz(ey)-.006*S.hs,.009*S.hs,.009*S.hs,.006)});
  k.p('head','cone4','c',0x080606,0,nyy,fz(nyy)-.006,.012*S.hs,.026*S.hs,.008,Math.PI);for(let i=-3;i<=3;i++)k.p('head','box','c',0xe0d8c0,i*.011*S.hs,my,fz(my)-.004,.008*S.hs,.014*S.hs,.008);
  // the column, the ribcage, the sternum, collarbones, shoulder blades
  const sp=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)-q[3]*.55]},TW=y=>cgTorsoW(S,y),Y0=J.pelvis[1]-.04,Y1=J.neck[1]+.02;
  const cs=[];for(let i=0;i<=10;i++){const y=Y0+(Y1-Y0)*i/10;cs.push({p:sp(y),rx:.024*th,f:.022*th,b:.022*th,w:TW(y)})}mdLoft(B,cs,{seg:8,capA:true,capB:true,col:bd});
  for(let i=0;i<11;i++){const y=Y0+(Y1-Y0)*i/10,p=sp(y);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','sph','c',bone,p[0],p[1],p[2]-.016*th,.022*th,.016*th,.02*th)}
  const r0=J.spine[1]+.04,r1=T[6][0]-.03;for(let i=0;i<6;i++){const y=r1-(r1-r0)*i/5,q=cgAt(T,y);[-1,1].forEach(s=>{const pts=[];for(let j=0;j<=6;j++){const a=Math.PI-(Math.PI-.3)*j/6;pts.push([s*Math.sin(a)*q[1]*.92,y-.02*Math.sin(j/6*Math.PI)-j*.006,(q[4]||0)+Math.cos(a)*(Math.cos(a)>0?q[2]:q[3])*.9])}
    pts[0]=sp(y);mdLoft(B,pts.map(p=>({p,rx:.011*th,f:.008*th,b:.008*th,w:TW(y)})),{seg:6,capB:true,col})})}
  const sf=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)+q[2]*.86]};cgBoneTube(B,sf(r1+.01),sf(r0+.03),.016*th,.012*th,TW(r1),TW(r0),col,3);
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];cgBoneTube(B,sf(r1+.015),[a[0]*.9,a[1]+.01,a[2]+.02],.012*th,.014*th,[['chest',1]],[['chest',1]],col,3);k.p('chest','hem','c',bd,s*.09*S.h,J.chest[1]+.03,sp(J.chest[1]+.03)[2]-.012,.07*th,.012,.09*th,-Math.PI/2,0,0)});
  // the pelvis: a bowl of two wings and a ring
  {const py=J.pelvis[1]-.02,q=cgAt(T,py);mdLoft(B,[{p:[0,py-.05,q[4]||0],rx:q[1]*.55,f:q[2]*.5,b:q[3]*.5,w:[['pelvis',1]]},{p:[0,py,q[4]||0],rx:q[1]*.8,f:q[2]*.6,b:q[3]*.75,w:[['pelvis',1]]},{p:[0,py+.06,q[4]||0],rx:q[1]*.95,f:q[2]*.35,b:q[3]*.8,w:[['pelvis',1]]}],{seg:12,col:bd,keep:m=>m.s<.6||m.i<1})}
  // limbs: knobbed bones that overlap at every joint; hands and feet of bone
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],l0=J[L+'0'],l1=J[L+'1'],l2=J[L+'2'];
    cgBoneTube(B,a0,a1,.022*th,.018*th,[[A+'0',1]],[[A+'0',1]],col);k.p(A+'0','sph','c',bone,a0[0],a0[1],a0[2],.032*th);k.p(A+'1','sph','c',bone,a1[0],a1[1],a1[2],.026*th);
    [-.012,.012].forEach(o2=>cgBoneTube(B,add3(a1,[0,0,o2*th]),add3(a2,[0,0,o2*.6*th]),.012*th,.01*th,[[A+'1',1]],[[A+'1',1]],col,3));k.p(A+'2','box','c',bone,a2[0],a2[1]-.035,a2[2]+.008,.016*th,.06,.04*th);
    cgFingers(k,S,s,bone,o.fist&&o.fist(s)?'fist':'claw',1,bd,0);
    cgBoneTube(B,add3(l0,[0,.02,0]),l1,.026*th,.02*th,[[L+'0',1]],[[L+'0',1]],col);k.p(L+'0','sph','c',bone,l0[0],l0[1]+.01,l0[2],.034*th);k.p(L+'1','sph','c',bone,l1[0],l1[1],l1[2]+.008,.03*th);
    cgBoneTube(B,l1,add3(l2,[0,.01,0]),.02*th,.016*th,[[L+'1',1]],[[L+'1',1]],col);k.p(L+'2','sph','c',bone,l2[0],l2[1],l2[2],.024*th);k.p(L+'2','box','c',bone,l2[0],.025,l2[2]+.05,.045*th,.03,.11);cgToes(k,S,s,bone,0)});
  if(o.soul){const c=sf(J.chest[1]);k.p('chest','ico','g',o.soul,0,J.chest[1],c[2]-.08,.045);k.p('chest','ico','g',0xffffff,0,J.chest[1],c[2]-.08,.022)}}
// bones are not a cage body: register with the cage skeleton's joints (plan) and build them in that space
function cgBonesReg(key,S,fn){const pn='cg181_'+key;cg181Plan(pn,S.J);a181Reg(key,function(B,P,k,L){B.kqPre='none';fn(B,P,k,S)},pn)}

// ---------------- Skeleton Warrior / Bone Archer ----------------
['skel','archer'].forEach(key=>{const S=cgHuman({h:1.0,w:.9,d:.85,at:.9,lt:.9,hs:1.0}),J=S.J,T=S.torso,ar=key=='archer';
  cgBonesReg(key,S,function(B,P,k){cgBones(B,k,S,{bone:0xb8ae94,eye:ar?0x7ad8ff:0x6aff9a,soul:ar?0x7ad8ff:0x6aff9a,fist:s=>ar?s<0:s>0});const wy=T[2][0];
    if(!ar){const H=S.head.slice(9),helm=H.map(q=>({p:[0,q[0],q[4]],rx:q[1]*.95+.016,f:q[2]*.92+.016,b:q[3]*.95+.016,w:[['head',1]]}));mdLoft(B,helm,{seg:16,capB:true,t:'m',col:m=>m.i<.6?0x3a3c42:0x4a4e56});
      k.p('head','box','m',0x3a3c42,0,S.hp(0,1.635,0)[1],S.hp(0,1.635,.105)[2],.016,.06,.012);const a=J.aL0;k.p('aL0','hem','m',0x4a4e56,a[0]-.03,a[1]+.03,a[2],.1,.07,.1,0,0,-.4)}
    else{const H=S.head.slice(6),hood=H.map(q=>({p:[0,q[0],q[4]-.01],rx:q[1]+.02,f:q[2]*.6+.02,b:q[3]+.024,w:[['head',1]]}));mdLoft(B,hood,{seg:16,capB:true,col:0x34342c,keep:m=>m.s<.35||m.y>S.hp(0,1.69,0)[1]});
      const qz=cgAt(T,J.chest[1])[4]-cgAt(T,J.chest[1])[3]*.6-.05;k.L('chest','c',0x2a2a24,[.08,J.spine[1],qz],[-.06,T[6][0]+.06,qz-.02],.04,.035,8)}
    // a loincloth rag on a cord
    const py=J.pelvis[1]-.02,q=cgAt(T,py);mdLoft(B,[{p:[0,py+.02,q[4]||0],rx:q[1]*.92,f:q[2]*.7,b:q[3]*.85,w:[['pelvis',1]]},{p:[0,py-.08,q[4]||0],rx:q[1]*1.0,f:q[2]*.8,b:q[3]*.95,w:[['pelvis',1]]},{p:[0,py-.22,q[4]||0],rx:q[1]*1.05,f:q[2]*.85,b:q[3]*1.0,w:[['pelvis',.5],['lh0',.25],['rh0',.25]]}],
      {seg:14,col:ar?0x34342c:0x3a3a34,keep:m=>Math.abs(m.c)<.45&&!(m.i>1.3&&a181H(Math.round(m.c*10),Math.round(m.s*3))<.4)})})});
ST179.skel={sx:.1,hx:.06,lk:.1,rk:.1};ST179.archer={sx:.1,hx:.06,lk:.1,rk:.1};

// ---------------- Ossuary Colossus: a huge skeleton, its bones doubled up, skulls fused into its shoulders, green fire ----------------
(function(){const S=cgHuman({h:1.0,w:1.25,d:1.15,at:1.5,lt:1.4,hs:1.1,armL:1.1}),J=S.J,T=S.torso,bone=0x968c74,bone2=0x6e6652,fire=0x5aff7a;
  cgBonesReg('colossus',S,function(B,P,k){cgBones(B,k,S,{bone,bone2,th:1.9,eye:0x7aff9a,soul:fire});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'];cgBoneTube(B,add3(a0,[s*.04,-.04,.03]),add3(a1,[s*.04,.03,.03]),.04,.034,[[A+'0',1]],[[A+'0',1]],bone2);cgBoneTube(B,add3(a1,[s*.03,-.03,.03]),add3(a2,[s*.03,.04,.03]),.036,.03,[[A+'1',1]],[[A+'1',1]],bone2);
      for(let i=0;i<3;i++){const p=add3(a0,[s*(.03+i*.04),.05-i*.03,-.02+i*.03]);k.p(A+'0','sph2','c',i%2?bone:bone2,p[0],p[1],p[2],.05,.055,.055);k.p(A+'0','sph','c',0x080606,p[0]+s*.012,p[1],p[2]+.045,.014,.012,.008)}
      k.p(L+'0','sph2','c',bone2,J[L+'0'][0],J[L+'0'][1]-.1,J[L+'0'][2]+.02,.05,.05,.05)});
    [-1,1].forEach(s=>{const H=S.head,q=cgAt(H,S.hp(0,1.629,0)[1]),z=(q[4]||0)+q[2]*.92-.01;for(let i=0;i<3;i++)k.L('head','g',fire,[s*.034*S.hs,S.hp(0,1.629,0)[1]+.005,z],[s*(.04+i*.012)*S.hs,S.hp(0,1.629,0)[1]+.06+i*.02,z-.03-i*.015],.012-i*.003,.002,4)})})})();   // green fire rising from the sockets

// ---------------- the wrapped dead: Desert Revenant and Tomb Priest ----------------
function cgWraps(B,M,S,w1,w2,sel,off){cgShell(B,M,sel,off||.008,m=>{const a=Math.atan2(m.x,m.z),b=Math.round((m.y+a*.025)*40);return a181H(b,3)<.12?mdSh(w2,.7):b%2?w1:w2},{rim:.3})}
(function(){const S=cgHuman({h:1.0,w:.96,d:.95,at:1.0,lt:1.0,hs:.96}),w1=0xb8a47c,w2=0x8a7a58,lap=0x2a3a6a,gd=0xc8a040,T=S.torso,J=S.J;
  cg181Reg('revenant',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.012})));cgEmit(B,M,0x5a4a32);
    cgWraps(B,M,S,w1,w2,m=>m.part!='head'||m.y<S.hp(0,1.6,0)[1]||m.s<.5);cgEyes(k,M,S,0xffc040,.036,1.629,.9,.004);
    // the nemes: a striped headcloth over the crown with lappets on the chest; a broad gold-and-lapis collar; a robe
    cgShell(B,M,m=>m.part=='head'&&(m.y>S.hp(0,1.645,0)[1]||m.s<-.1),.02,m=>Math.round(m.y*60)%2?gd:lap,{rim:.4});
    [-1,1].forEach(s=>{const p=S.hp(s*.085,1.6,-.01);k.p('head','box','c',lap,p[0],p[1]-.08,p[2]+.01,.05,.18,.012,0,0,s*.08)});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>T[6][0]-.06),.036,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.3});
    cgSkirt(B,S,T[2][0]-.02,.06,.1,.026,m=>a181Nz(0x6a5a3a,m,.3,12),{n:7,keep:m=>!(m.y<.2&&a181H(Math.round(Math.atan2(m.c,m.s)*9),4)<.5)});
    [-1,1].forEach(s=>cgFingers(k,S,s,w2,'claw',1,0x2a2014,.012))})})();
(function(){const S=cgHuman({h:1.0,w:.94,d:.94,at:.9,lt:.95,hs:.96}),w1=0xa8946a,w2=0x6e5e40,gd=0xc8a040,lap=0x2a4a8a,T=S.torso,J=S.J;
  cg181Reg('tombpriest',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.014})));cgEmit(B,M,0x2e2418);
    cgWraps(B,M,S,w1,w2,m=>m.part!='head'||m.s<.5||m.y<S.hp(0,1.6,0)[1]);cgEyes(k,M,S,0xffb030,.036,1.629,.9,.004);
    // a tall gilded headdress, a lapis-and-gold collar, a sash with a scarab, a short kilt of pleated linen
    const t=S.hp(0,1.72,-.02);cgTube(B,[S.hp(0,1.66,-.01),t,add3(t,[0,.1,-.03]),add3(t,[0,.17,-.06])],[.09*S.hs,.085*S.hs,.06*S.hs,.02*S.hs],[[['head',1]],[['head',1]],[['head',1]],[['head',1]]],m=>Math.round(m.y*40)%2?gd:lap,{seg:12,capB:true,t:'m'});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>T[6][0]-.06),.034,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.3});
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.05,.05,.024,m=>Math.round(Math.atan2(m.c,m.s)*12)%2?0xd8ccaa:0xb8ac8a,{n:5});cgBelt(B,M,T[2][0],.02,.03,gd,'m');
    const sc=cgSurf(M,S,T[2][0],0,.034);k.p('pelvis','sph','m',0x2a3a2a,sc[0],sc[1],sc[2],.025,.02,.012);
    [-1,1].forEach(s=>cgFingers(k,S,s,w2,s>0?'fist':'claw',1,0x2a2014,.01))})})();
ST179.revenant={sx:.12,hx:-.06,lk:.09,rk:.09,lz:-.05,le:-.25};

// ---------------- Grave Ghoul: gaunt and stooped, bare ribs, knuckled spine, a long jaw of teeth, burial rags ----------------
(function(){const S=cgHuman({h:.96,w:.9,d:.88,rw:[.92,.95,.82,.9,.95,.95,.98,.95],at:.82,lt:.86,hs:1.02,hy:1.08,armL:1.18,facePush:(i,j,a)=>(i<=3&&Math.sin(a)>.2)?.008:0}),sk=0x6e6a56,sk2=0x504c3c,T=S.torso,J=S.J;
  cg181Reg('ghoul',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.1)return 0;let d=-.01*cgG(x,y,0,1.597,.012,.01)+.016*cgG(x,y,0,1.65,.05,.008);[-1,1].forEach(s=>{d-=.02*cgG(x,y,s*.037,1.63,.016,.011);d-=.012*cgG(x,y,s*.05,1.57,.016,.016)});return d}));
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-S.hp(0,1.556,0)[1])<.006*S.hs&&Math.abs(m.x)<.04*S.hs)return 0x0a0806;if(m.part=='head'&&m.s>.4&&Math.abs(m.x)<.012&&Math.abs(m.y-S.hp(0,1.596,0)[1])<.008)return 0x0a0806;
      if(m.part=='torso'&&m.s>-.2&&m.y>J.spine[1]&&m.y<T[6][0]-.03&&Math.round(m.y*44)%2)return sk2;return m.s<-.4?sk2:a181Nz(sk,m,.2,18)});
    cgEyes(k,M,S,0x9aff6a,.037,1.63,.9,-.004);cgEars(k,M,S,sk,1.63,.08,.4,.6,.02);for(let i=0;i<9;i++){const x=(i-4)*.01;cgTeeth(k,M,S,[[x,1.556,.014+((i*3)%2)*.008,i%2]],0xc8c0a0)}
    for(let i=0;i<8;i++){const y=T[6][0]-i*.06,p=cgSurf(M,S,y,Math.PI,-.004);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','sph','c',0xb8b098,p[0],p[1],p[2],.022,.018,.02)}
    [[J.chest[1],.6],[J.spine[1],-1.2],[J.chest[1]+.06,2.1]].forEach(([y,a])=>{const p=cgSurf(M,S,y,a,-.006);k.p(y>J.chest[1]-.04?'chest':'spine','sph','c',0x8a9a5a,p[0],p[1],p[2],.022,.02,.018)});
    cgSkirt(B,S,T[2][0]-.03,J.rh1[1]+.06,.04,.016,m=>a181Nz(0x2e2e28,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*4)%2==0&&!(m.y<J.rh1[1]+.15&&a181H(Math.round(Math.atan2(m.c,m.s)*9),2)<.4)});cgBelt(B,M,T[2][0]-.02,.015,.018,0x2a2a24);
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk2,'claw',1.3,0x2a2420,.04);cgToes(k,S,s,sk2,.02)})})})();
ST179.ghoul={sx:.38,hx:-.34,lk:.34,rk:.34,ax:-.35,lx:-.35,ex:-.6,le:-.6};

// ---------------- the drowned: Drowned Thrall (bloated, barnacled, weed) and Drowned Wretch (gaunt, a shroud) ----------------
function cgBarnacles(k,M,S,n,seed,col){for(let i=0;i<n;i++){const y=S.torso[1][0]+a181H(i,seed)*(S.torso[6][0]-S.torso[1][0]),a=(a181H(i,seed+3)-.5)*6.2,p=cgSurf(M,S,y,a,-.004),bn=y>S.J.chest[1]-.04?'chest':y>S.J.spine[1]?'spine':'pelvis';
  for(let j=0;j<3;j++)k.p(bn,'cone','c',j%2?col:mdSh(col,.8),p[0]+(j-1)*.018,p[1]+(j%2)*.014,p[2],.012,.02,.012,Math.cos(a)*.6,0,-Math.sin(a)*.6)}}
(function(){const S=cgHuman({h:1.0,w:1.25,d:1.3,rw:[1.12,1.2,1.45,1.45,1.3,1.25,1.28,1.38],rf:[1.1,1.3,1.8,1.7,1.35,1.2,1.15,1.2],at:1.5,lt:1.4,hs:1.0,hw:1.08,nw:1.6,facePush:BRUTEJAW}),sk=0x4a625c,sk2=0x34463f,rot=0x2a3424,T=S.torso,J=S.J;
  cg181Reg('drowned',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.8,nw:1.4,brow:1.3,hollow:-.006,chin:.8})));cgSculpt(M,{torso:1,arm:1,leg:1},(x,y,z,n)=>.012*(n3Sn(x*1.3,y*1.3,z*1.3,8,3)-.5));
    cgEmit(B,M,m=>cgFacePaint(S,m,sk,{sock:0x101a18})||(n3Sn(m.x,m.y,m.z,10,2)>.72?rot:m.s<-.4?sk2:a181Nz(sk,m,.25,14)));cgEyes(k,M,S,0xa8fff0,.036,1.629,.9,-.002);
    cgShell(B,M,m=>(m.part=='torso'&&m.y>T[1][0]&&m.s<.3&&!(a181H(Math.round(m.x*30),Math.round(m.y*30))<.25))||(m.part=='arm'&&m.y>J.aR1[1]),.014,m=>a181Nz(0x2a3436,m,.35,14));
    cgShell(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.012,m=>a181Nz(0x2a3436,m,.3,14));cgBelt(B,M,T[2][0]-.02,.02,.03,0x3a3e44,'m');
    cgBarnacles(k,M,S,14,3,0xb8b0a0);
    for(let i=0;i<10;i++){const y=T[6][0]-a181H(i,5)*.15,a=(a181H(i,9)-.5)*5,p=cgSurf(M,S,y,a,-.004);k.L(y>J.chest[1]-.04?'chest':'spine','c',i%2?0x2a4a2a:0x4a6a2a,p,add3(p,[Math.sin(a)*.02,-.14-a181H(i,2)*.1,Math.cos(a)*.02]),.012,.003,4)}
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'2'][1]+.05))<.025,.022,0x3a3e44,{t:'m'});cgFingers(k,S,s,sk2,'claw',1.1,0x1a2420,.02);cgToes(k,S,s,sk2,.012)})})})();
(function(){const S=cgHuman({h:.98,w:.9,d:.88,rw:[.92,.95,.82,.9,.95,.95,.98,.95],at:.82,lt:.86,hs:1.0,armL:1.12}),sk=0x5a6a62,sk2=0x40504a,T=S.torso,J=S.J;
  cg181Reg('dgwretch',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.8,brow:1.3,hollow:.016})));
    cgEmit(B,M,m=>cgFacePaint(S,m,sk,{sock:0x0a1210})||(m.part=='torso'&&m.s>-.2&&m.y>J.spine[1]&&m.y<T[6][0]-.03&&Math.round(m.y*44)%2?sk2:m.s<-.4?sk2:a181Nz(sk,m,.2,16)));cgEyes(k,M,S,0xa8fff0,.036,1.629,.85,-.002);
    cgShell(B,M,m=>(m.part=='torso'&&m.y<T[2][0]+.06)||(m.part=='leg'&&m.y>J.rh1[1]-.05),.012,m=>a181Nz(0x4a4838,m,.35,14));cgSkirt(B,S,T[2][0],J.rh1[1]-.05,.06,.018,m=>a181Nz(0x3a3a2e,m,.3,12),{n:5,keep:m=>!(m.y<J.rh1[1]+.15&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<.45)});
    for(let i=0;i<6;i++){const y=T[6][0]-a181H(i,7)*.2,a=(a181H(i,11)-.5)*5,p=cgSurf(M,S,y,a,-.004);k.L(y>J.chest[1]-.04?'chest':'spine','c',0x2a4a2a,p,add3(p,[Math.sin(a)*.02,-.12,Math.cos(a)*.02]),.01,.003,4)}
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk2,'claw',1.15,0x1a2420,.03);cgToes(k,S,s,sk2,.014)})})})();
ST179.dgwretch={sx:.3,hx:-.26,lk:.27,rk:.27,ax:-.3,lx:-.3,ex:-.5,le:-.5};
