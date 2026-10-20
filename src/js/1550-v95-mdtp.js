// =====================================================================================================
// a point on the torso surface at height y, angle a (0 = front, +π/2 = +x side), pushed out by off
function mdTP(P,y,a,off){const q=mdTorsoAt(P,y),ca=Math.cos(a),sa=Math.sin(a);return [sa*(q.rx+off),y,(q.z||0)+ca*((ca>=0?q.f:q.b)+off)]}
// weights for the last rigid part on k
function mdOW(k,w){k.P[k.P.length-1].w=w;return k}
function mdWL(a,b,t){const m={};a.forEach(q=>m[q[0]]=(m[q[0]]||0)+q[1]*(1-t));b.forEach(q=>m[q[0]]=(m[q[0]]||0)+q[1]*t);
  return Object.entries(m).filter(e=>e[1]>.001).sort((x,y)=>y[1]-x[1]).slice(0,4)}
// ring at position u (fractional index) of a ring list (mdArm / mdLeg)
function mdRAt(R,u){const i=Math.max(0,Math.min(R.length-2,Math.floor(u))),t=Math.max(0,Math.min(1,u-i)),a=R[i],b=R[i+1],L=(x,y)=>x+(y-x)*t;
  return {p:[L(a.p[0],b.p[0]),L(a.p[1],b.p[1]),L(a.p[2],b.p[2])],rx:L(a.rx,b.rx),f:L(a.f,b.f),b:L(a.b,b.b),w:mdWL(a.w,b.w,t),part:t<.5?a.part:b.part}}
// band round a limb at ring position u, half height h, flare fl (lower edge wider)
function mdLB(B,R,u,h,off,col,o){o=o||{};const r=mdRAt(R,u),r0=mdRAt(R,u-.2),r1=mdRAt(R,u+.2),d=new THREE.Vector3(r1.p[0]-r0.p[0],r1.p[1]-r0.p[1],r1.p[2]-r0.p[2]).normalize(),fl=o.fl||0;
  const mk=(sg,e)=>Object.assign({},r,{p:[r.p[0]+d.x*h*sg,r.p[1]+d.y*h*sg,r.p[2]+d.z*h*sg],rx:r.rx+e,f:r.f+e,b:r.b+e});
  mdLoft(B,[mk(-1,0),mk(1,fl)],Object.assign({seg:o.seg||8,off,t:'m',col},o))}
// flat strap / ribbon along points [{p:[x,y,z],n:[nx,ny,nz] outward,w:weights}], width wd, thickness th
function mdRib(B,pts,wd,th,col,o){o=o||{};if(pts.length<2)return;const n=pts[0].n||[0,0,1];
  mdLoft(B,pts.map(q=>({p:q.p,rx:(q.wd||wd)*.707,f:th*1.414,b:th*1.414,w:q.w})),Object.assign({seg:4,rot:Math.PI/4,ref:n,col,t:'c'},o))}
// strap over the torso surface from (y0,a0) to (y1,a1) in n steps (straight in y/angle space)
function mdTStrap(B,P,y0,a0,y1,a1,off,wd,col,o){o=o||{};const n=o.n||8,pts=[];
  for(let i=0;i<=n;i++){const t=i/n,y=y0+(y1-y0)*t,a=a0+(a1-a0)*t;pts.push({p:mdTP(P,y,a,off),n:[Math.sin(a),0,Math.cos(a)],w:mdTorsoW(y)})}
  mdRib(B,pts,wd,o.th||.005,col,o);return pts}
// a tilted loop round the torso (sash / bandolier): centre height yc, tilt amp (y rises toward angle ph)
function mdTLoop(B,P,yc,amp,ph,off,wd,col,o){o=o||{};const n=o.n||20,pts=[];off=Math.min(off,.04); // straps lie on the coat, not on collars
  for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,y=yc+amp*Math.cos(a-ph);pts.push({p:mdTP(P,y,a,off),n:[Math.sin(a),0,Math.cos(a)],w:mdTorsoW(y)})}
  mdRib(B,pts,wd,o.th||.005,col,o);return pts}
// skirt rings (the v94 mdSkirt profile) at fractions ts between y0 and y1
function mdSkW(P,y0){return (x,y)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-.32)))*.9,l=Math.max(0,Math.min(1,.5-x/.16));return d<=0?[['pelvis',1]]:[['pelvis',1-d],['lh0',d*l],['rh0',d*(1-l)]]}}
function mdSkR(P,y0,y1,fl,t,e,dz){const q=mdTorsoAt(P,y0),w0=Math.max(q.rx,.205),f0=Math.max(q.f,.128),b0=Math.max(q.b,.13),y=y0+(y1-y0)*t,k=Math.min(1,t*2.2);e=e||0;
  return {p:[0,y,(q.z||0)+(dz||0)*t],rx:q.rx+(w0-q.rx)*k+fl*t+e,f:q.f+(f0-q.f)*k+fl*.75*t+e,b:q.b+(b0-q.b)*k+fl*.8*t+e,w:[['pelvis',1]],t}}
// skirt piece between fractions ts=[t0,t1,...] (e: extra radius per ring)
function mdSk(B,P,y0,y1,fl,off,ts,o){o=o||{};const R=ts.map((t,i)=>mdSkR(P,y0,y1,fl,t,o.e?o.e[i]:0,o.dz));P.sOff=Math.max(P.sOff||0,off);
  mdLoft(B,R,Object.assign({seg:14,off,wf:mdSkW(P,y0)},o))}
// thin tube along points (edges, chains, laces)
function mdEdge(k,bn,t,col,pts,r){for(let i=0;i<pts.length-1;i++)k.L(bn,t,col,pts[i],pts[i+1],r,r,4)}
// a vertex of a head ring at loft angle index ki (of seg), pushed out by off
function mdHV(Hr,ki,seg,off){const a=Math.PI/2+ki/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);return [-c*(Hr.rx+off),Hr.y==null?Hr.p[1]:Hr.p[1],Hr.p[2]+s*((s>0?Hr.f:Hr.b)+off)]}
// little star (4 points) facing +z
function mdStar(k,bn,t,col,x,y,z,r,w){k.p(bn,'box',t,col,x,y,z,r*.35,r*2,.004,0,0,Math.PI/4).p(bn,'box',t,col,x,y,z,r*2,r*.35,.004,0,0,Math.PI/4);if(w)mdOW(k,w);k.p(bn,'box',t,col,x,y,z+.001,r*.45,r*2.6,.004);if(w)mdOW(k,w);k.p(bn,'box',t,col,x,y,z+.001,r*2.6,r*.45,.004);if(w)mdOW(k,w);return k}
// buckle: frame + inner + tongue, facing +z
function mdBuckle(k,bn,x,y,z,sz,T,inner,w,ry){sz=sz||1;k.p(bn,'box','m',T,x,y,z,.044*sz,.04*sz,.01,0,ry||0,0);if(w)mdOW(k,w);k.p(bn,'box','c',inner,x,y,z+.004,.028*sz,.024*sz,.008,0,ry||0,0);if(w)mdOW(k,w);
  k.p(bn,'box','m',T,x,y,z+.007,.006*sz,.03*sz,.006,0,ry||0,0);if(w)mdOW(k,w);return k}
// pouch on the belt at angle a
function mdPouch(k,P,a,y,col,T,sz){sz=sz||1;const p=mdTP(P,y,a,.02+.02*sz);k.p('pelvis','box','c',col,p[0],p[1],p[2],.06*sz,.07*sz,.04*sz,0,a,0);
  const p2=mdTP(P,y+.022*sz,a,.024+.02*sz);k.p('pelvis','box','c',mdSh(col,.78),p2[0],p2[1],p2[2],.064*sz,.03*sz,.046*sz,0,a,0);
  const p3=mdTP(P,y+.012*sz,a,.048+.02*sz);k.p('pelvis','oct','m',T,p3[0],p3[1],p3[2],.008*sz,.008*sz,.006,0,a,0)}
// sheathed knife / blade on the belt at angle a, tilted
function mdKnife(k,P,a,y,sh,T,tilt){const p=mdTP(P,y,a,.03);k.p('pelvis','box','c',sh,p[0],p[1]-.05,p[2],.024,.11,.014,0,a,tilt||0);
  k.p('pelvis','box','m',T,p[0]-Math.sin(tilt||0)*-.012,p[1]+.012,p[2],.05,.01,.016,0,a,tilt||0);k.p('pelvis','cyl','c',0x241812,p[0]+Math.sin(tilt||0)*-.03,p[1]+.035,p[2],.009,.045,.009,0,a,tilt||0);
  k.p('pelvis','oct','m',T,p[0]+Math.sin(tilt||0)*-.06,p[1]+.062,p[2],.01)}
function mdRotZ(x,y,a){return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]}

// =====================================================================================================
// chest
