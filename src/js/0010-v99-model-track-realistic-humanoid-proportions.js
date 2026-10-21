
// ================= v99 (model track): realistic humanoid proportions =================
// Every humanoid (hero, co-op heroes, bag / creator previews, humanoid foes, humanoid Sovereigns, town folk) is built in
// the HB / idlNB rest pose and skinned. This module re-proportions them by baking the change into that rest pose:
//  * every baked vertex (body, worn armour shells, rigid kit parts) is moved by its own bone weights: for each bone a
//    rest-pose transform T_b(v) = P'_b + M_b·(v − P_b), blended by the vertex's skin weights;
//  * the bones are created at the moved rest positions P'_b, so the bind matrices match the moved geometry.
// Bones keep a unit scale and the same names, order and rotations, so every animation (v81 actions, v85 attacks, v91
// ability poses, v93 idle and grips, v94 riding) drives them exactly as before, and armour still deforms with the body.
// M_b: torso bones (pelvis, spine, chest, neck) scale width / height / depth; limb bones scale along the bone (length)
// and across it (thickness); hands, feet and the head scale uniformly. Each child joint moves with its parent's M, and
// the whole skeleton is lifted so the soles stay on the ground. Goblins keep their stubby build; big brutes (orcs,
// trolls, yetis, giants, the Bloated One, nagas, ghouls, sand elementals) get longer legs and arms and a smaller head but
// keep their bulk. The plan is computed once per bone table and preset. Nothing in gameplay changes.
var AW_PROP99=(function(){
  const PRE={
    real:{pelvis:[.85,1,.86],spine:[.78,1.06,.8],chest:[.8,1.06,.82],neck:[1,1.45,1],head:.8,arm:[1.16,.83],hand:.88,leg:[1.34,1],foot:1,cape:[1.27,1]},
    brute:{pelvis:[1,1,1],spine:[1,1.03,1],chest:[1,1.03,1],neck:[1,1.2,1],head:.9,arm:[1.1,1],hand:1,leg:[1.2,1],foot:1,cape:[1.15,1]}};
  const BRUTE={orc:1,troll:1,trollsh:1,yeti:1,giant:1,abom:1,selem:1,ghoul:1,nagaw:1,nagaa:1,nagas:1,
    amalgam:1,lichen:1,akorror:1,gharial:1,jotun:1,saltgolem:1,drowned:1,colossus:1,executioner:1,gargoyle:1},KEEP={hob:1,sling:1,shaman:1};  // v113: the new big creatures are brutes too
  const S={on:true,ctx:null,plans:new Map(),hip:.55};
  const forKey=k=>KEEP[k]?'none':BRUTE[k]?'brute':'real';
  // limb chains: bone → child that gives the bone's direction
  const CH={lh0:'lh1',lh1:'lh2',rh0:'rh1',rh1:'rh2',aL0:'aL1',aL1:'aL2',aR0:'aR1',aR1:'aR2',cp0:'cp1',cp1:'cp2',cp2:'cp1'};
  const isHum=T=>{if(!T||!T.pelvis||!T.chest||!T.head||!T.lh0||!T.aL0)return false;try{if(T===HB)return true}catch(_){}try{if(T===idlNB())return true}catch(_){}return false};
  const diag=v=>[v[0],0,0,0,v[1],0,0,0,v[2]];
  const limb=(d,len,th)=>{const M=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)M.push((i==j?th:0)+(len-th)*d[i]*d[j]);return M};
  const mul=(M,x,y,z)=>[M[0]*x+M[1]*y+M[2]*z,M[3]*x+M[4]*y+M[5]*z,M[6]*x+M[7]*y+M[8]*z];
  function plan(T,pn){
    let m=S.plans.get(T);if(!m){m={};S.plans.set(T,m)}if(m[pn])return m[pn];
    const P=PRE[pn],names=Object.keys(T),abs={},M={},N={};
    names.forEach(n=>{abs[n]=[T[n][1],T[n][2],T[n][3]]});
    names.forEach(n=>{let X=null;const u=s=>[s,s,s];
      if(n=='pelvis'||n=='spine'||n=='chest'||n=='neck')X=diag(P[n]);
      else if(n=='head')X=diag(u(P.head));
      else if(/^(lh|rh)[01]$/.test(n)||/^a[LR][01]$/.test(n)||/^cp\d$/.test(n)){const c=CH[n];if(c&&abs[c]){let d=n=='cp2'?[abs[n][0]-abs[c][0],abs[n][1]-abs[c][1],abs[n][2]-abs[c][2]]:[abs[c][0]-abs[n][0],abs[c][1]-abs[n][1],abs[c][2]-abs[n][2]];
          const l=Math.hypot(d[0],d[1],d[2])||1;d=d.map(v=>v/l);const q=n[0]=='c'?P.cape:n[0]=='a'?P.arm:P.leg;X=limb(d,q[0],q[1])}}
      else if(/^(lh|rh)2$/.test(n))X=diag(u(P.foot));
      else if(/^a[LR]2$/.test(n))X=diag(u(P.hand));
      M[n]=X||diag([1,1,1])});
    // new rest positions, parents first (bone tables list parents before children)
    names.forEach(n=>{const p=T[n][0];if(!p||!N[p]){N[n]=abs[n].slice();return}const o=mul(M[p],abs[n][0]-abs[p][0],abs[n][1]-abs[p][1],abs[n][2]-abs[p][2]);N[n]=[N[p][0]+o[0],N[p][1]+o[1],N[p][2]+o[2]]});
    // lift so the soles (y = 0 under the feet in the rest pose) stay on the ground
    let lift=0;['lh2','rh2'].forEach(f=>{if(!N[f])return;const o=mul(M[f],0,-abs[f][1],0);lift=Math.max(lift,-(N[f][1]+o[1]))});
    names.forEach(n=>{N[n][1]+=lift});
    const idx=names.map(n=>({a:abs[n],n:N[n],M:M[n]}));
    return m[pn]={names,abs,N,M,idx,lift,hip:N.pelvis[1]}}
  // move baked vertices: p = flat xyz, si/sw = 4 bone indices / weights per vertex (indices into the bone table order)
  function warp(L,pl){const p=L.p,si=L.si,sw=L.sw,I=pl.idx,n=p.length/3;
    for(let v=0;v<n;v++){const x=p[v*3],y=p[v*3+1],z=p[v*3+2];let X=0,Y=0,Z=0,W=0;
      for(let j=0;j<4;j++){const w=sw[v*4+j];if(!(w>0))continue;const b=I[si[v*4+j]];if(!b)continue;const o=mul(b.M,x-b.a[0],y-b.a[1],z-b.a[2]);X+=w*(b.n[0]+o[0]);Y+=w*(b.n[1]+o[1]);Z+=w*(b.n[2]+o[2]);W+=w}
      if(W>0){p[v*3]=X/W;p[v*3+1]=Y/W;p[v*3+2]=Z/W}}}
  function hookAll(){
    // skeletons: bones start at the moved rest pose
    {const f=mkBones;mkBones=function(Sp){const r=f.apply(this,arguments);try{
      if(!S.on||!Sp||!isHum(Sp.bones))return r;const pn=S.ctx||'real';if(pn=='none')return r;const pl=plan(Sp.bones,pn);
      for(const n in r.bones){const T=Sp.bones[n];if(!T)continue;const P=pl.N[n],Q=T[0]&&pl.N[T[0]]?pl.N[T[0]]:[0,0,0];r.bones[n].position.set(P[0]-Q[0],P[1]-Q[1],P[2]-Q[2])}
      r.kqPre=pn}catch(e){console.error('v99 bones',e)}return r}}
    // builders: remember which preset a build is for
    {const f=mdB;mdB=function(bones){const B=f.apply(this,arguments);try{B.kqPre=S.on&&isHum(bones)?(S.ctx||'real'):'none'}catch(_){B.kqPre='none'}return B}}
    // bake: move every vertex by its weights before normals are computed
    {const f=mdBake;mdBake=function(B){try{if(B&&B.kqPre&&B.kqPre!='none'&&!B.kqDone){const pl=plan(B.bones,B.kqPre);for(const t in B.L){const L=B.L[t];if(L&&L.p&&L.p.length)warp(L,pl)}B.kqDone=1}}catch(e){console.error('v99 bake',e)}return f.apply(this,arguments)}}
    // per-foe preset (goblins unchanged, brutes keep their bulk)
    {const f=mdFoeB;mdFoeB=function(key){const o=S.ctx;S.ctx=forKey(key);try{return f.apply(this,arguments)}finally{S.ctx=o}}}
    {const f=mkHumanoid;mkHumanoid=function(key){const o=S.ctx;S.ctx=forKey(key);try{return f.apply(this,arguments)}finally{S.ctx=o}}}
  }
  try{hookAll()}catch(e){console.error('v99 hooks',e)}
  // the hero's hip height in the new rest pose (riding seats the hips on the saddle)
  S.hipOf=()=>{try{return plan(HB,'real').hip}catch(_){return .55}};
  S.forKey=forKey;S.plan=plan;S.PRE=PRE;return S})();
var DK=2,DKY=1.3; // den scale (1180); v108: 1.35 -> 2 (Sovereign dens are much larger)

