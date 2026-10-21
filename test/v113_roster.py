# v113: the new instance creatures in the game itself. For every field instance of every zone: arrive, build the roster,
# spawn everything near the hero and check which creatures live there (I: the zone's originals, II/III: their own list),
# that the camps of II/III use their own themes, that every new creature spawns with a model, then a short free fight
# per new creature (real AI, hero standing in front) to see its moves get used and nothing throws. Prints PASS/FAIL lines.
import play,json,os
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(2400000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("""()=>{window.ERR=[];const w=console.warn,er=console.error;console.warn=function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return w.apply(console,arguments)};
      console.error=function(){ERR.push('E '+[].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return er.apply(console,arguments)};
      window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.requestAnimationFrame=()=>0;window._vt=performance.now()+1e5;POST.render=()=>{};
      window.STEP=n=>{for(let i=0;i<n;i++){_vt+=16;loop(_vt)}};window.HITS=0;hitHero=function(){HITS++;return 0};return 1}""")
    fails=[]
    for z in range(6):
        for k in range(3):
            r=ev("""([z,k])=>{const g=insG(z,k),I=INSL[g];ERR.length=0;insArrive(I);rosterTick();
              const keys={};ROST.slots.forEach(s=>keys[s.key]=(keys[s.key]||0)+1);
              const camps=CAMPS.filter(C=>C.ig===g).map(C=>C.th.n);
              return {n:I.n,keys,camps,err:ERR.slice(0,3)}}""",[z,k])
            want=ev("([z,k])=>{const R=N3.zone[z]&&N3.zone[z][k];const L=R?R.L.slice():BIOEN[PMAP[z].n].slice();CAMPS.forEach(C=>{if(C.ig===insG(z,k))C.th.mem.forEach(m=>L.push(m[0]))});return L.filter((v,i,a)=>a.indexOf(v)==i)}",[z,k])
            got=set(r['keys'].keys());ok=got<=set(want) and not r['err']
            if k>0:
                own=[q for q in want if ev("(q)=>!!(EN[q]&&EN[q].v113)",q)];ok=ok and all(q in got for q in own)
                camp_ok=ev("([z,k])=>{const R=N3.zone[z][k];return CAMPS.filter(C=>C.ig===insG(z,k)).every(C=>R.th.includes(C.th))}",[z,k]);ok=ok and camp_ok
            print(('PASS' if ok else 'FAIL'),'roster',r['n'],json.dumps(r['keys']),r['camps'],r['err'],flush=True)
            if not ok:fails.append(('roster',z,k))
    # every new creature: spawn in its own instance in front of the hero, let the AI fight for a while
    keys=ev("()=>N3.keys")
    for key in keys:
        r=ev("""(key)=>{ERR.length=0;let z=0,k=1;for(const zz in N3.zone)for(const kk in N3.zone[zz])if(N3.zone[zz][kk].L.includes(key)){z=+zz;k=+kk;break}
          const I=INSL[insG(z,k)];insArrive(I);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});ROST.slots=[];ROST.r=I.g;
          const p=pl.position,e=spawnEnemy(key,p.x+3,p.z,I.lv[1],{agg:1});e.agg=1;const used={};let last=null;HITS=0;
          for(let i=0;i<2400;i++){_vt+=16;loop(_vt);hero.hp=heroMax();hero.iv=0;if(e.dead)break;if(e.atk&&e.atk!==last){last=e.atk;used[e.atk.n]=(used[e.atk.n]||0)+1}
            if(i%60==0){const d=Math.hypot(e.m.position.x-p.x,e.m.position.z-p.z);if(d>6){e.m.position.x=p.x+3;e.m.position.z=p.z}}}
          const out={key,hits:HITS,model:!!(e.m&&e.m.children.length),moves:EN[key].moves,used,dead:!!e.dead,err:ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x)).slice(0,3)};removeE(e);hero.buffs=hero.buffs.filter(b=>b.perm);return out}""",key)
        ok=r['model'] and not r['err'] and len([n for n in r['moves'] if r['used'].get(n)])>=2 and r['hits']>0
        print(('PASS' if ok else 'FAIL'),'fight',json.dumps(r),flush=True)
        if not ok:fails.append(('fight',key))
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s'%fails)
play.run(s)
