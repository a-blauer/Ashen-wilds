# v127 raven Mage gear sheets: each mage helm / chest / boots on the raven, 4 views each -> out/raven_gear_<slot>.jpg
#   SLOT=helm,chest,boots  DIST=1.3 (helms)  ITEMS=st1,st2 (only these styles)  POSE=idle|run|windup
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const V=THREE.Vector3,FW=300,FH=a.slot=='helm'?300:380,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.9);RT.rim.position.set(-3,3,-4);sc.add(RT.rim);const f=new THREE.DirectionalLight(0xffffff,.35);f.position.set(0,1,5);sc.add(f)}
  const it=(tp,r)=>({id:-1,tp,lv:1,req:1,r:r==null?3:r,up:0,aff:[]}),seen={},items=[];
  ITPL.forEach((t,i)=>{if(t.sl!=a.slot||t.arm!='cloth')return;const d=mdGD(it(i));if(!d||seen[d.st])return;if(a.only&&!a.only.includes(d.st))return;seen[d.st]=1;items.push({tp:i,st:d.st,n:t.n})});
  if(a.slot=='chest'&&!a.only)items.unshift({tp:-1,st:'outfit',n:'class outfit'});
  const views=[[0,.12,1,'front'],[1,.08,.05,'side'],[.75,.2,.7,'3/4'],[-.65,.25,-.8,'back 3/4']];
  const c=document.createElement('canvas');c.width=FW*4;c.height=FH*items.length;const x=c.getContext('2d');let H=null;
  const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='mage'&&itT(it(i)).wt==(a.wt||'staff'));
  items.forEach((I,row)=>{const E={};if(I.tp>=0)E[a.slot]=it(I.tp,3);if(a.wpn&&wtp>=0)E.weapon=it(wtp,2);
    if(H)sc.remove(H);H=RT.beast('mage',3,E);sc.add(H);if(!a.wpn)RT.hideW(H);RT.idle(H,800);
    if(a.pose=='run'){for(let t=0;t<900;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true)}
    if(a.pose=='windup')RT.pose(H,'sword0',.35);
    let cb,dist;if(a.slot=='helm'){const hp=H.bones.head.getWorldPosition(new V());cb=new V(hp.x,hp.y+.05,hp.z+.03);dist=a.dist||1.3}
      else if(a.slot=='boots'){cb=new V(0,.18,.02);dist=a.dist||1.5}else{cb=new V(0,a.cy==null?.8:a.cy,0);dist=a.dist||4.2}
    views.forEach((d,i)=>{const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(dist);pc.position.copy(cb).add(v);pc.lookAt(cb);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,row*FH);RT.lbl(x,i?d[3]:I.n+' ('+I.st+')',i*FW,row*FH,FW)})});
  sc.remove(H);return {img:c.toDataURL('image/jpeg',.88),n:items.length,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    if os.environ.get('EVAL'):ev('()=>{'+os.environ['EVAL']+'}')
    for sl in os.environ.get('SLOT','helm,chest,boots').split(','):
        only=os.environ.get('ITEMS');a={'slot':sl,'only':only.split(',') if only else None,'pose':os.environ.get('POSE','idle'),'wpn':int(os.environ.get('WPN','0')),'wt':os.environ.get('WT','staff')}
        if os.environ.get('DIST'):a['dist']=float(os.environ['DIST'])
        if os.environ.get('CY'):a['cy']=float(os.environ['CY'])
        r=ev(JS,a);print(sl,r['n'],'err',r['err'])
        nm='raven_gear_%s%s.jpg'%(sl,os.environ.get('TAG',''));open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
