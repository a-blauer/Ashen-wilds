# v85 enemy / companion attack animations as frame strips: humanoid foe strike, slam, spell; creature bite, pounce, spit;
# a Sovereign slam and roar; a companion bite (lunge) and a companion spell cast.
#   SRC=<build.html> AW_TMP=<outdir> TAG=after python3 v85_atk_foes.py
# Attack phases are driven directly (g.ak = {n, ph, k} like mTick sets them): columns = wind-up 0 .3 .6 .85 1 | act .2 .45 .7 1 | recover .6 .2 .
# Writes <AW_TMP>/v85foe_<TAG>_<name>.png (side view on top, 3/4 front below).
import play,json,base64,os
TAG=os.environ.get('TAG','after')
JS=r"""()=>{
  window.requestAnimationFrame=()=>0;
  const FW=170,FH=170,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.9));const dl=new THREE.DirectionalLight(0xfff0d8,1.1);dl.position.set(2,5,4);sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshBasicMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,80),out={},info={};
  const PH=[[0,0],[0,.3],[0,.6],[0,.85],[0,1],[1,.2],[1,.45],[1,.7],[1,1],[2,.6],[2,.2]];
  function strip(name,g,size,frames){ // frames: array of fn(i) that poses g and returns label
    sc.add(g);g.position.set(0,0,0);g.rotation.set(0,0,0);const cnv=document.createElement('canvas');cnv.width=FW*frames.length;cnv.height=FH*2;const ctx=cnv.getContext('2d');
    frames.forEach((f,i)=>{const lb=f(i);g.updateMatrixWorld(true);
      [[size*3.4,size*.55,size*.3],[size*1.8,size*.85,size*2.6]].forEach((c,j)=>{cam.position.set(c[0],c[1],c[2]);cam.lookAt(0,size*.35,size*.3);rd.render(sc,cam);ctx.drawImage(rd.domElement,i*FW,j*FH)});
      ctx.fillStyle='#fff';ctx.font='11px sans-serif';ctx.fillText(lb,i*FW+3,12)});
    ctx.fillText(name,3,FH*2-6);out[name]=cnv.toDataURL('image/png');sc.remove(g)}
  let t=500000;
  const run=(g,ms,mv)=>{for(let i=0;i<ms;i+=16){t+=16;if(g.isE)animC(g,t,mv||false,0);else g.rig(t,mv||false,0)}};
  function phases(name,g,n,size){g.isE=1;run(g,400);strip(name,g,size,PH.map(([ph,k])=>()=>{g.ak={n,ph,k};g.atk=ph==1?1:0;g.pose=null;run(g,48);return ['W','A','R'][ph]+' '+k}));g.ak=null;g.atk=0}
  const errs=[];const tryit=(nm,f)=>{try{f()}catch(e){errs.push(nm+': '+e+' '+(e.stack||'').slice(0,200))}};
  tryit('hum',()=>{const g=cr(mk('bandit',5,0,''));phases('bandit_strike',g,'strike',1.5);phases('bandit_slam',g,'slam',1.5);
    const sh=cr(mk('shaman',5,0,''));phases('shaman_bolt',sh,'bolt',1.5)});
  tryit('wolf',()=>{const c=mkC('Ashwolf',5,0,'');c.z=1;const g=cr(c);phases('ashwolf_bite',g,'bite',1.1);phases('ashwolf_pounce',g,'pounce',1.1)});
  tryit('spider',()=>{const c=mkC('Cryptspider',5,0,'');c.z=1;const g=cr(c);phases('cryptspider_bite',g,'bite',1.1)});
  tryit('frog',()=>{const c=mkC('Mossfrog',5,0,'');c.z=1;const g=cr(c);phases('mossfrog_spit',g,'spit',1)});
  tryit('comp',()=>{const c=mkC('Foxlet',5,0,'');c.z=1;const g=cr(c);run(g,400);const tg={position:new THREE.Vector3(0,0,2.2)};
    strip('foxlet_lunge',g,1,Array.from({length:11},(_,i)=>()=>{const k=i/10;if(i==0){g.position.set(0,0,0);lunge(g,tg.position.clone())}const w=tws[tws.length-1];if(w&&w.ms==380)w.fn(Math.min(1,k));run(g,16);return 'k '+k.toFixed(1)}));
    tws.length=0;g.atk=0;g._lk=null;g.b.position.z=0;g.b.rotation.x=0;
    strip('foxlet_cast',g,1,Array.from({length:8},(_,i)=>()=>{if(i==0){g.lk=1;g.atk=0}if(i==6)g.lk=0;run(g,40);return (i*40)+'ms'+(i>=6?' fired':'')}))});
  tryit('boss',()=>{const d=BOSSES[0],c=mk(d.sp,d.lvl,0,'');c.boss=1;const g=cr(c);g.bs*=2.6;g.scale.setScalar(g.bs);g.isE=1;const e={m:g,bs:{t:0,lock:0,last:''}};g._bo=e;
    ['slam','rain'].forEach(mvk=>{run(g,300);e.bs.t=0;e.bs.lock=0;run(g,32);
      strip('sovereign_'+mvk,g,3.2,Array.from({length:11},(_,i)=>()=>{if(i==0){e.bs.last=mvk;e.bs.t=3;e.bs.lock=mvk=='slam'?1.92:0;if(mvk=='slam')lunge(g,new THREE.Vector3(0,0,4))}
        for(let j=0;j<16;j++){t+=16;e.bs.t-=.016;e.bs.lock=Math.max(0,e.bs.lock-.016);if(tws.length){const w=tws[tws.length-1],kk=Math.min(1,(t-w.t0)/w.ms);w.fn(kk);if(kk>=1){tws.pop();w.done&&w.done()}}animC(g,t,false,0)}return (i*.256).toFixed(2)+'s'}));tws.length=0})});
  return {out,errs}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{enemies.slice().forEach(e=>removeE(e));const T=tw;window.tw=undefined;tw=function(ms,fn,done){T(ms,fn,done);tws[tws.length-1].t0=500000}}")
    r=ev(JS)
    for k,v in r['out'].items():open(play.TMP+'/v85foe_'+TAG+'_'+k+'.png','wb').write(base64.b64decode(v.split(',')[1]))
    print(TAG,'rendered',sorted(r['out'].keys()),'errors',r['errs'])
play.run(s,w=1000,hh=620)
