// ================= v232 the Warden kit in co-op: one fight, shared by everyone in the arena =================
// Bosses are not part of the shared-monster system (mpElig leaves them out) and the kit's arenas are not Sovereign dens (ARN), so
// the kit carries its own small relay, on the 'ev' topic beside Duskhold's messages (r -7: older versions ignore the entries).
// Everyone standing in an arena fights the same boss:
//  * the LEADER is the living player there with the lowest id (wkn232Roles; the same rule as the Sovereigns' mpBossAuth). Only the
//    leader's game runs the AI, picks moves and owns his health;
//  * ['wk232', key, 1, fighting, hp, x, z, ry, phase] four times a second: partners (D.mir) follow his place and health;
//  * ['wk232', key, 2, move, seed, x, z, ry] on every cast: partners play the same move with the same seed (their own hero is what it
//    is aimed at, and each game judges the hits on its own hero);
//  * ['wk232', key, 4, damage] partners send the damage they deal (their own copy never dies on its own: see the kill hook);
//  * ['wk232', key, 3] he is slain: everyone's copy dies and each player gets their own reward;
//  * ['wk232', key, 5] the fight has started; ['wk232', key, 6, move] a partner's own deed asks the leader for a move (wk232Req:
//    only moves marked req:1).
// A partner who has already beaten this boss still gets a copy to fight (wkn232Want), so friends can help each other.
var WKN232={pend:0,tS:0,tH:0};
function wkn232On(){try{return typeof MP!='undefined'&&!!MP.on&&!!MP.room&&Object.keys(MP.rh||{}).length>0}catch(_){return false}}
function wkn232Send(D,a){if(!wkn232On())return;try{MP.room.emit('ev',{r:-7,l:[['wk232',D.key].concat(a)]}).catch(()=>{})}catch(_){}}
function wkn232Want(D){const N=D.net;return !!(N&&N.f&&performance.now()-N.t<3000)}
function wkn232Peers(D){const out=[];if(!wkn232On())return out;let rg;try{rg=mpCurRg()}catch(_){return out}const L=D.L;
  for(const k in MP.rh){const r=MP.rh[k];if(r.pr&&r.pr.rg===rg&&r.m&&Math.hypot(r.m.position.x-L.cx,r.m.position.z-L.cz)<L.hr+8)out.push({k,alive:r.pr.hp>0})}return out}
function wkn232Roles(D,here,dt){if(!here||!wkn232On()){D.mir=0;D.auth=null;return}
  let h=hero.hp>0?MP.me:null;wkn232Peers(D).forEach(p=>{if(p.alive&&(h===null||p.k<h))h=p.k});D.auth=h;D.mir=h&&h!==MP.me?1:0;
  const e=D.e,A=D.A,now=performance.now();if(!e||e.dead||!A)return;
  if(!D.mir&&h===MP.me){if(now-WKN232.tS>250&&(A.f||now-(D.netF||0)<1500)){WKN232.tS=now;if(A.f)D.netF=now;const r=v=>Math.round(v*100)/100;wkn232Send(D,[1,A.f?1:0,Math.round(e.c.h),r(e.m.position.x),r(e.m.position.z),r(e.m.rotation.y),e.sv.ph])}}
  else if(D.mir&&WKN232.pend>=1&&now-WKN232.tH>250){WKN232.tH=now;const d=Math.round(WKN232.pend);WKN232.pend=0;wkn232Send(D,[4,d])}}
// a partner's copy: follow the leader's place, count the damage dealt here
function wkn232Follow(D,e,dt){const N=D.net,S=e.sv,m=e.m;if(!N)return;if(N.h!=null){const dl=N.h-e.c.h;if(dl>0)WKN232.pend+=dl}N.h=e.c.h;
  if(performance.now()-N.t>1500||!isFinite(N.x))return;const k=Math.min(1,dt*(S.mv?3:7));m.position.x+=(N.x-m.position.x)*k;m.position.z+=(N.z-m.position.z)*k;
  if(!S.mv){m.rotation.y+=svAng(N.ry-m.rotation.y)*Math.min(1,dt*6);if(N.ph&&N.ph!==S.ph){S.ph=N.ph;e.bs.ph=N.ph;if(D.phSync)try{D.phSync(D,N.ph)}catch(_){}}}}
// a move asked for by a player's own deed (not by the AI): the leader casts it; a partner asks the leader
function wk232Req(e,id){const D=e.wk;if(D.mir){wkn232Send(D,[6,id]);return}svEndMove(e,true);svCast(e,id)}
function wkn232In(peer,q){const D=WK232.D[q[1]],ty=q[2];if(!D||typeof peer!='string'||!wk232In(D))return;const N=D.net||(D.net={t:0}),e=D.e,A=D.A,ok=e&&!e.dead&&A&&enemies.includes(e);
  if(ty===1){if(D.auth!=null&&peer!==D.auth)return;if(!isFinite(q[4])||!isFinite(q[5])||!isFinite(q[6]))return;N.t=performance.now();N.f=q[3]?1:0;N.hp=+q[4];N.x=+q[5];N.z=+q[6];N.ry=+q[7]||0;N.ph=q[8]|0;
    if(!ok||!D.mir)return;e.c.h=Math.max(1,Math.min(M(e.c),N.hp-WKN232.pend));N.h=e.c.h;
    if(N.f&&!A.f&&hero.hp>0)wk232Start(D,e);else if(!N.f&&A.f&&D.ft>2.5)wk232Reset(D,true)}
  else if(ty===2){const id=q[3];if(!ok||!D.mir||peer!==D.auth||typeof id!='string'||!Object.prototype.hasOwnProperty.call(D.B.M,id))return;if(!A.f){if(hero.hp<=0)return;wk232Start(D,e)}
    const S=e.sv;if(S.mv)svEndMove(e,true);if(isFinite(q[5])&&isFinite(q[6])){e.m.position.x=+q[5];e.m.position.z=+q[6];e.m.rotation.y=+q[7]||0}S.on=true;svStart(e,id,Math.max(1,Math.min(998,q[4]|0)))}
  else if(ty===3){if(!ok||D.auth===MP.me&&hero.hp>0&&!D.mir&&peer>MP.me)return;D.netWin=1;e.c.h=0;e.dead=1;try{e.hb.visible=false}catch(_){}kill(e)}
  else if(ty===4){const d=+q[3];if(!ok||D.mir||!(d>0))return;if(!A.f)wk232Start(D,e);e.c.h-=Math.min(d,M(e.c)*.25);e.m.flT=nowP();e.agg=1;if(e.c.h<=0){e.c.h=0;e.dead=1;try{e.hb.visible=false}catch(_){}kill(e)}}
  else if(ty===5){if(ok&&!A.f&&hero.hp>0)wk232Start(D,e)}
  else if(ty===6){const id=q[3];if(!ok||D.mir||!A.f||typeof id!='string'||!Object.prototype.hasOwnProperty.call(D.B.M,id)||!D.B.M[id].req)return;svEndMove(e,true);svCast(e,id)}}
if(typeof mpOnEV=='function'){const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&d.r===-7&&Array.isArray(d.l))for(const q of d.l.slice(0,8))if(Array.isArray(q)&&q[0]==='wk232')wkn232In(msg.peer,q)}catch(e){if(!WK232.err++)console.error('wk net in',e)}return f.apply(this,arguments)}}
// the leader relays every cast; a partner's copy never picks a move itself
{const f=svCast;svCast=function(e,id,seed){if(e&&e.wk&&wkn232On()){const D=e.wk;if(D.mir)return;seed=Math.max(1,Math.min(998,Math.round(seed||(1+Math.random()*997))));const r=f.call(this,e,id,seed);
    const q=v=>Math.round(v*100)/100;wkn232Send(D,[2,id,seed,q(e.m.position.x),q(e.m.position.z),q(e.m.rotation.y)]);return r}return f.apply(this,arguments)}}
// a partner's copy dies only when the leader says so
{const f=kill;kill=function(e){if(e&&e.wk&&e.wk.mir&&!e.wk.netWin){e.dead=0;e.c.h=1;return}return f.apply(this,arguments)}}
