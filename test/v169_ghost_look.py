# v169 pictures: what the camera sees when something stands between it and the hero (see-through walls, black insides, black void).
#   python3 fast.py v169_ghost_look.py        VIEWS=house,housein,cave,edge,edge3,edgein,dusk,abeksi,abhouse (default all); output <AW_TMP>/v169_<view>.png
# house: a Duskhold building between the camera and the hero; housein: the camera inside that building; cave: a cave wall
# (Glowmire, field II); edge: the camera pushed out past an instance's outer wall; abeksi: a street in the snake city.
import play,os,json
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
FR=r"""async(n)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));if(window.__lf==null){window.__lf=0;const f=loop;loop=function(){window.__lf++;return f.apply(this,arguments)}}
  const f0=window.__lf,t0=performance.now();while(window.__lf<f0+n&&performance.now()-t0<30000)await sl(15);return 1}"""
# a building between the camera and the hero in Duskhold (as v135_fade_shot): returns the spot and how far along the ray the wall is
HOUSE=r"""()=>{const T=TOWNS[0],rc=new THREE.Raycaster(),V3=THREE.Vector3;let best=null;const M=[];scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh)M.push(o)});
  for(let z=T.cy-20;z<T.cy+30&&!best;z+=2)for(let x=T.cx-24;x<T.cx+24&&!best;x+=2){if(solid(x,z))continue;
    for(let a=0;a<8&&!best;a++){const yaw=a/8*Math.PI*2,y=GH(x,z),h=new V3(x,y+1.1,z),c=new V3(x+Math.sin(yaw)*Math.cos(.35)*8,y+1.1+Math.sin(.35)*8,z+Math.cos(yaw)*Math.cos(.35)*8);
      const dir=h.clone().sub(c),L=dir.length();rc.set(c,dir.normalize());rc.far=L-1.5;rc.camera=cam;let I=[];try{I=rc.intersectObjects(M,false)}catch(e){I=[]}
      I=I.filter(q=>q.object.visible&&q.distance>1.5);const hit=I.find(q=>{const b=new THREE.Box3().setFromObject(q.object);return b.max.y-b.min.y>2.5&&q.point.y>y+1});
      if(hit)best={x,z,yaw,hd:+(8-hit.distance).toFixed(2),obj:hit.object.name||hit.object.parent&&hit.object.parent.name||hit.object.type}}}
  return best}"""
CAVE=r"""(gk)=>{const I=INSL[gk];if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}
  const step=.55,wall=(x,z,yw,D)=>{const ox=Math.sin(yw),oz=Math.cos(yw);let prev=GH(x,z);for(let s=.5;s<=D;s+=.5){const g=GH(x+ox*s,z+oz*s);if(g-prev>step)return s;prev=g}return 0};
  const ok=(x,z)=>{const d=MAP.DW[Math.round(z)*W+Math.round(x)];return d!=null&&d<-1.5};
  let best=null;const pts=(I.path||[]).concat(I.en?[I.en]:[]);const c0=I.wa||I.ba;if(c0)for(let a=0;a<40;a++)for(let r=4;r<=28;r+=4)pts.push([c0[0]+Math.sin(a*2.4)*r,c0[1]+Math.cos(a*2.4)*r]);
  for(let i=0;i<pts.length;i+=2){const p=pts[i];if(!p||!ok(p[0],p[1]))continue;
    for(let a=0;a<32;a++){const yw=a/32*Math.PI*2,w=wall(p[0],p[1],yw,9);if(w>2.5&&w<6){const sc=Math.abs(w-4);if(!best||sc<best.sc)best={x:p[0],z:p[1],yaw:yw,w,sc}}}}
  return best}"""
# the hero next to an instance's outer edge, the camera behind them out past the edge
EDGE=r"""(gk)=>{const I=INSL[gk];if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}
  const ok=(x,z)=>{const d=MAP.DW[Math.round(z)*W+Math.round(x)];return d!=null&&d<-1.5&&!solid(x,z)};let best=null;
  for(let z=I.y0+2;z<I.y0+I.h-2;z+=1)for(let x=I.x0+2;x<I.x0+I.w-2;x+=1){if(!ok(x,z))continue;
    const sides=[[x-I.x0,-Math.PI/2],[I.x0+I.w-x,Math.PI/2],[z-I.y0,Math.PI],[I.y0+I.h-z,0]];
    for(const [d,yaw] of sides)if(d<9&&(!best||d<best.d))best={x,z,yaw,d}}
  return best}"""
# an Abeksi house (two-sided, with floors inside) between the camera and the hero: the ray from the camera to the hero passes
# through at least two of its walls
ABHOUSE=r"""()=>{const I=INSL[30],rc=new THREE.Raycaster(),V3=THREE.Vector3;const M=[];AB152.S.root.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh&&o.material&&o.material.side===2)M.push(o)});
  let best=null;for(let v=20;v<I.h-20;v+=4)for(let u=20;u<I.w-20;u+=4){const x=I.x0+u,z=I.y0+v;if(solid(x,z))continue;
    for(let a=0;a<12;a++){const yaw=a/12*Math.PI*2,y=GH(x,z),h=new V3(x,y+1.1,z),c=new V3(x+Math.sin(yaw)*Math.cos(.3)*9.5,y+1.1+Math.sin(.3)*9.5,z+Math.cos(yaw)*Math.cos(.3)*9.5);
      if(GH(c.x,c.z)>c.y-.5)continue;const dir=h.clone().sub(c),L=dir.length();rc.set(c,dir.normalize());rc.far=L-1.2;rc.near=1.5;
      const I2=rc.intersectObjects(M,false).filter(q=>q.point.y>y+1.4);if(I2.length>=2){const sc=I2.length;if(!best||sc>best.n)best={x,z,yaw,n:sc}}}}
  return best}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    def shoot(name,q,dist,pitch=.35):
        pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,q.yaw);camYaw=q.yaw;camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch])
        pg.evaluate(FR,60)
        info=pg.evaluate("()=>{const c=cam.position,P=pl.position;return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(1)),hero:[P.x,P.y,P.z].map(v=>+v.toFixed(1)),gh:+GH(c.x,c.z).toFixed(1),dist:+c.distanceTo(P).toFixed(1),gst:window.GH169C?Object.assign({},GH169C.st):null}}")
        print('VIEW',name,json.dumps(q),json.dumps(info))
        pg.screenshot(path=play.TMP+'/v169_'+name+'.png',timeout=600000);print('shot',name)
        if os.environ.get('ALT'):   # the same view with the see-through passes off (everything solid)
            pg.evaluate("()=>{GH169.on=false;return 1}");pg.screenshot(path=play.TMP+'/v169_'+name+'_off.png',timeout=600000);pg.evaluate("()=>{GH169.on=true;return 1}")
    if not VIEWS or 'house' in VIEWS or 'housein' in VIEWS:
        q=pg.evaluate(HOUSE)
        if not q:print('FAIL house: no building spot found')
        else:
            if not VIEWS or 'house' in VIEWS:shoot('house',q,8)
            if not VIEWS or 'housein' in VIEWS:shoot('housein',q,max(4.5,q['hd']+.8))
    if not VIEWS or 'cave' in VIEWS:
        q=pg.evaluate(CAVE,1);pg.wait_for_timeout(2000)
        if not q:print('FAIL cave: no wall spot found')
        else:shoot('cave',q,9.5,.3)
    for nm,gk,pt in [('edge',0,.3),('edge3',2,.3),('edgein',2,.45)]:
        if VIEWS and nm not in VIEWS:continue
        q=pg.evaluate(EDGE,gk);pg.wait_for_timeout(2000)
        if not q:print('FAIL',nm,': no edge spot found');continue
        if nm=='edgein':q['yaw']+=3.14159   # the camera inside, looking out over the edge
        shoot(nm,q,12 if nm!='edgein' else 9.5,pt)
    if not VIEWS or 'inwall' in VIEWS:   # Hillside Crest III (INSL[7]): the camera inside the rock of the instance's west wall
        q=pg.evaluate(EDGE,7);pg.wait_for_timeout(2000)
        if q:
            q['yaw']=-1.5708
            for nm,pt in [('inwall',.3),('inwall2',.6)]:
                d=pg.evaluate("""(a)=>{const q=a[0],p=a[1];let best=0;for(let d=4.5;d<=15;d+=.5){const x=q.x+Math.sin(q.yaw)*Math.cos(p)*d,z=q.z+Math.cos(q.yaw)*Math.cos(p)*d,y=GH(q.x,q.z)+1.1+Math.sin(p)*d;if(GH(x,z)>y+.8)best=d}return best}""",[q,pt])
                print(nm,'dist',d)
                if d:shoot(nm,q,d,pt)
                else:print('FAIL',nm,': no spot with the camera inside the wall')
    if not VIEWS or 'dusk' in VIEWS:   # Duskhold: the camera pushed out past the kingdom's wall, over the island's edge
        q=pg.evaluate(HOUSE)
        if q:shoot('dusk',q,15,.25)
    if not VIEWS or 'abeksi' in VIEWS or 'abhouse' in VIEWS:
        pg.evaluate("()=>{AB152Q.st=1;ab152Enter();AB152H.frz=1;window.__k169=setInterval(()=>{AB152H.frz=1},100);return 1}");pg.wait_for_timeout(4000)
        q=pg.evaluate("()=>{const I=INSL[30];return {x:I.x0+122,z:I.y0+76,yaw:2.4}}")
        if not VIEWS or 'abeksi' in VIEWS:shoot('abeksi',q,9.5,.3)
        if not VIEWS or 'abhouse' in VIEWS:
            q=pg.evaluate(ABHOUSE)
            if not q:print('FAIL abhouse: no house spot found')
            else:shoot('abhouse',q,9.5,.3)
    print('DONE')
play.run(s,w=1000,hh=620)
