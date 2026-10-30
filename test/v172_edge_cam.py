# v172 the camera stays inside the map at its outer edge (3360); v176: Abeksi's buildings count as the edge too: backing the camera out past an instance's edge (or Duskhold's island
# edge) slides it in toward the hero; in the middle of a field and inside a cave it keeps the distance the player set.
#   python3 fast.py v172_edge_cam.py      (pictures: <AW_TMP>/v172_<name>.png)
# FAIL when: at an edge the camera ends up out of the map (cam172Ok false: past the rectangle, over or next to the void, inside the
# rim's rock); it was not pulled in there; in a field's middle or in a cave it was pulled in; the camera jumps (a frame-to-frame step
# much larger than the hero's own movement) while it slides in.
import play,os,json
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v169_ghost_look.py')).read().split('def s(pg):')[0].split('import play,os,json')[1])
F=[]
def fail(*a):F.append(' '.join(str(x) for x in a));print('FAIL',*a)
MID=r"""(gk)=>{const I=INSL[gk];if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}
  let best=null;const c=[I.x0+I.w/2,I.y0+I.h/2];for(let r=0;r<60&&!best;r+=2)for(let a=0;a<16&&!best;a++){const x=Math.round(c[0]+Math.sin(a/16*6.283)*r),z=Math.round(c[1]+Math.cos(a/16*6.283)*r);
    if(solid(x,z))continue;let ok=true;for(let d=-16;d<=16&&ok;d+=2)for(let e=-16;e<=16&&ok;e+=2){const h=GH(x+d,z+e);if(h<-6||h>GH(x,z)+1.5)ok=false}if(ok)best={x,z,yaw:0}}
  return best}"""
DUSK=r"""()=>{const T=TOWNS[0];toPos(T.cx,T.cy+40);let best=null;for(let z=T.cy-60;z<T.cy+120;z+=1)for(let x=T.cx-80;x<T.cx+80;x+=1){if(solid(x,z))continue;
    for(let a=0;a<8;a++){const yw=a/8*6.283;let v=0;for(let s=1;s<=7;s++)if(GH(x+Math.sin(yw)*s,z+Math.cos(yw)*s)<-6){v=s;break}if(v&&v<6&&(!best||v<best.d))best={x,z,yaw:yw,d:v}}}
  return best}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    def place(q,dist,pitch):
        pg.evaluate("(a)=>{const q=a[0];toPos(q.x,q.z,q.yaw);camYaw=q.yaw;camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}",[q,dist,pitch])
    def watch(n=90):   # frames; the camera's largest frame-to-frame step and where it ends
        return pg.evaluate("""async(n)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));if(window.__lf==null){window.__lf=0;const f=loop;loop=function(){window.__lf++;return f.apply(this,arguments)}}
          let f0=window.__lf,last=cam.position.clone(),mx=0,t0=performance.now();while(window.__lf<f0+n&&performance.now()-t0<40000){await sl(15);const d=cam.position.distanceTo(last);if(window.__lf>f0+3)mx=Math.max(mx,d);last.copy(cam.position)}
          const c=cam.position,P=pl.position;let I=null;const k=cvKey();if(k>=0)I=INSL[k];
          return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)),dist:+c.distanceTo(new THREE.Vector3(P.x,P.y+1.1,P.z)).toFixed(2),ok:cam172Ok(c.x,c.y,c.z,I),step:+mx.toFixed(2),dd:+camDD.toFixed(2)}}""",n)
    def shot(n):pg.screenshot(path=play.TMP+'/v172_'+n+'.png',timeout=600000)
    # 1. edges: the camera backed out past the edge slides in and stays in the map
    for gk in [0,2,7,12,17,25,30]:
        q=pg.evaluate(EDGE,gk);pg.wait_for_timeout(2500)
        if not q:fail('edge',gk,': no edge spot');continue
        for dist,pt in [(12,.3),(15,.6)]:
            place(q,dist,pt);r=watch(90)
            if not r['ok']:r=watch(30)   # a late arrival snap (insArrive) can still be settling on a fast machine
            print('edge',gk,dist,pt,json.dumps(q),json.dumps(r))
            # a hero standing right at the edge: the camera comes in to its closest (CAM172.min) and may not get further away
            if not r['ok'] and r['dist']>2.15:fail('edge',gk,'dist',dist,': the camera is out of the map',r['cam'])
            if r['dist']>dist-.5:fail('edge',gk,'dist',dist,': the camera was not pulled in (distance',r['dist'],')')
            if dist==12:shot('edge_%d'%gk)
        # sliding in from a camera already in the map: smooth, no jump
        place(dict(q,yaw=q['yaw']+3.14159),12,.3);watch(30);pg.evaluate("(y)=>{camYaw=y;return 1}",q['yaw']);r=watch(90)
        print('edge',gk,'turn',json.dumps(r))
        if not r['ok'] and r['dist']>2.15:fail('edge',gk,'turning toward the edge: the camera is out of the map',r['cam'])
        if r['step']>2.5:fail('edge',gk,'turning toward the edge: the camera jumped',r['step'])
    # 1b. Abeksi (v176): a house between the camera and the hero pulls the camera in front of it
    pg.evaluate("()=>{toPos(142.01,1559.24);return 1}");pg.wait_for_timeout(4000)
    for yaw in [3.53,2.75,3.93]:
        q={'x':142.01,'z':1559.24,'yaw':yaw};place(q,9.5,.35);r=watch(90)
        if r['dist']>9:r=watch(30)
        ab=pg.evaluate("()=>{const c=cam.position,I=INSL[cvKey()];return cam172Ab(c.x,c.y,c.z,I)}")
        print('abeksi',yaw,json.dumps(r),'in a building',ab);shot('abeksi_%.2f'%yaw)
        if ab and r['dist']>1.35:fail('Abeksi yaw',yaw,': the camera is inside a building',r['cam'])   # right at a wall it may stop at its closest (minAb 1.2; the house is then dithered)
        if r['dist']>9:fail('Abeksi yaw',yaw,': the camera was not pulled in in front of the house (distance',r['dist'],')')
    # 2. Duskhold's island edge
    q=pg.evaluate(DUSK);pg.wait_for_timeout(2500)
    if not q:fail('Duskhold: no edge spot')
    else:
        place(q,12,.3);r=watch(90);print('duskhold',json.dumps(q),json.dumps(r));shot('dusk')
        if not r['ok'] and r['dist']>2.15:fail('Duskhold: the camera is past the island edge',r['cam'])
    # 3. the middle of a field and a cave: the distance stays
    q=pg.evaluate(MID,0);pg.wait_for_timeout(2500)
    if not q:fail('field: no open spot')
    else:
        place(q,12,.3);r=watch(60);print('field',json.dumps(q),json.dumps(r))
        if r['dist']<11.3:fail('field: the camera was pulled in (distance',r['dist'],')')
    q=pg.evaluate(CAVE,1);pg.wait_for_timeout(2500)
    if not q:fail('cave: no wall spot')
    else:
        place(q,9.5,.3);r=watch(60);print('cave',json.dumps(q),json.dumps(r));shot('cave')
        if r['dist']<8.8:fail('cave: the camera was pulled in (distance',r['dist'],')')
    print('DONE' if not F else 'FAILED '+str(len(F)))
play.run(s,w=1000,hh=620)
