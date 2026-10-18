# v93 grip: how every weapon type sits in the hand.
#   [SRC=old.html] [TAG=after] [WT=sword,gs,...] [NOSHOT=1] python3 v93_grip.py
# Sheets: out/v93_<TAG>_hero<N>.png (per weapon type: idle front / side / 3-4, walk, three attack frames),
#         out/v93_<TAG>_foes.png (humanoid enemies: idle front / side, strike), out/v93_<TAG>_bow.png (bow shot frames).
# Checks (after): blade/head direction in idle (world up), hand on the grip, bow riser in the hand and string away from it,
# drawn arrow/string in front of the bow, no page errors.
import play,json,base64,os,sys
TAG=os.environ.get('TAG','after')
WT=os.environ.get('WT','gs,axes,ga,mace,hammer,dagger,knives,claws,halberd,flail,staff,wand,orb,bow,crossbow,sling').split(',')
FOES=os.environ.get('FOES','skel,archer,bandit,orc,knight,giant,hob,sling,nagas,vampk,abom,nagaw').split(',')
NOSHOT=os.environ.get('NOSHOT')
JS=r"""(A)=>{
  const [WTS,TAG,mode]=A;const CW=200,CH=250,out={},errs=[],chk={};
  const rd=window._v93rd||(window._v93rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));rd.setSize(CW,CH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x4a5058);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.85));
  const d=new THREE.DirectionalLight(0xfff0d8,1.2);d.position.set(3,5,4);sc.add(d);const d2=new THREE.DirectionalLight(0x9ab0ff,.5);d2.position.set(-3,2,-4);sc.add(d2);
  const gr=new THREE.Mesh(new THREE.CircleGeometry(1.2,24),new THREE.MeshStandardMaterial({color:0x5a5a4a,roughness:1}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(32,CW/CH,.05,80),V3=THREE.Vector3;
  const shot=(o,dir,cx,x,y,lab,ctrY,dist)=>{o.updateMatrixWorld(true);const c=o.getWorldPosition(new V3());c.y+=ctrY||.75;
    cam.position.copy(c).add(new V3(...dir).normalize().multiplyScalar(dist||3.1));cam.lookAt(c);rd.render(sc,cam);cx.drawImage(rd.domElement,x,y);
    cx.fillStyle='#fff';cx.font='13px sans-serif';cx.fillText(lab,x+5,y+15)};
  // world direction of a weapon's model axis (0,-1,0) = blade/head direction, and the world position of model points
  const wdir=(W,v)=>{W.updateMatrixWorld(true);const q=new THREE.Quaternion();W.getWorldQuaternion(q);return new V3(...v).applyQuaternion(q).normalize()};
  const wpt=(W,v)=>{W.updateMatrixWorld(true);return new V3(...v).applyMatrix4(W.matrixWorld)};
  const r3=v=>[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)];
  if(mode=='hero'){
    const cv=document.createElement('canvas'),COLS=7;cv.width=CW*COLS;cv.height=CH*WTS.length;const cx=cv.getContext('2d');
    const P0=pl.position.clone(),par=pl.parent,ry=pl.rotation.y;
    WTS.forEach((wt,row)=>{try{
      const idx=ITPL.findIndex(t=>t.sl=='weapon'&&(t.wt==wt||(!t.wt&&wt=='sword')));if(idx<0){errs.push('no template '+wt);return}
      const t=ITPL[idx];hero.cls=t.cls||hero.cls;hero.lvl=Math.max(hero.lvl,60);eq.weapon={id:900000+row,tp:idx,r:2,req:1,up:0,n:t.n};
      if(hero.cls=='paladin')eq.offhand=null;
      refreshGear(pl,hero.cls,eq);
      HA.cur=null;HA.snap=null;HA.sb=0;atkCd=0;pl.sw=0;
      par&&par.remove(pl);sc.add(pl);pl.position.set(0,0,0);pl.rotation.y=0;
      let now=performance.now();const idle=()=>{pl._at=now;pl._ga=null;animHero(now,false,pl)};
      idle();for(let i=0;i<20;i++){now+=33;animHero(now,false,pl)}
      const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt==wt&&o.parent);
      if(W){const hd=wdir(W,[0,-1,0]),hand=pl.bones[W.parent===pl.bones.aL2?'aL2':'aR2'];
        chk[wt]={bone:W.parent===pl.bones.aL2?'L':W.parent===pl.bones.aR2?'R':'?',head:r3(hd),flat:r3(wdir(W,[0,0,1])),
          hand:r3(new V3(0,-.035,.01).applyMatrix4(hand.matrixWorld)),grip:r3(wpt(W,[0,0,0]))};
        if(W.userData.chain)chk[wt].chain=r3(wdir(W.userData.chain,[0,-1,0]));
        if(wt=='bow'){chk[wt].riser=r3(wpt(W,[-.555,0,0]));chk[wt].strM=r3(wpt(W,[-.08,0,0]))}}
      shot(pl,[0,.12,1],cx,0,row*CH,wt+' idle front');shot(pl,[1,.12,0],cx,CW,row*CH,'idle side');shot(pl,[.75,.3,.9],cx,2*CW,row*CH,'idle 3/4');
      // walk: move forward so the gait clock runs
      pl._ga=null;pl._at=now;for(let i=0;i<26;i++){now+=33;pl.position.z+=.033*3.2;animHero(now,true,pl)}
      shot(pl,[1,.12,.2],cx,3*CW,row*CH,'walk side');pl.position.set(0,0,0);
      // attack: trigger the real basic attack, then sample its keyframe track
      for(let i=0;i<12;i++){now+=33;animHero(now,false,pl)}
      HA.cur=null;atkCd=0;hero.chan=0;try{swing()}catch(e){errs.push(wt+' swing '+e)}
      pl.rotation.y=0;const AC=HA.cur;let prevTip=null,lead=[];
      const tipW=()=>{const Wn=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt==wt&&o.parent);if(!Wn)return null;return {W:Wn,p:wpt(Wn,[0,-.6,0])}};
      [.3,.42,.62].forEach((k,j)=>{
        if(AC){let n=0;while(HA.cur===AC&&AC.k<k&&n++<400){now+=16;const t0=tipW();animHero(now,false,pl);pl.rotation.y=0;const t1=tipW();
            if(t0&&t1&&AC.k>.36&&AC.k<.5){const v=t1.p.clone().sub(t0.p),ed=wdir(t1.W,[1,0,0]),ax=wdir(t1.W,[0,-1,0]);const vp=v.clone().addScaledVector(ax,-v.dot(ax));if(vp.length()>1e-4)lead.push(+(ed.dot(vp.normalize())).toFixed(2))}}}
        if(typeof BOW_FX!='undefined'&&BOW_FX&&BOW_FX.g.visible){sc.add(BOW_FX.g)}
        shot(pl,j==1?[1,.25,.35]:[.8,.3,.9],cx,(4+j)*CW,row*CH,(AC?'atk k='+k:'no anim'));
        if(typeof BOW_FX!='undefined'&&BOW_FX&&BOW_FX.g.parent===sc){sc.remove(BOW_FX.g);scene.add(BOW_FX.g)}});
      if(chk[wt])chk[wt].lead=lead.slice(0,8);
      if(AC&&AC.end)try{AC.end()}catch(e){}HA.cur=null;HA.snap=null;HA.sb=0;atkCd=0;pl.sw=0;
      sc.remove(pl);par&&par.add(pl);pl.position.copy(P0);pl.rotation.y=ry;
    }catch(e){errs.push(wt+' '+e+' '+e.stack);try{sc.remove(pl);par&&par.add(pl);pl.position.copy(P0)}catch(_){}}});
    out.sheet=cv.toDataURL('image/png')}
  if(mode=='foes'){
    const cv=document.createElement('canvas');cv.width=CW*4;cv.height=CH*WTS.length;const cx=cv.getContext('2d');
    WTS.forEach((key,row)=>{try{const g=mkHumanoid(key);sc.add(g);const s=g.bs||1;
      const pose=(ak,t,mv)=>{g.ak=ak;g.rig(t,!!mv,3)};
      pose(null,1000);shot(g,[0,.12,1],cx,0,row*CH,key+' idle front',.75*s,3.1*s);shot(g,[1,.12,0],cx,CW,row*CH,'idle side',.75*s,3.1*s);
      const W=g.h.bones.aR2.children.find(o=>o.userData&&o.userData.wt)||g.h.bones.aL2.children.find(o=>o.userData&&o.userData.wt);
      if(W){chk[key]={wt:W.userData.wt,head:r3(wdir(W,[0,-1,0]))}}
      pose({n:'strike',ph:0,k:1},1100);shot(g,[.9,.2,.5],cx,2*CW,row*CH,'strike wind-up',.75*s,3.1*s);
      pose({n:HUMLOOK[key].wpn=='bow'?'throw':'strike',ph:1,k:.5},1200);shot(g,[.9,.2,.5],cx,3*CW,row*CH,'strike act',.75*s,3.1*s);
      if(g.bowFx&&g.bowFx.g.parent)g.bowFx.g.parent.remove(g.bowFx.g);sc.remove(g)}catch(e){errs.push(key+' '+e+' '+e.stack)}});
    out.sheet=cv.toDataURL('image/png')}
  if(mode=='bow'){
    const cv=document.createElement('canvas'),ks=[.1,.25,.4,.5,.56,.7];cv.width=CW*ks.length;cv.height=CH*2;const cx=cv.getContext('2d');
    const idx=ITPL.findIndex(t=>t.wt=='bow');const t=ITPL[idx];hero.cls=t.cls;hero.lvl=Math.max(hero.lvl,60);eq.weapon={id:900100,tp:idx,r:2,req:1,up:0,n:t.n};refreshGear(pl,hero.cls,eq);
    const P0=pl.position.clone(),par=pl.parent;par&&par.remove(pl);sc.add(pl);pl.position.set(0,0,0);
    let now=performance.now();HA.cur=null;atkCd=0;bowAnim(900);const AC=HA.cur;pl.rotation.y=0;chk.frames=[];
    pl._at=now;ks.forEach((k,j)=>{let n=0;while(HA.cur===AC&&AC.k<k&&n++<400){now+=16;animHero(now,false,pl);pl.rotation.y=0}if(BOW_FX.g.visible)sc.add(BOW_FX.g);
      const W=pl.gearG.find(o=>o.userData.wt=='bow');const F=BOW_FX,pa=F.str.geometry.attributes.position;
      const hl=new V3(0,-.035,.01).applyMatrix4(pl.bones.aL2.matrixWorld),hr=new V3(0,-.035,.01).applyMatrix4(pl.bones.aR2.matrixWorld);
      chk.frames.push({k,riser:r3(wpt(W,[-.555,0,0])),handL:r3(hl),handR:r3(hr),nock:F.g.visible?r3(new V3(pa.getX(1),pa.getY(1),pa.getZ(1))):null,arrow:F.g.visible&&F.arrow.visible?r3(F.arrow.position):null,tipT:r3(wpt(W,[-.062,.594,0])),tipB:r3(wpt(W,[-.062,-.594,0]))});
      shot(pl,[1,.2,.25],cx,j*CW,0,'bow k='+k);shot(pl,[.2,.5,1],cx,j*CW,CH,'front k='+k);if(BOW_FX.g.parent===sc){sc.remove(BOW_FX.g);scene.add(BOW_FX.g)}});
    AC.end&&AC.end();HA.cur=null;sc.remove(pl);par&&par.add(pl);pl.position.copy(P0);
    out.sheet=cv.toDataURL('image/png')}
  out.errs=errs;out.chk=chk;return out}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{window._v93raf=window.requestAnimationFrame;window.requestAnimationFrame=f=>0}")  # freeze the main loop: poses are set by hand
    res={}
    groups=[WT[i:i+5] for i in range(0,len(WT),5)]
    for gi,g in enumerate(groups):
        r=ev(JS,[g,TAG,'hero']);res.update(r['chk'])
        if r['errs']:print('ERR',json.dumps(r['errs'])[:2000])
        if not NOSHOT:open(play.TMP+'/v93_%s_hero%d.png'%(TAG,gi+1),'wb').write(base64.b64decode(r['sheet'].split(',')[1]))
    for gi in range(0,len(FOES),6):
        r=ev(JS,[FOES[gi:gi+6],TAG,'foes']);res.update({'foe_'+k:v for k,v in r['chk'].items()})
        if r['errs']:print('ERR',json.dumps(r['errs'])[:2000])
        if not NOSHOT:open(play.TMP+'/v93_%s_foes%d.png'%(TAG,gi//6+1),'wb').write(base64.b64decode(r['sheet'].split(',')[1]))
    r=ev(JS,[[],TAG,'bow']);res['bowshot']=r['chk'].get('frames')
    if r['errs']:print('ERR',json.dumps(r['errs'])[:2000])
    if not NOSHOT:open(play.TMP+'/v93_%s_bow.png'%TAG,'wb').write(base64.b64decode(r['sheet'].split(',')[1]))
    for k,v in res.items():print(k,json.dumps(v))
    json.dump(res,open(play.TMP+'/v93_%s.json'%TAG,'w'))
    # ---- checks (the v93 grips) ----
    import math
    bad=[];d=lambda a,b:math.dist(a,b)
    UP={'gs':.85,'ga':.85,'axes':.9,'mace':.9,'hammer':.9,'dagger':.7,'knives':.7,'halberd':.95,'staff':.95,'orb':-2}
    for k,lim in UP.items():
        c=res.get(k)
        if not c:bad.append(k+' missing');continue
        if k=='orb':
            if c['head'][1]>-.9:bad.append('orb not upright %s'%c['head'])
        elif c['head'][1]<lim:bad.append('%s blade/head not up %s'%(k,c['head']))
        if d(c['hand'],c['grip'])>.06 and k not in('halberd','orb'):bad.append('%s hand off the grip %.3f'%(k,d(c['hand'],c['grip'])))
    for k in('gs','axes','dagger','halberd'):
        L=res.get(k,{}).get('lead') or []
        if not L or max(abs(x) for x in L)<.6:bad.append('%s edge does not lead at contact %s'%(k,L))
    b=res.get('bow')
    if b:
        if d(b['riser'],b['hand'])>.06:bad.append('bow not held at the riser %.3f'%d(b['riser'],b['hand']))
        if d(b['strM'],b['hand'])<.25:bad.append('bow string in the hand %.3f'%d(b['strM'],b['hand']))
        if abs(b['head'][1])<.95:bad.append('bow not upright %s'%b['head'])
    f=res.get('flail')
    if f and f.get('chain',[0,0,0])[1]>-.9:bad.append('flail chain does not hang %s'%f.get('chain'))
    if res.get('crossbow') and abs(res['crossbow']['flat'][0])>.1:bad.append('crossbow arms not level')
    for k,v in res.items():
        if k.startswith('foe_') and v['wt'] in('sword','axe','gs','hammer','club','staff') and v['head'][1]<.85:bad.append('%s weapon not up %s'%(k,v['head']))
    if res.get('foe_archer') and res['foe_archer']['head'][1]>-.9:bad.append('archer bow not upright')
    for fr in res.get('bowshot') or []:
        if fr['k']>=.25 and fr['k']<=.5 and (not fr['arrow'] or d(fr['riser'],fr['handL'])>.08):bad.append('bow shot frame %s'%fr)
    print('CHECKS',('FAIL '+'; '.join(bad)) if bad else 'OK')
    s.res=res
from playwright.sync_api import Page as _Pg, Browser as _Br
_g0=_Pg.goto;_Pg.goto=lambda self,url,**k:_g0(self,url,**dict(k,timeout=600000))
_n0=_Br.new_page;_Br.new_page=lambda self,*a,**k:(lambda p:(p.set_default_timeout(400000),p)[1])(_n0(self,*a,**k))
play.run(s,w=1000,hh=620)
