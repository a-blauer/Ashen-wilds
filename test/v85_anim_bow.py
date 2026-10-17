# v85 bow / crossbow shot: renders the hero's shot at fixed points of the animation from three angles.
#   SRC=<build.html> AW_TMP=<outdir> TAG=after python3 v85_anim_bow.py
# Writes <AW_TMP>/v85_<TAG>_bow.png and v85_<TAG>_crossbow.png (rows: side, front 3/4, top; columns: progress k).
# Prints the pose per frame and, after the shot, that the action ended and the nocked arrow/string are hidden.
import play,json,base64,os
TAG=os.environ.get('TAG','after')
JS=r"""(wt)=>{
  window.requestAnimationFrame=()=>0;
  hero.cls='ranger';hero.lvl=12;const tp=ITPL.findIndex(t=>t.cls=='ranger'&&t.wt==wt);eq.weapon={id:uid++,tp,lv:12,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear();
  const FW=220,FH=220,K=[0,.1,.2,.33,.47,.53,.57,.65,.8,1],W=FW*K.length,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.9));const dl=new THREE.DirectionalLight(0xfff0d8,1.1);dl.position.set(2,5,4);sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  // target marker straight ahead of the hero (+z)
  const tg=new THREE.Mesh(new THREE.BoxGeometry(.1,1.2,.1),new THREE.MeshBasicMaterial({color:0xff4040}));tg.position.set(0,.6,3);sc.add(tg);
  const home=pl.parent,p0=pl.position.clone(),r0=pl.rotation.y;sc.add(pl);pl.position.set(0,0,0);pl.rotation.set(0,0,0);riding=null;
  const fx=()=>typeof BOW_FX!='undefined'&&BOW_FX?BOW_FX.g:null;
  const cams=[[3,1.1,0,0,.8,0],[1.6,1.5,2.2,0,.85,.3],[0,4,.01,0,.8,.4]],cam=new THREE.PerspectiveCamera(28,FW/FH,.05,50);
  const cnv=document.createElement('canvas');cnv.width=W;cnv.height=FH*3;const ctx=cnv.getContext('2d');
  let t=200000;const step=ms=>{for(let i=0;i<ms;i+=16){t+=16;animHero(t,false,pl)}};
  step(600);const ms=900;
  HA.cur=null;atkCd=0;bowAnim(ms);let kk=0;const log=[];
  K.forEach((k,i)=>{step(Math.max(0,(k-kk)*ms));kk=k;
    const f=fx();if(f&&f.parent!==sc&&f.parent)sc.add(f);
    log.push({k,arrow:!!(f&&f.visible),ex:+pl.bones.aR1.rotation.x.toFixed(2),sy:+pl.bones.spine.rotation.y.toFixed(2)});
    cams.forEach((c,j)=>{cam.position.set(c[0],c[1],c[2]);cam.lookAt(c[3],c[4],c[5]);pl.updateMatrixWorld(true);rd.render(sc,cam);ctx.drawImage(rd.domElement,i*FW,j*FH)});
    ctx.fillStyle='#fff';ctx.font='13px sans-serif';ctx.fillText('k='+k,i*FW+4,14)});
  step(400);const after={cur:!!HA.cur,arrow:!!(fx()&&fx().visible),sw:pl.sw};
  if(home)home.add(pl);pl.position.copy(p0);pl.rotation.y=r0;
  return {img:cnv.toDataURL('image/png'),log,after,tp}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    for wt in ['bow','crossbow']:
        r=ev(JS,wt)
        open(play.TMP+'/v85_'+TAG+'_'+wt+'.png','wb').write(base64.b64decode(r['img'].split(',')[1]))
        print(TAG,wt,json.dumps(r['log']),json.dumps(r['after']))
play.run(s,w=1000,hh=620)
