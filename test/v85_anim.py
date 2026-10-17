# v85 movement animation check: gait frame strips + a foot-skating number for companions, mounts, hero, humanoid foe, Sovereign.
#   SRC=<build.html> AW_TMP=<outdir> TAG=after python3 v85_anim.py
# The game loop is stopped and every model is driven directly with chosen times: it moves along +x at a fixed ground
# speed while the camera follows from the side, so a planted foot should stay still against the ground stripes.
# Writes <AW_TMP>/v85_<TAG>_<subject>.png (row 1: 8 frames over one gait cycle at running speed; row 2: walking speed;
# row 3: start → stop transition) and prints, per subject, stride rate (Hz) and skate = foot speed during stance / body speed
# (0 = perfectly planted feet, 1 = feet dragged along with the body).
import play,json,base64,os
TAG=os.environ.get('TAG','after')
SUBJ=os.environ.get('SUBJ','Foxlet,Ashwolf,Stoneshell,Skyhawk,Cryptspider,Mossfrog,Gravewyrm,Batwing,M:pony,M:direwolf,M:raptor,H:hero,H:bandit,B:0').split(',')
JS=r"""(SUBJ)=>{
  window.requestAnimationFrame=()=>0; // stop the game loop: we drive time ourselves
  const FW=200,FH=170,W=FW*8,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.2);dl.position.set(2,5,4);sc.add(dl);
  // striped ground (stripes 0.5 apart) so foot sliding is visible
  const cv=document.createElement('canvas');cv.width=64;cv.height=64;const cx=cv.getContext('2d');cx.fillStyle='#4a5a3a';cx.fillRect(0,0,64,64);cx.fillStyle='#d8d0a0';cx.fillRect(0,0,4,64);
  const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(400,4);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(200,8),new THREE.MeshBasicMaterial({map:tx}));gr.rotation.x=-Math.PI/2;gr.position.set(90,0,0);sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,200);const out={},info={};
  const lbl=(c,t,y)=>{c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,4,y+13)};
  function make(s){
    if(s.startsWith('M:')){const g=mountModel(s.slice(2));return {o:g,anim:(t,mv,sp)=>g.r.rig(t,mv,sp),feet:()=>g.r.children.filter(c=>c.isBone&&c!==g.r.b).map(h=>{const kn=h.children.find(c=>c.isBone);return {getWorldPosition:v=>kn.localToWorld(v.set(0,-(h.position.y+kn.position.y),0))}}),size:1.6}}
    if(s=='H:hero'){const h=pl;return {o:h,anim:(t,mv)=>animHero(t,mv,h),feet:()=>[h.bones.lh2,h.bones.rh2],size:1.5,hero:1}}
    if(s.startsWith('H:')){const c=mk(s.slice(2),5,0,'');const g=cr(c);return {o:g,anim:(t,mv,sp)=>g.rig(t,mv,sp),feet:()=>[g.h.bones.lh2,g.h.bones.rh2],size:1.6}}
    let sp=s,boss=0;if(s.startsWith('B:')){sp=BOSSES[+s.slice(2)].sp;boss=1}
    const c=mkC(sp,5,0,'');c.z=1;const g=cr(c);if(boss){g.bs*=2.6;g.scale.setScalar(g.bs)}
    const S=SPEC[rigOf(sp)]||{},L=(S.legs||[]).map(q=>q[0]+'2');let bones=null;g.traverse(o=>{if(o.isSkinnedMesh&&!bones)bones=o.skeleton.bones});
    const byName={};if(bones)bones.forEach(b=>{if(b.name)byName[b.name]=b});
    return {o:g,anim:(t,mv,sp)=>g.rig(t,mv,sp),feet:()=>L.map(n=>byName[n]).filter(Boolean),size:boss?3.2:1.3,spec:S}
  }
  // drive the model at speed v for `ms` milliseconds in 16 ms steps (positions move with it); returns samples
  function drive(M,st,v,ms,mv,sample){
    const R=[];for(let t=0;t<ms;t+=16){st.t+=16;if(mv)st.x+=v*.016;M.o.position.x=st.x;M.o.updateMatrixWorld(true);M.anim(st.t,mv,mv?v:0);M.o.updateMatrixWorld(true);
      if(sample)R.push({t:st.t,x:st.x,f:M.feet().map(b=>{const p=new THREE.Vector3();b.getWorldPosition(p);return [p.x,p.y]})})}return R}
  function shot(M,ctx,col,row,label){
    const p=M.o.position,s=M.size;cam.position.set(p.x+.15*s,s*.42,s*2.6);cam.lookAt(p.x,s*.3,0);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);if(label)lbl(ctx,label,row*FH)}
  function skate(R,v){ // mean |foot x speed| during stance / body speed
    if(!R.length||!R[0].f.length)return null;let acc=0,n=0;
    for(let k=0;k<R[0].f.length;k++){const ys=R.map(r=>r.f[k][1]),lo=Math.min(...ys),hi=Math.max(...ys),th=lo+Math.max(.004,(hi-lo)*.12);
      for(let i=1;i<R.length;i++)if(R[i].f[k][1]<=th&&R[i-1].f[k][1]<=th){acc+=Math.abs(R[i].f[k][0]-R[i-1].f[k][0])/((R[i].t-R[i-1].t)/1000);n++}}
    return n?+(acc/n/v).toFixed(2):null}
  for(const s of SUBJ){
    try{
      const M=make(s);if(M.hero){M.home=M.o.parent;riding=null}
      sc.add(M.o);M.o.position.set(0,0,0);M.o.rotation.set(0,Math.PI/2,0);
      const cnv=document.createElement('canvas');cnv.width=W;cnv.height=FH*3;const ctx=cnv.getContext('2d');
      const st={t:100000,x:0},res={};
      const G=()=>(M.o._ga||(M.o.r&&M.o.r._ga)||(M.o.h&&M.o.h._ga)||{});
      [[0,'run',M.hero?4.5:s.startsWith('M:')?7:s.startsWith('B:')?2.6:4.5],[1,'walk',M.hero?1.6:s.startsWith('M:')?1.8:1.2]].forEach(([row,nm,v])=>{
        drive(M,st,v,1500,true,false);
        const g=G(),per=g.f?1000/g.f:600;
        const R=drive(M,st,v,Math.max(400,per*2),true,true);res[nm]={v:v,hz:g.f!=null?+g.f.toFixed(2):null,skate:skate(R,v)};
        // 8 frames across one cycle
        for(let i=0;i<8;i++){drive(M,st,v,per/8,true,false);shot(M,ctx,i,row,i==0?(s+' '+nm+' v='+v+(g.f!=null?' '+g.f.toFixed(2)+'Hz':'')):'')}
      });
      // start/stop: idle, accelerate, run, stop
      drive(M,st,0,1500,false,false);
      const seq=[[0,false,0],[90,true,3],[90,true,3],[150,true,3],[300,true,3],[90,false,0],[110,false,0],[300,false,0]];
      seq.forEach(([ms,mv,v],i)=>{drive(M,st,v,ms,mv,false);shot(M,ctx,i,2,i==0?'start → stop':'')});
      out[s]=cnv.toDataURL('image/png');info[s]=res;
      sc.remove(M.o);if(M.hero&&M.home)M.home.add(M.o);
    }catch(e){info[s]={err:String(e)+' '+(e.stack||'').slice(0,300)}}
  }
  return {out,info}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS,SUBJ)
    for k,v in r['out'].items():
        open(play.TMP+'/v85_'+TAG+'_'+k.replace(':','_')+'.png','wb').write(base64.b64decode(v.split(',')[1]))
    for k,v in r['info'].items():print(TAG,k,json.dumps(v))
play.run(s,w=1000,hh=620)
