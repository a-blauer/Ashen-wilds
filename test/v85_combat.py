# v85 combat readability: enemy projectiles/cast effects, ranges, dimmer telegraphs, companion spell ranges, Rime Wraith orbs
# SRC=<html> AW_TMP=<out dir> python3 v85_combat.py
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1500])
    ev("()=>{enterMap(0)}");pg.wait_for_timeout(3500)
    # virtual clock: stop the real loop and step it by hand so screenshots land mid-attack
    ev("""()=>{window.VT=performance.now();const pn=performance.now.bind(performance);performance.now=()=>VT;window.requestAnimationFrame=()=>0;
      window.__pr=POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();if(window.GOD)hero.iv=1;if(i==n-1&&draw)POST.render=__pr;loop(VT)}POST.render=__pr;return VT};
      window.CLR=()=>{enemies.slice().forEach(e=>{if(!e.boss)removeE(e)})};return 1}""")
    pg.wait_for_timeout(1500)
    ev("()=>{CLR();const p=pl.position;toPos(p.x,p.z,0);camPitch=.42;camDist=9;snapCam();STEP(.3);return 1}")
    shots=[('shaman','bolt'),('bonearcher','throw'),('slinger','throw'),('lurker','spit'),('cultist','rainfire'),('trollsh','bolt'),('giant','rainfire'),('wraith','bolt')]
    for key,mv in shots:
        r=ev("""([key,mv])=>{CLR();const p=pl.position,e=spawnEnemy(key,p.x+.6,p.z-6.5,5,{agg:1});e.cd=99;e._kp=1;hero.iv=0;
          if(e.m.position.distanceTo(p)>9)e.m.position.set(p.x+.6,0,p.z-6.5);
          toPos(p.x,p.z,0);snapCam();mStart(e,pl,mv);window.__e=e;STEP(e.atk.T*.75,1);return [key,mv,e.atk&&e.atk.ph,+e.m.position.distanceTo(p).toFixed(1),KQ.fx.length,e.atk&&e.atk.tel?+e.atk.tel.o.material.opacity.toFixed(3):null]}""",[key,mv])
        print('windup',r);pg.screenshot(path=play.TMP+f'/v85c_{key}_{mv}_1wind.png',timeout=120000,animations='disabled')
        r=ev("""()=>{const e=__e;let t=0;const h0=hero.hp;while(t<3&&e.atk&&e.atk.ph==0){STEP(.05);t+=.05}STEP(mv=='rainfire'?.0:.25,1);
          return [eshots.length,eshots.map(s=>[s.kind,+(s.m.position.y-GH(s.m.position.x,s.m.position.z)).toFixed(2)]),KQ.fx.length]}""".replace('mv==',"'"+mv+"'=="))
        print('flight',r);pg.screenshot(path=play.TMP+f'/v85c_{key}_{mv}_2fly.png',timeout=120000,animations='disabled')
        r=ev("""()=>{const e=__e;const hp=hero.hp,mx=heroMax();window.__hit=0;const f=hitHero;hitHero=function(){__hit++;return f.apply(this,arguments)};let t=0;while(t<2&&(eshots.length||(e.atk&&e.atk.ph<2))){STEP(.05);t+=.05}STEP(.05,1);hitHero=f;return ['hits',__hit,'shots left',eshots.length,'fx',KQ.fx.length]}""")
        print('impact',r);pg.screenshot(path=play.TMP+f'/v85c_{key}_{mv}_3hit.png',timeout=120000,animations='disabled')
    # attack choice by distance (ePick over the moves the loop would allow)
    P('picks',"""()=>{const out={};['shaman','bonearcher','slinger','lurker','wraith','shambler','selem','spitter','magmadrake','giant','orc','Gloomcap','Wispling','Mossfrog'].forEach(k=>{const ms=MSET[k]||['bite'];const e={c:{g:[k],al:0},m:null,bu:0,buN:3};
      out[k]={pref:+kqPref({c:{g:[k]}}).toFixed(1)};[.8,1.5,2.2,3.5,6,9].forEach(L=>{const ok=ms.filter(n=>L>=MV[n].rmin&&L<=MV[n].rmax);if(!ok.length&&L<1.7)ok.push('bite');const seen=new Set();for(let i=0;i<30;i++){e.bu=i%2?0:9;e.buN=3;const pk=ok.length?ePick(e,ok):null;seen.add(pk)}out[k][L]=[...seen].join('/')})});return out}""")
    # live AI: a wraith and a slinger fight a hero standing still; log the distance each move was started from
    P('liveAI',"""()=>{CLR();const p=pl.position,log=[];const f=mStart;mStart=function(e,tg,n){log.push([e.c.g[0],n,+d2(e.m.position,tg.position).toFixed(1)]);return f.apply(this,arguments)};
      const a=spawnEnemy('wraith',p.x+3,p.z-7,5,{agg:1}),b=spawnEnemy('slinger',p.x-3,p.z-7,5,{agg:1}),c=spawnEnemy('lurker',p.x,p.z-8,5,{agg:1});[a,b,c].forEach(e=>{e.agg=1;e.cd=0});
      for(let i=0;i<40;i++){STEP(.5);hero.hp=heroMax()}mStart=f;return log}""")
    P('liveAI_close',"""()=>{CLR();const p=pl.position,log=[];const f=mStart;mStart=function(e,tg,n){log.push([e.c.g[0],n,+d2(e.m.position,tg.position).toFixed(1)]);return f.apply(this,arguments)};
      const a=spawnEnemy('wraith',p.x+1,p.z-1,5,{agg:1}),b=spawnEnemy('shaman',p.x-1,p.z-1,5,{agg:1});[a,b].forEach(e=>{e.agg=1;e.cd=0});
      for(let i=0;i<24;i++){STEP(.5);hero.hp=heroMax();if(i%4==0){a.m.position.set(p.x+1,0,p.z-1);b.m.position.set(p.x-1,0,p.z-1)}}mStart=f;return log}""")
    # projectile aimed at a companion now hits the companion
    P('compHitBy',"""()=>{CLR();for(let i=0;i<1;i++)hatch(Object.assign(rollEgg(1),{basic:true}));STEP(.2);const f=fols[0],c=party[0],p=pl.position;f.position.set(p.x+5,0,p.z);c.h=M(c);const h0=c.h;
      const e=spawnEnemy('slinger',p.x+5,p.z-7,5,{agg:1});e.cd=99;e._kp=1;mStart(e,f,'throw');let t=0;while(t<4&&(e.atk||eshots.length)){STEP(.05);f.position.set(p.x+5,0,p.z);t+=.05}return [Math.round(h0),Math.round(c.h)]}""")
    # companion spells: melee spells wait for reach, ranged spells fire at range
    P('compSpells',"""()=>{CLR();const c=party[0],f=fols[0],p=pl.position;const res={};const cast=compCast;let last=null;compCast=function(c,f,sp,t){last=sp.k};
      ['Hamstring Bite','Howling Rend','Quake Stomp','Night Drain','Gale Dive'].forEach(n=>{res[n]={};[2,4,7].forEach(L=>{CLR();const e=spawnEnemy('orc',p.x,p.z-L,5,{agg:1});e.agg=1;setTarget(e);f.position.set(p.x,0,p.z);c.sp=[n];c.cdm={};last=null;compSpells(.016);res[n][L]=last||'-'})});compCast=cast;CLR();setTarget(null);return res}""")
    # dimmer telegraphs
    P('tele',"""()=>{const n0=scene.children.length;tele(pl.position,3,1,()=>{});const add=scene.children.slice(n0).map(o=>+o.material.opacity.toFixed(3));
      const e=spawnEnemy('orc',pl.position.x,pl.position.z-1.5,5,{agg:1});mStart(e,pl,'slam');const t=e.atk.tel;const r=[add,+t.o.material.opacity.toFixed(3),+t.f.material.opacity.toFixed(3)];STEP(.3);r.push(+t.o.material.opacity.toFixed(3),+t.f.material.opacity.toFixed(3));mCancel(e);CLR();return r}""")
play.run(s,w=1000,hh=620)
