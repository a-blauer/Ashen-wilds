# v157 pictures: Abeksi city life (3191). Free camera views over the city (a test-only camera override, the game's camera code is
# not touched). VIEWS=name,... (default all); output <AW_TMP>/v157_<view>.png. MAP=1 also saves a plan map (v157_map.png, needs PIL).
#   python3 v157_look.py
import play,os,json
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
# name: [camera u, v, height, look-at u, v, (hero u, v)]  (plan coordinates; the hero stands at the look-at spot unless given)
V={
 'shrine':[49,25,6,57.5,11],'training':[42,27,5,52,20],'sculpt':[27,61,5,13,53],'jewel':[110,47,5,126,46],'fountain':[69,55,4,77,48],
 'alch':[113,91,4.5,131,88],'roof':[46,97,13,46,82],'roofE':[94,103,13,74,95],'butchery':[29,141,5,15,134],'pen4':[121,150,7,133,130],
 'hallE':[119,177,5,132,165],'hallW':[29,170,5,15,162],'caravan':[30,187,4,14,190],'upMarket':[80,76,22,80,50],'upKitchen':[100,190,20,120,166],
 'upDwell':[100,118,22,110,94],'upBreach':[40,40,20,48,16],'upWarrens':[60,156,20,60,134],'torch':[32.5,84,2.4,29.5,80],'torch2':[60,92,2.6,57.5,95],
}
JS_SETUP=r"""()=>{if(!window.__v157){window.__v157=1;const f=POST.render;POST.render=function(){if(window.CAMQ){const q=window.CAMQ,I=INSL[30];cam.position.set(I.x0+q[0],q[2]+1.6,I.y0+q[1]);cam.lookAt(I.x0+q[3],1.6,I.y0+q[4]);cam.updateMatrixWorld()}return f.apply(this,arguments)}}return 1}"""
JS_VIEW=r"""(q)=>{const I=INSL[30];if(!ab152In())ab152Restart(false);const hu=q[5]!=null?q[5]:q[3],hv=q[6]!=null?q[6]:q[4];toPos(I.x0+hu,I.y0+hv,0);AB152H.frz=1;pl.visible=false;
  window.CAMQ=q;for(let i=0;i<10;i++)homeTick(1/30,performance.now()+i*33);for(let i=0;i<40;i++)atmos(.05,performance.now());
  AB152.S.acts.forEach(b=>{if(b.cone)b.cone.visible=false});try{FC.t=-1e9}catch(_){}return 1}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr{display:none!important}')
    pg.evaluate("()=>{AB152Q.st=1;ab152Enter();return 1}");pg.wait_for_timeout(1500);pg.evaluate(JS_SETUP)
    pg.wait_for_timeout(3000);pg.screenshot(path=play.TMP+'/v157__warm.png',timeout=600000)
    if os.environ.get('PERF'):
        r=pg.evaluate("""()=>{const S=AB152.S;let tris=0,meshes=0,inst=0;S.root.traverse(o=>{if(o.isMesh&&o.geometry){meshes++;if(o.isInstancedMesh)inst++;const g=o.geometry;tris+=Math.round((g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1))}});
          let t0=performance.now();for(let i=0;i<60;i++)homeTick(1/30,t0+i*33);const tick=(performance.now()-t0)/60;
          return {tris,meshes,inst,acts:S.acts.length,life:(window.AB157&&AB157.S)?AB157.S.n:0,tickMs:+tick.toFixed(2),calls:ren.info.render.calls,rtris:ren.info.render.triangles}}""")
        print('PERF',json.dumps(r))
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        pg.evaluate(JS_VIEW,q);pg.wait_for_timeout(3000)
        if os.environ.get('PERF'):print('view',k,pg.evaluate("()=>({calls:ren.info.render.calls,tris:ren.info.render.triangles})"))
        pg.screenshot(path=play.TMP+'/v157_'+k+'.png',timeout=600000);print('shot',k)
play.run(s,w=1280,hh=760)
