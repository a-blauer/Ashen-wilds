// ================= v100 models track: anatomical mounts with tack =================
// The ten mounts are rebuilt with real anatomy for what they are, still low-poly, flat-shaded and vertex-painted:
//   * one skinned body per mount lofted from a species template (horse, boar, cat/wolf, raptor, drake; the stag, ram and
//     pony are the horse template re-proportioned; the Bone Destrier is a horse skeleton): barrel / hindquarter / shoulder
//     masses, a tucked waist where the animal has one, a real neck carriage, a head with jowls / muzzle / skull shape,
//     jointed legs (forearm - knee - cannon - fetlock - pastern - hoof; thigh - stifle - gaskin - hock; digitigrade paws
//     for the cats and wolves, bird legs for the raptor) and a proper tail;
//   * the KNEE bone of every leg is the joint that folds in a stride (carpus / hock / wrist / ankle). Its rest rotation is
//     Y-flipped (order YXZ, ry = PI) so the shared v85 gait (mtGait) and the v93 idle, which drive rotation.x with the old
//     signs, now fold front cannons backward and hind cannons forward like the real animal (effective angle = -x). The
//     raptor's ankle is not flipped: a bird's foot comes up and forward when the ankle folds, which the old sign already does;
//   * tack (built in mountModel): blanket in the tier colour, a saddle with pommel, cantle, skirts, girth and saddle bags,
//     a bridle (headstall, browband, noseband, bit rings) and reins; war mounts wear barding (chanfron, crinet, peytral,
//     crupper, caparison). Reins and stirrups follow the rider's hands and feet while riding (MDL100_ride).
// Contract kept with everything that drives a mount: r.b (body bone), r.b's first two child bones are neck and tail,
// head = neck's first child bone, every other bone directly under r is a hip whose first child bone is the knee,
// r.rig(now,mv,sp), r.seat=[seat height, seat z], g.sd, g.seat. Gait (zzI_anim mtGait), idle (zzN_idle idlMount),
// riding (zzN_creator_ride) and the Stable work unchanged. MDL100.on=false restores the v83 models.
var MDL100={on:true,G:{},err:0,only:null}; // only: debug filter, build just these detail groups (test/v100 layer sheets)
var MDL100_TIER=[0x6a1a1a,0x2a3a5a,0x3a4a2a,0x4a2a5a,0x1a1a1e];
function MDL100_rig(k){if(!MDL100.on||!MDL100_S[k])return null;try{return MDL100_build(k)}catch(e){if(MDL100.err++<3)console.error('v100 mount',k,e);return null}}

// ---------------------------------------------------------------- skinned loft (superellipse rings, optional open arcs)
// ring {p:[x,y,z], rx, ryT, ryB, sq, b:[boneA,boneB,blend], j(jitter), ref}; loft {rings, seg, ref:Vector3, capA, capB, arc:[a0,a1], paint(col,ring,s,c,i)}
function MDL100_geo(key,names,lofts,seed){
  if(MDL100.G[key])return MDL100.G[key];
  const P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(seed||91),V=THREE.Vector3,tmp=new THREE.Color();
  const bi=b=>{const i=names.indexOf(b);if(i<0)throw new Error('mdl100: no bone '+b);return i};
  for(const Lf of lofts){
    const rings=Lf.rings;if(!rings||rings.length<2)continue;
    const seg=Lf.seg||8,arc=Lf.arc,nv=arc?seg+1:seg,base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),rf=(r.ref||Lf.ref),U=rf.clone().sub(tg.clone().multiplyScalar(rf.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      const e=2/(r.sq||Lf.sq||2);
      for(let k=0;k<nv;k++){
        const a=arc?arc[0]+(arc[1]-arc[0])*k/seg:Math.PI/2+k/seg*Math.PI*2,c0=Math.cos(a),s0=Math.sin(a);
        const c=Math.sign(c0)*Math.pow(Math.abs(c0),e),s=Math.sign(s0)*Math.pow(Math.abs(s0),e);
        const ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB),j=r.j?1+(R()-.5)*r.j:1,ox=r.ox||0;
        P.push(pts[i].x+(Sd.x*(c*r.rx+ox)+U.x*s*ry)*j,pts[i].y+(Sd.y*(c*r.rx+ox)+U.y*s*ry)*j,pts[i].z+(Sd.z*(c*r.rx+ox)+U.z*s*ry)*j);
        Lf.paint(tmp,r,s0,c0,i,k);tmp.multiplyScalar(.9+R()*.13);Cc.push(tmp.r,tmp.g,tmp.b);
        SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0)}});
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*nv+k,a1=base+i*nv+(arc?k+1:(k+1)%seg),b2=a+nv,b3=a1+nv;IX.push(a,a1,b2,b2,a1,b3)}
    if(!arc)[[Lf.capA,0],[Lf.capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;P.push(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z);
      Lf.paint(tmp,r,q[1]?1:-1,0,q[1],-1);Cc.push(tmp.r,tmp.g,tmp.b);SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0);
      const o=base+q[1]*nv;for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}})}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;return MDL100.G[key]=G}
// a sheet (rows × cols grid of points) as a plain geometry for rigid parts (cloth, plates, membranes)
function MDL100_sheet(rows,two){const P=[],I=[],nr=rows.length,nc=rows[0].length;rows.forEach(r=>r.forEach(p=>P.push(p.x,p.y,p.z)));
  for(let i=0;i<nr-1;i++)for(let j=0;j<nc-1;j++){const a=i*nc+j,b=a+1,c=a+nc,d=c+1;I.push(a,c,b,b,c,d);if(two)I.push(a,b,c,b,d,c)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;return n}

// ---------------------------------------------------------------- species templates (units of the mount's height Hw)
// body [z, y, half width, half height above, half height below]; legs [y, z, rx, front, back, bone (B body/hip, H hip,
// J hip/knee, K knee), tag]; neck rings [t along the neck 0..1, dorsal, ventral, side]; head [z along the snout, y, w, t, b]
var MDL100_T={
 horse:{sq:2.25,
  body:[[-0.575,0.88,0.043,0.04,0.05],[-0.55,0.86,0.103,0.09,0.13],[-0.5,0.84,0.146,0.13,0.2],[-0.42,0.815,0.168,0.155,0.25],[-0.3,0.8,0.176,0.165,0.26],[-0.16,0.77,0.181,0.165,0.26],
    [0,0.755,0.185,0.175,0.255],[0.14,0.765,0.181,0.18,0.255],[0.26,0.79,0.163,0.185,0.255],[0.36,0.79,0.142,0.17,0.24],[0.45,0.77,0.12,0.14,0.2],[0.52,0.75,0.086,0.1,0.13],[0.56,0.74,0.034,0.04,0.05]],
  neck:{p0:[.86,.37],p1:[1.2,.76],rings:[[-.32,.15,.17,.13,0],[0,.13,.17,.105,-.01],[.3,.115,.13,.085,-.015],[.6,.088,.095,.072,-.01],[.85,.07,.075,.064,0],[1.03,.064,.07,.06,0]]},
  head:{ang:.78,rings:[[-.07,0,.055,.05,.06],[-.03,0,.075,.065,.1],[.05,-.01,.083,.064,.125],[.13,-.01,.08,.058,.11],[.21,-.02,.066,.05,.075],[.29,-.032,.055,.044,.056],[.35,-.04,.055,.043,.056],[.39,-.045,.054,.038,.05],[.415,-.05,.038,.028,.034]]},
  tail:{p:[.89,-.55],tr:-2.62,len:.62,rings:[[-.05,.04],[.04,.06],[.16,.072],[.3,.085],[.44,.09],[.56,.07],[.65,.025]]},
  F:{x:.125,piv:[.74,.27],kn:[.295,.3],rings:[[.8,.29,.08,.11,.11,'B'],[.68,.29,.088,.105,.1,'H'],[.56,.28,.07,.07,.085,'H'],[.45,.295,.052,.055,.055,'H'],[.35,.3,.042,.044,.042,'H'],
    [.295,.3,.046,.05,.044,'J'],[.25,.3,.034,.033,.04,'K'],[.16,.3,.031,.029,.036,'K'],[.11,.3,.039,.038,.044,'K','fet'],[.075,.315,.03,.03,.03,'K','pas'],[.048,.33,.039,.039,.037,'K','hoof'],[0,.34,.047,.048,.043,'K','hoof']]},
  H:{x:.12,piv:[.8,-.36],kn:[.345,-.425],rings:[[.88,-.38,.1,.15,.16,'B'],[.75,-.33,.11,.16,.15,'H'],[.62,-.29,.095,.13,.12,'H'],[.52,-.325,.07,.08,.09,'H'],[.42,-.385,.052,.05,.062,'H'],
    [.345,-.425,.047,.045,.062,'J'],[.29,-.43,.036,.036,.045,'K'],[.17,-.425,.032,.03,.037,'K'],[.11,-.42,.04,.039,.045,'K','fet'],[.075,-.405,.031,.031,.031,'K','pas'],[.048,-.39,.039,.039,.037,'K','hoof'],[0,-.38,.047,.048,.043,'K','hoof']]}},
 boar:{sq:2.1,
  body:[[-.8,.64,.05,.05,.05],[-.76,.62,.14,.13,.16],[-.64,.6,.2,.2,.22],[-.44,.59,.215,.22,.21],[-.22,.6,.22,.245,.21],[0,.62,.225,.28,.22],[.18,.63,.225,.31,.235],[.34,.62,.205,.32,.24],[.48,.6,.17,.27,.22],[.58,.57,.12,.2,.17],[.64,.55,.06,.1,.09]],
  neck:{p0:[.66,.5],p1:[.74,.68],rings:[[-.6,.24,.2,.17,0],[-.2,.24,.2,.17,0],[.3,.2,.17,.15,0],[.8,.16,.14,.13,0],[1.1,.13,.12,.11,0]]},
  head:{ang:.5,rings:[[-.05,0,.12,.12,.13],[.04,0,.135,.12,.15],[.13,-.01,.12,.1,.135],[.21,-.03,.095,.078,.105],[.29,-.05,.076,.06,.078],[.355,-.064,.064,.054,.062],[.39,-.07,.068,.06,.066],[.405,-.07,.064,.058,.062]]},
  tail:{p:[.76,-.79],tr:-2.75,len:.3,rings:[[-.03,.03],[.06,.028],[.16,.022],[.24,.03],[.3,.012]]},
  F:{x:.13,piv:[.55,.33],kn:[.2,.35],rings:[[.62,.33,.09,.13,.13,'B'],[.5,.33,.09,.11,.11,'H'],[.39,.32,.07,.08,.085,'H'],[.28,.34,.055,.058,.058,'H'],[.2,.35,.055,.058,.052,'J'],[.15,.355,.043,.042,.046,'K'],
    [.09,.36,.04,.04,.044,'K','fet'],[.05,.37,.04,.042,.038,'K','hoof'],[0,.38,.045,.048,.04,'K','hoof']]},
  H:{x:.13,piv:[.58,-.52],kn:[.22,-.6],rings:[[.68,-.54,.1,.15,.15,'B'],[.56,-.5,.11,.15,.14,'H'],[.43,-.47,.09,.12,.11,'H'],[.33,-.53,.065,.07,.075,'H'],[.22,-.6,.055,.055,.065,'J'],[.16,-.6,.043,.042,.046,'K'],
    [.09,-.595,.04,.04,.044,'K','fet'],[.05,-.585,.04,.042,.038,'K','hoof'],[0,-.575,.045,.048,.04,'K','hoof']]}},
 carn:{sq:2.15,
  body:[[-.56,.86,.05,.04,.05],[-.52,.84,.12,.1,.12],[-.44,.82,.165,.14,.18],[-.32,.82,.17,.135,.17],[-.18,.83,.155,.12,.17],[-.04,.82,.16,.13,.22],[.1,.8,.18,.16,.28],[.24,.8,.19,.19,.29],[.36,.79,.17,.18,.26],[.46,.76,.13,.14,.2],[.53,.73,.07,.07,.09]],
  neck:{p0:[.86,.38],p1:[1.04,.66],rings:[[-.4,.17,.19,.16,0],[0,.16,.17,.14,0],[.4,.13,.13,.12,0],[.8,.11,.11,.105,0],[1.05,.1,.1,.1,0]]},
  head:{ang:.25,rings:[[-.06,0,.075,.07,.07],[.01,0,.11,.09,.09],[.08,-.005,.106,.08,.085],[.14,-.015,.075,.062,.068],[.2,-.03,.054,.048,.054],[.27,-.04,.047,.042,.044],[.32,-.045,.04,.035,.035],[.345,-.045,.026,.022,.022]]},
  tail:{p:[.88,-.55],tr:-2.65,len:.58,rings:[[-.05,.05],[.06,.07],[.2,.085],[.34,.09],[.46,.075],[.55,.045],[.6,.012]]},
  F:{x:.105,piv:[.78,.25],kn:[.14,.265],rings:[[.86,.25,.07,.1,.1,'B'],[.7,.25,.078,.09,.09,'H'],[.56,.22,.062,.066,.076,'H'],[.42,.245,.046,.05,.046,'H'],[.25,.26,.036,.038,.036,'H'],[.15,.265,.037,.041,.036,'J'],
    [.1,.27,.033,.035,.031,'K'],[.05,.29,.044,.05,.04,'K','paw'],[.012,.3,.05,.06,.045,'K','paw']]},
  H:{x:.105,piv:[.82,-.4],kn:[.3,-.49],rings:[[.9,-.42,.09,.13,.13,'B'],[.76,-.37,.1,.14,.13,'H'],[.62,-.32,.082,.1,.1,'H'],[.5,-.37,.057,.062,.07,'H'],[.38,-.45,.042,.042,.052,'H'],[.3,-.49,.039,.039,.052,'J'],
    [.2,-.485,.031,.031,.035,'K'],[.1,-.475,.031,.031,.031,'K'],[.05,-.46,.044,.05,.04,'K','paw'],[.012,-.445,.05,.06,.045,'K','paw']]}},
 raptor:{sq:2.1,biped:1,
  body:[[-.34,1.07,.05,.05,.05],[-.3,1.07,.1,.09,.1],[-.2,1.07,.15,.13,.15],[-.05,1.065,.17,.15,.2],[.1,1.045,.17,.15,.24],[.25,1.03,.155,.14,.24],[.38,1.03,.12,.12,.19],[.47,1.05,.08,.08,.1],[.5,1.06,.04,.04,.05]],
  neck:{p0:[1.1,.4],p1:[1.5,.66],rings:[[-.25,.11,.13,.11,0],[0,.09,.11,.09,-.02],[.35,.065,.075,.065,-.03],[.7,.055,.06,.055,-.015],[1.05,.06,.065,.06,0]]},
  head:{ang:.2,rings:[[-.05,0,.06,.06,.07],[.02,0,.08,.075,.09],[.1,-.01,.075,.065,.08],[.19,-.025,.055,.05,.058],[.28,-.04,.045,.04,.045],[.35,-.05,.035,.03,.035],[.39,-.055,.02,.018,.02]]},
  tail:{p:[1.07,-.32],tr:-1.68,len:1.0,rings:[[-.04,.12],[.1,.115],[.3,.085],[.55,.058],[.8,.038],[.95,.022],[1.0,.008]]},
  L:{x:.13,piv:[1.0,0],kn:[.31,-.065],rings:[[1.08,0,.1,.13,.14,'B'],[.95,.03,.11,.13,.13,'H'],[.78,.08,.085,.1,.1,'H'],[.64,.12,.06,.065,.06,'H'],[.5,.06,.05,.05,.055,'H'],[.38,-.03,.04,.038,.045,'H'],
    [.31,-.065,.042,.042,.048,'J'],[.24,-.05,.031,.031,.033,'K'],[.12,-.01,.027,.027,.029,'K'],[.05,.02,.036,.046,.031,'K','foot'],[.012,.05,.03,.04,.02,'K','foot']]}},
 drake:{sq:2.15,
  body:[[-.74,.74,.06,.06,.06],[-.66,.74,.13,.12,.13],[-.52,.745,.19,.17,.19],[-.34,.745,.215,.19,.22],[-.14,.745,.23,.2,.24],[.05,.755,.235,.21,.25],[.2,.77,.225,.215,.25],[.35,.79,.2,.2,.22],[.47,.8,.15,.15,.16],[.55,.81,.09,.09,.1]],
  neck:{p0:[.88,.48],p1:[1.36,.92],rings:[[-.25,.16,.18,.16,0],[0,.14,.16,.14,0],[.35,.11,.12,.105,0],[.7,.085,.095,.085,0],[1.03,.08,.085,.08,0]]},
  head:{ang:.32,rings:[[-.07,0,.08,.08,.08],[.02,0,.115,.1,.1],[.12,-.01,.1,.085,.09],[.22,-.02,.078,.068,.072],[.32,-.035,.062,.055,.06],[.42,-.045,.052,.045,.05],[.48,-.05,.04,.035,.04],[.51,-.05,.022,.02,.022]]},
  tail:{p:[.75,-.74],tr:-1.92,len:1.3,rings:[[-.05,.12],[.1,.11],[.3,.09],[.55,.065],[.8,.045],[1.05,.028],[1.25,.012],[1.32,.004]]},
  F:{x:.17,piv:[.72,.36],kn:[.15,.4],rings:[[.82,.36,.1,.13,.13,'B'],[.68,.34,.1,.12,.12,'H'],[.55,.31,.08,.085,.09,'H'],[.44,.33,.065,.065,.07,'H'],[.3,.37,.055,.055,.055,'H'],[.17,.4,.055,.056,.052,'J'],
    [.11,.41,.045,.045,.042,'K'],[.05,.43,.055,.06,.045,'K','paw'],[.012,.45,.06,.07,.05,'K','paw']]},
  H:{x:.17,piv:[.74,-.44],kn:[.22,-.54],rings:[[.84,-.46,.12,.17,.17,'B'],[.7,-.4,.125,.17,.16,'H'],[.56,-.33,.1,.13,.12,'H'],[.45,-.37,.075,.08,.085,'H'],[.32,-.47,.06,.06,.07,'H'],[.22,-.54,.055,.056,.07,'J'],
    [.14,-.53,.045,.045,.05,'K'],[.07,-.51,.042,.044,.042,'K'],[.035,-.49,.055,.065,.045,'K','paw'],[.01,-.47,.06,.07,.05,'K','paw']]}}
};
// per mount: template, height Hw (model units, hero ≈ 1.46 tall), width / length / leg / body-depth / limb factors, colours and features
var MDL100_S={
 pony:{t:'horse',Hw:1.0,wf:1.16,lk:.98,legk:.84,bodyk:1.12,lt:1.2,hs:1.14,ns:1.16,c:0x6e4a2c,c2:0x3e2a1a,bel:0x9a7a58,m:0x1c140e,hoof:0x26201a,eye:0x0e0a08,muz:0x3a2c22,
   ear:'horse',mane:'shag',tail:'hair',feath:1,sock:0x8a7a62,tack:'riding',bags:1},
 boar:{t:'boar',Hw:.98,wf:1.0,lk:1,legk:1,bodyk:1,lt:1.3,hs:1,ns:1,c:0x4a3a2e,c2:0x2a2018,bel:0x5e4c3c,m:0x16110c,hoof:0x14100c,eye:0xff6a2a,muz:0x6a4a44,
   ear:'boar',mane:'bristle',tail:'tuft',tack:'boar'},
 stag:{t:'horse',Hw:1.16,wf:.84,lk:.96,legk:1.12,bodyk:.9,lt:.72,hs:.96,ns:.86,c:0xb3a690,c2:0x6e6656,bel:0xe8e0d0,m:0x8a8270,hoof:0x2a2620,eye:0x9ad8ff,muz:0x2a2622,
   ear:'deer',mane:'ruff',tail:'flash',head:'deer',neck:{p0:[.86,.36],p1:[1.32,.66]},hang:.62,tack:'riding',antler:1},
 ram:{t:'horse',Hw:.96,wf:1.26,lk:.94,legk:.82,bodyk:1.12,lt:1.08,hs:.92,ns:1.25,c:0xcfc3a6,c2:0x2e2824,bel:0xbcb096,m:0xcfc3a6,hoof:0x161210,eye:0xe8c060,muz:0x3a322c,face:0x3a322c,
   ear:'droop',mane:'',tail:'stub',head:'sheep',neck:{p0:[.84,.36],p1:[1.04,.6]},hang:.95,wool:1,tack:'riding',horns:1},
 charger:{t:'horse',Hw:1.3,wf:1.1,lk:1.02,legk:1,bodyk:1.05,lt:1.06,hs:1,ns:1.08,c:0x2a1c16,c2:0x170f0b,bel:0x3a2a20,m:0xff6a1a,hoof:0x111111,eye:0xffa040,muz:0x140e0a,
   ear:'horse',mane:'fire',tail:'fire',feath:1,sock:0x1a1210,emberHoof:1,tack:'war',fire:1},
 raptor:{t:'raptor',Hw:1.0,wf:1,lk:1,legk:1,bodyk:1,lt:1,hs:1,ns:1,c:0xc49658,c2:0x7a5228,bel:0xe8d2a6,m:0xc8402e,hoof:0x2a2018,eye:0xffd040,muz:0x5a3a1e,
   ear:'',mane:'quill',tail:'raptor',stripes:1,tack:'raptor'},
 panther:{t:'carn',Hw:.98,wf:1.0,lk:1.12,legk:.86,bodyk:.98,lt:1.3,hs:.92,ns:.95,c:0x1e1c24,c2:0x131117,bel:0x2a2630,m:0x1e1c24,hoof:0x0e0c12,eye:0x8aff6a,muz:0x16141a,
   ear:'cat',head:'cat',neck:{p0:[.84,.4],p1:[.96,.66]},tail:'cat',tuck:.5,rosette:1,tack:'harness'},
 destrier:{t:'horse',Hw:1.28,wf:1.0,lk:1,legk:1,bodyk:1,lt:1,hs:1,ns:1,c:0xd8d0b8,c2:0xa89e84,bel:0xd8d0b8,m:0x6affc8,hoof:0x3a3a3a,eye:0x6affc8,muz:0xd8d0b8,
   ear:'',mane:'ghost',tail:'ghost',skel:1,tack:'dread'},
 direwolf:{t:'carn',Hw:1.16,wf:1.08,lk:1.04,legk:.96,bodyk:1.12,lt:1.18,hs:1.15,ns:1.1,c:0x423d3c,c2:0x242120,bel:0x7a7270,m:0x2a2626,hoof:0x141212,eye:0xff2a1a,muz:0x121010,
   ear:'wolf',head:'wolf',tail:'bushy',ruff:1,tuck:1,tack:'harness',spiked:1},
 drake:{t:'drake',Hw:1.12,wf:1,lk:1,legk:1,bodyk:1,lt:1,hs:1,ns:1,c:0x4e1e2a,c2:0x2a0e16,bel:0xb8683a,m:0x5a2030,hoof:0x18080e,eye:0xffb03a,muz:0x3a1420,
   ear:'',head:'drake',tail:'drake',wings:1,spikes:1,tack:'drake'}
};

// skinned rigid parts → ≤3 meshes (c cloth/skin, m metal, g glow), cached per key; a little colour variation per part
MDL100.K={};
function MDL100_bake(P,O,key){let gs=MDL100.K[key];
  if(!gs){gs={};const by={},v=new THREE.Vector3(),c=new THREE.Color(),nm=new THREE.Matrix3(),R=dkRng(key.length*97+3);P.forEach(p=>(by[p.t]=by[p.t]||[]).push(p));
    for(const t in by){const pos=[],nor=[],col=[],si=[],sw=[],idx=[];let off=0;
      by[t].forEach(p=>{const g=p.geo,pa=g.attributes.position,na=g.attributes.normal,n=pa.count,bi=Math.max(0,O.indexOf(p.bn));nm.getNormalMatrix(p.m);c.set(p.col);if(t!='g')c.multiplyScalar(.9+R()*.14);
        for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);if(na){v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z)}else nor.push(0,1,0);col.push(c.r,c.g,c.b);si.push(bi,0,0,0);sw.push(1,0,0,0)}
        if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)idx.push(ix[i]+off)}else for(let i=0;i<n;i++)idx.push(i+off);off+=n});
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));G.setIndex(idx);G.computeBoundingSphere();G.userData.lps=1;gs[t]=G}
    MDL100.K[key]=gs}
  const M=dkM();return Object.keys(gs).map(t=>{const m=new THREE.SkinnedMesh(gs[t],M[t]);m.castShadow=t!='g';m.receiveShadow=t!='g';m.frustumCulled=false;m.userData.lps=1;return m})}
// lighter / darker shade (dkShade(c,>1) overflows a channel)
function MDL100_lt(c,f){return f>1?lgCol(c,0xffffff,Math.min(1,f-1)):dkShade(c,f)}
// ---------------------------------------------------------------- the rig
function MDL100_build(k){
  const S=MDL100_S[k],T=MDL100_T[S.t],V=THREE.Vector3,C=c=>new THREE.Color(c),Hw=S.Hw,biped=!!T.biped,skel=!!S.skel;
  const r=new THREE.Group();r.userData.mdl=1;
  const Y=y=>(y<.5?y*S.legk:.5*S.legk+(y-.5)*S.bodyk)*Hw,Z=z=>z*S.lk*Hw,X=x=>x*S.wf*Hw;
  const b=new THREE.Bone();b.name='mb';r.add(b);r.b=b;const bones=[b],names=['b'],legs=[],flame=[];let wings=null;
  const bone=(nm,par,x,y,z,rx,ry,ord)=>{const o=new THREE.Bone();o.name='m'+nm;o.position.set(x,y,z);if(ord)o.rotation.order=ord;if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;par.add(o);bones.push(o);names.push(nm);return o};
  // neck + head: carriage from the template (or the mount's own), head angle below horizontal
  const NK=Object.assign({},T.neck,S.neck||{}),n0=new V(0,Y(NK.p0[0]),Z(NK.p0[1])),n1=new V(0,Y(NK.p1[0]),Z(NK.p1[1])),nd=n1.clone().sub(n0),nl=nd.length(),na=Math.atan2(nd.z,nd.y);
  const hang=S.hang!=null?S.hang:T.head.ang;
  const neck=bone('neck',b,n0.x,n0.y,n0.z,na),head=bone('head',neck,0,nl,0,hang-na);
  const tail=bone('tail',b,0,Y(T.tail.p[0]),Z(T.tail.p[1]),T.tail.tr);
  // legs: the hip pivots at the shoulder / hip joint, the knee bone sits at the folding joint (carpus, hock, wrist, ankle)
  const LG=biped?[['L',-1],['L',1]]:[['F',-1],['F',1],['H',-1],['H',1]];
  LG.forEach(([key,s],i)=>{const D=T[key],hp=new V(s*X(D.x),Y(D.piv[0]),Z(D.piv[1])),kp=new V(s*X(D.x),Y(D.kn[0]),Z(D.kn[1]));
    const hip=bone('h'+i,r,hp.x,hp.y,hp.z),kn=bone('k'+i,hip,0,kp.y-hp.y,kp.z-hp.z,0,biped?0:Math.PI,'YXZ');
    legs.push({hip,kn,ph:[0,Math.PI,Math.PI,0][i]||0,front:biped?i==0:key=='F',D,s,key})});
  r.updateMatrixWorld(true);
  const W=(o,p)=>o.localToWorld(new V(p[0],p[1],p[2])),D=(o,p)=>new V(p[0],p[1],p[2]).transformDirection(o.matrixWorld);
  const cM=C(S.c),c2=C(S.c2),bel=C(S.bel),mn=C(S.m),hf=C(S.hoof),back=cM.clone().lerp(c2,.5),muz=C(S.muz),face=S.face!=null?C(S.face):null,wool=C(0xe2d8c0);
  // body profile (template rings → model) for the tack: centre y, half width, top, bottom at any z
  const BR=T.body.map(q=>({z:Z(q[0]),y:Y(q[1]),w:q[2]*S.wf*Hw,t:q[3]*S.bodyk*Hw,b:q[4]*S.bodyk*Hw}));
  const bodyAt=z=>{let i=0;while(i<BR.length-2&&BR[i+1].z<z)i++;const A=BR[i],B=BR[i+1],u=Math.max(0,Math.min(1,(z-A.z)/(B.z-A.z)));return {z,y:A.y+(B.y-A.y)*u,w:A.w+(B.w-A.w)*u,t:A.t+(B.t-A.t)*u,b:A.b+(B.b-A.b)*u}};
  const sq=T.sq||2.2,se=2/sq;
  // point on the body surface at z, section angle a (PI/2 = spine, -PI/2 = belly), pushed out by off
  const bodyPt=(z,a,off)=>{const q=bodyAt(z),c0=Math.cos(a),s0=Math.sin(a),c=Math.sign(c0)*Math.pow(Math.abs(c0),se),s=Math.sign(s0)*Math.pow(Math.abs(s0),se),ry=s>0?q.t:q.b;
    const x=c*q.w,y=s*ry,l=Math.hypot(c0*q.w,s0*ry)||1;return new V(x+(off||0)*c0*q.w/l*1,q.y+y+(off||0)*s0*ry/l,z)};
  // ---- skinned body ----
  const tri=S.stripes,woolJ=S.wool?.16:.06;
  const lofts=[];
  if(!skel){
    lofts.push({seg:12,ref:new V(0,1,0),sq,capA:1,capB:1,rings:BR.map(q=>({p:[0,q.y,q.z],rx:q.w,ryT:q.t,ryB:q.b,b:['b','b',0],j:S.wool&&Math.abs(q.z-Z(.04))<.36*Hw?.04:woolJ,z:q.z})),
      paint:(o,rg,s,c)=>{o.copy(cM);if(s>.6)o.lerp(back,Math.min(1,(s-.6)*2.2));if(s<-.4)o.lerp(bel,Math.min(1,(-s-.4)*2));
        if(tri&&s>-.3&&Math.sin(rg.z*22/Hw)>.4)o.lerp(c2,.55);if(S.wool)o.lerp(wool,.15*(s+1.2));if(S.rosette&&Math.sin(rg.z*31)*Math.cos(c*7)>.55)o.lerp(c2,.5)}});
    // neck: from inside the chest to the jowl, crest on the dorsal side
    {const ref=D(neck,[0,0,-1]),ns=Hw*S.ns,R=NK.rings||T.neck.rings;
      lofts.push({seg:10,ref,sq:2.1,rings:R.map((q,i)=>({p:W(neck,[0,q[0]*nl,(q[4]||0)*Hw]).toArray(),rx:q[3]*ns,ryT:q[1]*ns,ryB:q[2]*ns,j:S.wool?.25:(S.ruff&&i>0?.12:.04),
        b:q[0]<=0?['b','neck',Math.max(0,Math.min(1,.55+q[0]))]:q[0]>.9?['neck','head',.5]:['neck','neck',0],i})),
        paint:(o,rg,s)=>{o.copy(cM);if(s<-.45)o.lerp(bel,.45);if(s>.55)o.lerp(back,.6);if(S.wool)o.lerp(wool,.2);if(S.ruff&&rg.i>0)o.lerp(C(0x6a6260),.25*(1-Math.abs(s)))}})}
    // head
    {const ref=D(head,[0,1,0]),hs=Hw*S.hs,HR=MDL100_HEAD[S.head||'']||T.head.rings,n=HR.length;
      lofts.push({seg:10,ref,sq:2.3,capA:1,capB:1,rings:HR.map((q,i)=>({p:W(head,[0,q[1]*hs,q[0]*hs]).toArray(),rx:q[2]*hs,ryT:q[3]*hs,ryB:q[4]*hs,b:['head','head',0],i,n})),
        paint:(o,rg,s,c)=>{o.copy(face&&rg.i>1?face:cM);if(s>.5&&!face)o.lerp(back,.4);if(s<-.5&&!face)o.lerp(bel,.3);if(rg.i>=rg.n-3)o.lerp(muz,rg.i>=rg.n-2?.85:.45);
          if(S.t=='carn'&&rg.i>=3&&s<-.35)o.lerp(C(0x0c0a0a),.6)}})}
    // tail
    {const TT=MDL100_TAIL[S.tail]||null,ref=D(tail,[0,0,1]),tl=T.tail.len*Hw*(TT&&TT.l||1),TR=(TT&&TT.r)||T.tail.rings,n=TR.length;
      if(S.tail!='fire'&&S.tail!='ghost')lofts.push({seg:S.tail=='hair'||S.tail=='bushy'?8:7,ref,capB:1,rings:TR.map((q,i)=>{const u=q[0]/((TR[n-1][0])||1);return {p:W(tail,[0,u*tl,(TT&&TT.cz||0)*tl*u*u]).toArray(),rx:q[1]*Hw*(TT&&TT.w||1),ryT:q[1]*Hw*(TT&&TT.w||1),ryB:q[1]*Hw*(TT&&TT.w||1),
        j:S.tail=='hair'||S.tail=='bushy'?.32:0,b:i==0?['b','tail',.55]:['tail','tail',0],i,n}}),
        paint:(o,rg,s)=>{o.copy(S.tail=='hair'?mn:cM);if(S.tail=='flash'&&s<.2)o.copy(C(0xf0ece4));if(S.tail=='bushy'&&rg.i>=rg.n-3)o.lerp(c2,.7);if(S.tail=='cat'&&rg.i>=rg.n-2)o.lerp(C(0x08070a),.5);
          if(S.stripes&&rg.i%2)o.lerp(c2,.5);if(S.tail=='drake'&&s>.4)o.lerp(c2,.5);if(S.tail=='drake'&&s<-.4)o.lerp(bel,.5)}})}
  }
  // legs: hip → knee → hoof / paw, one loft per leg (skeleton: thin bones with joint knobs)
  legs.forEach((q,i)=>{const D2=q.D,h='h'+i,kn='k'+i,lt=Hw*S.lt*(skel?.42:1),s=q.s;
    const bsel=t=>t=='B'?['b',h,.6]:t=='H'?[h,h,0]:t=='J'?[h,kn,.5]:[kn,kn,0];
    const rings=D2.rings.filter(w=>!(skel&&w[5]=='B')).map((w,j)=>{const jt=skel&&(w[5]=='J'||w[6]=='fet');return {p:[s*X(D2.x),Y(w[0]),Z(w[1])],rx:w[2]*lt*(jt?1.9:1),ryT:w[3]*lt*(jt?1.9:1),ryB:w[4]*lt*(jt?1.9:1),
      b:bsel(w[5]),tag:w[6],ix:j,j:S.wool&&j<3?.25:0,y:w[0]}});
    if(skel){rings[rings.length-1].rx*=2.2;rings[rings.length-1].ryT*=2.2;rings[rings.length-1].ryB*=2.2;rings[rings.length-2].rx*=2.2;rings[rings.length-2].ryT*=2.2;rings[rings.length-2].ryB*=2.2}
    lofts.push({seg:skel?6:9,ref:new V(0,0,1),capB:1,capA:skel?1:0,rings,
      paint:(o,rg,sn)=>{const tg=rg.tag;if(tg=='hoof'){o.copy(hf);if(S.emberHoof)o.lerp(C(0x5a1a08),.35);return}if(tg=='foot'||tg=='paw'){o.copy(cM).lerp(c2,.5);if(sn<-.3)o.lerp(C(0x0c0a0a),.4);return}
        o.copy(cM);if(rg.y<.36)o.lerp(c2,S.t=='horse'?.25:.45);if(S.sock&&rg.y<.2)o.copy(C(S.sock));if(S.feath&&(tg=='fet'||tg=='pas'))o.copy(C(S.sock||0xc8b8a0)).lerp(C(0xd8ccb4),.3);
        if(S.wool&&rg.y>.5)o.lerp(wool,.35);if(S.wool&&rg.y<=.5)o.copy(c2);if(skel)o.copy(cM).lerp(c2,rg.ix%2?.3:0);if(sn>.4&&!skel)o.lerp(back,.15);if(S.stripes&&rg.y>.6&&rg.ix%2)o.lerp(c2,.4)}})});
  if(skel){
    // spine and neck vertebrae as one thin skinned chain, skull loft
    lofts.push({seg:6,ref:new V(0,1,0),capA:1,capB:1,rings:BR.filter((q,i)=>i>0&&i<BR.length-1).map(q=>({p:[0,q.y+q.t*.86,q.z],rx:.035*Hw,ryT:.04*Hw,ryB:.035*Hw,b:['b','b',0]})),paint:o=>o.copy(cM)});
    {const ref=D(neck,[0,0,-1]);lofts.push({seg:6,ref,capA:1,rings:[-.2,.1,.4,.7,1.02].map((t,i)=>({p:W(neck,[0,t*nl,-.02*Hw]).toArray(),rx:.04*Hw,ryT:.045*Hw,ryB:.04*Hw,b:t<=0?['b','neck',.5]:t>.9?['neck','head',.5]:['neck','neck',0]})),paint:o=>o.copy(cM)})}
    {const ref=D(head,[0,1,0]),hs=Hw,HR=MDL100_HEAD.skull,n=HR.length;
      lofts.push({seg:8,ref,sq:2.4,capA:1,capB:1,rings:HR.map((q,i)=>({p:W(head,[0,q[1]*hs,q[0]*hs]).toArray(),rx:q[2]*hs,ryT:q[3]*hs,ryB:q[4]*hs,b:['head','head',0],i,n})),paint:(o,rg,s)=>{o.copy(cM);if(rg.i>=rg.n-2)o.lerp(c2,.4);if(s<-.5)o.lerp(c2,.3)}})}
    {const ref=D(tail,[0,0,1]);lofts.push({seg:5,ref,capB:1,rings:[-.04,.15,.3,.42].map((t,i)=>({p:W(tail,[0,t*Hw,0]).toArray(),rx:.03*Hw*(1-i*.18),b:i==0?['b','tail',.5]:['tail','tail',0]})),paint:o=>o.copy(cM)})}
  }
  const geo=MDL100_geo('M100|'+k,names,lofts,k.length*37+11);
  const mesh=new THREE.SkinnedMesh(geo,lpMat('',1));mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.lps=1;mesh.userData.mdlBody=1;r.add(mesh);
  r.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(bones));
  // ---- rigid details and tack: built in model space at rest, each part skinned to one bone, baked into ≤3 meshes ----
  const KIT=dkKit(),cached=!MDL100.only&&!!MDL100.K['K|'+k];if(MDL100.only)delete MDL100.K['K|'+k];
  // local: positions and rotations are given in the bone's own rest frame (head / neck / tail details), else in model space
  const att=(o,key,build,local)=>{if(cached||(MDL100.only&&!MDL100.only.includes(key)))return;const nm=names[bones.indexOf(o)]||'b',n0=KIT.P.length,px={p:(x,...a)=>{KIT.p(nm,...a);return px},L:(x,...a)=>{KIT.L(nm,...a);return px}};build(px);
    if(local===true){o.updateMatrixWorld(true);for(let i=n0;i<KIT.P.length;i++)KIT.P[i].m.premultiply(o.matrixWorld)}};
  const ctx={S,T,Hw,X,Y,Z,W,D,V,C,bodyAt,bodyPt,neck,head,tail,b,legs,nl,k,r,flame,biped,skel};
  MDL100_details(ctx,att);
  // flames: glowing cones in the kit (base at p, pointing along +y turned rx about x); they flicker through the mount's own glow material
  const fl=(o,key,p,s,rx,col)=>att(o,'f'+key,kk=>kk.p('','cone4','g',col||S.m,p.x,p.y+.5*s*Math.cos(rx||0),p.z+.5*s*Math.sin(rx||0),.3*s,s,.18*s,rx||0));
  ctx.fl=fl;MDL100_fx(ctx,att);
  if(S.wings)wings=MDL100_wings(ctx);
  // seat: the saddle's seat surface over the back (the tack is built around it)
  {const zs=Z(biped?.02:S.t=='boar'?-.06:S.t=='drake'?-.02:.04),q=bodyAt(zs);r.seat=[q.y+q.t+(skel?.11:.1),zs]}
  ctx.att=att;try{MDL100_tack(ctx)}catch(e){if(MDL100.err++<3)console.error('v100 tack',k,e)}
  let glow=null;MDL100_bake(KIT.P,names,'K|'+k).forEach(m=>{r.add(m);m.bind(mesh.skeleton,mesh.bindMatrix);if(m.material===dkM().g&&(S.fire||skel||S.mane=='fire'||S.wings)){m.material=m.material.clone();glow=m.material}});
  // ---- rig: flames, wings and a fallback walk (the v85 gait wrapper drives legs/body/neck/tail) ----
  r.rig=(now,mv,sp)=>{const t=now/1000,ph=t*(sp||3)*2.3;
    legs.forEach(q=>{const a=mv?Math.sin(ph+q.ph+(q.front?0:.5)):0;q.hip.rotation.x=a*(biped?.7:.55);q.kn.rotation.x=mv?Math.max(0,-Math.cos(ph+q.ph))*(q.front?-.9:.9)*(biped?-1:1):0});
    b.position.y=mv?Math.abs(Math.sin(ph))*(biped?.06:.04):Math.sin(t*1.6)*.008;b.rotation.x=mv?Math.sin(ph*2)*.02:0;
    neck.rotation.x=na+(mv?Math.sin(ph*2)*.06:Math.sin(t*1.1)*.04);tail.rotation.z=Math.sin(t*(mv?6:2.2))*(mv?.18:.12);
    if(glow){const f=.86+.1*Math.sin(t*9.3)+.06*Math.sin(t*23.7+1.3)+.04*Math.sin(t*41);glow.color.setScalar(f)}
    if(wings)MDL100_wingPose(wings,now,mv,sp)};
  r.wings=wings;r.flame=flame;
  r.userData.mdlc=ctx;
  return r}

// alternative head profiles [z, y, w, t, b] in Hw units
var MDL100_HEAD={
 deer:[[-.06,0,.05,.05,.055],[-.02,0,.068,.06,.085],[.06,-.01,.07,.056,.1],[.14,-.015,.062,.05,.075],[.22,-.025,.048,.042,.05],[.3,-.035,.04,.036,.04],[.36,-.042,.042,.034,.04],[.39,-.046,.03,.024,.028]],
 sheep:[[-.06,0,.07,.06,.07],[.0,.005,.088,.075,.1],[.08,.0,.085,.075,.1],[.16,-.01,.07,.07,.08],[.24,-.03,.058,.06,.06],[.3,-.05,.052,.048,.05],[.34,-.06,.04,.035,.038]],
 cat:[[-.05,0,.08,.075,.075],[.02,0,.115,.095,.095],[.08,-.005,.11,.085,.09],[.13,-.015,.08,.065,.07],[.18,-.03,.06,.05,.055],[.22,-.04,.05,.04,.045],[.245,-.045,.03,.025,.025]],
 wolf:null,
 drake:null,
 skull:[[-.06,0,.045,.05,.05],[-.02,0,.065,.06,.075],[.06,-.01,.068,.05,.09],[.14,-.01,.058,.045,.07],[.22,-.02,.045,.038,.05],[.3,-.032,.036,.032,.036],[.36,-.04,.036,.03,.036],[.4,-.045,.026,.02,.024]]};
// tail styles: length factor l, width factor w, rings [t, radius]
var MDL100_TAIL={
 hair:{l:1,w:1,cz:-.08,r:[[-.05,.04],[.04,.06],[.16,.075],[.3,.09],[.44,.095],[.56,.075],[.65,.025]]},
 flash:{l:.3,w:1,r:[[-.03,.05],[.06,.06],[.14,.05],[.2,.015]]},
 stub:{l:.28,w:1,r:[[-.03,.05],[.06,.055],[.14,.04],[.2,.012]]},
 tuft:null,raptor:null,drake:null,
 cat:{l:1.5,w:1,cz:.22,r:[[-.05,.06],[.08,.058],[.25,.05],[.45,.045],[.65,.042],[.8,.044],[.88,.03]]},
 bushy:{l:1.05,w:1,cz:.06,r:[[-.05,.05],[.06,.075],[.2,.095],[.34,.1],[.46,.085],[.56,.05],[.6,.012]]}};

// ---------------------------------------------------------------- rigid details per species
function MDL100_details(c,att){
  const {S,Hw,X,Y,Z,W,D,V,C,bodyAt,bodyPt,neck,head,tail,b,legs,nl,k,skel,r}=c,hs=Hw*S.hs;
  // head-space helper: point at [x,y,z] (Hw units × hs) in the head's frame, as model space array
  const HP=(x,y,z)=>[x*hs,y*hs,z*hs],NP=(x,t,z)=>[x*Hw,t*nl,z*Hw],dark=0x0c0808;
  const HR=MDL100_HEAD[S.head||'']||(skel?MDL100_HEAD.skull:MDL100_T[S.t].head.rings),hAt=z=>{let i=0;while(i<HR.length-2&&HR[i+1][0]<z)i++;const A=HR[i],B=HR[i+1],u=Math.max(0,Math.min(1,(z-A[0])/(B[0]-A[0])));return A.map((v,j)=>v+(B[j]-v)*u)};
  att(head,'head',kk=>{
    const q=hAt(.12),eyeZ=S.t=='carn'?.13:S.t=='boar'?.12:S.t=='raptor'?.08:S.t=='drake'?.13:.12,qe=hAt(eyeZ),glow=S.eye!=0x0e0a08;
    [-1,1].forEach(s=>{
      // eyes: socket, eyeball, lid ridge
      const ex=s*qe[2]*.86,ey=qe[1]+qe[3]*.3;
      kk.p('','sph','c',dark,...HP(ex,ey,eyeZ),.016*hs,.015*hs,.022*hs);kk.p('','sph',glow?'g':'c',S.eye,...HP(ex*1.06,ey,eyeZ+.003),.011*hs,.011*hs,.015*hs);
      kk.p('','box','c',dkShade(S.c,.6),...HP(ex*.98,ey+.02,eyeZ),.01*hs,.008*hs,.03*hs,0,s*.25,0);
      // nostrils
      if(!skel){const qn=HR[HR.length-2];kk.p('','sph','c',dark,...HP(s*qn[2]*.55,qn[1]+qn[3]*.25,qn[0]+.01),.012*hs,.01*hs,.012*hs)}
      // ears
      const er=S.ear,ez=S.t=='carn'?.0:-.03,qa=hAt(ez),ec=dkShade(S.c,.85),ei=0xc4b098,ex2=s*qa[2]*.55,ey2=qa[1]+qa[3]*.8;
      if(er=='horse'){kk.p('','cone4','c',ec,...HP(ex2,ey2+.03,ez-.02),.026*hs,.085*hs,.018*hs,-.35,0,-s*.22)}
      else if(er=='deer'){kk.p('','cone4','c',ec,...HP(s*qa[2]*1.0,ey2-.005,ez),.045*hs,.15*hs,.016*hs,-.2,0,-s*1.05);kk.p('','cone4','c',ei,...HP(s*qa[2]*1.03,ey2-.002,ez+.006),.03*hs,.11*hs,.008*hs,-.2,0,-s*1.05)}
      else if(er=='wolf'){kk.p('','cone4','c',dkShade(S.c,.7),...HP(s*qa[2]*.62,ey2+.04,ez-.01),.045*hs,.12*hs,.022*hs,-.3,0,-s*.3);kk.p('','cone4','c',0x8a7a72,...HP(s*qa[2]*.62,ey2+.035,ez+.004),.028*hs,.08*hs,.008*hs,-.3,0,-s*.3)}
      else if(er=='cat'){kk.p('','cone4','c',S.c,...HP(s*qa[2]*.68,ey2+.02,ez),.04*hs,.065*hs,.018*hs,-.2,0,-s*.45);kk.p('','cone4','c',0x2a1a22,...HP(s*qa[2]*.68,ey2+.017,ez+.006),.024*hs,.045*hs,.006*hs,-.2,0,-s*.45)}
      else if(er=='boar'){kk.p('','cone4','c',dkShade(S.c,.8),...HP(s*qa[2]*.72,ey2+.01,ez),.05*hs,.11*hs,.02*hs,.4,0,-s*.75);kk.p('','cone4','c',0x3a2a24,...HP(s*qa[2]*.73,ey2+.005,ez+.006),.03*hs,.08*hs,.006*hs,.4,0,-s*.75)}
      else if(er=='droop'){kk.p('','cone4','c',S.face||S.c,...HP(s*qa[2]*1.05,qa[1]+qa[3]*.1,ez+.03),.035*hs,.11*hs,.016*hs,.2,0,-s*1.85)}
      if(S.t=='carn'){// fangs, whisker pads
        const qm=hAt(.28);kk.p('','cone4','c',0xe8e0d0,...HP(s*qm[2]*.45,qm[1]-qm[4]*.75,.27),.008*hs,.04*hs,.008*hs,Math.PI);kk.p('','cone4','c',0xe8e0d0,...HP(s*qm[2]*.4,qm[1]-qm[4]*.6,.24),.006*hs,.025*hs,.006*hs,Math.PI)}
    });
    // mouth line, lower lip (gives the jaw)
    if(!skel&&S.t!='raptor'&&S.t!='drake'){const qm=hAt(.28);kk.L('','c',dark,HP(-qm[2]*.85,qm[1]-qm[4]*.45,.18),HP(0,qm[1]-qm[4]*.55,HR[HR.length-1][0]),.006*hs,.006*hs,4);kk.L('','c',dark,HP(qm[2]*.85,qm[1]-qm[4]*.45,.18),HP(0,qm[1]-qm[4]*.55,HR[HR.length-1][0]),.006*hs,.006*hs,4)}
    // (v100: no separate face plank / forelock spikes: the head loft carries the face shape)
    if(S.t=='boar'){[-1,1].forEach(s=>{const qt=hAt(.33);kk.L('','c',0xeae2cc,HP(s*qt[2]*.85,qt[1]-qt[4]*.3,.33),HP(s*qt[2]*1.45,qt[1]+qt[3]*.9,.29),.018*hs,.006*hs,5);
        kk.L('','c',0xeae2cc,HP(s*qt[2]*1.45,qt[1]+qt[3]*.9,.29),HP(s*qt[2]*1.25,qt[1]+qt[3]*1.6,.22),.006*hs,.002*hs,4)});
      kk.p('','cyl','c',0x7a4e4a,...HP(0,-.07,.405),.064*hs,.012*hs,.058*hs,Math.PI/2);[-1,1].forEach(s=>kk.p('','sph','c',dark,...HP(s*.022,-.066,.412),.01*hs,.012*hs,.006*hs))}
    if(S.antler){const ant=0xd0c4aa,ant2=0x9a8c74,L=(a,b2,r1,r2)=>kk.L('','c',ant,HP(...a),HP(...b2),r1*hs,r2*hs,5);
      [-1,1].forEach(s=>{const p0=[s*.035,.06,-.02],p1=[s*.13,.08,-.12],p2=[s*.24,.11,-.26],p3=[s*.33,.15,-.39],p4=[s*.39,.22,-.5],up=(p,a,b)=>[p[0]+s*a,p[1]+b*.81,p[2]-b*.58+a*0];
        kk.p('','cyl','c',ant2,...HP(s*.035,.055,-.02),.024*hs,.022*hs,.024*hs);L(p0,p1,.019,.016);L(p1,p2,.016,.013);L(p2,p3,.013,.01);L(p3,p4,.01,.004);
        L([s*.07,.07,-.05],[s*.09,.2,.02],.011,.003);L(p1,up(p1,.03,.13),.01,.003);L(p2,up(p2,.02,.14),.009,.003);L(p3,up(p3,.0,.13),.008,.003);L(p3,up(p3,.08,.06),.007,.002);L(p4,up(p4,.05,.1),.005,.002)})}
    if(S.horns){[-1,1].forEach(s=>{const N=18,pt=i=>{const u=i/N,th=1.05-u*Math.PI*1.75,rr=.085-u*.035;return [s*(.065+u*.075),.03+Math.cos(th)*rr,-.07+Math.sin(th)*rr]};
        for(let i=0;i<N;i++){const A=pt(i),B=pt(i+1.25),w=(.048-i*.0021)*hs;kk.L('','c',i%2?0x6a6058:0x5a5048,HP(...A),HP(...B),w,w*.96,6)}})}
    if(S.t=='raptor'){for(let i=0;i<6;i++)kk.p('','cone4','c',i%2?S.m:MDL100_lt(S.m,1.2),...HP(0,.07,.0-i*.035),.014*hs,(.09+(i<3?.04:0))*hs,.012*hs,-1.1-i*.08);
      [-1,1].forEach(s=>{for(let i=0;i<7;i++)kk.p('','cone4','c',0xece4d2,...HP(s*.032,-.035,.1+i*.035),.005*hs,.022*hs,.005*hs,Math.PI)});
      kk.L('','c',dark,HP(-.05,-.03,.05),HP(0,-.04,.38),.006*hs,.004*hs,4);kk.L('','c',dark,HP(.05,-.03,.05),HP(0,-.04,.38),.006*hs,.004*hs,4)}
    if(S.t=='drake'){[-1,1].forEach(s=>{kk.L('','c',0x1a0a10,HP(s*.06,.07,-.0),HP(s*.11,.14,-.2),.02*hs,.004*hs,5);kk.L('','c',0x24101a,HP(s*.09,.04,-.02),HP(s*.17,.06,-.16),.014*hs,.003*hs,4);
        for(let i=0;i<3;i++)kk.p('','cone4','c',0x2a1018,...HP(s*(.1-i*.01),-.02-i*.012,.04+i*.06),.012*hs,.04*hs,.008*hs,0,0,-s*1.3);
        for(let i=0;i<6;i++)kk.p('','cone4','c',0xe8e0d0,...HP(s*.035,-.05,.18+i*.045),.006*hs,.026*hs,.006*hs,Math.PI)});
      kk.p('','cone4','c',0x1a0a10,...HP(0,.03,.48),.012*hs,.05*hs,.012*hs,.5);kk.L('','c',dark,HP(-.07,-.035,.08),HP(0,-.05,.5),.006*hs,.004*hs,4);kk.L('','c',dark,HP(.07,-.035,.08),HP(0,-.05,.5),.006*hs,.004*hs,4)}
    if(skel){[-1,1].forEach(s=>{kk.p('','sph','c',0x050404,...HP(s*.04,.025,.12),.02*hs,.02*hs,.026*hs)});for(let i=0;i<6;i++)kk.p('','box','c',0xe8e0c8,...HP((i-2.5)*.012,-.045,.38),.009*hs,.02*hs,.01*hs);
      kk.p('','box','c',0x050404,...HP(0,.0,.33),.03*hs,.02*hs,.03*hs);kk.L('','c',S.c2,HP(-.05,-.05,.04),HP(0,-.065,.38),.012*hs,.01*hs,4);kk.L('','c',S.c2,HP(.05,-.05,.04),HP(0,-.065,.38),.012*hs,.01*hs,4)}
  },true);
  // neck: manes, ruffs, bristles, crest spikes, vertebrae
  att(neck,'neck',kk=>{
    const m=S.mane;
    if(m=='shag'||m=='fire'){const cr=t=>-(.06+.035*(1-t))*S.ns;
      // crest: a thick ridge along the top of the neck
      for(let i=0;i<9;i++){const t0=-.08+i*.13,t1=t0+.14;kk.L('','c',i%2?S.m:MDL100_lt(S.m,1.15),NP(0,t0,cr(t0)),NP(0,t1,cr(t1)),.035*Hw,.03*Hw,5)}
      // curtain: rows along the crest → down the side, ragged lower edge; two-sided cloth material
      if(m=='shag'){const N=12,rows=[[],[],[]],Rr=dkRng(17);for(let i=0;i<=N;i++){const t=-.1+i/N*1.08,dz=cr(t),sd=(.11-.03*t)*S.ns,len=(.85+Rr()*.35);
          rows[0].push(new THREE.Vector3(...NP(.005,t,dz-.004)));rows[1].push(new THREE.Vector3(...NP(sd*.7,t+.03,dz*.55)));rows[2].push(new THREE.Vector3(...NP(sd*1.08,t+.07,dz*(.05-len*.25))))}
        const cols=[rows[0],rows[1],rows[2]];kk.p('',MDL100_sheet(cols[0].map((_,i)=>[cols[0][i],cols[1][i],cols[2][i]]),1),'c',S.m,0,0,0,1,1,1);
        for(let i=0;i<N;i+=2)kk.L('','c',MDL100_lt(S.m,1.25),rows[1][i].toArray(),rows[2][i].toArray(),.012*Hw,.004*Hw,3)}}
    if(m=='ruff')for(let i=0;i<7;i++){const t=.12+i*.06;kk.p('','cone4','c',i%2?0xe0d6c0:0xccc0a8,...NP((i%3-1)*.03,t,.085*S.ns),.035*Hw,.11*Hw,.015*Hw,Math.PI*.82,0,(i%3-1)*.25)}
    if(S.ruff){for(let i=0;i<16;i++){const a=-2.6+i*.35,t=.05+(i%3)*.13;kk.p('','cone4','c',i%2?S.c2:0x5e5856,...NP(Math.sin(a)*.14,t,-Math.cos(a)*.13),.06*Hw,.2*Hw,.03*Hw,Math.cos(a)*.9-.4,0,Math.sin(a)*1.0)}}
    if(m=='bristle')for(let i=0;i<8;i++)kk.p('','cone4','c',i%2?0x120d0a:0x2a2018,...NP(0,-.4+i*.17,-.2),.05*Hw,(.17+(i%2)*.05)*Hw,.025*Hw,-1.1);
    if(m=='quill')for(let i=0;i<6;i++)kk.p('','cone4','c',i%2?S.m:dkShade(S.m,.8),...NP(0,.1+i*.15,-.06),.025*Hw,.11*Hw,.012*Hw,-.9);
    if(S.spikes)for(let i=0;i<6;i++)kk.p('','cone4','c',0x1a0a10,...NP(0,-.1+i*.2,-.13+i*.012),.03*Hw,(.13-i*.01)*Hw,.02*Hw,-1.15);
    if(skel)for(let i=0;i<6;i++){const t=-.15+i*.22;kk.p('','box','c',S.c2,...NP(0,t,-.02),.075*Hw,.045*Hw,.07*Hw);kk.p('','box','c',S.c,...NP(0,t,-.07),.02*Hw,.03*Hw,.05*Hw,-.3)}
  },true);
  // body: bristles, back spikes, wool tufts, ribs, raptor arms, war-wolf spikes
  att(b,'body',kk=>{
    if(S.t=='boar')for(let i=0;i<13;i++){const z=Z(.5-i*.09),q=bodyAt(z);kk.p('','cone4','c',i%2?0x120d0a:0x2e241c,0,q.y+q.t-.01,z,.045*Hw,(.13+(i%2)*.06)*Hw*(1-Math.abs(i-4)*.05),.025*Hw,-.45)}
    if(S.t=='carn'&&S.ruff)for(let i=0;i<8;i++){const z=Z(.32-i*.1),q=bodyAt(z);kk.p('','cone4','c',S.c2,0,q.y+q.t-.01,z,.05*Hw,.13*Hw,.03*Hw,-.8)}
    if(S.spikes)for(let i=0;i<10;i++){const z=Z(.5-i*.13);if(Math.abs(z-Z(-.02))<.24)continue;const q=bodyAt(z);kk.p('','cone4','c',0x1a0a10,0,q.y+q.t-.01,z,.045*Hw,(.12+(i%2)*.05)*Hw,.03*Hw,-.35)}
    if(S.wool){const R=dkRng(5);for(let i=0;i<40;i++){const z=Z(-.52+R()*1.02),a=-.4+R()*3.94,p=bodyPt(z,a,.012);if(Math.abs(z-Z(.04))<.3&&a>.35&&a<2.8)continue;const sz=(.04+R()*.025)*Hw;kk.p('','dod','c',R()<.5?0xd8ccb0:0xc8bca0,p.x,p.y,p.z,sz,sz*.7,sz,R()*3,R()*3,R()*3)}}
    if(skel){const BR=MDL100_T.horse.body;
      for(let i=0;i<9;i++){const z=Z(-.14+i*.055),q=bodyAt(z),f=1-Math.abs(i-3.5)*.05;
        const pts=[];for(let j=0;j<=8;j++){const a=Math.PI/2-.12+j/8*(Math.PI*.95);pts.push(bodyPt(z,a,0).multiplyScalar(1))}
        [1,-1].forEach(s=>{for(let j=0;j<8;j++){const A=pts[j],B=pts[j+1];kk.L('','c',j%2?S.c:dkShade(S.c,.92),[s*A.x*f,A.y,A.z],[s*B.x*f,B.y,B.z],.018*Hw,.016*Hw,4)}})}
      // sternum, pelvis wings, sacrum, dorsal spines
      {const q0=bodyAt(Z(.05));kk.L('','c',S.c2,[0,q0.y-q0.b*.92,Z(-.12)],[0,bodyAt(Z(.38)).y-bodyAt(Z(.38)).b*.8,Z(.38)],.03*Hw,.025*Hw,5)}
      [-1,1].forEach(s=>{const q=bodyAt(Z(-.4));kk.L('','c',S.c2,[s*q.w*.9,q.y+q.t*.7,Z(-.3)],[s*q.w*.55,q.y-q.b*.2,Z(-.52)],.05*Hw,.035*Hw,5);kk.L('','c',S.c2,[s*q.w*.55,q.y-q.b*.2,Z(-.52)],[s*q.w*.3,q.y-q.b*.55,Z(-.4)],.03*Hw,.02*Hw,4)});
      for(let i=0;i<14;i++){const z=Z(.36-i*.065),q=bodyAt(z),hgt=(i<5?.12-i*.015:.05)*Hw;kk.p('','box','c',i%2?S.c:S.c2,0,q.y+q.t*.86+hgt*.5,z,.016*Hw,hgt,.035*Hw,-.25)}
      // scapulae
      [-1,1].forEach(s=>{const q=bodyAt(Z(.3));kk.L('','c',S.c2,[s*q.w*.85,q.y+q.t*.75,Z(.24)],[s*q.w*1.0,q.y-q.b*.2,Z(.36)],.05*Hw,.03*Hw,4)})}
    if(c.biped)[-1,1].forEach(s=>{const sh=[s*X(.11),Y(1.0),Z(.36)],el=[s*X(.15),Y(.88),Z(.42)],wr=[s*X(.13),Y(.84),Z(.52)];kk.L('','c',S.c,sh,el,.035*Hw,.028*Hw,5).L('','c',S.c,el,wr,.026*Hw,.02*Hw,5);
      for(let j=-1;j<=1;j++)kk.L('','c',0x1a120c,wr,[wr[0]+j*.015,wr[1]-.04,wr[2]+.05],.009,.002,4)});
    if(S.stripes)for(let i=0;i<6;i++){const z=Z(.32-i*.1),q=bodyAt(z);kk.p('','cone4','c',S.m,0,q.y+q.t-.01,z,.02*Hw,.07*Hw,.015*Hw,-.7)}
  },.1);
  // tail: hair strands, tufts, spikes, fins
  att(tail,'tail',kk=>{const TP=(x,t,z)=>[x*Hw,t,z*Hw],tl=MDL100_T[S.t].tail.len*Hw*((MDL100_TAIL[S.tail]||{}).l||1);
    if(S.tail=='hair')for(let i=0;i<10;i++){const a=i/10*Math.PI*2;kk.p('','cone4','c',i%2?S.m:MDL100_lt(S.m,1.3),...TP(Math.cos(a)*.04,tl*(.55+(i%3)*.12),Math.sin(a)*.04),.04*Hw,.3*Hw,.02*Hw,Math.PI+Math.sin(a)*.15,0,Math.cos(a)*.15)}
    if(S.tail=='tuft'){kk.L('','c',S.c,TP(0,-.02,0),TP(0,tl,.0),.018*Hw,.012*Hw,5);for(let i=0;i<5;i++)kk.p('','cone4','c',0x120d0a,...TP((i-2)*.01,tl+.04*Hw,0),.02*Hw,.1*Hw,.01*Hw,Math.PI+(i-2)*.12)}
    if(S.tail=='raptor'){const R=MDL100_T.raptor.tail;for(let i=0;i<R.rings.length-1;i++){}}
    if(S.tail=='bushy')for(let i=0;i<8;i++){const a=i/8*Math.PI*2;kk.p('','cone4','c',i%2?S.c2:0x5a5452,...TP(Math.cos(a)*.06,tl*(.25+(i%4)*.15),Math.sin(a)*.06),.05*Hw,.16*Hw,.025*Hw,.25,0,Math.cos(a)*.6)}
    if(S.spikes)for(let i=0;i<7;i++)kk.p('','cone4','c',0x1a0a10,...TP(0,(.12+i*.17)*Hw,.09*(1-i*.11)),.03*Hw,(.1-i*.008)*Hw,.02*Hw,Math.PI/2+.5);
    if(S.tail=='drake'){kk.p('','cone4','c',S.c2,...TP(.045,1.38*Hw,0),.07*Hw,.18*Hw,.012*Hw,0,0,-.5);kk.p('','cone4','c',S.c2,...TP(-.045,1.38*Hw,0),.07*Hw,.18*Hw,.012*Hw,0,0,.5)}
    if(S.stripes)for(let i=0;i<4;i++)kk.p('','cone4','c',S.m,...TP(0,(.15+i*.18)*Hw,.06*(1-i*.15)),.015*Hw,.08*Hw,.012*Hw,Math.PI/2+.3)},true);
  // feet: claws, dewclaws, feathering, toes
  legs.forEach((q,i)=>{const s=q.s,D2=q.D,x=s*X(D2.x),last=D2.rings[D2.rings.length-1],zf=Z(last[1]),key='ft'+(c.biped?'b':q.key)+(s<0?'l':'r');
    att(q.kn,key,kk=>{
      if(S.t=='carn'||S.t=='drake'){const n=S.t=='drake'?3:4;for(let j=0;j<n;j++){const ox=(j-(n-1)/2)*.026*Hw*S.lt;kk.p('','cone4','c',S.t=='drake'?0x1a0a10:0xd8d0c0,x+ox,.012*Hw,zf+.05*Hw*S.lt,.009*Hw,.045*Hw,.009*Hw,Math.PI/2+.4)}
        for(let j=0;j<n;j++){const ox=(j-(n-1)/2)*.024*Hw*S.lt;kk.p('','sph','c',dkShade(S.c,.7),x+ox,.018*Hw,zf+.035*Hw*S.lt,.018*Hw*S.lt,.016*Hw,.024*Hw*S.lt)}}
      if(c.biped){[-1,0,1].forEach(j=>{const tip=[x+j*.05*Hw,.012,zf+(.17-Math.abs(j)*.04)*Hw];kk.L('','c',dkShade(S.c,.75),[x,.03,zf],tip,.022*Hw,.014*Hw,5);kk.p('','cone4','c',0x1a120c,tip[0],tip[1],tip[2]+.02,.01,.05,.01,Math.PI/2+.3)});
        kk.L('','c',dkShade(S.c,.75),[x-s*.02,.06,zf-.02],[x-s*.02,.1,zf+.05],.016,.012,4);kk.p('','cone4','c',0x0e0a08,x-s*.02,.12,zf+.08,.012,.08,.012,.6)}
      if(S.t=='boar'||S.t=='horse'&&(k=='stag'||k=='ram')){// cloven hooves: split + dewclaws
        kk.p('','box','c',0x050404,x,.024*Hw,zf+.03*Hw,.006*Hw,.05*Hw,.03*Hw);[-1,1].forEach(j=>kk.p('','cone4','c',S.hoof,x+j*.022*Hw,.09*Hw,zf-.035*Hw,.012*Hw,.03*Hw,.012*Hw,Math.PI+.5))}
      if(S.feath&&!skel){const fc=S.sock||0xc8b8a0,r0=.05*Hw*S.lt;kk.p('','skirt','c',fc,x,Y(.075),zf-.012*Hw,r0,.075*Hw,r0*1.05);kk.p('','skirt','c',MDL100_lt(fc,1.1),x,Y(.105),zf-.016*Hw,r0*.82,.05*Hw,r0*.9)}
      if(S.emberHoof){}
    },.08)});
}
// glowing parts: flames, ghost-fire, embers, belly glow
function MDL100_fx(c,att){
  const {S,Hw,X,Y,Z,W,neck,head,tail,b,legs,nl,fl,bodyAt,skel}=c,NP=(t,z)=>W(neck,[0,t*nl,z*Hw]);
  if(S.mane=='fire'||S.mane=='ghost'){const n=11;for(let i=0;i<n;i++){const t=-.05+i/(n-1)*1.02;fl(neck,'m'+i,NP(t,-(.085+.03*(1-t))*S.ns),(.09+(i%3)*.03)*Hw,-1.25,S.mane=='ghost'?(i%2?0xbaffe8:S.m):(i%3?0xff7a1a:0xffb040))}}
  if(S.tail=='fire'||S.tail=='ghost'){const tl=.62*Hw;for(let i=0;i<6;i++)fl(tail,'t'+i,W(tail,[0,tl*(i+.2)/6,0]),(.13-i*.01)*Hw,0,S.tail=='ghost'?S.m:(i%2?0xffb040:0xff7a1a));
    if(S.tail=='fire'){att(tail,'dock',kk=>{const P=W(tail,[0,.05*Hw,0]),Q=W(tail,[0,.2*Hw,0]);kk.L('','c',S.c,P.toArray(),Q.toArray(),.045*Hw,.03*Hw,6)},.08)}}
  if(S.emberHoof)legs.forEach((q,i)=>{const x=q.s*X(q.D.x),last=q.D.rings[q.D.rings.length-1],z=Z(last[1]);fl(q.kn,'e'+i,new THREE.Vector3(x,Y(.06),z-.01),.08*Hw,0,i%2?0xff8a2a:0xffb040)});
  if(skel){const q=bodyAt(Z(.12));att(b,'core',kk=>kk.p('','oct','g',S.m,0,q.y+.02,Z(.12),.1*Hw,.14*Hw,.1*Hw));
    att(head,'eyes',kk=>[-1,1].forEach(s=>{const p=W(head,[s*.045*Hw,.025*Hw,.122*Hw]);kk.p('','oct','g',S.eye,p.x,p.y,p.z,.012*Hw,.016*Hw,.012*Hw)}))}
  if(S.wings)att(b,'belly',kk=>{for(let i=0;i<7;i++){const z=Z(.32-i*.1),q=bodyAt(z);kk.p('','box','g',i%2?0xff7a2a:0xff9a3a,0,q.y-q.b+.008,z,q.w*.5,.012*Hw,.07*Hw)}});
}
// drake wings: an arm (root → wrist) with an inner membrane, and a finger fan on the wrist; folded at rest, spread when moving
function MDL100_wings(c){
  const {S,Hw,X,Y,Z,b,bodyAt}=c,q=bodyAt(Z(.3));
  return [-1,1].map(s=>{
    const root=new THREE.Group();root.position.set(s*q.w*.86,q.y+q.t*.55,Z(.36));b.add(root);
    const wr=new THREE.Group();wr.position.set(s*.62*Hw,0,.02*Hw);root.add(wr);
    const inner=lgGroup('M100|wingI'+s,kk=>{const Wr=[s*.62*Hw,0,.02*Hw],att=[0,0,-.55*Hw],el=[s*.3*Hw,.02*Hw,.06*Hw];
      kk.L('','c',0x2a0e16,[0,0,0],el,.045*Hw,.035*Hw,5).L('','c',0x2a0e16,el,Wr,.035*Hw,.025*Hw,5);kk.p('','sph','c',0x3a1420,...el,.04*Hw,.04*Hw,.04*Hw);
      const P=[[0,0,0],Wr,[s*.5*Hw,0,-.45*Hw],att];const g=new THREE.BufferGeometry(),A=[];[[0,1,2],[0,2,3]].forEach(t=>t.forEach(i=>A.push(...P[i])));g.setAttribute('position',new THREE.Float32BufferAttribute(A,3));g.computeVertexNormals();
      kk.p('',g,'c',0x6a2232,0,0,0,1,1,1);kk.p('','cone4','c',0xd8d0b8,...Wr,.015*Hw,.06*Hw,.015*Hw,0,0,-s*1.2)},.16);root.add(inner);
    const outer=lgGroup('M100|wingO'+s,kk=>{const tips=[[s*.52,0,.06],[s*.58,0,-.22],[s*.42,0,-.48],[s*.12,0,-.48]].map(p=>p.map(v=>v*Hw));
      tips.slice(0,3).forEach((t,i)=>{kk.L('','c',0x2a0e16,[0,0,0],t,.022*Hw,.008*Hw,4);kk.p('','cone4','c',0xd8d0b8,...t,.01*Hw,.04*Hw,.01*Hw,0,0,-s*1.4)});
      const g=new THREE.BufferGeometry(),A=[],P=[[0,0,0]].concat(tips),bk=[-.12*Hw,0,-.47*Hw];P.push([s*0,0,-.47*Hw]);
      for(let i=1;i<P.length-1;i++)A.push(...P[0],...P[i],...P[i+1]);g.setAttribute('position',new THREE.Float32BufferAttribute(A,3));g.computeVertexNormals();kk.p('',g,'c',0x7a2838,0,0,0,1,1,1)},.16);wr.add(outer);
    root.side=s;root.wr=wr;root.sp=0;return root})}
// folded: the arm lies back along the flank, the membrane hangs flat against it, the hand folds back along the arm (scaled in);
// moving: the arm swings out and up, the hand opens, a slow beat. Orientations are slerped (no per-frame allocations).
var MDL100_WQ=null;
function MDL100_wingPose(ws,now,mv,sp){const t=now/1000;
  if(!MDL100_WQ){const m=new THREE.Matrix4(),f=s=>{m.set(0,-s,0,0, 0,0,1,0, -s,0,0,0, 0,0,0,1);return new THREE.Quaternion().setFromRotationMatrix(m)},E=new THREE.Euler();
    const up=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),.62);MDL100_WQ={f:[up.clone().multiply(f(-1)),up.clone().multiply(f(1))],o:[new THREE.Quaternion().setFromEuler(E.set(0,-.2,-.5)),new THREE.Quaternion().setFromEuler(E.set(0,.2,.5))],q:new THREE.Quaternion(),b:new THREE.Quaternion(),e:new THREE.Euler()}}
  const W=MDL100_WQ;
  for(const w of ws){const s=w.side,i=s>0?1:0;w.sp+=((mv?1:0)-w.sp)*.04;const k=w.sp,fl=mv?Math.sin(t*(2.4+(sp||0)*.1))*.25*k:0;
    W.b.setFromEuler(W.e.set(0,0,s*fl));W.q.copy(W.o[i]).multiply(W.b);w.quaternion.copy(W.f[i]).slerp(W.q,k);
    w.wr.rotation.set(0,s*2.6*(1-k),0);const sc=.6+.4*k;w.wr.scale.set(sc,1,sc)}}

// ---------------------------------------------------------------- tack: saddle, blanket, bridle, barding, harness (parts of the skinned kit)
function MDL100_tack(c){
  const {S,Hw,X,Y,Z,W,V,bodyAt,bodyPt,b,head,neck,nl,k,skel,biped,att}=c,r=c.r,T=(MOUNTS[k]&&MOUNTS[k].t)||1,blk=MDL100_TIER[Math.max(0,Math.min(4,T-1))];
  const zs=r.seat[1],ys=r.seat[0],lea=0x4a2c18,lea2=0x2e1a0e,lea3=0x6a4024,brs=T>=3?0x9a7838:0x6c7078,trim=T>=4?0xc8a040:0xb8962e,war=S.tack=='war',dread=S.tack=='dread';
  const sm=1; // saddle size follows the rider, not the mount
  // angle on the section where the surface reaches height yy (search the side, x>0)
  const aAt=(z,yy)=>{let best=Math.PI/2,bd=1e9;for(let i=0;i<=64;i++){const a=Math.PI/2-i/64*Math.PI;const p=bodyPt(z,a,0),d=Math.abs(p.y-yy);if(d<bd){bd=d;best=a}}return best};
  const shell=(z0,z1,nz,drop,off,na)=>{const rows=[];for(let i=0;i<=nz;i++){const z=z0+(z1-z0)*i/nz,q=bodyAt(z),top=q.y+q.t,a1=aAt(z,top-drop),row=[];
      for(let j=0;j<=na;j++){const a=Math.PI-a1+(2*a1-Math.PI)*j/na;row.push(bodyPt(z,a,off))}rows.push(row)}return rows};
  // saddle on the body bone (pitches with it). Blanket and skirts hang from the back over the sides.
  att(b,'sad',kk=>{
    const bl=S.tack=='raptor'?.3:.33,bz0=zs-bl,bz1=zs+bl*(S.tack=='drake'?.9:1.0),drop=(skel?.34:.36)*Math.min(1.1,Math.max(.8,Hw)),blanket=MDL100_sheet(shell(bz0,bz1,6,drop,.012,12));
    kk.p('',blanket,'c',dread?0x141216:war?0x5a1212:blk,0,0,0,1,1,1);
    // trim along the hem and the ends
    const hem=shell(bz0,bz1,6,drop+.035,.016,12);[0,12].forEach(j=>{for(let i=0;i<6;i++)kk.L('','c',trim,hem[i][j].toArray(),hem[i+1][j].toArray(),.012,.012,4)});
    // saddle tree: seat dipping between a raised pommel and cantle, skirts down the sides
    const sz0=zs-.2,sz1=zs+.17,sd=.2,seat=[],ns=6,na=10;
    for(let i=0;i<=ns;i++){const u=i/ns,z=sz0+(sz1-sz0)*u,q=bodyAt(z),top=q.y+q.t,a1=aAt(z,top-sd),row=[],lift=.03+.07*Math.pow(1-u,3)*1.0+.05*Math.pow(u,4);
      for(let j=0;j<=na;j++){const a=Math.PI-a1+(2*a1-Math.PI)*j/na,p=bodyPt(z,a,.03),mid=1-Math.abs(j/na-.5)*2;p.y+=lift*Math.pow(mid,.6);row.push(p)}seat.push(row)}
    kk.p('',MDL100_sheet(seat),'c',lea,0,0,0,1,1,1);
    // seat padding (darker, inset) and stitched rim
    const pad=seat.slice(1,ns).map(row=>row.slice(2,na-1).map(p=>p.clone().add(new V(0,.008,0))));kk.p('',MDL100_sheet(pad),'c',lea2,0,0,0,1,1,1);
    // cantle (back) and pommel (front) as raised arcs
    [[sz0,.075,lea3],[sz1,.05,lea3]].forEach(([z,h,col],qi)=>{const row=seat[qi?ns:0];for(let j=2;j<na-2;j++){const A=row[j],B=row[j+1];kk.L('','c',col,[A.x,A.y,A.z],[B.x,B.y+(qi?0:0),B.z],.022,.022,5)}
});
    {const p=seat[ns][na/2];kk.p('','cyl','c',lea3,p.x,p.y+.035,p.z-.005,.026,.04,.026,.25);kk.p('','cyl','m',brs,p.x,p.y+.058,p.z,.034,.012,.034,.25)}
    // studs along the seat rim
    for(let i=1;i<ns;i++)[1,na-1].forEach(j=>{const p=seat[i][j];kk.p('','sph','m',brs,p.x,p.y+.006,p.z,.012,.01,.012)});
    // skirts / fenders: leather flaps under the rider's thighs
    [-1,1].forEach(s=>{const fz=zs+.04,rows=[];for(let i=0;i<=3;i++){const z=fz-.12+i*.08,q=bodyAt(z),top=q.y+q.t,row=[];for(let j=0;j<=4;j++){const yy=top-.1-j*.07,a=aAt(z,yy),p=bodyPt(z,s>0?a:Math.PI-a,.034);row.push(p)}rows.push(row)}
      kk.p('',MDL100_sheet(rows),'c',lea3,0,0,0,1,1,1);
      // girth strap down the side and under the belly
      const gz=zs+.1,q=bodyAt(gz);for(let j=0;j<8;j++){const a0=-Math.PI/2+j/8*Math.PI/2*1.0,a1=-Math.PI/2+(j+1)/8*Math.PI/2;const A=bodyPt(gz,s>0?a0:Math.PI-a0,.02),B=bodyPt(gz,s>0?a1:Math.PI-a1,.02);kk.L('','c',lea2,[A.x,A.y,A.z],[B.x,B.y,B.z],.022,.022,4)}
      {const p=bodyPt(gz,s>0?-.35:Math.PI+.35,.03);kk.p('','box','m',brs,p.x,p.y,p.z,.012,.04,.035)}
      // stirrup hanger ring
      const hp=bodyPt(zs+.02,s>0?aAt(zs+.02,bodyAt(zs+.02).y+bodyAt(zs+.02).t-.1):Math.PI-aAt(zs+.02,bodyAt(zs+.02).y+bodyAt(zs+.02).t-.1),.045);kk.p('','box','m',brs,hp.x,hp.y,hp.z,.012,.03,.03)});
    // saddle bags and bedroll behind the cantle
    if(S.bags||S.tack=='riding'){const z=sz0-.08;[-1,1].forEach(s=>{const q=bodyAt(z),a=aAt(z,q.y+q.t-.14),p=bodyPt(z,s>0?a:Math.PI-a,.07);kk.p('','box','c',lea3,p.x,p.y,p.z,.07,.13,.15,0,0,s*.12);kk.p('','box','c',lea,p.x+s*.005,p.y+.05,p.z,.075,.05,.155,0,0,s*.12);kk.p('','box','m',brs,p.x+s*.04,p.y+.02,p.z,.008,.025,.025)});
      if(S.bags){const q=bodyAt(z+.02);kk.p('','cyl','c',0x5a4a34,0,q.y+q.t+.06,z+.02,.055,.34,.055,0,0,Math.PI/2);[-1,1].forEach(s=>kk.p('','cyl','c',lea2,s*.09,q.y+q.t+.06,z+.02,.06,.02,.06,0,0,Math.PI/2))}}
    // breast collar: strap from the saddle front down around the chest
    if(!biped&&S.tack!='drake'){const pts=[];for(let i=0;i<=10;i++){const u=i/10,a=Math.PI*(1-u),z=Z(.47)-.02*Math.sin(Math.PI*u),q=bodyAt(z);pts.push(bodyPt(z,-Math.PI/2+.35+(a-Math.PI/2)*.0,0))}
      const lp=[];for(let i=0;i<=12;i++){const u=i/12,s=u<.5?-1:1,t=Math.abs(u-.5)*2,z=Z(.5)-.02-t*(Z(.5)-zs-.18),q=bodyAt(z),a=-Math.PI/2+.2+t*1.0;lp.push(bodyPt(z,s>0?a:Math.PI-a,.02))}
      for(let i=0;i<12;i++)kk.L('','c',war||dread?0x3a3a40:lea2,lp[i].toArray(),lp[i+1].toArray(),.02,.02,4);const m=lp[6];kk.p('','oct','m',brs,m.x,m.y,m.z+.015,.035,.035,.02)}
  });
  if(war||dread)MDL100_bard(c,war,dread,blk,trim);
  if(S.tack=='harness'||S.tack=='boar'||S.tack=='drake'||S.tack=='raptor')MDL100_harness(c,blk,brs);
  c.bri=MDL100_bridle(c,war,dread,brs);
  // where the stirrup leathers hang from the saddle
  const zs2=zs+.02,qh=bodyAt(zs2),ah=aAt(zs2,qh.y+qh.t-.1);c.hang=[bodyPt(zs2,Math.PI-ah,.05),bodyPt(zs2,ah,.05)];c.brs=brs;c.lea=lea2}
function MDL100_bridle(c,war,dread,brs){
  const {S,Hw,W,head,k,skel}=c,hs=Hw*S.hs,HR=MDL100_HEAD[S.head||'']||(skel?MDL100_HEAD.skull:MDL100_T[S.t].head.rings),lea=war||dread?0x2a2224:0x3a2214;
  const hAt=z=>{let i=0;while(i<HR.length-2&&HR[i+1][0]<z)i++;const A=HR[i],B=HR[i+1],u=Math.max(0,Math.min(1,(z-A[0])/(B[0]-A[0])));return A.map((v,j)=>v+(B[j]-v)*u)};
  const ringPts=(z,f,a0,a1,n)=>{const q=hAt(z),P=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,c0=Math.cos(a),s0=Math.sin(a);P.push(W(head,[c0*q[2]*f*hs,(q[1]+s0*(s0>0?q[3]:q[4])*f)*hs,z*hs]))}return P};
  const muzZ=HR[HR.length-2][0]-.03,cheekZ=Math.min(.06,HR[1][0]+.06),q2=hAt(muzZ);
  const bitL=W(head,[-q2[2]*1.08*hs,(q2[1]-q2[4]*.45)*hs,(muzZ+.02)*hs]),bitR=W(head,[q2[2]*1.08*hs,(q2[1]-q2[4]*.45)*hs,(muzZ+.02)*hs]);
  if(S.t=='carn'||S.t=='raptor'||S.t=='drake'||S.t=='boar'){// a muzzle harness: noseband + cheek straps to a collar ring
    c.att(head,'bri',kk=>{const nb=ringPts(muzZ-.05,1.1,0,Math.PI*2,10);for(let i=0;i<10;i++)kk.L('','c',lea,nb[i].toArray(),nb[i+1].toArray(),.012*Hw,.012*Hw,4);
      const cr=ringPts(cheekZ-.06,1.12,0,Math.PI*2,10);for(let i=0;i<10;i++)kk.L('','c',lea,cr[i].toArray(),cr[i+1].toArray(),.012*Hw,.012*Hw,4);
      [-1,1].forEach(s=>{const A=nb[s>0?0:5],B=cr[s>0?0:5];kk.L('','c',lea,A.toArray(),B.toArray(),.01*Hw,.01*Hw,4);kk.p('',lgGeoC('bitr',()=>new THREE.TorusGeometry(.022,.006,4,8)),'m',brs,...(s<0?bitL:bitR).toArray(),Hw,Hw,Hw,0,Math.PI/2,0)});
      if(S.spiked)for(let i=0;i<5;i++){const p=cr[2+i];kk.p('','cone4','m',0x5c6068,...p.toArray(),.01*Hw,.04*Hw,.01*Hw)}});
    return {bit:[bitL,bitR]}}
  c.att(head,'bri',kk=>{
    const L=(A,B,w)=>kk.L('','c',lea,A.toArray(),B.toArray(),(w||.011)*Hw,(w||.011)*Hw,4);
    const crown=ringPts(-.035,1.12,-Math.PI*.15,Math.PI*1.15,8),brow=ringPts(.02,1.1,Math.PI*.15,Math.PI*.85,6),nose=ringPts(muzZ-.07,1.12,0,Math.PI*2,12);
    for(let i=0;i<8;i++)L(crown[i],crown[i+1]);for(let i=0;i<6;i++)kk.L('','c',war?0x8a1a1a:0x6a1a1a,brow[i].toArray(),brow[i+1].toArray(),.012*Hw,.012*Hw,4);for(let i=0;i<12;i++)L(nose[i],nose[i+1]);
    // cheekpieces from the crown down to the bit, throatlatch under the jaw
    L(crown[0],bitR,.012);L(crown[8],bitL,.012);const tl=ringPts(.0,1.12,-Math.PI*.9,-Math.PI*.1,6);for(let i=0;i<6;i++)L(tl[i],tl[i+1],.009);
    [bitL,bitR].forEach(p=>kk.p('',lgGeoC('bitr',()=>new THREE.TorusGeometry(.022,.006,4,8)),'m',brs,...p.toArray(),Hw,Hw,Hw,0,Math.PI/2,0));
    kk.p('','oct','m',brs,...brow[3].toArray(),.016*Hw,.016*Hw,.01*Hw);[0,8].forEach(i=>kk.p('','box','m',brs,...crown[i].toArray(),.01*Hw,.02*Hw,.02*Hw))});
  return {bit:[bitL,bitR]}}
// war barding (charger) / dread barding (bone destrier): chanfron, crinet, peytral, crupper, caparison
function MDL100_bard(c,war,dread,blk,trim){
  const {S,Hw,X,Y,Z,W,V,bodyAt,bodyPt,b,head,neck,nl,k,r}=c,plate=dread?0x3a3430:0x5c6068,plate2=dread?0x2a2420:0x4a4e56,cloth=dread?0x161418:0x7a1a1a,cloth2=dread?0x221e24:0x5a1212,gold=dread?0x5a4a30:trim;
  c.att(b,'bard',kk=>{
    // caparison: cloth skirts from the saddle line down the flanks, ragged hem (dread: torn)
    const zs=r.seat[1],R=dkRng(7);
    if(!dread)[-1,1].forEach(s=>{[[zs+.28,Z(.45)],[Z(-.5),zs-.3]].forEach(([z0,z1],pi)=>{const rows=[],n=5,na=4;for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n,q=bodyAt(z),row=[];
        for(let j=0;j<=na;j++){const u=j/na,yy=q.y+q.t*.55-(q.t*.55+q.b*(dread?.35:.55))*u-(j==na?(dread?R()*.12:(i%2)*.03):0),a=Math.asin(Math.max(-1,Math.min(1,(yy-q.y)/(yy>q.y?q.t:q.b)))),p=bodyPt(z,s>0?a:Math.PI-a,.04+u*.03);if(j==na)p.y=Math.min(p.y,yy);row.push(p)}rows.push(row)}
      kk.p('',MDL100_sheet(rows),'c',(i=>i)(pi?cloth:cloth2),0,0,0,1,1,1);
      const hem=rows.map(rw=>rw[na]);for(let i=0;i<n;i++)kk.L('','c',gold,hem[i].toArray(),hem[i+1].toArray(),.012,.012,4);
})});
    // peytral: plate over the chest with bosses
    {const rows=[];for(let i=0;i<=3;i++){const z=Z(.52)-i*.05,q=bodyAt(z),row=[];for(let j=0;j<=10;j++){const a=-Math.PI/2+(-.95+1.9*j/10)*Math.PI/2*1.15;row.push(bodyPt(z,a+Math.PI/2*0,0).clone())}
        rows.push(row)}
      const P=[];[.535,.5,.45,.39].forEach(zz=>{const z=Z(zz),row=[];for(let j=0;j<=10;j++){const a=Math.PI-.25+j/10*(Math.PI+.5);row.push(bodyPt(z,a,.03))}P.push(row)});
}
    // crupper: plates over the hindquarters behind the saddle, tail opening
    {const P=[];for(let i=0;i<=4;i++){const z=r.seat[1]-.34-i*(r.seat[1]-.34-Z(-.53))/4,row=[];
        for(let j=0;j<=10;j++){const a=Math.PI*(.12+.76*j/10);row.push(bodyPt(z,a,.04))}P.push(row)}
      kk.p('',MDL100_sheet(P,1),'m',dread?plate2:plate,0,0,0,1,1,1);for(let i=0;i<4;i++)[0,10].forEach(j=>kk.L('','m',gold,P[i][j].toArray(),P[i+1][j].toArray(),.012,.012,4));
      for(let i=1;i<4;i++)[3,7].forEach(j=>{const p=P[i][j];kk.p('','sph','m',gold,p.x,p.y+.01,p.z,.018,.018,.018)});
      if(dread)for(let i=0;i<4;i++){const p=P[2][2+i*2];kk.p('','cone4','m',0x2a2420,p.x,p.y+.04,p.z,.02,.1,.02,0,0,(i-1.5)*.3)}}
  });
  // crinet lames along the neck crest, chanfron on the face
  c.att(neck,'crin',kk=>{const ns=Hw*S.ns,R=MDL100_T.horse.neck.rings;for(let i=0;i<6;i++){const t=.0+i*.16,P=[];
      for(let j=0;j<=6;j++){const a=Math.PI*(.18+.64*j/6),cx=Math.cos(a),sy=Math.sin(a);P.push(W(neck,[cx*.13*ns*(1-t*.35)*1.15,t*nl,-(sy*.13*ns*(1-t*.3)+.012)]))}
      const Q=P.map(p=>p.clone().add(W(neck,[0,.1*nl,0]).sub(W(neck,[0,0,0]))));kk.p('',MDL100_sheet([P,Q],1),'m',i%2?plate:plate2,0,0,0,1,1,1);for(let j=0;j<6;j++)kk.L('','m',gold,P[j].toArray(),P[j+1].toArray(),.007,.007,3)}});
  const hs=Hw*S.hs,HR=dread?MDL100_HEAD.skull:MDL100_T.horse.head.rings;
  c.att(head,'chan',kk=>{const rows=[];for(let i=0;i<=5;i++){const z=-.02+i*.07,q=HR.reduce((a,b2)=>b2[0]<=z?b2:a,HR[0]),row=[];for(let j=0;j<=6;j++){const a=Math.PI*(.12+.76*j/6);row.push(W(head,[Math.cos(a)*q[2]*1.12*hs,(q[1]+Math.sin(a)*q[3]*1.18)*hs,z*hs]))}rows.push(row)}
    kk.p('',MDL100_sheet(rows,1),'m',plate,0,0,0,1,1,1);for(let i=0;i<5;i++)kk.L('','m',gold,rows[i][3].toArray(),rows[i+1][3].toArray(),.01*Hw,.01*Hw,4);
    const p=rows[1][3];kk.p('','cone4','m',gold,p.x,p.y+.04*Hw,p.z,.018*Hw,.14*Hw,.018*Hw,-.5);[-1,1].forEach(s=>{const e=rows[1][s>0?0:6];kk.p('','cone4','m',plate2,e.x,e.y+.03,e.z,.03*Hw,.08*Hw,.012*Hw,0,0,-s*.4)})})}
// harness for cats, wolves, boars, raptors, drakes: chest straps, collar, side straps, trophies
function MDL100_harness(c,blk,brs){
  const {S,Hw,X,Y,Z,V,bodyAt,bodyPt,b,k,r,neck,W,nl}=c,lea=0x2e1a0e,lea2=0x4a2c18;c.att(b,'har',kk=>{
    const zs=r.seat[1];
    // strap rings around the body in front of and behind the saddle
    [zs+.2,zs-.24].forEach((z,qi)=>{const P=[];for(let j=0;j<=14;j++)P.push(bodyPt(z,-Math.PI/2+j/14*Math.PI*2,.018));for(let j=0;j<14;j++)kk.L('','c',lea,P[j].toArray(),P[j+1].toArray(),.02,.02,4);
      [-1,1].forEach(s=>{const p=bodyPt(z,s>0?-.2:Math.PI+.2,.03);kk.p('','box','m',brs,p.x,p.y,p.z,.012,.035,.035)})});
  });c.att(neck,'collar',kk=>{const zs=r.seat[1];
    // collar at the base of the neck (wolf: spiked)
    {const P=[];for(let j=0;j<=14;j++){const a=j/14*Math.PI*2;P.push(W(neck,[Math.cos(a)*.15*Hw*S.ns,.12*nl,-Math.sin(a)*.15*Hw*S.ns]))}
      for(let j=0;j<14;j++)kk.L('','c',lea2,P[j].toArray(),P[j+1].toArray(),.03*Hw,.03*Hw,4);
      if(S.spiked)for(let j=0;j<14;j+=2){const p=P[j],d=p.clone().sub(W(neck,[0,.12*nl,0])).normalize();kk.p('','cone4','m',0x6c7078,p.x+d.x*.02,p.y+d.y*.02,p.z+d.z*.02,.012*Hw,.06*Hw,.012*Hw,Math.atan2(d.z,d.y),0,-Math.atan2(d.x,d.y))}}
    // a trophy / talisman hanging from the collar
    if(S.t=='carn'||S.t=='boar'){const p=W(neck,[0,.1*nl,.17*Hw*S.ns]);kk.L('','c',0x8a7a5a,p.toArray(),[p.x,p.y-.08,p.z+.01],.004,.004,3);kk.p('','cone4','c',0xe0d8c4,p.x,p.y-.11,p.z+.01,.016,.06,.012,Math.PI);
      if(S.t=='carn'&&k=='direwolf'){kk.p('','sph','c',0xd8d0bc,p.x,p.y-.16,p.z+.02,.035,.04,.035);kk.p('','box','c',0x0a0808,p.x-.012,p.y-.155,p.z+.05,.012,.012,.006);kk.p('','box','c',0x0a0808,p.x+.012,p.y-.155,p.z+.05,.012,.012,.006)}}
    // blanket corner tassels in the tier colour
    [-1,1].forEach(s=>{const z=zs+.3,q=bodyAt(z),p=bodyPt(z,s>0?.2:Math.PI-.2,.03);kk.p('','cone4','c',blk,p.x,p.y-.05,p.z,.02,.08,.02,Math.PI)})
  })}
// ---------------------------------------------------------------- reins and stirrups (one small dynamic mesh per mount)
function MDL100_fin(g,k){const c=g.r.userData.mdlc;if(!c)return g;try{MDL100_reins(g,c)}catch(e){if(MDL100.err++<3)console.error('v100 reins',k,e)}return g}
function MDL100_reins(g,c){
  const {b,head}=c;c.r.updateMatrixWorld(true);
  const pin=(o,p)=>{const q=new THREE.Object3D();q.position.copy(o.worldToLocal(p.clone()));o.add(q);return q};
  const bit=c.bri.bit.map(p=>pin(head,p)),hang=c.hang.map(p=>pin(b,p));
  // 12 boxes: 4 rein pieces, 2 stirrup leathers, 2 × 3 stirrup pieces (two side bars and the tread)
  const NB=12,pos=new Float32Array(NB*108),col=new Float32Array(NB*108),geo=new THREE.BufferGeometry(),iron=new THREE.Color(c.brs),lea=new THREE.Color(c.lea);
  for(let i=0;i<NB;i++){const cc=i>=6?iron:lea;for(let j=0;j<36;j++){const o=(i*36+j)*3;col[o]=cc.r;col[o+1]=cc.g;col[o+2]=cc.b}}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.userData.lps=1;
  const m=new THREE.Mesh(geo,lgMats().c);m.frustumCulled=false;m.castShadow=true;m.userData.lps=1;g.add(m);
  g.mdl={bit,hang,mesh:m,geo,pos};MDL100_rest(g)}
var MDL100_v=null;
function MDL100_vv(){const V=THREE.Vector3;return MDL100_v||(MDL100_v={a:new V(),b:new V(),m:new V(),f:new V(),t:new V(),u:new V(),w:new V(),x:new V(),y:new V(),inv:new THREE.Matrix4(),q:new V(),Q:new THREE.Quaternion(),Q2:new THREE.Quaternion(),c:[0,0,0,0,0,0,0,0].map(()=>new V())})}
var MDL100_F=[[0,2,3,1],[4,5,7,6],[0,1,5,4],[2,6,7,3],[0,4,6,2],[1,3,7,5]];
// box i of the dynamic mesh from A to B (mount space), cross-section w (sideways) × h
function MDL100_box(D,i,A,B,w,h){const v=MDL100_vv(),P=D.pos,d=v.x.copy(B).sub(A),l=d.length();if(l<1e-5)d.set(0,0,1);else d.multiplyScalar(1/l);
  const up=Math.abs(d.y)>.9?v.u.set(1,0,0):v.u.set(0,1,0),sd=v.w.crossVectors(d,up).normalize(),u2=v.y.crossVectors(sd,d).normalize(),C=v.c;
  for(let k=0;k<8;k++){const e=k&4?B:A;C[k].copy(e).addScaledVector(sd,(k&1?1:-1)*w*.5).addScaledVector(u2,(k&2?1:-1)*h*.5)}
  let o=i*108;for(const f of MDL100_F){const q0=C[f[0]],q1=C[f[1]],q2=C[f[2]],q3=C[f[3]];for(const q of [q0,q1,q2,q0,q2,q3]){P[o++]=q.x;P[o++]=q.y;P[o++]=q.z}}}
// stirrup under F: two side bars and a tread
function MDL100_stir(D,i,F){const v=MDL100_vv(),a=v.t,b=v.f;
  a.set(F.x,F.y+.12,F.z-.045);b.set(F.x,F.y,F.z-.05);MDL100_box(D,i,a,b,.016,.016);a.set(F.x,F.y+.12,F.z+.045);b.set(F.x,F.y,F.z+.05);MDL100_box(D,i+1,a,b,.016,.016);
  a.set(F.x,F.y,F.z-.06);b.set(F.x,F.y,F.z+.06);MDL100_box(D,i+2,a,b,.07,.014)}
function MDL100_done(D){D.geo.attributes.position.needsUpdate=true;D.geo.computeVertexNormals();D.geo.computeBoundingSphere()}
// at rest: reins over the neck to the pommel, stirrups hanging down
function MDL100_rest(g){const D=g.mdl;if(!D)return;g.updateMatrixWorld(true);const V=THREE.Vector3,inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),seat=g.r.seat;
  const P=o=>o.getWorldPosition(new V()).applyMatrix4(inv);
  for(let s=0;s<2;s++){const sg=s?1:-1,A=P(D.bit[s]),E=new V(sg*.05,seat[0]+.1,seat[1]+.2),M=A.clone().lerp(E,.5);M.y-=.1;M.x=sg*Math.max(Math.abs(M.x),.11);
    MDL100_box(D,s*2,A,M,.008,.022);MDL100_box(D,s*2+1,M,E,.008,.022);
    const H=P(D.hang[s]),F=H.clone();F.y-=.44;F.x+=sg*.02;const T=F.clone();T.y+=.12;MDL100_box(D,4+s,H,T,.008,.034);MDL100_stir(D,6+s*3,F)}
  MDL100_done(D)}
// riding: reins from the bit to the hands, a stirrup under the ball of each foot
function MDL100_ride(g){const D=g.mdl;if(!D||!pl||!pl.bones)return;const v=MDL100_vv();
  g.updateMatrixWorld(true);pl.updateMatrixWorld(true);v.inv.copy(g.matrixWorld).invert();g.getWorldQuaternion(v.Q2).invert();const B=pl.bones;
  for(let s=0;s<2;s++){const hand=s?B.aR2:B.aL2,foot=s?B.rh2:B.lh2;
    D.bit[s].getWorldPosition(v.a).applyMatrix4(v.inv);hand.getWorldPosition(v.b).applyMatrix4(v.inv);v.b.y-=.04;v.b.z+=.03;
    v.m.copy(v.a).lerp(v.b,.5);v.m.y-=.07;MDL100_box(D,s*2,v.a,v.m,.008,.022);MDL100_box(D,s*2+1,v.m,v.b,.008,.022);
    D.hang[s].getWorldPosition(v.a).applyMatrix4(v.inv);foot.getWorldPosition(v.f).applyMatrix4(v.inv);
    v.q.set(0,-.06,.05).applyQuaternion(foot.getWorldQuaternion(v.Q)).applyQuaternion(v.Q2);v.f.add(v.q);v.f.y-=.012;
    v.b.copy(v.f);v.m.copy(v.f);v.m.y+=.12;MDL100_box(D,4+s,v.a,v.m,.008,.034);MDL100_stir(D,6+s*3,v.b)}
  MDL100_done(D)}
// the leg solver (zzN_creator_ride lkrSolve) measures the body once: reins / stirrups are hidden while it does
{const f=mountTick;mountTick=function(dt,now,al){
  const m=typeof mModel!='undefined'?mModel:null,D=m&&m.mdl,hid=D&&riding&&!m._lkL;if(hid)D.mesh.visible=false;
  const r=f.apply(this,arguments);
  if(hid)D.mesh.visible=true;
  try{if(D&&riding&&mModel===m)MDL100_ride(m)}catch(e){if(MDL100.err++<3)console.warn('v100 ride',e)}
  return r}}
{const f=dismount;dismount=function(){const m=typeof mModel!='undefined'?mModel:null;const r=f.apply(this,arguments);try{if(m&&m.mdl)MDL100_rest(m)}catch(_){}return r}}


// ================= v100 models track: proportion fixes outside the mounts =================
// Held weapons were sized for the pre-v99 hero (body 1.1 units); with the realistic hero (body ≈1.46) a greatsword was
// longer than the hero is tall (1.6), a halberd 2.0, a dagger 40% of body height. One-handed / two-handed melee weapons
// are scaled about the grip (the model origin), so every grip, carry pose, strike track and flail chain still lines up.
// Bows (riser/string constants), crossbows, slings, wands, orbs, claws and shields keep their size.
var MDL100_WS={sword:.86,gs:.8,ga:.86,axe:.9,axes:.9,mace:.86,hammer:.86,club:.9,flail:.86,dagger:.78,knives:.78,halberd:.88,staff:.9,spear:.9};
{const f=mkWpn;mkWpn=function(type,col,r){const g=f.apply(this,arguments);
  try{const k=MDL100.on&&MDL100_WS[type];if(k&&g&&g.children&&!g.userData.mdlS){g.userData.mdlS=k;g.children.forEach(c=>{c.position.multiplyScalar(k);c.scale.multiplyScalar(k)})}}catch(e){}
  return g}}
// Ashwolf family (Ashwolf, Direfang, Skollmaw, Snow Wolf): the hanging tail was as long as the body and as thick as the
// torso. Real wolf tails are ~1/3 of body length and slim at the root: 20% shorter, 28% slimmer (same bones and weights).
(function MDL100_wolfTail(){try{if(typeof WOLF_TAIL=='undefined')return;WOLF_TAIL.forEach(r=>{r[0]=-.33+(r[0]+.33)*.8;r[2]*=.72});
  for(const k in LPG)if(/^Ashwolf\|/.test(k))delete LPG[k]}catch(e){console.warn('v100 wolf tail',e)}})();
