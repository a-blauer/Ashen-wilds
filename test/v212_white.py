# v212: a broken number (NaN) no longer whites out the screen.
#  1. the picture: a small object that draws NaN pixels (as the NaN health bar did on the owner's GPU) leaves the rest of the screen as
#     it was (before v212 the glow blurred the NaN over every pixel: white on the owner's GPU, a uniform colour here)
#  2. the cause: a weapon with no item level (the test library's knives) no longer makes the hero's attack NaN; knives still hurt;
#     after a fight no enemy has NaN health and nothing in the scene has a NaN transform
# Pictures: out/v212_white_ok.png (normal), out/v212_white_nan.png (with the NaN mesh in view)
import play,json,os,io
from PIL import Image,ImageStat
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v100_anim_lib.js').read()
def lum(png):return ImageStat.Stat(Image.open(io.BytesIO(png)).convert('L')).mean[0]
def s(pg):
    pg.set_default_timeout(1200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="assassin"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{insArrive(INSL[0]);toPos(292.97,134.84,.23);return 1}");pg.wait_for_timeout(3000)
    fails=0
    def ok(c,m):
        nonlocal fails
        print(('PASS ' if c else 'FAIL ')+m)
        if not c:fails+=1
    # 1. the picture
    a=pg.screenshot();open(play.TMP+'/v212_white_ok.png','wb').write(a)
    ev("""()=>{const q=pl.position.clone();q.y+=1.6;const z={value:0};
      const m=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),new THREE.ShaderMaterial({uniforms:{z},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float z;void main(){gl_FragColor=vec4(vec3(z/z),1.);}'}));
      m.position.copy(q);m.frustumCulled=false;window.__nm=m;window.__nm2=m;scene.add(m);return 1}""")
    pg.wait_for_timeout(1500)
    b=pg.screenshot();open(play.TMP+'/v212_white_nan.png','wb').write(b)
    ev("()=>{scene.remove(__nm,__nm2);return 1}")
    def corners(png):
        im=Image.open(io.BytesIO(png)).convert('L');w,h=im.size;return [ImageStat.Stat(im.crop(bx)).mean[0] for bx in [(0,int(h*.15),int(w*.2),int(h*.4)),(int(w*.8),int(h*.15),w,int(h*.4)),(0,int(h*.6),int(w*.2),int(h*.85)),(int(w*.8),int(h*.6),w,int(h*.85))]]
    ca,cb=corners(a),corners(b);dmax=max(abs(x-y) for x,y in zip(ca,cb))
    ok(dmax<12,'a NaN pixel in view stays where it is: the rest of the screen is unchanged (corner brightness %s → %s)'%([round(x) for x in ca],[round(x) for x in cb]))
    # 1b. a NaN camera (the whole-screen case): broken position, turn and blended settings are put back within a frame or two
    ev("()=>{cam.position.x=NaN;cam.quaternion.x=NaN;camK=NaN;camYaw=NaN;camDD=NaN;look.y=NaN;return 1}")
    pg.wait_for_timeout(1500)
    c=json.loads(ev("()=>JSON.stringify({p:[cam.position.x,cam.position.y,cam.position.z].map(v=>isFinite(v)),q:isFinite(cam.quaternion.x),k:isFinite(camK),y:isFinite(camYaw),dd:camDD==null||isFinite(camDD),look:isFinite(look.y),d:+cam.position.distanceTo(pl.position).toFixed(1)})"))
    ok(all(c['p']) and c['q'] and c['k'] and c['y'] and c['dd'] and c['look'] and c['d']<30,'a NaN camera is put back behind the hero (%s)'%c)
    d=pg.screenshot();open(play.TMP+'/v212_white_cam.png','wb').write(d)
    ok(abs(lum(d)-lum(a))<6,'and the view looks normal again (brightness %.1f, normally %.1f)'%(lum(d),lum(a)))
    # 2. the cause, and a fight
    ev("(s)=>{(0,eval)(s)}",LIB)
    r=json.loads(ev("""()=>{V100T.equip('knives');refreshGear(pl,hero.cls,eq);hero.iv=0;const pa=HS().pa;window.__hp=setInterval(()=>{if(hero.hp<30)hero.hp=heroMax()},200);
      const P=pl.position,L=((n3Ins(0)||{}).L||['skeleton']);window.__dealt=0;{const h=hurt;hurt=function(e,d){if(isFinite(d))__dealt+=d;return h.apply(this,arguments)}}
      for(let i=0;i<5;i++){const a=i/5*6.28;spawnEnemy(L[i%L.length],P.x+Math.cos(a)*6,P.z+Math.sin(a)*6,2,{})}
      window.__t=setInterval(()=>{let b=null,bd=1e9;for(const e of enemies){if(e.dead)continue;const d=e.m.position.distanceTo(P);if(d<bd){bd=d;b=e}}if(b&&bd<14){tgt=b;atkCd=0;swing()}},350);
      return JSON.stringify({pa:String(pa),noLv:!(eq.weapon.lv>0)})}"""))
    pg.wait_for_timeout(9000)
    q=json.loads(ev("""()=>{clearInterval(__t);clearInterval(__hp);const nanE=enemies.filter(e=>e.c&&!isFinite(e.c.h)).length;let nanT=0;scene.updateMatrixWorld(true);
      scene.traverse(o=>{const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(e[i])){nanT++;break}});return JSON.stringify({nanE,nanT,dealt:Math.round(__dealt),throws:knN})}"""))
    print(json.dumps(r),json.dumps(q))
    ok(r['noLv'] and r['pa']!='NaN' and float(r['pa'])>0,'a weapon with no item level still gives a real attack (pa %s)'%r['pa'])
    ok(q['dealt']>0 and q['throws']>3,'the knives hurt (%s damage from %s throws)'%(q['dealt'],q['throws']))
    ok(q['nanE']==0 and q['nanT']==0,'no enemy has NaN health and nothing has a NaN transform after the fight (%s)'%q)
    print('FAILS',fails)
play.run(s,w=900,hh=560)
