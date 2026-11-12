# v225 pictures: the Paladin holding his shield up (Shift guard). POSE='{"lx":..}' tries another pose; TAG= names the files.
# Writes out/v225_block<TAG>_<view>.png (front, 3/4, side) and prints the shield's height and distance in front of the chest.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
OUT=play.TMP;TAG=os.environ.get('TAG','');POSE=os.environ.get('POSE','');RACE=os.environ.get('RACE','')
SEARCH=r"""()=>{const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1],0);STEP(.4);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
  const V=THREE.Vector3,sh=pl.gearG[pl.gearG.length-1],res=[];const hp=()=>{const P=pl.position,a=pl.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),rt=new V(Math.cos(a),0,-Math.sin(a));
    const c=sh.getWorldPosition(new V()).sub(P),n=new V(0,0,-1).applyQuaternion(sh.getWorldQuaternion(new THREE.Quaternion())),u=new V(0,1,0).applyQuaternion(sh.getWorldQuaternion(new THREE.Quaternion()));
    return {up:+c.y.toFixed(2),fwd:+c.dot(fw).toFixed(2),side:+c.dot(rt).toFixed(2),nf:+n.dot(fw).toFixed(2),nup:+n.y.toFixed(2),vert:+u.y.toFixed(2)}};
  const base=Object.assign({},GD213P.paladin);
  const G=JSON.parse(window.GRID||'null')||{lx:[-1.0,-1.25,-1.5,-1.75],lz:[-.3,0,.3,.6,.9],le:[-1.8,-1.4,-1.0,-.6,-.2,.2]};
  for(const lx of G.lx)for(const lz of G.lz)for(const le of G.le){GD213P.paladin=Object.assign({},base,{lx,lz,le});gd213Up&&gd213Up();STEP(.15);gd213Down();STEP(.45);res.push(Object.assign({lx,lz,le},hp()))}
  GD213P.paladin=base;gd213Up();STEP(.2);gd213Down();STEP(.45);res.push(Object.assign({cur:1},hp()));return res}"""
SEARCH2=r"""()=>{const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1],0);STEP(.4);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
  const V=THREE.Vector3,sh=pl.gearG[pl.gearG.length-1];gd213Down();STEP(.5);const P0=GD213P.paladin,init=Object.assign({},P0);
  const hp=()=>{const P=pl.position,a=pl.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),rt=new V(Math.cos(a),0,-Math.sin(a)),Q=sh.getWorldQuaternion(new THREE.Quaternion());
    const c=sh.getWorldPosition(new V()).sub(P),n=new V(0,0,-1).applyQuaternion(Q),u=new V(0,1,0).applyQuaternion(Q),hd=pl.bones.head.getWorldPosition(new V()).sub(P),ch=pl.bones.chest.getWorldPosition(new V()).sub(P),
      hn=pl.bones.aL2.getWorldPosition(new V()).sub(P);
    return {up:c.y,fwd:c.dot(fw),side:c.dot(rt),nf:n.dot(fw),vert:u.y,hy:hd.y,cy:ch.y,hf:hn.dot(fw)}};
  const T=JSON.parse(window.TGT||'{}'),upT=T.up,sideT=T.side==null?-.04:T.side,fwT=T.fwd||.42;
  const W=pl.gearG[0],RA=!!window.RARM;
  const wm=()=>{const P=pl.position,a=pl.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),rt=new V(Math.cos(a),0,-Math.sin(a)),Q=W.getWorldQuaternion(new THREE.Quaternion()),c=W.getWorldPosition(new V()).sub(P),u=new V(0,1,0).applyQuaternion(Q);
    return {wup:c.y,wfwd:c.dot(fw),wside:c.dot(rt),wy:u.y,wf:u.dot(fw)}};
  const cost=m=>{const ut=upT!=null?upT:(m.cy*.35+m.hy*.65);let c=6*Math.max(0,fwT-m.fwd)+1.5*Math.max(0,m.fwd-fwT-.12)+5*Math.abs(m.side-sideT)+4*Math.abs(m.up-ut)+3*(1-Math.abs(m.nf))+1.5*(1-m.vert)+2*Math.max(0,.12-m.hf);
    if(RA){const w=wm();c+=2*Math.max(0,.75-w.wy)+3*Math.abs(w.wside-(T.ws==null?.3:T.ws))+2*Math.max(0,w.wfwd-.2)+2*Math.max(0,-.12-w.wfwd)+2*Math.abs(w.wup-(T.wu==null?.95:T.wu))}return c};
  const R=Object.assign(RA?{ax:[-1.2,.35],az:[-1.0,1.0],ex:[-2.4,-.1],ay:[-1.2,1.2],rw:[-1.2,1.2],rz:[-1.2,1.2]}:{},window.ONLYR?{}:{lx:[-2.3,.3],lz:[-1,1.3],le:[-2.4,.6],ly:[-1.7,1.7],lw:[-1.2,1.2],lq:[-1.4,1.4],sx:[0,.2],hx:[0,.15]});
  if(window.POSE0)Object.assign(P0,JSON.parse(window.POSE0));
  const ev=()=>{STEP(.05);return cost(hp())};
  const ks=Object.keys(R);ks.forEach(k=>{if(P0[k]==null)P0[k]=0});let best=ev(),st=.4,log=[];
  for(let it=0;it<9&&st>.02;it++){let imp=false;for(const k of ks){for(const d of [st,-st]){const o=P0[k];P0[k]=Math.max(R[k][0],Math.min(R[k][1],o+d));if(P0[k]===o)continue;const c=ev();if(c<best-1e-4){best=c;imp=true}else P0[k]=o}}
    log.push(+best.toFixed(3));if(!imp)st/=2}
  ev();const m=Object.assign(hp(),wm()),out={};for(const k in P0)out[k]=+P0[k].toFixed(2);for(const k in m)m[k]=+m[k].toFixed(2);return {best:+best.toFixed(3),pose:out,m,init,log}}"""
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]');pg.click('[data-c="paladin"]')
    if RACE:
        try:pg.click('[data-race="%s"]'%RACE,timeout=5000)
        except Exception as e:print('no race button',e)
    pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(1500)
    ev(L.LIB);ev("()=>{for(const id of ['topl','mini','bbar','glog','sysBtn','fsBtn','hudTop','locBox','chInfo','prompt','acts'])try{$(id).style.visibility='hidden'}catch(_){}}")
    if os.environ.get('GRID'):ev("(g)=>{window.GRID=g}",os.environ['GRID'])
    if POSE:ev("(p)=>{GD213P.paladin=JSON.parse(p)}",POSE)
    if os.environ.get('RARM'):ev("()=>{window.RARM=1}")
    if os.environ.get('ONLYR'):ev("()=>{window.ONLYR=1}")
    if os.environ.get('POSE0'):ev("(g)=>{window.POSE0=g}",os.environ['POSE0'])
    if os.environ.get('TGT'):ev("(g)=>{window.TGT=g}",os.environ['TGT'])
    if os.environ.get('SEARCH2'):
        r=ev(SEARCH2);print('SEARCH2',json.dumps(r),flush=True)
        if not os.environ.get('SHOTS'):return
        ev("(p)=>{GD213P.paladin=p}",r['pose'])
        for nm,ang,dist,hy in [('front',0,2.6,1.0),('34',.75,2.6,1.0),('side',1.57,2.6,1.0),('back',2.6,2.6,1.0)]:
            ev("([ang,dist,hy])=>{const P=pl.position,a=pl.rotation.y+ang;FC([P.x+Math.sin(a)*dist,P.y+hy+.25,P.z+Math.cos(a)*dist],[P.x,P.y+hy-.25,P.z])}",[ang,dist,hy])
            L.shot(pg,OUT+'/v225_block%s_%s.png'%(TAG,nm))
        return
    if os.environ.get('SEARCH'):
        r=ev(SEARCH);print('SEARCH',json.dumps(r));return
    r=ev("""()=>{{const pm=PMAP[1],q=pm.path[Math.floor(pm.path.length/2)];toPos(q[0],q[1],0)}STEP(.4);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});gd213Down();STEP(.6);
      const V=THREE.Vector3,p=pl.position,a=pl.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a));let sh=null;
      sh=pl.gearG[pl.gearG.length-1];
      const out={cls:hero.cls,hold:GD213.hold,shield:!!sh};if(sh){const q=sh.getWorldPosition(new V()).sub(p);out.up=+q.y.toFixed(2);out.fwd=+q.dot(fw).toFixed(2);
        out.side=+q.dot(new V(Math.cos(a),0,-Math.sin(a))).toFixed(2);const n=new V(0,0,-1).applyQuaternion(sh.getWorldQuaternion(new THREE.Quaternion()));out.faceFwd=+n.dot(fw).toFixed(2)}
      window.__hp=[p.x,p.y,p.z,a];return out}""")
    print(json.dumps(r))
    for nm,ang,dist,hy in [('front',0,3.2,1.1),('34',.75,3.2,1.1),('side',1.57,3.2,1.1),('lside',-1.57,3.2,1.1)]:
        ev("([ang,dist,hy])=>{const [x,y,z,a]=__hp,b=a+ang;FC([x+Math.sin(b)*dist,y+hy+.25,z+Math.cos(b)*dist],[x,y+hy-.15,z])}",[ang,dist,hy])
        L.shot(pg,OUT+'/v225_block%s_%s.png'%(TAG,nm))
play.run(s)
