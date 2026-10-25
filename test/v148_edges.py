# v148: every edged weapon's edge leads its swing, on every combo step (the halberd's finishing sweep had its blade backwards).
#   For each weapon type with an edge (GRIP[type].edge) and each combo step, the real swing plays frame by frame (16 ms) and,
#   in the fast part of the swing (around contact), the blade's edge direction (the model's +x, the bit side) is compared with
#   how the blade is moving across the handle. Prints the share of fast frames where the edge leads; FAIL under 80%.
#   It also checks the follow-through: a one-sided edge keeps the spin it cut with (the grip's psi) after the blow, instead of turning
#   round to lead the return swing (FAIL if it has turned more than 90 degrees while the blade swings back).
#   SHOT=1: out/v148_edges.jpg, one row per weapon/step at contact (side + top views). WT=halberd limits the types.
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async(a)=>{const [only,shot]=a;const V=THREE.Vector3,out={rows:[],err:null};
  const types=Object.keys(GRIP).filter(t=>GRIP[t].edge&&(!only.length||only.includes(t)));
  let rd=null,pc=null,cnv=null,x=null,FW=200,FH=200,row=0,LT=null;
  if(shot){rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);rd.setClearColor(0x30343a);pc=new THREE.PerspectiveCamera(42,1,.05,60);
    cnv=document.createElement('canvas');cnv.width=FW*6;cnv.height=FH*types.length*4;x=cnv.getContext('2d');x.font='12px sans-serif';LT=new THREE.AmbientLight(0xffffff,1.2);scene.add(LT)}
  const P0=pl.position.clone();
  try{for(const wt of types){
    const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&itT({id:-1,tp:i,lv:1,req:1,r:2,up:0,aff:[]}).wt==wt);if(tp<0){out.rows.push({wt,skip:'no hero weapon of this type'});continue}
    eq.weapon={id:-1,tp,lv:1,req:1,r:2,up:0,aff:[]};refreshGear(pl);
    const N=MW[wt]?MW[wt].N:3;
    for(let st=0;st<N;st++){
      combo=(st+1)%N;let T=performance.now();haCancel(false);pl.position.copy(P0);pl.rotation.y=0;
      for(let i=0;i<20;i++){T+=16;animHero(T,false,pl)}   // settle in the carry grip
      const ms=MW[wt]&&MW[wt].ms?MW[wt].ms[st]:300;SWFIN=st==N-1?1:0;swingAnim(MW[wt]&&MW[wt].a?MW[wt].a[st]:st,ms,()=>{});const A=HA.cur;if(!A){out.rows.push({wt,st,err:'no swing'});continue}
      const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt==wt&&o.parent);
      const bb=new THREE.Box3().setFromObject(W);W.updateMatrixWorld(true);
      // blade point: the far end of the model along its own -y
      let ymin=0;W.traverse(o=>{if(o.isMesh&&o.geometry){o.geometry.computeBoundingBox();ymin=Math.min(ymin,o.geometry.boundingBox.min.y)}});
      const bp=new V(0,ymin*.85,0),F=[];let prev=null,n=0;
      while(HA.cur===A&&n<400){T+=16;n++;animHero(T,false,pl);pl.position.copy(P0);pl.updateMatrixWorld(true);W.updateMatrixWorld(true);
        const p=pl.worldToLocal(W.localToWorld(bp.clone())),ax=pl.worldToLocal(W.localToWorld(new V(0,-1,0))).sub(pl.worldToLocal(W.localToWorld(new V(0,0,0)))).normalize(),
          ed=pl.worldToLocal(W.localToWorld(new V(1,0,0))).sub(pl.worldToLocal(W.localToWorld(new V(0,0,0)))).normalize();
        if(prev){const v=p.clone().sub(prev).divideScalar(.016);v.addScaledVector(ax,-v.dot(ax));F.push({psi:+(((pl._grip.L.find(e=>e.W===W)||{}).psi)||0).toFixed(2),k:+A.k.toFixed(3),ed:ed.clone(),ax:ax.clone(),vd:v.clone(),sp:v.length(),d:v.length()>1e-3?ed.dot(v.normalize()):0})}
        prev=p;
        if(shot&&prev&&Math.abs(A.k-A.hitAt)<.012&&!A.shot){A.shot=1;const Pp=pl.position;
          [[new V(2.4,1.2,.6),0],[new V(.01,4.2,.3),1]].forEach(([o,c])=>{pc.position.copy(Pp).add(o);pc.lookAt(Pp.x,Pp.y+.9,Pp.z);rd.render(scene,pc);x.drawImage(rd.domElement,c*FW+(st%3)*2*FW,(row+Math.floor(st/3))*FH);
            x.fillStyle='#fff';x.fillText(wt+' '+st+(c?' top':' side'),c*FW+(st%3)*2*FW+5,(row+Math.floor(st/3))*FH+13)})}}
      haCancel(false);
      const mx=Math.max(...F.map(q=>q.sp)),fast=F.filter(q=>q.sp>mx*.45&&q.k>A.hitAt-.15&&q.k<A.hitAt+.12),good=fast.filter(q=>(GRIP[wt].edge==2?Math.abs(q.d):q.d)>.25).length,thr=!!(MW[wt]&&MW[wt].thrust&&st<N-1);
      // the follow-through: the edge keeps facing the way it cut (it must not turn round with the recovery)
      const pk=F.reduce((b,q)=>q.sp>b.sp?q:b,F[0]),after=F.filter(q=>q.k>pk.k&&q.k<A.hitAt+.3),npk=new V().crossVectors(pk.ax,pk.vd).normalize(),flip=GRIP[wt].edge==1&&!thr?after.filter(q=>Math.abs(Math.atan2(Math.sin(q.psi-pk.psi),Math.cos(q.psi-pk.psi)))>Math.PI/2&&new V().crossVectors(q.ax,q.vd).dot(npk)<0).map(q=>q.k):[];
      out.rows.push({wt,st,thr,flip,frames:F.length,fast:fast.length,good,share:fast.length?+(good/fast.length).toFixed(2):null,
        trace:(F).map(q=>[q.k,+q.sp.toFixed(1),+q.d.toFixed(2),q.psi,+new V().crossVectors(q.ax,q.ed).dot(npk).toFixed(2)])})}
    row+=Math.ceil(N/3)}}catch(e){out.err=String(e&&e.stack||e)}
  if(shot){scene.remove(LT);out.img=cnv.toDataURL('image/jpeg',.85);rd.dispose()}
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    only=[w for w in os.environ.get('WT','').split(',') if w]
    r=pg.evaluate(JS,[only,bool(os.environ.get('SHOT'))])
    if r['err']:print('FAIL edges:',r['err'][:500])
    if r.get('img'):open(play.TMP+'/v148_edges.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
    for q in r['rows']:
        print(json.dumps({k:v for k,v in q.items() if k!='trace'}),'' if not os.environ.get('TRACE') else q.get('trace'))
        if q.get('skip'):continue
        if q.get('err'):print('FAIL',q['wt'],q.get('st'),q['err']);continue
        if q.get('flip'):print('FAIL edge turns round after the blow:',q['wt'],'step',q['st'],'at k',q['flip'][:6])
        if q.get('thr'):continue
        if q['share'] is None or q['share']<.8:print('FAIL edge does not lead the swing:',q['wt'],'step',q['st'],'share',q['share'])
play.run(s,w=900,hh=600)
