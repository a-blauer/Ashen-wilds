// ================= v172 creature remaster: the sculpt kit =================
// Owner (Oct 30 2026): "re-do my companion models and the enemy creature models (not Sovereigns or mini bosses) from the
// ground up. Every new model references the original for its direction but vastly improves its anatomy and features to be a
// more serious and detailed version of itself. Use the same design concepts as the mini bosses. No goofy or childish
// expressions or proportions. Cohesive and well designed, with no clipping or floating body parts or elements."
// The design concepts taken from the mini bosses (Vorraxis, Gorthrak, Qarsul; see docs/CREATURE_RECIPE.md):
//  * real anatomy first: a skeleton-true body (deep chest, waist, haunches, joints where the bones are), muscle masses as
//    shaped sections, heads with a skull, brow, cheek, jaw and a small eye under a brow (never big round eyes);
//  * layered surface detail laid ON the surface (cm172Cover: shingled scales, plates, fur locks, feathers), each turned to
//    the surface, every row tucked under the one before, in a pattern (bands, chevrons, countershading);
//  * a material language: matte hide / fur, glossy chitin and horn, bone and teeth, dark metal, and a small emissive accent
//    that tells the creature's theme (shared materials: one shader program each for every creature in the game);
//  * about twice the old triangles, measured (CM172.tris).
// How it fits: each rig keeps its skeleton (SPEC[rig].bones), so rigAnim, every attack, ability, evolution look, trait and
// fusion overlay still runs. cm172Def(rig, species, D) registers a new model; cm172Install(rig) puts a dispatcher in
// LPR[rig] that builds the registered species (else the old model). The body ('hide' slot) is LPR's skinned geometry (so the
// evolution looks' rays land on the new body); the other slots become extra skinned meshes on the same skeleton.
// Every part is placed from a surface point of a loft (B.at), so it sits on the body; CM172.chk=1 makes the builder report
// parts that float (cm172Check), and the tests fail on them.
var CM172={on:true,D:{},gc:{},chk:0,tris:{},rep:{},last:{},smooth:1,tile:.3};
// ---------------- shared materials ----------------
function cm172TexMat(kind,slot){const M=cm172Mats(),k=kind+'|'+slot;if(M.tx[k])return M.tx[k];const sm=!!CM172.smooth;
  const m=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:!sm,skinning:true,side:THREE.DoubleSide,map:cm172Tex(kind),roughness:slot=='f'?.92:.88,metalness:0});
  m.userData.lpsSkip=1;return M.tx[k]=m}
function cm172Mats(){if(CM172.M&&CM172.M.sm===!!CM172.smooth)return CM172.M;const sm=!!CM172.smooth,f=o=>Object.assign({vertexColors:true,flatShading:!sm,skinning:true},o),M=dkM();
  // flat shading takes its normal from the screen, so every material is two-sided and no part can show its back
  const D=THREE.DoubleSide;CM172.M={k:new THREE.MeshStandardMaterial(f({roughness:.4,metalness:.24,side:D})),   // chitin, scales, horn, shell (glossy)
    b:new THREE.MeshStandardMaterial(f({roughness:.66,metalness:.04,side:D})),        // bone, teeth, claws, keratin
    f:new THREE.MeshStandardMaterial(f({roughness:.97,metalness:0,side:D})),          // fur locks, feathers, membranes
    m:new THREE.MeshStandardMaterial(f({roughness:.38,metalness:.62,side:D})),        // iron, bronze, gold
    g:new THREE.MeshBasicMaterial({vertexColors:true,skinning:true,side:D}),          // glow (eyes, embers, runes)
    c:sm?new THREE.MeshStandardMaterial(f({roughness:.9,metalness:.04,side:D})):M.c,
    hide:new THREE.MeshStandardMaterial(f({roughness:.9,metalness:0,side:D})),sm,tx:{}};
  // the body and the fur clumps carry the painted texture of their kind (cm172TexMat)
  // the smooth look opts out of the world's low-poly pass (0750), which would flatten them again
  if(sm)Object.values(CM172.M).forEach(m=>{if(m&&m.isMaterial)m.userData.lpsSkip=1});return CM172.M}
// ---------------- painted detail textures (owner, Oct 30 2026: "see how it handles making fur") ----------------
// Fur, scales and the like are PAINTED into a shared grey texture, not built from triangles: the material multiplies the
// texture with the vertex colours, so one texture serves every creature and every colour. Tileable; v runs along the body
// (the fur flows toward +v), u around it. Kinds: fur (overlapping clumps, light tips, dark roots, strands), fine (short fur
// for faces and legs), scale, chitin, skin.
function cm172Tex(kind){CM172.tex=CM172.tex||{};if(CM172.tex[kind])return CM172.tex[kind];
  const S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d'),rn=cmRng(kind.length*977+13),g=v=>{const c=Math.round(Math.max(0,Math.min(1,v))*255);return 'rgb('+c+','+c+','+c+')'};
  const wrap=(f)=>{for(const dx of [-S,0,S])for(const dy of [-S,0,S]){x.save();x.translate(dx,dy);f();x.restore()}};
  if(kind=='fur'||kind=='fine'){const fine=kind=='fine',cols=fine?10:7,rows=fine?8:5,cw=S/cols,rh=S/rows;
    // a mid base, then layers of soft clumps: a blurred shadow under each, a gradient body (dark root → light tip), strands
    x.fillStyle=g(.6);x.fillRect(0,0,S,S);const L=[];
    for(let r=rows*2-1;r>=0;r--)for(let c=0;c<cols;c++)L.push([c*cw+(r%2?cw/2:0)+(rn()-.5)*cw*.5,r*rh/2+(rn()-.5)*rh*.25,cw*(1+rn()*.45),rh*(1.7+rn()*.7),(rn()-.5)*.3,rn()]);
    L.forEach(([cx,cy,w,h,tw,k])=>wrap(()=>{x.save();x.translate(cx,cy);x.rotate(tw);
      const shape=(sc)=>{x.beginPath();x.moveTo(-w*.5*sc,0);x.bezierCurveTo(-w*.55*sc,h*.5,-w*.15,h*.82,w*.06,h);x.bezierCurveTo(w*.18,h*.8,w*.55*sc,h*.5,w*.5*sc,0);x.quadraticCurveTo(0,-h*.15,-w*.5*sc,0)};
      x.save();x.filter='blur('+(fine?2:4)+'px)';x.translate(w*.06,h*.08);x.fillStyle='rgba(0,0,0,.32)';shape(1);x.fill();x.restore();
      const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,g(.62+k*.06));gr.addColorStop(.6,g(.84+k*.06));gr.addColorStop(1,g(.97));x.fillStyle=gr;shape(1);x.fill();
      x.lineCap='round';for(let i=0;i<(fine?4:9);i++){const sx=(rn()-.5)*w*.75,lt=rn()<.55;x.strokeStyle=lt?'rgba(255,255,255,.35)':'rgba(40,40,40,.28)';x.lineWidth=(fine?.8:1.4)+rn()*(fine?.8:1.6);
        x.beginPath();x.moveTo(sx,h*(.05+rn()*.15));x.quadraticCurveTo(sx*.7+(rn()-.5)*4,h*.55,sx*.25+w*.04,h*(.8+rn()*.18));x.stroke()}
      x.restore()}))}
  else if(kind=='scale'||kind=='chitin'){const cols=kind=='scale'?12:6,rows=kind=='scale'?14:7,cw=S/cols,rh=S/rows;x.fillStyle=g(.4);x.fillRect(0,0,S,S);
    for(let r=rows-1;r>=0;r--)for(let c=0;c<cols;c++){const cx=c*cw+(r%2?cw/2:0),cy=r*rh,w=cw*.98,h=rh*1.5;wrap(()=>{x.save();x.translate(cx,cy);
      const gr=x.createRadialGradient(0,h*.25,1,0,h*.35,w*.75);gr.addColorStop(0,g(.98));gr.addColorStop(.7,g(.8));gr.addColorStop(1,g(.55));x.fillStyle=gr;
      x.beginPath();x.moveTo(-w*.5,0);x.quadraticCurveTo(-w*.55,h*.7,0,h);x.quadraticCurveTo(w*.55,h*.7,w*.5,0);x.closePath();x.fill();x.strokeStyle=g(.3);x.lineWidth=1.5;x.stroke();x.restore()})}}
  else{x.fillStyle=g(.85);x.fillRect(0,0,S,S);for(let i=0;i<1400;i++){x.fillStyle=g(.7+rn()*.3);x.globalAlpha=.25;const r=2+rn()*7;x.beginPath();x.arc(rn()*S,rn()*S,r,0,7);x.fill()}x.globalAlpha=1}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return CM172.tex[kind]=t}
// ---------------- small helpers ----------------
var CM_V=THREE.Vector3;
function cmRng(s){let a=(s|0)||1;return ()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
function cmCol(h){return h&&h.isColor?h.clone():new THREE.Color(h)}
function cmMix(a,b,k){return cmCol(a).lerp(cmCol(b),k).getHex()}
function cmShade(a,k){return cmCol(a).multiplyScalar(k).getHex()}
function cmSS(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
// the palette from a creature colour: main (muted toward earth), dark back, pale belly, deep shadow, light highlight
function cm172Pal(C,o){o=o||{};const main=lpMain(C,o.mute==null?.14:o.mute);
  return {main:main.getHex(),back:main.clone().multiplyScalar(o.back||.58).getHex(),dark:main.clone().multiplyScalar(.3).getHex(),
    belly:main.clone().lerp(new THREE.Color(o.bellyC||0xcfc6b2),o.belly==null?.55:o.belly).getHex(),light:main.clone().lerp(new THREE.Color(0xe8e0d0),.28).getHex(),
    deep:main.clone().multiplyScalar(.16).getHex()}}
// ---------------- geometry library (cached; positions only, non-indexed) ----------------
function cmG(k,f){return CM172.gc['G'+k]||(CM172.gc['G'+k]=f())}
function cmTri(pos){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));return g}
// a plate / scale / lock of fur from an outline [x,y] (tip toward -y), a raised top, a thinner underside; +z is the surface normal.
// dome: how much the middle rises, tipUp: the tip curls out, th: thickness
function cmShell(o,dome,tipUp,th){const pos=[],T=(a,b,c)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  const top=o.map(([x,y])=>[x,y,(1-Math.min(1,Math.hypot(x*1.4,y)))*dome+(y<-.3?tipUp*(-y-.3)/.7:0)]),bot=o.map(([x,y])=>[x*.84,y*.88,-th*.5+(y<-.3?tipUp*(-y-.3)/.7*.7:0)]),
    c=[0,-.05,dome+th*.5],cb=[0,0,-th*.5];
  for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}return cmTri(pos)}
var CM_SH={
  scale:()=>cmG('scale',()=>cmShell([[0,.5],[.42,.22],[.46,-.12],[.26,-.42],[0,-.62],[-.26,-.42],[-.46,-.12],[-.42,.22]],.07,.05,.14)),
  plate:()=>cmG('plate',()=>cmShell([[0,.5],[.46,.42],[.5,0],[.46,-.42],[0,-.52],[-.46,-.42],[-.5,0],[-.46,.42]],.08,.02,.16)),
  // a lock of fur: long, narrow, pointed, curled out a little at the tip
  lock:()=>cmG('lock',()=>cmShell([[0,.5],[.36,.22],[.26,-.45],[0,-.95],[-.26,-.45],[-.36,.22]],.05,-.09,.06)),
  // a short lock (dense fur on limbs and the face)
  tuft:()=>cmG('tuft',()=>cmShell([[0,.45],[.3,.2],[.28,-.2],[0,-.62],[-.28,-.2],[-.3,.2]],.05,.06,.07)),
  // a feather: a vane with a raised shaft
  feather:()=>cmG('feather',()=>cmShell([[0,.5],[.2,.36],[.24,0],[.2,-.5],[.1,-.86],[0,-1],[-.12,-.8],[-.22,-.45],[-.22,0],[-.18,.36]],.04,.04,.05)),
  // a broad overlapping plate with a keel (beetle / armadillo bands, carapace)
  keel:()=>cmG('keel',()=>cmShell([[0,.5],[.5,.4],[.56,0],[.48,-.36],[0,-.5],[-.48,-.36],[-.56,0],[-.5,.4]],.16,.03,.16))};
// a tapered horn / claw / tooth along +z, bending toward (bx,by) at the tip; r base radius, l length, n sides
function cmHorn(r,l,bx,by,n,seg,tipR){const k='horn|'+[r,l,bx,by,n,seg,tipR].join(',');return cmG(k,()=>{seg=seg||5;n=n||6;const pos=[],R=[];
  for(let s=0;s<=seg;s++){const t=s/seg,rr=r*(1-t*(1-(tipR||.06))),c=[bx*t*t,by*t*t,l*t],a=[];for(let i=0;i<n;i++){const u=i/n*Math.PI*2;a.push([c[0]+Math.cos(u)*rr,c[1]+Math.sin(u)*rr,c[2]])}R.push(a)}
  const T=(a,b,c)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  for(let s=0;s<seg;s++)for(let i=0;i<n;i++){const j=(i+1)%n,a=R[s][i],b=R[s][j],c=R[s+1][j],d=R[s+1][i];T(a,b,c);T(a,c,d)}
  const tip=[bx*1.08,by*1.08,l*1.03];for(let i=0;i<n;i++)T(R[seg][i],R[seg][(i+1)%n],tip);
  for(let i=1;i<n-1;i++)T(R[0][0],R[0][i+1],R[0][i]);return cmTri(pos)})}
// a sculpted lump (knuckles, muscles, warts, stones): a sphere pushed out by a smooth hash
function cmBlob(seed,j,ws){return cmG('blob|'+seed+'|'+j+'|'+ws,()=>{ws=ws||10;const g=new THREE.SphereGeometry(1,ws,Math.max(5,(ws*.7)|0)),P=g.attributes.position,s=seed||1;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=Math.sin(x*3.1+s)*Math.cos(y*2.7+s*1.3)*Math.sin(z*3.3+s*.7)+.5*Math.sin(x*6.2+y*5.1+s*2.1),q=1+(j==null?.1:j)*n;P.setXYZ(i,x*q,y*q,z*q)}
  return g.toNonIndexed()})}
function cmSph(ws,hs){return cmG('sph|'+ws+'|'+hs,()=>new THREE.SphereGeometry(1,ws||8,hs||6).toNonIndexed())}
function cmBox(){return cmG('box',()=>new THREE.BoxGeometry(1,1,1).toNonIndexed())}
function cmCyl(n,r0){return cmG('cyl|'+n+'|'+r0,()=>new THREE.CylinderGeometry(r0==null?1:r0,1,1,n||8,1).toNonIndexed())}
function cmLathe(k,pts,n){return cmG('lathe|'+k,()=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n||8).toNonIndexed())}
// a flat outline (membrane, ear, fin, blade) in the XY plane with thickness th
function cmFlat(k,pts,th){return cmG('flat|'+k,()=>{const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));
  const g=new THREE.ExtrudeGeometry(s,{depth:th||.02,bevelEnabled:false});g.translate(0,0,-(th||.02)/2);return g.index?g.toNonIndexed():g})}
// a crystal: a hexagonal prism with a point
function cmCrys(n,sh){return cmLathe('crys|'+n+'|'+sh,[[0,0],[.82,.02],[1,.12],[.92,sh||.68],[0,1]],n||6)}
// ---------------- the builder ----------------
// B = cm172B(rig): works in the rig's model space (rest pose). Slots: 'hide' (the body: LPR geometry, lpMat), 'k' chitin/horn,
// 'b' bone/teeth/claws, 'f' fur locks/feathers, 'm' metal, 'c' cloth/leather, 'g' glow.
function cm172B(rig){const S=SPEC[rig],O=Object.keys(S.bones),bi={};O.forEach((k,i)=>bi[k]=i);
  const B={rig,S,O,bi,sl:{},L:{},parts:[],seed:7,rn:cmRng(7)};
  B.slot=k=>B.sl[k]||(B.sl[k]={P:[],C:[],SI:[],SW:[],IX:[],UV:[]});
  B.bp=n=>{const r=S.bones[n];if(!r)throw new Error('cm172: no bone '+n+' in '+rig);return new CM_V(r[1],r[2],r[3])};
  // weights: 'bone' | [boneA, boneB, blend] | {bone:w,...} → [[i,w]x4]
  B.W=w=>{let m={};if(typeof w=='string')m[w]=1;else if(Array.isArray(w)){m[w[0]]=(m[w[0]]||0)+1-(w[2]||0);if(w[2])m[w[1]]=(m[w[1]]||0)+w[2]}else m=w;
    const L=Object.keys(m).filter(k=>m[k]>1e-4).map(k=>{if(bi[k]==null)throw new Error('cm172: no bone '+k+' in '+rig);return [bi[k],m[k]]}).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const s=L.reduce((a,q)=>a+q[1],0)||1;L.forEach(q=>q[1]/=s);while(L.length<4)L.push([0,0]);return L};
  B.wmix=(a,b,k)=>{const m={};a.forEach(([i,w])=>{if(w)m[O[i]]=(m[O[i]]||0)+w*(1-k)});b.forEach(([i,w])=>{if(w)m[O[i]]=(m[O[i]]||0)+w*k});return B.W(m)};
  B.vert=(sl,p,col,W,uv)=>{const s=B.slot(sl),i=s.P.length/3;s.P.push(p.x,p.y,p.z);s.UV.push(uv?uv[0]:0,uv?uv[1]:0);const c=cmCol(col);s.C.push(c.r,c.g,c.b);W.forEach(q=>s.SI.push(q[0]));W.forEach(q=>s.SW.push(q[1]));return i};
  // ---- lofts: smooth skinned tubes. rings: {p:[x,y,z], rx, ryT, ryB, b:<weights>, ...}; o: {seg, ref, sub (spline steps between
  //      rings), prof(a,u) radius multiplier (a: 0 = +x side, PI/2 = top), paint(rgbHex, ring, s, c, u) → hex, capA/capB (rounded
  //      ends: number of shrinking rings), name, slot, sq (squareness of the section, 0 round … .4 boxy)}
  B.loft=(o)=>{const seg=o.seg||12,ref0=new CM_V(...(o.ref||[0,1,0])),sub=o.sub==null?2:o.sub,R0=o.rings;
    // spline through ring centres (Catmull-Rom), radii and weights interpolated
    const pts=R0.map(r=>new CM_V(...r.p)),curve=pts.length>2?new THREE.CatmullRomCurve3(pts,false,'centripetal'):null,RR=[];
    for(let i=0;i<R0.length;i++){const steps=i<R0.length-1?sub+1:1;for(let s=0;s<steps;s++){const k=s/(sub+1),A=R0[i],Bq=R0[Math.min(R0.length-1,i+1)];
      const pr=(i+k)/(R0.length-1),p=curve?curve.getPoint(Math.min(1,pr)):pts[i].clone().lerp(pts[Math.min(pts.length-1,i+1)],k);
      const ease=k*k*(3-2*k),L=(a,b)=>a+(b-a)*(.35*k+.65*ease);
      RR.push({p,rx:L(A.rx,Bq.rx),ryT:L(A.ryT==null?A.rx:A.ryT,Bq.ryT==null?Bq.rx:Bq.ryT),ryB:L(A.ryB==null?A.rx:A.ryB,Bq.ryB==null?Bq.rx:Bq.ryB),
        W:B.wmix(B.W(A.b),B.W(Bq.b),k),src:k<.5?A:Bq,i:i+k})}}
    // rounded caps: extra shrinking rings beyond the ends
    const cap=(n,end)=>{if(!n)return;const E=end?RR[RR.length-1]:RR[0],N=end?RR[RR.length-2]:RR[1],d=E.p.clone().sub(N.p).normalize(),len=Math.min(E.rx,E.ryT,E.ryB)*(o.capLen||.9);
      const add=[];for(let s=1;s<=n;s++){const t=s/n,k=Math.sqrt(Math.max(0,1-t*t*.98));add.push(Object.assign({},E,{p:E.p.clone().addScaledVector(d,len*t),rx:E.rx*k,ryT:E.ryT*k,ryB:E.ryB*k,cap:1}))}
      if(end)RR.push(...add);else RR.unshift(...add.reverse())};
    cap(o.capA==null?0:o.capA===true?2:o.capA,0);cap(o.capB==null?0:o.capB===true?2:o.capB,1);
    const N=RR.length,sl=o.slot||'hide',base=B.slot(sl).P.length/3,rec={rings:RR,seg,o,frames:[]},tile=o.tile||CM172.tile||.3;
    // texture: v runs along the loft by arc length (the fur flows toward the end), u around it, repeated to keep the clumps square
    let av=0,per=0;RR.forEach((r,i)=>{if(i)av+=r.p.distanceTo(RR[i-1].p);r.av=av;per=Math.max(per,Math.PI*(r.rx+(r.ryT+r.ryB)/2))});rec.ru=o.ru||Math.max(1,Math.round(per/tile));
    let prevU=null;
    RR.forEach((r,i)=>{const tg=RR[Math.min(i+1,N-1)].p.clone().sub(RR[Math.max(i-1,0)].p).normalize();
      let ref=ref0.clone();if(Math.abs(ref.dot(tg))>.92)ref=prevU?prevU.clone():new CM_V(0,0,1);
      const U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new CM_V().crossVectors(U,tg);prevU=U;rec.frames.push({tg,U,Sd});
      const u=(i)/(N-1);r.u=u;
      for(let k=0;k<=seg;k++){const a=(o.rot||0)+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?r.ryT:r.ryB,m=o.prof?o.prof(a,u,r):1,sq=o.sq||0;
        const cx=Math.sign(c)*Math.pow(Math.abs(c),1-sq),sy=Math.sign(s)*Math.pow(Math.abs(s),1-sq);
        const p=r.p.clone().addScaledVector(Sd,cx*r.rx*m).addScaledVector(U,sy*ry*m);
        const col=o.paint?o.paint(r,s,c,u,a):o.col||0x808080;B.vert(sl,p,col,r.W,[k/seg*rec.ru,r.av/tile])}});
    const IX=B.slot(sl).IX,S1=seg+1;for(let i=0;i<N-1;i++)for(let k=0;k<seg;k++){const a=base+i*S1+k,a1=a+1,b2=a+S1,b3=a1+S1;IX.push(a,a1,b2,b2,a1,b3)}
    // close the ends with a fan
    [[0,-1],[N-1,1]].forEach(([ri,dir])=>{const r=RR[ri],ci=B.vert(sl,r.p,o.paint?o.paint(r,dir,0,r.u,0):o.col||0x808080,r.W,[rec.ru*.5,r.av/tile+dir*.05]),o0=base+ri*S1;
      for(let k=0;k<seg;k++){const a=o0+k,a1=a+1;if(dir>0)IX.push(ci,a,a1);else IX.push(ci,a1,a)}});
    rec.base=base;rec.sl=sl;if(o.name)B.L[o.name]=rec;B.parts.push({nm:o.name||'loft',sl,v0:base,v1:B.slot(sl).P.length/3,loft:1,root:!!o.root});return rec};
  // ---- a point on a loft's surface: u 0..1 along it, angle a (0 = +x side, PI/2 = top, -PI/2 = underside), off outward
  //      → {p, n (outward normal), t (tangent toward the end), s (side tangent), W (weights)}
  B.at=(name,u,a,off)=>{const L=typeof name=='string'?B.L[name]:name;if(!L)throw new Error('cm172: no loft '+name);const RR=L.rings,N=RR.length;
    const f=Math.max(0,Math.min(N-1-1e-6,u*(N-1))),i=Math.floor(f),k=f-i,ev=(ii,aa)=>{const r=RR[ii],F=L.frames[ii],c=Math.cos(aa),s=Math.sin(aa),m=L.o.prof?L.o.prof(aa,r.u,r):1,ry=s>0?r.ryT:r.ryB,sq=L.o.sq||0;
      const cx=Math.sign(c)*Math.pow(Math.abs(c),1-sq),sy=Math.sign(s)*Math.pow(Math.abs(s),1-sq);return r.p.clone().addScaledVector(F.Sd,cx*r.rx*m).addScaledVector(F.U,sy*ry*m)};
    const P=(aa)=>ev(i,aa).lerp(ev(i+1,aa),k),p=P(a),da=P(a+.02).sub(P(a-.02)),du=ev(i+1,a).sub(ev(i,a));
    if(du.lengthSq()<1e-10)du.copy(L.frames[i].tg);
    const n=new CM_V().crossVectors(da,du).normalize(),cen=RR[i].p.clone().lerp(RR[i+1].p,k);if(n.dot(p.clone().sub(cen))<0)n.negate();
    const t=du.clone().normalize(),s=new CM_V().crossVectors(n,t).normalize();if(off)p.addScaledVector(n,off);
    return {p,n,t,s,W:B.wmix(RR[i].W,RR[i+1].W,k),r:Math.min(RR[i].rx,RR[i].ryT)}};
  // ---- a rigid part: geometry g placed at point p with basis (x,y,z) and scale; weights W (or bone name); colour col or
  //      paint(localPos) → hex; slot sl. Basis: o.ax = {y: vector the part's +y follows, z: vector its +z (normal) follows}
  //      or o.rot = Euler [x,y,z]; vectors may be arrays.
  B.put=(sl,g,p,o)=>{o=o||{};const P=g.attributes.position,M=new THREE.Matrix4(),V=new CM_V(),pp=Array.isArray(p)?new CM_V(...p):p;
    if(o.ax){const Y=cmV(o.ax.y||[0,1,0]).normalize(),Z0=cmV(o.ax.z||[0,0,1]),Z=Z0.clone().sub(Y.clone().multiplyScalar(Z0.dot(Y))).normalize(),X=new CM_V().crossVectors(Y,Z);
      M.makeBasis(X,Y,Z);if(o.roll)M.multiply(new THREE.Matrix4().makeRotationY(o.roll));if(o.tilt)M.multiply(new THREE.Matrix4().makeRotationX(o.tilt))}
    else if(o.rot)M.makeRotationFromEuler(new THREE.Euler(o.rot[0]||0,o.rot[1]||0,o.rot[2]||0,o.ord||'XYZ'));
    const sc=o.s==null?[1,1,1]:Array.isArray(o.s)?o.s:[o.s,o.s,o.s];M.multiply(new THREE.Matrix4().makeScale(sc[0],sc[1],sc[2]));M.setPosition(pp);
    const W=Array.isArray(o.W)&&Array.isArray(o.W[0])?o.W:B.W(o.W||o.b),s=B.slot(sl),v0=s.P.length/3;
    const UVa=g.attributes.uv;for(let i=0;i<P.count;i++){V.fromBufferAttribute(P,i);const l=V.clone();V.applyMatrix4(M);B.vert(sl,V,o.paint?o.paint(l):o.col||0x808080,W,UVa?[UVa.getX(i),UVa.getY(i)]:[l.x*.5+.5,.5-l.y*.5]);s.IX.push(v0+i)}
    B.parts.push({nm:o.nm||'part',sl,v0,v1:s.P.length/3,free:!!o.free});return v0};
  // a part standing on a loft's surface: q = B.at(...); its +z along the normal, +y along dir (default: toward the loft end)
  B.on=(sl,g,q,o)=>{o=Object.assign({},o);const sink=o.sink==null?.25:o.sink,sz=Array.isArray(o.s)?o.s[2]:(o.s||1);
    const p=q.p.clone().addScaledVector(q.n,-sink*sz*(o.th||.15));const y=o.dir?cmV(o.dir):q.t.clone().multiplyScalar(o.back?-1:1);
    o.ax={y:o.ax&&o.ax.y?o.ax.y:y,z:o.ax&&o.ax.z?o.ax.z:q.n};o.W=o.W||q.W;return B.put(sl,g,p,o)};
  // a horn / claw / spike rooted at q (sunk into the surface), pointing along dir (default: the surface normal)
  B.spike=(sl,q,len,r,o)=>{o=o||{};const d=cmV(o.dir||q.n).normalize(),g=cmHorn(1,1,o.bx||0,o.by||0,o.n||6,o.seg||4,o.tipR);
    const p=q.p.clone().addScaledVector(d,-r*(o.sink==null?.8:o.sink));const up=Math.abs(d.y)>.9?new CM_V(0,0,1):new CM_V(0,1,0),X=new CM_V().crossVectors(up,d).normalize(),Y=new CM_V().crossVectors(d,X);
    const M=new THREE.Matrix4().makeBasis(X,Y,d);if(o.roll)M.multiply(new THREE.Matrix4().makeRotationZ(o.roll));M.multiply(new THREE.Matrix4().makeScale(r,r,len));M.setPosition(p);
    const s=B.slot(sl),v0=s.P.length/3,P=g.attributes.position,V=new CM_V(),W=q.W||B.W(o.b);
    for(let i=0;i<P.count;i++){V.fromBufferAttribute(P,i);const t=V.z;V.applyMatrix4(M);B.vert(sl,V,o.col2!=null?cmMix(o.col,o.col2,cmSS(.2,1,t)):o.col||0x808080,W);s.IX.push(v0+i)}
    B.parts.push({nm:o.nm||'spike',sl,v0,v1:s.P.length/3});return v0};
  // ---- a fringe of fur clumps (the reference wolf's method): a row of pointed clumps rooted on the surface along a line of
  //      surface points, each clump a folded card (raised spine, two flanks) that flows along `flow`, lifted off the surface by
  //      `lift` (radians), so the silhouette gets big, readable, jagged fur; the painted texture gives the strands.
  //      pts: B.at(...) points in order; o: {len (number | fn(i,t)), flow (vector | fn(q,i,t)), lift, curl (tip bends back to the
  //      surface), fold (spine height, × width), jit, col: [root, tip] | fn(i,t) → [root, tip], sink, sl, nm, wid (width factor)}
  B.fringe=(pts,o)=>{const sl=o.sl||'f',s=B.slot(sl),v0=s.P.length/3,rn=cmRng(o.seed||(B.seed+=11)),n=pts.length-1,tile=o.tile||CM172.tile||.3;
    for(let i=0;i<n;i++){const t=n>1?i/(n-1):.5,qa=pts[i],qb=pts[i+1],j=1+(o.jit==null?.25:o.jit)*(rn()-.5)*2;
      const m=qa.p.clone().lerp(qb.p,.5),nn=qa.n.clone().add(qb.n).normalize(),W=B.wmix(qa.W,qb.W,.5),wd=qa.p.distanceTo(qb.p)*(o.wid||1);
      const L=(typeof o.len=='function'?o.len(i,t):o.len)*j,fl0=typeof o.flow=='function'?o.flow({p:m,n:nn,t:qa.t,s:qa.s},i,t):cmV(o.flow||qa.t);
      const fl=fl0.clone().sub(nn.clone().multiplyScalar(fl0.dot(nn))).normalize(),lift=(typeof o.lift=='function'?o.lift(i,t):o.lift==null?.35:o.lift)+(rn()-.5)*.15;
      const D=fl.clone().multiplyScalar(Math.cos(lift)).addScaledVector(nn,Math.sin(lift)).normalize(),sink=(o.sink==null?.006:o.sink);
      const ex=(qb.p.clone().sub(qa.p)).normalize(),grow=wd*.5*((o.over==null?.25:o.over));
      const b0=qa.p.clone().addScaledVector(nn,-sink).addScaledVector(ex,-grow),b1=qb.p.clone().addScaledVector(nn,-sink).addScaledVector(ex,grow);
      const tip=m.clone().addScaledVector(D,L).addScaledVector(nn,-(o.curl==null?.25:o.curl)*L*Math.cos(lift)).addScaledVector(ex,(rn()-.5)*wd*.3);
      const up=new CM_V().crossVectors(ex,D).normalize();if(up.dot(nn)<0)up.negate();const fold=(o.fold==null?.18:o.fold)*wd;
      const sL=b0.clone().lerp(tip,.5).addScaledVector(ex,-wd*.08),sR=b1.clone().lerp(tip,.5).addScaledVector(ex,wd*.08),cm=m.clone().lerp(tip,.42).addScaledVector(up,fold);
      const cc=typeof o.col=='function'?o.col(i,t):o.col||[0x808080,0xb0b0b0],C=k=>cmMix(cc[0],cc[1],k),Wt=W,u0=i*.37%1,uw=wd/tile,vl=L/tile;
      const V=[[b0,C(0),[u0,0]],[b1,C(0),[u0+uw,0]],[cm,C(.45),[u0+uw*.5,vl*.42]],[sL,C(.55),[u0+uw*.1,vl*.5]],[sR,C(.55),[u0+uw*.9,vl*.5]],[tip,C(1),[u0+uw*.5,vl]]],bi=s.P.length/3;
      V.forEach(([p,c,uv],k)=>B.vert(sl,p,c,k<2?(k?qb.W:qa.W):Wt,uv));[[0,1,2],[0,2,3],[1,4,2],[3,2,5],[2,4,5]].forEach(f=>s.IX.push(bi+f[0],bi+f[1],bi+f[2]))}
    B.parts.push({nm:o.nm||'fringe',sl,v0,v1:s.P.length/3});return v0};
  // a painted stroke lying on the surface (markings: stripes, slashes, scars): pts = [[u, a], ...] on loft `name`, width w
  //      (tapers to points at both ends, or o.taper = [start, end] factors), colour col (or [start, end]); slot 'f' (textured)
  B.stroke=(name,pts,w,col,o)=>{o=o||{};const sl=o.sl||'f',s=B.slot(sl),v0=s.P.length/3,Q=pts.map(([u,a])=>B.at(name,u,a,o.off==null?.0015:o.off)),n=Q.length,tp=o.taper||[0,0];
    const cc=Array.isArray(col)?col:[col,col];
    Q.forEach((q,i)=>{const t=n>1?i/(n-1):0,d=Q[Math.min(n-1,i+1)].p.clone().sub(Q[Math.max(0,i-1)].p).normalize(),sd=new CM_V().crossVectors(q.n,d).normalize();
      const k=Math.sin(Math.PI*Math.min(1,Math.max(0,t)))*(1-tp[0]-tp[1])+tp[0]*(1-t)+tp[1]*t,ww=w*(o.prof?o.prof(t):Math.max(.15,Math.pow(Math.max(0,k),.6)));
      const c=cmMix(cc[0],cc[1],t);B.vert(sl,q.p.clone().addScaledVector(sd,ww*.5),c,q.W,[t,0]);B.vert(sl,q.p.clone().addScaledVector(sd,-ww*.5),c,q.W,[t,.1])});
    for(let i=0;i<n-1;i++){const a=v0+i*2;s.IX.push(a,a+1,a+2,a+2,a+1,a+3)}B.parts.push({nm:o.nm||'stroke',sl,v0,v1:s.P.length/3});return v0};
  // a row of surface points on loft `name`: along the angle at fixed u (o.u, o.a0..o.a1) or along u at a fixed angle (o.a, o.u0..o.u1)
  B.row=(name,o)=>{const n=o.n||6,L=[];for(let i=0;i<=n;i++){const t=i/n;L.push(o.u!=null?B.at(name,o.u,o.a0+(o.a1-o.a0)*t,o.off||0):B.at(name,o.u0+(o.u1-o.u0)*t,typeof o.a=='function'?o.a(t):o.a,o.off||0))}return L};
  // ---- cover a loft with shingled pieces (the Vorraxis scale method): rows along u, n per row around; o: {geo (CM_SH key or geometry),
  //      u0,u1, rows, n, a0,a1 (angle range, default all round), size (length), w (width factor), lift (tip tilt out), back (tips point
  //      toward the loft start), col(a,u,r,k) → hex, skip(a,u,r,k), jit, sl, out (raise), sz(a,u) size factor}
  B.cover=(name,o)=>{const L=B.L[name],geo=typeof o.geo=='string'?CM_SH[o.geo]():o.geo||CM_SH.scale(),rows=o.rows||5,n=o.n||10,rn=cmRng(o.seed||(B.seed+=7)),out=[];
    const a0=o.a0==null?-Math.PI:o.a0,a1=o.a1==null?Math.PI:o.a1,full=Math.abs(a1-a0-Math.PI*2)<1e-3;
    for(let r=0;r<rows;r++){const u=o.u0+(o.u1-o.u0)*(rows>1?r/(rows-1):.5);
      for(let k=0;k<n;k++){const f=(k+(r%2?.5:0)+(o.jit?(rn()-.5)*o.jit:0))/(full?n:Math.max(1,n-1)),a=a0+(a1-a0)*Math.min(1,Math.max(0,f));
        if(o.skip&&o.skip(a,u,r,k))continue;const q=B.at(name,u+(o.jit?(rn()-.5)*o.jit*.02:0),a,o.out||0),fk=(o.sz?o.sz(a,u):1)*(.9+rn()*.2),l=o.size*fk,w=o.size*(o.w||1)*fk;
        const dir=q.t.clone().multiplyScalar(o.back?-1:1);if(o.twist)dir.addScaledVector(q.s,o.twist(a,u)).normalize();
        const cc=o.col?o.col(a,u,r,k):0x808080,po=Array.isArray(cc)?{paint:l=>cmMix(cc[0],cc[1],cmSS(.35,-.9,l.y))}:{col:cc};
        const v=B.on(o.sl||'k',geo,q,Object.assign({dir,s:[w,l,o.size*(o.th||.9)],tilt:-(o.lift==null?.3:o.lift),th:.14,nm:(o.nm||name)+':'+r+'.'+k},po));out.push(v)}}
    return out};
  return B}
function cmV(a){return Array.isArray(a)?new CM_V(a[0],a[1],a[2]):a.clone()}
// ---------------- finishing: slot → skinned BufferGeometry ----------------
function cm172Geo(s){const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(s.P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(s.C,3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(s.SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(s.SW,4));G.setAttribute('uv',new THREE.Float32BufferAttribute(s.UV,2));G.setIndex(s.IX);
  if(CM172.smooth)cm172Normals(G,CM172.crease||.9);else G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;return G}
// smooth normals with creases (the smooth look): each corner averages the faces that meet at the same point (welded by position)
// and bend less than the crease angle from its own face; sharp edges (claws, plates, teeth) stay sharp. Corners get their own
// vertices (the geometry becomes non-indexed per triangle corner only where a crease splits a vertex).
function cm172Normals(G,crease){const P=G.attributes.position.array,I=G.index.array,nf=I.length/3,FN=new Float32Array(nf*3),cos=Math.cos(crease),key=i=>Math.round(P[i*3]*2e4)+','+Math.round(P[i*3+1]*2e4)+','+Math.round(P[i*3+2]*2e4);
  const a=new CM_V(),b=new CM_V(),c=new CM_V(),map=new Map();
  for(let f=0;f<nf;f++){a.fromArray(P,I[f*3]*3);b.fromArray(P,I[f*3+1]*3);c.fromArray(P,I[f*3+2]*3);const n=c.clone().sub(b).cross(a.clone().sub(b));const l=n.length();if(l>0)n.multiplyScalar(1/l);
    FN[f*3]=n.x;FN[f*3+1]=n.y;FN[f*3+2]=n.z;const w=l;for(let k=0;k<3;k++){const kk=key(I[f*3+k]);let L=map.get(kk);if(!L)map.set(kk,L=[]);L.push(f)}}
  // a new vertex per (vertex, normal group): split where creases are
  const NA=[],remap=new Map(),attrs=['position','color','skinIndex','skinWeight','uv'].map(k=>G.attributes[k]),out=attrs.map(()=>[]),IX=new Uint32Array(I.length);
  for(let f=0;f<nf;f++)for(let k=0;k<3;k++){const v=I[f*3+k],L=map.get(key(v)),n=new CM_V();
    for(const g of L){const d=FN[g*3]*FN[f*3]+FN[g*3+1]*FN[f*3+1]+FN[g*3+2]*FN[f*3+2];if(d>=cos)n.x+=FN[g*3],n.y+=FN[g*3+1],n.z+=FN[g*3+2]}n.normalize();
    const rk=v+'|'+Math.round(n.x*50)+','+Math.round(n.y*50)+','+Math.round(n.z*50);let ni=remap.get(rk);
    if(ni==null){ni=NA.length/3;remap.set(rk,ni);NA.push(n.x,n.y,n.z);attrs.forEach((A,j)=>{for(let q=0;q<A.itemSize;q++)out[j].push(A.array[v*A.itemSize+q])})}IX[f*3+k]=ni}
  G.setAttribute('position',new THREE.Float32BufferAttribute(out[0],3));G.setAttribute('color',new THREE.Float32BufferAttribute(out[1],3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(out[2],4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(out[3],4));G.setAttribute('uv',new THREE.Float32BufferAttribute(out[4],2));
  G.setAttribute('normal',new THREE.Float32BufferAttribute(NA,3));G.setIndex(new THREE.BufferAttribute(IX,1));return G}
// ---------------- the float check: every part must touch the body or a part that does ----------------
// distance from point p to triangle abc
function cmPtTri(p,a,b,c){const ab=b.clone().sub(a),ac=c.clone().sub(a),ap=p.clone().sub(a),d1=ab.dot(ap),d2=ac.dot(ap);if(d1<=0&&d2<=0)return ap.length();
  const bp=p.clone().sub(b),d3=ab.dot(bp),d4=ac.dot(bp);if(d3>=0&&d4<=d3)return bp.length();const vc=d1*d4-d3*d2;if(vc<=0&&d1>=0&&d3<=0)return p.distanceTo(a.clone().addScaledVector(ab,d1/(d1-d3)));
  const cp=p.clone().sub(c),d5=ab.dot(cp),d6=ac.dot(cp);if(d6>=0&&d5<=d6)return cp.length();const vb=d5*d2-d1*d6;if(vb<=0&&d2>=0&&d6<=0)return p.distanceTo(a.clone().addScaledVector(ac,d2/(d2-d6)));
  const va=d3*d6-d5*d4;if(va<=0&&d4-d3>=0&&d5-d6>=0)return p.distanceTo(b.clone().addScaledVector(c.clone().sub(b),(d4-d3)/((d4-d3)+(d5-d6))));
  const den=1/(va+vb+vc),v=vb*den,w=vc*den;return p.distanceTo(a.clone().addScaledVector(ab,v).addScaledVector(ac,w))}
// tol: the gap allowed (model units). Returns [{nm, d}] for parts that float, and B.rep.bad
function cm172Check(B,tol){tol=tol||.004;const parts=B.parts.map((q,i)=>Object.assign({i},q)),tri=q=>{const s=B.sl[q.sl],I=s.IX,T=[];
    for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(a<q.v0||a>=q.v1)continue;T.push([a,b,c].map(v=>new CM_V(s.P[v*3],s.P[v*3+1],s.P[v*3+2])))}return T};
  const vs=q=>{const s=B.sl[q.sl],L=[];for(let v=q.v0;v<q.v1;v++)L.push(new CM_V(s.P[v*3],s.P[v*3+1],s.P[v*3+2]));return L};
  parts.forEach(q=>{q.T=tri(q);q.V=vs(q);const bb=new THREE.Box3().setFromPoints(q.V);q.bb=bb.expandByScalar(tol*2)});
  // the first body loft (or the parts marked root) is the root; everything must connect to it through touching parts
  const done=new Set(),root=parts.filter(q=>q.root);let grew=true;(root.length?root:parts.filter(q=>q.loft&&q.sl=='hide').slice(0,1)).forEach(q=>done.add(q.i));
  const dist=(q,r)=>{if(!q.bb.intersectsBox(r.bb))return 1e9;let best=1e9;for(const p of q.V){if(!r.bb.containsPoint(p))continue;for(const t of r.T){const d=cmPtTri(p,t[0],t[1],t[2]);if(d<best)best=d;if(best<tol)return best}}
    // also the other way round (a small part inside a big one has no vertex near the big one's surface: count containment)
    return best};
  const inside=(q,r)=>{if(!r.loft)return false;const c=q.V.reduce((a,p)=>a.add(p),new CM_V()).multiplyScalar(1/q.V.length);if(!r.bb.containsPoint(c))return false;
    // ray parity along +x against r's triangles
    let n=0;for(const t of r.T){const e1=t[1].clone().sub(t[0]),e2=t[2].clone().sub(t[0]),h=new CM_V(0,-e2.z,e2.y),a=e1.dot(h);if(Math.abs(a)<1e-12)continue;const f=1/a,s=c.clone().sub(t[0]),u=f*s.dot(h);if(u<0||u>1)continue;
      const qq=new CM_V().crossVectors(s,e1),v=f*new CM_V(1,0,0).dot(qq);if(v<0||u+v>1)continue;if(f*e2.dot(qq)>0)n++}return n%2==1};
  while(grew){grew=false;for(const q of parts){if(done.has(q.i)||q.free)continue;for(const i of done){const r=parts[i];if(dist(q,r)<tol||dist(r,q)<tol||inside(q,r)){done.add(q.i);grew=true;break}}}}
  const bad=parts.filter(q=>!done.has(q.i)&&!q.free).map(q=>{let d=1e9;done.forEach(i=>{d=Math.min(d,dist(q,parts[i]))});return {nm:q.nm,d:+d.toFixed(4)}});
  return bad}
// ---------------- registry and the LPR dispatcher ----------------
// D: {rig, sp, sc?, mat?, build(B, c, C, red) — fills B and sets B.head / B.back / B.up / B.horn / B.armor anchors,
//     post(x, c, C, mat) — animated parts (ears, wings), kit(k, c, C, red) — optional old-style dkKit parts}
function cm172Def(rig,sp,D){D.rig=rig;D.sp=sp;CM172.D[rig+'|'+sp]=D;return D}
function cm172Sp(rig,c){const V=typeof RV137!='undefined'&&RV137.var[rig];if(V){return (RV137.cur&&RV137.cur[rig])||(c&&c.g&&V.indexOf(c.g[0])>=0?c.g[0]:V[0])}return rig}
function cm172For(rig,c){if(!CM172.on)return null;return CM172.D[rig+'|'+cm172Sp(rig,c)]||null}
function cm172Build(D,C,c){const red=!!(c&&c.v=='Shadow'),key=D.rig+'|'+D.sp+'|'+C+'|'+(red?1:0)+(CM172.smooth?'|s':'');if(CM172.gc[key])return CM172.last[D.rig]=CM172.gc[key];
  const B=cm172B(D.rig);B.red=red;B.C=C;B.c=c;D.build(B,c||{},C,red);
  const out={D,body:cm172Geo(B.slot('hide')),slots:{},head:B.head,back:B.back,up:B.up,horn:B.horn,armor:B.armor,tris:0};
  for(const k in B.sl)if(k!='hide'&&B.sl[k].IX.length)out.slots[k]=cm172Geo(B.sl[k]);
  [out.body,...Object.values(out.slots)].forEach(g=>out.tris+=g.index.count/3);CM172.tris[D.sp]=out.tris;
  if(CM172.chk){try{CM172.rep[D.sp]=cm172Check(B,CM172.chk>1e-6&&CM172.chk<1?CM172.chk:.004)}catch(e){CM172.rep[D.sp]=[{nm:'check failed '+e,d:-1}]}}
  CM172.last[D.rig]=out;return CM172.gc[key]=out}
// the extra slot meshes on the body's skeleton (shared materials)
function cm172Attach(x,out){const body=x.b.children.find(m=>m.isSkinnedMesh&&m.skeleton);if(!body)return;const M=cm172Mats(),L=[];
  const D=out.D,tk=D&&D.tex||'fur';
  for(const k in out.slots){const m=new THREE.SkinnedMesh(out.slots[k],k=='f'?cm172TexMat(D&&D.ftex||tk,'f'):(M[k]||M.c));m.castShadow=k!='g';m.frustumCulled=false;m.userData.cm172=k;L.push(m)}
  dkBind(body,L);x.cm172=out;if(CM172.smooth||out.D){body.material=cm172TexMat(tk,'hide');body.userData.lpsSkip=1;L.forEach(m=>m.userData.lpsSkip=1)}}
function cm172Install(rig){const old=LPR[rig];if(!old||old.__cm172)return;
  const pick=c=>cm172For(rig,c),cur=()=>CM172.last[rig];
  const N={__cm172:1,old,
    geo(C,c){const D=pick(c);if(!D)return old.geo.apply(old,arguments);return cm172Build(D,C,c).body},
    kit(k,c,C,red){const D=pick(c);if(!D)return old.kit.apply(old,arguments);if(D.kit)D.kit(k,c,C,red)},
    post(x,c,C,mat){const D=pick(c);if(!D)return old.post&&old.post.apply(old,arguments);const out=cm172Build(D,C,c);cm172Attach(x,out);if(D.post)D.post(x,c,C,mat,out)}};
  ['sc','mat'].forEach(k=>Object.defineProperty(N,k,{configurable:true,enumerable:true,get(){const D=pick(null);return D&&D[k]!=null?D[k]:old[k]}}));
  ['head','back','up','horn','armor'].forEach(k=>Object.defineProperty(N,k,{configurable:true,enumerable:true,get(){const D=pick(null);const o=D&&CM172.gc&&cur();return D&&o&&o[k]!=null?o[k]:old[k]}}));
  LPR[rig]=N;if(typeof EVO100!='undefined'&&EVO100.surf)Object.keys(EVO100.surf).forEach(k=>{if(k==rig||k.indexOf(rig+'|')==0)delete EVO100.surf[k]})}
