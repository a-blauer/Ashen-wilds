// ================= v181: the undead on the new bodies (batch 3) =================
// Skeleton Warrior, Bone Archer and the Ossuary Colossus are bones (cgBones: a skull, a vertebral column from the pelvis up into
// the skull, real ribs joined to the sternum, collarbones, shoulder blades, a pelvis with a sacrum, limb bones whose knobbed
// joints sit on the joint pivots, hand and foot bones down to the finger and toe tips) on the same re-proportioned skeleton as
// the cage foes. Every bone overlaps its neighbours, so the whole skeleton is one connected piece in every pose. Desert
// Revenant, Tomb Priest, Grave Ghoul, Drowned Thrall and Drowned Wretch are cage bodies.
// (v181 restore) each keeps what made the old model itself: the warrior's rusted helm, scraps and soul-wisps; the archer's
// hooded cloak, quiver and blue eyes; the colossus's femur club, crown, fused skulls, barrel ribs and grave-fire; the priest's
// nemes, winged scarab and trailing bandages; the ghoul's grey-green skin, tusks, raised ribs and rags; the thrall's anchor,
// chains, weed hair and slack jaw; the wretch's black hair over its face, gaping jaw, shroud rags and talons.
function cgBoneTube(B,a,b,r0,r1,w0,w1,col,n){const R=[];n=n||4;for(let i=0;i<=n;i++){const t=i/n,bulge=1+.35*Math.pow(Math.abs(t-.5)*2,4);R.push({p:lerp3(a,b,t),rx:(r0+(r1-r0)*t)*bulge,f:(r0+(r1-r0)*t)*bulge,b:(r0+(r1-r0)*t)*bulge,w:t<.5?w0:w1})}
  mdLoft(B,R,{seg:8,capA:true,capB:true,col})}
// a part on bone bn with its own axes (X along ax, Y along ay; uniform size sc, or [sx,sy,sz])
function u8_part(k,bn,geo,t,col,p,ax,ay,sc){const s=Array.isArray(sc)?sc:[sc,sc,sc],x=nrm3(ax),z=nrm3(cross3(x,ay)),y=cross3(z,x),m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...mul3(x,s[0])),new THREE.Vector3(...mul3(y,s[1])),new THREE.Vector3(...mul3(z,s[2])));
  m.setPosition(p[0],p[1],p[2]);k.P.push({bn,geo,t,col,m});return k.P[k.P.length-1]}
var u8_LINK=null;function u8_link(){return u8_LINK||(u8_LINK=new THREE.TorusGeometry(1,.17,4,8))}
// a chain of links through the points (each link sunk into the body or the next link), alternate links turned a quarter
function u8_chain(k,pts,bnOf,n,r,c1,c2){for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[Math.min(i+1,pts.length-1)],o=pts[Math.max(i-1,0)],d=nrm3(sub3(q,o)),up=n?n(p):[0,1,0],y=i%2?nrm3(cross3(d,up)):up;
  u8_part(k,bnOf(p),u8_link(),'m',i%2?c1:c2,p,d,y,[r*1.35,r,r])}}
// a hanging strip (rag, bandage, weed, hair) rooted at p inside the body, bent with the skin it grows from. Strips are baked
// straight into the body (k.B181) rather than left in the kit: the kit's seating passes (cgSeat, sn179Snap) are made for rigid
// studs and spikes, and would push a strip whose root is sunk in the skin away from where it grows
function u8_strip(k,M,bn,col,p,w,len,ry,rx,sd){const t=dkKit();t.S(bn,col,p[0],p[1],p[2],w,len,ry,rx,sd);if(M)t.P[0].w=cgWAt(M,p);u8_bake(k.B181,t);return k}
// bake kit parts into the body as they are (mdKit as first written, before the later passes that move parts)
function u8_bake(B,k){const v=new THREE.Vector3();k.P.forEach(p=>{const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,cnt=ix?ix.length:pa.count,w=mdW(B,p.w||[[p.bn,1]]),col=mdC(p.col),V=[];
  for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);V.push({x:v.x,y:v.y,z:v.z,w})}for(let i=0;i+2<cnt;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;mdTri(B,p.t=='m'?'m':p.t=='g'?'g':'c',V[a],V[b],V[c],col)}})}
// a point on an arm (t: 0 shoulder … 1 elbow … 2 wrist) on its outer side (dir a: 0 out, +π/2 front), sunk dep into the skin
function u8_armPt(M,S,s,t,a,dep){const A=s<0?'aL':'aR',J=S.J,c=t<=1?lerp3(J[A+'0'],J[A+'1'],t):lerp3(J[A+'1'],J[A+'2'],t-1),d=[s*Math.cos(a||0),0,Math.sin(a||0)],p=cgRay(M,add3(c,mul3(d,.4)),mul3(d,-1),{arm:1,hand:1});
  return p?sub3(p,mul3(d,dep==null?.006:dep)):c}
// strands from the crown (base head coordinates): [angle round the head (0 front), base y, width, length, outward tilt, colour, seed]
function u8_strands(k,M,S,L){L.forEach(([a,y,w,len,tl,col,sd])=>{const c=S.hp(0,y,0),d=[Math.sin(a),0,Math.cos(a)],p=cgRay(M,add3(c,mul3(d,.4)),mul3(d,-1),{head:1});if(!p)return;
  const r=sub3(p,mul3(d,.007)),t=dkKit();t.S('head',col,r[0],r[1],r[2],w,len,a,-tl,sd);u8_bake(k.B181,t)})}
// hand bones: a wrist knob, the carpals, metacarpals out to each finger's root (the frame of cgFingers), the fingers, a thumb
function u8_hand(k,S,s,col,kind,nail,th,rf,tip){rf=rf||1;const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),kn=add3(a2,mul3(d,.08*Math.sqrt(rf))),L=.08*Math.sqrt(rf);
  const u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d));
  const P=(b,x,y)=>add3(add3(b,mul3(f,x)),mul3(u,y)),D=(a,b,c)=>nrm3(add3(add3(mul3(d,a),mul3(u,b)),mul3(f,c))),c0=add3(a2,mul3(d,.024*Math.sqrt(rf)));
  k.p(bn+'2','sph','c',col,a2[0],a2[1],a2[2],.016*th);k.p(bn+'2','sph','c',col,c0[0],c0[1],c0[2],.017*rf,.017*rf,.017*rf);
  for(let i=0;i<4;i++){const z=(1.5-i)*.016*rf,p=P(kn,z,-.004);k.L(bn+'2','c',col,P(c0,z*.4,-.002),p,.0062*rf,.0058*rf,5);
    if(kind=='fist')a181Digit(k,bn+'2',col,p,D(1,-.45,.05),L*.7,.0095*rf,2,1.15,ax,0,null);else a181Digit(k,bn+'2',col,p,D(1,-.15,z*.6/rf),L*(i==3?.82:1),.0085*rf,3,kind=='claw'?.26:.14,ax,tip||0,nail)}
  const tb=P(add3(a2,mul3(d,.03)),.026*rf,-.01);k.L(bn+'2','c',col,P(c0,.008*rf,-.004),tb,.007*rf,.0065*rf,5);a181Digit(k,bn+'2',col,tb,D(.6,-.3,.75),L*.62,.009*rf,2,.3,nrm3(cross3(u,f)),tip?tip*.6:0,nail)}
// foot bones: the ankle knob, a heel, the arch, five metatarsals out to the toes
function u8_foot(k,S,s,col,th){const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,W=S.foot.w,r=Math.sqrt(th),hl=[A[0],.026*r,A[2]-.025],mid=[A[0],.03*r,A[2]+.07*L];
  k.p(l,'sph','c',col,A[0],A[1],A[2],.024*th);k.L(l,'c',col,A,hl,.017*th,.02*r,6);k.p(l,'sph','c',col,hl[0],hl[1],hl[2],.024*r,.024*r,.03*r);k.L(l,'c',col,A,mid,.018*th,.016*r,6);
  for(let i=0;i<5;i++){const tx=A[0]+(i-2)*.018*W,tz=A[2]+.16*L;k.L(l,'c',col,[A[0]+(i-2)*.007*W,mid[1],mid[2]],[tx,.018,tz-.02],.0075*r*W,.0065*r*W,5)}cgToes(k,S,s,col,0)}
// o: bone, bone2, th (bone thickness), cage (ribcage size), rt (rib thickness), eye, soul, wisps, fist(s)
// returns {sp(y) column point, sf(y) sternum point, rib(i,s,j) a point on rib i (0 top … 5) side s (j 0 spine … 6 front), TW, py}
function cgBones(B,k,S,o){const J=S.J,bone=o.bone,bd=o.bone2||mdSh(o.bone,.72),th=o.th||1,cg=o.cage||1,rt=o.rt||1,T=S.torso,H=S.head,col=m=>a181Nz(bone,m,.2,24);
  // the skull: a loft of the head rings, a separate jaw under it; sockets, a nose hole, teeth; eyes glowing in front of the sockets' dark
  const skull=H.slice(3).map(q=>({p:[0,q[0],q[4]],rx:q[1]*.95,f:q[2]*.92,b:q[3]*.95,w:[['head',1]]}));mdLoft(B,skull,{seg:16,capA:true,capB:true,col});
  const jaw=H.slice(0,4).map(q=>({p:[0,q[0]+.004,q[4]+.004],rx:q[1]*.86,f:q[2]*.9,b:q[3]*.55,w:[['head',1]]}));mdLoft(B,jaw,{seg:14,capA:true,capB:true,col:bd});
  const fz=y=>{const q=cgAt(H,y);return (q[4]||0)+q[2]*.92};const ey=S.hp(0,1.629,0)[1],nyy=S.hp(0,1.597,0)[1],my=S.hp(0,1.562,0)[1];
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.034*S.hs,ey,fz(ey)-.014*S.hs,.019*S.hs,.014*S.hs,.016*S.hs,0,0,s*-.25);if(o.eye)k.p('head','sph','g',o.eye,s*.035*S.hs,ey,fz(ey)-.003*S.hs,.012*S.hs,.008*S.hs,.007*S.hs,0,0,s*-.2)});
  k.p('head','cone4','c',0x080606,0,nyy,fz(nyy)-.006,.012*S.hs,.026*S.hs,.008,Math.PI);for(let i=-3;i<=3;i++)k.p('head','box','c',0xe0d8c0,i*.011*S.hs,my,fz(my)-.004,.008*S.hs,.014*S.hs,.008);
  // the column: lumbar and thoracic on the torso's weights, the neck vertebrae on to the skull's base (inside it)
  const sp=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)-q[3]*.55]},TW=y=>cgTorsoW(S,y),NW=y=>y<=J.neck[1]?TW(y):cgNeckW(S,y),Y0=J.pelvis[1]-.05,Y1=J.neck[1]-.01,hb=[0,H[3][0]+.014,(H[3][4]||0)-.012];
  const cs=[];for(let i=0;i<=10;i++){const y=Y0+(Y1-Y0)*i/10,r=(.024-.004*i/10)*th;cs.push({p:sp(y),rx:r,f:r*.92,b:r*.92,w:TW(y)})}
  const c1=sp(Y1);for(let i=1;i<=4;i++){const p=lerp3(c1,hb,i/4),r=.017*th;cs.push({p,rx:r,f:r,b:r,w:NW(p[1])})}mdLoft(B,cs,{seg:8,capA:true,capB:true,col:bd});
  for(let i=0;i<11;i++){const y=Y0+(Y1-Y0)*i/10,p=sp(y);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','sph','c',bone,p[0],p[1],p[2]-.016*th,.022*th,.016*th,.02*th)}
  for(let i=1;i<4;i++){const p=lerp3(c1,hb,i/4);k.p(p[1]>J.head[1]-.02?'head':'neck','sph','c',bone,p[0],p[1],p[2]-.012*th,.016*th,.012*th,.015*th)}
  // the ribs: from the column round the sides; the upper ones close on the sternum
  const r0=J.spine[1]+.04,r1=T[6][0]-.03,sf=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)+q[2]*.86*cg]},RB=[];
  for(let i=0;i<6;i++){const y=r1-(r1-r0)*i/5,q=cgAt(T,y);RB.push({});[-1,1].forEach(s=>{const pts=[];for(let j=0;j<=6;j++){const a=Math.PI-(Math.PI-.3)*j/6;pts.push([s*Math.sin(a)*q[1]*.92*cg,y-.02*Math.sin(j/6*Math.PI)-j*.006,(q[4]||0)+Math.cos(a)*(Math.cos(a)>0?q[2]:q[3])*.9*cg])}
    pts[0]=sp(y);const e=pts[6];if(i<4)pts.push([s*.006,e[1]-.004,sf(e[1])[2]]);RB[i][s]=pts;mdLoft(B,pts.map(p=>({p,rx:.011*th*rt,f:.008*th*rt,b:.008*th*rt,w:TW(y)})),{seg:6,capB:true,col})})}
  const st0=RB[3][1][7][1]-.012;cgBoneTube(B,sf(r1+.01),sf(st0),.016*th,.013*th,TW(r1),TW(st0),col,3);
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];cgBoneTube(B,sf(r1+.015),[a[0]*.9,a[1]+.01,a[2]+.02],.012*th,.014*th,[['chest',1]],[['chest',1]],col,3);
    const sw=.07*(1+(th-1)*.4);k.p('chest','hem','c',bd,s*Math.max(.085*S.h,sw*1.05),J.chest[1]+.03,sp(J.chest[1]+.03)[2]-.012,sw,.012,.09*(1+(th-1)*.4),-Math.PI/2,0,0)});
  // the pelvis: a bowl of two wings and a ring, a sacrum down from the column, bars out to the hip sockets
  const py=J.pelvis[1]-.02,pq=cgAt(T,py),pz=pq[4]||0;mdLoft(B,[{p:[0,py-.05,pz],rx:pq[1]*.55,f:pq[2]*.45,b:pq[3]*.5,w:[['pelvis',1]]},{p:[0,py,pz],rx:pq[1]*.8,f:pq[2]*.55,b:pq[3]*.75,w:[['pelvis',1]]},{p:[0,py+.06,pz],rx:pq[1]*.95,f:pq[2]*.35,b:pq[3]*.8,w:[['pelvis',1]]}],{seg:12,col:bd,keep:m=>m.s<.6||m.i<1});
  cgBoneTube(B,sp(Y0+.03),[0,py-.07,pz-pq[3]*.5],.026*th,.018*th,[['pelvis',1]],[['pelvis',1]],bd,3);
  // limbs: knobbed bones whose joint knobs sit on the joint pivots (so they stay closed in every pose); hands and feet of bone
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],l0=J[L+'0'],l1=J[L+'1'],l2=J[L+'2'];
    cgBoneTube(B,add3(l0,[0,.012,0]),[s*pq[1]*.62,py-.01,pz],.016*th,.018*th,[['pelvis',1]],[['pelvis',1]],bd,3);
    cgBoneTube(B,a0,a1,.022*th,.018*th,[[A+'0',1]],[[A+'0',1]],col);k.p(A+'0','sph','c',bone,a0[0],a0[1],a0[2],.032*th);k.p(A+'1','sph','c',bone,a1[0],a1[1],a1[2],.026*th);
    [-.012,.012].forEach(o2=>cgBoneTube(B,add3(a1,[0,0,o2*th]),add3(a2,[0,0,o2*.6*th]),.012*th,.01*th,[[A+'1',1]],[[A+'1',1]],col,3));
    u8_hand(k,S,s,bone,o.fist&&o.fist(s)?'fist':'claw',bd,th,o.hand||1);
    cgBoneTube(B,add3(l0,[0,.02,0]),l1,.026*th,.02*th,[[L+'0',1]],[[L+'0',1]],col);k.p(L+'0','sph','c',bone,l0[0],l0[1]+.01,l0[2],.034*th);k.p(L+'1','sph','c',bone,l1[0],l1[1],l1[2]+.008,.03*th);
    cgBoneTube(B,l1,add3(l2,[0,.01,0]),.02*th,.016*th,[[L+'1',1]],[[L+'1',1]],col);u8_foot(k,S,s,bone,th)});
  // the soul-light caged in the ribs, resting on the column; wisps rising off it
  if(o.soul){const c=sp(J.chest[1]),r=.045*(o.sr||1),z=c[2]+.024*th+r*.72;k.p('chest','ico','g',o.soul,0,J.chest[1],z,r);k.p('chest','ico','g',0xffffff,0,J.chest[1],z+r*.3,r*.5);
    if(o.wisps)for(let i=0;i<3;i++)k.L('chest','g',o.soul,[0,J.chest[1]+r*.5,z],[(i-1)*.05,J.chest[1]+.13+(i%2)*.02,z+.015],.007,.0015,4)}
  return {sp,sf,TW,NW,py,pq,rib:(i,s,j)=>RB[i][s][Math.min(j,RB[i][s].length-1)],r0,r1}}
// bones are not a cage body: register with the cage skeleton's joints (plan) and build them in that space
function cgBonesReg(key,S,fn){const pn='cg181_'+key;cg181Plan(pn,S.J);a181Reg(key,function(B,P,k,L){B.kqPre='none';fn(B,P,k,S)},pn)}
// a loincloth on a cord round the pelvis bowl (it starts just inside the bowl's rim, so it hangs from it)
function u8_loin(B,S,R,c1,c2,len){const py=R.py,q=R.pq,z=q[4]||0;mdLoft(B,[{p:[0,py+.004,z],rx:q[1]*.78,f:q[2]*.52,b:q[3]*.72,w:[['pelvis',1]]},{p:[0,py-.04,z],rx:q[1]*.92,f:q[2]*.66,b:q[3]*.85,w:[['pelvis',1]]},
  {p:[0,py-.12,z+.004],rx:q[1]*1.0,f:q[2]*.78,b:q[3]*.95,w:[['pelvis',.6],['lh0',.2],['rh0',.2]]},{p:[0,py-len,z+.01],rx:q[1]*1.05,f:q[2]*.85,b:q[3]*1.0,w:[['pelvis',.5],['lh0',.25],['rh0',.25]]}],
  {seg:14,col:m=>m.i<.5?c2:a181Nz(c1,m,.3,14),keep:m=>m.i<1||(Math.abs(m.c)<.45&&!(m.i>2.3&&a181H(Math.round(m.c*10),Math.round(m.s*3))<.4))})}
// a cloak for a skeleton: gathered on the spine at the nape, hanging on the cape bones behind the ribs, a ragged hem
function u8_boneCape(B,S,R,o){const J=S.J,T=S.torso,top=T[6][0],cg=o.cage||1,bz=y=>{const q=cgAt(T,Math.min(top,y));return (q[4]||0)-q[3]*.95*cg-.022},w=o.w||1;
  const cw=y=>y>J.cp0[1]-.04?[['chest',.6],['cp0',.4]]:y>J.cp1[1]?mdWb('cp0','cp1',(J.cp0[1]-y)/(J.cp0[1]-J.cp1[1])):y>J.cp2[1]?mdWb('cp1','cp2',(J.cp1[1]-y)/(J.cp1[1]-J.cp2[1])):[['cp2',1]];
  const Y=[top+.012,top-.1,top-.25,top-.42,J.cp1[1]-.1,J.cp2[1],o.len],RR=[{p:R.sp(top-.02),rx:.018,f:.016,b:.016,w:R.TW(top-.02)}].concat(Y.map((y,i)=>({p:[0,y,bz(y)-Math.max(0,top-y)*.08],rx:(.15+i*.024)*w,f:.012,b:.012,w:cw(y)})));
  const n=RR.length;mdLoft(B,RR,{seg:20,col:m=>m.s>.2?mdSh(o.col,.6):Math.round(Math.atan2(m.c,-m.s)*9)%2?o.col:mdSh(o.col,.82),keep:m=>!(m.i>n-2.2&&a181H(Math.round(Math.atan2(m.c,m.s)*6),2)<.5*(m.i-(n-2.2))*.9)})}

// ---------------- Skeleton Warrior / Bone Archer ----------------
['skel','archer'].forEach(key=>{const ar=key=='archer',S=cgHuman({h:ar?.86:.9,w:.9,d:.85,at:.9,lt:.9,hs:1.0}),J=S.J,T=S.torso,eye=ar?0x7ad8ff:0x6aff9a;
  cgBonesReg(key,S,function(B,P,k){const R=cgBones(B,k,S,{bone:0xc0b69c,eye,soul:eye,wisps:!ar,fist:s=>ar?s<0:s>0});
    if(!ar){// a rusted nasal helm (its rim tucked on the skull), a rusted pauldron, scraps of rusted plate wired to the ribs and the hip
      const H=S.head.slice(9),rust=0x6a4630,rust2=0x5a3a24,helm=H.map((q,i)=>{const e=i?.016:0;return {p:[0,q[0],q[4]],rx:q[1]*.95+e,f:q[2]*.92+e,b:q[3]*.95+e,w:[['head',1]]}});
      mdLoft(B,helm,{seg:16,capB:true,t:'m',col:m=>m.i<1.2?rust2:a181Nz(rust,m,.35,16)});k.p('head','box','m',rust2,0,S.hp(0,1.632,0)[1],S.hp(0,1.632,.104)[2],.016,.062,.012);
      const a=J.aL0;k.p('aL0','hem','m',rust,a[0]-.03,a[1]+.03,a[2],.1,.07,.1,0,0,-.4);k.p('aL0','hem','m',rust2,a[0]-.04,a[1]+.02,a[2],.104,.03,.104,0,0,-.4);
      const p1=R.rib(1,-1,4),p2=R.rib(2,1,5);k.p('chest','box','m',rust,p1[0],p1[1],p1[2],.07,.055,.012,0,-.6,.3);k.p('chest','box','m',rust2,p2[0],p2[1]-.01,p2[2],.05,.045,.01,0,.35,-.25);
      const hq=R.pq,hp=[hq[1]*.8*Math.sin(.75),R.py-.01,(hq[4]||0)+hq[2]*.55*Math.cos(.75)];k.p('pelvis','box','m',rust,hp[0],hp[1],hp[2],.06,.05,.012,0,.75,.3);
      u8_loin(B,S,R,0x3a3a34,0x2a2a24,.26)}
    else{// the hood (its sides cross the skull), a cloak from the nape, a quiver with its strap across the ribs, a torn banner rag
      const H=S.head,hd=0x34342c,hd2=0x24241e,hy=S.hp(0,1.69,0)[1],nk=R.sp(J.neck[1]),HR=[{p:[0,J.neck[1],nk[2]+.004],rx:.012,f:.012,b:.012,w:R.NW(J.neck[1])},{p:[0,J.neck[1]+.03,nk[2]+.004],rx:H[0][1]*.75,f:H[0][2]*.35,b:H[0][3]*.95,w:R.NW(J.neck[1]+.03)}].concat(H.slice(1).map((q,i)=>{const e=.018+.008*i/H.length;return {p:[0,q[0],q[4]-.006],rx:q[1]*.95+e,f:q[2]*.92+e,b:q[3]*.95+e+.004,w:[['head',1]]}}));
      mdLoft(B,HR,{seg:16,capB:true,col:m=>m.s>.1&&m.i>1.5?hd2:a181Nz(hd,m,.3,16),keep:m=>!(m.s>.3&&m.y<hy)});
      u8_boneCape(B,S,R,{col:0x2a2a24,len:J.rh1[1]-.08});
      const zq=y=>{const q=cgAt(T,y);return (q[4]||0)-q[3]*.95-.08},qa=[-.07,J.spine[1]-.02,zq(J.spine[1])],qb=[.11,T[6][0]+.02,zq(T[6][0])-.02];
      k.L('chest','c',0x5a3a20,qa,qb,.048,.054,8);k.L('chest','c',0x3a2618,add3(qa,[.012,.03,0]),add3(qb,[-.012,-.03,0]),.056,.056,8);k.L('chest','c',0x3a2618,qb,add3(qb,[.004,.012,0]),.058,.052,8);
      for(let i=0;i<4;i++){const b0=add3(qb,[-.024+i*.016,-.02,.004*i]),t=add3(b0,[.03+i*.008,.15,-.03]);k.L('chest','c',0x8a6a40,b0,t,.0055,.0055,4);k.p('chest','cone4','c',[0x8a2a1a,0xe8e0d0,0x2a2a2a,0x8a2a1a][i],t[0],t[1]-.01,t[2],.016,.06,.005,0,0,-.2)}
      const s0=R.rib(4,-1,5),s1=R.rib(1,1,6),sh=[J.aR0[0]*.72,J.aR0[1]+.035,J.aR0[2]-.01],s3=add3(qb,[-.01,-.03,.03]);
      cgTube(B,[s0,lerp3(s0,s1,.5),s1,sh,s3],[.012,.012,.012,.012,.012],[R.TW(s0[1]),R.TW((s0[1]+s1[1])/2),[['chest',1]],[['chest',1]],[['chest',1]]],0x3a2618,{seg:6,capA:true,capB:true});
      k.L('chest','c',0x2a2a24,add3(qb,[.03,-.02,.03]),add3(qb,[.07,-.3,-.03]),.035,.012,3)}
    // the archer's strung arms are as the warrior's; both get the knee-bent ready stance (ST179)
  })});
ST179.skel={sx:.1,hx:.06,lk:.1,rk:.1};ST179.archer={sx:.1,hx:.06,lk:.1,rk:.1};

// ---------------- Ossuary Colossus: a giant of heaped bones: doubled limbs, a barrel of ribs with skulls fused in, skulls on the
// shoulders, a crown of bone spikes, green grave-fire in the chest, a femur club ----------------
(function(){const S=cgHuman({h:.78,w:1.3,d:1.2,at:1.5,lt:1.4,hs:1.05,armL:1.08}),J=S.J,T=S.torso,bone=0x968c74,bone2=0x6e6652,dark=0x3e3a2e,eye=0x7aff9a,fire=0x5aff7a,iron=0x3a3a38;
  cgBonesReg('colossus',S,function(B,P,k){const th=2.3,R=cgBones(B,k,S,{bone,bone2,th,cage:1.32,rt:1.45,hand:1.35,eye,fist:s=>s>0});
    const tb=y=>y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis';
    // limbs doubled up with extra bones lashed alongside
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],l0=J[L+'0'],l1=J[L+'1'],l2=J[L+'2'];
      cgBoneTube(B,add3(a0,[s*.04,-.05,.03]),add3(a1,[s*.04,.04,.03]),.042,.036,[[A+'0',1]],[[A+'0',1]],bone2);cgBoneTube(B,add3(a1,[s*.035,-.04,.03]),add3(a2,[s*.03,.05,.03]),.038,.032,[[A+'1',1]],[[A+'1',1]],bone2);
      cgBoneTube(B,add3(l0,[s*.035,-.06,.025]),add3(l1,[s*.035,.06,.025]),.05,.042,[[L+'0',1]],[[L+'0',1]],bone2);cgBoneTube(B,add3(l1,[s*.03,-.06,.025]),add3(l2,[s*.025,.08,.025]),.044,.038,[[L+'1',1]],[[L+'1',1]],bone2);
      // a great skull on each shoulder, eyes burning, a fan of spikes
      const c=add3(a0,[s*.05,.085,0]);k.p(A+'0','sph2','c',bone,c[0],c[1],c[2],.105,.11,.115);k.p(A+'0','sph2','c',bone2,c[0],c[1]-.075,c[2]+.03,.075,.04,.08);
      [-1,1].forEach(t=>{k.p(A+'0','sph','c',0x080806,c[0]+t*.038,c[1]+.01,c[2]+.092,.026,.02,.02);k.p(A+'0','sph','g',eye,c[0]+t*.038,c[1]+.01,c[2]+.104,.014,.01,.008)});
      for(let i=0;i<4;i++)k.p(A+'0','cone4','c',bone2,c[0]+s*(.02+i*.025),c[1]+.12,c[2]-.06+i*.04,.02,.12,.02,-.3,0,-s*.5)});
    // skulls fused into the ribs
    [[0,-1,2],[0,1,4],[1,-1,5],[1,1,2],[2,-1,3],[2,1,5],[3,-1,1],[3,1,3],[4,-1,4],[4,1,1],[5,-1,2],[5,1,4]].forEach(([ri,s,j],n)=>{const p=R.rib(ri,s,j),zc=cgAt(T,p[1])[4]||0,o=nrm3([p[0],0,p[2]-zc]),t=[o[2],0,-o[0]],c=add3(p,mul3(o,.03)),bn=tb(p[1]);
      k.p(bn,'sph2','c',n%2?bone:bone2,c[0],c[1],c[2],.058,.064,.062);[-1,1].forEach(e=>{const q=add3(add3(c,mul3(o,.05)),add3(mul3(t,e*.02),[0,.012,0]));k.p(bn,'sph','c',0x0a0a08,q[0],q[1],q[2],.013,.012,.012)})});
    // a crown of bone spikes
    for(let i=0;i<7;i++){const a=-1.35+i*.45,y=S.hp(0,1.705,0)[1],q=cgAt(S.head,y),bp=[Math.sin(a)*q[1]*.7,y,(q[4]||0)+Math.cos(a)*q[2]*.7];k.p('head','cone4','c',bone2,bp[0],bp[1]+.05,bp[2],.02,.15,.02,-Math.cos(a)*.35,0,Math.sin(a)*.35)}
    // green grave-fire in the chest, burning on the column; green fire licking up out of the sockets
    {const c=R.sp(J.chest[1]-.02),z=c[2]+.024*th+.09;k.p('chest','oct','g',fire,0,J.chest[1]-.02,z,.1,.14,.085);k.p('chest','sph','g',0x2ae05a,0,J.chest[1]-.04,z,.13,.15,.1)}
    [-1,1].forEach(s=>{const H=S.head,y=S.hp(0,1.629,0)[1],q=cgAt(H,y),z=(q[4]||0)+q[2]*.92-.01;for(let i=0;i<3;i++)k.L('head','g',fire,[s*.034*S.hs,y+.005,z],[s*(.04+i*.012)*S.hs,y+.06+i*.02,z-.03-i*.015],.012-i*.003,.002,4)});
    // the club: a giant's thigh bone gripped in the right fist, shards lashed round its head with an iron band
    {const a1=J.aR1,a2=J.aR2,d=nrm3(sub3(a2,a1)),g=add3(a2,mul3(d,.11)),x=g[0],y=g[1],z=g[2]+.01;k.L('aR2','c',bone,[x,y+.1,z],[x,y-.38,z+.045],.04,.056,7);k.p('aR2','sph2','c',bone,x,y-.43,z+.05,.1,.09,.09);k.p('aR2','sph2','c',bone2,x,y+.12,z,.058,.05,.058);
      for(let i=0;i<5;i++){const a=i/5*6.283;k.p('aR2','cone4','c',bone2,x+Math.cos(a)*.08,y-.43,z+.05+Math.sin(a)*.08,.022,.14,.022,Math.sin(a)*1.4,0,-Math.cos(a)*1.4)}
      k.p('aR2','ring','m',iron,x,y-.31,z+.04,.064,.35,.064)}
    u8_loin(B,S,R,dark,0x2a2a20,.34)})})();

// ---------------- the wrapped dead: Desert Revenant and Tomb Priest ----------------
// the bandages are the body's own surface raised band by band (no second skin under them), coloured in light and dark bands
function cgWraps(M,S,skip){const N=cgNormals(M),pt=new Array(M.V.length);M.F.forEach(f=>f.v.forEach(i=>{if(pt[i]==null)pt[i]=f.part}));
  M.V.forEach((v,i)=>{if(skip(pt[i],v,N[i]))return;const a=Math.atan2(v[0],v[2]),b=(v[1]+a*.025)*40,fr=b-Math.floor(b),d=.005+.0035*Math.sin(Math.PI*fr);v[0]+=N[i][0]*d;v[1]+=N[i][1]*d;v[2]+=N[i][2]*d});M.N=null}
function u8_wrapCol(m,w1,w2){const a=Math.atan2(m.x,m.z),b=Math.round((m.y+a*.025)*40);return a181H(b,3)<.12?mdSh(w2,.7):b%2?w1:w2}
(function(){const S=cgHuman({h:.92,w:.98,d:.96,at:1.02,lt:1.0,hs:.96}),w1=0xb8a47c,w2=0x8a7a58,lap=0x2a3a6a,gd=0xc8a040,T=S.torso,J=S.J;
  cg181Reg('revenant',S,function(B,P,k,C){const M=C.M,fy=S.hp(0,1.6,0)[1];cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.012})));
    const face=m=>m.part=='head'&&m.y>=fy&&m.s>=.5;cgWraps(M,S,(p,v,n)=>p=='head'&&v[1]>=fy&&n[2]>=.5);cgEmit(B,M,m=>face(m)?0x5a4a32:u8_wrapCol(m,w1,w2));cgEyes(k,M,S,0xffc040,.036,1.629,.9,.004);
    // the nemes: a striped headcloth over the crown with lappets on the chest; a broad gold-and-lapis collar; a robe
    cgShell(B,M,m=>m.part=='head'&&(m.y>S.hp(0,1.645,0)[1]||m.s<-.1),.02,m=>Math.round(m.y*60)%2?gd:lap,{rim:.15});
    [-1,1].forEach(s=>{const p=S.hp(s*.085,1.6,-.01);k.p('head','box','c',lap,p[0],p[1]-.08,p[2]+.01,.05,.18,.012,0,0,s*.08)});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>T[6][0]-.06),.036,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.1});
    cgSkirt(B,S,T[2][0]-.02,.06,.1,.026,m=>a181Nz(0x6a5a3a,m,.3,12),{n:7,keep:m=>!(m.y<.2&&a181H(Math.round(Math.atan2(m.c,m.s)*9),4)<.5)});
    [-1,1].forEach(s=>cgFingers(k,S,s,w2,'claw',1,0x2a2014,.012))})})();
(function(){const S=cgHuman({h:.97,w:.94,d:.94,at:.9,lt:.95,hs:.96}),w1=0xa8946a,w2=0x6e5e40,dk=0x2e2418,gd=0xc8a040,lap=0x2a4a8a,glow=0xffd060,T=S.torso,J=S.J;
  cg181Reg('tombpriest',S,function(B,P,k,C){const M=C.M,fy=S.hp(0,1.6,0)[1];cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.014})));
    const face=m=>m.part=='head'&&m.y>=fy&&m.s>=.5;cgWraps(M,S,(p,v,n)=>p=='head'&&v[1]>=fy&&n[2]>=.5);cgEmit(B,M,m=>face(m)?mdMix(dk,w2,.4):u8_wrapCol(m,w1,w2));cgEyes(k,M,S,0xffb030,.036,1.629,.9,.004);
    // the nemes: a striped lapis-and-gold headcloth over the crown and back of the head, flaring behind the ears, lappets
    // falling over the collar to the chest
    const by=S.hp(0,1.645,0)[1],ly=S.hp(0,1.545,0)[1],fl=S.hp(0,1.66,0)[1];
    cgShell(B,M,m=>m.part=='head'&&(m.y>by||(m.s<.25&&m.y>ly)),v=>{const lo=Math.max(0,Math.min(1,(fl-v[1])/(.1*S.hs)));return .016+.024*lo*Math.min(1,Math.abs(v[0])/(.07*S.hs))},m=>Math.round(m.y*60)%2?gd:lap,{t:'m',rim:.1});
    const sh=T[6][0];[-1,1].forEach(s=>{const q1=cgTAt(S,sh-.03),q2=cgTAt(S,sh-.15),p0=S.hp(s*.06,1.585,-.03),p1=S.hp(s*.1,1.54,-.01),p2=[s*q1.rx*.52,sh-.02,q1.z+q1.f+.048],p3=[s*q2.rx*.5,sh-.15,q2.z+q2.f+.03];
      mdLoft(B,[{p:p0,rx:.028,f:.006,b:.006,w:[['head',1]]},{p:p1,rx:.034,f:.006,b:.006,w:[['neck',.5],['head',.5]]},{p:p2,rx:.034,f:.006,b:.006,w:[['chest',1]]},{p:p3,rx:.03,f:.006,b:.006,w:[['chest',1]]}],{seg:8,t:'m',ref:[0,0,1],capB:true,col:m=>Math.round(m.y*60)%2?gd:lap})});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh-.06),.034,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.1});
    // the glowing winged scarab pectoral
    {const c=cgSurf(M,S,J.chest[1]-.03,0,-.004);k.p('chest','sph','m',gd,c[0],c[1],c[2]+.006,.05,.042,.022);k.p('chest','sph','g',glow,c[0],c[1]+.004,c[2]+.024,.026,.022,.01);
      [-1,1].forEach(s=>{k.p('chest','box','m',gd,c[0]+s*.07,c[1]+.012,c[2]-.006,.085,.026,.012,0,-s*.3,s*.35);k.p('chest','box','m',gd,c[0]+s*.06,c[1]-.012,c[2]-.004,.07,.018,.012,0,-s*.28,s*.15);k.p('chest','box','g',glow,c[0]+s*.072,c[1]+.016,c[2]+.002,.06,.008,.006,0,-s*.3,s*.35)})}
    // a kilt of gold and dark linen on a gold belt; loose bandages trailing from the arms and hips
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.2,.05,.024,m=>Math.round(Math.atan2(m.c,m.s)*8)%2?mdSh(w2,.8):gd,{n:5,t:'m'});cgBelt(B,M,T[2][0],.022,.03,gd,'m');
    for(let i=0;i<6;i++){const s=i%2?1:-1,t=.5+i*.25,p=u8_armPt(M,S,s,t,.3);u8_strip(k,M,t<1?(s<0?'aL0':'aR0'):(s<0?'aL1':'aR1'),w2,p,.03,.2+(i%3)*.07,s*1.3,-.08,i)}
    for(let i=0;i<4;i++){const a=Math.PI+(-1+i*.66)*.6,p=cgSurf(M,S,T[1][0]-.02,a,-.008);u8_strip(k,M,'pelvis',w2,p,.04,.34+(i%2)*.12,a,-.05,i+2)}
    [-1,1].forEach(s=>cgFingers(k,S,s,w2,s>0?'fist':'claw',1,0x2a2014,.01))})})();
ST179.revenant={sx:.12,hx:-.06,lk:.09,rk:.09,lz:-.05,le:-.25};

// ---------------- Grave Ghoul: gaunt and stooped, grey-green, raised ribs, a knuckled spine, tusks, burial rags ----------------
(function(){const S=cgHuman({h:.76,w:.9,d:.9,rw:[.92,.95,.84,.92,.98,.98,1.02,.98],at:.86,lt:.88,hs:.92,hy:1.06,armL:1.18,facePush:(i,j,a)=>(i<=3&&Math.sin(a)>.2)?.008:0}),sk=0x5e6a5c,sk2=0x444e42,rag=0x4a4636,rag2=0x3a382c,T=S.torso,J=S.J;
  cg181Reg('ghoul',S,function(B,P,k,C){const M=C.M;cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.1)return 0;let d=-.01*cgG(x,y,0,1.597,.012,.01)+.016*cgG(x,y,0,1.65,.05,.008);[-1,1].forEach(s=>{d-=.02*cgG(x,y,s*.037,1.63,.016,.011);d-=.012*cgG(x,y,s*.05,1.57,.016,.016)});return d}));
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-S.hp(0,1.556,0)[1])<.006*S.hs&&Math.abs(m.x)<.04*S.hs)return 0x1a0a08;if(m.part=='head'&&m.s>.4&&Math.abs(m.x)<.012&&Math.abs(m.y-S.hp(0,1.596,0)[1])<.008)return 0x0a0806;
      return m.s<-.4?sk2:a181Nz(sk,m,.2,18)});
    cgEyes(k,M,S,0x9aff6a,.037,1.63,.95,-.004);cgEars(k,M,S,sk,1.63,.08,.4,.6,.02);
    // tusks up from the lower jaw
    [-1,1].forEach(s=>{const q=S.hp(s*.022,1.552,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','cone4','c',0xc8c0a0,p[0],p[1]+.008*S.hs,p[2]-.002,.008*S.hs,.028*S.hs,.008*S.hs,-.25,0,-s*.12)});
    // ribs standing out of the chest, knuckled vertebrae down the hunched back, boils, a stitched wound
    for(let i=0;i<4;i++){const y=J.chest[1]+.05-i*.05;[-1,1].forEach(s=>{const p=cgSurf(M,S,y,s*.28,-.003),m=cgSurf(M,S,y-.016,s*.72,.002),q=cgSurf(M,S,y-.034,s*1.15,-.003),bn=y>J.chest[1]-.04?'chest':'spine';k.L(bn,'c',0xb8b098,p,m,.008,.008,5).L(bn,'c',0xb8b098,m,q,.008,.007,5)})}
    for(let i=0;i<8;i++){const y=T[6][0]-i*.06,p=cgSurf(M,S,y,Math.PI,-.004);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','sph','c',0xb8b098,p[0],p[1],p[2],.022,.018,.02)}
    [[J.chest[1],.6],[J.spine[1],-1.2],[J.chest[1]+.06,2.1],[J.spine[1]-.04,-2.6]].forEach(([y,a])=>{const p=cgSurf(M,S,y,a,-.006);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','sph','c',0x8a9a5a,p[0],p[1],p[2],.022,.02,.018)});
    {const p=cgSurf(M,S,J.spine[1]+.03,-.4,.0),q=cgSurf(M,S,J.spine[1]-.07,-.18,.0);k.L('spine','c',0x3a1a14,p,q,.005,.005,4);for(let i=0;i<4;i++){const c=lerp3(p,q,(i+.5)/4);k.p('spine','box','c',0x1a1210,c[0],c[1],c[2],.026,.004,.006,0,0,.6)}}
    // burial rags: a loincloth, rags hanging from the left shoulder, a rag bound round each forearm
    cgSkirt(B,S,T[2][0]-.03,J.rh1[1]+.06,.04,.016,m=>a181Nz(0x2e2e28,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*4)%2==0&&!(m.y<J.rh1[1]+.15&&a181H(Math.round(Math.atan2(m.c,m.s)*9),2)<.4)});cgBelt(B,M,T[2][0]-.02,.015,.018,0x2a2a24);
    [[T[6][0]+.01,-1.1],[T[6][0]-.01,-.6],[T[6][0]-.07,-1.45]].forEach(([y,a],i)=>{const p=cgSurf(M,S,y,a,-.008);u8_strip(k,M,'chest',i%2?rag:rag2,p,.045,.27+i*.03,a,-.1,i)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',y=J[A+'1'][1]*.3+J[A+'2'][1]*.7;cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-y)<.028,.014,m=>a181Nz(rag,m,.35,14),{rim:.15});
      cgFingers(k,S,s,sk2,'claw',1.3,0x2a2420,.04);cgToes(k,S,s,sk2,.02)})})})();
ST179.ghoul={sx:.42,hx:-.38,lk:.34,rk:.34,ax:-.35,lx:-.35,ex:-.6,le:-.6};

// ---------------- the drowned: Drowned Thrall (bloated, barnacled, chained, weed) and Drowned Wretch (gaunt, hair over its face) ----------------
function cgBarnacles(k,M,S,n,seed,col){for(let i=0;i<n;i++){const y=S.torso[1][0]+a181H(i,seed)*(S.torso[6][0]-S.torso[1][0]),a=(a181H(i,seed+3)-.5)*6.2,bn=y>S.J.chest[1]-.04?'chest':y>S.J.spine[1]?'spine':'pelvis';
  for(let j=0;j<3;j++){const b=a+(j-1)*.12,p=cgSurf(M,S,y+(j%2)*.014,b,-.005);k.p(bn,'cone','c',j%2?col:mdSh(col,.8),p[0],p[1],p[2],.012,.02,.012,Math.cos(b)*.6,0,-Math.sin(b)*.6)}}}
(function(){const S=cgHuman({h:.84,w:1.3,d:1.32,rw:[1.12,1.2,1.45,1.48,1.32,1.25,1.28,1.38],rf:[1.1,1.3,1.85,1.75,1.38,1.2,1.15,1.2],at:1.55,lt:1.45,hs:.98,hw:1.08,nw:1.6,facePush:BRUTEJAW}),sk=0x4a625c,sk2=0x34463f,rot=0x2a3424,cl=0x2a3436,ir=0x3a3e44,rust=0x6a3a20,weed=0x2a4a2a,weed2=0x4a6a2a,barn=0xb8b0a0,T=S.torso,J=S.J;
  cg181Reg('drowned',S,function(B,P,k,C){const M=C.M,kn=J.rh1[1];
    const FH=cgFaceHuman({nose:.8,nw:1.4,brow:1.3,hollow:-.006,chin:.8});cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>FH(x,y,z,n)-(n[2]>.1?.012*cgG(x,y,0,1.552,.026,.011):0)));   // a slack, sagging mouth
    cgSculpt(M,{torso:1,arm:1,leg:1},(x,y,z,n)=>.012*(n3Sn(x*1.3,y*1.3,z*1.3,8,3)-.5));
    const my=S.hp(0,1.552,0)[1],pants=m=>m.part=='leg'&&m.y>kn-.1;
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-my)<.012*S.hs&&Math.abs(m.x)<.026*S.hs)return 0x0a1210;return cgFacePaint(S,m,sk,{sock:0x101a18})||(n3Sn(m.x,m.y,m.z,10,2)>.72?rot:m.s<-.4?sk2:a181Nz(sk,m,.25,14))},{keep:m=>!pants(m)});
    cgEyes(k,M,S,0xa8fff0,.036,1.629,.9,-.002);cgTeeth(k,M,S,[[-.018,1.563,.01],[-.006,1.564,.013],[.007,1.564,.011],[.019,1.562,.012]],barn);
    // the rags of a sailor's shirt (sides, back, sleeves), breeches, an iron-studded belt, a loincloth flap
    cgShell(B,M,m=>(m.part=='torso'&&m.y>T[1][0]&&m.s<.3&&!(a181H(Math.round(m.x*30),Math.round(m.y*30))<.25))||(m.part=='arm'&&m.y>J.aR1[1]),.014,m=>a181Nz(cl,m,.35,14));
    cgShell(B,M,pants,.012,m=>a181Nz(cl,m,.3,14),{rim:0});cgBelt(B,M,T[2][0]-.02,.02,.03,ir,'m');
    cgSkirt(B,S,T[2][0]-.03,J.rh1[1]+.1,.04,.03,m=>a181Nz(0x1a2426,m,.3,12),{n:5,keep:m=>Math.abs(m.c)<.4&&!(m.y<J.rh1[1]+.18&&a181H(Math.round(m.c*12),3)<.4)});
    cgBarnacles(k,M,S,14,3,barn);
    // strands of seaweed hair from the crown, weed hanging off the shoulders and arms
    u8_strands(k,M,S,Array.from({length:9},(_,i)=>{const a=-2+i*.5;return [a,1.7,.03,.3+(i%3)*.1,Math.abs(a)<.8?.42:.1,i%2?weed:weed2,i]}));
    for(let i=0;i<8;i++){const y=T[6][0]-a181H(i,5)*.12,a=Math.PI+(a181H(i,9)-.5)*3.6,p=cgSurf(M,S,y,a,-.008);u8_strip(k,M,y>J.chest[1]-.04?'chest':'spine',i%2?weed:weed2,p,.03,.16+a181H(i,2)*.12,a,-.15,i)}
    [-1,1].forEach(s=>{for(let i=0;i<3;i++){const t=.4+i*.5,p=u8_armPt(M,S,s,t,0);u8_strip(k,M,t<1?(s<0?'aL0':'aR0'):(s<0?'aL1':'aR1'),i%2?weed:weed2,p,.034,.22,s*1.5,-.05,i+3)}});
    // an iron and rust chain round the neck and across the body
    const nk=[];for(let i=0;i<14;i++){const a=i/14*6.283;nk.push(cgSurf(M,S,T[6][0]+.012,a,-.004))}u8_chain(k,nk,()=>'chest',null,.024,ir,rust);
    const dg=[];for(let i=0;i<10;i++){const t=i/9;dg.push(cgSurf(M,S,T[6][0]-.04-t*(T[6][0]-T[1][0]-.06),-1.0+t*2.1,-.004))}u8_chain(k,dg,p=>p[1]>J.chest[1]-.04?'chest':p[1]>J.spine[1]?'spine':'pelvis',p=>nrm3([p[0],0,p[2]]),.024,ir,rust);
    // iron cuffs; the anchor held by its shank in the right fist, flukes hanging low
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'2'][1]+.05))<.025,.022,ir,{t:'m',rim:.1});cgFingers(k,S,s,sk2,s>0?'fist':'claw',1.1,0x1a2420,s>0?0:.02);cgToes(k,S,s,sk2,.012)});
    {const a1=J.aR1,a2=J.aR2,d=nrm3(sub3(a2,a1)),g=add3(a2,mul3(d,.085)),x=g[0],y=g[1],z=g[2]+.012;
      k.L('aR2','m',ir,[x,y+.07,z],[x,y-.56,z+.03],.032,.032,6);k.p('aR2','ring','m',rust,x,y+.11,z,.066,.55,.066,0,0,Math.PI/2);k.p('aR2','box','m',ir,x,y-.44,z+.025,.055,.045,.27);
      [-1,1].forEach(s=>{k.L('aR2','m',ir,[x,y-.56,z+.03],[x,y-.42,z+.03+s*.22],.032,.024,5);k.p('aR2','cone4','m',rust,x,y-.39,z+.03+s*.25,.045,.1,.022,s*.6)});k.p('aR2','sph','m',ir,x,y-.56,z+.03,.04)}})})();
(function(){const S=cgHuman({h:.84,w:.92,d:.9,rw:[.92,.95,.82,.9,.95,.95,.98,.95],at:.86,lt:.88,hs:1.0,armL:1.12}),sk=0x5e6e66,sk2=0x44544e,rib=0x9a9a86,hr=0x0c0e0e,hr2=0x1a1e1c,sh1=0x6a6a5c,sh2=0x4a4a40,weed=0x2a4a2a,T=S.torso,J=S.J;
  cg181Reg('dgwretch',S,function(B,P,k,C){const M=C.M,my=S.hp(0,1.55,0)[1];
    const FH=cgFaceHuman({nose:.8,brow:1.3,hollow:.016});cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>FH(x,y,z,n)-(n[2]>.1?.02*cgG(x,y,0,1.548,.024,.016):0)));   // the jaw hangs open
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.35&&Math.abs(m.y-my)<.02*S.hs&&Math.abs(m.x)<.025*S.hs)return 0x040606;return cgFacePaint(S,m,sk,{sock:0x0a1210})||(n3Sn(m.x,m.y,m.z,13,5)>.74?0x3a3a4a:m.s<-.4?sk2:a181Nz(sk,m,.2,16))});
    cgEyes(k,M,S,0xb8fff0,.036,1.629,.85,-.002);
    // broken teeth in the gaping mouth
    cgTeeth(k,M,S,[[-.02,1.567,.014],[-.009,1.568,.008],[.003,1.568,.016],[.014,1.567,.006],[.022,1.566,.012]],0xb8b098);
    // long black hair: a skullcap and strands plastered down over the face and shoulders
    cgHair(B,M,S,{col:hr,line:1.672,neck:true,thick:.012});
    u8_strands(k,M,S,Array.from({length:16},(_,i)=>{let a=-2.9+i*.36;const fr=Math.abs(a)<.8;if(fr&&Math.abs(a)>.25&&Math.abs(a)<.55)a=Math.sign(a)*.64;return [a,fr?1.675:1.66,fr?.034:.046,fr?.38+(i%3)*.07:.5+(i%4)*.1,fr?.36:.1,i%3?hr:hr2,i]}));
    // the ribs as bars on the chest over the sunken belly
    for(let i=0;i<5;i++){const y=J.chest[1]+.08-i*.05;for(let j=0;j<7;j++){const a=-1.2+j*.4,p=cgSurf(M,S,y-Math.abs(a)*.02,a,-.004);k.p(y>J.chest[1]-.04?'chest':'spine','box','c',rib,p[0],p[1],p[2],.034,.009,.014,0,a,0)}}
    // a shroud in rags: rags on the shoulders, the shroud's skirt, weed caught on the arms; long black talons
    cgShell(B,M,m=>(m.part=='torso'&&m.y<T[2][0]+.06)||(m.part=='leg'&&m.y>J.rh1[1]-.05),.012,m=>a181Nz(sh2,m,.35,14));cgSkirt(B,S,T[2][0],J.rh1[1]-.05,.06,.018,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*6)%2?sh1:sh2,m,.3,12),{n:5,keep:m=>!(m.y<J.rh1[1]+.15&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<.45)});
    for(let i=0;i<8;i++){const a=-2.6+i*.75,p=cgSurf(M,S,T[6][0]-.02,a,-.008);u8_strip(k,M,'chest',i%2?sh1:sh2,p,.07,.26+(i%3)*.08,a,-.12,i)}
    [-1,1].forEach(s=>{const p=u8_armPt(M,S,s,.7,0);u8_strip(k,M,s<0?'aL0':'aR0',weed,p,.03,.25,s*1.4,-.05,s+3);cgFingers(k,S,s,sk2,'claw',1.15,0x0a0a0a,.085);cgToes(k,S,s,sk2,.014)})})})();
ST179.dgwretch={sx:.3,hx:-.26,lk:.27,rk:.27,ax:-.3,lx:-.3,ex:-.5,le:-.5};
