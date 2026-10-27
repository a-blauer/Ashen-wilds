# v151: The Mountain Drill (Burningeye Summit III main quest): the plan (cliff, drill, console, four boxes), the old Den gateway hidden,
# the drill event (held in the yard, recall blocked, boxes switched on, drilling only with all four running, boxes freezing and
# malfunctioning, the Thaw / Rewire / Rebuild windows, the hero held at the box while repairing and a hit closing the window,
# Frost Troll wreckers going for the boxes and smashing them, a hit turning a troll on you, a death ending it), the bore through,
# the tunnel to the Den, saves (round trip, old saves, Den reached, a mid-drill save). NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),N=()=>performance.now();let clk=N();
  const god=()=>{hero.hp=heroMax();hero.iv=99};
  const tick=(sec,g)=>{for(let i=0;i<Math.round(sec*30);i++){clk+=33;if(g!==false)god();mq170Tick(1/30,clk)}};
  const R=mq170Plan(),I=INSL[insG(2,2)];out.boxIn=R.box.every(b=>{const J=insAt(Math.round(b.x),Math.round(b.z));return J&&J.g===I.g});out.boxFree=R.box.filter(b=>!solid(Math.round(b.x),Math.round(b.z))).length;
  out.keep=mq170Keep(I.g,R.drill.x,R.drill.z)&&!mq170Keep(insG(2,1),R.drill.x,R.drill.z);out.st0=MQ170.st;out.done0=mq170Done();
  toPos(R.con.x,R.con.z+0);await wait(100);tick(.3);out.built=!!MQ170.S;out.portalHidden=!!(MQ170.rp&&!MQ170.rp.g.visible);out.con0=((worldPrompt()||{}).label||'');
  const T=R.L(3,-1.2);toPos(T.x,T.z);tick(.05);out.face0=((worldPrompt()||{}).label||'');MQ170.trkK='';mq170Trk();out.trk0=$('mqt143').textContent;
  // start
  toPos(R.con.x,R.con.z);tick(.05);(worldPrompt()||{fn(){}}).fn();const E=MQ170.E;out.ev=!!E;dr170Hud();out.hud=!!document.getElementById('dr170h')&&!document.getElementById('dr170h').classList.contains('hide');
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;E.trT=99;
  toPos(R.yard.x+R.g.fx*40,R.yard.z+R.g.fz*40);tick(.05);out.clamp=Math.hypot(pl.position.x-R.yard.x,pl.position.z-R.yard.z);
  // switch the boxes on; no drilling until all four run
  const B=MQ170.S.box,at=i=>{toPos(B[i].x+R.g.fx*1.2,B[i].z+R.g.fz*1.2);tick(.03)};out.boxP=[];
  for(let i=0;i<3;i++){at(i);out.boxP.push(((worldPrompt()||{}).label||'').slice(0,12));(worldPrompt()||{fn(){}}).fn()}tick(1);out.prog3=E.prog;
  at(3);(worldPrompt()||{fn(){}}).fn();E.box.forEach(b=>b.tf=99);tick(2);out.prog4=+E.prog.toFixed(2);out.run=E.run;
  // a box freezes: the drill stops; the Thaw window, held at the heater in the green band, frees it
  E.box[0].tf=0;tick(.05);out.fail0=E.box[0].s;const p0=E.prog;tick(1);out.stopped=E.prog===p0;
  const kinds={frozen:'thaw',fault:'wire'};E.box[0].s='frozen';dr170BoxLook(B[0],'frozen');at(0);(worldPrompt()||{fn(){}}).fn();const W=MQ170.W;out.win=W?W.kind:'';out.winEl=!!document.getElementById('dr170w')&&document.getElementById('dr170w').style.display!=='none';
  const lock=pl.position.clone();pl.position.x+=3;tick(.05);out.locked=pl.position.distanceTo(lock)<.01;
  for(let i=0;i<300&&MQ170.W;i++){if(MQ170.W.kind==='thaw')MQ170.W.hold=MQ170.W.temp<(MQ170.W.lo+MQ170.W.hi)/2?1:0;tick(1/30)}await wait(500);tick(.05);out.thawed=E.box[0].s;out.winClosed=!MQ170.W;
  // a malfunction: Rewire
  E.box[1].s='fault';dr170BoxLook(B[1],'fault');at(1);(worldPrompt()||{fn(){}}).fn();out.win2=MQ170.W?MQ170.W.kind:'';[0,1,2,3].forEach(k=>dr170WireSet(MQ170.W,k));await wait(500);tick(.05);out.rewired=E.box[1].s;
  // a hit knocks you away from the box (the window closes)
  E.box[2].s='fault';dr170BoxLook(B[2],'fault');at(2);(worldPrompt()||{fn(){}}).fn();out.win3=!!MQ170.W;hero.iv=0;const h0=hero.hp;hero.hp-=10;clk+=33;mq170Tick(1/30,clk);out.knocked=!MQ170.W;god();
  dr170Set(2,'on');
  // Frost Troll wreckers go for a box and smash it
  E.trT=0;tick(.05);const tr=enemies.filter(e=>e.dr170t&&!e.dead);out.trolls=tr.length;const t1=tr[0];
  if(t1){E.trT=99;const j=0,Bx=B[j];t1.dr.b=j;t1.dr.ph='go';t1.m.position.set(Bx.x+1.0,0,Bx.z+1.0);for(let i=0;i<90;i++){clk+=33;god();dr170Troll(t1,1/30,clk);mq170Tick(1/30,clk)}out.smashed=E.box[j].s;
    // Rebuild
    at(j);(worldPrompt()||{fn(){}}).fn();out.win4=MQ170.W?MQ170.W.kind:'';[0,1,2,3].forEach(k=>dr170Put(MQ170.W,k));await wait(500);tick(.05);out.rebuilt=E.box[j].s;
    // hit it and it turns on you
    hurt(t1,1,null,false);out.angry=!!t1.angry}
  // a death ends the drill
  hero.hp=0;clk+=33;mq170Tick(1/30,clk);out.failEv=!MQ170.E;out.trollsGone=!enemies.some(e=>e.dr170t&&!e.dead);out.failSt=MQ170.st;god();
  // again, to the end
  toPos(R.con.x,R.con.z);tick(.05);(worldPrompt()||{fn(){}}).fn();const E2=MQ170.E;E2.trT=99;E2.box.forEach((b,i)=>{b.s='on';b.tf=99});E2.prog=MQ170.need-.2;tick(.3);
  out.st1=MQ170.st;out.evEnd=!MQ170.E;out.done=mq170Done();out.tun=MQ170.S.cliff.tun.visible;
  toPos(T.x,T.z);tick(.05);out.face1=((worldPrompt()||{}).label||'');
  // saves
  const s1=x2Save();out.saved=JSON.stringify(s1.mq170);MQ170.st=0;x2Load(s1);out.reload=MQ170.st;
  const old=JSON.parse(JSON.stringify(s1));delete old.mq170;old.insr=[0,0,2,0,0,0];x2Load(old);out.oldSt=MQ170.st;out.oldDone=mq170Done();old.insr=[0,0,3,0,0,0];x2Load(old);out.oldReached=mq170Done();x2Load(s1);
  // the tunnel leads to the Den
  toPos(T.x,T.z);tick(.05);(worldPrompt()||{fn(){}}).fn();await wait(900);const K=curIns();out.inDen=K?K.g:-1;
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cons=[];pg.on('console',lambda m:cons.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:6000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['boxIn'] and r['boxFree']==4,'the four boxes stand on open ground in III (%s free)'%r['boxFree']);exp(r['keep'],'decorations keep off the drill (III only)')
    exp(r['st0']==0 and not r['done0'],'fresh hero: chapter 3 not started')
    exp(r['built'] and r['portalHidden'],'the drill yard is built and the old gateway hidden')
    exp('Start the drill' in r['con0'],'the console starts the drill (%s)'%r['con0']);exp('rock' in r['face0'],'the cliff is sealed (%s)'%r['face0'])
    exp('Start' in r['trk0'],'tracker (%s)'%r['trk0'])
    exp(r['ev'] and r['hud'],'the event starts with its HUD');exp('cannot leave' in r['recall'],'recall is blocked (%s)'%r['recall'])
    exp(r['clamp']<=16.6,'the hero is held in the yard (%.1f)'%r['clamp'])
    exp(all(p.startswith('F · Switch') for p in r['boxP']),'dark boxes switch on (%s)'%r['boxP'])
    exp(r['prog3']==0,'no drilling with three boxes (%s)'%r['prog3']);exp(1.6<r['prog4']<2.2 and r['run']==1,'all four running: it drills (%s)'%r['prog4'])
    exp(r['fail0'] in ('frozen','fault') and r['stopped'],'a box fails on its own and the drill stops (%s)'%r['fail0'])
    exp(r['win']=='thaw' and r['winEl'],'a frozen box opens the Thaw window');exp(r['locked'],'the hero stays at the box while repairing')
    exp(r['thawed']=='on' and r['winClosed'],'holding the heater in the green band thaws it (%s)'%r['thawed'])
    exp(r['win2']=='wire' and r['rewired']=='on','a malfunction opens Rewire; the wires fix it (%s)'%r['rewired'])
    exp(r['win3'] and r['knocked'],'a hit knocks you away from the box')
    exp(r['trolls']>=1,'Frost Troll wreckers come (%s)'%r['trolls'])
    exp(r.get('smashed')=='smashed','a wrecker smashes the box it reaches (%s)'%r.get('smashed'))
    exp(r.get('win4')=='rebuild' and r.get('rebuilt')=='on','a smashed box opens Rebuild; the pieces fix it (%s)'%r.get('rebuilt'))
    exp(r.get('angry'),'hitting a wrecker turns it on you')
    exp(r['failEv'] and r['trollsGone'] and r['failSt']==0,'a death ends the drill and clears the trolls')
    exp(r['st1']==1 and r['evEnd'] and r['done'] and r['tun'],'boring through opens the tunnel')
    exp('tunnel' in r['face1'],'the tunnel prompt (%s)'%r['face1'])
    exp(r['reload']==1,'save round trip (%s)'%r['reload']);exp(r['oldSt']==0 and not r['oldDone'],'an old save without the field starts chapter 3 fresh');exp(r['oldReached'],'a save that reached the Den counts it done')
    exp(r['inDen']==13,'the tunnel leads to the Den (ig %s)'%r['inDen'])
    if SHOT:
        pg.evaluate("""async()=>{hero.iv=1e9;const st=document.createElement('style');st.textContent='#ztc116,#glog,#mqt143{visibility:hidden!important}';document.head.appendChild(st);
          x2Load(Object.assign(x2Save(),{mq170:{v:151,st:0},insr:[0,0,2,0,0,0]}));const R=mq170Plan();toPos(R.con.x,R.con.z);for(let i=0;i<10;i++){mq170Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,30))}
          mq170Start();const E=MQ170.E;E.box.forEach((b,i)=>{dr170Set(i,i==1?'fault':i==2?'frozen':'on')});E.prog=40;E.trT=0;for(let i=0;i<60;i++){hero.hp=heroMax();mq170Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,16))}
          const P=R.L(2,16);toPos(P.x,P.z);camYaw=R.g.ry;camPitch=.42;camDist=15;snapCam();await new Promise(r=>setTimeout(r,1500))}""")
        pg.screenshot(path=play.TMP+'/v170_drill.png',timeout=600000)
        for k in ['thaw','wire','rebuild']:
            pg.evaluate("""async(k)=>{dr170Close(false);const i=k=='thaw'?2:k=='wire'?1:0;if(k=='rebuild')dr170Set(0,'smashed');const B=MQ170.S.box[i],R=mq170Plan();toPos(B.x+R.g.fx,B.z+R.g.fz);dr170Open(i,k);await new Promise(r=>setTimeout(r,600))}""",k)
            pg.screenshot(path=play.TMP+'/v170_'+k+'.png',timeout=600000)
    for e in cons[:8]:
        if 'v151' in e:F('console error '+e)
    for e in errs[:5]:F('page error '+e)
    print('v170 mountain drill:',len(fails),'fails')
play.run(s)
