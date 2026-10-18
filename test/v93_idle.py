# v93 idle animations: frame sheets per character family, jitter/pop numbers, in-game perf and page-error check.
#   python3 v93_idle.py                                  -> this build (TAG=after)
#   SRC=<old.html> TAG=before python3 v93_idle.py        -> the same for another build (compare the sheets)
#   PART=sheets,perf,game (default all)   SUBJ=H:hero:warrior,C:Foxlet,...  (default: every family)
# Sheets: <AW_TMP>/v93_<TAG>_<subject>.jpg. Rows 1-2: 8 frames each over ~4.4 s of standing still (fidgets come every
# 1.5-3 s here so they show up); row 3: idle → start walking → stop → start an attack (no pop expected).
# Numbers per subject: idle max per-frame bone change (rad per 16 ms frame) and max frame-to-frame change of that
# (jerk: a pop shows as a spike), then the same for the walk start and the attack start.
import play,json,base64,os
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','sheets,perf,game').split(',')
DEF=('H:hero:warrior,H:hero:paladin,H:hero:assassin,H:hero:ranger,H:hero:mage,H:hero:warrior:combat,'
     'F:bandit,F:orc,F:skeleton,F:bonearcher,F:troll,F:vamp,F:bandit:agg,B:4,B:5,N:merchant,N:innkeeper,'
     'C:Foxlet,C:Ashwolf,E:snowwolf,C:Drakelet,C:Stoneshell,C:Boneling,C:Skyhawk,C:Mossfrog,C:Batwing,C:Cryptspider,E:scorp,'
     'C:Gloomcap,E:goo,C:Wispling,C:Gravewyrm,E:maggot,B:0,B:1,B:2,B:3,M:pony,M:raptor,M:drake')
SUBJ=os.environ.get('SUBJ',DEF).split(',')
JS=r"""(SUBJ)=>{
  window.requestAnimationFrame=()=>0;
  const HAS=!!window.IDL;if(HAS){IDL.fmin=1.5;IDL.fmax=3;IDL.force=window.FORCE!=null?+FORCE:null}
  const FW=Math.round(180*(window.FSC||1)),FH=Math.round(200*(window.FSC||1)),W=FW*8,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.85));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.15);dl.position.set(2,5,4);sc.add(dl);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshLambertMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,300);const out={},info={};
  const lbl=(c,t,x,y)=>{c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
  const wpn=cls=>{const tp=ITPL.findIndex(t=>t.cls==cls&&!t.nw);if(tp>=0){eq.weapon={id:uid++,tp,lv:12,req:1,r:2,up:0,aff:[]}}try{hsDirty()}catch(_){}refreshGear()};
  function make(s){
    const q=s.split(':');
    if(q[0]=='H'){const cls=q[2];hero.cls=cls;hero.lvl=12;try{heroOutfit(pl,cls)}catch(_){}wpn(cls);riding=null;HA.cur=null;pl.sw=0;
      if(HAS)IDL.combat=q[3]=='combat'?1:0;
      return {o:pl,anim:(t,mv)=>animHero(t,mv,pl),hero:1,atk:()=>swingAnim(0,300,()=>{}),fix:1}}
    if(q[0]=='F'){const c=mk(q[1],12,0,'');const g=cr(c);g.isE=1;const e={m:g,agg:q[2]=='agg'?1:0,c};g._ie=e;
      return {o:g,anim:(t,mv,sp)=>animC(g,t,mv,sp),ak:g}}
    if(q[0]=='N'){const T=window.T_cur;window.T_cur={col:[],cx:0,cy:0};const p=new THREE.Group();const n0=TANIM.length;
      const o=q[1]=='merchant'?{robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant',ry:0}:{robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Innkeeper',ry:0};
      const g=npc(p,0,0,o);window.T_cur=T;const A=TANIM.splice(n0,1)[0];g.children.forEach(c=>{if(c.isSprite)c.visible=false});
      return {o:p,anim:t=>A.f(t),npc:1}}
    if(q[0]=='M'){const g=mountModel(q[1]);return {o:g,anim:(t,mv,sp)=>g.r.rig(t,mv,sp)}}
    if(q[0]=='B'&&+q[1]>=4){const c=mk('boss'+q[1],30,0,'');const g=cr(c);g.isE=1;const e={m:g,agg:0,c,bs:{t:5,lock:0},boss:1};g._ie=e;g._bo=e;return {o:g,anim:(t,mv,sp)=>animC(g,t,mv,sp),ak:g}}
    let sp=q[1],boss=0;if(q[0]=='B'){sp=BOSSES[+q[1]].sp;boss=1}
    let c;if(q[0]=='E'){c=mk(q[1],12,0,'')}else{c=mkC(sp,5,0,'');c.z=1}
    const g=cr(c);if(boss){g.bs*=2.6;g.scale.setScalar(g.bs)}
    if(q[0]=='E'||boss){g.isE=1;const e={m:g,agg:0,c,bs:boss?{t:5,lock:0}:null,boss};g._ie=e;if(boss)g._bo=e}
    if(g.isHum)return {o:g,anim:(t,mv,sp)=>animC(g,t,mv,sp),ak:g};
    return {o:g,anim:(t,mv,sp)=>animC(g,t,mv,sp),ak:g}
  }
  function bonesOf(o){const B=[];o.traverse(x=>{if(x.isBone)B.push(x)});return B}
  function snap(B,arr){let k=0;for(const b of B){arr[k++]=b.rotation.x;arr[k++]=b.rotation.y;arr[k++]=b.rotation.z;arr[k++]=b.position.x*4;arr[k++]=b.position.y*4}return arr}
  function stat(){return {d:0,j:0,prev:null,cur:null,pd:null,w:''}}
  function upd(S,B){const a=snap(B,new Float64Array(B.length*5));if(S.cur){let m=0,mi=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-S.cur[i]);if(d>m){m=d;mi=i}}
      if(S.pd!=null){S.j=Math.max(S.j,Math.abs(m-S.pd))}if(m>S.d){S.d=m;S.w=(B[mi/5|0].name||('#'+(mi/5|0)))+'.'+'xyzXY'[mi%5]}S.pd=m}S.cur=a}
  for(const s of SUBJ){
    try{
      const M=make(s);const home=M.o.parent;sc.add(M.o);M.o.position.set(0,0,0);M.o.rotation.set(0,+(window.ROTY||1.05),0);
      const B=bonesOf(M.o);const st={t:200000};
      const step=(ms,mv,v,S,pre)=>{for(let t=0;t<ms;t+=16){st.t+=16;if(pre)pre(st.t);M.anim(st.t,mv,mv?v:0);if(mv){M.o.position.set(0,0,0)}if(S)upd(S,B)}};
      step(600,false,0);M.o.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(M.o);const sz=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
      const H=Math.max(sz.y,sz.x*.8,sz.z*.8,.6);
      const shot=(ctx,col,row,label)=>{const d=H*2.25;cam.position.set(ctr.x+d*.42,ctr.y+H*.22,ctr.z+d*.9);cam.lookAt(ctr.x,ctr.y,ctr.z);M.o.updateMatrixWorld(true);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);if(label)lbl(ctx,label,col*FW,row*FH)};
      const cnv=document.createElement('canvas');cnv.width=W;cnv.height=FH*3;const ctx=cnv.getContext('2d');
      const res={};const SI=stat();step(1000,false,0);
      for(let r=0;r<2;r++)for(let i=0;i<8;i++){step(550,false,0,SI);let f='';if(HAS){const S=(M.o._idl||(M.o.h&&M.o.h._idl)||(M.o.r&&M.o.r._idl)||(M.o.children&&M.o.children[0]&&M.o.children[0]._idl)||{});f=S.fid>=0?'f'+S.fid:''}
        shot(ctx,i,r,(i==0&&r==0?s+' ':'')+f)}
      res.idle={d:+SI.d.toFixed(4),j:+SI.j.toFixed(4),w:SI.w};
      // walk start: let it settle into a fidget-free idle? no - start from whatever the idle is doing
      const SW=stat();step(200,false,0,SW);const d0=SW.d;SW.d=0;SW.j=0;
      shot(ctx,0,2,'idle');step(100,true,1.4,SW);shot(ctx,1,2,'walk .1s');step(150,true,1.4,SW);shot(ctx,2,2,'walk .25s');
      res.walk={d:+SW.d.toFixed(4),j:+SW.j.toFixed(4),w:SW.w};
      step(900,false,0);shot(ctx,3,2,'stop .9s');step(1500,false,0);shot(ctx,4,2,'idle again');
      // attack start
      const SA=stat();step(48,false,0,SA);SA.d=0;SA.j=0;
      if(M.atk){M.atk();step(120,false,0,SA);shot(ctx,5,2,'attack .12s');step(120,false,0,SA)}
      else if(M.ak){const g=M.ak;g.ak={n:'strike',ph:0,k:0};let tt=0;step(240,false,0,SA,()=>{tt+=.016;g.ak.k=Math.min(1,tt/.5)});shot(ctx,5,2,'wind-up .24s');
        step(260,false,0,SA,()=>{tt+=.016;g.ak.k=Math.min(1,tt/.5)});g.ak={n:'strike',ph:1,k:0};tt=0;step(150,false,0,null,()=>{tt+=.016;g.ak.k=Math.min(1,tt/.18)});shot(ctx,6,2,'strike');g.ak=null}
      res.atk={d:+SA.d.toFixed(4),j:+SA.j.toFixed(4),w:SA.w};
      step(1200,false,0);shot(ctx,7,2,'after');
      out[s]=cnv.toDataURL('image/jpeg',.85);info[s]=res;
      sc.remove(M.o);if(home)home.add(M.o);if(M.hero){M.o.position.set(START[0],0,START[1])}
    }catch(e){info[s]={err:String(e)+' '+(e.stack||'').slice(0,400)}}
  }
  if(HAS){IDL.combat=null;IDL.force=null;IDL.fmin=4;IDL.fmax=10}
  return {out,info}}"""
PERF=r"""(n)=>{
  window.VT=performance.now();const pn=performance.now.bind(performance);performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;
  const p=pl.position;enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
  const keys=['bandit','orc','skeleton','snowwolf','lurker','cavebat','stalker','shambler','wraith','goo','maggot','scorp','troll','harpy','magmadrake'];
  for(let i=0;i<n;i++){const a=i/n*6.283*3,r=5+(i%10)*1.4;const e=spawnEnemy(keys[i%keys.length],p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,8,{});e.agg=0;e.cd=99;e._kp=1}
  hero.iv=99;window.GOD=1;
  const run=(fr,on)=>{if(window.IDL){IDL.on=on;IDL.prof=1;IDL.ms=0;IDL.n=0;IDL.pnow=pn}let tl=0;POST.render=()=>{};
    for(let i=0;i<fr;i++){VT+=16;hero.hp=heroMax();enemies.forEach(e=>{e.cd=99;e.agg=0;if(e.atk)mCancel&&mCancel(e)});const t0=pn();loop(VT);tl+=pn()-t0}
    POST.render=__pr;return {ms:+(tl/fr).toFixed(3),idl:window.IDL?+(IDL.ms/fr).toFixed(3):null,calls:window.IDL?+(IDL.n/fr).toFixed(1):null}};
  run(30,true);const vis=enemies.filter(e=>e.m.visible).length;
  const R={visible:vis,on:[],off:[]};for(let k=0;k<4;k++){R.on.push(run(120,true));if(window.IDL)R.off.push(run(120,false))}
  if(window.IDL){IDL.on=true;IDL.prof=0;IDL.pnow=()=>performance.now()}performance.now=pn;return R}"""
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if 'game' in PART:
        # town: the hero and town folk in the game's own renderer
        ev("()=>{camPitch=.35;camDist=7;const T=TOWNS[0];toPos(T.cx+1,T.cy+4.5,0);pl.rotation.y=Math.PI;snapCam();return 1}");pg.wait_for_timeout(4000)
        pg.screenshot(path=play.TMP+f'/v93_{TAG}_town.png',timeout=120000)
    if 'sheets' in PART:
        if os.environ.get('FORCE'):ev("(f)=>{window.FORCE=f}",os.environ['FORCE'])
        if os.environ.get('FSC'):ev("(f)=>{window.FSC=+f}",os.environ['FSC'])
        if os.environ.get('ROTY'):ev("(f)=>{window.ROTY=f}",os.environ['ROTY'])
        r=ev(JS,SUBJ)
        for k,v in r['out'].items():
            open(play.TMP+'/v93_'+TAG+'_'+k.replace(':','_')+os.environ.get('SFX','')+'.jpg','wb').write(base64.b64decode(v.split(',')[1]))
        for k,v in r['info'].items():print(TAG,k,json.dumps(v))
    if 'perf' in PART:
        ev("()=>{enterMap(0)}");pg.wait_for_timeout(4000)
        ev("()=>{const p=pl.position;toPos(p.x,p.z,0);camPitch=.5;camDist=14;snapCam();return 1}")
        print(TAG,'perf 60 enemies',json.dumps(ev(PERF,60)))
        pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+f'/v93_{TAG}_zone.png',timeout=120000)
    print(TAG,'PAGEERRORS',len(errs),errs[:5])
play.run(s,w=1000,hh=620)
