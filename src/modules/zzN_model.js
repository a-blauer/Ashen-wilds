// ================= v94 (model track): one clean low-poly style for every humanoid =================
// The hero (all classes, co-op partners, bag and creator previews), every humanoid foe, the humanoid Sovereigns and the
// town folk are rebuilt in the look of the v81 companions: few smooth lofted shapes, flat shading, crisp per-face colour
// regions (no random jitter, no per-vertex mottling) and a small, coherent palette per character.
//  * Skeletons are untouched: every body is skinned to the SAME bones (HB for heroes and foes, idlNB for town folk), the
//    bone names, rest positions and hand bones (aL2/aR2) are the old ones, so the v85 animation, v91 ability poses,
//    v93 grips and v93 idle layer work as before. Only geometry and materials change.
//  * Builder (mdB): lofts of rings (like lpGeo) skinned with up to 4 bone weights per vertex, plus rigid dkKit parts on a
//    bone, merged into at most three geometries per model — cloth/skin ('c'), metal ('m'), glow ('g') — so a whole
//    character is one to three draw calls (+ its weapons). Faces are coloured one colour each (non-indexed geometry), so
//    colour regions have hard, clean edges. Geometry is cached by a key (hero: class + look + worn items; foe: type).
//  * Equipment is built against the body (zzN_model_gear.js): armour pieces are shells of the body's own ring profile,
//    pushed out by a small offset, with the body's bone weights — so they deform with every pose and never float.
//  * Hero look (contract with the creator track): heroLook(h) (defined by that track) returns
//    {skin,hair,hairStyle 0-5,face 0-5,eye,build 0-2,height .94-1.06,sex 0|1}; without it hero.look or defaults are used.
//    heroRebuild(h) rebuilds a hero model in place; heroBuildPreview(look,cls) makes a stand-alone preview model.
var MDL;
function mdS(){return MDL||(MDL={G:new Map(),cap:48,M:null,stat:{built:0,ms:0}})}
// ---------------- materials (shared for foes and town folk; heroes get their own copies) ----------------
function mdMats(){const S=mdS();if(S.M)return S.M;const f=o=>Object.assign({vertexColors:true,flatShading:true,skinning:true},o);
  S.M={c:new THREE.MeshStandardMaterial(f({roughness:.92,metalness:0,side:THREE.DoubleSide})),
    m:new THREE.MeshStandardMaterial(f({roughness:.48,metalness:.5,side:THREE.DoubleSide})),
    g:new THREE.MeshBasicMaterial({vertexColors:true,skinning:true,side:THREE.DoubleSide})};
  for(const k in S.M)S.M[k].userData.lps=1;return S.M}
function mdOwnMats(){const M=mdMats(),o={};for(const k in M){o[k]=M[k].clone();o[k].userData.lps=1;o[k].userData.mdOwn=1}return o}
// ---------------- colour helpers ----------------
function mdC(h){return typeof h=='string'?parseInt(h.replace('#',''),16):Array.isArray(h)?dkHex(h.map(v=>Math.max(0,Math.min(255,Math.round(v))))):h}
function mdMix(a,b,t){return new THREE.Color(mdC(a)).lerp(new THREE.Color(mdC(b)),t).getHex()}
function mdSh(a,f){const c=new THREE.Color(mdC(a));c.multiplyScalar(f);c.r=Math.min(1,c.r);c.g=Math.min(1,c.g);c.b=Math.min(1,c.b);return c.getHex()}
function mdHash(s){let h=7;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}

// =====================================================================================================
// the builder
// =====================================================================================================
function mdB(bones){const O=Object.keys(bones);return {O,bones,L:{c:mdBuf(),m:mdBuf(),g:mdBuf()},bi:{}}}
function mdBuf(){return {p:[],c:[],si:[],sw:[]}}
function mdBI(B,n){let i=B.bi[n];if(i==null){i=B.O.indexOf(n);if(i<0)throw new Error('md: no bone '+n);B.bi[n]=i}return i}
// weights [[bone,w],…] → 4 indices + 4 weights
function mdW(B,w){const si=[0,0,0,0],sw=[0,0,0,0];let t=0;for(let j=0;j<w.length&&j<4;j++){si[j]=mdBI(B,w[j][0]);sw[j]=w[j][1];t+=w[j][1]}if(t>0)for(let j=0;j<4;j++)sw[j]/=t;else sw[0]=1;return [si,sw]}
var MD_TC;
function mdTri(B,t,a,b,c,col){const L=B.L[t]||B.L.c,C=MD_TC||(MD_TC=new THREE.Color());C.setHex(col);
  for(const v of [a,b,c]){L.p.push(v.x,v.y,v.z);L.c.push(C.r,C.g,C.b);L.si.push(v.w[0][0],v.w[0][1],v.w[0][2],v.w[0][3]);L.sw.push(v.w[1][0],v.w[1][1],v.w[1][2],v.w[1][3])}}
// two-bone weight shorthand
function mdWb(a,b,t){return t<=0||a==b?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]]}
// Loft: R = rings {p:[x,y,z], rx, f (front / +up-side radius), b (back radius), w:[[bone,w]…], col?}
//   o: seg, t ('c'|'m'|'g'), col (hex or fn(m)→hex), keep (fn(m)→bool), off (shell offset), ref ([0,0,1] = "front"),
//      wf (fn(x,y,z,ring)→weights, overrides ring.w), capA/capB, rot (angle offset), sq (squareness 0..1 → boxier rings)
//   m (per face): {x,y,z centroid, s (+1 front … −1 back), c (side), i (ring position), r (ring)}
function mdLoft(B,R,o){
  o=o||{};const seg=o.seg||8,n=R.length,off=o.off||0,V=THREE.Vector3,t=o.t||'c',rows=[];if(n<2)return;
  const pts=R.map(r=>new V(r.p[0],r.p[1],r.p[2]));let U=null;
  for(let i=0;i<n;i++){
    const tg=pts[Math.min(i+1,n-1)].clone().sub(pts[Math.max(i-1,0)]);if(tg.lengthSq()<1e-12)tg.set(0,1,0);tg.normalize();
    let u=U?U.clone():new V(...(o.ref||[0,0,1]));u.sub(tg.clone().multiplyScalar(u.dot(tg)));
    if(u.lengthSq()<1e-6){u=new V(1,0,0);u.sub(tg.clone().multiplyScalar(u.dot(tg)))}u.normalize();U=u;
    const Sd=new V().crossVectors(u,tg),r=R[i],row=[],sq=o.sq||r.sq||0;
    for(let k=0;k<seg;k++){
      const a=Math.PI/2+(o.rot||0)+k/seg*Math.PI*2;let c=Math.cos(a),s=Math.sin(a);
      if(sq){const m=Math.max(Math.abs(c),Math.abs(s)),c2=c/m,s2=s/m;c=c+(c2-c)*sq;s=s+(s2-s)*sq}
      const ry=(s>0?(r.f==null?r.rx:r.f):(r.b==null?r.rx:r.b))+off,rx=r.rx+off;
      const x=pts[i].x+Sd.x*c*rx+u.x*s*ry,y=pts[i].y+Sd.y*c*rx+u.y*s*ry,z=pts[i].z+Sd.z*c*rx+u.z*s*ry;
      row.push({x,y,z,s:Math.sin(a),c:Math.cos(a),i,w:mdW(B,o.wf?o.wf(x,y,z,r,i):r.w)})}
    rows.push(row)}
  const face=(A,Bv,C)=>{const m={x:(A.x+Bv.x+C.x)/3,y:(A.y+Bv.y+C.y)/3,z:(A.z+Bv.z+C.z)/3,s:(A.s+Bv.s+C.s)/3,c:(A.c+Bv.c+C.c)/3,i:(A.i+Bv.i+C.i)/3};
    m.r=R[Math.min(n-1,Math.round(m.i))];if(o.keep&&!o.keep(m))return;
    const col=typeof o.col=='function'?o.col(m):(m.r.col!=null&&!o.colAll?m.r.col:o.col);mdTri(B,t,A,Bv,C,mdC(col==null?0x808080:col))};
  // one colour / keep decision per quad, so colour regions have straight edges
  const quad=(a,a1,b2,b3)=>{const m={x:(a.x+a1.x+b2.x+b3.x)/4,y:(a.y+a1.y+b2.y+b3.y)/4,z:(a.z+a1.z+b2.z+b3.z)/4,s:(a.s+a1.s+b2.s+b3.s)/4,c:(a.c+a1.c+b2.c+b3.c)/4,i:(a.i+b2.i)/2};
    m.r=R[Math.min(n-1,Math.round(m.i))];if(o.keep&&!o.keep(m))return;const cc=typeof o.col=='function'?o.col(m):(m.r.col!=null&&!o.colAll?m.r.col:o.col),col=mdC(cc==null?0x808080:cc);
    mdTri(B,t,a,a1,b2,col);mdTri(B,t,b2,a1,b3,col)};
  for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const a=rows[i][k],a1=rows[i][(k+1)%seg],b2=rows[i+1][k],b3=rows[i+1][(k+1)%seg];quad(a,a1,b2,b3)}
  [[o.capA,0],[o.capB,n-1]].forEach(q=>{if(!q[0])return;const row=rows[q[1]],r=R[q[1]],cv={x:pts[q[1]].x,y:pts[q[1]].y,z:pts[q[1]].z,s:0,c:0,i:q[1],w:mdW(B,o.wf?o.wf(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z,r,q[1]):r.w)};
    if(q[0]!==true&&q[0].dy){cv.y+=q[0].dy}if(q[0]!==true&&q[0].dz){cv.z+=q[0].dz}
    for(let k=0;k<seg;k++)face(cv,row[k],row[(k+1)%seg])})}
// rigid dkKit parts (k.P) merged in with one bone each (or ring weights via p.w)
var MD_KV,MD_KE;
function mdKit(B,k){const v=MD_KV||(MD_KV=new THREE.Vector3());
  k.P.forEach(p=>{const g=p.geo,pa=g.attributes.position,ix=g.index?g.index.array:null,cnt=ix?ix.length:pa.count,bn=p.bn||B.O[0],w=mdW(B,p.w||[[bn,1]]),col=mdC(p.col);
    const V=[];for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);V.push({x:v.x,y:v.y,z:v.z,w})}
    for(let i=0;i+2<cnt;i+=3){const a=ix?ix[i]:i,b=ix?ix[i+1]:i+1,c=ix?ix[i+2]:i+2;mdTri(B,p.t=='m'?'m':p.t=='g'?'g':'c',V[a],V[b],V[c],col)}})}
function mdBake(B){const out={};
  for(const t in B.L){const L=B.L[t];if(!L.p.length)continue;const G=new THREE.BufferGeometry();
    G.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3));G.setAttribute('color',new THREE.Float32BufferAttribute(L.c,3));
    G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(L.si,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(L.sw,4));
    G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;G.userData.md=1;out[t]=G}
  return out}
// cached build: key → {c,m,g}; hero keys are evicted (oldest first, only when no model uses them)
function mdGeo(key,build,evict){const S=mdS();let e=S.G.get(key);
  if(e){S.G.delete(key);S.G.set(key,e);return e.g}
  const t0=performance.now();const B=build();e={g:mdBake(B),use:0,ev:!!evict};S.G.set(key,e);S.stat.built++;S.stat.ms+=performance.now()-t0;
  if(evict){let n=0;S.G.forEach(q=>{if(q.ev)n++});if(n>S.cap)for(const [k,q] of S.G){if(n<=S.cap)break;if(q.ev&&q.use<=0&&k!==key){for(const t in q.g)q.g[t].dispose();S.G.delete(k);n--}}}
  return e.g}
function mdUse(key,d){const e=mdS().G.get(key);if(e)e.use+=d}

// =====================================================================================================
// body profile (HB skeleton; town folk use idlNB — the arms follow whatever bones the table has)
// =====================================================================================================
// P: {bones, sex 0|1, build 0..2, wf (width), af (arm thickness), lf (leg thickness), belly, hunch, col:{…}, paint:{…}}
//   col regions: skin, torso, torsoLo, belt, sleeve, fore, hand, pants, shin, boot, sole, neck
function mdP(o){const P=Object.assign({sex:0,build:1,wf:1,af:1,lf:1,belly:0,col:{},paint:{}},o||{});
  if(!P.bones)P.bones=HB;P.col=Object.assign({skin:0xd9b38c,torso:0x6a4a34,belt:0x3a2618,sleeve:null,fore:null,hand:null,pants:0x4a3a2c,shin:null,boot:0x3a2a1e,sole:0x1e1610,neck:null},P.col);
  const C=P.col;if(C.sleeve==null)C.sleeve=C.torso;if(C.fore==null)C.fore=C.skin;if(C.hand==null)C.hand=C.skin;if(C.shin==null)C.shin=C.pants;if(C.neck==null)C.neck=C.skin;if(C.torsoLo==null)C.torsoLo=C.torso;
  return P}
function mdBuildF(P){return [.86,1,1.16][P.build|0]*(P.wf||1)}
// torso rings bottom → neck, with bone weights by height
function mdTorsoW(y){return y<=.5?[['pelvis',1]]:y<=.66?mdWb('pelvis','spine',(y-.5)/.16):y<=.82?mdWb('spine','chest',(y-.66)/.16):y<=.97?[['chest',1]]:y<=1.035?mdWb('chest','neck',(y-.97)/.065):mdWb('neck','head',Math.min(1,(y-1.035)/.05))}
function mdTorso(P){const W=mdBuildF(P),fem=P.sex==1,sh=fem?.86:1,wa=fem?.8:1,hp=fem?1.15:1,bu=P.belly||0,bust=fem?.064:0;
  const T=[[.44,.145*hp,.1,.105],[.5,.158*hp+bu*.1,.11+bu*.3,.114],[.56,.165*hp+bu*.25,.116+bu*.6,.118+bu*.2],[.62,.158*(wa+.06)+bu*.35,.112+bu,.114+bu*.3],[.7,.16*wa+bu*.35,.114+bu,.114+bu*.3],[.78,.18*(fem?.92:1)+bu*.25,.124+bu*.6+bust*.5,.118+bu*.2],
    [.86,.205*sh,.132+bu*.2+bust,.124],[.93,.212*sh,.124+bust*.4,.122],[.972,.18*sh,.102,.104],[1.0,.104,.074,.08],[1.035,.062,.062,.058],[1.075,.056,.058,.055]];
  return T.map(q=>{const y=q[0],k=y>.98?1:W;return {p:[0,y,y>.9?-.004:0],rx:q[1]*k,f:q[2]*(y>.98?1:(1+(W-1)*.6)),b:q[3]*(y>.98?1:(1+(W-1)*.6)),w:mdTorsoW(y),y}})}
// the torso ring at height y (interpolated) — used to place things on the surface
function mdTorsoAt(P,y){const T=P._T||(P._T=mdTorso(P));for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(y<=b.y||i==T.length-2){const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y)));
  return {rx:a.rx+(b.rx-a.rx)*t,f:a.f+(b.f-a.f)*t,b:a.b+(b.b-a.b)*t,z:a.p[2]+(b.p[2]-a.p[2])*t}}}return T[0]}
function mdV(a){return new THREE.Vector3(a[1],a[2],a[3])}
// arm rings shoulder → fingertips (s = −1 left, +1 right)
function mdArm(P,s){const bn=s<0?'aL':'aR',Bt=P.bones,A0=mdV(Bt[bn+'0']),A1=mdV(Bt[bn+'1']),A2=mdV(Bt[bn+'2']),W=mdBuildF(P),af=(P.af||1)*(P.sex==1?.88:1)*(1+(W-1)*.7),L=(a,b,t)=>a.clone().lerp(b,t);
  const sh=A0.clone().add(new THREE.Vector3(-s*.035*(2-W),.03,0)),d2=A2.clone().sub(A1).normalize(),hand=A2.clone().add(d2.clone().multiplyScalar(.05)),tip=A2.clone().add(d2.clone().multiplyScalar(.1));
  const xo=s*((W-1)*.12+(P.armX||0)),X=v=>{v.x+=xo;return v};
  const r=(p,rx,w,part,f,b)=>({p:p.toArray(),rx:rx*af,f:(f||rx)*af,b:(b||rx)*af,w,part});
  return [r(X(sh.clone()),.064,[['chest',.5],[bn+'0',.5]],'up'),r(X(A0.clone().add(new THREE.Vector3(0,-.02,0))),.067,[[bn+'0',1]],'up'),r(X(L(A0,A1,.5)),.062,[[bn+'0',1]],'up'),
    r(X(A1.clone()),.056,[[bn+'0',.5],[bn+'1',.5]],'el'),r(X(L(A1,A2,.45)),.054,[[bn+'1',1]],'fore'),r(X(L(A1,A2,.88)),.047,[[bn+'1',.6],[bn+'2',.4]],'wrist'),
    r(X(A2.clone().add(new THREE.Vector3(0,0,.006))),.05,[[bn+'2',1]],'hand',.054,.04),r(X(hand.add(new THREE.Vector3(0,0,.014))),.046,[[bn+'2',1]],'hand',.05,.03),r(X(tip.add(new THREE.Vector3(0,0,.02))),.026,[[bn+'2',1]],'hand',.03,.02)]}
// leg rings hip → ankle, foot rings heel → toe
function mdLeg(P,s){const l=s<0?'lh':'rh',Bt=P.bones,H0=mdV(Bt[l+'0']),K=mdV(Bt[l+'1']),A=mdV(Bt[l+'2']),lf=(P.lf||1)*(1+(mdBuildF(P)-1)*.5),fh=P.sex==1?1.04:1,L=(a,b,t)=>a.clone().lerp(b,t);
  const r=(p,rx,w,part,f,b)=>({p:p.toArray(),rx:rx*lf,f:(f||rx)*lf,b:(b||rx)*lf,w,part});
  return [r(H0.clone().add(new THREE.Vector3(-s*.005,.02,0)),.09*fh,[['pelvis',.5],[l+'0',.5]],'hip'),r(L(H0,K,.3),.086*fh,[[l+'0',1]],'thigh'),r(L(H0,K,.68),.074,[[l+'0',1]],'thigh'),
    r(K.clone(),.066,[[l+'0',.5],[l+'1',.5]],'knee',.068,.064),r(L(K,A,.35),.064,[[l+'1',1]],'shin',.062,.068),r(L(K,A,.75),.056,[[l+'1',1]],'shin'),r(A.clone().add(new THREE.Vector3(0,.01,0)),.054,[[l+'1',.4],[l+'2',.6]],'ankle')]}
function mdFoot(P,s){const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),x=A.x,lf=(P.lf||1)*(P.sex==1?.9:1);
  const r=(z,y,rx,f,b,part)=>({p:[x,y,A.z+z],rx:rx*lf,f:f*lf,b:b*lf,w:[[l,1]],part});
  return [r(-.06,.05,.05,.03,.045,'heel'),r(-.035,.055,.058,.045,.05,'foot'),r(.035,.05,.06,.04,.045,'foot'),r(.11,.04,.054,.028,.036,'toe'),r(.155,.032,.036,.016,.028,'toe')]}
// head rings (around the head bone); hp = head params {w,jaw,len,top,fwd}
function mdHeadR(P){const h=P.head||{},w=h.w||1,jw=(h.jaw||1)*(P.sex==1?.88:1),fz=h.fwd||0,top=h.top||1,ln=h.len||1;
  const R=(y,rx,f,b,ww,jj)=>({p:[0,y,fz*(y<1.13?1:.5)],rx:rx*w*(jj?jw:1),f:f*(jj?(1+(jw-1)*.6):1)*ln,b:b*w,w:ww||[['head',1]],y});
  return [R(1.02,.056,.06,.054,[['neck',.5],['head',.5]],1),R(1.056,.078,.094,.072,null,1),R(1.09,.09,.108,.09,null,1),R(1.13,.1,.11,.106),R(1.17,.104,.104,.11),
    R(1.21,.097,.088,.104),R(1.24+(top-1)*.03,.074,.06,.08),R(1.262+(top-1)*.05,.034,.026,.04)]}
// front surface of the head at height y (for placing eyes, brows, beards)
function mdHeadZ(P,y){const H=P._H||(P._H=mdHeadR(P));for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y){const t=(y-a.y)/(b.y-a.y);return a.p[2]+a.f+(b.p[2]+b.f-a.p[2]-a.f)*t}}return 0}
function mdHeadX(P,y){const H=P._H||(P._H=mdHeadR(P));for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y){const t=(y-a.y)/(b.y-a.y);return a.rx+(b.rx-a.rx)*t}}return .05}

// paint of a body part: P.paint[region](m) wins over P.col[region]
function mdPaintF(P,region,fb){const f=P.paint[region];if(f)return m=>f(m);const c=P.col[region];return c!=null?c:fb}
// build the whole body: torso + neck, arms + hands, legs, feet (head separately: mdHead)
function mdBody(B,P){const C=P.col,T=mdTorso(P);P._T=T;
  // torso: lower part (hips/pants), belt band, upper (shirt), neck skin
  const tp=P.paint.torso,belt=P.beltY==null?.6:P.beltY;
  if(!P.noTorso)mdLoft(B,T,{seg:12,capA:true,sq:P.sq||0,col:m=>m.y>1.0?C.neck:m.y>.985&&!P.highNeck?C.neck:Math.abs(m.y-belt)<.026&&C.belt!=null?C.belt:m.y<belt?(P.paint.torsoLo?P.paint.torsoLo(m):C.torsoLo==C.torso&&m.y<.5?C.pants:C.torsoLo):tp?tp(m):C.torso});
  [-1,1].forEach(s=>{
    mdLoft(B,mdArm(P,s),{seg:7,capB:true,col:m=>{const p=m.r.part;return p=='hand'?(P.paint.hand?P.paint.hand(m,s):C.hand):p=='up'||(p=='el'&&m.i<3.5)?(P.paint.sleeve?P.paint.sleeve(m,s):C.sleeve):(P.paint.fore?P.paint.fore(m,s):C.fore)}});
    mdLoft(B,mdLeg(P,s),{seg:8,col:m=>{const p=m.r.part;return (P.paint.leg?P.paint.leg(m,s):null)||(p=='shin'||p=='ankle'||(p=='knee'&&m.i>3.5)?C.shin:C.pants)}});
    mdLoft(B,mdFoot(P,s),{seg:7,ref:[0,1,0],capA:true,capB:true,col:m=>m.y<.022?C.sole:C.boot})})}

// =====================================================================================================
// heads, faces, hair (the hero look)
// =====================================================================================================
// hair region on the head shell: front hairline high, temples, nape low
function mdHairLine(m,lo){const s=m.s;return s>0?1.13+.065*s+(lo||0)*s:1.13-(1.13-1.055)*(-s)}
// P.look: normalised look; P.face options: {eyes:'human'|'glow'|'none', eye, brow, ears, nose, mouth, glow}
function mdHead(B,P,o){o=o||{};const H=mdHeadR(P);P._H=H;const sk=P.col.skin,lk=P.look||{},hair=mdC(lk.hair==null?0x3a2414:lk.hair);
  const stubble=lk.face==1,stC=mdMix(sk,hair,.42),bald=lk.hairStyle==5||o.bald,mo=lk.hairStyle==4,shav=mo?mdMix(sk,hair,.35):null;
  mdLoft(B,H,{seg:10,capA:true,capB:true,col:o.headCol||(m=>{if(stubble&&m.y<1.1&&m.s>.05)return stC;if(shav&&m.y>mdHairLine(m))return shav;if(o.paint)return o.paint(m)||sk;return sk})});
  if(o.noFace)return H;
  const k=dkKit(),ey=1.145,ez=mdHeadZ(P,ey),ex=.04*(P.head&&P.head.w||1);
  // eyes: dark socket, white, iris (eye colour)
  [-1,1].forEach(s=>{
    if(o.eyes=='glow'){k.p('head','box','c',0x080606,s*ex,ey,ez-.004,.034,.02,.012);k.p('head','box','g',o.glow||0xff3020,s*ex,ey,ez+.003,.024,.011,.008)}
    else if(o.eyes!='none'){k.p('head','box','c',mdSh(sk,.62),s*ex,ey,ez-.003,.034,.02,.012);k.p('head','box','c',0xf2eee6,s*ex,ey,ez+.002,.026,.013,.008);
      k.p('head','box','c',mdC(lk.eye==null?0x3a5a7a:lk.eye),s*(ex-.002),ey-.001,ez+.006,.012,.012,.006);k.p('head','box','c',0x0a0808,s*(ex-.002),ey-.001,ez+.0085,.006,.006,.004)}
    // brow
    if(o.brow!==false)k.p('head','box','c',o.brow!=null?o.brow:mdSh(hair,.9),s*ex,ey+.022,mdHeadZ(P,ey+.022)+.002,.04,.011,.014,0,0,s*(P.sex==1?.12:.2));
    // ear
    if(o.ears!==false){const hx=mdHeadX(P,1.14);k.p('head','box','c',mdSh(sk,.9),s*(hx+.004),1.135,-.005,.022,.045,.032)}});
  // nose and mouth
  if(o.nose!==false){const nz=mdHeadZ(P,1.118);k.p('head','cone4','c',mdSh(sk,.88),0,1.118,nz+.008,.018,.04,.016,-.35)}
  if(o.mouth!==false){const mz=mdHeadZ(P,1.088);k.p('head','box','c',o.mouth||0x5a2a22,0,1.088,mz-.001,.036,.007,.006)}
  mdKit(B,k);
  if(o.noHair)return H;
  // facial hair
  const f=lk.face|0,bc=mdSh(hair,.95);
  if(f==2||f==3)mdLoft(B,H.slice(0,4),{seg:10,off:.011,col:bc,keep:m=>m.s>-.1&&m.y<1.108&&!(m.s>.6&&m.y>1.075&&m.y<1.1)});
  if(f==3){const z=mdHeadZ(P,1.04);mdLoft(B,[{p:[0,1.06,z-.03],rx:.06,f:.03,b:.03,w:[['head',1]]},{p:[0,1.0,z-.012],rx:.05,f:.028,b:.024,w:[['head',1]]},{p:[0,.95,z],rx:.026,f:.016,b:.014,w:[['head',1]]}],{seg:6,capB:{dy:-.03},col:bc})}
  if(f==2||f==3||f==4){const mk=dkKit(),mz=mdHeadZ(P,1.1);[-1,1].forEach(s=>mk.p('head','box','c',bc,s*.022,1.1,mz+.004,.034,.012,.012,0,0,-s*.25));if(f==4)[-1,1].forEach(s=>mk.p('head','box','c',bc,s*.04,1.084,mz-.004,.012,.028,.01,0,0,s*.15));mdKit(B,mk)}
  if(f==5){const sk2=dkKit();sk2.p('head','box','c',0x9a4a40,-.04,1.15,mdHeadZ(P,1.15)+.009,.008,.07,.004,0,0,.35);mdKit(B,sk2)}
  // hair
  if(!bald&&!o.hood)mdHair(B,P,H,hair,lk.hairStyle|0,o);
  return H}
function mdHair(B,P,H,hair,st,o){const hd=mdSh(hair,.82),fem=P.sex==1;
  if(st==4){// mohawk: shaved sides (painted on the head) + a crest
    if(o.noScalp)return;const k=dkKit();for(let i=0;i<7;i++){const a=-1.1+i*.36,y=1.17+Math.cos(a)*.1,z=Math.sin(a)*.115;k.p('head','box','c',i%2?hair:hd,0,y,z,.026,.075,.05,a)}mdKit(B,k);return}
  if(!o.noScalp)mdLoft(B,H.slice(1),{seg:10,off:.013,capB:true,col:m=>m.y>1.2?hair:m.s<-.3?hd:hair,keep:m=>m.y>mdHairLine(m,fem?.012:0)});
  if(st==1){// long: down the back to the shoulders (+ locks framing the face when feminine)
    mdLoft(B,[{p:[0,1.16,-.06],rx:.1,f:.04,b:.05,w:[['head',1]]},{p:[0,1.06,-.085],rx:.098,f:.03,b:.04,w:[['head',.8],['neck',.2]]},{p:[0,.98,-.1],rx:.09,f:.02,b:.03,w:[['head',.4],['chest',.6]]},{p:[0,fem?.86:.92,-.12],rx:.07,f:.012,b:.02,w:[['chest',1]]}],{seg:8,capB:true,col:m=>m.y<.95?hd:hair});
    if(fem)[-1,1].forEach(s=>mdLoft(B,[{p:[s*.098,1.18,.0],rx:.022,f:.03,b:.03,w:[['head',1]]},{p:[s*.1,1.08,.0],rx:.02,f:.028,b:.028,w:[['head',1]]},{p:[s*.095,.99,-.01],rx:.012,f:.018,b:.018,w:[['head',.6],['neck',.4]]}],{seg:5,capB:true,col:hair}))}
  if(st==2){// ponytail
    const k=dkKit();k.p('head','sph','c',hd,0,1.17,-.115,.03);mdKit(B,k);
    mdLoft(B,[{p:[0,1.18,-.12],rx:.032,w:[['head',1]]},{p:[0,1.12,-.155],rx:.036,w:[['head',1]]},{p:[0,1.03,-.165],rx:.03,w:[['head',.6],['neck',.4]]},{p:[0,.95,-.16],rx:.012,w:[['head',.3],['chest',.7]]}],{seg:6,capB:true,col:hair})}
  if(st==3){// braid down the back
    const k=dkKit();for(let i=0;i<6;i++){const y=1.1-i*.042,z=-.12-i*.008;k.p(i<3?'head':'neck','oct','c',i%2?hd:hair,0,y,z,.028-i*.002,.032,.026)}k.p('neck','box','c',0x6a2a1a,0,.85,-.17,.03,.016,.03);mdKit(B,k);
    mdLoft(B,[{p:[0,1.1,-.13],rx:.022,w:[['head',1]]},{p:[0,.86,-.17],rx:.016,w:[['neck',.4],['chest',.6]]}],{seg:5,col:hd})}
  if(st==0&&fem){// short + a short bob at the back
    mdLoft(B,[{p:[0,1.15,-.06],rx:.106,f:.05,b:.06,w:[['head',1]]},{p:[0,1.06,-.07],rx:.104,f:.04,b:.05,w:[['head',1]]},{p:[0,1.03,-.07],rx:.09,f:.03,b:.04,w:[['head',.8],['neck',.2]]}],{seg:9,col:hair,keep:m=>m.s<.2})}}

// =====================================================================================================
// the hero look
// =====================================================================================================
var MD_LOOK0={skin:'#d9b38c',hair:'#3a2414',hairStyle:0,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
// per-class default looks (used when the player never chose one): the classic hero of each class
function mdClassLook(cls){const L={warrior:{skin:'#b8875e',hair:'#2a1a12',hairStyle:0,face:2},paladin:{skin:'#d9b38c',hair:'#8a6a40',hairStyle:0,face:1},
  assassin:{skin:'#c8a080',hair:'#141016',hairStyle:2,face:0},ranger:{skin:'#d2aa82',hair:'#5a3418',hairStyle:1,face:0},mage:{skin:'#e1be9c',hair:'#b8b8bc',hairStyle:1,face:3}}[cls];
  return Object.assign({},MD_LOOK0,L||{})}
function mdLookN(L,cls){const D=mdClassLook(cls),o=Object.assign({},D,L||{}),hx=v=>{v=mdC(v);return typeof v=='number'&&isFinite(v)?v:null};
  const c=(v,d)=>{const x=hx(v);return x==null?mdC(d):x},i=(v,a,b,d)=>{v=Math.round(+v);return isFinite(v)?Math.max(a,Math.min(b,v)):d};
  return {skin:c(o.skin,D.skin),hair:c(o.hair,D.hair),hairStyle:i(o.hairStyle,0,5,0),face:i(o.face,0,5,0),eye:c(o.eye,D.eye),build:i(o.build,0,2,1),
    height:Math.max(.94,Math.min(1.06,isFinite(+o.height)?+o.height:1)),sex:i(o.sex,0,1,0)}}
function mdLookKey(L){return [L.skin,L.hair,L.hairStyle,L.face,L.eye,L.build,Math.round(L.height*100),L.sex].join('.')}
// the look of a hero model: preview/co-op models carry their own (h.mdLook); the player's models read heroLook()
function mdLookOf(h,cls){
  if(h&&h.mdLook)return mdLookN(h.mdLook,cls);
  if(h&&h.mpPeer)return mdLookN(null,cls);
  // the player's models: the creator's heroLook() when the hero has chosen a look; old heroes keep their class look
  let L=null;try{if(typeof hero!='undefined'&&hero&&hero.look)L=typeof heroLook=='function'?heroLook(hero):hero.look}catch(e){L=hero.look}
  return mdLookN(L,cls)}
