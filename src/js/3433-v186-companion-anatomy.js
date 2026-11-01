// ================= v186: companion anatomy, second pass (owner, Nov 1 2026) =================
// Owner: "The modeling for the anatomy needs to be improved and optimized for almost all of them. Example- Foxlet legs are not
// correctly set into it's body, direfang is way too chunky, beaks dont look like one solid piece, boneling and lichbone are way
// too simple." The bodies stay low poly and faceted (no extra ring bands, flat shading).
//  * Limbs set into the body (every quadruped loft): the trunk is found among the lofts (the loft with the most rings along z);
//    a leg's top ring is pulled in under the trunk's flank (it stuck out of the side as a box) and the trunk's lower half is
//    fuller over the legs (a superellipse, as Skollmaw's) so the leg grows out from underneath.
//  * Direfang: a leaner frame (narrower chest and haunches, slimmer legs and neck); the mane keeps its shag.
//  * Beaks are one solid piece: one curved, keeled mandible with a hooked tip that darkens toward the point (was two or three
//    round tubes joined at an angle), on Skyhawk, Stormtalon and Rocsovereign.
//  * Boneling and Lichbone get real skeleton detail: vertebrae along the neck, back and tail, knobbed joint ends, paired
//    forearm bones, a sternum and cheekbones, more teeth.
var AN186={on:true};
// ---------------- limbs set into the trunk ----------------
function an186Trunk(lofts){let best=null,bn=0;lofts.forEach(L=>{const r=L.rings;if(!r||r.length<5||L.ref)return;const dz=Math.abs(r[0].p[2]-r[r.length-1].p[2]);
    if(dz<.25)return;if(r.length>bn&&r.every(q=>Math.abs(q.p[0]||0)<.02)){best=L;bn=r.length}});return best}
function an186At(T,z){const R=T.rings.slice().sort((a,b)=>a.p[2]-b.p[2]);if(z<=R[0].p[2]||z>=R[R.length-1].p[2])return null;let i=0;while(z>R[i+1].p[2])i++;
  const a=R[i],b=R[i+1],t=(z-a.p[2])/(b.p[2]-a.p[2]),l=(u,v)=>u+(v-u)*t,ty=q=>q.ryT==null?q.rx:q.ryT,by=q=>q.ryB==null?q.rx:q.ryB;
  return {y:l(a.p[1],b.p[1]),w:l(a.rx,b.rx),top:l(ty(a),ty(b)),bot:l(by(a),by(b))}}
function an186Seat(lofts){if(!AN186.on)return lofts;const T=an186Trunk(lofts);if(!T)return lofts;const zs=[];
  const out=lofts.map(L=>{if(L===T||!lp186IsLeg(L))return L;const r0=L.rings[0],z=r0.p[2],A=an186At(T,z);if(!A)return L;zs.push(z);
    const x=r0.p[0]||0,s=Math.sign(x)||1,mx=A.w*.84,rx=r0.rx,ext=Math.abs(x)+rx;if(ext<=mx&&r0.p[1]>=A.y-A.bot*.3)return L;
    const k=Math.max(.72,Math.min(1,mx/ext)),nx=s*Math.max(rx*.4,Math.abs(x)*k-(ext*k>mx?ext*k-mx:0)),ny=Math.max(r0.p[1],A.y-A.bot*.25);
    const R=L.rings.slice();R[0]=Object.assign({},r0,{p:[nx,ny,z],rx:rx*Math.max(.8,k)});
    if(R[1]){const r1=R[1];R[1]=Object.assign({},r1,{p:[(r1.p[0]||0)*(.5+.5*k)+nx*(.5-.5*k),r1.p[1],r1.p[2]]})}
    return Object.assign({},L,{rings:R})});
  if(!zs.length)return out;
  // the trunk's lower half fuller over the legs (the flank comes down to meet them)
  const T2=Object.assign({},T,{rings:T.rings.map(q=>{const d=Math.min(...zs.map(z=>Math.abs(z-q.p[2])));if(d>.09||q.sqB)return q;return Object.assign({},q,{sqB:2.4+d*8})})});
  return out.map(L=>L===T?T2:L)}
{const f=lpGeo;lpGeo=function(key,n,lofts,seed){try{if(lp186Comp(key,n)&&!LPG[key]&&!LPG[key+'|lo'])lofts=an186Seat(lofts)}catch(e){console.error('an186 seat',e)}return f.call(this,key,n,lofts,seed)}}
// ---------------- Direfang: a leaner frame ----------------
{const f=lpGeo;lpGeo=function(key,n,lofts,seed){if(!AN186.on||!/^DF150\|/.test(key))return f.apply(this,arguments);
  const L2=lofts.map((L,i)=>{const leg=lp186IsLeg(L);return Object.assign({},L,{rings:L.rings.map(r=>{const z=r.p[2],chest=z>-.05&&z<.42,k=leg?.8:z>=.46?1:z>=.42?.9:chest?.8:.86;
    return Object.assign({},r,{rx:r.rx*k,ryT:r.ryT==null?r.ryT:r.ryT*(leg?.86:z>=.42?1:chest?.9:.94),ryB:r.ryB==null?r.ryB:r.ryB*(leg?.86:z>=.42?1:chest?.88:.94)})})})});
  return f.call(this,key+'|lean',n,L2,seed)}}
{const f=df150Kit;df150Kit=function(k,c,C,red){const p0=k.p,L0=k.L;
  // the mane tufts and the shoulder pieces follow the narrower chest (pulled in toward the centre line by the same factor)
  const sx=a=>[a[0]*.82,a[1]-(a[1]>.6?.012:0),a[2]];
  k.L=function(bn,t,col,a,b,r1,r2,seg){if(bn=='chest'||bn=='neck')return L0.call(k,bn,t,col,sx(a),sx(b),r1*.92,r2,seg);return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,a,b,cc,rx,ry,rz){if(bn=='chest'||bn=='neck')return p0.call(k,bn,geo,t,col,x*.82,y,z,a,b,cc,rx,ry,rz);return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// ---------------- one-piece beaks ----------------
// a curved upper mandible along +z: a keeled, rounded-triangle section, base width w and height h, length L, the hook
// dropping by d over the last third; vertices are tagged for the tip shading (darker toward the point)
var BK186={};
function bk186Geo(L,w,h,d){const key=[L,w,h,d].map(v=>Math.round(v*1000)).join('_');if(BK186[key])return BK186[key];
  const N=9,M=8,P=[],I=[];
  for(let i=0;i<=N;i++){const t=i/N,z=L*t*(1-.12*Math.max(0,t-.6)/.4),drop=t>.55?-d*Math.pow((t-.55)/.45,1.8):0,sw=w*(1-.8*Math.pow(t,1.1))+.002,sh=h*(1-.76*t)+.002,yc=drop+h*.08*(1-t);
    for(let j=0;j<M;j++){const a=j/M*Math.PI*2,c=Math.cos(a),s=Math.sin(a),top=s>0;
      // keel on top (a ridge), flatter underside
      const y=top?s*sh*(1-.25*Math.abs(c))+sh*.12*(1-Math.abs(c)):s*sh*.45;P.push(c*sw,yc+y,z)}}
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*M+j,b=i*M+(j+1)%M,c2=a+M,dd=b+M;I.push(a,b,c2,b,dd,c2)}
  const tip=P.length/3;P.push(0,-d-.004,L+.004);for(let j=0;j<M;j++)I.push(N*M+j,N*M+(j+1)%M,tip);
  const base=P.length/3;P.push(0,h*.15,0);for(let j=0;j<M;j++)I.push((j+1)%M,j,base);
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setIndex(I);G.computeVertexNormals();G.userData.bk186={L};
  return BK186[key]=G}
// darker toward the point (the kit bake hands each part's colour to every vertex; this shades the beak's own range)
{const f=lp186TaperShade;lp186TaperShade=function(meshes,P){f.apply(this,arguments);try{const M=dkM(),m=meshes.find(q=>q.material===M.c);if(!m)return;const G=m.geometry;if(G.userData.bk186s)return;G.userData.bk186s=1;
  const C=G.attributes.color;let off=0;P.filter(p=>p.t==='c').forEach(p=>{const g=p.geo,n=g.attributes.position.count;if(g.userData&&g.userData.bk186){const pa=g.attributes.position,L=g.userData.bk186.L||1;
      for(let i=0;i<n;i++){const t=Math.max(0,Math.min(1,pa.getZ(i)/L)),k=1-.55*Math.pow(t,1.6);C.setXYZ(off+i,C.getX(off+i)*k,C.getY(off+i)*k,C.getZ(off+i)*k)}}off+=n});C.needsUpdate=true}catch(e){}}}
// replace the jointed tube beaks in the three bird kits: the centre-line tube pieces on head / jaw that run forward from in
// front of the cere are dropped and one mandible (and one lower mandible) put in their place, in the colours they had
function bk186Wrap(fn,B){return function(k,c,C,red,G,O){const L0=k.L;let up=null,lo=null;
  k.L=function(bn,t,col,a,b){if((bn=='head'||bn=='jaw')&&!a[0]&&!b[0]&&a[2]>B.z0&&b[2]>a[2]){if(bn=='head'){if(up==null)up=col}else if(lo==null)lo=col;return k}return L0.apply(k,arguments)};
  let r;try{r=fn.apply(this,arguments)}finally{k.L=L0}
  if(up!=null){k.p('head',bk186Geo(B.L,B.w,B.h,B.d),'c',up,0,B.y,B.z,1,1,1);k.p('jaw',bk186Geo(B.L*.52,B.w*.7,B.h*.36,0),'c',lo==null?dkShade(up,1.3):lo,0,B.y-B.h*.62,B.z+.002,1,1,1)}
  return r}}
if(AN186.on&&typeof bd184KitSky=='function'){
  bd184KitSky=bk186Wrap(bd184KitSky,{z0:.47,L:.1,w:.034,h:.042,d:.046,y:.872,z:.474});
  bd184KitSt=bk186Wrap(bd184KitSt,{z0:.49,L:.11,w:.032,h:.038,d:.05,y:.884,z:.494});
  bd184KitRs=bk186Wrap(bd184KitRs,{z0:.485,L:.14,w:.056,h:.062,d:.08,y:.9,z:.484})}
// ---------------- Boneling / Lichbone: skeleton detail ----------------
// (in the Foxlet template space, mapped with boneP like the rest of their kits)
function an186Bones(k,bone,dark,o){const P=boneP,B=(bn,col,p,sx,sy,sz,rx,ry,rz,geo)=>{const q=P(p);k.p(bn,geo||'box','c',col,q[0],q[1],q[2],sx,sy,sz,rx,ry,rz)},
    L=(bn,col,a,b,r1,r2)=>k.L(bn,'c',col,P(a),P(b),r1,r2,5);o=o||{};const bD=dkShade(bone,.86);
  // vertebrae: a disc with a spinous process for each, along the neck, back and tail
  const V=o.lich?[[.4,.675,'neck'],[.34,.68,'neck'],[.28,.678,'chest']]:[[.42,.585,'neck'],[.38,.58,'neck'],[.33,.575,'neck'],[.28,.57,'chest']];
  V.forEach((q,i)=>{const bn=q[2],y=q[1];B(bn,i%2?bone:bD,[0,y,q[0]],.028,.024,.018,0,0,0,'cyl');B(bn,bD,[0,y+.02,q[0]-.005],.008,.02,.012,-.4,0,0,'cone4')});
  if(!o.lich)[[.15,.565,'chest'],[.08,.562,'chest'],[.01,.56,'spine'],[-.06,.557,'spine'],[-.13,.555,'pelvis']].forEach((q,i)=>B(q[2],i%2?bone:bD,[0,q[1],q[0]],.03,.02,.02,Math.PI/2,0,0,'cyl'));
  [[-.33,.535,'tail0'],[-.4,.525,'tail0'],[-.47,.515,'tail1'],[-.54,.505,'tail1'],[-.62,.495,'tail1'],[-.7,.485,'tail2']]
    .forEach((q,i)=>{if(o.lich&&q[0]<-.62)return;const r=.026-i*.002;B(q[2],i%2?bone:bD,[0,q[1],q[0]],r,r*.8,.014,Math.PI/2,0,0,'cyl')});
  // knobbed joint ends on every leg bone (the ends of each shaft), and a second, thinner forearm bone
  [-1,1].forEach(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr';
    [[F+'0',.1,.36,.21,.026],[F+'1',.1,.235,.22,.03],[F+'1',.1,.19,.215,.022],[F+'2',.1,.08,.205,.022]].forEach(q=>B(q[0],bD,[s*q[1],q[2],q[3]],q[4],q[4]*.8,q[4],0,0,0,'sph'));
    [[H+'0',.112,.4,-.23,.03],[H+'1',.114,.29,-.2,.032],[H+'1',.112,.24,-.21,.024],[H+'2',.112,.11,-.25,.024]].forEach(q=>B(q[0],bD,[s*q[1],q[2],q[3]],q[4],q[4]*.8,q[4],0,0,0,'sph'));
    L(F+'1',bD,[s*.115,.205,.228],[s*.112,.095,.212],.011,.01);
    // cheekbones and the back of the lower jaw
    if(!o.lich){L('head',bD,[s*.07,.6,.49],[s*.055,.585,.6],.012,.01);L('jaw',bD,[s*.045,.53,.48],[s*.05,.56,.44],.012,.01)}});
  // a sternum keel under the ribs and two more teeth each side
  if(!o.lich){B('chest',bD,[0,.345,.2],.018,.03,.14,0,0,0);[-1,1].forEach(s=>[.775,.755].forEach((z,i)=>B('head',0xe8dfc4,[s*(.024-i*.004),.537,z-.24*0],.006,.024,.007,Math.PI,0,0,'cone4')))}}
{const D=LPR.Boneling,k0=D.kit;D.kit=function(k,c,C,red){const r=k0.apply(this,arguments);try{if(!AN186.on)return r;const sp=rv137('Boneling',c);
    if(sp=='Boneling'){const K=boneCols(C);an186Bones(k,K.bone.getHex(),K.dark.getHex())}
    else{const K=LB150.cols(C);an186Bones(k,K.bone.getHex(),K.dark.getHex(),{lich:1})}}catch(e){console.error('an186 bones',e)}return r}}
