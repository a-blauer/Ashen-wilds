# v208 Kindlelight arrival cinematic: renders it frame by frame in capture mode (kc208Cap / kc208Seek) + checks.
#   python3 v208_kindlelight.py                 -> checks + stills at key moments: test/out/v208_<t>.jpg
#   TIMES=3,9.5 python3 v208_kindlelight.py     -> just those stills (the frames before them are stepped without drawing)
#   VIDEO=1 FPS=24 W=1280 H=720 python3 v208_kindlelight.py -> every frame + the score -> test/out/v208_kindlelight.mp4 (ffmpeg)
#     F0=/F1= a frame range, NOSOUND=1, NOENC=1 (GitHub draws it in pieces: tools/render_kc208.sh)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
WAV=r"""async()=>{const sr=44100,len=KC208.len+.5,ac=new OfflineAudioContext(2,Math.ceil(sr*len),sr),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);
  kc208Score(ac,out,0);const b=await ac.startRendering(),n=b.length,L=b.getChannelData(0),R=b.getChannelData(1),buf=new ArrayBuffer(44+n*4),v=new DataView(buf);let pk=0;
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){const a=Math.max(-1,Math.min(1,L[i])),c=Math.max(-1,Math.min(1,R[i]));pk=Math.max(pk,Math.abs(a),Math.abs(c));v.setInt16(44+i*4,a*32767,true);v.setInt16(46+i*4,c*32767,true)}
  let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return {b64:btoa(s),peak:pk}}"""
TIMES=[float(x) for x in os.environ.get('TIMES','3.5,6.8,9.5,13.2,16,20,23,26.5,29.4,30.3,32.5,35,37.2').split(',')]
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]');pg.click('[data-c="%s"]'%os.environ.get('CLS','warrior'));pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    chk('a new hero has not seen it',ev("()=>KC208.seen===0"))
    # arrive in Kindlelight I: not played under automation
    ev("()=>{insArrive(INSL[0])}");pg.wait_for_timeout(1500)
    chk('not played under automation',ev("()=>!KC208.run&&!document.getElementById('kc208')"))
    ev("()=>{KC208.seen=0}")
    info=ev("()=>kc208Cap()");print('cap',json.dumps(info)[:600])
    chk('built: stand-ins, Argus, sigils, the lantern road',info and len(info['cast'])>=9 and info['boss'] and info['eyes']>20 and info['sig'] and info['road'],info and (info['cast'],info['boss'],info['eyes']))
    chk('main loop paused',ev("()=>KC208.on"))
    if os.environ.get('VIDEO'):
        import base64,subprocess,shutil
        fps=int(os.environ.get('FPS','24'));D=O+'/v208_frames';n=int(ev("()=>KC208.len")*fps)
        f0=int(os.environ.get('F0','0'));f1=min(n,int(os.environ.get('F1',str(n))))
        if f0==0:shutil.rmtree(D,ignore_errors=True)
        os.makedirs(D,exist_ok=True)
        for i in range(f0,f1):
            ev("(t)=>kc208Seek(t)",i/fps)
            pg.screenshot(path=D+'/f%05d.jpg'%i,type='jpeg',quality=90)
            if i%24==0:print('frame',i,'/',n,flush=True)
        if not os.environ.get('NOSOUND'):
            w=ev(WAV);open(O+'/v208_sound.wav','wb').write(base64.b64decode(w['b64']));print('sound peak',w['peak'])
        if not os.environ.get('NOENC'):
            subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(fps),'-i',D+'/f%05d.jpg','-i',O+'/v208_sound.wav','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-shortest',O+'/v208_kindlelight.mp4'])
            print('video',O+'/v208_kindlelight.mp4')
        return
    t=0.0
    for T in TIMES:
        ev("([a,b])=>{KC208.noDraw=true;for(let t=a;t<b-.001;t+=1/15)kc208Seek(t);KC208.noDraw=false;kc208Seek(b)}",[t,T]);t=T
        pg.wait_for_timeout(300)
        pg.screenshot(path=O+'/v208_%05.1f.jpg'%T,type='jpeg',quality=80)
    print('err',ev("()=>KC208.err||null"))
    # v208c (owner): no text on screen but the voice's lines: no quest cards, no name title
    tx=ev("()=>[5,12,19,29.8].map(t=>{kc208Seek(t);const D=KC208.S.dom;return +D.nc.style.opacity+ +D.bt.style.opacity})")
    chk('only the voice speaks: no cards or titles on screen',max(tx)==0,tx)
    tg=ev("()=>{kc208Seek(4);let n=0;scene.traverse(o=>{if(!o.isSprite||!o.material||!o.material.map||!o.material.map.isCanvasTexture)return;let v=true,q=o;while(q){if(q.visible===false)v=false;q=q.parent}if(v)n++});window.__tags=KC208.S.tags;return {n,hid:KC208.S.tags.length}}")
    chk('no name tags in the world while it plays',tg['n']==0 and tg['hid']>0,tg)
    ev("()=>kc208Seek(KC208.len+1)")
    chk('name tags back afterwards',ev("()=>window.__tags.every(o=>o.visible)"))
    chk('ends: overlay gone, loop runs, seen saved',ev("()=>!KC208.run&&!KC208.on&&!document.getElementById('kc208')&&x2Save().kc208===1"))
    chk('stand-ins removed',ev("()=>{let n=0;scene.traverse(o=>{if(o.userData&&o.userData.noFarCull&&o.userData.psNo&&o.isE)n++});return n}")==0)
    # the sound renders (offline) and is neither silent nor clipping
    snd=ev("""async()=>{const sr=22050,ac=new OfflineAudioContext(2,Math.ceil(sr*(KC208.len+.5)),sr),out=ac.createGain();out.connect(ac.destination);kc208Score(ac,out,0);
      const b=await ac.startRendering(),L=b.getChannelData(0);let pk=0,rms=0;for(let i=0;i<L.length;i++){pk=Math.max(pk,Math.abs(L[i]));rms+=L[i]*L[i]}return {pk,rms:Math.sqrt(rms/L.length)}}""")
    print('sound',snd);chk('the score renders, not silent, no clipping',snd['rms']>.003 and snd['pk']<1.2,snd)
    # live: the first arrival plays it (portal fade), the game waits, the title card waits, Esc skips, the card follows; never twice
    ev("()=>{window.KQ_KC208=1;KC208.seen=0;KC208.t=0;toPos(40,349.4);ZT116.last=null}");pg.wait_for_timeout(800)
    ev("()=>{window.__zt=0;const h=document.getElementById('ztc116');if(h)h.textContent=''}")
    ev("()=>enterMap(0,0)");pg.wait_for_timeout(1500)
    for _ in range(40):
        if ev("()=>KC208.run&&(KC208.t||0)>0"):break
        pg.wait_for_timeout(250)
    lv=ev("()=>({run:KC208.run,dom:!!document.getElementById('kc208'),t:KC208.t||0,q:(KC208.q||[]).length,zt:((document.getElementById('ztc116')||{}).textContent||'').indexOf('Kindlelight')>=0?1:0,x:pl.position.x})");print('live',lv)
    chk('plays on the first arrival in Kindlelight',lv['run'] and lv['dom'] and lv['t']>0,lv)
    chk('the zone title card waits for it',lv['zt']==0 and lv['q']>=1,lv)
    pg.keyboard.press('Escape');pg.wait_for_timeout(4000)
    lv2=ev("()=>({run:KC208.run,dom:!!document.getElementById('kc208'),zt:((document.getElementById('ztc116')||{}).textContent||'').indexOf('Kindlelight')>=0?1:0,seen:KC208.seen,in:curIns()&&curIns().g,vis:pl.visible,cls:document.body.classList.contains('ic151d')})");print('after skip',lv2)
    chk('Esc skips it; the game is back with the hero',not lv2['run'] and not lv2['dom'] and lv2['in']==0 and lv2['vis'] and not lv2['cls'],lv2)
    chk('the title card shows after it',lv2['zt']>=1,lv2)
    ev("()=>{toPos(40,349.4)}");pg.wait_for_timeout(500);ev("()=>enterMap(0,1)");pg.wait_for_timeout(2500)
    chk('not played again',ev("()=>!KC208.run"))
    # saves: kept; older saves that already know Kindlelight never see it
    chk('save/load keeps it seen',ev("()=>{const s=x2Save();KC208.seen=0;x2Load(s);return KC208.seen===1}"))
    chk('a new save that never came here has not seen it',ev("()=>{const s=x2Save();delete s.kc208;s.insr=[0,0,0,0,0,0];s.mq143={v:160,st:0,b:0,lit:[],seen:0};x2Load(s);const r=KC208.seen===0;return r}"))
    chk('an older save that met the Lantern Road has seen it',ev("()=>{const s=x2Save();delete s.kc208;s.mq143={v:160,st:1,b:0,lit:[],seen:1};x2Load(s);return KC208.seen===1}"))
    print('FAILS',FAIL)
play.run(s,w=int(os.environ.get('W','960')),hh=int(os.environ.get('H','540')))
