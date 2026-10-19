// ================= v95 (ornate track): ornate worn armour =================
// The v94 armour (zzN_model_gear.js) was clean but plain. Every helm, chest piece and pair of boots is rebuilt here
// with layered pieces, raised trims, rivets, straps, buckles, embroidered borders and a motif per set, still in the
// low-poly v94 style (flat shading, one colour per face, ≤3 merged geometries per hero: cloth / metal / glow).
//  * Same construction as v94: shells of the body's own rings (mdTS torso, mdAS arm, mdLS leg, mdFS foot, skirts that
//    follow both thighs) with the body's bone weights, plus rigid dkKit parts on one bone (or blended ring weights,
//    mdOW), so everything bends with walk / attack / idle / riding and fits every hero look.
//  * New small toolkit: mdTP (a point on the torso surface), mdRAt / mdLB (a band round a limb), mdStrap (a flat strap
//    or sash following any path over the body), mdSk (skirt rings that follow the thighs, for faulds and hem trims),
//    mdEdge (a thin tube along a list of points: hood and mask edges).
//  * Tier: T1 plain but finished (seams, a trim), up to T5 lavish (gilded edges, gems, glow). Trim metal per tier
//    (MD_TRIM: bronze, iron, brass, silver, gold). Rarity: Rare+ a coloured trim (d.R), Epic+ glow inlays (d.G),
//    Legendary bright glow accents (d.GB). The 12 v78 sets get their own palette (MD_SETPAL) and motif.
//  * Class capes: when a chest piece is worn the cape becomes a short half-cape on the left shoulder (the armour's back
//    stays visible); the paladin tabard over armour is a lower tabard below the belt (the chest emblem stays visible).
//  * Icons follow automatically (mdItemKit runs these same builders).
var MD_TRIM=[0x9a7a48,0xa8aeb8,0xb8903e,0xccd0d8,0xe0b850];
// v78 sets: [material, accent, trim]
var MD_SETPAL={Bloodsworn:[0x4a4248,0x8a1420,0xa8803a],Ironwall:[0x5c6268,0x9a6a32,0xb88a44],Warlord:[0x2c2830,0xc89a3a,0xd8ac4a],
  Pathfinder:[0x3e5230,0x8a6a3a,0xb09a6a],Deadeye:[0x5a4026,0x8a2620,0xa88848],Windrunner:[0x3a5560,0xc8ccd0,0xc8ccd4],
  Cutthroat:[0x2e2a2c,0x6a1a1a,0x8a8e96],Venomweave:[0x2c2234,0x5a9a3a,0x6a7462],Duskdancer:[0x24223c,0x4a3a74,0xc0c4d0],
  'Hedge-Witch':[0x4a5236,0x7a5a36,0xc8bca0],Spellbinder:[0x4a1e2e,0x3ab0a0,0x6a6e78],Starweaver:[0x1e2a50,0xd8b050,0xd8b050]};
// descriptor extras: T trim metal, lv ornament level 0..4, R rarity trim (Rare+), GB legendary glow
function mdDX(d,acc){if(!d||d._x)return d;d._x=1;const sp=d.set&&MD_SETPAL[d.set],arm=d.sl=='helm'||d.sl=='chest'||d.sl=='boots';
  if(sp&&arm){d.M=sp[0];acc=sp[1];d.T=sp[2];d.dk=mdSh(d.M,.6)}
  // the accent keeps its own hue (only a hint of the rarity colour); the rarity shows as its own trim (R) and glow (G)
  if(acc!=null&&arm)d.A=d.r>=2?mdMix(acc,v89Rc(d.r),.12):acc;
  if(d.T==null)d.T=MD_TRIM[d.ti|0];if(d.lv==null)d.lv=d.set?Math.min(4,(d.ti|0)+1):(d.ti|0);
  if(d.R===undefined)d.R=d.r>=2?mdSh(v89Rc(d.r),.68):null;d.GB=d.r>=4;return d}
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);if(!d)return d;let acc=null;try{acc=v89Acc(itT(it))}catch(e){}return mdDX(d,acc)}}
// the ornate builders are used while a hero model or an item icon is built; foes and town folk keep the v94 pieces
var MD_ORN=0;
{const c=mdChest,h=mdHelm,b=mdBoots;mdChest=function(B,P,d,cls){return MD_ORN?mdChestO(B,P,d,cls):c.apply(this,arguments)};
  mdHelm=function(B,P,d){return MD_ORN?mdHelmO(B,P,d):h.apply(this,arguments)};mdBoots=function(B,P,d){return MD_ORN?mdBootsO(B,P,d):b.apply(this,arguments)}}
{const f=mdHeroB;mdHeroB=function(){MD_ORN++;try{return f.apply(this,arguments)}finally{MD_ORN--}}}
{const f=mdItemKit;mdItemKit=function(){MD_ORN++;try{return f.apply(this,arguments)}finally{MD_ORN--}}}

// =====================================================================================================
// toolkit
// =====================================================================================================
// a point on the torso surface at height y, angle a (0 = front, +π/2 = +x side), pushed out by off
function mdTP(P,y,a,off){const q=mdTorsoAt(P,y),ca=Math.cos(a),sa=Math.sin(a);return [sa*(q.rx+off),y,(q.z||0)+ca*((ca>=0?q.f:q.b)+off)]}
// weights for the last rigid part on k
function mdOW(k,w){k.P[k.P.length-1].w=w;return k}
function mdWL(a,b,t){const m={};a.forEach(q=>m[q[0]]=(m[q[0]]||0)+q[1]*(1-t));b.forEach(q=>m[q[0]]=(m[q[0]]||0)+q[1]*t);
  return Object.entries(m).filter(e=>e[1]>.001).sort((x,y)=>y[1]-x[1]).slice(0,4)}
// ring at position u (fractional index) of a ring list (mdArm / mdLeg)
function mdRAt(R,u){const i=Math.max(0,Math.min(R.length-2,Math.floor(u))),t=Math.max(0,Math.min(1,u-i)),a=R[i],b=R[i+1],L=(x,y)=>x+(y-x)*t;
  return {p:[L(a.p[0],b.p[0]),L(a.p[1],b.p[1]),L(a.p[2],b.p[2])],rx:L(a.rx,b.rx),f:L(a.f,b.f),b:L(a.b,b.b),w:mdWL(a.w,b.w,t),part:t<.5?a.part:b.part}}
// band round a limb at ring position u, half height h, flare fl (lower edge wider)
function mdLB(B,R,u,h,off,col,o){o=o||{};const r=mdRAt(R,u),r0=mdRAt(R,u-.2),r1=mdRAt(R,u+.2),d=new THREE.Vector3(r1.p[0]-r0.p[0],r1.p[1]-r0.p[1],r1.p[2]-r0.p[2]).normalize(),fl=o.fl||0;
  const mk=(sg,e)=>Object.assign({},r,{p:[r.p[0]+d.x*h*sg,r.p[1]+d.y*h*sg,r.p[2]+d.z*h*sg],rx:r.rx+e,f:r.f+e,b:r.b+e});
  mdLoft(B,[mk(-1,0),mk(1,fl)],Object.assign({seg:o.seg||8,off,t:'m',col},o))}
// flat strap / ribbon along points [{p:[x,y,z],n:[nx,ny,nz] outward,w:weights}], width wd, thickness th
function mdRib(B,pts,wd,th,col,o){o=o||{};if(pts.length<2)return;const n=pts[0].n||[0,0,1];
  mdLoft(B,pts.map(q=>({p:q.p,rx:(q.wd||wd)*.707,f:th*1.414,b:th*1.414,w:q.w})),Object.assign({seg:4,rot:Math.PI/4,ref:n,col,t:'c'},o))}
// strap over the torso surface from (y0,a0) to (y1,a1) in n steps (straight in y/angle space)
function mdTStrap(B,P,y0,a0,y1,a1,off,wd,col,o){o=o||{};const n=o.n||8,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,y=y0+(y1-y0)*t,a=a0+(a1-a0)*t;pts.push({p:mdTP(P,y,a,off),n:[Math.sin(a),0,Math.cos(a)],w:mdTorsoW(y)})}
  mdRib(B,pts,wd,o.th||.005,col,o);return pts}
// a tilted loop round the torso (sash / bandolier): centre height yc, tilt amp (y rises toward angle ph)
function mdTLoop(B,P,yc,amp,ph,off,wd,col,o){o=o||{};const n=o.n||20,pts=[];off=Math.min(off,.04); // straps lie on the coat, not on collars
  for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,y=yc+amp*Math.cos(a-ph);pts.push({p:mdTP(P,y,a,off),n:[Math.sin(a),0,Math.cos(a)],w:mdTorsoW(y)})}
  mdRib(B,pts,wd,o.th||.005,col,o);return pts}
// skirt rings (the v94 mdSkirt profile) at fractions ts between y0 and y1
function mdSkW(P,y0){return (x,y)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-.32)))*.9,l=Math.max(0,Math.min(1,.5-x/.16));return d<=0?[['pelvis',1]]:[['pelvis',1-d],['lh0',d*l],['rh0',d*(1-l)]]}}
function mdSkR(P,y0,y1,fl,t,e,dz){const q=mdTorsoAt(P,y0),w0=Math.max(q.rx,.205),f0=Math.max(q.f,.128),b0=Math.max(q.b,.13),y=y0+(y1-y0)*t,k=Math.min(1,t*2.2);e=e||0;
  return {p:[0,y,(q.z||0)+(dz||0)*t],rx:q.rx+(w0-q.rx)*k+fl*t+e,f:q.f+(f0-q.f)*k+fl*.75*t+e,b:q.b+(b0-q.b)*k+fl*.8*t+e,w:[['pelvis',1]],t}}
// skirt piece between fractions ts=[t0,t1,...] (e: extra radius per ring)
function mdSk(B,P,y0,y1,fl,off,ts,o){o=o||{};const R=ts.map((t,i)=>mdSkR(P,y0,y1,fl,t,o.e?o.e[i]:0,o.dz));P.sOff=Math.max(P.sOff||0,off);
  mdLoft(B,R,Object.assign({seg:14,off,wf:mdSkW(P,y0)},o))}
// thin tube along points (edges, chains, laces)
function mdEdge(k,bn,t,col,pts,r){for(let i=0;i<pts.length-1;i++)k.L(bn,t,col,pts[i],pts[i+1],r,r,4)}
// a vertex of a head ring at loft angle index ki (of seg), pushed out by off
function mdHV(Hr,ki,seg,off){const a=Math.PI/2+ki/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);return [-c*(Hr.rx+off),Hr.y==null?Hr.p[1]:Hr.p[1],Hr.p[2]+s*((s>0?Hr.f:Hr.b)+off)]}
// little star (4 points) facing +z
function mdStar(k,bn,t,col,x,y,z,r,w){k.p(bn,'box',t,col,x,y,z,r*.35,r*2,.004,0,0,Math.PI/4).p(bn,'box',t,col,x,y,z,r*2,r*.35,.004,0,0,Math.PI/4);if(w)mdOW(k,w);k.p(bn,'box',t,col,x,y,z+.001,r*.45,r*2.6,.004);if(w)mdOW(k,w);k.p(bn,'box',t,col,x,y,z+.001,r*2.6,r*.45,.004);if(w)mdOW(k,w);return k}
// buckle: frame + inner + tongue, facing +z
function mdBuckle(k,bn,x,y,z,sz,T,inner,w,ry){sz=sz||1;k.p(bn,'box','m',T,x,y,z,.044*sz,.04*sz,.01,0,ry||0,0);if(w)mdOW(k,w);k.p(bn,'box','c',inner,x,y,z+.004,.028*sz,.024*sz,.008,0,ry||0,0);if(w)mdOW(k,w);
  k.p(bn,'box','m',T,x,y,z+.007,.006*sz,.03*sz,.006,0,ry||0,0);if(w)mdOW(k,w);return k}
// pouch on the belt at angle a
function mdPouch(k,P,a,y,col,T,sz){sz=sz||1;const p=mdTP(P,y,a,.02+.02*sz);k.p('pelvis','box','c',col,p[0],p[1],p[2],.06*sz,.07*sz,.04*sz,0,a,0);
  const p2=mdTP(P,y+.022*sz,a,.024+.02*sz);k.p('pelvis','box','c',mdSh(col,.78),p2[0],p2[1],p2[2],.064*sz,.03*sz,.046*sz,0,a,0);
  const p3=mdTP(P,y+.012*sz,a,.048+.02*sz);k.p('pelvis','oct','m',T,p3[0],p3[1],p3[2],.008*sz,.008*sz,.006,0,a,0)}
// sheathed knife / blade on the belt at angle a, tilted
function mdKnife(k,P,a,y,sh,T,tilt){const p=mdTP(P,y,a,.03);k.p('pelvis','box','c',sh,p[0],p[1]-.05,p[2],.024,.11,.014,0,a,tilt||0);
  k.p('pelvis','box','m',T,p[0]-Math.sin(tilt||0)*-.012,p[1]+.012,p[2],.05,.01,.016,0,a,tilt||0);k.p('pelvis','cyl','c',0x241812,p[0]+Math.sin(tilt||0)*-.03,p[1]+.035,p[2],.009,.045,.009,0,a,tilt||0);
  k.p('pelvis','oct','m',T,p[0]+Math.sin(tilt||0)*-.06,p[1]+.062,p[2],.01)}
function mdRotZ(x,y,a){return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]}

// =====================================================================================================
// chest
// =====================================================================================================
function mdChestO(B,P,d,cls){mdDX(d);const k=mdKP(),X={B,P,d,k};
  if(d.a=='heavy')mdChH(X);else if(d.a=='medium')mdChM(X);else if(d.a=='light')mdChL(X);else mdChC(X);
  mdKit(B,k)}
// shared pieces
function mdMail(B,P,M,arms,lo,hem){const mc=mdMix(M,0x6a6c70,.3),md=mdSh(mc,.78),mm=m=>(Math.round(m.y*48)%2?mc:md);
  mdTS(B,P,.43,.99,.012,{col:mm,lip:.012});[-1,1].forEach(s=>mdAS(B,P,s,0,arms,.01,{col:mm}));
  mdSkirt(B,P,.5,lo||.36,.03,.014,{col:m=>m.y<(lo||.36)+.025?(hem||mdSh(M,.6)):mm(m),n:4})}
function mdBeltO(X,y,col,lv,o){o=o||{};const {B,P,d,k}=X,off=(P.tOff||0)+.008,T=d.T;
  mdTS(B,P,y-.024,y+.024,off,{col:m=>Math.abs(m.y-y)>.018?mdSh(col,.75):col,lipT:.003});
  if(d.R)mdTS(B,P,y+.024,y+.032,off+.002,{col:d.R,t:'m'});
  const f=mdTorsoAt(P,y).f+off+.008;mdBuckle(k,'spine',0,y,f,lv>=3?1.15:1,T,mdSh(col,.7),mdTorsoW(y));
  if(lv>=3&&!o.noGem){k.p('spine','oct',d.G?'g':'m',d.G||d.gem,0,y,f+.012,.01);mdOW(k,mdTorsoW(y))}
  const ns=o.studs!=null?o.studs:lv>=1?10:0;for(let i=0;i<ns;i++){const aa=.4+i*(Math.PI*2-.8)/(ns-1);const p=mdTP(P,y,aa,off+.006);k.p('spine','oct','m',T,p[0],p[1],p[2],.007);mdOW(k,mdTorsoW(y))}}
// glow line round the torso at y (Epic+)
function mdGlowBand(X,y,off,keep){const {B,P,d}=X;if(d.G==null)return;mdTS(B,P,y-.006,y+.006,off,{t:'g',col:d.G,keep})}

// ---------------------------------------------- heavy ----------------------------------------------
function mdPaul(X,n,o){o=o||{};const {P,d,k}=X,M=d.M,T=d.T,ps=mdSh(M,1.16),W=mdBuildF(P),sz=(1+(W-1)*.6)*(o.sz||1);
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',R=mdArm(P,s),sp=R[1].p;
    for(let i=n-1;i>=0;i--){const r=(.108-i*.011)*sz,x=sp[0]+s*(.008+i*.02),y=.995-i*.048+(o.dy||0),rz=-s*(.18+i*.3);
      if(o.sq){const xs=sp[0]+s*(.02+i*.012),ys=1.0-i*.042,rs=-s*(.12+i*.16);k.p(a,'box','m',i?M:ps,xs,ys,0,r*1.55,.05,r*2.05,0,0,rs);k.p(a,'box','m',T,xs+s*.002,ys-.022,0,r*1.6,.012,r*2.1,0,0,rs);
        if(i==0){for(let j=0;j<3;j++){const q=mdRotZ(s*(-r*.4+j*r*.4),.026,rs);k.p(a,'oct','m',T,xs+q[0],ys+q[1],r*.7,.009)}k.p(a,'box','m',T,xs,ys+.03,0,.014,.016,r*2.0,0,0,rs)}}
      else{k.p(a,'hem','m',i?M:ps,x,y,0,r,r*.7,r*1.08,0,0,rz);k.p(a,'tor','m',i==0||d.lv>=2?T:mdSh(M,.8),x,y-.002,0,r*1.04,.012,r*1.12,0,0,rz);
        if(i==0&&d.lv>=1){for(let j=0;j<5;j++){const th=-.9+j*.45,q=mdRotZ(Math.sin(th)*r*.86*s,.012,rz);k.p(a,'oct','m',T,x+q[0],y+q[1],Math.cos(th)*r*.92,.008)}}
        if(i==0&&d.lv>=3){const q=mdRotZ(0,r*.68,rz);k.p(a,'box','m',T,x+q[0],y+q[1],0,.012,.016,r*2.0,0,0,rz)}}}
    // spikes on the top lame
    const sp0=mdRotZ(0,.108*sz*.7,-s*.18);for(let i=0;i<(o.spk||0);i++){const b=[sp[0]+s*.008+sp0[0]+s*i*.025,.995+sp0[1]-.005,-.03+i*.05];k.L(a,'m',o.spkC||mdSh(T,.95),b,[b[0]+s*.05,b[1]+.11-i*.025,b[2]-.01],.02,.003,5)}
    if(d.G&&(d.GB||o.gem)){const q=mdRotZ(s*.02,.108*sz*.66,-s*.18);k.p(a,'oct','g',d.G,sp[0]+s*.008+q[0],.995+q[1],.06*sz,.014,.018,.01)}})}
function mdArmP(X,o){const {B,P,d,k}=X,M=d.M,T=d.T,ps=mdSh(M,1.14);
  [-1,1].forEach(s=>{const R=mdArm(P,s),a1=s<0?'aL1':'aR1';
    if(o.rere){mdAS(B,P,s,1,3,.02,{t:'m',col:m=>m.i>2.4?mdSh(M,.85):M});mdLB(B,R,1.4,.008,.026,T)}
    if(o.cout){const e=R[3],p=e.p;k.p(a1,'sph','m',ps,p[0],p[1]+.005,p[2]-e.b-.008,.042,.046,.034);mdOW(k,e.w);
      k.p(a1,'box','m',T,p[0]+s*(e.rx+.012),p[1],p[2]-.012,.012,.07,.056,0,0,0);mdOW(k,e.w);
      if(d.lv>=3){k.p(a1,'cone4','m',T,p[0],p[1],p[2]-e.b-.05,.014,.04,.014,-Math.PI/2);mdOW(k,e.w)}}
    if(o.vamb){mdAS(B,P,s,4,5,.02,{t:'m',col:m=>m.s>.6&&d.lv>=2?ps:M});mdLB(B,R,4.05,.008,.028,T);mdLB(B,R,5.25,.012,.03,M,{fl:.012});mdLB(B,R,5.42,.005,.044,T);
      if(d.G){mdLB(B,R,4.6,.004,.026,d.G,{t:'g',keep:m=>m.s>0})}}
    else if(o.bracer){mdAS(B,P,s,4,5,.016,{col:mdSh(0x4a3020,1)});mdLB(B,R,4.1,.006,.02,T);mdLB(B,R,5,.006,.02,T)}})}
function mdFaulds(X,n,y0,y1,o){o=o||{};const {B,P,d}=X,M=d.M,T=d.T,off=(P.tOff||0)+.01;
  for(let i=n-1;i>=0;i--){const t0=i/n,t1=(i+1)/n,tm=t1-.14/n;
    mdSk(B,P,y0,y1,.008,off+.004*(n-i),[t0,tm,t1],{t:'m',e:[0,0,.006],col:m=>m.y<y0+(y1-y0)*tm+.002?(i==n-1||d.lv>=3?T:mdSh(M,.72)):i%2?mdSh(M,.9):M})}}
function mdTassets(X,c,trim){const {B,P,d,k}=X;[-1,1].forEach(s=>{const R=mdLeg(P,s),rr=[mdRAt(R,.7),mdRAt(R,1.5),mdRAt(R,2.4)];
  mdLoft(B,rr,{seg:8,off:.03,t:'m',col:m=>m.i>1.6?trim:c,keep:m=>m.s>-.1});const r=rr[1];k.p(s<0?'lh0':'rh0','oct','m',trim,r.p[0],r.p[1]+.03,r.p[2]+r.f+.036,.01);mdOW(k,r.w)})}
function mdGorget(X,n,col){const {B,P,d}=X,T=d.T;for(let i=0;i<n;i++){const y0=.94+i*.03;mdTS(B,P,y0,y0+.036,.04-i*.004,{t:'m',col:m=>m.y<y0+.008?T:col,lip:.006})}}
// breastplate: keel ridge, fluting (lv4+), engraved band (lv3+), trims at neckline and lower edge, rivets
function mdBreast(X,o){o=o||{};const {B,P,d,k}=X,M=d.M,T=d.T,lv=d.lv,ps=mdSh(M,1.15),pd=mdSh(M,.86),y0=o.y0||.6;
  mdTS(B,P,y0,.985,.03,{t:'m',col:m=>m.y<y0+.03?pd:lv>=4&&m.s>.3&&Math.round(m.x*28)%2?ps:m.s>.55&&m.y>.68&&m.y<.95?ps:M,lip:.012,lipT:.006});
  // trims
  mdTS(B,P,y0-.004,y0+.016,.044,{t:'m',col:T});mdTS(B,P,.955,.985,.038,{t:'m',col:T,lipT:.004});
  if(lv>=3){mdTS(B,P,.885,.9,.036,{t:'m',col:d.R||T});mdGlowBand(X,.8925,.037,m=>m.s>.2)}
  if(d.R&&lv<3)mdTS(B,P,.62,.632,.04,{t:'m',col:d.R});
  // keel ridge (front) and spine ridge (back)
  mdTStrap(B,P,y0+.02,0,.95,0,.034,.016,lv>=2?T:ps,{t:'m',th:.006,n:5});mdTStrap(B,P,y0+.02,Math.PI,.95,Math.PI,.034,.014,pd,{t:'m',th:.006,n:5});
  // rivets along the lower edge
  for(let i=0;i<12;i++){const a=(i+.5)/12*Math.PI*2,p=mdTP(P,y0+.03,a,.044);k.p('spine','oct','m',T,p[0],p[1],p[2],.0075);mdOW(k,mdTorsoW(y0+.03))}
  // back: shoulder-blade plates
  if(lv>=2)[-1,1].forEach(s=>mdTStrap(B,P,.9,Math.PI+s*.5,.74,Math.PI+s*.75,.034,.02,T,{t:'m',th:.004,n:4}))}
function mdTabardO(X,c,tr,o){o=o||{};const {B,P,d,k}=X,off=(P.tOff||0)+.012,lo=o.lo||.32,top=o.top||.95;
  (o.only=='back'?[Math.PI]:[0,Math.PI]).forEach(a=>{const pts=[],pb=[],wf=mdSkW(P,.6),K=o.sk;for(let i=0;i<=8;i++){const y=top-(top-lo)*i/8,q=mdTorsoAt(P,Math.max(y,.6)),fz=y>=.6?(a?-(q.b):q.f):(a?-Math.max(.135,q.b):Math.max(.135,q.f));
      // over a robe: lie on the skirt (K: its y0, y1, flare, offset)
      const sr=K&&y<K.y0?mdSkR(P,K.y0,K.y1,K.fl,Math.min(1,(K.y0-y)/(K.y0-K.y1))):null;
      const z=sr?(a?-(sr.b+K.off+.008):sr.f+K.off+.008):(q.z||0)+fz+(a?-off:off)*(y<.6?1.15:1),w=y>=.6?mdTorsoW(y):wf(0,y);pts.push({p:[0,y,z],n:[0,0,a?-1:1],w,wd:(o.wd||.17)*(y<.6?1.08:1)});pb.push({p:[0,y-(i==8?.022:0),z+(a?.003:-.003)],n:[0,0,a?-1:1],w,wd:((o.wd||.17)+.03)*(y<.6?1.08:1)})}
    mdRib(B,pts,0,.003,m=>o.band&&Math.abs(m.y-(o.band))<.025?tr:c);mdRib(B,pb,0,.003,tr)});
  if(o.sym)o.sym((mdTorsoAt(P,.8).f+off+.008))}
function mdChH(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,dk=d.dk,lt=0x3a2618;
  const C={mail:{mail:1,yoke:1,bracer:1},hauberk:{mail:1,plast:1,paul:1,bracer:1},cuirass:{mail:1,plate:1,paul:2,fauld:2,tas:1,cout:1,vamb:1},
    warplate:{plate:1,paul:3,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:2,spk:1},aegis:{plate:1,paul:3,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:2,wing:1,tab:1},
    blood:{mail:1,plate:1,paul:2,spk:2,tab:1,cout:1,vamb:1,gor:1},wall:{plate:1,paul:3,sq:1,fauld:3,tas:1,cout:1,vamb:1,rere:1,gor:3},
    warlord:{plate:1,paul:3,spk:3,fauld:2,tas:1,cout:1,vamb:1,rere:1,fur:1}}[st]||{mail:1};
  // under layer
  if(C.mail)mdMail(B,P,M,3,.36,lv>=1?T:lt);else{mdTS(B,P,.5,.99,.008,{col:mdSh(M,.5)});[-1,1].forEach(s=>mdAS(B,P,s,0,3,.008,{col:dk}));mdMail(B,P,mdSh(M,.8),0,.42,mdSh(M,.55))}
  if(C.plast){mdTS(B,P,.62,.97,.024,{col:m=>m.s>.2?lt:mdSh(lt,.85),lip:.006});mdTS(B,P,.955,.975,.03,{col:mdSh(lt,1.3)});
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const y=.7+r*.08,p=mdTP(P,y,-.45+c*.3,.03);k.p('chest','oct','m',T,p[0],p[1],p[2],.008);mdOW(k,mdTorsoW(y))}
    for(let c=0;c<4;c++){const y=.78,p=mdTP(P,y,Math.PI-.45+c*.3,.03);k.p('chest','oct','m',T,p[0],p[1],p[2],.008);mdOW(k,mdTorsoW(y))}}
  if(C.yoke){[-1,1].forEach(s=>{mdTStrap(B,P,.62,s*.3,.97,s*.62,(P.tOff||0)+.006,.035,lt,{n:6});mdTStrap(B,P,.97,s*.62,.62,Math.PI-s*.3,(P.tOff||0)+.006,.035,lt,{n:6});
      const p=mdTP(P,.86,s*.4,(P.tOff||0)+.012);k.p('chest','box','m',T,p[0],p[1],p[2],.022,.022,.008,0,s*.4,0)});
    mdTS(B,P,.965,.99,(P.tOff||0)+.01,{col:mdSh(lt,1.25)})}
  if(C.plate)mdBreast(X);
  if(C.gor)mdGorget(X,C.gor,mdSh(M,1.08));
  mdArmP(X,{rere:C.rere,cout:C.cout,vamb:C.vamb,bracer:C.bracer});
  if(C.fur){const fc=0x4a3a2c;mdTS(B,P,.9,1.0,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?fc:mdSh(fc,.8),lip:.034,lipT:.02});
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.cos(a)>.75)continue;const p=mdTP(P,.93,a,(P.tOff||0)+.05);k.p('chest','cone4','c',i%2?fc:mdSh(fc,1.25),p[0],p[1]-.02,p[2],.03,.07,.02,Math.cos(a)*.5,a,Math.sin(a)*-.5)}}
  if(C.paul)mdPaul(X,C.paul,{sq:C.sq,spk:C.spk,sz:C.sq?1.08:1,gem:lv>=3,spkC:st=='warlord'?0xd8ccb0:null});
  if(C.wing)[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',x=mdArm(P,s)[1].p[0]-s*.03;k.p(a,'box','m',M,x,1.05,-.02,.014,.12,.11,0,0,s*.35);k.p(a,'box','m',T,x+s*.004,1.1,-.02,.016,.022,.114,0,0,s*.35)});
  // belt, faulds, tassets
  mdBeltO(X,.6,st=='warlord'?0x2a1e18:lt,lv,{studs:lv>=1?10:0});
  if(C.fauld)mdFaulds(X,C.fauld,.585,.585-.045*C.fauld);
  if(C.tas)mdTassets(X,M,T);
  // tabards
  if(C.tab){P.noCape=1;if(st=='blood')mdTabardO(X,0x6a0c14,0x2a0608,{lo:.3,wd:.15,band:.4});else if(!P.noTabard)mdTabardO(X,mdSh(A,.6),T,{lo:.32,wd:.16,top:.6})}
  // emblems
  const f=mdTorsoAt(P,.8).f+(P.tOff||0)+.004,ew=mdTorsoW(.8),E=(g,t,c,x,y,z,a,b,cc,r1,r2,r3)=>{k.p('chest',g,t,c,x,y,z,a,b,cc,r1,r2,r3);mdOW(k,ew)};
  if(st=='blood'){const z=mdTorsoAt(P,.8).f+(P.tOff||0)+.016;E('oct','m',T,0,.8,z,.05,.07,.008);E('sph',G?'g':'c',G||0xa01020,0,.785,z+.008,.026,.028,.012);E('cone4',G?'g':'c',G||0xa01020,0,.825,z+.008,.02,.05,.01)}
  else if(st=='wall'){E('box','m',T,0,.79,f,.075,.1,.01);E('box','m',mdSh(M,.9),0,.79,f+.006,.06,.085,.01);E('box','m',T,0,.785,f+.012,.034,.06,.008);
    for(let i=0;i<3;i++)E('box','m',T,-.014+i*.014,.822,f+.012,.009,.014,.008);E('box','c',0x14100c,0,.768,f+.016,.012,.02,.004)}
  else if(st=='warlord'){const z=f+.006;E('sph','c',0xd8ccb0,0,.8,z,.04,.042,.016);E('box','c',0xd8ccb0,0,.765,z,.026,.02,.012);[-1,1].forEach(s=>E('box',G?'g':'c',G||0x14100c,s*.015,.802,z+.014,.012,.012,.006));
    E('box','c',0x14100c,0,.763,z+.012,.016,.004,.004);E('box','m',T,0,.838,z-.004,.05,.012,.012);for(let i=0;i<3;i++)E('cone4','m',T,-.02+i*.02,.855,z-.004,.008,.024,.006)}
  else if(st=='aegis'){const z=mdTorsoAt(P,.82).f+(P.tOff||0)+.004;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('chest','box','m',T,Math.sin(a)*.04,.82+Math.cos(a)*.04,z,.01,.05,.006,0,0,-a);mdOW(k,mdTorsoW(.82))}
    E('oct',G?'g':'m',G||d.gem,0,.82,z+.008,.022,.028,.012)}
  else if(st=='warplate'){[-1,1].forEach(s=>E('box','m',T,s*.03,.83,f,.016,.07,.008,0,0,s*.7));E('oct',G?'g':'m',G||d.gem,0,.8,f+.006,.016,.02,.01)}
  else if(st=='cuirass'){E('oct','m',T,0,.82,f,.03,.036,.012);E('oct',G?'g':'m',G||mdSh(M,1.3),0,.82,f+.006,.014,.018,.008)}
  else if(G){E('oct','g',G,0,.86,mdTorsoAt(P,.86).f+(P.tOff||0)+.012,.02,.026,.01)}
  if(d.GB&&C.plate)[-1,1].forEach(s=>{const p=mdTP(P,.72,s*.5,.036);k.p('spine','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.72))})}

// ---------------------------------------------- medium ----------------------------------------------
function mdStitch(X,pts,col,every){const {k}=X;every=every||1;for(let i=0;i<pts.length-1;i+=every){const a=pts[i].p,b=pts[i+1].p,m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],n=pts[i].n;
  k.p('chest','box','c',col,m[0]+n[0]*.004,m[1],m[2]+n[2]*.004,.005,.016,.005,0,Math.atan2(n[0],n[2]),0);mdOW(k,pts[i].w)}}
function mdFur(X,y0,y1,fc,tufts){const {B,P,k}=X;mdTS(B,P,y0,y1,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?fc:mdSh(fc,.82),lip:.03,lipT:.018});
  for(let i=0;i<(tufts||0);i++){const a=i/tufts*Math.PI*2;if(Math.cos(a)>.7)continue;const p=mdTP(P,y0+.02,a,(P.tOff||0)+.045);k.p('chest','cone4','c',i%2?fc:mdSh(fc,1.2),p[0],p[1]-.015,p[2],.026,.06,.018,Math.cos(a)*.5,a,0);mdOW(k,mdTorsoW(y0))}}
function mdShoulderPad(X,col,trim,o){o=o||{};const {P,k}=X;(o.side?[o.side]:[-1,1]).forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p,r=.1*(o.sz||1);
  k.p(a,'hem',o.t||'c',col,sp[0]+s*.008,.99,0,r,r*.55,r*1.05,0,0,-s*.22);k.p(a,'tor',o.t||'c',trim,sp[0]+s*.008,.988,0,r*1.04,.01,r*1.1,0,0,-s*.22);
  if(o.lames)for(let i=1;i<=o.lames;i++){const rr=r*(1-i*.1);k.p(a,'hem',o.t||'c',mdSh(col,.88),sp[0]+s*(.012+i*.018),.99-i*.04,0,rr,rr*.55,rr*1.05,0,0,-s*(.22+i*.3));k.p(a,'tor',o.t||'c',trim,sp[0]+s*(.012+i*.018),.988-i*.04,0,rr*1.04,.01,rr*1.1,0,0,-s*(.22+i*.3))}})}
function mdChM(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,lt=0x3a2618,sh=mdSh(M,.7),stc=mdMix(M,0xe8dcc0,.45),off=()=>(P.tOff||0);
  const vest=(lo)=>{mdTS(B,P,lo||.55,.985,off()+.014,{col:m=>m.s>.8&&m.y<.95?mdSh(M,.72):m.y<(lo||.55)+.025?mdSh(M,.8):M,lip:.008});
    [-1,1].forEach(s=>mdStitch(X,mdTStrap(B,P,(lo||.55)+.03,s*.26,.95,s*.3,off()+.004,.012,mdSh(M,.82),{n:6}),stc))};
  const shirt=(c,lo)=>mdTS(B,P,lo||.5,.99,.008,{col:c});const sleeves=(c,to,o)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,o||.008,{col:c}));
  const coat=(c,y1,fl)=>{mdSkirt(B,P,.56,y1,fl,off()+.012,{col:m=>m.y<y1+.03?mdSh(c,.72):c,keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,y1,fl,off()+.016,[.9,1],{col:T,keep:m=>!(m.s>.86)})};
  const cross=(c,w)=>{const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,w||.038,c),p2=mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.012,w||.038,c);
    [[.86,.6],[.86,-.6]].forEach(([y,a])=>mdBuckle(k,'chest',...mdTP(P,y,a,Math.min(off(),.03)+.016),1,T,c,mdTorsoW(y),a))};
  const bracer=()=>[-1,1].forEach(s=>{const R=mdArm(P,s);mdAS(B,P,s,4,5,.018,{col:lt});mdLB(B,R,4.05,.006,.024,mdSh(lt,1.3),{t:'c'});mdLB(B,R,5,.006,.024,mdSh(lt,1.3),{t:'c'});
    const a1=s<0?'aL1':'aR1';for(let i=0;i<3;i++){const r=mdRAt(R,4.2+i*.25);k.p(a1,'box','c',stc,r.p[0],r.p[1],r.p[2]+r.f+.02,.03,.005,.006);mdOW(k,r.w)}
    if(lv>=2){const r=mdRAt(R,4.6);k.p(a1,'oct','m',T,r.p[0]+s*(r.rx+.02),r.p[1],r.p[2],.01);mdOW(k,r.w)}});
  const pouches=(n)=>{for(let i=0;i<n;i++)mdPouch(k,P,[-.95,.95,-1.6,1.6][i],.555,mdSh(lt,1.25),T,i>1?.85:1)};
  if(st=='padded'){mdTS(B,P,.48,.99,.012,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.85),lip:.01});sleeves(mdSh(M,.9),3,.01);
    for(let i=0;i<4;i++){const y=.68+i*.07;[-1,1].forEach(s=>{const p=mdTP(P,y,s*.12,.016),q=mdTP(P,y+.035,-s*.12,.016);k.L('chest','c',0x2a1a10,p,q,.004,.004,3);mdOW(k,mdTorsoW(y))})}
    mdTS(B,P,.955,.985,.018,{col:mdSh(M,.75)});[-1,1].forEach(s=>mdStitch(X,mdTStrap(B,P,.52,s*1.5,.95,s*1.5,.014,.008,mdSh(M,.8),{n:6}),stc));
    bracer();mdBeltO(X,.6,lt,lv,{studs:0});pouches(1)}
  else if(st=='brigandine'){shirt(sh);sleeves(sh,3);vest();
    for(let r=0;r<4;r++)for(let c=0;c<5;c++){const y=.66+r*.075,a=-.5+c*.25,p=mdTP(P,y,a,off()+.004);k.p('chest','oct','m',T,p[0],p[1],p[2],.009);mdOW(k,mdTorsoW(y))}
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const y=.68+r*.09,a=Math.PI-.45+c*.3,p=mdTP(P,y,a,off()+.004);k.p('chest','oct','m',T,p[0],p[1],p[2],.009);mdOW(k,mdTorsoW(y))}
    mdShoulderPad(X,mdSh(M,.9),T,{});bracer();mdBeltO(X,.6,lt,lv);pouches(2)}
  else if(st=='vest'){shirt(sh);sleeves(sh,3);vest(.5);mdFur(X,.9,.99,0x5a4030,10);cross(lt,.032);mdShoulderPad(X,mdSh(M,1.1),T,{side:-1,lames:1,t:'m'});bracer();mdBeltO(X,.6,lt,lv);pouches(3);mdKnife(k,P,1.25,.54,lt,T,.3)}
  else if(st=='longcoat'){shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.3,.06);mdBeltO(X,.6,lt,lv);
    // bone toggles, bone shoulder piece with teeth, fur-trimmed collar
    for(let i=0;i<4;i++){const y=.68+i*.07;[-1,1].forEach(s=>{const p=mdTP(P,y,s*.2,off()+.006);k.p('chest','box','c',0xe0d6bc,p[0],p[1],p[2],.026,.01,.01,0,0,s*.2);mdOW(k,mdTorsoW(y))})}
    mdShoulderPad(X,0xd8ccb0,0x8a7a5a,{side:-1,lames:1});const sp=mdArm(P,-1)[1].p;for(let i=0;i<4;i++)k.p('aL0','cone4','c',0xece4cc,sp[0]-.02-i*.02,.95-i*.012,.07-i*.045,.01,.035,.01,Math.PI);
    mdFur(X,.92,1.0,0x6a5a48,0);[-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.6,.02,.022,mdSh(M,.8),{t:'c',fl:.01});mdLB(B,R,4.95,.006,.034,T,{t:'c'})});pouches(2)}
  else if(st=='mantle'){shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.36,.04);mdBeltO(X,.6,lt,lv);
    // feathered mantle round the shoulders
    const fa=mdSh(mdMix(A,M,.6),.85),fb=mdMix(mdSh(A,.7),0xc8ccd0,.3);mdTS(B,P,.86,.99,off()+.024,{col:m=>Math.round(m.c*7)%2?fa:mdSh(fa,.8),lip:.05});
    for(let r=0;r<2;r++)for(let i=0;i<16;i++){const a=(i+r*.5)/16*Math.PI*2;if(Math.cos(a)>.6)continue;const p=mdTP(P,.89-r*.05,a,off()+.03+r*.006);k.p('chest','cone4','c',(i+r)%2?fa:fb,p[0],p[1]-.03,p[2],.022,.08,.008,Math.cos(a)*.3,a,0,0);mdOW(k,mdTorsoW(.89))}
    const f=mdTorsoAt(P,.95).f+off()+.01;k.p('chest','oct','m',T,0,.95,f,.024,.02,.01);k.p('chest','oct',G?'g':'m',G||d.gem,0,.95,f+.006,.012);
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.9,.006,.03,T,{t:'m'})});bracer();pouches(2)}
  else if(st=='path'){shirt(mdSh(M,.75));sleeves(mdSh(M,.75),3);vest();mdBeltO(X,.6,lt,lv);
    // tan scarf collar, leaf shoulder guards, compass on the chest strap, bedroll on the back
    mdTS(B,P,.94,1.0,off()+.02,{col:A,lipT:.012,lip:.012});mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.034,lt);
    [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<3;i++)k.p(a,'oct','c',i%2?mdSh(M,1.25):mdMix(M,0x6a8a3a,.4),sp[0]+s*(.02+i*.022),.99-i*.03,-.02+i*.02,.05,.012,.03,0,s*.3,-s*(.4+i*.25))});
    const cp=mdTP(P,.86,.6,off()+.024);k.p('chest','cyl','m',T,cp[0],cp[1],cp[2],.026,.008,.026,Math.PI/2,.6,0);k.p('chest','box','c',0x8a1a1a,cp[0],cp[1],cp[2]+.005,.006,.034,.003,Math.PI/2*0,.6,.5);k.p('chest','box','c',0xe8e0d0,cp[0],cp[1],cp[2]+.004,.034,.005,.003,0,.6,.5);
    const z=-(mdTorsoAt(P,.62).b+off()+.04);k.L('spine','c',0x6a5a3a,[-.15,.63,z],[.15,.63,z],.04,.04,7);[-.09,.09].forEach(x=>k.p('spine','tor','c',lt,x,.63,z,.044,.012,.044,0,0,Math.PI/2));
    bracer();pouches(3)}
  else if(st=='bandolier'){shirt(mdSh(M,.75));sleeves(mdSh(M,.75),3);vest();mdBeltO(X,.6,lt,lv);
    const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.04,lt),p2=mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.014,.04,lt);
    // cartridge pouches along the straps, target emblem, feathers at the shoulder
    [[p1,[1,2,3]],[p2,[17,18,19]]].forEach(([pp,ii])=>ii.forEach(i=>{const q=pp[i];k.p('chest','box','c',mdSh(lt,1.3),q.p[0]+q.n[0]*.012,q.p[1],q.p[2]+q.n[2]*.012,.022,.026,.014,0,Math.atan2(q.n[0],q.n[2]),0);mdOW(k,q.w)}));
    const f=mdTorsoAt(P,.7).f+off()+.012;[[.034,A],[.024,0xe8e0d0],[.014,A]].forEach(([r,c],i)=>{k.p('spine','cyl','c',c,0,.7,f+i*.003,r,.004,r,Math.PI/2);mdOW(k,mdTorsoW(.7))});
    for(let i=0;i<3;i++)k.p('aR0','cone4','c',i==1?0xe8e0d0:A,mdArm(P,1)[1].p[0]+.04,1.0+i*.01,-.04+i*.03,.012,.08,.004,-.3,0,-.6-i*.15);
    mdShoulderPad(X,mdSh(M,.85),T,{side:1});bracer();pouches(2)}
  else{/*tails: Windrunner*/shirt(sh);sleeves(M,5,.012);vest(.56);coat(M,.22,.08);mdBeltO(X,.6,lt,lv);
    mdSk(B,P,.56,.22,.08,off()+.02,[.0,.04],{col:A});
    // feather trims at the shoulders (wing fans), silver collar, crossed strap
    [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<5;i++)k.p(a,'cone4','c',i%2?A:mdMix(A,M,.5),sp[0]+s*(.03+i*.012),1.0+i*.006,-.06+i*.02,.014,.13-i*.012,.005,-.3+i*.12,0,-s*(.9+i*.18))});
    mdTS(B,P,.95,1.02,off()+.02,{col:A,lipT:.01});mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.03,mdSh(M,.6));
    const f=mdTorsoAt(P,.86).f+off()+.016;for(let i=0;i<3;i++)k.p('chest','cone4',G?'g':'c',G||A,-.02+i*.02,.86,f,.008,.04,.004,0,0,(i-1)*.5);
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.9,.006,.03,A,{t:'m'})});bracer();pouches(1)}
  // stitched hem on every medium chest, rarity trim
  if(d.R)mdTS(B,P,.965,.985,off()+.006,{col:d.R,t:'m'});
  if(G){mdGlowBand(X,.62,off()+.012,m=>m.s>0);if(d.GB)[-1,1].forEach(s=>{const p=mdTP(P,.9,s*.35,off()+.012);k.p('chest','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.9))})}}

// ---------------------------------------------- light ----------------------------------------------
function mdChL(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,dm=0x2a2c32,off=()=>(P.tOff||0),lt=0x2a1e18;
  const shirt=c=>mdTS(B,P,.5,.99,.008,{col:c}),sleeves=(c,to)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,.008,{col:c}));
  const wraps=(c,c2)=>[-1,1].forEach(s=>{mdAS(B,P,s,3.6|0,5,.012,{col:m=>Math.round(m.y*34)%2?c:c2});const R=mdArm(P,s);mdLB(B,R,4.98,.006,.02,T)});
  const sash=(c,tails)=>{mdTS(B,P,.57,.63,off()+.01,{col:m=>Math.abs(m.y-.6)<.012?mdSh(c,1.2):c});if(tails){const p=mdTP(P,.6,-1.1,off()+.02);
    [0,1].forEach(j=>mdRib(B,[{p:[p[0],.6,p[2]],n:[-.9,0,.4],w:[['pelvis',1]]},{p:[p[0]-.01,.48,p[2]+.01],n:[-.9,0,.4],w:[['pelvis',.6],['lh0',.4]]},{p:[p[0]-.02+j*.03,.36,p[2]+j*.02],n:[-.9,0,.4],w:[['pelvis',.3],['lh0',.7]]}],.04,.004,c,{capB:true}));
    k.p('pelvis','sph','c',mdSh(c,.85),p[0],.6,p[2]+.01,.026,.024,.02)}};
  const guard=(side,c,n)=>{const s=side,a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<(n||2);i++){k.p(a,'box','m',i?c:mdSh(c,1.2),sp[0]+s*(.01+i*.02),.99-i*.045,0,.1-i*.012,.016,.11,0,0,-s*(.35+i*.3));k.p(a,'box','m',T,sp[0]+s*(.012+i*.02),.985-i*.045,0,.104-i*.012,.006,.114,0,0,-s*(.35+i*.3))}};
  const blades=(n)=>{for(let i=0;i<n;i++)mdKnife(k,P,[1.2,-1.2,1.6][i],.54,lt,mdSh(T,.9),[.35,-.35,.2][i])};
  if(st=='wraps'){mdTS(B,P,.5,.99,.01,{col:m=>Math.round(m.y*26+m.c*2)%2?M:mdSh(M,.8)});wraps(M,mdSh(M,.75));
    mdTLoop(B,P,.76,.18,Math.PI/2,off()+.006,.03,mdSh(M,.65));sash(mdSh(M,.6),1);mdTS(B,P,.955,.99,off()+.012,{col:mdSh(M,.7)})}
  else if(st=='scale'){mdTS(B,P,.5,.99,.012,{col:m=>(Math.round(m.y*36)+Math.round((m.c+1)*5))%2?M:mdSh(M,.78)});sleeves(mdSh(M,.6),2);wraps(mdSh(M,.6),mdSh(M,.45));
    mdTS(B,P,.94,1.0,off()+.016,{col:A,lipT:.01});guard(1,mdSh(M,1.1),2);mdBeltO(X,.6,lt,lv,{studs:6});blades(1);
    // serpent fangs at the collar
    [-1,1].forEach(s=>{const p=mdTP(P,.93,s*.25,off()+.02);k.p('chest','cone4','c',0xe8e0d0,p[0],p[1]-.02,p[2],.008,.03,.008,Math.PI);mdOW(k,mdTorsoW(.93))})}
  else if(st=='garb'){shirt(M);sleeves(M,5);wraps(mdSh(M,.8),mdSh(M,.6));
    mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,.03,mdSh(M,.6));mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.012,.03,mdSh(M,.6));
    for(let i=0;i<3;i++){const p=mdTP(P,.84-i*.06,.38-i*.12,off()+.024);k.p('chest','box','m',0xb8bec8,p[0],p[1],p[2],.008,.05,.004,0,0,-.6);mdOW(k,mdTorsoW(.84-i*.06))}
    mdSkirt(B,P,.6,.42,.02,off()+.012,{col:m=>m.y<.445?T:mdSh(M,.75),keep:m=>Math.abs(m.c)<.5,n:3});guard(-1,dm,2);sash(A,0);blades(2)}
  else if(st=='shroud'){shirt(M);sleeves(M,5);mdBeltO(X,.6,mdSh(M,.6),lv,{studs:6});mdSkirt(B,P,.56,.3,.05,off()+.012,{col:m=>m.y<.33?mdSh(M,.6):mdSh(M,.85),keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,.3,.05,off()+.016,[.9,1],{col:A,keep:m=>!(m.s>.86)});mdTS(B,P,.93,1.04,off()+.02,{col:mdSh(M,.7),lipT:.02});
    // nightglass shards on the right shoulder
    const sp=mdArm(P,1)[1].p;guard(1,mdSh(M,.9),2);for(let i=0;i<4;i++)k.p('aR0','cone4',G?'g':'m',G||A,sp[0]+.02+i*.015,1.02+i*.01,-.04+i*.03,.014,.07-i*.008,.01,0,0,-.4-i*.2);
    wraps(mdSh(M,.8),mdSh(M,.6));blades(1)}
  else if(st=='raiment'){shirt(M);sleeves(M,5);mdBeltO(X,.6,A,lv);mdSkirt(B,P,.56,.26,.07,off()+.012,{col:m=>m.y<.29?mdSh(M,.6):mdSh(M,.85),keep:m=>!(m.s>.86),n:5});
    mdSk(B,P,.56,.26,.07,off()+.016,[.92,1],{col:T,keep:m=>!(m.s>.86)});mdTS(B,P,.94,1.06,off()+.03,{col:m=>m.s<0?mdSh(M,.6):A,lipT:.04,keep:m=>m.s<.55});
    mdTLoop(B,P,.78,.2,Math.PI/2,off()+.008,.026,dm);mdTLoop(B,P,.74,.2,Math.PI/2,off()+.012,.02,dm);guard(-1,dm,3);guard(1,dm,1);wraps(mdSh(M,.8),A);blades(2);
    if(G)[-1,1].forEach(s=>{const p=mdTP(P,.82,s*.3,off()+.02);k.p('chest','box','g',G,p[0],p[1],p[2],.006,.08,.004,0,0,s*.5);mdOW(k,mdTorsoW(.82))})}
  else if(st=='cutthroat'){shirt(mdSh(M,1.15));sleeves(mdSh(M,1.15),5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):M,lip:.006});
    // oxblood sash, dagger clasps on crossed straps, knives on the belt
    mdTLoop(B,P,.76,.2,Math.PI/2,off()+.008,.036,lt);mdTLoop(B,P,.76,.2,-Math.PI/2,off()+.012,.036,lt);sash(A,1);
    for(let i=0;i<4;i++){const y=.7+i*.06,a=-.45+i*.3*(1)*.0+(-.42+i*.04),p=mdTP(P,.66+i*.07,.36-i*.24,off()+.03);k.p('chest','box','m',0xb8bec8,p[0],p[1]-.012,p[2],.012,.05,.004,0,0,-.6);k.p('chest','box','m',T,p[0]+.014,p[1]+.012,p[2],.026,.006,.006,0,0,-.6);mdOW(k,mdTorsoW(p[1]))}
    guard(1,dm,2);wraps(mdSh(M,.8),A);blades(3)}
  else if(st=='venom'){shirt(M);sleeves(M,5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):mdSh(M,1.1),lip:.006});mdBeltO(X,.6,lt,lv);
    // bandolier of vials, a serpent coiled down the front
    const pp=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.034,lt);[1,2,3,4].forEach(i=>{const q=pp[i];k.p('chest','cyl','g',G||A,q.p[0]+q.n[0]*.016,q.p[1],q.p[2]+q.n[2]*.016,.011,.036,.011);mdOW(k,q.w);k.p('chest','cyl','m',T,q.p[0]+q.n[0]*.016,q.p[1]+.022,q.p[2]+q.n[2]*.016,.008,.01,.008);mdOW(k,q.w)});
    for(let i=0;i<8;i++){const y=.92-i*.04,a=-.12+Math.sin(i*1.2)*.16,p=mdTP(P,y,a,off()+.02);k.p('chest','oct','c',i%2?A:mdSh(A,.7),p[0],p[1],p[2],.018-i*.001,.024,.012);mdOW(k,mdTorsoW(y))}
    const hp=mdTP(P,.94,-.12,off()+.026);k.p('chest','oct','c',A,hp[0],hp[1]+.01,hp[2],.024,.018,.014);[-1,1].forEach(s=>k.p('chest','box',G?'g':'c',G||0xd0e040,hp[0]+s*.01,hp[1]+.014,hp[2]+.012,.006,.004,.004));
    guard(-1,dm,2);wraps(mdSh(M,.8),mdSh(A,.6));blades(1)}
  else{/*scarf: Duskdancer*/shirt(M);sleeves(M,5);mdTS(B,P,.55,.985,off()+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(M,.7):mdSh(M,1.1),lip:.006});
    mdBeltO(X,.6,A,lv,{studs:0});
    // scarf with trailing ribbons, crescent moons, silver accents
    mdTS(B,P,.92,1.04,off()+.03,{col:A,lip:.01,lipT:.01});
    [[.08,.98,-.14],[-.04,.97,-.15]].forEach((s0,j)=>mdRib(B,[{p:s0,n:[0,0,-1],w:[['chest',1]]},{p:[s0[0]+.02,.78,-.18-j*.01],n:[0,0,-1],w:[['chest',.4],['cp1',.6]]},{p:[s0[0]+.04,.56,-.2],n:[0,0,-1],w:[['cp1',.5],['cp2',.5]]},{p:[s0[0]+.06,.4-j*.06,-.22],n:[0,0,-1],w:[['cp2',1]]}],.05-j*.012,.004,j?mdSh(A,.65):A,{capB:true}));
    const moon=(x,y,z,r,bn,w)=>{for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p(bn,'box','m',T,x+Math.cos(a)*r,y+Math.sin(a)*r,z,.008,r*.7,.004,0,0,a);if(w)mdOW(k,w)}};
    const f=mdTorsoAt(P,.8).f+off()+.006;moon(-.01,.8,f,.03,'chest',mdTorsoW(.8));moon(-.01,.6,mdTorsoAt(P,.6).f+off()+.03,.022,'spine',mdTorsoW(.6));
    [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,4.1,.006,.02,T);mdLB(B,R,4.95,.006,.02,T);mdLB(B,R,4.5,.012,.016,A,{t:'c'})});guard(1,mdSh(M,.8),2);blades(2)}
  if(d.R)mdTS(B,P,.965,.985,off()+.008,{col:d.R,t:'m'});
  if(G&&d.GB){[-1,1].forEach(s=>{const p=mdTP(P,.66,s*.4,off()+.02);k.p('spine','oct','g',G,p[0],p[1],p[2],.012);mdOW(k,mdTorsoW(.66))})}}

// ---------------------------------------------- cloth ----------------------------------------------
function mdChC(X){const {B,P,d,k}=X,st=d.st,M=d.M,T=d.T,lv=d.lv,G=d.G,A=d.A,rb=M,rd=mdSh(M,.78),tr=A,off=()=>(P.tOff||0);
  const long=st=='regalia'||st=='vestments'||st=='star'?.06:st=='robe'||st=='witch'?.1:.08;
  mdTS(B,P,.5,.99,.008,{col:rb});
  // sleeves widening to cuffs with an embroidered cuff band
  [-1,1].forEach(s=>{mdAS(B,P,s,0,3,.01,{col:rb});mdLoft(B,mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018})),{seg:8,off:.012,col:m=>m.i>1.5?tr:rd});
    const R=mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018}));mdLB(B,R,1.72,.006,.018,lv>=2?T:mdSh(tr,1.2),{t:lv>=2?'m':'c'});if(lv>=1)mdLB(B,R,1.2,.004,.014,tr,{t:'c'})});
  // robe skirt + layered hem with embroidered border
  const emb=(m,base,c2)=>(Math.floor((Math.atan2(m.x,m.z)+Math.PI)/(Math.PI*2)*14+.5)%2?base:c2);
  mdSkirt(B,P,.6,long,.09,.016,{col:m=>m.y<long+.035?tr:(st=='witch'&&(Math.round(m.c*4+m.y*9)%3==0))?mdMix(rb,0x6a5a3a,.3):rb,n:6});
  mdSk(B,P,.6,long,.09,.022,[.86,.9],{col:d.R||(lv>=2?T:mdSh(tr,1.15)),t:lv>=2||d.R?'m':'c'});
  if(lv>=1)mdSk(B,P,.6,long,.09,.02,[.91,.96],{col:m=>emb(m,tr,lv>=3?T:rd)});
  if(lv>=3){mdSk(B,P,.6,long,.09,.026,[.995,1.04],{col:m=>emb(m,T,mdSh(tr,.75)),e:[.004,.016]})}
  // embroidered back panel (lv1+) with a glyph (lv2+)
  if(lv>=1){mdTabardO(X,mdSh(M,.72),lv>=2?T:A,{only:'back',top:.95,lo:long+.06,wd:.11,sk:{y0:.6,y1:long,fl:.09,off:.016}});
    if(lv>=2){const z=-(mdTorsoAt(P,.8).b+off()+.022),w=mdTorsoW(.8);k.p('chest','oct',G?'g':'m',G||T,0,.8,z,.03,.036,.006);mdOW(k,w);k.p('chest','oct','c',mdSh(M,.72),0,.8,z-.003,.018,.022,.006);mdOW(k,w)}}
  // collar
  mdTS(B,P,.95,.99,off()+.012,{col:m=>lv>=2?T:tr,lipT:.004});
  // belt / sash with tassels
  const bc=st=='pyre'?0x5a1a10:st=='witch'?0x5a4028:mdSh(A,.6);mdTS(B,P,.578,.622,off()+.01,{col:m=>Math.abs(m.y-.6)<.008&&lv>=1?T:bc});
  const bf=mdTorsoAt(P,.6).f+off()+.016;k.p('spine','oct','m',T,0,.6,bf,.03,.03,.012);k.p('spine','oct',G?'g':'m',G||d.gem,0,.6,bf+.008,.014);
  const tassel=(x,z,len,c)=>{k.L('pelvis','c',c,[x,.585,z],[x+.004,.585-len,z+.01],.006,.006,4);k.p('pelvis','cone4','c',c,x+.004,.585-len-.02,z+.01,.016,.04,.016);k.p('pelvis','sph','m',T,x+.004,.585-len+.01,z+.01,.01)};
  tassel(.05,bf-.004,.12,bc);if(lv>=1)tassel(.085,bf-.012,.16,mdSh(bc,1.3));
  // stole: two embroidered bands from the shoulders down the front (lv2+)
  const stole=(c,c2,lo)=>[-1,1].forEach(s=>{const pts=[];for(let i=0;i<=8;i++){const y=.97-(.97-lo)*i/8,yy=Math.max(.6,y),q=mdTorsoAt(P,yy),a=s*.42,sr=mdSkR(P,.6,long,.09,Math.max(0,(.6-y)/(.6-long))),xr=sr.rx+.024,x=s*.085;
      const z=y>=.6?(q.z||0)+Math.cos(a)*(q.f+off()+.014):sr.p[2]+(sr.f+.024)*Math.sqrt(Math.max(.05,1-(x/xr)*(x/xr)));
      pts.push({p:[y>=.6?Math.sin(a)*(q.rx+off()+.014):x,y,z],n:[s*.3,0,1],w:y>=.6?mdTorsoW(y):mdSkW(P,.6)(s*.09,y)})}
    mdRib(B,pts,.056,.003,c);mdRib(B,pts.map(q=>({p:[q.p[0],q.p[1],q.p[2]-.003],n:q.n,w:q.w})),.072,.003,c2);if(lv>=4)for(let i=2;i<8;i+=2){const q=pts[i];k.p(i<5?'chest':'pelvis','oct',G&&i==4?'g':'m',G&&i==4?G:T,q.p[0],q.p[1],q.p[2]+.006,.009);mdOW(k,q.w)}});
  // shoulder pieces
  const shp=(c,n,gem)=>[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<n;i++){const r=.11-i*.016,x=sp[0]+s*(.006+i*.018),y=.99-i*.04,rz=-s*(.3+i*.3);k.p(a,'hem','c',i?mdSh(c,.9):c,x,y,0,r,r*.5,r*1.05,0,0,rz);k.p(a,'tor','m',T,x,y-.002,0,r*1.04,.01,r*1.1,0,0,rz)}
    if(gem)k.p(a,'oct',G?'g':'m',G||d.gem,sp[0]+s*.03,1.04,.0,.014)});
  if(st=='robe'){mdTS(B,P,.88,1.0,off()+.02,{col:rd,lip:.04});mdSk(B,P,.6,long,.09,.022,[.2,.24],{col:tr})}
  else if(st=='witch'){mdTS(B,P,.82,1.0,off()+.022,{col:m=>Math.round(m.c*5+m.y*14)%3==0?0x5a4a34:0x4a3a2a,lip:.06});
    // charms: bone, herb bundles, a little bottle hanging from the belt
    [[-.08,0xe0d6bc,'cone4'],[-.12,0x5a7a3a,'box'],[-.16,0x8a6a40,'sph'],[.14,0x6aa0a0,'cyl']].forEach(([x,c,g],i)=>{const z=mdTorsoAt(P,.6).f+off()+.012;k.L('pelvis','c',0x3a2a1a,[x,.585,z],[x,.52-i*.012,z+.01],.003,.003,3);k.p('pelvis',g,g=='cyl'?'g':'c',c,x,.5-i*.012,z+.012,.016,.03,.014)});
    for(let i=0;i<5;i++){const p=mdTP(P,.78-i*.035,-.95+i*.1,off()+.01);k.p('spine','box','c',0x6a8a4a,p[0],p[1],p[2],.03,.008,.008,0,0,.6+i*.2)}}
  else if(st=='moss'){mdTS(B,P,.84,1.0,off()+.024,{col:m=>Math.round(m.c*6)%2?mdSh(rb,1.15):rd,lip:.06});
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,p=mdTP(P,.86,a,off()+.07);k.p('chest','cone4','c',i%2?mdMix(rb,0x8ab04a,.4):mdSh(rb,.8),p[0],p[1]-.02,p[2],.022,.05,.012,Math.cos(a)*.6,a,0);mdOW(k,mdTorsoW(.86))}
    [-1,1].forEach(s=>{const p=mdTP(P,.9,s*.25,off()+.03);k.p('chest','box','c',0x6a4a2a,p[0],p[1],p[2],.012,.03,.012,0,0,Math.PI/2)})}
  else if(st=='pyre'||st=='binder'){mdTS(B,P,.66,.98,off()+.008,{col:tr,keep:m=>Math.abs(m.c)<.1});mdTS(B,P,.95,1.06,off()+.03,{col:rd,lipT:.035,keep:m=>m.s<.6});
    if(st=='pyre'){stole(mdSh(rb,.6),T,.2);shp(rd,2,0);for(let i=0;i<3;i++)k.p('chest','cone4',G?'g':'c',G||0xe06a28,-.02+i*.02,.86+(i==1?.02:0),mdTorsoAt(P,.86).f+off()+.016,.012,.05+(i==1?.02:0),.004)}
    else{// spellbinder: chains across the chest, runic bands, books on the belt
      [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=10;i++){const t=i/10,y=.94-t*.22+Math.sin(t*Math.PI)*-.04,a=s*(.5-t*1.0);pts.push(mdTP(P,y,a,off()+.02))}
        for(let i=0;i<pts.length;i++){k.p('chest','tor','m',mdSh(T,1.35),pts[i][0],pts[i][1],pts[i][2],.017,.008,.017,i%2?Math.PI/2:0,0,0);mdOW(k,mdTorsoW(pts[i][1]))}});
      mdSk(B,P,.6,long,.09,.024,[.5,.54],{col:m=>Math.floor((Math.atan2(m.x,m.z)+Math.PI)/(Math.PI*2)*14+.5)%2?A:mdSh(A,.45),t:G?'g':'c'});
      [-1,1].forEach(s=>{k.p('pelvis','box','c',s<0?0x6a3a1a:0x3a2a4a,s*.17,.52,.07,.05,.07,.025,0,s*.6,0);k.p('pelvis','box','c',0xd8ccb0,s*.17+s*.004,.52,.07,.046,.064,.028,0,s*.6,0)});
      [-1,1].forEach(s=>{const R=mdArm(P,s);mdLB(B,R,2.2,.008,.016,T)})}}
  else if(st=='vestments'||st=='regalia'||st=='star'){mdTS(B,P,.92,1.08,off()+.034,{col:m=>m.s>0?tr:rd,lipT:.05,keep:m=>m.s<.5});
    mdTS(B,P,.66,.98,off()+.008,{col:tr,keep:m=>Math.abs(m.c)<.12});
    if(st=='vestments'){stole(0x2a2a3a,0xc8bca0,.12);shp(0xd8ccb0,2,1);mdTS(B,P,.7,.72,off()+.012,{col:0xd8ccb0})}
    else if(st=='regalia'){stole(mdSh(A,.55),T,.1);shp(rd,3,1);mdSk(B,P,.6,long,.1,.026,[0,.4,.62,.66],{col:m=>m.y<.27?mdSh(T,.9):rd,e:[0,0,0,.008],keep:m=>!(m.s>.8)});
      const f=mdTorsoAt(P,.88).f+off()+.016;k.p('chest','oct','m',T,0,.88,f,.036,.04,.014);k.p('chest','oct',G?'g':'m',G||d.gem,0,.88,f+.008,.02,.026,.012)}
    else{// starweaver: stars on the robe and a constellation trim
      shp(rd,2,1);const S=[[.08,.82],[-.1,.74],[.12,.66],[-.06,.9]];S.forEach(([x,y],i)=>{const z=mdTorsoAt(P,y).f+off()+.006;mdStar(k,'chest',G&&i<2?'g':'m',G&&i<2?G:T,x,y,z,.012,mdTorsoW(y))});
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.3,y=.2+((i*37)%5)*.05,q=mdSkR(P,.6,long,.09,(.6-y)/(.6-long));const r=q.rx+.022,x=Math.sin(a)*r,z=Math.cos(a)*(Math.cos(a)>0?q.f:q.b)+Math.cos(a)*.022;
        k.p('pelvis','oct',G&&i%3==0?'g':'m',G&&i%3==0?G:T,x,y,z,.01);mdOW(k,mdSkW(P,.6)(x,y))}}}
  if(lv>=2&&st!='regalia'){const f=mdTorsoAt(P,.84).f+off()+.012;k.p('chest','oct','m',T,0,.84,f,.026,.03,.01);k.p('chest','oct',G?'g':'m',G||d.gem,0,.84,f+.006,.016,.02,.01)}
  if(G&&d.GB)mdSk(B,P,.6,long,.09,.03,[.97,.99],{t:'g',col:G})}

// =====================================================================================================
// helm (mdHelmHair in zzN_model_gear.js decides how much hair stays)
// =====================================================================================================
function mdHelmO(B,P,d){mdDX(d);const H=P._H||(P._H=mdHeadR(P)),M=d.M,A=d.A,G=d.G,T=d.T,lv=d.lv,dk=d.dk,k=mdKP(),st=d.st,hz=y=>mdHeadZ(P,y),slit=G||0x0a0806,top=H[H.length-1].y,ps=mdSh(M,1.15);
  const dome=(y0,off,col,t)=>mdLoft(B,H.filter(r=>r.y>=y0),{seg:10,off,t:t||'m',capB:true,col:col||M});
  const full=(off,col,face,sq)=>mdLoft(B,H,{seg:10,off,t:'m',capB:true,capA:false,sq:sq||0,col:m=>face&&face(m)||col||M});
  const rim=(y,off,col,t,h)=>{const R=H.filter(r=>Math.abs(r.y-y)<.045);if(R.length<2)return;const a=R[0],b=R[R.length-1],L=(u)=>{const t2=(u-a.y)/(b.y-a.y);return {p:[0,u,a.p[2]+(b.p[2]-a.p[2])*t2],rx:a.rx+(b.rx-a.rx)*t2,f:a.f+(b.f-a.f)*t2,b:a.b+(b.b-a.b)*t2,w:a.w,y:u}};
    mdLoft(B,[L(y-(h||.012)),L(y+(h||.012))],{seg:10,off,t:t||'m',col})};
  const hAt=y=>{for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y||i==H.length-2){const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y))),L=(u,v)=>u+(v-u)*t;return {p:[0,y,L(a.p[2],b.p[2])],rx:L(a.rx,b.rx),f:L(a.f,b.f),b:L(a.b,b.b),w:a.w,y}}}return H[0]};
  const cutTop=yl=>{for(let i=0;i<H.length-1;i++)if((H[i].y+H[i+1].y)/2>=yl)return i;return H.length-1};
  const rivR=(y,off,col,n,skipF)=>{const r=hAt(y);for(let i=0;i<n;i++){const a=i/n*Math.PI*2,ca=Math.cos(a);if(skipF&&ca>.8)continue;k.p('head','oct','m',col,Math.sin(a)*(r.rx+off),y,r.p[2]+ca*((ca>0?r.f:r.b)+off),.0075)}};
  const hood=(off,col,open,o)=>{o=o||{};const fy=o.fy||1.21;mdLoft(B,H,{seg:10,off,t:'c',capB:true,col:m=>m.y<1.04?mdSh(col,.85):col,keep:m=>!(m.s>(open||.3)&&m.y<fy&&m.y>1.0)});
    mdLoft(B,[{p:[0,1.04,-.005],rx:.1+off,f:.08,b:.1+off,w:[['neck',.5],['head',.5]]},{p:[0,.995,-.01],rx:.15+off,f:.11,b:.13+off,w:[['chest',.5],['neck',.5]]},{p:[0,.95,-.01],rx:.2+off,f:.14,b:.15+off,w:[['chest',1]]}],
      {seg:12,t:'c',col:o.drape||mdSh(col,.9),keep:m=>!(m.s>.7&&m.y>1.0)});
    // trim along the face opening
    if(o.trim!=null){const seg=10,E=[],it=cutTop(fy),Hs=H.filter((r,i)=>r.y>1.0&&i<=it);Hs.forEach(r=>E.push(mdHV(r,2,seg,off+.004)));const Rt=Hs[Hs.length-1];
      for(let ki=1;ki>=-1;ki--)E.push(mdHV(Rt,ki,seg,off+.006));for(let i=Hs.length-1;i>=0;i--)E.push(mdHV(Hs[i],-2,seg,off+.004));
      mdEdge(k,'head',o.trimT||'c',o.trim,E,.011)}
    if(o.tip!==false)k.L('head','c',col,[0,top-.03,-.09],[0,top-.07,-.2],.04,.008,5);
    if(o.band!=null)mdLoft(B,[{p:[0,.965,-.01],rx:.18+off,f:.128,b:.142+off,w:[['chest',1]]},{p:[0,.95,-.01],rx:.2+off+.004,f:.142,b:.154+off,w:[['chest',1]]}],{seg:12,t:'c',col:o.band,keep:m=>!(m.s>.7)})};
  const face=(c,y0,y1,s0,edge)=>{mdLoft(B,H,{seg:10,off:.012,t:'c',col:c,keep:m=>m.s>(s0==null?-.25:s0)&&m.y>y0&&m.y<y1});
    if(edge!=null){const r0=H[cutTop(y1)],E=[];for(let ki=-2;ki<=2;ki++)E.push(mdHV(r0,ki,10,.016));mdEdge(k,'head',lv>=2?'m':'c',edge,E,.008)}};
  const horns=(c,sz,up,band)=>[-1,1].forEach(s=>{const x=mdHeadX(P,1.2)+.01,a=[s*x,1.2,0],b=[s*(x+.07*sz),1.24+.02*sz,-.02],c2=[s*(x+.1*sz),1.3+.06*sz*(up||1),-.03];
    k.L('head','c',c,a,b,.032*sz,.022*sz,6).L('head','c',mdSh(c,.8),b,c2,.022*sz,.003,6);if(band)k.p('head','tor','m',band,s*(x+.012),1.208,-.004,.034*sz,.014,.034*sz,0,0,s*1.1)});
  const crest=(c,n,h,c2)=>{for(let i=0;i<n;i++){const a=-.6+i*(1.6/(n-1)),y=1.17+Math.cos(a)*.12,z=Math.sin(a)*.12;k.p('head','box','m',i%2&&c2?c2:c,0,y+h*.3,z-.01,.014,h*(1-Math.abs(a+.2)*.3),.05,a)}};
  const plume=(c,c2,n,len)=>{let p=[0,top+.02,-.02];for(let i=0;i<n;i++){const q=[0,top+.04-i*.03-i*i*.008,-.06-i*.05];k.L('head','c',i%2?c2:c,p,q,.034-i*.003,.03-i*.003,5);p=q}};
  const visor=m=>m.s>.6&&Math.abs(m.y-1.145)<.014?slit:null;
  const breaths=(n,x0)=>{for(let i=0;i<n;i++){const y=1.07+(i%3)*.016,x=(x0||.03)+Math.floor(i/3)*.016;k.p('head','box','c',0x0a0806,x,y,hz(y)+.022,.008,.004,.008)}};
  const pts=(c,n,h,y,t)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=mdHeadX(P,y)+.016,big=i==0;k.p('head','cone4',t||'m',c,Math.sin(a)*r,y+.03*(big?1.5:1)*h,Math.cos(a)*r*1.05,.018,(.06*(big?1.5:1))*h,.018)}};
  const gemF=(c,y,sz)=>k.p('head','oct',G?'g':'m',G||c,0,y,hz(y)+.016,.02*(sz||1),.026*(sz||1),.012);
  const aventail=(c)=>{const mc=mdMix(c,0x6a6c70,.3),md=mdSh(mc,.78);mdLoft(B,[{p:[0,1.07,-.005],rx:.11,f:.1,b:.11,w:[['head',1]]},{p:[0,1.0,-.01],rx:.15,f:.12,b:.13,w:[['neck',.6],['head',.4]]},{p:[0,.955,-.01],rx:.2,f:.15,b:.155,w:[['chest',1]]}],
    {seg:12,t:'m',col:m=>Math.round(m.y*60)%2?mc:md,keep:m=>!(m.s>.55&&m.y>1.0)})};
  if(d.a=='heavy'){
    if(st=='nasal'){aventail(M);dome(1.13,.022);rim(1.15,.026,T);k.p('head','box','m',T,0,1.12,hz(1.12)+.024,.022,.08,.014);rivR(1.15,.03,T,10,1);dome(1.22,.024,ps)}
    else if(st=='horned'){aventail(M);dome(1.13,.022);rim(1.15,.026,T);k.p('head','box','m',T,0,1.12,hz(1.12)+.024,.022,.08,.014);rivR(1.15,.03,T,10,1);horns(0xd8ccb0,1,1,T);
      // cheek guards
      [-1,1].forEach(s=>k.p('head','box','m',M,s*(mdHeadX(P,1.09)+.022),1.08,.03,.012,.07,.06,0,0,0));crest(T,4,.02)}
    else if(st=='great'){full(.024,M,m=>visor(m)||(m.s>.6&&m.y<1.13&&m.y>1.04&&Math.abs(m.c)<.25?ps:null));rim(1.2,.028,T);rim(1.165,.028,T,'m',.006);breaths(6,.03);breaths(6,-.06);
      k.p('head','box','m',T,0,1.1,hz(1.1)+.03,.012,.08,.012);rivR(1.2,.032,T,8,0);crest(T,5,.03,ps)}
    else if(st=='visage'){full(.024,M,m=>m.s>.5&&m.y>1.12&&m.y<1.16&&Math.abs(m.c)>.06?slit:m.s>.75&&m.y<1.1?mdSh(M,.75):null);crest(T,7,.07,M);rim(1.2,.028,T);
      [-1,1].forEach(s=>{k.p('head','box','m',T,s*.04,1.168,hz(1.168)+.026,.04,.008,.008,0,0,s*.25)});breaths(6,.03);plume(d.R||mdSh(A,.8),mdSh(d.R||A,.6),5)}
    else if(st=='winged'){full(.024,M,visor);rim(1.2,.028,T);rim(1.1,.028,T,'m',.008);crest(T,5,.05);[-1,1].forEach(s=>{const x=mdHeadX(P,1.17)+.03;for(let j=0;j<4;j++)k.p('head','box','m',j%2?M:T,s*(x+j*.012),1.19+j*.04,-.04-j*.02,.012,.11-j*.018,.07,-.35,0,-s*(.5+j*.25))});
      gemF(d.gem,1.19,1.1);breaths(6,.03)}
    else if(st=='barbute'){full(.024,M,m=>(m.s>.55&&Math.abs(m.y-1.145)<.016)||(Math.abs(m.c)<.12&&m.s>.6&&m.y<1.15&&m.y>1.05)?slit:null);rim(1.2,.028,T);rivR(1.2,.032,T,8,0);
      horns(0x8a1a1a,.85,1,T);plume(0x8a1420,0x5a0a10,6);k.p('head','sph',G?'g':'c',G||0xa01020,0,1.215,hz(1.215)+.03,.012,.014,.008);k.p('head','cone4',G?'g':'c',G||0xa01020,0,1.232,hz(1.232)+.03,.009,.022,.006)}
    else if(st=='bucket'){full(.026,M,m=>m.s>.6&&Math.abs(m.y-1.15)<.012?slit:null,.55);rim(1.2,.03,T);rim(1.07,.03,T);breaths(9,.024);
      k.p('head','box','m',T,0,1.14,hz(1.14)+.03,.016,.12,.012);rivR(1.2,.034,T,10,0);
      // tower crest: crenellations on the top
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('head','box','m',i%2?T:M,Math.sin(a)*.07,top+.01,Math.cos(a)*.07,.03,.04,.03,0,a,0)}}
    else{/*crowned*/full(.024,M,visor);rim(1.2,.03,T);rim(1.22,.026,T);pts(T,8,1.2,1.235);horns(0x2a2420,1.1,1.4,T);gemF(d.gem,1.215,1.1);breaths(6,.03);
      for(let i=0;i<4;i++){const a=(i-1.5)*.5;k.p('head','oct',G?'g':'m',G||mdSh(T,.8),Math.sin(a)*(mdHeadX(P,1.21)+.03),1.21,Math.cos(a)*(hz(1.21)+.03),.009)}}
    if(G&&d.GB&&st!='winged'&&st!='crowned'&&st!='barbute')gemF(d.gem,1.205,.8)}
  else if(d.a=='medium'){const tr=lv>=2?T:mdSh(M,.7),tt=lv>=2?'m':'c';
    if(st=='hood'){hood(.03,M,.3,{trim:mdSh(M,.7),band:mdSh(M,.75)})}
    else if(st=='pelt'){hood(.034,M,.3,{tip:false,trim:0xd8ccb0,band:0x6a5a48});[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.07,top+.02,-.01,.035,.08,.025,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,top-.01,.07,.07,.04,.08,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.025,top-.035,.115,.008,.03,.008,Math.PI))}
    else if(st=='cowl'){hood(.03,M,.3,{trim:tr,trimT:tt,band:A});face(A,1.04,1.125,.15,tr);[-1,1].forEach(s=>k.p('head','oct','m',T,s*.075,1.1,hz(1.1)-.01,.01))}
    else if(st=='skullhood'){hood(.034,M,.3,{tip:false,trim:0xd8ccb0});k.p('head','sph','c',0xd8ccb0,0,top-.02,.04,.09,.06,.09);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.03,top-.03,.12,.02,.014,.01);k.L('head','c',0xd8ccb0,[s*.07,top,0],[s*.13,top+.05,-.05],.018,.004,5)});
      for(let i=0;i<5;i++)k.p('head','cone4','c',0xece4cc,-.04+i*.02,top-.06,.125,.006,.02,.006,Math.PI)}
    else if(st=='galemask'||st=='wind'){face(mdSh(A,.9),1.125,1.17,.2,T);[-1,1].forEach(s=>{const x=mdHeadX(P,1.16)+.012;for(let j=0;j<5;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(x+j*.008),1.16+j*.025,-.02-j*.025,.012,.11-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});
      if(st=='wind')hood(.032,M,.3,{tip:false,trim:A,trimT:'m'});else{rim(1.19,.016,mdSh(M,.7),'c');gemF(d.gem,1.19,.8)}}
    else if(st=='feather'){dome(1.16,.02,M,'c');rim(1.165,.024,mdSh(M,.75),'c',.014);rim(1.175,.026,A,'c',.005);
      k.L('head','c',0x8a6a3a,[.06,1.21,-.02],[.13,1.33,-.1],.012,.002,4);k.L('head','c',0x5a7a3a,[.07,1.2,-.04],[.12,1.3,-.16],.01,.002,4);
      // leaf brooch
      k.p('head','oct','c',0x6a8a3a,.085,1.19,-.01,.022,.012,.012,0,0,.6);k.p('head','oct','m',T,.085,1.19,0,.008)}
    else{/*deadeye*/hood(.03,M,.3,{trim:A,band:mdSh(M,.7)});face(mdSh(M,.6),1.04,1.125,.15,A);k.p('head','box','c',0x14100c,.04,1.145,hz(1.145)+.012,.034,.03,.008);k.p('head','ring','m',T,.04,1.145,hz(1.145)+.014,.02,.15,.02,Math.PI/2);
      k.p('head','cyl','g',G||0xc03020,.04,1.145,hz(1.145)+.018,.008,.004,.008,Math.PI/2);for(let i=0;i<3;i++)k.L('head','c',i==1?0xe8e0d0:A,[-.06,top-.03,-.08],[-.12-i*.02,top+.05-i*.02,-.14],.012,.002,4)}
    if(G&&d.GB)gemF(d.gem,1.2,.7)}
  else if(d.a=='light'){const dm=0x2a2c32;
    if(st=='wrap'){face(M,1.04,1.13,.05,mdSh(M,.7));rim(1.19,.016,mdSh(M,.8),'c');k.L('head','c',mdSh(M,.75),[0,1.19,-.11],[.03,1.1,-.17],.016,.008,4)}
    else if(st=='viper'){face(M,1.04,1.13,.05,A);for(let i=0;i<5;i++){const a=-.4+i*.3;k.p('head','cone4','c',A,0,1.17+Math.cos(a)*.115,Math.sin(a)*.115,.016,.05,.02,a)}
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.02,1.06,hz(1.06)+.012,.006,.022,.006,Math.PI))}
    else if(st=='ashcowl'){hood(.022,M,.32,{tip:false,fy:1.2,trim:dm,trimT:'m'});face(mdSh(M,.8),1.04,1.13,.1,T)}
    else if(st=='glassmask'){face(mdSh(M,.55),1.04,1.2,.1);[-1,1].forEach(s=>k.p('head','box',G?'g':'m',G||A,s*.04,1.145,hz(1.145)+.016,.026,.014,.006));rim(1.19,.016,M,'c');
      mdEdge(k,'head','m',T,[-2,-1,0,1,2].map(ki=>mdHV(H[cutTop(1.2)],ki,10,.016)),.007);k.p('head','oct','m',T,0,1.16,hz(1.16)+.018,.012,.02,.008)}
    else if(st=='stormhood'){hood(.026,M,.32,{trim:G||A,trimT:G?'g':'m'});face(mdSh(M,.6),1.04,1.13,.1,T);rim(1.2,.034,G||A,G?'g':'m',.006)}
    else if(st=='bandana'){face(M,1.04,1.13,.05,0x6a1a1a);dome(1.18,.016,mdSh(M,.75),'c');k.L('head','c',mdSh(M,.75),[0,1.18,-.11],[.03,1.1,-.18],.02,.01,4);k.L('head','c',0x6a1a1a,[0,1.18,-.11],[-.03,1.08,-.17],.016,.008,4);
      k.p('head','box','m',0xb8bec8,.06,1.2,hz(1.2)-.01,.008,.04,.004,0,.6,.5)}
    else if(st=='venom'){face(mdSh(M,.7),1.04,1.13,.05,A);[-1,1].forEach(s=>k.p('head','box',G?'g':'c',G||A,s*.04,1.145,hz(1.145)+.006,.03,.006,.006));
      // serpent across the brow
      for(let i=0;i<7;i++){const a=-.9+i*.3,r=mdHeadX(P,1.19)+.012;k.p('head','oct','c',i%2?A:mdSh(A,.7),Math.sin(a)*r,1.19+Math.sin(i*1.3)*.008,Math.cos(a)*(hz(1.19)+.012)*.98,.014,.012,.014)}}
    else{/*dusk*/hood(.024,M,.32,{tip:false,trim:T,trimT:'m'});face(A,1.04,1.13,.05,T);k.L('head','c',A,[0,1.14,-.13],[.05,.95,-.2],.03,.012,4);
      // crescent moon on the brow
      for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p('head','box','m',T,Math.cos(a)*.022,1.21+Math.sin(a)*.022,hz(1.21)+.03,.006,.016,.004,0,0,a)}}
    if(G&&d.GB)gemF(d.gem,1.2,.7)}
  else{ // cloth
    if(st=='linen'){hood(.036,M,.25,{trim:A,band:mdSh(M,.85)})}
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.26:.22,c=st=='witch'?mdSh(M,.6):M;k.p('head','cyl','c',mdSh(c,.85),0,1.235,0,br,.018,br);rim(1.235,.022,A,'c');
      k.L('head','c',c,[0,1.24,0],[.02,1.42,-.04],.11,.06,8).L('head','c',mdSh(c,.92),[.02,1.42,-.04],[.08,1.53,-.12],.06,.025,7).L('head','c',mdSh(c,.82),[.08,1.53,-.12],[.15,1.56,-.18],.025,.004,6);
      k.p('head','cyl','c',A,0,1.26,0,.115,.03,.115);k.p('head','box','m',T,0,1.26,.112,.03,.03,.008);
      if(st=='witch'){// charms on the brim, a feather in the band
        [[.15,0xe0d6bc,'cone4'],[-.12,0x6a8a4a,'box'],[.02,0x8a5a3a,'sph']].forEach(([x,cc,g])=>{const z=Math.sqrt(Math.max(0,br*br-x*x))*.9;k.L('head','c',0x2a1a10,[x,1.232,z],[x,1.19,z],.003,.003,3);k.p('head',g,'c',cc,x,1.18,z,.012,.02,.01)});
        k.L('head','c',0x6a5a3a,[-.1,1.26,.06],[-.18,1.36,.02],.01,.002,4)}
      if(G)k.p('head','oct','g',G,0,1.27,.115,.016)}
    else if(st=='circlet'){rim(1.19,.016,T,'m',.008);gemF(d.gem,1.19);[-1,1].forEach(s=>k.p('head','oct','m',T,s*.05,1.19,hz(1.19)-.008,.008))}
    else if(st=='diadem'){rim(1.19,.016,T,'m',.01);for(let i=0;i<5;i++){const a=(i-2)*.32,x=Math.sin(a)*(mdHeadX(P,1.19)+.016),z=Math.cos(a)*(hz(1.19)+.016);k.p('head','cone4','m',T,x,1.22+(i==2?.025:0),z,.014,.05+(i==2?.04:0),.01,.0,0,-a*.3)}gemF(d.gem,1.205,1.2);
      [-1,1].forEach(s=>k.p('head','oct',G?'g':'m',G||mdSh(d.gem,.8),s*.06,1.2,hz(1.2)-.012,.009))}
    else if(st=='crown'){rim(1.2,.02,T);rim(1.225,.022,T,'m',.008);pts(T,9,1,1.235);gemF(d.gem,1.21,1.3);[-1,1].forEach(s=>k.p('head','oct','m',d.gem,s*.08,1.21,hz(1.21)-.03,.012));
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=mdHeadX(P,1.235)+.016;k.p('head','sph',G&&i%3==0?'g':'m',G&&i%3==0?G:mdSh(T,1.1),Math.sin(a)*r,1.235+.03*(i==0?1.5:1)+.03,Math.cos(a)*r*1.05,.008)}}
    else if(st=='tallcowl'){hood(.034,M,.28,{tip:false,trim:T,trimT:'m',band:A});k.L('head','c',M,[0,top-.01,-.03],[0,top+.16,-.1],.07,.004,7);rim(1.2,.04,A,G?'g':'c',.008);
      for(let i=0;i<3;i++)k.p('head','box',G?'g':'m',G||A,0,top+.02+i*.035,-.04-i*.018,.012,.012,.004,0,0,Math.PI/4)}
    else{/*star*/hood(.034,M,.28,{trim:T,trimT:'m',band:A});rim(1.2,.04,G||A,G?'g':'m',.008);for(let i=0;i<5;i++){const a=(i-2)*.38;mdStar(k,'head',G?'g':'m',G||T,Math.sin(a)*.145,1.225,Math.cos(a)*.15,i==2?.012:.008)}}}
  mdKit(B,k)}

// =====================================================================================================
// boots
// =====================================================================================================
function mdBootsO(B,P,d){mdDX(d);const M=d.M,A=d.A,G=d.G,dk=d.dk,st=d.st,k=mdKP(),a=d.a,T=d.T==null?MD_TRIM[d.ti|0]:d.T,lv=d.lv==null?(d.ti|0):d.lv,ps=mdSh(M,1.15);
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh',L=mdLeg(P,s),F=mdFoot(P,s);
    if(d.R&&!(a=='cloth'&&st=='sandal'))mdLB(B,L,a=='heavy'?5.75:a=='cloth'&&st=='slipper'?5.75:5.2,.005,a=='heavy'?.032:.03,d.R,{});
    if(a=='heavy'){const off=.022;
      // sabaton lames across the foot, greave with trims, knee cop with a fan
      mdFS(B,P,s,off,{t:'m',col:m=>m.y<.03?dk:(Math.round(m.z*40)%2&&m.z>F[1].p[2]?ps:M)});
      for(let i=0;i<3;i++){const q=mdRAt(F,1.4+i*.6);mdLoft(B,[Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]-.006]}),Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]+.006]})],{seg:7,off:off+.006,t:'m',col:i==0&&lv>=2?T:mdSh(M,.85),ref:[0,1,0],keep:m=>m.y>.03})}
      mdLS(B,P,s,st=='hobnail'?4:3,6,off,{t:'m',col:m=>m.y>.27?ps:m.s>.6&&lv>=2?ps:M});
      mdLB(B,L,6,.008,off+.008,T,{});if(st!='hobnail')mdLB(B,L,4.1,.008,off+.008,lv>=2?T:mdSh(M,.8),{});else{mdLB(B,L,4.2,.016,off+.006,0x3a2618,{t:'c',fl:.012});mdLB(B,L,5,.006,off+.004,0x3a2618,{t:'c'});mdBuckle(k,l+'1',L[4].p[0]+s*(L[4].rx+.024),.21,L[4].p[2],.6,T,0x3a2618,L[4].w,s*Math.PI/2)}
      if(st!='hobnail'){const K=L[3],kp=K.p;k.p(l+'1','sph','m',ps,kp[0],kp[1],kp[2]+K.f+.03,.045,.05,.034);mdOW(k,K.w);k.p(l+'1','box','m',T,kp[0]+s*.045,kp[1],kp[2]+K.f+.012,.012,.06,.05,0,0,0);mdOW(k,K.w);
        if(lv>=3){k.p(l+'1','box','m',T,kp[0],kp[1]+.045,kp[2]+K.f+.03,.06,.012,.03,.3);mdOW(k,K.w)}
        if(st=='stomper'||st=='tread'||st=='wall'||st=='warlord'){k.p(l+'1','cone4','m',T,kp[0],kp[1],kp[2]+K.f+.075,.016,.05,.016,Math.PI/2);mdOW(k,K.w)}
        // rivets down the greave
        for(let i=0;i<3;i++){const q=mdRAt(L,4+i*.6);k.p(l+'1','oct','m',T,q.p[0]+s*(q.rx+off+.002),q.p[1],q.p[2],.007);mdOW(k,q.w)}}
      if(st=='tread'||st=='blood'||st=='warlord')k.L(l+'1','m',mdSh(T,1.05),[s*.15,.2,0],[s*.2,.26,-.02],.016,.002,4);
      if(st=='wall'){mdLB(B,L,5.3,.03,off+.006,mdSh(M,1.08),{});mdLB(B,L,5.6,.006,off+.012,T,{})}
      if(G)mdLB(B,L,5.6,.005,off+.01,G,{t:'g',keep:m=>m.s>0})}
    else if(a=='medium'){const off=.016,lt=0x3a2618,top=st=='trail'||st=='path'?5:4;
      mdFS(B,P,s,off,{col:m=>m.y<.03?0x1e1610:m.y<.045?mdSh(M,.75):M});mdLS(B,P,s,top,6,off,{col:M});
      // folded cuff (fur for pelt/path), laces up the front, a strap with buckle
      const fur=st=='pelt'||st=='path';mdLB(B,L,top+.05,.02,off+.012,fur?0xd8ccb0:mdSh(M,1.18),{t:'c',fl:.012,col:fur?(m=>Math.round(m.c*5+m.s*3)%2?0xd8ccb0:0xb8ac90):mdSh(M,1.18)});
      for(let i=0;i<4;i++){const q=mdRAt(L,top+.4+i*((6-top-.5)/3));if(q.p[1]<.08)continue;[-1,1].forEach(j=>{k.p(l+'1','box','c',0xd8c8a0,q.p[0],q.p[1],q.p[2]+q.f+off+.004,.03,.004,.004,0,0,j*.5);mdOW(k,q.w)})}
      mdLB(B,L,5.7,.008,off+.006,lt,{t:'c'});const q=mdRAt(L,5.7);mdBuckle(k,l+'1',q.p[0]+s*(q.rx+off+.01),q.p[1],q.p[2],.55,T,lt,q.w,s*Math.PI/2);
      if(st=='stalker'||st=='strider'||st=='gale'){mdLS(B,P,s,4,6,off+.004,{col:A,keep:m=>m.s>.5&&Math.round(m.y*45)%2==0})}
      if(st=='gale'||st=='trail'&&lv>=4){for(let i=0;i<3;i++)k.p(l+'1','cone4','c',i%2?A:0xe8e8f0,L[4].p[0]+s*(L[4].rx+.02),.24+i*.02,-.02-i*.02,.01,.07,.004,-.5,0,-s*.5)}
      if(st=='stalker'||st=='strider'){mdLB(B,L,4.6,.006,off+.01,T,{})}
      if(G)k.p(l+'1','oct','g',G,L[5].p[0],L[5].p[1],L[5].p[2]+L[5].f+off+.006,.012)}
    else if(a=='light'){const off=.012,dm=0x2a2c32;mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='soft'?5:4,6,off,{col:m=>Math.round(m.y*40)%2?M:mdSh(M,.75)});
      // wraps, ankle strap, shin guard of dark metal, a small blade at the boot
      mdLB(B,L,st=='soft'?5.05:4.05,.008,off+.006,mdSh(M,.65),{t:'c'});mdLB(B,L,5.85,.006,off+.006,T,{});
      if(st!='soft'){const R=[mdRAt(L,4.2),mdRAt(L,5.4)];mdLoft(B,R,{seg:8,off:off+.008,t:'m',col:lv>=3?mdSh(M,.9):dm,keep:m=>m.s>.45})}
      if(st=='wrapped'){mdLS(B,P,s,3,4,off,{col:mdSh(M,.8)});mdLB(B,L,3.4,.006,off+.006,mdSh(M,.6),{t:'c'})}
      if(st=='storm'||st=='glass'){mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.14&&m.s>0})}
      if(s>0&&lv>=2){const q=mdRAt(L,4.8);k.p(l+'1','box','m',0xb8bec8,q.p[0]+(q.rx+off+.008),q.p[1]+.02,q.p[2],.004,.07,.012);mdOW(k,q.w);k.p(l+'1','box','c',0x241812,q.p[0]+(q.rx+off+.008),q.p[1]-.02,q.p[2],.008,.03,.014);mdOW(k,q.w)}}
    else{const off=.01;
      if(st=='sandal'){mdFS(B,P,s,.004,{col:P.col.skin});mdLoft(B,F.slice(0,4),{seg:7,off:.008,ref:[0,1,0],col:m=>m.y<.03?0x3a2618:M,keep:m=>m.y<.03||Math.round(m.i*2)%2==0});mdLS(B,P,s,5,6,.008,{col:M,keep:m=>Math.round(m.y*50)%2==0})}
      else{mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='slipper'?6:5,6,off,{col:M});if(st=='tempest'||st=='lich'||st=='slipper'&&lv>=1)k.p(l+'2','cone4','c',A,F[4].p[0],.05,F[4].p[2]+.03,.022,.06,.018,Math.PI/2-.4);
        // embroidered cuff and a band over the instep
        mdLB(B,L,st=='slipper'?5.9:5.05,.008,off+.006,lv>=2?T:A,{t:lv>=2?'m':'c'});const q=mdRAt(F,2.2);mdLoft(B,[Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]-.008]}),Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]+.008]})],{seg:7,off:off+.004,ref:[0,1,0],col:A,keep:m=>m.y>.03});
        if(lv>=3){k.p(l+'2','oct',G?'g':'m',G||d.gem||A,F[2].p[0],F[2].p[1]+F[2].f+off+.004,F[2].p[2],.01)}
        if(st!='slipper')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.13&&Math.round(m.c*4)%2==0})}}});
  mdKit(B,k)}

// =====================================================================================================
// class capes and the paladin tabard over armour
// =====================================================================================================
// with a chest piece the cape is a short half-cape on the left shoulder, so the armour's back stays visible
{const f=mdCape;mdCape=function(B,P,col,o){if(!MD_ORN||!P.hasChest)return f.apply(this,arguments);if(P.noCape)return;o=o||{};const off=(P.tOff||0)+.018,ins=mdSh(col,.58),tr=o.trim,x0=-.12;
  const at=(y,bn,rx,x)=>{const q=mdTorsoAt(P,Math.min(.97,y));return {p:[x,y,-(Math.max(q.b,.12)+off+(.97-Math.min(.97,y))*.06)],rx,f:.012,b:.012,w:bn}};
  const R=[at(.99,[['chest',.7],['cp0',.3]],.08,x0+.01),at(.88,[['cp0',1]],.11,x0-.01),at(.76,[['cp0',.5],['cp1',.5]],.12,x0-.02),at(.6,[['cp1',1]],.125,x0-.025)];
  R[0].p[2]+=.012;mdLoft(B,R,{seg:6,capA:true,capB:true,col:m=>tr!=null&&m.i>R.length-1.4?tr:m.s>.3?ins:col});
  // clasp on the shoulder
  const k=mdKP(),p=mdTP(P,.97,-.5,(P.tOff||0)+.02);k.p('chest','oct','m',tr!=null?tr:0xc9a24a,p[0],p[1],p[2],.018,.018,.01);mdKit(B,k)}}
{const f=mdTabard;mdTabard=function(B,P,c,tr,sym){if(!MD_ORN||!P.hasChest)return f.apply(this,arguments);
  const X={B,P,d:{T:tr},k:mdKP()};mdTabardO(X,c,tr,{top:.6,lo:.3,wd:.15,band:.42});
  if(sym){const k=X.k,z=Math.max(.135,mdTorsoAt(P,.6).f)+(P.tOff||0)+.012*1.15+.008,w=mdSkW(P,.6)(0,.5);k.p('pelvis','box','m',sym,0,.5,z,.016,.09,.006);mdOW(k,w);k.p('pelvis','box','m',sym,0,.52,z,.06,.016,.006);mdOW(k,w)}mdKit(B,X.k)}}

// class extras over armour: the assassin scarf becomes a slim neck scarf (the chest piece shows), the ranger's quiver
// replaces the cape on the back
{const f=mdOutfit;mdOutfit=function(cls){const O=f.apply(this,arguments);
  if(cls=='assassin'&&O.extra){const e=O.extra;O.extra=function(B,P,D){if(!MD_ORN||!D.chest)return e.apply(this,arguments);if(D.helm&&mdHelmHair(D.helm)=='none')return;
    const sc=mdMix(mdSh(D.chest.A,.7),D.chest.M,.35);mdTS(B,P,.955,1.045,(P.tOff||0)+.022,{col:m=>Math.abs(m.y-.97)<.012?mdSh(sc,.8):sc,lipT:.01,lip:.006});
    mdRib(B,[{p:[-.07,.96,-.13],n:[0,0,-1],w:[['chest',1]]},{p:[-.09,.86,-.16],n:[0,0,-1],w:[['chest',.6],['cp0',.4]]},{p:[-.1,.76,-.18],n:[0,0,-1],w:[['cp0',.5],['cp1',.5]]}],.045,.004,sc,{capB:true})}}
  if(cls=='ranger'&&O.extra){const e=O.extra;O.extra=function(B,P,D){if(MD_ORN&&D.chest)P.noCape=1;return e.apply(this,arguments)}}
  return O}}
