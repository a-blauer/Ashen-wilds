# v109: far-scenery cull. For several spots in every zone and in Duskhold, renders the same frame with the cull on and
# off and compares the pixels; prints draw calls / triangles saved. PASS/FAIL lines.
import play,json,os
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("""()=>{window.requestAnimationFrame=()=>0;const gl=ren.getContext();
      window.SNAP=()=>{const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);return a};
      window.ONE=(on)=>{FC.on=on;FC.t=-1e9;SHD.t=-1e9;ren.shadowMap.needsUpdate=true;POST.u.time.value=0;POST.u.grain.value=0;
        const r=POST.render;POST.render();const calls=ren.info.render.calls,tris=ren.info.render.triangles;return [SNAP(),calls,tris]}}""")
    fails=[];tot=[0,0,0,0]
    spots=[['town',-1,0]]+[[None,g,f] for g in [0,1,2,3,5,6,7,8,10,11,12,13,15,16,17,18,20,21,22,23,25,26,27,28] for f in [0.2,0.7]]
    for name,g,f in spots:
        r=ev("""([g,f])=>{if(g<0){recallTown();const Q=PORT[0];toPos(Q.x,Q.z+6)}else{const I=INSL[g];insArrive(I);const P=I.path||[I.en];const q=P[Math.floor((P.length-1)*f)]||I.en;toPos(q[0],q[1])}
          rosterTick&&rosterTick();for(let i=0;i<4;i++)loop(performance.now());POST.u.grain.value=0;
          const a=ONE(false),b=ONE(true);let diff=0,mx=0;for(let i=0;i<a[0].length;i+=4){const d=Math.abs(a[0][i]-b[0][i])+Math.abs(a[0][i+1]-b[0][i+1])+Math.abs(a[0][i+2]-b[0][i+2]);if(d>12)diff++;if(d>mx)mx=d}
          FC.on=true;return [g<0?'Duskhold':INSL[g].n,diff,mx,a[1],b[1],a[2],b[2],FC.st.listed,FC.st.ms,a[0].length/4]}""",[g,f])
        bad=r[1]>r[9]*0.0005
        print(('FAIL ' if bad else 'PASS ')+json.dumps(r))
        if bad:fails.append(r[0])
        tot[0]+=r[3];tot[1]+=r[4];tot[2]+=r[5];tot[3]+=r[6]
    print('TOTAL calls %d -> %d (%.0f%%), tris %d -> %d (%.0f%%)'%(tot[0],tot[1],100-100*tot[1]/tot[0],tot[2],tot[3],100-100*tot[3]/tot[2]))
    print('FAILS',fails)
play.run(s)
