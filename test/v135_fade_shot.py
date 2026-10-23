# v135: a building between the camera and the hero in Duskhold fades (dithered) instead of pushing the camera -> out/v135_fade.png
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev("""()=>{const T=TOWNS[0],rc=new THREE.Raycaster(),V3=THREE.Vector3;let best=null;
      for(let z=T.cy-20;z<T.cy+30&&!best;z+=2)for(let x=T.cx-24;x<T.cx+24&&!best;x+=2){if(solid(x,z))continue;
        for(let a=0;a<8&&!best;a++){const yaw=a/8*Math.PI*2,y=GH(x,z),h=new V3(x,y+1.1,z),c=new V3(x+Math.sin(yaw)*Math.cos(.35)*8,y+1.1+Math.sin(.35)*8,z+Math.cos(yaw)*Math.cos(.35)*8);
          const dir=h.clone().sub(c),L=dir.length();rc.set(c,dir.normalize());rc.far=L-1.5;rc.camera=cam;let I=[];try{I=rc.intersectObjects(window.__M||(window.__M=(()=>{const M=[];scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh)M.push(o)});return M})()),false)}catch(e){I=[]};I=I.filter(q=>q.object.isMesh&&!q.object.isSkinnedMesh&&q.object.visible&&q.distance>1.5);
          const hit=I.find(q=>{const b=new THREE.Box3().setFromObject(q.object);return b.max.y-b.min.y>2.5&&q.point.y>y+1});
          if(hit)best={x,z,yaw,obj:hit.object.name||hit.object.type,pt:[hit.point.x,hit.point.y,hit.point.z].map(v=>+v.toFixed(1))}}}
      if(!best)return null;toPos(best.x,best.z,best.yaw);camPitch=.35;return best}""")
    print('spot',r)
    pg.wait_for_timeout(5000)
    pg.locator('#stage').screenshot(path=play.TMP+'/v135_fade.png')
    print(ev("""()=>{const rc=new THREE.Raycaster(),h=new THREE.Vector3(pl.position.x,pl.position.y+1.1,pl.position.z),d=h.clone().sub(cam.position);rc.set(cam.position.clone(),d.clone().normalize());rc.far=d.length()-1;
      const I=rc.intersectObjects(window.__M,false).slice(0,4);return I.map(q=>{const m=q.object.material,M=Array.isArray(m)?m[0]:m;return {n:q.object.name,t:M.type,tr:M.transparent,sk:!!M.skinning,done:F135.done.has(M),obc:M.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile,key:M.customProgramCacheKey&&M.customProgramCacheKey(),inScene:(()=>{let p=q.object;while(p.parent)p=p.parent;return p===scene})(),F:F135.t}})}"""))
    print(ev("()=>({camDist:+camDD.toFixed(2),pitch:+camK.toFixed(2),cam:[cam.position.x,cam.position.y,cam.position.z].map(v=>+v.toFixed(1))})"))
play.run(s,w=1000,hh=620)
