# v211: throwing knives throw a knife (the held dagger kit, spinning end over end), and the body turns less in the throw.
# Checks: the knife mesh is a knife (no arrow), ~0.3-0.45 long, spins; a real throw launches it; the throw's twist (spine + hips yaw)
# is KN211.yawK of the baked one (well under a right angle) while the arm still drives the knife forward at release.
# Picture: out/v211_knife.png — rows: before / after from the front, before / after from above (5 moments of one throw), then the
# knife at 5 angles of its spin.
import play,json,base64,os
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v100_anim_lib.js').read()
JS=r"""()=>{const T=V100T,out={};const ks=[0,.3,.42,.55,.8];T.size(170,220);const C=T.canvas(5,5);
  // the twist, from the played track itself: the largest spine + hips yaw over the throw, before and after
  T.equip('knives');refreshGear(pl,hero.cls,eq);
  const tw=on=>{KN211.on=on;KN207.cur=0;const P=atkPick(0);let mx=0;for(let k=0;k<=1.0001;k+=.02){const p=P(k);mx=Math.max(mx,Math.abs((p.sy||0)+(p.py||0)))}return +mx.toFixed(3)};
  out.twBefore=tw(false);out.twAfter=tw(true);
  // the picture: one throw (the plain one), before and after, from the front and from above
  [[false,0,[0,.25,1],'before'],[true,1,[0,.25,1],'after'],[false,2,[.02,1,.08],'before, above'],[true,3,[.02,1,.08],'after, above']].forEach(([on,row,dir,lab])=>{
    KN211.on=on;KN207.i=0;const r=T.play('knives',0,ks,{dt:16,cx:C.cx,row,views:[[dir,lab]]});if(on)out.fwd=(()=>{const R=r.rec,h=Math.max(0,r.hitF),q=i=>R[Math.max(0,Math.min(R.length-1,i))];const a=q(h-2),b=q(h+1);return a&&b?+(b.hR[2]-a.hR[2]).toFixed(3):null})()});
  KN211.on=true;
  // the knife at 5 angles of its spin
  const k=kn211Mesh();k.updateMatrixWorld(true);let ms=0,arrow=0;k.traverse(o=>{if(o.isMesh)ms++});const bb=new THREE.Box3().setFromObject(k),sz=bb.getSize(new THREE.Vector3());
  out.knife={meshes:ms,len:+sz.z.toFixed(3),wide:+Math.max(sz.x,sz.y).toFixed(3)};
  let spin=null;k.traverse(o=>{if(o.isMesh&&o.onBeforeRender&&o.onBeforeRender.toString().indexOf('rotation')>=0)spin=o});
  const pv=k.userData.kn211pv;const unpark=T.park();const S=pl.parent;pl.visible=false;const hid=[];S.children.forEach(o=>{if(o.isMesh&&o.visible){o.visible=false;hid.push(o)}});S.add(k);if(spin)spin.onBeforeRender=function(){};
  for(let i=0;i<5;i++){k.position.set(0,.85,.25);k.rotation.set(0,Math.PI/2,0);pv.rotation.x=i*Math.PI/4.5;k.scale.setScalar(1.5);T.shot(C.cx,i*T.CW,4*T.CH,[0,.1,1],i?'spin '+(i*40)+'°':'the thrown knife',{dist:1.25,cy:.85})}
  S.remove(k);hid.forEach(o=>o.visible=true);pl.visible=true;unpark();
  out.sheet=C.c.toDataURL('image/png');
  // spinning: its own clock turns the pivot
  const k2=kn211Mesh();let m2=null;k2.traverse(o=>{if(!m2&&o.isMesh&&o.onBeforeRender)m2=o});
  return new Promise(res=>setTimeout(()=>{try{m2.onBeforeRender()}catch(_){}out.spun=+k2.userData.kn211pv.rotation.x.toFixed(2);
    // a real throw at a foe: the shot that leaves is the knife
    T.equip('knives');refreshGear(pl,hero.cls,eq);const P=pl.position;const e=spawnEnemy('skeleton',P.x,P.z+5,1,{});shots.length=0;
    if(e){tgt=e;HA.cur=null;atkCd=0;let now=performance.now();swing();for(let f=0;f<80;f++){now+=16;animHero(now,false,pl)}}
    setTimeout(()=>{const sh=shots[shots.length-1];out.shot=sh?{knife:!!sh.kn211,mesh:!!(sh.m&&sh.m.userData.kn211)}:null;if(e){e.dead=1;e.m.visible=false}res(out)},400)},120))}"""
def s(pg):
    pg.set_default_timeout(1200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="assassin"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("(s)=>{(0,eval)(s)}",LIB)
    r=ev(JS)
    open(play.TMP+'/v211_knife.png','wb').write(base64.b64decode(r.pop('sheet').split(',')[1]))
    print(json.dumps(r))
    fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    K=r.get('knife') or {}
    ok(K.get('meshes',0)>0 and .3<K.get('len',0)<.5 and K.get('wide',1)<.15,'the thrown thing is a knife ~0.3-0.5 long and slim (%s)'%K)
    ok((r.get('spun') or 0)>.5,'the knife spins end over end as it flies (%s rad after 0.12 s)'%r.get('spun'))
    ok(r['twBefore']>.7 and r['twAfter']<=r['twBefore']*.45,'the body turns much less in the throw (spine + hips yaw: before %s, after %s)'%(r['twBefore'],r['twAfter']))
    ok((r.get('fwd') or 0)>0,'the hand still drives forward at release (%s)'%r.get('fwd'))
    sh=r.get('shot') or {}
    ok(bool(sh.get('knife') and sh.get('mesh')),'a real throw launches the knife, not an arrow (%s)'%sh)
    print('FAILS',fails)
play.run(s)
