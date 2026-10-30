// ================= v181: Skollmaw redesign — the eclipse wolf (owner, Oct 30 2026) =================
// Owner: "Skollmaw's snout is too long and I'm not in love with his overall design. Let's redesign him step by step."
// Chosen direction: a huge, tall, regal wolf — a wolf-length muzzle (about half the old crocodile snout), a broad skull,
// high withers over a deep chest, a lean waist, wide muscled haunches, a thick bushy tail; the sun he swallowed smoulders
// in his throat and mouth. Same skeleton as the Ashwolf (rig variant, see 3110), so every animation and all gameplay stay.
// Also fixes the leg tops standing out beside the body (the old body was 10–12 cm wide where 7 cm thick legs hung 11–12 cm
// out): each leg now starts inside the body and widens into a shoulder or thigh muscle that is part of the body's outline.
// Step 2: the body shape (head, body, legs, tail, ears). Step 3: mane, ruff, fur, eyes and face. Glow and ornaments come next.
var SK150={
  // [z, y, half width, above, below, bones, tag]
  body:[[-.44,.645,.035,.035,.035,['pelvis','tail0',.6]],[-.395,.635,.085,.08,.085,['pelvis','tail0',.3]],
    [-.33,.625,.148,.11,.16,['pelvis','pelvis',0],'hip'],[-.25,.625,.158,.115,.175,['pelvis','pelvis',0],'hip'],
    [-.15,.635,.112,.105,.095,['pelvis','spine',.5]],[-.05,.645,.1,.1,.085,['spine','spine',0]],
    [.05,.66,.125,.12,.15,['spine','chest',.5]],[.15,.66,.152,.15,.23,['chest','chest',0],'chest'],
    [.25,.67,.162,.17,.24,['chest','chest',0],'chest'],[.33,.695,.135,.16,.19,['chest','neck',.5],'neck'],
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
  // v181: above the belly line the leg stays inside the body (its widest part is lower, where it leaves the body), so no
  // 'cap' of leg stands out from the flank; the body's chest and haunches carry the shoulder and thigh muscle
  const R=front?[.046,.066,.058,.043,.036,.032]:[.05,.076,.068,.047,.036,.034];
  return e137Limb([[[x(front?.075:.07),front?.71:.66,a[2]-(front?.01:.0)],R[0],[par,p+'0',.15]],[[x(front?.098:.1),front?.49:.45,a[2]+(front?.005:.01)],R[1],[par,p+'0',.6]],
    [[x(.108),front?.38:.35,(a[2]+b[2])/2],R[2],[p+'0',p+'0',0]],[b,R[3],[p+'0',p+'1',.5]],[e137L(b,c,.5),R[4],[p+'1',p+'1',0]],
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
  // the chest and haunches are squarer underneath (lpGeo sqB), so the legs grow out of the body's underside, not its flank
  const SQ=[[.25,3],[.15,3],[.05,2.4],[.33,2.3],[-.15,2.4],[-.25,3],[-.33,3]],BR=bz150Rows(SK150.body);BR.forEach(r=>{const q=SQ.find(q=>Math.abs(q[0]-r.z)<1e-6);if(q)r.sqB=q[1]});
  const lofts=[{rings:BR,seg:12,capA:1,capB:1,paint},{rings:bz150Rows(SK150.jaw),seg:8,capA:1,capB:1,paint},bz150Tail(SK150.tail,paint,8),
    sk181Leg('fl','chest',1,paint),sk181Leg('fr','chest',1,paint),sk181Leg('hl','pelvis',0,paint),sk181Leg('hr','pelvis',0,paint)];
  return lpGeo('SK181|'+C,'Ashwolf',lofts,67)}
function sk150Kit(k,c,C,red){const K=sk150Cols(C),R=SK150.body,T=SK150.tail,eye=red?0xff2a2a:0xffb84a,ivory=0xd8cfbc,
    mane=K.main.clone().lerp(K.back,.45).getHex(),maneD=K.dark.clone().lerp(K.main,.35).getHex(),ash=K.main.clone().lerp(new THREE.Color(0x8a8690),.14).getHex(),
    nm=(v)=>{const l=Math.hypot(...v);return v.map(x=>x/l)},rn=i=>((i*9301+49297)%233280)/233280,
    tuft=(bn,h,d,ln,r,col,sides)=>{const D=nm(d);k.L(bn,'c',col,h.p,[h.p[0]+D[0]*ln,h.p[1]+D[1]*ln,h.p[2]+D[2]*ln],r,.004,sides||5)};
  // the mane: long shag over the neck and shoulders, sweeping back (roots 2.5 cm inside the body)
  [[.5,.1],[.45,.15],[.4,.18],[.345,.2],[.29,.19],[.235,.16],[.18,.12],[.13,.08]].forEach((q,j)=>{const N=12;for(let i=0;i<N;i++){
    const a=-.35+(i+(j%2)*.5)/(N-1)*(Math.PI+.7),h=bz150S(R,q[0],a,-.025),n=h.n,bn=q[0]>.5?'head':q[0]>.36?'neck':'chest',u=rn(i*13+j*7);
    tuft(bn,h,[n[0]*.22,n[1]*.14,-1],q[1]*(.85+u*.35),.048,u<.25?ash:(i+j)%2?mane:maneD)}});
  // the ruff: long fur hanging from the throat and the front of the chest
  [[.46,.12,'neck'],[.4,.15,'neck'],[.34,.16,'chest'],[.28,.14,'chest']].forEach((q,j)=>{for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.32+(j%2)*.12,h=bz150S(R,q[0],a,-.025),u=rn(i*5+j*11+3);
    tuft(q[2],h,[h.n[0]*.25,-1,-.1],q[1]*(.85+u*.3),.045,u<.35?ash:i%2?mane:maneD)}});
  // cheek ruffs behind the jaw
  [-1,1].forEach(s=>[-.35,0,.35].forEach((da,i)=>{const h=bz150S(R,.575,(s>0?0:Math.PI)+da*s,-.015);tuft('head',h,[s*.6,.05-da*.3,-1],.075+i*.01,.03,i%2?mane:maneD,4)}));
  // short fur down the back, shaggy britches behind the thighs
  for(let z=.1,j=0;z>-.33;z-=.075,j++)[-.35,0,.35].forEach((da,i)=>{const h=bz150S(R,z,Math.PI/2+da,-.015),bn=z>-.12?'spine':'pelvis';tuft(bn,h,[h.n[0]*.15,.08,-1],.06+rn(i+j*3)*.02,.028,(i+j)%2?mane:maneD,4)});
  [-1,1].forEach(s=>[[-.33,.6],[-.37,.9],[-.4,.7],[-.36,1.15]].forEach((q,i)=>{const h=bz150S(R,q[0],s>0?-q[1]:Math.PI+q[1],-.02);tuft('pelvis',h,[s*.3,-.9,-.6],.085+i*.008,.035,i%2?mane:maneD,4)}));
  // the tail fluffed out along its length
  {const at=z=>{let i=0;while(i<T.length-2&&z<T[i+1][0])i++;const A=T[i],B=T[i+1],t=(z-A[0])/(B[0]-A[0]);return [A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]};
    for(let z=-.5,j=0;z>-1.01;z-=.08,j++)for(let i=0;i<6;i++){const a=(i+(j%2)*.5)/6*Math.PI*2,[y,r]=at(z),c=Math.cos(a),sn=Math.sin(a),p=[c*(r-.02),y+sn*(r-.02),z],
      bn=z>-.6?'tail0':z>-.85?'tail1':'tail2';tuft(bn,{p},[c*.22,sn*.22-.08,-1],.07+r*.6,Math.min(.032,r*.45),z<-.9?K.dark.getHex():(i+j)%2?mane:maneD,4)}}
  // eyes: deep sockets with an amber glow, under a brow ridge that is part of the skull
  [-1,1].forEach(s=>{const h=bz150S(R,.625,s>0?.62:Math.PI-.62,-.006),e=h.p;k.p('head','sph','c',0x060507,e[0],e[1],e[2],.026,.013,.022,0,s*.5,s*-.2);
    k.p('head','oct','g',eye,e[0]+h.n[0]*.008,e[1]+h.n[1]*.008,e[2]+.006,.016,.009,.016,0,s*.5,s*-.2);
    const b0=bz150S(R,.64,s>0?1.15:Math.PI-1.15,-.006).p,b1=bz150S(R,.6,s>0?.62:Math.PI-.62,-.004).p;k.L('head','c',maneD,b0,[b1[0],b1[1]+.016,b1[2]],.014,.011,4)});
  // a dark lip line along the muzzle, canines just showing, the nose
  [-1,1].forEach(s=>{let p=bz150S(R,.6,s>0?-.62:Math.PI+.62,-.004).p;for(let z=.66;z<=.84;z+=.06){const q=bz150S(R,z,s>0?-.62:Math.PI+.62,-.004).p;k.L('head','c',0x0a0809,p,q,.006,.006,4);p=q}
    const u=bz150At(R,.8),x=s*u.w*.55,y=u.y-u.b*.85;k.p('head','cone4','c',ivory,x,y-.006,.8,.007,.03,.007,Math.PI);
    const J=bz150At(SK150.jaw,.78);k.p('jaw','cone4','c',ivory,s*J.w*.55,J.y+J.a*.6+.004,.785,.006,.022,.006)});
  k.p('head','box','c',0x08070a,0,.718,.858,.028,.019,.017)}
function sk150Post(x,c,C,mat){const K=sk150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),K.dark),ig=lpSpikeGeo(0x3a2a40,0x120c14);
  // tall ears, swept back
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.058,.815,.545,.052,.15,.028,-.55,-s*.18,s*.12);
    const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.72,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}
