# v151: The Mountain Drill (Burningeye Summit III main quest): the plan (cliff, drill, console, four boxes), the old Den gateway hidden,
# the drill event (held in the yard, recall blocked, boxes switched on; v168: full speed with all four running, ×0.4 slower for each
# box offline, no power with none; boxes freezing and malfunctioning; the timed repairs: Thaw 3 s with a torch, Rewire 6 s with a
# spanner, Rebuild 10 s with a hammer, each with its tool and motion, the box changing as the work goes on, moving or a hit stopping
# the work and F carrying on, the HUD's speed in words, no mini-game window or Space listener left), Frost Troll wreckers going for
# the boxes and smashing them, a hit turning a troll on you, a death ending it), the bore through,
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
  // v168: work at a repair until it ends (or 15 s): the seconds it took
  const work=()=>{let n=0;while(MQ170.W&&n<450){clk+=33;god();mq170Tick(1/30,clk);n++}return +(n/30).toFixed(2)};
  const R=mq170Plan(),I=INSL[insG(2,2)];out.boxIn=R.box.every(b=>{const J=insAt(Math.round(b.x),Math.round(b.z));return J&&J.g===I.g});out.boxFree=R.box.filter(b=>!solid(Math.round(b.x),Math.round(b.z))).length;
  out.keep=mq170Keep(I.g,R.drill.x,R.drill.z)&&!mq170Keep(insG(2,1),R.drill.x,R.drill.z);out.st0=MQ170.st;out.done0=mq170Done();
  toPos(R.con.x,R.con.z+0);await wait(100);tick(.3);out.built=!!MQ170.S;out.portalHidden=!!(MQ170.rp&&!MQ170.rp.g.visible);out.con0=((worldPrompt()||{}).label||'');
  const T=R.L(3,-1.2);toPos(T.x,T.z);tick(.05);out.face0=((worldPrompt()||{}).label||'');MQ170.trkK='';mq170Trk();out.trk0=$('mqt143').textContent;
  // start
  toPos(R.con.x,R.con.z);tick(.05);(worldPrompt()||{fn(){}}).fn();const E=MQ170.E;out.ev=!!E;dr170Hud();out.hud=!!document.getElementById('dr170h')&&!document.getElementById('dr170h').classList.contains('hide');
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;E.trT=99;
  toPos(R.yard.x+R.g.fx*40,R.yard.z+R.g.fz*40);tick(.05);out.clamp=Math.hypot(pl.position.x-R.yard.x,pl.position.z-R.yard.z);
  // switch the boxes on; no drilling until all four run
  const B=MQ170.S.box,at=i=>{toPos(B[i].x+R.g.fx*1.2,B[i].z+R.g.fz*1.2);tick(.03)};out.boxP=[];E.box.forEach(b=>b.tf=99);
  // no box running: no power, the drill does not bore
  tick(1);out.prog0=E.prog;out.spd0=dr170Speed(E);
  for(let i=0;i<3;i++){at(i);out.boxP.push(((worldPrompt()||{}).label||'').slice(0,12));(worldPrompt()||{fn(){}}).fn()}E.box.forEach(b=>b.tf=99);
  // one box offline: 40% speed; two: 16%; three: 6.4%
  const p3=E.prog;tick(1);out.prog3=+(E.prog-p3).toFixed(3);dr170Hud();out.hud3=document.getElementById('dr170h').textContent;MQ170.trkK='';mq170Trk();out.trk3=$('mqt143').textContent;
  out.rates=[0,1,2,3,4].map(n=>{const F={box:[0,1,2,3].map(i=>({s:i<n?'frozen':'on'}))};return +dr170Rate(F).toFixed(3)});
  at(3);(worldPrompt()||{fn(){}}).fn();E.box.forEach(b=>b.tf=99);const p4=E.prog;tick(2);out.prog4=+(E.prog-p4).toFixed(2);out.run=E.run;dr170Hud();out.hud4=document.getElementById('dr170h').textContent;
  // a box freezes: the drill slows down (it does not stop)
  E.box[0].tf=0;tick(.05);out.fail0=E.box[0].s;const p0=E.prog;tick(1);out.slow=+(E.prog-p0).toFixed(3);E.box.forEach(b=>b.tf=99);
  // Thaw: F at the frozen box starts the work: a lit torch in hand, the hero held at the box facing it, the ring over the box
  dr170Set(0,'on');dr170Set(0,'frozen');E.box.forEach(b=>b.tf=99);at(0);out.thawP=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();const W=MQ170.W;out.win=W?W.kind:'';
  out.noWin=!document.getElementById('dr170w');tick(.1);const rg=document.getElementById('dr170r');out.ring=!!rg&&!rg.classList.contains('hide')&&rg.textContent;
  out.tool=!!(DR170W.tool&&DR170W.tool.visible&&DR170W.tool.userData.k==='thaw'&&DR170W.tool.userData.fl);out.anim=!!(HA.cur&&HA.cur.pose===DR170_T.thaw.t);out.gearHid=(pl.gearG||[]).every(o=>!o||!o.visible);
  out.face=Math.abs(Math.atan2(Math.sin(pl.rotation.y-Math.atan2(B[0].x-pl.position.x,B[0].z-pl.position.z)),Math.cos(pl.rotation.y-Math.atan2(B[0].x-pl.position.x,B[0].z-pl.position.z))));
  out.boxD=+Math.hypot(pl.position.x-B[0].x,pl.position.z-B[0].z).toFixed(2);
  const lock=pl.position.clone();pl.position.x+=3;tick(.05);out.locked=pl.position.distanceTo(lock)<.01;
  tick(1.4);out.iceMid=+B[0].ice.scale.y.toFixed(2);out.iceVis=B[0].ice.visible;out.thawT=+(1.55+work()).toFixed(2);out.thawed=E.box[0].s;out.winClosed=!MQ170.W;out.toolOff=!DR170W.tool&&(pl.gearG||[]).some(o=>o&&o.visible);out.iceGone=!B[0].ice.visible;
  // Rewire (a malfunction): on one knee with a spanner; the cables stand up into their sockets one by one; 6 s
  dr170Set(1,'fault');E.box.forEach(b=>b.tf=99);at(1);(worldPrompt()||{fn(){}}).fn();out.win2=MQ170.W?MQ170.W.kind:'';out.tool2=!!(DR170W.tool&&DR170W.tool.userData.k==='wire');out.anim2=!!(HA.cur&&HA.cur.pose===DR170_T.wire.t);
  const c0=B[1].cab.map(c=>+c.rotation.x.toFixed(2));tick(3);out.cabMid=B[1].cab.map(c=>+c.rotation.x.toFixed(2));out.cab0=c0;out.wireT=+(3+work()).toFixed(2);out.rewired=E.box[1].s;out.cabOff=!B[1].wir.visible;
  // Rebuild (smashed): a hammer; the cabinet upright, then the pieces back one by one; 10 s
  dr170Set(3,'smashed');E.box.forEach(b=>b.tf=99);at(3);(worldPrompt()||{fn(){}}).fn();out.win3k=MQ170.W?MQ170.W.kind:'';out.tool3=!!(DR170W.tool&&DR170W.tool.userData.k==='rebuild');out.anim3=!!(HA.cur&&HA.cur.pose===DR170_T.rebuild.t);
  const pc=()=>+B[3].parts[0].o.position.distanceTo(new THREE.Vector3(...B[3].parts[0].on.slice(0,3))).toFixed(2);out.part0=pc();out.tilt0=+B[3].body.rotation.z.toFixed(2);
  tick(5);out.part5=pc();out.tilt5=+B[3].body.rotation.z.toFixed(2);out.rebuildT=+(5+work()).toFixed(2);out.rebuilt=E.box[3].s;
  // moving steps away (the work stops, what is done is kept) and F carries on; a hit knocks you away (kept too)
  dr170Set(2,'smashed');E.box.forEach(b=>b.tf=99);at(2);(worldPrompt()||{fn(){}}).fn();tick(2);clk+=33;god();mq170Tick(1/30,clk,1);out.stepped=!MQ170.W;out.kept=+(E.box[2].rp||0).toFixed(2);
  at(2);out.carryP=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();out.resumed=!!MQ170.W;tick(1);hero.iv=0;hero.hp-=10;clk+=33;mq170Tick(1/30,clk);out.knocked=!MQ170.W;out.kept2=+(E.box[2].rp||0).toFixed(2);god();
  at(2);(worldPrompt()||{fn(){}}).fn();out.restT=work();out.fixed2=E.box[2].s;
  // the box changing state under the work (a frozen box smashed) stops it and starts that box afresh
  dr170Set(2,'frozen');E.box.forEach(b=>b.tf=99);at(2);(worldPrompt()||{fn(){}}).fn();tick(1);dr170Set(2,'smashed');out.changed=!MQ170.W&&(E.box[2].rp||0)===0;
  // Esc steps away too
  at(2);(worldPrompt()||{fn(){}}).fn();dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));out.esc=!MQ170.W;
  dr170Set(2,'on');E.box.forEach(b=>b.tf=99);
  // the old mini-game is gone: no window, no Space listener exception left in the companion command
  out.cmdFree=cmd167Free()&&!String(cmd167Free).includes('MQ170');out.oldFns=['dr170Thaw','dr170Wire','dr170Rebuild','dr170WireSet','dr170Put'].filter(n=>typeof window[n]=='function');
  // Frost Troll wreckers go for a box and smash it
  E.trT=0;tick(.05);const tr=enemies.filter(e=>e.dr170t&&!e.dead);out.trolls=tr.length;const t1=tr[0];
  if(t1){E.trT=99;const j=0,Bx=B[j];t1.dr.b=j;t1.dr.ph='go';t1.m.position.set(Bx.x+1.0,0,Bx.z+1.0);for(let i=0;i<90;i++){clk+=33;god();dr170Troll(t1,1/30,clk);mq170Tick(1/30,clk)}out.smashed=E.box[j].s;
    // Rebuild
    at(j);(worldPrompt()||{fn(){}}).fn();out.win4=MQ170.W?MQ170.W.kind:'';dr170Solve();tick(.05);out.rebuilt2=E.box[j].s;
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
    exp(r['prog0']==0 and 'no power' in r['spd0'],'no box running: no power, no drilling (%s, %s)'%(r['prog0'],r['spd0']))
    exp(.3<r['prog3']<.5,'one box offline: the drill bores at 40%% speed (%s in 1 s)'%r['prog3'])
    exp(r['rates']==[1,.4,.16,.064,0],'the speed per boxes offline: 100/40/16/6.4/0%% (%s)'%r['rates'])
    exp('Drilling slowly' in r['hud3'] and '1 box offline: 40% speed' in r['hud3'],'the HUD says the speed in plain words (%s)'%r['hud3'][:120])
    exp('Drill speed' in r['trk3'] and '40%' in r['trk3'],'the tracker shows the speed (%s)'%r['trk3'])
    exp(1.6<r['prog4']<2.2 and r['run']==1 and 'full speed' in r['hud4'],'all four running: full speed (%s)'%r['prog4'])
    exp(r['fail0'] in ('frozen','fault') and .3<r['slow']<.5,'a box fails on its own and the drill slows down, not stops (%s, %s)'%(r['fail0'],r['slow']))
    exp('Thaw' in r['thawP'] and '3 s' in r['thawP'],'the frozen box: F · Thaw (3 s) (%s)'%r['thawP'])
    exp(r['win']=='thaw' and r['noWin'],'F starts the thaw at the box, no mini-game window (%s)'%r['win'])
    exp(bool(r['ring']) and 'Thawing' in str(r['ring']),'the progress ring shows over the box (%s)'%r['ring'])
    exp(r['tool'] and r['anim'] and r['gearHid'],'thawing: a lit torch in hand (weapon away) and the thaw motion (%s %s %s)'%(r['tool'],r['anim'],r['gearHid']))
    exp(r['face']<.05 and r['boxD']<1.5,'the hero faces the box, close to it (%.2f, %s)'%(r['face'],r['boxD']))
    exp(r['locked'],'the hero stays at the box while repairing')
    exp(r['iceVis'] and r['iceMid']<.8,'the ice melts down as the thaw goes on (%s)'%r['iceMid'])
    exp(2.8<=r['thawT']<=3.3 and r['thawed']=='on' and r['winClosed'] and r['iceGone'],'the thaw takes 3 s and the box runs again (%s s, %s)'%(r['thawT'],r['thawed']))
    exp(r['toolOff'],'the torch goes away and the weapon comes back')
    exp(r['win2']=='wire' and r['tool2'] and r['anim2'],'a malfunction: the rewire with a spanner and its own motion')
    exp(r['cab0'][0]>1.4 and r['cabMid'][0]<.3 and r['cabMid'][2]>1.0,'the cables stand up into their sockets one by one (%s -> %s)'%(r['cab0'],r['cabMid']))
    exp(5.8<=r['wireT']<=6.3 and r['rewired']=='on' and r['cabOff'],'the rewire takes 6 s (%s s, %s)'%(r['wireT'],r['rewired']))
    exp(r['win3k']=='rebuild' and r['tool3'] and r['anim3'],'a smashed box: the rebuild with a hammer and its own motion')
    exp(r['part0']>.5 and r['tilt0']>.2 and r['part5']<.05 and abs(r['tilt5'])<.01,'the cabinet straightens and the pieces go back (%s/%s -> %s/%s)'%(r['part0'],r['tilt0'],r['part5'],r['tilt5']))
    exp(9.8<=r['rebuildT']<=10.3 and r['rebuilt']=='on','the rebuild takes 10 s (%s s, %s)'%(r['rebuildT'],r['rebuilt']))
    exp(r['thawT']<r['wireT']<r['rebuildT'],'thaw is quickest, rewire next, rebuild longest')
    exp(r['stepped'] and .15<r['kept']<.25,'moving steps away; the work done is kept (%s)'%r['kept'])
    exp('Carry on' in r['carryP'] and r['resumed'],'F carries on (%s)'%r['carryP'])
    exp(r['knocked'] and r['kept2']>r['kept'],'a hit knocks you away, the work kept (%s)'%r['kept2'])
    exp(6.5<=r['restT']<=7.2 and r['fixed2']=='on','carrying on only takes what is left (%s s)'%r['restT'])
    exp(r['changed'],'the box changing state stops the work and starts it afresh')
    exp(r['esc'],'Esc steps away')
    exp(r['cmdFree'] and not r['oldFns'],'the mini-game code and its Space exception are gone (%s)'%r['oldFns'])
    exp(r['trolls']>=1,'Frost Troll wreckers come (%s)'%r['trolls'])
    exp(r.get('smashed')=='smashed','a wrecker smashes the box it reaches (%s)'%r.get('smashed'))
    exp(r.get('win4')=='rebuild' and r.get('rebuilt2')=='on','a smashed box starts a rebuild; finished, it runs (%s)'%r.get('rebuilt2'))
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
        # (v168: the repairs' pictures are v168_drill_look.py)
    for e in cons[:8]:
        if 'v151' in e:F('console error '+e)
    for e in errs[:5]:F('page error '+e)
    print('v170 mountain drill:',len(fails),'fails')
play.run(s)
