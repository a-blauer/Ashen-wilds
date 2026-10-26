// ================= v150: co-op progress is shared =================
// Owner: "I didn't get progress when clearing camp, or empowered kills when in co-op. Need co-op to be shared progress and
// instance." Playing together, everybody in the instance now moves forward together:
//  · Kills: every kill of a shared monster you are near counts for your own Cheddar quests (kills, elites, empowered / food /
//    bard kills, forged-weapon kills), whoever landed the last hit. Before, a guest's monsters are copies of the host's, and
//    a copy's death came from the host, so a guest never counted anything but camp clears.
//  · Camps: the region host's world clears a camp (it runs the camp's creatures) and tells the others (['cc', camp]); each
//    player near it gets the clear: the XP, their own chest, the camp quests, and the camp counts as cleared for them (the
//    Glowmire Warren's hatch opens for everyone).
//  · Main quests: a lamppost lit on the Lantern Road (['m143', i]) and a rune sigil attuned (['m145', i]) are lit / attuned
//    for every partner in that instance too.
//  · Instances: presence carries how far you have reached in each zone (ir); playing together, each player reaches as far
//    as the furthest of them (the portal window lists those instances, and the main quests that end at a reached gateway
//    count as done), so a guest can always follow the host.
//  · Rune sigil rituals are fought together: the region host runs the ritual (a guest's F at a sigil asks the host,
//    ['r145', i]), its ghost wolves are shared monsters that hunt every hero, the ritual holds while any hero stays near the
//    sigil, and the host sends the count (['p145', i, slain, total]) for everyone's tracker.
var CP150={near:60,lastP:'',tP:0,RR:null};
function cp150Peer(msg){try{const r=MP.rh[msg.peer];return !!(r&&r.pr&&r.pr.rg===MP.rg&&MP.rg>=0)}catch(_){return false}}
function cp150Send(e){try{if(MP.on&&MP.others&&MP.rg>=0)MP.evq.push(e)}catch(_){}}

// ---------- kills ----------
chqKill132=function(e,C,was){if(!e||e.dprop||e.wv)return;
  if(C&&!C.raid&&!was&&campCleared(C)){let z=null;try{z=INSL[C.ig].z}catch(_){}chqEv132('camp',1,null,z);chqEv132('allCamps',1,C.i,z)}
  if(e.minion&&!(e.c&&e.c.en==='ghostwolf'))return;
  chqEv132('kill',1);if(e.c&&e.c.al)chqEv132('elite',1);
  const b=chqBuffKind132();if(b.comp)chqEv132('empKill',1);if(b.food)chqEv132('foodKill',1);if(b.bard)chqEv132('bardKill',1);
  const w=typeof eq!='undefined'&&eq.weapon;if(w&&w.up>=2&&e.lhH&&nowP()-e.lhH<3000)chqEv132('forgeKill',1)};

// ---------- camps ----------
{const f=camp148Clear;camp148Clear=function(C){const r=f.apply(this,arguments);try{if(!CP150.rx&&MP.on&&MP.host===MP.me&&C&&C.ig===MP.rg)cp150Send(['cc',CAMPS.indexOf(C)])}catch(_){}return r}}
function cp150Camp(j){const C=CAMPS[j];if(!C||C.ig!==MP.rg||hero.hp<=0)return;if(Math.hypot(pl.position.x-C.x,pl.position.z-C.z)>CP150.near)return;
  const was=campCleared(C);const now=nowP();
  try{if(typeof ROST!='undefined'&&ROST.slots)ROST.slots.forEach(s=>{if(s.camp===C){s.dead=1;s.rt=Math.max(s.rt||0,now+CAMP148.resp*1000)}})}catch(_){}
  C.clr=true;if(was)return;
  CP150.rx=1;try{camp148Clear(C)}finally{CP150.rx=0}
  let z=null;try{z=INSL[C.ig].z}catch(_){}chqEv132('camp',1,null,z);chqEv132('allCamps',1,C.i,z)}

// ---------- main quests ----------
{const f=mq143Light;mq143Light=function(i){const was=!!MQ143.lit[i];const r=f.apply(this,arguments);try{if(!was&&MQ143.lit[i]&&!CP150.rx)cp150Send(['m143',i])}catch(_){}return r}}
function cp150Lamp(i){if(!MQ143.S||MQ143.lit[i]||mq143Done()||MQ143.st>=2)return;CP150.rx=1;const b0=MQ143.b;MQ143.b+=MQ143.per;
  try{mq143Light(i)}finally{CP150.rx=0;if(!MQ143.lit[i])MQ143.b=b0}say('🪔 A partner lit a lamppost on the road.')}
function cp150Sigil(i){if(MQ145.at[i])return;
  if(MQ145.R&&MQ145.R.i!==i)mq145Fail('left');
  if(MQ145.S&&mq145In3()){CP150.rx=1;try{if(!MQ145.R)MQ145.R={i,live:[],n:0,dead:0,tot:0};mq145Attune(i)}finally{CP150.rx=0}}
  else{MQ145.at[i]=1;MQ145.trkK='';mq145Sync();if(mq145N()>=3)mq145GateSync()}
  CP150.RR=null}
{const f=mq145Attune;mq145Attune=function(i){const r=f.apply(this,arguments);try{if(!CP150.rx)cp150Send(['m145',i])}catch(_){}return r}}

// ---------- the ritual together ----------
function cp150Co(){return typeof MP!='undefined'&&MP.on&&MP.others>0&&MP.rg>=0}
{const f=mq145Start;mq145Start=function(i){
  if(cp150Co()&&MP.host!==MP.me&&!CP150.rx){if(MQ145.at[i])return;cp150Send(['r145',i]);say('🐺 The ritual begins: the ghost wolves rise round '+MQ145.names[i]+'. Fight them together.');return}
  return f.apply(this,arguments)}}
// the host's wolves are shared monsters (not minions) that hunt every hero
{const f=spawnEnemy;spawnEnemy=function(k,x,z,l,o){const e=f.apply(this,arguments);try{if(e&&k==='ghostwolf'&&o&&o.minion&&MQ145.R&&cp150Co()&&MP.host===MP.me)e.minion=0}catch(_){}return e}}
{const f=eTarget;eTarget=function(e,m,dpl){if(e&&e.gw145&&e.hunt&&!e.dead&&cp150Co()){let tg=hero.hp>0?pl:null,bd=tg?dpl:1e9;
    for(const k in MP.rh){const r=MP.rh[k];if(!r.act)continue;const d=m.position.distanceTo(r.m.position);if(d<bd){bd=d;tg=r.m}}return tg||pl}
  return f.apply(this,arguments)}}
// the ritual holds while any hero is near the sigil and standing
{const f=mq145RTick;mq145RTick=function(dt,now){const R=MQ145.R;if(!R||!cp150Co()||MP.host!==MP.me)return f.apply(this,arguments);
  const M=MQ145.S&&MQ145.S.sig[R.i];let lend=null;
  try{if(M){let best=null,bd=Math.hypot(pl.position.x-M.x,pl.position.z-M.z);const meOk=hero.hp>0;if(!meOk)bd=1e9;
    for(const k in MP.rh){const r=MP.rh[k];if(!r.act||!r.m)continue;const d=Math.hypot(r.m.position.x-M.x,r.m.position.z-M.z);if(d<bd){bd=d;best=r}}
    if(best&&(bd<Math.hypot(pl.position.x-M.x,pl.position.z-M.z)||!meOk))lend=best}}catch(_){}
  if(!lend){const r=f.apply(this,arguments);cp150Prog(now);return r}
  const P=pl.position,ox=P.x,oz=P.z,hp=hero.hp;P.x=lend.m.position.x;P.z=lend.m.position.z;if(hero.hp<=0)hero.hp=1;
  try{return f.apply(this,arguments)}finally{P.x=ox;P.z=oz;hero.hp=hp;cp150Prog(now)}}}
function cp150Prog(now){const R=MQ145.R;if(!R||!cp150Co()||MP.host!==MP.me)return;const k=R.i+'|'+R.dead+'|'+R.tot;if(k===CP150.lastP&&now-CP150.tP<2500)return;CP150.lastP=k;CP150.tP=now;cp150Send(['p145',R.i,R.dead,R.tot])}
{const f=mq145Fail;mq145Fail=function(why){const R=MQ145.R;const r=f.apply(this,arguments);try{if(R&&cp150Co()&&MP.host===MP.me)cp150Send(['f145',R.i])}catch(_){}return r}}
// a partner's tracker shows the host's count
{const f=mq145Trk;mq145Trk=function(){const RR=CP150.RR;if(MQ145.R||!RR||nowP()-RR.t>6000||MQ145.at[RR.i])return f.apply(this,arguments);
  MQ145.R={i:RR.i,w:1,dead:RR.dead,tot:RR.tot,n:Math.min(RR.tot,RR.dead+MQ145.alive),live:[]};try{return f.apply(this,arguments)}finally{MQ145.R=null}}}

// ---------- instance reach ----------
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.ir=INSR.slice(0,PMAP.length)}catch(_){}}return f.apply(this,arguments)}}
function cp150Reach(){if(typeof MP=='undefined'||!MP.on)return;let up=0;
  for(const k in MP.rh){const pr=MP.rh[k].pr;if(!pr||!Array.isArray(pr.ir))continue;
    pr.ir.slice(0,PMAP.length).forEach((v,z)=>{v=Math.max(0,Math.min(PMI-1,v|0));if(v>(INSR[z]|0)){INSR[z]=v;up=1}})}
  if(up){MP.lastPres='';try{mq144GateSync()}catch(_){}try{mq145GateSync()}catch(_){}try{if(typeof mq143Sync=='function')mq143Sync()}catch(_){}say('👥 Playing together: you can now travel as far as your partners have reached.')}}

// ---------- messages ----------
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)&&d.r===MP.rg&&cp150Peer(msg)){
    for(const q of d.l.slice(0,60)){if(!Array.isArray(q))continue;const t=q[0];
      if(t==='cc'&&msg.peer===MP.host&&Number.isInteger(q[1]))cp150Camp(q[1]);
      else if(t==='m143'&&Number.isInteger(q[1])&&MQ143.lit&&q[1]>=0&&q[1]<MQ143.lit.length)cp150Lamp(q[1]);
      else if(t==='m145'&&Number.isInteger(q[1])&&q[1]>=0&&q[1]<3)cp150Sigil(q[1]);
      else if(t==='r145'&&Number.isInteger(q[1])&&q[1]>=0&&q[1]<3&&MP.host===MP.me){
        if(MQ145.at[q[1]])cp150Send(['m145',q[1]]);else if(!MQ145.R&&mq145In3()&&MQ145.S){CP150.rx=1;try{mq145Start(q[1])}finally{CP150.rx=0}}}
      else if(t==='p145'&&msg.peer===MP.host&&Number.isInteger(q[1])&&q[1]>=0&&q[1]<3){CP150.RR={i:q[1],dead:Math.max(0,q[2]|0),tot:Math.max(1,q[3]|0),t:nowP()};MQ145.trkK=''}
      else if(t==='f145'&&msg.peer===MP.host){CP150.RR=null;MQ145.trkK=''}}}}catch(err){console.warn('v150 progress',err)}
  return f.apply(this,arguments)}}
{const f=homeTick;homeTick=function(){const r=f.apply(this,arguments);try{if(typeof MP!='undefined'&&MP.on&&nowP()-(CP150.tR||0)>2000){CP150.tR=nowP();cp150Reach()}}catch(err){if(!CP150.err){CP150.err=1;console.warn('v150 reach',err)}}return r}}
{const f=mq145Prompt;mq145Prompt=function(){const RR=CP150.RR;if(MQ145.R||!RR||nowP()-RR.t>6000||MQ145.at[RR.i])return f.apply(this,arguments);
  MQ145.R={i:RR.i,w:1,dead:RR.dead,tot:RR.tot,n:0,live:[]};try{return f.apply(this,arguments)}finally{MQ145.R=null}}}
