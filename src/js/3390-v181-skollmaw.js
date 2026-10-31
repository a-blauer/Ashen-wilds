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
// his glow: ember and gold (the sun), unless a colour variant gives its own (as the evolution palette does)
function sk181Glow(c,red){let e=0xff7a2a;if(c){if(c.v=='Ember')e=0xff6a1a;else if(c.v=='Frost')e=0x8fe4ff;else if(c.v=='Shadow'||red)e=0xff2a3a;else if(c.v=='Golden')e=0xffc840;
  if(c.rv&&EVO100_RV[c.rv])e=EVO100_RV[c.rv];if(c.shn)e=0xfff0a0}
  const E=new THREE.Color(e);return {e,g:e==0xff7a2a?0xffc860:E.clone().lerp(new THREE.Color(0xffffff),.45).getHex(),d:E.clone().multiplyScalar(.6).getHex()}}
function sk150Kit(k,c,C,red){const K=sk150Cols(C),R=SK150.body,T=SK150.tail,eye=red?0xff2a2a:0xffb84a,ivory=0xd8cfbc,
    mane=K.main.clone().lerp(K.back,.45).getHex(),maneD=K.dark.clone().lerp(K.main,.35).getHex(),ash=K.main.clone().lerp(new THREE.Color(0x8a8690),.14).getHex(),
    nm=(v)=>{const l=Math.hypot(...v);return v.map(x=>x/l)},rn=i=>((i*9301+49297)%233280)/233280,
    GL=sk181Glow(c,red),ember=GL.e,
    tuft=(bn,h,d,ln,r,col,sides,glow)=>{const D=nm(d),e=[h.p[0]+D[0]*ln,h.p[1]+D[1]*ln,h.p[2]+D[2]*ln];k.L(bn,'c',col,h.p,e,r,.004,sides||5);
      if(glow){const m=[h.p[0]+D[0]*ln*.62,h.p[1]+D[1]*ln*.62,h.p[2]+D[2]*ln*.62];k.L(bn,'g',ember,m,e,r*.42+.003,.003,sides||5)}};
  // the mane: long shag over the neck and shoulders, sweeping back (roots 2.5 cm inside the body)
  [[.5,.1],[.45,.15],[.4,.18],[.345,.2],[.29,.19],[.235,.16],[.18,.12],[.13,.08]].forEach((q,j)=>{const N=12;for(let i=0;i<N;i++){
    const a=-.35+(i+(j%2)*.5)/(N-1)*(Math.PI+.7),h=bz150S(R,q[0],a,-.025),n=h.n,bn=q[0]>.5?'head':q[0]>.36?'neck':'chest',u=rn(i*13+j*7);
    tuft(bn,h,[n[0]*.22,n[1]*.14,-1],q[1]*(.85+u*.35),.048,u<.25?ash:(i+j)%2?mane:maneD)}});
  // the ruff: long fur hanging from the throat and the front of the chest
  [[.46,.12,'neck'],[.4,.15,'neck'],[.34,.16,'chest'],[.28,.14,'chest']].forEach((q,j)=>{for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.32+(j%2)*.12,h=bz150S(R,q[0],a,-.025),u=rn(i*5+j*11+3);
    tuft(q[2],h,[h.n[0]*.25,-1,-.1],q[1]*(.85+u*.3),.045,u<.35?ash:i%2?mane:maneD,5,j<2&&i%2==0)}});
  // cheek ruffs behind the jaw
  [-1,1].forEach(s=>[-.35,0,.35].forEach((da,i)=>{const h=bz150S(R,.575,(s>0?0:Math.PI)+da*s,-.015);tuft('head',h,[s*.6,.05-da*.3,-1],.075+i*.01,.03,i%2?mane:maneD,4)}));
  // short fur down the back, shaggy britches behind the thighs
  for(let z=.1,j=0;z>-.33;z-=.075,j++)[-.35,0,.35].forEach((da,i)=>{const h=bz150S(R,z,Math.PI/2+da,-.015),bn=z>-.12?'spine':'pelvis';tuft(bn,h,[h.n[0]*.15,.08,-1],.06+rn(i+j*3)*.02,.028,(i+j)%2?mane:maneD,4)});
  [-1,1].forEach(s=>[[-.33,.6],[-.37,.9],[-.4,.7],[-.36,1.15]].forEach((q,i)=>{const h=bz150S(R,q[0],s>0?-q[1]:Math.PI+q[1],-.02);tuft('pelvis',h,[s*.3,-.9,-.6],.085+i*.008,.035,i%2?mane:maneD,4)}));
  // the tail fluffed out along its length
  {const at=z=>{let i=0;while(i<T.length-2&&z<T[i+1][0])i++;const A=T[i],B=T[i+1],t=(z-A[0])/(B[0]-A[0]);return [A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]};
    for(let z=-.5,j=0;z>-1.01;z-=.08,j++)for(let i=0;i<6;i++){const a=(i+(j%2)*.5)/6*Math.PI*2,[y,r]=at(z),c=Math.cos(a),sn=Math.sin(a),p=[c*(r-.02),y+sn*(r-.02),z],
      bn=z>-.6?'tail0':z>-.85?'tail1':'tail2';tuft(bn,{p},[c*.22,sn*.22-.08,-1],.07+r*.6,Math.min(.032,r*.45),z<-.9?K.dark.getHex():(i+j)%2?mane:maneD,4,z<-.9&&i%2==0)}}
  // eyes: deep sockets with an amber glow, under a brow ridge that is part of the skull
  [-1,1].forEach(s=>{const h=bz150S(R,.625,s>0?.62:Math.PI-.62,-.006),e=h.p;k.p('head','sph','c',0x060507,e[0],e[1],e[2],.026,.013,.022,0,s*.5,s*-.2);
    k.p('head','oct','g',eye,e[0]+h.n[0]*.008,e[1]+h.n[1]*.008,e[2]+.006,.016,.009,.016,0,s*.5,s*-.2);
    const b0=bz150S(R,.64,s>0?1.15:Math.PI-1.15,-.006).p,b1=bz150S(R,.6,s>0?.62:Math.PI-.62,-.004).p;k.L('head','c',maneD,b0,[b1[0],b1[1]+.016,b1[2]],.014,.011,4)});
  // a dark lip line along the muzzle, canines just showing, the nose
  [-1,1].forEach(s=>{let p=bz150S(R,.6,s>0?-.62:Math.PI+.62,-.004).p;for(let z=.66;z<=.84;z+=.06){const q=bz150S(R,z,s>0?-.62:Math.PI+.62,-.004).p;k.L('head','c',0x0a0809,p,q,.006,.006,4);p=q}
    const u=bz150At(R,.8),x=s*u.w*.55,y=u.y-u.b*.85;k.p('head','cone4','c',ivory,x,y-.006,.8,.007,.03,.007,Math.PI);
    const J=bz150At(SK150.jaw,.78);k.p('jaw','cone4','c',ivory,s*J.w*.55,J.y+J.a*.6+.004,.785,.006,.022,.006)});
  k.p('head','box','c',0x08070a,0,.718,.858,.028,.019,.017);
  // the sun he swallowed: a glow down his throat and along the inside of the lower jaw (seen when he opens his mouth)
  {const J=bz150At(SK150.jaw,.7);k.p('jaw','box','g',ember,0,J.y+J.a*.55,.71,.05,.006,.2);k.p('head','sph','g',ember,0,.705,.6,.04,.026,.05)}
  // a black-sun eclipse on the brow: a black disc in a thin gold corona
  // (v181: the corona is a loop of short strokes laid on the skull's curve; a flat ring stood up to 1 cm off its edges)
  {const h=bz150S(R,.6,Math.PI/2,-.0015),rt=bz150Up(h.n),p=h.p,gold=GL.g,on=(x,z)=>{const r=bz150At(R,z);return [x,r.y+r.a*Math.sqrt(Math.max(0,1-(x/r.w)**2))-.0005,z]};
    k.p('head','sph','c',0x040306,p[0],p[1],p[2],.026,.004,.026,...rt);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2;k.L('head','g',gold,on(Math.cos(a)*.03,.6+Math.sin(a)*.03),on(Math.cos(b)*.03,.6+Math.sin(b)*.03),.0045,.0045,3)}}}
function sk150Post(x,c,C,mat){const K=sk150Cols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),K.dark),ig=lpSpikeGeo(0x3a2a40,0x120c14);
  // tall ears, swept back; the base sits 3-4 cm deep in the skull so no edge stands off the rounded head (v181)
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.05,.775,.548,.044,.185,.028,-.55,-s*.18,s*.12);
    const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.72,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})}

// ---------------- evolution look: the eclipse wolf ascends (tier 5 shows level 2 from the start; 5 at the last evolution) ----------------
// L1 ember tips through the mane, glowing claws · L2 eclipse marks on the haunches
// L3 broken golden fetters with hanging chain on the forelegs, a corona of black spines with glowing tips rising from the nape
// L4 a crown of gold rays round the brow eclipse, fetters on the hind legs · L5 flames through the corona and mane, burning
// eye trails, a burning tail tip. Everything is rooted in the body (rays onto the real surface), so it holds on in motion.
function sk181Evo(E,L,P){const M=EVO100_M,blk=0x141016,V=THREE.Vector3;
  // a tuft / spine / flame from a root sunk into the body, skinned like the body at its root (not at its middle, which for a
  // long spine over the withers is nearer the raised neck and swung it off in the bite)
  const spike=(h,d,ln,r,t,col,sink)=>{const a=E.add(h.p,h.n,-(sink||.012)),D=E.nrm(d);E.L(a,E.add(h.p,D,ln),r,.002,t,col,4,{at:a});return D};
  // a gold fetter round a lower leg: a ring of strokes laid round the leg's own loft (sk181Leg: radius .036 half way
  // between the knee and the ankle), rigid on the lower leg bone, with a glowing stud and a broken chain on the outside
  const fetter=(p,chain)=>{const b=e137B('Ashwolf',p+'1'),c=e137B('Ashwolf',p+'2'),m=e137L(b,c,.5),A=new V(c[0]-b[0],c[1]-b[1],c[2]-b[2]).normalize(),
      U=new V().crossVectors(A,new V(1,0,0)).normalize(),W=new V().crossVectors(A,U).normalize(),s=Math.sign(b[0]),R=.039,bn=p+'1',N=12,pt=a=>{const v=U.clone().multiplyScalar(Math.cos(a)*R).addScaledVector(W,Math.sin(a)*R);return [m[0]+v.x,m[1]+v.y,m[2]+v.z]};
    for(let i=0;i<N;i++)E.L(pt(i/N*Math.PI*2),pt((i+1)/N*Math.PI*2),.0075,.0075,'m',P.gold,4,{bn});
    const o=W.x*s>0?W:W.clone().negate(),q=[m[0]+o.x*(R+.006),m[1]+o.y*(R+.006),m[2]+o.z*(R+.006)];E.pd('box','g',P.glow,q,[o.x,o.y,o.z],[.014,.006,.02],[A.x,A.y,A.z],{bn});
    if(chain)lk180EChain(E,'m',P.gold,[m[0]+o.x*(R+.004),m[1]+o.y*(R+.004)-.008,m[2]+o.z*(R+.004)],3,.008,[s*.2,-1,-.3],{bn})};
  // L1 ember tips through the mane, glowing claws
  for(let i=0;i<8;i++){const z=.44-i*.045,h=E.top((i%2?1:-1)*.03,z);if(h)spike(h,[0,.25,-1.3],.1+.01*L,.022,'g',i%2?P.glow:P.glow2)}
  ['fl2','fr2','hl2','hr2'].forEach(bn=>{const c0=E.bone(bn);for(let i=-1;i<=1;i++)E.L([c0[0]+i*.018,.024,c0[2]+.078],[c0[0]+i*.019,.004,c0[2]+.112],.006,.001,'g',P.glow,3,{bn})});
  // L2 eclipse marks on the haunches
  const ecl=(h,sz)=>{E.pd('sph','c',0x040306,E.add(h.p,h.n,.001),h.n,[sz,sz*.12,sz]);E.pd('ring','g',P.glow2,E.add(h.p,h.n,.003),h.n,[sz*1.15,sz*.9,sz*1.15]);
    E.pd('ring','g',P.glow,E.add(h.p,h.n,.002),h.n,[sz*1.45,sz*.6,sz*1.45])};
  if(L>=2)[-1,1].forEach(s=>{const hh=M.side(E,s,.6,-.27);if(hh)ecl(hh,.036)});
  // L3 broken golden fetters on the forelegs, a corona of black spines with glowing tips rising from the nape
  if(L>=3){fetter('fl',1);fetter('fr',1);
    for(let i=0;i<7;i++){const z=.42-i*.05,x=(i%2?1:-1)*.02,h=E.top(x,z);if(!h)continue;const ln=.15+.03*Math.sin(i/6*Math.PI)+.01*L,D=spike(h,[x*4,1,-.55],ln,.018,'c',blk);
      const a=E.add(h.p,D,ln*.6);E.L(a,E.add(h.p,D,ln*1.01),.008,.001,'g',P.glow2,3,{at:E.add(h.p,h.n,-.012)})}}
  // L4 a crown of gold rays round the brow eclipse, fetters on the hind legs
  if(L>=4){for(let i=0;i<9;i++){const a=i/9*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),q=E.top(dx*.04,.6+dz*.04);
      if(q)E.L(E.add(q.p,q.n,-.002),E.add(q.p,E.nrm([dx,.25,dz]),.03+(i%2?0:.012)),.006,.001,'m',P.gold,3,{vs:1})}
    fetter('hl',0);fetter('hr',0)}
  // L5 flames through the corona and mane, burning eye trails, a burning tail tip
  if(L>=5){for(let i=0;i<7;i++){const z=.4-i*.05,h=E.top((i%2?-1:1)*.025,z);if(h)spike(h,[0,1,-.7],.2+.02*(i%3),.03,'g',i%2?P.glow:P.glow2,.01)}
    [-1,1].forEach(s=>{const h=E.on([s*.5,.73,.625],[-s,0,0]);if(h)E.L(E.add(h.p,h.n,.002),E.add(h.p,[s*.03,.012,-.13]),.01,.001,'g',P.glow2,3,{bn:'head'})});
    E.L([0,.49,-1.0],[0,.53,-1.12],.03,.002,'g',P.glow,5,{bn:'tail3'});E.L([0,.49,-1.01],[0,.55,-1.09],.018,.001,'g',P.glow2,4,{bn:'tail3'})}}
{const D=EVO100.D.Ashwolf,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Ashwolf!='Skollmaw')return b0.apply(this,arguments);
  const G=sk181Glow(c,c&&c.v=='Shadow');return sk181Evo(E,L,Object.assign({},P,{glow:G.e,glow2:G.g,glowD:G.d}))}}
