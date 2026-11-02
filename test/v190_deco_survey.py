# v190: pictures of Duskhold's decorations at every kingdom stage (all shops and decorations built).
#   STAGES=0,3,5  VIEWS=top,plaza,north,avenue,south  (defaults: all). Pictures in test/out/v190_*.png. Prints door/deco data.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
STAGES=[int(s) for s in os.environ.get('STAGES','0,1,2,3,4,5').split(',')]
VIEWS=os.environ.get('VIEWS','top,plaza,north,avenue,south,westwall').split(',')
TAG=os.environ.get('TAG','')
def s(pg):
    L.start(pg);ev=pg.evaluate
    for st in STAGES:
        r=ev("""(st)=>{const T=TOWNS[0];bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);kfApply109(true);gold=1e7;
          ['wood','stone','fiber','iron','glowcap','bone','petals','crystal'].forEach(k=>mats[k]=9999);
          DECO103.forEach(D=>{if(SH.deco[D.k]==null)dcBuy103(D.k);SH.deco[D.k]=1});SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=1);shApply();
          let n=0;while(LOT103.some(l=>lotOpen109(l.id)&&lotFree103(l.id))&&HS103.h.length<HS103_MAX&&n++<30){const l=LOT103.find(l=>lotOpen109(l.id)&&lotFree103(l.id));if(!hsBuy103(l.id))break}
          lotSync103();dc103Sync();TOD=.32;
          const doors=[];LOT103.filter(l=>lotOpen109(l.id)).forEach(l=>{const k=lotKey103(l.id),q=lotOf103(k)||l,d=lotDoor103(q);doors.push([l.id,k,+(d[0]-T.cx).toFixed(1),+(d[1]-T.cy).toFixed(1)])});
          const fixed=TWN100_SH.map(q=>[q.k,q.s,q.z,q.x,q.ry]);
          return {st,F:kf109(),doors,steward:SHM.st&&[+(SHM.st.x-T.cx).toFixed(1),+(SHM.st.z-T.cy).toFixed(1)],sp:T.sp&&[T.sp[0]-T.cx,T.sp[1]-T.cy],
            deco:DECO103.map(D=>[D.k,(D.sp||[]).slice(0,8)]),col:Object.entries(DC103.col).map(([k,c])=>[k,c.length])}}""",st)
        print(json.dumps(r)[:4000])
        SZ=r['F']['SZ']
        V={
         'top':  "[T.cx,T.ph+%f,T.cy+%f],[T.cx,T.ph,T.cy+%f]"%(SZ+60,(SZ-20)/2+.01,(SZ-20)/2),
         'plaza':"[T.cx+9,T.ph+9,T.cy+16],[T.cx,T.ph+1,T.cy-4]",
         'north':"[T.cx,T.ph+5,T.cy+2],[T.cx,T.ph+2,T.cy-14]",
         'avenue':"[T.cx,T.ph+5,T.cy+10],[T.cx,T.ph+1.5,T.cy+%f]"%(SZ-2),
         'south':"[T.cx,T.ph+9,T.cy+%f],[T.cx,T.ph+1,T.cy+%f]"%(SZ+8,SZ-10),
         'westwall':"[T.cx+4,T.ph+5,T.cy+%f],[T.cx-19,T.ph+1.5,T.cy+%f]"%(min(SZ-2,20),-6),
        }
        for v in VIEWS:
            if v=='top' or st in (0,5) or os.environ.get('ALLV'):
                ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+8);pl.visible=false;STEP(.4);FC(%s,%s,%s)}"%(V[v].split('],[')[0]+']','['+V[v].split('],[')[1],'1' if v=='top' else '0'))
                L.shot(pg,OUT+'/v190_%s%s_s%d.png'%(TAG,v,st))
play.run(s,w=1100,hh=760)
