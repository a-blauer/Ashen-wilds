# probe the terrain around Argus (0) and the Crest Hydra (1) dens
import play,json,os
I=[int(x) for x in os.environ.get('DI','0,1').split(',')]
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    for i in I:
        print(json.dumps(ev("""(i)=>{const A=ARN[i],b=BOSSES[i];const out={name:b.name,sp:b.sp,c:[A.cx,A.cz],gh:+GH(A.cx,A.cz).toFixed(2),bio:BIOMES[MAP.bio[A.cz][A.cx]].n};
          const rows=[];for(let r=0;r<=26;r+=2){const hs=[];for(let k=0;k<12;k++){const a=k/12*6.283,x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r;hs.push((GH(x,z)-out.gh).toFixed(1)+(MAP[Math.round(z)][Math.round(x)]||'_'))}rows.push(r+': '+hs.join(' '))}
          out.rows=rows;const e=bossEnt(i);out.bs=e&&e.m.bs;out.ents=A.g.children.length;const p=PMAP[i];out.road=p.path.slice(-6);out.ba=p.ba;return out}""",i),separators=(",",":")))
        ev("(i)=>{window.__hp=window.__hp||setInterval(()=>{hero.hp=heroMax();hero.iv=3},100);enterMap(i)}",i);pg.wait_for_timeout(3000)
        ev("(i)=>{const A=ARN[i];toPos(A.cx,A.cz+19);camYaw=0;camPitch=.75;camDist=30;snapCam()}",i);pg.wait_for_timeout(4000)
        pg.locator('#stage').screenshot(path=play.TMP+f'/den{i}_bare.png',timeout=180000)
play.run(s,w=1000,hh=640)
