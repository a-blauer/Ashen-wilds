# v181: picture sheets of enemy models (one row per enemy): front, 3/4, side, back, face close-up, mid-walk, attack.
# ONLY=yeti,jotun  (required)  SZ=360 (cell size)  OUT=out/v181_sheet  ->  out/v181_sheet_<n>.jpg, 4 enemies per sheet
# Also prints the model height and any build / animation error (FAIL lines).
import os,sys,base64,io
from PIL import Image
import play
JS=r"""(a)=>{const [list,SZ]=a,V=THREE.Vector3,out=[];
  if(!window.RT181){const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(SZ,SZ);const sc=new THREE.Scene();sc.background=new THREE.Color(0x2c3036);
    sc.add(new THREE.HemisphereLight(0xc8d0dc,0x3a3028,.85));const dl=new THREE.DirectionalLight(0xfff0d8,1.15);dl.position.set(2,4,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090c0,.6);d2.position.set(-4,1.5,-2);sc.add(d2);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({color:0x3a4234}));gr.rotation.x=-Math.PI/2;sc.add(gr);window.RT181={rd,sc,pc:new THREE.PerspectiveCamera(28,1,.02,200)}}
  const {rd,sc,pc}=RT181;
  list.forEach(k=>{const it={k,n:(EN[k]&&EN[k].n)||k,shots:[],err:null};out.push(it);let g,T=5000;
    try{const c=enemyC(k,20,{});g=cr(c);g.position.set(0,0,0);g.rotation.y=0;sc.add(g)}catch(e){it.err='build error '+(e&&e.stack||e).slice(0,300);return}
    const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;try{animC(g,T,mv,sp||0)}catch(e){it.err='anim error '+String(e).slice(0,200)}}g.position.set(0,g.position.y,0);g.updateMatrixWorld(true)};
    tick(600,false);const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),ctr=bb.getCenter(new V());it.h=sz.y;it.sz=sz.toArray();
    const R=Math.max(sz.x,sz.y,sz.z)*.5;
    const shot=(dir,l,c,r)=>{const d=new V(...dir).normalize().multiplyScalar((r||R)/Math.tan(14*Math.PI/180)*1.12);pc.position.copy(c||ctr).add(d);pc.lookAt(c||ctr);rd.render(sc,pc);it.shots.push([l,rd.domElement.toDataURL('image/jpeg',.9)])};
    shot([0,.12,1],'front');shot([.75,.2,.75],'3/4');shot([1,.08,0],'side');shot([-.5,.2,-1],'back');
    // the face: the head bone (humanoids) or the highest front point
    let hp=null;g.traverse(o=>{if(o.isBone&&o.name=='head'&&!hp){hp=new V();o.getWorldPosition(hp)}});
    if(!hp)hp=new V(ctr.x,bb.max.y-sz.y*.12,ctr.z);hp.y+=sz.y*.03;shot([.35,.1,1],'face',hp,sz.y*.13);
    let sp=null;g.traverse(o=>{if(o.isBone&&o.name=='aR0'&&!sp){sp=new V();o.getWorldPosition(sp)}});
    if(sp){shot([.55,.75,.35],'shoulder',sp,sz.y*.14);shot([.2,.5,-.9],'shoulder back',sp,sz.y*.14)}
    tick(260,true,4);shot([.9,.15,.45],'walk');
    tick(400,false);const mv=(EN[k].moves||[])[0];g.ak={n:mv||'bite',ph:1,k:.6};tick(120,false);shot([.9,.2,.5],'attack '+(mv||''));g.ak=null;
    sc.remove(g)});
  return out}"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(3600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.requestAnimationFrame=()=>0}")
    keys=[q for q in os.environ.get('ONLY','').split(',') if q];SZ=int(os.environ.get('SZ','360'));out=os.environ.get('OUT','out/v181_sheet')
    rows=[]
    for k in keys:
        r=ev(JS,[[k],SZ])
        for it in r:
            if it['err']:print('FAIL %s: %s'%(it['k'],it['err']))
            if it.get('h'):print('%s (%s) height %.2f m, size %s'%(it['k'],it['n'],it['h'],' x '.join('%.2f'%v for v in it['sz'])))
            rows.append(it)
    for si in range(0,len(rows),4):
        R=rows[si:si+4];W=max(len(it['shots']) for it in R) or 1
        im=Image.new('RGB',(W*SZ,len(R)*SZ),(20,20,24))
        from PIL import ImageDraw
        d=ImageDraw.Draw(im)
        for ri,it in enumerate(R):
            for ci,(lab,u) in enumerate(it['shots']):
                c=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));im.paste(c,(ci*SZ,ri*SZ))
                d.rectangle([ci*SZ,ri*SZ,ci*SZ+len(lab+it['k'])*7+12,ri*SZ+13],fill=(0,0,0));d.text((ci*SZ+3,ri*SZ+1),(it['k']+' · ' if ci==0 else '')+lab,fill=(255,255,255))
        p='%s_%d.jpg'%(out,si//4);im.save(p,quality=88);print('wrote',p)
play.run(s)
