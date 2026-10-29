# v169 see-through walls (0061, 3350): what stands between the camera and the hero turns to glass (no dither), buildings behind
# the glass are dark, the hero shows through, and the void past an instance's edge is black.
#   python3 fast.py v169_seethrough.py      (pictures: <AW_TMP>/v169t_*.png; v169_ghost_look.py has more views)
# FAIL when: the ghost passes don't run with a cave wall between the camera and the hero; the hero is no more visible through the
# wall than with the glass made solid; the void past an instance's edge is not black; the passes leave the renderer changed
# (layers, background, autoClear, hidden objects, blending); the stencil marks are wrong (hero, ground: 1; scenery: 0).
import play,os,json
from PIL import Image
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
F=[]
def fail(*a):F.append(' '.join(str(x) for x in a));print('FAIL',*a)
def lum(im,box):
    c=im.crop(box).convert('L');h=c.histogram();n=sum(h);return sum(i*v for i,v in enumerate(h))/max(1,n)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    stage=pg.evaluate("()=>{const r=$('stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
    def place(q,dist,pitch):
        pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,q.yaw);camYaw=q.yaw;camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch]);pg.evaluate(FR,60)
    def shot(name):
        p=play.TMP+'/v169t_'+name+'.png';pg.screenshot(path=p,timeout=600000);return Image.open(p).convert('RGB')
    # the hero's box on the page (project the hero's feet and head)
    BOX=r"""(st)=>{const P=pl.position,v=new THREE.Vector3(),xs=[],ys=[];for(const h of [.2,1,1.8])for(const dx of [-.35,.35]){v.set(P.x+dx,P.y+h,P.z).project(cam);xs.push(st[0]+(v.x+1)/2*st[2]);ys.push(st[1]+(1-v.y)/2*st[3])}
      return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].map(Math.round)}"""
    # 1. a cave wall between the camera and the hero
    q=pg.evaluate(CAVE,1);pg.wait_for_timeout(2000)
    if not q:fail('cave: no wall spot found')
    else:
        place(q,9.5,.3);p0=pg.evaluate("()=>GH169C.st.passes")
        on=shot('cave');st=pg.evaluate("()=>Object.assign({},GH169C.st)")
        print('cave passes',json.dumps(st))
        if st['passes']<=p0:fail('cave: the ghost passes did not run (passes',st['passes'],'before',p0,')')
        box=pg.evaluate(BOX,stage)
        pg.evaluate("()=>{GH169.a=1;return 1}");solid=shot('cave_solid');pg.evaluate("()=>{GH169.a=.4;return 1}")
        a=on.crop(tuple(box)).convert('L');b=solid.crop(tuple(box)).convert('L')
        d=sum(abs(x-y) for x,y in zip(a.tobytes(),b.tobytes()))/max(1,a.size[0]*a.size[1])
        print('cave hero box',box,'mean difference glass vs solid',round(d,1))
        if d<6:fail('cave: the hero is not visible through the wall (difference to a solid wall',round(d,1),')')
        # the renderer is left as it was
        r=pg.evaluate("""()=>{const o=[];if(cam.layers.mask!==1)o.push('camera layers '+cam.layers.mask);if(!scene.background||!scene.background.isColor)o.push('scene background');
          if(ren.autoClear!==true)o.push('autoClear');if(GH169C.hid.length)o.push('hidden list not empty');if(GH169C.pass)o.push('pass flag '+GH169C.pass);
          let cb=0;scene.traverse(x=>{if(x.isMesh&&x.material&&x.material.userData&&x.material.userData.gh169&&x.material.blending===THREE.CustomBlending)cb++});if(cb)o.push(cb+' see-through materials left blending');
          if(GH169.U.uGhM.value!==0)o.push('mode left '+GH169.U.uGhM.value);
          // stencil marks: the hero 1, the ground 1, scenery (f135) not
          let hm=null;pl.traverse(x=>{if(!hm&&x.isMesh)hm=x.material});if(!hm||!hm.stencilWrite||hm.stencilRef!==1)o.push('hero material not marked');
          const tm=GTX.list[0]&&GTX.list[0].mat;if(!tm||!tm.stencilWrite)o.push('terrain material not marked');
          let sm=null;scene.traverse(x=>{if(!sm&&x.isMesh&&x.material&&x.material.userData&&x.material.userData.gh169&&/f135$/.test(x.material.customProgramCacheKey()))sm=x.material});
          if(!sm)o.push('no f135 scenery material found');else if(sm.stencilWrite)o.push('scenery material marked as clear');
          return o}""")
        for x in r:fail('state:',x)
    # 2. the camera out past an instance's edge: the void is black
    q=pg.evaluate(EDGE,2);pg.wait_for_timeout(2000)
    if not q:fail('edge: no edge spot found')
    else:
        place(q,12,.3);im=shot('edge')
        # screen points whose view ray first meets the world outside the instance (ground out there or the cliff at its edge, or
        # falls below -30 there)
        pts=pg.evaluate("""(st)=>{const k=cvKey(),I=INSL[k],c=cam.position,v=new THREE.Vector3(),d=new THREE.Vector3(),out=[];
          const m=GH169.vin+.15,inR=(x,z)=>x>=I.x0+m&&x<=I.x0+I.w-m&&z>=I.y0+m&&z<=I.y0+I.h-m;   // the ground's last tile is the cliff it drops off
          for(let gy=0;gy<10;gy++)for(let gx=0;gx<16;gx++){const sx=-.9+gx*1.8/15,sy=.9-gy*1.5/9;v.set(sx,sy,.5).unproject(cam);d.copy(v).sub(c).normalize();
            let hit=0;for(let s=.5;s<80;s+=.25){const x=c.x+d.x*s,y=c.y+d.y*s,z=c.z+d.z*s;const g=GH(x,z);
              if(inR(x,z)){if(y<g){hit=1;break}}else if(y<g-.3||y<-30){hit=2;break}}
            if(hit===2)out.push([Math.round(st[0]+(sx+1)/2*st[2]),Math.round(st[1]+(1-sy)/2*st[3])])}
          return {cam:[c.x,c.y,c.z].map(n=>+n.toFixed(1)),pts:out}}""",stage)
        L=[lum(im,(x-2,y-2,x+3,y+3)) for x,y in pts['pts']]
        print('edge',json.dumps(pts['cam']),len(L),'void points, brightness',[round(v) for v in L])
        if len(L)<4:fail('edge: too few void points on screen',len(L))
        else:   # a few points may catch a firefly or a spark floating in the void: judge the 85th percentile
            p85=sorted(L)[int(len(L)*.85)]
            if p85>14:fail('edge: the void past the edge is not black (85th percentile',round(p85),'of 255)')
    print('DONE' if not F else 'FAILED '+str(len(F)))
play.run(s,w=1000,hh=620)
