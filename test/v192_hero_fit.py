# v192 hero fit (owner, Nov 2 2026): the Ranger's bow after a shot, the Ranger's hoods and chest pieces on the weasel, the Bard's hand.
#  1. bow: after a basic shot the bow goes straight back to its carry hold. Before v192 the hands kept the strike grip for 2 s
#     after every attack (v163 EDGE163.hold, made for melee edges): the bow hung upright by the riser in the low carry arm, then
#     turned back into the carry ~2 s later. Checked: 0.5 s after the shot the bow is within MAXB deg of its carry (v135
#     bow135Q, in the hero's frame), with a monster hunting nearby (the v163 fight hold) and without.
#  2. gear: every Ranger hood with a chest piece, tier by tier, on the weasel (+ the owner's screenshot set): the hood's own
#     mantle (its cloth grid below y 1.0) is no wider than the bare weasel's shoulders (arms included) + MAXM, and narrower
#     than the same piece built the pre-v192 way (FIT192.on=false, built fresh) by at least MIND unless that was already narrow.
#  3. bard: both arms (upper arm, forearm, paw) stay outside the lute's bowl (an ellipsoid) through his whole strumming loop.
#  SHEET=1: picture sheet out/v192_fit<TAG>.jpg (rows: combos; front / 3-4 / side / back / head 3-4 / head front) + bard close-ups.
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
MAXB=float(os.environ.get('MAXB','25'));MAXM=float(os.environ.get('MAXM','.15'))
MIND=float(os.environ.get('MIND','.02'))
TAG=os.environ.get('TAG','');SHEET=os.environ.get('SHEET','')
fails=[]
def F(m):fails.append(m);print('FAIL',m,flush=True)
# ---------------- 1. the bow after a shot ----------------
BOW=r"""async(fight)=>{const out={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 {const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1])}enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='ranger'&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt=='bow');eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();
 EDGE163.last=-1e9;EDGE163.fT=-1e9;STEP(120);
 const E0=pl._grip&&pl._grip.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent),W=E0&&E0.W;if(!W)return {err:'no bow'};
 out.bows=(pl.gearG||[]).filter(o=>o.userData&&o.userData.wt=='bow'&&o.parent).length;
 // the bow the grip holds now (the same item built again replaces the model: always measure the live one)
 const BW=()=>{const e=pl._grip&&pl._grip.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent);return e?e.W:W};
 const QH=()=>{const a=new THREE.Quaternion(),b=new THREE.Quaternion();pl.getWorldQuaternion(a);BW().getWorldQuaternion(b);return a.invert().multiply(b)};
 const ang=(a,b)=>2*Math.acos(Math.min(1,Math.abs(a.dot(b))))*180/Math.PI;
 // the carry the bow has with no attack and no monster near (in a fight before v192 the hands already held the strike grip)
 const q0=bow135Q().clone();out.w0=+pl._grip.w.toFixed(2);out.q0vsV135=+ang(q0,bow135Q()).toFixed(1);out.st0=[!!HA.cur,HA.cur?String(HA.cur.pose&&HA.cur.pose.name):'',+(IDL.cbV||0),!!pl._b192,typeof riding!='undefined'&&!!riding,+pl._grip.w.toFixed(2),W.parent&&W.parent.name];
 if(!window.__bc192){window.__bc192=1;const f=bow135Carry;bow135Carry=function(h){window.__bcN=(window.__bcN||0)+1;const r=f.apply(this,arguments);try{if(h===pl){const e=pl._grip.L.find(q=>q.ty=='bow'&&q.W&&q.W.parent);const a=new THREE.Quaternion(),b=new THREE.Quaternion();pl.getWorldQuaternion(a);e.W.getWorldQuaternion(b);window.__bcA=+ang(bow135Q(),a.invert().multiply(b)).toFixed(1);window.__bcW=e.W===W}}catch(err){window.__bcA='err '+err}return r}}
 if(fight&&!window.__ah192){window.__ah192=1;const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);if((h||pl)===pl){window.__snap=['pelvis','spine','chest','neck','aL0','aL1','aL2','aR0'].map(n=>[n,pl.bones[n].quaternion.clone()]);window.__rotY=pl.rotation.y;window.__plq=pl.quaternion.clone()}return r}}
 if(fight){STEP(1);const ch=window.__snap.map(([n,q])=>[n,+ang(q,pl.bones[n].quaternion).toFixed(1)]).filter(x=>x[1]>.05);out.afterAnim=[ch,+(pl.rotation.y-window.__rotY).toFixed(3),+ang(window.__plq,pl.quaternion).toFixed(1),pl.parent&&pl.parent.type]}
 {const a=[];for(let i=0;i<20;i++){window.__bcN=0;window.__bcA=null;STEP(1);a.push([+ang(q0,QH()).toFixed(1),window.__bcN,window.__bcA,window.__bcW,+W.scale.x.toFixed(3),+W.scale.y.toFixed(3)])}out.idleDrift=a.filter((_,i)=>i%5==0)}
 if(fight){const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x+6,pl.position.z,5,{});if(e){e.c.h=e.c.st.hp=1e7;e.stun=999;e.agg=1}EDGE163.fT=-1e9;STEP(30);out.wFight=+pl._grip.w.toFixed(2)}
 atkCd=0;swing();let n=0;while(HA.cur&&n<200){STEP(1);n++}out.shotFrames=n;
 const tr=[],dx=[];for(let i=0;i<150;i++){STEP(1);tr.push(+ang(q0,QH()).toFixed(1));if(i%10==0){const hq=new THREE.Quaternion(),pq=new THREE.Quaternion();pl.getWorldQuaternion(hq);BW().parent.getWorldQuaternion(pq);const T=hq.clone().multiply(bow135Q()),pw=pq.clone().multiply(BW().quaternion);
   dx.push([tr[i],+pl._grip.w.toFixed(2),HA.cur?+HA.cur.k.toFixed(2):-1,pl._b192?1:0,+(IDL.cbV||0),+pl.rotation.y.toFixed(2),+ang(T,pw).toFixed(1),+ang(q0,hq.clone().invert().multiply(T)).toFixed(1)])}}out.dx=dx;
 out.after05=tr[31];out.after1=tr[62];out.after2=tr[124];out.max05_2=Math.max(...tr.slice(31));out.trace=tr.filter((_,i)=>i%10==0);out.wEnd=+pl._grip.w.toFixed(2);
 return out}"""
# ---------------- 2. gear fit ----------------
GEAR=COMMON+r"""(a)=>{const [rows,sheet]=a,V=THREE.Vector3,out={rows:[],img:null};const FW=210,FH=270;let rd,sc,pc;if(sheet){const R=RT.mk(FW,FH,0x262a30);rd=R.rd;sc=R.sc;pc=R.pc}
  const views=['front','34','side','back','h34','hf'],cnv=sheet?document.createElement('canvas'):null;if(cnv){cnv.width=FW*views.length;cnv.height=FH*rows.length}const ctx=cnv?cnv.getContext('2d'):null;
  const byName=n=>ITPL.findIndex(t=>t.n==n);
  if(!window.__gkw){window.__gkw=1;const f=gkHood;gkHood=function(B,P,o){const H=f.apply(this,arguments);try{let m=0,my=0,top=0;H.G.forEach(r=>r.forEach(v=>{if(v.y<1.0&&Math.abs(v.x)>m){m=Math.abs(v.x);my=v.y}}));window.__hw={w:m,y:my}}catch(_){}return H}}
  rows.forEach((r,ri)=>{const [cls,race,helm,chest]=r,E={};const th=byName(helm),tc=byName(chest);if(th>=0)E.helm=RT.it(th,2);if(tc>=0)E.chest=RT.it(tc,2);
    let old=null;if(race==5&&th>=0){FIT192.on=false;mdS().G.clear();window.__hw=null;try{RT.beast(cls,race,E)}catch(_){}old=window.__hw;FIT192.on=true;mdS().G.clear()}
    window.__hw=null;const H=RT.beast(cls,race,E);RT.hideW(H);if(sc)sc.add(H);RT.idle(H,400);H.updateMatrixWorld(true);
    // vertices of the whole model in its bind pose (geometry space: the measurements of the build)
    const P=[];H.traverse(m=>{if(m.isSkinnedMesh&&m.geometry&&m.geometry.attributes.position){const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++)P.push([pa.getX(i),pa.getY(i),pa.getZ(i)])}});
    const D=BRD[race],ey=D.EYEP[1],ez=D.EYEP[2];
    // shoulders: the widest body point at the shoulder line (arms included), from the bare body of the same race
    const key='sh'+race;if(!RT[key]){BR.bare=true;const Hb=RT.beast(cls,race,{});BR.bare=false;let sw=0;Hb.traverse(m=>{if(m.isSkinnedMesh&&m.geometry){const pa=m.geometry.attributes.position;for(let i=0;i<pa.count;i++){const y=pa.getY(i);if(y>.86&&y<1.0)sw=Math.max(sw,Math.abs(pa.getX(i)))}}});RT[key]=sw}
    const shW=RT[key],hw=window.__hw,mw=hw?hw.w:0,mwY=hw?hw.y:0;
    out.rows.push({lab:cls+'/'+D.key+' '+helm+' + '+chest,shoulder:+shW.toFixed(3),wide:+mw.toFixed(3),wideY:+mwY.toFixed(2),over:hw?+(mw-shW).toFixed(3):null,overOld:old?+(old.w-shW).toFixed(3):null,miss:[th<0?helm:null,tc<0?chest:null].filter(Boolean)});
    if(sheet){const cb=new V(0,.82,0),hp=H.bones.head.getWorldPosition(new V()),hc=new V(hp.x,hp.y+.03,hp.z+.03);
      const shot=(col,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,ri*FH);RT.lbl(ctx,l,col*FW,ri*FH,FW)};
      views.forEach((v,col)=>{const lab=col?v:(helm.split(' ').slice(-2).join(' ')+' + '+chest.split(' ').slice(-2).join(' '));
        if(v=='front')shot(col,[0,.12,1],cb,3.5,lab);else if(v=='34')shot(col,[.8,.15,.6],cb,3.5,lab);else if(v=='side')shot(col,[1,.1,0],cb,3.5,lab);else if(v=='back')shot(col,[-.4,.35,-.9],cb,3.5,lab);
        else if(v=='h34')shot(col,[.75,.2,.6],hc,1.05,lab);else shot(col,[0,.1,1],hc,1.05,lab)})}
    if(sc)sc.remove(H)});
  if(cnv)out.img=cnv.toDataURL('image/jpeg',.86);out.err=RT.err||null;return out}"""
# ---------------- 3. the bard ----------------
BARD=COMMON+r"""(sheet)=>{const V=THREE.Vector3,out={fr:[],img:null};
  const o={robe:0x8a2a5a,trim:0xd8b44a,hat:'cap',hatC:0x5a1a3a,label:'Traveling Bard'};const rig=idlNpcBody(o),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;
  g._wk={k:'bard',t0:0,base:0,g,mote:null,rest:czRest103(g)};const tl=wkTool103('lute');g.add(tl);tl.position.set(.02,1.02,.22);tl.rotation.set(.15,0,-.85);g._wk.tool=tl;
  let sc,rd,pc,FW=260,FH=260,ctx=null,cnv=null;if(sheet){const R=RT.mk(FW,FH,0x262a30);rd=R.rd;sc=R.sc;pc=R.pc;sc.add(g);cnv=document.createElement('canvas');cnv.width=FW*6;cnv.height=FH*2;ctx=cnv.getContext('2d')}
  // the bowl: the lute's first child (a sphere of radius .17 scaled 1, 1.25, .45 in the lute's frame)
  const bowl=tl.children[0],neck=tl.children[1];
  const paw=(side)=>{const b=g.bones['a'+side+'2'],e=g.bones['a'+side+'1'];const p=b.getWorldPosition(new V()),q=e.getWorldPosition(new V());const d=p.clone().sub(q).normalize();return [p,p.clone().addScaledVector(d,.07)]};
  const inside=(pt)=>{const l=bowl.worldToLocal(pt.clone());return Math.hypot(l.x/.17,l.y/.17,l.z/.17)};   // < 1 = inside the bowl (bowl.scale is part of worldToLocal)
  const camO=cam.position.clone();cam.position.set(0,2,3);
  const arm=(s)=>{const a=g.bones['a'+s+'0'].getWorldPosition(new V()),e=g.bones['a'+s+'1'].getWorldPosition(new V()),[w,tip]=paw(s),P=[];
    for(let j=4;j<=10;j++)P.push(a.clone().lerp(e,j/10));for(let j=0;j<=10;j++)P.push(e.clone().lerp(w,j/10));P.push(w.clone().lerp(tip,.5),tip);return Math.min(...P.map(inside))};
  for(let i=0;i<24;i++){const t=i*130;wkAnim103(g,t);g.updateMatrixWorld(true);
    const r={t,pole:[g._wk.b192L,g._wk.b192R]};['L','R'].forEach(s=>{r[s]=+arm(s).toFixed(2)});
    // the strumming paw's distance to the bowl's front face (lute frame z) and the neck hand's distance to the neck
    const [w2,t2]=paw('L');const lt=tl.worldToLocal(t2.clone());r.strumZ=+lt.z.toFixed(3);r.strumY=+lt.y.toFixed(3);
    const [w3,t3]=paw('R');const ln=tl.worldToLocal(w3.clone().lerp(t3,.5));r.neckX=+ln.x.toFixed(3);r.neckY=+ln.y.toFixed(3);r.neckZ=+ln.z.toFixed(3);
    out.fr.push(r);
    if(sheet&&i<6){const c=tl.getWorldPosition(new V()).add(new V(0,.05,0));[[0,.15,1],[.9,.3,.5]].forEach((dv,j)=>{pc.position.copy(c).add(new V(...dv).normalize().multiplyScalar(.95));pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,i*FW,j*FH)})}}
  cam.position.copy(camO);if(cnv)out.img=cnv.toDataURL('image/jpeg',.88);return out}"""
RANGER_H=['Leather Hood','Wolfpelt Hood','Emberstalker Cowl','Bonehunter Hood','Galewing Mask','Pathfinder Hood','Trapper Cap','Crowfeather Cowl','Deadeye Hood','Bogstalker Hood','Hornwood Hood','Gravehound Hood','Windrunner Hood','Moonhunter Cowl']
RANGER_C=['Padded Jerkin','Studded Brigandine','Emberstalker Vest','Bonehunter Coat','Galewing Mantle','Pathfinder Coat','Trapper Jerkin','Crowfeather Coat','Deadeye Coat','Bogstalker Vest','Hornwood Harness','Gravehound Longcoat','Windrunner Coat','Moonhunter Mantle']
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.set_default_timeout(1500000)
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="ranger"]',timeout=300000);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(3000)
    PART=os.environ.get('PART','bow,bard,gear').split(',')
    if 'bow' in PART:
        for fight in (0,1):
            r=ev(BOW,fight)
            print('bow','fight' if fight else 'calm',json.dumps(r))
            if r.get('err'):F('bow: error %s'%r['err']);continue
            if r['after05']>MAXB:F('bow (%s): 0.5 s after the shot the bow is still %s deg from its carry (max %s) [deg,w,k,snap,combat,rotY,bowVsCarryTarget,targetVsQ0] %s'%('fight' if fight else 'calm',r['after05'],MAXB,json.dumps(r.get('dx'))))
            if r['max05_2']>MAXB:F('bow (%s): between 0.5 and 2.4 s after the shot it turns %s deg from its carry'%('fight' if fight else 'calm',r['max05_2']))
    if 'bard' in PART:
        r=ev(BARD,bool(SHEET))
        mins=[min(f['L'],f['R']) for f in r['fr']]
        for f in r['fr'][:6]:print('bard',json.dumps(f))
        print('bard: smallest arm-in-bowl ratio over 24 frames (< 1 = inside the bowl):',min(mins))
        if min(mins)<1.0:F('bard: an arm passes through the lute\'s bowl (ratio %.2f, < 1 = inside) frames %s'%(min(mins),json.dumps([f for f in r['fr'] if min(f['L'],f['R'])<1][:4])))
        if SHEET and r.get('img'):open(O+'/v192_bard%s.jpg'%TAG,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote v192_bard%s.jpg'%TAG)
    if 'gear' in PART:
        # every ranger hood with the chest piece of the same row (14 x 1) + the owner's screenshot set (Hornwood Hood + Galewing / Moonhunter Mantle)
        rows=[['ranger',5,h,c] for h,c in zip(RANGER_H,RANGER_C)]+[['ranger',5,'Hornwood Hood','Galewing Mantle'],['ranger',5,'Hornwood Hood','Moonhunter Mantle'],['ranger',5,'Bonehunter Hood','Windrunner Coat']]
        others=[['warrior',1,'',''],['assassin',2,'',''],['mage',3,'',''],['paladin',4,'','']]
        r=ev(GEAR,[rows+others,bool(SHEET)])
        if r.get('err'):F('gear build error %s'%r['err'])
        for q in r['rows']:
            print(json.dumps(q))
            if q['miss']:F('missing items %s'%q['miss'])
            if q['lab'].startswith('ranger') and q['over'] is not None and q['overOld'] is not None and q['overOld']>.08 and q['over']>q['overOld']-MIND:F('%s: the hood\'s mantle is not narrower than before v192 (%s m past the shoulders, was %s)'%(q['lab'],q['over'],q['overOld']))
            if q['lab'].startswith('ranger') and q['over'] is not None and q['over']>MAXM:F('%s: the hood\'s mantle reaches %s m past the shoulders at y %s (max %s)'%(q['lab'],q['over'],q['wideY'],MAXM))
        if SHEET and r.get('img'):open(O+'/v192_fit%s.jpg'%TAG,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote v192_fit%s.jpg'%TAG)
        if SHEET:
            r2=ev(GEAR,[[['warrior',1,'Gravewarden Helm','Gravewarden Hauberk'],['assassin',2,'Voidwalker Hood','Voidwalker Garb'],['mage',3,'Candlemourn Hood','Candlemourn Robe'],['paladin',4,'Reliquarian Crown-Helm','Reliquarian Aegis']],True])
            for q in r2['rows']:print('other race',json.dumps(q))
            if r2.get('img'):open(O+'/v192_fit_others%s.jpg'%TAG,'wb').write(base64.b64decode(r2['img'].split(',')[1]));print('wrote v192_fit_others%s.jpg'%TAG)
play.run(s,w=900,hh=600)
print('v192 hero fit: checked' if not fails else 'CHECKS FAILED')
