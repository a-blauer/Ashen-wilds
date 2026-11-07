# v205 The Citadel III · The Dawn Mirrors: the Eclipse Door, the Sun Court (lens, stands, Cheddar), the shrines and their wardens,
# taking the mirrors, mounting them, turning them, the beam (it follows the mirrors, it burns the court), Dawnbreak (the door opens,
# the prompt takes you to the Den), the saves.   python3 v205_mirrors.py
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));const F=cq205F(2),at=(a,b)=>{const [x,z]=F.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)};
  if(step==='court'){at(-2,-2);tick(1);const S=DM205.S;out.built=!!S;out.portalHidden=RPORT.filter(r=>r.k=='next'&&r.ig===insG(5,2)).every(r=>!r.g.visible);out.st=S?S.st.length:0;out.sh=S?S.sh.length:0;out.ched=!!DM205.C;
    out.beam=(DM205.pts||[]).length;out.lit=DM205.lit;const R=dm205Court();toPos(R.ched.x+1,R.ched.z);tick(.1);const p=worldPrompt()||{};out.prompt=p.label||'';if(p.fn)p.fn();out.mode=xwMode;closeX();out.c3=CQ205.c3.st;
    out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);const sh=dm205Plan().sh;out.shD=sh.map(s=>Math.round(Math.hypot(s.x-F.x,s.z-F.z)));out.errs=errs;return out}
  if(step==='shrines'){const S=DM205.S;out.res=[];for(const s of S.sh){toPos(s.x+4,s.z+4);tick(.3);const e=DM205.g[s.i];const r={w:!!e,n:e?e.c.n:''};if(e){e.c.h=1;hurt(e,1e6,{col:0xffffff},false)}tick(.3);r.cl=!!(CQ205.c3.cl&(1<<s.i));
      toPos(s.x+1,s.z);tick(.1);const p=worldPrompt()||{};r.p=p.label||'';if(p.fn)p.fn();r.got=!!(CQ205.c3.got&(1<<s.i));out.res.push(r)}out.bag=/Dawn Mirror/.test(kqmMatTab());out.errs=errs;return out}
  if(step==='mount'){const R=dm205Court();for(let i=0;i<3;i++){toPos(R.st[i].x+1.4,R.st[i].z);tick(.1);const p=worldPrompt()||{};if(i==0)out.p=p.label||'';if(p.fn)p.fn();tick(.2)}out.mnt=CQ205.c3.mnt;out.st=CQ205.c3.st;out.rot=CQ205.c3.rot.slice();out.lit=DM205.lit;out.door=DM205.door;
    toPos(R.st[0].x+1.4,R.st[0].z);tick(.1);out.p2=(worldPrompt()||{}).label||'';out.errs=errs;return out}
  if(step==='burn'){const R=dm205Court(),a=DM205.pts[0],b=DM205.pts[1];const e=spawnEnemy('vamp',(a[0]+b[0])/2,(a[1]+b[1])/2,50,{});const h=e.c.h;tick(1.2);out.burnt=h-e.c.h;removeE(e);out.errs=errs;return out}
  if(step==='turn'){const R=dm205Court(),C=CQ205.c3;// turn each mirror with the prompt until it faces its answer
    for(let i=0;i<3;i++){let n=0;while(C.rot[i]!==R.solve[i]&&n<9){toPos(R.st[i].x+1.4,R.st[i].z);tick(.05);const p=worldPrompt()||{};if(p.fn)p.fn();tick(.5);n++}out['lit'+i]=DM205.lit}
    out.st=C.st;out.door=DM205.door;tick(6);await wait(500);tick(6);const D=DM205.S.door;out.seal=D.seal.g.visible;out.rot=+D.doors[0].rotation.y.toFixed(2);out.dk=+DM205.dk.toFixed(2);
    at(F.reach-3,0);tick(.2);const p=worldPrompt()||{};out.prompt=p.label||'';out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);if(p.fn)p.fn();await wait(1500);out.ins=curIns()?curIns().g:-1;out.st4=C.st;out.errs=errs;return out}
  if(step==='save'){const s=x2Save();out.c3=s.cq205&&s.cq205.c3;const q=JSON.parse(JSON.stringify(s));q.cq205.c3={st:2,fd:7,cl:7,got:0,mnt:7,rot:[7,1,4]};if(q.insr)q.insr[5]=2;INSR[5]=2;x2Load(q);INSR[5]=2;at(-2,-2);tick(.5);
    out.st=CQ205.c3.st;out.lit=DM205.lit;out.door=DM205.door;out.seal=DM205.S.door.seal.g.visible;const o=JSON.parse(JSON.stringify(s));delete o.cq205;x2Load(o);tick(.3);out.oldSt=CQ205.c3.st;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=50;CHEAT.god=true;INSR[5]=2;return 1}")
    R={}
    for st in ['court','shrines','mount','burn','turn','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:1100])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    c=R['court']
    if not c['built'] or not c['portalHidden'] or c['st']!=3 or c['sh']!=3 or not c['ched']:F('the Sun Court did not build: %s'%c)
    if c['beam']<2 or c['lit']!=0:F('the lens beam is wrong before any mirror: %s'%c)
    if 'Cheddar' not in c['prompt'] or c['mode']!='dm205' or c['c3']!=1:F('talking to Cheddar in III failed: %s'%c)
    if 'Dawn Mirrors' not in c['trk']:F('the tracker does not show the mirrors: '+c['trk'])
    s=R['shrines']
    for i,r in enumerate(s['res']):
        if not r['w'] or not r['cl'] or not r['got'] or 'Take' not in r['p']:F('shrine %d: warden / cocoon / take failed: %s'%(i,r))
    if not s['bag']:F('the bag does not list the mirrors')
    m=R['mount']
    if m['mnt']!=7 or m['st']!=2 or 'Mount' not in m['p']:F('mounting failed: %s'%m)
    if m['lit']!=1 or m['door']:F('with the mirrors facing back only the first should be lit: %s'%m)
    if 'Turn' not in m['p2']:F('no turn prompt: '+m['p2'])
    if R['burn']['burnt']<=0:F('the beam does not burn the court: %s'%R['burn'])
    t=R['turn']
    if t['lit0']!=2 or t['lit1']!=3 or t['st']!=3 or not t['door']:F('turning the mirrors did not lead the beam to the door: %s'%t)
    if t['seal'] or t['rot']<1.2 or t['dk']<.3:F('Dawnbreak did not open the door / light the court: %s'%t)
    if 'Den' not in t['prompt'] or t['ins']!=28 or t['st4']!=4:F('the door did not take the hero to the Den: %s'%t)
    v=R['save']
    if not v['c3'] or v['c3']['st']!=4:F('chapter III was not saved: %s'%v)
    if v['st']!=2 or v['lit']!=3 or v['door'] or not v['seal']:F('a turning save did not restore the mirrors: %s'%v)
    if v['oldSt']!=0:F('an old save did not reset the chapter: %s'%v)
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
