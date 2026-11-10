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
    # 2. the cause: knives thrown at a held target, the shots stepped by hand (no clock, so the same on every machine)
    ev("(s)=>{(0,eval)(s)}",LIB)
    r=json.loads(ev("""()=>{V100T.equip('knives');refreshGear(pl,hero.cls,eq);const C=CLS[hero.cls],S=HS(),pa=S.pa,raw=atkOf(C.mt)*(1+S.basicP);
      // a target held two steps ahead; knives thrown the way the knife throw launches them; the shots stepped by hand (no clock)
      const P=pl.position,fw=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),x=P.x+fw.x*3,z=P.z+fw.z*3,L=((n3Ins(0)||{}).L||['skeleton']);
      const e=spawnEnemy(L[0],x,z,2,{});e.c.h=e.c.st.hp=1e6;let dealt=0;{const h=hurt;hurt=function(q,d){if(q===e&&isFinite(d))dealt+=d;return h.apply(this,arguments)}}
      const hold=()=>{e.m.position.set(x,GH(x,z),z);e.vx=e.vz=0;e.agg=0;e.dead=false};let n=0;
      for(let k=0;k<5;k++){hold();const d=e.m.position.clone().sub(P);d.y=0;d.normalize();shots.length=0;launch(pl.position,d,26,{col:0xd8dde6,arrow:1,mt:'p',basic:1,wfx:'knife',pierce:WB127.knPierce,mpSc:.7,knife:1},raw*WB127.knife1,.5);n++;
        for(let i=0;i<40&&shots.length;i++){hold();shotTick(.016)}}
      const nanE=enemies.filter(q=>q.c&&!isFinite(q.c.h)).length;let nanT=0;scene.updateMatrixWorld(true);scene.traverse(o=>{const m=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(m[i])){nanT++;break}});
      e.dead=1;e.m.visible=false;
      return JSON.stringify({pa:String(pa),raw:String(raw),noLv:!(eq.weapon.lv>0),dealt:Math.round(dealt),throws:n,nanE,nanT})}"""))
    q=r
    print(json.dumps(r),json.dumps(q))
    ok(r['noLv'] and r['pa']!='NaN' and float(r['pa'])>0,'a weapon with no item level still gives a real attack (pa %s)'%r['pa'])
    ok(q['dealt']>0 and q['throws']==5,'the knives hurt (%s damage from %s throws)'%(q['dealt'],q['throws']))
    ok(q['nanE']==0 and q['nanT']==0,'no enemy has NaN health and nothing has a NaN transform after the fight (%s)'%q)
    print('FAILS',fails)
play.run(s,w=900,hh=560)
