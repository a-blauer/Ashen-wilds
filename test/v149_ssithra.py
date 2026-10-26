# v149 Ssith'ra body: the body must never pass through itself or the head, must stay one connected chain, and must bend
# smoothly (no sharp folds), while turning around in place, circling the hero, during every move and in a free fight.
# Also takes studio pictures (dark backdrop, no fog) of the body: SHOT=0 skips them.   Run:  python3 v149_ssithra.py
#   PART=clip,moves,fight,shots   (default all)    TAG=name   (picture names: out/v149ss_<tag>_<view>.png)
import play,json,os,re
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
HERE=os.path.dirname(os.path.abspath(__file__))
SETUP=re.search(r'ev\("""(\(\)=>\{window\.VT=.*?return 1\})"""\)',open(HERE+'/v112_ssithra.py').read(),re.S).group(1)
SH=os.environ.get('SHOT','1')!='0';PARTS=os.environ.get('PART','clip,moves,fight,shots').split(',');TAG=os.environ.get('TAG','new')
OUT=play.TMP;BAD=[]
def chk(ok,msg):
    print(('  ok   ' if ok else '  FAIL ')+msg)
    if not ok:BAD.append(msg)
TOOLS=r"""()=>{
  // how deep the body passes into itself: non-neighbouring segments (2+ apart) and the head against the body.
  // Also the sharpest bend between neighbouring segments (radians) and the biggest chain gap.
  window.CLIP=()=>{const e=BE,S=e.sv;if(S.gone||!e.m.visible)return {pen:0,bend:0,gap:0,who:''};const N=SSR.N,P=[],v=new THREE.Vector3(),r=[];
    for(let k=0;k<N;k++){const J=S.R.J['s'+k];const p=svWP(e,'s'+k,0,0,0,new THREE.Vector3());P.push(J.visible&&p.y-GH(p.x,p.z)>-.3*SSR.sc[k]?p:null);r.push(.66*SSR.sc[k])}
    let pen=0,who='';for(let i=0;i<N;i++)for(let j=i+2;j<N;j++){if(!P[i]||!P[j])continue;const d=P[i].distanceTo(P[j]),o=r[i]+r[j]-d;if(o>pen){pen=o;who='s'+i+'/s'+j}}
    const H=[[0,.25,.15,.82],[0,-.05,1.0,.5]].map(q=>[svWP(e,'head',q[0],q[1],q[2],new THREE.Vector3()),q[3]]);
    for(let j=1;j<N;j++){if(!P[j])continue;for(const [c,rr] of H){const o=rr+r[j]-c.distanceTo(P[j]);if(o>pen){pen=o;who='head/s'+j}}}
    let bend=0;const nk=svWP(e,'head',0,-.02,-.62,new THREE.Vector3()),hb=svWP(e,'head',0,-.02,-1.62,new THREE.Vector3()).sub(nk).setY(0).normalize();let pd=hb;
    let a=nk;for(let k=0;k<N;k++){if(!P[k])break;const d=P[k].clone().sub(a).setY(0);if(d.lengthSq()<1e-6){a=P[k];continue}d.normalize();if(k>0){bend=Math.max(bend,Math.acos(Math.max(-1,Math.min(1,d.dot(pd)))))}pd=d;a=P[k]}
    return {pen:+pen.toFixed(3),bend:+bend.toFixed(3),gap:GAP(),who}};
  window.STUDIO=(on)=>{if(on){window.__bg=scene.background;window.__fog=scene.fog;scene.background=new THREE.Color(0x24282e);window.__fn=scene.fog&&[scene.fog.near,scene.fog.far,scene.fog.density];if(scene.fog){scene.fog.near=500;scene.fog.far=900;if(scene.fog.density!=null)scene.fog.density=0}window.__hid=[];
      window.__li=[];scene.traverse(o=>{if(o.isLight){__li.push([o,o.intensity]);o.intensity*=.5}});window.__exp=ren.toneMappingExposure;ren.toneMappingExposure=(__exp||1)*.8;
      scene.children.forEach(o=>{if(o===BE.m||o.isLight)return;if(o.visible){o.visible=false;__hid.push(o)}});
      const g=new THREE.Mesh(new THREE.CircleGeometry(40,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x3a332c,roughness:1}));g.position.set(BE.m.position.x,GH(BE.m.position.x,BE.m.position.z)-.02,BE.m.position.z);scene.add(g);window.__flr=g}
    else{(window.__li||[]).forEach(([o,i])=>o.intensity=i);ren.toneMappingExposure=__exp;scene.background=__bg;if(scene.fog&&__fn){scene.fog.near=__fn[0];scene.fog.far=__fn[1];if(__fn[2]!=null)scene.fog.density=__fn[2]}(__hid||[]).forEach(o=>o.visible=true);if(window.__flr){scene.remove(__flr);__flr=null}}};
  window.TOPCAM=(e,h,f)=>{const p=e.m.position,a=e.m.rotation.y,c=[p.x-Math.sin(a)*(f||5),p.z-Math.cos(a)*(f||5)];cam.position.set(c[0]+.01,GH(p.x,p.z)+h,c[1]);cam.lookAt(c[0],GH(p.x,p.z),c[1]);POST.render()};
  return 1}"""
def s(pg):
    pg.set_default_timeout(1500000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:400]))
    pg.on('console',lambda m:errs.append('console:'+m.text[:300]) if m.type=='error' else None)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[3].ins[3])}");pg.wait_for_timeout(1500)
    ev(SETUP);ev(TOOLS)
    info=ev("()=>{const S=BE.sv;let n=0,tri=0;S.R.root.traverse(o=>{if(o.isMesh){n++;tri+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3}});return {meshes:n,tris:Math.round(tri),body:!!S.R.v149}}")
    print('model',json.dumps(info))
    # ---------------- turning around, circling, standing behind it ----------------
    if 'clip' in PARTS:
        def run(name,js,sec):
            r=ev("""([js,sec])=>{const e=BE,S=e.sv;const f=new Function('e','S','t',js);let t=0,w={pen:0,bend:0,gap:0,who:'',n:0,fr:0};
              while(t<sec){f(e,S,t);STEP(.05);t+=.05;const c=CLIP();w.fr++;if(c.pen>.12)w.n++;if(c.pen>w.pen){w.pen=c.pen;w.who=c.who+'@'+t.toFixed(2)}w.bend=Math.max(w.bend,c.bend);w.gap=Math.max(w.gap,c.gap)}
              return w}""",[js,sec])
            print('clip',name,json.dumps(r));return r
        # 1. the hero walks around behind it: it turns all the way round
        r=run('turn-around',"if(t===0){PLACE(5,Math.PI)}",4)
        chk(r['pen']<.25,'turn around: body never passes through itself (deepest %.2f %s)'%(r['pen'],r['who']))
        chk(r['bend']<.75,'turn around: no sharp fold (sharpest bend %.2f rad)'%r['bend'])
        # 2. a forced 180° spin in place in one second (the worst case: a move's turn window)
        r=run('spin',"if(t===0){PLACE(14,0)}if(t<1)e.m.rotation.y+=Math.PI*.05",2.5)
        chk(r['pen']<.25,'fast spin: body never passes through itself (deepest %.2f %s)'%(r['pen'],r['who']))
        chk(r['bend']<.75,'fast spin: no sharp fold (%.2f rad)'%r['bend'])
        # 3. the hero circles it closely for 12 s (it keeps turning to face)
        r=run('circle',"if(t===0){PLACE(5,0);window.CA=0}CA+=.05*1.1;const A=XA,p=e.m.position;toPos(p.x+Math.cos(CA)*5,p.z+Math.sin(CA)*5)",12)
        chk(r['pen']<.25,'circling: body never passes through itself (deepest %.2f %s)'%(r['pen'],r['who']))
        chk(r['gap']<.05,'circling: body stays connected (%.3f)'%r['gap'])
    if 'moves' in PARTS:
        worst={'pen':0,'who':'','bend':0,'gap':0}
        for mv,d,side,ph in [['snap',4,0,1],['snap2',4,0,2],['slam',7,0,1],['spray',5,0,1],['charge',12,0,1],['glare',11,0,1],['sinkhole',8,0,1],['quills',6,1.57,1],['quills',6,3.14,2],
                             ['spit',9,.8,2],['intro',8,0,1],['awaken',8,0,2],['stagger',6,0,1],['burrow',10,0,1],['geysers',10,0,2],['scars',8,0,2]]:
            r=ev("""([k,d,side,ph])=>{const e=BE,S=e.sv;PLACE(d,side);S.ph=ph;e.bs.ph=ph;if(k==='awaken'){S.ph=1;e.bs.ph=1}if(!S.B.M[k])return {skip:1};svStart(e,k,7);let t=0,w={pen:0,who:'',bend:0,gap:0};
              const D=S.mv.D;while(t<D.dur+2.5&&(S.mv||t<D.dur)){STEP(.05);t+=.05;const c=CLIP();if(c.pen>w.pen){w.pen=c.pen;w.who=c.who+'@'+(S.mv?S.mv.id:'-')+' '+t.toFixed(2)}w.bend=Math.max(w.bend,c.bend);w.gap=Math.max(w.gap,c.gap)}
              svEndMove(e,true);S.mv=null;w.err=window.LERR||0;return w}""",[mv,d,side,ph])
            print('move',mv,ph,json.dumps(r))
            if r.get('skip'):continue
            chk(r['pen']<.25,'%s: body never passes through itself (deepest %.2f %s)'%(mv,r['pen'],r['who']))
            chk(r['gap']<.05,'%s: body stays connected (%.3f)'%(mv,r['gap']))
            chk(not r['err'],'%s: no errors'%mv)
    if 'fight' in PARTS:
        r=ev("""(SEC)=>{svPick=PICK0;const e=BE,S=e.sv,A=XA;PLACE(9,0);S.ph=1;e.c.h=M(e.c);let t=0,w={pen:0,who:'',bend:0,gap:0,n:0,fr:0};
          while(t<SEC){const k=t*.35,rad=t%12<4?4:t%12<8?9:14;let x=A.cx+Math.cos(k)*rad,z=A.cz+Math.sin(k)*rad;pl.position.x+=(x-pl.position.x)*.08;pl.position.z+=(z-pl.position.z)*.08;
            STEP(.1);t+=.1;if(t>SEC/2&&S.ph===1)e.c.h=M(e.c)*.5;const c=CLIP();w.fr++;if(c.pen>.12)w.n++;if(c.pen>w.pen){w.pen=c.pen;w.who=c.who+'@'+(S.mv?S.mv.id:'-')}w.bend=Math.max(w.bend,c.bend);w.gap=Math.max(w.gap,c.gap)}
          svPick=()=>null;svEndMove(e,true);S.mv=null;w.err=window.LERR||0;return w}""",float(os.environ.get('SEC','40')))
        print('fight',json.dumps(r))
        chk(r['pen']<.25,'free fight: body never passes through itself (deepest %.2f %s)'%(r['pen'],r['who']))
        chk(r['gap']<.05,'free fight: body stays connected (%.3f)'%r['gap'])
    if SH and 'shots' in PARTS:
        ev("()=>{PLACE(14,0);STEP(1.5);STUDIO(1);return 1}")
        def shot(name,side=.9,dist=15,h=5,ly=None,top=None):
            if top:ev("([h,f])=>TOPCAM(BE,h,f)",top)
            else:ev("([s,d,h,ly])=>SHOTCAM(BE,s,d,h,ly)",[side,dist,h,ly])
            fn=f'{OUT}/v149ss_{TAG}_{name}.png';pg.locator('#gl canvas').screenshot(path=fn,timeout=300000,animations='disabled');print('shot',fn)
        def cast(k,d,side,ph,t,seed=7):
            ev("([k,d,side,ph,t,seed])=>{const e=BE,S=e.sv;PLACE(d,side);S.ph=ph;e.bs.ph=ph;svStart(e,k,seed);STEP(t);return 1}",[k,d,side,ph,t,seed])
        shot('idle_34',.9,14,5,1.2);shot('idle_side',1.57,15,3.5,1);shot('idle_top',top=[22,5]);shot('joints',2.2,7,3,1)
        ev("()=>{PLACE(5,Math.PI);STEP(.9);return 1}");shot('turning_top',top=[22,3]);shot('turning_34',.6,12,6,1)
        ev("()=>{STEP(1.2);return 1}");shot('turned_top',top=[22,3])
        ev("()=>{PLACE(5,0);window.CA=0;for(let i=0;i<120;i++){CA+=.055;const p=BE.m.position;toPos(p.x+Math.cos(CA)*5,p.z+Math.sin(CA)*5);STEP(.05)}return 1}");shot('circle_top',top=[24,2]);shot('circle_34',1.0,13,7,1);shot('bend_close',2.6,7.5,2.6,.9)
        cast('slam',7,0,1,.8);shot('slam_rear',1.57,16,5,3)
        cast('quills',6,1.57,1,1.25);shot('quills_arch',1.57,15,4,2)
        cast('glare',11,0,1,1.35);shot('glare_aim',1.2,15,5,3)
        cast('sinkhole',8,0,1,1.5);shot('sinkhole_churn',1.9,15,8,0)
        cast('burrow',10,0,1,.95);shot('burrow_dive',1.4,13,4,.5)
        ev("()=>{const e=BE,S=e.sv;svEndMove(e,true);S.mv=null;ssrGone(e,false);STEP(1.2);return 1}");shot('emerge',1.3,14,5,1.5)
        ev("()=>{PLACE(14,0);BE.sv.ph=2;STEP(1.5);return 1}");shot('phase2_34',.9,12,4.5,1.2)
        ev("()=>{STUDIO(0);return 1}")
    print('errs',errs[:10],ev("()=>window.LERR||0"))
    chk(not errs and not ev("()=>window.LERR||0"),'no console errors')
    print('RESULT',('PASS' if not BAD else 'FAIL %d'%len(BAD)),BAD)
play.run(s,w=800,hh=512)
