# v88 town: kingdom upgrades survive save/load — set stronghold levels, save, reload the page, check the walls and
# upgrade structures are rebuilt from the save (x2Load -> shApply -> kdSync), then buy one more level and check it rebuilds.
#   SRC=build.html AW_TMP=/outdir python3 v88_town_save.py
import play,os,json
def run2(steps,w=820,hh=520):
    import types;src=open(play.__file__).read().replace('timeout=120000','timeout=600000');m=types.ModuleType('play2');m.__dict__['__file__']=play.__file__;exec(compile(src.split("if __name__=='__main__':")[0],play.__file__,'exec'),m.__dict__);return m.run(steps,w=w,hh=hh)
ST="()=>{const K=KGD||{};return {wl:K.wl,up:Object.fromEntries(Object.entries(K.up||{}).map(([k,v])=>[k,v.l])),pr:K.pr,walls:!!(K.wg&&K.wg.parent),err:window.__err||null}}"
def s(pg):
    ev=pg.evaluate
    ev("()=>{localStorage.clear();window.addEventListener('error',e=>window.__err=String(e.message))}")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(2500)
    a=ev(ST);print('fresh',json.dumps(a))
    ev("()=>{SH.lv={walls:2,train:1,tower:3,den:2,hatch:1,treas:3};shApply();saveGame(true)}")
    b=ev(ST);print('set',json.dumps(b))
    pg.reload(wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(500)
    try:
        pg.click('#svpC',timeout=60000)
    except Exception as e: print('noclick',str(e)[:100])
    pg.wait_for_timeout(5000)
    c=ev(ST);print('reloaded',json.dumps(c))
    ev("()=>{gold=99999;['stone','Rock Core'].forEach(k=>mats[k]=999);bossDone.add(0);bossDone.add(1);bossDone.add(2);bossDone.add(3);shBuy('walls')}")
    d=ev(ST);print('bought',json.dumps(d))
    ok=a['wl']==0 and b['wl']==2 and c['wl']==2 and c['up'].get('tower')==3 and c['up'].get('treas')==3 and d['wl']==3 and not d['err']
    print('SAVE','OK' if ok else 'FAIL')
run2(s)
