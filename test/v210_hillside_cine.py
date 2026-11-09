# v210: Hillside Crest's arrival cinematic.
#   checks: the first arrival in Hillside Crest plays it (KQ_HC208), the zone card waits, Skip ends it and hands the game back,
#   it is saved as seen and never plays again; then frames of every shot -> <AW_TMP>/v210_<t>.png (FRAMES=0 skips them,
#   TIMES=1.5,5 picks the times)
import play,os,json
TIMES=[float(x) for x in os.environ.get('TIMES','1.6,5.2,8.6,11.2,14.0,18.6,22.3,24.7,27.2,29.4,31.2,32.4,33.9,34.7,36.2').split(',') if x]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    r=pg.evaluate("""async()=>{const o={};window.KQ_HC208=1;o.seen0=HC208.seen;
      insArrive(INSL[5]);o.run=HC208.run;o.on=IC151.on;o.card=!!(ZT116.el&&ZT116.el.className.indexOf('on')>=0);o.err=HC208.err||null;
      await new Promise(r=>setTimeout(r,1500));o.t1=HC208.S&&HC208.S.t;hc208Skip();
      const t0=performance.now();while(HC208.run&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,200));
      o.after={run:HC208.run,on:IC151.on,seen:HC208.seen,dom:!!document.getElementById('hc208'),body:document.body.classList.contains('ic151d'),err:HC208.err||null};
      await new Promise(r=>setTimeout(r,800));o.cardAfter=!!(ZT116.el&&ZT116.el.className.indexOf('on')>=0);
      o.save=(x2Save()||{}).hc208;insArrive(INSL[5]);o.again=HC208.run;
      return o}""")
    print('RUN',json.dumps(r))
    if not r['run'] or not r['on']:fails.append('did not start on the first arrival')
    if r['card']:fails.append('zone card showed during the cinematic')
    a=r['after']
    if a['run'] or a['on'] or a['dom'] or a['body']:fails.append('not handed back after skip '+json.dumps(a))
    if a['err'] or r['err']:fails.append('frame error '+str(a['err'] or r['err']))
    if not r['cardAfter']:fails.append('zone card missing after the cinematic')
    if r['save']!=1:fails.append('not saved as seen')
    if r['again']:fails.append('played a second time')
    if os.environ.get('FRAMES','1')!='0':
        c=pg.evaluate("""()=>{toPos(INSL[5].en[0],INSL[5].en[1]);HC208.seen=0;const c=hc208Cap();
          window.__nl=0;scene.traverse(o=>{if(o.isLight)__nl++});c.lights=__nl;return c}""")
        print('CAP',json.dumps(c))
        if not c or not c['city'] or not c['asc'] or c['mons']<2 or not c['hyd']:fails.append('cinematic pieces missing '+json.dumps(c))
        last=0
        for t in TIMES:
            pg.evaluate("""async(t)=>{if(window.__fast)__fast.draw=1;let x=window.__lt||0;while(x<t-.05){x=Math.min(t,x+.1);HC208.noDraw=1;hc208Seek(x)}HC208.noDraw=0;hc208Seek(t);window.__lt=t;return 1}""",t)
            pg.wait_for_timeout(400)
            pg.screenshot(path=play.TMP+'/v210_%04.1f.png'%t,timeout=600000);print('shot',t)
        e=pg.evaluate("()=>HC208.err||null")
        if e:fails.append('frame error '+e)
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
