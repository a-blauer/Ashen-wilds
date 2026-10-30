// ================= v181: brutes on cage bodies (batch 2) =================
// Orc Raider, Frost Troll, Troll Rimecaller, Storm Giant, Amalgam, Akorror — each keeps its look, rebuilt on the cage body.
// (v181 restore) The first cage pass came out tall and thin and lost what made each one itself; this pass brings back the old
// bulk and height (short legs, broad shoulders, thick arms, deep chests) and every signature piece of the old models (v94 orc /
// giant, v137 trolls, v113 Amalgam and Akorror): the orc's topknot, tusks and fur-cuffed boots; the trolls' crest, spine hair,
// forearm tufts, bracers, frost plates and skull string; the Amalgam's swallowed earth, skull, twigs, bubbles and goo fists;
// the Akorror's olive-black chitin, green compound eyes, mandibles, talons, scythes and acid.
// Own helpers are named b7_… (copies of the face helpers, so this file does not lean on another batch's file).
function b7_FaceHuman(o){o=o||{};const nz=o.nose||1,br=o.brow||1,ch=o.cheek||1;return (x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;
  d+=.02*nz*cgG(x,y,0,1.597,.01*(o.nw||1),.013)+.012*nz*cgG(x,y,0,1.615,.008*(o.nw||1),.012);
  [-1,1].forEach(s=>{d-=.013*cgG(x,y,s*.036,1.629,.016,.01);d+=.007*ch*cgG(x,y,s*.056,1.602,.014,.01);d-=(o.hollow||.004)*cgG(x,y,s*.047,1.568,.016,.014);d+=.003*cgG(x,y,s*.01,1.587,.006,.004)});
  d+=.009*br*cgG(x,y,0,1.648,.05,.006);d-=.004*cgG(x,y,0,1.558,.02,.003);d+=.009*(o.chin||1)*cgG(x,y,0,1.538,.018,.012);return d*f}}
function b7_FacePaint(S,m,skin,o){o=o||{};if(m.part=='head'&&m.s>.3){const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-(o.ex||.036))<.02&&Math.abs(m.y-S.hp(0,o.ey||1.629,0)[1])<.012*S.hs)return o.sock==null?mdSh(skin,.45):o.sock;
  if(Math.abs(m.y-S.hp(0,o.my||1.557,0)[1])<.0042*S.hs&&Math.abs(bx)<(o.mw||.026))return o.lip==null?0x2a1210:o.lip}return null}
function cgFaceTroll(o){o=o||{};return (x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
  d+=.05*(o.nose||1)*cgG(x,y,0,1.582,.016,.02)+.025*(o.nose||1)*cgG(x,y,0,1.608,.012,.014);                      // a long, drooping nose
  [-1,1].forEach(s=>{d-=.018*cgG(x,y,s*.04,1.63,.015,.01);d+=.006*cgG(x,y,s*.062,1.6,.016,.012)});d+=.022*cgG(x,y,0,1.65,.06,.009);  // small deep eyes under a heavy brow
  d-=.007*cgG(x,y,0,1.553,.04,.004);d+=.014*(o.jaw||1)*cgG(x,y,0,1.535,.04,.016);return d*f}}
const BRUTEJAW=(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);return (i>=1&&i<=4&&sa>-.2&&side>.5)?.012:0};
function cgBruteBody(B,k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(o.face||b7_FaceHuman({nose:1.2,nw:1.5,brow:1.8,chin:1.4,cheek:1.3})));
  if(o.sculpt)o.sculpt(M);
  M.b7col=m=>(o.paint&&o.paint(m))||b7_FacePaint(S,m,K.sk,{sock:mdSh(K.sk,.35),mw:.032})||(m.s<-.4?mdSh(K.sk,.82):a181Nz(K.sk,m,.22,16));M.b7hide=[];
  cgEyes(k,M,S,K.eye,o.ex||.038,1.629,o.er||.9,-.002);if(o.tusks)b7_Tusks(k,M,S,.034,1.552,o.tusks,o.tr||.012,0xe8e0c8);
  if(o.ears)cgEars(k,M,S,K.sk,1.625,o.ears,.3,.5,.024);
  [-1,1].forEach(s=>{if(!o.noHands)cgFingers(k,S,s,K.hand||K.sk,K.fist&&K.fist(s)?'fist':'claw',o.fl||1,K.claw||mdSh(K.sk,.5),K.fist&&K.fist(s)?0:(o.tip||.02));if(!o.boots)cgToes(k,S,s,mdSh(K.sk,.85),o.toe||.015,K.claw)});return M}
// ---------------- small helpers ----------------
// a shell (clothes, armour) whose rim lies on the skin; the skin under it is not drawn (b7_Body draws the rest of the body
// at the end), so a covered body costs no extra triangles
function b7_Sh(B,M,sel,off,col,o){o=Object.assign({},o||{},{rim:0});cgShell(B,M,sel,off,col,o);(M.b7hide||(M.b7hide=[])).push(sel)}
function b7_Body(B,M){const H=M.b7hide||[];cgEmit(B,M,M.b7col,{keep:m=>!H.some(f=>f(m))})}
// the torso bone at height y
function b7_TB(S,y){return y>S.J.chest[1]-.04?'chest':y>S.J.spine[1]?'spine':'pelvis'}
// a point on the face (base head coordinates x, y), found by a ray from the front
function b7_Face(M,S,x,y){const q=S.hp(x,y,0);return cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1})}
// a point on the top of the head (base x, z), found by a ray from above
function b7_Top(M,S,x,z){const q=S.hp(x,1.7,z);return cgRay(M,[q[0],q[1]+.4,q[2]],[0,-1,0],{head:1})}
// big tusks jutting up from the lower jaw, their roots inside the lip
function b7_Tusks(k,M,S,x,y,len,r,col){[-1,1].forEach(s=>{const p=b7_Face(M,S,s*x,y);if(!p)return;const a=[p[0]-s*.002*S.hs,p[1]-.008*S.hs,p[2]-.01*S.hs],
  b=[p[0]+s*len*.2*S.hs,p[1]+len*.95*S.hs,p[2]+len*.15*S.hs];k.L('head','c',col,a,b,r*S.hs,.0025,5)})}
// a fan of spikes across the crown, swept back (the trolls' crest)
function b7_Crest(k,M,S,col,col2,n,len,r){const mid=(n-1)/2;for(let i=0;i<n;i++){const x=(i-mid)*.024,z=-.012-Math.abs(i-mid)*.006,p=b7_Top(M,S,x,z);if(!p)continue;
  const L=len*(1-Math.abs(i-mid)/(mid+1)*.4)*S.hs,a=[p[0],p[1]-.014*S.hs,p[2]+.004],b=[p[0]+(i-mid)*.2*L,p[1]+L*.5,p[2]-L*.86];k.L('head','c',i%2?col2:col,a,b,r*S.hs,.002,4)}}
// spikes / strands of hair down the middle of the back, rooted in the skin
function b7_Spine(k,M,S,y0,n,dy,len,col,col2,r){for(let i=0;i<n;i++){const y=y0-i*dy,p=cgSurf(M,S,y,Math.PI,-.014);const L=len*(1-i/n*.35);
  k.L(b7_TB(S,y),'c',i%2?col2:col,p,[p[0]+(i%2?.008:-.008),p[1]-L*.75,p[2]-L*.7],r,.003,4)}}
// a forearm frame: elbow, wrist, the hand's down direction, outward and forward axes
function b7_Arm(S,s){const A=s<0?'aL':'aR',a1=S.J[A+'1'],a2=S.J[A+'2'],d=nrm3(sub3(a2,a1)),u=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),f=nrm3(cross3(d,u)),fw=f[2]<0?mul3(f,-1):f;return {A,a1,a2,d,u,f:fw}}

// ---------------- Orc Raider ----------------
// stocky and broad: a big green brawler with a black topknot, red eyes, big tusks, spiked pauldrons, crossed straps, a
// loincloth over leather trousers, leather bracers, a bone necklace and pelt boots with white fur cuffs
(function(){const S=cgHuman({h:.9,w:1.26,d:1.18,rw:[1.06,1.12,1.1,1.2,1.3,1.32,1.4,1.48],rf:[1,1.06,1.2,1.28,1.32,1.22,1.14,1.12],at:1.6,lt:1.45,hs:1.08,hw:1.14,hd:1.04,legL:.84,armL:.98,nw:1.55,foot:1.08,footW:1.3,facePush:BRUTEJAW}),
    K={sk:0x56643e,eye:0xff3a1a,fist:s=>s>0},lt=0x3a2618,pants=0x4a3a2a,T=S.torso,J=S.J;
  cg181Reg('orc',S,function(B,P,k,C){const wy=T[2][0],sh=T[6][0],hy=T[1][0],kn=J.rh1[1];
    const M=cgBruteBody(B,k,C,S,K,{tusks:.048,tr:.017,ears:.06,boots:1,er:1.15,face:b7_FaceHuman({nose:1.3,nw:1.6,brow:2.2,chin:1.5,cheek:1.4}),
      paint:m=>m.part=='leg'||m.part=='foot'||(m.part=='torso'&&m.y<hy)?pants:null});
    // black hair: a cap over the crown and the back of the head, a topknot tied on the crown, its tail falling down the back
    cgHair(B,M,S,{col:0x141010,line:1.676,thick:.016,side:.02});
    {const p=b7_Top(M,S,0,-.035);if(p){const a=[p[0],p[1]-.01,p[2]],b=[p[0],p[1]+.05*S.hs,p[2]-.02*S.hs];k.L('head','c',0x1e1614,a,b,.024*S.hs,.016*S.hs,6);
      k.p('head','sph','c',0x141010,b[0],b[1],b[2],.026*S.hs,.022*S.hs,.026*S.hs);
      const c=[b[0],b[1]+.004,b[2]-.03*S.hs],e=[b[0],b[1]-.08*S.hs,b[2]-.09*S.hs],f=[b[0],b[1]-.17*S.hs,b[2]-.1*S.hs];k.L('head','c',0x141010,[b[0],b[1],b[2]-.01],c,.016*S.hs,.016*S.hs,5);k.L('head','c',0x141010,c,e,.016*S.hs,.012*S.hs,5);k.L('head','c',0x1e1614,e,f,.012*S.hs,.003,5)}}
    // crossed straps over the bare chest and back
    [-1,1].forEach(s=>{const p0=cgSurf(M,S,sh-.02,s*.5,.01),p1=cgSurf(M,S,wy+.02,-s*.6,.02),p2=cgSurf(M,S,sh-.04,Math.PI-s*.5,.01),p3=cgSurf(M,S,wy+.02,Math.PI+s*.6,.02);
      cgTube(B,[p0,lerp3(p0,p1,.5),p1],[.016,.016,.016],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:6});cgTube(B,[p2,lerp3(p2,p3,.5),p3],[.016,.016,.016],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:6})});
    // leather trousers, a loincloth (front and back flaps) under a belt
    b7_Sh(B,M,m=>(m.part=='leg'&&m.y>kn-.1)||(m.part=='torso'&&m.y<hy+.01),.01,m=>a181Nz(pants,m,.25,10));
    cgSkirt(B,S,wy-.02,kn+.06,.04,.024,m=>m.y<kn+.11?0x2a1d14:a181Nz(pants,m,.25,10),{n:5,keep:m=>Math.abs(m.c)<.4});
    cgBelt(B,M,wy,.024,.034,lt);{const bk=cgSurf(M,S,wy,0,.036);k.p('pelvis','box','m',0x6a6a70,bk[0],bk[1],bk[2]-.004,.05,.04,.012)}
    // spiked pauldrons on both shoulders, leather bracers
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];k.p(A+'0','hem','m',0x5a4630,a[0]+s*.03,a[1]+.02,a[2],.125,.09,.125,0,0,s*.4);
      for(let i=0;i<2;i++)k.L(A+'0','m',0x8a8a90,[a[0]+s*(.05+i*.035),a[1]+.06,a[2]-.025+i*.05],[a[0]+s*(.1+i*.035),a[1]+.18,a[2]-.025+i*.05],.02,.002,5);
      b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.016,m=>Math.round(m.y*40)%2?0x4a3420:0x5a4430);
      // pelt boots to mid-shin, a thick white fur cuff round the top
      const by=J.rh2[1]+(kn-J.rh2[1])*.5;
      b7_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<by))&&Math.sign(m.x)==s,.024,m=>a181Nz(0x3a2a1c,m,.3,16));
      cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<by+.03&&m.y>by-.02,{off:.04,len:.05,col:0xd8d2c2,col2:0xb4ac9a,seed:82+s,jag:.45,lump:[.6,.9]})});
    // a necklace of fangs and black beads
    for(let i=0;i<9;i++){const p=cgSurf(M,S,sh-.03-Math.abs(i-4)*.014,(i-4)*.2,.006);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x2a2a2a,p[0],p[1]-.012,p[2],.013,i%2?.045:.013,.011,Math.PI)}
    b7_Body(B,M)})})();
ST179.orc={sx:.2,hx:-.18,lk:.24,rk:.24,az:.1,lz:-.1,ex:-.2,le:-.25};

// ---------------- Frost Troll / Troll Rimecaller ----------------
// hulking and stooped, long thick arms; a fan crest of white spikes on the crown, white hair down the spine and on the
// forearms, warts, a long nose and big tusks, frost plates and icicles on the shoulders, a string of skulls at the hip.
// The Troll: grey shorts and loincloth, pale bracers, a bead necklace. The Rimecaller: a frost-trimmed robe, a crystal on the
// chest, curling horns.
['troll','trollsh'].forEach(key=>{const sh=key=='trollsh';
  const S=cgHuman({h:.86,w:1.34,d:1.22,rw:[1.1,1.18,1.3,1.32,1.36,1.38,1.46,1.56],rf:[1,1.1,1.36,1.38,1.36,1.24,1.15,1.14],rb:[1.05,1.12,1.15,1.26,1.38,1.46,1.55,1.66],
    at:sh?1.58:1.8,lt:sh?1.4:1.55,hs:1.08,hw:1.08,hd:1.1,armL:sh?1.15:1.26,legL:sh?.9:.84,nw:1.6,foot:1.2,footW:1.35,facePush:BRUTEJAW});
  const K={sk:sh?0x5c6e82:0x627888,eye:0x6ad8ff,fist:s=>s>0,claw:0x2a2a30},hair=0xd8e8f0,hair2=0xb0c0cc,frost=0xc8f0ff,T=S.torso,J=S.J;
  cg181Reg(key,S,function(B,P,k,C){const wy=T[2][0],shy=T[6][0],hy=T[1][0],kn=J.rh1[1];
    const M=cgBruteBody(B,k,C,S,K,{face:cgFaceTroll({nose:1.2}),tusks:.055,tr:.018,ears:.085,fl:1.2,tip:.035,toe:.022,
      paint:sh?null:m=>(m.part=='leg'&&m.y>kn+.03)||(m.part=='torso'&&m.y<hy)?0x5a5e66:null});
    // warts
    for(let i=0;i<16;i++){const y=wy+a181H(i,2)*(shy-wy),a=(a181H(i,7)-.5)*6.2;if(sh&&y<shy-.05)continue;const p=cgSurf(M,S,y,a,0);k.p(b7_TB(S,y),'sph','c',mdSh(K.sk,.8),p[0],p[1],p[2],.015,.013,.013)}
    // the crest: a fan of white spikes across the crown; white hair down the spine
    b7_Crest(k,M,S,hair,hair2,7,.11,.022);
    b7_Spine(k,M,S,shy-.02,7,.065,.11,hair,hair2,.03);
    // frost plates crusted over the shoulders (seated in the skin), icicles hanging from their edge
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];
      for(let i=0;i<4;i++){const x=a[0]+s*(-.02+i*.03),z=a[2]+(i-1.5)*.04,p=cgRay(M,[x,a[1]+.5,z],[0,-1,0],{arm:1,torso:1});if(!p)continue;
        k.p(A+'0','dod','c',i%2?frost:0xe8f8ff,p[0],p[1]-.006,p[2],.04,.024,.04,i,i*.6,0)}
      for(let i=0;i<3;i++){const z=a[2]+(i-1)*.04,p=cgRay(M,[a[0]+s*.5,a[1]-.015,z],[-s,0,0],{arm:1});if(!p)continue;k.L(A+'0','g',frost,[p[0]-s*.008,p[1]+.004,p[2]],[p[0]+s*.004,p[1]-.07-i%2*.02,p[2]],.011,.002,4)}
      const F=b7_Arm(S,s);
      if(!sh){// pale bracers on the forearms, hair tufts above them
        b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<F.a1[1]-(F.a1[1]-F.a2[1])*.45&&m.y>F.a2[1]-.005,.018,m=>Math.round(m.y*36)%3?0xd8dce4:0xb8bcc4);
        [.12,.3].forEach((t,j)=>cgLimbTufts(k,M,F.a1,F.a2,t,5,.065,hair,hair2,A+'1',{r:.022,parts:{arm:1}}))}
      else cgLimbTufts(k,M,F.a1,F.a2,.74,4,.06,hair,hair2,A+'1',{r:.018,parts:{arm:1}})});
    // a string of skulls and bones at the hip
    {const y=hy-.01;for(let i=0;i<5;i++){const a=-1.5+i*.26,p=cgSurf(M,S,y-(i%2?.01:0),a,sh?.03:.022),bn='pelvis';
      if(i%2){const q=sh?add3(p,[0,-.02,0]):cgSurf(M,S,y-.02,a,.004);k.p(bn,'box','c',0xd8d0b0,q[0],q[1],q[2],.016,.06,.016,0,a,.3)}
      else{k.p(bn,'sph','c',0xd8d0b0,p[0],p[1]-.03,p[2],.03,.033,.03);const q=add3(p,[Math.sin(a)*.026,-.03,Math.cos(a)*.026]);[-1,1].forEach(e=>k.p(bn,'sph','c',0x1a1814,q[0]+Math.cos(a)*e*.011,q[1]+.006,q[2]-Math.sin(a)*e*.011,.008,.008,.006))}}
      const p0=cgSurf(M,S,y+.01,-1.6,0),p1=cgSurf(M,S,y+.01,-.4,0);cgTube(B,[p0,lerp3(p0,p1,.5),p1].map(p=>p),[.006,.006,.006],[[['pelvis',1]],[['pelvis',1]],[['pelvis',1]]],0x3a2a1a,{seg:5})}
    if(!sh){// grey shorts (painted), a loincloth front and back, a belt, a necklace of bone and beads
      cgSkirt(B,S,wy-.02,kn+.1,.04,.024,m=>m.y<kn+.15?0x4a4e54:a181Nz(0x6a6e72,m,.25,10),{n:5,keep:m=>Math.abs(m.c)<.4});cgBelt(B,M,wy,.022,.03,0x2a2a2e);
      for(let i=0;i<9;i++){const p=cgSurf(M,S,shy-.03-Math.abs(i-4)*.014,(i-4)*.2,.006);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x8a9aa8,p[0],p[1]-.012,p[2],.013,i%2?.045:.013,.011,Math.PI)}}
    else{// the robe: body and sleeves, frost trim at the neck, cuffs and hem; a sash; the crystal on the chest; horns
      const tr=0x9ad8ff,rb=0x26344e;
      b7_Sh(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.04),.018,m=>(m.part=='torso'&&m.s>.3&&Math.abs(m.x)<.014)||(m.part=='arm'&&m.y<J.aR2[1]+.075)?tr:a181Nz(rb,m,.25,10));
      cgSkirt(B,S,wy-.02,J.lh2[1]+.12,.13,.026,m=>m.y<J.lh2[1]+.17?tr:Math.abs(Math.atan2(m.c,m.s))<.12?tr:a181Nz(0x1e2a40,m,.25,10),{n:6});
      cgBelt(B,M,wy,.02,.05,0x1a2238);
      const g=cgSurf(M,S,J.chest[1]+.03,0,.024);k.p('chest','oct','g',tr,g[0],g[1],g[2],.032,.05,.016);[-1,1].forEach(s=>k.p('chest','cone4','g',frost,g[0]+s*.03,g[1]+.005,g[2]-.004,.009,.04,.006,0,0,-s*1.2));
      [-1,1].forEach(s=>{const q=S.hp(s*.075,1.69,-.02);let p=q;[[s*.07,.05,-.03],[s*.04,.07,-.04],[-s*.005,.06,-.03]].forEach((d,j)=>{const n=add3(p,mul3(d,S.hs));k.L('head','c',j<2?0x8a8270:0x6a6250,p,n,(.026-j*.007)*S.hs,(.019-j*.007)*S.hs,5);p=n})})}
    b7_Body(B,M)})});
ST179.troll={sx:.32,hx:-.3,lk:.27,rk:.27,az:.12,lz:-.12,ax:-.12,lx:-.15,ex:-.3,le:-.35};ST179.trollsh={sx:.24,hx:-.22,lk:.2,rk:.2,lz:-.08,le:-.25};

// ---------------- Storm Giant ----------------
// broad and massive: a white beard and mane, a glowing circlet, blue runes on the bare chest, a fur mantle, rune bracers,
// a leather kilt and pelt boots with white fur cuffs
(function(){const S=cgHuman({h:.92,w:1.28,d:1.16,rw:[1.08,1.14,1.12,1.18,1.3,1.32,1.4,1.48],rf:[1,1.06,1.16,1.24,1.3,1.22,1.14,1.12],at:1.66,lt:1.48,hs:.98,legL:.92,nw:1.55,foot:1.1,footW:1.3,facePush:BRUTEJAW}),
    K={sk:0x6a7a92,eye:0x6ac8ff,fist:s=>s>0},glow=0x6ac8ff,bd=0xc8e0f0,T=S.torso,J=S.J;
  cg181Reg('giant',S,function(B,P,k,C){const M=cgBruteBody(B,k,C,S,K,{boots:1,face:b7_FaceHuman({nose:1.3,nw:1.4,brow:1.6,chin:1.2,cheek:1.2})}),wy=T[2][0];
    cgFur(B,M,m=>m.part=='head'&&m.s>-.15&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-S.hp(0,1.557,0)[1])<.008*S.hs),{off:.018,len:.09,col:bd,col2:0xa8b8c8,seed:101,jag:.4,lump:[.6,1.1]});
    cgHair(B,M,S,{col:bd,line:1.69,neck:true,thick:.018,side:.15});cgShell(B,M,m=>m.part=='head'&&Math.abs(m.y-S.hp(0,1.676,0)[1])<.008*S.hs,.03,glow,{t:'g',rim:.5});
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]+.04)||(m.part=='arm'&&m.y>J.aR0[1]-.1),{off:.045,len:.14,col:0x6a5e4e,col2:0x4a4030,seed:102,jag:.55});
    // three blue runes on the chest, below the beard and the mantle
    [[-.055,0],[0,-.03],[.055,0]].forEach(([x,dy],i)=>{const y=J.chest[1]-.03+dy,p=cgSurf(M,S,y,x*5,-.001);k.p(b7_TB(S,y),'box','g',glow,p[0],p[1],p[2],.014,.11,.006,0,x*5,(i-1)*.5)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>J[A+'2'][1]+.02,.022,m=>Math.round(m.y*30)%2?0x5a6070:0x4a5060,{t:'m'});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'1'][1]+J[A+'2'][1])/2)<.012,.028,glow,{t:'g',rim:.79});   // rim on the bracer's surface
      const by=J.rh2[1]+(J.rh1[1]-J.rh2[1])*.5;
      b7_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<by))&&Math.sign(m.x)==s,.026,m=>a181Nz(0x3a3026,m,.3,16));
      cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<by+.03&&m.y>by-.02,{off:.042,len:.06,col:0xd8d4cc,col2:0xb4b0a6,seed:103+s,jag:.45,lump:[.6,.9]})});
    b7_Sh(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.01,m=>a181Nz(0x5a5040,m,.25,10));
    cgSkirt(B,S,wy-.02,J.lh1[1]+.06,.06,.022,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*6)%2?0x6a5e4e:0x4a4030,m,.3,12),{n:5});cgBelt(B,M,wy,.024,.03,0x3a2a1a);b7_Body(B,M)})})();
ST179.giant={sx:.12,hx:-.1,lk:.14,rk:.14,lz:-.1,le:-.2};

// ---------------- Amalgam: a lumpy heap of goo in a man's shape ----------------
// mottled brown and green goo full of what it swallowed: clods and stones, a skull and ribs in the belly, twigs and roots,
// glowing bubbles; a hump over the shoulders, a sagging belly, three mismatched slit-pupilled eyes, a maw of crooked teeth,
// drips off the chin and arms, lumpy three-fingered fists, feet spread into a dirty puddle
(function(){const S=cgHuman({h:.9,w:1.42,d:1.5,rw:[1.25,1.35,1.6,1.65,1.5,1.45,1.5,1.7],rf:[1.3,1.6,2.2,2.0,1.5,1.25,1.15,1.3],at:2.1,lt:2.3,hs:1.12,hw:1.2,hy:.82,hd:1.1,nw:1.9,neckL:-.03,legL:.82,foot:1.25,footW:1.55,facePush:BRUTEJAW});
  const C0={g1:0x3e5a28,g2:0x22341a,g3:0x5a7a34,dirt:0x4e3a26,dirt2:0x6a5236,glow:0xc8ff5a,bone:0xb8ae8c,bone2:0x8a8068,bark:0x3a2a1a},T=S.torso,J=S.J;
  cg181Reg('amalgam',S,function(B,P,k,C){const M=C.M,c=C0,sh=T[6][0],wy=T[2][0],hy=T[1][0],ch=J.chest[1],sp=J.spine[1];
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1},(x,y,z,n)=>.045*(n3Sn(x*1.1,y*1.1,z*1.1,7,5)-.45));   // lumps and sags all over
    // a hump of goo over the shoulders and the back, a sagging belly
    cgSculpt(M,{torso:1,neck:1},(x,y,z,n)=>{let d=0;if(n[2]<0)d+=.1*cgG(x,y,0,sh-.04,.18,.1)*Math.min(1,-n[2]*1.5);if(n[2]>0)d+=.03*cgG(x,y,0,wy-.01,.12,.06)*n[2];return d});
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.1?0:(-.02*cgG(x,y,0,1.56,.05,.012)+.01*cgG(x,y,0,1.6,.06,.03))));
    // smooth mottled colour: green goo blending into darker goo, patches of brown earth, the back and limbs darker
    const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),goo=m=>{const n=n3Sn(m.x,m.y,m.z,11,1),n2=n3Sn(m.x,m.y,m.z,5,3);
      let col=mdMix(c.g1,c.g2,cl(.3+(n2-.5)*1.1+(m.s<-.3?.25:0),0,.85));col=mdMix(col,c.g3,cl((.3-n)*4,0,1)*.55);
      const e=cl((n-.6)*3.5,0,1);if(e>0)col=mdMix(col,n2>.5?c.dirt:c.dirt2,e);
      if(m.part=='hand')col=mdMix(c.g2,col,.3);if((m.part=='leg'&&m.y<J.rh2[1]+.12)||m.part=='foot')col=mdMix(col,c.dirt,.45);return col};
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.5&&Math.abs(m.y-S.hp(0,1.556,0)[1])<.011*S.hs&&Math.abs(m.x)<.065*S.hs)return 0x0a1404;return goo(m)});
    // three mismatched eyes sunk in the goo: a dark socket, the glowing eye, a black slit pupil
    [[-.05,1.629,.026],[.054,1.643,.021],[.002,1.674,.014]].forEach(([x,y,r])=>{const p=b7_Face(M,S,x,y);if(!p)return;const R=r*S.hs;
      k.p('head','sph','c',0x081004,p[0],p[1],p[2]-R*.55,R*1.45,R*1.2,R);k.p('head','sph','g',c.glow,p[0],p[1],p[2]-R*.12,R,R*.82,R*.6);k.p('head','box','c',0x000000,p[0],p[1],p[2]+R*.42,R*.2,R*1.25,R*.14)});
    // the maw: crooked upper teeth, a few lower ones, a sagging lower lip; drips off the chin
    for(let i=0;i<9;i++){const p=b7_Face(M,S,-.06+i*.015,1.566);if(p)k.p('head','cone4','c',0xc8c0a0,p[0],p[1]-.004,p[2]-.006,.0055*S.hs,(.022+((i*5)%3)*.009)*S.hs,.0055*S.hs,Math.PI,0,(i-4)*.06)}
    for(let i=0;i<4;i++){const p=b7_Face(M,S,-.042+i*.028,1.546);if(p)k.p('head','cone4','c',0xb8b090,p[0],p[1]+.004,p[2]-.006,.005*S.hs,.02*S.hs,.005*S.hs,0,0,(i-1.5)*.08)}
    for(let i=0;i<4;i++){const p=b7_Face(M,S,-.045+i*.03,1.534);if(p)k.L('head','c',c.g2,[p[0],p[1]+.006,p[2]-.012],[p[0]+.004,p[1]-.05-(i%2)*.03,p[2]+.002],.016,.003,4)}
    // goo blobs on the shoulders and the upper arms, clods of earth on the shoulders with a stone
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],p=cgRay(M,[a[0]+s*.02,a[1]+.5,a[2]],[0,-1,0],{arm:1,torso:1});if(!p)return;
      k.p(A+'0','sph2','c',c.g1,p[0],p[1]-.03,p[2],.1,.075,.1);k.p(A+'0','dod','c',c.dirt,p[0]+s*.04,p[1]+.02,p[2]-.015,.075,.055,.07,.3,0,s*.4);k.p(A+'0','dod','c',0x6a6a5a,p[0]+s*.0,p[1]+.045,p[2]+.04,.03,.028,.03,1,1,0)});
    // the earth it has swallowed: clods half sunk all over the body
    [[sh-.02,.9,.06],[sh-.02,-.9,.06],[ch,2.6,.08],[sp+.02,3.2,.07],[wy,-2.5,.06],[sp-.02,.5,.05],[ch+.03,.2,.045],[hy+.02,-.3,.05]].forEach(([y,a,r],i)=>{const p=cgSurf(M,S,y,a,-r*.35);
      k.p(b7_TB(S,y),'dod','c',i%2?c.dirt:c.dirt2,p[0],p[1],p[2],r,r*.8,r*.9,i,i*.7,0)});
    // a skull and ribs half swallowed in the belly
    {const y=sp+.01,a=.18,p=cgSurf(M,S,y,a,-.035),n=[Math.sin(a),0,Math.cos(a)],ex=[Math.cos(a),0,-Math.sin(a)];k.p('spine','sph','c',c.bone,p[0],p[1],p[2],.07,.066,.066);
      [-1,1].forEach(e=>{const q=add3(add3(p,mul3(n,.056)),add3(mul3(ex,e*.024),[0,.012,0]));k.p('spine','sph','c',0x101008,q[0],q[1],q[2],.019,.019,.014)});
      {const q=add3(add3(p,mul3(n,.064)),[0,-.014,0]);k.p('spine','cone4','c',0x101008,q[0],q[1],q[2],.008,.018,.008,Math.PI)}
      k.p('spine','box','c',c.bone2,p[0]+n[0]*.03,p[1]-.055,p[2]+n[2]*.03,.05,.025,.04,0,a,0);
      for(let i=0;i<4;i++){const a2=-.42+i*.15,q=cgSurf(M,S,sp+.1,a2,-.005),r=cgSurf(M,S,sp+.05,a2+.08,-.005),m=add3(lerp3(q,r,.5),[Math.sin(a2)*.008,0,Math.cos(a2)*.008]);k.L('spine','c',c.bone2,q,m,.009,.008,4);k.L('spine','c',c.bone2,m,r,.008,.006,4)}}
    // twigs and roots poking out every which way (rooted inside the goo), a forked one now and then
    [[sh-.04,.4,[.08,.14,.06]],[ch,2.8,[-.1,.16,-.12]],[sp+.04,3.4,[.1,.12,-.14]],[sp,1.6,[.14,.08,0]],[wy,-1.7,[-.14,.1,.02]],[sh-.02,-2.6,[-.06,.2,-.1]],[hy+.02,2.2,[.1,-.02,-.12]],[ch-.02,-.6,[-.06,.1,.12]]].forEach(([y,a,d],i)=>{
      const p=cgSurf(M,S,y,a,-.03),bn=b7_TB(S,y),e=add3(p,d);k.L(bn,'c',c.bark,p,e,.013,.004,4);if(i%2){const m=lerp3(p,e,.6);k.L(bn,'c',c.bark,m,add3(m,[.05,.04,-.02]),.007,.002,3)}});
    [-1,1].forEach(s=>{const F=b7_Arm(S,s),A=F.A,a0=J[A+'0'];
      {const q=lerp3(a0,F.a1,.4),p=cgRay(M,add3(q,[s*.4,0,0]),[-s,0,0],{arm:1});if(p)k.L(A+'0','c',c.bark,add3(p,[-s*.02,0,0]),add3(p,[s*.12,.08,-.08]),.011,.003,4)}
      {const q=lerp3(F.a1,F.a2,.5),p=cgRay(M,add3(q,mul3(F.u,.4)),mul3(F.u,-1),{arm:1});if(p)k.L(A+'1','c',c.bark,sub3(p,mul3(F.u,.02)),add3(p,[s*.1,-.02,.1]),.01,.003,4)}
      // drips off the arms
      [[A+'0',a0,F.a1,.55],[A+'0',a0,F.a1,.95],[A+'1',F.a1,F.a2,.45]].forEach(([bn,a,b,t],i)=>{const q=lerp3(a,b,t),dir=nrm3([s,0,.35]),p=cgRay(M,add3(q,mul3(dir,.4)),mul3(dir,-1),{arm:1});if(!p)return;
        k.L(bn,'c',c.g2,sub3(p,mul3(dir,.016)),add3(p,[s*.008,-.11-i*.02,.008]),.02,.003,4)});
      // a lumpy goo fist with three stubby fingers
      const h=add3(F.a2,mul3(F.d,.06));k.p(A+'2','sph','c',c.g2,h[0],h[1],h[2],.075,.07,.075);
      for(let f=0;f<3;f++){const r=add3(add3(h,mul3(F.f,(f-1)*.035)),mul3(F.d,.04)),e=add3(add3(r,mul3(F.d,.08)),add3(mul3(F.f,(f-1)*.012),mul3(F.u,-.03)));k.L(A+'2','c',c.g1,r,e,.026,.013,5)}
      // feet spread into a dirty puddle
      const l=s<0?'lh2':'rh2',FT=J[l];k.p(l,'sph','c',c.g2,FT[0],.022,FT[2]+.06*S.foot.len,.12,.036,.16);for(let i=0;i<3;i++)k.p(l,'sph','c',c.dirt,FT[0]+(i-1)*.06,.014,FT[2]+.13+i%2*.04,.032,.013,.032)});
    // glowing bubbles caught in the goo
    for(let i=0;i<16;i++){const y=hy+a181H(i,1,2)*(sh-hy),a=a181H(i,3,4)*6.283,r=.012+a181H(i,5,6)*.016,p=cgSurf(M,S,y,a,-r*.35);k.p(b7_TB(S,y),'sph','g',i%3?c.glow:0xf0ffb0,p[0],p[1],p[2],r,r,r)}})})();
ST179.amalgam={sx:.22,hx:-.2,lk:.24,rk:.24,az:.14,lz:-.14,ex:-.3,le:-.3};

// ---------------- Akorror: a chitin-armoured horror ----------------
// olive-black chitin plates with lighter rims, a horned crest, big glowing green compound eyes, mandibles and huge fangs
// round a glowing red mouth, spiked pauldrons, a spine ridge, acid glowing in the belly seams, forearm scythes, huge talons,
// knee spikes, a heavy plated tail with rings and a fang stinger, hooked toe claws
(function(){const S=cgHuman({h:.86,w:1.26,d:1.18,rw:[1.14,1.22,1.16,1.22,1.32,1.36,1.44,1.54],rf:[1.05,1.1,1.16,1.22,1.3,1.22,1.14,1.12],at:1.8,lt:1.78,hs:1.04,hw:1.12,hd:1.18,hy:.94,legL:.86,armL:1.14,nw:1.6,foot:1.15,footW:1.3,facePush:BRUTEJAW});
  const c1=0x100f0b,c2=0x211f16,c3=0x060604,edge=0x36341f,acid=0xb8ff3a,acid2=0x5a9a1a,fang=0xe8e0c8,claw=0x2a2430,T=S.torso,J=S.J;
  const band=(m,f,a,b)=>Math.round(m.y*f)%2?a:b;
  cg181Reg('akorror',S,function(B,P,k,C){const M=C.M,wy=T[2][0],hy=T[1][0];
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.022*cgG(x,y,0,1.645,.06,.01)-.012*cgG(x,y,0,1.556,.04,.005);[-1,1].forEach(s=>d-=.016*cgG(x,y,s*.04,1.628,.016,.01));return d}));
    M.b7hide=[];M.b7col=(m=>m.part=='hand'?c3:m.part=='head'?(m.s>.45&&m.y<S.hp(0,1.6,0)[1]?c3:Math.round(m.y*44/S.hs)%3==0?edge:m.s<-.2?c1:c2):m.s<-.3?c3:band(m,20,c1,mdMix(c1,edge,.55)));
    // plate shells: chest and back, belly bands, limb plates (rims tucked to the skin)
    b7_Sh(B,M,m=>m.part=='torso'&&m.y>wy+.02,.024,m=>Math.abs(m.x)<.02?edge:band(m,16,c2,c1));b7_Sh(B,M,m=>m.part=='torso'&&m.y<=wy+.02&&m.y>J.lh0[1]-.03,.02,m=>m.s>.4?band(m,30,c2,c3):band(m,30,c2,edge));
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a=J[A+'0'];b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y>J[A+'1'][1]+.03,.022,m=>band(m,30,c2,c1));b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1],.02,c2);
      b7_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>J[L+'1'][1]+.04,.022,m=>band(m,24,c2,c1));b7_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.04&&m.y>J[L+'2'][1]+.02,.02,c2);
      // massive spiked pauldrons
      k.p(A+'0','hem','c',c2,a[0]+s*.05,a[1]+.05,a[2],.16,.095,.16,0,0,s*.45);k.p(A+'0','hem','c',edge,a[0]+s*.06,a[1]+.03,a[2],.145,.065,.145,0,0,s*.75);
      for(let i=0;i<3;i++)k.p(A+'0','cone4','c',c3,a[0]+s*(.07+i*.03),a[1]+.14-i*.02,a[2]-.04+i*.04,.026,.15-i*.02,.026,-.3,0,-s*(.4+i*.2));
      // huge talons on a heavy knuckled hand, a thumb claw
      const F=b7_Arm(S,s),kn=add3(F.a2,mul3(F.d,.07));k.p(A+'2','sph','c',c2,kn[0],kn[1],kn[2],.062,.06,.068);
      for(let f=0;f<3;f++){const r=add3(add3(kn,mul3(F.f,(f-1)*.034)),mul3(F.d,.03)),D=nrm3(add3(add3(mul3(F.d,.75),mul3(F.f,.62+(f-1)*.05)),mul3(F.u,(f-1)*.08)));
        b7_Claw(k,A+'2',f==1?fang:claw,r,D,F.d,.22,.024,.5,4)}
      b7_Claw(k,A+'2',claw,add3(add3(F.a2,mul3(F.d,.035)),mul3(F.u,-s*0-.03)),nrm3(add3(add3(mul3(F.d,.5),mul3(F.f,.5)),mul3(F.u,-.6))),F.d,.12,.02,.45,3);
      // a scythe blade growing out of the back of the forearm, curving forward
      b7_Scythe(k,M,S,s,.3,.05,edge,0x8a8466);
      // knee spikes, hooked toe claws
      const K2=J[L+'1'],kp=cgRay(M,[K2[0],K2[1]+.02,K2[2]+.4],[0,0,-1],{leg:1});if(kp)k.L(L+'1','c',edge,[kp[0],kp[1]-.01,kp[2]-.03],[kp[0],kp[1]+.09,kp[2]+.1],.03,.002,4);
      const FT=J[L+'2'];for(let f=0;f<3;f++){const r=[FT[0]+(f-1)*.04,.035,FT[2]+.13*S.foot.len];b7_Claw(k,L+'2',fang,r,nrm3([(f-1)*.2,-.15,1]),[0,-1,0],.1,.02,.6,3)}});
    // the head: a crest of horns sweeping back, big compound eyes on the sides, mandibles, fangs, a glowing red mouth
    [-1,0,1].forEach(s=>{let a=S.hp(s*.05,1.69,-.02),d=[s*.25,.5,-.8];for(let j=0;j<4;j++){const b=add3(a,mul3(d,.075*S.hs));k.L('head','c',j<2?c2:edge,a,b,(.032-j*.006)*S.hs,(.026-j*.006)*S.hs,5);a=b;d=[d[0]*1.1,d[1]-.25,d[2]-.1]}});
    [-1,1].forEach(s=>{const o=S.hp(0,1.636,.02),dir=nrm3([-s*.8,0,-.6]),p=cgRay(M,sub3(o,mul3(dir,.4)),dir,{head:1});if(!p)return;const n=mul3(dir,-1),R=.046*S.hs;
      const sc=add3(p,mul3(n,-R*.25));k.p('head','sph2','c',c3,sc[0],sc[1],sc[2],R*1.12,R,R*1.12);const gc=add3(p,mul3(n,R*.12));k.p('head','sph2','g',acid,gc[0],gc[1],gc[2],R*.92,R*.84,R*.98);
      for(let i=0;i<2;i++){const q=add3(add3(p,mul3(n,R*.95)),[0,(i-.5)*R*.7,0]);k.p('head','box','c',c3,q[0],q[1],q[2],R*1.3,R*.06,R*.06,0,Math.atan2(n[0],n[2]),0)}});
    {const p=b7_Face(M,S,0,1.556);if(p)k.p('head','box','g',0x8a1a0a,p[0],p[1],p[2]-.004,.07*S.hs,.014*S.hs,.012)}
    [[.03,1.556,.095,.017],[.072,1.565,.06,.013]].forEach(([x,y,len,r])=>[-1,1].forEach(s=>{const p=b7_Face(M,S,s*x,y);if(!p)return;const a=[p[0],p[1]+.006,p[2]-.008];
      k.L('head','c',fang,a,[p[0]+s*len*.12,p[1]-len*S.hs,p[2]+len*.25],r*S.hs,.002,5)}));
    [-1,1].forEach(s=>{const p=b7_Face(M,S,s*.06,1.548);if(!p)return;let a=[p[0]-s*.006,p[1],p[2]-.012],d=[s*.25,-.25,1];for(let i=0;i<4;i++){const L=.05*S.hs,b=add3(a,mul3(nrm3(d),L));
      k.L('head','c',i<2?c2:fang,a,b,.022*(1-i*.2)*S.hs,(.02*(1-(i+1)*.2)+.003)*S.hs,4);a=b;d=[d[0]-s*.35,d[1]+.05,d[2]-.15]}k.p('head','sph','g',acid,a[0],a[1]-.01,a[2],.008,.014,.008)});
    // a ridge of spikes down the spine
    for(let i=0;i<7;i++){const y=T[6][0]-i*.075,p=cgSurf(M,S,y,Math.PI,-.006);k.p(b7_TB(S,y),'cone4','c',i%2?c2:edge,p[0],p[1],p[2],.03,.16-Math.abs(i-2)*.015,.028,-1.05)}
    // acid glowing in the belly seams and in spots on the plates
    [0,1,2].forEach(i=>{const y=wy-.03+i*.045,p=cgSurf(M,S,y,0,.018);k.p(b7_TB(S,y),'box','g',acid2,p[0],p[1],p[2],.08-i*.012,.007,.008)});
    [[J.chest[1]+.02,.5],[J.chest[1]-.04,-.6],[wy+.08,.9],[J.chest[1]+.06,-2.6]].forEach(([y,a])=>{const p=cgSurf(M,S,y,a,.02);k.p(b7_TB(S,y),'sph','g',acid,p[0],p[1],p[2],.011,.011,.008)});
    // a heavy plated tail: segments with rings, spikes along its top, a fang stinger at the end
    {const t0=cgSurf(M,S,J.lh0[1]+.02,Math.PI,-.03),T2=[t0,add3(t0,[0,-.1,-.2]),add3(t0,[0,-.22,-.4]),add3(t0,[0,-.32,-.6]),add3(t0,[0,-.36,-.78]),add3(t0,[0,-.35,-.92])],RR=[.1,.085,.07,.054,.036,.014];
      cgTube(B,T2,RR,T2.map(()=>[['pelvis',1]]),m=>Math.round(m.i*2)%2?c1:c2,{seg:10,capB:true});
      for(let i=1;i<5;i++){const a=T2[i],d=nrm3(sub3(T2[i+1],T2[i-1]));k.p('pelvis','ring','c',edge,a[0],a[1],a[2],RR[i]*1.06,.5,RR[i]*1.06,Math.atan2(d[2],d[1]),0,0);
        k.p('pelvis','cone4','c',c3,a[0],a[1]+RR[i]*.85,a[2],.022,.1-i*.012,.022,-.6)}
      const e=T2[5],d=nrm3(sub3(T2[5],T2[4]));k.L('pelvis','c',fang,sub3(e,mul3(d,.03)),add3(e,mul3(nrm3(add3(d,[0,-.15,0])),.15)),.026,.002,5)}
    b7_Body(B,M)})})();
// a claw: segments curling about the axis ax (turning toward −up of the hand), tapering to a point
function b7_Claw(k,bn,col,p,dir,tgt,len,r,curl,n){let a=p.slice(),d=nrm3(dir);
  for(let i=0;i<n;i++){const L=len/n,b=add3(a,mul3(d,L));k.L(bn,'c',col,a,b,r*(1-i/n),r*(1-(i+1)/n)+.002,4);a=b;d=nrm3(add3(d,mul3(tgt,curl)))}}
// a mantis scythe from the back of the forearm: a hooked blade sweeping back past the elbow and curling down, a pale edge
function b7_Scythe(k,M,S,s,len,w,col,edge){const F=b7_Arm(S,s),q=lerp3(F.a1,F.a2,.55),o=nrm3(add3(mul3(F.u,.55),mul3(F.f,-.85))),p=cgRay(M,add3(q,mul3(o,.4)),mul3(o,-1),{arm:1})||add3(q,mul3(o,.04)),bn=F.A+'1';
  let a=sub3(p,mul3(o,.014)),d=nrm3(add3(mul3(F.d,-.55),mul3(o,.85)));const n=5;
  for(let i=0;i<n;i++){const L=len/n,b=add3(a,mul3(d,L)),r0=w*(1-i/n*.8),r1=w*(1-(i+1)/n*.8);k.L(bn,'c',i<n-2?col:edge,a,b,r0,i==n-1?.002:r1,4);
    if(i>0&&i<n-1)k.L(bn,'c',edge,add3(a,mul3(F.d,r0*.6)),add3(b,mul3(F.d,r1*.6)),r0*.35,r1*.35,4);
    a=b;d=nrm3(add3(d,mul3(F.d,.55)))}}
