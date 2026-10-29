# v166: HUD tidy-up. Checks on a phone (the owner's size, page wrapped as on claude.ai) and on desktop:
#  - nothing on the HUD flickers: no style / class / box keeps flipping between a few values (v166_flip.js), in town, with the
#    menu / inventory / character / abilities windows open, in a field fight with a target, in a den fight (boss, and an add targeted)
#  - in a den fight a non-boss target sits under the boss bar
#  - the level / gold plate and the top "Co-op" pill are gone; buffs sit under the companion panel
#  - unspent points show as a badge on the menu button and counts on Character / Abilities; gold shows in the Inventory
#  - while the menu is open the touch buttons let taps through
# Usage: python3 v166_hud.py   (SIZES=cs,dk by default)
import os,json
import play
from playwright.sync_api import sync_playwright
SZ={'cs':(412,720,'mobile'),'pl':(844,390,'mobile'),'dk':(1280,760,'desktop')}
want=os.environ.get('SIZES','cs,dk').split(',')
FLIP=open(os.path.join(play.HERE,'v166_flip.js')).read()
W0='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'
open(play.TMP+'/live_wrap.html','w').write(W0+open(play.TMP+'/live.html').read()+'\n</body></html>')
CHK=r"""async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),o={};
 try{closeX()}catch(_){}try{goHome()}catch(_){}await w(1500);
 const vis=id=>{const e=$(id);if(!e)return false;const r=e.getBoundingClientRect();return getComputedStyle(e).display!='none'&&r.width>0&&r.height>0};
 o.plate=vis('chInfo');$('mpBtnH').classList.add('on');o.coop=vis('mpBtnH');
 o.buffsIn=($('buffs').parentElement||{}).id;
 o.badge0=vis('pt166');hero.lvl=4;hud();await w(200);o.badge=vis('pt166');o.badgeTx=$('pt166').textContent;
 o.talN=($('talBtn').querySelector('.pt166m')||{}).textContent||'';o.abN=($('abBtn').querySelector('.pt166m')||{}).textContent||'';
 o.apChip=!!document.querySelector('#buffs .tpn,#buffs .kqs-apn');
 gold=1234;$('bagBtn').click();await w(300);o.gold=($('gold166')||{}).textContent||'';$('bag').classList.add('hide');
 $('sysmenu').classList.remove('hide');await w(100);const mb=$('mbtn');o.mbPE=mb?getComputedStyle(mb.querySelector('button')||mb).pointerEvents:'none';
 $('sysmenu').classList.add('hide');await w(100);o.mbPE2=mb?getComputedStyle(mb.querySelector('button')||mb).pointerEvents:'auto';
 return o}"""
fails=0
def F(*a):
    global fails;fails+=1;print('FAIL',*a)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    for k in want:
        w,h,dev=SZ[k];mob=dev=='mobile'
        ctx=b.new_context(viewport={'width':w,'height':h},has_touch=mob,is_mobile=mob)
        pg=ctx.new_page();logs=[];pg.on('pageerror',lambda e:logs.append(str(e)))
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+play.TMP+'/live_wrap.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
        pg.set_default_timeout(600000)
        pg.click('[data-dev=%s]'%dev,timeout=60000)
        pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(9000)
        r=pg.evaluate(FLIP);print(k,'flip',json.dumps(r)[:1500])
        for sc,v in r.items():
            if isinstance(v,list):
                for x in v:F(k,sc,'flickers:',x)
        if not r.get('fieldTgt'):F(k,'no field target to watch')
        if not r.get('AF'):F(k,'the den fight did not start')
        if not r.get('bfxT'):F(k,'no bfxT with an add targeted in the den')
        elif not r.get('tgtShown') or r.get('tgtTop',0)<r.get('bossBottom',0):F(k,'den add target frame not under the boss bar',r.get('tgtTop'),r.get('bossBottom'))
        c=pg.evaluate(CHK);print(k,'hud',json.dumps(c))
        if c['plate']:F(k,'the level / gold plate still shows')
        if c['coop']:F(k,'the Co-op pill still shows')
        if c['buffsIn']!='bf166':F(k,'buffs not under the companion panel',c['buffsIn'])
        if c['badge0']:F(k,'points badge shows with no points to spend')
        if not c['badge'] or not c['badgeTx']:F(k,'no points badge with points to spend')
        if '✦' not in c['talN'] or '✦' not in c['abN']:F(k,'menu entries miss the point counts',c['talN'],c['abN'])
        if c['apChip']:F(k,'the old point chips still show')
        if '1,234' not in c['gold']:F(k,'gold missing in the Inventory',c['gold'])
        if mob and (c['mbPE']!='none' or c['mbPE2']=='none'):F(k,'touch buttons under the open menu',c['mbPE'],c['mbPE2'])
        pg.screenshot(path=play.TMP+'/v166_%s.png'%k,timeout=600000)
        for l in logs:F(k,'PAGEERROR',l)
        ctx.close()
    b.close()
print('DONE fails=%d'%fails)
