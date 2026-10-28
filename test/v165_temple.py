# v165 Searing Sands I · The Buried Temple: the dig, Qarsul's rise and fight, the doors. python3 v165_temple.py
#   SHOTS=1 also saves pictures (out/v165t_*.png)
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
SHOTS=os.environ.get('SHOTS')
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}const e=QS165.e;if(e&&!e.dead&&enemies.includes(e))eTick(e,1/30,__T);QS165.mounds.forEach(s=>{if(!s.dead)eTick(s,1/30,__T)})}};
  const T=ss165T1(),Fr=T.F;
  if(step==='dig'){const I=ss165I(0);toPos(T.ac[0],T.ac[1]);tick(.5);out.built=!!SD165.g;out.V0=SD165.D?Math.round(SD165.D.V0):-1;out.p0=+ss165DigP().toFixed(3);out.st0=SS165.c1.st;
    out.portalHidden=RPORT.filter(r=>r.k=='next'&&r.pi===3&&r.ig<=insG(3,2)).every(r=>!r.g.visible);
    // the prompt at the dune's edge
    const [fx,fz]=Fr.W2(T.mound.a0+1.2,0);toPos(fx,fz,0);tick(.1);out.prompt=(worldPrompt()||{}).label||'';
    // dig from a ring of spots round the front of the dune until it is uncovered (each spot: aim, dig)
    let n=0,guard=0;const spots=[];for(let a=T.mound.a0-.5;a<T.aF-1;a+=1.4)for(let b=-6;b<=6;b+=2)spots.push([a,b]);
    while(SS165.c1.st<2&&guard++<600){let best=null;for(const [a,b] of spots){const [x,z]=Fr.W2(a,b);pl.position.set(x,0,z);const t=sd165Aim();if(t&&(!best||t.dep>best.t.dep))best={x,z,t}}
      if(!best)break;pl.position.set(best.x,0,best.z);sd165Dig(best.t.a,best.t.b,true);n++}
    out.strokes=n;out.st1=SS165.c1.st;out.p1=+ss165DigP().toFixed(3);out.saved=SS165.c1.dig.length;out.heap=SD165.heaps.map(h=>+h.m.scale.x.toFixed(2));
    // the real dig loop works too (start, a few strokes by the clock)
    out.errs=errs;return out}
  if(step==='form'){toPos(T.ac[0]+2,T.ac[1]+2);tick(3.5);out.forming=!!QS165.form;tick(5);const e=QS165.e;out.alive=qs165Alive();out.fight=!!(QS165A&&QS165A.f);out.tris=QS165M.tris;out.lv=e?e.c.l:0;out.wall=!!(QS165.wall&&QS165.wall.g.visible);
    // held in: walk out of the yard, recall
    const A=QS165A;pl.position.set(A.cx+A.hr+6,0,A.cz);tick(.1);out.heldIn=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz)<=A.hr+.05;let said='';const sv=say;say=t=>{said=t};doRecall();say=sv;out.recall=said;
    out.errs=errs;return out}
  if(step==='moves'){const e=QS165.e,S=e.sv,res={};hero.hp=heroMax();const keep=CHEAT.god;CHEAT.god=true;
    for(const id of Object.keys(QS165MV)){if(id=='hidden')continue;svEndMove(e,true);QS165.H=null;S.melt=0;e.m.position.set(QS165A.cx,0,QS165A.cz);pl.position.set(QS165A.cx+4,0,QS165A.cz);
      const ok=svStart(e,id,7);let t=0;const D=QS165MV[id];while(e.sv.mv&&e.sv.mv.id===id&&t<D.dur+1){tick(.1);t+=.1;hero.hp=heroMax()}res[id]=ok&&!(e.sv.mv&&e.sv.mv.id===id)?'ok':'stuck';qs165HeartClear();qs165SlabClear()}
    out.moves=res;CHEAT.god=keep;out.errs=errs;return out}
  if(step==='ph2'){const e=QS165.e,S=e.sv;svEndMove(e,true);e.c.h=Math.round(M(e.c)*.5);S.rest=0;hero.hp=heroMax();CHEAT.god=true;tick(5);out.ph=S.ph;out.storm=!!QS165.storm;out.dev=QS165.dev.length;out.hr=+QS165A.hr.toFixed(1);
    // the heart: right one
    svEndMove(e,true);svStart(e,'heart',11);tick(3);out.mounds=QS165.mounds.length;const H=QS165.H;out.hph=H&&H.ph;tick(4.2);out.hph2=QS165.H&&QS165.H.ph;
    const wrong=QS165.mounds.find(s=>!s.qsRight),right=QS165.mounds.find(s=>s.qsRight);out.rightOne=!!right;if(wrong){hurt(wrong,10,{col:0xffffff},false);tick(.2)}out.afterWrong=QS165.mounds.length;
    if(right){hurt(right,1e7,{col:0xffffff},false);tick(.4)}out.broke=e.sv.mv?e.sv.mv.id:'';tick(5.5);
    // the heart: time runs out
    svEndMove(e,true);svStart(e,'heart',23);tick(3);tick(4.2);if(QS165.H)QS165.H.left=.05;tick(.5);out.fail=e.sv.mv?e.sv.mv.id:'';out.slabs=QS165.slabs.length;tick(4.5);out.slabs2=QS165.slabs.length;
    CHEAT.god=false;out.errs=errs;return out}
  if(step==='kill'){const e=QS165.e;svEndMove(e,true);hurt(e,1e9,{col:0xffffff},false);tick(4);out.st=SS165.c1.st;out.dead=!!e.dead;out.fight=!!(QS165A&&QS165A.f);out.wall=!!(QS165.wall&&QS165.wall.g.visible);
    const d=sd165Door();pl.position.set(d.x,0,d.z);tick(.1);out.prompt=(worldPrompt()||{}).label||'';out.open=SD165.open;out.errs=errs;return out}
  if(step==='wipe'){// a fresh save at "uncovered": he rises, the hero falls, he sleeps; back in the yard he rises again
    SS165.c1.st=2;if(QS165.e&&!QS165.e.dead)qs165Reset(false);QS165.e=null;sd165Sync();toPos(T.ac[0],T.ac[1]);tick(8);out.a1=qs165Alive()&&!!(QS165A&&QS165A.f);
    const g=CHEAT.god;CHEAT.god=false;hero.hp=0;tick(.3);out.after=qs165Alive();out.heaps=SD165.heaps.map(h=>+h.m.scale.x.toFixed(2));hero.hp=heroMax();CHEAT.god=g;
    tick(8);out.again=qs165Alive()&&!!(QS165A&&QS165A.f);out.errs=errs;return out}
  if(step==='save'){const s=x2Save();out.has=!!s.ss165;out.st=s.ss165&&s.ss165.c1.st;out.dlen=s.ss165?s.ss165.c1.dig.split(',').length:0;
    // a save with strokes only (st 1) restores the dune shape
    const keep=JSON.parse(JSON.stringify(s));keep.ss165.c1.st=1;x2Load(keep);out.p=+ss165DigP().toFixed(3);out.st1=SS165.c1.st;
    // an old save (no ss165): nothing done, no errors
    const old=JSON.parse(JSON.stringify(s));delete old.ss165;x2Load(old);out.oldSt=SS165.c1.st;out.oldDig=SS165.c1.dig.length;
    // a save that reached II: chapter I counts as done (the doors open)
    INSR[3]=1;out.doneByReach=ss165Done(1);INSR[3]=0;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ren.render=()=>{};try{POST.render=()=>{}}catch(_){};hero.lvl=30;return 1}")
    R={}
    for st in ['dig','form','moves','ph2','kill','wipe','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:900])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    d=R['dig']
    if not d['built']:F('the temple did not build')
    if not d['portalHidden']:F('the old gateway portals still show')
    if 'Dig' not in d['prompt']:F('no dig prompt at the dune: '+d['prompt'])
    if d['st1']!=2:F('the dig never uncovered the doors (st %s, %s%%)'%(d['st1'],d['p1']))
    if not (25<=d['strokes']<=140):F('digging took %d strokes (want ~40-110)'%d['strokes'])
    if max(d['heap'])<1:F('the spoil heaps did not grow')
    f=R['form']
    if not f['alive'] or not f['fight']:F('Qarsul did not rise and fight')
    if not (9000<=f['tris']<=60000):F('Qarsul triangles %s'%f['tris'])
    if not f['heldIn']:F('the hero walked out of the yard')
    if 'escape' not in f['recall'].lower():F('recall was not refused: '+f['recall'])
    m=R['moves']['moves']
    for k,v in m.items():
        if v!='ok':F('move %s %s'%(k,v))
    p=R['ph2']
    if p['ph']!=2 or not p['storm'] or p['dev']!=3:F('Phase II did not start the storm: %s'%p)
    if p['mounds']!=3:F('the heart did not raise three mounds')
    if p['hph2']!='seek':F('the mounds did not shift into the seek phase: %s'%p['hph2'])
    if p['afterWrong']!=2:F('a wrong mound did not burst')
    if p['broke']!='broken':F('breaking the right mound did not tear him out: '+p['broke'])
    if p['fail']!='hfail' or p['slabs']!=3:F('the heart timing out did not bring the slabs: %s'%p)
    k=R['kill']
    if k['st']!=3 or k['fight'] or not k['open']:F('the kill did not open the doors: %s'%k)
    if 'Sunken Temple' not in k['prompt']:F('no enter prompt at the doors: '+k['prompt'])
    w=R['wipe']
    if not w['a1']:F('he did not rise from an uncovered save')
    if w['after']:F('he stayed up after the wipe')
    if not w['again']:F('he did not rise again when the hero came back')
    sv=R['save']
    if not sv['has'] or sv['dlen']<20:F('the dig was not saved')
    if sv['oldSt']!=0:F('an old save did not load clean')
    if not sv['doneByReach']:F('reaching II does not count chapter I done')
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
