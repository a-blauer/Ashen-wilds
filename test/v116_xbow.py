# v116: the crossbow bolt starts at the crossbow's front end (out/v116_xbow.png shows the bolt frozen just after the shot)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("""()=>{window.SNAP116=()=>{const q=xbowMuzzle116(),dot=new THREE.Mesh(new THREE.SphereGeometry(.035),new THREE.MeshBasicMaterial({color:0xff0000,depthTest:false}));dot.renderOrder=9;dot.position.copy(q);scene.add(dot);const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(420,320);const c=new THREE.PerspectiveCamera(18,420/320,.05,80);
      const cv=document.createElement('canvas');cv.width=840;cv.height=320;const x=cv.getContext('2d'),P=pl.position,f=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),sd=new THREE.Vector3(f.z,0,-f.x);
      [[sd.clone().multiplyScalar(3.2),0],[f.clone().multiplyScalar(-2.6).add(sd.clone().multiplyScalar(1.2)),1]].forEach(([o,i])=>{c.position.set(P.x+o.x,P.y+1.4,P.z+o.z);c.lookAt(P.x+f.x*.6,P.y+1.05,P.z+f.z*.6);rd.render(scene,c);x.drawImage(rd.domElement,i*420,0)});window.SNAPURL=cv.toDataURL('image/png');scene.remove(dot)}}""")
    r=ev("""()=>new Promise(res=>{const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='ranger'&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt=='crossbow');
      eq.weapon={id:99999,tp,lv:1,req:1,r:2,up:0,aff:[]};refreshGear();const n0=shots.length;atkCd=0;let st=null;{const f=sfx;sfx=function(k){if(k=='arrow'&&!st){const sh=shots[shots.length-1],q=xbowMuzzle116();st={d:q?Math.abs(sh.m.position.distanceTo(q)-.45):-1,nil:!q};sh.v.set(0,0,0);sh.t=999;window.SNAP116()}return f.apply(this,arguments)}}swing();
      const t0=performance.now(),iv=setInterval(()=>{if(shots.length>n0){clearInterval(iv);const sh=shots[shots.length-1];const q=xbowMuzzle116();sh.v.set(0,0,0);sh.t=999;
        const hp=pl.position.clone();camYaw=pl.rotation.y+Math.PI*.6;res({tp,wt:itT(eq.weapon).wt,d:st?st.d:-1,dy:sh.m.position.y-pl.position.y,ms:performance.now()-t0})}
        else if(performance.now()-t0>8000){clearInterval(iv);res({tp,none:1})}},5)})""")
    print(r)
    ok=r.get('d',-1)>=0 and r['d']<.06;print(('ok   ' if ok else 'FAIL ')+'bolt starts at the muzzle',r)
    if not ok:FAIL.append('muzzle')
    url=ev("()=>window.SNAPURL")
    _=("""()=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(420,320);const c=new THREE.PerspectiveCamera(18,420/320,.05,80);
      const cv=document.createElement('canvas');cv.width=840;cv.height=320;const x=cv.getContext('2d'),P=pl.position,f=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),sd=new THREE.Vector3(f.z,0,-f.x);
      [[sd.clone().multiplyScalar(3.2),0],[f.clone().multiplyScalar(-2.6).add(sd.clone().multiplyScalar(1.2)),1]].forEach(([o,i])=>{c.position.set(P.x+o.x,P.y+1.4,P.z+o.z);c.lookAt(P.x+f.x*.6,P.y+1.05,P.z+f.z*.6);rd.render(scene,c);x.drawImage(rd.domElement,i*420,0)});return cv.toDataURL('image/png')}""")
    import base64;open(play.TMP+'/v116_xbow.png','wb').write(base64.b64decode(url.split(',')[1]))
play.run(s)
print('FAILURES:',FAIL if FAIL else 'none')
