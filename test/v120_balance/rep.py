import json,sys
R=json.load(open(sys.argv[1]))
ID={'gs':'bal','ga':'grp','axes':'one','halberd':'grp','mace':'bal','hammer':'grp','flail':'grp','dagger':'one','claws':'one','knives':'grp','bow':'one','crossbow':'bal','sling':'bal','staff':'bal','wand':'one','orb':'grp'}
TG={'one':(8,-8),'grp':(-8,8),'bal':(0,0)};TGO={'orb':(-12,12)}
W=R['w'];LV=sorted(set(r['L'] for r in W))
keys=[];[keys.append((r['c'],r['wt'])) for r in W if (r['c'],r['wt']) not in keys]
f1=lambda r:r['r1']['dps'];f2=lambda r:r['r2']['dps']+r['r2']['xdps'];fb=lambda r:r['b']['dps'];fe=lambda r:r['ehp']
def pct(f):
  avg={L:sum(f(r) for r in W if r['L']==L)/len([r for r in W if r['L']==L]) for L in LV}
  return {k:[100*(f(next(r for r in W if r['L']==L and (r['c'],r['wt'])==k))/avg[L]-1) for L in LV] for k in keys}
P1,P2,PB=pct(f1),pct(f2),pct(fb)
print('levels',LV,'   one-enemy % per level | group % per level | avg one/grp | target | miss')
bad=0
for k in keys:
  i=ID[k[1]];t=TGO.get(k[1],TG[i]);a1=sum(P1[k])/len(LV);a2=sum(P2[k])/len(LV);m=max(abs(a1-t[0]),abs(a2-t[1]))
  flag='  <<' if m>8 else ''
  if m>8:bad+=1
  print('%-9s %-8s %-3s '%(k[0],k[1],i)+' '.join('%+4.0f'%x for x in P1[k])+' | '+' '.join('%+4.0f'%x for x in P2[k])+' | %+4.0f %+4.0f | %+3d %+3d | %4.1f%s'%(a1,a2,t[0],t[1],m,flag))
print('off-target:',bad)
# class view: average over its weapons
for c in ['warrior','paladin','assassin','ranger','mage']:
  ks=[k for k in keys if k[0]==c]
  if not ks:continue
  print('%-9s one %+4.0f  grp %+4.0f  basic %+4.0f  toughness(hits) %s'%(c,sum(sum(P1[k]) for k in ks)/len(ks)/len(LV),sum(sum(P2[k]) for k in ks)/len(ks)/len(LV),sum(sum(PB[k]) for k in ks)/len(ks)/len(LV),
    ' '.join('%.1f'%(sum(fe(r) for r in W if r['c']==c and r['L']==L)/len(ks)) for L in LV)))
if R.get('comp'):
  import statistics as st;C=R['comp'];med=st.median([r['he']/r['cd'] for r in C])
  print('companion spells: per-s vs median (single)  [group extra]')
  for r in sorted(C,key=lambda r:-r['he']/r['cd']):print('   %-18s x%.2f  [+%.1f hits on 3 others]'%(r['n'],r['he']/r['cd']/med,r['hx']))
