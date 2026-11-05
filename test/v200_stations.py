# v200: Duskhold's buildings as stations — Hatchery, Beast Trainer, Stable tiers, companion food, Curio prices, Treasury market,
# Training Grounds, Scholar's Tower collection log, Bestiary pages, Beast Den, one villager per house, the cost changes.
# Prints FAIL lines on a wrong result; SHOTS=1 also writes out/v200_*.png (each station window).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
CHECK=r"""async()=>{const o={},F=[],sl=ms=>new Promise(r=>setTimeout(r,ms)),ok=(c,m)=>{if(!c)F.push(m)};
gold=500000;['wood','stone','fiber','iron','crystal','glowcap','petals','bone','Ectoplasm','Silk Gland','Rock Core'].forEach(k=>mats[k]=999);UPM.forEach(u=>mats[u[0]]=99);
// ---- costs and old bonuses ----
ok(SHC[3].g===5000,'town upgrade level 3 should cost 5000, is '+SHC[3].g);
const sg=[1,2,3].map(l=>shpCost109(SHPU109.find(u=>u.k=='sage'),l).g);ok(JSON.stringify(sg)=='[1000,2000,5000]','Rune Sanctum costs '+sg);
const st=[1,2,3].map(l=>shpCost109(SHPU109.find(u=>u.k=='stable'),l));ok(st.every(c=>c.g===0&&c.m.map(q=>q[0]).sort().join()=='fiber,stone,wood'),'Stable upgrades must cost only wood/stone/fiber: '+JSON.stringify(st));
const tc=[1,2,3].map(l=>shpCost109(SHPU109.find(u=>u.k=='trainer'),l).g);ok(tc.every(g=>g===1000),'Beast Trainer slots cost '+tc);
SH.lv.train=0;hsDirty();const pa0=HS().pa;SH.lv.train=3;hsDirty();ok(Math.abs(HS().pa-pa0)<1e-6,'Training Grounds still gives attack');SH.lv.train=0;hsDirty();
// ---- Hatchery ----
ok(!!lotOf103('u:hatch'),'the Hatchery has no lot at level 0');ok(kdLv('hatch')===0&&ht200N()===3,'Hatchery base slots '+ht200N());
const T=[0,1,2,3].map(l=>{SH.lv.hatch=l;shApply();return [ht200N(),EGG_T/60000]});SH.lv.hatch=0;shApply();
ok(JSON.stringify(T)=='[[3,8],[4,7],[5,6],[6,5]]','Hatchery slots/minutes by level '+JSON.stringify(T));
eggs.length=0;for(let i=0;i<5;i++)eggs.push(rollEgg(1));hatchCheck();ok(eggs.every(e=>!e.t0&&!eggRdy(e)),'bag eggs started warming');
eggs.forEach(e=>ht200Set(e.id));ok(ht200In().length===3,'slots took '+ht200In().length);
const e0=eggs.find(e=>e.ht);e0.t0-=EGG_T+5;ok(eggRdy(e0),'slot egg not ready after EGG_T');const n0=party.length;hatchEgg(e0.id);ok(party.length===n0,'an egg hatched outside the Hatchery');
ht200Hatch([e0.id]);ok(party.length===n0+1,'the Hatchery could not hatch a ready egg');try{CE.hat=null;hq.length=0;hAct=false;$('cmp').classList.add('hide')}catch(_){}
{const l=lotOf103('u:hatch'),d=lotDoor103(l);toPos(d[0],d[1]);const p=townPortalPrompt(TOWNS[0]);ok(p&&/Hatchery/.test(p.label),'no Hatchery prompt at its door: '+(p&&p.label))}
// ---- Beast Trainer ----
while(party.length<4)party.push(mkC(SPK[party.length*6%30],2));hero.lvl=20;SH.shop.trainer=1;SHP109.lv.trainer=0;
ok(trn200N()===1,'trainer slots at level 0: '+trn200N());SHP109.lv.trainer=2;ok(trn200N()===3,'trainer slots at level 2: '+trn200N());
const lead=party[0];trn200Set(0);ok(lead.tr200&&party.indexOf(lead)>=actN141(),'a team companion set in training should leave the team');
lead.tr200.t0-=150000;trn200Tick(true);ok(lead.l>2&&lead.l<20,'half-way training level '+lead.l);lead.tr200.t0-=200000;trn200Tick(true);ok(lead.l===20&&!lead.tr200,'after 5 minutes Lv '+lead.l);
// ---- Stable ----
SH.shop.stable=1;SHP109.lv.stable=0;ok(stb200Max()===2,'new Stable tiers '+stb200Max());SHP109.lv.stable=3;ok(stb200Max()===5,'Stable level 3 tiers '+stb200Max());SHP109.lv.stable=1;
openX('stable');const g1=gold,m1=mounts.length;document.querySelectorAll('#xw [data-mbuy="panther"]').forEach(b=>{b.disabled=false;b.click()});ok(mounts.length===m1&&gold===g1,'a locked Tier 4 mount was sold');closeX();
// ---- companion food ----
sup.meat=20;sup.fish=20;sup.wheat=20;make('cf_jerky',2);ok(cnt('cf_jerky')===6,'jerky made '+cnt('cf_jerky'));const c=party[0];c.cf200=[];cf200Put(c,'cf_jerky',4);
c.h=M(c)*.1;const h0=c.h;await sl(1500);ok(c.h>h0+M(c)*.2,'companion did not eat from its pouch: '+h0+' -> '+c.h);ok(c.cf200[0]&&c.cf200[0].n===3,'pouch after one bite '+JSON.stringify(c.cf200));
// ---- Curio ----
const ep=[1,2,3,4,5].map(t=>cu194Price('egg',t));ok(ep.every((p,i)=>p.some(q=>q[0]==UPM[i][0])),'eggs must cost their tier material');
ok(ep.every((p,i)=>i==0||p[0][1]>ep[i-1][0][1]),'egg prices should rise with tier');
// ---- Treasury ----
const n=trs200N();ok(trs200P(1,n)===trs200P(1,n),'market price is not repeatable');ok([0,1,2].every(a=>trs200P(a,n+144*365)>trs200P(a,n)*1.05||trs200P(a,n+144*730)>trs200P(a,n)),'ventures should rise over time');
SH.lv.treas=1;TRS200.h={};gold=50000;trs200Buy(0,9000);ok(Math.abs(trs200In()-5000)<1,'Treasury level 1 cap: invested '+trs200In());SH.lv.treas=0;trs200Buy(1,500);ok(Math.abs(trs200In()-5000)<1,'invested without a Treasury');SH.lv.treas=1;
const gb=gold;trs200Sell(0,1);ok(gold>gb+4000&&!TRS200.h.iron,'selling did not pay out');
// ---- Training Grounds ----
SH.lv.train=1;hero.lvl=10;TG200.on=1;tg200Away(3*3600000);ok(hero.lvl===10,'3 hours away gave a level');tg200Away(9*3600000);ok(hero.lvl===11,'9 hours away gave no level');
hero.lvl=15;tg200Away(30*3600000);ok(hero.lvl===15,'level 1 grounds taught past 15');SH.lv.train=3;hero.lvl=41;tg200Away(9*3600000);ok(hero.lvl===41,'past 40 needs 16 hours');tg200Away(17*3600000);ok(hero.lvl===42,'17 hours past 40 gave no level');
hero.lvl=20;SH.lv.train=0;
// ---- collection log ----
const W=dex141Where();dex141Keys().forEach(k=>{const w=(W[k]||[])[0];if(w&&w.z==0)kills[k]=1});SH.lv.tower=0;const gl=gold;cl200Claim('z0');ok(gold===gl,'claimed without a tower');
SH.lv.tower=1;cl200Claim('z0');ok(gold===gl+1000&&CL200.claim.has('z0'),'claim z0 failed');cl200Claim('z0');ok(gold===gl+1000,'claimed twice');
// ---- Bestiary pages ----
bossDone.add(0);fishLog.Sunfish=1;dex.own.add('Foxlet');for(const t of ['cre','en','boss','fish']){dexTab=t;openX('dex');ok(!!document.querySelector('#xw .d141-page'),'bestiary tab '+t+' has no page')}
dexTab='rew';openX('dex');ok(!!document.querySelector('#xw .cl200'),'the bestiary log tab is empty');ok(!document.querySelector('#xw [data-dexc]'),'old bestiary rewards still there');closeX();
// ---- Beast Den ----
SH.lv.den=1;DEN200.ess=0;const A=actN141(),lk=party[party.length-1];lk.lock=true;den200Sac(party.length-1);den200Sac(party.length-1);ok(party.includes(lk),'a locked companion was sacrificed');lk.lock=false;
den200Sac(0);den200Sac(0);ok(party.length>=A&&DEN200.ess===0,'an active companion was sacrificed');
const vic=party[party.length-1],y=den200Yield(vic);den200Sac(party.length-1);den200Sac(party.length-1);ok(!party.includes(vic)&&DEN200.ess===y,'sacrifice gave '+DEN200.ess+' not '+y);
DEN200.ess=1000;const rc=party[0],iv=JSON.stringify(rc.iv),lv=rc.l;for(let i=0;i<10;i++)den200Reroll(rc);ok(JSON.stringify(rc.iv)===iv&&rc.l===lv,'reroll changed grades or level');ok(DEN200.ess===1000-10*den200Cost(rc),'reroll cost');
// ---- houses ----
const hs=HS103.h.length,cs=HS103.cit.length;KF109.s=-1;for(let i=0;i<5;i++)bossDone.add(i);kfApply109(true);const lot=LOT103.find(l=>lotFree103(l.id));if(lot){hsBuy103(lot.id);ok(HS103.cit.length===cs+1,'a new house brought '+(HS103.cit.length-cs)+' villagers')}
HS103.cit.push({n:'Extra',h:HS103.h.length-1,task:'',t0:0,rk:2,r:'fish'});st200OneHome();ok(HS103.cit.filter(q=>q.h===HS103.h.length-1).length===1,'two villagers left in one house');
// ---- save / load ----
TRS200.h={iron:{s:5,c:100}};DEN200.ess=77;TG200.on=1;const x=JSON.parse(JSON.stringify(x2Save()));TRS200.h={};DEN200.ess=0;TG200.on=0;CL200.claim=new Set();x2Load(x);
ok(TRS200.h.iron&&TRS200.h.iron.s===5&&DEN200.ess===77&&TG200.on===1&&CL200.claim.has('z0'),'station state lost in save/load');
o.fails=F;return o}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    r=ev(CHECK)
    fails=r['fails']
    if os.environ.get('SHOTS'):
        for k,js in [('hatch',"ST200.open.hatch()"),('trainer',"openX('visitor','trainer')"),('stable',"openX('stable')"),('treas',"SH.lv.treas=1;ST200.open.treas()"),('train',"SH.lv.train=1;ST200.open.train()"),('tower',"ST200.open.tower()"),('den',"SH.lv.den=1;ST200.open.den()")]:
            ev("()=>{"+js+"}");pg.wait_for_timeout(800);pg.screenshot(path=OUT+'/v200_'+k+'.png')
    for f in fails:print('FAIL',f)
    print('V200', 'OK' if not fails else 'FAILED %d'%len(fails))
play.run(s)
