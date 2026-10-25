# v148: camps return 5 minutes after they are cleared; clearing one gives a little XP and a chest with 2-3 things from the
#   area's loot table. Checks, in Kindlelight I and Hillside Crest II: every camp creature's respawn timer is ~300 s after the
#   clear (roaming creatures keep RESP_T), the clear gives XP (about 2.5 kills' worth), one chest appears near the camp, F opens
#   it, it drops 2-3 different kinds, a second clear while the chest is still there makes no second chest, and the camp is
#   back (creatures alive again) once its timers pass.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async(a)=>{const [z,k]=a,out={err:null};const w=ms=>new Promise(r=>setTimeout(r,ms));
  try{enterMap(z,k);await w(3000);const I=PMAP[z].ins[k];const C=CAMPS.find(c=>c.ig===I.g);
    toPos(C.x+3,C.z+3);await w(400);for(let i=0;i<10&&!ROST.slots.some(s=>s.camp===C&&s.on);i++){rosterTick();await w(300)}
    const S=ROST.slots.filter(s=>s.camp===C);out.slots=S.length;
    const xp0=hero.xp,lv0=hero.lvl,ch0=CHESTS.length,t0=nowP();
    // kill the garrison
    for(let n=0;n<40;n++){const L=enemies.filter(e=>e.camp===C&&!e.dead);if(!L.length){const s=S.find(s=>!s.dead&&!s.on);if(!s)break;rosterTick();await w(100);continue}
      L.forEach(e=>{e.hp=0;try{kill(e)}catch(err){out.kerr=String(err)}});await w(50)}
    out.cleared=campCleared(C);out.alive=S.filter(s=>!s.dead).length;
    out.rt=S.map(s=>Math.round(((s.rt||0)-t0)/1000));out.rtRoam=(ROST.slots.find(s=>!s.camp&&s.dead)||{}).rt||null;
    out.xpCalc=camp148XP(C);
    out.chests=CHESTS.length-ch0;const ch=C.ch148;out.chestNear=ch?+Math.hypot(ch.x-C.x,ch.z-C.z).toFixed(1):null;
    // a second clear message without a second chest
    const xp1=hero.xp,lv1=hero.lvl;camp148Clear(C);out.xpGain=hero.lvl>lv1?'levelled':hero.xp-xp1;out.chests2=CHESTS.length-ch0;
    // open it with F
    const DR=[],dr0=drop;drop=function(k,d){DR.push(k+(d&&d.k?':'+d.k:''));return dr0.apply(this,arguments)};toPos(ch.x+.8,ch.z);await w(300);const pr=worldPrompt&&worldPrompt();out.prompt=pr&&pr.label;
    if(pr&&/chest/i.test(pr.label))pr.fn();else openChest(ch);await w(200);
    drop=dr0;out.drops=DR;out.chestsAfter=CHESTS.length-ch0;
    // timers pass: the camp comes back (move away first, then return)
    S.forEach(s=>s.rt=nowP()-1);toPos(I.en[0],I.en[1]);await w(300);rosterTick();toPos(C.x+3,C.z+3);await w(300);rosterTick();await w(300);rosterTick();
    out.back=S.filter(s=>!s.dead).length;out.clearedAfter=campCleared(C);
  }catch(e){out.err=String(e&&e.stack||e)}return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{CHEAT.portals=1;try{hero.lvl=20}catch(_){}}")
    for z,k in [(0,0),(1,1)]:
        r=pg.evaluate(JS,[z,k]);print('zone',z,'field',k,json.dumps(r))
        F=lambda m:print('FAIL',z,k,m)
        if r['err']:F(r['err'][:400]);continue
        if not r['cleared']:F('camp not cleared')
        if r['rt'] and (min(r['rt'])<280 or max(r['rt'])>320):F('camp timers not ~300 s: '+str(r['rt']))
        if not isinstance(r['xpGain'],str) and (r['xpGain']<=0 or r['xpGain']!=r['xpCalc']):F('clear XP off: %s vs %s'%(r['xpGain'],r['xpCalc']))
        if r['chests']!=1:F('expected one chest, got %s'%r['chests'])
        if r['chests2']!=1:F('a second chest appeared')
        if r['chestNear'] is None or r['chestNear']>7:F('chest not at the camp')
        if not r['prompt'] or 'chest' not in r['prompt'].lower():F('no F prompt at the chest: %s'%r['prompt'])
        if not 2<=len(r['drops'])<=3:F('chest dropped %d things'%len(r['drops']))
        if len(set(d.split(':')[0]+(d.split(':')[1] if d.startswith('mat') else '') for d in r['drops']))!=len(r['drops']):F('repeated kinds: %s'%r['drops'])
        if r['chestsAfter']!=0:F('chest still there after opening')
        if r['back']<1 or r['clearedAfter']:F('camp did not come back after its timers: back=%s'%r['back'])
play.run(s)
