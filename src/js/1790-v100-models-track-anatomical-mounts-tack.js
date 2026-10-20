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
// riding (zzN_creator_ride) and the Stable work unchanged. 
var MDL100={on:true,G:{},err:0,only:null}; // only: debug filter, build just these detail groups (test/v100 layer sheets)
var MDL100_TIER=[0x6a1a1a,0x2a3a5a,0x3a4a2a,0x4a2a5a,0x1a1a1e];
function MDL100_rig(k){if(!MDL100_S[k])return null;try{return MDL100_build(k)}catch(e){if(MDL100.err++<3)console.error('v100 mount',k,e);return null}}

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

