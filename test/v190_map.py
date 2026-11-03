# v190: an ASCII map of Duskhold (town-local, 0.5 tiles per char): # solid tile, o other collider, a letter per decoration's
#   collider (legend printed), D door spot, S Steward, C Cheddar, + spawn. STAGE=5 (default), EMPTY=1: no buildings.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
ST=int(os.environ.get('STAGE','5'))
def s(pg):
    L.start(pg);ev=pg.evaluate
    r=ev("""([st,empty])=>{const T=TOWNS[0];bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);kfApply109(true);gold=1e7;
      ['wood','stone','fiber','iron','glowcap','bone','petals','crystal'].forEach(k=>mats[k]=9999);
      DECO103.forEach(D=>{if(SH.deco[D.k]==null)dcBuy103(D.k);SH.deco[D.k]=1});
      if(!empty){SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=1);shApply();
        let n=0;while(LOT103.some(l=>lotOpen109(l.id)&&lotFree103(l.id))&&HS103.h.length<HS103_MAX&&n++<30){const l=LOT103.find(l=>lotOpen109(l.id)&&lotFree103(l.id));if(!hsBuy103(l.id))break}}
      lotSync103();dc103Sync();
      const F=kf109(),leg={},keys=DECO103.map(D=>D.k),ch='abcdefghijklmnopqrstuvwxyzABEFGHIJKLMNOPQRTUVWXYZ0123456789';keys.forEach((k,i)=>leg[ch[i]]=k);
      const own=new Map();for(const k in DC103.col)DC103.col[k].forEach(c=>own.set(c,ch[keys.indexOf(k)]));
      const inC=(c,x,z)=>c.r!=null?Math.hypot(x-c.x,z-c.z)<c.r:Math.abs(x-c.x)<c.hx&&Math.abs(z-c.z)<c.hz;
      const doors=LOT103.filter(l=>lotOpen109(l.id)).map(l=>{const k=lotKey103(l.id),q=(k&&lotOf103(k))||l;return lotDoor103(q)});
      const rows=[];for(let z=-21;z<=F.SZ+1;z+=.5){let s='';for(let x=-21;x<=21;x+=.5){const X=T.cx+x,Z=T.cy+z;let c='.';
        if(Math.abs(x)<.26&&Math.abs(z-8.4)<.26)c='+';
        else if(doors.some(d=>Math.hypot(d[0]-X,d[1]-Z)<.4))c='D';
        else if(SHM.st&&Math.hypot(SHM.st.x-X,SHM.st.z-Z)<.5)c='S';
        else{const hc=T.col.find(q=>inC(q,X,Z));if(hc)c=own.get(hc)||'o';else if(solid(X,Z))c='#'}
        s+=c}rows.push((z%5==0?String(z).padStart(4):'    ')+' '+s)}
      return {leg,rows,F}}""",[ST,bool(os.environ.get('EMPTY'))])
    print(json.dumps(r['F']),json.dumps(r['leg']))
    print('     x:-21'+' '*36+'0'+' '*39+'21')
    print('\n'.join(r['rows']))
play.run(s)
