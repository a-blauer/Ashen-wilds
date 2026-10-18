# v89 misc: floating magic lantern, Citadel minimap rim, cheats "Unlock all shops" / "Add 100 of all resources".
# Screenshots: out/v89_lantern_*.png, out/v89_mm_z<i>.png (+ out/v89_mm_sheet.png), out/v89_wm_z5.png, out/v89_cheats2.png
# Run one part: ONLY=lantern python3 v89_misc.py   (parts: cheats, mm, lantern)
import play,json,os
T=play.TMP
ONLY=os.environ.get('ONLY','cheats,mm,lantern')
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=120000);pg.click('#ccNext',timeout=180000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=180000);pg.wait_for_timeout(3000)
    P=lambda n,c,a=None:print(n,'=>',json.dumps(ev(c,a) if a is not None else ev(c))[:700])
    # fast headless loop: no rendering, rAF → 16 ms timeout (can be paused for screenshots); count frames through atmos
    ev("""()=>{window.__R=ren.render;window.__P=POST.render;ren.render=()=>{};POST.render=()=>{};window.__H=[];
      window.requestAnimationFrame=cb=>{if(window.__pause){__H.push(cb);return 0}return setTimeout(()=>cb(performance.now()),16)};
      window.__F=0;const f=atmos;atmos=function(){__F++;return f.apply(this,arguments)};
      window.frames_=n=>new Promise(r=>{const t=__F+n,c=()=>__F>=t?r():setTimeout(c,10);c()})}""")
    def snap(sel,name):  # page screenshot clipped to the element (no "stable" wait: the game keeps moving)
        bb=pg.locator(sel).bounding_box() if sel!='body' else None
        pg.screenshot(path=T+'/'+name,clip=bb,timeout=900000) if bb else pg.screenshot(path=T+'/'+name,timeout=900000)
    def shot(name,sel='#stage',gl=True):  # render a few real frames, pause the loop, screenshot, resume
        if gl:ev("()=>{ren.render=__R;POST.render=__P;return frames_(3).then(()=>{__pause=1})}");pg.wait_for_timeout(300)
        snap(sel,name)
        if gl:ev("()=>{ren.render=()=>{};POST.render=()=>{};__pause=0;const h=__H;__H=[];h.forEach(cb=>setTimeout(()=>cb(performance.now()),16))}")

    # ---------- 1. cheats ----------
    if 'cheats' in ONLY:
        ev("()=>openSet()");pg.wait_for_timeout(500);pg.click('#cheatBtn');pg.wait_for_timeout(300)
        P('cheat buttons',"()=>[!!$('ch_shops'),!!$('ch_res'),$('cheatBox').textContent.includes('Unlock all shops')]")
        ev("()=>$('ch_res').scrollIntoView()");shot('v89_cheats2.png','#cheatBox',False)
        P('shops before',"()=>[SHOPS.length,SHOPS.filter(o=>shopBuilt(o.k)).length,STB.g?STB.g.visible:null]")
        pg.click('#ch_shops');pg.wait_for_timeout(400)
        P('shops after (all, stable, magic, stable shown, magic shown, saved)',"()=>[SHOPS.filter(o=>shopBuilt(o.k)).length==SHOPS.length,shopBuilt('stable'),shopBuilt('magic'),!!(STB.g&&STB.g.visible),!!(TOWNS[0].mvG&&TOWNS[0].mvG.visible),JSON.parse(localStorage.getItem(SAVE_KEY)).x2.shp]")
        P('shops again',"()=>cheatShops()")
        P('res before',"()=>[mats.wood||0,mats['Rock Core']||0,mats.Whetstone||0,sup.meat||0,sup.wheat||0,gold,eggs.length]")
        pg.click('#ch_res');pg.wait_for_timeout(400)
        P('res after',"()=>{const K=cheatResKeys();return [mats.wood,mats['Rock Core'],mats.Whetstone,mats['Storm Mithril'],sup.meat,sup.wheat,sup.s_wheat||0,gold,eggs.length,K.mats.length,K.sup.length,K.mats.every(k=>mats[k]>=100),K.sup.every(k=>sup[k]>=100),K.sup.filter(k=>SUP[k].c=='rune'||SUP[k].c=='food').length]}")
        P('res keys',"()=>cheatResKeys()")
        P('saved',"()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY));return [s.mats.wood,s.sup.meat]}")
        ev("()=>{$('setw').classList.add('hide')}")

    # ---------- 2. minimap: every zone, Citadel must show its road rim like the others ----------
    if 'mm' in ONLY:
        for i in range(6):
            ev("i=>{enterMap(i);const p=PMAP[i],q=p.path[Math.floor(p.path.length*.45)];toPos(q[0],q[1])}",i);pg.wait_for_timeout(1500)
            ev("()=>mini()");snap('#mini','v89_mm_z%d.png'%i)
        P('rim painted in',"()=>MMRIM")
        P('rim pixels per zone',"""()=>{const c=mmB.getContext('2d');return PMAP.map(p=>{const bm=BIOMES[p.bi],d=c.getImageData(p.x0,p.y0,PMW,PMH).data;let n=0;
          for(let i=0;i<d.length;i+=4){const dr=Math.abs(d[i]-bm.gnd[0])+Math.abs(d[i+1]-bm.gnd[1])+Math.abs(d[i+2]-bm.gnd[2]);if(dr>40)n++}return [p.n,n]})}""")
        try:
            from PIL import Image
            ims=[Image.open(T+'/v89_mm_z%d.png'%i) for i in range(6)];w,h=ims[0].size;S=Image.new('RGB',(w*6,h*4))
            for i,im in enumerate(ims):S.paste(im.resize((w*2,h*2)),((i%3)*w*2,(i//3)*h*2))
            S.save(T+'/v89_mm_sheet.png')
        except Exception as e:print('sheet',e)
        ev("()=>openWMap()");pg.wait_for_timeout(800);shot('v89_wm_z5.png','#wmap',False);ev("()=>$('wmap').classList.add('hide')")

    # ---------- 3. floating lantern in Kindlelight at night ----------
    if 'lantern' in ONLY:
        ev("()=>{enterMap(0);const p=PMAP[0],q=p.path[Math.floor(p.path.length*.3)];toPos(q[0],q[1]);TOD=.78;camDist=Math.min(camDist,7)}");pg.wait_for_timeout(1000)
        ev("()=>frames_(40)")
        P('lantern (shown, belt hidden, belt on hero, in scene, dist, height, light on it, light reach, zone reach)',"()=>[FLAN.root.visible,LANT.visible,LANT.parent===pl,FLAN.root.parent===scene,+FLAN.pos.distanceTo(pl.position).toFixed(2),+(FLAN.pos.y-pl.position.y).toFixed(2),torch.position.distanceTo(FLAN.pos)<.01,+torch.distance.toFixed(1),ZATM[0].ld]")
        P('follow (lag after 2 frames, gap after 60 frames)',"""async()=>{pl.position.x+=3;await frames_(2);const want=()=>flanTarget(pl,0,performance.now(),FLAN.ph,new THREE.Vector3());
          const a=+FLAN.pos.distanceTo(want()).toFixed(2);await frames_(60);return [a,+FLAN.pos.distanceTo(want()).toFixed(2)]}""")
        P('snap on teleport',"async()=>{toPos(pl.position.x+40,pl.position.z);await frames_(2);return +FLAN.pos.distanceTo(pl.position).toFixed(2)}")
        ev("()=>frames_(30)")
        shot('v89_lantern_night.png')
        ev("()=>{camYaw+=1.6;return frames_(30)}");shot('v89_lantern_side.png')
        P('mounted (riding, height, shown)',"async()=>{if(!mounts.length){mounts.push({id:999,k:Object.keys(MOUNTS)[0],n:'Test',spd:20,cap:40,dist:0});mActive=999}toggleMount();await frames_(40);return [!!riding,+(FLAN.pos.y-pl.position.y).toFixed(2),FLAN.root.visible]}")
        shot('v89_lantern_mounted.png')
        ev("()=>{if(riding)dismount()}")
        P('co-op peer (made, shown, dist, cleaned up)',"""async()=>{const m=buildHero();m.position.set(pl.position.x+3,pl.position.y,pl.position.z+2);scene.add(m);MP.rh.__t={peer:'__t',m};
          await frames_(20);const L=FLANR.get(m);const a=[!!L,L&&L.root.visible,L&&+L.pos.distanceTo(m.position).toFixed(2)];scene.remove(m);delete MP.rh.__t;await frames_(3);return a.concat([FLANR.has(m)])}""")
        P('town hides it',"async()=>{toPos(TOWNS[0].cx,TOWNS[0].cy+6);await frames_(30);return [FLAN.root.visible,LANT.visible]}")
    print('ERRS',len(errs),errs[:3])
# same as play.run, with longer load timeouts (the page's start-up script is slow on a busy machine)
def run(steps,w=1100,hh=760):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':w,'height':hh});pg.set_default_timeout(600000);logs=[]
        pg.on('console',lambda m:logs.append(m.type+': '+m.text));pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)))
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+T+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4500)
        steps(pg);print("\n".join([l for l in logs if 'PAGEERROR' in l or l.startswith('error') or 'floating lantern' in l][:20]));b.close()
run(s)
