# v199: the town portals show their prompt (F · Enter ... / sealed) and the inn's bar no longer hides the innkeeper.
# Prints FAIL lines on a wrong result; SHOTS=1 also writes out/v199_inn_*.png.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP
def s(pg):
    L.start(pg);ev=pg.evaluate;fails=[]
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    # 1) portals: Portal I open, II..VI sealed (and their entry seals tell who must fall); then all open
    r=ev("""()=>{const out=[];const at=(x,z)=>{toPos(x,z);STEP(.1);promptTick();return PR&&PR.label||null};
      bossDone.clear();KF109.s=-1;kfApply109(true);portalRefresh();
      PORT.forEach(Q=>out.push(['locked',Q.i,at(Q.x,Q.z+1.5)]));
      DM196P.seal.forEach(S=>{if(S&&!S.open)out.push(['seal',S.i,at(S.x-dm196EntF(S.i).f[0]*2.2,S.z-dm196EntF(S.i).f[1]*2.2)])});
      for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true);portalRefresh();
      PORT.forEach(Q=>out.push(['open',Q.i,at(Q.x,Q.z+1.5)]));
      const T=TOWNS[0];out.push(['tavern',-1,at(T.tv[0],T.tv[1])]);out.push(['plaza',-1,at(T.cx,T.cy+8)]);return out}""")
    for k,i,lab in r:
        print('PROMPT',k,i,lab)
        if k=='locked' and i==0 and not (lab or '').startswith('F · Enter'):fails.append('portal I has no enter prompt: %r'%lab)
        if k=='locked' and i>0 and 'Sealed' not in (lab or '') and 'sealed' not in (lab or ''):fails.append('sealed portal %d shows %r'%(i,lab))
        if k=='seal' and 'sealed' not in (lab or ''):fails.append('entry seal %d shows %r'%(i,lab))
        if k=='open' and not (lab or '').startswith('F · '):fails.append('open portal %d shows %r'%(i,lab))
        if k=='tavern' and 'Rest at' not in (lab or ''):fails.append('tavern rest prompt lost: %r'%lab)
        if k=='plaza' and lab and ('Enter' in lab or 'sealed' in lab or 'Sealed' in lab):fails.append('portal prompt leaks into the plaza: %r'%lab)
    # 2) the inn: the counter top against the innkeeper's shoulders (bind pose bones) and the floor
    r=ev("""()=>{const T=TOWNS[0],k=DM196I.keeper;k.updateMatrixWorld(true);const g=k.children[0],ys={};
      if(g&&g.bones)['head','neck','chest','pelvis'].forEach(n=>{const b=g.bones[n];if(b){const v=new THREE.Vector3();b.getWorldPosition(v);ys[n]=+(v.y-T.ph).toFixed(2)}});
      return {bones:ys,bar:DM196I.barTop,keeperFoot:+(k.position.y-T.ph).toFixed(2),vis:k.visible&&(!g||g.visible)}}""")
    print('INN',json.dumps(r))
    b=r['bones'];bar=r.get('bar')
    if bar is None:fails.append('DM196I.barTop not set')
    elif 'chest' in b and bar>b['chest']-.05:fails.append('bar top %.2f hides the innkeeper (chest %.2f)'%(bar,b['chest']))
    if abs(r['keeperFoot'])>.05:fails.append('innkeeper floats or sinks %.2f'%r['keeperFoot'])
    if not r['vis']:fails.append('innkeeper hidden')
    if os.environ.get('SHOTS'):
        ev("()=>{const T=TOWNS[0],l=dm196Fix('inn');window.FCAM=null;const [x,z]=lotW103(l,0,1.5);toPos(x,z,l.ry+Math.PI);STEP(.5);const [cx,cz]=lotW103(l,1.0,3.6),[tx,tz]=lotW103(l,-1.5,-1.6);FC([cx,T.ph+3.6,cz],[tx,T.ph+1.2,tz])}");L.shot(pg,OUT+'/v199_inn_in.png')
        ev("()=>{const T=TOWNS[0],l=dm196Fix('inn');const [x,z]=lotW103(l,-2.6,1.2);toPos(x,z,l.ry+Math.PI);STEP(.3);const [cx,cz]=lotW103(l,-2.4,1.6),[tx,tz]=lotW103(l,-3.0,-2.6);FC([cx,T.ph+2.4,cz],[tx,T.ph+1.1,tz])}");L.shot(pg,OUT+'/v199_inn_bar.png')
    for f in fails:print('FAIL',f)
    print('V199', 'OK' if not fails else 'FAILED %d'%len(fails))
play.run(s)
