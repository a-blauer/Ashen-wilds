// ================= v186: companions that looked cartoony, remodelled (owner, Nov 1 2026) =================
// Owner: "I'd also like to remodel companions that look too cartoony or childish." Same skeletons, bones, animations,
// evolution designs and gameplay; new bodies and painted detail (docs/MODEL_DETAIL_RECIPE.md: colour follows form, smooth
// mottling instead of random speckle, geometry only where it changes the outline).
// A paint point on a loft ring: x across, y up (default ref), the ring's z.
function rm186Pt(r,s,c){const ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB);return [c*r.rx+(r.p[0]||0),r.p[1]+s*ry,r.p[2]]}
function rm186Sp(rig,c){try{return rv137(rig,c)||rig}catch(e){return rig}}

// ===================================================================== Mossfrog =====================================================================
// Was a round green blob with hexagonal chips for warts, white smile and random dark speckles. Now a squat bog toad: a broad
// flat skull that runs straight into the body (no neck), a low hump over the shoulders, the belly sagging between the legs,
// heavy folded thighs; dull olive-brown hide, darker blotches that follow the body (smooth noise), a dark stripe down each
// flank, a pale dirty belly; low warts the colour of the skin, a dark mouth seam instead of the white lip.
var MF186={
  body:[[.48,.255,.03,.02,.02,['head','head',0],'snout'],[.455,.262,.13,.05,.04,['head','head',0],'snout'],[.41,.27,.2,.075,.06,['head','head',0],'hd'],
    [.35,.28,.235,.1,.08,['head','head',0],'hd'],[.28,.288,.25,.13,.105,['neck','head',.5]],[.18,.29,.265,.165,.14,['chest','chest',0]],
    [.06,.29,.27,.18,.16,['spine','spine',0]],[-.07,.29,.255,.17,.15,['spine','pelvis',.6]],[-.17,.29,.215,.145,.12,['pelvis','pelvis',0]],
    [-.25,.288,.15,.1,.08,['pelvis','tail0',.3]],[-.3,.285,.06,.05,.04,['pelvis','tail0',.5]],[-.32,.285,.012,.012,.012,['tail0','tail0',0]]],
  cols(C){const skin=lpMain(C,.5).lerp(new THREE.Color(0x4a4a2a),.35).multiplyScalar(.85);return {skin,back:skin.clone().multiplyScalar(.7),blot:skin.clone().lerp(new THREE.Color(0x16180e),.62),
    stripe:skin.clone().lerp(new THREE.Color(0x1a1610),.55),belly:new THREE.Color(0x9a9470),mouth:new THREE.Color(0x2a1a14),gland:skin.clone().lerp(new THREE.Color(0x6a5a3a),.35)}}};
function mf186Geo(C){const K=MF186.cols(C),sn=(p,f,sd)=>n3Sn(p[0],p[1],p[2],f,sd);
  const paint=(o,r,s,c)=>{const p=rm186Pt(r,s,c);o.copy(K.skin);
    if(r.k=='snout'&&s<.2){o.lerp(K.mouth,.25)}
    if(s>.3)o.lerp(K.back,(s-.3)*.9);
    // blotches on the back and flanks (smooth, follow the body), the flank stripe, the belly
    const b=sn(p,11,3);if(s>-.2&&b>.52)o.lerp(K.blot,Math.min(1,(b-.52)*5)*.75);
    if(s>-.15&&s<.12&&r.p[2]<.3&&r.p[2]>-.22)o.lerp(K.stripe,.55*(1-Math.abs(s+.02)/.14));
    if(s<-.3){const t=Math.min(1,(-.3-s)*3);o.lerp(K.belly,t*.85);if(sn(p,24,7)>.65)o.lerp(K.blot,.25*t)}};
  const body={rings:MF186.body.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],k:q[6]||'b'})),seg:10,capA:1,capB:1,paint};
  // the lower jaw: a thin plate under the snout (moves with the jaw bone)
  const jaw={rings:[[.42,.235,.18,.016,.02,['head','jaw',.6]],[.45,.236,.13,.014,.016,['jaw','jaw',0]],[.475,.24,.04,.01,.01,['jaw','jaw',0]]].map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],k:'jaw'})),
    seg:10,capB:1,paint:(o,r,s)=>{o.copy(s>0?K.mouth:K.belly).lerp(K.skin,s>0?.1:.3)}};
  const legs=[].concat(...[-1,1].map(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr';return [
    // front legs: elbows out, short and thick
    [[s*.16,.25,.16,.06,['chest',F+'0',.5]],[s*.2,.16,.17,.046,[F+'0',F+'1',.6]],[s*.19,.08,.155,.036,[F+'1',F+'1',0]],[s*.18,.03,.16,.03,[F+'2',F+'2',0]]],
    // hind legs: a fat folded thigh, the shin back down, the long foot
    [[s*.15,.28,-.14,.1,['pelvis',H+'0',.5]],[s*.22,.2,-.1,.088,[H+'0',H+'0',0]],[s*.235,.13,-.07,.06,[H+'0',H+'1',.6]],[s*.215,.08,-.15,.05,[H+'1',H+'1',0]],[s*.2,.04,-.21,.04,[H+'1',H+'2',.5]],[s*.19,.02,-.245,.032,[H+'2',H+'2',0]]]]}));
  return lpGeo('MF186|'+C,'Mossfrog',[body,jaw].concat(legs.map(L=>({rings:L.map(q=>({p:[q[0],q[1],q[2]],rx:q[3],ryT:q[3]*1.12,ryB:q[3]*1.12,b:q[4],k:'leg'})),seg:7,ref:[0,0,1],capB:1,
    paint:(o,r,sn2,c)=>{const p=rm186Pt(r,sn2,c);o.copy(K.skin);if(sn(p,15,5)>.62)o.lerp(K.blot,.6);if(r.p[1]<.06)o.multiplyScalar(.82)}}))),41)}
function mf186Kit(k,c,C,red){const K=MF186.cols(C),skin=K.skin.getHex(),dk=K.skin.clone().multiplyScalar(.72).getHex(),lid=K.skin.clone().multiplyScalar(.88).getHex(),gl=K.gland.getHex(),eye=red?0xff2a2a:0xc8a030;
  [-1,1].forEach(s=>{
    // v186b: big bulging eyes raised on turrets high on the skull (owner: "his eyes arent even showing"): a skin turret, a
    // glowing gold eyeball out the side and front, a black horizontal pupil, a heavy dark lid over the top; a round
    // eardrum behind each eye and a nostril on the snout
    k.p('head','sph2','c',lid,s*.13,.35,.36,.06,.04,.058);
    k.p('head','sph','c',red?0x8a2a1a:0x9a6a1a,s*.15,.384,.378,.05,.046,.048);
    k.p('head','box','c',0x050505,s*.184,.388,.411,.03,.008,.006,0,s*Math.PI/4,0);
    k.p('head','sph','g',new THREE.Color(eye).multiplyScalar(.6).getHex(),s*.176,.404,.41,.006,.005,.004,0,s*Math.PI/4,0);
    k.p('head','sph','c',dk,s*.14,.416,.37,.056,.022,.054,.12,s*.3,s*.2);
    k.p('head','sph','c',dkShade(dk,.8),s*.215,.33,.31,.032,.032,.008,0,s*1.25,0);
    k.p('head','sph','c',0x0a0c08,s*.035,.31,.462,.009,.006,.008);
    // the parotoid gland behind each eye: a long low swelling with a few pores
    k.p('head','sph','c',gl,s*.16,.355,.27,.05,.03,.08,0,s*.25,s*.3);
    [0,1,2].forEach(i=>k.p('head','sph','c',dk,s*(.168+i*.006),.382-i*.006,.3-i*.03,.007,.004,.007));
    // a dorsolateral fold: a low ridge from behind the eye along the back
    k.L('chest','c',dk,[s*.13,.4,.27],[s*.15,.43,.1],.022,.02,5);k.L('spine','c',dk,[s*.15,.43,.1],[s*.13,.415,-.1],.02,.014,5)});
  // moss: low flat clumps of dark green on the back (lumps, not chips)
  [[.04,.464,.06,.05],[-.07,.458,-.04,.045],[.08,.425,-.14,.04],[-.03,.45,.17,.035],[.15,.436,.02,.03]].forEach((q,i)=>{const bn=q[2]>.1?'chest':q[2]>-.1?'spine':'pelvis';
    [[0,0,1],[.6,.4,.7],[-.5,.5,.6],[.2,-.6,.65]].forEach((o,j)=>{const r=q[3]*.42*o[2];k.p(bn,'ico','c',(i+j)%2?0x2a3618:0x3a4a22,q[0]+o[0]*q[3]*.7,q[1]-.004*j,q[2]+o[1]*q[3]*.7,r,r*.55,r,0,i+j,0)})});
  // the mouth seam: a dark line round the snout where the jaw meets it
  for(let i=-3;i<=3;i++){const a=i/3*1.05,x=Math.sin(a)*.18,z=.405+Math.cos(a)*.062;k.p('head','box','c',0x140c0a,x,.245,z,.058,.006,.008,0,a,0)}
  // low warts the colour of the skin over the back and flanks (lumps, not chips)
  [[.09,.45,.14],[-.1,.452,.09],[.13,.44,-.03],[-.14,.432,-.07],[.05,.458,-.12],[-.05,.448,.2],[.19,.4,.06],[-.2,.39,.02],[.17,.4,-.14],[-.16,.41,.13],[.0,.46,.02],[.22,.36,-.06],[-.22,.355,-.05],[.08,.44,-.2]]
    .forEach((q,i)=>{const r=.016+(i%3)*.004;k.p(q[2]>.1?'chest':q[2]>-.1?'spine':'pelvis','sph','c',i%2?dk:K.skin.clone().multiplyScalar(1.06).getHex(),q[0],q[1]-.02-Math.abs(q[0])*.12-Math.max(0,-q[2]-.1)*.25,q[2],r,r*.55,r)});
  // webbed feet: three long toes, the webbing a thin dark plate
  [['fl2',-.18,.16,1],['fr2',.18,.16,1],['hl2',-.19,-.245,1.35],['hr2',.19,-.245,1.35]].forEach(f=>{
    k.p(f[0],'box','c',dk,f[1],.016,f[2]+.02*f[3],.07*f[3],.012,.05*f[3]);
    [-1,0,1].forEach(i=>{const a=i*.5+(f[1]<0?-.2:.2),L=.065*f[3],x=f[1]+Math.sin(a)*L,z=f[2]+Math.cos(a)*L;
      k.L(f[0],'c',dk,[f[1],.02,f[2]],[x,.012,z],.013,.009,4);k.p(f[0],'sph','c',lid,x,.012,z,.011,.008,.011)})})}
{const B=LPR.Mossfrog,g0=B.geo,k0=B.kit;
  B.geo=function(C,c){if(rm186Sp('Mossfrog',c)=='Mossfrog')return mf186Geo(C);return g0.apply(this,arguments)};
  B.kit=function(k,c,C,red){if(rm186Sp('Mossfrog',c)=='Mossfrog')return mf186Kit(k,c,C,red);return k0.apply(this,arguments)};
  if(typeof EVO100!='undefined'&&EVO100.surf)delete EVO100.surf.Mossfrog}
// Mossfrog evolution (one theme, a bog elder; was pustules + runes + a moss cloak with strands + a reed crown + a tooth
// necklace + brow spurs + an angler lure + glowing eye rings + a moss beard + spines): L1 a few dim pustules in the blotches
// (a fourth from L2; a moss mantle over the back read as a blocky plate and is gone), L3 bony brow ridges and a glowing seam along the flank stripe, L4 the angler lure,
// L5 short glowing spines along the spine line
{const D=EVO100.D.Mossfrog,b0=D.build;D.build=function(E,L,P,c){if((RV137.cur.Mossfrog||'Mossfrog')!='Mossfrog')return b0.apply(this,arguments);
  const moss=0x3a4a22,mossD=0x2a361a,pg=new THREE.Color(P.glow).lerp(new THREE.Color(P.mainD),.35).getHex();
  [[.09,.03],[-.11,-.07],[.12,-.15],[-.05,.13]].slice(0,L>=2?4:3).forEach(q=>{const t=E.top(q[0],q[1]);if(t)E.pd('sph','g',pg,E.add(t.p,t.n,-.003),t.n,[.014,.008,.014])});

  if(L>=3){[-1,1].forEach(s=>{const h=E.top(s*.13,.33);if(h)E.L(E.add(h.p,h.n,-.008),E.add(E.add(h.p,[0,0,-.06]),h.n,.022),.016,.004,'c',P.boneD,4,{bn:'head'})});
  }
  if(L>=4){const lt=E.top(0,.3),b=lt?lt.p[1]-.012:.38;
    E.chain([[0,b,.3],[0,b+.07,.33],[0,b+.1,.39],[0,b+.08,.44]],.012,.006,'c',P.mainD,5,{bn:'head'});E.pd('ico','g',P.glow,[0,b+.06,.45],[0,1,0],.022,null,{bn:'head'})}
  if(L>=5)[.12,.0,-.12].forEach(z=>{const t=E.top(0,z);if(t)E.L(E.add(t.p,t.n,-.006),E.add(t.p,E.nrm([0,1,-.6]),.055),.012,.002,'g',P.glow2,4)})}}

// ===================================================================== Emberlynx =====================================================================
// Was covered in 44 raised round spot discs over painted polka dots and eleven glowing stripe sets (flanks, legs, brow): it
// read as a toy leopard. Now the lynx coat: the spots are painted, small and soft, denser on the haunches and fading toward
// the belly (smooth noise, never a raised disc); the embers are two short smouldering seams over each shoulder and the brow
// mark; the cheek ruff, tufted ears and big paws stay.
function el150Geo(C){const K=el150Cols(C),sn=(p,f,sd)=>n3Sn(p[0],p[1],p[2],f,sd);
  const paint=(o,r,s,cc,i)=>{const p=rm186Pt(r,s,cc);
    if(r.k=='nose')return o.copy(K.nose);if(r.k=='paw'){o.copy(K.main).lerp(K.cream,.35);if(s<0)o.lerp(K.cream,.5);return}
    if(r.k=='ank'){o.copy(K.main).lerp(K.cream,.2);return}
    if(r.k=='leg'){o.copy(K.main);if(s<-.2)o.lerp(K.cream,.35);const n=sn(p,34,5);if(n>.7)o.lerp(K.spot,.35*Math.min(1,(n-.7)*5));return}
    if(r.k=='jaw')return o.copy(s>.3?new THREE.Color(0x5a1a1a):K.cream);
    if(r.k=='tip')return o.copy(K.black);if(r.k=='tail'){o.copy(K.main);if(s<-.4)o.lerp(K.cream,.5);return}
    if(r.k=='muz'){o.copy(K.cream).lerp(K.main,.25);if(s>.4)o.lerp(K.main,.55);return}
    o.copy(K.main);if(s>.6)o.lerp(K.back,.5);
    if(r.k=='hd'){if(s<-.15)o.lerp(K.cream,.75);if(r.z>.55&&s<.3)o.lerp(K.cream,.4);return}
    if(s<-.4){o.lerp(K.cream,.7);return}
    // soft painted spots: more on the haunches, fewer toward the belly and the shoulders
    const n=sn(p,30,11),w=.55+.25*Math.max(0,-r.p[2]*2.5)-.2*Math.max(0,-s);if(n>.8-w*.18)o.lerp(K.spot,.62*Math.min(1,(n-(.8-w*.18))*6))};
  const lofts=[{rings:bz150Rows(EL150.body),seg:10,capA:1,capB:1,paint},{rings:bz150Rows(EL150.jaw),seg:7,capA:1,capB:1,paint},bz150Tail(EL150.tail,paint,7)]
    .concat(bz150Legs('Foxlet',[.054,.036,.028,.048],[.068,.04,.029,.048],paint,{toe:.07,foot:.03,seg:7}));
  return lpGeo('EL186|'+C,'Foxlet',lofts,73)}
{const f=el150Kit;el150Kit=function(k,c,C,red){const K=el150Cols(C),sp=K.spot.getHex(),p0=k.p,L0=k.L;let st=0;
  k.p=function(bn,geo,t,col){if(geo=='sph'&&t=='c'&&col===sp&&/^(chest|spine|pelvis)$/.test(bn))return k;return p0.apply(k,arguments)};
  // keep the first flank stripe set (the shoulder seams, 3 strokes per side) and the brow mark; drop the rest of the glow strokes
  k.L=function(bn,t,col){if(t=='g'){st++;const brow=bn=='head';if(!brow&&st>6)return k}return L0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}

// ===================================================================== Gloomcap / Sporelord =====================================================================
// Were a candy-pink toadstool with white polka-dot warts on a cream pear of a stem (Gloomcap) and a teal morel with a bright
// white lace net (Sporelord). The palette grade (3430) takes the candy out; here the stem loses its pot belly and turns a
// dirty, bruised bone colour with dark fibres and rot patches, the cap gets bruise blotches and a darker, wetter rim, the
// polka dots become a few low scabs in the cap's own colour, and the Sporelord's veil is a dull, half-rotted lace.
{const f=lpGeo;lpGeo=function(key,n,lofts,seed){if(!/^GC137\|/.test(key))return f.apply(this,arguments);
  const sp=key.split('|')[1],sn=(p,fq,sd)=>n3Sn(p[0],p[1],p[2],fq,sd),bone=new THREE.Color(sp=='Sporelord'?0x8e8470:0x8a7e6a),rot=new THREE.Color(0x3a2e22),bruise=new THREE.Color(0x2a1a22),fib=new THREE.Color(0x4a3e30);
  const L2=lofts.map((L,i)=>{if(i==0){// the stem
      const rings=L.rings.map(r=>{const k=r.p[1]<.45?.86+.14*Math.max(0,(r.p[1]-.05)/.4):1;return Object.assign({},r,{rx:r.rx*k,ryT:(r.ryT==null?r.rx:r.ryT)*k,ryB:(r.ryB==null?r.rx:r.ryB)*k})});
      return Object.assign({},L,{rings,paint:(o,r,s,c,ii)=>{L.paint(o,r,s,c,ii);const p=rm186Pt(r,s,c);o.lerp(bone,.55);if(Math.abs(Math.sin(Math.atan2(c,s)*9+r.p[1]*14))>.82)o.lerp(fib,.35);
        const n=sn(p,16,2);if(n>.66)o.lerp(rot,.45*Math.min(1,(n-.66)*5))}})}
    if(i==2)return Object.assign({},L,{paint:(o,r,s,c,ii)=>{L.paint(o,r,s,c,ii);const p=rm186Pt(r,s,c);const n=sn(p,11,6);if(n>.6)o.lerp(bruise,.4*Math.min(1,(n-.6)*4));
        if(ii<=1)o.lerp(bruise,.25);o.multiplyScalar(.9)}});
    return L});
  return f.call(this,key+'|186',n,L2,seed)}}
{const G=LPR.Gloomcap,k0=G.kit;G.kit=function(k,c,C,red){const sp=gc137Sp(c),cap=new THREE.Color(lpMain(C,.12)),scab=cap.clone().lerp(new THREE.Color(0x8a7a6a),.35).getHex(),p0=k.p,L0=k.L;let w=0;
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(geo=='dod'&&t=='c'&&bn=='head'){if(++w>7)return k;return p0.call(k,bn,geo,t,scab,x,y-.004,z,sx*.9,sy*.4,sz*.9,rx,ry,rz)}return p0.apply(k,arguments)};
  k.L=function(bn,t,col){if(sp=='Sporelord'&&col===0xe8e0c8){const a=Array.prototype.slice.call(arguments);a[2]=0x7a7262;return L0.apply(k,a)}return L0.apply(k,arguments)};
  try{return k0.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}

// ===================================================================== Bogmaw =====================================================================
// Six big glowing yellow eyes read as a cartoon; 36 warts plus pustules was noise. The eyes are now small dim embers sunk in
// their lids (the four rear ones barely lit), and half the warts are gone.
{const f=er150BogKit;er150BogKit=function(k,C,red){const p0=k.p;let w=0,e=0;const eyeHex=red?0xff2a2a:0xd8e040,dimE=new THREE.Color(eyeHex).lerp(new THREE.Color(0x3a2a10),.45).getHex();
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){
    if(t=='g'&&col===eyeHex&&bn=='head'){e++;return p0.call(k,bn,geo,t,e<=2?dimE:new THREE.Color(dimE).multiplyScalar(.55).getHex(),x,y,z,sx,sy,sz,rx,ry,rz)}
    if((geo=='ico'||geo=='sph')&&t=='c'&&bn!='head'&&bn!='jaw'&&sx<.04&&sx>.012&&col!==0x8a8a50&&col!==0xb0a860){if((w++)%2)return k}
    return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0}}}

// ===================================================================== Skyhawk evolution =====================================================================
// The two tail streamers ran half a metre past the tail on thin shafts and read as antennae (and still did when shortened):
// they are gone, the tail fan carries the look; the bead cord in the crest is gone too.
{const f=bd184EvoSky;bd184EvoSky=function(E,L,P,c){const pd0=E.pd,L0=E.L;
  E.pd=function(geo,t,col,pos,dir,s,fwd,o){if(o&&o.bn=='tail3')return E;
    if(o&&o.bn=='head'&&geo=='sph'&&Array.isArray(dir)&&s===.012)return E;return pd0.call(E,geo,t,col,pos,dir,s,fwd,o)};
  E.L=function(a,b,r1,r2,t,col,seg,o){if(o&&o.bn=='head'&&col===P.leather)return E;return L0.apply(E,arguments)};
  try{return f.apply(this,arguments)}finally{E.pd=pd0;E.L=L0}}}

// ===================================================================== Wispling / Lumenwisp / Soulwarden evolution =====================================================================
// The floating rune halo over the hood (a ring of glow on three threads, with glowing beads) read as a UI marker; it is gone.
// The circlet on the hood, the flames of the last look and everything else stay.
{const D=EVO100.D.Wispling,b0=D.build;D.build=function(E,L,P,c){const L0=E.L,pd0=E.pd;
  E.L=function(a,b,r1,r2,t,col,seg,o){if(t=='g'&&o&&o.bn=='head'&&r1<=.008&&Math.max(a[1],b[1])>1.17)return E;return L0.apply(E,arguments)};
  E.pd=function(geo,t,col,pos){if(geo=='oct'&&t=='g'&&pos&&pos[1]>1.18)return E;return pd0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.L=L0;E.pd=pd0}}}
// the Lichbone's soul-fire halo on threads over its crown, the same marker look: gone (the brow rune and horn bands stay)
{const f=lb150Evo;lb150Evo=function(E,L,P){const L0=E.L,pd0=E.pd,c=boneP([0,.95,.5]);
  const near=p=>Math.abs(p[1]-c[1])<.03&&Math.hypot(p[0]-c[0],p[2]-c[2])<.14;
  E.L=function(a,b,r1,r2,t,col,seg,o){if(t=='g'&&r1<=.008&&(near(a)||near(b)))return E;return L0.apply(E,arguments)};
  E.pd=function(geo,t,col,pos){if(geo=='oct'&&t=='g'&&pos&&near(pos))return E;return pd0.apply(E,arguments)};
  try{return f.apply(this,arguments)}finally{E.L=L0;E.pd=pd0}}}
// the spirits' L2 mantle alternated two colours triangle by triangle (a checkerboard): one dark cloth now
{const D=EVO100.D.Wispling,b0=D.build;D.build=function(E,L,P,c){const s0=E.shell;
  E.shell=function(sel,off,t,col,o){if(typeof col=='function'&&t=='c'){const a=col(0,0,0,0),b=col(0,0,0,1);if(a!==b){const m=new THREE.Color(a).lerp(new THREE.Color(b),.5).getHex();col=m}}return s0.call(E,sel,off,t,col,o)};
  try{return b0.apply(this,arguments)}finally{E.shell=s0}}}
// Gloomcap / Sporelord evolution: the twelve glowing dots and eight glow motes scattered over the cap (polka dots again) are
// gone; the glowing gills, bracket fungi, little toadstools, hanging moss, spore stalks and glowing rim stay
{const D=EVO100.D.Gloomcap,b0=D.build;D.build=function(E,L,P,c){const pd0=E.pd;
  E.pd=function(geo,t,col,pos,dir,s){if(t=='g'&&((geo=='sph'&&Array.isArray(s)&&s[1]<=.006)||(geo=='ico'&&s===.014)))return E;return pd0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.pd=pd0}}}
// Ashwolf / Direfang war-wolf evolution: the metal spike studs on the saddle plates and the gold crown spikes on the helm are
// gone (with the ruff, hackles, spikes of the trait and the horns, the back bristled with points from every side)
{const D=EVO100.D.Ashwolf,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Ashwolf=='Skollmaw')return b0.apply(this,arguments);const pd0=E.pd;
  E.pd=function(geo,t,col){if(geo=='cone4'&&t=='m'&&(col===P.trim||col===P.gold))return E;return pd0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.pd=pd0}}}

// ===================================================================== Stoneshell =====================================================================
// The eleven boulders set into the shell stood out as round chips (polka dots of stone); they are now six low slabs in the
// shell's own stone, sunk flush, so the shell reads as one weathered carapace with a few raised plates; moss and crystals stay.
{const B=LPR.Stoneshell,k0=B.kit;B.kit=function(k,c,C,red){if((RV137.cur.Stoneshell||'Stoneshell')!='Stoneshell')return k0.apply(this,arguments);
  const p0=k.p;let n=0;k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='spine'&&t=='c'&&(geo=='dod'||geo=='ico')&&sx>=.04&&sx<=.08&&Math.abs(sy-sx*.75)<.002){if((n++)%2)return k;
      return p0.call(k,bn,geo,t,col,x,y-sx*.12,z,sx*1.25,sx*.32,sz*1.25,0,ry||0,0)}return p0.apply(k,arguments)};
  try{return k0.apply(this,arguments)}finally{k.p=p0}}}

// ===================================================================== fixes from the fresh-agent review (v186) =====================================================================
// Widowqueen L3: the white silk strands with beads hanging under the abdomen (dangles) are gone; the steel plates are matte dark
{const f=cs150WQEvo;cs150WQEvo=function(E,L,P){const L0=E.L,pd0=E.pd;
  E.L=function(a,b,r1,r2,t,col){if(col===0xd8d4cc)return E;return L0.apply(E,arguments)};
  E.pd=function(geo,t,col){if(col===0xe8e4dc)return E;if(geo=='hem'&&t=='m'&&col===P.metal){const a=Array.prototype.slice.call(arguments);a[1]='c';a[2]=new THREE.Color(P.dark).lerp(new THREE.Color(P.mainD),.4).getHex();return pd0.apply(E,a)}return pd0.apply(E,arguments)};
  try{return f.apply(this,arguments)}finally{E.L=L0;E.pd=pd0}}}
// Ashwolf / Direfang war wolf: one armour (the shoulder lames and the brow helm); no saddle or chest plates, no leather
// bracers or bands on the legs, no glowing war-paint strokes
{const D=EVO100.D.Ashwolf,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Ashwolf=='Skollmaw')return b0.apply(this,arguments);let m=0;const sh0=E.shell,bd0=E.band,L0=E.L;
  E.shell=function(sel,off,t,col){if(t=='c'&&col===P.leather)return 0;if(t=='m'){m++;if((m>=4&&m<=6)||m==8)return 0}return sh0.apply(E,arguments)};
  E.band=function(){return []};
  E.L=function(a,b,r1,r2,t){if(t=='g'&&r1===.008&&r2===.003)return E;return L0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.shell=sh0;E.band=bd0;E.L=L0}}}
// the spirits' L2 mantle (an opaque dark slab on the see-through ghost) is gone; the hood carries the evolution look
{const D=EVO100.D.Wispling,b0=D.build;D.build=function(E,L,P,c){const s0=E.shell;E.shell=function(sel,off,t){if(t=='c')return 0;return s0.apply(E,arguments)};const pd1=E.pd;
  E.pd=function(geo,t,col,pos,dir,sc,fwd,o){if(geo=='ico'&&t=='g'&&o&&o.bn=='chest')return E;return pd1.apply(E,arguments)};   // the soul motes sat on that mantle
  try{return b0.apply(this,arguments)}finally{E.shell=s0;E.pd=pd1}}}
// Foxlet's extra tails fan wider (they passed through each other and the rump)
{const t0=EVO100_M.tail;EVO100_M.tail=function(E,T,root,a,up,k,cB,cT,tg,gc){return t0.call(this,E,T,root,a*1.45,up+.06,k,cB,cT,tg,gc)}}
// Gloomcap L4: three spore stalks instead of five (a pincushion)
{const D=EVO100.D.Gloomcap,b0=D.build;D.build=function(E,L,P,c){let n=0;const L0=E.L,pd0=E.pd;
  E.L=function(a,b,r1,r2,t,col,seg,o){if(r1===.014&&r2===.008&&t=='c'&&o&&o.bn=='head'){n++;if(n==2||n==4)return E.__skip=1,E}E.__skip=0;return L0.apply(E,arguments)};
  E.pd=function(geo,t){if(E.__skip&&geo=='sph'&&t=='g'){E.__skip=0;return E}return pd0.apply(E,arguments)};
  try{return b0.apply(this,arguments)}finally{E.L=L0;E.pd=pd0;delete E.__skip}}}
