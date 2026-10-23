// ================= v134: the Mage's gear fitted to the raven =================
// The v114 helm builder was made for furred skulls with ears; on the raven's sloping crown and beak a flat brim floated above
// the head, hoods stood far off the skull and circlets cut through the forehead. Here every cloth head piece is built for him:
//  * rvEll(D,y,off) measures the skull's horizontal section at height y (marching out from its centre line) and returns the
//    ellipse round it, pushed out by off: hats sit down over the crown on a brim just above the brows, circlets / diadems /
//    crowns ring the head where it really is at that height (the band's front rests on the forehead above the bristles).
//  * hoods are a snug shell over the skull (open underneath, the face opening behind the eyes so the beak and eyes stay free)
//    and a cowl drape round the back and sides of the neck down onto the shoulders, open at the front so the hackles show.
//  * the nape feathers are left off under any head piece (RV.helm, set while a raven model is built).
// Every piece is lofted on the head bone (the drape blends into neck and chest), so it moves exactly with the skull.
function rvIn(D,x,y,z){const S=D.SN;if(z<S[0][0]||z>S[S.length-1][0])return false;const q=brSkullAt(D,z),dy=y-q.yc,r=dy>0?q.f:q.b;return x*x/(q.rx*q.rx)+dy*dy/(r*r)<1}
function rvEll(D,y,off){const S=D.SN;let z0=9,z1=-9;for(let z=S[0][0];z<=S[S.length-1][0];z+=.002){if(rvIn(D,0,y,z)){z0=Math.min(z0,z);z1=Math.max(z1,z)}}
  if(z0>z1){z0=z1=-.03}const zc=(z0+z1)/2,pts=[];
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2,dx=Math.sin(a),dz=Math.cos(a);let L=0;for(let s=.002;s<.3;s+=.002)if(rvIn(D,dx*s,y,zc+dz*s))L=s;pts.push([dx*(L+off),zc+dz*(L+off)])}
  let rx=.01;pts.forEach(p=>{rx=Math.max(rx,Math.abs(p[0]))});rx*=1.03;let f=.01,b=.01;
  pts.forEach(p=>{const k=Math.sqrt(Math.max(.08,1-(p[0]/rx)**2)),d=p[1]-zc;if(d>0)f=Math.max(f,d/k);else b=Math.max(b,-d/k)});
  return {zc,rx,f,b,y}}
// the raven's cloth head pieces (BRD[3].helmSet.cloth, called by brHelm)
function rvHood(X,col,o){o=o||{};const {B,k,z0}=X,D=BRD[3],ez=D.EYEP[2],zf=ez-(D.eyeR||.021)-.012,off=.02,dk=mdSh(col,.8);
  brShell(B,D,off,z0-.012,zf,m=>m.s>-.3,m=>m.z>zf-.012?dk:col,'c',18);
  brShell(B,D,off+.007,zf-.012,zf+.002,m=>m.s>-.3,mdSh(col,.9),'c',18);
  // the cowl round the back of the neck onto the shoulders, open in front
  mdLoft(B,[{p:[0,1.17,-.03],rx:.1,f:.07,b:.095,w:[['head',1]]},{p:[0,1.1,-.035],rx:.11,f:.085,b:.11,w:[['head',.8],['neck',.2]]},{p:[0,1.05,-.035],rx:.115,f:.09,b:.115,w:[['neck',.6],['head',.4]]},
      {p:[0,1.0,-.03],rx:.15,f:.115,b:.135,w:[['chest',.5],['neck',.5]]},{p:[0,.965,-.025],rx:.205,f:.14,b:.152,w:[['chest',1]]},{p:[0,.93,-.02],rx:.24,f:.165,b:.172,w:[['chest',1]]}],
    {seg:16,t:'c',col:o.drape||mdSh(col,.88),keep:m=>m.s<.12});
  if(o.tip!==false){const q=brSkullAt(D,z0),y=q.yc+q.f+off;k.L('head','c',col,[0,y-.02,z0+.01],[0,y-.05,z0-.08],.045,.012,6).L('head','c',dk,[0,y-.05,z0-.08],[0,y-.085,z0-.14],.012,.003,5)}}
function rvHat(X,o){const {B,k,A,G}=X,D=BRD[3],yb=1.214,br=o.br,c=o.col,e0=rvEll(D,yb-.006,.012),e1=rvEll(D,yb+.014,.014),R=[];
  const ring=(y,e,r)=>({p:[0,y,e.zc],rx:e.rx*r,f:e.f*r,b:e.b*r,w:[['head',1]]});
  R.push(ring(yb-.006,e0,1),{p:[0,yb,e0.zc-.005],rx:br,f:br*1.04,b:br,w:[['head',1]]},{p:[0,yb+.01,e0.zc-.005],rx:br,f:br*1.04,b:br,w:[['head',1]]},ring(yb+.014,e1,1));
  // the crown of the hat: shrinking rings bending back to a point; every ring clears the skull at its height
  const H=o.h,S=[[.05,.9,.012],[.11*H,.72,.03],[.17*H,.5,.065],[.22*H,.28,.11],[.255*H,.1,.16],[.27*H,.02,.2]];
  S.forEach(([h,r,dz])=>{const y=yb+.014+h,e=rvEll(D,y,.012),rx=Math.max(e1.rx*r,h<.08?e.rx:0),f=Math.max(e1.f*r,h<.08?e.f:0),bk=Math.max(e1.b*r,h<.08?e.b:0);
    R.push({p:[0,y-(h>.2?(h-.2)*.6:0),e1.zc-dz*(o.lean||1)],rx,f,b:bk,w:[['head',1]]})});
  mdLoft(B,R,{seg:16,t:'c',ref:[0,0,1],capB:true,col:m=>m.i<1?mdSh(c,.7):m.i<2.6?mdSh(c,.85):c});
  // the hat band, a buckle / gem at the front
  const eb=rvEll(D,yb+.02,.018);mdLoft(B,[{p:[0,yb+.016,e1.zc],rx:e1.rx+.004,f:e1.f+.004,b:e1.b+.004,w:[['head',1]]},{p:[0,yb+.038,e1.zc-.004],rx:Math.max(eb.rx,e1.rx*.93)+.004,f:Math.max(eb.f,e1.f*.93)+.004,b:Math.max(eb.b,e1.b*.93)+.004,w:[['head',1]]}],
    {seg:16,t:'c',ref:[0,0,1],col:o.band||A});
  if(G)k.p('head','oct','g',G,0,yb+.027,e1.zc+e1.f+.008,.014,.016,.008);else k.p('head','box','m',A,0,yb+.027,e1.zc+e1.f+.006,.016,.016,.006)}
function rvBand(X,st){const {B,k,A,G,d}=X,D=BRD[3],yb=1.222,lo=rvEll(D,yb,.004),hi=rvEll(D,yb+.016,.004),lo2=rvEll(D,yb,.011),hi2=rvEll(D,yb+.016,.011);
  const r=(e,y)=>({p:[0,y,e.zc],rx:e.rx,f:e.f,b:e.b,w:[['head',1]]});
  mdLoft(B,[r(lo,yb),r(lo2,yb),r(hi2,yb+.016),r(hi,yb+.016)],{seg:20,t:'m',ref:[0,0,1],col:A});
  const at=(ang,e)=>{const ca=Math.cos(ang);return [Math.sin(ang)*e.rx,e.zc+ca*(ca>0?e.f:e.b)]};
  if(st=='diadem')for(let i=0;i<5;i++){const ang=(i-2)*.34,[x,z]=at(ang,hi2);k.p('head','cone4','m',A,x*.97,yb+.04+(i==2?.024:0),z-.002,.011,.045+(i==2?.035:0),.009,0,ang,0)}
  if(st=='crown')for(let i=0;i<9;i++){const ang=i/9*Math.PI*2,[x,z]=at(ang,hi2);k.p('head','cone4','m',A,x*.97,yb+.044,z*.97+hi2.zc*.03,.013,.05*(i==0?1.5:1),.013,0,ang,0)}
  const [gx,gz]=at(0,hi2);k.p('head','oct',G?'g':'m',G||d.gem||A,gx,yb+.008,gz+.004,.015,.02,.01)}
BRD[3].helmSet={cloth:X=>{const {k,st,M,A,G,band,crown,hz}=X,D=BRD[3];
  if(st=='linen')rvHood(X,M);
  else if(st=='hat')rvHat(X,{col:M,br:.165,h:1,lean:1});
  else if(st=='witch')rvHat(X,{col:mdSh(M,.6),br:.2,h:1.2,lean:1.3,band:mdSh(A,.8)});
  else if(st=='circlet'||st=='diadem'||st=='crown')rvBand(X,st);
  else if(st=='tallcowl'){rvHood(X,M,{tip:false});const q=brSkullAt(D,crown),y=q.yc+q.f+.02;k.L('head','c',M,[0,y-.012,crown-.01],[0,y+.17,crown-.1],.068,.004,7);band(hz-.01,.036,A,'c')}
  else{/*star*/rvHood(X,M);band(hz-.01,.036,G||A,G?'g':'m');const q=brSkullAt(D,crown);for(let i=0;i<5;i++){const ang=(i-2)*.38;k.p('head','oct',G?'g':'m',G||A,Math.sin(ang)*(q.rx+.04),q.top+.03,crown+Math.cos(ang)*.12,.012)}}}};
// which head piece the raven is being built with (the head leaves its nape feathers off under one)
{const f=mdHeroB;mdHeroB=function(cls,L,E){const o=RV.helm;try{const r=brRace(L,cls);RV.helm=r==3&&E&&E.helm?(mdGD(E.helm)||{}).st||'?':null;return f.apply(this,arguments)}finally{RV.helm=o}}}
// ---------------- robes: the opening for the tail fan ----------------
// The v114 tail opening follows a round tail along D.TP; the raven's tail is a flat fan, so a race may give its own shape.
{const f=brTailNear;brTailNear=function(D,x,y,z){if(D&&D.tailNear)return D.tailNear(x,y,z);return f.apply(this,arguments)}}
// ---------------- footwear: a bird keeps its feet ----------------
// Boots are lofted over a human foot, which the raven doesn't have. On him every pair of Mage footwear is worn the way a bird
// would: the scaled shank is wrapped in the boot's colour (mdBootsPre already paints the shin), the toes and talons stay out,
// and each style adds its own pieces round the shank, the ankle and the toes:
//   sandal: crossed leather straps up the shank, a strap round each toe; slipper: a soft cloth sock over the ankle with a cuff;
//   pyre: wraps, an ankle ring, a metal shin plate with an ember; lich: dark wraps, bone spurs, bone talon caps;
//   tempest: wraps, a shin plate with a gem, metal talon caps and a winged ankle guard.
function rvBoots(B,P,d){const D=BR.R,C=BR.C,k=dkKit(),V=THREE.Vector3,st=d.st,M=d.M,A=d.A,G=d.G,dk=mdSh(M,.7),ti=d.ti|0;
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh',R=mdLeg(P,s),K=new V(...R[3].p),Ak=new V(...R[6].p),Ab=mdV(P.bones[l+'2']),lf=P.lf||1;
    // a band round the shank at t (0 = knee, 1 = ankle), lofted from the leg's own rings
    const at=t=>{const i=t<.35?3:t<.75?4:5,j=i+1,a=R[i],b=R[j],t0=[0,0,0,0,.35,.75,1][i],t1=[0,0,0,0,.35,.75,1][j]||1,u=Math.max(0,Math.min(1,(t-t0)/((t1-t0)||1))),L=(x,y)=>x+(y-x)*u;
        return {p:[L(a.p[0],b.p[0]),L(a.p[1],b.p[1]),L(a.p[2],b.p[2])],rx:L(a.rx,b.rx),f:L(a.f,b.f),b:L(a.b,b.b)}},
      bandAt=(t,h,off,col,tt,tilt)=>{const q=at(t),o2=off||.004,dy=tilt||0;mdLoft(B,[{p:[q.p[0],q.p[1]-h/2,q.p[2]],rx:q.rx+o2,f:q.f+o2,b:q.b+o2,w:[[l+'1',1]]},{p:[q.p[0],q.p[1]+h/2+dy,q.p[2]+dy*.5],rx:q.rx+o2,f:q.f+o2,b:q.b+o2,w:[[l+'1',1]]}],{seg:8,t:tt||'c',col})};
    // the toe's own joint points (as toesB builds them): a band sits in its middle segment, a cap over its claw
    const toes=D.toeList(s),toePts=q=>{const dv=new V(Math.sin(q.yaw),0,Math.cos(q.yaw)),p0=new V(Ab.x+q.root[0],q.root[1],Ab.z+q.root[2]),p1=p0.clone().add(dv.clone().multiplyScalar(q.len*.4*lf)).add(new V(0,-.008,0)),
        p2=p1.clone().add(dv.clone().multiplyScalar(q.len*.35*lf)).add(new V(0,-.005,0)),p3=p2.clone().add(dv.clone().multiplyScalar(q.len*.25*lf)).add(new V(0,-.005,0));return {dv,p:[p0,p1,p2,p3]}},
      toeAt=(q,f)=>{const T=toePts(q);return f>1?{p:T.p[3].clone().add(T.dv.clone().multiplyScalar(.012*lf)),d:T.dv}:{p:T.p[1].clone().lerp(T.p[2],f),d:T.p[2].clone().sub(T.p[1]).normalize()}},
      toeBand=(col,tt)=>toes.forEach(q=>{if(q.back)return;const {p,d:dv}=toeAt(q,.4),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),dv));k.p(l+'2','cyl',tt||'c',col,p.x,p.y,p.z,.0108*lf,.007,.0108*lf,e.x,e.y,e.z)}),
      // a metal cap over each claw
      // a metal sheath over each claw, following its hook (slightly larger than the claw, a little past its point)
      talonCaps=(col,tt)=>toes.forEach(q=>{const T=toePts(q),tp=T.p[3],c1=tp.clone().add(T.dv.clone().multiplyScalar(.012*lf)).add(new V(0,.002,0)),c2=c1.clone().add(T.dv.clone().multiplyScalar(.008*lf)).add(new V(0,-.012,0)),
          c3=c2.clone().add(c2.clone().sub(c1).normalize().multiplyScalar(.004));
        const c1b=c1.clone().add(c2.clone().sub(c1).normalize().multiplyScalar(.003));k.L(l+'2',tt||'m',col,tp.clone().add(T.dv.clone().multiplyScalar(.001)).toArray(),c1b.toArray(),.0078*lf,.006*lf,6);k.L(l+'2',tt||'m',col,c1.toArray(),c3.toArray(),.006*lf,.0014,6)}),
      ankleRing=(col,tt,r)=>{const q=at(.97);k.p(l+'1','ring',tt||'m',col,q.p[0],q.p[1]+.006,q.p[2],q.rx+(r||.008),.09,Math.max(q.f,q.b)+(r||.008))},
      shinPlate=(col)=>{const q=at(.45);k.p(l+'1','box','m',col,q.p[0],q.p[1],q.p[2]+q.f+.006,q.rx*1.05,.11,.008,-.12)};
    if(st=='sandal'){for(let i=0;i<3;i++){bandAt(.36+i*.2,.01,.008,A,'c',(i%2?1:-1)*.012)}ankleRing(dk,'c',.006);toeBand(dk)}
    else if(st=='slipper'){mdLoft(B,[{p:at(.62).p,rx:at(.62).rx+.006,f:at(.62).f+.006,b:at(.62).b+.006,w:[[l+'1',1]]},{p:at(1).p,rx:at(1).rx+.008,f:at(1).f+.008,b:at(1).b+.008,w:[[l+'1',.5],[l+'2',.5]]},
        {p:[Ab.x,.046,Ab.z+.006],rx:.043*lf,f:.042*lf,b:.04*lf,w:[[l+'2',1]]},{p:[Ab.x,.024,Ab.z+.008],rx:.04*lf,f:.04*lf,b:.036*lf,w:[[l+'2',1]]}],{seg:8,t:'c',col:M});bandAt(.62,.014,.009,A);toeBand(mdSh(M,.85))}
    else if(st=='pyre'){bandAt(.38,.012,.004,dk);bandAt(.78,.012,.004,dk);ankleRing(A);shinPlate(A);const q=at(.45);k.p(l+'1','oct',G?'g':'m',G||0xe86a20,q.p[0],q.p[1]+.01,q.p[2]+q.f+.014,.01,.014,.006)}
    else if(st=='lich'){bandAt(.38,.012,.004,dk);bandAt(.62,.012,.004,dk);bandAt(.86,.012,.004,dk);ankleRing(mdSh(M,.6));
      [-1,1].forEach(j=>{const q=at(.8);k.p(l+'1','cone4','c',0xd8ccb0,q.p[0]+j*.012,q.p[1],q.p[2]-q.b-.008,.006,.03,.006,-1.1,0,j*.3)});talonCaps(0xd8ccb0,'c');if(G)k.p(l+'1','oct','g',G,at(.5).p[0],at(.5).p[1],at(.5).p[2]+at(.5).f+.008,.008)}
    else{/*tempest*/bandAt(.38,.012,.004,dk);bandAt(.8,.012,.004,dk);shinPlate(A);ankleRing(A);talonCaps(mdSh(A,1.1));
      const q=at(.45);k.p(l+'1','oct',G?'g':'m',G||A,q.p[0],q.p[1]+.012,q.p[2]+q.f+.014,.011,.015,.007);
      [-1,1].forEach(j=>{const q=at(.9);k.p(l+'1','cone4','m',A,q.p[0]+j*(q.rx+.012),q.p[1]+.01,q.p[2]-.006,.005,.034,.012,-.5,0,j*.9)})}});
  mdKit(B,k)}
{const f=mdBootsPre;mdBootsPre=function(P,d){const r=f.apply(this,arguments);if(BR.on&&BR.R&&BR.R.key=='raven'){P.rvBoots=1;if(d&&d.st!='slipper'){P.col.boot=BR.C.SCALE;P.col.sole=BR.C.SCALED}}return r}}
{const f=mdBoots;mdBoots=function(B,P,d){if(BR.on&&BR.R&&BR.R.key=='raven'&&d&&d.key){brToes(B,P);return rvBoots(B,P,d)}return f.apply(this,arguments)}}
// ---------------- robes: a bird's hem ----------------
// A floor-length robe hides the raven's legs and catches his long toes: running, the trailing foot's toes passed through the
// hem. On him every robe (and the class outfit) ends at mid-shank instead: while its outfit / chest piece is built, every
// lofted ring and rigid part below the hips is moved up by mapping heights [0, RV_HEM.top] onto [RV_HEM.y, RV_HEM.top]
// (same rings, bands and trims, only shorter), so the scaled shanks, the footwear and the talons show under the robe.
var RV_HEM={y:.17,top:.5,on:0};
function rvHemY(y){const H=RV_HEM;return y>=H.top?y:H.y+Math.max(0,y)*(H.top-H.y)/H.top}
{const f=mdLoft;mdLoft=function(B,R,o){if(!RV_HEM.on||BR_BODY)return f.apply(this,arguments);return f.call(this,B,R.map(r=>r.p[1]<RV_HEM.top?Object.assign({},r,{p:[r.p[0],rvHemY(r.p[1]),r.p[2]]}):r),o)}}
{const f=mdKit;mdKit=function(B,k){if(RV_HEM.on&&!BR_BODY&&k&&k.P)k.P.forEach(p=>{if(p.rvHem)return;const e=p.m.elements;if(e[13]<RV_HEM.top){e[13]=rvHemY(e[13]);p.rvHem=1}});return f.apply(this,arguments)}}
function rvHemOn(){return BR.on&&BR.R&&BR.R.key=='raven'}
{const f=mdChest;mdChest=function(){const o=RV_HEM.on;RV_HEM.on=rvHemOn()?1:0;try{return f.apply(this,arguments)}finally{RV_HEM.on=o}}}
{const f=mdOutfit;mdOutfit=function(cls){const O=f.apply(this,arguments);if(!O||!O.base||O.rvHem)return O;const b=O.base;
  return Object.assign({},O,{rvHem:1,base:function(){const o=RV_HEM.on;RV_HEM.on=rvHemOn()?1:0;try{return b.apply(this,arguments)}finally{RV_HEM.on=o}}})}}
// under a robe his legs stay a bird's: feathered thighs, scaled shanks (a cloth chest would paint them as dark trousers);
// with footwear on, the shank takes the footwear's colour (mdBootsPre)
{const f=mdBody;mdBody=function(B,P){if(BR.on&&BR.R&&BR.R.key=='raven'&&!BR.bare){const C=BR.C,pl=P.paint.leg;P.col.pants=C.FUR;
    P.paint.leg=(m,s)=>{const pt=m.r.part;if(pt=='hip'||pt=='thigh'||pt=='knee')return C.FUR;if(!P.rvBoots&&(pt=='shin'||pt=='ankle'))return Math.floor(m.y*70)%2?C.SCALE:C.SCALED;return pl?pl(m,s):null}}
  return f.apply(this,arguments)}}
