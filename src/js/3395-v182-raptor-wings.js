// ================= v182: raptor wings that fold and flow (owner, Oct 30 2026) =================
// Owner: "Let's now redesign the bird companions in the Sky type. They are very low poly and too stiff. They need more
// detail and fluidity." Chosen: real raptors with a dark edge, wings folded at rest, Skyhawk first.
// A wing is one skinned mesh with its own little skeleton (one draw call): shoulder → elbow → wrist bones, one bone per
// secondary and per primary feather. Built spread (the bind pose); every frame rpwPose() blends it between
//  * folded — swept back along the flank and rolled so the feathers lie down over the side, secondaries and primaries
//    turned to point back, the primary tips crossing over the tail (how a raptor stands), and
//  * spread — open with an M bend, each beat rolling from shoulder to elbow to wrist (a wave), primaries fanned.
// Standing / walking: folded, breathing, now and then settling the wings; running: half open for balance; attacking:
// spread and beating. The wing entry keeps {p (shoulder bone), s, base, amp}, so older code that nudges p still works.
var RPW={geo:{}};
// one feather in its bone's space: root at the origin, pointing −z, width w, a raised shaft, top colour → tip colour,
// dark bands across (n), a dark tip; both faces (the underside paler, as on a real raptor)
function rpwFeather(P,C,SI,b,M,len,w,top,tip,under,bands,dark,lite){
  const st=[[0,.34],[.18,.5],[.55,.5],[.82,.36],[1,0]],v=new THREE.Vector3(),c=new THREE.Color();
  const pt=(t,side)=>{let hw=0;for(let i=0;i<st.length-1;i++)if(t>=st[i][0]&&t<=st[i+1][0]){const u=(t-st[i][0])/(st[i+1][0]-st[i][0]);hw=st[i][1]+(st[i+1][1]-st[i][1])*u}
    return [side*hw*w,side?-.002*len*t:.003+.004*len*(1-t),-len*t-(side?0:0)]};
  const colAt=(t,base)=>{c.set(base).lerp(new THREE.Color(tip),Math.min(1,t*t*1.1));if(bands&&Math.floor(t*bands)%2==1)c.multiplyScalar(.78);if(dark&&t>.8)c.lerp(new THREE.Color(0x15110e),.6);return c};
  const T=lite?[0,.4,.8,1]:[0,.18,.42,.66,.82,1];
  const put=(p,col)=>{v.set(p[0],p[1],p[2]).applyMatrix4(M);P.push(v.x,v.y,v.z);C.push(col.r,col.g,col.b);SI.push(b)};
  for(let i=0;i<T.length-1;i++){const a=T[i],e=T[i+1];
    [-1,1].forEach(s=>{const A=pt(a,s),B=pt(e,s),Ca=pt(a,0),Cb=pt(e,0);
      // top face (winding depends on the side), then the same quad from below in the underside colour
      const q=[[Ca,A,B],[Ca,B,Cb]];q.forEach(t3=>{const o=s>0?[0,2,1]:[0,1,2];o.forEach(k=>put(t3[k],colAt(k==0?a:(t3[k]===A?a:e),top)))});
      if(!lite)q.forEach(t3=>{const o=s>0?[0,1,2]:[0,2,1];o.forEach(k=>{const p=t3[k].slice();p[1]-=.0015;put(p,colAt(k==0?a:(t3[k]===A?a:e),under).clone().multiplyScalar(.95))})})})}}
// a tapered 4-sided rod along +x (the wing's leading edge), both ways round
function rpwRod(P,C,SI,b,M,x0,x1,r0,r1,col){const v=new THREE.Vector3(),c=new THREE.Color(col),q=(x,r,a)=>[x,Math.sin(a)*r*.7,Math.cos(a)*r];
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,b2=(i+1)/4*Math.PI*2+Math.PI/4,s=[q(x0,r0,a),q(x1,r1,a),q(x1,r1,b2),q(x0,r0,b2)];
    [[0,1,2],[0,2,3],[0,2,1],[0,3,2]].forEach(t=>t.forEach(k=>{v.set(...s[k]).applyMatrix4(M);P.push(v.x,v.y,v.z);const sh=.85+.15*Math.cos(a);C.push(c.r*sh,c.g*sh,c.b*sh);SI.push(b)}))}}
// build a wing on bone bn at model point (px,py,pz) for side s; D = design (segment lengths, feather groups, fold, colours).
// Feather groups: [name, joint ('sh' arm / 'el' forearm / 'wr' hand), height above the bones, [[x along the segment, rest
// angle, length]…], width, colours, bands, dark tips]. Every feather has its own bone, so at rest each turns to lie back.
function rpwWing(x,bn,c,D,px,py,pz,s,mat){
  const S=x.S,r=S.bones[bn],mir=new THREE.Group();mir.position.set(s*px-r[1],py-r[2],pz-r[3]);mir.scale.x=s;x.bones[bn].add(mir);
  const B=[],mk=(par,x0,y0,z0,ry)=>{const b=new THREE.Bone();b.position.set(x0,y0,z0);b.rotation.order='YXZ';b.rotation.y=ry||0;(par||mir).add(b);B.push(b);return b};
  const sh=mk(null,0,0,0),el=mk(sh,D.arm,0,0),wr=mk(el,D.fore,0,0),J={sh,el,wr},grp={};
  D.groups.forEach(q=>{grp[q[0]]=q[3].map(f=>mk(J[q[1]],f[0],q[2],-.004,f[1]))});
  // rest matrices relative to the mirror group
  mir.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(mir.matrixWorld).invert(),Mr=B.map(b=>new THREE.Matrix4().multiplyMatrices(inv,b.matrixWorld));
  const P=[],C=[],SI=[],id=b=>B.indexOf(b),K=D.col;
  // (no bare leading-edge rods: folded they stood out from the body like a bracket; the coverts form the leading edge)
  if(D.rods){rpwRod(P,C,SI,id(sh),Mr[id(sh)],-.04,D.arm+.01,.016,.013,K.cov);rpwRod(P,C,SI,id(el),Mr[id(el)],-.01,D.fore+.01,.013,.01,K.cov);rpwRod(P,C,SI,id(wr),Mr[id(wr)],-.01,D.hand,.01,.005,K.cov)}
  D.groups.forEach(q=>grp[q[0]].forEach((b,i)=>{const k=q[5];rpwFeather(P,C,SI,id(b),Mr[id(b)],q[3][i][2],q[4],K[k],K[k+'Tip'],K.under,q[6],q[7])}));
  const key=D.key+'|'+(c.v||'');let G=RPW.geo[key];
  if(!G){G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const n=SI.length,si=new Uint16Array(n*4),sw=new Float32Array(n*4);for(let i=0;i<n;i++){si[i*4]=SI[i];sw[i*4]=1}
    G.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));G.computeVertexNormals();G.computeBoundingSphere();RPW.geo[key]=G}
  const mesh=new THREE.SkinnedMesh(G,mat);mesh.castShadow=true;mesh.frustumCulled=false;mesh.userData.rpw=1;mir.add(mesh);
  mesh.bind(new THREE.Skeleton(B,Mr.map(m=>new THREE.Matrix4().copy(m).invert())),new THREE.Matrix4());
  const rest={};D.groups.forEach(q=>rest[q[0]]=grp[q[0]].map(b=>b.rotation.y));
  const wg={p:sh,s,base:0,amp:0,art:{sh,el,wr,grp,rest,D,mir,mx0:mir.position.x,fo:D.foldOut||0,B,Mr,G}};x.wings.push(wg);
  try{rpwFit(wg,x,bn)}catch(e){console.warn('v182 wing fit',e)}return wg}
// fold the wing and measure it against the real body: move it out just enough that no folded feather is inside the body
// (a fixed offset either clipped into the flank or hovered off it, depending on the body)
function rpwFit(wg,x,bn){const A=wg.art,body=x.b&&x.b.children.find(m=>m.isSkinnedMesh&&m.skeleton);if(!body)return;const BG=body.geometry,r=x.S.bones[bn],V=THREE.Vector3;
  const pen=()=>{rpwPose(wg,0,0,0,0);A.mir.updateMatrix();A.mir.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(A.mir.matrixWorld).invert(),
      Mm=new THREE.Matrix4().makeTranslation(r[1],r[2],r[3]).multiply(A.mir.matrix),K=A.B.map((b,i)=>new THREE.Matrix4().multiplyMatrices(inv,b.matrixWorld).multiply(new THREE.Matrix4().copy(A.Mr[i]).invert()));
    const pa=A.G.attributes.position,si=A.G.attributes.skinIndex,v=new V();let mx=0,nx=1;
    // (the wing's root is meant to be inside the body: only the part more than 10 cm from the shoulder counts)
    for(let i=0;i<pa.count;i+=3){v.fromBufferAttribute(pa,i).applyMatrix4(K[si.getX(i)]);if(v.length()<.1)continue;v.applyMatrix4(Mm);const q=lk180Near(BG,[v.x,v.y,v.z]),sd=((v.x-q.p[0])*q.n[0]+(v.y-q.p[1])*q.n[1]+(v.z-q.p[2])*q.n[2]);
      if(sd<0&&q.d>mx){mx=q.d;nx=Math.max(.35,Math.abs(q.n[0]))}}return mx/nx};
  for(let it=0;it<3;it++){const d=pen();if(d<.004)break;A.fo=Math.min(.035,A.fo+d)}}
// the pose: f = 0 folded … 1 spread; amp / ph = the wing beat (it rolls out from the shoulder to the elbow and the wrist).
// Folded (a raptor at rest): the arm runs back along the top of the flank, the forearm folds forward and down so the
// wrist is the front of the folded wing, the hand runs back again; the top of the wing faces out and every feather is
// turned to lie back toward the tail, the coverts over the flight feathers, the primaries reaching over the tail.
function rpwPose(wg,f,ph,amp,breath,shuf){const A=wg.art,D=A.D,F=D.fold,L=(a,b)=>a+(b-a)*f,sm=f*f*(3-2*f);
  A.mir.position.x=A.mx0+wg.s*(1-f)*(A.fo||0);   // folded, the wing lies on the flank, not inside it
  const beat=k=>amp*Math.sin(ph-k);
  A.sh.rotation.set(L(F.rx,0),L(F.ry,D.sweep)+(shuf||0),L(F.rz,D.lift)+beat(0)+breath);
  A.el.rotation.set(0,L(F.ely,D.ely),beat(.7)*.55*sm);
  A.wr.rotation.set(beat(1.3)*.25*sm,L(F.wry,D.wry),beat(1.3)*.7*sm);
  D.groups.forEach(q=>{const fa=F[q[0]];A.grp[q[0]].forEach((b,i)=>{const n=A.grp[q[0]].length,t=n>1?i/(n-1):0;
    let rest=A.rest[q[0]][i];if(q[0]=='pri'&&amp>0)rest+=.06*Math.sin(ph-1.6)*t;
    b.rotation.y=L(fa+(q[8]||0)*t,rest);b.rotation.x=q[0]=='pri'?-beat(1.6)*.08*sm*t:0})})}
// drive every articulated wing after the normal creature animation
{const f0=rigAnim;rigAnim=function(x,now,mv,sp){const r=f0.apply(this,arguments);try{if(x.wings&&x.wings.some(w=>w.art)){
  const g=x.g,A=g&&g.atk,dt=Math.min(.1,Math.max(0,(now-(x._rpwT||now))/1000));x._rpwT=now;
  const v=mv?(sp||1):0,run=Math.min(1,Math.max(0,(v-2.2)/2));
  // now and then the bird settles its wings (a quick half lift and refold), every ~8 s at rest
  const cyc=(now/1000+(x._rpwS=x._rpwS||Math.random()*8))%8,settle=!mv&&!A&&cyc<.9?Math.sin(cyc/.9*Math.PI)*.35:0;
  // (half open is a kinked in-between of the fold and the spread, so running and settling only lift the folded wing)
  const tgt=A?1:0;x._rpwF=(x._rpwF==null?tgt:x._rpwF)+(tgt-(x._rpwF==null?tgt:x._rpwF))*Math.min(1,dt*9);
  const amp=A?.75:0;x._rpwP=(x._rpwP||0)+dt*(A?14:9);
  // settling: the folded wing shuffles along the flank (a lift swung its lower feathers off the body)
  const breath=Math.sin(now/650)*.012+run*(.06+.04*Math.sin(now/120)),shuf=settle*.3*Math.sin(now/90);
  x.wings.forEach(w=>{if(w.art)rpwPose(w,x._rpwF,x._rpwP,amp,breath,shuf)})}}catch(e){if(!x._rpwE){x._rpwE=1;console.error('v182 wings',e)}}return r}}

// ---------------- Skyhawk: a hawk ----------------
// the hawk's colours: the species colour darkened toward slate (dark fantasy, not jay-blue)
function rpwMain(C){return lpMain(C,.22).lerp(new THREE.Color(0x464c56),.56)}
function rpwSkyhawk(C){const main=rpwMain(C),dk=(k)=>main.clone().multiplyScalar(k).getHex();
  // groups: [name, joint, height, feathers [x, rest angle, length], width, colour key, bands, dark tip, fold stagger]
  return {key:'rpw|Skyhawk|'+C,rods:1,arm:.2,fore:.22,hand:.12,foldOut:.015,sweep:.18,lift:.08,ely:-.28,wry:.42,
    groups:[['ter','sh',.002,[[-.02,.06,.17],[.03,.05,.19],[.08,.02,.21],[.13,-.01,.22],[.175,-.02,.225]],.075,'sec',5,false,.12],
      ['sec','el',0,[[.02,-.02,.23],[.06,-.05,.235],[.1,-.08,.24],[.14,-.11,.24],[.18,-.14,.235],[.215,-.18,.23]],.075,'sec',5,false,.15],
      ['pri','wr',.002,[[.0,-.3,.29],[.025,-.48,.33],[.05,-.68,.36],[.075,-.88,.37],[.095,-1.08,.36],[.11,-1.27,.32],[.12,-1.45,.26]],.07,'pri',5,true,.12],
      ['cArm','sh',.006,[[-.06,-.1,.12],[-.02,-.12,.11],[.03,-.16,.12],[.08,-.2,.125],[.13,-.24,.13],[.18,-.28,.13]],.08,'cov',0,false,.1],
      ['cFore','el',.007,[[0,-.12,.11],[.045,-.16,.115],[.09,-.2,.12],[.135,-.24,.12],[.18,-.27,.115],[.22,-.3,.11]],.07,'cov',0,false,.1],
      ['cHand','wr',.007,[[0,-.3,.1],[.05,-.45,.1],[.1,-.6,.09]],.06,'cov',0,false,.08]],
    // folded: wing rolled so its top faces out, arm back, forearm forward-down, hand back; every feather turned to lie back
    fold:{rx:1.3,ry:1.58,rz:-.22,ely:-2.53,wry:2.43,ter:-1.87,cArm:-1.87,sec:.66,cFore:.76,pri:-1.77,cHand:-1.67},
    col:{edge:dk(.7),cov:dk(.62),covTip:dk(.5),sec:dk(.55),secTip:dk(.4),pri:dk(.45),priTip:dk(.28),under:new THREE.Color(0xd8ccb0).lerp(main,.18).getHex(),rods:1}}}
{const D=LPR.Skyhawk,p0=D.post;D.post=function(x,c,C,mat){const sp=typeof RV137!='undefined'&&RV137.cur?RV137.cur.Skyhawk:null;if(sp&&sp!='Skyhawk')return p0.apply(this,arguments);
  const W=rpwSkyhawk(C),m=lpMat(c.v,1,D.mat);[-1,1].forEach(s=>rpwWing(x,'chest',c,W,.12,.72,.14,s,m))}}

// ================= step 2: the Skyhawk's body — a hawk, not a block =================
// A rounder, smoother body (12-sided rings, more of them): a deep rounded breast, a dark mantle, a flat-crowned head with a
// heavy brow, deep-set amber eyes, a yellow cere and a hooked beak; over it ~150 small shingled feathers (dkKit leaves that
// take the body's own bone weights at their roots), feathered 'trousers' over yellow scaled legs, black talons; a tail
// of 12 feathers on its own bones that fans out when it attacks and sways at rest; quick raptor head tilts at rest.
var SH182={body:[[-.335,.54,.03,.025,.025,['tail0','tail0',0],'rump'],[-.28,.545,.062,.055,.055,['tail0','pelvis',.4],'rump'],
    [-.2,.555,.1,.095,.09,['pelvis','pelvis',0]],[-.11,.57,.132,.125,.14,['pelvis','spine',.4]],[-.02,.59,.14,.135,.17,['pelvis','spine',.75],'belly'],
    [.06,.615,.146,.14,.18,['spine','spine',0],'breast'],[.13,.645,.145,.135,.165,['spine','chest',.6],'breast'],[.2,.685,.13,.12,.145,['chest','chest',0],'breast'],
    [.255,.73,.125,.11,.125,['chest','neck',.5],'throat'],[.3,.78,.105,.095,.1,['neck','neck',0],'throat'],[.34,.83,.095,.088,.08,['neck','head',.7],'hd'],
    [.38,.868,.093,.088,.072,['head','head',0],'hd'],[.425,.878,.085,.078,.062,['head','head',0],'hd'],[.465,.872,.062,.056,.046,['head','head',0],'hd'],
    [.488,.867,.046,.039,.036,['head','head',0],'hd'],[.497,.865,.04,.034,.032,['head','head',0],'hd'],[.51,.862,.028,.024,.024,['head','head',0],'hd']]};
function sh182Cols(C){const main=rpwMain(C);return {main,cov:main.clone().multiplyScalar(.62),back:main.clone().multiplyScalar(.5),deep:main.clone().multiplyScalar(.34),
  bel:new THREE.Color(0xd8ccb0),bar:new THREE.Color(0xd8ccb0).lerp(main.clone().multiplyScalar(.5),.2),face:new THREE.Color(0xd8ccb0).lerp(main,.2),
  cere:new THREE.Color(0xd8a83a),leg:new THREE.Color(0xc8a040),trou:new THREE.Color(0xd8ccb0)}}
function sh182Leg(s){const H=s<0?'hl':'hr',x=s*.075;return [[x,.56,-.04,.05,['pelvis',H+'0',.4],'trou'],[x,.47,-.02,.06,['pelvis',H+'0',.7],'trou'],
  [x,.38,.0,.054,[H+'0',H+'0',0],'trou'],[x,.31,.016,.04,[H+'0',H+'1',.6],'trou'],[x,.27,.02,.024,[H+'1',H+'1',0],'leg'],[x,.12,-.015,.021,[H+'1',H+'2',.8],'leg'],[x,.04,0,.024,[H+'2',H+'2',0],'leg']]}
function sh182Geo(C){const K=sh182Cols(C),R=SH182.body;
  const paint=(o,r,s,c,i)=>{if(r.k=='cere')return o.copy(K.cere);if(r.k=='leg')return o.copy(K.leg);if(r.k=='trou'){o.copy(K.trou);if((i||0)%2)o.lerp(K.bar,.3);return}
    o.copy(K.cov);if(s>.35)o.lerp(K.back,.5);
    if(r.k=='hd'){if(s>.3)o.copy(K.deep);else if(s>-.25)o.lerp(K.back,.5);else{o.copy(K.face);if(Math.abs(c)>.4)o.lerp(K.deep,.8)}return}
    if(r.k=='throat'&&s<.1)return o.copy(K.face);
    if((r.k=='breast'||r.k=='belly')&&s<-.05)o.copy(K.bel)};
  const rings=bz150Rows(R).map((r,i)=>Object.assign(r,{i}));
  const legs=[-1,1].map(s=>({rings:sh182Leg(s).map((r,i)=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[3],ryB:r[3],b:r[4],k:r[5],i})),seg:8,ref:[0,0,1],capB:1,paint:(o,r)=>paint(o,r,0,0,r.i)}));
  return lpGeo('SH182|'+C,'Skyhawk',[{rings,seg:12,capA:1,capB:1,paint}].concat(legs),53)}
// a small leaf-shaped feather for dkKit parts: root at the origin, pointing −z, unit length and width, a raised centre
var SH182LEAF=null;
function sh182Leaf(){if(SH182LEAF)return SH182LEAF;const R0=[-.3,0,0],R1=[.3,0,0],M0=[-.5,.03,-.45],M1=[.5,.03,-.45],T=[0,0,-1],Cc=[0,.07,-.4],P=[];
  [[R0,R1,Cc],[R0,Cc,M0],[R1,M1,Cc],[M0,Cc,T],[Cc,M1,T]].forEach(t=>t.forEach(p=>P.push(...p)));
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.computeVertexNormals();return SH182LEAF=G}
function sh182Kit(k,c,C,red){const K=sh182Cols(C),R=SH182.body,V=THREE.Vector3,eye=red?0xff2a2a:0xf2a21e,beak=0x24201c,tip=0x0e0c0a,G=sh182Leaf();
  // a feather lying on the body at z, angle a (0 right flank, π/2 back, −π/2 breast): pointing back (and down on the breast),
  // root sunk 4 mm, the body's own bone weights at the root
  const rowW=z=>{let i=0;while(i<R.length-2&&z>R[i+1][0])i++;const A=R[i],B=R[i+1],t=Math.max(0,Math.min(1,(z-A[0])/(B[0]-A[0]))),q=t<.5?A[5]:B[5];return [[q[0],1-q[2]],[q[1],q[2]]]};
  const leaf=(z,a,len,w,col,down,lift)=>{const h=bz150S(R,z,a,-.004),n=new V(...h.n),d=new V(0,-(down||0),-1);d.addScaledVector(n,-d.dot(n)).normalize();
    const y=n.clone().addScaledVector(d,-(lift||0)).normalize(),x=new V().crossVectors(y,d.clone().negate()).normalize(),M=new THREE.Matrix4().makeBasis(x,y,d.clone().negate());
    M.scale(new V(w,.25,len));M.setPosition(h.p[0],h.p[1],h.p[2]);k.P.push({bn:'chest',w:rowW(z),geo:G,t:'c',col,m:M})};
  const hx=v=>v.getHex(),back=hx(K.back),deep=hx(K.deep),main=hx(K.main),bel=hx(K.bel),bar=hx(K.bar);
  // nape hackles and a short crest
  for(let i=0;i<5;i++)leaf(.33,Math.PI/2+(i-2)*.35,.08,.05,i%2?deep:back,-.05,.04);
  [-1,0,1].forEach(i=>leaf(.39,Math.PI/2+i*.3,.1,.05,deep,-.12,.06));
  // the face: deep-set amber eyes under a heavy brow shelf, a dark streak behind the eye
  [-1,1].forEach(s=>{const e=bz150S(R,.425,s>0?.5:Math.PI-.5,-.016),p=e.p;k.p('head','sph','c',0x070605,p[0],p[1],p[2],.026,.022,.02,0,s*.6,0);
    k.p('head','sph','g',eye,p[0]+e.n[0]*.009,p[1]+e.n[1]*.009,p[2],.018,.017,.012,0,s*Math.PI/2,0);k.p('head','sph','c',0x050404,p[0]+e.n[0]*.0135,p[1]+e.n[1]*.0135,p[2],.008,.009,.008,0,s*Math.PI/2,0);
    const b0=bz150S(R,.455,s>0?.95:Math.PI-.95,-.004).p,b1=bz150S(R,.39,s>0?.7:Math.PI-.7,-.002).p;k.L('head','c',deep,b0,[b1[0]+(s>0?.006:-.006),b1[1]+.012,b1[2]+.01],.024,.02,5);
    const t0=bz150S(R,.4,s>0?.15:Math.PI-.15,-.002).p,t1=bz150S(R,.33,s>0?-.05:Math.PI+.05,-.004).p;k.L('head','c',deep,t0,t1,.012,.008,4)});
  // hooked beak: the upper mandible curving over a lower one on the jaw, a yellow cere at the root
  // (v182: narrow side to side, deep at the base, sharply hooked; the lower mandible starts inside the head at the hinge,
  // a yellow gape at the corners of the mouth joins the two)
  const narrow=(sx)=>{k.P[k.P.length-1].m.premultiply(new THREE.Matrix4().makeScale(sx,1,1))};
  k.L('head','c',beak,[0,.874,.488],[0,.879,.528],.028,.024,6);narrow(.6);k.L('head','c',beak,[0,.879,.528],[0,.873,.556],.024,.018,6);narrow(.6);
  k.L('head','c',beak,[0,.873,.556],[0,.857,.578],.018,.011,6);narrow(.62);k.L('head','c',beak,[0,.857,.578],[0,.836,.586],.011,.005,5);narrow(.65);
  k.L('head','c',tip,[0,.836,.586],[0,.818,.578],.005,.001,4);narrow(.7);
  k.L('jaw','c',dkShade(beak,1.35),[0,.85,.46],[0,.846,.538],.016,.006,5);narrow(.7);
  k.L('head','c',hx(K.cere),[0,.871,.494],[0,.874,.514],.036,.03,6);narrow(.74);
  [-1,1].forEach(s=>k.L('head','c',hx(K.cere),[s*.024,.861,.465],[s*.019,.853,.512],.011,.006,4));
  // feathered trousers: shaggy tufts round the thighs; yellow scaled feet, black talons
  [-1,1].forEach(s=>{const H=s<0?'hl':'hr',x=s*.075;
    const f=H+'2',talon=(a,d)=>{const m=[a[0]+d[0]*.022,a[1]+.004,a[2]+d[2]*.022],e=[a[0]+d[0]*.04,a[1]-.016,a[2]+d[2]*.04];k.L(f,'c',tip,[a[0],a[1]+.006,a[2]],m,.008,.006,4).L(f,'c',tip,m,e,.006,.001,4)};
    [-1,0,1].forEach(i=>{const e=[x+i*.05,.016,.11-Math.abs(i)*.025],d=[i*.4,0,1];k.L(f,'c',hx(K.leg),[x,.026,.0],[x+i*.025,.02,.055-Math.abs(i)*.012],.014,.012,4).L(f,'c',hx(K.leg),[x+i*.025,.02,.055-Math.abs(i)*.012],e,.012,.009,4);talon(e,d)});
    k.L(f,'c',hx(K.leg),[x,.026,0],[x,.018,-.065],.013,.009,4);talon([x,.018,-.065],[0,0,-1])});
  lk182Seat(k.P,sh182Geo(C),{from:0,depth:.004})}
// the tail: 12 feathers on their own bones under tail0 (one skinned mesh); fans out when attacking, sways at rest
function rpwTail(x,c,C,mat){const K=sh182Cols(C),S=x.S,bn='tail0',r=S.bones[bn],root=new THREE.Group();root.position.set(0-r[1],.55-r[2],-.27-r[3]);x.bones[bn].add(root);
  const B=[],N=12;for(let i=0;i<N;i++){const t=i/(N-1)-.5,b=new THREE.Bone();b.position.set(t*.07,.004*Math.abs(t),-.004*Math.abs(t));b.rotation.order='YXZ';b.rotation.y=-t*.45;b.rotation.x=-.06;root.add(b);B.push(b)}
  root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),Mr=B.map(b=>new THREE.Matrix4().multiplyMatrices(inv,b.matrixWorld)),P=[],Cc=[],SI=[];
  B.forEach((b,i)=>{const mid=Math.abs(i-(N-1)/2)<1.1;rpwFeather(P,Cc,SI,i,Mr[i],.32-Math.abs(i-(N-1)/2)*.008,.07,(mid?K.back:K.cov).getHex(),K.deep.getHex(),K.bar.getHex(),6,true)});
  const key='rpwTail|'+C;let G=RPW.geo[key];
  if(!G){G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    const n=SI.length,si=new Uint16Array(n*4),sw=new Float32Array(n*4);for(let i=0;i<n;i++){si[i*4]=SI[i];sw[i*4]=1}
    G.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));G.computeVertexNormals();G.computeBoundingSphere();RPW.geo[key]=G}
  const mesh=new THREE.SkinnedMesh(G,mat);mesh.castShadow=true;mesh.frustumCulled=false;mesh.userData.rpw=1;root.add(mesh);
  mesh.bind(new THREE.Skeleton(B,Mr.map(m=>new THREE.Matrix4().copy(m).invert())),new THREE.Matrix4());
  (x.rpwTails=x.rpwTails||[]).push({B,rest:B.map(b=>b.rotation.y)})}
// fan: 0 closed … 1 spread wide; plus a slow sway
function rpwTailPose(T,fan,now){const n=T.B.length;T.B.forEach((b,i)=>{const t=i/(n-1)-.5;b.rotation.y=T.rest[i]-t*1.3*fan+Math.sin(now/900)*.03;b.rotation.x=-.06-.12*fan*(1-Math.abs(t)*1.5)})}
{const D=LPR.Skyhawk,g0=D.geo,k0=D.kit,p0=D.post,cur=()=>typeof RV137!='undefined'&&RV137.cur?RV137.cur.Skyhawk:null,own=()=>{const s=cur();return !s||s=='Skyhawk'};
  D.geo=function(C,c){return own()?sh182Geo(C):g0.apply(this,arguments)};
  D.kit=function(k,c,C,red){return own()?sh182Kit(k,c,C,red):k0.apply(this,arguments)};
  const p1=D.post;D.post=function(x,c,C,mat){const r=p1.apply(this,arguments);if(own()){rpwTail(x,c,C,lpMat(c.v,1,D.mat));rpwCoat(x,c,C)}return r};
  // the Spiked trait on a hawk: a ruff of raised dark hackles at the nape (feathers, not spikes)
  D.spiked=function(k,bk,c){if(!own())return false;const G=sh182Leaf(),V=THREE.Vector3,R=SH182.body;
    for(let i=0;i<7;i++){const a=Math.PI/2+(i-3)*.32,h=bz150S(R,.32,a,-.006),n=new V(...h.n),d=new V(0,.55,-1).addScaledVector(n,.25).normalize(),y=n.clone(),x=new V().crossVectors(y,d.clone().negate()).normalize();
      const M=new THREE.Matrix4().makeBasis(x,new V().crossVectors(d.clone().negate(),x),d.clone().negate());M.scale(new V(.045,.3,.11+.015*(3-Math.abs(i-3))));M.setPosition(...h.p);k.P.push({bn:'neck',geo:G,t:'c',col:0x1a1c24,m:M})}
    return true};
  // anchor points for variant traits: the Skyhawk's own, the others' (Stormtalon, Rocsovereign: 3120) as before
  const hd=Object.getOwnPropertyDescriptor(D,'head'),bk=Object.getOwnPropertyDescriptor(D,'back'),old=q=>q.get?q.get.call(D):q.value;
  Object.defineProperty(D,'head',{configurable:true,get(){return own()?['head',0,.96,.4]:old(hd)}});
  Object.defineProperty(D,'back',{configurable:true,get(){return own()?[['neck',0,.86,.3],['chest',0,.82,.2],['spine',0,.77,.08],['pelvis',0,.7,-.08]]:old(bk)}})}
// head: quick raptor tilts and glances at rest; the tail fans with the wings
{const f0=rigAnim;rigAnim=function(x,now,mv,sp){const r=f0.apply(this,arguments);try{if(x.rpwTails){const A=x.g&&x.g.atk,F=x._rpwF||0;
  x.rpwTails.forEach(T=>rpwTailPose(T,A?Math.min(1,F*1.2):F*.6,now));
  const b=x.bones;if(b&&b.head&&!A){const seg=Math.floor(now/1300+(x._rpwS||0)),rnd=q=>{const v=Math.sin(seg*12.9898+q*78.233)*43758.5453;return v-Math.floor(v)};
    const tz=(rnd(1)-.5)*.6*(rnd(2)>.45?1:0),ty=(rnd(3)-.5)*.5,k=Math.min(1,((x._rpwT2!=null?now-x._rpwT2:16)/1000)*14);x._rpwT2=now;
    x._rpwHz=(x._rpwHz||0)+(tz-(x._rpwHz||0))*k;x._rpwHy=(x._rpwHy||0)+(ty-(x._rpwHy||0))*k;const w=mv?.3:1;if(b.jaw)b.jaw.rotation.x=0;b.head.rotation.z=x._rpwHz*w;b.head.rotation.y+=x._rpwHy*w}else if(b&&b.head)b.head.rotation.z=0}}catch(e){if(!x._rpwE2){x._rpwE2=1;console.error('v182 tail/head',e)}}return r}}

// ---------------- seat kit parts on the real mesh (the root cause of 'feathers not attached') ----------------
// Kit parts are placed from ideal shapes (ellipse rings, fixed points), but the body is a faceted mesh whose flat faces
// lie inside those ideal rings, so a part 'on the surface' can hover a few mm to a cm off it. This pass measures every
// part against the real body mesh (signed distance of each of its vertices) and, when its deepest point is not at least
// `depth` inside, moves it in along the surface normal there. Parts more than o.max (3 cm) away are left alone (they hang
// on purpose); o.from = first part index to treat. Shared: any rig can call it at the end of its kit.
function lk182Seat(P,G,o){o=o||{};const dep=o.depth==null?.004:o.depth,mx=o.max==null?.03:o.max,v=new THREE.Vector3(),V=THREE.Vector3;
  for(let i=o.from||0;i<P.length;i++){const p=P[i];if(p.free||p.t=='g'&&o.glow===false)continue;const pa=p.geo.attributes.position,n=pa.count,st=Math.max(1,Math.floor(n/24));
    let best=1e9,bn=null;for(let j=0;j<n;j+=st){v.fromBufferAttribute(pa,j).applyMatrix4(p.m);const q=lk180Near(G,[v.x,v.y,v.z]),sd=((v.x-q.p[0])*q.n[0]+(v.y-q.p[1])*q.n[1]+(v.z-q.p[2])*q.n[2])>0?q.d:-q.d;
      if(sd<best){best=sd;bn=q.n}}
    if(bn&&best>-dep&&best<mx){const d=best+dep;p.m=new THREE.Matrix4().makeTranslation(-bn[0]*d,-bn[1]*d,-bn[2]*d).multiply(p.m)}}}
// ---------------- the body coat: contour feathers like the wing coverts, bending with the body ----------------
// ~150 feathers (the wing-feather shape, lighter) laid on the real body surface: rows over the back, flanks, breast, neck and
// crown, each pointing back (down and back on the breast), its root 3 mm in, skinned with the body vertex nearest its root,
// so body and wings read as one plumage (and the flat-shaded body under it no longer shows as smooth bands).
function rpwCoat(x,c,C){const body=x.b&&x.b.children.find(m=>m.isSkinnedMesh&&m.skeleton);if(!body)return;
  const G=body.geometry,pos=G.attributes.position,SIa=G.attributes.skinIndex,SWa=G.attributes.skinWeight,K=sh182Cols(C),W=rpwSkyhawk(C).col,R=SH182.body,V=THREE.Vector3;
  const P=[],Cc=[],SI=[],SK=[],SW=[],near=(p)=>{let b=1e9,k=0;for(let i=0;i<pos.count;i++){const d=(pos.getX(i)-p[0])**2+(pos.getY(i)-p[1])**2+(pos.getZ(i)-p[2])**2;if(d<b){b=d;k=i}}return k};
  const feather=(z,a,len,w,top,tip,under,down,lite)=>{const h0=bz150S(R,z,a,0),h=lk180Near(G,h0.p);if(h.d>.05)return;const n=new V(...h.n),d=new V(0,-(down||0),-1);d.addScaledVector(n,-d.dot(n)).normalize();
    const y=n,xx=new V().crossVectors(y,d.clone().negate()).normalize(),M=new THREE.Matrix4().makeBasis(xx,new V().crossVectors(d.clone().negate(),xx),d.clone().negate());
    M.setPosition(h.p[0],h.p[1],h.p[2]);const n0=SI.length;rpwFeather(P,Cc,SI,0,M,len,w,top,tip,under,0,false,lite);
    // conform: each vertex onto the body surface, lifted a sliver (more for feathers further forward, which overlap the
    // ones behind) — the feathers show as shapes and colours on a smooth body, not as plates standing off it (lumpy)
    const lay=.002+Math.max(0,z+.4)*.014;for(let i=n0;i<SI.length;i++){const q=lk180Near(G,[P[i*3],P[i*3+1],P[i*3+2]]);P[i*3]=q.p[0]+q.n[0]*lay;P[i*3+1]=q.p[1]+q.n[1]*lay;P[i*3+2]=q.p[2]+q.n[2]*lay}
    const vi=near(h.p);for(let i=n0;i<SI.length;i++){SK.push(SIa.getX(vi),SIa.getY(vi),SIa.getZ(vi),SIa.getW(vi));SW.push(SWa.getX(vi),SWa.getY(vi),SWa.getZ(vi),SWa.getW(vi))}};
  const hx=v=>v.getHex?v.getHex():v;
  // back and flanks (the wing covert colours), staggered rows
  for(let z=.27,j=0;z>-.36;z-=.045,j++){const n=z>.2?7:z<-.25?5:11;for(let i=0;i<n;i++){const a=-.15+(i+(j%2)*.5)/(n-1)*(Math.PI+.3);feather(z,a,.15,.05,W.cov,K.cov.clone().multiplyScalar(.9).getHex(),W.cov,.05,true)}}
  // breast and belly: pale, barred (every other row tipped dark), pointing down and back
  for(let z=.25,j=0;z>-.12;z-=.04,j++)for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5+(j%2)*.5)*.3;feather(z,a,.12,.045,hx(K.bel),j%2?hx(K.bar):hx(K.bel),hx(K.bel),.55,true)}
  // throat and the front of the neck: small pale feathers (the bare faceted body showed there as flat colour steps)
  for(let z=.36,j=0;z>.22;z-=.03,j++)for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3+(j%2)*.5)*.34;feather(z,a,.06,.04,hx(K.face),hx(K.bel),hx(K.bel),.4,true)}
  // neck and crown: small feathers
  for(let z=.36,j=0;z<.45;z+=.035,j++)for(let i=0;i<5;i++){const a=Math.PI/2+(i-2+(j%2)*.5)*.38;feather(z,a,.06,.04,hx(K.deep),hx(K.deep),hx(K.deep),-.1,true)}
  // cheeks (round the eye, not over it)
  for(let z=.37,j=0;z<.47;z+=.025,j++)[-1,1].forEach(s=>[-.3,0,.3,.9].forEach(a0=>{if(Math.abs(z-.425)<.035&&Math.abs(a0-.4)<.4)return;feather(z,s>0?a0:Math.PI-a0,.05,.035,hx(K.back),hx(K.deep),hx(K.back),.1,true)}));
  // the legs' feathered trousers: rings of feathers pointing down, pressed onto the thigh
  [-1,1].forEach(s=>{const L=sh182Leg(s);for(let y=.53,j=0;y>.33;y-=.035,j++){let i0=0;while(i0<L.length-2&&L[i0+1][1]>y)i0++;const A0=L[i0],B0=L[i0+1],t=(A0[1]-y)/(A0[1]-B0[1]),zc=A0[2]+(B0[2]-A0[2])*t,rr=A0[3]+(B0[3]-A0[3])*t;
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+(j%2)*.4,p=[A0[0]+Math.cos(a)*rr,y,zc+Math.sin(a)*rr],h=lk180Near(G,p);if(h.d>.03)continue;const n=new V(...h.n),d=new V(0,-1,-.15);d.addScaledVector(n,-d.dot(n)).normalize();
      const xx=new V().crossVectors(n,d.clone().negate()).normalize(),M=new THREE.Matrix4().makeBasis(xx,new V().crossVectors(d.clone().negate(),xx),d.clone().negate());M.setPosition(...h.p);
      const n0=SI.length;rpwFeather(P,Cc,SI,0,M,.07,.04,hx(K.bel),j%2?hx(K.bar):hx(K.bel),hx(K.bel),0,false,true);const lay=.002+(.55-y)*.012;
      for(let q=n0;q<SI.length;q++){const w=lk180Near(G,[P[q*3],P[q*3+1],P[q*3+2]]);P[q*3]=w.p[0]+w.n[0]*lay;P[q*3+1]=w.p[1]+w.n[1]*lay;P[q*3+2]=w.p[2]+w.n[2]*lay}
      const vi=near(h.p);for(let q=n0;q<SI.length;q++){SK.push(SIa.getX(vi),SIa.getY(vi),SIa.getZ(vi),SIa.getW(vi));SW.push(SWa.getX(vi),SWa.getY(vi),SWa.getZ(vi),SWa.getW(vi))}}}});
  const key='rpwCoat|'+C;let Gc=RPW.geo[key];
  // smooth normals: each coat vertex takes the body's own smooth normal at the nearest body vertex, so the coat shades like
  // one surface instead of each little face flashing light or dark (the 'pebbly', cel-shaded look)
  // (each vertex also takes the skin weights of the body vertex under it: a feather crossing a joint, on the thighs or the
  // neck, bends with the body instead of following its root alone and lifting off in a stride or a bite)
  const NA=G.attributes.normal,NN=[];SK.length=0;SW.length=0;for(let i=0;i<P.length;i+=3){const vi=near([P[i],P[i+1],P[i+2]]);NN.push(NA.getX(vi),NA.getY(vi),NA.getZ(vi));
    SK.push(SIa.getX(vi),SIa.getY(vi),SIa.getZ(vi),SIa.getW(vi));SW.push(SWa.getX(vi),SWa.getY(vi),SWa.getZ(vi),SWa.getW(vi))}
  // every triangle wound to face the way its normals point (two-sided smooth shading flips the normal of a triangle seen
  // from its back, so a wrongly wound one shades as if facing the other way: the black and white blotches)
  const sw3=(A,k,i,j)=>{for(let q=0;q<k;q++){const t=A[i*k+q];A[i*k+q]=A[j*k+q];A[j*k+q]=t}};
  for(let t=0;t<P.length/9;t++){const a=t*3,b=a+1,c2=a+2,ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2],vx=P[c2*3]-P[a*3],vy=P[c2*3+1]-P[a*3+1],vz=P[c2*3+2]-P[a*3+2];
    const fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx,d=fx*(NN[a*3]+NN[b*3]+NN[c2*3])+fy*(NN[a*3+1]+NN[b*3+1]+NN[c2*3+1])+fz*(NN[a*3+2]+NN[b*3+2]+NN[c2*3+2]);
    if(d<0){sw3(P,3,b,c2);sw3(Cc,3,b,c2);sw3(NN,3,b,c2);sw3(SK,4,b,c2);sw3(SW,4,b,c2)}}
  if(!Gc){Gc=new THREE.BufferGeometry();Gc.setAttribute('position',new THREE.Float32BufferAttribute(P,3));Gc.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
    Gc.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SK,4));Gc.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));Gc.setAttribute('normal',new THREE.Float32BufferAttribute(NN,3));Gc.computeBoundingSphere();RPW.geo[key]=Gc}
  const sm=lpMat(c.v,1,Object.assign({},LPR.Skyhawk.mat||{},{flatShading:false}));body.material=sm;
  const m=new THREE.SkinnedMesh(Gc,sm);m.castShadow=true;m.frustumCulled=false;m.userData.rpw=1;x.b.add(m);m.bind(body.skeleton,body.bindMatrix)}
