# v165 Searing Sands II · The Last Warden: the urns, the remains on the altar, Kheprit's waking and window, the rift defence
# (fall and retry, the rift opening, stepping through), the aftermath, the saves.  python3 v165_courtyard.py
import play,os,json
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async(step)=>{const out={},errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  window.__T=window.__T||performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f(__T);homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const T=ss165T2(),Fr=T.F,at=(a,b)=>{const [x,z]=Fr.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)};
  if(step==='urns'){at(-T.R+3,0);tick(.5);out.built=!!CY165.g;out.urns=KH165W.urns.length;out.portalHidden=RPORT.filter(r=>r.k=='next'&&r.pi===3&&r.ig===insG(3,1)).every(r=>!r.g.visible);
    out.trk=(SP152.trk.sands(curIns())||{}).name||'';
    // three blows break an urn
    const u=KH165W.urns[0];hurt(u,10,{col:0xffffff},false);hurt(u,10,{col:0xffffff},false);out.after2=!(SS165.c2.urn&1);hurt(u,10,{col:0xffffff},false);out.after3=!!(SS165.c2.urn&1);
    KH165W.urns.slice().forEach(s=>{for(let k=0;k<3;k++)hurt(s,10,{col:0xffffff},false)});tick(.2);out.broken=ss165Bits(SS165.c2.urn);out.picks=KH165W.picks.length;
    enemies.slice().forEach(e=>{if(!e.dead&&e.c&&/Scarab/.test(e.c.n))removeE(e)});
    // walk over each piece
    KH165W.picks.slice().forEach(q=>{pl.position.set(q.x,0,q.z);tick(.1)});out.got=ss165Bits(SS165.c2.got);out.errs=errs;return out}
  if(step==='lay'){at(T.altar.a-3,0);tick(.1);const p=worldPrompt()||{};out.prompt=p.label||'';if(p.fn)p.fn();tick(3);out.lay=ss165Bits(SS165.c2.lay);out.st1=SS165.c2.st;
    tick(12);const e=KH165W.e;out.st2=SS165.c2.st;out.alive=!!(e&&e.sv.alive);out.mv=e&&e.sv.mv?e.sv.mv.id:'';const [sx,sz]=Fr.W2(T.altar.a-3.9,T.altar.b+.8);out.dStand=e?+Math.hypot(e.m.position.x-sx,e.m.position.z-sz).toFixed(2):-1;
    out.tris=KH165.tris||0;pl.position.set(sx-Fr.fx*2,0,sz-Fr.fz*2);tick(.1);out.prompt2=(worldPrompt()||{}).label||'';out.errs=errs;return out}
  if(step==='talk'){kh165Talk();out.mode=xwMode;out.body=$('xwB').textContent.slice(0,60);const click=k=>{const b=$('xwF').querySelector('[data-kh165="'+k+'"]');if(!b)return false;b.click();return true};
    out.c1=click('way');out.c2=click('go');out.foot=$('xwF').textContent;out.c3=click('begin');out.mode2=xwMode;out.E=!!RF165.E;out.errs=errs;return out}
  if(step==='defend'){CHEAT.god=true;hero.hp=heroMax();const E=RF165.E;tick(8);out.go=E.go;const K=KH165W.e;out.mv=K.sv.mv?K.sv.mv.id:'';const P=rf165KhSpot();out.dK=+Math.hypot(K.m.position.x-P.x,K.m.position.z-P.z).toFixed(2);
    at(-6,0);for(let i=0;i<8;i++){tick(1.5);await wait(600)}out.cult=rf165Alive();out.forK=enemies.filter(e=>e.rf165&&!e.dead&&e.rfK).length;out.t=+E.t.toFixed(1);
    const h0=E.hp,c=enemies.find(e=>e.rf165&&!e.dead);if(c){c.rfK=1;const tg=eTarget(c,c.m,9);out.proxy=!!(tg&&tg.rf165K);hitTarget(c,tg,1)}out.dHp=+(h0-E.hp).toFixed(2);
    out.hud=!!document.getElementById('rf165H')&&document.getElementById('rf165H').style.display!='none';out.trk=JSON.stringify((SP152.trk.sands(curIns())||{}).lines||[]);out.errs=errs;return out}
  if(step==='fall'){RF165.E.hp=0;tick(.2);out.E=!!RF165.E;const K=KH165W.e;out.mv=K.sv.mv?K.sv.mv.id:'';out.st=SS165.c2.st;tick(3);out.left=rf165Alive();tick(5);out.mv2=K.sv.mv?K.sv.mv.id:'';tick(4);out.alive=K.sv.alive;
    pl.position.copy(K.m.position);pl.position.x+=1.6;tick(.1);out.prompt=(worldPrompt()||{}).label||'';out.errs=errs;return out}
  if(step==='open'){out.again=rf165Start(true);tick(4);const E=RF165.E;E.t=RF165.T-.05;tick(.5);out.esc=E.esc;out.st=SS165.c2.st;out.k=+RF165.sh.M.uniforms.k.value.toFixed(2);tick(2);out.hpDrain=+(RF165.hpM-E.hp).toFixed(1);
    at(T.rift.a,0);out.inRift=rf165In(pl.position.x,pl.position.z);tick(.2);out.st2=SS165.c2.st;out.E=!!RF165.E;await wait(1200);out.ins=curIns()?curIns().g:-1;out.errs=errs;return out}
  if(step==='after'){at(-T.R+3,0);tick(.5);out.aft=!!(RF165.aft&&RF165.aft.visible);out.dead=!!RF165.deadR;out.live=!!KH165W.e;out.urns=KH165W.urns.length;let tr=0;if(RF165.aft)RF165.aft.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;tr+=(g.index?g.index.count:g.attributes.position.count)/3}});out.tris=Math.round(tr);
    out.k=RF165.sh?+RF165.sh.M.uniforms.k.value.toFixed(2):0;out.errs=errs;return out}
  if(step==='save'){const s=x2Save();const r0=INSR[3];if(s.insr)s.insr[3]=1;out.c2=s.ss165&&s.ss165.c2;
    const q=JSON.parse(JSON.stringify(s));q.ss165.c2={st:0,urn:2047,got:0,lay:2047};x2Load(q);at(-T.R+3,0);tick(.3);out.st=SS165.c2.st;out.stand=!!(KH165W.e&&KH165W.e.sv.alive);out.aft=!!(RF165.aft&&RF165.aft.parent);
    const o=JSON.parse(JSON.stringify(s));delete o.ss165;x2Load(o);tick(.3);out.oldSt=SS165.c2.st;out.oldUrns=KH165W.urns.length;out.errs=errs;return out}
  return null}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{POST.render=()=>{}}catch(_){};hero.lvl=30;CHEAT.god=true;return 1}")
    R={}
    for st in ['urns','lay','talk','defend','fall','open','after','save']:
        r=pg.evaluate(JS,st);R[st]=r;print(st,json.dumps(r)[:900])
        if r and r.get('errs'):F(st+' errors: '+' | '.join(r['errs'][:3]))
    u=R['urns']
    if not u['built'] or u['urns']!=14:F('the court or its 14 urns did not build: %s'%u)
    if not u['portalHidden']:F('the old portal to III still shows')
    if not u['after2'] or not u['after3']:F('an urn should break on the third blow')
    if u['broken']!=14 or u['got']!=11:F('breaking every urn should give all 11 pieces: %s'%u)
    l=R['lay']
    if 'Lay' not in l['prompt'] or l['lay']!=11:F('laying the remains failed: %s'%l)
    if l['st2']!=2 or not l['alive'] or l['dStand']>.3:F('Kheprit did not wake and step down: %s'%l)
    if 'Speak' not in l['prompt2']:F('no speak prompt by Kheprit: '+l['prompt2'])
    t=R['talk']
    if t['mode']!='kh165' or not (t['c1'] and t['c2'] and t['c3']) or not t['E']:F('his window did not start the rift: %s'%t)
    d=R['defend']
    if not d['go'] or d['mv']!='chan' or d['dK']>.3:F('Kheprit did not take his place and channel: %s'%d)
    if d['cult']<3:F('the cult did not pour in (%s alive)'%d['cult'])
    if not d['proxy'] or d['dHp']<=0:F('cultists cannot hurt Kheprit: %s'%d)
    if not d['hud']:F('no Kheprit bar')
    if 'Rift' not in d['trk']:F('the tracker does not show the rift: '+d['trk'])
    f=R['fall']
    if f['E'] or f['mv']!='fall' or f['st']!=2:F('his fall did not end the defence: %s'%f)
    if f['left']!=0:F('the cult did not melt away after his fall')
    if not f['alive'] or 'Speak' not in f['prompt']:F('he did not rise to try again: %s'%f)
    o=R['open']
    if not o['again'] or o['esc']!=1 or o['st']!=3 or o['k']<.99:F('the rift did not open: %s'%o)
    if o['hpDrain']<=0:F('his health does not drain while he holds the rift')
    if not o['inRift'] or o['st2']!=4 or o['E']:F('stepping into the rift did not take the hero through: %s'%o)
    a=R['after']
    if not a['aft'] or not a['dead'] or a['live'] or a['urns']:F('the aftermath did not show: %s'%a)
    if not (8000<=a['tris']<=140000):F('aftermath triangles %s'%a['tris'])
    if a['k']<.99:F('the rift is not open in the aftermath')
    v=R['save']
    if not v['c2'] or v['c2']['st']!=4:F('chapter II was not saved: %s'%v)
    if v['st']!=2 or not v['stand'] or v['aft']:F('a laid save did not restore Kheprit standing: %s'%v)
    if v['oldSt']!=0 or v['oldUrns']!=14:F('an old save did not reset the court: %s'%v)
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
