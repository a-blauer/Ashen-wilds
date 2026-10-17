# Studio render of every tree type, prop and camp shape.  AW_TMP=<dir> python3 nature_studio.py
import play,base64
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2000)
    r=ev("""()=>{const W_=1200,H_=560,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W_,H_);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));const d=new THREE.DirectionalLight(0xfff0d8,1.3);d.position.set(3,6,4);d.castShadow=true;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(30,W_/H_,.05,80),out={};
      const mat=(c,basic)=>basic?new THREE.MeshBasicMaterial({color:c,vertexColors:true}):new THREE.MeshStandardMaterial({color:c,vertexColors:true,flatShading:true,roughness:.95});
      let x=-6;Object.keys(TT).forEach(ty=>{const g=new THREE.Group();g.position.x=x;x+=2;TT[ty].forEach(pt=>{const m=new THREE.Mesh(pt[0],mat(pt[2],pt[6]));m.position.set(pt[7],pt[1],0);m.scale.set(pt[3],pt[4],pt[5]);m.castShadow=true;g.add(m)});sc.add(g)});
      x=-6;Object.keys(PK).forEach(k=>{const m=new THREE.Mesh(PK[k][0],mat(PK[k][1],k=='flower'||k=='mush'||k=='crystal'));m.position.set(x,({rock:.25,grave:.35,pillar:.8,bones:.1,bush:.25,mush:.15,crystal:.35,flower:.12,mound:0})[k],3);x+=1.5;m.castShadow=true;sc.add(m)});
      const tf=new THREE.Mesh(TUFT,new THREE.MeshStandardMaterial({vertexColors:true,color:0x5a8a3a,side:THREE.DoubleSide,flatShading:true}));tf.position.set(6.5,0,3);tf.scale.setScalar(1.6);sc.add(tf);
      [[CG.tent,0x6a4a2a,[6,.9,0],[1.25,1.8,1.25]],[CG.dod,0x7a7670,[6,.5,-2],[.8,.6,.8]]].forEach(([g,c,p,s])=>{const m=new THREE.Mesh(g,mat(c));m.position.set(...p);m.scale.set(...s);sc.add(m)});
      cam.position.set(0,4.5,13);cam.lookAt(0,1,1);rd.render(sc,cam);out.all=rd.domElement.toDataURL('image/png');
      cam.position.set(-3,2.2,6.5);cam.lookAt(-3,1.2,0);rd.render(sc,cam);out.trees=rd.domElement.toDataURL('image/png');
      cam.position.set(-1,1.6,6.5);cam.lookAt(-1,.3,3);rd.render(sc,cam);out.props=rd.domElement.toDataURL('image/png');
      return out}""")
    for k,v in r.items():open(play.TMP+'/ns_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
play.run(s,w=600,hh=400)
