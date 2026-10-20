// v100 anim baker (evaluated in the game page): turns move specs (weapon grip position + blade direction per key, body,
// stance) into joint-angle keyframes for the hero skeleton with a small Levenberg–Marquardt IK, and sets the pelvis drop so
// the lower foot stays on the ground. Output: V100B.bake(specs) -> {ch:[channel names], mv:{name:[[k, v0, v1, ...], ...]}}.
// Frame: the hero's own frame (feet at the origin, facing +z). The weapon arm (bones aR*) is on the +x side ("W" side),
// the off arm (aL*) on −x. Lengths are model units at height 1.0 (the hero is ~1.45 tall).
window.V100B=(function(){
  const V3=THREE.Vector3,QT=THREE.Quaternion;
  const CH=['sy','sx','sz','py','pz','cy','hx','hy','lh','rh','lk','rk','lhy','rhy','la','ra','dy','ax','ay','az','ex','rw','rz','lx','ly','lz','le','lw','lq'];
  const BS={sy:['spine','y'],sx:['spine','x'],sz:['spine','z'],py:['pelvis','y'],pz:['pelvis','z'],cy:['chest','y'],hx:['head','x'],hy:['head','y'],
    lh:['lh0','x'],rh:['rh0','x'],lk:['lh1','x'],rk:['rh1','x'],lhy:['lh0','y'],rhy:['rh0','y'],la:['lh2','x'],ra:['rh2','x'],
    ax:['aR0','x'],ay:['aR0','y'],az:['aR0','z'],ex:['aR1','x'],rw:['aR2','x'],rz:['aR2','z'],lx:['aL0','x'],ly:['aL0','y'],lz:['aL0','z'],le:['aL1','x'],lw:['aL2','x'],lq:['aL2','z']};
  const REST={sx:.04,ax:-.2,ex:-.3,le:-.25};
  const ARM={R:['ax','ay','az','ex','rw','rz'],L:['lx','ly','lz','le','lw','lq']};
  const LIM={ax:[-3.4,1.0],ay:[-1.5,1.5],az:[-.75,2.5],ex:[-2.6,0],rw:[-1.2,1.45],rz:[-.6,.6],lx:[-3.4,1.0],ly:[-1.5,1.5],lz:[-2.5,.75],le:[-2.6,0],lw:[-1.2,1.45],lq:[-.6,.6]};
  let b=null,y0=0,root=null;
  const strike={q:new QT().setFromEuler(new THREE.Euler(-1,0,0)),p:new V3(0,-.03,.02)};
  const strikeClaw={q:new QT().setFromEuler(new THREE.Euler(-.2,0,0)),p:new V3(0,-.02,.02)};
  let SG=strike;
  function set(P){for(const c in BS){const s=BS[c],v=P[c]!=null?P[c]:(REST[c]||0);b[s[0]].rotation[s[1]]=v}b.pelvis.position.y=y0+(P.dy||0);root.updateMatrixWorld(true)}
  const _m=new THREE.Matrix4(),_q=new QT(),_v=new V3(),_v2=new V3();
  function grip(side,out){const h=b[side=='R'?'aR2':'aL2'];out.p=SG.p.clone().applyMatrix4(h.matrixWorld);root.worldToLocal(out.p);
    h.getWorldQuaternion(_q);const rq=root.getWorldQuaternion(new QT()).invert();out.d=new V3(0,-1,0).applyQuaternion(SG.q).applyQuaternion(_q).applyQuaternion(rq);return out}
  function palm(side){const h=b[side=='R'?'aR2':'aL2'];const p=new V3(0,-.035,.01).applyMatrix4(h.matrixWorld);return root.worldToLocal(p)}
  // torso penetration of a point (root frame): elliptic capsule around the spine/chest
  function pen(p){const c=b.chest,s=b.spine;const lp=c.worldToLocal(root.localToWorld(p.clone()));if(lp.y<-.32||lp.y>.3)return 0;const r=Math.hypot(lp.x/.17,lp.z/.14);return r<1?(1-r)*.14:0}
  function elbow(side){return root.worldToLocal(new V3().setFromMatrixPosition(b[side=='R'?'aR1':'aL1'].matrixWorld))}
  function resid(P,side,T,out){
    set(P);const g={};let i=0;
    if(T.p){const pt=T.palm?palm(side):grip(side,g).p;out[i++]=(pt.x-T.p[0]);out[i++]=(pt.y-T.p[1]);out[i++]=(pt.z-T.p[2])}
    if(T.d){if(!g.d)grip(side,g);const w=T.wd==null?.45:T.wd;out[i++]=w*(g.d.x-T.d[0]);out[i++]=w*(g.d.y-T.d[1]);out[i++]=w*(g.d.z-T.d[2])}
    const ks=ARM[side];
    for(const c of ks){const L=LIM[c],v=P[c];out[i++]=4*(v<L[0]?L[0]-v:v>L[1]?v-L[1]:0);out[i++]=(T.reg&&T.reg[c]!=null?T.reg[c]:.03)*(v-(T.pref[c]!=null?T.pref[c]:v))}
    // anatomy preferences: little humeral roll, little wrist deviation, elbow not locked straight
    out[i++]=.06*P[ks[1]];out[i++]=.12*P[ks[5]];out[i++]=.05*Math.max(0,P[ks[3]]+.12);
    const e=elbow(side),hp=palm(side),mid=e.clone().add(hp).multiplyScalar(.5);out[i++]=3*pen(e);out[i++]=3*pen(hp);out[i++]=3*pen(mid);
    return i}
  // multi-start: the previous key's arm (continuity) plus a few canonical arm poses; a clearly better solution wins
  function solve(P,side,T){
    const ks=ARM[side],sg=side=='R'?1:-1,seeds=[null,{x:-2.6,z:.2,e:-.6},{x:-1.4,z:0,e:-.3},{x:-1.2,z:-.5,e:-1.2},{x:-.6,z:.6,e:-1.0},{x:-2.0,z:-.3,e:-1.6},{x:.2,z:.3,e:-.6}];
    let best=null,bestP=null;const P0=Object.assign({},P);
    seeds.forEach((sd,i)=>{const Q=Object.assign({},P0);if(sd){Q[ks[0]]=sd.x;Q[ks[1]]=0;Q[ks[2]]=sd.z*sg;Q[ks[3]]=sd.e;Q[ks[4]]=0;Q[ks[5]]=0}
      const r=solve1(Q,side,T);if(!best||(i==0?false:r.cost<best.cost*.6-1e-4)||(best.i!=0&&r.cost<best.cost)){best=Object.assign(r,{i});bestP=Q}});
    ks.forEach(c=>P[c]=bestP[c]);return solve1(P,side,T)}
  function solve1(P,side,T){
    const ks=ARM[side],n=ks.length,r0=new Float64Array(64),r1=new Float64Array(64);let lam=.01;
    let m=resid(P,side,T,r0),cost=0;for(let i=0;i<m;i++)cost+=r0[i]*r0[i];
    const J=[];for(let j=0;j<n;j++)J.push(new Float64Array(m));
    for(let it=0;it<80;it++){
      for(let j=0;j<n;j++){const c=ks[j],v=P[c];P[c]=v+1e-4;resid(P,side,T,r1);for(let i=0;i<m;i++)J[j][i]=(r1[i]-r0[i])/1e-4;P[c]=v}
      const A=[],g=[];for(let a=0;a<n;a++){A.push(new Float64Array(n));let s=0;for(let i=0;i<m;i++)s+=J[a][i]*r0[i];g.push(-s);for(let c=0;c<n;c++){let t=0;for(let i=0;i<m;i++)t+=J[a][i]*J[c][i];A[a][c]=t}}
      let improved=false;
      for(let tries=0;tries<6;tries++){
        const M=A.map((row,a)=>{const r=Array.from(row);r[a]+=lam*(1+row[a]);r.push(g[a]);return r});
        for(let a=0;a<n;a++){let p=a;for(let q=a+1;q<n;q++)if(Math.abs(M[q][a])>Math.abs(M[p][a]))p=q;[M[a],M[p]]=[M[p],M[a]];const d=M[a][a]||1e-12;for(let q=a+1;q<n;q++){const f=M[q][a]/d;for(let c=a;c<=n;c++)M[q][c]-=f*M[a][c]}}
        const dx=new Array(n).fill(0);for(let a=n-1;a>=0;a--){let s=M[a][n];for(let c=a+1;c<n;c++)s-=M[a][c]*dx[c];dx[a]=s/(M[a][a]||1e-12)}
        const P2=Object.assign({},P);ks.forEach((c,j)=>P2[c]=P[c]+Math.max(-.4,Math.min(.4,dx[j])));
        const m2=resid(P2,side,T,r1);let c2=0;for(let i=0;i<m2;i++)c2+=r1[i]*r1[i];
        if(c2<cost){ks.forEach(c=>P[c]=P2[c]);cost=c2;r0.set(r1);lam=Math.max(1e-5,lam*.3);improved=true;break}lam*=4}
      if(!improved||cost<1e-9)break}
    resid(P,side,T,r0);const g={};grip(side,g);return {cost,p:T.palm?palm(side):g.p,d:g.d}}
  // feet: lowest ankle at its rest height
  function feet(P){P.dy=0;set(P);const a=root.worldToLocal(new V3().setFromMatrixPosition(b.lh2.matrixWorld)),c=root.worldToLocal(new V3().setFromMatrixPosition(b.rh2.matrixWorld));
    P.dy=+(FOOT0-Math.min(a.y,c.y)).toFixed(4)}
  let FOOT0=.07;
  function norm(d){const l=Math.hypot(d[0],d[1],d[2])||1;return [d[0]/l,d[1]/l,d[2]/l]}
  // spec key: {k, e?, b:{body channels}, R:{p,d,two?}|{ch}, L:'two'|{p,d}|{ch}, two:offset along the blade (− = toward the pommel)}
  function bakeMove(spec,report){
    SG=spec.claw?strikeClaw:strike;
    const out=[],prev={};CH.forEach(c=>prev[c]=REST[c]||0);
    spec.keys.forEach((K,ki)=>{
      const P={};CH.forEach(c=>P[c]=REST[c]||0);Object.assign(P,K.b||{});
      // head keeps the eyes on the target unless set
      if(K.b&&K.b.hy==null)P.hy=-((P.sy||0)+(P.py||0)+(P.cy||0))*.8;
      if(K.b&&K.b.hx==null)P.hx=-(P.sx-.04)*.55;
      // feet flat unless set: ankle cancels the leg pitch (rear heel lifts a little in a lunge)
      if(K.b&&K.b.la==null)P.la=-(P.lh+P.lk)+(P.lh>.12?.25*(P.lh-.12)*3:0);
      if(K.b&&K.b.ra==null)P.ra=-(P.rh+P.rk)+(P.rh>.12?.25*(P.rh-.12)*3:0);
      if(K.b&&K.b.lhy==null)P.lhy=-(P.py||0)*.7;if(K.b&&K.b.rhy==null)P.rhy=-(P.py||0)*.7;
      if(K.rest){Object.keys(REST).forEach(c=>P[c]=REST[c]);}
      feet(P);if(K.b&&K.b.dy!=null)P.dy=K.b.dy+P.dy;
      const rep={k:K.k};
      ['R','L'].forEach(side=>{const S=K[side];const ks=ARM[side];
        ks.forEach(c=>{P[c]=prev[c]});
        if(!S){if(K.rest)ks.forEach(c=>P[c]=REST[c]||0);return}
        if(S.ch){Object.assign(P,S.ch);return}
        if(S=='two'||S.two!=null)return; // after the main hand
        let tgt=S.p;{set(P);const sh=root.worldToLocal(new V3().setFromMatrixPosition(b[side=='R'?'aR0':'aL0'].matrixWorld)),v=new V3(...S.p).sub(sh),L=v.length(),RM=.43;
          if(L>RM){v.multiplyScalar(RM/L);tgt=[sh.x+v.x,sh.y+v.y,sh.z+v.z];rep[side+'clamp']=+(L-RM).toFixed(3)}}
        const T={p:tgt,d:S.d?norm(S.d):null,wd:S.wd,pref:Object.assign({},prev,S.pref||{}),reg:S.reg,palm:S.palm};
        const r=solve(P,side,T);rep[side]={cost:+r.cost.toFixed(5),err:+Math.hypot(r.p.x-tgt[0],r.p.y-tgt[1],r.p.z-tgt[2]).toFixed(3),dErr:S.d?+(1-(r.d.x*T.d[0]+r.d.y*T.d[1]+r.d.z*T.d[2])).toFixed(3):0}});
      // two-handed: the off hand on the handle
      const two=K.L&&(K.L=='two'||K.L.two!=null)?(K.L.two!=null?K.L.two:spec.two):null;
      if(two!=null){set(P);const g=grip('R',{});const tp=g.p.clone().addScaledVector(g.d,two);
        const T={p:[tp.x,tp.y,tp.z],palm:1,pref:Object.assign({},prev,{lw:.4,lq:0}),reg:{lw:.2,lq:.2}};const r=solve(P,'L',T);rep.L={two:1,err:+r.p.distanceTo(tp).toFixed(3)}}
      CH.forEach(c=>prev[c]=P[c]);
      if(K.post)for(const c in K.post)P[c]=(P[c]||0)+K.post[c];
      out.push([K.k,K.e||0].concat(CH.map(c=>+(+P[c]).toFixed(3))));
      if(report)report.push(rep)});
    SG=strike;return out}
  function mirrorKey(K){
    const M={};const b2={};const B=K.b||{};
    const neg={sy:1,sz:1,py:1,pz:1,cy:1,hy:1};
    for(const c in B){let v=B[c];if(neg[c])v=-v;
      const sw={lh:'rh',rh:'lh',lk:'rk',rk:'lk',la:'ra',ra:'la',lhy:'rhy',rhy:'lhy'}[c];if(c=='lhy'||c=='rhy')v=-v;b2[sw||c]=v}
    const mr=S=>{if(!S||S=='two')return S;if(S.ch){const o={};for(const c in S.ch){const v=S.ch[c];const m={ax:['lx',1],ay:['ly',-1],az:['lz',-1],ex:['le',1],rw:['lw',1],rz:['lq',-1],lx:['ax',1],ly:['ay',-1],lz:['az',-1],le:['ex',1],lw:['rw',1],lq:['rz',-1]}[c];o[m[0]]=v*m[1]}return {ch:o}}
      const o=Object.assign({},S);if(S.p)o.p=[-S.p[0],S.p[1],S.p[2]];if(S.d)o.d=[-S.d[0],S.d[1],S.d[2]];return o};
    return Object.assign({},K,{b:b2,R:mr(K.L),L:mr(K.R)})}
  function bakeAll(specs){
    const P0=pl.position.clone(),par=pl.parent,ry=pl.rotation.y;root=pl;b=pl.bones;
    const saved={};for(const k in b)saved[k]=b[k].rotation.clone();const py0=b.pelvis.position.y;y0=b.pelvis.userData.y0!=null?b.pelvis.userData.y0:py0;
    pl.position.set(0,0,0);pl.rotation.set(0,0,0);
    const res={ch:CH,mv:{},rep:{}};
    try{
      // rest ankle height
      const P={};CH.forEach(c=>P[c]=REST[c]||0);set(P);FOOT0=root.worldToLocal(new V3().setFromMatrixPosition(b.lh2.matrixWorld)).y;
      for(const n in specs){let s=specs[n];if(s.mirror===1||s.mirror===true)s=Object.assign({},s,{keys:s.keys.map(mirrorKey)});else if(s.mirror){const src=specs[s.mirror];s=Object.assign({},src,s,{keys:src.keys.map(mirrorKey)})}
        const rp=[];res.mv[n]=bakeMove(s,rp);res.rep[n]=rp}
    }finally{for(const k in b)b[k].rotation.copy(saved[k]);b.pelvis.position.y=py0;pl.position.copy(P0);pl.rotation.y=ry;pl.updateMatrixWorld(true)}
    return res}
  return {bake:bakeAll,CH,REST,mirrorKey,set:(P)=>set(P),get b(){return b}}})();
