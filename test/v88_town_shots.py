# v88 town: close-ups of Duskhold (textures, signs, kingdom upgrades). Also saves the texture atlas.
#   SRC=build.html AW_TMP=/outdir [ONLY=tp,magic,...] [LV=0..3 all upgrades | LVS=walls:2,den:1] [BUILT=1] python3 v88_town_shots.py
import play,os,base64,json
# play.run with a longer page-load timeout (the shared test machine can be slow)
def run2(steps,w=820,hh=520):
    import types;src=open(play.__file__).read().replace('timeout=120000','timeout=600000');m=types.ModuleType('play2');m.__dict__['__file__']=play.__file__;exec(compile(src.split("if __name__=='__main__':")[0],play.__file__,'exec'),m.__dict__);return m.run(steps,w=w,hh=hh)
ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
LV=os.environ.get('LV');LVS=os.environ.get('LVS','');TAG=os.environ.get('TAG','')
FC=[['tpsign','fc',[0,2.4,-9.2],[0,2.6,-13.6]],['zsign','fc',[17.1,1.7,8.4],[17.1,1.5,5.4]],['zsignb','fc',[17.1,1.7,2.6],[17.1,1.5,5.4]],
  ['tavsign','fc',[-14.25,3.2,-9.6],[-14.25,3.2,-13.3]],['magsign','fc',[15,2.5,-10],[15,2.5,-13.6]],['stabsign','fc',[-7,2.4,-3.5],[-7,2.4,-7]],
  ['gatesign','fc',[27,2.6,0],[21,2.6,0]],['tpbuild','fc',[5,4,-5],[0,2,-15]],['tavbuild','fc',[-9,4,-6],[-14.2,2.2,-15.5]],['magbuild','fc',[19,4,-6],[14.2,2.5,-15.5]],
  ['stablebuild','fc',[-3,3,-3],[-7,1.2,-8]],['wallin','fc',[10,3,-12],[14,2,-21]],['wallout','fc',[30,5,14],[21,2,6]],['cornerT','fc',[14,5,14],[21,3,21]],['gateout','fc',[30,3.5,4],[21,2,0]],['top','fc',[0,48,22],[0,0,2]],
  ['up_train','fc',[7.2,4,-0.4],[7.2,.8,-6.9]],['up_tower','fc',[9.5,5.5,-8],[6.6,4,-17.4]],['up_treas','fc',[-5,3.5,-11],[-6.4,1.6,-17.4]],
  ['up_den','fc',[-12,4,21],[-13.6,.8,14.6]],['up_hatch','fc',[11,4,11],[13.2,1,16.9]],['plaza','fc',[0,7,16],[0,1,-4]]]
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(3000)
    if os.environ.get('BUILT','1')=='1':ev("()=>{SHOPS.forEach(o=>SH.shop[o.k]=1);visTick&&visTick()}")
    if LV is not None:ev("(l)=>{SHU.forEach(u=>SH.lv[u.k]=l)}",int(LV))
    for kv in [q for q in LVS.split(',') if q]:
        k,v=kv.split(':');ev("([k,v])=>{SH.lv[k]=v}",[k,int(v)])
    ev("()=>{shApply();visTick&&visTick()}")
    if os.environ.get('ATLAS','1')=='1':
        d=ev("()=>{try{return txaInit().cv.toDataURL('image/png')}catch(e){return ''}}")
        if d:open(play.TMP+'/v88_atlas.png','wb').write(base64.b64decode(d.split(',')[1]))
    spots=ev("""()=>{const T=TOWNS[0],c=T.cx,z=T.cy,st=T.st2||{c:[c,z]},v=T.vsp||[[c,z]],P=PORT[2];
      const pc=[P.x+(PCOURT[0]-P.x)*.35,P.z+(PCOURT[1]-P.z)*.35];
      return [['over',c,z+4,0,30,.75],['over2',c-2,z+14,0.5,26,.45],['tp',c,z-8.5,0,7,.28],['magic',c+14.25,z-8.5,0,7.5,.3],['tavern',c-14.25,z-8.5,0,7.5,.28],['fountain',c+1,z+5,.2,5.5,.32],
        ['stable',c-7,z-3.5,0,6,.3],['stations',st.c[0]+2,st.c[1]+3,-.6,6,.32],['banners',c+4,z+7,.6,8,.4],['stall',v[0][0]-3,v[0][1]+2,-1.0,6,.3],
        ['corner',c-24,z+24,2.35,9,.32],['lamp',c+9,z+2.5,-.5,4,.2],['portal',pc[0],pc[1],Math.atan2(pc[0]-P.x,pc[1]-P.z),6,.25],
['gate',c+26,z,-1.57,9,.25],['gatein',c+15,z,1.57,8,.3],['wallN',c+4,z-14,3.14,12,.35],
        ['court',PCOURT[0]-2,PCOURT[1]+10,0,16,.5],['sitesign',c+13,z+8,0,3.5,.1]]}""")
    ev("(t)=>{TOD=t}",float(os.environ.get('TOD','0.3')))
    # free camera: [name,'fc',[cx,cy,cz],[lx,ly,lz]] relative to the town centre (y relative to the town floor)
    ev("()=>{const r=ren.render.bind(ren);ren.render=function(s,c){if(window.FCAM&&c===cam){cam.position.set(...FCAM.p);cam.lookAt(...FCAM.l);cam.updateMatrixWorld()}return r(s,c)}}")
    ps=ev("()=>{const T=TOWNS[0],P=PORT[2],dx=PCOURT[0]-P.x,dz=PCOURT[1]-P.z,d=Math.hypot(dx,dz),y=GH(P.x,P.z)-T.ph;return [[P.x-T.cx+dx/d*4.5,y+3.4,P.z-T.cy+dz/d*4.5],[P.x-T.cx,y+3.6,P.z-T.cy]]}")
    cs=ev("()=>{const T=TOWNS[0],C=CYD,r=C.r,ga=Math.atan2(C.gate[1]-C.y,C.gate[0]-C.x),gw=3.4/r,a=ga+gw+1.6/r,x=C.x+Math.cos(a)*(r+1.2),z=C.y+Math.sin(a)*(r+1.2),ry=Math.atan2(Math.cos(ga),Math.sin(ga)),y=GH(x,z)-T.ph;return [[x-T.cx+Math.sin(ry)*3.2,y+1.8,z-T.cy+Math.cos(ry)*3.2],[x-T.cx,y+1.5,z-T.cy]]}")
    FC2=FC+[['portalsign','fc',ps[0],ps[1]],['cysign','fc',cs[0],cs[1]]]
    for sp in spots+FC2:
        name=sp[0]
        if ONLY and name not in ONLY:continue
        if sp[1]=='fc':
            ev("([p,l])=>{const T=TOWNS[0],dx=l[0]-p[0],dz=l[2]-p[2],d=Math.hypot(dx,dz)||1;toPos(T.cx+p[0]-dx/d*3,T.cy+p[2]-dz/d*3,0);window.FCAM={p:[T.cx+p[0],T.ph+p[1],T.cy+p[2]],l:[T.cx+l[0],T.ph+l[1],T.cy+l[2]]}}",[sp[2],sp[3]])
        else:
            x,z,yaw,dist,pitch=sp[1:6]
            ev("([x,z,yaw,dist,pitch])=>{window.FCAM=null;toPos(x,z,yaw);camDist=dist;camPitch=pitch;snapCam()}",[x,z,yaw,dist,pitch])
        pg.wait_for_timeout(4000)
        pg.screenshot(path=play.TMP+'/v88_'+TAG+name+'.png',timeout=120000,animations='disabled');print(name)
    if ONLY and 'campsign' in ONLY:
        # a zone camp's sign (posts beside the board): build the first camp of zone 0 and look at its sign
        r=ev("""()=>{try{window.FCAM=null;enterMap(0);const C=CAMPS.find(c=>regionAt(c.x,c.z)==0)||CAMPS[0];if(!C.g)buildCamp(C);toPos(C.x,C.z,0);
          let sg=null;C.g.traverse(o=>{if(o.userData&&o.userData.sign)sg=o});if(!sg)return 'nosign';sg.updateMatrixWorld(true);const p=new THREE.Vector3().setFromMatrixPosition(sg.matrixWorld),n=new THREE.Vector3(0,0,1).transformDirection(sg.matrixWorld);
          toPos(p.x+n.x*7,p.z+n.z*7,0);window.FCAM={p:[p.x+n.x*2.6,p.y+.2,p.z+n.z*2.6],l:[p.x,p.y-.1,p.z]};return 'ok'}catch(e){return String(e)}}""")
        pg.wait_for_timeout(5000);pg.screenshot(path=play.TMP+'/v88_'+TAG+'campsign.png',timeout=120000,animations='disabled');print('campsign',r)
run2(s,w=1000,hh=620)
