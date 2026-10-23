// ================= v137: Gloomcap and Sporelord rebuilt =================
// The v81 Gloomcap was a tall 7-sided tube under a 9-sided lid with a tiny face, and Sporelord was the same body in teal.
// Gloomcap is now a plump little toadstool: a pear-shaped stem with a soft belly, a broad drooping cap (20 sides, a thick
// curled rim, radial gills underneath, raised warts), a face under the brim that moves with the cap (big glowing eyes in
// dark sockets, cheeks, a toothy mouth whose lower lip rides the jaw bone, so bites open it), a tattered skirt (annulus),
// stubby mossy arms with nub fingers and root feet that splay into toes.
// Sporelord (same rig, its own body) is a tall morel lord: a ridged honeycomb cone of a cap, a lace veil hanging from under
// it round the stem (like a veiled stinkhorn), layered shelf fungi on the shoulders like pauldrons, amber eyes.
// Both keep the SPEC.Gloomcap skeleton and its waddle; their evolution looks (EVO100.D.Gloomcap) are rebuilt for the new shapes.
// ---------------- rig variants: several species on one skeleton, each with its own body ----------------
// RV137.var[rig] lists the species that share a rig; the first is the default. While a model of that rig is built,
// RV137.cur[rig] holds the species, the colour key gets the variant index in its low bits (so the body, kit and evolution
// caches never mix two variants), and the evolution rays use that variant's own body.
var RV137={var:{Gloomcap:['Gloomcap','Sporelord'],Wispling:['Wispling','Lumenwisp','Soulwarden']},cur:{}};
function rv137(n,c){const L=RV137.var[n];if(!L)return null;const s=c&&c.g&&c.g[0],i=L.indexOf(s);if(i>0)return s;if(i<0&&RV137.cur[n])return RV137.cur[n];return L[0]}
function rv137I(n,sp){const L=RV137.var[n];return L?Math.max(0,L.indexOf(sp)):0}
{const f=lpRig;lpRig=function(c,n,D){if(!RV137.var[n]||!c||!c.cl)return f.apply(this,arguments);const sp=rv137(n,c),o=RV137.cur[n];RV137.cur[n]=sp;
  const C=c.cl[0]|0,c2=Object.create(c);c2.cl=c.cl.slice();c2.cl[0]=(C&0xfffffc)|rv137I(n,sp);
  try{return f.call(this,c2,n,D)}finally{RV137.cur[n]=o}}}
{const f=evo100Surf;evo100Surf=function(n){const sp=RV137.cur[n];if(!sp||!rv137I(n,sp))return f.apply(this,arguments);const k=n+'|'+sp;
  if(!EVO100.surf[k]){const D=LPR[n],C=0x808080|rv137I(n,sp),G=D.geo(C,{g:[sp],cl:[C],v:'',tr:'',f:0,z:1,evo:0}),pa=G.attributes.position.array,I=G.index.array,T=new Float32Array(I.length*3);
    for(let t=0;t<I.length;t++){T[t*3]=pa[I[t]*3];T[t*3+1]=pa[I[t]*3+1];T[t*3+2]=pa[I[t]*3+2]}
    EVO100.surf[k]={P:pa,T:T,I:I,N:G.attributes.normal.array,SI:G.attributes.skinIndex.array,SW:G.attributes.skinWeight.array,O:Object.keys(SPEC[n].bones)}}return EVO100.surf[k]}}
{const f=evo100Pal;evo100Pal=function(c,n,L){const P=f.apply(this,arguments),sp=RV137.cur[n];if(sp)P.bone=P.bone^rv137I(n,sp);return P}}
// the old surface caches were made from the v81 bodies: drop them
if(EVO100.surf){delete EVO100.surf.Gloomcap;delete EVO100.surf.Wispling}
function gc137Sp(c){return rv137('Gloomcap',c)}
// the cap profile: [y, radius] from the rim's lower edge up to the top
var GC137_CAP={Gloomcap:[[.765,.375],[.79,.4],[.835,.39],[.9,.355],[.965,.295],[1.02,.21],[1.065,.115],[1.09,.04],[1.095,.008]],
  Sporelord:[[.775,.29],[.81,.305],[.88,.29],[.96,.26],[1.04,.215],[1.12,.16],[1.19,.1],[1.24,.04],[1.255,.006]]};
function gc137CapR(sp,y){const C=GC137_CAP[sp];if(y<=C[0][0])return C[0][1];for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1];if(y<=b[0]){const t=(y-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t}}return 0}
function gc137CapY(sp,r){const C=GC137_CAP[sp];for(let i=C.length-1;i>0;i--){const a=C[i],b=C[i-1];if(r<=b[1]){const t=(r-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*t}}return C[0][0]}
LPR.Gloomcap={
  head:['head',0,1.02,0],up:.09,
  back:[['head',0,1.0,0],['head',.18,.92,-.08],['head',-.18,.92,-.08],['head',0,.93,-.2]],
  geo(C,c){const sp=gc137Sp(c),spore=sp=='Sporelord';
    const cap=lpMain(C,.12),capD=cap.clone().multiplyScalar(.5),capL=cap.clone().lerp(new THREE.Color(0xe8d8c0),.28),stalk=new THREE.Color(spore?0xd8ccb0:0xd8c8a8),stalkD=new THREE.Color(spore?0xa89a80:0xa8967a),
      dirt=new THREE.Color(0x3a2c20),gill=new THREE.Color(spore?0x4a3a2a:0x4a2430),root=new THREE.Color(0x3a2c20),moss=new THREE.Color(0x4a5a2a);
    const R=(y,rx,f,bk,b,o)=>Object.assign({p:[0,y,0],rx,ryT:f,ryB:bk,b},o||{});
    // the stem: wide soft base, belly in front, narrowing to the cap; the top (the face) rides the head bone
    const st=spore?[R(.03,.12,.115,.115,['pelvis','pelvis',0]),R(.09,.15,.15,.14,['pelvis','pelvis',0]),R(.18,.165,.17,.155,['pelvis','pelvis',0]),R(.3,.155,.16,.145,['pelvis','spine',.4]),
        R(.42,.14,.145,.13,['spine','spine',0]),R(.52,.13,.135,.122,['spine','chest',.6]),R(.6,.12,.128,.115,['chest','head',.45]),R(.67,.112,.122,.108,['chest','head',.85]),R(.73,.104,.108,.1,['head','head',0]),R(.79,.094,.096,.09,['head','head',0])]
      :[R(.03,.13,.12,.12,['pelvis','pelvis',0]),R(.08,.175,.17,.16,['pelvis','pelvis',0]),R(.16,.2,.21,.18,['pelvis','pelvis',0]),R(.26,.195,.205,.175,['pelvis','spine',.3]),
        R(.36,.175,.18,.16,['spine','spine',0]),R(.46,.155,.158,.145,['spine','chest',.6]),R(.55,.14,.145,.13,['chest','head',.3]),R(.62,.132,.138,.124,['chest','head',.75]),R(.68,.124,.13,.118,['head','head',0]),R(.73,.114,.118,.11,['head','head',0]),R(.78,.102,.104,.098,['head','head',0])];
    const lofts=[{rings:st,seg:16,ref:[0,0,1],capA:1,paint:(o,r,s,cc)=>{o.copy(stalk);if(s<-.3)o.lerp(stalkD,.35);if(Math.abs(Math.sin((cc+s)*7+r.p[1]*30))>.86)o.lerp(stalkD,.4);
        const t=Math.max(0,(.2-r.p[1])*5);if(t>0)o.lerp(dirt,Math.min(.75,t));if(r.p[1]>.5&&s<-.2)o.lerp(capD,.25)}}];
    // the skirt (annulus): a tattered collar hanging under the cap
    lofts.push({rings:[R(.735,.117,.121,.113,['head','head',0]),R(.715,.14,.144,.134,['head','head',0],{j:.1}),R(.7,.152,.155,.146,['head','head',0],{j:.16})],seg:16,ref:[0,0,1],
      paint:(o,r,s)=>{o.copy(stalk).multiplyScalar(.92);if(r.p[1]<.71)o.lerp(stalkD,.45)}});
    // the cap: the curled rim, then the dome; a separate underside (gill disc) from the stem to the rim
    const CP=GC137_CAP[sp];lofts.push({rings:CP.map(([y,r],i)=>R(y,r,r,r,['head','head',0],{i,j:i<2?.05:0})),seg:20,ref:[0,0,1],capB:1,
      paint:(o,r,s,cc,i)=>{o.copy(cap);if(i<=1)o.lerp(capD,.4);else if(i==2)o.lerp(capL,.25);if(i>=5)o.lerp(capD,.3);
        if(spore)o.lerp(capD,.45)}});
    lofts.push({rings:[R(CP[0][0]+.04,.09,.09,.09,['head','head',0]),R(CP[0][0]+.03,.2,.2,.2,['head','head',0]),R(CP[0][0]+.017,CP[0][1]*.82,CP[0][1]*.82,CP[0][1]*.82,['head','head',0]),R(CP[0][0]+.005,CP[0][1]-.004,CP[0][1]-.004,CP[0][1]-.004,['head','head',0])],
      seg:20,ref:[0,0,1],paint:(o,r)=>{o.copy(gill);if(r.rx>.3)o.lerp(capD,.4)}});
    // stubby root legs ending in splayed feet
    ['hl','hr'].forEach((k,i)=>{const x=i?.085:-.085;lofts.push({rings:[R(.24,.075,.075,.075,['pelvis',k+'0',.5]),R(.15,.072,.072,.072,[k+'0',k+'1',.5]),R(.07,.07,.07,.07,[k+'1',k+'2',.6]),R(.02,.088,.095,.08,[k+'2',k+'2',0])].map(r=>(r.p[0]=x,r)),
      seg:9,ref:[0,0,1],capB:1,paint:(o,r)=>{o.copy(root);if(r.p[1]>.12)o.lerp(stalkD,.5)}})});
    // short mossy arms
    ['fl','fr'].forEach((k,i)=>{const s=i?1:-1;lofts.push({rings:[{p:[s*.12,.54,.02],rx:.05,b:['chest',k+'0',.5]},{p:[s*.17,.47,.05],rx:.042,b:[k+'0',k+'1',.6]},{p:[s*.195,.4,.08],rx:.037,b:[k+'1',k+'2',.7]},{p:[s*.2,.355,.09],rx:.03,b:[k+'2',k+'2',0]}],
      seg:7,ref:[0,0,1],capB:1,paint:(o,r,s2)=>{o.copy(stalk).lerp(moss,.25);if(s2<0)o.lerp(moss,.35)}})});
    return lpGeo('GC137|'+sp+'|'+C,'Gloomcap',lofts,37)},
  kit(k,c,C,red){const sp=gc137Sp(c),spore=sp=='Sporelord',cap=lpMain(C,.12).getHex(),capL=new THREE.Color(cap).lerp(new THREE.Color(0xe8d8c0),.5).getHex(),eye=red?0xff2a2a:spore?0xffb040:0xb8ff6a,
      soc=0x0a0607,stalk=spore?0xd8ccb0:0xd8c8a8,gl=spore?0x3a2a1c:0x3a1a22;
    // radial gills under the cap
    {const rm=GC137_CAP[sp][0][1]-.02,r=(rm+.1)/2,L=rm-.1;for(let i=0;i<30;i++){const a=i/30*Math.PI*2;k.p('head','box','c',i%2?gl:mdSh(gl,1.25),Math.sin(a)*r,GC137_CAP[sp][0][0]+.02,Math.cos(a)*r,.005,.022,L,0,a,0)}}
    if(!spore){// raised warts on the dome, bigger toward the top
      const W=[[0,.06,.03],[.14,-.08,.04],[-.13,.1,.035],[.2,.12,.032],[-.22,-.08,.03],[.05,-.22,.034],[-.06,.22,.032],[.26,-.02,.026],[-.27,.04,.026],[.1,.27,.024],[-.18,-.22,.026],[.22,-.2,.024],[-.02,-.3,.022],[.31,.13,.02],[-.3,.17,.02]];
      W.forEach(([x,z,s])=>{const r=Math.hypot(x,z),y=gc137CapY(sp,r),n=new THREE.Vector3(x,(y-.62)*1.2,z).normalize();
        k.p('head','dod','c',capL,x*1.01,y+.008,z*1.01,s,s*.5,s,Math.atan2(n.z,n.y),0,-Math.atan2(n.x,n.y))})}
    else{// the morel's raised ridges: rings round the cone and ribs down it
      for(let j=0;j<5;j++){const y=.84+j*.085,r=gc137CapR(sp,y)+.004,n=16;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,a2=(i+1)/n*Math.PI*2;
        k.L('head','c',mdSh(cap,1.12),[Math.sin(a)*r,y,Math.cos(a)*r],[Math.sin(a2)*r,y,Math.cos(a2)*r],.009,.009,4)}}
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.3;for(let j=0;j<5;j++){const y0=.8+j*.085,y1=y0+.085,r0=gc137CapR(sp,y0)+.004,r1=gc137CapR(sp,y1)+.004,a1=a+(j%2?.12:-.12);
        k.L('head','c',mdSh(cap,1.12),[Math.sin(a)*r0,y0,Math.cos(a)*r0],[Math.sin(a1)*r1,y1,Math.cos(a1)*r1],.008,.008,4)}}}
    // the face under the brim (head bone): sockets, glowing eyes, brows, cheeks, the mouth (lower lip on the jaw)
    const fz=y=>y>.7?.122:y>.64?.132:.14;
    [-1,1].forEach(s=>{const y=spore?.66:.675,z=fz(y)-.012;
      k.p('head','sph','c',soc,s*.052,y,z,.042,.035,.022,0,s*.35,0);k.p('head','sph','g',eye,s*.054,y,z+.012,.03,.024,.01,0,s*.35,0);
      k.p('head','sph','g',0xffffff,s*.047,y+.008,z+.02,.006,.006,.004);
      k.p('head','box','c',spore?0x6a5a40:0x5a4234,s*.055,y+.034,z+.006,.05,.012,.02,0,s*.3,s*-.35);
      k.p('head','sph','c',spore?0xd8b898:0xe0a8a0,s*.088,y-.045,z-.01,.026,.018,.014,0,s*.6,0)});
    {const y=spore?.6:.61,z=fz(y);k.p('head','box','c',0x140808,0,y,z-.004,.08,.022,.02);for(let i=-3;i<=3;i++)if(i)k.p('head','cone4','c',0xece4cc,i*.0105,y+.006,z+.004,.004,.014,.004,Math.PI);
      k.p('jaw','box','c',stalk,0,y-.016,z+.002,.086,.014,.022);for(let i=-2;i<=2;i++)k.p('jaw','cone4','c',0xece4cc,i*.013,y-.008,z+.006,.004,.012,.004)}
    // nub fingers and root toes
    [['fl2',-.2],['fr2',.2]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'c',0x5a5030,[f[1],.355,.09],[f[1]+i*.02,.31,.11+Math.abs(i)*-.005],.014,.006,4)));
    [['hl2',-.085],['hr2',.085]].forEach(f=>[-1.5,-.5,.5,1.5].forEach(i=>k.L(f[0],'c',0x2a2018,[f[1]+i*.025,.02,.04],[f[1]+i*.045,.006,.12],.02,.005,4)));
    if(spore){// the lace veil (indusium) hanging round the stem from under the cap, shelf fungi on the shoulders
      const vr=y=>({.69:.15,.6:.18,.5:.2,.4:.21,.3:.215}[y]),Y=[.69,.6,.5,.4,.3],N=14,bn=y=>y>.62?'head':y>.5?'chest':y>.36?'spine':'pelvis',lace=0xe8e0c8;
      for(let j=0;j<Y.length-1;j++)for(let i=0;i<N;i++){const a=(i+(j%2?.5:0))/N*Math.PI*2,aL=a-Math.PI/N,aR=a+Math.PI/N,y0=Y[j],y1=Y[j+1],r0=vr(y0),r1=vr(y1);
        const p0=[Math.sin(a)*r0,y0,Math.cos(a)*r0];[aL,aR].forEach(a2=>k.L(bn(y0),'c',lace,p0,[Math.sin(a2)*r1,y1,Math.cos(a2)*r1],.004,.004,3))}
      [-1,1].forEach(s=>{for(let i=0;i<3;i++){const y=.56-i*.04,x=s*(.15+i*.012);k.p('chest','hem','c',i%2?0xb88a4a:0x8a5a2a,x,y,-.02,.08-i*.012,.022,.07-i*.01,0,0,-s*.25);
        k.p('chest','tor','c',0xe0c080,x,y-.004,-.02,.082-i*.012,.006,.072-i*.01,0,0,-s*.25)}})}
  }};
// ---------------- evolution looks for the new bodies ----------------
EVO100.D.Gloomcap={glow:0xb8ff6a,build(E,L,P,c){const sp=RV137.cur.Gloomcap=='Sporelord'?'Sporelord':'Gloomcap',spore=sp=='Sporelord',hb={bn:'head'},stalk=spore?0xd8ccb0:0xd8c8a8,shelf=0xb89a6a,shelfD=0x7a5a3a,
    rim=GC137_CAP[sp][0][1],rimY=GC137_CAP[sp][0][0],capTop=(x,z)=>{const r=Math.hypot(x,z);return gc137CapY(sp,r)};
  const bracket=(a,y,sz)=>{const h=E.on([Math.sin(a)*.5,y,Math.cos(a)*.5],[-Math.sin(a),0,-Math.cos(a)]);if(!h)return;
    E.pd('hem','c',shelfD,E.add(h.p,h.n,sz*.2),[0,1,0],[sz,sz*.4,sz*.85]);E.pd('hem','c',shelf,E.add(E.add(h.p,h.n,sz*.15),[0,sz*.25,0]),[0,1,0],[sz*.8,sz*.3,sz*.7])};
  // L1: glowing veins along the gills, two bracket fungi on the back of the stem
  for(let i=0;i<12;i++){const a=i/12*6.283+.13;E.L([Math.sin(a)*.11,rimY+.035,Math.cos(a)*.11],[Math.sin(a)*(rim-.04),rimY+.008,Math.cos(a)*(rim-.04)],.007,.004,'g',P.glow,3,hb)}
  bracket(Math.PI-.6,.34,.06);bracket(Math.PI+.7,.24,.05);
  if(L>=2){// little toadstools sprouting from the cap, glowing spots
    [[.16,.05],[-.14,-.1],[.03,-.21],[-.18,.13]].forEach((q,i)=>{const y=capTop(q[0],q[1]),b=[q[0],y,q[1]],tp=E.add(b,E.nrm([q[0],1,q[1]]),.06+i%2*.02);
      E.L(b,tp,.014,.011,'c',stalk,4,hb);E.pd('hem','c',i%2?P.mainD:P.main,tp,E.nrm([q[0],1,q[1]]),[.042,.03,.042],null,hb);E.pd('sph','c',0xe8dcc0,E.add(tp,[0,.024,0]),[0,1,0],[.01,.005,.01],null,hb)});
    for(let i=0;i<12;i++){const a=i/12*6.283,r=rim*.7,x=Math.sin(a)*r,z=Math.cos(a)*r;E.pd('sph','g',P.glowD,[x,capTop(x,z)+.004,z],E.nrm([x,.6,z]),[.016,.005,.016],null,hb)}
    bracket(Math.PI*.5+2.8,.44,.05)}
  if(L>=3){// moss and roots hanging from the rim at the back and sides (the face stays clear), root tendrils down the back
    for(let i=0;i<14;i++){const a=Math.PI*.42+i/13*Math.PI*1.16,p=[Math.sin(a)*(rim-.01),rimY+.005,Math.cos(a)*(rim-.01)],len=.08+((i*7)%4)*.025;
      E.L(p,E.add(p,[Math.sin(a)*.025,-len,Math.cos(a)*.025]),.026,.004,'c',i%3?0x3a4a26:0x4a3a26,4,hb);if(i%4==1)E.pd('sph','g',P.glow,E.add(p,[Math.sin(a)*.025,-len,Math.cos(a)*.025]),[0,1,0],.012,null,hb)}
    [-1,1].forEach(s=>E.chain([[s*.05,.64,-.11],[s*.07,.46,-.16],[s*.06,.32,-.17],[s*.08,.18,-.15]],.016,.006,'c',0x3a2c20,4))}
  if(L>=4){// a crown of spore stalks with glowing bulbs, glow motes on the cap, a gilded band round the stem
    for(let i=0;i<5;i++){const a=i/5*6.283,x=Math.sin(a)*.08,z=Math.cos(a)*.08,b=[x,capTop(x,z),z],tip=E.add(b,E.nrm([Math.sin(a)*.35,1,Math.cos(a)*.35]),.14+(i%2)*.05);
      E.L(b,tip,.014,.008,'c',stalk,4,hb);E.pd('sph','g',i%2?P.glow:P.glow2,tip,[0,1,0],[.028,.022,.028],null,hb)}
    for(let i=0;i<8;i++){const a=i*.8+.4,r=.13+(i%3)*.06,x=Math.cos(a)*r,z=Math.sin(a)*r;E.pd('ico','g',P.glow,[x,capTop(x,z)+.008,z],E.nrm([x,.6,z]),.014,null,hb)}
    E.band([0,.36,0],[0,1,0],.006,.009,'m',P.trim,12)}
  if(L>=5){// the rim glows, a second ring of tiny caps
    for(let i=0;i<20;i++){const a=i/20*6.283,a2=(i+1)/20*6.283,r=rim+.012;E.L([Math.sin(a)*r,rimY+.012,Math.cos(a)*r],[Math.sin(a2)*r,rimY+.012,Math.cos(a2)*r],.01,.01,'g',P.glow,3,hb)}
    [[.21,-.06],[-.06,.21],[-.2,-.13]].forEach(q=>{const b=[q[0],capTop(q[0],q[1]),q[1]];E.L(b,E.add(b,E.nrm([q[0],1,q[1]]),.035),.008,.006,'c',stalk,4,hb);E.pd('hem','g',P.glowD,E.add(b,E.nrm([q[0],1,q[1]]),.035),E.nrm([q[0],1,q[1]]),[.022,.016,.022],null,hb)})}
}};
