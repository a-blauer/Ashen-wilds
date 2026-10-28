# v165 pictures: the Dirge main quest. VIEWS=name,... (default all) -> <AW_TMP>/v165_<view>.png
#   angel · grave (a grave close up) · keeper (the Keeper's grave) · stair (the Keeper's grave dug open)
#   s_entry · s_pend · s_spike · s_flame · s_chasm · s_walls (the walls closing) · s_gal · s_tomb
#   (3264+ add the channel and the prisms: see VIEWS lists in those sections)
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
V=['angel','grave','keeper','stair','s_entry','s_pend','s_spike','s_flame','s_chasm','s_walls','s_gal','s_tomb',
   'c_ii','c_start','c_fight','c_cling','c_small','c_end','o_prism','o_carry','o_reliq','o_lit']
SETUP=r"""()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__snap){camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld();}}catch(_){}return r0.apply(this,arguments)};
  window.TK165=n=>{let T=performance.now();for(let i=0;i<n;i++){T+=33;try{homeTick(1/30,T)}catch(e){console.error(e)}}};window.ERRS=[];const oe=console.error;console.error=(...a)=>{ERRS.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  hero.hp=heroMax()*50;return 1}"""
VIEW=r"""async(k)=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));let p=.42,d=12,y=0;const G=dg165GravePlan().G,gate=()=>SP152.gates.sanctum;
  const goI=async()=>{const I=INSL[20];toPos(I.ba[0],I.ba[1]);await wait(300);TK165(4)};
  const goS=async(u,v,yaw)=>{dg165SBuild();const [x,z]=dg165SW(u,v);toPos(x,z,yaw||0);await wait(300);TK165(6)};
  if(k=='angel'){await goI();const s=gate().spot;toPos(s.x+s.ux*-5,s.z+s.uz*-5,s.ry);y=s.ry;p=.22;d=7}
  if(k=='grave'){await goI();const o=G[4];toPos(o.x+Math.sin(o.ry)*3.4,o.z+Math.cos(o.ry)*3.4);TK165(4);y=o.ry+.5;p=.3;d=5.5}
  if(k=='keeper'){await goI();const o=G[9];DG165Q.g.st=1;dg165GSync();toPos(o.x+Math.sin(o.ry)*3.4,o.z+Math.cos(o.ry)*3.4);TK165(4);y=o.ry-.4;p=.28;d=5.5}
  if(k=='stair'){await goI();const o=G[9];DG165Q.g.st=2;dg165GSync();toPos(o.x+Math.sin(o.ry)*3.4,o.z+Math.cos(o.ry)*3.4);TK165(4);y=o.ry;p=.45;d=6}
  if(k=='s_entry'){await goS(80,22,Math.PI);y=Math.PI*0;p=.5;d=12}
  if(k=='s_pend'){await goS(80,34,0);y=Math.PI;p=.32;d=9}
  if(k=='s_spike'){await goS(80,84,0);TK165(10);y=Math.PI;p=.6;d=16}
  if(k=='s_flame'){await goS(64,118,0);TK165(30);y=Math.PI;p=.35;d=9}
  if(k=='s_chasm'){await goS(64,163,0);TK165(4);y=Math.PI-.5;p=.7;d=20}
  if(k=='s_walls'){DG165Q.s.cp=4;await goS(92,219,0);TK165(160);y=Math.PI;p=.75;d=18}
  if(k=='s_gal'){await goS(92,256,0);y=Math.PI;p=.35;d=9}
  if(k=='s_tomb'){await goS(92,300,0);y=Math.PI;p=.45;d=11}
  const stepR=n=>{let T=performance.now();for(let i=0;i<n;i++){T+=33;homeTick(1/30,T);enemies.slice().forEach(e=>{if(e.dg165w&&!e.dead)eTick(e,1/30,T)});kqFxTick(1/30)}};
  const goC=async(frac)=>{const P=dg165ChPath();rf165Build();const [x,z]=P.at(2,0);toPos(x,z,0);rf165Reset();await wait(300);RF165R.s=P.S*frac;RF165R.ph='run';stepR(4)};
  if(k=='c_ii'){const I=INSL[21];toPos(I.ba[0],I.ba[1]);await wait(300);TK165(4);const s=SP152.gates.channel.spot;toPos(s.x+s.ux*-6,s.z+s.uz*-6,s.ry);TK165(3);y=s.ry;p=.3;d=9}
  if(k=='c_start'){await goC(.01);y=RF165R.yaw+Math.PI;p=.5;d=13}
  if(k=='c_fight'){await goC(.35);RF165R.W.forEach(w=>{});stepR(420);y=RF165R.yaw+Math.PI+.6;p=.55;d=11}
  if(k=='c_cling'){await goC(.35);stepR(300);const w=RF165R.W.find(q=>q.st=='cling')||RF165R.W[0];if(w){const [lu,lv]=rf165L(RF165R,w.x,w.z);RF165R.H=[Math.max(-1.8,Math.min(1.8,lu*.55)),Math.max(-3,Math.min(3,lv*.55))];rf165Place();y=Math.atan2(pl.position.x-w.x,pl.position.z-w.z)}p=.32;d=6}
  if(k=='c_small'){await goC(.7);RF165R.cells.forEach((C,i)=>{if(i%3==0||C.c==0||C.r==6)rf165Break(RF165R,C,false)});stepR(200);y=RF165R.yaw+Math.PI+.4;p=.6;d=12}
  if(k=='c_end'){await goC(.985);stepR(60);y=RF165R.yaw+Math.PI;p=.35;d=12}
  if(window.V165X)await V165X(k,(a,b,c)=>{p=a;d=b;y=c});
  for(let i=0;i<40;i++)atmos(.05,performance.now());camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam();return ERRS.slice(0,5)}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#hint,#guide,header,.hdr,#pf,#orbs,#bar{display:none!important}')
    pg.evaluate(SETUP)
    for k in V:
        if VIEWS and k not in VIEWS:continue
        r=pg.evaluate(VIEW,k)
        pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v165_'+k+'.png',timeout=600000);print('shot',k,r)
play.run(s,w=1100,hh=650)
