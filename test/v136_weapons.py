# v136 weapon sheet: every weapon type at rarity 0, 2 and 4 -> out/v136_weapons.jpg (TYPES=sword,gs,... to pick)
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(types)=>{const V=THREE.Vector3,FW=220,FH=300,{rd,sc,pc}=RT.mk(FW,FH,0x262a30),R=[0,2,4],cols=[0x9aa2ae,0x4a9ae0,0xc87aff];
  const cnv=document.createElement('canvas');cnv.width=FW*R.length*2;cnv.height=FH*Math.ceil(types.length/2);const ctx=cnv.getContext('2d');let err=null;
  types.forEach((t,i)=>R.forEach((r,j)=>{let W;try{W=mkWpn(t,t=='staff'?(r>=2?cols[j]:0x9a7aff):cols[j],r)}catch(e){err=String(e);return}sc.add(W);W.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(W),c=bb.getCenter(new V()),sz=bb.getSize(new V()).length();pc.position.copy(c).add(new V(.35,.12,1).normalize().multiplyScalar(sz*1.9+.2));pc.lookAt(c);
    rd.render(sc,pc);const col=(i%2)*R.length+j,row=Math.floor(i/2);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,t+' r'+r,col*FW,row*FH,FW);sc.remove(W)}));
  return {img:cnv.toDataURL('image/jpeg',.88),err}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    T=os.environ.get('TYPES','sword,gs,axe,ga,mace,hammer,club,dagger,claws,halberd,flail,staff,wand,orb,bow,crossbow,sling,shield').split(',')
    r=ev(JS,T);print('err',r['err'])
    open(O+'/v136_weapons.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote v136_weapons.jpg')
play.run(s,w=900,hh=600)
