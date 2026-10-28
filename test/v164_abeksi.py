# v164 (3230): Abeksi, owner's list. In the roused city: guards are tougher and townsfolk no longer half-strength; city fighters move
# faster and walk the streets to a target they can't see (no walking into walls); any resident on the street who sees a hero joins the
# hunt; each bell toll summons 2 elite guards (out of sight, hunting at once) instead of calling residents; the gate: a detailed
# gatehouse whose doors open when the bell tolls, with a pillar of light, an ESCAPE sign, chevrons on the street, a screen-edge arrow,
# a minimap mark and a tracker line; the gate still leads to Hillside Crest II.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;if(f)f(T);homeTick(1/30,T)}};
  const I=INSL[30],W2=(u,v)=>[I.x0+u,I.y0+v];
  AB152Q.st=1;ab152Enter();await wait(900);tick(.5);const S=AB152.S,H=AB152H,G=S.G,P=ab152Plan();
  // ---- the plan: pylons solid, the porch open, the crates moved out, the lamp guard on the battlement ----
  out.pyl=[[70,186],[71,185],[78,187],[79,186]].every(([u,v])=>G.sol[v*G.W+u]);out.porchBad=[[72,185],[74,186],[77,185],[75,185],[72,186],[77,186]].filter(([u,v])=>G.sol[v*G.W+u]);out.porch=!out.porchBad.length;
  out.f3=(S.acts.find(a=>a.id=='f3')||{}).o.lift;out.oldGate=!!(AB152KB.gate);
  // ---- the gate model ----
  const Q=ab164GateBuild(S);let tris=0;Q.root.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3}});out.tris=Math.round(tris);
  out.meshes=0;Q.root.traverse(o=>{if(o.isMesh)out.meshes++});out.closed=Math.abs(Q.leaves[0].rotation.y)<.01&&!Q.beam.visible;
  // ---- the alarm ----
  {const [x,z]=W2(24,184);toPos(x,z)}tick(.3);hero.hp=heroMax();ab157Alarm();const keep=()=>{hero.hp=heroMax()};tick(.4,keep);
  const E=()=>enemies.filter(e=>!e.dead&&e.ab164e);out.el0=E().length;out.elAl=E().every(e=>e.c.al&&e.hunt&&e.agg&&/Elite Guard/.test(e.c.n));
  out.elSeen=E().filter(e=>{const u=e.m.position.x-I.x0,v=e.m.position.z-I.y0;return ab152LOS(G,u,v,H.u,H.v,false)}).length;
  out.elLv=E().map(e=>e.c.l);out.cityLv=I.lv;
  // the bell tolls again: two more
  AB157A.tollT-=AB158.bell.re*1000+50;tick(.2,keep);out.el1=E().length;out.calledRes=ab157Res().filter(a=>a.hunt&&!a.dead).length;
  // ---- tougher fighters ----
  const g0=ab157Res().find(a=>!a.dead&&!a.e&&ab157Guard(a)&&!a.o.lift),c0=ab157Res().find(a=>!a.dead&&!a.e&&!ab157Guard(a)&&!a.o.lift&&a.pose!='spar');
  const lv=I.lv;const base=spawnEnemy('nagaw',W2(24,184)[0],W2(24,184)[1],lv[1],{agg:1});out.baseHP=M(base.c);out.basePA=base.c.st.pa;removeE(base);
  const ck=c0.look=='w'?'nagaw':c0.look=='a'?'nagaa':'nagas',cb=spawnEnemy(ck,W2(24,184)[0],W2(24,184)[1],lv[0]-1,{agg:1});out.cBase=M(cb.c);removeE(cb);
  const eg=ab157Rouse(g0),ec=ab157Rouse(c0);out.gHP=eg&&M(eg.c);out.gPA=eg&&eg.c.st.pa;out.cHPk=ec&&+(M(ec.c)/out.cBase).toFixed(2);out.spk=eg&&eg.m.userData.spk164;out.fighter=!!(eg&&eg.ab164f&&ec&&ec.ab164f);
  // ---- pathing: a fighter behind a wall is given a street waypoint, not the hero ----
  {let spot=null;for(let v=150;v<192&&!spot;v++)for(let u=20;u<130&&!spot;u++){if(!ab158Ok(G,u,v))continue;const d=AB158.fl[v*G.W+u];if(d>8&&d<40&&!ab152LOS(G,u,v,H.u,H.v,false))spot=[u,v]}
   out.spot=spot;if(spot&&eg){eg.m.position.set(I.x0+spot[0],GH(I.x0+spot[0],I.y0+spot[1]),I.y0+spot[1]);const tg=eTarget(eg,eg.m,eg.m.position.distanceTo(pl.position));out.route=!!(tg&&tg.ab164w);
     const d0=AB158.fl[spot[1]*G.W+spot[0]];const p0=eg.m.position.clone();const kp=setInterval(keep,40);eg.cd=0;await wait(4000);clearInterval(kp);const u=Math.round(eg.m.position.x-I.x0),v=Math.round(eg.m.position.z-I.y0);out.moved=+eg.m.position.distanceTo(p0).toFixed(2);
     out.routeD=[d0,ab158Ok(G,u,v)?AB158.fl[v*G.W+u]:-1]}}
  // ---- eyes that hunt: a calm townsperson in plain sight 15 tiles off joins; one behind a wall does not ----
  {const R=ab157Res().filter(a=>!a.dead&&!a.e&&!a.net1&&!(a.o.lift>=1)&&a.folk&&Math.hypot(a.u-H.u,a.v-H.v)>40);const seeA=R[0],hidA=R[1];let ps=null,ph=null;
   for(let v=150;v<192;v++)for(let u=5;u<140;u++){if(!ab158Ok(G,u,v))continue;const d=Math.hypot(u-H.u,v-H.v);if(d<10||d>AB164.see-3)continue;const s=ab152LOS(G,u,v,H.u,H.v,false);if(s&&!ps)ps=[u,v];if(!s&&!ph&&d<20)ph=[u,v]}
   out.seeA=!!(seeA&&ps);out.hidA=!!(hidA&&ph);if(out.seeA){seeA.hunt=0;seeA.u=ps[0];seeA.v=ps[1]}if(out.hidA){hidA.hunt=0;hidA.u=ph[0];hidA.v=ph[1]}
   AB164.tS=0;ab164Sight(performance.now()+1e6);out.seeHunt=seeA?!!seeA.hunt:null;out.hidHunt=hidA?!!hidA.hunt:null}
  // ---- the gate in the alarm ----
  for(let i=0;i<150;i++){T+=33;ab152WorldTick(1/30,T)}
  out.open=+Q.leaves[0].rotation.y.toFixed(2);out.open2=+Q.leaves[1].rotation.y.toFixed(2);out.beam=Q.beam.visible&&Q.beam.material.opacity>.3;out.sign=Q.sign.visible;out.lt=+Q.lt.intensity.toFixed(2);
  H.u=34;H.v=184.5;Q.k=1;S.ch164&&(S.ch164.t=0);ab152WorldTick(1/30,T+=33);out.chev=S.ch164?S.ch164.im.count:0;out.path=S.ch164?S.ch164.path.length:0;
  out.openUi=UIO_IDS.filter(i=>$(i)&&!$(i).classList.contains('hide'));try{closeX()}catch(_){}out.openUi.forEach(i=>$(i).classList.add('hide'));ab152WorldTick(1/30,T+=33);out.arrUi=typeof uiOpen=='function'&&uiOpen();out.arrOn=AB157A.on;out.arrIn=ab152In();out.arrow=!$('ab164ga').classList.contains('hide');out.arrowTxt=$('ab164ga').textContent;
  out.trk=JSON.stringify(SP152.trk.abeksi(I));
  // ---- the gate leads out ----
  enemies.filter(e=>e.ab157&&!e.dead).forEach(e=>{try{removeE(e)}catch(_){}});
  {const [x,z]=W2(75,185.6);toPos(x,z)}tick(.1);const g=worldPrompt();out.gateP=g&&g.label;
  if(g)g.fn();await wait(1100);tick(.6);const c=curIns();out.arrived=c&&c.g;out.done=ab152Done();out.alarmAfter=AB157A.on;out.elAfter=enemies.filter(e=>e.ab164e&&!e.dead).length;
  out.arrowAfter=$('ab164ga').classList.contains('hide');
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['pyl'] and r['porch'],'the pylons are solid and the porch is open (%s %s)'%(r['pyl'],r['porchBad']))
    exp(r['f3'] and r['f3']>8,'the tower lamp guard stands on the battlement walk (lift %s)'%r['f3'])
    exp(not r['oldGate'],'the old plank gate is gone')
    exp(r['meshes']>=8 and r['tris']>8000,'the gate is a detailed model (%s meshes, %s triangles)'%(r['meshes'],r['tris']))
    exp(r['closed'],'the doors are shut and the beacon off while the city is calm')
    exp(r['el0']==2 and r['elAl'],'the first toll summons 2 elite guards, hunting (%s %s)'%(r['el0'],r['elAl']))
    exp(r['elSeen']==0,'the elite guards arrive out of sight (%s seen)'%r['elSeen'])
    exp(all(l>r['cityLv'][1] for l in r['elLv']),'elite guards are above the city level (%s vs %s)'%(r['elLv'],r['cityLv']))
    exp(r['el1']==4,'each toll summons 2 more (%s)'%r['el1'])
    exp(r['gHP'] and r['gHP']>=r['baseHP']*1.45 and r['gPA']>=r['basePA']*1.25,'roused guards are tougher (hp %s vs %s, attack %s vs %s)'%(r['gHP'],r['baseHP'],r['gPA'],r['basePA']))
    exp(r['cHPk'] and r['cHPk']>=0.95,'townsfolk are no longer half-strength (%s of its base)'%r['cHPk'])
    exp(r['fighter'] and r['spk'] and r['spk']>1.5,'city fighters move faster (%s)'%r['spk'])
    exp(r['spot'] and r['route'],'a fighter that cannot see its target follows the streets (%s %s)'%(r['spot'],r['route']))
    exp(r['spot'] and r['moved']>1 and r['routeD'][1]>=0 and r['routeD'][1]<r['routeD'][0],'it closes in along the streets (moved %s, steps %s)'%(r['moved'],r['routeD']))
    exp(r['seeA'] and r['seeHunt'],'a resident who sees the hero joins the hunt (%s %s)'%(r['seeA'],r['seeHunt']))
    exp(not r['hidA'] or not r['hidHunt'],'a resident behind a wall does not (%s)'%r['hidHunt'])
    exp(r['open']>1.3 and r['open2']<-1.3 and r['beam'] and r['sign'] and r['lt']>1,'the bell opens the gate: doors, beacon, sign, light (%s %s %s %s %s)'%(r['open'],r['open2'],r['beam'],r['sign'],r['lt']))
    exp(r['chev']>=5 and r['path']>10,'chevrons on the street lead to the gate (%s on a %s-step path)'%(r['chev'],r['path']))
    exp(r['arrow'] and 'City Gate' in r['arrowTxt'],'the screen-edge arrow points to the gate (%s; ui open %s %s, alarm %s, in city %s)'%(r['arrowTxt'],r['arrUi'],r['openUi'],r['arrOn'],r['arrIn']))
    exp('Escape through the city gate' in r['trk'] and 'steps' in r['trk'],'the tracker tells how far the gate is (%s)'%r['trk'][:200])
    exp(r['gateP'] and 'city gate' in r['gateP'],'F at the gate (%s)'%r['gateP'])
    exp(r['arrived']==6 and r['done'] and not r['alarmAfter'] and r['elAfter']==0 and r['arrowAfter'],'the gate leads to Hillside Crest II, the elites and the arrow are gone (%s %s %s %s)'%(r['arrived'],r['alarmAfter'],r['elAfter'],r['arrowAfter']))
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v164 abeksi:',len(fails),'fails')
play.run(s)
