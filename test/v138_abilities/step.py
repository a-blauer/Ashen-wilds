# one tuning step: read measurements (base b.json, evolved e.json) under the current state (state.json: tune, evo),
# compute targets, move each factor toward its target (capped per step), write the new state and a tune JS
import json,sys,statistics as st
sys.path.insert(0,sys.argv[0].rsplit('/',1)[0])
from an2 import rows,TYPE,SIZE,EVOX
b,e,stf,outjs=sys.argv[1:5];S=json.load(open(stf)) if len(sys.argv)>5 or __import__('os').path.exists(stf) else {'tune':{},'evo':{},'Bs':None}
def avg(files):
  from collections import Counter
  A={}
  for f in files.split(','):
    for r in rows(f):A.setdefault((r['c'],r['n']),[]).append(r)
  out=[]
  for k,L in A.items():
    r=dict(L[-1]);r['V']=sum(x['V'] for x in L)/len(L);r['cat']=Counter(x['cat'] for x in L).most_common(1)[0][0];r['size']=Counter(x['size'] for x in L).most_common(1)[0][0];out.append(r)
  return out
B=avg(b);E=avg(e)
shape=lambda r:TYPE[r['cat']]*SIZE[r['size']]*(1-r['us'])
if not S.get('Bs'):S['Bs']=st.median([r['V']/shape(r) for r in B])
Bs=S['Bs'];cap=lambda x:max(.5,min(2.0,x));miss=[];BF={}
for r in B:
  T=Bs*shape(r);f=T/r['V'] if r['V']>0 else 1;cur=S['tune'].get(r['n'],r['tune']);S['tune'][r['n']]=round(cur*cap(f),4);BF[r['n']]=cap(f);miss.append(('base',r['c'],r['n'],f))
for r in E:
  T=Bs*shape(r)*EVOX;g=T/(r['V']*BF.get(r['n'],1)) if r['V']>0 else 1;cur=S['evo'].get(r['n'],1);S['evo'][r['n']]=round(cur*cap(g),4);miss.append(('evo',r['c'],r['n'],g*BF.get(r['n'],1)))
json.dump(S,open(stf,'w'),indent=0)
open(outjs,'w').write('Object.assign(KQR_TUNE,'+json.dumps(S['tune'])+');Object.assign(BAL138_EVO,'+json.dumps(S['evo'])+');')
off=[m for m in miss if abs(m[3]-1)>.12]
print('Bs %.3f  abilities %d  off by >12%%: %d'%(Bs,len(miss),len(off)))
for m in sorted(off,key=lambda m:-abs(m[3]-1))[:25]:print('   %-4s %-9s %-20s needed ×%.2f'%m)
