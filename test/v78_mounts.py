import sys,json;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=__import__('os').environ.get('PW_CHROME') or (__import__('os').path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1000,'height':640});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]))
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:500])
    P('mntBtn',"()=>getComputedStyle($('mntBtn')).display")
    P('before',"()=>{const T=TOWNS[0];toPos(T.cx+STB.x,T.cy+STB.z+3);return {vis:STB.g&&STB.g.visible,npc:STB.npc&&STB.npc.visible,site:!!STB.site,prompt:(townPortalPrompt(T)||{}).label,ride:(toggleMount(),!!riding)}}")
    ev("()=>{const T=TOWNS[0];camPitch=.3;camDist=9;camYaw=Math.PI;snapCam()}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/st_before.png')
    P('build',"()=>{gold=999999;mats.wood=50;mats.fiber=50;shopBuy('stable');const T=TOWNS[0];return {vis:STB.g.visible,npc:STB.npc.visible,site:!!STB.site,cols:STB.col.length,inCol:STB.col.every(q=>T.col.includes(q)),prompt:(townPortalPrompt(T)||{}).label}}")
    pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/st_after.png')
    ev("()=>{closeX&&closeX();openX('stable',0)}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/st_window.png')
    P('buy',"()=>{const g0=gold;MNTK.forEach(k=>{const bt=document.querySelector('[data-mbuy=\"'+k+'\"]');bt&&bt.click()});return {n:mounts.length,spent:g0-gold,keys:mounts.map(m=>m.k+':'+m.spd)}}")
    ev("()=>closeX()")
    tiles=[]
    ev("()=>{for(const id of ['topl','mini','bbar','glog','sysBtn','fsBtn'])try{$(id).style.visibility='hidden'}catch(_){};const T=TOWNS[0];toPos(T.cx+6,T.cy+6)}")
    for k in ['pony','boar','stag','ram','charger','raptor','panther','destrier','direwolf','drake']:
        r=ev("""(k)=>{if(riding)dismount();hero.lastHit=-1e9;mActive=mounts.find(m=>m.k==k).id;toggleMount();pl.rotation.y=0;camYaw=Math.PI/2+.35;camPitch=.12;camDist=4.6;snapCam();return {riding:!!riding,k:riding&&riding.k}}""",k)
        pg.wait_for_timeout(1600);f=play.TMP+'/mt_%s.png'%k;pg.screenshot(path=f);tiles.append(Image.open(f).crop((200,120,800,600)).resize((300,240)))
    W=Image.new('RGB',(1500,480))
    for i,im in enumerate(tiles):W.paste(im,((i%5)*300,(i//5)*240))
    W.save(play.TMP+'/mt_sheet.png')
    P('speed',"()=>{const p0=pl.position.clone();const a=4.5*(1+HS().mspd)*(riding?1+riding.spd/100:1);return {riding:!!riding,spd:riding&&riding.spd,msp:+a.toFixed(2)}}")
    P('oldsave',"()=>{if(riding)dismount();mounts=[{id:900,k:'ashwarg',n:'Ashen Warg',spd:44,cap:84,dist:0},{id:901,k:'obsidrake',n:'x',spd:90,cap:130,dist:0}];meggs=[{id:5,k:'galeroc',t:4}];const g0=gold;mFix();return {m:mounts.map(m=>m.k+'/'+m.n),meggs:meggs.length,refund:gold-g0}}")
    P('saveload',"()=>{const s=x2Save();SH.shop={};shApply();const a=STB.g.visible;x2Load(s);return [a,STB.g.visible,!!s.shp.stable]}")
    print('errors:',errs[:6]);b.close()
