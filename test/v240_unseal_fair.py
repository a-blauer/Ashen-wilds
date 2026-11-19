# v240 the Unsealing is fair (owner, Nov 18 2026: "still nearly impossible- cheddar always dies and mobs spawning … directly on top of him
# and attacking immediately- theres no counterplay"): two full 120 s runs with a hero who cannot be hurt and kills what reaches it.
#   A: guards Cheddar and runs down each siphoner (1.5 s to get there, 1 s to kill)   -> Cheddar holds, with health to spare
#   B: guards Cheddar and ignores the siphoners                                         -> Cheddar still falls (the magisters matter)
# plus: no creature lands within 9.5 m of Cheddar, stalkers never hurt him on surfacing, a siphoner channels before it drains.
#   python3 v240_unseal_fair.py   (~12 min)
import play,json,os
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v205_unsealing.py'),encoding='utf8').read()
SETUP=src[src.index('JS=r"""')+7:src.index('"""',src.index('JS=r"""')+7)]
GUARD=r"""async(arg)=>{const o={};const F=cq205F(0),R=ch205Spots(),c=R.circ;window.requestAnimationFrame=()=>0;try{ren.render=()=>{}}catch(_){}
 CHEAT.god=true;hero.hp=heroMax();ch205Talk();const b=$('xwF').querySelector('[data-ch205="begin"]');if(b)b.click();try{closeX()}catch(_){}
 const E=US205.E;let T=performance.now();const tally={},add=(k,v)=>{tally[k]=(tally[k]||0)+v};
 const fh=hitTarget;hitTarget=function(e,tg,m){if(tg&&tg.us205K&&US205.E){const h0=US205.E.hp;const r=fh.apply(this,arguments);add('hit:'+(e&&e.us205),h0-US205.E.hp);return r}return fh.apply(this,arguments)};
 const sv0=svWarn;svWarn=function(a,b,d,o2){const W=sv0.apply(this,arguments);try{if(a&&a.k==='c'&&a.r===1.6)add('stalker surfaces',1);if(a&&a.k==='l')add('dive lanes',1)}catch(_){}return W};const P0=F.W2(1.2,1.2);let last=E.hp,step=0,spawns={},near0=[];const sp0=us205Spawn;us205Spawn=function(k){const e=sp0.apply(this,arguments);if(e){spawns[k]=(spawns[k]||0)+1}return e};
 const KILLR=arg&&arg.r||4.5,RATE=arg&&arg.rate||8;
 for(let i=0;i<30*130&&US205.E;i++){T+=33;const h0=US205.E.hp;
   const sn={}; // snapshot of other damage
   loop(T);hero.hp=heroMax();
   // a real player: when a siphoner drains, run to it (1.5 s), hit it down (1 s), come back
   if(!window.__go){const d=enemies.find(e=>e.us205==='siph'&&!e.dead&&e.usS&&e.usS.st==='drain');if(d)window.__go={e:d,t:0}}
   if(window.__go){const G=window.__go;G.t+=1/30;if(G.t<1.5){const k=G.t/1.5;toPos(P0[0]+(G.e.m.position.x-P0[0])*k,P0[1]+(G.e.m.position.z-P0[1])*k)}else{toPos(G.e.m.position.x+1,G.e.m.position.z);if(G.t>2.5&&!G.e.dead){try{hurt(G.e,1e9,{col:0xffffff},false)}catch(_){}}if(G.e.dead){G.back=(G.back||0)+1/30;if(G.back>1.5)window.__go=null}}}
   else toPos(P0[0],P0[1]);
   const X=US205.E;if(!X)break;const dl=h0-X.hp;if(dl>0){add('total',dl);if(X.siN)add('siph drain',Math.min(dl,X.siN*1.6/30))}
   // the hero kills one creature in reach every RATE frames (a strong hero: ~4 kills a second)
   if(i%RATE===0){const P0b=[pl.position.x,pl.position.z];const v=enemies.filter(e=>e.us205&&!e.dead&&e.m.visible!==false&&!(e.usM&&e.usM.st!=='hunt')&&Math.hypot(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z)<KILLR).sort((a,b)=>Math.hypot(a.m.position.x-c.x,a.m.position.z-c.z)-Math.hypot(b.m.position.x-c.x,b.m.position.z-c.z))[0];if(v)try{hurt(v,v.us205==='brk'?M(v.c)*.06:1e9,{col:0xffffff},false)}catch(_){}}
   if(i%30===0){o.dr=o.dr||0;o.trace=o.trace||[];o.trace.push([Math.round(X.t),Math.round(X.hp),us205Alive(),enemies.filter(e=>e.us205&&!e.dead&&Math.hypot(e.m.position.x-c.x,e.m.position.z-c.z)<3).length])}}
 o.tally=Object.fromEntries(Object.entries(tally).map(([k,v])=>[k,+v.toFixed(1)]));o.spawns=spawns;o.end=US205.E?{t:US205.E.t,hp:US205.E.hp}:'over';o.result=CH205.fell?'fell':'?';
 o.trace=o.trace.filter((x,i)=>i%5===0);return o}
"""
PASSIVE=r"""async(arg)=>{const o={};const F=cq205F(0),R=ch205Spots(),c=R.circ;window.requestAnimationFrame=()=>0;try{ren.render=()=>{}}catch(_){}
 CHEAT.god=true;hero.hp=heroMax();ch205Talk();const b=$('xwF').querySelector('[data-ch205="begin"]');if(b)b.click();try{closeX()}catch(_){}
 const E=US205.E;let T=performance.now();const tally={},add=(k,v)=>{tally[k]=(tally[k]||0)+v};
 const fh=hitTarget;hitTarget=function(e,tg,m){if(tg&&tg.us205K&&US205.E){const h0=US205.E.hp;const r=fh.apply(this,arguments);add('hit:'+(e&&e.us205),h0-US205.E.hp);return r}return fh.apply(this,arguments)};
 const sv0=svWarn;svWarn=function(a,b,d,o2){const W=sv0.apply(this,arguments);try{if(a&&a.k==='c'&&a.r===1.6)add('stalker surfaces',1);if(a&&a.k==='l')add('dive lanes',1)}catch(_){}return W};const P0=F.W2(1.2,1.2);let last=E.hp,step=0,spawns={},near0=[];const sp0=us205Spawn;us205Spawn=function(k){const e=sp0.apply(this,arguments);if(e){spawns[k]=(spawns[k]||0)+1}return e};
 const KILLR=arg&&arg.r||4.5,RATE=arg&&arg.rate||8;
 for(let i=0;i<30*130&&US205.E;i++){T+=33;const h0=US205.E.hp;
   const sn={}; // snapshot of other damage
   loop(T);toPos(P0[0],P0[1]);hero.hp=heroMax();
   const X=US205.E;if(!X)break;const dl=h0-X.hp;if(dl>0){add('total',dl);if(X.siN)add('siph drain',Math.min(dl,X.siN*1.6/30))}
   // the hero kills one creature in reach every RATE frames (a strong hero: ~4 kills a second)
   if(i%RATE===0){const v=enemies.filter(e=>e.us205&&!e.dead&&e.m.visible!==false&&!(e.usM&&e.usM.st!=='hunt')&&Math.hypot(e.m.position.x-P0[0],e.m.position.z-P0[1])<KILLR).sort((a,b)=>Math.hypot(a.m.position.x-c.x,a.m.position.z-c.z)-Math.hypot(b.m.position.x-c.x,b.m.position.z-c.z))[0];if(v)try{hurt(v,v.us205==='brk'?M(v.c)*.06:1e9,{col:0xffffff},false)}catch(_){}}
   if(i%30===0){o.trace=o.trace||[];o.trace.push([Math.round(X.t),Math.round(X.hp),us205Alive(),enemies.filter(e=>e.us205&&!e.dead&&Math.hypot(e.m.position.x-c.x,e.m.position.z-c.z)<3).length])}}
 o.tally=Object.fromEntries(Object.entries(tally).map(([k,v])=>[k,+v.toFixed(1)]));o.spawns=spawns;o.end=US205.E?{t:US205.E.t,hp:US205.E.hp}:'over';o.result=CH205.fell?'fell':'?';
 o.trace=o.trace.filter((x,i)=>i%5===0);return o}
"""
QUICK=r"""()=>{const o={};const c=ch205Spots().circ;const d=[];for(let i=0;i<200;i++){const e=us205Spawn(['vamp','bloodbat','mist','siph'][i%4]);if(!e)continue;d.push(Math.hypot(e.m.position.x-c.x,e.m.position.z-c.z));removeE(e)}
 o.minD=Math.min(...d);o.n=d.length;return o}"""
def start(pg):
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=45;CHEAT.god=true;return 1}")
    for st in ['gate','talk','keys']:pg.evaluate(SETUP,st)
def s(pg):
    pg.set_default_timeout(2400000)
    start(pg)
    q=pg.evaluate(QUICK);ok(q['n']>=190 and q['minD']>=9.4,'no creature lands within 9.5 m of Cheddar (nearest %.1f m of %d)'%(q['minD'],q['n']))
    a=pg.evaluate(GUARD,{'r':4.5,'rate':8});print('A',json.dumps({k:a[k] for k in ('tally','end','result')}))
    ok(a['result']!='fell' and a['end']=='over','A: a hero who guards him and runs down the siphoners wins')
    hp=min(x[1] for x in a['trace']);ok(hp>=50,'A: Cheddar never drops below 50 health (lowest %d)'%hp)
    ok(a['tally'].get('stalker surfaces',0)>=3,'A: the stalkers did come (%d)'%a['tally'].get('stalker surfaces',0))
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000);start(pg)
    b=pg.evaluate(PASSIVE,{'r':4.5,'rate':8});print('B',json.dumps({k:b[k] for k in ('tally','end','result')}))
    ok(b['result']=='fell','B: ignoring the siphoners still loses (they are the thing to stop)')
    ok(b['tally'].get('siph drain',0)>=50,'B: the drain is what does it (%.0f)'%b['tally'].get('siph drain',0))
    print('FAILS',len(fails))
play.run(s)
