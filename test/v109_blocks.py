# v109: props in 64x64 blocks. Loads the game twice (blocks on, then off with AW_NOBLOCKS), renders the same spots in
# every zone with monsters / effects hidden and a fixed clock, and compares draw calls, triangles and pixels.
# Also checks gathering nodes still hide/show a single prop. PASS/FAIL lines; screenshots in out/v109b_*.png.
import play,json,os,base64,sys
SPOTS=[(-1,0)]+[(g,f) for g in [0,1,2,3,5,6,7,8,10,11,12,13,15,16,17,18,20,21,22,23,25,26,27,28] for f in [0.25,0.75]]
RES={}
def mk(tag):
    def s(pg):
        ev=pg.evaluate
        ev("()=>localStorage.clear()")
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        info=ev("()=>[typeof PB!='undefined'?PB.st:null,PB.on]");print(tag,'PB',json.dumps(info))
        ev("""()=>{window.requestAnimationFrame=()=>0;const gl=ren.getContext();
          window.SHOT=()=>{const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);let s='';for(let i=0;i<a.length;i+=4096){s+=String.fromCharCode.apply(null,a.subarray(i,Math.min(a.length,i+4096)))}return btoa(s)}}""")
        out=[]
        for g,f in SPOTS:
            r=ev("""([g,f])=>{if(g<0){recallTown();const Q=PORT[0];toPos(Q.x,Q.z+6)}else{const I=INSL[g];insArrive(I);const P=I.path||[I.en];const q=P[Math.floor((P.length-1)*f)]||I.en;toPos(q[0],q[1])}
              camYaw=.7;camPitch=.5;for(let i=0;i<5;i++)loop(10000+i*16);
              enemies.forEach(e=>{if(e.m)e.m.visible=false;if(e.hb)e.hb.visible=false});try{drops.forEach(d=>d.g.visible=false)}catch(_){}
              scene.children.forEach(o=>{if(o.isPoints||o.isSprite)o.visible=false});
              WIND.t.value=10;POST.u.time.value=0;POST.u.grain.value=0;SHD.t=-1e9;FC.t=-1e9;chunkVis();ren.shadowMap.needsUpdate=true;POST.render();
              return [g<0?'Duskhold':INSL[g].n,ren.info.render.calls,ren.info.render.triangles,SHOT(),ren.getContext().drawingBufferWidth]}""",[g,f])
            out.append(r)
        RES[tag]=out
        if tag=='on':
            r=ev("""()=>{const k=Object.keys(NODE)[5];const e=NODE[k][0];const v=e[0],i=e[1];const m4=new THREE.Matrix4();v.getMatrixAt(i,m4);const before=v.cm[i].instanceMatrix.array[v.cl[i]*16+12];
              v.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));const hid=v.cm[i].instanceMatrix.array[v.cl[i]*16];v.setMatrixAt(i,m4);const back=v.cm[i].instanceMatrix.array[v.cl[i]*16+12];
              return [!!v.cm[i].userData.pb,hid===0,Math.abs(back-before)<1e-6,Math.abs(before-v.M[i*16+12])<1e-6]}""")
            print(('PASS ' if all(r) else 'FAIL ')+'node remap',json.dumps(r))
    return s
os.environ.pop('AW_NOBLOCKS',None)
play.run(mk('on'),w=640,hh=400)
import play as P2
# second run: blocks off
from playwright.sync_api import sync_playwright
orig=play.run
def run_off(steps):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':640,'height':400});pg.add_init_script('window.AW_NOTITLE=1;window.AW_NOBLOCKS=1')
        pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4500);steps(pg);b.close()
run_off(mk('off'))
from PIL import Image
fails=[];C=[0,0];T=[0,0]
for a,b in zip(RES['on'],RES['off']):
    A=base64.b64decode(a[3]);B=base64.b64decode(b[3]);w=a[4];h=len(A)//4//w
    n=0;mx=0
    for i in range(0,len(A),4):
        d=abs(A[i]-B[i])+abs(A[i+1]-B[i+1])+abs(A[i+2]-B[i+2])
        if d>24:n+=1
    frac=n/(len(A)//4);C[0]+=a[1];C[1]+=b[1];T[0]+=a[2];T[1]+=b[2]
    bad=frac>0.01
    print(('FAIL ' if bad else 'PASS ')+json.dumps([a[0],'calls',b[1],'->',a[1],'tris',b[2],'->',a[2],'px%',round(frac*100,3)]))
    if bad or a is RES['on'][3]:
        for tag,X in (('on',A),('off',B)):Image.frombytes('RGBA',(w,h),X).transpose(Image.FLIP_TOP_BOTTOM).save(play.TMP+'/v109b_%s_%s.png'%(a[0].replace(' ','_').replace('·','').replace('’',''),tag))
    if bad:fails.append(a[0])
print('TOTAL calls %d -> %d (%.0f%% fewer), tris %d -> %d (%+.0f%%)'%(C[1],C[0],100-100*C[0]/C[1],T[1],T[0],100*T[0]/T[1]-100))
print('FAILS',fails)
