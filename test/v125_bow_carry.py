# v125: bow carry — which side of the bow arm the string sits on. Ranger with a bow, idle and run, from several sides.
#   out/v125_bow_carry.jpg   (RACE=human or a beast race id)
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [race,frames,ovr]=a;if(ovr)Object.assign(V100A_BOW,JSON.parse(ovr));const FW=260,FH=300,{rd,sc,pc}=RT.mk(FW,FH,0x30343a),V=THREE.Vector3;
  const views=[['front',[0,.1,1]],['outside (left)',[1,.1,0]],['inside',[-1,.15,.15]],['back',[0,.15,-1]],['top',[.15,1,.1]],['3/4 wide',[.8,.25,.8]]];
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*frames.length;const x=cnv.getContext('2d');let H=null;const info=[];
  const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&itT(RT.it(i)).wt=='bow');
  frames.forEach((fr,row)=>{const E={weapon:RT.it(wtp,2)};if(H)sc.remove(H);
    if(race=='human'){H=buildHero();refreshGear(H,'ranger',E)}else H=RT.beast('ranger',+race,E);sc.add(H);
    if(fr=='idle')RT.idle(H,800);else{for(let t=0;t<900;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true)}
    const W=(H.gearG||[]).find(o=>o.userData.wt=='bow'),hb=W?W.parent:H.bones.aL2,hp=hb.getWorldPosition(new V());
    // where the string is relative to the hand: model +x is riser->string
    let side=null;if(W){const q=W.getWorldQuaternion(new THREE.Quaternion()),sx=new V(1,0,0).applyQuaternion(q),hq=H.getWorldQuaternion(new THREE.Quaternion());
      const hl=sx.applyQuaternion(hq.invert());side={x:+hl.x.toFixed(2),y:+hl.y.toFixed(2),z:+hl.z.toFixed(2),handX:+H.worldToLocal(hp.clone()).x.toFixed(2)}}
    info.push({fr,side});
    views.forEach(([n,d],col)=>{const dv=new V(...d).normalize(),wide=n.startsWith('3/4');pc.position.copy(hp).add(dv.multiplyScalar(wide?3:1.6));pc.lookAt(wide?new V(0,.8,0):hp);rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(x,(col?'':fr+' · ')+n,col*FW,row*FH,FW)})});
  sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.88),info,err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS,[os.environ.get('RACE','human'),os.environ.get('FR','idle,run').split(','),os.environ.get('OVR','')]);print(r['info'],r['err'])
    open(play.TMP+'/'+os.environ.get('OUT','v125_bow_carry')+'.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
