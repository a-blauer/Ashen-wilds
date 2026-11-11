# v220 co-op: a partner's nameplate is the new fitted plate, and your shop / talk view is yours only (the partner keeps
# seeing your hero at the counter).   Run: python3 v221_coop.py   (opens the two co-op windows through mpt.py)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,time
def chk(name,ok,info=''):print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
def tick(ms):
    for i in range(max(1,ms//400)):
        (A if i%2 else B).bring_to_front();A.wait_for_timeout(400)
def poll(f,ms=60000):
    t0=time.time()
    while True:
        try:
            if f():return True
        except Exception as e:
            if 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        tick(400)
# both stand by the Steward in Duskhold
for pg,dx in ((A,.6),(B,2.4)):pg.evaluate("(dx)=>{const s=SHM.st;pl.position.set(s.x+dx,pl.position.y,s.z+2);snapCam()}",dx)
PLATE="""()=>{const r=Object.values(MP.rh)[0];if(!r||!r.tag)return null;const d=r.tag.userData.np220,c=r.tag.userData.np220c;if(!d||!c)return {ok:false};
  const x=document.createElement('canvas').getContext('2d');x.font='700 60px Cinzel,"Trajan Pro",Georgia,"Times New Roman",serif';
  return {ok:true,name:d.text[0],sub:d.text[1],hp:d.hp,w:c.width,need:Math.round(x.measureText(d.text[0]).width),asp:+(r.tag.scale.x/r.tag.scale.y-c.width/c.height).toFixed(3)}}"""
ok=poll(lambda:(A.evaluate(PLATE) or {}).get('ok') and (B.evaluate(PLATE) or {}).get('ok'))
for nm,pg,other in (('A',A,B),('B',B,A)):
    r=pg.evaluate(PLATE) or {};me=other.evaluate("()=>({n:hero.name||'',lv:hero.lvl})")
    chk(nm+' sees the partner\'s new plate (name, level, health)',ok and r.get('ok') and r.get('sub','').startswith('LV ')==False and r.get('sub')=='Lv %d'%me['lv'] and r.get('hp') is not None,[r,me])
    chk(nm+': the plate fits the name',bool(r) and r.get('w',0)>=r.get('need',1e9)+60 and abs(r.get('asp',9))<.02,r)
# a very long name still fits
B.evaluate("()=>{hero.name='Maximilian the Unyielding'}")
ok=poll(lambda:(A.evaluate(PLATE) or {}).get('name')=='Maximilian the Unyie',60000);r=A.evaluate(PLATE)
chk('a 20-letter name is not cut off',ok and r['w']>=r['need']+60,r)
# A opens the Steward: A's own view only
A.evaluate("()=>openX('hold')")
# (mpt.py switches drawing off: POST.render is a stub there, so the view's per-frame step is called by hand)
ok=poll(lambda:A.evaluate("()=>{im220Tick();return !!(IM220.on&&IM220.on.k>=1&&!pl.visible)}"),40000);chk('A gets the keeper view',ok,A.evaluate("()=>({on:!!IM220.on,k:IM220.on&&IM220.on.k,vis:pl.visible,xw:$('xw').className,mode:xwMode,f:!!im220Find(),d:Math.hypot(pl.position.x-SHM.st.x,pl.position.z-SHM.st.z),party:party.length,err:IM220.err||0,town:typeof curTown!='undefined'?curTown:null})"))
tick(1200)
r=B.evaluate("()=>{const r=Object.values(MP.rh)[0];return {vis:!!(r&&r.m&&r.m.visible),im:!!IM220.on,body:document.body.className,pl:pl.visible}}")
chk('B still sees A\'s hero, and B\'s own view is untouched',r['vis'] and not r['im'] and 'im220' not in r['body'] and r['pl'],r)
A.evaluate("()=>closeX()");ok=poll(lambda:A.evaluate("()=>{im220Tick();return !IM220.on&&pl.visible}"),30000);chk('A gets the hero back on closing',ok)
