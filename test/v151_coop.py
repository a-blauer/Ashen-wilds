# v151 co-op Burningeye Summit main quest, two windows in the same instance:
#  1 The Frozen Maw: one shared Gorthrak (the fight starts for both, the driver's moves play on the partner's copy, the partner's
#    damage reaches the driver, his kill is the partner's kill too, the passage opens for both).
#  2 The Frozen Gate: a part taken by one is the other's too, the guest assembles and starts the melt, the host runs it, one carrier
#    at a time (the host's C is refused while the guest carries), the guest's flame melts the host's gate, the host's spiders are on
#    the guest's screen and the guest's flame burns them (charge spent on the host), the gate opens for both.
#  3 The Mountain Drill: the guest starts it, the host runs it, the guest switches on the boxes, the drill bores on both screens,
#    a box the host's troll smashed shows on the guest's screen and the guest's repair window fixes it for the host, the tunnel
#    opens for both.
# Run: python3 mpt.py v151_coop.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
def both(ms,step=1500):
    t=0;k=0
    while t<ms:
        (A if k%2==0 else B).bring_to_front();A.wait_for_timeout(min(step,ms-t));t+=step;k+=1
for pg in (A,B):pg.evaluate("()=>{INSR[2]=0;hero.lv=Math.max(hero.lv,24);window.__hp=setInterval(()=>{hero.hp=heroMax();if(typeof RV148!='undefined')RV148.down=0},100)}")

# ---------------- 1 The Frozen Maw ----------------
for pg in (A,B):pg.evaluate("()=>mq151Enter()")
both(5000)
r=[pg.evaluate("()=>[MP.rg,MP.others,!!(MQ151.e&&!MQ151.e.dead),mq151InCave()]") for pg in (A,B)]
print('regions',r)
chk('both in the cave with Gorthrak',all(x[2] and x[3] for x in r) and r[0][0]==r[1][0] and r[0][1]>0,json.dumps(r))
D,F=(A,B) if A.evaluate("()=>gb180Auth()") else (B,A)
chk('exactly one driver',D.evaluate("()=>gb180Auth()") and not F.evaluate("()=>gb180Auth()"))
# the follower walks up: the fight starts on both screens
F.evaluate("()=>{const L=GB151L;toPos(L.home.x+1,L.home.z+6);window.__cast=[];const f=svStart;svStart=function(e,id,s){if(e&&e.gb151)__cast.push(id);return f.apply(this,arguments)}}")
D.evaluate("()=>{const L=GB151L;toPos(L.home.x-3,L.home.z+12);window.__cast=[];const f=svStart;svStart=function(e,id,s){if(e&&e.gb151)__cast.push(id);return f.apply(this,arguments)}}")
both(8000,1000)
r=[pg.evaluate("()=>[!!(GB151A&&GB151A.f),__cast.slice(0,12)]") for pg in (D,F)]
chk('the fight starts for both',r[0][0] and r[1][0],json.dumps(r))
# the intro is long on this slow two-window machine: end it, then the driver picks moves and the partner plays them
D.evaluate("()=>{const e=MQ151.e;if(e.sv.mv)svEndMove(e,true);e.sv.rest=0}")
both(20000,1000)
r=[pg.evaluate("()=>__cast.filter(id=>id!=='intro').slice(0,12)") for pg in (D,F)]
chk('the driver\'s moves play on the partner\'s copy',len(r[0])>0 and len(r[1])>0 and all(x in r[0] for x in r[1]) and r[1][0]==r[0][0],json.dumps(r))
p=[pg.evaluate("()=>{const m=MQ151.e.m.position;return [m.x,m.z]}") for pg in (D,F)]
chk('he stands in the same place on both screens',abs(p[0][0]-p[1][0])+abs(p[0][1]-p[1][1])<6,json.dumps(p))
# the follower's damage reaches the driver
h0=D.evaluate("()=>{const e=MQ151.e;if(e.sv.mv)svEndMove(e,true);e.sv.inv=0;e.sv.rest=99;e.c.h=M(e.c);return [e.c.h,M(e.c)]}")
F.evaluate("()=>{const e=MQ151.e;hurt(e,Math.round(M(e.c)*.1),{},false)}")
both(2500,800)
h1=D.evaluate("()=>MQ151.e.c.h")
fh=F.evaluate("()=>[MQ151.e.c.h,MQ151.e.dead?1:0]")
chk('the partner\'s hits reach the driver',h0[0]-h1>=h0[1]*.08,json.dumps([h0,h1]))
chk('the partner\'s copy follows the driver\'s health',not fh[1] and abs(fh[0]-h1)<h0[1]*.06,json.dumps([fh,h1]))
# the driver's kill is everyone's
x0=F.evaluate("()=>hero.xp")
D.evaluate("()=>{const e=MQ151.e;if(e.sv.mv)svEndMove(e,true);e.sv.inv=0;hurt(e,1e9,{},false)}")
both(6000)
r=[pg.evaluate("()=>[MQ151.st,!MQ151.e||!!MQ151.e.dead||!enemies.includes(MQ151.e),!!(GB151A&&GB151A.f)]") for pg in (D,F)]
chk('Gorthrak falls on both screens and the passage opens for both',all(x[0]>=2 and x[1] and not x[2] for x in r),json.dumps(r))
chk('the partner gets the kill (XP)',F.evaluate("()=>hero.xp")!=x0)

# ---------------- 2 The Frozen Gate ----------------
for pg in (A,B):pg.evaluate("()=>{const R=mq160Plan(),G=R.gate;toPos(R.bench.x+G.fx*1.6,R.bench.z+G.fz*1.6)}")
both(6000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
r=[pg.evaluate("()=>[MP.rg,MP.others,mq160In2()]") for pg in (H,G)]
chk('both in Burningeye II',r[0][0]==r[1][0] and r[0][2] and r[1][2] and r[0][1]>0,json.dumps(r))
# a part taken by the host counts for the guest; the guest takes the other two
H.evaluate("()=>{MQ160.gk[0]=1;mq160Take(0)}")
both(2500,800)
chk('a part taken by one is the other\'s too',G.evaluate("()=>MQ160.p[0]")==1,G.evaluate("()=>MQ160.p.join('')"))
G.evaluate("()=>{MQ160.gk[1]=1;MQ160.gk[2]=1;mq160Take(1);mq160Take(2);mq160Assemble()}")
both(3000,800)
chk('the guest assembles: the host has it too',H.evaluate("()=>MQ160.st")==2 and G.evaluate("()=>MQ160.st")==2,json.dumps([H.evaluate("()=>[MQ160.st,MQ160.p.join('')]"),G.evaluate("()=>[MQ160.st,MQ160.p.join('')]")]))
G.evaluate("()=>mq160Start()")
both(3000,800)
r=[pg.evaluate("()=>!!MQ160.E") for pg in (H,G)]
chk('the guest starts the melt: it runs for both',r[0] and r[1],json.dumps(r))
# the guest picks it up; the host's C is refused
G.evaluate("()=>{const B=mq160BenchSpot();toPos(B.x,B.z+.5);document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true}));document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'c',bubbles:true}))}")
both(2000,700)
H.evaluate("()=>{const B=mq160BenchSpot();toPos(B.x+.6,B.z);document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true}));document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'c',bubbles:true}))}")
both(1500,700)
r=[H.evaluate("()=>MQ160.E?[MQ160.E.carry,MQ160.E.carrier]:[null,null]"),G.evaluate("()=>MQ160.E?[MQ160.E.carry,MP.me]:[null,'']")]
chk('one carrier: the guest has it, the host\'s C is refused',r[0][0]==0 and r[1][0]==1 and r[0][1]==r[1][1],json.dumps(r))
chk('the flamespitter hangs on the guest\'s hero on the host\'s screen',H.evaluate("()=>{const S=MQ160.S,r=MP.rh[MQ160.E.carrier];return !!(r&&r.m&&S.sp.parent===r.m)}"))
# the guest sprays the gate: the host's melt rises and the guest sees it
H.evaluate("()=>{MQ160.E.spT=99}")
G.evaluate("()=>{const R=mq160Plan(),Gt=R.gate;window.__aim=setInterval(()=>{toPos(Gt.x+Gt.fx*3.5,Gt.z+Gt.fz*3.5);pl.rotation.y=Math.atan2(Gt.x-pl.position.x,Gt.z-pl.position.z);mOn=false;atkHeld=true},50)}")
both(3500,700)
m=[H.evaluate("()=>[MQ160.E.melt,MQ160.E.heat]"),G.evaluate("()=>[MQ160.E.melt,MQ160.E.heat]")]
chk('the guest\'s flame melts the host\'s gate (heat too) and both see it',m[0][0]>1 and m[0][1]>.2 and abs(m[0][0]-m[1][0])<1.2,json.dumps(m))
G.evaluate("()=>{clearInterval(__aim);atkHeld=false}")
# a spider of the host's: on the guest's screen, the guest's flame burns it, the host spends the charge
H.evaluate("()=>{const R=mq160Plan(),Gt=R.gate,E=MQ160.E;E.heat=0;E.ovh=0;const x=Gt.x+Gt.fx*7,z=Gt.z+Gt.fz*7;const e=spawnEnemy('icespider',x,z,MQ160.lv,{agg:0,minion:0});e.fs160sp=1;E.live.push(e);window.__sp=e;window.__ch=E.charge}")
both(3000,700)
s=G.evaluate("()=>{const e=enemies.find(q=>q.mir&&q.c.en==='icespider'&&!q.dead);return e?[e.nid,e.m.position.x,e.m.position.z]:null}")
chk('the host\'s spider is on the guest\'s screen',s is not None,json.dumps(s))
if s:
    G.evaluate("([id,x,z])=>{window.__aim=setInterval(()=>{const e=MP.emap[id];if(!e)return;const p=e.m.position;toPos(p.x-2.4,p.z);pl.rotation.y=Math.atan2(p.x-pl.position.x,p.z-pl.position.z);mOn=false;atkHeld=true},40)}",s)
    both(2500,600)
    G.evaluate("()=>{clearInterval(__aim);atkHeld=false}")
    r=H.evaluate("()=>[!!__sp.dead||!enemies.includes(__sp),__ch-MQ160.E.charge]")
    chk('the guest\'s flame burns the host\'s spider (charge spent on the host)',r[0] and r[1]>0,json.dumps(r))
# the spiders hunt the nearest hero: a spider next to the guest goes for the guest
t=H.evaluate("()=>{const E=MQ160.E,r=MP.rh[E.carrier];if(!r||!r.m)return null;const p=r.m.position;const e=spawnEnemy('icespider',p.x+2,p.z,MQ160.lv,{agg:1,minion:0});e.fs160sp=1;const me=pl.position;toPos(me.x,me.z);return eTarget(e,e.m,e.m.position.distanceTo(pl.position))===r.m}")
chk('a spider hunts the nearest hero (the guest)',t is True,json.dumps(t))
# the gate gives way: both
H.evaluate("()=>{MQ160.E.melt=MQ160.melt-.05;MQ160.E.rfire=1;MQ160.E.rgate=1;MQ160.E.rT=performance.now()}")
both(4000,700)
r=[pg.evaluate("()=>[MQ160.st,!MQ160.E]") for pg in (H,G)]
chk('the gate melts for both',all(x[0]>=3 and x[1] for x in r),json.dumps(r))

# ---------------- 3 The Mountain Drill ----------------
for pg in (A,B):pg.evaluate("()=>{const R=mq170Plan();toPos(R.yard.x,R.yard.z)}")
both(6000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
r=[pg.evaluate("()=>[MP.rg,MP.others,mq170In3()]") for pg in (H,G)]
chk('both in Burningeye III',r[0][0]==r[1][0] and r[0][2] and r[1][2] and r[0][1]>0,json.dumps(r))
G.evaluate("()=>mq170Start()")
both(3000,800)
r=[pg.evaluate("()=>!!MQ170.E") for pg in (H,G)]
chk('the guest starts the drill: it runs for both',r[0] and r[1],json.dumps(r))
H.evaluate("()=>{MQ170.E.trT=1e9}")
G.evaluate("()=>{for(let i=0;i<4;i++)dr170Fix(i)}")
both(3000,800)
r=[pg.evaluate("()=>[MQ170.E.box.map(b=>b.s).join(','),MQ170.E.prog]") for pg in (H,G)]
chk('the guest switches the boxes on: the host\'s drill bores and the guest sees it',r[0][0]=='on,on,on,on' and r[0][1]>.5 and r[1][0]=='on,on,on,on' and r[1][1]>.3,json.dumps(r))
# the host's box smashed: the guest sees it and repairs it in the window
H.evaluate("()=>dr170Set(2,'smashed')")
both(2000,700)
g=G.evaluate("()=>MQ170.E.box[2].s")
chk('a smashed box shows on the guest\'s screen',g=='smashed',g)
G.evaluate("()=>{dr170Open(2,'rebuild');dr170Win(MQ170.W)}")
both(2500,700)
r=[pg.evaluate("()=>MQ170.E.box[2].s") for pg in (H,G)]
chk('the guest\'s repair fixes the box for the host',r==['on','on'],json.dumps(r))
# a wrecker's wind-up shows on the guest's screen
H.evaluate("()=>{const R=mq170Plan(),b=R.box[1];const e=spawnEnemy('troll',b.x+3,b.z,MQ170.lv,{agg:0,minion:0});e.dr170t=1;e.agg=0;e.dr={ph:'go',b:1,t:0};window.__tr=e}")
both(5000,800)
w=[H.evaluate("()=>[__tr.dr.ph,MQ170.E.box[1].s,__tr.nid||'']"),G.evaluate("()=>{const e=enemies.find(q=>q.mir&&q.c.en==='troll'&&!q.dead);return e?[!!e.d3w||!!e.m.ak,MQ170.E.box[1].s]:null}")]
chk('the host\'s wrecker is on the guest\'s screen (wind-up or smash seen)',w[1] is not None and (w[1][0] or w[1][1]!='on' or w[0][0]=='go'),json.dumps(w))
H.evaluate("()=>{try{removeE(__tr)}catch(_){}for(let i=0;i<4;i++)dr170Set(i,'on')}")
# through: both
H.evaluate("()=>{MQ170.E.prog=MQ170.need-.1}")
both(4000,700)
r=[pg.evaluate("()=>[MQ170.st,!MQ170.E]") for pg in (H,G)]
chk('the tunnel opens for both',all(x[0]>=1 and x[1] for x in r),json.dumps(r))
errs=[pg.evaluate("()=>(CO151.err||0)+(MQ151.err||0)+(MQ160.err||0)+(MQ170.err||0)") for pg in (A,B)]
chk('no errors in the quest code',errs==[0,0],json.dumps(errs))
print('V151_COOP','PASS' if not fails else 'FAIL',fails)
