// ================= v236 co-op difficulty: the game gets harder for every extra player in your zone instance =================
// The owner (Nov 15 2026): "think of a system that makes the game harder when you are playing with multiple people. The game
// should get harder for each additional person to accomidate for the extra damage and pets." Approved numbers:
//   per extra player in the same instance (MP.others, at most CS236.max):
//     normal enemies            +60% health                              (CS236.r.norm)
//     elites, camp leaders      +75% health                              (CS236.r.elite)
//     Sovereigns, mini bosses,  +85% health (the posture bar is a share of health, so staggers keep their pace),
//     Wardens (boss flag / the  +8% damage dealt                         (CS236.r.boss, CS236.dmg)
//     v141 Sovereign kit e.sv)
//     defence events            +4 creatures on the field at once, spawning 30% faster (CS236.ev, CS236.evS; the Unsealing 3733
//                               already allowed 6 more for the first partner, the Rift 3283). Their creatures keep their health
//                               (Ser Morvaine counts as an elite).
// How: the factor multiplies the creature's own max health (c.st.hp; c._cs = the factor on it now, c._csX = extra players it
// stands for). It only ever changes while the creature is at full health (cs236Upd, twice a second from eTick): a partner who
// joins or leaves mid-fight does not move a health bar that has already been hurt; a creature that resets to full takes the
// count of that moment.
// Co-op:
//   * shared monsters (mpElig: the region host's): the host sets the factor and sends it as the 12th field of each 'es' entry
//     (factor × 100; 0520). A partner's copy takes it from there (cs236Mir). An older partner ignores the field: its bar reads
//     full until the health falls under its own smaller maximum.
//   * bosses and other creatures every game makes for itself (Sovereigns, mini bosses, Wardens, minions): each game works the
//     factor out from the players it sees in the instance. So that a late joiner agrees with a fight already under way, a game
//     with a hurt boss says so in its presence (p.cs236 = players counted, 0 = none); the others take the count of the lowest
//     peer id that says one (cs236Fight).
//   * the target frame shows 👥×N on a scaled creature (tgtHud wrapper).
var CS236={r:{norm:.6,elite:.75,boss:.85},dmg:.08,max:3,ev:4,evS:.3,err:0};
// extra players in my zone instance right now
function cs236Live(){try{if(typeof MP=='undefined'||!MP.on||!(MP.rg>=0))return 0;return Math.max(0,Math.min(CS236.max,MP.others|0))}catch(_){return 0}}
function cs236Kind(e){if(!e||!e.c||!e.c.st||e.bfx)return null;
  if(e.us205)return e.us205==='brk'?'elite':null;if(e.rf165)return null;
  if(e.boss||e.sv)return 'boss';return e.c.al?'elite':'norm'}
// the count a hurt boss in this game is locked to (players, 0 = none): goes out in my presence
function cs236Lock(){let v=0;try{enemies.forEach(e=>{if(!e||e.dead||e.mir||!e.c||mpElig(e)||!cs236Kind(e))return;if(e.c.h<M(e.c)-1)v=Math.max(v,(e.c._csX|0)+1)})}catch(_){}return v}
// extra players for the creatures every game makes for itself
function cs236Fight(){try{if(typeof MP=='undefined'||!MP.on||!(MP.rg>=0))return 0;let id=null,n=0;const v=cs236Lock();if(v){id=MP.me;n=v}
    for(const k in MP.rh){const r=MP.rh[k],c=r&&r.pr&&r.pr.rg===MP.rg?r.pr.cs236|0:0;if(c>0&&(id===null||k<id)){id=k;n=c}}
    return n?Math.max(0,Math.min(CS236.max,n-1)):cs236Live()}catch(_){return 0}}
function cs236Set(e,k,x){const c=e.c,cur=c._cs||1;if(!(k>0)||!isFinite(k))return;if(Math.abs(k-cur)>1e-6){c.st.hp*=k/cur;if(e.sh>0)e.sh*=k/cur}c._cs=k;c._csX=x|0}
function cs236Upd(e){if(e.mir)return;const kind=cs236Kind(e);if(!kind)return;const c=e.c;let x;
  if(mpElig(e)){if(typeof MP!='undefined'&&MP.on&&MP.others&&MP.host!==MP.me)return;x=cs236Live()}else x=cs236Fight();
  const want=1+CS236.r[kind]*x,cur=c._cs||1;if(Math.abs(want-cur)<1e-6){c._csX=x;return}
  if(c.h<M(c)-1)return;   // hurt: it keeps what it has
  cs236Set(e,want,x);c.h=M(c)}
// a partner's copy of a shared monster: the host's factor (× 100)
function cs236Mir(e,cs){if(!e||!e.c||!e.c.st)return;const k=typeof cs==='number'&&cs>=100&&cs<=100*(1+CS236.r.boss*CS236.max)+1?cs/100:1,kind=cs236Kind(e)||'norm';
  if(Math.abs(k-(e.c._cs||1))>1e-6||e.c._csX==null)cs236Set(e,k,Math.round((k-1)/CS236.r[kind]))}
{const f=eTick;eTick=function(e,dt,now){try{if(e&&!e.dead&&e.c&&now-(e._csT||0)>500){e._csT=now;cs236Upd(e)}}catch(err){if(!CS236.err++)console.warn('v236 scaling',err)}return f.apply(this,arguments)}}
// bosses hit harder: +8% per extra player (the hero through hitHero, companions through hitTarget)
function cs236Dmg(e){return e&&e.c&&e.c._csX>0&&cs236Kind(e)==='boss'?1+CS236.dmg*e.c._csX:1}
{const f=hitHero;hitHero=function(e,mult,mt){try{const k=cs236Dmg(e);if(k!==1&&typeof mult=='number'){const a=Array.prototype.slice.call(arguments);a[1]=mult*k;return f.apply(this,a)}}catch(_){}return f.apply(this,arguments)}}
{const f=hitTarget;hitTarget=function(e,tg,mult,mt){try{const k=tg!==pl?cs236Dmg(e):1;if(k!==1){const a=Array.prototype.slice.call(arguments);a[2]=(mult||1)*k;return f.apply(this,a)}}catch(_){}return f.apply(this,arguments)}}
// defence events: more creatures at once, and sooner (base = the partners the event already allows for)
function cs236EvCap(base){return CS236.ev*Math.max(0,cs236Live()-(base|0))}
function cs236EvRate(){return 1/(1+CS236.evS*cs236Live())}
// my presence: the count my hurt boss is locked to
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'&&typeof p.x=='number'){try{p.cs236=cs236Lock()}catch(_){p.cs236=0}}return f.apply(this,arguments)}}
// the target frame says so
{const f=tgtHud;tgtHud=function(){const r=f.apply(this,arguments);try{const e=tgt,L=$('tgL');if(e&&e.c&&e.c._cs>1&&L&&!e.bfx)L.insertAdjacentHTML('beforeend',' <span class="cs236" title="Tougher: '+((e.c._csX|0)+1)+' players here" style="color:#9fd0ff;font-size:.85em">👥×'+((e.c._csX|0)+1)+'</span>')}catch(_){}return r}}
