// ================= v190: Duskhold's decorations remodelled and moved out of the way =================
// Owner (Nov 2 2026): "update the decorations in Duskhold to be more appealing. Right now they are very low detail and don't add
// much to the vibe of the kingdom. Make sure decorations do not obstruct any shopfronts or get in the way of navigation (the
// obelisk is blocking the shop). Make sure decorations fit properly in each expansion phase."
//  * Every decoration is rebuilt from the v168 detail kit (turned profiles, bevelled stone, swept robes, tubes for limbs, roots
//    and iron work), pushed into the town kit (twKit) so it keeps Duskhold's atlas textures; its colours are then shaded smoothly
//    (no per-face speckle): darker toward the ground and on faces turned down, a soft weathering mottle (dc190Shade).
//    Dark-fantasy palette: weathered grey stone, black iron, aged brass, crimson and black cloth, bone, ember and violet light.
//  * Placement: no decoration stands on a lot, in front of any door a building could be turned to face (every turn that does not
//    face a wall or another lot), at the Trading Post, the tavern, the Steward or Cheddar's board, on the arrival spot, in the Gate
//    Avenue, or on the open ways arrival → fountain → Trading Post (checked at every stage by test/v190_deco.py). Moved: the
//    obelisk (was in the Trading Post's doorway) to the south-west of the plaza, the Hero's Statue (was on the arrival way) to the
//    south-east, the fountain torches to a ring that keeps clear of the Smith's and Curio Shop's doors, a planter off the north
//    way, the wall braziers to the gaps between the rows' door yards, the harvest piles out of the Curio Shop's side yard, and the
//    four ward set pieces (Lantern Pavilion, Elder Oak, Moonflower Gardens, Great Beacon) from the middle of the open yards (where
//    the row buildings' doors can face) to the strip along the outer wall of the yard they belong to.
//  * Wall pieces (banners, ivy) leave room where a ward set piece stands against the wall from its stage on (DC190_SET).
// Co-op: decorations are built from the shared SH.deco (relayed since v150, 3094) and only from deterministic numbers.
var DC190={v:189};
var DC190_BUDGET={'*':9000,trees:9500,oak:16000,torches:9000,total:170000};
// set pieces against the ward walls (town-local), from stage s on
var DC190_SET=[{k:'pavilion',s:1,x:17.6,z:15.8,r:2.4},{k:'oak',s:2,x:-17.4,z:22.4,r:2.2},{k:'garden',s:3,x:17.1,z:29.6,r:3.4},{k:'beacon',s:4,x:-17.4,z:37.6,r:2.0}];
function dc190WallClear(side,z,F){}
// ---------------- kit helpers (the town kit takes non-indexed geometry, no jitter for these precise shapes) ----------------
function dc190NI(g){let n=g.userData.ni189;if(!n){n=g.index?g.toNonIndexed():g.clone();['normal','uv','color'].forEach(a=>{if(n.attributes[a])n.deleteAttribute(a)});g.userData.ni189=n}return n}
function dc190P(k,t,col,geo,M,mt){k.P.push({t,col,geo:dc190NI(geo),m:M,j:0,f:.95+.1*k.R(),mt:mt===undefined?k.mt:mt,s189:1});return k}
function dc190H(a){const s=JSON.stringify(a);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+'_'+s.length}
function dc190L(k,t,col,pr,n,x,y,z,ry,s,mt){return dc190P(k,t,col,dt168Lathe(pr,n),dt168Mx(x,y,z,0,ry||0,0,s||1,s||1,s||1),mt)}
function dc190B(k,t,col,w,h,d,x,y,z,ry,mt,b,rx,rz){return dc190P(k,t,col,dt168BBox(w,h,d,b==null?Math.min(.04,Math.min(w,h,d)*.18):b,1),dt168Mx(x,y,z,rx||0,ry||0,rz||0),mt)}
function dc190Cube(k,t,col,w,h,d,x,y,z,rx,ry,rz,mt){return dc190P(k,t,col,dt168Geo('dcCube',()=>new THREE.BoxGeometry(1,1,1)),dt168Mx(x,y,z,rx||0,ry||0,rz||0,w,h,d),mt)}
// a squared beam from a to b (w across, h up); its long axis is the part's x, so wood grain follows it
function dc190Beam(k,t,col,a,b,w,h,mt){const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),X=B.clone().sub(A),L=X.length()||.001;X.normalize();
  let U=new THREE.Vector3(0,1,0);if(Math.abs(X.dot(U))>.95)U=new THREE.Vector3(1,0,0);const Z=new THREE.Vector3().crossVectors(X,U).normalize(),Y=new THREE.Vector3().crossVectors(Z,X);
  const M=new THREE.Matrix4().makeBasis(X,Y,Z);M.setPosition(A.add(B).multiplyScalar(.5));return dc190P(k,t,col,dt168BBox(L,h,w,Math.min(.025,Math.min(w,h)*.2),1),M,mt)}
// a round rod from a to b (radius r at a, r*q at b), s sides; unit geometry scaled along it
function dc190Rod(k,t,col,a,b,r,mt,s,q){s=s||10;q=q==null?1:q;const g=dt168Geo('dcRod'+s+'_'+q.toFixed(2),()=>new THREE.CylinderGeometry(q,1,1,s));
  const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),d=B.clone().sub(A),L=d.length()||.001;
  return dc190P(k,t,col,g,new THREE.Matrix4().compose(A.add(B).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),new THREE.Vector3(r,L,r)),mt)}
function dc190Tube(k,t,col,pts,rad,n,mt,tip){const key=dc190H([pts.map(p=>p.map(v=>+v.toFixed(3))),rad,n,tip||0]);return dc190P(k,t,col,dt168Geo('dcT'+key,()=>ch164Tube(pts,rad,n||8,tip?{tip}:{})),new THREE.Matrix4(),mt)}
function dc190Ext(k,t,col,key,pts,depth,M,mt,b){return dc190P(k,t,col,dt168Ext('dc'+key,pts,depth,b||0),M,mt)}
function dc190Clump(k,col,x,y,z,sx,sy,sz,sd,mt,det){return dc190P(k,'c',col,dt168Rock(200+(sd%10),det==null?1:det,.5),dt168Mx(x,y,z,0,sd*.7,0,sx,sy,sz),mt||'leaf')}
function dc190Stone(k,col,x,y,z,sx,sy,sz,sd,ry){return dc190P(k,'c',col,dt168Rock(150+(sd%12),1,.4,1),dt168Mx(x,y,z,0,ry||sd*.9,0,sx,sy,sz),'stone')}
var DC190_OCT;function dc190Oct(){return DC190_OCT||(DC190_OCT=dt168Geo('dcOct',()=>new THREE.OctahedronGeometry(1,0)))}
function dc190Ball(){return dt168Geo('dcBall',()=>new THREE.SphereGeometry(1,10,7))}
// a crescent (horns toward +x), e = radius
function dc190Cres(e){const p=[],a0=.788,b0=1.141;for(let i=0;i<=18;i++){const a=a0+i/18*(6.283-2*a0);p.push([Math.cos(a)*e,Math.sin(a)*e])}
  for(let i=0;i<=18;i++){const a=(6.283-b0)-i/18*(6.283-2*b0);p.push([e*.38+Math.cos(a)*e*.78,Math.sin(a)*e*.78])}return p}
// a hanging banner: rod at (x,y,z), cloth hanging down (swallowtail), facing local +z turned ry; em = emblem colour (crescent)
function dc190Banner(k,x,y,z,ry,col,w,h,em,wall){k.at(x,y,z,()=>{const n=Math.min(.3,h*.22);
  dc190Ext(k,'c',col,'ban'+w.toFixed(2)+'_'+h.toFixed(2),[[-w/2,0],[w/2,0],[w/2,-h],[0,-h+n],[-w/2,-h]],.025,dt168Mx(0,-.05,.02),'cloth');
  [-1,1].forEach(s=>dc190Cube(k,'c',0x7a5e2c,.035,h-.12,.03,s*(w/2-.035),-.05-(h-.12)/2,.03,0,0,0,'brass'));
  dc190Cube(k,'c',0x7a5e2c,w,.05,.03,0,-.1,.03,0,0,0,'brass');
  if(em)dc190Ext(k,em==0xcfc4a8?'c':'m',em,'cres'+(w*.2).toFixed(2),dc190Cres(w*.2),.03,dt168Mx(0,-h*.42,.035,0,0,Math.PI/2),em==0xcfc4a8?'plain':'brass');
  dc190Rod(k,'m',0x2c2c32,[-w/2-.1,-.03,.02],[w/2+.1,-.03,.02],.02,'iron',8);
  [-1,1].forEach(s=>{dc190P(k,'m',0x2c2c32,dc190Ball(),dt168Mx(s*(w/2+.12),-.03,.02,0,0,0,.04,.04,.04),'iron');if(wall)dc190Rod(k,'m',0x2c2c32,[s*(w/2+.02),-.03,.02],[s*(w/2+.02),-.03,-.07],.015,'iron',6)})},ry)}
// a gnarled tree: trunk with root flare, a few limbs, leafy clumps (deterministic from sd)
function dc190Tree(k,x,z,sd,h,sc,leaf){const R=dkRng(sd*7+3);h=h||2.6;sc=sc||1;const lx=(R()-.5)*.5,lz=(R()-.5)*.5,bark=[0x2e231a,0x33271d,0x2a2018][sd%3];
  const T=u=>[x+lx*u*u,h*u,z+lz*u*u];dc190Tube(k,'c',bark,[[x,-.08,z],T(.25),T(.5),T(.75),T(1)],[.24*sc,.19*sc,.15*sc,.12*sc,.08*sc],9,'bark');
  for(let i=0;i<4;i++){const a=i*1.571+R()*.8,c=Math.cos(a),s=Math.sin(a);dc190Tube(k,'c',bark,[[x+c*.05,.42*sc,z+s*.05],[x+c*.24*sc,.16,z+s*.24*sc],[x+c*.46*sc,-.05,z+s*.46*sc]],[.11*sc,.08*sc,.04*sc],6,'bark')}
  const L=leaf||[0x1f3326,0x24402a,0x2a4a30,0x1a2e22],ends=[];
  for(let i=0;i<4;i++){const a=i*1.571+R()*1.2,u=.55+R()*.35,b=T(u),c=Math.cos(a),s=Math.sin(a),l=(.7+R()*.4)*sc,e=[b[0]+c*l,b[1]+(.45+R()*.4)*sc,b[2]+s*l];
    dc190Tube(k,'c',bark,[b,[b[0]+c*l*.5,b[1]+(.3)*sc,b[2]+s*l*.5],e],[.07*sc,.05*sc,.03*sc],6,'bark');ends.push(e)}
  ends.push(T(1).map((v,i)=>i==1?v+.25*sc:v));
  ends.forEach((e,i)=>{const r=(i==4?.85:.62+R()*.2)*sc;dc190Clump(k,L[(i+sd)%4],e[0],e[1],e[2],r,r*.72,r,sd+i);dc190Clump(k,L[(i+sd+2)%4],e[0]+(R()-.5)*.3,e[1]-r*.3,e[2]+(R()-.5)*.3,r*.8,r*.45,r*.8,sd+i+5)})}
// a small iron lantern (bottom at y), glass colour gl
function dc190Lantern(k,x,y,z,s,gl,iron){iron=iron||0x2a2a30;dc190L(k,'m',iron,[[0,0],[.085,0],[.09,.025],[0,.03]],6,x,y,z,0,s,'iron');
  dc190L(k,'g',gl,[[0,.02],[.06,.02],[.068,.12],[.06,.2],[0,.21]],6,x,y,z,0,s);
  for(let i=0;i<3;i++){const a=i/3*6.283+.5;dc190Rod(k,'m',iron,[x+Math.cos(a)*.074*s,y+.02*s,z+Math.sin(a)*.074*s],[x+Math.cos(a)*.074*s,y+.21*s,z+Math.sin(a)*.074*s],.007*s,'iron',4)}
  dc190L(k,'m',iron,[[0,.2],[.095,.2],[.05,.27],[.018,.3],[0,.31]],6,x,y,z,0,s,'iron')}
// a candle with a flame (base at y)
function dc190Candle(k,x,y,z,h,col){col=col||0xd8ccb0;dc190L(k,'c',col,[[0,0],[.032,0],[.03,h*.7],[.028,h],[0,h+.006]],7,x,y,z,0,1,'plain');dc190L(k,'g',0xffc060,[[0,0],[.016,.012],[0,.06]],5,x,y+h+.005,z,0,1)}
// a living fire: layered flame tongues (additive, unlit) that flicker and sway; list [[x,y,z,size]] (town-local)
function dc190Fire(g,list){const geo=DC190.fg||(DC190.fg=new THREE.LatheGeometry([[0,0],[.17,.03],[.16,.13],[.1,.3],[.04,.46],[0,.54]].map(p=>new THREE.Vector2(p[0],p[1])),7)),
    M=DC190.fm||(DC190.fm=[[0xff4a10,.34],[0xff7a24,.42],[0xffb848,.55],[0xffe8a0,.7]].map(([c,o])=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false})));
  const F=list.map(([x,y,z,s],i)=>{const o=new THREE.Group();o.position.set(x,y,z);o.userData.lpsSkip=1;
    const T=[[0,0,0,1,1],[1,.02,-.01,.78,1.08],[2,0,.01,.5,1.12],[3,0,0,.26,1.0],[1,.11,.03,.42,.8],[1,-.07,.09,.4,.75],[2,-.05,-.1,.36,.85]].map(([m,dx,dz,sc,h],j)=>{const t=new THREE.Mesh(geo,M[m]);t.position.set(dx*s,0,dz*s);t.userData={b:sc*s,h,ph:j*1.9+i*.7};t.userData.lpsSkip=1;o.add(t);return t});g.add(o);return T});
  return now=>{const t=now/1000;F.forEach(T=>T.forEach(m=>{const u=m.userData,f=1+.2*Math.sin(t*(8.5+u.ph)+u.ph)+.1*Math.sin(t*21+u.ph*3);m.scale.set(u.b*(1-.06*Math.sin(t*13+u.ph)),u.b*u.h*f,u.b);m.rotation.y=t*.8+u.ph;m.rotation.z=.06*Math.sin(t*3.1+u.ph)}))}}
// smooth shading of the v190 parts (after the town kit baked them): ground and down-facing darkening, soft weathering
function dc190Shade(k,key){const gs=typeof TWBK!='undefined'&&TWBK[key];if(!gs)return;const c=new THREE.Color();
  for(const t in gs){if(t=='g')continue;const G=gs[t],P=G.attributes.position,N=G.attributes.normal,C=G.attributes.color;if(!C)continue;let off=0;
    k.P.filter(p=>p.t===t).forEach(p=>{const n=p.geo.attributes.position.count;if(p.s189){c.set(p.col);const f0=p.f;
      for(let i=off;i<off+n&&i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),ny=N?N.getY(i):0,g=Math.max(0,Math.min(1,y/1.5)),
        f=f0*(.68+.32*g*g*(3-2*g))*(.84+.16*(ny*.5+.5))*(1+(dt168Fbm(x*1.6,y*1.6,z*1.6,5)-.5)*.24);C.setXYZ(i,c.r*f,c.g*f,c.b*f)}}off+=n});
    C.needsUpdate=true}}
// the decorations' builder, as v104's with a new cache key and the shading pass
dcBuild103=function(D){const T=TOWNS[0],F=dcF104(),fr=!!(D.wall||D.spf);if(D.spf)D.sp=D.spf(F);const W=D.wall?dcWall104():null,key='DECO190|'+D.k+(W?'|w'+W.lv:'')+(fr?'|s'+F.s:'');let k=null;
  const g=new THREE.Group();g.name='deco_'+D.k;g.position.set(T.cx,T.ph,T.cy);g.userData.wl=W?W.lv:null;g.userData.fs=fr?F.s:null;
  if(D.b){if(!twHas(key)){k=twKit(1101+D.k.length*7+D.k.charCodeAt(0));D.b(k,D,W)}const s=twGroup(k,key);if(k)dc190Shade(k,key);g.add(s)}
  if(D.an){const f=D.an(g,D,W);if(f){g.userData.an={x:T.cx,z:T.cy+14,f:now=>{if(g.visible)f(now)}};TANIM.push(g.userData.an)}g.userData.psNo=1}
  scene.add(g);DC103.g[D.k]=g;
  DC103.col[D.k]=(D.col?D.col(D):[]).map(q=>q.length==3?{x:T.cx+q[0],z:T.cy+q[1],r:q[2]}:{x:T.cx+q[0],z:T.cy+q[1],hx:q[2],hz:q[3]});return g};
// ---------------- colours ----------------
var DC190C={st:0x6c6872,stD:0x4c4954,stL:0x86828c,obs:0x25232c,iron:0x2c2c32,brass:0xa8843a,crim:0x6e1c26,blk:0x24212b,bone:0xcfc4a8,wood:0x4e3a2a,woodD:0x35281d,ember:0xff8a3a,vio:0xb08aff};
// ---------------- the decorations ----------------
function dc190Def(k,o){const D=DECO103.find(q=>q.k===k);if(!D)return;if(o.sp&&!o.spf)delete D.spf;Object.assign(D,o)}
(function(){const C=DC190C,PI=Math.PI;
// ---- the plaza ----
dc190Def('obelisk',{d:'A black obelisk carved with violet runes at the south-west of the plaza, ringed by turning stones under a floating crystal.',sp:[[-8.5,4.8]],
  b(k,D){const [x0,z0]=D.sp[0];k.at(x0,0,z0,()=>{
    dc190L(k,'c',0x55525c,[[0,0],[1.25,0],[1.25,.2],[1.08,.22],[1.08,.4],[.88,.42],[.88,.6],[0,.6]],4,0,0,0,0,1,'ashlar');
    dc190L(k,'c',0x3e3c46,[[0,.6],[.7,.6],[.7,.68],[.62,.74],[.58,1.4],[.64,1.46],[.68,1.56],[0,1.56]],4,0,0,0,0,1,'ashlar');
    dc190L(k,'c',C.obs,[[0,1.56],[.46,1.56],[.33,5.45],[0,5.45]],4,0,0,0,0,1,'slate');
    dc190L(k,'m',C.brass,[[0,5.42],[.36,5.42],[.37,5.5],[.35,5.52],[0,6.05]],4,0,0,0,0,1,'brass');
    [[1.95,.447],[4.95,.347]].forEach(([y,r])=>dc190L(k,'m',0x8a6a32,[[r-.012,y-.06],[r+.035,y-.06],[r+.035,y+.06],[r-.012,y+.06],[r-.012,y-.06]],4,0,0,0,0,1,'brass'));
    // runes down every face (strokes laid on the tapering face)
    const G=[[[0,-.12,0,.12],[0,.12,.09,.04]],[[-.08,-.12,.08,.12],[-.08,.12,.08,-.12],[0,-.12,0,-.02]],[[0,-.12,0,.12],[-.09,0,.09,0],[-.09,.1,0,.02]],[[-.07,-.12,-.07,.12],[.07,-.12,.07,.12],[-.07,.02,.07,.02]]],hw=y=>.46-.13*(y-1.56)/3.89,tl=Math.atan(.13/3.89);
    for(let f=0;f<4;f++)k.at(0,0,0,()=>{[2.35,2.8,3.25,3.7,4.15,4.55].forEach((y,j)=>{G[(f*2+j)%4].forEach(([a,b,c,d])=>{const L=Math.hypot(c-a,d-b),cx=(a+c)/2,cy=(b+d)/2;
      dc190Cube(k,'g',0xa77bff,L+.026,.026,.02,cx,y+cy,hw(y+cy)+.004,-tl,0,Math.atan2(d-b,c-a),'plain')})})},f*PI/2);
    // violet lanterns on the corners of the second step
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([a,b])=>dc190Lantern(k,a*.98,.42,b*.98,1,0xc8a0ff))})},
  an(g,D){const [x0,z0]=D.sp[0],o=new THREE.Group();o.position.set(x0,0,z0);g.add(o);const M=new THREE.MeshLambertMaterial({color:0x3a3742}),B=new THREE.MeshLambertMaterial({color:0x8a6a32}),G=new THREE.MeshBasicMaterial({color:0xc8a0ff});
    const R=[[1.0,3.1,0],[.82,4.15,.9]].map(([r,y,t])=>{const m=new THREE.Group();m.position.y=y;o.add(m);const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.025,4,40),B);ring.rotation.x=PI/2;m.add(ring);
      for(let i=0;i<6;i++){const a=i/6*6.283,s=new THREE.Mesh(new THREE.BoxGeometry(.13,.2,.07),M);s.position.set(Math.cos(a)*r,0,Math.sin(a)*r);s.rotation.y=-a;m.add(s);
        const r2=new THREE.Mesh(new THREE.BoxGeometry(.05,.1,.01),G);r2.position.set(Math.cos(a)*(r+.04),0,Math.sin(a)*(r+.04));r2.rotation.y=-a+PI/2;r2.userData.lpsSkip=1;m.add(r2)}return {m,t,y}});
    const c=new THREE.Mesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:0xd8b8ff}));c.scale.set(.22,.42,.22);c.position.y=6.55;c.userData.lpsSkip=1;o.add(c);
    const sat=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(1,0),G);m.scale.set(.06,.11,.06);m.userData.lpsSkip=1;o.add(m);return m});
    return now=>{const t=now/1000;R.forEach((q,i)=>{q.m.rotation.y=t*(i?-.45:.3)+q.t;q.m.position.y=q.y+.07*Math.sin(t*1.1+i)});c.rotation.y=t*.7;c.position.y=6.55+.14*Math.sin(t*1.3);
      sat.forEach((m,i)=>{const a=t*1.2+i*2.094;m.position.set(Math.cos(a)*.45,6.5+.12*Math.sin(t*2+i),Math.sin(a)*.45)})}},
  col(D){return [[D.sp[0][0],D.sp[0][1],1.25,1.25]]}});
dc190Def('statue',{d:"A stone likeness of you in armour, resting on a greatsword, at the south-east of the plaza.",sp:[[10,5.6]],
  b(k,D){const [x0,z0]=D.sp[0],ry=Math.atan2(0-x0,7-z0),S=0x4e4c54,y0=1.46;k.at(x0,0,z0,()=>{
    dc190L(k,'c',0x55525c,[[0,0],[.9,0],[.9,.16],[.78,.18],[.78,.34],[0,.34]],4,0,0,0,0,1,'ashlar');
    dc190L(k,'c',0x66626c,[[0,.34],[.6,.34],[.6,.42],[.54,.48],[.5,1.3],[.56,1.36],[.6,1.46],[0,1.46]],4,0,0,0,0,1,'ashlar');
    dc190B(k,'m',C.brass,.56,.3,.03,0,.92,.505,0,'brass',.008);
    [-1,1].forEach(s=>dc190B(k,'c',S,.15,.12,.3,s*.13,y0+.06,.06,0,'stone',.03));
    dc190P(k,'c',S,dt168Sweep('dcStatue',[[y0+.04,.4,.34,.42,0,-.03,.07,0],[y0+.35,.36,.27,.4,0,-.04,.07,.5],[y0+.75,.29,.2,.33,0,-.03,.05,.9],[y0+1.1,.29,.19,.27,0,-.01,.03,1.2],[y0+1.36,.34,.19,.23,0,0,.015,1.3],[y0+1.52,.36,.17,.19,0,0,0,0],[y0+1.6,.12,.1,.1,0,0,0,0]],18,{bot:1,top:.02}),dt168Mx(0,0,0),'stone');
    dc190B(k,'c',0x7e7c84,.6,.07,.36,0,y0+.92,0,0,'stone',.02);   // belt
    dc190L(k,'c',S,[[0,y0+1.58],[.1,y0+1.58],[.125,y0+1.66],[.13,y0+1.78],[.115,y0+1.88],[.07,y0+1.95],[0,y0+1.97]],12,0,0,0,0,1,'stone');
    dc190B(k,'c',0x84828a,.03,.1,.26,0,y0+1.93,-.01,0,'stone',.01);dc190B(k,'c',0x3a3840,.16,.025,.03,0,y0+1.78,.115,0,'stone',.005);
    [-1,1].forEach(s=>{dc190P(k,'c',S,dt168Lathe([[0,0],[.16,0],[.17,.03],[.14,.09],[.08,.13],[0,.14]],12),dt168Mx(s*.31,y0+1.42,0,0,0,-s*.5),'stone');
      dc190Tube(k,'c',S,[[s*.31,y0+1.42,0],[s*.33,y0+1.22,.06],[s*.29,y0+1.05,.17],[s*.17,y0+.97,.3],[s*.06,y0+.93,.4]],[.075,.07,.062,.055,.05],8,'stone');
      dc190P(k,'c',S,dc190Ball(),dt168Mx(s*.05,y0+.93,.4,0,0,0,.06,.065,.07),'stone')});
    dc190Ext(k,'c',0x9a98a0,'sblade',[[0,0],[.045,.12],[.05,.76],[-.05,.76],[-.045,.12]],.025,dt168Mx(0,y0+.01,.4),'stone');
    dc190B(k,'c',S,.36,.045,.06,0,y0+.8,.4,0,'stone',.012);dc190Rod(k,'c',S,[0,y0+.8,.4],[0,y0+1.0,.4],.022,'stone',8);dc190P(k,'c',S,dc190Ball(),dt168Mx(0,y0+1.03,.4,0,0,0,.045,.045,.045),'stone');
    // moss at its feet
    for(let i=0;i<5;i++){const a=i*1.3;dc190Clump(k,0x3a5a34,Math.cos(a)*.86,.03,Math.sin(a)*.86,.18,.06,.14,i)}},ry)},
  col(D){return [[D.sp[0][0],D.sp[0][1],.95]]}});
dc190Def('gild',{b(k){dc190P(k,'m',0xb08c40,dt168Geo('dcGildRing',()=>new THREE.TorusGeometry(2.42,.06,5,56).rotateX(PI/2)),dt168Mx(0,.82,0,0,0,0,1,.75,1),'brass');
    for(let i=0;i<6;i++){const a=i/6*6.283+.26;dc190L(k,'m',0xb08c40,[[0,0],[.07,0],[.07,.03],[.04,.06],[.065,.13],[.03,.21],[.012,.33],[0,.37]],8,Math.cos(a)*2.42,.84,Math.sin(a)*2.42,0,1,'brass')}
    dc190L(k,'m',0xb08c40,[[.2,0],[.31,0],[.31,.08],[.2,.08],[.2,0]],16,0,2.95,0,0,1,'brass');
    for(let i=0;i<8;i++){const a=i/8*6.283;dc190P(k,'m',0xb08c40,dt168Lathe([[0,0],[.035,0],[0,.17]],4),dt168Mx(Math.cos(a)*.27,3.02,Math.sin(a)*.27),'brass')}
    dc190P(k,'g',0x9ad8ff,dc190Oct(),dt168Mx(0,3.42,0,0,.4,0,.2,.36,.2))}});
dc190Def('crystals',{d:'Clusters of glowing moon crystal round the fountain, clear of the ways in and out.',
  b(k){for(let i=0;i<8;i++){const a=i/8*6.283+.2,x=Math.cos(a)*3.3,z=Math.sin(a)*3.3;if(Math.abs(x)<1.6)continue;
    dc190Stone(k,0x3e3c46,x,.05,z,.26,.12,.22,i);[[0,.55,0,0],[.12,.36,.07,.35],[-.1,.42,-.06,-.3],[.03,.28,-.12,.2]].forEach(([dx,h,dz,t],j)=>
      dc190P(k,'g',[0x9a8aff,0xb08aff,0x9ad8ff][(i+j)%3],dt168Lathe([[0,0],[.12,0],[.12,.72],[0,1]],6),dt168Mx(x+dx,.02,z+dz,dz*2+t*.3,a,-dx*2+t*.4,h*.9,h,h*.9)))}}});
dc190Def('mosaic',{d:'A sun crest of brass and garnet tiles set into the paving at the south edge of the plaza.',
  b(k){const W=(r0,r1,a0,a1)=>{const p=[];for(let i=0;i<=4;i++){const a=a0+(a1-a0)*i/4;p.push([Math.cos(a)*r1,Math.sin(a)*r1])}for(let i=4;i>=0;i--){const a=a0+(a1-a0)*i/4;p.push([Math.cos(a)*r0,Math.sin(a)*r0])}return p};
    for(let i=0;i<24;i++){const a=i/24*6.283;dc190Ext(k,i%2?'m':'c',i%2?C.brass:0x5a1c26,'mw'+(i%2),W(1.0,1.45,0,6.283/24-.02),.03,dt168Mx(0,.012,9.6,-PI/2,0,a),i%2?'brass':'stone')}
    for(let i=0;i<12;i++){const a=i/12*6.283;dc190Ext(k,'m',C.brass,'mray',[[0,-.06],[.62,0],[0,.06]],.03,dt168Mx(0,.014,9.6,-PI/2,0,a),'brass')}
    dc190L(k,'c',0x3a3842,[[0,.0],[.36,0],[.36,.03],[0,.03]],16,0,0,9.6,0,1,'stone');dc190L(k,'m',C.brass,[[0,.02],[.22,.02],[.18,.04],[0,.045]],12,0,0,9.6,0,1,'brass')}});
dc190Def('torches',{d:'Tall iron-banded torches in a ring round the fountain. They flicker all night.',
  spf:F=>{const out=[],T=TOWNS[0];let s=null;try{s=chq148Spot()}catch(_){};[30,60,120,150,210,240,300,330].forEach(d=>{const a=d/180*Math.PI,x=Math.cos(a)*4.7,z=Math.sin(a)*4.7;
    if(s&&(Math.hypot(T.cx+x-s.cx,T.cy+z-s.cz)<1.9||Math.hypot(T.cx+x-s.bx,T.cy+z-s.bz)<1.9))return;out.push([+x.toFixed(2),+z.toFixed(2)])});return out},
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{dc190L(k,'c',0x55525c,[[0,0],[.17,0],[.17,.06],[.12,.1],[0,.1]],8,0,0,0,0,1,'ashlar');
    dc190Rod(k,'c',C.woodD,[0,.08,0],[0,2.2,0],.055,'wood',8,.82);[.4,1.2,1.95].forEach(y=>dc190L(k,'m',C.iron,[[.05,y-.03],[.065,y-.03],[.065,y+.03],[.05,y+.03],[.05,y-.03]],8,0,0,0,0,1,'iron'));
    dc190L(k,'m',C.iron,[[0,2.18],[.06,2.18],[.13,2.3],[.16,2.47],[.14,2.49],[.11,2.33],[0,2.28]],10,0,0,0,0,1,'iron');
    for(let i=0;i<4;i++){const a=i*1.571+.4;dc190Tube(k,'m',C.iron,[[Math.cos(a)*.15,2.46,Math.sin(a)*.15],[Math.cos(a)*.16,2.56,Math.sin(a)*.16],[Math.cos(a)*.12,2.66,Math.sin(a)*.12]],[.012,.01,.006],4,'iron')}
    dc190L(k,'g',0xff8a3a,[[0,2.32],[.12,2.36],[.1,2.45],[0,2.5]],8,0,0,0,0,1)}))},
  an(g,D){return dc190Fire(g,D.sp.map(([x,z])=>[x,2.42,z,.7]))},col(D){return D.sp.map(([x,z])=>[x,z,.17])}});
dc190Def('planter',{d:'Stone troughs of night-blooming moonflowers round the plaza.',sp:[[-17.6,-3.2],[17.4,-11.4],[-12.4,2.4],[12.4,2.4]],
  b(k,D){D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{dc190B(k,'c',0x5c5862,1.16,.06,.52,0,.03,0,0,'ashlar');dc190B(k,'c',0x6a6670,1.08,.3,.44,0,.21,0,0,'ashlar');
    dc190B(k,'c',0x77737c,1.16,.07,.52,0,.39,0,0,'ashlar');[-1,1].forEach(s=>dc190B(k,'c',0x5c5862,.36,.16,.02,s*.27,.21,.225,0,'ashlar',.01));
    dc190B(k,'c',0x2a1e14,1.0,.03,.36,0,.42,0,0,'dirt',.01);
    for(let j=0;j<4;j++){const u=-.36+j*.24,v=(j%2-.5)*.1;dc190Clump(k,[0x2a4430,0x324e36,0x24402a][(i+j)%3],u,.48,v,.16,.13,.14,i*4+j);
      [[-.05,.06],[.06,-.04]].forEach(([a,b],q)=>dc190L(k,'c',[0xe8e0f0,0x8a5ac0,0xd8d0e8,0x7a2a3a][(i+j+q)%4],[[0,0],[.02,.005],[.05,.035],[.045,.045],[0,.02]],7,u+a,.6+q*.03,v+b,j,1,'cloth'))}
    dc190P(k,'g',0xc8b8ff,dc190Ball(),dt168Mx(.06,.66,-.02,0,0,0,.022,.022,.022))},z>0?0:PI/2))},
  col(D){return D.sp.map(([x,z])=>z>0?[x,z,.6,.3]:[x,z,.3,.6])}});
dc190Def('trophy',{d:'Six carved plinths along the east wall, one caged crystal for every Sovereign of the portal zones.',
  b(k,D){const K=[0xffb040,0x6aff9a,0x9ad8ff,0xffd06a,0x9aff6a,0xff4a5a];D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{
    dc190L(k,'c',0x4e4b55,[[0,0],[.42,0],[.42,.12],[.36,.16],[.33,.8],[.38,.86],[.41,.94],[0,.94]],4,0,0,0,0,1,'ashlar');
    dc190B(k,'m',C.brass,.03,.17,.36,-.338,.5,0,0,'brass',.006);dc190B(k,'c',0x3a3842,.03,.4,.4,.338,.48,0,0,'ashlar',.01);
    dc190L(k,'m',C.iron,[[0,.94],[.17,.94],[.17,.98],[.12,1.02],[0,1.03]],8,0,0,0,0,1,'iron');
    for(let j=0;j<4;j++){const a=j/4*6.283+.785,c=Math.cos(a),s=Math.sin(a);dc190Tube(k,'m',C.iron,[[c*.1,1.0,s*.1],[c*.17,1.12,s*.17],[c*.16,1.3,s*.16],[c*.09,1.44,s*.09]],[.02,.022,.017,.007],5,'iron',.03)}
    dc190P(k,'g',K[i],dc190Oct(),dt168Mx(0,1.25,0,0,i*.7,0,.12,.24,.12))}))},col(D){return D.sp.map(([x,z])=>[x,z,.45])}});
dc190Def('shrine',{d:'A small gabled shrine of dark stone, its altar crowded with ever-burning candles, east of the fountain.',
  b(k){k.at(14.6,0,6.4,()=>{dc190B(k,'c',0x55525c,1.45,.18,1.0,0,.09,0,0,'ashlar');dc190B(k,'c',0x4a4752,1.2,.86,.72,0,.61,-.04,0,'ashlar');
    dc190B(k,'c',0x66626c,1.32,.08,.86,0,1.08,0,0,'ashlar');dc190B(k,'c',0x55525c,1.22,1.32,.18,0,1.78,-.36,0,'ashlar');
    dc190B(k,'c',0x1a1820,.5,.72,.04,0,1.8,-.26,0,'stone',.01);dc190P(k,'g',0x9a6aff,dc190Oct(),dt168Mx(0,1.82,-.2,0,0,0,.08,.16,.06));
    dc190Ext(k,'g',0x9a6aff,'cresS',dc190Cres(.12),.02,dt168Mx(0,2.05,-.235,0,0,PI/2));
    [-1,1].forEach(s=>dc190L(k,'c',0x6c6872,[[0,0],[.09,0],[.09,.05],[.065,.08],[.055,1.14],[.075,1.2],[.08,1.27],[0,1.27]],10,s*.53,1.12,.3,0,1,'stone'));
    dc190B(k,'c',0x55525c,1.36,.14,.86,0,2.46,-.03,0,'ashlar');twGable(k,0x3e3a48,1.42,.98,.42,.12,2.53);
    dc190L(k,'m',C.brass,[[0,0],[.1,0],[.13,.05],[.11,.06],[0,.03]],10,.32,1.12,-.08,0,1,'brass');
    [[-.42,.16,.2],[-.3,.1,.26],[-.18,.22,.14],[.05,.13,.24],[.18,.18,.12],[.42,.12,.22],[.3,.24,.06],[-.06,.08,.06]].forEach(([x,z,h])=>dc190Candle(k,x,1.12,z,h));
    dc190P(k,'c',C.bone,dt168SkullGeo(0),dt168Mx(-.05,1.12+.11,-.08,0,.3,0,.14,.14,.14),'plain');dc190P(k,'c',0x0a0908,dt168SkullGeo(0).userData.dark,dt168Mx(-.05,1.12+.11,-.08,0,.3,0,.14,.14,.14),'plain')},-PI/2)},
  col(){return [[14.6,6.4,.7]]}});
dc190Def('well',{d:'A stone well with a timber windlass and a shingled roof on the west side of the plaza.',
  b(k){k.at(-17.4,0,2.0,()=>{dc190L(k,'c',0x6a6670,[[.62,.84],[.62,0],[.86,0],[.86,.72],[.9,.76],[.9,.84],[.62,.84]],16,0,0,0,0,1,'ashlar');
    dc190L(k,'c',0x10181e,[[.63,.5],[0,.5]],16,0,0,0,0,1,'plain');
    [-1,1].forEach(s=>dc190Beam(k,'c',C.woodD,[s*.99,0,0],[s*.99,2.06,0],.13,.13,'wood'));
    dc190Beam(k,'c',C.wood,[-1.1,2.06,0],[1.1,2.06,0],.13,.12,'wood');
    dc190Rod(k,'c',C.wood,[-1.08,1.45,0],[1.08,1.45,0],.05,'wood',8);dc190Rod(k,'c',0x5a4230,[-.26,1.45,0],[.26,1.45,0],.13,'wood',12);
    dc190Beam(k,'c',C.woodD,[1.06,1.45,0],[1.06,1.25,.18],.04,.04,'wood');dc190Rod(k,'c',C.woodD,[1.06,1.25,.18],[1.2,1.25,.18],.025,'wood',6);
    dc190Rod(k,'c',0x8a7a5a,[0,1.33,.0],[0,.98,0],.012,'plain',5);
    dc190L(k,'c',0x5a4230,[[0,0],[.12,0],[.14,.2],[.12,.2],[.1,.03],[0,.03]],10,0,.78,0,0,1,'wood');dc190L(k,'m',C.iron,[[.125,.04],[.135,.04],[.142,.08],[.132,.08],[.125,.04]],10,0,.78,0,0,1,'iron');
    dc190Rod(k,'m',C.iron,[-.14,.98,0],[.14,.98,0],.008,'iron',4);
    twGable(k,0x4a3a2c,2.5,1.35,.55,.16,2.12)})},col(){return [[-17.4,2.0,1.0]]}});
dc190Def('carts',{d:'Laden handcarts parked by the market lanes: barrels, sacks and crates.',
  b(k,D){D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{dc190B(k,'c',0x5a4230,1.9,.07,1.0,0,.62,0,0,'board');
    [-1,1].forEach(s=>{dc190Beam(k,'c',0x6a4c34,[-.95,.76,s*.47],[.95,.76,s*.47],.05,.18,'wood');dc190Beam(k,'c',0x6a4c34,[-.95,.95,s*.47],[.95,.95,s*.47],.05,.15,'wood');
      [-.88,-.1,.7].forEach(xx=>dc190Beam(k,'c',C.woodD,[xx,.6,s*.51],[xx,1.06,s*.51],.06,.06,'wood'));
      // wheel: rim, hub, spokes, and the axle through it
      k.at(-.3,.37,s*.6,()=>{dc190P(k,'c',C.woodD,dt168Geo('dcWheel',()=>new THREE.TorusGeometry(1,.09,5,22)),dt168Mx(0,0,0,0,0,0,.36,.36,.5),'wood');dc190P(k,'m',C.iron,dt168Geo('dcTyre',()=>new THREE.TorusGeometry(1,.035,4,22)),dt168Mx(0,0,0,0,0,0,.4,.4,.9),'iron');
        dc190P(k,'c',0x4a3424,dt168Lathe([[0,-.09],[.07,-.09],[.08,0],[.07,.09],[0,.09]],10),dt168Mx(0,0,0,PI/2,0,0),'wood');for(let j=0;j<8;j++){const a=j/8*6.283;dc190Rod(k,'c',C.woodD,[Math.cos(a)*.06,Math.sin(a)*.06,0],[Math.cos(a)*.33,Math.sin(a)*.33,0],.018,'wood',5)}})});
    dc190Rod(k,'m',C.iron,[-.3,.37,-.66],[-.3,.37,.66],.03,'iron',6);dc190Beam(k,'c',0x6a4c34,[-.95,.85,-.47],[-.95,.85,.47],.05,.34,'wood');
    [-1,1].forEach(s=>{dc190Rod(k,'c',C.woodD,[.85,.6,s*.36],[1.9,.12,s*.36],.035,'wood',6);dc190Beam(k,'c',C.woodD,[1.86,0,s*.36],[1.86,.14,s*.36],.08,.08,'wood')});
    const bar=(bx,bz)=>{dc190L(k,'c',0x6a4a30,[[0,0],[.15,0],[.18,.12],[.19,.22],[.18,.32],[.15,.44],[0,.44]],12,bx,.655,bz,0,1,'wood');[.06,.38].forEach(y=>dc190L(k,'m',C.iron,[[.155,y-.02],[.18,y-.02],[.18,y+.02],[.155,y+.02],[.155,y-.02]],12,bx,.655,bz,0,1,'iron'))};
    bar(-.55,-.2);bar(-.55,.2);dc190Clump(k,0x8a7a5a,.15,.8,-.15,.26,.16,.2,i,'cloth');dc190Clump(k,0x7a6a4a,.2,.8,.2,.22,.15,.2,i+3,'cloth');
    dc190B(k,'c',0x6a4a30,.36,.3,.32,.62,.82,.05,.3,'board');dc190B(k,'c',0x5a3e28,.28,.22,.26,.6,1.08,.05,-.2,'board')},i%2?PI:0))},
  col(D){return D.sp.map(([x,z])=>[x,z,1.05,.6])}});
dc190Def('benches',{b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{dc190B(k,'c',0x77737c,1.55,.1,.46,0,.47,0,0,'ashlar',.02);
    [-1,1].forEach(s=>dc190Ext(k,'c',0x5c5862,'benchleg',[[-.2,0],[.2,0],[.16,.06],[.12,.32],[.18,.42],[-.18,.42],[-.12,.32],[-.16,.06]],.14,dt168Mx(s*.56,0,0,0,PI/2,0),'ashlar',.012))},PI/2))}});
dc190Def('pumpkins',{d:'Harvest piles of pumpkins, sheaves and baskets beside the market carts.',sp:[[14.9,-1.6],[-15.0,-1.8]],
  b(k,D){const PG=dt168Geo('dcPump',()=>{const g=new THREE.SphereGeometry(1,16,10),P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),a=Math.atan2(z,x),r=1-.1*Math.pow(Math.abs(Math.cos(a*4)),.6),tp=y>0?1-.3*Math.pow(1-Math.min(1,Math.hypot(x,z)),2):1;P.setXYZ(i,x*r,y*.7*tp,z*r)}g.computeVertexNormals();return g});
    D.sp.forEach(([x,z],i)=>k.at(x,0,z,()=>{[[0,0,.26],[.38,.12,.2],[-.3,.2,.22],[.1,-.36,.18],[-.05,.05,.17,1]].forEach(([a,b,r,up],j)=>{const y=up?.42:r*.7;dc190P(k,'c',[0xb8601e,0xa8541a,0xc87028][j%3],PG,dt168Mx(a,y,b,0,j,0,r,r,r),'plain');
      dc190Tube(k,'c',0x4a5a2a,[[a,y+r*.6,b],[a+.02,y+r*.78,b+.01],[a+.05,y+r*.85,b]],[.025,.02,.015],5,'wood')});
    dc190L(k,'c',0xb89a58,[[0,0],[.13,0],[.09,.25],[.07,.45],[.15,.72],[.1,.8],[0,.8]],9,-.5,0,-.35,0,1,'straw');dc190L(k,'c',0x6a4a2a,[[.085,.32],[.1,.32],[.1,.38],[.085,.38],[.085,.32]],9,-.5,0,-.35,0,1,'wood');
    dc190L(k,'c',0x8a6a3a,[[0,0],[.17,0],[.24,.2],[.22,.21],[.15,.03],[0,.03]],12,.45,0,.38,0,1,'straw');[[.45,.2,.38],[.5,.21,.3],[.38,.21,.42]].forEach(([a,y,b],j)=>dc190P(k,'c',[0x8a1a1a,0x6a1a1a,0x9a2a20][j],dc190Ball(),dt168Mx(a,y,b,0,0,0,.075,.07,.075),'plain'))}))},
  col(D){return D.sp.map(([x,z])=>[x,z,.6])}});
dc190Def('woodpile',{b(k,D){D.sp.forEach(([x,z],i)=>{for(let j=0;j<11;j++){const row=j<4?0:j<7?1:2,c=row==0?j:row==1?j-4:j-7,n=row==0?4:3,y=.13+row*.21,zz=z+(c-(n-1)/2)*.25+(row%2)*.0;
      dc190P(k,'c',[0x5a3a22,0x6a4a2a,0x4e3420][(i+j)%3],dt168Log(i+j),dt168Mx(x+((j*7)%3-1)*.04,y,zz,0,0,PI/2,.11,.86,.11),'bark')}
    [-1,1].forEach(s=>dc190Beam(k,'c',C.woodD,[x+.0,0,z+s*.58],[x,.82,z+s*.58],.08,.08,'wood'))})},col(D){return D.sp.map(([x,z])=>[x,z,.45,.62])}});
dc190Def('brazier',{d:'Great iron braziers burn by the south wall, between the rows.',spf:F=>[-10.5,10.5].map(x=>[x,F.SZ-1.4]),
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{dc190L(k,'c',0x55525c,[[0,0],[.42,0],[.42,.1],[.34,.15],[0,.15]],10,0,0,0,0,1,'ashlar');
    dc190L(k,'m',C.iron,[[0,.14],[.07,.14],[.045,.9],[.09,.96],[0,.98]],10,0,0,0,0,1,'iron');
    for(let i=0;i<3;i++){const a=i/3*6.283+.5,c=Math.cos(a),s=Math.sin(a);dc190Tube(k,'m',C.iron,[[c*.3,.14,s*.3],[c*.36,.4,s*.36],[c*.22,.8,s*.22],[c*.32,1.06,s*.32],[c*.42,1.14,s*.42]],[.03,.03,.026,.024,.016],6,'iron');dc190P(k,'m',C.iron,dc190Ball(),dt168Mx(c*.3,.16,s*.3,0,0,0,.05,.04,.05),'iron')}
    dc190L(k,'m',C.iron,[[0,.95],[.15,.95],[.3,1.05],[.42,1.2],[.47,1.25],[.44,1.27],[.38,1.19],[0,1.13]],14,0,0,0,0,1,'iron');
    dc190L(k,'g',0xff6a1a,[[.4,1.18],[.24,1.22],[0,1.25]],12,0,0,0,0,1);for(let i=0;i<6;i++){const a=i*1.1;dc190Stone(k,0x2a1a14,Math.cos(a)*.2,1.24,Math.sin(a)*.2,.08,.05,.07,i)}}))},
  an(g,D){return dc190Fire(g,D.sp.map(([x,z])=>[x,1.2,z,1.15]))},col(D){return D.sp.map(([x,z])=>[x,z,.45])}});
dc190Def('trees',{d:'Old gnarled trees in the south corners of the town.',spf:F=>[[-17.7,F.SZ-1.7],[-16.3,F.SZ-1.15],[-18.4,F.SZ-4.0],[17.7,F.SZ-1.7],[16.3,F.SZ-1.15],[18.4,F.SZ-4.0]].filter(([x,z])=>!DC190_SET.some(q=>F.s>=q.s&&Math.hypot(x-q.x,z-q.z)<q.r+1.6)),
  b(k,D){D.sp.forEach(([x,z],i)=>dc190Tree(k,x,z,i+1,2.1+(i%2)*.5,.95+(i%3)*.08))},col(D){return D.sp.map(([x,z])=>[x,z,.32])}});
dc190Def('gatepoles',{b(k,D){const ban=TOWNS[0].pal.ban||0x8a2a3a;D.sp.forEach(([x,z],i)=>{const s=x<0?-1:1;
    dc190L(k,'c',0x55525c,[[0,0],[.26,0],[.26,.16],[.2,.22],[.14,.34],[0,.34]],8,x,0,z,0,1,'ashlar');dc190Rod(k,'c',C.woodD,[x,.3,z],[x,5.2,z],.075,'wood',8,.8);
    [.6,2.6,4.6].forEach(y=>dc190L(k,'m',C.iron,[[.06,y-.03],[.08,y-.03],[.08,y+.03],[.06,y+.03],[.06,y-.03]],8,x,0,z,0,1,'iron'));
    dc190Ext(k,'m',C.brass,'spear',[[0,0],[.08,.12],[.05,.34],[0,.46],[-.05,.34],[-.08,.12]],.03,dt168Mx(x,5.2,z),'brass');dc190L(k,'m',C.brass,[[0,0],[.06,0],[.07,.05],[0,.07]],8,x,5.14,z,0,1,'brass');
    dc190Rod(k,'c',C.woodD,[x,4.9,z],[x,4.9,z-1.0],.035,'wood',6);dc190Banner(k,x,4.86,z-.5,s*PI/2,ban,.75,2.2,C.brass)})},
  col(D){return D.sp.map(([x,z])=>[x,z,.27])}});
dc190Def('totems',{d:'Grim totems of bone and horn line the road outside the south gate.',
  b(k,D){D.sp.forEach(([x,z],i)=>{for(let j=0;j<5;j++){const a=j*1.26+i;dc190Stone(k,0x4e4b55,x+Math.cos(a)*.3,.08,z+Math.sin(a)*.3,.17,.13,.15,i*5+j)}
    dc190Rod(k,'c',0x3a2a1c,[x,0,z],[x,2.25,z],.08,'bark',8,.75);dc190Rod(k,'c',0x3a2a1c,[x-.45,1.75,z],[x+.45,1.75,z],.04,'bark',6);
    const ry=x<0?PI/2:-PI/2;dc190P(k,'c',0x9e937a,dt168SkullGeo(1),dt168Mx(x,2.36,z,0,ry,0,.3,.3,.3),'plain');dc190P(k,'c',0x0a0908,dt168SkullGeo(1).userData.dark,dt168Mx(x,2.36,z,0,ry,0,.3,.3,.3),'plain');
    [-1,1].forEach(s=>{const q=x<0?1:-1;dc190Tube(k,'c',0x8e8270,[[x,2.47,z+s*.08],[x-q*.02,2.62,z+s*.24],[x+q*.06,2.6,z+s*.42],[x+q*.13,2.42,z+s*.5],[x+q*.13,2.24,z+s*.42],[x+q*.08,2.2,z+s*.3]],[.075,.07,.06,.048,.034,.016],7,'plain')});
    [-.38,0,.38].forEach((d,j)=>{dc190Rod(k,'c',0x2a2420,[x+d,1.74,z],[x+d,1.5-j%2*.1,z],.006,'plain',4);dc190Rod(k,'c',C.bone,[x+d,1.5-j%2*.1,z],[x+d,1.2-j%2*.1,z],.022,'plain',5,.7)});
    dc190Ext(k,'c',C.crim,'rag',[[-.07,0],[.07,0],[.05,-.5],[0,-.42],[-.05,-.55]],.015,dt168Mx(x,1.95,z+(x<0?.09:-.09),0,PI/2,0),'cloth')})}});
// ---- along and on the walls ----
dc190Def('banner',{b(k,D,W){const ban=TOWNS[0].pal.ban||0x8a2a3a,F=W.F;
    [-1,1].forEach(s=>DECO103_WALLZ.forEach((z,i)=>{if(z>F.SZ-2||!dc190WallClear(s,z,F))return;const t=W.top(s*F.WX,z);if(t==null||t<1.9)return;const y=Math.min(2.7,t-.2),h=Math.min(1.25,y-.5),f=W.faceX(s,z,y-.5);if(f==null)return;
      dc190Banner(k,f-s*.05,y,z,-s*PI/2,i%2?ban:C.blk,.62,h,i%2?C.brass:C.bone,1)}));
    [-30,-22,-15,-8,8,15,22,30].forEach((x,i)=>{if(Math.abs(x)>F.WX-3)return;const t=W.top(x,F.SZ);if(t==null||t<1.9)return;const y=Math.min(2.7,t-.2),h=Math.min(1.25,y-.5),f=W.faceZ(x,y-.5);if(f==null)return;
      dc190Banner(k,x,y,f-.05,PI,i%2?ban:C.blk,.62,h,i%2?C.brass:C.bone,1)})}});
dc190Def('ivy',{b(k,D,W){const F=W.F,L=[0x24402a,0x2e4a30,0x35602e,0x1e3626];
    const vine=(pt,n,sd,dirOut)=>{const P=[];for(let j=0;j<n;j++){const p=pt(j);if(p)P.push(p)}if(P.length<2)return;dc190Tube(k,'c',0x3a2e20,P,P.map((_,j)=>.028-j*.003),5,'bark');
      P.forEach((p,j)=>{dc190Clump(k,L[(sd+j)%4],p[0]+dirOut[0]*.05,p[1]+.05,p[2]+dirOut[2]*.05,dirOut[0]?.07:.3,.24,dirOut[2]?.07:.3,sd+j,'leaf',0);if(j%2==0)dc190Clump(k,L[(sd+j+1)%4],p[0]+dirOut[0]*.04,p[1]-.15,p[2]+dirOut[2]*.04+(dirOut[0]?.22:0),dirOut[0]?.06:.22,.17,dirOut[2]?.06:.22,sd+j+3,'leaf',0)})};
    [-1,1].forEach(s=>[-18,-11,-4,4,9,19,26,31,37,44,49].forEach((z,i)=>{if(z>F.SZ-1.5||!dc190WallClear(s,z,F))return;const t=W.top(s*F.WX,z);if(t==null)return;
      vine(j=>{const y=.05+j*.42,zz=z+.25*Math.sin(j*1.3+i);if(y>t-.35)return null;const f=W.faceX(s,zz,y);return f==null?null:[f-s*.04,y,zz]},7,i,[-s,0,0])}));
    [-27,-18,-11,-4,10,17,24,31].forEach((x,i)=>{if(Math.abs(x)>F.WX-2)return;const t=W.top(x,F.SZ);if(t==null)return;
      vine(j=>{const y=.05+j*.42,xx=x+.25*Math.sin(j*1.3+i);if(y>t-.35)return null;const f=W.faceZ(xx,y);return f==null?null:[xx,y,f-.04]},6,i+20,[0,0,-1])})}});
dc190Def('garland',{d:'Strings of paper lanterns across the Gate Avenue between the rows.',
  b(k,D){D.sp.forEach(([z])=>{[-3.3,3.3].forEach(x=>{dc190L(k,'c',0x55525c,[[0,0],[.14,0],[.14,.08],[.1,.12],[0,.12]],8,x,0,z,0,1,'ashlar');dc190Rod(k,'c',C.woodD,[x,.1,z],[x,3.65,z],.06,'wood',8,.8);dc190L(k,'m',C.iron,[[0,0],[.06,0],[.05,.06],[.02,.12],[0,.14]],8,x,3.62,z,0,1,'iron')});
    const Y=x=>3.52-.42*(1-(x/3.3)**2),P=[];for(let i=0;i<=10;i++){const x=-3.3+i*.66;P.push([x,Y(x),z])}dc190Tube(k,'c',0x2a2420,P,.012,4,'plain');
    for(let i=-3;i<=3;i++){const x=i*.92,y=Y(x),g=[0xffb050,0xd8603a,0xffc870,0xff8a3a,0xb08aff][(i+3)%5];dc190Rod(k,'c',0x2a2420,[x,y,z],[x,y-.14,z],.005,'plain',3);
      dc190L(k,'m',C.iron,[[0,0],[.05,0],[.04,.03],[0,.035]],6,x,y-.19,z,0,1,'iron');dc190L(k,'g',g,[[0,-.18],[.07,-.17],[.11,-.11],[.11,-.05],[.07,0],[0,.005]],8,x,y-.19,z,0,1);dc190L(k,'m',C.iron,[[0,-.21],[.05,-.21],[.05,-.18],[0,-.17]],6,x,y-.19,z,0,1,'iron')}})},
  col(D){return D.sp.reduce((o,[z])=>o.concat([[-3.3,z,.14],[3.3,z,.14]]),[])}});
dc190Def('bunting',{d:'Strings of crimson and black pennants across both sides of the plaza.',
  b(k){[-1,1].forEach(s=>[-12.2,8.8].forEach((z,j)=>{const x0=s*11.6,x1=s*(z>0?18.2:18.8),y=3.7;[x0,x1].forEach(x=>{dc190Rod(k,'c',C.woodD,[x,0,z],[x,3.85,z],.06,'wood',8,.8);dc190L(k,'m',C.iron,[[0,0],[.06,0],[.05,.06],[0,.12]],8,x,3.82,z,0,1,'iron')});
    const Y=t=>y-.22*Math.sin(t*PI),P=[];for(let i=0;i<=8;i++)P.push([x0+(x1-x0)*i/8,Y(i/8),z]);dc190Tube(k,'c',0x2a2420,P,.011,4,'plain');
    for(let i=0;i<9;i++){const t=(i+.5)/9,x=x0+(x1-x0)*t;dc190Ext(k,'c',[C.crim,C.blk,0xb8ac90,0x5a1820][(i+j)%4],'pen',[[-.15,0],[.15,0],[0,-.36]],.02,dt168Mx(x,Y(t)-.01,z,.08*Math.sin(i*2.1),0,0),'cloth')}}))},
  col(){const o=[];[-1,1].forEach(s=>[-12.2,8.8].forEach(z=>[11.6,z>0?18.2:18.8].forEach(x=>o.push([s*x,z,.1]))));return o}});
dc190Def('baskets',{d:'Hanging wicker baskets of trailing flowers on the lantern posts along the walls.',
  b(k){(typeof TWN100_LP!='undefined'?TWN100_LP:[]).forEach(([x,z],i)=>{if(Math.abs(x)<17)return;const s=x<0?1:-1,bx=x+s*.27;
    dc190Rod(k,'m',C.iron,[x+s*.05,1.86,z],[bx,1.86,z],.012,'iron',4);for(let j=0;j<3;j++){const a=j/3*6.283;dc190Rod(k,'m',C.iron,[bx,1.86,z],[bx+Math.cos(a)*.15,1.5,z+Math.sin(a)*.15],.004,'iron',3)}
    dc190L(k,'c',0x6a4e2e,[[0,0],[.08,0],[.17,.08],[.2,.17],[.18,.18],[.13,.06],[0,.05]],10,bx,1.33,z,0,1,'straw');
    for(let j=0;j<5;j++){const a=j*1.26+i;dc190Clump(k,[0x2a4430,0x324e36][j%2],bx+Math.cos(a)*.1,1.52,z+Math.sin(a)*.1,.1,.08,.1,i+j);dc190P(k,'c',[0xe8e0f0,0x8a5ac0,0x7a2a3a][(i+j)%3],dc190Ball(),dt168Mx(bx+Math.cos(a)*.13,1.58,z+Math.sin(a)*.13,0,0,0,.04,.03,.04),'cloth')}
    [0,2.1,4.2].forEach((a,j)=>dc190Tube(k,'c',0x2e4a30,[[bx+Math.cos(a)*.17,1.48,z+Math.sin(a)*.17],[bx+Math.cos(a)*.21,1.32,z+Math.sin(a)*.21],[bx+Math.cos(a)*.2,1.12-j*.05,z+Math.sin(a)*.2]],[.012,.01,.006],4,'leaf'))})}});
// ---- the ward set pieces, against the outer wall of their yard ----
dc190Def('pavilion',{d:'An open timber pavilion hung with glowing lanterns, against the east wall of the first ward.',spf:F=>F.s>=1?[[17.6,15.8]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{const P=[[-1.1,-1.2],[1.1,-1.2],[-1.1,1.2],[1.1,1.2]],R=0x4a2420;
    P.forEach(([a,b])=>{dc190L(k,'c',0x55525c,[[0,0],[.2,0],[.2,.14],[.15,.2],[0,.2]],4,a,0,b,0,1,'ashlar');dc190Beam(k,'c',R,[a,.18,b],[a,2.45,b],.15,.15,'wood');
      [[Math.sign(a)*-1,0],[0,Math.sign(b)*-1]].forEach(([u,v])=>dc190Tube(k,'c',R,[[a,1.95,b],[a+u*.25,2.22,b+v*.25],[a+u*.45,2.4,b+v*.45]],[.05,.045,.04],5,'wood'))});
    [-1.2,1.2].forEach(b=>dc190Beam(k,'c',R,[-1.25,2.5,b],[1.25,2.5,b],.14,.16,'wood'));[-1.1,1.1].forEach(a=>dc190Beam(k,'c',R,[a,2.62,-1.35],[a,2.62,1.35],.14,.14,'wood'));
    dc190L(k,'c',0x4a2a24,[[0,2.66],[1.62,2.66],[1.66,2.72],[.95,3.2],[.2,3.62],[0,3.66]],4,0,0,0,0,1,'shingle');dc190L(k,'m',C.brass,[[0,0],[.07,0],[.08,.1],[.03,.22],[.01,.45],[0,.5]],8,0,3.6,0,0,1,'brass');
    dc190B(k,'c',0x3e3a32,2.3,.08,2.5,0,.04,0,0,'board');dc190B(k,'c',0x55525c,.7,.5,.5,0,.29,0,0,'ashlar');dc190B(k,'c',0x66626c,.82,.06,.6,0,.57,0,0,'ashlar');
    [[-.2,.05],[.05,-.1],[.22,.12]].forEach(([a,b],i)=>dc190Candle(k,a,.6,b,.12+i*.04));dc190L(k,'m',C.brass,[[0,0],[.12,0],[.15,.06],[.12,.07],[0,.03]],10,-.08,.6,.16,0,1,'brass');
    [[-1.1,-1.2],[1.1,-1.2],[-1.1,1.2],[1.1,1.2],[0,-1.2],[0,1.2]].forEach(([a,b],i)=>{dc190Rod(k,'c',0x2a2420,[a,2.42,b],[a,2.1,b],.006,'plain',3);dc190Lantern(k,a,1.8,b,1.1,[0xffb050,0xff8a3a][i%2])})},-PI/2))},
  col(D){return D.sp.length?[[-1.1,-1.2],[1.1,-1.2],[-1.1,1.2],[1.1,1.2]].map(([a,b])=>[D.sp[0][0]+b,D.sp[0][1]-a,.2]):[]}});
dc190Def('oak',{d:'A vast, ancient oak against the west wall of the second ward, lanterns hanging from its limbs.',spf:F=>F.s>=2?[[-17.4,22.4]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{const B=0x352719,R=dkRng(77);
    dc190Tube(k,'c',B,[[0,-.1,0],[.05,.8,.02],[.12,1.6,0],[.18,2.4,-.04],[.22,2.9,0]],[.68,.55,.48,.44,.38],12,'bark');
    for(let i=0;i<7;i++){const a=i/7*6.283+.3,c=Math.cos(a),s=Math.sin(a);dc190Tube(k,'c',B,[[c*.25,.7,s*.25],[c*.62,.3,s*.62],[c*1.0,.06,s*1.0],[c*1.3,-.08,s*1.3]],[.24,.18,.11,.05],7,'bark')}
    const limbs=[[.4,2.5,1.2,3.9,.3],[1.9,2.6,.3,4.1,-.6],[1.1,2.7,-.4,4.4,-1.6],[.9,2.4,.4,4.6,1.6],[-.4,2.8,.1,5.0,-.9],[.2,2.9,.1,5.5,.2]],ends=[];
    limbs.forEach(([dx,y0,_,y1,dz],i)=>{dx*=1.35;dz*=1.35;const b=[.18,y0,0],e=[b[0]+dx,y1,dz],m=[b[0]+dx*.45,(y0+y1)/2+.15,dz*.45];dc190Tube(k,'c',B,[b,m,e],[.3,.2,.1],8,'bark');ends.push(e);
      const f=[e[0]+(R()-.3)*.8,e[1]+.4,e[2]+(R()-.5)*.8];dc190Tube(k,'c',B,[m,[(m[0]+f[0])/2,(m[1]+f[1])/2+.2,(m[2]+f[2])/2],f],[.1,.07,.04],6,'bark');ends.push(f)});
    const L=[0x1e3626,0x24402a,0x2a4a30,0x1a2e22,0x2e4e2c];ends.forEach((e,i)=>{const r=.62+R()*.32;dc190Clump(k,L[i%5],e[0],e[1]+.25,e[2],r*1.15,r*.68,r*1.15,i);for(let q=0;q<2;q++){const a=R()*6.283,d=.55+R()*.35;dc190Clump(k,L[(i+2+q)%5],e[0]+Math.cos(a)*d,e[1]-.05+R()*.3,e[2]+Math.sin(a)*d,r*.78,r*.5,r*.78,i+11+q*13)}});
    dc190Clump(k,L[1],.5,5.9,0,.95,.62,.95,30);dc190Clump(k,L[3],-.2,5.5,.6,.8,.5,.8,31);
    [[1.6,3.65,.35],[.9,3.8,-1.2],[1.4,3.7,1.1],[.3,4.05,-.7]].forEach(([a,y,b],i)=>{dc190Rod(k,'c',0x2a2420,[a,y+.45,b],[a,y+.02,b],.006,'plain',3);dc190Lantern(k,a,y-.3,b,1.2,0xffc070)});
    for(let i=0;i<6;i++){const a=i*1.05+.4;dc190Clump(k,0x3a5a34,Math.cos(a)*.75,.04,Math.sin(a)*.75,.3,.07,.22,i+40)}}))},
  col(D){return D.sp.length?[[D.sp[0][0],D.sp[0][1],.8]]:[]}});
dc190Def('garden',{d:'Raised beds of moonflowers and a stone birdbath against the east wall of the third ward.',spf:F=>F.s>=3?[[17.1,29.6]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{
    [-1,1].forEach(s=>dc190B(k,'c',0x66626c,.14,.34,5.84,s*1.0,.17,0,0,'ashlar'));[-2.85,-.95,.95,2.85].forEach(b=>dc190B(k,'c',0x66626c,1.86,.34,.14,0,.17,b,0,'ashlar'));
    [-1.9,0,1.9].forEach(b=>dc190B(k,'c',0x2a1e14,1.86,.03,1.76,0,.31,b,0,'dirt',.01));
    for(let j=0;j<6;j++)dc190Clump(k,[0x1e3626,0x24402a][j%2],.62,.55,-2.45+j*.98,.34,.42,.55,j+20);
    [-1.9,1.9].forEach((b,i)=>{for(let j=0;j<4;j++){const u=j%2?-.15:-.62,v=b+(j<2?-.42:.42),R=dkRng(i*10+j+5);dc190Clump(k,[0x24402a,0x2e4a30,0x1e3626][(i+j)%3],u,.4,v,.2,.15,.2,i*6+j);
      for(let q=0;q<3;q++){const a=q*2.1+j,px=u+Math.cos(a)*.13,pz=v+Math.sin(a)*.13,h=.55+R()*.3;dc190Rod(k,'c',0x3a5a34,[px,.32,pz],[px+.02,h,pz],.008,'leaf',3);
        dc190L(k,q==0?'g':'c',[0xe8e0f8,0xc8a0ff,0x9a6ac8][q],[[0,0],[.025,.01],[.06,.05],[.05,.06],[0,.025]],7,px+.02,h,pz,a,1,'cloth')}}});
    const bx=-.28;dc190L(k,'c',0x77737c,[[0,0],[.22,0],[.22,.06],[.12,.12],[.09,.62],[.14,.68],[0,.68]],10,bx,.3,0,0,1,'stone');
    dc190L(k,'c',0x77737c,[[0,.66],[.12,.66],[.42,.74],[.48,.8],[.46,.83],[.38,.78],[0,.76]],14,bx,.3,0,0,1,'stone');dc190L(k,'c',0x2a4a6a,[[.38,.785],[0,.785]],14,bx,.3,0,0,1,'plain');
    [[.2,.1],[-.2,-.22]].forEach(([a,b])=>{dc190P(k,'c',0x22222a,dc190Ball(),dt168Mx(bx+a,1.15,b,0,0,0,.06,.05,.08),'plain');dc190P(k,'c',0x22222a,dc190Ball(),dt168Mx(bx+a,1.21,b+.05,0,0,0,.035,.035,.035),'plain')})}))},
  col(D){return D.sp.length?[[D.sp[0][0],D.sp[0][1],1.1,2.95]]:[]}});
dc190Def('beacon',{d:'A round stone beacon tower against the west wall of the fourth ward, its great fire seen from the Portal Road.',spf:F=>F.s>=4?[[-17.4,37.6]]:[],
  b(k,D){D.sp.forEach(([x,z])=>k.at(x,0,z,()=>{dc190L(k,'c',0x6a6670,[[0,0],[1.38,0],[1.38,.3],[1.28,.42],[1.22,1.75],[1.27,1.8],[1.27,1.9],[1.21,1.95],[1.18,3.35],[1.3,3.45],[1.34,3.62],[0,3.62]],16,0,0,0,0,1,'ashlar');
    for(let i=0;i<10;i++){const a=i/10*6.283;dc190B(k,'c',0x5c5862,.4,.36,.28,Math.cos(a)*1.18,3.8,Math.sin(a)*1.18,-a+PI/2,'ashlar')}
    k.at(0,0,0,()=>{dc190Ext(k,'c',0x55525c,'bdoor0',dt168ArchPts(1.0,0,1.1,1,10),.1,dt168Mx(0,.38,1.27),'ashlar');dc190Ext(k,'c',0x14121a,'bdoor',dt168ArchPts(.82,0,1.05,1,10),.04,dt168Mx(0,.4,1.33),'stone');dc190Ext(k,'c',0x4a3424,'bdoor2',dt168ArchPts(.7,0,.98,1,10),.05,dt168Mx(0,.42,1.35),'board');
      for(let j=0;j<3;j++)dc190Cube(k,'m',C.iron,.62,.04,.02,0,.62+j*.42,1.385,0,0,0,'iron');dc190P(k,'m',C.iron,dt168Geo('dcRing',()=>new THREE.TorusGeometry(1,.2,4,10)),dt168Mx(.2,1.0,1.4,0,0,0,.05,.05,.05),'iron');
      const ban=TOWNS[0].pal.ban||0x8a2a3a;dc190Banner(k,0,3.2,1.24,0,ban,.7,1.3,C.brass,1)},PI/2);
    [0,2.1,4.2].forEach(a=>dc190Cube(k,'c',0x14121a,.06,.4,.12,Math.cos(a+.5)*1.19,2.5,Math.sin(a+.5)*1.19,0,-(a+.5),0,'stone'));
    for(let i=0;i<3;i++){const a=i/3*6.283+.4;dc190Tube(k,'m',C.iron,[[Math.cos(a)*.8,3.62,Math.sin(a)*.8],[Math.cos(a)*.6,4.0,Math.sin(a)*.6],[Math.cos(a)*.55,4.35,Math.sin(a)*.55]],[.05,.045,.04],6,'iron')}
    dc190L(k,'m',C.iron,[[0,4.3],[.4,4.3],[.7,4.45],[.82,4.7],[.78,4.72],[.65,4.52],[0,4.48]],14,0,0,0,0,1,'iron');dc190L(k,'g',0xff7a2a,[[.72,4.62],[.4,4.68],[0,4.72]],14,0,0,0,0,1);
    for(let i=0;i<5;i++)dc190Beam(k,'c',0x2a1a10,[Math.cos(i*1.26)*.5,4.66,Math.sin(i*1.26)*.5],[Math.cos(i*1.26+2.6)*.45,4.8,Math.sin(i*1.26+2.6)*.45],.1,.1,'bark')}))},
  an(g,D){return D.sp.length?dc190Fire(g,[[D.sp[0][0],4.66,D.sp[0][1],2.3]]):null},
  col(D){return D.sp.length?[[D.sp[0][0],D.sp[0][1],1.4]]:[]}});
// ---- small living things ----
{const D=DECO103.find(q=>q.k=='cats');if(D){D.sp=[[-17.4,2.78,.84],[17.5,8.0,0],[-11.8,9.8,0],[6.6,9.3,.55],[-19,-8.2,.52]];
  D.an=function(g,D){const C=[0x1e1c22,0x6a4a2a,0x5a5a60,0xb8b0a0,0x2a2018],R=D.sp.map(([x,z,y],i)=>{const r=new THREE.Group(),M=new THREE.MeshLambertMaterial({color:C[i%5]});r.position.set(x,y,z);r.rotation.y=i*1.9;
    const b=new THREE.Mesh(new THREE.LatheGeometry([[0,-.2],[.08,-.17],[.11,-.06],[.11,.06],[.08,.15],[0,.18]].map(p=>new THREE.Vector2(p[0],p[1])),8),M);b.rotation.x=PI/2;b.scale.set(1,1,.85);b.position.y=.12;r.add(b);
    const h=new THREE.Mesh(new THREE.SphereGeometry(.075,8,6),M);h.scale.set(1,.9,1.05);h.position.set(0,.22,.19);r.add(h);const m=new THREE.Mesh(new THREE.ConeGeometry(.035,.05,6),M);m.rotation.x=PI/2;m.position.set(0,-.02,.07);h.add(m);
    [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.028,.07,4),M);e.position.set(s*.045,.07,-.005);e.rotation.z=-s*.25;h.add(e);const y=new THREE.Mesh(new THREE.SphereGeometry(.012,5,4),new THREE.MeshBasicMaterial({color:0xc8d86a}));y.position.set(s*.03,.015,.065);y.userData.lpsSkip=1;h.add(y)});
    [[-1,1],[1,1]].forEach(([s])=>{const p=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),M);p.scale.set(1,.6,1.4);p.position.set(s*.06,.03,.12);r.add(p)});
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.014,.024,.34,5),M);t.geometry.translate(0,.17,0);t.position.set(0,.1,-.17);t.rotation.x=-1.15;r.add(t);g.add(r);return {h,t,o:i*2.1}});
    return now=>R.forEach(c=>{const s=now/1000+c.o;c.t.rotation.z=.6*Math.sin(s*1.6);c.h.rotation.y=.5*Math.sin(s*.3)})}}}
{const D=DECO103.find(q=>q.k=='skylant');if(D)D.an=function(g){const L=[],geo=new THREE.LatheGeometry([[0,-.21],[.12,-.2],[.18,-.08],[.19,.06],[.13,.19],[0,.21]].map(p=>new THREE.Vector2(p[0],p[1])),6),mt=new THREE.MeshBasicMaterial({color:0xffa850});
  for(let i=0;i<10;i++){const m=new THREE.Mesh(geo,mt);m.userData.lpsSkip=1;g.add(m);L.push([m,i/10,(i*29%32)-16,(i*41%60)-14])}
  return now=>{const n=typeof ATM!='undefined'?ATM.night||0:.5;L.forEach(([m,o,x,z])=>{const u=(now/60000+o)%1;m.visible=n>.3;m.position.set(x+Math.sin(u*9+o*7)*1.5,1.5+u*34,z+u*8);m.rotation.y=u*6;m.scale.setScalar(1-u*.5)})}}}
{const D=DECO103.find(q=>q.k=='ravens');if(D)D.an=function(g,D,W){const M=new THREE.MeshLambertMaterial({color:0x16141c}),B=new THREE.MeshLambertMaterial({color:0x3a3020}),
    body=new THREE.LatheGeometry([[0,-.2],[.05,-.14],[.09,-.02],[.085,.08],[.05,.14],[0,.17]].map(p=>new THREE.Vector2(p[0],p[1])),7),
    wing=(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.26,.03);s.lineTo(.3,-.05);s.lineTo(.22,-.06);s.lineTo(.24,-.11);s.lineTo(.14,-.1);s.lineTo(0,-.08);s.closePath();const g=new THREE.ShapeGeometry(s);g.rotateX(-PI/2);return g})();
  const R=D.sp.map(([x,z,s],i)=>{const r=new THREE.Group(),t=W.top(s?s*W.F.WX:x,s?z:W.F.SZ);r.position.set(s?s*W.F.WX:x,(t==null?2.5:t)+.12,s?z:W.F.SZ);r.userData.y0=r.position.y;r.rotation.y=s?-s*PI/2:PI;
    const b=new THREE.Mesh(body,M);b.rotation.x=PI/2-.3;r.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.065,7,5),M);h.position.set(0,.12,.15);r.add(h);
    const bk=new THREE.Mesh(new THREE.ConeGeometry(.022,.1,4),B);bk.rotation.x=PI/2;bk.position.set(0,-.01,.1);h.add(bk);
    const tl=new THREE.Mesh(new THREE.ConeGeometry(.05,.16,3),M);tl.rotation.x=-PI/2+.3;tl.scale.set(1,1,.3);tl.position.set(0,-.02,-.24);r.add(tl);
    const w=[-1,1].map(q=>{const m=new THREE.Mesh(wing,M);m.material.side=THREE.DoubleSide;m.position.set(q*.07,.05,.06);m.scale.set(q,1,1);m.rotation.y=-q*.15;r.add(m);return m});g.add(r);return {r,h,w,t:i*1.7}});
  return now=>R.forEach(o=>{const t=now/1000+o.t,fl=Math.max(0,Math.sin(t*.7))>.93?Math.sin(t*28):0;o.w[0].rotation.z=-.15-.9*fl;o.w[1].rotation.z=.15+.9*fl;o.h.rotation.y=.6*Math.sin(t*.45)+.2*Math.sin(t*1.9);o.r.position.y=o.r.userData.y0+.05*Math.abs(fl)})}}
})();
// the town's braziers and flames (walls, gates, the plaza's dressing), as before in size and place, now with legs, a flared bowl and a
// layered flame (replaces 1030's kdBrazier / kdFlame for every builder: they run in town kits only)
function kdFlame(k,x,y,z,s){s=s||1;const F=(c,sc,dx,dz,ry,h)=>dc190P(k,'g',c,dt168Lathe([[0,0],[.17,.03],[.16,.13],[.1,.3],[.04,.46],[0,.54]],6),dt168Mx(x+dx*s,y,z+dz*s,0,ry,0,sc*s,sc*h*s,sc*s));
  F(0xd8501a,1,0,0,.3,.95);F(0xff8a2a,.76,.02,-.01,1.1,1.05);F(0xffd060,.44,0,.01,.5,1.1);[0,2.1,4.2].forEach((a,i)=>F(0xff7a20,.4,Math.cos(a)*.11,Math.sin(a)*.11,a,.75+i*.1))}
function kdBrazier(k,x,z,y0,s){y0=y0||0;s=s||1;const I=0x2c2c32;
  for(let i=0;i<3;i++){const a=i/3*6.283+.4,c=Math.cos(a),q=Math.sin(a);dc190Tube(k,'m',I,[[x+c*.28*s,y0,z+q*.28*s],[x+c*.25*s,y0+.3*s,z+q*.25*s],[x+c*.13*s,y0+.6*s,z+q*.13*s],[x+c*.2*s,y0+.8*s,z+q*.2*s]],[.028*s,.026*s,.022*s,.018*s],5,'iron');
    dc190P(k,'m',I,dc190Ball(),dt168Mx(x+c*.28*s,y0+.015*s,z+q*.28*s,0,0,0,.042*s,.03*s,.042*s),'iron')}
  dc190L(k,'m',I,[[0,.62],[.1,.62],[.2,.7],[.29,.82],[.32,.86],[.3,.88],[.26,.82],[0,.78]],12,x,y0,z,0,s,'iron');dc190L(k,'g',0xff5a1a,[[.27,.84],[.15,.87],[0,.88]],10,x,y0,z,0,s);
  kdFlame(k,x,y0+.86*s,z,s*.9)}
try{dc103Sync()}catch(e){console.warn('v190 decorations',e)}
