# v181: foe attacks (src/js/3400-v181-foe-attacks.js) — every humanoid foe's blow lands on the target in front of it.
# For each foe the attack is played on the game's own timeline (g.ak = {n, ph, k}) and measured at the moment the game
# hits (melee: act k .45; slam / rainfire: the act's end; bolt / throw: the act's start, when the shot leaves):
#  * melee weapons: the weapon's head in front of the body (toward the target, +z), at a sensible height (around the
#    target's chest; near the ground for a slam), the weapon hand in front of the shoulders;
#  * unarmed: the striking hand in front at a sensible height;  casters / slings: the staff head or hand forward; archers: the bow hand;
#  * the weapon stays in the fist all through the attack (the point held in the fist on the hand's grip anchor);
#  * the recovery never takes the weapon's head further toward the target than it was at the hit (no "second blow");
#  * the weapon (from a third of the way up the handle to the head) never passes through the head (a capsule round the
#    head bone, radius HEAD_R x the height / 1.7); in the recovery, its last frames too, it never comes nearer the head
#    than that (or than the carry grip itself, for a weapon carried by the head);
#  * WEAPON FACING (owner: a hard rule), every weapon foe, both strike variants (the foe's 1st and 2nd attack): at the hit
#    the edge (axe / great-axe bit, sword / greatsword / dagger-slash edge, hammer face, halberd blade on the sweep) is within
#    30 deg of the head's travel and not turned back toward the foe; on thrusts (dagger stab, halberd thrust) the point is
#    within 30 deg; inside the blow the edge is never over 120 deg off its travel, never faces up on a downward swing, and a
#    one-sided blade never faces the foe's own body (FAIL lines name the foe, the frame and the angle);
#  * the weapon inside the fist: the handle tilts at most FIST_TILT (18) deg away from the carry grip and rolls at most
#    FIST_ROLL (50) deg about its own axis, at every frame (more shows as a weapon angling inside a closed hand);
#  * NO JUMPS (owner: "weapons flip around in the hand right before the swing"): at every game tick (30 fps, FPS=60 too)
#    of every move the weapon turns at most TURN (40) deg per 1/30 s (TURN_FAST, 70, in the strike's 3 fastest ticks), spins
#    about its own handle at most SPIN (25), and neither the weapon, its spin nor the hand turns back and forth over 3 ticks
#    (not the slinger's whirl, which spins the sling round by design);
#  * the off hand on a two-handed haft (staff cast: FAIL; great axe, greatsword, hammer, halberd: WARN): with the grip on, the shaft runs
#    through the off fist (within 0.03 x scale of its grip), the palm faces the shaft (> 0.5) and away from the body (the hand
#    on the body's side of the shaft, knuckles out), and the off forearm stays clear of the shaft;
#  * the feet stay planted (ankles within a few cm of where they stood), no NaN, the pose returns to the plain stance after;
#  * one real enemy fight step (mStart / mTick / animC): the system drives the attack and the head lands toward the hero.
# ONLY=orc,gharial  HEAD_R=.07
import os,sys,json,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
HEAD_R=float(os.environ.get('HEAD_R','.07'))
FPS=int(os.environ.get('FPS','30'))
TURN,TURN_FAST,SPIN,FLICK=40,70,25,8   # deg per 1/30 s: any tick, the 3 fastest strike ticks, spin about the handle; back-and-forth floor
FIST_TILT=float(os.environ.get('FIST_TILT','18'));FIST_ROLL=float(os.environ.get('FIST_ROLL','50'))   # the weapon inside the closed fist
FOES=[('brigand','strike'),('orc','strike'),('orc','slam'),('troll','strike'),('hobgoblin','strike'),('skeleton','strike'),('nagaw','strike'),
  ('executioner','strike'),('giant','strike'),('giant','slam'),('jotun','strike'),('vampk','strike'),('hollowknight','strike'),('hollowknight','slam'),
  ('gharial','strike'),('bandit','strike'),('vamp','strike'),('ss165zealot','strike'),
  ('tombpriest','bolt'),('cultist','bolt'),('cultist','rainfire'),('trollsh','bolt'),('shaman','bolt'),('ss165caller','bolt'),('vampm','bolt'),('nagas','bolt'),('revenant','bolt'),
  ('slinger','throw'),('bonearcher','throw'),('nagaa','throw'),('slinger','strike'),('selem','bolt'),
  ('ghoul','strike'),('dgwretch','strike'),('nosferatu','strike'),('wendigo','strike'),('akidon','strike'),('akorror','strike'),('lichen','strike'),('gargoyle','strike'),
  ('yeti','strike'),('amalgam','strike'),('saltgolem','strike'),('colossus','strike'),('drowned','strike')]
if os.environ.get('ONLY'):
    keep=os.environ['ONLY'].split(',');FOES=[f for f in FOES if f[0] in keep]
JS=r"""([k,n,rep2,hr,FPS])=>{const V=THREE.Vector3,P=o=>new V().setFromMatrixPosition(o.matrixWorld);
 const c=enemyC(k,20,{}),g=cr(c);scene.add(g);let T=5000;const step=ms=>{T+=ms;animC(g,T,false,0);g.position.set(0,0,0);g.rotation.y=0;g.updateMatrixWorld(true)};for(let i=0;i<40;i++)step(16);
 const out={k,n,err:[]},b=g.h&&g.h.bones;if(!b){out.err.push('no bones');scene.remove(g);return out}
 const bb=new THREE.Box3().setFromObject(g),H=bb.max.y-bb.min.y;out.H=H;
 const M=MV[n],hitPh=n=='strike'?[1,.45]:n=='slam'||n=='rainfire'?[1,1]:[1,0];
 const feet0=b.lh2&&!g.h.nt?[P(b.lh2),P(b.rh2)]:null,sh0=P(b.aR0).add(P(b.aL0)).multiplyScalar(.5),chest0=P(b.chest);
 const rot0={};['aR0','aR1','aR2','aL0','aL1','spine','pelvis'].forEach(x=>rot0[x]=b[x].quaternion.clone());
 const dt=1/(FPS||30),tl=[];for(let t=0;t<M.wind;t+=dt)tl.push([0,t/M.wind]);for(let t=0;t<M.act;t+=dt)tl.push([1,t/M.act]);tl.push(hitPh);for(let t=M.rec;t>0;t-=dt)tl.push([2,t/M.rec]);
 const tOf=(ph,kk)=>ph==0?kk*M.wind:ph==1?M.wind+kk*M.act:M.wind+M.act+(1-kk)*M.rec;
 tl.sort((a,c)=>tOf(a[0],a[1])-tOf(c[0],c[1]));   /* the hit sample in its place in time (the head's travel is measured frame to frame) */
 // the alternate strike: one unmeasured attack first, so this one is the foe's second
 if(rep2){for(const [ph,kk] of tl){g.ak={n,ph,k:Math.max(0,Math.min(1,kk))};step(dt*1000)}g.ak=null;for(let i=0;i<6;i++)step(dt*1000)}
 let maxGrip=0,maxFoot=0,nan=0,res=null,driven=0,hitZ=null,recOver=null,headMin=9,headAt=null,fi=0,carryHead=null,recHead=[0,9];const sc=H/1.7;
 let offG={},fist={},shF=null,bowF=null,wEdge=0,prevTip=null,prevT=0,face=null,maxBack=null,foeFace=null,upDown=null,tn='';const ang=(a,b)=>Math.acos(Math.max(-1,Math.min(1,a.dot(b)/(a.length()*b.length()||1))))*57.2958;
 const fa0=()=>g._fa;
 let tPrv=-dt,rq=null,rh=null,rw=[],fr=0;
 for(const e of tl){const [ph,kk]=e;g.ak={n,ph,k:Math.max(0,Math.min(1,kk))};const tN=tOf(ph,kk);step(Math.max(1,(tN-tPrv)*1000));tPrv=tN;const S=g._fa;if(S&&S.ph>=0)driven=1;
  /* NO JUMPS (owner: weapons flipped round in the hand before the swing): every game tick (the hit sample between two ticks
     is skipped), the weapon's turn in the world, its spin about its own handle and the hand's turn since the last tick */
  {const isHit=e===hitPh,we2=S&&S.we;
   if(!isHit&&we2&&we2.W.parent){fr++;const q=new THREE.Quaternion(),hq=new THREE.Quaternion();we2.W.matrixWorld.decompose(new V(),q,new V());b[S.side<0?'aL2':'aR2'].matrixWorld.decompose(new V(),hq,new V());
    if(rq){const d=q.clone().multiply(rq.clone().invert());if(d.w<0){d.x=-d.x;d.y=-d.y;d.z=-d.z;d.w=-d.w}const an=2*Math.acos(Math.min(1,d.w)),sn=Math.sqrt(Math.max(0,1-d.w*d.w)),wv=sn>1e-6?new V(d.x,d.y,d.z).multiplyScalar(an/sn):new V();
      const ax=new V(0,1,0).applyQuaternion(q),sp=2*Math.atan2(d.x*ax.x+d.y*ax.y+d.z*ax.z,d.w);
      const dh=hq.clone().multiply(rh.clone().invert());if(dh.w<0){dh.x=-dh.x;dh.y=-dh.y;dh.z=-dh.z;dh.w=-dh.w}const ah=2*Math.acos(Math.min(1,dh.w)),sh=Math.sqrt(Math.max(0,1-dh.w*dh.w)),hv=sh>1e-6?new V(dh.x,dh.y,dh.z).multiplyScalar(ah/sh):new V();
      rw.push({f:fr,ph,k:+kk.toFixed(2),s:+(S.sT||0).toFixed(2),a:an*57.2958,sp:sp*57.2958,h:ah*57.2958,w:wv.toArray(),hv:hv.toArray()})}
    rq=q;rh=hq}}
  /* THE OFF HAND ON A TWO-HANDED HAFT (owner: it gripped the staff from the far side): with the grip fully on, the shaft runs
     through the off fist (its grip anchor), the palm faces the shaft, the palm faces away from the body (the hand on the
     body's side of the shaft, knuckles out) and the off forearm does not cross the shaft */
  {const S2=g._fa;if(S2&&S2.haft&&S2.we&&S2.T&&S2.sT!=null&&S2.owE>.95){const W=S2.we.W,ob=b[S2.side<0?'aR2':'aL2'],o1b=b[S2.side<0?'aR1':'aL1'],oq=new THREE.Quaternion();ob.matrixWorld.decompose(new V(),oq,new V());
    const ap=ob.localToWorld(S2.oAn.clone()),pc=ob.localToWorld(new V(S2.oAn.x,S2.oAn.y,S2.oAn.z-.03)),pn=new V(0,0,1).applyQuaternion(oq).normalize(),a0=W.localToWorld(new V(0,.6,0)),a1=W.localToWorld(new V(0,-(W.userData.faLen||.8),0)),ln=new THREE.Line3(a0,a1),cp=new V();
    ln.closestPointToPoint(ap,false,cp);const dA=ap.distanceTo(cp)/sc;ln.closestPointToPoint(pc,false,cp);const tw=cp.clone().sub(pc),pDot=tw.length()>1e-6?pn.dot(tw.normalize()):1;
    const ch=P(b.chest),hz=cp.clone().sub(ch),ya=a1.clone().sub(a0).normalize();hz.addScaledVector(ya,-hz.dot(ya));const away=hz.length()>1e-6?pn.dot(hz.normalize()):1;
    const e0=P(o1b),e1=P(o1b).lerp(P(ob),.75);let dX=9;for(let j=0;j<=8;j++){const pt=e0.clone().lerp(e1,j/8);const c2=new V();new THREE.Line3(a0,a1).closestPointToPoint(pt,true,c2);dX=Math.min(dX,pt.distanceTo(c2)/sc)}
    if(!offG.n)offG={n:0,dA:[0,0],pDot:[0,9],away:[0,9],dX:[0,9]};offG.n++;if(dA>offG.dA[1])offG.dA=[fi,dA];if(pDot<offG.pDot[1])offG.pDot=[fi,pDot];if(away<offG.away[1])offG.away=[fi,away];if(dX<offG.dX[1])offG.dX=[fi,dX]}}
  b.pelvis.traverse(o=>{if(o.isBone&&(isNaN(o.quaternion.x)||isNaN(o.position.x)))nan=1});
  const side=S&&S.side<0?'L':'R',we=S&&S.we;
  if(we&&we.W.parent){const W=we.W,hd=we.C.hold,hp=W.localToWorld(new V(hd[0],hd[1],hd[2])),gd=g.h._gripD&&g.h._gripD[we.side],an=C=>new V(GRIP_AN[0]+(gd?gd[0]:0),GRIP_AN[1]+(gd?gd[1]:0),GRIP_AN[2]+(gd?gd[2]:0));
    const ap=W.parent.localToWorld(an());maxGrip=Math.max(maxGrip,hp.distanceTo(ap))}
  if(feet0){maxFoot=Math.max(maxFoot,P(b.lh2).distanceTo(feet0[0]),P(b.rh2).distanceTo(feet0[1]))}
  fi++;
  /* the weapon inside the fist: its turn away from the carry grip in the hand's frame, split into the handle's tilt (the
     handle axis leaving the fist's axis; must stay small, or the weapon visibly angles inside the closed hand) and its roll
     about its own axis (a round handle turning in the grip) */
  if(we&&we.W.parent&&!(ph==0&&kk<.02)){const Pq=we.W.quaternion.clone().multiply(we.C.q.clone().invert()),ax=new V(0,1,0).applyQuaternion(we.C.q).normalize();
    const d=Pq.x*ax.x+Pq.y*ax.y+Pq.z*ax.z,tw=new THREE.Quaternion(ax.x*d,ax.y*d,ax.z*d,Pq.w);if(tw.lengthSq()<1e-12)tw.identity();else tw.normalize();
    const sw=Pq.clone().multiply(tw.clone().invert()),tilt=2*Math.acos(Math.min(1,Math.abs(sw.w)))*57.2958,roll=2*Math.acos(Math.min(1,Math.abs(tw.w)))*57.2958;
    if(!fist.t||tilt>fist.t[1])fist.t=[fi,tilt];if(!fist.r||roll>fist.r[1])fist.r=[fi,roll]}
  /* weapon facing: the edge (or point) against the head's travel */
  if(we&&we.W.parent&&S){const W=we.W,L=W.userData.faLen||.8,tipW=W.localToWorld(new V(0,-L,0)),q=new THREE.Quaternion();W.matrixWorld.decompose(new V(),q,new V());
    wEdge=we.edge||0;const t=tOf(ph,kk),ex=new V(1,0,0).applyQuaternion(q),hdir=new V(0,-1,0).applyQuaternion(q);tn=S.T&&S.T.nm||'';
    if(prevTip&&t>prevT+.004){const v=tipW.clone().sub(prevTip).divideScalar(t-prevT),sp=v.length();
      const e=we.edge==2&&ex.dot(v)<0?ex.clone().negate():ex;const isHit=ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6;
      if(isHit)face={edgeAng:ang(e,v),edgeFw:e.z,headAng:ang(hdir,v),sp:sp/sc,frame:fi,e:e.toArray().map(x=>+x.toFixed(2)),v:v.clone().normalize().toArray().map(x=>+x.toFixed(2)),d:hdir.toArray().map(x=>+x.toFixed(2))};
      if(we.edge&&S.hardK>.5&&sp>.8*sc){const a2=ang(e,v);if(!maxBack||a2>maxBack[1])maxBack=[fi,a2]}
      if(we.edge==1&&!(ph==0&&kk<.15)&&!(ph==2&&kk<.15)){const a3=ang(ex,P(b.chest).sub(tipW));if(!foeFace||a3<foeFace[1])foeFace=[fi,a3]}
      if(we.edge&&S.hardK>.5&&sp>.8*sc&&v.y<-.7*sp&&e.y>.2&&ang(e,v)>90&&!upDown)upDown=[fi,e.y,e.toArray().map(x=>+x.toFixed(2)),v.clone().normalize().toArray().map(x=>+x.toFixed(2)),ph,+kk.toFixed(2),+(S.sT||0).toFixed(2),+(S.hardK||0).toFixed(2),+(sp/sc).toFixed(2)]}
    if(!prevTip||t>prevT+.004){prevTip=tipW;prevT=t}}
  if(we&&we.W.parent){const W=we.W,L=W.userData.faLen||.8,hd=we.C.hold,tipZ=W.localToWorld(new V(0,-L,0)).z-P(b.pelvis).z;
    if(ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6)hitZ=tipZ;
    if(ph==2&&hitZ!=null&&tipZ>hitZ+.04*sc&&(!recOver||tipZ-hitZ>recOver[1]))recOver=[fi,tipZ-hitZ];
    // the weapon past the fist against a capsule round the head (head bone up 0.16 x scale)
    {const h0=P(b.head),h1=h0.clone().add(new V(0,.16*sc,0)),seg=new THREE.Line3(h0,h1),cp=new V();let dm=9;
      for(let j=0;j<=6;j++){const y=hd[1]+(-L-hd[1])*(.35+.65*j/6),pt=W.localToWorld(new V(hd[0],y,hd[2]));seg.closestPointToPoint(pt,true,cp);dm=Math.min(dm,pt.distanceTo(cp)/sc)}
      if(!(ph==0&&kk<.15)&&!(ph==2&&kk<.15)&&dm<headMin){headMin=dm;headAt=fi}
      /* the whole recovery, its last frames too: never nearer the head than the capsule (or than the carry grip itself, for a
         weapon carried by the head) */
      if(ph==0&&carryHead==null)carryHead=dm;if(ph==2&&dm<recHead[1])recHead=[fi,dm]}}
  if(ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6&&S&&S.shN){const q=new THREE.Quaternion();S.oA[2].matrixWorld.decompose(new V(),q,new V());shF=+S.shN.clone().applyQuaternion(q).z.toFixed(2)}
  if(ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6&&S&&S.bw&&S.bw.W.parent){const q=new THREE.Quaternion();S.bw.W.matrixWorld.decompose(new V(),q,new V());
    const sx=new V(1,0,0).applyQuaternion(q),ly=new V(0,1,0).applyQuaternion(q);bowF={string:+sx.z.toFixed(2),limb:+Math.abs(ly.y).toFixed(2)}}
  if(ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6){const hb=b[side=='L'?'aL2':'aR2'],hand=P(hb);let tip=null;
    if(we&&we.W.parent){const W=we.W,L=W.userData.faLen||.8;tip=W.localToWorld(new V(0,-L,0))}
    res={off:P(b[side=='L'?'aR2':'aL2']).toArray(),hand:hand.toArray(),tip:tip?tip.toArray():null,sh:P(b.aR0).add(P(b.aL0)).multiplyScalar(.5).toArray(),chest:chest0.toArray(),side,we:we?we.ty:null};
    }}
 g.ak=null;for(let i=0;i<20;i++)step(16);
 let back=0;for(const x in rot0)back=Math.max(back,2*Math.acos(Math.min(1,Math.abs(rot0[x].dot(b[x].quaternion)))));
 Object.assign(out,{res,maxGrip,maxFoot,nan,driven,back,sh0:sh0.toArray(),recOver,headMin,headAt,carryHead,recHead,face,maxBack,foeFace,upDown,tn,edge:wEdge,bowF,shF,fist,rw,offG,errM:g._fa&&g._fa.errM?g._fa.errM*57.2958:0,errS:g._fa&&g._fa.errS});scene.remove(g);return out}"""
JS_GAME=r"""()=>{const V=THREE.Vector3,out={err:[]};const p=pl.position;const e=spawnEnemy_base('orc',p.x,p.z+1.6,5,{agg:1});e.m.scale.setScalar(e.m.bs);
 let now=performance.now();const tick=()=>{now+=16;e.m._ie=e;if(e.atk)mTick(e,.016,now);animC(e.m,now,false,0);e.m.updateMatrixWorld(true)};
 for(let i=0;i<10;i++)tick();mStart(e,pl,'strike');let hitTip=null,drv=0,n=0;
 while(e.atk&&n<200){const a=e.atk,h0=a.hit;tick();n++;if(e.m._fa&&e.m._fa.ph>=0)drv=1;if(!h0&&a.hit&&e.m._fa&&e.m._fa.we){const W=e.m._fa.we.W;hitTip=W.localToWorld(new V(0,-(W.userData.faLen||.8),0))}}
 const toHero=new V(p.x-e.m.position.x,0,p.z-e.m.position.z).normalize();
 if(hitTip){const d=new V(hitTip.x-e.m.position.x,0,hitTip.z-e.m.position.z);out.ahead=d.dot(toHero);out.tipY=hitTip.y-e.m.position.y}
 out.drv=drv;out.hit=!!hitTip;removeE(e);return out}"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(3600000);ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    fails=[];notes=[];warns=[]
    RUNS=[]
    for k,n in FOES:
        RUNS.append((k,n,False))
        if n=='strike':RUNS.append((k,n,True))
    for k,n,r2 in RUNS:
        r=ev(JS,[k,n,r2,HEAD_R,FPS])
        tag='%s %s%s'%(k,n,' (2nd)' if r2 else '')
        if r['err']:fails.append('%s: %s'%(tag,r['err']));continue
        if not r['driven']:fails.append('%s: the attack is not driven by the foe-attack system'%tag);continue
        if r['nan']:fails.append('%s: NaN in a bone'%tag)
        H=r['H'];sc=H/1.7;res=r['res']
        if not res:fails.append('%s: no hit-moment sample'%tag);continue
        hand,tip,sh,ch=res['hand'],res['tip'],res['sh'],res['chest']
        line='%-22s H %.2f hand (%.2f %.2f %.2f) tip %s grip %.3f feet %.3f back %.2f head %.3f@%s'%(tag,H,hand[0],hand[1],hand[2],'(%.2f %.2f %.2f)'%tuple(tip) if tip else '-',r['maxGrip'],r['maxFoot'],r['back'],r['headMin'],r['headAt'])
        print(line)
        # the striking point: the weapon's head, or the hand
        pt=tip if tip and n in ('strike','slam') else res['off'] if k in ('bonearcher','nagaa') else hand
        if n in ('strike','slam'):
            if pt[2]<ch[2]+.18*H:fails.append('%s: the blow is not in front of the body (z %.2f, chest z %.2f, height %.2f)'%(tag,pt[2],ch[2],H))
            if abs(pt[0])>.55*H+.3:fails.append('%s: the blow lands far out to the side (x %.2f)'%(tag,pt[0]))
            if n=='strike':
                lo,hi=.2*H,max(1.05*H,1.9)
                if not lo<=pt[1]<=hi:fails.append('%s: the blow lands at a strange height (%.2f m, body %.2f m)'%(tag,pt[1],H))
            else:
                if pt[1]>.5*H:fails.append('%s: the slam does not come down to the ground (head at %.2f m, body %.2f m)'%(tag,pt[1],H))
            if pt[1]<-.03:fails.append('%s: the weapon goes into the ground (%.2f m)'%(tag,pt[1]))
            if tip and hand[2]<sh[2]-.02*H:fails.append('%s: the weapon hand is behind the shoulders at the hit'%tag)
        else:
            # casts and throws: the staff head / hand forward of the shoulders and not below the hips
            if pt[2]<sh[2]+.12*H:fails.append('%s: the cast / throw is not pushed toward the target (z %.2f, shoulders %.2f)'%(tag,pt[2],sh[2]))
            if pt[1]<.35*H:fails.append('%s: the cast / throw hand is low (%.2f m, body %.2f m)'%(tag,pt[1],H))
        # weapon facing (owner: hard rule). Thrusts (dagger stab, halberd thrust): the point leads; other edged blows: the edge
        f=r['face'];thrust=r['tn'] in ('dagA','poleA')
        if f and r['edge']:
            print('   facing %s: edge %.0f deg, point %.0f deg off the travel at the hit (edge %s travel %s head %s); worst in the blow %s; edge vs own body %s'%(r['tn'],f['edgeAng'],f['headAng'],f['e'],f['v'],f['d'],r['maxBack'],r['foeFace']))
            if thrust:
                if f['headAng']>30:fails.append('%s: the point does not lead the thrust at the hit (%.0f deg off the travel, frame %d)'%(tag,f['headAng'],f['frame']))
            else:
                if f['edgeAng']>30:fails.append('%s: the edge does not lead at the hit (%.0f deg off the travel, frame %d)'%(tag,f['edgeAng'],f['frame']))
                if f['edgeFw']<-.35:fails.append('%s: the edge faces back toward the foe at the hit (frame %d)'%(tag,f['frame']))
                if r['maxBack'] and r['maxBack'][1]>120:fails.append('%s: the edge is backwards in the blow (%.0f deg off the travel, frame %d)'%(tag,r['maxBack'][1],r['maxBack'][0]))
                if r['upDown']:fails.append('%s: the edge faces up on a downward swing (frame %d) %s'%(tag,r['upDown'][0],r['upDown'][2:]))
            if r['foeFace'] and r['foeFace'][1]<45:fails.append('%s: the blade faces the foe itself (%.0f deg, frame %d)'%(tag,r['foeFace'][1],r['foeFace'][0]))
        fs=r.get('fist') or {}
        if fs.get('t'):
            print('   in the fist: tilt max %.1f deg (frame %d), roll max %.1f deg (frame %d); weapon off its aim at most %.0f deg (s %s)'%(fs['t'][1],fs['t'][0],fs['r'][1],fs['r'][0],r.get('errM',0),r.get('errS')))
            if fs['t'][1]>FIST_TILT:fails.append('%s: the weapon tilts %.0f deg inside the fist (frame %d; max %d)'%(tag,fs['t'][1],fs['t'][0],FIST_TILT))
            if fs['r'][1]>FIST_ROLL:fails.append('%s: the handle rolls %.0f deg inside the fist (frame %d; max %d)'%(tag,fs['r'][1],fs['r'][0],FIST_ROLL))
        if r.get('shF') is not None:
            print('   shield face toward the target %.2f'%r['shF'])
            if r['shF']<.5:fails.append('%s: the shield does not face outward toward the target at the hit (%.2f)'%(tag,r['shF']))
        if r.get('bowF'):
            bf=r['bowF'];print('   bow at the release: string side forward %.2f (want < 0: toward the archer), limbs upright %.2f'%(bf['string'],bf['limb']))
            if bf['string']>-.3:fails.append('%s: the bow string does not face the archer at the release (%.2f)'%(tag,bf['string']))
            if bf['limb']<.7:fails.append('%s: the bow is not held upright at the release (%.2f)'%(tag,bf['limb']))
        if r['recOver']:fails.append('%s: the recovery takes the weapon head %.2f m further toward the target than at the hit (frame %d): reads as a second blow'%(tag,r['recOver'][1],r['recOver'][0]))
        rw=r.get('rw') or []
        if rw and n=='throw' and k=='slinger':print('   per tick: the sling whirls round by design (its turn and spin are not limited)')
        elif rw:
            sc30=30.0/FPS
            def dot(a,b):return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
            hs=1.45 if n=='strike' else 2.0 if n in ('slam','rainfire') else 1.0
            fast=sorted([x for x in rw if hs-.45<=x['s']<=hs+.17],key=lambda x:-x['a'])[:3*max(1,FPS//30)]
            fastIds=set(id(x) for x in fast)
            worst=max(rw,key=lambda x:x['a']*(0 if id(x) in fastIds else 1));wsp=max(rw,key=lambda x:abs(x['sp']));wh=max(rw,key=lambda x:x['h'])
            print('   per tick (%d fps, deg per 1/30 s): weapon turn max %.0f (frame %d, s %.2f; strike peak %.0f), spin about the handle max %.0f (frame %d), hand turn max %.0f (frame %d)'%(FPS,max(x['a'] for x in rw)*sc30,max(rw,key=lambda x:x['a'])['f'],max(rw,key=lambda x:x['a'])['s'],(fast[0]['a']*sc30 if fast else 0),abs(wsp['sp'])*sc30,wsp['f'],wh['h']*sc30,wh['f']))
            for x in rw:
                lim=TURN_FAST if id(x) in fastIds else TURN
                if x['a']*sc30>lim:fails.append('%s: the weapon jumps %.0f deg in one frame (frame %d, s %.2f; limit %d)'%(tag,x['a']*sc30,x['f'],x['s'],lim))
                if abs(x['sp'])*sc30>SPIN:fails.append('%s: the weapon spins %.0f deg about its handle in one frame (frame %d, s %.2f; limit %d)'%(tag,abs(x['sp'])*sc30,x['f'],x['s'],SPIN))
            fl=FLICK/sc30
            for i in range(len(rw)-2):
                a,b2,c=rw[i],rw[i+1],rw[i+2]
                for key,nm in (('w','weapon'),('hv','hand')):
                    if min(a['a' if key=='w' else 'h'],b2['a' if key=='w' else 'h'],c['a' if key=='w' else 'h'])>fl and dot(a[key],b2[key])<0 and dot(b2[key],c[key])<0:
                        fails.append('%s: the %s flickers back and forth (frames %d-%d, s %.2f, %.0f / %.0f / %.0f deg)'%(tag,nm,a['f'],c['f'],a['s'],a['a' if key=='w' else 'h']*sc30,b2['a' if key=='w' else 'h']*sc30,c['a' if key=='w' else 'h']*sc30))
                if min(abs(a['sp']),abs(b2['sp']),abs(c['sp']))>fl and a['sp']*b2['sp']<0 and b2['sp']*c['sp']<0:
                    fails.append('%s: the weapon spins back and forth about its handle (frames %d-%d, s %.2f, %.0f / %.0f / %.0f deg)'%(tag,a['f'],c['f'],a['s'],a['sp']*sc30,b2['sp']*sc30,c['sp']*sc30))
        og=r.get('offG') or {}
        if og.get('n'):
            print('   off hand on the haft (%d frames): shaft from the grip %.3f x scale (frame %d), palm toward the shaft %.2f (frame %d), palm away from the body %.2f (frame %d), forearm from the shaft %.3f x scale (frame %d)'%(og['n'],og['dA'][1],og['dA'][0],og['pDot'][1],og['pDot'][0],og['away'][1],og['away'][0],og['dX'][1],og['dX'][0]))
            # FAIL for the staff casts (the owner's report); the two-handed melee grips are printed (WARN) until their keys are
            # re-authored for the off arm's reach at the top of the coil
            ff=fails if n in ('bolt','rainfire') else warns
            if og['dA'][1]>.03:ff.append('%s: the shaft is not in the off fist (%.3f x scale from its grip, frame %d)'%(tag,og['dA'][1],og['dA'][0]))
            if og['pDot'][1]<.5:ff.append('%s: the off palm does not face the shaft (%.2f, frame %d)'%(tag,og['pDot'][1],og['pDot'][0]))
            if og['away'][1]<0:ff.append('%s: the off hand grips the shaft from the far side (palm toward the body %.2f, frame %d)'%(tag,og['away'][1],og['away'][0]))
            if og['dX'][1]<.025:ff.append('%s: the off forearm crosses the shaft (%.3f x scale from it, frame %d)'%(tag,og['dX'][1],og['dX'][0]))
        if r['recHead'][1]<9:print('   recovery: weapon nearest the head %.3f x scale (frame %d; at the carry %.3f)'%(r['recHead'][1],r['recHead'][0],r['carryHead'] if r['carryHead'] is not None else 9))
        if r['recHead'][1]<min(HEAD_R,(r['carryHead'] if r['carryHead'] is not None else 9)-.01):fails.append('%s: the recovery brings the weapon through the head (%.3f x scale from it, frame %d)'%(tag,r['recHead'][1],r['recHead'][0]))
        if r['headMin']<HEAD_R:fails.append('%s: the weapon passes through the head (%.3f x scale from the head, frame %s)'%(tag,r['headMin'],r['headAt']))
        if r['maxGrip']>.03*sc+.01:fails.append('%s: the weapon leaves the fist (%.3f m)'%(tag,r['maxGrip']))
        if r['maxFoot']>.035*sc:fails.append('%s: the feet slide (%.3f m)'%(tag,r['maxFoot']))
        if r['back']>.25:fails.append('%s: the arms or body do not return to the stance after the attack (%.2f rad)'%(tag,r['back']))
    if not os.environ.get('ONLY'):
        g=ev(JS_GAME);print('game fight step',json.dumps(g))
        if not g['drv']:fails.append('game: a real orc attack is not driven by the foe-attack system')
        elif not g['hit']:fails.append('game: no hit moment seen')
        elif g['ahead']<.4:fails.append('game: the orc axe head lands %.2f m toward the hero (expected well in front)'%g['ahead'])
    for f in warns:print('WARN',f)
    for f in fails:print('FAIL',f)
    print('v181_foe_attacks: %d foe moves, %d failures'%(len(FOES),len(fails)))
play.run(s)
