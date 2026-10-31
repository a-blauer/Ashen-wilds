# v181: foe attacks (src/js/3400-v181-foe-attacks.js) — every humanoid foe's blow lands on the target in front of it.
# For each foe the attack is played on the game's own timeline (g.ak = {n, ph, k}) and measured at the moment the game
# hits (melee: act k .45; slam / rainfire: the act's end; bolt / throw: the act's start, when the shot leaves):
#  * melee weapons: the weapon's head in front of the body (toward the target, +z), at a sensible height (around the
#    target's chest; near the ground for a slam), the weapon hand in front of the shoulders;
#  * unarmed: the striking hand in front at a sensible height;  casters / slings: the staff head or hand forward;
#  * the weapon stays in the fist all through the attack (the point held in the fist on the hand's grip anchor);
#  * the feet stay planted (ankles within a few cm of where they stood), no NaN, the pose returns to the plain stance after;
#  * one real enemy fight step (mStart / mTick / animC): the system drives the attack and the head lands toward the hero.
# ONLY=orc,gharial  SHOT=1 (pictures of the hit moment: out/v181_fa_<key>.jpg)
import os,sys,json,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
FOES=[('brigand','strike'),('orc','strike'),('orc','slam'),('troll','strike'),('hobgoblin','strike'),('skeleton','strike'),('nagaw','strike'),
  ('executioner','strike'),('giant','strike'),('giant','slam'),('jotun','strike'),('vampk','strike'),('hollowknight','strike'),('hollowknight','slam'),
  ('gharial','strike'),('bandit','strike'),('vamp','strike'),('ss165zealot','strike'),
  ('tombpriest','bolt'),('cultist','bolt'),('cultist','rainfire'),('trollsh','bolt'),('shaman','bolt'),('ss165caller','bolt'),('vampm','bolt'),('nagas','bolt'),('revenant','bolt'),
  ('slinger','throw'),('slinger','strike'),('selem','bolt'),
  ('ghoul','strike'),('dgwretch','strike'),('nosferatu','strike'),('wendigo','strike'),('akidon','strike'),('akorror','strike'),('lichen','strike'),('gargoyle','strike'),
  ('yeti','strike'),('amalgam','strike'),('saltgolem','strike'),('colossus','strike'),('drowned','strike')]
if os.environ.get('ONLY'):
    keep=os.environ['ONLY'].split(',');FOES=[f for f in FOES if f[0] in keep]
JS=r"""([k,n,shot])=>{const V=THREE.Vector3,P=o=>new V().setFromMatrixPosition(o.matrixWorld);
 const c=enemyC(k,20,{}),g=cr(c);scene.add(g);let T=5000;const step=ms=>{T+=ms;animC(g,T,false,0);g.position.set(0,0,0);g.rotation.y=0;g.updateMatrixWorld(true)};for(let i=0;i<40;i++)step(16);
 const out={k,n,err:[]},b=g.h&&g.h.bones;if(!b){out.err.push('no bones');scene.remove(g);return out}
 const bb=new THREE.Box3().setFromObject(g),H=bb.max.y-bb.min.y;out.H=H;
 const M=MV[n],hitPh=n=='strike'?[1,.45]:n=='slam'||n=='rainfire'?[1,1]:[1,0];
 const feet0=b.lh2&&!g.h.nt?[P(b.lh2),P(b.rh2)]:null,sh0=P(b.aR0).add(P(b.aL0)).multiplyScalar(.5),chest0=P(b.chest);
 const rot0={};['aR0','aR1','aR2','aL0','aL1','spine','pelvis'].forEach(x=>rot0[x]=b[x].quaternion.clone());
 const dt=1/30,tl=[];for(let t=0;t<M.wind;t+=dt)tl.push([0,t/M.wind]);for(let t=0;t<M.act;t+=dt)tl.push([1,t/M.act]);tl.push(hitPh);for(let t=M.rec;t>0;t-=dt)tl.push([2,t/M.rec]);
 let maxGrip=0,maxFoot=0,nan=0,res=null,driven=0;
 const fa0=()=>g._fa;
 for(const [ph,kk] of tl){g.ak={n,ph,k:Math.max(0,Math.min(1,kk))};step(dt*1000);const S=g._fa;if(S&&S.ph>=0)driven=1;
  b.pelvis.traverse(o=>{if(o.isBone&&(isNaN(o.quaternion.x)||isNaN(o.position.x)))nan=1});
  const side=S&&S.side<0?'L':'R',we=S&&S.we;
  if(we&&we.W.parent){const W=we.W,hd=we.C.hold,hp=W.localToWorld(new V(hd[0],hd[1],hd[2])),gd=g.h._gripD&&g.h._gripD[we.side],an=C=>new V(GRIP_AN[0]+(gd?gd[0]:0),GRIP_AN[1]+(gd?gd[1]:0),GRIP_AN[2]+(gd?gd[2]:0));
    const ap=W.parent.localToWorld(an());maxGrip=Math.max(maxGrip,hp.distanceTo(ap))}
  if(feet0){maxFoot=Math.max(maxFoot,P(b.lh2).distanceTo(feet0[0]),P(b.rh2).distanceTo(feet0[1]))}
  if(ph==hitPh[0]&&Math.abs(kk-hitPh[1])<1e-6){const hb=b[side=='L'?'aL2':'aR2'],hand=P(hb);let tip=null;
    if(we&&we.W.parent){const W=we.W,L=W.userData.faLen||.8;tip=W.localToWorld(new V(0,-L,0))}
    res={hand:hand.toArray(),tip:tip?tip.toArray():null,sh:P(b.aR0).add(P(b.aL0)).multiplyScalar(.5).toArray(),chest:chest0.toArray(),side,we:we?we.ty:null};
    if(shot){}}}
 g.ak=null;for(let i=0;i<20;i++)step(16);
 let back=0;for(const x in rot0)back=Math.max(back,2*Math.acos(Math.min(1,Math.abs(rot0[x].dot(b[x].quaternion)))));
 Object.assign(out,{res,maxGrip,maxFoot,nan,driven,back,sh0:sh0.toArray()});scene.remove(g);return out}"""
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
    fails=[];notes=[]
    for k,n in FOES:
        r=ev(JS,[k,n,bool(os.environ.get('SHOT'))])
        tag='%s %s'%(k,n)
        if r['err']:fails.append('%s: %s'%(tag,r['err']));continue
        if not r['driven']:fails.append('%s: the attack is not driven by the foe-attack system'%tag);continue
        if r['nan']:fails.append('%s: NaN in a bone'%tag)
        H=r['H'];sc=H/1.7;res=r['res']
        if not res:fails.append('%s: no hit-moment sample'%tag);continue
        hand,tip,sh,ch=res['hand'],res['tip'],res['sh'],res['chest']
        line='%-22s H %.2f hand (%.2f %.2f %.2f) tip %s grip %.3f feet %.3f back %.2f'%(tag,H,hand[0],hand[1],hand[2],'(%.2f %.2f %.2f)'%tuple(tip) if tip else '-',r['maxGrip'],r['maxFoot'],r['back'])
        print(line)
        # the striking point: the weapon's head, or the hand
        pt=tip if tip and n in ('strike','slam') else hand
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
        if r['maxGrip']>.03*sc+.01:fails.append('%s: the weapon leaves the fist (%.3f m)'%(tag,r['maxGrip']))
        if r['maxFoot']>.035*sc:fails.append('%s: the feet slide (%.3f m)'%(tag,r['maxFoot']))
        if r['back']>.25:fails.append('%s: the arms or body do not return to the stance after the attack (%.2f rad)'%(tag,r['back']))
    if not os.environ.get('ONLY'):
        g=ev(JS_GAME);print('game fight step',json.dumps(g))
        if not g['drv']:fails.append('game: a real orc attack is not driven by the foe-attack system')
        elif not g['hit']:fails.append('game: no hit moment seen')
        elif g['ahead']<.4:fails.append('game: the orc axe head lands %.2f m toward the hero (expected well in front)'%g['ahead'])
    for f in fails:print('FAIL',f)
    print('v181_foe_attacks: %d foe moves, %d failures'%(len(FOES),len(fails)))
play.run(s)
