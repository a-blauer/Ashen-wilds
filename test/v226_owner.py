# v226 owner's list (Nov 12 2026): one check per fix that can be read from the game's state.
#   The Sandstorm Run: the guns turn at most a half circle (front and sides), the crosshair follows mouse-look movement and the keys,
#   each kind takes its number of shells (scarab 1, scorpion 3, Shellback 6, Brood Scorpion 16), a creature behind the guns falls
#   behind and is gone, the Skimmer's speed cap, worms take 8, the Brood Scorpion comes at ~40%, the barrels reach into the breech;
#   sounds: the effects bus has its make-up and limiter, a hit peaks near the music (offline render) without clipping, sfx('hit') sounds,
#   the ability preview's mute is never saved; raised floors: the hero and ground marks stand on the Reliquary's floor and on Lord
#   Vaelric's carpet while the world is drawn, and are put back after; the Sanctum: eight knights, seven fire jets, a gap between the
#   spike bands (the full Sanctum run is v165_dirge.py).
import play,json
JS=r"""async()=>{const o={},V3=THREE.Vector3,wait=ms=>new Promise(r=>setTimeout(r,ms));window.__T=performance.now();
  const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f)f();homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}enemies.slice().forEach(e=>{if(e.sr165&&!e.dead)eTick(e,1/30,__T)})}};
  CHEAT.god=true;hero.lvl=35;INSR[3]=2;
  // ---- the gun model ----
  {const R=svRig();sk165Build(R);svRest(R);R.root.updateMatrixWorld(true);let blk=null,col=[],step=null,plate=null;
    R.J.gun.children.forEach(m=>{if(m.isMesh&&m.geometry===SVX.gc.skbx){const b=new THREE.Box3().setFromObject(m);if(!blk||b.max.y-b.min.y>blk.max.y-blk.min.y)blk=b}});
    ['brlL','brlR'].forEach(j=>R.J[j].children.forEach(m=>{if(m.isMesh&&m.geometry===SVX.gc.sk226col)col.push(new THREE.Box3().setFromObject(m))}));
    R.J.turret.children.forEach(m=>{if(!m.isMesh)return;const b=new THREE.Box3().setFromObject(m);if(m.geometry===SVX.gc.skcy8)step=b;else if(m.geometry===SVX.gc.skbx&&b.max.x-b.min.x>1)plate=b});
    o.gun={collars:col.length,into:col.length?+Math.min(...col.map(c=>blk.max.z-c.min.z)).toFixed(3):null,step:step&&plate?+(step.min.y-plate.max.y).toFixed(3):null}}
  // ---- the Sandstorm Run ----
  sr165Go([{id:'v0',drv:'chd',gun:'me'}]);await wait(2600);const V=SR165.me,P=sr165Path();o.run=!!(SR165.on&&V);
  if(V){SR165.ph='run';mOn=false;
    // the half circle: a crosshair at the bottom of the screen points behind the turret: the guns stop at the arc
    SKR227.mT=performance.now();SKR226.rx=0;SKR226.ry=-.97;skr218Cam();   // v227: a mouse has moved (no aim assist)
    for(let i=0;i<60;i++)sr165Aim(V,1/30);o.arc=[+Math.abs(V.aY).toFixed(3),+SKR226.arc.toFixed(3)];
    {const tp=sr165Seat(V,'turret'),a=V.aim;let y=Math.atan2(a.x-tp.x,a.z-tp.z)-V.h;y=Math.atan2(Math.sin(y),Math.cos(y));o.aimArc=+Math.abs(y).toFixed(3)}
    // mouse-look: the pointer locked, moving the mouse moves the crosshair
    SKR226.rx=0;SKR226.ry=0;Object.defineProperty(document,'pointerLockElement',{configurable:true,get:()=>gl});
    gl.dispatchEvent(new PointerEvent('pointermove',{movementX:60,movementY:-20,bubbles:true}));delete document.pointerLockElement;o.look=[+SKR226.rx.toFixed(3),+SKR226.ry.toFixed(3)];
    // keys (Cheddar drives): D sweeps right
    mOn=false;SKR226.rx=0;{const d0=V.drv;V.drv='p1';K.d=1;skr226Steer(V,.5);K.d=0;V.drv=d0}o.key=+SKR226.rx.toFixed(3);   // v227: keys sweep the crosshair only while a partner steers
    // shells to kill each kind
    const fwd=(s,ox)=>P.at(V.s+s,ox);const mk=(k)=>{const [x,z]=fwd(14,4);return k==='sb'||k==='gs'?skr226Spawn(k,x,z):sr165Foe(k=='sc'?'scarab':'scorp',x,z,k)};
    o.shots={};for(const k of ['sc','sp','sb','gs']){const e=mk(k);if(!e){o.shots[k]=-1;continue}let n=0;while(!e.dead&&n<90){const f=sr165FoeList().find(q=>q.e===e);if(!f)break;f.hit(1);n++}o.shots[k]=n;if(!e.dead)removeE(e)}
    // splash (.6) kills a scarab
    {const e=mk('sc');const f=sr165FoeList().find(q=>q.e===e);f.hit(.6);o.splash=!!e.dead;if(!e.dead)removeE(e)}
    // behind the guns: it falls behind and is gone
    {sr165Place(V,300,0);const [x,z]=P.at(V.s-9,4);const e=sr165Foe('scarab',x,z,'sc');for(let i=0;i<6;i++){__T+=33;eTick(e,1/30,__T)}o.fell=!!e.fall226;sr165Place(V,V.s+45,0);for(let i=0;i<10&&!e.dead&&enemies.includes(e);i++){__T+=33;eTick(e,1/30,__T)}o.gone=!enemies.includes(e)||e.dead}
    // the speed cap
    {V.thr=1;V.st=0;V.boost=0;V.trap=0;for(let i=0;i<150;i++)sr165Drive(V,1/30);o.vmax=[+V.v.toFixed(2),SKR227.v]}
    // worms take 8
    {const W=sr165Worm(V.s+40,-5,5,true);o.worm=W?W.hp:null}
    // the Brood Scorpion past ~40%
    {sr165FoesReset();const s=Math.round(P.S*.45);sr165Place(V,s,0);SR165.ph='run';SKR226.T.calm=0;SKR226.T.cp=SR165.cp;SKR226.T.e=[0,0];sr165Spawn(.03);o.brood=enemies.some(e=>!e.dead&&e.sr165==='gs'&&e.c.al)}
    sr165FoesReset();sr165End()}
  // ---- sounds ----
  o.bus=!!(SND226.n&&SND226.a===AUD);
  {const real=AUD,meas=async fn=>{const sr=44100,oc=new OfflineAudioContext(1,sr,sr);Object.defineProperty(oc,'state',{get:()=>'running'});const g=oc.createGain();g.gain.value=.32;g.connect(oc.destination);oc.out=g;
      AUD=oc;const a0=SND226.a;snd226Bus();SND208.a=oc;SND208.rv=null;SND208.rvq=1;SND208.last={};for(const k in sfxLast)delete sfxLast[k];try{fn()}finally{AUD=real;SND226.a=a0}
      const b=await oc.startRendering(),d=b.getChannelData(0);let pk=0;for(const x of d)pk=Math.max(pk,Math.abs(x));return pk>0?+(20*Math.log10(pk)).toFixed(1):-99};
    o.slash=await meas(()=>sfx('slash'));o.hit=await meas(()=>sfx('hit'));o.swing=await meas(()=>sfx('swing'));SND208.a=null}
  {const k0=SET.sfx;ABX.ctx=1;ABX.sfx=true;SET.sfx=false;saveSet();ABX.ctx=0;SET.sfx=k0;o.saved=JSON.parse(localStorage.getItem('et_set')||'{}').sfx;saveSet()}
  // ---- raised floors ----
  {const I=INSL[22];toPos(I.en[0],I.en[1],0);await wait(600);for(let i=0;i<20;i++){__T+=33;homeTick(1/30,__T)}const R=OS165.S&&OS165.S.R;o.reliq=!!R;
    if(R){const x=R.x+3.2,z=R.z+.4;pl.position.set(x,GH(x,z),z);const y0=pl.position.y,rg=new THREE.Mesh(new THREE.RingGeometry(1,1.3,16),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));rg.position.set(R.x-3,GH(R.x-3,R.z)+.05,R.z);scene.add(rg);const r0=rg.position.y;
      const U=rs226Pre();o.rq={hero:+(pl.position.y-R.g.position.y).toFixed(2),ring:+(rg.position.y-R.g.position.y).toFixed(2)};rs226Post(U);o.rqBack=Math.abs(pl.position.y-y0)<1e-6&&Math.abs(rg.position.y-r0)<1e-6;scene.remove(rg);rg.geometry.dispose();rg.material.dispose()}}
  {const I=INSL[insG(5,3)];toPos(I.en[0],I.en[1],0);await wait(600);for(let i=0;i<10;i++){__T+=33;homeTick(1/30,__T)}const A=ARN.find(a=>a.i===5);
    if(A&&D5.fa!=null){const F=[Math.cos(D5.fa),Math.sin(D5.fa)],Rt=[-Math.sin(D5.fa),Math.cos(D5.fa)],w=(u,v)=>[A.cx+(F[0]*u+Rt[0]*v)*DK,A.cz+(F[1]*u+Rt[1]*v)*DK];
      const [cx,cz]=w(0,0),[tx,tz]=w(0,6),[dx,dz]=w(10.8,0);o.carpet=+(rs226Top(cx,cz)-GH(cx,cz)).toFixed(3);o.tile=+(rs226Top(tx,tz)-GH(tx,tz)).toFixed(3);o.dais=+(rs226Top(dx,dz)-GH(dx,dz)).toFixed(3);
      pl.position.set(cx,GH(cx,cz),cz);const U=rs226Pre();o.onCarpet=+(pl.position.y-GH(cx,cz)).toFixed(3);rs226Post(U)}}
  // ---- the Sanctum ----
  {const P=dg165SanPlan();o.sanct={knights:P.statues.length,jets:P.jets.length,gap:DG165SP.spkGap,step:DG165SP.spkStep,wants:P.statues.map(q=>dg165SWant(q,P.altar)).join('')}}
  return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r))
    fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    g=r['gun'];ok(g['collars']==2 and g['into'] is not None and g['into']>.05 and g['step'] is not None and abs(g['step'])<.006,'gun: barrels reach into the breech, the step plate sits on the deck %s'%g)
    ok(r['run'],'the Sandstorm Run starts')
    a,b=r['arc'];ok(a<=b+1e-3 and a>b-.08 and r['aimArc']<=b+1e-3,'the guns stop at the half circle (%s / %s, aim %s)'%(a,b,r['aimArc']))
    ok(r['look'][0]>.05 and r['look'][1]>.02,'mouse-look moves the crosshair %s'%r['look'])
    ok(r['key']>.5,'D sweeps the crosshair right %s'%r['key'])
    ok(r['shots']=={'sc':1,'sp':5,'sb':9,'gs':55},'shells to kill (v227): scarab 1, scorpion 5, Shellback 9, Brood Scorpion 55 %s'%r['shots'])
    ok(not r['splash'],'v227: a glancing .6 of a shell no longer kills a scarab')
    ok(r['fell'] and r['gone'],'a creature behind the guns falls behind and is gone (%s %s)'%(r['fell'],r['gone']))
    ok(r['vmax'][0]<=r['vmax'][1]+.05,'the Skimmer cruises at %s at most %s'%(r['vmax'][1],r['vmax']))
    ok(r['worm']==12,'worms take 12 shells (v227) (%s)'%r['worm'])
    ok(r['brood'],'a Brood Scorpion hunts the Skimmer past 40%')
    ok(r['bus'],'the effects bus is rewired (make-up, presence, limiter)')
    ok(-9<=r['hit']<=-.3 and r['slash']>-15 and r['swing']>-28,'hits stand out without clipping: hit (blunt) %s dB, slash %s, swing %s'%(r['hit'],r['slash'],r['swing']))
    ok(r['saved'] is not False,'the ability preview\'s mute is never saved (%s)'%r['saved'])
    ok(r['reliq'] and r.get('rq',{}).get('hero',0)>=.35 and r.get('rq',{}).get('ring',0)>=.38 and r.get('rqBack'),'the hero and ground marks stand on the Reliquary\'s floor, put back after %s %s'%(r.get('rq'),r.get('rqBack')))
    ok(r.get('carpet',0)>=.1 and .05<=r.get('tile',0)<.09 and r.get('dais',0)>=.2 and r.get('onCarpet',0)>=.1,'Vaelric\'s hall: carpet %s, tiles %s, dais %s, hero on the carpet %s'%(r.get('carpet'),r.get('tile'),r.get('dais'),r.get('onCarpet')))
    S=r['sanct'];ok(S['knights']==8 and S['jets']==7 and S['gap']>=.5 and len(set(S['wants']))==8,'the Sanctum: eight knights facing eight ways, seven jets, spike gap %s'%S)
    ok(not errs,'no page errors %s'%errs[:3])
    print('RESULT','PASS' if not fails else 'FAIL %d'%fails)
play.run(s)
