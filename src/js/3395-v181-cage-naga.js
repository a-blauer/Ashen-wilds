// ================= v181: the naga on cage bodies — one surface from the head to the tail tip, a reptile's head =================
// Owner: "the face of the naga's to be reptilian — not human structure". The head is its own ring stack (no human skull): a long,
// flat, tapering snout, a low flat crown, the jaw wide at the back; sculpted with nostril slits at the snout's tip, a lipless
// mouth line running back to the jaw's corner, heavy scaled brow ridges over side-set eyes (slit pupils), a ridge of scales over
// the skull, jaw muscles; a cobra hood flares behind. The upper body is a lean, scaled man; at the hips the cage's bottom ring
// flows on into the serpent body (S.tail): the torso's front becomes the tail's underside, so the pale belly plates run from
// the abdomen down under the coils. The tail rides the five nt bones (3391: children of the body mesh, so the coils stay on
// the ground, swaying as it slithers).
NAGA181.bones=[['nt0',null,0,.36,-.08],['nt1','nt0',0,.1,-.4],['nt2','nt1',-.13,.086,-.68],['nt3','nt2',.06,.07,-1.0],['nt4','nt3',.15,.051,-1.32]];
// the reptile head in base head coordinates (the thrall's head space 1.52 … 1.73): [y, half width, front, back, z]
const NAGAHEAD=[[1.52,.06,.07,.06,.02],[1.535,.066,.11,.064,.03],[1.55,.07,.14,.068,.036],[1.564,.072,.156,.072,.04],[1.578,.072,.158,.076,.04],[1.592,.07,.15,.08,.038],
  [1.607,.073,.13,.085,.03],[1.622,.078,.11,.09,.02],[1.637,.077,.096,.092,.015],[1.652,.07,.082,.09,.01],[1.664,.058,.062,.078,.004],[1.672,.03,.03,.045,0]];
function n181Face(x,y,z,n){const ax=Math.abs(x);let d=0;
  // the mouth: a groove along the jaw from the snout's tip back to its corner (front and sides)
  if(n[1]>-.6)d-=.006*Math.exp(-Math.pow((y-1.571)/.0035,2))*(z>-.02?1:0);
  [-1,1].forEach(s=>{d-=.007*cgG(x,y,s*.016,1.597,.005,.004);             // nostril slits near the snout's tip
    d+=.014*cgG(x,y,s*.05,1.642,.018,.008);                                // scaled brow ridges over the eyes
    d-=.008*cgG(x,y,s*.06,1.622,.013,.01);                                 // the eye's socket, set to the side
    d+=.009*cgG(x,y,s*.068,1.556,.02,.014)});                              // the jaw muscles at the back of the jaw
  d+=.006*cgG(x,y,0,1.66,.012,.02);                                        // a ridge of scales over the skull
  return d}
// the tail: from under the hips down to the ground, then an S-curve trailing behind (model space)
function n181Path(){const W=(a,b,t)=>t<=0?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]],T=[[0,.66,-.01,.15,W('pelvis','nt0',0)],[0,.54,-.03,.155,W('pelvis','nt0',.15)],[0,.42,-.06,.155,W('pelvis','nt0',.5)],[0,.3,-.1,.15,W('nt0','nt0',0)],
  [0,.2,-.17,.142,W('nt0','nt1',.4)],[0,0,-.27,.132,W('nt1','nt1',0)],[0,0,-.4,.125,W('nt1','nt1',0)],[-.07,0,-.53,.118,W('nt1','nt2',.4)],[-.13,0,-.68,.108,W('nt2','nt2',0)],[-.09,0,-.85,.098,W('nt2','nt3',.5)],
  [.06,0,-1.0,.088,W('nt3','nt3',0)],[.14,0,-1.16,.077,W('nt3','nt4',.4)],[.15,0,-1.32,.064,W('nt4','nt4',0)],[.09,0,-1.48,.05,W('nt4','nt4',0)],[0,0,-1.6,.034,W('nt4','nt4',0)],[-.07,0,-1.7,.019,W('nt4','nt4',0)]];
  return T.map(([x,y,z,r,w])=>({p:[x,y||r*.8,z],r,w}))}
function n181Spec(){const S=cgHuman({h:.86,w:1.0,d:1.0,rw:[1.12,1.16,.96,1.02,1.1,1.1,1.15,1.1],at:1.1,lt:1,hs:1.0,hw:.95,head:NAGAHEAD,facePush:()=>0});
  S.tail=n181Path();S.extra=NAGA181.bones.map(q=>q[0]);S.pron={'-1':.5,'1':.5};return S}
// the cobra hood behind the head (base head coordinates: y, half width, z)
function n181Hood(B,S,col){const R=[[1.47,.085,-.06],[1.52,.15,-.075],[1.57,.2,-.09],[1.62,.21,-.095],[1.665,.175,-.095],[1.695,.1,-.09],[1.712,.025,-.085]].map(([y,r,z])=>{const p=S.hp(0,y,z);return {p,rx:r*S.hs,f:.02,b:.03,w:y<1.53?[['neck',1]]:[['neck',.3],['head',.7]]}});
  mdLoft(B,R,{seg:18,capB:true,col})}
// a naga: body, head, hood, fingers; returns the smoothed mesh for the gear
function n181Build(B,k,C,S,K){const M=C.M,J=S.J;cgSculpt(M,{head:1},S.sculpt(n181Face));
  const scale=m=>a181Nz(K.sk,m,.38,13),belly=m=>Math.round((m.y-m.z)*15)%2?K.bel:mdSh(K.bel,.8);
  cgEmit(B,M,m=>{if(m.part=='head'){if(m.ny<-.35||(m.s>.55&&m.y<S.hp(0,1.571,0)[1]))return mdMix(K.bel,K.sk,.3);return a181Nz(m.y>S.hp(0,1.64,0)[1]?K.sk2:K.sk,m,.35,30)}
    if(m.part=='tail'){if(m.ny<-.35||(m.y>.3&&m.s>.55))return belly(m);if(m.ny>.3&&Math.round(-m.z*7)%2==0)return a181Nz(K.pat,m,.3,9);return scale(m)}
    if(m.part=='torso'&&m.s>.55&&Math.abs(m.x)<.09&&m.y<J.chest[1]+.04)return belly(m);if(m.part=='torso'&&m.s<-.6&&n3Sn(m.x,m.y*2,m.z,7,1)>.55)return K.pat;return scale(m)});
  // eyes on the sides of the head, burning, with slit pupils; fangs; a forked tongue's tip
  [-1,1].forEach(s=>{const q=S.hp(s*.06,1.622,0),d=nrm3([s,0,.75]),p=cgRay(M,add3(q,mul3(d,.4)),mul3(d,-1),{head:1});if(!p)return;
    k.p('head','sph','g',K.eye,p[0]+d[0]*.002,p[1],p[2]+d[2]*.002,.013*S.hs,.009*S.hs,.009*S.hs,0,s*.9,0);k.p('head','box','c',0x050403,p[0]+d[0]*.009,p[1],p[2]+d[2]*.009,.003,.014*S.hs,.003,0,s*.9,0)});
  [-1,1].forEach(s=>{const q=S.hp(s*.022,1.574,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','cone4','c',0xe8e0c8,p[0],p[1]-.012,p[2]-.008,.0055,.03,.0055,Math.PI)});
  n181Hood(B,S,m=>{if(m.s>.3){const ex=(Math.abs(m.x)-.13*S.hs)/(.022*S.hs),ey=(m.y-S.hp(0,1.6,0)[1])/(.016*S.hs),e=ex*ex+ey*ey,rim=Math.abs(m.x)>.17*S.hs;return e<1?0x0a0806:e<2.2?mdSh(K.bel,.75):rim?a181Nz(K.sk2,m,.3,12):a181Nz(mdMix(K.sk2,K.bel,.2),m,.3,14)}return a181Nz(K.sk2,m,.35,12)});
  [-1,1].forEach(s=>{cgFingers(k,S,s,K.sk,K.fist&&K.fist(s)?'fist':'claw',1.0,0x14100a,.016)});
  return M}

// ---------------- Naga Warrior: bronze scale cuirass, gorget, a heavy pauldron, vambraces, a war-belt with hanging plates ----------------
(function(){const S=n181Spec(),K={sk:0x3a4a2c,sk2:0x283420,bel:0x8c7c4e,pat:0x1a2214,eye:0xffc020,fist:s=>s>0};const br=0x6a5226,br2=0x4a3818,gd=0x8a7034,lt=0x2e2014,T=S.torso,J=S.J;
  cg181Reg('nagaw',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    cgShell(B,M,m=>m.part=='torso'&&m.y>wy-.01,.026,m=>m.y<wy+.03||m.y>sh+.02?gd:a181Nz(Math.round(m.y*36+(Math.round(Math.atan2(m.x,m.z)*8)%2)*.5)%2?br:br2,m,.25,12),{t:'m'});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh),.04,gd,{t:'m'});
    const a=J.aL0;[[.05,.13,.09,.135,br],[.0,.12,.075,.125,br2],[-.045,.11,.06,.115,br]].forEach(([dy,sx,sy,sz,c],j)=>k.p('aL0','hem','m',c,a[0]-(.03+j*.012),a[1]+dy,a[2],sx,sy,sz,0,0,-(.4+j*.12)));
    for(let j=0;j<3;j++)k.L('aL0','m',gd,[a[0]-.07-j*.025,a[1]+.06,a[2]-.03+j*.03],[a[0]-.11-j*.03,a[1]+.15,a[2]-.04+j*.03],.016,.002,4);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>J[A+'2'][1]+.01,.016,m=>m.y<J[A+'2'][1]+.04?gd:br,{t:'m'})});
    const by=T[0][0]+.03;cgBelt(B,M,by,.04,.035,lt);const bk=cgSurf(M,S,by,0,.04);k.p('pelvis','oct','m',gd,bk[0],bk[1],bk[2],.03,.035,.012);
    for(let i=0;i<9;i++){const an=-1.3+i*(2.6/8),p=cgSurf(M,S,by-.02,an,.042);k.p('pelvis','box','m',i%2?br:br2,p[0],p[1]-.075,p[2],.07,.15,.012,-.12*Math.cos(an),an,0)}})})();

// ---------------- Naga Archer: a leather harness, a quiver of red-fletched arrows, a bracer on the bow arm, a hide wrap ----------------
(function(){const S=n181Spec(),K={sk:0x4a4c2c,sk2:0x34361e,bel:0x9a8a5a,pat:0x22220e,eye:0xffd84a,fist:s=>s<0};const lt=0x4a3422,lt2=0x30200f,fe=0x8a2a1a,T=S.torso,J=S.J;
  cg181Reg('nagaa',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),sh=T[6][0],by=T[0][0]+.03;
    const sp=(y,a,off)=>{const q=cgTAt(S,y);return [Math.sin(a)*(q.rx+off),y,q.z+Math.cos(a)*((Math.cos(a)>=0?q.f:q.b)+off)]};
    [-1,1].forEach(s=>{const P1=sp(sh-.01,s*.45,.014),P2=sp((sh+T[2][0])/2,-s*.2,.02),P3=sp(T[2][0]+.02,-s*.75,.016),Q1=sp(sh-.01,Math.PI-s*.45,.014),Q2=sp(T[2][0]+.02,Math.PI+s*.75,.016);
      cgTube(B,[P1,P2,P3],[.012,.012,.012],[[['chest',1]],[['chest',.5],['spine',.5]],[['spine',1]]],lt,{seg:6});cgTube(B,[Q1,lerp3(Q1,Q2,.5),Q2],[.012,.012,.012],[[['chest',1]],[['chest',.5],['spine',.5]],[['spine',1]]],lt,{seg:6})});
    const c=sp(J.chest[1]+.05,0,.03);k.p('chest','sph','m',0x8a7a50,c[0],c[1],c[2],.022,.022,.012);
    const qb=cgTAt(S,J.chest[1]),qz=qb.z-qb.b-.06;k.L('chest','c',lt2,[.1,J.spine[1]-.02,qz],[-.08,sh+.06,qz-.03],.045,.04,8);
    for(let i=0;i<6;i++){const ox=(i%3-1)*.025,oz=(i<3?0:.02);k.L('chest','c',0x5a4a32,[-.08+ox,sh+.04,qz-.03+oz],[-.1+ox,sh+.14,qz-.04+oz],.004,.004,3);k.p('chest','cone4','c',i%2?fe:0xd8d0b8,-.1+ox,sh+.16,qz-.04+oz,.012,.05,.004)}
    cgShell(B,M,m=>m.part=='arm'&&m.x<0&&m.y<J.aL1[1]-.03&&m.y>J.aL2[1]+.01,.014,m=>Math.round(m.y*40)%2?lt:lt2);
    cgFur(B,M,m=>m.part=='torso'&&m.y<by+.06,{off:.024,len:.14,col:lt,col2:lt2,seed:41,jag:.55,lump:[.6,.6]});
    for(let i=0;i<5;i++){const p=sp(by+.05,-.6+i*.3,.034);k.p('pelvis','cone4','c',0xd8d0b8,p[0],p[1]-.02,p[2],.008,.04,.006,Math.PI)}})})();

// ---------------- Naga Shaman: a fringed shawl, bead and fang necklaces, a sash with long panels, glowing marks, a bone crown ----------------
(function(){const S=n181Spec(),K={sk:0x2c4844,sk2:0x1e3430,bel:0x8a9a78,pat:0x0e1e1c,eye:0x7affd8,fist:s=>s>0};const cl=0x1e3a3a,cl2=0x122626,gd=0xa88a3a,rune=0x5affc8,bone=0xd8d0b8,T=S.torso,J=S.J;
  cg181Reg('nagas',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),sh=T[6][0],by=T[0][0]+.03;
    const sp=(y,a,off)=>{const q=cgTAt(S,y);return [Math.sin(a)*(q.rx+off),y,q.z+Math.cos(a)*((Math.cos(a)>=0?q.f:q.b)+off)]};
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]-.03)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR0[1]-.12),{off:.026,len:.12,col:cl,col2:cl2,seed:51,jag:.5,lump:[.6,.7]});
    for(let j=0;j<2;j++)for(let i=0;i<13;i++){const a=(i-6)*.15,p=sp(J.chest[1]+.02-j*.05-Math.abs(i-6)*.006,a,.034+j*.004);k.p('chest',i%3?'sph':'cone4','c',i%3?(j?gd:0x2a8a7a):bone,p[0],p[1],p[2],i%3?.011:.008,i%3?.011:.035,i%3?.011:.006,i%3?0:Math.PI)}
    cgBelt(B,M,by,.04,.028,cl2);
    [[0,.2],[.5,.17],[-.5,.17],[Math.PI,.2]].forEach(([a,l])=>{const p=cgSurf(M,S,by-.02,a,.012);mdLoft(B,[0,1,2].map(i=>({p:[p[0]+Math.sin(a)*i*.014,p[1]-i*l*.5,p[2]+Math.cos(a)*i*.014],rx:.06,f:.008,b:.008,w:i?[['pelvis',.5],['nt0',.5]]:[['pelvis',1]]})),{seg:6,ref:[Math.sin(a),0,Math.cos(a)],col:m=>m.i>1.6?gd:cl})});
    [[J.chest[1]+.03,.25],[J.chest[1]+.03,-.25],[J.spine[1]+.03,0],[J.chest[1]+.08,.5],[J.chest[1]+.08,-.5]].forEach(([y,a],i)=>{const p=cgRay(M,add3(sp(y,a,0),[Math.sin(a)*.4,0,Math.cos(a)*.4]),[-Math.sin(a),0,-Math.cos(a)],{torso:1});if(p)k.p(y>J.chest[1]-.04?'chest':'spine','box','g',rune,p[0],p[1],p[2],.006,.05,.002,0,a,i%2?.7:-.7)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'2'][1]+.06&&m.y>J[A+'2'][1]-.01,.014,gd,{t:'m'})});
    for(let i=0;i<7;i++){const a=(i-3)*.32,q=S.hp(Math.sin(a)*.08,1.66,-.03+Math.cos(a)*.02);k.L('head','c',i%2?bone:gd,q,[q[0]*2,q[1]+.13-Math.abs(i-3)*.025,q[2]-.06],.012,.002,4)}})})();
// no legs: no knee bend (ST179 from 3391 stays: a lean, arms ready)
