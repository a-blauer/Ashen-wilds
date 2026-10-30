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
function rpwFeather(P,C,SI,b,M,len,w,top,tip,under,bands,dark){
  const st=[[0,.34],[.18,.5],[.55,.5],[.82,.36],[1,0]],v=new THREE.Vector3(),c=new THREE.Color();
  const pt=(t,side)=>{let hw=0;for(let i=0;i<st.length-1;i++)if(t>=st[i][0]&&t<=st[i+1][0]){const u=(t-st[i][0])/(st[i+1][0]-st[i][0]);hw=st[i][1]+(st[i+1][1]-st[i][1])*u}
    return [side*hw*w,side?-.002*len*t:.003+.004*len*(1-t),-len*t-(side?0:0)]};
  const colAt=(t,base)=>{c.set(base).lerp(new THREE.Color(tip),Math.min(1,t*t*1.1));if(bands&&Math.floor(t*bands)%2==1)c.multiplyScalar(.78);if(dark&&t>.8)c.lerp(new THREE.Color(0x15110e),.6);return c};
  const T=[0,.18,.42,.66,.82,1];
  const put=(p,col)=>{v.set(p[0],p[1],p[2]).applyMatrix4(M);P.push(v.x,v.y,v.z);C.push(col.r,col.g,col.b);SI.push(b)};
  for(let i=0;i<T.length-1;i++){const a=T[i],e=T[i+1];
    [-1,1].forEach(s=>{const A=pt(a,s),B=pt(e,s),Ca=pt(a,0),Cb=pt(e,0);
      // top face (winding depends on the side), then the same quad from below in the underside colour
      const q=[[Ca,A,B],[Ca,B,Cb]];q.forEach(t3=>{const o=s>0?[0,2,1]:[0,1,2];o.forEach(k=>put(t3[k],colAt(k==0?a:(t3[k]===A?a:e),top)))});
      q.forEach(t3=>{const o=s>0?[0,1,2]:[0,2,1];o.forEach(k=>{const p=t3[k].slice();p[1]-=.0015;put(p,colAt(k==0?a:(t3[k]===A?a:e),under).clone().multiplyScalar(.95))})})})}}
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
  // leading edge: arm (starting inside the body), forearm, hand
  rpwRod(P,C,SI,id(sh),Mr[id(sh)],-.04,D.arm+.01,.022,.017,K.edge);rpwRod(P,C,SI,id(el),Mr[id(el)],-.01,D.fore+.01,.017,.013,K.edge);rpwRod(P,C,SI,id(wr),Mr[id(wr)],-.01,D.hand,.013,.007,K.edge);
  D.groups.forEach(q=>grp[q[0]].forEach((b,i)=>{const k=q[5];rpwFeather(P,C,SI,id(b),Mr[id(b)],q[3][i][2],q[4],K[k],K[k+'Tip'],K.under,q[6],q[7])}));
  const key=D.key+'|'+(c.v||'');let G=RPW.geo[key];
  if(!G){G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const n=SI.length,si=new Uint16Array(n*4),sw=new Float32Array(n*4);for(let i=0;i<n;i++){si[i*4]=SI[i];sw[i*4]=1}
    G.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));G.computeVertexNormals();G.computeBoundingSphere();RPW.geo[key]=G}
  const mesh=new THREE.SkinnedMesh(G,mat);mesh.castShadow=true;mesh.frustumCulled=false;mesh.userData.rpw=1;mir.add(mesh);
  mesh.bind(new THREE.Skeleton(B,Mr.map(m=>new THREE.Matrix4().copy(m).invert())),new THREE.Matrix4());
  const rest={};D.groups.forEach(q=>rest[q[0]]=grp[q[0]].map(b=>b.rotation.y));
  const wg={p:sh,s,base:0,amp:0,art:{sh,el,wr,grp,rest,D,mir,mx0:mir.position.x}};x.wings.push(wg);return wg}
// the pose: f = 0 folded … 1 spread; amp / ph = the wing beat (it rolls out from the shoulder to the elbow and the wrist).
// Folded (a raptor at rest): the arm runs back along the top of the flank, the forearm folds forward and down so the
// wrist is the front of the folded wing, the hand runs back again; the top of the wing faces out and every feather is
// turned to lie back toward the tail, the coverts over the flight feathers, the primaries reaching over the tail.
function rpwPose(wg,f,ph,amp,breath){const A=wg.art,D=A.D,F=D.fold,L=(a,b)=>a+(b-a)*f,sm=f*f*(3-2*f);
  A.mir.position.x=A.mx0+wg.s*(1-f)*(D.foldOut||0);   // folded, the wing lies on the flank, not inside it
  const beat=k=>amp*Math.sin(ph-k);
  A.sh.rotation.set(L(F.rx,0),L(F.ry,D.sweep),L(F.rz,D.lift)+beat(0)+breath);
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
  const tgt=A?1:run>0?.35*run:settle;x._rpwF=(x._rpwF==null?tgt:x._rpwF)+(tgt-(x._rpwF==null?tgt:x._rpwF))*Math.min(1,dt*(A?9:5));
  const amp=A?.75:run>0?.28*run:0;x._rpwP=(x._rpwP||0)+dt*(A?14:9);
  const breath=Math.sin(now/650)*.015;
  x.wings.forEach(w=>{if(w.art)rpwPose(w,x._rpwF,x._rpwP,amp,breath)})}}catch(e){if(!x._rpwE){x._rpwE=1;console.error('v182 wings',e)}}return r}}

// ---------------- Skyhawk: a hawk ----------------
function rpwSkyhawk(C){const main=lpMain(C,.22),dk=(k)=>main.clone().multiplyScalar(k).getHex();
  // groups: [name, joint, height, feathers [x, rest angle, length], width, colour key, bands, dark tip, fold stagger]
  return {key:'rpw|Skyhawk|'+C,arm:.2,fore:.22,hand:.12,foldOut:.04,sweep:.18,lift:.08,ely:-.28,wry:.42,
    groups:[['ter','sh',.002,[[.03,.05,.19],[.08,.02,.21],[.13,-.01,.22],[.175,-.02,.225]],.075,'sec',5,false,.12],
      ['sec','el',0,[[.02,-.02,.23],[.06,-.05,.235],[.1,-.08,.24],[.14,-.11,.24],[.18,-.14,.235],[.215,-.18,.23]],.075,'sec',5,false,.15],
      ['pri','wr',.002,[[.0,-.3,.25],[.025,-.48,.28],[.05,-.68,.3],[.075,-.88,.31],[.095,-1.08,.3],[.11,-1.27,.27],[.12,-1.45,.22]],.07,'pri',5,true,.12],
      ['cArm','sh',.009,[[-.02,-.12,.11],[.03,-.16,.12],[.08,-.2,.125],[.13,-.24,.13],[.18,-.28,.13]],.08,'cov',0,false,.1],
      ['cFore','el',.012,[[0,-.12,.11],[.045,-.16,.115],[.09,-.2,.12],[.135,-.24,.12],[.18,-.27,.115],[.22,-.3,.11]],.07,'cov',0,false,.1],
      ['cHand','wr',.012,[[0,-.3,.1],[.05,-.45,.1],[.1,-.6,.09]],.06,'cov',0,false,.08]],
    // folded: wing rolled so its top faces out, arm back, forearm forward-down, hand back; every feather turned to lie back
    fold:{rx:1.3,ry:1.72,rz:-.05,ely:-2.53,wry:2.43,ter:-1.87,cArm:-1.87,sec:.66,cFore:.76,pri:-1.77,cHand:-1.67},
    col:{edge:dk(.7),cov:dk(.62),covTip:dk(.5),sec:dk(.55),secTip:dk(.4),pri:dk(.45),priTip:dk(.28),under:main.clone().lerp(new THREE.Color(0xd8ccb0),.55).getHex()}}}
{const D=LPR.Skyhawk,p0=D.post;D.post=function(x,c,C,mat){const sp=typeof RV137!='undefined'&&RV137.cur?RV137.cur.Skyhawk:null;if(sp&&sp!='Skyhawk')return p0.apply(this,arguments);
  const W=rpwSkyhawk(C),m=lpMat(c.v,1,D.mat);[-1,1].forEach(s=>rpwWing(x,'chest',c,W,.12,.72,.14,s,m))}}

// ================= step 2: the Skyhawk's body — a hawk, not a block =================
// A rounder, smoother body (12-sided rings, more of them): a deep rounded breast, a dark mantle, a flat-crowned head with a
// heavy brow, deep-set amber eyes, a yellow cere and a hooked beak; over it ~150 small shingled feathers (dkKit leaves that
// take the body's own bone weights at their roots), feathered 'trousers' over yellow scaled legs, black talons; a tail
// of 12 feathers on its own bones that fans out when it attacks and sways at rest; quick raptor head tilts at rest.
var SH182={body:[[-.335,.54,.03,.025,.025,['tail0','tail0',0],'rump'],[-.28,.545,.062,.055,.055,['tail0','pelvis',.4],'rump'],
    [-.2,.555,.1,.095,.09,['pelvis','pelvis',0]],[-.11,.57,.132,.125,.12,['pelvis','spine',.4]],[-.02,.59,.14,.135,.145,['pelvis','spine',.75],'belly'],
    [.06,.615,.146,.14,.16,['spine','spine',0],'breast'],[.13,.645,.145,.135,.165,['spine','chest',.6],'breast'],[.2,.685,.13,.12,.145,['chest','chest',0],'breast'],
    [.255,.73,.11,.1,.11,['chest','neck',.5],'throat'],[.3,.78,.085,.08,.085,['neck','neck',0],'throat'],[.34,.83,.085,.085,.075,['neck','head',.7],'hd'],
    [.38,.868,.093,.088,.072,['head','head',0],'hd'],[.425,.878,.085,.078,.062,['head','head',0],'hd'],[.465,.872,.062,.056,.046,['head','head',0],'hd'],
    [.495,.865,.04,.034,.032,['head','head',0],'cere'],[.51,.862,.028,.024,.024,['head','head',0],'cere']]};
function sh182Cols(C){const main=lpMain(C,.22);return {main,back:main.clone().multiplyScalar(.5),deep:main.clone().multiplyScalar(.34),
  bel:new THREE.Color(0xd8ccb0),bar:main.clone().multiplyScalar(.45).lerp(new THREE.Color(0x3a3024),.45),face:new THREE.Color(0xd8ccb0).lerp(main,.2),
  cere:new THREE.Color(0xd8a83a),leg:new THREE.Color(0xc8a040),trou:new THREE.Color(0xd8ccb0).lerp(main,.35)}}
function sh182Leg(s){const H=s<0?'hl':'hr',x=s*.075;return [[x,.56,-.04,.06,['pelvis',H+'0',.4],'trou'],[x,.47,-.02,.078,['pelvis',H+'0',.7],'trou'],
  [x,.38,.0,.07,[H+'0',H+'0',0],'trou'],[x,.31,.016,.045,[H+'0',H+'1',.6],'trou'],[x,.27,.02,.024,[H+'1',H+'1',0],'leg'],[x,.12,-.015,.021,[H+'1',H+'2',.8],'leg'],[x,.04,0,.024,[H+'2',H+'2',0],'leg']]}
function sh182Geo(C){const K=sh182Cols(C),R=SH182.body;
  const paint=(o,r,s,c,i)=>{if(r.k=='cere')return o.copy(K.cere);if(r.k=='leg')return o.copy(K.leg);if(r.k=='trou'){o.copy(K.trou);if((i||0)%2)o.lerp(K.bar,.3);return}
    o.copy(K.main);if(s>.35)o.lerp(K.back,.85);
    if(r.k=='hd'){if(s>.3)o.copy(K.deep);else if(s>-.25)o.lerp(K.back,.5);else{o.copy(K.face);if(Math.abs(c)>.4)o.lerp(K.deep,.8)}return}
    if(r.k=='throat'&&s<.1)return o.copy(K.face);
    if((r.k=='breast'||r.k=='belly')&&s<-.05){o.copy(K.bel);if(r.i%2)o.lerp(K.bar,.6)}};
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
  // scapulars: a few long, flat feathers from the shoulders lying back over the roots of the folded wings (the rest of the
  // plumage is painted: small shingles all over read as scales)
  [-1,1].forEach(s=>[[.17,.62,.15],[.12,.7,.16],[.07,.78,.15]].forEach((q,i)=>leaf(q[0],s>0?q[1]+i*.08:Math.PI-q[1]-i*.08,q[2],.05,i%2?main:back,0,0)));
  // nape hackles and a short crest
  for(let i=0;i<5;i++)leaf(.33,Math.PI/2+(i-2)*.35,.07,.05,i%2?deep:back,-.25,.25);
  [-1,0,1].forEach(i=>k.L('head','c',deep,[i*.025,.95,.37],[i*.04,.975,.27],.022,.003,4));
  // the face: deep-set amber eyes under a heavy brow shelf, a dark streak behind the eye
  [-1,1].forEach(s=>{const e=bz150S(R,.425,s>0?.5:Math.PI-.5,-.006),p=e.p;k.p('head','sph','c',0x070605,p[0],p[1],p[2],.026,.022,.02,0,s*.6,0);
    k.p('head','sph','g',eye,p[0]+e.n[0]*.009,p[1]+e.n[1]*.009,p[2]+.006,.02,.018,.012,0,s*.6,0);k.p('head','sph','c',0x050404,p[0]+e.n[0]*.014,p[1]+e.n[1]*.014,p[2]+.009,.008,.009,.005,0,s*.6,0);
    const b0=bz150S(R,.455,s>0?.95:Math.PI-.95,-.004).p,b1=bz150S(R,.39,s>0?.7:Math.PI-.7,-.002).p;k.L('head','c',deep,b0,[b1[0],b1[1]+.006,b1[2]],.018,.014,4);
    const t0=bz150S(R,.4,s>0?.15:Math.PI-.15,-.002).p,t1=bz150S(R,.33,s>0?-.05:Math.PI+.05,-.004).p;k.L('head','c',deep,t0,t1,.012,.008,4)});
  // hooked beak: the upper mandible curving over a lower one on the jaw, a yellow cere at the root
  k.L('head','c',beak,[0,.872,.5],[0,.874,.55],.03,.022,5);k.L('head','c',beak,[0,.874,.55],[0,.858,.585],.022,.012,5);k.L('head','c',beak,[0,.858,.585],[0,.828,.6],.012,.002,4);
  k.L('jaw','c',dkShade(beak,1.4),[0,.842,.5],[0,.84,.565],.02,.007,4);
  // feathered trousers: shaggy tufts round the thighs; yellow scaled feet, black talons
  [-1,1].forEach(s=>{const H=s<0?'hl':'hr',x=s*.075;for(let y=.5,j=0;y>.31;y-=.045,j++)for(let i=0;i<6;i++){const a=i/6*Math.PI*2+(j%2)*.5,r=.07-j*.006;
      k.L(H+'0','c',(i+j)%3?hx(K.trou):bar,[x+Math.cos(a)*r*.7,y,-.01+Math.sin(a)*r*.7],[x+Math.cos(a)*r*1.05,y-.07,-.01+Math.sin(a)*r*1.05],.03,.003,4)}
    const f=H+'2';[-1,0,1].forEach(i=>{k.L(f,'c',hx(K.leg),[x,.025,.0],[x+i*.04,.02,.09-Math.abs(i)*.02],.016,.012,4);k.p(f,'cone4','c',tip,x+i*.045,.018,.1-Math.abs(i)*.02,.008,.04,.008,Math.PI/2)});
    k.L(f,'c',hx(K.leg),[x,.025,0],[x,.02,-.07],.015,.011,4);k.p(f,'cone4','c',tip,x,.018,-.085,.008,.035,.008,-Math.PI/2)})}
// the tail: 12 feathers on their own bones under tail0 (one skinned mesh); fans out when attacking, sways at rest
function rpwTail(x,c,C,mat){const K=sh182Cols(C),S=x.S,bn='tail0',r=S.bones[bn],root=new THREE.Group();root.position.set(0-r[1],.545-r[2],-.3-r[3]);x.bones[bn].add(root);
  const B=[],N=12;for(let i=0;i<N;i++){const t=i/(N-1)-.5,b=new THREE.Bone();b.position.set(t*.07,.004*Math.abs(t),-.004*Math.abs(t));b.rotation.order='YXZ';b.rotation.y=-t*.5;b.rotation.x=-.06;root.add(b);B.push(b)}
  root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),Mr=B.map(b=>new THREE.Matrix4().multiplyMatrices(inv,b.matrixWorld)),P=[],Cc=[],SI=[];
  B.forEach((b,i)=>{const mid=Math.abs(i-(N-1)/2)<1.1;rpwFeather(P,Cc,SI,i,Mr[i],.3-Math.abs(i-(N-1)/2)*.008,.07,(mid?K.back:K.main).getHex(),K.deep.getHex(),K.bel.getHex(),6,true)});
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
  const p1=D.post;D.post=function(x,c,C,mat){const r=p1.apply(this,arguments);if(own())rpwTail(x,c,C,lpMat(c.v,1,D.mat));return r};
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
    x._rpwHz=(x._rpwHz||0)+(tz-(x._rpwHz||0))*k;x._rpwHy=(x._rpwHy||0)+(ty-(x._rpwHy||0))*k;const w=mv?.3:1;b.head.rotation.z=x._rpwHz*w;b.head.rotation.y+=x._rpwHy*w}else if(b&&b.head)b.head.rotation.z=0}}catch(e){if(!x._rpwE2){x._rpwE2=1;console.error('v182 tail/head',e)}}return r}}
