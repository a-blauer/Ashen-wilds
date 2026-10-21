// ================= v112: the Rat, a playable race for the Warrior =================
// hero.look.race: 0 human (default, every old save) · 1 rat (Warrior only; other classes always build human).
// The rat uses the hero skeleton, retargeted in place (rest pose moved to the rat proportions and re-bound), plus a
// chain of tail bones, so every animation, grip, mount pose and worn item keeps working:
//  * body: its own torso / arm / leg / foot rings (same ring count, heights and parts as the human rings), so every
//    armour shell, which is built from those rings, takes the rat's shape; v99 proportion preset 'rat' (narrow sloped
//    shoulders, wide hips, haunches, long feet) with a forward shear of the spine, chest and neck (the hunch).
//  * head: skull and snout are one loft (no separate jaw); eyes on the skull surface; cupped ears that always stand.
//  * paws: a flat palm with four two-jointed fingers and a thumb nub grown out of it; claws. Bare feet get toes.
//  * tail: part of the skinned body mesh, weighted along a chain of tail bones (tl0…tl10) that sway with movement.
//  * helmets: built for the rat skull (ratHelm): a dome shaped to the skull, ear openings with the ears through them,
//    eye openings framed by brow and cheek guards, a snout guard on closed helms; hoods and masks likewise.
//  * a slight crouch (hips flexed, knees bent, feet flat) is layered on every animation except riding.
// Look fields reused for the rat: skin = fur colour, eye = eye glint colour. Hair, face and body sex are ignored.
var RAT={on:false,C:null,bare:false,feet:false};
var RAT_FUR=['#5e5248','#3a3230','#77695c','#8a6a4a','#a89c8e','#e6e0d6'];
var RAT_EYE=['#c8301c','#e0a020','#78d040','#9a40e0','#e8e8f0'];
function ratCols(L){const f=mdC(L.skin),e=mdC(L.eye);
  return {FUR:f,FURD:mdSh(f,.66),FURL:mdMix(f,0xe8e0d4,.22),BELLY:mdMix(f,0xd8ccbc,.38),PINK:0xb88a86,PINKD:0x8a6460,TOOTH:0xd8c890,CLAW:0x1e1a16,EYE:e,MOUTH:0x2a2220}}
// ---------------- skeleton: hero bones + tail chain ----------------
// tail path [x, y, z, radius] from the root at the lower back, sweeping out behind and down to the ground
var RAT_TP=[[0,.62,-.07,.052],[0,.6,-.15,.043],[0,.56,-.25,.035],[.008,.49,-.37,.029],[.02,.39,-.48,.025],[.035,.27,-.58,.021],[.05,.16,-.66,.018],
  [.065,.08,-.74,.015],[.08,.045,-.83,.012],[.1,.034,-.92,.01],[.12,.036,-1.0,.008],[.145,.05,-1.07,.006],[.17,.07,-1.12,.003]];
var RAT_TB=[];for(let i=0;i<=10;i++)RAT_TB.push('tl'+i);
var HBR=Object.assign({},HB);RAT_TB.forEach((n,i)=>{const p=RAT_TP[i];HBR[n]=[i?RAT_TB[i-1]:'pelvis',p[0],p[1],p[2]]});
// the rat's rest pose: v99 preset + hunch (forward shear: z += k·y in the spine, chest and neck)
var RAT_PL=null;
function ratPlan(){if(RAT_PL)return RAT_PL;const S=AW_PROP99;
  S.PRE.rat={pelvis:[1,1,1],spine:[.95,.98,1],chest:[.8,1,.92],neck:[1,.7,1],head:.86,arm:[1.12,.95],hand:1.32,leg:[1.14,1.04],foot:1,cape:[1.15,1]};
  S.plans.delete(HBR);const pl=S.plan(HBR,'rat'),SH={spine:.24,chest:.46,neck:.5};
  for(const n in SH)pl.M[n][7]=SH[n];
  const mul=(M,x,y,z)=>[M[0]*x+M[1]*y+M[2]*z,M[3]*x+M[4]*y+M[5]*z,M[6]*x+M[7]*y+M[8]*z],a=pl.abs;
  pl.names.forEach(n=>{const p=HBR[n][0];if(!p||!pl.N[p]){for(let j=0;j<3;j++)pl.N[n][j]=a[n][j];return}
    const o=mul(pl.M[p],a[n][0]-a[p][0],a[n][1]-a[p][1],a[n][2]-a[p][2]);for(let j=0;j<3;j++)pl.N[n][j]=pl.N[p][j]+o[j]});
  let lift=0;['lh2','rh2'].forEach(f=>{const o=mul(pl.M[f],0,-a[f][1],0);lift=Math.max(lift,-(pl.N[f][1]+o[1]))});
  pl.names.forEach(n=>{pl.N[n][1]+=lift});pl.lift=lift;pl.hip=pl.N.pelvis[1];
  // crouch: hip flex a, knee bend k, ankle keeps the foot flat; the hips drop by the legs' lost height
  const V=THREE.Vector3,Lt=new V(...pl.N.lh1).distanceTo(new V(...pl.N.lh0)),Ls=new V(...pl.N.lh2).distanceTo(new V(...pl.N.lh1)),A=.3,K=.58;
  pl.crouch={a:-A,k:K,an:-(K-A),drop:Lt*(1-Math.cos(A))+Ls*(1-Math.cos(K-A))};
  return RAT_PL=pl}
// move a hero model's skeleton to the rat (or back to the human) rest pose and re-bind its body to it
function ratRig(h,rat){
  const b=h&&h.bones,body=huBody(h);if(!b||!body||!body.skeleton)return;
  const S=AW_PROP99,T=rat?HBR:HB,pl=rat?ratPlan():(S.on?S.plan(HB,'real'):null);
  if(rat){RAT_TB.forEach(n=>{if(b[n])return;const bn=new THREE.Bone();b[n]=bn;b[HBR[n][0]].add(bn)})}
  else if(b.tl0){if(b.tl0.parent)b.tl0.parent.remove(b.tl0);RAT_TB.forEach(n=>delete b[n])}
  const names=Object.keys(T),arr=names.map(n=>b[n]);
  names.forEach(n=>{const P=pl?pl.N[n]:[T[n][1],T[n][2],T[n][3]],par=T[n][0],Q=par?(pl?pl.N[par]:[T[par][1],T[par][2],T[par][3]]):[0,0,0];b[n].position.set(P[0]-Q[0],P[1]-Q[1],P[2]-Q[2])});
  b.pelvis.userData.y0=b.pelvis.position.y-(rat?pl.crouch.drop:0);
  const q=arr.map(x=>x.quaternion.clone());arr.forEach(x=>x.quaternion.identity());
  body.bind(new THREE.Skeleton(arr));
  arr.forEach((x,i)=>x.quaternion.copy(q[i]));h._race=rat?1:0;h._ratC=null}
// ---------------- body rings (same count, heights and parts as the human rings) ----------------
var RAT_TR=[[.44,.15,.105,.11],[.5,.168,.125,.12],[.56,.176,.135,.124],[.62,.172,.138,.122],[.7,.164,.136,.124],[.78,.168,.13,.13],
  [.86,.192,.122,.136],[.93,.206,.114,.136],[.972,.17,.1,.114],[1.0,.088,.074,.08],[1.035,.07,.068,.066],[1.075,.067,.066,.064]];
{const f=mdTorso;mdTorso=function(P){if(!RAT.on)return f.apply(this,arguments);
  return RAT_TR.map(q=>{const y=q[0];return {p:[0,y,y>.9?-.012:0],rx:q[1],f:q[2],b:q[3],w:mdTorsoW(y),y}})}}
// thin arms; the hand rings become a small flat palm (thin across, wide front to back) ending at the knuckles
{const f=mdArm;mdArm=function(P,s){if(!RAT.on)return f.apply(this,arguments);
  const R=f.apply(this,arguments),K=[.86,.86,.82,.8,.82,.74],bn=s<0?'aL':'aR',A1=mdV(P.bones[bn+'1']),A2=mdV(P.bones[bn+'2']),d=A2.clone().sub(A1).normalize();
  const xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),at=(t,dz)=>A2.clone().add(d.clone().multiplyScalar(t)).add(new THREE.Vector3(xo,0,dz)).toArray();
  return R.map((r,i)=>{const o=Object.assign({},r);
    if(i<6){o.rx=r.rx*K[i];o.f=r.f*K[i];o.b=r.b*K[i]}
    if(i==0){o.p=[r.p[0]+s*.012,r.p[1]-.04,r.p[2]];o.rx*=.86;o.f*=.9;o.b*=.9}if(i==1)o.p=[r.p[0],r.p[1]-.012,r.p[2]];
    if(i==6){o.p=at(.002,.002);o.rx=.022;o.f=.022;o.b=.02}
    if(i==7){o.p=at(.02,.004);o.rx=.0095;o.f=.02;o.b=.017}
    if(i==8){o.p=at(.036,.005);o.rx=.0075;o.f=.019;o.b=.016}
    return o})}}
{const f=mdLeg;mdLeg=function(P,s){if(!RAT.on)return f.apply(this,arguments);const R=f.apply(this,arguments),K=[1.22,1.28,1.18,.98,.88,.76,.7];
  return R.map((r,i)=>Object.assign({},r,{rx:r.rx*K[i],f:r.f*K[i]*(i<3?1.06:1),b:r.b*K[i]*(i<3?1.1:1)}))}}
// long rat hind feet: heel, arch, ball, two toe rings
{const f=mdFoot;mdFoot=function(P,s){if(!RAT.on)return f.apply(this,arguments);const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),x=A.x,lf=P.lf||1;
  const F=RAT_FS,r=(z,y,rx,ff,b,part)=>({p:[x,y,A.z+z*F],rx:rx*lf*(.4+.6*F),f:ff*lf,b:b*lf*(.4+.6*F),w:[[l,1]],part});
  return [r(-.06,.046,.04,.03,.04,'heel'),r(-.028,.05,.046,.042,.046,'foot'),r(.05,.038,.05,.032,.036,'foot'),r(.13,.026,.046,.022,.024,'toe'),r(.172,.02,.036,.014,.016,'toe')]}}
// ---------------- head ----------------
// skull / snout rings back to front: [z, y centre, half-width, top, underside]
var RAT_SN=[[-.105,1.16,.04,.04,.04],[-.08,1.165,.078,.08,.076],[-.045,1.17,.096,.095,.088],[-.01,1.168,.1,.097,.092],[.03,1.158,.094,.086,.09],
  [.07,1.142,.074,.066,.07],[.105,1.128,.056,.05,.054],[.14,1.115,.042,.038,.042],[.17,1.105,.032,.029,.033],[.195,1.098,.024,.021,.024],[.215,1.094,.015,.013,.015]];
var RAT_FS=.8;
var RAT_EYEP=[.074,1.168,.058],RAT_EAR=[.078,1.252,-.045];
// the skull ring at z (interpolated): {yc, rx, f, b}
function ratSkullAt(z){const S=RAT_SN;let i=0;while(i<S.length-2&&S[i+1][0]<z)i++;const a=S[i],b=S[i+1],t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0]))),L=(u,v)=>u+(v-u)*t;
  return {yc:L(a[1],b[1]),rx:L(a[2],b[2]),f:L(a[3],b[3]),b:L(a[4],b[4]),slope:(b[2]-a[2])/(b[0]-a[0])}}
function ratSurfX(z,y){const q=ratSkullAt(z),dy=y-q.yc,r=dy>0?q.f:q.b;return q.rx*Math.sqrt(Math.max(0,1-(dy/r)**2))}
function ratHead(B,P,o){const C=RAT.C,H=(P.head={w:.96,jaw:.82,top:1,len:.96,fwd:-.012},mdHeadR(P));P._H=H;const k=dkKit(),hw=[['head',1]];
  // neck into the skull
  mdLoft(B,[{p:[0,1.03,-.012],rx:.068,f:.067,b:.065,w:[['neck',.7],['head',.3]]},{p:[0,1.07,-.016],rx:.068,f:.067,b:.066,w:[['neck',.3],['head',.7]]},{p:[0,1.105,-.022],rx:.068,f:.066,b:.068,w:hw}],
    {seg:12,col:m=>m.s>.45?C.BELLY:C.FUR});
  // skull + snout: one smooth loft (ref = up: f is the top of each ring, b the underside); jowls and the small lower
  // jaw are in the ring profile; the mouth is a dark line painted along each side of the muzzle
  mdLoft(B,RAT_SN.map(q=>({p:[0,q[1],q[0]],rx:q[2],f:q[3],b:q[4],w:hw})),
    {seg:14,ref:[0,1,0],capA:true,capB:{dz:.008},col:m=>{const z=m.r.p[2];
      if(z>.1&&m.s<-.38&&m.s>-.72&&Math.abs(m.c)>.55)return C.MOUTH;
      if(m.s<-.6&&z>-.02)return C.BELLY;if(m.s<-.3)return C.FURL;if(m.s>.55&&z<.08)return C.FURD;return C.FUR}});
  // nose (rhinarium + nostrils), incisors, whiskers from the whisker pads
  const tip=RAT_SN[RAT_SN.length-1];k.p('head','sph2','c',C.PINK,0,tip[1]+.004,tip[0]+.011,.0145,.012,.012);
  [-1,1].forEach(s=>k.p('head','box','c',0x3a2424,s*.0058,tip[1]+.001,tip[0]+.022,.004,.003,.003));
  k.p('head','box','c',C.PINKD,0,tip[1]-.009,tip[0]+.008,.0025,.01,.003);
  [-1,1].forEach(s=>{k.p('head','box','c',C.TOOTH,s*.0042,1.071,.2,.0075,.017,.005,.12,0,0);const wx=ratSurfX(.17,1.104);
    for(let i=0;i<4;i++)k.L('head','c',0x2a2420,[s*(wx-.003),1.1+i*.005-.004,.17-i*.006],[s*(.12-i*.008),1.09+i*.022-.02,.13-i*.025],.0015,.0005,3)});
  // eyes on the skull surface: dark socket, glossy black eye, coloured glint, white highlight, a soft brow ridge
  [-1,1].forEach(s=>{const [ex0,ey,ez]=RAT_EYEP,ex=ratSurfX(ez,ey)-.004,ry=s*Math.atan2(1,-ratSkullAt(ez).slope);
    k.p('head','sph2','c',mdSh(C.FURD,.8),s*(ex-.002),ey,ez,.021,.017,.02,0,ry,0);
    k.p('head','sph2','c',0x070606,s*(ex+.003),ey,ez+.001,.0165,.0145,.016,0,ry,0);
    k.p('head','box','g',C.EYE,s*(ex+.0175),ey+.005,ez+.006,.004,.004,.003,0,ry,0);
    k.p('head','box','c',0xe8e4dc,s*(ex+.016),ey+.007,ez+.002,.0025,.0025,.002,0,ry,0);
    k.p('head','sph2','c',C.FURD,s*(ex-.002),ey+.017,ez-.002,.024,.008,.02,0,ry,s*-.25)});
  // ears: big, round, thin and cupped, pink inside; they always stand (helmets have openings for them)
  [-1,1].forEach(s=>{const [x,y,z]=RAT_EAR;k.p('head','sph2','c',C.FUR,s*x,y,z,.052,.058,.013,-.2,s*.55,s*.38);k.p('head','sph2','c',C.PINK,s*(x+.003),y-.003,z+.006,.04,.046,.007,-.2,s*.55,s*.38)});
  mdKit(B,k);return H}
// ---------------- paws: flat palm (arm rings 6–8) with four two-jointed fingers and a thumb nub ----------------
function ratPaws(B){const C=RAT.C,V=THREE.Vector3,k=dkKit(),P=RAT.P||{};
  [['aL1','aL2',-1],['aR1','aR2',1]].forEach(([a,b,s])=>{const A=mdV(HB[a]),W=mdV(HB[b]),d=W.clone().sub(A).normalize(),z=new V(0,0,1),e=z.clone().sub(d.clone().multiplyScalar(z.dot(d))).normalize(),
      sd=new V().crossVectors(d,e).multiplyScalar(s),bw=[[b,1]],xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),at=(t,o,l)=>W.clone().add(d.clone().multiplyScalar(t)).add(e.clone().multiplyScalar(o)).add(sd.clone().multiplyScalar(l||0)).add(new V(xo,0,.005));
    // fingers: rooted inside the palm's end, side by side across its width, curling gently toward the palm
    for(let i=0;i<4;i++){const o=(i-1.5)*.0112,len=[.028,.033,.032,.026][i],sp=(i-1.5)*.05,R=[];let p=at(.028,o),dir=d.clone().add(e.clone().multiplyScalar(sp)).normalize();
      const rad=[.0062,.0056,.0047,.0036,.0024],seg=[0,.012,.012,.008,.006];let L=0;
      for(let j=0;j<5;j++){if(j){const st=len*seg[j]/.038;p=p.clone().add(dir.clone().multiplyScalar(st));L+=st;dir=dir.clone().add(sd.clone().multiplyScalar(.16+.1*j)).normalize()}
        R.push({p:p.toArray(),rx:rad[j],f:rad[j],b:rad[j],w:bw})}
      mdLoft(B,R,{seg:6,capB:true,col:C.PINK});
      const t=new V(...R[4].p);k.L(b,'c',C.CLAW,t.clone().sub(dir.clone().multiplyScalar(.003)).toArray(),t.clone().add(dir.clone().add(sd.clone().multiplyScalar(.6)).normalize().multiplyScalar(.011)).toArray(),.0032,.0004,4)}
    // thumb nub on the front edge of the palm
    const tp=at(.012,.017),td=d.clone().multiplyScalar(.45).add(e.clone().multiplyScalar(.85)).add(sd.clone().multiplyScalar(.25)).normalize();
    mdLoft(B,[{p:tp.toArray(),rx:.0068,f:.0068,b:.0068,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(.01)).toArray(),rx:.0058,f:.0058,b:.0058,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(.017)).toArray(),rx:.0038,f:.0038,b:.0038,w:bw}],{seg:6,capB:true,col:C.PINK});
    const tt=tp.clone().add(td.clone().multiplyScalar(.017));k.L(b,'c',C.CLAW,tt.toArray(),tt.clone().add(td.clone().multiplyScalar(.009)).toArray(),.003,.0004,4)});
  mdKit(B,k)}
// rounded shoulder joints (the arm loft is open at the top); half on the chest, half on the upper arm
function ratShoulders(B){const k=dkKit();['aL0','aR0'].forEach((bn,i)=>{const s=i?1:-1,A=HB[bn];
  k.p(bn,'sph2','c',RAT.C.FUR,A[1]-s*.012,A[2]-.012,A[3],.056,.05,.056);k.P[k.P.length-1].w=[['chest',.5],[bn,.5]]});mdKit(B,k)}
// bare feet: four clawed toes and a dewclaw
function ratToes(B,P){const C=RAT.C,k=dkKit();[-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),lf=P.lf||1;
    const F=RAT_FS;for(let i=0;i<4;i++){const o=(i-1.5)*.02*lf*(.4+.6*F),x=A.x+o,z0=A.z+.16*lf*F,ln=[.04,.05,.05,.042][i]*lf*F,dx=o*.5,a=[x,.018,z0],b=[x+dx,.012,z0+ln],c=[x+dx*1.2,.004,z0+ln+.018*lf];
      k.L(l,'c',C.PINK,a,b,.011*lf,.008*lf,5);k.L(l,'c',C.CLAW,b,c,.006*lf,.0008,4)}
    k.L(l,'c',C.PINK,[A.x-s*.033*lf,.03,A.z+.03*F],[A.x-s*.048*lf,.016,A.z+.07*F],.009*lf,.006*lf,4)});
  mdKit(B,k)}
// tail: part of the body mesh, each ring weighted between the tail bones on either side of it
function ratTail(B){const C=RAT.C,n=RAT_TP.length,last=RAT_TB.length-1;
  mdLoft(B,RAT_TP.map((t,i)=>{const w=i==0?[['pelvis',.6],['tl0',.4]]:i>last?[['tl'+last,1]]:[['tl'+(i-1),.4],['tl'+i,.6]];return {p:[t[0],t[1],t[2]],rx:t[3],f:t[3],b:t[3],w}}),
    {seg:8,capB:true,col:m=>m.i<1.2?C.FUR:m.i<1.8?mdMix(C.FUR,C.PINK,.5):Math.floor(m.i*2)%2?C.PINK:mdSh(C.PINK,.9)})}
// ---------------- helmets built for the rat skull ----------------
// shell over the skull: the skull rings pushed out by off (top/sides), between z0 and z1, keep(m) chooses the faces
function ratShell(B,off,z0,z1,keep,col,t,seg){const R=[],push=z=>{const q=ratSkullAt(z);R.push({p:[0,q.yc,z],rx:q.rx+off,f:q.f+off,b:q.b+off*.6,w:[['head',1]]})};
  const zs=[z0];RAT_SN.forEach(q=>{if(q[0]>z0+.008&&q[0]<z1-.008)zs.push(q[0])});[.045,.058,.085].forEach(z=>{if(z>z0+.008&&z<z1-.008)zs.push(z)});zs.push(z1);zs.sort((a,b)=>a-b).forEach(push);
  mdLoft(B,R,{seg:seg||16,ref:[0,1,0],t:t||'m',capA:z0<=-.1,keep,col})}
// openings: eye (wide = open face, slit = closed helm), ear, underside (jaw stays free)
// the slit is one row of the shell's faces at the eyes' height (s ≈ .29 round the ring), three rings long: a clean straight cut
function ratEyeW(m){return m.z>.044&&m.z<.087&&m.s>.12&&m.s<.46&&Math.abs(m.c)>.6}
function ratEarW(m){const dx=Math.abs(m.x)-RAT_EAR[0],dy=m.y-(RAT_EAR[1]-.02),dz=m.z-RAT_EAR[2];return Math.abs(m.x)>.03&&dx*dx+dy*dy*1.3+dz*dz<.032*.032}
function ratHelm(B,P,d){const C=RAT.C,M=d.M,A=d.A,G=d.G,k=dkKit(),st=d.st,a=d.a,slitC=0x0a0806;
  const earRims=(c,t)=>[-1,1].forEach(s=>{const [x,y,z]=RAT_EAR;k.p('head','ring',t||'m',c,s*(x-.002),y-.03,z,.03,.07,.024,0,0,-s*.38)});
  const snoutTop=z=>{const q=ratSkullAt(z);return q.yc+q.f};
  const dome=(off,zf,col,t)=>ratShell(B,off,-.11,zf,m=>m.s>-.25&&!ratEarW(m)&&!(m.z>.035&&m.s<.45),col||M,t,28);
  // closed helm: dome + cheek guards down the sides, a slit at the eyes, a guard over the snout top to the whisker pads
  const closed=(off,col,ac)=>{ratShell(B,off,-.11,.165,m=>{if(ratEarW(m)||ratEyeW(m))return false;if(m.z>.1)return m.s>.2;if(m.z>.035)return m.s>-.5;return m.s>-.42},
      m=>m.z>.15?(ac||A):col||M,'m',32);
    // muzzle rim and brow band
    ratShell(B,off+.004,.152,.165,m=>m.s>.15,ac||A,'m',14)};
  const nasal=(c)=>{const z0=.03,z1=.125;k.L('head','m',c,[0,snoutTop(z0)+.022,z0],[0,snoutTop(z1)+.012,z1],.011,.007,5)};
  const band=(z,off,c,t)=>ratShell(B,off,z-.008,z+.008,m=>m.s>-.25&&!ratEarW(m),c,t||'m');
  const crest=(c,n,h)=>{for(let i=0;i<n;i++){const z=-.09+i*(.12/(n-1)),q=ratSkullAt(z);k.p('head','box','m',c,0,q.yc+q.f+.02+h*.4,z,.012,h*(1-Math.abs(i-(n-1)/2)/n),.04,0)}};
  const horns=(c,sz,up)=>[-1,1].forEach(s=>{const x=.1,y=1.2,z=-.0,p1=[s*x,y,z],p2=[s*(x+.06*sz),y+.03*sz,z-.02],p3=[s*(x+.08*sz),y+.09*sz*(up||1),z-.04];k.L('head','m',c,p1,p2,.026*sz,.018*sz,6).L('head','m',mdSh(c,.8),p2,p3,.018*sz,.003,6)});
  const spikes=(c,n,h)=>{for(let i=0;i<n;i++){const ang=i/n*Math.PI*2,z=-.035+Math.cos(ang)*.07,x=Math.sin(ang)*.085,q=ratSkullAt(z),y=q.yc+q.f*Math.sqrt(Math.max(.15,1-(x/q.rx)**2))+.012;k.p('head','cone4','m',c,x,y+.025*h,z,.014,.05*h*(i==0?1.6:1),.014)}};
  const gemF=(c,sz)=>{const z=-.01,q=ratSkullAt(z);k.p('head','oct',G?'g':'m',G||c,0,q.yc+q.f+.026,z+.05,.018*(sz||1),.022*(sz||1),.01,-.6)};
  // cloth hood over the skull with ear openings, a hem, a drape over the neck and shoulders
  const hood=(off,col,o)=>{o=o||{};ratShell(B,off,-.115,.04,m=>!ratEarW(m)&&!(m.z>-.01&&m.s<-.15),m=>m.z>.03?mdSh(col,.8):col,'c',14);
    mdLoft(B,[{p:[0,1.07,-.03],rx:.1+off,f:.075,b:.1+off,w:[['neck',.4],['head',.6]]},{p:[0,1.0,-.03],rx:.15+off,f:.1,b:.13+off,w:[['chest',.5],['neck',.5]]},{p:[0,.95,-.025],rx:.2+off,f:.13,b:.15+off,w:[['chest',1]]}],
      {seg:12,t:'c',col:o.drape||mdSh(col,.88),keep:m=>!(m.s>.6&&m.y>.99)});
    [-1,1].forEach(s=>{const [x,y,z]=RAT_EAR;k.p('head','ring','c',mdSh(col,.7),s*(x-.003),y-.034,z,.032,.08,.026,0,0,-s*.38)});
    if(o.tip!==false)k.L('head','c',col,[0,1.21,-.11],[0,1.15,-.2],.035,.006,5)};
  const muzzle=(c)=>{const o=.008,R=[.045,.07,.1,.125].map(z=>{const q=ratSkullAt(z);return {p:[0,q.yc,z],rx:q.rx+o,f:q.f+o,b:q.b+o,w:[['head',1]]}});
    mdLoft(B,R,{seg:12,ref:[0,1,0],col:m=>m.i>2.3||m.i<.7?mdSh(c,.55):mdMix(c,0xe8e0d0,.12)})};
  const strap=(c,t)=>band(-.03,.012,c,t);
  const goggles=(c,glass)=>{[-1,1].forEach(s=>{const [x,y,z]=RAT_EYEP,ex=ratSurfX(z,y)+.008,ry=s*Math.atan2(1,-ratSkullAt(z).slope);k.p('head','cyl','m',c,s*ex,y,z,.02,.012,.02,0,ry,Math.PI/2);
    k.p('head','cyl',G?'g':'c',G||glass,s*(ex+.006),y,z,.016,.004,.016,0,ry,Math.PI/2)});strap(mdSh(c,.7),'c')};
  if(a=='heavy'){
    if(st=='nasal'){dome(.022,.075);band(-.01,.026,A);nasal(A);earRims(A)}
    else if(st=='horned'){dome(.022,.075);band(-.01,.026,A);nasal(A);earRims(A);horns(0xd8ccb0,1)}
    else if(st=='great'){closed(.024);earRims(A);crest(A,4,.03)}
    else if(st=='visage'){closed(.024,M,mdSh(M,.75));earRims(A);crest(A,7,.06)}
    else if(st=='winged'){closed(.024);earRims(A);crest(A,5,.05);[-1,1].forEach(s=>{for(let j=0;j<3;j++)k.p('head','box','m',j%2?M:A,s*(.12+j*.012),1.17+j*.04,-.07-j*.02,.012,.1-j*.018,.06,-.35,0,-s*(.5+j*.25))})}
    else if(st=='barbute'){closed(.024);earRims(0x8a1a1a);horns(0x8a1a1a,.8);k.L('head','c',0x8a1a1a,[0,1.29,-.04],[0,1.27,-.18],.03,.01,5)}
    else if(st=='bucket'){closed(.026);band(-.05,.03,A);band(.03,.03,A);earRims(A)}
    else{/*crowned*/closed(.024);band(-.02,.03,A);spikes(A,8,1.2);horns(0x2a2420,1.1,1.4);earRims(A);gemF(A)}}
  else if(a=='medium'){
    if(st=='hood')hood(.026,M);
    else if(st=='pelt'){hood(.03,M,{tip:false});[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.05,1.3,-.08,.03,.07,.022,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,1.27,-.03,.06,.03,.07,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.02,1.255,.0,.007,.026,.007,Math.PI))}
    else if(st=='cowl'){hood(.026,M);muzzle(A)}
    else if(st=='skullhood'){hood(.03,M,{tip:false});k.p('head','sph2','c',0xd8ccb0,0,1.27,-.04,.07,.045,.08);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.025,1.265,.03,.018,.012,.01);k.L('head','c',0xd8ccb0,[s*.05,1.29,-.06],[s*.11,1.34,-.1],.016,.004,5)})}
    else if(st=='galemask'||st=='wind'){muzzle(mdSh(A,.9));strap(mdSh(M,.8),'c');[-1,1].forEach(s=>{for(let j=0;j<4;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(.1+j*.008),1.17+j*.025,-.03-j*.025,.012,.1-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});if(st=='wind')hood(.03,M,{tip:false})}
    else if(st=='feather'){ratShell(B,.018,-.11,.0,m=>m.s>.1&&!ratEarW(m),M,'c',14);band(-.0,.022,mdSh(M,.75),'c');k.L('head','c',A,[.05,1.25,-.06],[.12,1.37,-.14],.012,.002,4)}
    else{/*deadeye*/hood(.026,M);muzzle(mdSh(M,.6));const [x,y,z]=RAT_EYEP,ex=ratSurfX(z,y)+.01;k.p('head','ring','m',A,ex,y,z,.022,.15,.022,0,Math.atan2(1,-ratSkullAt(z).slope),Math.PI/2)}}
  else if(a=='light'){
    if(st=='wrap'||st=='bandana'){muzzle(M);strap(mdSh(M,.8),'c');k.L('head','c',mdSh(M,.75),[0,1.2,-.11],[.03,1.12,-.18],.018,.008,4)}
    else if(st=='viper'){muzzle(M);for(let i=0;i<5;i++){const z=-.08+i*.03,q=ratSkullAt(z);k.p('head','cone4','c',A,0,q.yc+q.f+.02,z,.014,.045,.018,-.3)}}
    else if(st=='ashcowl'){hood(.02,M,{tip:false});muzzle(mdSh(M,.8))}
    else if(st=='glassmask'){goggles(mdSh(M,.6),0x1a1a2a);muzzle(mdSh(M,.55))}
    else if(st=='stormhood'){hood(.024,M);muzzle(mdSh(M,.6));band(-.02,.03,G||A,G?'g':'m')}
    else if(st=='venom'){muzzle(mdSh(M,.7));goggles(mdSh(M,.5),0x2a4a1a)}
    else{/*dusk*/hood(.022,M,{tip:false});muzzle(A);k.L('head','c',A,[0,1.15,-.12],[.05,.95,-.2],.026,.01,4)}}
  else{ // cloth
    if(st=='linen')hood(.032,M);
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.21:.18,c=st=='witch'?mdSh(M,.6):M,y0=1.275;
      // the brim sits on the crown between the ears, tilted back; the ears come out under it
      k.p('head','cyl','c',mdSh(c,.85),0,y0,-.06,br,.016,br,-.12);k.p('head','cyl','c',A,0,y0+.016,-.064,.1,.026,.1,-.12);
      k.L('head','c',c,[0,y0+.01,-.065],[.02,y0+.17,-.11],.095,.05,8).L('head','c',mdSh(c,.92),[.02,y0+.17,-.11],[.08,y0+.27,-.19],.05,.022,7).L('head','c',mdSh(c,.82),[.08,y0+.27,-.19],[.14,y0+.3,-.25],.022,.004,6);
      if(G)k.p('head','oct','g',G,0,y0+.03,.04,.016)}
    else if(st=='circlet'||st=='diadem'||st=='crown'){
      // a band round the skull just above the eyes and in front of the ears
      const yb=1.205,R=[0,1].map(i=>({p:[0,yb+i*.016,-.035],rx:.11,f:.112,b:.11,w:[['head',1]]}));mdLoft(B,R,{seg:16,t:'m',col:A});
      if(st=='diadem')for(let i=0;i<5;i++){const ang=(i-2)*.32;k.p('head','cone4','m',A,Math.sin(ang)*.112,yb+.03+(i==2?.025:0),-.035+Math.cos(ang)*.114,.012,.045+(i==2?.035:0),.01)}
      if(st=='crown')for(let i=0;i<9;i++){const ang=i/9*Math.PI*2;k.p('head','cone4','m',A,Math.sin(ang)*.112,yb+.045,-.035+Math.cos(ang)*.114,.014,.05*(i==0?1.5:1),.014)}
      k.p('head','oct',G?'g':'m',G||d.gem,0,yb+.012,.08,.015,.02,.01)}
    else if(st=='tallcowl'){hood(.03,M,{tip:false});k.L('head','c',M,[0,1.27,-.06],[0,1.44,-.13],.07,.004,7);band(.0,.036,A,'c')}
    else{/*star*/hood(.03,M);band(.0,.036,G||A,G?'g':'m');for(let i=0;i<5;i++){const ang=(i-2)*.38;k.p('head','oct',G?'g':'m',G||A,Math.sin(ang)*.13,1.24,-.03+Math.cos(ang)*.13,.012)}}}
  mdKit(B,k)}
// ---------------- the rat's model build ----------------
{const f=mdHead;mdHead=function(B,P,o){return RAT.on?ratHead(B,P,o||{}):f.apply(this,arguments)}}
{const f=mdHelm;mdHelm=function(B,P,d){return RAT.on?ratHelm(B,P,d):f.apply(this,arguments)}}
// equipped boots go on; the outfit's default boots don't (the rat goes barefoot)
{const f=mdBoots;mdBoots=function(B,P,d){if(RAT.on&&RAT.feet&&!d.key){ratToes(B,P);return}return f.apply(this,arguments)}}
// the rat's body is built on the hero bones + tail bones, warped by the 'rat' proportions
{const f=mdB;mdB=function(bones){if(RAT.on&&bones===HB){ratPlan();const B=f.call(this,HBR);B.kqPre='rat';B.kqDone=0;return B}return f.apply(this,arguments)}}
{const f=mdBody;mdBody=function(B,P){if(RAT.on){RAT.P=P;const C=RAT.C,c=P.col;if(c.hand==null||mdC(c.hand)==C.FUR)c.hand=C.PINK;
    if(RAT.feet){c.boot=C.PINK;c.sole=C.PINKD;const pl=P.paint.leg;P.paint.leg=(m,s)=>m.r.part=='ankle'&&m.i>5.5?mdMix(c.shin,C.PINK,.5):pl?pl(m,s):null}}
  return f.apply(this,arguments)}}
// base model only (fur body, no outfit): the inspection renders use it through RAT.bare
function ratBareB(L){const C=RAT.C,B=mdB(HB),P=mdP({look:L,sex:0,build:1,col:{skin:C.FUR,torso:C.FUR,torsoLo:C.FUR,sleeve:C.FUR,fore:C.FUR,hand:C.PINK,pants:C.FUR,shin:C.FUR,neck:C.FUR,belt:null,boot:C.PINK,sole:C.PINKD}});
  P.paint.torso=m=>m.s>.45&&m.y>.5?C.BELLY:m.s<-.6&&m.y>.8?C.FURD:C.FUR;P.paint.torsoLo=m=>m.s>.5&&m.y>.47?C.BELLY:C.FUR;
  P.paint.leg=(m,s)=>m.r.part=='ankle'&&m.i>5.5?mdMix(C.FUR,C.PINK,.5):m.s>.5&&m.r.part=='thigh'?mdMix(C.FUR,C.BELLY,.4):C.FUR;
  P.paint.fore=m=>m.r.part=='wrist'?mdMix(C.FUR,C.PINK,.3):C.FUR;
  P._T=mdTorso(P);mdBody(B,P);ratShoulders(B);mdHead(B,P,{});ratToes(B,P);ratPaws(B);ratTail(B);return B}
{const f=mdHeroB;mdHeroB=function(cls,L,E){if(!(L&&L.race==1))return f.apply(this,arguments);
  const o={on:RAT.on,C:RAT.C,feet:RAT.feet,P:RAT.P};RAT.on=true;RAT.C=ratCols(L);RAT.feet=!(E&&E.boots&&mdGD(E.boots));
  try{const L2=Object.assign({},L,{hairStyle:5,face:0,sex:0});if(RAT.bare)return ratBareB(L2);
    const B=f.call(this,cls,L2,E);ratShoulders(B);ratPaws(B);ratTail(B);return B}
  finally{Object.assign(RAT,o)}}}
// ---------------- looks: the race field ----------------
{const f=mdLookN;mdLookN=function(L,cls){const r=f.apply(this,arguments);r.race=cls=='warrior'&&L&&+L.race===1?1:0;return r}}
{const f=mdLookKey;mdLookKey=function(L){return f.apply(this,arguments)+(L&&L.race==1?'.rat':'')}}
// every hero model is (re)built here: retarget its skeleton when its race changes
{const f=mdHeroApply;mdHeroApply=function(h,cls,E){try{const c=CLS[cls]?cls:'warrior',L=mdLookOf(h,c),r=L.race==1?1:0;if((h._race|0)!==r)ratRig(h,!!r)}catch(e){console.error('rat rig',e)}
  return f.apply(this,arguments)}}
// crouch and tail: layered on every animation (the leg offsets are taken off before and put back after each frame)
{const f=animHero;animHero=function(now,mv,h){const H=h||pl,b=H&&H.bones,rat=H&&H._race==1&&b&&b.tl0;
  const rid=H===pl&&typeof riding!='undefined'&&!!riding,R=rat?ratPlan().crouch:null,on=H&&H._ratCr;
  if(on&&b){b.lh0.rotation.x-=on.a;b.rh0.rotation.x-=on.a;b.lh1.rotation.x-=on.k;b.rh1.rotation.x-=on.k;b.lh2.rotation.x-=on.an;b.rh2.rotation.x-=on.an;H._ratCr=null}
  const r=f.apply(this,arguments);
  if(rat){if(!rid){b.lh0.rotation.x+=R.a;b.rh0.rotation.x+=R.a;b.lh1.rotation.x+=R.k;b.rh1.rotation.x+=R.k;b.lh2.rotation.x+=R.an;b.rh2.rotation.x+=R.an;H._ratCr=R}
    const t=(now||0)/1000,w=H.mvW||0,amp=.06+.1*w,sp=1.6+3.2*w;
    for(let i=0;i<RAT_TB.length;i++){const bn=b[RAT_TB[i]];if(!bn)continue;bn.rotation.y=amp*Math.sin(t*sp-i*.55)*(.4+i*.12);bn.rotation.x=(.015+.02*w)*Math.sin(t*sp*2-i*.5)}}
  return r}}
// ---------------- the race in looks, saves, co-op ----------------
LOOK_DEF.race=0;LOOK_OPT.race=['Human','Rat'];
{const f=lkClean;lkClean=function(o){const r=f.apply(this,arguments);if(o&&+o.race===1)r.race=1;return r}}
// race is a Warrior option: other classes drop it (and the rat's fur / eye colours with it)
{const f=lkFull;lkFull=function(cls,part){if(cls!='warrior'&&part&&+part.race===1){part=Object.assign({},part);delete part.race;delete part.skin;delete part.eye}return f.call(this,cls,part)}}
// co-op partners see your race (sent after the 8 look values)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a))a[8]=mdLookOf(pl,hero.cls).race|0}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);if(r&&Array.isArray(a))r.race=a[8]===1?1:0;return r}}
// ---------------- creator and barber: Race for the Warrior; a rat picks fur and eye colour ----------------
function ratEdCls(){try{if(LK.on)return ccCls;if(LKB.on)return LKB.cls}catch(_){}return hero&&hero.cls}
{const f=lkCtl;lkCtl=function(L){const r=f.apply(this,arguments);if(ratEdCls()!='warrior')return r;
  const O=LOOK_OPT,rat=+L.race===1,g=(t,x)=>`<div class="lkg"><div class="lkl">${t}</div>${x}</div>`,
    ch=(k,a)=>`<div class="lkcs">${a.map((n,i)=>`<button class="lkc${(+L[k]||0)==i?' on':''}" data-lk="${k}" data-v="${i}">${n}</button>`).join('')}</div>`,
    sw=(k,a)=>`<div class="lks">${a.map(c=>`<button class="lksw${L[k]==c?' on':''}" data-lk="${k}" data-v="${c}" style="background:${c}" title="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`;
  const race=g('Race',ch('race',O.race));
  if(!rat)return {body:race+r.body,head:r.head};
  return {body:race+g('Build',ch('build',O.build))+g(`Height <b>${Math.round(L.height*100)}%</b>`,`<input class="lkr" type="range" min="0.9" max="1.1" step="0.01" value="${L.height}" data-lk="height" aria-label="Height">`)+g('Fur',sw('skin',RAT_FUR)),
    head:g('Eye colour',sw('eye',RAT_EYE))+`<div class="lkb"><button data-lka="rnd">🎲 Randomize</button><button data-lka="reset">↺ Reset</button></div>`}}}
// switching race swaps in that race's colours
{const f=lkSet;lkSet=function(state,k,v){f.apply(this,arguments);if(k!='race')return;const L=state.look;
  if(+v===1){L.skin=RAT_FUR[0];L.eye=RAT_EYE[0]}else{if(RAT_FUR.includes(L.skin))delete L.skin;if(RAT_EYE.includes(L.eye))delete L.eye}}}
// randomize / reset keep the rat a rat
{const f=lkInput;lkInput=function(state,e){const was=state.look&&+state.look.race===1,a=e.target&&e.target.closest&&e.target.closest('[data-lka]'),r=f.apply(this,arguments);
  if(a&&was){const R=x=>x[Math.floor(Math.random()*x.length)];state.look=a.dataset.lka=='rnd'?{race:1,skin:R(RAT_FUR),eye:R(RAT_EYE),build:Math.floor(Math.random()*3),height:+(.93+Math.random()*.14).toFixed(2)}:{race:1,skin:RAT_FUR[0],eye:RAT_EYE[0]}}
  return r}}
