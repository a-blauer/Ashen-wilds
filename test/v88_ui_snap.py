# v88 UI: save static DOM snapshots of game states (HUD + each window) for fast CSS iteration without WebGL.
#   SRC=<html> AW_TMP=<outdir> python3 v88_ui_snap.py   -> <outdir>/snap_<state>.html
# Open a snapshot through v88_ui_view.py, which re-injects the current theme + icon modules from src/modules.
import play,os,re,v88_ui_run
O=play.TMP
CLOSE="()=>{document.querySelectorAll('.modal.w').forEach(m=>m.classList.add('hide'));const s=$('sysmenu');s&&s.classList.add('hide');try{if(typeof closeX=='function')closeX()}catch(_){};return 1}"
DUMP="""()=>{document.querySelectorAll('canvas').forEach(c=>{try{const i=document.createElement('img');i.src=c.toDataURL();i.style.cssText=c.style.cssText;i.className=c.className;i.id=c.id;i.width=c.width;i.height=c.height;c.replaceWith(i)}catch(e){}});
 const h=document.documentElement.outerHTML;return h}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=120000);ev("()=>$('ccNext').click()");pg.wait_for_timeout(600);ev("()=>$('ccNext').click()");pg.wait_for_timeout(4000)
    ev("()=>{for(let i=0;i<2;i++){hatch(Object.assign(rollEgg(1),{basic:true}))};gold=4321;hero.lvl=12;sup.f_meat=3;sup.p_mp=2;Object.keys(RES).forEach(k=>mats[k]=7);eggs.push(rollEgg(2));hud();return 1}")
    ev("()=>{try{for(let i=0;i<14;i++){const it=genItem(hero.lvl,{minR:i%5,cls:i%3?hero.cls:undefined});if(it)gear.push(it)}}catch(e){console.log('items',e)}}")
    pg.wait_for_timeout(1500)
    st=[('hud',None),('bag',"()=>{$('bagBtn').click()}"),('cmp',"()=>{openCmp()}"),('set',"()=>{openSet()}"),('tal',"()=>{openTal()}"),
        ('hold',"()=>{openX('hold')}"),('shop',"()=>{openShop('m')}"),('portal',"()=>{openX('portal',0)}"),('sys',"()=>{$('sysmenu').classList.remove('hide')}")]
    if os.environ.get('ONLY'):st=[x for x in st if x[0] in os.environ['ONLY'].split(',')]
    for n,js in st:
        ev(CLOSE)
        if js:print(n,ev("()=>{try{("+js+")();return 'ok'}catch(e){return String(e)}}"))
        pg.wait_for_timeout(900)
        # keep a copy of the live page; strip scripts so the snapshot is static
        h=ev("()=>document.documentElement.outerHTML")
        h=re.sub(r'<script\b[^>]*>.*?</script>','',h,flags=re.S)
        open(O+'/snap_%s.html'%n,'w').write('<!doctype html>'+h)
        print('snap',n,len(h))
v88_ui_run.run(s,w=1100,hh=680)
