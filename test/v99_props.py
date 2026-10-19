# v99 proportions: every humanoid's skeleton matches its baked geometry, feet on the ground, heights, armour in poses.
#   python3 v99_props.py                 -> checks + sheet <AW_TMP>/v99_sheet.png (armoured heroes rest / swing / stride)
#   SRC=<old.html> TAG=old python3 v99_props.py   -> the same sheet for another build
import json,os,play
TAG=os.environ.get('TAG','new')
JS=r"""()=>{
const out={},V=new THREE.Vector3(),W=new THREE.Vector3();
// skinned world positions of every vertex of a model's skinned meshes, in the model's own space
function verts(root){const pts=[];root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  root.traverse(o=>{if(!o.isSkinnedMesh||!o.visible||!o.geometry)return;const m=o.material;if(m&&m.visible===false)return;o.skeleton.update();const pa=o.geometry.attributes.position;
    for(let i=0;i<pa.count;i+=3){V.fromBufferAttribute(pa,i);W.copy(V);o.boneTransform(i,W);W.applyMatrix4(o.matrixWorld).applyMatrix4(inv);pts.push([V.x,V.y,V.z,W.x,W.y,W.z,o])}});return pts}
// at rest (all bone rotations zero) a correctly bound model puts every vertex back on its bind position
function restCheck(root,bones){const keep={};for(const k in bones){keep[k]=bones[k].rotation.clone();bones[k].rotation.set(0,0,0)}
  root.updateMatrixWorld(true);const rinv=new THREE.Matrix4().copy(root.matrixWorld).invert();const P=verts(root);let err=0,minY=1e9,maxY=-1e9;for(const p of P){const s=p[6];V.set(p[0],p[1],p[2]).applyMatrix4(s.matrixWorld).applyMatrix4(rinv);err=Math.max(err,Math.hypot(V.x-p[3],V.y-p[4],V.z-p[5]));minY=Math.min(minY,p[4]);maxY=Math.max(maxY,p[4])}
  for(const k in bones)bones[k].rotation.copy(keep[k]);return {n:P.length,err:+err.toFixed(5),minY:+minY.toFixed(3),maxY:+maxY.toFixed(3)}}
const gear=cls=>{const E={},A=CLS[cls].arm;['helm','chest','boots'].forEach(sl=>{let best=-1,bt=-1;ITPL.forEach((t,i)=>{if(t.sl==sl&&t.arm==A&&!t.nw&&(t.t|0)>bt){bt=t.t|0;best=i}});if(best>=0)E[sl]={id:-1,tp:best,lv:30,req:1,r:3,up:0,aff:[]}});return E};
out.hipOf=AW_PROP99.hipOf();out.pl={pelvisY:+pl.bones.pelvis.position.y.toFixed(3),rest:restCheck(pl,pl.bones)};
out.heroes={};['warrior','paladin','assassin','ranger','mage'].forEach(c=>{const h=buildHero();refreshGear(h,c,gear(c));out.heroes[c]=restCheck(h,h.bones);});
out.foes={};['bandit','orc','hobgoblin','hollowknight','cultist','skeleton','troll','vampk'].forEach(k=>{try{const E=EN[k],g=cr({g:[k],cl:[E&&E.col||0x777777],v:'',tr:'',f:0,z:1,evo:0,mods:[]});out.foes[k]=Object.assign(restCheck(g,g.h.bones),{pre:AW_PROP99.forKey(EN[k].hum),bs:+g.bs.toFixed(2)})}catch(e){out.foes[k]={err:String(e)}}});
['vlord','abom'].forEach(k=>{try{const g=mkHumanoid(k);out.foes[k]=restCheck(g,g.h.bones)}catch(e){out.foes[k]={err:String(e)}}});
try{const r=idlNpcBody({robe:0x5a4a3a,trim:0x3a2a1a,apron:1}),g=new THREE.Group();r.meshes.forEach(m=>g.add(m));out.npc=restCheck(g,r.bones)}catch(e){out.npc={err:String(e)}}
return out}"""
SHEET=r"""()=>{
const gear=cls=>{const E={},A=CLS[cls].arm;['helm','chest','boots'].forEach(sl=>{let best=-1,bt=-1;ITPL.forEach((t,i)=>{if(t.sl==sl&&t.arm==A&&!t.nw&&(t.t|0)>bt){bt=t.t|0;best=i}});if(best>=0)E[sl]={id:-1,tp:best,lv:30,req:1,r:3,up:0,aff:[]}});
  const w=ITPL.findIndex(t=>t.cls==cls&&t.sl=='weapon'&&!t.nw);if(w>=0)E.weapon={id:-1,tp:w,lv:30,req:1,r:2,up:0,aff:[]};if(cls=='paladin'){const o=ITPL.findIndex(t=>t.sl=='offhand');if(o>=0)E.offhand={id:-1,tp:o,lv:30,req:1,r:2,up:0,aff:[]}}return E};
const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setSize(1500,640);const S=new THREE.Scene();S.background=new THREE.Color(0x6a7684);
S.add(new THREE.HemisphereLight(0x9fb8e0,0x4a3c2c,.9));const d=new THREE.DirectionalLight(0xffe0b0,1.6);d.position.set(3,6,5);S.add(d);
const C=new THREE.PerspectiveCamera(26,1500/640,.1,100);C.position.set(0,1.0,9.2);C.lookAt(0,.8,0);
const poses=[b=>{},b=>{b.aR0.rotation.set(-2.9,0,-.25);b.aR1.rotation.x=-.2;b.aL0.rotation.set(-.6,0,.5);b.aL1.rotation.x=-.8;b.spine.rotation.y=.35;b.chest.rotation.x=.15},
  b=>{b.lh0.rotation.x=-.75;b.lh1.rotation.x=.9;b.rh0.rotation.x=.5;b.rh1.rotation.x=.3;b.aL0.rotation.x=.5;b.aR0.rotation.x=-.5;b.aR1.rotation.x=-.6;b.aL1.rotation.x=-.3}];
const cls=['warrior','paladin','assassin','ranger','mage'];
cls.forEach((c,i)=>poses.forEach((P,j)=>{const h=buildHero();refreshGear(h,c,gear(c));h.position.set((i-2)*1.45+(j-1)*.42,0,-j*.9);h.rotation.y=j==0?0:j==1?.9:-1.3;for(const k in h.bones)h.bones[k].rotation.set(0,0,0);P(h.bones);S.add(h)}));
const g=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshLambertMaterial({color:0x3e4a2c}));g.rotation.x=-Math.PI/2;S.add(g);
R.render(S,C);return R.domElement.toDataURL('image/png')}"""
def s(pg):
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if TAG=='new':
        r=pg.evaluate(JS);print('RESULT',json.dumps(r))
        ok=True
        def chk(n,c,info=''):
            nonlocal ok;ok=ok and c;print(('PASS ' if c else 'FAIL ')+n,info)
        chk('hero hips at the new rest height',abs(r['pl']['pelvisY']-r['hipOf'])<1e-3,r['pl']['pelvisY'])
        for k,v in list(r['heroes'].items())+list(r['foes'].items())+[('npc',r['npc'])]+[('player',r['pl']['rest'])]:
            if 'err' in v and isinstance(v['err'],str):chk(k+' builds',False,v['err']);continue
            chk(k+' bind matches geometry',v['err']<1e-3,v['err']);chk(k+' feet on the ground',abs(v['minY'])<.06,v['minY'])
        print('ALL_PASS' if ok else 'SOME_FAIL')
    import base64
    u=pg.evaluate(SHEET);open(play.TMP+'/v99_sheet_'+TAG+'.png','wb').write(base64.b64decode(u.split(',')[1]))
play.run(s)
