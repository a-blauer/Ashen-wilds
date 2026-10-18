// ================= v92 combat: Wild Hunt and Stampede use the v91 ghost wolf =================
// How it works (read this before changing it):
// - Call of the Wild already gets the ghost wolf from zzN_fxA.js (fxaGhostWolf: the Ashwolf low-poly rig with the spectral
//   fresnel material, glowing eyes and wisps). Wild Hunt (KQH.r_hunt) and Stampede (KQH.r_stamp) still built the old box
//   wolves with kqsWolf(col,scale). Here both handlers run unchanged, but while they run kqsWolf() returns a ghost wolf of
//   the same scale, so every number (damage, count, paths, timing, knockback) still comes from the old code.
// - Wild Hunt: the three wolves are kqsSummon summons, exactly like Call of the Wild, so they get the same fxA summon hook
//   (fxaSumHook: fade in, creature gait through animC/rigAnim, the v85 bite timed on the damage tick, wisps, dissolve on end).
// - Stampede: the four wolves are driven by the stampede's own kqsObj (it sets their position and facing every frame). We wrap
//   that object: after its tick each ghost wolf fades in, gallops with the rig (animC), trails wisps, and snaps its jaws when
//   the charge tramples an enemy next to it (lunge with a short reach, so the body stays on the stampede path). Its end() is
//   replaced for ghost wolves: the old kqsFade would dispose the shared rig geometry; we fade and remove with fxaRm instead.
// - Nothing new is left in the scene: the wolves are removed by their own end(), wisps come from the pooled FXA.root.
var CBW={on:1,made:0};
function cbwWolf(sc){if(!CBW.on||typeof fxaGhostWolf!='function')return null;const g=fxaGhostWolf();if(!g)return null;
  g.scale.setScalar(g.userData.sc0*(sc||1));g.userData.sc0=g.scale.x;g.userData.legs=[];g.userData.cbw=1;CBW.made++;return g}
// Wild Hunt: same summon hook as Call of the Wild
{const f=KQH.r_hunt;if(typeof f=='function')KQH.r_hunt=function(c){const W=kqsWolf,S=kqsSummon,made=[];
  kqsWolf=function(col,sc){const g=cbwWolf(sc);if(g){made.push(g);return g}return W.apply(this,arguments)};
  kqsSummon=function(o){if(o&&made.includes(o.mesh)){o.wolf=0;return fxaSumHook(S.apply(this,arguments),o,'wolf')}return S.apply(this,arguments)};
  try{return f.apply(this,arguments)}finally{kqsWolf=W;kqsSummon=S}}}
// Stampede: hook the stampede's own object
function cbwStampHook(o,B){
  const G=B.filter(b=>b.userData.cbw);if(!G.length)return o;
  const M=new Map();G.forEach(b=>{M.set(b,fxaMats(b));fxaOp(M.get(b),0);b.userData.wp=0;b.userData.p0=null});
  const t0=o.tick,e0=o.end,kh=kqsHit;
  o.tick=function(dt,now,ob){
    // a trampled enemy: the closest ghost wolf bites at it (body stays on the path)
    kqsHit=function(e){const r=kh.apply(this,arguments);try{if(e&&e.m){let bw=null,bd=9;G.forEach(b=>{const d=d2(b.position,e.m.position);if(d<bd&&!b.atk){bd=d;bw=b}});
        if(bw&&bd<3.2&&typeof lunge=='function'){const ry=bw.rotation.y,to=V(bw.position.x+Math.sin(ry)*1.5,0,bw.position.z+Math.cos(ry)*1.5);lunge(bw,to,null)}}}catch(_){}return r};
    let keep;try{keep=t0.apply(this,arguments)}finally{kqsHit=kh}
    const fin=Math.min(1,o.age/.15);
    G.forEach(b=>{const L=M.get(b),p=b.userData.p0,sp=p&&dt>0?Math.hypot(b.position.x-p.x,b.position.z-p.z)/dt:10;b.userData.p0=b.position.clone();
      fxaOp(L,fin);try{animC(b,now,true,Math.min(12,Math.max(6,sp)))}catch(_){}
      b.userData.wp-=dt;if(b.userData.wp<=0&&dt>0){b.userData.wp=.035;const q=b.position.clone();q.y+=.4+Math.random()*.5;q.x+=(Math.random()-.5)*.6;q.z+=(Math.random()-.5)*.6;
        fxaPuff(q,{col:Math.random()<.5?0x7ff0e0:0x9ad0ff,r0:.14,r1:.5,life:.8,op:.24*fin,add:1,v:[(Math.random()-.5)*.3,.4,(Math.random()-.5)*.3],drag:1,fin:.2,geo:'dod'})}});
    return keep};
  o.end=function(){B.forEach(b=>{if(!b.userData.cbw){kqsFade(b,250);return}
      const L=M.get(b),p=b.position.clone();burst(gY(p,.8),0x9ad0ff,14,1.2,1.6,.4);
      for(let i=0;i<6;i++){const q=p.clone();q.y=GH(p.x,p.z)+.2+Math.random()*1.2;q.x+=(Math.random()-.5)*.8;q.z+=(Math.random()-.5)*.8;fxaPuff(q,{col:0x7ff0e0,r0:.15,r1:.6,life:1,op:.3,add:1,v:[0,.8,0],drag:1,geo:'dod'})}
      let k=0;kqsObj({life:.3,tick:(dt,now)=>{k+=dt>0?dt:0;fxaOp(L,Math.max(0,1-k/.3));b.scale.setScalar(b.userData.sc0*(1+.12*k/.3));try{animC(b,now,false,0)}catch(_){}},end:()=>fxaRm(b)})})};
  return o}
{const f=KQH.r_stamp;if(typeof f=='function')KQH.r_stamp=function(c){const W=kqsWolf,O=kqsObj,B=[];
  kqsWolf=function(col,sc){const g=cbwWolf(sc);if(g){B.push(g);return g}const m=W.apply(this,arguments);B.push(m);return m};
  kqsObj=function(o){if(B.length&&o&&o.tick&&!o.cbw){o.cbw=1;cbwStampHook(o,B.slice())}return O.apply(this,arguments)};
  try{return f.apply(this,arguments)}finally{kqsWolf=W;kqsObj=O}}}
