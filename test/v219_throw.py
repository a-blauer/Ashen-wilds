# v219: the thrown weapon is a copy of the held model (not a plain dagger), and shuriken are lone stars that fly flat.
# Checks, for five knives (plain, Crow Feather Darts, Blackstar Shuriken, Galecut Shuriken, Fang-of-Asp Kunai): the thrown mesh is
# built from the held item (same template), its size matches the held model's; shuriken have no handle (the held model is no taller
# than the star) and spin flat (about y), knives end over end (about x); a real throw launches the held model.
# Picture: out/v219_throw.png — per knife: the hero holding it, then the thrown thing from the side and from above.
import play,json,base64,os
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v100_anim_lib.js').read()
JS=r"""()=>{const T=V100T,out={rows:[]};T.size(170,200);const N=['Rusty Throwing Knives','Crow Feather Darts','Blackstar Shuriken','Galecut Shuriken','Fang-of-Asp Kunai'];
  const C=T.canvas(3,N.length);T.setup();
  N.forEach((n,row)=>{const idx=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt=='knives'&&t.n==n);const R={n,idx};out.rows.push(R);if(idx<0)return;
    const t=ITPL[idx];hero.cls='assassin';hero.lvl=Math.max(hero.lvl,60);eq.weapon={id:918000+row,tp:idx,r:3,req:1,up:0,n:t.n};refreshGear(pl,hero.cls,eq);
    const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt=='knives');R.tag=W&&W.userData.kq218||null;
    if(W){const q=W.clone();q.position.set(0,0,0);q.rotation.set(0,0,0);q.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(q).getSize(new THREE.Vector3());R.held=[+b.x.toFixed(3),+b.y.toFixed(3),+b.z.toFixed(3)]}
    const k=kn211Mesh();R.kind=k.userData.kn218||null;const pv=k.userData.kn211pv;k.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(k).getSize(new THREE.Vector3());R.thrown=[+b.x.toFixed(3),+b.y.toFixed(3),+b.z.toFixed(3)];
    let m=null;k.traverse(o=>{if(!m&&o.isMesh&&o.onBeforeRender)m=o});pv.rotation.set(0,0,0);const t0=performance.now();while(performance.now()-t0<30){}try{m.onBeforeRender()}catch(_){}
    R.spin={x:+pv.rotation.x.toFixed(3),y:+pv.rotation.y.toFixed(3)};pv.rotation.set(0,0,0);if(m)m.onBeforeRender=function(){};
    // picture: holding it, then thrown (side, above)
    const unpark=T.park();T.shot(C.cx,0,row*T.CH,[.6,.15,1],n,{dist:1.3,cy:.95,cz:.1});
    const S=pl.parent;pl.visible=false;S.add(k);k.position.set(0,.85,.25);k.rotation.set(0,Math.PI/2,0);k.scale.setScalar(2.2);
    T.shot(C.cx,T.CW,row*T.CH,[0,.1,1],'thrown, side',{dist:1.25,cy:.85});T.shot(C.cx,2*T.CW,row*T.CH,[.02,1,.05],'thrown, above',{dist:1.25,cy:.85});
    S.remove(k);pl.visible=true;unpark()});
  out.sheet=C.c.toDataURL('image/png');
  // a real throw with the shuriken: the shot that leaves is the star
  const idx=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt=='knives'&&t.n=='Blackstar Shuriken');eq.weapon={id:918100,tp:idx,r:2,req:1,up:0,n:'Blackstar Shuriken'};refreshGear(pl,'assassin',eq);
  const P=pl.position,e=spawnEnemy('skeleton',P.x,P.z+5,1,{});shots.length=0;
  if(e){tgt=e;HA.cur=null;atkCd=0;let now=performance.now();swing();for(let f=0;f<80;f++){now+=16;animHero(now,false,pl)}}
  return new Promise(res=>setTimeout(()=>{const sh=shots.find(s=>s.kn211);out.shot=sh?{kind:sh.m&&sh.m.userData.kn218}:null;if(e){e.dead=1;e.m.visible=false}res(out)},400))}"""
def s(pg):
    pg.set_default_timeout(1200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="assassin"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("(s)=>{(0,eval)(s)}",LIB)
    r=ev(JS)
    open(play.TMP+'/v219_throw.png','wb').write(base64.b64decode(r.pop('sheet').split(',')[1]))
    print(json.dumps(r))
    fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    for R in r['rows']:
        n=R['n'];star='Shuriken' in n
        ok(R.get('idx',-1)>=0,'%s exists'%n)
        if R.get('idx',-1)<0:continue
        ok(bool(R.get('tag')) and R['tag'].get('tp')==R['idx'],'%s: the held model remembers its item (%s)'%(n,R.get('tag')))
        ok(R.get('kind')==('star' if star else 'knife'),'%s: thrown as a %s (%s)'%(n,'star' if star else 'knife',R.get('kind')))
        h=R.get('held') or [0,0,0];t=R.get('thrown') or [0,0,0]
        if star:
            ok(h[1]<.27,'%s: held without a handle (height %s)'%(n,h[1]))
            ok(R['spin']['y']!=0 and R['spin']['x']==0,'%s: spins flat (%s)'%(n,R['spin']))
            ok(abs(max(t[0],t[2])-max(h[0],h[1]))<.03 and t[1]<.06,'%s: thrown star is the held star, lying flat (held %s, thrown %s)'%(n,h,t))
        else:
            ok(R['spin']['x']!=0,'%s: flips end over end (%s)'%(n,R['spin']))
            ok(abs(t[2]-h[1])<.03,'%s: thrown knife is as long as the held one (held %s, thrown %s)'%(n,h,t))
    ok((r.get('shot') or {}).get('kind')=='star','a real shuriken throw launches a star (%s)'%r.get('shot'))
    print('FAILS',fails)
play.run(s)
