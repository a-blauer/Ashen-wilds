// ================= v213 Argus, the Hundred-Eyed — one skinned, painted body and smoother motion (owner, Nov 9 2026) =================
// Owner: "Argus looks a little too cluttered and outdated compared to our new models. Let's use what we've learned about modeling
// to improve his visual identity and model, and smooth out all his animations to make him feel in line with our newer models."
// The v146 Argus was ~160 rigid pieces on joints: ~340 shingled fur spikes pointing every way, 58 lidded eyes, a trophy belt,
// three spears, a collar and chain, mushrooms, weed, roots, rib tubes (35k triangles). v213 rebuilds him to
// docs/MODEL_DETAIL_RECIPE.md, the way Vaelric (3725) was rebuilt:
//  * One connected identity read from the silhouette: a hunched bog-wolf — the withers and a shaggy mane rising into a crest,
//    a gaunt waist, heavy haunches, long legs, a long skull-faced muzzle, great branching bog-elk antlers and a low heavy brush.
//  * The body is a cage (torso + neck, head, jaw, legs, paws, tail, ears) smoothed once (cgSub) and SKINNED to his own joints with
//    blended weights, so shoulders, elbows, knees, hocks, the neck and tail bend as one surface. Built once per page (arg213Geo).
//  * Detail is paint (vertex colour + cgShade's baked creases, height and top light): a dark back, olive-grey flanks, a paler
//    belly, a near-black mane, bog-moss on the back, mud on the legs, the bare bone of the skull over the muzzle, the torn hide
//    of the flanks showing a dark membrane, sockets round every eye. Geometry only where it changes the outline: ~80 fur clumps
//    all combed one way (crest, mane, ruffs, britches, the tail brush), the antlers, teeth, claws, the exposed ribs.
//  * Glow (under 5%): ~32 eyes in loose rows (a lens with its slit pupil painted in, so each eye is one mesh and can still blink),
//    the great brow eye, amber veins between the ribs (the skinned glow layer is R.vein, so it still brightens in Phase II).
// Motion: his own gait (arg213Loco) — each paw is planted for its stance and swings with an eased lift (a walk that turns into a
// trot, the stride matched to his speed so the paws don't skate: v146 slid ~3.9 m/s at a 2.6 m/s walk), the body bobbing on the
// footfalls, the head held steady, breathing and a slow look-around at rest; every pose change is then passed through a
// critically damped follow (arg213Smooth, sampled a little ahead so strikes still land on their beat), so snaps and pops ease.
// Same joints and names (the v110/v112/v146 poses, moves, the den, the Hundred Eyes and the v209 cinematic keep working).
var ARG213={on:1,geo:null,ms:0,tris:0,n:20,lead:.045,w:34,browP:[0,-.02,.04],browR:-.6,browS:[.18,.25,.14]};
var A213C={back:0x241f18,flank:0x403c32,belly:0x6a6456,mane:0x1c1814,grz:0x4e4c42,moss:0x3a4c24,mud:0x2a1e14,bone:0x766a54,bone2:0xa09478,
  mem:0x2a0a10,mem2:0x4a121a,rim:0x3a2420,gum:0x1e0a0b,tongue:0x34141a,claw:0x0b0a0c,nose:0x0c0a0c,sock:0x080605,earIn:0x1e0e10};
function a213SS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// ---------------- the joints (v146 names and rest positions; the head is no longer scaled ×1.25: its children moved instead) ----------------
function arg213Joints(R){const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('body','root',0,2.55,0);J('chest','body',0,0,.6);J('hips','body',0,0,-.9);
  J('neck','chest',0,.45,1.55,-.42);J('head','neck',0,.2,1.2,.42);J('jaw','head',0,-.225,.0625);J('brow','head',0,.4,.44);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('ant'+L,'head',s*.33,.47,-.14);J('ear'+L,'head',s*.42,.38,-.3,-.45,0,-s*.55);
    J('sh'+L,'chest',s*.74,-.25,.7);J('el'+L,'sh'+L,0,-1.2,0);J('pw'+L,'el'+L,0,-1.1,0);
    J('hp'+L,'hips',s*.6,-.2,-.45);J('kn'+L,'hp'+L,0,-1.05,.34);J('hk'+L,'kn'+L,0,-.85,-.42)});
  // the tail leaves the rump nearly level and curves down into a heavy brush
  J('t0','hips',0,.18,-1.42,.12);J('t1','t0',0,0,-.55,-.24);J('t2','t1',0,0,-.5,-.26);J('t3','t2',0,0,-.45,-.2)}
var ARG213_B=['body','chest','hips','neck','head','jaw','brow','antL','antR','earL','earR','shL','elL','pwL','shR','elR','pwR','hpL','knL','hkL','hpR','knR','hkR','t0','t1','t2','t3'];
// ---------------- the cage ----------------
// rings {c:[x,y,z], N (plane normal; default the path tangent), rx (side), f (toward U: up / front), b (away), w | wf(p)}
function a213Loft(M,R,o){const n=o.n,out=[],C=R.map(r=>r.c);
  R.forEach((r,i)=>{let N=r.N;if(!N){const a=C[Math.max(0,i-1)],b=C[Math.min(C.length-1,i+1)];N=sub3(b,a)}N=nrm3(N);let X=o.X||[1,0,0];X=nrm3(sub3(X,mul3(N,X[0]*N[0]+X[1]*N[1]+X[2]*N[2])));const U=cross3(N,X);r._N=N;
    const ring=[];for(let j=0;j<n;j++){const a=j/n*Math.PI*2,s=Math.sin(a),c=Math.cos(a),e=1+(r.push?r.push(a,s,c):0);
      let ps=s,pc=c;if(r.sq){const m=Math.max(Math.abs(s),Math.abs(c));ps=s+(s/m-s)*r.sq;pc=c+(c/m-c)*r.sq}
      const p=add3(add3(r.c,mul3(X,ps*r.rx*e)),mul3(U,pc*(c>=0?r.f:r.b)*e));ring.push(cgVert(M,p,r.wf?r.wf(p):r.w))}out.push(ring)});
  for(let i=0;i<R.length-1;i++){const ref=mul3(add3(C[i],C[i+1]),.5);cgBand(M,out[i],out[i+1],o.part,ref)}
  if(o.capA){const r=R[0],tip=sub3(r.c,mul3(r._N,o.capA));cgCap(M,out[0],tip,r.wf?r.wf(tip):r.w,o.part,C[1])}
  if(o.capB){const r=R[R.length-1],tip=add3(r.c,mul3(r._N,o.capB));cgCap(M,out[R.length-1],tip,r.wf?r.wf(tip):r.w,o.part,C[C.length-2])}
  return out}
// the torso profile in root space: [z, centre y, half width, above, below]
var A213T=[[-2.66,2.8,.16,.16,.18],[-2.5,2.74,.52,.46,.5],[-2.2,2.68,.8,.6,.74],[-1.78,2.64,.9,.66,.8],[-1.3,2.66,.8,.62,.7],[-.85,2.7,.64,.6,.56],[-.4,2.71,.6,.62,.56],
  [.05,2.68,.68,.7,.76],[.5,2.64,.86,.84,1.0],[.95,2.64,.98,1.04,1.1],[1.4,2.74,1.0,1.18,1.02],[1.82,2.88,.92,1.12,.88]];
function a213Tor(z){const T=A213T;if(z<=T[0][0])return T[0].slice(1);for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(z<=b[0]){const k=(z-a[0])/(b[0]-a[0]);return a.slice(1).map((v,q)=>v+(b[q+1]-v)*k)}}return T[T.length-1].slice(1)}
function a213WTor(z){if(z<-1.4)return [['hips',1]];if(z<-.55){const t=a213SS(-1.4,-.55,z);return [['hips',1-t],['body',t]]}if(z<.3)return [['body',1]];if(z<1.05){const t=a213SS(.3,1.05,z);return [['body',1-t],['chest',t]]}return [['chest',1]]}
// the window torn in each flank: z and the angle round the body (0 = spine, π/2 = flank, π = belly) of a torso point
function a213Th(p){const [cy,rx,up,dn]=a213Tor(p[2]);return Math.atan2(Math.abs(p[0])/rx,(p[1]-cy)/(p[1]>cy?up:dn))}
function a213Win(p){if(p[2]<-.6||p[2]>1.25)return 0;const th=a213Th(p),z=p[2],e=.09*(n3Sn(p[0],p[1]*3,z*3,5,7)-.5);
  const dz=Math.abs(z-.33)/.72,dt=Math.abs(th-1.42)/.5;return 1-a213SS(.82,1.0,Math.pow(Math.pow(dz,2.6)+Math.pow(dt,2.6),1/2.6)+e)}
// the joint frames (root space) read from the rig at rest
function a213Frames(){const R=svRig();arg213Joints(R);svRest(R);R.root.updateMatrixWorld(true);const F={};for(const k in R.J){const g=R.J[k],p=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld);F[k]={p:[p.x,p.y,p.z],m:g.matrixWorld.clone()}}return F}
function arg213Geo(){if(ARG213.geo)return ARG213.geo;const t0=performance.now(),F=a213Frames(),P=k=>F[k].p,bones={};ARG213_B.forEach(n=>bones[n]=0);
  const B=mdB(bones),M=cgMesh(B),C=A213C,n=ARG213.n,L=(j,v)=>{const q=new THREE.Vector3(v[0],v[1],v[2]).applyMatrix4(F[j].m);return [q.x,q.y,q.z]};
  // ---- torso + neck: one loft from the rump to inside the skull ----
  {const R=A213T.map(([z,cy,rx,up,dn])=>({c:[0,cy,z],N:[0,0,1],rx,f:up,b:dn,wf:p=>a213WTor(p[2])}));
    const nk=P('neck'),hd=P('head');
    R.push({c:[0,3.12,2.3],N:[0,.24,.97],rx:.76,f:.96,b:.74,wf:p=>[['chest',.4],['neck',.6]]});
    R.push({c:[0,3.36,2.66],N:[0,.38,.92],rx:.62,f:.8,b:.6,wf:p=>[['neck',.75],['head',.25]]});
    R.push({c:[0,3.58,2.94],N:[0,.42,.9],rx:.44,f:.52,b:.42,wf:p=>[['neck',.2],['head',.8]]});
    // the withers swell into the mane's crest; the belly line tucks up under the waist
    R.forEach(r=>{r.push=(a,s,c)=>{const z=r.c[2];return c>.3?.06*a213SS(.8,1.6,z)*(1-a213SS(2.4,2.8,z))*c:0}});
    a213Loft(M,R,{n,part:'torso',capA:.12})}
  // ---- the head: a broad skull narrowing into a long muzzle (head space, then to root space) ----
  {const H=[[-.52,.16,.24,.24,.26],[-.38,.14,.44,.46,.42],[-.1,.1,.53,.5,.44],[.2,.07,.5,.46,.38],[.48,.01,.36,.33,.29],[.82,-.03,.28,.26,.24],[1.16,-.06,.23,.22,.2],[1.44,-.07,.18,.18,.16],[1.64,-.07,.12,.13,.12]];
    const R=H.map(([z,cy,rx,up,dn])=>({c:L('head',[0,cy,z]),N:[0,0,1],rx,f:up,b:dn,w:[['head',1]]}));
    // a flatter top over the skull and a squarer muzzle
    R.forEach((r,i)=>{r.sq=i>=4?.25:.1});a213Loft(M,R,{n:16,part:'head',capA:.06,capB:.07})}
  // ---- the lower jaw (jaw space): its top sits inside the upper muzzle, its back tucked into the cheek ----
  {const Q=[[-.2,.0,.24,.1,.12,[['head',.65],['jaw',.35]]],[.12,-.02,.34,.1,.16,[['jaw',1]]],[.5,-.04,.27,.08,.14,[['jaw',1]]],[.88,-.04,.21,.07,.11,[['jaw',1]]],[1.22,-.03,.16,.06,.08,[['jaw',1]]],[1.4,-.03,.1,.05,.05,[['jaw',1]]]];
    const R=Q.map(([z,cy,rx,up,dn,w])=>({c:L('jaw',[0,cy,z]),N:[0,0,1],rx,f:up,b:dn,w,sq:.2}));a213Loft(M,R,{n:12,part:'jaw',capA:.04,capB:.05})}
  // ---- the legs: the top ring buried in the body, a muscle that is part of the outline, three rings at each bending joint ----
  const wB=(a,b,t)=>t<=0?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]];
  [-1,1].forEach(s=>{const Ls=s>0?'L':'R',sh=P('sh'+Ls),el=P('el'+Ls),pw=P('pw'+Ls),hp=P('hp'+Ls),kn=P('kn'+Ls),hk=P('hk'+Ls),X=x=>[s*x[0],x[1],x[2]];
    const lerpP=(a,b,t)=>lerp3(a,b,t);
    const F1=[{c:add3(sh,[-s*.12,.66,-.06]),rx:.3,f:.36,b:.36,w:[['chest',1]]},{c:add3(sh,[-s*.06,.25,0]),rx:.34,f:.5,b:.54,w:wB('chest','sh'+Ls,.45)},
      {c:add3(sh,[0,-.3,.03]),rx:.31,f:.42,b:.46,w:[['chest',.12],['sh'+Ls,.88]]},{c:lerpP(sh,el,.62),rx:.28,f:.27,b:.33,w:[['sh'+Ls,1]]},
      {c:add3(el,[0,.18,0]),rx:.24,f:.22,b:.28,w:wB('sh'+Ls,'el'+Ls,.22)},{c:el,rx:.22,f:.2,b:.3,w:wB('sh'+Ls,'el'+Ls,.5)},{c:add3(el,[0,-.2,0]),rx:.2,f:.19,b:.21,w:wB('sh'+Ls,'el'+Ls,.85)},
      {c:lerpP(el,pw,.62),rx:.15,f:.15,b:.15,w:[['el'+Ls,1]]},{c:add3(pw,[0,.14,0]),rx:.15,f:.15,b:.16,w:wB('el'+Ls,'pw'+Ls,.2)},{c:add3(pw,[0,-.02,.02]),rx:.16,f:.16,b:.17,w:wB('el'+Ls,'pw'+Ls,.6)}];
    a213Loft(M,F1,{n:12,part:'legF',capB:.06});
    const H1=[{c:add3(hp,[-s*.12,.5,0]),rx:.28,f:.4,b:.42,w:[['hips',1]]},{c:add3(hp,[-s*.04,.06,.04]),rx:.36,f:.58,b:.66,w:wB('hips','hp'+Ls,.5)},
      {c:add3(hp,[0,-.42,.14]),rx:.34,f:.5,b:.54,w:[['hips',.1],['hp'+Ls,.9]]},{c:lerpP(hp,kn,.7),rx:.3,f:.32,b:.32,w:[['hp'+Ls,1]]},
      {c:lerpP(hp,kn,.88),rx:.25,f:.27,b:.25,w:wB('hp'+Ls,'kn'+Ls,.2)},{c:kn,rx:.23,f:.25,b:.23,w:wB('hp'+Ls,'kn'+Ls,.5)},{c:lerpP(kn,hk,.2),rx:.2,f:.2,b:.21,w:wB('hp'+Ls,'kn'+Ls,.85)},
      {c:lerpP(kn,hk,.6),rx:.15,f:.13,b:.17,w:[['kn'+Ls,1]]},{c:lerpP(kn,hk,.86),rx:.14,f:.12,b:.18,w:wB('kn'+Ls,'hk'+Ls,.2)},{c:hk,rx:.14,f:.12,b:.22,w:wB('kn'+Ls,'hk'+Ls,.5)},
      {c:L('hk'+Ls,[0,-.18,.01]),rx:.12,f:.12,b:.13,w:wB('kn'+Ls,'hk'+Ls,.85)},{c:L('hk'+Ls,[0,-.5,.08]),rx:.12,f:.12,b:.12,w:[['hk'+Ls,1]]}];
    a213Loft(M,H1,{n:12,part:'legH',capB:.06});
    // paws: a pad lofted forward, the toes swelling its front edge
    const paw=(j,o,sc)=>{const T=[[-.24,.02,.12,.08,.08],[-.12,.0,.22,.13,.1],[.08,-.02,.27,.13,.1],[.28,-.04,.27,.11,.09],[.42,-.06,.22,.08,.07],[.5,-.07,.14,.05,.05]];
      const R=T.map(([z,y,rx,up,dn])=>({c:L(j,add3(o,[0,y*sc,z*sc])),N:[0,0,1],rx:rx*sc,f:up*sc,b:dn*sc,w:[[j,1]],push:(a,si,co)=>z>.2&&co>-.2?.07*Math.pow(Math.abs(Math.cos(si*4.6)),3):0}));
      a213Loft(M,R,{n:10,part:'paw',capA:.04,capB:.04})};
    paw('pw'+Ls,[0,-.02,.08],1);paw('hk'+Ls,[0,-.47,.18],.92)});
  // ---- the tail: a heavy brush curving down ----
  {const t=['t0','t1','t2','t3'].map(P),tip=L('t3',[0,0,-.55]),root=L('t0',[0,0,.42]);
    const R=[{c:root,rx:.2,f:.2,b:.2,w:[['hips',1]]},{c:t[0],rx:.22,f:.24,b:.22,w:wB('hips','t0',.6)},{c:lerp3(t[0],t[1],.5),rx:.26,f:.28,b:.26,w:[['t0',1]]},{c:t[1],rx:.3,f:.3,b:.3,w:wB('t0','t1',.5)},
      {c:lerp3(t[1],t[2],.5),rx:.32,f:.32,b:.32,w:[['t1',1]]},{c:t[2],rx:.3,f:.3,b:.3,w:wB('t1','t2',.5)},{c:lerp3(t[2],t[3],.5),rx:.26,f:.26,b:.26,w:[['t2',1]]},{c:t[3],rx:.2,f:.2,b:.2,w:wB('t2','t3',.5)},
      {c:lerp3(t[3],tip,.55),rx:.13,f:.13,b:.13,w:[['t3',1]]},{c:tip,rx:.04,f:.04,b:.04,w:[['t3',1]]}];
    a213Loft(M,R,{n:10,part:'tail',capB:.05})}
  // ---- ears: tall cupped triangles on their own joints ----
  [-1,1].forEach(s=>{const j=s>0?'earL':'earR',T=[[-.08,.2,.07],[.12,.21,.07],[.34,.15,.055],[.54,.08,.04],[.7,.02,.02]];
    const R=T.map(([y,rx,th])=>({c:L(j,[0,y,0]),N:sub3(L(j,[0,1,0]),L(j,[0,0,0])),rx,f:th*.7,b:th,w:[[j,1]],push:(a,si,co)=>co>0?-1.4*co*co:0}));
    a213Loft(M,R,{n:8,part:'ear',capB:.04,X:sub3(L(j,[-1,0,0]),L(j,[0,0,0]))})});
  cgOrient(M);let S=cgSub(M);
  // ---- sculpt: vertebra knobs down the back, the brow ridge and the cheekbones, the jaw's hinge ----
  const hd=P('head');
  cgSculpt(S,{torso:1},(x,y,z,nn)=>{if(nn[1]<.55||z>.9||z<-2.4)return 0;const k=Math.pow(Math.abs(Math.cos((z+2.4)/.3*Math.PI)),6);return .045*k*Math.max(0,nn[1]-.55)/.45*Math.exp(-x*x/.012)});
  cgSculpt(S,{head:1},(x,y,z,nn)=>{const q=[x-hd[0],y-hd[1],z-hd[2]];let d=0;
    [-1,1].forEach(s=>{d+=.05*Math.exp(-(Math.pow((q[0]-s*.3)/.12,2)+Math.pow((q[1]-.34)/.08,2)+Math.pow((q[2]-.3)/.16,2)));   // brow ridges over the eyes
      d+=.04*Math.exp(-(Math.pow((q[0]-s*.44)/.1,2)+Math.pow((q[1]-.02)/.1,2)+Math.pow((q[2]+.02)/.2,2)));   // cheekbones
      d-=.035*Math.exp(-(Math.pow((q[0]-s*.36)/.08,2)+Math.pow((q[1]-.2)/.07,2)+Math.pow((q[2]-.36)/.09,2)))});   // the socket under the ridge
    d+=.03*Math.exp(-(q[0]*q[0]/.02+Math.pow((q[1]-.36)/.06,2)+Math.pow((q[2]-.62)/.2,2)));return d});   // the bony bridge of the muzzle
  S.N=null;const N=cgNormals(S);S.N=N;
  // a grid of the smoothed vertices: nearest-vertex lookups for kit weights, normals and eye seats
  const GR=new Map(),gk=(a,b,c)=>a+','+b+','+c,cs=.3;S.V.forEach((v,i)=>{const k=gk(Math.floor(v[0]/cs),Math.floor(v[1]/cs),Math.floor(v[2]/cs));let q=GR.get(k);if(!q)GR.set(k,q=[]);q.push(i)});
  const part=new Array(S.V.length);S.F.forEach(f=>f.v.forEach(i=>{if(part[i]==null)part[i]=f.part}));
  const near=(p,parts)=>{let best=-1,bd=1e9;const a=Math.floor(p[0]/cs),b=Math.floor(p[1]/cs),c=Math.floor(p[2]/cs);
    for(let r=1;r<4&&best<0;r++)for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)for(let k=-r;k<=r;k++){const q=GR.get(gk(a+i,b+j,c+k));if(!q)continue;q.forEach(vi=>{if(parts&&!parts[part[vi]])return;const v=S.V[vi],d=(v[0]-p[0])**2+(v[1]-p[1])**2+(v[2]-p[2])**2;if(d<bd){bd=d;best=vi}})}return best};
  const wTop=a=>{const L=[];for(let j=3;j<a.length;j++)if(a[j]>.02)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let t=0;for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];t+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=t||1;if(!t)sw[0]=1;return [si,sw]};
  const wName=a=>{let b=0,bw=-1;for(let j=3;j<a.length;j++)if(a[j]>bw){bw=a[j];b=j-3}return B.O[b]};
  // a point on the skin: the ray from o along d against the chosen parts; normal and weights from the nearest vertex
  const surf=(o,d,parts)=>{const h=cgRay(S,o,nrm3(d),parts);if(!h)return null;const vi=near(h,parts);return {p:h,n:N[vi],a:S.V[vi],vi}};
  // ---- the eyes: sockets painted into the skin, a lens each on the bone under it ----
  const EY=[],eyeAt=(o,d,parts,r)=>{const h=surf(o,d,parts);if(h)EY.push({p:h.p,n:h.n,r:r*1.3,bn:wName(h.a)})};
  const TP=(z,th,sd)=>{const [cy]=a213Tor(z);return [[0,cy,z],[sd*Math.sin(th),Math.cos(th),0]]};
  [-1,1].forEach(sd=>{const Ls=sd>0?'L':'R';
    [[-.12,.6,.085],[.36,.56,.1],[.84,.64,.085],[.1,2.2,.07],[.62,2.18,.08],[-.58,1.25,.07],[-2.28,1.0,.1],[-2.12,1.52,.08],[-1.72,.5,.07],[1.85,2.25,.075],[1.25,1.9,.07]].forEach(([z,th,r])=>{const [o,d]=TP(z,th,sd);eyeAt(o,d,{torso:1},r)});
    const sh=P('sh'+Ls),el=P('el'+Ls),hp=P('hp'+Ls);
    eyeAt(add3(sh,[0,-.4,.05]),[sd,-.05,.35],{legF:1},.1);eyeAt(lerp3(el,P('pw'+Ls),.4),[sd*.4,0,1],{legF:1},.06);eyeAt(add3(hp,[0,-.38,.1]),[sd,0,-.25],{legH:1},.09);
    // the face: the wolf's own eye under the brow ridge, two smaller ones trailing down the muzzle
    [[.34,.18,[sd*.86,.42,.3],.085],[.66,.06,[sd*.95,.25,.15],.055],[.94,.0,[sd*.95,.2,.1],.045]].forEach(([z,y,d,r])=>eyeAt(L('head',[0,y,z]),d,{head:1},r))});
  eyeAt(L('t1',[0,.05,-.25]),[0,1,-.2],{tail:1},.075);
  // ---- paint (vertex colour, flowing per corner) ----
  const T=new THREE.Color(),U=new THREE.Color(),hx=h=>new THREE.Color(h),K={};for(const k in C)K[k]=hx(C[k]);
  const SK=EY.concat([{p:L('brow',ARG213.browP),r:.2}]),sock=(p,c)=>{for(const E of SK){const d=Math.hypot(p[0]-E.p[0],p[1]-E.p[1],p[2]-E.p[2]);if(d<E.r*2.2){c.lerp(K.sock,1-a213SS(E.r*1.0,E.r*1.5,d));const rr=Math.abs(d-E.r*1.65)/(E.r*.3);if(rr<1)c.lerp(K.rim,(1-rr)*.5)}}};
  const fur=(c,p,m,k)=>{const v=n3Sn(p[0]*.8,p[1]*.8,p[2]*.25,6,3);c.multiplyScalar(1+(v-.5)*(k||.14))};
  const paint=m=>{const p=[m.x,m.y,m.z],c=T,ny=m.ny;
    if(m.part==='torso'||m.part==='tail'){c.copy(K.flank).lerp(K.back,a213SS(.1,.75,ny)).lerp(K.belly,a213SS(-.25,-.8,ny));
      const mane=m.part==='torso'?a213SS(1.0,1.6,m.z):0;if(mane)c.lerp(K.mane,mane*a213SS(-.6,.1,ny)*.85);
      if(ny>.15&&m.part==='torso'){const v=n3Sn(m.x*1.4,m.y*1.4,m.z*1.1,3,11);c.lerp(K.moss,a213SS(.58,.72,v)*.55*a213SS(.15,.5,ny)*(1-mane))}
      if(m.part==='torso'){const w=a213Win(p);if(w>0){const th=a213Th(p);U.copy(K.mem).lerp(K.mem2,.35+.3*Math.sin(m.z*9+th*3));c.lerp(K.rim,a213SS(0,.25,w)).lerp(U,a213SS(.2,.55,w))}
        // the bony knobs of the spine show pale through the fur
        if(ny>.8&&m.z<.9&&m.z>-2.4&&Math.abs(m.x)<.09){const k=Math.pow(Math.abs(Math.cos((m.z+2.4)/.3*Math.PI)),6);c.lerp(K.bone,k*.6)}}
      if(m.part==='tail')c.lerp(K.mane,a213SS(-2.8,-4.2,m.z)*.6);
      fur(c,p,m)}
    else if(m.part==='head'){const q=[m.x-hd[0],m.y-hd[1],m.z-hd[2]];c.copy(K.flank).lerp(K.back,a213SS(0,.6,ny)).lerp(K.belly,a213SS(-.2,-.7,ny)*.6);
      // the bare skull over the muzzle and the brow, a ragged edge into the fur
      const e=.07*(n3Sn(q[0]*3,q[1]*3,q[2]*3,7,5)-.5),bz=a213SS(.26,.46,q[2]+e)*a213SS(.38,.72,ny+e*2);c.lerp(K.bone,bz*.88);if(bz>.2)c.lerp(K.bone2,a213SS(.8,1,ny)*a213SS(.7,1.3,q[2])*.3);
      // the nose, the lips and the palate (under the muzzle)
      c.lerp(K.nose,a213SS(1.54,1.66,q[2]));if(q[2]>.3){c.lerp(K.gum,a213SS(-.35,-.75,ny));c.lerp(K.sock,a213SS(-.05,-.3,ny)*(1-a213SS(-.35,-.75,ny))*.7)}
      fur(c,p,m,.08)}
    else if(m.part==='jaw'){const ny2=ny;c.copy(K.flank).lerp(K.belly,a213SS(-.2,-.8,ny2)*.7);c.lerp(K.gum,a213SS(.1,.5,ny2));c.lerp(K.tongue,a213SS(.6,.9,ny2)*(1-a213SS(.06,.14,Math.abs(m.x)))*.8);fur(c,p,m,.08)}
    else if(m.part==='legF'||m.part==='legH'){c.copy(K.flank).lerp(K.back,a213SS(.2,.8,ny)*.6).lerp(K.belly,a213SS(-.3,-.8,ny)*.4);c.lerp(K.mud,a213SS(1.3,.35,m.y));fur(c,p,m)}
    else if(m.part==='paw'){c.copy(K.mud).lerp(K.claw,a213SS(-.3,-.8,ny)*.8)}
    else if(m.part==='ear'){c.copy(K.back).lerp(K.earIn,a213SS(.2,.75,m.nz)*.8)}
    else c.copy(K.flank);
    if(m.part!=='paw')sock(p,c);return c.getHex()};
  S.shade=cgShade(S,{cav:.55,blur:2,hk:.3,dk:.2,min:.55});
  cgEmit(B,S,()=>null,{vcol:paint});
  // ---- kit: everything below is emitted straight into the skinned layers with its own weights and colours ----
  const V3v=(p,w,rgb,k)=>({x:p[0],y:p[1],z:p[2],w,rgb,k:k==null?1:k});
  const triO=(t,a,b,c,ref)=>{const n=cross3(sub3([b.x,b.y,b.z],[a.x,a.y,a.z]),sub3([c.x,c.y,c.z],[a.x,a.y,a.z])),m=[(a.x+b.x+c.x)/3-ref[0],(a.y+b.y+c.y)/3-ref[1],(a.z+b.z+c.z)/3-ref[2]];
    if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0)mdTri(B,t,a,c,b,0);else mdTri(B,t,a,b,c,0)};
  // a tube along pts (radii rad[i]), each ring's vertices weighted by wf(i) and coloured by cf(i)→[r,g,b]; side axis kept steady
  const tube=(t,pts,rad,sides,wf,cf,o)=>{o=o||{};const Rg=[];let up=o.up||[0,1,0];for(let i=0;i<pts.length;i++){const tg=nrm3(sub3(pts[Math.min(pts.length-1,i+1)],pts[Math.max(0,i-1)]));
      if(Math.abs(tg[0]*up[0]+tg[1]*up[1]+tg[2]*up[2])>.95)up=[1,0,0];const b=nrm3(cross3(tg,up)),u=nrm3(cross3(b,tg));up=u;const r=rad[i],rx=Array.isArray(r)?r[0]:r,ry=Array.isArray(r)?r[1]:r,ring=[],w=wf(i),rgb=cf(i);
      for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2;ring.push(V3v(add3(add3(pts[i],mul3(b,Math.cos(a)*rx)),mul3(u,Math.sin(a)*ry)),w,rgb))}Rg.push({ring,c:pts[i]})}
    for(let i=0;i<Rg.length-1;i++){const A=Rg[i].ring,Bv=Rg[i+1].ring,ref=mul3(add3(Rg[i].c,Rg[i+1].c),.5);for(let k=0;k<sides;k++){const j=(k+1)%sides;triO(t,A[k],A[j],Bv[j],ref);triO(t,A[k],Bv[j],Bv[k],ref)}}
    if(o.capA!==false){const r0=Rg[0],c0=V3v(r0.c,r0.ring[0].w,r0.ring[0].rgb),ref=Rg[1].c;for(let k=0;k<sides;k++)triO(t,r0.ring[k],r0.ring[(k+1)%sides],c0,ref)}
    const rl=Rg[Rg.length-1];if(o.capB!==false&&rl.ring.length&&rad[rad.length-1]>1e-4){const cl=V3v(rl.c,rl.ring[0].w,rl.ring[0].rgb),ref=Rg[Rg.length-2].c;for(let k=0;k<sides;k++)triO(t,rl.ring[k],rl.ring[(k+1)%sides],cl,ref)}};
  const rgb=h=>{const q=new THREE.Color(h);return [q.r,q.g,q.b]},mixC=(a,b,t)=>{const q=new THREE.Color(a).lerp(new THREE.Color(b),t);return [q.r,q.g,q.b]};
  const one=j=>wTop((()=>{const a=new Float64Array(3+B.O.length);a[3+B.O.indexOf(j)]=1;return a})());
  // fur clumps: a flattened, tapering blade combed along d, lying on the skin (its root sunk), the tip lifting off a little;
  // each ring takes the weights of the skin under it, so the clump bends with the body; dark at the root, grizzled at the tip
  const clump=(h,d,len,wid,base,tip,o)=>{o=o||{};const n=h.n;let dd=nrm3(sub3(d,mul3(n,(d[0]*n[0]+d[1]*n[1]+d[2]*n[2])*(o.flat==null?.75:o.flat))));
    const sd=nrm3(cross3(n,dd)),lift=o.lift==null?.16:o.lift,pts=[],rad=[],ws=[],cs=[],NS=4;
    for(let i=0;i<=NS;i++){const t=i/NS,p=add3(add3(h.p,mul3(dd,len*t)),mul3(n,-.05+len*lift*t*t+(o.arc||0)*Math.sin(Math.PI*t)*len));pts.push(p);
      const r=wid*(1-Math.pow(t,1.3))*(i==0?.8:1);rad.push([r,r*.42]);const vi=near(p,o.parts);ws.push(wTop(S.V[vi>=0?vi:h.vi]));
      const k=.82+.22*(.5*n[1]+.5);cs.push(mixC(base,tip,Math.pow(t,1.4)).map(x=>x*k))}
    // the blade's flat side lies against the skin: its "up" is the skin normal
    tube('c',pts,rad,5,i=>ws[i],i=>cs[i],{up:n,capA:false})};
  // the crest: long clumps along the spine from the back of the skull over the withers, shortening down the back
  const crestAt=(z,y0)=>{const [cy,rx,up]=a213Tor(z);return surf([0,cy,z],[0,1,0],{torso:1})};
  for(let k=0;k<16;k++){const z=2.6-k*.2;let h;if(z>1.9){h=surf([0,3.2+(z-2.3)*.6,z],[0,1,-.2],{torso:1})}else h=crestAt(z);if(!h)continue;
    const L0=k<3?.75:k<9?.95-.04*(k-3):.7-.06*(k-9);[0,1,-1].forEach(sd=>{if(sd&&k%2)return;const hh=sd?surf([0,h.p[1]-.3,z-.08],[sd*.35,1,0],{torso:1}):h;if(!hh)return;
      clump(hh,[sd*.3,.3,-1],L0*(sd?.8:1),.17,C.mane,mdMix(C.grz,C.mane,.45),{lift:.24,arc:.04,parts:{torso:1}})})}
  // the mane: rows of clumps combed back and down over the neck and shoulders, its lower edge a ragged fringe
  const rn=svRng(2120);
  [-1,1].forEach(sd=>{for(let row=0;row<4;row++)for(let k=0;k<5;k++){const z=2.55-k*.3-row*.08+(rn()-.5)*.14,th=.55+row*.38+(k%2)*.1+(rn()-.5)*.16,[cy]=a213Tor(Math.min(z,1.82));
      const o=z>1.85?[0,3.12+(z-2.3)*.6,z]:[0,cy,z],h=surf(o,[sd*Math.sin(th),Math.cos(th),z>1.85?.3:0],{torso:1});if(!h)continue;
      clump(h,[sd*(.15+rn()*.2),-.3-row*.15-rn()*.1,-1],(.55+.25*rn())*(1-.08*row),.15+.04*rn(),mdMix(mdMix(C.mane,C.back,.3*rn()),C.flank,[0,.2,.5,.75][row]),mdMix(mdMix(C.grz,C.mane,.25),C.flank,[0,.2,.4,.6][row]),{lift:.18+.08*rn(),parts:{torso:1}})}
    // cheek ruffs behind the jaw, combed back
    for(let k=0;k<4;k++){const h=surf(L('head',[0,-.05,-.25+k*.08]),[sd*.95,-.2-.18*k,-.3],{head:1});if(h)clump(h,[sd*.4,-.4,-1],.42-.04*k,.12,C.mane,C.grz,{lift:.25,parts:{head:1,torso:1}})}
    // britches: long fur down the back of the thighs
    const hp=P('hp'+(sd>0?'L':'R'));for(let k=0;k<3;k++){const h=surf(add3(hp,[0,-.15-k*.22,0]),[sd*.5,0,-1],{legH:1});if(h)clump(h,[0,-1,-.45],.5-.06*k,.15,C.mane,C.grz,{lift:.2,parts:{legH:1}})}
    // a tuft at the back of each elbow
    {const el=P('el'+(sd>0?'L':'R')),h=surf(add3(el,[0,.25,0]),[sd*.2,0,-1],{legF:1});if(h)clump(h,[0,-.8,-.6],.36,.11,C.mane,C.grz,{lift:.2,parts:{legF:1}})}});
  // the throat ruff, hanging down under the neck
  for(let k=0;k<5;k++){const x=(k-2)*.17,h=surf([x,3.0,2.25-Math.abs(k-2)*.12-(k%2)*.12],[x*.8,-1,.2],{torso:1});if(h)clump(h,[x*.5,-1,-.4],.55-.08*Math.abs(k-2)+(k%2)*.08,.17,mdMix(C.flank,C.mane,.5),mdMix(C.belly,C.flank,.5),{lift:.14,parts:{torso:1}})}
  // the tail brush: clumps all along the tail combed toward the tip, longest at the brush
  {const tj=['t0','t1','t2','t3'];for(let k=0;k<14;k++){const j=tj[Math.min(3,1+(k>>2))],a=(k%4)/4*Math.PI*2+(k>>2)*.6+.4,dir=L(j,[Math.cos(a),Math.sin(a)*.8-.2,0]),o=P(j),h=surf(add3(o,mul3(sub3(L(j,[0,0,-.25]),o),1)),sub3(dir,o),{tail:1});
      if(h){const tipD=sub3(L(j,[0,-.15,-1]),o);clump(h,tipD,.55+.08*(k>>2),.15,mdMix(C.back,C.mane,.5),C.grz,{lift:.14,parts:{tail:1}})}}}
  // ---- the ribs bared in each flank, the membrane between them glowing with amber veins (the g layer = R.vein) ----
  [-1,1].forEach(sd=>{[-.18,.12,.42,.72].forEach((z0,k)=>{const pts=[],ws=[];for(let q=0;q<=7;q++){const th=.95+q*.135,z=z0-.09*(q-3.5)/3.5+.012*Math.sin(q*1.3+k),[o,d]=TP(z,th,sd),h=surf(o,d,{torso:1});if(!h)continue;pts.push(add3(h.p,mul3(h.n,.02)));ws.push(wTop(h.a))}
      if(pts.length>3)tube('c',pts,pts.map((_,i)=>.06*(1-.55*Math.pow(Math.abs(i-(pts.length-1)/2)/((pts.length-1)/2),2))),5,i=>ws[i],i=>mixC(0x4a4030,C.bone,.25+.6*Math.sin(i/(pts.length-1)*Math.PI)))});
    [-.03,.27,.57].forEach((z0,k)=>{const pts=[],ws=[];for(let q=0;q<=9;q++){const th=1.0+q*.1,z=z0-.07*(q-4.5)/4.5+.025*Math.sin(q*.9+k*2),[o,d]=TP(z,th,sd),h=surf(o,d,{torso:1});if(!h)continue;pts.push(add3(h.p,mul3(h.n,.008)));ws.push(wTop(h.a))}
      if(pts.length>3)tube('g',pts,pts.map((_,i)=>.017*(1-.5*Math.abs(i-4.5)/4.5)),4,i=>ws[i],()=>[1,.78,.42])})});
  // ---- antlers: one bent beam each and three tines, dark at the root to pale at the tips ----
  [-1,1].forEach(s=>{const j=s>0?'antL':'antR',w=one(j),beam=[[0,-.05,0],[s*.22,.35,-.18],[s*.5,.78,-.3],[s*.78,1.22,-.26],[s*.94,1.62,-.06],[s*1.0,1.92,.22]].map(v=>L(j,v));
    const col=t=>mixC(0x3a3226,C.bone2,Math.pow(t,.8));tube('c',beam,[.11,.1,.085,.068,.05,.012],6,()=>w,i=>col(i/5));
    [[1,[s*.05,.25,1],.55],[2,[s*.3,.55,.85],.62],[3,[-s*.35,.9,.35],.5],[4,[s*.5,.6,.25],.36]].forEach(([i,d,len])=>{const a=beam[i],dd=nrm3(sub3(L(j,d),L(j,[0,0,0]))),pts=[];
      for(let q=0;q<=4;q++){const t=q/4;pts.push(add3(add3(a,mul3(dd,len*t)),[0,.12*len*t*t,0]))}tube('c',pts,pts.map((_,q)=>.055*Math.pow(1-q/4,1.15)+.002),5,()=>w,q=>col(.35+.6*q/4))})});
  // ---- teeth and claws ----
  {const cone=(t,a,d,len,r,w,c0,c1,curl)=>{const pts=[];for(let q=0;q<=3;q++){const u=q/3;pts.push(add3(add3(a,mul3(d,len*u)),mul3(curl||[0,0,0],len*u*u)))}tube(t,pts,pts.map((_,q)=>r*Math.pow(1-q/3,1.1)+.002),5,()=>w,q=>mixC(c0,c1,q/3))};
    const wH=one('head'),wJ=one('jaw');
    [-1,1].forEach(s=>{for(let k=0;k<5;k++){const z=.62+k*.2,h=surf(L('head',[0,-.02,z]),[s*.9,-.6,0],{head:1});if(h)cone('c',add3(h.p,[0,.02,0]),[-s*.08,-1,0],.09+.01*k,.026,wH,0x8a7c60,C.bone2)}
      {const h=surf(L('head',[0,-.02,1.32]),[s*.85,-.6,0],{head:1});if(h)cone('c',add3(h.p,[0,.04,0]),nrm3([-s*.05,-1,.12]),.3,.045,wH,0x8a7c60,C.bone2,[0,0,.08])}
      [[.45,.21],[.65,.19],[.85,.17],[1.0,.15]].forEach(([z,x])=>{const h=surf(L('jaw',[s*x,.4,z]),[0,-1,0],{jaw:1});if(h)cone('c',h.p,[-s*.08,1,0],.08,.022,wJ,0x8a7c60,C.bone2)});
      {const h=surf(L('jaw',[s*.12,.4,1.16]),[0,-1,0],{jaw:1});if(h)cone('c',h.p,nrm3([s*.12,1,.15]),.24,.04,wJ,0x8a7c60,C.bone2,[0,0,-.05])}});
    // claws: long, black, curving down from the front of each pad
    [-1,1].forEach(s=>{const Ls=s>0?'L':'R';[['pw'+Ls,[0,-.02,.08],1],['hk'+Ls,[0,-.47,.18],.92]].forEach(([j,o,sc])=>{const w=one(j);[-1.5,-.5,.5,1.5].forEach(c=>{
      const t0=L(j,add3(o,[c*.1*sc,-.02*sc,.18*sc])),t1=L(j,add3(o,[c*.112*sc,-.03*sc,.42*sc-Math.abs(c)*.05*sc])),t2=L(j,add3(o,[c*.118*sc,-.06*sc,.52*sc-Math.abs(c)*.05*sc]));
      tube('c',[t0,lerp3(t0,t1,.5),t1,t2],[.06,.075,.065,.035].map(r=>[r*sc,r*sc*.8]),6,()=>w,q=>mixC(C.mud,C.claw,q/3*.5));
      const d=nrm3(sub3(t2,t1));cone('m',sub3(t2,mul3(d,.02)),nrm3(add3(d,[0,-.25,0])),.28*sc,.04*sc,w,C.claw,0x2a2420,[0,-.2*sc,0])})})})}
  // ---- eyelids: a dark, flattened rim round every eye on the skin (skinned with the spot under it); the lens blinks inside it ----
  {const lid=(p,n,r,w,sx,sy)=>{const N0=new THREE.Vector3(...n).normalize(),Y=new THREE.Vector3(0,1,0).sub(N0.clone().multiplyScalar(N0.y));if(Y.lengthSq()<1e-4)Y.set(0,0,1);Y.normalize();const X=new THREE.Vector3().crossVectors(Y,N0),pts=[],S=10;
      for(let i=0;i<=S;i++){const a=i/S*Math.PI*2,q=new THREE.Vector3(...p).addScaledVector(X,Math.sin(a)*r*sx).addScaledVector(Y,Math.cos(a)*r*sy).addScaledVector(N0,r*.06);pts.push([q.x,q.y,q.z])}
      tube('c',pts,pts.map(()=>[r*.22,r*.14]),4,()=>w,(i)=>rgb(0x1a1410),{up:n,capA:false,capB:false})};
    EY.forEach(E=>{const vi=near(E.p);lid(E.p,E.n,E.r,wTop(S.V[vi]),1.0,.8)});
    {const bq=new THREE.Quaternion().setFromEuler(new THREE.Euler(ARG213.browR,0,0)),nb=new THREE.Vector3(0,0,1).applyQuaternion(bq),fm=F.brow.m,nw=nb.clone().transformDirection(fm),bs=ARG213.browS;
      lid(L('brow',ARG213.browP),[nw.x,nw.y,nw.z],.2,one('brow'),bs[0]/.2*1.4,bs[1]/.2*1.32)}}
  // ---- bake, measure ----
  const G=mdBake(B);let tri=0;for(const t in G)tri+=G[t].attributes.position.count/3;ARG213.tris=Math.round(tri);ARG213.ms=Math.round(performance.now()-t0);
  return ARG213.geo={G,O:B.O,EY}}
// ---------------- an eye: one lens with its iris graded and its slit pupil painted in (vertex colours × the shared iris colour) ----------------
function arg213Lens(){return svG('a213lens',()=>{const pos=[],col=[],R=3,S=16,pt=(r,a)=>{const x=Math.sin(a)*r,y=Math.cos(a)*r,z=Math.sqrt(Math.max(0,1-r*r))*.9+.1;return [x,y,z,r,a]},
    cl=(p)=>{const r=p[3],ax=Math.abs(Math.sin(p[4]));if(r<.01||(ax<.01&&r<.9))return [.03,.015,.01];const k=1.3-.55*r;return [k,k*(.9-.2*r),k*(.62-.3*r)]};
    const tri=(a,b,c)=>{const n=cross3(sub3(b,a),sub3(c,a)),m=sub3([(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3],[0,0,.3]);if(n[0]*m[0]+n[1]*m[1]+n[2]*m[2]<0){const t=b;b=c;c=t}
      [a,b,c].forEach(p=>{pos.push(p[0],p[1],p[2]);const q=cl(p.length>3?p:[p[0],p[1],p[2],1,1]);col.push(q[0],q[1],q[2])})};
    for(let i=0;i<R;i++)for(let k=0;k<S;k++){const r0=i/R,r1=(i+1)/R,a0=k/S*Math.PI*2,a1=(k+1)/S*Math.PI*2;if(i==0)tri(pt(0,0),pt(r1,a0),pt(r1,a1));else{tri(pt(r0,a0),pt(r1,a0),pt(r1,a1));tri(pt(r0,a0),pt(r1,a1),pt(r0,a1))}}
    // the back of the lens (unseen, but closes it for shadows)
    for(let k=0;k<S;k++){const a0=k/S*Math.PI*2,a1=(k+1)/S*Math.PI*2;tri([0,0,-.05],[Math.sin(a1),Math.cos(a1),.1],[Math.sin(a0),Math.cos(a0),.1])}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return g})}
// ---------------- the Sovereign build ----------------
function arg213Build(R,e){const Q=arg213Geo();arg213Joints(R);R.root.updateMatrixWorld(true);
  const sk=new THREE.Skeleton(Q.O.map(n=>R.J[n]));
  const mc=svMat(R,0xffffff,{vertexColors:true,skinning:true,roughness:.92,metalness:0,emissive:0x0e0b08,side:THREE.DoubleSide}),mm=svMat(R,0xffffff,{vertexColors:true,skinning:true,roughness:.42,metalness:.3,emissive:0x040404,side:THREE.DoubleSide}),
    mg=new THREE.MeshBasicMaterial({color:ARG.vein,vertexColors:true,skinning:true,fog:false,side:THREE.DoubleSide});mg.userData.c0=ARG.vein;R.glow.push(mg);R.vein=mg;
  arg213Rim(mc);arg213Rim(mm);
  R.v213m=[];[['c',mc],['m',mm],['g',mg]].forEach(([t,mat])=>{const G=Q.G[t];if(!G)return;const sm=new THREE.SkinnedMesh(G,mat);sm.bind(sk);sm.userData.noMerge=1;sm.userData.lpsSkip=1;sm.frustumCulled=false;sm.castShadow=t!=='g';sm.receiveShadow=false;R.root.add(sm);R.v213m.push(sm)});
  R.v213=1;R.no179=1;
  // the eyes on the bones under them (rest pose → the bone's frame), one lens mesh each so each can blink
  const iris=new THREE.MeshBasicMaterial({color:ARG.dim,vertexColors:true,fog:false});iris.userData.c0=ARG.dim;R.glow.push(iris);R.iris=iris;R.eyes=[];
  const lens=arg213Lens(),V3=THREE.Vector3,up=new V3(0,1,0),Mx=new THREE.Matrix4(),Qw=new THREE.Quaternion(),Qb=new THREE.Quaternion();
  Q.EY.forEach((E,i)=>{const J=R.J[E.bn]||R.J.body,n=new V3(...E.n).normalize(),y=up.clone().sub(n.clone().multiplyScalar(n.dot(up)));if(y.lengthSq()<1e-4)y.set(0,0,1);y.normalize();const x=new V3().crossVectors(y,n);
    Mx.makeBasis(x,y,n);Qw.setFromRotationMatrix(Mx);J.getWorldQuaternion(Qb);const p=J.worldToLocal(new V3(...E.p).addScaledVector(n,-E.r*.18));
    const ir=new THREE.Mesh(lens,iris);ir.position.copy(p);ir.quaternion.copy(Qb.invert().multiply(Qw));ir.scale.set(E.r*.82,E.r*.62,E.r*.5);ir.userData.noMerge=1;ir.userData.lpsSkip=1;J.add(ir);
    R.eyes.push({ir,s:E.r,b:((i*2.39)%6)})});
  // the great brow eye: a tall almond in a dark socket on the forehead, its glow sprite for the gaze
  {const J=R.J.brow,big=new THREE.Mesh(lens,iris);big.position.set(...ARG213.browP);big.rotation.x=ARG213.browR;big.scale.set(...ARG213.browS);big.userData.noMerge=1;big.userData.lpsSkip=1;J.add(big);R.big=big;
    R.bigSpr=svSpr(R,'brow',ARG.col,.01,0,0,.12)}
  R.root.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.material!==iris)o.castShadow=true})}
// a dim, cool rim light (recipe 2.6) that cuts his outline out of the dark hollow; chained onto any earlier hook, own cache key
var ARG213_RIM={value:new THREE.Color(0x3a4a42)};
function arg213Rim(m){const ob=m.onBeforeCompile,ck=m.customProgramCacheKey,P=THREE.Material.prototype;
  m.onBeforeCompile=(sh,rn)=>{if(ob&&ob!==P.onBeforeCompile)ob.call(m,sh,rn);sh.uniforms.uRim213=ARG213_RIM;
    sh.fragmentShader='uniform vec3 uRim213;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=uRim213*pow(1.-abs(dot(normal,normalize(vViewPosition))),2.4);')};
  m.customProgramCacheKey=()=>(ck&&ck!==P.customProgramCacheKey?ck.call(m):'')+'|rim213';m.needsUpdate=true}
// ---------------- motion ----------------
// the gait: each paw is planted for its stance (moving back under the body at the body's speed, so it stays put on the ground)
// and swings forward with an eased lift; a lateral walk (LH, LF, RH, RF) turns into a trot (diagonal pairs) as he speeds up
function arg213Loco(e,S,O,dt,now){const t=now/1000,v=Math.max(0,S.spd||0),a=a213SS(.05,.7,v),tr=a213SS(2.6,4.4,v),ph2=S.ph>1?1:0;
  const Ls=2.7+.42*v,beta=.64-.1*tr;S.gp=((S.gp||0)+dt*v/Ls)%1000;const g=S.gp,TAU=Math.PI*2;
  // breathing and the idle look-around (smooth sums of slow sines, never a snap); restless in Phase II
  const br=Math.sin(t*(1.25+.5*ph2)),ia=1-a;
  O.body[4]+=.035*br*ia;O.chest[0]+=-.025*br*ia;O.neck[0]+=.03*br*ia;
  const lk=Math.sin(t*.31)+.5*Math.sin(t*.73+1.3),lk2=Math.sin(t*.47+2)+.4*Math.sin(t*1.1);O.neck[1]+=.16*lk*ia;O.head[1]+=.12*lk*ia+.04*lk2;O.head[2]+=.06*lk2*ia;O.neck[0]+=(.05+.08*ph2)*ia;O.head[0]+=-.04*ia;
  O.jaw[0]+=(.05+.06*ph2)*(.6+.4*Math.sin(t*1.9))*ia+.04*a;
  // ears: a slow drift and, now and then, a smooth twitch
  const tw=q=>{const u=(t+q)%5.3;return u<.5?Math.sin(u/.5*Math.PI):0};O.earL[0]+=.06*Math.sin(t*.8)-.3*tw(0);O.earR[0]+=.06*Math.sin(t*.8+1)-.3*tw(2.7);O.earL[2]+=.1*tw(0);O.earR[2]-=.1*tw(2.7);
  // the legs
  const legs=[['L','F',.25+.25*tr],['R','F',.75+.25*tr],['L','H',0],['R','H',.5]],swing=[];
  legs.forEach(([s,fh,off])=>{const u=((g+off)%1+1)%1,L=fh==='F'?2.45:2.55,tm=Math.atan(beta*Ls*.5/L)*a;let th,lf=0;
    if(u<beta){th=Math.atan((-1+2*u/beta)*Math.tan(tm))}else{const q=(u-beta)/(1-beta),e=q*q*(3-2*q);th=tm-2*tm*e;lf=Math.sin(Math.PI*q)*a;swing.push(q)}
    if(fh==='F'){O['sh'+s][0]+=th-.12*lf;O['el'+s][0]+=.55*lf;O['pw'+s][0]+=.95*lf}
    else{O['hp'+s][0]+=th-.22*lf;O['kn'+s][0]+=.55*lf;O['hk'+s][0]+=-.75*lf}});
  // the body rides the footfalls: a dip as weight lands (twice a stride), a slight roll and pitch, the shoulders and hips counter-turning
  const st=Math.cos(g*TAU*2);O.body[4]+=(-.05+.05*st)*a*(1+.6*tr);O.body[2]+=.025*Math.sin(g*TAU)*a;
  O.chest[1]+=.05*Math.sin(g*TAU)*a;O.hips[1]+=-.06*Math.sin(g*TAU+.4)*a;O.body[0]+=.04*tr;
  // the head held steady against the bob (and carried low and forward at a trot)
  O.neck[0]+=(-.03*st*a)+.1*tr;O.head[0]+=.03*st*a-.06*tr;O.head[1]+=-.04*Math.sin(g*TAU)*a;
  // the tail: a slow sway at rest, swinging with the stride when moving
  ['t0','t1','t2','t3'].forEach((n,k)=>{O[n][1]+=(Math.sin(t*1.1-k*.6)*.1*ia+Math.sin(g*TAU-k*.8)*.12*a)*(1+.3*k);O[n][0]+=-.03*k*a+.02*Math.sin(t*.9-k)*ia})}
// every pose change eased by a critically damped follow (rotations and offsets of each joint); the move's track is sampled
// ARG213.lead s ahead, which cancels the follow's lag (2/ω), so a strike still reaches its pose on the hit's beat
function arg213Smooth(e,S,dt){const R=S.R,O=S.O,w=ARG213.w;if(!S.sm213)S.sm213={};const M=S.sm213,snap=!(dt>0)||dt>.25;
  for(const k in O){const o=O[k],q=M[k]||(M[k]={x:o.slice(),v:[0,0,0,0,0,0]});if(snap){for(let i=0;i<6;i++){q.x[i]=o[i];q.v[i]=0}continue}
    for(let i=0;i<6;i++){const a=w*w*(o[i]-q.x[i])-2*w*q.v[i];q.v[i]+=a*dt;q.x[i]+=q.v[i]*dt}
    const g=R.J[k],r0=g.userData.r0,p0=g.userData.p0,x=q.x;g.rotation.set(r0.x+x[0],r0.y+x[1],r0.z+x[2]);g.position.set(p0.x+x[3],p0.y+x[4],p0.z+x[5])}}
if(ARG213.on&&SVB[0]){const B=SVB[0];B.build=arg213Build;argBuild146=arg213Build;
  B.spr=Object.assign({},B.spr||{},{earL:[70,9,.6],earR:[70,9,.6],jaw:[90,12,.2],t0:[42,7,1.1],t1:[30,5.5,1.4],t2:[24,4.4,1.7],t3:[20,3.6,2],antL:[160,20,0],antR:[160,20,0]});
  const l0=B.loco;B.loco=function(e,S,O,dt,now){if(!S.R||!S.R.v213)return l0&&l0.apply(this,arguments);arg213Loco(e,S,O,dt,now)};
  const p0=B.post;B.post=function(e,S,dt,now){try{if(S.R&&S.R.v213)arg213Smooth(e,S,dt)}catch(err){if(!ARG213.err++)console.error('v213 smooth',err)}p0&&p0.apply(this,arguments)}}
ARG213.err=0;
// the stagger: he drops low but keeps his head (and antlers) off the floor
if(ARG213.on&&typeof ARGP!='undefined'&&ARGP.stag){const P=ARGP.stag;P.body=[.34,0,.28,0,-.85,0];P.neck=[.28,0,.22];P.head=[.05,0,.3];if(SVB[0])SVB[0]._pc=null}
// the track lead: Argus samples his move a little ahead of its clock while the follow eases toward it
{const f=svApply;svApply=function(e,dt,now){const S=e&&e.sv;if(!S||S.i!==0||!S.R||!S.R.v213||!S.trk||!ARG213.on)return f.apply(this,arguments);const t0=S.tt;S.tt=t0+ARG213.lead;try{return f.apply(this,arguments)}finally{S.tt=t0}}}
