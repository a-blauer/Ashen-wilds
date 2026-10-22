# Run one test line from smoke.txt / full.txt and decide pass / fail from its output (many tests print "FAIL …" but exit 0).
#   python3 ci_run.py "TITLE=1 ABIL_ONLY=1 v114_race.py"
import os,sys,subprocess,re
HERE=os.path.dirname(os.path.abspath(__file__))
line=sys.argv[1].split();env=dict(os.environ);args=[]
for p in line:
    if '=' in p and not args and not p.endswith('.py'):k,v=p.split('=',1);env[k]=v
    else:args.append(p)
known=[l.strip() for l in open(os.path.join(HERE,'ci_known_fail.txt')) if l.strip() and not l.startswith('#')]
p=subprocess.run([sys.executable]+args,cwd=HERE,env=env,capture_output=True,text=True,timeout=int(os.environ.get('CI_TIMEOUT','3000')))
out=p.stdout+'\n'+p.stderr
print(out[-20000:])
fails=[l[5:].strip() for l in out.splitlines() if l.startswith('FAIL ')]
real=[f for f in fails if not any(f.startswith(k) for k in known)]
crash=('Traceback (most recent call last)' in out) or p.returncode not in (0,)
print('\n==== %s: exit %d, %d FAIL lines (%d known), crash=%s'%(' '.join(line),p.returncode,len(fails),len(fails)-len(real),crash))
for f in real:print('  FAIL',f[:200])
sys.exit(1 if real or crash else 0)
