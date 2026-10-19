# v100 evolve: species-specific evolution ornaments for every companion rig.
#   python3 v100_evolve.py                         -> this build (TAG=after): checks + sheets
#   SRC=<old.html> TAG=before python3 v100_evolve.py -> the same sheets from another build (no checks)
#   SP=Foxlet,Ashwolf,...  (default: every hatchable species)   PART=sheets,checks,game (default all)
# Sheets: <AW_TMP>/v100_<TAG>_<species>.jpg
#   row 1: side view, evolution stage 0..3 (+ the Shadow / shiny look at stage 3)
#   row 2: 3/4 front view, stage 0..3 (+ Golden / rare)
#   row 3: head close-up stage 0..3, then stage 3 walking and attacking (parts must follow the bones)
# Drift: for every sampled evolution vertex that touches the body at rest (< .05), how much further from the body
#   surface it gets while walking / attacking (model units) — attached parts must stay attached.
# Game: <AW_TMP>/v100_<TAG>_portraits.png (HUD head portraits, stage 0..3 per rig), v100_<TAG>_window.png (Companions window)
import play,json,base64,os
# the machine may be shared with other headless runs: allow a slow first load
from playwright.sync_api import Page as _Pg
_go=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,int(os.environ.get('GOTO_MS','600000')));return _go(self,url,**k)
_Pg.goto=_goto
_cl=_Pg.click
def _click(self,sel,**k):
    k['timeout']=max(k.get('timeout') or 0,240000);return _cl(self,sel,**k)
_Pg.click=_click
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','sheets,checks,game').split(',')
BASE='Foxlet,Ashwolf,Drakelet,Stoneshell,Mossfrog,Boneling,Batwing,Skyhawk,Cryptspider,Gloomcap,Wispling,Gravewyrm'
TOPS='Emberlynx,Direfang,Skollmaw,Cragback,Titanshell,Bogmaw,Lichbone,Duskwing,Stormtalon,Rocsovereign,Pyrewing,Elderdrake,Venomcoil,Widowqueen,Hivemother,Sporelord,Lumenwisp,Soulwarden'
SP=os.environ.get('SP',BASE+','+TOPS).split(',')
SHEET=r"""(SP)=>{
  window.requestAnimationFrame=()=>0;
  const FW=300,FH=250,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);rd.shadowMap.enabled=false;
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x343a42);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.25);dl.position.set(3,5,4);sc.add(dl);const rim=new THREE.DirectionalLight(0x8ab0ff,.45);rim.position.set(-3,2,-3);sc.add(rim);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshLambertMaterial({color:0x3e4a32}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,100);const out={},info={};
  const lbl=(c,t,x,y)=>{c.fillStyle='rgba(0,0,0,.45)';c.fillRect(x,y,FW,17);c.fillStyle='#e8e0c8';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
  const mkc=(sp,e,v,o)=>{const c=mkC(sp,30,0,v||'');c.tr='';c.z=1;c.evo=e;Object.assign(c,o||{});if(c.rv&&RVAR[c.rv])c.cl=[RVAR[c.rv]];return c};
  for(const sp of SP){
    try{
      const cnv=document.createElement('canvas');cnv.width=FW*6;cnv.height=FH*3;const ctx=cnv.getContext('2d');
      const ms=[0,1,2,3].map(e=>cr(mkc(sp,e)));
      ms.forEach(m=>{m.rig&&m.rig(1000,false,0);m.updateMatrixWorld(true)});
      const bb=new THREE.Box3().setFromObject(ms[3]),sz=bb.getSize(new THREE.Vector3()),ctr=bb.getCenter(new THREE.Vector3());
      const H=Math.max(sz.y,sz.x*.75,sz.z*.75,.5);
      let hd=new THREE.Vector3();const hb=ms[3].getObjectByName('head');if(hb)hb.getWorldPosition(hd);else hd.copy(ctr);
      const view=(m,kind,col,row,label)=>{sc.add(m);m.updateMatrixWorld(true);
        if(kind=='side'){const d=H*2.35;cam.position.set(ctr.x+d,ctr.y+H*.15,ctr.z+d*.06);cam.lookAt(ctr)}
        else if(kind=='q'){const d=H*2.3;cam.position.set(ctr.x+d*.62,ctr.y+H*.55,ctr.z+d*.8);cam.lookAt(ctr)}
        else{const r=Math.max(.2,H*.24),d=r/Math.tan(15*Math.PI/180);cam.position.set(hd.x+d*.62,hd.y+d*.3,hd.z+d*.72);cam.lookAt(hd.x,hd.y-r*.1,hd.z-r*.35)}
        rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);sc.remove(m);if(label)lbl(ctx,label,col*FW,row*FH)};
      ms.forEach((m,e)=>{view(m,'side',e,0,(e?'':sp+' ')+'stage '+e);view(m,'q',e,1,'');view(m,'face',e,2,'')});
      const sh=cr(mkc(sp,3,'Shadow')),sy=cr(mkc(sp,3,'',{shn:1})),go=cr(mkc(sp,3,'Golden')),rv=cr(mkc(sp,3,'',{rv:'Crimson'}));
      [sh,sy,go,rv].forEach(m=>{m.rig&&m.rig(1000,false,0)});
      view(sh,'side',4,0,'3 Shadow');view(sy,'side',5,0,'3 shiny');view(go,'q',4,1,'3 Golden');view(rv,'q',5,1,'3 rare Crimson');
      const w=ms[3];w.rig&&w.rig(1430,true,3);view(w,'q',4,2,'3 walking');
      w.atk=1;w.rig&&w.rig(1700,false,0);view(w,'q',5,2,'3 attack');w.atk=0;
      out[sp]=cnv.toDataURL('image/jpeg',.88);
    }catch(e){info[sp]={err:String(e)+' '+(e.stack||'').slice(0,400)}}
  }
  return {out,info}}"""
CHECK=r"""(SP)=>{
  const errs=[],oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,300));oe(...a)};
  const R={sp:{},errs};const V=new THREE.Vector3(),W=new THREE.Vector3();
  const mkc=(sp,e,o)=>{const c=mkC(sp,30,0,'');c.tr='';c.z=1;c.evo=e;Object.assign(c,o||{});return c};
  // every mesh of the model: draw calls, triangles of the evolution parts, binding
  function meshes(g){const L=[];g.traverse(o=>{if(o.isMesh&&o.visible)L.push(o)});return L}
  function skinned(m,i,out){V.fromBufferAttribute(m.geometry.attributes.position,i);m.boneTransform(i,V);return V.applyMatrix4(m.matrixWorld)}
  for(const sp of SP){const r={tris:[],calls:[],evoCalls:[],bad:[]};
    try{for(let e=0;e<4;e++){
      const g=cr(mkc(sp,e));g.rig&&g.rig(1000,false,0);g.updateMatrixWorld(true);
      const L=meshes(g),body=L.find(m=>m.isSkinnedMesh&&m.parent===g.b&&m.skeleton),ev=L.filter(m=>m.userData.evo100);
      r.calls.push(L.length);r.evoCalls.push(ev.length);
      let t=0;ev.forEach(m=>{const G=m.geometry;t+=(G.index?G.index.count:G.attributes.position.count)/3;
        const P=G.attributes.position.array;for(let i=0;i<P.length;i++)if(!isFinite(P[i])){r.bad.push('NaN '+e);break}
        if(m.isSkinnedMesh){if(m.skeleton!==body.skeleton)r.bad.push('skeleton '+e);const SI=G.attributes.skinIndex,SW=G.attributes.skinWeight;
          for(let i=0;i<SI.count;i++){if(SI.getX(i)>=body.skeleton.bones.length||Math.abs(SW.getX(i)+SW.getY(i)+SW.getZ(i)+SW.getW(i)-1)>1e-3){r.bad.push('skin '+e);break}}}
        else{let p=m.parent,ok=false;while(p&&p!==g){if(p.isBone){ok=true;break}p=p.parent}if(!ok)r.bad.push('unparented '+e)}});
      r.tris.push(t);
      // follow test: distance from evolution vertices to the nearest body vertex, at rest vs walking vs attacking
      if(e==3&&ev.length){const BP=[],samp=[];const bg=body.geometry.attributes.position;
        const pose=(mv,atk,tt)=>{g.atk=atk;g.rig&&g.rig(tt,mv,mv?3:0);g.updateMatrixWorld(true);body.skeleton.update();ev.forEach(m=>m.skeleton&&m.skeleton.update());
          const bp=[];for(let i=0;i<bg.count;i+=2){const q=skinned(body,i);bp.push(q.x,q.y,q.z)}
          const d=[];ev.forEach(m=>{const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i+=11){let q;if(m.isSkinnedMesh)q=skinned(m,i);else{q=V.fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld)}
            let b=1e9;for(let j=0;j<bp.length;j+=3){const dd=(bp[j]-q.x)**2+(bp[j+1]-q.y)**2+(bp[j+2]-q.z)**2;if(dd<b)b=dd}d.push(Math.sqrt(b))}});return d};
        // reset bones to rest
        const B=body.skeleton.bones,keep=B.map(b=>b.rotation.clone());B.forEach(b=>b.rotation.set(0,0,0));g.b.position.set(0,0,0);g.updateMatrixWorld(true);
        const d0=(()=>{body.skeleton.update();const bp=[];for(let i=0;i<bg.count;i+=2){const q=skinned(body,i);bp.push(q.x,q.y,q.z)}const d=[];ev.forEach(m=>{const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i+=11){let q;if(m.isSkinnedMesh)q=skinned(m,i);else q=V.fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld);let b=1e9;for(let j=0;j<bp.length;j+=3){const dd=(bp[j]-q.x)**2+(bp[j+1]-q.y)**2+(bp[j+2]-q.z)**2;if(dd<b)b=dd}d.push(Math.sqrt(b))}});return d})();
        const dw=pose(true,0,1430),da=pose(false,1,1700);let mw=0,ma=0,na=0;for(let i=0;i<d0.length;i++){if(d0[i]/g.bs>.05)continue;na++;mw=Math.max(mw,(dw[i]-d0[i])/g.bs);ma=Math.max(ma,(da[i]-d0[i])/g.bs)}
        r.drift={walk:+mw.toFixed(3),atk:+ma.toFixed(3),n:na,all:d0.length};g.atk=0}
    }
    // variants, shiny, rare, traits, fused, wild elite all build
    [{v:'Ember'},{v:'Frost'},{v:'Shadow'},{v:'Golden'},{shn:1},{rv:'Azure'},{tr:'Armored'},{tr:'Horned'},{tr:'Spiked'},{tr:'Universal'},{tr:'Bulky'}].forEach(o=>{const c=mkc(sp,3,o);if(o.v){const q=mkC(sp,30,0,o.v);c.cl=q.cl}cr(c)});
    const f=mkc(sp,2);const o2=SPK.find(k=>famOf(k)==famOf(sp)&&rigOf(k)!=rigOf(sp));if(o2){f.g=[sp,o2];f.cl=[f.cl[0],SP2[o2][4]];const g=cr(f);r.fuse=meshes(g).length}
    }catch(e){r.err=String(e)+' '+(e.stack||'').slice(0,300)}
    R.sp[sp]=r}
  // wild monsters that use the companion rigs (normal + elite)
  R.wild={};Object.keys(EN).forEach(k=>{const E=EN[k];if(!E.rig||!LPR[E.rig]||!/^(Foxlet|Ashwolf|Drakelet|Stoneshell|Mossfrog|Boneling|Batwing|Skyhawk|Cryptspider|Gloomcap|Wispling|Gravewyrm)$/.test(E.rig))return;
    try{const a=cr(enemyC(k,10,{})),b=cr(enemyC(k,10,{al:1}));let ta=0,tb=0;a.traverse(o=>{if(o.userData.evo100)ta++});b.traverse(o=>{if(o.userData.evo100)tb++});R.wild[k]=[ta,tb]}catch(e){R.wild[k]=String(e)}});
  console.error=oe;return R}"""
GAME=r"""()=>{
  // HUD portraits: one row per rig base species, stage 0..3
  const S=['Foxlet','Ashwolf','Drakelet','Stoneshell','Mossfrog','Boneling','Batwing','Skyhawk','Cryptspider','Gloomcap','Wispling','Gravewyrm'];
  const cnv=document.createElement('canvas'),T=112;cnv.width=T*8;cnv.height=T*6;const ctx=cnv.getContext('2d');ctx.fillStyle='#1a1612';ctx.fillRect(0,0,cnv.width,cnv.height);
  const imgs=[];S.forEach((sp,i)=>[0,1,2,3].forEach(e=>{const c=mkC(sp,30,0,'');c.tr='';c.evo=e;const u=cpicMake(c);imgs.push([u,(i%2)*4+e,Math.floor(i/2)])}));
  return {imgs,W:cnv.width,H:cnv.height,T}}"""
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ok=True
    def chk(n,c,info=''):
        nonlocal ok;ok=ok and bool(c);print(('PASS ' if c else 'FAIL ')+n,info)
    if 'checks' in PART and TAG=='after':
        r=ev(CHECK,SP)
        for sp,v in r['sp'].items():
            print(sp,json.dumps(v))
            if 'err' in v:chk(sp+' builds',False,v['err']);continue
            chk(sp+' evolution parts grow with every stage',all(v['tris'][i]<v['tris'][i+1] for i in range(3)),v['tris'])
            chk(sp+' parts skinned/parented to bones, no NaN',not v['bad'],v['bad'][:3])
            chk(sp+' draw calls per companion <= 14',max(v['calls'])<=14,v['calls'])
            chk(sp+' parts follow the bones (walk/attack drift < 0.06)',v.get('drift') and v['drift']['walk']<.06 and v['drift']['atk']<.06,v.get('drift'))
        print('wild',json.dumps(r['wild']))
        chk('wild elites get evolution parts, normal wild ones none',all(isinstance(x,list) and x[0]==0 and x[1]>0 for x in r['wild'].values()),r['wild'])
        chk('no console errors while building',not r['errs'],r['errs'][:3])
    if 'game' in PART:
        r=ev(GAME)
        js="""(r)=>new Promise(res=>{const c=document.createElement('canvas');c.width=r.W;c.height=r.H;const x=c.getContext('2d');x.fillStyle='#1a1612';x.fillRect(0,0,r.W,r.H);let n=0;
          r.imgs.forEach(q=>{if(!q[0]){n++;return}const im=new Image();im.onload=()=>{x.drawImage(im,q[1]*r.T,q[2]*r.T);if(++n==r.imgs.length)res(c.toDataURL('image/png'))};im.src=q[0]});if(!r.imgs.length)res(c.toDataURL())})"""
        u=ev(js,r);open(play.TMP+'/v100_'+TAG+'_portraits.png','wb').write(base64.b64decode(u.split(',')[1]))
        # companions window with an evolved companion, and the HUD bars
        ev("""()=>{party.length=0;['Ashwolf','Drakelet'].forEach((s,i)=>{const c=mkC(s,40,0,'');c.evo=3-i;c.tr='';party.push(c)});try{refreshParty&&refreshParty()}catch(_){};ui();$('cmpBtn').click();return 1}""")
        pg.wait_for_timeout(3500)
        # draw the preview once more by hand in case the page's animation loop is throttled
        ev("()=>{if(window.PV&&PV.r&&PV.obj){for(let i=0;i<3;i++){PV.upd&&PV.upd(1200+i*16,16);PV.r.render(PV.sc,PV.cam)}}return 1}")
        pg.screenshot(path=play.TMP+'/v100_'+TAG+'_window.png',timeout=120000)
    if 'sheets' in PART:
        for i in range(0,len(SP),4):
            r=ev(SHEET,SP[i:i+4])
            for k,v in r['out'].items():open(play.TMP+'/v100_'+TAG+'_'+k+'.jpg','wb').write(base64.b64decode(v.split(',')[1]))
            for k,v in r['info'].items():print('SHEET',k,v);chk(k+' sheet',False,v)
    print(TAG,'PAGEERRORS',len(errs),errs[:5])
    if TAG=='after':chk('no page errors',not errs,errs[:3]);print('CHECKS OK' if ok else 'FAIL some checks')
play.run(s,w=1100,hh=700)
