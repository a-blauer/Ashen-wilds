// ---------------- hatch modifiers ----------------
const MODS={
 Stalwart:{i:'🛡️',d:'+15% physical defense',s:{pdP:.15}},
 Warded:{i:'🔰',d:'+15% magical defense',s:{mdP:.15}},
 Savage:{i:'⚔️',d:'+12% physical attack',s:{paP:.12}},
 Arcane:{i:'🔮',d:'+12% magical attack',s:{maP:.12}},
 Vampiric:{i:'🩸',d:'Heals for 6% of damage it deals. Empowering: you gain 3% lifesteal',e:{ls:.03}},
 Swift:{i:'💨',d:'Attacks 18% faster. Empowering: you attack 8% faster',e:{as:.08}},
 Lucky:{i:'🍀',d:'+12% loot drop chance while in your active team',t:{loot:.12}},
 Scholarly:{i:'📜',d:'+10% character XP while in your active team',t:{xp:.1}},
 Catalyst:{i:'⚗️',d:'Gives 60% more stats when used as fusion material'},
 Gatherer:{i:'🧺',d:'Empowering: +1 harvest yield and 30% faster gathering',e:{gath:1}}
};
const MODK=Object.keys(MODS);
// ---------------- overland enemies ----------------
// hum = humanoid look; rig = creature-rig beast. moves use the telegraphed move system; w = stat weights; fam = material theme
const HUMLOOK={
 hob:{skin:[96,140,62],tunic:0x5a4a2a,cape:[70,50,30],pants:[60,48,34],sc:.82,head:'goblin',wpn:'club',wcol:0x6a4a2a},
 sling:{skin:[110,150,70],tunic:0x6a5a3a,cape:[90,70,40],pants:[60,52,40],sc:.8,head:'goblinhood',wpn:'sling',wcol:0x6a4a2a},
 bandit:{skin:[205,165,130],tunic:0x3a3a40,cape:[60,30,30],pants:[40,36,40],sc:.98,head:'mask',wpn:'dagger',wcol:0x9aa0aa},
 brigand:{skin:[200,160,125],tunic:0x6a2a24,cape:[80,24,20],pants:[50,40,36],sc:1.12,head:'helm',wpn:'axe',wcol:0x8a8a92},
 shaman:{skin:[100,150,80],tunic:0x3a5a3a,cape:[60,90,50],pants:[50,60,40],sc:.86,head:'feather',wpn:'staff',wcol:0x7aff9a},
 cultist:{skin:[190,150,120],tunic:0x7a1a14,cape:[120,24,16],pants:[50,20,18],sc:1,head:'hoodred',wpn:'staff',wcol:0xff6a2a},
 orc:{skin:[96,110,80],tunic:0x4a3a2a,cape:[60,44,30],pants:[50,40,30],sc:1.28,head:'orc',wpn:'axe',wcol:0x7a7a80},
 skel:{skin:[226,218,196],tunic:0x4a4a52,cape:[60,60,70],pants:[70,70,74],sc:1.02,head:'skull',wpn:'sword',wcol:0xa0a0a8,bone:1},
 archer:{skin:[226,218,196],tunic:0x3a3a30,cape:[50,50,40],pants:[60,60,60],sc:1,head:'skullhood',wpn:'bow',wcol:0x6a5a40,bone:1},
 knight:{skin:[60,60,70],tunic:0x26262e,cape:[30,20,40],pants:[30,30,36],sc:1.42,head:'greathelm',wpn:'gs',wcol:0x5a5a6a},
 giant:{skin:[120,140,170],tunic:0x3a4a6a,cape:[40,60,110],pants:[50,60,80],sc:1.7,head:'giant',wpn:'hammer',wcol:0x8ab8ff},
 revenant:{skin:[200,180,140],tunic:0xb8a070,cape:[150,120,70],pants:[160,140,100],sc:1.05,head:'mummy',wpn:'staff',wcol:0xffd060}
};
const EN={
 hobgoblin:{n:'Hobgoblin',e:'👺',hum:'hob',w:{hp:.9,pa:1,ma:.4,pd:.9,md:.7},mt:'p',moves:['strike','slam','charge'],fam:'Beast'},
 slinger:{n:'Hobgoblin Slinger',e:'👺',hum:'sling',w:{hp:.7,pa:.95,ma:.4,pd:.7,md:.7},mt:'p',moves:['throw','strike'],ranged:1,fam:'Beast'},
 bandit:{n:'Bandit',e:'🥷',hum:'bandit',w:{hp:.85,pa:1.05,ma:.4,pd:.8,md:.8},mt:'p',moves:['strike','spin','charge'],fam:'Sky'},
 lurker:{n:'Mire Lurker',e:'🐸',rig:'Mossfrog',col:0x3a5a2a,w:{hp:1.05,pa:.9,ma:.6,pd:1,md:.8},mt:'p',moves:['strike','spit','pounce'],fam:'Earth'},
 snowwolf:{n:'Snow Wolf',e:'🐺',rig:'Ashwolf',col:0xd8dce4,w:{hp:.85,pa:1.1,ma:.4,pd:.8,md:.8},mt:'p',moves:['strike','bite','pounce'],fam:'Beast'},
 brigand:{n:'Brigand Captain',e:'⚔️',hum:'brigand',w:{hp:1.15,pa:1.1,ma:.4,pd:1.1,md:.8},mt:'p',moves:['strike','slam','charge'],fam:'Beast'},
 tortoise:{n:'Crag Tortoise',e:'🐢',rig:'Stoneshell',col:0x6a6a70,sc:1.5,w:{hp:1.5,pa:.9,ma:.5,pd:1.5,md:1},mt:'p',moves:['strike','slam','charge'],fam:'Earth'},
 cavebat:{n:'Cave Bat',e:'🦇',rig:'Batwing',col:0x3a2a3a,w:{hp:.7,pa:1.05,ma:.6,pd:.7,md:.8},mt:'p',moves:['strike','charge'],fam:'Sky'},
 shaman:{n:'Goblin Shaman',e:'🧙',hum:'shaman',w:{hp:.75,pa:.4,ma:1.15,pd:.7,md:1.1},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Spirit'},
 shambler:{n:'Fungal Shambler',e:'🍄',rig:'Gloomcap',col:0x5a2a5a,sc:1.3,w:{hp:1.2,pa:.9,ma:.9,pd:1,md:1},mt:'p',moves:['strike','spin','spit'],fam:'Swarm'},
 cultist:{n:'Ember Cultist',e:'🔥',hum:'cultist',w:{hp:.8,pa:.4,ma:1.2,pd:.75,md:1.1},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Dragon'},
 orc:{n:'Orc Raider',e:'👹',hum:'orc',w:{hp:1.25,pa:1.15,ma:.4,pd:1.1,md:.8},mt:'p',moves:['strike','slam','charge','spin'],fam:'Beast'},
 magmadrake:{n:'Magma Drake',e:'🐉',rig:'Drakelet',col:0xb83a1a,sc:1.35,w:{hp:1.1,pa:.9,ma:1.15,pd:1,md:1},mt:'m',moves:['strike','spit','charge'],fam:'Dragon'},
 stalker:{n:'Web Stalker',e:'🕷️',rig:'Cryptspider',col:0x1a1620,sc:1.25,w:{hp:.95,pa:1.1,ma:.7,pd:.9,md:.9},mt:'p',moves:['strike','spit','pounce'],fam:'Swarm'},
 skeleton:{n:'Skeleton Warrior',e:'💀',hum:'skel',w:{hp:1,pa:1.1,ma:.4,pd:1.1,md:.9},mt:'p',moves:['strike','spin','charge'],fam:'Spirit'},
 bonearcher:{n:'Bone Archer',e:'🏹',hum:'archer',w:{hp:.75,pa:1.05,ma:.4,pd:.8,md:.8},mt:'p',moves:['throw','strike'],ranged:1,fam:'Spirit'},
 hollowknight:{n:'Hollow Knight',e:'🛡️',hum:'knight',w:{hp:1.45,pa:1.2,ma:.5,pd:1.4,md:1.1},mt:'p',moves:['strike','slam','charge'],fam:'Earth'},
 wraith:{n:'Wraith',e:'👻',rig:'Wispling',col:0x6a7aa8,sc:1.3,w:{hp:.8,pa:.4,ma:1.2,pd:.7,md:1.3},mt:'m',moves:['bolt','spin','slam'],fam:'Spirit'},
 boghorror:{n:'Bog Horror',e:'🐊',rig:'Mossfrog',col:0x2a3a2a,sc:1.55,w:{hp:1.4,pa:1.1,ma:.7,pd:1.2,md:1},mt:'p',moves:['strike','pounce','spit'],fam:'Earth'},
 harpy:{n:'Harpy',e:'🦅',rig:'Skyhawk',col:0x8a5a3a,sc:1.2,w:{hp:.85,pa:1.15,ma:.6,pd:.8,md:.9},mt:'p',moves:['strike','charge','pounce'],fam:'Sky'},
 giant:{n:'Storm Giant',e:'🗿',hum:'giant',w:{hp:1.6,pa:1.25,ma:.9,pd:1.3,md:1.2},mt:'p',moves:['strike','slam','rainfire'],fam:'Earth'},
 revenant:{n:'Desert Revenant',e:'🧟',hum:'revenant',w:{hp:.9,pa:.5,ma:1.25,pd:.9,md:1.2},mt:'m',moves:['bolt','spin','rainfire'],ranged:1,fam:'Spirit'},
 sandwyrm:{n:'Sand Wyrm',e:'🐍',rig:'Gravewyrm',col:0xc8a060,sc:1.5,w:{hp:1.35,pa:1.15,ma:.8,pd:1.1,md:1},mt:'p',moves:['strike','charge','spin'],fam:'Dragon'}
};
const BIOEN={'Sunlit Meadow':['hobgoblin','slinger','bandit'],'Murky Mire':['lurker','hobgoblin','bandit'],'Frostwood Taiga':['snowwolf','bandit','slinger'],
 'Stone Highlands':['brigand','tortoise','bandit'],'Twilight Hollow':['cavebat','shaman','brigand'],'Fungal Grove':['shambler','shaman','cavebat'],
 'Ember Crags':['cultist','magmadrake','orc'],'Webwood':['stalker','orc','cultist'],
 'Bone Wastes':['skeleton','bonearcher','hollowknight'],'Haunted Fens':['wraith','boghorror','bonearcher'],
 'Windswept Cliffs':['harpy','giant','revenant'],'Scorched Barrens':['sandwyrm','revenant','giant']};

// ---------------- registry hookups (mutate the original tables in place) ----------------
SPK.forEach(n=>{const q=SP2[n];S[n]=Object.assign(S[n]||{},{e:q[3],c:q[4],h:q[5],t:q[6],hp:20,a:8,d:5});TAGS[n]=q[0]});
Object.keys(EN).forEach(k=>{S[k]=S[k]||{e:EN[k].e,c:EN[k].col||0x888888,h:'X',t:'x',hp:20,a:8,d:5};MSET[k]=EN[k].moves});
FAMS.length=0;FAMK.forEach(f=>FAMS.push(f));
[TGI,FAMC,FAM].forEach(o=>Object.keys(o).forEach(k=>delete o[k]));
FAMK.forEach(f=>{const F=FAMD[f];TGI[f]=F.i;FAMC[f]=F.col;FAM[f]=[F.mat,F.mi]});
['Slime Scale','Grave Dust','Spore Cap'].forEach(k=>delete mats[k]);FAMK.forEach(f=>{mats[FAMD[f].mat]=mats[FAMD[f].mat]||0});UPM.forEach(u=>mats[u[0]]=0);
// ---------------- hero state ----------------
Object.assign(hero,{cls:'warrior',lvl:1,xp:0,tal:{},buffs:[],dc:2,sh:0,shT:0,lastHit:-1e9,name:'Hero',cd:{},chan:null});
let HSc=null,HSt=0;const hsDirty=()=>{HSc=null};
const zones=[],traps=[];
function talRank(id){return hero.tal[id]||0}
function talSpent(b){const T=TAL[hero.cls];let n=0;(b==null?T:[T[b]]).forEach(br=>br.t.forEach(t=>n+=talRank(t[0])));return n}
const tpFree=()=>Math.max(0,hero.lvl-1-talSpent());
function talMods(){const o={};TAL[hero.cls].forEach(br=>br.t.forEach(t=>{const r=talRank(t[0]);if(r)for(const k in t[5])o[k]=(o[k]||0)+t[5][k]*r}));return o}
function HS_base(){
  const now=performance.now();if(HSc&&now-HSt<80)return HSc;
  const C=CLS[hero.cls],l=hero.lvl,T=talMods(),s={hp:C.base.hp+C.per.hp*(l-1),mp:C.base.mp+C.per.mp*(l-1),pa:C.base.pa+C.per.pa*(l-1),ma:C.base.ma+C.per.ma*(l-1),pd:C.base.pd+C.per.pd*(l-1),md:C.base.md+C.per.md*(l-1),
    crit:C.crit,cdm:.75,as:0,ls:0,cdr:0,skillP:0,basicP:0,dr:0,regen:0,mpr:0,dash:2,dashR:0,iframe:0,mspd:0,empP:0,compP:0,healP:0,thorns:0,exec:0,first:0,lowdr:0,killheal:0,finisher:0,pierce:0,echo:0,shieldP:0,aoeP:0,poisonP:0,stunP:0,blockC:hero.cls=='paladin'?.08:0,loot:0,xp:0,gath:0,berserk:0,slowOn:0,poisonOn:0};
  const P={hpP:0,mpP:0,paP:0,maP:0,pdP:0,mdP:0};
  const add=o=>{for(const k in o){if(k in P)P[k]+=o[k];else if(k!='dash3')s[k]=(s[k]||0)+o[k]}};
  SLOTS.forEach(k=>{const it=eq[k];if(it&&canUse(it))add(itStats(it))});
  add(T);if(talRank('a14')>=3)s.dash+=1;
  party.slice(0,2).forEach(c=>{if(!c||c.h<=0)return;
    (c.mods||[]).forEach(m=>{const Mo=MODS[m];if(Mo.t)add(Mo.t);if(c.emp&&Mo.e)add(Mo.e)});
    if(c.emp){const k=.24*(1+(T.empP||0));s.hp+=cM(c)*k;s.pa+=cStat(c,'pa')*k;s.ma+=cStat(c,'ma')*k;s.pd+=cStat(c,'pd')*k;s.md+=cStat(c,'md')*k;
      (c.sp||[]).forEach(n=>{const sp=CSP[n];if(sp&&sp.emp&&sp.emp.k=='stat')add(sp.emp.s)})}});
  hero.buffs.forEach(b=>{if(b.t>now)add(b.s)});
  s.hp*=1+P.hpP;s.mp*=1+P.mpP;s.pa*=1+P.paP;s.ma*=1+P.maP;s.pd*=1+P.pdP;s.md*=1+P.mdP;s.dash=Math.floor(s.dash);
  HSc=s;HSt=now;return s;
}
const heroMt=()=>CLS[hero.cls].mt,atkOf=mt=>{const s=HS();return mt=='m'?s.ma:s.pa};
function healHero(v,quiet){const s=HS(),a=Math.min(heroMax()-hero.hp,v*(1+s.healP));if(a<=0)return;hero.hp+=a;if(!quiet&&a>=1)dn(pl.position,'+'+Math.round(a),'#6ee7b7',-10)}
// ---------------- creature + enemy stats ----------------
const CBS={hp:60,pa:9,ma:9,pd:6,md:6},CGS={hp:15,pa:2.5,ma:2.5,pd:1.7,md:1.7};
const cM=c=>Math.round(cStat(c,'hp')),cPA=c=>Math.round(cStat(c,'pa')),cPD=c=>Math.round(cStat(c,'pd')),cMA=c=>Math.round(cStat(c,'ma')),cMD=c=>Math.round(cStat(c,'md'));
const xMt=c=>c.st?(c.mt||'p'):FAMD[famOf(c.g[0])].mt;
function enStats(t,l,al,boss){
  const w=t.w,f=(a,b)=>(a+b*l);
  return {hp:f(80,55)*w.hp*(al?3.4:1)*(boss?14:1),pa:f(10,6.7)*w.pa*(al?1.35:1)*(boss?1.3:1),ma:f(10,6.7)*w.ma*(al?1.35:1)*(boss?1.3:1),pd:f(3,2.3)*w.pd*(al?1.2:1)*(boss?1.4:1),md:f(3,2.1)*w.md*(al?1.2:1)*(boss?1.4:1)};
}
function enemyC(key,l,o){
  o=o||{};const t=EN[key],c={n:t.n,en:key,l,al:o.al?1:0,boss:o.boss?1:0,g:[key],cl:[t.col||0x888888],sy:['',''],z:t.hum?1:(t.sc||1)*(.94+Math.random()*.12),tr:'',v:'',iv:{hp:1,a:1,d:1},sp:[],cdm:{},mt:t.mt,st:enStats(t,l,o.al,o.boss)};
  c.h=Math.round(c.st.hp);return c;
}
function dmgCE(a,b,k,p){const mt=xMt(a),atk=mt=='m'?cStat(a,'ma'):cStat(a,'pa'),def=p?0:(mt=='m'?cStat(b,'md'):cStat(b,'pd'));return Math.max(1,Math.round(atk*k*(1-def/(def+KD(a.l||1)))*(a.ch?.8:1)*(.88+Math.random()*.24)))}
function mkC_base(n,l,f,v,iv){
  const q=SP2[n]||SP2.Foxlet,rv=()=>.85+Math.random()*.3,col=new THREE.Color(q[4]);if(v&&VAR[v]&&VAR[v].c)col.lerp(new THREE.Color(VAR[v].c),.5);
  const c={n,l:l||1,x:0,f:Math.floor(f||0),fp:f||0,v:v||'',iv:iv||{hp:rv(),a:rv(),d:rv()},g:[n],cl:[col.getHex()],sy:[q[5],q[6]],z:.94+Math.random()*.14,tr:Math.random()<.3?['Horned','Bulky','Armored','Spiked'][R(0,3)]:'',sp:[q[8]],mods:[],evo:0,cdm:{}};
  c.h=cM(c);return c;
}
function rollMod(c){const pool=MODK.filter(m=>!(c.mods||[]).includes(m));if(!pool.length)return null;const m=pool[R(0,pool.length-1)];(c.mods=c.mods||[]).push(m);return m}
// ---------------- damage pipeline ----------------
function rollHero(e,raw,mt,o){
  const s=HS(),c=e.c,def=mt=='m'?cMD(c):cPD(c);let d=raw*(1-def/(def+KD(hero.lvl)));
  const gap=c.l-hero.lvl;if(gap>0)d*=Math.max(.15,1-.1*gap);
  const hpr=c.h/M(c);if(hpr<.35)d*=1+s.exec;if(hpr>=.999)d*=1+s.first;if(s.berserk&&hero.hp<heroMax()*.5)d*=1+s.berserk;
  if(e.wk>0)d*=1.2;if(e.mark>0)d*=1+(e.markV||.35);
  let crit=false;if((o&&o.crit)||Math.random()<s.crit){crit=true;d*=1+s.cdm}
  return {d:Math.max(1,Math.round(d*(.92+Math.random()*.16))),crit};
}
function heroHit_base(e,raw,mt,o){
  o=o||{};if(!e||e.dead)return 0;const r=rollHero(e,raw,mt||heroMt(),o),s=HS();hurt(e,r.d,o.s||null,r.crit);
  if(s.ls>0)healHero(r.d*s.ls,true);
  if(o.proc!==false&&!e.dead){
    const now=performance.now(),atk=atkOf(mt||heroMt());
    if(s.poisonOn||hero.buffs.some(b=>b.t>now&&b.s.poisonOn))eStatus(e,{poison:4},atk*.35*(1+s.poisonP));
    if(s.slowOn&&Math.random()<s.slowOn)eStatus(e,{slow:2.5},0);
    party.slice(0,2).forEach(c=>{if(!c||!c.emp||c.h<=0)return;(c.sp||[]).forEach(n=>{const em=CSP[n]&&CSP[n].emp;if(!em||em.k!='onhit'||Math.random()>em.ch)return;
      if(em.fx=='zap'){chainFrom(e,atk*.5,'m',2,0xfff06a,null);return}eStatus(e,{[em.fx]:em.fx=='root'?1.5:3},atk*.3)})});
    if(o.s&&o.s.stun)eStatus(e,{stun:o.s.stun},0,'h');if(o.s&&o.s.burn)eStatus(e,{burn:4},atk*.3);
  }
  return r.d;
}
function compHit_base(c,e,mult,fx){
  if(!e||e.dead)return 0;const s=HS();let d=dmgCE(c,e.c,mult)*(1+s.compP);if(e.wk>0)d*=1.2;if(e.mark>0)d*=1+(e.markV||.35);
  const gap=e.c.l-c.l;if(gap>0)d*=Math.max(.2,1-.08*gap);d=Math.max(1,Math.round(d));hurt(e,d,{col:0xffd24a},false);
  if((c.mods||[]).includes('Vampiric'))c.h=Math.min(M(c),c.h+Math.round(d*.06));
  if(fx){const atk=xMt(c)=='m'?cStat(c,'ma'):cStat(c,'pa');eStatus(e,fx,atk*.3);if(fx.drain){const hv=Math.round(d*fx.drain);if(c.emp)healHero(hv);else c.h=Math.min(M(c),c.h+hv)}}
  return d;
}
function eStatus_base(e,fx,atk,src){
  if(!e||e.dead)return;
  if(fx.slow)e.ch=Math.max(e.ch||0,fx.slow);
  if(fx.stun){const t=fx.stun*(1+(src=='h'?HS().stunP:0))*(e.boss?.3:e.c.al?.6:1);e.stun=Math.max(e.stun||0,t);if(!e.boss)mCancel(e);dn(e.m.position,'Stunned','#ffe08a',-30,700)}
  if(fx.root)e.root=Math.max(e.root||0,fx.root*(e.boss?.3:1));
  if(fx.weak)e.wk=Math.max(e.wk||0,fx.weak);
  e.dots=e.dots||[];
  [['burn',.32,0xff7a2a],['poison',.28,0x8ad84a],['bleed',.24,0xd03a3a]].forEach(([k,rt,col])=>{if(fx[k]&&atk>0){const old=e.dots.find(q=>q.k==k);const dps=atk*rt;if(old){old.t=Math.max(old.t,fx[k]);old.dps=Math.max(old.dps,dps)}else e.dots.push({k,t:fx[k],dps,ti:0,col})}});
}
// status + enrage tick for each enemy; returns true when the enemy is stunned (no AI this frame)
function eTick_base(e,dt,now){
  if(dt<=0)return false;
  if(e.dots&&e.dots.length){for(let i=e.dots.length-1;i>=0;i--){const q=e.dots[i];q.t-=dt;q.ti-=dt;if(q.ti<=0){q.ti=.5;const def=cMD(e.c)*.5,d=Math.max(1,Math.round(q.dps*.5*(1-def/(def+KD(hero.lvl)))));hurt(e,d,{col:q.col},false,true);if(e.dead)return true}if(q.t<=0)e.dots.splice(i,1)}}
  e.wk=Math.max(0,(e.wk||0)-dt);e.mark=Math.max(0,(e.mark||0)-dt);e.root=Math.max(0,(e.root||0)-dt);
  if(e.agg&&!e.boss){e.ft=(e.ft||0)+dt;if(e.ft>24&&!e.enr){e.enr=1;dn(e.m.position,'ENRAGED','#ff5a3a',-40,1400);burst(gY(e.m.position,.8),0xff3a2a,30,2,2,.6)}}else if(!e.agg){e.ft=Math.max(0,(e.ft||0)-dt*3);if(e.ft<=0)e.enr=0}
  if(e.enr&&Math.random()<dt*6)burst(gY(e.m.position,1),0xff3a1a,1,.3,.6,.4);
  if(e.stun>0){e.stun-=dt;if(e.m.pose)e.m.pose.rz=Math.sin(now/60)*.08;animC(e.m,now,false,0);return true}
  return false;
}
function hitTarget(e,tg,mult,mt0){
  mult=mult||1;if(townAt(tg.position.x,tg.position.z,.5)>=0)return;
  const mt=mt0||(e.atk&&e.atk.M&&e.atk.M.mt)||e.c.mt||'p';
  if(tg==pl){hitHero(e,mult,mt);return}
  const i=fols.indexOf(tg),me=party[i];if(!me)return;const d=Math.max(1,Math.round(dmgCE(e.c,me,mult)*(e.enr?1.3:1)));me.h=Math.max(0,me.h-d);dn(tg.position,d,'#ff6b5b');
  if(me.h<=0){say(nm(me)+' fainted!');if(me.emp){me.emp=false;hsDirty();hero.hp=Math.min(hero.hp,heroMax())}ui()}
}
function hitHero_base(e,mult,mt){
  if(townAt(pl.position.x,pl.position.z,.5)>=0)return;
  if(hero.iv>0){dn(pl.position,'Dodged!','#bfe3ff');return}
  const s=HS(),c=e.c;mt=mt||c.mt||'p';const atk=mt=='m'?cMA(c):cPA(c),def=mt=='m'?s.md:s.pd;
  let d=atk*mult*(1-def/(def+KD(c.l)));const gap=c.l-hero.lvl;d*=gap>0?Math.min(2.5,1+.1*gap):Math.max(.5,1+.04*gap);
  if(e.enr)d*=1.3;if(e.wk>0)d*=.8;
  const dr=s.dr+(hero.hp<heroMax()*.4?s.lowdr:0)+(hero.chan&&hero.chan.sk.n=='Whirlwind'?.1:0);d*=1-Math.min(.75,dr);
  if(Math.random()<s.blockC){d*=.5;dn(pl.position,'Blocked','#e8d8a0',-18);burst(gY(pl.position,1),0xffe8a0,8,1.2,1,.3)}
  d=Math.max(1,Math.round(d*(.9+Math.random()*.2)));const raw=d;
  if(hero.sh>0){const a=Math.min(hero.sh,d);hero.sh-=a;d-=a;if(a)dn(pl.position,'('+Math.round(a)+')','#bfe3ff',14)}
  hero.lastHit=performance.now();
  if(d>0){hero.hp-=d;heroFlinch();shake(.05+.08*mult);dn(pl.position,d,'#ff6b5b');burst(gY(pl.position,.7),0xaa2018,8,2,2,.4)}
  if(s.thorns>0&&!e.dead)hurt(e,Math.max(1,Math.round(raw*s.thorns)),{col:0xc0c0c0},false);
  if(hero.hp<=0)down();
}
function bossHit(e,k){hitHero(e,k,e.c.mt)}
function hurt_base(e,d,s,crit,dot){
  if(e.dead)return;e.c.h=Math.max(0,e.c.h-d);e.m.flT=dot?e.m.flT:performance.now();
  dn(e.m.position,crit?d+'!':d,crit?'#ffb020':s&&s.col!=null?'#'+('00000'+s.col.toString(16)).slice(-6):'#fff',crit?-8:0,crit?900:700);
  if(crit){const el=$('stage').lastChild;if(el&&el.className=='dn')el.style.fontSize='1.35rem'}
  if(!dot){burst(gY(e.m.position,.7),s&&s.col!=null?s.col:0xffe6b0,crit?14:7,2.5,2,.4);const a=V().subVectors(e.m.position,pl.position).setY(0).normalize(),kb=(e.boss?.2:e.c.al?1.5:3.5)*Math.min(2.4,.7+5*d/M(e.c));e.vx=a.x*kb;e.vz=a.z*kb}
  e.agg=1;
  if(e.c.h<=0){e.dead=1;e.hb.visible=false;kill(e)}
}
function area_base(p,r,dm,s,dir,half){
  const out=[];enemies.forEach(e=>{
    if(e.dead)return;const v=V().subVectors(e.m.position,p).setY(0),L=v.length();if(L>r+(e.c.al?.5:0)+(e.boss?1.2:0))return;
    if(dir&&L>.4&&Math.acos(Math.min(1,v.dot(dir)/L))>half)return;
    if(s&&s.cc)compHit(s.cc,e,s.mm||1,s.fx);else heroHit(e,dm,(s&&s.mt)||heroMt(),{s,proc:!s||s.proc!==false});
    out.push(e);
  });return out;
}
function chainFrom(e0,raw,mt,jumps,col,cc,fx){
  let cur=e0;const hit=new Set();let from=pl.position.clone();
  for(let j=0;j<=jumps&&cur;j++){hit.add(cur);bolt(gY(from,1),gY(cur.m.position,.8),col);if(cc)compHit(cc,cur,raw*(1-.12*j),fx);else heroHit(cur,raw*(1-.12*j),mt,{s:{col},proc:j==0});from=cur.m.position.clone();
    cur=enemies.filter(e=>!e.dead&&!hit.has(e)&&d2(e.m.position,from)<5.5).sort((a,b)=>d2(a.m.position,from)-d2(b.m.position,from))[0]}
}
// ---------------- XP / leveling ----------------
function gainXP(e){
  const s=HS(),c=e.c;let xp=(8+c.l*12)*(c.al?3:1)*(c.boss?25:1)*(1+s.xp+restBonus());
  const gap=c.l-hero.lvl;xp*=gap<-5?.25:gap<-2?.7:gap>2?1.2:1;xp*=.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(e&&e.wv?.315:1);xp=Math.max(1,Math.round(xp));
  if(hero.lvl<MAXLV){hero.xp+=xp;while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}else hero.xp=0;
  party.slice(0,2).forEach(c2=>{if(!c2||c2.l>=MAXLV)return;c2.x+=xp;while(c2.l<MAXLV&&c2.x>=needH(c2.l)){c2.x-=needH(c2.l);c2.l++;c2.h=M(c2);say(nm(c2)+' reached Lv '+c2.l+'!'+(EVLV.includes(c2.l)?' ✨ It can evolve now (Companions menu).':''))}});
  return xp;
}
function heroLevelUp(){
  hero.lvl++;hsDirty();hero.hp=Math.min(heroMax(),Math.max(0,hero.hp)+heroMax()*.5);hero.mp=Math.min(mpMax(),(hero.mp||0)+mpMax()*.5);
  const ns=SKL[hero.cls].find(k=>k.lv==hero.lvl);
  banner('LEVEL '+hero.lvl,CLS[hero.cls].n+' · +1 talent point (K) · +'+kqrLvAP(hero.lvl)+' ability points (C)',(typeof kqsLvNote=='function'&&kqsLvNote())||'Half of your health and mana restored');
  ring(pl.position,0xffd24a,3.6,800);burst(gY(pl.position,1),0xffd24a,70,4.5,4,1.2);
}
function kill_base(e){
  const xp=gainXP(e),sp=e.c.g[0];kills[sp]=(kills[sp]||0)+1;
  dn(e.m.position,'+'+xp+' XP','#c4b5fd',0,1400);
  burst(gY(e.m.position,.6),e.c.boss?0xff6a3a:e.c.al?0xb04aff:0xcc3322,e.c.boss?90:30,3.5,3,.8);
  const s=HS();if(s.killheal)healHero(heroMax()*s.killheal,true);
  if(e.boss)bossT[e.bi]=300;
  mCancel(e);e.m.pose=null;lootE(e);ui();
  if(tgt===e)setTarget(null);
  // v135: the body topples onto its side (lifted so it rests on the ground, a small bounce as it lands), lies there, then fades
  // out (death135 in 2460); it used to be thrown up in an arc and shrink away
  if(e.m.isE&&e.m.b&&!e.m._ssDead){const b=e.m.b,sd=Math.random()<.5?1:-1,L=death135Lift(e.m);tw(640,k=>{const q=death135Ease(k);b.rotation.z=sd*1.42*q;b.position.y=L*Math.sin(1.42*q)+(k>.72?.05*Math.sin((k-.72)/.28*Math.PI):0)})}
  (e.m._ssDead?(f=>tw(1500,()=>{},f)):(f=>setTimeout(f,1500)))(()=>death135Fade(e.m,()=>removeE(e)));
}
// ---------------- loot ----------------
function rolR2(l,mn,bonus){const mx=l<6?1:l<14?2:l<26?3:4,w=[62,26,9,2.6,.4].slice(0,mx+1);let r=Math.random()*w.reduce((a,b)=>a+b,0)*(1-Math.min(.6,(bonus||0)*.15));for(let i=0;i<w.length;i++){r-=w[i];if(r<0)return Math.max(i,Math.min(mn||0,mx))}return Math.min(mn||0,mx)}
const canUse=it=>{const t=itT(it);return (!t.cls||t.cls==hero.cls)&&(!t.arm||ARMC[t.arm].includes(hero.cls))&&hero.lvl>=it.req};
const fitsCls=(t,c)=>(!t.cls||t.cls==c)&&(!t.arm||ARMC[t.arm].includes(c));
function genItem_base(l,o){
  o=o||{};const T=tierOfLv(l)-1,want=o.cls||(Math.random()<.7?hero.cls:CLSK[R(0,4)]);
  let pool=ITPL.filter(t=>t.t==T&&fitsCls(t,want));const sl=o.sl;if(sl)pool=pool.filter(t=>t.sl==sl)||pool;
  const ws=pool.map(t=>t.sl=='weapon'?3:t.sl=='offhand'?1.2:t.sl=='chest'?2:t.sl=='amulet'||t.sl=='ring'?1.2:1.6);let r0=Math.random()*ws.reduce((a,b)=>a+b,0),tp=pool[0];
  for(let i=0;i<pool.length;i++){r0-=ws[i];if(r0<0){tp=pool[i];break}}
  const r=rolR2(l,o.minR||0,o.bonus),it={id:uid++,tp:ITPL.indexOf(tp),lv:l,req:Math.max(1,l-2),r,up:0,aff:[]};
  const keys=Object.keys(AFX).filter(k=>!(tp.sl=='weapon'&&k=='mp'));
  for(let i=0;i<r;i++){const k=keys.splice(R(0,keys.length-1),1)[0],A_=AFX[k];it.aff.push({k,v:A_[1]=='n'?Math.round(A_[2]*(2+l)*(.8+Math.random()*.5)):+(A_[2]*(1+T*.45)*(.8+Math.random()*.5)).toFixed(4)})}
  return it;
}
const itT=it=>ITPL[it.tp],itName=it=>it.u&&typeof unqName135=='function'&&unqName135(it)?'✦ '+(it.up?'+'+it.up+' ':'')+unqName135(it):(it.lp?'★ ':'')+(it.up?'+'+it.up+' ':'')+itT(it).n+(it.set?' ◆':'');   // v135: uniques (2470) have names of their own
function itStats(it){
  const tp=itT(it),l=it.lv,rm=[1,1.15,1.32,1.55,1.85][it.r]*(1+.045*(it.up||0)),s={};
  if(tp.sl=='weapon'){const W=WTYPE[tp.wt],a=(6+2.6*l)*W.k*rm;if(tp.wt=='staff'){s.ma=a;s.mp=(6+1.6*l)*rm}else s.pa=a}
  else if(tp.sl=='offhand'){s.pd=(3+1.6*l)*rm;s.md=(2+.9*l)*rm;s.blockC=.05+.012*tp.t}
  else if(tp.arm){const k={helm:.6,chest:1,boots:.5}[tp.sl],A_={heavy:[4,2.2,1,.9,8,5,0,0],medium:[3,1.6,2,1.2,6,4,0,0],light:[2,1.2,2,1.1,5,3.5,0,0],cloth:[1,.8,4,2,4,3,4,2]}[tp.arm];
    s.pd=(A_[0]+A_[1]*l)*k*rm;s.md=(A_[2]+A_[3]*l)*k*rm;s.hp=(A_[4]+A_[5]*l)*k*rm;if(A_[6])s.mp=(A_[6]+A_[7]*l)*k*rm;
    if(tp.sl=='boots')s.mspd=.02+.005*tp.t;if(tp.arm=='light'&&tp.sl=='chest')s.crit=.02+.005*tp.t;if(tp.arm=='medium'&&tp.sl=='chest')s.as=.02+.005*tp.t}
  else if(tp.sl=='amulet'){s.hp=(6+4*l)*rm;s.pa=(1.5+.7*l)*rm;s.ma=(1.5+.7*l)*rm}
  else if(tp.sl=='ring'){s.pa=(1.5+.8*l)*rm;s.ma=(1.5+.8*l)*rm;s.crit=.01+.004*tp.t}
  for(const k in s)if(['pa','ma','pd','md','hp','mp'].includes(k))s[k]=Math.round(s[k]);
  (it.aff||[]).forEach(a=>{const v=a.v*(1+.033*(it.up||0));s[a.k]=(s[a.k]||0)+(AFX[a.k][1]=='n'?Math.round(v):v)});
  return s;
}
const SNM={pa:'Physical attack',ma:'Magical attack',pd:'Physical defense',md:'Magical defense',hp:'Health',mp:'Mana',crit:'Critical chance',cdm:'Critical damage',as:'Attack speed',ls:'Lifesteal',hpP:'Max health',paP:'Physical attack',maP:'Magical attack',cdr:'Cooldown reduction',loot:'Loot find',xp:'Experience',mspd:'Move speed',regen:'Health regen /s',blockC:'Block chance'};
const fmtS=(k,v)=>(['pa','ma','pd','md','hp','mp'].includes(k)?'+'+Math.round(v):'+'+(+(v*100).toFixed(1))+'%');
function upCost(it){const T=tierOfLv(it.lv)-1,u=it.up||0;return {m:UPM[T][0],n:1+Math.floor(u/2)+(u>=7?2:0),g:Math.round((25+it.lv*7)*(u+1)*(1+it.r*.3)*.65),ch:[1,1,1,1,1,.85,.72,.6,.48,.36][u]||0}}
function doUpgrade_base(it){
  if((it.up||0)>=10)return say('This item is fully upgraded.');
  if(townAt(pl.position.x,pl.position.z,1)<0)return say('Upgrades need a forge. Visit any town.');
  const c=upCost(it);if((mats[c.m]||0)<c.n)return say('You need '+c.n+'× '+c.m+'.');if(gold<c.g)return say('Not enough gold.');
  mats[c.m]-=c.n;gold-=c.g;
  if(Math.random()<c.ch){it.up=(it.up||0)+1;hsDirty();say('⚒️ Upgrade succeeded! '+itName(it));burst(gY(pl.position,1.2),0xffd24a,30,2,2,.6)}
  else say('💥 The upgrade failed. Materials were lost, but the item is unharmed.');
  hud();
}
function rollEgg(T){const f=FAMK[R(0,FAMK.length-1)];return mkEgg(famTier(f,T),T-1,.95+Math.random()*.15)}
function lootE_base(e){
  const c=e.c,l=c.l,al=c.al?1:0,bs=c.boss?1:0,p=e.m.position,T=c.zt||tierOfLv(l),lk=1+HS().loot,en=EN[c.en]||{},fam=en.fam||famOf(c.g[0]);
  const g=Math.max(1,Math.round((3+l*1.4)*(1+al*2+bs*12)*(.7+Math.random()*.6)*.65));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1100);
  if(bs){for(let i=0;i<2;i++){const it=genItem(l,{minR:2,cls:hero.cls});drop('gear',it,p,it.r)}}
  else if(Math.random()<(al?.3:.035)*lk){const it=genItem(l,{minR:al});drop('gear',it,p,it.r)}
  if(Math.random()<(bs?1:al?.12:.04)*lk){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}
  if(Math.random()<(bs?1:al?.5:.1)*lk)drop('mat',{k:UPM[T-1][0],n:bs?R(3,5):al?R(1,3):1},p,T-1);
  if(Math.random()<(bs?1:al?.6:.18)*lk)drop('mat',{k:FAMD[fam].mat,n:bs?R(5,8):al?R(2,4):R(1,2)},p,1);
  if(Math.random()<.06*lk)drop('potion',null,p,1);
}
function take_base(d){
  if(d.kind=='gear'){const g=d.data;gear.push(g);const t=itT(g);pickup({ic:icoOf(g),t:itName(g),col:RAR[g.r][1],sub:RAR[g.r][0]+' '+SLOTN[t.sl]+(canUse(g)?'':fitsCls(t,hero.cls)?' · needs Lv '+g.req:' · other class'),r:g.r})}
  if(d.kind=='egg'){const g=d.data;eggs.push(g);pickup({ic:'🥚',t:'Tier '+(g.tier+1)+' '+g.sp+' Egg',col:RAR[g.tier][1],sub:(TGI[g.tag]||'')+' '+g.tag+' egg',r:g.tier})}
  if(d.kind=='item'){const it=ITEMS[d.data.k];have[d.data.k]=(have[d.data.k]||0)+d.data.n;pickup({ic:it.i,t:'+'+d.data.n+' '+it.n,col:'#8ee6ff',sub:'For your Realm',r:2})}
  if(d.kind=='potion'){pots++;pickup({ic:'🧪',t:'Health Potion',col:'#6ee7b7'})}
  if(d.kind=='mat'){mats[d.data.k]=(mats[d.data.k]||0)+d.data.n;pickup({ic:matInfo(d.data.k)[1],t:'+'+d.data.n+' '+d.data.k,col:'#e8f0ff'})}
}
