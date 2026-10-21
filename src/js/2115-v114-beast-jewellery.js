// ================= v114: amulet and ring fitted to the animals =================
// The human amulet chain is laid at a fixed fraction of the shoulder width, which sinks into a beast's sloping shoulders; the
// ring sits on the human palm, which is inside a beast's paw. On a beast the chain lies on the torso surface at the height
// where the torso is as wide as the chain, and the ring is a band round the first joint of the paw's second finger.
// one finger of a beast paw (the same construction as brPaws): its five ring points and the direction at the first joint
function brFinger(P,s,i){const D=BR.R,pw=D.paw,V=THREE.Vector3,a=s<0?'aL1':'aR1',b=s<0?'aL2':'aR2',A=mdV(HB[a]),W=mdV(HB[b]),d=W.clone().sub(A).normalize(),z=new V(0,0,1),
  e=z.clone().sub(d.clone().multiplyScalar(z.dot(d))).normalize(),sd=new V().crossVectors(d,e).multiplyScalar(s),xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),pl=pw.plen||1,
  at=(t,o)=>W.clone().add(d.clone().multiplyScalar(t)).add(e.clone().multiplyScalar(o)).add(new V(xo,0,.005)),n=pw.n,o=(i-(n-1)/2)*(pw.spread||.0112)*(pw.palm||1),len=pw.len[i],sp=(i-(n-1)/2)*.05,
  rr=pw.rad||1,rad=[.0062*rr,.0056*rr,.0047*rr,.0036*rr,.0024*rr],seg=[0,.012,.012,.008,.006],curl=pw.curl==null?1:pw.curl,pts=[],dirs=[];
  let p=at(.028*pl,o),dir=d.clone().add(e.clone().multiplyScalar(sp)).normalize();
  for(let j=0;j<5;j++){if(j){const st=len*seg[j]/.038;p=p.clone().add(dir.clone().multiplyScalar(st));dir=dir.clone().add(sd.clone().multiplyScalar((.16+.1*j)*curl)).normalize()}pts.push(p.clone());dirs.push(dir.clone())}
  return {pts,dirs,rad,bone:b}}
{const f=mdRingW;mdRingW=function(B,P,d){if(!BR.on)return f.apply(this,arguments);
  const k=mdKP(),band=[0xb06a3a,0xc8ccd4,0xd8a040,0x3a3a46,0x7ab0d8][d.ti],n=BR.R.paw.n,F=brFinger(P,1,n-1),V=THREE.Vector3,
    c=F.pts[2].clone().lerp(F.pts[3],.5),dir=F.dirs[2],r=(F.rad[2]+F.rad[3])/2*1.3,e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),dir));
  k.p(F.bone,'ring','m',band,c.x,c.y,c.z,r,.35,r,e.x,e.y,e.z);
  // the gem on the back of the finger
  const up=new V(0,0,1).sub(dir.clone().multiplyScalar(dir.z)).normalize(),g=c.clone().add(up.multiplyScalar(r*1.05));
  k.p(F.bone,'oct',d.G?'g':'m',d.G||d.gem,g.x,g.y,g.z,r*.55,r*.6,r*.45);mdKit(B,k)}}
{const f=mdAmulet;mdAmulet=function(B,P,d){if(!BR.on)return f.apply(this,arguments);
  const k=mdKP(),ti=d.ti,gold=ti==0?0x7a6a4a:ti>=3?0xd8b050:0xa88848,off=(P.tOff||0)+.008,y=.87,f0=mdTorsoAt(P,y),fz=(f0.z||0)+f0.f+off+.008,sh=d.set?mdHash(d.n)%5:ti,gem=d.gem;
  // the chain: the height where the torso is as wide as the chain, lying on the surface there
  const top=mdTorsoAt(P,.975),rc=top.rx*.62+off;let yc=.965;for(let yy=.9;yy<=1.03;yy+=.004){if(mdTorsoAt(P,yy).rx<=rc){yc=yy;break}}
  const q=mdTorsoAt(P,yc);k.p('chest','ring','m',gold,0,yc+.004,(q.z||0)+.004,q.rx+off,.22,(q.f+q.b)/2+off,-.12);
  // the two strands from the chain down the chest surface to the pendant
  [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=4;i++){const t=i/4,yy=yc-(yc-y-.02)*t,qq=mdTorsoAt(P,yy),x=s*(q.rx*.55)*(1-t),zz=(qq.z||0)+qq.f*Math.sqrt(Math.max(0,1-(x/qq.rx)**2))+off+.004;pts.push([x,yy,zz])}
    for(let i=0;i<4;i++)k.L('chest','m',gold,pts[i],pts[i+1],.005,.005,3)});
  const fz2=fz;
  if(sh==0){k.p('chest','cone4','c',0xe8e0c8,0,y-.015,fz2,.014,.05,.01,Math.PI)}
  else if(sh==1){k.p('chest','oct','m',gold,0,y,fz2,.03,.036,.012);k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,fz2+.006,.02,.026,.01)}
  else if(sh==2){k.p('chest','cyl','m',gold,0,y,fz2,.028,.012,.028,Math.PI/2);k.p('chest','sph',d.G?'g':'m',d.G||gem,0,y,fz2+.008,.012)}
  else if(sh==3){k.p('chest','sph','m',gold,0,y,fz2,.026,.032,.012);k.p('chest','sph','g',d.G||gem,0,y,fz2+.01,.012,.014,.006)}
  else{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.p('chest','cone4','m',gold,Math.sin(a)*.02,y+Math.cos(a)*.02,fz2,.008,.03,.006,0,0,-a)}k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,fz2+.006,.014)}
  mdKit(B,k)}}
// ================= v114: tail openings =================
// Coats, robes, skirts, tassets and capes are lofted shells round the body; a beast's tail would pass straight through
// them. While a beast's outfit / armour is built (anything but the body itself), every lofted face whose centre lies
// within the tail's radius (+ a small margin) of the tail's path is left out, which cuts a neat opening where the tail
// comes through; the cloth round it stays.
var BR_BODY=0;
['mdBody','mdHead','brPaws','brTail','brToes','brShoulders'].forEach(n=>{const f=window[n];window[n]=function(){BR_BODY++;try{return f.apply(this,arguments)}finally{BR_BODY--}}});
function brTailNear(D,x,y,z){const T=D.TP;if(!T)return false;for(let i=0;i+1<T.length&&i<9;i++){const p=T[i],q=T[i+1],dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L2=dx*dx+dy*dy+dz*dz||1e-9;
    let u=((x-p[0])*dx+(y-p[1])*dy+(z-p[2])*dz)/L2;u=Math.max(0,Math.min(1,u));const r=p[3]+(q[3]-p[3])*u+.014,ex=x-(p[0]+dx*u),ey=y-(p[1]+dy*u),ez=z-(p[2]+dz*u);if(ex*ex+ey*ey+ez*ez<r*r)return true}return false}
{const f=mdLoft;mdLoft=function(B,R,o){if(!BR.on||BR_BODY||!BR.R||!BR.R.TP)return f.apply(this,arguments);const D=BR.R,k0=o&&o.keep;
  return f.call(this,B,R,Object.assign({},o||{},{keep:m=>(!k0||k0(m))&&!brTailNear(D,m.x,m.y,m.z)}))}}
