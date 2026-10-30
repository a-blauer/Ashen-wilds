// ================= v177 environment pass: scattered scenery sits on the ground =================
// Owner: "check all environment pieces on each instance in each zone ... for unattached pieces or poor quality".
// The scattered decorations (1680 / 1981 / 2280: WD kinds, instanced per 64x64 chunk in wdBuild) used to stand at the ground height
// under their centre, so on a slope one side of a rock, log or grave hung in the air (up to metres on the rim banks, and pieces on a
// cliff lip hung over the drop). wdBuild now asks env177Seat for each piece's place:
//  * low, wide pieces (rocks, ledge stones, logs, dunes, rubble, graves) lean with the slope under them (tall ones stay upright:
//    trees, pillars, lamps, statues), up to ENV177.tilt;
//  * then the piece sinks until no point of its base is above the ground (the uphill side goes into the ground);
//  * a piece that would have to sink more than its share (ENV177.sink: a tall piece a third of its height, a low one 45%) stands on
//    ground too steep for it (a cliff face, a wall lip) and is not drawn (scale 0; gb168Clear hides pieces the same way).
// Flat patches (goo, blood, salt crust) lie along the slope; mist, webs and pieces at a fixed height (lilies on water) stay as they were.
// Everything here is a hoisted function: wdBuild runs at load, long before this file.
var ENV177;   // lazy: wdBuild calls in before this line runs
function env177(){return ENV177||(ENV177={tilt:.4,tol:.04,sink:[.34,.45],n:0,hid:0})}
// the kind's base outline (local vertices at the very bottom), size and how much it leans: cached on the kind
function env177Kind(S){if(S._e176!==undefined)return S._e176;let r=null;
  try{if(S.abs==null&&!S.parts.some(p=>p.mat)){const V=[];let mn=1e9,mx=-1e9,x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    S.parts.forEach(p=>{const P=p.g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);V.push(x,y,z);if(y<mn)mn=y;if(y>mx)mx=y;if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z}});
    const h=mx-mn,w=Math.max(x1-x0,z1-z0);
    if(h>.06){const lo=[],lean=h<w*.6?1:h<w*1.2?.5:0,cut=mn+Math.max(.03,h*(lean?.2:.07)),seen=new Map();
      for(let i=0;i<V.length;i+=3)if(V[i+1]<=cut){const k=Math.round(V[i]*50)+','+Math.round(V[i+2]*50),j=seen.get(k);if(j==null){seen.set(k,lo.length);lo.push(V[i],V[i+1],V[i+2])}else if(V[i+1]<lo[j+1])lo[j+1]=V[i+1]}   // the lowest point over each spot
      // big outlines thinned to ~48 points (every n-th): enough to find the lowest ground under the base
      let L=lo;if(lo.length>144){const st=Math.ceil(lo.length/144);L=[];for(let i=0;i<lo.length;i+=3*st)L.push(lo[i],lo[i+1],lo[i+2])}
      r={lo:L,h,w,lean,tall:h>w*1.2}}
    else if(w>.2)r={decal:1,w}}}catch(e){console.warn('v177 kind',S.k,e)}
  return S._e176=r}
// where piece d stands: {x,y,z,q,sx,sy,sz} (sx 0: not drawn); y0 is its old height (ground at its centre plus the kind's lift)
function env177Seat(S,d,y0){const sc=S.sc||[1,1,1],s=d.s,K=env177Kind(S),V3=THREE.Vector3,o={x:d.x,y:y0,z:d.z,q:new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),d.ry),sx:s*sc[0],sy:s*sc[1],sz:s*sc[2]};
  if(!K)return o;const E=env177();E.n++;
  if(K.decal||K.lean){const r=Math.max(.6,K.w*.45*s),gx=(GH(d.x+r,d.z)-GH(d.x-r,d.z))/(2*r),gz=(GH(d.x,d.z+r)-GH(d.x,d.z-r))/(2*r),n=new V3(-gx,1,-gz).normalize(),up=new V3(0,1,0);
    let a=Math.acos(Math.min(1,n.y))*(K.decal?1:K.lean);a=Math.min(a,K.decal?.7:E.tilt);if(a>.01){const ax=new V3().crossVectors(up,n).normalize();o.q.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,a))}}
  if(K.decal)return o;   // a flat patch (goo, salt crust, blood) lies along the slope at its old height
  const L=K.lo,v=new V3();let gap=-1e9;
  for(let i=0;i<L.length;i+=3){v.set(L[i]*o.sx,L[i+1]*o.sy,L[i+2]*o.sz).applyQuaternion(o.q);const g=y0+v.y-GH(d.x+v.x,d.z+v.z);if(g>gap)gap=g}
  const sink=Math.max(0,gap-E.tol),lim=K.h*o.sy*E.sink[K.tall?0:1]+.08;
  if(sink>lim){o.sx=o.sy=o.sz=0;E.hid++;return o}
  o.y=y0-sink;return o}
// ================= v177 environment pass: a darker, weathered palette =================
// Owner: "analyze and optimize structure, color and overall style ... non-cartoony (this is a dark fantasy game) or too simple".
// The zones were painted in candy colours (lime moss, pure white snow and bone, saturated sand and grass). One grade per zone
// (ENV177Z) is applied once at load: to every scattered decoration's baked vertex colours (env177Look, from wdDeco before the
// chunks are built: colour pulled toward grey by .sat, lime greens turned toward olive by .olive, bright colours compressed above
// .knee by .comp, everything times .dark), its instance tints (saturation only), and to the zone's ground colours (env177Biomes,
// from 0045: BIOMES gnd / grs / acc / frs / tree tints). Then weathering is baked into each decoration (dt168Weather, 3345):
// grime toward the foot, mottling and rain streaks, so props stop reading as flat painted plastic. Glowing parts are left alone.
// Duskhold is not graded.
function env177Z(z){return [
  {sat:.78,olive:.25,knee:.42,comp:.55,dark:.95},   // Kindlelight (already a dark bog)
  {sat:.6,olive:.45,knee:.4,comp:.5,dark:.88},      // Hillside Crest: the brightest, most cartoony greens
  {sat:.68,olive:.3,knee:.5,comp:.55,dark:.9},      // Burningeye Summit: snow and ice, not glaring white
  {sat:.66,olive:.35,knee:.45,comp:.5,dark:.88},    // Searing Sands: sun-bleached, not orange candy
  {sat:.72,olive:.3,knee:.4,comp:.5,dark:.9},       // The Dirge: bone and stone in murk
  {sat:.82,olive:.3,knee:.4,comp:.55,dark:.92}][z]||null}  // The Citadel
// grade one colour (0..1 floats) in place: returns [r,g,b]
function env177Grade(r,g,b,Z){let l=.3*r+.59*g+.11*b;
  if(g>r&&g>b){const k=Math.min(1,(g-Math.max(r,b))*4)*Z.olive;r+=(g-r)*k*.5;b+=(g-b)*k*.15;g-=(g-r)*k*.15}   // lime -> olive / moss
  l=.3*r+.59*g+.11*b;r=l+(r-l)*Z.sat;g=l+(g-l)*Z.sat;b=l+(b-l)*Z.sat;
  if(l>Z.knee){const L=Z.knee+(l-Z.knee)*Z.comp,f=L/l;r*=f;g*=f;b*=f}
  return [r*Z.dark,g*Z.dark,b*Z.dark]}
function env177Hex(h,Z,satOnly){const c=new THREE.Color(h);let o;if(satOnly){const l=.3*c.r+.59*c.g+.11*c.b;o=[l+(c.r-l)*Z.sat,l+(c.g-l)*Z.sat,l+(c.b-l)*Z.sat]}else o=env177Grade(c.r,c.g,c.b,Z);
  return c.setRGB(Math.max(0,o[0]),Math.max(0,o[1]),Math.max(0,o[2])).getHex()}
// the zone a decoration kind belongs to: by its name (k_, k2_ ... c3_), else by where most of its pieces stand
function env177KindZone(k,list){const m=/^([khbsdc])\d?_/.exec(k);if(m)return 'khbsdc'.indexOf(m[1]);
  const n=[0,0,0,0,0,0,0];for(const d of list)if(d.k===k){const I=insAt(Math.round(d.x),Math.round(d.z));n[I?I.z:6]++}let b=6;for(let i=0;i<6;i++)if(n[i]>(b<6?n[b]:0))b=i;return b<6?b:-1}
function env177Look(T,list){const T0=performance.now(),done=new Set();let nk=0;
  for(const k in T){const S=T[k];if(!S||!S.parts)continue;const z=env177KindZone(k,list),Z=env177Z(z);if(!Z)continue;nk++;
    if(S.tint)S.tint=S.tint.map(h=>env177Hex(h,Z,true));
    S.parts.forEach(p=>{const g=p.g;if(p.glow||p.mat||!g||done.has(g))return;done.add(g);const C=g.attributes.color,P=g.attributes.position;if(!C)return;
      let y0=1e9,y1=-1e9;for(let i=0;i<P.count;i++){const y=P.getY(i);if(y<y0)y0=y;if(y>y1)y1=y}
      for(let i=0;i<C.count;i++){const o=env177Grade(C.getX(i),C.getY(i),C.getZ(i),Z);C.setXYZ(i,o[0],o[1],o[2])}
      if(!g.attributes.normal)g.computeVertexNormals();
      try{dt168Weather(g,{y0,g:[Math.min(.7,Math.max(.25,(y1-y0)*.3)),.3],n:.2,s:.2,sd:(k.length*7)%13})}catch(e){}
      C.needsUpdate=true})}
  env177().look={kinds:nk,ms:Math.round(performance.now()-T0)}}
// the zones' ground colours (BIOMES, after v112 added the themed instances' own); Duskhold (biome 0) stays
function env177Biomes(){try{BIOMES.forEach((b,i)=>{if(!i||b.e176)return;b.e176=1;const z=b.v112!=null?Math.floor(b.v112/PMG):i-1,Z=env177Z(z);if(!Z)return;
  const G=a=>{const o=env177Grade(a[0]/255,a[1]/255,a[2]/255,Z);return o.map(v=>Math.max(0,Math.min(255,Math.round(v*255))))};
  ['gnd','grs','acc','frs'].forEach(k=>{if(Array.isArray(b[k]))b[k]=G(b[k])});if(Array.isArray(b.tc))b.tc=b.tc.map(h=>env177Hex(h,Z))})}catch(e){console.warn('v177 biomes',e)}}
// ---- the zones' light and grade (0550 ZATM, and each themed instance's own in 1981): the v52 "vivid" grade pushed saturation
// up to +50% and the bright zones over-exposed, which made every colour read as a cartoon. Boosts are cut to under a third (a
// zone that is already desaturated keeps its value), over-bright suns and exposure come down, the vignette deepens a little,
// and the hero's light in the dark zones no longer whites out what stands next to it.
function env177Atm(a){if(!a||a.e176)return;a.e176=1;const cut=(v,k)=>v>1?1+(v-1)*k:v;
  if(a.sat!=null)a.sat=cut(a.sat,.3);if(a.ex!=null)a.ex=cut(a.ex,.3)*.97;if(a.sun!=null)a.sun=cut(a.sun,.55);if(a.hemi!=null)a.hemi=cut(a.hemi,.6);if(a.vig!=null)a.vig*=1.08;
  // the dark zones' carried light (li 2.2-3.4) burned a wall or rock a step away to pure white: softer, reaching a little further
  if(a.li>1.5){a.li*=.72;if(a.ld)a.ld*=1.15}}
try{for(let z=0;z<6;z++)env177Atm(ZATM[z]);if(typeof th112=='function')th112().list.forEach(t=>env177Atm(t.a))}catch(e){console.warn('v177 atmosphere',e)}
// ---- pond banks (from 0045, right after the heights are made): a water tile was 1.2 below the surface next to land at full
// height, a one-tile drop that read as a pit with sheer walls. The walkable land within ENV177B.r tiles of water now slopes down
// to just above the waterline, and the water's first two rings shelve (ENV177B.w) before the deep middle. Rims are left alone.
function env177Banks(){try{const T0=performance.now(),R=3.2,D=new Float32Array(W*H).fill(99),wet=(x,y)=>MAP[y]&&MAP[y][x]=='~';let n=0;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!wet(x,y)||!insAt(x,y))continue;let land=99;
    for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const d=Math.hypot(dx,dy),k=Y*W+X;if(wet(X,Y)){continue}if(d<land)land=d;if(d<D[k])D[k]=d}
    const k=(y+HPD)*HW+x+HPD;if(land<=1.5){HF[k]=Math.max(HF[k],-.42);n++}else if(land<=2.9)HF[k]=Math.max(HF[k],-.8)}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=D[y*W+x];if(d>R||MAP.DW[y*W+x]>=0)continue;const k=(y+HPD)*HW+x+HPD,h=HF[k],t=.14;if(h>t)HF[k]=t+(h-t)*smt(.6,R,d)}
  env177().banks={n,ms:Math.round(performance.now()-T0)}}catch(e){console.warn('v177 banks',e)}}
