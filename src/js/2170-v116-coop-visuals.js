// ================= v116: co-op — partners' companions, attacks and abilities are shown =================
// Everything here is visual only on the partner's screen: no damage, no state, no shots that can hit.
//  · Companions: presence carries each active companion's look (ck, the fields cr() builds from) and spot (cf). A partner
//    builds the same model with cr(), moves it smoothly and animates it with animC.
//  · Hero poses: every local haPlay (every attack, ability, bow / staff shot, potion) is sampled into 11 keyframes of the
//    upper-body channels and sent; the partner plays them on that hero's model (replaces the generic v58 sword swing).
//  · Effects: while a swing, a cast or a companion spell runs (MPV.cap, carried into its tweens, timers, hit callbacks and
//    ability objects), calls to the visual-effect functions in MPV_FX are recorded with their arguments (world positions)
//    and where the hero stood, then replayed on the partner in the same order and timing. Effect functions never deal
//    damage (checked for v116); the hero's position is lent for the call because some of them (slashFx…) place
//    themselves at the hero.
//  · Projectiles (launch) and companion bolts / lunges / spell motions are sent as their own entries and replayed as
//    ghosts (a ghost shot stops at walls and at the first monster, then fades).
// Entries ride the existing 'ev' topic (types V P L C B), so older pages simply ignore them.
var MPV={cap:0,rep:0,q:[],t0:0,tF:0,nopose:0,cf:null,ck:null,ckK:'',cfL:'',lp:[[0,0],[0,0]],stub:null,
  FX:['burst','ring','arc','bolt','slashFx','spinFx','thrustFx','flailFx105','kqsDecal','kqsPillar','kqsSpike','kqsChain','kqsBeam','kqsLob',
    'fxClaw','fxStream','fxWaves','fxSpikes','fxCracks','fxPillar','fxOrbit','fxRise','fxFall','fxSigil','fxTornado','fxBeam','fxJaws','fxWeb','fxDome',
    'x5emo','fxaFlash','fxaPuff','fxaScorch','fxaBoom']};
var MPV_FX={};MPV.FX.forEach((n,i)=>MPV_FX[n]=i);
function mpvLive(){return typeof MP!='undefined'&&MP.on&&MP.others>0&&!MPV.rep}
// ---------- carry the capture into callbacks made during it ----------
function mpvCb(f){if(!MPV.cap||typeof f!='function'||f.mpvW)return f;const w=function(){const o=MPV.cap;MPV.cap=1;try{return f.apply(this,arguments)}finally{MPV.cap=o}};w.mpvW=1;return w}
function mpvRun(f,self,args){const o=MPV.cap;MPV.cap=mpvLive()?1:0;try{return f.apply(self,args)}finally{MPV.cap=o}}
{const st=window.setTimeout;window.setTimeout=function(f,ms){if(MPV.cap&&typeof f=='function'){const a=Array.prototype.slice.call(arguments);a[0]=mpvCb(f);return st.apply(window,a)}return st.apply(window,arguments)}}
{const f=tw;tw=function(ms,fn,done){if(MPV.cap)return f(ms,mpvCb(fn),mpvCb(done));return f(ms,fn,done)}}
{const f=kqsObj;kqsObj=function(o){if(MPV.cap&&o){['tick','end','upd','hit'].forEach(k=>{if(typeof o[k]=='function')o[k]=mpvCb(o[k])})}return f.apply(this,arguments)}}
{const f=mvPlay105;mvPlay105=function(a,R,to,onHit){mpvComp(a,'m',to,R);return f.call(this,a,R,to,mpvCb(onHit))}}
// capture starts: the hero's attack and abilities, a companion's spell (fxB skills relay themselves, 1240)
{const f=swing;swing=function(){return mpvRun(f,this,arguments)}}
{const f=cast;cast=function(i){let fxb=false;try{const sk=heroSkills()[i];fxb=!!(sk&&typeof FXB_SK!='undefined'&&FXB_SK[sk.n])}catch(_){}
  if(fxb){MPV.nopose++;try{return f.apply(this,arguments)}finally{MPV.nopose--}}return mpvRun(f,this,arguments)}}
{const f=compCast;compCast=function(){return mpvRun(f,this,arguments)}}
{const f=cast_base;cast_base=function(i){let fxb=false;try{const sk=heroSkills()[i];fxb=!!(sk&&typeof FXB_SK!='undefined'&&FXB_SK[sk.n])}catch(_){}
  if(fxb){MPV.nopose++;try{return f.apply(this,arguments)}finally{MPV.nopose--}}return MPV.cap?f.apply(this,arguments):mpvRun(f,this,arguments)}}
// a replay can never hurt, spawn a damaging zone or count a companion hit, whatever an effect function might call
['hurt','zoneAt','compHit','area','kqsArea','kqsHit','heroHit'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){if(MPV.rep)return;return f.apply(this,arguments)}});

// ---------- recording ----------
const mpvR=v=>Math.round(v*1000)/1000;
function mpvSer(v,d){
  if(v==null)return null;const t=typeof v;
  if(t=='number')return isFinite(v)?mpvR(v):0;if(t=='boolean')return v;if(t=='string')return v.length<120?v:v.slice(0,120);
  if(t=='function'){try{if(v.length===0){const r=v();if(r&&r.isVector3)return {g:[mpvR(r.x),mpvR(r.y),mpvR(r.z)]}}}catch(_){}return {fn:1}}
  if(v.isVector3)return {v:[mpvR(v.x),mpvR(v.y),mpvR(v.z)]};
  if(v.isColor)return v.getHex();
  if(v.isObject3D){const p=v.getWorldPosition?v.getWorldPosition(new THREE.Vector3()):v.position;return {o:[mpvR(p.x),mpvR(p.y),mpvR(p.z)]}}
  if(v.m&&v.m.position&&v.m.position.isVector3){const p=v.m.position;return {o:[mpvR(p.x),mpvR(p.y),mpvR(p.z)]}} // a monster or companion
  if(d>2)return null;
  if(Array.isArray(v))return v.length>24?null:v.map(x=>mpvSer(x,d+1));
  if(t=='object'){const o={};let n=0;for(const k in v){if(++n>20)return null;const s=mpvSer(v[k],d+1);if(s!==undefined)o[k]=s}return {j:o}}
  return null}
function mpvDe(v,d){
  if(v==null||typeof v!='object')return v;
  if(Array.isArray(v))return d>3?[]:v.map(x=>mpvDe(x,d+1));
  if(v.v)return new THREE.Vector3(+v.v[0]||0,+v.v[1]||0,+v.v[2]||0);
  if(v.g){const p=new THREE.Vector3(+v.g[0]||0,+v.g[1]||0,+v.g[2]||0);return ()=>p}
  if(v.fn)return undefined;
  if(v.o)return mpvStub(+v.o[0]||0,+v.o[1]||0,+v.o[2]||0);
  if(v.j&&typeof v.j=='object'&&d<4){const o={};for(const k in v.j)if(k!=='__proto__'&&k!=='constructor')o[k]=mpvDe(v.j[k],d+1);return o}
  return null}
// a stand-in for a mesh / monster argument: a small glow that knows its spot
function mpvStub(x,y,z){if(!MPV.stub)MPV.stub=new THREE.SphereGeometry(.18,10,8);const m=new THREE.Mesh(MPV.stub,addMat(0xfff0c0));m.position.set(x,y,z);m.m=m;m.dead=false;return m}
function mpvPush(e){if(!mpvLive())return;const now=performance.now();if(!MPV.q.length)MPV.t0=now;if(MPV.q.length>=150)return;e.splice(1,0,Math.round(now-MPV.t0));MPV.q.push(e)}
MPV.dep=0;
MPV.FX.forEach(n=>{const f=window[n];if(typeof f!='function')return;
  window[n]=function(){
    if(!MPV.cap||MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
    let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
    const fnArg=Array.prototype.some.call(arguments,x=>typeof x=='function');
    if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
    if(!a||fnArg)return f.apply(this,arguments); // getters / callbacks: what they draw later is recorded on its own
    MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}});
// projectiles: the real shot stays local; partners get a ghost
{const f=launch;launch=function(pos,d,spd,s,dm,life){if(MPV.rep)return;if(mpvLive()&&!MPV.rep&&pos&&d)try{const S=s||{};
  mpvPush(['L',mpvR(pos.x),mpvR(pos.y),mpvR(pos.z),mpvR(d.x),mpvR(d.y||0),mpvR(d.z),mpvR(+spd||20),S.col|0,S.arrow?1:0,mpvR(+S.sc||+S.scale||1),mpvR(+life||1.1)])}catch(_){}
  return f.apply(this,arguments)}}
// companion moves: lunge / bolt / spell motion on fols[0|1]
function mpvSlot(a){return typeof fols!='undefined'&&a?fols.indexOf(a):-1}
function mpvComp(a,k,to,R){if(!mpvLive()||MPV.rep)return;const i=mpvSlot(a);if(i<0)return;let rn='';
  if(R&&typeof SPX105!='undefined'){for(const n in SPX105)if(SPX105[n]===R){rn=n;break}if(!rn)return}
  const p=to&&to.isVector3?to:to&&to.position?to.position:null;mpvPush(['C',i,k,rn,p?mpvR(p.x):null,p?mpvR(p.z):null])}
{const f=lunge;lunge=function(a,to,done){mpvComp(a,'l',to);return f.apply(this,arguments)}}
{const f=compBolt;compBolt=function(fo,c,foe,done){if(mpvLive()&&!MPV.rep){const i=mpvSlot(fo),p=foe&&foe.m&&foe.m.position;if(i>=0&&p)mpvPush(['B',i,mpvR(p.x),mpvR(p.y),mpvR(p.z)])}return f.apply(this,arguments)}}
// hero poses: sample whatever haPlay is about to play
{const f=haPlay;haPlay=function(ms,pose,hitAt,onHit,blendIn){
  const r=f.call(this,ms,pose,hitAt,mpvCb(onHit),blendIn);
  if(mpvLive()&&!MPV.nopose&&!MPV.rep&&typeof pose=='function')try{
    const ch=Object.keys(HACH).filter(c=>!(HA_LEGS[c]&&c!='dy')),K=[];
    for(let i=0;i<=10;i++){const P=pose(i/10)||{};K.push(ch.map(c=>typeof P[c]=='number'&&isFinite(P[c])?Math.round(P[c]*100)/100:null))}
    const use=ch.filter((c,j)=>K.some(k=>k[j]!==null));const keys=K.map(k=>ch.map((c,j)=>k[j]).filter((x,j)=>use.indexOf(ch[j])>=0));
    mpvPush(['P',Math.round(Math.max(60,ms||300)),use,keys])}catch(_){}
  return r}}
// flush with the other co-op batches (claude.ai room messages stay under 4 KB)
function mpvFlush(now){if(!MPV.q.length||now-MPV.tF<120)return;MPV.tF=now;const all=MPV.q.splice(0);if(!mpvLive())return;
  let l=[],sz=20;const send=()=>{if(l.length)MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{});l=[];sz=20};
  for(const e of all){const s=JSON.stringify(e).length;if(s>3700)continue;if(sz+s>3700||l.length>=60)send();l.push(e);sz+=s+1}send()}

// ---------- my companions in presence ----------
function mpvLookOf(c){return {n:c.n,f:c.f,v:c.v||'',g:(c.g||[]).slice(0,4),cl:(c.cl||[]).slice(0,4),tr:c.tr||'',evo:c.evo|0,shn:c.shn?1:0,rv:c.rv||'',l:c.l|0}}
function mpvMine(){const cf=[],ck=[];
  for(let i=0;i<2;i++){const f=typeof fols!='undefined'?fols[i]:null,c=party[i];if(!f||!c){cf.push(0);ck.push(0);continue}
    const L=MPV.lp[i],x=mpvR2(f.position.x),z=mpvR2(f.position.z),mv=Math.hypot(x-L[0],z-L[1])>.02?1:0;L[0]=x;L[1]=z;
    cf.push([x,z,mpvR2(f.rotation.y),mv,f.visible?1:0]);ck.push(mpvLookOf(c))}
  const k=JSON.stringify(ck);if(k!==MPV.ckK){MPV.ckK=k;MPV.ck=ck}
  MPV.cf=cf;const s=JSON.stringify(cf);if(s!==MPV.cfL){MPV.cfL=s;MP.lastPres=''}} // a companion moved: send presence again
function mpvR2(v){return Math.round(v*100)/100}
{const f=MP.room.presence;MP.room.presence=p=>{if(p&&typeof p.x=='number'){p.pv=116;p.cf=MPV.cf||[];p.ck=MPV.ck||[]}return f(p)}}

// ---------- partners' companions ----------
function mpvLookIn(L){if(!L||typeof L!=='object')return null;
  const g=(Array.isArray(L.g)?L.g:[]).filter(n=>typeof n=='string'&&S[n]).slice(0,4);if(!g.length)return null;
  const cl=(Array.isArray(L.cl)?L.cl:[]).filter(x=>typeof x=='number'&&isFinite(x)).slice(0,4);
  const s=v=>typeof v=='string'&&v.length<24&&!/[<>]/.test(v)?v:'';
  return {n:s(L.n)||g[0],f:Math.max(0,Math.min(9,+L.f||0)),v:s(L.v),g,cl:cl.length?cl:[0x8a8a8a,0x555555],tr:s(L.tr),evo:Math.max(0,Math.min(4,L.evo|0)),shn:!!L.shn,rv:s(L.rv),
    l:Math.max(1,Math.min(typeof MAXLV!='undefined'?MAXLV:99,L.l|0||1)),h:1,mods:[],sp:[],cdm:{},mpRemote:1}}
function mpvFolDrop(r,i){const f=r.fl&&r.fl[i];if(f){scene.remove(f)}if(r.fl){r.fl[i]=null;r.flk[i]=''}}
{const f=mpDropRH;mpDropRH=function(k){const r=MP.rh[k];if(r&&r.fl){mpvFolDrop(r,0);mpvFolDrop(r,1)}return f.apply(this,arguments)}}
function mpvFolTick(now,dt){
  for(const k in MP.rh){const r=MP.rh[k],pr=r.pr;if(!r.fl){r.fl=[null,null];r.flk=['','']}
    const show=!!(pr&&r.m&&r.m.visible&&Array.isArray(pr.cf));
    for(let i=0;i<2;i++){const e=show?pr.cf[i]:0,L=show&&Array.isArray(pr.ck)?pr.ck[i]:0;
      if(!Array.isArray(e)||!L||typeof e[0]!='number'||typeof e[1]!='number'||!isFinite(e[0])||!isFinite(e[1])){if(r.fl[i])r.fl[i].visible=false;continue}
      const key=JSON.stringify(L);
      if(key!==r.flk[i]){mpvFolDrop(r,i);r.flk[i]=key;const c=mpvLookIn(L);if(!c)continue;
        try{const g=cr(c);g.position.set(e[0],GH(e[0],e[1]),e[1]);g.rotation.y=+e[2]||0;g.userData.mpFol=1;g.mpC=c;scene.add(g);r.fl[i]=g}catch(err){console.warn('co-op companion',err)}}
      const g=r.fl[i];if(!g)continue;g.visible=!!e[4];if(!g.visible)continue;
      const p=g.position,dx=e[0]-p.x,dz=e[1]-p.z,D=Math.hypot(dx,dz);if(D>14){p.x=e[0];p.z=e[1]}else{const q=Math.min(1,dt*9);p.x+=dx*q;p.z+=dz*q}p.y=GH(p.x,p.z);
      let dr=(+e[2]||0)-g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));g.rotation.y+=dr*Math.min(1,dt*10);
      try{animC(g,now,!!e[3]||D>.08,Math.min(3,Math.max(1,D*6)))}catch(_){}}}}

// ---------- replay ----------
function mpvRH(peer){const r=MP.rh[peer];return r&&r.m&&r.m.visible&&r.pr&&r.pr.rg===MP.rg?r:null}
function mpvLend(x,y,z,ry,fn){const P=pl.position,ox=P.x,oy=P.y,oz=P.z,or=pl.rotation.y;P.set(x,y,z);pl.rotation.y=ry;MPV.rep++;try{return fn()}finally{MPV.rep--;P.set(ox,oy,oz);pl.rotation.y=or}}
function mpvPlay(r,e){
  const T=e[0];MPV.cnt=MPV.cnt||{};MPV.cnt[T]=(MPV.cnt[T]||0)+1; // counted for the tests
  if(T==='V'){const n=MPV.FX[e[2]],f=n&&window[n];if(typeof f!='function'||!Array.isArray(e[7]))return;const a=e[7].slice(0,12).map(x=>mpvDe(x,0));
    mpvLend(+e[3]||0,+e[4]||0,+e[5]||0,+e[6]||0,()=>{try{f.apply(null,a)}catch(_){}})}
  else if(T==='P'){const h=r.m,ms=Math.max(60,Math.min(4000,+e[2]||300)),ch=Array.isArray(e[3])?e[3].filter(c=>typeof c=='string'&&HACH[c]).slice(0,16):[],K=Array.isArray(e[4])?e[4].slice(0,11):[];
    if(!h.bones||!ch.length||K.length<2)return;const b=h.bones;h.sw=1;h._mpvP=(h._mpvP|0)+1;const id=h._mpvP;
    tw(ms,k=>{if(h._mpvP!==id)return;const u=Math.max(0,Math.min(1,k))*(K.length-1),i=Math.min(K.length-2,Math.floor(u)),w=u-i,A=K[i]||[],B=K[i+1]||[];
      ch.forEach((c,j)=>{const a=A[j],bb=B[j];if(typeof a!='number'&&typeof bb!='number')return;const v=typeof a!='number'?bb:typeof bb!='number'?a:a+(bb-a)*w;const q=HACH[c];if(b[q[0]])b[q[0]].rotation[q[1]]=v})},
      ()=>{if(h._mpvP===id)h.sw=0})}
  else if(T==='L'){const p=new THREE.Vector3(+e[2]||0,+e[3]||0,+e[4]||0),d=new THREE.Vector3(+e[5]||0,+e[6]||0,+e[7]||0);if(d.lengthSq()<1e-6)return;d.normalize();
    const spd=Math.max(1,Math.min(80,+e[8]||20)),life=Math.max(.1,Math.min(4,+e[12]||1.1));let m;try{m=shotMesh(e[9]|0,!!e[10])}catch(_){return}
    const sc=Math.max(.3,Math.min(4,+e[11]||1));if(sc!==1)m.scale.multiplyScalar(sc);m.position.copy(gY(p,1.0)).addScaledVector(d,.7);m.lookAt(m.position.clone().add(d));scene.add(m);
    const s0=m.position.clone();let gone=false;
    tw(life*1000,k=>{if(gone)return;const t=k*life;m.position.copy(s0).addScaledVector(d,spd*t);const x=m.position.x,z=m.position.z;
      let hit=typeof solid=='function'&&solid(Math.round(x),Math.round(z));if(!hit)for(const en of enemies){if(!en.dead&&en.m&&Math.abs(en.m.position.x-x)<1&&Math.abs(en.m.position.z-z)<1){hit=true;break}}
      if(hit){gone=true;m.visible=false;try{burst(m.position,e[9]|0||0xffffff,8,1.6,1.2,.35)}catch(_){}}},()=>scene.remove(m))}
  else if(T==='C'){const g=r.fl&&r.fl[e[2]|0];if(!g||!g.visible)return;const to=typeof e[5]=='number'&&typeof e[6]=='number'?new THREE.Vector3(e[5],GH(e[5],e[6]),e[6]):null;
    MPV.rep++;try{if(e[3]==='l'&&to)lunge(g,to,null);else if(e[3]==='m'&&typeof SPX105!='undefined'&&SPX105[e[4]]&&Object.prototype.hasOwnProperty.call(SPX105,e[4]))mvPlay105(g,SPX105[e[4]],to,null)}catch(_){}finally{MPV.rep--}}
  else if(T==='B'){const g=r.fl&&r.fl[e[2]|0];if(!g||!g.visible||!g.mpC)return;const p=new THREE.Vector3(+e[3]||0,+e[4]||0,+e[5]||0);
    MPV.rep++;try{compBolt(g,g.mpC,{m:{position:p},dead:false},()=>{})}catch(_){}finally{MPV.rep--}}}
{const f=mpOnEV;mpOnEV=function(msg){
  try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)&&d.r===MP.rg){const r=mpvRH(msg.peer);if(r){let n=0;
    for(const e of d.l){if(!Array.isArray(e)||typeof e[0]!=='string'||'VPLCB'.indexOf(e[0])<0||e[0].length!==1)continue;if(++n>60)break;
      const t=Math.max(0,Math.min(3000,+e[1]||0));if(t<16)mpvPlay(r,e);else setTimeout(()=>{const r2=mpvRH(msg.peer);if(r2)mpvPlay(r2,e)},t)}}}}catch(err){console.warn(err)}
  return f.apply(this,arguments)}}
// partners who send poses get no generic sword swing on top
{const f=mpSwingRH;mpSwingRH=function(h){const r=h&&h.mpPeer&&MP.rh[h.mpPeer];if(r&&r.pr&&r.pr.pv>=116)return;return f.apply(this,arguments)}}
// per frame, after the v58 co-op tick
{const f=homeTick;let lt=0;homeTick=function(){const r=f.apply(this,arguments);try{if(MP.on&&party.length){const now=performance.now(),dt=Math.min(.1,(now-(lt||now))/1000);lt=now;mpvMine();mpvFolTick(now,dt);mpvFlush(now)}}catch(err){console.warn(err)}return r}}
