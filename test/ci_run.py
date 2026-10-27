# Run one test line from smoke.txt / full.txt and decide pass / fail from its output (many tests print "FAIL …" but exit 0).
#   python3 ci_run.py "TITLE=1 ABIL_ONLY=1 v114_race.py"
import os,sys,subprocess,re
HERE=os.path.dirname(os.path.abspath(__file__))
line=sys.argv[1].split();env=dict(os.environ);args=[]
for p in line:
    if '=' in p and not args and not p.endswith('.py'):k,v=p.split('=',1);env[k]=v
    else:args.append(p)
known=[l.strip() for l in open(os.path.join(HERE,'ci_known_fail.txt')) if l.strip() and not l.startswith('#')]
pre=['fast.py'] if env.get('FAST')=='1' else []   # fast.py: no drawing except for screenshots
T=' '.join(line)
def kill_tagged(tag):
    """The attempt's leftover browsers (they inherit its KQ_ATT marker, even once a crash orphaned them)."""
    import signal
    for d in os.listdir('/proc'):
        if not d.isdigit() or int(d)==os.getpid():continue
        try:
            if tag.encode() in open('/proc/%s/environ'%d,'rb').read():os.kill(int(d),signal.SIGKILL)
        except (OSError,ProcessLookupError):pass
def attempt(n):
    """One run of the test: (output, real FAIL lines, crashed?)"""
    e=dict(env,KQ_ATT='KQ_ATT=%d-%d'%(os.getpid(),n))
    try:
        p=subprocess.run([sys.executable]+pre+args,cwd=HERE,env=e,capture_output=True,text=True,timeout=int(os.environ.get('CI_TIMEOUT','3000')))
        out,rc=p.stdout+'\n'+p.stderr,p.returncode
    except subprocess.TimeoutExpired as x:
        out,rc=((x.stdout or b'').decode('utf8','replace') if isinstance(x.stdout,bytes) else (x.stdout or ''))+'\nTIMEOUT',-9
    finally:kill_tagged(e['KQ_ATT'])
    fails=[l[5:].strip() for l in out.splitlines() if l.startswith('FAIL ')]
    real=[f for f in fails if not any(f.startswith(k) for k in known)]
    crash=('Traceback (most recent call last)' in out) or rc!=0
    return out,rc,fails,real,crash
# Owner's request (Oct 27 2026): a test that fails is run once more (CI_RETRY, default 1 retry); passing on the second try counts as a
# pass, marked "passed on retry" (a flaky test: the summary lists it). A real failure fails both tries.
tries=int(os.environ.get('CI_RETRY','1'))+1;first=None
for n in range(tries):
    out,rc,fails,real,crash=attempt(n)
    if not (real or crash):break
    if n==0:first=(real,crash,[l for l in out.splitlines() if 'Error' in l or 'Timeout' in l or 'TIMEOUT' in l][-2:])
    if n<tries-1:print('---- %s failed (try %d): %s; trying again'%(T,n+1,' | '.join(real[:3])[:300] or 'crash'),flush=True)
print(out[-20000:])
ok=not (real or crash)
print('\n==== %s: exit %d, %d FAIL lines (%d known), crash=%s%s'%(T,rc,len(fails),len(fails)-len(real),crash,
      ' · passed on retry (first try: %s)'%((' | '.join(first[0][:2]) or ('crash: '+' | '.join(first[2]) if first[2] else 'crash'))[:220]) if ok and first else ''))
for f in real:print('  FAIL',f[:200])
# GitHub annotations (readable through the API, unlike the raw log)
if ok and first:print('::warning title=%s flaky::passed on retry; first try: %s'%(T,(' | '.join(first[0][:3]) or 'crash')[:300].replace('\n',' ')))
for f in real[:10]:print('::error title=%s::%s'%(T,f[:300].replace('\n',' ')))
if crash:
    tb=[l for l in out.splitlines() if 'Error' in l or 'Timeout' in l or 'Traceback' in l][-3:]
    print('::error title=%s crashed::%s'%(T,' | '.join(tb)[:600]))
sys.exit(0 if ok else 1)
