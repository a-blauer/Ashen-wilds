# big renders of chosen models: side/3-4/rear/top, rest and walk; optional close-up box
# usage: SRC=.../kq.html python3 limbs_zoom.py tag 'sp:Skyhawk,en:harpy' [tile] [zoom cx,cy,cz,r]
import sys,os,base64,limbs_run as R
TAG=sys.argv[1];NAMES=sys.argv[2].split(',');TILE=int(sys.argv[3]) if len(sys.argv)>3 else 420
ZM=[float(v) for v in sys.argv[4].split(',')] if len(sys.argv)>4 else None
LIB=open(os.path.join(R.HERE,'limbs_lib.js')).read()
JS=r"""
([L,T,ZM])=>{
 const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(T,T);r.setClearColor(0x9aa4b0);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x445566,1.1));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(2,4,3);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(30,1,.01,50);
 const views=[[Math.PI/2,0.1,'side rest',0],[0.7,0.3,'3/4 rest',0],[Math.PI*.8,0.25,'rear rest',0],[Math.PI/2,0.1,'side walk',1],[-0.7,0.3,'3/4 walk',2],[Math.PI,1.3,'top walk',1]];
 const cols=views.length,out=document.createElement('canvas');out.width=T*cols;out.height=T*L.length;const g=out.getContext('2d');g.font='14px sans-serif';
 L.forEach((nm,i)=>{const [ty,k]=nm.split(/:(.+)/);let m;try{m=LB.make(ty,k)}catch(e){g.fillText(nm+' ERR '+e,4,i*T+16);return}
  const inner=new THREE.Group();inner.add(m);sc.add(inner);
  // fit by rest bbox (creature units)
  LB.pose(m,0);inner.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
  let ctr=c,rad=Math.max(sz.x,sz.y,sz.z)*.62;if(ZM){const k=m.scale.x;ctr=new THREE.Vector3(ZM[0]*k,ZM[1]*k,ZM[2]*k);rad=ZM[3]*k}
  views.forEach(([az,el,lab,pose],v)=>{LB.pose(m,pose);inner.updateMatrixWorld(true);
   const d=rad/Math.tan(15*Math.PI/180);cam.position.set(ctr.x+Math.sin(az)*Math.cos(el)*d,ctr.y+Math.sin(el)*d,ctr.z+Math.cos(az)*Math.cos(el)*d);cam.lookAt(ctr);
   r.render(sc,cam);g.drawImage(r.domElement,v*T,i*T);g.fillStyle='#000';g.fillText((v==0?nm+'  ':'')+lab,v*T+4,i*T+15)});
  sc.remove(inner)});
 return out.toDataURL('image/png')}"""
def s(pg):
    R.start(pg);pg.evaluate("()=>{"+LIB+"}")
    url=pg.evaluate(JS,[NAMES,TILE,ZM])
    p=R.TMP+'/'+TAG+'.png';open(p,'wb').write(base64.b64decode(url.split(',')[1]));print(p)
R.run(s)
