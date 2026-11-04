# v196 pictures: Duskhold's round meadow from above at stages 0 and 5 (everything built), a portal room, an entryway, street views.
# Writes out/v196_*.png.  STAGES=0,5 picks the stages; ONLY=air,room,... picks views.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
ONLY=set((os.environ.get('ONLY') or 'air,full,room,entry,street,plaza,inn,shops,deco,folk,meadow').split(','))
FULL="""()=>{gold=1e8;for(const k of Object.keys(RES))mats[k]=9999;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=999);SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=3);SH.lv.walls=3;shApply();
  while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX){if(!hsBuy103(LOT103.find(l=>lotFree103(l.id)).id))break}}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;gold=1e6;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    if 'air' in ONLY:
      for st in [int(x) for x in os.environ.get('STAGES','0,5').split(',')]:
        ev("(st)=>{bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);kfApply109(true);portalRefresh();const T=TOWNS[0];toPos(T.cx,T.cy+8);STEP(.3);FC([T.cx+0.1,T.ph+150,T.cy+60],[T.cx,T.ph,T.cy],1)}",st)
        L.shot(pg,OUT+'/v196_air_%d.png'%st)
    if 'full' in ONLY:
      ev("()=>{bossDone.clear();for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true);portalRefresh()}");ev(FULL)
      ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+8);STEP(.3);FC([T.cx+0.1,T.ph+95,T.cy+52],[T.cx,T.ph,T.cy+4],1)}");L.shot(pg,OUT+'/v196_full.png')
      ev("()=>{const T=TOWNS[0];FC([T.cx+30,T.ph+16,T.cy+40],[T.cx,T.ph+1,T.cy+10])}");L.shot(pg,OUT+'/v196_full_se.png')
    if 'room' in ONLY:
      for i in [0,2,3,5]:
        ev("(i)=>{const p=TWN100_PG[i],T=TOWNS[0];toPos(p.a[0],p.a[1]);STEP(.3);const dx=T.cx-p.x,dz=T.cy-p.y,L=Math.hypot(dx,dz);FC([p.x+dx/L*12,T.ph+9,p.y+dz/L*12],[p.x,T.ph+1.5,p.y])}",i)
        L.shot(pg,OUT+'/v196_room_%d.png'%i)
    if 'entry' in ONLY:
      ev("()=>{bossDone.clear();kfApply109(true);portalRefresh()}")
      for i in [1,4]:
        ev("(i)=>{const E=dm196EntF(i),T=TOWNS[0];toPos(E.x-E.f[0]*4,E.z-E.f[1]*4);STEP(.3);FC([E.x-E.f[0]*9,T.ph+4,E.z-E.f[1]*9],[E.x,T.ph+2,E.z])}",i)
        L.shot(pg,OUT+'/v196_entry_%d.png'%i)
    if 'street' in ONLY:
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx+3,T.cy+24);camYaw=Math.PI;camPitch=.3;camDist=10;STEP(.3)}");L.shot(pg,OUT+'/v196_street.png')
    if 'plaza' in ONLY:
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx,T.cy+8);camYaw=Math.PI;camPitch=.35;camDist=12;STEP(.3)}");L.shot(pg,OUT+'/v196_plaza.png')
    if 'inn' in ONLY:
      ev("()=>{const T=TOWNS[0],l=dm196Fix('inn'),[x,z]=lotW103(l,0,9);window.FCAM=null;FC([x,T.ph+5,z],[T.cx+l.x,T.ph+2,T.cy+l.z]);toPos(...lotW103(l,0,6));STEP(.3)}");L.shot(pg,OUT+'/v196_inn_out.png')
      ev("()=>{const T=TOWNS[0],l=dm196Fix('inn');window.FCAM=null;const [x,z]=lotW103(l,0,1.5);toPos(x,z,l.ry+Math.PI);STEP(.5);const [cx,cz]=lotW103(l,1.0,3.6),[tx,tz]=lotW103(l,-1.5,-1.6);FC([cx,T.ph+3.6,cz],[tx,T.ph+1.2,tz])}");L.shot(pg,OUT+'/v196_inn_in.png')
      ev("()=>{const T=TOWNS[0],l=dm196Fix('inn');const [cx,cz]=lotW103(l,-3.8,3.4),[tx,tz]=lotW103(l,4.6,-1.2);FC([cx,T.ph+3.2,cz],[tx,T.ph+1.0,tz])}");L.shot(pg,OUT+'/v196_inn_fire.png')
    if 'shops' in ONLY:
      ev("()=>{bossDone.clear();for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true)}");ev(FULL)
      for lv in [0,3]:
        ev("(lv)=>{SHPU109.forEach(u=>{SHP109.lv[u.k]=lv});SHOPS.forEach(o=>dm196ShopRebuild(o.k));dm196Post()}",lv)
        for k in ['alch','merchant','post']:
          ev("(k)=>{const T=TOWNS[0],l=k=='post'?dm196Fix('post'):lotOf103(k);if(!l)return;const [x,z]=lotW103(l,4.5,9.5),[tx,tz]=lotW103(l,0,0);window.FCAM=null;FC([x,T.ph+4.5,z],[tx,T.ph+1.8,tz]);toPos(...lotW103(l,0,7));STEP(.2)}",k)
          L.shot(pg,OUT+'/v196_shop_%s_%d.png'%(k,lv))
    if 'deco' in ONLY:
      ev("()=>{bossDone.clear();for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true);DECO103.forEach(D=>SH.deco[D.k]=1);dc103Sync()}");ev(FULL)
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx,T.cy+8);STEP(.3);FC([T.cx+0.1,T.ph+70,T.cy+30],[T.cx,T.ph,T.cy+2],1)}");L.shot(pg,OUT+'/v196_deco_air.png')
      ev("()=>{const T=TOWNS[0];FC([T.cx-22,T.ph+12,T.cy+22],[T.cx+2,T.ph+1,T.cy-2])}");L.shot(pg,OUT+'/v196_deco_sw.png')
      ev("()=>{const T=TOWNS[0];FC([T.cx+24,T.ph+12,T.cy-20],[T.cx,T.ph+1,T.cy+2])}");L.shot(pg,OUT+'/v196_deco_ne.png')
    if 'folk' in ONLY:
      ev("()=>{bossDone.clear();for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true)}");ev(FULL)
      ev("()=>{HS103.cit.forEach((c,i)=>{c.r=['fish','hunt','egg','gather'][i%4];c.task='';c.t0=0;c.bag=null;c.wf=0});czClear103();const T=TOWNS[0];toPos(T.cx,T.cy+6);STEP(.2)}")
      ev("()=>{const T=TOWNS[0],L=CZ103.live;L.slice(0,4).forEach((o,i)=>{o.g.position.set(T.cx-3+i*2,T.ph,T.cy+6);o.g.rotation.y=Math.PI/2;o.wait=999;o.mode='';o.act=null});STEP(.1);FC([T.cx,T.ph+1.4,T.cy+10.5],[T.cx,T.ph+.7,T.cy+6])}")
      L.shot(pg,OUT+'/v196_folk_side.png')
      ev("()=>{const T=TOWNS[0];FC([T.cx+.5,T.ph+1.4,T.cy+1.5],[T.cx,T.ph+.7,T.cy+6])}");L.shot(pg,OUT+'/v196_folk_back.png')
      ev("()=>{const S=dm196Spots(),want=['chair','chair','chair','stool','bench','rim','rim','rim','listen','listen','stall','bench'];CZ103.live.forEach((o,i)=>{const k=want[i];if(!k)return;const s=S.find(q=>q.k==k&&!q.busy);if(!s)return;s.busy=o;o.act={s,a:s.act,ph:'do',t:0,dur:999};o.mode='';o.g.position.set(s.x,TOWNS[0].ph,s.z)});STEP(.3)}")
      ev("()=>{const T=TOWNS[0],l=dm196Fix('inn'),[cx,cz]=lotW103(l,0,3.4),[tx,tz]=lotW103(l,0,-1.5);toPos(...lotW103(l,0,1.0));STEP(.2);FC([cx,T.ph+4.2,cz],[tx,T.ph+.6,tz])}");L.shot(pg,OUT+'/v196_folk_inn.png')
      ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+8);STEP(.2);FC([T.cx+5,T.ph+4.5,T.cy+6],[T.cx,T.ph+.5,T.cy])}");L.shot(pg,OUT+'/v196_folk_fountain.png')
      ev("()=>{const T=TOWNS[0],l=dm196Fix('inn'),[cx,cz]=lotW103(l,-.8,2.4),[tx,tz]=lotW103(l,-3.3,1.4);FC([cx,T.ph+1.6,cz],[tx,T.ph+.5,tz])}");L.shot(pg,OUT+'/v196_folk_table.png')
      ev("()=>{const T=TOWNS[0];FC([T.cx+2.2,T.ph+1.3,T.cy+5.6],[T.cx+.6,T.ph+.6,T.cy+2.2])}");L.shot(pg,OUT+'/v196_folk_rim.png')
      r=ev("()=>CZ103.live.map(o=>o.act?o.act.a+':'+o.act.ph:o.mode||'-').join(' ')");print('ACTS',r)
    if 'meadow' in ONLY:
      ev("()=>{bossDone.clear();KF109.s=-1;SH.shop={};SH.lv={};SH.pos={};HS103.h=[];HS103.cit=[];for(const i in HS103.g)hsDrop103(+i);shApply();lotSync103();kfApply109(true);portalRefresh()}")
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx+2,T.cy+26);camYaw=Math.PI*.15;camPitch=.22;camDist=9;STEP(.3)}");L.shot(pg,OUT+'/v196_meadow_s0.png')
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx-30,T.cy+8);camYaw=Math.PI*.5;camPitch=.18;camDist=8;STEP(.3)}");L.shot(pg,OUT+'/v196_meadow_edge.png')
      ev("()=>{const T=TOWNS[0];window.FCAM=null;toPos(T.cx,T.cy+15);camYaw=0;camPitch=.3;camDist=10;STEP(.3)}");L.shot(pg,OUT+'/v196_meadow_gate.png')
play.run(s)
