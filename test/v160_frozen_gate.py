# v151: The Frozen Gate (Burningeye Summit II main quest): the plan (gate, workbench, three caches), the gate replaces the II
# gateway, each cache's elite warden and its part, assembling the flamespitter, the melt event (held in the yard, recall blocked,
# C picks up and drops, holding the left button sprays and melts, overheating after 5 s and cooling, ice spiders spawning and
# hunting, v166: twice as many, the flame burning spiders in heavy hits (charge = bonus burn, empty still kills, refills), a death resets it), the gate opening, the road to III,
# saves (round trip, old saves, III reached, a mid-melt save). NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),N=()=>performance.now();let clk=N();
  const god=()=>{hero.hp=heroMax();hero.iv=99};
  const tick=sec=>{for(let i=0;i<Math.round(sec*30);i++){clk+=33;god();mq160Tick(1/30,clk)}};
  const R=mq160Plan(),G=R.gate,I=INSL[insG(2,1)];out.cacheN=R.cache.filter(Boolean).length;out.cacheFb=R.cache.filter(c=>c.fb).length;
  out.cacheIn=R.cache.every(c=>{const J=insAt(Math.round(c.x),Math.round(c.z));return J&&J.g===I.g});out.cacheSep=Math.min(...[0,1,2].map(i=>{const a=R.cache[i],b=R.cache[(i+1)%3];return Math.hypot(a.x-b.x,a.z-b.z)}));
  out.benchD=Math.hypot(R.bench.x-G.x,R.bench.z-G.z);out.keepGate=mq160Keep(I.g,G.x,G.z);out.keepOther=mq160Keep(insG(2,0),G.x,G.z);
  out.st0=MQ160.st;out.done0=mq160Done();
  toPos(G.x+G.fx*2,G.z+G.fz*2,G.ry);await wait(150);tick(.3);out.built=!!MQ160.S;out.portalHidden=!!(MQ160.rp&&!MQ160.rp.g.visible);out.gate0=((worldPrompt()||{}).label||'');
  out.iceSolid=solid(Math.round(G.x),Math.round(G.z));
  toPos(R.bench.x+G.fx*1.6,R.bench.z+G.fz*1.6);tick(.1);out.bench0=((worldPrompt()||{}).label||'');
  MQ160.trkK='';mq160Trk();out.trk0=$('mqt143').textContent;
  // the caches: a warden rises, the part is guarded until it falls
  out.guards=[];out.takes=[];
  for(let i=0;i<3;i++){const c=R.cache[i];toPos(c.x+Math.sin(c.ry)*1.5,c.z+Math.cos(c.ry)*1.5);tick(.2);const g=MQ160['g'+i];
    out.guards.push(g?(g.c.al?'elite ':'')+g.c.g[0]+' L'+g.c.l:'none');const lp=((worldPrompt()||{}).label||'');
    if(g){hurt(g,1e9,null,false);await wait(50)}tick(.1);const tp=((worldPrompt()||{}).label||'');out.takes.push((lp.indexOf('guarded')>=0?'G':'-')+(tp.indexOf('Take')>=0?'T':'-'));(worldPrompt()||{fn(){}}).fn();tick(.1)}
  out.parts=MQ160.p.join('');out.st1=MQ160.st;out.fd=MQ160.fd.join('');
  // assemble
  toPos(R.bench.x+G.fx*1.6,R.bench.z+G.fz*1.6);tick(.1);out.bench1=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();out.st2=MQ160.st;out.spVis=MQ160.S.sp.visible;
  out.bench2=((worldPrompt()||{}).label||'');
  // the melt
  (worldPrompt()||{fn(){}}).fn();const E=MQ160.E;out.ev=!!E;fs160Hud();out.hud=!!document.getElementById('fs160')&&!document.getElementById('fs160').classList.contains('hide');
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;
  out.evPrompt=((worldPrompt()||{}).label||'');
  // C picks it up (the Character window does not open)
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true}));document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'c',bubbles:true}));out.carry=E.carry;out.talHidden=$('tal').classList.contains('hide');out.onHero=MQ160.S.sp.parent===pl;
  // held in the yard
  toPos(R.yard.x+G.fx*30,R.yard.z+G.fz*30);tick(.05);out.clamp=Math.hypot(pl.position.x-R.yard.x,pl.position.z-R.yard.z);
  // spray at the gate: it melts; 5 s and it overheats
  const aimAt=()=>{toPos(G.x+G.fx*3.5,G.z+G.fz*3.5);pl.rotation.y=Math.atan2(G.x-pl.position.x,G.z-pl.position.z);mOn=false;try{if(tgt)setTarget(null)}catch(_){}};
  atkHeld=true;for(let i=0;i<60;i++){aimAt();clk+=33;god();mq160Tick(1/30,clk)}out.melt2=+E.melt.toFixed(2);out.heat2=+E.heat.toFixed(2);out.fire=E.fire;
  for(let i=0;i<100;i++){aimAt();clk+=33;god();mq160Tick(1/30,clk)}out.ovh=E.ovh;const m5=E.melt;for(let i=0;i<30;i++){aimAt();clk+=33;god();mq160Tick(1/30,clk)}out.noMeltHot=+(E.melt-m5).toFixed(3);
  atkHeld=false;for(let i=0;i<130;i++){clk+=33;god();mq160Tick(1/30,clk)}out.cooled=E.ovh===0&&E.heat<.05;
  out.spiders=enemies.filter(e=>e.fs160sp&&!e.dead).length;out.hunt=enemies.filter(e=>e.fs160sp&&!e.dead).every(e=>e.hunt&&e.agg&&e.minion);
  // v166: twice as many spiders: two or more per spawn, up to MQ160.cap alive
  enemies.slice().forEach(e=>{if(e.fs160sp)removeE(e)});E.spT=0;clk+=33;god();mq160Tick(1/30,clk);out.spawn1=enemies.filter(e=>e.fs160sp&&!e.dead).length;
  for(let i=0;i<40;i++){E.spT=0;clk+=33;god();mq160Tick(1/30,clk)}out.spawnMax=enemies.filter(e=>e.fs160sp&&!e.dead).length;out.cap=MQ160.cap;
  // v166: the flame burns a spider down in a few heavy hits (not at once); with essence charge 2 burns, 8 charge
  const spawnFront=()=>{const e=spawnEnemy('icespider',pl.position.x+Math.sin(pl.rotation.y)*3,pl.position.z+Math.cos(pl.rotation.y)*3,22,{agg:1,minion:1});e.fs160sp=1;e.hunt=1;e.vx=e.vz=0;return e};
  const keep=e=>{e.m.position.set(pl.position.x+Math.sin(pl.rotation.y)*3,e.m.position.y,pl.position.z+Math.cos(pl.rotation.y)*3)};
  enemies.slice().forEach(e=>{if(e.fs160sp)removeE(e)});E.heat=0;E.ovh=0;E.charge=MQ160.charge;E.spent=0;const sp=spawnFront(),hp0=sp.c.h;
  const ch0=E.charge;atkHeld=true;E.spT=99;for(let i=0;i<4;i++){aimAt();keep(sp);clk+=33;god();mq160Tick(1/30,clk)}out.sp1Alive=!sp.dead&&enemies.includes(sp);out.sp1Frac=+(sp.c.h/hp0).toFixed(2);
  for(let i=0;i<20&&!sp.dead;i++){aimAt();keep(sp);clk+=33;god();mq160Tick(1/30,clk)}out.spDead=!!sp.dead||!enemies.includes(sp);out.chargeCost=Math.round(ch0-E.charge);
  // with the charge empty the flame still kills, just slower (3 burns): the v166 bug fix
  E.charge=0;E.heat=0;const sp2=spawnFront(),hp2=sp2.c.h;
  for(let i=0;i<4;i++){aimAt();keep(sp2);clk+=33;god();mq160Tick(1/30,clk)}out.sp2Alive=!sp2.dead&&enemies.includes(sp2);out.sp2Frac=+(sp2.c.h/hp2).toFixed(2);out.spent=E.spent;
  for(let i=0;i<40&&!sp2.dead;i++){aimAt();keep(sp2);clk+=33;god();mq160Tick(1/30,clk)}out.sp2Dead=!!sp2.dead||!enemies.includes(sp2);
  fs160Hud();out.hudTxt=(document.getElementById('fs160')||{}).textContent||'';
  // the charge refills while not spraying
  atkHeld=false;const c0=E.charge;for(let i=0;i<30;i++){clk+=33;god();mq160Tick(1/30,clk)}out.refill=+(E.charge-c0).toFixed(1);
  // C drops it
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true}));out.dropped=!E.carry&&!!E.gp&&MQ160.S.sp.parent===scene;
  // a death resets the melt
  hero.hp=0;mq160Tick(1/30,clk+=33);out.failEv=!MQ160.E;out.failSt=MQ160.st;out.spidersGone=!enemies.some(e=>e.fs160sp&&!e.dead);out.onBench=MQ160.S.sp.position.distanceTo(mq160BenchSpot())<.1;god();
  // again, to the end
  toPos(R.bench.x+G.fx*1.6,R.bench.z+G.fz*1.6);tick(.05);(worldPrompt()||{fn(){}}).fn();const E2=MQ160.E;E2.carry=1;mq160Sync();E2.melt=MQ160.melt-.2;atkHeld=true;
  for(let i=0;i<20;i++){aimAt();clk+=33;god();mq160Tick(1/30,clk)}atkHeld=false;out.st3=MQ160.st;out.evEnd=!MQ160.E;out.done=mq160Done();out.iceGone=!MQ160.S.gate.ice.visible;out.iceFree=!solid(Math.round(G.x),Math.round(G.z));
  out.spBack=MQ160.S.sp.parent!==pl;
  toPos(G.x+G.fx*2,G.z+G.fz*2);tick(.1);out.gate1=((worldPrompt()||{}).label||'');
  // saves
  const s1=x2Save();out.saved=JSON.stringify(s1.mq160);MQ160.st=0;MQ160.p=[0,0,0];x2Load(s1);out.reload=MQ160.st+'|'+MQ160.p.join('');
  const old=JSON.parse(JSON.stringify(s1));delete old.mq160;old.insr=[0,0,1,0,0,0];x2Load(old);out.oldSt=MQ160.st;out.oldDone=mq160Done();
  old.insr=[0,0,2,0,0,0];x2Load(old);out.oldReached=mq160Done();
  // a save made mid-melt: the melt is gone, the flamespitter on the bench
  const mid=JSON.parse(JSON.stringify(s1));mid.mq160={v:151,st:2,p:[1,1,1]};x2Load(mid);out.midSt=MQ160.st;out.midEv=!MQ160.E;x2Load(s1);
  // through the gate
  toPos(G.x+G.fx*2,G.z+G.fz*2);tick(.1);(worldPrompt()||{fn(){}}).fn();await wait(900);const K=curIns();out.inIII=K?K.g:-1;
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cons=[];pg.on('console',lambda m:cons.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:6000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['cacheN']==3 and r['cacheFb']==0 and r['cacheIn'],'three caches inside II, none on the fallback (%s, fb %s)'%(r['cacheN'],r['cacheFb']))
    exp(r['cacheSep']>=14,'the caches are apart (%.1f)'%r['cacheSep']);exp(5<r['benchD']<9,'the workbench stands beside the gate (%.1f)'%r['benchD'])
    exp(r['keepGate'] and not r['keepOther'],'decorations keep off the gate (II only)')
    exp(r['st0']==0 and not r['done0'],'fresh hero: chapter 2 not started')
    exp(r['built'] and r['portalHidden'],'the gate is built and the old gateway hidden')
    exp('ice' in r['gate0'],'the gate is sealed (%s)'%r['gate0']);exp(r['iceSolid'],'the ice blocks the opening')
    exp('0/3' in r['bench0'],'the workbench counts parts (%s)'%r['bench0']);exp('Recover' in r['trk0'],'tracker lists the parts (%s)'%r['trk0'])
    exp(all(g.startswith('elite ') for g in r['guards']),'every cache has an elite warden (%s)'%r['guards'])
    exp(r['takes']==['GT','GT','GT'],'guarded, then takeable once the warden falls (%s)'%r['takes'])
    exp(r['parts']=='111' and r['st1']==1 and r['fd']=='111','all three parts taken (st %s)'%r['st1'])
    exp('Assemble' in r['bench1'] and r['st2']==2 and r['spVis'],'the flamespitter is assembled on the bench (%s)'%r['bench1'])
    exp('melting' in r['bench2'],'the bench offers the melt (%s)'%r['bench2'])
    exp(r['ev'] and r['hud'],'the melt starts with its HUD');exp('cold' in r['recall'],'recall is blocked during the melt (%s)'%r['recall'])
    exp(r['carry']==1 and r['talHidden'] and r['onHero'],'C picks the flamespitter up instead of opening the Character window')
    exp(r['clamp']<=15.6,'the hero is held in the yard (%.1f)'%r['clamp'])
    exp(1.6<r['melt2']<2.2 and .3<r['heat2']<.5 and r['fire']==1,'spraying the gate melts it and heats the flamespitter (melt %s, heat %s)'%(r['melt2'],r['heat2']))
    exp(r['ovh']==1 and r['noMeltHot']==0,'5 s of spraying overheats it; no melting while hot (%s, %s)'%(r['ovh'],r['noMeltHot']))
    exp(r['cooled'],'it cools down after release')
    exp(r['spiders']>=1 and r['hunt'],'ice spiders spawn and hunt the hero (%s)'%r['spiders'])
    exp(r['spawn1']>=2,'v166: a spawn brings two or more spiders (%s)'%r['spawn1'])
    exp(16<r['spawnMax']<=r['cap']==32,'v166: up to 32 spiders alive, twice the old 16 (%s of %s)'%(r['spawnMax'],r['cap']))
    exp(r['sp1Alive'] and .3<r['sp1Frac']<.6,'v166: one charged burn is a heavy hit, not a kill (alive %s, %s hp left)'%(r['sp1Alive'],r['sp1Frac']))
    exp(r['spDead'] and r['chargeCost']==8,'the charged flame kills a spider in 2 burns for 8 charge (%s, cost %s)'%(r['spDead'],r['chargeCost']))
    exp(r['sp2Alive'] and .5<r['sp2Frac']<.75 and r['spent'],'v166: an empty charge burns lighter (alive %s, %s hp left, spent %s)'%(r['sp2Alive'],r['sp2Frac'],r['spent']))
    exp(r['sp2Dead'],'v166: with the charge empty the flame still kills spiders (the old bug: it stopped killing)')
    exp('bonus burn' in r['hudTxt'] and 'still burns' in r['hudTxt'],'v166: the HUD explains the essence charge (%s)'%r['hudTxt'][:200])
    exp(r['refill']>=3,'v166: the charge refills while not spraying (+%s)'%r['refill'])
    exp(r['dropped'],'C drops the flamespitter on the ground')
    exp(r['failEv'] and r['failSt']==2 and r['spidersGone'] and r['onBench'],'a death ends the melt, clears the spiders and puts the flamespitter back')
    exp(r['st3']==3 and r['evEnd'] and r['done'] and r['iceGone'] and r['iceFree'] and r['spBack'],'melting through opens the gate')
    exp('Through' in r['gate1'],'the gate prompt leads on (%s)'%r['gate1'])
    exp(r['reload']=='3|111','save round trip (%s)'%r['reload'])
    exp(r['oldSt']==0 and not r['oldDone'],'an old save without the field starts chapter 2 fresh');exp(r['oldReached'],'a save that reached III counts it done')
    exp(r['midSt']==2 and r['midEv'],'a mid-melt save loads assembled, no melt running')
    exp(r['inIII']==12,'the gate leads to III (ig %s)'%r['inIII'])
    if SHOT:
        pg.evaluate("""async()=>{hero.iv=1e9;const st=document.createElement('style');st.textContent='#ztc116,#glog,#mqt143,#prompt{visibility:hidden!important}';document.head.appendChild(st);
          const R=mq160Plan(),G=R.gate;MQ160.st=2;MQ160.p=[1,1,1];x2Load(Object.assign(x2Save(),{mq160:{v:151,st:2,p:[1,1,1]},insr:[0,0,1,0,0,0]}));toPos(R.bench.x+G.fx*1.6,R.bench.z+G.fz*1.6);
          for(let i=0;i<10;i++){mq160Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,30))}mq160Start();const E=MQ160.E;E.carry=1;mq160Sync();E.melt=24;
          for(let i=0;i<150;i++){toPos(G.x+G.fx*4,G.z+G.fz*4+0);pl.rotation.y=Math.atan2(G.x-pl.position.x,G.z-pl.position.z);mOn=false;atkHeld=i>100;hero.hp=heroMax();mq160Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,16))}
          camYaw=G.ry-.6;camPitch=.5;camDist=12;snapCam();await new Promise(r=>setTimeout(r,1500))}""")
        pg.screenshot(path=play.TMP+'/v160_melt.png',timeout=600000)
        pg.evaluate("""async()=>{atkHeld=false;const R=mq160Plan(),G=R.gate;camYaw=G.ry+.4;camPitch=.25;camDist=8;toPos(R.bench.x+G.fx*3,R.bench.z+G.fz*3);snapCam();await new Promise(r=>setTimeout(r,1500))}""")
        pg.screenshot(path=play.TMP+'/v160_bench.png',timeout=600000)
    for e in cons[:8]:
        if 'v151' in e or 'sv ' in e:F('console error '+e)
    for e in errs[:5]:F('page error '+e)
    print('v160 frozen gate:',len(fails),'fails')
play.run(s)
