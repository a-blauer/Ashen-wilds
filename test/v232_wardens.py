# v232 the four Wardens and Ythrael (4010 kit, 4020-4062): each one's arena is entered, the fight starts, every move of the record is
#   cast once (no kit errors, no console errors, the hero's arena clamp holds), Phase II comes at its threshold and changes the
#   arena, the fight resets on leaving, and the kill hands out the reward hook. Ythrael also: the motes (six taken rupture him),
#   the drink heals him, Phase III shrinks the stone.
import play,os,json
ONLY=[k for k in os.environ.get('ONLY','').split(',') if k]   # ONLY=oak,roc … : just these (full.txt runs them as separate jobs)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    fails=[]
    pg.evaluate("()=>{window.__e=[];const f=console.error;console.error=function(){try{__e.push([...arguments].map(a=>a&&a.stack?a.stack.slice(0,240):String(a)).join(' ').slice(0,360))}catch(_){}return f.apply(this,arguments)};window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);hero.lvl=50;window.__w=ms=>new Promise(r=>setTimeout(r,ms));window.__until=async(fn,ms)=>{const t0=performance.now();while(performance.now()-t0<ms){if(fn())return true;await __w(100)}return false}}")
    for key,i in (('oak',0),('roc',1),('kiln',2),('dawn',3),('voice',-1)):
        if ONLY and key not in ONLY:continue
        r=pg.evaluate("""async([key,i])=>{const o={key},D=WK232.D[key];if(!D)return {key,missing:1};FN232.path=i<0?1:2;FN232.n=Math.max(0,i);FN232.won=0;__e.length=0;const e0=WK232.err;
          wk232Enter(D);o.in=await __until(()=>wk232In(D)&&!!D.e&&!!D.LS,60000);if(!o.in)return o;const e=D.e,S=e.sv,L=D.L;o.lv=e.c.l;o.tris=wk232Tris(S.R);
          wk232Start(D,e);await __w(600);o.fight=D.A.f;o.ph0=S.ph;
          // every move once (the phase changes last)
          const ids=Object.keys(D.B.M).filter(k=>!/^(intro|awaken|awaken2)$/.test(k));o.moves=ids.length;o.bad=[];
          for(const id of ids){svEndMove(e,true);S.cd={};S.rest=99;S.stg=0;pl.position.set(L.cx+1,0,L.cz+5);e.m.position.set(L.cx,0,L.cz-2);const ph=S.ph;S.ph=Math.max(S.ph,(D.B.M[id].ph||1));const ok=svStart(e,id,7);S.ph=ph;if(ok===false){o.bad.push(id+':no');continue}
            const dur=D.B.M[id].dur||2;await __until(()=>!S.mv||S.mv.id!==id,Math.min(9000,dur*1000+500));if(WK232.err>e0){o.bad.push(id+':err');break}}
          svEndMove(e,true);S.stg=0;S.rest=.05;S.cd={};e.c.h=M(e.c)*(D.B.ph2-.03);o.ph2=await __until(()=>S.ph>=2,30000);
          if(key==='voice'){o.brink=D.S.brink;await __until(()=>!S.mv,15000);
            // six motes taken rupture him
            svEndMove(e,true);S.rest=99;S.cd={};D.S.stolen=0;const h0=e.c.h;for(let k=0;k<6;k++)yt232Mote(D,new THREE.Vector3(L.cx+Math.cos(k)*5,0,L.cz+Math.sin(k)*5),k);o.motes=D.S.motes.length;
            for(let k=0;k<8&&D.S.motes.length;k++){const m=D.S.motes[0];pl.position.set(m.x,0,m.z);await __w(350)}o.rupt=await __until(()=>S.mv&&S.mv.id==='broken',5000);o.wound=e.c.h<h0;
            svEndMove(e,true);S.stg=0;S.rest=.05;S.cd={};e.c.h=M(e.c)*.3;o.ph3=await __until(()=>S.ph>=3,30000);o.rim=D.S.rim;o.r=D.A.r;
            const far=new THREE.Vector3(L.cx+16,0,L.cz);pl.position.copy(far);await __w(500);o.heroIn=Math.hypot(pl.position.x-L.cx,pl.position.z-L.cz)<=D.A.hr+.3}
          // a wipe resets
          await __until(()=>!S.mv,15000);pl.position.set(L.ent.x,0,L.ent.z);wk232Reset(D,true);await __w(200);o.reset=!D.A.f&&S.ph===1&&e.c.h>=M(e.c)*.99;if(key==='voice')o.rimBack=!D.S.rim&&D.A.r===L.r;
          // the kill
          wk232Start(D,e);await __w(300);svEndMove(e,true);S.inv=0;S.dr=0;e.c.h=1;hurt(e,50);o.dead=await __until(()=>e.dead&&!D.A.f,10000);await __until(()=>i<0?FN232.won:FN232.n===i+1,8000);o.n=FN232.n;o.won=FN232.won;await __w(400);o.again=enemies.some(q=>q.wk&&!q.dead);
          o.err=WK232.err-e0;o.e=__e.slice(0,4);return o}""",[key,i])
        print('WARDEN',json.dumps(r))
        if r.get('missing') or not r.get('in'):fails.append('%s: could not enter its arena'%key);continue
        if not r['fight']:fails.append('%s: the fight did not start'%key)
        if r['bad']:fails.append('%s: moves failed %s'%(key,r['bad']))
        if r['moves']<7:fails.append('%s: only %d moves'%(key,r['moves']))
        if not r['ph2']:fails.append('%s: no Phase II at its threshold'%key)
        if not r['reset']:fails.append('%s: the fight did not reset'%key)
        if not r['dead']:fails.append('%s: the kill did not end the fight'%key)
        if r['again']:fails.append('%s: he stood up again after the kill'%key)
        if r['err'] or r['e']:fails.append('%s: errors %s %s'%(key,r['err'],r['e']))
        if i>=0 and r['n']!=i+1:fails.append('%s: the road did not move on (n=%s)'%(key,r['n']))
        if key=='voice':
            if not(r['brink'] and r['motes']>=5 and r['rupt'] and r['wound']):fails.append('voice: motes / rupture %s'%json.dumps(r))
            if not(r['ph3'] and r['rim'] and abs(r['r']-13.2)<.01 and r['heroIn'] and r['rimBack']):fails.append('voice: Phase III / the rim %s'%json.dumps(r))
            if not r['won']:fails.append('voice: the kill was not recorded')
            # the ending starts by itself: end it
            e=pg.evaluate("async()=>{const ok=await __until(()=>EC232.run,15000);if(ok){ec232Skip();await __until(()=>!EC232.run,60000)}return {ok,run:EC232.run,on:IC151.on,ins:!!curIns(),npc:!!FN229.npc,err:EC232.err}}")
            print('ENDING',json.dumps(e))
            if not e['ok'] or e['run'] or e['on'] or e['err']:fails.append('voice: the ending did not play and end cleanly %s'%json.dumps(e))
            if e['ins']:fails.append('voice: the hero is not back in Duskhold after the ending')
        else:
            b=pg.evaluate("async([key])=>{const D=WK232.D[key];wk232Leave(D);const ok=await __until(()=>!curIns(),30000);return ok}",[key])
            if not b:fails.append('%s: the rift did not lead back to Duskhold'%key)
    for f in fails:print('FAIL',f)
    print('DONE',len(fails),'fails')
play.run(s,w=1280,hh=720)
