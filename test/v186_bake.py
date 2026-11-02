# v186: re-bake only some hero attack moves from test/v100_anim_moves.js and splice their lines into
# src/js/1705-v100-anim-baked-keys.js (the other moves stay byte for byte; a full BAKE=1 v100_anim.py nudges every move).
#   MOVES=dag3 CLS=assassin python3 v186_bake.py      (CLS: whose skeleton solves the IK; the assassin holds daggers and claws)
import os,sys,json,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE);F=ROOT+'/src/js/1705-v100-anim-baked-keys.js'
MOVES=os.environ.get('MOVES','dag3').split(',');CLS=os.environ.get('CLS','assassin')
SRCJS=open(HERE+'/v100_anim_lib.js').read()+'\n'+open(HERE+'/v100_anim_bake.js').read()+'\n'+open(HERE+'/v100_anim_moves.js').read()
out={}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=900000);pg.click('[data-c="%s"]'%CLS,timeout=900000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{window.requestAnimationFrame=f=>0}")
    pg.evaluate("(s)=>{(0,eval)(s)}",SRCJS)
    print('claw mount:',pg.evaluate("()=>{if(typeof cl186Mount!='function')return 'none (old build)';const R=cl186Mount(pl,'R'),L=cl186Mount(pl,'L');if(!R||!L)return 'paw not measured';window.V100B_CLAW={R:{q:R.q,p:R.p},L:{q:L.q,p:L.p}};return JSON.stringify([R.p,L.p])}"))
    r=pg.evaluate("(mv)=>{const S={};mv.forEach(n=>S[n]=V100M.M[n]);const R=V100B.bake(S);const bad={};for(const n in R.rep)R.rep[n].forEach(x=>{['R','L'].forEach(s=>{if(x[s]&&(x[s].err>.04||x[s].dErr>.15))(bad[n]=bad[n]||[]).push(x.k+s+': p '+x[s].err+' d '+x[s].dErr)})});return {ch:R.ch,mv:R.mv,bad,rep:R.rep}}",MOVES)
    out.update(r)
play.run(s,w=900,hh=560)
txt=open(F).read()
ch=json.loads(re.search(r'ch:(\[[^\]]*\])',txt).group(1))
assert ch==out['ch'],'channel list changed'
for n in MOVES:
    line=' %s:%s'%(n,json.dumps(out['mv'][n],separators=(',',':')))
    pat=re.compile(r'^ %s:\[\[.*?$'%n,re.M)
    m=pat.search(txt);assert m,'no line for '+n
    tail=',' if txt[m.end()-1]==',' else ''
    txt=txt[:m.start()]+line+tail+txt[m.end():]
    print('baked',n,len(out['mv'][n]),'keys; misses:',out['bad'].get(n,'none'))
    for x in out['rep'][n]:print('  ',json.dumps(x))
open(F,'w').write(txt)
