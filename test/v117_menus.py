# v116 menus: ☰ list (no Fusion / Sovereigns, new Kingdom), Kingdom window tabs + Villagers, Companions | Fusion tabs,
# Talents and Abilities separate (K / C), forge only at the Blacksmith. Screenshots out/v117_*.png
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info if not ok or os.environ.get('V') else '')
    if not ok:FAIL.append(n)
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    r=ev("()=>{$('sysBtn').click();const v=[...$('sysmenu').querySelectorAll('button')].filter(b=>getComputedStyle(b).display!='none').map(b=>b.id);$('sysmenu').classList.add('hide');return v}")
    chk('menu: no fusion / sovereigns',('fuseBtn' not in r) and ('bossBtn' not in r),r)
    chk('menu: kingdom button','kgBtn' in r,r)
    # kingdom window
    r=ev("""()=>{gold=1e6;for(const k of Object.keys(RES))mats[k]=500;[0,1].forEach(i=>bossDone.add(i));try{kfApply109()}catch(_){}
      if(HS103.h.length<2){LOT103.filter(l=>lotFree103(l.id)&&lotOpen109(l.id)).slice(-2).forEach(l=>hsBuy103(l.id))}
      giveS&&Object.keys(SUP).filter(k=>SUP[k].c=='food').slice(0,1).forEach(k=>giveS(k,6));
      const C=HS103.cit;if(C[1])czTrain104(C[1],'hunt');if(C[0])czTask103(C[0],czOpts104(C[0]).find(q=>q[2])[0]);if(C[2]){C[2].task=czOpts104(C[2]).find(q=>q[2])[0];C[2].bag=[{t:'gold',n:50}]}
      const o={n:C.length};document.dispatchEvent(new KeyboardEvent('keydown',{key:'b'}));
      o.open=!$('xw').classList.contains('hide')&&xwMode=='hold';o.tabs=[...document.querySelectorAll('#xw .kmtabs button')].map(b=>b.textContent);
      o.citInCon=!!document.querySelector('#xw .kmcits');KM103.tab='vill';rX();o.cards=document.querySelectorAll('#xw .vlc').length;
      o.work=document.querySelectorAll('#xw .vlc.vl-work').length;o.ready=document.querySelectorAll('#xw .vlc.vl-ready').length;return o}""")
    chk('kingdom: B opens it',r['open'],r);chk('kingdom: three tabs',len(r['tabs'])==3,r);chk('kingdom: no citizens on construction',not r['citInCon'],r)
    chk('villagers: a card each',r['cards']==r['n'] and r['n']>=4,r);chk('villagers: working + ready states',r['work']>=1 and r['ready']>=1,r)
    pg.set_viewport_size({'width':1200,'height':900});pg.wait_for_timeout(300)
    pg.screenshot(path=O+'/v117_villagers.png',timeout=600000)
    r=ev("""()=>{const o={};const b=document.querySelector('#xw [data-vlcol]');o.gold0=gold;b.click();o.gold1=gold;o.bagLeft=HS103.cit.filter(c=>c.bag).length;
      const t=document.querySelector('#xw .vltr:not([disabled])');o.trained=!!t;if(t){const i=+t.dataset.vltr.split(':')[0];t.click();o.role=czRole104(HS103.cit[i])}
      const j=document.querySelector('#xw .vljob:not([disabled]):not(.on)[data-v]:not([data-v=""])');if(j){const i=+j.dataset.vljob,v=j.dataset.v;j.click();o.job=HS103.cit[i].task===v}
      KM103.tab='kingdom';rX();return o}""")
    chk('villagers: collect from the menu',r['gold1']==r['gold0']+50 and r['bagLeft']==0,r);chk('villagers: pick a job',r.get('job'),r)
    pg.screenshot(path=O+'/v117_construction.png',timeout=600000)
    ev("()=>closeX()")
    # companions | fusion
    r=ev("""()=>{const o={};while(party.length<3){const c=mkC('Foxlet',1,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});ivSync(c);c.mods=[];c.h=M(c);party.push(c)}ui();openCmp(false);o.ctabs=document.querySelectorAll('#cmp .cftabs button').length;
      document.querySelector('#cmp [data-cft="f"]').click();o.fz=!$('fz').classList.contains('hide');o.cmpHid=$('cmp').classList.contains('hide');o.ftabs=document.querySelectorAll('#fz .cftabs button').length;return o}""")
    chk('companions: fusion tab opens fusion',r['ctabs']==2 and r['fz'] and r['cmpHid'] and r['ftabs']==2,r)
    pg.screenshot(path=O+'/v117_fusion.png',timeout=600000)
    r=ev("()=>{document.querySelector('#fz [data-cft=\"c\"]').click();return {cmp:!$('cmp').classList.contains('hide'),fz:$('fz').classList.contains('hide')}}")
    chk('fusion: companions tab goes back',r['cmp'] and r['fz'],r)
    pg.screenshot(path=O+'/v117_companions.png',timeout=600000)
    ev("()=>{$('cmp').classList.add('hide')}")
    # talents / abilities
    r=ev("""()=>{const o={};openTal();o.tal=!$('tal').classList.contains('hide');o.talTabs=document.querySelectorAll('#tal .kqs-tabs').length;o.talLink=document.querySelectorAll('#tal [data-kqsopen]').length;$('tal').classList.add('hide');
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'k'}));o.ab=!$('xw').classList.contains('hide')&&xwMode=='abil';o.abTabs=document.querySelectorAll('#xw .kqs-tabs').length;o.abTxt=/Talent/.test($('xwB').textContent+$('xwF').textContent);
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'k'}));o.kCloses=$('xw').classList.contains('hide');return o}""")   # v138: K = Abilities, C = Character (v138_checks)
    chk('talents: no ability tabs or links',r['tal'] and r['talTabs']==0 and r['talLink']==0,r);chk('abilities: K opens and closes, no talent tabs',r['ab'] and r['abTabs']==0 and not r['abTxt'] and r['kCloses'],r)
    pg.screenshot(path=O+'/v117_abilities.png',timeout=600000)
    ev("()=>{closeWin();closeX()}")
    # forge only at the smith
    r=ev("""()=>{const o={};$('bag').classList.remove('hide');rB();o.forgeTab=!!document.querySelector('#bt [data-bt="'+KQM_FORGE+'"]');o.up=!!$('idUp');$('bag').classList.add('hide');
      const it=gear[0]||eq.weapon;const u0=it.up||0;doUpgrade(it);o.upAway=(it.up||0)!==u0;
      TWN100_ACT.smith();o.smithTab=!!document.querySelector('#bt [data-bt="'+KQM_FORGE+'"]')&&bagTab2==KQM_FORGE;$('bag').classList.add('hide');return o}""")
    pg.wait_for_timeout(200)
    r2=ev("()=>KQM_SMITH")
    chk('forge: no tab away from the smith',not r['forgeTab'] and not r['upAway'],r);chk('forge: smith opens the forge tab',r['smithTab'],r);chk('forge: closing the bag ends it',r2==False,r2)
play.run(s,w=1200,hh=900)
print('FAILURES:',FAIL if FAIL else 'none')
