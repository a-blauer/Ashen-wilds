# v141 grip sheet: every v137 weapon of a class in the hero's hand, close-ups from the outside and the front of the hand.
#   CLS=warrior|paladin|assassin|ranger|mage python3 v141_grips.py   -> out/v141_grip_<cls>.jpg
# POSE=atk holds each weapon at the strike moment of the first combo swing instead of the carry pose.
import os,sys,json,base64,io,play
from PIL import Image,ImageDraw
CLS=os.environ.get('CLS','warrior');POSE=os.environ.get('POSE','carry')
JS=r"""async([cls,pose])=>{const out=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const L=[],seen={};for(let i=ITPL_V137;i<ITPL.length;i++){const t=ITPL[i];if(t.sl=='weapon'&&!/^bw_/.test(t.v7||'')&&(t.cls==cls||!t.cls)){
    const ty=itT({tp:i}).wt;if(!seen[ty]){seen[ty]=1;const j=ITPL.findIndex((q,jj)=>jj<ITPL_V137&&q.sl=='weapon'&&itT({tp:jj}).wt==ty);if(j>=0)L.push(j)}L.push(i)}}
  const cam=new THREE.PerspectiveCamera(34,1,.01,50),bg0=scene.background;cv=ren.domElement,w0=cv.width,h0=cv.height;
  for(const i of L){eq.weapon={id:9e5+i,tp:i,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();await wait(350);
    if(pose=='atk'){try{swingAnim(0,900)}catch(e){}await wait(330)}
    const views=[];for(const side of ['R','L']){const B=pl.bones||(pl.userData&&pl.userData.bones)||{},hb=B['a'+side+'2'];if(!hb)continue;pl.updateMatrixWorld(true);const p=new THREE.Vector3();hb.getWorldPosition(p);
      const ry=pl.rotation.y,rx=Math.cos(ry),rz=-Math.sin(ry),fx=Math.sin(ry),fz=Math.cos(ry),sg=side=='R'?-1:1;
      for(const v of [[sg*rx*.6+fx*.2,.12,sg*rz*.6+fz*.2],[fx*.62,.14,fz*.62]]){cam.position.set(p.x+v[0],p.y+v[1],p.z+v[2]);cam.lookAt(p);cam.aspect=1;cam.updateProjectionMatrix();
        ren.setSize(260,260,false);const hid=[];scene.children.forEach(o=>{if(o!==pl&&!o.isLight&&o.visible){o.visible=false;hid.push(o)}});scene.background=new THREE.Color(0x4a5560);ren.render(scene,cam);hid.forEach(o=>o.visible=true);scene.background=bg0;views.push(cv.toDataURL('image/jpeg',.85))}}
    if(!views.length)out.push({i,n:"no bones: "+Object.keys(pl).filter(k=>/bone|rig|bn/i.test(k)).join(","),t:"",v:[]});ren.setSize(w0,h0,false);out.push({i,n:(i<ITPL_V137?'OLD ':'')+ITPL[i].n,t:ITPL[i].v7||itT({tp:i}).wt,v:views})}
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%CLS,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{enterMap(-1)}") if False else None
    r=pg.evaluate(JS,[CLS,POSE])
    cell=260;cols=4;rows=len(r);sheet=Image.new('RGB',(cols*cell,rows*(cell+18)),(20,18,16));d=ImageDraw.Draw(sheet)
    for j,w in enumerate(r):
        d.text((4,j*(cell+18)+3),'%s (%s) %d'%(w['n'],w['t'],w['i']),fill=(240,220,160))
        for k,u in enumerate(w['v'][:4]):
            im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sheet.paste(im.resize((cell,cell)),(k*cell,j*(cell+18)+18))
    p=play.TMP+'/v141_grip_%s%s.jpg'%(CLS,'_atk' if POSE=='atk' else '');sheet.save(p,quality=85);print('saved',p,len(r))
play.run(s,w=900,hh=600)
