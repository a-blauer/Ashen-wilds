# v195 beast kit: the weasel Ranger (3600 / 3601) — pictures and checks.
#   python3 v195_weasel.py   -> out/v195_weasel_body<TAG>.jpg (bare model, close-ups), out/v195_weasel_gest<TAG>.jpg (idle gestures),
#                               out/v195_weasel_gear<TAG>.jpg (class outfit + three armour sets, idle / walk / draw)
#   OLD=1 builds the old (v114) weasel for comparison; FURI=n picks another fur colour.
# FAIL on: a build error, NaN vertices, the cage body missing, too many triangles, a gesture that throws or leaves the bones
# off after it ends, a skull measurement (rings / eyes / ears) missing for the helmets.
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;TAG=os.environ.get('TAG','');FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read()
COMMON=src[src.index('COMMON=r"""')+11:src.index('"""',src.index('COMMON=r"""')+11)]
JS=COMMON+r"""(a)=>{const [old,furi]=a,V=THREE.Vector3,out={info:{}};if(old)BF195.on=false;window.FURI=furi;
  const FW=330,FH=440,{rd,sc,pc}=RT.mk(FW,FH);
  const shot=(ctx,col,row,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
  // ---- 1: the bare body ----
  BR.bare=true;const R=RT.beast('ranger',5,{});BR.bare=false;sc.add(R);RT.hideW(R);RT.idle(R,800);
  const body=huBody(R),G=body.geometry;let nan=0;const pa=G.attributes.position.array;for(let i=0;i<pa.length;i++)if(!isFinite(pa[i]))nan++;
  let tris=0;R.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry){const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3}});
  out.info.tris=Math.round(tris);out.info.nan=nan;out.info.bf=!old&&!!BRD[5].bf;out.info.SN=(BRD[5].SN||[]).length;out.info.ear=BRD[5].earE?BRD[5].earE.map(v=>+v.toFixed(3)):null;out.info.eye=BRD[5].EYEP;
  const c1=document.createElement('canvas');c1.width=FW*6;c1.height=FH*2;const x1=c1.getContext('2d');
  const cb=new V(0,.78,0);shot(x1,0,0,[0,.1,1],cb,3.9,'front');shot(x1,1,0,[1,.08,0],cb,3.9,'side');shot(x1,2,0,[0,.15,-1],cb,3.9,'back');shot(x1,3,0,[.8,.2,.6],cb,3.9,'3/4');shot(x1,4,0,[-.7,.3,-.65],cb,3.9,'back 3/4');
  const hp=R.bones.head.getWorldPosition(new V()),hc=new V(hp.x,hp.y+.05,hp.z+.07);
  shot(x1,5,0,[.3,.5,1],hc,.75,'head above');shot(x1,0,1,[0,.08,1],hc,.62,'face');shot(x1,1,1,[1,.05,.05],hc,.65,'head side');shot(x1,2,1,[.75,.15,.65],hc,.62,'head 3/4');
  const sp=R.bones.aR0.getWorldPosition(new V());shot(x1,3,1,[.9,.25,.5],sp,.75,'shoulder');const pp=R.bones.pelvis.getWorldPosition(new V());shot(x1,4,1,[.5,.15,-1],pp,.9,'hips + tail root');
  for(let t=0;t<900;t+=16){RT.T+=16;animHero(RT.T,true,R);R.position.set(0,0,0)}R.updateMatrixWorld(true);shot(x1,5,1,[1,.12,.2],cb,4,'walk');
  out.body=c1.toDataURL('image/jpeg',.88);
  // ---- 2: gestures (each at its middle and late), and the bones back where they were after one ends ----
  const L=(BRD[5].bf&&BRD[5].bf.gest)||[];out.info.gest=L.map(g=>g.id);const c2=document.createElement('canvas');c2.width=FW*Math.max(1,L.length);c2.height=FH*2;const x2=c2.getContext('2d');
  RT.idle(R,600);const snap=()=>Object.keys(R.bones).map(n=>R.bones[n].rotation.toArray().slice(0,3).map(v=>+v.toFixed(4)).join(',')).join(';');
  out.info.gerr=null;try{L.forEach((g,i)=>{[[.5,0],[.8,1]].forEach(([u,row])=>{BF195M.pose={id:g.id,u,s:1};RT.idle(R,64);shot(x2,i,row,row?[.8,.2,.6]:[1,.15,.25],new V(0,.85,0),3.5,g.id+' u='+u)})});}catch(e){out.info.gerr=String(e)}
  BF195M.pose=null;RT.idle(R,400);out.info.settled=R._bfm&&!R._bfm.g&&R._bfm.gs===0?1:0;
  out.gest=c2.toDataURL('image/jpeg',.88);
  // a gesture started for real plays, ends and leaves nothing behind (time runs on RT.T)
  try{RT.idle(R,1200);const S=R._bfm;if(S&&L.length){S.gT=0;RT.idle(R,32);out.info.started=!!S.g;RT.idle(R,6000);out.info.ended=!S.g}}catch(e){out.info.gerr=String(e)}
  // ---- motion: run, stop, turn while running; the largest change of any bone between two 16 ms frames, and what the springs did ----
  try{RT.idle(R,800);const names=Object.keys(R.bones),prev=names.map(n=>R.bones[n].quaternion.clone());let mx=0,mxb='',lead=0,stop=0;
    const step=(mv,yr)=>{RT.T+=16;R.rotation.y+=yr||0;animHero(RT.T,mv,R);R.position.set(0,0,0);names.forEach((n,i)=>{const q=R.bones[n].quaternion,a=2*Math.acos(Math.min(1,Math.abs(q.dot(prev[i]))));if(a>mx){mx=a;mxb=n}prev[i].copy(q)});
      const A=R._bfm&&R._bfm.sp;if(A){lead=Math.max(lead,Math.abs(A[0]));stop=Math.max(stop,A[2])}};
    for(let i=0;i<60;i++)step(true,0);for(let i=0;i<60;i++)step(true,.035);for(let i=0;i<90;i++)step(false,0);
    out.info.motion={maxStep:+mx.toFixed(3),bone:mxb,lead:+lead.toFixed(3),stop:+stop.toFixed(3)}}catch(e){out.info.merr=String(e)}
  sc.remove(R);
  // ---- 3: gear ----
  const ARM='medium',sets=[{n:'class outfit',r:0}].concat([['hood','padded','trail',0],['cowl','vest','stalker',2],['galemask','mantle','gale',4]].map(q=>({n:q[0]+' / '+q[1],helm:q[0],chest:q[1],boots:q[2],r:q[3]})));
  const c3=document.createElement('canvas');c3.width=FW*5;c3.height=FH*sets.length;const x3=c3.getContext('2d');
  sets.forEach((S,row)=>{const E={};['helm','chest','boots'].forEach(sl=>{if(S[sl]){const tp=RT.find(sl,ARM,S[sl]);if(tp>=0)E[sl]=RT.it(tp,S.r)}});
    const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='ranger'&&itT(RT.it(i)).wt=='bow');if(wtp>=0)E.weapon=RT.it(wtp,S.r);
    const H=RT.beast('ranger',5,E);sc.add(H);RT.idle(H,600);const c=new V(0,.85,0);
    shot(x3,0,row,[0,.12,1],c,4,S.n);shot(x3,1,row,[.8,.15,.6],c,4,'3/4');shot(x3,2,row,[-.6,.2,-.8],c,4,'back 3/4');
    const h2=H.bones.head.getWorldPosition(new V());shot(x3,3,row,[.7,.2,.7],new V(h2.x,h2.y+.05,h2.z+.05),.8,'head');
    for(let t=0;t<700;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true);shot(x3,4,row,[1,.12,.25],c,4,'walk');sc.remove(H)});
  out.gear=c3.toDataURL('image/jpeg',.88);out.err=RT.err||null;BF195.on=true;return out}"""
def save(n,u):open(O+'/'+n,'wb').write(base64.b64decode(u.split(',')[1]));print('wrote',n)
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    old=bool(os.environ.get('OLD'))
    r=ev(JS,[old,int(os.environ.get('FURI','0'))]);I=r['info'];print(json.dumps(I))
    save('v195_weasel_body%s.jpg'%TAG,r['body']);save('v195_weasel_gest%s.jpg'%TAG,r['gest']);save('v195_weasel_gear%s.jpg'%TAG,r['gear'])
    chk('builds without errors',not r['err'],r['err'])
    chk('no NaN vertices',I['nan']==0,I['nan'])
    if not old:
        chk('beast kit on',I['bf'])
        chk('triangles within the hero budget (12k)',I['tris']<12000,I['tris'])
        chk('skull measured for the helmets',I['SN']>=10 and I['ear'] and I['eye'],(I['SN'],I['ear'],I['eye']))
        chk('gestures pose without errors',not I['gerr'],I['gerr'])
        chk('no gesture offsets left after the gesture poses',I['settled']==1)
        chk('motion layer runs',not I.get('merr') and I.get('motion'),I.get('merr') or I.get('motion'))
        chk('springs act: turn lead and stop follow-through',I.get('motion') and I['motion']['lead']>.02 and I['motion']['stop']>.005,I.get('motion'))
    if I.get('motion'):print('NOTE largest bone change per 16 ms frame (run / turn / stop):',I['motion'])
    if not old:
        chk('a gesture starts and ends on its own',I.get('started') and I.get('ended'),(I.get('started'),I.get('ended')))
play.run(s,w=900,hh=600)
print('FAILURES:',FAIL if FAIL else 'none')
