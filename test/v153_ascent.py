# v153: the Hilltop Ascent (Hillside Crest main quest, chapter 2): the hill road in Mistmere (mount needed), entering mounted,
# the intro and the start of the run, steering direction, jumping, the finish into III, saves, the road afterwards.
# v157: the emergence (in view, not culled, debris), the boost (Shift / dash button, charges, jump).
# v164: no obstacles / strikes / hit points; a real distance (no boost: it closes in; a boost: distance kept); venom puddles and
# globs slow you ~1 s (health untouched); broken trail: jump it (also when slowed) or fall; caught = chomped; both restart.
# An autopilot (jumps every gap, steers around venom, jumps a venom wall, boosts) rides the whole trail and must win in about
# two minutes; the same autopilot without boosting must be caught. Venom volleys leave a lane and never land near a gap.
# v167: the mount is 35% faster (a run is ~85 s) and the trail has obstacles (logs, rolling boulders, narrow ledges: v167_obstacles.py
# tests them); the checks of speed, venom and gaps ride with CH167.off, the autopilot jumps logs, dodges boulders and hugs the wall.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
CH_CATCH=2.6
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;if(f)f(T);homeTick(1/30,T)}};
  const I2=INSL[6];toPos(I2.ba[0],I2.ba[1]);tick(.3);const G=SP152.gates.ascent,s=G.spot;out.road=!!G.g;const r=RPORT.find(q=>q.k=='next'&&q.ig===6);out.portalHidden=r&&!r.g.visible;
  toPos(s.x,s.z);tick(.1);mounts.length=0;out.noMount=(worldPrompt()||{}).label||'';
  newMount(MNTK[0]);tick(.1);out.withMount=(worldPrompt()||{}).label||'';
  // enter: mounted, intro, then the run
  ch153Enter();await wait(900);tick(.2);out.here=ch153In();out.riding=!!riding;const R=()=>CH153.R;out.ph0=R().ph;await wait(400);out.folsHidden=fols.every(f=>!f||!f.visible);
  // v157 the emergence: Skarrith bursts out of the ground behind you, in front of the intro camera, never culled
  {const r0=R();if(r0.ph=='intro'){r0.t=ch153EmT(r0)-.3;tick(.1);out.crackOp=CH157.crack?+CH157.crack.material.opacity.toFixed(2):-1;r0.t=ch153EmT(r0)+.75;tick(.05);const S=CH153.S,P=S.P,yw=P.yaw(r0.s),C=CH153CAM,c=new THREE.PerspectiveCamera(cam.fov,cam.aspect,.1,260),
      a=yw-C.yaw*P.sgn,p=pl.position;c.position.set(p.x+Math.sin(a)*Math.cos(C.pitch)*C.dist,p.y+1.1+Math.sin(C.pitch)*C.dist,p.z+Math.cos(a)*Math.cos(C.pitch)*C.dist);c.lookAt(p.x,p.y+1,p.z);c.updateMatrixWorld();
      const h=S.sn.head.getWorldPosition(new THREE.Vector3()),v=h.clone().project(c);out.emNdc=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(3)];out.emUp=+(h.y-GH(h.x,h.z)).toFixed(1);out.emHeadVis=S.sn.head.visible&&S.root.visible;
      out.emDeb=CH157.deb.length;fcPass();out.emCulled=FC.hide.some(o=>o===S.root||o===S.sn.g||o===S.sn.head);out.emBehind=+(r0.s-r0.sn.s).toFixed(1)}else out.emNdc='no intro '+r0.ph}
  tick(3.3);out.ph1=R().ph;const P=CH153.S.P,S0=CH153.S,KC=ch153Course();CH167.off=1;
  // v164: no obstacles, no strikes, no hit points
  out.noObs=!S0.obs&&!KC.O&&!S0.slides&&!S0.planks&&!('strike' in R().sn)&&!('hp' in R())&&typeof ch153Hit=='undefined';
  {const h=document.querySelector('#ch153h .hp');out.noHearts=!h||getComputedStyle(h).display=='none'}
  out.gapN=KC.gaps.length;{const G=KC.gaps,sp=G.slice(1).map((g,i)=>g.s-G[i].s),n=Math.floor(sp.length/3);out.gapSpace=[+(sp.slice(0,n).reduce((a,b)=>a+b,0)/n).toFixed(1),+(sp.slice(-n).reduce((a,b)=>a+b,0)/n).toFixed(1)];out.gapLen=[G[0].len,G[G.length-1].len]}
  // the ground really falls away in a gap (3160 carves it) and the trail before it is whole
  {const g=KC.gaps[3],[x,z,h]=P.at(g.s,0),[x2,z2,h2]=P.at(g.s-g.len/2-1.5,0);out.gapDrop=+(h-GH(x,z)).toFixed(1);out.gapNear=+(h2-GH(x2,z2)).toFixed(2)}
  const hp0=hero.hp;
  // steering: D moves the hero to the camera's right
  {const p0=pl.position.clone(),yw=P.yaw(R().s),rx=-Math.cos(yw),rz=Math.sin(yw);K.d=1;tick(.4);K.d=0;const d=pl.position.clone().sub(p0);out.steerRight=+(d.x*rx+d.z*rz).toFixed(2)}
  // a jump lifts you
  CH153.jumpQ=.2;tick(.3);out.jumpY=+R().y.toFixed(2);tick(.6);
  const keep=r0=>{r0.ph='run';r0.sn.s=r0.s-16;r0.sn.spit=99;r0.sn.spitAt=null;CH153.S.globs.forEach(g=>{ch164Drop(g.m);ch164Drop(g.w,1)});CH153.S.globs.length=0};
  // v157 the boost: Shift / the dash button spurs the mount (CH157.mul for CH157.T s), CH157.n charges, a jump while boosting
  {const r0=R();r0.s=40;keep(r0);r0.bc=CH157.n;r0.bst=0;r0.v=CH153V.spd;const sh=()=>dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true}));
    sh();out.bstOn=r0.bst>0;out.bc1=+r0.bc.toFixed(2);sh();out.bc1b=+r0.bc.toFixed(2);tick(.4);out.bV=+(r0.v/CH153V.spd).toFixed(2);
    CH153.jumpQ=.2;tick(.2);out.bJumpY=+r0.y.toFixed(2);out.bJumpBst=r0.bst>0;tick(.9);out.bOff=r0.bst==0;tick(.8);out.bVafter=+(r0.v/CH153V.spd).toFixed(2);
    r0.s=40;keep(r0);const db=document.querySelector('#mbtn [data-m=dash]');if(db){db.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}))}out.bBtn=r0.bst>0;out.bc2=+r0.bc.toFixed(2);tick(1.1);
    sh();out.bDeny=r0.bst==0;r0.s=40;keep(r0);tick(5.2);out.bRefill=+r0.bc.toFixed(2)}
  // v164 a real distance: riding without boosting, Skarrith closes in; a boost buys distance it does not win back
  {const run=(boost)=>{const r0=R();r0.ph='run';r0.t=9;r0.s=160;r0.o=0;r0.y=0;r0.jt=-1;r0.v=CH153V.spd;r0.slow=0;r0.bst=0;r0.bc=CH157.n;const N=r0.sn;N.s=160-15;N.v=ch164SnakeV(160,15);N.spit=99;N.spitAt=null;
      ch164ClearFx(CH153.S);const jg=()=>{const g=KC.gaps.find(q=>q.s+q.len/2>r0.s);if(g&&g.s-g.len/2-r0.s<1&&g.s-g.len/2>r0.s)CH153.jumpQ=.1};if(boost)ch157Boost();tick(1.2,jg);const g1=r0.s-N.s;tick(8,jg);return [+g1.toFixed(1),+(r0.s-N.s).toFixed(1),r0.ph]};
    const a=run(false),b=run(true);out.distNo=a;out.distBoost=b}
  // v164 venom: a puddle on your lane slows you for about a second, then you recover; health untouched
  {const r0=R();r0.ph='run';r0.s=95;r0.o=.3;r0.y=0;r0.jt=-1;r0.v=CH153V.spd;r0.slow=0;r0.bst=0;keep(r0);r0.sn.s=r0.s-25;const [x,z,h]=P.at(r0.s+3,0);
    const pm=ch164Pool();pm.position.set(x,h+.06,z);CH153.S.root.add(pm);CH153.S.pools.push({m:pm,s:r0.s+3,o:0,t:7,hit:0,g:1});const s0=r0.s;
    tick(.6);out.vSlow=+r0.slow.toFixed(2);out.vV=+(r0.v/CH153V.spd).toFixed(2);ch153Hud();out.vGreen=+getComputedStyle($('ch164v')).opacity;tick(1.0);out.vOff=r0.slow==0;tick(1.6);out.vRec=+(r0.v/CH153V.spd).toFixed(2);out.vLost=+((s0+3.2*CH153V.spd)-r0.s).toFixed(1);
    out.vHp=hero.hp===hp0;
    // a glob landing on you does the same
    r0.slow=0;r0.sn.s=r0.s-25;tick(.5);ch153SpitSpawn([[r0.s+r0.v*1.05,r0.o]],1);tick(1.15);out.vGlob=r0.slow>0}
  // v164 a broken stretch: jump it and ride on; miss it and you fall (then the chase starts again)
  {const g=KC.gaps[2],r0=R();r0.ph='run';r0.s=g.s-g.len/2-6;r0.o=0;r0.y=0;r0.jt=-1;r0.v=CH153V.spd;r0.slow=0;r0.bst=0;keep(r0);
    let jumped=0;for(let i=0;i<90&&r0.ph=='run'&&!(jumped&&r0.y==0&&r0.jt<0);i++){tick(1/30,()=>{if(!jumped&&r0.s>g.s-g.len/2-1.4){CH153.jumpQ=.1;jumped=1}})}out.gJump=[r0.ph,+(r0.s-(g.s+g.len/2)).toFixed(1)];
    // jumping while slowed by venom still clears it (the mount leaps at full stride)
    r0.ph='run';r0.s=g.s-g.len/2-5;r0.y=0;r0.jt=-1;r0.v=CH153V.spd*.45;r0.slow=.8;keep(r0);jumped=0;for(let i=0;i<90&&r0.ph=='run'&&!(jumped&&r0.y==0&&r0.jt<0);i++){tick(1/30,()=>{if(!jumped&&r0.s>g.s-g.len/2-1.0){CH153.jumpQ=.1;jumped=1}})}out.gJumpSlow=[r0.ph,+(r0.s-(g.s+g.len/2)).toFixed(1)];
    r0.ph='run';r0.s=g.s-g.len/2-4;r0.y=0;r0.jt=-1;r0.v=CH153V.spd;r0.slow=0;keep(r0);tick(1);out.gFall=r0.ph=='dead'&&r0.dead.why;out.gFallY=+r0.y.toFixed(1);out.gHp=hero.hp===hp0;
    tick(1.2);out.gBite=!!(r0.dead&&r0.dead.bit);tick(1.4);await wait(900);tick(.3);out.gRestart=R()&&[R().ph,Math.round(R().s)]}
  // v164 caught: it reaches you and chomps (then the chase starts again)
  {tick(3.5);const r0=R();r0.sn.s=r0.s-2;tick(.3);out.dead=r0.ph=='dead'&&r0.dead.why;tick(.5);out.bit=!!(r0.dead&&r0.dead.bit)&&!pl.visible;tick(2);await wait(900);tick(.3);out.restart=R()&&R().ph;out.cHp=hero.hp===hp0}
  // the autopilot: jumps every broken stretch, steers clear of venom (jumps a wall of it), boosts when it can
  const pilot=(useBoost)=>{const st={boosts:0,minGap:99,t:0,deaths:0};
    const fr=()=>{const r0=R();if(!r0||r0.ph!='run')return;const hw=P.hw(r0.s),lim=hw-.6;
      if(useBoost&&r0.bc>=1&&!(r0.bst>0)&&r0.t>3&&ch157Boost())st.boosts++;
      // the next gap: jump just before its lip
      const g=KC.gaps.find(q=>q.s+q.len/2>r0.s);if(g){const d=g.s-g.len/2-r0.s;if(d>0&&d<Math.max(.9,r0.v*.11)&&r0.y<.05){CH153.jumpQ=.1}}
      // venom ahead (puddles, globs coming down): the clearest lane, or a jump if there is none
      const look=r0.v*1.25+2.5,thr=[];CH153.S.pools.forEach(q=>{if(q.s>r0.s-1.2&&q.s<r0.s+look)thr.push(q)});CH153.S.globs.forEach(q=>{if(q.s>r0.s-1.2&&q.s<r0.s+look)thr.push(q)});
      let tgt=0;if(thr.length){let best=-1;for(let o=-lim;o<=lim+1e-6;o+=.1){const c=Math.min(...thr.map(q=>Math.abs(o-q.o)))-.12*Math.abs(o-r0.o);if(c>best){best=c;tgt=o}}
        const near=thr.filter(q=>q.s>r0.s&&q.s-r0.s<CH164.poolR+1.4);if(near.length&&near.some(q=>Math.abs(r0.o-q.o)<CH164.poolR+.1)&&r0.y<.05)CH153.jumpQ=.1}
      else tgt=Math.max(-lim,Math.min(lim,r0.o*.98));
      // v167 obstacles: hug the wall on a narrow ledge, steer behind a rolling boulder, jump a log in your lane
      const lo=-hw+.6;(CH153.S.ob||[]).forEach(b=>{const q=b.q;
        if(q.k=='nar'){const a=q.s-q.len/2-r0.s,e=q.s+q.len/2-r0.s;if(a<r0.v*.9+3&&e>-1){const E=ch167Edge(Math.max(r0.s,q.s-q.len/2+1.5));tgt=Math.min(tgt,Math.max(lo,(E?E.o:-hw+q.w)-.55))}}
        if(q.k=='rock'&&b.st<=3&&!b.hit){const d=q.s-r0.s;if(d>-1.5&&d<r0.v*2.6){const ta=Math.max(0,d)/Math.max(1,r0.v),wait=b.st==0?CH167.rockPre:b.st==1?CH167.rockPre-b.t:0;
            const op=b.st==0&&d>r0.v*2.4?null:b.o+q.u*Math.max(0,ta-wait),cl=q.r+CH167.mw+.55;if(op!=null&&Math.abs(op-tgt)<cl){const t1=op-cl;tgt=t1>=lo?t1:Math.min(lim,op+cl)}}}
        if(q.k=='log'&&b.st==0&&[tgt,r0.o].some(o=>o+CH167.mw>q.o0-.1&&o-CH167.mw<q.o1+.1)){const d=q.s-q.r-(r0.s+CH167.ml);if(d>r0.v*.11&&d<r0.v*.24&&r0.y<.05)CH153.jumpQ=.1}});
      const w=tgt-r0.o;K.a=K.d=0;if(Math.abs(w)>.12){if(w*P.sgn>0)K.d=1;else K.a=1}};
    while(st.t<230){tick(1/30,fr);st.t+=1/30;const r0=R();if(!r0)break;if(r0.ph=='run')st.minGap=Math.min(st.minGap,r0.s-r0.sn.s);if(r0.ph=='dead'){st.deaths++;st.why=r0.dead.why;break}if(r0.ph=='win')break}
    K.a=K.d=0;const r0=R();st.t=Math.round(st.t);st.minGap=+st.minGap.toFixed(1);st.ph=r0?r0.ph:'gone';st.s=r0?Math.round(r0.s):0;st.jumps=r0&&r0.jumps||0;st.slows=r0&&r0.slows||0;st.crashes=r0&&r0.crashes||0;st.vol=r0&&r0.vol||0;return st};
  CH167.off=0;ch153Reset(false);tick(1.7);const a=pilot(true);out.ride=a;out.rideHp=hero.hp===hp0;
  // without boosting it cannot stay ahead: Skarrith catches it
  if(R().ph!='dead'){ch153Reset(false);tick(1.7)}else{tick(2.6);await wait(900);tick(1.7)}out.rideNoBoost=pilot(false);if(R().ph=='dead'){tick(2.6);await wait(900);tick(.3)}
  // 3) every venom volley of one or two leaves a lane to escape into; none lands on or just before a broken stretch
  out.spitLane=99;out.spitNearGap=0;[1,2,3].forEach(n=>[-1.6,0,1.6].forEach(o=>{for(let k=0;k<14;k++){const r0=R();r0.ph='run';r0.o=o;r0.s=[60,90,120,160,200,300,420,500,540,580,700,720,780,800][k];r0.v=CH153V.spd;
      const L=ch153SpitPlan(n,r0.s,r0.o,r0.v);L.forEach(q=>{if(KC.gaps.some(g=>q[0]>g.s-g.len/2-CH164.gapB+.5&&q[0]<g.s+g.len/2+CH164.gapA-.2))out.spitNearGap++});if(n>=3)continue;
      // each glob, with any others landing within 2 tiles of it along the trail, must leave a lane free
      L.forEach(q0=>{const Lq=L.filter(q=>Math.abs(q[0]-q0[0])<2),hw=P.hw(q0[0]);let bestW=0,run=0;for(let x=-hw+.55;x<=hw-.55;x+=.05){if(Lq.every(g=>Math.abs(x-g[1])>=CH164.poolR*.95+.1)){run+=.05;bestW=Math.max(bestW,run)}else run=0}out.spitLane=Math.min(out.spitLane,+bestW.toFixed(2))})}}));
  ch153Reset(false);tick(1.7);
  // the finish into III
  if(R()&&R().ph!='win'){R().s=P.S-8;R().sn.s=P.S-30;R().ph='run';tick(.4)}tick(2.6);await wait(1300);tick(.5);const c=curIns();out.arrived=c&&c.g;out.insr=INSR[1];out.st=CH153Q.st;out.done=ch153Done();
  out.folsBack=fols.filter(f=>f&&f.visible).length;out.folsInfo=fols.map((f,i)=>f&&[f.visible,+f.position.y.toFixed(1),+f.position.distanceTo(pl.position).toFixed(1),party[i]?[party[i].hp,party[i].dead||0,party[i].out||0]:null]);
  {toPos(I2.ba[0],I2.ba[1]);tick(.2);toPos(s.x,s.z);tick(.1);out.roadAfter=(worldPrompt()||{}).label||''}
  const sv=x2Save();out.saved=JSON.stringify(sv.ch153);const old=JSON.parse(JSON.stringify(sv));delete old.ch153;old.insr=[0,1,0,0,0,0];x2Load(old);out.oldSt=CH153Q.st;out.oldDone=ch153Done();old.insr=[0,2,0,0,0,0];x2Load(old);out.oldReached=ch153Done();
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000]);print('RIDE',json.dumps(r.get('ride')),json.dumps(r.get('rideNoBoost')))
    exp=lambda c,m:(None if c else F(m))
    exp(r['road'] and r['portalHidden'],'Mistmere: the hill road is built and the old portal hidden')
    exp('need a mount' in r['noMount'] and 'Ascend to the hilltops' in r['withMount'],'the road prompt needs a mount (%s / %s)'%(r['noMount'],r['withMount']))
    exp(r['here'] and r['riding'] and r['ph0']=='intro' and r['folsHidden'],'entering: mounted, the intro, companions wait')
    exp(r['ph1']=='run','the run starts after the intro (%s)'%r['ph1'])
    nd=r.get('emNdc')
    exp(isinstance(nd,list) and abs(nd[0])<.85 and abs(nd[1])<.85 and nd[2]<1,'Skarrith emerges in front of the intro camera (head at %s)'%nd)
    exp(r.get('emUp',0)>5 and r.get('emHeadVis') and not r.get('emCulled'),'it rears high out of the ground, drawn and not culled (%s above ground, culled %s)'%(r.get('emUp'),r.get('emCulled')))
    exp(r.get('emDeb',0)>=10 and r.get('crackOp',0)>.4,'the ground cracks open and rocks fly (debris %s, crack %s)'%(r.get('emDeb'),r.get('crackOp')))
    exp(0<r.get('emBehind',0)<20,'it comes out on the trail behind you (%s tiles)'%r.get('emBehind'))
    exp(r['noObs'] and r['noHearts'],'v164: no obstacles, strikes or hit points (hearts hidden %s)'%r['noHearts'])
    exp(r['gapN']>=10 and r['gapSpace'][1]<r['gapSpace'][0]*.75 and r['gapLen'][1]>r['gapLen'][0],'broken trail: %s gaps, closer and longer near the summit (spacing %s, length %s)'%(r['gapN'],r['gapSpace'],r['gapLen']))
    exp(r['gapDrop']>6 and abs(r['gapNear'])<.3,'the ground falls away in a gap (%s deep; trail before it %s)'%(r['gapDrop'],r['gapNear']))
    exp(r['bstOn'] and r['bc1']==1 and r['bc1b']==1,'Shift boosts (one charge, no double boost) (%s %s)'%(r['bc1'],r['bc1b']))
    exp(r['bV']>=1.4,'boosting: the mount runs ~1.5x (%s)'%r['bV'])
    exp(r['bJumpY']>1 and r['bJumpBst'],'jumping while boosting works (%s)'%r['bJumpY'])
    exp(r['bOff'] and r['bVafter']<=1.05,'the boost ends after about a second (%s)'%r['bVafter'])
    exp(r['bBtn'] and r['bc2']<.6,'the touch dash button boosts (%s)'%r['bc2'])
    exp(r['bDeny'] and r['bRefill']>=.95,'out of charges: no boost; a charge refills in ~5 s (%s)'%r['bRefill'])
    a,b=r['distNo'],r['distBoost']
    exp(a[1]<a[0]-1.5,'no boosting: Skarrith closes in (gap %s -> %s)'%(a[0],a[1]))
    exp(b[0]-a[0]>=3 and b[1]-a[1]>=3,'a boost buys distance and keeps it (gap %s / %s vs %s / %s)'%(b[0],b[1],a[0],a[1]))
    exp(r['vSlow']>0 and r['vV']<=.65 and r['vGreen']>.2,'venom puddle: slowed, the screen tinted (%s %s %s)'%(r['vSlow'],r['vV'],r['vGreen']))
    exp(r['vOff'] and r['vRec']>=.95 and 3<=r['vLost']<=10,'about a second, then you recover (speed %s, %s tiles lost)'%(r['vRec'],r['vLost']))
    exp(r['vGlob'],'a glob landing on you slows you too')
    exp(r['vHp'] and r['gHp'] and r['cHp'] and r['rideHp'],'the hero\'s health is never touched in the chase')
    exp(r['gJump'][0]=='run' and r['gJump'][1]>0,'a jump clears a broken stretch (%s)'%r['gJump'])
    exp(r['gJumpSlow'][0]=='run' and r['gJumpSlow'][1]>0,'a jump clears it even when slowed by venom (%s)'%r['gJumpSlow'])
    exp(r['gFall']=='fall' and r['gFallY']<-1 and r['gBite'],'no jump: you fall into the gap and it bites (%s y %s bite %s)'%(r['gFall'],r['gFallY'],r['gBite']))
    exp(r['gRestart'] and r['gRestart'][0] in ('intro','run') and r['gRestart'][1]<40,'after a fall the chase starts again (%s)'%r['gRestart'])
    exp(r['dead']=='chomp' and r['bit'] and r['restart'] in ('intro','run'),'caught -> chomped -> the chase starts again (%s %s %s)'%(r['dead'],r['bit'],r['restart']))
    d=r['ride']
    exp(d['ph']=='win' and d['deaths']==0,'the autopilot rides the whole trail to the summit (%s)'%d)
    exp(55<=d['t']<=110,'about 85 s with the v167 faster mount (%s s)'%d['t'])
    exp(d.get('crashes',9)<=1,'the autopilot gets past the obstacles (%s crashes)'%d.get('crashes'))
    exp(d['jumps']>=r['gapN'] and d['boosts']>=8 and d['vol']>=10,'it jumped every broken stretch, boosted and met the venom (%s jumps, %s boosts, %s volleys)'%(d['jumps'],d['boosts'],d['vol']))
    exp(d['minGap']>CH_CATCH,'Skarrith never reached it (closest %s)'%d['minGap'])
    n=r['rideNoBoost']
    exp(n['ph']=='dead' and n.get('why')=='chomp','without boosting Skarrith catches the rider (%s)'%n)
    exp(r['spitLane']>=.8 and r['spitNearGap']==0,'venom volleys leave a lane (narrowest %s) and never land by a gap (%s)'%(r['spitLane'],r['spitNearGap']))
    exp(r['arrived']==7 and r['insr']>=2 and r['st']==2 and r['done'],'the crack leads to Hillside Crest III and finishes the chapter (%s %s %s)'%(r['arrived'],r['insr'],r['st']))
    exp(r['folsBack']>=1,'companions back afterwards (%s)'%r.get('folsInfo'))
    exp('Ride up to' in r['roadAfter'],'afterwards the road leads straight on (%s)'%r['roadAfter'])
    exp(r['oldSt']==0 and not r['oldDone'] and r['oldReached'],'old saves: not started, or done if III was reached')
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v153 ascent:',len(fails),'fails')
play.run(s)
