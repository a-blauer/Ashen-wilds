# v88 town: dump the Duskhold tile map (W wall, B building, P paved...) and collider list for layout planning.
import play,os
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(3000)
    r=ev("""()=>{const T=TOWNS[0];let s='cx '+T.cx+' cy '+T.cy+' TS '+TS+' TK '+TK+' towns '+TOWNS.length+' sp '+T.sp+' PCOURT '+PCOURT+' STB '+JSON.stringify({x:STB.x,z:STB.z})+' mv '+T.mv+' vsp '+JSON.stringify(T.vsp)+'\\n';
      for(let y=T.cy-36;y<=T.cy+36;y++){let l=(y-T.cy+'').padStart(4)+' ';for(let x=T.cx-36;x<=T.cx+60;x++){l+=(MAP[y]&&MAP[y][x])||' '}s+=l+'\\n'}
      s+='COL '+T.col.map(c=>(c.x-T.cx).toFixed(1)+','+(c.z-T.cy).toFixed(1)+(c.r?' r'+c.r:' h'+c.hx+'x'+c.hz)).join(' | ');
      s+='\\nCBLK '+(typeof CBLK);s+='\\nren '+[ren.info.render.calls,ren.info.render.triangles];return s}""")
    open(play.TMP+'/v88_probe.txt','w').write(r);print(r[:300])
play.run(s)
