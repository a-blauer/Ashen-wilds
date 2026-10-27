# v119 ability preview: the Abilities window plays the real ability (real cast, pose and effects) on a training stage.
# For every class (as its beast) and every ability: run the preview loop in real time (render stubbed in the main loop),
# grab two frames (wind-up / impact), and check: the cast happened, the dummy was hit (abilities that hit), the hero is back
# in the world afterwards and the world's hero / ability state is unchanged.
# out/v119_abprev_<cls>.jpg (two frames per ability), out/v119_abwin.png (the window). CLS=mage,... to limit; ONLY=name.
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n+('' if ok else '  '+str(info)[:400]))
    if not ok:FAIL.append(n)
CL=os.environ.get('CLS','warrior,paladin,assassin,ranger,mage').split(',')
ONLY=os.environ.get('ONLY','')
CAPS=[float(v) for v in os.environ.get('CAPS','.32,.85').split(',')]
RACE={'warrior':1,'assassin':2,'mage':3,'paladin':4,'ranger':5}
JS=r"""async(a)=>{const [c,rid,only,CAPS]=a;
  ren.render=()=>{};if(typeof POST!='undefined')POST.render=()=>{};
  if(xwMode=='abil'&&!$('xw').classList.contains('hide'))closeX();
  hero.cls=c;hero.lvl=50;hero.look={race:rid,skin:BRD[rid].fur[0],eye:BRD[rid].eye[0]};eq={};
  const W=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==c&&t.t==0),Ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[c].arm&&t.t==0);
  eq.weapon={id:1,tp:W,lv:1,req:1,r:0,up:0,aff:[]};eq.chest={id:2,tp:Ch,lv:1,req:1,r:0,up:0,aff:[]};
  if(c=='paladin')eq.offhand={id:3,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==0),lv:1,req:1,r:0,up:0,aff:[]};
  hero.tal={__ab:1};KQS.ck='';try{refreshGear()}catch(e){}hsDirty();hero.hp=heroMax();hero.mp=mpMax();
  const snap=()=>JSON.stringify({h:hero,cd:hero.cd,k:{ch:KQS.ch,objs:KQS.objs.length,st:KQS.stealth,hist:KQS.hist.length,cdn:KQS.cdn},p:[pl.position.x,pl.position.y,pl.position.z,pl.rotation.y],en:enemies.length,sh:shots.length,zo:zones.length,tr:traps.length,tws:tws.length,HA:!!HA.cur,riding:!!riding});
  const hf0=GH(pl.position.x+3,pl.position.z+1);
  const before=snap();openAbil();await new Promise(r=>setTimeout(r,200));
  const all=kqsAll(c).filter(s=>!only||s.n==only),FW=240,FH=150,NC=CAPS.length,cv=document.createElement('canvas');cv.width=FW*NC*2;cv.height=FH*Math.ceil(all.length/2);const x=cv.getContext('2d');
  const out={info:[],fail:[],nohit:[],img:''};
  for(let i=0;i<all.length;i++){const s=all[i];KQS.sel=s.n;
    try{XR.abil()}catch(e){out.fail.push(s.n+': render '+e)}
    PV.run=false;if(ABX.on)abxCycle(performance.now());ABX.hits=0;let casted=false,cd=0,err='';
    if(!ABX.on){out.fail.push(s.n+': preview not running ('+($('abPV')&&$('abPV').innerText)+')');continue}
    const t0=ABX.t0,caps=CAPS.map(v=>ABX.lead+v),shots=[];let last=performance.now();
    while(true){await new Promise(r=>setTimeout(r,16));const now=performance.now();try{PV.upd(now,Math.min(.05,(now-last)/1000))}catch(e){err=String(e);break}last=now;
      if(ABX.cast&&!casted){casted=true}
      const t=ABX.gt;if(ABX.t0!==t0)break;
      while(shots.length<caps.length&&t>=caps[shots.length]){PV.r.setSize(FW,FH,false);PV.cam.aspect=FW/FH;PV.cam.updateProjectionMatrix();abxCam(1);PV.r.render(PV.sc,PV.cam);
        x.drawImage(PV.cv,((i%2)*NC+shots.length)*FW,Math.floor(i/2)*FH);shots.push(1)}
      if(shots.length>=caps.length&&t>ABX.lead+1.2&&(ABX.hits>0||t>ABX.lead+3.2))break;
      if(t>9)break}
    // abilities that scatter their hits at random (Comet Storm: 8 comets anywhere in a 5-tile circle) can miss the dummy in one
    // loop by bad luck (~1 in 6); such an ability gets up to 4 more loops of the preview to land a hit (one that never hits still fails)
    const wantHit=!/Buff|Shield|Heal|Stealth|Defensive|Time|Mobility|Teleport|Summon|Banner|Beacon|Ward|Trap|Seal|Invulnerable|Portal/.test((s.ty||KQS_TY[s.k]||'')+'');
    let loops=1;
    while(wantHit&&!ABX.hits&&!err&&ABX.on&&loops<5){loops++;abxCycle(performance.now());const t1=ABX.t0;last=performance.now();
      while(true){await new Promise(r=>setTimeout(r,16));const now=performance.now();try{PV.upd(now,Math.min(.05,(now-last)/1000))}catch(e){err=String(e);break}last=now;
        if(ABX.t0!==t1||ABX.hits>0||ABX.gt>9)break}}
    if(loops>1)out.info.push(s.n+': '+loops+' loops');
    x.fillStyle='rgba(0,0,0,.6)';x.fillRect((i%2)*NC*FW,Math.floor(i/2)*FH,FW*NC,16);x.fillStyle='#fff';x.font='11px sans-serif';x.fillText(s.n+' · hits '+ABX.hits,(i%2)*NC*FW+4,Math.floor(i/2)*FH+12);
    out.info.push(s.n+':'+ABX.hits);if(err)out.fail.push(s.n+': '+err);if(!casted)out.fail.push(s.n+': no cast');
    if(!ABX.hits&&wantHit)out.nohit.push(s.n)}
  out.img=cv.toDataURL('image/jpeg',.85);
  abxStop();const aft=snap();out.inScene=pl.parent===scene;KQS.sel=all[0].n;XR.abil();PV.run=false;out.restart=ABX.on;
  closeX();await new Promise(r=>setTimeout(r,400));
  out.on=ABX.on;out.same=before===aft;if(!out.same){const A=JSON.parse(before),B=JSON.parse(aft),d=[];const walk=(a,b,p)=>{if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a=='object'&&typeof b=='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'.'+k)}else d.push(p+': '+JSON.stringify(a)+' -> '+JSON.stringify(b))};walk(A,B,'');out.before=d.slice(0,12);out.after=''}out.hf=Math.abs(GH(pl.position.x+3,pl.position.z+1)-hf0)<1e-6;out.inScene=out.inScene&&pl.parent===scene;
  return out}"""
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.set_default_timeout(1800000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    for c in CL:
        r=ev(JS,[c,RACE[c],ONLY,CAPS])
        print(c,r['info'])
        open(play.TMP+'/v119_abprev_%s.jpg'%c,'wb').write(base64.b64decode(r['img'].split(',')[1]))
        chk(c+': every ability previews (cast, no errors)',not r['fail'],r['fail'])
        chk(c+': attacks hit the dummy',not r['nohit'],r['nohit'])
        chk(c+': preview stops when the window closes, hero back in the world',r['restart'] and not r['on'] and r['inScene'],(r['restart'],r['on'],r['inScene']))
        chk(c+': world hero and ability state unchanged',r['same'],(r.get('before'),r.get('after')))
        chk(c+': ground heights restored',r['hf'])
    ev("()=>{openAbil()}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v119_abwin.png')
    ev("()=>{closeX()}")
    chk('no page errors',not errs,errs[:3])
play.run(s,w=1100,hh=760)
print('FAILURES:',FAIL if FAIL else 'none')
