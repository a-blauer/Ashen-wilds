# Run a test suite on this machine. (GitHub Actions is the faster way since Oct 25 2026: tools/ci.sh; see CLAUDE.md.)
#   python3 run_suite.py smoke        # test/smoke.txt
#   python3 run_suite.py full         # test/full.txt
#   python3 run_suite.py full v57t.py v60t.py   # only these lines of the suite
#   python3 run_suite.py changed      # smoke + the tests test/affects.txt maps the changed files to (vs origin/main,
#                                     # committed or not); the whole full suite if a core file changed
#   python3 run_suite.py changed HEAD~3   # compare with another base instead
#   python3 run_suite.py changed --list   # only print which tests it would run
#   JOBS=2 python3 run_suite.py full  # two tests at once (only on a machine with 4+ cores)
# Tests run against a snapshot of dist/ (taken at start), so rebuilding meanwhile doesn't change what is tested.
# Tests run in fast mode (fast.py: the game view draws only for screenshots); FAST=0 before a line or the command turns it off.
# Each line goes through ci_run.py (same pass/fail rules and known-fail list as the old cloud runs).
# Progress: test/out/suite/<suite>.log ; summary: test/out/suite/<suite>.summary.txt ; exit 1 if anything failed.
import os,sys,subprocess,shutil,time
from concurrent.futures import ThreadPoolExecutor
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE)
suite=sys.argv[1] if len(sys.argv)>1 else 'smoke';only=sys.argv[2:]
def suite_lines(n):return [l.strip() for l in open(os.path.join(HERE,n+'.txt')) if l.strip() and not l.startswith('#')]
def changed_lines(base):
    import re
    git=lambda *a:subprocess.run(['git']+list(a),cwd=ROOT,capture_output=True,text=True).stdout.split()
    mb=(git('merge-base',base,'HEAD') or [base])[0]
    files=sorted(set(git('diff','--name-only',mb)+git('ls-files','--others','--exclude-standard')))
    full=suite_lines('full');byname={l.split()[-1]:l for l in full};want=set(l.split()[-1] for l in suite_lines('smoke'))
    rules=[]
    for l in open(os.path.join(HERE,'affects.txt')):
        if l.strip() and not l.startswith('#') and ':' in l:
            k,v=l.split(':',1);rules.append((k.strip(),v.split()))   # patterns never contain ':'
    why=[]
    for f in files:
        if not (f.startswith('src/') or f.startswith('test/') or f.startswith('viewer/') or f=='build.sh'):continue
        for k,ts in rules:
            if k=='FULL':
                if re.search(' '.join(ts),f,re.I):why.append(f+' -> full suite');return full,files,why
            elif re.search(k,f,re.I):want.update(ts);why.append('%s -> %s'%(f,' '.join(ts)))
        if f.startswith('test/') and os.path.basename(f) in byname:want.add(os.path.basename(f))
    return [l for l in full if l.split()[-1] in want],files,why
if '--json' in only:   # the GitHub workflow's test list: the suite's lines as a JSON array, nothing else
    import json;only=[a for a in only if a!='--json']
    lines=changed_lines(only[0] if only else 'origin/main')[0] if suite=='changed' else suite_lines(suite)
    print(json.dumps(lines));sys.exit(0)
if suite=='changed':
    lst='--list' in only;only=[a for a in only if a!='--list']
    lines,files,why=changed_lines(only[0] if only else 'origin/main');only=[]
    print('changed files: %d'%len(files));[print('  '+w) for w in why]
    print('tests: '+', '.join(l.split()[-1] for l in lines))
    if lst:sys.exit(0)
else:lines=suite_lines(suite)
if only:lines=[l for l in lines if l.split()[-1] in only]
OUT=os.path.join(HERE,'out','suite');os.makedirs(OUT,exist_ok=True)
snap=os.path.join(OUT,'dist');shutil.rmtree(snap,ignore_errors=True)
os.makedirs(snap);shutil.copy(os.path.join(ROOT,'dist','ashen-wilds.html'),snap)
for f in ('kq-anim-viewer.html',):
    p=os.path.join(ROOT,'dist',f)
    if os.path.exists(p):shutil.copy(p,snap)
log=open(os.path.join(OUT,suite+'.log'),'w')
def say(s):
    print(s,flush=True);log.write(s+'\n');log.flush()
say('suite %s: %d tests, build %s'%(suite,len(lines),time.ctime(os.path.getmtime(os.path.join(snap,'ashen-wilds.html')))))
def tagged(tag):
    """Processes carrying this test's KQ_RUN marker (browsers inherit it, even once orphaned by a crash)."""
    out,me=[],os.getpid()
    for d in os.listdir('/proc'):
        if not d.isdigit() or int(d)==me:continue
        try:
            if tag.encode() in open('/proc/%s/environ'%d,'rb').read():out.append(int(d))
        except OSError:pass
    return out
def run(i_line):
    i,line=i_line;t0=time.time()
    tmp=os.path.join(OUT,'run%d'%i);os.makedirs(tmp,exist_ok=True)
    env=dict(os.environ,KQ_RUN='KQ_RUN=%d-%d-%d'%(os.getpid(),i,time.time()),FAST=os.environ.get('FAST','1'),SRC=os.path.join(snap,'ashen-wilds.html'),AW_TMP=tmp)
    # own process group, so the test's browser is shut down with it even after a crash or timeout
    # (leftover browsers from crashed tests used to pile up and slow every later test)
    p=subprocess.Popen([sys.executable,'ci_run.py',line],cwd=HERE,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,start_new_session=True)
    try:
        out=p.communicate(timeout=int(os.environ.get('CI_TIMEOUT','3000'))+120)[0];ok=p.returncode==0
    except subprocess.TimeoutExpired:
        out='TIMEOUT';ok=False
    finally:
        import signal
        for q in tagged(env['KQ_RUN']):   # the test's browser too, even if a crash orphaned it
            try:os.kill(q,signal.SIGKILL)
            except ProcessLookupError:pass
        p.wait()
    open(os.path.join(OUT,'%02d_%s.txt'%(i,line.split()[-1])),'w').write(out)
    tail=[l for l in out.splitlines() if l.startswith('====') or l.startswith('  FAIL')][:12]
    say('%s %-34s %4ds  %s'%('PASS' if ok else 'FAIL',line,time.time()-t0,' | '.join(tail)[:400]))
    return line,ok
with ThreadPoolExecutor(int(os.environ.get('JOBS','1'))) as ex:res=list(ex.map(run,enumerate(lines)))
bad=[l for l,ok in res if not ok]
summ='%s: %d/%d passed%s'%(suite,len(res)-len(bad),len(res),('; failed: '+', '.join(bad)) if bad else '')
say(summ);open(os.path.join(OUT,suite+'.summary.txt'),'w').write(summ+'\n')
sys.exit(1 if bad else 0)
