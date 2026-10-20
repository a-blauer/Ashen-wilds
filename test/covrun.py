# Run any harness test with V8 function coverage: COV_OUT=out/cov_x.json python3 covrun.py v38t.py [args]
# Wraps play.run so the page collects precise call counts from the first line of script; the
# counts for the game's inline script are written to COV_OUT as {"len":<script length>,"fn":[[start,end,count,name],...]}.
import sys, os, json, runpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
OUT = os.environ.get('COV_OUT', play.TMP + '/cov.json')
_orig_new_page = None

def _patch():
    import playwright.sync_api._generated as G
    orig = G.Browser.new_page
    def new_page(self, *a, **k):
        pg = orig(self, *a, **k)
        cdp = pg.context.new_cdp_session(pg)
        cdp.send('Profiler.enable')
        cdp.send('Profiler.startPreciseCoverage', {'callCount': True, 'detailed': False})
        def dump():
            try:
                r = cdp.send('Profiler.takePreciseCoverage')
            except Exception as ex:
                print('COV: take failed', ex); return
            fn = []; n = 0
            for s in r['result']:
                if 'live.html' not in s.get('url', ''): continue
                top = max(f['ranges'][0]['endOffset'] for f in s['functions'])
                if top < 1000000: continue  # the game's big inline script only
                n += 1
                for f in s['functions']:
                    r0 = f['ranges'][0]
                    if r0['count']: fn.append([r0['startOffset'], r0['endOffset'], r0['count'], f['functionName']])
            if not n: print('COV: no inline script found'); return
            src = ''
            prev = {}
            if os.path.exists(OUT):
                try: prev = json.load(open(OUT))
                except Exception: prev = {}
            json.dump({'fn': fn + prev.get('fn', [])}, open(OUT, 'w'))
            print('COV: wrote', OUT, len(fn), 'functions')
        pg._cov_dump = dump
        return pg
    G.Browser.new_page = new_page
    origb = G.Browser.close
    def close(self, *a, **k):
        for c in self.contexts:
            for pg in c.pages:
                if hasattr(pg, '_cov_dump'): pg._cov_dump()
        return origb(self, *a, **k)
    G.Browser.close = close
    origr = G.Page.reload
    def reload(self, *a, **k):
        if hasattr(self, '_cov_dump'): self._cov_dump()
        return origr(self, *a, **k)
    G.Page.reload = reload

_patch()
if os.path.exists(OUT): os.remove(OUT)
script = sys.argv[1]
sys.argv = sys.argv[1:]
runpy.run_path(script, run_name='__main__')
