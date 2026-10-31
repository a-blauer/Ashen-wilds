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

// ---------------- refine helpers (Oct 31 2026, the Amalgam standard) — named br_… ----------------
// Every brute here now uses the seated-limb cage (n:16 columns, sock: the shoulder socket as tall as the arm, j2: arms and
// thighs grow out of the body), fewer rings where they don't shape the outline, one hand surface (the arm's rings run on past
// the wrist into a palm and the fingers grow out of it), baked shading (cgShade) and smooth hide colour (vcol).
const BR_LEG=CG181.base.leg.filter((q,i)=>i!=2&&i!=6),BR_LEG5=BR_LEG.filter((q,i)=>i!=4);   // hip pair (j2), knee pair, calf, ankle (LEG5: no calf ring, for legs in boots or a robe)
// a head ring list from the base head rings idx; m(i) → [x, front, back, dz] scales each ring (a jutting jaw, a flaring throat…)
function br_Head(idx,m){const H=CG181.base.head;return idx.map((j,i)=>{const q=H[j],f=m&&m(i);return f?[q[0],q[1]*f[0],q[2]*f[1],q[3]*f[2],(q[4]||0)+(f[3]||0)]:q.slice()})}
// the jaw's angle pushed out (facePush) on the rings of a custom head list whose base height lies in y0..y1
function br_Jaw(list,amt,y0,y1){return (i,j,a)=>{const y=list[i][0],ca=Math.cos(a),sa=Math.sin(a);return y>=y0&&y<=y1&&sa>-.2&&Math.abs(ca)>.5?amt:0}}
// arm rings: the shoulder pair (j2 grows them out of the socket), biceps, the elbow pair, forearm, wrist, then the palm (t>2:
// flat, wide front to back) whose end the fingers grow from. o: bi (biceps), big (forearm), pw (palm size), pl (palm length)
function br_Arm(o){o=o||{};const bi=o.bi||1,b=o.big||1,pw=o.pw||1,pl=o.pl||1;
  return (o.noFore?a=>a.filter(q=>q.t!=1.25):a=>a)([{t:.06,r:.05,o:.012},{t:.32,r:.042},{t:.62,r:.039*bi,rf:.043*bi},{t:.97,r:.034,rb:.04},{t:1.25,r:.037*b,rf:.04*b},{t:1.94,r:.024,rf:.027},
    {t:2+.1*pl,r:.019*pw,rf:.033*pw,rb:.03*pw},{t:2+.24*pl,r:.018*pw,rf:.036*pw,rb:.032*pw},{t:2+.34*pl,r:.014*pw,rf:.03*pw,rb:.026*pw}])}
// fingers grown from the palm's end: rounded tapering lofts in the hand's colour, rooted inside the palm (no ball, no sticks).
// Open hands curl a little toward the palm (claws: a dark pointed tip); a fist folds the fingers back under the palm round the
// grip, the thumb across them. o: {col, claw, n, len, r, te (the palm's last ring t), hw (half the palm's width), fist, cl
// (claw length), tc (fn(ring index, ring count) → colour: whole talons), thumb (false = none)}
function br_Fingers(B,S,s,o){const F=b7_Arm(S,s),A=F.A,W=[[A+'2',1]],d=F.d,u=F.u,f=F.f,n=o.n||4,L=o.len||.07,r=o.r||.011,hw=o.hw||.03,
    h=add3(F.a2,mul3(d,((o.te||2.34)-2)*.2-.012)),cl=o.cl||0;
  const path=o.fist?[[0,0,1],[.42,.06,.98],[.64,.34,.92],[.54,.66,.84],[.3,.8,.74]]:[[0,0,1],[.4,.04,.95],[.75,.15+(o.curl||0)*.1,.85],[1,.32+(o.curl||0)*.3,.66]];
  if(o.fist)br_Mitten(B,F,W,h,L,r,hw,o.col);else for(let i=0;i<n;i++){const t0=n>1?i/(n-1):.5,off=(t0*2-1)*hw,lf=L*(n>3?[.86,1,.96,.8][i]:n==3?[.9,1,.9][i]:1),P=(t,cu)=>add3(add3(h,mul3(d,t*lf)),add3(mul3(f,off*(1+t*(o.fist?.1:(o.fan==null?.45:o.fan)))),mul3(u,-cu*lf)));
    const R=path.map(([t,cu,k])=>({p:P(t,cu),rx:r*k,f:r*k*.9,b:r*k*.9,w:W}));
    if(cl&&!o.fist){const a=R[R.length-1].p,b=R[R.length-2].p,dd=nrm3(sub3(a,b)),e=add3(add3(a,mul3(dd,cl*.7)),mul3(u,-cl*.6));R.push({p:lerp3(a,e,.45),rx:r*.5,f:r*.45,b:r*.45,w:W,cc:1},{p:e,rx:.002,f:.002,b:.002,w:W,cc:1})}
    const nR=R.length;mdLoft(B,R,{seg:o.fist?6:5,ref:u,capB:true,col:m=>o.tc?o.tc(m.i,nR):cl&&m.i>nR-2.6?(o.claw==null?0x1a1414:o.claw):(i==1||i==2?o.col:mdSh(o.col,.94))})}
  if(o.thumb===false)return;
  // (a fist's thumb folds straight down the palm side and across the front of the curled fingers, lying on them)
  const T0=add3(add3(F.a2,mul3(d,.04)),add3(mul3(f,hw*.85),mul3(u,-.012))),T1=add3(T0,o.fist?add3(add3(mul3(d,.024),mul3(f,.004)),mul3(u,-.03)):add3(add3(mul3(d,.03),mul3(f,.018)),mul3(u,-.016))),
    T2=add3(T1,o.fist?add3(add3(mul3(d,.008),mul3(f,-.022)),mul3(u,-.022)):add3(add3(mul3(d,.028),mul3(f,.004)),mul3(u,-.018)));
  const TR=[{p:T0,rx:r*1.15,f:r,b:r,w:W},{p:T1,rx:r*1.05,f:r*.95,b:r*.95,w:W},{p:T2,rx:r*.8,f:r*.75,b:r*.75,w:W}];
  if(cl&&!o.fist)TR.push({p:add3(T2,add3(mul3(nrm3(sub3(T2,T1)),cl*.6),mul3(u,-cl*.3))),rx:.002,f:.002,b:.002,w:W});
  mdLoft(B,TR,{seg:5,ref:u,capB:true,col:m=>o.tc?o.tc(m.i+1,TR.length+1):cl&&!o.fist&&m.i>1.4?(o.claw==null?0x1a1414:o.claw):mdSh(o.col,.96)})}
// a closed fist as ONE rounded mitten mass curling from the palm's end back under it round the grip (the fingers don't change a
// fist's outline): 12 sides, so ring corners fall exactly on the three lines between four fingers, which are painted dark per
// corner (soft thin lines); a slightly fuller ring over the knuckles; the tip ring closes to a point tucked under the palm
function br_Mitten(B,F,W,h,L,r,hw,col){const d=F.d,u=F.u,w=mdW(B,W),C0=new THREE.Color(mdC(col)),rgb=k=>[C0.r*k,C0.g*k,C0.b*k],N=12,
    P=[[0,0,1,1],[.3,.05,1.04,1.5],[.46,.3,1.04,1.7],[.4,.58,.98,1.6],[.22,.72,.92,1.4],[.1,.72,.3,.4]],T=r*1.6;
  const pts=P.map(([t,cu])=>add3(add3(h,mul3(d,t*L)),mul3(u,-cu*L-(cu>0?T*.15:0)))),rows=pts.map((c,i)=>{const tg=nrm3(sub3(pts[Math.min(i+1,pts.length-1)],pts[Math.max(i-1,0)])),
      n=nrm3(sub3(u,mul3(tg,u[0]*tg[0]+u[1]*tg[1]+u[2]*tg[2]))),sd=cross3(n,tg),sc=P[i][2],row=[];
    for(let k=0;k<N;k++){const a=Math.PI/2+k/N*Math.PI*2,x=Math.cos(a),y=Math.sin(a),p=add3(add3(c,mul3(sd,x*(hw+r)*sc)),mul3(n,y*r*P[i][3]));
      const g=i>=1&&i<=4&&[-.5,0,.5].some(q=>Math.abs(x-q)<.05)?.55:1;row.push({x:p[0],y:p[1],z:p[2],w,rgb:rgb(g*(y<-.3?.9:1))})}return row});
  for(let i=0;i<rows.length-1;i++)for(let k=0;k<N;k++){const a=rows[i][k],a1=rows[i][(k+1)%N],b2=rows[i+1][k],b3=rows[i+1][(k+1)%N];mdTri(B,'c',a,a1,b2,0);mdTri(B,'c',b2,a1,b3,0)}}
// toes grown from the front of the foot: rounded lofts, splayed, each ending in a claw that hooks down to the ground
function br_Toes(B,S,s,o){const l=s<0?'lh2':'rh2',A=S.J[l],F=S.foot,W=[[l,1]],n=o.n||3,L=o.len||.05,r=o.r||.016,cl=o.cl||.03;
  for(let i=0;i<n;i++){const e=i-(n-1)/2,x=A[0]+s*0+e*(o.sp||.03)*F.w,z=A[2]+(.135-Math.abs(e)*.014)*F.len,dx=e*(o.spl||.3),lf=L*(1-Math.abs(e)*.12),
      R=[{p:[x,.03*F.h,z],rx:r,f:r*.8,b:r*.8,w:W},{p:[x+dx*lf*.5,.024*F.h,z+lf*.55],rx:r*.9,f:r*.72,b:r*.72,w:W},{p:[x+dx*lf,.018*F.h,z+lf],rx:r*.72,f:r*.6,b:r*.6,w:W}];
    if(cl)R.push({p:[x+dx*(lf+cl*.6),.012,z+lf+cl*.5],rx:r*.45,f:r*.4,b:r*.4,w:W},{p:[x+dx*(lf+cl),.002,z+lf+cl*.8],rx:.002,f:.002,b:.002,w:W});
    mdLoft(B,R,{seg:5,ref:[0,1,0],capB:true,col:m=>cl&&m.i>2.4?(o.claw||0x1a1414):o.col})}}
// a brute's body: face sculpt, extra sculpt, baked shading; skin colour from vcol (smooth), crisp face paint (sockets, lip)
// and o.paint; eyes, tusks, ears. The body itself is emitted last by br_Emit (after the shells that hide parts of it).
function br_Brute(k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(o.face));if(o.sculpt)o.sculpt(M);
  M.shade=cgShade(M,Object.assign({cav:1,y0:0,y1:S.hp(0,1.73,0)[1],hk:.26},o.shade||{}));
  M.b7col=m=>(o.paint&&o.paint(m))||b7_FacePaint(S,m,K.sk,{sock:mdSh(K.sk,.32),mw:o.mw||.032})||null;M.b7hide=[];M.brv=o.skin;
  cgEyes(k,M,S,K.eye,o.ex||.038,1.629,o.er||.9,-.002);if(o.tusks)br_Tusks(k.B181,M,S,.034,1.552,o.tusks,o.tr||.012);
  if(o.ears)cgEars(k,M,S,o.earCol||K.sk,1.625,o.ears,o.eu||.3,o.eb||.5,.024);return M}
function br_Emit(B,M){const H=M.b7hide||[];cgEmit(B,M,M.b7col,{keep:m=>!H.some(f=>f(m)),vcol:M.brv})}
// big curved tusks from the lower jaw: a loft rooted inside the lip, yellowed at the root, ivory toward the point
function br_Tusks(B,M,S,x,y,len,r){[-1,1].forEach(s=>{const p=b7_Face(M,S,s*x,y);if(!p)return;const L=len*S.hs,R=r*S.hs,a=[p[0]-s*.002*S.hs,p[1]-.01*S.hs,p[2]-.012*S.hs],
    P=t=>[p[0]+s*L*(.08+.14*t),p[1]+L*(.92*t-.08),p[2]+L*(.06+.22*t*t)];
  mdLoft(B,[{p:a,rx:R*1.05,f:R,b:R,w:[['head',1]]},{p:P(.15),rx:R,f:R*.95,b:R*.95,w:[['head',1]]},{p:P(.55),rx:R*.72,f:R*.7,b:R*.7,w:[['head',1]]},{p:P(1),rx:.0015,f:.0015,b:.0015,w:[['head',1]]}],
    {seg:5,ref:[0,0,1],col:m=>m.i<1?0xa89a6c:m.i<1.8?0xd0c4a0:0xece4cc})})}
// the hair cap of cgHair, but drawn instead of the skin under it (no doubled faces)
function br_Hair(B,M,S,o){const line=o.line||1.672,nape=S.hp(0,o.nape||1.56,0)[1];
  b7_Sh(B,M,m=>{if(m.part!='head'&&!(o.neck&&m.part=='neck'&&m.s<-.2))return false;const by=(m.y-S.nb)/S.hs+1.52,bx=m.x/S.hs;if(m.y<nape)return false;
    return m.s<(o.side==null?.1:o.side)||by>line+(Math.abs(bx)>.05?-.004:0)},v=>(o.thick||.016)*Math.min(1,Math.max(.35,(v[1]-nape)/(.12*S.hs))),o.col)}
// cgFur with the fur's colour flowing smoothly corner to corner (vcol) instead of a per-face noise (no "pixel camouflage"); the
// darker strand grooves stay crisp. Same shell, clumps and costs as cgFur.
function br_Fur(B,M,sel,o){const N=M.N||(M.N=cgNormals(M)),V=M.V,pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map(),ef=new Map(),seed=o.seed||0;
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1);ef.set(k,[fi,a,b])}});
  const rim=new Set(),low=[];cnt.forEach((c,k)=>{if(c!=1)return;const [fi,a,b]=ef.get(k),m=cgInfo(M,M.F[fi]),my=(V[a][1]+V[b][1])/2;rim.add(a);rim.add(b);if(m.y>my+.002)low.push([a,b])});
  const lb=o.lump||[.35,1.3],lf=o.freq||24,lump=v=>{const n=n3Sn(v[0]*1.6,v[1]*.3,v[2]*1.6,lf,seed);return lb[0]+lb[1]*n*n},P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=V[i],n=N[i],d=o.off*lump(v)*(rim.has(i)?(low.some(e=>e[0]==i||e[1]==i)?1:.1):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  const groove=v=>n3Sn(v[0]*1.4,v[1]*.35,v[2]*1.4,22,seed)<.42,col=m=>o.col2!=null&&groove([m.x,m.y,m.z])?o.col2:null;
  cgEmit(B,M,col,{t:o.t,pos,keep:(m,fi)=>pick[fi],vcol:m=>mdSh(o.col,.84+.24*n3Sn(m.x*1.4,m.y*.5,m.z*1.4,16,seed))});
  // clumps along the lower edge: the rim is walked as loops and cut into runs of 2–4 edges; each run hangs as one wide, solid
  // clump (outer and inner faces fanned to its tip, closed at its two ends), uneven in length
  const W=new Map(),wOf=i=>{let w=W.get(i);if(w)return w;const a=V[i],L=[];for(let j=3;j<a.length;j++)if(a[j]>1e-4)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let s=0;for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];s+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=s||1;w=[si,sw];W.set(i,w);return w};
  const vx=(p,i)=>({x:p[0],y:p[1],z:p[2],w:wOf(i)}),t=o.t||'c',nx=new Map();low.forEach(([a,b])=>{nx.set(a,b)});const used=new Set();let ci=0;
  low.forEach(([a0])=>{if(used.has(a0))return;const loop=[];let v=a0;while(v!=null&&!used.has(v)){used.add(v);loop.push(v);v=nx.get(v)}
    for(let i=0;i<loop.length-1;){const n=Math.min(loop.length-1-i,2+Math.floor(a181H(ci,seed,7)*3)),run=loop.slice(i,i+n+1);i+=n;ci++;
      const h=a181H(ci,seed,3),L=o.len*(1-(o.jag==null?.6:o.jag)*h),mid=lerp3(pos(run[0]),pos(run[run.length-1]),.5),nn=nrm3(run.reduce((q,j)=>add3(q,N[j]),[0,0,0]));
      const tip=[mid[0]+nn[0]*L*.35,mid[1]-L,mid[2]+nn[2]*L*.35],c=mdC(h<.25&&o.col2!=null?o.col2:mdSh(o.col,.8+a181H(ci,9,seed)*.28)),T=vx(tip,run[Math.floor(run.length/2)]);
      for(let j=0;j<run.length-1;j++){const p=run[j],q=run[j+1];mdTri(B,t,vx(pos(p),p),T,vx(pos(q),q),c);mdTri(B,t,vx(V[q],q),T,vx(V[p],p),c)}
      const f=run[0],l=run[run.length-1];mdTri(B,t,vx(V[f],f),T,vx(pos(f),f),c);mdTri(B,t,vx(pos(l),l),T,vx(V[l],l),c)}})}
const br_cl=(v,a,b)=>Math.max(a,Math.min(b,v)),br_ss=(a,b,v)=>{const t=br_cl((v-a)/(b-a),0,1);return t*t*(3-2*t)};
// smooth hide colour: lighter belly and chest, darker back, darker toward the feet, big soft blotches (no per-face noise)
function br_Hide(o){return m=>{const n=n3Sn(m.x,m.y,m.z,o.f||5,o.seed||3),n2=n3Sn(m.x,m.y,m.z,(o.f||5)*2.6,(o.seed||3)+4);let c=o.base;
  if(o.belly!=null&&m.part=='torso')c=mdMix(c,o.belly,br_cl(m.nz*1.2-.1,0,1)*(o.bk||.5));
  if(o.back!=null)c=mdMix(c,o.back,br_cl(-m.nz*1.1-.05,0,1)*(o.dk||.45));
  if(o.blot!=null)c=mdMix(c,o.blot,br_ss(.52,.78,n)*(o.bl||.45));
  c=mdSh(c,.94+.1*n2);return o.post?o.post(m,c,n):c}}

// ---------------- Orc Raider ----------------
// stocky and broad: a big green brawler with a black topknot, red eyes, big tusks, spiked pauldrons, crossed straps, a
// loincloth over leather trousers, leather bracers, a bone necklace and pelt boots with white fur cuffs
// (refine, Oct 31 2026) heavier and more ape-like than a man: a bull neck running straight into a jutting jaw, a low skull under
// a heavy brow, sloping trapezius, a deep chest over a gut, long thick arms and short legs; a war-paint band across the eyes
(function(){const HD=br_Head([0,1,2,4,6,8,10,12,14],i=>[[1.55,1.2,1.62,.016],[1.36,1.28,1.42,.016],[1.24,1.26,1.26,.012],[1.12,1.14,1.1,.006],[1.04,1.03,1.04,0],[1,1,1,0],[.97,.98,1,0],[.93,.94,.97,0],[.88,.88,.9,0]][i]);
  const S=cgHuman({h:.9,w:1.3,d:1.2,rw:[1.06,1.12,1.1,1.22,1.34,1.38,1.46,1.62],rf:[1,1.08,1.26,1.3,1.32,1.22,1.12,1.1],rb:[1,1.08,1.1,1.2,1.3,1.36,1.46,1.62],at:1.7,lt:1.5,hs:1.06,hw:1.14,hd:1.06,hy:.94,legL:.8,armL:1.1,nw:1.95,neckL:-.02,foot:1.08,footW:1.3,
      n:16,sock:1,j2:1,footLite:1,head:HD,arm:br_Arm({bi:1.1,big:1.12,pw:1.15}),leg:BR_LEG5,facePush:br_Jaw(HD,.016,1.525,1.58)}),
    K={sk:0x56643e,eye:0xff3a1a},lt=0x3a2618,pants=0x4a3a2a,T=S.torso,J=S.J;
  cg181Reg('orc',S,function(B,P,k,C){const wy=T[2][0],sh=T[6][0],hy=T[1][0],kn=J.rh1[1],ch=J.chest[1],WS=p=>{k.P[k.P.length-1].w=cgWAt(C.M,p)};
    const ey=S.hp(0,1.629,0)[1],hide=br_Hide({base:K.sk,belly:0x74804a,back:0x3c4a2c,blot:0x4a5834,f:4.5,seed:5,post:(m,c)=>{
      // a band of black war paint across the eyes, ragged at its edges
      if(m.part=='head'&&m.nz>.15){const w=br_ss(.016*S.hs,.008*S.hs,Math.abs(m.y-ey+.004*Math.sin(m.x*90)));if(w>0)c=mdMix(c,0x161812,w*.85)}
      if(m.part=='hand'||(m.part=='arm'&&m.y<J.aR2[1]+.02))c=mdMix(c,0x3a4428,.3);return c}});
    const M=br_Brute(k,C,S,K,{tusks:.05,tr:.018,ears:.06,er:1.15,face:b7_FaceHuman({nose:1.3,nw:1.7,brow:2.6,chin:1.9,cheek:1.4,hollow:.006}),skin:hide,
      // big pectorals over a gut, a heavy hump of trapezius behind the neck (kept below the base of the head)
      sculpt:M=>cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]>.2){[-1,1].forEach(s=>d+=.02*cgG(x,y,s*.09,ch+.035,.075,.05));d+=.022*cgG(x,y,0,hy+.07,.12,.07)}
        if(n[2]<-.2)d+=.03*cgG(x,y,0,sh+.01,.13,.06)*Math.min(1,(-.2-n[2])*2);return d*Math.min(1,Math.abs(n[2])*1.4)}),
      paint:m=>m.part=='leg'||m.part=='foot'||(m.part=='torso'&&m.y<hy)?pants:null});
    // black hair: a cap over the crown and the back of the head, a topknot tied on the crown with a bone ring, its tail down the back
    br_Hair(B,M,S,{col:m=>a181Nz(0x141010,m,.3,24),line:1.676,thick:.016,side:.02});
    {const p=b7_Top(M,S,0,-.035);if(p){const a=[p[0],p[1]-.01,p[2]],b=[p[0],p[1]+.05*S.hs,p[2]-.02*S.hs];k.L('head','c',0x1e1614,a,b,.024*S.hs,.016*S.hs,6);
      k.L('head','c',0xb8ae8c,lerp3(a,b,.5),lerp3(a,b,.72),.0215*S.hs,.0195*S.hs,6);
      k.p('head','dod','c',0x141010,b[0],b[1],b[2],.026*S.hs,.022*S.hs,.026*S.hs);
      const c=[b[0],b[1]+.004,b[2]-.03*S.hs],e=[b[0],b[1]-.08*S.hs,b[2]-.09*S.hs],f=[b[0],b[1]-.17*S.hs,b[2]-.1*S.hs];
      mdLoft(B,[{p:[b[0],b[1],b[2]-.01],rx:.016*S.hs,f:.016*S.hs,b:.016*S.hs,w:[['head',1]]},{p:c,rx:.016*S.hs,f:.016*S.hs,b:.016*S.hs,w:[['head',1]]},{p:e,rx:.013*S.hs,f:.012*S.hs,b:.012*S.hs,w:[['head',1]]},{p:f,rx:.002,f:.002,b:.002,w:[['head',.6],['chest',.4]]}],{seg:5,ref:[0,0,-1],col:m=>m.i<1.3?0x1e1614:0x141010})}}
    // crossed straps over the bare chest and back
    [-1,1].forEach(s=>{const p0=cgSurf(M,S,sh-.02,s*.5,.01),p1=cgSurf(M,S,wy+.02,-s*.6,.02),p2=cgSurf(M,S,sh-.04,Math.PI-s*.5,.01),p3=cgSurf(M,S,wy+.02,Math.PI+s*.6,.02);
      cgTube(B,[p0,lerp3(p0,p1,.5),p1],[.016,.016,.016],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:5});cgTube(B,[p2,lerp3(p2,p3,.5),p3],[.016,.016,.016],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:5})});
    // leather trousers, a loincloth (front and back flaps) under a belt
    b7_Sh(B,M,m=>(m.part=='leg'&&m.y>kn-.1)||(m.part=='torso'&&m.y<wy-.004),.01,m=>mdSh(pants,.9+.15*n3Sn(m.x,m.y,m.z,9,2)));
    cgSkirt(B,S,wy-.02,kn+.06,.04,.024,m=>m.y<kn+.11?0x2a1d14:mdSh(pants,.86+.18*n3Sn(m.x,m.y,m.z,8,1)),{n:5,seg:16,keep:m=>Math.abs(m.c)<.4});
    cgBelt(B,M,wy,.024,.034,lt);{const bk=cgSurf(M,S,wy,0,.036);k.p('pelvis','box','m',0x6a6a70,bk[0],bk[1],bk[2]-.004,.05,.04,.012)}
    // spiked pauldrons on both shoulders (a darker rim), leather bracers
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];k.p(A+'0','hem','m',0x5a4630,a[0]+s*.03,a[1]+.02,a[2],.125,.09,.125,0,0,s*.4);k.p(A+'0','hem','m',0x3a2c1c,a[0]+s*.035,a[1]+.008,a[2],.13,.05,.13,0,0,s*.4);
      for(let i=0;i<2;i++)k.L(A+'0','m',0x8a8a90,[a[0]+s*(.05+i*.035),a[1]+.06,a[2]-.025+i*.05],[a[0]+s*(.1+i*.035),a[1]+.18,a[2]-.025+i*.05],.02,.002,5);
      b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.016,m=>Math.round(m.y*40)%2?0x4a3420:0x5a4430);
      // hands: the right a fist round the axe, the left open with short thick nails
      br_Fingers(B,S,s,s>0?{col:mdMix(K.sk,0x3a4428,.3),fist:1,n:4,len:.085,r:.0175,hw:.04}:{col:mdMix(K.sk,0x3a4428,.3),n:4,len:.08,r:.0175,hw:.034,fan:.2,curl:.4,cl:.016,claw:0x2a2418});
      // pelt boots to mid-shin, a thick white fur cuff round the top
      const by=J.rh2[1]+(kn-J.rh2[1])*.5;
      b7_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<by))&&Math.sign(m.x)==s,.024,m=>mdSh(0x3a2a1c,.85+.25*n3Sn(m.x,m.y,m.z,14,s+3)));
      br_Fur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<by+.03&&m.y>by-.02,{off:.04,len:.05,col:0xd8d2c2,col2:0xb4ac9a,seed:82+s,jag:.45,lump:[.6,.9]})});
    // a necklace of fangs and black beads
    for(let i=0;i<9;i++){const p=cgSurf(M,S,sh-.03-Math.abs(i-4)*.014,(i-4)*.2,.006);k.p('chest',i%2?'cone4':'oct','c',i%2?0xd8d0b0:0x2a2a2a,p[0],p[1]-.012,p[2],.013,i%2?.045:.014,.011,Math.PI)}
    br_Emit(B,M)})})();
ST179.orc={sx:.26,hx:-.24,lk:.26,rk:.26,az:.14,lz:-.14,ex:-.28,le:-.32};

// ---------------- Frost Troll / Troll Rimecaller ----------------
// hulking and stooped, long thick arms; a fan crest of white spikes on the crown, white hair down the spine and on the
// forearms, warts, a long nose and big tusks, frost plates and icicles on the shoulders, a string of skulls at the hip.
// The Troll: grey shorts and loincloth, pale bracers, a bead necklace. The Rimecaller: a frost-trimmed robe, a crystal on the
// chest, curling horns.
// (refine, Oct 31 2026) not men: stooped and hunched under a big hump of back, long arms whose big hands hang to the knees,
// short bowed legs on big clawed feet, the head slung low and forward with a long drooping nose; warts sculpted into the
// hide (no extra parts), frost rime whitening the shoulders, head and arms where they face the sky
['troll','trollsh'].forEach(key=>{const sh=key=='trollsh';
  const HD=br_Head(sh?[0,2,4,6,8,10,12,14]:[0,2,4,5,6,8,10,12,14],i=>(sh?[[1.62,1.16,1.8,.012],[1.3,1.24,1.32,.014],[1.12,1.14,1.1,.012],[1.04,1.06,1.03,.008],[1,1.02,1,.004],[.96,1,.98,0],[.9,.92,.95,-.004],[.84,.84,.88,-.006]]:[[1.62,1.16,1.8,.012],[1.3,1.24,1.32,.014],[1.12,1.14,1.1,.012],[1.06,1.08,1.04,.01],[1.02,1.04,1.02,.008],[1,1.02,1,.004],[.96,1,.98,0],[.9,.92,.95,-.004],[.84,.84,.88,-.006]])[i]);
  const S=cgHuman({h:sh?.9:.9,w:1.34,d:1.24,rw:[1.1,1.16,1.24,1.3,1.38,1.42,1.5,1.26],rf:[1,1.12,1.4,1.4,1.34,1.22,1.1,1.0],rb:[1.05,1.12,1.15,1.3,1.5,1.62,1.68,1.44],
    at:sh?1.62:1.78,lt:sh?1.42:1.52,hs:1.02,hw:1.02,hd:1.14,hy:1.04,armL:sh?1.4:1.66,legL:sh?.82:.76,nw:2.05,neckL:-.05,foot:1.45,footW:1.45,knee:1.12,
    n:16,sock:1,j2:1,footLite:1,head:HD,arm:br_Arm({bi:1.05,big:1.15,pw:1.12,pl:1.4,noFore:1}),leg:sh?BR_LEG5:BR_LEG,facePush:br_Jaw(HD,.016,1.525,1.58)});
  const K={sk:sh?0x5c6e82:0x627888,eye:0x6ad8ff},hair=0xd8e8f0,hair2=0xb0c0cc,frost=0xc8f0ff,T=S.torso,J=S.J;
  cg181Reg(key,S,function(B,P,k,C){const M0=C.M,wy=T[2][0],shy=T[6][0],hy=T[1][0],kn=J.rh1[1],WS=p=>{k.P[k.P.length-1].w=cgWAt(M0,p)};
    // warts: soft bumps sculpted into the hide, painted darker (no parts)
    const WT=[];for(let i=0;i<22;i++){const y=wy+a181H(i,2)*(shy-wy+.04),a=(a181H(i,7)-.5)*6.2;if(sh&&y<shy-.06)continue;WT.push([cgSurf(M0,S,y,a,0),.012+a181H(i,9)*.008])}
    [-1,1].forEach(s=>{const F=b7_Arm(S,s);for(let i=0;i<3;i++){const q=lerp3(J[F.A+'0'],F.a1,.3+i*.25),p=cgRay(M0,add3(q,[s*.4,.05,(i-1)*.05]),nrm3([-s,-.12,-(i-1)*.12]),{arm:1});if(p)WT.push([p,.011])}});
    const wart=(x,y,z)=>{let w=0;for(const [p,r] of WT){const d2=((x-p[0])**2+(y-p[1])**2+(z-p[2])**2)/(r*r);if(d2<4)w=Math.max(w,Math.exp(-d2))}return w};
    const hide=br_Hide({base:K.sk,belly:sh?0x7a8a9a:0x8496a2,back:sh?0x44546a:0x4a5c6c,blot:sh?0x4e6070:0x56685e,f:4,seed:sh?9:7,bl:.5,post:(m,c)=>{
      const w=wart(m.x,m.y,m.z);if(w>.05)c=mdMix(c,mdSh(K.sk,.62),w*.8);
      if(m.ny>.55&&m.part!='foot')c=mdMix(c,0xd0e4ee,br_ss(.55,.95,m.ny)*(m.part=='head'?.45:.5));   // frost rime where it faces the sky
      if(m.part=='hand'||m.part=='foot')c=mdMix(c,mdSh(K.sk,.7),.35);return c}});
    const M=br_Brute(k,C,S,K,{face:cgFaceTroll({nose:1.7,jaw:1.3}),tusks:.058,tr:.019,ears:.085,earCol:mdSh(K.sk,.9),skin:hide,shade:{cav:1.15},
      sculpt:M=>{// the hump: a big mass over the shoulder blades and the upper back (below the base of the head); a pot belly
        cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]<-.05)d+=.075*cgG(x,y,0,shy-.13,.17,.11)*Math.min(1,(-.05-n[2])*1.8);if(n[2]>.2)d+=.03*cgG(x,y,0,hy+.06,.13,.08)*n[2];return d});
        cgSculpt(M,{torso:1,arm:1,neck:1},(x,y,z,n)=>.009*wart(x,y,z));
        // fill round the base of the head so the neck and hump flow up into the skull (no groove round it)
        {const hb=S.hp(0,1.575,0)[1];cgSculpt(M,{neck:1,head:1,torso:1},(x,y,z,n)=>.04*cgG(0,y,0,(T[7][0]+hb)/2,1,(hb-T[7][0])*.75+.02)*Math.max(0,1-Math.abs(n[1])*1.2)+(n[2]<0?.07*cgG(0,y,0,hb,1,.08)*Math.min(1,-n[2]*2):0))}},
      paint:sh?null:m=>(m.part=='leg'&&m.y>kn+.03)||(m.part=='torso'&&m.y<hy)?0x5a5e66:null});
    // the crest: a fan of white spikes across the crown; white hair down the spine (over the hump)
    b7_Crest(k,M,S,hair,hair2,7,.11,.022);
    b7_Spine(k,M,S,shy+.01,7,.065,.11,hair,hair2,.03);
    // frost plates crusted over the shoulders (seated in the skin, bending with it), icicles hanging from their edge
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'];
      for(let i=sh?1:0;i<4;i++){const x=a[0]+s*(-.04+i*.024),z=a[2]+(i-1.5)*.036,p=cgRay(M,[x,a[1]+.5,z],[0,-1,0],{arm:1,torso:1});if(!p||p[1]<a[1]-.02)continue;
        const y=p[1]-.008+(sh?.016:0);k.p(A+'0','dod','c',i%2?frost:0xe8f8ff,p[0],y,p[2],.04,.024,.04,i,i*.6,0);WS(p);
        // an icicle under the plate's outer edge, rooted in the plate and bending with it (kept off the arm's joint)
        if(i>0){const e=[p[0]+s*.022,y-.004,p[2]+(i-2)*.008];k.L(A+'0','g',frost,[e[0]-s*.012,e[1]+.008,e[2]],[e[0]+s*.002,e[1]-.06-i%2*.02,e[2]],.011,.002,4);WS(p)}}
      const F=b7_Arm(S,s);
      if(!sh){// pale bracers on the forearms, hair tufts above them
        b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<F.a1[1]-(F.a1[1]-F.a2[1])*.45&&m.y>F.a2[1]-.005,.018,m=>Math.round(m.y*36)%3?0xd8dce4:0xb8bcc4);
        cgLimbTufts(k,M,F.a1,F.a2,.3,6,.07,hair,hair2,A+'1',{r:.024,parts:{arm:1}})}
      else cgLimbTufts(k,M,F.a1,F.a2,.74,4,.06,hair,hair2,A+'1',{r:.018,parts:{arm:1}});
      // big hands: four thick fingers with black claws (the right one a fist round the club / staff); big splayed clawed feet
      const hc=mdMix(K.sk,mdSh(K.sk,.7),.35);
      br_Fingers(B,S,s,s>0?{col:hc,fist:1,n:4,len:.1,r:.017,hw:.045,te:2.476}:{col:hc,n:4,len:.11,r:.0165,hw:.046,te:2.476,curl:.6,cl:.03,claw:0x2a2a30});
      br_Toes(B,S,s,{col:mdMix(K.sk,mdSh(K.sk,.7),.35),n:3,len:.055,r:.022,sp:.034,cl:.036,claw:0x2a2a30})});
    // a string of skulls and bones at the hip
    {const y=hy-.01;for(let i=0;i<5;i++){const a=-1.5+i*.26,p=cgSurf(M,S,y-(i%2?.01:0),a,sh?.03:.022),bn='pelvis';
      if(i%2){const q=sh?add3(p,[0,-.02,0]):cgSurf(M,S,y-.02,a,.004);k.p(bn,'box','c',0xd8d0b0,q[0],q[1],q[2],.016,.06,.016,0,a,.3)}
      else{k.p(bn,'dod','c',0xd8d0b0,p[0],p[1]-.03,p[2],.03,.033,.03);const q=add3(p,[Math.sin(a)*.026,-.03,Math.cos(a)*.026]);[-1,1].forEach(e=>k.p(bn,'oct','c',0x1a1814,q[0]+Math.cos(a)*e*.011,q[1]+.006,q[2]-Math.sin(a)*e*.011,.009,.009,.007))}}
      const p0=cgSurf(M,S,y+.01,-1.6,0),p1=cgSurf(M,S,y+.01,-.4,0);cgTube(B,[p0,lerp3(p0,p1,.5),p1],[.006,.006,.006],[[['pelvis',1]],[['pelvis',1]],[['pelvis',1]]],0x3a2a1a,{seg:4})}
    if(!sh){// grey shorts (painted), a loincloth front and back, a belt, a necklace of bone and beads
      cgSkirt(B,S,wy-.02,kn+.1,.04,.024,m=>m.y<kn+.15?0x4a4e54:mdSh(0x6a6e72,.86+.18*n3Sn(m.x,m.y,m.z,8,1)),{n:5,seg:16,keep:m=>Math.abs(m.c)<.4});cgBelt(B,M,wy,.022,.03,0x2a2a2e);
      for(let i=0;i<9;i++){const p=cgSurf(M,S,shy-.03-Math.abs(i-4)*.014,(i-4)*.2,.006);k.p('chest',i%2?'cone4':'oct','c',i%2?0xd8d0b0:0x8a9aa8,p[0],p[1]-.012,p[2],.013,i%2?.045:.014,.011,Math.PI)}}
    else{// the robe: body and sleeves, frost trim at the neck, cuffs and hem; a sash; the crystal on the chest; horns
      const tr=0x9ad8ff,rb=0x26344e,cuf=J.aR2[1]+.05;
      b7_Sh(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>cuf),.018,m=>(m.part=='torso'&&m.s>.3&&Math.abs(m.x)<.016)||(m.part=='arm'&&m.y<cuf+.04)?tr:mdSh(rb,.86+.2*n3Sn(m.x,m.y,m.z,7,4)));
      cgSkirt(B,S,wy-.02,J.lh2[1]+.12,.13,.026,m=>m.y<J.lh2[1]+.17?tr:Math.abs(Math.atan2(m.c,m.s))<.12?tr:mdSh(0x1e2a40,.86+.2*n3Sn(m.x,m.y,m.z,7,6)),{n:6,seg:12});
      cgBelt(B,M,wy,.02,.05,0x1a2238);
      const g=cgSurf(M,S,J.chest[1]+.03,0,.024);k.p('chest','oct','g',tr,g[0],g[1],g[2],.032,.05,.016);[-1,1].forEach(s=>k.p('chest','cone4','g',frost,g[0]+s*.03,g[1]+.005,g[2]-.004,.009,.04,.006,0,0,-s*1.2));
      [-1,1].forEach(s=>{const q=S.hp(s*.075,1.69,-.02);let p=q;[[s*.07,.05,-.03],[s*.04,.07,-.04],[-s*.005,.06,-.03]].forEach((d,j)=>{const n=add3(p,mul3(d,S.hs));k.L('head','c',j<2?0x8a8270:0x6a6250,p,n,(.026-j*.007)*S.hs,(.019-j*.007)*S.hs,5);p=n})})}
    br_Emit(B,M)})});
ST179.troll={sx:.5,hx:-.48,lk:.3,rk:.3,az:.14,lz:-.14,ax:-.12,lx:-.14,ex:-.16,le:-.2};ST179.trollsh={sx:.44,hx:-.42,lk:.22,rk:.22,az:.1,lz:-.1,ax:-.08,lx:-.1,ex:-.5,le:-.22};   // the staff hand held higher (the long arm would plant the staff's butt in the ground)

// ---------------- Storm Giant ----------------
// broad and massive: a white beard and mane, a glowing circlet, blue runes on the bare chest, a fur mantle, rune bracers,
// a leather kilt and pelt boots with white fur cuffs
// (refine, Oct 31 2026) a giant, not a big man: a huge barrel chest and shoulders, a thick neck, heavy limbs on slightly short
// legs, the head small for the bulk; storm-blue hide with paler storm-cloud blotches and blue rune tattoos round the upper
// arms, a fur collar up round the neck into the mane, a full beard (a solid mass and three thick locks)
(function(){const HD=br_Head([0,1,2,4,6,8,10,12,14],i=>[[1.45,1.1,1.55,.008],[1.22,1.14,1.24,.008],[1.14,1.12,1.14,.006],[1.06,1.06,1.05,.003],[1.02,1.02,1.02,0],[1,1,1,0],[.98,1,1,0],[.95,.96,.98,0],[.9,.9,.92,0]][i]);
  const S=cgHuman({h:.97,w:1.36,d:1.22,rw:[1.08,1.14,1.12,1.2,1.36,1.4,1.5,1.62],rf:[1,1.06,1.18,1.28,1.36,1.26,1.14,1.1],rb:[1,1.06,1.1,1.18,1.3,1.34,1.4,1.46],at:1.8,lt:1.62,hs:.86,hw:1.06,hd:1.04,legL:.84,armL:1.04,nw:1.85,neckL:-.01,foot:1.1,footW:1.35,
      n:16,sock:1,j2:1,footLite:1,head:HD,arm:br_Arm({bi:1.12,big:1.12}),leg:BR_LEG5,facePush:br_Jaw(HD,.012,1.525,1.58)}),
    K={sk:0x6a7a92,eye:0x6ac8ff},glow=0x6ac8ff,bd=0xc0d4e2,T=S.torso,J=S.J;
  cg181Reg('giant',S,function(B,P,k,C){const wy=T[2][0],ch=J.chest[1];
    const tat=m=>{if(m.part!='arm')return 0;const A=m.x<0?'aL':'aR',y0=(J[A+'0'][1]*.45+J[A+'1'][1]*.55);return br_ss(.012,.004,Math.abs(m.y-y0-.012*Math.sin(Math.atan2(m.z,m.x-J[A+'0'][0])*3)))};
    const hide=br_Hide({base:K.sk,belly:0x8090a8,back:0x4e5c74,blot:0x8a98ae,f:3.5,seed:11,bl:.35,post:(m,c)=>{const t=tat(m);if(t>0)c=mdMix(c,0x3a8ad0,t*.85);
      if(m.part=='hand'||(m.part=='arm'&&m.y<J.aR2[1]+.02))c=mdMix(c,0x4e5c74,.3);return c}});
    const M=br_Brute(k,C,S,K,{face:b7_FaceHuman({nose:1.4,nw:1.4,brow:1.9,chin:1.2,cheek:1.3}),skin:hide,shade:{cav:1.05},
      // a barrel chest (big pectorals), heavy trapezius behind the neck (below the base of the head)
      sculpt:M=>{cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]>.2)[-1,1].forEach(s=>d+=.022*cgG(x,y,s*.1,ch+.04,.08,.055)*n[2]);if(n[2]<-.2)d+=.028*cgG(x,y,0,T[6][0]+.01,.14,.06)*Math.min(1,(-.2-n[2])*2);return d});
        {const hb=S.hp(0,1.575,0)[1];cgSculpt(M,{neck:1,head:1,torso:1},(x,y,z,n)=>.022*cgG(0,y,0,(T[7][0]+hb)/2,1,(hb-T[7][0])*.75+.02)*Math.max(0,1-Math.abs(n[1])*1.2)+(n[2]<0?.03*cgG(0,y,0,hb,1,.07)*Math.min(1,-n[2]*2):0))}}});
    const my=S.hp(0,1.557,0)[1];
    const beard=m=>m.part=='head'&&m.s>-.12&&m.y<S.hp(0,1.582,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-my)<.008*S.hs),mantle=m=>(m.part=='torso'&&m.y>J.chest[1]+.04)||m.part=='neck'||(m.part=='arm'&&m.y>J.aR0[1]-.1);   // a fur collar up round the neck
    br_Fur(B,M,beard,{off:.022,len:.07,col:bd,col2:0xa8b8c8,seed:104,jag:.3,lump:[.7,1.1]});M.b7hide.push(beard);   // (no skin drawn under the beard and the mantle)
    // the beard's length: three thick tapering locks from under the chin, overlapping, lying down over the chest (the middle one longest)
    [[-.03,.74,.9],[.03,.86,.95],[0,1,1]].forEach(([x,f,v])=>{const p=b7_Face(M,S,x,1.548);if(!p)return;const H=S.hs,a=[p[0],p[1],p[2]-.02*H],R=[];
      [[0,0,0,.03],[.006,-.05,.004,.028],[.014,-.11*f,-.004,.021],[.022,-.17*f,-.016,.012],[.026,-.21*f,-.024,.002]].forEach(([dx,dy,dz,r],i)=>{const t=i/4;
        R.push({p:[a[0]+Math.sign(x)*dx*H,a[1]+dy*H,a[2]+dz*H],rx:r*H,f:r*H*.9,b:r*H*.9,w:[['head',1-t*.6],['chest',t*.6]]})});
      mdLoft(B,R,{seg:6,ref:[0,0,1],capB:true,col:m=>mdSh(Math.abs(m.c)>.8?0xa4b6c6:bd,v*(m.s<-.3?.88:1)*(1-m.i*.03))})});
    br_Hair(B,M,S,{col:m=>mdSh(bd,.9+.12*n3Sn(m.x,m.y,m.z,20,3)),line:1.69,thick:.018,side:.1,nape:1.535});cgShell(B,M,m=>m.part=='head'&&Math.abs(m.y-S.hp(0,1.676,0)[1])<.008*S.hs,.03,glow,{t:'g',rim:.5});
    br_Fur(B,M,mantle,{off:.045,len:.14,col:0x6a5e4e,col2:0x4a4030,seed:102,jag:.55});M.b7hide.push(mantle);
    // three blue runes on the chest, below the beard and the mantle
    [[-.055,0],[0,-.03],[.055,0]].forEach(([x,dy],i)=>{const y=J.chest[1]-.03+dy,p=cgSurf(M,S,y,x*5,-.001);k.p(b7_TB(S,y),'box','g',glow,p[0],p[1],p[2],.014,.11,.006,0,x*5,(i-1)*.5)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>J[A+'2'][1]+.02,.022,m=>Math.round(m.y*30)%2?0x5a6070:0x4a5060,{t:'m'});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'1'][1]+J[A+'2'][1])/2)<.012,.028,glow,{t:'g',rim:.79});   // rim on the bracer's surface
      // big hands: the right a fist round the hammer, the left open
      const hc=mdMix(K.sk,0x4e5c74,.3);br_Fingers(B,S,s,s>0?{col:hc,fist:1,n:4,len:.09,r:.0175,hw:.04}:{col:hc,n:4,len:.085,r:.019,hw:.036,fan:.2,curl:.35,cl:.012,claw:0x6a7484});
      const by=J.rh2[1]+(J.rh1[1]-J.rh2[1])*.5;
      b7_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<by))&&Math.sign(m.x)==s,.026,m=>mdSh(0x3a3026,.85+.25*n3Sn(m.x,m.y,m.z,14,s+5)));
      br_Fur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<by+.03&&m.y>by-.02,{off:.042,len:.06,col:0xd8d4cc,col2:0xb4b0a6,seed:103+s,jag:.45,lump:[.6,.9]})});
    b7_Sh(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.01,m=>mdSh(0x5a5040,.88+.16*n3Sn(m.x,m.y,m.z,9,2)));
    cgSkirt(B,S,wy-.02,J.lh1[1]+.06,.06,.022,m=>mdSh(Math.round(Math.atan2(m.c,m.s)*6)%2?0x6a5e4e:0x4a4030,.86+.2*n3Sn(m.x,m.y,m.z,9,3)),{n:5,seg:16});cgBelt(B,M,wy,.024,.03,0x3a2a1a);br_Emit(B,M)})})();
ST179.giant={sx:.16,hx:-.14,lk:.16,rk:.16,az:.12,lz:-.12,ex:-.22,le:-.26};

// ---------------- Amalgam: a lumpy heap of goo in a man's shape ----------------
// mottled brown and green goo full of what it swallowed: clods and stones, a skull and ribs in the belly, twigs and roots,
// glowing bubbles; a hump over the shoulders, a sagging belly, three mismatched slit-pupilled eyes, a maw of crooked teeth,
// drips off the chin and arms, lumpy three-fingered fists, feet spread into a dirty puddle
// (owner, Oct 31 2026) not a man: its outline should read as a heap of goo pretending to be one — stooped and top-heavy,
// the head a lump sunk forward into the mass with no neck, a sagging bottom-heavy belly, short thick stumps for legs,
// long uneven arms (the right one bigger), big low lumps breaking up the outline
(function(){const S=cgHuman({h:.98,w:1.5,d:1.55,rw:[1.55,1.7,1.85,1.75,1.5,1.4,1.4,1.8],rf:[1.5,2.0,2.6,2.2,1.55,1.3,1.2,1.5],at:2.3,armL:1.22,lt:2.7,legL:.6,hs:1.0,hw:1.3,hy:.72,hd:1.15,hz:.02,nw:3.7,neckL:-.09,foot:1.1,footW:1.8,facePush:BRUTEJAW,n:16,sock:1,j2:1,footLite:1,
    // (recipe) fewer rings where they don't shape the outline: a blob head, plain goo limbs
    head:CG181.base.head.filter((q,i)=>i%2==0).map((q,i,a)=>{const f=1+1.55*Math.pow(1-i/(a.length-1),2);return [q[0],q[1]*f,q[2]*f,q[3]*f,q[4]]}) /* the head swells out of the shoulders like a mound, no neck */,arm:CG181.base.arm.filter((q,i)=>i!=2&&i!=5&&i<7).concat([{t:2.1,r:.028,rf:.032,rb:.03},{t:2.26,r:.041,rf:.045,rb:.04},{t:2.42,r:.037,rf:.038,rb:.036}]) /* the arm swells into a goo fist */,leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=6)});
  S.armK={'1':1.18,'-1':.88};[['aR',1.12],['aL',.92]].forEach(([A,f])=>{const a0=S.J[A+'0'];S.J[A+'1']=add3(a0,mul3(sub3(S.J[A+'1'],a0),f));S.J[A+'2']=add3(a0,mul3(sub3(S.J[A+'2'],a0),f))});
  const C0={g1:0x3e5a28,g2:0x22341a,g3:0x5a7a34,dirt:0x4e3a26,dirt2:0x6a5236,glow:0xc8ff5a,bone:0xb8ae8c,bone2:0x8a8068,bark:0x3a2a1a},T=S.torso,J=S.J;
  cg181Reg('amalgam',S,function(B,P,k,C){const M=C.M,WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)},c=C0,sh=T[6][0],wy=T[2][0],hy=T[1][0],ch=J.chest[1],sp=J.spine[1];
    cgSculpt(M,{head:1,torso:1,arm:1,leg:1,neck:1},(x,y,z,n)=>.065*(n3Sn(x*.8,y*.8,z*.8,4.5,5)-.45)+.025*(n3Sn(x,y,z,9,2)-.45));   // big low lumps and sags, smaller ones on top
    // a big hump of goo over the shoulders and the back (higher on the right), a belly sagging over the hips
    cgSculpt(M,{torso:1,neck:1},(x,y,z,n)=>{let d=0;if(n[2]<-.1)d+=.15*cgG(x-.06,y,0,sh-.13,.2,.12)*Math.min(1,(-.1-n[2])*1.6);if(n[2]>0)d+=.065*cgG(x,y,0,hy+.03,.16,.08)*n[2];return d});
    // fill round the base of the head so the shoulders flow up into the mound (no groove between the hump and the head)
    {const hb=S.hp(0,1.58,0)[1];cgSculpt(M,{neck:1,head:1,torso:1},(x,y,z,n)=>.055*cgG(0,y,0,(T[7][0]+hb)/2,1,(hb-T[7][0])*.75+.02)*Math.max(0,1-Math.abs(n[1])*1.2)+(n[2]<0?.05*cgG(0,y,0,hb,1,.07)*Math.min(1,-n[2]*2):0))}
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>n[2]<.1?0:(-.02*cgG(x,y,0,1.56,.05,.012)+.01*cgG(x,y,0,1.6,.06,.03))));
    // smooth mottled colour: green goo blending into darker goo, patches of brown earth, the back and limbs darker
    const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),goo=m=>{const n=n3Sn(m.x,m.y,m.z,11,1),n2=n3Sn(m.x,m.y,m.z,5,3);
      let col=mdMix(c.g1,c.g2,cl(.3+(n2-.5)*1.1+(m.s<-.3?.25:0),0,.85));col=mdMix(col,c.g3,cl((.3-n)*4,0,1)*.55);
      const e=cl((n-.6)*3.5,0,1)*(m.part=='head'?.25:1);if(e>0)col=mdMix(col,n2>.5?c.dirt:c.dirt2,e);
      if(m.part=='hand')col=mdMix(c.g2,col,.3);if((m.part=='leg'&&m.y<J.rh2[1]+.12)||m.part=='foot')col=mdMix(col,c.dirt,.45);return col};
    M.shade=cgShade(M,{cav:1.1,y0:0,y1:sh+.25,hk:.3});   // baked creases, ridges and height light (no triangles)
    // where the goo runs: drip spots on the belly, chest, shoulders and arms (p on the skin, len of the run below it)
    const DR=[];[[wy-.02,-.5,.16],[wy-.04,.15,.2],[wy-.01,.55,.13],[sp+.06,-.25,.12],[ch+.02,.75,.14],[ch,-.85,.15],[sh-.1,2.35,.12],[sh-.12,-2.4,.13],[hy+.05,.3,.1],[sp,2.7,.12],[ch,3.6,.14]].forEach(([y,a,len])=>DR.push({p:cgSurf(M,S,y,a,0),len,arm:0}));
    [-1,1].forEach(s=>{const F=b7_Arm(S,s);[[J[F.A+'0'],F.a1,.55,.1],[J[F.A+'0'],F.a1,.95,.08],[F.a1,F.a2,.45,.09]].forEach(([a,b,t,len])=>{const q=lerp3(a,b,t),dir=nrm3([s,0,.35]),p=cgRay(M,add3(q,mul3(dir,.4)),mul3(dir,-1),{arm:1});if(p)DR.push({p,len,arm:s,dir})})});
    const run=m=>{for(const d of DR){const dy=d.p[1]-m.y;if(dy<-.012||dy>d.len*1.7)continue;if(d.arm&&m.part!='arm')continue;if(!d.arm&&m.part!='torso')continue;
      const w=.032*(1-.5*dy/(d.len*1.7)),dx=Math.hypot(m.x-d.p[0],m.z-d.p[2]);if(dx<w)return 1-dx/w}return 0};
    const earth=m=>{const col=goo(m),n=n3Sn(m.x,m.y,m.z,11,1);let o=col;
      const e=Math.max(0,Math.min(1,(n-.6)*3.5));if(e>0&&e<.6&&m.part!='head')o=mdMix(o,mdSh(c.dirt2,1.2),.5*Math.sin(e/.6*Math.PI)); // a dried, lighter rim fading round each mud patch
      const ct=S.hp(0,1.69,0)[1];if(m.part=='head'&&m.ny>.6&&m.y>ct)o=mdMix(o,n>.5?c.dirt2:c.dirt,Math.min(.8,(m.y-ct)*14)); // a crust of earth on the crown only
      if(m.ny>.45&&m.part!='head')o=mdMix(o,c.g3,Math.min(.35,(m.ny-.45)*.9));                   // wet sheen on the top of the bulges
      const r=run(m);if(r>0)o=mdMix(o,mdSh(c.g2,.75),.35+.45*r);                                // dark wet runs under the drips
      return o};
    cgEmit(B,M,m=>m.part=='head'&&m.s>.5&&Math.abs(m.y-S.hp(0,1.556,0)[1])<.011*S.hs&&Math.abs(m.x)<.065*S.hs?0x0a1404:null,{vcol:earth});   // goo colour flows corner to corner
    // a goo drip: a tapering strand from inside the skin, ending in a hanging droplet (both take the skin's weights)
    const drip=(p,len,r,dir)=>{const o=dir?mul3(dir,.012):[0,0,.012],a=sub3(p,mul3(o,1.4)),e=add3(p,[o[0]*.6,-len,o[2]*.6]);k.L('chest','c',c.g2,a,e,r,r*.4,4);WS(p);
      k.p('chest','oct','c',mdSh(c.g2,1.1),e[0],e[1]-r*.3,e[2],r*.8,r*1.15,r*.8);WS(p)};
    DR.forEach((d,i)=>drip(d.p,d.len*(.55+(i%3)*.15),.014+(i%2)*.005,d.dir));
    // three mismatched eyes sunk in the goo: a dark socket, the glowing eye, a black slit pupil
    [[-.05,1.629,.026],[.054,1.643,.021],[.002,1.674,.014]].forEach(([x,y,r])=>{const p=b7_Face(M,S,x,y);if(!p)return;const R=r*S.hs;
      k.p('head','sph','c',0x081004,p[0],p[1],p[2]-R*.55,R*1.45,R*1.2,R);k.p('head','sph','g',c.glow,p[0],p[1],p[2]-R*.12,R,R*.82,R*.6);k.p('head','box','c',0x000000,p[0],p[1],p[2]+R*.42,R*.2,R*1.25,R*.14)});
    // the maw: crooked upper teeth, a few lower ones, a sagging lower lip; drips off the chin
    for(let i=0;i<9;i++){const p=b7_Face(M,S,-.06+i*.015,1.566);if(p)k.p('head','cone4','c',0xc8c0a0,p[0],p[1]-.004,p[2]-.006,.0055*S.hs,(.022+((i*5)%3)*.009)*S.hs,.0055*S.hs,Math.PI,0,(i-4)*.06)}
    for(let i=0;i<4;i++){const p=b7_Face(M,S,-.042+i*.028,1.546);if(p)k.p('head','cone4','c',0xb8b090,p[0],p[1]+.004,p[2]-.006,.005*S.hs,.02*S.hs,.005*S.hs,0,0,(i-1.5)*.08)}
    for(let i=0;i<4;i++){const p=b7_Face(M,S,-.045+i*.03,1.534);if(!p)continue;const e=[p[0]+.004,p[1]-.06-(i%2)*.04,p[2]+.004];k.L('head','c',c.g2,[p[0],p[1]+.006,p[2]-.012],e,.016,.005,4);k.p('head','ico','c',mdSh(c.g2,1.1),e[0],e[1]-.004,e[2],.011,.015,.011)}
    // goo blobs on the shoulders and the upper arms, clods of earth on the shoulders with a stone
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],p=cgRay(M,[a[0]+s*.02,a[1]+.5,a[2]],[0,-1,0],{arm:1,torso:1});if(!p)return;
      k.p(A+'0','dod','c',c.dirt,p[0]+s*.04,p[1]+.02,p[2]-.015,.075,.055,.07,.3,0,s*.4);k.p(A+'0','dod','c',0x6a6a5a,p[0]+s*.0,p[1]+.045,p[2]+.04,.03,.028,.03,1,1,0)});
    // the earth it has swallowed: clods half sunk all over the body
    [[sh-.02,.9,.06],[sh-.02,-.9,.06],[ch,2.6,.08],[sp+.02,3.2,.07],[wy,-2.5,.06],[sp-.02,.5,.05],[ch+.03,.2,.045],[hy+.02,-.3,.05]].forEach(([y,a,r],i)=>{const p=cgSurf(M,S,y,a,-r*.35);
      k.p(b7_TB(S,y),'dod','c',i%2?c.dirt:c.dirt2,p[0],p[1],p[2],r,r*.8,r*.9,i,i*.7,0);WS(p)});
    // a skull and ribs half swallowed in the belly
    {const y=sp+.01,a=.18,p=cgSurf(M,S,y,a,-.035),n=[Math.sin(a),0,Math.cos(a)],ex=[Math.cos(a),0,-Math.sin(a)];k.p('spine','sph','c',c.bone,p[0],p[1],p[2],.07,.066,.066);
      [-1,1].forEach(e=>{const q=add3(add3(p,mul3(n,.056)),add3(mul3(ex,e*.024),[0,.012,0]));k.p('spine','sph','c',0x101008,q[0],q[1],q[2],.019,.019,.014)});
      {const q=add3(add3(p,mul3(n,.064)),[0,-.014,0]);k.p('spine','cone4','c',0x101008,q[0],q[1],q[2],.008,.018,.008,Math.PI)}
      k.p('spine','box','c',c.bone2,p[0]+n[0]*.03,p[1]-.055,p[2]+n[2]*.03,.05,.025,.04,0,a,0);
      for(let i=0;i<4;i++){const a2=-.42+i*.15,q=cgSurf(M,S,sp+.1,a2,-.005),r=cgSurf(M,S,sp+.05,a2+.08,-.005),m=add3(lerp3(q,r,.5),[Math.sin(a2)*.008,0,Math.cos(a2)*.008]);k.L('spine','c',c.bone2,q,m,.009,.008,4);k.L('spine','c',c.bone2,m,r,.008,.006,4)}}
    // twigs and roots poking out every which way (rooted inside the goo), a forked one now and then
    [[sh-.04,.4,[.08,.14,.06]],[ch,2.8,[-.1,.16,-.12]],[sp+.04,3.4,[.1,.12,-.14]],[sp,1.6,[.14,.08,0]],[wy,-1.7,[-.14,.1,.02]],[sh-.02,-2.6,[-.06,.2,-.1]],[hy+.02,2.2,[.1,-.02,-.12]],[ch-.02,-.6,[-.06,.1,.12]]].forEach(([y,a,d],i)=>{
      const p=cgSurf(M,S,y,a,-.03),bn=b7_TB(S,y),e=add3(p,d);k.L(bn,'c',c.bark,p,e,.013,.004,4);WS(p);if(i%2){const m=lerp3(p,e,.6);k.L(bn,'c',c.bark,m,add3(m,[.05,.04,-.02]),.007,.002,3);WS(p)}});
    [-1,1].forEach(s=>{const F=b7_Arm(S,s),A=F.A,a0=J[A+'0'];
      {const q=lerp3(a0,F.a1,.4),p=cgRay(M,add3(q,[s*.4,0,0]),[-s,0,0],{arm:1});if(p)k.L(A+'0','c',c.bark,add3(p,[-s*.02,0,0]),add3(p,[s*.12,.08,-.08]),.011,.003,4)}
      {const q=lerp3(F.a1,F.a2,.5),p=cgRay(M,add3(q,mul3(F.u,.4)),mul3(F.u,-1),{arm:1});if(p)k.L(A+'1','c',c.bark,sub3(p,mul3(F.u,.02)),add3(p,[s*.1,-.02,.1]),.01,.003,4)}
      // a root hanging from the forearm, forked
      {const q=lerp3(F.a1,F.a2,.7),p=cgRay(M,add3(q,mul3(F.f,-.4)),F.f,{arm:1});if(p){const e=add3(p,[s*.03,-.16,-.04]),m=lerp3(p,e,.55);k.L(A+'1','c',c.bark,sub3(p,mul3(F.f,-.02)),e,.009,.002,4);WS(p);k.L(A+'1','c',c.bark,m,add3(m,[s*.05,-.06,.02]),.005,.0015,3);WS(p)}}
      // three stubby goo fingers from the fist (part of the arm's surface): rounded lofts in the hand's own colour, rooted
      // inside the fist and curling in toward the palm
      const K=S.armK[s],h=add3(F.a2,mul3(F.d,.06*K)),fc=mdMix(c.g1,c.g2,.45),W=[[A+'2',1]];
      for(let f=0;f<3;f++){const o=(f-1)*.042*K,P=(t,cu)=>add3(add3(h,mul3(F.d,(t+.02)*K)),add3(mul3(F.f,o*(1+t*.8)),mul3(F.u,-cu*K)));
        mdLoft(B,[{p:P(.0,0),rx:.03*K,f:.03*K,b:.03*K,w:W},{p:P(.06,.006),rx:.028*K,f:.027*K,b:.027*K,w:W},{p:P(.095,.026),rx:.022*K,f:.021*K,b:.021*K,w:W},{p:P(.108,.048),rx:.015*K,f:.015*K,b:.015*K,w:W}],
          {seg:6,ref:F.u,capB:true,col:()=>f==1?fc:mdSh(fc,.92)})}
      // feet spread into a dirty puddle
      const l=s<0?'lh2':'rh2',FT=J[l];k.p(l,'sph','c',c.g2,FT[0],.022,FT[2]+.06*S.foot.len,.12,.036,.16);for(let i=0;i<3;i++)k.p(l,'ico','c',c.dirt,FT[0]+(i-1)*.06,.014,FT[2]+.13+i%2*.04,.032,.013,.032)});
    // stones and pebbles half sunk in the goo (grey and rust-brown), crumbs of earth on the crown, roots trailing down the back
    [[ch+.04,-.35,.03],[sp+.03,.95,.024],[wy+.02,2.2,.028],[sh-.05,3.0,.034],[hy+.03,-1.2,.022],[ch-.05,1.9,.02],[sp-.04,-2.4,.026],[wy-.03,.05,.018],[sh-.02,-.3,.02],[hy+.06,3.3,.024]].forEach(([y,a,r],i)=>{
      const p=cgSurf(M,S,y,a,-r*.4);k.p(b7_TB(S,y),'ico','c',[0x6a6a5a,0x58564c,0x5a4632][i%3],p[0],p[1],p[2],r,r*.8,r*.9,i*.9,i*1.3,i*.4);WS(p)});
    [-1,1].forEach(s=>{const l=s<0?'lh':'rh',q=lerp3(J[l+'0'],J[l+'1'],.5),p=cgRay(M,[q[0]+s*.4,q[1],q[2]+.1],[-s,0,-.25],{leg:1});if(p){k.p(l+'0','ico','c',0x58564c,p[0],p[1],p[2],.024,.02,.022,s,1,0);WS(p)}});
    [[-.03,1.73,.02],[.04,1.75,.016],[0,1.78,.018]].forEach(([x,y,r],i)=>{const q=S.hp(x,y,0),p=cgRay(M,[q[0],q[1]+.4,q[2]-.02],[0,-1,0],{head:1});if(p){k.p('head','dod','c',i%2?c.dirt:c.dirt2,p[0],p[1]-r*.3,p[2],r,r*.75,r*.9,i,i,0)}});
    [[sh-.06,3.0,[.05,-.32,-.08]],[ch-.04,3.5,[-.07,-.28,-.06]]].forEach(([y,a,d])=>{const p=cgSurf(M,S,y,a,-.02),e=add3(p,d),m=lerp3(p,e,.5);k.L('chest','c',c.bark,p,e,.012,.003,4);WS(p);k.L('chest','c',c.bark,m,add3(m,[d[0]*.6,-.1,-.03]),.006,.002,3);WS(p)});
    // glowing bubbles caught in the goo
    for(let i=0;i<12;i++){const y=hy+a181H(i,1,2)*(sh-hy),a=a181H(i,3,4)*6.283,r=.012+a181H(i,5,6)*.016,p=cgSurf(M,S,y,a,-r*.35);k.p(b7_TB(S,y),'ico','g',i%3?c.glow:0xf0ffb0,p[0],p[1],p[2],r,r,r);WS(p)}})})();
ST179.amalgam={sx:.34,hx:-.36,lk:.3,rk:.3,ax:-.12,lx:-.08,az:.24,lz:-.2,ex:-.35,le:-.22};

// ---------------- Akorror: a chitin-armoured horror ----------------
// olive-black chitin plates with lighter rims, a horned crest, big glowing green compound eyes, mandibles and huge fangs
// round a glowing red mouth, spiked pauldrons, a spine ridge, acid glowing in the belly seams, forearm scythes, huge talons,
// knee spikes, a heavy plated tail with rings and a fang stinger, hooked toe claws
// (refine, Oct 31 2026) a bug-thing, not a man in armour: a broad hunched thorax over a pinched, segmented waist, thin jointed
// limbs splayed wide (elbows and knees out, scythes forward like a mantis), knobbed joints, rows of spikes on the back,
// forearms and shins, a scorpion's segmented tail arching up behind; chitin segments with dark seams and pale olive rims
// painted (baked shading, no extra triangles), talons grown from the hand
(function(){const HD=br_Head([0,2,4,6,8,10,12,14],i=>[[.9,1.0,.95,.006],[.92,1.04,.98,.006],[.98,1.04,1.0,.004],[1.04,1.02,1.02,0],[1.06,1,1.04,0],[1.02,.98,1.04,0],[.96,.94,1,0],[.86,.84,.92,0]][i]);
  const AR=[{t:.06,r:.05,o:.01},{t:.32,r:.038},{t:.7,r:.032,rf:.036},{t:.96,r:.03},{t:1.06,r:.036,rb:.046},{t:1.2,r:.028},{t:1.94,r:.02},
    {t:2.12,r:.019,rf:.031,rb:.027},{t:2.32,r:.013,rf:.025,rb:.022}];
  const LG=[{t:.12,r:.078},{t:.45,r:.062,rf:.066},{t:.92,r:.046},{t:1.02,r:.054,rf:.064},{t:1.14,r:.044},{t:2.0,r:.03}];
  const S=cgHuman({h:.9,w:1.2,d:1.14,rw:[1.0,1.1,.6,.84,1.3,1.38,1.48,1.02],rf:[1,1.06,.66,.98,1.34,1.26,1.12,.9],rb:[1,1.1,.7,.94,1.36,1.46,1.56,1.12],at:1.32,lt:1.26,hs:1.04,hw:1.1,hd:1.2,hy:.92,legL:.96,armL:1.24,nw:1.2,foot:1.15,footW:1.05,knee:1.4,
      n:16,sock:1,j2:1,footLite:1,head:HD,arm:AR,leg:LG});
  const c1=0x1a1a10,c2=0x2a2a19,c3=0x0a0a06,edge=0x4a4a26,acid=0xb8ff3a,acid2=0x5a9a1a,fang=0xe8e0c8,claw=0x2a2430,T=S.torso,J=S.J;
  // chitin segments: a dark seam, then a pale olive rim fading into the plate below it (paint does the bevel)
  // (plate(): the seams only where the surface is upright: on tops they would ring like contour lines)
  const seg=(y,per,ph)=>{const u=((y/per+(ph||0))%1+1)%1;return u<.12?0:u<.3?1:2},plate=(y,per,ph,a,b)=>{const q=seg(y,per,ph);return q==0?c3:q==1?b:a};
  cg181Reg('akorror',S,function(B,P,k,C){const M=C.M,wy=T[2][0],hy=T[1][0],sh=T[6][0],WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)};
    cgSculpt(M,{head:1},S.sculpt((x,y,z,n)=>{if(n[2]<.05)return 0;let d=.022*cgG(x,y,0,1.645,.06,.01)-.012*cgG(x,y,0,1.556,.04,.005);[-1,1].forEach(s=>d-=.016*cgG(x,y,s*.04,1.628,.016,.01));return d}));
    // a keeled thorax: a ridge down the breastbone and the back; the waist stays pinched
    cgSculpt(M,{torso:1},(x,y,z,n)=>y>wy+.03?.016*Math.exp(-((x/.03)**2))*Math.abs(n[2])*br_ss(wy+.03,wy+.12,y):0);
    M.shade=cgShade(M,{cav:1.2,y0:0,y1:S.hp(0,1.73,0)[1],hk:.3});
    M.b7hide=[];M.b7col=(m=>m.part=='hand'?c3:Math.abs(m.ny)>.6?(m.ny>0?c2:c3):m.part=='head'?(m.s>.45&&m.y<S.hp(0,1.6,0)[1]?c3:plate(m.y,.03*S.hs,.3,m.s<-.2?c1:c2,edge)):m.s<-.3?plate(m.y,.05,0,c3,c1):plate(m.y,.05,0,c1,mdMix(c1,edge,.55)));
    // plate shells: thorax, the segmented waist and belly, limb plates (rims tucked to the skin)
    b7_Sh(B,M,m=>m.part=='torso'&&m.y>wy+.03,.024,m=>Math.abs(m.x)<.016?edge:Math.abs(m.ny)>.6?c2:plate(m.y,.06,.5,c2,edge));
    b7_Sh(B,M,m=>m.part=='torso'&&m.y<=wy+.03&&m.y>J.lh0[1]-.03,.02,m=>Math.abs(m.ny)>.6?c1:plate(m.y,.032,.2,m.s>.4?c2:c1,edge));
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',a=J[A+'0'];
      b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y>J[A+'1'][1]+.04,.02,c2);b7_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.05&&m.y>J[A+'2'][1]+.01,.018,c2);   // limb plates plain (seams on their slanted faces would step)
      b7_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>J[L+'1'][1]+.05,.02,c2);b7_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.05&&m.y>J[L+'2'][1]+.03,.018,c2);
      // a cluster of carapace spikes on the shoulder, swept back and out (no pauldron: they grow from the chitin)
      for(let i=0;i<3;i++){const p=cgRay(M,[a[0]+s*(.0+i*.035),a[1]+.5,a[2]-.03+i*.03],[0,-1,0],{arm:1,torso:1});if(!p)continue;k.p(A+'0','cone4','c',i==1?edge:c3,p[0],p[1]-.01,p[2],.03,.17-i*.03,.03,-.55,0,-s*(.35+i*.25));WS(p)}
      // talons grown from the hand: three long hooked claws, dark chitin at the root paling to bone at the point, and a thumb hook
      const F=b7_Arm(S,s);br_Fingers(B,S,s,{n:3,len:.16,r:.017,hw:.03,te:2.32,curl:1.1,cl:.05,tc:(i,n)=>i<1.2?c2:i<n-2.2?claw:fang});
      // a scythe blade growing out of the back of the forearm, curving forward; spikes along the forearm
      b7_Scythe(k,M,S,s,.38,.05,edge,0x8a8466);
      for(let i=0;i<2;i++){const q=lerp3(F.a1,F.a2,.25+i*.3),o=nrm3(add3(mul3(F.u,.9),mul3(F.f,-.4))),p=cgRay(M,add3(q,mul3(o,.4)),mul3(o,-1),{arm:1});if(p){k.L(A+'1','c',c3,sub3(p,mul3(o,.012)),add3(add3(p,mul3(o,.07)),mul3(F.d,.03)),.016,.002,4);WS(p)}}
      // knee spikes, a spur on the shin, hooked toe claws
      const K2=J[L+'1'],kp=cgRay(M,[K2[0],K2[1]+.02,K2[2]+.4],[0,0,-1],{leg:1});if(kp)k.L(L+'1','c',edge,[kp[0],kp[1]-.01,kp[2]-.03],[kp[0]+s*.02,kp[1]+.11,kp[2]+.1],.03,.002,4);
      {const q=lerp3(J[L+'1'],J[L+'2'],.45),p=cgRay(M,[q[0]+s*.4,q[1],q[2]-.1],nrm3([-s,0,.25]),{leg:1});if(p){k.L(L+'1','c',c3,[p[0]-s*.012,p[1],p[2]],[p[0]+s*.07,p[1]+.03,p[2]-.03],.016,.002,4);WS(p)}}
      const FT=J[L+'2'];for(let f=0;f<3;f++){const r=[FT[0]+(f-1)*.036,.032,FT[2]+.11*S.foot.len];b7_Claw(k,L+'2',fang,r,nrm3([(f-1)*.3,0,1]),[0,-1,0],.095,.02,.32,3)}
      b7_Claw(k,L+'2',claw,[FT[0],.045,FT[2]-.05*S.foot.len],[0,-.1,-1],[0,-1,0],.06,.016,.3,2)});
    // the head: a crest of horns sweeping back, big compound eyes on the sides, mandibles, fangs, a glowing red mouth
    [-1,0,1].forEach(s=>{let a=S.hp(s*.05,1.69,-.02),d=[s*.3,.5,-.8];for(let j=0;j<4;j++){const b=add3(a,mul3(d,.08*S.hs));k.L('head','c',j<2?c2:edge,a,b,(.032-j*.006)*S.hs,(.026-j*.006)*S.hs,5);a=b;d=[d[0]*1.1,d[1]-.25,d[2]-.1]}});
    [-1,1].forEach(s=>{const o=S.hp(0,1.636,.02),dir=nrm3([-s*.8,0,-.6]),p=cgRay(M,sub3(o,mul3(dir,.4)),dir,{head:1});if(!p)return;const n=mul3(dir,-1),R=.048*S.hs;
      const sc=add3(p,mul3(n,-R*.25));k.p('head','sph','c',c3,sc[0],sc[1],sc[2],R*1.12,R,R*1.12);const gc=add3(p,mul3(n,R*.12));k.p('head','sph','g',acid,gc[0],gc[1],gc[2],R*.92,R*.84,R*.98);
      for(let i=0;i<2;i++){const q=add3(add3(p,mul3(n,R*.95)),[0,(i-.5)*R*.7,0]);k.p('head','box','c',c3,q[0],q[1],q[2],R*1.3,R*.06,R*.06,0,Math.atan2(n[0],n[2]),0)}});
    {const p=b7_Face(M,S,0,1.556);if(p)k.p('head','box','g',0x8a1a0a,p[0],p[1],p[2]-.004,.07*S.hs,.014*S.hs,.012)}
    [[.03,1.556,.095,.017],[.072,1.565,.06,.013]].forEach(([x,y,len,r])=>[-1,1].forEach(s=>{const p=b7_Face(M,S,s*x,y);if(!p)return;const a=[p[0],p[1]+.006,p[2]-.008];
      k.L('head','c',fang,a,[p[0]+s*len*.12,p[1]-len*S.hs,p[2]+len*.25],r*S.hs,.002,5)}));
    [-1,1].forEach(s=>{const p=b7_Face(M,S,s*.06,1.548);if(!p)return;let a=[p[0]-s*.006,p[1],p[2]-.012],d=[s*.25,-.25,1];for(let i=0;i<4;i++){const L=.05*S.hs,b=add3(a,mul3(nrm3(d),L));
      k.L('head','c',i<2?c2:fang,a,b,.022*(1-i*.2)*S.hs,(.02*(1-(i+1)*.2)+.003)*S.hs,4);a=b;d=[d[0]-s*.35,d[1]+.05,d[2]-.15]}k.p('head','oct','g',acid,a[0],a[1]-.01,a[2],.009,.015,.009)});
    // a ridge of big spikes down the back of the thorax, swept back
    for(let i=0;i<6;i++){const y=sh+.02-i*.06,p=cgSurf(M,S,y,Math.PI,-.006);k.p(b7_TB(S,y),'cone4','c',i%2?c2:edge,p[0],p[1],p[2],.034,.2-Math.abs(i-1.5)*.02,.03,-1.0);WS(p)}
    [-1,1].forEach(s=>{for(let i=0;i<3;i++){const y=sh-.04-i*.07,p=cgSurf(M,S,y,Math.PI-s*.62,-.006);k.p(b7_TB(S,y),'cone4','c',c3,p[0],p[1],p[2],.024,.11-i*.015,.022,-1.1,0,-s*.5);WS(p)}});
    // acid glowing in the belly seams and in spots on the plates
    [0,1,2].forEach(i=>{const y=wy-.03+i*.045,p=cgSurf(M,S,y,0,.018);k.p(b7_TB(S,y),'box','g',acid2,p[0],p[1],p[2],.06-i*.01,.007,.008)});
    [[J.chest[1]+.02,.5],[J.chest[1]-.04,-.6],[wy+.08,.9],[J.chest[1]+.06,-2.6]].forEach(([y,a])=>{const p=cgSurf(M,S,y,a,.02);k.p(b7_TB(S,y),'oct','g',acid,p[0],p[1],p[2],.012,.012,.009)});
    // a scorpion's tail: plated segments from the base of the back, arching up behind, rings and spikes along its top, a stinger
    // curling forward with a drop of acid
    {const t0=cgSurf(M,S,J.lh0[1]+.03,Math.PI,-.04),D=[[0,0,0],[0,-.06,-.17],[0,-.04,-.36],[0,.06,-.52],[0,.24,-.62],[0,.44,-.6],[0,.6,-.5],[0,.68,-.36]],T2=D.map(d=>add3(t0,d)),RR=[.1,.095,.085,.072,.06,.05,.04,.026];
      cgTube(B,T2,RR,T2.map(()=>[['pelvis',1]]),m=>plate(m.i,1,.08,m.s>.3?c1:c2,edge),{seg:8,capB:true});
      for(let i=1;i<7;i++){const a=T2[i],d=nrm3(sub3(T2[i+1],T2[i-1])),up=nrm3(cross3(d,[1,0,0])),tp=add3(a,mul3(up,-RR[i]*.8));
        k.p('pelvis','cone4','c',i%2?c3:edge,tp[0],tp[1],tp[2],.022,.11-i*.008,.022,Math.atan2(-up[2],-up[1])-.25,0,0)}
      const e=T2[7],d=nrm3(sub3(T2[7],T2[6])),st=add3(e,mul3(nrm3(add3(d,[0,-.9,.6])),.13));k.L('pelvis','c',edge,sub3(e,mul3(d,.02)),lerp3(e,st,.4),.03,.022,5);k.L('pelvis','c',fang,lerp3(e,st,.38),st,.022,.002,5);
      k.p('pelvis','oct','g',acid,st[0],st[1]-.012,st[2],.008,.014,.008)}
    br_Emit(B,M)})})();
// the stance: hunched low over splayed, deeply bent legs, the head thrust forward and up, arms spread wide with the elbows
// bent so the scythes come forward
if(typeof N3!='undefined'&&N3.def&&N3.def.akorror)N3.def.akorror.stance={sx:.42,hx:-.4,lk:.24,rk:.24,ax:-.3,lx:-.3,az:.3,lz:-.3,ex:-.65,le:-.65};
// a claw: segments curling about the axis ax (turning toward −up of the hand), tapering to a point
function b7_Claw(k,bn,col,p,dir,tgt,len,r,curl,n){let a=p.slice(),d=nrm3(dir);
  for(let i=0;i<n;i++){const L=len/n,b=add3(a,mul3(d,L));k.L(bn,'c',col,a,b,r*(1-i/n),r*(1-(i+1)/n)+.002,4);a=b;d=nrm3(add3(d,mul3(tgt,curl)))}}
// a mantis scythe from the back of the forearm: a hooked blade sweeping back past the elbow and curling down, a pale edge
function b7_Scythe(k,M,S,s,len,w,col,edge){const F=b7_Arm(S,s),q=lerp3(F.a1,F.a2,.55),o=nrm3(add3(mul3(F.u,.55),mul3(F.f,-.85))),p=cgRay(M,add3(q,mul3(o,.4)),mul3(o,-1),{arm:1})||add3(q,mul3(o,.04)),bn=F.A+'1';
  let a=sub3(p,mul3(o,.014)),d=nrm3(add3(mul3(F.d,-.55),mul3(o,.85)));const n=5;
  for(let i=0;i<n;i++){const L=len/n,b=add3(a,mul3(d,L)),r0=w*(1-i/n*.8),r1=w*(1-(i+1)/n*.8);k.L(bn,'c',i<n-2?col:edge,a,b,r0,i==n-1?.002:r1,4);
    if(i>0&&i<n-1)k.L(bn,'c',edge,add3(a,mul3(F.d,r0*.6)),add3(b,mul3(F.d,r1*.6)),r0*.35,r1*.35,4);
    a=b;d=nrm3(add3(d,mul3(F.d,.55)))}}
