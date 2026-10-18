# v89 bossfx: camera-at-the-den-edge screenshots for every den (wall cutaway / occlusion fade check)
# DENS=0,1,2 AW_TMP=<out dir> python3 v89_bossfx_view.py   -> out/v89v_d<i>_<cfg>.png  (FIGHT=0: no fight)
import play,json,os
# a busy machine can take minutes to parse the page: allow a longer first load
from playwright.sync_api import Page as _Pg
_g0=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _g0(self,url,**k)
_Pg.goto=_goto
DENS=[int(x) for x in os.environ.get('DENS','0,1,2,3,4,5').split(',')]
FIGHT=os.environ.get('FIGHT','1')!='0'
# (name, angle offset from the entrance, hero radius as a share of ARENA_R, pitch, camera distance)
CFGS=[('low',2.2,.93,.18,9.5),('mid',3.4,.9,.35,12),('far',4.4,.95,.3,15),('close',1.4,.97,.25,5.5)]
def s(pg):
    pg.set_default_timeout(300000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="ranger"]',timeout=300000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    for i in DENS:
        ev("(i)=>{if(window.STEP)performance.now=window.__pn;enterMap(i)}",i);pg.wait_for_timeout(3500)
        ev("""(i)=>{window.__pn=window.__pn||performance.now.bind(performance);window.VT=window.__pn();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
          window.__pr=window.__pr||POST.render;window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));POST.render=()=>{};for(let k=0;k<n;k++){VT+=16;hero.hp=heroMax();hero.iv=1;if(k==n-1&&draw)POST.render=__pr;try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,500))}}POST.render=__pr;return VT};
          window.XA=ARN[i];window.EA=(i<2)?d01Ent(XA):(XA.dn&&XA.dn.ea!=null?XA.dn.ea:dqEntry(XA));
          window.CAM=(x,z,yaw,pit,dist)=>{toPos(x,z);camYaw=yaw;camPitch=pit;camDist=dist;snapCam()};window.YAW=a=>Math.atan2(Math.cos(a),Math.sin(a));
          enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});return 1}""",i)
        print('den',i,'floor rise at the edge',ev("()=>{const y0=GH(XA.cx,XA.cz);let mx=-9,mn=9;for(let r=10;r<=16;r+=1)for(let a=0;a<6.283;a+=.1){const h=GH(XA.cx+Math.cos(a)*r,XA.cz+Math.sin(a)*r)-y0;mx=Math.max(mx,h);mn=Math.min(mn,h)}return [+mn.toFixed(2),+mx.toFixed(2),typeof BFX!='undefined'?BFX.cutN:-1]}"))
        if FIGHT:
            print('fight',ev("()=>{const x=XA.cx+Math.cos(EA)*9,z=XA.cz+Math.sin(EA)*9;CAM(x,z,YAW(EA),.4,10);STEP(1.2);const B=bossEnt(XA.i);if(B){B.bs.t=99;B.bs.ult=99}return !!AF}"))
        for n,da,rk,pit,dist in [c for c in CFGS if not os.environ.get('CFG') or c[0] in os.environ['CFG'].split(',')]:
            r=ev("(c)=>{const [da,rk,pit,dist]=c,a=EA+da,R=ARENA_R*rk,x=XA.cx+Math.cos(a)*R,z=XA.cz+Math.sin(a)*R;CAM(x,z,YAW(a),pit,dist);const B=bossEnt(XA.i);if(B){B.bs.t=99;B.m.position.set(XA.cx,0,XA.cz)}STEP(1.4,1);return [+cam.position.distanceTo(pl.position).toFixed(1),+Math.hypot(cam.position.x-XA.cx,cam.position.z-XA.cz).toFixed(1)]}",[da,rk,pit,dist])
            print('den',i,n,r)
            if os.environ.get('DBG'):print('hits',ev("()=>{const rc=new THREE.Raycaster(),d=V().subVectors(gY(pl.position,1.1),cam.position),L=d.length();rc.set(cam.position,d.normalize());rc.far=L;rc.camera=cam;return rc.intersectObjects(scene.children,true).slice(0,8).map(h=>[h.object.type,h.object.material&&h.object.material.type,!!(h.object.material&&h.object.material.userData.bfxCut),h.object.material&&h.object.material.transparent,+h.distance.toFixed(1),(()=>{let o=h.object,k=0;while(o.parent&&o.parent!==scene){o=o.parent;k++}return [o===XA.g,k,o.type,o.name]})()])}"))
            pg.screenshot(path=play.TMP+'/v89v_d%d_%s.png'%(i,n),timeout=180000,animations='disabled')
        ev("()=>{if(AF)arenaFail();STEP(.5)}")
    print('LOOPERR',ev('()=>window.LERR||[]'))
    print('ERRS',errs[:5])
play.run(s,w=900,hh=560)
