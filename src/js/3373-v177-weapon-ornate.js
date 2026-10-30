// ================= v177: weapons grow more ornate with every tier =================
// Owner (Oct 30 2026): weapons "very cool and unique ... even more elaborate and ornate as you level up". Every weapon and shield
// kit (base, v137 and unique) gets a tier layer measured from its own geometry, after it is built and before loose pieces are
// attached (gf176Kit):
//   tier I    as forged: nothing added
//   tier II   a pommel cap and metal bands on the grip / haft; bows: bands round the riser; shields: rim studs
//   tier III  a collar where the head meets the haft (or langets at the guard), a pommel gem, a dark fuller inlay down blades;
//             bows: horn-and-blade limb tips; shields: a filigree ring round the boss
//   tier IV   a crown of spikes on the pommel, filigree curls at the base of the blade / head, a spiked collar
//   tier V    glowing runes down the blade or haft, a chain with a charm hanging from the pommel; shields: rim spikes
// The weapon frame is the usual one (grip at the origin, head down -y); measurements: the radius of the kit at each height
// (its profile), the pommel top, where the head starts, the blade's thickness.
var W176={on:1,
  T:[0x5a4a3c,0x6e7076,0x8a6a3a,0xa8aeb8,0xc8a050],gl:{warrior:0xff5a1a,paladin:0xffd890,assassin:0xa060ff,ranger:0x7aff8a,mage:0x6ab8ff}};
function w176Pts(k){const v=new THREE.Vector3(),P=[];k.P.forEach(p=>{const g=p.geo;if(!g||!g.attributes||!g.attributes.position)return;const pa=g.attributes.position;for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);P.push([v.x,v.y,v.z])}});return P}
// profile along y: radius (in x/z) of everything near the axis, 1 cm steps
function w176Prof(P,ax){const R=new Map();P.forEach(p=>{if(Math.abs(p[0])>(ax||.5)||Math.abs(p[2])>(ax||.5))return;const y=Math.round(p[1]*100),r=Math.hypot(p[0],p[2]);const o=R.get(y);if(o==null||r>o)R.set(y,r)});return R}
function w176Kit(k,it){if(!W176.on)return;const t=itT(it);if(!t)return;const ti=Math.max(0,Math.min(4,t.t|0));if(ti<1)return;const r=it.r|0,cls=t.cls||'warrior',T=W176.T[ti],T2=mdSh(T,.72),
  gl=r>=3||ti>=4?(W176.gl[cls]||0xffd890):null,wt=t.sl=='offhand'?'shield':String(t.wt||''),P=w176Pts(k);if(P.length<8)return;const n0=k.P.length;
  const stud=(x,y,z,s,c)=>k.p('','oct','m',c||T,x,y,z,s,s*1.2,s);
  const spike=(a,dir,len,rad,c)=>{const l=Math.hypot(...dir);k.L('','m',c||T,a,[a[0]+dir[0]/l*len,a[1]+dir[1]/l*len,a[2]+dir[2]/l*len],rad,rad*.06,5)};
  const ring=(y,rad,th,c)=>k.p('','ring','m',c||T,0,y,0,rad,th||.18,rad);
  if(wt=='shield'){// the face is the thin axis; studs round the rim, filigree round the boss, spikes at the rim
    const bb=new THREE.Box3();P.forEach(p=>bb.expandByPoint(new THREE.Vector3(...p)));const sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3());
    const ax=sz.x<sz.y&&sz.x<sz.z?0:sz.y<sz.z?1:2,u=(ax+1)%3,v=(ax+2)%3;
    [-1,1].forEach(face=>{const fz=face>0?bb.max.getComponent(ax):bb.min.getComponent(ax);
      // rim points: the farthest vertex in each of 16 directions in the face plane
      const N=ti>=2?16:10;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,du=Math.cos(a),dv=Math.sin(a);let best=null,bd=-1e9;
        P.forEach(p=>{const d=(p[u]-c.getComponent(u))*du+(p[v]-c.getComponent(v))*dv;if(d>bd){bd=d;best=p}});if(!best)continue;
        const q=[0,0,0];q[u]=c.getComponent(u)+du*(bd-.025);q[v]=c.getComponent(v)+dv*(bd-.025);
        // the face height at that spot: the farthest vertex along the face normal near it
        let h=null;P.forEach(p=>{if(Math.hypot(p[u]-q[u],p[v]-q[v])<.03){const z=p[ax]*face;if(h==null||z>h)h=z}});if(h==null)continue;q[ax]=h*face;
        const s=[0,0,0];s[ax]=1;const st=k.p('','oct','m',T,q[0],q[1],q[2],.012,.012,.012);
        if(ti>=4&&face>0&&i%2==0){const a2=[q[0],q[1],q[2]],dir=[0,0,0];dir[u]=du;dir[v]=dv;dir[ax]=.25*face;spike(a2,dir,.06,.012,T2)}}
      if(ti>=3){// a filigree ring round the centre of the face, and a gem
        let h=null;P.forEach(p=>{if(Math.hypot(p[u]-c.getComponent(u),p[v]-c.getComponent(v))<.05){const z=p[ax]*face;if(h==null||z>h)h=z}});if(h==null)return;
        const pts=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,rr=.085+Math.sin(a*6)*.012,q=[0,0,0];q[u]=c.getComponent(u)+Math.cos(a)*rr;q[v]=c.getComponent(v)+Math.sin(a)*rr;
          let hh=null;P.forEach(p=>{if(Math.hypot(p[u]-q[u],p[v]-q[v])<.025){const z=p[ax]*face;if(hh==null||z>hh)hh=z}});q[ax]=(hh==null?h:hh)*face+face*.002;pts.push(q)}
        for(let i=0;i<pts.length-1;i++)k.L('','m',T,pts[i],pts[i+1],.004,.004,4);
        if(face>0){const g=[0,0,0];g[u]=c.getComponent(u);g[v]=c.getComponent(v);g[ax]=h*face+face*.01;k.p('','oct',gl?'g':'m',gl||T,g[0],g[1],g[2],.02,.02,.02)}}});
    return}
  if(/bow|sling/.test(wt)){// bows: the riser is where the frame is thickest near y = 0; limb tips are the highest / lowest points
    let top=null,bot=null;P.forEach(p=>{if(!top||p[1]>top[1])top=p;if(!bot||p[1]<bot[1])bot=p});
    if(wt=='bow'){let rx=0,rn=0;P.forEach(p=>{if(Math.abs(p[1])<.05&&p[0]<-.3){rx+=p[0];rn++}});rx=rn?rx/rn:-.555;
      [.07,-.07].forEach(y=>k.p('','cyl','m',T,rx,y,0,.024,.014,.024));
      if(ti>=3)[top,bot].forEach((q,i)=>{const s=i?-1:1;k.L('','c',0xd8ccb0,q,[q[0]-.02,q[1]+s*.05,q[2]],.01,.002,5);if(ti>=4)spike([q[0]-.005,q[1]-s*.04,q[2]],[-1,s*.4,0],.05,.008,T2)});
      if(ti>=3){k.p('','box','m',T2,rx-.016,0,0,.008,.12,.03);stud(rx-.022,0,0,.012)}
      if(ti>=4&&gl)k.p('','oct','g',gl,rx-.03,0,0,.01,.016,.01)}
    else if(wt=='crossbow'){// the prod's ends and the stock's butt
      let L=null,R=null;P.forEach(p=>{if(!L||p[0]<L[0])L=p;if(!R||p[0]>R[0])R=p});ring(top[1]-.02,.04,.2);
      if(ti>=3)[L,R].forEach((q,i)=>{const s=i?1:-1;k.L('','c',0xd8ccb0,q,[q[0]+s*.04,q[1]-.02,q[2]],.01,.002,5)});
      if(ti>=4)[L,R].forEach((q,i)=>{const s=i?1:-1;spike([q[0]-s*.02,q[1],q[2]],[s,.5,0],.05,.008,T2)});if(ti>=4&&gl)k.p('','oct','g',gl,0,top[1]-.06,.04,.012)}
    else{if(ti>=2)stud(0,0,0,.02);if(ti>=4&&gl)k.p('','oct','g',gl,0,.02,.02,.01)}
    return}
  if(wt=='orb'){// a metal band round the orb and, higher up, a crown of claws round its top
    let c=[0,0,0],n=0;P.forEach(p=>{c[0]+=p[0];c[1]+=p[1];c[2]+=p[2];n++});c=c.map(x=>x/n);let rad=0;P.forEach(p=>{rad=Math.max(rad,Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2]))});rad=Math.min(rad,.2);
    let rr=0;P.forEach(p=>{if(Math.abs(p[1]-c[1])<.012)rr=Math.max(rr,Math.hypot(p[0]-c[0],p[2]-c[2]))});if(rr<.02)return;
    k.p('','ring','m',T,c[0],c[1],c[2],rr*.98,.2,rr*.98);
    if(ti>=3)for(let i=0;i<6;i++){const a=i/6*Math.PI*2,b=[c[0]+Math.cos(a)*rr*.97,c[1],c[2]+Math.sin(a)*rr*.97];stud(b[0],b[1],b[2],.009)}
    if(ti>=4){let ty=-1e9;P.forEach(p=>{if(Math.hypot(p[0]-c[0],p[2]-c[2])<rr*.5)ty=Math.max(ty,p[1])});for(let i=0;i<5;i++){const a=i/5*Math.PI*2,b=[c[0]+Math.cos(a)*rr*.95,c[1],c[2]+Math.sin(a)*rr*.95];k.L('','m',T,b,[c[0]+Math.cos(a)*rr*.45,ty+.02,c[2]+Math.sin(a)*rr*.45],.005,.0015,4)}}
    return}
  // ---- axial weapons: swords, axes, maces, hammers, flails, halberds, daggers, knives, claws, staves, wands ----
  const prof=w176Prof(P,.6);let topY=-1e9;P.forEach(p=>{if(Math.abs(p[0])<.05&&Math.abs(p[2])<.05&&p[1]>topY)topY=p[1]});if(topY<-.5)return;
  const rAt=y=>{let b=0;for(let d=-1;d<=1;d++){const v=prof.get(Math.round(y*100)+d);if(v!=null&&v>b)b=v}return b};
  // the grip / haft radius: the smallest radius between the top and 12 cm below the origin
  let hr=1;for(let y=Math.min(topY-.03,.02);y>-.12;y-=.01){const v=rAt(y);if(v>.008&&v<hr)hr=v}if(hr>.08)hr=.03;
  // the head starts where the profile first grows past 2.2× the haft, going down from the origin
  let yH=null;for(let y=-.02;y>-1.5;y-=.01){if(rAt(y)>hr*2.2&&rAt(y-.02)>hr*2.2){yH=y;break}}
  const blade=/gs|dagger|knives|claws/.test(wt);
  // tier II: a pommel cap and two bands
  {const rp=rAt(topY-.012);if(rp>.006)ring(topY-.012,rp+.002,.22);
    if(wt!='claws'){const bands=blade?[Math.min(topY-.05,.05),-.02]:[Math.min(topY-.06,.0),(yH!=null?Math.max(yH+.18,-.5):-.25)];bands.forEach(y=>{const rr=rAt(y);if(rr>.008&&rr<.07)k.p('','cyl','m',T,0,y,0,rr+.004,.016,rr+.004)})}}
  if(ti<3)return;
  // tier III: a collar at the head (langets up the haft), a pommel gem, a fuller inlay down blades
  if(yH!=null&&!blade){const rc=Math.min(rAt(yH+.03),hr*1.8);if(rc>.006&&rc<.08){k.p('','cyl','m',T,0,yH+.025,0,rc+.006,.03,rc+.006);[0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>k.p('','box','m',T2,Math.cos(a)*(rc+.003),yH+.09,Math.sin(a)*(rc+.003),.008,.12,.008,0,-a,0))}}
  k.p('','oct',gl?'g':'m',gl||T2,0,topY+.008,0,.014,.022,.014);
  if(blade&&wt!='claws'&&yH!=null){// the blade's thickness at its centre line, 30% of the way down
    let yb=-1e9;P.forEach(p=>{if(p[1]<yb||yb==-1e9)yb=Math.min(yb==-1e9?0:yb,p[1])});let ymin=0;P.forEach(p=>{if(p[1]<ymin)ymin=p[1]});
    const y0=yH-.05,y1=yH+(ymin-yH)*.72;let th=0;P.forEach(p=>{if(Math.abs(p[0])<.008&&p[1]<y0&&p[1]>y1)th=Math.max(th,Math.abs(p[2]))});
    if(th>.002&&th<.03)[-1,1].forEach(s=>k.p('','box','c',0x0e0c0a,0,(y0+y1)/2,s*(th-.0005),.008,Math.abs(y0-y1),.003))}
  if(ti<4)return;
  // tier IV: a crown of spikes round the pommel, filigree curls at the base of the head / blade, a spiked collar
  {const rp=rAt(topY-.02)||.03;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;spike([Math.cos(a)*rp*.8,topY-.015,Math.sin(a)*rp*.8],[Math.cos(a),.9,Math.sin(a)],.035,.006,T)}}
  if(yH!=null){const yc=blade?yH-.02:yH+.005,rc=blade?(rAt(yc)||.04):Math.min(rAt(yH+.03)||.04,hr*1.8);
    if(blade){// curls on both faces of the blade's base
      let th=0;P.forEach(p=>{if(Math.abs(p[0])<.02&&Math.abs(p[1]-(yc-.06))<.02)th=Math.max(th,Math.abs(p[2]))});if(th>0&&th<.04)[-1,1].forEach(f=>[-1,1].forEach(s=>{const pts=[];for(let i=0;i<=14;i++){const tt=i/14,rr=.03*(1-tt*.8),a=tt*Math.PI*2.2;pts.push([s*(.012+rr*Math.cos(a)*.6+tt*.01),yc-.04-rr*Math.sin(a)-tt*.04,f*(th+.0015)])}
        for(let i=0;i<pts.length-1;i++)k.L('','m',T,pts[i],pts[i+1],.0028,.0022,4)}))}
    else for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;spike([Math.cos(a)*(rc+.004),yH+.025,Math.sin(a)*(rc+.004)],[Math.cos(a),-.2,Math.sin(a)],.04,.008,T2)}}
  // tier V (legendary or tier V): glowing runes and a charm on a chain from the pommel
  if(gl){let ymin=0;P.forEach(p=>{if(p[1]<ymin)ymin=p[1]});const y0=(yH!=null?yH:-.1)-.06,y1=y0+(ymin-y0)*.6,n=5;
    for(let i=0;i<n;i++){const y=y0+(y1-y0)*i/(n-1);let th=0;P.forEach(p=>{if(Math.abs(p[0])<.01&&Math.abs(p[1]-y)<.012)th=Math.max(th,Math.abs(p[2]))});if(th<=0||th>.06)continue;[-1,1].forEach(s=>k.p('','box','g',gl,0,y,s*(th+.001),.006,.018,.002,0,0,i%2?.6:-.6))}}
  {const a=[0,topY-.015,(rAt(topY-.015)||.02)+.002],b=[a[0],a[1]-.06,a[2]+.01];gkChain(k,'',[a,b],.005,T,null);gkSkull(k,'',b[0],b[1]-.018,b[2],.55,cls=='paladin'?0xd8b050:0xd0c4a4,0,null)}}
// after the weapon is built (inside the outermost kit builder, before gf176Kit attaches loose pieces)
['v89WpnKit','unqWpnKit135'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(k,it){const o=W176.kd|0;W176.kd=o+1;try{return f.apply(this,arguments)}finally{W176.kd=o;if(!o)try{w176Kit(k,it)}catch(e){console.warn('v177 weapon ornate',e)}}}});
