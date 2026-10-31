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
// (refine pass, owner Oct 31 2026: "check every angle") the cage bodies' arms and thighs grow out of the shoulder and hip (ud_spec),
// detail is baked shading and flowing colour instead of triangles, cloth that is a shell hides the skin under it, the ghoul is a
// crawler and the colossus a hunched heap of fused bones; every one is back under the regular-foe ceiling of 8k triangles.
function cgBoneTube(B,a,b,r0,r1,w0,w1,col,n){const R=[];n=n||4;for(let i=0;i<=n;i++){const t=i/n,bulge=1+.35*Math.pow(Math.abs(t-.5)*2,4);R.push({p:lerp3(a,b,t),rx:(r0+(r1-r0)*t)*bulge,f:(r0+(r1-r0)*t)*bulge,b:(r0+(r1-r0)*t)*bulge,w:t<.5?w0:w1})}
  mdLoft(B,R,{seg:8,capA:true,capB:true,col})}
// a part on bone bn with its own axes (X along ax, Y along ay; uniform size sc, or [sx,sy,sz])
function u8_part(k,bn,geo,t,col,p,ax,ay,sc){const s=Array.isArray(sc)?sc:[sc,sc,sc],x=nrm3(ax),z=nrm3(cross3(x,ay)),y=cross3(z,x),m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...mul3(x,s[0])),new THREE.Vector3(...mul3(y,s[1])),new THREE.Vector3(...mul3(z,s[2])));
  m.setPosition(p[0],p[1],p[2]);k.P.push({bn,geo,t,col,m});return k.P[k.P.length-1]}
var u8_LINK=null,ud_RING=null;function ud_ring(){return ud_RING||(ud_RING=new THREE.TorusGeometry(1,.14,3,8))}
function u8_link(){return u8_LINK||(u8_LINK=new THREE.TorusGeometry(1,.2,3,6))}   // (refine) 36 triangles a link
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
  const skull=H.slice(3).map(q=>({p:[0,q[0],q[4]],rx:q[1]*.95,f:q[2]*.92,b:q[3]*.95,w:[['head',1]]}));mdLoft(B,skull,{seg:14,capA:true,capB:true,col});
  const jaw=H.slice(0,4).map(q=>({p:[0,q[0]+.004,q[4]+.004],rx:q[1]*.86,f:q[2]*.9,b:q[3]*.55,w:[['head',1]]}));mdLoft(B,jaw,{seg:14,capA:true,capB:true,col:bd});
  const fz=y=>{const q=cgAt(H,y);return (q[4]||0)+q[2]*.92};const ey=S.hp(0,1.629,0)[1],nyy=S.hp(0,1.597,0)[1],my=S.hp(0,1.562,0)[1];
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.034*S.hs,ey,fz(ey)-.014*S.hs,.019*S.hs,.014*S.hs,.016*S.hs,0,0,s*-.25);if(o.eye)k.p('head','sph','g',o.eye,s*.035*S.hs,ey,fz(ey)-.003*S.hs,.012*S.hs,.008*S.hs,.007*S.hs,0,0,s*-.2)});
  k.p('head','cone4','c',0x080606,0,nyy,fz(nyy)-.006,.012*S.hs,.026*S.hs,.008,Math.PI);for(let i=-3;i<=3;i++)k.p('head','box','c',0xe0d8c0,i*.011*S.hs,my,fz(my)-.004,.008*S.hs,.014*S.hs,.008);
  // the column: lumbar and thoracic on the torso's weights, the neck vertebrae on to the skull's base (inside it)
  const sp=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)-q[3]*.55]},TW=y=>cgTorsoW(S,y),NW=y=>y<=J.neck[1]?TW(y):cgNeckW(S,y),Y0=J.pelvis[1]-.05,Y1=J.neck[1]-.01,hb=[0,H[3][0]+.014,(H[3][4]||0)-.012];
  const cs=[];for(let i=0;i<=10;i++){const y=Y0+(Y1-Y0)*i/10,r=(.024-.004*i/10)*th;cs.push({p:sp(y),rx:r,f:r*.92,b:r*.92,w:TW(y)})}
  const c1=sp(Y1);for(let i=1;i<=4;i++){const p=lerp3(c1,hb,i/4),r=.017*th;cs.push({p,rx:r,f:r,b:r,w:NW(p[1])})}mdLoft(B,cs,{seg:8,capA:true,capB:true,col:bd});
  for(let i=0;i<11;i++){const y=Y0+(Y1-Y0)*i/10,p=sp(y);k.p(y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis','dod','c',bone,p[0],p[1],p[2]-.016*th,.022*th,.016*th,.02*th)}
  for(let i=1;i<4;i++){const p=lerp3(c1,hb,i/4);k.p(p[1]>J.head[1]-.02?'head':'neck','dod','c',bone,p[0],p[1],p[2]-.012*th,.016*th,.012*th,.015*th)}
  // the ribs: from the column round the sides; the upper ones close on the sternum
  const r0=J.spine[1]+.04,r1=T[6][0]-.03,sf=y=>{const q=cgAt(T,y);return [0,y,(q[4]||0)+q[2]*.86*cg]},RB=[];
  for(let i=0;i<6;i++){const y=r1-(r1-r0)*i/5,q=cgAt(T,y);RB.push({});[-1,1].forEach(s=>{const pts=[];for(let j=0;j<=6;j++){const a=Math.PI-(Math.PI-.3)*j/6;pts.push([s*Math.sin(a)*q[1]*.92*cg,y-.02*Math.sin(j/6*Math.PI)-j*.006,(q[4]||0)+Math.cos(a)*(Math.cos(a)>0?q[2]:q[3])*.9*cg])}
    pts[0]=sp(y);const e=pts[6];if(i<4)pts.push([s*.006,e[1]-.004,sf(e[1])[2]]);RB[i][s]=pts;mdLoft(B,pts.map(p=>({p,rx:.011*th*rt,f:.008*th*rt,b:.008*th*rt,w:TW(y)})),{seg:5,capB:true,col})})}
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
    if(o.mitt&&o.fist&&o.fist(s)){const rf=o.hand||1,H=ud_hf(S,s),c0=add3(a2,mul3(H.d,.024*Math.sqrt(rf))),pc=sub3(H.kn,mul3(H.d,.012));k.p(A+'2','sph','c',bone,a2[0],a2[1],a2[2],.016*th);k.p(A+'2','sph','c',bone,c0[0],c0[1],c0[2],.017*rf,.017*rf,.017*rf);
      u8_part(k,A+'2',dkG().sph,'c',bone,pc,H.f,H.d,[.031*rf,.03*Math.sqrt(rf),.0135*rf]);ud_fingers(B,S,s,bone,'fist',1.4,bd,0,rf)}
    else u8_hand(k,S,s,bone,o.fist&&o.fist(s)?'fist':'claw',bd,th,o.hand||1);
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

// ---------------- (refine pass, owner Oct 31 2026: the undead brought to the Amalgam standard) ----------------
// Cage bodies: 16 columns, a shoulder socket as tall as the arm (sock), the arm and thigh grown out of the shoulder and hip (j2:
// the "seated limbs" fix), 8 head rings, only the limb rings that shape the outline or bend a joint, 3 foot rings. Detail is
// paint: baked creases and height light (cgShade), colour that flows corner to corner (vcol), cloth that is a colour band.
// o: the cgHuman options (any of these can be overridden)
function ud_spec(o){const B=CG181.base;return cgHuman(Object.assign({n:16,sock:1,j2:1,footLite:1,facePush:ud_FACE,
  head:B.head.filter((q,i)=>i%2==0),arm:B.arm.filter((q,i)=>i!=2&&i!=5),leg:B.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},o))}
// the face push for the 8-ring head (jaw angle on the throat / chin rings, hollow cheeks on the upper-lip ring)
function ud_FACE(i,j,a){const ca=Math.cos(a),sa=Math.sin(a),side=Math.abs(ca);return (i<=1&&sa>-.2&&side>.6?.006:0)-(i==2&&sa>.4&&side>.3&&side<.8?.008:0)}
// a shell (cloth, wraps, plates) that remembers what it covers: the skin under it is not drawn (ud_body draws the rest), so
// a covered body costs no extra triangles. o.vcol: a colour per corner (as cgEmit), rim: the rim tuck (0 = on the skin)
function ud_sh(B,M,sel,off,col,o){o=o||{};const N=M.N||(M.N=cgNormals(M)),pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map();
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1)}});
  const rim=new Set();M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;if(cnt.get(k)==1){rim.add(a);rim.add(b)}}});
  const P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=M.V[i],n=N[i],d=(typeof off=='function'?off(v):off)*(rim.has(i)?(o.rim==null?0:o.rim):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  cgEmit(B,M,col,{t:o.t,pos,vcol:o.vcol,keep:(m,fi)=>pick[fi]});if(!o.show)(M.udHide||(M.udHide=[])).push(pick)}
// the skin: every face no shell covers, plus the covered faces that touch an open one (so no hole can show at a shell's rim)
function ud_body(B,M,col,o){o=o||{};const H=M.udHide||[],F=M.F,cov=F.map((f,i)=>H.some(p=>p[i])),open=new Uint8Array(M.V.length);F.forEach((f,i)=>{if(!cov[i])f.v.forEach(v=>open[v]=1)});
  cgEmit(B,M,col,{vcol:o.vcol,keep:(m,fi)=>(!cov[fi]||F[fi].v.some(v=>open[v]))&&(!o.keep||o.keep(m,fi))})}
const ud_cl=(v,a,b)=>Math.max(a==null?0:a,Math.min(b==null?1:b,v)),ud_ss=(a,b,x)=>{const t=ud_cl((x-a)/(b-a));return t*t*(3-2*t)};
// a smooth mottle between two colours (object-space noise, never per face): f = frequency, amt = how far toward c2
function ud_mot(m,c1,c2,f,seed,amt){return mdMix(c1,c2,ud_cl((n3Sn(m.x,m.y,m.z,f,seed)-.35)*1.6)*(amt==null?1:amt))}
// cloth on a loft (robe, skirt, loincloth): alternate fold columns a shade apart, darker toward the hem (y0) and inside
function ud_cloth(m,c,y0,y1,nf){const f=Math.round(Math.atan2(m.c,m.s)*(nf||7))%2?1:.86;return mdSh(c,f*(.72+.28*ud_ss(y0,y1,m.y)))}
// a hand's frame (as cgFingers): d down the hand, u the back of the hand, f across the knuckles (thumb side), kn the knuckles
function ud_hf(S,s,kd){const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,
  u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw)));return {bn:bn+'2',a2,d,u,f,kn:add3(a2,mul3(d,kd==null?.072:kd))}}
// v turned by angle a round the unit axis k
function ud_rot(v,k,a){const c=Math.cos(a),sn=Math.sin(a),dt=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],cr=cross3(k,v);return [v[0]*c+cr[0]*sn+k[0]*dt*(1-c),v[1]*c+cr[1]*sn+k[1]*dt*(1-c),v[2]*c+cr[2]*sn+k[2]*dt*(1-c)]}
// (refine: clean hands) fingers that grow out of the hand: one rounded, tapering loft per finger in the hand's own colour, rooted
// inside the palm and curling toward it, a dark claw continuing from the tip; no strings of separate sticks.
// kind 'claw' | 'fist', len (finger length), nail colour, tip (claw length), rf (thickness)
function ud_fingers(B,S,s,col,kind,len,nail,tip,rf){rf=rf||1;const H=ud_hf(S,s),{d,u,f,kn}=H,W=[[H.bn,1]],L=(len||1)*.08,ax=nrm3(cross3(u,d)),fist=kind=='fist';
  const P=(b,x,y)=>add3(add3(b,mul3(f,x)),mul3(u,y)),D=(a,b,c)=>nrm3(add3(add3(mul3(d,a),mul3(u,b)),mul3(f,c)));
  const digit=(p,dir,k,l,r,n,curl,tp)=>{const Rg=[{p:sub3(p,mul3(dir,.016)),rx:r*1.15,f:r*1.15,b:r*1.15,w:W},{p,rx:r,f:r,b:r,w:W}];let a=p,dv=dir;
    for(let i=0;i<n;i++){a=add3(a,mul3(dv,l/n));dv=ud_rot(dv,k,curl);const q=r*(1-.32*(i+1)/n);Rg.push({p:a,rx:q,f:q,b:q,w:W})}const nr=Rg.length;
    if(tp){const e=add3(a,mul3(dv,tp)),q=r*.62;Rg.push({p:add3(a,mul3(dv,tp*.3)),rx:q,f:q,b:q,w:W},{p:e,rx:.0012,f:.0012,b:.0012,w:W})}
    mdLoft(B,Rg,{seg:5,capB:true,col:m=>tp&&m.i>nr-1?nail:col})};
  if(fist){ud_mitten(B,H,rf,L,col);const t0=P(add3(H.a2,mul3(d,.034)),.026*rf,-.01),t1=add3(t0,mul3(D(.55,-.62,-.18),L*.32)),t2=add3(t1,mul3(D(.12,-.3,-.95),L*.3));
    mdLoft(B,[{p:sub3(t0,mul3(D(.55,-.62,-.18),.014)),rx:.012*rf,f:.012*rf,b:.012*rf,w:W},{p:t0,rx:.0115*rf,f:.0115*rf,b:.0115*rf,w:W},{p:t1,rx:.0105*rf,f:.0105*rf,b:.0105*rf,w:W},{p:t2,rx:.0085*rf,f:.0085*rf,b:.0085*rf,w:W}],{seg:6,capB:true,col});return}
  for(let i=0;i<4;i++){const z=(1.5-i)*.016*rf,p=P(kn,z,-.004);digit(p,D(1,-.15,z*.6/rf),ax,L*(i==3?.82:1),.0085*rf,3,.22,tip||0)}
  digit(P(add3(H.a2,mul3(d,.032)),.024*rf,-.008),D(.6,-.3,.75),nrm3(cross3(u,f)),L*.62,.009*rf,2,.3,(tip||0)*.6)}
// a closed fist: the four fingers as ONE rounded mass curling from the knuckles round the grip (in a fist they don't change the
// outline), a slightly bumpy knuckle ridge, the gaps between the fingers painted as dark lines (colour per corner)
function ud_mitten(B,H,rf,L,col){const {d,u,f,kn}=H,W=mdW(B,[[H.bn,1]]),ax=nrm3(cross3(u,d)),C=new THREE.Color(mdC(col)),X=[-1,-.75,-.5,-.25,0,.25,.5,.75,1],n=3;
  let p=add3(add3(kn,mul3(u,-.004*rf)),mul3(d,-.018)),dv=nrm3(add3(d,mul3(u,-.45)));const P=[p];p=add3(p,mul3(dv,.018));P.push(p);for(let i=0;i<n;i++){p=add3(p,mul3(dv,L*.72/n));dv=ud_rot(dv,ax,.8);P.push(p)}
  const RG=P.map((c,i)=>{const t=nrm3(sub3(P[Math.min(i+1,P.length-1)],P[Math.max(i-1,0)])),a=nrm3(sub3(f,mul3(t,f[0]*t[0]+f[1]*t[1]+f[2]*t[2]))),nn=cross3(t,a),hw=.033*rf*(i?1-.1*i/P.length:.5),th=.0115*rf*(i?1-.18*i/P.length:.6),
      kb=i==1||i==2?.22:0,ring=[];
    [1,-1].forEach(sd=>(sd>0?X:X.slice(1,-1).reverse()).forEach(x=>{const g=.5+.5*Math.cos(4*Math.PI*(x-.25)),h=th*Math.pow(Math.max(0,1-x*x),.45)*(sd>0?1+kb*g:1),
      q=add3(add3(c,mul3(a,x*hw)),mul3(nn,sd*h)),line=Math.min(...[-.5,0,.5].map(b=>Math.abs(x-b)))<.01&&i>0?.42:1;ring.push({x:q[0],y:q[1],z:q[2],w:W,rgb:[C.r*line,C.g*line,C.b*line],c})}));return ring});
  const tri=(a,b,c)=>{const o=a.c,nx=(b.y-a.y)*(c.z-a.z)-(b.z-a.z)*(c.y-a.y),ny=(b.z-a.z)*(c.x-a.x)-(b.x-a.x)*(c.z-a.z),nz=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),
      m=[(a.x+b.x+c.x)/3-o[0],(a.y+b.y+c.y)/3-o[1],(a.z+b.z+c.z)/3-o[2]];if(nx*m[0]+ny*m[1]+nz*m[2]<0)mdTri(B,'c',a,c,b,0);else mdTri(B,'c',a,b,c,0)};
  for(let i=0;i<RG.length-1;i++){const A=RG[i],Bq=RG[i+1],N=A.length;for(let j=0;j<N;j++){const k=(j+1)%N;tri(A[j],A[k],Bq[j]);tri(Bq[j],A[k],Bq[k])}}
  const E=RG[RG.length-1],t=nrm3(sub3(P[P.length-1],P[P.length-2])),ce=add3(P[P.length-1],mul3(t,.006*rf)),cv={x:ce[0],y:ce[1],z:ce[2],w:W,rgb:[C.r,C.g,C.b],c:P[P.length-1]};
  for(let j=0;j<E.length;j++){const a=E[j],b=E[(j+1)%E.length],o=a.c,nx=(b.y-a.y)*(cv.z-a.z)-(b.z-a.z)*(cv.y-a.y),ny=(b.z-a.z)*(cv.x-a.x)-(b.x-a.x)*(cv.z-a.z),nz=(b.x-a.x)*(cv.y-a.y)-(b.y-a.y)*(cv.x-a.x);
    if(nx*t[0]+ny*t[1]+nz*t[2]<0)mdTri(B,'c',a,cv,b,0);else mdTri(B,'c',a,b,cv,0)}}
// the point a fist closes round (the curled fingers' middle), the shaft passes through it along dir
function ud_grip(S,s,kd,dep){const H=ud_hf(S,s,kd);return add3(add3(H.kn,mul3(H.d,.022)),mul3(H.u,-(dep||.03)))}
// the last kit part takes the skin's weights at p (it bends with the skin there instead of riding one bone)
function ud_ws(k,M,p){k.P[k.P.length-1].w=cgWAt(M,p)}

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
// (refine) a massive ossuary giant fused out of many dead: hunched under a hump of crossed bones and skulls heaped on its back, a
// small skull sunk low between huge shoulders, long thick doubled arms hanging to the knees, short thick legs. Cheaper kit (the
// fused skulls and their sockets were the heaviest shapes) keeps it under the regular-foe ceiling.
(function(){const S=cgHuman({h:.76,w:1.45,d:1.3,at:1.6,lt:1.5,hs:.92,armL:1.13,legL:.9,neckL:-.03}),J=S.J,T=S.torso,bone=0x968c74,bone2=0x6e6652,dark=0x3e3a2e,eye=0x7aff9a,fire=0x5aff7a,iron=0x3a3a38;
  cgBonesReg('colossus',S,function(B,P,k){const th=2.3,R=cgBones(B,k,S,{bone,bone2,th,cage:1.32,rt:1.45,hand:1.9,mitt:1,eye,fist:s=>s>0});
    const tb=y=>y>J.chest[1]-.04?'chest':y>J.spine[1]?'spine':'pelvis',sh=T[6][0],ch=J.chest[1],sp=J.spine[1];
    // limbs doubled up with extra bones lashed alongside
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'],l0=J[L+'0'],l1=J[L+'1'],l2=J[L+'2'];
      cgBoneTube(B,add3(a0,[s*.04,-.05,.03]),add3(a1,[s*.04,.04,.03]),.042,.036,[[A+'0',1]],[[A+'0',1]],bone2,2);cgBoneTube(B,add3(a1,[s*.035,-.04,.03]),add3(a2,[s*.03,.05,.03]),.038,.032,[[A+'1',1]],[[A+'1',1]],bone2,2);
      cgBoneTube(B,add3(l0,[s*.035,-.06,.025]),add3(l1,[s*.035,.06,.025]),.05,.042,[[L+'0',1]],[[L+'0',1]],bone2,2);cgBoneTube(B,add3(l1,[s*.03,-.06,.025]),add3(l2,[s*.025,.08,.025]),.044,.038,[[L+'1',1]],[[L+'1',1]],bone2,2);
      // a great skull on each shoulder, eyes burning, a fan of spikes
      const c=add3(a0,[s*.05,.085,0]);k.p(A+'0','sph','c',bone,c[0],c[1],c[2],.105,.11,.115);k.p(A+'0','sph','c',bone2,c[0],c[1]-.075,c[2]+.03,.075,.04,.08);
      [-1,1].forEach(t=>{k.p(A+'0','oct','c',0x080806,c[0]+t*.038,c[1]+.01,c[2]+.096,.026,.022,.022);k.p(A+'0','oct','g',eye,c[0]+t*.038,c[1]+.01,c[2]+.108,.012,.01,.008)});
      for(let i=0;i<4;i++)k.p(A+'0','cone4','c',bone2,c[0]+s*(.02+i*.025),c[1]+.12,c[2]-.06+i*.04,.02,.12,.02,-.3,0,-s*.5)});
    // skulls fused into the ribs (dark sockets, a nose hole)
    [[0,-1,2],[0,1,4],[1,1,2],[2,-1,3],[2,1,5],[3,1,3],[4,-1,4],[4,1,1],[5,-1,2]].forEach(([ri,s,j],n)=>{const p=R.rib(ri,s,j),zc=cgAt(T,p[1])[4]||0,o=nrm3([p[0],0,p[2]-zc]),t=[o[2],0,-o[0]],c=add3(p,mul3(o,.03)),bn=tb(p[1]);
      k.p(bn,'dod','c',n%2?bone:bone2,c[0],c[1],c[2],.058,.064,.062);[-1,1].forEach(e=>{const q=add3(add3(c,mul3(o,.052)),add3(mul3(t,e*.02),[0,.012,0]));k.p(bn,'oct','c',0x0a0a08,q[0],q[1],q[2],.015,.013,.013)})});
    // the hump on its back: long bones heaped crosswise on the spine, knobbed at the ends, three skulls staring backward
    const bz=(y,o)=>R.sp(y)[2]-.06-o;
    [[-.2,ch-.14,.16,sh+.04,.05],[.2,ch-.12,-.14,sh+.06,.05],[-.24,ch,.24,ch+.05,.09],[-.12,sp+.02,.1,ch+.12,.08],[.14,sp,-.08,ch+.14,.08],[-.02,ch-.08,.04,sh+.1,.11]].forEach(([x0,y0,x1,y1,o],i)=>{
      const a=[x0,y0,bz(y0,o*.6)],b=[x1,y1,bz(Math.min(y1,sh),o*.6)],bn=tb((y0+y1)/2);k.L(bn,'c',i%2?bone:bone2,a,b,.034,.028,5);k.p(bn,'oct','c',bone,a[0],a[1],a[2],.05,.042,.046,i,.4,0);k.p(bn,'oct','c',bone,b[0],b[1],b[2],.046,.04,.044,0,i*.6,.4)});
    [[-.09,ch+.03],[.1,ch-.02],[0,ch-.12]].forEach(([x,y],i)=>{const c=[x,y,bz(y,.13)],bn=tb(y);k.p(bn,'sph','c',i%2?bone2:bone,c[0],c[1],c[2],.07,.076,.07);
      [-1,1].forEach(e=>k.p(bn,'oct','c',0x0a0a08,c[0]+e*.026,c[1]+.012,c[2]-.06,.018,.016,.014));k.p(bn,'box','c',bone2,c[0],c[1]-.05,c[2]-.03,.06,.022,.04)});
    // a crown of bone spikes
    for(let i=0;i<7;i++){const a=-1.35+i*.45,y=S.hp(0,1.705,0)[1],q=cgAt(S.head,y),bp=[Math.sin(a)*q[1]*.7,y,(q[4]||0)+Math.cos(a)*q[2]*.7];k.p('head','cone4','c',bone2,bp[0],bp[1]+.05,bp[2],.02,.15,.02,-Math.cos(a)*.35,0,Math.sin(a)*.35)}
    // green grave-fire in the chest, burning on the column; green fire licking up out of the sockets
    {const c=R.sp(ch-.02),z=c[2]+.024*th+.09;k.p('chest','oct','g',fire,0,ch-.02,z,.1,.14,.085);k.p('chest','sph','g',0x2ae05a,0,ch-.04,z,.13,.15,.1)}
    [-1,1].forEach(s=>{const H=S.head,y=S.hp(0,1.629,0)[1],q=cgAt(H,y),z=(q[4]||0)+q[2]*.92-.01;for(let i=0;i<3;i++)k.L('head','g',fire,[s*.034*S.hs,y+.005,z],[s*(.04+i*.012)*S.hs,y+.06+i*.02,z-.03-i*.015],.012-i*.003,.002,4)});
    // the club: a giant's thigh bone gripped in the right fist, shards lashed round its head with an iron band
    {const H=ud_hf(S,1),g=ud_grip(S,1,null,.05),cd=nrm3(add3(H.f,mul3(H.d,.75))),A=t=>add3(g,mul3(cd,t)),sd=nrm3(cross3(cd,H.u));
      k.L('aR2','c',bone,A(-.1),A(.36),.036,.054,7);const hd=A(.42),pm=A(-.12);k.p('aR2','dod','c',bone,hd[0],hd[1],hd[2],.1,.09,.09);k.p('aR2','sph','c',bone2,pm[0],pm[1],pm[2],.058,.05,.058);
      for(let i=0;i<5;i++){const a=i/5*6.283,o=add3(mul3(sd,Math.cos(a)),mul3(H.u,Math.sin(a))),q=add3(hd,mul3(o,.08));u8_part(k,'aR2',dkG().cone4,'c',bone2,q,cd,o,[.022,.14,.022])}
      u8_part(k,'aR2',dkG().tor,'m',iron,A(.3),sd,cd,[.064,.05,.064])}
    u8_loin(B,S,R,dark,0x2a2a20,.34)})})();
// the hunch of a giant carrying its heap of bones (the creature's own stance: v113 creatures keep theirs over ST179)
if(N3.def.colossus)N3.def.colossus.stance={sx:.26,hx:-.24,ax:-.1,lx:-.1,az:.1,lz:-.1,lk:.14,rk:.14};

// ---------------- the wrapped dead: Desert Revenant and Tomb Priest ----------------
// (refine) mummified men: human proportions, but withered (thin limbs, a narrow waist, the belly sunk under the ribs, the cheeks
// drawn in). The wrappings are paint, not raised bands: soft light and dark linen bands winding up the body, grime, darker
// toward the feet; the creases come from the baked shading. The bare strip of face is dark dried leather with deep sockets.
// linen at a point: bands winding up the body (a slight spiral), a dark gap between turns, grime blotches, dirtier toward the feet
function ud_wrap(m,w1,w2,dirt,y0){const a=Math.atan2(m.x,m.z),b=(m.y+a*.02)*24,w=.5+.5*Math.cos(b*6.283),g=n3Sn(m.x,m.y,m.z,7,3);
  let c=mdMix(mdSh(w2,.8),w1,ud_ss(.08,.7,w));c=mdMix(c,dirt,ud_cl((g-.55)*2.5)*.55);return mdMix(c,mdSh(dirt,.8),ud_ss(y0,0,m.y)*.5)}
// dried leather with the eye sockets sunk dark (base head coordinates)
function ud_leather(m,S,c,sock){const bx=m.x/S.hs,ey=S.hp(0,1.629,0)[1],d=Math.hypot((Math.abs(bx)-.036)/.024,(m.y-ey)/(.016*S.hs));return mdMix(mdSh(c,1-.15*n3Sn(m.x,m.y,m.z,30,1)),sock,ud_ss(1.25,.45,d))}
(function(){const S=ud_spec({h:.92,w:.92,d:.9,rw:[.95,.95,.84,.92,.98,1,1,1],rf:[.95,.95,.74,.88,.96,1,1,1],at:.86,lt:.88,hs:.96}),w1=0xb8a47c,w2=0x8a7a58,dirt=0x4a3c28,lth=0x4e3c26,lap=0x2a3a6a,gd=0xc8a040,T=S.torso,J=S.J;
  cg181Reg('revenant',S,function(B,P,k,C){const M=C.M,fy=S.hp(0,1.6,0)[1],by=S.hp(0,1.645,0)[1];
    cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.016})));
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]>.2?-.014*cgG(x,y,0,T[2][0]+.075,.11,.06)*n[2]:0);   // the belly sunk under the ribs
    M.shade=cgShade(M,{cav:1.25,y0:0,y1:T[7][0]+.25,hk:.28});
    const face=m=>m.part=='head'&&m.y>=fy&&m.s>=.5;cgEyes(k,M,S,0xffc040,.036,1.629,.9,.004);
    // the nemes: a striped headcloth over the crown with lappets on the chest; a broad gold-and-lapis collar; a robe
    ud_sh(B,M,m=>m.part=='head'&&(m.y>by||m.s<-.1),.02,m=>Math.round(m.y*60)%2?gd:lap,{rim:.15});
    [-1,1].forEach(s=>{const p=S.hp(s*.085,1.6,-.01);k.p('head','box','c',lap,p[0],p[1]-.08,p[2]+.01,.05,.18,.012,0,0,s*.08)});
    ud_sh(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>T[6][0]-.06),.036,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.1});
    cgSkirt(B,S,T[2][0]-.02,.06,.1,.026,m=>ud_cloth(m,0x6a5a3a,.06,T[2][0]),{n:7,seg:16,keep:m=>!(m.y<.2&&a181H(Math.round(Math.atan2(m.c,m.s)*9),4)<.5)});
    ud_body(B,M,null,{vcol:m=>face(m)?ud_leather(m,S,lth,0x0c0806):ud_wrap(m,w1,w2,dirt,J.rh1[1])});
    [-1,1].forEach(s=>ud_fingers(B,S,s,w2,s>0?'fist':'claw',1,0x2a2014,s>0?0:.012))})})();
(function(){const S=ud_spec({h:.97,w:.9,d:.9,rw:[.95,.95,.84,.92,.98,1,1,1],rf:[.95,.95,.74,.88,.96,1,1,1],at:.84,lt:.9,hs:.96}),w1=0xa8946a,w2=0x6e5e40,dirt=0x3e3020,dk=0x2e2418,gd=0xc8a040,lap=0x2a4a8a,glow=0xffd060,T=S.torso,J=S.J;
  cg181Reg('tombpriest',S,function(B,P,k,C){const M=C.M,fy=S.hp(0,1.6,0)[1];
    cgSculpt(M,{head:1},S.sculpt(cgFaceHuman({nose:.7,brow:1.4,hollow:.018})));
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]>.2?-.012*cgG(x,y,0,T[2][0]+.075,.11,.06)*n[2]:0);
    M.shade=cgShade(M,{cav:1.25,y0:0,y1:T[7][0]+.25,hk:.28});
    const face=m=>m.part=='head'&&m.y>=fy&&m.s>=.5;cgEyes(k,M,S,0xffb030,.036,1.629,.9,.004);
    // the nemes: a striped lapis-and-gold headcloth over the crown and back of the head, flaring behind the ears, lappets
    // falling over the collar to the chest
    const by=S.hp(0,1.645,0)[1],ly=S.hp(0,1.545,0)[1],fl=S.hp(0,1.66,0)[1];
    ud_sh(B,M,m=>m.part=='head'&&(m.y>by||(m.s<.25&&m.y>ly)),v=>{const lo=Math.max(0,Math.min(1,(fl-v[1])/(.1*S.hs)));return .016+.024*lo*Math.min(1,Math.abs(v[0])/(.07*S.hs))},m=>Math.round(m.y*60)%2?gd:lap,{t:'m',rim:.1});
    const sh=T[6][0];[-1,1].forEach(s=>{const q1=cgTAt(S,sh-.03),q2=cgTAt(S,sh-.15),p0=S.hp(s*.06,1.585,-.03),p1=S.hp(s*.1,1.54,-.01),p2=[s*q1.rx*.52,sh-.02,q1.z+q1.f+.048],p3=[s*q2.rx*.5,sh-.15,q2.z+q2.f+.03];
      mdLoft(B,[{p:p0,rx:.028,f:.006,b:.006,w:[['head',1]]},{p:p1,rx:.034,f:.006,b:.006,w:[['neck',.5],['head',.5]]},{p:p2,rx:.034,f:.006,b:.006,w:[['chest',1]]},{p:p3,rx:.03,f:.006,b:.006,w:[['chest',1]]}],{seg:6,t:'m',ref:[0,0,1],capB:true,col:m=>Math.round(m.y*60)%2?gd:lap})});
    ud_sh(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh-.06),.034,m=>Math.round(m.y*50)%2?gd:lap,{t:'m',rim:.1});
    // the glowing winged scarab pectoral
    {const c=cgSurf(M,S,J.chest[1]-.03,0,-.004);k.p('chest','sph','m',gd,c[0],c[1],c[2]+.006,.05,.042,.022);k.p('chest','sph','g',glow,c[0],c[1]+.004,c[2]+.024,.026,.022,.01);
      [-1,1].forEach(s=>{k.p('chest','box','m',gd,c[0]+s*.07,c[1]+.012,c[2]-.006,.085,.026,.012,0,-s*.3,s*.35);k.p('chest','box','m',gd,c[0]+s*.06,c[1]-.012,c[2]-.004,.07,.018,.012,0,-s*.28,s*.15);k.p('chest','box','g',glow,c[0]+s*.072,c[1]+.016,c[2]+.002,.06,.008,.006,0,-s*.3,s*.35)})}
    // a kilt of gold and dark linen on a gold belt; loose bandages trailing from the arms and hips
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.2,.05,.024,m=>Math.round(Math.atan2(m.c,m.s)*8)%2?mdSh(w2,.8):gd,{n:5,t:'m',seg:16});ud_sh(B,M,m=>m.part=='torso'&&Math.abs(m.y-T[2][0])<.022,.03,gd,{t:'m',show:1});
    for(let i=0;i<6;i++){const s=i%2?1:-1,t=.5+i*.25,p=u8_armPt(M,S,s,t,.3);u8_strip(k,M,t<1?(s<0?'aL0':'aR0'):(s<0?'aL1':'aR1'),w2,p,.03,.2+(i%3)*.07,s*1.3,-.08,i)}
    for(let i=0;i<4;i++){const a=Math.PI+(-1+i*.66)*.6,p=cgSurf(M,S,T[1][0]-.02,a,-.008);u8_strip(k,M,'pelvis',w2,p,.04,.34+(i%2)*.12,a,-.05,i+2)}
    ud_body(B,M,null,{vcol:m=>face(m)?ud_leather(m,S,mdMix(dk,w2,.35),0x080604):ud_wrap(m,w1,w2,dirt,J.rh1[1])});
    [-1,1].forEach(s=>ud_fingers(B,S,s,w2,s>0?'fist':'claw',1,0x2a2014,.01))})})();
ST179.revenant={sx:.12,hx:-.06,lk:.09,rk:.09,lz:-.05,le:-.25};

// ---------------- Grave Ghoul: gaunt and stooped, grey-green, raised ribs, a knuckled spine, tusks, burial rags ----------------
// (refine) not a man: an emaciated corpse-eater that crawls. Long thin arms that reach the ground in its crouch, big clawed
// hands, a narrow wasp waist under a cage of ribs, a hunched back with the spine knuckled through it, a low head thrust forward
// on a thin neck with a jutting jaw, long splayed feet. Grey-green skin that flows into darker rot and paler stretched skin
// over the bones (vcol), dried blood round the mouth.
(function(){const S=ud_spec({h:.8,w:.84,d:.84,rw:[.9,.92,.68,.84,.96,1,1.04,.92],rf:[.9,.9,.58,.8,.95,1,1,.95],at:.72,lt:.78,hs:.94,hd:1.1,armL:1.42,legL:.94,nw:.82,foot:1.18,footW:.95,
    facePush:(i,j,a)=>(i<=1&&Math.sin(a)>.2?.012:0)+(i<=1&&Math.sin(a)>-.2&&Math.abs(Math.cos(a))>.6?.006:0)}),sk=0x5e6a5c,sk2=0x3e4a3e,pale=0x8a9484,rot=0x34402e,blood=0x2a0c08,rag=0x4a4636,rag2=0x3a382c,bone=0xb8b098,T=S.torso,J=S.J;
  cg181Reg('ghoul',S,function(B,P,k,C){const M=C.M,sh=T[6][0],ch=J.chest[1],sp=J.spine[1],TB=y=>y>ch-.04?'chest':y>sp?'spine':'pelvis';
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.1)return 0;let d=-.01*cgG(x,y,0,1.597,.012,.01)+.016*cgG(x,y,0,1.65,.05,.008);[-1,1].forEach(s=>{d-=.02*cgG(x,y,s*.037,1.63,.016,.011);d-=.014*cgG(x,y,s*.05,1.57,.016,.016)});return d}));
    // the hunched back (the hump low between the shoulder blades, clear of the head), the sunken belly
    cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]<-.1)d+=.05*cgG(x,y,0,sh-.1,.12,.09)*Math.min(1,(-.1-n[2])*1.5);if(n[2]>.2)d-=.016*cgG(x,y,0,T[2][0]+.075,.1,.06)*n[2];return d});
    M.shade=cgShade(M,{cav:1.4,y0:0,y1:sh+.2,hk:.3});
    const my=S.hp(0,1.556,0)[1],skin=m=>{const n=n3Sn(m.x,m.y,m.z,6,4),n2=n3Sn(m.x,m.y,m.z,15,7);let c=mdMix(sk,sk2,ud_cl((n-.35)*1.4)*.8+(m.s<-.3?.15:0));
      c=mdMix(c,rot,ud_cl((n2-.62)*3.5)*.65);if(m.part=='hand'||(m.part=='arm'&&m.y<J.aR2[1]+.06))c=mdMix(c,rot,.45);   // filthy hands
      if(m.ny>.35)c=mdMix(c,pale,ud_cl((m.ny-.35)*.9));                                                                   // stretched pale skin over the bones
      if(m.part=='head'&&m.s>.3){const dm=Math.hypot(m.x/(.05*S.hs),(m.y-my)/(.03*S.hs));c=mdMix(c,blood,ud_ss(1.3,.4,dm)*.85)}   // dried blood round the mouth
      return c};
    ud_body(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-my)<.006*S.hs&&Math.abs(m.x)<.04*S.hs)return 0x100604;if(m.part=='head'&&m.s>.4&&Math.abs(m.x)<.012&&Math.abs(m.y-S.hp(0,1.596,0)[1])<.008)return 0x0a0806;return null},{vcol:skin});
    cgEyes(k,M,S,0x9aff6a,.037,1.63,.95,-.004);cgEars(k,M,S,sk,1.63,.08,.4,.6,.02);
    // tusks up from the lower jaw
    [-1,1].forEach(s=>{const q=S.hp(s*.022,1.552,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','cone4','c',0xc8c0a0,p[0],p[1]+.008*S.hs,p[2]-.002,.008*S.hs,.03*S.hs,.008*S.hs,-.25,0,-s*.12)});
    // ribs standing out of the chest, knuckled vertebrae down the hunched back, boils, a stitched wound
    for(let i=0;i<4;i++){const y=ch+.05-i*.05;[-1,1].forEach(s=>{const p=cgSurf(M,S,y,s*.28,-.003),m=cgSurf(M,S,y-.016,s*.72,.002),q=cgSurf(M,S,y-.034,s*1.15,-.003),bn=TB(y);k.L(bn,'c',bone,p,m,.008,.008,5).L(bn,'c',bone,m,q,.008,.007,5)})}
    for(let i=0;i<7;i++){const y=sh-.01-i*.065,p=cgSurf(M,S,y,Math.PI,-.006);k.p(TB(y),'dod','c',i%2?bone:mdSh(bone,.85),p[0],p[1],p[2],.024,.019,.022);ud_ws(k,M,p)}
    [[ch,.6],[sp,-1.2],[ch+.06,2.1],[sp-.04,-2.6]].forEach(([y,a])=>{const p=cgSurf(M,S,y,a,-.011);k.p(TB(y),'ico','c',0x7a8a50,p[0],p[1],p[2],.02,.018,.016);ud_ws(k,M,p)});
    {const p=cgSurf(M,S,sp+.03,-.4,-.002),q=cgSurf(M,S,sp-.07,-.18,-.002);k.L('spine','c',0x3a1a14,p,q,.005,.005,4);ud_ws(k,M,lerp3(p,q,.5));for(let i=0;i<4;i++){const c=lerp3(p,q,(i+.5)/4);k.p('spine','box','c',0x1a1210,c[0],c[1],c[2],.026,.004,.008,0,0,.6);ud_ws(k,M,c)}}
    // burial rags: a loincloth, rags hanging from the left shoulder, a rag bound round each forearm
    cgSkirt(B,S,T[2][0]-.03,J.rh1[1]+.06,.04,.016,m=>ud_cloth(m,0x2e2e28,J.rh1[1],T[2][0],9),{n:5,seg:16,keep:m=>Math.round(Math.atan2(m.c,m.s)*4)%2==0});cgBelt(B,M,T[2][0]-.02,.03,.016,0x2a2a24);
    [[sh+.01,-1.1],[sh-.01,-.6],[sh-.07,-1.45]].forEach(([y,a],i)=>{const p=cgSurf(M,S,y,a,-.008);u8_strip(k,M,'chest',i%2?rag:rag2,p,.045,.27+i*.03,a,-.1,i)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',y=J[A+'1'][1]*.35+J[A+'2'][1]*.65;ud_sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-y)<.03,.012,null,{rim:.15,vcol:m=>ud_mot(m,rag,rag2,11,2)});
      ud_fingers(B,S,s,sk2,'claw',1.55,0x2a2420,.05,1.1);cgToes(k,S,s,sk2,.024)})})})();
// a crawler's crouch: bent far over, the head raised to look ahead, deep-bent knees, the long arms reaching forward to the ground
ST179.ghoul={sx:.62,hx:-.58,lk:.56,rk:.56,ax:-.5,lx:-.5,az:.1,lz:-.1,ex:-.35,le:-.35};

// ---------------- the drowned: Drowned Thrall (bloated, barnacled, chained, weed) and Drowned Wretch (gaunt, hair over its face) ----------------
// (refine) the Thrall is a bloated, waterlogged brute: a small head sunk into a swollen neck (the shoulders slope up into it, no shelf), a belly sagging over the belt,
// swollen forearms, thick short legs; the Wretch is a thin drowned corpse, its black hair plastered over its face. Both have
// wet skin whose colour flows (vcol): grey-green going blue-grey in the hollows, pale swollen patches, dark rot, a wet sheen on top.
function cgBarnacles(k,M,S,n,seed,col,o){for(let i=0;i<n;i++){const y=S.torso[1][0]+a181H(i,seed)*(S.torso[6][0]-S.torso[1][0]),a=(a181H(i,seed+3)-.5)*6.2,bn=y>S.J.chest[1]-.04?'chest':y>S.J.spine[1]?'spine':'pelvis';
  for(let j=0;j<3;j++){const b=a+(j-1)*.12,p=cgSurf(M,S,y+(j%2)*.014,b,-.005+(o?o(y+(j%2)*.014,b):0));k.p(bn,'cone','c',j%2?col:mdSh(col,.8),p[0],p[1],p[2],.012,.02,.012,Math.cos(b)*.6,0,-Math.sin(b)*.6);ud_ws(k,M,p)}}}
// a strand of wet weed: a thin, slightly flat loft tapering to a point, wavy, its root sunk in the head (dark) and its tip lighter;
// it falls from p0 along d0, stays outside the head and neck, and lies on the shoulders / back where it reaches them (taking the
// skin's weights there, so it moves with the body under it)
function ud_weed(B,M,S,p0,d0,len,r,c,sd){const n=7,st=len/n,hz=S.hp(0,1.6,0)[2],ny=S.J.neck[1],R=[];let p=sub3(p0,mul3(nrm3(d0),.01)),d=nrm3(d0);const side=nrm3(cross3(d,[0,1,0]));
  for(let i=0;i<=n;i++){let w=[['head',1]];
    if(i){d=nrm3(add3(add3(mul3(d,.5),[0,-.62,0]),mul3(side,.32*Math.sin(i*1.9+sd))));p=add3(p,mul3(d,i==1?.012:st));
      if(p[1]>ny-.03){const ax=nrm3([p[0],0,p[2]-hz]),h=cgRay(M,[p[0]+ax[0]*.5,p[1],p[2]+ax[2]*.5],[-ax[0],0,-ax[2]],{head:1,neck:1});
        if(h&&i>1){const rh=Math.hypot(h[0],h[2]-hz)+.007,rp=Math.hypot(p[0],p[2]-hz);if(rp<rh)p=[ax[0]*rh,p[1],hz+ax[2]*rh]}}
      const t=cgRay(M,[p[0],p[1]+.5,p[2]],[0,-1,0],{torso:1,arm:1});if(t&&p[1]<t[1]+.02&&p[1]>t[1]-.06){p=[p[0],t[1]+.02,p[2]];w=cgWAt(M,t)}}
    const q=r*(1-.88*i/n);R.push({p,rx:q,f:q*.62,b:q*.62,w})}
  mdLoft(B,R,{seg:4,capB:true,col:m=>mdMix(mdSh(c,.42),c,Math.min(1,m.i/4))})}
// drowned skin at a point: base sk, hollows / back toward sk2, pale swollen patches, dark rot, a wet sheen on the tops
function ud_wet(m,sk,sk2,pale,rot,o){o=o||{};const n=n3Sn(m.x,m.y,m.z,5,2),n2=n3Sn(m.x,m.y,m.z,12,5);let c=mdMix(sk,sk2,ud_cl((n-.35)*1.3)*.75+(m.s<-.3?.2:0));
  c=mdMix(c,pale,ud_cl((.42-n2)*3)*(o.pale||.45)*(m.s>-.2?1:.4));c=mdMix(c,rot,ud_cl((n2-.66)*4)*.7);
  if(m.ny>.4)c=mdMix(c,mdSh(pale,1.1),ud_cl((m.ny-.4)*.6));return c}
(function(){const S=ud_spec({h:.84,w:1.32,d:1.34,rw:[1.12,1.2,1.5,1.52,1.34,1.25,1.28,1.6],rf:[1.1,1.32,1.95,1.85,1.4,1.2,1.15,1.4],at:1.6,lt:1.45,legL:.92,hs:.9,hw:1.12,nw:1.8,sock:.7,neckL:.025,armR:[1,1,1.04,1.16,1.12,1,1],
    facePush:(i,j,a)=>(i>=1&&i<=3&&Math.sin(a)>-.2&&Math.abs(Math.cos(a))>.5)?.012:0}),sk=0x4a625c,sk2=0x34464a,pale=0x7a8c84,rot=0x2a3424,cl=0x2a3436,ir=0x3a3e44,rust=0x6a3a20,weed=0x2a4a2a,weed2=0x4a6a2a,barn=0xb8b0a0,T=S.torso,J=S.J;
  // the swollen neck tapers from the sloping shoulders up into fat jowls under the jaw (no flat shelf, no step under the chin)
  {const y7=S.torso[7][0],nb=S.head[0][0];S.neck=[[y7+(nb-y7)*.38,.14,.1,.13,.008],[y7+(nb-y7)*.72,.1,.086,.096,.012]];S.head[0]=S.head[0].map((v,i)=>i&&i<4?v*1.5:v);S.head[1]=S.head[1].map((v,i)=>i&&i<4?v*1.2:v)}
  cg181Reg('drowned',S,function(B,P,k,C){const M=C.M,kn=J.rh1[1];
    const FH=cgFaceHuman({nose:.8,nw:1.4,brow:1.3,hollow:-.006,chin:.8});cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>FH(x,y,z,n)-(n[2]>.1?.012*cgG(x,y,0,1.552,.026,.011):0)));   /* a slack, sagging mouth */
    cgSculpt(M,{torso:1,arm:1,leg:1},(x,y,z,n)=>.012*(n3Sn(x*1.3,y*1.3,z*1.3,8,3)-.5));
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]>0?.035*cgG(x,y,0,T[1][0]+.06,.18,.07)*n[2]:0);   // the belly sagging over the belt
    M.shade=cgShade(M,{cav:1.1,y0:0,y1:T[7][0]+.2,hk:.26});
    const my=S.hp(0,1.552,0)[1],pants=m=>m.part=='leg'&&m.y>kn-.1;
    cgEyes(k,M,S,0xa8fff0,.036,1.629,.9,-.002);cgTeeth(k,M,S,[[-.018,1.563,.01],[-.006,1.564,.013],[.007,1.564,.011],[.019,1.562,.012]],barn);
    // the rags of a sailor's shirt: sides, back and sleeves, over the shoulder tops to the neck behind (no shelf of skin rings it), a
    // ragged, sodden neckline lying flat on the skin, open at the front and torn open on the right; breeches, an iron-studded belt, a loincloth flap
    const nl=m=>{const a=Math.atan2(m.x,m.z);return Math.abs(a)>(a>0?1.3:.82)+.34*(n3Sn(m.x,m.y*.6,m.z,15,7)-.5)},thk=v=>.014*ud_cl((T[6][0]+.05-v[1])/.07,.2,1);
    ud_sh(B,M,m=>(m.part=='torso'&&m.y>cgEdge(m,T[1][0]+.05,.04,3)&&(m.s<.3||(m.y>T[6][0]-.03&&nl(m))))||(m.part=='neck'&&m.ny>.45&&nl(m))||(m.part=='arm'&&m.y>cgEdge(m,J.aR1[1]+.02,.03,5)),thk,null,{rim:0,vcol:m=>ud_mot(m,cl,mdSh(cl,.62),8,2)});
    ud_sh(B,M,pants,.012,null,{vcol:m=>ud_mot(m,mdSh(cl,.9),mdSh(cl,.6),9,4)});cgBelt(B,M,T[2][0]-.02,.02,.03,ir,'m');
    cgSkirt(B,S,T[2][0]-.03,J.rh1[1]+.1,.04,.03,m=>ud_cloth(m,0x1e2a2c,J.rh1[1],T[2][0],5),{n:5,seg:16,keep:m=>Math.abs(m.c)<.4&&!(m.y<J.rh1[1]+.18&&a181H(Math.round(m.c*12),3)<.4)});
    // iron cuffs
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';ud_sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'2'][1]+.05))<.025,.022,ir,{t:'m',rim:.1})});
    ud_body(B,M,m=>{if(m.part=='head'&&m.s>.4&&Math.abs(m.y-my)<.012*S.hs&&Math.abs(m.x)<.026*S.hs)return 0x0a1210;return cgFacePaint(S,m,sk,{sock:0x101a18})},{vcol:m=>ud_wet(m,sk,sk2,pale,rot)});
    const cloth=(y,a)=>y>T[1][0]+.1&&(Math.cos(a)<.25||(y>T[6][0]-.03&&Math.abs(a)>1.4))?thk([0,y,0]):0;cgBarnacles(k,M,S,5,3,barn,cloth);
    // barnacles crusted along the torn neckline on the shoulders
    [[-1,1.0],[1,1.45],[-1,1.5]].forEach(([q,a0],i)=>{for(let j=0;j<3;j++){const a=q*(a0+j*.1),y=T[6][0]-.02-(j%2)*.014,o=Math.abs(a)>(a>0?1.3:.82)+.17?thk([0,y,0]):0,pt=cgSurf(M,S,y,a,-.005+o);
      k.p('chest','cone','c',j%2?barn:mdSh(barn,.8),pt[0],pt[1],pt[2],.012,.02,.012,Math.cos(a)*.6,0,-Math.sin(a)*.6);ud_ws(k,M,pt)}});
    // wet weed hanging from the crown and the sides of the head (two strands across the face, some lying on the shoulders), weed on the arms
    [[-2.7,1.705,.34,.011,.25],[-1.9,1.69,.42,.012,.1],[-1.25,1.67,.3,.01,.05],[1.1,1.675,.36,.011,.05],[1.95,1.69,.28,.012,.1],[2.9,1.7,.4,.011,.25],
     [-.28,1.715,.3,.009,.1],[.36,1.71,.21,.008,.1],[-1.5,1.6,.42,.011,0],[1.55,1.61,.38,.011,0],[-2.2,1.63,.36,.01,0],[2.3,1.62,.4,.01,0]].forEach(([a,y,len,r,up],i)=>{
      const c=S.hp(0,y,0),d=[Math.sin(a),0,Math.cos(a)],p=cgRay(M,add3(c,mul3(d,.4)),mul3(d,-1),{head:1});if(p)ud_weed(B,M,S,p,[d[0],up,d[2]],len,r,i%2?weed:weed2,i*1.7)});
    [-1,1].forEach(s=>{for(let i=0;i<2;i++){const t=.5+i*.7,p=u8_armPt(M,S,s,t,0,t<1?-.007:.006);u8_strip(k,M,t<1?(s<0?'aL0':'aR0'):(s<0?'aL1':'aR1'),i%2?weed:weed2,p,.034,.22,s*1.5,-.05,i+3)}});
    // an iron and rust chain round the neck and across the body
    const nk=[];for(let i=0;i<7;i++){const a=i/7*6.283;nk.push(cgSurf(M,S,T[6][0]+.012,a,-.004))}u8_chain(k,nk,()=>'chest',null,.028,ir,rust);
    const dg=[];for(let i=0;i<6;i++){const t=i/5;dg.push(cgSurf(M,S,T[6][0]-.04-t*(T[6][0]-T[1][0]-.06),-1.0+t*2.1,-.004))}u8_chain(k,dg,p=>p[1]>J.chest[1]-.04?'chest':p[1]>J.spine[1]?'spine':'pelvis',p=>nrm3([p[0],0,p[2]]),.028,ir,rust);
    // the anchor held by its shank in the right fist, flukes hanging low
    [-1,1].forEach(s=>{ud_fingers(B,S,s,sk2,s>0?'fist':'claw',1.1,0x1a2420,s>0?0:.02,1.25);cgToes(k,S,s,sk2,0)});
    {const H=ud_hf(S,1),g=ud_grip(S,1,null,.032),cd=nrm3(add3(H.d,mul3(H.f,.42))),sd=nrm3(sub3(H.f,mul3(cd,H.f[0]*cd[0]+H.f[1]*cd[1]+H.f[2]*cd[2]))),A=(t,o)=>add3(add3(g,mul3(cd,t)),mul3(sd,o)),dn=nrm3(cross3(sd,cd));
      k.L('aR2','m',ir,A(-.08,0),A(.62,0),.026,.032,6);u8_part(k,'aR2',ud_ring(),'m',rust,A(-.125,0),cd,sd,.05);u8_part(k,'aR2',dkG().box,'m',ir,A(.5,0),sd,cd,[.27,.045,.055]);
      [-1,1].forEach(s=>{k.L('aR2','m',ir,A(.62,0),A(.48,s*.22),.032,.024,5);u8_part(k,'aR2',dkG().cone4,'m',rust,A(.45,s*.25),dn,nrm3(add3(mul3(cd,-1),mul3(sd,s*.6))),[.045,.1,.022])});const c=A(.62,0);k.p('aR2','sph','m',ir,c[0],c[1],c[2],.04)}})})();
(function(){const S=ud_spec({h:.84,w:.88,d:.86,rw:[.92,.95,.78,.88,.95,.95,.98,.95],rf:[.9,.9,.62,.85,.95,1,1,.98],at:.8,lt:.84,hs:1.0,armL:1.14}),sk=0x5e6e66,sk2=0x44544e,pale=0x8a9a90,rot=0x3a3a4a,rib=0x9a9a86,hr=0x0c0e0e,hr2=0x1a1e1c,sh1=0x6a6a5c,sh2=0x4a4a40,weed=0x2a4a2a,T=S.torso,J=S.J;
  cg181Reg('dgwretch',S,function(B,P,k,C){const M=C.M,my=S.hp(0,1.55,0)[1],nape=S.hp(0,1.56,0)[1];
    const FH=cgFaceHuman({nose:.8,brow:1.3,hollow:.016});cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>FH(x,y,z,n)-(n[2]>.1?.02*cgG(x,y,0,1.548,.024,.016):0)));   /* the jaw hangs open */
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]>.2?-.016*cgG(x,y,0,T[2][0]+.075,.1,.06)*n[2]:0);   // the belly sunk under the ribs
    M.shade=cgShade(M,{cav:1.3,y0:0,y1:T[7][0]+.25,hk:.28});
    cgEyes(k,M,S,0xb8fff0,.036,1.629,.85,-.002);
    // broken teeth in the gaping mouth
    cgTeeth(k,M,S,[[-.02,1.567,.014],[-.009,1.568,.008],[.003,1.568,.016],[.014,1.567,.006],[.022,1.566,.012]],0xb8b098);
    // long black hair: a skullcap and strands plastered down over the face and shoulders
    ud_sh(B,M,m=>{if(m.part!='head'&&!(m.part=='neck'&&m.s<-.2))return false;if(m.y<nape)return false;const by=(m.y-S.nb)/S.hs+1.52;return m.s<.1||by>1.672+(Math.abs(m.x/S.hs)>.05?-.004:0)},
      v=>.012*Math.min(1,Math.max(.35,(v[1]-nape)/(.12*S.hs))),m=>a181Nz(hr,m,.4,24),{rim:.12});
    u8_strands(k,M,S,Array.from({length:16},(_,i)=>{let a=-2.9+i*.36;const fr=Math.abs(a)<.8;if(fr&&Math.abs(a)>.25&&Math.abs(a)<.55)a=Math.sign(a)*.64;return [a,fr?1.675:1.66,fr?.034:.046,fr?.38+(i%3)*.07:.5+(i%4)*.1,fr?.36:.1,i%3?hr:hr2,i]}));
    // the ribs as bars on the chest over the sunken belly
    for(let i=0;i<4;i++){const y=J.chest[1]+.07-i*.055;for(let j=0;j<5;j++){const a=-1.1+j*.55,p=cgSurf(M,S,y-Math.abs(a)*.02,a,-.004);k.p(y>J.chest[1]-.04?'chest':'spine','box','c',rib,p[0],p[1],p[2],.044,.01,.014,0,a,0)}}
    // a shroud in rags: rags on the shoulders, the shroud's skirt, weed caught on the arms; long black talons
    ud_sh(B,M,m=>(m.part=='torso'&&m.y<T[2][0]+.06)||(m.part=='leg'&&m.y>J.rh1[1]-.05),.012,null,{rim:.12,vcol:m=>ud_mot(m,sh2,mdSh(sh2,.7),9,6)});cgSkirt(B,S,T[2][0],J.rh1[1]-.05,.06,.018,m=>ud_cloth(m,mdMix(sh1,sh2,.4),J.rh1[1]-.05,T[2][0],6),{n:5,seg:16,keep:m=>!(m.y<J.rh1[1]+.15&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<.45)});
    ud_body(B,M,m=>{if(m.part=='head'&&m.s>.35&&Math.abs(m.y-my)<.02*S.hs&&Math.abs(m.x)<.025*S.hs)return 0x040606;return cgFacePaint(S,m,sk,{sock:0x0a1210})},{vcol:m=>ud_wet(m,sk,sk2,pale,rot,{pale:.35})});
    for(let i=0;i<7;i++){const a=-2.6+i*.86,p=cgSurf(M,S,T[6][0]-.02,a,-.008);u8_strip(k,M,'chest',i%2?sh1:sh2,p,.07,.26+(i%3)*.08,a,-.12,i)}
    [-1,1].forEach(s=>{const p=u8_armPt(M,S,s,.7,0);u8_strip(k,M,s<0?'aL0':'aR0',weed,p,.03,.25,s*1.4,-.05,s+3);ud_fingers(B,S,s,sk2,'claw',1.15,0x0a0a0a,.085);cgToes(k,S,s,sk2,.014)})})})();
ST179.dgwretch={sx:.3,hx:-.26,lk:.27,rk:.27,ax:-.3,lx:-.3,ex:-.5,le:-.5};
