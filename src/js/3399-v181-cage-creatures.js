// ================= v181: the humanoid creatures on cage bodies (batch 4) =================
// Sand Elemental, Salt Golem, Rampart Gargoyle, Lichen, Akidon, Gharial Reaver, Frost Wendigo — each keeps its look.
function cgRocky(M,amp,f,seed,parts){cgSculpt(M,parts||{head:1,torso:1,arm:1,leg:1,neck:1,hand:1,foot:1},(x,y,z,n)=>amp*(n3Sn(x*f,y*f,z*f,9,seed)-.45))}
function cgSurfBn(S,y){const J=S.J;return y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis'}

// ---------------- Sand Elemental: packed sand and cracked rock, glowing seams, a rocky crown, a girdle of stones ----------------
(function(){const S=cgHuman({h:1.0,w:1.18,d:1.1,rw:[1.05,1.12,1.05,1.12,1.22,1.25,1.3,1.35],at:1.45,lt:1.3,hs:.98,nw:1.4,facePush:BRUTEJAW}),s1=0xb8925a,s2=0x96784a,rk=0x7a5e36,gl=0xffa030,T=S.torso,J=S.J;
  cg181Reg('selem',S,function(B,P,k,C){const M=C.M;cgRocky(M,.03,1.6,4);cgSculpt(M,{head:1},S.sculpt(cgFaceTroll({nose:.4,jaw:1.2})));
    cgEmit(B,M,m=>{const n=n3Sn(m.x,m.y,m.z,12,6);return n>.72?rk:n<.3?s2:a181Nz(s1,m,.25,14)});cgEyes(k,M,S,gl,.038,1.628,1.1,-.004);
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]-.02)||(m.part=='arm'&&m.y>J.aR0[1]-.12),{off:.04,len:.08,col:rk,col2:mdSh(rk,.8),seed:111,jag:.4,lump:[.5,1.5],freq:14});
    for(let i=0;i<8;i++){const y=T[2][0]+a181H(i,3)*(T[6][0]-T[2][0]-.05),a=(a181H(i,5)-.5)*5,p=cgSurf(M,S,y,a,-.003);k.p(cgSurfBn(S,y),'box','g',gl,p[0],p[1],p[2],.006,.07,.003,0,a,(i%2?.6:-.6))}
    for(let i=0;i<10;i++){const p=cgSurf(M,S,T[1][0]+.02,i/10*Math.PI*2,-.01);k.p('pelvis','dod','c',i%3?s2:rk,p[0],p[1],p[2],.045+(i%3)*.012)}
    for(let i=0;i<5;i++){const a=(i-2)*.45,q=S.hp(Math.sin(a)*.08,1.72,Math.cos(a)*.03-.01);k.p('head','cone4','c',i%2?rk:0xd8b878,q[0],q[1],q[2],.03,.12-Math.abs(i-2)*.025,.03,-.1,0,-a*.6)}
    [-1,1].forEach(s=>{cgFingers(k,S,s,s2,'claw',.9,rk,.015);cgToes(k,S,s,s2,0)})})})();

// ---------------- Salt Golem: a hulking body of grey-pink salt, crystal clusters through the back and shoulders, a glowing core ----------------
(function(){const S=cgHuman({h:1.0,w:1.35,d:1.25,rw:[1.15,1.2,1.25,1.3,1.4,1.45,1.55,1.7],at:1.75,lt:1.5,hs:.85,hw:1.1,nw:2,neckL:-.03,armL:1.12,legL:.9,foot:1.25,footW:1.5,facePush:BRUTEJAW}),sa=0x8e847c,sa2=0x6e655e,pink=0xa07c76,cry=0xd8ccc8,core=0xff9a6a,T=S.torso,J=S.J;
  cg181Reg('saltgolem',S,function(B,P,k,C){const M=C.M;cgRocky(M,.035,1.3,7);cgSculpt(M,{head:1},S.sculpt(cgFaceTroll({nose:.3,jaw:1.4})));
    cgEmit(B,M,m=>{const n=n3Sn(m.x,m.y,m.z,10,8);return n>.7?pink:n<.3?sa2:a181Nz(sa,m,.2,14)});cgEyes(k,M,S,core,.038,1.628,1.0,-.004);
    const cc=cgSurf(M,S,J.chest[1]+.02,0,-.02);k.p('chest','ico','g',core,cc[0],cc[1],cc[2],.06);k.p('chest','ico','g',0xffd0b0,cc[0],cc[1],cc[2]+.02,.03);
    const cl=(y,a,n,sz)=>{const p=cgSurf(M,S,y,a,-.012),bn=cgSurfBn(S,y);for(let j=0;j<n;j++){const tl=(a181H(j,y*20,a)-.5)*.9,tl2=(a181H(j,a*7)-.5)*.9;k.p(bn,'oct','c',j%2?cry:0xc8a6a2,p[0]+Math.sin(a)*.02,p[1]+.03,p[2]+Math.cos(a)*.02,sz*.4,sz*(1+j*.2),sz*.4,tl+Math.cos(a)*-.5,0,tl2+Math.sin(a)*.5)}};
    [[T[6][0]-.02,Math.PI*.85,4,.06],[T[6][0]-.02,-Math.PI*.85,4,.06],[J.chest[1],Math.PI,3,.07],[J.spine[1]+.05,Math.PI*.9,3,.05],[T[6][0],2.1,3,.05],[T[6][0],-2.1,3,.05]].forEach(q=>cl(...q));
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];for(let j=0;j<3;j++)k.p(A+'0','oct','c',j%2?cry:0xc8a6a2,a[0]+s*(.05+j*.03),a[1]+.1-j*.02,a[2]-.03+j*.03,.03,.1-j*.015,.03,-.2,0,-s*(.3+j*.2));cgFingers(k,S,s,sa2,'fist',.9,sa2,0)})})})();

// ---------------- Rampart Gargoyle: a crouched stone demon, horns, fangs, folded stone wings, a curling tail, moss ----------------
(function(){const S=cgHuman({h:.96,w:1.12,d:1.08,rw:[1.0,1.05,1.0,1.08,1.2,1.25,1.3,1.35],at:1.3,lt:1.25,hs:1.08,hw:1.08,hd:1.1,nw:1.5,armL:1.15,facePush:BRUTEJAW}),st=0x58565a,st2=0x3e3d42,dk=0x222126,moss=0x4a5a3a,T=S.torso,J=S.J;
  cg181Reg('gargoyle',S,function(B,P,k,C){const M=C.M;cgRocky(M,.012,2.4,9);cgSculpt(M,{head:1},S.sculpt(cgFaceTroll({nose:.6,jaw:1.3})));
    cgEmit(B,M,m=>{const n=n3Sn(m.x,m.y,m.z,12,3);if(m.ny>.5&&n>.55)return moss;return n<.3?st2:a181Nz(st,m,.25,16)});cgEyes(k,M,S,0xff5a2a,.038,1.628,1.0,-.004);cgEars(k,M,S,st2,1.64,.1,.5,.6,.022);
    cgTeeth(k,M,S,[[-.026,1.556,.03,1],[.026,1.556,.03,1],[-.012,1.556,.018],[.012,1.556,.018]],0xc8c0b0);
    [-1,1].forEach(s=>{const q=S.hp(s*.06,1.71,-.02);let p=q;[[s*.05,.05,-.03],[s*.03,.05,-.06],[0,.02,-.07]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',j<2?st2:dk,p,n,(.026-j*.007)*S.hs,(.019-j*.007)*S.hs,5);p=n})});
    // the wings: a bony arm and three finger bones from each shoulder blade, stone membranes between them
    [-1,1].forEach(s=>{const r=cgSurf(M,S,J.chest[1]+.06,Math.PI-s*.5,-.02),e=add3(r,[s*.2,.22,-.14]),tips=[add3(e,[s*.22,.18,-.06]),add3(e,[s*.3,-.04,-.08]),add3(e,[s*.22,-.3,-.06])],W=[['chest',1]];
      cgTube(B,[r,lerp3(r,e,.5),e],[.03,.026,.022],[W,W,W],st2,{seg:7,capA:true});tips.forEach(t=>cgTube(B,[e,t],[.016,.004],[W,W],st2,{seg:5,capB:true}));
      const mw=mdW(B,W),V=p=>({x:p[0],y:p[1],z:p[2],w:mw}),mem=[r,e,tips[0],tips[1],tips[2],add3(r,[s*.05,-.25,-.02])];for(let i=0;i<mem.length-2;i++){const a=V(i?mem[i]:r),b=V(mem[i+1]),c=V(mem[i+2]),col=mdC(i%2?st:st2);mdTri(B,'c',V(r),b,c,col);mdTri(B,'c',c,b,V(r),col)}});
    {const t0=cgSurf(M,S,J.pelvis[1]-.04,Math.PI,-.02),W=[['pelvis',1]],TT=[t0,add3(t0,[0,-.15,-.15]),add3(t0,[.06,-.3,-.25]),add3(t0,[.12,-.38,-.15]),add3(t0,[.1,-.4,-.02])];cgTube(B,TT,[.05,.04,.03,.02,.008],[W,W,W,W,W],st2,{seg:8,capB:true});k.p('pelvis','cone4','c',dk,TT[4][0],TT[4][1],TT[4][2]+.02,.025,.06,.012,Math.PI/2)}
    for(let i=0;i<6;i++){const y=T[6][0]-i*.07,p=cgSurf(M,S,y,Math.PI,-.006);k.p(cgSurfBn(S,y),'cone4','c',dk,p[0],p[1],p[2],.02,.08,.02,-1.0)}
    [-1,1].forEach(s=>{cgFingers(k,S,s,st2,'claw',1.15,0x1a1a1e,.04);cgToes(k,S,s,st2,.03,0x1a1a1e)})})})();

// ---------------- Lichen: a body of soil and moss, a hollow face with eyes deep inside, a crown of roots, mushroom shelves, vines ----------------
(function(){const S=cgHuman({h:1.0,w:1.1,d:1.05,at:1.2,lt:1.2,hs:1.02,hy:1.08}),soil=0x4a3a28,soil2=0x30261a,moss=0x3e5222,moss2=0x5a6e2a,lich=0x9aa86a,bark=0x3a2a1a,goo=0x9aff4a,cap=0x6a3a24,T=S.torso,J=S.J;
  cg181Reg('lichen',S,function(B,P,k,C){const M=C.M;cgRocky(M,.02,1.8,12);cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.2?0:-.03*cgG(x,y,0,1.62,.05,.05)));
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.5&&Math.abs(m.x)<.05*S.hs&&Math.abs(m.y-S.hp(0,1.62,0)[1])<.045*S.hs)return 0x0c0806;const n=n3Sn(m.x,m.y,m.z,10,5);if(n>.62)return n>.74?moss2:moss;return n<.3?soil2:a181Nz(soil,m,.2,14)});
    [-1,1].forEach(s=>{const q=S.hp(s*.03,1.635,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','sph','g',goo,p[0],p[1],p[2]+.003,.012,.01,.008)});
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]+.02&&m.s<.4)||(m.part=='head'&&m.y>S.hp(0,1.69,0)[1]),{off:.025,len:.1,col:moss,col2:moss2,seed:121,jag:.55});
    for(let i=0;i<7;i++){const an=-1.5+i*.5,q=S.hp(Math.sin(an)*.07,1.72,-.04-Math.cos(an)*.02);let a=q,d=[Math.sin(an)*.4,1,-.3];for(let j=0;j<3;j++){const b=add3(a,mul3(d,.05));k.L('head','c',bark,a,b,.014-j*.004,.01-j*.003,4);a=b;d=[d[0]*1.3,d[1]-.3,d[2]-.2]}}
    {const a=J.aL0;for(let i=0;i<3;i++)k.p('aL0','hem','c',i%2?cap:0x8a5a3a,a[0]-.05-i*.015,a[1]+.06-i*.045,a[2]-.04+i*.02,.07-i*.012,.025,.06,0,0,.25)}
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';[[J[A+'0'],J[A+'1'],J[A+'2'],A],[J[L+'0'],J[L+'1'],J[L+'2'],L]].forEach(([p0,p1,p2,bp])=>{const pts=[],W=[];for(let i=0;i<=14;i++){const t=i/14,c=t<.5?lerp3(p0,p1,t*2):lerp3(p1,p2,(t-.5)*2),an=t*3*Math.PI*2,r=bp[0]=='a'?.05:.07;pts.push([c[0]+Math.cos(an)*r*s,c[1],c[2]+Math.sin(an)*r]);W.push(t<.5?[[bp+'0',1]]:[[bp+'1',1]])}
      cgTube(B,pts,pts.map(()=>.011),W,bark,{seg:5})});cgFingers(k,S,s,soil2,'claw',1.1,bark,.03);cgToes(k,S,s,soil2,.02)})})})();

// ---------------- Akidon: a slender insectoid in chitin plates, antennae with acid-lit tips, mandibles ----------------
(function(){const S=cgHuman({h:.98,w:.94,d:.92,at:.88,lt:.9,hs:1.0,hd:1.12,armL:1.1}),c1=0x28202e,c2=0x382e44,c3=0x1a141f,acid=0x8aff3a,T=S.torso,J=S.J;
  cg181Reg('akidon',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.018*cgG(x,y,0,1.645,.06,.01);[-1,1].forEach(s=>d+=.012*cgG(x,y,s*.042,1.628,.016,.012));return d}));
    cgEmit(B,M,m=>m.part=='hand'?c3:a181Nz(m.s<-.3?c3:c1,m,.2,16));[-1,1].forEach(s=>{const q=S.hp(s*.045,1.628,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','sph2','g',0x9aff6a,p[0],p[1],p[2]-.004,.02*S.hs,.017*S.hs,.012)});
    cgShell(B,M,m=>m.part=='torso'&&m.y>T[2][0],.016,m=>Math.round(m.y*24)%2?c2:c1,{rim:.3});cgShell(B,M,m=>m.part=='torso'&&m.y<=T[2][0]&&m.y>J.lh0[1]-.03,.014,m=>Math.round(m.y*30)%2?c2:c3,{rim:.3});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1],.016,c2,{rim:.3});cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.04&&m.y>J[L+'2'][1]+.02,.016,c2,{rim:.3});
      const q=S.hp(s*.03,1.7,.02);let a=q,d=[s*.25,.6,.75];for(let i=0;i<5;i++){const b=add3(a,mul3(d,.05*S.hs));k.L('head','c',c2,a,b,.008,.006,3);a=b;d=[d[0]+s*.06,d[1]-.18,d[2]+.05]}k.p('head','sph','g',acid,a[0],a[1],a[2],.008);
      const m0=S.hp(s*.03,1.556,0),mp=cgRay(M,[m0[0],m0[1],m0[2]+.5],[0,0,-1],{head:1});if(mp)k.L('head','c',c3,mp,add3(mp,[-s*.02,-.03,.03]),.008,.002,4);
      cgFingers(k,S,s,c3,'claw',1.2,0x0a080c,.03);cgToes(k,S,s,c3,.02,0x0a080c)})})})();

// ---------------- Gharial Reaver: a crocodile-man — a long narrow snout full of teeth, scutes down the back, a heavy tail ----------------
const GHARIALHEAD=[[1.52,.064,.08,.06,.02],[1.536,.066,.12,.064,.03],[1.55,.066,.17,.068,.04],[1.562,.064,.22,.072,.05],[1.572,.062,.24,.074,.052],[1.582,.064,.22,.078,.05],
  [1.596,.07,.16,.084,.04],[1.61,.076,.12,.088,.03],[1.625,.078,.1,.09,.02],[1.64,.074,.085,.09,.012],[1.654,.062,.065,.078,.006],[1.664,.034,.034,.046,0]];
(function(){const S=cgHuman({h:1.0,w:1.14,d:1.1,at:1.25,lt:1.25,hs:1.02,head:GHARIALHEAD,facePush:()=>0}),sk=0x3a4a2a,sk2=0x2a3620,bel=0x8a8a5a,sc=0x24301c,T=S.torso,J=S.J;
  cg181Reg('gharial',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{let d=0;if(n[1]>-.7&&z>-.03)d-=.009*Math.exp(-Math.pow((y-1.567)/.004,2));[-1,1].forEach(s=>{d+=.014*cgG(x,y,s*.05,1.632,.016,.008);d-=.005*cgG(x,y,s*.012,1.58,.005,.004)});return d}));
    const my=S.hp(0,1.567,0)[1];cgEmit(B,M,m=>{if(m.part=='head'){if(Math.abs(m.y-my)<.004*S.hs&&m.nz>-.3)return 0x140806;if(m.ny<-.3)return bel;return a181Nz(sk,m,.3,26)}if(m.part=='torso'&&m.s>.5&&m.y<J.chest[1])return Math.round(m.y*30)%2?bel:mdSh(bel,.85);return m.s<-.4?sk2:a181Nz(sk,m,.3,16)});
    [-1,1].forEach(s=>{const q=S.hp(s*.05,1.625,.04),d=nrm3([s*.6,.25,.75]),p=cgRay(M,add3(q,mul3(d,.5)),mul3(d,-1),{head:1});if(p){k.p('head','sph','g',0xe8c020,p[0],p[1],p[2]-.003,.012,.01,.01);k.p('head','box','c',0x050403,p[0]+d[0]*.008,p[1],p[2]+d[2]*.008,.002,.014,.002)}});
    // teeth all along the jaws (upper ones down, lower ones up), interlocking
    for(let i=0;i<9;i++){const zz=.02+i*.024;[-1,1].forEach(s=>{const q=S.hp(s*.05,1.567,0),x=s*Math.max(.012,.05-i*.004)*S.hs,p=cgRay(M,[x,my,q[2]+.5],[0,0,-1],{head:1});if(!p)return;const z2=p[2]-i*.024;if(z2<q[2]-.02)return;
      k.p('head','cone4','c',0xe8e0c0,p[0],my-.004,Math.min(p[2],q[2]+.2-zz),.004,.016,.004,i%2?0:Math.PI)})}
    for(let i=0;i<9;i++){const y=T[6][0]-i*.06,p=cgSurf(M,S,y,Math.PI,-.006);[-1,1].forEach(s=>k.p(cgSurfBn(S,y),'box','c',sc,p[0]+s*.03,p[1],p[2],.025,.035,.03,0,0,s*.2))}
    {const t0=cgSurf(M,S,J.pelvis[1]-.03,Math.PI,-.04),W=[['pelvis',1]],TT=[t0,add3(t0,[0,-.18,-.2]),add3(t0,[0,-.34,-.42]),add3(t0,[.05,-.42,-.66]),add3(t0,[.1,-.45,-.88])];cgTube(B,TT,[.1,.085,.065,.042,.012],[W,W,W,W,W],m=>m.ny<-.3?bel:sk,{seg:10,capB:true});
      for(let i=1;i<4;i++)[-1,1].forEach(s=>k.p('pelvis','box','c',sc,TT[i][0]+s*.025,TT[i][1]+.07-i*.012,TT[i][2],.02,.035,.03))}
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.08,.04,.02,m=>a181Nz(0x4a3a26,m,.3,12),{n:5,keep:m=>Math.abs(m.c)<.5});cgBelt(B,M,T[2][0],.02,.03,0x3a2a1a);
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk2,s>0?'fist':'claw',1,0x1a1a10,.02);cgToes(k,S,s,sk2,.02)})})})();

// ---------------- Frost Wendigo: gaunt and tall, an elk's skull for a head, antlers, a mantle of dark fur, flayed flanks, long claws ----------------
(function(){const S=cgHuman({h:1.06,w:.88,d:.86,rw:[.9,.92,.8,.88,.95,.95,.98,.95],at:.78,lt:.82,hs:1.0,hd:1.2,armL:1.22,legL:1.05}),fur=0x46423c,fur2=0x2e2b28,sk=0x50565a,bone=0xd8d2c0,bl=0x5a1a1a,T=S.torso,J=S.J;
  cg181Reg('wendigo',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.05?0:.03*cgG(x,y,0,1.575,.03,.03)));
    cgEmit(B,M,m=>m.part=='torso'&&m.s>-.2&&m.y>J.spine[1]&&m.y<T[6][0]-.03&&Math.round(m.y*44)%2?mdSh(sk,.75):m.part=='torso'&&Math.abs(m.c)>.75&&m.y<J.chest[1]&&n3Sn(m.x,m.y,m.z,9,2)>.5?bl:a181Nz(sk,m,.2,16));
    // the elk skull over the head: a long bone face, black sockets, burning eyes, a jaw of teeth; antlers
    cgShell(B,M,m=>m.part=='head'&&m.s>-.3,.012,m=>{const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-.038)<.018&&Math.abs(m.y-S.hp(0,1.63,0)[1])<.013*S.hs)return 0x080606;return a181Nz(bone,m,.15,24)},{rim:.4});
    cgEyes(k,M,S,0x7ae8ff,.038,1.63,.9,.012);for(let i=0;i<7;i++)cgTeeth(k,M,S,[[(i-3)*.012,1.552,.016,i%2]],0xe8e0d0);
    [-1,1].forEach(s=>{const q=S.hp(s*.06,1.7,-.02);let p=q,d=[s*.4,.9,-.2];for(let j=0;j<5;j++){const n=add3(p,mul3(d,.07));k.L('head','c',bone,p,n,.014-j*.002,.012-j*.002,4);if(j==1||j==3){const t=add3(n,[s*.04,.06,.04]);k.L('head','c',bone,n,t,.01,.003,4)}p=n;d=[d[0]*1.1,d[1]-.15,d[2]-.1]}});
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]-.04&&m.s<.5)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR0[1]-.12),{off:.035,len:.18,col:fur,col2:fur2,seed:131,jag:.6});
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.1,.05,.016,m=>a181Nz(fur2,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*5)%2==0});
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk,'claw',1.5,0x1a1a1e,.06);cgToes(k,S,s,sk,.03,0x1a1a1e)})})})();
