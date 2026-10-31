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

// ---- refine pass (owner, Oct 31 2026: every regular enemy up to the approved Amalgam's standard) ----
// "Arms and legs barely connected": every body now uses the seated-limb cage (n:16 columns, sock: a shoulder socket as tall as
// the arm is thick, j2: arms and thighs grow out of the socket and the hip ring). Fewer rings where they don't shape the outline
// (8 head rings, no straight-taper limb rings). Detail is paint: baked creases and height light (cgShade) and colour that flows
// corner to corner (vcol) instead of per-face patches. Kit stuck on the skin takes the skin's own weights there (cr_WS). Clean
// hands: the arm swells into the hand itself; open and clawed hands get rounded tapering finger lofts in the hand's colour, closed
// fists one rounded mitten mass with painted finger lines and a thumb (cr_mitten). None of these seven
// is a man, so each outline is pushed toward what it is (proportions, stature, posture, stance).
const cr_H8=CG181.base.head.filter((q,i)=>i%2==0);
const cr_LEG=CG181.base.leg.filter((q,i)=>i!=2&&i!=6);
// the jaw corners on an 8-ring head (c9_JAW was for the 15-ring one)
const cr_JAW8=(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a);return (i>=1&&i<=2&&sa>-.2&&Math.abs(ca)>.5)?.012:0};
// a head whose lowest rings flare out into the shoulders (no neck): a = how far, pw = how quickly it settles to the head
function cr_flare(L,a,pw){return L.map((q,i)=>{const f=1+a*Math.pow(1-i/(L.length-1),pw||2);return [q[0],q[1]*f,q[2]*f,q[3]*f,q[4]]})}
// a squarer torso: the ring corners pushed out (blocky golems)
const cr_box=amt=>(i,j,a)=>i>=2?amt*Math.pow(Math.abs(Math.sin(2*a)),1.5)*(i>=4?1.25:1):0;
// the kit part just added takes the skin's weights at p (it moves with the skin there, never floats off a bending joint)
function cr_WS(k,M,p){k.P[k.P.length-1].w=cgWAt(M,p);return k}
// fill round the base of a sunk head, so the shoulders flow up into it with no groove (the Amalgam's fix): a round the sides, b behind
function cr_fill(M,S,a,b){const T=S.torso,hb=S.hp(0,1.58,0)[1],t7=T[T.length-1][0];
  cgSculpt(M,{neck:1,head:1,torso:1},(x,y,z,n)=>a*cgG(0,y,0,(t7+hb)/2,1,(hb-t7)*.75+.02)*Math.max(0,1-Math.abs(n[1])*1.2)+(n[2]<0?b*cgG(0,y,0,hb,1,.07)*Math.min(1,-n[2]*2):0))}
// a v113 creature's stance (its N3 definition), set from here
function cr_stance(key,st){try{if(N3.def[key])N3.def[key].stance=st}catch(e){}}
// distance from a surface point to the nearer wrist (fists / hands painted by it)
function cr_wrist(m,J){return Math.min(Math.hypot(m.x-J.aL2[0],m.y-J.aL2[1],m.z-J.aL2[2]),Math.hypot(m.x-J.aR2[0],m.y-J.aR2[1],m.z-J.aR2[2]))}
// clean fingers: rounded tapering lofts rooted inside the hand (the swollen end of the arm), curling toward the palm (curl 0
// straight … 1 closed), spread across the knuckles; nail = a claw colour (the last segment tapers to a point), thumb = one more
function cr_fingers(B,S,s,o){const F=b7_Arm(S,s),A=F.A,W=[[A+'2',1]],n=o.n==null?3:o.n,sp=o.spread||.03,cu=o.curl==null?.5:o.curl,at=o.at||.07,h=add3(F.a2,mul3(F.d,at)),N=3;
  const one=(b,d0,len,r)=>{const pts=[b];let p=b;for(let j=1;j<=N+(o.nail?1:0);j++){const th=cu*1.5*Math.min(1,j/N),dd=nrm3(add3(mul3(d0,Math.cos(th)),mul3(F.u,-Math.sin(th))));p=add3(p,mul3(dd,j>N?len*(o.claw||.4):len/N));pts.push(p)}
    const rr=[r,r*.94,r*.8,r*.62,r*.1],fl=o.flat||1;mdLoft(B,pts.map((q,j)=>({p:q,rx:rr[j],f:rr[j]*fl,b:rr[j]*fl,w:W})),{seg:o.seg||5,ref:F.u,capB:!o.nail,col:m=>o.nail&&m.i>N?o.nail:o.col})};
  for(let f=0;f<n;f++){const c=n==1?0:f/(n-1)*2-1;one(add3(h,mul3(F.f,c*sp)),nrm3(add3(F.d,mul3(F.f,c*(o.fan==null?.22:o.fan)))),(o.len||.1)*(1-Math.abs(c)*(o.short==null?.12:o.short)),o.r||.02)}
  if(o.thumb)one(add3(add3(F.a2,mul3(F.d,at*.45)),mul3(F.f,sp*.7)),nrm3(add3(add3(mul3(F.d,.5),mul3(F.f,.75)),mul3(F.u,-.3))),(o.len||.1)*.62,(o.r||.02)*1.05)}
// a closed fist as ONE rounded mitten mass curling round the grip (separate curled finger lofts read as stacked rolls up close):
// a rounded-box section across the knuckles, a slightly bumpy knuckle ridge, the n finger separations painted as thin dark lines
// (colour per corner), the tip closed; the thumb is added on its own (cr_fingers n:0, thumb:1)
function cr_mitten(B,S,s,o){const F=b7_Arm(S,s),W=mdW(B,[[F.A+'2',1]]),n=o.n||4,w=o.w||.04,th=o.th||.016,L=o.len||.09,cu=o.curl==null?1:o.curl,N=5,
    C=new THREE.Color(),rgb=hx=>{C.setHex(mdC(hx));return [C.r,C.g,C.b]},base=rgb(o.col),line=rgb(o.line==null?mdSh(o.col,.4):o.line),xs=[];
  for(let i=0;i<=2*n;i++)xs.push(1-i/n);const XS=xs.map((x,i)=>[x,1,i]).concat(xs.slice(1,-1).reverse().map((x,i)=>[x,-1,2*n-1-i])),M=XS.length,rows=[];
  let p=add3(F.a2,mul3(F.d,o.at||.05)),last=null;
  for(let j=0;j<=N;j++){const t=j/N,a=cu*1.5*t,dd=nrm3(add3(mul3(F.d,Math.cos(a)),mul3(F.u,-Math.sin(a)))),U=nrm3(add3(mul3(F.u,Math.cos(a)),mul3(F.d,Math.sin(a)))),X=nrm3(cross3(U,dd));
    if(j)p=add3(p,mul3(dd,L/N));last={p,dd};const ww=w*(1-.1*t)*(j?1:.92),tt=th*(1-.15*t)*(j?1:.92);
    rows.push(XS.map(([x,sg,i])=>{let y=Math.pow(Math.max(0,1-Math.pow(Math.abs(x),4)),.25)*tt*sg;if(j==1&&sg>0)y+=.0045*(Math.cos(x*Math.PI*n+(n%2?0:Math.PI))+1)/2;
      const q=add3(add3(p,mul3(X,x*ww)),mul3(U,y)),ln=j>0&&i%2==0&&i>0&&i<2*n;return {x:q[0],y:q[1],z:q[2],w:W,rgb:ln?line:base}}))}
  for(let j=0;j<N;j++)for(let k=0;k<M;k++){const a=rows[j][k],a1=rows[j][(k+1)%M],b2=rows[j+1][k],b3=rows[j+1][(k+1)%M];mdTri(B,'c',a,a1,b2,0);mdTri(B,'c',b2,a1,b3,0)}
  const e=add3(last.p,mul3(last.dd,th*.5)),cv={x:e[0],y:e[1],z:e[2],w:W,rgb:base},R=rows[N];for(let k=0;k<M;k++)mdTri(B,'c',cv,R[k],R[(k+1)%M],0)}
// clean toes: short rounded lofts out of the front of the foot, optional claws
function cr_toes(B,S,s,o){const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,Wd=S.foot.w,W=[[l,1]],n=o.n||3;
  for(let i=0;i<n;i++){const c=n==1?0:i/(n-1)*2-1,x=A[0]+c*(o.spread||.028)*Wd,z0=A[2]+.11*L,r=(o.r||.016)*Wd,len=(o.len||.07)*(1-Math.abs(c)*.15);
    const R=[{p:[x,.024,z0],rx:r,f:r*.8,b:r*.8,w:W},{p:[x+c*.008,.018,z0+len*.6],rx:r*.9,f:r*.7,b:r*.7,w:W},{p:[x+c*.012,.012,z0+len],rx:r*.7,f:r*.55,b:r*.55,w:W}];
    if(o.nail)R.push({p:[x+c*.014,.003,z0+len+(o.claw||.03)],rx:r*.1,f:r*.1,b:r*.1,w:W});mdLoft(B,R,{seg:5,ref:[0,1,0],capB:!o.nail,col:m=>o.nail&&m.i>2?o.nail:o.col})}}
// cgHuman with the neck kept above the shoulders: a sunk head (negative neckL) under a tall shoulder socket (sock) would run the
// neck rings downward from the trapezius ring and fold a groove round the base of the head; here the neck is raised just enough
// to start gap above the trapezius ring, so the shoulders always flow up into the head
function cr_human(o,gap){const S0=cgHuman(o),t7=S0.torso[S0.torso.length-1][0],need=t7+(gap==null?.025:gap)-S0.nb;if(need>0)o=Object.assign({},o,{neckL:(o.neckL||0)+need});return need>0?cgHuman(o):S0}
// arm ring lists (× the body's at): a golem's arm (forearm thicker than the upper arm, swelling into a huge fist), a clawed
// hand (the end flattens into a palm), a root arm, an insect's thin arm, a wendigo's long bony arm
const cr_GARM=[{t:.06,r:.05,o:.012},{t:.32,r:.044},{t:.95,r:.036,rb:.04},{t:1.3,r:.042,o:.006},{t:1.75,r:.037},{t:2.0,r:.03},{t:2.16,r:.042,rf:.046,rb:.044},{t:2.36,r:.046,rf:.05,rb:.046},{t:2.54,r:.036,rf:.038,rb:.036}];
const cr_CARM=[{t:.06,r:.05,o:.012},{t:.32,r:.042},{t:.95,r:.034,rb:.04},{t:1.25,r:.037},{t:1.94,r:.025,rf:.027},{t:2.14,r:.019,rf:.033,rb:.029},{t:2.34,r:.016,rf:.03,rb:.026}];
const cr_RARM=[{t:.06,r:.05,o:.012},{t:.32,r:.044},{t:.95,r:.036,rb:.04},{t:1.3,r:.04,o:.006},{t:1.94,r:.029},{t:2.14,r:.028,rf:.035,rb:.032},{t:2.32,r:.024,rf:.031,rb:.028}];
const cr_KARM=[{t:.06,r:.05,o:.012},{t:.32,r:.04},{t:.95,r:.034,rb:.038},{t:1.25,r:.036},{t:1.94,r:.024},{t:2.14,r:.02,rf:.028,rb:.024},{t:2.3,r:.016,rf:.022,rb:.02}];
const cr_WARM=[{t:.06,r:.05,o:.012},{t:.32,r:.038},{t:.88,r:.03},{t:1.02,r:.037,rb:.042},{t:1.25,r:.031},{t:1.94,r:.02},{t:2.12,r:.016,rf:.03,rb:.026},{t:2.3,r:.013,rf:.026,rb:.022}];

// ---------------- Sand Elemental: a chunky golem of packed golden sand and rock plates, glowing seams, a blazing chest gem,
// boulder shoulders, rock fists, a girdle of stones with shards hanging round the hips, a crown of jagged rock ----------------
// (refine) a hulking figure, not a man: massive shoulders and a deep chest over a narrower waist and short column legs, the small
// head sunk into the shoulders (no neck), forearms thicker than the upper arms swelling into huge rock fists with three stubby
// fingers; packed sand flows from gold to darker sand, rock showing through, a warm glow round the core
(function(){const S=cr_human({h:.9,w:1.3,d:1.2,rw:[.95,1.0,.9,1.12,1.4,1.52,1.66,1.25],rf:[1,1.02,.98,1.2,1.36,1.3,1.3,1.65],rb:[1,1.05,1,1.22,1.42,1.5,1.55,1.3],
    at:2.05,lt:1.7,armL:1.2,legL:.8,hs:1.0,hw:1.16,hy:.88,hd:1.1,nw:2.1,neckL:-.04,foot:1.1,footW:1.4,facePush:cr_JAW8,n:16,sock:1,j2:1,footLite:1,
    head:cr_flare(cr_H8,.75),arm:cr_GARM,leg:cr_LEG},0.025),
    s1=0xc8a060,s2=0xa8844a,s3=0xd8b878,rk=0x8a6a3a,gl=0xffa030,T=S.torso,J=S.J;
  cg181Reg('selem',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p),ch=J.chest[1],ty=f=>T[2][0]+(T[6][0]-T[2][0])*f;
    // boulder-sized lumps with a finer grain of packed sand on top
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1,hand:1,foot:1},(x,y,z,n)=>.034*(n3Sn(x*.8,y*.8,z*.8,4,4)-.45)+.014*(n3Sn(x,y,z,10,4)-.45));
    cr_fill(M,S,.015,.03);cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.35,jaw:1.3,brow:1.5})));
    M.shade=cgShade(M,{cav:1.2,y0:0,y1:T[7][0]+.15,hk:.3});
    const gy=ty(.66),gem=cgSurf(M,S,gy,0,-.02);
    // packed sand: gold blending into darker sand (darker on the back), paler toward the shoulders, rock showing through, rock
    // fists, a warm glow on the sand round the core
    const sand=m=>{const n=n3Sn(m.x,m.y,m.z,7,6),n2=n3Sn(m.x,m.y,m.z,3,2),up=c9_cl((m.y-ch+.1)/.35);
      let c=mdMix(s1,s2,c9_cl(.45+(n2-.5)*1.4+(m.s<-.3?.2:0)));c=mdMix(c,s3,c9_cl(up*.6+(m.part=='head'?.25:0))*c9_cl((n-.3)*2.2));
      c=mdMix(c,rk,Math.max(c9_cl((n-.66)*3.2)*.75,c9_cl((.17-cr_wrist(m,J))/.08)*.6));
      const d=Math.hypot(m.x-gem[0],m.y-gem[1],m.z-gem[2]);return mdMix(c,0xf09a3a,.5*Math.exp(-d*d/.01))};
    cgEmit(B,M,()=>null,{vcol:sand});
    cgEyes(k,M,S,gl,.04,1.628,1.25,-.004);
    // rock plates on the chest, back and flanks, glowing cracks between them
    [[.86,-.62,.09,.075],[.86,.62,.09,.075],[.56,-.84,.075,.065],[.56,.84,.075,.065],[.84,Math.PI,.1,.085],[.55,Math.PI-.6,.08,.07],[.55,Math.PI+.6,.08,.07],[.24,Math.PI,.085,.06]]
      .forEach(([f,a,sx,sy],i)=>{const y=ty(f),p=cgSurf(M,S,y,a,-.016);k.p(cgSurfBn(S,y),'dod','c',i%2?rk:mdSh(rk,.86),p[0],p[1],p[2],sx,sy,.045,0,a,0);WS(p)});
    [[[.62,-.3],[.5,-.38],[.4,-.28],[.28,-.18]],[[.62,.3],[.48,.36],[.38,.26],[.24,.2]],[[.7,Math.PI-.25],[.56,Math.PI-.1],[.42,Math.PI-.22],[.3,Math.PI-.08]],[[.66,Math.PI+.3],[.5,Math.PI+.22],[.36,Math.PI+.34]],[[.42,-1.15],[.3,-1.05],[.2,-1.2]],[[.42,1.15],[.3,1.05],[.2,1.2]]]
      .forEach(L=>c9_crack(k,M,S,L.map(([f,a])=>[ty(f),a]),gl,.0065));
    // the blazing gem in the chest, set in a socket of dark rock, cracks running out from it
    k.p('chest','oct','g',gl,gem[0],gem[1],gem[2]+.004,.085,.105,.055);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,q=cgRay(M,[gem[0]+Math.cos(a)*.1,gem[1]+Math.sin(a)*.11,.9],[0,0,-1],{torso:1});if(q){k.p('chest','dod','c',i%2?rk:mdSh(rk,.75),q[0],q[1],q[2]-.014,.045,.038,.032,0,0,a);WS(q)}}
    c9_crack(k,M,S,[[gy+.11,.0],[gy+.17,.12],[ty(.98),.05]],gl,.006);
    // boulders on the shoulders
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A],p=cgRay(M,[a[0]+s*.02,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;
      k.p(A,'dod','c',s2,p[0]+s*.012,p[1]+.004,p[2],.13,.1,.12,.3,0,s*.4);WS(p);k.p(A,'dod','c',rk,p[0]+s*.06,p[1]-.03,p[2]-.06,.075,.06,.065,.5,.4,0);WS(p)});
    // rock armour down the arms; the fists: a rock plate over the knuckles with glowing cracks, three stubby rock fingers and a thumb
    [-1,1].forEach(s=>{[[.45,.2],[1.3,.5],[1.72,-.4]].forEach(([t,an],i)=>{const q=c9_arm(M,J,s,t,an,-.02);k.p(q.bn,'dod','c',t>1?rk:mdSh(rk,.9),q.p[0],q.p[1],q.p[2],.065,.055,.06,t,t,0);WS(q.p)});
      const F=b7_Arm(S,s),fc=add3(F.a2,mul3(F.d,.09)),kp=cgRay(M,add3(fc,mul3(F.u,.4)),mul3(F.u,-1),{arm:1,hand:1});
      if(kp){const c=sub3(kp,mul3(F.u,.016));k.p(F.A+'2','dod','c',mdSh(rk,.9),c[0],c[1],c[2],.07,.05,.075,.3,.2,0);WS(kp)}
      [[-.03,.035],[.03,.02]].forEach(([a,b])=>{const q1=cgRay(M,add3(add3(fc,mul3(F.d,a)),mul3(F.f,.4)),mul3(F.f,-1),{arm:1,hand:1}),q2=cgRay(M,add3(add3(fc,mul3(F.d,b)),add3(mul3(F.f,.4),mul3(F.u,.06))),mul3(F.f,-1),{arm:1,hand:1});
        if(q1&&q2)c9_keep(k.L(F.A+'2','g',gl,add3(q1,mul3(F.f,.002)),add3(q2,mul3(F.f,.002)),.006,.005,4))});
      cr_mitten(B,S,s,{n:3,w:.075,th:.03,len:.11,curl:.85,col:mdSh(rk,1.05),at:.07});cr_fingers(B,S,s,{n:0,len:.11,r:.034,curl:.8,spread:.05,col:mdSh(rk,1.05),thumb:1,at:.075})});
    // a girdle of stones grown into the hips, shards of stone hanging from it
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2,p=cgSurf(M,S,T[1][0]+.03+Math.sin(a*3)*.012,a,-.014);k.p('pelvis','dod','c',i%3?s2:rk,p[0],p[1],p[2],.058+(i%3)*.012);WS(p)}
    for(let i=0;i<6;i++){const a=(i+.5)/6*Math.PI*2,y=T[1][0]-.01,r=cgSurf(M,S,y,a,-.03),d=[Math.sin(a)*.16,-1,Math.cos(a)*.16],L=.22+a181H(i,7)*.08;
      k.L('pelvis','c',i%2?s2:rk,r,add3(r,mul3(nrm3(d),L)),.05,.006,4);WS(r)}
    // a crown of jagged rock rising out of the top of the head
    for(let i=0;i<4;i++){const x=(i-1.5)*.045,p=b7_Top(M,S,x,-.01);if(p)c9_along(k,'head','cone4','c',i%2?rk:s3,sub3(p,[0,.025,0]),[x*3,1,-.15],.13-Math.abs(i-1.5)*.025,.03)}
    [-1,1].forEach(s=>cr_toes(B,S,s,{n:3,col:s2,r:.022,len:.06,spread:.034}))})})();
ST179.selem={sx:.2,hx:-.22,lk:.2,rk:.2,az:.22,lz:-.22,ax:-.08,lx:-.08,ex:-.25,le:-.25};

// ---------------- Salt Golem: a hulking block of grey-pink salt, crystal spires from the shoulders and back, crystal-studded fists,
// a molten core cracked open in the chest ringed by five glowing shards, a dark visor with burning eye slits ----------------
// (refine) a blocky crystalline giant: a squared, top-heavy torso, the visored head sunk between the shoulders, short thick legs,
// arms hanging low to huge blocky fists; salt crust whitens the tops, the core warms the salt round it
(function(){const S=cr_human({h:.94,w:1.5,d:1.32,rw:[1.12,1.16,1.12,1.3,1.56,1.7,1.85,1.35],rf:[1.1,1.15,1.38,1.36,1.46,1.4,1.38,1.5],rb:[1.1,1.18,1.3,1.38,1.5,1.6,1.65,1.35],push:cr_box(.022),
    at:2.3,lt:2.05,hs:.94,hw:1.16,hy:.84,hd:1.1,nw:2.05,neckL:-.06,armL:1.24,legL:.74,foot:1.25,footW:1.7,facePush:cr_JAW8,n:16,sock:1,j2:1,footLite:1,
    head:cr_flare(cr_H8,.85),arm:cr_GARM,leg:cr_LEG},0.025),
    C9=c9_SG,sa=c9_SG.salt,sa2=c9_SG.salt2,pink=c9_SG.pink,cry=c9_SG.cry,cry2=c9_SG.cry2,core=c9_SG.core,T=S.torso,J=S.J;
  cg181Reg('saltgolem',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p);
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1,hand:1,foot:1},(x,y,z,n)=>.03*(n3Sn(x*.9,y*.9,z*.9,4,7)-.45)+.02*(n3Sn(x,y,z,8,7)-.45));
    cr_fill(M,S,.015,.03);cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.25,jaw:.5,brow:1.5})));
    const cy=J.chest[1]+.02,ey=S.hp(0,1.628,0)[1];cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]<.3?0:-.05*cgG(x,y,0,cy,.06,.06));   // a cavity in the chest for the core
    M.shade=cgShade(M,{cav:.85,y0:0,y1:T[7][0]+.15,hk:.3});
    const cc=cgSurf(M,S,cy,0,-.03);
    const salt=m=>{const n=n3Sn(m.x,m.y,m.z,6,8),n2=n3Sn(m.x,m.y,m.z,13,3),b=mdMix(sa,pink,.18+.3*c9_cl((n2-.45)*2));let c=mdMix(b,sa2,c9_cl((.44-n)*2.6+(m.s<-.3?.2:0)));
      c=mdMix(c,cry,c9_cl((m.ny-.5)*2.2)*.4);c=mdMix(c,sa2,c9_cl((.17-cr_wrist(m,J))/.08)*.45);
      const d=Math.hypot(m.x-cc[0],m.y-cc[1],m.z-cc[2]);return mdMix(c,0xe07a52,.55*Math.exp(-d*d/.008))};
    // the visor band and the core's cavity stay crisp; the salt flows
    cgEmit(B,M,m=>{if(m.part=='torso'&&m.s>.6&&Math.hypot(m.x,m.y-cy)<.05)return 0x2a1a14;if(m.part=='head'&&m.s>.35&&Math.abs(m.y-ey)<.02*S.hs)return 0x3a2a28;return null},{vcol:salt});
    [-1,1].forEach(s=>{const q=S.hp(s*.036,1.628,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(p)k.p('head','box','g',core,p[0],p[1],p[2]-.003,.032*S.hs,.011,.01,0,s*.25,0)});
    // the core: a molten heart in the cavity, five glowing shards round it
    k.p('chest','ico','g',core,cc[0],cc[1],cc[2],.052);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.PI/2,x=Math.cos(a)*.06,y=cy+Math.sin(a)*.06,p=cgRay(M,[x,y,.9],[0,0,-1],{torso:1});if(p){k.p('chest','oct','g',i%2?core:C9.glow,p[0],p[1],p[2]-.006,.018,.05,.016,0,0,a-Math.PI/2);WS(p)}}
    // crystal clusters through the back and shoulders
    const clu=(y,a,n,sz)=>{const p=cgSurf(M,S,y,a,-.016),bn=cgSurfBn(S,y);for(let j=0;j<n;j++){const tl=(a181H(j,y*20,a)-.5)*.9,tl2=(a181H(j,a*7)-.5)*.9;k.p(bn,'oct','c',j%2?cry:cry2,p[0],p[1]+.01,p[2],sz*.45,sz*(1.2+j*.25),sz*.45,tl+Math.cos(a)*-.5,0,tl2+Math.sin(a)*.5);WS(p)}};
    [[T[6][0]-.02,Math.PI*.85,4,.1],[T[6][0]-.02,-Math.PI*.85,4,.1],[J.chest[1],Math.PI,5,.11],[J.spine[1]+.05,Math.PI*.9,3,.08],[J.spine[1],-Math.PI*.8,3,.07],[T[6][0],2.1,3,.07],[T[6][0],-2.1,3,.07],[T[1][0]+.03,1.6,3,.055],[T[1][0]+.03,-1.6,3,.055]].forEach(q=>clu(...q));
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];for(let j=0;j<4;j++){const x=a[0]+s*(j*.025-.01),z=a[2]-.04+j*.03,b=cgRay(M,[x,a[1]+.6,z],[0,-1,0],{arm:1,torso:1}),t=.3+j*.2;if(!b||b[1]<a[1]-.04)continue;   /* only on the top of the shoulder */
        c9_along(k,A+'0','oct','c',j%2?cry:cry2,sub3(b,[0,.08,0]),[s*Math.sin(t),Math.cos(t),-.2],.37-j*.04,.045);WS(b)}
      for(let j=0;j<2;j++){const q=c9_arm(M,J,s,1.05+j*.16,-.6,-.045);k.p(A+'1','oct','c',cry,q.p[0],q.p[1],q.p[2],.026,.09,.026,-.4,0,-s*.6);WS(q.p)}
      // the fists: blocks of salt (the arm's own end) with crystal spikes over the knuckles, three thick fingers and a thumb curled in
      const F=b7_Arm(S,s),fc=add3(F.a2,mul3(F.d,.09));
      for(let f=0;f<3;f++){const o=add3(fc,mul3(F.f,(f-1)*.05)),b=cgRay(M,add3(o,mul3(F.u,.4)),mul3(F.u,-1),{arm:1,hand:1});if(b){c9_along(k,A+'2','oct','c',f==1?cry:cry2,sub3(b,mul3(F.u,.05)),add3(mul3(F.u,.85),mul3(F.d,.45)),.15-(f==1?0:.025),.024);WS(b)}}
      cr_mitten(B,S,s,{n:3,w:.085,th:.034,len:.12,curl:.9,col:sa2,at:.075});cr_fingers(B,S,s,{n:0,len:.12,r:.036,curl:.85,spread:.055,col:sa2,thumb:1,at:.08})});
    for(let i=0;i<3;i++){const p=b7_Top(M,S,(i-1)*.04,-.02);if(p)c9_along(k,'head','oct','c',cry,sub3(p,[0,.03,0]),[(i-1)*.4,1,-.3],.13,.02)}
    [-1,1].forEach(s=>cr_toes(B,S,s,{n:3,col:sa2,r:.022,len:.055,spread:.036}))})})();
cr_stance('saltgolem',{sx:.2,hx:-.2,lk:.16,rk:.16,az:.24,lz:-.24,ax:-.06,lx:-.06,ex:-.2,le:-.2});

// ---------------- Rampart Gargoyle: a crouched stone demon — great spiky bat wings on four finger bones, curled ram horns, a
// fanged snout under a heavy brow, red burning eyes, moss in the cracks, a curling tail with a spade ----------------
// (refine) a beast, not a man: a deep chest over a thin waist, hunched; digitigrade legs (the knee forward, the hock raised and set
// back, the foot a long paw standing on three clawed toes, a spur on the hock); bigger wings; long arms ending in clawed hands
(function(){const S=cr_human({h:.8,w:1.22,d:1.18,rw:[.88,.92,.74,1.0,1.3,1.38,1.48,1.12],rf:[1,1,.86,1.12,1.32,1.28,1.22,1.3],rb:[1,1,.9,1.1,1.36,1.42,1.42,1.1],
    at:1.65,lt:1.6,hs:1.12,hw:1.08,hd:1.12,nw:1.75,neckL:-.02,armL:1.3,foot:1.1,footW:1.25,facePush:cr_JAW8,n:16,sock:1,j2:1,footLite:1,head:cr_flare(cr_H8,.35),arm:cr_CARM,
    leg:[{t:.12,r:.082},{t:.45,r:.074,rf:.08},{t:1.0,r:.05,rf:.058},{t:1.25,r:.05,rb:.06},{t:1.7,r:.04},{t:2.0,r:.036}]},0.03),
    st=c9_GG.st,st2=c9_GG.st2,dk=c9_GG.dark,moss=c9_GG.moss,T=S.torso,J=S.J;
  // the digitigrade leg: knee forward, hock up and back (the skeleton's rest joints move with it)
  ['lh','rh'].forEach(L=>{const h0=J[L+'0'];J[L+'1']=[h0[0]*1.06,h0[1]*.56,.085];J[L+'2']=[h0[0]*1.1,.19,-.075]});
  cg181Reg('gargoyle',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p);
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1,hand:1},(x,y,z,n)=>.016*(n3Sn(x,y,z,5,9)-.45)+.01*(n3Sn(x,y,z,12,9)-.45));
    cgSculpt(M,{head:1},S.sculpt(c9_face({nose:.8,jaw:1.6,brow:1.6,snout:.026})));
    M.shade=cgShade(M,{cav:1.3,y0:0,y1:T[7][0]+.2,hk:.28});
    const my=S.hp(0,1.553,0)[1];
    // weathered stone, moss where the rain runs down (fronts and tops), dark cracks
    const stone=m=>{const n=n3Sn(m.x,m.y,m.z,8,3),n2=n3Sn(m.x,m.y,m.z,17,11);let c=mdMix(st,st2,c9_cl((.48-n)*2.6+(m.s<-.3?.15:0)));c=mdMix(c,dk,c9_cl((n2-.8)*4)*.6);
      return mdMix(c,moss,(m.ny>.2||m.s>.1?1:.4)*c9_cl((n-.52)*3)*.8)};
    // the mouth line stays crisp; the default foot is replaced by the paw below
    cgEmit(B,M,m=>m.part=='head'&&m.s>.4&&Math.abs(m.y-my)<.005*S.hs&&Math.abs(m.x)<.045*S.hs?0x0a0a0c:null,{vcol:stone,keep:m=>m.part!='foot'});
    cgEyes(k,M,S,c9_GG.eye,.04,1.628,1.45,-.004);cgEars(k,M,S,st,1.64,.11,.5,.6,.024,st2);
    cgTeeth(k,M,S,[[-.03,1.556,.042,0],[.03,1.556,.042,0],[-.014,1.556,.02,0],[.014,1.556,.02,0],[-.036,1.551,.03,1],[.036,1.551,.03,1]],0xd8d0c0);
    // curled ram horns: six ridged turns out, back, down and forward
    [-1,1].forEach(s=>{const q=S.hp(s*.055,1.705,-.01);let p=add3(q,[-s*.02,-.012,0]),d=[s*.6,.5,-.6];const pts=[p];for(let i=0;i<6;i++){p=add3(p,mul3(d,.07*S.hs));pts.push(p);d=[d[0]-s*.15,d[1]-.35,d[2]+.25]}
      cgTube(B,pts,pts.map((_,i)=>(.05-i*.0068)*S.hs),pts.map(()=>[['head',1]]),m=>Math.round(m.i*2.2)%2?st2:dk,{seg:7,capB:true})});
    // the wings: an arm from each shoulder blade to a high wrist, four finger bones fanning from it, stone membranes between with a
    // scalloped trailing edge, a spike on every finger tip and a thumb claw
    [-1,1].forEach(s=>{const r=cgSurf(M,S,J.chest[1]+.05,Math.PI-s*.45,-.035),e=add3(r,[s*.29,.24,-.16]),w=add3(e,[s*.3,.07,-.06]),W=[['chest',1]],
        tips=[add3(w,[s*.22,.15,-.04]),add3(w,[s*.44,-.1,-.06]),add3(w,[s*.39,-.48,-.06]),add3(w,[s*.19,-.8,-.04])],bp=cgSurf(M,S,J.spine[1]-.03,Math.PI-s*.5,-.02);
      cgTube(B,[r,lerp3(r,e,.5),e,lerp3(e,w,.5),w],[.046,.04,.034,.03,.027],[W,W,W,W,W],st2,{seg:6});
      tips.forEach((t,i)=>{cgTube(B,[w,lerp3(w,t,.5),t],[.021,.015,.007],[W,W,W],st2,{seg:5});c9_along(k,'chest','cone4','c',dk,t,sub3(t,w),.08-(i==0?0:.012),.012)});
      c9_along(k,'chest','cone4','c',dk,w,[s*.1,.5,.6],.09,.015);c9_along(k,'chest','cone4','c',dk,e,[s*.2,.3,-.5],.07,.013);
      const mw=mdW(B,W),V=p=>({x:p[0],y:p[1],z:p[2],w:mw}),tri=(a,b,c,col)=>{const cc=mdC(col);mdTri(B,'c',V(a),V(b),V(c),cc);mdTri(B,'c',V(c),V(b),V(a),cc)},
        scal=(a,b,c,f)=>lerp3(lerp3(a,b,.5),c,f);
      tri(r,e,w,st2);
      for(let i=0;i<3;i++){const m=scal(tips[i],tips[i+1],w,.28);tri(w,tips[i],m,i%2?dk:mdMix(dk,st2,.4));tri(w,m,tips[i+1],i%2?dk:mdMix(dk,st2,.4))}
      const m3=scal(tips[3],bp,r,.25);tri(r,w,tips[3],dk);tri(r,tips[3],m3,mdMix(dk,st2,.4));tri(r,m3,bp,mdMix(dk,st2,.4))});
    // a curling tail with a spade, spines down the back
    {const t0=cgSurf(M,S,J.pelvis[1]-.04,Math.PI,-.05),W=[['pelvis',1]],TT=[t0,add3(t0,[0,-.16,-.19]),add3(t0,[.05,-.32,-.32]),add3(t0,[.14,-.42,-.4]),add3(t0,[.26,-.44,-.44]),add3(t0,[.34,-.38,-.46])];
      cgTube(B,TT,[.075,.055,.042,.03,.019,.008],TT.map(()=>W),st2,{seg:7,capB:true});const e=TT[5];k.p('pelvis','cone4','c',dk,e[0]+.02,e[1]+.02,e[2],.035,.09,.012,0,0,-1)}
    for(let i=0;i<7;i++){const y=T[6][0]+.02-i*.075,p=cgSurf(M,S,y,Math.PI,-.01);c9_along(k,cgSurfBn(S,y),'cone4','c',dk,p,[0,.45,-1],.085-i*.004,.02);WS(p)}
    // clawed hands: four long fingers and a thumb out of the flattened palm, black claws
    [-1,1].forEach(s=>cr_fingers(B,S,s,{n:4,len:.1,r:.0145,curl:.45,spread:.036,col:st2,nail:c9_GG.claw,thumb:1,at:.045,claw:.45}));
    // the paws: from inside the shin over the hock, down the long instep to the ball of the foot on the ground, three clawed toes,
    // a spur on the hock
    [-1,1].forEach(s=>{const l=s<0?'lh':'rh',K1=J[l+'1'],K2=J[l+'2'],lr=S.leg[S.leg.length-1].r,W2=[[l+'2',1]],ball=[K2[0]*1.03,.036,K2[2]+.21],mid=add3(lerp3(K2,ball,.5),[0,.012,0]);
      mdLoft(B,[{p:lerp3(K1,K2,.7),rx:lr*.92,f:lr*.92,b:lr*.92,w:[[l+'1',1]]},{p:K2,rx:lr*1.1,f:lr*1.1,b:lr*1.2,w:W2},{p:mid,rx:lr*.85,f:lr*.8,b:lr*.8,w:W2},{p:ball,rx:lr*1.25,f:.036,b:.036,w:W2}],{seg:7,ref:[0,0,1],capB:true,col:st2});
      [-1,0,1].forEach(c=>{const a=c*.38,b=add3(ball,[c*.028,-.004,.01]),dir=[Math.sin(a),0,Math.cos(a)],e=add3(b,[dir[0]*.075,-.018,dir[2]*.075]);
        mdLoft(B,[{p:b,rx:.022,f:.018,b:.018,w:W2},{p:lerp3(b,e,.6),rx:.019,f:.015,b:.015,w:W2},{p:e,rx:.014,f:.012,b:.012,w:W2},{p:add3(e,[dir[0]*.035,-.013,dir[2]*.035]),rx:.002,f:.002,b:.002,w:W2}],{seg:5,ref:[0,1,0],col:m=>m.i>2?c9_GG.claw:st2})});
      c9_along(k,l+'2','cone4','c',c9_GG.claw,add3(K2,[0,-.015,-.03]),[0,-.3,-1],.07,.016)})})})();
cr_stance('gargoyle',{sx:.34,hx:-.34,lk:.12,rk:.12,ax:-.3,lx:-.3,az:.15,lz:-.15,ex:-.6,le:-.6});

// ---------------- Lichen: a hulking body of soil and moss — a hollow face with eyes and a glowing mouth deep inside, a crown of
// roots, a mossy beard, a glowing goo heart in a cracked chest, green vines wound round it, a rock and lichen on the right shoulder,
// a mushroom shelf on the left, tendrils off the forearms, root-bundle feet ----------------
// (refine) a shambling mound, not a man: low and wide, a great mossy hump over the back (heavier on the left), the head a lump
// sunk forward into it with no neck, stumpy root legs, long uneven arms (the right one bigger and longer) ending in root claws
(function(){const HY=.8,HW=1.15,S=cr_human({h:.92,w:1.38,d:1.42,rw:[1.3,1.42,1.38,1.42,1.42,1.38,1.4,1.3],rf:[1.3,1.5,1.62,1.58,1.38,1.22,1.25,1.75],rb:[1.3,1.4,1.42,1.62,1.82,1.9,1.9,1.55],
    at:1.8,lt:2.05,legL:.62,armL:1.28,hs:1.0,hw:HW,hy:HY,hd:1.05,nw:2.5,neckL:-.08,foot:1.1,footW:1.5,facePush:()=>0,n:16,sock:1,j2:1,footLite:1,
    head:cr_flare(cr_H8,1.2),arm:cr_RARM,leg:cr_LEG},0.025),
    C9=c9_LI,soil=c9_LI.soil,soil2=c9_LI.soil2,moss=c9_LI.moss,moss2=c9_LI.moss2,goo=c9_LI.goo,T=S.torso,J=S.J;
  S.armK={'1':1.2,'-1':.88};[['aR',1.1],['aL',.94]].forEach(([A,f])=>{const a0=J[A+'0'];J[A+'1']=add3(a0,mul3(sub3(J[A+'1'],a0),f));J[A+'2']=add3(a0,mul3(sub3(J[A+'2'],a0),f))});
  cg181Reg('lichen',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p),ch=J.chest[1],sh=T[6][0];
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1},(x,y,z,n)=>.05*(n3Sn(x*.8,y*.8,z*.8,4.5,12)-.45)+.02*(n3Sn(x,y,z,9,12)-.45));
    // the hump of moss and soil over the back (heavier on the left), a sag of soil at the front of the hips
    cgSculpt(M,{torso:1,neck:1},(x,y,z,n)=>{let d=0;if(n[2]<-.1)d+=.14*cgG(x+.05,y,0,sh-.1,.2,.13)*Math.min(1,(-.1-n[2])*1.6);if(n[2]>0)d+=.04*cgG(x,y,0,T[1][0]+.04,.16,.07)*n[2];return d});
    cr_fill(M,S,.02,.04);
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.2)return 0;let d=.014*cgG(x,y,0,1.662,.06,.008)-.006*cgG(x,y,0,1.592,.03,.006)+.008*cgG(x,y,0,1.61,.012,.012);[-1,1].forEach(s=>d-=.016*cgG(x,y,s*.032,1.635,.018,.014));return d}));
    M.shade=cgShade(M,{cav:1.25,y0:0,y1:sh+.25,hk:.3});
    const fy=S.hp(0,1.62,0)[1],furSel=m=>(m.part=='torso'&&m.y>ch-.02&&m.s<-.25)||(m.part=='head'&&m.y>S.hp(0,1.69,0)[1]);
    // soil blending into moss (moss on the tops and the hump), pale lichen crusts on the hips and flanks, roots darker below
    const earth=m=>{const n=n3Sn(m.x,m.y,m.z,7,5),n2=n3Sn(m.x,m.y,m.z,15,9),n3=n3Sn(m.x,m.y,m.z,4,3);let c=mdMix(soil,soil2,c9_cl((.42-n)*3+(m.s<-.3?.15:0)));
      c=mdMix(c,mdMix(moss,moss2,c9_cl((n2-.5)*2.5)),c9_cl((n3-.42)*3+(m.ny>.3?.35:0)+(m.part=='head'&&m.y>fy+.03?.4:0))*.9);
      c=mdMix(c,C9.lich,c9_cl((n2-.8)*5)*(m.y<ch?.85:.4));if(m.part=='leg'||m.part=='foot')c=mdMix(c,C9.bark,.35);
      if(m.part=='neck'||(m.part=='torso'&&m.y>T[6][0]&&m.s<.3)||(m.part=='head'&&m.s<.3))c=mdMix(c,mdMix(moss,moss2,c9_cl((n2-.5)*2.5)),.75);return c};   // moss grows over the back of the head into the mantle (no bare collar)
    // the hollow face: sockets and the mouth deep black (crisp)
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.4){const bx=m.x/(S.hs*HW),by=(m.y-S.nb)/(S.hs*HY)+1.52;if(Math.hypot((Math.abs(bx)-.032)/.022,(by-1.635)/.017)<1||(Math.abs(bx)<.028&&Math.abs(by-1.592)<.007))return 0x0c0806}return null},{vcol:earth,keep:m=>m.part!='foot'});
    // eyes glowing deep in the hollow, a glowing slit of a mouth
    [-1,1].forEach(s=>{const q=S.hp(s*.032,1.635,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','sph','g',goo,p[0],p[1],p[2]+.002,.015,.012,.009)});
    {const q=S.hp(0,1.592,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)c9_keep(k.p('head','box','g',0x5ad82a,p[0],p[1],p[2]-.001,.042*S.hs,.008,.01))}
    // a mossy beard hanging from the chin and jaw
    {const by=S.hp(0,1.575,0)[1];for(let i=0;i<5;i++){const x=(i-2)*.02*S.hs,p=cgRay(M,[x,S.hp(0,1.548,0)[1],.6],[0,0,-1],{head:1});if(p)k.L('head','c',i%2?moss:moss2,add3(p,[0,.004,-.014]),add3(p,[x*.3,-.11-(i%3)*.035,.03]),.014,.003,4)}
      cgFur(B,M,m=>m.part=='head'&&m.s>-.1&&m.z>0&&m.y<by&&m.y>S.hp(0,1.525,0)[1],{off:.014,len:.13,col:moss,col2:moss2,seed:123,jag:.45,lump:[.5,1.2]})}
    // the moss mantle over the hump and the crown
    cgFur(B,M,furSel,{off:.026,len:.11,col:moss,col2:moss2,seed:121,jag:.55});
    // a crown of gnarled roots
    for(let i=0;i<6;i++){const an=-1.4+i*.56,t=b7_Top(M,S,Math.sin(an)*.07,-.04-Math.cos(an)*.02);if(!t)continue;let a=sub3(t,[0,.018,0]),d=[Math.sin(an)*.4,1,-.3];for(let j=0;j<3;j++){const b=add3(a,mul3(d,.055));k.L('head','c',C9.bark,a,b,.016-j*.004,.012-j*.003,4);a=b;d=[d[0]*1.3,d[1]-.3,d[2]-.2]}}
    // a mushroom shelf on the left shoulder, a rock crusted with lichen on the right
    for(let i=0;i<3;i++){const q=c9_arm(M,J,-1,.12+i*.2,-.35+i*.15,-.022);k.p('aL0','hem','c',i%2?C9.cap:C9.cap2,q.p[0],q.p[1],q.p[2],.08-i*.012,.028,.07,0,0,.25);WS(q.p)}
    {const a=J.aR0,p=cgRay(M,[a[0]+.02,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;k.p('aR0','dod','c',soil2,p[0]+.02,p[1]+.008,p[2],.09,.07,.085,.3,0,-.3);WS(p);
      for(let i=0;i<3;i++){k.p('aR0','dod','c',C9.lich,p[0]+.0+i*.026,p[1]+.065-Math.abs(i-1)*.012,p[2]-.03+i*.022,.026,.009,.026);WS(p)}}
    // green vines wound round the arms and legs and across the body
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';[[J[A+'0'],J[A+'1'],J[A+'2'],A,2.2],[J[L+'0'],J[L+'1'],J[L+'2'],L,1.6]].forEach(([p0,p1,p2,bp,turns])=>{const pts=[],W=[],r=bp[0]=='a'?.07:.1;
        for(let i=0;i<=12;i++){const t=.04+i/12*.9,c=t<.5?lerp3(p0,p1,t*2):lerp3(p1,p2,(t-.5)*2),an=t*turns*Math.PI*2,q=[c[0]+Math.cos(an)*.25*s,c[1],c[2]+Math.sin(an)*.25],h0=cgRay(M,q,nrm3(sub3(c,q)),{arm:1,leg:1}),hit=h0&&Math.sign(h0[0])==s&&Math.hypot(h0[0]-c[0],h0[2]-c[2])<.2?h0:null;
          const p=hit?add3(hit,mul3(nrm3(sub3(q,c)),.004)):[c[0]+Math.cos(an)*r*s,c[1],c[2]+Math.sin(an)*r];pts.push(p);W.push(cgWAt(M,p))}
        cgTube(B,pts,pts.map(()=>.014),W,bp[0]=='a'?C9.vine:C9.vine2,{seg:4})});
      // tendrils hanging off the forearms
      for(let i=0;i<2;i++){const q=c9_arm(M,J,s,1.25+i*.3,.4+i*.3,-.008);k.L(A+'1','c',i%2?C9.vine:moss,q.p,add3(q.p,[s*.03,-.18-i*.05,.02]),.014,.003,4);WS(q.p)}
      // root claws: three long gnarled fingers out of the knotted hand, darker tips
      cr_fingers(B,S,s,{n:3,len:.14,r:.022,curl:.3,spread:.04,col:C9.bark,nail:mdSh(C9.bark,.65),fan:.3,claw:.5,at:.065})});
    {const N=12;c9_vine(B,M,S,Array.from({length:N},(_,i)=>{const t=i/(N-1);return [T[1][0]+.03+(T[6][0]-.06-T[1][0])*t,-2.6+t*5.2]}),.016,C9.vine,.006,{seg:4});
      c9_vine(B,M,S,Array.from({length:9},(_,i)=>{const t=i/8;return [T[1][0]+.06+(ch-T[1][0])*t,2.4-t*4.2]}),.014,C9.vine2,.006,{seg:4})}
    // the glowing goo heart in the cracked chest, glowing cracks round it, goo seeping out of the body
    {const y=ch-.01,p=cgSurf(M,S,y,.18,-.02);k.p('chest','oct','g',goo,p[0],p[1],p[2]+.006,.065,.08,.048);
      [[[y+.05,.0],[y+.1,-.12],[y+.13,-.2]],[[y-.02,.38],[y+.04,.5],[y+.02,.62]],[[y-.06,.1],[y-.12,.04],[y-.18,.12]],[[y-.04,-.1],[y-.08,-.28],[y-.14,-.34]]].forEach(L=>c9_crack(k,M,S,L,0x6ae02a,.006))}
    for(let i=0;i<5;i++){const y=T[1][0]+.06+i*.07,an=-1.2+a181H(i,2,3)*2.4,p=cgSurf(M,S,y,an,-.006);k.p(cgSurfBn(S,y),'ico','g',goo,p[0],p[1],p[2],.014,.024,.011,0,an,0);WS(p)}
    // feet: the leg ends in a stump of root that spreads into a bundle of roots gripping the ground (instead of a foot)
    [-1,1].forEach(s=>{const l=s<0?'lh2':'rh2',F=J[l],W=[[l,1]],lr=S.leg[S.leg.length-1].r;
      mdLoft(B,[{p:[F[0],F[1]+.05,F[2]],rx:lr*.9,f:lr*.9,b:lr*.9,w:W},{p:[F[0],F[1]-.03,F[2]+.01],rx:lr*1.02,f:lr*1.05,b:lr,w:W},{p:[F[0],.022,F[2]+.02],rx:lr*1.12,f:lr*1.15,b:lr*1.05,w:W}],{seg:8,ref:[0,0,1],capB:true,col:C9.bark,wf:(x,y,z)=>cgWAt(M,[x,y,z])});
      for(let i=0;i<6;i++){const an=i<5?-1.15+i*.575:Math.PI,d=[Math.sin(an),0,Math.cos(an)],a=[F[0]+d[0]*lr*.5,.05,F[2]+.02+d[2]*lr*.5],b=add3(a,[d[0]*(lr+.04),-.03,d[2]*(lr+.04)]),e=add3(a,[d[0]*(lr+.11),-.046,d[2]*(lr+.11)]);
        cgTube(B,[a,b,e],[.03,.02,.005],[cgWAt(M,a),W,W],i%2?C9.bark:mdSh(C9.bark,.8),{seg:4})}})})})();
ST179.lichen={sx:.3,hx:-.26,lk:.22,rk:.22,az:.14,lz:-.06,ax:-.18,lx:-.02,ex:-.3,le:-.15};

// ---------------- Akidon: a lean insectoid in olive-black chitin — great faceted compound eyes, hooked mandibles dripping acid,
// antennae, mantis scythes on the forearms, ridge spikes and shoulder spikes, glowing acid sacs on the belly, a hanging
// ringed abdomen with a stinger, spurred knees ----------------
// (refine) an insect, not a man: a wasp waist between a rounded thorax and the hips, thin segmented limbs, a small wide head on a
// thin neck, deeply hunched with the scythes held up; the plates are paint (crisp seams, banded belly) except the wing cases,
// which stand off the back; the abdomen is one ringed loft
// an insect's head: narrow at the mandibles, widening to the eyes and the crown (an inverted triangle from the front)
const cr_IHEAD=cr_H8.map((q,i)=>{const f=[.62,.68,.76,.86,.96,1,1,1][i];return [q[0],q[1]*f,q[2]*(.8+.2*f),q[3]*(.85+.15*f),q[4]]});
(function(){const S=cgHuman({h:.9,w:.9,d:.9,rw:[.82,.8,.42,.62,1.1,1.16,1.16,.98],rf:[.85,.8,.42,.88,1.26,1.16,1.0,.85],rb:[.9,.85,.48,.8,1.26,1.26,1.18,.95],push:()=>0,
    at:.8,lt:.82,hs:.95,hw:1.12,hy:.92,hd:1.0,nw:.62,neckL:.035,armL:1.28,legL:1.1,foot:1.0,footW:.8,n:16,sock:1,j2:1,footLite:1,head:cr_IHEAD,facePush:()=>0,arm:cr_KARM,
    leg:[{t:.12,r:.07},{t:.45,r:.055},{t:1.0,r:.05},{t:1.25,r:.04},{t:1.7,r:.032},{t:2.0,r:.03}]}),c1=c9_AK.c1,c2=c9_AK.c2,c3=c9_AK.c3,ed=c9_AK.edge,acid=c9_AK.acid,acid2=c9_AK.acid2,bone=c9_AK.bone,T=S.torso,J=S.J;
  cg181Reg('akidon',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p);
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.018*cgG(x,y,0,1.645,.06,.01);[-1,1].forEach(s=>d+=.01*cgG(x,y,s*.03,1.6,.016,.02));return d}));
    M.shade=cgShade(M,{cav:1.3,y0:0,y1:T[7][0]+.2,hk:.25});
    const my=S.hp(0,1.556,0)[1],ky=[J.lh1[1],J.rh1[1]],ay=J.aR1[1];
    // chitin: dark olive, the plates' rims lighter (paint): seams at the segment joints, a seam down the thorax, a banded belly
    const chit=m=>{const n=n3Sn(m.x,m.y,m.z,9,3);let c=mdMix(m.s<-.3?c3:c1,c2,c9_cl((n-.4)*2)*.6);if(m.part=='head')c=mdMix(c2,ed,c9_cl((n-.6)*3)*.5);
      c=mdMix(c,ed,c9_cl((m.ny-.45)*2)*.35);return c};
    cgEmit(B,M,m=>{if(m.part=='head'&&m.s>.45&&Math.abs(m.y-my)<.006*S.hs&&Math.abs(m.x)<.03)return 0x050308;if(m.part=='hand')return c3;
      if(m.part=='torso'){if(Math.abs(m.x)<.008&&m.s>.3&&m.y>T[3][0])return c3;if(m.y<T[3][0]&&m.y>T[0][0]&&m.s>-.5)return Math.round(m.y*34)%2?c2:c3;if(Math.abs(m.y-T[3][0])<.012)return c3}
      if((m.part=='leg'&&Math.abs(m.y-ky[0])<.02)||(m.part=='arm'&&Math.abs(m.y-ay)<.018))return c3;return null},{vcol:chit});
    // the wing cases down the back (they stand off the body)
    const wc=v=>.04*Math.min(1,Math.max(.3,(v[1]-J.spine[1]+.06)/.2));
    cgShell(B,M,m=>(m.part=='torso'&&m.s<-.15&&m.y>J.spine[1]-.06)||(m.part=='neck'&&m.s<-.3),wc,m=>Math.abs(m.x)<.006?c3:mdMix(c2,c1,c9_cl((n3Sn(m.x,m.y,m.z,12,4)-.4)*2)),{rim:.15});
    // great compound eyes on the sides of the head: a dark rim and a glowing faceted dome
    [-1,1].forEach(s=>{const c=S.hp(0,1.632,0),d=nrm3([s*.75,.05,.66]),p=cgRay(M,add3(c,mul3(d,.4)),mul3(d,-1),{head:1});if(!p)return;
      k.p('head','sph','c',c3,p[0]-d[0]*.008,p[1],p[2]-d[2]*.008,.04,.052,.034,0,s*.85,0);k.p('head','dod','g',acid,p[0]+d[0]*.006,p[1]+.002,p[2]+d[2]*.006,.036,.048,.03,0,s*.85,0)});
    // hooked mandibles either side of the mouth, a drop of acid on each tip
    [-1,1].forEach(s=>{const q=S.hp(s*.04,1.556,0),p0=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(!p0)return;let a=add3(p0,[0,0,-.01]),d=[s*.25,-.25,1];
      for(let i=0;i<4;i++){const u=nrm3(d),b=add3(a,mul3(u,.03));k.L('head','c',i<2?c2:bone,a,b,.014*(1-i*.2),.014*(1-(i+1)*.2)+.003,4);a=b;d=[d[0]-s*.35,d[1]+.05,d[2]-.15]}
      k.p('head','oct','g',acid,a[0],a[1]-.012,a[2],.007,.014,.007)});
    // antennae with acid-lit tips
    [-1,1].forEach(s=>{const q=S.hp(s*.03,1.7,.02);let a=q,d=[s*.25,.6,.75];for(let i=0;i<5;i++){const b=add3(a,mul3(d,.05*S.hs));k.L('head','c',c2,a,b,.008,.006,3);a=b;d=[d[0]+s*.06,d[1]-.18,d[2]+.05]}k.p('head','oct','g',acid,a[0],a[1],a[2],.01,.01,.01)});
    // ridge spikes down the wing cases, shoulder plates with spikes
    for(let i=0;i<6;i++){const y=T[6][0]-.03-i*.065,o=wc([0,y,0]),p=cgSurf(M,S,y,Math.PI,o-.012);c9_keep(c9_along(k,cgSurfBn(S,y),'cone4','c',ed,p,[0,.5,-1],.085-i*.006,.016));WS(p)}
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A],p=cgRay(M,[a[0]+s*.025,a[1]+.6,a[2]],[0,-1,0],{arm:1,torso:1})||a;k.p(A,'hem','c',c2,p[0],p[1]-.03,p[2],.07,.05,.075,0,0,s*.4);WS(p);
      c9_along(k,A,'cone4','c',ed,add3(p,[s*.03,.0,-.01]),[s*.6,1,-.2],.085,.014);WS(p)});
    // glowing acid sacs down the belly
    [.2,.42,.64].forEach((f,i)=>{const y=T[1][0]+(J.chest[1]-T[1][0])*f,p=cgSurf(M,S,y,0,.004);k.p(cgSurfBn(S,y),'ico','g',acid2,p[0],p[1],p[2],.034-i*.005,.02,.012);WS(p)});
    // the hanging abdomen (gaster): one ringed loft from inside the hips, bulging segments with pinched joints, acid glowing in the
    // joints, a stinger at the end
    {const b0=cgSurf(M,S,J.pelvis[1]-.02,Math.PI,-.05),RR=[.07,.105,.088,.122,.1,.118,.094,.1,.078,.05,.016],W=[['pelvis',1]],pts=RR.map((r,i)=>{const t=i/(RR.length-1);return add3(b0,[0,-t*.3-t*t*.06,-t*.44])});
      mdLoft(B,pts.map((p,i)=>({p,rx:RR[i]*1.05,f:RR[i]*.92,b:RR[i],w:W})),{seg:8,ref:[0,1,0],capB:true,col:m=>{const i=Math.round(m.i);return i%2==0&&i>1&&i<9?c3:(m.s>.3?c2:c1)}});
      [2,4,6].forEach(i=>{const d=nrm3(sub3(pts[i+1],pts[i-1]));c9_keep(c9_along(k,'pelvis','ring','g',acid2,sub3(pts[i],mul3(d,.004)),d,.012,RR[i]*.98,RR[i]*.95))});
      const e=pts[RR.length-1];c9_along(k,'pelvis','cone4','c',ed,sub3(e,[0,0,.01]),[0,-.6,-1],.1,.02)}
    // mantis scythes on the forearms: dark chitin blades with pale cutting edges, curving forward and down past the hands
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a1=J[A+'1'],a2=J[A+'2'],ad=nrm3(sub3(a2,a1)),root=lerp3(a1,a2,.55),o=[s,0,0],hit=cgRay(M,add3(root,mul3(o,.3)),mul3(o,-1),{arm:1})||root,
        R=[];let p=add3(hit,[-s*.012,0,0]),d=add3(ad,[0,0,.12]);for(let i=0;i<7;i++){const t=i/6,w=.034*(1-t*.82)+.004;R.push({p:p.slice(),rx:.009*(1-t*.6)+.002,f:w,b:w*.55,w:[[A+'1',1]]});
        p=add3(p,mul3(nrm3(d),.075));const c=Math.cos(-.17),sn=Math.sin(-.17);d=[d[0],d[1]*c-d[2]*sn,d[1]*sn+d[2]*c]}
      mdLoft(B,R,{seg:6,ref:[0,0,1],capB:true,col:m=>m.s>.8?bone:m.s<-.5?c3:c2});
      // two hooked claws out of the narrow hand
      cr_fingers(B,S,s,{n:2,len:.075,r:.009,curl:.55,spread:.01,col:c3,nail:0x0a080c,claw:.5,at:.05});
      // a spurred knee
      const L=s<0?'lh':'rh',K=J[L+'1'],kp=cgRay(M,[K[0],K[1]+.01,K[2]+.4],[0,0,-1],{leg:1});if(kp){c9_along(k,L+'1','cone4','c',ed,add3(kp,[0,0,-.012]),[0,.7,1],.085,.017);WS(kp)}
      cr_toes(B,S,s,{n:2,col:c3,r:.016,len:.05,spread:.03,nail:bone,claw:.025})})})})();
cr_stance('akidon',{sx:.36,hx:-.32,lk:.2,rk:.2,dy:-.03,ax:-.35,lx:-.35,ex:-.7,le:-.7,az:.08,lz:-.08});

// ---------------- Gharial Reaver: a hulking crocodile-man — a big head with a long toothy snout and a nostril knob, scutes down
// the back, a pale plated belly, a long heavy tail, a hide harness, a necklace of teeth, a loincloth ----------------
// (refine) a crocodile, not a man in a mask: a thick neck that merges into the base of the skull, a barrel chest and heavy hips,
// stooped forward with the snout held level, a heavier tail rooted deep in the hips; the harness and belt are paint
const GHARIALHEAD=[[1.52,.066,.085,.062,.02],[1.536,.07,.15,.066,.03],[1.55,.07,.22,.07,.04],[1.562,.068,.28,.074,.05],[1.572,.066,.3,.076,.052],[1.582,.068,.28,.08,.05],
  [1.596,.074,.2,.086,.04],[1.61,.08,.14,.09,.03],[1.625,.082,.11,.092,.02],[1.64,.078,.09,.092,.012],[1.654,.066,.068,.08,.006],[1.664,.036,.036,.048,0]];
// (refine) 8 rings, the throat ring as wide as the neck so neck and head are one mass
const cr_GH8=[[1.52,.09,.1,.094,0],[1.55,.078,.22,.084,.03],[1.562,.07,.28,.078,.045],[1.572,.066,.3,.078,.05],[1.582,.068,.28,.082,.048],[1.61,.08,.15,.09,.03],[1.64,.078,.09,.092,.012],[1.664,.04,.04,.05,0]];
(function(){const S=cr_human({h:.9,w:1.3,d:1.24,rw:[1.12,1.2,1.08,1.16,1.3,1.34,1.4,1.25],rf:[1,1.06,1.12,1.2,1.26,1.2,1.22,1.6],rb:[1.1,1.2,1.15,1.22,1.3,1.32,1.32,1.4],
    at:1.6,lt:1.55,hs:1.28,hw:1.08,nw:2.4,neckL:-.03,legL:.92,foot:1.2,footW:1.3,head:cr_GH8,facePush:()=>0,n:16,sock:1,j2:1,footLite:1,arm:cr_CARM,leg:cr_LEG},0.03),
    sk=c9_GH.sk,sk2=c9_GH.sk2,bel=c9_GH.belly,sc=c9_GH.scute,T=S.torso,J=S.J;
  cg181Reg('gharial',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p);
    cr_fill(M,S,.015,.03);
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{let d=0;if(n[1]>-.7&&z>-.03)d-=.009*Math.exp(-Math.pow((y-1.567)/.004,2));[-1,1].forEach(s=>{d+=.016*cgG(x,y,s*.052,1.634,.017,.009);d-=.005*cgG(x,y,s*.012,1.58,.005,.004)});return d}));
    M.shade=cgShade(M,{cav:1.2,y0:0,y1:T[7][0]+.2,hk:.26});
    const my=S.hp(0,1.567,0)[1],y0=T[2][0]+.02,y1=T[6][0]+.01,kk=(y1-y0)/.34,wy=T[2][0];
    // mottled scaly hide (darker on the back), the pale belly plates and the jaw's underside, the harness strap and belt painted on
    const hide=m=>{const n=n3Sn(m.x,m.y,m.z,14,4),n2=n3Sn(m.x,m.y,m.z,5,2);let c=mdMix(sk,sk2,c9_cl((n-.45)*2.4*.6+(n2-.5)*.8+(m.s<-.3?.3:0)));if(m.s<-.4)c=mdMix(c,sc,.35);return c};
    cgEmit(B,M,m=>{if(m.part=='head'){if(Math.abs(m.y-my)<.004*S.hs&&m.nz>-.3)return 0x140806;if(m.ny<-.3)return bel;return null}
      if(m.part=='torso'){if(Math.abs(m.y-wy)<.024)return a181Nz(0x2a1a10,m,.3,18);if(m.y>y0-.02&&Math.abs((m.y-(y0+y1)/2)+kk*m.x)<.026*Math.sqrt(1+kk*kk))return a181Nz(0x3a2414,m,.3,18);
        if(m.s>.45&&m.y<T[6][0]-.03&&m.y>T[0][0])return Math.round(m.y*30)%2?bel:mdSh(bel,.86)}return null},{vcol:hide});
    // eyes on top of the head, slit pupils
    [-1,1].forEach(s=>{const q=S.hp(s*.052,1.638,.04),d=nrm3([s*.6,.3,.75]),p=cgRay(M,add3(q,mul3(d,.5)),mul3(d,-1),{head:1});if(p){k.p('head','sph','g',c9_GH.eye,p[0],p[1],p[2]-.003,.014,.012,.012);k.p('head','box','c',0x050403,p[0]+d[0]*.01,p[1],p[2]+d[2]*.01,.002,.016,.002)}});
    // teeth all along both jaws (upper ones down, lower ones up), interlocking
    {const z0=S.hp(0,1.567,.05)[2],z1=S.hp(0,1.567,.29)[2];for(let i=0;i<11;i++){const z=z0+(z1-z0)*i/10;[-1,1].forEach(s=>{const p=cgRay(M,[s*.4,my,z],[-s,0,0],{head:1});if(!p)return;
      const up=i%2;k.p('head','cone4','c',c9_GH.tooth,p[0]-s*.003,my+(up?.006:-.006),p[2],.0055,.022-(i>8?.006:0),.0055,up?0:Math.PI,0,s*.12)})}
      // the nostril knob on the snout's tip
      const p=cgRay(M,[0,my+.4,z1-.012],[0,-1,0],{head:1});if(p)k.p('head','sph','c',sk2,p[0],p[1]-.006,p[2],.034,.026,.03)}
    // bony scutes in rows down the back
    for(let i=0;i<8;i++){const y=T[6][0]-i*.07;[-1,1].forEach(s=>{const p=cgSurf(M,S,y,Math.PI+s*.3,-.008);c9_along(k,cgSurfBn(S,y),'cone4','c',sc,p,[s*.15,.5,-1],.05,.024,.032);WS(p)})}
    // the long heavy tail, rooted deep in the hips, dragging toward the ground, scutes along its top
    {const t0=cgSurf(M,S,J.pelvis[1]-.03,Math.PI,-.08),W=[['pelvis',1]],ty=t0[1],TT=[t0,add3(t0,[0,-.16,-.22]),add3(t0,[0,-.32,-.46]),[t0[0]+.04,Math.max(.22,ty-.5),t0[2]-.74],[t0[0]+.1,.14,t0[2]-1.02],[t0[0]+.16,.1,t0[2]-1.28]];
      cgTube(B,TT,[.15,.125,.095,.068,.04,.012],TT.map(()=>W),m=>m.s<-.3?bel:sk,{seg:9,capB:true,ref:[0,1,0]});
      for(let i=1;i<5;i++){const r=[.125,.095,.068,.04][i-1];[-1,1].forEach(s=>c9_along(k,'pelvis','cone4','c',sc,add3(TT[i],[s*r*.4,r*.75,0]),[s*.2,1,-.3],.04,.016))}}
    // a loincloth below the painted belt, a buckle on the harness, a necklace of teeth
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.08,.04,.02,m=>a181Nz(c9_GH.cloth,m,.3,12),{n:5,keep:m=>Math.abs(m.c)<.5});
    {const b=cgSurf(M,S,(y0+y1)/2,-.12,.004);k.p('chest','tor','m',0x6a6a60,b[0],b[1],b[2],.022,.008,.022,Math.PI/2,0,0);WS(b)}
    {const N=13,P2=c9_vine(B,M,S,Array.from({length:N},(_,i)=>{const t=i/(N-1),a=-1.35+t*2.7;return [T[6][0]+.02-.14*(1-Math.pow(a/1.35,2)),a]}),.007,0x5a3a20,i=>i==0||i==N-1?-.012:.004,{seg:4});
      for(let i=2;i<N-2;i++){const p=P2[i],a=-1.35+i/(N-1)*2.7;k.p(cgSurfBn(S,p[1]),'cone4','c',i==6?c9_GH.bone:c9_GH.tooth,p[0],p[1]-.026,p[2]-.002,.008,.05,.008,Math.PI,a,0);WS(p)}}
    // hands: the right one a fist round the halberd's haft, the left one clawed
    cr_mitten(B,S,1,{n:4,w:.042,th:.017,len:.09,curl:1,col:sk2,at:.045});cr_fingers(B,S,1,{n:0,len:.085,r:.0145,curl:1,spread:.033,col:sk2,thumb:1,at:.05});cr_fingers(B,S,-1,{n:4,len:.09,r:.0145,curl:.45,spread:.033,col:sk2,nail:0x1a1a10,thumb:1,at:.05});
    [-1,1].forEach(s=>cr_toes(B,S,s,{n:3,col:sk2,r:.019,len:.065,spread:.03,nail:0x1a1a10,claw:.025}))})})();
cr_stance('gharial',{sx:.3,hx:-.28,lk:.16,rk:.16,az:.12,lz:-.12,ex:-.25,le:-.3});

// ---------------- Frost Wendigo: gaunt and tall, an elk's skull for a head, antlers, a mantle of dark fur, ribs jutting from flayed
// flanks, bony knees, long claws ----------------
// (refine) too tall and starved, not a man: a pinched, sunken waist under a narrow ribcage, very long thin limbs with knobbed
// elbows and knees, arms hanging past the knees to long clawed fingers, a deep stoop with the skull hanging forward, lopsided
const ELKHEAD=[[1.52,.05,.07,.06,.03],[1.535,.048,.1,.06,.05],[1.55,.046,.14,.062,.07],[1.563,.044,.17,.064,.08],[1.575,.046,.165,.068,.08],[1.59,.052,.14,.074,.07],[1.605,.06,.12,.08,.055],[1.62,.07,.1,.086,.04],[1.636,.074,.088,.09,.03],[1.652,.07,.074,.088,.02],[1.666,.058,.056,.074,.01],[1.676,.03,.03,.04,0]];
const cr_ELK8=[0,2,3,5,7,8,10,11].map(i=>ELKHEAD[i]);
(function(){const S=cgHuman({h:.92,w:.86,d:.84,rw:[.78,.82,.55,.82,1.0,1.04,1.1,.92],rf:[.8,.78,.48,.92,1.02,.95,.88,.82],rb:[.82,.8,.6,.85,1.05,1.1,1.12,.95],
    at:.7,lt:.72,hs:1.0,head:cr_ELK8,facePush:()=>0,armL:1.5,legL:1.12,nw:.85,neckL:.05,foot:1.15,footW:.85,n:16,sock:1,j2:1,footLite:1,arm:cr_WARM,
    leg:[{t:.12,r:.075},{t:.45,r:.058},{t:.9,r:.042},{t:1.02,r:.05,rf:.056},{t:1.22,r:.044,rb:.05},{t:1.7,r:.03},{t:2.0,r:.03}]}),fur=c9_WD.fur,fur2=c9_WD.fur2,sk=c9_WD.skin,bone=c9_WD.bone,bl=c9_WD.blood,T=S.torso,J=S.J;
  cg181Reg('wendigo',S,function(B,P,k,C){const M=C.M,WS=p=>cr_WS(k,M,p);cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.05?0:.03*cgG(x,y,0,1.575,.03,.03)));
    // jutting ribs: raised ridges round the chest and flanks, sloping down to the sides, the sternum between them
    const ch=J.chest[1],RY=[0,1,2,3,4,5].map(i=>ch+.03-i*.042);
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]<-.35||Math.abs(x)<.018)return 0;const yy=y+Math.abs(x)*.45;let d=0;RY.forEach((r,i)=>{d+=.0085*(1-i*.08)*Math.exp(-Math.pow((yy-r)/.0075,2))});return d*Math.min(1,(Math.abs(x)-.018)/.02)});
    // the head is an elk's skull: bone all over, deep black sockets, the nasal cavity, a row of teeth; great branching antlers
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{let d=0;[-1,1].forEach(s=>{d-=.018*cgG(x,y,s*.045,1.625,.014,.012);d+=.008*cgG(x,y,s*.055,1.64,.016,.006)});if(n[2]>.2)d-=.012*cgG(x,y,0,1.578,.012,.02);return d}));
    M.shade=cgShade(M,{cav:1.4,y0:0,y1:T[7][0]+.2,hk:.3});
    const ny=S.hp(0,1.578,0)[1],ey=S.hp(0,1.625,0)[1],rib=m=>{if(m.part!='torso'||m.s<-.35||Math.abs(m.x)<.018)return 0;const yy=m.y+Math.abs(m.x)*.45;let v=0;RY.forEach(r=>v=Math.max(v,Math.exp(-Math.pow((yy-r)/.008,2))));return v},
      furSel=m=>(m.part=='torso'&&m.y>J.chest[1]+.03&&m.s<.5)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR0[1]-.12);
    // grey starved skin, darker on the back and the hands; the ribs pale; flayed raw flanks; the skull's bone flows
    const skin=m=>{const n=n3Sn(m.x,m.y,m.z,8,2),n2=n3Sn(m.x,m.y,m.z,4,6);if(m.part=='head')return mdMix(bone,c9_WD.bone2,c9_cl((n-.55)*2)*.5);
      let c=mdMix(sk,mdSh(sk,.72),c9_cl((n2-.45)*1.6+(m.s<-.3?.25:0)));const rv=rib(m);if(rv>.2)c=mdMix(c,c9_WD.bone2,c9_cl(rv*1.1));
      if(m.part=='torso'&&Math.abs(m.c)>.7&&m.y<J.chest[1])c=mdMix(c,bl,c9_cl((n-.45)*3)*.85);if(m.part=='hand'||cr_wrist(m,J)<.06)c=mdSh(c,.8);return c};
    cgEmit(B,M,m=>{if(m.part=='head'){const bx=m.x/S.hs;if(m.nz>.1&&Math.abs(Math.abs(bx)-.045)<.016&&Math.abs(m.y-ey)<.013*S.hs)return 0x080606;if(m.nz>.4&&Math.abs(bx)<.012&&Math.abs(m.y-ny)<.02*S.hs)return 0x080606}return null},{vcol:skin,keep:m=>!furSel(m)});
    cgEyes(k,M,S,c9_WD.eye,.045,1.625,.75,-.006);for(let i=0;i<6;i++)cgTeeth(k,M,S,[[(i-2.5)*.008,1.556,.012,0]],0xe8e0d0);
    [-1,1].forEach(s=>{let p=S.hp(s*.05,1.67,-.02),d=[s*.55,.8,-.25];for(let j=0;j<6;j++){const n=add3(p,mul3(d,.085));k.L('head','c',j<2?0xb8b0a0:bone,p,n,.018-j*.0025,.015-j*.0025,5);if(j>=1&&j<=4){const t=add3(n,[s*.03,.07+j*.01,.05-j*.015]);k.L('head','c',bone,n,t,.011-j*.0015,.002,4)}p=n;d=[d[0]*1.08,d[1]-.12,d[2]-.08]}});
    // the mantle of dark fur over the shoulders and back (the skin under it isn't drawn), a ragged fur kilt
    cgFur(B,M,furSel,{off:.035,len:.18,col:fur,col2:fur2,seed:131,jag:.6});
    cgSkirt(B,S,T[2][0]-.02,J.rh1[1]+.1,.05,.016,m=>a181Nz(fur2,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*5)%2==0});
    // bony knee caps
    [-1,1].forEach(s=>{const L=s<0?'lh':'rh',K=J[L+'1'],p=cgRay(M,[K[0],K[1]+.01,K[2]+.4],[0,0,-1],{leg:1});if(p){k.p(L+'1','sph','c',c9_WD.bone2,p[0],p[1]+.006,p[2]-.012,.03,.036,.024);WS(p)}});
    // long clawed fingers (four and a thumb) out of the narrow hand, black claws; clawed toes
    [-1,1].forEach(s=>{cr_fingers(B,S,s,{n:4,len:.17,r:.0095,curl:.35,spread:.024,col:mdSh(sk,.8),nail:c9_WD.claw,fan:.3,thumb:1,claw:.38,at:.045});cr_toes(B,S,s,{n:3,col:mdSh(sk,.8),r:.016,len:.07,spread:.026,nail:c9_WD.claw,claw:.035})})})})();
cr_stance('wendigo',{sx:.42,hx:-.16,sy:.1,lk:.2,rk:.24,dy:-.035,ax:-.28,lx:-.08,az:.06,lz:-.14,ex:-.2,le:-.55});
