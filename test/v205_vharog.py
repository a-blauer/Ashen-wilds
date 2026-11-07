# v205 The Citadel II · Vharog, the Bloodgorged: the rampart gate (built, solid, portal hidden), the beast asleep and chained, waking
# (near or hit), the arena wall, every move runs to its end, Hemorrhage and the Feeding Bite (pinned, a dash frees), Phase II, the Night
# Hunt both ways (three harpoons → CHAINED; time out → he feeds), the reset on a wipe, the kill, the portcullis, the gate to III, saves.
#   python3 v205_vharog.py
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);const e=VH205.e;if(e&&!e.dead)try{eTick(e,1/30,__T)}catch(err){errs.push(String(err))}try{kqFxTick(1/30)}catch(_){}}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));const F=cq205F(1),at=(a,b)=>{const [x,z]=F.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)};
  if(step==='gate'){at(-6,0);tick(1);const G=VH205.G;out.built=!!G;out.portalHidden=RPORT.filter(r=>r.k=='next'&&r.ig===insG(5,1)).every(r=>!r.g.visible);out.bal=VH205.bal.length;
    const e=VH205.e;out.spawned=!!e;out.mv=e&&e.sv.mv?e.sv.mv.id:'';out.tris=VH205M.tris;try{const h=spawnEnemy('bloodhound',pl.position.x+30,pl.position.z,46,{});let n=0;h.m.traverse(o=>{if(o.isMesh&&o.visible!==false){const g=o.geometry;n+=(g.index?g.index.count:g.attributes.position.count)/3}});out.houndTris=Math.round(n);removeE(h)}catch(err){out.houndErr=String(err)}out.chain=!!(VH205.chainG&&VH205.chainG.visible);
    at(F.reach-3,0);out.prompt=(worldPrompt()||{}).label||'';at(-6,0);tick(.2);out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);out.errs=errs;return out}
  if(step==='wake'){const e=VH205.e;toPos(e.m.position.x+6,e.m.position.z);tick(.3);out.f=!!(VH205A&&VH205A.f);out.mv=e.sv.mv?e.sv.mv.id:'';out.wall=!!(VH205.wall&&VH205.wall.g.visible);tick(4);out.mv2=e.sv.mv?e.sv.mv.id:'';
    const r=doRecall();out.held=!!(VH205A&&VH205A.f)&&curIns()&&curIns().g===26;out.errs=errs;return out}
  if(step==='moves'){const e=VH205.e,S=e.sv,res={};CHEAT.god=true;for(const id of ['rend','pounce','buffet','spew','screech','bite','fury','pounce2','bats']){svEndMove(e,true);VH205.H=null;e.m.position.set(VH205A.cx,0,VH205A.cz);pl.position.set(VH205A.cx+3.5,0,VH205A.cz);
      const ok=svStart(e,id,7);let t=0;const D=VH205MV[id];while(e.sv.mv&&(e.sv.mv.id===id||e.sv.mv.id==='feed')&&t<D.dur+4){tick(.1);t+=.1;hero.hp=heroMax()}res[id]=ok&&!(e.sv.mv&&e.sv.mv.id===id)?'ok':'stuck'}
    out.moves=res;out.errs=errs;return out}
  if(step==='bleed'){const e=VH205.e;CHEAT.god=false;hero.hp=heroMax()*20;VH205B.n=0;vh205Bleed(e,1);vh205Bleed(e,1);vh205Bleed(e,1);vh205Bleed(e,1);out.n=VH205B.n;const h0=hero.hp;tick(2.2);out.bled=h0-hero.hp;
    // the feeding bite: pinned, the hero drawn to his jaws, a dash frees
    svEndMove(e,true);e.m.position.set(VH205A.cx,0,VH205A.cz);pl.position.set(VH205A.cx,0,VH205A.cz+2.4);e.m.rotation.y=0;vh205Pin();svStart(e,'feed',3);const eh=e.c.h=Math.round(M(e.c)*.5);tick(1);out.feed=e.sv.mv?e.sv.mv.id:'';out.healed=e.c.h>eh;
    hero.iv=0;dodge();tick(.1);out.free=!vh205Pinned();tick(2);out.after=e.sv.mv?e.sv.mv.id:'';CHEAT.god=true;hero.hp=heroMax();out.errs=errs;return out}
  if(step==='ph2'){const e=VH205.e;svEndMove(e,true);e.c.h=Math.round(M(e.c)*.5);e.sv.rest=0;tick(.3);out.mv=e.sv.mv?e.sv.mv.id:'';tick(4.5);out.ph=e.sv.ph;out.storm=!!VH205.storm;out.hr=+VH205A.hr.toFixed(1);out.dk=+VH205.dk.toFixed(2);out.errs=errs;return out}
  if(step==='hunt'){const e=VH205.e;svEndMove(e,true);svStart(e,'hunt',5);tick(2.6);out.H=!!VH205.H;out.mv=e.sv.mv?e.sv.mv.id:'';const h=e.c.h;hurt(e,1000,{col:0xffffff},false);out.inv=e.c.h===h;tick(3);out.ln=!!(VH205.H&&(VH205.H.ln||VH205.H.next>0));out.dk=+VH205.dk.toFixed(2);
    // crank each ballista
    for(const b of VH205.bal){pl.position.set(b.x+1,0,b.z);tick(.1);const p=worldPrompt()||{};if(!out.prompt)out.prompt=p.label||'';if(p.fn)p.fn();tick(1.3);await wait(100);tick(.6)}
    out.used=VH205.bal.filter(b=>b.used).length;out.H2=!!VH205.H;out.mv2=e.sv.mv?e.sv.mv.id:'';tick(5.5);out.mv3=e.sv.mv?e.sv.mv.id:'';
    // a second hunt that runs out
    svEndMove(e,true);svStart(e,'hunt',9);tick(2.6);const h1=e.c.h=Math.round(M(e.c)*.4);VH205.H.left=.1;tick(.8);out.fail=e.sv.mv?e.sv.mv.id:'';tick(5);out.healed=e.c.h>h1;out.errs=errs;return out}
  if(step==='reset'){const e=VH205.e;hero.hp=0;tick(.3);out.f=!!(VH205A&&VH205A.f);out.e=!!vh205Alive();hero.hp=heroMax();try{AWD.dead=0}catch(_){}tick(.5);const e2=VH205.e;out.again=!!e2&&e2!==e;out.sleep=e2&&e2.sv.mv?e2.sv.mv.id:'';out.full=e2?e2.c.h===M(e2.c):false;out.errs=errs;return out}
  if(step==='kill'){const e=VH205.e;hurt(e,10,{col:0xffffff},false);tick(4.2);out.f=!!(VH205A&&VH205A.f);e.c.h=1;hurt(e,1e6,{col:0xffffff},false);tick(4);out.st=CQ205.c2.st;out.port=+VH205.G.port.position.y.toFixed(2);
    at(F.reach-3,0);tick(.2);const p=worldPrompt()||{};out.prompt=p.label||'';out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);if(p.fn)p.fn();await wait(1500);out.ins=curIns()?curIns().g:-1;out.st2=CQ205.c2.st;out.errs=errs;return out}
  if(step==='save'){const s=x2Save();out.c2=s.cq205&&s.cq205.c2;const q=JSON.parse(JSON.stringify(s));q.cq205.c2={st:0};if(q.insr)q.insr[5]=1;INSR[5]=1;x2Load(q);INSR[5]=1;at(-6,0);tick(.5);out.st=CQ205.c2.st;out.sleep=!!vh205Alive();out.port=+VH205.G.port.position.y.toFixed(2);out.ir=insReach(5);out.op=VH205.G.op;out.rs=VH205.G.raising;out.d2=cq205Done(2);
    const o=JSON.parse(JSON.stringify(s));delete o.cq205;x2Load(o);tick(.3);out.oldSt=CQ205.c2.st;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=48;CHEAT.god=true;INSR[5]=1;return 1}")
    R={}
    for st in ['gate','wake','moves','bleed','ph2','hunt','reset','kill','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:1100])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    g=R['gate']
    if not g['built'] or not g['portalHidden'] or g['bal']!=3:F('the rampart gate / ballistae did not build or the old portal shows: %s'%g)
    if not g['spawned'] or g['mv']!='sleep' or not g['chain']:F('Vharog is not asleep and chained at the gate: %s'%g)
    if not (6000<=g['tris']<=60000) or g['tris']<1.8*g.get('houndTris',3000):F('Vharog triangles %s'%g['tris'])
    if 'portcullis' not in g['prompt']:F('no locked prompt at the gate: '+g['prompt'])
    w=R['wake']
    if not w['f'] or not w['wall'] or w['mv']!='intro':F('he did not wake into the fight: %s'%w)
    if not w['held']:F('recall was not blocked in the fight')
    for k,v in R['moves']['moves'].items():
        if v!='ok':F('move %s %s'%(k,v))
    b=R['bleed']
    if b['n']!=3 or b['bled']<=0:F('Hemorrhage did not stack / bleed: %s'%b)
    if b['feed']!='feed' or not b['healed'] or not b['free']:F('the Feeding Bite did not pin / heal / free: %s'%b)
    p=R['ph2']
    if p['ph']!=2 or not p['storm'] or p['hr']>9.5 or p['dk']<.2:F('Phase II did not change the arena: %s'%p)
    h=R['hunt']
    if not h['H'] or h['mv']!='prowl' or not h['inv']:F('the Night Hunt did not start / he can be hurt in the dark: %s'%h)
    if h['dk']<.6:F('the hunt did not darken the arena: %s'%h)
    if 'ballista' not in h['prompt'] or h['used']!=3 or h['H2'] or h['mv2']!='broken':F('three harpoons did not chain him: %s'%h)
    if h['fail']!='hfail' or not h['healed']:F('a hunt that runs out did not end in the feed: %s'%h)
    r=R['reset']
    if r['f'] or not r['again'] or r['sleep']!='sleep' or not r['full']:F('a wipe did not put him back to sleep healed: %s'%r)
    k=R['kill']
    if k['st']!=1 or k['port']<3:F('his death did not open the portcullis: %s'%k)
    if 'portcullis' not in k['prompt'] or k['ins']!=27 or k['st2']!=2:F('the gate did not take the hero to III: %s'%k)
    v=R['save']
    if not v['c2'] or v['c2']['st']!=2:F('chapter II was not saved: %s'%v)
    if v['st']!=0 or not v['sleep'] or v['port']>.1:F('a fresh save did not restore him asleep / the gate shut: %s'%v)
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
