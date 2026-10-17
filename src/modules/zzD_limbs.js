// ================= v79: attach floating limbs / tails on creature models =================
// Small parts of rigged creatures are baked by bakeMesh(parts,..) in bind space (p.x,p.y,p.z, bone p.bn).
// LFX[rig](parts,S) moves or re-parents the parts that float, before the mesh is baked (and cached).
var LFX={},LFV={};
// bind-space vertices of a rig's body
function lfV(S){return LFV[S.id]||(LFV[S.id]=rigGeo(S).attributes.position.array)}
// highest body point near (x,z)
function lfTop(S,x,z,r){const P=lfV(S);r=r||.03;let y=-9;for(let i=0;i<P.length;i+=3)if(Math.abs(P[i]-x)<r&&Math.abs(P[i+2]-z)<r&&P[i+1]>y)y=P[i+1];return y>-9?y:r<.2?lfTop(S,x,z,r*2):null}
// frontmost body point near (x,y)
function lfFront(S,x,y,r){const P=lfV(S);r=r||.03;let z=-9;for(let i=0;i<P.length;i+=3)if(Math.abs(P[i]-x)<r&&Math.abs(P[i+1]-y)<r&&P[i+2]>z)z=P[i+2];return z>-9?z:r<.2?lfFront(S,x,y,r*2):null}
const lfM=(p,bn,col,x,y,z,e)=>(!bn||p.bn==bn)&&(col==null||p.col===col)&&(x==null||Math.abs(p.x-x)<(e||.01))&&(y==null||Math.abs(p.y-y)<(e||.01))&&(z==null||Math.abs(p.z-z)<(e||.01));
{const ob=bakeMesh;bakeMesh=function(parts,O,key,basic){
  try{const m=/^([bv])\|([^|,]+)/.exec(key||''),n=m&&(m[1]=='v'?m[2]:rigOf(m[2]));if(n&&LFX[n]&&SPEC[n]&&!parts._lf){parts._lf=1;LFX[n](parts,SPEC[n])}}catch(e){console.error('limbs',e)}
  return ob.apply(this,arguments)}}
function lfNear(S,x,y,z){const P=lfV(S);let b=1e9,k=0;for(let i=0;i<P.length;i+=3){const d=(P[i]-x)**2+(P[i+1]-y)**2+(P[i+2]-z)**2;if(d<b){b=d;k=i}}return [P[k],P[k+1],P[k+2]]}
// spheres along a polyline (tails, necks), radius r0 -> r1
function lfChain(L,bn,col,pts,r0,r1,step){let len=0;const seg=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);seg.push([a,b,l]);len+=l}
  const n=Math.max(2,Math.ceil(len/(step||.05)));for(let k=0;k<=n;k++){let d=k/n*len,j=0;while(j<seg.length-1&&d>seg[j][2]){d-=seg[j][2];j++}const [a,b,l]=seg[j],t=Math.min(1,d/l),r=r0+(r1-r0)*k/n;
    L.push({bn:bn,geo:RS,col:typeof col=='function'?col(k/n):col,x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,z:a[2]+(b[2]-a[2])*t,sx:r,sy:r,sz:r,rx:0,rz:0})}}
// dorsal spike: sit its base on the back
const lfSink=(S,p,k)=>{const t=lfTop(S,p.x,p.z);if(t!=null)p.y=t+p.sy*(k==null?.3:k)};
// glow studs from crOrn sit on the face of every creature
var LFX0=(L,S)=>L.forEach(p=>{if(p.bn=='head'&&p.geo===RS&&p.basic&&Math.abs(p.sx-.022)<1e-4&&Math.abs(p.sy-.018)<1e-4){const q=lfNear(S,p.x,p.y,p.z);p.x=q[0];p.y=q[1];p.z=q[2]}});
{const o=bakeMesh;bakeMesh=function(parts,O,key,basic){
  try{const m=/^v\|([^|]+)/.exec(key||'');if(m&&SPEC[m[1]]&&!parts._l0){parts._l0=1;LFX0(parts,SPEC[m[1]])}}catch(e){console.error('limbs',e)}
  return o.apply(this,arguments)}}

// Skyhawk (also harpy, Stormtalon, Rocsovereign): tail feathers sat on tail2 behind the body; root them in the rump on tail0
LFX.Skyhawk=L=>L.forEach(p=>{if(p.bn=='tail2'&&p.geo===RB&&p.sz>.2){p.bn='tail0';p.z+=.23;p.y=.53}});
// Ashwolf dark kit: dorsal spikes floated above the back
LFX.Ashwolf=(L,S)=>L.forEach(p=>{if(p.geo===RC&&p.col===0xb8ad90&&Math.abs(p.x)<.001&&/^(neck|chest|spine|pelvis)$/.test(p.bn))lfSink(S,p,.22)});
// Drakelet dark kit: tail spikes above the tail
LFX.Drakelet=(L,S)=>L.forEach(p=>{if(p.geo===RC&&p.col===0xd8c8a0&&/^tail/.test(p.bn))lfSink(S,p,.25)});
// Wispling: the right arm's claw was on the left arm bone
LFX.Wispling=L=>L.forEach(p=>{if(p.bn=='fl2'&&p.x>0)p.bn='fr2'});
// Boneling: vertebra beads above the spine
LFX.Boneling=(L,S)=>L.forEach(p=>{if(p.bn=='spine'&&p.geo===RS&&p.col===0xe8e0c8&&Math.abs(p.sx-.025)<1e-4){p.y=lfTop(S,p.x,p.z)+.008;p.bn=p.z<-.16?'pelvis':p.z>.12?'chest':'spine'}});
// Gloomcap: cap flakes and glow dots hovered over the cap
LFX.Gloomcap=(L,S)=>L.forEach(p=>{if(p.bn=='head'&&p.geo===RS&&(p.col===0xf6f0e6||p.col===0xa8ff7a)){const t=lfTop(S,p.x,p.z);if(t!=null)p.y=t-.002}});
// Goo / Acid Spitter: eyes hovered over the top of the blob
LFX.Goo=(L,S)=>L.forEach(p=>{if(p.bn=='head'&&p.geo===RB&&Math.abs(p.y-.7)<.01&&Math.abs(p.z-.2)<.03){const f=lfFront(S,p.x,.6);p.y=.6;p.z=f+(p.basic?.004:-.008)}});
// Dune Scorpion: the stinger was a row of loose beads; make it one solid arc from the abdomen
LFX.Scorpion=L=>{let col=null;for(let i=L.length-1;i>=0;i--){const p=L[i];if(p.bn=='tail3'&&p.geo===RS&&Math.abs(p.sz-.08)<1e-4&&!p.basic){col=col==null?p.col:col;if(p.y>.55&&p.z<-.6)col=p.col;L.splice(i,1)}else if(p.bn=='tail3'&&p.geo===RC&&p.col===0x2a1a0a){p.y=1.03;p.z=-.1}}
  if(col!=null)lfChain(L,'tail3',col,[[0,.47,-.56],[0,.74,-.7],[0,.98,-.58],[0,1.1,-.36],[0,1.08,-.15]],.075,.045,.045)};
// Hydra: the two side necks were loose beads; fill them in
LFX.Hydra=L=>{[-1,1].forEach(s=>{const n=[[s*.06,.3,.22],[s*.2,.5,.32],[s*.3,.72,.42],[s*.32,.86,.5]],h=L.find(p=>p.bn=='chest'&&p.geo===RS&&Math.abs(p.x-s*.33)<.005&&Math.abs(p.y-.9)<.005);if(!h)return;
  for(let i=L.length-1;i>=0;i--){const p=L[i];if(p.bn=='chest'&&p.geo===RS&&Math.abs(p.sy-.11)<1e-4&&Math.sign(p.x)==s)L.splice(i,1)}
  lfChain(L,'chest',h.col,n,.085,.07,.04)})};
// Centipede: last pair of legs stood off the thin tail tip
LFX.Centipede=L=>L.forEach(p=>{if(p.bn=='tail3'&&p.geo===RC&&p.col===0x2a1410)p.x=Math.sign(p.x)*.16});
// wings: sink the wing root into the back so it stays on the body while flapping
(function(){for(const n in SPEC){const S=SPEC[n];if(!S.sig)continue;const o=S.sig;S.sig=function(x,C,c){
  const y=Object.create(x);y.wing=function(bn){const p=x.wing.apply(x,arguments),b=x.spec.bones[bn];
    try{if(b){const X=b[1]+p.position.x,Y=b[2]+p.position.y,Z=b[3]+p.position.z,t=lfTop(x.spec,X,Z);if(t!=null&&Y>t-.03)p.position.y-=Y-(t-.03)}}catch(e){}return p};
  return o.call(this,y,C,c)}}})();
// mounts: flame tails (charger, destrier) flicker apart; the bone destrier's thighs hung below its hips
{const o=mkMountRig;mkMountRig=function(k){const r=o.apply(this,arguments);
  try{if(k=='charger'||k=='destrier')r.b.children.forEach(t=>{if(t.isGroup&&t.position.z<0&&t.children.length==4&&t.children.every(m=>m.isMesh))t.children.forEach(m=>m.scale.y*=1.45)});
    if(k=='destrier')r.children.forEach(h=>{if(h===r.b||!h.isGroup||Math.abs(h.position.x)<.1)return;const th=h.children.find(m=>m.isMesh);if(!th)return;
      const m=new THREE.Mesh(th.geometry,th.material);m.scale.set(th.scale.x*.9,.24,th.scale.z*.9);m.position.set(0,.1,0);m.castShadow=true;h.add(m);
      const j=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),th.material);j.scale.setScalar(th.scale.x*.75);h.add(j)})}catch(e){console.error('limbs mount',e)}
  return r}}
