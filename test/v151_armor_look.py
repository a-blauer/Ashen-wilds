# v151: picture sheet of the Armored companion trait (the back armour) on every base companion body.
#   python3 v151_armor_look.py                  -> <AW_TMP>/v151_armor_<TAG>.jpg (TAG=after by default)
#   SRC=<old.html> TAG=before python3 v151_armor_look.py   -> the same sheet from another build
#   SP=Foxlet,Ashwolf,... (default: the 12 base species)
# Each row: side view, 3/4 view from above and behind, walking, then the same companion without the trait for comparison.
import play,json,base64,os
TAG=os.environ.get('TAG','after')
SP=os.environ.get('SP','Foxlet,Ashwolf,Drakelet,Stoneshell,Mossfrog,Boneling,Batwing,Skyhawk,Cryptspider,Gloomcap,Wispling,Gravewyrm').split(',')
SHEET=r"""(SP)=>{
  window.requestAnimationFrame=()=>0;
  const FW=280,FH=210,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);rd.shadowMap.enabled=false;
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x343a42);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.25);dl.position.set(3,5,4);sc.add(dl);const rim=new THREE.DirectionalLight(0x8ab0ff,.45);rim.position.set(-3,2,-3);sc.add(rim);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshLambertMaterial({color:0x3e4a32}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,100),info={};
  const cnv=document.createElement('canvas');cnv.width=FW*4;cnv.height=FH*SP.length;const ctx=cnv.getContext('2d');
  const lbl=(t,x,y)=>{ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(x,y,FW,17);ctx.fillStyle='#e8e0c8';ctx.font='12px sans-serif';ctx.fillText(t,x+4,y+13)};
  const mkc=(sp,tr)=>{const c=mkC(sp,30,0,'');c.tr=tr;c.z=1;c.evo=0;return c};
  SP.forEach((sp,row)=>{try{
    const m=cr(mkc(sp,'Armored')),p=cr(mkc(sp,''));[m,p].forEach(o=>{o.rig&&o.rig(1000,false,0);o.updateMatrixWorld(true)});
    const bb=new THREE.Box3().setFromObject(p),sz=bb.getSize(new THREE.Vector3()),ctr=bb.getCenter(new THREE.Vector3()),H=Math.max(sz.y,sz.x*.75,sz.z*.75,.5);
    const view=(o,kind,col,label)=>{sc.add(o);o.updateMatrixWorld(true);
      if(kind=='side'){const d=H*2.2;cam.position.set(ctr.x+d,ctr.y+H*.2,ctr.z+d*.06)}
      else{const d=H*2.0;cam.position.set(ctr.x+d*.55,ctr.y+H*1.25,ctr.z-d*.75)}
      cam.lookAt(ctr);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);sc.remove(o);lbl(label,col*FW,row*FH)};
    view(m,'side',0,sp+' · Armored');view(m,'back',1,'from above / behind');
    m.rig&&m.rig(1430,true,3);view(m,'back',2,'walking');view(p,'back',3,'no trait');
  }catch(e){info[sp]=String(e)+' '+(e.stack||'').slice(0,300)}});
  return {img:cnv.toDataURL('image/jpeg',.88),info}}"""
def s(pg):
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.evaluate("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    bad=0
    for i in range(0,len(SP),6):
        r=pg.evaluate(SHEET,SP[i:i+6]);n=i//6
        open(play.TMP+'/v151_armor_%s_%d.jpg'%(TAG,n),'wb').write(base64.b64decode(r['img'].split(',')[1]))
        for k,v in r['info'].items():print('FAIL',k,'builds with the Armored trait',v);bad+=1
    for e in errs[:5]:print('FAIL page error',e);bad+=1
    print('v151 armour look:',bad,'fails')
play.run(s,w=900,hh=600)
