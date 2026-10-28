# v157: Abeksi alive (3191) and the assassin's knife / the roused city (3192).
#  City life: the folk are built, deterministic (the same plan on every load), off the solid tiles, the flames sit on their torches
#  (no floating), the torches that stood in walls are sconces now. Knife: the prompt shows only close behind a calm Abeksi; the kill
#  is silent when nobody sees it, and a witness raises the alarm; a body found by a calm guard makes it come to look (no alarm).
#  Alarm: crouch off, the stealth HUD hidden, fighting allowed, residents become the game's enemies (capped, nearest first), the
#  v158: the bell calls hunters who run in through the streets and join the fight; the gate is open during the alarm (no need to kill
#  everyone) and leads to Hillside Crest II; a death in the alarm
#  brings the city back calm at the last checkpoint with every resident alive.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;if(f)f(T);homeTick(1/30,T)}};
  const I=INSL[30],W2=(u,v)=>[I.x0+u,I.y0+v];
  AB152Q.st=1;ab152Enter();await wait(900);tick(.5);const S=AB152.S,H=AB152H,G=S.G;
  // ---- city life ----
  const Q=AB157.S;out.folk=Q.folk.length;out.res=ab157Res().length;out.plan=JSON.stringify(ab152Plan().F.map(f=>[f[1],f[2],f[3],f[4]])).length;
  out.inSolid=Q.folk.filter(a=>!a.o.roofH&&!a.o.seat&&G.sol[Math.round(a.v)*G.W+Math.round(a.u)]&&!/feast|sit|Sit|drum|flute|kneel/.test(a.pose)).map(a=>a.id+':'+a.pose);
  out.flutes=Q.flutes.length;out.walls=Q.walls.length;
  // flames: every flame's lowest point sits on its torch / sconce (not above it)
  out.flameGap=0;S.anim.forEach(q=>{if(q.k!='flame')return;for(let i=0;i<30;i++){T+=33;homeTick(1/30,T)}const m=q.m;m.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(m),p=new THREE.Vector3();
    m.getWorldPosition(p);out.flameGap=Math.max(out.flameGap,+(b.min.y-p.y).toFixed(3))});
  // ---- the knife: the prompt only from behind, close, and while unsuspected ----
  S.acts.forEach(ab152ResetActor);const a2=S.acts.find(a=>a.id=='a2');
  const stand=(a,d)=>{const yw=a.yaw,[x,z]=W2(a.u-Math.sin(yw)*d,a.v-Math.cos(yw)*d);toPos(x,z);tick(.1)};
  stand(a2,1.2);out.pBehind=(worldPrompt()||{}).label||'';stand(a2,-1.2);out.pFront=(worldPrompt()||{}).label||'';stand(a2,2.6);out.pFar=(worldPrompt()||{}).label||'';
  a2.sus=40;stand(a2,1.2);out.pSusp=(worldPrompt()||{}).label||'';a2.sus=0;a2.st='routine';
  stand(a2,1.2);const p=worldPrompt();if(p)p.fn();tick(.1);await wait(450);tick(.1);await wait(400);tick(.4);
  out.dead=!!a2.dead;out.silent=!H.cau&&!AB157A.on;out.body=AB157A.bodies.length;
  // a body found: a calm guard who comes upon it walks over to look (no alarm)
  {const [x,z]=W2(14,10);toPos(x,z)}const a1=S.acts.find(a=>a.id=='a1');a1.u=a2.u+4;a1.v=a2.v;a1.home={u:a1.u,v:a1.v,ry:-Math.PI/2};a1.yaw=-Math.PI/2;a1.o.arc=.01;
  tick(.8);out.bodyLook=a1.st;out.bodyAlarm=AB157A.on||!!H.cau;
  // a witnessed kill: a guard looking straight at the victim catches the hero
  S.acts.forEach(ab152ResetActor);const b3=S.acts.find(a=>a.id=='b3'),b1=S.acts.find(a=>a.id=='b1');
  b1.u=b3.u;b1.v=b3.v+5;b1.path=null;b1.home={u:b1.u,v:b1.v,ry:Math.PI};b1.yaw=Math.PI;b1.role='sentry';b1.o.arc=.01;
  stand(b3,1.2);const p2=worldPrompt();out.pB3=p2&&p2.label;if(p2&&/Assassinate/.test(p2.label))p2.fn();tick(.1);await wait(450);tick(.1);
  out.witCau=!!H.cau;await wait(1300);tick(.3);
  // ---- the alarm ----
  out.alarm=AB157A.on;out.cr=H.cr;out.stealthHud=$('ab152h').classList.contains('hide');out.alHud=!$('ab157al').classList.contains('hide');
  out.crouchBlocked=(()=>{ab152SetCrouch(true);return H.cr})();
  out.fightOk=(()=>{const g=$('glog').textContent.length;swing();return !/Not here/.test($('glog').textContent.slice(g))})();
  tick(1.5);const E=enemies.filter(e=>e.ab157&&!e.dead&&!e.ab164e);/* v164: residents only (the bell's elite guards are tagged too) */out.foes=E.length;out.cap=AB157K.cap;out.keys=[...new Set(E.map(e=>e.c.en))];
  out.hostile=E.every(e=>e.agg&&e.hunt);out.left=AB157A.left;out.trk=JSON.stringify(SP152.trk.abeksi(I));
  // v158: the bell calls a crowd of hunters who run to the hero through the streets
  {const R=ab157Res(),hs=()=>R.filter(a=>a.hunt&&!a.dead&&!a.e),md=()=>{const L=hs();return L.length?L.reduce((t,a)=>t+Math.min(999,ab158D(a)),0)/L.length:0};
   out.hunters=R.filter(a=>!a.dead&&(a.hunt||a.e)).length;out.hd0=+md().toFixed(1);out.hn0=hs().length;const f0=enemies.filter(e=>e.ab157&&!e.dead).length;
   hero.hp=heroMax();const keep=setInterval(()=>{hero.hp=heroMax()},50);tick(4,()=>{hero.hp=heroMax()});clearInterval(keep);
   out.hd1=+md().toFixed(1);out.hn1=hs().length;out.foes1=enemies.filter(e=>e.ab157&&!e.dead).length;out.foes0=f0;
   out.inWall=R.filter(a=>a.hunt&&!a.dead&&!a.e&&!ab158Ok(G,Math.round(a.u),Math.round(a.v))).length}
  const e0=E[0],L0=AB157A.left;if(e0)hurt(e0,1e9,{col:0xffffff},false);tick(.5);out.killCount=AB157A.left===L0-1;
  {const [x,z]=W2(75,185.6);toPos(x,z)}tick(.1);out.gateBar=(worldPrompt()||{}).label||'';out.leftAtGate=AB157A.left;
  // ---- a death in the alarm: calm again, at the checkpoint, every resident alive ----
  hero.hp=1;down();await wait(300);out.awd=typeof AWD!='undefined'&&!!AWD.dead;try{AWD.ready=1;awRise()}catch(_){}await wait(900);tick(.3);
  out.after={alarm:AB157A.on,left:ab157Left(),res:ab157Res().length,hp:hero.hp>0,ins:ab152In(),foes:enemies.filter(e=>e.ab157&&!e.dead).length,bodies:AB157A.bodies.length,cr:H.cr};
  // ---- the gate, once every resident is dead ----
  ab157Alarm();tick(.2);ab157Res().forEach(a=>{if(!a.dead){if(a.e){try{removeE(a.e)}catch(_){}a.e=null}ab157Fall(a,null,null,false,0)}});tick(.3);out.left0=AB157A.left;
  {const [x,z]=W2(75,185.6);toPos(x,z)}tick(.1);const g=worldPrompt();out.gateOpen=g&&g.label;if(g)g.fn();await wait(1100);tick(.6);
  const c=curIns();out.arrived=c&&c.g;out.st=AB152Q.st;out.done=ab152Done();out.alarmAfter=AB157A.on;out.foesAfter=enemies.filter(e=>e.ab157&&!e.dead).length;
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['folk']>=100 and r['res']==r['folk']+49,'the city is full of folk (%s folk, %s residents)'%(r['folk'],r['res']))
    exp(not r['inSolid'],'no folk stand inside walls or props (%s)'%r['inSolid'])
    exp(r['flutes']>=4,'flute players (%s)'%r['flutes'])
    exp(r['flameGap']<=0.02,'flames sit on their torches, not above them (gap %s)'%r['flameGap'])
    exp(r['walls']>=4,'torches that stood in walls are wall sconces now (%s)'%r['walls'])
    exp(r['pBehind']=='F · Assassinate' and not r['pFront'] and not r['pFar'] and not r['pSusp'],'the knife: only close behind an unsuspecting Abeksi (%s|%s|%s|%s)'%(r['pBehind'],r['pFront'],r['pFar'],r['pSusp']))
    exp(r['dead'] and r['silent'] and r['body']==1,'an unseen kill is silent and leaves a body')
    exp(r['bodyLook'] in ('investigate','look') and not r['bodyAlarm'],'a guard who finds a body comes to look, no alarm (%s %s)'%(r['bodyLook'],r['bodyAlarm']))
    exp(r['pB3']=='F · Assassinate' and r['witCau'],'a witnessed kill: caught (%s %s)'%(r['pB3'],r['witCau']))
    exp(r['alarm'] and not r['cr'] and r['stealthHud'] and r['alHud'] and r['crouchBlocked']==0,'the alarm: crouch off and blocked, the stealth HUD hidden, the alarm banner shown')
    exp(r['fightOk'],'fighting is allowed while the city is roused')
    exp(0<r['foes']<=r['cap'] and r['hostile'] and len(r['keys'])>=2,'residents near the hero become hostile enemies (%s of cap %s, %s)'%(r['foes'],r['cap'],r['keys']))
    exp('Hunting you' in r['trk'] and 'city gate' in r['trk'],'the tracker: hunting you, fight to the city gate (%s)'%r['trk'][:160])
    exp(r['hunters']>=6,'residents who see the hero hunt it (v164: by sight; the bell summons elite guards) (%s)'%r['hunters'])
    exp(r['hn0']==0 or r['hd1']<r['hd0'] or r['hn1']<r['hn0'],'the hunters close in through the streets (mean steps %s -> %s, %s -> %s on foot)'%(r['hd0'],r['hd1'],r['hn0'],r['hn1']))
    exp(r['foes1']>=min(r['cap'],6),'the hunters join the fight (%s fighting, cap %s)'%(r['foes1'],r['cap']))
    exp(r['inWall']==0,'no hunter stands inside a wall (%s)'%r['inWall'])
    exp(r['killCount'],'killing a roused resident lowers the count')
    exp('city gate' in r['gateBar'] and 'barred' not in r['gateBar'] and r['leftAtGate']>50,'v158: the gate opens during the alarm, with most residents still standing (%s, %s left)'%(r['gateBar'],r['leftAtGate']))
    a=r['after'];exp(r['awd'] and not a['alarm'] and a['left']==a['res'] and a['hp'] and a['ins'] and a['foes']==0 and a['bodies']==0 and a['cr'],'a death in the alarm: calm again at the checkpoint, every resident back (%s)'%a)
    exp(r['left0']==0 and r['gateOpen'] and 'city gate' in r['gateOpen'],'with none left the gate opens (%s)'%r['gateOpen'])
    exp(r['arrived']==6 and r['st']==2 and r['done'] and not r['alarmAfter'] and r['foesAfter']==0,'the gate leads to Hillside Crest II and finishes the chapter (%s %s)'%(r['arrived'],r['st']))
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v157 abeksi alarm:',len(fails),'fails')
play.run(s)
