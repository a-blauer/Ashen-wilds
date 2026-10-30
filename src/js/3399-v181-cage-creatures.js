// ================= v181: the humanoid creatures on cage bodies (batch 4) =================
// Sand Elemental, Salt Golem, Rampart Gargoyle, Lichen, Akidon, Gharial Reaver, Frost Wendigo — each keeps its look.
// (restore pass) Each one keeps the old model's bulk, height, colours and signature parts (from the v113 / v137 builders):
// rock fists and the chest gem, glowing core shards, bat wings and ram horns, the goo heart and green vines, mantis scythes and
// the hanging abdomen, the harness and tooth necklace, raised ribs and knee caps.
function cgRocky(M,amp,f,seed,parts){cgSculpt(M,parts||{head:1,torso:1,arm:1,leg:1,neck:1,hand:1,foot:1},(x,y,z,n)=>amp*(n3Sn(x*f,y*f,z*f,9,seed)-.45))}
function cgSurfBn(S,y){const J=S.J;return y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis'}
// ---- batch 4 helpers ----
// the old models' palettes (v113 builders; their constants are not reachable from here)
const c9_SG={salt:0x8e847c,salt2:0x6e655e,pink:0xa07c76,dark:0x4a403a,cry:0xd8ccc8,cry2:0xc8a6a2,core:0xff9a6a,glow:0xffd0b0};
const c9_GG={st:0x58565a,st2:0x3e3d42,dark:0x222126,moss:0x4a5a3a,eye:0xff5a2a,claw:0x1a1a1e};
const c9_LI={soil:0x43341f,soil2:0x302517,moss:0x3e5a22,moss2:0x56722c,vine:0x26401a,vine2:0x3a5420,lich:0x8a926a,goo:0x8aff4a,bark:0x3a2a1a,cap:0xc8b088,cap2:0x8a6a4a};
const c9_AK={c1:0x15140e,c2:0x29261a,c3:0x080806,edge:0x3e3c28,acid:0x9aff3a,acid2:0x5aa81e,bone:0xcfc6a8};
const c9_GH={sk:0x3a4a2a,sk2:0x2a3620,belly:0x8a8a5a,scute:0x24301c,tooth:0xe8e0c0,eye:0xe8c020,cloth:0x4a3a26,bone:0xb8a888};
const c9_WD={fur:0x46423c,fur2:0x2e2b28,skin:0x50565a,bone:0xd8d2c0,bone2:0xa8a090,eye:0x7ae8ff,claw:0x1a1a1e,blood:0x5a1a1a};
const c9_cl=v=>Math.max(0,Math.min(1,v));
// a heavy brute face (deep small eyes under a hard brow, a broad nose, a jutting jaw) and wide jaw corners
function c9_face(o){o=o||{};return (x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
  d+=.05*(o.nose||1)*cgG(x,y,0,1.582,.016,.02)+.025*(o.nose||1)*cgG(x,y,0,1.608,.012,.014);
  [-1,1].forEach(s=>{d-=.018*cgG(x,y,s*.04,1.63,.015,.01);d+=.006*cgG(x,y,s*.062,1.6,.016,.012)});d+=.022*(o.brow||1)*cgG(x,y,0,1.65,.06,.009);
  d-=.007*cgG(x,y,0,1.553,.04,.004);d+=.014*(o.jaw||1)*cgG(x,y,0,1.535,.04,.016);if(o.snout)d+=o.snout*cgG(x,y,0,1.568,.034,.024);return d*f}}
const c9_JAW=(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);return (i>=1&&i<=4&&sa>-.2&&side>.5)?.012:0};
// the part just added keeps its place (glow lines laid in the surface: cgSeat would bury them)
function c9_keep(k){k.P[k.P.length-1].noSeat=1;return k}
// a part laid along direction d from p (its base at p): oct / sph / dod are centred, cone4 / box / cyl are full length
function c9_along(k,bn,geo,t,col,p,d,len,r,r2){const u=nrm3(d),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(u[0],u[1],u[2])),e=new THREE.Euler().setFromQuaternion(q),c=add3(p,mul3(u,len/2)),
  hy=(geo=='cone4'||geo=='cone'||geo=='box'||geo=='cyl')?len:len/2;k.p(bn,geo,t,col,c[0],c[1],c[2],r,hy,r2==null?r:r2,e.x,e.y,e.z);return k}
// a point on an arm's surface: t 0 shoulder … 1 elbow … 2 wrist, ang round the arm (0 = outside, π/2 = front); off out from the skin
function c9_arm(M,J,s,t,ang,off){const A=s<0?'aL':'aR',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],c=t<=1?lerp3(a0,a1,t):lerp3(a1,a2,t-1),o=[s*Math.cos(ang),0,Math.sin(ang)],
  p=cgRay(M,add3(c,mul3(o,.45)),mul3(o,-1),{arm:1});return {p:p?add3(p,mul3(o,off||0)):c,bn:t<1?A+'0':A+'1',o}}
// a glowing crack laid in the torso surface: a zigzag through [y, angle] points
function c9_crack(k,M,S,pts,col,r){let prev=null;pts.forEach(([y,a])=>{const p=cgSurf(M,S,y,a,-.002);if(prev){c9_keep(k.L(cgSurfBn(S,(y+prev[1])/2),'g',col,prev,p,r||.006,r||.006,4))}prev=p})}
// a vine / cord along the torso surface through [y, angle] points, off out from the skin, bending with the skin under it
function c9_vine(B,M,S,pts,r,col,off,o){const P=pts.map(([y,a],i)=>cgSurf(M,S,y,a,typeof off=='function'?off(i):off));cgTube(B,P,P.map(()=>r),P.map(p=>cgWAt(M,p)),col,Object.assign({seg:6},o||{}));return P}

// ---------------- Sand Elemental: a chunky golem of packed golden sand and rock plates, glowing seams, a blazing chest gem,
// boulder shoulders, rock fists, a girdle of stones with shards hanging round the hips, a crown of jagged rock ----------------
(function(){const S=cgHuman({h:.8,w:1.32,d:1.26,rw:[1.05,1.12,1.1,1.18,1.28,1.3,1.36,1.42],rf:[1,1.05,1.12,1.22,1.3,1.25,1.15,1.1],at:1.95,lt:1.6,hs:1.04,hw:1.08,nw:1.7,armL:1.12,foot:1.15,footW:1.35,facePush:c9_JAW}),
    s1=0xc8a060,s2=0xa8844a,s3=0xd8b878,rk=0x8a6a3a,gl=0xffa030,T=S.torso,J=S.J;
  cg181Reg('selem',S,function(B,P,k,C){const M=C.M,ch=J.chest[1],ty=f=>T[2][0]+(T[6][0]-T[2][0])*f;cgRocky(M,.022,1.6,4);cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.35,jaw:1.3,brow:1.3})));
    // packed sand: a smooth blend of the three sand tones, paler toward the shoulders and the head
    cgEmit(B,M,m=>{const n=n3Sn(m.x,m.y,m.z,7,6),up=c9_cl((m.y-ch+.12)/.3);let c=mdMix(s1,s2,c9_cl((.48-n)*2.6));c=mdMix(c,s3,c9_cl(up*.7+(m.part=='head'?.35:0))*c9_cl((n-.25)*2.5));return mdMix(c,rk,c9_cl((n-.8)*4)*.6)});
    cgEyes(k,M,S,gl,.04,1.628,1.25,-.004);
    // rock plates on the chest, back and flanks, glowing cracks between them
    [[.86,-.62,.09,.075],[.86,.62,.09,.075],[.56,-.82,.075,.065],[.56,.82,.075,.065],[.3,-.4,.07,.055],[.3,.4,.07,.055],[.84,Math.PI,.1,.085],[.55,Math.PI-.6,.08,.07],[.55,Math.PI+.6,.08,.07],[.22,Math.PI,.085,.06],[.12,1.55,.06,.055],[.12,-1.55,.06,.055]]
      .forEach(([f,a,sx,sy],i)=>{const y=ty(f),p=cgSurf(M,S,y,a,-.014);k.p(cgSurfBn(S,y),'dod','c',i%2?rk:mdSh(rk,.86),p[0],p[1],p[2],sx,sy,.045,0,a,0)});
    [[[.62,-.3],[.5,-.38],[.4,-.28],[.28,-.18]],[[.62,.3],[.48,.36],[.38,.26],[.24,.2]],[[.7,Math.PI-.25],[.56,Math.PI-.1],[.42,Math.PI-.22],[.3,Math.PI-.08]],[[.66,Math.PI+.3],[.5,Math.PI+.22],[.36,Math.PI+.34]],[[.42,-1.15],[.3,-1.05],[.2,-1.2]],[[.42,1.15],[.3,1.05],[.2,1.2]]]
      .forEach(L=>c9_crack(k,M,S,L.map(([f,a])=>[ty(f),a]),gl,.0065));
    // the blazing gem in the chest, set in a socket of dark rock, cracks running out from it
    {const y=ty(.66),p=cgSurf(M,S,y,0,-.02);k.p('chest','oct','g',gl,p[0],p[1],p[2]+.004,.075,.095,.05);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3,q=cgRay(M,[p[0]+Math.cos(a)*.085,p[1]+Math.sin(a)*.095,.8],[0,0,-1],{torso:1});if(q)k.p('chest','dod','c',i%2?rk:mdSh(rk,.75),q[0],q[1],q[2]-.012,.04,.034,.03,0,0,a)}
      c9_crack(k,M,S,[[y+.1,.0],[y+.16,.12],[ty(.98),.05]],gl,.006)}
    // boulders on the shoulders and the trapezius
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A],p=cgRay(M,[a[0]+s*.02,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;k.p(A,'dod','c',s2,p[0]+s*.015,p[1]+.01,p[2],.12,.1,.115,.3,0,s*.4);
      k.p(A,'dod','c',rk,p[0]+s*.06,p[1]-.02,p[2]-.05,.07,.06,.065,.5,.4,0);const q=cgSurf(M,S,T[7][0]-.01,s*2.3,-.02);k.p('chest','dod','c',s3,q[0],q[1],q[2],.075,.065,.07,0,s*2.3,0)});
    // rock armour down the arms, and great rock fists with glowing cracks
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';[[.35,0],[.7,.6],[1.2,-.2],[1.55,.5],[1.8,-.5]].forEach(([t,an],i)=>{const q=c9_arm(M,J,s,t,an,-.016);k.p(q.bn,'dod','c',t>1?rk:mdSh(rk,.9),q.p[0],q.p[1],q.p[2],.058,.052,.056,t,t,0)});
      const a1=J[A+'1'],a2=J[A+'2'],d=nrm3(sub3(a2,a1)),fc=add3(a2,mul3(d,.075));k.p(A+'2','dod','c',rk,fc[0],fc[1],fc[2],.095,.1,.095,.4,.3,0);
      k.p(A+'2','dod','c',s2,fc[0]+s*.04,fc[1]+.03,fc[2]-.035,.06,.055,.06,0,.5,0);
      c9_keep(k.L(A+'2','g',gl,[fc[0]-.02,fc[1]+.03,fc[2]+.074],[fc[0]+.015,fc[1]-.03,fc[2]+.075],.006,.005,4));c9_keep(k.L(A+'2','g',gl,[fc[0]+s*.075,fc[1]+.02,fc[2]+.01],[fc[0]+s*.074,fc[1]-.04,fc[2]-.012],.006,.005,4))});
    // a girdle of stones grown into the hips, shards of stone hanging from it all round
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,p=cgSurf(M,S,T[1][0]+.03+Math.sin(a*3)*.012,a,-.012);k.p('pelvis','dod','c',i%3?s2:rk,p[0],p[1],p[2],.05+(i%3)*.012)}
    for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2,y=T[1][0]-.01,r=cgSurf(M,S,y,a,-.03),d=[Math.sin(a)*.16,-1,Math.cos(a)*.16],L=.24+a181H(i,7)*.08;
      k.L('pelvis','c',i%2?s2:rk,r,add3(r,mul3(nrm3(d),L)),.05,.006,4)}
    // a crown of jagged rock
    for(let i=0;i<5;i++){const a=(i-2)*.45,q=S.hp(Math.sin(a)*.08,1.715,Math.cos(a)*.03-.015);k.p('head','cone4','c',i%2?rk:s3,q[0],q[1],q[2],.032,.13-Math.abs(i-2)*.025,.032,-.1,0,-a*.6)}
    [-1,1].forEach(s=>cgToes(k,S,s,s2,0))})})();

// ---------------- Salt Golem: a hulking block of grey-pink salt, crystal spires from the shoulders and back, crystal-studded fists,
// a molten core cracked open in the chest ringed by five glowing shards, a dark visor with burning eye slits ----------------
(function(){const S=cgHuman({h:.86,w:1.62,d:1.46,rw:[1.28,1.32,1.34,1.42,1.55,1.6,1.7,1.85],rf:[1.1,1.2,1.3,1.4,1.5,1.4,1.3,1.3],at:2.2,lt:2.15,hs:1.0,hw:1.12,nw:2.2,neckL:-.04,armL:1.22,legL:.86,foot:1.3,footW:1.75,facePush:c9_JAW}),
    C9=c9_SG,sa=c9_SG.salt,sa2=c9_SG.salt2,pink=c9_SG.pink,cry=c9_SG.cry,cry2=c9_SG.cry2,core=c9_SG.core,T=S.torso,J=S.J;
  cg181Reg('saltgolem',S,function(B,P,k,C){const M=C.M;cgRocky(M,.035,1.2,7);cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.25,jaw:1.4,brow:1.4})));
    const cy=J.chest[1]+.02,ey=S.hp(0,1.628,0)[1];cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]<.3?0:-.05*cgG(x,y,0,cy,.06,.06));   // a cavity in the chest for the core
    cgEmit(B,M,m=>{if(m.part=='torso'&&m.s>.6&&Math.hypot(m.x,m.y-cy)<.05)return 0x2a1a14;if(m.part=='head'&&m.s>.35&&Math.abs(m.y-ey)<.02*S.hs)return 0x3a2a28;if(m.part=='foot')return sa2;   // the visor band
      const n=n3Sn(m.x,m.y,m.z,7,8),b=mdMix(sa,pink,.22);return mdMix(mdMix(b,sa2,c9_cl((.42-n)*2.8)),pink,c9_cl((n-.6)*3))});
    [-1,1].forEach(s=>{const q=S.hp(s*.036,1.628,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(p)k.p('head','box','g',core,p[0],p[1],p[2]-.003,.032*S.hs,.011,.01,0,s*.25,0)});
    // the core: a molten heart in the cavity, five glowing shards round it
    const cc=cgSurf(M,S,cy,0,-.03);k.p('chest','ico','g',core,cc[0],cc[1],cc[2],.05);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/2,x=Math.cos(a)*.058,y=cy+Math.sin(a)*.058,p=cgRay(M,[x,y,.8],[0,0,-1],{torso:1});if(p)k.p('chest','oct','g',i%2?core:C9.glow,p[0],p[1],p[2]-.006,.018,.05,.016,0,0,a-Math.PI/2)}
    // crystal clusters through the back and shoulders
    const clu=(y,a,n,sz)=>{const p=cgSurf(M,S,y,a,-.014),bn=cgSurfBn(S,y);for(let j=0;j<n;j++){const tl=(a181H(j,y*20,a)-.5)*.9,tl2=(a181H(j,a*7)-.5)*.9;k.p(bn,'oct','c',j%2?cry:cry2,p[0]+Math.sin(a)*.02,p[1]+.03,p[2]+Math.cos(a)*.02,sz*.4,sz*(1+j*.2),sz*.4,tl+Math.cos(a)*-.5,0,tl2+Math.sin(a)*.5)}};
    [[T[6][0]-.02,Math.PI*.85,4,.09],[T[6][0]-.02,-Math.PI*.85,4,.09],[J.chest[1],Math.PI,5,.1],[J.spine[1]+.05,Math.PI*.9,3,.075],[J.spine[1],-Math.PI*.8,3,.065],[T[6][0],2.1,3,.065],[T[6][0],-2.1,3,.065],[T[1][0]+.03,1.6,3,.05],[T[1][0]+.03,-1.6,3,.05]].forEach(q=>clu(...q));
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];for(let j=0;j<4;j++){const x=a[0]+s*(.03+j*.035),z=a[2]-.04+j*.03,b=cgRay(M,[x,a[1]+.6,z],[0,-1,0],{arm:1,torso:1})||[x,a[1]+.05,z],t=.3+j*.2;c9_along(k,A+'0','oct','c',j%2?cry:cry2,sub3(b,[0,.05,0]),[s*Math.sin(t),Math.cos(t),-.2],.32-j*.04,.04)}
      const e=J[A+'1'];for(let j=0;j<2;j++)k.p(A+'1','oct','c',cry,e[0]+s*.06,e[1]-.02-j*.05,e[2]-.04,.025,.07,.025,-.4,0,-s*.6);
      // the fists: blocks of salt with crystal spikes over the knuckles
      const a1=J[A+'1'],a2=J[A+'2'],d=nrm3(sub3(a2,a1)),fc=add3(a2,mul3(d,.07));k.p(A+'2','dod','c',sa2,fc[0],fc[1],fc[2],.1,.105,.1,.3,.2,0);
      for(let f=0;f<3;f++){const b=add3(fc,[s*.035,-.045+(f-1)*.0,.0+(f-1)*.045]);c9_along(k,A+'2','oct','c',f==1?cry:cry2,add3(b,[-s*.02,0,0]),[s*.8,-.45,(f-1)*.35],.13-(f==1?0:.025),.022)}
      c9_along(k,A+'2','oct','c',cry,add3(fc,[0,-.06,.02]),[0,-1,.2],.1,.02)});
    for(let i=0;i<3;i++){const q=S.hp((i-1)*.04,1.71,-.03);k.p('head','oct','c',cry,q[0],q[1],q[2],.02,.07,.02,-.3,0,(i-1)*.4)}})})();

// ---------------- Rampart Gargoyle: a crouched stone demon — great spiky bat wings on four finger bones, curled ram horns, a
// fanged snout under a heavy brow, red burning eyes, moss in the cracks, a curling tail with a spade ----------------
(function(){const S=cgHuman({h:.76,w:1.32,d:1.24,rw:[1.0,1.08,1.05,1.14,1.28,1.32,1.4,1.46],rf:[1,1.05,1.1,1.22,1.32,1.25,1.15,1.1],at:1.85,lt:1.75,hs:1.14,hw:1.1,hd:1.14,nw:1.65,armL:1.22,foot:1.1,footW:1.25,facePush:c9_JAW}),
    st=c9_GG.st,st2=c9_GG.st2,dk=c9_GG.dark,moss=c9_GG.moss,T=S.torso,J=S.J;
  cg181Reg('gargoyle',S,function(B,P,k,C){const M=C.M;cgRocky(M,.014,2.2,9);cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.8,jaw:1.6,brow:1.6,snout:.026})));
    const my=S.hp(0,1.553,0)[1];
    // weathered stone, moss where the rain runs down (fronts and tops), dark cracks
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-my)<.005*S.hs&&Math.abs(m.x)<.045*S.hs)return 0x0a0a0c;const n=n3Sn(m.x,m.y,m.z,8,3),n2=n3Sn(m.x,m.y,m.z,17,11);
      let c=mdMix(st,st2,c9_cl((.48-n)*2.6));c=mdMix(c,dk,c9_cl((n2-.82)*5)*.7);return mdMix(c,moss,(m.ny>.2||m.s>.1?1:.4)*c9_cl((n-.5)*3.2))});
    cgEyes(k,M,S,c9_GG.eye,.04,1.628,1.45,-.004);cgEars(k,M,S,st,1.64,.11,.5,.6,.024,st2);
    cgTeeth(k,M,S,[[-.03,1.556,.042,0],[.03,1.556,.042,0],[-.014,1.556,.02,0],[.014,1.556,.02,0],[-.036,1.551,.03,1],[.036,1.551,.03,1]],0xd8d0c0);
    // curled ram horns: six ridged turns out, back, down and forward
    [-1,1].forEach(s=>{const q=S.hp(s*.055,1.705,-.01);let p=add3(q,[-s*.02,-.012,0]),d=[s*.6,.5,-.6];const pts=[p];for(let i=0;i<6;i++){p=add3(p,mul3(d,.07*S.hs));pts.push(p);d=[d[0]-s*.15,d[1]-.35,d[2]+.25]}
      cgTube(B,pts,pts.map((_,i)=>(.034-i*.0042)*S.hs),pts.map(()=>[['head',1]]),m=>Math.round(m.i*2.2)%2?st2:dk,{seg:8,capB:true})});
    // the wings: an arm from each shoulder blade to a high wrist, four finger bones fanning from it, stone membranes between with a
    // scalloped trailing edge, a spike on every finger tip and a thumb claw
    [-1,1].forEach(s=>{const r=cgSurf(M,S,J.chest[1]+.05,Math.PI-s*.45,-.035),e=add3(r,[s*.24,.2,-.13]),w=add3(e,[s*.25,.06,-.05]),W=[['chest',1]],
        tips=[add3(w,[s*.18,.12,-.03]),add3(w,[s*.36,-.08,-.05]),add3(w,[s*.32,-.4,-.05]),add3(w,[s*.16,-.66,-.03])],bp=cgSurf(M,S,J.spine[1]-.03,Math.PI-s*.5,-.02);
      cgTube(B,[r,lerp3(r,e,.5),e,lerp3(e,w,.5),w],[.042,.036,.032,.028,.026],[W,W,W,W,W],st2,{seg:7});
      tips.forEach((t,i)=>{cgTube(B,[w,lerp3(w,t,.5),t],[.02,.014,.007],[W,W,W],st2,{seg:5});c9_along(k,'chest','cone4','c',dk,t,sub3(t,w),.07-(i==0?0:.01),.011)});
      c9_along(k,'chest','cone4','c',dk,w,[s*.1,.5,.6],.08,.014);c9_along(k,'chest','cone4','c',dk,e,[s*.2,.3,-.5],.06,.012);
      const mw=mdW(B,W),V=p=>({x:p[0],y:p[1],z:p[2],w:mw}),tri=(a,b,c,col)=>{const cc=mdC(col);mdTri(B,'c',V(a),V(b),V(c),cc);mdTri(B,'c',V(c),V(b),V(a),cc)},
        scal=(a,b,c,f)=>lerp3(lerp3(a,b,.5),c,f);
      tri(r,e,w,st2);
      for(let i=0;i<3;i++){const m=scal(tips[i],tips[i+1],w,.28);tri(w,tips[i],m,i%2?dk:mdMix(dk,st2,.4));tri(w,m,tips[i+1],i%2?dk:mdMix(dk,st2,.4))}
      const m3=scal(tips[3],bp,r,.25);tri(r,w,tips[3],dk);tri(r,tips[3],m3,mdMix(dk,st2,.4));tri(r,m3,bp,mdMix(dk,st2,.4))});
    // a curling tail with a spade, spines down the back
    {const t0=cgSurf(M,S,J.pelvis[1]-.04,Math.PI,-.03),W=[['pelvis',1]],TT=[t0,add3(t0,[0,-.16,-.17]),add3(t0,[.05,-.32,-.3]),add3(t0,[.14,-.42,-.38]),add3(t0,[.26,-.44,-.42]),add3(t0,[.34,-.38,-.44])];
      cgTube(B,TT,[.06,.048,.038,.028,.018,.008],TT.map(()=>W),st2,{seg:8,capB:true});const e=TT[5];k.p('pelvis','cone4','c',dk,e[0]+.02,e[1]+.02,e[2],.035,.09,.012,0,0,-1)}
    for(let i=0;i<7;i++){const y=T[6][0]+.02-i*.075,p=cgSurf(M,S,y,Math.PI,-.008);c9_along(k,cgSurfBn(S,y),'cone4','c',dk,p,[0,.45,-1],.085-i*.004,.02)}
    [-1,1].forEach(s=>{cgFingers(k,S,s,st2,'claw',1.15,c9_GG.claw,.045);cgToes(k,S,s,st2,.035,c9_GG.claw)})})})();

// ---------------- Lichen: a hulking body of soil and moss — a hollow face with eyes and a glowing mouth deep inside, a crown of
// roots, a mossy beard, a glowing goo heart in a cracked chest, green vines wound round it, a rock and lichen on the right shoulder,
// a mushroom shelf on the left, tendrils off the forearms, root-bundle feet ----------------
(function(){const S=cgHuman({h:.77,w:1.24,d:1.16,rw:[1.0,1.06,1.02,1.1,1.2,1.22,1.27,1.32],at:1.55,lt:1.5,hs:1.08,hy:1.06,hw:1.04,nw:1.5,armL:1.14,foot:1.1,footW:1.3}),
    C9=c9_LI,soil=c9_LI.soil,soil2=c9_LI.soil2,moss=c9_LI.moss,moss2=c9_LI.moss2,goo=c9_LI.goo,T=S.torso,J=S.J;
  cg181Reg('lichen',S,function(B,P,k,C){const M=C.M,ch=J.chest[1];cgRocky(M,.02,1.8,12);cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.2)return 0;let d=.014*cgG(x,y,0,1.662,.06,.008)-.006*cgG(x,y,0,1.592,.03,.006)+.008*cgG(x,y,0,1.61,.012,.012);[-1,1].forEach(s=>d-=.016*cgG(x,y,s*.032,1.635,.018,.014));return d}));
    const fy=S.hp(0,1.62,0)[1];
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4){const bx=m.x/S.hs,by=(m.y-S.nb)/S.hs/1.06+1.52;if(Math.hypot((Math.abs(bx)-.032)/.022,(by-1.635)/.017)<1||(Math.abs(bx)<.028&&Math.abs(by-1.592)<.007))return 0x0c0806}const n=n3Sn(m.x,m.y,m.z,7,5),n2=n3Sn(m.x,m.y,m.z,15,9);
      let c=mdMix(soil,soil2,c9_cl((.42-n)*3));c=mdMix(c,mdMix(moss,moss2,c9_cl((n-.72)*4)),c9_cl((n-.5)*3.5)*(m.part=='head'&&m.y>fy+.03?1:.9));if(m.part=='head'&&m.y>fy+.04)c=mdMix(c,moss,.55);return mdMix(c,C9.lich,c9_cl((n2-.86)*6)*.8)});
    // eyes glowing deep in the hollow, a glowing slit of a mouth, a ridge of soil for a brow
    [-1,1].forEach(s=>{const q=S.hp(s*.032,1.635,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','sph','g',goo,p[0],p[1],p[2]+.002,.015,.012,.009)});
    {const q=S.hp(0,1.592,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)c9_keep(k.p('head','box','g',0x5ad82a,p[0],p[1],p[2]-.001,.042*S.hs,.008,.01))}
    // a mossy beard hanging from the chin and jaw
    {const by=S.hp(0,1.575,0)[1];for(let i=0;i<6;i++){const x=(i-2.5)*.016*S.hs,p=cgRay(M,[x,S.hp(0,1.548,0)[1],.6],[0,0,-1],{head:1});if(p)k.L('head','c',i%2?moss:moss2,add3(p,[0,.004,-.012]),add3(p,[x*.3,-.11-(i%3)*.035,.03]),.013,.003,4)}cgFur(B,M,m=>m.part=='head'&&m.s>-.1&&m.y<by&&m.y>S.hp(0,1.525,0)[1],{off:.014,len:.13,col:moss,col2:moss2,seed:123,jag:.45,lump:[.5,1.2]})}
    cgFur(B,M,m=>(m.part=='torso'&&m.y>ch+.02&&m.s<.3)||(m.part=='head'&&m.y>S.hp(0,1.69,0)[1]),{off:.025,len:.1,col:moss,col2:moss2,seed:121,jag:.55});
    // a crown of gnarled roots
    for(let i=0;i<7;i++){const an=-1.5+i*.5,q=S.hp(Math.sin(an)*.07,1.72,-.04-Math.cos(an)*.02);let a=q,d=[Math.sin(an)*.4,1,-.3];for(let j=0;j<3;j++){const b=add3(a,mul3(d,.055));k.L('head','c',C9.bark,a,b,.015-j*.004,.011-j*.003,4);a=b;d=[d[0]*1.3,d[1]-.3,d[2]-.2]}}
    // a mushroom shelf on the left shoulder, a rock crusted with lichen on the right
    for(let i=0;i<3;i++){const q=c9_arm(M,J,-1,.08+i*.2,-.35+i*.15,-.022);k.p('aL0','hem','c',i%2?C9.cap:C9.cap2,q.p[0],q.p[1],q.p[2],.08-i*.012,.028,.07,0,0,.25)}
    {const a=J.aR0,p=cgRay(M,[a[0]+.02,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;k.p('aR0','dod','c',soil2,p[0]+.02,p[1]+.012,p[2],.085,.065,.08,.3,0,-.3);
      for(let i=0;i<4;i++)k.p('aR0','sph','c',C9.lich,p[0]+.0+i*.022,p[1]+.06-Math.abs(i-1.5)*.01,p[2]-.03+i*.018,.022,.008,.022)}
    // green vines wound round the arms and legs and across the body
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';[[J[A+'0'],J[A+'1'],J[A+'2'],A,2.2],[J[L+'0'],J[L+'1'],J[L+'2'],L,2.6]].forEach(([p0,p1,p2,bp,turns])=>{const pts=[],W=[],r=bp[0]=='a'?.062*1.2:.085*1.15;
        for(let i=0;i<=18;i++){const t=i/18,c=t<.5?lerp3(p0,p1,t*2):lerp3(p1,p2,(t-.5)*2),an=t*turns*Math.PI*2,q=[c[0]+Math.cos(an)*.2*s,c[1],c[2]+Math.sin(an)*.2],h0=cgRay(M,q,nrm3(sub3(c,q)),{arm:1,leg:1}),hit=h0&&Math.sign(h0[0])==s&&Math.hypot(h0[0]-c[0],h0[2]-c[2])<.16?h0:null;
          pts.push(hit?add3(hit,mul3(nrm3(sub3(q,c)),.004)):[c[0]+Math.cos(an)*r*s,c[1],c[2]+Math.sin(an)*r]);W.push(t<.5?[[bp+'0',1]]:[[bp+'1',1]])}
        cgTube(B,pts,pts.map(()=>.013),W,bp[0]=='a'?C9.vine:C9.vine2,{seg:5})});
      // tendrils hanging off the forearms
      for(let i=0;i<3;i++){const q=c9_arm(M,J,s,1.2+i*.25,.4+i*.3,-.006);k.L(A+'1','c',i%2?C9.vine:moss,q.p,add3(q.p,[s*.03,-.18-i*.05,.02]),.013,.003,4)}
      cgFingers(k,S,s,soil2,'claw',1.1,C9.bark,.03)});
    {const N=16;c9_vine(B,M,S,Array.from({length:N},(_,i)=>{const t=i/(N-1);return [T[1][0]+.02+(T[6][0]-.04-T[1][0])*t,-2.7+t*5.4]}),.015,C9.vine,.006);
      c9_vine(B,M,S,Array.from({length:12},(_,i)=>{const t=i/11;return [T[1][0]+.06+(ch-T[1][0])*t,2.4-t*4.2]}),.013,C9.vine2,.006)}
    // the glowing goo heart in the cracked chest, glowing cracks round it, goo seeping out of the body
    {const y=ch-.01,p=cgSurf(M,S,y,.18,-.02);k.p('chest','oct','g',goo,p[0],p[1],p[2]+.006,.06,.075,.045);
      [[[y+.05,.0],[y+.1,-.12],[y+.13,-.2]],[[y-.02,.38],[y+.04,.5],[y+.02,.62]],[[y-.06,.1],[y-.12,.04],[y-.18,.12]],[[y-.04,-.1],[y-.08,-.28],[y-.14,-.34]]].forEach(L=>c9_crack(k,M,S,L,0x6ae02a,.006))}
    for(let i=0;i<5;i++){const y=T[1][0]+.06+i*.07,an=-1.2+a181H(i,2,3)*2.4,p=cgSurf(M,S,y,an,-.006);k.p(cgSurfBn(S,y),'sph','g',goo,p[0],p[1],p[2],.013,.022,.01,0,an,0)}
    // lichen crusts on the hips
    for(let i=0;i<6;i++){const an=a181H(i,9,1)*Math.PI*2,y=T[1][0]+a181H(i,1,9)*.08,p=cgSurf(M,S,y,an,-.004);k.p('pelvis','sph','c',C9.lich,p[0],p[1],p[2],.035,.035,.009,0,an,0)}
    // feet: root bundles gripping the ground
    [-1,1].forEach(s=>{const l=s<0?'lh2':'rh2',F=J[l],L=S.foot.len;for(let i=0;i<5;i++){const an=-1.1+i*.55;k.L(l,'c',C9.bark,[F[0]+Math.sin(an)*.02,.045,F[2]+.04*L],[F[0]+Math.sin(an)*.15,.006,F[2]+.04*L+Math.cos(an)*.15],.024,.007,4)}
      k.L(l,'c',C9.bark,[F[0],.04,F[2]-.02],[F[0]+s*.03,.006,F[2]-.13],.022,.007,4)})})})();

// ---------------- Akidon: a lean insectoid in olive-black chitin — great faceted compound eyes, hooked mandibles dripping acid,
// antennae, mantis scythes on the forearms, ridge spikes and shoulder spikes, glowing acid sacs on the belly, a hanging
// ringed abdomen with a stinger, spurred knees ----------------
(function(){const S=cgHuman({h:.86,w:.98,d:.95,rw:[1.0,1.0,.92,.98,1.04,1.04,1.08,1.08],at:.94,lt:.94,hs:1.0,hd:1.12,armL:1.12}),c1=c9_AK.c1,c2=c9_AK.c2,c3=c9_AK.c3,ed=c9_AK.edge,acid=c9_AK.acid,acid2=c9_AK.acid2,bone=c9_AK.bone,T=S.torso,J=S.J;
  cg181Reg('akidon',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.018*cgG(x,y,0,1.645,.06,.01);[-1,1].forEach(s=>d+=.01*cgG(x,y,s*.03,1.6,.016,.02));return d}));
    const my=S.hp(0,1.556,0)[1];
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.45&&Math.abs(m.y-my)<.006*S.hs&&Math.abs(m.x)<.03)return 0x050308;if(m.part=='hand')return c3;const n=n3Sn(m.x,m.y,m.z,14,3);
      return m.part=='head'?mdMix(m.s<-.2?c1:c2,ed,c9_cl((n-.7)*3)*.6):mdMix(m.s<-.3?c3:c1,c2,c9_cl((n-.5)*2.5)*.45)});
    // chitin plates: the chest plate, banded belly plates, the wing cases down the back, arm and shin guards
    cgShell(B,M,m=>m.part=='torso'&&m.y>T[2][0]&&m.s>-.2,.014,m=>Math.abs(m.x)<.01?c3:mdMix(mdMix(c1,c2,.6),ed,c9_cl((n3Sn(m.x,m.y,m.z,16,2)-.6)*2)*.45),{rim:.3});
    cgShell(B,M,m=>m.part=='torso'&&m.y<=T[2][0]&&m.y>J.lh0[1]-.03,.014,m=>Math.round(m.y*30)%2?c2:c3,{rim:.3});
    const wc=v=>.04*Math.min(1,Math.max(.3,(v[1]-J.spine[1]+.06)/.2));
    cgShell(B,M,m=>(m.part=='torso'&&m.s<-.15&&m.y>J.spine[1]-.06)||(m.part=='neck'&&m.s<-.3),wc,m=>Math.abs(m.x)<.006?c3:mdMix(c2,c1,c9_cl((n3Sn(m.x,m.y,m.z,12,4)-.4)*2)),{rim:.15});   /* the wing cases */
    // great compound eyes on the sides of the head: a dark rim and a glowing faceted dome with dark facet lines
    [-1,1].forEach(s=>{const q=S.hp(s*.3,1.632,.035),p=cgRay(M,q,[-s,0,0],{head:1});if(!p)return;const o=[s*.8,0,.6];
      k.p('head','sph2','c',c3,p[0]-s*.006,p[1],p[2],.034,.044,.052,0,s*.5,0);k.p('head','dod','g',acid,p[0]+s*.012,p[1]+.002,p[2]+.004,.031,.042,.048,0,s*.5,0);
      for(let i=0;i<3;i++)k.p('head','box','c',c3,p[0]+s*.03,p[1]-.022+i*.022,p[2]+.012,.004,.004,.06,0,s*.5,0)});
    // hooked mandibles either side of the mouth, a drop of acid on each tip
    [-1,1].forEach(s=>{const q=S.hp(s*.04,1.556,0),p0=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(!p0)return;let a=add3(p0,[0,0,-.01]),d=[s*.25,-.25,1];
      for(let i=0;i<4;i++){const u=nrm3(d),b=add3(a,mul3(u,.03));k.L('head','c',i<2?c2:bone,a,b,.014*(1-i*.2),.014*(1-(i+1)*.2)+.003,4);a=b;d=[d[0]-s*.35,d[1]+.05,d[2]-.15]}
      k.p('head','sph','g',acid,a[0],a[1]-.012,a[2],.007,.014,.007)});
    // antennae with acid-lit tips
    [-1,1].forEach(s=>{const q=S.hp(s*.03,1.7,.02);let a=q,d=[s*.25,.6,.75];for(let i=0;i<5;i++){const b=add3(a,mul3(d,.05*S.hs));k.L('head','c',c2,a,b,.008,.006,3);a=b;d=[d[0]+s*.06,d[1]-.18,d[2]+.05]}k.p('head','sph','g',acid,a[0],a[1],a[2],.009)});
    // ridge spikes down the wing cases, shoulder plates with spikes
    for(let i=0;i<6;i++){const y=T[6][0]-.03-i*.065,o=wc([0,y,0]),p=cgSurf(M,S,y,Math.PI,o-.012);c9_keep(c9_along(k,cgSurfBn(S,y),'cone4','c',ed,p,[0,.5,-1],.085-i*.006,.016))}
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A],p=cgRay(M,[a[0]+s*.025,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;k.p(A,'hem','c',c2,p[0],p[1]-.03,p[2],.085,.055,.09,0,0,s*.4);
      c9_along(k,A,'cone4','c',ed,add3(p,[s*.035,.0,-.01]),[s*.6,1,-.2],.085,.014)});
    // glowing acid sacs down the belly
    [ .2,.42,.64].forEach((f,i)=>{const y=T[1][0]+(J.chest[1]-T[1][0])*f,p=cgSurf(M,S,y,0,.006);k.p(cgSurfBn(S,y),'sph','g',acid2,p[0],p[1],p[2],.05-i*.008,.022,.014)});
    // the hanging abdomen (gaster): five segments with acid glowing between them, a stinger at the end
    {const b0=cgSurf(M,S,J.pelvis[1]-.03,Math.PI,-.04),seg=[];for(let i=0;i<5;i++){const t=i/4,r=(.12-Math.abs(t-.35)*.085);seg.push([add3(b0,[0,-t*.26,-t*.4-.04]),r])}
      seg.forEach(([c,r],i)=>{k.p('pelvis','sph2','c',i%2?c1:c2,c[0],c[1],c[2],r*1.05,r*.9,r);if(i<4){const n=seg[i+1][0],m=lerp3(c,n,.5),dd=nrm3(sub3(n,c));c9_along(k,'pelvis','ring','g',acid2,sub3(m,mul3(dd,.004)),dd,.01,r*.86,r*.82)}});
      const e=seg[4][0];c9_along(k,'pelvis','cone4','c',ed,add3(e,[0,-.02,-.04]),[0,-.6,-1],.11,.022)}
    // mantis scythes on the forearms: dark chitin blades with pale cutting edges, curving forward and down past the hands
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a1=J[A+'1'],a2=J[A+'2'],ad=nrm3(sub3(a2,a1)),root=lerp3(a1,a2,.55),o=[s,0,0],hit=cgRay(M,add3(root,mul3(o,.3)),mul3(o,-1),{arm:1})||root,
        R=[];let p=add3(hit,[-s*.012,0,0]),d=add3(ad,[0,0,.12]);for(let i=0;i<7;i++){const t=i/6,w=.034*(1-t*.82)+.004;R.push({p:p.slice(),rx:.009*(1-t*.6)+.002,f:w,b:w*.55,w:[[A+'1',1]]});
        p=add3(p,mul3(nrm3(d),.075));const c=Math.cos(-.17),sn=Math.sin(-.17);d=[d[0],d[1]*c-d[2]*sn,d[1]*sn+d[2]*c]}
      mdLoft(B,R,{seg:6,ref:[0,0,1],capB:true,col:m=>m.s>.8?bone:m.s<-.5?c3:c2});
      cgFingers(k,S,s,c3,'claw',1.2,0x0a080c,.03);
      // a spurred knee
      const L=s<0?'lh':'rh',K=J[L+'1'],kp=cgRay(M,[K[0],K[1]+.01,K[2]+.4],[0,0,-1],{leg:1});if(kp)c9_along(k,L+'1','cone4','c',ed,add3(kp,[0,0,-.012]),[0,.7,1],.085,.017);
      cgToes(k,S,s,c3,.025,bone)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1],.016,c2,{rim:.1});cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.04&&m.y>J[L+'2'][1]+.02,.016,c2,{rim:.1})})})})();

// ---------------- Gharial Reaver: a hulking crocodile-man — a big head with a long toothy snout and a nostril knob, scutes down
// the back, a pale plated belly, a long heavy tail, a hide harness, a necklace of teeth, a loincloth ----------------
const GHARIALHEAD=[[1.52,.066,.085,.062,.02],[1.536,.07,.15,.066,.03],[1.55,.07,.22,.07,.04],[1.562,.068,.28,.074,.05],[1.572,.066,.3,.076,.052],[1.582,.068,.28,.08,.05],
  [1.596,.074,.2,.086,.04],[1.61,.08,.14,.09,.03],[1.625,.082,.11,.092,.02],[1.64,.078,.09,.092,.012],[1.654,.066,.068,.08,.006],[1.664,.036,.036,.048,0]];
(function(){const S=cgHuman({h:.9,w:1.26,d:1.2,rw:[1.05,1.12,1.08,1.14,1.24,1.26,1.3,1.36],rf:[1,1.05,1.15,1.2,1.25,1.2,1.12,1.08],at:1.5,lt:1.45,hs:1.28,hw:1.08,nw:1.7,foot:1.15,footW:1.25,head:GHARIALHEAD,facePush:()=>0}),
    sk=c9_GH.sk,sk2=c9_GH.sk2,bel=c9_GH.belly,sc=c9_GH.scute,T=S.torso,J=S.J;
  cg181Reg('gharial',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{let d=0;if(n[1]>-.7&&z>-.03)d-=.009*Math.exp(-Math.pow((y-1.567)/.004,2));[-1,1].forEach(s=>{d+=.016*cgG(x,y,s*.052,1.634,.017,.009);d-=.005*cgG(x,y,s*.012,1.58,.005,.004)});return d}));
    const my=S.hp(0,1.567,0)[1];cgEmit(B,M,m=>{if(m.part=='head'){if(Math.abs(m.y-my)<.004*S.hs&&m.nz>-.3)return 0x140806;if(m.ny<-.3)return bel;return mdMix(sk,sk2,c9_cl((n3Sn(m.x,m.y,m.z,22,4)-.45)*2.4))}
      if(m.part=='torso'&&m.s>.45&&m.y<T[6][0]-.03&&m.y>T[0][0])return Math.round(m.y*30)%2?bel:mdSh(bel,.86);   // the pale belly plates
      return m.s<-.4?mdMix(sk2,sc,.4):mdMix(sk,sk2,c9_cl((n3Sn(m.x,m.y,m.z,14,4)-.45)*2.4))});
    // eyes on top of the head, slit pupils
    [-1,1].forEach(s=>{const q=S.hp(s*.052,1.638,.04),d=nrm3([s*.6,.3,.75]),p=cgRay(M,add3(q,mul3(d,.5)),mul3(d,-1),{head:1});if(p){k.p('head','sph','g',c9_GH.eye,p[0],p[1],p[2]-.003,.014,.012,.012);k.p('head','box','c',0x050403,p[0]+d[0]*.01,p[1],p[2]+d[2]*.01,.002,.016,.002)}});
    // teeth all along both jaws (upper ones down, lower ones up), interlocking
    {const z0=S.hp(0,1.567,.05)[2],z1=S.hp(0,1.567,.29)[2];for(let i=0;i<12;i++){const z=z0+(z1-z0)*i/11;[-1,1].forEach(s=>{const p=cgRay(M,[s*.4,my,z],[-s,0,0],{head:1});if(!p)return;
      const up=i%2;k.p('head','cone4','c',c9_GH.tooth,p[0]-s*.003,my+(up?.006:-.006),p[2],.0055,.022-(i>9?.006:0),.0055,up?0:Math.PI,0,s*.12)})}
      // the nostril knob on the snout's tip
      const p=cgRay(M,[0,my+.4,z1-.012],[0,-1,0],{head:1});if(p)k.p('head','sph','c',sk2,p[0],p[1]-.006,p[2],.034,.026,.03)}
    // bony scutes in rows down the back
    for(let i=0;i<9;i++){const y=T[6][0]-i*.065;[-1,1].forEach(s=>{const p=cgSurf(M,S,y,Math.PI+s*.3,-.006);c9_along(k,cgSurfBn(S,y),'cone4','c',sc,p,[s*.15,.5,-1],.05,.024,.032)})}
    // the long heavy tail, dragging toward the ground, scutes along its top
    {const t0=cgSurf(M,S,J.pelvis[1]-.03,Math.PI,-.05),W=[['pelvis',1]],y0=t0[1],TT=[t0,add3(t0,[0,-.16,-.2]),add3(t0,[0,-.32,-.44]),[t0[0]+.04,Math.max(.22,y0-.5),t0[2]-.72],[t0[0]+.1,.14,t0[2]-1.0],[t0[0]+.16,.1,t0[2]-1.26]];
      cgTube(B,TT,[.12,.105,.085,.062,.038,.012],TT.map(()=>W),m=>m.s<-.3?bel:sk,{seg:10,capB:true,ref:[0,1,0]});
      for(let i=1;i<5;i++){const r=[.105,.085,.062,.038][i-1];[-1,1].forEach(s=>c9_along(k,'pelvis','cone4','c',sc,add3(TT[i],[s*r*.4,r*.75,0]),[s*.2,1,-.3],.04,.016))}}
    // a loincloth and belt, a hide harness across the chest, a necklace of teeth
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.08,.04,.02,m=>a181Nz(c9_GH.cloth,m,.3,12),{n:5,keep:m=>Math.abs(m.c)<.5});cgBelt(B,M,T[2][0],.022,.03,0x2a1a10);
    {const y0=T[2][0]+.02,y1=T[6][0]+.01,kk=(y1-y0)/.34;cgShell(B,M,m=>m.part=='torso'&&m.y>y0-.02&&Math.abs((m.y-(y0+y1)/2)+kk*m.x)<.026*Math.sqrt(1+kk*kk),.02,m=>a181Nz(0x2a1a10,m,.3,18),{rim:.3});
      const b=cgSurf(M,S,(y0+y1)/2,-.12,.018);k.p('chest','tor','m',0x6a6a60,b[0],b[1],b[2],.022,.008,.022,Math.PI/2,0,0)}
    {const N=13,P2=c9_vine(B,M,S,Array.from({length:N},(_,i)=>{const t=i/(N-1),a=-1.35+t*2.7;return [T[6][0]+.02-.14*(1-Math.pow(a/1.35,2)),a]}),.007,0x5a3a20,i=>i==0||i==N-1?-.012:.004);
      for(let i=2;i<N-2;i++){const p=P2[i],a=-1.35+i/(N-1)*2.7;k.p(cgSurfBn(S,p[1]),'cone4','c',i==6?c9_GH.bone:c9_GH.tooth,p[0],p[1]-.026,p[2]-.002,.008,.05,.008,Math.PI+.25*Math.cos(a)*0,a,0)}}
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk2,s>0?'fist':'claw',1,0x1a1a10,.02);cgToes(k,S,s,sk2,.022)})})})();

// ---------------- Frost Wendigo: gaunt and tall, an elk's skull for a head, antlers, a mantle of dark fur, ribs jutting from flayed
// flanks, bony knees, long claws ----------------
const ELKHEAD=[[1.52,.05,.07,.06,.03],[1.535,.048,.1,.06,.05],[1.55,.046,.14,.062,.07],[1.563,.044,.17,.064,.08],[1.575,.046,.165,.068,.08],[1.59,.052,.14,.074,.07],[1.605,.06,.12,.08,.055],[1.62,.07,.1,.086,.04],[1.636,.074,.088,.09,.03],[1.652,.07,.074,.088,.02],[1.666,.058,.056,.074,.01],[1.676,.03,.03,.04,0]];
(function(){const S=cgHuman({h:.84,w:.9,d:.88,rw:[.9,.92,.8,.88,.95,.95,.98,.95],at:.8,lt:.84,hs:1.08,head:ELKHEAD,facePush:()=>0,armL:1.22,legL:1.04}),fur=c9_WD.fur,fur2=c9_WD.fur2,sk=c9_WD.skin,bone=c9_WD.bone,bl=c9_WD.blood,T=S.torso,J=S.J;
  cg181Reg('wendigo',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.05?0:.03*cgG(x,y,0,1.575,.03,.03)));
    // jutting ribs: raised ridges round the chest and flanks, sloping down to the sides, the sternum between them
    const ch=J.chest[1],RY=[0,1,2,3,4,5].map(i=>ch+.03-i*.042);
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]<-.35||Math.abs(x)<.018)return 0;const yy=y+Math.abs(x)*.45;let d=0;RY.forEach((r,i)=>{d+=.0085*(1-i*.08)*Math.exp(-Math.pow((yy-r)/.0075,2))});return d*Math.min(1,(Math.abs(x)-.018)/.02)});
    // the head is an elk's skull: bone all over, deep black sockets, the nasal cavity, a row of teeth; great branching antlers
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{let d=0;[-1,1].forEach(s=>{d-=.018*cgG(x,y,s*.045,1.625,.014,.012);d+=.008*cgG(x,y,s*.055,1.64,.016,.006)});if(n[2]>.2)d-=.012*cgG(x,y,0,1.578,.012,.02);return d}));
    const ny=S.hp(0,1.578,0)[1],ey=S.hp(0,1.625,0)[1],rib=m=>{if(m.part!='torso'||m.s<-.35||Math.abs(m.x)<.018)return 0;const yy=m.y+Math.abs(m.x)*.45;let v=0;RY.forEach(r=>v=Math.max(v,Math.exp(-Math.pow((yy-r)/.008,2))));return v};
    cgEmit(B,M,m=>{if(m.part=='head'){const bx=m.x/S.hs;if(m.nz>.1&&Math.abs(Math.abs(bx)-.045)<.016&&Math.abs(m.y-ey)<.013*S.hs)return 0x080606;if(m.nz>.4&&Math.abs(bx)<.012&&Math.abs(m.y-ny)<.02*S.hs)return 0x080606;return a181Nz(bone,m,.25,22)}
      const rv=rib(m);if(rv>.35)return mdMix(sk,c9_WD.bone2,c9_cl(rv*1.1));
      return m.part=='torso'&&Math.abs(m.c)>.75&&m.y<J.chest[1]&&n3Sn(m.x,m.y,m.z,9,2)>.5?bl:m.part=='torso'&&m.s>-.35&&m.y<ch+.05&&m.y>RY[5]-.03?mdSh(sk,.82):a181Nz(sk,m,.2,16)});
    cgEyes(k,M,S,c9_WD.eye,.045,1.625,.75,-.006);for(let i=0;i<6;i++)cgTeeth(k,M,S,[[(i-2.5)*.008,1.556,.012,0]],0xe8e0d0);
    [-1,1].forEach(s=>{let p=S.hp(s*.05,1.67,-.02),d=[s*.55,.8,-.25];for(let j=0;j<6;j++){const n=add3(p,mul3(d,.085));k.L('head','c',j<2?0xb8b0a0:bone,p,n,.018-j*.0025,.015-j*.0025,5);if(j>=1&&j<=4){const t=add3(n,[s*.03,.07+j*.01,.05-j*.015]);k.L('head','c',bone,n,t,.011-j*.0015,.002,4)}p=n;d=[d[0]*1.08,d[1]-.12,d[2]-.08]}});
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]+.03&&m.s<.5)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR0[1]-.12),{off:.035,len:.18,col:fur,col2:fur2,seed:131,jag:.6});
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.1,.05,.016,m=>a181Nz(fur2,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*5)%2==0});
    // bony knee caps
    [-1,1].forEach(s=>{const L=s<0?'lh':'rh',K=J[L+'1'],p=cgRay(M,[K[0],K[1]+.01,K[2]+.4],[0,0,-1],{leg:1});if(p){k.p(L+'1','sph','c',c9_WD.bone2,p[0],p[1]+.004,p[2]-.012,.034,.038,.026);k.p(L+'1','sph','c',bone,p[0],p[1]+.012,p[2]-.004,.022,.02,.016)}});
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk,'claw',1.5,c9_WD.claw,.06);cgToes(k,S,s,sk,.03,c9_WD.claw)})})})();
