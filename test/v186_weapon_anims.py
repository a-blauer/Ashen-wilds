# v186: contact sheets of the hero's basic-attack combos over time, plus wrist / weapon turn numbers.
#   CLS=mage WT=wand python3 v186_weapon_anims.py      -> out/v186_anim_<WT><TAG>.jpg
# The game clock is driven by hand (16 ms ticks); the attack button is held (swing() every tick), so combos chain as in play.
# A stunned dummy stands DIST m in front. Every EVERY ticks one frame is drawn: a 3/4 body view (row 1) and a close-up of the
# weapon hand (row 2). Numbers: per hand, the largest wrist turn in one tick (hand bone vs forearm) and the twist of the hand
# about the forearm (unwrapped, so a hand that spins shows a range of 360 deg or more).
#   SEC=2.4 (time held)  EVERY=3  W=150  SRC=<old build> TAG=_before  VIEW=34|side|front  HAND=R|L (close-up hand)
#   CHECK=1: FAIL lines when the hand's twist range is over MAXTW deg (default 200), the wrist turns over MAXF deg (default 45) or the
#   weapon's long axis (in the hero's frame) over MAXA deg (default 60) in one tick. NOSHOT=1: numbers only, no pictures.
import os,sys,json,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image,ImageDraw
CLS=os.environ.get('CLS','mage');WT=os.environ.get('WT','wand');SEC=float(os.environ.get('SEC','2.4'));EVERY=int(os.environ.get('EVERY','3'))
W=int(os.environ.get('W','150'));TAG=os.environ.get('TAG','');VIEW=os.environ.get('VIEW','34');HAND=os.environ.get('HAND','')
DIST=float(os.environ.get('DIST','0'))
JS=r"""async([cls,wt,sec,every,W,view,hand,dist,noshot])=>{const out={fr:[],log:[]};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
 const r0=ren.render.bind(ren);POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt==wt);if(tp<0)return {err:'no weapon '+wt};
 eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();STEP(30);
 const V=THREE.Vector3,Q=THREE.Quaternion,B=pl.bones;
 const D=dist||({wand:4,orb:4,staff:4,knives:2.6,bow:4,crossbow:4,sling:3}[wt]||1.3);
 const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x+D,pl.position.z,5,{});if(e){e.c.h=e.c.st.hp=1e7;e.stun=999;e.agg=1;tgt=e}try{EDGE163.fT=-1e9}catch(_){}
 // in Duskhold (the hero's body does not draw in this off-screen view out in the field): no foe stays there, so the fight
 // state (strike hold between attacks) and the aim are set by hand
 try{edge163Fight=()=>true}catch(_){}aimDir=()=>new V(1,0,0);face(new V(1,0,0));STEP(20);out.nE=enemies.filter(q=>!q.dead).length;
 const Ws=(pl.gearG||[]).filter(o=>o.userData&&o.userData.wt==wt&&o.parent);
 const hands=['R','L'].filter(s=>B['a'+s+'2']);
 const st={};hands.forEach(s=>st[s]={prev:null,max:0,maxAt:'',tw:null,twMin:1e9,twMax:-1e9,twPrev:null});
 const twist=(s)=>{const f=B['a'+s+'1'],h=B['a'+s+'2'];// hand twist about the forearm axis, as seen in the forearm frame
   const ql=h.quaternion.clone();const ax=h.position.clone().normalize();// forearm axis (forearm local, toward the wrist)
   // swing-twist decomposition: twist part of ql about ax
   const p=ax.clone().multiplyScalar(ql.x*ax.x+ql.y*ax.y+ql.z*ax.z),tq=new Q(p.x,p.y,p.z,ql.w).normalize();let a=2*Math.atan2(Math.hypot(tq.x,tq.y,tq.z),tq.w);if(tq.x*ax.x+tq.y*ax.y+tq.z*ax.z<0)a=-a;return a};
 const cnv=document.createElement('canvas');const cv=ren.domElement,w0=cv.width,h0=cv.height,bg0=scene.background,cam1=new THREE.PerspectiveCamera(36,1,.01,60);
 const shot=(lab)=>{if(noshot)return;pl.updateMatrixWorld(true);try{ren.info.reset()}catch(_){}pl.traverse(m=>{if(m.isSkinnedMesh)m.skeleton.update()});const ry=pl.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),rx=Math.cos(ry),rz=-Math.sin(ry),P=pl.position;
   const vv=view=='side'?[-rx*2.2,1.0,-rz*2.2]:view=='front'?[fx*2.3,1.0,fz*2.3]:(view=='34l'?[fx*1.6-rx*1.3,1.05,fz*1.6-rz*1.3]:[fx*1.6+rx*1.3,1.05,fz*1.6+rz*1.3]);
   ren.setSize(W,W,false);const hid=[];scene.children.forEach(o=>{if(o!==pl&&!o.isLight&&o.visible){o.visible=false;hid.push(o)}});scene.background=new THREE.Color(0x4a5560);
   const imgs=[];cam1.position.set(P.x+vv[0],P.y+vv[1],P.z+vv[2]);cam1.lookAt(P.x+fx*.2,P.y+.8,P.z+fz*.2);cam1.aspect=1;cam1.updateProjectionMatrix();r0(scene,cam1);imgs.push(cv.toDataURL('image/jpeg',.82));
   const hs=hand||(wt=='orb'?'L':'R'),hp=B['a'+hs+'2'].getWorldPosition(new V());const sg=hs=='R'?-1:1;
   cam1.position.set(hp.x+fx*.75-sg*rx*.5,hp.y+.3,hp.z+fz*.75-sg*rz*.5);cam1.lookAt(hp);r0(scene,cam1);imgs.push(cv.toDataURL('image/jpeg',.82));
   hid.forEach(o=>o.visible=true);scene.background=bg0;ren.setSize(w0,h0,false);out.fr.push({lab,imgs})};
 const wa={prev:null,max:0,at:''};
 const meas=(lab)=>{if(Ws[0]){const a=new V(0,-1,0).applyQuaternion(Ws[0].getWorldQuaternion(new Q())).applyQuaternion(pl.getWorldQuaternion(new Q()).invert());if(wa.prev){const g=Math.acos(Math.max(-1,Math.min(1,a.dot(wa.prev))))*180/Math.PI;if(g>wa.max){wa.max=g;wa.at=lab}}wa.prev=a}
 hands.forEach(s=>{const h=B['a'+s+'2'],S=st[s],q=h.quaternion.clone();if(S.prev){const d=Math.min(1,Math.abs(S.prev.dot(q))),a=2*Math.acos(d)*180/Math.PI;if(a>S.max){S.max=a;S.maxAt=lab}}S.prev=q;
   let t=twist(s);if(S.twPrev!=null){while(t-S.twPrev>Math.PI)t-=2*Math.PI;while(t-S.twPrev<-Math.PI)t+=2*Math.PI}S.twPrev=t;S.twMin=Math.min(S.twMin,t);S.twMax=Math.max(S.twMax,t)});
   const L={t:lab,k:HA.cur?+HA.cur.k.toFixed(2):-1,c:combo};hands.forEach(s=>L[s]=+(st[s].twPrev*180/Math.PI).toFixed(0));Ws.forEach((Wp,i)=>{const q=Wp.getWorldQuaternion(new Q()),y=new V(0,1,0).applyQuaternion(q),z=new V(0,0,1).applyQuaternion(q);L['w'+i]=[y.x,y.y,y.z,z.x,z.y,z.z].map(x=>+x.toFixed(2))});out.log.push(L)};
 const n=Math.round(sec*1000/16);let t=0;
 for(let i=0;i<12;i++){STEP(1);meas('idle'+i);if(i%every==0)shot('idle')}
 for(let i=0;i<n;i++){if(atkCd<=0){swing()}STEP(1);t++;meas('a'+i);if(i%every==0)shot((i*16/1000).toFixed(2)+'s c'+combo+(HA.cur?' k'+HA.cur.k.toFixed(2):''))}
 for(let i=0;i<45;i++){STEP(1);meas('r'+i);if(i%every==0)shot('rest '+(i*16/1000).toFixed(2))}
 out.st={};hands.forEach(s=>{const S=st[s];out.st[s]={maxTick:+S.max.toFixed(1),at:S.maxAt,twistRange:+((S.twMax-S.twMin)*180/Math.PI).toFixed(0)}});
 out.wax={maxTick:+wa.max.toFixed(1),at:wa.at};
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1500000)
    pg.click('[data-dev=desktop]',timeout=900000);pg.click('[data-c="%s"]'%CLS,timeout=900000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    pg.evaluate('()=>{window.FIGHT=1}')
    r=pg.evaluate(JS,[CLS,WT,SEC,EVERY,W,VIEW,HAND,DIST,bool(os.environ.get('NOSHOT'))])
    if r.get('err'):F('error %s'%r['err'])
    print(json.dumps(r.get('st')),'weapon axis',json.dumps(r.get('wax')),'enemies',r.get('nE'))
    if os.environ.get('LOG'):
        for L in r['log']:print(json.dumps(L))
    if os.environ.get('CHECK'):
        for h,q in (r.get('st') or {}).items():
            if q['twistRange']>float(os.environ.get('MAXTW','200')):F('%s %s hand %s: twisted %s deg about the forearm'%(CLS,WT,h,q['twistRange']))
            if q['maxTick']>float(os.environ.get('MAXF','45')):F('%s %s hand %s: wrist turned %s deg in one tick at %s'%(CLS,WT,h,q['maxTick'],q['at']))
        w=r.get('wax') or {}
        if w.get('maxTick',0)>float(os.environ.get('MAXA','60')):F('%s %s: the weapon turned %s deg in one tick at %s'%(CLS,WT,w['maxTick'],w['at']))
    fr=r['fr']
    if not fr:return
    cols=min(16,len(fr));rows=(len(fr)+cols-1)//cols
    sheet=Image.new('RGB',(cols*W,rows*2*W+0),(30,30,34));d=ImageDraw.Draw(sheet)
    for i,f in enumerate(fr):
        c=i%cols;rw=i//cols
        for j,u in enumerate(f['imgs']):
            im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sheet.paste(im,(c*W,(rw*2+j)*W))
        d.text((c*W+3,rw*2*W+2),f['lab'],fill=(255,255,180))
    p=play.TMP+'/v186_anim_%s%s.jpg'%(WT,TAG);sheet.save(p,quality=85);print('wrote',p,len(fr),'frames')
play.run(s,w=800,hh=500)
print('anim sheet: done' if not fails else 'CHECKS FAILED')
