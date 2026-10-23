# v135: bow carry on the weasel Ranger, full body from four sides (idle, two run phases) -> out/v135_bow.jpg
#   OVR='{"psi":-.5}' tries other V100A_BOW numbers; RACE= another race id; checks the bow's size and that its lower tip stays off the ground
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [race,frames,ovr]=a;if(ovr)Object.assign(V100A_BOW,JSON.parse(ovr));try{gripReg(pl)}catch(_){}const FW=240,FH=320,{rd,sc,pc}=RT.mk(FW,FH,0x30343a),V=THREE.Vector3;
  const views=[['front',[0,.15,1]],['left (bow side)',[1,.15,0]],['right',[-1,.15,0]],['back',[0,.15,-1]],['3/4 front-left',[.75,.3,.75]],['close front',[.35,.1,1]]];
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*frames.length;const x=cnv.getContext('2d');let H=null;const info=[];
  const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&itT(RT.it(i)).wt=='bow');
  frames.forEach((fr,row)=>{const E={weapon:RT.it(wtp,2)};if(H)sc.remove(H);
    H=RT.beast('ranger',+race,E);sc.add(H);
    if(fr=='idle')RT.idle(H,800);else{const n=fr=='run2'?1180:900;for(let t=0;t<n;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true)}
    const W=(H.gearG||[]).find(o=>o.userData.wt=='bow'),hb=W?W.parent:H.bones.aL2,hp=hb.getWorldPosition(new V());
    let bb=null;if(W){const B=new THREE.Box3().setFromObject(W);bb={minY:+B.min.y.toFixed(2),maxY:+B.max.y.toFixed(2),h:+(B.max.y-B.min.y).toFixed(2),minX:+B.min.x.toFixed(2),maxX:+B.max.x.toFixed(2)}}
    const sh=H.bones.aL1?H.bones.aL1.getWorldPosition(new V()):null;
    const hq=hb.getWorldQuaternion(new THREE.Quaternion()),ax=['x','y','z'].map((n,i)=>{const v=new V(i==0,i==1,i==2).applyQuaternion(hq);return n+':'+[v.x,v.y,v.z].map(q=>q.toFixed(2)).join(',')}).join(' ');
    info.push({fr,bb,ax,hand:[+hp.x.toFixed(2),+hp.y.toFixed(2),+hp.z.toFixed(2)],shoulderX:sh?+sh.x.toFixed(2):null});
    views.forEach(([n,d],col)=>{const dv=new V(...d).normalize(),close=n.startsWith('close');pc.position.set(0,.75,0).add(dv.multiplyScalar(close?1.7:3.4));pc.lookAt(close?hp:new V(0,.72,0));rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(x,(col?'':fr+' · ')+n,col*FW,row*FH,FW)})});
  sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.88),info,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS,[os.environ.get('RACE','4'),os.environ.get('FR','idle,run,run2').split(','),os.environ.get('OVR','')]);print(json.dumps(r['info']),r['err'])
    for f in r['info']:
        b=f['bb']
        if not b: print('FAIL no bow on',f['fr']);continue
        if b['h']>1.0: print('FAIL bow still big',f['fr'],b['h'])
        if b['minY']<0.03: print('FAIL bow touches the ground',f['fr'],b['minY'])
    open(play.TMP+'/'+os.environ.get('OUT','v135_bow')+'.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
