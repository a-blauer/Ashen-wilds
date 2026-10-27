# v153: the Hilltop Ascent (Hillside Crest main quest, chapter 2): the hill road in Mistmere (mount needed), entering mounted,
# the intro and the start of the run, steering direction, jumping, a crash costs a hit and slows you, venom, the snake catching
# you (swallowed → restart), an autopilot that rides the whole trail (steers round obstacles, jumps logs and gaps, swerves from
# strikes and venom) — it must finish in about two minutes with hits to spare — the finish into III, saves, the road afterwards.
# v157: the emergence (in view, not culled, debris), the boost (Shift / dash button, charges, jump, fairness), the autopilot boosts.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
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
  tick(3.3);out.ph1=R().ph;const P=CH153.S.P;
  // steering: D moves the hero to the camera's right
  {const p0=pl.position.clone(),yw=P.yaw(R().s),rx=-Math.cos(yw),rz=Math.sin(yw);K.d=1;tick(.4);K.d=0;const d=pl.position.clone().sub(p0);out.steerRight=+(d.x*rx+d.z*rz).toFixed(2)}
  // a jump lifts you
  CH153.jumpQ=.2;tick(.3);out.jumpY=+R().y.toFixed(2);tick(.6);
  // v157 the boost: Shift / the dash button spurs the mount (CH157.mul for CH157.T s), CH157.n charges, a jump while boosting
  {const r0=R();r0.inv=99;r0.sn.s=r0.s-16;r0.bc=CH157.n;r0.bst=0;r0.v=CH153V.spd;const sh=()=>dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true}));
    r0.stum=.9;sh();out.bstOn=r0.bst>0;out.bStum=r0.stum;out.bc1=+r0.bc.toFixed(2);sh();out.bc1b=+r0.bc.toFixed(2);tick(.4);out.bV=+(r0.v/CH153V.spd).toFixed(2);
    CH153.jumpQ=.2;tick(.2);out.bJumpY=+r0.y.toFixed(2);out.bJumpBst=r0.bst>0;tick(.9);out.bOff=r0.bst==0;tick(.8);out.bVafter=+(r0.v/CH153V.spd).toFixed(2);
    const db=document.querySelector('#mbtn [data-m=dash]');if(db){db.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}))}out.bBtn=r0.bst>0;out.bc2=+r0.bc.toFixed(2);tick(1.1);
    sh();out.bDeny=r0.bst==0;tick(5.2);out.bRefill=+r0.bc.toFixed(2);r0.inv=0}
  // v157 fair: a boost buys real distance, Skarrith wins it back over time (the rubber band)
  {const run=(boost)=>{const r0=R();r0.ph='run';r0.t=9;r0.s=140;r0.o=-2.2;r0.y=0;r0.jt=-1;r0.v=CH153V.spd;r0.stum=0;r0.inv=99;r0.bst=0;r0.bc=CH157.n;const N=r0.sn;N.s=140-15.1;N.v=CH153V.spd;N.strike=null;N.next=99;N.spit=99;
      CH153.S.K.slides.forEach(q=>q.done=1);if(boost)ch157Boost();tick(1.2);const g1=r0.s-N.s;tick(10);return [+g1.toFixed(1),+(r0.s-N.s).toFixed(1),+r0.s.toFixed(1)]};
    const a=run(false),b=run(true);out.bandNo=a;out.bandBoost=b;R().inv=0;R().hp=3}
  // a crash: put a boulder right in front of you
  {const r0=R();r0.inv=0;const hp=r0.hp,ob=CH153.S.obs.find(o=>o.k=='boulder');r0.s=ob.s-1.2;r0.o=ob.o;r0.y=0;r0.jt=-1;tick(.4);out.crashHp=hp-r0.hp;out.stum=r0.stum>0||r0.v<5}
  // swallowed: let it catch you
  {const r0=R();r0.inv=0;r0.sn.s=r0.s-2;tick(.3);out.dead=r0.ph=='dead'&&r0.dead.why;tick(2.4);await wait(900);tick(.3);out.restart=R()&&R().ph;out.hp3=R()&&R().hp}
  // the autopilot rides the whole trail
  // 1) the rocks are always passable: plan a line across the whole trail (lanes every .1, a step every .05 s at full speed,
  //    sideways at most what the mount can steer), logs and gaps are jumped
  const S0=CH153.S,DS=CH153V.spd*.05,DO=CH153V.lat*.05*.9,blocked=(s,o,m)=>S0.obs.some(q=>q.k!='gap'&&q.k!='log'&&Math.abs(s-q.s)<q.l/2+.6+(m||0)&&Math.abs(o-q.o)<q.w/2+.42+(m||0));
  const plan=[];{let reach=new Map([[0,null]]);const lanes=o=>Math.round(o*10);let s=CH153.S.K.start,steps=[];
    while(s<P.S-7){const hw=P.hw(s),nx=new Map(),Dm=Math.floor(DO*10);for(let ad=0;ad<=Dm;ad++)for(const [k] of reach){for(const d of ad?[-ad,ad]:[0]){const k2=k+d,o=k2/10;if(Math.abs(o)>hw-.55||nx.has(k2)||blocked(s+DS,o,.3))continue;nx.set(k2,k)}}   // the smallest change wins: a smooth line
      steps.push(nx);reach=nx;s+=DS;if(!nx.size)break}
    out.planOk=reach.size>0;out.planNarrow=99;steps.forEach((m,si)=>{if(si>40&&m.size){const ks=[...m.keys()];out.planNarrow=Math.min(out.planNarrow,(Math.max(...ks)-Math.min(...ks))/10)}});
    if(reach.size){let k=[...reach.keys()].sort((a,b)=>Math.abs(a)-Math.abs(b))[0];for(let i=steps.length-1;i>=0;i--){plan.unshift(k/10);k=steps[i].get(k);if(k==null)break}}}
  // 2) ride that line with venom and strikes off: it must reach the summit in about two minutes, untouched, never caught
  const vSave=CH153.S.K.venom.slice(),stSave=CH153V.strike.slice();CH153.S.K.venom.length=0;CH153V.strike[0]=-1;
  ch153Reset(false);tick(1.7);let boosts=0;const ride=(noHit)=>{let t=0,minGap=99,deaths=0;while(t<220){tick(.05,()=>{const r0=R();if(!r0||r0.ph!='run')return;
      if(r0.bc>=CH157.n-.01&&!(r0.bst>0)&&ch157Boost())boosts++;   // v157: the autopilot boosts whenever both charges are full
      const i=Math.round((r0.s-CH153.S.K.start)/DS);const f=(r0.s-CH153.S.K.start)/DS-1,j=Math.max(0,Math.min(plan.length-2,Math.floor(f))),tgt=plan[j]+(plan[j+1]-plan[j])*Math.max(0,Math.min(1,f-j));r0.o=tgt;K.d=K.a=0;   // on the line exactly (the plan keeps to the mount's sideways speed)if(r0.s>38&&r0.s<56)(out.trace||(out.trace=[])).push([+r0.s.toFixed(1),+r0.o.toFixed(2),+tgt.toFixed(1),K.d?1:K.a?-1:0,+(r0.steer||0).toFixed(2)]);
      S0.obs.forEach(q=>{const d=q.s-r0.s;if((q.k=='log'&&d<2.6&&d>-q.l/2)||(q.k=='gap'&&d<q.l/2+1.6&&d>-q.l/2))CH153.jumpQ=.1});S0.slides.forEach(b=>{const d=b.s-r0.s;if(d>-.5&&d<2.4&&b.t>-.2&&Math.abs(b.o-r0.o)<3.5)CH153.jumpQ=.1})});
    t+=2/30;const r0=R();if(!r0)break;if(r0.ph=='run')minGap=Math.min(minGap,r0.s-r0.sn.s);if(r0.ph=='dead'){deaths++;break}if(r0.ph=='win')break}K.a=K.d=0;return {t:Math.round(t),minGap:+minGap.toFixed(1),deaths,hits:3-(R()?R().hp:0),ph:R()?R().ph:'gone',s:R()?Math.round(R().s):0,log:R()&&R().log}};
  out.planAt50=[45,48,50,51,52,53,55].map(x=>plan[Math.round((x-CH153.S.K.start)/DS)-1]);out.planLen=plan.length;out.sgn=P.sgn;
  const a=ride();out.cleanT=a.t;out.boosts=boosts;out.cleanHits=a.hits;out.cleanMinGap=a.minGap;out.cleanPh=a.ph;out.cleanS=a.s;out.cleanLog=a.log;
  CH153.S.K.venom.push(...vSave);CH153V.strike.splice(0,3,...stSave);
  // 3) every venom volley leaves somewhere to go: spit volleys of 1..3 at a rider in the middle and at the edges
  out.spitLane=99;[1,2].forEach(n=>[-1.6,0,1.6].forEach(o=>{for(let k=0;k<12;k++){const r0=R();r0.ph='run';r0.o=o;r0.s=[60,90,120,160,200,500,540,580,700,720,780,800][k];const before=CH153.S.globs.length;ch153Spit(n);const G=CH153.S.globs.slice(before);if(!G.length){out.spitEmpty=(out.spitEmpty||0)+1;out.spitDbg=[r0.s,r0.ph,before,CH153.S.globs.length];continue}
      const hw=P.hw(G[0].s);let bestW=0,run=0;for(let x=-hw+.55;x<=hw-.55;x+=.05){if(G.every(g=>Math.abs(x-g.o)>=1.35)){run+=.05;bestW=Math.max(bestW,run)}else run=0}out.spit2s=G.length==2?Math.abs(G[1].s-G[0].s):out.spit2s;out.spitLane=Math.min(out.spitLane,+bestW.toFixed(2));
      G.forEach(g=>{CH153.S.root.remove(g.m);CH153.S.root.remove(g.w)});CH153.S.globs.splice(before)}}));
  ch153Reset(false);tick(1.7);
  // the finish into III
  if(R()&&R().ph!='win'){R().s=P.S-8;R().sn.s=P.S-30;R().ph='run';tick(.4)}tick(2.6);await wait(1300);tick(.5);const c=curIns();out.arrived=c&&c.g;out.insr=INSR[1];out.st=CH153Q.st;out.done=ch153Done();
  out.folsBack=fols.filter(f=>f&&f.visible).length;
  {toPos(I2.ba[0],I2.ba[1]);tick(.2);toPos(s.x,s.z);tick(.1);out.roadAfter=(worldPrompt()||{}).label||''}
  const sv=x2Save();out.saved=JSON.stringify(sv.ch153);const old=JSON.parse(JSON.stringify(sv));delete old.ch153;old.insr=[0,1,0,0,0,0];x2Load(old);out.oldSt=CH153Q.st;out.oldDone=ch153Done();old.insr=[0,2,0,0,0,0];x2Load(old);out.oldReached=ch153Done();
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000]);print('TRACE',json.dumps((r.get('trace') or [])[::3]));print('LOG',json.dumps(r.get('cleanLog')),r.get('planAt50'),r.get('planLen'),r.get('sgn'),r.get('planNarrow'))
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
    exp(r['bstOn'] and r['bStum']==0 and r['bc1']==1 and r['bc1b']==1,'Shift boosts (one charge, no double boost, a stumble shaken off) (%s %s %s)'%(r['bc1'],r['bc1b'],r['bStum']))
    exp(r['bV']>=1.4,'boosting: the mount runs ~1.5x (%s)'%r['bV'])
    exp(r['bJumpY']>1 and r['bJumpBst'],'jumping while boosting works (%s)'%r['bJumpY'])
    exp(r['bOff'] and r['bVafter']<=1.05,'the boost ends after about a second (%s)'%r['bVafter'])
    exp(r['bBtn'] and r['bc2']<.6,'the touch dash button boosts (%s)'%r['bc2'])
    exp(r['bDeny'] and r['bRefill']>=.95,'out of charges: no boost; a charge refills in ~5 s (%s)'%r['bRefill'])
    a,b=r['bandNo'],r['bandBoost']
    exp(b[0]-a[0]>=3,'a boost buys real distance (gap %s vs %s)'%(b[0],a[0]))
    exp(b[1]-a[1]<=1.5,'Skarrith wins it back within ~10 s (gap %s vs %s)'%(b[1],a[1]))
    exp(r.get('boosts',0)>=8,'the autopilot boosted along the trail (%s)'%r.get('boosts'))
    exp(r['steerRight']>.5,'D steers to the right of the screen (%s)'%r['steerRight'])
    exp(r['jumpY']>1,'Space jumps (%s)'%r['jumpY'])
    exp(r['crashHp']==1 and r['stum'],'a crash costs a hit and slows you')
    exp(r['dead']=='swallow' and r['restart'] in ('intro','run') and r['hp3']==3,'caught → swallowed → the chase starts again (%s %s)'%(r['dead'],r['restart']))
    exp(r['planOk'] and r['planNarrow']>=.8,'every stretch of rocks leaves a lane (narrowest %s)'%r['planNarrow'])
    exp(r['cleanPh']=='win' and r['cleanHits']==0,'riding a clean line reaches the summit untouched (%s at %s, hits %s %s)'%(r['cleanPh'],r['cleanS'],r['cleanHits'],r['cleanLog']))
    exp(90<=r['cleanT']<=135,'about two minutes, boosting (%s s)'%r['cleanT'])
    exp(r['cleanMinGap']>4,'the snake stays close but never catches a clean rider (closest %s)'%r['cleanMinGap'])
    exp(r['spitLane']>=.6,'every venom volley leaves a lane to escape into (narrowest %s)'%r['spitLane'])
    exp(r['arrived']==7 and r['insr']>=2 and r['st']==2 and r['done'],'the crack leads to Hillside Crest III and finishes the chapter (%s %s %s)'%(r['arrived'],r['insr'],r['st']))
    exp(r['folsBack']>=1,'companions back afterwards')
    exp('Ride up to' in r['roadAfter'],'afterwards the road leads straight on (%s)'%r['roadAfter'])
    exp(r['oldSt']==0 and not r['oldDone'] and r['oldReached'],'old saves: not started, or done if III was reached')
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v153 ascent:',len(fails),'fails')
play.run(s)
