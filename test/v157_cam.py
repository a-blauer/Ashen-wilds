# v157 camera: the camera keeps the player's tilt and distance next to walls (caves, instance edges, Abeksi houses); walls are cut away.
#   python3 fast.py v157_cam.py      SRC=<old build> to compare; VIEWS=cave,edge,maw,abeksi; NOSHOT=1 skips pictures
# For each view: puts the hero near a steep terrain wall with the camera on the wall's side, lets the camera settle, then turns the
# camera a full circle in 48 steps and records the camera's tilt above the hero (deg) and how far it moves per step.
# FAIL when the tilt ever goes 12 deg above the chosen one, or the camera jumps more than 1.6 units between steps (near walls).
import play,os,json
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
FIND=r"""(gk)=>{try{const I=INSL[gk];const P0=[];const step=.55;
  const wall=(x,z,yw,D)=>{const ox=Math.sin(yw),oz=Math.cos(yw);let prev=GH(x,z);for(let s=.5;s<=D;s+=.5){const g=GH(x+ox*s,z+oz*s);if(g-prev>step)return s;prev=g}return 0};
  const ok=(x,z)=>{const d=MAP.DW[Math.round(z)*W+Math.round(x)];return d!=null&&d<-1.5};
  let best=null;const pts=(I.path||[]).concat(I.en?[I.en]:[]);const c0=I.wa||I.ba;if(c0)for(let a=0;a<40;a++)for(let r=4;r<=28;r+=4)pts.push([c0[0]+Math.sin(a*2.4)*r,c0[1]+Math.cos(a*2.4)*r]);
  for(let i=0;i<pts.length;i+=2){const p=pts[i];if(!p||!ok(p[0],p[1]))continue;
    for(let a=0;a<32;a++){const yw=a/32*Math.PI*2,w=wall(p[0],p[1],yw,9);if(w>2.5&&w<6){const sc=Math.abs(w-4);if(!best||sc<best.sc)best={x:p[0],z:p[1],yw,w,sc}}}}
  return best}catch(e){return {err:String(e.stack).slice(0,300)}}}"""
SWEEP=r"""async(q)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));if(window.__lf==null){window.__lf=0;const f=loop;loop=function(n){window.__lf++;return f.apply(this,arguments)}}
  const fr=async(n)=>{const f0=window.__lf,t0=performance.now();while(window.__lf<f0+n&&performance.now()-t0<20000)await sl(15)};   // wait for game frames, not ms: the same on a slow machine (GitHub) as here
  toPos(q.x,q.z,q.yw+Math.PI);camYaw=q.yw;camPitch=.3;camDist=9.5;try{snapCam()}catch(_){}
  await fr(90);const tilt=()=>{const c=cam.position,P=pl.position,h=Math.hypot(c.x-P.x,c.z-P.z);return Math.atan2(c.y-(P.y+1.1),h)*180/Math.PI};
  const out={start:+tilt().toFixed(1),max:-99,min:99,jump:0,steps:48};let prev=cam.position.clone().sub(pl.position);const h0=pl.position.clone();out.hero=0;
  for(let i=1;i<=48;i++){camYaw=q.yw+i/48*Math.PI*2;await fr(8);const t=tilt();out.max=Math.max(out.max,t);out.min=Math.min(out.min,t);
    out.hero=Math.max(out.hero,+pl.position.distanceTo(h0).toFixed(2));const rel=cam.position.clone().sub(pl.position),d=rel.distanceTo(prev);prev.copy(rel);
    // the camera is meant to turn round the hero: subtract the arc it should move per step
    const arc=2*Math.PI/48*Math.hypot(cam.position.x-pl.position.x,cam.position.z-pl.position.z);out.jump=Math.max(out.jump,d-arc)}
  camYaw=q.yw;await fr(90);out.end=+tilt().toFixed(1);out.max=+out.max.toFixed(1);out.min=+out.min.toFixed(1);out.jump=+out.jump.toFixed(2);return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint{display:none!important}')
    pg.evaluate("()=>{try{cheat&&0}catch(_){}window.__god=1;return 1}")
    fails=[]
    base=17.2   # the pitch .3 rad the test sets
    for name,gk in [('cave',1),('edge',0)]:
        if VIEWS and name not in VIEWS:continue
        pg.evaluate("(gk)=>{const I=INSL[gk];if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}return 1}",gk);pg.wait_for_timeout(3000)
        q=pg.evaluate(FIND,gk)
        if not q:print('FAIL',name,'no wall spot found');fails.append(name);continue
        if 'err' in q:print('FAIL',name,q['err']);fails.append(name);continue
        r=pg.evaluate(SWEEP,q);print('VIEW',name,json.dumps(q),json.dumps(r))
        if r['max']>base+12:fails.append(name);print('FAIL',name,'camera tilted up to',r['max'],'deg (set',base,')')
        if r['jump']>1.6:fails.append(name);print('FAIL',name,'camera jumped',r['jump'],'units in one step')
        if not os.environ.get('NOSHOT'):
            pg.evaluate("(q)=>{camYaw=q.yw;return 1}",q);pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v157_'+name+'.png',timeout=600000);print('shot',name)
    if not VIEWS or 'abeksi' in VIEWS:
        pg.evaluate("()=>{AB152Q.st=1;ab152Enter();AB152H.frz=1;return 1}");pg.wait_for_timeout(4000)
        for k,(u,v,y) in {'abeksi':[122,76,2.4],'abeksi2':[66,48,2.4]}.items():
            q=pg.evaluate("(a)=>{const I=INSL[30];return {x:I.x0+a[0],z:I.y0+a[1],yw:a[2]}}",[u,v,y])
            pg.evaluate("()=>{AB152H.frz=1;window.__k157=setInterval(()=>{AB152H.frz=1},100);return 1}")
            r=pg.evaluate(SWEEP,q);print('VIEW',k,json.dumps(r))
            if r['max']>base+12:fails.append(k);print('FAIL',k,'camera tilted up to',r['max'],'deg')
            if r['jump']>1.6 and r['hero']<.3:fails.append(k);print('FAIL',k,'camera jumped',r['jump'])
            if not os.environ.get('NOSHOT'):
                pg.evaluate("(q)=>{camYaw=q.yw;return 1}",q);pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v157_'+k+'.png',timeout=600000);print('shot',k)
    print('DONE' if not fails else 'FAILED '+','.join(fails))
play.run(s,w=1100,hh=680)
