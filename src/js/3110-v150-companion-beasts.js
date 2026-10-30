// ================= v150: Direfang, Skollmaw and Emberlynx get their own bodies =================
// Owner: "Some of our companions are just reskinned versions of lower tiered companions. Redo those ones and give them
// original models." Direfang (tier 4) and Skollmaw (tier 5) were the Ashwolf body in darker fur, Emberlynx (tier 3) was
// the Foxlet body in red. Each now has its own body on the same skeleton (rig variants, RV137 in 2600), so every walk,
// bite and ability animation, every bone name and all gameplay stay exactly as they were. Ashwolf and Foxlet are unchanged.
//  * Direfang — a sabre-toothed dire wolf: hyena-like sloped back with huge maned shoulders and a deep chest over small
//    hindquarters, a broad blocky skull under a scarred bone brow plate, two long sabre fangs hanging past the jaw,
//    thick forelegs with big clawed paws, short laid-back ears (the right one torn), a short hanging tail.
//  * Skollmaw — the mythic wolf that swallows the sun: gaunt and high-hipped, a wasp waist and a deep narrow ribcage with
//    the ribs showing, a long low neck and a very long jaw lined with teeth, smouldering spines down the back, glowing
//    eclipse rings on its shoulders and brow, a rune-bound iron collar and broken shackles with dangling chain on its
//    forelegs, long swept-back ears and a long whip tail ending in a smouldering tuft.
//  * Emberlynx — a lynx, not a fox: a compact body on long legs with big round snowshoe paws, a round cat head with a
//    short muzzle and forward-facing slit-pupil eyes, a spotted coat, a big cheek ruff, tall ears with long black
//    tufts, a short black-tipped bobtail, and glowing ember stripes on the flanks, legs and brow.
// Fur colour still comes from the companion's colour (c.cl via lpMain). Variant traits (Horned, Spiked…) use per-species
// anchor points. Evolution looks: Direfang and Skollmaw keep the Ashwolf war-wolf design (rays put it on the new bodies),
// with the few fixed-position parts moved per species; Emberlynx gets the Foxlet design without the fox's extra tails.
RV137.var.Ashwolf=['Ashwolf','Direfang','Skollmaw'];RV137.var.Foxlet=['Foxlet','Emberlynx'];
if(EVO100.surf){delete EVO100.surf.Ashwolf;delete EVO100.surf.Foxlet}
// ---------------- helpers ----------------
// rows [z, y, half width, above, below, bones, tag] sorted by z; the loft section at z (interpolated)
function bz150At(R,z){if(z<=R[0][0])return {y:R[0][1],w:R[0][2],a:R[0][3],b:R[0][4]};
  for(let i=0;i<R.length-1;i++){const p=R[i],q=R[i+1];if(z<=q[0]){const t=(z-p[0])/(q[0]-p[0]),l=(u,v)=>u+(v-u)*t;return {y:l(p[1],q[1]),w:l(p[2],q[2]),a:l(p[3],q[3]),b:l(p[4],q[4])}}}
  const L=R[R.length-1];return {y:L[1],w:L[2],a:L[3],b:L[4]}}
// point on the loft surface at z, angle a (0 right flank, PI/2 top, -PI/2 belly; PI left flank), pushed out by off; also its normal
function bz150S(R,z,a,off){const r=bz150At(R,z),c=Math.cos(a),s=Math.sin(a),ry=s>0?r.a:r.b,o=off||0;
  const n=[c/r.w,s/ry,0],l=Math.hypot(n[0],n[1]);return {p:[c*(r.w+o),r.y+s*(ry+o),z],n:[n[0]/l,n[1]/l,0]}}
// z where the point (x,y) leaves the body going forward (face front), searched between z0 and z1
function bz150Front(R,x,y,z0,z1){const inn=z=>{const r=bz150At(R,z),ry=y>r.y?r.a:r.b;return (x/r.w)**2+((y-r.y)/ry)**2<1};
  let a=z0,b=z1;for(let i=0;i<24;i++){const m=(a+b)/2;if(inn(m))a=m;else b=m}return (a+b)/2}
function bz150Rows(R){return e137Rows(R)}
// rotation (x,y,z Euler) that turns a part's +y axis to the unit vector n (n in the y-z or x-y plane is enough here)
function bz150Up(n){return [Math.atan2(n[2],Math.hypot(n[0],n[1])),0,-Math.atan2(n[0],n[1])]}
// leg lofts via the v137 quadruped helper (radii [hip, knee, ankle, paw]); toe = paw length
function bz150Legs(n,F,H,paint,o){return e137Quad(n,F,H,paint,o)}
// a skinned tail loft: rows [z, y, radius, bones, tag]
function bz150Tail(T,paint,seg){return {rings:T.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[2]*.92,ryB:q[2],b:q[3],k:q[4]||'tail',z:q[0]})),seg:seg||7,capA:1,capB:1,paint}}

// ===================================================================== Direfang =====================================================================
var DF150={
  body:[[-.43,.6,.04,.04,.04,['pelvis','tail0',.6]],[-.38,.585,.09,.085,.09,['pelvis','tail0',.3]],[-.3,.57,.125,.115,.13,['pelvis','pelvis',0]],
    [-.2,.575,.12,.11,.12,['pelvis','spine',.5]],[-.08,.59,.13,.13,.13,['spine','spine',0]],[.05,.61,.16,.17,.2,['spine','chest',.6]],
    [.17,.63,.19,.2,.25,['chest','chest',0]],[.28,.65,.19,.2,.24,['chest','neck',.35],'mane',.14],[.38,.665,.17,.17,.19,['neck','neck',0],'mane',.16],
    [.47,.685,.145,.135,.15,['neck','head',.5],'mane',.1],[.55,.705,.13,.1,.1,['head','head',0],'hd'],[.63,.71,.125,.09,.08,['head','head',0],'hd'],
    [.71,.695,.105,.07,.065,['head','head',0],'hd'],[.79,.68,.085,.055,.05,['head','head',0],'hd'],[.87,.67,.07,.048,.04,['head','head',0],'hd'],
    [.93,.668,.055,.04,.032,['head','head',0],'nose'],[.965,.668,.035,.028,.022,['head','head',0],'nose'],[.98,.668,.012,.01,.01,['head','head',0],'nose']],
  jaw:[[.6,.635,.095,.03,.04,['head','jaw',.4],'jaw'],[.68,.628,.09,.03,.045,['head','jaw',.8],'jaw'],[.76,.62,.075,.025,.042,['jaw','jaw',0],'jaw'],
    [.84,.617,.06,.022,.036,['jaw','jaw',0],'jaw'],[.9,.618,.045,.018,.028,['jaw','jaw',0],'jaw'],[.925,.62,.012,.01,.01,['jaw','jaw',0],'jaw']],
  tail:[[-.37,.62,.05,['tail0','tail0',0]],[-.45,.6,.075,['tail0','tail1',.3]],[-.55,.56,.085,['tail0','tail1',.7]],[-.65,.51,.075,['tail1','tail1',0]],
    [-.73,.47,.05,['tail1','tail2',.4],'tip'],[-.78,.45,.012,['tail1','tail2',.5],'tip']],
  head:['head',0,.8,.62],back:[['neck',0,.83,.38],['chest',0,.84,.28],['chest',0,.83,.17],['spine',0,.75,.05],['spine',0,.71,-.08]]};
function df150Cols(C){const main=lpMain(C,.12);return {main,back:main.clone().multiplyScalar(.55),dark:main.clone().multiplyScalar(.3),
  belly:main.clone().lerp(new THREE.Color(0x9a948a),.42),mane:main.clone().lerp(new THREE.Color(0x7a6a58),.35),maneD:main.clone().lerp(new THREE.Color(0x2a2420),.4),
  mouth:new THREE.Color(0x4a1216),nose:new THREE.Color(0x0e0c0e)}}
function df150Geo(C){const K=df150Cols(C);
  const paint=(o,r,s,cc,i)=>{
    if(r.k=='nose')return o.copy(K.nose);if(r.k=='paw')return o.copy(K.dark);if(r.k=='ank'){o.copy(K.main).lerp(K.dark,.55);return}
    if(r.k=='leg'){o.copy(K.main);if(r.p[1]<.3)o.lerp(K.dark,.3);return}
    if(r.k=='jaw'){if(s>.25)return o.copy(K.mouth);o.copy(K.belly).lerp(K.main,.3);return}
    if(r.k=='tail'||r.k=='tip'){o.copy(r.k=='tip'?K.dark:K.main);if(r.k=='tail'&&s>.3)o.lerp(K.back,.5);return}
    if(r.k=='mane'){o.copy((i+Math.round(cc*4))%2?K.mane:K.maneD);if(s<-.5)o.lerp(K.belly,.3);return}
    o.copy(K.main);if(s>.5)o.lerp(K.back,.6);
    if(r.k=='hd'){if(s<-.3)o.lerp(K.belly,.45);if(r.z>.75&&s>.3)o.lerp(K.dark,.35);return}
    // dark tiger bars over the haunches and back
    if(r.z<.1&&s>.1&&(i%2==0))o.lerp(K.dark,.5);if(s<-.45)o.lerp(K.belly,.5)};
  const lofts=[{rings:bz150Rows(DF150.body).map(r=>Object.assign(r,{j:r.k=='mane'?(r.j||.12):0})),seg:11,capA:1,capB:1,paint},
    {rings:bz150Rows(DF150.jaw),seg:8,capA:1,capB:1,paint},bz150Tail(DF150.tail,paint,7)]
    .concat(bz150Legs('Ashwolf',[.125,.085,.062,.072],[.105,.062,.044,.058],paint,{toe:.1,foot:.034,seg:7}));
  return lpGeo('DF150|'+C,'Ashwolf',lofts,61)}
function df150Kit(k,c,C,red){const K=df150Cols(C),R=DF150.body,bone=0xb4a68a,boneD=0x7a6e5a,ivory=0xece2c8,eye=red?0xff2a2a:0xffa82a,scar=0xa0948a,
    mane=K.mane.getHex(),maneD=K.maneD.getHex(),dark=K.dark.getHex();
  // eyes deep under the brow
  [-1,1].forEach(s=>{const e=bz150S(R,.695,s>0?.62:Math.PI-.62,-.012).p;k.p('head','sph','c',0x070506,e[0],e[1],e[2],.032,.022,.026,0,s*.5,0);
    k.p('head','sph','g',eye,e[0]+s*.006,e[1],e[2]+.008,.019,.011,.014,0,s*.5,0);k.p('head','box','c',0x000000,e[0]+s*.012,e[1],e[2]+.014,.004,.014,.004,0,s*.5,0)});
  // the armoured brow: a scarred bone plate over the skull, heavy ridges over the eyes, nub horns at its corners, plates down the muzzle
  {const t=bz150S(R,.63,Math.PI/2,0).p;k.p('head','hem','c',bone,0,t[1]-.022,.62,.105,.04,.11,-.12,0,0);
    for(let i=0;i<3;i++){const z=.71+i*.06,q=bz150S(R,z,Math.PI/2,0).p;k.p('head','box','c',i%2?boneD:bone,0,q[1]+.006,z,.07-i*.012,.016,.07,-.12,0,0)}
    [-1,1].forEach(s=>{k.p('head','box','c',bone,s*.07,.75,.69,.08,.026,.05,.15,s*.45,s*.32);
      k.L('head','c',bone,[s*.085,.775,.6],[s*.13,.8,.52],.024,.004,5);k.L('head','c',boneD,[s*.06,.79,.56],[s*.08,.83,.5],.018,.003,4)});
    // scars: two dark gouges across the plate, a pale one down the right cheek
    k.p('head','box','c',0x3a2c22,.03,t[1]+.016,.63,.006,.01,.1,0,.6,0);k.p('head','box','c',0x3a2c22,-.035,t[1]+.012,.6,.005,.01,.07,0,-.5,0);
    k.L('head','c',scar,[.098,.71,.66],[.075,.64,.8],.006,.005,3)}
  // nose and nostrils
  k.p('head','box','c',0x0a0809,0,.678,.965,.045,.03,.03);
  // sabre fangs: two long curved upper canines hanging past the jaw; a row of shorter teeth, lower fangs on the jaw
  [-1,1].forEach(s=>{const a=[s*.062,.64,.86],b=[s*.066,.55,.875],e=[s*.058,.46,.86];k.L('head','c',ivory,a,b,.018,.013,5).L('head','c',ivory,b,e,.013,.002,5);
    for(let i=0;i<3;i++)k.p('head','cone4','c',ivory,s*(.05-i*.004),.627,.79-i*.05,.006,.022,.006,Math.PI);
    k.p('jaw','cone4','c',ivory,s*.035,.65,.88,.008,.03,.008);k.p('jaw','cone4','c',ivory,s*.045,.643,.8,.006,.02,.006)});
  k.p('jaw','box','c',0x3a0e10,0,.646,.76,.07,.008,.2);
  // the mane: long shag round the neck and over the shoulders, sweeping back
  [[.52,.1],[.45,.12],[.38,.135],[.31,.14],[.24,.12],[.17,.09]].forEach((q,j)=>{const N=10;for(let i=0;i<N;i++){const ln=q[1]*(.8+((i*7+j*3)%4)*.12);const a=-.5+(i+(j%2)*.5)/(N-1)*(Math.PI+1),h=bz150S(R,q[0],a,-.025),n=h.n;
    const d=[n[0]*.35,n[1]*.3+.05,-1],l=Math.hypot(...d),bn=q[0]>.45?'head':q[0]>.33?'neck':'chest';
    k.L(bn,'c',(i+j)%2?mane:maneD,h.p,[h.p[0]+d[0]/l*ln,h.p[1]+d[1]/l*ln-.01,h.p[2]+d[2]/l*ln],.062,.006,5)}});
  // throat beard
  [-1,0,1].forEach(i=>k.L('neck','c',maneD,[i*.05,.52,.44],[i*.06,.4,.36],.05,.004,4));
  // claw scars on the left shoulder, a notch of old wounds on the haunch
  for(let i=0;i<3;i++){const a=bz150S(R,.2-i*.03,Math.PI-.25,.002).p,b=bz150S(R,.14-i*.03,Math.PI+.25,.002).p;k.L('chest','c',scar,a,b,.006,.004,3)}
  // big paws with heavy black claws
  ['fl2','fr2','hl2','hr2'].forEach((bn,j)=>{const c0=e137B('Ashwolf',bn),toe=j<2?.1:.085;
    for(let i=-1;i<=1;i++){const x=c0[0]+i*.03;k.L(bn,'c',0x0a0809,[x,.03,c0[2]+toe*.8],[x,.004,c0[2]+toe+.03],.013,.002,4)}});
  // a few dark tufts at the tail
  [[-.55,.6],[-.65,.55]].forEach(q=>[-1,1].forEach(s=>k.L('tail1','c',dark,[s*.05,q[1],q[0]],[s*.09,q[1]-.06,q[0]-.1],.035,.003,4)))}
function df150Post(x,c,C,mat){const K=df150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.4),K.dark),ig=lpSpikeGeo(0x5a4e46,0x2a2420);
  // short thick ears laid back on the broad skull; the right one torn short
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.085,.77,.58,.075,s>0?.085:.12,.035,-.55,-s*.35,s*.15);
    const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.6,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}

// ===================================================================== Skollmaw =====================================================================
var SK150={
  body:[[-.42,.585,.03,.03,.03,['pelvis','tail0',.6]],[-.37,.58,.07,.07,.07,['pelvis','tail0',.3]],[-.29,.575,.095,.09,.095,['pelvis','pelvis',0]],
    [-.18,.58,.068,.08,.06,['pelvis','spine',.5]],[-.07,.6,.08,.095,.09,['spine','spine',0]],[.04,.615,.105,.11,.16,['spine','chest',.6],'rib'],
    [.14,.625,.12,.12,.2,['chest','chest',0],'rib'],[.24,.635,.12,.12,.19,['chest','chest',0],'rib'],[.33,.65,.1,.11,.12,['chest','neck',.5]],
    [.42,.655,.075,.085,.085,['neck','neck',0]],[.51,.675,.08,.08,.07,['neck','head',.6]],[.58,.7,.1,.085,.065,['head','head',0],'hd'],
    [.66,.7,.09,.07,.05,['head','head',0],'hd'],[.76,.69,.07,.052,.038,['head','head',0],'hd'],[.87,.678,.058,.042,.03,['head','head',0],'hd'],
    [.97,.668,.045,.034,.025,['head','head',0],'hd'],[1.05,.662,.032,.028,.02,['head','head',0],'nose'],[1.09,.66,.018,.016,.013,['head','head',0],'nose'],
    [1.105,.66,.006,.006,.006,['head','head',0],'nose']],
  jaw:[[.6,.65,.075,.025,.035,['head','jaw',.4],'jaw'],[.7,.64,.07,.022,.036,['head','jaw',.85],'jaw'],[.82,.636,.055,.02,.032,['jaw','jaw',0],'jaw'],
    [.94,.634,.042,.017,.026,['jaw','jaw',0],'jaw'],[1.03,.634,.03,.014,.018,['jaw','jaw',0],'jaw'],[1.07,.636,.01,.008,.008,['jaw','jaw',0],'jaw']],
  tail:[[-.4,.6,.04,['tail0','tail0',0]],[-.52,.6,.055,['tail0','tail1',.5]],[-.68,.585,.05,['tail1','tail1',0]],[-.85,.57,.038,['tail1','tail2',.6]],
    [-.98,.57,.026,['tail2','tail2',0]],[-1.08,.58,.022,['tail2','tail3',.6],'tip'],[-1.16,.59,.006,['tail3','tail3',0],'tip']],
  head:['head',0,.78,.62],back:[['neck',0,.74,.42],['chest',0,.76,.33],['chest',0,.75,.22],['spine',0,.73,.08],['spine',0,.7,-.07]]};
function sk150Cols(C){const main=lpMain(C,.1);return {main,back:main.clone().multiplyScalar(.5),dark:main.clone().multiplyScalar(.28),
  belly:main.clone().lerp(new THREE.Color(0x6a6878),.35),rib:main.clone().lerp(new THREE.Color(0x8a8494),.3),mouth:new THREE.Color(0x3a0a18),nose:new THREE.Color(0x0a090c)}}
function sk150Geo(C){const K=sk150Cols(C);
  const paint=(o,r,s,cc,i)=>{
    if(r.k=='nose')return o.copy(K.nose);if(r.k=='paw')return o.copy(K.dark);if(r.k=='ank'){o.copy(K.main).lerp(K.dark,.5);return}
    if(r.k=='leg'){o.copy(K.main);if(r.p[1]<.3)o.lerp(K.dark,.25);return}
    if(r.k=='jaw'){if(s>.25)return o.copy(K.mouth);o.copy(K.belly);return}
    if(r.k=='tail'||r.k=='tip'){o.copy(r.k=='tip'?K.dark:K.main);if(r.k=='tail'&&s>.3)o.lerp(K.back,.5);return}
    o.copy(K.main);if(s>.45)o.lerp(K.back,.65);
    if(r.k=='hd'){if(s<-.3)o.lerp(K.belly,.4);return}
    if(r.k=='rib'&&s<.5&&s>-.75&&(Math.round(cc*6)%2==0))o.lerp(K.rib,.5);if(s<-.5)o.lerp(K.belly,.45)};
  const lofts=[{rings:bz150Rows(SK150.body),seg:11,capA:1,capB:1,paint},{rings:bz150Rows(SK150.jaw),seg:8,capA:1,capB:1,paint},bz150Tail(SK150.tail,paint,6)]
    .concat(bz150Legs('Ashwolf',[.062,.036,.026,.038],[.072,.04,.027,.038],paint,{toe:.085,foot:.03,seg:6}));
  return lpGeo('SK150|'+C,'Ashwolf',lofts,67)}
function sk150Kit(k,c,C,red){const K=sk150Cols(C),R=SK150.body,ivory=0xe4dcc8,iron=0x4a4a54,ironD=0x2e2e36,gold=red?0xff3a2a:0xffd27a,vio=red?0xc01a2a:0x9a7aff,
    eye=red?0xff2a2a:0xfff0c0,rib=K.rib.getHex(),dark=K.dark.getHex();
  // burning pale eyes in deep sockets
  [-1,1].forEach(s=>{const e=bz150S(R,.68,s>0?.55:Math.PI-.55,-.01).p;k.p('head','sph','c',0x050406,e[0],e[1],e[2],.032,.018,.03,0,s*.45,s*-.2);
    k.p('head','box','g',eye,e[0]+s*.006,e[1],e[2]+.006,.03,.008,.012,0,s*.45,s*-.2);k.p('head','box','c',dark,s*.06,e[1]+.03,e[2],.06,.014,.04,.1,s*.4,s*.3)});
  k.p('head','box','c',0x08070a,0,.672,1.085,.03,.022,.022);
  // the long jaws: a row of teeth down each side of both jaws, long canines at the front, a dark mouth inside
  for(let i=0;i<8;i++){const z=.7+i*.045,r=bz150At(R,z),x=r.w*.72,y=r.y-r.b*.8,big=i==7||i==6;
    [-1,1].forEach(s=>k.p('head','cone4','c',ivory,s*x,y-(big?.02:.008),z,big?.009:.006,big?.05:.024,big?.009:.006,Math.PI))}
  for(let i=0;i<7;i++){const z=.72+i*.045,J=bz150At(SK150.jaw,z),x=J.w*.7,y=J.y+J.a*.6,big=i==6;
    [-1,1].forEach(s=>k.p('jaw','cone4','c',ivory,s*x,y+(big?.018:.008),z,big?.008:.006,big?.04:.022,big?.008:.006))}
  k.p('jaw','box','c',0x2a0610,0,.65,.84,.06,.008,.38);k.L('jaw','c',0x8a2a3a,[0,.652,.7],[0,.654,.98],.018,.01,4);
  // smouldering spines down the back: dark ragged blades with glowing tips
  for(let i=0;i<13;i++){const z=.52-i*.065,h=bz150S(R,z,Math.PI/2,-.012),bn=z>.47?'head':z>.37?'neck':z>.12?'chest':z>-.16?'spine':'pelvis',len=.09+(i<6?.04:0)-(i>10?.03:0);
    const tp=[0,h.p[1]+len,z-.07],mid=[0,h.p[1]+len*.62,z-.045];k.L(bn,'c',i%2?dark:K.back.getHex(),h.p,tp,.022,.002,4);k.L(bn,'g',i%2?vio:gold,mid,tp,.008,.001,3)}
  // ribs showing through the taut hide
  [.2,.14,.08,.02].forEach((z,j)=>[-1,1].forEach(s=>{let p=bz150S(R,z,s>0?.75:Math.PI-.75,.003).p;
    for(let t=1;t<=4;t++){const a=.75-t*.42,q=bz150S(R,z-t*.008,s>0?a:Math.PI-a,.003).p;k.L(j<2?'chest':'spine','c',rib,p,q,.009,.008,4);p=q}}));
  // eclipse marks: a black disc ringed with a glowing corona on each shoulder, one on the brow
  const ecl=(bn,h,sz)=>{const rt=bz150Up(h.n),p=h.p;k.p(bn,'sph','c',0x040306,p[0],p[1],p[2],sz,sz*.12,sz,...rt);
    k.p(bn,'ring','g',gold,p[0]+h.n[0]*.004,p[1]+h.n[1]*.004,p[2]+(h.n[2]||0)*.004,sz*1.15,sz*.9,sz*1.15,...rt);
    k.p(bn,'ring','g',vio,p[0]+h.n[0]*.002,p[1]+h.n[1]*.002,p[2]+(h.n[2]||0)*.002,sz*1.45,sz*.6,sz*1.45,...rt)};
  [-1,1].forEach(s=>ecl('chest',bz150S(R,.22,s>0?.3:Math.PI-.3,.004),.05));
  {const t=bz150S(R,.63,Math.PI/2,.002);ecl('head',{p:t.p,n:[0,.92,.38]},.03)}
  // rune-bound iron collar with glowing runes and a broken chain hanging from it
  {const N=14,pts=[];for(let i=0;i<N;i++)pts.push(bz150S(R,.43,i/N*Math.PI*2,.016).p);
    for(let i=0;i<N;i++)k.L('neck','m',iron,pts[i],pts[(i+1)%N],.016,.016,5);
    [-.9,-1.57,-2.24].forEach((a,i)=>{const h=bz150S(R,.43,a,.03);k.p('neck','box','g',vio,h.p[0],h.p[1],h.p[2]+.004,.012,.024,.006,0,0,a+Math.PI/2)});
    const lo=bz150S(R,.43,-Math.PI/2,.016).p;lk173Chain(k,'neck','m',[iron,ironD],lo,4,.016,[0,-1,-.3])} // v173: links that hold together
  // broken shackles on the forelegs, chain ends trailing
  [['fl1',-1],['fr1',1]].forEach(([bn,s])=>{const a=e137B('Ashwolf',bn),b=e137B('Ashwolf',bn[0]+bn[1]+'2'),p=e137L(a,b,.45);
    k.p(bn,'tor','m',iron,p[0],p[1],p[2],.045,.045,.045);k.p(bn,'ring','m',ironD,p[0],p[1]+.024,p[2],.046,.06,.046);k.p(bn,'ring','m',ironD,p[0],p[1]-.024,p[2],.046,.06,.046);
    k.p(bn,'box','g',vio,p[0],p[1],p[2]+.046,.012,.026,.004);
    lk173Chain(k,bn,"m",[iron,ironD],[p[0]+s*.028,p[1]-.02,p[2]+.028],3,.013,[s*.15,-1,-.25])});
  // long thin paws with black claws
  ['fl2','fr2','hl2','hr2'].forEach(bn=>{const c0=e137B('Ashwolf',bn);for(let i=-1;i<=1;i++){const x=c0[0]+i*.018;k.L(bn,'c',0x08080a,[x,.022,c0[2]+.075],[x,.003,c0[2]+.11],.008,.001,4)}});
  // the smouldering tail tuft
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2,y=.585,z=-1.08;k.L('tail3','c',dark,[Math.cos(a)*.015,y+Math.sin(a)*.015,z],[Math.cos(a)*.04,y+Math.sin(a)*.03+.015,z-.12],.02,.002,3);
    if(i%2==0)k.L('tail3','g',i%4?vio:gold,[Math.cos(a)*.03,y+Math.sin(a)*.025+.01,z-.07],[Math.cos(a)*.038,y+Math.sin(a)*.028+.015,z-.12],.006,.001,3)}}
function sk150Post(x,c,C,mat){const K=sk150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),K.dark),ig=lpSpikeGeo(0x3a2a40,0x120c14);
  // long narrow ears swept far back
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.06,.765,.6,.048,.2,.024,-.95,-s*.22,s*.1);
    const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.72,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}

// ===================================================================== Emberlynx (Foxlet skeleton) =====================================================================
var EL150={
  body:[[-.37,.535,.04,.04,.04,['pelvis','tail0',.5]],[-.33,.53,.09,.085,.09,['pelvis','tail0',.2]],[-.26,.525,.118,.105,.13,['pelvis','pelvis',0]],
    [-.16,.51,.108,.1,.12,['pelvis','spine',.5]],[-.05,.495,.1,.095,.12,['spine','spine',0]],[.06,.49,.112,.1,.15,['spine','chest',.5]],
    [.16,.495,.122,.105,.17,['chest','chest',0]],[.25,.515,.11,.1,.15,['chest','neck',.4]],[.34,.555,.085,.085,.1,['neck','neck',0]],
    [.42,.6,.09,.085,.08,['neck','head',.6],'hd'],[.48,.615,.115,.095,.085,['head','head',0],'hd'],[.54,.615,.113,.088,.074,['head','head',0],'hd'],
    [.585,.607,.094,.074,.062,['head','head',0],'hd'],[.615,.6,.07,.055,.05,['head','head',0],'hd'],[.635,.595,.05,.04,.038,['head','head',0],'muz'],
    [.649,.594,.032,.027,.026,['head','head',0],'muz'],[.657,.596,.012,.01,.01,['head','head',0],'nose']],
  jaw:[[.5,.56,.065,.02,.032,['head','jaw',.4],'jaw'],[.56,.555,.052,.02,.03,['head','jaw',.8],'jaw'],[.61,.555,.036,.016,.024,['jaw','jaw',0],'jaw'],[.632,.558,.015,.01,.012,['jaw','jaw',0],'jaw']],
  tail:[[-.34,.56,.04,['tail0','tail0',0]],[-.4,.58,.055,['tail0','tail0',0]],[-.46,.585,.055,['tail0','tail1',.4]],[-.51,.585,.045,['tail0','tail1',.7],'tip'],
    [-.545,.58,.025,['tail1','tail1',0],'tip'],[-.56,.578,.006,['tail1','tail1',0],'tip']],
  head:['head',0,.7,.5],back:[['neck',0,.645,.36],['chest',0,.62,.27],['chest',0,.6,.17],['spine',0,.59,.07],['spine',0,.6,-.04]]};
function el150Cols(C){const main=lpMain(C,.3).lerp(new THREE.Color(0x9a7048),.3);return {main,back:main.clone().multiplyScalar(.6),spot:main.clone().multiplyScalar(.3),
  cream:new THREE.Color(0xe0d0b4),black:new THREE.Color(0x15100c),nose:new THREE.Color(0x3a1e1a)}}
function el150Geo(C){const K=el150Cols(C);
  const paint=(o,r,s,cc,i)=>{
    if(r.k=='nose')return o.copy(K.nose);if(r.k=='paw'){o.copy(K.main).lerp(K.cream,.35);if(s<0)o.lerp(K.cream,.5);return}
    if(r.k=='ank'){o.copy(K.main).lerp(K.cream,.2);return}
    if(r.k=='leg'){o.copy(K.main);if(s<-.2)o.lerp(K.cream,.35);if((i+Math.round(cc*3))%3==0)o.lerp(K.spot,.4);return}
    if(r.k=='jaw')return o.copy(s>.3?new THREE.Color(0x5a1a1a):K.cream);
    if(r.k=='tip')return o.copy(K.black);if(r.k=='tail'){o.copy(K.main);if(s<-.4)o.lerp(K.cream,.5);return}
    if(r.k=='muz'){o.copy(K.cream).lerp(K.main,.25);if(s>.4)o.lerp(K.main,.55);return}
    o.copy(K.main);if(s>.6)o.lerp(K.back,.5);
    if(r.k=='hd'){if(s<-.15)o.lerp(K.cream,.75);if(r.z>.55&&s<.3)o.lerp(K.cream,.4);return}
    if(s<-.4)o.lerp(K.cream,.7);
    // the lynx's dark spots
    else if(((i*7+Math.round(cc*5)*3+Math.round(s*4))%4)==0)o.lerp(K.spot,.72)};
  const lofts=[{rings:bz150Rows(EL150.body),seg:10,capA:1,capB:1,paint},{rings:bz150Rows(EL150.jaw),seg:7,capA:1,capB:1,paint},bz150Tail(EL150.tail,paint,7)]
    .concat(bz150Legs('Foxlet',[.054,.036,.028,.048],[.068,.04,.029,.048],paint,{toe:.07,foot:.03,seg:7}));
  return lpGeo('EL150|'+C,'Foxlet',lofts,73)}
function el150Kit(k,c,C,red){const K=el150Cols(C),R=EL150.body,cream=K.cream.getHex(),black=0x15100c,eye=red?0xff2a2a:0xd8c040,emb=0xff7a2a,emb2=0xffb040,main=K.main.getHex();
  // forward-facing almond eyes with slit pupils, dark eye-liner, a pale brow streak
  [-1,1].forEach(s=>{const x=s*.044,y=.637,z=bz150Front(R,Math.abs(x),y,.5,.7);
    k.p('head','sph','c',black,x,y,z-.006,.028,.02,.014,0,s*.35,s*-.25);k.p('head','sph','g',eye,x+s*.002,y,z-.002,.022,.015,.01,0,s*.35,s*-.25);
    k.p('head','box','c',0x000000,x+s*.004,y,z+.005,.004,.022,.004,0,s*.35,0);k.p('head','sph','g',0xffffff,x-s*.006,y+.007,z+.004,.004,.004,.003);
    k.L('head','c',black,[x+s*.018,y-.012,z-.008],[x+s*.04,y-.035,z-.04],.005,.003,3)});
  // nose leather, split lip, small fangs; the chin on the jaw with a dark mouth
  k.p('head','box','c',0x2a1612,0,.608,.656,.022,.012,.012,-.3,0,0);k.L('head','c',0x2a1410,[0,.598,.658],[0,.575,.648],.004,.004,3);
  [-1,1].forEach(s=>{k.p('head','cone4','c',0xf0e8d8,s*.018,.565,.632,.005,.026,.005,Math.PI);k.p('jaw','cone4','c',0xf0e8d8,s*.016,.572,.618,.004,.016,.004);
    // whiskers
    for(let i=0;i<3;i++)k.L('head','c',0xe8e0d0,[s*.03,.585-i*.006,.632],[s*.13,.59-i*.025,.61-i*.01],.002,.001,3)});
  k.p('jaw','box','c',0x4a1414,0,.571,.58,.04,.006,.07);
  // the cheek ruff: long layered fur hanging from the jaw-line, black-tipped
  const ruff=K.main.clone().lerp(K.cream,.55).getHex();
  [-1,1].forEach(s=>{[[.45,.6,.07],[.5,.585,.085],[.55,.57,.08],[.585,.56,.06]].forEach((q,i)=>{const a=[s*(.065+i*.003),q[1],q[0]],m=[s*(.065+q[2]*.75),q[1]-q[2]*.5,q[0]-.035],e=[s*(.07+q[2]),q[1]-q[2]*.8,q[0]-.055];
      k.L('head','c',i%2?cream:ruff,a,m,.026,.014,4).L('head','c',i==1?black:ruff,m,e,.014,.002,4)});
    k.L('head','c',main,[s*.09,.63,.5],[s*.13,.6,.45],.03,.004,4)});
  // chest bib
  [-1,0,1].forEach(i=>k.L(i?'neck':'chest','c',cream,[i*.04,.5,.4],[i*.05,.41,.36],.04,.004,4));
  // glowing ember stripes on the flanks, the legs and the brow
  // dark lynx spots scattered over the flanks and haunches
  {const sp=K.spot.getHex(),Rn=dkRng(29);for(let i=0;i<44;i++){const z=-.26+Rn()*.48,a=-.45+Rn()*1.65,s=i%2?1:-1,h=bz150S(R,z,s>0?a:Math.PI-a,.001),sz=.014+Rn()*.01,bn=z>.1?'chest':z>-.12?'spine':'pelvis';
    k.p(bn,'sph','c',sp,h.p[0],h.p[1],h.p[2],sz,.004,sz*1.3,...bz150Up(h.n))}}
  [.12,-.02,-.16].forEach((z0,j)=>[-1,1].forEach(s=>{const an=a=>s>0?a:Math.PI-a,A=[1.38,.95,.5,.08],W=[.003,.01,.011,.008,.002],bn=z0>.1?'chest':z0>-.12?'spine':'pelvis';
    let p=bz150S(R,z0,an(A[0]),.004).p;for(let t=1;t<4;t++){const q=bz150S(R,z0-t*.022-(t==2?.012:0),an(A[t]),.004).p;k.L(bn,'g',(t+j)%2?emb:emb2,p,q,W[t-1]+.002,W[t]+.002,3);p=q}}));
  [[.6,0],[.58,.025],[.58,-.025]].forEach(q=>{const t=bz150S(R,q[0]-.07,Math.PI/2,.002).p;k.L('head','g',emb2,[q[1],t[1],q[0]-.04],[q[1]*1.4,t[1]-.004,q[0]-.11],.006,.003,3)});
  [['fl0',.2,.3],['fr0',.2,.3],['hl0',-.22,.3],['hr0',-.22,.3]].forEach(([bn,z,y])=>{const b=e137B('Foxlet',bn),s=Math.sign(b[0]),o=bn[0]=='h'?.056:.052; // v173: hind stripes on the thigh (were 7 mm off it)
    k.L(bn,'g',emb,[b[0]+s*o,y+.03,z+.01],[b[0]+s*(o+.002),y-.03,z-.01],.007,.003,3)});
  // big furry paws: cream toes, short claws hidden in the fur
  ['fl2','fr2','hl2','hr2'].forEach(bn=>{const c0=e137B('Foxlet',bn);for(let i=-1;i<=1;i++)k.p(bn,'sph','c',cream,c0[0]+i*.022,.018,c0[2]+.068,.017,.014,.02)})}
function el150Post(x,c,C,mat){const K=el150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),0x15100c),ig=lpSpikeGeo(0xd8c8b0,0x6a5a48),tf=lpSpikeGeo(0x15100c,0x15100c,3),gl=lpSpikeGeo(0xff7a2a,0xffd080,3);
  // tall ears with long black tufts (and an ember spark at each tip)
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.06,.68,.49,.05,.135,.024,-.12,-s*.18,s*.05);const m=p.children[0];
    const n=new THREE.Mesh(ig,mat);n.scale.set(.62,.7,.5);n.position.set(0,.03,.45);m.add(n);
    const t=new THREE.Mesh(tf,mat);t.scale.set(.13,.6,.3);t.position.set(0,.92,0);m.add(t);
    const g=new THREE.Mesh(gl,lpMat(c.v,0,{emissive:0x8a2a00}));g.scale.set(.08,.22,.2);g.position.set(0,1.38,0);m.add(g);
    p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}

// ===================================================================== hook the variants into the two rigs =====================================================================
{const A=LPR.Ashwolf,g0=A.geo,k0=A.kit,p0=A.post,h0=A.head,b0=A.back;
  A.geo=function(C,c){const sp=rv137('Ashwolf',c);return sp=='Direfang'?df150Geo(C):sp=='Skollmaw'?sk150Geo(C):g0.apply(this,arguments)};
  A.kit=function(k,c,C,red){const sp=rv137('Ashwolf',c);return sp=='Direfang'?df150Kit(k,c,C,red):sp=='Skollmaw'?sk150Kit(k,c,C,red):k0.apply(this,arguments)};
  A.post=function(x,c,C,mat){const sp=rv137('Ashwolf',c);return sp=='Direfang'?df150Post(x,c,C,mat):sp=='Skollmaw'?sk150Post(x,c,C,mat):p0.apply(this,arguments)};
  // trait anchors (Horned, Spiked, Armored, Ember…) follow the body being built
  Object.defineProperty(A,'head',{configurable:true,get(){const s=RV137.cur.Ashwolf;return s=='Direfang'?DF150.head:s=='Skollmaw'?SK150.head:h0}});
  Object.defineProperty(A,'back',{configurable:true,get(){const s=RV137.cur.Ashwolf;return s=='Direfang'?DF150.back:s=='Skollmaw'?SK150.back:b0}})}
{const F=LPR.Foxlet,g0=F.geo,k0=F.kit,p0=F.post,h0=F.head,b0=F.back;
  F.geo=function(C,c){return rv137('Foxlet',c)=='Emberlynx'?el150Geo(C):g0.apply(this,arguments)};
  F.kit=function(k,c,C,red){return rv137('Foxlet',c)=='Emberlynx'?el150Kit(k,c,C,red):k0.apply(this,arguments)};
  F.post=function(x,c,C,mat){return rv137('Foxlet',c)=='Emberlynx'?el150Post(x,c,C,mat):p0.apply(this,arguments)};
  Object.defineProperty(F,'head',{configurable:true,get(){return RV137.cur.Foxlet=='Emberlynx'?EL150.head:h0}});
  Object.defineProperty(F,'back',{configurable:true,get(){return RV137.cur.Foxlet=='Emberlynx'?EL150.back:b0}})}

// ===================================================================== evolution looks =====================================================================
// Emberlynx: the Foxlet's fox-spirit design without the extra fox tails (a lynx has a bobtail): an ember crest, flaming
// bobtail tip, harness, circlet and flame mane, placed for the lynx's own head, neck and legs.
function el150Evo(E,L,P){const M=EVO100_M;
  const fh=E.top(0,.53);if(fh){E.pd('oct','g',P.glow,E.add(fh.p,fh.n,.003),fh.n,[.022,.004,.05],[0,0,1]);if(L>=3)E.pd('oct','g',P.glow2,E.add(fh.p,fh.n,.006),fh.n,[.01,.004,.026],[0,0,1])}
  [-1,1].forEach(s=>{const h=M.side(E,s,.5,.17);if(h)E.rune(h,[0,1,-.3],.045,P.glow)});
  const col=M.collar(E,[0,.56,.36],[0,.4,1],.012,.014,P.leather,10,L>=3?P.metal:null,.03);
  const lo=col.reduce((a,p)=>p[1]<a[1]?p:a,col[0]);M.charm(E,E.add(lo,[0,0,.012]),.1,P.bone,'tooth');
  if(L>=2){// an ember crest down the nape and back, runes on the haunches, glowing claws
    for(let i=0;i<6;i++){const z=.4-i*.07,h=E.top(0,z);if(h)M.tuft(E,h,[0,.5,-1.2],.06+.01*L-.006*i,.024,i%2?P.glow:P.glow2,'g')}
    [-1,1].forEach(s=>{const h=M.side(E,s,.5,-.2);if(h)E.rune(h,[0,1,0],.04,P.glow)});
    ['fl2','fr2'].forEach(bn=>{const c0=E.bone(bn);for(let i=-1;i<=1;i++)E.L([c0[0]+i*.022,.02,c0[2]+.08],[c0[0]+i*.024,.005,c0[2]+.11],.006,.001,'g',P.glow,3,{bn})})}
  if(L>=3){// a flame on the bobtail, harness with a bronze chest plate, bands on the legs
    E.L([0,.55,-.52],[0,.62,-.62],.04,.002,'g',P.glow,5,{bn:'tail1'});E.L([0,.55,-.53],[0,.66,-.58],.024,.001,'g',P.glow2,4,{bn:'tail1'});
    M.collar(E,[0,.49,.1],[0,0,1],.006,.011,P.leather,12);
    const cp=E.on([0,.4,1],[0,0,-1]);if(cp){E.plate(cp.p,cp.n,[0,1,0],.09,.08,.014,'m',P.metal,'box');E.gem({p:E.add(cp.p,cp.n,.01),n:cp.n},.02,P.glow)}
    [['fl0','fl1'],['fr0','fr1'],['hl0','hl1'],['hr0','hr1']].forEach(q=>{const a=E.bone(q[0]),b=E.bone(q[1]);E.band([(a[0]+b[0])/2,(a[1]+b[1])/2-.04,(a[2]+b[2])/2],[0,1,0],.003,.007,'m',P.trim,8)})}
  if(L>=4){// gold circlet across the brow with a gem; flame tufts on the shoulders
    const arc=[];for(let i=-3;i<=3;i++){const a=i/3*1.1,h=E.on([Math.sin(a)*.5,.95,.53+Math.cos(a)*.1],[-Math.sin(a),-1.2,-.1]);if(h)arc.push(h)}
    for(let i=0;i<arc.length-1;i++)E.L(E.add(arc[i].p,arc[i].n,.004),E.add(arc[i+1].p,arc[i+1].n,.004),.008,.008,'m',P.gold,4,{vs:1});
    arc.forEach((h,i)=>{if(i%2==0)E.pd('cone4','m',P.gold,E.add(h.p,h.n,.03),E.nrm([h.n[0],h.n[1]+1,h.n[2]]),[.012,.05+(i==3?.04:0),.012])});
    if(arc[3])E.gem({p:E.add(arc[3].p,arc[3].n,.012),n:arc[3].n},.02,P.glow);
    [-1,1].forEach(s=>[0,1,2].forEach(i=>{const h=E.on([s*.5,.55-i*.03,.22-i*.04],[-s,-.2,0]);if(h)M.tuft(E,h,[s*.3,.6,-.8],.1-i*.015,.024,i%2?P.glow2:P.glow,'g')}))}
  if(L>=5){// a ring of flame round the neck
    for(let i=0;i<9;i++){const a=-1.2+i/8*2.4,h=E.on([Math.sin(a)*.6,.56+Math.cos(a)*.5,.38],[-Math.sin(a),-Math.cos(a),0]);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([h.n[0],h.n[1]+.4,-1.1]),.14+(i%2)*.05),.032,.002,'g',i%2?P.glow:P.glow2,4)}}}
// Direfang and Skollmaw: the war-wolf design is ray-placed, so it follows the new bodies; only its jaw tusks sit at a fixed
// Ashwolf spot (inside these longer heads), so they are left out: Direfang has its sabres, Skollmaw its rows of teeth.
{const D=EVO100.D.Ashwolf,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Ashwolf;if(sp!='Direfang'&&sp!='Skollmaw')return b0.apply(this,arguments);
  const l0=E.L,s0=E.shell,eye=sp=='Direfang'?[DF150.body,.695,.62,-.012]:[SK150.body,.68,.55,-.01],old=wolfP([.09,.636,.574]);
  E.L=function(a,b,r1,r2,t,col,seg,o){if(o&&o.bn=='jaw')return E;
    if(o&&o.bn=='head'&&Math.abs(Math.abs(a[0])-old[0])<1e-6&&Math.abs(a[1]-old[1])<1e-6){const s=Math.sign(a[0]),e=bz150S(eye[0],eye[1],s>0?eye[2]:Math.PI-eye[2],eye[3]).p,d=[e[0]-a[0],e[1]-a[1],e[2]-a[2]];
      return l0.call(this,e,[b[0]+d[0],b[1]+d[1],b[2]+d[2]],r1,r2,t,col,seg,o)}
    return l0.apply(this,arguments)};
  E.shell=function(sel,off,t,col,o){return s0.call(this,(x,y,z,nx,ny,nz)=>y>.15&&sel(x,y,z,nx,ny,nz),off,t,col,o)};
  try{return b0.apply(this,arguments)}finally{E.L=l0;E.shell=s0}}}
{const D=EVO100.D.Foxlet,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Foxlet=='Emberlynx')return el150Evo(E,L,P);return b0.apply(this,arguments)}}
