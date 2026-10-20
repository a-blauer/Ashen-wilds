# v96 econ track test: gear icons never show the old symbol, egg drops ×0.6, XP ×0.75.
#   PART=icons,eggs,xp (default all)   SRC=<other build> works like every play.py test (the checks need this build).
import os,json,play
PART=os.environ.get('PART','icons,eggs,xp').split(',')
OUT=play.TMP;FAIL=[]
def ok(c,m):
    print(('OK   ' if c else 'FAIL ')+m)
    if not c:FAIL.append(m)

def start(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{try{ren.render=()=>{};if(typeof POST!='undefined'&&POST)POST.render=()=>{}}catch(_){}window.__hp=setInterval(()=>{hero.hp=heroMax()},200)}")

# watches a container every animation frame and on every DOM change; records any gear icon that is the old symbol
# (a .kqi mask or the raw emoji from v89IcoOld) or a placeholder (.kqgp)
WATCH="""(sel)=>{window._w={old:0,ph:0,img:0,frames:0,samples:[]};const W=_w,el=document.querySelector(sel),olds=new Set();
  ITPL.forEach((t,tp)=>{try{olds.add(v89IcoOld({tp,r:0}))}catch(_){}});
  const look=()=>{el.querySelectorAll('.pt>span,.kqm-ic,.kqm-tn>span').forEach(s=>{
    const gear=s.querySelector('img.kqgi,.kqgp')||[...olds].some(o=>s.innerHTML.includes(o))||s.querySelector('.kqi');
    if(s.querySelector('img.kqgi'))W.img++;if(s.querySelector('.kqgp'))W.ph++;
    if(s.dataset.gear=='1'&&(s.querySelector('.kqi')||[...olds].some(o=>s.textContent.includes(o)))){W.old++;W.samples.push(s.innerHTML.slice(0,90))}})};
  W.mo=new MutationObserver(look);W.mo.observe(el,{childList:true,subtree:true});
  const f=()=>{if(!W.stop){W.frames++;look();requestAnimationFrame(f)}};requestAnimationFrame(f);return 1}"""

def icons(pg):
    ev=pg.evaluate;P=lambda n,c,*a:print(n,'=>',json.dumps(ev(c,*a))[:900])
    ok(ev("()=>v89Init()"),'icon renderer available (WebGL)')
    # helper: a fresh item whose icon is not cached yet (template + rarity), mark gear popups so the watcher knows them
    ev("""()=>{window._fresh=(sl)=>{for(let i=0;i<400;i++){const it=genItem(10+i%30,sl?{sl,cls:hero.cls}:{cls:hero.cls});if(!V89I.cache.has(v89Key(it))&&!V89I.qs.has(v89Key(it)))return it}return null};
      const f=pickup;pickup=function(o){const r=f.apply(this,arguments);try{if(window._tg){const d=$('pk').lastElementChild,s=d&&d.querySelector('.pt>span');if(s)s.dataset.gear='1'}}catch(_){}return r};
      const t=take;take=function(d){const g=window._tg;window._tg=d&&d.kind=='gear';try{return t.apply(this,arguments)}finally{window._tg=g}};
      $('pk').innerHTML='';return 1}""")
    ev(WATCH,'#pk')
    # A) the usual case: gear drops a few tiles away, you walk over it (pre-warmed while it lies there)
    r=ev("""async()=>{const it=_fresh('weapon'),k=v89Key(it),p=pl.position.clone();p.x+=4;const n0=drops.length;drop('gear',it,p,it.r);
      const d=drops[drops.length-1];const queued=V89I.q.length&&v89Key(V89I.q[0])==k;let fr=0;
      while(!V89I.cache.has(k)&&fr<60){await new Promise(r=>requestAnimationFrame(r));fr++}
      d.g.position.copy(pl.position);await new Promise(r=>setTimeout(r,300));
      return {queuedFirst:!!queued,framesToReady:fr,picked:!drops.includes(d),cached:V89I.cache.has(k)}}""")
    print('drop A',r);ok(r['queuedFirst'] and r['cached'] and r['picked'],'a dropped item is queued first and rendered while it lies on the ground (%d frames)'%r['framesToReady'])
    # B) worst case: picked up the same frame it is made (nothing cached) — the popup draws it on the spot
    r=ev("""async()=>{const out=[];for(let i=0;i<6;i++){const it=_fresh(['helm','chest','boots','ring','amulet','weapon'][i]),k=v89Key(it);const was=V89I.cache.has(k);
        take({kind:'gear',data:it});const s=$('pk').lastElementChild.querySelector('.pt>span');out.push([was,!!s.querySelector('img.kqgi'),!!s.querySelector('.kqgp'),!!s.querySelector('.kqi')]);
        await new Promise(r=>setTimeout(r,120))}return out}""")
    print('take B',r);ok(all((not a) and b and not c and not d for a,b,c,d in r),'instant pickups of uncached items show the picture in the popup right away')
    # C) drop right at the hero's feet (picked up on the next frame), boss style: 2 at once, then 5 at once
    r=ev("""async()=>{const t0=V89I.log.length;for(const n of [2,5]){for(let i=0;i<n;i++){const it=_fresh();drop('gear',it,pl.position.clone(),it.r)}
        await new Promise(r=>setTimeout(r,700))}return {log:V89I.log.slice(-12).map(x=>Math.round(x*10)/10)}}""")
    print('drop C',r)
    pg.wait_for_timeout(800)
    w=ev("()=>{_w.stop=1;_w.mo.disconnect();const r=Object.assign({},_w);delete r.mo;return r}")
    print('popup watch',json.dumps(w)[:600])
    ok(w['old']==0 and w['frames']>20,'loot popup never showed the old symbol for gear (%d frames watched, %d gear icons seen)'%(w['frames'],w['img']))
    ok(w['ph']==0,'loot popup never needed a placeholder (%d)'%w['ph'])
    # D) bag full of uncached gear: placeholders (never the symbol) then pictures, few per frame
    ev("()=>{for(let i=0;i<40;i++){const it=_fresh();if(it)gear.push(it)}return gear.length}")
    ev("()=>{bagTab2=0;$('bagBtn').click()}")
    pg.wait_for_timeout(50)
    r=ev("""()=>{const B=$('bl')||document.body,t=[...B.querySelectorAll('.kqm-slot.kqm-it .kqm-ic')];t.forEach(s=>s.dataset.gear='1');
      return {tiles:t.length,img:t.filter(s=>s.querySelector('img.kqgi')).length,ph:t.filter(s=>s.querySelector('.kqgp')).length,old:t.filter(s=>s.querySelector('.kqi')).length}}""")
    print('bag at open',r);ok(r['tiles']>=30 and r['old']==0,'bag right after opening: no old symbols (%d pictures, %d placeholders)'%(r['img'],r['ph']))
    ev(WATCH,'#bl')
    try:pg.wait_for_function("()=>V89I.q.length==0&&!document.querySelector('#bl .kqgp')",timeout=180000)
    except Exception as e:print('wait',e)
    pg.wait_for_timeout(500)
    w=ev("()=>{_w.stop=1;_w.mo.disconnect();const r=Object.assign({},_w);delete r.mo;return r}")
    r=ev("()=>{const t=[...$('bl').querySelectorAll('.kqm-slot.kqm-it .kqm-ic')];return {tiles:t.length,img:t.filter(s=>s.querySelector('img.kqgi')).length,ph:t.filter(s=>s.querySelector('.kqgp')).length}}")
    print('bag later',r,'watch old',w['old'],w['samples'][:2])
    ok(w['old']==0 and r['img']==r['tiles'],'bag fills in with pictures only (%d/%d), never the old symbol'%(r['img'],r['tiles']))
    # placeholder look
    r=ev("()=>{const s=document.createElement('div');s.innerHTML=v89Ph({r:3},'x');document.body.appendChild(s);const e=s.firstChild,cs=getComputedStyle(e),a=getComputedStyle(e,'::after');const o=[e.textContent,cs.borderTopColor,a.animationName];s.remove();return o}")
    ok(r[0]=='' and r[2]=='kqgSh','placeholder is an empty rarity frame with a shimmer %s'%r)
    # tooltip on a fresh item
    r=ev("""()=>{const it=_fresh();gear.push(it);const s=icoOf(it);return [s.includes('img class="kqgi"'),s.includes('kqgp'),V89I.cache.has(v89Key(it))]}""")
    print('single icoOf',r)
    # render time per icon + background budget
    r=ev("()=>{const L=V89I.log.slice().sort((a,b)=>a-b);return {n:V89I.n,avg:Math.round(V89I.ms/Math.max(1,V89I.n)*10)/10,med:Math.round(L[L.length>>1]*10)/10,p90:Math.round(L[Math.floor(L.length*.9)]*10)/10,max:Math.round(V89I.mx*10)/10,sync:V89I.nsync,ph:V89I.nph,sb:V89I.sb,pb:V89I.pb}}")
    print('icon timing (ms, headless software GL)',r)
    # no WebGL fallback: the old emoji
    r=ev("()=>{const ok=V89I.ok;V89I.ok=false;const it={tp:5,r:2};V89I.cache.delete(v89Key(it));const fb=icoOf(it);V89I.ok=ok;return [fb,v89IcoOld(it)]}")
    ok(r[0]==r[1],'no WebGL still falls back to the old emoji')

def eggs(pg):
    ev=pg.evaluate
    r=ev("()=>[EGG92.rate,ECON96.egg0,ECON96.egg]")
    ok(abs(r[0]-.39)<1e-9 and abs(r[1]-.65)<1e-9,'EGG92.rate .65 → %.2f (×%.2f)'%(r[0],r[2]))
    r=ev("""()=>{const D=dn,F=EGG92.f,R0=EGG92.rate;dn=()=>{};let n=0;EGG92.f=function(k){if(k=='egg')n++};
      const sim=(rate,fn,N)=>{EGG92.rate=rate;n=0;for(let i=0;i<N;i++)fn();return n};
      const mob=(al,bs)=>()=>lootE_base({c:{l:20,al:al?1:0,boss:bs?1:0,zt:2,en:'',g:['Foxlet'],iv:{hp:1,a:1,d:1}},m:{position:new THREE.Vector3(0,0,0)}});
      const P=new THREE.Vector3(),r={};
      try{for(const [k,fn,N] of [['mob',mob(0,0),60000],['elite',mob(1,0),12000],['boss',mob(0,1),300],['chest',()=>stdLoot(P,2,{egg:.3}),9000]])r[k]=[sim(1,fn,N),sim(.65,fn,N),sim(R0,fn,N),N]}
      finally{EGG92.rate=R0;EGG92.f=F;dn=D}return r}""")
    print('eggs',json.dumps(r))
    for k in ['mob','elite','chest']:
        o,v,a,n=r[k];ok(o>0 and abs(a/max(1,v)-.6)<.09,'%s: original %.2f%% → v92 %.2f%% → now %.2f%% (×%.2f vs v92, ×%.2f vs original)'%(k,100*o/n,100*v/n,100*a/n,a/max(1,v),a/max(1,o)))
    o,v,a,n=r['boss'];ok(o==n and a==n,'Sovereign egg stays guaranteed (%d/%d)'%(a,n))

def xp(pg):
    ev=pg.evaluate
    # XP per same-level kill (normal / elite / boss) with the old factor (ECON96.xp=1) and the new one; kills per level
    r=ev("""()=>{const out={},L0=hero.lvl,X0=hero.xp,P0=party.slice();party.length=0;
      for(const l of [1,5,10,20,30,40,50]){const row={};for(const f of [1,ECON96.xp]){ECON96.xp=f;const g=k=>{hero.lvl=l;hero.xp=0;const e={c:{l,al:k==1?1:0,boss:k==2?1:0,g:['Foxlet']},wv:0};return gainXP(e)};
          const w=(()=>{hero.lvl=l;hero.xp=0;return gainXP({c:{l,al:0,boss:0,g:['Foxlet']},wv:1})})();
          row[f]=[g(0),g(1),g(2),w,needH(l)]}ECON96.xp=.75;out[l]=row}
      hero.lvl=L0;hero.xp=X0;party.push(...P0);return out}""")
    print('xp',json.dumps(r))
    print('| level | XP to next | XP per kill before → after | elite | Sovereign | wave kill | kills per level before → after |')
    for l,row in r.items():
        b=row['1'];a=row['0.75']
        print('| %s | %d | %d → %d | %d → %d | %d → %d | %d → %d | %.0f → %.0f |'%(l,b[4],b[0],a[0],b[1],a[1],b[2],a[2],b[3],a[3],b[4]/b[0],a[4]/a[0]))
        if int(l)>=5:ok(abs(a[0]/b[0]-.75)<.05,'level %s kill XP ×%.3f'%(l,a[0]/b[0]))
    # total kills from 1 to 20 / 50 (same-level normal kills)
    r=ev("""()=>{const L0=hero.lvl,X0=hero.xp,P0=party.slice();party.length=0;const tot={};for(const f of [1,.75]){ECON96.xp=f;let k20=0,k50=0;for(let l=1;l<50;l++){hero.lvl=l;hero.xp=0;const x=gainXP({c:{l,al:0,boss:0,g:['Foxlet']}});const n=Math.ceil(needH(l)/x);if(l<20)k20+=n;k50+=n}tot[f]=[k20,k50]}
      ECON96.xp=.75;hero.lvl=L0;hero.xp=X0;party.push(...P0);return tot}""")
    print('total same-level kills 1→20, 1→50 (before, after):',r)
    # level-up math and the XP bar
    r=ev("""()=>{hero.lvl=10;hero.xp=needH(10)-5;const e={c:{l:10,al:1,boss:0,g:['Foxlet']}};const g=gainXP(e);hud();
      const t=$('xpT').textContent,w=parseFloat($('xpB').style.width);return {g,lvl:hero.lvl,xp:hero.xp,exp:g-5,t,w,need:needH(11)}}""")
    print('levelup',r)
    ok(r['lvl']==11 and r['xp']==r['exp'] and r['t']=='Lv 11 · %d / %d XP'%(r['xp'],r['need']) and abs(r['w']-100*r['xp']/r['need'])<.01,'level-up carries the rest over and the XP bar/text match (%s, %.1f%%)'%(r['t'],r['w']))
    # companions get the same (reduced) XP as the hero
    r=ev("""()=>{const c=party[0];if(!c)return null;c.l=8;c.x=0;c.h=M(c);hero.lvl=8;hero.xp=0;const g=gainXP({c:{l:8,al:0,boss:0,g:['Foxlet']}});return [g,hero.xp,c.x]}""")
    ok(r and r[0]==r[1]==r[2],'active companion gets the same kill XP as the hero %s'%r)

def s(pg):
    start(pg)
    if 'xp' in PART:xp(pg)
    if 'eggs' in PART:eggs(pg)
    if 'icons' in PART:icons(pg)

play.run(s,w=1280,hh=800)
errs=[l for l in open(OUT+'/lastlogs.txt').read().split('\n') if 'PAGEERROR' in l];ok(not errs,'no page errors %s'%errs[:3])
print('FAILED:' if FAIL else 'ALL OK',FAIL)
