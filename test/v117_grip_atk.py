# v117: the frog Mage's weapon paw during the real attack / cast poses (ATK tracks via HACH, like the game's haPlay) at fixed moments.
#   out/v117_grip_atk.jpg: per weapon a row of wide 3/4 views and a row of paw close-ups
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [wts,tracks]=a,FW=200,FH=220,{rd,sc,pc}=RT.mk(FW,FH,0x30343a),V=THREE.Vector3;const K=[.15,.35,.5,.65,.85];
  const cnv=document.createElement('canvas');cnv.width=FW*K.length*tracks.length;cnv.height=FH*wts.length*2;const x=cnv.getContext('2d');let H=null;
  wts.forEach((wt,wi)=>{const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='mage'&&itT(RT.it(i)).wt==wt);const E={};if(wtp>=0)E.weapon=RT.it(wtp,2);if(H)sc.remove(H);H=RT.beast('mage',3,E);sc.add(H);
    tracks.forEach((tn,ti)=>{const T=tn=='basic'?(ATK[wt]||ATK.staff):(kqsPoseT(tn)||[])[0];K.forEach((k,ki)=>{RT.idle(H,200);H.sw=1;for(let t=0;t<400;t+=16){RT.T+=16;animHero(RT.T,false,H);H.position.set(0,0,0)}
      if(T){const P=T(k),b=H.bones;for(const c in P){const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}H.updateMatrixWorld(true)}
      const col=ti*K.length+ki,W=(H.gearG||[]).find(o=>o.userData.wt==wt),hp=(W?W.parent:H.bones.aR2).getWorldPosition(new V());
      pc.position.set(1.9,1.3,2.2);pc.lookAt(0,.8,0);rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,wi*2*FH);RT.lbl(x,wt+' '+tn+' k='+k,col*FW,wi*2*FH,FW);
      pc.position.copy(hp).add(new V(.25,.12,.32));pc.lookAt(hp);rd.render(sc,pc);x.drawImage(rd.domElement,col*FW,(wi*2+1)*FH);RT.lbl(x,'paw',col*FW,(wi*2+1)*FH,FW)})})});
  sc.remove(H);return {img:cnv.toDataURL('image/jpeg',.86),err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS,[os.environ.get('WT','staff,wand,orb').split(','),os.environ.get('TR','basic,cast').split(',')]);print('err',r['err'])
    open(play.TMP+'/v117_grip_atk.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
