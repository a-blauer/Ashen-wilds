// ---------------- registry hookups (mutate the original tables in place) ----------------
SPK.forEach(n=>{const q=SP2[n];S[n]=Object.assign(S[n]||{},{e:q[3],c:q[4],h:q[5],t:q[6],hp:20,a:8,d:5});TAGS[n]=q[0]});
Object.keys(EN).forEach(k=>{S[k]=S[k]||{e:EN[k].e,c:EN[k].col||0x888888,h:'X',t:'x',hp:20,a:8,d:5};MSET[k]=EN[k].moves});
FAMS.length=0;FAMK.forEach(f=>FAMS.push(f));
[TGI,FAMC,FAM,HAB].forEach(o=>Object.keys(o).forEach(k=>delete o[k]));
FAMK.forEach(f=>{const F=FAMD[f];TGI[f]=F.i;FAMC[f]=F.col;FAM[f]=[F.mat,F.mi];HAB[f]=F.hab});
['Slime Scale','Grave Dust','Spore Cap'].forEach(k=>delete mats[k]);FAMK.forEach(f=>{mats[FAMD[f].mat]=mats[FAMD[f].mat]||0});UPM.forEach(u=>mats[u[0]]=0);
Object.keys(ITEMS).filter(k=>k.startsWith('i:')).forEach(k=>delete ITEMS[k]);
FAMK.forEach(t=>{const k='i:'+t;ITEMS[k]={id:'inc_'+t,key:k,n:t+' Incubator',i:TGI[t],cat:3,fam:t,s:1,cz:0,out:1,rec:{wood:6,stone:6,[FAM[t][0]]:5},mk:mkPed(t)}});
// ---------------- hero state ----------------
Object.assign(hero,{cls:'warrior',lvl:1,xp:0,tal:{},buffs:[],dc:2,sh:0,shT:0,lastHit:-1e9,name:'Hero',cd:{},chan:null});
let HSc=null,HSt=0;const hsDirty=()=>{HSc=null};
const zones=[],traps=[];
function talRank(id){return hero.tal[id]||0}
function talSpent(b){const T=TAL[hero.cls];let n=0;(b==null?T:[T[b]]).forEach(br=>br.t.forEach(t=>n+=talRank(t[0])));return n}
const tpFree=()=>Math.max(0,hero.lvl-1-talSpent());
function talMods(){const o={};TAL[hero.cls].forEach(br=>br.t.forEach(t=>{const r=talRank(t[0]);if(r)for(const k in t[5])o[k]=(o[k]||0)+t[5][k]*r}));return o}
function HS(){
  const now=performance.now();if(HSc&&now-HSt<80)return HSc;
  const C=CLS[hero.cls],l=hero.lvl,T=talMods(),s={hp:C.base.hp+C.per.hp*(l-1),mp:C.base.mp+C.per.mp*(l-1),pa:C.base.pa+C.per.pa*(l-1),ma:C.base.ma+C.per.ma*(l-1),pd:C.base.pd+C.per.pd*(l-1),md:C.base.md+C.per.md*(l-1),
    crit:C.crit,cdm:.75,as:0,ls:0,cdr:0,skillP:0,basicP:0,dr:0,regen:0,mpr:0,dash:2,dashR:0,iframe:0,mspd:0,empP:0,compP:0,healP:0,thorns:0,exec:0,first:0,lowdr:0,killheal:0,finisher:0,pierce:0,echo:0,shieldP:0,aoeP:0,poisonP:0,stunP:0,blockC:hero.cls=='paladin'?.08:0,loot:0,xp:0,gath:0,berserk:0,slowOn:0,poisonOn:0};
  const P={hpP:0,mpP:0,paP:0,maP:0,pdP:0,mdP:0};
  const add=o=>{for(const k in o){if(k in P)P[k]+=o[k];else if(k!='dash3')s[k]=(s[k]||0)+o[k]}};
  SLOTS.forEach(k=>{const it=eq[k];if(it&&canUse(it))add(itStats(it))});
  add(T);if(talRank('a14')>=3)s.dash+=1;
  party.slice(0,2).forEach(c=>{if(!c||c.h<=0)return;
    (c.mods||[]).forEach(m=>{const Mo=MODS[m];if(Mo.t)add(Mo.t);if(c.emp&&Mo.e)add(Mo.e)});
    if(c.emp){const k=.4*(1+(T.empP||0));s.hp+=cM(c)*k;s.pa+=cStat(c,'pa')*k;s.ma+=cStat(c,'ma')*k;s.pd+=cStat(c,'pd')*k;s.md+=cStat(c,'md')*k;
      (c.sp||[]).forEach(n=>{const sp=CSP[n];if(sp&&sp.emp&&sp.emp.k=='stat')add(sp.emp.s)})}});
  hero.buffs.forEach(b=>{if(b.t>now)add(b.s)});
  s.hp*=1+P.hpP;s.mp*=1+P.mpP;s.pa*=1+P.paP;s.ma*=1+P.maP;s.pd*=1+P.pdP;s.md*=1+P.mdP;s.dash=Math.floor(s.dash);
  HSc=s;HSt=now;return s;
}
const heroMt=()=>CLS[hero.cls].mt,atkOf=mt=>{const s=HS();return mt=='m'?s.ma:s.pa};
function healHero(v,quiet){const s=HS(),a=Math.min(heroMax()-hero.hp,v*(1+s.healP));if(a<=0)return;hero.hp+=a;if(!quiet&&a>=1)dn(pl.position,'+'+Math.round(a),'#6ee7b7',-10)}
// ---------------- creature + enemy stats ----------------
const CBS={hp:60,pa:9,ma:9,pd:6,md:6},CGS={hp:15,pa:2.5,ma:2.5,pd:1.7,md:1.7};
function cStat(c,k){
  if(c.st)return c.st[k];
  const n=c.g[0],F=FAMD[famOf(n)],t=tierSp(n),TM=1+.55*(t-1),GM=1+.2*(t-1);
  let v=(CBS[k]*TM+CGS[k]*GM*((c.l||1)-1))*F.w[k];
  v*=k=='hp'?c.iv.hp:(k=='pa'||k=='ma')?c.iv.a:c.iv.d;
  v*=(1+.1*(c.fp||0))*(1+.1*(c.evo||0))*vm(c,k=='hp'?0:(k=='pa'||k=='ma')?1:2);
  (c.mods||[]).forEach(m=>{const s=MODS[m].s;if(s&&s[k+'P'])v*=1+s[k+'P']});
  return v;
}
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
function mkC(n,l,f,v,iv){
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
function heroHit(e,raw,mt,o){
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
function compHit(c,e,mult,fx){
  if(!e||e.dead)return 0;const s=HS();let d=dmgCE(c,e.c,mult)*(1+s.compP);if(e.wk>0)d*=1.2;if(e.mark>0)d*=1+(e.markV||.35);
  const gap=e.c.l-c.l;if(gap>0)d*=Math.max(.2,1-.08*gap);d=Math.max(1,Math.round(d));hurt(e,d,{col:0xffd24a},false);
  if((c.mods||[]).includes('Vampiric'))c.h=Math.min(M(c),c.h+Math.round(d*.06));
  if(fx){const atk=xMt(c)=='m'?cStat(c,'ma'):cStat(c,'pa');eStatus(e,fx,atk*.3);if(fx.drain){const hv=Math.round(d*fx.drain);if(c.emp)healHero(hv);else c.h=Math.min(M(c),c.h+hv)}}
  return d;
}
function eStatus(e,fx,atk,src){
  if(!e||e.dead)return;
  if(fx.slow)e.ch=Math.max(e.ch||0,fx.slow);
  if(fx.stun){const t=fx.stun*(1+(src=='h'?HS().stunP:0))*(e.boss?.3:e.c.al?.6:1);e.stun=Math.max(e.stun||0,t);if(!e.boss)mCancel(e);dn(e.m.position,'Stunned','#ffe08a',-30,700)}
  if(fx.root)e.root=Math.max(e.root||0,fx.root*(e.boss?.3:1));
  if(fx.weak)e.wk=Math.max(e.wk||0,fx.weak);
  e.dots=e.dots||[];
  [['burn',.32,0xff7a2a],['poison',.28,0x8ad84a],['bleed',.24,0xd03a3a]].forEach(([k,rt,col])=>{if(fx[k]&&atk>0){const old=e.dots.find(q=>q.k==k);const dps=atk*rt;if(old){old.t=Math.max(old.t,fx[k]);old.dps=Math.max(old.dps,dps)}else e.dots.push({k,t:fx[k],dps,ti:0,col})}});
}
// status + enrage tick for each enemy; returns true when the enemy is stunned (no AI this frame)
function eTick(e,dt,now){
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
  if(me.h<=0){say(nm(me)+' fainted!');if(me.emp){me.emp=false;hsDirty();hero.hp=Math.min(hero.hp,heroMax())}const j=party.findIndex((c,q)=>q>=2&&c.h>0);if(j>0){const t=party[j];party[j]=me;party[i]=t}ui()}
}
function hitHero(e,mult,mt){
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
function hurt(e,d,s,crit,dot){
  if(e.dead)return;e.c.h=Math.max(0,e.c.h-d);e.m.flT=dot?e.m.flT:performance.now();
  dn(e.m.position,crit?d+'!':d,crit?'#ffb020':s&&s.col!=null?'#'+('00000'+s.col.toString(16)).slice(-6):'#fff',crit?-8:0,crit?900:700);
  if(crit){const el=$('stage').lastChild;if(el&&el.className=='dn')el.style.fontSize='1.35rem'}
  if(!dot){burst(gY(e.m.position,.7),s&&s.col!=null?s.col:0xffe6b0,crit?14:7,2.5,2,.4);const a=V().subVectors(e.m.position,pl.position).setY(0).normalize(),kb=e.boss?.2:e.c.al?1.5:3.5;e.vx=a.x*kb;e.vz=a.z*kb}
  e.agg=1;
  if(e.c.h<=0){e.dead=1;e.hb.visible=false;kill(e)}
}
function area(p,r,dm,s,dir,half){
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
  const s=HS(),c=e.c;let xp=(8+c.l*6)*(c.al?3:1)*(c.boss?25:1)*(1+s.xp+restBonus());
  const gap=c.l-hero.lvl;xp*=gap<-5?.25:gap<-2?.7:gap>2?1.2:1;xp=Math.round(xp);
  if(hero.lvl<MAXLV){hero.xp+=xp;while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}else hero.xp=0;
  party.slice(0,2).forEach(c2=>{if(!c2||c2.h<=0||c2.l>=MAXLV)return;c2.x+=xp;while(c2.l<MAXLV&&c2.x>=needH(c2.l)){c2.x-=needH(c2.l);c2.l++;c2.h=M(c2);say(nm(c2)+' reached Lv '+c2.l+'!'+(EVLV.includes(c2.l)?' ✨ It can evolve now (Companions menu).':''))}});
  return xp;
}
function heroLevelUp(){
  hero.lvl++;hsDirty();hero.hp=heroMax();hero.mp=mpMax();
  const ns=SKL[hero.cls].find(k=>k.lv==hero.lvl);
  banner('LEVEL '+hero.lvl,CLS[hero.cls].n+' · +1 talent point (press K)',ns?'New skill unlocked: '+ns.i+' '+ns.n:'Health and mana fully restored');
  ring(pl.position,0xffd24a,3.6,800);burst(gY(pl.position,1),0xffd24a,70,4.5,4,1.2);
}
function kill(e){
  const xp=gainXP(e),sp=e.c.g[0];kills[sp]=(kills[sp]||0)+1;
  dn(e.m.position,'+'+xp+' XP','#c4b5fd',0,1400);
  burst(gY(e.m.position,.6),e.c.boss?0xff6a3a:e.c.al?0xb04aff:0xcc3322,e.c.boss?90:30,3.5,3,.8);
  const s=HS();if(s.killheal)healHero(heroMax()*s.killheal,true);
  if(e.boss)bossT[e.bi]=300;
  mCancel(e);e.m.pose=null;lootE(e);ui();
  if(tgt===e)setTarget(null);
  if(e.m.isE){const b=e.m.b,sd=Math.random()<.5?1:-1;tw(380,k=>{b.rotation.z=sd*1.45*(1-Math.pow(1-k,3));b.position.y=.1*Math.sin(k*Math.PI)})}
  setTimeout(()=>shrink(e.m,()=>removeE(e)),260);
}
// ---------------- loot ----------------
function rolR2(l,mn,bonus){const mx=l<6?1:l<14?2:l<26?3:4,w=[62,26,9,2.6,.4].slice(0,mx+1);let r=Math.random()*w.reduce((a,b)=>a+b,0)*(1-Math.min(.6,(bonus||0)*.15));for(let i=0;i<w.length;i++){r-=w[i];if(r<0)return Math.max(i,Math.min(mn||0,mx))}return Math.min(mn||0,mx)}
const canUse=it=>{const t=itT(it);return (!t.cls||t.cls==hero.cls)&&(!t.arm||ARMC[t.arm].includes(hero.cls))&&hero.lvl>=it.req};
const fitsCls=(t,c)=>(!t.cls||t.cls==c)&&(!t.arm||ARMC[t.arm].includes(c));
function genItem(l,o){
  o=o||{};const T=tierOfLv(l)-1,want=o.cls||(Math.random()<.7?hero.cls:CLSK[R(0,4)]);
  let pool=ITPL.filter(t=>t.t==T&&fitsCls(t,want));const sl=o.sl;if(sl)pool=pool.filter(t=>t.sl==sl)||pool;
  const ws=pool.map(t=>t.sl=='weapon'?3:t.sl=='offhand'?1.2:t.sl=='chest'?2:t.sl=='amulet'||t.sl=='ring'?1.2:1.6);let r0=Math.random()*ws.reduce((a,b)=>a+b,0),tp=pool[0];
  for(let i=0;i<pool.length;i++){r0-=ws[i];if(r0<0){tp=pool[i];break}}
  const r=rolR2(l,o.minR||0,o.bonus),it={id:uid++,tp:ITPL.indexOf(tp),lv:l,req:Math.max(1,l-2),r,up:0,aff:[]};
  const keys=Object.keys(AFX).filter(k=>!(tp.sl=='weapon'&&k=='mp'));
  for(let i=0;i<r;i++){const k=keys.splice(R(0,keys.length-1),1)[0],A_=AFX[k];it.aff.push({k,v:A_[1]=='n'?Math.round(A_[2]*(2+l)*(.8+Math.random()*.5)):+(A_[2]*(1+T*.45)*(.8+Math.random()*.5)).toFixed(4)})}
  return it;
}
const itT=it=>ITPL[it.tp],itName=it=>(it.up?'+'+it.up+' ':'')+itT(it).n;
function itStats(it){
  const tp=itT(it),l=it.lv,rm=[1,1.15,1.32,1.55,1.85][it.r]*(1+.07*(it.up||0)),s={};
  if(tp.sl=='weapon'){const W=WTYPE[tp.wt],a=(6+2.6*l)*W.k*rm;if(tp.wt=='staff'){s.ma=a;s.mp=(6+1.6*l)*rm}else s.pa=a}
  else if(tp.sl=='offhand'){s.pd=(3+1.6*l)*rm;s.md=(2+.9*l)*rm;s.blockC=.05+.012*tp.t}
  else if(tp.arm){const k={helm:.6,chest:1,boots:.5}[tp.sl],A_={heavy:[4,2.2,1,.9,8,5,0,0],medium:[3,1.6,2,1.2,6,4,0,0],light:[2,1.2,2,1.1,5,3.5,0,0],cloth:[1,.8,4,2,4,3,4,2]}[tp.arm];
    s.pd=(A_[0]+A_[1]*l)*k*rm;s.md=(A_[2]+A_[3]*l)*k*rm;s.hp=(A_[4]+A_[5]*l)*k*rm;if(A_[6])s.mp=(A_[6]+A_[7]*l)*k*rm;
    if(tp.sl=='boots')s.mspd=.02+.005*tp.t;if(tp.arm=='light'&&tp.sl=='chest')s.crit=.02+.005*tp.t;if(tp.arm=='medium'&&tp.sl=='chest')s.as=.02+.005*tp.t}
  else if(tp.sl=='amulet'){s.hp=(6+4*l)*rm;s.pa=(1.5+.7*l)*rm;s.ma=(1.5+.7*l)*rm}
  else if(tp.sl=='ring'){s.pa=(1.5+.8*l)*rm;s.ma=(1.5+.8*l)*rm;s.crit=.01+.004*tp.t}
  for(const k in s)if(['pa','ma','pd','md','hp','mp'].includes(k))s[k]=Math.round(s[k]);
  (it.aff||[]).forEach(a=>{const v=a.v*(1+.05*(it.up||0));s[a.k]=(s[a.k]||0)+(AFX[a.k][1]=='n'?Math.round(v):v)});
  return s;
}
const SNM={pa:'Physical attack',ma:'Magical attack',pd:'Physical defense',md:'Magical defense',hp:'Health',mp:'Mana',crit:'Critical chance',cdm:'Critical damage',as:'Attack speed',ls:'Lifesteal',hpP:'Max health',paP:'Physical attack',maP:'Magical attack',cdr:'Cooldown reduction',loot:'Loot find',xp:'Experience',mspd:'Move speed',regen:'Health regen /s',blockC:'Block chance'};
const fmtS=(k,v)=>(['pa','ma','pd','md','hp','mp'].includes(k)?'+'+Math.round(v):'+'+(+(v*100).toFixed(1))+'%');
function upCost(it){const T=tierOfLv(it.lv)-1,u=it.up||0;return {m:UPM[T][0],n:1+Math.floor(u/2)+(u>=7?2:0),g:Math.round((25+it.lv*7)*(u+1)*(1+it.r*.3)),ch:[1,1,1,1,1,.85,.72,.6,.48,.36][u]||0}}
function doUpgrade(it){
  if((it.up||0)>=10)return say('This item is fully upgraded.');
  if(townAt(pl.position.x,pl.position.z,1)<0)return say('Upgrades need a forge. Visit any town.');
  const c=upCost(it);if((mats[c.m]||0)<c.n)return say('You need '+c.n+'× '+c.m+'.');if(gold<c.g)return say('Not enough gold.');
  mats[c.m]-=c.n;gold-=c.g;
  if(Math.random()<c.ch){it.up=(it.up||0)+1;hsDirty();say('⚒️ Upgrade succeeded! '+itName(it));burst(gY(pl.position,1.2),0xffd24a,30,2,2,.6)}
  else say('💥 The upgrade failed. Materials were lost, but the item is unharmed.');
  hud();
}
function rollEgg(T){const f=FAMK[R(0,FAMK.length-1)];return mkEgg(famTier(f,T),T-1,.95+Math.random()*.15)}
function lootE(e){
  const c=e.c,l=c.l,al=c.al?1:0,bs=c.boss?1:0,p=e.m.position,T=c.zt||tierOfLv(l),lk=1+HS().loot,en=EN[c.en]||{},fam=en.fam||famOf(c.g[0]);
  const g=Math.round((3+l*1.4)*(1+al*2+bs*12)*(.7+Math.random()*.6));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1100);
  if(bs){for(let i=0;i<2;i++){const it=genItem(l,{minR:2,cls:hero.cls});drop('gear',it,p,it.r)}}
  else if(Math.random()<(al?.3:.035)*lk){const it=genItem(l,{minR:al});drop('gear',it,p,it.r)}
  if(Math.random()<(bs?1:al?.12:.02)*lk){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}
  if(Math.random()<(bs?1:al?.5:.1)*lk)drop('mat',{k:UPM[T-1][0],n:bs?R(3,5):al?R(1,3):1},p,T-1);
  if(Math.random()<(bs?1:al?.6:.18)*lk)drop('mat',{k:FAMD[fam].mat,n:bs?R(5,8):al?R(2,4):R(1,2)},p,1);
  if(Math.random()<.06*lk)drop('potion',null,p,1);
  for(let n=bs?3:1;n>0;n--)if(Math.random()<(bs?1:al?.28:.07)){const H=HAB[fam]||HAB.Beast,pool=(Math.random()<.55?H.dec.map(x=>'d:'+x):H.ter.map(x=>'t:'+x)),k=pool[R(0,pool.length-1)];if(ITEMS[k])drop('item',{k:k,n:k[0]=='t'?R(2,4):1},p,2)}
}
function take(d){
  if(d.kind=='gear'){const g=d.data;gear.push(g);const t=itT(g);pickup({ic:icoOf(g),t:itName(g),col:RAR[g.r][1],sub:RAR[g.r][0]+' '+SLOTN[t.sl]+(canUse(g)?'':fitsCls(t,hero.cls)?' · needs Lv '+g.req:' · other class'),r:g.r})}
  if(d.kind=='egg'){const g=d.data;eggs.push(g);pickup({ic:'🥚',t:'Tier '+(g.tier+1)+' '+g.sp+' Egg',col:RAR[g.tier][1],sub:(TGI[g.tag]||'')+' '+g.tag+' egg',r:g.tier})}
  if(d.kind=='item'){const it=ITEMS[d.data.k];have[d.data.k]=(have[d.data.k]||0)+d.data.n;pickup({ic:it.i,t:'+'+d.data.n+' '+it.n,col:'#8ee6ff',sub:'For your Realm',r:2})}
  if(d.kind=='potion'){pots++;pickup({ic:'🧪',t:'Health Potion',col:'#6ee7b7'})}
  if(d.kind=='mat'){mats[d.data.k]=(mats[d.data.k]||0)+d.data.n;pickup({ic:matInfo(d.data.k)[1],t:'+'+d.data.n+' '+d.data.k,col:'#e8f0ff'})}
}
// ---------------- spawning ----------------
function spawnEnemy(key,x,z,l,o){
  o=o||{};const al=!!o.al,c=enemyC(key,l,{al}),m=cr(c);if(o.zt)c.zt=o.zt;
  if(al){m.bs*=1.35;const r=new THREE.Mesh(new THREE.RingGeometry(.75,.95,24),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.06;m.add(r)}
  m.position.set(x,0,z);m.isE=1;m.scale.setScalar(.001);scene.add(m);tw(450,k=>m.scale.setScalar(m.bs*k));
  const e={c,m,hb:bar(al),cd:1.2,ch:0,vx:0,vz:0,tier:tierOfLv(l)-1,wx:x,wz:z,wt:0,agg:o.agg?1:0,minion:o.minion?1:0,dots:[]};enemies.push(e);return e;
}
function spawn(init){
  let x,y,n=0;
  do{const an=Math.random()*6.283,di=(init?8:24)+Math.random()*(init?40:34);x=Math.round(pl.position.x+Math.cos(an)*di);y=Math.round(pl.position.z+Math.sin(an)*di);n++}while((x<2||y<2||x>W-3||y>H-3||solid(x,y)||townAt(x,y,16)>=0||enemies.some(o=>Math.hypot(o.m.position.x-x,o.m.position.z-y)<10))&&n<80);
  if(n>=80)return;
  const b=BIOMES[MAP.bio[y][x]],list=BIOEN[b.n]||['hobgoblin'],key=list[R(0,list.length-1)];
  const al=Math.random()<.05+.012*b.t;spawnEnemy(key,x,y,Math.min(MAXLV,zoneLv(x,y)+(al?2:0)),{al,zt:b.t});
}
function spawnAt(x,z,l,par){const b=BIOMES[MAP.bio[Math.round(z)][Math.round(x)]],list=BIOEN[b.n]||['hobgoblin'];spawnEnemy(list[0],x,z,l,{minion:1,agg:1})}
function spawnBoss(i){
  const d=BOSSES[i],key='boss'+i;if(!EN[key]){EN[key]={n:d.name,e:'☠️',rig:d.sp,col:S[d.sp]?S[d.sp].c:0x888888,w:{hp:1,pa:1.05,ma:1.05,pd:1.1,md:1.1},mt:'p',moves:[],fam:famOf(d.sp)};S[key]={e:'☠️',c:0x888888}}
  const c=enemyC(key,d.lvl,{boss:1});c.n=d.name;const m=cr(c);m.bs*=2.6;m.scale.setScalar(m.bs);m.position.set(d.x,0,d.y);
  const r=new THREE.Mesh(new THREE.RingGeometry(.9,1.1,32),addMat(0xff3a2a));r.rotation.x=-Math.PI/2;r.position.y=.06;m.add(r);scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  enemies.push({c,m,hb,boss:1,bi:i,tier:4,home:[d.x,d.y],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:2.5,s1:0,s2:0,en:0,busy:0},wx:d.x,wz:d.y,wt:0,dots:[]});
}
// ---------------- humanoid enemies (share the hero's skinned rig) ----------------
function mkWpn(type,col,r){
  const g=new THREE.Group(),mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:.6,emissive:r>=3?c:0,emissiveIntensity:r>=3?.3:0}),wood=new THREE.MeshStandardMaterial({color:0x4a3320,roughness:.8});
  const a=(geo,m,x,y,z,sx,sy,sz,rx,rz)=>{const o=new THREE.Mesh(geo,m.isMaterial?m:mat(m));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx||0,0,rz||0);o.castShadow=true;g.add(o);return o};
  const grip=()=>{a(RY,wood,0,0,0,.036,.16,.036);[-.05,-.02,.01,.04].forEach(y=>a(RTO,0x2a1c12,0,y,0,.026,.026,.4,Math.PI/2))};
  if(type=='sword'){grip();a(RB,0x8a7a4a,0,-.1,0,.24,.035,.06);a(RB,col,0,-.45,0,.06,.7,.018);a(RC,col,0,-.84,0,.06,.1,.018,0,Math.PI)}
  else if(type=='gs'){a(RY,wood,0,.05,0,.04,.32,.04);a(RB,0x8a7a4a,0,-.14,0,.34,.045,.07);a(RB,col,0,-.66,0,.09,1.0,.022);a(RB,0x20252e,0,-.62,0,.02,.75,.026);a(RC,col,0,-1.22,0,.09,.14,.022,0,Math.PI)}
  else if(type=='ga'||type=='axe'){const big=type=='ga';a(RB,0x4a3320,0,-.35,0,.04,big?1.0:.8,.04);a(RB,col,.14,big?-.78:-.62,0,big?.36:.3,big?.3:.24,.04);a(RC,col,.34,big?-.78:-.62,0,.09,.16,.04,0,-Math.PI/2);if(big){a(RB,col,-.14,-.78,0,.3,.26,.04);a(RC,col,-.32,-.78,0,.08,.14,.04,0,Math.PI/2)}}
  else if(type=='mace'||type=='club'||type=='hammer'){a(RB,type=='club'?0x6a4a2a:0x4a3320,0,-.3,0,.04,.7,.04);if(type=='club')a(RS,0x6a4a2a,0,-.7,0,.12,.2,.12);else if(type=='hammer'){a(RB,col,0,-.72,0,.36,.2,.2);a(RB,0x8a7a4a,0,-.72,0,.38,.06,.22)}else{a(RS,col,0,-.72,0,.14,.14,.14);[0,1,2,3].forEach(i=>a(RC,col,Math.cos(i*1.57)*.15,-.72+Math.sin(i*1.57)*.15,0,.04,.09,.04,0,i*1.57-Math.PI/2))}}
  else if(type=='dagger'){a(RY,wood,0,0,0,.03,.12,.03);a(RB,0x8a7a4a,0,-.08,0,.15,.03,.05);a(RB,col,0,-.27,0,.05,.36,.015);a(RC,col,0,-.47,0,.05,.08,.015,0,Math.PI)}
  else if(type=='staff'){a(RY,wood,0,-.2,0,.035,1.5,.035);const gem=a(RS,new THREE.MeshBasicMaterial({color:col}),0,-.98,0,.09,.12,.09);a(RTO,0x8a7a4a,0,-.93,0,.08,.08,.5,Math.PI/2);g.gem=gem}
  else if(type=='bow'){const arc=new THREE.Mesh(new THREE.TorusGeometry(.55,.022,6,20,Math.PI*.9),new THREE.MeshStandardMaterial({color:0x5a3a20,roughness:.6}));arc.rotation.z=Math.PI/2+Math.PI*.05;g.add(arc);const st=new THREE.Mesh(RY,new THREE.MeshBasicMaterial({color:0xe8e0c8}));st.scale.set(.006,1.08,.006);st.position.x=-.08;g.add(st);g.str=st}
  else if(type=='sling'){a(RY,0x6a5a3a,0,-.2,0,.01,.4,.01);a(RS,0x5a4a3a,0,-.42,0,.06,.06,.06)}
  else if(type=='shield'){a(RY,mat(col),0,0,0,.42,.06,.5,Math.PI/2);a(RS,0xd8b44a,0,0,.04,.08,.08,.04);a(RTO,0x8a7a4a,0,0,0,.42,.42,.4,0)}
  return g;
}
function mkHumanoid(key){
  const L=HUMLOOK[key],g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const h=new THREE.Group();b.add(h);
  const spec=Object.assign({},HSPEC,{id:'HE_'+key,pal:Object.assign({},HSPEC.pal,{skin:L.skin,cape:L.cape,pants:L.pants,boot:L.boot||[24,20,18],dk:L.dk||[28,20,14],bel:[90,70,50]})});
  const mb=mkBones(HSPEC),bones=mb.bones,mesh=new THREE.SkinnedMesh(rigGeo(HSPEC),rigMat(spec,L.tunic,''));
  mesh.castShadow=true;mesh.frustumCulled=false;mesh.add(bones.pelvis);h.add(mesh);mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  const ax=mkAx(HSPEC,bones),SK=(L.skin[0]<<16)|(L.skin[1]<<8)|L.skin[2];h.bones=bones;h.ax=ax;h.legs=[bones.lh0,bones.rh0];h.arms=[bones.aL0,bones.aR0];h.torso=bones.spine;h.gearG=[];
  [['aL2',-.25],['aR2',.25]].forEach(a=>{[0,1,2,3].forEach(i=>ax(a[0],RB,SK,a[1]+(i-1.5)*.017,.52,.03,.014,.05,.016))});
  [['lh2',-.1],['rh2',.1]].forEach(a=>{ax(a[0],RTO,0x1a1410,a[1],.13,0,.075,.075,.5,Math.PI/2);ax(a[0],RB,0x120e0b,a[1],.012,.04,.09,.024,.2)});
  ax('spine',RTO,0x1a120c,0,.6,0,.17,.17,.5,Math.PI/2);
  const eye=(c,e)=>[-1,1].forEach(s=>ax('head',RS,c,s*.045,1.15,.1,.018*(e||1),.014*(e||1),.01,0,0,true)),hd=L.head;
  if(hd=='goblin'||hd=='goblinhood'){[-1,1].forEach(s=>ax('head',RC,SK,s*.13,1.17,0,.03,.14,.03,0,-s*1.25));eye(0xffd040);ax('head',RS,SK,0,1.12,.115,.022,.03,.03);[-1,1].forEach(s=>ax('head',RC,0xf0e8d0,s*.035,1.07,.1,.008,.03,.008,Math.PI));if(hd=='goblinhood')ax('head',HEM,0x4a3a2a,0,1.15,-.01,.135,.14,.14,-.25,0)}
  else if(hd=='mask'){ax('head',HEM,0x26242a,0,1.15,-.01,.135,.14,.14,-.2,0);ax('head',RB,0x1a1a1e,0,1.1,.1,.1,.05,.03);eye(0xf0e0c0,.8)}
  else if(hd=='helm'){ax('head',HEM,0x7a7a82,0,1.16,0,.13,.13,.13);ax('head',RB,0x7a7a82,0,1.12,.115,.016,.07,.02);eye(0x1a1a1a)}
  else if(hd=='feather'){ax('head',RTO,0x8a3a2a,0,1.2,0,.12,.12,.4,Math.PI/2);[-1,0,1].forEach(i=>ax('head',RC,[0xd04a2a,0x4ab0d0,0xe8c04a][i+1],i*.05,1.3,-.06,.025,.14,.025,-.3,i*.3));eye(0xffe060)}
  else if(hd=='hoodred'){ax('head',HEM,0x6a1410,0,1.15,-.01,.14,.16,.15,-.2,0);ax('head',RC,0x6a1410,0,1.32,-.06,.07,.14,.07,-.5);eye(0xff6a2a,1.1)}
  else if(hd=='orc'){[-1,1].forEach(s=>ax('jaw'in h.bones?'head':'head',RC,0xf0e8d0,s*.05,1.08,.11,.014,.05,.014));ax('head',RB,SK,0,1.19,.09,.18,.03,.05);eye(0xff3a2a);ax('head',RC,0x1a1410,0,1.3,-.03,.04,.12,.04,-.4)}
  else if(hd=='skull'||hd=='skullhood'){[-1,1].forEach(s=>ax('head',RS,0x0a0a0a,s*.045,1.15,.1,.03,.03,.02));[-1,1].forEach(s=>ax('head',RS,0x6aff9a,s*.045,1.15,.115,.01,.01,.01,0,0,true));ax('head',RB,0xe8e0c8,0,1.06,.1,.08,.02,.02);if(hd=='skullhood')ax('head',HEM,0x3a3a30,0,1.15,-.01,.14,.15,.15,-.25,0)}
  else if(hd=='greathelm'){ax('head',RB,0x3a3a44,0,1.15,.01,.25,.26,.25);ax('head',RB,0x0a0a0a,0,1.16,.13,.18,.02,.01);[-1,1].forEach(s=>ax('head',RC,0xd8d0c0,s*.15,1.3,0,.035,.18,.035,0,-s*.6));ax('head',RS,0xff3a2a,0,1.16,.135,.03,.008,.005,0,0,true)}
  else if(hd=='giant'){ax('head',RC,0xd8d8e8,0,1.02,.08,.12,.22,.08,Math.PI);eye(0x8ae0ff,1.3);[-1,1].forEach(s=>ax('head',RC,0xd8d0c0,s*.1,1.26,0,.025,.1,.025,0,-s*.4))}
  else if(hd=='mummy'){[0,1,2].forEach(i=>ax('head',RTO,0xc8b080,0,1.08+i*.06,0,.125,.125,.6,Math.PI/2,i*.2));eye(0xffd040,1.2)}
  else eye(0x1a1a1a);
  const wtype=L.wpn=='sword'?'sword':L.wpn,wp=mkWpn(wtype,L.wcol,0);
  if(L.wpn=='bow'){wp.rotation.set(0,Math.PI/2,0);wp.position.set(-.05,-.02,.05);bones.aL2.add(wp)}else{wp.rotation.x=-1.0;wp.position.set(0,-.03,.02);bones.aR2.add(wp)}
  if(key=='skel'){const sh=mkWpn('shield',0x5a5a62,0);sh.position.set(-.06,0,.06);sh.rotation.y=Math.PI/2;bones.aL2.add(sh)}
  if(L.bone)mesh.material=mesh.material;
  g.h=h;g.isHum=1;g.rig=(now,mv,sp)=>humAnim(g,now,mv,sp);g.bs=(L.sc||1)*1.05;g.scale.setScalar(g.bs);
  return g;
}
function humAnim(g,now,mv){
  const h=g.h,b=h.bones,a=g.ak;h.sw=!!a;animHero(now,mv,h);g.b.position.y=0;
  if(a){const k=a.k,n=a.n;
    if(a.ph==0){const q=k;if(n=='throw'||n=='bolt'||n=='rainfire'||n=='spit'){b.aR0.rotation.x=-2.4*q;b.aL0.rotation.x=-1.2*q}else if(n=='slam'){b.aR0.rotation.x=-3*q;b.aL0.rotation.x=-3*q;b.spine.rotation.x=-.3*q}else if(n=='spin'){b.aR0.rotation.z=1.3*q;b.aL0.rotation.z=-1.3*q;b.aR0.rotation.x=-.3}else{b.aR0.rotation.x=-1.9*q;b.aR0.rotation.z=-.5*q;b.spine.rotation.y=.6*q}}
    else if(a.ph==1){const s=Math.min(1,k*1.6);if(n=='slam'){b.aR0.rotation.x=-3+2.6*s;b.aL0.rotation.x=-3+2.6*s;b.spine.rotation.x=-.3+.6*s}else if(n=='spin'){b.aR0.rotation.z=1.3;b.aL0.rotation.z=-1.3}else if(n=='throw'||n=='bolt'||n=='rainfire'||n=='spit'){b.aR0.rotation.x=-2.4+2*s}else{b.aR0.rotation.x=-1.9+1.6*s;b.aR0.rotation.z=-.5+1.3*s;b.spine.rotation.y=.6-1.3*s}}
    else{const r=k;b.aR0.rotation.z*=r;b.spine.rotation.y*=r;b.spine.rotation.x*=r}
  }else{b.aR0.rotation.z=0;b.aL0.rotation.z=0;b.spine.rotation.x=0}
}
// ---------------- extra enemy moves ----------------
Object.assign(MV,{
 strike:{rmin:0,rmax:1.9,wind:.32,act:.18,rec:.38,cd:1.15,dmg:.75,sh:'cone',r:1.85,ang:.62,quick:1},
 throw:{rmin:2.4,rmax:10,wind:.5,act:.15,rec:.4,cd:1.9,dmg:.85,sh:'line',w:.4,l:10,proj:{spd:13,col:0xc8b890}},
 bolt:{rmin:2.4,rmax:10,wind:.65,act:.2,rec:.5,cd:2.4,dmg:1.1,sh:'line',w:.55,l:10,mt:'m',proj:{spd:9.5}},
 rainfire:{rmin:2,rmax:9,wind:1.1,act:.22,rec:.6,cd:4.6,dmg:1.6,sh:'circle',r:2.2,at:'tg',mt:'m'}
});
MV.spit.mt='m';
// ---------------- hero tick: regen, mana, dashes, buffs, channels, zones, traps ----------------
function heroTick(dt,now){
  if(dt<=0)return;const s=HS(),mx=heroMax(),mm=mpMax();
  if(hero.mp==null)hero.mp=mm;hero.mp=Math.min(mm,hero.mp+dt*mm*(.012+s.mpr));
  const inCombat=now-hero.lastHit<6000||enemies.some(e=>e.agg&&!e.dead&&d2(e.m.position,pl.position)<12);
  if(!inCombat)hero.hp=Math.min(mx,hero.hp+dt*mx*.03);else if(s.regen)hero.hp=Math.min(mx,hero.hp+dt*mx*s.regen);
  party.slice(0,2).forEach(c=>{if(!c||!c.emp||c.h<=0)return;(c.sp||[]).forEach(n=>{const em=CSP[n]&&CSP[n].emp;if(!em)return;
    if(em.k=='regen')hero.hp=Math.min(mx,hero.hp+dt*mx*em.v);
    else if(em.k=='shield'||em.k=='healp'||em.k=='pulse'){c.eT=(c.eT||0)-dt;if(c.eT<=0){c.eT=em.cd;
      if(em.k=='shield'){hero.sh=Math.max(hero.sh,mx*em.v*(1+s.shieldP));hero.shT=now+8000;ring(pl.position,0xc0b090,2,500)}
      else if(em.k=='healp')healHero(mx*em.v);
      else if(inCombat){ring(pl.position,0x9ad84a,em.r*1.4,400);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,pl.position)<em.r)compHit(c,e,em.m,{poison:4})})}}}})});
  hero.dc=Math.min(s.dash,(hero.dc==null?s.dash:hero.dc)+dt/(2.8*(1-Math.min(.6,s.dashR))));
  if(hero.sh>0&&now>hero.shT)hero.sh=0;
  hero.buffs=hero.buffs.filter(b=>b.t>now);
  if(hero.chan){const c=hero.chan;c.t-=dt;c.tick-=dt;pl.rotation.y+=dt*18;if(c.tick<=0){c.tick=.3;area(pl.position,c.R,c.raw,{mt:c.mt,col:c.sk.col},null,0);burst(gY(pl.position,.8),c.sk.col,10,c.R*1.2,.6,.3)}if(c.t<=0){hero.chan=null;pl.sw=0}}
  for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t-=dt;z.ti-=dt;if(z.follow)z.p.copy(pl.position);if(z.mesh)z.mesh.position.copy(gY(z.p,.14));
    if(z.ti<=0&&z.n>0){z.ti=z.iv;z.n--;if(z.cc)enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,z.p)<z.R)compHit(z.cc,e,z.mm,z.fx)});else area(z.p,z.R,z.raw,{mt:z.mt,col:z.col,proc:false},null,0);for(let k=0;k<6;k++){const a=Math.random()*6.28,r=Math.random()*z.R;burst(gY(V(z.p.x+Math.cos(a)*r,0,z.p.z+Math.sin(a)*r),.3+Math.random()*1.5),z.col,1,.3,-1.5,.4)}}
    if(z.n<=0||z.t<=0){if(z.mesh){scene.remove(z.mesh);z.mesh.geometry.dispose()}zones.splice(i,1)}}
  for(let i=traps.length-1;i>=0;i--){const tp=traps[i];tp.t-=dt;const vic=enemies.filter(e=>!e.dead&&d2(e.m.position,tp.p)<1.1);
    if(vic.length){enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,tp.p)<2){heroHit(e,tp.raw,'p',{proc:false});eStatus(e,{root:tp.root},0)}});ring(tp.p,0xc0a060,2.4,400);burst(gY(tp.p,.3),0xc0a060,24,2,1.5,.5);tp.t=0}
    if(tp.t<=0){scene.remove(tp.mesh);traps.splice(i,1)}}
}
function zoneAt(p,R,raw,mt,col,ticks,iv,o){
  o=o||{};const mesh=new THREE.Mesh(new THREE.CircleGeometry(R,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(gY(p,.14));scene.add(mesh);
  zones.push(Object.assign({p:p.clone(),R,raw,mt,col,n:ticks,iv,ti:0,t:ticks*iv+1,mesh},o));
}
// ---------------- class basic attacks ----------------
function shotMesh(col,arrow){
  if(!arrow){const m=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),addMat(col));return m}
  const g=new THREE.Group(),sh=new THREE.Mesh(RY,new THREE.MeshBasicMaterial({color:0xd8c8a0}));sh.scale.set(.025,.8,.025);sh.rotation.x=Math.PI/2;g.add(sh);
  const hd=new THREE.Mesh(RC,new THREE.MeshBasicMaterial({color:0xc0c8d0}));hd.scale.set(.05,.12,.05);hd.rotation.x=Math.PI/2;hd.position.z=.42;g.add(hd);return g;
}
function launch(pos,d,spd,s,dm,life){const m=shotMesh(s.col,s.arrow);m.position.copy(gY(pos,1.0)).addScaledVector(d,.7);m.lookAt(m.position.clone().add(d));scene.add(m);shots.push({m,v:d.clone().multiplyScalar(spd),s,dm,t:life||1.1,hit:new Set()})}
function bowAnim(ms){pl.sw=1;const b=pl.bones;tw(ms,k=>{const q=k<.55?k/.55:1-(k-.55)/.45;b.aL0.rotation.x=-1.5*Math.min(1,k*3);b.aL0.rotation.z=.2;b.aR0.rotation.x=-1.4*Math.min(1,k*3);b.aR1.rotation.x=-1.6*q;b.spine.rotation.y=-.5*Math.min(1,k*3)},()=>{pl.sw=0;b.aL0.rotation.z=0;b.spine.rotation.y=0})}
function staffAnim(ms){pl.sw=1;const b=pl.bones;tw(ms,k=>{const q=Math.sin(Math.min(1,k*1.4)*Math.PI);b.aR0.rotation.x=-.4-1.5*q;b.aL0.rotation.x=-.3-.8*q;b.spine.rotation.x=.15*q},()=>{pl.sw=0;b.spine.rotation.x=0})}
function swing(){
  if(atkCd>0||!party.length||hero.chan)return;
  const C=CLS[hero.cls],s=HS(),w=eq.weapon&&canUse(eq.weapon)?eq.weapon:null,wt=w?itT(w).wt:null,spdK=wt?WTYPE[wt].spd:1,base=C.spd*spdK/(1+s.as),d=aimDir();face(d);
  const raw=atkOf(C.mt)*(1+s.basicP);
  if(C.atk=='bow'){atkCd=base;bowAnim(base*900);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);launch(pl.position,d2_,24,{col:0xe8d8b0,arrow:1,mt:'p',pierce:s.pierce,basic:1},raw,.62)},base*480);return}
  if(C.atk=='staff'){atkCd=base;staffAnim(base*800);setTimeout(()=>{if(!party.length)return;const d2_=aimDir();face(d2_);launch(pl.position,d2_,15,{col:hero.cls=='mage'?0x9a7aff:0xffe08a,mt:'m',splash:.9,basic:1},raw,.78)},base*360);return}
  const now=performance.now(),n4=C.atk=='melee4',N=n4?4:3;if(now-comboT>1000)combo=0;const st=combo;combo=(combo+1)%N;comboT=now;
  const fin=st==N-1,anim=n4?[0,1,0,2][st]:st,mult=(n4?[.8,.8,.95,1.55]:[1,1.1,1.7])[st]*(fin?1+s.finisher:1),ms=(n4?[190,190,210,330]:[300,300,450])[st]*Math.min(1.2,spdK)/(1+s.as*.5);
  const rg=C.rng*(wt=='gs'||wt=='ga'?1.08:1)*(fin?1.12:1);
  atkCd=base*(fin?1.3:1);pl.step={x:d.x,z:d.z,t:fin?.16:.1,sp:fin?5.5:3.5};
  swingAnim(anim,ms,()=>{
    slashFx(d,anim,rg);if(n4)slashFx(d,anim==1?0:1,rg*.9);
    const hits=area(pl.position,rg,raw*mult,{mt:C.mt,col:0xffe6b0},d,fin?1.25:1.15);
    if(fin){ring(pl.position.clone().addScaledVector(d,1.2),0xffe0a0,2.4,320);burst(gY(pl.position.clone().addScaledVector(d,1.3),.15),0xc8b090,22,2.4,1.4,.5);shake(.14);hits.forEach(e=>{if(!e.boss&&!e.dead&&!e.c.al){mCancel(e);e.cd=Math.max(e.cd,1)}})}
    if(hits.length){hstop=fin?.08:.045;shake(fin?.2:.06)}
  });
}
function shotTick(dt){
  for(let i=shots.length-1;i>=0;i--){
    const sh=shots[i];sh.m.position.addScaledVector(sh.v,dt);sh.t-=dt;if(dt>0&&!sh.s.arrow)burst(sh.m.position,sh.s.col,2,.3,.4,.35);
    const hit=enemies.find(e=>!e.dead&&!sh.hit.has(e)&&Math.hypot(e.m.position.x-sh.m.position.x,e.m.position.z-sh.m.position.z)<.75*(e.c.al?1.4:1)+(e.boss?1.2:0));
    let gone=sh.t<=0||solid(sh.m.position.x,sh.m.position.z);
    if(hit){sh.hit.add(hit);const s=sh.s;burst(sh.m.position,s.col,s.big?40:12,s.big?5:2.5,2,.5);
      if(s.big||s.splash){ring(sh.m.position,s.col,s.big?4:1.6,320);area(sh.m.position,s.big?2.2:s.splash,sh.dm,s,null,0)}
      else if(s.cc)compHit(s.cc,hit,s.mm||1,s.fx);else heroHit(hit,sh.dm,s.mt||heroMt(),{s});
      if((s.pierce||0)>=sh.hit.size)gone=false;else gone=true}
    if(gone){scene.remove(sh.m);shots.splice(i,1)}
  }
}
// ---------------- class skills ----------------
const heroSkills=()=>SKL[hero.cls];
function aimPoint(maxD){if(tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<maxD)return tgt.m.position.clone().setY(0);if(mOn&&!orb){const v=V(mg.x-pl.position.x,0,mg.z-pl.position.z),L=v.length();if(L>maxD)v.multiplyScalar(maxD/L);return V(pl.position.x+v.x,0,pl.position.z+v.z)}const d=aimDir();return V(pl.position.x+d.x*Math.min(6,maxD),0,pl.position.z+d.z*Math.min(6,maxD))}
function nearestFront(maxD){const f=aimDir();return enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<maxD).map(e=>{const v=V(e.m.position.x-pl.position.x,0,e.m.position.z-pl.position.z),L=v.length()||.01;return {e,s:L*(1+Math.acos(Math.max(-1,Math.min(1,v.dot(f)/L)))*1.5)}}).sort((a,b)=>a.s-b.s).map(o=>o.e)[0]}
function cast(i){
  const sk=heroSkills()[i];if(!sk||!party.length||hero.chan)return;
  if(hero.lvl<sk.lv){if(performance.now()-(hero.nmT||0)>900){hero.nmT=performance.now();say(sk.i+' '+sk.n+' unlocks at level '+sk.lv+'.')}return}
  const key='s'+i;if((hero.cd[key]||0)>0)return;const s=HS();
  if(hero.mp<sk.mp){if(performance.now()-(hero.nmT||0)>1200){hero.nmT=performance.now();say('Not enough mana.')}return}
  hero.mp-=sk.mp;hero.cd[key]=Math.random()<s.echo?.6:sk.cd*(1-Math.min(.5,s.cdr));
  const d=aimDir();face(d);const mt=sk.mt||CLS[hero.cls].mt,raw=atkOf(mt)*(sk.m||0)*(1+s.skillP),Rr=(sk.r||0)*(1+s.aoeP),now=performance.now(),P=pl.position;
  const fx={mt,col:sk.col,stun:sk.stun,burn:sk.burn};
  if(sk.k!='buff'&&sk.k!='heal'&&sk.k!='barrier')castAnim();
  switch(sk.k){
    case 'cone':arc(P,d,sk.col,Rr,320);burst(gY(P.clone().addScaledVector(d,1.4),.8),sk.col,24,2.5,1.5,.5);area(P,Rr,raw,fx,d,1);shake(.08);break;
    case 'nova':ring(P,sk.col,Rr*2.2,380);ring(P,0xffffff,Rr*1.6,260);burst(gY(P,.5),sk.col,50,Rr*1.6,3,.7);area(P,Rr,raw,fx,null,0);break;
    case 'leap':{const tp=aimPoint(7),o=P.clone();let k0=1;while(k0>0&&solid(o.x+(tp.x-o.x)*k0,o.z+(tp.z-o.z)*k0))k0-=.1;tp.set(o.x+(tp.x-o.x)*k0,0,o.z+(tp.z-o.z)*k0);hero.iv=Math.max(hero.iv,.5);
      tw(420,k=>{P.x=o.x+(tp.x-o.x)*k;P.z=o.z+(tp.z-o.z)*k;pl.children[0].position.y=Math.sin(k*Math.PI)*1.6},()=>{pl.children[0].position.y=0;ring(P,sk.col,Rr*2,380);burst(gY(P,.3),0xc8b090,40,Rr*1.5,2,.6);shake(.25);area(P,Rr,raw,fx,null,0)});break}
    case 'buff':hero.buffs.push({s:sk.buff,t:now+sk.dur*1000,n:sk.n,i:sk.i});hsDirty();ring(P,sk.col,3,600);burst(gY(P,1),sk.col,40,2,3,.8);break;
    case 'channel':hero.chan={t:sk.dur,tick:0,sk,raw,R:Rr,mt};pl.sw=1;break;
    case 'barrier':hero.sh=heroMax()*sk.v*(1+s.shieldP);hero.shT=now+sk.dur*1000;ring(P,sk.col,2.2,600);burst(gY(P,1),sk.col,30,1.5,2,.7);break;
    case 'rain':{const p=sk.at=='self'?P.clone():aimPoint(10);zoneAt(p,Rr,raw,mt,sk.col,sk.ticks,sk.iv,{follow:sk.at=='self'});break}
    case 'heal':healHero(heroMax()*sk.v);pl.slow=0;ring(P,sk.col,2.6,700);burst(gY(P,1),sk.col,40,1.5,3,.9);break;
    case 'blink':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<10?tgt:nearestFront(9);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}
      const v=V(t.m.position.x-P.x,0,t.m.position.z-P.z).normalize(),np=t.m.position.clone().addScaledVector(v,1.1);burst(gY(P,1),0x5a3a8a,30,1.5,2,.5);if(!solid(np.x,np.z)){P.x=np.x;P.z=np.z}face(v.clone().negate());hero.iv=Math.max(hero.iv,.35);
      setTimeout(()=>{heroHit(t,raw,mt,{crit:true,s:fx});burst(gY(t.m.position,1),sk.col,30,2,2,.5);hstop=.07},60);break}
    case 'fan':for(let j=0;j<sk.n2;j++){const a=j/sk.n2*6.283,dd=V(Math.sin(a),0,Math.cos(a));launch(P,dd,16,{col:sk.col,mt,arrow:0},raw,.55)}break;
    case 'mark':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<9?tgt:nearestFront(8);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}t.mark=sk.dur;t.markV=sk.v;heroHit(t,raw,mt,{s:fx});ring(t.m.position,sk.col,1.6,600);dn(t.m.position,'Marked','#ff6a9a',-36,1000);break}
    case 'trap':{const mesh=new THREE.Mesh(new THREE.TorusGeometry(.45,.08,6,16),new THREE.MeshStandardMaterial({color:0x8a7a5a,metalness:.6,roughness:.4}));mesh.rotation.x=Math.PI/2;mesh.position.copy(gY(P,.06));scene.add(mesh);traps.push({p:P.clone(),t:20,raw,root:sk.root,mesh});break}
    case 'shot':for(let j=0;j<(sk.n2||1);j++){const n=sk.n2||1,a=(j-(n-1)/2)*.2,co=Math.cos(a),sn=Math.sin(a),dd=V(d.x*co+d.z*sn,0,-d.x*sn+d.z*co);launch(P,dd,sk.arrow?22:13,{col:sk.col,mt,arrow:sk.arrow,big:sk.big,burn:sk.burn,pierce:sk.arrow?s.pierce:0},raw,sk.arrow?.65:1.1)}break;
    case 'beam':{const o=gY(P,.9);bolt(o,o.clone().addScaledVector(d,9),sk.col);bolt(o,o.clone().addScaledVector(d,9),0xffffff);enemies.forEach(e=>{if(e.dead)return;const v=V().subVectors(e.m.position,P).setY(0),a=v.dot(d),w=Math.abs(v.x*d.z-v.z*d.x);if(a>0&&a<9&&w<1.1)heroHit(e,raw,mt,{s:fx})});break}
    case 'chain':{const t=tgt&&!tgt.dead&&d2(tgt.m.position,P)<10?tgt:nearestFront(9);if(!t){hero.cd[key]=0;hero.mp+=sk.mp;say('No target in reach.');return}chainFrom(t,raw,mt,sk.jumps,sk.col,null);break}
    case 'meteor':{const p=aimPoint(10);tele(p,Rr,sk.delay,()=>{ring(p,sk.col,Rr*2,420);burst(gY(p,.4),sk.col,70,Rr*1.6,4,.9);shake(.3);area(p,Rr,raw,fx,null,0)});break}
  }
  hud();
}
// ---------------- companions: unique spells, empower passives ----------------
function compSpells(dt){
  fols.forEach((f,i)=>{
    const c=party[i];if(!f||!c||c.h<=0||c.emp||!c.sp)return;c.cdm=c.cdm||{};const spd=FAMD[famOf(c.g[0])].spd*((c.mods||[]).includes('Swift')?1.18:1);
    for(const k in c.cdm)c.cdm[k]=Math.max(0,c.cdm[k]-dt*spd);
    const t=enemies.find(e=>!e.dead&&d2(e.m.position,f.position)<8);
    c.sp.forEach(n=>{
      const sp=CSP[n];if(!sp||c.cdm[n]>0)return;
      const help=sp.k=='shield'||sp.k=='heal'||sp.k=='buff';
      if(help){const need=sp.k=='heal'?hero.hp<heroMax()*.7:enemies.some(e=>e.agg&&!e.dead&&d2(e.m.position,pl.position)<10);if(!need)return}
      else if(!t||f.lk)return;
      c.cdm[n]=sp.cd;compCast(c,f,sp,t);
    });
  });
}
function compCast(c,f,sp,t){
  const mult=sp.m||1,fx=sp.fx,P=f.position,col=sp.col,R2=sp.r||2.6;
  if(t){const w=V(t.m.position.x-P.x,0,t.m.position.z-P.z);if(w.lengthSq()>0)f.rotation.y=Math.atan2(w.x,w.z)}
  const d=t?V(t.m.position.x-P.x,0,t.m.position.z-P.z).normalize():V(0,0,1);
  switch(sp.k){
    case 'bite':f.lk=1;lunge(f,t.m.position,()=>{f.lk=0;for(let h=0;h<(sp.hits||1);h++)setTimeout(()=>{if(!t.dead){compHit(c,t,mult,fx);burst(gY(t.m.position,.6),col,8,1.5,1,.3)}},h*160)});break;
    case 'bolt':launch(P,d,12,{col,cc:c,mm:mult,fx,big:sp.big},0,1.2);break;
    case 'fan':for(let j=0;j<(sp.n2||5);j++){const a=(j-((sp.n2||5)-1)/2)*.22,co=Math.cos(a),sn=Math.sin(a);launch(P,V(d.x*co+d.z*sn,0,-d.x*sn+d.z*co),14,{col,cc:c,mm:mult,fx},0,.7)}break;
    case 'nova':ring(P,col,R2*2,380);burst(gY(P,.5),col,30,R2*1.4,2,.6);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,P)<R2)compHit(c,e,mult,fx)});break;
    case 'cone':arc(P,d,col,R2,300);enemies.forEach(e=>{if(e.dead)return;const v=V(e.m.position.x-P.x,0,e.m.position.z-P.z),L=v.length();if(L<R2&&(L<.4||Math.acos(Math.min(1,v.dot(d)/L))<.9))compHit(c,e,mult,fx)});break;
    case 'beam':{const o=gY(P,.6);bolt(o,o.clone().addScaledVector(d,8),col);enemies.forEach(e=>{if(e.dead)return;const v=V().subVectors(e.m.position,P).setY(0),a=v.dot(d),w=Math.abs(v.x*d.z-v.z*d.x);if(a>0&&a<8&&w<1)compHit(c,e,mult,fx)});break}
    case 'rain':zoneAt(t.m.position.clone().setY(0),R2,0,'p',col,sp.ticks||6,sp.iv||.45,{cc:c,mm:mult,fx});break;
    case 'chain':chainFrom(t,0,'m',sp.jumps||3,col,c,fx);break;
    case 'meteor':{const p=t.m.position.clone();tele(p,R2,sp.delay||1,()=>{ring(p,col,R2*2,400);burst(gY(p,.4),col,50,R2*1.5,3,.8);enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,p)<R2)compHit(c,e,mult,{burn:4})})});break}
    case 'shield':{const mx=heroMax();hero.sh=Math.max(hero.sh,mx*sp.v*(1+HS().shieldP));hero.shT=performance.now()+(sp.dur||8)*1000;ring(pl.position,col,2.2,600);burst(gY(pl.position,1),col,24,1.4,2,.6);
      if(sp.nova)enemies.forEach(e=>{if(!e.dead&&d2(e.m.position,pl.position)<2.8)compHit(c,e,sp.nova)});break}
    case 'heal':healHero(heroMax()*sp.v);ring(pl.position,col,2.4,600);break;
    case 'buff':hero.buffs.push({s:sp.buff,t:performance.now()+(sp.dur||8)*1000,n:sp.n||'',i:sp.i});hsDirty();ring(pl.position,col,2.6,600);break;
  }
}
function toggleEmp(i){
  const c=party[i];if(!c||c.h<=0)return say("That companion can't empower you right now.");
  const b=heroMax();c.emp=!c.emp;hsDirty();const a=heroMax();hero.hp=c.emp?hero.hp+(a-b):Math.min(hero.hp,a);
  const sp=CSP[c.sp[0]];say(c.emp?nm(c)+' empowers you'+(sp&&sp.emp?': '+sp.emp.d:'.'):nm(c)+' goes back to fighting.');hud();
}
// ---------------- dash with charges ----------------
function dodge(){
  if(!party.length||(hero.cdD||0)>0||uiOpen()||hero.chan)return;
  if((hero.dc||0)<1){if(performance.now()-(hero.dxT||0)>800){hero.dxT=performance.now();dn(pl.position,'Out of stamina','#9ab0c8',-20,800)}return}
  const s=HS(),ax0=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+dp[0],az0=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+dp[1],cy_=Math.cos(camYaw),sy_=Math.sin(camYaw),ax=ax0*cy_+az0*sy_,az=-ax0*sy_+az0*cy_,l=Math.hypot(ax,az),now_=performance.now(),d=(pl.mvd&&now_-pl.mvd.t<180)?V(pl.mvd.x,0,pl.mvd.z):l>0?V(ax/l,0,az/l):V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  hero.dc-=1;hero.cdD=.25;hero.iv=.3+s.iframe;hero.dash={x:d.x,z:d.z,t:.2};face(d);burst(gY(pl.position,.4),0xbfd0ff,20,2,1,.4);
  if(!pl.sw){const bb=pl.bones;tw(260,k=>{const q=Math.sin(k*Math.PI);bb.spine.rotation.x=.55*q;bb.lh0.rotation.x=-.9*q;bb.rh0.rotation.x=-.6*q},()=>{bb.spine.rotation.x=0})}
}
