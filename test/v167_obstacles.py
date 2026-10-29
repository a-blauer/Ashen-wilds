# v167: the Hilltop Ascent's obstacles (logs, rolling boulders, narrow ledges), the faster mount and Skarrith's mouth.
#  * the course: enough of each kind, seeded (same every load), clear of the broken stretches and of each other
#  * collision true to the object: the drawn trunk / boulder stays within a few % of its collision radius; the hit tests answer
#    exactly at the shape's edge (just over a log's top: clear; just into it: hit; a boulder's sphere; a narrow ledge's edge line)
#  * riding into a log or boulder: a crash (slowed, health untouched, the log breaks apart); jumping a log clears it; the outer
#    side of a narrow ledge: you fall; the inner side: you ride on; Skarrith smashes a log in its way
#  * a boulder rolls off the wall across the trail and off the lip; venom never lands on an obstacle
#  * speed: the mount 35% faster, Skarrith scaled with it; the mouth's corners are joined (cheek skin) and the jaw eases (no snap)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(n,f)=>{for(let i=0;i<n;i++){T+=33;if(f)f();homeTick(1/30,T)}};
  newMount(MNTK[0]);const I2=INSL[6];toPos(I2.ba[0],I2.ba[1]);tick(6);ch153Enter();await wait(1400);tick(4);
  const S=CH153.S,P=S.P,O=ch167Obs(),G=ch153Course().gaps;out.kinds={};O.forEach(q=>out.kinds[q.k]=(out.kinds[q.k]||0)+1);out.built=(S.ob||[]).length===O.length;
  // spacing: no obstacle within 8 of a broken stretch or of another obstacle
  out.minSep=99;O.forEach((q,i)=>{const e=ch167Ext(q);G.forEach(g=>{out.minSep=Math.min(out.minSep,Math.max(e[0]-(g.s+g.len/2),(g.s-g.len/2)-e[1]))});O.forEach((q2,j)=>{if(j<=i)return;const e2=ch167Ext(q2);out.minSep=Math.min(out.minSep,Math.max(e[0]-e2[1],e2[0]-e[1]))})});
  out.minSep=+out.minSep.toFixed(1);
  // the drawn shapes against their collision shapes (radius from the axis / the centre, in the model's own space)
  {let lo=9,hi=0;S.ob.filter(b=>b.q.k=='log').forEach(b=>{const tr=b.m.children[0],p=tr.geometry.attributes.position;for(let i=0;i<p.count;i++){const r=Math.hypot(p.getY(i),p.getZ(i))/b.q.r;lo=Math.min(lo,r);hi=Math.max(hi,r)}});out.logR=[+lo.toFixed(3),+hi.toFixed(3)]}
  {let lo=9,hi=0;S.ob.filter(b=>b.q.k=='rock').forEach(b=>{const p=b.m.geometry.attributes.position;for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i),p.getZ(i))/b.q.r;lo=Math.min(lo,r);hi=Math.max(hi,r)}});out.rockR=[+lo.toFixed(3),+hi.toFixed(3)]}
  // the log model lies where its collision cylinder is: its world bounding box spans o0..o1 at height r
  {const b=S.ob.find(x=>x.q.k=='log'),q=b.q,[x0,z0,h]=P.at(q.s,q.o0),[x1,z1]=P.at(q.s,q.o1),bb=new THREE.Box3().setFromObject(b.m.children[0].children.length?b.m.children[0]:b.m);
    const tr=b.m.children[0];tr.geometry.computeBoundingBox();const c=tr.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(tr.matrixWorld);out.logAt=[+Math.hypot(c.x-(x0+x1)/2,c.z-(z0+z1)/2).toFixed(2),+(c.y-(h+q.r)).toFixed(2)]}
  // the hit tests at the shape's edge
  {const q=O.find(x=>x.k=='log'&&x.o0<-P.hw(x.s)&&x.o1>P.hw(x.s)),R={s:q.s,o:0,y:2*q.r+.02};out.logOver=ch167HitLog(R,q);R.y=2*q.r-.05;out.logInto=ch167HitLog(R,q);
    R.y=0;R.s=q.s-q.r-CH167.ml-.02;out.logBefore=ch167HitLog(R,q);R.s+=.06;out.logTouch=ch167HitLog(R,q);
    const qp=O.find(x=>x.k=='log'&&x.o1<P.hw(x.s));if(qp){const R2={s:qp.s,o:qp.o1+CH167.mw+.02,y:0};out.logRound=ch167HitLog(R2,qp);R2.o-=.06;out.logEnd=ch167HitLog(R2,qp)}}
  {const b=S.ob.find(x=>x.q.k=='rock'),q=b.q;b.o=0;b.y=q.r;const R={s:q.s-q.r-CH167.ml-.02,o:0,y:0};out.rockBefore=ch167HitRock(R,b);R.s+=.06;out.rockTouch=ch167HitRock(R,b);R.s=q.s;R.o=q.r+CH167.mw+.02;out.rockSide=ch167HitRock(R,b);ch167RockHome(P,b)}
  const keep=r0=>{r0.ph='run';r0.t=9;r0.sn.s=r0.s-22;r0.sn.spit=99;r0.sn.spitAt=null;r0.jt=-1;r0.y=0;r0.slow=0;r0.bst=0;r0.v=CH153V.spd};
  const jg=()=>{const R=CH153.R,g=G.find(q=>q.s-q.len/2>R.s);if(g&&g.s-g.len/2-R.s<1.2&&R.y<.05)CH153.jumpQ=.1};
  const hp0=hero.hp;
  // a log: ride into it: a crash, slowed, the log broken; jump it: clear
  {const q=O.find(x=>x.k=='log'&&x.o0<-P.hw(x.s)&&x.o1>P.hw(x.s)),b=S.ob.find(x=>x.q===q);ch153Reset(false);tick(60);let R=CH153.R;R.s=q.s-6;R.o=0;keep(R);
    let vMin=99;tick(30,()=>{if(R.crash>0)vMin=Math.min(vMin,R.v/CH153V.spd)});out.logCrash=[R.crashes||0,+vMin.toFixed(2),b.st,!b.m.visible,R.ph];tick(45);out.logRecover=+(R.v/CH153V.spd).toFixed(2);
    ch153Reset(false);tick(60);R=CH153.R;out.logBack=b.st===0&&b.m.visible;R.s=q.s-6;R.o=0;keep(R);let j=0;tick(30,()=>{if(!j&&R.s+CH167.ml>q.s-q.r-1.1){CH153.jumpQ=.1;j=1}});out.logJump=[R.crashes||0,R.ph,R.s>q.s+2]}
  // Skarrith smashes a log in its way
  {const q=O.filter(x=>x.k=='log')[1],b=S.ob.find(x=>x.q===q);ch153Reset(false);tick(60);const R=CH153.R;keep(R);R.s=q.s+30;R.sn.s=q.s-4;CH167.off=1;tick(20);CH167.off=0;out.snakeSmash=b.st===1&&!b.m.visible}
  // a narrow ledge: the outer side falls, the inner side rides on
  {const q=O.find(x=>x.k=='nar');ch153Reset(false);tick(60);let R=CH153.R;R.s=q.s-q.len/2-4;R.o=P.hw(q.s)-.6;keep(R);tick(30,jg);out.narOut=[R.ph,R.dead&&R.dead.why];tick(40);
    ch153Reset(false);tick(60);R=CH153.R;R.s=q.s-q.len/2-4;R.o=-P.hw(q.s)+.7;keep(R);tick(Math.ceil((q.len+8)/CH153V.spd*30),jg);out.narIn=[R.ph,R.s>q.s+q.len/2];
    // exactly at the edge line: the centre .05 inside rides, .15 past falls
    const E=ch167Edge(q.s);ch153Reset(false);tick(60);R=CH153.R;R.s=q.s-.2;R.o=E.o+.05;keep(R);R.v=.01;CH153V.lat0=CH153V.lat;CH153V.lat=0;tick(2);out.narEdgeIn=R.ph;R.o=E.o+.15;tick(2);out.narEdgeOut=R.ph;CH153V.lat=CH153V.lat0;tick(80)}
  // a boulder rolls off the wall, across the trail and off the lip
  {const q=O.find(x=>x.k=='rock'),b=S.ob.find(x=>x.q===q);ch153Reset(false);tick(60);const R=CH153.R;R.s=q.s-60;R.o=0;keep(R);CH167.off=1;const st=[];let onTrail=0;
    const s0=b.o;tick(Math.ceil(90/CH153V.spd*30),()=>{jg();if(st[st.length-1]!==b.st)st.push(b.st);if(b.st==2&&Math.abs(b.o)<P.hw(q.s)-.5&&Math.abs(b.y-q.r)<.05)onTrail=1});CH167.off=0;
    out.roll={st,onTrail,from:+s0.toFixed(1),to:+b.o.toFixed(1),y:+b.y.toFixed(1)}}
  out.hp=hero.hp===hp0;
  // venom never lands on an obstacle (or just before one)
  {let bad=0;const KP=ch167Keep();for(let s=40;s<P.S-40;s+=7)[1,2,3].forEach(n=>{ch153SpitPlan(n,s,0,CH153V.spd).forEach(L=>{O.forEach(q=>{const e=ch167Ext(q);if(L[0]>e[0]-3&&L[0]<e[1]+1.5)bad++})})});out.venomOnObs=bad}
  // speed
  out.spd=[CH153V.spd,CH164.snV[0],CH164.snV[1],CH153V.slow0];
  // the mouth: cheek skin at both corners follows the jaw; the jaw eases instead of snapping
  {const M=S.sn,ck=M.head.userData.cheek;out.cheek=!!ck&&ck.length==2;if(out.cheek){ch167Cheek(M.head,.95);const p=ck[0].geo.attributes.position.array;out.cheekOpen=+(p[(CH164B.ckN-1)*6+1]-p[(CH164B.ckN-1)*6+4]).toFixed(2);ch167Cheek(M.head,0);out.cheekShut=+Math.abs(p[(CH164B.ckN-1)*6+1]-p[(CH164B.ckN-1)*6+4]).toFixed(2)}
    ch153Reset(true);const R=CH153.R;let mx=0,last=null;for(let i=0;i<120&&R.ph=='intro';i++){tick(1);const j=M.jaw.rotation.x;if(last!=null)mx=Math.max(mx,Math.abs(j-last));last=j}
    for(let i=0;i<20;i++){tick(1);const j=M.jaw.rotation.x;mx=Math.max(mx,Math.abs(j-last));last=j}out.jawStep=+mx.toFixed(3)}
  out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    exp=lambda c,m:(None if c else F(m))
    k=r['kinds']
    exp(k.get('log',0)>=8 and k.get('rock',0)>=5 and k.get('nar',0)>=3 and r['built'],'the course has logs, boulders and narrow ledges (%s)'%k)
    exp(r['minSep']>=7.5,'obstacles keep clear of broken stretches and of each other (closest %s)'%r['minSep'])
    exp(r['logR'][0]>=.95 and r['logR'][1]<=1.05,'a log is drawn as its collision cylinder (radius x%s)'%r['logR'])
    exp(r['rockR'][0]>=.95 and r['rockR'][1]<=1.05,'a boulder is drawn as its collision sphere (radius x%s)'%r['rockR'])
    exp(r['logAt'][0]<.05 and abs(r['logAt'][1])<.05,'the log model lies on its collision line (%s)'%r['logAt'])
    exp(not r['logOver'] and r['logInto'],'just over the trunk: clear; just into it: hit')
    exp(not r['logBefore'] and r['logTouch'],'just before the trunk: clear; touching it: hit')
    if 'logRound' in r:exp(not r['logRound'] and r['logEnd'],'past a short log\'s end: clear; at its end: hit')
    exp(not r['rockBefore'] and r['rockTouch'] and not r['rockSide'],'a boulder\'s sphere: before / touching / beside (%s %s %s)'%(r['rockBefore'],r['rockTouch'],r['rockSide']))
    c=r['logCrash']
    exp(c[0]==1 and c[1]<=.45 and c[2]==1 and c[3] and c[4]=='run','riding into a log: one crash, slowed, the log breaks apart (%s)'%c)
    exp(r['logRecover']>=.95,'after a crash the mount gets back to speed (%s)'%r['logRecover'])
    exp(r['logBack'],'a restart puts the log back')
    exp(r['logJump'][0]==0 and r['logJump'][1]=='run' and r['logJump'][2],'jumping a log clears it (%s)'%r['logJump'])
    exp(r['snakeSmash'],'Skarrith smashes a log in its way')
    exp(r['narOut'][0]=='dead' and r['narOut'][1]=='fall','the outer side of a narrow ledge: you fall (%s)'%r['narOut'])
    exp(r['narIn'][0]=='run' and r['narIn'][1],'the inner side: you ride on (%s)'%r['narIn'])
    exp(r['narEdgeIn']=='run' and r['narEdgeOut']=='dead','the edge line is the fall line (%s / %s)'%(r['narEdgeIn'],r['narEdgeOut']))
    ro=r['roll']
    exp(ro['st'][:4]==[0,1,2,3] and ro['onTrail'] and ro['to']>ro['from']+8 and ro['y']<-1,'a boulder wobbles, rolls across the trail and off the lip (%s)'%ro)
    exp(r['hp'],'the hero\'s health is never touched')
    exp(r['venomOnObs']==0,'venom never lands on an obstacle (%s)'%r['venomOnObs'])
    sp=r['spd']
    exp(abs(sp[0]-11.07)<.01 and abs(sp[1]-11.54)<.02 and abs(sp[2]-11.95)<.02 and abs(sp[3]-8.64)<.01,'the mount is 35%% faster and Skarrith with it (%s)'%sp)
    exp(r['cheek'] and r.get('cheekOpen',0)>.5 and r.get('cheekShut',9)<.15,'the mouth corners are joined by skin that opens with the jaw (%s / %s)'%(r.get('cheekOpen'),r.get('cheekShut')))
    exp(r['jawStep']<.25,'the jaw eases, no snap in one frame (biggest step %s rad)'%r['jawStep'])
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v167 obstacles:',len(fails),'fails')
play.run(s)
