import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:600])
    P('fish',"()=>{const w=[pl.position.x+1,pl.position.z];fishStart(w);const sz=()=>{const r=$('fishui').getBoundingClientRect(),d=$('fsDial').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),Math.round(d.left),Math.round(d.top)]};const out=[];fishing.t=0;fishTick(.01);fishPress(true);out.push(sz());for(let i=0;i<6;i++){fishing.cd=0;fishing.na=fishing.za+(i%2?2:0);fishPress(true);if(!fishing)break;out.push(sz())}return out}")
    pg.locator('#stage').screenshot(path=play.TMP+'/v79_fish.png',timeout=120000,animations='disabled')
    P('gold',"()=>{hero.lvl=10;const e=spawnEnemy('goo',pl.position.x+40,pl.position.z,10,{});const g0=gold;lootE(e);const g1=gold;removeE(e);return [g0,g1]}")
    P('lunge',"()=>{const r=[];for(let i=0;i<4;i++){comboT=performance.now();atkCd=0;try{swing()}catch(e){r.push('err '+e.message)}r.push(pl.step?Math.round(pl.step.sp*pl.step.t*100)/100:null)}return r}")
play.run(s,w=1100,hh=700)
