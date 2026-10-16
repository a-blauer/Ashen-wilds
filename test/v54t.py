import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print(ev("""()=>PMAP.map(p=>{const DW=MAP.DW,ok=(x,y)=>DW[y*W+x]<0&&!solid(x,y);
      // BFS from entrance
      const seen=new Uint8Array(W*H),q=[[Math.round(p.en[0]),Math.round(p.en[1])]];seen[q[0][1]*W+q[0][0]]=1;let n=0;
      while(q.length){const [x,y]=q.pop();n++;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const a=x+dx,b=y+dy,k=b*W+a;if(!seen[k]&&DW[k]<0){seen[k]=1;q.push([a,b])}})}
      const reach=pt=>seen[Math.round(pt[1])*W+Math.round(pt[0])]==1;
      let leak=0;for(let y=p.wa[1]-32;y<=p.wa[1]+32;y++)for(let x=p.wa[0]-32;x<=p.wa[0]+32;x++){const d=Math.hypot(x-p.wa[0],y-p.wa[1]);if(d>17&&d<30&&DW[y*W+x]<0)leak++}
      let walk=0;for(let y=p.y0;y<p.y0+PMH;y++)for(let x=p.x0;x<p.x0+PMW;x++)if(DW[y*W+x]<0)walk++;
      return [p.n,reach(p.ba),p.cl.map(reach).join(''),reach(p.wa),leak,walk,p.path.length,p.br.length,p.fd.length]})"""))
    for i in range(6):
        ev("()=>{toPos(PMAP[%d].en[0],PMAP[%d].en[1]);}"%(i,i));pg.wait_for_timeout(1500)
        ev("()=>{openWMap()}");pg.wait_for_timeout(500)
        pg.screenshot(path=play.TMP+'/lay%d.png'%i,timeout=120000,animations='disabled')
        ev("()=>$('wmap').classList.add('hide')")
play.run(s,w=1000,hh=900)
