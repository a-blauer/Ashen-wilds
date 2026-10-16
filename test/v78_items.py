import sys,json;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    ctx=b.new_context(viewport={'width':1000,'height':660});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]))
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:900])
    P('drops',"()=>{const o={};CLSK.forEach(c=>{let nw=0,n=0;const types={};hero.cls=c;for(let i=0;i<3000;i++){const it=genItem(R(1,40),{cls:c});n++;const t=itT(it);if(t.nw)nw++;if(t.sl=='weapon')types[t.wt]=(types[t.wt]||0)+1}o[c]={newShare:+(nw/n).toFixed(2),weapons:types}});hero.cls='ranger';return o}")
    P('stats',"()=>[201-101,0].length&&ITPL.slice(ITPL_V78).filter((t,i)=>i%11==0).map(t=>{const it={id:1,tp:ITPL.indexOf(t),lv:5+t.t*8,req:1,r:2,up:3,aff:[]};const s=itStats(it);return t.n+': '+Object.keys(s).map(k=>k+'='+(+s[k].toFixed(3))).join(',')})")
    # bag detail for a new ranger crossbow and an innate armour piece
    ev("()=>{hero.lvl=30;gear.length=0;const mk=n=>({id:uid++,tp:ITPL.findIndex(t=>t.n==n),lv:28,req:20,r:3,up:2,aff:[{k:'crit',v:.02},{k:'as',v:.03},{k:'hpP',v:.04}]});const a=mk('Bonecrank Arbalest'),b2=mk('Deadeye Coat');gear.push(a,b2);window.__ids=[a.id,b2.id];$('bagBtn').click()}")
    for i,nm in enumerate(['xbow','coat']):
        ev("(i)=>{$('bag').classList.remove('hide');selI={k:'g',id:__ids[i]};rB0();$('idt').innerHTML=idHTML()}",i);pg.wait_for_timeout(600);pg.screenshot(path=play.TMP+'/it_%s.png'%nm)
    P('equip',"()=>{const it=gear.find(x=>x.id==__ids[0]);selI={k:'g',id:it.id};$('idAct').click();return {eq:eq.weapon&&itT(eq.weapon).n,wt:curWT(),pa:HS().pa,crit:+HS().crit.toFixed(3),cdm:+HS().cdm.toFixed(3)}}")
    P('save',"()=>{saveGame(true);const s=JSON.parse(localStorage.getItem(SAVE_KEY));return {weapon:s.eq.weapon&&s.eq.weapon.tp,gear:s.gear.map(g=>g.tp)}}")
    pg.goto('file://'+play.TMP+'/live.html',wait_until='commit',timeout=120000);pg.wait_for_timeout(9000)
    try:
        if ev("()=>!$('devp').classList.contains('hide')"):pg.click('[data-dev=desktop]',timeout=10000)
    except Exception as e:print('devp',e)
    P('svp',"()=>!$('svp').classList.contains('hide')")
    P('load',"()=>{const ok=loadGame();return {ok,weapon:eq.weapon&&itT(eq.weapon).n,wt:curWT(),gear:gear.map(g=>itT(g).n),lvl:hero.lvl}}")
    print('errors:',errs[:6]);b.close()
