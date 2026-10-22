# Run a test suite on this machine instead of GitHub Actions (owner's request, Oct 2026: Actions minutes ran out).
#   python3 run_suite.py smoke        # test/smoke.txt
#   python3 run_suite.py full         # test/full.txt
#   python3 run_suite.py full v57t.py v60t.py   # only these lines of the suite
#   JOBS=2 python3 run_suite.py full  # two tests at once (only on a machine with 4+ cores)
# Tests run against a snapshot of dist/ (taken at start), so rebuilding meanwhile doesn't change what is tested.
# Tests run in fast mode (fast.py: the game view draws only for screenshots); FAST=0 before a line or the command turns it off.
# Each line goes through ci_run.py (same pass/fail rules and known-fail list as the old cloud runs).
# Progress: test/out/suite/<suite>.log ; summary: test/out/suite/<suite>.summary.txt ; exit 1 if anything failed.
import os,sys,subprocess,shutil,time
from concurrent.futures import ThreadPoolExecutor
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE)
suite=sys.argv[1] if len(sys.argv)>1 else 'smoke';only=sys.argv[2:]
lines=[l.strip() for l in open(os.path.join(HERE,suite+'.txt')) if l.strip() and not l.startswith('#')]
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
def run(i_line):
    i,line=i_line;t0=time.time()
    tmp=os.path.join(OUT,'run%d'%i);os.makedirs(tmp,exist_ok=True)
    env=dict(os.environ,FAST=os.environ.get('FAST','1'),SRC=os.path.join(snap,'ashen-wilds.html'),AW_TMP=tmp)
    try:
        p=subprocess.run([sys.executable,'ci_run.py',line],cwd=HERE,env=env,capture_output=True,text=True,timeout=int(os.environ.get('CI_TIMEOUT','3000'))+120)
        out=p.stdout+p.stderr;ok=p.returncode==0
    except subprocess.TimeoutExpired:
        out='TIMEOUT';ok=False
    open(os.path.join(OUT,'%02d_%s.txt'%(i,line.split()[-1])),'w').write(out)
    tail=[l for l in out.splitlines() if l.startswith('====') or l.startswith('  FAIL')][:12]
    say('%s %-34s %4ds  %s'%('PASS' if ok else 'FAIL',line,time.time()-t0,' | '.join(tail)[:400]))
    return line,ok
with ThreadPoolExecutor(int(os.environ.get('JOBS','1'))) as ex:res=list(ex.map(run,enumerate(lines)))
bad=[l for l,ok in res if not ok]
summ='%s: %d/%d passed%s'%(suite,len(res)-len(bad),len(res),('; failed: '+', '.join(bad)) if bad else '')
say(summ);open(os.path.join(OUT,suite+'.summary.txt'),'w').write(summ+'\n')
sys.exit(1 if bad else 0)
