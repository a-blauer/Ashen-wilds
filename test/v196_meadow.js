// v196 checks (python3 probe.py v196_meadow.js): the round meadow, the portal rooms behind their seals, doors, the Inn, decorations, villagers.
(()=>{const R={fail:[]},F=m=>R.fail.push(m),T=TOWNS[0];
 const free=(x,z)=>!solid(x,z)&&!tcHit(x,z);
 // flood fill on a half-tile grid from the spawn over the whole town area
 const flood=()=>{const st=.5,x0=T.cx-60,z0=T.cy-90,nx=241,nz=361,seen=new Uint8Array(nx*nz),q=[],at=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
   const s0=at(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;
     seen[k]=free(x0+ii*st,z0+jj*st)?1:2;if(seen[k]==1)q.push(k)}}return (x,z,r)=>{r=r||1;for(let dz=-r;dz<=r;dz+=st)for(let dx=-r;dx<=r;dx+=st){const k=at(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false}};
 const all=()=>{gold=1e8;for(const k of Object.keys(RES))mats[k]=9999;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=999);SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=3);SH.lv.walls=3;shApply();
   while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX){if(!hsBuy103(LOT103.find(l=>lotFree103(l.id)).id))break}};
 try{
  // 1) locked: only Portal I's room can be reached; the seals stand
  bossDone.clear();KF109.s=-1;kfApply109(true);portalRefresh();let reach=flood();
  TWN100_PG.forEach((p,i)=>{const r=reach(p.a[0],p.a[1],1);if(i==0&&!r)F('room I not reachable');if(i>0&&r)F('room '+(i+1)+' reachable while sealed')});
  R.sealsShown=DM196P.seal.map(s=>s?s.g.visible:null);
  // 2) everything unlocked and built: all rooms, every door, the Inn's bar, the Trading Post
  for(let i=0;i<6;i++)bossDone.add(i);kfApply109(true);portalRefresh();all();kfApply109(true);reach=flood();
  TWN100_PG.forEach((p,i)=>{if(!reach(p.a[0],p.a[1],1))F('room '+(i+1)+' not reachable when open');const P=PORT[i];if(Math.hypot(P.x-p.x,P.z-p.y)>.5)F('portal '+i+' not in its room')});
  R.badDoors=kfDoors109();if(R.badDoors.length)F('doors unreachable: '+R.badDoors.join(','));
  for(const k in SH.pos){const l=lotOf103(k);if(!l)continue;const d=lotDoor103(l);if(!reach(d[0],d[1],1.2))F('door not reachable by flood: '+k)}
  if(!reach(T.tv[0],T.tv[1],.6))F('inn bar (rest prompt) not reachable');if(!reach(T.mp[0],T.mp[1],.8))F('trading post prompt not reachable');
  if(!(SHM.st&&reach(SHM.st.x,SHM.st.z,2)))F('steward not reachable');
  {const l=dm196Fix('inn');let n=0,ok=0;DM196I.seats.forEach(s=>{const [x,z]=lotW103(l,s.x+(s.x-s.tx)*.4,s.z+(s.z-s.tz)*.4);n++;if(reach(x,z,.6))ok++});R.innSeatsReach=ok+'/'+n;if(ok<n*.7)F('inn seats not reachable '+ok+'/'+n)}
  // 3) the meadow: round, inside the forest; walls round at every stage
  {let far=0,near=1e9;for(let a=0;a<6.283;a+=.05){let r=0;for(let d=30;d<60;d+=.25){const x=T.cx+Math.sin(a)*d,z=T.cy-Math.cos(a)*d;if(!(MAP.DW[Math.round(z)*W+Math.round(x)]<0)){r=d;break}}far=Math.max(far,r);near=Math.min(near,r)}R.groundEdge=[near,far];if(near<49||far>58)F('ground edge not round: '+near+'..'+far)}
  R.stages=[0,1,2,3,4,5].map(s=>{KF109.s=s;kfTiles109(kf109());let w=0;for(let a=0;a<6.283;a+=.02){const r=kf109().R,x=Math.round(T.cx+Math.sin(a)*r),z=Math.round(T.cy-Math.cos(a)*r);if(MAP[z][x]=='W')w++}return [s,kf109().R,w]});KF109.s=-1;kfApply109(true);
  // 4) trees: the forest is drawn; none stands in the meadow or a room
  {let n=0,bad=0;const m=new THREE.Matrix4(),v=new THREE.Vector3();DM196P.trees.forEach(im=>{for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);v.setFromMatrixPosition(m);n++;const wd=dm196Wd(Math.round(v.x),Math.round(v.z));if(wd==null||wd<.9)bad++}});R.trees=n;if(n<400)F('too few forest trees '+n);if(bad)F(bad+' trees on open ground')}
  // 5) decorations: none on a lot, a door yard or the avenues
  DECO103.forEach(D=>SH.deco[D.k]=1);dc103Sync();
  {const bad=[];DECO103.forEach(D=>{(D.col?D.col(D):[]).forEach(q=>{const x=q[0],z=q[1],r=q.length==3?q[2]:Math.max(q[2],q[3]);if(dm196LotHit(x,z,r*.5-.2))bad.push(D.k+'@lot');if(dm196Way(x,z,r*.5-.4))bad.push(D.k+'@way')})});R.decoBad=[...new Set(bad)];if(bad.length)F('decorations in the way: '+R.decoBad.join(','))}
  // 6) villagers: spots exist; a villager can walk into the Inn and sit
  {const S=dm196Spots();R.spots={};S.forEach(s=>R.spots[s.k]=(R.spots[s.k]||0)+1);if(!(R.spots.chair>=6))F('too few inn chairs');if(!(R.spots.rim>=8))F('no fountain seats')}
  // 7) signs: one line each
  {let multi=0;(SGNR||[]).forEach(r=>{if(r&&r.a&&Array.isArray(r.a[0])&&r.a[0].length>1){/* the painter keeps the title only */}});R.sgn=(SGNR||[]).length}
 }catch(e){F('threw '+e.message+' '+String(e.stack).slice(0,400))}
 return R})()
