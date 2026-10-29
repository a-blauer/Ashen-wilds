# v151: The Frozen Maw (Burningeye Summit I main quest): the cave mouth replaces the I gateway, the cave (scene, Gorthrak, model
# triangles), the fight (start, seal, recall block, every move runs without errors, Frostbite stacks and the freeze, Phase II and the
# falling ice, reset on a wipe), v168 Rimelock (no pillars; a missed charge skids and leaves him stuck, hits from behind x1.5; the
# Glacier Shell: armoured, leaps onto the marked spot, two hits on his back crack the shell, three cracks shatter it at once, a leap
# dodged or not, the fail with shelters and the avalanche), v168 the cave openings (no scenery inside the passages, the throat
# clear), the kill, the passage to II, saves (round trip, old saves, II reached, a save in the cave loads at the mouth), the tracker.
# NOSHOT=1 skips the pictures.
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
  out.tris=GB151.tris;out.lvl=e?e.c.l:0;out.pillars=(MQ151.pil?MQ151.pil.length:0)+(MQ151.LS.pil?MQ151.LS.pil.length:0)+(typeof gb151PillarAt=='function'?1:0);
  // v168: the openings: the passage at the back, the way out and the outside mouth have nothing standing in them
  {const inside=(C)=>{C.g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(C.g.matrixWorld).invert(),m=new THREE.Matrix4(),p=new THREE.Vector3(),sc=new THREE.Vector3(),q=new THREE.Quaternion(),L2=[];
      WD.ms.forEach(M=>{if(!M.isInstancedMesh)return;for(let j=0;j<M.count;j++){M.getMatrixAt(j,m);m.decompose(p,q,sc);if(sc.x===0)continue;const l=p.clone().applyMatrix4(inv);if(l.z<-C.o.D+.3||l.z>.5)continue;const S=gb168Sec(C.o,l.z);if(Math.abs(l.x-S.x)<S.W-.3)L2.push([+l.x.toFixed(1),+l.z.toFixed(1)])}});return L2};
    out.inTun=inside(MQ151.LS.tunC);out.inExit=inside(MQ151.LS.mouthC);out.inMouth=inside(MQ151.CM.C);out.caveTris=GB168.tris;
    // the throat of the outside mouth: no rock vertex inside the walkway (the shape of the opening, out to 1.5 in front)
    let bad=0;MQ151.CM.C.g.traverse(o=>{if(!o.isMesh||!o.geometry.index||o.material!==gb168Mats().rock)return;const P=o.geometry.attributes.position,I=o.geometry.index.array;for(let i=0;i<I.length;i++){const k=I[i],x=P.getX(k),y=P.getY(k),z=P.getZ(k);if(z<1.5&&z>-8&&y>.05&&y<2.6&&Math.abs(x-gb168Sec(MQ151.CM.C.o,z).x)<1.5)bad++}});out.throatBad=bad}
  toPos(L.mouth.x,L.mouth.z-.5);tick(.1);out.mouthPrompt=((worldPrompt()||{}).label||'');toPos(L.tunIn.x,L.tunIn.z);tick(.1);out.tunPrompt0=((worldPrompt()||{}).label||'');
  // the fight starts when the hero comes close
  toPos(L.home.x,L.home.z+6);ai(.3);out.fight=!!(GB151A&&GB151A.f);out.seal=MQ151.LS.seal.visible;out.agg=e.agg;
  let msg='';const s0=say;say=m=>{msg=String(m)};doRecall();say=s0;out.recall=msg;
  MQ151.trkK='';mq151Trk();out.trk2=$('mqt143').textContent;hud();out.hud=$('bossN').textContent;out.hudVis=!$('boss').classList.contains('hide');
  // every move runs to its end without errors (Phase II moves with S.ph 2)
  const S=e.sv,ids=Object.keys(GB151M).filter(k=>!['stagger','awaken','rampage','rleap','rfail','broken','skid'].includes(k));out.moves=[];
  for(const id of ids){const D=GB151M[id];S.ph=(D.ph||1);e.bs.ph=S.ph;e.c.h=M(e.c);e.m.position.set(L.cx,0,L.cz+2);e.m.rotation.y=Math.PI;toPos(L.cx,L.cz-2);svEndMove(e,true);
    if(!svStart(e,id)){out.moves.push(id+':nostart');continue}const t=run(e,id,D.dur+1);out.moves.push(id+':'+(t<=D.dur+.5?'ok':'stuck'))}
  svEndMove(e,true);S.ph=1;e.bs.ph=1;
  // v168 a Glacier Charge that misses: he skids, his maul in the floor (Rimelock): hits from behind x1.5, from the front not
  {e.m.position.set(L.cx,0,L.cz-6);e.m.rotation.y=0;toPos(L.cx,L.cz+1);svStart(e,'charge');let t=0;while(S.mv&&S.mv.id==='charge'&&t<4){clk+=33;god();toPos(S.mv.t<.6?L.cx:L.cx+5,L.cz+1);svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}
    out.skid=S.mv?S.mv.id:'';out.skidRlk=!!(S.rlk&&!S.rlk.ramp);const m=e.m,a=m.rotation.y;S.dr=0;S.inv=0;
    toPos(m.position.x-Math.sin(a)*3,m.position.z-Math.cos(a)*3);out.behind=gb151Behind(e);let h0=e.c.h;hurt(e,100,null,false);out.backDmg=h0-e.c.h;
    toPos(m.position.x+Math.sin(a)*3,m.position.z+Math.cos(a)*3);out.front=gb151Behind(e);h0=e.c.h;hurt(e,100,null,false);out.frontDmg=h0-e.c.h;
    run(e,'skid',4);out.skidEnd=!S.rlk;e.c.h=M(e.c);
    // a charge that runs into you: no skid
    e.m.position.set(L.cx,0,L.cz-6);e.m.rotation.y=0;toPos(L.cx,L.cz-1);svStart(e,'charge');t=0;let hits=0;const bh=bossHit;bossHit=(a,b)=>{hits++};
    while(S.mv&&S.mv.id==='charge'&&t<4){clk+=33;god();svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}bossHit=bh;out.chargeHit=hits;out.noSkid=!(S.mv&&S.mv.id==='skid');svEndMove(e,true);S.rlk=null}
  // Frostbite: two stacks, the third freezes
  hero.iv=0;gb151FbSet(0);gb151Frost(1);gb151Frost(1);out.fb2=(hero.buffs.find(b=>String(b.n).startsWith('Frostbite'))||{}).n||'';gb151Frost(1);out.frozen=!!hero.buffs.find(b=>b.n==='Frozen Solid');out.fbAfter=GB151X.fb;god();
  // Phase II: the awakening, the falling ice
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'awaken');run(e,'awaken',8);out.ph2=S.ph;out.quake=MQ151.quake;
  // v168 the Glacier Shell, success: armoured; each leap lands on the spot marked when he locks on; while Rimelocked two hits on his
  // back crack the shell (a hit from the front does not; hits closer together than .22 s count once); the third crack shatters it at once
  e.c.h=Math.round(M(e.c)*.5);svStart(e,'rampage');run(e,'rampage',4);out.rp=!!S.rp;out.dr=S.dr;const h0=e.c.h;hurt(e,1000,null,false);out.armoured=h0-e.c.h;
  e.m.position.set(L.cx,0,L.cz-4);e.m.rotation.y=0;toPos(L.cx+1,L.cz+2);ai(.1);out.rleap=S.mv?S.mv.id:'';
  {let hits=0;const bh=bossHit;bossHit=(a,b)=>{hits++};const lp=[];out.cracks=[];out.leaps=[];
    for(let k=0;k<3;k++){if(!S.mv||S.mv.id!=='rleap'){out.leaps.push('no leap '+(S.mv&&S.mv.id));break}
      const spot={x:L.cx+(k-1)*3,z:L.cz+1.5};hits=0;let t=0;while(S.mv&&S.mv.id==='rleap'&&S.mv.t<1.66&&t<3){clk+=33;god();toPos(spot.x,spot.z);svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}
      const d=Math.hypot(e.m.position.x-spot.x,e.m.position.z-spot.z);out.leaps.push([+d.toFixed(2),hits,!!(S.rlk&&S.rlk.ramp)]);
      const m=e.m,a=m.rotation.y;S.inv=0;toPos(m.position.x+Math.sin(a)*3,m.position.z+Math.cos(a)*3);hurt(e,50,null,false);const fr=S.rlk?S.rlk.h:-1;
      toPos(m.position.x-Math.sin(a)*3,m.position.z-Math.cos(a)*3);hurt(e,50,null,false);hurt(e,50,null,false);const quick=S.rlk?S.rlk.h:-1;await wait(260);hurt(e,50,null,false);
      out.cracks.push([fr,quick,S.crk,S.mv?S.mv.id:'']);if(S.mv&&S.mv.id==='rleap')run(e,'rleap',5);ai(.05)}
    bossHit=bh}
  out.afterCracks=S.mv?S.mv.id:'';out.crkDr=S.dr;run(e,'broken',6);
  // a leap dodged: out of the ring after he locks on, the landing misses
  svEndMove(e,true);S.rp={n:1,hit:0};S.crk=0;S.dr=.15;e.m.position.set(L.cx,0,L.cz-4);e.m.rotation.y=0;toPos(L.cx,L.cz+1);svStart(e,'rleap');
  {let hits=0;const bh=bossHit;bossHit=(a,b)=>{hits++};let t=0;while(S.mv&&S.mv.id==='rleap'&&S.mv.t<1.7&&t<3){clk+=33;god();if(S.mv.t>.7)toPos(L.cx+5.5,L.cz+1);svTickMove(e,1/30,clk);svApply(e,1/30,clk);t+=1/30}bossHit=bh;out.dodged=hits}
  svEndMove(e,true);S.rlk=null;
  // the Glacial Rampage, failure: the shell holds, shelters rise, the avalanche hits whoever is outside them
  svEndMove(e,true);S.rp=null;svStart(e,'rampage');run(e,'rampage',4);S.rp.n=3;S.crk=1;ai(.1);out.failMove=S.mv?S.mv.id:'';out.shelters=MQ151.sh.length;
  let hits=0;const bh=bossHit;bossHit=(a,b)=>{hits++};const hp0=e.c.h;e.m.position.set(L.cx,0,L.cz);toPos(L.cx+2,L.cz);run(e,'rfail',6);hero.iv=0;await wait(600);bossHit=bh;out.avHits=hits;out.healed=e.c.h>hp0;
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
    exp(r['pillars']==0,'v168: no ice pillars (%s)'%r['pillars'])
    exp(not r['inTun'] and not r['inExit'] and not r['inMouth'],'v168: no scenery inside the cave passages (%s)'%json.dumps([r['inTun'],r['inExit'],r['inMouth']]))
    exp(r['throatBad']==0,'v168: no rock inside the outside mouth\'s walkway (%s vertices)'%r['throatBad'])
    exp(r['caveTris']>5000,'v168: the cave openings are built (%s tris)'%r['caveTris'])
    exp('Leave' in r['mouthPrompt'],'mouth prompt before the fight (%s)'%r['mouthPrompt'])
    exp('sealed' in r['tunPrompt0'],'the passage is sealed before the kill (%s)'%r['tunPrompt0'])
    exp(r['fight'] and r['seal'] and r['agg'],'coming close starts the fight and seals the mouth')
    exp('sealed' in r['recall'],'recall is blocked mid-fight (%s)'%r['recall'])
    exp('Slay Gorthrak' in r['trk2'],'tracker during the fight (%s)'%r['trk2']);exp(r['hudVis'] and 'Gorthrak' in r['hud'],'boss bar shows (%s)'%r['hud'])
    bad=[m for m in r['moves'] if not m.endswith(':ok')];exp(not bad and len(r['moves'])>=10,'every move runs to its end (%s)'%(bad or len(r['moves'])))
    exp(r['skid']=='skid' and r['skidRlk'],'v168: a missed charge skids and leaves him stuck (%s, rimelock %s)'%(r['skid'],r['skidRlk']))
    exp(r['behind'] and not r['front'],'v168: behind / in front is judged from his facing')
    exp(r['frontDmg']>0 and abs(r['backDmg']/r['frontDmg']-1.5)<.08,'v168: stuck, hits from behind deal x1.5, from the front x1 (%s, %s)'%(r['backDmg'],r['frontDmg']))
    exp(r['skidEnd'],'v168: the window closes when the skid ends')
    exp(r['chargeHit']>=1 and r['noSkid'],'v168: a charge that runs into you does not skid (hits %s)'%r['chargeHit'])
    exp(r['fb2']=='Frostbite 2/3' and r['frozen'] and r['fbAfter']==0,'Frostbite stacks and freezes on the third (%s, frozen %s)'%(r['fb2'],r['frozen']))
    exp(r['ph2']==2 and r['quake']==1,'awaken: Phase II and the falling ice (ph %s, quake %s)'%(r['ph2'],r['quake']))
    exp(r['rp'] and r['dr']>0 and r['armoured']<300,'rampage: armoured (dr %s, took %s of 1000)'%(r['dr'],r['armoured']))
    exp(r['rleap']=='rleap','v168: the Glacier Shell leaps (%s)'%r['rleap'])
    lp=r['leaps'];exp(len(lp)==3 and all(isinstance(x,list) and x[0]<1.2 and x[1]>=1 and x[2] for x in lp),'v168: each leap lands on the marked spot, hits who stays there, and Rimelocks him (%s)'%json.dumps(lp))
    ck=r['cracks'];exp(len(ck)==3 and all(c[0]==0 and c[1]==1 for c in ck) and [c[2] for c in ck][:2]==[1,2] and ck[2][3]=='broken','v168: two hits on his back crack the shell (front and too-quick hits do not count) (%s)'%json.dumps(ck))
    exp(r['afterCracks']=='broken' and r['crkDr']==0 and ck and ck[-1][3]=='broken','v168: the third crack shatters the shell at once (%s, dr %s)'%(r['afterCracks'],r['crkDr']))
    exp(r['dodged']==0,'v168: a leap dodged after he locks on misses (%s hits)'%r['dodged'])
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
