# v151 intro cinematic: renders it frame by frame in capture mode (ic151Cap / ic151Seek).
#   python3 v151_intro.py                      -> checks + stills at key moments: test/out/v151_shot_<t>.jpg
#   TIMES=3,9.5,19.6 python3 v151_intro.py     -> just those stills
#   VIDEO=1 FPS=24 W=1280 H=720 python3 v151_intro.py  -> every frame to test/out/v151_frames/ + sound to v151_sound.wav,
#                                                  then test/out/v151_intro.mp4 (needs ffmpeg). FROM=/TO= limit the range.
import os,sys,base64,json,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;W=int(os.environ.get('W','960'));H=int(os.environ.get('H','540'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
WAV=r"""async()=>{const sr=44100,len=IC151.len+.5,ac=new OfflineAudioContext(2,Math.ceil(sr*len),sr),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);
  ic151Score(ac,out,0);const b=await ac.startRendering(),n=b.length,L=b.getChannelData(0),R=b.getChannelData(1),buf=new ArrayBuffer(44+n*4),v=new DataView(buf);let pk=0;
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};ws(0,'RIFF');v.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){const a=Math.max(-1,Math.min(1,L[i])),c=Math.max(-1,Math.min(1,R[i]));pk=Math.max(pk,Math.abs(a),Math.abs(c));v.setInt16(44+i*4,a*32767,true);v.setInt16(46+i*4,c*32767,true)}
  let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return {b64:btoa(s),peak:pk}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    chk('intro not played under automation',ev("()=>!IC151.run&&!document.getElementById('ic151')"))
    info=ev("([w,h])=>ic151Cap(w,h)",[W,H]);print('cap',info)
    chk('hand grips plates',len(info['grips'])==5,info['grips']);chk('rat slab found',info['rat'] and 3.5<info['edge']<6.5,info['edge']);chk('upright rat built',info['hero'])
    chk('arm reaching down, no giant figure',info['arm'] and not info['giant'],(info['arm'],info['giant']));chk('rat path track',info['rtrk']>1000,info['rtrk']);chk('fistful of earth (centre + pierced slabs)',info['chunk']>=8,info['chunk'])
    ph=info['phys'];chk('earth simulation finished',ph['done'],ph);chk('most pieces fall into the chasm',ph['moved']>=ph['dyn']*.7,ph);chk('impacts recorded',ph['ev']>=10,ph['ev'])
    chk('main loop paused',ev("()=>IC151.on"))
    # v151b: the upright rat's pose is a pure function of t (no drift from the game's animation layers), the voice is off
    hp=ev("()=>{const B=IC151.S.hero.bones,V=THREE.Vector3,g=()=>[B.head,B.aR2,B.cp2,B.tl8].map(b=>b.getWorldPosition(new V()).toArray());ic151Seek(54.2);const a=g();for(let t=51.9;t<55.8;t+=1/60)ic151Seek(t);ic151Seek(54.2);const b=g();let d=0;a.forEach((p,i)=>p.forEach((v,j)=>d=Math.max(d,Math.abs(v-b[i][j]))));return d}")
    chk('upright rat pose does not drift',hp<1e-6,hp)
    chk('narration is text only',ev("()=>!IC151.speak&&!IC151.voiceUrl"))
    # v151c: the Duskhold part (3081): built, four town folk met in order, six portals, a face for each Sovereign,
    # and the hero's walk never passes through a building (solid meshes standing on the ground, sampled every 0.1 s)
    dk=ev("""()=>{const D=IC151.S.D;if(!D)return null;const V=THREE.Vector3,hit=[];scene.updateMatrixWorld(true);const bx=[];
      scene.traverse(o=>{if(!o.isMesh||!o.geometry)return;let v=true,q=o;while(q){if(q.visible===false)v=false;q=q.parent}if(!v)return;if(o===D.pil||D.ch&&D.ch.root.getObjectById(o.id)||pl.getObjectById(o.id)||(typeof fols!='undefined'&&fols.some(f=>f&&f.getObjectById&&f.getObjectById(o.id))))return;
        const b=new THREE.Box3().setFromObject(o);if(b.max.x<14||b.min.x>66||b.max.z<255||b.min.z>360)return;const sx=b.max.x-b.min.x,sz=b.max.z-b.min.z,g=GH((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2);
        if(sx>30||sz>30||sx*sz<.15||b.min.y>g+.6||b.max.y<g+1.2)return;bx.push(b)});
      for(const L of D.legs)for(let t=L.a;t<=L.b;t+=.1){const p=ic151DPos(D,t);for(const b of bx)if(p[0]>b.min.x+.05&&p[0]<b.max.x-.05&&p[1]>b.min.z+.05&&p[1]<b.max.z-.05){hit.push([+t.toFixed(1),+p[0].toFixed(1),+p[1].toFixed(1)]);break}}
      return {npc:D.npc.map(n=>n.k),gates:D.gates.length,faces:(IC151.SF||[]).filter(x=>x).length,legs:D.legs.length,end:D.end,ch:!!D.ch,hit:hit.slice(0,8),nh:hit.length}}""")
    print('duskhold',dk)
    chk('Duskhold part built',dk is not None and dk['legs']==6 and dk['ch'],dk)
    if dk:
        chk('meets Steward, Innkeeper, Blacksmith, Merchant in order',dk['npc']==['steward','inn','smith','merchant'],dk['npc'])
        chk('six portals with a Sovereign face each',dk['gates']==6 and dk['faces']==6,(dk['gates'],dk['faces']))
        chk('the walk stays clear of buildings',dk['nh']==0,dk['hit'])
        # v151: no floating name tags over the town folk in the cinematic (they come back afterwards: checked at the end)
        TAGS="()=>{let n=0;const w=new THREE.Vector3();scene.traverse(o=>{if(!o.isSprite||!o.material||!o.material.map||!o.material.map.isCanvasTexture)return;let v=true,q=o;while(q){if(q.visible===false)v=false;q=q.parent}o.getWorldPosition(w);if(v&&Math.hypot(w.x-40,w.z-305)<80)n++});return n}"
        ev("()=>ic151Seek(65)");pg.wait_for_timeout(600);ev("()=>ic151Seek(65.05)")
        chk('no name tags over the town folk in the cinematic',ev(TAGS)==0,ev(TAGS))
        # v151: subtitle lines break only between words (each word's letters sit in one box on one line)
        ev("()=>ic151Seek(122.5)")
        wb=ev("""()=>{const W=[...document.querySelectorAll('#ic151 .sub .w')];return {n:W.length,split:W.filter(w=>{const c=[...w.children];return c.length&&c.some(e=>Math.abs(e.offsetTop-c[0].offsetTop)>2)}).map(w=>w.textContent)}}""")
        chk('subtitle words never split over two lines',wb['n']>5 and not wb['split'],wb)
    hg=ev("()=>({nv:IC151.HG.nv,nt:IC151.HG.nt,ms:IC151.HG.ms})");print('hand mesh',hg);chk('detailed hand mesh',hg['nt']>30000,hg)
    if os.environ.get('VIDEO'):
        fps=float(os.environ.get('FPS','24'));d=O+'/v151_frames';os.makedirs(d,exist_ok=True)
        a=float(os.environ.get('FROM','0'));b=float(os.environ.get('TO',str(ev('()=>IC151.len'))))
        i0=int(round(a*fps));i1=int(round(b*fps))
        for i in range(i0,i1):
            t=i/fps;ev("t=>ic151Seek(t)",t)
            if t>=55.9:pg.wait_for_timeout(60)
            pg.screenshot(path=d+'/f%05d.jpg'%i,type='jpeg',quality=90)
            if i%48==0:print('frame',i,'t=%.2f'%t,flush=True)
        chk('no frame errors',not ev("()=>IC151.err||null"),ev("()=>IC151.err||''")[:300])
        if not os.environ.get('NOSOUND'):
            r=ev(WAV);open(O+'/v151_sound.wav','wb').write(base64.b64decode(r['b64']));print('sound peak',r['peak'])
        return
    T=[float(x) for x in os.environ.get('TIMES','1,4,7.2,9.8,12.6,14.5,16.4,18.6,19.6,21,22.2,23.6,24.8,26.4,28.6,30.6,33,36,39,42.5,46,49.5,51.6,53,54.6,57').split(',')]
    for t in T:
        ev("t=>ic151Seek(t)",t)
        if t>=55.9:pg.wait_for_timeout(1500);ev("t=>ic151Seek(t)",t)
        pg.screenshot(path=O+'/v151_shot_%05.1f.jpg'%t,type='jpeg',quality=85);print('shot',t,flush=True)
    chk('no frame errors',not ev("()=>IC151.err||null"),ev("()=>IC151.err||''")[:300])
    ev("()=>ic151Seek(IC151.len+.1)")
    chk('cleaned up',ev("()=>!IC151.run&&!IC151.on&&!document.getElementById('ic151')&&!ren.domElement.style.filter"))
    if dk:
        ho=ev("()=>({p:[pl.position.x,pl.position.z],cls:document.body.classList.contains('ic151d'),ch:!!(IC151.S&&IC151.S.D&&IC151.S.D.ch&&IC151.S.D.ch.root.parent)})")
        chk('game starts on the Portal Road in Duskhold',abs(ho['p'][0]-40)<.3 and abs(ho['p'][1]-349.4)<.3 and not ho['cls'] and not ho['ch'],ho)
        chk('name tags back after the cinematic',ev(TAGS)>=3,ev(TAGS))
play.run(s,w=W,hh=H)
if FAIL:print('FAILED',FAIL)
if os.environ.get('VIDEO') and not FAIL:
    fps=os.environ.get('FPS','24');a=os.environ.get('FROM','0')
    cmd=['ffmpeg','-y','-loglevel','error','-framerate',fps,'-start_number',str(int(round(float(a)*float(fps)))),'-i',O+'/v151_frames/f%05d.jpg']
    if os.path.exists(O+'/v151_sound.wav') and not os.environ.get('NOSOUND'):cmd+=['-ss',a,'-i',O+'/v151_sound.wav','-c:a','aac','-b:a','160k','-shortest']
    cmd+=['-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-movflags','+faststart',O+'/v151_intro.mp4']
    print(' '.join(cmd));subprocess.run(cmd,check=True);print('wrote',O+'/v151_intro.mp4')
