# v208 (owner, Nov 9 2026): a Sovereign's essence, the fountain of essence, heavier RPG sounds.
#   1. fountain: rebuilt in the plaza's fountain group (stone + essence: pools, sheets, mist, orb), the round shapes kept from the
#      low-poly pass, the rim top under every rim seat at the seat's height, a villager sat on each seat has its hips on the rim and its
#      feet outside the basin, the Gilded Fountain decoration builds and its crown sits over the cage
#   2. essence: a Sovereign slain (here through the co-op credit path, no body) leaves its essence in the den; spawnBoss stays off;
#      the state and the corpse spot survive save / load; a carried essence's rift is built near the den; an old save's cleared
#      Sovereigns read as poured; a partner's credit for an already slain Sovereign changes nothing; pouring grows the kingdom
#   3. sounds: every new voice plays without an error; a melee swing plays the swing
#   4. pictures (out/v208_*.png): the fountain, a villager on the rim, the essence over a corpse, the rift
# (the kill → siphon → rift → pour walk-through is in v32t.py; the co-op credit in v148_revive.py)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:400],flush=True)
    if not ok:FAIL.append(n)
FTN=r"""()=>{const R={fail:[]},F=m=>R.fail.push(m),T=TOWNS[0],V=THREE.Vector3;try{
  const f=T.ftnG;if(!f||FTN208.g!==f)F('fountain not rebuilt');const st=f.children.find(o=>o.name=='ftn208stone');if(!st)F('no stone');
  R.ess=FTN208.ess.length;if(R.ess<15)F('essence parts: '+R.ess);
  let bad=0;f.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData.se208&&!o.userData.lpsSkip)bad++});if(bad)F(bad+' essence meshes left to the low-poly pass');
  // the rim under each seat
  f.updateMatrixWorld(true);const rc=new THREE.Raycaster(),seats=dm196Spots().filter(s=>s.k=='rim');R.seats=seats.length;if(seats.length!=8)F('rim seats: '+seats.length);R.rim=[];
  seats.forEach(s=>{rc.set(new V(s.x,6,s.z),new V(0,-1,0));const h=rc.intersectObject(st,true)[0];const y=h?h.point.y-f.getWorldPosition(new V()).y:null;R.rim.push(y==null?null:+y.toFixed(3));
    if(y==null||Math.abs(y-s.h)>.03)F('seat at '+Math.atan2(s.x-T.cx,s.z-T.cy).toFixed(2)+': rim top '+y+' vs seat '+s.h)});
  // a villager sat on every seat: hips on the rim, feet outside the basin
  const rig=idlNpcBody({robe:0x6a4a3a,trim:0xc9a24a,hat:'',fkSp:'fox',fkFur:0,label:''}),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);
  scene.add(g);g.position.set(0,0,0);g.updateMatrixWorld(true);g.userData.hipY=g.bones.lh0.getWorldPosition(new V()).y;const y0=f.getWorldPosition(new V()).y;R.sit=[];
  seats.forEach((s,i)=>{IDL.on=false;czReset103(g);g.position.set(s.x,y0,s.z);g.rotation.y=s.ry;const o={g,i,act:{a:'rim',s}};dm196Pose(o,1000);g.updateMatrixWorld(true);
    const hp=g.bones.pelvis.getWorldPosition(new V()),ft=['lh2','rh2'].map(k=>g.bones[k].getWorldPosition(new V())),rr=p=>Math.hypot(p.x-T.cx,p.z-T.cy);
    const hy=g.bones.lh0.getWorldPosition(new V()).y-y0;R.sit.push([+hy.toFixed(2),+rr(hp).toFixed(2),ft.map(p=>+rr(p).toFixed(2))]);
    if(Math.abs(hy-(s.h+.07))>.09)F('seat '+i+': hips at '+hy.toFixed(2));if(ft.some(p=>rr(p)<2.38))F('seat '+i+': a foot inside the basin ('+ft.map(rr).map(v=>v.toFixed(2))+')');dm196Undo(o)});
  IDL.on=true;scene.remove(g);
  // the Gilded Fountain
  SH.deco=SH.deco||{};SH.deco.gild=1;dc103Sync();const G=DC103.g&&DC103.g.gild;if(!G)F('no gilded fountain');else{G.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(G);R.gild=[+b.min.y.toFixed(2),+b.max.y.toFixed(2)];
    if(b.max.y-G.position.y<3.7)F('gild crown below the cage: '+(b.max.y-G.position.y).toFixed(2))}
 }catch(e){F('threw '+e.message+' '+String(e.stack).slice(0,400))}return R}"""
ESS=r"""()=>{const R={fail:[]},F=m=>R.fail.push(m);try{
  // a partner's credit (no body): the essence waits at the den
  bossDefeated({ar:2});R.s2=se208St(2);if(R.s2!==1)F('credit: state '+R.s2);if(!SE208.mk[2])F('credit: no essence in the den');if(bossDone.has(2))F('credit unlocked at once');
  const A=ARN[2],M=SE208.mk[2];if(M&&Math.hypot(M.x-A.cx,M.z-A.cz)>.01)F('lingering essence not at the arena');
  if(spawnBoss(2))F('spawnBoss brought the slain Sovereign back');
  let n=0;const f0=bossDefeated;bossDefeated=function(){n++;return f0.apply(this,arguments)};try{bc148Sov(2,'X')}finally{bossDefeated=f0}if(n)F('a second credit ran bossDefeated again');
  // carried + slain survive save / load; an old save's cleared Sovereign reads as poured
  SE208.st[3]=2;SE208.p[3]=[ARN[3].cx,ARN[3].cz];bossDone.add(1);
  const x=JSON.parse(JSON.stringify(x2Save()));R.saved=x.se208;se208Reset();if(SE208.mk[2])F('reset left the essence');x2Load(x);
  R.after=[se208St(1),se208St(2),se208St(3),!!SE208.mk[2]];if(R.after.join()!=='3,1,2,true')F('after load: '+R.after);
  const Q=se208RiftSpot(3);toPos(Q.x+3,Q.z+3);se208Sync();if(!SE208.rift[3])F('no rift for a carried essence near its den');
  const Q1=se208RiftSpot(1);toPos(Q1.x+3,Q1.z+3);se208Sync();if(!SE208.rift[1])F('no rift in a den cleared before v208');
  if(RPORT.some(r=>r.k=='exit'&&r.g.visible))F('a golden portal home shows');
  // pouring: the kingdom grows
  const s0=kf109().s;se208Claim(3);R.grow=[s0,kf109().s];if(!bossDone.has(3))F('claim did not clear');if(kf109().s<=s0&&s0<5)F('the kingdom did not grow');
  if(se208Held().length)F('still held: '+se208Held());
 }catch(e){F('threw '+e.message+' '+String(e.stack).slice(0,400))}return R}"""
SND=r"""()=>{const R={fail:[]},F=m=>R.fail.push(m);try{audio();R.st=AUD&&AUD.state;
  ['slash','blunt','stab','arrow','ahit','zap','crit','swing','siphon','essence','rift','pour'].forEach(k=>{SND208.last={};sfx(k)});['fall','elite','lvl','victory'].forEach(k=>{SND208.last={};mSfx(k)});
  if(SND208.err)F('a sound threw');
  if(R.st==='running'){SND208.last={};swingAnim(0,320,()=>{});R.sw=!!SND208.last.swing;if(!R.sw)F('no swing sound');SND208.last={};swingAnim(0,320);if(SND208.last.swing)F('a gathering swing whooshed')}
 }catch(e){F('threw '+e.message)}return R}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("()=>{window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=5},40)}")
    r=ev(FTN);print('fountain',json.dumps({k:v for k,v in r.items() if k!='fail'}))
    chk('fountain: rebuilt, rim under every seat, villagers on the rim, gilded fountain fits',not r['fail'],r['fail'])
    # pictures: the fountain from the plaza, close, and with villagers on the rim
    ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+7);camYaw=Math.PI;camPitch=.28;camDist=9;snapCam()}");pg.wait_for_timeout(1500)
    pg.screenshot(path=play.TMP+'/v208_fountain.png')
    ev("""()=>{const T=TOWNS[0],V=THREE.Vector3;window.__sit=[];const y0=T.ftnG.getWorldPosition(new V()).y;dm196Spots().filter(s=>s.k=='rim').slice(3,6).forEach((s,i)=>{const rig=idlNpcBody({robe:[0x6a4a3a,0x3a4a6a,0x4a3a5a][i],trim:0xc9a24a,hat:'',fkSp:['fox','bear','mouse'][i],fkFur:0,label:''}),g=new THREE.Group();
      rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);scene.add(g);g.userData.hipY=g.bones.lh0.getWorldPosition(new V()).y;g.position.set(s.x,y0,s.z);g.rotation.y=s.ry;const o={g,i,act:{a:'rim',s}};dm196Pose(o,1000);__sit.push(g)});
      toPos(T.cx,T.cy+5.5);camYaw=Math.PI;camPitch=.12;camDist=4.5;snapCam()}""");pg.wait_for_timeout(1500)
    pg.screenshot(path=play.TMP+'/v208_fountain_sit.png')
    ev("()=>{const T=TOWNS[0];toPos(T.cx+2,T.cy+3.5);camYaw=Math.PI*.8;camPitch=.05;camDist=3;snapCam()}");pg.wait_for_timeout(1500)
    pg.screenshot(path=play.TMP+'/v208_fountain_close.png')
    ev("()=>{(window.__sit||[]).forEach(g=>scene.remove(g))}")
    r=ev(ESS);print('essence',json.dumps({k:v for k,v in r.items() if k!='fail'}))
    chk('essence: credit, save / load, rifts, old saves, pour',not r['fail'],r['fail'])
    # pictures: the essence over a slain Sovereign's body, then the rift
    r=ev("""()=>{bossDone.delete(0);se208Reset();enemies.slice().forEach(e=>{if(e.boss)removeE(e)});const e=spawnBoss(0),A=ARN[0];pl.position.set(A.cx+4,0,A.cz+4);return !!e}""");pg.wait_for_timeout(2500)
    ev("()=>{const e=bossEnt(0);if(e){e.c.h=1;hurt(e,999999,1)}}");pg.wait_for_timeout(4500)
    k=ev("()=>{const M=SE208.mk[0];if(!M)return null;toPos(M.x+5,M.z+5);camYaw=Math.atan2(5,5);camPitch=.25;camDist=9;snapCam();return [se208St(0),!!(SE208.cor[0]&&SE208.cor[0].g.parent)]}")
    pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v208_corpse.png')
    chk('kill: the corpse stays with its essence',k==[1,True],k)
    ev("()=>{se208Done(0)}");pg.wait_for_timeout(3500)
    ev("()=>{const Q=SE208.rift[0];toPos(Q.x+Math.sin(Q.g.rotation.y)*5,Q.z+Math.cos(Q.g.rotation.y)*5);camYaw=Q.g.rotation.y;camPitch=.15;camDist=6;snapCam()}");pg.wait_for_timeout(1500)
    pg.screenshot(path=play.TMP+'/v208_rift.png')
    r=ev(SND);print('sounds',json.dumps(r))
    chk('sounds: every voice plays, melee swings whoosh',not r['fail'],r['fail'])
play.run(s,w=1000,hh=620)
print('RESULT',('FAIL '+', '.join(FAIL)) if FAIL else 'ALL PASS')
