# v88 abilities: new hero has 1 ability, ability points per level, unlock/equip, every new ability casts and does something,
# ground targeting (start / fire where aimed / cancel), old-save migration.  SRC=<html> AW_TMP=<out> python3 v88_skills.py
import sys,json,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
FAIL=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:300] if info!='' else ''))
    if not ok:FAIL.append(name)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1000,'height':620});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:400]))
    pg.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    # ---------- 1. new hero ----------
    r=ev("()=>({sk:heroSkills().map(s=>s.n),ap:apFree(),tp:tpFree(),book:kqsAll(hero.cls).length,acts:[...$('acts').querySelectorAll('button[data-x]')].map(b=>b.dataset.x)})")
    chk('new hero has only the default ability',r['sk']==['Cleave'],r)
    chk('book has 17 abilities per class',ev("()=>CLSK.map(c=>kqsAll(c).length)")==[17]*5)
    chk('50 new abilities, unique names',ev("()=>{const L=Object.values(KQN).flat(),n=new Set(CLSK.flatMap(c=>kqsAll(c).map(s=>s.n)));return [L.length,n.size]}")==[50,85])
    chk('3+ ground-targeted per class',all(x>=3 for x in ev("()=>CLSK.map(c=>KQN[c].filter(s=>s.gt).length)")))
    print('  ground new per class',ev("()=>CLSK.map(c=>KQN[c].filter(s=>s.gt).length)"),'all ground',ev("()=>CLSK.map(c=>kqsAll(c).filter(s=>s.gt).length)"))
    chk('hotbar shows 3 empty slots',sum(1 for x in r['acts'] if x.startswith('E'))==3,r['acts'])
    chk('no AP at level 1',r['ap']==0,r)
    r=ev("()=>{heroLevelUp();const b=$('banner')?$('banner').textContent:'';return {lv:hero.lvl,ap:apFree(),tp:tpFree(),b}}")
    chk('level up gives AP (v90: 2 per level) and 1 TP',r['ap']==ev("()=>kqrLvAP(2)") and r['tp']==1,r)
    print('  banner:',r['b'][:160])
    pg.wait_for_timeout(600)
    pg.keyboard.press('k');pg.wait_for_timeout(700)
    r=ev("()=>({tal:!$('tal').classList.contains('hide'),tab:!!document.querySelector('#tal .kqs-tabs [data-kqsopen]')})");chk('K opens Talents with an Abilities tab',r['tal'] and r['tab'],r)
    pg.screenshot(path=play.TMP+'/v88_tal_tabs.png')
    pg.click('#tal .kqs-tabs [data-kqsopen]');pg.wait_for_timeout(700)
    r=ev("()=>({open:!$('xw').classList.contains('hide'),tal:!$('tal').classList.contains('hide'),mode:xwMode,rows:document.querySelectorAll('#xwB [data-kqsel]').length,buy:document.querySelectorAll('#xwB [data-kqsbuy]').length})")
    chk('Abilities tab opens the ability book',r['open'] and not r['tal'] and r['mode']=='abil' and r['rows']==17,r)
    pg.keyboard.press('k');pg.wait_for_timeout(300);r=ev("()=>[$('xw').classList.contains('hide'),$('tal').classList.contains('hide')]");chk('K closes it',r==[True,True],r)
    pg.keyboard.press('k');pg.wait_for_timeout(500);r=ev("()=>[!$('xw').classList.contains('hide'),xwMode]");chk('K reopens the last tab (Abilities)',r==[True,'abil'],r)
    pg.screenshot(path=play.TMP+'/v88_abil_lv2.png')
    ev("()=>document.querySelector('[data-kqsbuy=\"Bull Rush\"]').click()")
    r=ev("()=>({sk:heroSkills().map(s=>s.n),ap:apFree(),u:!!hero.tal['ab:Bull Rush']})")
    chk('unlock Bull Rush with AP (auto-equips to key 2)',r['sk']==['Cleave','Bull Rush'] and r['ap']==ev("()=>kqrLvAP(2)")-1,r)
    r=ev("()=>{const b=document.querySelector('[data-kqsbuy]:not([disabled])');return b?b.dataset.kqsbuy:null}")
    chk('nothing else unlockable at level 2',r is None,r)
    ev("()=>{cheatLevel(18)}")
    r=ev("()=>({lv:hero.lvl,ap:apFree(),tp:tpFree()})");chk('Lv 20 → earned − 1 AP left',r['ap']==ev("()=>apEarned()")-1,r)
    ev("()=>{rX();document.querySelector('[data-kqsel=\"Seismic Rupture\"]').click()}")
    ev("()=>{document.querySelector('#xwB .kqs-det [data-kqsbuy=\"Seismic Rupture\"]').click()}")
    ev("()=>{document.querySelector('[data-kqsbuy=\"War Cry\"]').click();document.querySelector('[data-kqsbuy=\"Shockwave\"]').click();document.querySelector('[data-kqsbuy=\"Intimidating Shout\"]').click()}")
    r=ev("()=>({sk:heroSkills().map(s=>s.n),ap:apFree(),spent:apSpent()})")
    chk('unlocks fill the 4 keys, 5th waits in the book',len(r['sk'])==4 and 'Intimidating Shout' not in r['sk'],r)
    ev("()=>{KQS.sel='Intimidating Shout';rX();document.querySelector('.kqs-det [data-kqseq][data-kqsk=\"1\"]').click()}")
    r=ev("()=>heroSkills().map(s=>s.n)");chk('equip to key 2 replaces Bull Rush',r[1]=='Intimidating Shout' and 'Bull Rush' not in r,r)
    ev("()=>{const b=document.querySelector('[data-kqsun=\"3\"]');b&&b.click()}")
    r=ev("()=>heroSkills().map(s=>s.n)");chk('unequip key 4',len(r)==3,r)
    r=ev("()=>{const s=kqsFind('warrior','Chain Hook');return [kqsWhy(s),kqsWhy(kqsFind('warrior','Titan\\'s Fall'))]}");print('  locks:',r)
    pg.wait_for_timeout(500);pg.screenshot(path=play.TMP+'/v88_abil_lv20.png')
    r=ev("()=>{gold=99999;const a=apFree();kqsReset();return [a,apFree(),heroSkills().map(s=>s.n)]}");chk('reset abilities refunds all AP',r[1]==ev("()=>apEarned()") and r[2]==['Cleave'],r)
    r=ev("()=>{hero.tal.w1=2;const g=gold;$('talReset').onclick();return [Object.keys(hero.tal),tpFree()]}");chk('talent reset keeps ability data',any(k=='__ab' for k in r[0]) and r[1]==19,r)
    ev("()=>closeX()")
    # ---------- 2. every new ability casts ----------
    ev("()=>{window.__r=ren.render.bind(ren);ren.render=()=>{};if(window.POST)POST.render=()=>{}}")
    ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);window.__P=[pl.position.x,pl.position.z];snapCam()}");pg.wait_for_timeout(2500)
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=Math.max(hero.hp,heroMax()*.5);hero.mp=999},50)}")
    names=ev("()=>CLSK.map(c=>[c,kqsAll(c).filter(s=>s.nw||s.gt).map(s=>s.n)])")
    res={}
    for cls,L in names:
        ev("""(c)=>{hero.cls=c;hero.lvl=50;hero.tal={__ab:1};kqsAll(c).forEach(s=>hero.tal['ab:'+s.n]=1);KQS.ck='';hsDirty();const tp=ITPL.findIndex(t=>t.cls==c&&t.sl=='weapon'&&t.t==4);eq.weapon={id:uid++,tp,lv:50,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear()}""",cls)
        pg.wait_for_timeout(2500)
        for n in L:
            if n=='Chronoshift':continue  # needs 4s of history: tested on its own below
            r=ev("""(n)=>{kqsClear();hero.chan=null;pl.position.x=__P[0];pl.position.z=__P[1];pl.position.y=GH(pl.position.x,pl.position.z);pl.rotation.y=0;pl.step=null;hero.dash=null;hero.buffs=hero.buffs.filter(b=>b.perm);hsDirty();
              enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<30).forEach(e=>removeE(e));hero.tal.__ld=n;KQS.ck='';hero.cd={};hero.mp=999;hero.cr=100;resUI();
              const out=[];for(let i=0;i<4;i++){const e=spawnEnemy('goo',pl.position.x+(i-1.5)*1.3,pl.position.z+4.5+(i%2)*.8,30,{});e.__t=1;e.c.h=M(e.c)*1;e.agg=1;out.push(e)}
              out.forEach(e=>eStatus(e,{poison:6,bleed:6},50));
              window.__E=out;tgt=out[1];const hp0=out.reduce((a,e)=>a+e.c.h,0);window.__hp0=hp0;window.__x0=[pl.position.x,pl.position.z];window.__o0=KQS.objs.length;window.__b0=hero.buffs.length;window.__s0=scene.children.length;
              const sk=heroSkills()[0];let tg=null;cast(0);if(sk.gt){tg=!!KQS.tg;if(KQS.tg){const c=out.reduce((a,e)=>[a[0]+e.m.position.x/4,a[1]+e.m.position.z/4],[0,0]);KQS.tg.p=new THREE.Vector3(c[0],0,c[1]);kqsTgFire()}}
              return {n:sk.n,gt:sk.gt?1:0,tg,cd:+(hero.cd.s0||0).toFixed(2),ch:!!KQS.ch,objs:KQS.objs.length-__o0,buffs:hero.buffs.length-__b0}}""",n)
            pg.wait_for_timeout(3600 if n not in ('Divine Intervention','Chronoshift') else 3800)
            if n=='Chronoshift':pass
            r2=ev("()=>{const hp=__E.reduce((a,e)=>a+(e.dead?0:e.c.h),0);return {dmg:Math.round(__hp0-hp),dead:__E.filter(e=>e.dead).length,moved:+Math.hypot(pl.position.x-__x0[0],pl.position.z-__x0[1]).toFixed(1),st:__E.filter(e=>e.stun>0||e.root>0||e.ch>0||e.wk>0||e.mark>0).length,objs:KQS.objs.length,buffs:hero.buffs.filter(b=>!b.perm).map(b=>b.n)}}")
            r.update(r2);res[n]=r
            eff=r['dmg']>0 or r['moved']>1 or r['buffs'] or r['objs'] or r['st']
            chk('%s/%s casts'%(cls,n),r['cd']>0 and (not r['gt'] or r['tg']) and bool(eff),json.dumps(r))
    # Chronoshift needs history 4s back: cast after moving
    r=ev("""()=>{hero.cls='mage';hero.tal.__ld='Chronoshift';KQS.ck='';hero.cd={};return 1}""");pg.wait_for_timeout(300)
    ev("()=>{kqsClear();pl.position.x=__P[0];pl.position.z=__P[1]}");pg.wait_for_timeout(4500)
    r=ev("()=>{pl.position.x=__P[0]+5;pl.position.z=__P[1];const h=KQS.hist.length;cast(0);return {h,d:+Math.hypot(pl.position.x-__P[0],pl.position.z-__P[1]).toFixed(2),cd:hero.cd.s0}}")
    chk('Chronoshift rewinds position',r['d']<1 and r['cd']>0,r)
    # ---------- 3. ground targeting: cancel keeps the cooldown and mana ----------
    r=ev("""()=>{kqsClear();hero.cls='mage';hero.tal.__ld='Meteor|Comet Storm';KQS.ck='';hero.cd={};hero.mp=999;cast(0);const a=!!KQS.tg,ret=!!KQS.ret,bar=!$('kqsTg').classList.contains('hide');
       window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return {a,ret,bar,after:!!KQS.tg,retAfter:!!KQS.ret,cd:hero.cd.s0||0,mp:hero.mp,win:!$('setw').classList.contains('hide')}}""")
    chk('targeting starts (reticle + hint bar) and Esc cancels without spending',r['a'] and r['ret'] and r['bar'] and not r['after'] and not r['retAfter'] and r['cd']==0 and r['mp']==999,r)
    r=ev("()=>{cast(1);const a=KQS.tg&&KQS.tg.i;cast(1);return {a,after:!!KQS.tg,cd:+(hero.cd.s1||0).toFixed(1)}}")
    chk('pressing the key again casts',r['a']==1 and not r['after'] and r['cd']>0,r)
    r=ev("()=>{hero.cd={};cast(0);const a=!!KQS.tg;cast(1);const b=KQS.tg&&KQS.tg.i;kqsTgEnd();return [a,b]}")
    chk('another ground key switches the reticle',r==[True,1],r)
    # ---------- 4. old save migration ----------
    r=ev("""()=>{kqsClear();hero.cls='warrior';hero.lvl=20;hero.tal={w1:3,'sk:Shockwave':1,'sk:Iron Skin':1,__ld:'Shockwave|Cleave'};KQS.ck='';const tp0=Math.max(0,hero.lvl-1-3-2);
       const s=gameSnapshot();delete s.hero.tal.__ab;s.hero.tal={w1:3,'sk:Shockwave':1,'sk:Iron Skin':1,__ld:'Shockwave|Cleave'};localStorage.setItem(SAVE_KEY,JSON.stringify(s));hero.tal={};loadGame();
       return {tal:Object.keys(hero.tal).sort(),sk:heroSkills().map(s=>s.n),ap:apFree(),tp:tpFree(),tpOld:tp0}}""")
    chk('old save: kept abilities, sk: removed, TP refunded, AP = level',r['tp']==16 and r['ap']==ev("()=>apEarned()-(hero.tal.__apB|0)") and r['sk']==['Shockwave','Cleave','Leap Slam','War Cry'] and not any(k.startswith('sk:') for k in r['tal']) and 'ab:Iron Skin' in r['tal'] and 'ab:Whirlwind' in r['tal'],r)
    r=ev("()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));hero.tal={};loadGame();return {sk:heroSkills().map(s=>s.n),ap:apFree(),ab:s.hero.tal.__ab}}")
    chk('save/load round trip keeps abilities',r['sk']==['Shockwave','Cleave','Leap Slam','War Cry'] and r['ap']==ev("()=>apEarned()-(hero.tal.__apB|0)") and r['ab']==1,r)
    real=[e for e in errs if 'favicon' not in e]
    chk('no page errors',not real,real[:6])
    json.dump(res,open(play.TMP+'/v88_skills.json','w'),indent=1)
    print('FAILED:',FAIL if FAIL else 'none');b.close()
