# summarise a limbs_check json: unique floating parts per model
import json,sys
d=json.load(open(sys.argv[1]));skip=sys.argv[2].split(',') if len(sys.argv)>2 else []
for k,v in d.items():
    if any(s and s in k for s in skip): continue
    seen=set()
    for p in ['p0','p1','p2']:
        for b in v[p]['bad']:
            key=(b.get('kind'),b.get('bn') or b.get('b') or b.get('name'),b.get('col'),str(b.get('at')),str(b.get('sc') or b.get('geo')),b.get('t') or b.get('basic'))
            if key in seen: continue
            seen.add(key);print(k,p,key)
