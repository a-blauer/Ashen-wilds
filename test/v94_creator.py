# v94 creator track: riding pose, return to main menu, character creator + barber.
#   python3 v94_creator.py                       -> every part (TAG=after)
#   PART=mount,creator,save,barber,menu          -> pick parts      MNT=pony,drake  -> pick mounts for the riding sheets
#   SRC=<old.html> TAG=before PART=mount python3 v94_creator.py   -> riding sheets of another build (comparison)
# Output (AW_TMP, default test/out): v94_<TAG>_ride_<mount>.jpg (side / front / 3-4 / back while standing, walking, galloping,
# attack and dismount), v94_ride_sheet_<TAG>.jpg (all mounts), v94_cc_*.png (creator desktop + phone, every option),
# v94_barber.png, v94_menu_*.png. Prints CHECKS OK / FAIL lines and the page errors.
import sys,os,json,base64,time
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','mount,creator,save,barber,menu').split(',')
MNT=os.environ.get('MNT','pony,boar,stag,ram,charger,raptor,panther,destrier,direwolf,drake').split(',')
O=play.TMP;FAIL=[]
def chk(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name,info if info else '');
    if not ok:FAIL.append(name)
def launch(p):
    return p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
def page(b,w=1000,h=620,notitle=True,mobile=False,ctx=None):
    if ctx is None:ctx=b.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile)
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:300].replace('\n',' ')))
    if notitle:pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+O+'/live.html',wait_until='domcontentloaded',timeout=180000);pg.wait_for_function("()=>typeof hero!='undefined'&&!!document.getElementById('ccNext')",timeout=180000);pg.wait_for_timeout(1500)
    return pg,errs
def newgame(pg,cls='warrior'):
    pg.evaluate("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%cls,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)

# ---------------------------------------------------------------- riding pose sheets
RIDE=r"""(a)=>{const [keys,TAG]=a;
  window.requestAnimationFrame=()=>0;
  const FW=300,FH=300,COLS=8,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.85));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.15);dl.position.set(2,5,4);sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,300);
  const lbl=(c,t,x,y)=>{c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
  mounts=keys.map((k,i)=>({id:900+i,k,n:MOUNTS[k].n,spd:60,cap:90,dist:0}));
  const out={},info={};let T=300000;
  const home=pl.parent;
  for(const k of keys){try{
    if(riding)dismount();hero.lastHit=-1e9;enemies.forEach(e=>{e.agg=0});mActive=mounts.find(m=>m.k==k).id;
    pl.position.set(0,0,0);pl.rotation.y=0;toggleMount();if(!riding){info[k]={err:'no ride'};continue}
    gr.position.y=0;sc.add(pl);sc.add(mModel);
    // drive the hero like the main loop does: animHero, then mountTick
    const step=(ms,v,S)=>{for(let t=0;t<ms;t+=16){T+=16;const dt=.016;if(v){pl.position.z+=v*dt}animHero(T,v>0);mountTick(dt,T,v>0?1:0);if(S)S(T)}};
    step(1500,0);
    pl.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(mModel).union(new THREE.Box3().setFromObject(pl));const H=box.getSize(new THREE.Vector3()).y,ctr=box.getCenter(new THREE.Vector3());
    const cnv=document.createElement('canvas');cnv.width=FW*COLS;cnv.height=FH*3;const ctx=cnv.getContext('2d');
    const shot=(col,row,ang,label,zoom)=>{sc.children.slice().forEach(o=>{if(o.sd&&o!==mModel)sc.remove(o)});if(mModel&&mModel.parent!==sc)sc.add(mModel);const p=pl.position;const c=box.getCenter(new THREE.Vector3()).sub(new THREE.Vector3()).setY(ctr.y);const d=H*(zoom||2.3);pl.updateMatrixWorld(true);
      const ly=(zoom||2.3)<2?pl.bones.pelvis.getWorldPosition(new THREE.Vector3()).y+.15:ctr.y+H*.05;cam.position.set(p.x+Math.sin(ang)*d,ly+H*.12,p.z+Math.cos(ang)*d);cam.lookAt(p.x,ly,p.z);gr.position.set(p.x,0,p.z);pl.updateMatrixWorld(true);if(mModel)mModel.updateMatrixWorld(true);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);if(label)lbl(ctx,label,col*FW,row*FH)};
    // row 0: standing still from all sides + idle sway over time
    shot(0,0,Math.PI/2,k+' side',1.6);shot(1,0,0,'front',1.6);shot(2,0,Math.PI/4,'3/4',1.6);shot(3,0,Math.PI,'back',1.6);shot(4,0,-Math.PI/2,'other side',1.6);
    step(700,0);shot(5,0,Math.PI/2+.4,'idle +.7s',1.7);step(700,0);shot(6,0,Math.PI/2+.4,'idle +1.4s',1.7);
    // feet vs stirrups, hands vs neck (world positions)
    pl.updateMatrixWorld(true);mModel.updateMatrixWorld(true);const b=pl.bones,W=o=>o.getWorldPosition(new THREE.Vector3());
    const fl=W(b.lh2),fr=W(b.rh2),hl=W(b.aL2),hr=W(b.aR2),hip=W(b.pelvis),hd=W(b.head);
    info[k]={seat:mModel.seat.map(v=>+v.toFixed(2)),ankL:[fl.x,fl.y,fl.z].map(v=>+v.toFixed(2)),ankR:[fr.x,fr.y,fr.z].map(v=>+v.toFixed(2)),
      handL:[hl.x,hl.y,hl.z].map(v=>+v.toFixed(2)),handR:[hr.x,hr.y,hr.z].map(v=>+v.toFixed(2)),hip:+hip.y.toFixed(2),head:+hd.y.toFixed(2),
      aL0:[b.aL0.rotation.x,b.aL0.rotation.y,b.aL0.rotation.z].map(v=>+v.toFixed(2)),aL1:+b.aL1.rotation.x.toFixed(2),lh0:[b.lh0.rotation.x,b.lh0.rotation.z].map(v=>+v.toFixed(2)),lh1:+b.lh1.rotation.x.toFixed(2),L:mModel._lkL?{p:+mModel._lkL.p.toFixed(2),s:+mModel._lkL.s.toFixed(2),y:+mModel._lkL.y.toFixed(2),k:+mModel._lkL.k.toFixed(2),pen:+mModel._lkL.pen.toFixed(4)}:null};
    // row 1: walking and galloping (8 frames over a stride)
    step(900,2.2);for(let i=0;i<4;i++){step(90,2.2);shot(i,1,Math.PI/2,i?'':'walk')}
    step(900,7.5);for(let i=0;i<4;i++){step(70,7.5);shot(4+i,1,Math.PI/2,i?'':'gallop')}
    // row 2: stop, standing idle, attack (dismounts), after dismount
    step(1200,0);shot(0,2,Math.PI/2,'stopped');
    const sp0=pl.position.clone();swing();step(110,0);shot(1,2,Math.PI/2+.5,'swing .11s');step(130,0);shot(2,2,Math.PI/2+.5,'swing .24s');step(700,0);shot(3,2,Math.PI/2+.5,'after swing');
    info[k].afterSwing={riding:!!riding,legX:+b.lh0.rotation.x.toFixed(2),armY:+b.aL0.rotation.y.toFixed(2),meshY:+pl.children[0].position.y.toFixed(2)};
    pl.position.copy(sp0);toggleMount();step(900,0);shot(4,2,Math.PI/2,'mounted again');step(900,1.4);shot(5,2,Math.PI/2,'walk');
    toggleMount();step(600,0);shot(6,2,Math.PI/2,'dismounted');step(600,1.4);shot(7,2,Math.PI/2,'walking');
    info[k].dismount={riding:!!riding,legX:+b.lh0.rotation.x.toFixed(2),legZ:+b.lh0.rotation.z.toFixed(2),armY:+b.aL0.rotation.y.toFixed(2),meshY:+pl.children[0].position.y.toFixed(2),meshZ:+pl.children[0].position.z.toFixed(2)};
    out[k]=cnv.toDataURL('image/jpeg',.85);
    if(riding)dismount();if(mModel)sc.remove(mModel);home.add(pl);
  }catch(e){info[k]={err:String(e)+' '+(e.stack||'').slice(0,500)};try{home.add(pl)}catch(_){}}}
  return {out,info}}"""
def part_mount(b):
    pg,errs=page(b);newgame(pg,'warrior')
    r=pg.evaluate(RIDE,[MNT,TAG])
    from PIL import Image
    tiles=[]
    for k,v in r['out'].items():
        f=O+'/v94_%s_ride_%s.jpg'%(TAG,k);open(f,'wb').write(base64.b64decode(v.split(',')[1]))
        im=Image.open(f);tiles.append(im.crop((0,0,300*4,300)))
    if tiles:
        S=Image.new('RGB',(1200,300*len(tiles)))
        for i,t in enumerate(tiles):S.paste(t,(0,i*300))
        S.save(O+'/v94_ride_sheet_%s.jpg'%TAG,quality=85)
    for k,v in r['info'].items():print(TAG,k,json.dumps(v))
    if TAG=='after':
        for k,v in r['info'].items():
            if 'err' in v:chk('ride '+k,False,v['err']);continue
            chk('ride %s dismounts on attack and resets'%k,not v['afterSwing']['riding'] and abs(v['afterSwing']['armY'])<.01 and abs(v['dismount']['legZ'])<.01 and abs(v['dismount']['meshY'])<.01 and not v['dismount']['riding'],json.dumps([v['afterSwing'],v['dismount']]))
    print('mount PAGEERRORS',len(errs),errs[:4])
    if TAG=='after':chk('mount no page errors',not errs)
    pg.context.close()

# ---------------------------------------------------------------- creator, save/load, barber, main menu (title flow)
COUNT=r"""window.__iv=new Set();{const si=setInterval,ci=clearInterval;window.setInterval=function(){const id=si.apply(this,arguments);__iv.add(id);return id};window.clearInterval=function(id){__iv.delete(id);return ci.apply(this,arguments)}}
window.__raf=0;{const r=requestAnimationFrame;window.requestAnimationFrame=function(f){__raf++;return r.call(this,f)}}
window.__wl=0;{const a=EventTarget.prototype.addEventListener,rm=EventTarget.prototype.removeEventListener;EventTarget.prototype.addEventListener=function(t,f,o){if(this===window)__wl++;return a.call(this,t,f,o)};EventTarget.prototype.removeEventListener=function(t,f,o){if(this===window)__wl--;return rm.call(this,t,f,o)}}"""
SIG=r"""()=>{const m0=LK.model;if(!m0)return null;const m=(m0.userData&&m0.userData.hero&&m0.userData.hero.bones)?m0.userData.hero:m0;const g=[];m.traverse(o=>{if(o.isMesh)g.push(o.geometry.uuid.slice(0,6)+(o.material&&o.material.color?o.material.color.getHexString():''))});
  const b=m.bones,sc=n=>b[n].scale.toArray().map(v=>v.toFixed(3)).join(',');const body=m.children.find(o=>o.isSkinnedMesh&&!o.dk);
  return g.sort().join('|')+'#'+['pelvis','chest','aL0'].map(sc).join(';')+'#'+(body?body.scale.x.toFixed(3):'')}"""
def to_creator(pg,dev='desktop',cls='ranger'):
    pg.wait_for_function("()=>!!document.getElementById('awT')",timeout=180000);pg.wait_for_timeout(800)
    pg.click('#awT [data-aw]');pg.wait_for_timeout(1200)
    if pg.evaluate("()=>!$('devp').classList.contains('hide')"):pg.click('[data-dev=%s]'%dev);pg.wait_for_timeout(600)
    pg.click('[data-c="%s"]'%cls);pg.wait_for_timeout(400);pg.click('#ccNext');pg.wait_for_timeout(1500)
def part_creator(b):
    from PIL import Image,ImageDraw
    ctx=b.new_context(viewport={'width':1100,'height':680});ctx.add_init_script(COUNT)
    pg,errs=page(b,notitle=False,ctx=ctx);ev=pg.evaluate
    to_creator(pg)
    st=ev("()=>({look:LK.on,title:$('ccT').textContent,steps:[...document.querySelectorAll('.ccst span')].map(s=>s.textContent+(s.classList.contains('on')?'*':'')),groups:document.querySelectorAll('#start .lkg').length})")
    chk('creator: appearance step after class',st['look']==1 and st['groups']==8,json.dumps(st))
    pg.wait_for_timeout(1500);pg.screenshot(path=O+'/v94_cc_desktop.png')
    # every option: the preview model changes; sheet of preview crops per group
    groups=ev("()=>{const G={};document.querySelectorAll('#start [data-lk]').forEach(b=>{if(b.tagName=='INPUT')return;(G[b.dataset.lk]=G[b.dataset.lk]||[]).push(b.dataset.v)});return G}")
    ev("()=>{window.__rr=ren.render;window.__pr=POST.render;ren.render=()=>{};POST.render=()=>{}}")
    tiles=[];bad=[]
    for k,vals in groups.items():
        pg.click('#start [data-lka=reset]');pg.wait_for_timeout(300)
        ev("(z)=>{LK.zoom=z;LK.rot=.35}",1.0 if k in('sex','build','skin') else 2.2)
        prev=None
        for i,v in enumerate(vals):
            pg.click('#start [data-lk="%s"][data-v="%s"]'%(k,v));pg.wait_for_timeout(700)
            sig=ev(SIG);on=ev("([k,v])=>{const L=lkFull(ccCls,LK.look);return String(L[k])==String(v)}",[k,v])
            if (prev is not None and sig==prev) or not on:bad.append('%s=%s'%(k,v))
            prev=sig
            f=O+'/_cc_%s_%d.png'%(k,i);pg.screenshot(path=f,clip=pg.locator('#ccPV').bounding_box(),timeout=120000);im=Image.open(f);im.thumbnail((150,170));tiles.append((k+' '+v,im))
    hs=[]
    for v in ['0.9','1.1']:
        ev("(v)=>{const r=document.querySelector('#start [data-lk=height]');r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}))}",v);pg.wait_for_timeout(700);hs.append(ev(SIG))
        f=O+'/_cc_h_%s.png'%v;ev("()=>{LK.zoom=1}");pg.wait_for_timeout(300);pg.screenshot(path=f,clip=pg.locator('#ccPV').bounding_box(),timeout=120000);im=Image.open(f);im.thumbnail((150,170));tiles.append(('height '+v,im))
    if hs[0]==hs[1]:bad.append('height')
    chk('creator: every option changes the preview',not bad,','.join(bad))
    W=Image.new('RGB',(150*10,190*((len(tiles)+9)//10)),(20,16,12));d=ImageDraw.Draw(W)
    for i,(t,im) in enumerate(tiles):W.paste(im,((i%10)*150,(i//10)*190));d.text(((i%10)*150+3,(i//10)*190+172),t,fill=(240,220,160))
    W.save(O+'/v94_cc_options.png');ev("()=>{ren.render=__rr;POST.render=__pr}")
    r0=ev("()=>LK.rot");box=pg.locator('#ccPV').bounding_box();pg.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);pg.mouse.down();pg.mouse.move(box['x']+box['width']/2+120,box['y']+box['height']/2,steps=5);pg.mouse.up()
    z0=ev("()=>LK.zoom");pg.mouse.wheel(0,-400);pg.wait_for_timeout(300)
    chk('creator: drag turns, wheel zooms',ev("()=>LK.rot")>r0+.5 and ev("()=>LK.zoom")>z0,json.dumps([r0,ev("()=>LK.rot"),z0,ev("()=>LK.zoom")]))
    pg.click('[data-lka=rnd]');pg.wait_for_timeout(500);rnd=ev("()=>Object.keys(LK.look).length");pg.click('[data-lka=reset]');pg.wait_for_timeout(500)
    chk('creator: randomize + reset',rnd==8 and ev("()=>Object.keys(LK.look).length")==0)
    for k,v in [('sex','1'),('hairStyle','4'),('hair','#b8823a'),('face','5'),('eye','#5a7a3a'),('build','0'),('skin','#8e623e')]:pg.click('#start [data-lk="%s"][data-v="%s"]'%(k,v));pg.wait_for_timeout(250)
    pg.fill('#ccName','Lyra');pg.click('#ccBack');pg.wait_for_timeout(500);back=ev("()=>[LK.on,ccStep,$('ccT').textContent]");pg.click('#ccNext');pg.wait_for_timeout(600)
    pg.click('#ccNext');pg.wait_for_timeout(800);s2=ev("()=>[LK.on,ccStep]");pg.click('#ccBack');pg.wait_for_timeout(400);s3=ev("()=>[LK.on,ccStep]");pg.click('#ccNext');pg.wait_for_timeout(400)
    chk('creator: back/next between the three steps',back[0]==0 and back[1]==0 and s2==[0,1] and s3==[1,0],json.dumps([back,s2,s3]))
    pg.click('#ccNext');pg.wait_for_timeout(3000)
    g=ev("()=>({look:hero.look,name:hero.name,start:$('start').classList.contains('hide'),sig:pl._lkSig,full:lkSig(heroLook())})")
    chk('creator: look kept on the hero',g['start'] and g['name']=='Lyra' and g['look'].get('hairStyle')==4 and g['look'].get('sex')==1 and g['sig']==g['full'],json.dumps(g))
    ev("()=>{camPitch=.25;camDist=4;camYaw=Math.PI;pl.rotation.y=0;snapCam()}");pg.wait_for_timeout(7000);pg.screenshot(path=O+'/v94_cc_ingame.png',timeout=120000)
    sv=ev("()=>{saveGame(true);return JSON.parse(localStorage.getItem(SAVE_KEY)).hero.look}")
    chk('save: hero.look in the save',sv and sv.get('face')==5,json.dumps(sv))
    pg.reload();pg.wait_for_function("()=>!!document.getElementById('awT')",timeout=180000);pg.wait_for_timeout(800);pg.keyboard.press('Enter');pg.wait_for_timeout(4000)
    g2=ev("()=>({look:hero.look,sig:pl._lkSig,full:lkSig(heroLook()),start:$('start').classList.contains('hide')})")
    chk('save: look loaded and worn',g2['start'] and g2['look']==sv and g2['sig']==g2['full'],json.dumps(g2))
    old=ev("()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY));delete s.hero.look;localStorage.setItem(SAVE_KEY,JSON.stringify(s));loadGame();return {look:hero.look,full:heroLook(),def:lkFull(hero.cls,null)}}")
    chk('save: old save gets the class default look',old['look'] is None and old['full']==old['def'],json.dumps(old))
    ev("()=>{hero.look=lkClean({hairStyle:4,face:5,sex:1,skin:'#8e623e',hair:'#b8823a',eye:'#5a7a3a',build:0});heroRebuild();saveGame(true)}")
    pg.wait_for_timeout(3000)
    # barber
    pg.click('#sysBtn');pg.click('#bagBtn');pg.wait_for_timeout(1500);pg.click('#lkBtn');pg.wait_for_timeout(1500)
    pg.screenshot(path=O+'/v94_barber.png')
    pg.click('#lkw [data-lk=hairStyle][data-v="3"]');pg.wait_for_timeout(300);pg.click('#lkw [data-lk=face][data-v="3"]');pg.wait_for_timeout(300);pg.click('#lkw [data-lk=hair][data-v="#dcdad4"]');pg.wait_for_timeout(800)
    pg.screenshot(path=O+'/v94_barber2.png');pg.click('#lkApply');pg.wait_for_timeout(1200)
    bb=ev("()=>({look:hero.look,open:!$('lkw').classList.contains('hide'),saved:JSON.parse(localStorage.getItem(SAVE_KEY)).hero.look,sig:pl._lkSig,full:lkSig(heroLook()),hp:HP&&HP._lkSig})")
    chk('barber: new look applied, saved, bag picture updated',not bb['open'] and bb['look'].get('hairStyle')==3 and bb['saved']==bb['look'] and bb['sig']==bb['full'] and bb['hp']==bb['full'],json.dumps(bb))
    pg.screenshot(path=O+'/v94_barber_bag.png')
    pg.click('#lkBtn');pg.wait_for_timeout(800);pg.click('#lkw [data-lk=hairStyle][data-v="0"]');pg.keyboard.press('Escape');pg.wait_for_timeout(500)
    chk('barber: cancel keeps the look',ev("()=>hero.look.hairStyle")==3 and ev("()=>$('lkw').classList.contains('hide')"))
    ev("()=>closeWin()")
    def counts():
        pg.wait_for_timeout(2500)
        return ev("async()=>{const r0=__raf;await new Promise(r=>setTimeout(r,2000));return {scene:scene.children.length,enemies:enemies.length,iv:__iv.size,raf:__raf-r0,wl:__wl,party:party.length}}")
    C=[counts()];print('menu counts start',C[0])
    for i in range(3):
        pg.click('#sysBtn');pg.wait_for_timeout(300);pg.click('#kqMenuSys');pg.wait_for_timeout(500)
        if i==0:pg.screenshot(path=O+'/v94_menu_confirm.png')
        pg.click('#kqMenuYes');pg.wait_for_timeout(1500)
        t=ev("()=>({title:!!$('awT'),on:KQMENU.on,ui:uiOpen(),btns:[...document.querySelectorAll('#awT [data-aw]')].map(b=>b.dataset.aw),saved:!!saveInfo(),mus:typeof muWant=='function'?muWant():null})")
        if i==0:pg.screenshot(path=O+'/v94_menu_title.png')
        p0=ev("()=>[pl.position.x,pl.position.z,hero.hp]");pg.wait_for_timeout(1500);p1=ev("()=>[pl.position.x,pl.position.z,hero.hp]")
        chk('menu %d: title shown, game paused and saved'%i,t['title'] and t['on']==1 and t['ui'] and t['btns'][0]=='cont' and t['saved'] and p0==p1,json.dumps([t,p0,p1]))
        pg.click('#awT [data-aw=cont]');pg.wait_for_timeout(1500)
        C.append(counts());print('menu counts after',i+1,C[-1])
    pg.screenshot(path=O+'/v94_menu_back.png')
    st=all(c['scene']==C[0]['scene'] and c['enemies']==C[0]['enemies'] and c['iv']==C[0]['iv'] and c['wl']==C[0]['wl'] for c in C) and max(c['raf'] for c in C)<=C[0]['raf']*1.6+4
    chk('menu: scene/enemies/intervals/listeners/RAF stable over 3 returns',st,json.dumps(C))
    chk('menu: game runs again',ev("()=>!KQMENU.on&&!uiOpen()&&!$('awT')"))
    pg.keyboard.press('o');pg.wait_for_timeout(600);ok=ev("()=>!!$('kqMenuBtn')&&!$('setw').classList.contains('hide')");pg.click('#kqMenuBtn');pg.wait_for_timeout(400);pg.click('#kqMenuYes');pg.wait_for_timeout(1500)
    pg.click('#awT [data-aw=new]');pg.wait_for_timeout(400);pg.click('#awT [data-aw=new]')
    pg.wait_for_timeout(3000);pg.wait_for_function("()=>typeof hero!='undefined'&&!!document.getElementById('ccNext')&&!document.getElementById('awT')",timeout=180000);pg.wait_for_timeout(1500)
    n=ev("()=>({save:!!saveInfo(),start:!$('start').classList.contains('hide'),devp:$('devp').classList.contains('hide'),title:!!$('awT')})")
    chk('menu: settings button; new game reloads into the creator',ok and not n['save'] and n['start'] and n['devp'] and not n['title'],json.dumps([ok,n]))
    print('creator PAGEERRORS',len(errs),errs[:5]);chk('creator/menu no page errors',not errs)
    ctx.close()
    ctx=b.new_context(viewport={'width':390,'height':780},has_touch=True,is_mobile=True)
    pg,errs=page(b,notitle=False,ctx=ctx);to_creator(pg,'mobile','mage');pg.wait_for_timeout(1500);pg.screenshot(path=O+'/v94_cc_mobile.png')
    pg.evaluate("()=>{const e=document.querySelector('#start .ccb');e.scrollTop=420}");pg.wait_for_timeout(500);pg.screenshot(path=O+'/v94_cc_mobile2.png')
    ovf=pg.evaluate("()=>document.documentElement.scrollWidth<=innerWidth+1")
    chk('creator: phone layout fits the width',ovf);print('mobile PAGEERRORS',len(errs),errs[:5]);chk('mobile no page errors',not errs)
    ctx.close()

PROBE=os.environ.get('PROBE')
with sync_playwright() as p:
    b=launch(p)
    if PROBE:
        pg,errs=page(b);newgame(pg,'warrior');print(json.dumps(pg.evaluate(open(PROBE).read())));print(errs[:3])
    if 'mount' in PART:part_mount(b)
    if 'creator' in PART:part_creator(b)
    b.close()
print('CHECKS OK' if not FAIL else 'CHECKS FAIL: '+', '.join(FAIL))
