# v192 (3520): Abeksi's bell-ringer and every Abeksi's eyes (owner, Nov 2 2026).
#  * Every townsperson has a view cone (shown near the hero) and can spot you: in its cone, not behind it, blocked by buildings.
#  * Spotted = the Abeksi rings a hand bell for 3 s first (bell in hand, the timer over its head, HUD countdown, a log line); the
#    hero is not frozen and the city is not roused yet; when the 3 s are up the alarm sounds (the bell, the hunt).
#  * Killed in time (F · Silence the bell-ringer!, or a swing) = no alarm, the body stays; a ringer on a roof takes a thrown knife.
#  * Several ringers: each one counts; the city calming (a restart) clears every ringer.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;if(f)f(T);homeTick(1/30,T)}};
  const I=INSL[30],W2=(u,v)=>[I.x0+u,I.y0+v];
  AB152Q.st=1;ab152Enter();await wait(900);tick(.5);const S=AB152.S,H=AB152H,G=S.G,Q=AB157.S;AB157A.calmT=0;
  const said=[];{const s0=say;say=function(t){said.push(String(t));return s0.apply(this,arguments)}}const saidSince=n=>said.slice(n).join(' | ');
  // nobody else sees (only the Abeksi under test): the others' eyes and the witnesses are switched off by a flag
  window.__only=null;{const s=ab152Sees;ab152Sees=function(a){return window.__only&&a!==window.__only?0:s.apply(this,arguments)};const t=ab192Sees;ab192Sees=function(a){return window.__only&&a!==window.__only?0:t.apply(this,arguments)};
    const w=ab157Witness;ab157Witness=function(){return window.__only?null:w.apply(this,arguments)}}
  // ---- every Abeksi has a cone ----
  out.folk=Q.folk.length;out.folkCones=Q.folk.filter(a=>a.cone&&a.cone.parent).length;out.snakeCones=S.acts.filter(a=>a.cone).length;
  // a calm townsperson standing on the street (not seated, not on a roof, no path), with open ground in front of it and behind it
  const okT=(u,v)=>ab158Ok(G,Math.round(u),Math.round(v));let fa=null,fr=null,fb=null;
  for(const a of Q.folk){if(a.dead||a.path||(a.o.lift||0)>.3||a.o.seat||/sit|Sit|feast|Floor|kneel|drum/.test(a.pose))continue;
    const f=[a.u+Math.sin(a.yaw)*2.2,a.v+Math.cos(a.yaw)*2.2],b=[a.u-Math.sin(a.yaw)*2.4,a.v-Math.cos(a.yaw)*2.4];
    if(okT(...f)&&okT(...b)&&ab152LOS(G,a.u,a.v,f[0],f[1],false)&&ab152LOS(G,a.u,a.v,b[0],b[1],false)){fa=a;fr=f;fb=b;break}}
  out.fa=fa&&fa.id;
  // a townsperson up on a roof
  const ra=Q.folk.find(a=>(a.o.lift||0)>=1&&!a.dead);out.ra=ra&&ra.id;
  const still=a=>{a.glT=1e9;a.gl=0;a.ht=0;a.hy=0};   // no glancing round: the test stands straight in its cone
  const spot=(a,max)=>{for(let i=0;i<max*10&&!a.r192;i++)tick(.1)};
  if(fa){window.__only=fa;still(fa);
    // cone shown near the hero, and the eyes: in front yes, behind no
    {const [x,z]=W2(fb[0],fb[1]);toPos(x,z)}ab152SetCrouch(true);tick(.2);out.coneShown=!!fa.cone.visible;
    out.seeFront=ab192Sees(fa,fr[0],fr[1],false,1);out.seeBehind=ab192Sees(fa,fb[0],fb[1],false,1);const fd=AB152V.rng.folk+3;out.seeFar=ab192Sees(fa,fa.u+Math.sin(fa.yaw)*fd,fa.v+Math.cos(fa.yaw)*fd,false,1);   /* v207: folk see twice as far (10) */
    out.kind=ab152Kind(fa);out.susBehind=Math.round(fa.sus);
    // ---- spotted: the ringer winds up for 3 s ----
    const g0=said.length;ab152SetCrouch(false);{const [x,z]=W2(fr[0],fr[1]);toPos(x,z)}
    spot(fa,8);out.spotted=!!fa.r192;tick(.25);   // (the HUD refreshes every 0.15 s)
    window.__only=fa;
    const tr=fa.r192?fa.r192.t:0;out.atSpot={alarm:AB157A.on,cau:!!H.cau,frz:H.frz,bell:!!(fa.b192&&fa.b192.parent),mark:!!(fa.m192&&fa.m192.visible),ringers:AB192.R.length};
    out.hud=$('ab152h').querySelector('.s').textContent;out.log=/grabs its alarm bell/.test(saidSince(g0));
    out.prompt=(worldPrompt()||{}).label||'';
    // step away (not frozen), then wait the rest of the 3 s: the alarm
    {const p0=pl.position.clone();let w=0;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){for(let i=0;i<5;i++)walk(pl,dx*.06,dz*.06);w=Math.max(w,pl.position.distanceTo(p0));pl.position.copy(p0)}out.walked=+w.toFixed(2)}
    tick(Math.max(0,AB192.T-fa.r192.t-.25));out.before=AB157A.on;tick(.6);out.after=AB157A.on;out.rang=AB192.n.done;out.ringersAfter=AB192.R.length;
    // ---- calm again: a restart at the checkpoint ----
    hero.hp=1;down();await wait(300);try{AWD.ready=1;awRise()}catch(_){}await wait(900);tick(.3);AB157A.calmT=0;out.calm=!AB157A.on&&!AB192.R.length;
    // ---- killed in time: no alarm ----
    S.acts.forEach(ab152ResetActor);Q.folk.forEach(ab152ResetActor);window.__only=fa;still(fa);
    {const [x,z]=W2(fr[0],fr[1]);toPos(x,z)}ab152SetCrouch(false);spot(fa,8);out.spot2=!!fa.r192;tick(.5);
    out.p2=(worldPrompt()||{}).label||'';const g1=said.length;const p=worldPrompt();if(p&&/bell-ringer/.test(p.label))p.fn();
    tick(.1);await wait(500);tick(.2);await wait(400);out.killed=!!fa.dead;out.noRing=!fa.r192&&!AB192.R.length;tick(4);out.alarmAfterKill=AB157A.on;out.silLog=/bell-ringer falls/.test(saidSince(g1))}
  // ---- a plan snake (a guard) spotting you rings too; a swing in reach stops it ----
  ab152Restart(false);await wait(200);tick(.2);AB157A.calmT=0;const b2=S.acts.find(a=>a.id=='b2');window.__only=b2;
  {const [x,z]=W2(80,42.5);toPos(x,z)}ab152SetCrouch(false);b2.yaw=Math.PI;b2.t=0;spot(b2,6);out.b2ring=!!b2.r192;out.b2alarm=AB157A.on;out.b2st=b2.st;
  {const P2=pl.position,x=I.x0+b2.u,z=I.y0+b2.v;toPos(x+(P2.x-x)/Math.hypot(P2.x-x,P2.z-z)*1.4,z+(P2.z-z)/Math.hypot(P2.x-x,P2.z-z)*1.4)}tick(.05);
  swing();tick(.1);await wait(500);tick(.2);await wait(400);tick(4);out.b2dead=!!b2.dead;out.b2alarm2=AB157A.on;
  // ---- a ringer on a roof: a thrown knife ----
  if(ra){ab152Restart(false);await wait(200);tick(.2);AB157A.calmT=0;window.__only=ra;
    // stand on the street below, within the throw, in its line of sight
    let spot=null;for(let r=2;r<=AB192.thr-1&&!spot;r++)for(let k=0;k<16&&!spot;k++){const an=k/16*Math.PI*2,u=ra.u+Math.sin(an)*r,v=ra.v+Math.cos(an)*r;if(okT(u,v)&&ab192LOS(G,ra.u,ra.v,u,v,false,true))spot=[u,v]}
    out.raSpot=spot;if(spot){const [x,z]=W2(spot[0],spot[1]);toPos(x,z);tick(.1);ab152Caught(ra);out.raRing=!!ra.r192;tick(.3);out.raPrompt=(worldPrompt()||{}).label||'';
      const p=worldPrompt();if(p&&/knife/.test(p.label))p.fn();tick(.1);await wait(500);tick(4);out.raDead=!!ra.dead;out.raAlarm=AB157A.on;
      out.raY=+(ra.g.position.y-GH(ra.g.position.x,ra.g.position.z)).toFixed(2)}}
  // ---- two ringers; a restart clears both ----
  ab152Restart(false);await wait(200);tick(.2);AB157A.calmT=0;window.__only={};
  const two=S.acts.filter(a=>!a.dead&&!(a.o.lift>0)).slice(0,2);two.forEach(a=>ab152Caught(a));out.two=AB192.R.length;tick(.2);ab152Restart(false);await wait(200);out.twoAfter=AB192.R.length;out.twoAlarm=AB157A.on;
  window.__only=null;out.err192=AB192.err;out.log192=AB192.log.slice(-12);out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3500])
    exp=lambda c,m:(None if c else F(m))
    exp(r['folk']>=100 and r['folkCones']==r['folk'] and r['snakeCones']>=49,'every Abeksi has a view cone (%s/%s folk, %s snakes)'%(r['folkCones'],r['folk'],r['snakeCones']))
    exp(r['fa'],'a townsperson to test with (%s)'%r['fa'])
    if r.get('fa'):
        exp(r['coneShown'],'a townsperson\'s cone shows near the hero')
        exp(r['kind']=='folk' and r['seeFront']>0 and r['seeBehind']==0 and r['seeFar']==0,'townsfolk eyes: in front yes, behind and far no (%s %s %s %s)'%(r['kind'],r['seeFront'],r['seeBehind'],r['seeFar']))
        exp(r['susBehind']<5,'standing crouched behind it: not noticed (%s)'%r['susBehind'])
        exp(r['spotted'],'standing in front of a townsperson: it spots you and grabs its bell')
        a=r['atSpot'];exp(not a['alarm'] and not a['cau'] and not a['frz'],'spotted: no alarm yet, not frozen (%s)'%a)
        exp(a['bell'] and a['mark'] and a['ringers']==1,'the ringer: a bell in its hand and the timer over its head (%s)'%a)
        exp('Alarm in' in r['hud'] and r['log'],'the HUD counts down and the log says it runs for the bell (%s, %s)'%(r['hud'],r['log']))
        exp('bell-ringer' in r['prompt'],'F prompt to silence the ringer in reach (%s)'%r['prompt'])
        exp(r['walked']>0.2,'the hero can still move while it rings (%s)'%r['walked'])
        exp(not r['before'] and r['after'] and r['rang']>=1 and r['ringersAfter']==0,'the alarm sounds only when the 3 s are up (%s -> %s, %s)'%(r['before'],r['after'],r['rang']))
        exp(r['calm'],'a death in the alarm: calm again, no ringer left')
        exp(r['spot2'] and 'Silence the bell-ringer' in r['p2'],'spotted again: the prompt to silence it (%s)'%r['p2'])
        exp(r['killed'] and r['noRing'] and not r['alarmAfterKill'] and r['silLog'],'killed before it rang: no alarm, the whole town stays asleep (%s %s %s)'%(r['killed'],r['noRing'],r['alarmAfterKill']))
    exp(r['b2ring'] and not r['b2alarm'] and r['b2st']=='caught','a guard who spots you rings its bell first, no instant alarm (%s %s %s)'%(r['b2ring'],r['b2alarm'],r['b2st']))
    exp(r['b2dead'] and not r['b2alarm2'],'a swing in reach kills the ringing guard: no alarm (%s %s)'%(r['b2dead'],r['b2alarm2']))
    if r.get('ra'):
        exp(r.get('raSpot') and r.get('raRing') and 'knife' in r.get('raPrompt',''),'a ringer on a roof: F throws a knife (%s)'%r.get('raPrompt'))
        exp(r.get('raDead') and not r.get('raAlarm') and r.get('raY',0)>=1,'the knifed roof ringer falls on its roof, no alarm (%s %s y %s)'%(r.get('raDead'),r.get('raAlarm'),r.get('raY')))
    exp(r['two']==2 and r['twoAfter']==0 and not r['twoAlarm'],'two ringers at once; a restart clears both (%s -> %s)'%(r['two'],r['twoAfter']))
    exp(not r['err192'] and not r['errs'],'no console errors (%s %s)'%(r['err192'],r['errs']))
    for e in errs[:5]:F('page error '+e)
    print('v192 abeksi bell:',len(fails),'fails')
play.run(s)
