// ================= v84: attach floating limbs / tails on creature models =================
// The low-poly rigs (LPR, zzE_*/zzG_beasts) build their rigid detail parts in D.kit(k,…) as dkKit parts
// {bn, geo, t, col, m (model-space matrix)}. lfKit(rig, fix) runs fix(parts) on the parts a kit adds,
// before they are baked (the bake is cached per look, so this costs nothing later).
function lfKit(n,fix){const D=LPR[n];if(!D||!D.kit)return;const o=D.kit;D.kit=function(k){const i=k.P.length,r=o.apply(this,arguments);try{fix(k.P.slice(i),k)}catch(e){console.error('limbs',n,e)}return r}}
const lfMove=(p,dx,dy,dz)=>{const e=p.m.elements;e[12]+=dx;e[13]+=dy;e[14]+=dz};

// Skyhawk (Stormtalon, Rocsovereign, harpy): the fanned tail sat on tail2/tail3 with its root at z≈-.44,
// behind the end of the body (z -.33), so it hung in the air and swung away when the tail wagged.
// Root the fan in the rump (z≈-.28) on tail0, the bone the end of the body is skinned to.
lfKit('Skyhawk',P=>P.forEach(p=>{if(p.bn=='tail2'||p.bn=='tail3'){p.bn='tail0';lfMove(p,0,0,.16)}}));

// Rank ornaments (crOrn: brow glows, crest horn, back spines, shoulder plates) are placed from the old rig's
// SPEC.hd / SPEC.bk, which do not always lie on the new low-poly bodies (e.g. Argus: glows and the crest horn
// hung above the head). Before the ornament mesh 'LPO|rig|…' is baked, any ornament that is off the body is
// moved onto it: cones stand on the surface below them, other pieces sit on the nearest surface point.
var LFS={};
function lfSurf(n){const sp=(typeof RV137!='undefined'&&RV137.cur&&RV137.cur[n])||n,K=n+'|'+sp;if(LFS[K])return LFS[K];const D=LPR[n],C=0x808080,G=D.geo(C,{g:[sp],cl:[C],v:'',tr:'',f:0,z:1}),P=G.attributes.position.array,I=G.index.array,o=[];
  for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;for(let i=0;i<=3;i++)for(let j=0;j<=3-i;j++){const u=i/3,w=j/3,z=1-u-w;o.push(P[a]*z+P[b]*u+P[c]*w,P[a+1]*z+P[b+1]*u+P[c+1]*w,P[a+2]*z+P[b+2]*u+P[c+2]*w)}}
  return LFS[K]=new Float32Array(o)} // v180: per body variant (Direfang, Titanshell… have their own bodies)
function lfNearS(n,x,y,z){const P=lfSurf(n);let b=1e9,k=0;for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i}}return [P[k],P[k+1],P[k+2],Math.sqrt(b)]}
// v180: the bone that moves the body at the vertex nearest (x,y,z) (a borrowed fusion part rides the body part it now sits on)
function lfBoneAt(n,x,y,z){const sp=(typeof RV137!='undefined'&&RV137.cur&&RV137.cur[n])||n,C=0x808080,G=LPR[n].geo(C,{g:[sp],cl:[C],v:'',tr:'',f:0,z:1}),P=G.attributes.position.array,SI=G.attributes.skinIndex,SW=G.attributes.skinWeight;
  if(!SI)return null;let b=1e9,k=0;for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i/3}}
  let bi=SI.getX(k),bw=SW.getX(k);[['getY'],['getZ'],['getW']].forEach(([f])=>{if(SW[f](k)>bw){bw=SW[f](k);bi=SI[f](k)}});return Object.keys(SPEC[n].bones)[bi]||null}
// v183: when the body vertex nearest (x,y,z) is shared by bones (top weight under .88), the nearest vertex within 6 cm whose top
// weight is .88 or more (fused parts may drift 2 cm in a bite; on a 60 / 40 blend they drifted 4): [x, y, z, bone]; null when the nearest vertex is firm already or none is near
var LFW={};
function lfFirm(n,x,y,z){const sp=(typeof RV137!='undefined'&&RV137.cur&&RV137.cur[n])||n,K=n+'|'+sp;
  let W=LFW[K];if(!W){const C=0x808080,G=LPR[n].geo(C,{g:[sp],cl:[C],v:'',tr:'',f:0,z:1}),P=G.attributes.position.array,SI=G.attributes.skinIndex,SW=G.attributes.skinWeight;
    if(!SI)return null;const nv=P.length/3,tw=new Float32Array(nv),tb=new Int16Array(nv);
    for(let k=0;k<nv;k++){let bi=SI.getX(k),bw=SW.getX(k);['getY','getZ','getW'].forEach(f=>{if(SW[f](k)>bw){bw=SW[f](k);bi=SI[f](k)}});tw[k]=bw;tb[k]=bi}
    W=LFW[K]={P,tw,tb}}
  const P=W.P;let b=1e9,k=0,bf=1e9,kf=-1;
  for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i/3}if(W.tw[i/3]>=.88&&d<bf){bf=d;kf=i/3}}
  if(W.tw[k]>=.88||kf<0||bf>.06*.06)return null;
  return [P[kf*3],P[kf*3+1],P[kf*3+2],Object.keys(SPEC[n].bones)[W.tb[kf]]]}
// highest / lowest body surface over (x,z); null when the body does not reach there
function lfTopS(n,x,z,lo,r){const P=lfSurf(n);r=r||.025;let y=null;for(let i=0;i<P.length;i+=3)if(Math.abs(P[i]-x)<r&&Math.abs(P[i+2]-z)<r&&(y==null||(lo?P[i+1]<y:P[i+1]>y)))y=P[i+1];return y}
{const o=bakeMesh;bakeMesh=function(parts,O,key,basic){
  // v180: also a fused companion's borrowed signature parts ('LPF|rig|…', placed from the old rig's points: they hung up to 60 cm off)
  try{const m=/^LP([OF])\|([^|]+)\|/.exec(key||''),n=m&&m[2],fz=m&&m[1]=='F';if(n&&LPR[n]&&!parts._lf){parts._lf=1;parts.forEach(p=>{
    if(p.geo&&p.geo.type=='TorusGeometry')return; // halos float on purpose
    const q=lfNearS(n,p.x,p.y,p.z),half=Math.min(p.sx,p.sy,p.sz)*.5;if(fz&&q[3]<.08){p.bn=lfBoneAt(n,q[0],q[1],q[2])||p.bn;
      // v183: on skin shared by two bones (a bird's breast between chest and neck) a rigid part comes off when they move apart: slide it
      // to the nearest spot moved mostly by one bone, within 6 cm
      const f=lfFirm(n,q[0],q[1],q[2]);if(f){p.x+=f[0]-q[0];p.y+=f[1]-q[1];p.z+=f[2]-q[2];p.bn=f[3];q[0]=f[0];q[1]=f[1];q[2]=f[2]}}
    if(q[3]<half+.015)return;
    const t=lfTopS(n,p.x,p.z),b=lfTopS(n,p.x,p.z,1);if(t!=null&&p.y<t&&p.y>b)return; // buried in the body: leave it
    if(p.geo===RC&&t!=null){p.y=t+p.sy*.3;return}
    p.x=q[0];p.y=q[1];p.z=q[2];if(fz)p.bn=lfBoneAt(n,p.x,p.y,p.z)||p.bn})}}catch(e){console.error('limbs orn',e)}
  return o.apply(this,arguments)}}

