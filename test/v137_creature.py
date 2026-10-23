# v137 creature sheets: companions (C:Species[:evo]) or enemies (E:key[:al]) from several views, walking and attacking.
#   LIST="C:Gloomcap:0;C:Gloomcap:3;E:bloodbat"  VIEWS=front,34,side,back,face,top,walk,attack  TAG=_x  -> out/v137_<TAG>.jpg
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [list,views]=a,V=THREE.Vector3,FW=230,FH=230,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*list.length;const ctx=cnv.getContext('2d'),info=[];let err=null;
  list.forEach((s,row)=>{const p=s.split(':');let g,c;try{
      if(p[0]=='C'){c=mkC(p[1],30,0,p[3]||'');c.tr='';c.z=1;c.evo=+(p[2]||0);g=cr(c)}else{c=enemyC(p[1],20,p[2]=='al'?{al:1}:{});g=cr(c)}}catch(e){err=String(e);info.push(s+' ERR '+e);return}
    sc.add(g);g.position.set(0,0,0);let T=5000;const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;try{animC(g,T,mv,sp||0)}catch(e){err=err||String(e)}}g.updateMatrixWorld(true)};tick(400,false);
    const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),ctr=bb.getCenter(new V()),R=Math.max(sz.x,sz.y,sz.z);info.push(s+' size '+sz.toArray().map(v=>v.toFixed(2)).join('x'));
    const shot=(col,dir,c0,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c0).add(d);pc.lookAt(c0);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
    views.forEach((v,col)=>{const l=col?v:s,D=R*2.6+.4;
      if(v=='front')shot(col,[0,.15,1],ctr,D,l);else if(v=='34')shot(col,[.8,.25,.7],ctr,D,l);else if(v=='side')shot(col,[1,.12,0],ctr,D,l);else if(v=='back')shot(col,[-.5,.25,-.9],ctr,D,l);
      else if(v=='top')shot(col,[.2,1,.4],ctr,D,l);
      else if(v=='face'){const hb=g.b&&g.b.children.find(m=>m.isSkinnedMesh)?null:null;const hp=new V(ctr.x,bb.min.y+sz.y*.7,ctr.z);shot(col,[.15,.05,1],hp,R*1.25+.2,l)}
      else if(v=='walk'){tick(500,true,4);shot(col,[1,.15,.3],ctr,D,l);tick(300,false)}
      else if(v=='attack'){g.ak={n:'bite',ph:1,k:1};const m={g,ak:{n:'bite',ph:1,k:.5}};tick(200,false);try{if(typeof crAtkOverlay=='function')crAtkOverlay(g,{n:'bite',k:.55})}catch(e){}g.updateMatrixWorld(true);shot(col,[.7,.2,.8],ctr,D,l)}});
    sc.remove(g)});
  return {img:cnv.toDataURL('image/jpeg',.88),info,err}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    L=[x for x in os.environ.get('LIST','C:Gloomcap:0').split(';') if x];V=os.environ.get('VIEWS','front,34,side,back,face,walk').split(',')
    r=ev(JS,[L,V])
    for i in r['info']:print(' ',i)
    print('err',r['err'],'console',errs[:4])
    nm='v137_%s.jpg'%os.environ.get('TAG','c');open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
