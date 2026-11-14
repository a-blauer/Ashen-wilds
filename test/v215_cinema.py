# v215: the Cinematics viewer (3870). Settings → Cheats has the button (v230; locked with the cheats); the window lists six and The Fountain; Watch plays each zone's cinematic again
# from Duskhold (ZONES=0,1,2,3,4,5), Skip hands the game back, the seen marks are as before, no zone card follows, the hero has
# not moved; refused during a Sovereign fight. Frames of the opening shot from Duskhold -> <AW_TMP>/v215_<z>.png (FRAMES=0 skips).
import play,os,json
ZONES=[int(x) for x in os.environ.get('ZONES','0,1,2,3,4,5').split(',') if x]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    r=pg.evaluate("""()=>{openSet();const b=document.getElementById('cv215B');const o={inbox:!!b&&!!b.closest('#cheatBox'),hid:!!b&&!b.offsetParent};
      if(b)b.click();o.lockedOpen=!document.getElementById('cv215').classList.contains('hide');
      CHU.unlock('112233');document.getElementById('cheatBtn').click();o.btn=!!b&&!!b.offsetParent;if(b)b.click();
      o.list=[...document.querySelectorAll('#cv215 .it b')].map(e=>e.textContent);o.open=!document.getElementById('cv215').classList.contains('hide');
      document.getElementById('cv215Close').click();document.getElementById('setClose').click();return o}""")
    print('UI',json.dumps(r))
    if not r['inbox'] or not r['btn']:fails.append('no Cinematics button in the cheat menu')
    if not r['hid'] or r['lockedOpen']:fails.append('the Cinematics button works while the cheats are locked')
    if len(r['list'])!=7 or r['list'][-1]!='The Fountain' or not r['open']:fails.append('the list is not the six zone cinematics and The Fountain '+json.dumps(r))
    for z in ZONES:
        o=pg.evaluate("""async(z)=>{const p0=pl.position.clone(),s0={kc:KC208.seen,hc:HC208.seen,zc:ZC214.seen};const o={};
          o.ok=cv215Play(z);o.run=KC208.run||HC208.run||ZC214.run;await new Promise(r=>setTimeout(r,1200));
          if(window.__fast)__fast.draw=1;await new Promise(r=>setTimeout(r,1500));o.err0=KC208.err||HC208.err||ZC214.err||null;
          if(z===0)kc208Skip();else if(z===1)hc208Skip();else zc214Skip();
          const t0=performance.now();while((KC208.run||HC208.run||ZC214.run)&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,200));
          await new Promise(r=>setTimeout(r,900));if(window.__fast)__fast.draw=0;
          o.after={run:KC208.run||HC208.run||ZC214.run,on:IC151.on||KC208.on,rp:CV215.rp,card:!!(ZT116.el&&ZT116.el.className.indexOf('on')>=0),
            seen:KC208.seen===s0.kc&&HC208.seen===s0.hc&&ZC214.seen===s0.zc,moved:Math.hypot(pl.position.x-p0.x,pl.position.z-p0.z),err:KC208.err||HC208.err||ZC214.err||null};
          return o}""",z)
        print('PLAY',z,json.dumps(o))
        if not o['ok'] or not o['run']:fails.append('%d: did not play'%z)
        a=o['after']
        if a['run'] or a['on'] or a['rp'] is not None:fails.append('%d: not handed back %s'%(z,json.dumps(a)))
        if not a['seen']:fails.append('%d: the seen marks changed'%z)
        if a['card']:fails.append('%d: a zone card showed after a replay'%z)
        if a['moved']>.5:fails.append('%d: the hero moved %.1f'%(z,a['moved']))
        if a['err'] or o['err0']:fails.append('%d: frame error %s'%(z,a['err'] or o['err0']))
    # v230: The Fountain plays from the list on a hero who has not poured the last essence; nothing is kept afterwards
    f=pg.evaluate("""async()=>{const o={seen0:FN229.seen,ok:cv215Play('fn229'),run:!!FN229.run};await new Promise(r=>setTimeout(r,1500));o.err=FN229.err||null;
      try{fn229Skip()}catch(e){o.skipErr=String(e)}const t0=performance.now();while(FN229.run&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,200));
      await new Promise(r=>setTimeout(r,600));o.after={run:!!FN229.run,on:!!IC151.on,seen:FN229.seen,npc:!!FN229.npc,done:bossDone.has(fn229Last()),err:FN229.err||null};return o}""")
    print('FOUNTAIN',json.dumps(f))
    if not f['ok'] or not f['run']:fails.append('fountain: did not play from the list')
    a=f['after']
    if a['run'] or a['on']:fails.append('fountain: not handed back')
    if a['seen']!=f['seen0'] or a['npc'] or a['done']:fails.append('fountain: the preview changed progress '+json.dumps(a))
    if f['err'] or a['err'] or f.get('skipErr'):fails.append('fountain: error %s'%(f['err'] or a['err'] or f.get('skipErr')))
    if os.environ.get('FRAMES','1')!='0':
        for z in ZONES:
            q=pg.evaluate("""async(z)=>{cv215Play(z);const L=z===0?KC208.live:z===1?HC208.S.live:ZC214.S.live;cancelAnimationFrame(L.raf);L.raf=0;
              const seek=z===0?kc208Seek:z===1?hc208Seek:zc214Seek;for(let x=0;x<=2.6;x+=.5){if(z>=2)ZC214.noDraw=1;if(z===1)HC208.noDraw=1;if(z===0)KC208.noDraw=1;seek(x)}
              ZC214.noDraw=HC208.noDraw=KC208.noDraw=0;if(window.__fast)__fast.draw=1;seek(2.6);window.__hold=setInterval(()=>{try{seek(2.6)}catch(_){}},150);await new Promise(r=>setTimeout(r,600));return {run:KC208.run||HC208.run||ZC214.run,err:KC208.err||HC208.err||ZC214.err||null}}""",z)
            print('FRAME',z,q);pg.screenshot(path=play.TMP+'/v215_%d.png'%z,timeout=600000)
            pg.evaluate("""async(z)=>{clearInterval(window.__hold);if(z===0)kc208End();else if(z===1)hc208End();else zc214End();if(window.__fast)__fast.draw=0;return 1}""",z)
    r=pg.evaluate("""()=>{AF={f:true};const ok=cv215Play(2);AF=null;return {ok,run:ZC214.run}}""")
    if r['ok'] or r['run']:fails.append('played during a fight')
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
