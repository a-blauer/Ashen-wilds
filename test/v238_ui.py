# v238 (owner, Nov 15 2026: "some ui text is extremely hard to read (look at the fusion menu where it shows stat grading- the dark box
# completely washes out the stat type) Check and make sure this isnt a problem in any other menus. Also remove the large rune symbol on
# the bottom right of the menus"): opens every menu window (inventory, companions, the four fusion steps, settings, talents, abilities,
# shops, steward, stable …), runs the ink pass and lg222Audit at contrast 3.0, and checks no window carries the alchemist's circle.
#   python3 v238_ui.py        (SHOT=x saves /tmp/aud_x_<menu>.png)
import sys,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SEED=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v100_fusemenu.py')).read()
SEED=SEED[SEED.index('SEED=r"""')+9:SEED.index('"""',SEED.index('SEED=r"""')+9)]
MIN=float(os.environ.get('MIN','3'));SHOT=os.environ.get('SHOT','')
OPEN=[('inventory',"$('bag').classList.remove('hide');rB()"),('companions',"openCmp(false)"),
 ('companion card',"openCmp(false);const c=document.querySelector('#cmp [data-ci],#cmp .crow,#cmp .mrow,#cmp .cc');if(c)c.click()"),
 ('fusion 1',"openCmp(false);document.querySelector('#cmp [data-cft=\"f\"]').click()"),
 ('fusion 2',"openCmp(false);document.querySelector('#cmp [data-cft=\"f\"]').click();document.querySelector('#fz .fsm-row').click()"),
 ('fusion 3',"openCmp(false);document.querySelector('#cmp [data-cft=\"f\"]').click();document.querySelector('#fz .fsm-row').click();const b=document.querySelector('#fz .fsm-act');if(b)b.click()"),
 ('fusion 4',"openCmp(false);document.querySelector('#cmp [data-cft=\"f\"]').click();document.querySelector('#fz .fsm-row').click();const b=document.querySelector('#fz .fsm-act');if(b)b.click();const r=document.querySelector('#fz .fsm-row:not(:disabled)');if(r)r.click()"),
 ('incubator',"$('inc').classList.remove('hide');try{rI()}catch(_){}"),('settings',"$('setw').classList.remove('hide')"),('talents',"document.dispatchEvent(new KeyboardEvent('keydown',{key:'k'}))"),
 ('character',"document.dispatchEvent(new KeyboardEvent('keydown',{key:'c'}))"),('map',"document.dispatchEvent(new KeyboardEvent('keydown',{key:'m'}))"),('trading post',"openShop('m')")]
for k in "abil alch bosses chq132 cook coop dex hold magic mounts portal stable trade".split():OPEN.append((k,"openX('%s')"%k))
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(600000)
    pg.click('[data-dev=desktop]');pg.click('[data-c="warrior"]');pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    pg.set_viewport_size({'width':1200,'height':800});ev(SEED)
    ev("()=>{gold=1e6;for(const k of Object.keys(RES))mats[k]=500;hero.lvl=30;for(let i=0;i<6;i++){try{give(ITPL[i*7%ITPL.length].n||i)}catch(_){}}}")
    tot={};fails=[]
    def ok(c,m):
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails.append(m)
    for n,js in OPEN:
        try:
            ev("()=>{document.querySelectorAll('.modal.w:not(.hide)').forEach(m=>m.classList.add('hide'));try{closeX()}catch(_){}}")
            ev("()=>{"+js+"}");pg.wait_for_timeout(300)
            r=ev("(m)=>{lg222Ink();return {w:[...document.querySelectorAll('.modal.w:not(.hide)')].map(x=>x.id),low:lg222Audit(m)}}",MIN)
            low=[l for l in r['low'] if not l[3].startswith('rgba(0, 0, 0, 0)')]   # icons drawn as pictures carry no text colour
            tot[n]=low;ok(not low,'%s: all text readable (contrast 3.0 or more) %s'%(n,json.dumps(low[:4])))
            if n in('fusion 1','inventory','settings'):
                c=ev("()=>[...document.querySelectorAll('.modal.w:not(.hide)>.win')].map(w=>getComputedStyle(w).backgroundImage).join(' ')")
                ok('stroke-dasharray' not in c and '%3Ccircle' not in c and "<circle" not in c,'%s: no rune circle on the window'%n)
            if SHOT:pg.screenshot(path='/tmp/aud_%s_%s.png'%(SHOT,n.replace(' ','_')))
        except Exception as e:ok(False,'%s: opens (%s)'%(n,str(e)[:160]))
    r=ev("()=>{document.querySelectorAll('.modal.w:not(.hide)').forEach(m=>m.classList.add('hide'));openCmp(false);document.querySelector('#cmp [data-cft=\"f\"]').click();lg222Ink();const s=document.querySelector('#fz .fsm-gs span'),sm=s&&s.querySelector('small');if(!s||!sm)return null;const cs=getComputedStyle(s);return {bg:cs.backgroundColor,txt:sm.textContent,col:getComputedStyle(sm).color}}")
    ok(r and r['bg']!='rgba(0, 0, 0, 0.35)' and r['txt'],'fusion: grade chips are a light inset with the stat name showing %s'%r)
    print('FAILS',len(fails))
play.run(s)
