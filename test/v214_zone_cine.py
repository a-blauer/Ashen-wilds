# v214: the arrival cinematics of Burningeye Summit, Searing Sands, The Dirge and The Citadel (3860).
#   checks per zone (ZONES=2,3,4,5): the first arrival in the zone plays it (KQ_ZC214), the zone card waits, Skip ends it and hands
#   the game back, it is saved as seen (a bit per zone) and never plays again; the plan's pieces are built (set pieces, stand-ins,
#   the den's Sovereign); then frames of every shot -> <AW_TMP>/v214_<z>_<t>.png (FRAMES=0 skips them, TIMES=2.5,12 picks the times)
#   and every piece is put back after (no stand-in left in the scene, the Sovereign where it was).
import play,os,json
ZONES=[int(x) for x in os.environ.get('ZONES','2,3,4,5').split(',') if x]
TIMES=[float(x) for x in os.environ.get('TIMES','2.5,6.8,12.6,18.4,24.2,28.6,31.4,33.6').split(',') if x]
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    for z in ZONES:
        r=pg.evaluate("""async(z)=>{const o={};window.KQ_ZC214=1;ZC214.seen=0;const I=INSL[insG(z,0)];
          insArrive(I);o.run=ZC214.run;o.on=IC151.on;o.card=!!(ZT116.el&&ZT116.el.className.indexOf('on')>=0);o.err=ZC214.err||null;
          await new Promise(r=>setTimeout(r,1500));zc214Skip();
          const t0=performance.now();while(ZC214.run&&performance.now()-t0<90000)await new Promise(r=>setTimeout(r,200));
          o.after={run:ZC214.run,on:IC151.on,dom:!!document.getElementById('zc214'),body:document.body.classList.contains('ic151d'),err:ZC214.err||null};
          await new Promise(r=>setTimeout(r,800));o.cardAfter=!!(ZT116.el&&ZT116.el.className.indexOf('on')>=0);
          o.save=(x2Save()||{}).zc214;o.bit=!!(o.save&(1<<z));insArrive(INSL[insG(z,1)]);o.again=ZC214.run;if(ZC214.run)zc214End();
          return o}""",z)
        print('RUN',z,json.dumps(r))
        if not r['run'] or not r['on']:fails.append('%d: did not start on the first arrival'%z)
        if r['card']:fails.append('%d: zone card showed during the cinematic'%z)
        a=r['after']
        if a['run'] or a['on'] or a['dom'] or a['body']:fails.append('%d: not handed back after skip %s'%(z,json.dumps(a)))
        if a['err'] or r['err']:fails.append('%d: frame error %s'%(z,a['err'] or r['err']))
        if not r['cardAfter']:fails.append('%d: zone card missing after the cinematic'%z)
        if not r['bit']:fails.append('%d: not saved as seen'%z)
        if r['again']:fails.append('%d: played a second time'%z)
        if os.environ.get('FRAMES','1')!='0':
            c=pg.evaluate("""(z)=>{const I=INSL[insG(z,0)];toPos(I.en[0],I.en[1]);ZC214.seen=0;window.__bp=null;const e=enemies.find(e=>e.boss&&e.bi===z&&!e.dead);if(e)__bp=[e.m.position.x,e.m.position.y,e.m.position.z,e.m.visible];
              window.__n0=scene.children.length;const c=zc214Cap(z);window.__lt=0;return c}""",z)
            print('CAP',z,json.dumps(c))
            if not c or len(c['A'])<3 or len(c['cast'])<6 or c['boss']!='den':fails.append('%d: cinematic pieces missing %s'%(z,json.dumps(c)))
            for t in TIMES:
                pg.evaluate("""async(t)=>{let x=window.__lt||0;while(x<t-.05){x=Math.min(t,x+.5);ZC214.noDraw=1;zc214Seek(x)}ZC214.noDraw=0;if(window.__fast)__fast.draw=1;zc214Seek(t);window.__lt=t;return 1}""",t)
                pg.wait_for_timeout(300)
                pg.screenshot(path=play.TMP+'/v214_%d_%04.1f.png'%(z,t),timeout=600000);print('shot',z,t)
            e=pg.evaluate("""(z)=>{const er=ZC214.err||null;const S=ZC214.S,cast=S?S.cast.map(C=>C.m):[];zc214Seek(ZC214.len+.1);
              const left=cast.filter(m=>!!m.parent).length,e=enemies.find(e=>e.boss&&e.bi===z&&!e.dead);
              const moved=__bp&&e?Math.hypot(e.m.position.x-__bp[0],e.m.position.y-__bp[1],e.m.position.z-__bp[2]):0;
              return {er,left,moved,vis:e?e.m.visible===__bp[3]:true,run:ZC214.run,on:IC151.on}}""",z)
            print('END',z,json.dumps(e))
            if e['er']:fails.append('%d: frame error %s'%(z,e['er']))
            if e['left']:fails.append('%d: %d stand-ins left in the scene'%(z,e['left']))
            if e['moved']>.01 or not e['vis']:fails.append('%d: the Sovereign was not put back %s'%(z,json.dumps(e)))
            if e['run'] or e['on']:fails.append('%d: not ended'%z)
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
