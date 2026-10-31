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
const NAGAHEAD=[[1.52,.058,.064,.06,.018],[1.534,.062,.078,.064,.024],[1.548,.066,.105,.068,.03],[1.56,.067,.14,.07,.036],[1.571,.066,.168,.072,.04],[1.58,.067,.162,.075,.04],
  [1.592,.07,.138,.08,.036],[1.606,.075,.114,.086,.028],[1.62,.079,.1,.09,.02],[1.635,.078,.092,.092,.014],[1.65,.072,.08,.09,.008],[1.663,.06,.062,.078,.004],[1.672,.032,.032,.046,0]];
const NAGA_EYE=[.042,1.605];   // base head coordinates of the eyes (x either side, y)
function n181Face(x,y,z,n){let d=0;
  // the mouth: a dark slit along the jaw from the snout's tip back to its corner (front and sides)
  if(n[1]>-.7&&z>-.03)d-=.011*Math.exp(-Math.pow((y-1.5745)/.0042,2));
  [-1,1].forEach(s=>{d-=.006*cgG(x,y,s*.014,1.588,.005,.004);             // nostril slits on the snout's top, near the tip
    d+=.012*cgG(x,y,s*.05,1.624,.02,.007);                                 // scaled brow ridges over the eyes
    d-=.007*cgG(x,y,s*NAGA_EYE[0]*1.2,NAGA_EYE[1],.013,.009);              // the eye's socket under the ridge
    d+=.008*cgG(x,y,s*.066,1.556,.02,.014)});                              // the jaw muscles at the back of the jaw
  d+=.005*cgG(x,y,0,1.65,.012,.02);                                        // a ridge of scales over the skull
  return d}
// the tail: from under the hips down to the ground, then an S-curve trailing behind (model space)
function n181Path(){const W=(a,b,t)=>t<=0?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]],T=[[0,.66,-.01,.15,W('pelvis','nt0',0)],[0,.54,-.03,.155,W('pelvis','nt0',.15)],[0,.42,-.06,.155,W('pelvis','nt0',.5)],[0,.3,-.1,.15,W('nt0','nt0',0)],
  [0,.2,-.17,.142,W('nt0','nt1',.4)],[0,0,-.27,.132,W('nt1','nt1',0)],[0,0,-.4,.125,W('nt1','nt1',0)],[-.07,0,-.53,.118,W('nt1','nt2',.4)],[-.13,0,-.68,.108,W('nt2','nt2',0)],[-.09,0,-.85,.098,W('nt2','nt3',.5)],
  [.06,0,-1.0,.088,W('nt3','nt3',0)],[.14,0,-1.16,.077,W('nt3','nt4',.4)],[.15,0,-1.32,.064,W('nt4','nt4',0)],[.09,0,-1.48,.05,W('nt4','nt4',0)],[0,0,-1.6,.034,W('nt4','nt4',0)],[-.07,0,-1.7,.019,W('nt4','nt4',0)]];
  return T.filter((q,i)=>i!=1&&i!=3&&i!=9&&i!=11&&i!=13).map(([x,y,z,r,w])=>({p:[x,y||r*.8,z],r,w}))}   /* (refine) 11 rings: the smoothing step keeps the S-curve round */
function n181Spec(){const S=cgHuman({h:.86,w:1.0,d:1.0,rw:[1.12,1.16,.96,1.02,1.1,1.1,1.15,1.1],at:1.1,lt:1,hs:1.0,hw:.95,head:NAGAHEAD.filter((q,i)=>i!=1&&i!=9&&i!=11) /* (refine) 10 profile rings */,facePush:()=>0,
    // (refine) 16 columns, the shoulder socket round the joint and the arm grown out of it (the seated-arm fix; there are no
    // legs, so j2's hip half does nothing: the bottom ring flows straight on into the tail); arm rings only where they shape it
    n:16,sock:1,j2:1,arm:CG181.base.arm.filter((q,i)=>i!=2&&i!=5)});
  S.neck=S.neck.slice(1);   /* one neck ring: the neck is short behind the hood */
  S.tail=n181Path();S.extra=NAGA181.bones.map(q=>q[0]);S.pron={'-1':.5,'1':.5};return S}
// ---- (refine) where a point sits along the body: one centre line from the chest down the torso and out along the tail ----
// nh_Line(S) → {P (points), L (arc length at each), nt (torso ring count)}; nh_Near(F,p) → {s (arc length), k (segment), fr,
// v (the belly direction there: the front on the torso, the underside on the coils)}
function nh_Line(S){const T=S.torso,P=[];for(let i=T.length-1;i>=0;i--)P.push([0,T[i][0],T[i][4]||0]);S.tail.forEach(q=>P.push(q.p));const L=[0];
  for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]));return {P,L,nt:T.length}}
function nh_Near(F,p,k0,k1){const P=F.P;let best=null,bd=1e9;for(let k=(k0||0);k<(k1==null?P.length-1:k1+1);k++){const a=P[k],b=P[k+1],ab=sub3(b,a),l2=ab[0]*ab[0]+ab[1]*ab[1]+ab[2]*ab[2]||1,
    t=Math.max(0,Math.min(1,((p[0]-a[0])*ab[0]+(p[1]-a[1])*ab[1]+(p[2]-a[2])*ab[2])/l2)),q=add3(a,mul3(ab,t)),d=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(d<bd){bd=d;best={k,fr:t,ab}}}
  const t=nrm3(best.ab),u=nrm3(sub3([1,0,0],mul3(t,t[0]))),v=cross3(t,u);return {s:F.L[best.k]+(F.L[best.k+1]-F.L[best.k])*best.fr,k:best.k,fr:best.fr,v}}
// the face row of the torso at height y (each cage band is two rows after the smoothing step): for paint that follows the rows
function nh_TRow(S,y){const T=S.torso;for(let i=0;i<T.length-1;i++)if(y<T[i+1][0])return 2*i+((y-T[i][0])/(T[i+1][0]-T[i][0])>.5?1:0);return 2*T.length}
// a shell over the body whose skin is then not emitted (rim on the skin, so it seals); a belt band of torso / tail
function nh_Sh(B,M,sel,off,col,o){cgShell(B,M,sel,off,col,Object.assign({},o||{},{rim:0}));(M.nhHide||(M.nhHide=[])).push(sel)}
function nh_Belt(B,M,y,h,off,col,t){nh_Sh(B,M,m=>(m.part=='torso'||m.part=='tail')&&Math.abs(m.y-y)<h,off,col,{t})}
// a strap lying on the body: control points [y, angle round the body] (rays from outside) or {top:[x,z]} (a ray from above,
// over the shoulder); each gap gets two more points found the same way, so the strap hugs the skin; half sunk, ends tucked in
function nh_Strap(B,M,C,r,col){const hit=q=>q.top?cgRay(M,[q.top[0],2.5,q.top[1]],[0,-1,0],{torso:1}):cgRay(M,[Math.sin(q[1])*.7,q[0],Math.cos(q[1])*.7],[-Math.sin(q[1]),0,-Math.cos(q[1])],{torso:1});
  const Q=[];C.forEach((q,i)=>{Q.push(q);const n=C[i+1];if(n&&!q.top&&!n.top)for(let t=1;t<3;t++)Q.push([q[0]+(n[0]-q[0])*t/3,q[1]+(n[1]-q[1])*t/3])});
  const P=Q.map(hit).filter(Boolean),N=M.N||(M.N=cgNormals(M)),out=P.map((p,i)=>{let b=-1,bd=1e9;M.V.forEach((v,j)=>{const d=(v[0]-p[0])**2+(v[1]-p[1])**2+(v[2]-p[2])**2;if(d<bd){bd=d;b=j}});return add3(p,mul3(N[b],(i==0||i==P.length-1)?-r*1.2:r*.35))});
  mdLoft(B,out.map(p=>({p,rx:r*1.4,f:r*.7,b:r*.7,w:cgWAt(M,p)})),{seg:6,col})}
// a clean clawed hand: four fingers and a thumb, each one tapering loft rooted inside the hand and ending in its own dark claw
// (no separate segments or balls); kind 'fist' curls them round the grip, 'claw' hooks them a little (frames as cgFingers)
function nh_Hand(B,S,s,col,kind,len,nail){const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),W=[[bn+'2',1]],L=(len||1)*.08;
  const u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d));
  const rot=(v,a,an)=>{const c=Math.cos(an),sn=Math.sin(an),k=a[0]*v[0]+a[1]*v[1]+a[2]*v[2];return add3(add3(mul3(v,c),mul3(cross3(a,v),sn)),mul3(a,k*(1-c)))},D=(x,y,z)=>nrm3(add3(add3(mul3(d,x),mul3(u,y)),mul3(f,z)));
  const digit=(p,dir,n,seg,curl,r,tip,axis)=>{const R=[{p:sub3(p,mul3(dir,.014)),rx:r*1.05,f:r*.9,b:r*.9,w:W}];let q=p.slice(),dd=dir.slice();
    for(let i=0;i<n;i++){R.push({p:q.slice(),rx:r*(1-i*.12),f:r*(1-i*.12)*.85,b:r*(1-i*.12)*.85,w:W});q=add3(q,mul3(dd,seg));dd=rot(dd,axis,curl)}
    R.push({p:q.slice(),rx:r*.78,f:r*.66,b:r*.66,w:W});const nc=R.length;if(tip){dd=rot(dd,axis,curl*.8);const e=add3(q,mul3(dd,tip));R.push({p:add3(q,mul3(dd,tip*.35)),rx:r*.6,f:r*.5,b:r*.5,w:W});R.push({p:e,rx:r*.08,f:r*.08,b:r*.08,w:W})}
    mdLoft(B,R,{seg:5,ref:u,capB:true,col:m=>m.i>nc-1.2?nail:col})};
  const kn=add3(a2,mul3(d,.074));
  if(kind=='fist'){
    // (refine) a closed scaly fist round the grip. In a fist the fingers don't change the outline, so the four of them are ONE
    // rounded mitten mass: a wide loft on an arc about the handle's axis, from inside the palm over the knuckles, down the front
    // and tucked under toward the palm, with a gently bumpy knuckle ridge (each finger's band swells a little); the finger
    // separations are painted as thin dark lines (12 sides put a corner on every finger boundary, darkened per corner); small
    // claw tips peek from the finger ends; the thumb is its own rounded loft crossing in front
    const W6=(p,r)=>({p,rx:r,f:r,b:r,w:W}),lo=(R,nc)=>mdLoft(B,R,{seg:6,ref:u,capB:true,col:m=>m.i>nc-.5?nail:col});
    const rho=.02,C0=add3(add3(kn,mul3(d,.004)),mul3(u,-rho-.002)),A=th=>add3(C0,add3(mul3(u,Math.cos(th)*rho),mul3(d,Math.sin(th)*rho))),TG=th=>nrm3(add3(mul3(u,-Math.sin(th)),mul3(d,Math.cos(th))));
    const L0=B.L.c,v0=L0.p.length/3,MW=(th,t,wd)=>({p:th<-.3?sub3(A(-.3),mul3(d,.012)):A(th),rx:t,f:wd,b:wd,w:W});
    mdLoft(B,[MW(-.4,.012,.04),MW(-.1,.0125,.042),MW(.45,.013,.043),MW(1.0,.013,.043),MW(1.6,.0125,.042),MW(2.2,.012,.041),MW(2.75,.011,.039),MW(3.1,.008,.035)],{seg:12,ref:f,sq:.3,capB:true,col});
    for(let i=v0;i<L0.p.length/3;i++){const p=[L0.p[3*i],L0.p[3*i+1],L0.p[3*i+2]],q=sub3(p,C0),qu=q[0]*u[0]+q[1]*u[1]+q[2]*u[2],qd=q[0]*d[0]+q[1]*d[1]+q[2]*d[2],ac=q[0]*f[0]+q[1]*f[1]+q[2]*f[2],
      rr=Math.hypot(qu,qd),th=Math.atan2(qd,qu),out=Math.max(0,Math.min(1,(rr-rho)/.008));
      // finger bands swell, most on the knuckle ridge; the boundaries between them (across ±.021, 0) stay low and are painted dark
      const band=Math.abs(Math.cos(Math.PI*(ac-.0105)/.021)),kn2=Math.exp(-Math.pow((th-.6)/.45,2)),e=out*(.0012+.0028*kn2)*band;
      if(e&&rr>1e-6){const rd=add3(mul3(u,qu/rr),mul3(d,qd/rr));L0.p[3*i]+=rd[0]*e;L0.p[3*i+1]+=rd[1]*e;L0.p[3*i+2]+=rd[2]*e}
      const ln=th>.3&&Math.abs(ac)<.03&&[-.021,0,.021].some(b=>Math.abs(ac-b)<.004)?.42:1;if(ln<1)for(let j=0;j<3;j++)L0.c[3*i+j]*=ln}
    for(let i=0;i<4;i++){const z=(1.5-i)*.021,P=th=>add3(A(th),mul3(f,z));nh_Claw(B,[P(2.8),P(3.05),add3(add3(P(3.05),mul3(TG(3.05),.014)),mul3(u,.003))],[.006,.0055,.0008],W,nail,nail,0)}
    const t0=add3(add3(add3(a2,mul3(d,.03)),mul3(f,.036)),mul3(u,-.012)),Cf=add3(add3(kn,mul3(d,.041)),mul3(u,-.022)),
      t1=add3(Cf,mul3(f,.03)),t2=add3(Cf,mul3(f,.012)),t3=add3(add3(Cf,mul3(f,-.004)),mul3(u,-.004)),t4=add3(add3(Cf,mul3(f,-.012)),mul3(u,-.008));
    lo([W6(sub3(t0,mul3(d,.01)),.013),W6(t0,.0135),W6(lerp3(t0,t1,.55),.0125),W6(t1,.0115),W6(t2,.0105),W6(t3,.007),W6(t4,.001)],4.6);return}
  for(let i=0;i<4;i++){const z=(1.5-i)*.017,p=add3(add3(kn,mul3(f,z)),mul3(u,-.004));digit(p,D(1,-.15,z*.6),3,L*(i==3?.82:1)/3,kind=='claw'?.3:.16,.0088,.017,ax)}
  digit(add3(add3(add3(a2,mul3(d,.032)),mul3(f,.026)),mul3(u,-.01)),D(.6,-.3,.75),2,L*.3,.3,.0095,.013,nrm3(cross3(u,f)))}
// the cobra hood behind the head (base head coordinates: y, half width, z)
function n181Hood(B,S,col){const R=[[1.47,.085,-.06],[1.52,.15,-.075],[1.57,.2,-.09],[1.62,.21,-.095],[1.665,.175,-.095],[1.695,.1,-.09],[1.712,.025,-.085]].map(([y,r,z])=>{const p=S.hp(0,y,z);return {p,rx:r*S.hs,f:.02,b:.03,w:y<1.53?[['neck',1]]:[['neck',.3],['head',.7]]}});
  mdLoft(B,R,{seg:14,capB:true,col})}
// a naga: body, head, hood, fingers; returns the smoothed mesh for the gear
function n181Build(B,k,C,S,K){const M=C.M,J=S.J;cgSculpt(M,{head:1},S.sculpt(n181Face));
  // (refine) the hide's colour flows corner to corner (vcol): mottled scales darker down the back, dark saddles with pale rims
  // along the spine and the coils (spaced along the body's own centre line), a pale side line, the belly plates; baked creases
  const F=nh_Line(S),NT=F.nt,TP=S.tail.map(q=>q.p),Ty=S.torso.map(q=>q[0]),my=S.hp(0,1.5745,0)[1],cy=S.hp(0,1.64,0)[1],chy=J.chest[1]+.04;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)},hand=mdMix(K.sk,K.sk2,.45);
  const hide=m=>{const n1=n3Sn(m.x,m.y,m.z,7,3);if(m.part=='head'){let c=mdMix(K.sk,K.sk2,cl(.25+(n1-.5)*.9+ss(cy-.02,cy+.02,m.y)*.5,0,1));return mdMix(c,mdMix(K.bel,K.sk,.3),Math.max(ss(.2,.55,-m.ny),ss(.35,.7,m.nz)*ss(my+.002,my-.006,m.y)))}   /* the throat and the lower jaw pale */
    if(m.part=='hand')return hand;
    const q=nh_Near(F,[m.x,m.y,m.z]),b=m.nx*q.v[0]+m.ny*q.v[1]+m.nz*q.v[2];let c=mdMix(K.sk,K.sk2,cl(.2+(n1-.5)*1.1+ss(.2,.9,-b)*.25,0,1));
    if(m.part=='neck')return mdMix(c,mdMix(K.bel,K.sk,.3),ss(.2,.6,m.nz));   /* a pale throat under the jaw */
    if(m.part=='arm')return mdMix(c,hand,ss(.1,-.05,m.y-J[(m.x<0?'aL':'aR')+'2'][1]));
    // dark diamond saddles down the spine (wide on top, narrowing down the flanks), each ringed with pale scales
    const tr=-b,msk=ss(-.15,.25,tr)*(m.part=='torso'?ss(chy,chy-.12,m.y):1),ph=Math.cos(q.s*2*Math.PI/.26+.7)+.55*(tr-.55),sad=ss(.1,.45,ph)*msk,rim=Math.max(0,ss(-.35,.05,ph)-ss(.1,.45,ph))*msk;
    c=mdMix(c,mdMix(K.sk,0xd8d0a0,.4),rim*.9);c=mdMix(c,K.pat,sad*.9);
    const be=m.part=='tail'?ss(.3,.6,b):ss(.35,.65,m.nz)*(1-ss(.06,.1,Math.abs(m.x)))*ss(0,.04,chy-m.y);
    if(m.part=='tail')c=mdMix(c,mdMix(K.sk,K.bel,.55),ss(.02,.3,b)*(1-be)*.6);return mdMix(c,K.bel,be)};
  // the belly plates: crisp bands that follow the face rows (each cage band of the tail or torso is two rows after the smoothing
  // step), every other one darker, so the plates run straight across the belly instead of stepping face by face
  let FI=-1;const row=m=>{const f=M.F[FI];if(m.part=='tail'){const k=TP.indexOf(f.ref);if(k<0)return -1;return 2*k+(nh_Near(F,[m.x,m.y,m.z],NT-1+k,NT-1+k).fr>.5?1:0)}
    for(let i=0;i<Ty.length-1;i++)if(m.y<Ty[i+1])return 2*i+((m.y-Ty[i])/(Ty[i+1]-Ty[i])>.5?1:0);return -1};
  const plate=m=>{if(m.part=='tail'){const q=nh_Near(F,[m.x,m.y,m.z]);if(m.nx*q.v[0]+m.ny*q.v[1]+m.nz*q.v[2]<.6)return null}else if(!(m.part=='torso'&&m.nz>.55&&Math.abs(m.x)<.07&&m.y<chy))return null;
    const r=row(m);return r<0?null:r%2?mdSh(K.bel,.8):mdSh(K.bel,1.04)};
  M.shade=cgShade(M,{y0:-.3,y1:S.hp(0,1.67,0)[1],hk:.16,cav:1.05,min:.62});
  M.nhEmit=()=>{const HD=M.nhHide||[];cgEmit(B,M,m=>{if(m.part=='head')return Math.abs(m.y-my)<.0045*S.hs&&m.nz>-.3?0x140806:null;if(m.part=='tail'||m.part=='torso')return plate(m);return null},{vcol:hide,keep:(m,fi)=>{FI=fi;return !HD.some(f=>f(m))}})};   /* emitted last: no skin under the gear's shells (nh_Sh) */
  // eyes set under the brow ridges, facing forward and out, half sunk into the head, slit pupils; short fangs into the mouth slit
  [-1,1].forEach(s=>{const q=S.hp(s*NAGA_EYE[0],NAGA_EYE[1],.05),d=nrm3([s*.5,.12,.86]),p=cgRay(M,add3(q,mul3(d,.5)),mul3(d,-1),{head:1});if(!p)return;const r=.013*S.hs,c=sub3(p,mul3(d,r*.4));
    k.p('head','sph','c',0x0c0a06,c[0]-d[0]*r*.5,c[1],c[2]-d[2]*r*.5,r*1.25,r*1.0,r*.75,0,Math.atan2(d[0],d[2]),0);
    k.p('head','sph','g',K.eye,c[0],c[1],c[2],r,r*.8,r,0,Math.atan2(d[0],d[2]),0);k.p('head','box','c',0x050403,c[0]+d[0]*r*.82,c[1],c[2]+d[2]*r*.82,.0025,r*1.5,.0025,0,Math.atan2(d[0],d[2]),0)});
  [-1,1].forEach(s=>{const q=S.hp(s*.02,1.578,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p)k.p('head','cone4','c',0xe8e0c8,p[0],p[1]-.006*S.hs,p[2]-.006,.004*S.hs,.012*S.hs,.004*S.hs,Math.PI)});
  // the hood: its inner face pale down the middle (the throat colour), banded darker toward the rim, plain scaled behind; bands that
  // follow the loft's columns (no per-face spots that turned into blocks)
  n181Hood(B,S,m=>{const ax=Math.abs(m.x)/S.hs;if(m.s>.3)return ax<.05?mdMix(K.bel,K.sk,.35):ax<.075?mdSh(K.sk2,.7):ax<.15?mdMix(K.sk,K.bel,.15):mdSh(K.sk2,.85);return mdSh(K.sk2,.95)});
  [-1,1].forEach(s=>nh_Hand(B,S,s,hand,K.fist&&K.fist(s)?'fist':'claw',1.0,0x14100a));
  return M}

// ---------------- Naga Warrior: bronze scale cuirass, gorget, a heavy pauldron, vambraces, a war-belt with hanging plates ----------------
(function(){const S=n181Spec(),K={sk:0x3a4a2c,sk2:0x283420,bel:0x8c7c4e,pat:0x1a2214,eye:0xffc020,fist:s=>s>0};const br=0x6a5226,br2=0x4a3818,gd=0x8a7034,lt=0x2e2014,T=S.torso,J=S.J;
  cg181Reg('nagaw',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    nh_Sh(B,M,m=>m.part=='torso'&&m.y>wy-.01,.026,m=>m.y<wy+.03||m.y>sh+.02?gd:mdSh(nh_TRow(S,m.y)%2?br:br2,.95+.1*n3Sn(m.x,m.y,m.z,9,2))   /* (refine) lamellar rows that follow the face rows (no blocky steps) */,{t:'m'});
    nh_Sh(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh),.04,gd,{t:'m'});
    const a=J.aL0;[[.05,.13,.09,.135,br],[.0,.12,.075,.125,br2],[-.045,.11,.06,.115,br]].forEach(([dy,sx,sy,sz,c],j)=>k.p('aL0','hem','m',c,a[0]-(.03+j*.012),a[1]+dy,a[2],sx,sy,sz,0,0,-(.4+j*.12)));
    for(let j=0;j<3;j++)k.L('aL0','m',gd,[a[0]-.07-j*.025,a[1]+.06,a[2]-.03+j*.03],[a[0]-.11-j*.03,a[1]+.15,a[2]-.04+j*.03],.016,.002,4);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';nh_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>J[A+'2'][1]+.01,.016,m=>m.y<J[A+'2'][1]+.04?gd:br,{t:'m'})});
    const by=T[0][0]+.03;nh_Belt(B,M,by,.04,.035,lt);const bk=cgSurf(M,S,by,0,.04);k.p('pelvis','oct','m',gd,bk[0],bk[1],bk[2],.03,.035,.012);
    for(let i=0;i<9;i++){const an=-1.3+i*(2.6/8),p=cgSurf(M,S,by-.02,an,.034);k.p('pelvis','box','m',i%2?br:br2,p[0],p[1]-.07,p[2],.07,.15,.012,-.12*Math.cos(an),an,0);k.P[k.P.length-1].noSeat=1}   /* hung from the belt (top tucked into it) */M.nhEmit()})})();

// ---------------- Naga Archer: a leather harness, a quiver of red-fletched arrows, a bracer on the bow arm, a hide wrap ----------------
(function(){const S=n181Spec(),K={sk:0x4a4c2c,sk2:0x34361e,bel:0x9a8a5a,pat:0x22220e,eye:0xffd84a,fist:s=>s<0};const lt=0x4a3422,lt2=0x30200f,fe=0x8a2a1a,T=S.torso,J=S.J;
  cg181Reg('nagaa',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),sh=T[6][0],by=T[0][0]+.03;
    const sp=(y,a,off)=>{const q=cgTAt(S,y);return [Math.sin(a)*(q.rx+off),y,q.z+Math.cos(a)*((Math.cos(a)>=0?q.f:q.b)+off)]};
    // (refine) the harness: two straps, each one piece from the hip up across the chest, over the shoulder and down the back,
    // lying on the body (every point found on the skin, half sunk into it, bending with it); a buckle where they cross
    const wy=T[2][0]+.02,my=(sh+T[2][0])/2;[-1,1].forEach(s=>nh_Strap(B,M,[[wy,-s*.75],[my,-s*.1],[sh-.02,s*.5],{top:[s*.1,0]},[sh-.02,Math.PI-s*.5],[my,Math.PI+s*.1],[wy,Math.PI+s*.75]],.011,lt));
    {const c=cgRay(M,[0,my+.012,.6],[0,0,-1],{torso:1});if(c)k.p('chest','oct','m',0x8a7a50,c[0],c[1],c[2]+.006,.022,.022,.012)}
    const qb=cgTAt(S,J.chest[1]),qz=qb.z-qb.b-.06;k.L('chest','c',lt2,[.1,J.spine[1]-.02,qz],[-.08,sh+.06,qz-.03],.045,.04,8);
    for(let i=0;i<6;i++){const ox=(i%3-1)*.025,oz=(i<3?0:.02);k.L('chest','c',0x5a4a32,[-.08+ox,sh+.04,qz-.03+oz],[-.1+ox,sh+.14,qz-.04+oz],.004,.004,3);k.p('chest','cone4','c',i%2?fe:0xd8d0b8,-.1+ox,sh+.16,qz-.04+oz,.012,.05,.004)}
    nh_Sh(B,M,m=>m.part=='arm'&&m.x<0&&m.y<J.aL1[1]-.03&&m.y>J.aL2[1]+.01,.014,m=>mdSh(Math.abs(m.y-(J.aL1[1]+J.aL2[1])/2)>.05?lt2:lt,.94+.1*n3Sn(m.x,m.y,m.z,11,3)));   /* a plain bracer, darker cuffs */
    nh_Fur(B,M,m=>m.part=='torso'&&m.y<by+.06,{off:.024,len:.14,col:lt,col2:lt2,seed:41,jag:.55,lump:[.6,.6]});
    for(let i=0;i<5;i++){const p=sp(by+.05,-.6+i*.3,.02);k.p('pelvis','cone4','c',0xd8d0b8,p[0],p[1]-.02,p[2],.01,.04,.008,Math.PI)}   /* bone teeth sunk into the hide wrap */M.nhEmit()})})();

// ---------------- Naga Shaman: a fringed shawl, bead and fang necklaces, a sash with long panels, glowing marks, a bone crown ----------------
(function(){const S=n181Spec(),K={sk:0x2c4844,sk2:0x1e3430,bel:0x8a9a78,pat:0x0e1e1c,eye:0x7affd8,fist:s=>s>0};const cl=0x1e3a3a,cl2=0x122626,gd=0xa88a3a,rune=0x5affc8,bone=0xd8d0b8,T=S.torso,J=S.J;
  cg181Reg('nagas',S,function(B,P,k,C){const M=n181Build(B,k,C,S,K),sh=T[6][0],by=T[0][0]+.03;
    const sp=(y,a,off)=>{const q=cgTAt(S,y);return [Math.sin(a)*(q.rx+off),y,q.z+Math.cos(a)*((Math.cos(a)>=0?q.f:q.b)+off)]};
    nh_Fur(B,M,m=>m.part=='torso'&&m.y>J.chest[1]-.03,{off:.026,len:.12,col:cl,col2:cl2,seed:51,jag:.5,lump:[.6,.7]});
    for(let j=0;j<1;j++)for(let i=0;i<13;i++){const a=(i-6)*.15,p=sp(J.chest[1]+.02-j*.05-Math.abs(i-6)*.006,a,.034+j*.004-.009*Math.abs(i-6)/6);   /* the outer ones sink into the shawl */k.p('chest',i%3?'ico':'cone4','c',i%3?(j?gd:0x2a8a7a):bone,p[0],p[1],p[2],i%3?.011:.008,i%3?.011:.035,i%3?.011:.006,i%3?0:Math.PI)}
    nh_Belt(B,M,by,.04,.028,cl2);
    [[0,.2],[.5,.17],[-.5,.17],[Math.PI,.2]].forEach(([a,l])=>{const p0=cgSurf(M,S,by-.01,a,-.008),p1=cgSurf(M,S,by-.03,a,.034),d=[Math.sin(a),0,Math.cos(a)];   /* rooted in the body, out through the sash, hanging */
      mdLoft(B,[{p:p0,rx:.06,f:.008,b:.008,w:[['pelvis',1]]},{p:p1,rx:.06,f:.008,b:.008,w:[['pelvis',1]]},{p:add3(p1,add3(mul3(d,.012),[0,-l*.5,0])),rx:.06,f:.008,b:.008,w:[['pelvis',.5],['nt0',.5]]},{p:add3(p1,add3(mul3(d,.024),[0,-l,0])),rx:.06,f:.008,b:.008,w:[['pelvis',.5],['nt0',.5]]}],{seg:6,ref:d,col:m=>m.i>2.6?gd:cl})});
    [[J.spine[1]+.05,.42],[J.spine[1]+.05,-.42],[J.spine[1]-.01,.75],[J.spine[1]-.01,-.75],[J.spine[1]+.07,1.15],[J.spine[1]+.07,-1.15]].forEach(([y,a],i)=>{const d=[Math.sin(a),0,Math.cos(a)],p=cgRay(M,add3(sp(y,a,0),mul3(d,.4)),mul3(d,-1),{torso:1});if(p){const c=sub3(p,mul3(d,.001));k.p('spine','box','g',rune,c[0],c[1],c[2],.006,.05,.006,0,a,i%2?.7:-.7)}});   /* (refine) glowing marks on the bare flanks below the shawl, sunk into the skin */
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';nh_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'2'][1]+.06&&m.y>J[A+'2'][1]-.01,.014,gd,{t:'m'})});
    for(let i=0;i<7;i++){const a=(i-3)*.32,q=S.hp(Math.sin(a)*.08,1.66,-.03+Math.cos(a)*.02);k.L('head','c',i%2?bone:gd,q,[q[0]*2,q[1]+.13-Math.abs(i-3)*.025,q[2]-.06],.012,.002,4)}M.nhEmit()})})();
// no legs: no knee bend (ST179 from 3391 stays: a lean, arms ready)
