// ================= v181: Skollmaw redesign — the eclipse wolf (owner, Oct 30 2026) =================
// Owner: "Skollmaw's snout is too long and I'm not in love with his overall design. Let's redesign him step by step."
// Chosen direction: a huge, tall, regal wolf — a wolf-length muzzle (about half the old crocodile snout), a broad skull,
// high withers over a deep chest, a lean waist, wide muscled haunches, a thick bushy tail; the sun he swallowed smoulders
// in his throat and mouth. Same skeleton as the Ashwolf (rig variant, see 3110), so every animation and all gameplay stay.
// Also fixes the leg tops standing out beside the body (the old body was 10–12 cm wide where 7 cm thick legs hung 11–12 cm
// out): each leg now starts inside the body and widens into a shoulder or thigh muscle that is part of the body's outline.
// Step 2: the body shape (head, body, legs, tail, ears, a plain face). Fur, mane, glow and ornaments come next.
var SK150={
  // [z, y, half width, above, below, bones, tag]
  body:[[-.44,.645,.035,.035,.035,['pelvis','tail0',.6]],[-.395,.635,.085,.08,.085,['pelvis','tail0',.3]],
    [-.33,.625,.13,.11,.12,['pelvis','pelvis',0],'hip'],[-.25,.625,.14,.115,.13,['pelvis','pelvis',0],'hip'],
    [-.15,.635,.112,.105,.095,['pelvis','spine',.5]],[-.05,.645,.1,.1,.085,['spine','spine',0]],
    [.05,.66,.12,.12,.15,['spine','chest',.5]],[.15,.66,.14,.15,.23,['chest','chest',0],'chest'],
    [.25,.67,.15,.17,.24,['chest','chest',0],'chest'],[.33,.695,.135,.16,.19,['chest','neck',.5],'neck'],
    [.41,.72,.12,.13,.14,['neck','neck',0],'neck'],[.48,.74,.105,.11,.11,['neck','head',.5],'neck'],
    [.55,.75,.1,.085,.08,['head','head',0],'hd'],[.62,.745,.086,.068,.064,['head','head',0],'hd'],
    [.69,.725,.062,.046,.046,['head','head',0],'mz'],[.76,.714,.05,.037,.036,['head','head',0],'mz'],
    [.82,.708,.039,.029,.028,['head','head',0],'nose'],[.852,.706,.022,.017,.017,['head','head',0],'nose'],
    [.865,.706,.006,.006,.006,['head','head',0],'nose']],
  // the lower jaw runs back into the head and throat (a jawbone, not a separate piece) and its top sits well inside the upper muzzle
  jaw:[[.5,.71,.05,.03,.03,['head','jaw',.15],'jaw'],[.58,.69,.07,.035,.042,['head','jaw',.45],'jaw'],[.66,.678,.052,.03,.033,['head','jaw',.85],'jaw'],
    [.74,.674,.041,.026,.026,['jaw','jaw',0],'jaw'],[.81,.676,.03,.02,.018,['jaw','jaw',0],'jaw'],[.84,.678,.012,.01,.01,['jaw','jaw',0],'jaw']],
  // [z, y, radius, bones, tag]: a thick bushy tail carried low
  tail:[[-.42,.66,.045,['tail0','tail0',0]],[-.5,.63,.075,['tail0','tail1',.3]],[-.6,.59,.095,['tail0','tail1',.7]],[-.72,.55,.1,['tail1','tail1',0]],
    [-.84,.52,.09,['tail1','tail2',.6]],[-.94,.5,.07,['tail2','tail2',0],'tip'],[-1.02,.49,.04,['tail2','tail3',.6],'tip'],[-1.07,.49,.008,['tail3','tail3',0],'tip']],
  head:['head',0,.82,.56],back:[['neck',0,.85,.42],['chest',0,.84,.3],['chest',0,.81,.18],['spine',0,.76,.04],['spine',0,.74,-.1]]};
function sk150Cols(C){const main=lpMain(C,.1);return {main,back:main.clone().multiplyScalar(.5),dark:main.clone().multiplyScalar(.28),
  belly:main.clone().lerp(new THREE.Color(0x6a6878),.35),mouth:new THREE.Color(0x3a0a18),nose:new THREE.Color(0x0a090c)}}
// one leg: a top ring buried in the body, a shoulder / thigh muscle that is part of the body's outline, a lean lower leg, a paw
function sk181Leg(p,par,front,paint){const a=e137B('Ashwolf',p+'0'),b=e137B('Ashwolf',p+'1'),c=e137B('Ashwolf',p+'2'),s=Math.sign(a[0]),x=v=>s*v;
  const R=front?[.048,.078,.062,.043,.036,.032]:[.052,.092,.074,.047,.036,.034];
  return e137Limb([[[x(.085),.71,a[2]-(front?.01:.0)],R[0],[par,p+'0',.15]],[[x(.105),.56,a[2]+(front?.005:.01)],R[1],[par,p+'0',.6]],
    [[x(.11),.41,(a[2]+b[2])/2],R[2],[p+'0',p+'0',0]],[b,R[3],[p+'0',p+'1',.5]],[e137L(b,c,.5),R[4],[p+'1',p+'1',0]],
    [c,R[5],[p+'1',p+'2',.5],'ank'],[[c[0],.042,c[2]+.03],.049,[p+'2',p+'2',0],'paw'],[[c[0],.019,c[2]+.09],.03,[p+'2',p+'2',0],'paw']],paint,7)}
function sk150Geo(C){const K=sk150Cols(C);
  const paint=(o,r,s,cc,i)=>{
    if(r.k=='nose')return o.copy(K.nose);if(r.k=='paw')return o.copy(K.dark);if(r.k=='ank'){o.copy(K.main).lerp(K.dark,.5);return}
    if(r.k=='leg'){o.copy(K.main);if(r.p[1]<.3)o.lerp(K.dark,.3);return}
    if(r.k=='jaw'){if(s>.85)return o.copy(K.mouth);o.copy(K.main).lerp(K.belly,s<-.3?.4:.15);return}
    if(r.k=='tail'||r.k=='tip'){o.copy(r.k=='tip'?K.dark:K.main);if(r.k=='tail'&&s>.3)o.lerp(K.back,.5);return}
    o.copy(K.main);if(s>.45)o.lerp(K.back,.65);
    if(r.k=='hd'||r.k=='mz'){if(s<-.3)o.lerp(K.belly,.4);return}
    if(s<-.5)o.lerp(K.belly,.45)};
  const lofts=[{rings:bz150Rows(SK150.body),seg:12,capA:1,capB:1,paint},{rings:bz150Rows(SK150.jaw),seg:8,capA:1,capB:1,paint},bz150Tail(SK150.tail,paint,8),
    sk181Leg('fl','chest',1,paint),sk181Leg('fr','chest',1,paint),sk181Leg('hl','pelvis',0,paint),sk181Leg('hr','pelvis',0,paint)];
  return lpGeo('SK181|'+C,'Ashwolf',lofts,67)}
function sk150Kit(k,c,C,red){const K=sk150Cols(C),R=SK150.body,eye=red?0xff2a2a:0xffc860,dark=K.dark.getHex();
  // eyes under a heavy brow
  [-1,1].forEach(s=>{const e=bz150S(R,.625,s>0?.62:Math.PI-.62,-.008).p;k.p('head','sph','c',0x050406,e[0],e[1],e[2],.022,.014,.024,0,s*.5,s*-.2);
    k.p('head','box','g',eye,e[0]+s*.005,e[1],e[2]+.005,.022,.007,.01,0,s*.5,s*-.2);k.p('head','box','c',dark,s*.045,e[1]+.022,e[2]-.004,.05,.014,.04,.12,s*.35,s*.25)});
  k.p('head','box','c',0x08070a,0,.718,.858,.028,.019,.017)}
function sk150Post(x,c,C,mat){const K=sk150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),K.dark),ig=lpSpikeGeo(0x3a2a40,0x120c14);
  // tall ears, swept back
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.058,.815,.545,.052,.15,.028,-.55,-s*.18,s*.12);
    const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.72,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}
