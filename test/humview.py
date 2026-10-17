# Humans preview: heroes (5 classes, bare + geared), every humanoid enemy, town NPCs, face close-up.
#   AW_OUT=build.html AW_TMP=outdir python3 humview.py   -> hum_{heroes,face,foes,npcs,ingame}.png
import play,json,base64,os
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""()=>{
      const W=1100,H=620,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W,H);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.75));
      const d=new THREE.DirectionalLight(0xfff0d8,1.3);d.position.set(3,5,4);d.castShadow=true;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(30,W/H,.05,80);const out={},errs=[],oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' '));oe(...a)};
      const box=o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o)};
      const shot=(name,objs,dir,fit,t)=>{objs.forEach(o=>{sc.add(o);o.rig&&o.rig(t||1000,false,0)});
        const bb=new THREE.Box3();objs.forEach(o=>bb.union(box(o)));const ctr=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()).length()*(fit||1);
        cam.position.copy(ctr).add(new THREE.Vector3(...dir).normalize().multiplyScalar(sz*1.45));cam.lookAt(ctr);rd.render(sc,cam);out[name]=rd.domElement.toDataURL('image/png');objs.forEach(o=>sc.remove(o))};
      const row=(L,gap)=>L.forEach((o,i)=>o.position.set((i%6-2.5)*gap,0,-Math.floor(i/6)*gap*1.4));
      try{
        const cls=['warrior','paladin','assassin','ranger','mage'],it=r=>({r,tp:1,lv:10});
        const H=[];cls.forEach(c=>{const h=buildHero();refreshGear(h,c,{});H.push(h)});cls.forEach(c=>{const h=buildHero();refreshGear(h,c,{chest:it(3),helm:it(2),boots:it(3)});H.push(h)});
        H.forEach((h,i)=>{animHero(1000,false,h);h.position.set((i%5-2)*.85,0,-Math.floor(i/5)*1.1)});
        out.info={heroTris:H[0].children.concat(...H[0].children.map(c=>c.children)).reduce((a,m)=>a+(m.geometry&&m.geometry.index?m.geometry.index.count/3:0),0)};
        shot('heroes',H,[0,.35,1],.62);
        const h1=buildHero();refreshGear(h1,'warrior',{});animHero(1000,false,h1);
        const h2=buildHero();refreshGear(h2,'ranger',{});animHero(1000,false,h2);h2.position.x=.55;h1.position.x=-.05;
        h1.rotation.y=.25;h2.rotation.y=-.3;shot('face',[h1,h2],[.1,.12,1],.5);
        const h3=buildHero();refreshGear(h3,'mage',{chest:it(3)});animHero(1300,true,h3);h3.rotation.y=Math.PI*.8;shot('back',[h3],[.4,.25,1],.8);
        const F=Object.keys(HUMLOOK).map(k=>{try{const g=mkHumanoid(k);g.userData.k=k;return g}catch(e){errs.push(k+' '+e);return null}}).filter(Boolean);
        row(F,1.3);out.foes=F.map(g=>g.userData.k);shot('foes',F,[0,.4,1],.62);
        T_cur={col:[],cx:0,cy:0,g:null};const P=new THREE.Group();
        const NO=[{robe:0x3a2a4a,trim:0xc8a24a,hat:'wiz',hatC:0x241a36,label:'Mage'},{robe:0x5a3a2a,trim:0x2a1a10,hat:'cap',hatC:0x6a4a1a,label:'Stable Master'},{robe:0xf2efe6,trim:0x8a6a3a,hat:'chef',label:'Cook',apron:1},{robe:0x2a3550,trim:0xd8b44a,hat:'cap',hatC:0x1a2236,label:'Steward'},{robe:0x4a5a3a,label:'Villager'}];
        NO.forEach((o,i)=>npc(P,(i-2)*1.2,0,Object.assign({ry:0},o)));shot('npcs',[P],[0,.3,1],.75);
      }catch(e){errs.push(String(e)+' '+e.stack)}
      console.error=oe;out.errs=errs;return out}""")
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):open(play.TMP+'/hum_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
        else: print(k,json.dumps(v)[:1500])
    ev("()=>{camDist=4;camPitch=.3;typeof snapCam=='function'&&snapCam()}");pg.wait_for_timeout(3000)
    pg.screenshot(path=play.TMP+'/hum_ingame.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
