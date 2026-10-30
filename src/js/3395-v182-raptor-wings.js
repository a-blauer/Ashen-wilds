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
  const wg={p:sh,s,base:0,amp:0,art:{sh,el,wr,grp,rest,D}};x.wings.push(wg);return wg}
// the pose: f = 0 folded … 1 spread; amp / ph = the wing beat (it rolls out from the shoulder to the elbow and the wrist).
// Folded (a raptor at rest): the arm runs back along the top of the flank, the forearm folds forward and down so the
// wrist is the front of the folded wing, the hand runs back again; the top of the wing faces out and every feather is
// turned to lie back toward the tail, the coverts over the flight feathers, the primaries reaching over the tail.
function rpwPose(wg,f,ph,amp,breath){const A=wg.art,D=A.D,F=D.fold,L=(a,b)=>a+(b-a)*f,sm=f*f*(3-2*f);
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
  return {key:'rpw|Skyhawk|'+C,arm:.2,fore:.22,hand:.12,sweep:.18,lift:.08,ely:-.28,wry:.42,
    groups:[['ter','sh',.002,[[.03,.05,.19],[.08,.02,.21],[.13,-.01,.22],[.175,-.02,.225]],.075,'sec',5,false,.12],
      ['sec','el',0,[[.02,-.02,.23],[.06,-.05,.235],[.1,-.08,.24],[.14,-.11,.24],[.18,-.14,.235],[.215,-.18,.23]],.075,'sec',5,false,.15],
      ['pri','wr',.002,[[.0,-.3,.25],[.025,-.48,.28],[.05,-.68,.3],[.075,-.88,.31],[.095,-1.08,.3],[.11,-1.27,.27],[.12,-1.45,.22]],.07,'pri',5,true,.12],
      ['cArm','sh',.009,[[-.02,-.12,.11],[.03,-.16,.12],[.08,-.2,.125],[.13,-.24,.13],[.18,-.28,.13]],.08,'cov',0,false,.1],
      ['cFore','el',.012,[[0,-.12,.11],[.045,-.16,.115],[.09,-.2,.12],[.135,-.24,.12],[.18,-.27,.115],[.22,-.3,.11]],.07,'cov',0,false,.1],
      ['cHand','wr',.012,[[0,-.3,.1],[.05,-.45,.1],[.1,-.6,.09]],.06,'cov',0,false,.08]],
    // folded: wing rolled so its top faces out, arm back, forearm forward-down, hand back; every feather turned to lie back
    fold:{rx:1.3,ry:1.53,rz:-.05,ely:-2.53,wry:2.43,ter:-1.87,cArm:-1.87,sec:.66,cFore:.76,pri:-1.77,cHand:-1.67},
    col:{edge:dk(.7),cov:dk(.62),covTip:dk(.5),sec:dk(.55),secTip:dk(.4),pri:dk(.45),priTip:dk(.28),under:main.clone().lerp(new THREE.Color(0xd8ccb0),.55).getHex()}}}
{const D=LPR.Skyhawk,p0=D.post;D.post=function(x,c,C,mat){const sp=typeof RV137!='undefined'&&RV137.cur?RV137.cur.Skyhawk:null;if(sp&&sp!='Skyhawk')return p0.apply(this,arguments);
  const W=rpwSkyhawk(C),m=lpMat(c.v,1,D.mat);[-1,1].forEach(s=>rpwWing(x,'chest',c,W,.12,.72,.14,s,m))}}
