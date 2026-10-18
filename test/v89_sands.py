# v89 sands — Ssith'ra (den 3) animation check: frame sheets of every state from the side and from above, plus
# per-frame bone rotation deltas (no flapping) and a head-steadiness measure.
#   python3 v89_sands.py                         -> out/v89s_<state>.png sheets + numbers (this build)
#   SRC=<old.html> TAG=before python3 v89_sands.py  -> the same for another build (compare the sheets)
#   ONLY=idle,ram  limits the states; SHEETS=0 skips the pictures (numbers only)
import play,json,os,base64,io
TAG=os.environ.get('TAG','after');SHEETS=os.environ.get('SHEETS','1')!='0';ONLY=[s for s in os.environ.get('ONLY','').split(',') if s]
try:
    from PIL import Image
except Exception:
    Image=None
FW,FH,NF=320,200,10
JS=r"""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
 window.GOD=1;window.HITS=[];window.__bh=bossHit;bossHit=function(e,k){HITS.push([BE&&BE.bs.last,+(VT/1000).toFixed(2)])};
 window.BE=null;window.QDBG=[];window.XA=ARN[3];window.DN=XA.dn;window.EA=DN.ea;
 window.QBN=['pelvis','spine','chest','neck','head','jaw','tail0','tail1','tail2','tail3'];
 window.QST={};window.QS0=null;
 // one 16 ms game frame + sampling of every bone's local rotation
 window.QFR=()=>{VT+=16;if(GOD)hero.hp=heroMax();hero.iv=1;POST.render=()=>{};try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,400))}POST.render=__pr;
   if(!window.BE||!BE._rb)return;const m=BE.m;if(window.QDBG&&window.QSCN=='erupt'){QDBG.push([+(VT/1000).toFixed(3),BE.hid,m.visible,DN.er&&DN.er.s,+BE._rb.head.rotation.x.toFixed(3),+(BE._ssX>VT)])}if(!m.visible||BE.hid||BE.dead){QS0=null;return}const x=[];
   QBN.forEach(k=>{const o=BE._rb[k];x.push(o.rotation.x,o.rotation.y,o.rotation.z)});
   const h=BE._rb.head;h.updateWorldMatrix(true,false);const e=h.matrixWorld.elements,hy=Math.atan2(e[8],e[10]),hp=new THREE.Vector3().setFromMatrixPosition(h.matrixWorld);x.push(hy);const sp=new THREE.Vector3().setFromMatrixPosition(BE._rb.spine.matrixWorld),spo=Math.hypot(sp.x-m.position.x,sp.z-m.position.z);
   const S=QST[window.QSCN]||(QST[window.QSCN]={n:0,max:0,maxB:'',sum:0,hyMax:0,hyVar:0,flip:0,hd:0,lat:0,spo:0});S.spo=Math.max(S.spo,spo);
   if(QS0){S.n++;for(let i=0;i<QBN.length*3;i++){const d=Math.abs(x[i]-QS0.x[i]);S.sum+=d;if(d>S.max){S.max=d;S.maxB=QBN[i/3|0]+'.'+'xyz'[i%3]+'@'+S.n+(BE.m._ss?'/'+[BE.m._ss.den,!!(DN.er),DN.er&&DN.er.s,BE.m._ssMv&&BE.m._ssMv.k].join(','):'')}}
     let dh=x[x.length-1]-QS0.x[x.length-1];dh=Math.atan2(Math.sin(dh),Math.cos(dh));S.hyMax=Math.max(S.hyMax,Math.abs(dh));
     // flapping: sign changes of the tail-tip yaw velocity
     const tv=(x[QBN.length*3-2]-QS0.x[QBN.length*3-2]);if(QS0.tv!=null&&Math.sign(tv)!=Math.sign(QS0.tv)&&Math.abs(tv)>.002)S.flip++;
     // head lateral jitter: distance of the head from a straight line through its last positions
     if(QS0.hp0){const a=QS0.hp0,b=QS0.hp,c=hp,mx=(a.x+c.x)/2,mz=(a.z+c.z)/2;S.lat=Math.max(S.lat,Math.hypot(b.x-mx,b.z-mz))}
     x.tv=tv}
   QS0={x,tv:x.tv,hp,hp0:QS0&&QS0.hp}};
 window.QRUN=(sec)=>{const n=Math.max(1,Math.round(sec/.016));for(let i=0;i<n;i++)QFR()};
 // render the boss from the side and from above straight from the WebGL canvas
 window.QSNAP=(mode)=>{const m=BE.m,p=m.position,ry=m.rotation.y,L=(m.bs||3.8)*1.5,y=GH(p.x,p.z);const c=new THREE.Vector3(p.x-Math.sin(ry)*L*.25,y,p.z-Math.cos(ry)*L*.25);
   if(mode=='side')cam.position.set(c.x+Math.cos(ry)*L*1.55,y+L*.32,c.z-Math.sin(ry)*L*1.55);else cam.position.set(c.x+Math.cos(ry)*.01,y+L*2.0,c.z-Math.sin(ry)*.01);
   cam.up.set(0,1,0);if(mode=='top')cam.up.set(Math.sin(ry),0,Math.cos(ry));cam.lookAt(c.x,y+(mode=='side'?L*.12:0),c.z);cam.updateMatrixWorld(true);
   const hid=XA.g.children.filter((o,i)=>i>0&&o.visible&&o!==DN.sw);hid.forEach(o=>o.visible=false);const vis=m.visible;if(!m.visible&&!BE.dead)m.visible=true;const hb=BE.hb&&BE.hb.visible;if(BE.hb)BE.hb.visible=false;scene.updateMatrixWorld(true);m.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton)o.skeleton.update()});if(ren.info&&ren.info.reset)ren.info.reset();ren.setRenderTarget(null);ren.render(scene,cam);const u=ren.domElement.toDataURL('image/jpeg',.82);m.visible=vis;hid.forEach(o=>o.visible=true);cam.up.set(0,1,0);return u};
 return 1}"""
STATES=['idle','move','turn','tailsweep','spit','mines','vortex','sandstorm','erupt','ram','stuck','death']
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{enterMap(3)}");pg.wait_for_timeout(3500)
    ev(JS)
    ev("""()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const x=XA.cx+Math.cos(EA)*11,z=XA.cz+Math.sin(EA)*11;toPos(x,z);QRUN(1.2);
      window.BE=bossEnt(3);BE._rb={};BE.m.traverse(o=>{if(o.isBone&&QBN.includes(o.name))BE._rb[o.name]=o});return Object.keys(BE._rb)}""")
    print('bones',ev("()=>Object.keys(BE._rb).join(',')"),'fight',ev("()=>!!AF"))
    # each state: setup (JS), then NF frames spaced by dt seconds
    SET={
     'idle':("()=>{QSCN='idle';BE.bs.t=99;BE.bs.lock=99;toPos(BE.m.position.x+6,BE.m.position.z+3);QRUN(2.5)}",.25),
     'move':("()=>{QSCN='move';BE.bs.t=99;BE.bs.lock=0;window.QMA=0;const o=V(XA.cx,0,XA.cz);toPos(o.x+10,o.z);BE.m.position.set(o.x-6,0,o.z);QRUN(.3)}",.3),
     'turn':("()=>{QSCN='turn';BE.bs.t=99;BE.bs.lock=0;const p=BE.m.position,ry=BE.m.rotation.y;toPos(p.x-Math.sin(ry)*2.6,p.z-Math.cos(ry)*2.6);QRUN(.05)}",.2),
     'tailsweep':("()=>{QSCN='tailsweep';QFORCE('tailsweep');QRUN(.05)}",.16),
     'spit':("()=>{QSCN='spit';QFORCE('spit');QRUN(.05)}",.16),
     'mines':("()=>{QSCN='mines';QFORCE('mines');QRUN(.05)}",.16),
     'vortex':("()=>{QSCN='vortex';DN.vxCD=0;QFORCE('vortex');QRUN(.05)}",.18),
     'sandstorm':("()=>{QSCN='sandstorm';DN.stCD=0;QFORCE('sandstorm');QRUN(.05)}",.18),
     'erupt':("()=>{QSCN='erupt';QFORCE('erupt');QRUN(.05);let t=0;while(DN.er&&DN.er.s!='tele'&&t<5){QRUN(.1);t+=.1}QRUN(.4)}",.15),
     'ram':("()=>{QSCN='ram';const C=DN.cols[1];const a=Math.atan2(C.z-XA.cz,C.x-XA.cx);BE.m.position.set(XA.cx-Math.cos(a)*3,0,XA.cz-Math.sin(a)*3);toPos(XA.cx+Math.cos(a+.9)*9,XA.cz+Math.sin(a+.9)*9);QRUN(.4);QFORCE('ram');QRUN(.05)}",.15),
     'stuck':("()=>{QSCN='stuck';DN.ram=null;DN.cols.forEach(C=>{if(!C.ok){C.ok=true;C.col.visible=true;C.rub.visible=false}});const C=DN.cols[0];const a=Math.atan2(C.z-XA.cz,C.x-XA.cx);BE.m.position.set(XA.cx-Math.cos(a)*3,0,XA.cz-Math.sin(a)*3);toPos(C.x+Math.cos(a)*2.6,C.z+Math.sin(a)*2.6);QRUN(.3);QFORCE('ram');let t=0;while(DN.ram&&t<4){QRUN(.05);t+=.05}QRUN(.1)}",.3),
     'death':("()=>{QSCN='death';for(let i=0;i<200&&(BE.hid||DN.er||DN.ram);i++)QRUN(.05);BE.bs.t=99;QRUN(.3);hurt(BE,1e9,1);QRUN(.016)}",.17),
    }
    ev("""()=>{window.QFORCE=k=>{const S=BSTY[3],b=BE.bs;if(!S._p1)S._p1=S.pool;S.pool=[[k],[k],[k]];b.last='';b.lock=0;b.t=0;b.dash=null;QRUN(.02);S.pool=S._p1;S._p1=null;b.t=Math.max(b.t,4)}}""")
    sheets={}
    for st in STATES:
        if ONLY and st not in ONLY:continue
        js,dt=SET[st]
        ev("()=>{BE._ssX=0;DN.vx=null;DN.st=null;if(DN.er){DN.er=null;bxHide(BE,false);DN.mound.visible=false}BE.bs.ph=1;DN.ph=1;BE.c.h=M(BE.c)*.95;"
           "const p=BE.m.position,dx=p.x-XA.cx,dz=p.z-XA.cz;if(Math.hypot(dx,dz)>9)p.set(XA.cx,0,XA.cz);QRUN(.2);QS0=null}")
        ev(js)
        fr=[]
        for i in range(NF):
            if SHEETS:fr.append((ev("()=>QSNAP('side')"),ev("()=>QSNAP('top')")))
            # moving: the player circles the den so the boss chases and turns
            ev("([dt,st])=>{const n=Math.max(1,Math.round(dt/.016));for(let j=0;j<n;j++){if(st=='move'){QMA+=.016*.55;toPos(XA.cx+Math.cos(QMA)*10,XA.cz+Math.sin(QMA)*10)}QFR()}}",[dt,st])
        info=ev("()=>[BE.bs.last,!!BE.hid,!!BE.dead,DN.ram&&DN.ram.s,DN.er&&DN.er.s,+(BE._ssX>performance.now())]")
        print('state',st,'info',info,'stats',json.dumps(ev("(k)=>{const S=QST[k];if(!S)return null;return {frames:S.n,maxDelta:+S.max.toFixed(3),at:S.maxB,meanDelta:+(S.sum/Math.max(1,S.n)/30).toFixed(4),headYawStep:+S.hyMax.toFixed(3),tailFlipsPerSec:+(S.flip/Math.max(1,S.n*.016)).toFixed(2),headLateral:+S.lat.toFixed(3),spineOff:+S.spo.toFixed(2)}}",st)))
        if SHEETS and Image and fr:
            sh=Image.new('RGB',(FW*5,FH*4),(0,0,0))
            for i,(a,b) in enumerate(fr):
                for j,u in enumerate((a,b)):
                    im=Image.open(io.BytesIO(base64.b64decode(u.split(',',1)[1]))).convert('RGB').resize((FW,FH))
                    sh.paste(im,((i%5)*FW,(j*2+i//5)*FH))
            p=play.TMP+'/v89s_'+TAG+'_'+st+'.jpg';sh.save(p,quality=85);sheets[st]=p
    print('DBG',ev('()=>JSON.stringify(window.QDBG||[])')[:3000]) if os.environ.get('DBG') else 0
    print('HITS',ev("()=>HITS.slice(0,40)"))
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
    print('SHEETS',sheets)
# play.run with a longer page-load timeout (the page is big and the test machine is often busy)
def run(steps,w=800,hh=500):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':w,'height':hh});logs=[]
        pg.on('console',lambda m:logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e:logs.append('PAGEERROR: '+str(e)))
        pg.add_init_script('window.AW_NOTITLE=1');pg.set_default_timeout(600000)
        pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4500)
        steps(pg)
        print("\n".join([l for l in logs if 'PAGEERROR' in l or 'sands' in l][:20]))
        b.close()
run(s)
