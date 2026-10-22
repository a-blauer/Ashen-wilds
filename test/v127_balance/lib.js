// v90 balance harness (injected by test/v90_abil.py). A training dummy with the real stats of a zone mob of the hero's level,
// level-appropriate gear (ITPL templates of the level's tier, rare, no random affixes), auto-spent talents, and damage counters.
// All timings are game time (sum of heroTick dt).
window.V90={det:true,dum:null,dmg:0,n:0,dot:0,gt:0,home:null,on:false,rk:1,
 zone(L){return PMAP.findIndex(p=>L>=p.lv[0]&&L<=p.lv[1])},
 // the zone's "standard" mob: the roster type with the median health weight
 mobKey(L){const r=Math.max(0,V90.zone(L)),L2=(BIOEN[PMAP[r].n]||['goo']).slice().sort((a,b)=>EN[a].w.hp-EN[b].w.hp);return L2[Math.floor((L2.length-1)/2)]},
 talents(){const T=TAL[hero.cls];let left=hero.lvl-1;const pts=b=>T[b].t.reduce((a,t)=>a+(hero.tal[t[0]]|0),0);
  for(let b=0;b<3&&left>0;b++){let go=true;while(go&&left>0){go=false;for(let j=0;j<T[b].t.length&&left>0;j++){const t=T[b].t[j];if((hero.tal[t[0]]|0)<t[3]&&pts(b)>=3*j){hero.tal[t[0]]=(hero.tal[t[0]]|0)+1;left--;go=true;break}}}}},
 gear(L,wtp){const T=tierOfLv(L)-1,c=hero.cls;SLOTS.forEach(sl=>{let tp;if(sl=='weapon'&&wtp!=null)tp=wtp;else tp=ITPL.findIndex(t=>t.sl==sl&&t.t==T&&!t.nw&&fitsCls(t,c));
  eq[sl]=tp>=0?{id:uid++,tp,lv:L,req:1,r:2,up:0,aff:[]}:null})},
 setup(c,L,o){o=o||{};kqsClear();hero.chan=null;hero.cls=c;hero.lvl=L;hero.xp=0;hero.tal={__ab:1};if(!o.noTal)V90.talents();
  kqsAll(c).forEach(s=>{if(s.lv<=L&&s!==kqsDef(c))hero.tal['ab:'+s.n]=1});V90.rk=o.rank||1;if(typeof kqrSetAll=='function')kqrSetAll(V90.rk);
  V90.gear(L,o.wtp);hero.buffs=[];hero.cd={};hero.cr=0;KQS.ck='';KQS.cdn={};hsDirty();try{refreshGear()}catch(_){}hero.hp=heroMax();hero.mp=mpMax();
  V90.spawn(L,o.al);return {hp:Math.round(heroMax()),pa:Math.round(HS().pa),ma:Math.round(HS().ma),crit:+HS().crit.toFixed(3),key:V90.dum.c.en}},
 spawn(L,al){if(V90.dum&&!V90.dum.dead)removeE(V90.dum);const P=V90.home;const e=spawnEnemy(V90.mobKey(L),P[0],P[1]+2.2,L,{al:!!al});e.__v90=1;
  V90.base={hp:e.c.st.hp,pd:e.c.st.pd,md:e.c.st.md,pa:e.c.st.pa,ma:e.c.st.ma,mt:e.c.mt||'p',l:e.c.l};e.c.st.hp=1e9;e.c.h=6e8;e.agg=1;V90.dum=e;tgt=e;return e},
 start(){V90.home=V90.home||[pl.position.x,pl.position.z];if(window.__v90h)return;window.__v90h=1;
  {const f=hurt;hurt=function(e,d,s,crit,dot){const h0=e&&e.c?e.c.h:0;const r=f.apply(this,arguments);if(e&&e.__x){V90.dmgX+=h0-e.c.h}if(e&&e===V90.dum){const x=h0-e.c.h;V90.dmg+=x;if(dot)V90.dot+=x;else V90.n++}return r}}
  {const f=heroTick;heroTick=function(dt,now){V90.gt+=dt>0?dt:0;const e=V90.dum;
    if(e){if(e.dead){e.dead=0}e.c.h=Math.max(e.c.h,1e8);e.stun=Math.max(e.stun||0,5);e.agg=1;e.m.position.x=V90.home[0];e.m.position.z=V90.home[1]+2.2;e.vx=e.vz=0;e.m.rotation.y=Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z);if(e.atk)mCancel(e)}
    enemies.slice().forEach(q=>{if(q!==e&&!q.__x&&!q.dead&&!q.bfx)removeE(q)});V90.keepX();if(!V90.comp)party.forEach(c=>{if(c)c.h=0});hero.hp=Math.max(hero.hp,heroMax()*.9);if(V90.inf)hero.mp=mpMax();
    return f.apply(this,arguments)}}
  // expected-value crits: no random crits while measuring; non-forced hits get ×(1 + crit chance × crit damage)
  {const f=rollHero;rollHero=function(e,raw,mt,o){if(!V90.det||!V90.dum||(e!==V90.dum&&!e.__x))return f.apply(this,arguments);const s=HS(),c0=s.crit;s.crit=-1;let r;try{r=f.apply(this,arguments)}finally{s.crit=c0}
    if(!(o&&o.crit))r.d=Math.max(1,Math.round(r.d*(1+Math.max(0,Math.min(1,c0))*s.cdm)));return r}}},
 home0(){pl.position.x=V90.home[0];pl.position.z=V90.home[1];pl.position.y=GH(pl.position.x,pl.position.z);hero.dash=null;pl.step=null;face(kqsDir(pl.position,V90.dum.m.position))},
 wait(sec){const g0=V90.gt;return new Promise(r=>{const t=()=>{if(V90.gt-g0>=sec)r();else setTimeout(t,30)};t()})},
 quiet(){const e=V90.dum;return !KQS.objs.length&&!KQS.ch&&!hero.chan&&!zones.length&&!shots.length&&!traps.length&&!(e.dots&&e.dots.length)},
 // basic attacks for `sec` seconds: damage, hits, dps, average hit
 async basic(sec){V90.home0();hero.cr=0;await V90.wait(.4);V90.dmg=V90.n=V90.dot=0;const g0=V90.gt;let tm=0;
  await new Promise(r=>{const t=()=>{if(V90.gt-g0>=sec){r();return}tgt=V90.dum;hero.cr=0;if(d2(pl.position,V90.dum.m.position)>2.6&&!hero.dash)V90.home0();face(kqsDir(pl.position,V90.dum.m.position));try{swing()}catch(err){}setTimeout(t,16)};t()});
  await V90.wait(.8);const T=V90.gt-g0;return {dmg:Math.round(V90.dmg),hits:V90.n,dps:+(V90.dmg/T).toFixed(1),hit:+(V90.n?(V90.dmg-V90.dot)/V90.n:0).toFixed(1)}},
 // one cast of ability `name` against the dummy (until every effect has ended, at most `max` s)
 async one(name,cr){kqsClear();hero.chan=null;hero.tal.__ld=name;KQS.ck='';hero.cd={};KQS.cdn={};hero.buffs=[];hsDirty();V90.home0();hero.mp=9999;V90.inf=1;
  const sk=heroSkills()[0];if(!sk||sk.n!==name)return {err:'not equipped'};hero.cr=cr==null?(sk.spend?100:0):cr;hero.crT=nowP();resUI();await V90.wait(.1);
  V90.dum.dots=[];V90.dmg=V90.n=V90.dot=0;tgt=V90.dum;const g0=V90.gt;cast(0);if(sk.gt&&KQS.tg){KQS.tg.p=V90.dum.m.position.clone();kqsTgFire()}
  const cd=hero.cd.s0||0;if(cd<=0){V90.inf=0;return {n:name,fail:1}}
  const max=Math.min(18,Math.max(4,(sk.dur||0)+(sk.k=='trap'||/trap|mine|frost/.test(sk.x||'')?2:0)+2.5));
  await new Promise(r=>{const t=()=>{const el=V90.gt-g0;if(traps.length)V90.dum.m.position.copy(traps[0].p);if(el>=max||(el>3.6&&V90.quiet())){r();return}tgt=V90.dum;setTimeout(t,30)};t()});
  V90.inf=0;return {n:name,dmg:Math.round(V90.dmg),dot:Math.round(V90.dot),hits:V90.n,cd:+cd.toFixed(2),mp:sk.mp,t:+(V90.gt-g0).toFixed(1),lv:sk.lv}},
 // a rotation: basic attacks + every equipped ability whenever it is ready (real mana, real resource) for `sec` s
 async rot(names,sec){kqsClear();hero.chan=null;hero.tal.__ld=names.join('|');KQS.ck='';hero.cd={};KQS.cdn={};hero.buffs=[];hero.cr=0;hsDirty();V90.home0();hero.mp=mpMax();V90.inf=0;resUI();
  await V90.wait(.2);V90.dum.dots=[];V90.dmg=V90.n=V90.dot=0;const g0=V90.gt;let casts=0;
  await new Promise(r=>{const t=()=>{if(V90.gt-g0>=sec){r();return}tgt=V90.dum;if(d2(pl.position,V90.dum.m.position)>3.2&&!hero.dash&&!KQS.ch)V90.home0();
    const L=heroSkills();for(let i=0;i<L.length;i++){if((hero.cd['s'+i]||0)<=0&&hero.mp>=L[i].mp&&!hero.chan&&!KQS.ch){const c0=hero.cd['s'+i]||0;try{cast(i);if(L[i].gt&&KQS.tg){KQS.tg.p=V90.dum.m.position.clone();kqsTgFire()}}catch(err){}if((hero.cd['s'+i]||0)>c0){casts++;break}}}
    face(kqsDir(pl.position,V90.dum.m.position));try{swing()}catch(err){}setTimeout(t,16)};t()});
  const T=V90.gt-g0;kqsClear();return {dps:+(V90.dmg/T).toFixed(1),casts}},
 // effective health against the dummy's own attack: how many of its plain hits you survive
 ehp(){const s=HS(),b=V90.base,atk=b.mt=='m'?b.ma:b.pa,def=b.mt=='m'?s.md:s.pd;let d=atk*(1-def/(def+KD(b.l)));d*=1-Math.min(.75,s.dr);d*=1-(s.blockC||0)*.5;return {hitsToDie:+(heroMax()/Math.max(1,d)).toFixed(1),hp:Math.round(heroMax()),mobHit:Math.round(d)}}
};
