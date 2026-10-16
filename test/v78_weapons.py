import sys,json;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
SHOT=len(sys.argv)>1
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':900,'height':560});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]))
    pg.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(json.dumps(ev("()=>({n:ITPL.length,v78:ITPL_V78,new:ITPL.filter(t=>t.nw).length,bySlot:ITPL.filter(t=>t.nw).reduce((o,t)=>(o[t.sl]=(o[t.sl]||0)+1,o),{})})")))
    if not SHOT: ev("()=>{window.__r=ren.render.bind(ren);ren.render=()=>{};if(window.POST)POST.render=()=>{}}")
    ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);window.__P=[pl.position.x,pl.position.z];snapCam()}");pg.wait_for_timeout(2500)
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax();hero.mp=999},50)}")
    for cls,wts in [('warrior',['gs','ga','axes','halberd']),('paladin',['mace','hammer','flail']),('assassin',['dagger','claws','knives']),('ranger',['bow','crossbow','sling']),('mage',['staff','wand','orb'])]:
        for wt in wts:
            r=ev("""([cls,wt])=>{hero.cls=cls;hero.lvl=12;pl.position.x=__P[0];pl.position.z=__P[1];pl.step=null;enemies.filter(e=>!e.__t&&!e.dead&&d2(e.m.position,pl.position)<25).forEach(e=>removeE(e));const tp=ITPL.findIndex(t=>t.cls==cls&&t.wt==wt);eq.weapon={id:uid++,tp,lv:12,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear();
              enemies.filter(e=>e.__t).forEach(e=>removeE(e));const rng=['bow','crossbow','sling','staff','wand','orb','knives'].includes(wt)?6:1.6;const out=[];
              for(let i=0;i<3;i++){const e=spawnEnemy('goo',pl.position.x+(i-1)*1.2,pl.position.z+rng+i*.4,8,{});e.__t=1;e.c.h=M(e.c);out.push(e)}
              window.__E=out;tgt=out[1];const hp0=out.reduce((a,e)=>a+e.c.h,0);window.__hp0=hp0;return {tp,name:ITPL[tp].n,hp0,stats:itStats(eq.weapon)}}""",[cls,wt])
            for i in range(6):
                ev("()=>{atkCd=0;tgt=__E.find(e=>!e.dead)||tgt;swing()}");pg.wait_for_timeout(700)
            res=ev("()=>{const hp=__E.reduce((a,e)=>a+(e.dead?0:e.c.h),0);return {dist:__E.map(e=>+d2(e.m.position,pl.position).toFixed(1)),dmg:__hp0-hp,dead:__E.filter(e=>e.dead).length,bleed:__E.filter(e=>e.dots&&e.dots.some(q=>q.k=='bleed')).length,stun:__E.filter(e=>e.stun>0).length}}")
            print(cls,wt,r['name'],json.dumps(r['stats']),'=>',json.dumps(res))
            if SHOT:
                ev("()=>{enemies.filter(e=>e.__t).forEach(e=>removeE(e));camPitch=.3;camDist=4.2;camYaw=Math.PI;snapCam()}");pg.wait_for_timeout(1500)
                pg.screenshot(path=play.TMP+'/w_%s.png'%wt)
    print('errors:',errs[:8]);b.close()
