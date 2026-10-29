# v171 see-through (0061, 3350, 3355, 3356; replaces v169_seethrough.py): whatever blocks the view of the hero turns to glass as a
# whole object (no round window), with a slight dither; past an instance's edge the rock carries on (no black, no void) with a
# floor under it, and from inside the rock you look through it.
#   python3 fast.py v171_seethrough.py      (pictures: <AW_TMP>/v171t_*.png; SRC=<older build> for before pictures)
# FAIL when: a cave wall between the camera and the hero does not switch the ground to glass, or the hero is no more visible
# through it than through solid rock; a scenery object between the camera and the hero is not handed over whole (its box must
# hold the whole object, its far parts glass too); void is left round any instance's land; the apron / floor are missing; the view
# from out past an edge or from inside the rock is black anywhere the rays meet the world outside the map; the hero is not visible
# from inside the rock; the passes leave the renderer changed; the glass has no dither.
import play,os,json
from PIL import Image
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
F=[]
def fail(*a):F.append(' '.join(str(x) for x in a));print('FAIL',*a)
def lum(im,box):
    c=im.crop(box).convert('L');h=c.histogram();n=sum(h);return sum(i*v for i,v in enumerate(h))/max(1,n)
def diff(a,b,box):
    a=a.crop(tuple(box)).convert('L');b=b.crop(tuple(box)).convert('L');return sum(abs(x-y) for x,y in zip(a.tobytes(),b.tobytes()))/max(1,a.size[0]*a.size[1])
NEW=os.environ.get('OLD')!='1'
# a spot where one scenery object (not the ground) stands between the camera and the hero: rays from camera spots round the hero
# against the drawn meshes; returns the spot and the object's world box
OBJ=r"""(gk)=>{const I=INSL[gk];if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}return 1}"""
OBJ2=r"""()=>{const I=INSL[cvKey()],rc=new THREE.Raycaster(),V3=THREE.Vector3,M=[];scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||!o.visible)return;const m=o.material;if(!m||!m.userData||!m.userData.gh169||m.userData.gh171T||m.userData.gh169All)return;
    let p=o,v=true;while(p){if(!p.visible){v=false;break}p=p.parent}if(!v)return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const r=g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis();if(r<.8||r>4)return;M.push(o)});
  let best=null;const P=pl.position;
  for(const o of M){const b=new THREE.Box3().setFromObject(o),c=b.getCenter(new V3()),sz=b.getSize(new V3());if(sz.y<1.6)continue;
    for(let a=0;a<12&&!best;a++){const yaw=a/12*Math.PI*2,dx=Math.sin(yaw),dz=Math.cos(yaw),x=c.x-dx*(sz.x/2+2.2),z=c.z-dz*(sz.z/2+2.2);
      if(x<I.x0+3||z<I.y0+3||x>I.x0+I.w-3||z>I.y0+I.h-3||solid(x,z))continue;const y=GH(x,z);if(Math.abs(y-c.y+sz.y/2)>1.5)continue;
      const h=new V3(x,y+1.1,z),cp=new V3(x+dx*Math.cos(.3)*9,y+1.1+Math.sin(.3)*9,z+dz*Math.cos(.3)*9);if(GH(cp.x,cp.z)>cp.y-1)continue;
      let gb=false;for(let s=.5;s<9;s+=.4){const f=s/9,px=cp.x+(h.x-cp.x)*f,pz=cp.z+(h.z-cp.z)*f,py=cp.y+(h.y-cp.y)*f;if(GH(px,pz)>py){gb=true;break}}if(gb)continue;
      rc.set(cp,h.clone().sub(cp).normalize());rc.far=cp.distanceTo(h)-.5;const hit=rc.intersectObject(o,false);if(!hit.length)continue;
      best={x,z,yaw,box:[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(2)),name:o.name||o.parent&&o.parent.name||'',uuid:o.uuid}}
    if(best)break}
  return best}"""
STATE=r"""()=>{const o=[];if(cam.layers.mask!==1)o.push('camera layers '+cam.layers.mask);if(!scene.background||!scene.background.isColor)o.push('scene background');
  if(ren.autoClear!==true)o.push('autoClear');if(GH169C.hid.length)o.push('hidden list not empty');if(GH169C.pass)o.push('pass flag '+GH169C.pass);
  let cb=0;scene.traverse(x=>{if(x.isMesh&&x.material&&x.material.userData&&x.material.userData.gh169&&x.material.blending===THREE.CustomBlending)cb++});if(cb)o.push(cb+' see-through materials left blending');
  if(GH169.U.uGhM.value!==0)o.push('mode left '+GH169.U.uGhM.value);
  let hm=null;pl.traverse(x=>{if(!hm&&x.isMesh)hm=x.material});if(!hm||!hm.stencilWrite||hm.stencilRef!==1)o.push('hero material not marked');
  const tm=GTX.list[0]&&GTX.list[0].mat;if(!tm||!tm.stencilWrite)o.push('terrain material not marked');if(tm&&tm.side!==THREE.DoubleSide)o.push('terrain not two-sided');
  let sm=null;scene.traverse(x=>{if(!sm&&x.isMesh&&x.material&&x.material.userData&&x.material.userData.gh169&&/f135$/.test(x.material.customProgramCacheKey()))sm=x.material});
  if(!sm)o.push('no f135 scenery material found');else if(sm.stencilWrite)o.push('scenery material marked as clear');
  if(!(GH169.U.uGhD.value>0))o.push('no dither');
  return o}"""
# screen points whose view ray first meets the world outside the instance's rectangle (the rock past the edge), or passes under the map
OUTPTS=r"""(st)=>{const k=cvKey(),I=INSL[k],c=cam.position,v=new THREE.Vector3(),d=new THREE.Vector3(),out=[];
  const inR=(x,z)=>x>=I.x0&&x<=I.x0+I.w&&z>=I.y0&&z<=I.y0+I.h;
  for(let gy=0;gy<12;gy++)for(let gx=0;gx<16;gx++){const sx=-.92+gx*1.84/15,sy=.92-gy*1.6/11;v.set(sx,sy,.5).unproject(cam);d.copy(v).sub(c).normalize();
    let hit=0;for(let s=.5;s<90;s+=.25){const x=c.x+d.x*s,y=c.y+d.y*s,z=c.z+d.z*s;if(!inR(x,z)){hit=2;break}if(y<GH(x,z)-.3&&s>3){hit=1;break}}
    if(hit===2)out.push([Math.round(st[0]+(sx+1)/2*st[2]),Math.round(st[1]+(1-sy)/2*st[3])])}
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    stage=pg.evaluate("()=>{const r=$('stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
    def place(q,dist,pitch,n=60):
        pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,q.yaw);camYaw=q.yaw;camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch]);pg.evaluate(FR,n)
    def shot(name):
        p=play.TMP+'/v171t_'+name+'.png';pg.screenshot(path=p,timeout=600000);return Image.open(p).convert('RGB')
    def solid():   # the same view with the glass made solid
        pg.evaluate("()=>{GH169.a=1;GH169.d=0;return 1}");pg.evaluate(FR,3);
    def glass():pg.evaluate("()=>{GH169.a=.4;GH169.d=window.GH171?.16:0;return 1}");pg.evaluate(FR,3)
    BOX=r"""(st)=>{const P=pl.position,v=new THREE.Vector3(),xs=[],ys=[];for(const h of [.2,1,1.8])for(const [dx,dz] of [[-.35,0],[.35,0],[0,-.35],[0,.35]]){v.set(P.x+dx,P.y+h,P.z+dz).project(cam);xs.push(st[0]+(v.x+1)/2*st[2]);ys.push(st[1]+(1-v.y)/2*st[3])}
      return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].map(Math.round)}"""
    if NEW:
        # 0. the fill: no void left round any instance's land, reached from its rectangle's edge
        r=pg.evaluate("""()=>{const o=[];let n=0;for(const I of INSL){if(!I||!I.ed171)continue;n++;let bad=0;
            for(let i=0;i<=I.w;i++)for(const j of [0,I.h])if(GH(I.x0+i,I.y0+j)<-6)bad++;for(let j=0;j<=I.h;j++)for(const i of [0,I.w])if(GH(I.x0+i,I.y0+j)<-6)bad++;
            if(bad)o.push('g'+I.g+': '+bad+' edge points still void')}return {n,o,st:window.ED171F}}""")
        print('fill',json.dumps(r['st']),'instances',r['n'])
        if r['n']<30:fail('fill: only',r['n'],'instances filled')
        for x in r['o']:fail('fill:',x)
    # 1. a cave wall between the camera and the hero (Glowmire, field II): the ground turns to glass, the hero shows through
    q=pg.evaluate(CAVE,1);pg.wait_for_timeout(2000)
    if not q:fail('cave: no wall spot found')
    else:
        place(q,9.5,.3);p0=pg.evaluate("()=>GH169C.st.passes");place(q,9.5,.3,20)
        on=shot('cave');st=pg.evaluate("()=>({st:Object.assign({},GH169C.st),t:GH169.U.uGhT.value,g:window.GH171?Object.assign({},GH171.st):null})")
        print('cave',json.dumps(st))
        if st['st']['passes']<=p0:fail('cave: the ghost passes did not run')
        if NEW and st['t']<.99:fail('cave: the ground did not switch to glass (uGhT',st['t'],')')
        box=pg.evaluate(BOX,stage);solid();sl=shot('cave_solid');glass()
        d=diff(on,sl,box);print('cave hero box',box,'glass vs solid',round(d,1))
        if d<6:fail('cave: the hero is not visible through the wall (difference to a solid wall',round(d,1),')')
        for x in pg.evaluate(STATE):fail('state:',x)
    # 2. one scenery object between the camera and the hero (Kindlelight I): handed over whole
    pg.evaluate(OBJ,0);pg.wait_for_timeout(3000);pg.evaluate(FR,30)
    q=pg.evaluate(OBJ2)
    if not q:fail('object: no spot with one object between the camera and the hero')
    else:
        place(q,9,.3);place(q,9,.3,20);on=shot('object')
        r=pg.evaluate("""(q)=>{if(!window.GH171)return null;const b=q.box,o=[];for(const x of GH171.box)o.push({k:x.k,w:+x.w.toFixed(2),on:x.on,mn:x.mn.toArray().map(v=>+v.toFixed(2)),mx:x.mx.toArray().map(v=>+v.toFixed(2))});
            const hold=GH171.box.some(x=>x.w>.9&&x.mn.x<=b[0]+.05&&x.mn.y<=b[1]+.05&&x.mn.z<=b[2]+.05&&x.mx.x>=b[3]-.05&&x.mx.y>=b[4]-.05&&x.mx.z>=b[5]-.05);
            return {hold,boxes:o,st:Object.assign({},GH171.st)}}""",q)
        print('object',q['name'],json.dumps(q['box']),json.dumps(r))
        if NEW:
            if not r or not r['hold']:fail('object: no box holds the whole object',q['name'],q['box'])
        box=pg.evaluate(BOX,stage);solid();sl=shot('object_solid');glass()
        d=diff(on,sl,box);print('object hero box',box,'glass vs solid',round(d,1))
        if d<5:fail('object: the hero is not visible through the object (difference',round(d,1),')')
    # 3. the camera out past an instance's edge (Kindlelight III): the world out there is rock, never black
    q=pg.evaluate(EDGE,2);pg.wait_for_timeout(2000)
    if not q:fail('edge: no edge spot found')
    else:
        place(q,12,.3);im=shot('edge')
        if NEW:
            a=pg.evaluate("()=>ED171.cur?{k:ED171.cur.k,st:Object.assign({},ED171.st)}:null");print('apron',json.dumps(a))
            if not a:fail('edge: no apron / floor built for the instance')
        pts=pg.evaluate(OUTPTS,stage);L=sorted(lum(im,(x-2,y-2,x+3,y+3)) for x,y in pts)
        print('edge',len(L),'points outside the map, brightness',[round(v) for v in L][:40])
        if NEW and len(L)>=4 and L[len(L)//2]<10:fail('edge: the world past the edge is black (median',round(L[len(L)//2]),'of 255)')
    # 4. the camera inside the rock of an instance's wall (Hillside Crest III's west wall): you look through it at the hero
    q=pg.evaluate(EDGE,7);pg.wait_for_timeout(2000)
    if not q:fail('inside the rock: no edge spot found')
    else:
        q['yaw']=-1.5708
        d=pg.evaluate("""(q)=>{let best=0;for(let d=4.5;d<=15;d+=.5){const x=q.x+Math.sin(q.yaw)*Math.cos(.3)*d,z=q.z+Math.cos(q.yaw)*Math.cos(.3)*d,y=GH(q.x,q.z)+1.1+Math.sin(.3)*d;if(GH(x,z)>y+.8)best=d}return best}""",q)
        if not d:fail('inside the rock: no camera distance puts the camera inside the wall')
        else:
            place(q,d,.3);place(q,d,.3,20);im=shot('inwall')
            u=pg.evaluate("()=>window.GH171?[GH171.under,GH169.U.uGhT.value]:[1,1]");print('inside the rock: under, ground glass',u)
            if not u[0]:fail('inside the rock: the camera was not seen as inside the rock',u)
            L=sorted(lum(im,(x-2,y-2,x+3,y+3)) for x,y in [(stage[0]+stage[2]*fx,stage[1]+stage[3]*fy) for fx in (.1,.3,.5,.7,.9) for fy in (.1,.3,.7,.9)])
            print('inside the rock: screen brightness',[round(v) for v in L])
            if NEW and L[len(L)//4]<10:fail('inside the rock: parts of the view are black (25th percentile',round(L[len(L)//4]),')')
            hero=pg.evaluate(BOX,stage);solid();sl=shot('inwall_solid');glass();dd=diff(im,sl,hero)
            print('inside the rock: hero box',hero,'glass vs solid',round(dd,1))
            if dd<5:fail('inside the rock: the hero is not seen through the rock (difference',round(dd,1),')')
            for x in pg.evaluate(STATE):fail('state:',x)
    print('DONE' if not F else 'FAILED '+str(len(F)))
play.run(s,w=1000,hh=620)
