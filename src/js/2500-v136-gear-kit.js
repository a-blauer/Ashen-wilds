// ================= v136: gear kit — measured cloth for hoods, cowls, mantles, robes and coats =================
// The v114/v134 hoods were the skull rings pushed out by a few centimetres: a tight helmet-like shell that hugged the head,
// stopped at the neck and floated as a thin arc round the face. Here cloth is built the way it hangs:
//  * gkPts / gkRows measure what is already built (body, head, ears, worn armour, cape) as horizontal sections; each row of
//    cloth is the convex hull of its section (cloth spans hollows, it never dips between the ears or round the neck) pushed
//    out by a clearance, so nothing underneath can poke through in the bind pose.
//  * gkHood: rows from the shoulders to above the crown. Cloth at the back and sides falls straight down from the widest part
//    of the head (the hanging rule), the front is cut along a curve behind the eyes (an overhanging brim at the top, open or
//    closed under the chin), the cowl bunches into folds round the neck and spreads into a mantle over the shoulders with a
//    dagged (cut) hem. A darker lining inside, a rolled edge, an optional point (liripipe) hanging down the back.
//  * gkSurf: a grid of vertices (rows × columns) with per-vertex bone weights → triangles (one colour per quad).
//  * gkLater: hoods are built after everything else of the hero (chest, cape, quiver, outfit extras), so they measure all of it.
var GKX={late:null};
// ---------------- surfaces ----------------
// G[i][j] = {x,y,z,w:[[bone,weight],…]}; o: t ('c'|'m'|'g'), col (hex or fn(m)), keep(m); m = quad centre + u (columns 0..1), v (rows 0..1), i, j
function gkSurf(B,G,o){o=o||{};const t=o.t||'c',nr=G.length;
  const V=v=>v._mw&&v._mwB===B?v._mw:(v._mwB=B,v._mw={x:v.x,y:v.y,z:v.z,w:mdW(B,v.w)});
  for(let i=0;i<nr-1;i++){const A=G[i],C=G[i+1],n=Math.min(A.length,C.length);
    for(let j=0;j<n-1;j++){const a=A[j],b=A[j+1],c=C[j],d=C[j+1];if(!a||!b||!c||!d)continue;
      const m={x:(a.x+b.x+c.x+d.x)/4,y:(a.y+b.y+c.y+d.y)/4,z:(a.z+b.z+c.z+d.z)/4,u:(j+.5)/(n-1),v:(i+.5)/(nr-1),i,j,n,nr};
      if(o.keep&&!o.keep(m))continue;const col=mdC(typeof o.col=='function'?o.col(m):o.col);
      mdTri(B,t,V(a),V(b),V(c),col);mdTri(B,t,V(c),V(b),V(d),col)}}}
// a copy of the grid moved toward each row's axis (x = 0, z = cz[i]) by d (negative: outward) — linings, outer layers
function gkInset(G,cz,d){return G.map((R,i)=>R.map(v=>{const dx=v.x,dz=v.z-(v.cz!=null?v.cz:cz[i]),L=Math.hypot(dx,dz)||1,k=Math.max(0,L-d)/L;return {x:dx*k,y:v.y,z:(v.cz!=null?v.cz:cz[i])+dz*k,w:v.w,cz:v.cz}}))}
// a tube along points (rigid kit segments, each blended with the weights of its start)
function gkTube(k,pts,r0,r1,col,t,sides){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],u0=i/(pts.length-1),u1=(i+1)/(pts.length-1);
  k.L('head',t||'c',col,[a.x,a.y,a.z],[b.x,b.y,b.z],r0+(r1-r0)*u0,r0+(r1-r0)*u1,sides||5);mdOW(k,a.w)}}
// a smooth tube through points P (each with weights w) with radius rf(t), seg sides (lofted, frames turned along the path)
function gkTubeS(B,P,rf,col,o){o=o||{};const n=P.length,seg=o.seg||7,V=THREE.Vector3,G=[];let U=null;
  for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],tg=new V(b.x-a.x,b.y-a.y,b.z-a.z).normalize();
    let u=U?U.clone():new V(...(o.ref||[1,0,0]));u.sub(tg.clone().multiplyScalar(u.dot(tg)));if(u.lengthSq()<1e-8)u=new V(0,0,1).sub(tg.clone().multiplyScalar(tg.z));u.normalize();U=u;
    const sd=new V().crossVectors(tg,u),r=rf(i/(n-1)),row=[];
    for(let j=0;j<=seg;j++){const a2=j/seg*Math.PI*2,c=Math.cos(a2)*r,s2=Math.sin(a2)*r;row.push({x:P[i].x+u.x*c+sd.x*s2,y:P[i].y+u.y*c+sd.y*s2,z:P[i].z+u.z*c+sd.z*s2,w:P[i].w})}G.push(row)}
  if(o.cap){const L=P[n-1];G.push(G[n-1].map(()=>({x:L.x,y:L.y,z:L.z,w:L.w})))}
  gkSurf(B,G,{t:o.t||'c',col});return G}
// ---------------- measuring what is already built ----------------
// sample points of every triangle built so far whose box reaches y0..y1 (vertices, edges and the inside of big triangles)
// exRe: bone names whose triangles are left out (by the first vertex's strongest bone), e.g. /^(a[LR]|tl|cp)/ for skirts
function gkPts(B,y0,y1,filt,exRe){const out=[];let ex=null;if(exRe){ex=new Set();B.O.forEach((n,i)=>{if(exRe.test(n))ex.add(i)})}
  ['c','m','g'].forEach(t=>{const L=B.L[t];if(!L)return;const p=L.p,si=L.si,sw=L.sw;
  for(let i=0;i<p.length;i+=9){const ay=p[i+1],by=p[i+4],cy=p[i+7];if(Math.max(ay,by,cy)<y0||Math.min(ay,by,cy)>y1)continue;
    if(ex){const v=i/3*4;let bj=0;for(let q=1;q<4;q++)if(sw[v+q]>sw[v+bj])bj=q;if(ex.has(si[v+bj]))continue}
    const ax=p[i],az=p[i+2],bx=p[i+3],bz=p[i+5],cx=p[i+6],cz=p[i+8];
    const e=Math.max(Math.hypot(ax-bx,ay-by,az-bz),Math.hypot(bx-cx,by-cy,bz-cz),Math.hypot(cx-ax,cy-ay,cz-az)),n=Math.max(1,Math.min(8,Math.ceil(e/.012)));
    for(let u=0;u<=n;u++)for(let v=0;v<=n-u;v++){const w=n-u-v,x=(ax*u+bx*v+cx*w)/n,y=(ay*u+by*v+cy*w)/n,z=(az*u+bz*v+cz*w)/n;if(y<y0||y>y1)continue;if(!filt||filt(x,y,z))out.push(x,y,z)}}});
  return out}
// 2-D convex hull (x, z) — monotone chain
function gkHull(P){if(P.length<3)return P.slice();const S=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),L=[],U=[];
  for(const p of S){while(L.length>=2&&cr(L[L.length-2],L[L.length-1],p)<=0)L.pop();L.push(p)}
  for(let i=S.length-1;i>=0;i--){const p=S[i];while(U.length>=2&&cr(U[U.length-2],U[U.length-1],p)<=0)U.pop();U.push(p)}
  U.pop();L.pop();return L.concat(U)}
// distance from (cx, cz) to the hull along direction θ (θ = 0 → +z, π/2 → +x); 0 when the hull is empty
function gkHullR(H,cx,cz,th){if(!H||H.length<3)return 0;const dx=Math.sin(th),dz=Math.cos(th);let best=0;
  for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length],ex=b[0]-a[0],ez=b[1]-a[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)continue;
    const t=((a[0]-cx)*ez-(a[1]-cz)*ex)/den,s=((a[0]-cx)*dz-(a[1]-cz)*dx)/den;if(t>0&&s>=-1e-9&&s<=1+1e-9)best=Math.max(best,t)}return best}
// horizontal sections: rows at heights ys, each the hull of the points within ±h of it
function gkRows(pts,ys,h){const R=ys.map(()=>[]);for(let i=0;i<pts.length;i+=3){const y=pts[i+1];for(let r=0;r<ys.length;r++)if(Math.abs(y-ys[r])<=h)R[r].push([pts[i],pts[i+2]])}
  return R.map(p=>gkHull(p))}
// ---------------- the hero's late builds (after chest, outfit extras and cape) ----------------
function gkLater(B,fn){const S={on:BR.on,R:BR.R,C:BR.C,P:BR.P,feet:BR.feet,mask:BR.mask,rv:typeof RV!='undefined'?RV.helm:null};
  const run=B2=>{const o={on:BR.on,R:BR.R,C:BR.C,P:BR.P,feet:BR.feet,mask:BR.mask};Object.assign(BR,S);try{fn(B2)}finally{Object.assign(BR,o)}};
  if(GKX.late&&GKX.late.B===B)GKX.late.push(run);else run(B)}
{const f=mdHeroB;mdHeroB=function(cls,Lk,E){const o=GKX.late,oE=GKX.E;let L=null;GKX.late=[];GKX.E=E;try{const B=f.apply(this,arguments);L=GKX.late;GKX.late=null;L.B=B;L.forEach(fn=>fn(B));return B}finally{GKX.late=o;GKX.E=oE}}}
// mdB inside a hero build: remember which builder the late list belongs to (nested builds — previews — keep their own)
{const f=mdB;mdB=function(){const B=f.apply(this,arguments);if(GKX.late&&!GKX.late.B)GKX.late.B=B;return B}}

// ---------------- weights for cloth on the head, neck and shoulders ----------------
function gkHeadW(x,y,z,o){o=o||{};const yh=o.yh||1.1,yn=o.yn||1.035,yc=o.yc||.975;let w;
  if(y>=yh)w=[['head',1]];else if(y>=yn)w=mdWb('neck','head',(y-yn)/(yh-yn));else if(y>=yc)w=mdWb('chest','neck',(y-yc)/(yn-yc));else w=[['chest',1]];
  // over the shoulders the mantle follows the upper arm a little (it lies on the pauldron / shoulder)
  const ax=Math.abs(x),a=Math.max(0,Math.min(1,(ax-.1)/.12))*Math.max(0,Math.min(1,(yc+.02-y)/.06))*(o.arm==null?.45:o.arm);
  if(a>0){const bn=x<0?'aL0':'aR0',r=[];w.forEach(q=>r.push([q[0],q[1]*(1-a)]));r.push([bn,a]);w=r}
  return w}
function gkSmooth(a,k,wrap){const n=a.length,o=a.slice();for(let j=0;j<n;j++){const l=a[wrap?(j-1+n)%n:Math.max(0,j-1)],r=a[wrap?(j+1)%n:Math.min(n-1,j+1)];o[j]=a[j]*(1-k)+(l+r)*.5*k}return o}
function gkSS(e0,e1,x){const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t)}

// ---------------- the hood ----------------
// o: col, lin (lining), trim (edge band), edge (rolled edge colour), yHem (hem at the back), yHemF (hem at the front),
//    clear (base clearance), loose (extra looseness, grows downward), crown (extra height over the crown), folds [n, amp],
//    dag [depth] (cut teeth on the hem), open (front stays open below the jaw: angle at the hem), close (y where a closed cowl
//    meets in front of the throat), zf (face edge z, default behind the eyes), over (how far the brim overhangs at the top),
//    tip {len, drop, r} a hanging point at the back, N columns, pat(m,base) a pattern hook
// returns the built rows (for the caller to place ornaments on the cloth)
function gkHood(B,P,o){o=o||{};const D=BR.R,k=dkKit(),N=o.N||30,col=o.col,lin=o.lin==null?mdSh(col,.5):o.lin,trim=o.trim==null?mdSh(col,.78):o.trim;
  const ez=D.EYEP[2],ey=D.EYEP[1],er=D.eyeR||.021,zf=o.zf!=null?o.zf:ez-er-.014,yJaw=o.yJaw||ey-.085,over=o.over==null?.03:o.over;
  const yHem=o.yHem||.9,yHemF=o.yHemF==null?yHem+.05:o.yHemF,clr=o.clear==null?.02:o.clear,loose=o.loose==null?.03:o.loose;
  // what lies in front of the face edge (eyes, muzzle, whiskers, beak) is not measured above the jaw
  const zcut=y=>zf+.012+Math.max(0,yJaw-y)*3;
  const reach=o.reach||.36,pts=gkPts(B,yHem-.05,1.6,(x,y,z)=>z<=zcut(y)&&x*x+z*z<reach*reach);
  let yTop=yHem;for(let i=1;i<pts.length;i+=3)if(pts[i]>yTop)yTop=pts[i];
  const dy=.017,ys=[];for(let y=yHem;y<=yTop+.001;y+=dy)ys.push(y);
  const H=gkRows(pts,ys,dy*.75),nr=ys.length;
  // row centres: the hull's middle (smoothed); radii per column
  let cz=H.map(h=>{if(!h.length)return 0;let a=0;h.forEach(p=>a+=p[1]);return a/h.length});cz=gkSmooth(gkSmooth(cz,.6),.6);
  const TH=j=>j/N*Math.PI*2;const R=H.map((h,i)=>{const r=[];for(let j=0;j<N;j++)r.push(gkHullR(h,0,cz[i],TH(j)));return r});
  // clearance: a little more over the crown and at the back; looseness grows toward the hem
  for(let i=0;i<nr;i++){const y=ys[i],dn=Math.max(0,Math.min(1,(1.1-y)/(1.1-yHem)));for(let j=0;j<N;j++){const th=TH(j),bk=Math.max(0,-Math.cos(th));
    R[i][j]+=clr+loose*dn*(.6+.4*bk)+(o.crown||.012)*Math.max(0,Math.min(1,(y-(ey+.02))/.08))+.008*bk}}
  // the hanging rule: at the back and the sides cloth falls straight from the widest part above
  for(let i=nr-2;i>=0;i--)for(let j=0;j<N;j++){const hg=gkSS(.25,-.25,Math.cos(TH(j)));if(hg>0)R[i][j]=Math.max(R[i][j],R[i][j]*(1-hg)+R[i+1][j]*hg)}
  // folds: soft vertical pleats, deeper toward the hem (the cowl bunches round the neck)
  const fo=o.folds||[7,.012];for(let i=0;i<nr;i++){const y=ys[i],a=fo[1]*Math.max(0,Math.min(1,(1.12-y)/.14));for(let j=0;j<N;j++){const th=TH(j);R[i][j]+=a*(.5+.5*Math.sin(th*fo[0]+.7+y*9))}}
  for(let i=0;i<nr;i++)R[i]=gkSmooth(R[i],.35,true);
  // the face opening: per row the half-angle φ cut out round θ = 0
  const zEdge=y=>zf+over*gkSS(ey,ey+.1,y);
  const radAt=(i,th)=>{const f=(th/(Math.PI*2))*N,j0=Math.floor(f)%N,j1=(j0+1)%N,u=f-Math.floor(f);return R[i][j0]*(1-u)+R[i][j1]*u};
  const phi=ys.map((y,i)=>{if(y>=yJaw){let lo=0;for(let s=0;s<=200;s++){const th=s/200*Math.PI,r=radAt(i,th);if(cz[i]+Math.cos(th)*r<=zEdge(y)){lo=th;break}}
      // rows wholly behind the edge stay closed
      let any=false;for(let j=0;j<N;j++){const th=TH(j);if(cz[i]+Math.cos(th)*R[i][j]>zEdge(y)+.002)any=true}return any?lo:0}
    return null});
  {const q=phi.slice();for(let i=1;i<nr-1;i++)if(q[i]!=null&&q[i]>0&&q[i-1]!=null&&q[i+1]!=null)phi[i]=(q[i-1]+2*q[i]+q[i+1])/4}
  // below the jaw: blend to the hem angle (open) or close the cowl in front of the throat at o.close
  let ja=0,jy=yJaw;for(let i=nr-1;i>=0;i--)if(phi[i]!=null&&phi[i]>0){ja=phi[i];jy=ys[i]}
  for(let i=0;i<nr;i++){if(phi[i]!=null&&ys[i]>=jy)continue;const y=ys[i];
    if(o.open!=null){const t=gkSS(jy,yHem,y);phi[i]=ja+(o.open-ja)*t}else{const yc=o.close||yJaw-.07,t=gkSS(jy,yc,y);phi[i]=ja*(1-t)}}
  // the grid: columns from the left edge round the back to the right edge
  const G=[];for(let i=0;i<nr;i++){const row=[],p=phi[i]||0;for(let j=0;j<=N;j++){const th=p+(Math.PI*2-2*p)*j/N,r=radAt(i,(th+Math.PI*2)%(Math.PI*2)),x=Math.sin(th)*r,z=cz[i]+Math.cos(th)*r;let y=ys[i];
      if(i==0){y=yHem+(yHemF-yHem)*Math.max(0,Math.cos(th));if(o.dag&&j%2==1)y-=o.dag[0]*(.7+.3*Math.abs(Math.sin(j*1.7)))}
      row.push({x,y,z,w:gkHeadW(x,y,z,o.w),cz:cz[i]})}G.push(row)}
  // the top: a soft peak a little up and back from the last row
  {const L=G[G.length-1],pk=o.peak||{h:.03,back:.03},n=3;for(let s=1;s<=n;s++){const t=s/n,sc=1-t*.92,row=L.map(v=>{const x=v.x*sc,z=cz[nr-1]+(v.z-cz[nr-1])*sc-pk.back*t,y=v.y+pk.h*Math.sin(t*Math.PI/2);return {x,y,z,w:[['head',1]],cz:cz[nr-1]-pk.back*t}});G.push(row)}}
  const pat=o.pat;
  const opn=i=>i<nr&&(phi[i]||0)>.03&&(phi[Math.min(nr-1,i+1)]||0)>.03,seam=o.seam==null?mdSh(col,.8):o.seam;
  gkSurf(B,G,{t:'c',col:m=>{const ed=Math.min(m.j,m.n-2-m.j);if(ed<1&&opn(m.i))return trim;if(m.i==0)return o.hemC!=null?o.hemC:mdSh(col,.82);
    if(seam&&Math.abs(m.j-(m.n-2)/2)<.6&&m.i>nr*.35)return seam;return pat?pat(m,col):col}});
  gkSurf(B,gkInset(G,null,.005),{t:'c',col:lin});
  // rolled edge round the face opening
  if(o.edge!==false){const E=[],I=[];for(let i=1;i<nr;i++)if((phi[i]||0)>.03)I.push(i);I.forEach(i=>E.push(G[i][0]));I.slice().reverse().forEach(i=>E.push(G[i][N]));
    const pushOut=v=>{const dx=v.x,dz=v.z-v.cz,L=Math.hypot(dx,dz)||1;return {x:v.x+dx/L*.003,y:v.y,z:v.z+dz/L*.003,w:v.w}};
    gkTube(k,E.map(pushOut),o.er||.006,o.er||.006,o.edge==null?mdSh(trim,1.1):o.edge,'c',5)}
  // a hanging point down the back (liripipe)
  if(o.tip){const T=o.tip,jb=Math.round(N/2),L=T.len||.16,r0=T.r||.03,P2=[];
    // it lies on the hood down the middle of the back, then hangs free below
    for(let i=G.length-2;i>=0;i--){const v=G[i][jb];if(v.y<(G[G.length-1][jb].y-L*.55))break;const dz=v.z-(v.cz!=null?v.cz:0),dx=v.x,Lh=Math.hypot(dx,dz)||1;P2.push({x:v.x+dx/Lh*r0*.8,y:v.y,z:v.z+dz/Lh*r0*.8,w:v.w})}
    if(P2.length>1){const a=P2[P2.length-1];for(let s2=1;s2<=3;s2++)P2.push({x:a.x+(T.x||0)*s2*.3,y:a.y-L*.16*s2,z:a.z-.012*s2,w:a.w});
      gkTubeS(B,P2,t=>r0*(1-t*.85),T.col||col,{t:'c',seg:7,cap:true})}}
  mdKit(B,k);return {G,ys,cz,phi,N,nr,R}}
// a point on the hood's outer surface: row nearest height y, column nearest angle θ (θ = 0 front, π back)
function gkHoodAt(Hd,y,th){let i=0,b=9;Hd.ys.forEach((yy,ii)=>{const d=Math.abs(yy-y);if(d<b){b=d;i=ii}});const p=Hd.phi[i]||0,u=Math.max(0,Math.min(1,(th-p)/(Math.PI*2-2*p)));return Hd.G[i][Math.round(u*Hd.N)]}
