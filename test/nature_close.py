# Close-ups of zone nature: trees, props and camps per zone.  AW_TMP=<dir> [ZONES=0,1] python3 nature_close.py
import play,os
Z=[int(v) for v in os.environ.get('ZONES','0,1,2,3,4,5').split(',')]
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    for i in Z:
        for kind in os.environ.get('KINDS','tree,prop,camp').split(','):
            r=ev("""([i,kind])=>{try{const p=PMAP[i],e=p.en;let best=null,bd=1e9;
              if(kind=='camp'){CAMPS.forEach(C=>{if(C.pm!==i)return;const d=Math.hypot(C.x-e[0],C.z-e[1]);if(d<bd){bd=d;best=[C.x+9,C.z+9,C.th.b]}})}
              else for(let y=p.y0;y<p.y0+PMH;y+=2)for(let x=p.x0;x<p.x0+PMW;x+=2){const t=MAP[y][x];const ok=kind=='tree'?t=='#':(PROPK[y*W+x]&&!solid(x+3,y+3));if(!ok)continue;const d=Math.hypot(x-e[0],y-e[1]);if(d<bd&&d>10){bd=d;best=[x+3,y+3,kind=='prop'?PROPK[y*W+x]:BIOMES[MAP.bio[y][x]].tree]}}
              if(!best)return 'none';toPos(best[0],best[1],.8);camDist=kind=='camp'?11:6;camPitch=.32;snapCam();return best}catch(err){return String(err)}}""",[i,kind])
            pg.wait_for_timeout(4500)
            pg.screenshot(path=play.TMP+'/nc_z%d_%s.png'%(i,kind),timeout=120000,animations='disabled')
            print(i,kind,r)
play.run(s,w=900,hh=560)
