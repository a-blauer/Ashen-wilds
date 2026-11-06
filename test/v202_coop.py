# v202 co-op: Lord Vaelric's cage body and his strike poses are the same on both partners' screens. Two windows (host A, guest
# B) each build the boss through the registry (SVB[5].build, the path the den uses on every client) and compare the frame
# (hips, knees, neck), a checksum of every vertex and of the strike poses: equal on both, and the v202 body on both.
# Run: python3 mpt.py v202_coop.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
JS=r"""()=>{const R=svRig();SVB[5].build(R,null);svRest(R);svMerge(R);R.root.updateMatrixWorld(true);const v=new THREE.Vector3();let s=0,n=0;
  R.root.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);s+=v.x*1.3+v.y*2.7+v.z*3.1;n++}});
  let p=0;['s1Cut','s2Cut','thHit','lGo','rCut','dmOut','cRec'].forEach((k,i)=>{const P=VLRP[k]||{};for(const j in P)P[j].forEach((x,q)=>p+=x*(i+1)*(q+2))});
  const y=k=>{const w=new THREE.Vector3();R.J[k].getWorldPosition(w);return +w.y.toFixed(3)};
  return {v202:!!R.v202,hips:y('hips'),knee:y('knL'),neck:y('neck'),sum:+s.toFixed(2),n,pose:+p.toFixed(4)}}"""
ha=A.evaluate(JS);gu=B.evaluate(JS)   # (not a / b: mpt.py's browser is `b`)
print('host',json.dumps(ha));print('guest',json.dumps(gu))
chk('host builds the v202 body',ha['v202'] and ha['n']>1000,ha['hips'])
chk('guest builds the v202 body',gu['v202'] and gu['n']>1000,gu['hips'])
chk('same frame on both',ha['hips']==gu['hips'] and ha['knee']==gu['knee'] and ha['neck']==gu['neck'])
chk('same mesh on both (vertex checksum)',ha['n']==gu['n'] and abs(ha['sum']-gu['sum'])<1e-3,'%s / %s'%(ha['sum'],gu['sum']))
chk('same strike poses on both',abs(ha['pose']-gu['pose'])<1e-6,'%s / %s'%(ha['pose'],gu['pose']))
print('==== v202_coop: %d fails'%len(fails))
