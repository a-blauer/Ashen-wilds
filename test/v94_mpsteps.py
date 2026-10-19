# v94: co-op partners see each other's hero look.   python3 mpt.py v94_mpsteps.py
B.evaluate("()=>{hero.look={skin:'#7a4a2a',hair:'#c8c8c8',hairStyle:3,face:3,eye:'#8a2a2a',build:2,height:1.05,sex:1};heroRebuild()}")
for pg in (A,B): pg.evaluate("()=>{const p=PMAP[0].path[40];toPos(p[0]+(hero.cls=='mage'?1.5:0),p[1])}")
A.wait_for_timeout(6000)
r=A.evaluate("""()=>{const k=Object.keys(MP.rh);if(!k.length)return 'no partner';const m=MP.rh[k[0]].m;if(!m)return 'no model';const b=m.children.find(o=>o.isSkinnedMesh&&!o.dk);
  return {look:m.mdLook,key:m._mdKey,scale:+b.scale.y.toFixed(3)}}""")
print('PARTNER',r)
print('CHECK', 'OK' if isinstance(r,dict) and r.get('look') and r['look']['hairStyle']==3 and r['look']['sex']==1 and abs(r['scale']-1.05)<.01 else 'FAIL')
