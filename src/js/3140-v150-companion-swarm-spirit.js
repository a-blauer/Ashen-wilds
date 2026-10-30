// ================= v150: Widowqueen, Hivemother and Lichbone get their own bodies =================
// The owner: "Some of our companions are just reskinned versions of lower tiered companions. Redo those ones and give them
// original models." Widowqueen (tier 4) and Hivemother (tier 5) were the tier 2 Cryptspider in red and in amber, and
// Lichbone (tier 4) was the tier 2 Boneling in purple. Each now has its own body on the SAME skeleton (rig variants,
// RV137 in 2600: same bones, same walk / attack animation, same gameplay), so only the look changes:
//  * Widowqueen - a regal black widow: a huge glossy black abdomen raised high with a big red hourglass on its back, a
//    narrow waist, a small sleek head under a crown of red-tipped spines, and long thin arching legs (the thigh rises
//    to a high peak before the leg drops to the ground) with red bands at the joints.
//  * Hivemother - a bloated brood-mother: low and heavy, a broad armoured head with big sickle mandibles and a brow
//    plate over a cluster of amber eyes, an armoured thorax, banded armour plates behind the waist, then a long
//    swollen pale egg sac (dark plates stretched apart on top, veins, glowing eggs bulging through) that slowly
//    pulses, with spiderlings clinging to it; short, thick, spiked legs.
//  * Lichbone - a lich hound: a horned, crowned skull held higher than the Boneling's (heavy brow, ram horns, an iron
//    and gold crown), a tattered robe draped over hunched shoulders and a hide over the hips with rags hanging down,
//    a deep open ribcage holding a caged glowing phylactery, spectral flame in place of flesh (a flame mane on the
//    neck, flames round the paws, a short tail ending in a flame plume) and hide wraps on the legs.
// The base species (Cryptspider, Boneling) and the enemies that use these rigs keep their bodies exactly as before:
// the old geo / kit run unchanged unless the model being built is one of the new variants.
// Their evolution looks (EVO100.D.Cryptspider / Boneling, levels 1-5) get a variant version drawn for the new shapes;
// the base species keep the old designs. The variant / trait extras (Ember flames, Spiked, Horned ...) use per-variant
// back and head points so they sit on the new bodies.
RV137.var.Cryptspider=['Cryptspider','Widowqueen','Hivemother'];RV137.var.Boneling=['Boneling','Lichbone'];
if(EVO100.surf){delete EVO100.surf.Cryptspider;delete EVO100.surf.Boneling}
// ---------------- shared helpers ----------------
// interpolate a ring table [[z,y,rx,ryT,ryB],...] (sorted by z) at z
function v150At(T,z){if(z<=T[0][0])return T[0];for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(z<=b[0]){const t=(z-a[0])/(b[0]-a[0]);return a.map((v,j)=>v+(b[j]-v)*t)}}return T[T.length-1]}
// point on that table's surface at z and angle a (0 = +x side, pi/2 = top), pushed out by o
function v150Surf(T,z,a,o){const q=v150At(T,z),s=Math.sin(a),c=Math.cos(a),ry=s>0?q[3]:q[4];return [c*(q[2]+(o||0)),q[1]+s*(ry+(o||0)),z]}
function v150Lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
// a leg loft through points P[] (radius r[], bones b[], joint flags j[])
function v150Leg(P,r,b,j,paint,seg){return {rings:P.map((p,i)=>({p,rx:r[i],ryT:r[i],ryB:r[i],b:b[i],jt:j?j[i]:0,lg:i/(P.length-1)})),seg:seg||6,ref:[0,0,1],capA:1,capB:1,paint}}

// ===================================================================== Cryptspider rig: Widowqueen, Hivemother =====================================================================
var CS150={
  // Widowqueen: abdomen [z,y,rx,ryT,ryB] (front to back reversed below), cephalothorax + head
  wqAb:[[-.92,.62,.02,.02,.02],[-.89,.63,.09,.09,.08],[-.83,.65,.18,.19,.17],[-.75,.67,.25,.26,.24],[-.65,.685,.3,.31,.29],[-.54,.69,.33,.335,.31],
    [-.43,.685,.335,.33,.3],[-.33,.665,.31,.3,.27],[-.25,.635,.26,.25,.22],[-.19,.6,.19,.18,.15],[-.15,.56,.11,.1,.08]],
  wqFr:[[-.11,.52,.045,.04,.04],[-.06,.505,.04,.035,.035],[0,.5,.08,.06,.05],[.06,.505,.13,.085,.07],[.14,.51,.15,.095,.075],[.23,.51,.14,.09,.07],
    [.31,.505,.115,.08,.065],[.38,.5,.09,.07,.06],[.44,.49,.065,.05,.045],[.48,.48,.03,.03,.025],[.5,.475,.008,.008,.008]],
  // Hivemother: egg sac, banded front abdomen, thorax + head
  hmSac:[[-1.3,.36,.02,.02,.02],[-1.27,.37,.11,.1,.09],[-1.21,.38,.21,.2,.18],[-1.12,.4,.3,.28,.26],[-1.01,.42,.37,.34,.31],[-.89,.43,.4,.37,.33],
    [-.77,.44,.405,.375,.33],[-.65,.44,.39,.36,.32],[-.55,.44,.34,.32,.28],[-.48,.435,.27,.25,.22],[-.44,.43,.2,.18,.17]],
  hmFr:[[-.4,.42,.18,.16,.14],[-.34,.43,.2,.18,.15],[-.27,.435,.205,.18,.15],[-.2,.43,.19,.17,.14],[-.14,.42,.16,.14,.12],[-.09,.41,.11,.1,.08],
    [-.05,.4,.07,.06,.055],[-.01,.4,.12,.08,.06],[.06,.41,.19,.11,.07],[.15,.415,.215,.12,.075],[.24,.415,.205,.11,.07],[.32,.41,.17,.1,.07],
    [.38,.405,.145,.095,.07],[.44,.4,.115,.08,.06],[.49,.39,.075,.055,.045],[.52,.385,.02,.02,.02]],
  // leg points per variant: [P0 hip, P1, P2 (the knee joint, close to the k1 bone so the leg lifts cleanly), P3, P4 foot]
  leg(sp,s,i){const z=SPID_LZ[i],dz=SPID_LDZ[i],k=(s<0?'a':'b')+i;
    if(sp=='Widowqueen'){const f=[1.3,1.05,1,1.2][i],u=[.25,.2,.1,.06][i];
      return {k,P:[[s*.06,.47,z*.85],[s*.32,.9+(i==0||i==3?.04:0),z+dz*u*f],[s*.42,.61,z+dz*.36*f],[s*.71,.25,z+dz*.82*f],[s*.86,0,z+dz*1.06*f]]}}
    const f=[1,1,1,1.1][i];
    return {k,P:[[s*.12,.42,z],[s*.28,.56,z+dz*.18*f],[s*.4,.57,z+dz*.3*f],[s*.54,.25,z+dz*.6*f],[s*.6,0,z+dz*.8*f]]}},
  pal(C,sp){const main=lpMain(C,.12);
    if(sp=='Widowqueen'){const red=new THREE.Color(C).lerp(new THREE.Color(0xff2a1a),.4),blk=new THREE.Color(0x0b090d).lerp(main,.05);
      return {main,red,blk,gloss:blk.clone().lerp(new THREE.Color(0x8a90a8),.28),under:blk.clone().multiplyScalar(.7)}}
    const amb=main.clone(),dark=main.clone().multiplyScalar(.25).lerp(new THREE.Color(0x120c08),.4),sac=new THREE.Color(0x8c7656).lerp(new THREE.Color(C),.22),
      vein=new THREE.Color(0x4a2418).lerp(new THREE.Color(C),.15),egg=new THREE.Color(C).lerp(new THREE.Color(0xffd870),.4).multiplyScalar(.85);
    return {main,amb,dark,sac,vein,egg,amb2:amb.clone().lerp(new THREE.Color(0xffd890),.25)}}};
{const B=LPR.Cryptspider,g0=B.geo,k0=B.kit;
  B.geo=function(C,c){const sp=rv137('Cryptspider',c);if(sp=='Widowqueen')return cs150WQGeo(C,sp);if(sp=='Hivemother')return cs150HMGeo(C,sp);return g0.apply(this,arguments)};
  B.kit=function(k,c,C,red){const sp=rv137('Cryptspider',c);if(sp=='Widowqueen')return cs150WQKit(k,C,red);if(sp=='Hivemother')return cs150HMKit(k,C,red);return k0.apply(this,arguments)}}
function cs150AbB(z){return z>-.2?['pelvis','tail0',.3]:z>-.28?['pelvis','tail0',.75]:['tail0','tail0',0]}
function cs150FrB(z){return z>.37?['head','head',0]:z>.31?['chest','head',.6]:z>.1?['chest','chest',0]:z>.02?['spine','chest',.5]:z>-.08?['spine','spine',0]:['pelvis','spine',.5]}
function cs150WQGeo(C,sp){const K=CS150.pal(C,sp),T=CS150.wqAb.concat(CS150.wqFr);
  const rings=T.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[0]<-.13?cs150AbB(q[0]):cs150FrB(q[0]),z:q[0],ab:q[0]<-.13}));
  const L=[{rings,seg:14,capA:1,capB:1,paint:(o,r,s,cc)=>{o.copy(K.blk);
    if(r.ab){if(s>.55&&s<.85)o.copy(K.gloss);else if(s<-.75&&r.z<-.4&&r.z>-.72&&Math.abs(cc)<.5)o.copy(K.red);else if(s<-.3)o.copy(K.under)}   // glossy highlight band, hourglass under the belly
    else{if(s>.6)o.lerp(K.gloss,.5);if(r.z<-.03&&r.z>-.12)o.copy(K.red)}}}];                                                                // red waist
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=CS150.leg(sp,s,i),k=G.k,P=G.P,rs=1-i*.03;
    const l=v150Lerp,a=[k+'0',k+'0',0],ab=[k+'0',k+'1',.5],b=[k+'1',k+'1',0],bc=[k+'1',k+'2',.5],c2=[k+'2',k+'2',0];
    const pts=[l(P[0],P[1],-.08),l(P[0],P[1],.5),l(P[0],P[1],.92),P[1],l(P[1],P[2],.1),l(P[1],P[2],.88),P[2],l(P[2],P[3],.08),l(P[2],P[3],.5),l(P[2],P[3],.92),P[3],l(P[3],P[4],.08),l(P[3],P[4],.6),P[4]];
    L.push(v150Leg(pts,[.044,.034,.031,.034,.03,.028,.033,.026,.023,.02,.024,.019,.012,.004].map(r=>r*rs),[a,a,a,a,a,[k+'0',k+'1',.3],ab,b,b,[k+'1',k+'2',.3],bc,c2,c2,c2],
      [0,0,0,1,0,0,1,0,0,0,1,0,0,0],(o,r,s2)=>{o.copy(r.jt?K.red:K.blk);if(!r.jt&&s2>.5)o.lerp(K.gloss,.45)},5))}));
  return lpGeo('CS150|'+sp+'|'+C,'Cryptspider',L,151)}
function cs150HMGeo(C,sp){const K=CS150.pal(C,sp),T=CS150.hmSac.concat(CS150.hmFr);
  const rings=T.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[0]<-.13?cs150AbB(q[0]):cs150FrB(q[0]),z:q[0],sac:q[0]<-.43,j:q[0]<-.43&&q[0]>-1.15?.07:0,i}));
  const L=[{rings,seg:16,capA:1,capB:1,paint:(o,r,s,cc,i)=>{const a=Math.atan2(s,cc);
    if(r.sac){o.copy(K.sac);if(Math.sin(a*6+r.z*9)>.8||Math.sin(a*11-r.z*14)>.9)o.copy(K.vein);if(s<-.5)o.lerp(K.vein,.25);return}
    if(r.z<-.08){o.copy(r.i%2?K.amb:K.dark);if(s<-.4)o.copy(K.dark);return}                                          // banded armour behind the waist
    o.copy(K.amb);if(s<-.3)o.copy(K.dark);else if(Math.abs(cc)>.8)o.lerp(K.dark,.6);if(r.z>.35&&s>.2)o.lerp(K.dark,.35)}}];
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=CS150.leg(sp,s,i),k=G.k,P=G.P,rs=1-i*.02;
    const pts=[v150Lerp(P[0],P[1],-.1),v150Lerp(P[0],P[1],.5),P[1],P[2],v150Lerp(P[2],P[3],.35),v150Lerp(P[2],P[3],.75),P[3],v150Lerp(P[3],P[4],.5),P[4]];
    L.push(v150Leg(pts,[.07,.062,.056,.06,.05,.043,.045,.03,.008].map(r=>r*rs),
      [[k+'0',k+'0',0],[k+'0',k+'0',0],[k+'0',k+'0',0],[k+'0',k+'1',.5],[k+'1',k+'1',0],[k+'1',k+'1',0],[k+'1',k+'2',.5],[k+'2',k+'2',0],[k+'2',k+'2',0]],
      [0,0,0,1,0,0,1,0,0],(o,r,s2)=>{o.copy(r.jt?K.dark:(r.lg>.3&&r.lg<.6?K.amb2:K.amb));if(s2<-.3&&!r.jt)o.lerp(K.dark,.5);if(r.lg>.85)o.copy(K.dark)},6))}));
  return lpGeo('CS150|'+sp+'|'+C,'Cryptspider',L,152)}
function cs150WQKit(k,C,red){const K=CS150.pal(C,'Widowqueen'),blk=K.blk.getHex(),rd=K.red.getHex(),gl=K.gloss.getHex(),eye=red?0xff7a2a:0xff2a2a,AB=CS150.wqAb;
  // the hourglass: two red triangles meeting tip to tip on the top of the abdomen
  {const z0=-.62,cen=v150Surf(AB,z0,Math.PI/2,.002);[1,-1].forEach(d=>{const p=v150Surf(AB,z0+d*.075,Math.PI/2,.004),T=[0,cen[1]-p[1],cen[2]-p[2]],l=Math.hypot(T[1],T[2]);
    k.p('tail0','cone','c',rd,(p[0]+cen[0])/2,(p[1]+cen[1])/2+.006,(p[2]+cen[2])/2,.09,l,.016,Math.atan2(T[2]/l,T[1]/l),0,0)})}
  // a pair of small red spots in front of it, a red cap round the spinnerets
  [-1,1].forEach(s=>{const p=v150Surf(AB,-.4,Math.PI/2+s*.35,.002);k.p('tail0','sph','c',rd,p[0],p[1],p[2],.026,.012,.03,0,0,-s*.35)});
  k.p('tail0','sph','c',rd,0,.632,-.905,.03,.03,.016,-.3,0,0);[-1,1].forEach(s=>k.L('tail0','c',blk,[s*.02,.63,-.9],[s*.03,.6,-.96],.018,.004,4));
  // eyes: two big front eyes and a crown of small ones
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.028,.522,.455,.02);k.p('head','sph','g',eye,s*.03,.524,.464,.013);
    [[.058,.515,.44,.01],[.048,.54,.425,.009],[.016,.545,.44,.008],[.07,.5,.43,.008]].forEach(q=>k.p('head','sph','g',eye,s*q[0],q[1],q[2],q[3]));
    // slender chelicerae with long pale fangs (jaw bone: they flare when biting), long pedipalps
    k.L('jaw','c',blk,[s*.024,.475,.47],[s*.028,.41,.5],.022,.015,5);k.L('jaw','c',0xe8dcc0,[s*.028,.41,.5],[s*.014,.345,.49],.01,.002,4);
    k.L('head','c',blk,[s*.05,.47,.45],[s*.09,.43,.53],.014,.012,5);k.L('head','c',rd,[s*.09,.43,.53],[s*.1,.4,.55],.014,.013,5);k.L('head','c',blk,[s*.1,.4,.55],[s*.105,.33,.58],.012,.004,5);
    // a short spine on each thigh's high peak
    [0,1,2,3].forEach(i=>{const P=CS150.leg('Widowqueen',s,i).P[1];k.L((s<0?'a':'b')+i+'0','c',blk,[P[0],P[1]+.02,P[2]],[P[0]+s*.02,P[1]+.08,P[2]-.01],.012,.002,4)})});
  // the crown: a band round the top of the head with seven tall spines, the middle ones tallest, red tips; a red gem at the front
  {const cx=0,cy=.574,cz=.335;k.p('head','ring','c',blk,cx,cy,cz,.07,.2,.06);
    for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*1.5,x=Math.sin(a)*.068,z=cz+Math.cos(a)*.058,h=.15-Math.abs(i-3)*.022,d=[Math.sin(a)*.35,1,Math.cos(a)*.2-.3],l=Math.hypot(...d);
      const b=[x,cy,z],m=[x+d[0]/l*h*.7,cy+d[1]/l*h*.7,z+d[2]/l*h*.7],t=[x+d[0]/l*h,cy+d[1]/l*h,z+d[2]/l*h];k.L('head','c',blk,b,m,.014,.008,4);k.L('head','c',rd,m,t,.008,.001,4)}
    k.p('head','oct','c',rd,0,cy+.01,cz+.07,.018,.026,.012)}}
function cs150HMKit(k,C,red){const K=CS150.pal(C,'Hivemother'),amb=K.amb.getHex(),dk=K.dark.getHex(),sac=K.sac.getHex(),egg=K.egg.getHex(),eye=red?0xff4a2a:0xffb020,R=dkRng(57),SAC=CS150.hmSac;
  // eggs bulging through the sac: glowing ones and pale ones
  for(let n=0;n<34;n++){const z=-.55-R()*.65,a=-.5+R()*(Math.PI+1),sz=.028+R()*.026,p=v150Surf(SAC,z,a,-sz*.4);k.p('tail0','sph',n%3==0?'g':'c',n%3==0?egg:dkShade(sac,1.25),p[0],p[1],p[2],sz,sz*.9,sz*1.1)}
  // the old chitin plates, stretched far apart along the top of the swollen sac
  for(let j=0;j<6;j++){const z=-.52-j*.13,p=v150Surf(SAC,z,Math.PI/2,.002);k.p('tail0','dod','c',j%2?dkShade(amb,.75):dkShade(amb,.55),p[0],p[1],p[2],.075-Math.abs(j-2.5)*.008,.016,.04)}
  // spiderlings clinging to the sac
  [[-.62,1.25],[-.8,2.2],[-.98,1.0],[-.72,.45],[-1.08,2.5],[-.9,2.9],[-.6,.1]].forEach((q,n)=>{const p=v150Surf(SAC,q[0],q[1],.01),nx=Math.cos(q[1]),ny=Math.sin(q[1]),f=n%2?1:-1,col=n%2?dk:0x1a1410;
    k.p('tail0','sph','c',col,p[0]+nx*.012,p[1]+ny*.012,p[2]-f*.02,.03,.024,.036);k.p('tail0','sph','c',col,p[0]+nx*.01,p[1]+ny*.01,p[2]+f*.025,.02,.016,.022);
    k.p('tail0','sph','g',eye,p[0]+nx*.02,p[1]+ny*.02,p[2]+f*.042,.006);
    for(let l=0;l<4;l++)[-1,1].forEach(sd=>{const tz=p[2]+f*(.03-l*.018),tx=-ny*sd,ty=nx*sd;
      k.L('tail0','c',col,[p[0]+nx*.01,p[1]+ny*.01,tz],[p[0]+tx*.05+nx*.012,p[1]+ty*.05+ny*.012,tz+f*(.012-l*.012)],.005,.003,3)})});
  // banded armour plates behind the waist, an armoured carapace on the thorax with a ridge of short spikes
  [-.36,-.29,-.22,-.15].forEach((z,i)=>{const q=v150At(CS150.hmFr,z);k.p(z<-.27?'tail0':'pelvis','hem','c',i%2?dk:amb,0,q[1]+q[3]*.55,z,q[2]*1.02,q[3]*.5,.05,0,0,0)});
  k.p('chest','hem','c',dkShade(amb,.8),0,.47,.17,.2,.075,.17);k.p('chest','hem','c',dk,0,.49,.17,.13,.06,.11);
  [.28,.2,.12,.04].forEach((z,i)=>k.p(z>.1?'chest':'spine','cone4','c',dk,0,.535-Math.abs(z-.16)*.3,z,.016,.05,.02,-.4,0,0));
  // the head: a brow plate over a cluster of amber eyes, big sickle mandibles (jaw bone: they open on a bite)
  k.p('head','box','c',dk,0,.47,.43,.14,.026,.075,-.35,0,0);[-1,1].forEach(s=>k.p('head','box','c',dk,s*.062,.462,.43,.05,.024,.07,-.35,0,-s*.35));
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.038,.452,.48,.02);k.p('head','sph','g',eye,s*.04,.453,.488,.013);
    [[.07,.445,.46,.01],[.085,.43,.44,.009],[.02,.465,.475,.009],[.06,.465,.455,.008]].forEach(q=>k.p('head','sph','g',eye,s*q[0],q[1],q[2],q[3]));
    k.p('head','cone4','c',dk,s*.09,.475,.4,.02,.06,.02,-.6,0,-s*.5);
    const m0=[s*.05,.38,.49],m1=[s*.1,.36,.56],m2=[s*.09,.34,.63],m3=[s*.03,.33,.66];
    k.L('jaw','c',dk,m0,m1,.032,.026,5);k.L('jaw','c',dk,m1,m2,.026,.018,5);k.L('jaw','c',dkShade(0xe8d8b0,.9),m2,m3,.018,.003,4);
    k.p('jaw','cone4','c',0xe8d8b0,s*.075,.355,.585,.008,.025,.008,Math.PI/2,0,s*.6);
    // spikes on the legs
    [0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',s,i),kk=G.k,P=G.P;[.35,.75].forEach(t=>{const p=v150Lerp(P[0],P[1],t);k.L(kk+'0','c',dk,[p[0],p[1]+.04,p[2]],[p[0]+s*.02,p[1]+.1,p[2]-.02],.016,.002,4)});
      [.3,.65].forEach(t=>{const p=v150Lerp(P[2],P[3],t);k.L(kk+'1','c',dk,[p[0]+s*.03,p[1],p[2]],[p[0]+s*.09,p[1]+.03,p[2]],.014,.002,4)})})});
  // spinnerets
  [-1,1].forEach(s=>k.L('tail0','c',dk,[s*.03,.36,-1.28],[s*.04,.34,-1.35],.022,.006,4))}
// Hivemother: the egg sac slowly swells and settles (the tail0 bone carries the whole abdomen)
{const f=lpRig;lpRig=function(c,n,D){const g=f.apply(this,arguments);
  if(n=='Cryptspider'&&g&&c&&c.g&&c.g[0]=='Hivemother'&&g.rig){const body=g.b.children.find(m=>m.isSkinnedMesh&&m.skeleton),i=Object.keys(SPEC.Cryptspider.bones).indexOf('tail0'),bn=body&&body.skeleton.bones[i];
    if(bn){const r=g.rig;g.rig=function(now,mv,sp){r.apply(this,arguments);const k=1+.035*Math.sin(now/420)+.015*Math.sin(now/170);bn.scale.set(k,1+(k-1)*.8,1+(k-1)*.6)}}}
  return g}}

// ===================================================================== Boneling rig: Lichbone =====================================================================
var LB150={
  // the skull, held higher than the Boneling's: [z, y, half width, above, below] in the Boneling template space
  skull:[[.43,.665,.05,.05,.04],[.47,.695,.095,.085,.055],[.53,.695,.112,.085,.06],[.59,.67,.082,.056,.04],[.66,.645,.057,.04,.026],[.73,.628,.044,.032,.02],[.79,.62,.026,.02,.014],[.83,.617,.006,.006,.006]],
  cols(C){const K=boneCols(C);K.bone=K.bone.clone().multiplyScalar(.9);K.dark=K.bone.clone().multiplyScalar(.45);
    K.robe=new THREE.Color(C).multiplyScalar(.42).lerp(new THREE.Color(0x141016),.45);K.robe2=K.robe.clone().multiplyScalar(.65);K.hide=new THREE.Color(0x3a2c24).lerp(new THREE.Color(C),.15);
    K.trim=new THREE.Color(C).lerp(new THREE.Color(0xc8a868),.55).multiplyScalar(.8);return K}};
{const B=LPR.Boneling,g0=B.geo,k0=B.kit;
  B.geo=function(C,c){if(rv137('Boneling',c)=='Lichbone')return lb150Geo(C);return g0.apply(this,arguments)};
  B.kit=function(k,c,C,red){if(rv137('Boneling',c)=='Lichbone')return lb150Kit(k,C,red);return k0.apply(this,arguments)}}
function lb150Geo(C){const K=LB150.cols(C),R=(p,rx,ryT,ryB,b,ex)=>Object.assign({p:boneP(p),rx:rx*.85,ryT:ryT*1.05,ryB:(ryB==null?ryT:ryB)*1.05,b},ex||{});
  const bonePaint=(o,r,s)=>{o.copy(K.bone);if(r.k)o.lerp(K.dark,r.k);if(s<-.3)o.lerp(K.dark,.3);else if(s>.7)o.multiplyScalar(1.08)};
  const L=[
    {rings:LB150.skull.map((q,i)=>R([0,q[1],q[0]],q[2],q[3],q[4],['head','head',0],{k:i>4?.15*(i-4):0})),seg:7,capA:1,capB:1,paint:bonePaint},
    // spine: a short tail, the hips, a back rising to hunched shoulders, the neck up to the skull
    {rings:[R([0,.5,-.64],.006,.006,null,['tail1','tail1',0],{k:.3}),R([0,.505,-.6],.018,.018,null,['tail1','tail1',0],{k:.2}),R([0,.53,-.47],.026,.026,null,['tail0','tail0',0],{k:.1}),
      R([0,.565,-.34],.034,.034,null,['pelvis','tail0',.5]),R([0,.58,-.22],.038,.038,null,['pelvis','pelvis',0]),R([0,.595,-.1],.036,.036,null,['spine','spine',0]),
      R([0,.625,.04],.038,.038,null,['spine','chest',.5]),R([0,.66,.16],.042,.042,null,['chest','chest',0]),R([0,.675,.27],.038,.038,null,['chest','neck',.5]),
      R([0,.68,.35],.034,.034,null,['neck','neck',0]),R([0,.675,.43],.03,.03,null,['head','head',0])],seg:6,capA:1,capB:1,paint:bonePaint},
    // the robe over the shoulders and back (its underside is hidden in the ribcage), ragged at the edges
    {rings:[R([0,.66,.39],.07,.045,.035,['neck','neck',0]),R([0,.668,.34],.15,.06,.07,['chest','neck',.4]),R([0,.66,.27],.215,.065,.1,['chest','chest',0],{j:.1}),
      R([0,.648,.17],.225,.06,.105,['chest','chest',0],{j:.12}),R([0,.632,.07],.21,.055,.1,['spine','chest',.4],{j:.12}),R([0,.615,-.01],.17,.05,.08,['spine','spine',0],{j:.1}),
      R([0,.605,-.06],.09,.04,.05,['spine','spine',0])],seg:12,capA:1,capB:1,paint:(o,r,s,cc,i)=>{o.copy(i%2?K.robe:K.robe2);if(s<-.2)o.lerp(K.robe2,.5);if(i==1&&s>0)o.copy(K.trim)}},
    // the hide over the hips
    {rings:[R([0,.585,-.1],.07,.03,.03,['pelvis','spine',.4]),R([0,.59,-.15],.15,.045,.06,['pelvis','pelvis',0],{j:.12}),R([0,.59,-.24],.165,.05,.07,['pelvis','pelvis',0],{j:.14}),
      R([0,.575,-.33],.14,.045,.06,['pelvis','tail0',.3],{j:.12}),R([0,.56,-.39],.065,.03,.03,['tail0','tail0',0])],seg:10,capA:1,capB:1,paint:(o,r,s,cc,i)=>{o.copy(K.hide);if(i%2)o.multiplyScalar(.8);if(s<-.2)o.multiplyScalar(.7)}}];
  // legs: heavier bones than the Boneling's, the forelegs thickest
  [-1,1].forEach(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr',l=(x,y,z,r,b,k)=>R([s*x,y,z],r,r,r,b,{k:k||0});
    L.push({rings:[l(.095,.55,.2,.042,['chest',F+'0',.5]),l(.105,.38,.21,.032,[F+'0',F+'0',0]),l(.105,.25,.22,.028,[F+'0',F+'1',.6]),l(.105,.22,.22,.04,[F+'1',F+'1',0]),
      l(.105,.19,.215,.026,[F+'1',F+'1',0]),l(.105,.1,.205,.022,[F+'1',F+'2',.7]),l(.105,.07,.2,.032,[F+'2',F+'2',0]),l(.105,.035,.21,.026,[F+'2',F+'2',0],.2)],seg:6,ref:[0,0,1],capA:1,capB:1,paint:bonePaint});
    L.push({rings:[l(.1,.53,-.24,.044,['pelvis',H+'0',.4]),l(.112,.4,-.23,.034,[H+'0',H+'0',0]),l(.114,.3,-.205,.027,[H+'0',H+'1',.5]),l(.114,.27,-.2,.038,[H+'1',H+'1',0]),
      l(.112,.23,-.21,.024,[H+'1',H+'1',0]),l(.112,.13,-.245,.021,[H+'1',H+'2',.7]),l(.112,.1,-.255,.03,[H+'2',H+'2',0]),l(.112,.045,-.25,.024,[H+'2',H+'2',0],.2)],seg:6,ref:[0,0,1],capA:1,capB:1,paint:bonePaint});
  });
  return lpGeo('LB150|'+C,'Boneling',L,153)}
function lb150Kit(k,C,red){const K=LB150.cols(C),bone=K.bone.getHex(),dark=K.dark.getHex(),crev=K.crev.getHex(),glow=red?0xff2a2a:K.glow.getHex(),glow2=new THREE.Color(glow).lerp(new THREE.Color(0xffffff),.45).getHex(),
    robe=K.robe.getHex(),robe2=K.robe2.getHex(),hide=K.hide.getHex(),trim=K.trim.getHex(),iron=0x4a4650,gold=0xb89a50,P=boneP;
  const L=(bn,t,col,a,b,r1,r2,sg)=>k.L(bn,t,col,P(a),P(b),r1,r2,sg||4),Bx=(bn,t,col,p,sx,sy,sz,rx,ry,rz,geo)=>{const q=P(p);k.p(bn,geo||'box',t,col,q[0],q[1],q[2],sx,sy,sz,rx,ry,rz)},
    S=(bn,col,p,w,len,ry,rx,sd)=>{const q=P(p);k.S(bn,col,q[0],q[1],q[2],w,len,ry,rx,sd)};
  // a deep ribcage: ribs arcing out from the spine and down under the chest; the front four meet the sternum
  [.26,.19,.12,.05,-.02,-.09].forEach((z,i)=>{const w=1.08-i*.05,dp=1.05-i*.08,bn=i<4?'chest':'spine',sh=i%2?dkShade(bone,.85):bone,ys=.64-(.27-z)*.12;
    [-1,1].forEach(s=>{const a=[s*.025,ys,z],b=[s*.14*w,ys-.03,z-.02],c2=[s*.18*w,ys-.14,z-.04],d=[s*.14*w,ys-.27*dp,z-.035],e=[s*.016,.33,z-.01];
      L(bn,'c',sh,a,b,.017,.016,5);L(bn,'c',sh,b,c2,.016,.015,5);L(bn,'c',sh,c2,d,.015,.012,5);if(i<4)L(bn,'c',dkShade(sh,.85),d,e,.012,.01,5)})});
  L('chest','c',bone,[0,.32,.3],[0,.335,.04],.022,.014,5);
  // the phylactery: a glowing crystal in a small iron cage, hung from the spine on a chain
  {const c0=[0,.45,.12];Bx('chest','g',glow,c0,.035,.055,.035,0,0,0,'oct');Bx('chest','g',glow2,[0,.45,.12],.016,.03,.016,0,0,0,'oct');
    Bx('chest','m',iron,[0,.51,.12],.034,.012,.034,0,0,0,'cyl');Bx('chest','m',iron,[0,.39,.12],.03,.012,.03,0,0,0,'cyl');
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.6;L('chest','m',iron,[Math.cos(a)*.034,.51,.12+Math.sin(a)*.034],[Math.cos(a)*.03,.39,.12+Math.sin(a)*.03],.004,.004,3)}
    L('chest','m',iron,[0,.515,.12],[0,.6,.12],.005,.005,3);Bx('chest','m',iron,[0,.37,.12],.012,.03,.012,Math.PI,0,0,'cone4')}
  // rags hanging from the robe and the hip hide; collar trim
  [[.33,.12],[.28,.2],[.23,.16],[.18,.23],[.13,.18],[.08,.22],[.03,.17],[-.02,.13]].forEach((q,i)=>[-1,1].forEach(s=>{const z=q[0],x=s*(z>.3?.144:z<0?.163:.197),y=z>.3?.635:.605;
    S(z>.05?'chest':'spine',i%2?robe:robe2,[x,y,z],.065,q[1]+(s>0?.02:0),Math.PI/2,s*.12,i+(s>0?3:0))}));
  // the robe's gold-trimmed hem round the neck, a clasp at the throat
  for(let i=0;i<9;i++){const a=(i/8-.5)*Math.PI*1.3;Bx('neck','c',trim,[Math.sin(a)*.12,.69+Math.cos(a)*.03,.35+Math.cos(a)*.02],.04,.014,.024,0,a,0)}
  Bx('neck','m',gold,[0,.64,.4],.022,.022,.012,0,0,0,'oct');
  [[-.15,.1],[-.21,.14],[-.27,.12],[-.33,.08]].forEach((q,i)=>[-1,1].forEach(s=>S('pelvis',i%2?hide:dkShade(hide,.8),[s*(q[0]<-.3?.13:.155),.57,q[0]],.065,q[1],Math.PI/2,s*.15,i+5)));
  for(let i=0;i<5;i++){const z=-.16-i*.05;S('pelvis',dkShade(hide,.75),[0,.57,z-.03],.05,.07,0,-1.2,i)}
  // the skull: deep sockets with soul-fire eyes, a heavy brow, nasal hole, big fangs, the lower jaw on the jaw bone
  [-1,1].forEach(s=>{
    Bx('head','c',0x050404,[s*.052,.7,.565],.05,.042,.03,0,s*.4,-s*.15);Bx('head','g',glow,[s*.057,.7,.577],.028,.018,.01,0,s*.4,-s*.2);
    Bx('head','c',dark,[s*.055,.735,.555],.066,.022,.05,0,s*.4,s*.35);
    Bx('head','c',crev,[s*.09,.655,.5],.012,.03,.05);
    for(let i=0;i<4;i++){Bx('head','c',0xece4cc,[s*(.026-i*.002),.612,.74-i*.042],.008,i?.03:.045,.009,Math.PI,0,0,'cone4');Bx('jaw','c',0xe4dcc4,[s*(.014+i*.002),.608,.705-i*.042],.007,.026,.008,0,0,0,'cone4')} // v180: rooted in the skull and the jaw
    // ram horns curling back, out and down past the cheeks
    const hp=[[s*.065,.75,.49],[s*.12,.82,.43],[s*.19,.83,.35],[s*.24,.76,.32],[s*.24,.68,.37],[s*.21,.64,.43]],hr=[.034,.03,.026,.021,.015,.008,.002];
    for(let i=0;i<hp.length-1;i++)L('head','c',i%2?dkShade(dark,1.2):dark,hp[i],hp[i+1],hr[i],hr[i+1],6);
    // flames round the paws
    [[F150(s),.2],[H150(s),-.25]].forEach(f=>{const x=s*(f[0][1]),z=f[1];for(let j=0;j<3;j++){const a=j/3*Math.PI*2+(s>0?.5:0);
      L(f[0][0],'g',j%2?glow:glow2,[x+Math.cos(a)*.025,.05,z+Math.sin(a)*.025],[x+Math.cos(a)*.04,.12+j*.015,z+Math.sin(a)*.04-.02],.016,.002,4)}});
    // hide wraps on the upper legs
    [[s<0?'fl0':'fr0',.105,.42,.21,.048],[s<0?'fl0':'fr0',.105,.34,.213,.042],[s<0?'hl0':'hr0',.11,.44,-.23,.05],[s<0?'hl0':'hr0',.113,.36,-.22,.044]].forEach((q,i)=>Bx(q[0],'c',i%2?hide:dkShade(hide,.75),[s*q[1],q[2],q[3]],q[4],.035,q[4],0,0,0,'tor'))
  });
  Bx('head','c',0x050404,[0,.638,.8],.024,.02,.03);
  L('jaw','c',bone,[0,.6,.5],[0,.598,.76],.034,.013,5);L('jaw','c',dark,[0,.585,.5],[0,.59,.7],.02,.01,4);
  // the crown: an iron band round the cranium with gold spikes, a soul gem in front
  {const c=P([0,.765,.52]);k.p('head','ring','m',iron,c[0],c[1],c[2],.08,.22,.07,-.15,0,0);
    for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*1.6,x=Math.sin(a)*.078,z=c[2]+Math.cos(a)*.068,h=.07+(i%2?0:.04)-Math.abs(i-3)*.006;k.L('head','m',i%2?iron:gold,[x,c[1],z],[x*1.15,c[1]+h,z+Math.cos(a)*.01-.01],.013,.002,4)}
    k.p('head','oct','g',glow,0,c[1]+.005,c[2]+.075,.016,.024,.012)}
  // vertebra spikes over the shoulders (rising through the robe) and down the hips
  [[.32,.06],[.25,.075],[.18,.08],[.11,.07],[.04,.055]].forEach((q,i)=>Bx(q[0]>.3?'neck':q[0]>.07?'chest':'spine','c',i%2?bone:dkShade(bone,.85),[0,.74-Math.abs(q[0]-.18)*.25,q[0]],.014,q[1],.018,-.45,0,0,'cone4'));
  [-.18,-.25,-.32].forEach((z,i)=>Bx('pelvis','c',bone,[0,.66-i*.01,z],.012,.04,.015,-.5,0,0,'cone4'));
  // the flame mane up the neck and out of the robe's collar, the flame plume at the tail tip
  for(let i=0;i<6;i++){const z=.42-i*.04,y=.7+(i>1?.0:.0);L(i<2?'head':'neck','g',i%2?glow:glow2,[0,y-.02,z],[0,y+.12-i*.008,z-.1],.024-i*.002,.002,4);
    if(i>0&&i<5)[-1,1].forEach(s=>L('neck','g',i%2?glow2:glow,[s*.04,y-.03,z],[s*.08,y+.06,z-.08],.016,.002,4))}
  for(let i=0;i<4;i++){const a=(i-1.5)*.5;L('tail1','g',i%2?glow:glow2,[0,.5,-.62],[Math.sin(a)*.05,.56+Math.abs(Math.cos(a))*.05,-.74-Math.cos(a)*.05],.025,.002,4)}
  // v180: ball joints seat the legs in the shoulders and hips (the hind legs stood off the hips in a stride)
  [-1,1].forEach(s=>{Bx('chest','c',bone,[s*.1,.55,.205],.042,.042,.042,0,0,0,'sph');Bx('pelvis','c',bone,[s*.1,.535,-.24],.048,.048,.048,0,0,0,'sph')});
  // bony toes with claws
  [['fl2',-.105,.215],['fr2',.105,.215],['hl2',-.112,-.24],['hr2',.112,-.24]].forEach(f=>[-1,0,1].forEach(i=>{
    L(f[0],'c',bone,[f[1]+i*.02,.034,f[2]-.012],[f[1]+i*.025,.014,f[2]+.065],.013,.009,4);Bx(f[0],'c',crev,[f[1]+i*.025,.012,f[2]+.082],.007,.034,.007,Math.PI/2,0,0,'cone4')}));
}
function F150(s){return [s<0?'fl2':'fr2',.105]}
function H150(s){return [s<0?'hl2':'hr2',.112]}

// ===================================================================== variant / trait extras =====================================================================
// lpExtras (Ember, Frost, Spiked, Armored, Horned ...) reads the rig's back line and head point: give each variant its own
var V150_EX={
  Widowqueen:{back:[['tail0',0,1.0,-.58],['tail0',0,1.02,-.46],['tail0',0,.98,-.34],['chest',0,.6,.18]],head:['head',0,.56,.41],up:.1}, // v180: head mark on the head proper
  Hivemother:{back:[['tail0',0,.79,-1.0],['tail0',0,.81,-.8],['tail0',0,.78,-.6],['tail0',0,.6,-.3],['chest',0,.54,.15]],head:['head',0,.5,.41],up:.1},
  Lichbone:{back:[['neck',...boneP([0,.75,.36])],['chest',...boneP([0,.76,.24])],['chest',...boneP([0,.76,.12])],['spine',...boneP([0,.72,.0])],['pelvis',...boneP([0,.66,-.24])]],head:['head',...boneP([0,.78,.52])],up:.08}};
{const f=lpExtras;lpExtras=function(k,c,D){const sp=c&&c.g&&c.g[0],o=V150_EX[sp];
  if(o&&(D===LPR.Cryptspider||D===LPR.Boneling))return f.call(this,k,c,Object.assign({},D,o));return f.apply(this,arguments)}}

// ===================================================================== evolution looks for the new bodies =====================================================================
// The base species keep their v100 designs (1760, 1770). The variants get designs drawn for their own shapes; the rays
// (E.top / E.on) already hit the variant's own body (evo100Surf, RV137 in 2600).
{const D=EVO100.D.Cryptspider,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Cryptspider;
  if(sp=='Widowqueen')return cs150WQEvo(E,L,P);if(sp=='Hivemother')return cs150HMEvo(E,L,P);return b0.apply(this,arguments)}}
{const D=EVO100.D.Boneling,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Boneling=='Lichbone')return lb150Evo(E,L,P);return b0.apply(this,arguments)}}
// Lichbone's evolution glow follows its own soul-fire (from its colour, like its eyes and phylactery) instead of the Boneling's green
{const f=evo100Pal;evo100Pal=function(c,n,L){const P=f.apply(this,arguments);
  if(n=='Boneling'&&RV137.cur.Boneling=='Lichbone'&&!c.v&&!c.rv&&!c.shn){const g=boneCols(c.cl[0]).glow;P.glow=g.getHex();P.glow2=g.clone().lerp(new THREE.Color(0xffffff),.45).getHex();P.glowD=g.clone().multiplyScalar(.6).getHex()}
  return P}}
function cs150WQEvo(E,L,P){const jb={bn:'jaw'},hb={bn:'head'},blk=0x0c0a0e,top=(x,z,o)=>{const h=E.top(x,z);return h?E.add(h.p,h.n,o||0):null};
  // L1: venom beading on the fangs, a glowing jewel where the hourglass pinches, two glowing eyes set in the crown band
  [-1,1].forEach(s=>{E.pd('sph','g',P.glow,[s*.014,.338,.49],[0,1,0],[.009,.015,.009],null,jb);E.pd('sph','g',P.glow,[s*.03,.585,.395],[0,0,1],.009,null,hb)});
  {const h=E.top(0,-.62);if(h)E.pd('oct','g',P.glow,E.add(h.p,h.n,.012),h.n,[.018,.024,.018])}
  if(L>=2){// a row of black spines down each side of the abdomen's crown, gold bands on the four high knees
    [-1,1].forEach(s=>{for(let i=0;i<6;i++){const z=-.38-i*.085,x=s*(.15-Math.abs(i-2.5)*.008),h=E.top(x,z);if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([h.n[0]*.6,1,-.5]),.07+(i%2)*.02),.016,.002,'c',blk,4)}
      [0,1,2,3].forEach(i=>{const LG=CS150.leg('Widowqueen',s,i),G=LG.P;E.band(v150Lerp(G[0],G[1],.82),[G[1][0]-G[0][0],G[1][1]-G[0][1],G[1][2]-G[0][2]],.003,.006,'m',P.trim,6,{bn:LG.k+'0'})})})}
  if(L>=3){// black-steel plates over the cephalothorax, silk strands hanging from the widest part of the abdomen
    [.04,.14,.24].forEach((z,i)=>{const h=E.top(0,z);if(h)E.pd('hem','m',P.metal,E.add(h.p,h.n,-.004),h.n,[.1-i*.012,.026,.06],[0,0,1])});
    [-1,1].forEach(s=>{for(let i=0;i<5;i++){const z=-.4-i*.1,h=E.on([s*2,.69,z],[-s,0,0]);if(!h)continue;const a=E.add(h.p,[s*.004,0,0]),b=E.add(a,[s*.03,-.2-(i%2)*.08,-.03]);
      E.L(a,b,.005,.003,'c',0xd8d4cc,3);E.pd('sph','c',0xe8e4dc,b,[0,1,0],.012)}})}
  if(L>=4){// a gilded crown: gold spines between the black ones and a big jewel; glowing runes on the abdomen's flanks
    const cy=.574,cz=.335;for(let i=0;i<6;i++){const a=((i+.5)/6-.5)*Math.PI*1.5,x=Math.sin(a)*.068,z=cz+Math.cos(a)*.058;E.L([x,cy,z],[x+Math.sin(a)*.02,cy+.09-Math.abs(i-2.5)*.012,z-.02],.01,.002,'m',P.trim,4,hb)}
    E.pd('oct','g',P.glow,[0,cy+.03,cz+.08],[0,1,.3],[.02,.032,.016],null,hb);
    [-1,1].forEach(s=>[-.48,-.66].forEach(z=>{const h=E.on([s*2,.8,z],[-s,-.3,0]);if(h)E.rune(h,[0,0,1],.07,P.glow)}))}
  if(L>=5){// venom mist rising from the abdomen, glowing tips on the crown's spines
    for(let i=0;i<5;i++){const p=top((i-2)*.07,-.5-(i%2)*.14,-.01);if(p)E.L(p,E.add(p,[(i-2)*.01,.09+(i%2)*.03,-.05]),.012,.001,'g',P.glow2,3)}
    for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*1.5,h=.15-Math.abs(i-3)*.022,d=E.nrm([Math.sin(a)*.35,1,Math.cos(a)*.2-.3]);E.pd('sph','g',P.glow,E.add([Math.sin(a)*.068,.574,.335+Math.cos(a)*.058],d,h),[0,1,0],.01,null,hb)}}}
function cs150HMEvo(E,L,P){const jb={bn:'jaw'},hb={bn:'head'},SAC=CS150.hmSac,wax=0xc89a3a,sacHit=(z,a)=>{const q=v150At(SAC,z),o=v150Surf(SAC,z,a,.4);return E.on(o,[-Math.cos(a),-Math.sin(a),0])};
  // L1: venom on the mandible tips, glowing veins over the egg sac
  [-1,1].forEach(s=>E.pd('sph','g',P.glow,[s*.03,.322,.66],[0,1,0],[.01,.016,.01],null,jb));
  for(let v=0;v<7;v++){const a0=-.2+v/6*(Math.PI+.4);let prev=null;for(let j=0;j<7;j++){const z=-.5-j*.11,a=a0+Math.sin(j*1.3+v)*.18,h=sacHit(z,a),p=h?E.add(h.p,h.n,.006):null;
    if(p&&prev)E.L(prev,p,.006,.006,'g',j%2?P.glow:P.glowD,3,{vs:1});prev=p}}
  if(L>=2){// clusters of wax brood cells on the sac's flanks, a crest of three chitin horns on the brow
    [-1,1].forEach(s=>{for(let i=0;i<7;i++){const z=-.62-(i%4)*.07-(i>3?.04:0),a=s>0?.35+(i>3?.22:0):Math.PI-.35-(i>3?.22:0),h=sacHit(z,a);if(!h)continue;
      E.pd('cyl','c',wax,E.add(h.p,h.n,.01),h.n,[.03,.03,.03]);E.pd('cyl','g',P.glowD,E.add(h.p,h.n,.026),h.n,[.02,.004,.02])}});
    [-1,0,1].forEach(i=>E.horn([i*.04,.48,.425],[i*.3,1,-.6],[0,0,-.04],.09-Math.abs(i)*.02,.016,'c',P.dark,4,hb))}
  if(L>=3){// iron plates riveted over the thorax and the brow, iron caps on the hips of the legs
    [.08,.17,.26].forEach((z,i)=>{const h=E.top(0,z);if(h){E.pd('hem','m',P.metal,E.add(h.p,h.n,-.004),h.n,[.13-i*.015,.03,.06],[0,0,1]);E.pd('sph','m',P.trim,E.add(h.p,h.n,.022),h.n,.008)}});
    E.pd('box','m',P.metal,[0,.488,.44],[0,1,.5],[.15,.012,.06],null,hb);
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',s,i).P,p=v150Lerp(G[0],G[1],.55);E.pd('hem','m',P.metal,E.add(p,[0,.035,0]),[s*.3,1,0],[.05,.03,.06],null,{bn:G.k+'0'})}))}
  if(L>=4){// a crown of horns tipped in gold, gold bands on the legs
    for(let i=0;i<5;i++){const a=(i/4-.5)*2.2,b=[Math.sin(a)*.09,.47,.4+Math.cos(a)*.02];E.horn(b,[Math.sin(a)*.6,1,-.5],[0,0,-.03],.11-Math.abs(i-2)*.015,.016,'c',P.dark,4,hb,P.trim)}
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const LG=CS150.leg('Hivemother',s,i),G=LG.P;E.band(v150Lerp(G[2],G[3],.45),[G[3][0]-G[2][0],G[3][1]-G[2][1],G[3][2]-G[2][2]],.003,.007,'m',P.trim,6,{bn:LG.k+'1'})}))} // v180: on the leg bone (G.k was undefined: the bands rode the hips)
  if(L>=5){// the brood stirs: glowing grubs on the sac, a glowing seam along the top of the sac
    for(let i=0;i<10;i++){const h=sacHit(-.55-(i%5)*.13,.4+i*.27);if(h)E.pd('ico','g',i%2?P.glow:P.glow2,E.add(h.p,h.n,.012),h.n,[.016,.026,.016])}
    let prev=null;for(let j=0;j<8;j++){const h=E.top(0,-.5-j*.1),p=h?E.add(h.p,h.n,.012):null;if(p&&prev)E.L(prev,p,.008,.008,'g',P.glow,3,{vs:1});prev=p}}}
function lb150Evo(E,L,P){const B=boneP,hb={bn:'head'},nb={bn:'neck'};
  // L1: soul-fire wisps rising from the eye sockets, a grave chain round the throat with a charm
  [-1,1].forEach(s=>{const e=B([s*.057,.7,.577]);E.L(e,E.add(e,[s*.02,.06,-.07]),.016,.002,'g',P.glow,4,hb);if(L>=3)E.L(E.add(e,[0,.01,0]),E.add(e,[s*.035,.1,-.14]),.012,.001,'g',P.glow2,3,hb)});
  {const nk=B([0,.675,.425]),ring=[];for(let i=0;i<10;i++){const a=i/10*6.283;ring.push(E.add(nk,[Math.cos(a)*.036,Math.sin(a)*.042,0]))}
    for(let i=0;i<10;i++)E.pd('ring','m',P.iron,ring[i],E.nrm([ring[(i+1)%10][0]-ring[i][0],ring[(i+1)%10][1]-ring[i][1],0]),[.016,.03,.016],null,{vs:1});
    EVO100_M.charm(E,E.add(nk,[0,-.04,.012]),.08,P.glow,'gem')}
  if(L>=2){// glowing runes on the robe's flanks, spectral ribbons from the horn tips
    [-1,1].forEach(s=>[.21,.07].forEach(z=>{const h=E.on([s*2,B([0,.6,z])[1],B([0,0,z])[2]],[-s,0,0]);if(h)E.rune(h,[0,0,1],.05,P.glow)}));
    [-1,1].forEach(s=>{const t=B([s*.21,.64,.43]);E.L(t,E.add(t,[s*.02,-.07,-.04]),.012,.002,'g',P.glow2,4,hb)})}
  if(L>=3){// grave-iron: pauldrons on the robe's shoulders, a plate on the cranium behind the crown, spiked plates on the hip pelt
    [-1,1].forEach(s=>{const h=E.on([s*2,B([0,.63,0])[1],B([0,0,.25])[2]],[-s,-.4,0]);if(h){E.plate(h.p,h.n,[0,0,1],.08,.11,.016,'m',P.metal,'hem');E.pd('cone4','m',P.trim,E.add(h.p,h.n,.035),E.nrm([s,.6,0]),[.012,.05,.012])}});
    {const h=E.top(0,B([0,0,.47])[2]);if(h)E.pd('hem','m',P.metal,E.add(h.p,h.n,-.004),h.n,[.07,.02,.05],[0,0,1],hb)}
    [-.17,-.26].forEach(z=>{const h=E.top(0,B([0,0,z])[2]);if(h){E.pd('box','m',P.metal,E.add(h.p,h.n,.004),h.n,[.1,.012,.06],[0,0,1]);E.pd('cone4','m',P.trim,E.add(h.p,h.n,.03),E.nrm([0,1,-.4]),[.012,.05,.012])}})}
  if(L>=4){// a halo of soul-fire over the crown on three spirit threads, a rune burned into the brow, gold bands on the horns
    const c=B([0,.95,.5]),r=.11;for(let i=0;i<14;i++){const a=i/14*6.283,a2=(i+1)/14*6.283;E.L(E.add(c,[Math.cos(a)*r,0,Math.sin(a)*r]),E.add(c,[Math.cos(a2)*r,0,Math.sin(a2)*r]),.007,.007,'g',P.glow,3,hb);
      if(i%2==0)E.pd('oct','g',P.glow2,E.add(c,[Math.cos(a)*r,0,Math.sin(a)*r]),[0,1,0],[.01,.02,.01],null,hb)}
    [0,2,4].forEach(i=>{const a=(i/6-.5)*Math.PI*1.6,cr=B([0,.765,.52]),tip=[Math.sin(a)*.078*1.15,cr[1]+.1,cr[2]+Math.cos(a)*.068];E.L(tip,E.add(c,[Math.sin(a)*r,0,Math.cos(a)*r]),.004,.003,'g',P.glow2,3,hb)});
    {const h=E.top(0,B([0,0,.6])[2]);if(h)E.rune({p:E.add(h.p,h.n,.01),n:h.n},[0,0,1],.035,P.glow,hb)}
    [-1,1].forEach(s=>[[.12,.82,.43],[.24,.72,.345]].forEach(q=>E.pd('ring','m',P.gold,B([s*q[0],q[1],q[2]]),[s*.3,1,0],[.032,.03,.032],null,hb)))}
  if(L>=5){// spectral flames wreathing the ribcage and the legs
    [-1,1].forEach(s=>{[.2,.06,-.06].forEach(z=>{const p=B([s*.172,.5,z]);E.L(p,E.add(p,[s*.03,.11,-.05]),.022,.002,'g',P.glow,4)});
      [[s<0?'fl1':'fr1',.105,.24,.22],[s<0?'hl1':'hr1',.114,.28,-.2]].forEach(q=>{const p=B([s*q[1],q[2],q[3]]);E.L(p,E.add(p,[s*.03,.09,-.04]),.016,.002,'g',P.glow2,4,{bn:q[0]})})})}}
