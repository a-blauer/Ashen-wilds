# v164 pictures: the reworked Hilltop Ascent. VIEWS=name,... (default all) -> <AW_TMP>/v164_<view>.png
#   close (Skarrith's head, close up) · side (the whole serpent from the side) · chase (riding, from the chase camera, it close behind)
#   venom (a volley coming down: globs, landing rings) · pools (puddles on the trail) · gap (a broken stretch ahead) · jump (mid-leap
#   over one) · chomp (caught) · fall (in a gap, it dives after you) · intro (the emergence)
import play,os,json
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
# [s, mode, camera yaw offset from the trail's heading (None: the chase camera), pitch, distance, extra]
V={'close':[120,'close'],'side':[200,'side'],'chase':[250,'chase'],'chase2':[160,'chase'],'close2':[120,'close'],'venom':[300,'venom'],'pools':[330,'pools'],'gap':[0,'gap'],'jump':[0,'jump'],'chomp':[180,'chomp'],'fall':[0,'fall'],'intro':[6,'intro'],'top':[260,'top'],'gapTop':[0,'gapTop']}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('NOHUD'):pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ch153h,#ch153g,#hint{display:none!important}')
    pg.evaluate("()=>{newMount(MNTK[0]);return 1}")
    # a free camera for the pictures (window.__cam = [position, look-at] in world space), applied before every frame
    pg.evaluate("()=>{const r0=POST.render.bind(POST);POST.render=function(){try{const q=window.__cam;if(q){cam.position.set(q[0][0],q[0][1],q[0][2]);cam.lookAt(q[1][0],q[1][1],q[1][2]);cam.updateMatrixWorld()}}catch(_){}return r0.apply(this,arguments)};return 1}")
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        pg.evaluate('()=>{window.__gap=%s;window.__cx=%s;return 1}'%({'chase2':4.5}.get(k,9),{'close2':-4.5}.get(k,2.2)))
        info=pg.evaluate("""async(q)=>{if(!ch153In()){ch153Enter();await new Promise(r=>setTimeout(r,1300))}let T=performance.now();const tick=(n,f)=>{for(let i=0;i<n;i++){T+=33;if(f)f();homeTick(1/30,T)}};
          const P=CH153.S.P,KC=ch153Course();let [s,mode]=q;const r=CH153.R;window.__cam=null;ch164ClearFx(CH153.S);
          const V3=(a,b,c)=>[a,b,c],at=(s,o,y)=>{const [x,z,h]=P.at(s,o);return [x,h+(y||0),z]};
          const behind=(s,o,d,up,lookS,lookY)=>{const yw=P.yaw(s);const p=at(s,o,0);return [[p[0]-Math.sin(yw)*d,p[1]+up,p[2]-Math.cos(yw)*d],at(lookS,0,lookY)]};
          if(mode=='intro'){ch153Reset(true);CH153.R.t=1.9;tick(3);const R=CH153.R,yw=P.yaw(R.s),C=CH153CAM,a=yw-C.yaw*P.sgn,p=pl.position;
            window.__cam=[[p.x+Math.sin(a)*Math.cos(C.pitch)*C.dist,p.y+1.1+Math.sin(C.pitch)*C.dist,p.z+Math.cos(a)*Math.cos(C.pitch)*C.dist],[p.x,p.y+3,p.z]];return 'intro'}
          const g=KC.gaps[mode=='gap'?4:mode=='fall'?5:6];if(mode=='gap'||mode=='jump'||mode=='fall')s=g.s-g.len/2-(mode=='gap'?9:mode=='jump'?1.4:4.5);
          r.ph='run';r.t=9;r.s=s;r.o=0;r.y=0;r.jt=-1;r.v=CH153V.spd;r.slow=0;r.sn.s=s-(mode=='chase'?7:mode=='close'||mode=='side'?9:12);r.sn.v=8;r.sn.spit=99;r.sn.spitAt=null;r.sn.rear=0;r.bst=0;
          if(mode=='jump'){tick(1,()=>{CH153.jumpQ=.1});tick(9)}else if(mode=='fall'){tick(30);r.sn.s=Math.min(r.sn.s,g.s-g.len/2-14)}else tick(12);
          const R=CH153.R,M=CH153.S.sn;const hp=M.head.getWorldPosition(new THREE.Vector3());
          if(mode=='close'){R.sn.rear=.7;tick(2);M.head.updateMatrixWorld(true);const e=M.head.localToWorld(new THREE.Vector3(window.__cx||2.2,1.1,5.6)),l=M.head.localToWorld(new THREE.Vector3(0,-.1,.6));window.__cam=[e.toArray(),l.toArray()]}
          else if(mode=='side'){const c=at(R.sn.s-14,0,0),e=at(R.sn.s-12,24,10);window.__cam=[e,[c[0],c[1]+1,c[2]]]}
          else if(mode=='gapTop'){const g=KC.gaps[4],c=at(g.s,0,0),e=at(g.s-7,1.5,9);window.__cam=[e,c];window.__dbg=CH153.S.root.children.filter(o=>o.isGroup&&o.children.length==2).map(o=>[o.visible,o.children.map(m=>[m.visible,m.geometry.attributes.position.count,m.material.type])]).slice(0,2)}
          else if(mode=='top'){const c=at(R.sn.s-6,0,0);window.__cam=[[c[0]+2,c[1]+22,c[2]+2],[c[0],c[1],c[2]]]}
          else if(mode=='venom'){ch153SpitSpawn(ch153SpitPlan(3,R.s,R.o,R.v),3);tick(16)}
          else if(mode=='pools'){[[R.s+9,-1.2],[R.s+10,1.3],[R.s+15,0],[R.s+22,-.8]].forEach(q=>{const [x,z,h]=P.at(q[0],q[1]),pm=ch164Pool();pm.position.set(x,h+.06,z);CH153.S.root.add(pm);CH153.S.pools.push({m:pm,s:q[0],o:q[1],t:7,hit:1,g:0})});tick(10)}
          else if(mode=='chomp'){R.sn.s=R.s-2;tick(1);tick(13)}
          else if(mode=='fall'){tick(24)}
          if(mode=='chase'){r.sn.s=r.s-(window.__gap||7);tick(3);const gp=r.s-r.sn.s,n0=Math.max(0,Math.min(1,(CH153CAM.near-gp)/8)),ns=n0*n0*(3-2*n0),dh=Math.max(3.8,Math.min(8.8,gp-5.6)),
            a=P.yaw(r.s)+Math.PI-CH153CAM.side*P.sgn*ns,pit=.34+.34*ns,dd=(dh/Math.cos(.34))*(1-ns)+Math.max(7,gp+4.5)*ns,p=pl.position;
            window.__cam=[[p.x+Math.sin(a)*Math.cos(pit)*dd,p.y+1.1+Math.sin(pit)*dd,p.z+Math.cos(a)*Math.cos(pit)*dd],[p.x,p.y+1,p.z]];ch153Hud();return [mode,R.ph,null,+gp.toFixed(1)]}
          if(!window.__cam){const yw=P.yaw(R.s);const fall=mode=='fall',dead=R.ph=='dead';const a=fall?yw+Math.PI:dead?yw+.9:yw+Math.PI,gp=R.s-R.sn.s,near=Math.max(0,Math.min(1,(10-gp)/6)),pit=fall?1.0:dead?.45:mode=='gap'||mode=='jump'?.42:Math.min(.95,.34+.75*near),dd=fall?12:dead?8:mode=='gap'||mode=='jump'?8:Math.max(3.8,Math.min(8.8,gp-5.6))/Math.cos(.34);const p=pl.position;
            window.__cam=[[p.x+Math.sin(a)*Math.cos(pit)*dd,p.y+1.1+Math.sin(pit)*dd,p.z+Math.cos(a)*Math.cos(pit)*dd],[p.x,p.y+1,p.z]]}
          for(let i=0;i<40;i++)atmos(.05,performance.now());ch153Hud();return [window.__dbg||0,mode,R.ph,R.dead&&R.dead.why,+(R.s-R.sn.s).toFixed(1),+R.y.toFixed(1),CH153.S.globs.length,CH153.S.pools.length]}""",q)
        pg.wait_for_timeout(2500);pg.screenshot(path=play.TMP+'/v164_'+k+'.png',timeout=600000);print('shot',k,json.dumps(info))
    print('ERRS',pg.evaluate("()=>[CH153.err,CH157.err,CH164.err]"))
play.run(s,w=1280,hh=760)
