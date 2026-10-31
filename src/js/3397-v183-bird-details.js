// ================= v183: the bird companions' details (Skyhawk, Stormtalon, Rocsovereign) =================
// The rest of the owner's "wings and details" pass (see 3396 for the wings). What changed on the bodies:
//  * Tails: flat boxes with loose white blocks on their ends → a fanned tail of real feathers (12-14 rectrices, the central pair
//    on top, barred, a pale tip band) with upper and under tail coverts over the rump (`bd183Tail`, a vertex-coloured mesh on tail0).
//    Stormtalon keeps its two long streamers as feathers with broadened tips.
//  * The breast "ruff" (white cones that read as teeth) and the Rocsovereign's mantle of pyramids → rows of overlapping contour
//    feathers and long pointed hackles that lie on the skin and follow it (`bd183Coat`: rows on the body loft, skinned like it).
//  * Nape and shoulders get a cape of small feathers that covers the wing root (scapulars).
//  * Eyes: flat boxes → a dark socket, a round glowing iris with a pupil, under a rounded brow shelf. A cere at the beak base.
//  * Crests: cones → feather blades (Skyhawk's swept nape crest, Rocsovereign's crown of stiff gold-tipped feathers and plumes;
//    Stormtalon's lightning plumes stay).
//  * Legs: feathered trousers of blades over the thighs (Rocsovereign: feathered down to the ankles).
// ---------------- a feather blade for kit parts: along +y (0..1), width x (±.5), thickness z ----------------
var BD183={G:{}};
function bd183G(kind){if(BD183.G[kind])return BD183.G[kind];
  const ST=kind=='contour'?[0,.25,.55,.8,1]:[0,.2,.45,.7,.88,1],P=[],I=[],ridge=kind=='soft'?.08:.35;
  const wf=t=>{let w=t<.2?.55+.45*t/.2:1;if(kind=='lance'){if(t>.35)w*=Math.max(0,1-(t-.35)/.65)}else if(kind=='soft'){if(t>.45)w*=Math.pow(Math.max(0,1-(t-.45)/.55),.7)}else{if(t>.62)w*=Math.sqrt(Math.max(0,1-Math.pow((t-.62)/.38,2)))}return w};
  ST.forEach(t=>{const w=wf(t)*.5,cam=ridge*wf(t);P.push(-w,t,-.2*cam, 0,t,1+cam, 0,t,-1+cam*.6, w,t,-.2*cam)});
  for(let i=0;i<ST.length-1;i++){const a=i*4,b=a+4;I.push(a,a+1,b, a+1,b+1,b, a+1,a+3,b+1, a+3,b+3,b+1, a,b,a+2, b,b+2,a+2, a+2,b+2,a+3, a+3,b+2,b+3)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return BD183.G[kind]=g}
// one feather part: root a, pointing dir, flat side facing nrm; len, half width w; bn = bone name or [[bone,weight],…]
function bd183F(k,bn,col,a,dir,nrm,len,w,kind,th){const V=THREE.Vector3,y=new V(...dir).normalize(),z=new V(...nrm);z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();
  const x=new V().crossVectors(y,z),m=new THREE.Matrix4().makeBasis(x.multiplyScalar(w*2),y.multiplyScalar(len),z.multiplyScalar(th||Math.max(.002,w*.12)));m.setPosition(new V(...a));
  const p={bn:Array.isArray(bn)?bn[0][0]:bn,geo:bd183G(kind||'contour'),t:'c',col,m};if(Array.isArray(bn))p.w=bn;k.P.push(p);return p}
// a point on a bird's body loft T (rows [z, y, half width, above, below, bones]) at z, t radians from the top (0 spine, PI belly),
// side s: {p, n (outward), w (skin weights like the body there)}
function bd183S(T,z,t,s){const q=dh150At(T,z),ct=Math.cos(t),st=Math.sin(t),h=ct>0?q.a:q.b,p=[s*st*q.w,q.y+ct*h,z],n=new THREE.Vector3(s*st/q.w,ct/h,0).normalize();
  let i=0;for(let j=1;j<T.length;j++)if(Math.abs(T[j][0]-z)<Math.abs(T[i][0]-z))i=j;const b=T[i][5],w=b[2]||0;
  return {p,n:[n.x,n.y,n.z],w:w>0&&b[0]!=b[1]?[[b[0],1-w],[b[1],w]]:[[b[0],1]]}}
// the body's real surface along the line through p in direction n (outermost hit of a ray coming in from outside):
// {p, n (outward), w (skin weights of the nearest corner)} or null; G = the body geometry, O = its bone names
var BD183R=null;
function bd183Hit(G,O,p,n){BD183R=BD183R||{m:new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),rc:new THREE.Raycaster()};
  const V=THREE.Vector3,m=BD183R.m;m.geometry=G;if(!G.boundingSphere)G.computeBoundingSphere();const N=new V(...n).normalize();
  BD183R.rc.set(new V(...p).addScaledVector(N,.3),N.clone().negate());const h=BD183R.rc.intersectObject(m,false)[0];if(!h)return null;
  const fn=h.face.normal.clone();if(fn.dot(N)<0)fn.negate();const SI=G.attributes.skinIndex,SW=G.attributes.skinWeight,w=[];
  [h.face.a,h.face.b,h.face.c].sort((a,b)=>new V().fromBufferAttribute(G.attributes.position,a).distanceTo(h.point)-new V().fromBufferAttribute(G.attributes.position,b).distanceTo(h.point)).slice(0,1).forEach(v=>{
    [['getX'],['getY'],['getZ'],['getW']].forEach(([g])=>{const wt=SW[g](v);if(wt>.02)w.push([O[SI[g](v)],wt])})});
  return {p:h.point.toArray(),n:fn.toArray(),w:w.length?w:[[O[0],1]]}}
// rows of overlapping feathers on the body: zs (front → back), t range [t0, t1] round the body (0 spine, PI belly), n per half
// row, pointing along (back, down) mixed by `down`, lifted `lift` off the skin; col(row, i) → colour. o.G / o.O: the body geometry
// and bone names (each feather is set on the real surface and skinned like it)
function bd183Coat(k,T,o){const V=THREE.Vector3;o.zs.forEach((z,r)=>{for(let i=0;i<o.n;i++){const u=o.n>1?i/(o.n-1):.5,t=o.t0+(o.t1-o.t0)*u+(r%2?(o.t1-o.t0)/(o.n-1||1)*.5:0);if(t>o.t1+.01)continue;
    [-1,1].forEach(s=>{if(t<.05&&s<0)return;const S0=bd183S(T,z,t,s),S=(o.G&&bd183Hit(o.G,o.O,S0.p,S0.n))||S0,n=new V(...S.n),want=new V(0,-(o.down||0),-1).normalize(),
        d=want.clone().sub(n.clone().multiplyScalar(want.dot(n))).normalize().addScaledVector(n,o.lift||.12).normalize();
      const a=new V(...S.p).addScaledVector(n,-(o.sink||.004));bd183F(k,S.w,o.col(r,i,s),a.toArray(),d.toArray(),S.n,o.len*(1+.12*Math.sin(r*3.1+i*1.7)),o.w,o.kind||'contour')})}})}
// the front of the breast (faces forward, which the round-the-body rows miss): rows at heights ys, xs across, from z0 forward
function bd183Bib(k,o){const V=THREE.Vector3;o.ys.forEach((y,r)=>o.xs.forEach((x,i)=>{const xx=x+(r%2?o.dx||0:0),S=bd183Hit(o.G,o.O,[xx,y,o.z0],[xx*1.5,0,1]);if(!S||S.n[2]<.15)return;
    const n=new V(...S.n),want=new V(0,-1,-.15).normalize(),d=want.clone().sub(n.clone().multiplyScalar(want.dot(n))).normalize().addScaledVector(n,o.lift||.12).normalize();
    bd183F(k,S.w,o.col(r,i),new V(...S.p).addScaledVector(n,-.004).toArray(),d.toArray(),S.n,o.len*(1+.1*Math.sin(r*2.3+i*1.9)),o.w,'soft')}))}
// eyes: dark socket, round glowing iris and pupil, rounded brow shelf (x side offset, y, z of the eye centre, r iris radius)
function bd183Eyes(k,s,x,y,z,r,eye,brow,yaw){k.p('head','sph','c',0x080706,s*(x-.004),y,z-.002,r*1.35,r*1.15,r*.7,0,s*yaw,0);
  k.p('head','sph2','g',eye,s*x,y,z,r,r,r*.6,0,s*yaw,0);k.p('head','sph','c',0x050404,s*(x+r*.45),y+.001,z+r*.28,r*.42,r*.42,r*.3,0,s*yaw,0);
  k.p('head','sph','c',brow,s*(x-.012),y+r*.95,z+.002,r*1.55,r*.42,r*1.25,.05,s*(yaw-.15),s*.32)}
// a static vertex-coloured feather mesh (tails): F = [{a, d, n, len, w, shape, col(t, side, top)}] in the bone's model space
function bd183Mesh(F){const pos=[],col=[],V=THREE.Vector3,tc=new THREE.Color();
  F.forEach(o=>{const ST=[0,.18,.4,.6,.78,.9,1],R=new V(...o.a),d=new V(...o.d).normalize(),n=new V(...o.n);n.sub(d.clone().multiplyScalar(n.dot(d))).normalize();const lw=new V().crossVectors(d,n).normalize(),th=Math.max(.0025,o.w*.09);
    const rows=ST.map(t=>{const wf=bw183WF(t,o.shape||'round',1),cam=.12*o.w*wf,c=R.clone().addScaledVector(d,o.len*t).addScaledVector(n,-(o.droop||.03)*o.len*t*t);
      return [c.clone().addScaledVector(lw,o.w*wf).addScaledVector(n,-cam*.3),c.clone().addScaledVector(n,th*.5+cam),c.clone().addScaledVector(n,-th*.5+cam*.8),c.clone().addScaledVector(lw,-o.w*wf).addScaledVector(n,-cam*.3)]});
    for(let i=0;i<ST.length-1;i++){const a=rows[i],b=rows[i+1],vs=[a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3]],tm=(ST[i]+ST[i+1])/2;
      [[0,1,4,0,1],[1,5,4,0,1],[1,3,5,1,1],[3,7,5,1,1],[0,6,2,0,0],[0,4,6,0,0],[2,6,3,1,0],[3,6,7,1,0]].forEach(q=>{[q[0],q[1],q[2]].forEach(j=>pos.push(vs[j].x,vs[j].y,vs[j].z));
        o.col(tm,q[3],q[4],tc);for(let j=0;j<3;j++)col.push(tc.r,tc.g,tc.b)})}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();g.computeBoundingSphere();return g}
// the tail fan: rectrices from the rump to tips on an arc (hub H, radius R, half angle A), coverts over and under the root
var BD183T={
  Skyhawk:{n:12,root:[0,.535,-.27],H:[0,.512,-.3],R:.31,A:.34,w:.046,up:[0,.565,-.21],upL:.17,un:[0,.5,-.24],unL:.14,nb:3},
  Stormtalon:{n:10,root:[0,.54,-.33],H:[0,.527,-.5],R:.33,A:.2,w:.038,up:[0,.57,-.27],upL:.17,un:[0,.505,-.3],unL:.13,nb:4,streamers:1},
  Rocsovereign:{n:14,root:[0,.555,-.34],H:[0,.537,-.48],R:.36,A:.5,w:.056,up:[0,.585,-.28],upL:.2,un:[0,.52,-.31],unL:.16,nb:3}};
function bd183Tail(sp,C){const key='T|'+sp+'|'+C;if(BD183.G[key])return BD183.G[key];const D=BD183T[sp],K=bw183Cols(sp,C),F=[],c=x=>new THREE.Color(x);
  const top=sp=='Rocsovereign'?K.cov.clone().lerp(K.fl,.35):sp=='Stormtalon'?K.cov.clone().multiplyScalar(.7):K.cov.clone().multiplyScalar(.85),bar=sp=='Rocsovereign'?K.fl.clone():K.fl.clone().multiplyScalar(.8),tipC=sp=='Stormtalon'?c(0xd8dce0):K.lin.clone();
  const rect=(t,side,tp,o)=>{if(!tp){if(t>.9)return o.copy(tipC).multiplyScalar(.9);const b=Math.floor((t-.15)*(D.nb*2+1));return o.copy(t>.15&&b%2?K.undBar:K.und)}
    if(t>.9)return o.copy(tipC);if(t>.74)return o.copy(K.tip);const b=Math.floor((t-.12)*(D.nb*2)/.62);o.copy(t>.12&&b%2?bar:top);if(side)o.multiplyScalar(.92);return o};
  for(let i=0;i<D.n;i++){const u=(i-(D.n-1)/2)/((D.n-1)/2),a=u*D.A,ctr=1-Math.abs(u);
    const r=[D.root[0]+Math.sin(a)*.03,D.root[1]+.004*ctr,D.root[2]],tp=[D.H[0]+Math.sin(a*1.06)*D.R,D.H[1]-.008*Math.abs(u)+.004*ctr,D.H[2]-Math.cos(a*1.06)*D.R];
    const d=[tp[0]-r[0],tp[1]-r[1],tp[2]-r[2]],len=Math.hypot(...d);r[1]+=.0035*ctr*(D.n/2); // the central pair on top
    F.push({a:r,d,n:[Math.sin(a)*.35,1,0],len,w:D.w,shape:'round',col:rect,droop:.02})}
  if(D.streamers)[-1,1].forEach(s=>{const r=[s*.02,.548,-.34],d=[s*.18,-.06,-1],len=.64;F.push({a:r,d,n:[s*.2,1,0],len,w:.022,shape:'lance',col:(t,sd,tp,o)=>o.copy(t>.8?tipC:t>.62?K.tip:K.fl),droop:0});
    const L2=Math.hypot(...d),e=[r[0]+d[0]/L2*len*.78,r[1]+d[1]/L2*len*.78+.002,r[2]+d[2]/L2*len*.78];F.push({a:e,d,n:[s*.2,1,0],len:.16,w:.034,shape:'round',col:(t,sd,tp,o)=>o.copy(t>.7?tipC:K.tip),droop:0})});
  // upper tail coverts (over the root), under tail coverts (pale, below)
  for(let i=0;i<7;i++){const u=(i-3)/3,a=u*D.A*.7;F.push({a:[D.up[0]+Math.sin(a)*.03,D.up[1]+.003*(1-Math.abs(u)),D.up[2]],d:[Math.sin(a)*.5,-.12,-1],n:[Math.sin(a)*.3,1,0],len:D.upL,w:D.w*.95,shape:'round',col:(t,sd,tp,o)=>tp?o.copy(K.cov).multiplyScalar(t>.75?.72:.86):o.copy(K.lin),droop:.04})}
  for(let i=0;i<5;i++){const u=(i-2)/2,a=u*D.A*.6;F.push({a:[D.un[0]+Math.sin(a)*.03,D.un[1]+.012,D.un[2]],d:[Math.sin(a)*.5,.08,-1],n:[0,-1,0],len:D.unL*.85,w:D.w*.9,shape:'round',col:(t,sd,tp,o)=>o.copy(K.lin).multiplyScalar(.92+.08*tp),droop:-.03})}
  return BD183.G[key]=bd183Mesh(F)}
function bd183TailOn(x,sp,C,mat){const p=lpPart(x.S,x.bones,'tail0',bd183Tail(sp,C),mat,0,0,0,1,1,1,0,0,0);
  // lpPart places the mesh at the given model point; the geometry is already in model space, so undo the bone offset
  const r=x.S.bones.tail0;p.position.set(-r[1],-r[2],-r[3]);x.bd183T=p;return p}

// ======================================================================== the kits ========================================================================
// shared pieces: beak with a cere, talons, coat (breast rows, nape cape), trousers
function bd183Talons(k,s,o){const f=s<0?'hl2':'hr2',fx=s*.075,g=o.g||1;
  [-1,0,1].forEach(i=>{const e=[fx+i*.05*g,.022,(.115-Math.abs(i)*.026)*g];k.L(f,'c',o.toe,[fx,.026,0],e,.018*g,.014*g,5);
    k.L(f,'c',o.claw,e,[e[0]+i*.007,.03,e[2]+.03*g],.013*g,.008*g,4).L(f,'c',o.claw,[e[0]+i*.007,.03,e[2]+.03*g],[e[0]+i*.009,.0,e[2]+.052*g],.008*g,.002,4)});
  k.L(f,'c',o.toe,[fx,.026,0],[fx,.022,-.075*g],.017*g,.013*g,5).L(f,'c',o.claw,[fx,.022,-.075*g],[fx,.03,-.1*g],.012*g,.007*g,4).L(f,'c',o.claw,[fx,.03,-.1*g],[fx,.0,-.12*g],.007*g,.002,4);
}
function bd183Trousers(k,T,s,o){const b=s<0?"hl0":"hr0",fx=s*(o.x||.075),V=THREE.Vector3;
  for(let r=0;r<o.rows;r++){const y=o.y0-r*o.dy,N=9;for(let i=0;i<N;i++){const a=i/N*Math.PI*2+r*.35,n=[Math.sin(a),0,Math.cos(a)];
      bd183F(k,b,o.col(r,i),[fx+n[0]*o.r(r),y,o.z0+n[2]*o.r(r)],[n[0]*.25,-1,n[2]*.25],n,o.len,o.w,'contour')}}}
// ---------------- Skyhawk ----------------
function bd183KitSky(k,c,C,red,G,O){
  const T=HWK_BODY,main=lpMain(C,.22),M=main.getHex(),back=dkShade(M,.55),deep=dkShade(M,.35),bel=new THREE.Color(0xd8ccb0),barC=main.clone().multiplyScalar(.5).lerp(new THREE.Color(0x3a3024),.4),
    pale=bel.clone().multiplyScalar(.9).getHex(),bar=bel.clone().multiplyScalar(.9).lerp(barC,.16).getHex(),eye=red?0xff2a2a:0xf2b21e,beak=0x2a2420,tip=0x14100e,cere=0xc89a3a,trou=bel.clone().lerp(main,.55).multiplyScalar(.85).getHex();
  [-1,1].forEach(s=>{bd183Eyes(k,s,.07,.893,.432,.019,eye,back,.62);
    bd183Talons(k,s,{toe:0x9a8448,claw:tip});
    bd183Trousers(k,T,s,{rows:3,y0:.47,dy:.045,z0:.0,r:r=>.064-r*.009,len:.09,w:.026,col:(r,i)=>(r+i)%3?trou:dkShade(trou,.8)})});
  // the hooked beak with a cere at its base and nostrils
  k.L('head','c',beak,[0,.872,.48],[0,.865,.56],.032,.018,6).L('head','c',tip,[0,.865,.56],[0,.83,.6],.018,.004,5);
  k.L('jaw','c',dkShade(beak,1.3),[0,.846,.48],[0,.845,.545],.022,.008,5);
  k.L('head','c',cere,[0,.874,.466],[0,.874,.494],.037,.034,7);[-1,1].forEach(s=>k.p('head','sph','c',0x0a0806,s*.018,.884,.5,.006,.004,.006));
  // a swept nape crest of pointed feathers
  for(let i=-2;i<=2;i++)bd183F(k,'head',Math.abs(i)%2?back:deep,[i*.022,.94-Math.abs(i)*.006,.4],[i*.12,.25,-1],[i*.1,1,.25],.13-Math.abs(i)*.018,.018,'lance');
  // the coat: barred breast rows, a dark nape cape over the wing roots
  bd183Coat(k,T,{G,O,zs:[.22,.17,.12,.07,.02,-.03,-.08],t0:1.7,t1:2.75,n:4,len:.085,w:.021,down:1.2,lift:.035,kind:'soft',col:(r,i)=>(r*2+i)%5==1?bar:pale});
  bd183Bib(k,{G,O,ys:[.74,.7,.66,.62,.58,.54],xs:[-.075,-.025,.025,.075],dx:.025,z0:.2,len:.085,w:.022,lift:.035,col:(r,i)=>(r*2+i)%5==1?bar:pale});
  bd183Coat(k,T,{G,O,zs:[.33,.29,.25,.21,.17,.13,.09],t0:0,t1:1.3,n:6,len:.065,w:.026,down:.25,lift:.08,col:(r,i)=>(r+i)%3?M:dkShade(M,.8)});
  // the rump, under the tail
  k.L('tail0','c',back,[0,.565,-.24],[0,.53,-.36],.07,.045,6)}
// ---------------- Stormtalon ----------------
function bd183KitSt(k,c,C,red,G,O){
  const T=ST150.body,K=st150Cols(C),main=K.main.getHex(),back=dkShade(main,.5),deep=dkShade(main,.3),eye=red?0xff2a2a:0xf4e46a,glow=0x9ae8ff,steel=0x2a2e34,steelD=0x14161a,claw=0x0a0a0c,scale=0x5a6070,
    pale=K.pale.getHex(),chev=K.pale.clone().lerp(K.chev,.18).getHex();
  [-1,1].forEach(s=>{bd183Eyes(k,s,.064,.895,.447,.017,eye,deep,.62);
    // the glowing lightning streak under each eye
    k.L('head','g',glow,[s*.064,.873,.452],[s*.07,.86,.42],.006,.005,3).L('head','g',glow,[s*.07,.86,.42],[s*.07,.862,.39],.005,.004,3).L('head','g',glow,[s*.07,.862,.39],[s*.072,.845,.36],.004,.002,3);
    bd183Talons(k,s,{toe:scale,claw,g:1.15});
    bd183Trousers(k,T,s,{rows:3,y0:.46,dy:.05,z0:.0,r:r=>.075-r*.009,len:.1,w:.028,col:(r,i)=>i%2?back:main})});
  // a sleek steel beak with a sharp hook, a grey cere
  k.L('head','c',steel,[0,.884,.5],[0,.874,.6],.03,.015,6).L('head','c',steelD,[0,.874,.6],[0,.838,.635],.015,.003,5);
  k.L('jaw','c',dkShade(steel,1.4),[0,.855,.5],[0,.852,.57],.02,.007,5);k.L('head','c',K.cere.getHex(),[0,.885,.486],[0,.885,.512],.033,.03,7);
  // the lightning crest: zigzag plumes swept back from the crown, glowing tips (kept from v150)
  for(let i=-3;i<=3;i++){const x=i*.016,L=1-Math.abs(i)*.17,p0=[x,.935,.425-Math.abs(i)*.012],p1=[x*1.5,.975+.03*L,.37],p2=[x*1.9,.968+.04*L,.31-.03*L],p3=[x*2.3,1.0+.07*L,.24-.07*L];
    k.L('head','c',Math.abs(i)%2?back:deep,p0,p1,.022,.016,4).L('head','c',Math.abs(i)%2?deep:back,p1,p2,.016,.011,4).L('head','g',glow,p2,p3,.011,.002,4)}
  bd183Coat(k,T,{G,O,zs:[.23,.18,.13,.08,.03,-.02,-.07],t0:1.7,t1:2.75,n:4,len:.08,w:.02,down:1.2,lift:.035,kind:'soft',col:(r,i)=>(r*2+i)%5==1?chev:pale});
  bd183Bib(k,{G,O,ys:[.76,.72,.68,.64,.6,.56,.52],xs:[-.06,-.02,.02,.06],dx:.02,z0:.2,len:.08,w:.02,lift:.035,col:(r,i)=>(r*2+i)%5==1?chev:pale});
  bd183Coat(k,T,{G,O,zs:[.35,.31,.27,.23,.19,.15,.11],t0:0,t1:1.3,n:6,len:.06,w:.024,down:.25,lift:.08,col:(r,i)=>(r+i)%3?main:dkShade(main,.8)});
  k.L('tail0','c',back,[0,.565,-.24],[0,.535,-.38],.06,.035,6)}
// ---------------- Rocsovereign ----------------
function bd183KitRs(k,c,C,red,G,O){
  const T=RS150.body,K=rs150Cols(C),main=K.main.getHex(),back=K.back.getHex(),dk=K.dk.getHex(),cream=K.cream.getHex(),eye=red?0xff2a2a:0xffb020,ivory=0xd8c088,ivoryD=0xa88a50,tip=0x241c12,gold=0xe8c060,claw=0x16120e;
  [-1,1].forEach(s=>{bd183Eyes(k,s,.09,.902,.455,.021,eye,dk,.6);
    bd183Talons(k,s,{toe:0xa88c44,claw,g:1.2});
    // legs feathered down to the ankles: rows of feathers round the thigh and shank
    bd183Trousers(k,T,s,{x:.088,rows:4,y0:.47,dy:.05,z0:.0,r:r=>.1-r*.008,len:.1,w:.032,col:(r,i)=>(r+i)%3?main:back});
    [0,1,2].forEach(r=>{const N=8;for(let i=0;i<N;i++){const a=i/N*Math.PI*2+r*.4,n=[Math.sin(a),0,Math.cos(a)],rr=.07-r*.012;
      bd183F(k,s<0?"hl1":"hr1",(r+i)%2?main:K.cream.clone().lerp(K.main,.5).getHex(),[s*.08+n[0]*rr,.3-r*.05,.018+n[2]*rr],[n[0]*.2,-1,n[2]*.2],n,.08,.026,'contour')}})});
  // the massive hooked beak: ivory-gold, a dark hooked tip; a heavy lower mandible; a cere
  k.L('head','c',ivory,[0,.9,.49],[0,.897,.6],.052,.03,6).L('head','c',ivoryD,[0,.897,.6],[0,.862,.655],.03,.013,6).L('head','c',tip,[0,.862,.655],[0,.812,.662],.013,.002,5);
  k.L('jaw','c',ivoryD,[0,.85,.5],[0,.845,.6],.036,.012,6);k.L('head','c',0xa88c44,[0,.902,.48],[0,.902,.505],.056,.052,8);
  [-1,1].forEach(s=>k.p('head','sph','c',0x0a0806,s*.028,.918,.51,.008,.005,.008));
  // the crown: a fan of stiff upright crest feathers with golden tips, long plumes swept back behind
  for(let i=-3;i<=3;i++){const x=i*.026,b=[x,.962-Math.abs(i)*.006,.4-Math.abs(i)*.012],d=[x*2.6,1,-.3],L=(i%2?.13:.19)-Math.abs(i)*.012;
    bd183F(k,'head',i%2?back:dk,b,d,[0,0,1],L,.022,'lance');const n=dh150N(d);bd183F(k,'head',gold,[b[0]+n[0]*L*.62,b[1]+n[1]*L*.62,b[2]+n[2]*L*.62+.003],d,[0,0,1],L*.36,.014,'lance')}
  [-1,0,1].forEach(i=>bd183F(k,'head',dk,[i*.03,.945,.36],[i*.3,.15,-1],[i*.2,1,.15],.12-.02*Math.abs(i),.026,'lance'));
  // the mantle: long pointed hackles lying down the neck and over the shoulders, a cream breast
  bd183Coat(k,T,{G,O,zs:[.44,.4,.36,.32,.28,.24,.2],t0:0,t1:2.3,n:8,len:.11,w:.028,down:.9,lift:.07,kind:'lance',col:(r,i)=>(r+i)%2?main:back});
  bd183Bib(k,{G,O,ys:[.78,.73,.68,.63,.58,.53,.48,.43],xs:[-.12,-.06,0,.06,.12],dx:.03,z0:.2,len:.1,w:.028,lift:.035,col:(r,i)=>(r*2+i)%5==1?K.cream.clone().lerp(K.back,.14).getHex():cream});
  bd183Coat(k,T,{G,O,zs:[.18,.12,.06,0,-.06,-.12],t0:2.0,t1:2.8,n:4,len:.1,w:.028,down:1.3,lift:.035,kind:'soft',col:(r,i)=>(r*2+i)%5==1?K.cream.clone().lerp(K.back,.16).getHex():cream});
  bd183Coat(k,T,{G,O,zs:[.15,.11,.07],t0:.1,t1:1.25,n:5,len:.085,w:.032,down:.2,lift:.07,col:(r,i)=>(r+i)%3?main:K.main.clone().multiplyScalar(.8).getHex()});
  k.L('tail0','c',back,[0,.58,-.24],[0,.555,-.38],.085,.05,6)}
// the Rocsovereign's gold was a flat lemon yellow (cartoony): a deeper, less saturated antique gold, the same for its body,
// kit and wings (every colour derived from it follows)
rs150Cols=(f=>function(C){const m=lpMain(C,.25),h={};m.getHSL(h);m.setHSL(h.h,h.s*.78,h.l*.86);
  return {main:m,back:m.clone().multiplyScalar(.55),dk:m.clone().multiplyScalar(.32).lerp(new THREE.Color(0x2a1e14),.35),
    cream:new THREE.Color(0xe0d0a8).lerp(m,.25),scale:new THREE.Color(0xb08c3c),ivory:new THREE.Color(0xd8c088)}})(rs150Cols);
// ---------------- hook them in ----------------
{const D=LPR.Skyhawk,k0=D.kit;D.kit=function(k,c,C,red){const sp=rv137('Skyhawk',c),F={Skyhawk:bd183KitSky,Stormtalon:bd183KitSt,Rocsovereign:bd183KitRs}[sp];
    if(F){let G=null;try{G=D.geo(C,c)}catch(e){}return F(k,c,C,red,G,Object.keys(SPEC.Skyhawk.bones))}return k0.apply(this,arguments)};
  const p0=D.post;D.post=function(x,c,C,mat){p0.apply(this,arguments);const sp=rv137('Skyhawk',c);if(BD183T[sp])bd183TailOn(x,sp,C,mat)}}

// ======================================================================== evolution looks ========================================================================
// The evolution feathers (crest plumes, shoulder mantles, the Rocsovereign's back cape, the Skyhawk's tail streamers) were
// tapered cones and rods; they are feather blades now (E.fth). Everything else in the v100 / v150 designs is kept as it was.
function bd183Fth(E,a,dir,nrm,len,w,t,col,o){return E.pd(bd183G(o&&o.kind||'lance'),t,col,a,dir,[w*2,len,Math.max(.003,w*.24)],nrm,o)}
// Skyhawk (the base design of 1750, with feathers)
function bd183EvoSky(E,L,P){const M=EVO100_M,hb={bn:'head'};
  // L1: a tall swept crest of long plumes, a glowing lightning stripe under each eye, two long tail streamers
  for(let i=-2;i<=2;i++){const a=[i*.024,.925,.4],b=[i*.05,.99+.012*L-Math.abs(i)*.014,.24-Math.abs(i)*.03],d=E.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),len=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
    bd183Fth(E,a,d,[i*.2,1,.4],len,.016,'c',Math.abs(i)%2?P.mainD:P.dark,hb);if(L>=3)bd183Fth(E,E.add(b,d,-.012),d,[i*.2,1,.4],.06,.008,'g',P.glow,hb)}
  [-1,1].forEach(s=>{const h=E.on([s*.5,.875,.43],[-s,0,0]);if(h){const o=E.add(h.p,h.n,.003);E.chain([o,E.add(o,[0,-.03,-.022]),E.add(o,[0,-.028,-.035]),E.add(o,[0,-.06,-.05])],.006,.003,'g',P.glow,3,{vs:1})}});
  [-1,1].forEach(s=>{const a=[s*.03,.522,-.5],b=[s*.08,.47,-.95-.05*L],d=E.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]),len=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
    bd183Fth(E,a,d,[s*.15,1,0],len,.02,'c',P.mainD,{bn:'tail3'});bd183Fth(E,E.add(a,d,len-.11),d,[s*.15,1,0],.13,.03,'c',P.dark,{bn:'tail3',kind:'contour'})});
  if(L>=2){// a feather mantle over the shoulders, bronze talon bands, a bead cord in the crest
    for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=-1.25+i/8*2.5,h=E.on([Math.sin(a)*.5,.8-k*.05,.25+Math.cos(a)*.1-k*.04],[-Math.sin(a),-.2,-.3]);
      if(h)bd183Fth(E,E.add(h.p,h.n,-.005),E.nrm([h.n[0]*.5,-.3,-1]),h.n,.1-k*.02,.024,'c',(i+k)%2?P.mainD:P.dark,{vs:1})}
    [-1,1].forEach(s=>{E.band([s*.075,.2,.0],[0,1,0],.004,.009,'m',P.trim,8);E.band([s*.075,.27,.012],[0,1,0],.004,.007,'m',P.trim,8)});
    E.L([0,.96,.3],[0,.89,.21],.003,.003,'c',P.leather,3,hb);[0,1,2].forEach(k=>E.pd('sph',k==1?'g':'c',k==1?P.glow:P.bone,[0,.94-k*.022,.27-k*.02],[0,1,0],.012,null,hb))}
  if(L>=3){// a breastplate with a storm rune, a metal-capped beak
    E.shell((x,y,z,nx,ny,nz)=>nz>.35&&y>.6&&y<.8&&z>.15,.014,'m',P.metal,{rimCol:P.trim});
    const cp=E.on([0,.7,1],[0,0,-1]);if(cp)E.rune({p:E.add(cp.p,cp.n,.016),n:cp.n},[0,1,0],.05,P.glow);
    E.L([0,.865,.555],[0,.835,.6],.02,.004,'m',P.trim,4,hb)}
  if(L>=4){// a sun crown of golden rays above the crest with a storm gem, glowing tail streamer tips
    for(let i=-3;i<=3;i++){const a=i/3*1.25;E.L([0,.95,.36],[Math.sin(a)*.13,.95+Math.cos(a)*.13,.33],.009,.002,'m',P.gold,4,hb)}
    E.pd('oct','g',P.glow,[0,.965,.37],[0,0,1],[.022,.032,.014],null,hb);
    [-1,1].forEach(s=>{const a=[s*.03,.522,-.5],b=[s*.08,.47,-.95-.05*L],d=E.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);bd183Fth(E,E.add(b,d,-.06),d,[s*.15,1,0],.09,.02,'g',P.glow,{bn:'tail3',kind:'contour'})})}
  if(L>=5){// lightning arcs crackling around the wing roots
    [-1,1].forEach(s=>{const sh=E.on([s*.5,.74,.14],[-s,-.3,0]),b=sh?E.add(sh.p,sh.n,-.004):[s*.15,.64,.14];E.chain([b,E.add(b,[s*.05,.06,-.02]),E.add(b,[s*.03,.1,-.06]),E.add(b,[s*.08,.15,-.08])],.008,.003,'g',P.glow2,3,{at:b})})}}
// the outward direction from a bird body's centre line at point a (table T)
function bd183Out(T,a){const q=dh150At(T,a[2]),n=[a[0],(a[1]-q.y)*.7,0],l=Math.hypot(n[0],n[1])||1;return [n[0]/l,n[1]/l,0]}
// swap the tapered cones of size (r1, r2) made by an evolution design for feather blades along the same lines
function bd183Swap(f,T,r1s,r2s,kind,wk,flat){return function(E){const L0=E.L;
  E.L=function(a,b,r1,r2,t,col,seg,o){if(Math.abs(r1-r1s)<1e-6&&Math.abs(r2-r2s)<1e-6){let d=E.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);const len=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
      if(flat)d=E.nrm([d[0]*flat,d[1]*flat,d[2]]);
      return bd183Fth(E,a,d,bd183Out(T,a),len,r1*wk,t,col,Object.assign({kind,vs:1},o||{}))}return L0.apply(this,arguments)};
  try{return f.apply(this,arguments)}finally{E.L=L0}}}
// Stormtalon: the v150 design with a feathered shoulder mantle (L2); Rocsovereign: with a feathered back cape (L2)
st150Evo=bd183Swap(st150Evo,ST150.body,.028,.002,'contour',.85);
rs150Evo=bd183Swap(rs150Evo,RS150.body,.034,.003,'lance',.9,.3); // the cape lies along the back (hanging down it poked out under the folded wings)
{const D=EVO100.D.Skyhawk,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Skyhawk;if(!sp||sp=='Skyhawk')return bd183EvoSky(E,L,P,c);return b0.apply(this,arguments)}}
