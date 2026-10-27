# v155 co-op: the Hillside Crest main quest played together (two windows over the fake room).
#  Abeksi: F takes the partner in too · one host runs the snakes (the other's follow) · a partner seen = the whole party caught and
#  back · the checkpoint is shared · the drain takes both out. Ascent: F takes the partner up too · one Skarrith · a fallen rider
#  watches the other · both fallen = the chase starts again for both · the other gets through = the fallen lies downed in III and
#  can be revived. Gate of the Hydra: the stones and the song are shared and the door opens for both.
# Run: python3 mpt.py v155_coop_levels.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
def W(ms,step=350):
    t=0;i=0
    while t<ms:
        (A if i%2==0 else B).bring_to_front();A.wait_for_timeout(step);t+=step;i+=1
def until(js,ms,pgs=None):
    t=0;i=0
    while t<ms:
        if all(p.evaluate(js) for p in (pgs or (A,B))):return True
        (A if i%2==0 else B).bring_to_front();A.wait_for_timeout(350);t+=350;i+=1
    return False
for pg in (A,B):pg.evaluate("""()=>{window.__c=0;{const f=ab152Caught;ab152Caught=function(){__c++;return f.apply(this,arguments)}}
  window.__iv=setInterval(()=>{hero.hp=heroMax();if(CH153.R&&CH153.R.ph=='run'&&!window.__noInv)CH153.R.inv=9},100);insArrive(INSL[5]);return 1}""")
ok=until("()=>MP.on&&MP.others>=1",20000)
chk('both in Hillside Crest I together',ok,json.dumps([p.evaluate("()=>[MP.rg,MP.others]") for p in (A,B)]))
# ---------------- Abeksi ----------------
A.evaluate("()=>ab152Enter()")
ok=until("()=>ab152In()&&!!AB152.S",12000)
chk('Abeksi: entering takes the partner in too',ok,json.dumps([p.evaluate("()=>[ab152In(),curIns()&&curIns().g]") for p in (A,B)]))
until("()=>MP.others>=1&&MP.rg==30",8000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
W(3000)
r=G.evaluate("()=>{const S=AB152.S;const L=S.acts.map((a,i)=>a.net?[i,a.u,a.v]:null).filter(Boolean);return L.slice(0,40)}")
h=H.evaluate("(L)=>L.map(([i,u,v])=>{const a=AB152.S.acts[i];return Math.hypot(a.u-u,a.v-v)})",r)
chk("Abeksi: the partner's snakes follow the host's",len(r)>3 and max(h)<2.5,'%d synced, max off %.2f'%(len(r),max(h) if h else -1))
# the partner walks out in front of a sentry: the host's snake sees them, the whole party is caught and goes back
sp=G.evaluate("""()=>{const S=AB152.S,I=S.I;let best=null;for(const a of S.acts){if(a.role!='sentry'||a.o.sweep)continue;const fu=a.u+Math.sin(a.yaw)*2.6,fv=a.v+Math.cos(a.yaw)*2.6;
  if(S.G.sol[Math.round(fv)*S.G.W+Math.round(fu)])continue;best=[fu,fv];break}if(!best)return null;ab152SetCrouch(false);toPos(I.x0+best[0],I.y0+best[1]);return best}""")
ok=until("()=>window.__c>=1",9000)
chk('Abeksi: a partner seen by the host\'s snake = the whole party is caught',ok and sp is not None,json.dumps([sp,[p.evaluate("()=>window.__c") for p in (A,B)]]))
# v157: caught = the city's alarm for everyone; the host's world rouses the residents (the game's enemies, mirrored to the partner)
ok=until("()=>AB157A.on&&!AB152H.cau&&!AB152H.frz",9000)
chk('Abeksi: caught = the city is roused for the whole party',ok,json.dumps([p.evaluate("()=>[AB157A.on,AB152H.cr]") for p in (A,B)]))
ok=until("()=>enemies.some(e=>!e.dead&&/^naga/.test(e.c.en))",9000)
hs=H.evaluate("()=>enemies.filter(e=>e.ab157&&!e.dead).length");gs=G.evaluate("()=>[enemies.filter(e=>e.ab157&&!e.dead).length,enemies.filter(e=>e.mir&&!e.dead&&/^naga/.test(e.c.en)).length]")
chk('Abeksi: the host owns the roused residents, the partner sees them mirrored',ok and hs>0 and gs[0]==0 and gs[1]>0,json.dumps([hs,gs]))
ok=until("()=>AB157A.left>0",6000,[G])
chk('Abeksi: the partner counts the residents left too',ok,json.dumps([p.evaluate("()=>AB157A.left") for p in (A,B)]))
# a death in the alarm: everyone back at the party's checkpoint, the city calm
H.evaluate("()=>{hero.hp=1;down();return 1}")   # v158: the host lies downed (waiting for a revive) when the partner dies: the whole party wakes at the checkpoint
dn0=until("()=>typeof RV148!='undefined'&&!!RV148.down",4000,[H])
G.evaluate("()=>{hero.hp=1;down();if(typeof RV148!='undefined'&&RV148.down)rv148Die();setTimeout(()=>{try{AWD.ready=1;awRise()}catch(_){}},400);return 1}")
ok=until("()=>!AB157A.on&&!AB152H.cau&&!AB152H.frz&&!(typeof AWD!='undefined'&&AWD.dead)",12000)
d=A.evaluate("()=>{const c=ab152Spot(AB152Q.cp);return Math.hypot(pl.position.x-c.x,pl.position.z-c.z)}"),B.evaluate("()=>{const c=ab152Spot(AB152Q.cp);return Math.hypot(pl.position.x-c.x,pl.position.z-c.z)}")
dd=[p.evaluate("()=>[AB157A.on,!!AB152H.cau,AB152H.frz,typeof AWD!='undefined'&&AWD.dead,hero.hp,ab157Res().filter(a=>a.hunt).length,enemies.filter(e=>!e.dead&&/^naga/.test(e.c.en)).length]") for p in (H,G)]
chk('Abeksi: a death in the alarm = both back at the checkpoint, calm',ok and max(d)<3,json.dumps([d,dd]))
up=[p.evaluate("()=>[hero.hp>0,typeof RV148!='undefined'&&!!RV148.down]") for p in (H,G)]
chk('Abeksi: a downed partner wakes too when the city calms',dn0 and all(u[0] and not u[1] for u in up),json.dumps([dn0,up]))
# a knife kill by the partner is seen in the host's city (the same resident falls)
k=G.evaluate("()=>{const S=AB152.S;const a=S.acts.find(x=>x.role=='sit');if(!a)return null;ab157Res();ab157Assassinate(a);return a.ri}")
ok=k is not None and until("()=>{const a=ab157Res()[%d];return !!(a&&a.dead)}"%k,6000)
chk("Abeksi: a partner's knife kill happens in every world",ok,json.dumps(k))
for pg in (A,B):pg.evaluate("()=>{ab152Restart(false);return 1}")
W(800)
# a shared checkpoint
G.evaluate("()=>{const c=ab152Spot(3);toPos(c.x,c.z);ab152SetCrouch(true)}")
ok=until("()=>AB152Q.cp>=3",6000,[H])
chk('Abeksi: the checkpoint is shared',ok,json.dumps([p.evaluate("()=>AB152Q.cp") for p in (A,B)]))
# out through the drain together
G.evaluate("()=>{AB152H.cau=null;AB152H.frz=0;ab152Finish()}")
ok=until("()=>curIns()&&curIns().g===6",9000)
chk('Abeksi: the drain takes the whole party out',ok,json.dumps([p.evaluate("()=>[curIns()&&curIns().g,AB152Q.st]") for p in (A,B)]))
# ---------------- the Hilltop Ascent ----------------
for pg in (A,B):pg.evaluate("()=>{newMount(MNTK[0]);MP.lastPres='';return 1}")
W(1500)
lab=A.evaluate("()=>{const I=INSL[6];toPos(I.ba[0],I.ba[1]);for(let i=0;i<3;i++)homeTick(1/30,performance.now());const G=SP152.gates.ascent,s=G.spot;toPos(s.x,s.z);return (worldPrompt()||{}).label||''}")
chk('Ascent: the road says the party rides together',"with your party" in lab,lab)
A.evaluate("()=>ch153Enter()")
ok=until("()=>ch153In()&&CH153.R&&CH153.R.ph=='run'",14000)
chk('Ascent: riding up takes the partner too',ok,json.dumps([p.evaluate("()=>[ch153In(),CH153.R&&CH153.R.ph]") for p in (A,B)]))
until("()=>MP.rg==31&&MP.others>=1",6000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
W(3000)
n=[p.evaluate("()=>CH153.R.sn.s") for p in (H,G)]
chk('Ascent: one Skarrith for both',abs(n[0]-n[1])<4,json.dumps(n))
# v157: each rider boosts themselves; the partner sees them pull ahead (their speed in ['cs','p'])
bo=G.evaluate("()=>{const R=CH153.R;R.bc=CH157.n;R.bst=0;return ch157Boost()}")
ok=until("()=>{const q=Object.values(CS155.p)[0];return !!q&&q.v>CH153V.spd*1.2}",2500,[H])
chk('Ascent: a boost in co-op (the partner sees the boosting rider speed up)',bo and ok,json.dumps(H.evaluate("()=>Object.values(CS155.p).map(q=>q.v)")))
# the partner falls: they watch the host ride on
G.evaluate("()=>ch153Die('hits')")
ok=until("()=>CH153.R&&CH153.R.ph=='spec'",6000,[G])
st=G.evaluate("()=>[CH153.R.ph,pl.visible]");hs=H.evaluate("()=>CH153.R&&CH153.R.ph")
W(1200)
dd=G.evaluate("()=>{const q=cs155Alive()[0];return q?Math.abs(CH153.R.s-q.s):99}")
chk('Ascent: a fallen rider watches the other ride on',ok and st[0]=='spec' and not st[1] and hs=='run' and dd<6,json.dumps([st,hs,dd]))
# both fall: the chase starts again for both
H.evaluate("()=>ch153Die('hits')")
ok=until("()=>CH153.R&&(CH153.R.ph=='intro'||CH153.R.ph=='run')&&CH153.R.hp==3&&CH153.R.s<40",12000)
chk('Ascent: everyone fallen = the chase starts again for both',ok,json.dumps([p.evaluate("()=>CH153.R&&[CH153.R.ph,CH153.R.hp,Math.round(CH153.R.s)]") for p in (A,B)]))
until("()=>CH153.R&&CH153.R.ph=='run'",8000)
# v156: the same, but the last rider's game runs behind (lag, a slow or background window): the watcher has already started
# again and is riding when the last rider decides. Before v156 the last rider took them for a partner still on the old try,
# watched them and stayed stuck watching.
G.evaluate("()=>ch153Die('hits')")
until("()=>CH153.R&&CH153.R.ph=='spec'",6000,[G])
H.evaluate("""()=>{window.__pin=1;if(!window.__pinW){window.__pinW=1;const f=ch153Tick;ch153Tick=function(){const R=CH153.R;if(window.__pin&&R&&R.ph=='dead')R.dead.t=Math.min(R.dead.t,1);return f.apply(this,arguments)}}
  ch153Die('hits');return 1}""")
ok1=until("()=>CH153.R&&CH153.R.ph=='run'&&CH153.R.s>CH153.S.K.start+6",12000,[G])
H.evaluate("()=>{window.__pin=0;return 1}")
ok=until("()=>CH153.R&&(CH153.R.ph=='intro'||CH153.R.ph=='run')&&CH153.R.hp==3",9000,[H])
st=[p.evaluate("()=>CH153.R&&[CH153.R.ph,CH153.R.hp,Math.round(CH153.R.s),CS155.rd]") for p in (H,G)]
chk('Ascent: the last rider to fall starts again even when the other already has (no stuck watcher)',ok1 and ok and st[0][3]==st[1][3],json.dumps(st))
# ... and the one who started first is not swallowed by the last try's serpent meanwhile
W(2500);until("()=>CH153.R&&CH153.R.ph=='run'",6000,[H])   # v157: the restart's emergence takes ~2 s of game time (slower in a background window)
st=[p.evaluate("()=>CH153.R&&[CH153.R.ph,CH153.R.hp,Math.round(CH153.R.s),CS155.rd,Math.round(CH153.R.sn.s)]") for p in (H,G)]
chk('Ascent: the rider who started again first keeps riding (no serpent from the last try)',st[1][0]=='run' and st[0][0]=='run' and st[1][3]==st[0][3],json.dumps(st))
until("()=>CH153.R&&CH153.R.ph=='run'",8000)
# the partner falls again, the host gets through: the partner lies downed in III, and the host revives them
G.evaluate("()=>ch153Die('hits')")
until("()=>CH153.R&&CH153.R.ph=='spec'",6000,[G])
H.evaluate("()=>{const R=CH153.R,P=CH153.S.P;R.s=P.S-8;R.sn.s=R.s-30;R.o=0;return 1}")
ok=until("()=>curIns()&&curIns().g===7",14000)
W(2500)
dn=G.evaluate("()=>[RV148.down,curIns().g,CH153Q.st,Math.round(RV148.t)]");gp=G.evaluate("()=>MP.me")
chk('Ascent: the winner\'s partner arrives in III downed (to be revived)',ok and dn[0]==1 and dn[1]==7 and dn[2]==2 and dn[3]>60,json.dumps(dn))
H.evaluate("(p)=>rv148Send(p)",gp)
ok=until("()=>!RV148.down&&hero.hp>0",6000,[G])
chk('Ascent: and the partner revives them',ok,json.dumps(G.evaluate("()=>[RV148.down,hero.hp]")))
# ---------------- the Gate of the Hydra ----------------
for pg in (A,B):pg.evaluate("()=>{const I=INSL[7];toPos(I.ba[0],I.ba[1]);for(let i=0;i<3;i++)homeTick(1/30,performance.now());return !!HD154.S}")
W(2500)
A.evaluate("()=>{for(let j=0;j<5;j++){let n=0;while(!HD154.on[j]&&n<9){hd154Turn(j);n++}}return HD154.on.join('')}")
ok=until("()=>hd154N()===5",8000,[B])
chk('Hydra: the Wind Stones are shared',ok,json.dumps([p.evaluate("()=>[HD154.vane.join(''),hd154N()]") for p in (A,B)]))
D=A.evaluate("()=>{const D=hd154Plan().door;toPos(D.x-D.ux*4,D.z-D.uz*4);return [D.x,D.z]}");B.evaluate("([x,z])=>{const D=hd154Plan().door;toPos(D.x-D.ux*4+1,D.z-D.uz*4)}",D)
A.evaluate("()=>hd154SongStart()")
ok=until("()=>!!HD154.song",5000,[B])
chk('Hydra: the song starts for both',ok)
verses=[]
for v in range(3):
    until("()=>HD154.song&&HD154.song.mode=='play'&&HD154.v==%d"%v,15000,[A])
    seq=A.evaluate("()=>HD154.song.seq.slice()")
    for i,j in enumerate(seq):
        pg=A if i%2==0 else B
        pg.evaluate("(j)=>{const G=HD154.song;if(G&&G.mode=='sing'){G.mode='play'}hd154Strike(j)}",j);W(700)
    verses.append([len(seq),A.evaluate("()=>HD154.v"),B.evaluate("()=>HD154.v")])
chk('Hydra: both players sing the verses together',[q[1] for q in verses]==[1,2,3] and [q[2] for q in verses]==[1,2,3],json.dumps(verses))
ok=until("()=>HD154.st===2||!!HD154.op",14000)   # opening (its 5 s scene runs slowly in a background test window) or open
chk('Hydra: the door opens for both',ok,json.dumps([p.evaluate("()=>[HD154.st,!!HD154.op]") for p in (A,B)]))
errs=[p.evaluate("()=>CL155.err") for p in (A,B)]
chk('no co-op errors',errs==[0,0],json.dumps(errs))
print('V155_COOP','PASS' if not fails else 'FAIL',fails)
