# v198 (owner, Nov 4 2026): Duskhold's six wall exits, the fountain rim seat, no market stalls, Kindlelight's trees in one piece.
#   1. trees: no piece of a dead tree (Kindlelight I / III, Burningeye, the Dirge), the reeds or the Duskhold forest kinds hangs in
#      the air (v198_limbs.js: every piece off the ground touches another piece)
#   2. exits: at every kingdom stage each portal's exit is open (no wall tile, nothing solid across the opening) and the wall is
#      closed beside it; no gatehouse is built; at the largest kingdom with everything built the straight way from just inside
#      each exit out to its entry is clear, and every open room is reachable from the plaza
#   3. seats: a villager sitting on the fountain's rim (and on a chair, a bench) has its hips on the seat (the lift used to be
#      commented out, so they sat at standing height, inside the rim)
#   4. stalls: none built, no colliders, no villager spot "browse a stall"
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
H=os.path.dirname(os.path.abspath(__file__))
LIMBS=open(os.path.join(H,'v198_limbs.js')).read()
LIMBS='\n'.join(l for l in LIMBS.split('\n') if not l.startswith('//'))
JS=r"""(LIMBS)=>{const R={fail:[]},F=m=>R.fail.push(m),T=TOWNS[0],V=THREE.Vector3;
 try{
  // 1) trees in one piece
  {const L=(0,eval)('('+LIMBS+')')({only:'^(k_tree|k3_tree|b_tree|d_tree|k_reeds|d_reeds|h2_reeds|s3_reeds|dm196:.*)$'});R.limbKinds=L.n;L.bad.forEach(b=>F('loose piece in '+b.k+': '+b.gap+' m off (tol '+b.tol+') at '+b.at))}
  // 2) exits
  const free=(x,z)=>!solid(x,z)&&!tcHit(x,z);
  // flood fill (half tiles) from the spawn; reach(x,z,r) = some reached cell within r
  const flood=()=>{const st=.5,x0=T.cx-60,z0=T.cy-90,nx=241,nz=361,seen=new Uint8Array(nx*nz),q=[],at=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
    const s0=at(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;seen[k]=free(x0+ii*st,z0+jj*st)?1:2;if(seen[k]==1)q.push(k)}}
    return (x,z,r)=>{for(let dz=-r;dz<=r;dz+=st)for(let dx=-r;dx<=r;dx+=st){const k=at(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false}};
  let gates=0;{const g0=kdGateK;kdGateK=function(){gates++;return g0.apply(this,arguments)};try{
  R.st=[];for(let s=0;s<6;s++){bossDone.clear();for(let i=0;i<s;i++)bossDone.add(i);KF109.s=-1;kfApply109(true);portalRefresh();const Rr=kf109().R,A=dm196ExA(),reach=flood();let wall=0;
    A.forEach((a,i)=>{const ux=Math.sin(a),uz=-Math.cos(a);
      // the opening can be walked through from the plaza: a spot just outside it is reached
      if(!reach(T.cx+ux*(Rr+2.5),T.cy+uz*(Rr+2.5),.6))F('stage '+s+' exit '+(i+1)+': cannot walk out through it');
      for(let dr=-.5;dr<=1;dr+=.5)for(let l=-2;l<=2;l+=.5){const x=T.cx+ux*(Rr+dr)+uz*l,z=T.cy+uz*(Rr+dr)-ux*l;const t=MAP[Math.round(z)][Math.round(x)];if(t=='W'){F('stage '+s+' exit '+(i+1)+': wall tile in the opening at side '+l);return}if(!free(x,z)){F('stage '+s+' exit '+(i+1)+': something solid in the opening at side '+l+', '+dr);return}}
      [-1,1].forEach(sd=>{const l=DM196X.t+DM196X.tr+1.2,[x,z]=dm196P(a+sd*l/Rr,Rr);if(MAP[Math.round(T.cy+z)][Math.round(T.cx+x)]=='W')wall++})});
    R.st.push([s,Rr,wall]);if(wall<12)F('stage '+s+': the wall is not closed beside the exits ('+wall+'/12)')}}finally{kdGateK=g0}}
  bossDone.clear();KF109.s=-1;kfApply109(true);if(gates)F('a gatehouse was built '+gates+'x');
  // everything unlocked and built: the way out of each exit to its entry is clear, every room reachable from the plaza
  for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true);portalRefresh();
  gold=1e8;for(const k of Object.keys(RES))mats[k]=9999;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=999);SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=3);SH.lv.walls=3;shApply();
  while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX){if(!hsBuy103(LOT103.find(l=>lotFree103(l.id)).id))break}
  DECO103.forEach(D=>SH.deco[D.k]=1);dc103Sync();kfApply109(true);
  {const Rr=kf109().R;R.Rmax=Rr;dm196ExA().forEach((a,i)=>{const ux=Math.sin(a),uz=-Math.cos(a),e=dm196Ent(i);let bad=null;
     for(let r=Rr-3;r<Math.hypot(e[0]-T.cx,e[1]-T.cy)-.5&&!bad;r+=.5)for(let l=-1.2;l<=1.2;l+=.4){const x=T.cx+ux*r+uz*l,z=T.cy+uz*r-ux*l;if(!free(x,z)){bad=[+r.toFixed(1),+l.toFixed(1)];break}}
     if(bad)F('exit '+(i+1)+': the way to the entry is blocked at r '+bad[0]+' side '+bad[1])})}
  {const st=.5,x0=T.cx-60,z0=T.cy-90,nx=241,nz=361,seen=new Uint8Array(nx*nz),q=[],at=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
   const s0=at(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;seen[k]=free(x0+ii*st,z0+jj*st)?1:2;if(seen[k]==1)q.push(k)}}
   TWN100_PG.forEach((p,i)=>{const k=at(p.a[0],p.a[1]);let ok=false;for(let d=-2;d<=2&&!ok;d++)for(let e=-2;e<=2&&!ok;e++){const kk=at(p.a[0]+d*.5,p.a[1]+e*.5);if(kk>=0&&seen[kk]==1)ok=true}if(!ok)F('room '+(i+1)+' not reachable from the plaza')});
   R.badDoors=kfDoors109();if(R.badDoors.length)F('doors unreachable: '+R.badDoors.join(','))}
  // 3) seats: hips on the seat
  {const out=[];['fox','bear','mouse','boar','stag'].forEach(sp=>{const rig=idlNpcBody({robe:0x6a4a3a,trim:0xc9a24a,hat:'',fkSp:sp,fkFur:0,label:''});const g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);
     scene.add(g);g.position.set(0,0,0);g.updateMatrixWorld(true);g.userData.hipY=g.bones.lh0.getWorldPosition(new V()).y;
     [['rim',.74],['eat',.40],['rest',.54]].forEach(([a,h])=>{IDL.on=false;czReset103(g);const o={g,i:0,act:{a,s:{sit:1,h}}};dm196Pose(o,1000);g.updateMatrixWorld(true);const y=g.bones.lh0.getWorldPosition(new V()).y;dm196Undo(o);
       out.push(sp+' '+a+' hip '+y.toFixed(2)+' want '+(h+.07).toFixed(2));if(Math.abs(y-(h+.07))>.09)F(sp+' sitting ('+a+', seat '+h+'): hips at '+y.toFixed(2)+' (want '+(h+.07).toFixed(2)+')')});
     IDL.on=true;scene.remove(g)});R.seats=out}
  // 4) no stalls
  if(KF109.stalls)F('the market stalls are built');if(KF109.stallCol&&KF109.stallCol.some(c=>T.col.indexOf(c)>=0))F('stall colliders left');if(dm196Spots().some(s=>s.k=='stall'))F('villagers still browse a stall');
 }catch(e){F('threw '+e.message+' '+String(e.stack).slice(0,500))}
 return R}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS,LIMBS);print(json.dumps({k:v for k,v in r.items() if k!='fail'}))
    for f in r['fail']:print('FAIL',f)
    print('V198_TOWN','PASS' if not r['fail'] else 'FAIL')
play.run(s)
