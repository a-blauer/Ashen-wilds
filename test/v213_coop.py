# v213 co-op: Argus' new skinned body, his eyes and his gait are the same on both partners' screens. Two windows (host A, guest B)
# each build the boss through the registry (SVB[0].build, the path the den uses on every client) and compare the frame, a checksum
# of every vertex (skinned layers, eyes), the eye count, and the gait / smoothing output for the same speed and time (deterministic:
# no Math.random in the build or the motion; the moves themselves are relayed by the region host as before).
# Run: python3 mpt.py v213_coop.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
JS=r"""()=>{const R=svRig();SVB[0].build(R,null);svRest(R);svMerge(R);R.root.updateMatrixWorld(true);const v=new THREE.Vector3();let s=0,n=0;
  R.root.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position,C=o.geometry.attributes.color;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);if(!o.isSkinnedMesh)v.applyMatrix4(o.matrixWorld);s+=v.x*1.3+v.y*2.7+v.z*3.1+(C?C.getX(i)*.7+C.getY(i)*.3:0);n++}});
  const y=k=>{const w=new THREE.Vector3();R.J[k].getWorldPosition(w);return +w.y.toFixed(3)};
  const S={spd:2.6,ph:1,R},O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];let g=0;for(let f=0;f<60;f++){for(const k in O)O[k].fill(0);arg213Loco(null,S,O,.016,1e5+f*16)}for(const k in O)O[k].forEach((x,q)=>g+=x*(q+1));
  return {v213:!!R.v213,hips:y('hips'),knee:y('knL'),neck:y('neck'),eyes:R.eyes.length,sum:+s.toFixed(2),n,gait:+g.toFixed(5)}}"""
ha=A.evaluate(JS);gu=B.evaluate(JS)   # (not a / b: mpt.py's browser is `b`)
print('host',json.dumps(ha));print('guest',json.dumps(gu))
chk('host builds the v213 body',ha['v213'] and ha['n']>10000,ha['hips'])
chk('guest builds the v213 body',gu['v213'] and gu['n']>10000,gu['hips'])
chk('same frame on both',ha['hips']==gu['hips'] and ha['knee']==gu['knee'] and ha['neck']==gu['neck'])
chk('same eyes on both',ha['eyes']==gu['eyes'] and ha['eyes']>=20,'%s / %s'%(ha['eyes'],gu['eyes']))
chk('same mesh and paint on both (checksum)',ha['n']==gu['n'] and abs(ha['sum']-gu['sum'])<1e-3,'%s / %s'%(ha['sum'],gu['sum']))
chk('same gait on both',abs(ha['gait']-gu['gait'])<1e-6,'%s / %s'%(ha['gait'],gu['gait']))
print('==== v213_coop: %d fails'%len(fails))
