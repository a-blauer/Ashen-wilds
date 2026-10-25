# v148: the woodcutting hatchet and the mining pickaxe in the hero's hands through their gathering motions.
#   out/v148_tools.jpg: per motion (chop, mine) a row from the side and a row from the front at fixed moments of the swing.
#   Checks: the pick's head lies in the swing plane (its points face forward/back, not sideways) at every sampled moment,
#   the hatchet's edge faces the tree (forward) when it lands, and the tool moves (its head travels) through the swing.
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const V=THREE.Vector3,FW=220,FH=240,K=[0,.2,.34,.45,.52,.6,.72,.9];
  enterMap(0);await new Promise(r=>setTimeout(r,2500));
  const I=PMAP[0].ins[0],q=I.path[30];toPos(q[0],q[1]);pl.rotation.y=0;await new Promise(r=>setTimeout(r,600));
  const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);rd.setClearColor(0x30343a);
  const pc=new THREE.PerspectiveCamera(40,FW/FH,.05,60),LT=new THREE.PointLight(0xffffff,2.2,9);scene.add(LT);const AL=new THREE.AmbientLight(0xffffff,.9);scene.add(AL);
  const cnv=document.createElement('canvas');cnv.width=FW*K.length;cnv.height=FH*4;const x=cnv.getContext('2d');x.font='12px sans-serif';
  const out={err:null,rows:{}};
  try{[['tree','chop'],['rock','mine']].forEach(([kind,mo],mi)=>{
    gat={tg:{kind,x:Math.round(pl.position.x),y:Math.round(pl.position.z)+1,k:-1},t:0,need:99,sw:0};sk141Hide();sk141Show(sk141ToolOf(kind));
    const M=SK141_T[mo];haPlay(M.ms,M.t,2,null,0);const A=HA.cur;const R=out.rows[mo]=[];let T=performance.now();
    K.forEach((k,ki)=>{A.k=k;A.bi=0;T+=1;animHero(T,false,pl);pl.updateMatrixWorld(true);
      const t=SK141.tool;t.updateMatrixWorld(true);const P=pl.position,fw=new V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),sd=new V(fw.z,0,-fw.x);
      const base=new V(0,0,0).applyMatrix4(t.matrixWorld),head=new V(0,mo=='mine'?-.53:-.42,0).applyMatrix4(t.matrixWorld),
        hx=new V(1,0,0).transformDirection(t.matrixWorld);   // the head's long axis (pick points / hatchet edge direction)
      R.push({k,head:[head.x-P.x,head.y-P.y,head.z-P.z].map(v=>+v.toFixed(3)),hxSide:+Math.abs(hx.dot(sd)).toFixed(3),hxFw:+hx.dot(fw).toFixed(3),
        hand:[base.x-P.x,base.y-P.y,base.z-P.z].map(v=>+v.toFixed(3))});
      [[sd.clone().multiplyScalar(2.1).add(fw.clone().multiplyScalar(.4)).add(new V(0,1.0,0)),0],[fw.clone().multiplyScalar(2.0).add(sd.clone().multiplyScalar(-.7)).add(new V(0,1.1,0)),1]].forEach(([off,r])=>{
        pc.position.copy(P).add(off);LT.position.copy(pc.position).add(new V(0,1,0));pc.lookAt(P.x,P.y+.8,P.z);rd.render(scene,pc);x.drawImage(rd.domElement,ki*FW,(mi*2+r)*FH);
        x.fillStyle='#fff';x.fillText(mo+' k='+k+(r?' front':' side'),ki*FW+6,(mi*2+r)*FH+14)})})});
  }catch(e){out.err=String(e&&e.stack||e)}
  scene.remove(LT);scene.remove(AL);haCancel(false);gat=null;sk141Hide();rd.dispose();out.img=cnv.toDataURL('image/jpeg',.85);return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS)
    if r['err']:print('FAIL tools sheet:',r['err'][:400])
    open(play.TMP+'/v148_tools.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
    for mo,R in r['rows'].items():
        for q in R:print(mo,json.dumps({k:v for k,v in q.items()}))
    mine=r['rows'].get('mine',[]);chop=r['rows'].get('chop',[])
    bad=[q['k'] for q in mine if q['hxSide']>.5]
    print('mine: pick head sideways at k =',bad) if bad else print('mine: pick head stays in the swing plane')
    if bad:print('FAIL pick head turned sideways at',bad)
    # the swing travels: the head goes high (over the head) and comes down low in front
    if mine:
        hy=[q['head'][1] for q in mine]
        if max(hy)<1.6 or min(hy[3:6])>1.0:print('FAIL pick swing: head heights',hy)
    if chop:
        hz=[q['head'] for q in chop]
        land=[q for q in chop if .45<=q['k']<=.6]
        if land and all(abs(q['hxFw'])<.5 for q in land):print('FAIL hatchet edge not facing forward when it lands',[q['hxFw'] for q in land])
play.run(s,w=900,hh=600)
