# v106 co-op: the region host and the shared monsters are per zone instance. Run: python3 mpt.py mp_v106.py
import json
def at(pg,k,i):pg.evaluate("([k,i])=>{const I=PMAP[0].ins[k],p=I.path[i];toPos(p[0],p[1])}",[k,i])
st=lambda pg:pg.evaluate("()=>[MP.rg,MP.others,MP.host===MP.me,enemies.filter(e=>e.mir&&!e.dead).length,enemies.filter(e=>!e.mir&&!e.dead&&e.slot).length]")
at(A,0,60);at(B,1,60);A.wait_for_timeout(6000)
a,b=st(A),st(B);print('apart A',a,'B',b);ok1=a[0]==0 and b[0]==1 and a[1]==0 and b[1]==0 and a[2] and b[2] and a[3]==0 and b[3]==0
at(A,1,60);A.wait_for_timeout(8000)
a,b=st(A),st(B);print('together A',a,'B',b);ok2=a[0]==1 and b[0]==1 and a[1]==1 and b[1]==1 and (a[2]!=b[2]) and ((a[3]>0) or (b[3]>0))
print('MP106', 'PASS' if ok1 and ok2 else 'FAIL',ok1,ok2)
