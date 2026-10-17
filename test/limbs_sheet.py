# contact sheets of every creature model: side + 3/4 view, rest pose and mid-walk, saved to test/out/limbs/
# usage: SRC=.../kq.html python3 limbs_sheet.py [tag] [filter-regex] [tile]
import sys,base64,limbs_run as R
TAG=sys.argv[1] if len(sys.argv)>1 else 'sheet'
FLT=sys.argv[2] if len(sys.argv)>2 else ''
TILE=int(sys.argv[3]) if len(sys.argv)>3 else 220
JS=r"""
async([flt,T])=>{
 const list=[];
 Object.keys(SP2).forEach(n=>list.push(['sp',n]));
 Object.keys(EN).forEach(k=>{if(!EN[k].hum)list.push(['en',k])});
 if(typeof MOUNTS!='undefined'&&typeof mkMountRig=='function')Object.keys(MOUNTS).forEach(k=>list.push(['mt',k]));
 const L=list.filter(a=>!flt||new RegExp(flt).test(a[1]));
 const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(T,T);r.setClearColor(0x9aa4b0);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x445566,1.1));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(2,4,3);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(30,1,.05,50);
 const views=[[Math.PI/2,0.15,'side rest',0],[0.8,0.35,'3/4 rest',0],[Math.PI/2,0.15,'side walk',1],[-0.8,0.35,'rear3/4 walk',2],[Math.PI,1.2,'top walk',1]];
 const cols=views.length,out=document.createElement('canvas');out.width=T*cols;out.height=T*L.length;const g=out.getContext('2d');g.font='13px sans-serif';
 for(let i=0;i<L.length;i++){
  const [ty,k]=L[i];let m;
  try{
   if(ty=='sp'){const c=mkC(k,10,0,'');m=cr(c)}
   else if(ty=='en'){const c=enemyC(k,10,{});m=cr(c)}
   else m=mkMountRig(k);
  }catch(e){g.fillStyle='#f00';g.fillText(k+' ERR '+e,4,i*T+16);continue}
  const inner=new THREE.Group();inner.add(m);pvFit(inner,1.6);sc.add(inner);
  for(let v=0;v<cols;v++){
   const [az,el,lab,pose]=views[v];
   const now=pose==2?5237:pose==1?4321:0;
   try{ if(m.rig)m.rig(now,!!pose,pose?3:0); else if(typeof animC0=='function')animC0(m,now,!!pose,pose?3:0) }catch(e){}
   inner.updateMatrixWorld(true);
   const d=3.6;cam.position.set(Math.sin(az)*Math.cos(el)*d,.8+Math.sin(el)*d,Math.cos(az)*Math.cos(el)*d);cam.lookAt(0,.75,0);
   r.render(sc,cam);g.drawImage(r.domElement,v*T,i*T);
   g.fillStyle='#000';g.fillText((v==0?ty+':'+k+'  ':'')+lab,v*T+4,i*T+14);
  }
  sc.remove(inner);
 }
 return [out.toDataURL('image/png'),L.map(a=>a[1])];
}"""
def s(pg):
    R.start(pg)
    names=pg.evaluate("()=>{const a=Object.keys(SP2).map(n=>'sp:'+n);Object.keys(EN).forEach(k=>{if(!EN[k].hum)a.push('en:'+k)});if(typeof MOUNTS!='undefined')Object.keys(MOUNTS).forEach(k=>a.push('mt:'+k));return a}")
    import re
    names=[n for n in names if not FLT or re.search(FLT,n.split(':')[1])]
    CH=int(__import__('os').environ.get('CH','6'))
    for j in range(0,len(names),CH):
        part=names[j:j+CH]
        url,got=pg.evaluate(JS,['^('+'|'.join(re.escape(n.split(':')[1]) for n in part)+')$',TILE])
        p=R.TMP+'/'+TAG+'_%02d.png'%(j//CH);open(p,'wb').write(base64.b64decode(url.split(',')[1]));print(p,got)
R.run(s)
