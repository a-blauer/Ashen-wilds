# v227 the Sandstorm Run, reinvented: pictures (the opening looking back at the storm, the chase view, a boost, a jump, the guns on
# a swarm, the heavy shell, the storm closing).  python3 v227_look.py   (VIEWS=intro,cruise,boost,jump,fight,heavy,storm)
import play,os,json
VIEWS=os.environ.get('VIEWS','intro,cruise,boost,jump,fight,heavy,storm').split(',')
JS=r"""async(view)=>{window.__T=window.__T||performance.now();const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){__T+=33;if(f&&f(__T)===false)return;homeTick(1/30,__T);try{kqFxTick(1/30)}catch(_){}try{fxStep(1/30)}catch(_){}enemies.slice().forEach(e=>{if(e.sr165&&!e.dead)eTick(e,1/30,__T)})}};
  if(view==='go'){hero.lvl=35;INSR[3]=2;SS165.c3.built=1;SS165.c3.got=31;CHEAT.god=true;SET.intro=0;insArrive(INSL[insG(3,2)]);await wait(600);const T=ss165T3(),[x,z]=T.F.W2(T.cr.a-1,-3.5);toPos(x,z);tick(.3);await wait(200);cs165Board();await wait(1500);SKR227.auto=true;return SR165.on}
  const V=SR165.me;mOn=false;const bot=()=>{try{skr218Cam();let best=null,bd=1e9;sr165Foes().forEach(f=>{const al=(f.p.x-V.x)*Math.sin(V.h)+(f.p.z-V.z)*Math.cos(V.h);if(al<2)return;const d=f.p.distanceTo(V.m.position);if(d<bd){bd=d;best=f}});
      if(best){const q=best.p.clone().project(cam);SKR226.rx=q.x;SKR226.ry=q.y}else{SKR226.rx=.1;SKR226.ry=-.1}}catch(_){}};
  atkHeld=false;
  if(view==='intro'){SR165.ph='intro';SR165.t=0;SR165.t0=3.2;tick(.8,bot)}
  else if(view==='cruise'){tick(6,bot)}
  else if(view==='boost'){V.bst=1;tick(1.6,()=>{bot();V.boost=1;SKR227.auto=false;K.shift=1});K.shift=0;SKR227.auto=true}
  else if(view==='jump'){let n=0;tick(40,()=>{bot();if(V.air>0&&V.y-GH(V.x,V.z)>1.6)return false})}
  else if(view==='fight'){atkHeld=true;tick(22,bot);let n=0;tick(14,()=>{bot();if(enemies.filter(e=>e.sr165&&!e.dead).length>=7&&V.fT>.05&&++n>12)return false});atkHeld=false}
  else if(view==='heavy'){tick(8,bot);SKR227.hv=0;sr165Fire(V,true,1);tick(.25,bot)}
  else if(view==='storm'){V.gap=5;SKR227.auto=false;tick(1.2,()=>{bot();V.gap=4;V.boost=0});SKR227.auto=true}
  return {s:Math.round(V.s),v:Math.round(V.v),gap:Math.round(V.gap),air:V.air>0,foes:enemies.filter(e=>e.sr165&&!e.dead).length,fov:Math.round(cam.fov)}}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    print('go',pg.evaluate(JS,'go'))
    for v in VIEWS:
        r=pg.evaluate(JS,v);print(v,json.dumps(r));pg.wait_for_timeout(int(os.environ.get('SETTLE','2500')));pg.screenshot(path=play.TMP+'/v227_%s.png'%v,timeout=600000)
    print('RESULT PASS')
play.run(s,w=1100,hh=640)
