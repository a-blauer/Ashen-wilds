# v236 co-op difficulty (4090): with two players in an instance the host's monsters carry more health (+60% normal, +75% elite),
# the partner's copies agree (the 12th 'es' field) and say so on the target frame; a hurt monster keeps its health when the count
# changes and a full one follows it; creatures each game makes for itself agree through presence (p.cs236); bosses hit 8% harder
# per extra player; the defence events allow more creatures.   Run: python3 mpt.py v236_coop_scale.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{FAST();CHEAT.god=true}")
p=A.evaluate("()=>PMAP[0].ins[0].path[60]")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
H,G=mp_roles(60000)
chk('two players in the instance',mp_until("()=>cs236Live()===1",30000),json.dumps([pg.evaluate("()=>[MP.others,cs236Live()]") for pg in (A,B)]))
# the host makes a normal and an elite monster; within a second they carry the co-op health
r=H.evaluate("""()=>{const k=(BIOEN[PMAP[0].n]||['goo'])[0],P=pl.position;window.__n=spawnEnemy(k,P.x+6,P.z+5,6,{});window.__e=spawnEnemy(k,P.x-6,P.z+5,6,{al:1});
  [__n,__e].forEach(e=>{e.agg=0;e.cd=99});return {k,n0:M(__n.c),e0:M(__e.c),sh0:__e.sh||0}}""")
ok=mp_until("()=>__n.c._cs>1&&__e.c._cs>1",15000,[H])
s=H.evaluate("()=>({n:[__n.c._cs,__n.c._csX,M(__n.c),__n.c.h],e:[__e.c._cs,__e.c._csX,M(__e.c),__e.c.h],sh:__e.sh||0,ids:[__n.nid,__e.nid]})")
chk('host: a normal monster has +60% health and is full',ok and abs(s['n'][0]-1.6)<1e-6 and abs(s['n'][2]/r['n0']-1.6)<.01 and s['n'][3]==s['n'][2] and s['n'][1]==1,json.dumps([r,s]))
chk('host: an elite has +75% health and is full',ok and abs(s['e'][0]-1.75)<1e-6 and abs(s['e'][2]/r['e0']-1.75)<.01 and s['e'][3]==s['e'][2],json.dumps([r,s]))
chk('host: a Shielded elite\'s shield grows with it',r['sh0']==0 or abs(s['sh']/r['sh0']-1.75)<.02,json.dumps([r['sh0'],s['sh']]))
# the partner's copies agree
mp_until("()=>__n.nid&&__e.nid",15000,[H]);ids=H.evaluate("()=>[__n.nid,__e.nid]")
ok=mp_until("(ids)=>ids.every(id=>MP.emap[id]&&MP.emap[id].c._cs>1)",20000,[G],ids)
g=G.evaluate("(ids)=>ids.map(id=>{const e=MP.emap[id];return e?[e.c._cs,e.c._csX,M(e.c),e.c.h,e.mir]:null})",ids)
chk('partner: its copies carry the same maximum health',ok and g[0] and g[1] and g[0][2]==s['n'][2] and g[1][2]==s['e'][2] and g[0][1]==1 and g[1][1]==1,json.dumps([g,s]))
t=G.evaluate("(id)=>{const e=MP.emap[id];if(!e)return '';tgt=e;tgtHud();const v=$('tgL').textContent;tgt=null;return v}",ids[0])
chk('partner: the target frame says two players',('×2' in t),t)
t=H.evaluate("()=>{tgt=__n;tgtHud();tgtHud();const v=$('tgL').querySelectorAll('.cs236').length;tgt=null;return v}")
chk('the mark is written once',t==1,str(t))
# the count drops (the partner leaves): a hurt monster keeps its health, a full one follows
r2=H.evaluate("""()=>{const L=cs236Live;cs236Live=()=>0;try{__n.c.h=M(__n.c)-20;cs236Upd(__n);const hurt=[__n.c._cs,M(__n.c)];cs236Upd(__e);const full=[__e.c._cs,M(__e.c),__e.c.h];
  __n.c.h=M(__n.c);cs236Upd(__n);const healed=[__n.c._cs,M(__n.c),__n.c.h];return {hurt,full,healed}}finally{cs236Live=L}}""")
chk('a hurt monster keeps its health when a player leaves',abs(r2['hurt'][0]-1.6)<1e-6 and r2['hurt'][1]==s['n'][2],json.dumps(r2))
chk('a full monster goes back to its own health',r2['full'][0]==1 and abs(r2['full'][1]-r['e0'])<=1 and r2['full'][2]==r2['full'][1] and r2['healed'][0]==1 and abs(r2['healed'][1]-r['n0'])<=1,json.dumps([r2,r]))
H.evaluate("()=>{[__n,__e].forEach(e=>{try{removeE(e)}catch(_){}})}")
# creatures each game makes for itself (not shared): both work the count out; a fight under way is agreed through presence
for pg in (H,G):pg.evaluate("""()=>{const k=(BIOEN[PMAP[0].n]||['goo'])[0],P=pl.position;const e=window.__m=spawnEnemy(k,P.x+5,P.z-6,6,{al:1});e.minion=1;e.agg=0;e.cd=99;window.__m0=M(e.c)}""")
ok=mp_until("()=>__m.c._cs>1",15000)
chk('own creatures (not shared) scale on both games',ok and all(abs(pg.evaluate("()=>M(__m.c)/__m0")-1.75)<.01 for pg in (H,G)),json.dumps([pg.evaluate("()=>[__m.c._cs,M(__m.c),__m0,mpElig(__m)]") for pg in (H,G)]))
# H's fight began alone (factor 1, hurt): it says "1 player" and G's full copy follows it
H.evaluate("()=>{cs236Set(__m,1,0);__m.c.h=M(__m.c)-30}")
chk('a game with a hurt boss says its count in presence',mp_until("()=>Object.values(MP.rh).some(r=>r.pr&&r.pr.cs236===1)",20000,[G]),json.dumps(G.evaluate("()=>Object.values(MP.rh).map(r=>r.pr&&r.pr.cs236)")))
ok=mp_until("()=>__m.c._cs===1&&Math.abs(M(__m.c)-__m0)<=1",15000,[G])
chk('a late joiner takes the count of the fight under way',ok and H.evaluate("()=>__m.c._cs")==1,json.dumps([pg.evaluate("()=>[cs236Fight(),cs236Lock(),__m.c._cs,M(__m.c),__m0]") for pg in (H,G)]))
H.evaluate("()=>{try{removeE(__m)}catch(_){}}")
chk('and the live count again once that fight is over',mp_until("()=>__m.c._cs>1",20000,[G]),json.dumps(G.evaluate("()=>[cs236Fight(),__m.c._cs]")))
G.evaluate("()=>{try{removeE(__m)}catch(_){}}")
# bosses hit harder; events allow more
d=H.evaluate("""()=>{const b={boss:1,c:{st:{hp:1},_csX:2}},n={c:{st:{hp:1},_csX:2}};let got=null;const f=hitHero_base;const out={boss:cs236Dmg(b),norm:cs236Dmg(n),solo:cs236Dmg({boss:1,c:{st:{hp:1}}}),cap0:cs236EvCap(0),cap1:cs236EvCap(1),rate:cs236EvRate()};return out}""")
chk('bosses deal +8% per extra player, others do not',abs(d['boss']-1.16)<1e-6 and d['norm']==1 and d['solo']==1,json.dumps(d))
chk('the defence events allow more creatures, sooner',d['cap0']==4 and d['cap1']==0 and abs(d['rate']-1/1.3)<1e-6,json.dumps(d))
# solo: nothing changes
z=H.evaluate("()=>{const o=MP.on;MP.on=false;try{return [cs236Live(),cs236Fight(),cs236EvCap(0),cs236EvRate()]}finally{MP.on=o}}")
chk('alone nothing is scaled',z==[0,0,0,1],json.dumps(z))
for k,pg in (('A',A),('B',B)):
    er=[l for l in logs[k] if 'PAGEERROR' in l or 'v236' in l]
    chk('no errors in window '+k,not er,json.dumps(er[:3]))
print('FAILS',len(fails))
