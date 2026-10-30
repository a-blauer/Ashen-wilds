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
  return LFS[K]=new Float32Array(o)} // v178: per body variant (Direfang, Titanshell… have their own bodies)
function lfNearS(n,x,y,z){const P=lfSurf(n);let b=1e9,k=0;for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i}}return [P[k],P[k+1],P[k+2],Math.sqrt(b)]}
// v178: the bone that moves the body at the vertex nearest (x,y,z) (a borrowed fusion part rides the body part it now sits on)
function lfBoneAt(n,x,y,z){const sp=(typeof RV137!='undefined'&&RV137.cur&&RV137.cur[n])||n,C=0x808080,G=LPR[n].geo(C,{g:[sp],cl:[C],v:'',tr:'',f:0,z:1}),P=G.attributes.position.array,SI=G.attributes.skinIndex,SW=G.attributes.skinWeight;
  if(!SI)return null;let b=1e9,k=0;for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i/3}}
  let bi=SI.getX(k),bw=SW.getX(k);[['getY'],['getZ'],['getW']].forEach(([f])=>{if(SW[f](k)>bw){bw=SW[f](k);bi=SI[f](k)}});return Object.keys(SPEC[n].bones)[bi]||null}
// highest / lowest body surface over (x,z); null when the body does not reach there
function lfTopS(n,x,z,lo,r){const P=lfSurf(n);r=r||.025;let y=null;for(let i=0;i<P.length;i+=3)if(Math.abs(P[i]-x)<r&&Math.abs(P[i+2]-z)<r&&(y==null||(lo?P[i+1]<y:P[i+1]>y)))y=P[i+1];return y}
{const o=bakeMesh;bakeMesh=function(parts,O,key,basic){
  // v178: also a fused companion's borrowed signature parts ('LPF|rig|…', placed from the old rig's points: they hung up to 60 cm off)
  try{const m=/^LP([OF])\|([^|]+)\|/.exec(key||''),n=m&&m[2],fz=m&&m[1]=='F';if(n&&LPR[n]&&!parts._lf){parts._lf=1;parts.forEach(p=>{
    if(p.geo&&p.geo.type=='TorusGeometry')return; // halos float on purpose
    const q=lfNearS(n,p.x,p.y,p.z),half=Math.min(p.sx,p.sy,p.sz)*.5;if(fz&&q[3]<.08)p.bn=lfBoneAt(n,q[0],q[1],q[2])||p.bn;if(q[3]<half+.015)return;
    const t=lfTopS(n,p.x,p.z),b=lfTopS(n,p.x,p.z,1);if(t!=null&&p.y<t&&p.y>b)return; // buried in the body: leave it
    if(p.geo===RC&&t!=null){p.y=t+p.sy*.3;return}
    p.x=q[0];p.y=q[1];p.z=q[2];if(fz)p.bn=lfBoneAt(n,p.x,p.y,p.z)||p.bn})}}catch(e){console.error('limbs orn',e)}
  return o.apply(this,arguments)}}

