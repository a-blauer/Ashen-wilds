# v151: The Frozen Maw (Burningeye Summit I main quest): the cave mouth replaces the I gateway, the cave (scene, Gorthrak, model
# triangles), the fight (start, seal, recall block, every move runs without errors, pillars and the dazing crash, Frostbite stacks
# and the freeze, Phase II and the falling ice, the Glacial Rampage both ways, reset on a wipe), the kill, the passage to II, saves
# (round trip, old saves, II reached, a save in the cave loads at the mouth), the tracker. NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),N=()=>performance.now();let clk=N();
  const tick=sec=>{for(let i=0;i<Math.round(sec*30);i++){clk+=33;mq151Tick(1/30,clk)}};
  const god=()=>{hero.hp=heroMax();hero.iv=99};
  const ai=sec=>{const e=MQ151.e;for(let i=0;i<Math.round(sec*30);i++){clk+=33;god();if(e&&!e.dead)gb151AI(e,1/30,clk);mq151Tick(1/30,clk)}};
  const run=(e,id,max)=>{const S=e.sv;let t=0;while(S.mv&&S.mv.id===id&&t<(max||12)){clk+=33;god();svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}return t};
  const T=INSL[insG(2,4)];out.caveName=T.n;out.lv=T.lv.join(',');
  // a fresh hero in Burningeye I: the gateway is a cave mouth
  out.st0=MQ151.st;out.done0=mq151Done();const G=mq151Gate();
  toPos(G.x+G.fx*2,G.z+G.fz*2,G.ry);await wait(150);tick(.3);out.mouth=!!MQ151.CM;out.portalHidden=!!(MQ151.rp&&!MQ151.rp.g.visible);
  out.gate0=((portalPrompt()||{}).label||'');out.solidBehind=solid(Math.round(G.x-G.fx*4),Math.round(G.z-G.fz*4));out.openThroat=!solid(Math.round(G.x),Math.round(G.z));
  MQ151.trkK='';mq151Trk();out.trk0=$('mqt143').textContent;
  // into the cave
  mq151Enter();await wait(700);tick(.3);const L=GB151L;out.inCave=mq151InCave();out.st1=MQ151.st;out.scene=!!MQ151.LS;const e=MQ151.e;out.boss=!!(e&&e.sv&&e.gb151);
  out.tris=GB151.tris;out.lvl=e?e.c.l:0;out.pillars=MQ151.pil.filter(p=>p.ok).length;
  toPos(L.mouth.x,L.mouth.z-.5);tick(.1);out.mouthPrompt=((worldPrompt()||{}).label||'');toPos(L.tunIn.x,L.tunIn.z);tick(.1);out.tunPrompt0=((worldPrompt()||{}).label||'');
  // the fight starts when the hero comes close
  toPos(L.home.x,L.home.z+6);ai(.3);out.fight=!!(GB151A&&GB151A.f);out.seal=MQ151.LS.seal.visible;out.agg=e.agg;
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;
  MQ151.trkK='';mq151Trk();out.trk2=$('mqt143').textContent;hud();out.hud=$('bossN').textContent;out.hudVis=!$('boss').classList.contains('hide');
  // every move runs to its end without errors (Phase II moves with S.ph 2)
  const S=e.sv,ids=Object.keys(GB151M).filter(k=>!['stagger','awaken','rampage','rcharge','rfail','broken','crash'].includes(k));out.moves=[];
  for(const id of ids){const D=GB151M[id];S.ph=(D.ph||1);e.bs.ph=S.ph;e.c.h=M(e.c);gb151PillarsGrow();e.m.position.set(L.cx,0,L.cz+2);e.m.rotation.y=Math.PI;toPos(L.cx,L.cz-2);svEndMove(e,true);
    if(!svStart(e,id)){out.moves.push(id+':nostart');continue}const t=run(e,id,D.dur+1);out.moves.push(id+':'+(t<=D.dur+.5?'ok':'stuck'))}
  svEndMove(e,true);S.ph=1;e.bs.ph=1;gb151PillarsGrow();
  // a charge into a pillar: it shatters and he is dazed
  {const P=MQ151.pil[0],dx=P.x-L.cx,dz=P.z-L.cz,l=Math.hypot(dx,dz);e.m.position.set(P.x-dx/l*5,0,P.z-dz/l*5);e.m.rotation.y=Math.atan2(dx,dz);toPos(P.x+dx/l*1.4,P.z+dz/l*1.4);
    svStart(e,'charge');let t=0;while(S.mv&&S.mv.id==='charge'&&t<4){clk+=33;god();toPos(P.x+dx/l*1.4,P.z+dz/l*1.4);S.mv.t<.85||(1);svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}
    out.crashMove=S.mv?S.mv.id:'';out.pillarBroken=!P.ok;out.dazed=S.stg>0;svEndMove(e,true);S.stg=0;gb151PillarsGrow();out.regrown=P.ok}
  // Frostbite: two stacks, the third freezes
  hero.iv=0;gb151FbSet(0);gb151Frost(1);gb151Frost(1);out.fb2=(hero.buffs.find(b=>String(b.n).startsWith('Frostbite'))||{}).n||'';gb151Frost(1);out.frozen=!!hero.buffs.find(b=>b.n==='Frozen Solid');out.fbAfter=GB151X.fb;god();
  // Phase II: the awakening, the falling ice
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'awaken');run(e,'awaken',8);out.ph2=S.ph;out.quake=MQ151.quake;
  // the Glacial Rampage, success: armoured, three pillar hits, shattered
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'rampage');run(e,'rampage',4);out.rp=!!S.rp;out.dr=S.dr;const h0=e.c.h;hurt(e,1000,null,false);out.armoured=h0-e.c.h;
  ai(.1);out.rcharge=S.mv?S.mv.id:'';
  for(let k=0;k<3;k++){const P=MQ151.pil.find(p=>p.ok);gb151Crash(e,P,true);run(e,'crash',4);ai(.05)}out.afterCracks=S.mv?S.mv.id:'';out.crkDr=S.dr;run(e,'broken',6);
  // the Glacial Rampage, failure: the shell holds, shelters rise, the avalanche hits whoever is outside them
  svEndMove(e,true);S.rp=null;svStart(e,'rampage');run(e,'rampage',4);S.rp.n=3;S.crk=0;ai(.1);out.failMove=S.mv?S.mv.id:'';out.shelters=MQ151.sh.length;
  let hits=0;const bh=bossHit;bossHit=(a,b)=>{hits++};const hp0=e.c.h;e.m.position.set(L.cx,0,L.cz);toPos(L.cx+2,L.cz);run(e,'rfail',6);await wait(600);bossHit=bh;out.avHits=hits;out.healed=e.c.h>hp0;
  svEndMove(e,true);S.rp=null;
  // a wipe resets him
  hero.hp=0;gb151AI(e,1/30,clk+=33);out.reset=!(GB151A&&GB151A.f);out.resetHp=e.c.h===M(e.c);out.resetPh=S.ph;out.quakeOff=MQ151.quake;god();
  // the kill: the passage opens
  toPos(L.home.x,L.home.z+6);ai(.2);out.fight2=!!(GB151A&&GB151A.f);e.c.h=1;svEndMove(e,true);S.inv=0;S.dr=0;hurt(e,99999,null,false);out.dead=!!e.dead;out.st2=MQ151.st;
  await wait(2600);tick(.2);out.wallGone=!MQ151.LS.twall.visible;out.sealOff=!MQ151.LS.seal.visible;
  toPos(L.tunIn.x,L.tunIn.z);tick(.2);out.tunPrompt=((worldPrompt()||{}).label||'');
  // saves
  const s1=x2Save();out.saved=JSON.stringify(s1.mq151);MQ151.st=0;x2Load(s1);out.reload=MQ151.st;
  const old=JSON.parse(JSON.stringify(s1));delete old.mq151;old.insr=[0,0,0,0,0,0];x2Load(old);out.oldSt=MQ151.st;out.oldDone=mq151Done();
  old.insr=[0,0,1,0,0,0];x2Load(old);out.oldReached=mq151Done();x2Load(s1);
  // a save in the cave loads at the mouth
  toPos(L.ent.x,L.ent.z);wv135Out();const J=insAt(Math.round(pl.position.x),Math.round(pl.position.z));out.outIg=J?J.g:-1;out.outD=Math.hypot(pl.position.x-G.x,pl.position.z-G.z);
  // through the passage to II
  mq151Enter();await wait(700);tick(.2);toPos(L.tunIn.x,L.tunIn.z);tick(.1);(worldPrompt()||{fn(){}}).fn();await wait(900);const K=curIns();out.inII=K?K.g:-1;out.st3=MQ151.st;out.done=mq151Done();
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cons=[];pg.on('console',lambda m:cons.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if SHOT:
        pg.evaluate("""async()=>{const G=mq151Gate();toPos(G.x+G.fx*9,G.z+G.fz*9,G.ry);for(let i=0;i<20;i++){mq151Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,30))}camYaw=G.ry;camPitch=.3;camDist=13;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v151_mouth.png',timeout=600000)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:6000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['caveName']=='The Frozen Maw' and r['lv']=='21,21','the cave instance is renamed (%s, %s)'%(r['caveName'],r['lv']))
    exp(r['st0']==0 and not r['done0'],'fresh hero: chapter 1 not started')
    exp(r['mouth'] and r['portalHidden'],'the cave mouth is built and the old gateway hidden')
    exp('ice cave' in r['gate0'],'the gateway prompt enters the cave (%s)'%r['gate0'])
    exp(r['solidBehind'] and r['openThroat'],'the rock behind the mouth is solid, the throat open')
    exp('ice cave' in r['trk0'],'tracker points to the cave (%s)'%r['trk0'])
    exp(r['inCave'] and r['scene'] and r['boss'] and r['st1']==1,'the cave scene and Gorthrak are built (st %s)'%r['st1'])
    exp(r['tris']>=12000,'Gorthrak is a dense model (%s tris)'%r['tris']);exp(r['lvl']==21,'Gorthrak is level 21 (%s)'%r['lvl'])
    exp(r['pillars']==6,'six ice pillars (%s)'%r['pillars'])
    exp('Leave' in r['mouthPrompt'],'mouth prompt before the fight (%s)'%r['mouthPrompt'])
    exp('sealed' in r['tunPrompt0'],'the passage is sealed before the kill (%s)'%r['tunPrompt0'])
    exp(r['fight'] and r['seal'] and r['agg'],'coming close starts the fight and seals the mouth')
    exp('sealed' in r['recall'],'recall is blocked mid-fight (%s)'%r['recall'])
    exp('Slay Gorthrak' in r['trk2'],'tracker during the fight (%s)'%r['trk2']);exp(r['hudVis'] and 'Gorthrak' in r['hud'],'boss bar shows (%s)'%r['hud'])
    bad=[m for m in r['moves'] if not m.endswith(':ok')];exp(not bad and len(r['moves'])>=10,'every move runs to its end (%s)'%(bad or len(r['moves'])))
    exp(r['crashMove']=='crash' and r['pillarBroken'] and r['dazed'],'a charge into a pillar breaks it and dazes him (%s)'%r['crashMove'])
    exp(r['regrown'],'pillars grow back')
    exp(r['fb2']=='Frostbite 2/3' and r['frozen'] and r['fbAfter']==0,'Frostbite stacks and freezes on the third (%s, frozen %s)'%(r['fb2'],r['frozen']))
    exp(r['ph2']==2 and r['quake']==1,'awaken: Phase II and the falling ice (ph %s, quake %s)'%(r['ph2'],r['quake']))
    exp(r['rp'] and r['dr']>0 and r['armoured']<300,'rampage: armoured (dr %s, took %s of 1000)'%(r['dr'],r['armoured']))
    exp(r['rcharge']=='rcharge','the rampage charges (%s)'%r['rcharge'])
    exp(r['afterCracks']=='broken' and r['crkDr']==0,'three pillar hits shatter the shell (%s, dr %s)'%(r['afterCracks'],r['crkDr']))
    exp(r['failMove']=='rfail' and r['shelters']==3,'the shell holds: shelters rise (%s, %s)'%(r['failMove'],r['shelters']))
    exp(r['avHits']>=1 and r['healed'],'the avalanche hits outside the shelters and he heals (hits %s, healed %s)'%(r['avHits'],r['healed']))
    exp(r['reset'] and r['resetHp'] and r['resetPh']==1 and r['quakeOff']==0,'a wipe resets him')
    exp(r['fight2'] and r['dead'] and r['st2']==2,'the kill sets state 2 (st %s)'%r['st2'])
    exp(r['wallGone'] and r['sealOff'],'the ice over the passage bursts and the seal lifts')
    exp('passage' in r['tunPrompt'] and 'sealed' not in r['tunPrompt'],'the passage prompt (%s)'%r['tunPrompt'])
    exp(r['reload']==2,'save round trip (%s)'%r['reload'])
    exp(r['oldSt']==0 and not r['oldDone'],'an old save without the field starts chapter 1 fresh');exp(r['oldReached'],'a save that reached II counts it done')
    exp(r['outIg']==10 and r['outD']<5,'a save in the cave loads at the cave mouth (ig %s, %.1f away)'%(r['outIg'],r['outD']))
    exp(r['inII']==11 and r['st3']==3 and r['done'],'the passage leads to II (ig %s, st %s)'%(r['inII'],r['st3']))
    if SHOT:
        pg.evaluate("""async()=>{const L=GB151L;MQ151.st=1;if(MQ151.e&&MQ151.e.dead){try{removeE(MQ151.e)}catch(_){}MQ151.e=null}toPos(L.ent.x,L.ent.z,0);await new Promise(r=>setTimeout(r,800));for(let i=0;i<20;i++){mq151Tick(1/30,performance.now());await new Promise(r=>setTimeout(r,30))}camYaw=0;camPitch=.35;camDist=14;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v151_cave.png',timeout=600000)
        pg.evaluate("""async()=>{const L=GB151L;toPos(L.home.x+1,L.home.z+5.5,0);camYaw=-.4;camPitch=.22;camDist=9;snapCam();await new Promise(r=>setTimeout(r,2000))}""")
        pg.screenshot(path=play.TMP+'/v151_troll.png',timeout=600000)
    for e in cons[:8]:
        if 'v151' in e or 'gb ' in e or 'sv ' in e:F('console error '+e)
    for e in errs[:5]:F('page error '+e)
    print('v151 frozen maw:',len(fails),'fails')
play.run(s)
