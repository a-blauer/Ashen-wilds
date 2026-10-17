# Studio renders of equipment, items and mounts.
#   AW_OUT=/path/build.html AW_TMP=/outdir [TAG=after] [INGAME=1] python3 gear_view.py
# Writes <AW_TMP>/gear_<TAG>_{weapons,weapons_epic,weapons_close,mounts,mounts_side,items}.png (+ ingame) and prints errors.
import play,json,base64,os
TAG=os.environ.get('TAG','x')
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""()=>{
      const W=1100,H=620,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W,H);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
      const d=new THREE.DirectionalLight(0xfff0d8,1.4);d.position.set(3,6,5);d.castShadow=true;d.shadow.bias=-.0006;d.shadow.normalBias=.04;d.shadow.mapSize.set(2048,2048);d.shadow.camera.left=-8;d.shadow.camera.right=8;d.shadow.camera.top=8;d.shadow.camera.bottom=-8;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(30,W/H,.05,80);const out={},errs=[],oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' '));oe(...a)};
      const box=o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o)};
      const shot=(name,objs,dir,fit)=>{objs.forEach(o=>sc.add(o));if(typeof lpsObj=='function')objs.forEach(lpsObj);
        const bb=new THREE.Box3();objs.forEach(o=>bb.union(box(o)));const ctr=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()).length()*(fit||1);
        cam.position.copy(ctr).add(new THREE.Vector3(...dir).normalize().multiplyScalar(sz*1.45));cam.lookAt(ctr);rd.render(sc,cam);out[name]=rd.domElement.toDataURL('image/png');objs.forEach(o=>sc.remove(o))};
      const tris=o=>{let n=0;o.traverse(m=>{if(m.isMesh&&m.geometry){const g=m.geometry;n+=(g.index?g.index.count:g.attributes.position.count)/3}});return n};
      try{
        const WT=['sword','gs','ga','axe','axes','mace','club','hammer','dagger','knives','claws','halberd','flail','staff','wand','orb','bow','crossbow','sling','shield'];
        const lay=(col,r)=>WT.map((t,i)=>{const g=new THREE.Group(),w=mkWpn(t,col,r);g.add(w);
          // stand each weapon up, grip at the top like it hangs on a rack
          w.rotation.set(0,0,0);if(t=='bow'||t=='crossbow')w.rotation.y=Math.PI/2;g.position.set((i%10-4.5)*.75,(i<10?2.9:1.45),0);out['tri_'+t]=tris(w);return g});
        shot('weapons',lay(0x9aa2ae,0),[0,0,1],.7);
        shot('weapons_epic',lay(0xb06aff,4),[0,0,1],.7);
        const cl=['gs','ga','hammer','shield','bow','staff'].map((t,i)=>{const g=new THREE.Group(),w=mkWpn(t,i%2?0xffa040:0x9aa2ae,i%2?3:1);g.add(w);if(t=='bow')w.rotation.y=Math.PI/2;g.position.set((i-2.5)*.8,1.4,0);g.rotation.y=.5;return g});
        shot('weapons_close',cl,[.35,.25,1],.62);
        const MK=Object.keys(MOUNTS);const ms=MK.map((k,i)=>{const m=mountModel(k);m.position.set((i%5-2)*2.4,0,Math.floor(i/5)*-2.6);m.rotation.y=-.6;if(m.r&&m.r.rig)m.r.rig(1300,false,0);out['tri_m_'+k]=tris(m);return m});
        shot('mounts',ms,[.25,.55,1],.72);
        const ms2=MK.slice(0,5).map((k,i)=>{const m=mountModel(k);m.position.set((i-2)*2.2,0,0);m.rotation.y=Math.PI/2;if(m.r&&m.r.rig)m.r.rig(1500,true,3);return m});
        shot('mounts_side',ms2,[0,.3,1],.8);
        const ms3=MK.slice(5).map((k,i)=>{const m=mountModel(k);m.position.set((i-2)*2.2,0,0);m.rotation.y=Math.PI/2;if(m.r&&m.r.rig)m.r.rig(1500,true,3);return m});
        shot('mounts_side2',ms3,[0,.3,1],.8);
        const mc=['pony','charger','direwolf'].map((k,i)=>{const m=mountModel(k);m.position.set((i-1)*2.1,0,0);m.rotation.y=-.9;if(m.r&&m.r.rig)m.r.rig(1300,false,0);return m});
        shot('mounts_close',mc,[.5,.35,1],.62);
        const mc2=['stag','ram','drake'].map((k,i)=>{const m=mountModel(k);m.position.set((i-1)*2.1,0,0);m.rotation.y=-.9;if(m.r&&m.r.rig)m.r.rig(1300,false,0);return m});
        shot('mounts_close2',mc2,[.5,.35,1],.62);
        // items: chests, drops, projectiles
        const items=[];const c0=makeChest(0,0,'x',()=>{});CHESTS.splice(CHESTS.indexOf(c0),1);scene.remove(c0.g);c0.g.position.set(-2.4,0,0);items.push(c0.g);
        const before=drops.length;const P=new THREE.Vector3(0,0,0);[['gear',{nm:'x'},3],['egg',null,2],['mat',{k:'bone',n:1},1],['potion',null,1],['item',{k:'x',n:1},2],['sup',{k:'x',n:1},2]].forEach(q=>{try{drop(q[0],q[1],P,q[2])}catch(e){errs.push('drop '+q[0]+' '+e)}});
        drops.slice(before).forEach((d,i)=>{scene.remove(d.g);d.g.position.set(-.9+i*.75,0,.8);items.push(d.g)});drops.length=before;
        [[0xff7a2a,0],[0x9ad8ff,0],[0xd8c8a0,1],[0xc8b080,1]].forEach((q,i)=>{const m=shotMesh(q[0],q[1]);m.position.set(1.6+i*.5,1,.4);m.rotation.y=Math.PI/2;items.push(m)});
        shot('items',items,[0,.6,1],.75);
      }catch(e){errs.push(String(e)+' '+e.stack)}
      console.error=oe;out.errs=errs;return out}""")
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):open(play.TMP+'/gear_'+TAG+'_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
    print('tris',json.dumps({k:v for k,v in r.items() if k.startswith('tri_')}))
    print('errs',json.dumps(r.get('errs')))
    if os.environ.get('INGAME'):
        ev("()=>{hero.lvl=30;mounts.length=0;mounts.push({id:1,k:'charger',n:'x',spd:20});mActive=1;camDist=4.5;camPitch=.3;snapCam()}")
        pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/gear_'+TAG+'_ingame.png',timeout=120000,animations='disabled')
        ev("()=>{toggleMount();camYaw=pl.rotation.y+1.9;camDist=4.2;camPitch=.22;snapCam()}");pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/gear_'+TAG+'_ride.png',timeout=120000,animations='disabled')
        ev("()=>{toggleMount();const p=pl.position.clone();p.z-=2.5;['gear','egg','potion','mat'].forEach((k,i)=>drop(k,k=='gear'?genItem(20,{cls:'warrior',minR:3}):k=='egg'?rollEgg(3):k=='mat'?{k:'bone',n:1}:null,p,3));makeChest(p.x+2.5,p.z-1,'Test',()=>{});camYaw=pl.rotation.y+Math.PI;camDist=5.5;camPitch=.45;snapCam()}")
        pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/gear_'+TAG+'_loot.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
