// ================= v150: Pyrewing, Elderdrake, Stormtalon and Rocsovereign get bodies of their own =================
// Owner: "Some of our companions are just reskinned versions of lower tiered companions. Redo those ones and give them
// original models." Pyrewing and Elderdrake were the Drakelet in red / black, Stormtalon and Rocsovereign the Skyhawk in
// blue / gold. Each now has its own body on the shared skeleton (rig variants, RV137 in 2600: same bones, walk, attack and
// wing flapping, same gameplay); Drakelet and Skyhawk look as before. Colour still comes from the species colour (c.cl).
//  * Pyrewing — a slender wyvern-like fire drake: a deep keel chest and wasp waist, a long arched neck, a narrow wedge head
//    with long swept horns and a spiny cheek frill, charcoal hide split by glowing lava cracks, obsidian spines with ember
//    tips, thin raptor legs, a very long whip tail ending in a flame blade, and huge fingered wings whose membranes burn
//    from charcoal at the root to ember orange at the edge.
//  * Elderdrake — an ancient, massive dragon: a wide barrel body on thick pillar legs, a short heavy neck, a big blocky
//    head with a crown of nine horns round the skull, a bearded lower jaw with tusks, mossy weathered scales with rows of
//    stone osteoderms and a central ridge of blunt spikes, a thick plated tail ending in a spiked bone club, and broad
//    tattered wings with heavy bone fingers.
//  * Stormtalon — a lean storm eagle: a slim horizontal body with a slender neck, a sleek head with a steel hooked beak and
//    a crest of zigzag lightning plumes with glowing tips, glowing streaks under the eyes, a pale chevroned breast, thick
//    feathered trousers over huge black talons, long narrow swept falcon wings and a narrow tail with two forked streamers.
//  * Rocsovereign — a colossal regal roc: a deep barrel chest and thick neck under a layered mantle of hackle feathers,
//    a massive ivory-gold hooked beak, an upright crown of stiff golden-tipped crest feathers, legs feathered down to the
//    ankles, broad rounded wings with fingered primaries and a broad fanned tail.
// Their evolution looks (EVO100.D.Drakelet / .Skyhawk, rays onto the body) get a design per variant so nothing floats or
// sinks on the new shapes. Variant wings use their own lpwWing keys; stale ray-surface caches are dropped.
RV137.var.Drakelet=['Drakelet','Pyrewing','Elderdrake'];RV137.var.Skyhawk=['Skyhawk','Stormtalon','Rocsovereign'];
if(EVO100.surf){delete EVO100.surf.Drakelet;delete EVO100.surf.Skyhawk}
// ---------------- helpers ----------------
// body rows [z, y, half width, above, below, bones, kind] → lpGeo rings
function dh150Rings(T){return T.map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],k:r[6]||0,i,z:r[0]}))}
// the body section at z (interpolated): {y, w, a, b}
function dh150At(T,z){for(let i=0;i<T.length-1;i++){const A=T[i],B=T[i+1],lo=Math.min(A[0],B[0]),hi=Math.max(A[0],B[0]);if(z>=lo&&z<=hi){const t=(z-A[0])/((B[0]-A[0])||1);
  return {y:A[1]+(B[1]-A[1])*t,w:A[2]+(B[2]-A[2])*t,a:A[3]+(B[3]-A[3])*t,b:A[4]+(B[4]-A[4])*t}}}const E=Math.abs(z-T[0][0])<Math.abs(z-T[T.length-1][0])?T[0]:T[T.length-1];return {y:E[1],w:E[2],a:E[3],b:E[4]}}
// a point on the body surface at z, t radians from the top (0 = spine, PI/2 = flank), side s; k pulls it in a little
function dh150Pt(T,z,t,s,k){const q=dh150At(T,z),c=Math.cos(t),f=k==null?.95:k;return [s*q.w*Math.sin(t)*f,q.y+(c>0?q.a:q.b)*c*f,z]}
function dh150N(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}
// Euler angles turning +y to dir with +z toward nrm (for flat parts: feathers, plates)
function dh150Rot(dir,nrm){const Y=new THREE.Vector3(...dh150N(dir)),Z=new THREE.Vector3(...nrm);Z.sub(Y.clone().multiplyScalar(Z.dot(Y)));
  if(Z.lengthSq()<1e-8){Z.set(1,0,0).sub(Y.clone().multiplyScalar(Y.x))}Z.normalize();const X=new THREE.Vector3().crossVectors(Y,Z),e=new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));return [e.x,e.y,e.z]}
// a flat part (feather / plate / blade) from a along dir, length len, width w, thickness th, face toward nrm
function dh150F(k,bn,geo,t,col,a,dir,nrm,len,w,th){const d=dh150N(dir),r=dh150Rot(d,nrm);k.p(bn,geo,t,col,a[0]+d[0]*len/2,a[1]+d[1]*len/2,a[2]+d[2]*len/2,w,len,th,r[0],r[1],r[2])}
// rigid kit bone for a point along a drake's body line
function dh150DB(z){return z>.51?'head':z>.34?'neck':z>.1?'chest':z>-.14?'spine':z>-.4?'pelvis':z>-.56?'tail0':z>-.84?'tail1':z>-1.09?'tail2':'tail3'}
function dh150HB(z){return z>.34?'head':z>.27?'neck':z>.15?'chest':z>.0?'spine':z>-.22?'pelvis':'tail0'}
// legs: rows [x,y,z,rx,rz,bones,foot] for the right side; mirrored for s<0
function dh150Legs(L,s,seg,paint){return L.map(R=>({rings:R.map(r=>({p:[s*r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5].map(v=>typeof v=='string'?v.replace(/^([fh])r/,s<0?'$1l':'$1r'):v),d:r[6]||0,y:r[1]})),seg:seg||6,ref:[0,0,1],capB:1,paint}))}
// per-variant anchors for the trait / colour-variant extras (lpExtras reads D.head, D.back)
function dh150Anchors(D,n,M){const h0=D.head,b0=D.back;
  Object.defineProperty(D,'head',{configurable:true,get(){const v=M[RV137.cur[n]];return v?v.head:h0},set(v){}});
  Object.defineProperty(D,'back',{configurable:true,get(){const v=M[RV137.cur[n]];return v?v.back:b0},set(v){}})}

// ======================================================================== Pyrewing ========================================================================
var PW150={body:[
  [1.0,.664,.012,.01,.01,['head','head',0],1],
  [.96,.668,.032,.022,.018,['head','head',0],1],
  [.89,.676,.048,.032,.028,['head','head',0],0],
  [.8,.688,.06,.044,.036,['head','head',0],0],
  [.71,.703,.07,.054,.044,['head','head',0],0],
  [.63,.716,.075,.063,.048,['head','head',0],0],
  [.565,.712,.066,.064,.052,['head','head',0],0],
  [.51,.695,.052,.056,.054,['neck','head',.6],0],
  [.455,.655,.046,.048,.052,['neck','neck',0],0],
  [.4,.605,.05,.05,.058,['neck','neck',0],0],
  [.34,.55,.064,.064,.08,['neck','chest',.6],0],
  [.27,.505,.088,.088,.125,['chest','chest',0],0],
  [.18,.48,.104,.098,.148,['chest','chest',0],0],
  [.08,.472,.098,.092,.135,['chest','spine',.5],0],
  [-.02,.472,.078,.08,.098,['spine','spine',0],0],
  [-.12,.474,.078,.078,.094,['spine','pelvis',.6],0],
  [-.23,.478,.092,.09,.098,['pelvis','pelvis',0],0],
  [-.34,.472,.074,.072,.072,['pelvis','tail0',.5],0],
  [-.46,.47,.054,.052,.05,['tail0','tail1',.4],0],
  [-.62,.48,.04,.038,.036,['tail1','tail1',0],0],
  [-.78,.503,.03,.028,.027,['tail1','tail2',.5],0],
  [-.94,.524,.022,.021,.02,['tail2','tail2',0],0],
  [-1.08,.544,.016,.015,.014,['tail2','tail3',.5],0],
  [-1.22,.56,.011,.01,.01,['tail3','tail3',0],0],
  [-1.36,.57,.007,.007,.007,['tail3','tail3',0],0],
  [-1.46,.575,.003,.003,.003,['tail3','tail3',0],0]],
 legs:[[[.092,.48,.2,.06,.07,['chest','fr0',.5]],[.1,.36,.215,.05,.058,['fr0','fr0',0]],[.102,.23,.24,.034,.038,['fr0','fr1',.7]],
        [.102,.15,.235,.028,.03,['fr1','fr1',0],1],[.102,.075,.22,.026,.028,['fr1','fr2',.8],1],[.102,.04,.225,.028,.032,['fr2','fr2',0],1]],
       [[.095,.5,-.26,.075,.1,['pelvis','hr0',.4]],[.112,.38,-.24,.07,.09,['hr0','hr0',0]],[.114,.27,-.2,.042,.05,['hr0','hr1',.6]],
        [.112,.2,-.22,.03,.034,['hr1','hr1',0],1],[.112,.12,-.28,.027,.03,['hr1','hr2',.7],1],[.112,.045,-.29,.028,.032,['hr2','hr2',0],1]]],
 head:['head',0,.79,.6],back:[['neck',0,.68,.44],['chest',0,.6,.22],['spine',0,.56,0],['pelvis',0,.57,-.23],['tail1',0,.52,-.62]]};
function pw150Geo(C){
  const main=lpMain(C,.3),hide=main.clone().multiplyScalar(.5).lerp(new THREE.Color(0x1c1210),.35),back=hide.clone().multiplyScalar(.62),
    lava=new THREE.Color(0xff7a1a),bel=new THREE.Color(0xb8622a).lerp(main,.3),obs=new THREE.Color(0x1a1210),nose=new THREE.Color(0x1a0c08);
  const body={rings:dh150Rings(PW150.body),seg:10,capA:1,capB:1,paint:(o,r,s,cc,i)=>{
    if(r.k==1)return o.copy(nose);o.copy(hide);if(s>.55)o.copy(back);
    if(s<-.5&&i>7&&i<18){o.copy(bel);if(i%2)o.multiplyScalar(.8);return}
    // lava cracks: scattered glowing seams over the flanks, neck and thighs (not on the head)
    if(i>7&&i<21&&s>-.6&&((i*5+Math.round((cc+1)*4.5)+(s>0?2:0))%7==0))o.lerp(lava,.55)}};
  const legs=[].concat(...[-1,1].map(s=>dh150Legs(PW150.legs,s,6,(o,r,sn)=>{o.copy(r.d?obs:hide);if(!r.d&&sn<-.3)o.lerp(back,.4);if(!r.d&&r.y<.4&&r.y>.3&&sn>0)o.copy(lava).lerp(hide,.35)})));
  return lpGeo('PW150|'+C,'Drakelet',[body].concat(legs),151)}
function pw150Kit(k,c,C,red){
  const T=PW150.body,main=lpMain(C,.3),hide=dkShade(main.clone().multiplyScalar(.5).lerp(new THREE.Color(0x1c1210),.35).getHex(),1),obs=0x1e1614,obs2=0x2e2420,
    lava=0xff6a14,ember=0xffa040,eye=red?0xff2a2a:0xffc23a,tooth=0xe8dcc0,horn=0x2a201c,horn2=0x4a3a30;
  [-1,1].forEach(s=>{
    // eyes under a sharp brow, glowing nostrils
    k.p('head','box','c',0x070506,s*.064,.727,.705,.04,.022,.016,0,s*.5,-s*.15);
    k.p('head','box','g',eye,s*.07,.729,.708,.032,.01,.008,0,s*.5,-s*.22);
    k.p('head','box','c',obs,s*.06,.752,.695,.066,.016,.034,0,s*.45,s*.3);
    k.p('head','sph','g',lava,s*.017,.674,.955,.008,.006,.01);
    // one long pair of swept horns, a short pair under them
    k.L('head','c',horn2,[s*.048,.765,.6],[s*.1,.808,.45],.026,.016,5).L('head','c',horn,[s*.1,.808,.45],[s*.125,.85,.31],.016,.003,5);
    k.L('head','c',horn2,[s*.062,.742,.565],[s*.14,.745,.47],.016,.002,4);
    // spiny cheek frill fanning back from the jaw hinge
    for(let i=0;i<3;i++)k.L('head','c',i%2?obs2:obs,[s*.062,.7-i*.012,.58-i*.01],[s*(.15+i*.025),.72-i*.045,.47-i*.035],.016,.002,4);
    // upper fangs, lower teeth
    for(let i=0;i<4;i++)k.p('head','cone4','c',tooth,s*(.026+i*.005),.652,.92-i*.07,.007,.034,.007,Math.PI);
    for(let i=0;i<3;i++)k.p('jaw','cone4','c',tooth,s*(.022+i*.005),.664,.88-i*.08,.006,.026,.006);
  });
  // a long narrow lower jaw with embers glowing in the throat
  k.L('jaw','c',dkShade(0xb8622a,.7),[0,.638,.58],[0,.645,.93],.036,.011,5);
  k.p('jaw','box','g',lava,0,.656,.76,.026,.005,.15);
  // obsidian spines down the neck, back and tail, ember tips
  for(let z=.5;z>-1.3;z-=z>-.4?.075:.11){const q=dh150At(T,z),top=q.y+q.a,h=z>.36?.05:z>-.4?.075-Math.abs(z+.05)*.03:.045+z*.012,bn=dh150DB(z),r=z>-.4?.017:.012;if(h<.012)continue;
    const a=[0,top-.012,z+.015],b=[0,top+h,z-.045];k.L(bn,'c',obs,a,b,r,.002,4);k.L(bn,'g',ember,[0,top+h*.68,z-.03],[0,top+h*1.02,z-.046],r*.4,.001,3)}
  // lava cracks: glowing zigzags across the flanks and shoulders
  [[.2,'chest',[[.6,0],[.85,-.03],[1.1,.01],[1.4,-.04],[1.7,-.02]]],[-.02,'spine',[[.55,0],[.8,.04],[1.05,0],[1.3,.05],[1.55,.02]]],[-.22,'pelvis',[[.6,0],[.9,-.035],[1.2,.0],[1.45,-.05]]]].forEach((q,j)=>[-1,1].forEach(s=>{
    const P=q[2].map(u=>dh150Pt(T,q[0]+u[1],u[0],s,.99));for(let i=0;i<P.length-1;i++)k.L(q[1],'g',i%2?lava:ember,P[i],P[i+1],.0075-i*.001,.0065-i*.001,3);
    const f=dh150Pt(T,q[0]+.05,1.15,s,.99);k.L(q[1],'g',lava,P[2],f,.005,.003,3)}));
  // the whip tail's flame blade and obsidian barbs
  k.p('tail3','cone4','g',ember,0,.59,-1.53,.012,.16,.05,-Math.PI/2-.2);
  k.p('tail3','cone4','g',lava,0,.582,-1.47,.014,.1,.075,-Math.PI/2-.15);
  [-1,1].forEach(s=>k.L('tail3','c',obs,[0,.574,-1.42],[s*.07,.578,-1.36],.014,.002,4));
  // obsidian talons
  [['fl2',-.102,.225],['fr2',.102,.225],['hl2',-.112,-.29],['hr2',.112,-.29]].forEach(f=>{k.p(f[0],'box','c',obs,f[1],.02,f[2]+.03,.055,.034,.08);
    [-1,0,1].forEach(i=>{k.L(f[0],'c',obs2,[f[1]+i*.018,.022,f[2]+.06],[f[1]+i*.024,.016,f[2]+.1],.009,.006,4);k.p(f[0],'cone4','c',0x0c0806,f[1]+i*.025,.012,f[2]+.12,.007,.04,.007,Math.PI/2+.3)})});
}
function pw150Post(x,c,C,mat){
  const main=lpMain(C,.3),root=main.clone().multiplyScalar(.32).lerp(new THREE.Color(0x1a0e0a),.4),edge=new THREE.Color(0xff6a1a).lerp(main,.25),bone=new THREE.Color(0x1e1614);
  // huge fingered sail wings: four long fingers, membranes burning toward the edge
  const W=lpwWing('pw150|'+C,
    [[0,0,.07],[.3,.09,.12],[.6,.13,.08],[.85,.1,.02],[1.3,.03,-.1],[1.08,-.02,-.3],[1.02,.01,-.48],[.82,-.03,-.5],[.74,0,-.72],[.54,-.03,-.62],[.38,0,-.76],[.22,-.03,-.58],[.08,-.01,-.48],[0,0,-.36]],
    [.5,.05,-.25],
    [[[0,.01,.07],[.6,.14,.08],.034],[[.6,.14,.08],[.85,.11,.02],.024],[[.6,.13,.08],[1.3,.03,-.1],.016],[[.6,.13,.08],[1.02,.01,-.48],.015],[[.6,.13,.08],[.74,0,-.72],.014],[[.6,.13,.08],[.38,0,-.76],.013],[[.6,.14,.08],[.64,.21,.14],.016]],
    root,edge,bone);
  lpwPair(x,'chest',W,lpMat(c.v,0,{emissive:c.v=='Frost'?0x0a1a2a:0x3a0e00}),.09,.56,.15,.32,.12,.45,.55)}

// ======================================================================== Elderdrake ========================================================================
var ED150={body:[
  [.93,.655,.04,.03,.03,['head','head',0],1],
  [.89,.66,.07,.05,.04,['head','head',0],0],
  [.81,.672,.09,.065,.05,['head','head',0],0],
  [.72,.69,.105,.08,.06,['head','head',0],0],
  [.64,.71,.12,.095,.07,['head','head',0],0],
  [.57,.715,.125,.1,.08,['head','head',0],0],
  [.51,.69,.115,.1,.1,['neck','head',.6],0],
  [.45,.645,.12,.11,.12,['neck','neck',0],0],
  [.38,.59,.14,.13,.15,['neck','chest',.5],0],
  [.3,.54,.17,.155,.18,['neck','chest',.85],0],
  [.2,.5,.2,.17,.2,['chest','chest',0],0],
  [.08,.49,.215,.18,.2,['chest','spine',.5],0],
  [-.04,.485,.21,.175,.19,['spine','spine',0],0],
  [-.16,.485,.2,.17,.18,['spine','pelvis',.6],0],
  [-.28,.485,.19,.165,.16,['pelvis','pelvis',0],0],
  [-.4,.48,.15,.13,.12,['pelvis','tail0',.5],0],
  [-.52,.476,.12,.105,.095,['tail0','tail1',.4],0],
  [-.68,.482,.1,.09,.08,['tail1','tail1',0],0],
  [-.84,.5,.08,.072,.064,['tail1','tail2',.5],0],
  [-.98,.52,.065,.06,.052,['tail2','tail2',0],0],
  [-1.1,.54,.05,.046,.04,['tail2','tail3',.5],0],
  [-1.2,.555,.04,.036,.032,['tail3','tail3',0],0],
  [-1.25,.558,.022,.02,.02,['tail3','tail3',0],0]],
 legs:[[[.14,.46,.22,.1,.11,['chest','fr0',.5]],[.14,.34,.23,.09,.095,['fr0','fr0',0]],[.13,.22,.245,.075,.078,['fr0','fr1',.7]],
        [.125,.14,.235,.066,.068,['fr1','fr1',0],1],[.125,.075,.225,.062,.064,['fr1','fr2',.8],1],[.125,.036,.23,.07,.075,['fr2','fr2',0],1]],
       [[.15,.5,-.28,.12,.15,['pelvis','hr0',.4]],[.16,.37,-.26,.11,.13,['hr0','hr0',0]],[.15,.26,-.22,.08,.09,['hr0','hr1',.6]],
        [.14,.18,-.22,.066,.07,['hr1','hr1',0],1],[.135,.1,-.27,.062,.064,['hr1','hr2',.7],1],[.135,.04,-.29,.07,.075,['hr2','hr2',0],1]]],
 head:['head',0,.83,.6],back:[['neck',0,.77,.42],['chest',0,.69,.2],['spine',0,.68,0],['pelvis',0,.66,-.24],['tail1',0,.58,-.68]]};
function ed150Cols(C){const main=lpMain(C,.32).lerp(new THREE.Color(0x5a5446),.3);return {main,hide:main.clone(),dk:main.clone().multiplyScalar(.6),moss:new THREE.Color(0x4e5e2a),moss2:new THREE.Color(0x3a4a22),
  bel:new THREE.Color(0x9a8a68).lerp(main,.25),bone:new THREE.Color(0xb8aa88),stone:new THREE.Color(0x6a665a)}}
function ed150Geo(C){
  const K=ed150Cols(C),nose=new THREE.Color(0x1a1410);
  const body={rings:dh150Rings(ED150.body),seg:10,capA:1,capB:1,paint:(o,r,s,cc,i)=>{
    if(r.k==1)return o.copy(nose);o.copy(K.hide);
    // weathered scale rows: every other scale darker
    if((i+Math.round((cc+1)*5))%2==0)o.lerp(K.dk,.45);
    if(s<-.5&&i>6&&i<17){o.copy(K.bel);if(i%2)o.multiplyScalar(.82);return}
    // moss on the back and the top of the head
    if(s>.45&&((i*3+Math.round((cc+1)*4))%4!=1))o.lerp(i%2?K.moss:K.moss2,.6+(s>.8?.25:0));
    if(r.z>.5&&s>.3)o.lerp(K.stone,.25)}};
  const legs=[].concat(...[-1,1].map(s=>dh150Legs(ED150.legs,s,8,(o,r,sn)=>{o.copy(r.d?K.dk:K.hide);if(r.d)o.lerp(K.stone,.3);if(!r.d&&sn>.4&&r.y>.33)o.lerp(K.moss,.45)})));
  return lpGeo('ED150|'+C,'Drakelet',[body].concat(legs),152)}
function ed150Kit(k,c,C,red){
  const T=ED150.body,K=ed150Cols(C),hide=K.hide.getHex(),dk=K.dk.getHex(),bone=0xb8aa88,boneD=0x8a7c62,horn=0x9a8c70,hornD=0x5a5040,moss=0x4e5e2a,moss2=0x3a4a22,stone=0x6a665a,
    eye=red?0xff2a2a:0xffc830,tooth=0xe0d6b8;
  [-1,1].forEach(s=>{
    // small deep-set eyes under a heavy brow ridge
    k.p('head','box','c',0x050404,s*.098,.722,.725,.04,.024,.02,0,s*.45,-s*.1);
    k.p('head','box','g',eye,s*.104,.723,.729,.026,.01,.008,0,s*.45,-s*.15);
    k.p('head','box','c',boneD,s*.088,.762,.718,.085,.032,.065,0,s*.35,s*.22);
    k.p('head','sph','c',0x0a0806,s*.026,.672,.93,.012,.008,.012);
    // the great horns: thick, curling back past the neck
    const H=[[s*.085,.79,.6],[s*.165,.865,.47],[s*.235,.895,.335],[s*.265,.86,.205],[s*.255,.795,.135]],R=[.048,.038,.027,.016,.006];
    for(let i=0;i<4;i++)k.L('head','c',i<2?horn:hornD,H[i],H[i+1],R[i],R[i+1],5);
    // the crown: four lesser horns round each side of the skull's back
    [.3,.65,1.0,1.35].forEach((t,i)=>{const b=[s*.118*Math.sin(t),.715+.1*Math.cos(t)*(Math.cos(t)>0?1:.8),.56-i*.012],d=dh150N([s*Math.sin(t)*.7,Math.cos(t)*.6+.15,-1]),L=.17-i*.025;
      k.L('head','c',i%2?hornD:horn,b,[b[0]+d[0]*L,b[1]+d[1]*L,b[2]+d[2]*L],.026-i*.003,.003,5)});
    // the beard: bone spikes hanging back from the lower jaw, tusks
    for(let i=0;i<4;i++){const b=[s*(.03+i*.018),.606,.82-i*.05];k.L('jaw','c',i%2?boneD:horn,b,[b[0]+s*.015,b[1]-.09-i*.015,b[2]-.07],.018,.003,4)}
    k.L('jaw','c',tooth,[s*.058,.648,.86],[s*.07,.715,.835],.016,.003,4);
    for(let i=0;i<4;i++)k.p('head','cone4','c',tooth,s*(.05+i*.012),.638,.88-i*.06,.009,.04,.009,Math.PI);
  });
  // a heavy square lower jaw with a dark mouth line, a long central beard
  k.p('jaw','box','c',dkShade(hide,.85),0,.627,.74,.15,.05,.3);
  k.p('jaw','box','c',0x200806,0,.654,.76,.13,.006,.26);
  [-1,0,1].forEach(i=>k.L('jaw','c',i?boneD:horn,[i*.02,.6,.86],[i*.03,.47,.78],.022,.003,4));
  // nose horns
  k.L('head','c',horn,[0,.705,.86],[0,.765,.83],.026,.004,4);k.L('head','c',horn,[0,.75,.76],[0,.8,.72],.02,.003,4);
  // the back: a central ridge of blunt stone spikes, two rows of osteoderm plates either side, moss tufts
  for(let z=.4;z>-.5;z-=.1){const q=dh150At(T,z),top=q.y+q.a,bn=dh150DB(z),h=.07+.04*Math.max(0,1-Math.abs(z+.02)*2.5);
    k.p(bn,'cone4','c',z>.35?dk:(Math.round(z*10)%2?boneD:stone),0,top+h*.35,z,.05,h,.06,-.25);
    [-1,1].forEach(s=>[.55,1.0].forEach((t,j)=>{const p=dh150Pt(T,z+(j?.04:0),t,s,.98),r=dh150Rot([s*Math.sin(t),Math.cos(t),0],[0,0,1]);k.p(bn,'dod','c',j?dk:stone,p[0],p[1],p[2],.045-j*.008,.02,.055-j*.008,r[0],r[1],r[2])}));
    if(Math.round(z*10)%3==0)[-1,1].forEach(s=>{const p=dh150Pt(T,z-.05,.3,s,1.0);k.p(bn,'dod','c',s>0?moss:moss2,p[0],p[1],p[2],.04,.022,.035)})}
  // moss hanging from the flanks and the throat
  [[.18,1.5],[.02,1.55],[-.18,1.5],[.34,1.7]].forEach((q,i)=>[-1,1].forEach(s=>{const p=dh150Pt(T,q[0],q[1],s,1.0),bn=dh150DB(q[0]);k.L(bn,'c',i%2?moss2:0x2e3a1c,p,[p[0]+s*.012,p[1]-.07-i%2*.03,p[2]-.02],.011,.002,3)}));
  // the plated tail: overlapping plates on top, side plates, a spiked bone club
  for(let z=-.5;z>-1.2;z-=.09){const q=dh150At(T,z),top=q.y+q.a,bn=dh150DB(z),w=q.w*1.5;
    k.p(bn,'box','c',Math.round(z*11)%2?dk:dkShade(dk,1.25),0,top+.004,z,w,.03,.1,-.12);
    [-1,1].forEach(s=>{const p=dh150Pt(T,z,1.25,s,.98);const r=dh150Rot([s,0.3,0],[0,0,1]);k.p(bn,'cone4','c',boneD,p[0],p[1],p[2],.02,.05+q.w*.2,.04,r[0],r[1],r[2])})}
  k.p('tail3','dod','c',bone,0,.556,-1.27,.075,.065,.085);
  [[1,0,0],[-1,0,0],[0,1,0],[.7,.6,-.3],[-.7,.6,-.3],[0,.3,-1],[.6,-.5,-.2],[-.6,-.5,-.2]].forEach(d=>{const n=dh150N(d),b=[n[0]*.05,.556+n[1]*.05,-1.27+n[2]*.06];
    k.L('tail3','c',boneD,b,[b[0]+n[0]*.07,b[1]+n[1]*.07,b[2]+n[2]*.07],.022,.002,4)});
  // thick blunt bone claws on broad feet
  [['fl2',-.125,.23],['fr2',.125,.23],['hl2',-.135,-.29],['hr2',.135,-.29]].forEach(f=>{k.p(f[0],'box','c',dk,f[1],.026,f[2]+.03,.13,.05,.12);
    [-1.5,-.5,.5,1.5].forEach(i=>k.p(f[0],'cone4','c',0xc8bc9c,f[1]+i*.03,.02,f[2]+.1,.016,.05,.014,Math.PI/2))});
}
function ed150Post(x,c,C,mat){
  const K=ed150Cols(C),root=K.main.clone().multiplyScalar(.55).lerp(K.moss2,.25),edge=new THREE.Color(0x221e18),bone=new THREE.Color(0x8a7c62);
  // broad tattered wings: heavy bone fingers, a ragged notched trailing edge
  const W=lpwWing('ed150|'+C,
    [[0,0,.08],[.28,.08,.13],[.55,.12,.1],[.82,.08,0],[1.1,.02,-.16],[.98,-.02,-.27],[1.0,.01,-.36],[.86,-.02,-.38],[.84,0,-.55],[.7,-.03,-.5],[.66,-.01,-.62],[.52,-.03,-.58],[.44,0,-.7],[.33,-.03,-.6],[.25,-.02,-.66],[.12,-.03,-.52],[0,0,-.38]],
    [.45,.05,-.25],
    [[[0,.01,.08],[.55,.13,.1],.045],[[.55,.13,.1],[.82,.09,0],.032],[[.55,.12,.1],[1.1,.02,-.16],.022],[[.55,.12,.1],[.84,0,-.55],.02],[[.55,.12,.1],[.44,0,-.7],.02],[[.55,.13,.1],[.6,.22,.17],.022]],
    root,edge,bone);
  lpwPair(x,'chest',W,mat,.16,.65,.14,.4,.1,.3,.45)}

// ======================================================================== Stormtalon ========================================================================
var ST150={body:[
  [-.36,.54,.024,.02,.02,['tail0','tail0',0],0],
  [-.28,.55,.06,.052,.05,['tail0','pelvis',.4],0],
  [-.16,.565,.1,.095,.1,['pelvis','pelvis',0],0],
  [-.04,.59,.122,.112,.13,['pelvis','spine',.6],0],
  [.07,.625,.128,.118,.145,['spine','spine',0],0],
  [.16,.665,.118,.108,.135,['spine','chest',.7],0],
  [.24,.722,.088,.084,.098,['chest','neck',.4],0],
  [.3,.782,.064,.064,.07,['neck','neck',0],0],
  [.35,.836,.064,.068,.06,['neck','head',.7],1],
  [.4,.875,.072,.07,.055,['head','head',0],1],
  [.46,.885,.062,.058,.045,['head','head',0],1],
  [.51,.882,.04,.035,.03,['head','head',0],2]],
 leg:[[.075,.52,-.03,.075,.085,['pelvis','hr0',.5]],[.078,.43,0,.08,.088,['hr0','hr0',0]],[.075,.34,.015,.062,.068,['hr0','hr1',.6]],
      [.075,.285,.02,.024,.026,['hr1','hr1',0],1],[.075,.12,-.015,.021,.023,['hr1','hr2',.8],1],[.075,.04,0,.024,.026,['hr2','hr2',0],1]],
 head:['head',0,.95,.42],back:[['neck',0,.85,.3],['chest',0,.79,.2],['spine',0,.745,.07],['pelvis',0,.67,-.06]]};
function st150Cols(C){const main=lpMain(C,.2);return {main,back:main.clone().multiplyScalar(.5),pale:new THREE.Color(0xd8dce0).lerp(main,.12),chev:main.clone().multiplyScalar(.35).lerp(new THREE.Color(0x1a2030),.4),
  scale:new THREE.Color(0x5a6070),cere:new THREE.Color(0x8a9098)}}
function st150Geo(C){
  const K=st150Cols(C),trou=K.main.clone().lerp(K.pale,.3).multiplyScalar(.8);
  const body={rings:dh150Rings(ST150.body).map(r=>(r.j=r.k?0:.05,r)),seg:10,capA:1,capB:1,paint:(o,r,s,cc,i)=>{
    if(r.k==2)return o.copy(K.cere);o.copy(K.main);if(s>.35)o.lerp(K.back,.8);
    if(r.k==1){if(s<.25&&s>-.1)o.copy(K.back).multiplyScalar(.7);if(s<-.1)o.copy(K.pale);return}// dark mask through the eyes, pale throat
    if(s<-.15){o.copy(K.pale);if(i>1&&i<8&&((i+Math.round((cc+1)*3))%2==0))o.lerp(K.chev,.6)}}};
  const legs=[-1,1].map(s=>dh150Legs([ST150.leg],s,7,(o,r,sn)=>{o.copy(r.d?K.scale:trou);if(!r.d&&sn<0)o.lerp(K.back,.35)})[0]);
  return lpGeo('ST150|'+C,'Skyhawk',[body].concat(legs),153)}
function st150Kit(k,c,C,red){
  const K=st150Cols(C),main=K.main.getHex(),back=dkShade(main,.5),deep=dkShade(main,.3),eye=red?0xff2a2a:0xf4e46a,glow=0x9ae8ff,steel=0x2a2e34,steelD=0x14161a,claw=0x0a0a0c,scale=0x5a6070;
  [-1,1].forEach(s=>{
    // fierce eyes in the dark mask, a heavy brow, a glowing lightning streak under each eye
    k.p('head','box','c',0x050506,s*.062,.893,.445,.038,.028,.016,0,s*.62,-s*.1);
    k.p('head','box','g',eye,s*.068,.895,.449,.028,.014,.008,0,s*.62,-s*.15);
    k.p('head','box','c',deep,s*.055,.917,.452,.07,.018,.05,0,s*.5,s*.28);
    k.L('head','g',glow,[s*.064,.873,.452],[s*.07,.86,.42],.006,.005,3).L('head','g',glow,[s*.07,.86,.42],[s*.07,.862,.39],.005,.004,3).L('head','g',glow,[s*.07,.862,.39],[s*.072,.845,.36],.004,.002,3);
    // huge talons: three long scaled toes forward, one back, two-part black claws
    const f=s<0?'hl2':'hr2',fx=s*.075;
    [-1,0,1].forEach(i=>{const e=[fx+i*.058,.022,.135-Math.abs(i)*.03];k.L(f,'c',scale,[fx,.026,0],e,.019,.015,4);
      k.L(f,'c',claw,e,[e[0]+i*.008,.032,e[2]+.035],.014,.008,4).L(f,'c',claw,[e[0]+i*.008,.032,e[2]+.035],[e[0]+i*.01,.0,e[2]+.06],.008,.002,4)});
    k.L(f,'c',scale,[fx,.026,0],[fx,.022,-.08],.018,.014,4).L(f,'c',claw,[fx,.022,-.08],[fx,.03,-.11],.013,.007,4).L(f,'c',claw,[fx,.03,-.11],[fx,.0,-.13],.007,.002,4);
    // feathered trousers: a ragged fringe over the knees
    for(let i=0;i<4;i++){const a=i/3*Math.PI*1.2-.6*Math.PI+Math.PI/2*(1-s);k.L(s<0?'hl0':'hr0','c',i%2?back:main,[fx+Math.cos(a)*.06,.36,.015+Math.sin(a)*.06],[fx+Math.cos(a)*.07,.3,.02+Math.sin(a)*.07],.03,.004,4)}
  });
  // a sleek steel beak with a sharp hook
  k.L('head','c',steel,[0,.884,.5],[0,.874,.6],.03,.015,4).L('head','c',steelD,[0,.874,.6],[0,.838,.635],.015,.003,4);
  k.L('jaw','c',dkShade(steel,1.4),[0,.855,.5],[0,.852,.57],.02,.007,4);
  // the lightning crest: zigzag plumes swept back from the crown, glowing tips
  for(let i=-3;i<=3;i++){const x=i*.016,L=1-Math.abs(i)*.17,p0=[x,.935,.425-Math.abs(i)*.012],p1=[x*1.5,.975+.03*L,.37],p2=[x*1.9,.968+.04*L,.31-.03*L],p3=[x*2.3,1.0+.07*L,.24-.07*L];
    k.L('head','c',Math.abs(i)%2?back:deep,p0,p1,.022,.016,4).L('head','c',Math.abs(i)%2?deep:back,p1,p2,.016,.011,4).L('head','g',glow,p2,p3,.011,.002,4)}
  // breast ruff
  [-1,0,1].forEach(i=>k.L('chest','c',0xc8ccd0,[i*.05,.66,.3],[i*.06,.58,.31],.034,.004,4));
  // a narrow tail fan and two long forked streamers
  [-2,-1,0,1,2].forEach(i=>{const a=i*.11;k.p('tail0','box','c',i%2?back:deep,Math.sin(a)*.12,.53-Math.abs(i)*.006,-.5-Math.cos(a)*.14,.055,.016,.4,0,a,0);
    k.p('tail0','box','c',0xb8c0c8,Math.sin(a)*.3,.527-Math.abs(i)*.006,-.5-Math.cos(a)*.33,.056,.014,.035,0,a,0)});
  [-1,1].forEach(s=>{dh150F(k,'tail0','cone4','c',deep,[s*.02,.535,-.34],[s*.18,-.06,-1],[0,1,0],.62,.05,.012);
    dh150F(k,'tail0','cone4','c',0xb8c0c8,[s*.08,.5,-.78],[s*.18,-.06,-1],[0,1,0],.14,.03,.014)});
  k.L('tail0','c',back,[0,.565,-.24],[0,.53,-.42],.06,.035,6);
}
function st150Post(x,c,C,mat){
  const K=st150Cols(C),root=K.main.clone().multiplyScalar(.82),tipC=K.main.clone().multiplyScalar(.25).lerp(new THREE.Color(0x14161c),.5),lead=new THREE.Color(0xa8b8c8);
  // long, narrow, swept falcon wings with a pointed tip
  const W=lpwWing('st150|'+C,
    [[0,0,.06],[.3,.07,.09],[.6,.07,.03],[.95,.03,-.12],[1.25,0,-.32],[1.1,-.02,-.33],[1.04,0,-.38],[.88,-.02,-.36],[.8,0,-.42],[.64,-.02,-.38],[.56,0,-.44],[.4,-.02,-.38],[.32,0,-.42],[.18,-.02,-.36],[0,0,-.26]],
    [.45,.04,-.16],
    [[[0,.01,.06],[.6,.08,.03],.024],[[.6,.08,.03],[1.25,.01,-.32],.013]],
    root,tipC,lead,5);
  lpwPair(x,'chest',W,mat,.1,.74,.14,.5,.15,.35,.55)}

// ======================================================================== Rocsovereign ========================================================================
var RS150={body:[
  [-.38,.56,.03,.025,.025,['tail0','tail0',0],0],
  [-.3,.565,.09,.08,.08,['tail0','pelvis',.4],0],
  [-.18,.57,.15,.14,.13,['pelvis','pelvis',0],0],
  [-.05,.59,.19,.17,.2,['pelvis','spine',.6],0],
  [.06,.62,.21,.18,.24,['spine','spine',0],0],
  [.16,.665,.2,.17,.245,['spine','chest',.7],0],
  [.25,.725,.16,.14,.18,['chest','neck',.4],0],
  [.31,.79,.12,.12,.12,['neck','neck',0],0],
  [.36,.85,.1,.1,.085,['neck','head',.7],1],
  [.41,.885,.1,.095,.075,['head','head',0],1],
  [.47,.89,.085,.08,.06,['head','head',0],1],
  [.52,.882,.055,.05,.04,['head','head',0],2]],
 leg:[[.09,.52,-.03,.1,.11,['pelvis','hr0',.5]],[.088,.42,0,.095,.1,['hr0','hr0',0]],[.082,.32,.015,.075,.082,['hr0','hr1',.6]],
      [.078,.24,.02,.058,.062,['hr1','hr1',0]],[.076,.17,0,.034,.036,['hr1','hr1',0],1],[.075,.11,-.015,.031,.033,['hr1','hr2',.8],1],[.075,.04,0,.034,.036,['hr2','hr2',0],1]],
 head:['head',0,1.0,.4],back:[['neck',0,.93,.3],['chest',0,.86,.2],['spine',0,.8,.06],['pelvis',0,.72,-.08]]};
function rs150Cols(C){const main=lpMain(C,.25);return {main,back:main.clone().multiplyScalar(.55),dk:main.clone().multiplyScalar(.32).lerp(new THREE.Color(0x2a1e14),.35),
  cream:new THREE.Color(0xe8d8b0).lerp(main,.25),scale:new THREE.Color(0xc8a040),ivory:new THREE.Color(0xd8c088)}}
function rs150Geo(C){
  const K=rs150Cols(C);
  const body={rings:dh150Rings(RS150.body).map(r=>(r.j=r.k?0:.05,r)),seg:12,capA:1,capB:1,paint:(o,r,s,cc,i)=>{
    if(r.k==2)return o.copy(K.ivory);o.copy(K.main);if(s>.35)o.lerp(K.back,.75);
    if(r.k==1){if(s<-.2)o.copy(K.cream);return}
    // the deep breast: cream with scalloped brown rows
    if(s<-.1){o.copy(K.cream);if(i>1&&i<8&&(i%2==0)&&Math.abs(cc)<.85)o.lerp(K.back,.45)}}};
  const legs=[-1,1].map(s=>dh150Legs([RS150.leg],s,8,(o,r,sn)=>{o.copy(r.d?K.scale:K.main);if(!r.d&&sn<0)o.lerp(K.cream,.4);if(!r.d&&r.y<.3)o.lerp(K.back,.3)})[0]);
  return lpGeo('RS150|'+C,'Skyhawk',[body].concat(legs),154)}
function rs150Kit(k,c,C,red){
  const K=rs150Cols(C),main=K.main.getHex(),back=K.back.getHex(),dk=K.dk.getHex(),cream=K.cream.getHex(),eye=red?0xff2a2a:0xffb020,ivory=0xd8c088,ivoryD=0xa88a50,tip=0x241c12,gold=0xe8c060,claw=0x16120e;
  [-1,1].forEach(s=>{
    // deep-set gold eyes under a heavy brow
    k.p('head','box','c',0x050404,s*.086,.9,.455,.04,.03,.018,0,s*.6,-s*.1);
    k.p('head','box','g',eye,s*.092,.902,.459,.03,.016,.008,0,s*.6,-s*.15);
    k.p('head','box','c',dk,s*.075,.932,.455,.085,.026,.07,0,s*.5,s*.25);
    // thick talons
    const f=s<0?'hl2':'hr2',fx=s*.075;
    [-1,0,1].forEach(i=>{const e=[fx+i*.055,.024,.12-Math.abs(i)*.025];k.L(f,'c',0xc8a040,[fx,.028,0],e,.024,.019,5);
      k.L(f,'c',claw,e,[e[0]+i*.006,.03,e[2]+.035],.017,.009,4).L(f,'c',claw,[e[0]+i*.006,.03,e[2]+.035],[e[0]+i*.008,.0,e[2]+.055],.009,.002,4)});
    k.L(f,'c',0xc8a040,[fx,.028,0],[fx,.024,-.08],.022,.017,5).L(f,'c',claw,[fx,.024,-.08],[fx,.0,-.12],.014,.002,4);
  });
  // the massive hooked beak: ivory-gold, a dark hooked tip; a heavy lower mandible
  k.L('head','c',ivory,[0,.9,.49],[0,.897,.6],.052,.03,5).L('head','c',ivoryD,[0,.897,.6],[0,.862,.655],.03,.013,5).L('head','c',tip,[0,.862,.655],[0,.812,.662],.013,.002,4);
  k.L('jaw','c',ivoryD,[0,.85,.5],[0,.845,.6],.036,.012,5);
  // the crown: a fan of stiff upright crest feathers with golden tips, swept plumes behind
  for(let i=-3;i<=3;i++){const x=i*.026,b=[x,.965-Math.abs(i)*.006,.4-Math.abs(i)*.012],d=[x*2.6,1,-.3],L=(i%2?.13:.19)-Math.abs(i)*.012;
    dh150F(k,'head','cone4','c',i%2?back:dk,b,d,[0,0,1],L,.04,.012);const n=dh150N(d);dh150F(k,'head','cone4','c',gold,[b[0]+n[0]*L*.7,b[1]+n[1]*L*.7,b[2]+n[2]*L*.7],d,[0,0,1],L*.32,.02,.014)}
  [-1,0,1].forEach(i=>dh150F(k,'head','cone4','c',dk,[i*.03,.95,.34],[i*.25,.35,-1],[0,1,0],.2,.05,.012));
  // the layered mantle: three rings of hackle feathers over the neck and shoulders, open at the breast
  [[.86,.33,.105,.13,'neck'],[.8,.3,.14,.16,'neck'],[.73,.25,.175,.2,'chest']].forEach((R,j)=>{const N=9+j*2;for(let i=0;i<N;i++){const a=Math.PI+(i/(N-1)-.5)*2*(2.2+j*.12),sa=Math.sin(a),ca=Math.cos(a);
    const b=[sa*R[2],R[0],R[1]+ca*R[2]*.85],out=[sa,0,ca*.85],d=[sa*.55,-1,ca*.5-.25];
    dh150F(k,R[4],'cone4','c',(i+j)%2?main:back,b,d,out,R[3],.075+j*.01,.016);
    dh150F(k,R[4],'cone4','c',dk,[b[0]+dh150N(d)[0]*R[3]*.6,b[1]+dh150N(d)[1]*R[3]*.6,b[2]+dh150N(d)[2]*R[3]*.6],d,out,R[3]*.4,.05,.018)}});
  // a cream ruff at the throat
  [-2,-1,0,1,2].forEach(i=>k.L('chest','c',cream,[i*.04,.75,.36],[i*.05,.64,.385],.04,.004,4));
  // a broad fanned tail
  [-3,-2,-1,0,1,2,3].forEach(i=>{const a=i*.17;k.p('tail0','box','c',i%2?back:dk,Math.sin(a)*.14,.54-Math.abs(i)*.008,-.48-Math.cos(a)*.15,.085,.018,.4,0,a,0);
    k.p('tail0','box','c',cream,Math.sin(a)*.33,.537-Math.abs(i)*.008,-.48-Math.cos(a)*.34,.086,.016,.04,0,a,0)});
  k.L('tail0','c',back,[0,.58,-.24],[0,.55,-.42],.085,.05,6);
}
function rs150Post(x,c,C,mat){
  const K=rs150Cols(C),root=K.main.clone().multiplyScalar(.9),tipC=K.dk.clone(),lead=K.cream.clone().multiplyScalar(.8);
  // broad rounded wings with fingered (slotted) primaries
  const W=lpwWing('rs150|'+C,
    [[0,0,.08],[.25,.08,.12],[.55,.1,.08],[.8,.07,-.02],[1.02,.03,-.14],[.9,0,-.2],[1.04,.02,-.27],[.9,0,-.31],[1.0,.01,-.4],[.84,-.01,-.42],[.9,0,-.52],[.72,-.02,-.52],[.62,0,-.62],[.46,-.02,-.58],[.32,0,-.64],[.16,-.02,-.55],[0,0,-.4]],
    [.42,.04,-.24],
    [[[0,.01,.08],[.55,.11,.08],.03],[[.55,.11,.08],[1.02,.03,-.14],.015]],
    root,tipC,lead,4);
  lpwPair(x,'chest',W,mat,.15,.78,.14,.35,.2,.35,.5)}

// ---------------- hook the variants into the shared rigs ----------------
{const D=LPR.Drakelet,g0=D.geo,k0=D.kit,p0=D.post;
  D.geo=function(C,c){const sp=rv137('Drakelet',c);if(sp=='Pyrewing')return pw150Geo(C);if(sp=='Elderdrake')return ed150Geo(C);return g0.apply(this,arguments)};
  D.kit=function(k,c,C,red){const sp=rv137('Drakelet',c);if(sp=='Pyrewing')return pw150Kit(k,c,C,red);if(sp=='Elderdrake')return ed150Kit(k,c,C,red);return k0.apply(this,arguments)};
  D.post=function(x,c,C,mat){const sp=rv137('Drakelet',c);if(sp=='Pyrewing')return pw150Post(x,c,C,mat);if(sp=='Elderdrake')return ed150Post(x,c,C,mat);return p0.apply(this,arguments)};
  dh150Anchors(D,'Drakelet',{Pyrewing:PW150,Elderdrake:ED150})}
{const D=LPR.Skyhawk,g0=D.geo,k0=D.kit,p0=D.post;
  D.geo=function(C,c){const sp=rv137('Skyhawk',c);if(sp=='Stormtalon')return st150Geo(C);if(sp=='Rocsovereign')return rs150Geo(C);return g0.apply(this,arguments)};
  D.kit=function(k,c,C,red){const sp=rv137('Skyhawk',c);if(sp=='Stormtalon')return st150Kit(k,c,C,red);if(sp=='Rocsovereign')return rs150Kit(k,c,C,red);return k0.apply(this,arguments)};
  D.post=function(x,c,C,mat){const sp=rv137('Skyhawk',c);if(sp=='Stormtalon')return st150Post(x,c,C,mat);if(sp=='Rocsovereign')return rs150Post(x,c,C,mat);return p0.apply(this,arguments)};
  dh150Anchors(D,'Skyhawk',{Stormtalon:ST150,Rocsovereign:RS150})}

// ---------------- evolution looks for the new bodies ----------------
// Pyrewing: ember vents, burning frills, obsidian armour, a gilded horn crown, a flame crest
function pw150Evo(E,L,P){const M=EVO100_M,T=PW150.body,hb={bn:'head'};
  // L1: the horn tips grow on, ember vents along the flanks, a glowing rune on the brow
  [-1,1].forEach(s=>{E.horn([s*.124,.846,.315],[s*.2,.4,-1],[0,.02,-.02],.06+.025*L,.008,'c',0x2a201c,4,hb,L>=4?P.trim:P.glow);
    [[.16],[.04],[-.08],[-.2]].slice(0,L>=3?4:3).forEach(q=>{const y=dh150At(T,q[0]).y,h=E.on([s,y,q[0]],[-s,0,0]);if(h)E.L(E.add(E.add(h.p,h.n,.003),[0,.025,0]),E.add(E.add(h.p,h.n,.003),[0,-.025,-.025]),.008,.005,'g',P.glow,3,{vs:1})})});
  const br=E.top(0,.66);if(br)E.rune({p:E.add(br.p,br.n,.003),n:br.n},[0,0,1],.03,P.glow);
  if(L>=2){// burning cheek frills (membranes between the frill spines), a bigger flame blade on the whip tail, shoulder spurs
    [-1,1].forEach(s=>{const hub=[s*.062,.7,.58],pts=[0,1,2].map(i=>[s*(.15+i*.025),.72-i*.045,.47-i*.035]);E.fan(hub,pts,P.mainD,L>=4?P.glow:P.glowD,'c',hb);
      const h=E.on([s,.56,.22],[-s,0,0]);if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([h.n[0],1,-.8]),.07),.016,.002,'c',P.dark,4)});
    E.pd('cone4','g',P.glow,[0,.6,-1.56],[0,.2,-1],[.016,.13,.06],[0,1,0],{bn:'tail3'})}
  if(L>=3){// obsidian scale armour on the chest and shoulders, glowing seams down the spine
    E.shell((x,y,z,nx,ny,nz)=>z>.12&&z<.36&&ny>-.15&&y>.46&&y<.62,.012,'c',(x,y,z,i)=>i%3?P.dark:P.mainD,{rimCol:P.glowD});
    [.1,0,-.1,-.2].forEach(z=>{const h=E.top(.03,z);if(h)[-1,1].forEach(s=>E.L(E.add(h.p,[s*.03,-.004,.025]),E.add(h.p,[s*.034,-.006,-.025]),.006,.006,'g',P.glow,3,{vs:1}))})}
  if(L>=4){// a crown of four thin horns banded in gold, a gem on the brow, molten seams under the belly, a glowing tail blade
    [-1,1].forEach(s=>{E.horn([s*.03,.775,.62],[s*.25,1,-.4],[0,0,-.05],.15,.014,'c',0x2a201c,4,hb,P.trim);E.horn([s*.075,.77,.6],[s*.6,.6,-.6],[0,.02,-.04],.11,.012,'c',0x2a201c,4,hb,P.trim);
      E.pd('ring','m',P.trim,[s*.077,.795,.5],[s*.33,.43,-1],[.022,.03,.022],null,hb)});
    const hb2=E.top(0,.71);if(hb2)E.gem({p:E.add(hb2.p,hb2.n,.006),n:hb2.n},.018,P.glow);
    E.shell((x,y,z,nx,ny)=>ny<-.65&&z>-.25&&z<.3,.005,'g',P.glowD,{rim:false})}
  if(L>=5){// a flame crest down the neck, burning eyes
    for(let i=0;i<6;i++){const z=.5-i*.055,h=E.top(0,z);if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([0,1,-1]),.09-i*.008),.02,.002,'g',i%2?P.glow:P.glow2,4)}
    [-1,1].forEach(s=>E.L([s*.072,.73,.71],[s*.11,.745,.6],.009,.001,'g',P.glow2,3,hb))}
}
// Elderdrake: carved runes and lichen glow, horn rings, stone spires, bronze-rimmed armour, a golden horn crown, dragonfire breath
function ed150Evo(E,L,P){const M=EVO100_M,T=ED150.body,hb={bn:'head'};
  // L1: glowing runes on the shoulders, lichen glow on the back, a bronze ring on each great horn
  [-1,1].forEach(s=>{const h=E.on([s*2,.5,.22],[-s,0,0]);if(h)E.rune({p:E.add(h.p,h.n,.004),n:h.n},[0,1,0],.035,P.glow);
    E.pd('ring','m',P.trim,[s*.165,.865,.47],[s*.4,.38,-1],[.045,.06,.045],null,hb)});
  [[.06,.12],[-.08,-.1],[.1,-.2],[-.05,.0]].forEach(q=>{const h=E.top(q[0],q[1]);if(h)E.pd('ico','g',P.glowD,E.add(h.p,h.n,.003),h.n,.012)});
  if(L>=2){// runic stone spires between the back plates, gold rings on the beard
    [.25,.05,-.15,-.35].forEach((z,i)=>[-1,1].forEach(s=>{const h=E.top(s*.11,z+(s>0?.05:0));if(!h)return;const d=E.nrm([s*.35,1,-.3]),tp=E.add(h.p,d,.09+(i%2)*.03);
      E.L(E.add(h.p,h.n,-.01),tp,.022,.003,'c',P.boneD,4);if(L>=3)E.L(E.add(h.p,d,.04),E.add(h.p,d,.06),.01,.008,'g',P.glow,3)}));
    [-1,1].forEach(s=>[0,2].forEach(i=>E.pd('ring','m',P.trim,[s*(.03+i*.018),.57-i*.012,.795-i*.05],[s*.15,-1,-.78],[.016,.02,.016],null,{bn:'jaw'})))}
  if(L>=3){// bronze-rimmed armour plates over the chest and shoulders, glowing veins between the tail plates
    E.shell((x,y,z,nx,ny,nz)=>z>.14&&z<.36&&ny>-.1&&y>.5&&y<.72,.016,'c',(x,y,z,i)=>i%3?P.mainD:P.dark,{rimCol:P.trim});
    [-.55,-.7,-.85,-1.0].forEach(z=>{const h=E.top(0,z);if(h)[-1,1].forEach(s=>E.L(E.add(h.p,[s*.045,-.012,0]),E.add(h.p,[s*.06,-.03,0]),.006,.005,'g',P.glow,3,{vs:1}))})}
  if(L>=4){// gold bands up the great horns with gilded tips, a gem on the brow, molten seams under the belly
    [-1,1].forEach(s=>{E.pd('ring','m',P.gold,[s*.215,.888,.37],[s*.45,.2,-1],[.032,.045,.032],null,hb);E.pd('ring','m',P.gold,[s*.262,.86,.22],[s*.1,-.3,-1],[.022,.03,.022],null,hb);
      E.pd('cone4','m',P.gold,[s*.257,.79,.128],[0,-.8,-.4],[.012,.03,.012],null,hb)});
    const hb2=E.top(0,.7);if(hb2)E.gem({p:E.add(hb2.p,hb2.n,.006),n:hb2.n},.024,P.glow);
    E.shell((x,y,z,nx,ny)=>ny<-.65&&z>-.3&&z<.3,.006,'g',P.glowD,{rim:false})}
  if(L>=5){// dragonfire: glowing vents along the throat and jaw corners, glowing spines up the neck
    [-1,1].forEach(s=>{E.L([s*.075,.652,.62],[s*.08,.652,.86],.008,.006,'g',P.glow2,3,{bn:'jaw'});const h=E.on([s*2,.6,.42],[-s,0,0]);if(h)E.L(E.add(h.p,h.n,.004),E.add(E.add(h.p,h.n,.004),[0,-.06,-.04]),.009,.006,'g',P.glow,3,{vs:1})});
    for(let i=0;i<4;i++){const z=.48-i*.06,h=E.top(0,z);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([0,1,-.9]),.1),.022,.002,'g',i%2?P.glow:P.glow2,4)}}
}
// Stormtalon: brighter lightning, a war-paint breast streak, a feather mantle, steel, a storm crown, arcs at the wing roots
function st150Evo(E,L,P){const hb={bn:'head'};
  // L1: a glowing storm streak down the breast, longer glowing plume tips, long streamer tips
  {const pts=[[0,.74],[.02,.69],[-.015,.65],[.01,.6]].map(q=>E.on([q[0],q[1],2],[0,0,-1])).filter(h=>h).map(h=>E.add(h.p,h.n,.004));if(pts.length>1)E.chain(pts,.008,.005,'g',P.glow,3,{vs:1})}
  for(let i=-1;i<=1;i++){const L1=1-Math.abs(i)*.17,x=i*.016,p3=[x*2.3,1.0+.07*L1,.24-.07*L1];E.L(p3,E.add(p3,[x*.4,.02,-.04-.01*L]),.006,.001,'g',P.glow2,3,hb)}
  [-1,1].forEach(s=>E.pd('cone4',L>=3?'g':'c',L>=3?P.glow:P.dark,[s*.115,.49,-.93-.02*L],[s*.18,-.06,-1],[.014,.06+.01*L,.006],[0,1,0],{bn:'tail0'}));
  if(L>=2){// a mantle of long feathers over the shoulders, bronze talon bands
    for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=-1.25+i/8*2.5,h=E.on([Math.sin(a)*1.5,.77-k*.05,.22+Math.cos(a)*.3-k*.04],[-Math.sin(a),-.2,-.3]);
      if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([h.n[0]*1.2,-.3,-1]),.1-k*.02),.028,.002,'c',(i+k)%2?P.mainD:P.dark,4)}
    [-1,1].forEach(s=>{E.band([s*.075,.2,-.005],[0,1,0],.004,.008,'m',P.trim,8);E.band([s*.075,.26,.012],[0,1,0],.004,.007,'m',P.trim,8)})}
  if(L>=3){// a steel breastplate with a storm rune, a steel-capped beak hook
    E.shell((x,y,z,nx,ny,nz)=>nz>.35&&y>.6&&y<.78&&z>.15&&z<.33,.012,'m',P.metal,{rimCol:P.trim});
    const cp=E.on([0,.69,2],[0,0,-1]);if(cp)E.rune({p:E.add(cp.p,cp.n,.014),n:cp.n},[0,1,0],.045,P.glow);
    E.L([0,.874,.598],[0,.838,.635],.018,.004,'m',P.trim,4,hb)}
  if(L>=4){// a storm crown: golden spikes in an arc behind the crest, a storm gem
    for(let i=-3;i<=3;i++){const a=i/3*1.15;E.L([Math.sin(a)*.05,.925,.36],[Math.sin(a)*.12,.925+Math.cos(a)*.12,.33],.009,.002,'m',P.gold,4,hb)}
    E.pd('oct','g',P.glow,[0,.955,.385],[0,0,1],[.02,.03,.014],null,hb)}
  if(L>=5){// lightning arcs crackling round the wing roots
    [-1,1].forEach(s=>{const sh=E.on([s*1.5,.74,.14],[-s,-.3,0]),b=sh?E.add(sh.p,sh.n,-.004):[s*.12,.66,.14];E.chain([b,E.add(b,[s*.05,.06,-.02]),E.add(b,[s*.03,.1,-.06]),E.add(b,[s*.08,.15,-.08])],.008,.003,'g',P.glow2,3,{at:b})})}
}
// Rocsovereign: gold bead cords, talon bands, a second mantle, a gilded breastplate and beak, a golden crown, tempest arcs
function rs150Evo(E,L,P){const hb={bn:'head'};
  // L1: bead cords hanging from the crown, a glowing streak behind each eye
  [-1,1].forEach(s=>{E.L([s*.06,.965,.39],[s*.085,.88,.36],.003,.003,'c',P.leather,3,hb);[0,1,2].forEach(k=>E.pd('sph',k==1?'g':'c',k==1?P.glow:P.bone,[s*(.065+k*.009),.94-k*.03,.38-k*.008],[0,1,0],.011,null,hb));
    E.L([s*.095,.9,.445],[s*.1,.91,.39],.006,.002,'g',P.glow,3,hb)});
  if(L>=2){// bronze talon bands, a cape of long feathers down the back
    [-1,1].forEach(s=>{E.band([s*.075,.2,.005],[0,1,0],.004,.01,'m',P.trim,8);E.band([s*.077,.28,.018],[0,1,0],.004,.009,'m',P.trim,8)});
    for(let i=0;i<7;i++){const a=Math.PI+(i/6-.5)*1.6,h=E.on([Math.sin(a)*1.5,.74,.05+Math.cos(a)*1.5],[-Math.sin(a),-.15,-Math.cos(a)]);
      if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([h.n[0]*.6,-.9,-1]),.17),.034,.003,'c',i%2?P.mainD:P.dark,4)}}
  if(L>=3){// a gilded breastplate with a sun rune, a gold-capped beak hook
    E.shell((x,y,z,nx,ny,nz)=>nz>.3&&y>.5&&y<.74&&z>.18&&z<.34,.014,'c',(x,y,z,i)=>i%3?0xc89a3a:0xa87a2a,{rimCol:P.trim});
    const cp=E.on([0,.62,2],[0,0,-1]);if(cp)E.rune({p:E.add(cp.p,cp.n,.016),n:cp.n},[0,1,0],.06,P.glow);
    E.L([0,.895,.6],[0,.862,.655],.03,.014,'m',P.gold,5,hb)}
  if(L>=4){// a golden circlet round the crest with spikes and a sovereign's gem, glowing tail tips
    const c=[0,.94,.405];for(let i=0;i<10;i++){const a=i/10*Math.PI*2,a2=(i+1)/10*Math.PI*2;E.L(E.add(c,[Math.sin(a)*.085,0,Math.cos(a)*.085]),E.add(c,[Math.sin(a2)*.085,0,Math.cos(a2)*.085]),.009,.009,'m',P.gold,4,hb);
      if(i%2==0)E.L(E.add(c,[Math.sin(a)*.085,0,Math.cos(a)*.085]),E.add(c,[Math.sin(a)*.095,.06,Math.cos(a)*.095]),.009,.001,'m',P.gold,4,hb)}
    E.pd('oct','g',P.glow,[0,.95,.495],[0,0,1],[.018,.026,.012],null,hb);
    [-3,-1,1,3].forEach(i=>{const a=i*.17;E.pd('sph','g',P.glow,[Math.sin(a)*.33,.537,-.48-Math.cos(a)*.36],[0,1,0],.014,null,{bn:'tail0'})})}
  if(L>=5){// tempest arcs round the wing roots
    [-1,1].forEach(s=>{const sh=E.on([s*1.5,.8,.12],[-s,-.3,0]),b=sh?E.add(sh.p,sh.n,-.004):[s*.18,.72,.12];E.chain([b,E.add(b,[s*.05,.07,-.02]),E.add(b,[s*.03,.12,-.06]),E.add(b,[s*.09,.17,-.09])],.009,.003,'g',P.glow2,3,{at:b})})}
}
{const D=EVO100.D.Drakelet,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Drakelet;if(sp=='Pyrewing')return pw150Evo(E,L,P,c);if(sp=='Elderdrake')return ed150Evo(E,L,P,c);return b0.apply(this,arguments)}}
{const D=EVO100.D.Skyhawk,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Skyhawk;if(sp=='Stormtalon')return st150Evo(E,L,P,c);if(sp=='Rocsovereign')return rs150Evo(E,L,P,c);return b0.apply(this,arguments)}}
