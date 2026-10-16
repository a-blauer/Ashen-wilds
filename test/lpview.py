# Low-poly creature preview: renders companions in a studio scene.
#   SP="Ashwolf,Direfang,Skollmaw" AW_OUT=/path/build.html AW_TMP=/path/outdir python3 lpview.py
# Writes <AW_TMP>/lp_<first species>_{side,front,back,face,walk,attack,variants,ingame}.png and prints errors.
import play,json,base64,os
SP=os.environ.get('SP','Foxlet').split(',')
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""(SP)=>{
      const W=900,H=560,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W,H);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.75));
      const d=new THREE.DirectionalLight(0xfff0d8,1.3);d.position.set(3,5,4);d.castShadow=true;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(32,W/H,.05,50);const out={},errs=[],oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ')+(a[1]&&a[1].stack?a[1].stack:''));oe(...a)};
      const mk=(sp,v,tr,col)=>{const c=mkC(sp,1,0,v||'');c.tr=tr||'';c.z=1;if(col!=null)c.cl=[col];return cr(c)};
      const box=o=>{o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(o);return b};
      const shot=(name,objs,dir,t,mv,atk,fit)=>{objs.forEach(o=>{sc.add(o);o.atk=atk;o.rig&&o.rig(t,mv,mv?3:0)});
        const bb=new THREE.Box3();objs.forEach(o=>bb.union(box(o)));const ctr=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()).length()*(fit||1);
        cam.position.copy(ctr).add(new THREE.Vector3(...dir).normalize().multiplyScalar(sz*1.55));cam.lookAt(ctr);rd.render(sc,cam);out[name]=rd.domElement.toDataURL('image/png');objs.forEach(o=>sc.remove(o))};
      try{
        const f=mk(SP[0]);const lp=!!LPR[SP[0]&&rigOf(SP[0])];
        out.info={rig:rigOf(SP[0]),lowpoly:lp,meshes:f.b.children.length,tris:f.b.children.reduce((a,m)=>a+(m.geometry&&m.geometry.index?m.geometry.index.count/3:0),0),size:box(f).getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2))};
        shot('side',[f],[1,.15,0],1000,0);shot('front',[f],[.8,.35,1],1000,0);shot('back',[f],[-.8,.45,-1],1000,0);
        shot('face',[f],[.2,.15,1],1000,0,0,.55);shot('walk',[f],[1,.3,.3],1400,1);shot('attack',[f],[.9,.35,.7],1000,0,1);
        const vs=SP.map(s=>mk(s)).concat([mk(SP[0],'Ember'),mk(SP[0],'Frost','Horned'),mk(SP[0],'Shadow','Spiked'),mk(SP[0],'Golden','Armored'),mk(SP[0],'','Universal')]);
        const gap=Math.max(1.2,...vs.map(o=>{const s=box(o).getSize(new THREE.Vector3());return Math.max(s.x,s.z)*1.15}));
        vs.forEach((o,i)=>o.position.set((i%4-1.5)*gap,0,Math.floor(i/4)*-gap));shot('variants',vs,[0,.8,1],1000,0,0,.75);
        const rg=rigOf(SP[0]),keep=LPR[rg];delete LPR[rg];try{const old=mk(SP[0]);out.oldsize=box(old).getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2));const nw=mk(SP[0]);if(keep)LPR[rg]=keep;const nn=mk(SP[0]);old.position.x=-out.oldsize[0]*.8-.3;nn.position.x=out.oldsize[0]*.8+.3;shot('oldvsnew',[old,nn],[.3,.3,1],1000,0,0,.8)}finally{if(keep)LPR[rg]=keep}
      }catch(e){errs.push(String(e)+' '+e.stack)}
      console.error=oe;out.errs=errs;return out}""",SP)
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):open(play.TMP+'/lp_'+SP[0]+'_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
        else: print(k,json.dumps(v)[:1500])
    # in-game: the companion follows the hero in Duskhold
    ok=ev("(sp)=>{try{const c=mkC(sp,1,0,'');party.length=0;party.push(c);if(typeof refreshParty=='function')refreshParty();else if(typeof ui=='function')ui();return party.map(c=>c.g[0])}catch(e){return String(e)}}",SP[0])
    print('party',ok);pg.wait_for_timeout(2500)
    ev("()=>{camDist=5;camPitch=.35;typeof snapCam=='function'&&snapCam()}");pg.wait_for_timeout(2500)
    pg.screenshot(path=play.TMP+'/lp_'+SP[0]+'_ingame.png',timeout=120000,animations='disabled')
play.run(s,w=1000,hh=620)
