# v112 Rat race: model sheets (base model, paws, helmets, gear) and checks.
#   python3 v112_rat.py                 -> test/out/v112_base.jpg, v112_detail.jpg, v112_helms.jpg, v112_gear.jpg
#   PART=base,helms,gear,checks (default all)
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;PART=os.environ.get('PART','base,helms,gear,checks').split(',')
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info);
    if not ok:FAIL.append(n)
COMMON=r"""
window.requestAnimationFrame=()=>0;window.RT=window.RT||{};
RT.mk=(FW,FH,bg)=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(bg||0x2c3036);sc.add(new THREE.HemisphereLight(0xc8d0dc,0x3a3028,.85));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.1);dl.position.set(2,4,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090c0,.5);d2.position.set(-4,1,-2);sc.add(d2);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshLambertMaterial({color:0x3a4234}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const grid=new THREE.GridHelper(4,20,0x56624c,0x4a5640);grid.position.y=.002;sc.add(grid);
  return {rd,sc,pc:new THREE.PerspectiveCamera(26,FW/FH,.01,60)}};
RT.lbl=(c,t,x,y,W)=>{c.fillStyle='rgba(0,0,0,.6)';c.fillRect(x,y,Math.min(W,t.length*7+8),17);c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
RT.it=(tp,r)=>({id:-1,tp,lv:1,req:1,r:r==null?2:r,up:0,aff:[]});
RT.find=(sl,arm,st)=>ITPL.findIndex((t,i)=>t.sl==sl&&(!arm||t.arm==arm)&&(()=>{const d=mdGD(RT.it(i));return d&&d.st==st})());
RT.LOOK={skin:'#5e5248',eye:'#c8301c',build:1,height:1,race:1};
RT.T=900000;RT.idle=(H,ms)=>{for(let t=0;t<(ms||600);t+=16){RT.T+=16;try{animHero(RT.T,false,H)}catch(e){RT.err=String(e)}H.position.set(0,0,0)}H.updateMatrixWorld(true)};
RT.rat=(E,look)=>{const h=buildHero();h.mdLook=Object.assign({},RT.LOOK,look||{});refreshGear(h,'warrior',E||{});return h};
RT.hideW=H=>H.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false});
RT.pose=(H,mv,k)=>{if(!V100A.T.sword0)V100A_build();const T=V100A.T[mv];if(!T)return false;const P=T(k),b=H.bones;for(const c in P){const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}H.updateMatrixWorld(true);return true};
"""
BASE=COMMON+r"""()=>{const V=THREE.Vector3,FW=260,FH=360,{rd,sc,pc}=RT.mk(FW,FH),info={};RAT.bare=true;
  const R=RT.rat({});RAT.bare=false;sc.add(R);RT.hideW(R);RT.idle(R);
  info.race=R._race;info.tail=!!R.bones.tl10;info.bones=huBody(R).skeleton.bones.length;
  const oc=new THREE.OrthographicCamera(-.62,.62,1.72,0,.01,50);
  const c1=document.createElement('canvas');c1.width=FW*6;c1.height=FH*2;const x1=c1.getContext('2d');
  const ortho=(col,row,dir,l)=>{const d=new V(...dir).normalize().multiplyScalar(5);oc.position.set(d.x,d.y,d.z);oc.lookAt(0,0,0);rd.render(sc,oc);x1.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(x1,l,col*FW,row*FH,FW)};
  const persp=(ctx,col,row,dir,c,dist,l,W)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
  ortho(0,0,[0,0,1],'front (ortho)');ortho(1,0,[1,0,0],'side (ortho)');ortho(2,0,[0,0,-1],'back (ortho)');
  const cb=new V(0,.82,0);persp(x1,3,0,[.75,.2,.65],cb,4.3,'3/4');persp(x1,4,0,[-.7,.35,-.6],cb,4.3,'back 3/4');
  const Hm=buildHero();Hm.mdLook=null;refreshGear(Hm,'warrior',{});sc.add(Hm);RT.hideW(Hm);Hm.position.set(-.75,0,0);for(let t=0;t<600;t+=16){RT.T+=16;animHero(RT.T,false,Hm);Hm.position.set(-.75,0,0)}
  persp(x1,5,0,[0,.15,1],new V(-.37,.85,0),5.0,'vs human');sc.remove(Hm);
  for(let f=0;f<4;f++){for(let t=0;t<(f==0?900:180);t+=16){RT.T+=16;animHero(RT.T,true,R);R.position.set(0,0,0)}R.updateMatrixWorld(true);persp(x1,f,1,[1,.12,.15],new V(0,.8,0),4.3,'walk '+(f+1))}
  RT.idle(R);RT.pose(R,'gs1',.35);persp(x1,4,1,[.7,.2,.8],cb,4.5,'attack wind-up');RT.pose(R,'gs1',.62);persp(x1,5,1,[.5,.2,1],cb,4.5,'attack strike');
  RT.idle(R);const c2=document.createElement('canvas');c2.width=FW*8;c2.height=FH;const x2=c2.getContext('2d');
  const hp=R.bones.head.getWorldPosition(new V()),hc=new V(hp.x,hp.y+.06,hp.z+.06);
  persp(x2,0,0,[0,.08,1],hc,1.05,'head front');persp(x2,1,0,[1,.05,.02],hc,1.05,'head side');persp(x2,2,0,[.7,.2,.7],hc,1.05,'head 3/4');
  // paws: the left paw from outside, front and the palm side; both paws from the front at mid distance
  const pw=(bn,dirL,dist,l,col)=>{const b=R.bones[bn],w=b.getWorldPosition(new V()),q=b.getWorldQuaternion(new THREE.Quaternion()),c=w.clone().add(new V(0,-.035,0).applyQuaternion(q));persp(x2,col,0,dirL,c,dist,l)};
  pw('aL2',[-1,.1,.15],.36,'paw outside',3);pw('aL2',[0,.05,1],.36,'paw front',4);pw('aL2',[1,.1,.3],.36,'paw palm side',5);
  persp(x2,6,0,[0,.1,1],new V(0,.6,0),1.6,'paws at mid range');
  const fp=R.bones.rh2.getWorldPosition(new V());persp(x2,7,0,[.8,.5,.9],new V(fp.x,.04,fp.z+.06),.9,'foot');
  return {a:c1.toDataURL('image/jpeg',.9),b:c2.toDataURL('image/jpeg',.9),info,err:RT.err||null}}"""
HELMS=COMMON+r"""(a)=>{const [list]=a,FW=window.HBIG?440:260,FH=window.HBIG?440:260,{rd,sc,pc}=RT.mk(FW,FH),V=THREE.Vector3,info={};
  const cols=window.HBIG?2:4,rows=Math.ceil(list.length/cols);const cnv=document.createElement('canvas');cnv.width=FW*cols*2;cnv.height=FH*rows;const ctx=cnv.getContext('2d');let H=null;
  list.forEach((hk,i)=>{const [arm,st]=hk.split(':'),tp=RT.find('helm',arm,st),E={};if(tp>=0)E.helm=RT.it(tp,3);info[hk]=tp>=0?ITPL[tp].n:'MISSING';
    if(H)sc.remove(H);H=RT.rat(E);sc.add(H);RT.hideW(H);RT.idle(H,300);
    const hp=H.bones.head.getWorldPosition(new V()),c=new V(hp.x,hp.y+.07,hp.z+.06),col=(i%cols)*2,row=Math.floor(i/cols);
    [[0,.1,1],[-.85,.2,.55]].forEach((dv,j)=>{const d=new V(...dv).normalize().multiplyScalar(window.HBIG?.62:.95);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,(col+j)*FW,row*FH);if(j==0)RT.lbl(ctx,(info[hk]||'')+' ('+st+')',col*FW,row*FH,FW*2)})});
  return {img:cnv.toDataURL('image/jpeg',.88),info}}"""
GEAR=COMMON+r"""(a)=>{const [sets]=a,FW=250,FH=330,{rd,sc,pc}=RT.mk(FW,FH),V=THREE.Vector3,info={};
  const cnv=document.createElement('canvas');cnv.width=FW*6;cnv.height=FH*sets.length;const ctx=cnv.getContext('2d');let H=null;
  sets.forEach((S,row)=>{const E={};['helm','chest','boots'].forEach(sl=>{if(S[sl]){const tp=RT.find(sl,S.arm,S[sl]);if(tp>=0)E[sl]=RT.it(tp,S.r)}});
    const wtp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='warrior'&&itT(RT.it(i)).wt==S.wt);if(wtp>=0)E.weapon=RT.it(wtp,S.r);
    info[S.n]=Object.keys(E).map(k=>ITPL[E[k].tp].n);
    if(H)sc.remove(H);H=RT.rat(E);sc.add(H);RT.idle(H);
    const cb=new V(0,.88,0),shot=(col,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
    shot(0,[0,.12,1],cb,4.3,S.n);shot(1,[.8,.15,.6],cb,4.3,'3/4');shot(2,[1,.1,0],cb,4.3,'side');shot(3,[-.6,.2,-.8],cb,4.3,'back 3/4');
    RT.pose(H,S.mv,.35);shot(4,[.7,.2,.8],cb,4.6,'wind-up');RT.pose(H,S.mv,.62);shot(5,[.5,.2,1],cb,4.6,'strike')});
  return {img:cnv.toDataURL('image/jpeg',.88),info}}"""
SETS=[{'n':'class outfit','wt':'gs','mv':'gs1','r':0},
 {'n':'heavy T1','arm':'heavy','helm':'nasal','chest':'mail','boots':'hobnail','wt':'sword','mv':'sword1','r':1},
 {'n':'heavy T3','arm':'heavy','helm':'great','chest':'cuirass','boots':'greave','wt':'ga','mv':'ga1','r':2},
 {'n':'heavy T5','arm':'heavy','helm':'winged','chest':'aegis','boots':'tread','wt':'hammer','mv':'mace1','r':4},
 {'n':'medium','arm':'medium','helm':'skullhood','chest':'mantle','boots':'strider','wt':'axes','mv':'axes1','r':3}]
HL=os.environ.get('HELMS','heavy:nasal,heavy:horned,heavy:great,heavy:visage,heavy:winged,heavy:barbute,heavy:bucket,heavy:crowned,medium:hood,medium:pelt,medium:cowl,medium:skullhood,medium:galemask,light:wrap,light:viper,light:glassmask,light:venom,cloth:hat,cloth:crown,cloth:tallcowl').split(',')
def save(name,url):open(O+'/'+name,'wb').write(base64.b64decode(url.split(',')[1]));print('wrote',name)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    if 'base' in PART:
        r=ev(BASE);print(r['info'],r['err']);save('v112_base.jpg',r['a']);save('v112_detail.jpg',r['b'])
        chk('rat rig has tail bones',r['info']['tail'] and r['info']['bones']==31,r['info'])
    if os.environ.get('BIG'):ev('()=>{window.HBIG=1}')
    if 'helms' in PART:
        r=ev(HELMS,[HL]);save('v112_helms.jpg',r['img']);chk('all helm styles found','MISSING' not in r['info'].values())
    if 'gear' in PART:
        r=ev(GEAR,[SETS]);print(r['info']);save('v112_gear.jpg',r['img'])
play.run(s,w=900,hh=600)
print('FAILURES:',FAIL if FAIL else 'none')
