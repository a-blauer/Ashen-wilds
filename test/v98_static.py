# v98 perf_static: chunk containers, hidden roots skipped, frozen (guarded) scenery matrices.
#   python3 v98_static.py                        numbers + checks + screenshots of dist/ashen-wilds.html -> out/v98_after.json
#   SRC=old.html TAG=before NOCHK=1 SHOTS=0 python3 v98_static.py    numbers only (out/v98_before.json)
#   REF=out/v98_before.json python3 v98_static.py                    also prints before -> after
# Numbers (middle of Kindlelight, next to a camp): objects in the scene, scene.children, scene.updateMatrixWorld() ms,
# objects visited / matrices composed per frame, and a whole frame's JS (loop + POST.render) with ren.render stubbed
# by what the renderer does on the CPU before drawing (scene.updateMatrixWorld + a projectObject-like walk + a
# shadow-pass-like walk).
# Checks (after only): at a camp, after harvesting a node and walking away/back, in Duskhold and at a den, every
# visible object's world matrix equals a full stock recompute, and every frozen object's matrix still matches its
# position/rotation/scale; also during den fights (DENF=1,5). Screenshots out/v98_<spot>.png.
import play,json,os
from playwright.sync_api import Page
_g=Page.goto
def _sg(self,url,**k):k['timeout']=max(k.get('timeout') or 0,900000);return _g(self,url,**k)
Page.goto=_sg
TAG=os.environ.get('TAG','after');CHK=not os.environ.get('NOCHK');SH=os.environ.get('SHOTS','1')!='0';REF=os.environ.get('REF')
OUT={}
LIB="""()=>{const RN=performance.now.bind(performance);window.RN=RN;
 window.VT=RN();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.GOD=()=>{hero.hp=heroMax()};try{CHEAT.god=true}catch(_){}
 // the renderer's CPU work before drawing: matrices + walking the visible tree (camera pass and shadow pass)
 const fr=new THREE.Frustum(),pm=new THREE.Matrix4(),sp=new THREE.Sphere();
 const proj=(o,F)=>{if(o.visible===false)return 0;let n=1;if((o.isMesh||o.isPoints||o.isSprite)&&o.frustumCulled&&o.geometry){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();sp.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);F.intersectsSphere(sp)}
   const c=o.children;for(let i=0;i<c.length;i++)n+=proj(c[i],F);return n};
 window.__rr=ren.render.bind(ren);window.STUB=()=>{ren.render=function(s,c){if(s.autoUpdate!==false)s.updateMatrixWorld();if(c&&c.parent===null)c.updateMatrixWorld();
   if(s===scene){pm.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);fr.setFromProjectionMatrix(pm);window.__pn=proj(s,fr);proj(s,fr)}}};
 window.UNSTUB=()=>{ren.render=__rr};
 window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));for(let i=0;i<n;i++){VT+=16;GOD();try{loop(VT)}catch(e){console.warn('loop',e)}if(draw&&i==n-1){UNSTUB();POST.render();STUB()}else POST.render()}};
 // a full stock recompute of every visible object's world matrix vs. what the per-frame update left
 window.CHECK=()=>{const O=THREE.Object3D.prototype.updateMatrixWorld;scene.updateMatrixWorld();const L=[];
   const walk=o=>{if(o.visible===false)return;L.push([o,o.matrixWorld.clone()]);o.children.forEach(walk)};scene.children.forEach(walk);
   O.call(scene,true);let bad=[];for(const [o,m] of L){const a=m.elements,b=o.matrixWorld.elements;for(let i=0;i<16;i++)if(Math.abs(a[i]-b[i])>1e-4){bad.push([o.type,o.name,Math.round(o.position.x),Math.round(o.position.z)]);break}}
   let fz=0,fbad=0;if(window.PST)scene.traverse(o=>{if(PST.Z.has(o)){fz++;if(!psOkMatrix(o))fbad++}});
   return {visible:L.length,bad:bad.length,badList:bad.slice(0,8),frozen:fz,frozenBad:fbad,st:window.PST?Object.assign({},PST.st):null}};
 window.STATS=()=>{let tot=0,inst=0,mesh=0,vis=0;scene.traverse(o=>{tot++;if(o.isMesh){mesh++;if(o.isInstancedMesh)inst++}});
   const O=THREE.Object3D.prototype,u=O.updateMatrixWorld,um=O.updateMatrix;let nv=0,nm=0;
   O.updateMatrixWorld=function(f){nv++;return u.call(this,f)};O.updateMatrix=function(){nm++;return um.call(this)};
   scene.updateMatrixWorld();nv=0;nm=0;scene.updateMatrixWorld();O.updateMatrixWorld=u;O.updateMatrix=um;
   const t=[];for(let r=0;r<5;r++){const a=RN();for(let i=0;i<40;i++)scene.updateMatrixWorld();t.push((RN()-a)/40)}t.sort((a,b)=>a-b);
   return {objects:tot,meshes:mesh,instanced:inst,sceneChildren:scene.children.length,umwVisited:nv,umwComposed:nm,umwMs:+t[2].toFixed(3),walked:window.__pn||0}};
 window.FRAME=(n)=>{const ts=[],us=[];const O=scene.updateMatrixWorld;
   for(let i=0;i<n;i++){VT+=16;GOD();const a=RN();loop(VT);POST.render();ts.push(RN()-a)}
   ts.sort((a,b)=>a-b);const m=ts[Math.floor(n/2)],avg=ts.reduce((a,b)=>a+b,0)/n;return {median:+m.toFixed(2),mean:+avg.toFixed(2),p90:+ts[Math.floor(n*.9)].toFixed(2)}};
 // which top-level objects still compose matrices every frame (and why they are not frozen)
 window.DIAG=()=>{const O=THREE.Object3D.prototype,um=O.updateMatrix,cnt=new Map();O.updateMatrix=function(){let r=this;while(r.parent&&r.parent!==scene)r=r.parent;cnt.set(r,(cnt.get(r)||0)+1);return um.call(this)};
   scene.updateMatrixWorld();O.updateMatrix=um;const why=r=>{if(!window.PST)return '';if(PST.X.has(r)){let b='';r.traverse(o=>{if(o.isBone||o.isSkinnedMesh)b='bones';else if(!b&&!o.matrixAutoUpdate&&!PST.Z.has(o)&&!psOkMatrix(o))b='matrix'});return 'X:'+(b||(r===pl?'hero':enemies.some(e=>e.m===r)?'enemy':'thawed'))}return PST.R.has(r)?'R':'-'};
   return [...cnt].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([r,n])=>[n,r.type,r.name,Math.round(r.position.x),Math.round(r.position.z),why(r)])};
 window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};
 // stand d tiles from (tx,tz) at angle a, facing it; noon light for the screenshots
 window.LOOK=(tx,tz,a,d,pit,dist)=>{TOD=.25;CAM(tx+Math.cos(a)*d,tz+Math.sin(a)*d,Math.atan2(Math.cos(a),Math.sin(a)),pit,dist)};
 STUB();return 1}"""
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c,a=None:(lambda v:(print(n,'=>',json.dumps(v)[:1500]),v)[1])(ev(c,a) if a is not None else ev(c))
    fails=[]
    def ok(c,msg):
        if not c:fails.append(msg);print('FAIL',msg)
    def shot(n):
        if SH:ev("()=>STEP(.05,1)");pg.screenshot(path=play.TMP+'/v98_'+n+('' if TAG=='after' else '_'+TAG)+'.png',timeout=300000,animations='disabled')
    def check(n):
        if not CHK:return
        r=P('check '+n,"()=>CHECK()");ok(r['bad']==0,n+': %d visible objects with a wrong world matrix %s'%(r['bad'],r['badList']));ok(r['frozenBad']==0,n+': frozen matrices out of date')
        OUT['check_'+n]=r
    ev(LIB)
    # ---- 1. numbers in the middle of Kindlelight ----
    C=P('camp',"()=>{const C=CAMPS.filter(c=>c.pm===0)[2];window.C0=C;toPos(C.x+14,C.z);snapCam();return [C.x,C.z]}")
    ev("()=>STEP(8)")   # streaming, camp build, freezing sweeps
    st=P('stats',"()=>STATS()");OUT['stats']=st
    fr=P('frame',"()=>FRAME(90)");OUT['frame']=fr
    if os.environ.get('DIAG'):P('diag',"()=>DIAG()")
    if CHK:P('pst',"()=>PST.st")
    # ---- 2. checks + screenshots ----
    ev("()=>{LOOK(C0.x,C0.z,.8,10,.6,16)}");ev("()=>STEP(3)");check('camp');shot('camp')
    # the guard: moving / turning a frozen object thaws it and it is drawn where it now is
    if CHK:
        g=P('guard',"""()=>{const L=[];scene.traverse(q=>{if(L.length<2&&PST.Z.has(q)&&q.visible&&q.parent&&q.parent.visible)L.push(q)});if(L.length<2)return null;
          const [a,b]=L,w0=a.matrixWorld.elements[13];a.position.y+=2;b.rotation.y+=.7;STEP(.05);const c=CHECK();
          return {thawA:a.matrixAutoUpdate&&!PST.Z.has(a),thawB:b.matrixAutoUpdate&&!PST.Z.has(b),dy:+(a.matrixWorld.elements[13]-w0).toFixed(3),bad:c.bad}}""")
        ok(g and g['thawA'] and g['thawB'] and g['bad']==0 and abs(g['dy']-2)<1e-3,'guard thaws moved objects: %s'%g)
    # harvest the nearest tree/rock node, walk far away and back
    h=P('harvest',"""()=>{const C=C0;let best=null,bd=1e9;for(let y=C.z-30;y<C.z+30;y++)for(let x=C.x-30;x<C.x+30;x++){const k=y*W+x;if(NODE[k]&&!gdep[k]&&(MAP[y][x]=='#'||MAP[y][x]=='r')){const d=Math.hypot(x-C.x,y-C.z);if(d>14&&d<bd){bd=d;best=[x,y]}}}
      if(!best)return null;toPos(best[0]+1.5,best[1]);snapCam();const tg=gTarget();if(!tg)return {best,tg:null};gFinish(tg);window.TG=tg;return {best,kind:tg.kind}}""")
    if h:
        ev("()=>{LOOK(TG.x,TG.y,.8,4,.6,9)}");ev("()=>STEP(2)");check('harvest');shot('harvest')
        ev("()=>{toPos(TG.x+160,TG.y);snapCam()}");ev("()=>STEP(4)")
        ev("()=>{LOOK(TG.x,TG.y,.8,4,.6,9)}");ev("()=>STEP(4)");check('harvest_back');shot('harvest_back')
        ok(ev("()=>!!gdep[TG.k]"),'harvested node stays harvested')
    # Duskhold
    ev("()=>{const T=TOWNS[0];LOOK(T.cx,T.cy,1.57,6,.5,18)}");ev("()=>STEP(4)");check('duskhold');shot('duskhold')
    if os.environ.get('DIAG'):P('diag_duskhold',"()=>DIAG()")
    st2=P('stats_duskhold',"()=>STATS()");OUT['stats_duskhold']=st2;OUT['frame_duskhold']=P('frame_duskhold',"()=>FRAME(60)")
    # den (Kindlelight's)
    try:
        ev("()=>{enterMap(0)}");ev("()=>STEP(3)")
        ev("()=>{const A=ARN[0];LOOK(A.cx,A.cz,AR.ent,22,.9,30)}");ev("()=>STEP(4)");check('den');shot('den')
    except Exception as e:print('den step failed',str(e)[:200]);ok(False,'den step')
    # den fights: walk in through the gate, let the Sovereign fight for a few seconds (moving props, bats, necks...)
    for i in [int(x) for x in os.environ.get('DENF','1,5').split(',') if x]:
        try:
            ev("(i)=>{enterMap(i)}",i);ev("()=>STEP(2)")
            r=P('fight%d'%i,"""(i)=>{const A=ARN[i],EA=[AR.ent,HY.ent,A.dn&&A.dn.ea,A.dn&&A.dn.ea,A.dqA,A.dqA][i];window.XA=A;window.EA=EA;
              toPos(A.cx+Math.cos(EA)*(ARENA_R+6),A.cz+Math.sin(EA)*(ARENA_R+6));STEP(.3);
              for(let k=0;k<70&&!AF;k++){walk(pl,-Math.cos(EA)*.25,-Math.sin(EA)*.25);STEP(.03)}return {fight:!!AF}}""",i)
            ok(r['fight'],'den %d fight started'%i)
            ev("()=>{STEP(5)}");check('fight%d'%i)
            ev("()=>{const A=XA;TOD=.25;CAM(A.cx+Math.cos(EA)*(ARENA_R-3),A.cz+Math.sin(EA)*(ARENA_R-3),Math.atan2(Math.cos(EA),Math.sin(EA)),.6,20);STEP(1)}");check('fight%d_b'%i);shot('fight%d'%i)
            ev("()=>{try{arenaFail&&arenaFail()}catch(_){}toPos(DSIGN[XA.i].x,DSIGN[XA.i].z);STEP(1)}")
        except Exception as e:print('den fight failed',str(e)[:300]);ok(False,'den fight %d'%i)
    if CHK:P('pst_end',"()=>PST.st");P('thawed (last)',"()=>PST.log.slice(-12)")
    OUT['errors']=errs[:10];ok(not errs,'page errors: %s'%errs[:3])
    OUT['fails']=fails;print('FAILS',len(fails),fails)
play.run(s)
json.dump(OUT,open(play.TMP+'/v98_%s.json'%TAG,'w'),indent=1)
if REF:
    B=json.load(open(REF));A=OUT
    print('\n| metric | before | after |\n|---|---|---|')
    for k in ('objects','sceneChildren','umwVisited','umwComposed','umwMs','walked'):print('| %s | %s | %s |'%(k,B['stats'][k],A['stats'][k]))
    for k in ('median','mean','p90'):print('| frame JS %s ms | %s | %s |'%(k,B['frame'][k],A['frame'][k]))
    for k in ('umwMs','umwVisited','umwComposed'):print('| Duskhold %s | %s | %s |'%(k,B['stats_duskhold'][k],A['stats_duskhold'][k]))
    print('| Duskhold frame JS median ms | %s | %s |'%(B['frame_duskhold']['median'],A['frame_duskhold']['median']))
