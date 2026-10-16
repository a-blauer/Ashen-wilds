// ================= v81: low-poly creature toolkit (Valheim style) =================
// Every companion rig is rebuilt as one chunky, flat-shaded, vertex-painted body skinned to the rig's OLD skeleton
// (SPEC[n].bones), so the shared rigAnim walk/fly/attack animation keeps working unchanged.
// A creature registers itself in LPR[rigName] = {geo, kit, post, back, head, sc}; see zzE_*.js.
var LPR={},LPG={},LPMT={},LPSG={};
// fur/skin colour muted toward earth brown (the painterly Valheim palette)
function lpMain(C,k){return new THREE.Color(C).lerp(new THREE.Color(0x5a4636),k==null?.18:k)}
function lpHex(c){return c.isColor?c.getHex():c}
// position helper for Q()-template rigs: the template space of the Foxlet skeleton → this rig's space
function lpT(n,p){const S=SPEC[n];return S&&S.T?S.T(p):p}
// Build a skinned, vertex-coloured geometry from lofts, cached by key.
// loft = {rings:[{p:[x,y,z], rx, ryT, ryB, b:[boneA,boneB,blend], ...any extra fields for paint}], seg, ref:[x,y,z] ("up" of the cross-section),
//         paint:(color,ring,s,c)=>void  (s = −1 bottom … 1 top of the section, c = side), capA, capB, rot (section angle offset)}
function lpGeo(key,n,lofts,seed){
  if(LPG[key])return LPG[key];
  const O=Object.keys(SPEC[n].bones),P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(seed||77),V=THREE.Vector3,tmp=new THREE.Color();
  const bi=b=>{const i=O.indexOf(b);if(i<0)throw new Error('lp: no bone '+b+' in '+n);return i};
  lofts.forEach(L=>{
    const rings=L.rings,seg=L.seg||8,ref=new V(...(L.ref||[0,1,0])),base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){
        const a=Math.PI/2+(L.rot||0)+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB),j=r.j?1+(R()-.5)*r.j:1;
        P.push(pts[i].x+(Sd.x*c*r.rx+U.x*s*ry)*j,pts[i].y+(Sd.y*c*r.rx+U.y*s*ry)*j,pts[i].z+(Sd.z*c*r.rx+U.z*s*ry)*j);
        L.paint(tmp,r,s,c,i);tmp.multiplyScalar(.9+R()*.15);Cc.push(tmp.r,tmp.g,tmp.b);
        SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0);
      }
    });
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;IX.push(a,a1,b2,b2,a1,b3)}
    [[L.capA,0],[L.capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;P.push(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z);
      const o=base+q[1]*seg;L.paint(tmp,r,q[1]?1:-1,0,q[1]);Cc.push(tmp.r,tmp.g,tmp.b);SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0);
      for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}});
  });
  const G=new THREE.BufferGeometry();
  G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();return LPG[key]=G;
}
// shared flat-shaded vertex-colour material (skin = for the skinned body); o = extra options (e.g. {transparent,opacity} for ghosts)
function lpMat(v,skin,o){
  const k=(v||'')+(skin?'s':'')+(o?JSON.stringify(o):'');if(LPMT[k])return LPMT[k];
  return LPMT[k]=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,roughness:.95,metalness:0,skinning:!!skin,side:THREE.DoubleSide,
    emissive:v=='Ember'?0x2a0c00:v=='Golden'?0x2a1e00:0},o||{}))}
// a non-skinned flat spike (ears, fins, membranes) coloured base→tip; parent it to a bone. sides = 3/4 (pyramid)
function lpSpikeGeo(base,tip,sides){
  const k=lpHex(base)+'|'+lpHex(tip)+'|'+(sides||4);if(LPSG[k])return LPSG[k];
  const g=new THREE.ConeGeometry(1,1,sides||4,2).toNonIndexed();if((sides||4)==4)g.rotateY(Math.PI/4);g.translate(0,.5,0);
  const pa=g.attributes.position,col=[],a=new THREE.Color(base),b=new THREE.Color(tip),c=new THREE.Color();
  for(let i=0;i<pa.count;i++){c.copy(a).lerp(b,Math.min(1,pa.getY(i)*1.3));col.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return LPSG[k]=g}
// non-skinned part on a bone, given in MODEL space (like dkKit parts); returns the pivot group (rotate the pivot to animate)
function lpPart(S,bones,bn,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz){
  const r=S.bones[bn],p=new THREE.Group();p.position.set(x-r[1],y-r[2],z-r[3]);p.rotation.order='YXZ';
  const m=new THREE.Mesh(geo,mat);m.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;p.add(m);bones[bn].add(p);return p}
// variant & trait extras on a dkKit, using the creature's back line D.back [[bone,x,y,z]…] and head point D.head [bone,x,y,z]
function lpExtras(k,c,D){
  const bk=D.back||[],hd=D.head,up=D.up||.09;
  if(c.v=='Ember')bk.forEach((q,i)=>k.L(q[0],'g',i%2?0xffb040:0xff6a1a,[q[1],q[2]-.03,q[3]],[q[1],q[2]+up*.8,q[3]-.05],.03,.002,4));
  if(c.v=='Frost')bk.forEach(q=>k.L(q[0],'g',0xd8f6ff,[q[1],q[2]-.03,q[3]],[q[1],q[2]+up,q[3]-.03],.03,.002,4));
  if(c.v=='Golden'&&hd)k.p(hd[0],'ring','g',0xffd84a,hd[1],hd[2]+.1,hd[3],.1,.12,.1);
  if(c.tr=='Horned'&&hd){const h=D.horn||1;[-1,1].forEach(s=>{k.L(hd[0],'c',0xb8ac90,[hd[1]+s*.045,hd[2],hd[3]+.03],[hd[1]+s*.06*h,hd[2]+.06*h,hd[3]-.04*h],.022*h,.014*h,5).L(hd[0],'c',0x8a8070,[hd[1]+s*.06*h,hd[2]+.06*h,hd[3]-.04*h],[hd[1]+s*.075*h,hd[2]+.1*h,hd[3]-.11*h],.014*h,.002,5)})}
  if(c.tr=='Spiked')bk.forEach(q=>k.L(q[0],'c',0x2a2a30,[q[1],q[2]-.02,q[3]],[q[1],q[2]+up*1.1,q[3]-.05],.035,.003,5));
  if(c.tr=='Armored'){const w=D.armor||.17;bk.slice(0,4).forEach((q,i)=>{k.p(q[0],'hem','m',0x4a4c54,q[1],q[2]-.03,q[3],w,.035,.07,-.15);k.p(q[0],'box','m',0x7a6a3a,q[1],q[2]+.004,q[3]+.05,w*.5,.012,.014,-.15)})}
  if(c.tr=='Universal'&&hd){k.p(hd[0],'ring','g',0x7cf0ff,hd[1],hd[2]+.15,hd[3],.13,.1,.13);[0,1,2].forEach(i=>k.p(hd[0],'sph','g',[0xff6a9a,0x7cf0ff,0xffe36a][i],hd[1]+Math.cos(i*2.1)*.13,hd[2]+.13,hd[3]+Math.sin(i*2.1)*.13,.018))}
}
// The generic rig. D = LPR[n]:
//   geo(C,c)            → skinned BufferGeometry (cache it with lpGeo, keyed by colour)
//   kit(k,c,C,red)      → add rigid detail parts to dkKit k (eyes, teeth, claws …); positions in model space
//   post(x,c,C,mat)     → optional: add animated non-skinned parts (x.ears pivots, x.wings {p,s,base,amp}); x.S, x.bones available
//   back, head, up      → anchor points for variant/trait extras (lpExtras); horn / armor = optional size factors
//   mat                 → optional material options (e.g. ghosts)
function lpRig(c,n,D){
  const S=SPEC[n],g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const mb=mkBones(S),bones=mb.bones,O=Object.keys(S.bones),C=c.cl[0],red=c.v=='Shadow';
  const mesh=new THREE.SkinnedMesh(D.geo(C,c),lpMat(c.v,1,D.mat));
  mesh.castShadow=true;mesh.frustumCulled=false;mesh.add(bones.pelvis||bones[O[0]]);b.add(mesh);mesh.updateMatrixWorld(true);
  const sk=new THREE.Skeleton(mb.arr);mesh.bind(sk);
  const key='LP|'+n+'|'+C+'|'+(c.v||'')+'|'+(c.tr||'')+'|'+(red?1:0);
  let P=[];if(!(DKBK&&DKBK[key])){const k=dkKit();D.kit(k,c,C,red);lpExtras(k,c,D);P=k.P}
  dkBind(mesh,dkBake(P,O,key));
  const x={g:g,b:b,C:C,bones:bones,spec:S,S:S,ears:[],wings:[],red:red};
  if(D.post)D.post(x,c,C,lpMat(c.v,0,D.mat));
  // fused companions: overlay the other species' signature parts like the old rig did
  const extra=c.g.slice(1).filter(o=>SPEC[o]&&SPEC[o].sig);
  if(extra.length){
    const parts=[],bax=raw=>(bn,geo,col,px,py,pz,sx,sy,sz,rx,rz,basic)=>{if(!S.bones[bn])return;const r=(S.T&&!raw)?S.T([px,py,pz]):[px,py,pz];parts.push({bn:bn,geo:geo,col:col,x:r[0],y:r[1],z:r[2],sx:sx||1,sy:sy||1,sz:sz||1,rx:rx||0,rz:rz||0,basic:basic})};
    Object.assign(x,{ax:bax(),axw:bax(true),axm:(bn,...a)=>S.bones[bn]?mkAx(S,bones)(bn,...a):new THREE.Object3D(),
      tex:(st,hex,pal)=>{const t=rigTex({id:'x'+st,st:st,pal:pal},hex);return new THREE.MeshStandardMaterial({map:t.map,normalMap:t.nm,roughness:.9})},
      wing:(bn,s,span,chord,col,col2,type,px,py,pz)=>{if(!S.bones[bn])return new THREE.Group();const grp=mkWing(type,span,chord,col,col2);if(s<0)grp.scale.x=-1;const p=new THREE.Group();p.add(grp);
        const r=S.bones[bn],q=S.T?S.T([s*px,py,pz]):[s*px,py,pz];p.position.set(q[0]-r[1],q[1]-r[2],q[2]-r[3]);bones[bn].add(p);x.wings.push({p:p,s:s,base:.35,amp:.55});return p}});
    extra.forEach(o=>{try{SPEC[o].sig(x,c.cl[c.g.indexOf(o)]||C,c)}catch(e){console.error('lp fuse',o,e)}});
    [false,true].forEach(bs=>{const m=bakeMesh(parts,O,'LPF|'+n+'|'+c.g.join()+'|'+c.cl.join(),bs);if(m){b.add(m);m.updateMatrixWorld(true);m.bind(sk)}});
  }
  if(c.tr=='Bulky')b.scale.set(1.15,1.08,1.08);
  g.rig=(now,mv,sp)=>rigAnim(x,now,mv,sp);
  g.bs=(D.sc||S.sc||1)*(1+.07*(c.f||0))*(c.z||1);g.scale.setScalar(g.bs);return g;
}
{const f=crRig;crRig=function(c,n){const D=LPR[n];if(D&&SPEC[n]){try{return lpRig(c,n,D)}catch(e){console.error('low-poly rig failed',n,e)}}return f.apply(this,arguments)}}
