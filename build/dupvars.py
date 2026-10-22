# Flags a top-level `var NAME=` declared in two different src/js files (a repeated top-level const/let is already a syntax error). Later files win in this game, so a new
# file that reuses an old name silently replaces it (v116: the co-op `var KQN={…}` wiped the ability table KQN).
# Intentional re-declarations are listed in build/dupvars_ok.txt. Exit 1 on a new duplicate.
import re,os,sys,glob
src=sys.argv[1] if len(sys.argv)>1 else 'src/js'
ok=set(l.strip() for l in open(os.path.join(os.path.dirname(__file__),'dupvars_ok.txt')) if l.strip() and not l.startswith('#')) if os.path.exists(os.path.join(os.path.dirname(__file__),'dupvars_ok.txt')) else set()
seen={};bad=[]
rx=re.compile(r'^var\s+([A-Za-z_$][\w$]*)\s*=(?!\s*\1\s*\|\|)',re.M)  # `var X=X||…` re-uses X on purpose
for f in sorted(glob.glob(os.path.join(src,'*.js'))):
    for n in set(rx.findall(open(f).read())):
        if n in seen and seen[n]!=f and n not in ok:bad.append((n,os.path.basename(seen[n]),os.path.basename(f)))
        seen.setdefault(n,f)
for n,a,b in bad:print('DUPVAR %s declared in %s and again in %s'%(n,a,b))
print('DUPVARS_OK' if not bad else 'DUPVARS: %d duplicate top-level names'%len(bad))
sys.exit(1 if bad else 0)
