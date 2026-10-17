# v85 hero attack animations: every weapon's basic attack / combo and a few class skills, as frame strips.
#   SRC=<build.html> AW_TMP=<outdir> TAG=after [WT=dagger,claws,...] python3 v85_atk_hero.py
# Uses the real swing() path (combo steps, durations, hit callbacks); time is stepped by hand, so the hit frame is exact.
# Writes <AW_TMP>/v85atk_<TAG>_<weapon>.png: one row per combo step, columns = progress through the action
# and a top view below it (target = red post, straight ahead = toward the top). The column where the hit fired is outlined red. Prints per step: duration (ms) and the progress at which the hit fired.
import play,json,base64,os
TAG=os.environ.get('TAG','after')
WTS=os.environ.get('WT','assassin:dagger,assassin:claws,assassin:knives,warrior:gs,warrior:ga,warrior:axes,warrior:halberd,paladin:mace,paladin:hammer,paladin:flail,mage:staff,mage:wand,mage:orb,ranger:sling,skills:skills').split(',')
JS=r"""([cls,wt])=>{
  window.requestAnimationFrame=()=>0;
  const FW=180,FH=200,K=[0,.12,.24,.32,.38,.42,.48,.58,.72,1],rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.9));const dl=new THREE.DirectionalLight(0xfff0d8,1.1);dl.position.set(2,5,4);sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const tg=new THREE.Mesh(new THREE.BoxGeometry(.1,1.2,.1),new THREE.MeshBasicMaterial({color:0xff4040}));tg.position.set(0,.6,2.5);sc.add(tg);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,50),cam2=new THREE.PerspectiveCamera(30,FW/FH,.05,50);cam.position.set(2.3,1.5,2.4);cam.lookAt(0,.75,.2);cam2.position.set(0,4.6,.35);cam2.up.set(0,0,1);cam2.lookAt(0,.8,.35);
  let rows=[];
  if(cls=='skills'){hero.cls='mage';rows=[['castAnim (bolt)',()=>{ATKSK({k:'bolt'});castAnim()}],['castAnim (nova)',()=>{ATKSK({k:'nova'});castAnim()}],['castAnim (leap)',()=>{ATKSK({k:'leap'});castAnim()}],
    ['castAnim (rain)',()=>{ATKSK({k:'rain'});castAnim()}],['buff flex',()=>{if(typeof ATK!='undefined')haPlay(420,ATK.flex,2,null,.15);else castAnim()}],['dodge',()=>haDodge()],['drink',()=>{if(typeof ATK!='undefined')haPlay(520,ATK.drink,2,null,.15)}]]}
  else{hero.cls=cls;hero.lvl=25;const tp=ITPL.findIndex(t=>t.cls==cls&&t.wt==wt);eq.weapon={id:uid++,tp,lv:25,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear();
    const N=(typeof MW!='undefined'&&MW[wt])?MW[wt].N:(wt=='dagger'?4:wt=='gs'||wt=='staff'?3:1);for(let i=0;i<N;i++)rows.push(['step '+(i+1),()=>{comboT=performance.now();atkCd=0;HA.cur=null;HA.buf=0;pl.step=null;swing()}])}
  window.ATKSK=s=>{if(typeof ATK_SK!='undefined')ATK_SK=s};
  const home=pl.parent,p0=pl.position.clone(),r0=pl.rotation.y;sc.add(pl);pl.position.set(0,0,0);pl.rotation.set(0,0,0);riding=null;
  // keep enemies out of the way so hits do nothing odd
  const cnv=document.createElement('canvas');cnv.width=FW*K.length;cnv.height=FH*rows.length*2;const ctx=cnv.getContext('2d');
  let t=300000;const step=ms=>{for(let i=0;i<ms;i+=8){t+=Math.min(8,ms-i);animHero(t,false,pl)}};
  step(500);const info=[];combo=0;comboT=performance.now();
  rows.forEach(([nm,go],r)=>{
    let hitK=null;const so=HA.cur;go();pl.rotation.set(0,0,0);const A=HA.cur;
    if(!A){info.push({nm,err:'no action'});return}
    const oh=A.onHit;let fired=null;A.onHit=function(){fired=A.k;return oh&&oh.apply(this,arguments)};
    let kk=0;K.forEach((k,i)=>{if(HA.cur===A)step(Math.max(0,(k-kk)*A.ms));kk=k;pl.rotation.set(0,0,0);pl.updateMatrixWorld(true);rd.render(sc,cam);ctx.drawImage(rd.domElement,i*FW,2*r*FH);rd.render(sc,cam2);ctx.drawImage(rd.domElement,i*FW,(2*r+1)*FH);
      if(fired!=null&&hitK==null){hitK=k;ctx.strokeStyle='#ff3030';ctx.lineWidth=3;ctx.strokeRect(i*FW+2,2*r*FH+2,FW-4,2*FH-4)}});
    ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(nm+' '+Math.round(A.ms)+'ms',4,2*r*FH+13);
    info.push({nm,ms:Math.round(A.ms),hitAt:A.hitAt,firedAt:fired==null?null:+fired.toFixed(3)});
    step(300);
  });
  if(home)home.add(pl);pl.position.copy(p0);pl.rotation.y=r0;
  return {img:cnv.toDataURL('image/png'),info}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{enemies.slice().forEach(e=>removeE(e));window.ATKSK=()=>{}}")
    for spec in WTS:
        cls,wt=spec.split(':')
        r=ev(JS,[cls,wt])
        open(play.TMP+'/v85atk_'+TAG+'_'+wt+'.png','wb').write(base64.b64decode(r['img'].split(',')[1]))
        print(TAG,wt,json.dumps(r['info']))
play.run(s,w=1000,hh=620)
