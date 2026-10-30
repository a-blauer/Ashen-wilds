// ================= v136: gear kit — skirts, coats, collars, sleeves and trinkets =================
// gkSkirt: a robe / coat / tabard skirt that hangs from the waist. Measured like the hood (legs, hips, armour below the
//   waist; the tail left out), the cloth never narrows going down (it hangs, it doesn't wrap the legs), flares to the hem
//   with soft pleats, and its hem can be longer at the back, dagged, open at the front (coats) or split at the back for a
//   tail. Weights: hips + each thigh by side (looser than the v94 skirt, so it swings instead of sticking to the legs) and, at
//   the back, the cape bones (cp1, cp2): running lifts the back of a robe or the tails of a coat behind the hero.
// gkCollar: a standing collar round the neck, taller at the back. gkSleeve: a sleeve widening along the forearm into a bell,
//   with a trailing point. Trinkets: skulls, books, vials, candles, chains, scrolls, bones, feathers, runes, spikes.
// skirt angle convention: θ = 0 front, π/2 the hero's right (+x), π back
function gkSkW(y0,lw){return (x,y)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-.32)))*.9*lw,l=Math.max(0,Math.min(1,.5-x/.16));return d<=0?[['pelvis',1]]:[['pelvis',1-d],['lh0',d*l],['rh0',d*(1-l)]]}}
function gkSkirt(B,P,o){o=o||{};const D=BR.on?BR.R:null,N=o.N||36,y0=o.y0||.6,hem=typeof o.hem=='function'?o.hem:(()=>o.hem||.3),clr=o.clear==null?.016:o.clear,
    fl=o.flare||0,lw=o.legW==null?.8:o.legW,nt=o.rows||10,TH=j=>j/N*Math.PI*2;
  let ymin=y0;for(let j=0;j<N;j++)ymin=Math.min(ymin,hem(TH(j)));ymin-=o.dag?o.dag[0]:0;
  const pts=gkPts(B,ymin-.02,y0+.03,(x,y,z)=>x*x+z*z<.45*.45&&!(D&&D.TP&&brTailNear(D,x,y,z))&&!(o.skip&&o.skip(x,y,z)),o.exB||/^(a[LR]|tl\d|cp\d)/);
  const dy=.015,ys=[];for(let y=y0;y>=ymin-.001;y-=dy)ys.push(y);if(ys[ys.length-1]>ymin)ys.push(ymin);
  const H=gkRows(pts,ys,dy*.7),q0=mdTorsoAt(P,y0),cz0=(q0.z||0)+(o.dz||0);
  // radius per bin and column, never narrower than the bin above (the cloth hangs)
  const RB=H.map(h=>{const r=[];for(let j=0;j<N;j++)r.push(gkHullR(h,0,cz0,TH(j)));return r});
  for(let i=1;i<RB.length;i++)for(let j=0;j<N;j++)RB[i][j]=Math.max(RB[i][j],RB[i-1][j]);
  // the top bin: at least the torso (+ what is already worn) at the waist
  for(let j=0;j<N;j++){const th=TH(j),c=Math.cos(th),r0=Math.hypot(Math.sin(th)*(q0.rx+(P.tOff||0)),c*((c>0?q0.f:q0.b)+(P.tOff||0)));for(let i=0;i<RB.length;i++)RB[i][j]=Math.max(RB[i][j],r0)}
  const rAt=(y,j)=>{const f=(y0-y)/dy,i=Math.max(0,Math.min(RB.length-1,Math.floor(f))),i2=Math.min(RB.length-1,i+1),u=Math.max(0,Math.min(1,f-i));return RB[i][j]*(1-u)+RB[i2][j]*u};
  const fo=o.folds||[9,.01],flow=o.flow==null?.35:o.flow,ph=o.ph||.4,wf=gkSkW(y0,lw);
  const G=[];for(let i=0;i<=nt;i++){const t=i/nt,row=[];for(let j=0;j<=N;j++){const jj=j%N,th=TH(j),c=Math.cos(th);let y=y0+(hem(th)-y0)*t;
      if(i==nt&&o.dag&&j%2==1)y-=o.dag[0]*(.65+.35*Math.abs(Math.sin(j*2.3)));
      const tt=Math.max(0,(y0-y)/(y0-ymin+1e-6)),r=rAt(Math.max(ymin,y),jj)+clr+fl*Math.pow(tt,1.35)*(1+(o.backF||0)*Math.max(0,-c))+fo[1]*tt*(.5+.5*Math.sin(th*fo[0]+ph))*(1+.6*Math.sin(th*3+1.1));
      const x=Math.sin(th)*r,z=cz0+c*r;let w=wf(x,y);
      // the back of the skirt follows the cape bones (running lifts it behind)
      const fb=flow*gkSS(-.15,-.75,c)*Math.min(1,tt*1.3);if(fb>0){const cb=y>.47?'cp1':'cp2';w=w.map(q=>[q[0],q[1]*(1-fb)]);w.push([cb,fb])}
      row.push({x,y,z,w,cz:cz0,th,t:i/nt})}G.push(row)}
  P.sOff=Math.max(P.sOff||0,clr);
  const op=o.open||0,sl=o.slit||0,slY=o.slitY==null?9:o.slitY;
  const keep=m=>{const th=m.u*Math.PI*2;if(op&&(th<op||th>Math.PI*2-op))return false;if(sl&&Math.abs(th-Math.PI)<sl&&m.y<slY)return false;
    if(D&&D.TP&&!o.noTail&&brTailNear(D,m.x,m.y,m.z))return false;return !o.keep||o.keep(m)};
  gkSurf(B,G,{t:o.t||'c',col:o.col,keep});
  if(o.lin!=null)gkSurf(B,gkInset(G,G.map(()=>cz0),.004),{t:'c',col:o.lin,keep});
  return {G,N,nt,cz:cz0,at:(t,th)=>{const j=Math.round(((th%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*N),i=Math.round(t*nt);return G[Math.max(0,Math.min(nt,i))][j]}}}
// a standing collar from y0 up to h(θ) (θ = 0 front), open at the front over |θ| < open; flares by fl at the top
function gkCollar(B,P,o){o=o||{};const N=o.N||28,y0=o.y0||.94,h=typeof o.h=='function'?o.h:(()=>o.h||1.06),clr=o.clear==null?.012:o.clear,fl=o.flare==null?.03:o.flare,TH=j=>j/N*Math.PI*2,nt=o.rows||5;
  let ymax=y0;for(let j=0;j<N;j++)ymax=Math.max(ymax,h(TH(j)));
  const ez=BR.on&&BR.R?BR.R.EYEP[2]-.03:.05,pts=gkPts(B,y0-.01,ymax+.02,(x,y,z)=>x*x+z*z<.3*.3&&(y<1.06||z<ez));
  const dy=.014,ys=[];for(let y=y0;y<=ymax+.001;y+=dy)ys.push(y);const H=gkRows(pts,ys,dy*.75);
  const RB=H.map(hh=>{const r=[];for(let j=0;j<N;j++)r.push(gkHullR(hh,0,0,TH(j)));return r});
  for(let i=RB.length-2;i>=0;i--)for(let j=0;j<N;j++)RB[i][j]=Math.max(RB[i][j],RB[i+1][j]*.92);
  const rAt=(y,j)=>{const f=(y-y0)/dy,i=Math.max(0,Math.min(RB.length-1,Math.round(f)));return RB[i][j]};
  const G=[];for(let i=0;i<=nt;i++){const t=i/nt,row=[];for(let j=0;j<=N;j++){const th=TH(j),jj=j%N,y=y0+(h(th)-y0)*t,r=rAt(y,jj)+clr+fl*t*t+(o.wave?o.wave*t*Math.max(0,Math.sin(th*(o.wn||6))):0);
      const x=Math.sin(th)*r,z=Math.cos(th)*r;row.push({x,y,z,w:y>1.0?mdWb('chest','neck',Math.min(.5,(y-1.0)/.12)):[['chest',1]],cz:0})}G.push(row)}
  const op=o.open||0,keep=m=>{const th=m.u*Math.PI*2;return !(op&&(th<op||th>Math.PI*2-op))};
  gkSurf(B,G,{t:o.t||'c',col:o.col,keep});gkSurf(B,gkInset(G,G.map(()=>0),.004),{t:o.t||'c',col:o.lin==null?mdSh(typeof o.col=='function'?0x444444:o.col,.6):o.lin,keep});
  return {G,N,nt}}
// a sleeve along arm s from ring position u0 to the wrist (uw), then on past it along the forearm by ext metres, plus trail
// metres on the side θ = ta round the arm (0 = front, π = back): a bell (extra radius bl at the end) with a trailing point;
// off (base offset), folds, dag (metres cut off every other column at the end); weights: the arm rings, the end the forearm
function gkSleeve(B,P,s,o){o=o||{};const R=mdArm(P,s),N=o.N||16,u0=o.u0==null?2.6:o.u0,uw=o.uw==null?5.3:o.uw,bl=o.bell||0,tr=o.trail||0,ta=o.ta==null?Math.PI:o.ta,ex=o.ext==null?.015:o.ext,
    off=o.off==null?.012:o.off,nA=o.rowsA||5,nB=o.rowsB||4,V=THREE.Vector3;
  const frame=u=>{const r=mdRAt(R,u),ra=mdRAt(R,Math.max(0,u-.25)),rb=mdRAt(R,u+.25),tg=new V(rb.p[0]-ra.p[0],rb.p[1]-ra.p[1],rb.p[2]-ra.p[2]).normalize(),ref=new V(0,0,1);
    ref.sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize();return {r,c:new V(...r.p),tg,ref,sd:new V().crossVectors(tg,ref)}};
  const Fw=frame(uw),wEnd=mdRAt(R,Math.min(uw,5.15)).w,base=u=>{const r=mdRAt(R,u);return Math.max(r.rx,r.f,r.b,o.minR||0)+off},rw=base(uw);
  const A0=new V(...mdRAt(R,u0).p),Lw=A0.distanceTo(Fw.c),end=th=>ex+tr*Math.pow(Math.max(0,Math.cos(th-ta)),2);
  const G=[];for(let i=0;i<=nA+nB;i++){const row=[];for(let j=0;j<=N;j++){const th=j/N*Math.PI*2,c=Math.cos(th),sn=Math.sin(th)*s;let F,cp,rad,w,prog;
      if(i<=nA){const u=u0+(uw-u0)*i/nA;F=frame(u);cp=F.c;w=F.r.w;prog=A0.distanceTo(cp)/(Lw+end(th))}
      else{let e=end(th)*(i-nA)/nB;if(i==nA+nB&&o.dag&&j%2==1)e=Math.max(0,e-o.dag);F=Fw;cp=Fw.c.clone().add(Fw.tg.clone().multiplyScalar(e));w=wEnd;prog=(Lw+e)/(Lw+end(th))}
      rad=(i<=nA?base(u0+(uw-u0)*i/nA):rw)+bl*Math.pow(Math.min(1,prog),1.7)+(o.folds||0)*prog*(.5+.5*Math.sin(th*5+i*.7));
      const p=cp.clone().add(F.ref.clone().multiplyScalar(c*rad)).add(F.sd.clone().multiplyScalar(sn*rad));row.push({x:p.x,y:p.y,z:p.z,w,c:cp})}G.push(row)}
  gkSurf(B,G,{t:o.t||'c',col:o.col});
  if(o.lin!=null)gkSurf(B,G.map(row=>row.map(v=>{const d=new V(v.x,v.y,v.z).sub(v.c),L=d.length()||1;d.multiplyScalar(Math.max(0,L-.004)/L).add(v.c);return {x:d.x,y:d.y,z:d.z,w:v.w}})),{t:'c',col:o.lin});
  return G}
// ---------------- trinkets (dkKit parts; w = blended weights for the part, or null for the bone alone) ----------------
function gkW(k,w){if(w)mdOW(k,w);return k}
// a small skull facing +z turned ry: cranium, cheekbones, dark sockets, nose hole, jaw with teeth
function gkSkull(k,bn,x,y,z,s,col,ry,w,t){const c=col||0xd8ccb0,dk=0x14100c,R=(dx,dy,dz)=>{const a=ry||0;return [x+dx*Math.cos(a)+dz*Math.sin(a),y+dy,z-dx*Math.sin(a)+dz*Math.cos(a)]},T=t||'c';
  let p=R(0,.012*s,0);gkW(k.p(bn,'sph2',T,c,p[0],p[1],p[2],.032*s,.03*s,.034*s,0,ry||0,0),w);
  p=R(0,-.012*s,.014*s);gkW(k.p(bn,'box',T,mdSh(c,.92),p[0],p[1],p[2],.04*s,.022*s,.026*s,0,ry||0,0),w);
  [-1,1].forEach(q=>{p=R(q*.012*s,.002*s,.03*s);gkW(k.p(bn,'oct','c',dk,p[0],p[1],p[2],.008*s,.009*s,.004*s,0,ry||0,0),w)});
  p=R(0,-.012*s,.04*s);gkW(k.p(bn,'cone4','c',dk,p[0],p[1],p[2],.004*s,.008*s,.003*s,Math.PI,ry||0,0),w);
  p=R(0,-.03*s,.008*s);gkW(k.p(bn,'box',T,mdSh(c,.85),p[0],p[1],p[2],.03*s,.01*s,.022*s,0,ry||0,0),w);
  for(let i=0;i<4;i++){p=R((-.009+i*.006)*s,-.024*s,.03*s);gkW(k.p(bn,'box',T,mdSh(c,1.05),p[0],p[1],p[2],.0035*s,.006*s,.003*s,0,ry||0,0),w)}return k}
// a book (cover, pages, metal corners and clasp) standing upright, spine toward -x when ry = 0
function gkBook(k,bn,x,y,z,s,col,T,ry,w,rz){const a=ry||0,b=rz||0;gkW(k.p(bn,'box','c',col,x,y,z,.05*s,.07*s,.022*s,0,a,b),w);
  gkW(k.p(bn,'box','c',0xd8ccb0,x+.002*Math.cos(a),y,z-.002*Math.sin(a),.046*s,.064*s,.024*s,0,a,b),w);
  gkW(k.p(bn,'box','m',T,x,y,z+.0125*s*Math.cos(a),.012*s,.012*s,.004,0,a,b),w);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([q,r])=>gkW(k.p(bn,'box','m',T,x+q*.022*s*Math.cos(a)+.0115*s*Math.sin(a),y+r*.032*s,z-q*.022*s*Math.sin(a)+.0115*s*Math.cos(a),.008*s,.008*s,.003,0,a,b),w));return k}
// a corked vial of glowing liquid
function gkVial(k,bn,x,y,z,s,glow,T,w){gkW(k.p(bn,'cyl','g',glow,x,y,z,.011*s,.03*s,.011*s),w);gkW(k.p(bn,'sph','g',glow,x,y-.016*s,z,.014*s,.012*s,.014*s),w);
  gkW(k.p(bn,'cyl','c',0x8a6a40,x,y+.02*s,z,.006*s,.012*s,.006*s),w);gkW(k.p(bn,'cyl','m',T,x,y+.013*s,z,.009*s,.004*s,.009*s),w);return k}
// a candle stub with wax drips and a flame
function gkCandle(k,bn,x,y,z,s,w,fl){gkW(k.p(bn,'cyl','c',0xe8e0c8,x,y,z,.01*s,.035*s,.01*s),w);for(let i=0;i<3;i++){const a=i*2.1;gkW(k.p(bn,'box','c',0xf0e8d4,x+Math.sin(a)*.009*s,y-.006*s-i*.004*s,z+Math.cos(a)*.009*s,.004*s,.016*s,.004*s),w)}
  gkW(k.p(bn,'cyl','c',0x1a1410,x,y+.02*s,z,.0015,.006*s,.0015),w);gkW(k.p(bn,'cone4','g',fl||0xffb040,x,y+.03*s,z,.005*s,.016*s,.005*s),w);return k}
// chain of links along points (each point [x,y,z]); wf(i) → weights or null
function gkChain(k,bn,pts,r,col,wf){let n=0;const n0=k.P.length;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),m=Math.max(1,Math.round(L/(r*1.8)));// v177: links overlap (they were 2.6 r apart, 2.24 r long: none touched)
    // v177: each link lies along the chain, every other one turned a quarter round it, so neighbours hook through each other and touch
    // (the old rotation laid every other link flat across the chain, where it touched nothing)
    const V=THREE.Vector3,D=new V(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize(),qd=new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),D),qr=new THREE.Quaternion().setFromAxisAngle(new V(1,0,0),Math.PI/2);
    for(let j=0;j<m;j++){const t=(j+.5)/m,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],qa=new THREE.Quaternion().setFromAxisAngle(new V(0,1,0),(n++%2)*Math.PI/2),q=qd.clone().multiply(qa).multiply(qr);
      k.P.push({bn,geo:dkG().ring,t:'m',col,m:new THREE.Matrix4().compose(new V(p[0],p[1],p[2]),q,new V(r,r*1.6,r))});if(wf)gkW(k,wf(p))}}if(typeof gf176Group=='function')gf176Group(k,n0);return k}
// a rolled scroll with end caps (horizontal along x when ry = 0)
function gkScroll(k,bn,x,y,z,s,T,ry,w){gkW(k.p(bn,'cyl','c',0xe0d4b4,x,y,z,.012*s,.07*s,.012*s,0,ry||0,Math.PI/2),w);[-1,1].forEach(q=>gkW(k.p(bn,'cyl','m',T,x+q*.037*s*Math.cos(ry||0),y,z-q*.037*s*Math.sin(ry||0),.015*s,.006*s,.015*s,0,ry||0,Math.PI/2),w));
  gkW(k.p(bn,'box','c',0x8a1a1a,x,y,z+.012*s,.008*s,.024*s,.003),w);return k}
// a bone (shaft + knobs) between two points
function gkBone(k,bn,a,b,r,col,w){const c=col||0xd8ccb0;k.L(bn,'c',c,a,b,r,r*.8,5);gkW(k,w);[a,b].forEach(p=>{gkW(k.p(bn,'sph','c',mdSh(c,1.05),p[0],p[1],p[2],r*1.6,r*1.4,r*1.6),w)});return k}
// a feather from base along dir (flat, vane colour col, a darker shaft)
function gkFeather(k,bn,base,dir,len,wd,col,w){const V=THREE.Vector3,d=new V(...dir).normalize(),tip=[base[0]+d.x*len,base[1]+d.y*len,base[2]+d.z*len],mid=[(base[0]+tip[0])/2,(base[1]+tip[1])/2,(base[2]+tip[2])/2];
  const q=new THREE.Quaternion().setFromUnitVectors(new V(0,1,0),d),e=new THREE.Euler().setFromQuaternion(q);gkW(k.p(bn,'oct','c',col,mid[0],mid[1],mid[2],wd,len*.5,.002,e.x,e.y,e.z),w);
  gkW(k.L(bn,'c',mdSh(col,.6),base,tip,.0025,.001,3),w);return k}
// a spike from base along dir
function gkSpike(k,bn,base,dir,len,r,col,t,w){const tip=[base[0]+dir[0]*len,base[1]+dir[1]*len,base[2]+dir[2]*len];gkW(k.L(bn,t||'m',col,base,tip,r,r*.08,5),w);return k}
// glowing rune marks in a strip (each a small bar or chevron)
function gkRunes(k,bn,pts,col,w,sz){pts.forEach((p,i)=>{const s=sz||1,v=i%3;if(v==0)gkW(k.p(bn,'box','g',col,p[0],p[1],p[2],.004*s,.018*s,.003,0,p[3]||0,0),w);
  else if(v==1){gkW(k.p(bn,'box','g',col,p[0]-.003*s,p[1],p[2],.003*s,.014*s,.003,0,p[3]||0,.5),w);gkW(k.p(bn,'box','g',col,p[0]+.003*s,p[1],p[2],.003*s,.014*s,.003,0,p[3]||0,-.5),w)}
  else gkW(k.p(bn,'oct','g',col,p[0],p[1],p[2],.006*s,.009*s,.003,0,p[3]||0,0),w)});return k}
// a point on the torso surface with its weights and the angle (for kit parts): {p, w, a}
function gkTP(P,y,a,off){return {p:mdTP(P,y,a,(P.tOff||0)+(off||0)),w:mdTorsoW(y),a}}
