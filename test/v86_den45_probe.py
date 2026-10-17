# v86 dens 4/5 probe: terrain + tiles around the den, screenshots of the stripped den
# SRC=<html> AW_TMP=<out dir> python3 v86_den45_probe.py
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,*a:print(n,"=>",json.dumps(ev(c,*a))[:3000])
    for i in [4,5]:
        P('info%d'%i,"""(i)=>{const A=ARN[i],y0=GH(A.cx,A.cz),rows=[];for(let dz=-22;dz<=22;dz+=2){let s='';for(let dx=-22;dx<=22;dx+=1){const t=(MAP[Math.round(A.cz+dz)]||[])[Math.round(A.cx+dx)];s+=t===''?' ':t}rows.push(s)}
          const hs=[];for(let a=0;a<16;a++){const r=[];for(const rr of [0,8,12,14,16,18,20]){const x=A.cx+Math.cos(a/16*6.283)*rr,z=A.cz+Math.sin(a/16*6.283)*rr;r.push(+(GH(x,z)-y0).toFixed(1))}hs.push(r)}
          const p=PMAP[i];return {cx:A.cx,cz:A.cz,y0,rows,hs,bio:BIOMES[MAP.bio[Math.round(A.cz)][Math.round(A.cx)]].n,path:p.path.slice(-6),n:p.n}}""",i)
    ev("""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};return 1}""")
    for i in [4,5]:
        ev("(i)=>{enterMap(i);return 1}",i);pg.wait_for_timeout(1200);ev("()=>{STEP(1.5);return 1}")
        ev("(i)=>{const A=ARN[i];toPos(A.cx,A.cz+19,0);camPitch=.9;camDist=26;snapCam();STEP(1.5,1);return 1}",i)
        pg.screenshot(path=play.TMP+'/probe%d_over.png'%i,timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
