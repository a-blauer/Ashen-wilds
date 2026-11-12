# v223 the Magic Shop's evolution preview shows the hero again.
# Owner: "The magic shop evolved ability animation preview has the character model missing from the animation."
# Opens the Magic Shop (keeper view on) beside its keeper, picks an evolved ability, lets the preview play, and over several
# frames checks the hero model is on the preview stage, visible all the way up to the preview scene and drawn by the preview
# camera. Then: the world's hero stays hidden while the keeper view is on and the preview is off, comes back when the shop
# closes, and the Abilities window preview still shows the hero.
# Pictures: out/v223_evo_frames.jpg (the preview frames), out/v223_evo_shop.png (the window), out/v223_abil_frames.jpg.
import os,sys,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+('' if ok else '  '+str(info)[:400]))
    if not ok:FAIL.append(n)
# frames: render the preview, count hero meshes the preview camera drew, and save the picture into a sheet
LIB=r"""window.__v223=(N,gap)=>new Promise(res=>{const FW=320,FH=200,cv=document.createElement('canvas');cv.width=FW*Math.min(N,3);cv.height=FH*Math.ceil(N/3);const x=cv.getContext('2d');
  const out={fr:[]};let i=0;
  const seen=o=>{for(let p=o;p;p=p.parent){if(!p.visible)return 'hidden at '+(p===pl?'hero':p.type+(p.name?':'+p.name:''));if(p===PV.sc)return ''}return 'not in the preview scene'};
  (function one(){if(i>=N){out.img=cv.toDataURL('image/jpeg',.85);res(out);return}
    try{POST.render()}catch(e){}   // one game frame first (the keeper view's step runs in it)
    const f={view:!!IM220.on&&IM220.hid,on:ABX.on,stage:false,why:'',drawn:0,meshes:0,ndc:null,pv:pl.visible};
    try{f.stage=!!ABX.root&&abxOnStage(pl)&&PV.obj===ABX.root;f.why=seen(pl);
      const M=[];pl.traverse(c=>{if(c.isMesh||c.isSkinnedMesh){M.push([c,c.onBeforeRender]);c.onBeforeRender=function(){f.drawn++}}});f.meshes=M.length;
      const w=PV.cv.clientWidth||FW,h=PV.cv.clientHeight||FH;PV.r.render(PV.sc,PV.cam);x.drawImage(PV.cv,(i%3)*FW,Math.floor(i/3)*FH,FW,FH);
      M.forEach(([c,o])=>{c.onBeforeRender=o});
      const p=pl.getWorldPosition(new THREE.Vector3());p.y+=.6;p.project(PV.cam);f.ndc=[+p.x.toFixed(2),+p.y.toFixed(2)]}catch(e){f.err=String(e)}
    out.fr.push(f);i++;setTimeout(one,gap)})()});"""
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.set_default_timeout(600000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{"+LIB+"window.__l223=0;{const f=loop;loop=function(){window.__l223++;return f.apply(this,arguments)}}}")
    r=ev("""()=>{SH.shop.magic=1;gold=1e7;hero.lvl=50;TOD=.3;const c=hero.cls,s=kqsAll(c).find(q=>kqsUnl(c,q)&&ev137Def(q));if(!s)return {err:'no ability that evolves'};
      hero.tal['ab:'+s.n]=5;hero.tal[ev137Key(s.n)]=1;KQS.ck='';try{hsDirty()}catch(_){}
      try{lotAuto103();TWN100_shopSync()}catch(e){console.warn('v223 shop build',e)}const n=TWN100_S.npc.magic;if(!n)return {err:'no magic shop keeper'};const p=im220Rig(n).getWorldPosition(new THREE.Vector3());
      pl.position.set(p.x+1.2,pl.position.y,p.z+2.2);snapCam();MS194.tab='evo';MS194.ab=s.n;openX('magic');
      return {ab:s.n,en:ev137Def(s).en,party:party.length}}""")
    print('setup',r)
    if r.get('err'):chk('setup',False,r['err']);return
    pg.wait_for_timeout(2500)
    st=ev("()=>({mode:xwMode,view:!!IM220.on&&IM220.on.key,hid:IM220.hid,abx:ABX.on,pv:EV137.pv,host:!!$('ms194PV')&&!!$('ms194PV').querySelector('canvas'),inScene:pl.parent===scene})")
    print('state',st)
    chk('magic shop open in the keeper view',st['mode']=='magic' and st['view']=='magic',st)
    chk('evolved preview running in the shop',st['abx'] and st['pv']==r['ab'] and st['host'],st)
    f=ev("()=>__v223(6,380)")
    open(play.TMP+'/v223_evo_frames.jpg','wb').write(base64.b64decode(f['img'].split(',')[1]))
    for i,q in enumerate(f['fr']):print('frame',i,q)
    bad=[(i,q) for i,q in enumerate(f['fr']) if not(q['on'] and q['stage'] and not q['why'] and q['drawn']>0)]
    chk('hero on the preview stage, visible and drawn in every frame (%d frames)'%len(f['fr']),not bad,bad[:3])
    off=[(i,q['ndc']) for i,q in enumerate(f['fr']) if not q['ndc'] or abs(q['ndc'][0])>1 or abs(q['ndc'][1])>1]
    chk('hero inside the preview picture',not off,off)
    pg.screenshot(path=play.TMP+'/v223_evo_shop.png')
    # the world's hero: hidden while the keeper view is on (preview off), back once the shop closes
    # (each step also draws one frame itself, POST.render -> im220Tick, so it never hangs on how fast the game loop runs here)
    w=ev("async()=>{MS194.tab='forge';rX();await new Promise(r=>setTimeout(r,900));POST.render();const a={abx:ABX.on,inScene:pl.parent===scene,vis:pl.visible,view:!!IM220.on,loops:window.__l223};closeX();await new Promise(r=>setTimeout(r,900));POST.render();a.after={vis:pl.visible,inScene:pl.parent===scene,view:!!IM220.on,xw:$('xw').className,loops:window.__l223};return a}")
    print('world',w)
    chk('preview off: hero back in the world and still hidden by the keeper view',not w['abx'] and w['inScene'] and w['view'] and not w['vis'],w)
    chk('shop closed: hero visible in the world again',w['after']['vis'] and w['after']['inScene'] and not w['after']['view'],w['after'])
    # back in the shop: preview on again, then close straight from the preview
    q=ev("async()=>{MS194.tab='evo';openX('magic');await new Promise(r=>setTimeout(r,1500));POST.render();const a={abx:ABX.on,vis:pl.visible,stage:!!ABX.root&&abxOnStage(pl),view:!!IM220.on};closeX();await new Promise(r=>setTimeout(r,900));POST.render();a.after={vis:pl.visible,inScene:pl.parent===scene,abx:ABX.on};return a}")
    print('again',q)
    chk('reopened: preview shows the hero',q['abx'] and q['vis'] and q['stage'],q)
    chk('closed during the preview: hero visible in the world',q['after']['vis'] and q['after']['inScene'] and not q['after']['abx'],q['after'])
    # the Abilities window preview
    ev("()=>{openAbil()}");pg.wait_for_timeout(1500)
    a=ev("()=>__v223(3,380)")
    open(play.TMP+'/v223_abil_frames.jpg','wb').write(base64.b64decode(a['img'].split(',')[1]))
    for i,q in enumerate(a['fr']):print('abil frame',i,q)
    bad=[(i,q) for i,q in enumerate(a['fr']) if not(q['on'] and q['stage'] and not q['why'] and q['drawn']>0)]
    chk('Abilities window preview shows the hero',not bad,bad[:3])
    ev("()=>closeX()");pg.wait_for_timeout(600)
    chk('hero in the world after the Abilities window',ev("()=>pl.parent===scene&&pl.visible"))
    chk('no page errors',not errs,errs[:3])
play.run(s,w=1280,hh=760)
print('FAILURES:',FAIL if FAIL else 'none')
