# v205 The Citadel I · The Unsealing: the Great Gate (built, solid, portal hidden), Cheddar (talk, the four keys: drops, pickup, the
# bag, giving them), the unbinding (Cheddar walks to his circle and casts, the court spawns, the proxy hits him, siphons stall the seal,
# the eclipse darkens the sky, mist stalkers, the Gate-Breaker can be interrupted, Nightwing dives, rings break), his fall and the
# retry, the win (the seal shatters, the doors open, the prompt takes you to II), the saves.   python3 v205_unsealing.py
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));const F=cq205F(0),at=(a,b)=>{const [x,z]=F.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)};
  const eTickAll=sec=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;homeTick(1/30,__T);enemies.slice().forEach(e=>{if(!e.dead&&e.us205)try{if(!eTick(e,1/30,__T)){const tg=eTarget(e,e.m,9);}}catch(_){}});try{kqFxTick(1/30)}catch(_){}}};
  if(step==='gate'){at(0,0);tick(1);const G=GG205.S;out.built=!!G;out.portalHidden=RPORT.filter(r=>r.k=='next'&&r.ig===insG(5,0)).every(r=>!r.g.visible);
    let tr=0;G.g.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;tr+=(g.index?g.index.count:g.attributes.position.count)/3}});out.tris=Math.round(tr);out.cleared=G.cleared|0;
    const [dx,dz]=cq205GW(G.spot,0,G.dims.fz-.8);out.doorSolid=CBLK.has(Math.round(dz)*W+Math.round(dx));out.rings=gg205RingsUp();
    at(F.reach-4,0);tick(.2);out.prompt=(worldPrompt()||{}).label||'';out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);out.cheddar=!!CH205.C;out.errs=errs;return out}
  if(step==='talk'){const g=CH205.g.position;toPos(g.x+1.5,g.z);tick(.2);const p=worldPrompt()||{};out.prompt=p.label||'';if(p.fn)p.fn();out.mode=xwMode;out.st=CQ205.c1.st;
    const click=k=>{const b=$('xwF').querySelector('[data-ch205="'+k+'"]');if(!b)return false;b.click();return true};out.c1=click('seal');out.c2=click('go');closeX();
    out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);out.errs=errs;return out}
  if(step==='keys'){// a kill of each kind drops its key (forced chance), walking over it takes it
    const d0=CH205.drop;CH205.drop=1;const got=[];['vamp','bloodbat','vampk','vampm'].forEach((k,i)=>{at(-4+i*2,-3);const e=spawnEnemy(k,pl.position.x+2,pl.position.z,45,{});e.c.h=1;try{hurt(e,99999,{col:0xffffff},false)}catch(err){errs.push(String(err))}tick(.1)});
    CH205.drop=d0;out.drops=drops.filter(d=>d.kind=='cq205').length;out.again=ch205Need(0);
    for(const d of drops.filter(d=>d.kind=='cq205').slice()){pl.position.set(d.g.position.x,0,d.g.position.z);for(let i=0;i<20&&drops.includes(d);i++)await wait(150)}out.ing=CQ205.c1.ing;out.bag=/Grave Ash/.test(kqmMatTab());
    out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);const g=CH205.g.position;toPos(g.x+1.5,g.z);tick(.2);out.prompt=(worldPrompt()||{}).label||'';
    ch205Talk();const b=$('xwF').querySelector('[data-ch205="give"]');out.give=!!b;if(b)b.click();out.st=CQ205.c1.st;out.lit=CH205.brz.filter(q=>q.ing.visible).length;closeX();out.errs=errs;return out}
  if(step==='start'){CHEAT.god=true;hero.hp=heroMax();ch205Talk();const b=$('xwF').querySelector('[data-ch205="begin"]');out.begin=!!b;if(b)b.click();const E=US205.E;out.E=!!E;
    tick(6);out.go=E&&E.go;out.pose=CH205.pose;const c=ch205Spots().circ;out.dC=+Math.hypot(CH205.g.position.x-c.x,CH205.g.position.z-c.z).toFixed(2);out.dark=+US205.dk.toFixed(2);out.moon=!!(US205.moon&&US205.moon.g.visible);
    at(F.reach-9,-5);for(let i=0;i<6;i++){tick(1.2);await wait(400)}out.court=us205Alive();out.forC=enemies.filter(e=>e.us205&&!e.dead&&e.usK).length;
    const h0=E.hp,s=enemies.find(e=>e.us205&&!e.dead);if(s){s.usK=1;const tg=eTarget(s,s.m,9);out.proxy=!!(tg&&tg.us205K);hitTarget(s,tg,1)}out.dHp=+(h0-E.hp).toFixed(2);
    out.hud=!!document.getElementById('us205H')&&document.getElementById('us205H').style.display!='none';out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);out.t=+E.t.toFixed(1);out.errs=errs;return out}
  if(step==='siph'){const E=US205.E;E.hp=US205.hpM;E.t=US205.T*.3;tick(.2);const s=us205Spawn('siph');out.siph=!!s;s.usS.to={x:s.m.position.x,z:s.m.position.z};eTickAll(.5);out.st=s.usS.st;tick(.2);out.siN=E.siN;out.teth=US205T.length;
    const t0=E.t,h0=E.hp;tick(2);out.stall=+(E.t-t0).toFixed(2);out.drain=+(h0-E.hp).toFixed(2);hurt(s,1e9,{col:0xffffff},false);tick(.3);out.siN2=E.siN;out.teth2=US205T.filter(t=>t.m.visible).length;const t1=E.t;tick(1);out.go2=+(E.t-t1).toFixed(2);
    out.rings=gg205RingsUp();out.errs=errs;return out}
  if(step==='eclipse'){const E=US205.E;E.t=US205.T*.52;tick(3);out.ecl=E.ecl;out.dk=+US205.dk.toFixed(2);out.moonEc=+US205.moon.ec.toFixed(2);out.rings=gg205RingsUp();
    const m=us205Spawn('mist');out.mist=!!m;out.hidden=m&&!m.m.visible;const h=m.c.h;hurt(m,10,{col:0xffffff},false);out.untouch=m.c.h===h;const kk=enemies.filter(e=>e.us205&&e!==m);kk.forEach(e=>removeE(e));US205.E.sp=99;const c=us205C();out.d0=+Math.hypot(m.m.position.x-c.x,m.m.position.z-c.z).toFixed(1);eTickAll(5.5);out.mt=+m.usM.t.toFixed(2);out.d1=+Math.hypot(m.m.position.x-c.x,m.m.position.z-c.z).toFixed(1);out.mst=m.usM.st;out.vis=m.m.visible;out.errs=errs;return out}
  if(step==='breaker'){const E=US205.E;E.hp=US205.hpM;E.t=US205.T*.76;tick(.5);let b=enemies.find(e=>e.us205==='brk'&&!e.dead);out.brk=!!b;if(!b){b=us205Spawn('brk')}
    const c=us205C();b.m.position.set(c.x+2,0,c.z);b.usB.cd=0;eTickAll(.2);out.wind=b.usB.st;const h0=b.c.h;hurt(b,Math.ceil(M(b.c)*.2),{col:0xffffff},false);eTickAll(.1);out.reel=b.usB.st;
    b.usB.st='march';b.usB.cd=0;b.m.position.set(c.x+2,0,c.z);eTickAll(.2);const hp0=E.hp;eTickAll(2.4);out.hitC=+(hp0-E.hp).toFixed(1);out.rings=gg205RingsUp();out.errs=errs;return out}
  if(step==='dive'){const E=US205.E;enemies.filter(e=>e.us205).forEach(e=>removeE(e));E.sp=99;E.hp=US205.hpM;E.t=US205.T*.85;E.dive=null;us205Dive();const l=E.dive.lanes[0];toPos(l.x+Math.sin(l.a)*l.len*.5,l.z+Math.cos(l.a)*l.len*.5);const h0=E.hp,hh=hero.hp;CHEAT.god=false;hero.hp=heroMax();tick(2.3);out.shield=+(E.hp-h0).toFixed(1);CHEAT.god=true;
    E.dive=null;us205Dive();at(-8,0);const h1=E.hp;tick(2.3);out.noShield=+(h1-E.hp).toFixed(1);out.errs=errs;return out}
  if(step==='fall'){const E=US205.E;E.hp=0;tick(.3);out.E=!!US205.E;out.pose=CH205.pose;out.rings=gg205RingsUp();out.st=CQ205.c1.st;tick(3);out.left=us205Alive();tick(5);out.pose2=CH205.pose;
    ch205Talk();out.again=!!$('xwF').querySelector('[data-ch205="begin"]');closeX();out.errs=errs;return out}
  if(step==='win'){out.start=us205Start(true);tick(6);US205.E.t=US205.T-.05;tick(.5);out.E=!!US205.E;out.st=CQ205.c1.st;tick(7);out.open=GG205.S.open;out.doorRot=+GG205.S.doors[0].rotation.y.toFixed(2);
    out.seal=GG205.S.seal.g.visible;at(F.reach-3,0);tick(.2);const p=worldPrompt()||{};out.prompt=p.label||'';tick(8);out.dk=+US205.dk.toFixed(2);out.trk=JSON.stringify((SP152.trk.citadel(curIns())||{}).lines||[]);
    if(p.fn)p.fn();await wait(1500);out.ins=curIns()?curIns().g:-1;out.st2=CQ205.c1.st;out.errs=errs;return out}
  if(step==='save'){const s=x2Save();out.c1=s.cq205&&s.cq205.c1;const q=JSON.parse(JSON.stringify(s));q.cq205.c1={st:2,ing:0,fd:1};if(q.insr)q.insr[5]=0;INSR[5]=0;x2Load(q);at(0,0);tick(.5);out.st=CQ205.c1.st;out.open=GG205.S.open;out.lit=CH205.brz.filter(b=>b.ing.visible).length;
    const o=JSON.parse(JSON.stringify(s));delete o.cq205;x2Load(o);tick(.3);out.oldSt=CQ205.c1.st;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=45;CHEAT.god=true;return 1}")
    R={}
    for st in ['gate','talk','keys','start','siph','eclipse','breaker','dive','fall','win','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:1100])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    g=R['gate']
    if not g['built'] or not g['portalHidden']:F('the gate did not build or the old portal shows: %s'%g)
    if not (8000<=g['tris']<=90000):F('gate triangles %s'%g['tris'])
    if not g['doorSolid'] or g['rings']!=4:F('the sealed doorway is not solid / rings: %s'%g)
    if 'sealed' not in g['prompt']:F('no sealed prompt at the gate: '+g['prompt'])
    if not g['cheddar']:F('Cheddar was not built')
    t=R['talk']
    if 'Cheddar' not in t['prompt'] or t['mode']!='ch205' or t['st']!=1 or not t['c1'] or not t['c2']:F('talking to Cheddar failed: %s'%t)
    if 'Ingredients' not in t['trk']:F('the tracker does not list the keys: '+t['trk'])
    k=R['keys']
    if k['drops']!=4 or k['again']:F('each kind should drop its key once: %s'%k)
    if k['ing']!=15 or not k['bag']:F('taking the keys failed: %s'%k)
    if not k['give'] or k['st']!=2 or k['lit']!=4:F('giving the keys failed: %s'%k)
    st=R['start']
    if not st['begin'] or not st['E'] or not st['go'] or st['pose']!='cast' or st['dC']>.2:F('Cheddar did not take his circle and cast: %s'%st)
    if st['dark']<.3 or not st['moon']:F('the sky did not darken / no moon: %s'%st)
    if st['court']<3:F('the court did not come (%s)'%st['court'])
    if not st['proxy'] or st['dHp']<=0:F('the court cannot hurt Cheddar: %s'%st)
    if not st['hud'] or 'Protect Cheddar' not in st['trk']:F('no HUD / tracker for the unbinding: %s'%st)
    sp=R['siph']
    if not sp['siph'] or sp['st']!='drain' or sp['siN']!=1 or sp['teth']!=1:F('the siphon did not tether Cheddar: %s'%sp)
    if sp['stall']>.01 or sp['drain']<=0:F('the siphon did not stall the seal / drain him: %s'%sp)
    if sp['siN2']!=0 or sp['go2']<.9:F('killing the siphoner did not free the seal: %s'%sp)
    if sp['rings']!=3:F('the first ring did not break at 25%%: %s'%sp)
    ec=R['eclipse']
    if ec['ecl']!=1 or ec['dk']<.8 or ec['moonEc']<.5:F('the eclipse did not darken: %s'%ec)
    if not ec['mist'] or not ec['hidden'] or not ec['untouch'] or ec['mst']!='hunt' or not ec['vis']:F('the mist stalker did not work: %s'%ec)
    b=R['breaker']
    if b['wind']!='wind' or b['reel']!='reel':F('the Gate-Breaker cannot be interrupted: %s'%b)
    if b['hitC']<15:F('the Gate-Breaker’s blow did not land on Cheddar: %s'%b)
    d=R['dive']
    if d['shield']<0 or d['noShield']<5:F('Nightwing dives: shielding / not shielding wrong: %s'%d)
    f=R['fall']
    if f['E'] or f['pose']!='down' or f['rings']!=4 or f['st']!=2:F('his fall did not end it and reseal: %s'%f)
    if f['left']!=0 or f['pose2']=='down' or not f['again']:F('the court did not melt / he did not rise to retry: %s'%f)
    w=R['win']
    if not w['start'] or w['E'] or w['st']!=3:F('the win did not register: %s'%w)
    if w['open']!=1 or w['doorRot']<1.2 or w['seal']:F('the doors did not open: %s'%w)
    if 'Pass through' not in w['prompt']:F('no prompt through the open gate: '+w['prompt'])
    if w['dk']>.1:F('the light did not come back: %s'%w)
    if w['ins']!=26 or w['st2']!=4:F('the gate did not take the hero to II: %s'%w)
    v=R['save']
    if not v['c1'] or v['c1']['st']!=4:F('chapter I was not saved: %s'%v)
    if v['st']!=2 or v['open']!=0 or v['lit']!=4:F('a ready save did not restore the bowls and the seal: %s'%v)
    if v['oldSt']!=0:F('an old save did not reset the chapter: %s'%v)
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
