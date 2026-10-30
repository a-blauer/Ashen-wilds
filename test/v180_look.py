# v180 close-up pictures of companions. LIST="Species:evo:pose:x,y,z:dist[:tr[:v]];…" (pose idle|walkA|walkB|bite; x,y,z = the
# point to look at in world metres at the model's scale, '-' = the body centre; dist = camera distance, '-' = whole body).
# Each entry gives a row of 4 views (front-left, side, back-right, top). TAG=x -> out/v180_<TAG>.jpg
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [list,W]=a,V=THREE.Vector3,FW=W,FH=W,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const dirs=[[.8,.25,.7,'3/4 front'],[1,.08,0,'side'],[-.7,.3,-.7,'3/4 back'],[.15,1,.25,'top']];
  const cnv=document.createElement('canvas');cnv.width=FW*dirs.length;cnv.height=FH*list.length;const ctx=cnv.getContext('2d'),info=[];let T=5000;
  list.forEach((s,row)=>{const p=s.split(':');let g;try{const c=mkC(p[0],30,0,p[6]||'');c.tr=p[5]||'';c.z=1;c.evo=+(p[1]||0);g=cr(c)}catch(e){info.push(s+' ERR '+e);return}
    sc.add(g);g.position.set(0,0,0);const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}g.position.set(0,0,0);g.updateMatrixWorld(true)};
    tick(500,false);const ps=p[2]||'idle';if(ps=='walkA')tick(420,true,4);else if(ps=='walkB')tick(590,true,4);else if(ps=='bite'){g.ak={n:'bite',ph:1,k:.6};tick(64,false)}
    const bb=new THREE.Box3().setFromObject(g),ctr=bb.getCenter(new V()),R=bb.getSize(new V()).length();
    const c0=(p[3]&&p[3]!='-')?new V(...p[3].split(',').map(Number)):ctr,D=(p[4]&&p[4]!='-')?+p[4]:R*1.5;
    dirs.forEach((d,col)=>{const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(D);pc.position.copy(c0).add(v);pc.lookAt(c0);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,(col?'':s+' · ')+d[3],col*FW,row*FH,FW)});
    g.ak=null;sc.remove(g)});
  return {img:cnv.toDataURL('image/jpeg',.9),info}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    L=[x for x in os.environ.get('LIST','Foxlet:0').split(';') if x]
    r=ev(JS,[L,int(os.environ.get('W','300'))])
    for i in r['info']:print(' ',i)
    nm='v180_%s.jpg'%os.environ.get('TAG','look');open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
