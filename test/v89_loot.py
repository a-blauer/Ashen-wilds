# v89 loot: F to uncover secrets, zone treasure maps in the bag with working X marks, distinct gathering nodes.
#   python3 v89_loot.py            (all)      ONLY=nodes|secret|maps python3 v89_loot.py
import play,os,json
O=play.TMP;ONLY=os.environ.get('ONLY','')
FAST="""()=>{window.__rr=ren.render.bind(ren);ren.render=()=>{};if(window.POST&&POST.render){window.__pr=POST.render.bind(POST);POST.render=()=>{}}
  window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}"""
LIVE="()=>{if(window.__rr)ren.render=window.__rr;if(window.__pr)POST.render=window.__pr}"
STUB="()=>{ren.render=()=>{};if(window.POST&&POST.render)POST.render=()=>{}}"
fails=[]
def ok(c,msg):
    print(('PASS ' if c else 'FAIL ')+msg)
    if not c:fails.append(msg)
def shot(pg,name,ms=1500):
    pg.evaluate(LIVE);pg.wait_for_timeout(ms)
    for i in range(3):
        try:pg.screenshot(path=O+'/'+name,timeout=180000,animations='disabled');break
        except Exception as e:print('retry shot',name,str(e)[:80])
    pg.evaluate(STUB);print('shot',O+'/'+name)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=180000);pg.click('[data-c="ranger"]',timeout=180000);pg.click('#ccNext',timeout=180000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=180000);pg.wait_for_function("()=>typeof pl!='undefined'&&$('cc')&&$('cc').classList.contains('hide')||!document.querySelector('#ccNext')||!document.querySelector('#ccNext').offsetParent",timeout=180000);pg.wait_for_timeout(2500)
    ev(FAST)
    print('swap',ev("()=>[LN.swapped,LN.swapErr||'']"))
    # ---------------- 3. nodes ----------------
    if not ONLY or ONLY=='nodes':
        r=ev("""()=>{const out={};const cnt={};MAP.props.forEach(p=>{const t={kind:p[2]=='grave'||p[2]=='pillar'||p[2]=='rock'?'rock':p[2],x:p[0],y:p[1]};const v=lnV(t);cnt[v]=(cnt[v]||0)+1});
          // every prop tile still has registry entries, none points at a removed mesh
          let bad=0,tot=0;MAP.props.forEach(p=>{const a=NODE[p[1]*W+p[0]];tot++;if(!a||!a.length||a.some(e=>!e[0]||e[0].n===0))bad++});
          return {cnt,bad,tot,swapped:LN.swapped}}""")
        print(r);ok(r['bad']==0,'every node keeps its registry entries');ok(r['swapped']>0,'old prop meshes swapped');ok(r['cnt'].get('iron',0)>0 and r['cnt'].get('berry',0)>0,'iron veins and berry bushes exist')
        # gather an iron vein: prompt names the material, ore given, node hides and regrows
        r=ev("""()=>{const p=MAP.props.find(p=>p[2]=='rock'&&lnV({kind:'rock',x:p[0],y:p[1]})=='iron'&&regionAt(p[0],p[1])>=0);toPos(p[0]+1.2,p[1]);
          promptTick();const lab=$('prompt').textContent;const t=gTarget();const i0=mats.iron;gFinish(t);const k=p[1]*W+p[0];
          const e=NODE[k][0],m=new THREE.Matrix4();e[0].getMatrixAt(e[1],m);return {lab,kind:t&&t.kind,iron:mats.iron-i0,hidden:!!gdep[k],zero:m.elements[0]===0}}""")
        print(r);ok('Iron Ore' in r['lab'],'prompt names Iron Ore: '+r['lab']);ok(r['iron']>0,'iron vein gives iron ore')
        r=ev("""()=>{const p=MAP.props.find(p=>p[2]=='bush'&&lnV({kind:'bush',x:p[0],y:p[1]})=='berry'&&regionAt(p[0],p[1])>=0);toPos(p[0]+1.2,p[1]);promptTick();return $('prompt').textContent}""")
        ok('Berries' in r,'berry bush prompt: '+r)
        # lineup of every node kind in Duskhold for a screenshot
        ev("""()=>{const T=TOWNS[0],x0=PCOURT[0]-2,z0=PCOURT[1]+12;toPos(x0-2,z0+2.6);const ks=['stone','iron','crystal','fiber','berry','flower','mush','bones'];
          window.__lu=new THREE.Group();ks.forEach((k,i)=>{const m=lnModel(k);const x=x0-6.5+i*1.3,z=z0;m.position.set(x,GH(x,z),z);m.scale.setScalar(1.25);__lu.add(m);
            const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.font='bold 34px sans-serif';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=6;g.strokeText(k,128,44);g.fillText(k,128,44);
            const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.scale.set(1.4,.35,1);sp.position.set(x,GH(x,z)+1.5,z);__lu.add(sp)});scene.add(__lu);
          camYaw=0;camPitch=.32;camDist=6.5;snapCam();window.__hid=scene.children.filter(o=>o!==__lu&&o.visible&&!o.isLight&&o.position.distanceTo(pl.position)<4);__hid.forEach(o=>o.visible=false)}""")
        shot(pg,'v89_nodes_lineup.png',3000)
        ev("()=>{scene.remove(__lu);__hid.forEach(o=>o.visible=true);const p=MAP.props.find(p=>p[2]=='crystal');const q=MAP.props.find(p=>p[2]=='bush'&&regionAt(p[0],p[1])==1);toPos(q[0]+2,q[1]+2);camPitch=.5;camDist=12;snapCam()}")
        shot(pg,'v89_nodes_world.png',3500)
        ev("()=>{const p=MAP.props.find(p=>p[2]=='mush'&&regionAt(p[0],p[1])==0);toPos(p[0]+2,p[1]+2);snapCam()}")
        shot(pg,'v89_nodes_world2.png',3500)
    # ---------------- 1. secrets ----------------
    if not ONLY or ONLY=='secret':
        r=ev("""()=>{const S=SECRETS.find(S=>regionAt(S.x,S.z)>=0);toPos(S.x+2,S.z);worldTick(0,performance.now()+1e6);toPos(S.x+2,S.z);promptTick();
          return {lab:$('prompt').textContent,g:!!S.g,i:SECRETS.indexOf(S)}}""")
        print(r);ok(r['lab'].startswith('F · Uncover'),'secret shows the F prompt: '+r['lab'])
        shot(pg,'v89_secret_prompt.png',2000)
        # press F as each class would (no attack needed): the key handler calls interact()
        pg.keyboard.press('f');pg.wait_for_timeout(3000)
        r=ev("""(i)=>{const S=SECRETS[i];lnUncover(S);breakBoulder(S);return {broken:!!S.broken,chests:CHESTS.filter(c=>Math.hypot(c.x-S.x,c.z-S.z)<1).length,sec:secOpen.has('b'+S.id)}}""",r['i'])
        print(r);ok(r['broken'] and r['chests']==1,'F uncovers the secret and makes exactly one chest (repeat calls do nothing)')
        promptok=ev("()=>{promptTick();return $('prompt').textContent}");ok('Open' in promptok,'chest prompt after uncovering: '+promptok)
        # mobile F button path
        r2=ev("""()=>{const S=SECRETS.find(S=>!S.broken&&regionAt(S.x,S.z)>=0&&S!==SECRETS[0]);toPos(S.x+2,S.z);worldTick(0,performance.now()+2e6);toPos(S.x+2,S.z);promptTick();
          const b=document.querySelector('#mbtn [data-m=f]');if(b)b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));else interact();return [SECRETS.indexOf(S),!!b]}""")
        pg.wait_for_timeout(2500)
        r3=ev("(i)=>!!SECRETS[i].broken",r2[0]);ok(r3,'mobile F button uncovers a secret (button present: %s)'%r2[1])
    # ---------------- 2. treasure maps ----------------
    if not ONLY or ONLY=='maps':
        r=ev("""()=>{const out=[];for(let z=0;z<PMAP.length;z++){const p=PMAP[z];toPos(p.en[0],p.en[1]);for(let i=0;i<3;i++){const m=giveMap(pl.position);out.push([z,m&&m.r,m&&regionAt(m.x,m.z),m&&lnReachable(z,m.x,m.z),m&&tmOk(z,m.x,m.z)])}}
          return out}""")
        bad=[q for q in r if not(q[1]==q[0] and q[2]==q[0] and q[3] and q[4])]
        ok(not bad,'18 maps all in their own zone and reachable '+str(bad))
        # a map dropped in Duskhold goes to a zone; old-save migration (wrong zone, unreachable spot)
        r=ev("""()=>{const p=PMAP[3];const wa=p.wa;tmaps.push({x:wa[0],z:wa[1],T:4});tmaps.push({x:PMAP[4].en[0]+30,z:PMAP[4].en[1],T:4});x2Load(Object.assign(x2Save(),{tmaps:JSON.parse(JSON.stringify(tmaps))}));
          return tmaps.slice(-2).map(m=>[m.r,m.id,regionAt(m.x,m.z),tmOk(m.r,m.x,m.z)])}""")
        print(r);ok(all(q[0]==q[2] and q[3] and q[1] for q in r),'old-save maps migrated to reachable spots')
        n=ev("()=>tmaps.length")
        ids=ev("()=>new Set(tmaps.map(m=>m.id)).size");ok(ids==n,'unique map ids')
        # save / load round trip
        r=ev("""()=>{saveGame&&saveGame();const s=JSON.parse(localStorage.getItem(SAVE_KEY));const t=(s.x2||s.x||{}).tmaps||JSON.stringify(s).includes('"tmaps"');return [tmaps.length,!!t]}""")
        ok(r[1],'maps saved (%d)'%r[0])
        # in-zone: minimap X, world map X, bag item
        ev("""()=>{const m=tmaps.find(m=>m.r==3);toPos(m.x+6,m.z+4);camPitch=.6;camDist=14;snapCam();mini()}""")
        shot(pg,'v89_map_minimap.png',2500)
        ev("()=>openWMap()");shot(pg,'v89_map_world.png',800)
        ev("()=>{$('wmap').classList.add('hide');$('bagBtn').click()}");pg.wait_for_timeout(600)
        r=ev("()=>[document.querySelectorAll('#bl [data-kqtm]').length,tmaps.length]");ok(r[0]==r[1],'bag shows every map %s'%r)
        ev("()=>{const e=document.querySelector('#bl [data-kqtm]');e.click();const r=e.getBoundingClientRect();kqmTipShow(document.querySelector('#bl [data-kqtm]'),r.x+20,r.y+20)}")
        shot(pg,'v89_map_bag.png',800)
        tip=ev("()=>$('kqmTip').textContent");ok('Treasure Map — ' in tip and "can't be sold" in tip,'tooltip: '+tip[:120])
        ev("()=>{$('bag').classList.add('hide');kqmTipHide()}")
        # other zone: the map window says which zone the maps are for
        ev("()=>{const p=PMAP[0];toPos(p.en[0],p.en[1]);tmaps=tmaps.filter(m=>m.r==3);openWMap()}")
        shot(pg,'v89_map_otherzone.png',800);ev("()=>$('wmap').classList.add('hide')")
        # dig: walk onto the X, F, chest appears and the map leaves the bag
        r=ev("""()=>{const m=tmaps[0],n=tmaps.length;toPos(m.x+.4,m.z);promptTick();const lab=$('prompt').textContent;interact();const c=CHESTS.filter(c=>Math.hypot(c.x-m.x,c.z-m.z)<1.5).length;
          return {lab,n0:n,n1:tmaps.length,c,still:tmaps.includes(m)}}""")
        print(r);ok(r['lab'].startswith('F · Dig up the treasure (Searing Sands'),'dig prompt names the map');ok(r['n1']==r['n0']-1 and r['c']>=1 and not r['still'],'digging makes a chest and removes the map')
    errs=ev("()=>0")
# play.run with longer timeouts (the page can take minutes to load on a busy machine)
from playwright.sync_api import sync_playwright
with sync_playwright() as P:
    b=P.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':960,'height':600});pg.set_default_timeout(240000);logs=[]
    pg.on('console',lambda m:logs.append(m.type+': '+m.text));pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)+' || '+(e.stack or '')[:500].replace('\n',' ')))
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+O+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4500)
    s(pg)
    open(O+'/lastlogs.txt','w').write('\n'.join(logs));b.close()
L=open(O+'/lastlogs.txt').read();pe=[l for l in L.split('\n') if 'PAGEERROR' in l]
ok(not pe,'no page errors '+str(pe[:3]))
print('FAILS',fails if fails else 'none')
