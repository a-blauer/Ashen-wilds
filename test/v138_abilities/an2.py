# ability value: delivery type × area size × (1 − utility) → target damage per target per cooldown-second; factor = target / measured
import json,sys,statistics as st,re
TYPE={'single':1.0,'intermittent':.75,'burst':.75,'constant':.55};SIZE={'small':1.0,'medium':.93,'large':.85}
EVOX=1.48/0.85*1.25   # rank 5 damage, rank 5 cooldown, evolution bonus = ×2.18
COND={'Execute':1.6}
SKIP={'Poison Blades','Call of the Wild','Shadow Clone','Wild Hunt','Divine Intervention','Mana Shield','Blink','Lay on Hands','Divine Barrier','Iron Skin','Unbreakable','War Banner','Rift Gate','Time Warp','Snare Trap',"Hunter’s Focus",'Vanish','Shadow Dance','Seal of Light','Aegis','War Cry','Bloodrage'}  # measured on a full-health dummy; triple damage under 30% health
def classify(a,hp):
  H=[h for h in a['hits'] if h[2]>0]
  if not H or not a['cd']:return None
  tg=sorted(set(h[1] for h in H));near=len([i for i in tg if 1<=i<=4]);far=len([i for i in tg if i>=5])
  mt=sorted(h[0] for h in H if h[1]==0 and not h[3]);pulses=0;last=-9
  for t in mt:
    if t-last>0.15:pulses+=1
    last=t
  span=(mt[-1]-mt[0]) if mt else 0
  if len(tg)<=1 or (near==0 and far==0):cat='single'
  elif pulses>=5 and span>=2.5:cat='constant'
  elif pulses>=2:cat='intermittent'
  else:cat='burst'
  size='large' if far>=2 else 'medium' if near>=3 else 'small'
  main=sum(h[2] for h in H if h[1]==0);tot=sum(h[2] for h in H)
  per=main if cat=='single' else max(main,tot/len(tg))
  return dict(cat=cat,size=size,tg=len(tg),near=near,far=far,pulses=pulses,span=round(span,1),dmg=per,tot=tot)
def utility(a,hp,dmg):
  d=(a['d']+' '+a['ty']+' '+a.get('ed','')).lower();u={}
  st_=a['st']
  if 'stun' in st_ or 'freeze' in d or 'stun' in d:u['stun']=.15 if len(st_.get('stun',{}))>=3 else .12
  if 'root' in st_ or re.search(r'\broot',d):u['root']=.10
  if ('slow' in st_ and len(st_['slow'])>=4) or re.search(r'\bslow',d):u['slow']=.05
  if 'weak' in st_ or a['mark']>=2 or re.search(r'weaken|take \d+% more|marks?\b|vulnerab',d):u['debuff']=.12
  if a['n']=='Death Mark':u['debuff']=.40   # the mark raises all your damage: it is the ability's main value
  if re.search(r'\bpull|drag|draws? (enemies|them)|to your feet',d):u['pull']=.06
  if re.search(r'knock|shove',d):u['knock']=.04
  if re.search(r'silenc|interrupt',d):u['silence']=.05
  if a['mv']>=2.5 or re.search(r'mobility|teleport|charge|leap|dash|blink',d):u['move']=.08
  if a['iv']>=1.0 or a['sh']>0.08*hp or (a['heal']>=0.15*hp and a['heal']>=0.15*max(1,dmg)) or re.search(r'untouchable|invulner|damage reduction',d):u['defence']=.12
  return u,min(.40,sum(u.values()))
def rows(path):
  R=json.load(open(path));out=[]
  for C in R:
    norm=C['atk0']*(1+C['sP'])*C.get('evoc',1)   # evolved casts: the per-class factor (BAL138_EVOC) is a class knob, not the ability's value
    for a in C['ab']:
      if a['n'] in SKIP:continue
      k=classify(a,C['hp'])
      if not k:continue
      u,us=utility(a,C['hp'],k['tot'])
      V=k['dmg']/norm/a['cd']*COND.get(a['n'],1)
      out.append(dict(c=C['c'],n=a['n'],V=V,u=u,us=us,cd=a['cd'],tune=a['tune'],en=a.get('en',''),**k))
  return out
if __name__=='__main__':
  B=rows(sys.argv[1]);E=rows(sys.argv[2]) if len(sys.argv)>2 else []
  shape=lambda r:TYPE[r['cat']]*SIZE[r['size']]*(1-r['us'])
  Bs=st.median([r['V']/shape(r) for r in B]);print('single-target rate Bs = %.3f per second of cooldown, per attack'%Bs)
  F={}
  for r in B:r['T']=Bs*shape(r);r['f']=r['T']/r['V'];F[(r['c'],r['n'])]=r
  print('%-9s %-20s %-12s %-6s util %-30s V %.5s  target  factor'%('class','ability','type','size','','     '))
  for r in sorted(B,key=lambda r:(r['c'],-r['f'])):print('%-9s %-20s %-12s %-6s %.2f %-30s %.3f  %.3f  ×%.2f'%(r['c'],r['n'],r['cat'],r['size'],r['us'],','.join(r['u']),r['V'],r['T'],r['f']))
  if E:
    print('\n== evolved')
    for r in E:
      b=F.get((r['c'],r['n']));r['T']=Bs*shape(r)*EVOX;r['g']=r['T']/(r['V']*(b['f'] if b else 1))
    for r in sorted(E,key=lambda r:(r['c'],-r['g'])):print('%-9s %-20s→ %-18s %-12s %-6s %.2f %-26s V %.3f target %.3f  evo-factor ×%.2f'%(r['c'],r['n'],r['en'][:18],r['cat'],r['size'],r['us'],','.join(r['u']),r['V'],r['T'],r['g']))
  json.dump({'Bs':Bs,'B':B,'E':E},open(sys.argv[1].replace('.json','_an.json'),'w'))
