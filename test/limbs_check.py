# finds parts of every creature model that touch nothing connected to the body (rest + two walk poses)
# usage: SRC=.../kq.html python3 limbs_check.py [filter-regex] [out.json]
import sys,json,os,limbs_run as R
FLT=sys.argv[1] if len(sys.argv)>1 else ''
OUT=sys.argv[2] if len(sys.argv)>2 else R.TMP+'/check.json'
LIB=open(os.path.join(R.HERE,'limbs_lib.js')).read()
def s(pg):
    R.start(pg);pg.evaluate("()=>{"+LIB+"}");pg.evaluate("()=>LB.hook()")
    L=pg.evaluate("()=>LB.list()")
    import re
    L=[a for a in L if not FLT or re.search(FLT,a[1])]
    res={}
    for ty,k in L:
        r=pg.evaluate("""([ty,k])=>{const g=LB.make(ty,k);const sp=SPEC[rigOf(ty=='bs'?k.split(':')[1]:ty=='en'?(EN[k].rig||k):k)];g.__spec=sp;const o={};
          for(const p of [0,1,2]){LB.pose(g,p);g.updateMatrixWorld(true);const c=LB.check(g,.03);o['p'+p]=c}return o}""",[ty,k])
        res[ty+':'+k]=r
        nb={p:len(v['bad']) for p,v in r.items()}
        print(ty,k,'nodes',r['p0']['n'],'floating',nb,flush=True)
        for p,v in r.items():
            for b in v['bad']: print('   ',p,json.dumps(b))
    json.dump(res,open(OUT,'w'),indent=0)
R.run(s)
