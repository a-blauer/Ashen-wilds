# v151 intro cinematic: renders it frame by frame in capture mode (ic151Cap / ic151Seek).
#   python3 v151_intro.py                      -> checks + stills at key moments: test/out/v151_shot_<t>.jpg
#   TIMES=3,9.5,19.6 python3 v151_intro.py     -> just those stills
#   VIDEO=1 FPS=24 W=1280 H=720 python3 v151_intro.py  -> every frame to test/out/v151_frames/ + sound to v151_sound.wav,
#                                                  then test/out/v151_intro.mp4 (needs ffmpeg). FROM=/TO= limit the range.
#   F0=/F1= limit it by frame number; NOENC=1 skips the mp4. GitHub renders it in pieces: tools/render.sh (only what changed).
import os,sys,base64,json,subprocess,math
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
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%os.environ.get('CLS','warrior'),timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    chk('intro not played under automation',ev("()=>!IC151.run&&!document.getElementById('ic151')"))
    info=ev("([w,h])=>ic151Cap(w,h)",[W,H]);print('cap',info)
    chk('the quake splits the middle into plates',info['split']==5,info['split']);chk('rat slab found',info['rat'] and 3.5<info['edge']<6.5,info['edge']);chk('upright rat built',info['hero'])
    chk('an earthquake, no hand (v151b)',info['quake'] and not info['hand'],(info['quake'],info['hand']));chk('rat path track',info['rtrk']>1000,info['rtrk'])
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
      // v151e: the town wall and gate are one big mesh (skipped above): rays along the walk, at his middle and 0.3 m to each side,
      // must not cross it (he goes out through the gate's opening, not through a post)
      const WL=[];scene.traverse(o=>{const nm=o.name||(o.parent&&o.parent.name)||'';if(o.isMesh&&/^kdWalls/.test(nm))WL.push(o)});const rw=new THREE.Raycaster(),wh=[];
      for(const L of D.legs){let p0=null;for(let t=L.a;t<=L.b+1e-6;t+=.05){const p=ic151DPos(D,t);if(p0){const dx=p[0]-p0[0],dz=p[1]-p0[1],dl=Math.hypot(dx,dz);if(dl>1e-4&&dl<3){const nx=-dz/dl,nz=dx/dl;
        for(const sd of [-.3,0,.3])for(const hy of [.5,1.2]){const a=new V(p0[0]+nx*sd,GH(p0[0],p0[1])+hy,p0[1]+nz*sd),b=new V(p[0]+nx*sd,GH(p[0],p[1])+hy,p[1]+nz*sd),d=b.clone().sub(a),len=d.length();
          rw.set(a,d.normalize());rw.far=len;if(rw.intersectObjects(WL,true).length){wh.push([+t.toFixed(2),+p[0].toFixed(1),+p[1].toFixed(1),sd]);break}}}}p0=p}}
      return {walls:WL.length,wall:wh.slice(0,6),nw:wh.length,npc:D.npc.map(n=>n.k),gates:D.gates.length,faces:(IC151.SF||[]).filter(x=>x).length,legs:D.legs.length,end:D.end,ch:!!D.ch,own:!!D.chOwn,ched:D.ched,spot:(typeof chq148Spot=='function'&&chq148Spot())?[chq148Spot().cx,chq148Spot().cz]:null,hit:hit.slice(0,8),nh:hit.length}}""")
    print('duskhold',dk)
    chk('Duskhold part built',dk is not None and dk['legs']==7 and dk['ch'],dk)
    if dk:chk('Cheddar met at his quest board (the game\'s own Cheddar, v148 spot)',not dk['own'] and dk['spot'] and abs(dk['ched'][0]-dk['spot'][0])+abs(dk['ched'][1]-dk['spot'][1])<.5,(dk['own'],dk['ched'],dk['spot']))
    if dk:
        chk('meets Steward, Innkeeper, Blacksmith, Merchant in order',dk['npc']==['steward','inn','smith','merchant'],dk['npc'])
        chk('six portals with a Sovereign face each',dk['gates']==6 and dk['faces']==6,(dk['gates'],dk['faces']))
        chk('the walk stays clear of buildings',dk['nh']==0,dk['hit'])
        chk('the walk goes out through the gate opening, never through the town wall',dk['walls']>0 and dk['nw']==0,(dk['walls'],dk['wall']))
        # v151c: the blacksmith stops hammering while he is greeted (his hammer arm holds still), and hammers before that
        sm=ev("""()=>{const D=IC151.S.D,n=D.npc.find(n=>n.k==='smith');if(!n||!n.g._wk)return null;const b=n.g.bones&&n.g.bones.aR0;if(!b)return null;
          const spread=(a,c)=>{const v=[];for(let t=a;t<c;t+=1/24){ic151Seek(t);v.push(b.rotation.x)}return Math.max(...v)-Math.min(...v)};
          const m=n.mt;return {work:spread(m[0]-4.6,m[0]-2.2),greet:spread(m[0]+.2,m[1]-.25)}}""")
        print('smith arm swing (rad)',sm)
        chk('the blacksmith stops hammering when he is greeted',sm is not None and sm['work']>.4 and sm['greet']<.05,sm)
        # v151d: during Cheddar's introduction nothing of the hero (body, weapon, shield) is between the camera and Cheddar
        oc=ev("""()=>{const D=IC151.S.D,C=D.ch,rc=new THREE.Raycaster(),V=THREE.Vector3,hm=[];if(!C)return null;pl.traverse(o=>{if(o.isMesh&&o.visible)hm.push(o)});let hits=[],n=0;
          for(let t=IC151D.ched[0]+.3;t<IC151D.ched[1]-.2;t+=.3){ic151Seek(t);cam.updateMatrixWorld();pl.updateMatrixWorld(true);C.root.updateMatrixWorld(true);const B=new THREE.Box3().setFromObject(C.root);
            for(const f of [.1,.3,.5,.7,.9])for(const g of [.1,.5,.9]){const p=new V(B.min.x+(B.max.x-B.min.x)*g,B.min.y+(B.max.y-B.min.y)*f,B.min.z+(B.max.z-B.min.z)*g),d=p.clone().sub(cam.position),L=d.length();rc.set(cam.position,d.normalize());rc.far=L;n++;
              if(rc.intersectObjects(hm,true).length)hits.push([+t.toFixed(1),f])}}return {n,hits:hits.slice(0,6),nh:hits.length}}""")
        print('cheddar view',oc)
        chk('nothing of the hero blocks the view of Cheddar in his introduction',oc is not None and oc['nh']==0,oc)
        # v151: no floating name tags over the town folk in the cinematic (they come back afterwards: checked at the end)
        TAGS="()=>{let n=0;const w=new THREE.Vector3();scene.traverse(o=>{if(!o.isSprite||!o.material||!o.material.map||!o.material.map.isCanvasTexture)return;let v=true,q=o;while(q){if(q.visible===false)v=false;q=q.parent}o.getWorldPosition(w);if(v&&Math.hypot(w.x-40,w.z-305)<80)n++});return n}"
        ev("()=>ic151Seek(65)");pg.wait_for_timeout(600);ev("()=>ic151Seek(65.05)")
        chk('no name tags over the town folk in the cinematic',ev(TAGS)==0,ev(TAGS))
        # v151: subtitle lines break only between words (each word's letters sit in one box on one line)
        ev("()=>ic151Seek(122.5)")
        wb=ev("""()=>{const W=[...document.querySelectorAll('#ic151 .sub .w')];return {n:W.length,split:W.filter(w=>{const c=[...w.children];return c.length&&c.some(e=>Math.abs(e.offsetTop-c[0].offsetTop)>2)}).map(w=>w.textContent)}}""")
        chk('subtitle words never split over two lines',wb['n']>5 and not wb['split'],wb)
    # v151b: the trees thrash and the plates heave in the quake; still before it starts
    qk=ev("()=>{const S=IC151.S,c=S.cells.find(c=>c!==S.rcell),M=new THREE.Matrix4(),y=t=>{ic151CellM(S,c,t,M);return M.elements[13]};ic151Seek(12);const q0=S.quakeU.uQ.value;ic151Seek(17.5);const q1=S.quakeU.uQ.value;ic151Seek(19.45);const q2=S.quakeU.uQ.value;"
       "let hv=0;for(let t=19.36;t<19.8;t+=.02)hv=Math.max(hv,Math.abs(y(t)));return {q0,q1,q2,hv,still:Math.abs(y(12)),after:Math.abs(y(21.05))}}")
    print('quake',qk);chk('the quake builds and jolts',qk['q0']==0 and qk['q1']>.2 and qk['q2']>qk['q1'],qk);chk('plates heave in the quake, still before and when the ground gives way',qk['hv']>.02 and qk['still']<1e-6 and qk['after']<.006,qk)
    if os.environ.get('VIDEO'):
        fps=float(os.environ.get('FPS','24'));d=O+'/v151_frames';os.makedirs(d,exist_ok=True)
        a=float(os.environ.get('FROM','0'));b=float(os.environ.get('TO',str(ev('()=>IC151.len'))))
        i0=int(round(a*fps));i1=int(round(b*fps))
        if os.environ.get('F0'):i0=int(os.environ['F0'])   # frame numbers (the GitHub render works in 5 s pieces)
        if os.environ.get('F1'):i1=int(os.environ['F1'])
        print('frames',i0,i1,'of',int(round(ev('()=>IC151.len')*fps)),flush=True)
        k0=int(math.ceil(ev('()=>IC151.cut')*fps))
        if i0>k0:   # the town part runs the real game (companions, smoke...): replay it from its first frame without drawing, so a piece matches a full render
            ev("([a,b,f])=>{IC151.noDraw=1;try{for(let k=a;k<b;k++)ic151Seek(k/f)}finally{IC151.noDraw=0}}",[k0,i0,fps])
        if i1>i0:   # warm-up: the first frame drawn on a fresh page can come out black (shaders, the town's first draw)
            ev("t=>ic151Seek(t)",i0/fps);pg.wait_for_timeout(1500);ev("t=>ic151Seek(t)",i0/fps);pg.wait_for_timeout(300)
        for i in range(i0,i1):
            t=i/fps;ev("t=>ic151Seek(t)",t)
            if t>=55.9:pg.wait_for_timeout(60)
            for k in range(3):   # a slow software-drawn town frame: a long time limit, and two more tries
                try:pg.screenshot(path=d+'/f%05d.jpg'%i,type='jpeg',quality=90,timeout=120000);break
                except Exception as e:
                    print('screenshot try',k+1,'frame',i,'failed:',str(e).split('\n')[0][:300],flush=True)
                    if k==2:raise
                    pg.wait_for_timeout(3000)
            if i%48==0:print('frame',i,'t=%.2f'%t,flush=True)
        chk('no frame errors',not ev("()=>IC151.err||null"),ev("()=>IC151.err||''")[:300])
        if not os.environ.get('NOSOUND'):
            r=ev(WAV);open(O+'/v151_sound.wav','wb').write(base64.b64decode(r['b64']));print('sound peak',r['peak'])
        return
    T=[float(x) for x in os.environ.get('TIMES','1,4,7.2,9.8,12.6,14.5,16.4,18.6,19.6,21,22.2,23.6,24.8,26.4,28.6,30.6,33,36,39,42.5,46,49.5,51.6,53,54.6,57').split(',')]
    for t in T:
        ev("t=>ic151Seek(t)",t)
        if t>=55.9:pg.wait_for_timeout(1500);ev("t=>ic151Seek(t)",t)
        if os.environ.get('CLOSE'):   # v157: a close side view of the rat's legs (CLOSE=side angle in rad)
            ev("a=>{const S=IC151.S,R=S.rat;R.root.updateMatrixWorld(true);const p=R.root.getWorldPosition(new THREE.Vector3()),y=R.root.rotation.y+(+a);S.cam.position.set(p.x+Math.sin(y)*.62,p.y+.1,p.z+Math.cos(y)*.62);S.cam.lookAt(p.x,p.y+.05,p.z);S.rd.render(S.sc,S.cam);return 1}",os.environ['CLOSE'])
        pg.screenshot(path=O+'/v151_shot_%05.1f.jpg'%t,type='jpeg',quality=85);print('shot',t,flush=True)
    chk('no frame errors',not ev("()=>IC151.err||null"),ev("()=>IC151.err||''")[:300])
    ev("()=>{window._icD=IC151.S&&IC151.S.D;ic151Seek(IC151.len+.1)}")
    chk('cleaned up',ev("()=>!IC151.run&&!IC151.on&&!document.getElementById('ic151')&&!ren.domElement.style.filter"))
    if dk:
        ho=ev("()=>({p:[pl.position.x,pl.position.z],cls:document.body.classList.contains('ic151d'),ch:(()=>{const D=window._icD,C=D&&D.ch;if(!C)return 'none';if(D.chOwn)return C.root.parent?'left':'ok';return C.root.parent===scene&&Math.abs(C.root.rotation.y-D.chR0)<1e-6&&Math.abs(C.root.position.y-D.chY0)<1e-6?'ok':'moved'})()})")
        chk('game starts on the Portal Road in Duskhold',abs(ho['p'][0]-40)<.3 and abs(ho['p'][1]-349.4)<.3 and not ho['cls'] and ho['ch']=='ok',ho)
        chk('name tags back after the cinematic',ev(TAGS)>=3,ev(TAGS))
play.run(s,w=W,hh=H)
if FAIL:print('FAILED',FAIL)
if os.environ.get('VIDEO') and not FAIL and not os.environ.get('NOENC'):
    fps=os.environ.get('FPS','24');a=os.environ.get('FROM','0')
    cmd=['ffmpeg','-y','-loglevel','error','-framerate',fps,'-start_number',str(int(round(float(a)*float(fps)))),'-i',O+'/v151_frames/f%05d.jpg']
    if os.path.exists(O+'/v151_sound.wav') and not os.environ.get('NOSOUND'):cmd+=['-ss',a,'-i',O+'/v151_sound.wav','-c:a','aac','-b:a','160k','-shortest']
    cmd+=['-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-movflags','+faststart',O+'/v151_intro.mp4']
    print(' '.join(cmd));subprocess.run(cmd,check=True);print('wrote',O+'/v151_intro.mp4')
