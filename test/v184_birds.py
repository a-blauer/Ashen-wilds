# v184 bird pictures: companions with the wing fold fixed. LIST="Species:evo:fold:pose[:x,y,z:dist];…" (fold 0 spread .. 1 folded,
# '-' = the creature's own fold; pose idle|walkA|walkB|bite). VIEWS=34,side,back,top,front,below. W=frame size. TAG=x -> out/v184_<TAG>.jpg
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [list,W,views]=a,V=THREE.Vector3,FW=W,FH=W,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const DIR={'34':[.8,.25,.7],side:[1,.08,0],back:[-.7,.3,-.7],top:[.15,1,.25],front:[0,.12,1],below:[.3,-.6,.5],rear:[0,.35,-1]};
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*list.length;const ctx=cnv.getContext('2d'),info=[];let T=5000;
  list.forEach((s,row)=>{const p=s.split(':');let g;try{const c=mkC(p[0],30,0,'');c.tr='';c.z=1;c.evo=+(p[1]||0);g=cr(c)}catch(e){info.push(s+' ERR '+e);return}
    sc.add(g);g.position.set(0,0,0);if(g.bw184&&p[2]&&p[2]!='-')g.bw184.force=+p[2];
    const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}g.position.set(0,0,0);g.updateMatrixWorld(true)};
    tick(500,false);const ps=p[3]||'idle';if(ps=='walkA')tick(420,true,4);else if(ps=='walkB')tick(590,true,4);else if(ps=='bite'){g.atk=1;tick(64,false)}
    const bb=new THREE.Box3().setFromObject(g),ctr=bb.getCenter(new V()),R=bb.getSize(new V()).length();
    info.push(s+' size '+bb.getSize(new V()).toArray().map(v=>v.toFixed(2)).join('x')+(g.bw184?' fold '+g.bw184.f.toFixed(2):''));
    const c0=(p[4]&&p[4]!='-')?new V(...p[4].split(',').map(Number)):ctr,D=(p[5]&&p[5]!='-')?+p[5]:R*1.25;
    views.forEach((vn,col)=>{const d=DIR[vn];const v=new V(d[0],d[1],d[2]).normalize().multiplyScalar(D);pc.position.copy(c0).add(v);pc.lookAt(c0);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,(col?'':s+' · ')+vn,col*FW,row*FH,FW)});
    g.atk=0;sc.remove(g)});
  return {img:cnv.toDataURL('image/jpeg',.9),info}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    L=[x for x in os.environ.get('LIST','Skyhawk:0:-:idle').split(';') if x]
    r=ev(JS,[L,int(os.environ.get('W','300')),os.environ.get('VIEWS','34,side,back,top').split(',')])
    for i in r['info']:print(' ',i)
    for e in errs[:6]:print('  console error:',e[:300])
    nm='v184_%s.jpg'%os.environ.get('TAG','birds');open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
play.run(s,w=900,hh=600)
