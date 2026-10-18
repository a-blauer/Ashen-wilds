# v88 town: draw calls, triangles and frame time at fixed Duskhold views (compare builds with SRC=...).
#   SRC=build.html AW_TMP=/outdir [LV=0..3] python3 v88_town_perf.py
import play,os,json
def run2(steps,w=820,hh=520):
    import types;src=open(play.__file__).read().replace('timeout=120000','timeout=600000');m=types.ModuleType('play2');m.__dict__['__file__']=play.__file__;exec(compile(src.split("if __name__=='__main__':")[0],play.__file__,'exec'),m.__dict__);return m.run(steps,w=w,hh=hh)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(2500)
    ev("(l)=>{SHOPS.forEach(o=>SH.shop[o.k]=1);if(l!=null)SHU.forEach(u=>SH.lv[u.k]=l);shApply();visTick&&visTick()}",int(os.environ['LV']) if os.environ.get('LV') else None)
    for name,dx,dz,yaw,dist,pitch in [('plaza',0,6,0,9.5,.3),('north',0,-6,0,9.5,.3),('gate',17,0,-1.57,9.5,.3),('high',0,10,0,24,.7)]:
        ev("([dx,dz,yaw,dist,pitch])=>{const T=TOWNS[0];toPos(T.cx+dx,T.cy+dz,yaw);camDist=dist;camPitch=pitch;snapCam()}",[dx,dz,yaw,dist,pitch])
        pg.wait_for_timeout(2500)
        r=ev("()=>new Promise(res=>{const t=[];let last=performance.now();const f=()=>{const n=performance.now();t.push(n-last);last=n;if(t.length<40)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);const i=ren.info.render;res({calls:i.calls,tris:i.triangles,ms_med:+t[20].toFixed(1),geo:ren.info.memory.geometries,tex:ren.info.memory.textures})}};requestAnimationFrame(f)})")
        print(name,json.dumps(r))
run2(s)
