// ================= v181: brutes on cage bodies (batch 2) =================
// Orc Raider, Frost Troll, Troll Rimecaller, Storm Giant, Amalgam, Akorror — each keeps its look, rebuilt on the cage body.
function cgFaceTroll(o){o=o||{};return (x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
  d+=.05*(o.nose||1)*cgG(x,y,0,1.582,.016,.02)+.025*(o.nose||1)*cgG(x,y,0,1.608,.012,.014);                      // a long, drooping nose
  [-1,1].forEach(s=>{d-=.018*cgG(x,y,s*.04,1.63,.015,.01);d+=.006*cgG(x,y,s*.062,1.6,.016,.012)});d+=.022*cgG(x,y,0,1.65,.06,.009);  // small deep eyes under a heavy brow
  d-=.007*cgG(x,y,0,1.553,.04,.004);d+=.014*(o.jaw||1)*cgG(x,y,0,1.535,.04,.016);return d*f}}
const BRUTEJAW=(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);return (i>=1&&i<=4&&sa>-.2&&side>.5)?.012:0};
function cgBruteBody(B,k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(o.face||cgFaceHuman({nose:1.2,nw:1.5,brow:1.8,chin:1.4,cheek:1.3})));
  cgEmit(B,M,m=>(o.paint&&o.paint(m))||cgFacePaint(S,m,K.sk,{sock:mdSh(K.sk,.35),mw:.032})||(m.s<-.4?mdSh(K.sk,.82):a181Nz(K.sk,m,.22,16)));
  cgEyes(k,M,S,K.eye,o.ex||.038,1.629,o.er||.9,-.002);if(o.tusks)cgTeeth(k,M,S,[[-.03,1.555,o.tusks,1],[.03,1.555,o.tusks,1]],0xe8e0c8);
  if(o.ears)cgEars(k,M,S,K.sk,1.625,o.ears,.3,.5,.024);
  [-1,1].forEach(s=>{cgFingers(k,S,s,K.hand||K.sk,K.fist&&K.fist(s)?'fist':'claw',o.fl||1,K.claw||mdSh(K.sk,.5),K.fist&&K.fist(s)?0:(o.tip||.02));if(!o.boots)cgToes(k,S,s,mdSh(K.sk,.85),o.toe||.015,K.claw)});return M}

// ---------------- Orc Raider ----------------
(function(){const S=cgHuman({h:1.0,w:1.16,d:1.12,rw:[1.05,1.1,1.05,1.12,1.2,1.22,1.28,1.35],at:1.38,lt:1.25,hs:.98,hw:1.08,nw:1.4,facePush:BRUTEJAW}),K={sk:0x56643e,eye:0xff3a1a,fist:s=>s>0},lt=0x3a2618,T=S.torso,J=S.J;
  cg181Reg('orc',S,function(B,P,k,C){const M=cgBruteBody(B,k,C,S,K,{tusks:.036,ears:.06,boots:1,paint:m=>m.part=='head'&&m.s>.4&&Math.abs(m.x)<.07*S.hs&&Math.abs(m.y-S.hp(0,1.6,0)[1])<.008*S.hs&&Math.round(m.x*60)%2?0x5a1a10:null}),wy=T[2][0],sh=T[6][0];
    // a black topknot crest, crossed straps, a fur kilt over a loincloth, spiked pauldrons, leather forearms, pelt boots, a bone necklace
    for(let i=0;i<7;i++){const q=S.hp(0,1.7+Math.sin(i/6*Math.PI)*.03,.06-i*.03),p=cgRay(M,[q[0],q[1]+.3,q[2]],[0,-1,0],{head:1});if(p)k.L('head','c',0x141010,p,[p[0],p[1]+.05-Math.abs(i-3)*.006,p[2]-.03],.022,.006,4)}
    [-1,1].forEach(s=>{const p0=cgSurf(M,S,sh-.02,s*.5,.01),p1=cgSurf(M,S,wy+.02,-s*.6,.02),p2=cgSurf(M,S,sh-.04,Math.PI-s*.5,.01),p3=cgSurf(M,S,wy+.02,Math.PI+s*.6,.02);
      cgTube(B,[p0,lerp3(p0,p1,.5),p1],[.015,.015,.015],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:6});cgTube(B,[p2,lerp3(p2,p3,.5),p3],[.015,.015,.015],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:6})});
    cgSkirt(B,S,wy-.02,J.lh1[1]+.08,.05,.02,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*5)%2?0x4a3a2a:0x2a1d14,m,.3,12),{n:5});cgFur(B,M,m=>m.part=='torso'&&m.y<wy+.02&&m.y>J.lh0[1]-.02,{off:.035,len:.1,col:0x5a4630,col2:0x3a2a1c,seed:81,jag:.55});
    cgBelt(B,M,wy,.022,.03,lt);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];k.p(A+'0','hem','m',0x5a4630,a[0]+s*.03,a[1]+.03,a[2],.11,.08,.11,0,0,s*.4);for(let i=0;i<2;i++)k.L(A+'0','m',0x8a8a90,[a[0]+s*(.05+i*.03),a[1]+.06,a[2]-.02+i*.04],[a[0]+s*(.09+i*.03),a[1]+.16,a[2]-.02+i*.04],.016,.002,5);
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.014,m=>Math.round(m.y*40)%2?0x4a3420:0x5a4430);
      cgShell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<J.rh1[1]-.06))&&Math.sign(m.x)==s,.024,m=>a181Nz(0x3a2a1c,m,.3,16));cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&Math.abs(m.y-(J.rh1[1]-.07))<.03,{off:.032,len:.06,col:0x6a5a48,col2:0x4a3a2a,seed:82+s,jag:.5})});
    cgShell(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.08,.01,m=>a181Nz(0x4a3a2a,m,.3,16));
    for(let i=0;i<9;i++){const p=cgSurf(M,S,sh-.03-Math.abs(i-4)*.012,(i-4)*.2,.008);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x2a2a2a,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
ST179.orc={sx:.2,hx:-.18,lk:.24,rk:.24,az:.1,lz:-.1,ex:-.2,le:-.25};

// ---------------- Frost Troll / Troll Rimecaller ----------------
['troll','trollsh'].forEach(key=>{const sh=key=='trollsh';const S=cgHuman({h:1.0,w:1.2,d:1.15,rw:[1.05,1.1,1.1,1.15,1.25,1.28,1.32,1.4],at:sh?1.35:1.55,lt:1.35,hs:1.04,hw:1.05,hd:1.08,armL:sh?1.12:1.25,legL:.95,nw:1.5,foot:1.2,footW:1.3,facePush:BRUTEJAW});
  const K={sk:sh?0x5c6e82:0x627888,eye:0x6ad8ff,fist:s=>sh&&s>0,claw:0x2a2a30},hair=0xc8d8e0,frost=0xc8f0ff,T=S.torso,J=S.J;
  cg181Reg(key,S,function(B,P,k,C){const M=cgBruteBody(B,k,C,S,K,{face:cgFaceTroll({nose:1.1}),tusks:.04,ears:.08,fl:1.15,tip:.03,toe:.02}),wy=T[2][0],shy=T[6][0];
    // warts, a white mane down the back of the head and the spine, frost crust and icicles on the shoulders
    for(let i=0;i<16;i++){const y=wy+a181H(i,2)*(shy-wy),a=(a181H(i,7)-.5)*6.2;if(sh&&y<shy-.05)continue;const p=cgSurf(M,S,y,a,0);k.p(y>J.chest[1]-.04?'chest':'spine','sph','c',mdSh(K.sk,.8),p[0],p[1],p[2],.014,.012,.012)}
    cgFur(B,M,m=>m.part=='head'&&(m.s<-.3||m.y>S.hp(0,1.69,0)[1])&&Math.abs(m.x)<.06*S.hs*(m.s<-.5?2:1),{off:.024,len:.16,col:hair,col2:0xa8b8c4,seed:91,jag:.5,lump:[.5,1.2]});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];for(let i=0;i<4;i++)k.p(A+'0','dod','c',i%2?frost:0xe8f8ff,a[0]+s*(.03+i*.02),a[1]+.07-i*.012,a[2]+(i-1.5)*.04,.035,.022,.035,i,0,0);
      for(let i=0;i<3;i++)k.p(A+'0','cone4','g',frost,a[0]+s*(.06+i*.02),a[1]+.01,a[2]+(i-1)*.04,.01,.07,.01,Math.PI)});
    if(!sh){cgSkirt(B,S,wy-.02,J.lh1[1]+.1,.05,.02,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*4)%2?0x6a6e72:0x4a4e54,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*4)%2==0||m.y>J.lh0[1]-.04});cgBelt(B,M,wy,.02,.024,0x2a2a2e);
      for(let i=0;i<9;i++){const p=cgSurf(M,S,shy-.03-Math.abs(i-4)*.012,(i-4)*.2,.008);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x8a9aa8,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}}
    else{cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.04),.018,m=>a181Nz(0x26344e,m,.3,14));cgSkirt(B,S,wy-.02,J.lh2[1]+.15,.12,.026,m=>m.y<J.lh2[1]+.2?0x9ad8ff:a181Nz(0x1e2a40,m,.3,12),{n:6});
      const g=cgSurf(M,S,J.chest[1]+.03,0,.024);k.p('chest','oct','g',0x9ad8ff,g[0],g[1],g[2],.03,.045,.014);
      [-1,1].forEach(s=>{const q=S.hp(s*.08,1.7,-.02);let p=q;[[s*.07,.05,-.03],[s*.03,.07,-.04],[-s*.01,.05,-.03]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',0x8a8270,p,n,.026-j*.007,.019-j*.007,5);p=n})})}})});
ST179.troll={sx:.32,hx:-.3,lk:.27,rk:.27,az:.12,lz:-.12,ax:-.12,lx:-.15,ex:-.3,le:-.35};ST179.trollsh={sx:.24,hx:-.22,lk:.2,rk:.2,lz:-.08,le:-.25};

// ---------------- Storm Giant ----------------
(function(){const S=cgHuman({h:1.0,w:1.2,d:1.12,rw:[1.08,1.12,1.1,1.15,1.25,1.28,1.34,1.4],at:1.5,lt:1.4,hs:.96,nw:1.5,foot:1.1,footW:1.3,facePush:BRUTEJAW}),K={sk:0x6a7a92,eye:0x6ac8ff,fist:s=>s>0},glow=0x6ac8ff,bd=0xc8d8e8,T=S.torso,J=S.J;
  cg181Reg('giant',S,function(B,P,k,C){const M=cgBruteBody(B,k,C,S,K,{boots:1,face:cgFaceHuman({nose:1.3,nw:1.4,brow:1.6,chin:1.2,cheek:1.2})}),wy=T[2][0];
    cgFur(B,M,m=>m.part=='head'&&m.s>-.15&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-S.hp(0,1.557,0)[1])<.008*S.hs),{off:.016,len:.2,col:bd,col2:0xa8b8c8,seed:101,jag:.55});
    cgHair(B,M,S,{col:bd,line:1.69,neck:true,thick:.018,side:.15});cgShell(B,M,m=>m.part=='head'&&Math.abs(m.y-S.hp(0,1.676,0)[1])<.008*S.hs,.03,glow,{t:'g',rim:.5});
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]+.02)||(m.part=='arm'&&m.y>J.aR0[1]-.1),{off:.045,len:.16,col:0x6a5e4e,col2:0x4a4030,seed:102,jag:.55});
    [[J.chest[1],-.05],[J.chest[1]-.04,0],[J.chest[1],.05]].forEach(([y,x],i)=>{const p=cgSurf(M,S,y,x*6,0);k.p('chest','box','g',glow,p[0],p[1],p[2],.012,.1,.004,0,x*6,(i-1)*.5)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>J[A+'2'][1]+.02,.022,m=>Math.round(m.y*30)%2?0x5a6070:0x4a5060,{t:'m'});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'1'][1]+J[A+'2'][1])/2)<.012,.028,glow,{t:'g'});
      cgShell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<J.rh1[1]-.05))&&Math.sign(m.x)==s,.026,m=>a181Nz(0x3a3026,m,.3,16));cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&Math.abs(m.y-(J.rh1[1]-.06))<.03,{off:.034,len:.07,col:0x6a5e4e,col2:0x4a4030,seed:103+s,jag:.5})});
    cgSkirt(B,S,wy-.02,J.lh1[1]+.06,.06,.022,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*6)%2?0x6a5e4e:0x4a4030,m,.3,12),{n:5});cgBelt(B,M,wy,.024,.03,0x3a2a1a)})})();
ST179.giant={sx:.12,hx:-.1,lk:.14,rk:.14,lz:-.1,le:-.2};

// ---------------- Amalgam: a lumpy heap of goo in a man's shape ----------------
(function(){const S=cgHuman({h:.94,w:1.4,d:1.5,rw:[1.25,1.35,1.6,1.65,1.5,1.45,1.5,1.7],rf:[1.3,1.6,2.2,2.0,1.5,1.25,1.15,1.3],at:1.85,lt:1.65,hs:1.12,hw:1.2,hy:.82,hd:1.1,nw:1.9,neckL:-.03,legL:.9,foot:1.2,footW:1.4,facePush:BRUTEJAW});
  const g1=0x425c2c,g2=0x2a3a1c,g3=0x5a7a3a,dirt=0x3a2e1e,glow=0xb4ff3a,T=S.torso,J=S.J;
  cg181Reg('amalgam',S,function(B,P,k,C){const M=C.M;
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1},(x,y,z,n)=>.045*(n3Sn(x*1.1,y*1.1,z*1.1,7,5)-.45));   // lumps and sags all over
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.1?0:(-.02*cgG(x,y,0,1.56,.05,.012)+.01*cgG(x,y,0,1.6,.06,.03))));
    cgEmit(B,M,m=>{const nn=n3Sn(m.x,m.y,m.z,7,1);if(m.part=='head'&&m.s>.5&&Math.abs(m.y-S.hp(0,1.56,0)[1])<.01*S.hs&&Math.abs(m.x)<.06*S.hs)return 0x0a1404;return mdMix(mdMix(g1,g3,Math.max(0,.5-nn)*1.4),nn>.6?dirt:g2,Math.max(0,nn-.55)*1.6+(m.s<-.35?.25:0))});
    // three small mismatched eyes sunk in the goo, a sagging maw of crooked teeth, blobs and drips
    [[-.04,1.625,1],[.045,1.64,.8],[0,1.67,.6]].forEach(([x,y,r])=>{const q=S.hp(x,y,0),p=cgRay(M,[q[0],q[1],q[2]+.6],[0,0,-1],{head:1});if(p)k.p('head','sph','g',glow,p[0],p[1],p[2]-.004,.014*r*S.hs,.011*r*S.hs,.008)});
    for(let i=0;i<9;i++){const q=S.hp(-.05+i*.0125,1.566,0),p=cgRay(M,[q[0],q[1],q[2]+.6],[0,0,-1],{head:1});if(p)k.p('head','cone4','c',0xc8c0a0,p[0],p[1],p[2]-.004,.005,.02+((i*5)%3)*.008,.005,Math.PI,0,(i-4)*.06)}
    [[J.chest[1]+.05,Math.PI,.12],[J.spine[1],0,.1],[J.chest[1]-.05,2.4,.08],[J.spine[1]+.05,-2.2,.09]].forEach(([y,a,r])=>{const p=cgSurf(M,S,y,a,-r*.5);k.p(y>J.chest[1]-.04?'chest':'spine','sph2','c',mdMix(g1,g2,.4),p[0],p[1],p[2],r,r*.85,r*.8)});
    for(let i=0;i<3;i++){const q=S.hp(-.03+i*.03,1.545,0),p=cgRay(M,[q[0],q[1],q[2]+.6],[0,0,-1],{head:1});if(p)k.L('head','c',g2,sub3(p,[0,0,.006]),[p[0],p[1]-.03-(i%2)*.02,p[2]-.004],.016,.006,4)}
    [-1,1].forEach(s=>cgFingers(k,S,s,g2,'claw',.9,dirt,.015))})})();
ST179.amalgam={sx:.22,hx:-.2,lk:.24,rk:.24,az:.14,lz:-.14,ex:-.3,le:-.3};

// ---------------- Akorror: a chitin-armoured horror, horned crest, fangs, a spiked tail ----------------
(function(){const S=cgHuman({h:1.0,w:1.18,d:1.12,rw:[1.05,1.12,1.05,1.12,1.22,1.25,1.3,1.4],at:1.45,lt:1.35,hs:1.0,hw:1.05,hd:1.12,nw:1.5,armL:1.08,facePush:BRUTEJAW});
  const c1=0x1e1824,c2=0x2e2636,c3=0x120e15,edge=0x4a3a52,fang=0xd8ccb0,T=S.torso,J=S.J;
  cg181Reg('akorror',S,function(B,P,k,C){const M=C.M,wy=T[2][0];
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.022*cgG(x,y,0,1.645,.06,.01)-.012*cgG(x,y,0,1.556,.04,.005);[-1,1].forEach(s=>d-=.016*cgG(x,y,s*.04,1.628,.016,.01));return d}));
    cgEmit(B,M,m=>m.part=='hand'?c3:a181Nz(m.s<-.3?c3:c1,m,.2,16));
    cgEyes(k,M,S,0xff3a1a,.04,1.628,.9,-.002);
    // plate shells: chest and back, belly bands, limb plates — each with a lighter rim
    cgShell(B,M,m=>m.part=='torso'&&m.y>wy+.02,.024,m=>Math.abs(m.x)<.02?edge:Math.round(m.y*16)%2?c2:c1,{rim:.3});cgShell(B,M,m=>m.part=='torso'&&m.y<=wy+.02&&m.y>J.lh0[1]-.03,.02,m=>Math.round(m.y*30)%2?c2:edge,{rim:.3});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a=J[A+'0'];cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y>J[A+'1'][1]+.03,.022,m=>Math.round(m.y*30)%2?c2:c1,{rim:.3});cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1],.02,c2,{rim:.3});
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>J[L+'1'][1]+.04,.022,m=>Math.round(m.y*24)%2?c2:c1,{rim:.3});cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.04&&m.y>J[L+'2'][1]+.02,.02,c2,{rim:.3});
      k.p(A+'0','hem','c',c2,a[0]+s*.05,a[1]+.06,a[2],.15,.09,.15,0,0,s*.45);k.p(A+'0','hem','c',edge,a[0]+s*.06,a[1]+.04,a[2],.135,.06,.135,0,0,s*.75);
      for(let i=0;i<3;i++)k.p(A+'0','cone4','c',c3,a[0]+s*(.07+i*.03),a[1]+.14-i*.02,a[2]-.04+i*.04,.024,.14-i*.02,.024,-.3,0,-s*(.4+i*.2));
      cgFingers(k,S,s,c3,'claw',1.1,0x0a080c,.04);cgToes(k,S,s,c3,.025,0x0a080c)});
    // a crest of horns sweeping back, curved fangs, a ridge of spikes down the spine, a heavy plated tail
    [-1,0,1].forEach(s=>{let a=S.hp(s*.05,1.7,-.02),d=[s*.25,.5,-.8];for(let j=0;j<4;j++){const b=add3(a,mul3(d,.07*S.hs));k.L('head','c',j<2?c2:edge,a,b,(.03-j*.006)*S.hs,(.024-j*.006)*S.hs,5);a=b;d=[d[0]*1.1,d[1]-.25,d[2]-.1]}});
    cgTeeth(k,M,S,[[-.03,1.556,.07],[.03,1.556,.07],[-.07,1.565,.045],[.07,1.565,.045]],fang);
    for(let i=0;i<7;i++){const y=T[6][0]-i*.08,p=cgSurf(M,S,y,Math.PI,-.006);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','cone4','c',i%2?c2:edge,p[0],p[1],p[2],.03,.16-Math.abs(i-2)*.015,.028,-1.05)}
    {const t0=cgSurf(M,S,J.lh0[1]+.02,Math.PI,-.03),T2=[t0,add3(t0,[0,-.1,-.2]),add3(t0,[0,-.22,-.4]),add3(t0,[0,-.32,-.6]),add3(t0,[0,-.36,-.78]),add3(t0,[0,-.35,-.92])];
      cgTube(B,T2,[.1,.085,.07,.054,.036,.012],[[['pelvis',1]],[['pelvis',1]],[['pelvis',1]],[['pelvis',1]],[['pelvis',1]],[['pelvis',1]]],m=>Math.round(m.i*2)%2?c1:c2,{seg:10,capB:true});
      for(let i=1;i<5;i++)k.p('pelvis','cone4','c',edge,T2[i][0],T2[i][1]+.09-i*.014,T2[i][2],.022,.1-i*.012,.022,-.6)}})})();
