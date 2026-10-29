# v167 combat fixes (owner, Oct 29 2026). Four checks, FAIL lines on a wrong result:
#  reach - every monster-centred move whose start reach v167 raised (V167.raised) is started with the hero standing still just
#          inside the new reach: FAIL when it does not hit (the hit test must match the reach). And a bite/spin monster placed
#          between the old reach (1.9) and the new one starts its attack there, without walking in first.
#  spin  - every move used by a monster runs to the end: FAIL when the body turns more than MAXSPIN rad in the recovery and the
#          0.5 s after (before v167: Sandstorm unwound ~25 rad), or when, right after an attack with the hero behind it, the
#          monster turns faster than V167.turn rad/s (a snap).
#  speed - a chasing monster moves 1.7 (alpha 2) x 1.3 tiles/s (FAIL outside ±12%); boss footwork speeds are scaled.
#  dodge - right after a perfect dodge the hero can attack (atkCd 0, swing works) and the cooldown counts real time in the slow motion.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
MAXSPIN=float(os.environ.get('MAXSPIN','2.5'))
JS=r"""async()=>{const out={reach:{},spin:{},err:[]};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err.push(String(err).slice(0,200))}}};
 hero.lvl=30;const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1]);STEP(30);
 const clear=()=>enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});clear();
 // while a move is measured its hits on the hero are only counted (no damage: a dead hero stops the fight)
 let HIT=null;{const f=hitTarget;hitTarget=function(e,tg){if(HIT&&tg===pl){if(e===HIT.e)HIT.n++;return}return f.apply(this,arguments)}}
 {const f=hitHero;hitHero=function(e){if(HIT){if(e===HIT.e)HIT.n++;return}return f.apply(this,arguments)}}
 const used={};for(const k in MSET)(MSET[k]||[]).forEach(n=>{if(EN[k])(used[n]=used[n]||[]).push(k)});
 const P0=pl.position.clone(),dt=1/60;
 const mk=k=>{clear();let e=null;try{e=spawnEnemy(k,P0.x,P0.z,25,{})}catch(err){out.err.push(k+': '+String(err).slice(0,120))}
   if(e){e.c.h=e.c.st.hp=1e7;e.agg=1;e.cd=99}return e};
 const yaw=e=>e.m.rotation.y+(e.m.b?e.m.b.rotation.y:0);
 const run=(e,n,L)=>{const m=e.m;m.position.set(P0.x,m.position.y,P0.z);m.rotation.y=Math.PI/2;
   pl.position.set(P0.x+L,pl.position.y,P0.z);hero.iv=0;HIT={e,n:0};e.atk=null;mStart(e,pl,n);if(!e.atk){HIT=null;return {nostart:1}}
   let turn=0,last=null,t=0;const a=e.atk;
   for(let i=0;i<60*6;i++){VT+=16;hero.hp=heroMax();hero.iv=0;pl.position.set(P0.x+L,pl.position.y,P0.z);
     const ph=e.atk?e.atk.ph:3;if(e.atk)mTick(e,dt,VT);eshotTick(dt);animC(e.m,VT,false,0);
     const y=yaw(e);if(ph>=2&&last!=null){turn+=Math.abs(Math.atan2(Math.sin(y-last),Math.cos(y-last)))}last=y;
     if(!e.atk){t+=dt;if(t>.5)break}}
   if(e.atk)mCancel(e);const r={hit:HIT.n,turn:+turn.toFixed(2)};HIT=null;return r};
 // reach: each raised move at its new reach
 out.raised=V167.raised;
 for(const n in V167.raised){const ks=used[n];if(!ks)continue;const e=mk(ks[0]);if(!e)continue;
   try{out.reach[n]=Object.assign({by:ks[0],L:MV[n].rmax-.05},run(e,n,MV[n].rmax-.05))}catch(err){out.err.push(n+': '+String(err).slice(0,150))}}
 // spin / unwinding: every used move
 for(const n in used){if(n in out.reach){out.spin[n]=out.reach[n].turn;continue}const e=mk(used[n][0]);if(!e)continue;
   try{const L=Math.max(MV[n].rmin+.1,Math.min(MV[n].rmax-.1,2));out.spin[n]=run(e,n,L).turn}catch(err){out.err.push('spin '+n+': '+String(err).slice(0,150))}}
 // the AI starts a melee attack at the new reach (the first bite monster that spawns)
 let KM=null;for(const k of (used.bite||[])){if(mk(k)){KM=k;break}}out.km=KM;if(!KM)return out;
 {const e=mk(KM);let L0=null;{const f=mStart;mStart=function(x,tg,n){if(x===e&&L0==null)L0=[+d2(x.m.position,tg.position).toFixed(2),n];return f.apply(this,arguments)}}
  e.m.position.set(P0.x,e.m.position.y,P0.z);pl.position.set(P0.x+2.15,pl.position.y,P0.z);e.cd=0;e.agg=1;hero.iv=0;
  for(let i=0;i<40&&L0==null;i++){STEP(1);pl.position.set(P0.x+2.15,pl.position.y,P0.z)}out.aiStart=L0;
  // after the attack, the hero behind it: the turn to face him is smooth
  for(let i=0;i<300&&e.atk;i++)STEP(1);pl.position.set(e.m.position.x-2.2,pl.position.y,e.m.position.z+.3);e.cd=99;let mx=0,r0=e.m.rotation.y;
  for(let i=0;i<30;i++){STEP(1);const r=e.m.rotation.y,d=Math.abs(Math.atan2(Math.sin(r-r0),Math.cos(r-r0)));mx=Math.max(mx,d);r0=r}out.faceStep=+mx.toFixed(3);
  out.faceEnd=+Math.abs(Math.atan2(Math.sin(e.m.rotation.y-Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z)),1)).toFixed(2)}
 // speed: a chasing monster, no attacks
 {const e=mk(KM);e.m.position.set(P0.x,e.m.position.y,P0.z);pl.position.set(P0.x+8,pl.position.y,P0.z);e.cd=99;e.agg=1;STEP(3);
  const a=e.m.position.clone();let T=0;for(let i=0;i<40;i++){STEP(1);T+=.016;pl.position.set(e.m.position.x+8,pl.position.y,e.m.position.z);e.cd=99}
  out.speed=+(Math.hypot(e.m.position.x-a.x,e.m.position.z-a.z)/T).toFixed(3);out.k=ESPD167.k;out.al=!!e.c.al;
  out.boss=SVB.map(B=>B&&B.ai?[B.ai.walk,B.ai.run]:null)}
 clear();
 // perfect dodge, then attack
 {const shut=()=>{UIO_IDS.forEach(i=>{const x=$(i);if(x)x.classList.add('hide')});if(typeof KQMENU!='undefined')KQMENU.on=false};shut();STEP(60);
  atkCd=0;swing();const cd0=atkCd;STEP(2);hero.dc=5;hero.cdD=0;hero.dash=null;dodge();const dashed=!!hero.dash;
  const e=mk(KM);e.m.position.set(P0.x+30,e.m.position.y,P0.z);const pf=hitHero(e,1)!==undefined||true;
  const slow=slowT,cd1=atkCd;swing();const cd2=atkCd;STEP(10);const cd3=atkCd;
  out.dead=!!(typeof AWD!='undefined'&&AWD.dead);out.dodge={cd0:+cd0.toFixed(3),dashed,slow:+slow.toFixed(2),afterPerfect:+cd1.toFixed(3),swung:cd2>0,cdAfterSwing:+cd2.toFixed(3),after10:+cd3.toFixed(3),slowLeft:+slowT.toFixed(2)}}
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1800000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS);print(json.dumps(r))
    for x in r['err'][:5]:F('error '+x)
    if not r.get('km'):F('no bite monster could be spawned');return
    if len(r['raised'])<4:F('only %d moves had their reach raised'%len(r['raised']))
    for n,q in r['reach'].items():
        if q.get('nostart'):F('%s (%s) did not start'%(n,q['by']))
        elif q['hit']<1:F('%s (%s) started at its new reach %.2f but missed a hero standing still'%(n,q['by'],q['L']))
    if not r['reach'].get('bite') or not r['reach'].get('strike'):F('bite / strike were not checked')
    if r.get('dead'):F('the hero died during the test (setup)')
    for n,t in r['spin'].items():
        if t is not None and t>MAXSPIN:F('%s: the body turned %.1f rad after the attack (unwinding)'%(n,t))
    if not r.get('aiStart'):F('the %s never attacked from 2.15 tiles'%r['km'])
    elif r['aiStart'][0]<2.0:F('the %s walked in to %.2f before attacking (%s)'%(r['km'],r['aiStart'][0],r['aiStart'][1]))
    if r['faceStep']>0.2:F('after its attack the monster snapped %.2f rad in one frame to face the hero'%r['faceStep'])
    if r['faceEnd']>0.3:F('the monster did not end up facing the hero (%.2f rad off)'%r['faceEnd'])
    want=(2 if r.get('al') else 1.7)*r['k']
    if abs(r['k']-1.3)>1e-6:F('ESPD167.k is %s, not 1.3'%r['k'])
    if abs(r['speed']-want)>.12*want:F('chase speed %.2f tiles/s, want %.2f'%(r['speed'],want))
    if r['boss'][0] and abs(r['boss'][0][0]-2.6*1.3)>1e-6:F('Argus walks at %s, want %.2f'%(r['boss'][0][0],2.6*1.3))
    d=r['dodge']
    if not d['dashed']:F('the dodge did not start (test setup)')
    elif d['slow']<=0:F('no perfect dodge (test setup)')
    else:
        if d['afterPerfect']>0:F('after a perfect dodge the attack still had %.2f s of cooldown'%d['afterPerfect'])
        if not d['swung']:F('could not attack right after a perfect dodge')
        elif d['slowLeft']>0 and d['cdAfterSwing']-d['after10']<.13:F('the attack cooldown ran slow in the slow motion (%.3f -> %.3f in 0.16 s)'%(d['cdAfterSwing'],d['after10']))
play.run(s)
print('v167 combat: checked' if not fails else 'CHECKS FAILED')
