// v198 test: no scenery model has a piece hanging in the air. Every scattered decoration kind (WD.T) and every Duskhold forest
// tree kind (dm196Kind) is split into pieces (triangles joined through shared corners); a piece that does not reach the ground
// must touch another piece: the closest of its corners to another piece's surface is within tol. (v177's check compared
// bounding boxes, so a branch whose box overlapped the trunk's box passed even when it stood beside the trunk in the air.)
// opt.only = regexp of kinds to check (default all); returns {n, bad:[{k, part, gap, at, tris}]}
(opt)=>{opt=opt||{};const re=new RegExp(opt.only||'.'),V=THREE.Vector3;
  const pieces=geos=>{const P=[],key=new Map(),par=[],tris=[];const find=a=>{while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a};
    geos.forEach(g=>{const pos=g.attributes.position,idx=g.index,n=idx?idx.count:pos.count;
      const vid=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),k=Math.round(x*400)+','+Math.round(y*400)+','+Math.round(z*400);let v=key.get(k);if(v==null){v=P.length;P.push(new V(x,y,z));key.set(k,v);par.push(v)}return v};
      for(let t=0;t<n;t+=3){const a=vid(idx?idx.getX(t):t),b=vid(idx?idx.getX(t+1):t+1),c=vid(idx?idx.getX(t+2):t+2);tris.push([a,b,c]);par[find(a)]=find(b);par[find(b)]=find(c)}});
    const by=new Map();tris.forEach(t=>{const r=find(t[0]);(by.get(r)||by.set(r,[]).get(r)).push(t)});return {P,L:[...by.values()]}};
  const tri=new THREE.Triangle(),cp=new V();
  const check=(k,geos)=>{const {P,L}=pieces(geos);if(L.length<2)return [];let y0=1e9,y1=-1e9;P.forEach(p=>{y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)});
    const size=Math.max(y1-y0,.1),tol=Math.max(.02,size*.012),out=[];
    const box=L.map(T=>{const b=new THREE.Box3();T.forEach(t=>t.forEach(v=>b.expandByPoint(P[v])));return b});
    const gy=Math.max(y0,0)+Math.max(.05,size*.02);L.forEach((T,i)=>{if(box[i].min.y<gy)return; // stands on the ground (a kind stands at y 0; parts may sink below it)
      const vs=[...new Set([].concat(...T))];let best=1e9,at=null;
      L.forEach((U,j)=>{if(j===i||best<=tol)return;const bj=box[j].clone().expandByScalar(Math.min(best,1));if(!bj.intersectsBox(box[i]))return;
        U.forEach(t=>{tri.set(P[t[0]],P[t[1]],P[t[2]]);for(const v of vs){tri.closestPointToPoint(P[v],cp);const d=cp.distanceTo(P[v]);if(d<best){best=d;at=P[v]}}});
        // a corner sunk inside the other piece also holds it (odd number of crossings along a ray)
        if(best>tol)for(const v of vs){if(!box[j].containsPoint(P[v]))continue;let c=0;const o=P[v],d=new V(.577,.577,.578),hit=new V();
          for(const t of U){if(new THREE.Ray(o,d).intersectTriangle(P[t[0]],P[t[1]],P[t[2]],false,hit))c++}if(c%2){best=0;at=P[v];break}}});
      if(best>tol)out.push({k,part:i,gap:+best.toFixed(3),tol:+tol.toFixed(3),at:at?[+at.x.toFixed(2),+at.y.toFixed(2),+at.z.toFixed(2)]:null,tris:T.length})});
    return out};
  const bad=[];let n=0;
  for(const k in WD.T){if(!re.test(k))continue;const S=WD.T[k];if(!S.parts)continue;const G=S.parts.filter(p=>!p.glow&&!p.mat).map(p=>p.g);if(!G.length)continue;n++;bad.push(...check(k,G))}
  if(typeof dm196Kind=='function')['pine','snowpine','oak','bog','blood','dead','spire','cactus'].forEach(k=>{if(!re.test('dm196:'+k))return;n++;bad.push(...check('dm196:'+k,[dm196Kind(k)]))});
  return {n,bad}}
