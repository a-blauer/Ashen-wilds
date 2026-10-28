// ================= v165 co-op: the Searing Sands main quest played together =================
// Playing together (partners in the same instance, the v58 relay: MP 'ev', entries only from partners in my region MP.rg), every
// chapter is one shared event (Burningeye's v151 pattern, 3180):
//  · I  The Buried Temple: every spadeful is everyone's (['s5d', a, b]); partners swap their whole dig now and then and keep the most
//    (['s5D', strokes]); the doors uncovered for all (['s5u']). Qarsul is one Living Dune for everyone: the DRIVER (the lowest
//    peer id among the standing heroes in the yard who have him there) runs his AI; each move goes out with its seed and his spot
//    (['q1c', …]), his health, phase and posture every 120 ms (['q1s', …]); the others play the same moves on their copy and glide
//    between moves; their damage goes to the driver (['q1h', dmg]). He rises for everyone (['q1f']), the heart's mounds are the same
//    on every screen (seeded), a partner who breaks the right mound or bursts a wrong one tells the driver (['q1m', slot, right]).
//    He is beaten back only when every hero in the yard is down (['q1r']); his fall is everyone's (['q1k']).
//  · II The Last Warden: urns, the pieces, the laying and the waking are shared (['s5n'] ['s5t'] ['s5l'] ['s5w']). The region host
//    runs the rift defence: anyone may begin it (a partner asks ['s5ra']; the host starts and tells all ['s5r', 'start']), the
//    channel and Kheprit's health go out every 150 ms (['s5re', t, hp, open]); his fall (['s5r', 'fall']). The cult is the host's
//    shared monsters. Anyone may run through the open rift.
//  · III The Sandskimmer: blows on the salt (['s5m', i]), broken columns (['s5c', i]), parts (['s5p', p]) and the build (['s5b']).
//  · The Sandstorm Run: whoever boards first (or the host, asked: ['s5ga']) sorts the crews from everyone in the salt-cutters' yard
//    (['s5go', crews]): two to a machine (the one who boarded drives the first), an odd one out gets Cheddar as driver. Each machine
//    is simulated by its driver (or, with Cheddar, by its gunner) and sent 10 times a second (['s5v', …]); a gunner's shots show on
//    every screen (['s5f', id, x, z]). The host's world runs the creatures (scarabs, scorpions are shared monsters; worms and venom
//    are sent: ['s5wy'] ['s5st']) and their damage to machines it does not drive goes to the driver (['s5h', id, d]). The first
//    machine into the cave takes everyone to the Den (['s5win']).
//  · Credit for the whole group, wherever they are (['bq165', key], three times): Qarsul slain, the rift opened, the Sandskimmer
//    built, the Run done.
// Playing solo nothing changes (co151On() is false).
var CO165={rx:0,ap:0,rk:0,hq:0,tH:0,tS:0,tD:0,tR:0,tV:0,got:{},cq:[],err:0};
function co165Rx(f){CO165.rx++;try{return f()}finally{CO165.rx--}}
function co165Send(e){if(!CO165.rx)co151Send(e)}
const co165R=v=>Math.round(v*100)/100;
// ---------------- credit ----------------
function co165Credit(key){if(typeof MP=='undefined'||!MP.on||!MPX.be||CO165.rx||CO165.got[key])return;CO165.got[key]=1;CO165.cq.push({key,n:3,t:0})}
function co165Flush(now){if(!CO165.cq.length)return;const l=[];CO165.cq.forEach(q=>{if(now-q.t>700){q.t=now;q.n--;l.push(['bq165',q.key,String(hero.name||'Hero').slice(0,20)])}});
  CO165.cq=CO165.cq.filter(q=>q.n>0);if(l.length)try{MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}catch(_){}}
function co165Apply(key,by){const who=mpEsc(String(by||'A partner').slice(0,20));co165Rx(()=>{
  if(key==='c1'){if(SS165.c1.st<3){SS165.c1.st=3;SS165.trkK='';if(QS165.e&&!QS165.e.dead&&!(QS165A&&QS165A.f))qs165Reset(false);try{sd165Sync()}catch(_){}say('🏜️ '+who+' slew Qarsul, the Living Dune: the Sunken Temple stands open for you too.')}}
  else if(key==='c2'){if(SS165.c2.st<4&&!RF165.E){SS165.c2.st=4;SS165.trkK='';try{if(KH165W.built)kh165Sync()}catch(_){}say('🌀 '+who+' went through Kheprit’s rift: the way to the Salt Wastes is open for you too.')}}
  else if(key==='c3'){if(!SS165.c3.built){SS165.c3.built=1;SS165.c3.got=31;SS165.trkK='';try{cs165Parts();sc165Sync()}catch(_){}say('🛷 '+who+' built the Sandskimmer in the salt-cutters’ yard.')}}
  else if(key==='run'){if(!SS165.run.st){SS165.run.st=1;SS165.trkK='';say('🌪️ '+who+' rode through the sandstorm to the Den: the Sandskimmer will take you straight there.')}}})}
{const f=qs165Won;qs165Won=function(e){const r=f.apply(this,arguments);try{co165Credit('c1')}catch(_){}return r}}
{const f=cs165BuildTick;cs165BuildTick=function(dt){const b=SS165.c3.built;const r=f.apply(this,arguments);try{if(!b&&SS165.c3.built)co165Credit('c3')}catch(_){}return r}}
// ================= I: the dig =================
function co165Dig(a,b){if(co151On())co165Send(['s5d',co165R(a),co165R(b)])}
function co165Uncover(){if(co151On())co165Send(['s5u'])}
function co165DigSync(now){if(!co151On()||!ss165Here(0)||SS165.c1.st!==1||!SS165.c1.dig.length||now-CO165.tD<4000)return;CO165.tD=now;co165Send(['s5D',SS165.c1.dig.slice(-600).join(',')])}
function co165OnDigAll(str){if(typeof str!=='string'||SS165.c1.st>=2||!SD165.g)return;const L=str?str.split(',').map(v=>v|0).slice(0,600):[];if(L.length<=SS165.c1.dig.length+3)return;
  SS165.c1.dig=L;SS165.trkK='';if(SD165.g&&SD165.D){try{sd165Sync(true)}catch(_){try{sd165Replay()}catch(_){}}}}
// ================= I: Qarsul, one Living Dune for everyone =================
function qs180Has(){const e=QS165.e;return !!(e&&!e.dead&&e.sv&&qs165Here())}
function qs180Drv(){if(!co151On())return typeof MP!='undefined'?MP.me:'';let h=qs180Has()&&co151Me()?MP.me:null;
  for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&p.q1&&p.hp>0&&!p.dn&&(h===null||k<h))h=k}return h}
function qs180Auth(){if(!co151On())return true;const d=qs180Drv();return d===null||d===MP.me}
function qs180Glide(e,dt){const m=e.m,S=e.sv;if(e.nry!=null){const da=svAng(e.nry-m.rotation.y),t=5*dt;m.rotation.y+=Math.max(-t,Math.min(t,da))}
  if(e.nx!=null&&dt>0){const dx=e.nx-m.position.x,dz=e.nz-m.position.z,l=Math.hypot(dx,dz);if(l>10){m.position.x=e.nx;m.position.z=e.nz}else{const k=Math.min(1,dt*6);m.position.x+=dx*k;m.position.z+=dz*k}S.walkSp=l>.3?2:0}}
function qs180End(){if(!co151On())return hero.hp<=0||!qs165Here()||(typeof AWD!='undefined'&&AWD.dead);if(!qs165Here())return true;if(!qs180Auth())return false;return !co151Standing()}
function qs180Ended(){if(co151On()&&qs180Auth())co165Send(['q1r'])}
function qs180Formed(){if(co151On())co165Send(['q1f'])}
{const f=svCast;svCast=function(e,id,seed){if(e&&e.qs165&&co151On()&&!qs180Auth()&&!CO165.rx)return;const r=f.apply(this,arguments);
  try{if(e&&e.qs165&&co151On()&&!CO165.rx&&e.sv&&e.sv.mv&&e.sv.mv.id===id){const m=e.m;co165Send(['q1c',id,e.sv.mv.seed,co165R(m.position.x),co165R(m.position.z),co165R(m.rotation.y),e.sv.ph|0])}}catch(_){}return r}}
// a follower's hits go to the driver (shown here, applied there); its mound blows too
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.qs165&&!e.dead&&co151On()&&!qs180Auth()&&!CO165.ap){d=Math.max(0,Math.round(d));if(!isFinite(d)||!d)return;
    CO165.hq+=d;e.lhT=performance.now();e.c.h+=1e9;try{return f(e,d,s,crit,dot)}finally{e.c.h=Math.max(1,e.c.h-1e9)}}
  if(e&&e.qsMound&&co151On()&&!CO165.rx&&!e.popped){const was=QS165.H;const r=f.apply(this,arguments);if(was&&(e.popped||e.dead||!e.qsRight))co165Send(['q1m',e.qsI|0,e.qsRight?1:0]);return r}
  return f.apply(this,arguments)}}
{const f=kill;kill=function(e){const was=e&&e.qsMound&&!e.popped;const r=f.apply(this,arguments);try{if(e&&e.qs165){CO165.kT=performance.now();if(co151On()&&!CO165.rk){co165Send(['q1k']);co165Send(['q1k'])}}
    if(was&&co151On()&&!CO165.rx)co165Send(['q1m',e.qsI|0,1])}catch(_){}return r}}
function qs180Sync(now){const e=QS165.e;if(!co151On()||!qs180Auth()||!qs180Has()||now-CO165.tS<120||now-(CO165.kT||-1e9)<10000)return;CO165.tS=now;const S=e.sv,m=e.m;
  co165Send(['q1s',Math.round(e.c.h),S.ph|0,co165R(m.position.x),co165R(m.position.z),co165R(m.rotation.y),Math.round((S.po||0)*100),QS165A&&QS165A.f?1:0,S.mv?S.mv.id:'',S.mv?S.mv.seed|0:0,S.mv?Math.round(S.mv.t*100):0])}
function qs180OnSync(q){if(!qs165Here()||qs180Auth())return;let e=QS165.e;if(!e||e.dead||!enemies.includes(e)){if(performance.now()-(CO165.kT||-1e9)<10000||!(+q[1]>0)||SS165.c1.st!==2)return;co165Rx(()=>{if(!QS165.form)qs165Form()});return}
  const S=e.sv,now=performance.now(),[_,h,ph,x,z,ry,po,on]=q;if(!isFinite(x)||!isFinite(z))return;e.nx=+x;e.nz=+z;e.nry=+ry||0;const hh=Math.max(1,Math.min(M(e.c),+h||1));e.c.h=now-(e.lhT||0)<600?Math.min(e.c.h,hh):hh;
  if((ph|0)===2&&S.ph!==2&&!(S.mv&&S.mv.id==='awaken')){S.ph=2;e.bs.ph=2;try{qs165Storm(true)}catch(_){}}S.po=Math.max(0,Math.min(1,(po|0)/100));
  if(on&&!(QS165A&&QS165A.f))co165Rx(()=>qs165Start(e));
  {const id=q[8],sd=q[9]|0,mt=(q[10]|0)/100;if(typeof id==='string'&&QS165MV[id]&&sd&&mt<.6&&e.q1sd!==sd&&!(S.mv&&S.mv.seed===sd)){e.q1sd=sd;co165Rx(()=>{svEndMove(e,true);svStart(e,id,sd)})}}
  if(Math.hypot(e.m.position.x-x,e.m.position.z-z)>14){e.m.position.x=+x;e.m.position.z=+z}}
function qs180OnCast(q){if(!qs165Here())return;const e=QS165.e;if(!e||e.dead||!e.sv)return;const [_,id,seed,x,z,ry,ph]=q;if(typeof id!=='string'||!QS165MV[id])return;
  const m=e.m;if(isFinite(x)&&isFinite(z)&&Math.hypot(m.position.x-x,m.position.z-z)<14){m.position.x=+x;m.position.z=+z;if(isFinite(ry))m.rotation.y=+ry}e.nx=+x;e.nz=+z;e.nry=+ry||0;
  if(ph===2&&e.sv.ph!==2&&id!=='awaken'){e.sv.ph=2;e.bs.ph=2}if(!(QS165A&&QS165A.f))co165Rx(()=>qs165Start(e));e.sv.on=true;
  if(e.q1sd===(seed|0)&&e.sv.mv&&e.sv.mv.id===id)return;e.q1sd=seed|0;co165Rx(()=>{svEndMove(e,true);svStart(e,id,Math.max(1,seed|0))})}
function qs180OnKill(){const e=QS165.e;if(!e||e.dead||!qs165Here())return;CO165.rk=1;MP.rk=1;try{e.c.h=0;e.dead=1;if(e.hb)e.hb.visible=false;kill(e)}finally{CO165.rk=0;MP.rk=0}}
function qs180OnMound(i,right){const s=QS165.mounds.find(q=>q.qsI===i&&!q.popped);if(!s)return;co165Rx(()=>{if(right&&s.qsRight)qs165MoundBreak(s);else if(!s.qsRight)qs165MoundHit(s)})}
// ================= II: the urns, the pieces, the waking =================
function co165Urn(i){if(co151On())co165Send(['s5n',i|0])}
function co165Take(p){if(co151On())co165Send(['s5t',p|0])}
function co165Lay(mask){if(co151On())co165Send(['s5l',mask|0])}
function co165Wake(){if(co151On())co165Send(['s5w'])}
function co165OnLay(mask){const C=SS165.c2;mask&=2047;const add=mask&~C.lay;if(!add)return;if(!KH165W.built||!ss165Here(1)){C.lay|=add;C.got&=~add;SS165.trkK='';return}
  const e=kh165Laid();for(let i=0;i<11;i++)if(add&(1<<i)){kh165PartShow(e.sv.R,i,true);const j=e.sv.R.part[i]||e.sv.R.J.torso,p=new THREE.Vector3();j.getWorldPosition(p);burst(p,0xffd070,20,1,1.4,.6)}
  C.lay|=add;C.got&=~add;SS165.trkK='';if(C.lay===2047&&C.st<1)qs165After(1.4,()=>kh165Wake(false))}
// ================= II: the rift (the host runs it) =================
function co165Ask(k){if(k==='rf'&&nowP()-(CO165.tR||0)>800){CO165.tR=nowP();co165Send(['s5ra'])}}
function co165Rift(k){if(!co151On())return;co165Send(['s5r',k])}
function co165RiftSync(now){const E=RF165.E;if(!E||!co151On()||!co151Host()||now-CO165.tS<150)return;CO165.tS=now;co165Send(['s5re',Math.round(E.t*10),Math.round(E.hp),E.esc|0,E.go|0])}
function co165OnRift(q){if(co151Host()||!ss165Here(1)||hero.hp<=0||(typeof RV148!='undefined'&&RV148.down))return;let E=RF165.E;if(!E){if(SS165.c2.st!==2||!KH165W.e)return;co165Rx(()=>rf165Start(false));E=RF165.E;if(!E)return}
  E.t=Math.max(0,(q[1]|0)/10);E.hp=Math.max(0,Math.min(RF165.hpM,q[2]|0));if(q[4]&&!E.go){E.go=1;try{const K=KH165W.e,P=rf165KhSpot();K.m.position.set(P.x,P.y,P.z);svStart(K,'chan',5);K.sv.chg=1}catch(_){}}}
// a partner's copy of the rift does not spawn or hurt (the host's world does)
{const f=rf165Spawn;rf165Spawn=function(n){if(co151On()&&!co151Host())return;return f.apply(this,arguments)}}
// ================= III: the salt, the parts, the build =================
function co165Mine(i){if(co151On())co165Send(['s5m',i|0])}
function co165Col(i){if(co151On())co165Send(['s5c',i|0])}
function co165Part(p){if(co151On())co165Send(['s5p',p|0])}
function co165Build(){if(co151On())co165Send(['s5b'])}
// ================= the Sandstorm Run: crews, machines, creatures =================
function co165Mates(){const L=[];if(!co151On())return L;for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&p.hp>0&&!p.dn)L.push(k)}return L.sort()}
// sort the crews: the one who boarded drives the first machine; then two by two; an odd one out shoots with Cheddar driving
function co165Crews(first){const all=[first].concat([MP.me].concat(co165Mates()).filter(k=>k!==first).sort()),C=[];for(let i=0;i<all.length;i+=2){const d=all[i],g=all[i+1];C.push(g?{id:'v'+C.length,drv:d,gun:g}:{id:'v'+C.length,drv:'chd',gun:d})}return C}
function co165RunAsk(){if(!co151On()||!co165Mates().length)return false;if(co151Host()){co165RunGo(co165Crews(MP.me))}else co165Send(['s5ga']);return true}
function co165RunGo(crews){co165Send(['s5go',JSON.stringify(crews)]);co165RunUse(crews)}
function co165RunUse(crews){const me=MP.me,mine=crews.map(c=>({id:c.id,drv:c.drv===me?'me':c.drv,gun:c.gun===me?'me':c.gun}));if(!mine.some(c=>c.drv==='me'||c.gun==='me'))return;if(SR165.on)return;co165Rx(()=>sr165Go(mine))}
// who simulates a machine: its driver, or with Cheddar driving, its gunner
function co165Sim(V){return V.drv==='me'||(V.drv==='chd'&&(V.gun==='me'||!co151On()))}
// damage: walls, rocks, spires, traps, scrapes are the simulator's own; creatures' are the host's (sent to the simulator)
{const f=sr165Hurt;sr165Hurt=function(V,d,why){if(!co151On()||CO165.ap)return f.apply(this,arguments);const own=/^(wall|rock|spire|trap|scrape|test)$/.test(why);
  if(own){if(co165Sim(V))return f.apply(this,arguments);return}
  if(!co151Host())return;if(co165Sim(V))return f.apply(this,arguments);if(V&&V.id)CO165.vh[V.id]=(CO165.vh[V.id]||0)+d}}
CO165.vh={};
function co165VSync(now){if(!SR165.on||!co151On()||now-CO165.tV<100)return;CO165.tV=now;SR165.V.forEach(V=>{if(!co165Sim(V))return;co165Send(['s5v',V.id,co165R(V.x),co165R(V.z),co165R(V.h),co165R(V.v),V.boost|0,co165R(V.st),Math.round(V.hp),Math.round(V.s),co165R(V.aY),co165R(V.aP),V.wreck|0])});
  // a gunner's aim goes to the driver's screen
  const me=SR165.me;if(me&&me.gun==='me'&&!co165Sim(me))co165Send(['s5a',me.id,co165R(me.aY),co165R(me.aP)]);
  for(const id in CO165.vh){const d=CO165.vh[id];if(d>0)co165Send(['s5h',id,Math.round(d*10)/10]);delete CO165.vh[id]}}
function co165Shot(V,A){if(co151On())co165Send(['s5f',V.id,co165R(A.x),co165R(A.z)])}
function co165Worm(W){if(co151On()&&co151Host())co165Send(['s5wy',Math.round(W.s*10)/10,co165R(W.o0),co165R(W.o1),co165R(W.a.x),co165R(W.a.z),co165R(W.b.x),co165R(W.b.z)])}
{const f=sr165Sting;sr165Sting=function(from,x,z,T){if(co151On()&&co151Host()&&!CO165.rx)co165Send(['s5st',co165R(from.x),co165R(from.y),co165R(from.z),co165R(x),co165R(z),co165R(T)]);return f.apply(this,arguments)}}
function co165RunWin(){co165Credit('run');if(co151On())co165Send(['s5win'])}
// ================= presence and the messages =================
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.q1=qs180Has()?1:0}catch(_){}}return f.apply(this,arguments)}}
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)){
    for(const q of d.l.slice(0,60)){if(!Array.isArray(q)||typeof q[0]!=='string')continue;const t=q[0];
      if(t==='bq165'){if(typeof q[1]==='string'&&/^(c1|c2|c3|run)$/.test(q[1])&&!CO165.got[q[1]]){CO165.got[q[1]]=1;co165Apply(q[1],q[2]||mpName(msg.peer))}continue}
      if(!/^(s5|q1)/.test(t)||d.r!==MP.rg||!co151Peer(msg))continue;const fromHost=msg.peer===MP.host,iHost=MP.host===MP.me;
      co165Rx(()=>{
      // I
      if(t==='s5d'){if(SD165.g&&SS165.c1.st<2&&isFinite(q[1])&&isFinite(q[2])){SS165.c1.st=1;sd165Dig(+q[1],+q[2],false)}}
      else if(t==='s5D')co165OnDigAll(q[1]);
      else if(t==='s5u'){if(SS165.c1.st<2&&SD165.g)sd165Uncover(false);else if(SS165.c1.st<2)SS165.c1.st=2}
      else if(t==='q1h'){if(qs180Auth()&&QS165.e&&!QS165.e.dead){const dm=Math.max(0,Math.min(1e6,+q[1]||0));if(dm){CO165.ap=1;try{hurt(QS165.e,dm,{col:0xe8c890},false,true)}finally{CO165.ap=0}}}}
      else if(t==='q1k')qs180OnKill();
      else if(t==='q1m'){if(qs180Auth())qs180OnMound(q[1]|0,!!q[2]);else qs180OnMound(q[1]|0,!!q[2])}
      else if(t==='q1f'){if(qs165Here()&&SS165.c1.st===2&&!QS165.form&&!qs165Alive())qs165Form()}
      else if(msg.peer===qs180Drv()||!qs180Auth()&&(qs180Has()||t==='q1s')||(t==='q1s'&&!qs180Has())){
        if(t==='q1c')qs180OnCast(q);else if(t==='q1s')qs180OnSync(q);else if(t==='q1r'){if(QS165A&&QS165A.f)qs165Reset(true)}}
      // II
      if(t==='s5n'){const i=q[1]|0;if(i>=0&&i<14&&!(SS165.c2.urn&(1<<i)))kh165UrnBreak(i,false)}
      else if(t==='s5t'){const p=q[1]|0;if(p>=0&&p<11)kh165Take(p,false)}
      else if(t==='s5l')co165OnLay(q[1]|0);
      else if(t==='s5w'){if(SS165.c2.st<1&&KH165W.built)kh165Wake(false);else if(SS165.c2.st<1)SS165.c2.st=2}
      else if(t==='s5ra'){if(iHost&&!RF165.E&&SS165.c2.st===2&&ss165Here(1))setTimeout(()=>{if(!RF165.E)rf165Start(true)},0)}
      else if(t==='s5r'){if(fromHost){if(q[1]==='start'&&!RF165.E&&ss165Here(1)&&SS165.c2.st===2&&KH165W.e)rf165Start(false);else if(q[1]==='fall'&&RF165.E)rf165Stop('fall');else if(q[1]==='open'&&RF165.E&&SS165.c2.st<3){SS165.c2.st=3;SS165.trkK=''}else if(q[1]==='quiet'&&RF165.E)rf165Stop('quiet')}}
      else if(t==='s5re'){if(fromHost)co165OnRift(q)}
      // III
      else if(t==='s5m'){const i=q[1]|0;if(SC165.cols[i])sc165Hit(i,false)}
      else if(t==='s5c'){const i=q[1]|0;if(i>=0&&i<5)sc165Break(i,false)}
      else if(t==='s5p'){const p=q[1]|0;if(p>=0&&p<5)sc165Take(p,false)}
      else if(t==='s5b'){if(!SS165.c3.built&&CS165.R){SS165.c3.got=31;cs165Assemble(false)}}
      // the Run
      else if(t==='s5ga'){const pr=msg.peer;if(iHost&&!SR165.on&&SS165.c3.built)setTimeout(()=>{if(!SR165.on)co165RunGo(co165Crews(pr))},0)}
      else if(t==='s5go'){let C=null;try{C=JSON.parse(String(q[1]||''))}catch(_){}if(Array.isArray(C)&&C.length<=8&&ss165Here(2))co165RunUse(C.filter(c=>c&&typeof c.id==='string'))}
      else if(t==='s5v'){const V=SR165.V.find(o=>o.id===q[1]);if(V&&V.drvOrig===msg.peer&&V.drv==='chd'&&V.gun==='me'){V.drv=V.drvOrig;V.drvOrig=null;if(V.chd){V.chd.root.parent&&V.chd.root.parent.remove(V.chd.root);V.chd=null}say('🐭 Cheddar hands the wheel back.')}
        if(V&&!co165Sim(V)){V.net={x:+q[2],z:+q[3],h:+q[4],v:+q[5],b:q[6]|0,st:+q[7],hp:+q[8],s:+q[9]};V.hp=+q[8];V.netT=performance.now();if(V.gun!=='me'){V.aY=+q[10];V.aP=+q[11]}if(q[12]&&!V.wreck){V.wreck=1;burst(gY(V.m.position,1.5),0xff8a3a,60,4,3,.8)}else if(!q[12])V.wreck=0}}
      else if(t==='s5a'){const V=SR165.V.find(o=>o.id===q[1]);if(V&&V.gun!=='me'){V.aY=+q[2]||0;V.aP=+q[3]||0}}
      else if(t==='s5f'){const V=SR165.V.find(o=>o.id===q[1]);if(V&&isFinite(q[2])&&isFinite(q[3])){V.aim=new THREE.Vector3(+q[2],V.y+.9,+q[3]);V.fT=0;sr165Fire(V,false)}}   // a partner's own shells hurt the host's monsters through their copies
      else if(t==='s5h'){const V=SR165.V.find(o=>o.id===q[1]);if(V&&co165Sim(V)){CO165.ap=1;try{sr165Hurt(V,Math.max(0,Math.min(200,+q[2]||0)),'host')}finally{CO165.ap=0}}}
      else if(t==='s5wy'){if(fromHost&&SR165.on)sr165Worm(+q[1],+q[2],+q[3],false,[+q[4],+q[5],+q[6],+q[7]])}
      else if(t==='s5st'){if(fromHost&&SR165.on){const from=new THREE.Vector3(+q[1],+q[2],+q[3]);sr165Sting(from,+q[4],+q[5],+q[6]);const g=SR165F.st[SR165F.st.length-1];if(g)g.noHit=1}}
      else if(t==='s5win'){if(SR165.on&&SR165.ph!=='win')sr165Win()}})}}}catch(err){if(!CO165.err++)console.warn('v165 co-op',err)}
  return f.apply(this,arguments)}}
// a partner's venom glob is only a sight here (the host's world hurts with it)
{const f=sr165StingTick;sr165StingTick=function(dt){if(co151On()&&!co151Host()){SR165F.st.forEach(q=>q.noHit=1)}return f.apply(this,arguments)}}
// ================= the tick =================
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(typeof MP!='undefined'&&MP.on){const t=performance.now();
    if(CO165.hq>0&&t-CO165.tH>150){CO165.tH=t;co165Send(['q1h',CO165.hq]);CO165.hq=0}
    qs180Sync(t);co165DigSync(t);co165RiftSync(t);co165VSync(t);co165Flush(t);
    // a machine whose driver went quiet for 3 s: Cheddar takes the helm (its gunner's world drives it now)
    if(SR165.on)SR165.V.forEach(V=>{if(V.gun==='me'&&V.drv!=='chd'&&V.drv!=='me'&&V.netT&&t-V.netT>3000){V.drvOrig=V.drv;V.drv='chd';V.net=null;if(!V.chd)try{const C=chd132Model({game:true});C.root.scale.setScalar(CHQ132_SC*1.15);V.R.J.seatD.add(C.root);V.chd=C}catch(_){}say('🐭 Cheddar grabs the wheel!')}});
    const g=qs180Has()?1:0;if(g!==CO165.q1){CO165.q1=g;MP.lastPres=''}}}catch(err){if(!CO165.err++)console.warn('v165 co-op tick',err)}return r}}
// leaving the group: what was sent or heard is forgotten (a new group gets it again)
{const f=mpSolo;mpSolo=function(){const r=f.apply(this,arguments);CO165.got={};CO165.cq=[];CO165.hq=0;CO165.vh={};return r}}
