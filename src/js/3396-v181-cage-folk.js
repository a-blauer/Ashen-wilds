// ================= v181: goblins and humans on cage bodies =================
// Owner: "all enemy models that use the old humanoid structure updated to the new one". Batch 1: Hobgoblin, Slinger, Goblin
// Shaman, Bandit, Brigand Captain, Ember Cultist, Hollow Knight, Zealot of the Endless One, Salt Caller. Each keeps its
// look (colours, gear, weapon), rebuilt on the cage body. Shared here: face recipes (cgFaceHuman, cgFaceGoblin), a hood
// (cgHood), a plate harness (cgPlate, the Blood Knight's armour as a reusable kit).
// Restore pass (Oct 30 2026): each foe got back what made it itself in the old models (stocky goblins with big tusks, the
// slinger's draped hood and cross strap, the shaman's glowing eyes under its skull, the bandit's black mask and red sash, the
// brigand's light-grey mail and fur-cuffed boots, the knight's burning visor slit, the zealot's hood, mask and eye patch, the
// salt caller's spine crystals) and its old height; skin under clothes is no longer drawn (f6_reg), to stay near 15k triangles.
// Refine pass (Oct 31 2026, the Amalgam standard, fk_ helpers): arms and legs seated in the body, goblins reshaped as goblins
// (small, crouched, big-headed, long-eared, big hands and feet, wiry) while the humans keep human proportions, baked shading,
// colour that flows instead of stepping face by face, rounded fingers, a little painted detail; ~5.5–7.5k triangles each.

// ---------------- faces (base head coordinates) ----------------
function cgFaceHuman(o){o=o||{};const nz=o.nose||1,br=o.brow||1,ch=o.cheek||1;return (x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;
  d+=.02*nz*cgG(x,y,0,1.597,.01*(o.nw||1),.013)+.012*nz*cgG(x,y,0,1.615,.008*(o.nw||1),.012);
  [-1,1].forEach(s=>{d-=.013*cgG(x,y,s*.036,1.629,.016,.01);d+=.007*ch*cgG(x,y,s*.056,1.602,.014,.01);d-=(o.hollow||.004)*cgG(x,y,s*.047,1.568,.016,.014);d+=.003*cgG(x,y,s*.01,1.587,.006,.004)});
  d+=.009*br*cgG(x,y,0,1.648,.05,.006);d-=.004*cgG(x,y,0,1.558,.02,.003);d+=.009*(o.chin||1)*cgG(x,y,0,1.538,.018,.012);return d*f}}
function cgFaceGoblin(o){o=o||{};return (x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
  d+=.04*cgG(x,y,0,1.588,.013,.014)+.02*cgG(x,y,0,1.61,.01,.014)-.01*cgG(x,y,0,1.575,.012,.006);       // a long hooked nose
  [-1,1].forEach(s=>{d-=.016*cgG(x,y,s*.038,1.628,.016,.011);d+=.008*cgG(x,y,s*.06,1.6,.014,.01);d+=.005*cgG(x,y,s*.012,1.585,.007,.005)});
  d+=.016*cgG(x,y,0,1.647,.055,.008);d-=.006*cgG(x,y,0,1.556,.035,.004);d+=.006*cgG(x,y,0,1.54,.03,.012);return d*f}}
// a dark mouth line and sockets painted over the skin (base head coordinates)
function cgFacePaint(S,m,skin,o){o=o||{};if(m.part=='head'&&m.s>.3){const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-(o.ex||.036))<.02&&Math.abs(m.y-S.hp(0,o.ey||1.629,0)[1])<.012*S.hs)return o.sock==null?mdSh(skin,.45):o.sock;
  if(Math.abs(m.y-S.hp(0,o.my||1.557,0)[1])<.0042*S.hs&&Math.abs(bx)<(o.mw||.026))return o.lip==null?0x2a1210:o.lip}return null}
// a hood: a shell over the crown, back and sides of the head, the neck and the shoulders, open round the face; peak = a cone on top
// (restore pass) o.arm: the drape also runs down over the shoulder caps by that much; o.tip: a limp point hanging off the back
// (refine) o.top: the opening's upper edge (base head units above y 1.6; the hood then covers the forehead down to it)
function cgHood(B,k,M,S,o){const fy=S.hp(0,1.6,0)[1],hz0=S.hp(0,1.6,0)[2],OF=o.off||.02,top=o.top==null?1:o.top;fk_shell(B,M,m=>{if(m.part=='head'){const bx=m.x/S.hs,by=(m.y-fy)/S.hs;return !(m.s>.35&&by<top&&(bx*bx)/(.065*.065)+(by*by)/(.075*.075)<1)}
    return m.part=='neck'||(m.part=='torso'&&m.y>S.torso[6][0]-(o.drape||.06))||(o.arm&&m.part=='arm'&&m.y>S.torso[6][0]-o.arm)},
    /* (refine) the hood thins out toward the face opening, so its edge lies flush on the face instead of stepping round it */
    v=>{if(v[2]<hz0)return OF;const bx=v[0]/S.hs,by=(v[1]-fy)/S.hs;if(by>top-.012)return OF;const e=(bx*bx)/(.065*.065)+(by*by)/(.075*.075);return e>2.4?OF:OF*Math.max(.45,Math.min(1,(e-1)/1.4))},o.col,{rim:.2,vcol:o.vcol});
  if(o.peak){const t=S.hp(0,1.735,-.03);k.L('head','c',o.peak,t,[t[0],t[1]+o.ph*S.hs,t[2]-o.ph*.5*S.hs],.05*S.hs,.004,6)}
  if(o.tip!=null){const t=S.hp(0,1.69,-.04);k.L('head','c',o.tip,t,S.hp(0,1.63,-.2),.04*S.hs,.008,6)}}
// ---------------- restore-pass helpers (f6_) ----------------
// tusks jutting up from the lower jaw (base head coordinates: x either side of the middle), long and thick like the old goblins',
// tilted forward clear of the upper lip; their roots are set into the chin by hand (no seating: that pushed them back into the lip)
function f6_tusks(k,M,S,col,x,len,w){[-1,1].forEach(s=>{const q=S.hp(s*x,1.556,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(p){k.p('head','cone4','c',col,p[0],p[1]+len*.2*S.hs,p[2]+.004,w*S.hs,len*S.hs,w*.85*S.hs,.32,0,-s*.16);k.P[k.P.length-1].noSeat=1}})}
// a belt: a band of the body's surface pushed out by off, its rim tucked down to just above what lies under it (under: the
// offset of the shirt or robe beneath; 0 on bare skin), so a narrow belt keeps its full height instead of sinking into the cloth
function f6_belt(B,M,y,h,off,col,under){cgShell(B,M,m=>m.part=='torso'&&Math.abs(m.y-y)<h,off,col,{rim:Math.min(.85,((under||0)+.003)/off)})}
// a strap of points on the torso surface ([y, angle round the body (0 front, π/2 right), offset]…), bending with the skin under it
function f6_strap(B,M,S,L,r,col){const pts=L.map(([y,a,o])=>cgSurf(M,S,y,a,o));cgTube(B,pts,pts.map(()=>r),pts.map(p=>cgWAt(M,p)),col,{seg:6})}
// the cape of 3394's cgCape, its rows spaced with the body's height (short bodies too), with an optional trim along the hem
function f6_cape(B,S,o){const J=S.J,h=S.h||1,top=S.torso[6][0],len=o.len||.4,w=o.w||1,off=o.off||.03,rag=o.rag==null?.5:o.rag,col=o.col,ins=o.ins==null?mdSh(col,.5):o.ins;
  const at=(y,wt,rx)=>{const q=cgTAt(S,Math.min(top,y));return {p:[0,y,q.z-(q.b+off+Math.max(0,top-y)*.1)],rx:rx*w,f:.014,b:.014,w:wt}};
  const Y=[top+.01,top-.1*h,top-.25*h,top-.4*h,Math.min(top-.46*h,J.cp1[1]-.1*h),Math.min(top-.6*h,J.cp2[1]),len],cw=y=>y>J.cp0[1]-.04?[['chest',.6],['cp0',.4]]:y>J.cp1[1]?mdWb('cp0','cp1',(J.cp0[1]-y)/(J.cp0[1]-J.cp1[1])):y>J.cp2[1]?mdWb('cp1','cp2',(J.cp1[1]-y)/(J.cp1[1]-J.cp2[1])):[['cp2',1]];
  const R=Y.map((y,i)=>at(y,cw(y),.18+i*.022));R[0].p[2]=-(cgTAt(S,top).b+off*.4);
  mdLoft(B,R,{seg:o.seg||24,capA:true,col:m=>m.s>.2?ins:(o.hem!=null&&m.i>R.length-1.55?o.hem:o.trim!=null&&m.i<.6?o.trim:Math.round(Math.atan2(m.c,-m.s)*9)%2?col:mdSh(col,.82)),keep:m=>!(m.i>R.length-2.2&&a181H(Math.round(Math.atan2(m.c,m.s)*6),2)<rag*(m.i-(R.length-2.2))*.9)})}
// skin hidden under clothes is not drawn (restore pass: keeps each model near 15k triangles). f6_reg registers a cage foe
// like cg181Reg; while its builder runs, every shell grown from the body (cgShell, and cgBelt / cgHood / cgHair through it)
// is noted, and the body's skin (C.f6skin, set by cgGoblinBody / cgHumanBody) is drawn last, leaving out the faces that lie
// under a shell, except the ring of faces along each shell's edge (so no gap can show under a shell's tucked rim). Shells with
// an untucked rim (rim 1: a helm) hide nothing. Shells bend with the same weights as the skin, so nothing shows through in motion.
function f6_keep(M,L){const F=M.F,cov=F.map(f=>{const m=cgInfo(M,f);return L.some(s=>s(m))}),open=new Uint8Array(M.V.length);F.forEach((f,i)=>{if(!cov[i])f.v.forEach(v=>open[v]=1)});
  const keep=F.map((f,i)=>!cov[i]||f.v.some(v=>open[v]));return (m,fi)=>keep[fi]}
function f6_reg(key,S,fn){cg181Reg(key,S,function(B,P,k,C,S2){const L=[],sh=cgShell;
  cgShell=function(B2,M2,sel,off,col,o){if(M2===C.M&&!(o&&o.rim===1))L.push(sel);return sh.apply(this,arguments)};
  try{fn(B,P,k,C,S2)}finally{cgShell=sh}if(C.f6hide)L.push.apply(L,C.f6hide);cgEmit(B,C.M,C.f6skin,{keep:f6_keep(C.M,L),vcol:C.f6vcol})})}   /* (refine) C.f6vcol: the skin's colour flows corner to corner */
// ---------------- refine pass (Oct 31 2026, fk_): the Amalgam standard on every folk foe ----------------
// limbs seated in the body (cgHuman n:16 / sock / j2: the arm grows out of the shoulder socket, the thigh out of the hip ring),
// fewer rings where they don't shape the outline (head, arm, leg, foot), baked shading (cgShade: creases darker, ridges lighter,
// darker toward the feet), colour that flows corner to corner (vcol) instead of stepping face by face, rounded fingers (mdLoft)
const FK_HI=[0,2,4,6,8,9,11,12,14],FK_HIG=[0,2,3,4,5,6,8,9,11,12,14];   // head rings kept (humans / goblins: more round the nose)
function fk_body(o,hi){const B=CG181.base,hs=o.hs||1,H=hi||FK_HI;return cgHuman(Object.assign({n:16,sock:1,j2:1,footLite:1,head:H.map(i=>B.head[i]),
  facePush:(i,j,a)=>B.face(H[i],j,a)*hs,arm:B.arm.filter((q,i)=>i!=2&&i!=4&&i!=5),leg:B.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},o))}   /* arm: shoulder, upper arm, elbow, wrist, palm, knuckles · leg: hip, thigh, knee, calf, ankle */
// a shell whose colour flows corner to corner: cgShell (so f6_reg still notes it and hides the skin under it) with o.vcol handed
// to its cgEmit; col(m) returning null hands the face to vcol, a colour keeps a crisp region
function fk_shell(B,M,sel,off,col,o){o=o||{};if(!o.vcol)return cgShell(B,M,sel,off,col,o);const e=cgEmit;
  cgEmit=function(B2,M2,c2,o2){return e(B2,M2,c2,Object.assign({},o2,{vcol:o.vcol}))};try{return cgShell(B,M,sel,off,col||(()=>null),o)}finally{cgEmit=e}}
// smooth cloth / hide colour for vcol: a little low-frequency value noise, no hue noise
function fk_nz(c,a,f,sd){return m=>a181Nz(c,m,a==null?.2:a,f||9,sd||0)}
// the body's baked shading (set after the face sculpt, before anything is emitted)
// (the face's creases are halved: small sculpted faces turned blotchy at full strength)
function fk_shade(M,S,o){o=o||{};const sh=cgShade(M,Object.assign({cav:1,y0:0,y1:S.hp(0,1.73,0)[1],hk:.26,dk:.14,min:.5},o)),hd=new Uint8Array(M.V.length),hk=o.head==null?.5:o.head;
  M.F.forEach(f=>{if(f.part=='head')f.v.forEach(i=>hd[i]=1)});M.shade=sh.map((x,i)=>hd[i]&&x<1&&M.V[i][1]>S.hp(0,1.54,0)[1]?1-(1-x)*hk:x)}
// fingers as rounded tapering lofts rooted inside the palm (the same paths as cgFingers): kind 'open' | 'claw' | 'fist';
// o: len, r (finger thickness), nail (claw colour), tip (claw length), t (layer), w (hand width factor)
// a finger: rounded tapering loft rooted inside the palm, a knuckle ring, each joint a little thicker than the bone between,
// curling by curl at each joint; o.tip: a claw cone in the nail colour, else a rounded fingertip
function fk_digit(B,col,p,d,len,r,n,curl,ax,W,o){let a=p.slice(),dir=new THREE.Vector3(...d).normalize();const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...ax).normalize(),curl),
    D=()=>[dir.x,dir.y,dir.z],R=[{p:sub3(a,mul3(D(),r*(o.root||1.8))),rx:r*.9},{p:a.slice(),rx:r*1.08}];
  for(let i=0;i<n;i++){const L=len/n,t=1-.16*i;R.push({p:add3(a,mul3(D(),L*.5)),rx:r*.8*t});a=add3(a,mul3(D(),L));if(i<n-1){R.push({p:a.slice(),rx:r*.92*t});dir.applyQuaternion(q)}}
  const nS=R.length;
  if(o.tip){R.push({p:a.slice(),rx:r*.66});R.push({p:add3(a,mul3(D(),o.tip*.3)),rx:r*.5});R.push({p:add3(a,mul3(D(),o.tip)),rx:r*.06})}
  else{R.push({p:add3(a,mul3(D(),r*.35)),rx:r*.6});R.push({p:add3(a,mul3(D(),r*.7)),rx:r*.3})}
  R.forEach(q=>{q.f=q.rx*.92;q.b=q.rx*.92;q.w=W});
  mdLoft(B,R,{seg:o.seg||6,capB:true,t:o.t||'c',col:m=>o.tip&&m.i>nS?(o.nail==null?0x1a1408:o.nail):col})}
// a closed fist as one mitten: a wide rounded loft (half width hw2 across the knuckles, thickness r) along the curled path of the
// middle finger (n bones, curl per joint about ax), its width kept across the hand (u = the back of the hand); the three
// finger separations are painted per corner as dark lines that fade into the skin, past the knuckle ridge
function fk_mitten(B,col,p,d,len,r,hw2,n,curl,ax,uH,W,t){let a=p.slice(),dir=new THREE.Vector3(...d).normalize();const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...ax).normalize(),curl),D=()=>[dir.x,dir.y,dir.z];
  const R=[{p:sub3(a,mul3(D(),r*2.2)),rx:hw2*.9,th:r*.95,ln:0},{p:a.slice(),rx:hw2*1.03,th:r*1.15,ln:.4,kb:1}];
  for(let i=0;i<n;i++){const L=len/n,k=1-.06*i;R.push({p:add3(a,mul3(D(),L*.5)),rx:hw2*.96*k,th:r*.95*k,ln:1,kb:i?0:.5});a=add3(a,mul3(D(),L));if(i<n-1){R.push({p:a.slice(),rx:hw2*k,th:r*1.05*k,ln:1});dir.applyQuaternion(q)}}
  R.push({p:add3(a,mul3(D(),r*.45)),rx:hw2*.8,th:r*.7,ln:.6});
  const seg=24,TC=new THREE.Color(col),w=mdW(B,W),rows=[];let U=null;
  R.forEach((g,i)=>{const tg=nrm3(sub3(R[Math.min(i+1,R.length-1)].p,R[Math.max(i-1,0)].p));let u=U||uH;u=nrm3(sub3(u,mul3(tg,u[0]*tg[0]+u[1]*tg[1]+u[2]*tg[2])));U=u;const Sd=cross3(u,tg),row=[];
    for(let k=0;k<seg;k++){const an=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(an),sn=Math.sin(an),dl=Math.min(Math.abs(c-.5),Math.abs(c),Math.abs(c+.5)),sh=1-.45*g.ln*Math.max(0,1-dl/.07)*Math.max(0,Math.min(1,(sn+.35)*3));   /* thin lines, on the back and over the curl (not the hidden palm side) */
      const th=g.th*(1+(g.kb||0)*.16*Math.max(0,sn)*Math.max(0,1-Math.min(Math.abs(c-.75),Math.abs(c-.25),Math.abs(c+.25),Math.abs(c+.75))/.2));   /* a bumpy knuckle ridge */
      row.push({x:g.p[0]+Sd[0]*c*g.rx+u[0]*sn*th,y:g.p[1]+Sd[1]*c*g.rx+u[1]*sn*th,z:g.p[2]+Sd[2]*c*g.rx+u[2]*sn*th,w,rgb:[TC.r*sh,TC.g*sh,TC.b*sh]})}rows.push(row)});
  const cl=mdC(col),T=t||'c';for(let i=0;i<rows.length-1;i++)for(let k=0;k<seg;k++){const A=rows[i][k],A1=rows[i][(k+1)%seg],B2=rows[i+1][k],B3=rows[i+1][(k+1)%seg];mdTri(B,T,A,A1,B2,cl);mdTri(B,T,B2,A1,B3,cl)}
  const L=rows[rows.length-1],e=R[R.length-1].p,cv={x:e[0]+dir.x*r*.25,y:e[1]+dir.y*r*.25,z:e[2]+dir.z*r*.25,w,rgb:[TC.r,TC.g,TC.b]};for(let k=0;k<seg;k++)mdTri(B,T,cv,L[k],L[(k+1)%seg],cl)}
// (round 2) where the closed fist's grip is: the centre of the mitten's curl (the circle through its knuckle, its middle joint
// and its tip), as an offset from the wrist joint in model space, rest pose: the value for S.grip, so the weapon handle runs
// through the fist with the knuckles round it and the thumb over it. o: w (hand width factor), len (finger length) as fk_fingers
function fk_gripOf(S,s,o){o=o||{};const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),hw=o.w||1,L=(o.len||1)*.08,l=L*.6/2;
  const u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d));
  const A=add3(add3(a2,mul3(d,.064*hw)),mul3(u,-.002*hw)),dir=new THREE.Vector3(...nrm3(add3(add3(d,mul3(u,-.7)),mul3(f,.03)))),Bp=add3(A,[dir.x*l,dir.y*l,dir.z*l]);
  dir.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...ax),1.5));const C=add3(Bp,[dir.x*l,dir.y*l,dir.z*l]);
  const a=sub3(A,C),b=sub3(Bp,C),n=cross3(a,b),nn=n[0]*n[0]+n[1]*n[1]+n[2]*n[2],aa=a[0]*a[0]+a[1]*a[1]+a[2]*a[2],bb=b[0]*b[0]+b[1]*b[1]+b[2]*b[2];
  const cc=add3(C,mul3(cross3(sub3(mul3(b,aa),mul3(a,bb)),n),1/(2*nn)));return sub3(cc,a2)}
function fk_fingers(B,S,s,col,kind,o){o=o||{};const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),hw=o.w||1,kn=add3(a2,mul3(d,.075*hw)),L=(o.len||1)*.08,r=(o.r||.0095)*hw,W=[[bn+'2',1]];
  const u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d));
  const P=(b,x,y)=>add3(add3(b,mul3(f,x)),mul3(u,y)),D=(a,b,c)=>nrm3(add3(add3(mul3(d,a),mul3(u,b)),mul3(f,c))),oo={t:o.t,nail:o.nail,tip:0};
  // a fist: the closed fingers don't change the outline, so they are one rounded mitten curled round the grip (fk_mitten) with
  // the finger separations painted as dark lines; the thumb is its own loft folded over it
  if(kind=='fist')fk_mitten(B,col,P(add3(a2,mul3(d,.064*hw)),0,-.002*hw),D(1,-.7,.03),L*.6,r*1.08,.0165*hw*1.85,2,1.5,ax,u,W,o.t);
  const kc=kind=='claw'?add3(a2,mul3(d,.062*hw)):kn;
  for(let i=0;i<4&&kind!='fist';i++){const z=(1.5-i)*(kind=='claw'?.0178:.0165)*hw,p=P(kc,z,-.004*hw);
    if(kind=='claw')fk_digit(B,col,p,D(1,-.2,z*1.6/hw),L*[.96,1.04,.97,.8][i],r*(i==3?.9:1),3,.46,ax,W,Object.assign({},oo,{tip:o.tip||0,seg:5,root:2.6}));   /* bony, three-jointed, curving in */
    else fk_digit(B,col,p,D(1,-.22,z*.7/hw),L*.86*[.96,1.04,.97,.8][i],r*(i==3?.9:1),2,.42,ax,W,Object.assign({},oo,{seg:5}))}
  if(kind=='fist')fk_digit(B,col,P(add3(a2,mul3(d,.034*hw)),.026*hw,-.008*hw),D(1,-.3,.22),L*.44,r*1.1,2,.6,ax,W,oo);   /* the thumb folded over the curled fingers */
  else fk_digit(B,col,P(add3(a2,mul3(d,.03*hw)),.026*hw,-.01*hw),D(.6,-.3,.75),L*.62,r*1.05,2,.3,nrm3(cross3(u,f)),W,Object.assign({},oo,{tip:o.tip?o.tip*.6:0}))}
// a plate harness (the Blood Knight's kit): cuirass, gorget, mail skirt and tassets, belt, pauldrons, arm and leg plates,
// gauntlets, sabatons; pal {pl, pl2, ed, gd, ml, belt}; o.pauldron 'dome' | 'spiked', o.spikes
function cgPlate(B,k,M,S,pal,o){o=o||{};const T=S.torso,J=S.J,wy=T[2][0],sh=T[6][0],ey=J.aR1[1],wr=J.aR2[1],kn=J.rh1[1],an=J.rh2[1],{pl,pl2,ed,gd,ml}=pal;
  cgShell(B,M,m=>m.part=='torso'&&m.y>wy-.02,.034,m=>m.y<wy+.03||m.y>sh+.02?gd:m.y<wy+.12?(Math.round(m.y*34)%2?pl:pl2):Math.abs(m.x)<.025&&m.s>0?pl2:Math.round(Math.atan2(m.x,m.z)*7)%2?pl:mdSh(pl,.84),{t:'m'});
  cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh)||(m.part=='head'&&m.y<S.hp(0,1.535,0)[1]),.05,m=>m.y>S.hp(0,1.5,0)[1]?gd:pl2,{t:'m'});
  cgSkirt(B,S,wy-.04,J.lh0[1]-.24,.05,.03,m=>Math.round(m.y*60)%3==0?mdSh(ml,.7):ml,{n:4,seg:16});
  cgSkirt(B,S,wy-.04,J.lh0[1]-.15,.05,.052,m=>m.y<J.lh0[1]-.13?gd:Math.round(m.y*30)%2?pl:pl2,{n:4,t:'m',seg:16,keep:m=>Math.abs(m.c)>.25||m.s<-.2});
  cgBelt(B,M,wy-.015,.022,.058,pal.belt||0x1a1012,'m');const bk=cgSurf(M,S,wy-.015,0,.062);k.p('pelvis','dod','m',gd,bk[0],bk[1],bk[2],.03,.028,.014);
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],L=s<0?'lh':'rh';
    [[.05,.15,.11,.16,pl],[.0,.14,.09,.15,pl2],[-.05,.13,.075,.135,ed]].forEach(([dy,sx,sy,sz,c],j)=>{k.p(A+'0','hem','m',c,a[0]+s*(.03+j*.014),a[1]+dy,a[2],sx,sy,sz,0,0,s*(.42+j*.12));if(!j)k.p(A+'0','tor','m',gd,a[0]+s*.03,a[1]+dy-.004,a[2],sx,.012,sz,0,0,s*.42)});   /* (refine) one rim, on the top plate (budget) */
    if(o.spikes)for(let j=0;j<3;j++)k.L(A+'0','m',o.spikes,[a[0]+s*(.06+j*.03),a[1]+.08,a[2]-.04+j*.04],[a[0]+s*(.11+j*.03),a[1]+.2,a[2]-.05+j*.04],.022,.002,5);
    cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<a[1]-.08&&m.y>ey+.035,.022,m=>Math.round(m.y*28)%2?pl:pl2,{t:'m'});
    cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<ey-.03&&m.y>wr-.03,.022,m=>m.y<wr+.02?gd:pl,{t:'m'});
    cgShell(B,M,m=>(m.part=='hand'||(m.part=='arm'&&m.y<wr-.03))&&Math.sign(m.x)==s,.012,pl,{t:'m'});fk_fingers(B,S,s,pl,'fist',{len:1.1,r:.0092,t:'m'});
    const e=J[A+'1'],eb=e[2]-.06;k.p(A+'1','dod','m',pl2,e[0],e[1],eb,.05,.05,.04);k.L(A+'1','m',ed,[e[0],e[1],eb-.02],[e[0]+s*.02,e[1]+.03,eb-.09],.02,.002,4);
    cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn+.05&&m.y<J.lh0[1]-.1,.024,m=>Math.round(m.y*24)%2?pl:pl2,{t:'m'});
    const kq=J[L+'1'];k.p(L+'1','hem','m',pl2,kq[0],kq[1],kq[2]+.075,.075,.055,.06,Math.PI/2,0,0);k.L(L+'1','m',ed,[kq[0],kq[1]+.01,kq[2]+.12],[kq[0],kq[1]+.07,kq[2]+.18],.02,.002,4);
    cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<kn-.04&&m.y>an-.02,.022,m=>m.y<an+.04?gd:m.s>.6?pl2:pl,{t:'m'});
    cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.016,pl,{t:'m'})})}

// eyes in the sockets (cgEyes with a 36-triangle shape instead of 56) and toes: n big toes with claws (goblins: 3)
function fk_eyes(k,M,S,col,ex,ey,r,out){[-1,1].forEach(s=>{const q=S.hp(s*ex,ey,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(p)k.p('head','dod','g',col,p[0],p[1],p[2]+(out||.001),.009*S.hs*(r||1),.0062*S.hs*(r||1),.005,0,0,s*.25)})}
function fk_toes(k,S,s,col,claw,n){n=n||3;const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,W=S.foot.w;for(let i=0;i<n;i++){const o=i-(n-1)/2,tx=A[0]+o*.024*W,tz=A[2]+.155*L,r=(.012-Math.abs(o)*.002)*W;
  k.L(l,'c',col,[tx,.017,tz-.03],[tx+o*.006,.012,tz+.016],r,r*.8,4);if(claw)k.L(l,'c',0x1a1408,[tx+o*.006,.012,tz+.012],[tx+o*.008,.004,tz+.016+claw],r*.7,.0015,4)}}
// ===================================================================== goblins =====================================================================
// (restore pass) the old goblins were stocky, with long thick tusks. (refine, Oct 31 2026) goblins are not men: small and
// crouched, a big head with long ears on a thin neck, broad bony shoulders over a pinched waist and a little pot belly, wiry
// limbs with knobby elbows and knees, long arms ending in big hands, short bowed legs on big flat feet. The kit stays (tusks,
// hoods, skulls, loincloths, straps, pauldrons).
// arm rings: shoulder, upper arm, elbow, wrist, palm, knuckles · leg rings: hip, thigh, knee, calf, ankle
const GOB181=o=>Object.assign({snug:1.8,h:.68,w:1.08,d:1.06,rw:[.9,.98,.82,.92,1.08,1.16,1.22,1.02],rf:[1,1.06,1.16,1.1,1.06,1.02,.98,.95],rb:[1,1.08,1,1.04,1.1,1.1,1.06,1],
  at:1.12,lt:1.1,hs:1.42,hw:1.1,hd:1.06,armL:1.16,legL:.84,foot:1.45,footW:1.4,nw:1.15,
  armR:[1.05,.88,1.18,.9,1.4,1.45],legR:[1,.86,1.14,.98,1.12]},o||{});
function cgGoblinBody(B,k,C,S,K){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceGoblin()));fk_shade(M,S);
  // the hide (drawn by f6_reg, after the clothes): crisp sockets and mouth line; the rest flows corner to corner: a darker back,
  // a paler belly and throat, soft darker blotches
  const sk=K.sk,dk=mdSh(mdMix(sk,0x2a3420,.35),.74),pale=mdMix(sk,0xb8b070,.3),bl=mdSh(mdMix(sk,0x4a3a20,.4),.8);
  C.f6skin=m=>cgFacePaint(S,m,sk,{sock:0x1a1408})||(K.paint&&K.paint(m))||null;
  C.f6vcol=m=>{let c=mdMix(sk,dk,Math.max(0,Math.min(1,.1-m.s*.8)));if(m.s>.2&&(m.part=='torso'||m.part=='neck'))c=mdMix(c,pale,Math.min(1,(m.s-.2)*1.3)*.6);
    const n=n3Sn(m.x,m.y,m.z,13,K.sd||5);c=mdMix(c,bl,Math.max(0,Math.min(1,(n-.55)*3))*.45);return m.part=='hand'||m.part=='foot'?mdSh(c,.9):c};
  fk_eyes(k,M,S,K.eye,.038,1.628,K.er||1.05,K.eo==null?-.001:K.eo);cgEars(k,M,S,sk,1.632,.2,.17,.3,.034,mdSh(sk,.62));f6_tusks(k,M,S,0xe0d8b8,.027,.036,.0095);
  [-1,1].forEach(s=>{fk_fingers(B,S,s,mdSh(sk,.95),K.fist&&K.fist(s)?'fist':'claw',{w:1.32,len:1.15,r:.0074,nail:0x1a1408,tip:.018});fk_toes(k,S,s,mdSh(sk,.85),.02)});return M}
// the old goblins' dark hide breeches over the hips, and a loincloth: one flap in front, one behind, over a belt
function f6_gobLoin(B,M,S,lo,belt,pa){const T=S.torso,J=S.J,wy=T[2][0],hy=J.lh0[1];
  fk_shell(B,M,m=>(m.part=='torso'&&m.y<wy+.01)||(m.part=='leg'&&m.y>J.lh1[1]+.1),.01,null,{vcol:fk_nz(pa,.22,10)});
  cgSkirt(B,S,wy-.02,J.lh1[1]+.02,.03,.03,m=>a181Nz(m.y<J.lh1[1]+.07?mdSh(lo,.78):lo,m,.1,6),{n:5,seg:16,keep:m=>Math.abs(m.c)<.42||m.y>hy-.01});
  f6_belt(B,M,wy-.01,.024,.034,belt,.01)}
// ---------------- Hobgoblin: a stocky brute with a club: breeches and a loincloth, a shoulder strap, a spiked pauldron, leather bracers, a bone necklace ----------------
(function(){const S=fk_body(GOB181(),FK_HIG),K={sk:0x56603c,eye:0xffc020,fist:s=>s>0,sd:5,
    /* (refine) war paint, as paint: three rust-red claw slashes down the chest, a smear across the eyes */
    paint:m=>{if(m.part=='torso'&&m.s>.4){const T=S.torso,y=(m.y-T[3][0])/(T[6][0]-T[3][0]);if(y>.15&&y<.85&&[-.05,0,.05].some(x=>Math.abs(m.x-x-(y-.5)*.05)<.0075))return 0x6a2414}
      if(m.part=='head'&&m.s>.3){const by=(m.y-S.nb)/S.hs+1.52;if(Math.abs(by-1.629)<.009&&Math.abs(m.x/S.hs)>.055&&Math.abs(m.x/S.hs)<.085)return 0x5a1e10}return null}},lt=0x3a2618,lo=0x5a4628,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{w:1.32,len:1.15})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('hob',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    f6_gobLoin(B,M,S,lo,lt,0x4a3a22);
    // the strap: from the right shoulder down across the chest to the left hip, and over the shoulder down the back
    f6_strap(B,M,S,[[wy+.02,-.75,.012],[(wy+sh)/2,-.1,.012],[sh-.05,.42,.012],[sh+.015,1.2,.014],[sh-.05,Math.PI-.45,.012],[(wy+sh)/2,Math.PI+.15,.012],[wy+.02,Math.PI+.75,.012]],.013,lt);
    const a=J.aL0;k.p('aL0','hem','m',0x4a3a26,a[0]-.03,a[1]+.03,a[2],.12,.09,.12,0,0,-.4);for(let i=0;i<3;i++)k.L('aL0','m',0x8a8a90,[a[0]-.06-i*.028,a[1]+.07,a[2]-.025+i*.028],[a[0]-.1-i*.028,a[1]+.16,a[2]-.025+i*.028],.018,.002,5);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.012,m=>Math.round(m.y*50)%2?lt:mdSh(lt,.75))});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,sh-.035-Math.abs(i-3)*.012,(i-3)*.26,.006);k.p('chest',i%2?'cone4':'oct','c',i%2?0xd8d0b0:0x6a3a2a,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
// ---------------- Hobgoblin Slinger: a hood that drapes over the shoulders, a cross strap, breeches and a loincloth, a belt pouch of stones ----------------
(function(){const S=fk_body(GOB181({h:.66}),FK_HIG),K={sk:0x5c6640,eye:0xffc020,fist:s=>s>0,sd:7},hd=0x5a4630,lo=0x6a5434,lt=0x3a2618,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{w:1.32,len:1.15})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('sling',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    f6_gobLoin(B,M,S,lo,0x2a1a10,0x4a3a22);
    // the cross strap: left shoulder to right hip (the sling's), front and back
    f6_strap(B,M,S,[[wy+.02,.75,.012],[(wy+sh)/2,.1,.012],[sh-.05,-.42,.012],[sh+.015,-1.2,.014],[sh-.05,-Math.PI+.45,.012],[(wy+sh)/2,-Math.PI-.15,.012],[wy+.02,-Math.PI-.75,.012]],.012,lt);
    // the hood: open round the face, its cowl draped down over the shoulders and the tops of the arms, a limp point behind
    cgHood(B,k,M,S,{vcol:m=>a181Nz(m.part=='head'||m.part=='neck'?hd:mdSh(hd,.9),m,.2,9),off:.02,drape:.09,arm:.07,tip:mdSh(hd,.9),top:.045});   /* the hood comes down over the forehead to just above the brow */
    const p=cgSurf(M,S,wy-.03,1.4,.04);k.p('pelvis','sph','c',0x4a3420,p[0],p[1],p[2],.045,.055,.042)})})();
// ---------------- Goblin Shaman: a long robe, a skull worn over the brow (the green eyes glow beneath it), a crest of feathers, bead and fang necklaces ----------------
(function(){const S=fk_body(GOB181({h:.74,legL:.88}),FK_HIG),K={sk:0x54644a,eye:0x7aff6a,er:1.25,eo:.001,fist:s=>s>0,sd:9},rb=0x3a5434,rb2=0x2e4628,bone=0xc8bea4,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{w:1.32,len:1.15})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('shaman',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0];
    fk_shell(B,M,m=>(m.part=='torso'&&m.y>wy-.03&&Math.abs(Math.atan2(m.x,m.z))>.35)||(m.part=='arm'&&m.y>J.aR2[1]+.04),.016,null,{vcol:fk_nz(rb,.22,9)});
    cgSkirt(B,S,wy-.02,J.lh2[1]+.1,.1,.024,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,m,.1,6),{n:6,seg:16,keep:m=>!(m.y<J.lh1[1]-.08&&a181H(Math.round(Math.atan2(m.c,m.s)*9),2)<(J.lh1[1]-.08-m.y)*2)});
    f6_belt(B,M,wy-.01,.024,.03,0x5a4a2a,.016);
    // the skull: a bone cap over the brow and crown (its own dark eye holes above the real ones), the glowing eyes left bare
    const bx=m=>m.x/(S.hs*1.1),by=m=>(m.y-S.nb)/S.hs+1.52;
    cgShell(B,M,m=>m.part=='head'&&by(m)>1.645&&m.s>-.25,.012,m=>{const x=bx(m),y=by(m);if(Math.abs(Math.abs(x)-.03)<.014&&Math.abs(y-1.676)<.009)return 0x14100c;
      if(m.s>.5&&Math.abs(x)<.006&&y>1.651&&y<1.664)return 0x14100c;return Math.abs(x+.012-(y-1.66)*.4)<.003&&y>1.685?0x6a6050:a181Nz(bone,m,.12,9)},{rim:.35});
    for(let i=0;i<5;i++){const t=S.hp(-.06+i*.03,1.72,-.02);k.L('head','c',[0x8a2a1a,0x2a6a8a,0xc8a02a,0x2a2a2a,0x8a2a1a][i],t,[t[0]*2.2,t[1]+.13*S.hs,t[2]-.05],.02,.003,4)}
    for(let j=0;j<2;j++)for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.02-j*.04-Math.abs(i-4)*.01,(i-4)*.2,.018);k.p('chest',i%2?'cone4':'oct','c',i%2?0xe8e0c8:j?0x2a6a3a:0x8a2a1a,p[0],p[1]-.01,p[2],.01,i%2?.03:.01,.009,Math.PI)}})})();
// (refine) a deeper crouch: bent knees, the back leaning forward, the head raised to look ahead, arms hanging forward
ST179.hob={sx:.3,hx:-.3,lk:.44,rk:.44,az:.06,lz:-.06,le:-.38,ex:-.2};ST179.sling={sx:.28,hx:-.28,lk:.36,rk:.36,ax:-.28,ex:-.5,az:.05,lz:-.05,le:-.35};   /* the sling held up off the ground */ST179.shaman={sx:.3,hx:-.28,lk:.36,rk:.36,lz:-.05,le:-.35};

// ===================================================================== humans =====================================================================
function cgHumanBody(B,k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman(o.face)));fk_shade(M,S);
  // the skin is drawn by f6_reg, after the clothes: crisp paint (sockets, lips, scars), the rest flowing (a little darker behind)
  const sk2=mdSh(K.sk,.84);C.f6skin=m=>(o.paint&&o.paint(m))||cgFacePaint(S,m,K.sk)||null;
  C.f6vcol=m=>{const c=a181Nz(mdMix(K.sk,sk2,Math.max(0,Math.min(1,-m.s*1.1-.15))),m,.08,9);return o.vpaint?o.vpaint(m,c):c};   /* o.vpaint: soft paint (scars) */
  if(o.glow)fk_eyes(k,M,S,o.glow,.036,1.629,.9,-.001);else[-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p){k.p('head','dod','c',0xd8d0c4,p[0],p[1],p[2]-.003,.011*S.hs,.007*S.hs,.006);k.p('head','ico','c',K.iris||0x2a1a10,p[0]-s*.001,p[1],p[2]+.002,.005*S.hs,.005*S.hs,.003)}});
  if(o.ears!==false)cgEars(k,M,S,mdSh(K.sk,.92),1.625,.05,.15,.6,.02);
  [-1,1].forEach(s=>{if(!(o.noHands&&o.noHands(s)))fk_fingers(B,S,s,K.hand||K.sk,K.fist&&K.fist(s)?'fist':'open',{r:.0074})});return M}
const HUM181=o=>Object.assign({snug:1.6,h:1.02,w:1.02,d:1.02,rw:[1,1.05,1,1.02,1.08,1.08,1.1,1.05],at:1.1,lt:1.05,hs:.96,armL:1.0,legL:1.03},o||{});
// (restore pass) the old human foes stood about 15–20% shorter than the first cage versions (their heights are matched again
// with h below); the head keeps its size, so they read sturdier, like the old ones. (refine) human proportions kept, now on the
// seated-limb body (fk_body): arms grow out of the shoulders, thighs out of the hips under the clothes
// ---------------- Bandit: dark leather garb with crossed straps, a hood, a black cloth mask over the lower face, a red sash, a short ragged cape with a red hem, boots ----------------
(function(){const S=fk_body(HUM181({h:.8,w:.98,at:1.02,lt:1.04,hs:.94})),K={sk:0x9a7a62,fist:s=>s>0},lt=0x34343c,lt2=0x26262c,bt=0x2a2018,red=0x6a2222,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('bandit',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{ears:false}),wy=T[2][0],sh=T[6][0],yc=(wy+sh)/2;
    fk_shell(B,M,m=>(m.part=='torso'&&m.y>J.lh0[1]-.06)||(m.part=='arm'&&m.y>J.aR2[1]+.02),.014,null,{vcol:m=>a181Nz(m.part=='arm'?lt2:lt,m,.2,9)});
    [-1,1].forEach(s=>f6_strap(B,M,S,[[sh-.03,s*.62,.02],[(sh+yc)/2,s*.3,.02],[yc,0,.02],[(wy+yc)/2,-s*.3,.022],[wy+.02,-s*.6,.02]],.009,mdSh(lt,.55)));
    fk_shell(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.01,null,{vcol:fk_nz(0x2e2a30,.2,9)});
    // boots with a turned-down cuff
    const bt0=J.rh1[1]-.08;fk_shell(B,M,m=>m.part=='foot'||(m.part=='leg'&&m.y<bt0),.02,m=>m.part=='foot'&&m.y<.025?0x1e1610:null,{vcol:fk_nz(bt,.18,9)});
    fk_shell(B,M,m=>m.part=='leg'&&m.y<bt0+.005&&m.y>bt0-.04,.032,null,{rim:.5,vcol:fk_nz(0x4a3020,.15,9)});
    // the hood, and the black cloth mask over the mouth and nose
    cgHood(B,k,M,S,{vcol:fk_nz(0x2a2a30,.2,9),off:.016,drape:.08});const my=S.hp(0,1.612,0)[1];
    fk_shell(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<my,.012,m=>m.y>my-.006*S.hs?0x2c2c32:null,{rim:.1,vcol:fk_nz(0x1c1c20,.15,9)});
    // a red sash, its knot and two tails on the left hip; daggers at both hips
    f6_belt(B,M,wy-.01,.026,.028,m=>a181Nz(red,m,.1,9),.014);const kn=cgSurf(M,S,wy-.012,-.9,.03);k.p('pelvis','sph','c',mdSh(red,.85),kn[0],kn[1],kn[2],.02,.018,.014);
    [0,1].forEach(i=>k.L('pelvis','c',i?mdSh(red,.8):red,[kn[0],kn[1]-.008,kn[2]],[kn[0]-.012+i*.02,kn[1]-.11+i*.02,kn[2]+.012],.012,.008,4));
    [-1,1].forEach(s=>{const p=cgSurf(M,S,wy-.02,s*1.2,.03);k.L('pelvis','m',0x8a8a92,p,add3(p,[s*.01,-.14,.02]),.008,.002,4)});
    f6_cape(B,S,{len:J.lh1[1]+.06,w:.9,col:0x2a1c1e,ins:0x160e10,hem:0x4a1a1a,rag:.35,seg:16})})})();
// ---------------- Brigand Captain: a light-grey mail hauberk with short sleeves and a skirt, a red tabard, a nasal helm with cheek guards, a beard,
// round pauldrons (spiked on the left), leather bracers, brown leather legs, boots with white fur cuffs, a short cape ----------------
(function(){const S=fk_body(HUM181({h:.84,w:1.08,d:1.06,at:1.2,lt:1.12})),K={sk:0x9a7258,fist:s=>s>0},ml=0x80828a,ml2=0x74767e,tb=0x6a1e18,tb2=0x3a0e0a,ir=0x6a6c72,ir2=0x4a4e56,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('brigand',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0],kn=J.rh1[1];
    // the hauberk: chest and back, short sleeves to above the elbow, and its skirt to mid-thigh with a darker hem
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.04)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR1[1]+.04),.016,m=>a181Nz(Math.round(m.y*60)%2?ml:ml2,m,.12,20),{t:'m'});   /* (refine) and a mail collar round the neck */
    cgSkirt(B,S,wy-.02,kn+.13,.05,.03,m=>m.y<kn+.17?mdSh(ml,.7):Math.round(m.y*60)%2?ml:ml2,{n:4,t:'m',seg:16});
    // the tabard: front and back panels over the hauberk, hanging to the knees
    // (refine) the tabard's edges trimmed in dark red (paint)
    fk_shell(B,M,m=>m.part=='torso'&&Math.abs(m.x)<.1&&Math.abs(m.s)>.5&&m.y<sh-.02&&m.y>wy-.04,.03,m=>Math.abs(m.x)>.072?tb2:null,{rim:.3,vcol:fk_nz(tb,.15,9)});
    cgSkirt(B,S,wy-.02,kn+.04,.05,.05,m=>m.y<kn+.07?tb2:a181Nz(tb,m,.1,8),{n:4,seg:16,keep:m=>Math.abs(m.c)<.38});f6_belt(B,M,wy-.01,.026,.042,0x2a1a10,.03);
    // the helm: a dome with a brow band, cheek guards down the sides of the face, a nasal bar
    const hb=m=>(m.y-S.nb)/S.hs+1.52;cgShell(B,M,m=>m.part=='head'&&(hb(m)>1.655||(Math.abs(m.x)>.046*S.hs&&m.s>-.35&&m.s<.8&&hb(m)>1.585)),.026,m=>Math.abs(hb(m)-1.662)<.007?ir:a181Nz(ir2,m,.15,20),{t:'m',rim:.4});
    const np=S.hp(0,1.64,0),nr=cgRay(M,[0,np[1],np[2]+.5],[0,0,-1],{head:1});if(nr)k.p('head','box','m',ir,0,np[1]-.012,nr[2]+.026,.022,.07,.012);
    cgFur(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-S.hp(0,1.557,0)[1])<.008*S.hs),{off:.01,len:.05,col:0x3a2414,col2:0x2a180c,seed:61,jag:.5,lump:[.6,.6]});
    // round pauldrons, the left one spiked
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A];k.p(A,'hem','m',ir,a[0]+s*.03,a[1]+.03,a[2],.115,.09,.12,0,0,s*.4);
      if(s<0)for(let i=0;i<2;i++)k.L(A,'m',0x9a9ea6,[a[0]-.06-i*.03,a[1]+.07,a[2]-.02+i*.04],[a[0]-.1-i*.03,a[1]+.16,a[2]-.02+i*.04],.018,.002,5)});
    // leather bracers, brown leather legs, boots with white fur cuffs
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.07&&m.y>J[A+'2'][1]+.01,.012,m=>Math.round(m.y*50)%2?0x4a3020:0x3a2618)});
    fk_shell(B,M,m=>(m.part=='leg'&&m.y>kn-.08)||(m.part=='torso'&&m.y<J.lh0[1]-.06),.01,null,{vcol:fk_nz(0x4a3426,.2,9)});
    [-1,1].forEach(s=>{fk_shell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<kn-.06))&&Math.sign(m.x)==s,.022,m=>m.part=='foot'&&m.y<.025?0x1e1610:null,{vcol:fk_nz(0x4a3220,.18,9)});
      cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&Math.abs(m.y-(kn-.075))<.028,{off:.032,len:.045,col:0xd8ccb0,col2:0xb4a88c,seed:62+s,jag:.5,lump:[.8,.4]})});
    f6_cape(B,S,{len:J.lh1[1]+.12,w:1.0,col:0x4a1410,ins:0x200806,rag:.5,seg:12})})})();
// ---------------- Ember Cultist: a deep red hood with horns, a face lost in shadow (only the eyes burn), a long robe, a glowing sigil ----------------
(function(){const S=fk_body(HUM181({h:.9,w:.96,at:.95})),K={sk:0x140c0a,hand:0x8a6a56,fist:s=>s>0},rb=0x4a100c,rb2=0x2a0806,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('cultist',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:0xff6a20,ears:false}),wy=T[2][0];
    fk_shell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,null,{vcol:fk_nz(rb,.2,9)});cgSkirt(B,S,wy-.01,.03,.14,.024,m=>mdMix(a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,m,.1,6),0x0c0404,Math.max(0,Math.min(.85,(.32-m.y)*3))),{n:6,seg:16});   /* (refine) the hem charred black */
    cgHood(B,k,M,S,{vcol:fk_nz(0x380a08,.2,9),off:.022,drape:.12,peak:0x380a08,ph:.06});
    [-1,1].forEach(s=>{const t=S.hp(s*.06,1.7,-.01);let p=t;[[s*.05,.06,-.02],[s*.03,.06,-.04],[0,.05,-.05]].forEach((d,j)=>{const n=add3(p,mul3(d,S.hs));k.L('head','c',0x2a2420,p,n,(.022-j*.006)*S.hs,(.016-j*.006)*S.hs,5);p=n})});
    // the sigil: a burning diamond on the breast, set into the robe (it touches the robe's surface, so it is not seated in the skin)
    f6_belt(B,M,wy-.01,.024,.03,0x1e0806,.016);const g=cgSurf(M,S,J.chest[1]+.03,0,.016),n0=k.P.length;k.p('chest','oct','g',0xff6a20,g[0],g[1],g[2]+.003,.032,.05,.01);k.p('chest','oct','c',0x1e0806,g[0],g[1],g[2]-.001,.044,.066,.01);
    for(let i=n0;i<k.P.length;i++)k.P[i].noSeat=1})})();
// ---------------- Hollow Knight: black plate, a great helm with a glowing red visor slit and breathing holes, bone horns, a dark cape ----------------
(function(){const S=fk_body(HUM181({h:.9,w:1.1,d:1.08,rw:[1.12,1.18,1.12,1.16,1.22,1.22,1.28,1.3],at:1.32,lt:1.28,hs:.96,nw:1.25,foot:1.05,footW:1.1}),[0,4,6,8,10,12,14]),T=S.torso,J=S.J;   /* (refine) a plain helm: fewer head rings (the head is all helm) */
  const pal={pl:0x24262c,pl2:0x34363e,ed:0x4a4c56,gd:0x5a5e68,ml:0x2a2a30,belt:0x141418};
  S.grip={'1':fk_gripOf(S,1,{len:1.1})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('knight',S,function(B,P,k,C){const M=C.M;C.f6skin=0x161618;fk_shade(M,S,{cav:1.2});cgPlate(B,k,M,S,pal);
    // the great helm: the visor slit is part of the helm's own surface, burning red (the glow layer); a band of lighter steel
    // above it, and breathing holes punched in the right cheek plate
    const hb=m=>(m.y-S.nb)/S.hs+1.52,bx=m=>m.x/S.hs,slit=m=>m.s>.42&&Math.abs(hb(m)-1.629)<.0115&&Math.abs(bx(m))<.072;
    const holes=m=>m.s>.45&&[[.03,1.585],[.045,1.585],[.03,1.571],[.045,1.571],[.06,1.578]].some(([x,y])=>Math.abs(bx(m)-x)<.0055&&Math.abs(hb(m)-y)<.0045);
    cgShell(B,M,m=>m.part=='head'&&!slit(m),.03,m=>{if(holes(m))return 0x050404;const y=hb(m);if(m.s>.3&&(Math.abs(y-1.629)<.017))return 0x0e0e10;if(Math.abs(y-1.664)<.007)return pal.gd;return y>1.7&&Math.abs(bx(m))<.03?pal.pl2:pal.pl},{t:'m',rim:1});
    cgShell(B,M,m=>m.part=='head'&&slit(m),.03,m=>Math.abs(hb(m)-1.629)<.006?0xff3a20:0xd01a10,{t:'g',rim:1});
    C.f6hide=[m=>m.part=='head'];   /* (refine) the helm and the slit cover the whole head: its skin is not drawn */
    [-1,1].forEach(s=>{const q=S.hp(s*.09,1.69,-.01);let p=q;[[s*.04,.05,-.02],[s*.02,.06,-.04],[-s*.005,.05,-.05]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',0x8a8270,p,n,.026-j*.007,.019-j*.007,5);p=n})});
    f6_cape(B,S,{len:J.lh1[1]-.05,w:1.2,col:0x18141e,ins:0x0c0a10,trim:0x2a1e30,rag:.6,seg:12})})})();
ST179.knight={sx:.06,hx:-.04,lk:.12,rk:.12,az:.04,lz:-.05,le:-.15};
// (round 2) arms that rest along the body: every folk foe is built snug (HUM181 / GOB181), so the stances hold the arms out
// only a little (az / lz ≤ .06); the zealot's and the salt caller's stances (3381) are narrowed here
ST179.ss165zealot=Object.assign({},ST179.ss165zealot,{lz:-.05});ST179.ss165caller=Object.assign({},ST179.ss165caller,{lz:-.05});
// ---------------- Zealot of the Endless One: a bronze hood draped on the shoulders, a dark mask over the lower face, a patch with a red lens over
// one eye, a crest of five viper spines and three plumes, a bare scarred torso, a rust kilt, a dagger sheath on the hip, wrapped forearms and shins, bone charms ----------------
(function(){const S=fk_body(HUM181({h:.8,w:.96,d:.95,at:1.0,lt:.98})),K={sk:0x664a38,fist:s=>s>0},rust=0x4a1a0e,rust2=0x30100a,wrap=0x6a5e48,bronze=0x4e3e24,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('ss165zealot',S,function(B,P,k,C){const sc=mdSh(K.sk,.65),M=cgHumanBody(B,k,C,S,K,{ears:false,vpaint:(m,c)=>{if(m.part!='torso')return c;const a=Math.atan2(m.x,m.z),w=Math.sin(a*2+m.y*13),e=Math.min(1,Math.max(0,(m.y-T[2][0])*25),Math.max(0,(T[6][0]-.02-m.y)*25));
      return mdMix(c,sc,Math.max(0,1-Math.abs(w)/.14)*e*.9)}}),wy=T[2][0];   /* (refine) the serpent scars drawn soft, flowing over the skin, not stepped face by face */
    const hb=m=>(m.y-S.nb)/S.hs+1.52;
    cgHood(B,k,M,S,{vcol:m=>a181Nz(m.part=='torso'&&m.y<T[6][0]-.04?mdSh(bronze,.82):bronze,m,.18,9),off:.02,drape:.1,arm:.06});
    // the mask over the mouth and nose, edged in rust
    fk_shell(B,M,m=>m.part=='head'&&m.s>.1&&hb(m)<1.611,.012,m=>hb(m)>1.604?rust2:null,{rim:.1,vcol:fk_nz(mdSh(bronze,.55),.15,9)});
    // the eye patch over the left eye: a dark plate, a ring, a red glass lens
    const e=S.hp(.036,1.629,0),ep=cgRay(M,[e[0],e[1],e[2]+.4],[0,0,-1],{head:1});
    if(ep){k.p('head','box','c',0x14100c,ep[0],ep[1],ep[2]+.001,.034*S.hs,.03*S.hs,.012);k.p('head','ring','m',0x6a5a3a,ep[0],ep[1],ep[2]+.006,.016*S.hs,.12,.016*S.hs,Math.PI/2);k.p('head','cyl','g',0xc03020,ep[0],ep[1],ep[2]+.006,.009,.006,.009,Math.PI/2)}
    // five viper spines down the crown of the hood, three plumes from the back of it
    const n0=k.P.length;for(let i=0;i<5;i++){const a=-.45+i*.32,o=S.hp(0,1.625+Math.cos(a)*.11,Math.sin(a)*.115+.005),p=cgRay(M,[0,o[1]+Math.cos(a)*.3,o[2]+Math.sin(a)*.3],[0,-Math.cos(a),-Math.sin(a)],{head:1});
      if(p)k.p('head','cone4','c',rust2,p[0],p[1]+Math.cos(a)*.03,p[2]+Math.sin(a)*.03,.014,.05-Math.abs(i-1.5)*.006,.02,a)}
    for(let i=n0;i<k.P.length;i++)k.P[i].noSeat=1;
    for(let i=0;i<3;i++){const t=S.hp(-.04,1.69,-.06);k.L('head','c',i==1?0xe8e0d0:rust2,t,S.hp(-.09-i*.02,1.76-i*.02,-.15),.012,.002,4)}
    cgSkirt(B,S,wy-.02,J.rh1[1]+.06,.04,.02,m=>Math.round(Math.atan2(m.c,m.s)*8)%2?rust:rust2,{n:5,seg:16});f6_belt(B,M,wy-.01,.024,.024,0x2a1a10,0);
    // the curved dagger's sheath on the right hip
    const sp=cgSurf(M,S,J.lh0[1]-.03,-1.5,.03);k.p('pelvis','box','c',0x2a1a10,sp[0]-.006,sp[1]-.05,sp[2]+.01,.03,.15,.045,0,0,.25);k.p('pelvis','box','m',0x6a5a3a,sp[0]-.004,sp[1]+.02,sp[2]+.01,.034,.016,.05,0,0,.25);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.02&&m.y>J[A+'2'][1],.008,m=>Math.round(m.y*60)%2?wrap:mdSh(wrap,.8));
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.02&&m.y>J[L+'2'][1]+.02,.008,m=>Math.round(m.y*50)%2?wrap:mdSh(wrap,.8));cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.012,0x3a2618)});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-3)*.014,(i-3)*.24,.008);k.p('chest',i%2?'cone4':'oct','c',i%2?0xe0d4b4:0x6a2412,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
// ---------------- Salt Caller: a salt-crusted sand robe, a tall blood-red cowl, glowing salt crystals through the shoulders and down the spine ----------------
(function(){const S=fk_body(HUM181({h:.9,w:.96,at:.95})),K={sk:0x7a6450,fist:s=>s>0},robe=0x6e6248,robe2=0x5e5238,red=0x4a100c,salt=0xe8e4dc,gl=0x40e0c0,T=S.torso,J=S.J;
  S.grip={'1':fk_gripOf(S,1,{})};   /* (round 2) the weapon's handle through the closed fist */
  f6_reg('ss165caller',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:gl,ears:false}),wy=T[2][0];
    fk_shell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,null,{vcol:fk_nz(robe,.2,9)});
    cgSkirt(B,S,wy-.01,.04,.13,.024,m=>mdMix(a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?robe:robe2,m,.1,6),mdMix(salt,0xc8c0b0,.4),Math.max(0,Math.min(1,(.3-m.y)*4.5)))   /* (refine) salt crust creeping up from the hem */,{n:6,seg:16});
    cgFur(B,M,m=>m.part=='arm'&&Math.abs(m.y-(J.aR2[1]+.06))<.02,{off:.024,len:.04,col:salt,col2:0xc8c0b0,seed:71,jag:.5,lump:[.8,.4]});
    cgHood(B,k,M,S,{vcol:fk_nz(red,.2,9),off:.022,drape:.1,peak:0x3a0c08,ph:.15});
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A];for(let i=0;i<3;i++){const x=a[0]+s*(i*.025),z=a[2]-.02+i*.02,p=cgRay(M,[x,a[1]+.5,z],[0,-1,0],{arm:1,torso:1});if(p)k.p(A,'oct',i?'c':'g',i?salt:gl,p[0],p[1]+.02,p[2],.022-i*.004,.06-i*.012,.022-i*.004,0,0,s*(.4+i*.25))}});   /* grown out of the shoulder's skin */
    // salt crystals breaking through the robe down the spine, leaning out of the back
    for(let i=0;i<4;i++){const y=T[6][0]-.05-i*.075*S.h,p=cgSurf(M,S,y,Math.PI,.01);k.p('chest','oct','c',i%2?0xd8d2c6:salt,p[0],p[1],p[2]-.004,.02-i*.002,.055-i*.005,.02-i*.002,-.55)}
    for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-4)*.014,(i-4)*.2,.026);k.p('chest','oct',i==4?'g':'c',i==4?gl:salt,p[0],p[1],p[2],.012)}})})();
