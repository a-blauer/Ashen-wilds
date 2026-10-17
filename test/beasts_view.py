# Enemy / boss / egg model preview in a studio scene.
#   K="goo,maggot,boss0" AW_TMP=/outdir [AW_OUT=build.html] python3 beasts_view.py
# For every key writes <AW_TMP>/bz_<key>_{front,side,attack,oldvsnew}.png (bossN = Sovereign N) and prints sizes + errors.
# K may also contain "eggs" (egg preview halves + world egg drops).
import play,json,base64,os
K=os.environ.get('K','goo,spitter,maggot,scorp,boss0,boss1,boss2,boss3,eggs').split(',')
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""(K)=>{
      const W=900,H=560,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(W,H);rd.shadowMap.enabled=true;
      const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.75));
      const d=new THREE.DirectionalLight(0xfff0d8,1.3);d.position.set(3,5,4);d.castShadow=true;sc.add(d);
      const gr=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
      const cam=new THREE.PerspectiveCamera(32,W/H,.05,200);const out={},errs=[],oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ')+(a[1]&&a[1].stack?a[1].stack:''));oe(...a)};
      const box=o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o)};
      const shot=(name,objs,dir,t,mv,atk,fit)=>{objs.forEach(o=>{sc.add(o);o.atk=atk;o.rig&&o.rig(t,mv,mv?3:0)});
        const bb=new THREE.Box3();objs.forEach(o=>bb.union(box(o)));const ctr=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()).length()*(fit||1);
        cam.position.copy(ctr).add(new THREE.Vector3(...dir).normalize().multiplyScalar(sz*1.55));cam.lookAt(ctr);rd.render(sc,cam);out[name]=rd.domElement.toDataURL('image/png');objs.forEach(o=>sc.remove(o))};
      const mk=key=>{if(key.startsWith('boss')){const n0=enemies.length,e=spawnBoss(+key.slice(4))||enemies[enemies.length-1];enemies.splice(enemies.indexOf(e),1);scene.remove(e.m);e.m.position.set(0,0,0);return e.m}
        const c=enemyC(key,20,{});const m=cr(c);m.scale.setScalar(m.bs);return m};
      for(const key of K){try{
        if(key=='eggs'){const L=[];for(let t=0;t<5;t++){const E=ceEggMesh({tier:t,sp:'Foxlet'});E.g.position.x=(t-2)*1.4;L.push(E.g)}
          const E2=ceEggMesh({tier:4,sp:'Foxlet'});E2.top.position.set(.4,.5,0);E2.top.rotation.z=-.6;E2.g.position.set(0,0,-1.6);L.push(E2.g);
          shot('eggs_preview',L,[0,.5,1],1000,0,0,.7);
          const n0=drops.length;for(let t=0;t<5;t++)drop('egg',{sp:'Foxlet',tier:t},new THREE.Vector3(0,0,0),t);
          const D=drops.splice(n0);D.forEach((q,i)=>{scene.remove(q.g);q.g.position.set((i-2)*.6,0,0)});shot('eggs_drop',D.map(q=>q.g),[0,.4,1],1000,0,0,.8);continue}
        const m=mk(key),rg=m.isHum?'hum':rigOf(EN[key]?EN[key].rig||key:key);
        out[key+'_info']={rig:rg,lp:!!(typeof LPR!='undefined'&&LPR[rg]),bs:+m.bs.toFixed(3),size:box(m.b).getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2)),meshes:m.b.children.length};
        shot(key+'_front',[m],[.8,.35,1],1000,0);shot(key+'_side',[m],[1,.2,0],1000,0);shot(key+'_attack',[m],[.9,.35,.7],1000,0,1);shot(key+'_walk',[m],[-.6,.5,-.9],1400,1);
        const keep=LPR[rg];if(keep){delete LPR[rg];try{const old=mk(key);out[key+'_oldsize']=box(old.b).getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2));LPR[rg]=keep;const nw=mk(key);
          const w=out[key+'_oldsize'][0];old.position.x=-w*.75-.2;nw.position.x=w*.75+.2;shot(key+'_oldvsnew',[old,nw],[.35,.3,1],1000,0,0,.8)}finally{LPR[rg]=keep}}
      }catch(e){errs.push(key+': '+e+' '+e.stack)}}
      console.error=oe;out.errs=errs;return out}""",K)
    for k,v in r.items():
        if isinstance(v,str) and v.startswith('data:image'):open(play.TMP+'/bz_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
        else: print(k,json.dumps(v)[:1500])
play.run(s,w=1000,hh=620)
