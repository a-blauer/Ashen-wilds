# v148.1: an enemy area attack aimed at the hero also catches a companion standing in its shape, at 30% damage
import play,json
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(2400000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev("""async()=>{POST.render=()=>{};ren.render=()=>{};
      const out={ERR:[]};hero.lvl=30;hero.hp=heroMax();
      if(!party.length)party.push(mkC('Foxlet',20));
      if(typeof syncFols=='function')try{syncFols()}catch(_){}
      await new Promise(r=>setTimeout(r,500));
      out.fols=fols.length;if(!fols.length)return out;
      const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1]);const P0=pl.position.clone();
      const LOG=[];{const f=hitTarget;hitTarget=function(e,tg,mult,mt){LOG.push({who:tg===pl?'hero':(fols.indexOf(tg)>=0?'fol':'?'),mult});return f.apply(this,arguments)}}
      const f0=fols[0],c0=party[0];
      async function run(n,opt){enemies.slice().forEach(e=>{if(!e.boss)try{removeE(e)}catch(_){}});LOG.length=0;
        pl.position.copy(P0);const e=spawnEnemy(BIOEN[p.n][0],P0.x+1.2,P0.z,8,{});if(!e)return {err:'no enemy'};e.c.h=e.c.st.hp=1e7;e.agg=1;
        c0.h=M(c0);const h0=c0.h;const tg=opt.tgFol?f0:pl;
        const fp=()=>{f0.position.set(e.m.position.x+opt.fd,pl.position.y,e.m.position.z+.3)};fp();
        mStart(e,tg,n);const a=e.atk;
        for(let t=0;t<200&&e.atk===a;t++){hero.hp=heroMax();hero.iv=0;fp();
          if(opt.dodge&&a.ph>=1)pl.position.set(e.m.position.x+12,pl.position.y,e.m.position.z);
          if(n=='spit')f0.position.set(e.m.position.x+(a.d.x*3),pl.position.y,e.m.position.z+(a.d.z*3));
          try{mTick(e,.033,performance.now())}catch(x){out.ERR.push(String(x).slice(0,200))}}
        return {log:LOG.slice(),dmg:h0-c0.h,md:MV[n].dmg}}
      out.inside=await run('spin',{fd:1});
      out.outside=await run('spin',{fd:5});
      out.dodge=await run('slam',{fd:1.4,dodge:1});
      out.spit=await run('spit',{fd:3});
      out.atFol=await run('spin',{fd:1,tgFol:1});
      return out}""")
    print(json.dumps(r,indent=0)[:3000])
    bad=[]
    if not r.get('fols'):bad.append('no companion out')
    else:
        fol=lambda k:[q for q in r[k]['log'] if q['who']=='fol']
        hero=lambda k:[q for q in r[k]['log'] if q['who']=='hero']
        i=r['inside'];fi=fol('inside')
        if not hero('inside'):bad.append('hero was not hit by spin')
        if len(fi)!=1 or abs(fi[0]['mult']-i['md']*.3)>1e-6:bad.append('companion inside spin not hit once at 30%: %s'%fi)
        if i['dmg']<=0:bad.append('companion inside lost no HP')
        if fol('outside'):bad.append('companion outside the circle was hit')
        fd=fol('dodge')
        if hero('dodge'):bad.append('hero hit after dodging out')
        if len(fd)!=1 or abs(fd[0]['mult']-r['dodge']['md']*.3)>1e-6:bad.append('companion left in slam after hero dodged not hit at 30%: %s'%fd)
        if fol('spit'):bad.append('spit (projectile) splashed a companion')
        fa=fol('atFol')
        if len(fa)!=1 or abs(fa[0]['mult']-r['atFol']['md'])>1e-6:bad.append('attack aimed at the companion should hit it once at full damage: %s'%fa)
    if r.get('ERR'):bad.append('errors %s'%r['ERR'])
    for b in bad:print('FAIL',b)
    print('companion splash: checked' if not bad else 'CHECKS FAILED')
play.run(s,w=800,hh=500)
