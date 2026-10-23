# v134: close-ups of the remade cat (Assassin) head, bare and with the class's first helm -> out/v134_cat_head.jpg
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const FW=380,FH=380,{rd,sc,pc}=RT.mk(FW,FH,0x3a3e46),V=THREE.Vector3;const views=[['front',[0,.05,1]],['3/4',[.75,.12,.7]],['side',[1,.05,.02]],['above',[.35,.9,.6]],['back 3/4',[-.6,.25,-.75]]];
  const rows=[['bare',{}],['hood',(()=>{const i=ITPL.findIndex((t,j)=>t.sl=='helm'&&fitsCls(t,'assassin'));return i>=0?{helm:RT.it(i,2)}:{}})()]];
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*rows.length;const x=cnv.getContext('2d');
  rows.forEach(([n,E],r)=>{const H=RT.beast('assassin',2,E);sc.add(H);RT.idle(H,600);const hp=H.bones.head.getWorldPosition(new V()).add(new V(0,.05,.03));
    views.forEach(([vn,d],c)=>{pc.position.copy(hp).add(new V(...d).normalize().multiplyScalar(.75));pc.lookAt(hp);rd.render(sc,pc);x.drawImage(rd.domElement,c*FW,r*FH);RT.lbl(x,n+' · '+vn,c*FW,r*FH,FW)});sc.remove(H)});
  return {img:cnv.toDataURL('image/jpeg',.9),err:RT.err||null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev(JS);print(r['err'])
    open(play.TMP+'/'+os.environ.get('OUT','v134_cat_head')+'.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
