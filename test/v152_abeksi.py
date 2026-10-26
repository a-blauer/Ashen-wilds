# v152: Abeksi, the serpent city (Hillside Crest main quest, chapter 1): the instance record, the cleft in Hillside I, entering,
# crouch (keys, speed buff, HUD), the snakes' eyes (cone, range, crouch, dark, line of sight through low/tall cover), ears (steps,
# rats), suspicion → look / investigate / caught → back to the checkpoint, checkpoints by district, the rules inside (companions
# parked, no fighting, no mount, no recall), the drain out to II (done: the cleft leads straight on), saves.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;if(f)f(T);homeTick(1/30,T)}};
  const I=INSL[30],P=ab152Plan(),W2=(u,v)=>[I.x0+u,I.y0+v];out.rec=I&&I.sp;out.insAt=(insAt(I.x0+30,I.y0+30)||{}).g;
  // the Hillside I cleft: built on the first visit, the old portal hidden, prompt
  {const G=INSL[5];toPos(G.ba[0],G.ba[1]);tick(.3);const g=SP152.gates.abeksi,s=g.spot;out.cleft=!!g.g;const r=RPORT.find(q=>q.k=='next'&&q.ig===5);out.portalHidden=r&&!r.g.visible;
    toPos(s.x,s.z);tick(.1);out.cleftPrompt=(worldPrompt()||{}).label||'';out.portalPrompt=(portalPrompt()||{}).label||''}
  // party for the companion rule
  out.fols=fols.filter(Boolean).length;
  // enter: at the breach, crouched, companions parked
  ab152Enter();await wait(900);tick(.5);out.here=ab152In();const H=AB152H;out.cr=H.cr;out.buff=hero.buffs.some(b=>b.ab152);out.folsHidden=fols.every(f=>!f||!f.visible);
  out.pos0=[Math.round(pl.position.x-I.x0),Math.round(pl.position.z-I.y0)];
  // crouch keys: a tap of Ctrl toggles, Ctrl+W does not, C toggles and does not open the talents window
  const kd=(k,o)=>document.body.dispatchEvent(new KeyboardEvent('keydown',Object.assign({key:k,bubbles:true},o||{}))),ku=(k,o)=>document.body.dispatchEvent(new KeyboardEvent('keyup',Object.assign({key:k,bubbles:true},o||{})));
  kd('Control');ku('Control');out.ctrlTap=H.cr;kd('Control');kd('w',{ctrlKey:true});ku('w',{ctrlKey:true});ku('Control');out.ctrlW=H.cr;K.w=0;
  kd('c');ku('c');out.cKey=H.cr;out.talents=(typeof uiOpen=='function'&&uiOpen());if(out.talents){try{closeX()}catch(_){}try{document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))}catch(_){}}out.uiAfter=uiOpen();
  if(!H.cr)ab152SetCrouch(true);
  // the rules inside
  say('');const g0=$('glog').textContent;swing();out.noFight=/Not here/.test($('glog').textContent);
  out.noRecall=(()=>{const t=$('glog').textContent;doRecall();return /serpent wards/.test($('glog').textContent)})();
  // quiet at the start: nobody notices a crouched hero at the breach
  tick(3);out.quiet=Math.max(...AB152.S.acts.map(a=>a.sus));
  // eyes: line of sight through cover (the plan's grid)
  const G=AB152.S.G;out.losOpen=ab152LOS(G,30,40,40,40,false);out.losTall=ab152LOS(G,30,30.5,40,30.5,false);
  // a crouched hero right behind a low crate is hidden, a standing one is not (crate at plan (45,18))
  out.losLowCr=ab152LOS(G,45,14,45,19.2,true);out.losLowSt=ab152LOS(G,45,14,45,19.2,false);
  // a sentry: standing in front of it in the light → caught; crouched in its cone in the dark further out → slower
  const b2=AB152.S.acts.find(a=>a.id=='b2');const sees=(u,v,cr)=>{b2.yaw=Math.atan2(u-b2.u,v-b2.v);b2.hy=0;return ab152Sees(b2,u,v,cr,ab152Light(u,v))};
  out.seeStand=sees(80,41,false);out.seeCr=sees(80,41,true);out.seeFar=sees(80,36.5,true);out.seeBehind=(()=>{b2.yaw=Math.atan2(0,1);return ab152Sees(b2,80,41,false,1)})();
  // caught: stand in front of the fountain sentry → "!" → back to the market checkpoint
  AB152.S.acts.forEach(ab152ResetActor);{const [x,z]=W2(80,42.5);toPos(x,z);ab152SetCrouch(false)}tick(.3);
  b2.yaw=Math.PI;b2.t=0;let caught=0;tick(3,()=>{if(H.cau)caught=1});out.caught=caught;out.cp=AB152Q.cp;await wait(2400);tick(.3);
  out.posCp=[Math.round(pl.position.x-I.x0),Math.round(pl.position.z-I.y0)];out.cauClear=!H.cau&&!H.frz;out.crAfter=H.cr;
  // ears: walking upright right behind a calm snake makes it turn; crouched it does not
  AB152.S.acts.forEach(ab152ResetActor);const a2=AB152.S.acts.find(a=>a.id=='b6');{const [x,z]=W2(a2.u-.2,a2.v-3.0);toPos(x,z)}ab152SetCrouch(true);
  tick(1.2,t=>{pl.mvd={x:1,z:0,t}});out.heardCr=a2.st;ab152SetCrouch(false);tick(.5,t=>{pl.mvd={x:1,z:0,t}});out.heardSt=a2.st;out.heardSus=Math.round(a2.sus);
  tick(2);await wait(2400);tick(.2);out.afterEars=!AB152H.cau&&!AB152H.frz;
  // rats: walking upright beside a pen sets them squealing (noise at the pen)
  AB152.S.acts.forEach(ab152ResetActor);ab152SetCrouch(false);{const q=P.PEN[0];const [x,z]=W2(q[0]-1.5,(q[1]+q[3])/2);toPos(x,z)}tick(.6,t=>{pl.mvd={x:0,z:1,t}});
  out.ratPanic=AB152.S.pens[0][4].panic>0;out.ratHeard=AB152.S.acts.filter(a=>a.ear=='rats').length;
  // checkpoints: crossing into the Gate Yard
  AB152.S.acts.forEach(ab152ResetActor);ab152SetCrouch(true);{const [x,z]=W2(24,186);toPos(x,z)}tick(.4);out.cpGate=AB152Q.cp;
  // save inside → load at the checkpoint
  const s1=x2Save();out.saved=JSON.stringify(s1.ab152);
  // the drain: out to Hillside Crest II
  {const [x,z]=W2(P.EXIT[0],P.EXIT[1]);toPos(x,z)}tick(.2);out.drainPrompt=(worldPrompt()||{}).label||'';(worldPrompt()||{fn(){}}).fn();await wait(1100);tick(.6);
  const c=curIns();out.arrived=c&&c.g;out.insr=INSR[1];out.st=AB152Q.st;out.done=ab152Done();out.crOff=!H.cr&&!hero.buffs.some(b=>b.ab152);out.folsBack=fols.filter(f=>f&&f.visible).length;
  {const G5=INSL[5];toPos(G5.ba[0],G5.ba[1]);tick(.2);const s=SP152.gates.abeksi.spot;toPos(s.x,s.z);tick(.1);out.cleftAfter=(worldPrompt()||{}).label||''}
  // old saves: no ab152 field → not started (II not reached); a save that reached II counts as done
  const old=JSON.parse(JSON.stringify(s1));delete old.ab152;old.insr=[0,0,0,0,0,0];x2Load(old);out.oldSt=AB152Q.st;out.oldDone=ab152Done();
  old.insr=[0,1,0,0,0,0];x2Load(old);out.oldReached=ab152Done();
  out.tris=0;AB152.S.root.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;out.tris+=Math.round((g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1))}});
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['rec']=='abeksi' and r['insAt']==30,'the city has its own instance record')
    exp(r['cleft'] and r['portalHidden'],'Hillside I: the cleft is built and the old portal hidden')
    exp('Sneak through Abeksi city' in r['cleftPrompt'] and not r['portalPrompt'],'the cleft prompt reads "Sneak through Abeksi city" (%s / %s)'%(r['cleftPrompt'],r['portalPrompt']))
    exp(r['here'] and r['cr'] and r['buff'],'entering puts the hero crouched in the city')
    exp(r['pos0']==[14,10],'entering at the breach (%s)'%r['pos0'])
    exp(r['folsHidden'],'companions wait outside')
    exp(r['ctrlTap']==0 and r['ctrlW']==0 and r['cKey']==1 and not r['talents'],'crouch keys: Ctrl tap toggles, Ctrl+W does not, C toggles without opening talents (%s %s %s %s)'%(r['ctrlTap'],r['ctrlW'],r['cKey'],r['talents']))
    exp(r['noFight'] and r['noRecall'],'no fighting and no recall inside')
    exp(r['quiet']<5,'nobody notices a crouched hero at the breach (%s)'%r['quiet'])
    exp(r['losOpen'] and not r['losTall'],'sight: open ground sees, buildings block')
    exp(not r['losLowCr'] and r['losLowSt'],'sight: low cover hides a crouched hero, not a standing one')
    exp(r['seeStand']>r['seeCr']>0 and r['seeBehind']==0,'eyes: standing is seen faster than crouched, nothing behind (%s %s %s)'%(r['seeStand'],r['seeCr'],r['seeBehind']))
    exp(r['caught'] and r['cp']==1,'standing in front of a sentry gets you caught (market checkpoint %s)'%r['cp'])
    exp(r['posCp']==[24,34] and r['cauClear'] and r['crAfter'],'caught → back at the checkpoint, crouched (%s)'%r['posCp'])
    exp(r['heardCr']=='routine' and r['heardSt'] in ('look','investigate','caught'),'ears: crouched steps are silent, upright steps are heard (%s / %s)'%(r['heardCr'],r['heardSt']))
    exp(r['ratPanic'] and r['ratHeard']>0,'rats squeal when you walk upright past their pen (%s heard)'%r['ratHeard'])
    exp(r['cpGate']==5,'checkpoint by district (%s)'%r['cpGate'])
    exp('Slip through the drain' in r['drainPrompt'],'the drain prompt (%s)'%r['drainPrompt'])
    exp(r['arrived']==6 and r['insr']>=1 and r['st']==2 and r['done'],'the drain leads to Hillside Crest II and finishes the chapter (%s %s %s)'%(r['arrived'],r['insr'],r['st']))
    exp(r['crOff'] and r['folsBack']>=1,'outside again: standing, companions back (%s)'%r['folsBack'])
    exp('Travel on to' in r['cleftAfter'],'afterwards the cleft leads straight on (%s)'%r['cleftAfter'])
    exp(r['oldSt']==0 and not r['oldDone'] and r['oldReached'],'old saves: not started, or done if II was reached')
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v152 abeksi:',len(fails),'fails')
play.run(s)
