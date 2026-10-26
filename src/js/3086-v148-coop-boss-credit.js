// ================= v148.2: co-op boss credit =================
// A Sovereign's first defeat (map cleared, its power, the next portal) and Vorraxis's defeat are one-time progress. In co-op,
// when anyone in the game kills one, every other player in it gets that credit too, wherever they are: in the arena, downed,
// on the death screen, in another zone or in Duskhold. The player who lands the kill sends ['bk', id, name] on the 'ev'
// topic a few times (the host relays it to everyone); each player applies it once.
//  * Sovereign i: players fighting that same Sovereign get the kill as before (their own loot too, 0520). Everyone else runs
//    bossDefeated for it (map cleared, power gained, next portal opens, kingdom growth, Cheddar's counters) unless they had
//    already beaten it.
//  * Vorraxis ('v144'): the quest moves to "Vorraxis slain"; the Glowmire Crystal waits in the Seeping Lair to be claimed.
//    A player in the middle of their own Vorraxis fight gets it when that fight ends.
// Loot stays with the players who were there.
var BC148={sent:{},got:{},q:[],pend:[]};
function bc148Send(id){if(typeof MP=='undefined'||!MP.on||!MPX.be)return;BC148.q.push({id:String(id),n:3,t:0})}
// the killer: a Sovereign that dies on my screen without being a relayed kill, or my Vorraxis
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.ar!=null&&typeof MP!='undefined'&&MP.on&&!MP.rk)bc148Send(e.ar)}catch(err){console.warn('v148 credit',err)}return r}}
{const f=mb144Won;mb144Won=function(e){const r=f.apply(this,arguments);try{bc148Send('v144')}catch(_){}return r}}
function bc148Flush(now){if(!BC148.q.length||typeof MP=='undefined'||!MP.on)return;const l=[];
  BC148.q.forEach(q=>{if(now-q.t>700){q.t=now;q.n--;l.push(['bk',q.id,String(hero.name||'Hero').slice(0,20)])}});BC148.q=BC148.q.filter(q=>q.n>0);
  if(l.length)try{MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}catch(_){}}
// a partner's kill
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l))for(const q of d.l.slice(0,60)){
    if(!Array.isArray(q)||q[0]!=='bk'||typeof q[1]!=='string')continue;const id=q[1];if(!(/^[0-5]$/.test(id)||id==='v144'))continue;
    const k=id;if(BC148.got[k])continue;BC148.got[k]=1;BC148.pend.push({id,by:String(q[2]||mpName(msg.peer)).slice(0,20),t:performance.now()+1500})}}
  catch(err){console.warn('v148 credit',err)}return f.apply(this,arguments)}}
// applied a moment later, so a kill relayed inside the same arena (with its loot) lands first
function bc148Apply(now){if(!BC148.pend.length)return;const keep=[];
  for(const p of BC148.pend){if(now<p.t){keep.push(p);continue}
    try{if(p.id==='v144'){if(!bc148Vorraxis(p.by))keep.push(Object.assign(p,{t:now+2000}))}else bc148Sov(+p.id,p.by)}catch(err){console.warn('v148 credit',err)}}
  BC148.pend=keep}
function bc148Sov(i,by){if(!BOSSES[i]||bossDone.has(i))return;
  const e=typeof bossEnt=='function'?bossEnt(i):null;
  // still in that fight on my screen: the boss falls here too (loot included)
  if(e&&!e.dead&&typeof AF!='undefined'&&AF&&AF.i===i){MP.rk=1;try{e.c.h=0;e.dead=1;if(e.hb)e.hb.visible=false;kill(e)}finally{MP.rk=0}}
  else bossDefeated({ar:i});
  say('👑 '+mpEsc(by)+' slew '+BOSSES[i].name+' — the victory is yours too!');try{hsDirty()}catch(_){}}
function bc148Vorraxis(by){if(typeof MQ144=='undefined'||MQ144.st>=2)return true;
  if(typeof MB144A!='undefined'&&MB144A&&MB144A.f)return false;   // mid-fight: wait for it to end
  MQ144.st=2;MQ144.trkK='';try{if(typeof mq144InLair=='function'&&mq144InLair()&&typeof mb144LairSync=='function')mb144LairSync()}catch(_){}
  say('🦂 '+mpEsc(by)+' slew Vorraxis! The Glowmire Crystal waits for you in the Seeping Lair.');try{hud();hsDirty()}catch(_){}return true}
{const f=homeTick;homeTick=function(){const r=f.apply(this,arguments);try{const now=performance.now();bc148Flush(now);bc148Apply(now)}catch(err){console.warn('v148 credit',err)}return r}}
// a fresh co-op game: forget which kills were already applied (each one is still applied only once: bossDone / MQ144.st)
{const f=mpSolo;mpSolo=function(){const r=f.apply(this,arguments);BC148.got={};BC148.q=[];return r}}
