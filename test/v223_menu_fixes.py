# v223: no floating item beside the Inventory or the Stable (shops still have it), no Shop button in the ☰ menu.
# Run: python3 v223_menu_fixes.py
import play
bad=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
    if not ok:bad.append(name)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("()=>{gold=1e6}")
    r=ev("()=>{const b=$('shopBtn');return {there:!!b,shown:b?getComputedStyle(b).display!='none':false,inv:getComputedStyle($('bagBtn')).display!='none'}}")
    chk('the ☰ menu has no Shop button',not r['shown'] and r['inv'],r)
    # inventory: pointing at a gear slot shows nothing
    r=ev("""()=>{$('bag').classList.remove('hide');rB();const g=document.querySelector('#bag [data-kqt^="e:"]')||document.querySelector('#bag [data-kqt^="g:"]');
      KQM.tipEl=g;ip222Tick();const o={slot:!!g,cur:IP222.cur,cls:IP222.el?IP222.el.className:'hide'};KQM.tipEl=null;$('bag').classList.add('hide');ip222Tick();return o}""")
    chk('no floating item beside the Inventory',r['slot'] and not r['cur'] and r['cls']=='hide',r)
    # stable: nothing floats
    r=ev("""()=>{openX('stable',0);const L=[...document.querySelectorAll('#xw [data-kqt]')];let shown=0;
      for(const e of L.slice(0,12)){KQM.tipEl=e;ip222Tick();if(IP222.cur||(IP222.el&&IP222.el.className!='hide'))shown++}
      KQM.tipEl=null;const o={n:L.length,shown,mode:xwMode};closeX();ip222Tick();return o}""")
    chk('no floating mount beside the Stable',r['shown']==0 and r['mode']=='stable',r)
    # a shop still shows it
    r=ev("""()=>{openShop('m');const L=[...document.querySelectorAll('#shop [data-kqt]')];const g=L.find(e=>{const i=ip222Info(e);return i&&i.it})||L[0];
      KQM.tipEl=g;ip222Tick();const o={n:L.length,cur:IP222.cur,cls:IP222.el&&IP222.el.className};KQM.tipEl=null;$('shop').classList.add('hide');ip222Tick();return o}""")
    chk('shops still show the floating item',r['n']>0 and bool(r['cur']) and r['cls'] in ('m2','m3'),r)
play.run(s,w=1280,hh=760)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors','PAGEERROR' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l][:3])
print('v223_menu_fixes:','ALL PASS' if not bad else 'FAILED %d'%len(bad))
import sys;sys.exit(1 if bad else 0)
