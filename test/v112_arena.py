# v112: Sovereign den arenas — for all six dens: arriving in the Den instance puts you on the ground (player y = GH = the
# visible ground under you), the terrain under the hall is flat, the hall floor meshes sit on the walkable height
# (nothing floating above it or sunk under it), and standing in the arena you stand on the floor.
# Root cause found in v112: GHv clamped the row index with W (1180) instead of H (2030), so every spot south of row 1182
# (all of The Citadel: its fields, the Crimson Throne Hall and its trial) read the heights of row 1182 (mostly void, -51).
# Prints PASS/FAIL lines.
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{POST.render=()=>{};ren.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);try{CHEAT.god=true}catch(_){}}")
    fails=[]
    def T(name,js,check,arg=None):
        r=ev(js,arg);ok=check(r);print(('PASS ' if ok else 'FAIL ')+name,'=>',json.dumps(r)[:600])
        if not ok:fails.append(name)
        return r
    T('GH reads its own row',"()=>{let bad=0;for(let z=1190;z<H-4;z+=37)for(let x=4;x<W-4;x+=41){if(Math.abs(GHv(x,z)-HF[(z+HPD)*HW+x+HPD])>1e-6)bad++}return [bad,GH(ARN[5].cx,ARN[5].cz)]}",
      lambda r:r[0]==0 and r[1]>-1)
    ev("""()=>{const rc=new THREE.Raycaster(),dn=new THREE.Vector3(0,-1,0),o=new THREE.Vector3();
      window.HIT=(x,z,MS)=>{rc.set(o.set(x,80,z),dn);rc.far=200;const h=rc.intersectObjects(MS,false);return h.length?h[0].point.y:null};
      window.MESHES=(cx,cz,R)=>{const MS=[];scene.updateMatrixWorld();scene.traverseVisible(m=>{if(!m.isMesh||m.isSkinnedMesh||m.isInstancedMesh||!m.material||m.material.transparent||m.material.wireframe)return;
        let p=m,own=false;while(p){if(p===pl||(p.userData&&p.userData.isHero))own=true;p=p.parent}if(own)return;if(enemies.some(e=>{let q=m;while(q){if(q===e.m)return true;q=q.parent}return false}))return;
        const g=m.geometry;if(!g)return;if(!g.boundingSphere)g.computeBoundingSphere();const c=g.boundingSphere.center.clone().applyMatrix4(m.matrixWorld),r=g.boundingSphere.radius*m.matrixWorld.getMaxScaleOnAxis();
        if(Math.hypot(c.x-cx,c.z-cz)<R+r)MS.push(m)});return MS};
      return 1}""")
    for i in range(6):
        T('den %d arrive'%i,"""(i)=>{const I=PMAP[i].ins[3];insArrive(I);insMark&&insMark(I);rosterTick();chunkVis();return 1}""",lambda r:True,i)
        pg.wait_for_timeout(600)
        T('den %d on the ground at arrival'%i,"""(i)=>{chunkVis();const x=pl.position.x,z=pl.position.z,MS=MESHES(x,z,4),h=HIT(x,z,MS),g=GH(x,z);
            return [+pl.position.y.toFixed(3),+g.toFixed(3),h==null?null:+h.toFixed(3),curIns()&&curIns().den]}""",
          lambda r:r[3] and abs(r[0]-r[1])<.02 and r[2] is not None and abs(r[2]-r[1])<.3 and r[1]>-1,i)
        T('den %d terrain flat under the hall'%i,"""(i)=>{const A=ARN[i];let mn=1e9,mx=-1e9;for(let r=0;r<=ARENA_R+4;r+=1)for(let a=0;a<6.283;a+=.2){const g=GH(A.cx+Math.cos(a)*r,A.cz+Math.sin(a)*r);mn=Math.min(mn,g);mx=Math.max(mx,g)}
            return [+mn.toFixed(3),+mx.toFixed(3)]}""",lambda r:r[1]-r[0]<.15 and r[0]>-1,i)
        T('den %d floor meshes on the walkable height'%i,"""(i)=>{const A=ARN[i];toPos(A.cx,A.cz-ARENA_R+3);chunkVis();const MS=MESHES(A.cx,A.cz,ARENA_R+6);let n=0,ok=0,under=0,none=0;const bad=[];
            for(let r=0;r<=ARENA_R-1;r+=1.5)for(let a=0;a<6.283;a+=.3){const x=A.cx+Math.cos(a)*r,z=A.cz+Math.sin(a)*r,g=GH(x,z),h=HIT(x,z,MS);n++;
              if(h==null){none++;continue}const d=h-g;if(d<-.05){under++;bad.push([+r.toFixed(1),+a.toFixed(1),+g.toFixed(2),+h.toFixed(2)])}else if(d<.35)ok++}
            return [n,ok,under,none,+(ok/n).toFixed(3),bad.slice(0,6)]}""",lambda r:r[2]==0 and r[3]==0 and r[4]>=.8,i)
        pg.wait_for_timeout(400)
        T('den %d standing in the arena'%i,"""(i)=>{const A=ARN[i],x=pl.position.x,z=pl.position.z,MS=MESHES(x,z,3),h=HIT(x,z,MS);try{if(AF)arenaFail()}catch(_){}
            return [+pl.position.y.toFixed(3),+GH(x,z).toFixed(3),h==null?null:+h.toFixed(3)]}""",
          lambda r:abs(r[0]-r[1])<.02 and r[2] is not None and -.05<r[2]-r[0]<.35,i)
    print('FAILS',fails)
play.run(s,w=800,hh=500)
