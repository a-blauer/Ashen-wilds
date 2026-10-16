// ================= v58: online co-op — shared monsters, your own loot, trading =================
var MP={room:null,on:false,me:'',pfx:'p',rg:-9,rh:{},host:'',others:0,emap:{},dead:{},hitq:{},evq:[],kq:[],nid:1,tP:0,tE:0,tB:0,tF:0,lastPres:'',lastPs:null,sw:0,tr:null,inv:null,inAI:0,dep:0,ap:0,rk:0,mkTr:undefined,lt:0,lx:0,lz:0,mv:0,chat:[],lastDone:''};
function mpEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}
function mpR2(v){return Math.round(v*100)/100}
function mpLive(){return typeof MP!='undefined'&&MP&&MP.on&&MP.others>0}
function mpAct(e){if(typeof MP=='undefined'||!MP||!MP.on||!MP.others)return false;const p=e.m.position;for(const k in MP.rh){const r=MP.rh[k];if(r.act&&r.m&&Math.abs(r.m.position.x-p.x)<32&&Math.abs(r.m.position.z-p.z)<32)return true}return false}
function mpNear(p,d){if(typeof MP=='undefined'||!MP||!MP.on||!MP.others)return false;for(const k in MP.rh){const r=MP.rh[k];if(r.act&&r.m&&Math.hypot(r.m.position.x-p.x,r.m.position.z-p.z)<d)return true}return false}
function mpName(peer){if(peer===MP.me)return hero.name||'You';const r=MP.rh[peer];return r&&r.pr&&r.pr.n?String(r.pr.n).slice(0,20):'Adventurer'}
function mpLoc(rg){return rg===-1?'Duskhold':rg>=0&&PMAP[rg]?PMAP[rg].n:'Elsewhere'}
function mpCurRg(){if(inRealm||inDun)return -2;return regionAt(Math.round(pl.position.x),Math.round(pl.position.z))}
function mpBossAuth(i){let h=(AF&&AF.i===i&&hero.hp>0)?MP.me:null;for(const k in MP.rh){const r=MP.rh[k];if(r.pr&&r.pr.ar===i&&r.pr.hp>0&&(h===null||k<h))h=k}return h}
function mpElig(e){return !e.dead&&!e.boss&&!e.minion&&!e.ev&&!e.wv}

// ---------- connect ----------
(async function(){
  try{if(typeof claude=='undefined'||!claude||!claude.use)return;const room=await claude.use('room');if(!room)return;MP.room=room;
    room.on('es',mpOnES);room.on('ev',mpOnEV);room.on('hit',mpOnHit);room.on('bs',mpOnBS);room.on('trade',mpOnTrade);room.on('chat',mpOnChat);
    room.onPeers(ch=>{if(!MP.on)return;ch.left.forEach(p=>{if(!p.sameTab&&MP.rh[p.peer]){const n=mpName(p.peer);say('👥 '+mpEsc(n)+' left.');if(MP.tr&&MP.tr.p===p.peer){MP.tr=null;if(xwMode=='trade')closeX();say('Trade cancelled.')}}})});
    MP.on=true;mpBtn();
  }catch(err){console.warn('co-op unavailable',err)}
})();

// ---------- remote heroes ----------
function mpGearE(g){const E={},S5=['weapon','offhand','helm','chest','boots'];(Array.isArray(g)?g:[]).slice(0,5).forEach((q,i)=>{if(Array.isArray(q)){const tp=q[0]|0;if(tp>=0&&tp<ITPL.length)E[S5[i]]={id:-1,tp,r:Math.max(0,Math.min(4,q[1]|0)),lv:1,req:1,up:0,aff:[]}}});return E}
function mpMyGear(){return ['weapon','offhand','helm','chest','boots'].map(k=>eq[k]?[eq[k].tp,eq[k].r]:0)}
function mpTagDraw(r){const pr=r.pr,key=(pr.n||'')+'|'+pr.lv+'|'+pr.hp;if(key===r.tk)return;r.tk=key;const c=r.tagC,g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  g.font='700 30px system-ui,sans-serif';g.textAlign='center';g.lineWidth=6;g.strokeStyle='rgba(0,0,0,.85)';const t=String(pr.n||'Adventurer').slice(0,20)+'  ·  Lv '+(pr.lv|0);g.strokeText(t,128,34);g.fillStyle='#9fe3ff';g.fillText(t,128,34);
  g.fillStyle='rgba(0,0,0,.7)';g.fillRect(48,48,160,12);g.fillStyle=pr.hp>35?'#4ade80':'#f87171';g.fillRect(50,50,156*Math.max(0,Math.min(100,pr.hp|0))/100,8);r.tagT.needsUpdate=true}
function mpModel(r){const pr=r.pr,cls=CLS[pr.c]?pr.c:'warrior',sig=cls+'|'+JSON.stringify(pr.g||[]);
  if(!r.m){r.m=buildHero();r.m.mpPeer=r.peer;r.m.position.set(pr.x,GH(pr.x,pr.z),pr.z);scene.add(r.m);
    r.tagC=document.createElement('canvas');r.tagC.width=256;r.tagC.height=64;r.tagT=new THREE.CanvasTexture(r.tagC);
    r.tag=new THREE.Sprite(new THREE.SpriteMaterial({map:r.tagT,transparent:true,depthWrite:false}));r.tag.scale.set(2.2,.55,1);r.tag.position.y=2.35;r.m.add(r.tag)}
  if(sig!==r.sig){r.sig=sig;try{refreshGear(r.m,cls,mpGearE(pr.g))}catch(err){console.warn(err)}}
  mpTagDraw(r)}
function mpDropRH(k){const r=MP.rh[k];if(!r)return;if(r.m){scene.remove(r.m)}delete MP.rh[k]}
function mpSwingRH(h){if(h.sw)return;h.sw=1;const b=h.bones;tw(300,k=>{const s=Math.sin(k*Math.PI);b.aR0.rotation.x=-.2-1.5*s;b.aR0.rotation.z=.5*s;b.spine.rotation.y=-.6*s},()=>{h.sw=0;b.aR0.rotation.z=0;b.spine.rotation.y=0})}
{const f=swingAnim;swingAnim=function(){MP.sw=(MP.sw+1)%1000;return f.apply(this,arguments)}}
{const f=castAnim;castAnim=function(){MP.sw=(MP.sw+1)%1000;return f.apply(this,arguments)}}

function mpPeersSync(){
  const ps=MP.room.peers();if(ps===MP.lastPs)return;MP.lastPs=ps;const seen={};
  for(const p of ps){
    if(p.sameTab){MP.me=p.peer;MP.pfx=p.peer.slice(0,5);continue}
    if(p.kind!=='viewer')continue;const pr=p.presence||{};if(typeof pr.x!=='number'||typeof pr.z!=='number'||!isFinite(pr.x)||!isFinite(pr.z))continue;
    seen[p.peer]=1;let r=MP.rh[p.peer];if(!r){r=MP.rh[p.peer]={peer:p.peer,sig:'',sw:pr.sw};say('👥 <b>'+mpEsc(String(pr.n||'Adventurer').slice(0,20))+'</b> joined your world. Press Y for co-op.')}
    r.pr=pr;
  }
  for(const k in MP.rh)if(!seen[k])mpDropRH(k);
}

// ---------- my presence ----------
function mpPresence(now){
  if(now-MP.tP<125)return;MP.tP=now;
  const x=mpR2(pl.position.x),z=mpR2(pl.position.z);MP.mv=Math.hypot(x-MP.lx,z-MP.lz)>.02?1:0;MP.lx=x;MP.lz=z;
  const P={n:String(hero.name||'Hero').slice(0,20),c:hero.cls,x,z,ry:mpR2(pl.rotation.y),mv:MP.mv,rg:MP.rg,ar:AF?AF.i:-1,lv:hero.lvl,hp:Math.max(0,Math.round(100*hero.hp/heroMax())),g:mpMyGear(),sw:MP.sw,pw:typeof heroPower=='function'?heroPower():0};
  const s=JSON.stringify(P);if(s===MP.lastPres)return;MP.lastPres=s;MP.room.presence(P).catch(()=>{});
}

// ---------- host election: the lowest peer in a map runs its monsters ----------
function mpHostFor(rg){let h=MP.me;for(const k in MP.rh){const r=MP.rh[k];if(r.pr&&r.pr.rg===rg&&k<h)h=k}return h}
function mpRoles(now){
  const rg=mpCurRg();
  if(rg!==MP.rg){ // changed map: drop every mirror from the old one
    enemies.slice().forEach(e=>{if(e.mir){removeE(e)}});MP.emap={};MP.dead={};MP.rg=rg;MP.host='';
  }
  let n=0;for(const k in MP.rh){const r=MP.rh[k];r.act=!!(r.pr&&rg>=0&&r.pr.rg===rg&&r.pr.hp>0&&r.m&&r.m.visible);if(r.pr&&rg>=0&&r.pr.rg===rg)n++}MP.others=n;
  const h=rg>=0?mpHostFor(rg):MP.me;
  if(h!==MP.host){const was=MP.host;MP.host=h;
    if(h===MP.me){if(was){enemies.forEach(e=>{if(e.mir){e.mir=0;e.nx=null;e.agg=0;e.cd=1}});say('👥 Your world now leads the monsters here.')}}
    else{enemies.slice().forEach(e=>{if(!mpElig(e))return;if(e.nid&&!e.mir){e.mir=1;MP.emap[e.nid]=e;e.mst=now;if(e.atk)mCancel(e)}else if(!e.nid)removeE(e)});}
  }
}

// ---------- monster snapshots (host → others) ----------
function mpSendES(now){
  if(MP.host!==MP.me||!MP.others||MP.rg<0||now-MP.tE<250)return;MP.tE=now;
  const rs=[];for(const k in MP.rh){const r=MP.rh[k];if(r.act)rs.push(r.m.position)}
  const L=[];enemies.forEach(e=>{if(e.mir||!mpElig(e))return;const x=e.m.position.x,z=e.m.position.z;if(regionAt(Math.round(x),Math.round(z))!==MP.rg)return;
    let d=Math.hypot(x-pl.position.x,z-pl.position.z);rs.forEach(p=>{d=Math.min(d,Math.hypot(x-p.x,z-p.z))});if(d<75)L.push([d,e])});
  L.sort((a,b)=>a[0]-b[0]);const l=[];
  for(const q of L.slice(0,45)){const e=q[1];if(!e.nid){e.nid=MP.pfx+'.'+(MP.nid++).toString(36);MP.emap[e.nid]=e}
    l.push([e.nid,e.c.en,e.c.l,mpR2(e.m.position.x),mpR2(e.m.position.z),mpR2(e.m.rotation.y),Math.round(e.c.h),e.c.al?1:0,e.trait||'',Math.round(e.sh||0),e.c.zt||0])}
  let s=JSON.stringify({r:MP.rg,l});while(s.length>3900&&l.length){l.pop();s=JSON.stringify({r:MP.rg,l})}
  MP.room.emit('es',{r:MP.rg,l}).catch(()=>{});
}
function mpOnES(msg){
  if(!MP.on||msg.sameTab)return;const d=msg.data;if(!d||d.r!==MP.rg||MP.rg<0||msg.peer!==MP.host||!Array.isArray(d.l))return;
  const now=performance.now(),seen={};
  for(const q of d.l){if(!Array.isArray(q))continue;const [id,key,lv,x,z,ry,h,al,tr,sh,zt]=q;if(typeof id!=='string'||id.length>24||!EN[key]||typeof x!=='number'||typeof z!=='number'||!isFinite(x)||!isFinite(z))continue;
    seen[id]=1;let e=MP.emap[id];if(e&&(e.dead||enemies.indexOf(e)<0)){delete MP.emap[id];e=null}
    if(!e){if(MP.dead[id]||Math.hypot(x-pl.position.x,z-pl.position.z)>70)continue;
      MP.mkTr=typeof tr==='string'?tr:'';try{e=spawnEnemy(key,x,z,Math.max(1,Math.min(MAXLV,lv|0)),{al:!!al,zt:zt|0||undefined})}finally{MP.mkTr=undefined}
      if(!e)continue;e.nid=id;e.mir=1;MP.emap[id]=e;e.m.rotation.y=+ry||0}
    e.nx=x;e.nz=z;e.nry=+ry||0;e.mst=now;e.sh=Math.max(0,+sh||0);
    const hh=Math.max(0,Math.min(M(e.c),+h||0));e.c.h=now-(e.lhT||0)<600?Math.min(e.c.h,Math.max(1,hh)):Math.max(1,hh);
    if(Math.hypot(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z)>30){e.m.position.x=x;e.m.position.z=z}}
  for(const id in MP.emap){const e=MP.emap[id];if(e.mir&&!seen[id]&&now-(e.mst||0)>1500){if(!e.dead)removeE(e);delete MP.emap[id]}}
  for(const id in MP.dead)if(now-MP.dead[id]>20000)delete MP.dead[id];
}
// a mirrored monster just follows what the host says and plays the attacks it is told about
function mpPuppet(e,dt,now){
  if(dt>0&&e.dots&&e.dots.length){for(let i=e.dots.length-1;i>=0;i--){const q=e.dots[i];q.t-=dt;q.ti-=dt;if(q.ti<=0){q.ti=.5;const def=cMD(e.c)*.5,d=Math.max(1,Math.round(q.dps*.5*(1-def/(def+KD(hero.lvl)))));hurt(e,d,{col:q.col},false,true);if(e.dead)return true}if(q.t<=0)e.dots.splice(i,1)}}
  const m=e.m,a=e.atk;
  if(a&&dt>0){mTick(e,dt,now);if(e.dead)return true}
  const mov=a&&a.ph==1&&(a.n=='charge'||a.n=='pounce');let L=0;
  if(!mov&&e.nx!=null){const dx=e.nx-m.position.x,dz=e.nz-m.position.z;L=Math.hypot(dx,dz);if(L>8){m.position.x=e.nx;m.position.z=e.nz}else if(dt>0){const k=Math.min(1,dt*7);m.position.x+=dx*k;m.position.z+=dz*k}
    if(!a){let dr=e.nry-m.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));m.rotation.y+=dr*Math.min(1,dt*10)}}
  if(!a)animC(m,now,L>.06,Math.min(3,L*5));else animC(m,now,!!mov,3);
  return true;
}
{const f=eTick;eTick=function(e,dt,now){
  if(MP.on&&e.mir&&!e.dead)return mpPuppet(e,dt,now);
  const r=f.apply(this,arguments);
  if(!r&&MP.on&&e.boss&&e.ar!=null&&AF&&AF.i===e.ar&&e.nx!=null&&mpBossAuth(e.ar)!==MP.me){const b=e.bs||{};
    if(!e.jmp&&!e.fly&&!e.spin&&!e.sub&&!b.dash){const m=e.m,dx=e.nx-m.position.x,dz=e.nz-m.position.z,l=Math.hypot(dx,dz);if(l>10){m.position.x=e.nx;m.position.z=e.nz}else if(dt>0){const k=Math.min(1,dt*6);m.position.x+=dx*k;m.position.z+=dz*k}}}
  return r}}
// mirrored elites keep the host's trait
{const f=giveTrait;giveTrait=function(e,k){if(MP.mkTr!==undefined){if(MP.mkTr&&TRAITS.some(t=>t[0]===MP.mkTr))return f(e,MP.mkTr);return}return f(e,k)}}
// only the host spawns monsters — and it spawns them around every player in the map
{const f=spawn;spawn=function(init){
  if(MP.on&&MP.rg>=0&&MP.host&&MP.host!==MP.me)return;
  if(MP.on&&!init&&MP.others){const rs=[];for(const k in MP.rh){const r=MP.rh[k];if(r.act)rs.push(r)}
    if(rs.length&&Math.random()<rs.length/(rs.length+1)){const r=rs[Math.random()*rs.length|0],p=pl.position,ox=p.x,oz=p.z;p.x=r.m.position.x;p.z=r.m.position.z;try{return f.apply(this,arguments)}finally{p.x=ox;p.z=oz}}}
  return f.apply(this,arguments)}}
// host monsters also hunt the other players
{const f=eTarget;eTarget=function(e,m,dpl){let tg=f(e,m,dpl);if(!MP.on||!MP.others||e.mir)return tg;let bd=tg===pl?dpl:m.position.distanceTo(tg.position);
  for(const k in MP.rh){const r=MP.rh[k];if(!r.act)continue;const d=m.position.distanceTo(r.m.position);if(d<bd-1.5){bd=d;tg=r.m}}return tg}}
{const f=mStart;mStart=function(e,tg,n){f.apply(this,arguments);if(MP.on&&MP.others&&e.nid&&!e.mir&&MP.host===MP.me)MP.evq.push(['a',e.nid,n,tg&&tg.mpPeer?tg.mpPeer:MP.me,mpR2(e.m.position.x),mpR2(e.m.position.z)])}}

// ---------- damage you deal to shared monsters goes to whoever runs them ----------
{const f=hurt;hurt=function(e,d,s,crit,dot){
  if(!MP.on||!e||e.dead||MP.ap||e.hid)return f.apply(this,arguments);
  let id=null;if(e.mir&&e.nid)id=e.nid;else if(e.boss&&e.ar!=null&&AF&&AF.i===e.ar){const a=mpBossAuth(e.ar);if(a&&a!==MP.me)id='b'+e.ar}
  if(!id)return f.apply(this,arguments);
  d=Math.max(0,Math.round(d));if(!isFinite(d))return;MP.hitq[id]=(MP.hitq[id]||0)+d;e.lhT=performance.now();
  e.c.h+=1e9;try{return f(e,d,s,crit,dot)}finally{e.c.h=Math.max(1,e.c.h-1e9)}}}
function mpOnHit(msg){
  if(!MP.on||msg.sameTab)return;const d=msg.data;if(!d||!Array.isArray(d.a))return;
  for(const q of d.a.slice(0,80)){if(!Array.isArray(q))continue;const id=q[0],dm=Math.max(0,Math.min(1e6,+q[1]||0));if(typeof id!=='string'||!dm)continue;let e=null;
    if(id[0]==='b'&&/^b\d+$/.test(id)){const i=+id.slice(1);if(AF&&AF.i===i&&mpBossAuth(i)===MP.me)e=bossEnt(i)}else{e=MP.emap[id];if(e&&e.mir)e=null}
    if(e&&!e.dead){MP.ap=1;try{hurt(e,dm,{col:0xc8d0ff},false,true)}finally{MP.ap=0}e.agg=1}}
}

// ---------- kills: everyone nearby gets their OWN loot and XP ----------
{const f=kill;kill=function(e){
  if(MP.on&&!MP.rk){if(e.boss&&e.ar!=null){if(MP.others&&!(AF&&AF.i===e.ar&&mpBossAuth(e.ar)!==MP.me))MP.kq.push({id:'b'+e.ar,n:2})}else if(e.nid&&!e.mir&&MP.others)MP.kq.push({id:e.nid,n:2})}
  if(e.nid)MP.dead[e.nid]=performance.now();return f.apply(this,arguments)}}
function mpKillRemote(id,from){
  const now=performance.now();
  if(/^b\d+$/.test(id)){const i=+id.slice(1),fr=MP.rh[from];if(!(AF&&AF.i===i)||!fr||!fr.pr||fr.pr.rg!==MP.rg)return;const e=bossEnt(i);if(e&&!e.dead){MP.rk=1;try{e.c.h=0;e.dead=1;e.hb.visible=false;kill(e)}finally{MP.rk=0}}return}
  if(from!==MP.host)return;MP.dead[id]=now;const e=MP.emap[id];delete MP.emap[id];if(!e||e.dead)return;
  if(hero.hp>0&&e.m.position.distanceTo(pl.position)<60){MP.rk=1;try{e.c.h=0;e.dead=1;e.hb.visible=false;kill(e)}finally{MP.rk=0}}else removeE(e)}

// ---------- Sovereign fights: the first player in the arena drives the boss, everyone dodges its attacks ----------
{const f=bossAI;bossAI=function(e){
  if(MP.on&&e.ar!=null&&AF&&AF.i===e.ar&&mpBossAuth(e.ar)!==MP.me){const b=e.bs;if(b){b.t=99;b.ult=99}return f.apply(this,arguments)}
  MP.inAI=1;try{return f.apply(this,arguments)}finally{MP.inAI=0}}}
Object.keys(BMV).forEach(k=>{const f=BMV[k];if(typeof f!='function')return;BMV[k]=function(e,A,en){const top=MP.inAI&&!MP.dep;MP.dep++;try{if(top&&MP.on&&MP.others&&A)MP.evq.push(['b',A.i,k,+(+en).toFixed(3)]);return f.apply(this,arguments)}finally{MP.dep--}}});
function mpSendBS(now){
  if(!AF||now-MP.tB<200)return;const i=AF.i;if(mpBossAuth(i)!==MP.me)return;let any=false;for(const k in MP.rh){const r=MP.rh[k];if(r.pr&&r.pr.ar===i)any=true}if(!any)return;
  const e=bossEnt(i);if(!e)return;MP.tB=now;MP.room.emit('bs',{i,x:mpR2(e.m.position.x),z:mpR2(e.m.position.z),ry:mpR2(e.m.rotation.y),h:Math.round(e.c.h)}).catch(()=>{});
}
function mpOnBS(msg){
  if(!MP.on||msg.sameTab)return;const d=msg.data;if(!d||typeof d.i!=='number'||msg.peer!==mpBossAuth(d.i))return;const e=bossEnt(d.i);if(!e||!isFinite(d.x)||!isFinite(d.z))return;
  const now=performance.now();e.nx=+d.x;e.nz=+d.z;e.nry=+d.ry||0;const hh=Math.max(1,Math.min(M(e.c),+d.h||1));e.c.h=now-(e.lhT||0)<600?Math.min(e.c.h,hh):hh;
}
{const f=arenaFail;arenaFail=function(){if(MP.on&&AF){const i=AF.i;let alive=false;for(const k in MP.rh){const r=MP.rh[k];if(r.pr&&r.pr.ar===i&&r.pr.hp>0)alive=true}
  if(alive){arenaClear(AF);setTimeout(()=>say('☠ You fell — your allies fight on.'),600);return}}return f.apply(this,arguments)}}

// ---------- event batches ----------
function mpFlush(now){
  if(now-MP.tF<150)return;MP.tF=now;
  const ids=Object.keys(MP.hitq);if(ids.length){const a=ids.slice(0,80).map(id=>[id,MP.hitq[id]]);MP.hitq={};MP.room.emit('hit',{a}).catch(()=>{})}
  if(MP.evq.length||MP.kq.length){const l=MP.evq.splice(0,40);MP.kq.forEach(q=>{l.push(['k',q.id]);q.n--});MP.kq=MP.kq.filter(q=>q.n>0);if(l.length)MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}
}
function mpOnEV(msg){
  if(!MP.on||msg.sameTab)return;const d=msg.data;if(!d||!Array.isArray(d.l))return;
  for(const q of d.l.slice(0,60)){if(!Array.isArray(q))continue;
    if(q[0]==='a'){if(d.r!==MP.rg||msg.peer!==MP.host)continue;const e=MP.emap[q[1]],n=q[2];if(!e||e.dead||!e.mir||typeof n!=='string'||!MV[n])continue;
      if(e.atk)mCancel(e);if(isFinite(q[4])&&isFinite(q[5])){e.m.position.x=q[4];e.m.position.z=q[5]}
      const r=MP.rh[q[3]],tg=q[3]===MP.me?pl:r&&r.m?r.m:{position:new THREE.Vector3(q[4]||0,0,q[5]||0)};try{mStart(e,tg,n)}catch(err){}}
    else if(q[0]==='b'){const i=q[1],k=q[2];if(!(AF&&AF.i===i)||msg.peer!==mpBossAuth(i)||typeof k!=='string'||!BMV[k]||!Object.prototype.hasOwnProperty.call(BMV,k))continue;const e=bossEnt(i);if(!e||e.dead)continue;
      try{const r=BMV[k](e,AF,Math.max(.5,Math.min(2,+q[3]||1)));e.bs.last=k;e.bs.lock=r&&r.lock?r.d:0;if(k=='slam')lunge(e.m,pl.position)}catch(err){console.warn(err)}}
    else if(q[0]==='k'&&typeof q[1]==='string')mpKillRemote(q[1],msg.peer);
  }
}

// ---------- per-frame ----------
function mpTick(){
  if(!MP.on||!party.length)return;const now=performance.now(),rdt=Math.min(.1,(now-(MP.lt||now))/1000);MP.lt=now;
  mpPeersSync();mpRoles(now);
  for(const k in MP.rh){const r=MP.rh[k],pr=r.pr;if(!pr)continue;const vis=pr.rg===MP.rg&&MP.rg>-2;
    if(vis&&!r.m)mpModel(r);if(!r.m)continue;r.m.visible=vis;if(!vis)continue;mpModel(r);
    const p=r.m.position,dx=pr.x-p.x,dz=pr.z-p.z,L=Math.hypot(dx,dz);if(L>12){p.x=pr.x;p.z=pr.z}else{const q=Math.min(1,rdt*10);p.x+=dx*q;p.z+=dz*q}
    let dr=(+pr.ry||0)-r.m.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));r.m.rotation.y+=dr*Math.min(1,rdt*12);
    animHero(now,!!pr.mv||L>.08,r.m);p.y=GH(p.x,p.z);if(pr.hp<=0)r.m.rotation.z=Math.min(1.4,(r.m.rotation.z||0)+rdt*4);else r.m.rotation.z=0;
    if(pr.sw!==r.sw){r.sw=pr.sw;mpSwingRH(r.m)}}
  mpPresence(now);mpSendES(now);mpSendBS(now);mpFlush(now);
  if(MP.tr&&MP.tr.st==='go'&&now-MP.tr.gt>800){MP.tr.gt=now;if(++MP.tr.tries>12){say('Trade timed out — nothing was exchanged.');MP.tr.st='open';MP.tr.rdy=false;if(xwMode=='trade')rX()}else mpTrSend({t:'go',v:MP.tr.v,tv:MP.tr.tv})}
  if(MP.inv&&now-MP.inv.t>30000){MP.inv=null;mpToast()}
  if(xwMode==='coop'&&now-(MP.tw||0)>1500){MP.tw=now;mpCoopList()}
}
{const f=homeTick;homeTick=function(){f.apply(this,arguments);try{mpTick()}catch(err){console.warn(err)}}}
// with friends in the same map the world keeps running while menus are open
addEventListener('keydown',e=>{const t=e.target;if(t&&t.tagName=='INPUT'&&(t.id=='mpChatIn'||(t.closest&&t.closest('.mpg')))){e.stopImmediatePropagation();if(e.key=='Enter'&&t.id=='mpChatIn'){e.preventDefault();mpSendChat()}if(e.key=='Escape')t.blur()}},true);

// ---------- chat ----------
function mpSendChat(){const i=$('mpChatIn');if(!i||!MP.on)return;const m=i.value.trim().slice(0,140);if(!m)return;i.value='';MP.room.emit('chat',{m}).catch(()=>say('Chat could not be sent.'))}
function mpOnChat(msg){const d=msg.data;if(!d||typeof d.m!=='string')return;const n=msg.sameTab?(hero.name||'You'):mpName(msg.peer),line='💬 <b>'+mpEsc(n)+'</b>: '+mpEsc(d.m.slice(0,140));MP.chat.push(line);if(MP.chat.length>30)MP.chat.shift();say(line);if(xwMode==='coop'){const c=$('mpChatL');if(c){c.innerHTML=MP.chat.slice(-10).join('<br>');c.scrollTop=1e5}}}

// ---------- UI: co-op window (Y) ----------
document.head.insertAdjacentHTML('beforeend',`<style>
#mpBtnH{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:30;background:rgba(14,16,22,.82);border:1px solid #3a4150;color:#cfe3ff;border-radius:999px;padding:4px 12px;font:600 12px system-ui,sans-serif;cursor:pointer;display:none}
#mpBtnH.on{display:block}
.mpg{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:640px){.mpg{grid-template-columns:1fr}}
.mpbox{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;min-height:120px}
.mpbox h4{margin:0 0 6px;font-size:.85rem;color:#e8d8a8}
.mpch{display:inline-flex;align-items:center;gap:4px;margin:2px;padding:3px 7px;border-radius:7px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);font-size:.78rem;cursor:pointer;color:var(--c,#ddd)}
.mpch.sel{outline:2px solid #fbbf24;background:rgba(251,191,36,.15)}
.mpq{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:.78rem;margin:2px 0}.mpq input{width:64px;background:#0d1016;color:#eee;border:1px solid #3a4150;border-radius:5px;padding:2px 4px}
#mpToast{position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:60;background:rgba(14,16,22,.94);border:1px solid #c9a24a;border-radius:12px;padding:10px 14px;color:#eee;font:14px system-ui,sans-serif;display:flex;gap:8px;align-items:center}
#mpChatL{max-height:150px;overflow:auto;font-size:.8rem;line-height:1.35;margin:6px 0}
#mpChatIn{width:100%;box-sizing:border-box;background:#0d1016;color:#eee;border:1px solid #3a4150;border-radius:6px;padding:6px}
</style>`);
document.body.insertAdjacentHTML('beforeend','<button id="mpBtnH">👥 Co-op</button>');
{const b=$('bossBtn');if(b)b.insertAdjacentHTML('afterend','<button id="mpBtn">👥 Co-op <kbd>Y</kbd></button>')}
function mpBtn(){const h=$('mpBtnH');if(!h)return;h.classList.toggle('on',!!MP.on);const n=Object.keys(MP.rh).length;h.textContent=n?'👥 '+(n+1)+' online':'👥 Co-op'}
setInterval(()=>{try{mpBtn()}catch(_){}},2000);
function openCoop(){if(!$('xw').classList.contains('hide')&&xwMode=='coop')return closeX();if(uiOpen()&&$('xw').classList.contains('hide'))return;openX('coop')}
$('mpBtnH').onclick=()=>openCoop();{const b=$('mpBtn');if(b)b.onclick=()=>{$('sysmenu').classList.add('hide');openCoop()}}
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey)return;const t=document.activeElement;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'))return;if(e.key.toLowerCase()=='y'&&party.length&&!building)openCoop()});
XR.coop=()=>{
  $('xwT').textContent='👥 Co-op';
  if(!MP.on){$('xwS').textContent='Playing solo';$('xwB').innerHTML='<p class="lore">Co-op turns on when this game is opened from its shared link by people signed in to Claude. Everyone who opens it shows up here — you can fight the same monsters, each get your own loot, chat and trade.</p>';$('xwF').innerHTML='';return}
  $('xwB').innerHTML='<div id="mpList"></div><div class="mpbox" style="margin-top:10px"><h4>Chat</h4><div id="mpChatL"></div><input id="mpChatIn" maxlength="140" placeholder="Say something… (Enter to send)"></div>';
  $('xwF').innerHTML='<span class="mut dtl">Monsters, Sovereigns and camps are shared with players in the same map. Every kill rolls separate loot for each nearby player — nobody can take yours. Trade gear, eggs, materials, supplies and gold from here.</span>';
  mpCoopList();const c=$('mpChatL');c.innerHTML=MP.chat.slice(-10).join('<br>');c.scrollTop=1e5;
};
function mpCoopList(){const el=$('mpList');if(!el)return;const rs=Object.values(MP.rh).filter(r=>r.pr);
  $('xwS').textContent=(rs.length+1)+' adventurer'+(rs.length?'s':'')+' online';
  const row=(n,cls,lv,rg,hp,btn,me)=>`<div class="rw" style="--rc:${me?'#6ee7b7':'#7ab8ff'}"><span class="rn">${me?'🟢':'🔵'} <b>${mpEsc(n)}</b>${me?' <span class="mut">(you)</span>':''} <span class="mut">${mpEsc((CLS[cls]||{}).n||cls)} · Lv ${lv|0}</span><small>📍 ${mpEsc(mpLoc(rg))}${hp<=0?' · ☠ down':' · ❤ '+(hp|0)+'%'}</small></span><span class="ra">${btn||''}</span></div>`;
  let h='<div class="rows">'+row(hero.name||'You',hero.cls,hero.lvl,MP.rg,Math.round(100*hero.hp/heroMax()),'',1);
  rs.forEach(r=>{const p=r.pr,rg=p.rg,can=rg>=0&&typeof pUnlocked=='function'&&pUnlocked(rg);
    h+=row(p.n||'Adventurer',p.c,p.lv,rg,p.hp,`<button class="pri" data-mpt="${mpEsc(r.peer)}">🤝 Trade</button> `+(rg===-1?`<button data-mpj="${mpEsc(r.peer)}">🏰 Go to</button>`:rg>=0?(can?`<button data-mpj="${mpEsc(r.peer)}">🌀 Join</button>`:'<small>🔒 portal locked</small>'):''))});
  el.innerHTML=h+'</div>'+(rs.length?'':'<p class="mut" style="margin-top:8px">Nobody else is here yet. Share this game with friends — when they open it, they appear in your world.</p>');
}
function mpXwClick(e){
  if(xwMode==='coop'){const t=e.target.closest('[data-mpt],[data-mpj]');if(!t)return;
    if(t.dataset.mpt)mpTradeInvite(t.dataset.mpt);
    else{const r=MP.rh[t.dataset.mpj];if(!r||!r.pr)return;if(AF)return say('The arena is sealed.');if(typeof WV!='undefined'&&WV)return say('Finish or leave your Wave Trial first.');const x=r.pr.x,z=r.pr.z;closeX();fadeTo(()=>{toPos(x+1.2,z+1.2);say('🌀 You join '+mpEsc(mpName(r.peer))+'.')})}}
  else if(xwMode==='trade')mpTradeClick(e);
}
$('xwB').addEventListener('click',mpXwClick);$('xwF').addEventListener('click',e=>{if(xwMode==='trade')mpTradeClick(e)});

// ---------- trading ----------
function mpTrSend(o){if(!MP.tr)return;o.to=MP.tr.p;o.id=MP.tr.id;MP.room.emit('trade',o).catch(()=>{})}
function mpToast(){let t=$('mpToast');if(!MP.inv){if(t)t.remove();return}if(!t){document.body.insertAdjacentHTML('beforeend','<div id="mpToast"></div>');t=$('mpToast')}
  t.innerHTML='🤝 <b>'+mpEsc(mpName(MP.inv.from))+'</b> wants to trade <button class="pri" id="mpAcc">Accept</button><button id="mpDec">Decline</button>';
  $('mpAcc').onclick=()=>{const v=MP.inv;MP.inv=null;mpToast();if(!v||!MP.rh[v.from])return say('They are gone.');if(MP.tr)mpTradeCancel(true);mpTradeOpen(v.from,v.id);mpTrSend({t:'acc'})};
  $('mpDec').onclick=()=>{const v=MP.inv;MP.inv=null;mpToast();if(v)MP.room.emit('trade',{to:v.from,id:v.id,t:'dec'}).catch(()=>{})}}
function mpTradeInvite(peer){if(!MP.rh[peer])return;if(MP.tr&&MP.tr.st!=='open')return say('Finish your current trade first.');const id=MP.me.slice(0,4)+Date.now().toString(36);MP.pend={p:peer,id};MP.room.emit('trade',{to:peer,id,t:'req'}).catch(()=>{});say('🤝 Trade request sent to '+mpEsc(mpName(peer))+'…')}
function mpTradeOpen(peer,id){MP.tr={p:peer,id,me:{g:[],e:[],m:{},s:{},gold:0},v:0,th:{g:[],e:[],m:{},s:{},gold:0},tv:0,rdy:false,trdy:false,st:'open',a:MP.me<peer,tries:0,gt:0};openX('trade')}
function mpTradeCancel(silent){if(MP.tr&&MP.tr.st!=='done'){mpTrSend({t:'cancel'});if(!silent)say('Trade cancelled.')}MP.tr=null}
{const f=closeX;closeX=function(){const was=xwMode;const r=f.apply(this,arguments);if(was==='trade'&&MP.tr&&MP.tr.st!=='go')mpTradeCancel();return r}}
function mpOfferObj(){const o=MP.tr.me;return {g:o.g.map(id=>gear.find(x=>x.id===id)).filter(Boolean),e:o.e.map(id=>eggs.find(x=>x.id===id)).filter(Boolean),m:o.m,s:o.s,gold:o.gold}}
function mpOfferChanged(){const T=MP.tr;if(!T)return;T.v++;T.rdy=false;T.trdy=false;T.st='open';mpTrSend({t:'off',v:T.v,o:mpOfferObj()});rX()}
function mpSanG(it){if(!it||typeof it!=='object')return null;const tp=it.tp|0;if(!(tp>=0&&tp<ITPL.length))return null;let o;try{o=JSON.parse(JSON.stringify(it))}catch(_){return null}
  for(const k in o)if(typeof o[k]==='string'&&/[<>]/.test(o[k]))delete o[k];
  o.tp=tp;o.r=Math.max(0,Math.min(4,o.r|0));o.lv=Math.max(1,Math.min(MAXLV,o.lv|0||1));o.req=Math.max(1,Math.min(MAXLV,o.req|0||1));o.up=Math.max(0,Math.min(20,o.up|0));
  o.aff=Array.isArray(o.aff)?o.aff.filter(a=>a&&AFX[a.k]&&typeof a.v==='number'&&isFinite(a.v)).slice(0,6):[];return o}
function mpSanE(eg){if(!eg||typeof eg!=='object'||!S[eg.sp])return null;let o;try{o=JSON.parse(JSON.stringify(eg))}catch(_){return null}for(const k in o)if(typeof o[k]==='string'&&/[<>]/.test(o[k]))delete o[k];
  o.tier=Math.max(0,Math.min(4,o.tier|0));o.tag=TAGS[o.sp];o.pa=Math.max(.5,Math.min(2,+o.pa||1));if(o.t0!=null&&!isFinite(o.t0))o.t0=Date.now();return o}
const mpMatOK=k=>typeof k==='string'&&k.length<40&&!!(RES[k]||Object.values(FAM).some(f=>f[0]==k)||UPM.some(u=>u[0]==k)||(typeof FAMD!='undefined'&&Object.values(FAMD).some(f=>f.mat==k)));
const mpSupOK=k=>k==='p_hp'||(typeof k==='string'&&Object.prototype.hasOwnProperty.call(SUP,k));
const mpN=n=>Math.max(0,Math.min(99999,Math.floor(+n||0)));
function mpSanOffer(o){const r={g:[],e:[],m:{},s:{},gold:0};if(!o||typeof o!=='object')return r;
  (Array.isArray(o.g)?o.g:[]).slice(0,8).forEach(x=>{const y=mpSanG(x);if(y)r.g.push(y)});(Array.isArray(o.e)?o.e:[]).slice(0,8).forEach(x=>{const y=mpSanE(x);if(y)r.e.push(y)});
  if(o.m&&typeof o.m==='object')Object.keys(o.m).slice(0,20).forEach(k=>{const n=mpN(o.m[k]);if(n&&mpMatOK(k))r.m[k]=n});
  if(o.s&&typeof o.s==='object')Object.keys(o.s).slice(0,20).forEach(k=>{const n=mpN(o.s[k]);if(n&&mpSupOK(k))r.s[k]=n});
  r.gold=Math.min(1e9,mpN(o.gold));return r}
const mpSupHave=k=>k==='p_hp'?pots:(sup[k]||0);
function mpCanPay(o){return o.g.every(id=>gear.some(x=>x.id===id))&&o.e.every(id=>eggs.some(x=>x.id===id))&&Object.keys(o.m).every(k=>(mats[k]||0)>=o.m[k])&&Object.keys(o.s).every(k=>mpSupHave(k)>=o.s[k])&&gold>=o.gold}
function mpSwap(){const T=MP.tr,o=T.me,th=T.th;if(!mpCanPay(o))return false;
  o.g.forEach(id=>{const i=gear.findIndex(x=>x.id===id);if(i>=0)gear.splice(i,1)});o.e.forEach(id=>{const i=eggs.findIndex(x=>x.id===id);if(i>=0)eggs.splice(i,1)});
  Object.keys(o.m).forEach(k=>{mats[k]-=o.m[k];if(mats[k]<=0)delete mats[k]});Object.keys(o.s).forEach(k=>{if(k==='p_hp')pots-=o.s[k];else{sup[k]-=o.s[k];if(sup[k]<=0)delete sup[k]}});gold-=o.gold;
  th.g.forEach(it=>{it.id=uid++;gear.push(it)});th.e.forEach(eg=>{eg.id=uid++;eggs.push(eg)});Object.keys(th.m).forEach(k=>mats[k]=(mats[k]||0)+th.m[k]);Object.keys(th.s).forEach(k=>giveS(k,th.s[k]));gold+=th.gold;
  T.st='done';MP.lastDone=T.id;const n=th.g.length+th.e.length+Object.keys(th.m).length+Object.keys(th.s).length+(th.gold?1:0);
  banner('🤝 TRADE COMPLETE','with '+mpName(T.p),n?'Received '+(th.g.length?th.g.length+' gear · ':'')+(th.e.length?th.e.length+' eggs · ':'')+(th.gold?th.gold+' gold · ':'')+'and more':'You sent a gift');
  try{ui();hud()}catch(_){}try{saveGame(true)}catch(_){}
  MP.tr=null;if(xwMode==='trade')closeX();return true}
function mpCheckReady(){const T=MP.tr;if(!T||T.st!=='open'||!T.rdy||!T.trdy)return;if(T.a){T.st='go';T.tries=0;T.gt=performance.now();mpTrSend({t:'go',v:T.v,tv:T.tv});rX()}}
function mpOnTrade(msg){
  if(!MP.on||msg.sameTab)return;const d=msg.data;if(!d||d.to!==MP.me||typeof d.t!=='string'||typeof d.id!=='string'||d.id.length>40)return;const from=msg.peer,T=MP.tr;
  if(d.t==='req'){if(T&&T.p===from&&T.id===d.id)return;MP.inv={from,id:d.id,t:performance.now()};mpToast();say('🤝 '+mpEsc(mpName(from))+' wants to trade.');return}
  if(d.t==='acc'){if(MP.pend&&MP.pend.p===from&&MP.pend.id===d.id){MP.pend=null;if(MP.tr)mpTradeCancel(true);if(uiOpen())closeX();mpTradeOpen(from,d.id)}return}
  if(d.t==='dec'){if(MP.pend&&MP.pend.p===from){MP.pend=null;say(mpEsc(mpName(from))+' declined the trade.')}return}
  if(d.t==='go'&&!T&&MP.lastDone===d.id){MP.room.emit('trade',{to:from,id:d.id,t:'ok'}).catch(()=>{});return}
  if(!T||T.p!==from||T.id!==d.id){if(d.t==='go')MP.room.emit('trade',{to:from,id:d.id,t:'cancel'}).catch(()=>{});return}
  if(d.t==='cancel'){MP.tr=null;if(xwMode==='trade')closeX();if(MP.inv&&MP.inv.from===from){MP.inv=null;mpToast()}say(mpEsc(mpName(from))+' cancelled the trade.');return}
  if(d.t==='off'){T.th=mpSanOffer(d.o);T.tv=d.v|0;T.trdy=false;T.rdy=false;T.st='open';rX();return}
  if(d.t==='rdy'){T.trdy=!!d.r&&(d.v|0)===T.tv&&(d.tv|0)===T.v;rX();mpCheckReady();return}
  if(d.t==='go'){if(T.a||!T.rdy||(d.v|0)!==T.tv||(d.tv|0)!==T.v){if(!T.rdy)return;return}if(!mpSwap()){mpTrSend({t:'cancel'});MP.tr=null;if(xwMode==='trade')closeX();say('Trade failed — your items changed.');return}MP.room.emit('trade',{to:from,id:d.id,t:'ok'}).catch(()=>{});return}
  if(d.t==='ok'){if(T.a&&T.st==='go'&&!mpSwap()){say('Trade failed — your items changed.');MP.tr=null}return}
}
function mpTradeClick(e){const T=MP.tr;if(!T)return;const t=e.target.closest('[data-tg],[data-te],#mpRdy,#mpCan');if(!t)return;
  if(t.id==='mpCan'){closeX();return}
  if(t.id==='mpRdy'){if(T.st!=='open')return;T.rdy=!T.rdy;mpTrSend({t:'rdy',r:T.rdy?1:0,v:T.v,tv:T.tv});rX();mpCheckReady();return}
  if(T.st!=='open')return;
  if(t.dataset.tg){const id=+t.dataset.tg,i=T.me.g.indexOf(id);if(i>=0)T.me.g.splice(i,1);else{if(T.me.g.length>=8)return say('Up to 8 gear per trade.');T.me.g.push(id)}mpOfferChanged()}
  else if(t.dataset.te){const id=+t.dataset.te,i=T.me.e.indexOf(id);if(i>=0)T.me.e.splice(i,1);else{if(T.me.e.length>=8)return say('Up to 8 eggs per trade.');T.me.e.push(id)}mpOfferChanged()}
}
$('xwB').addEventListener('change',e=>{if(xwMode!=='trade'||!MP.tr)return;const t=e.target,T=MP.tr;if(T.st!=='open')return;
  if(t.dataset.qm!=null){const k=t.dataset.qm,n=Math.min(mats[k]||0,mpN(t.value));if(n)T.me.m[k]=n;else delete T.me.m[k];mpOfferChanged()}
  else if(t.dataset.qs!=null){const k=t.dataset.qs,n=Math.min(mpSupHave(k),mpN(t.value));if(n)T.me.s[k]=n;else delete T.me.s[k];mpOfferChanged()}
  else if(t.id==='mpGold'){T.me.gold=Math.min(gold,mpN(t.value));mpOfferChanged()}});
function mpSupName(k){return k==='p_hp'?['🧪','Health Potion']:[SUP[k].i,SUP[k].n]}
function mpTheirHTML(o){let h='';
  o.g.forEach(it=>{h+=`<span class="mpch" style="--c:${RAR[it.r][1]}">${icoOf(it)} ${mpEsc(itName(it))} <small class="mut">Lv ${it.lv}</small></span>`});
  o.e.forEach(eg=>{h+=`<span class="mpch" style="--c:${RAR[eg.tier][1]}">🥚 T${eg.tier+1} ${mpEsc(eg.sp)}</span>`});
  Object.keys(o.m).forEach(k=>{h+=`<span class="mpch">${matInfo(k)[1]} ${mpEsc(k)} ×${o.m[k]}</span>`});
  Object.keys(o.s).forEach(k=>{const q=mpSupName(k);h+=`<span class="mpch">${q[0]} ${mpEsc(q[1])} ×${o.s[k]}</span>`});
  if(o.gold)h+=`<span class="mpch" style="--c:#fbbf24">🪙 ${o.gold}</span>`;return h||'<span class="mut">Nothing yet</span>'}
XR.trade=()=>{const T=MP.tr;if(!T){$('xwB').innerHTML='';return}const lk=T.st!=='open'||T.rdy;
  $('xwT').textContent='🤝 Trade with '+mpName(T.p);$('xwS').textContent=T.st==='go'?'Exchanging…':T.rdy&&T.trdy?'Both ready':T.trdy?'They are ready — check their offer and press Ready':T.rdy?'Waiting for them to press Ready…':'Pick what to give, then both press Ready';
  const sel=(a,id)=>a.indexOf(id)>=0?' sel':'';
  let g=gear.map(it=>`<span class="mpch${sel(T.me.g,it.id)}" style="--c:${RAR[it.r][1]}" data-tg="${it.id}">${icoOf(it)} ${mpEsc(itName(it))} <small class="mut">Lv ${it.lv}</small></span>`).join('')||'<span class="mut">No gear in your bag</span>';
  let e=eggs.map(eg=>`<span class="mpch${sel(T.me.e,eg.id)}" style="--c:${RAR[eg.tier][1]}" data-te="${eg.id}">🥚 T${eg.tier+1} ${mpEsc(eg.sp)}</span>`).join('')||'<span class="mut">No eggs</span>';
  const dis=lk?' disabled':'';
  let m=Object.keys(mats).filter(k=>mats[k]>0).map(k=>`<div class="mpq"><span>${matInfo(k)[1]} ${mpEsc(k)} <small class="mut">(${mats[k]})</small></span><input type="number" min="0" max="${mats[k]}" value="${T.me.m[k]||0}" data-qm="${mpEsc(k)}"${dis}></div>`).join('');
  let s=['p_hp'].concat(Object.keys(sup).filter(k=>sup[k]>0&&SUP[k])).filter(k=>mpSupHave(k)>0).map(k=>{const q=mpSupName(k);return `<div class="mpq"><span>${q[0]} ${mpEsc(q[1])} <small class="mut">(${mpSupHave(k)})</small></span><input type="number" min="0" max="${mpSupHave(k)}" value="${T.me.s[k]||0}" data-qs="${mpEsc(k)}"${dis}></div>`}).join('');
  $('xwB').innerHTML=`<div class="mpg"><div class="mpbox"><h4>Your offer ${T.rdy?'✅':''}</h4><div class="mut" style="font-size:.75rem;margin-bottom:4px">Click to add or remove. Equipped gear can't be traded.</div>
    <h4 style="margin-top:6px">Gear</h4>${g}<h4 style="margin-top:8px">Eggs</h4>${e}${m?'<h4 style="margin-top:8px">Materials</h4>'+m:''}${s?'<h4 style="margin-top:8px">Supplies</h4>'+s:''}
    <h4 style="margin-top:8px">Gold <small class="mut">(you have ${gold})</small></h4><div class="mpq"><span>🪙</span><input type="number" id="mpGold" min="0" max="${gold}" value="${T.me.gold}"${dis}></div></div>
    <div class="mpbox"><h4>${mpEsc(mpName(T.p))} offers ${T.trdy?'✅':''}</h4>${mpTheirHTML(T.th)}</div></div>`;
  $('xwF').innerHTML=`<button class="pri" id="mpRdy"${T.st!=='open'?' disabled':''}>${T.rdy?'✋ Not ready':'✅ Ready'}</button> <button id="mpCan">Cancel</button> <span class="mut dtl">If either offer changes, both players must press Ready again.</span>`;
};
