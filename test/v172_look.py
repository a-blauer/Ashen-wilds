# v172 creature remaster: model sheets. One row per creature, big frames.
#   LIST="C:Ashwolf:0;C:Ashwolf:3;E:ghostwolf"   (C:<species>:<evolution 0-3>[:variant]  E:<enemy key>[:al])
#   VIEWS=front,34,side,back,top,face,face34,faces,walk,run,attack   TAG=name -> out/v172_<TAG>.jpg   FW=300 FH=250
#   an entry may start with old| (the model before v172) or smooth| (the smooth look)
#   SMOOTH=1 builds the smooth-shaded look (CM172.smooth) instead of the low-poly one.
#   CHECK=1 also runs the float check (CM172.chk) and prints parts that do not touch the body.
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [list,views,FW,FH,chk,smooth]=a,V=THREE.Vector3,{rd,sc,pc}=RT.mk(FW,FH,0x2a2e34);if(chk)CM172.chk=1;CM172.smooth=smooth||0;
  const NC=Math.min(4,views.length),NR=Math.ceil(views.length/NC),cnv=document.createElement('canvas');cnv.width=FW*NC;cnv.height=FH*NR*list.length;const ctx=cnv.getContext('2d'),info=[];let err=null;
  list.forEach((s0,row)=>{const md=s0.indexOf('|')>0?s0.split('|')[0]:'',s=md?s0.split('|')[1]:s0,p=s.split(':');let g,c;CM172.on=md!='old';CM172.smooth=md=='smooth'?1:(smooth||0);try{CM172.gc={};CM172.rep={};if(typeof DKBK!='undefined'&&DKBK)for(const k in DKBK)if(k.startsWith('LP'))delete DKBK[k];if(typeof EVO100!='undefined'){EVO100.surf={};EVO100.cache={}}if(typeof LPG!='undefined')for(const k in LPG)delete LPG[k];
      if(p[0]=='C'){c=mkC(p[1],30,0,p[3]||'');c.tr=p[4]||'';c.z=1;c.evo=+(p[2]||0);if(p[3])c.v=p[3];g=cr(c)}else{c=enemyC(p[1],20,p[2]=='al'?{al:1}:{});g=cr(c)}}catch(e){err=String(e)+' '+(e.stack||'').slice(0,400);info.push(s+' ERR '+err);return}
    sc.add(g);g.position.set(0,0,0);g.rotation.set(0,0,0);let T=5000;const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;try{animC(g,T,mv,sp||0)}catch(e){err=err||String(e)}}g.updateMatrixWorld(true)};tick(400,false);
    let tris=0,mats=0;const per={};g.traverse(o=>{if(o.isMesh&&o.visible){const n=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;tris+=n;mats++;const k=o.userData.cm172||(o.isSkinnedMesh&&o.geometry.userData.lps?'hide':'other');per[k]=(per[k]||0)+Math.round(n)}});
    const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),ctr=bb.getCenter(new V()),R=Math.max(sz.x,sz.y,sz.z);
    info.push(s+' size '+sz.toArray().map(v=>v.toFixed(2)).join('x')+' tris '+Math.round(tris)+' meshes '+mats+' '+JSON.stringify(per)+(chk?' floating '+JSON.stringify(Object.values(CM172.rep).flat().slice(0,12)):''));
    const rg=p[0]=='C'?rigOf(p[1]):(EN[p[1]]&&EN[p[1]].rig),O=rg&&SPEC[rg]?Object.keys(SPEC[rg].bones):[];
    const head=()=>{let h=null;g.traverse(o=>{if(!h&&o.isSkinnedMesh&&o.skeleton&&O.length&&o.skeleton.bones.length==O.length&&O.indexOf('head')>=0)h=o.skeleton.bones[O.indexOf('head')]});
      if(!h)g.traverse(o=>{if(!h&&o.isBone&&/head/i.test(o.name||''))h=o});
      return h?h.getWorldPosition(new V()):new V(ctr.x,bb.min.y+sz.y*.75,bb.max.z-sz.z*.15)};
    const shot=(col,dir,c0,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c0).add(d);pc.lookAt(c0);rd.render(sc,pc);const cx=(col%NC)*FW,cy=(row*NR+Math.floor(col/NC))*FH;ctx.drawImage(rd.domElement,cx,cy);RT.lbl(ctx,l,cx,cy,FW)};
    views.forEach((v,col)=>{const l=col?v:s0,D=R*2.1+.3,hp=head(),hd=Math.max(.45,R*.42);
      if(v=='front')shot(col,[0,.15,1],ctr,D,l);else if(v=='34')shot(col,[.8,.3,.7],ctr,D,l);else if(v=='side')shot(col,[1,.1,0],ctr,D,l);else if(v=='back')shot(col,[-.5,.3,-.9],ctr,D,l);
      else if(v=='top')shot(col,[.15,1,.3],ctr,D,l);else if(v=='under')shot(col,[.3,-.35,.6],ctr,D,l);
      else if(v=='face')shot(col,[0,.12,1],hp,hd,l);else if(v=='face34')shot(col,[.85,.2,.6],hp,hd,l);else if(v=='faces')shot(col,[1,.08,0],hp,hd,l);
      else if(v=='walk'){tick(520,true,3);shot(col,[1,.15,.25],ctr,D,l);tick(300,false)}
      else if(v=='run'){tick(640,true,8);shot(col,[1,.15,.25],ctr,D,l);tick(300,false)}
      else if(v=='attack'){g.atk=1;tick(160,false);g.updateMatrixWorld(true);shot(col,[.75,.2,.75],hp,hd*1.6,l);g.atk=0;tick(200,false)}});
    sc.remove(g)});CM172.on=true;CM172.smooth=smooth||0;
  return {img:cnv.toDataURL('image/jpeg',.9),info,err}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    L=[x for x in os.environ.get('LIST','C:Ashwolf:0').split(';') if x];V=os.environ.get('VIEWS','front,34,side,back,face34,faces,walk,attack').split(',')
    r=ev(JS,[L,V,int(os.environ.get('FW','300')),int(os.environ.get('FH','250')),1 if os.environ.get('CHECK') else 0,int(os.environ.get('SMOOTH','0'))])
    for i in r['info']:print(' ',i)
    print('err',r['err'],'console',errs[:6])
    nm='v172_%s.jpg'%os.environ.get('TAG','c');open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
