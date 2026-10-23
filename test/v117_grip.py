# v117 close-ups: the Mage's (raven since v134) weapon paw (staff / wand / orb; idle, run, attack) from four sides, and the ring on every race.
#   out/v117_grip_mage.jpg   out/v117_rings.jpg      PART=grip,rings
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
PART=os.environ.get('PART','grip,rings').split(',')
GRIP=COMMON+r"""(a)=>{const [wts,frames]=a,FW=260,FH=260,{rd,sc,pc}=RT.mk(FW,FH,0x30343a),V=THREE.Vector3;const views=[['front',[0,.15,1]],['outside',[1,.1,.1]],['inside',[-1,.15,.2]],['top',[.2,1,.3]],['3/4 wide',[.8,.25,.8]]];
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*wts.length*frames.length;const x=cnv.getContext('2d');let row=0,H=null;const info=[];
  for(const wt of wts){const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='mage'&&itT(RT.it(i)).wt==wt);
    for(const fr of frames){const E={};if(wtp>=0)E.weapon=RT.it(wtp,2);if(H)sc.remove(H);H=RT.beast('mage',3,E);sc.add(H);
      if(fr=='idle')RT.idle(H,800);else if(fr=='run'){for(let t=0;t<900;t+=16){RT.T+=16;animHero(RT.T,true,H);H.position.set(0,0,0)}H.updateMatrixWorld(true)}
      const W=(H.gearG||[]).find(o=>o.userData.wt==wt),hb=W?W.parent:H.bones.aR2,hp=hb.getWorldPosition(new V());
      views.forEach(([n,d],col)=>{const dv=new V(...d).normalize(),wide=n.startsWith('3/4');pc.position.copy(hp).add(dv.multiplyScalar(wide?2.6:.42));pc.lookAt(wide?new V(0,.75,0):hp);rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(x,(col?'':wt+' '+fr+' · ')+n,col*FW,row*FH,FW)});
      // how the paw sits on the grip: the paw's palm normal vs the direction to the shaft
      info.push({wt,fr,hand:hb===H.bones.aR2?'R':hb===H.bones.aL2?'L':'?'});row++}}
  sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.88),info,err:RT.err||null}}"""
RINGS=COMMON+r"""(a)=>{const FW=240,FH=240,{rd,sc,pc}=RT.mk(FW,FH,0x30343a),V=THREE.Vector3,R=[['warrior',1],['assassin',2],['mage',3],['paladin',4],['ranger',5]];
  const cnv=document.createElement('canvas');cnv.width=FW*4;cnv.height=FH*R.length;const x=cnv.getContext('2d');let H=null;const rg=ITPL.map((t,i)=>[t,i]).filter(([t])=>t.sl=='ring');
  R.forEach(([c,r],row)=>{const E={ring:RT.it(rg[Math.min(rg.length-1,2)][1],3)};if(H)sc.remove(H);H=RT.beast(c,r,E);sc.add(H);RT.hideW(H);RT.idle(H,500);
    const hp=H.bones.aR2.getWorldPosition(new V()),q=H.bones.aR2.getWorldQuaternion(new THREE.Quaternion()),c0=hp.clone().add(new V(0,-.04,0).applyQuaternion(q));
    [['outside',[1,.1,.2]],['front',[0,.1,1]],['palm',[-1,.1,.3]],['below',[.2,-1,.3]]].forEach(([n,d],col)=>{pc.position.copy(c0).add(new V(...d).normalize().multiplyScalar(.22));pc.lookAt(c0);rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(x,c+' ring · '+n,col*FW,row*FH,FW)})});
  sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.88),err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if 'grip' in PART:
        r=ev(GRIP,[os.environ.get('WT','staff,wand,orb').split(','),os.environ.get('FR','idle,run').split(',')]);print(r['info'],r['err'])
        open(play.TMP+'/v117_grip_mage.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
    if 'rings' in PART:
        r=ev(RINGS,[]);print('rings',r['err'])
        open(play.TMP+'/v117_rings.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
