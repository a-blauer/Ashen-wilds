# Frame rate + draw calls on the title/creation screen and in town (compare builds with SRC=...).
import play
def s(pg):
    ev=pg.evaluate
    print('fps0',ev("()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3)};requestAnimationFrame(f)})"))
    print('info',ev("()=>{const i=ren.info;return [i.render.calls,i.render.triangles,i.memory.geometries]}"))
play.run(s)
