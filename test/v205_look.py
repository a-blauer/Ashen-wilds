# v205 pictures: the Citadel main quest. VIEWS=name,... -> <AW_TMP>/v205_<view>.png  (NOHUD=1 hides the HUD)
#   g1 (the gateway of Citadel I, from the road) · g2 · g3 · plus the quest views added in 3740+ (V205X)
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','g1,g2,g3').split(',') if v]
SETUP=r"""()=>{const r0=POST.render.bind(POST);POST.render=function(){try{if(window.__snap){camPitch=__snap.p;camDist=__snap.d;camYaw=__snap.y;snapCam();cam.lookAt(look);cam.updateMatrixWorld();}}catch(_){}return r0.apply(this,arguments)};
  window.TK205=n=>{let T=performance.now();for(let i=0;i<n;i++){T+=33;try{homeTick(1/30,T)}catch(e){console.error(e)}try{kqFxTick(1/30)}catch(_){}}};window.ERRS=[];const oe=console.error;console.error=(...a)=>{ERRS.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  hero.hp=heroMax()*50;CHEAT.god=true;return 1}"""
VIEW=r"""async(k)=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));let p=.42,d=12,y=0;
  const goG=async(g,back)=>{const I=INSL[g],P=I.path,q=P[Math.max(0,P.length-1-(back||14))];toPos(q[0],q[1]);await wait(400);TK205(6);return Math.atan2(q[0]-I.ba[0],q[1]-I.ba[1])};
  if(k=='g1'){y=await goG(25,22);p=.3;d=16}
  if(k=='g2'){y=await goG(26,22);p=.3;d=16}
  if(k=='g3'){y=await goG(27,22);p=.3;d=16}
  const F0=cq205F(0),at0=(a,b)=>{const [x,z]=F0.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)},back=Math.atan2(-F0.fx,-F0.fz);
  const evOn=async(t)=>{at0(0,0);await wait(300);TK205(10);CQ205.c1.st=2;CQ205.c1.ing=0;ch205Sync();us205Start(true);TK205(150);US205.E.t=t;at0(F0.reach-11,-4);TK205(30);await wait(2500);TK205(30)};
  if(k=='gate'){at0(-3,0);await wait(300);TK205(20);y=back;p=.2;d=15}
  if(k=='gateC'){at0(F0.reach-7,1.5);await wait(300);TK205(20);y=back+.35;p=.12;d=7}
  if(k=='gateS'){at0(F0.reach-9,0);await wait(300);TK205(20);y=back+1.2;p=.25;d=16}
  if(k=='ched'){at0(F0.reach-9,-2);await wait(300);TK205(20);const g=CH205.g.position;toPos(g.x-F0.fx*2.2+F0.lx*.6,g.z-F0.fz*2.2+F0.lz*.6);TK205(10);y=back+.5;p=.12;d=3.2}
  if(k=='cast'){await evOn(20);y=back+.3;p=.32;d=14}
  if(k=='castC'){await evOn(30);const g=CH205.g.position;toPos(g.x-F0.fx*3,g.z-F0.fz*3);TK205(5);y=back+.4;p=.18;d=4.5}
  if(k=='ecl'){await evOn(64);TK205(60);y=back-.2;p=.35;d=13}
  if(k=='brk'){await evOn(92);TK205(30);await wait(3000);y=back+.6;p=.3;d=12}
  if(k=='open'){at0(0,0);await wait(300);TK205(10);CQ205.c1.st=2;ch205Sync();us205Start(true);TK205(150);US205.E.t=US205.T-.1;TK205(10);TK205(260);at0(-2,0);TK205(60);y=back;p=.18;d=14}
  const F1=cq205F(1),at1=(a,b)=>{const [x,z]=F1.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)},back1=Math.atan2(-F1.fx,-F1.fz);
  const vhT=n=>{for(let i=0;i<n;i++){const T=performance.now()+i*33;homeTick(1/30,T);const e=VH205.e;if(e&&!e.dead)eTick(e,1/30,T);try{kqFxTick(1/30)}catch(_){}}};
  if(k=='v2gate'){INSR[5]=Math.max(INSR[5]|0,1);at1(-4,0);await wait(400);vhT(30);y=back1;p=.2;d=15}
  if(k=='v2sleep'){INSR[5]=Math.max(INSR[5]|0,1);at1(-2,0);await wait(400);vhT(30);const e=VH205.e;toPos(e.m.position.x-F1.fx*8.5-F1.lx*4,e.m.position.z-F1.fz*8.5-F1.lz*4);vhT(10);y=back1-.5;p=.18;d=6}
  if(k=='v2fight'||k=='v2rear'||k=='v2pounce'||k=='v2hunt'||k=='v2screech'){INSR[5]=Math.max(INSR[5]|0,1);at1(-2,0);await wait(400);vhT(30);const e=VH205.e;toPos(e.m.position.x-F1.fx*6,e.m.position.z-F1.fz*6);vhT(5);vh205Wake();vhT(140);
    const id={v2fight:'rend',v2rear:'rend',v2pounce:'pounce',v2screech:'screech',v2hunt:'hunt'}[k];svEndMove(e,true);if(k=='v2hunt'){e.sv.ph=2;vh205Storm(true)}e.m.position.set(VH205A.cx,0,VH205A.cz);pl.position.set(VH205A.cx-F1.fx*6,0,VH205A.cz-F1.fz*6);e.m.rotation.y=Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z);
    svStart(e,id,3);vhT({v2fight:20,v2rear:57,v2pounce:30,v2screech:40,v2hunt:160}[k]);y=back1+.9;p=.25;d=11;if(k=='v2hunt'){y=back1+.4;p=.5;d=16}}
  const F2=cq205F(2),at2=(a,b)=>{const [x,z]=F2.W2(a,b);toPos(x,z);pl.position.y=GH(x,z)},back2=Math.atan2(-F2.fx,-F2.fz);
  if(k=='v3court'){INSR[5]=2;at2(-12,-3);await wait(400);TK205(30);y=back2+.4;p=.35;d=17}
  if(k=='v3shrine'){INSR[5]=2;at2(0,0);await wait(400);TK205(10);const s=DM205.S.sh[1];toPos(s.x+7,s.z+5);await wait(600);TK205(20);y=Math.atan2(7,5);p=.25;d=9}
  if(k=='v3beam'){INSR[5]=2;at2(-12,-3);await wait(400);TK205(10);const C=CQ205.c3;C.st=2;C.mnt=7;C.cl=7;C.rot=[7,1,4];dm205Sync();TK205(20);y=back2+.5;p=.42;d=18}
  if(k=='v3dawn'){INSR[5]=2;at2(-6,0);await wait(400);TK205(10);const C=CQ205.c3;C.st=2;C.mnt=7;C.cl=7;C.rot=[7,1,4];dm205Sync();dm205Turn(2,true,0);TK205(400);y=back2;p=.22;d=14}
  if(window.V205X){const r=await V205X(k);if(r){p=r[0];d=r[1];y=r[2]}}
  for(let i=0;i<40;i++)atmos(.05,performance.now());camPitch=p;camDist=d;camYaw=y;window.__snap={p,d,y};snapCam();return ERRS.slice(0,5)}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#mqt143,#glog,#pk,#chqt132,#locBox,.dn,#hint,#guide,header,.hdr,#pf,#orbs,#bar{display:none!important}')
    pg.evaluate(SETUP)
    for k in VIEWS:
        r=pg.evaluate(VIEW,k)
        pg.wait_for_timeout(int(os.environ.get('SETTLE','2500')));pg.screenshot(path=play.TMP+'/v205_'+k+'.png',timeout=600000);print('shot',k,r)
play.run(s,w=1100,hh=650)
