import json,sys
sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from an2 import rows
SZ={'small':0,'medium':1,'large':2};G=lambda c:{'single':0,'burst':1,'intermittent':1,'constant':2}[c]
for lab,f in [('BASE',sys.argv[1]),('EVOLVED',sys.argv[2])]:
  R=rows(f);print('\n######',lab)
  bad=[]
  for a in R:
    for b in R:
      if a is b or a['c']!=b['c'] or G(a['cat'])!=G(b['cat']):continue
      if b['V']>=a['V']*1.10 and SZ[b['size']]>=SZ[a['size']] and set(a['u'])<=set(b['u']):bad.append((a,b))
  print('strictly worse within a class (other has >=10% more damage per target, >= area, every extra):',len(bad))
  for a,b in bad:print('   %-9s %-20s %.3f %-6s %-16s cd %4.1f  <  %-20s %.3f %-6s %-16s cd %4.1f'%(a['c'],a['n'],a['V'],a['size'],','.join(a['u']) or '-',a['cd'],b['n'],b['V'],b['size'],','.join(b['u']) or '-',b['cd']))
  tw={}
  for r in R:tw.setdefault((r['c'],r['cat'],r['size'],tuple(sorted(r['u']))),[]).append(r)
  T=[(k,v) for k,v in tw.items() if len(v)>1]
  print('twins (same class, type, size and extras):',len(T))
  for k,v in T:print('   %-9s %-12s %-6s %-14s '%(k[0],k[1],k[2],','.join(k[3]) or '-')+' | '.join('%s %.3f cd %.1f hit %.1f'%(r['n'],r['V'],r['cd'],r['V']*r['cd']) for r in sorted(v,key=lambda r:r['cd'])))
