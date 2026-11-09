# v207b: throwing knives cycle through varied throws (KN207, 3782); crossbow bolts are real bolts at their own size (BL207).
# Checks: 5 throws in a row use 4 different poses near contact, each throw starts and ends in the same stance, the knife still
# leaves forward, no NaN; a crossbow shot is a bolt ~0.7 long and points along its flight. Sheet: out/v207_throws.png (5 throws).
import play,json,base64,os
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v100_anim_lib.js').read()
JS=r"""(shot)=>{const T=V100T,out={};const ks=[0,.2,.33,.42,.55,.8,1];T.size(170,220);const C=shot?T.canvas(ks.length,5):null;KN207.i=0;
  out.throws=[];for(let j=0;j<5;j++){const r=T.play('knives',0,shot?ks:[],{dt:16,cx:C&&C.cx,row:j,views:[[[1,.3,.6],'v'+KN207.order[j]]]});
    const R=r.rec,h=Math.max(0,r.hitF),q=i=>R[Math.max(0,Math.min(R.length-1,i))];const a=q(h-2),b=q(h+1),hc=q(h).hR;
    out.throws.push({ms:Math.round(r.ms),n:R.length,hit:h,hand:hc,start:q(0).hR,end:q(R.length-1).hR,fwd:a&&b?+(b.hR[2]-a.hR[2]).toFixed(3):null,nan:R.some(s=>s.nan),err:r.errs.join(' ')})}
  if(C)out.sheet=C.c.toDataURL('image/png');
  // a crossbow bolt
  T.equip('crossbow');refreshGear(pl,hero.cls,eq);shots.length=0;WBEH.crossbow(CLS[hero.cls],HS(),10,V(0,0,1),1,.1);
  return new Promise(res=>setTimeout(()=>{const sh=shots[shots.length-1];if(!sh){out.bolt=null;res(out);return}sh.m.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(sh.m),s=bb.getSize(new THREE.Vector3()),q=new THREE.Quaternion();sh.m.getWorldQuaternion(q);const f=new THREE.Vector3(0,0,1).applyQuaternion(q),v=sh.v.clone().normalize();
    out.bolt={bolt:!!sh.bolt207,len:+Math.max(s.x,s.z).toFixed(2),wide:+Math.min(s.x,s.z).toFixed(2),along:+f.dot(v).toFixed(2)};res(out)},500))}"""
def s(pg):
    pg.set_default_timeout(1200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("(s)=>{(0,eval)(s)}",LIB)
    r=ev(JS,not os.environ.get('NOSHOT'))
    if r.get('sheet'):open(play.TMP+'/v207_throws.png','wb').write(base64.b64decode(r.pop('sheet').split(',')[1]))
    print(json.dumps(r)[:1500])
    T=r['throws'];fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    ok(all(not t['nan'] and not t['err'] and t['hit']>0 for t in T),'five throws play, each lands its knife (no NaN, no errors)')
    hs=[tuple(round(x,2) for x in t['hand']) for t in T]
    ok(len(set(hs))>=4,'the throwing hand is in a different place at release in at least 4 of 5 throws (%s)'%hs)
    d=max(max(abs(a-b) for a,b in zip(t['start'],T[1]['start'])) for t in T[1:])   # the first play starts from the session's first idle
    e=max(max(abs(a-b) for a,b in zip(t['end'],T[0]['end'])) for t in T)
    ok(d<.03 and e<.03,'every throw starts and ends in the same stance (start %.3f, end %.3f)'%(d,e))
    ok(all(t['fwd'] is not None and t['fwd']>0 for t in T),'the hand moves forward at release in every throw (%s)'%[t['fwd'] for t in T])
    b=r.get('bolt')
    ok(bool(b and b['bolt'] and .55<b['len']<.85 and b['wide']<.15 and b['along']>.95),'a crossbow shoots a bolt ~0.7 long, pointing along its flight (%s)'%b)
    print('FAILS',fails)
play.run(s)
