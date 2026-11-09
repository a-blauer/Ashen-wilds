# v210: Hillside Crest's arrival cinematic as video frames (capture mode: hc208Cap / hc208Seek), for review.
#   F0=0 F1=748 FPS=20 W=960 H=540 python3 v210_video.py   -> test/out/v208_frames/f%05d.jpg (frames F0..F1-1)
#   SOUND=1 ...                                              -> test/out/v208_sound.wav too (the score + the Hydra's hiss and roar)
# GitHub draws it in pieces at the same time: .github/workflows/render-hc208.yml (push a commit to render-hc/<name>).
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;W=int(os.environ.get('W','960'));H=int(os.environ.get('H','540'));FPS=float(os.environ.get('FPS','20'))
F0=int(os.environ.get('F0','0'));F1=int(os.environ.get('F1','0'))
WAV=r"""async()=>{const sr=44100,len=HC208.len+.6,ac=new OfflineAudioContext(2,Math.ceil(sr*len),sr),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);
  hc208Score(ac,out,0);
  // the Hydra's own sounds (svSnd plays on the game's audio): the same calls, pointed at this offline mix at their times
  try{if(!NOISE){NOISE=ac.createBuffer(1,sr,sr);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    const sv=AUD,fx=ac.createGain();fx.gain.value=.55;fx.connect(out);
    [[HC208.rise[0]-.2,'hiss',.6,.55],[HC208.roar+.3,'hiss',.8,.6],[HC208.roar+1.55,'roar',1,1.1],[HC208.roar+1.55,'shriek',.5,.8]].forEach(([T,k,v,p])=>{
      AUD=new Proxy(ac,{get(t,n){if(n==='state')return 'running';if(n==='currentTime')return T;if(n==='out')return fx;const x=t[n];return typeof x=='function'?x.bind(t):x}});try{svSnd(k,v,p)}finally{AUD=sv}})}catch(e){console.warn('v208 sound fx',e)}
  const b=await ac.startRendering(),n=b.length,L=b.getChannelData(0),R=b.getChannelData(1),buf=new ArrayBuffer(44+n*4),v=new DataView(buf);let pk=0;
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){const a=Math.max(-1,Math.min(1,L[i])),c=Math.max(-1,Math.min(1,R[i]));pk=Math.max(pk,Math.abs(a),Math.abs(c));v.setInt16(44+i*4,a*32767,true);v.setInt16(46+i*4,c*32767,true)}
  let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return {b64:btoa(s),peak:pk}}"""
def s(pg):
    pg.set_default_timeout(1800000)
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{insArrive(INSL[5]);return 1}");pg.wait_for_timeout(4000)
    if os.environ.get('SOUND'):
        r=ev(WAV);open(O+'/v208_sound.wav','wb').write(base64.b64decode(r['b64']));print('sound peak',r['peak'])
    if F1<=F0:return
    # every piece is drawn on its own machine: the same seeded random numbers from here on, so the warriors, creatures and the
    # Ascent's rocks are built identically in every piece (otherwise they change where two pieces meet)
    print('cap',json.dumps(ev("()=>{let s=20811;Math.random=function(){s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};HC208.seen=0;return hc208Cap()}")))
    d=O+'/v208_frames';os.makedirs(d,exist_ok=True)
    # replay up to the first frame without drawing (the city's folk and the Hydra step with time), then draw each frame
    ev("(t)=>{HC208.noDraw=1;let x=0;while(x<t-1e-6){x=Math.min(t,x+1/20);hc208Seek(x)}HC208.noDraw=0;return 1}",F0/FPS)
    for f in range(F0,F1):
        ev("(t)=>{hc208Seek(t);return 1}",f/FPS)
        if f/FPS>=35.0:pg.wait_for_timeout(120)   # after the hand-back the game draws itself
        pg.screenshot(path=d+'/f%05d.jpg'%f,type='jpeg',quality=90,timeout=600000)
        if f%20==0:print('frame',f,flush=True)
    e=ev("()=>HC208.err||null")
    if e:print('FAIL frame error',e)
play.run(s,w=W,hh=H)
