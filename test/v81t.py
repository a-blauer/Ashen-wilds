# v81: combat animation smoothness. Measures the biggest single-frame jump of key bones during
# a hero combo, a dodge mid-swing, and an enemy attack; also checks early-press buffering and hit-stop.
# Run on an older build to compare: SRC=out/old.html python3 v81t.py
import play,json,os
O=play.TMP
REC="""window.__rec=(get,n)=>new Promise(res=>{const out=[];let i=0;const f=()=>{out.push(get());if(++i<n)requestAnimationFrame(f);else res(out)};requestAnimationFrame(f)});
window.__jump=(fr)=>{let m=0;for(let i=1;i<fr.length;i++)for(let j=0;j<fr[i].length;j++){let d=Math.abs(fr[i][j]-fr[i-1][j]);d=Math.min(d,Math.abs(d-Math.PI*2));m=Math.max(m,d)}return +m.toFixed(3)};
window.__hb=()=>{const b=pl.bones;return [b.aR0.rotation.x,b.aR0.rotation.z,b.aR1.rotation.x,b.aL0.rotation.x,b.spine.rotation.x,b.spine.rotation.y,b.pelvis.rotation.y,b.lh0.rotation.x,b.rh0.rotation.x]};"""
def game(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:600])
    # fast simulation: no rendering, 16 ms frames
    ev("()=>{ren.render=()=>{};if(typeof POST!='undefined'&&POST.render)POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);"+REC+"}")
    pg.wait_for_timeout(1500)
    P('setup',"()=>{const p=PMAP[0];toPos(p.path[40][0],p.path[40][1]);snapCam();enemies.forEach(e=>{e.agg=0;e.ai=0});return [hero.cls,!!window.HA]}")
    # 1) combo: attack whenever ready, also while walking, for ~2.5 s
    P('combo',"""async()=>{let n=0;const id=setInterval(()=>{if(atkCd<=0){swing();n++}},10);K.w=1;
      const fr=await __rec(()=>__hb().concat([pl.sw?1:0,combo]),220);clearInterval(id);K.w=0;
      // jumps on frames where an animation starts or ends (sw flag or combo step changes) = pops
      let pop=0;for(let i=1;i<fr.length;i++){const a=fr[i],b=fr[i-1];if(a[9]!==b[9]||a[10]!==b[10])pop=Math.max(pop,__jump([b.slice(0,9),a.slice(0,9)]),i+1<fr.length?__jump([a.slice(0,9),fr[i+1].slice(0,9)]):0)}
      return {swings:n,popAtHandoff:+pop.toFixed(3)}}""")
    # 2) stop walking: legs should ease out
    P('stop',"""async()=>{K.w=1;await __rec(__hb,30);let i=0;const fr=await __rec(()=>{if(++i==10)K.w=0;return __hb()},40);K.w=0;return {maxJump:__jump(fr)}}""")
    # 3) dodge in the middle of a swing
    P('dodge',"""async()=>{await __rec(__hb,20);while(atkCd>0)await new Promise(r=>setTimeout(r,10));hero.cdD=0;swing();await __rec(__hb,4);K.w=1;dodge();const fr=await __rec(__hb,40);K.w=0;
      return {maxJump:__jump(fr),cur:window.HA?HA.cur&&HA.cur.ms:null}}""")
    # 4) early press is remembered (new build only)
    P('buffer',"""async()=>{if(!window.HA)return 'n/a';await __rec(__hb,40);while(atkCd>0)await new Promise(r=>setTimeout(r,10));swing();const c0=combo;
      while(atkCd>.25)await new Promise(r=>setTimeout(r,5));HA.press=performance.now();swing();const b=!!HA.buf;await __rec(__hb,30);return {buffered:b,fired:combo!==c0+0||HA.buf==0,combo}}""")
    # 5) hit-stop slows the swing
    P('hitstop',"""async()=>{if(!window.HA)return 'n/a';await __rec(__hb,40);while(atkCd>0)await new Promise(r=>setTimeout(r,10));swing();await __rec(__hb,2);const k0=HA.cur.k;hstop=.2;await __rec(__hb,6);const k1=HA.cur&&HA.cur.k;hstop=0;return {k0:+k0.toFixed(3),k1:+(k1||0).toFixed(3)}}""")
    # 6) enemy attack: bite wind-up -> strike -> recover
    P('enemy',"""async()=>{const e=window.__e=spawnEnemy('goo',pl.position.x+1.6,pl.position.z,3,{});e.ai=0;e.agg=0;await __rec(()=>0,5);hero.iv=99;
      mStart(e,pl,'bite');const fr=await __rec(()=>[e.m.b.rotation.x,e.m.b.position.z,e.m.b.rotation.y],90);hero.iv=0;return {maxJump:__jump(fr),atkDone:!e.atk}}""")
    P('enemyHit',"""async()=>{const e=__e;e.m.flT=performance.now();const fr=await __rec(()=>[e.m.b.rotation.x],25);return {maxJump:__jump(fr),peak:+Math.min(...fr.map(x=>x[0])).toFixed(3)}}""")
    P('flinch',"""async()=>{heroFlinch();const fr=await __rec(__hb,20);return {maxJump:__jump(fr)}}""")
    pg.wait_for_timeout(300)
play.run(game,w=1000,hh=620)
