# v134: what object is at given screen points from a spot in an instance (ZONE K PT YAW), prints the hits and a screenshot out/v134_pick.png
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
Z=int(os.environ.get('ZONE','2'));K=int(os.environ.get('K','0'));PT=float(os.environ.get('PT','.125'));YAW=float(os.environ.get('YAW','.5'))
PTS=json.loads(os.environ.get('XY','[[0.55,0.32],[0.5,0.25],[0.95,0.3],[0.15,0.25]]'))
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(f"()=>{{hero.lvl=30;window.__I=PMAP[{Z}].ins[{K}];insArrive(__I)}}");pg.wait_for_timeout(2500)
    ev(f"()=>{{const P=__I.path,q=P[Math.floor((P.length-1)*{PT})];toPos(q[0],q[1],{YAW}*Math.PI*2);camPitch=.12;TOD=.3}}");pg.wait_for_timeout(2500)
    pg.locator('#stage').screenshot(path=play.TMP+'/v134_pick.png')
    r=ev("""(pts)=>{const rc=new THREE.Raycaster();rc.camera=cam;const M=[];scene.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&!o.isSkinnedMesh&&o.visible)M.push(o)});
      return pts.map(([x,y])=>{rc.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),cam);rc.far=600;let I=[];try{I=rc.intersectObjects(M,false)}catch(e){return String(e)}
        return I.slice(0,3).map(h=>{const o=h.object,m=Array.isArray(o.material)?o.material[0]:o.material,b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());const P=[];for(let p=o;p&&p!==scene;p=p.parent)P.push((p.name||p.type)+'['+Object.keys(p.userData).slice(0,5).join(',')+']');
          return {pt:[h.point.x,h.point.y,h.point.z].map(v=>+v.toFixed(1)),ins:(()=>{const J=insAt(Math.round(h.point.x),Math.round(h.point.z));return J?J.n:"-"})(),cur:curIns().n,d:+h.distance.toFixed(1),geo:o.geometry.type,v:o.geometry.attributes.position.count,mat:m.type,col:m.color?m.color.getHexString():'',fog:m.fog,sz:[sz.x,sz.y,sz.z].map(v=>+v.toFixed(1)),path:P.slice(0,4).join(' < '),inst:o.isInstancedMesh?o.count:0}})})}""",PTS)
    for p,h in zip(PTS,r):print(p,json.dumps(h)[:900])
play.run(s,w=900,hh=550)
