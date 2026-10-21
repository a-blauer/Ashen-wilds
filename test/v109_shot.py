# v109 screenshots: the kingdom from above at stages 0, 2 and 5 (walls, plots, outskirts), a street view, the Steward plan.
# Writes out/v109_*.png.  STAGES=0,2,5 picks the stages.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;gold=1e6;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    for st in [int(x) for x in os.environ.get('STAGES','0,2,5').split(',')]:
        ev("(st)=>{bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);kfApply109(true);const T=TOWNS[0],F=kf109();toPos(T.cx,T.cy+F.SZ+4);visTick&&visTick();STEP(.3);"
           "const cz=(F.SZ-21)/2;FC([T.cx+0.1,T.ph+92,T.cy+cz+48],[T.cx,T.ph,T.cy+cz],1)}",st)
        L.shot(pg,OUT+'/v109_air_%d.png'%st)
    # a full kingdom: every shop, upgrade and house built, two of them turned
    ev("""()=>{gold=1e8;for(const k of Object.keys(RES))mats[k]=9999;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=999);SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=2);SH.lv.walls=2;shApply();
      while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX){if(!hsBuy103(LOT103.find(l=>lotFree103(l.id)).id))break}kfRotate109(lotKey103('S3M'));kfRotate109(lotKey103('S2W'));
      const T=TOWNS[0];toPos(T.cx,T.cy+52);STEP(.3);FC([T.cx+0.1,T.ph+80,T.cy+15+44],[T.cx,T.ph,T.cy+15],1)}""")
    L.shot(pg,OUT+'/v109_air_full.png')
    ev("""()=>{const T=TOWNS[0];FC([T.cx+19,T.ph+9,T.cy+40],[T.cx,T.ph+1,T.cy+28])}""");L.shot(pg,OUT+'/v109_rows.png')
    ev("()=>{const T=TOWNS[0],F=kf109();window.FCAM=null;toPos(T.cx+6.5,T.cy+F.SZ-3.5);camYaw=Math.PI;camPitch=.32;camDist=9;STEP(.3)}")
    L.shot(pg,OUT+'/v109_street.png')
    ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx+2,T.cy-3);camYaw=Math.PI*0.9;camPitch=.38;camDist=11;STEP(.3)}")
    L.shot(pg,OUT+'/v109_plaza.png')
    ev("()=>{KM103.tab='kingdom';openX('hold');STEP(.1)}");L.shot(pg,OUT+'/v109_steward.png')
play.run(s)
