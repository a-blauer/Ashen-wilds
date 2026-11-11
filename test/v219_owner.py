# v219 owner's list (Nov 10 2026): one check per fix that can be read from the game's state.
#   Burningeye: gate spiders worth 1 XP, 25% fewer (cap, skip), the frost gate's dark plane inside the opening; the Rime Wraith's song
#   is 32 bars and parses; Argus is "Hundred-eyed"; cinematics open over the land (the opening yaw points into the instance);
#   Searing Sands II: no urn inside a statue / obelisk / column, the altar is solid and never fades, the road gate's floor is level,
#   the court's wall is solid, the urn's portrait is the urn, Kheprit walks round the dais; Sands trees: cactus arms join the trunk,
#   spire tips sit on the apex; flames: camp cones become flame sprites; the Sandskimmer's new turbine and shield, no old cowl;
#   Ssith'ra's body takes hits; Dirge I: the angel stands near the entrance, risen dead come out on open ground; the Sanctum's spikes
#   are slower, its stairwell is cut; the raft: a Hulk does not flinch, its slam pose differs from a Wretch's rake.
import play,json
JS=r"""async()=>{const o={},V3=THREE.Vector3;
  // ---- Burningeye ----
  o.fsxp=FS192.xp;o.cap=[MQ160.cap,MQ160.capC];{const e={c:{l:22,al:0,boss:0},fs160sp:1};o.gw=gw150X(e)}
  {const th=MTH.z2x;o.z2x={n:th.prog.length,A:!!mu215Parse(th.tune.A,th.prog.length),B:!!mu215Parse(th.tune.B,th.prog.length)}}
  {const I=INSL[insG(2,1)];toPos(I.en[0],I.en[1],0);await new Promise(r=>setTimeout(r,400));try{mq160Build()}catch(e){o.mqErr=String(e)}fg218Void();const v=MQ160.S&&MQ160.S.gate.v219;o.void=v?[v.position.x,v.position.y,v.position.z]:null}
  o.argus=KC208&&JSON.stringify(KC208.lines||'').indexOf('Hundred-eyed')>=0;
  // the opening of the zone cinematics faces into the instance
  o.into=[0,1,2,3,4,5].map(z=>{const I=INSL[insG(z,0)],H=new V3(I.en[0],0,I.en[1]),y=cin218Into(H);if(y==null)return null;const x=H.x+Math.sin(y)*CIN218.look,zz=H.z+Math.cos(y)*CIN218.look,J=insAt(Math.round(x),Math.round(zz));return !!J&&J.g===I.g});
  // ---- Searing Sands II ----
  {const T=ss165T2(),O=ts218Obst(T);o.urnClash=T.urns.filter(u=>O.some(q=>Math.hypot(u.a-q[0],u.b-q[1])<q[2]-.01)).length;o.urnMoved=T.urns.filter(u=>u.m218).length;
    const I=ss165I(1);toPos(...T.F.W2(-8,0),0);await new Promise(r=>setTimeout(r,400));try{cy165Build()}catch(e){o.cyErr=String(e)}
    const [ax,az]=T.F.W2(T.altar.a+1.9,T.altar.b+1.2);o.altarSolid=solid(Math.round(ax),Math.round(az));
    const [wx,wz]=T.F.W2(T.R+.9,6);o.wallSolid=solid(Math.round(wx),Math.round(wz));const [gx,gz]=T.F.W2(-T.R-.9,0);o.gateOpen=!solid(Math.round(gx),Math.round(gz));
    o.gateFloor=+(GH(...T.F.W2(-T.R-1,0))-T.y0).toFixed(2);o.roadN=TS218.roadN;
    let nf=0,tot=0;CY165.g.traverse(m=>{if(m.isMesh&&m.material&&m.material.userData&&m.material.userData.noFade135)nf++;if(m.isMesh)tot++});o.noFade=nf;
    // the urn's portrait
    try{kh165Urns()}catch(_){}const u=KH165W.urns[0];if(u){setTarget(u);o.urnPic=!!(TPV.m&&TPV.m.rig&&!TPV.m.userData.fl218);setTarget(null)}
    // Kheprit's way round the dais
    RF165.E={go:0,t:0,hp:100};KH165W.e=KH165W.e||kh165Laid();const [sx,sz]=T.F.W2(T.altar.a-3.9,T.altar.b+.8);KH165W.e.m.position.set(sx,T.y0,sz);
    const p1=rf165KhSpot(),[pa,pb]=T.F.L2(p1.x,p1.z);o.khFirst=[+pa.toFixed(1),+pb.toFixed(1)];RF165.E=null}
  // ---- the sands' trees ----
  o.trees=TR218.n;
  // ---- flames ----
  {const C=CAMPS.find(c=>{const J=insAt(c.x,c.z);return J&&J.g===insG(1,0)});if(C){toPos(C.x+2,C.z+2,0);for(let i=0;i<8;i++){await new Promise(r=>setTimeout(r,300));try{campTick(.016,performance.now())}catch(_){}}}}
  try{fl218Cones()}catch(_){}o.flames=FL218.L.length;o.cflHidden=CFL.filter(f=>f.userData&&f.userData.fl218).length;
  // ---- the Sandskimmer model ----
  {const R=svRig();sk165Build(R);svRest(R);let duct=0,old=0;const G=[SVX.gc.skcowl,SVX.gc.skshld2];R.root.traverse(m=>{if(!m.isMesh)return;if(m.geometry===SVX.gc.sk218duct)duct++;if(G.includes(m.geometry))old++});
    o.sk={duct,old,fanY:+R.J.fan.position.y.toFixed(2)}}
  // ---- Ssith'ra ----
  {const P=[new V3(5,0,0)];const fake={dead:false,boss:true,bi:3,m:{position:new V3(0,0,0),visible:true,updateMatrixWorld(){}},sv:{gone:0,R:{J:{}}}};
    for(let k=0;k<SSR.N;k++){const J=new THREE.Object3D();J.position.set(k*.9+.9,0,0);J.updateMatrixWorld(true);fake.sv.R.J['s'+k]=J}
    enemies.push(fake);const U=sb218Swap(P);o.ss={moved:U.length,x:+fake.m.position.x.toFixed(2)};sb218Back(U);o.ss.back=fake.m.position.x;enemies.splice(enemies.indexOf(fake),1)}
  // ---- Dirge I ----
  {const s=dg218AngelSpot(),I=INSL[20];o.angel=s?+Math.hypot(s.x-I.en[0],s.z-I.en[1]).toFixed(1):null;const G=dg165GravePlan().G[0];toPos(I.en[0],I.en[1],0);await new Promise(r=>setTimeout(r,300));try{dg165GBuild()}catch(_){}
    const q=dg218Out(G,0);o.risenOut=q?!solid(Math.round(q[0]),Math.round(q[1]))&&Math.hypot(q[0]-G.x,q[1]-G.z)>2.4:null}
  // ---- the Sanctum ----
  o.spk=[DG165SP.spkStep,DG165SP.spkWarn];o.wellN=DS218.n;
  // ---- the raft ----
  {RF218.hulk=true;const a=dg165WPose('rake',0,0,{k:.55,arm:0});RF218.hulk=false;o.slam=+(a.pitch-dg165WPose('rake',0,0,{k:.55,arm:0}).pitch).toFixed(2)}
  return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="assassin"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r))
    fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    ok(r['fsxp']==0 and r['gw']==0,'gate spiders: no XP share (1 XP after the floor) %s %s'%(r['fsxp'],r['gw']))
    ok(r['cap']==[24,30],'gate spiders capped 25%% lower %s'%r['cap'])
    ok(r['z2x']=={'n':16,'A':True,'B':True},'the Rime Wraith song is 16 chords, both parts parse %s'%r['z2x'])
    ok(r.get('void') and abs(r['void'][0])<.01 and abs(r['void'][1]-3.35)<.01,'the frost gate dark plane is in the opening %s'%r.get('void'))
    ok(r['argus'],'Argus is the Hundred-eyed wolf')
    ok(all(x for x in r['into'] if x is not None) and sum(1 for x in r['into'] if x)>=5,'cinematic openings look into their instance %s'%r['into'])
    ok(r['urnClash']==0,'no urn inside a statue, obelisk or column (%d moved)'%r['urnMoved'])
    ok(r['altarSolid'] and r['wallSolid'] and r['gateOpen'],'altar and wall solid, the road gate open %s %s %s'%(r['altarSolid'],r['wallSolid'],r['gateOpen']))
    ok(abs(r['gateFloor'])<.25 and (r.get('roadN') or 0)>0,'the road gate floor is level with the court (%s, %s heights)'%(r['gateFloor'],r.get('roadN')))
    ok(r['noFade']>=1,'the altar never fades (%s meshes)'%r['noFade'])
    ok(r.get('urnPic'),'the urn portrait is the urn')
    ok(r['khFirst'][0]<0 and abs(r['khFirst'][1])>4,'Kheprit heads round the dais first %s'%r['khFirst'])
    ok(r['trees']['cactus']>0 and r['trees']['spire']>0,'sands trees fixed %s'%r['trees'])
    ok(r['flames']>0 and r['cflHidden']>0,'camp cones replaced by flames (%s flames, %s cones)'%(r['flames'],r['cflHidden']))
    ok(r['sk']['duct']==1 and r['sk']['old']==0 and r['sk']['fanY']>2.4,'skimmer: one new duct, no old cowl or shield rim, fan raised %s'%r['sk'])
    ok(r['ss']['moved']==1 and r['ss']['x']>3 and r['ss']['back']==0,"Ssith'ra counts as hit at her body, put back after %s"%r['ss'])
    ok(r['angel'] is not None and r['angel']<30,'the weeping angel stands near the entrance (%s)'%r['angel'])
    ok(r['risenOut'],'the risen climb out onto open ground %s'%r['risenOut'])
    ok(r['spk'][0]>=1 and r['spk'][1]>=.6 and (r.get('wellN') or 0)>0,'sanctum spikes slower, stairwell ground cut %s %s'%(r['spk'],r.get('wellN')))
    ok(abs(r['slam'])>.2,'the Hulk slams with its own pose (%s)'%r['slam'])
    print('FAILS',fails)
play.run(s)
