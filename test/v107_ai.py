# v107: in a real zone, each zone monster's AI picks its signature moves (fights the hero ~25 s of game time, counts moves)
import play,json
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(2400000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev("""async()=>{POST.render=()=>{};ren.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);
      window.SEEN={};window.ERR=[];const w=console.warn;console.warn=function(){ERR.push(String(arguments[0]).slice(0,200));return w.apply(console,arguments)};
      {const f=mStart;mStart=function(e,tg,n){const r=f.apply(this,arguments);if(e&&e.atk&&e.atk.n===n){const k=e.c.g[0];(SEEN[k]=SEEN[k]||{})[n]=(SEEN[k][n]||0)+1}return r}}
      hero.lvl=50;hero.hp=heroMax();
      const out={};
      for(let z=0;z<6;z++){const p=PMAP[z];toPos(p.path[120][0],p.path[120][1]);const P0=pl.position.clone();
        for(const k of BIOEN[p.n]){enemies.slice().forEach(e=>{if(!e.boss)try{removeE(e)}catch(_){}});pl.position.copy(P0);
          const e=spawnEnemy(k,P0.x+3,P0.z,p.lv[0]+2,{});if(!e)continue;e.c.h=e.c.st.hp=1e7;e.agg=1;e.cd=0;const mx=M(e.c);
          for(let t=0;t<1500;t++){await new Promise(r=>setTimeout(r,0));hero.hp=heroMax();hero.iv=0;hero.buffs=[];
            if(t%90==0&&!e.atk){const far=(t/90)%2==1,a=Math.random()*6.28,d=far?5.5:1.5,x=e.m.position.x+Math.cos(a)*d,zz=e.m.position.z+Math.sin(a)*d;if(!solid(x,zz)){pl.position.x=x;pl.position.z=zz}}
            if(k=='troll'&&t==450)e.c.h=Math.min(e.c.h,mx*.3);
            try{const n=performance.now();if(e.dead)break;if(e.atk){mTick(e,.033,n);continue}e.cd-=.033;const v=V().subVectors(pl.position,e.m.position),L=v.length();
              const ms=MSET[k];if(e.cd<=0){const ok=ms.filter(q=>L>=MV[q].rmin&&L<=MV[q].rmax);if(ok.length){const pk=ePick(e,ok);if(pk)mStart(e,pl,pk)}}}catch(x){ERR.push(String(x).slice(0,200))}}}
        }
      return {SEEN,ERR:ERR.slice(0,5)}}""")
    print(json.dumps(r,indent=0))
    sig={}
    ms=ev("()=>MSIG107")
    bad=[k for k in ms if not any(n in r['SEEN'].get(k,{}) for n in ms[k][1:])]   # every monster used a signature (single moves can miss a run by chance)
    print('not picked this run:',[(k,[n for n in ms[k] if n not in r['SEEN'].get(k,{})]) for k in ms if any(n not in r['SEEN'].get(k,{}) for n in ms[k])])
    print('CHECKS OK' if not bad and not r['ERR'] else 'CHECKS FAILED')
play.run(s,w=800,hh=500)
