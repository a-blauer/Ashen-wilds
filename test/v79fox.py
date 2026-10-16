# v79: new low-poly fox — renders the Foxlet model in a clean studio scene (angles, variants, walk/attack poses)
import play,json,base64
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev("""()=>{
      const W=900,H=560,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W,H);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.75));
      const d=new THREE.DirectionalLight(0xfff0d8,1.3);d.position.set(3,5,4);d.castShadow=true;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(32,W/H,.05,50);const out={},errs=[];
      const mk=(v,tr,col)=>{const c=mkC('Foxlet',1,0,v||'');c.tr=tr||'';c.z=1;if(col!=null)c.cl=[col];return cr(c)};
      const shot=(name,objs,cp,lk,t,mv,atk)=>{objs.forEach(o=>{sc.add(o);o.atk=atk;o.rig&&o.rig(t,mv,mv?3:0)});cam.position.set(...cp);cam.lookAt(...lk);rd.render(sc,cam);out[name]=rd.domElement.toDataURL('image/png');objs.forEach(o=>sc.remove(o))};
      try{
        const f=mk();out.info={children:f.b.children.length,tris:f.b.children.reduce((a,m)=>a+(m.geometry&&m.geometry.index?m.geometry.index.count/3:0),0)};
        shot('side',[f],[2.2,.7,.2],[0,.4,-.1],1000,0);
        shot('front34',[f],[1.4,.8,1.6],[0,.42,0],1000,0);
        shot('back34',[f],[-1.5,.9,-1.6],[0,.42,-.2],1000,0);
        shot('face',[f],[.35,.7,1.3],[0,.55,.45],1000,0);
        shot('walk',[f],[2.0,.8,.6],[0,.4,-.1],1400,1);
        shot('attack',[f],[1.8,.8,1.2],[0,.45,.1],1000,0,1);
        const vs=[['',''],['Ember',''],['Frost','Horned'],['Shadow','Spiked'],['Golden','Armored'],['','',0xece6da]].map((a,i)=>{const o=mk(a[0],a[1],a[2]);o.position.set((i%3-1)*1.2,0,Math.floor(i/3)*-1.6);return o});
        const gd=mk('Golden','Universal');shot('golden',[gd],[1.3,1.1,1.3],[0,.5,.2],1000,0);shot('variants',vs,[0,2.6,3.2],[0,.3,-.8],1000,0);
      }catch(e){errs.push(String(e)+e.stack)}
      out.errs=errs;return out}""")
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):
            open(play.TMP+'/fox_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
        else: print(k,json.dumps(v)[:800])
play.run(s,w=1000,hh=620)
