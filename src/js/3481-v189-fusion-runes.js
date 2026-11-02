// v189 fusion runes (owner, Nov 2 2026): "For each time a companion is fused it will get a small glowing runic symbol
// (varying symbols) somewhere random on its body (make it somewhere visible but not on a surface like its eyeball or
// inside its mouth and not too big since a companion could theoretically be fused 30 times)."
// One rune per fusion. Where it sits and which symbol it is come from the companion's own rune seed (`c.rs189`, made once,
// saved with the companion and sent to co-op partners with its look), so the same companion always wears the same runes,
// for you and for your partner. Spots are picked on the body skin only (never a kit part such as an eye, tooth, tongue,
// horn or shell), away from the head and jaw (so never an eye or the mouth) and away from the soles and the belly
// underside, so they can be seen; each rune is a small glowing decal tied to the bone under it, so it moves with the body.
// Owner, Nov 2 2026 (after the first pictures): "Runes should be a lot smaller, and … the same color when on a companion. The
// color can differ from companion to companion": every rune on one companion glows in that companion's own colour (from its
// rune seed, so it never changes), and runes are about half the first size.
var FR189={on:true,
  // symbols on a 0..10 grid: each a list of strokes, each stroke a list of points (Elder-Futhark-like and a few sigils)
  G:[[[[5,0],[5,10]],[[5,2],[8.5,0]],[[5,5],[8.5,3]]],                          // fehu
     [[[3,10],[3,0],[7.5,3],[7.5,10]]],                                          // uruz
     [[[3.5,0],[3.5,10]],[[3.5,2.5],[7.5,5],[3.5,7.5]]],                         // thurisaz
     [[[3,10],[3,0],[7,3.5],[3,6.5],[7,10]]],                                    // raidho
     [[[7.5,0],[3,5],[7.5,10]]],                                                 // kaunan
     [[[2,0],[8,10]],[[8,0],[2,10]]],                                            // gebo
     [[[3,10],[3,0],[7,3.5],[3,7]]],                                             // wunjo
     [[[3,0],[3,10]],[[7,0],[7,10]],[[3,3],[7,6.5]]],                            // hagalaz
     [[[5,0],[5,10]],[[3,3.5],[7,6.5]]],                                         // naudiz
     [[[2.5,4],[5,1.5],[7.5,4]],[[2.5,6],[5,8.5],[7.5,6]],[[5,1.5],[5,8.5]]],    // jera-like
     [[[3,0],[3,10]],[[3,1.5],[7,3.5]],[[3,8.5],[7,6.5]],[[7,3.5],[7,6.5]]],     // perthro
     [[[5,10],[5,0]],[[5,4],[1.5,0.8]],[[5,4],[8.5,0.8]]],                       // algiz
     [[[7.5,0],[2.5,2.8],[7.5,6],[2.5,9.5]]],                                    // sowilo
     [[[5,0],[5,10]],[[5,0],[2,3]],[[5,0],[8,3]]],                               // tiwaz
     [[[3,0],[3,10]],[[3,0],[7,2.5],[3,5],[7,7.5],[3,10]]],                      // berkanan
     [[[2.5,10],[2.5,0],[5,3],[7.5,0],[7.5,10]]],                                // ehwaz
     [[[3,0],[3,10],[7.5,10]],[[3,0],[7.5,3.5]]],                                // laguz-like
     [[[5,1],[9,5],[5,9],[1,5],[5,1]],[[1,5],[9,5]]],                            // ingwaz
     [[[2,1],[8,9]],[[2,9],[8,1]],[[2,1],[2,9]],[[8,1],[8,9]]],                  // dagaz
     [[[5,0.5],[8.5,4.5],[5,10],[1.5,4.5],[5,0.5]],[[5,4.5],[5,10]]],            // othala-like
     [[[5,0],[5,10]],[[2,2.5],[8,2.5]],[[2.5,7.5],[5,5],[7.5,7.5]]],             // sigil: crossed arrow
     [[[2,5],[5,1],[8,5],[5,9],[2,5]],[[5,1],[5,9]]]],                           // sigil: split diamond
  // glow colours: one per companion, chosen by its rune seed
  COL:[0xff8a3c,0x7fe8ff,0xb68cff,0x6dff9e,0xffd34a,0xff5a6a,0xe8f2ff,0x3fd8c4,0xff7ad1,0x9ab4ff],
  tex:{},mat:{},geo:null,keepOut:/head|jaw|skull|tongue|mouth|eye|beak|snout|muzzle|toe|foot|paw|hoof|claw|sole/i};
// the rune seed: once per companion, saved with it (companion fields save automatically) and sent to co-op partners
function fr189Seed(c){if(!c)return 1;if(!(c.rs189>0)){c.rs189=1+Math.floor(Math.random()*2147483000)}return c.rs189}
function fr189Rng(s){let a=(s>>>0)||1;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// one glowing symbol as a texture (white; the material tints it), shared by every rune with that symbol
function fr189Tex(i){let t=FR189.tex[i];if(t)return t;const cv=document.createElement('canvas');cv.width=cv.height=64;const X=cv.getContext('2d');
  const G=FR189.G[i%FR189.G.length],P=p=>[7+p[0]*5,7+p[1]*5];X.lineCap='round';X.lineJoin='round';
  const draw=(w,a,blur)=>{X.strokeStyle='rgba(255,255,255,'+a+')';X.lineWidth=w;X.shadowColor='#fff';X.shadowBlur=blur;
    G.forEach(st=>{X.beginPath();st.forEach((p,k)=>{const q=P(p);k?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1])});X.stroke()})};
  draw(11,.35,9);draw(5.6,1,3);   // bold strokes: runes are small on the body
  t=new THREE.CanvasTexture(cv);t.anisotropy=2;return FR189.tex[i]=t}
function fr189Mat(i,ci){const k=i+'|'+ci;let m=FR189.mat[k];if(m)return m;
  m=new THREE.MeshBasicMaterial({map:fr189Tex(i),color:FR189.COL[ci]||FR189.COL[0],transparent:true,opacity:.95,blending:THREE.AdditiveBlending,
    depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false,toneMapped:false});
  return FR189.mat[k]=m}
// shared glow pulse: every rune material breathes together (one update a frame, no per-rune work)
function fr189Pulse(now){const k=.78+.22*Math.sin(now/520);for(const n in FR189.mat){FR189.mat[n].opacity=k}}
// the companion's body skin: the skinned mesh that carries the skeleton (kit parts such as eyes and teeth are separate meshes)
function fr189Body(g){let best=null;g.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton&&o.geometry&&o.geometry.attributes.skinIndex&&o.children.some(k=>k.isBone)){
  const n=o.geometry.attributes.position.count;if(!best||n>best.geometry.attributes.position.count)best=o}});return best}
// put one rune per fusion on model g (built by cr for companion c). Deterministic: the same seed, look and count give the
// same spots and symbols on every machine.
function fr189Apply(g,c){const n=Math.min(60,fs189N(c));if(!FR189.on||!g||!c||n<=0)return;
  const body=fr189Body(g);if(!body)return;const S=SPEC[rigOf(c.g[0])],O=S&&S.bones?Object.keys(S.bones):null,sk=body.skeleton;if(!O||!sk)return;
  g.updateMatrixWorld(true);
  const geo=body.geometry,pos=geo.attributes.position,si=geo.attributes.skinIndex,sw=geo.attributes.skinWeight,ix=geo.index,M=body.matrixWorld;
  const GC=(A,i,k)=>k==0?A.getX(i):k==1?A.getY(i):k==2?A.getZ(i):A.getW(i);   // three r128 has no getComponent
  const nT=ix?ix.count/3:pos.count/3,vi=(t,k)=>ix?ix.getX(t*3+k):t*3+k,V=i=>new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(M);
  const box=new THREE.Box3();for(let i=0;i<pos.count;i++)box.expandByPoint(V(i));const sz=box.getSize(new THREE.Vector3()),D=Math.max(sz.x,sz.y,sz.z);
  const bad=O.map(nm=>FR189.keepOut.test(nm));
  // each bone's part of the body: its centre (for "outward") and the triangles that belong to it
  const cen=O.map(()=>[new THREE.Vector3(),0]),tri=[];
  for(let i=0;i<pos.count;i++){let bb=0,bw=-1;for(let k=0;k<4;k++){const w=GC(sw,i,k);if(w>bw){bw=w;bb=GC(si,i,k)}}if(cen[bb]){cen[bb][0].add(V(i));cen[bb][1]++}}
  cen.forEach(q=>{if(q[1])q[0].multiplyScalar(1/q[1])});
  let tot=0;const yLo=box.min.y+sz.y*.16;
  for(let t=0;t<nT;t++){const a=V(vi(t,0)),b=V(vi(t,1)),d=V(vi(t,2)),cr=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(d,a)),ar=cr.length()*.5;if(ar<1e-7)continue;
    const w={};for(let k=0;k<3;k++){const v=vi(t,k);for(let j=0;j<4;j++){const bi=GC(si,v,j);w[bi]=(w[bi]||0)+GC(sw,v,j)}}
    let bn=-1,bw=-1;for(const q in w)if(w[q]>bw){bw=w[q];bn=+q}
    // any real share of head or jaw keeps the rune off that triangle (eyes, mouth, lips, nostrils)
    let hw=0;for(const q in w)if(bad[q])hw+=w[q];if(bn<0||bad[bn]||hw>.3)continue;
    if(bw<2.4)continue;   // mostly one bone (≥80%): away from bending joints, where a flat rune would sink in or lift off
    const ce=new THREE.Vector3().add(a).add(b).add(d).multiplyScalar(1/3),nm=cr.normalize();
    const out=cen[bn]&&cen[bn][1]?new THREE.Vector3().subVectors(ce,cen[bn][0]):nm.clone();if(nm.dot(out)<0)nm.negate();
    if(nm.y<-.3||ce.y<yLo)continue;                                    // not underneath, not down at the feet
    tot+=ar;tri.push({a,b,d,ce,nm,bn,cum:tot})}
  if(!tri.length||tot<=0)return;
  const R=fr189Rng(fr189Seed(c)^0x5f3759df),sz1=Math.max(.01,D*.026),placed=[],ray=new THREE.Raycaster(),hitters=[];
  g.traverse(o=>{if(o.isMesh&&!o.userData.fr189)hitters.push(o)});
  let lastG=-1;const ci=fr189Seed(c)%FR189.COL.length;   // this companion's one colour
  for(let i=0;i<n;i++){let pick=null;
    for(let tries=0;tries<48&&!pick;tries++){const u=R()*tot;let lo=0,hi=tri.length-1;while(lo<hi){const m=(lo+hi)>>1;if(tri[m].cum<u)lo=m+1;else hi=m}
      const T=tri[lo];let r1=R(),r2=R();if(r1+r2>1){r1=1-r1;r2=1-r2}
      const p=T.a.clone().addScaledVector(new THREE.Vector3().subVectors(T.b,T.a),r1).addScaledVector(new THREE.Vector3().subVectors(T.d,T.a),r2);
      const need=sz1*(tries<16?1.9:tries<30?1.5:1.15);   // never overlapping; crowded bodies (big wings, shells) close up the gaps rather than skip a runeif(placed.some(q=>q.distanceTo(p)<need))continue;
      // something else in front of it (a shell, a wing, armour, a fur tuft)? then it would be hidden: try another spot
      if(tries<40){ray.set(p.clone().addScaledVector(T.nm,sz1*.25),T.nm);ray.far=D*.35;let hid=false;try{hid=ray.intersectObjects(hitters,false).length>0}catch(_){}if(hid)continue}
      pick={p,T}}
    if(!pick)continue;placed.push(pick.p);
    let gi=Math.floor(R()*FR189.G.length);if(gi===lastG)gi=(gi+1+Math.floor(R()*3))%FR189.G.length;lastG=gi;
    const m=new THREE.Mesh(FR189.geo||(FR189.geo=new THREE.PlaneGeometry(1,1)),fr189Mat(gi,ci));
    m.userData.fr189=1;m.userData.noMerge=1;m.castShadow=false;m.receiveShadow=false;m.renderOrder=3;
    // face out of the skin, the symbol's top toward the sky (a little tilt each), lifted just off the surface
    const N=pick.T.nm,up=new THREE.Vector3(0,1,0).addScaledVector(N,-N.y);if(up.lengthSq()<1e-4)up.set(0,0,1).addScaledVector(N,-N.z);up.normalize();
    up.applyAxisAngle(N,(R()-.5)*.7);const X=new THREE.Vector3().crossVectors(up,N).normalize(),Mt=new THREE.Matrix4().makeBasis(X,up,N);
    const s=sz1*(.88+R()*.24);m.matrix.compose(pick.p.clone().addScaledVector(N,sz1*.1),new THREE.Quaternion().setFromRotationMatrix(Mt),new THREE.Vector3(s,s,s));
    m.matrix.decompose(m.position,m.quaternion,m.scale);
    const bone=sk.bones[pick.T.bn]||sk.bones[0];m.updateMatrixWorld(true);bone.attach(m)}   // world pose → the bone's own space
  g.userData.fr189=n}
// every companion model: lpRig and the older rigs come through cr; partners' companions too (their look carries fz and the seed)
{const f=cr;cr=function(c){const g=f.apply(this,arguments);try{if(c&&!c.en&&g&&!(c.g&&EN[c.g[0]]))fr189Apply(g,c)}catch(e){console.error('fusion runes',e)}return g}}
// your companions: the follower is rebuilt when its fusion count changes (the old key only saw `f`, which stops at 10)
{const f=sync;sync=function(){try{for(let i=0;i<2;i++){const g=fols[i],c=party[i];if(g&&c&&!c.en&&(g.userData.fr189|0)!==Math.min(60,fs189N(c)))leadK[i]=''}}catch(_){}return f.apply(this,arguments)}}
// co-op: partners build your companions from mpvLookOf; the fusion count and rune seed go at the end of the look
// (older partners ignore them), so they see the same runes in the same spots and the same stars
{const f=mpvLookOf;mpvLookOf=function(c){const L=f.apply(this,arguments);try{const n=fs189N(c);if(n>0){L.fz=n;L.rs=fr189Seed(c)}}catch(_){}return L}}
{const f=mpvLookIn;mpvLookIn=function(L){const c=f.apply(this,arguments);try{if(c&&L){const n=Math.max(0,Math.min(60,L.fz|0)),s=Math.floor(+L.rs||0);if(n>0){c.fz=n;if(s>0&&s<2147483648)c.rs189=s}}}catch(_){}return c}}
// one shared pulse for every rune
{let last=0;const tick=now=>{if(now-last>33){last=now;try{fr189Pulse(now)}catch(_){}}requestAnimationFrame(tick)};try{requestAnimationFrame(tick)}catch(_){}}
