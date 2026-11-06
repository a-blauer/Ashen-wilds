# v202 co-op: Lord Vaelric's new form is built the same on both partners' screens. Two windows (host A, guest B) each build the
# boss model through the registry (SVB[5].build, the path the den uses on every client) and compare the frame (hips, knees,
# neck) and a checksum of every vertex: equal on both, and the v202 form applied (hips 2.08, not v201's 1.8).
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
  const y=k=>{const p=new THREE.Vector3();R.J[k].getWorldPosition(p);return +p.y.toFixed(3)};
  return {v202:!!R.v202,hips:y('hips'),knee:y('knL'),neck:y('neck'),sum:+s.toFixed(2),n}}"""
ha=A.evaluate(JS);gu=B.evaluate(JS)   # (not a / b: mpt.py's browser is `b`)
print('host',json.dumps(ha));print('guest',json.dumps(gu))
chk('host builds the v202 form',ha['v202'] and abs(ha['hips']-2.08)<.01,ha['hips'])
chk('guest builds the v202 form',gu['v202'] and abs(gu['hips']-2.08)<.01,gu['hips'])
chk('same frame on both',ha['hips']==gu['hips'] and ha['knee']==gu['knee'] and ha['neck']==gu['neck'])
chk('same mesh on both (vertex checksum)',ha['n']==gu['n'] and abs(ha['sum']-gu['sum'])<1e-3,'%s / %s'%(ha['sum'],gu['sum']))
print('==== v202_coop: %d fails'%len(fails))
