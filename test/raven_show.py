# v134 raven Mage: showcase renders (bare turnaround, dressed turnarounds, head close-ups) -> out/raven_*.jpg
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read()
COMMON=re.search(r'COMMON=r"""(.*?)"""',src,re.S).group(1)
JS=COMMON+r"""(a)=>{const V=THREE.Vector3,FW=420,FH=560,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  const rim=new THREE.DirectionalLight(0xa8b8ff,.9);rim.position.set(-3,3,-4);sc.add(rim);const fill=new THREE.DirectionalLight(0xffffff,.35);fill.position.set(0,1,5);sc.add(fill);
  const out={},shots=[[0,.12,1,'front'],[.8,.15,.65,'3/4'],[1,.08,0,'side'],[-.65,.2,-.8,'back 3/4']];
  const sheet=(H,label)=>{const c=document.createElement('canvas');c.width=FW*4;c.height=FH;const x=c.getContext('2d'),cb=new V(0,.82,0);
    shots.forEach((d,i)=>{const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(4.1);pc.position.copy(cb).add(v);pc.lookAt(cb);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0);RT.lbl(x,i?d[3]:label+' — '+d[3],i*FW,0,FW)});return c.toDataURL('image/jpeg',.9)};
  const heads=(H)=>{const c=document.createElement('canvas');c.width=FW*3;c.height=FW;const x=c.getContext('2d');rd.setSize(FW,FW);pc.aspect=1;pc.updateProjectionMatrix();
    const hp=H.bones.head.getWorldPosition(new V()),hc=new V(hp.x,hp.y+.05,hp.z+.06);
    [[0,.1,1,'head front'],[1,.06,.05,'head side'],[.75,.25,.7,'head 3/4']].forEach((d,i)=>{const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(.95);pc.position.copy(hc).add(v);pc.lookAt(hc);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0);RT.lbl(x,d[3],i*FW,0,FW)});
    rd.setSize(FW,FH);pc.aspect=FW/FH;pc.updateProjectionMatrix();return c.toDataURL('image/jpeg',.9)};
  const arms=(H)=>{const c=document.createElement('canvas');c.width=FW*3;c.height=FW;const x=c.getContext('2d');rd.setSize(FW,FW);pc.aspect=1;pc.updateProjectionMatrix();
    const e=H.bones.aL1.getWorldPosition(new V()),w=H.bones.aL2.getWorldPosition(new V()),ac=e.clone().lerp(w,.5);
    [[-1,.1,.1,'left arm outside'],[-.5,.15,-1,'left arm back'],[-.8,.5,.6,'left arm above']].forEach((d,i)=>{const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(.75);pc.position.copy(ac).add(v);pc.lookAt(ac);rd.render(sc,pc);x.drawImage(rd.domElement,i*FW,0);RT.lbl(x,d[3],i*FW,0,FW)});
    rd.setSize(FW,FH);pc.aspect=FW/FH;pc.updateProjectionMatrix();return c.toDataURL('image/jpeg',.9)};
  const sets=a.sets;let H=null;
  sets.forEach(S=>{const E={};['helm','chest','boots'].forEach(sl=>{if(S[sl]){const tp=RT.find(sl,'cloth',S[sl]);if(tp>=0)E[sl]=RT.it(tp,S.r)}});
    if(S.wpn){const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='mage'&&itT(RT.it(i)).wt=='staff');if(wtp>=0)E.weapon=RT.it(wtp,S.r)}
    if(S.bare){mdS().G.clear();BR.bare=true}
    if(H)sc.remove(H);H=RT.beast('mage',3,E,S.look);BR.bare=false;sc.add(H);if(!S.wpn)RT.hideW(H);RT.idle(H,800);
    out[S.n]=sheet(H,S.lab);if(S.head)out[S.n+'_head']=heads(H);if(S.arms)out[S.n+'_arms']=arms(H)});
  return {out,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    sets=[{'n':'robe','lab':'starting robe','wpn':1,'r':0,'head':1,'arms':1},
          {'n':'t3','lab':'Pyreweave set','helm':'circlet','chest':'pyre','boots':'pyre','wpn':1,'r':2},
          {'n':'t5','lab':'Tempest set','helm':'crown','chest':'regalia','boots':'tempest','wpn':1,'r':4},
          {'n':'bare','lab':'bare model','bare':1,'head':1,'arms':1}]
    if os.environ.get('LOOKS'):sets.append({'n':'pale','lab':'white plumage, ice eyes','bare':1,'look':{'skin':'#d8d6d0','eye':'#9ec4e0'},'head':1})
    r=ev(JS,{'sets':sets});print('err',r['err'])
    for k,v in r['out'].items():open(O+'/raven_%s.jpg'%k,'wb').write(base64.b64decode(v.split(',')[1]));print('wrote raven_%s.jpg'%k)
play.run(s,w=900,hh=600)
