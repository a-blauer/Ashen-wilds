# v165 Searing Sands III and the Sandstorm Run: the salt columns (mining, the golem, the parts), building the Sandskimmer in the
# salt-cutters' yard, boarding it, the run (Cheddar drives, the hero shoots: it must reach the end in a sane time with the hull
# holding), a wreck and the restart from the checkpoint, turning back, the arrival in the Den, the saves.  python3 v165_run.py
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}enemies.slice().forEach(e=>{if(e.sr165&&!e.dead)eTick(e,1/30,__T)})}};
  CHEAT.god=true;hero.hp=heroMax();
  if(step==='salt'){const S=sc165Spots();out.spots=S.length;const I=ss165I(2);toPos(S[0].x+2.5,S[0].z);tick(.3);out.cols=SC165.cols.filter(c=>c).length;out.prompt=(worldPrompt()||{}).label||'';
    // mine column 0 with the real loop (strokes by the clock)
    const p=worldPrompt();if(p&&p.fn)p.fn();out.on=!!SC165.on;tick(12);out.hits=SC165.cols[0]?SC165.cols[0].hits:-1;out.broke=!!(SS165.c3.col&1);out.golem=!!SC165.golem[0];
    out.picks=SC165.picks.length;const q=SC165.picks[0];if(q){pl.position.set(q.x,0,q.z);tick(.2)}out.got=ss165Bits(SS165.c3.got);
    for(let i=1;i<5;i++){for(let k=0;k<9;k++)sc165Hit(i,true);SC165.picks.slice().forEach(q=>{pl.position.set(q.x,0,q.z);tick(.1)})}out.got2=ss165Bits(SS165.c3.got);out.col=SS165.c3.col;
    enemies.slice().forEach(e=>{if(!e.dead&&/Golem/.test(e.c.n))removeE(e)});out.trk=JSON.stringify((SP152.trk.sands(curIns())||{}).lines||[]);out.errs=errs;return out}
  if(step==='build'){const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-1,-3.5);toPos(x,z);tick(.3);const p=worldPrompt()||{};out.prompt=p.label||'';if(p.fn)p.fn();tick(9);out.built=SS165.c3.built;out.parts=[0,1,2,3,4].map(i=>CS165.R.part[i].visible);
    tick(.1);out.prompt2=(worldPrompt()||{}).label||'';out.vista=!!(CS165.vis&&CS165.vis.visible);out.errs=errs;return out}
  if(step==='board'){const p=worldPrompt()||{};if(p.fn)p.fn();await wait(900);out.on=SR165.on;out.here=sp152Here('sandrun');const V=SR165.me;out.drv=V&&V.drv;out.gun=V&&V.gun;out.tris=SK165.tris;
    out.obs=SR165.obs.length;out.S=Math.round(sr165Path().S);out.errs=errs;return out}
  if(step==='ride'){const V=SR165.me,P=sr165Path();atkHeld=true;mOn=false;let t=0,stuck=0,lastS=V.s,minHp=V.hp,wrecks=0;const keep=CHEAT.god;CHEAT.god=false;
    const log=[];while(t<260&&SR165.ph!=='win'){tick(1);t+=1;hero.hp=heroMax();if(SR165.ph==='wreck'){wrecks++;tick(3);await wait(700);tick(.1)}
      minHp=Math.min(minHp,V.hp);if(V.s-lastS<2&&SR165.ph==='run')stuck++;else stuck=0;lastS=V.s;if(stuck>8)break;if(t%20==0)log.push([t,Math.round(V.s),Math.round(V.hp),enemies.filter(e=>e.sr165&&!e.dead).length,SR165F.wy.length])}
    atkHeld=false;CHEAT.god=keep;out.t=t;out.s=Math.round(V.s);out.S=Math.round(P.S);out.ph=SR165.ph;out.minHp=Math.round(minHp);out.wrecks=SR165.tries;out.stuck=stuck;out.log=log;out.cp=SR165.cp;out.errs=errs;return out}
  if(step==='arrive'){await wait(1500);out.run=SS165.run.st;out.on=SR165.on;out.ins=curIns()?curIns().g:-1;out.errs=errs;return out}
  if(step==='wreck'){CHEAT.god=false;// a second run (from the yard, now straight to the Den) and a forced run to test the wreck and turning back
    SS165.run.st=0;const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-1,-3.5);toPos(x,z);tick(.3);await wait(200);cs165Board();await wait(900);const V=SR165.me;tick(4);V.s=sr165CPs()[1]+3;sr165Place(V,V.s,0);SR165.cp=1;
    sr165Hurt(V,500,'test');out.ph=SR165.ph;tick(3);await wait(900);tick(.2);out.ph2=SR165.ph;CHEAT.god=true;out.hp=Math.round(V.hp);out.near=Math.round(V.s-sr165CPs()[1]);
    $('sr165Q').click();await wait(900);out.on=SR165.on;out.ins=curIns()?curIns().g:-1;SS165.run.st=1;out.errs=errs;return out}
  if(step==='save'){const s=x2Save();out.c3=s.ss165&&s.ss165.c3;out.run=s.ss165&&s.ss165.run;const o=JSON.parse(JSON.stringify(s));delete o.ss165;x2Load(o);out.oldBuilt=SS165.c3.built;x2Load(s);out.back=SS165.c3.built;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=35;INSR[3]=2;return 1}")
    R={}
    for st in ['salt','build','board','ride','arrive','wreck','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:1200])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    a=R['salt']
    if a['spots']!=5 or a['cols']!=5:F('five salt columns should stand: %s'%a)
    if 'Mine' not in a['prompt']:F('no mine prompt at a column: '+a['prompt'])
    if not a['broke'] or not a['golem']:F('mining did not break the column (and wake its golem): %s'%a)
    if a['got']!=1 or a['got2']!=5:F('the parts were not all taken: %s'%a)
    b=R['build']
    if 'Build' not in b['prompt'] or b['built']!=1 or not all(b['parts']):F('building the Sandskimmer failed: %s'%b)
    if 'Board' not in b['prompt2']:F('no board prompt: '+b['prompt2'])
    if not b['vista']:F('no desert vista over the edge')
    o=R['board']
    if not o['on'] or not o['here'] or o['drv']!='chd' or o['gun']!='me':F('boarding did not start the run with Cheddar driving: %s'%o)
    if not (8000<=o['tris']<=60000):F('Sandskimmer triangles %s'%o['tris'])
    r=R['ride']
    if r['stuck']>8:F('Cheddar got stuck at s=%s: %s'%(r['s'],r['log']))
    if r['ph']!='win':F('the run did not reach the cave in %ss (s %s / %s)'%(r['t'],r['s'],r['S']))
    if not (60<=r['t']<=200):F('the run took %ss (want ~80-160)'%r['t'])
    if r['wrecks']>1:F('the hull did not hold with the guns firing (%s wrecks, min hull %s)'%(r['wrecks'],r['minHp']))
    v=R['arrive']
    if v['run']!=1 or v['on'] or v['ins']!=18:F('the run did not end in the Den: %s'%v)
    w=R['wreck']
    if w['ph']!='wreck' or w['ph2'] not in ('intro','run') or w['hp']<100 or not (-4<=w['near']<=4):F('a wreck did not restart at the checkpoint: %s'%w)
    if w['on'] or w['ins']!=17:F('turning back did not return to the yard: %s'%w)
    sv=R['save']
    if not sv['c3'] or sv['c3']['built']!=1 or not sv['run'] or sv['run']['st']!=1:F('III / the run not saved: %s'%sv)
    if sv['oldBuilt']!=0 or sv['back']!=1:F('loading old / new saves: %s'%sv)
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
