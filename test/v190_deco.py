# v190 (v196: the round town): Duskhold decorations stay out of the way, at every kingdom stage (0..5), with every decoration on and every lot built:
#   * no decoration's footprint (its colliders) is on a lot, in front of any door a lot's building could face (every turn that does
#     not face a wall or another lot), at the Trading Post, the tavern, the Steward, Cheddar's board, the arrival spot, the Gate
#     Avenue or the open ways from the arrival spot to the fountain and from the fountain to the Trading Post;
#   * no two decorations overlap; everything stands inside the walls (the gate totems stand outside on purpose);
#   * every door, the gate and the Steward can be walked to (flood fill with everything built);
#   * every decoration builds, has meshes, its triangles stay within budget (DC190_BUDGET), and set pieces appear by stage.
# SOLVE='r,st0' prints the free spots for a round piece of radius r that appears at stage st0 (planning helper, no checks).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
KEEP=r"""
window.DCK=(st)=>{const T=TOWNS[0],F=kf109(),Z=[],lots=LOT103.filter(l=>l.st<=st); // v196: the round town (lots in rings facing the fountain, two avenues)
  const loc=(l,a,b)=>{const p=lotW103(l,a,b);return [p[0]-T.cx,p[1]-T.cy]};
  lots.forEach(l=>{Z.push({k:'lot '+l.id,x:l.x,z:l.z,r:3.7});const d=loc(l,0,5.0);Z.push({k:'door '+l.id+' r0',x:d[0],z:d[1],r:1.5})});
  const pt=(k,p,r)=>{if(p)Z.push({k,x:p[0]-T.cx,z:p[1]-T.cy,r})};
  pt('trading post',T.mp,2.0);{const l=dm196Fix('post');Z.push({k:'post hall',x:l.x,z:l.z,r:3.7})}
  {const l=dm196Fix('inn'),d=loc(l,0,5.6);Z.push({k:'inn',x:l.x,z:l.z,r:6.0},{k:'inn door',x:d[0],z:d[1],r:1.8})}
  if(SHM.st)pt('steward',[SHM.st.x,SHM.st.z],2.2);
  const c=chq148Spot();if(c){pt('cheddar',[c.cx,c.cz],1.5);pt('board',[c.fx,c.fz],1.5)}
  Z.push({k:'arrival',x:0,z:8.4,r:1.8},{k:'south avenue',x:0,z:(10.5+F.R)/2,hx:2.9,hz:(F.R-10.5)/2},{k:'north avenue',x:0,z:-(10.5+F.R)/2,hx:2.9,hz:(F.R-10.5)/2},{k:'south way',x:0,z:5.6,hx:1.5,hz:2.9},{k:'north way',x:0,z:-6.5,hx:1.5,hz:3.5});
  return Z};
window.DCHIT=(a,b)=>{const ca=a.r!=null,cb=b.r!=null;
  if(ca&&cb)return Math.hypot(a.x-b.x,a.z-b.z)<a.r+b.r;
  if(ca||cb){const c=ca?a:b,q=ca?b:a,dx=Math.max(0,Math.abs(c.x-q.x)-q.hx),dz=Math.max(0,Math.abs(c.z-q.z)-q.hz);return Math.hypot(dx,dz)<c.r}
  return Math.abs(a.x-b.x)<a.hx+b.hx&&Math.abs(a.z-b.z)<a.hz+b.hz};
window.DCSTAGE=(st,lots)=>{const T=TOWNS[0];bossDone.clear();for(let i=0;i<st;i++)bossDone.add(i);SH.pos={};SH.rot={};SH.shop={};SH.lv={};HS103.h.length=0;HS103.cit.length=0;try{hs103Sync()}catch(_){}
  x2Load(x2Save());kfApply109(true);gold=1e8;['wood','stone','fiber','iron','glowcap','bone','petals','crystal'].forEach(k=>mats[k]=99999);
  DECO103.forEach(D=>{if(SH.deco[D.k]==null)dcBuy103(D.k);SH.deco[D.k]=1});
  if(lots){SHOPS.forEach(o=>SH.shop[o.k]=1);UPK103.forEach(k=>SH.lv[k]=1);shApply();let n=0;
    while(LOT103.some(l=>lotFree103(l.id))&&HS103.h.length<HS103_MAX&&n++<30){const id=LOT103.find(l=>lotFree103(l.id)).id;gold=1e8;if(!hsBuy103(id))break}lotSync103()}
  dc103Sync();return kf109()};
"""
CHECK=r"""()=>{const T=TOWNS[0],out=[];const OUTSIDE={totems:1};
  for(let st=0;st<=5;st++){const F=DCSTAGE(st,true),Z=DCK(st),bad=[],ov=[],outw=[],own=[];
    for(const D of DECO103){const C=(DC103.col[D.k]||[]).map(c=>c.r!=null?{x:c.x-T.cx,z:c.z-T.cy,r:c.r}:{x:c.x-T.cx,z:c.z-T.cy,hx:c.hx,hz:c.hz});
      C.forEach(c=>{own.push([D.k,c]);Z.forEach(z=>{if(DCHIT(c,z))bad.push(D.k+'@'+c.x.toFixed(1)+','+c.z.toFixed(1)+' in '+z.k)});
        if(!OUTSIDE[D.k]&&Math.hypot(c.x,c.z)>DM196.RM-1)outw.push(D.k+'@'+c.x.toFixed(1)+','+c.z.toFixed(1))})} // v196: the meadow holds the pieces the walls have not reached yet
    for(let i=0;i<own.length;i++)for(let j=i+1;j<own.length;j++)if(own[i][0]!==own[j][0]&&DCHIT(own[i][1],own[j][1]))ov.push(own[i][0]+'/'+own[j][0]+'@'+own[i][1].x.toFixed(1)+','+own[i][1].z.toFixed(1));
    // walkable: every door, the gate and the Steward (flood fill from the arrival spot, hero-sized)
    const s=.25,x0=T.cx-F.R,z0=T.cy-F.R,nx=Math.round(2*F.R/s),nz=Math.round(2*F.R/s),seen=new Uint8Array(nx*nz),q=[],free=(x,z)=>!CR.some(([a,b])=>solid(x+a,z+b))&&!tcHit(x,z);
    const id=(x,z)=>{const i=Math.round((x-x0)/s),j=Math.round((z-z0)/s);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};const s0=id(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);
    while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)return;const k=jj*nx+ii;if(seen[k])return;const x=x0+ii*s,z=z0+jj*s;if(!free(x,z)){seen[k]=2;return}seen[k]=1;q.push(k)})}
    const reach=(x,z,R)=>{for(let dz=-R;dz<=R;dz+=s)for(let dx=-R;dx<=R;dx+=s){if(dx*dx+dz*dz>R*R)continue;const k=id(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
    const unreach=LOT103.filter(l=>l.st<=st).filter(l=>{const k=lotKey103(l.id),d=lotDoor103((k&&lotOf103(k))||l);return !reach(d[0],d[1],1.6)}).map(l=>l.id);
    const gate=reach(T.cx,T.cy+F.R-1.2,1.5)&&reach(T.cx,T.cy-F.R+1.2,1.5),stw=reach(SHM.st.x,SHM.st.z,2.2),tp=reach(T.mp[0],T.mp[1],2),tv=reach(T.tv[0],T.tv[1],2);
    const shown=DECO103.filter(D=>{const g=DC103.g[D.k];let n=0;if(g)g.traverse(o=>{if(o.isMesh)n++});return n>0}).map(D=>D.k);
    out.push({st,SZ:F.SZ,bad:bad.slice(0,12),nbad:bad.length,ov:ov.slice(0,8),outw,unreach,gate,stw,tp,tv,shown:shown.length,missing:DECO103.filter(D=>D.k!='fireworks'&&shown.indexOf(D.k)<0).map(D=>D.k)})}
  const tri=DECO103.map(D=>{let n=0;const g=DC103.g[D.k];if(g)g.traverse(o=>{if(o.isMesh&&o.geometry){const G=o.geometry;n+=(G.index?G.index.count:G.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)}});return [D.k,Math.round(n)]});
  return {out,tri,budget:typeof DC190_BUDGET!='undefined'?DC190_BUDGET:null,v:typeof DC190!='undefined'}}"""
SOLVE=r"""([R,st0])=>{const T=TOWNS[0],res=[];const Zs=[];for(let st=st0;st<=5;st++){DCSTAGE(st,false);Zs.push([st,DCK(st),KF109.SZ[st]])}
  DCSTAGE(5,false);DECO103.forEach(D=>SH.deco[D.k]=0);dc103Sync();const deco=[];for(const k in DC103.col)DC103.col[k].forEach(c=>deco.push([k,c.r!=null?{x:c.x-T.cx,z:c.z-T.cy,r:c.r}:{x:c.x-T.cx,z:c.z-T.cy,hx:c.hx,hz:c.hz}]));
  const SZ0=KF109.SZ[st0];
  for(let z=-20;z<=SZ0-1;z+=.5)for(let x=-19.5;x<=19.5;x+=.5){const c={x,z,r:R};if(!kfIn109(x,z,R)&&!(Math.abs(x)<KF109.WX-.5-R&&z<SZ0-.5-R&&z>-TS+.5+R))continue;
    if(Math.abs(x)>KF109.WX-.6-R||z>SZ0-.6-R||z<-TS+.6+R)continue;
    if(Zs.some(([st,Z])=>Z.some(q=>DCHIT(c,q))))continue;
    let ok=true;for(let i=0;i<4&&ok;i++)for(const [k,o] of [[0,0]]){}
    // clear of other colliders (walls, dressing) and of decorations
    const X=T.cx+x,Zw=T.cy+z;for(let a=0;a<8&&ok;a++){const px=X+Math.cos(a/8*6.283)*R,pz=Zw+Math.sin(a/8*6.283)*R;if(solid(px,pz)||tcHit(px,pz))ok=false}
    if(ok&&(solid(X,Zw)||tcHit(X,Zw)))ok=false;
    const near=deco.filter(([k,o])=>DCHIT(c,o)).map(q=>q[0]);res.push([x,z,ok?1:0,near.join('|')])}
  return res.filter(q=>q[2]).map(q=>q[0]+','+q[1]+(q[3]?' ('+q[3]+')':''))}"""
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    ev("()=>{"+KEEP+"}")
    if os.environ.get('SOLVE'):
        r,st0=os.environ['SOLVE'].split(',');res=ev(SOLVE,[float(r),int(st0)]);print(len(res),'free spots');print('\n'.join(res));return
    r=ev(CHECK)
    fails=[]
    F=lambda m:(fails.append(m),print('FAIL',m))
    for q in r['out']:
        print('stage',q['st'],'SZ',q['SZ'],json.dumps({k:q[k] for k in ('nbad','bad','ov','outw','unreach','gate','stw','tp','tv','shown','missing')}))
        if q['nbad']:F('stage %d: %d decoration footprints in the way: %s'%(q['st'],q['nbad'],q['bad']))
        if q['ov']:F('stage %d: decorations overlap: %s'%(q['st'],q['ov']))
        if q['outw']:F('stage %d: decorations outside the walls: %s'%(q['st'],q['outw']))
        if q['unreach'] or not (q['gate'] and q['stw'] and q['tp'] and q['tv']):F('stage %d: not reachable: %s gate %s steward %s post %s tavern %s'%(q['st'],q['unreach'],q['gate'],q['stw'],q['tp'],q['tv']))
    last=r['out'][-1]
    if last['missing']:F('decorations with no meshes at stage 5: %s'%last['missing'])
    print('triangles',json.dumps(r['tri']))
    B=r['budget']
    if not r['v']:F('v190 decorations not loaded')
    if B:
        for k,n in r['tri']:
            if n>B.get(k,B.get('*',0)):F('%s: %d triangles, over its budget %d'%(k,n,B.get(k,B.get('*',0))))
        tot=sum(n for k,n in r['tri'])
        print('total triangles',tot)
        if tot>B.get('total',10**9):F('all decorations: %d triangles, over %d'%(tot,B['total']))
    print('FAILS',fails if fails else 'none')
play.run(s)
