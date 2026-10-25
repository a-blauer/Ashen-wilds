# v144: The Glowmire Crystal (Kindlelight II main quest): the sealed II gateway, the hatch on clearing the Glowmire Warren, the Seeping
# Lair (scene, boss spawn, model triangles), the fight (start, seal, recall block, every move runs without errors, Phase II flood, the
# siphon and its sacs, damage reduction, reset on a wipe), the kill, the crystal claim, the gateway opening, saves (round trip, old saves,
# III reached, a save in the lair loads at the hatch), the tracker. NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),N=()=>performance.now();let clk=N();
  const tick=sec=>{for(let i=0;i<Math.round(sec*30);i++){clk+=33;mq144Tick(1/30,clk)}};
  const god=()=>{hero.hp=heroMax();hero.iv=99};
  const ai=sec=>{const e=MQ144.e;for(let i=0;i<Math.round(sec*30);i++){clk+=33;god();if(e&&!e.dead)mb144AI(e,1/30,clk);mq144Tick(1/30,clk)}};
  out.lairName=INSL[4].n;out.lv=INSL[4].lv.join(',');
  // a fresh hero: nothing started, the II gateway sealed
  out.st0=MQ144.st;out.done0=mq144Done();const G=RPORT.find(r=>r.k=='next'&&r.ig===1);
  toPos(G.x+1.2,G.z);await wait(150);tick(.2);out.gate0=((worldPrompt()||{}).label||'');
  // the camp: furthest from II's entrance
  const C=mq144Camp();out.camp=C&&C.th?C.th.n:'';out.campIg=C?C.ig:-1;
  // clear it: the hatch opens
  toPos(C.x+3,C.z+3);await wait(200);tick(.3);out.st0b=MQ144.st;
  try{if(ROST.r===C.ig)ROST.slots.forEach(s=>{if(s.camp===C)s.dead=1})}catch(_){}C.clr=true;tick(.3);out.st1=MQ144.st;out.hatch=!!MQ144.H;
  await wait(1600);tick(.2);const h=mq144HatchSpot();toPos(h.x+1.2,h.z);tick(.2);out.hatchPrompt=((worldPrompt()||{}).label||'');
  out.lidOpen=MQ144.H?MQ144.H.hinge.rotation.x:0;
  MQ144.trkK='';mq144Trk();out.trk1=$('mqt143').textContent;
  // down into the lair: the scene, the boss
  const L=MB144L;toPos(L.ent.x,L.ent.z,0);await wait(200);tick(.3);out.inLair=mq144InLair();out.scene=!!MQ144.LS;const e=MQ144.e;out.boss=!!(e&&e.sv&&e.mb144);
  out.tris=MB144.tris;out.hp=e?M(e.c):0;out.lvl=e?e.c.l:0;out.ladPrompt=((worldPrompt()||{}).label||'');
  // the fight starts when the hero comes close
  toPos(L.home.x,L.home.z+6);ai(.3);out.fight=!!(MB144A&&MB144A.f);out.seal=MQ144.LS.seal.visible;out.agg=e.agg;
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;
  MQ144.trkK='';mq144Trk();out.trk2=$('mqt143').textContent;hud();out.hud=$('bossN').textContent;out.hudVis=!$('boss').classList.contains('hide');
  // every move runs to its end without errors (Phase II moves with S.ph 2)
  const S=e.sv,ids=Object.keys(MB144M).filter(k=>!['stagger','awaken','siphon','broken'].includes(k));out.moves=[];
  for(const id of ids){const D=MB144M[id];S.ph=(D.ph||1);e.bs.ph=S.ph;e.c.h=M(e.c);svEndMove(e,true);if(!svStart(e,id)){out.moves.push(id+':nostart');continue}
    let t=0;while(S.mv&&S.mv.id===id&&t<D.dur+1){clk+=33;god();svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}out.moves.push(id+':'+(t<=D.dur+.5?'ok':'stuck'))}
  svEndMove(e,true);S.ph=1;e.bs.ph=1;
  // Phase II: awaken floods the edge
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'awaken');let t=0;while(S.mv&&t<8){clk+=33;god();svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}out.ph2=S.ph;out.flood=MQ144.flood;
  // the siphon: three sacs, he is shielded, bursting them breaks it
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'siphon');t=0;while(S.mv&&S.mv.t<2.2&&t<4){clk+=33;god();svTickMove(e,1/30,clk);svApply(e,1/30,clk);mq144Tick(1/30,clk);t+=1/30}
  out.sacs=MQ144.sacs.length;out.dr=S.dr;const h0=e.c.h;hurt(e,1000,null,false);out.shielded=h0-e.c.h;
  MQ144.sacs.slice().forEach(s=>hurt(s,1e7,null,false));await wait(200);out.sacsLeft=MQ144.sacs.length;out.broken=S.mv?S.mv.id:'';out.drAfter=S.dr;
  svEndMove(e,true);
  // a wipe resets him
  hero.hp=0;mb144AI(e,1/30,clk+=33);out.reset=!(MB144A&&MB144A.f);out.resetHp=e.c.h===M(e.c);out.resetPh=S.ph;out.floodOff=MQ144.flood;god();
  // the kill: the shell bursts, the crystal can be claimed
  toPos(L.home.x,L.home.z+6);ai(.2);out.fight2=!!(MB144A&&MB144A.f);e.c.h=1;svEndMove(e,true);S.inv=0;S.dr=0;hurt(e,99999,null,false);out.dead=!!e.dead;out.st2=MQ144.st;
  await wait(2600);tick(.2);out.shell=MQ144.LS.shell.visible;out.sealOff=!MQ144.LS.seal.visible;
  toPos(L.dais.x,L.dais.z+2.6);tick(.2);out.claimPrompt=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();out.st3=MQ144.st;out.done=mq144Done();
  // the gateway of II wakes
  toPos(G.x+1.2,G.z);await wait(150);tick(.3);out.gate1=((worldPrompt()||{}).label||'');out.gateCr=!!MQ144.gcr;
  // saves
  const s1=x2Save();out.saved=JSON.stringify(s1.mq144);MQ144.st=0;x2Load(s1);out.reload=MQ144.st;
  const old=JSON.parse(JSON.stringify(s1));delete old.mq144;old.insr=[1,0,0,0,0,0];x2Load(old);out.oldSt=MQ144.st;out.oldDone=mq144Done();
  old.insr=[2,0,0,0,0,0];x2Load(old);out.oldReached=mq144Done();x2Load(s1);
  // a save in the lair loads at the hatch
  toPos(L.ent.x,L.ent.z);wv135Out();const J=insAt(Math.round(pl.position.x),Math.round(pl.position.z));out.outIg=J?J.g:-1;out.outD=Math.hypot(pl.position.x-h.x,pl.position.z-h.z);
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cons=[];pg.on('console',lambda m:cons.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:5000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['lairName']=='The Seeping Lair' and r['lv']=='7,7','the lair instance is renamed (%s, %s)'%(r['lairName'],r['lv']))
    exp(r['st0']==0 and not r['done0'],'fresh hero: chapter 2 not started')
    exp('sealed' in r['gate0'],'the II gateway is sealed before the crystal (%s)'%r['gate0'])
    exp(r['camp']=='Glowmire Warren' and r['campIg']==1,'the hatch camp is the Glowmire Warren in II (%s, %s)'%(r['camp'],r['campIg']))
    exp(r['st0b']==0,'no hatch before the camp is cleared');exp(r['st1']==1 and r['hatch'],'clearing the camp opens the hatch (st %s)'%r['st1'])
    exp('Descend' in r['hatchPrompt'],'hatch prompt (%s)'%r['hatchPrompt']);exp(r['lidOpen']<-1.5,'the lid falls open (%.2f)'%r['lidOpen'])
    exp('hatch' in r['trk1'],'tracker points to the hatch (%s)'%r['trk1'])
    exp(r['inLair'] and r['scene'] and r['boss'],'the lair scene and Vorraxis are built')
    exp(r['tris']>=8000,'Vorraxis is a dense model (%s tris)'%r['tris']);exp(r['lvl']==7,'Vorraxis is level 7 (%s)'%r['lvl'])
    exp('Climb' in r['ladPrompt'],'ladder prompt before the fight (%s)'%r['ladPrompt'])
    exp(r['fight'] and r['seal'] and r['agg'],'coming close starts the fight and seals the ladder')
    exp('sealed' in r['recall'],'recall is blocked mid-fight (%s)'%r['recall'])
    exp('Slay Vorraxis' in r['trk2'],'tracker during the fight (%s)'%r['trk2']);exp(r['hudVis'] and 'Vorraxis' in r['hud'],'boss bar shows (%s)'%r['hud'])
    bad=[m for m in r['moves'] if not m.endswith(':ok')];exp(not bad and len(r['moves'])>=10,'every move runs to its end (%s)'%(bad or len(r['moves'])))
    exp(r['ph2']==2 and r['flood']==1,'awaken: Phase II and the flood (ph %s, flood %s)'%(r['ph2'],r['flood']))
    exp(r['sacs']==3 and r['dr']>0 and r['shielded']<500,'siphon: 3 sacs, shielded (sacs %s, dr %s, took %s of 1000)'%(r['sacs'],r['dr'],r['shielded']))
    exp(r['sacsLeft']==0 and r['broken']=='broken','bursting the sacs breaks the siphon (%s left, move %s)'%(r['sacsLeft'],r['broken']))
    exp(r['reset'] and r['resetHp'] and r['resetPh']==1 and r['floodOff']==0,'a wipe resets him')
    exp(r['fight2'] and r['dead'] and r['st2']==2,'the kill sets state 2 (st %s)'%r['st2'])
    exp(not r['shell'] and r['sealOff'],'the shell bursts and the seal lifts')
    exp('Claim' in r['claimPrompt'] and r['st3']==3 and r['done'],'claiming the crystal (%s, st %s)'%(r['claimPrompt'],r['st3']))
    exp('sealed' not in r['gate1'] and r['gateCr'],'the II gateway wakes (%s)'%r['gate1'])
    exp(r['reload']==3,'save round trip (%s)'%r['reload'])
    exp(r['oldSt']==0 and not r['oldDone'],'an old save without the field starts chapter 2 fresh');exp(r['oldReached'],'a save that reached III counts it done')
    exp(r['outIg']==1 and r['outD']<3,'a save in the lair loads at the hatch (ig %s, %.1f away)'%(r['outIg'],r['outD']))
    if SHOT:
        pg.evaluate("""async()=>{const L=MB144L;MQ144.st=1;toPos(L.ent.x,L.ent.z,0);await new Promise(r=>setTimeout(r,800));camYaw=Math.PI;camPitch=.35;camDist=13;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v144_lair.png',timeout=600000)
    for e in cons[:5]:
        if 'v144' in e or 'mb ' in e or 'sv ' in e:F('console error '+e)
    for e in errs[:5]:F('page error '+e)
    print('v144 glowmire:',len(fails),'fails')
play.run(s)
