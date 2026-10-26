// ================= v150 (owner's co-op list, Oct 25 2026): partners' effects clean up, partners' mounts show =================
// 1) Ground circles left behind. A replayed effect (2170) is drawn on the partner's screen from the recorded call, but a ground
//    decal (kqsDecal: the Venom Flask cloud, Caltrops, warning circles…) is taken away later through the object it returns
//    (D.rm), which the replay never got, so the partner kept the circle on the ground for good. Now the caster gives every
//    decal it records an id (an extra argument kqsDecal ignores) and sends ['D', id, ms] when it is removed; the partner
//    removes its copy then. A replayed decal that hears nothing goes after V150.decT seconds anyway.
//    The small glow stand-ins a replay makes for mesh / monster arguments (mpvStub) also go after V150.stubT seconds.
// 2) Partners' mounts. Presence carries the mount you ride (mt: [kind, speed]); a partner builds the same mount model under
//    your hero, walks it with its own gait and sits your hero in the saddle (the v78 seat and leg pose).
var V150={decT:15,stubT:4,dn:0,dec:{},mt:{}};

// ---------- 1) decals and stand-ins ----------
{const f=kqsDecal;kqsDecal=function(p,R,col,op,edge,id){
  if(MPV.rep){const D=f.apply(this,arguments);try{const key=typeof id=='string'&&id.length<40?id:null;if(key)V150.dec[key]=D;
      setTimeout(()=>{try{if(key&&V150.dec[key]===D)delete V150.dec[key];D.rm(400)}catch(_){}},V150.decT*1000)}catch(_){}return D}
  if(MPV.cap&&!MPV.dep&&mpvLive()){const key=(MP.me||'p')+'#'+(++V150.dn).toString(36);const D=f.call(this,p,R,col,op,edge,key);
    try{const rm=D.rm;let done=0;D.rm=function(ms){if(!done){done=1;try{if(mpvLive())mpvPush(['D',key,Math.round(ms||350)])}catch(_){}}return rm.apply(this,arguments)}}catch(_){}return D}
  return f.apply(this,arguments)}}
{const f=mpvPlay;mpvPlay=function(r,e){if(e&&e[0]==='D'){const key=e[2],D=typeof key=='string'?V150.dec[key]:null;if(D){delete V150.dec[key];try{D.rm(Math.max(50,Math.min(3000,+e[3]||350)))}catch(_){}}return}
  return f.apply(this,arguments)}}
// mpOnEV (2170) only replays the entry letters it knows: D rides along as its own pass
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)&&d.r===MP.rg){const r=mpvRH(msg.peer);
    if(r)for(const e of d.l.slice(0,80)){if(!Array.isArray(e)||e[0]!=='D')continue;const t=Math.max(0,Math.min(3000,+e[1]||0));setTimeout(()=>{const r2=mpvRH(msg.peer);if(r2)mpvPlay(r2,e)},t)}}}catch(err){console.warn('v150 decal',err)}
  return f.apply(this,arguments)}}
{const f=mpvStub;mpvStub=function(){const m=f.apply(this,arguments);setTimeout(()=>{try{if(m.parent)m.parent.remove(m)}catch(_){}},V150.stubT*1000);return m}}

// ---------- 2) mounts ----------
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.mt=riding&&mModel?[String(riding.k).slice(0,24),Math.round(riding.spd||0)]:0}catch(_){p.mt=0}}return f.apply(this,arguments)}}
function v150MtDrop(r){if(r&&r.mt150){scene.remove(r.mt150.g);r.mt150=null;try{const h=r.m&&r.m.children[0];if(h){h.position.y=0;h.position.z=0}const b=r.m&&r.m.bones;if(b){b.lh0.rotation.z=0;b.rh0.rotation.z=0}}catch(_){}}}
function v150MtTick(now){
  for(const k in MP.rh){const r=MP.rh[k],pr=r.pr,m=r.m;
    const mt=pr&&Array.isArray(pr.mt)&&typeof pr.mt[0]=='string'&&MOUNTS[pr.mt[0]]?pr.mt[0]:null;
    if(!m||!m.visible||!mt||pr.hp<=0){if(r.mt150)v150MtDrop(r);continue}
    if(!r.mt150||r.mt150.k!==mt){v150MtDrop(r);let g=null;try{g=mountModel(mt)}catch(err){console.warn('v150 mount',err)}if(!g)continue;g.userData.mpMt=1;scene.add(g);r.mt150={k:mt,g}}
    const g=r.mt150.g,mv=!!pr.mv,sp=mv?2.4+(+pr.mt[1]||0)/30:0;g.position.copy(m.position);g.rotation.y=m.rotation.y;
    try{if(g.r.rig)g.r.rig(now,mv,sp)}catch(_){}
    const B=g.r.b,bob=B?B.position.y*g.r.scale.y:0,h=m.children[0];
    if(h){h.position.y=g.seat[0]+bob-.5;h.position.z=g.seat[1]}if(g.sd)g.sd.position.y=g.seat[0]-.06+bob;
    const b=m.bones;if(b&&b.lh0){b.lh0.rotation.x=-1.3;b.rh0.rotation.x=-1.3;b.lh0.rotation.z=-.42;b.rh0.rotation.z=.42;b.lh1.rotation.x=1.45;b.rh1.rotation.x=1.45;
      if(!m.sw&&b.aL0){b.aL0.rotation.x=-.75;b.aR0.rotation.x=-.75;b.aL1.rotation.x=-.8;b.aR1.rotation.x=-.8;b.spine.rotation.x=mv?.12:0}}}}
{const f=mpTick;mpTick=function(){const r=f.apply(this,arguments);try{if(MP.on)v150MtTick(performance.now())}catch(err){if(!V150.mtErr){V150.mtErr=1;console.warn('v150 mounts',err)}}return r}}
{const f=mpDropRH;mpDropRH=function(k){try{v150MtDrop(MP.rh[k])}catch(_){}return f.apply(this,arguments)}}
