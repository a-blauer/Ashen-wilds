// ================= v110/v112 Sovereign 5 — Lord Vaelric, the Crimson King (The Citadel) =================
// The last Sovereign: a tall vampire lord in layered black-and-crimson plate — lamed pauldrons with a skull trophy, couters,
// poleyns and pointed sabatons, a belt of rivets, a crimson tabard, a baldric, glowing blood runes on the breastplate and
// vambraces, a high bladed collar over a dark mantle, a thorned crown with a ruby, pale fanged face, long white hair, a
// tattered three-panel cape and a long blood-forged flamberge with a glowing fuller. Every joint has a cap (shoulder,
// elbow, wrist, hip, knee, ankle balls under the plates) so no gap opens at any pose. In Phase II bat wings with finger
// bones and scalloped membranes tear free. Fast, precise, and every pattern has a rhythm.
// Pattern (learnable; every move has a cooldown, the AI never repeats itself):
//  close in front ── Crimson Combo: a slash, a backhand, a pause… and a thrust (dodge the third late). It may chain a Lunge.
//  mid           ── Crimson Lunge: he draws the blade back level with his eyes, then lunges a long line.
//  mid, front    ── Hemorrhage Grasp (v112): he draws his left claw back, then thrusts it — blood tendrils lash a narrow
//                   red cone; caught, you are dragged to his feet and he often follows with a combo. Step out sideways.
//  far           ── Blood Wave: an overhead cut that sends a crescent of blood travelling down a line.
//  any           ── Bat Step: he bursts into bats and re-forms at your side for a rising slash (listen for the bell).
//  close, any    ── Sanguine Nova: he plants the sword and kneels; a blood circle bursts around him.
//  close, any    ── Danse Macabre (v112): he coils low and trembles, then spins twice with the blade out — first a red
//                   circle close around him, then a wider red ring. Be far away, or step in right after the first cut.
//  Phase II (55%) "The Blood Moon": wings, a crimson aura; adds Skyfall (he rises, blood spears rain on your trail, then he
//                   plunges onto you), Triple Wave (three crescents fanning out), a five-hit combo, and
//                   Thorned Procession (v112): he raises the sword point-down overhead and drives it into the floor; five
//                   lanes of blood thorns race out toward you, then four more burst in the gaps between them.
// Weakness: posture. Hits fill the yellow bar; a break staggers him (+35% damage). Big moves have armour.
var VLR={col:0xff2040,blood:0xd01030,gold:0xd8b060,spk:null};
function vlrSpkMat(){return VLR.spk||(VLR.spk=new THREE.MeshStandardMaterial({color:0x5a0410,emissive:0x3a0008,roughness:.3,metalness:.45,flatShading:true}))}
// the breastplate surface (for straps, runes and the ridge that lie on it)
var VLR_CH=[[-.1,.42,.28],[.25,.52,.33],[.5,.55,.34],[.68,.42,.27]];
function vlrCS(x,y,d){const C=VLR_CH;let i=0;while(i<C.length-2&&y>C[i+1][0])i++;const a=C[i],b=C[i+1],k=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0]))),rx=a[1]+(b[1]-a[1])*k,rz=a[2]+(b[2]-a[2])*k;
  return [x,y,rz*Math.sqrt(Math.max(0,1-(x/rx)*(x/rx)))+(d||0)]}
// a star-shaped flat polygon (wing membranes): fan from the centroid
function vlrPoly(P){const c=[0,0,0];P.forEach(p=>{c[0]+=p[0]/P.length;c[1]+=p[1]/P.length;c[2]+=p[2]/P.length});const pos=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];pos.push(...c,...a,...b)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
// a cape panel with soft vertical folds (a strip of columns; the back of the cape is -z), optionally a ragged hem
function vlrCloth(w0,w1,h,rag,seed,dz){const r=svRng(seed),n=12,pos=[],T=[],B=[];for(let i=0;i<=n;i++){const u=i/n,x0=-w0+2*w0*u,x1=-w1+2*w1*u,f=Math.sin(u*Math.PI*4)*.045,c=-.06*Math.sin(u*Math.PI);
    T.push([x0,.06,c*.5+f*.3+(dz||0)]);B.push([x1,-h-(rag?(i%2?.1+r()*.2:r()*.05):0),c+f+(dz||0)])}
  for(let i=0;i<n;i++){const a=T[i],b=T[i+1],c=B[i+1],d=B[i];pos.push(...a,...c,...b,...a,...d,...c)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
function vlrBuild(R,e){
  const plate=svMat(R,0x1c1418,{roughness:.35,metalness:.65,emissive:0x0a0204}),plate2=svMat(R,0x4a0c18,{roughness:.4,metalness:.55,emissive:0x140206}),gold=svMat(R,0xb08a3a,{roughness:.35,metalness:.8}),
    skin=svMat(R,0xc4b8c2,{roughness:.6,emissive:0x080608}),cape=svMat(R,0x3e0610,{roughness:.8,side:THREE.DoubleSide,emissive:0x0a0104}),capeIn=svMat(R,0x1a0a10,{roughness:.9,side:THREE.DoubleSide}),
    steel=svMat(R,0x8a1424,{roughness:.2,metalness:.7,emissive:0x5a0614}),hair=svMat(R,0xe8e4ec,{roughness:.7}),mem=svMat(R,0x2a0810,{roughness:.7,side:THREE.DoubleSide,emissive:0x0a0004}),
    leath=svMat(R,0x24140f,{roughness:.85,metalness:.1}),eye=svGlowMat(R,0xff3050),rune=svGlowMat(R,0x8a1020);R.rune=rune;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),G=(k,f)=>svG('v2'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const ball=r=>G('ball'+r,()=>svLump(r,1,.05,60+Math.round(r*100))),RV=G('rv',()=>new THREE.IcosahedronGeometry(.026,0)),rv=(j,x,y,z,s)=>Mm(j,RV,gold,x,y,z,0,0,0,s||1);
  J('root',null,0,0,0);J('hips','root',0,1.8,0);J('spine','hips',0,.25,0);J('chest','spine',0,.6,0);
  // ---------------- hips: pelvis, rivet belt with a ruby buckle, side/back tassets, a skull trophy on a chain ----------------
  Mm('hips',G('hp',()=>svLoft([[-.22,.29,.22],[0,.36,.27],[.28,.33,.24]],10)),plate2);
  Mm('hips',G('blt',()=>svLoft([[.07,.385,.285],[.23,.37,.27]],12)),leath);
  Mm('hips',G('bkl',()=>svLump(.08,0,.15,61)),gold,0,.15,.29,0,0,0,1.25,1,.55);Mm('hips',G('bkg',()=>new THREE.OctahedronGeometry(.04,0)),rune,0,.15,.33,0,0,0,1,1.3,1);
  for(let k=0;k<12;k++){const a=k/12*6.283+.26;if(Math.cos(a)>.93)continue;rv('hips',Math.sin(a)*.39,.15,Math.cos(a)*.29)}
  [1.45,2.0,2.55,-1.45,-2.0,-2.55].forEach((a,k)=>Mm('hips',G('ts',()=>svBlade([[-.17,0],[.17,0],[.15,-.5],[0,-.62],[-.15,-.5]],.03)),plate,Math.sin(a)*.4,.12,Math.cos(a)*.3,-.18,a,0));
  [1.75,2.3,-1.75,-2.3].forEach(a=>Mm('hips',G('ts2',()=>svBlade([[-.12,0],[.12,0],[.1,-.36],[0,-.44],[-.1,-.36]],.025)),plate2,Math.sin(a)*.43,.06,Math.cos(a)*.33,-.22,a,0));
  [1.45,2.0,-1.45,-2.0].forEach(a=>rv('hips',Math.sin(a)*.43,.06,Math.cos(a)*.32));
  // a small skull hanging on the left hip
  Mm('hips',G('chn',()=>svTube([[0,0,0],[.04,-.08,.02],[.05,-.17,.02]],.012,4)),gold,.36,.1,.16);
  Mm('hips',G('skl',()=>svLump(.075,0,.12,62)),hair,.41,-.13,.18,0,0,0,1,1.1,1);Mm('hips',G('skj',()=>svLump(.05,0,.1,63)),hair,.41,-.2,.2,0,0,0,1,.6,.9);
  [-1,1].forEach(s=>Mm('hips',G('sko',()=>new THREE.OctahedronGeometry(.02,0)),eye,.41+s*.03,-.12,.25));
  // the crimson tabard (its own joint: it sways and lifts with the legs)
  J('tab','hips',0,.12,.3);
  Mm('tab',G('tb',()=>svBlade([[-.17,0],[.17,0],[.18,-.9],[.12,-1.02],[.05,-.92],[-.02,-1.06],[-.09,-.93],[-.18,-1.0]],.016)),cape,0,0,.01);
  [-1,1].forEach(s=>Mm('tab',G('tbt',()=>svBlade([[-.012,0],[.012,0],[.012,-.88],[-.012,-.88]],.02)),gold,s*.16,-.02,.02));
  Mm('tab',G('tbe',()=>svBlade([[0,.08],[.08,0],[0,-.14],[-.08,0]],.02)),gold,0,-.3,.025);Mm('tab',G('tbg',()=>new THREE.OctahedronGeometry(.035,0)),rune,0,-.3,.04);
  // ---------------- waist: three overlapping lames over a crimson under-plate ----------------
  Mm('spine',G('wa',()=>svLoft([[-.12,.28,.2],[.66,.41,.27]],9)),plate2);
  Mm('spine',G('ab0',()=>svLoft([[-.06,.305,.225],[.17,.315,.232]],10)),plate);
  Mm('spine',G('ab1',()=>svLoft([[.13,.325,.24],[.35,.345,.252]],10)),plate);
  Mm('spine',G('ab2',()=>svLoft([[.31,.355,.258],[.6,.44,.29]],10)),plate);
  [.06,.24].forEach(y=>[-1,1].forEach(s=>rv('spine',s*.24,y,.18,.8)));
  // ---------------- chest: breastplate, pectoral plates, ridge, ruby, blood-rune veins, baldric, gorget, collar, mantle ----------------
  Mm('chest',G('ch',()=>svLoft([[-.1,.42,.28],[.25,.52,.33,0,.02],[.5,.55,.34],[.68,.42,.27]],10)),plate);
  Mm('chest',G('trm',()=>svLoft([[-.11,.435,.292],[-.05,.455,.302]],12,{cap:false})),gold);
  [-1,1].forEach(s=>Mm('chest',G('pec',()=>svLump(.3,1,.08,51)),plate2,s*.21,.33,.23,0,s*.25,0,1.0,.85,.42));
  Mm('chest',G('rdg',()=>svBlade([[-.025,0],[.025,0],[.02,.42],[0,.48],[-.02,.42]],.03)),gold,0,-.06,vlrCS(0,.2)[2]-.01,-.08,0,0);
  Mm('chest',G('rbg',()=>new THREE.OctahedronGeometry(.07,0)),rune,0,.36,.4,0,0,0,.75,1.5,.55);Mm('chest',G('rbs',()=>svLump(.1,0,.1,64)),gold,0,.36,.35,0,0,0,1,1.3,.5);
  [-1,1].forEach(s=>{const P=[[.03,.24],[.1,.15],[.17,.1],[.25,.0],[.3,-.08]].map(([x,y])=>vlrCS(s*x,y,.012));Mm('chest',G('vn'+s,()=>svTube(P,[.016,.014,.012,.01,.007],4)),rune);
    const Q=[[.07,.16],[.12,.05],[.13,-.07]].map(([x,y])=>vlrCS(s*x,y,.012));Mm('chest',G('vm'+s,()=>svTube(Q,[.012,.01,.006],4)),rune)});
  {const P=[];for(let k=0;k<=8;k++){const u=k/8;P.push(vlrCS(-.5+u*.85,.6-u*.66,.03))}Mm('chest',G('bdr',()=>svTube(P,.035,4)),leath);
    [2,4,6].forEach(k=>rv('chest',P[k][0],P[k][1],P[k][2]+.03,1.1))}
  // the clasp chain across the collar
  [-1,1].forEach(s=>{const p=vlrCS(s*.3,.58,.02);Mm('chest',G('clp',()=>svLump(.06,0,.15,65)),gold,p[0],p[1],p[2],0,0,0,1,1,.6)});
  Mm('chest',G('chc',()=>svTube([vlrCS(-.3,.56,.04),vlrCS(-.15,.49,.05),vlrCS(0,.46,.08),vlrCS(.15,.49,.05),vlrCS(.3,.56,.04)],.014,4)),gold);
  Mm('chest',G('gor',()=>svLoft([[.58,.27,.22],[.7,.22,.18],[.8,.15,.13]],10)),plate2);Mm('chest',G('gtr',()=>svLoft([[.66,.235,.195],[.7,.235,.195]],10,{cap:false})),gold);
  for(let k=0;k<7;k++){const a=-2.4+k*.8;Mm('chest',G('cl',()=>svBlade([[-.11,0],[.11,0],[.08,.3],[0,.42],[-.07,.28]],.03)),plate2,Math.sin(a)*.3,.66,Math.cos(a)*.22-.05,-.5,a,0)}
  for(let k=0;k<6;k++){const a=-2.0+k*.8;Mm('chest',G('cl2',()=>svBlade([[-.05,0],[.05,0],[.035,.22],[0,.28],[-.035,.2]],.02)),gold,Math.sin(a)*.27,.68,Math.cos(a)*.2-.05,-.42,a,0)}
  for(let k=0;k<11;k++){const a=Math.PI+(k-5)*.3;Mm('chest',G('mn',()=>svBlade([[-.09,0],[.09,0],[.06,-.42],[0,-.52],[-.06,-.4]],.02)),capeIn,Math.sin(a)*.44,.72,Math.cos(a)*.3-.02,.35,a,0)}
  // ---------------- head: pale face, fangs, pointed ears, long white hair, a thorned crown with a ruby ----------------
  J('neck','chest',0,.7,.02);J('head','neck',0,.17,0);
  Mm('neck',G('nk',()=>svLoft([[-.1,.1,.1],[.24,.085,.085]],7)),skin);
  Mm('head',G('hd',()=>svLoft([[-.11,.06,.07,0,.04],[-.05,.1,.12,0,.02],[.05,.15,.16,0,.01],[.18,.16,.17],[.3,.13,.14],[.36,.06,.07]],8)),skin);
  Mm('head',G('nos',()=>svHorn(.026,.08,0,-.02,4,2)),skin,0,.13,.15,.45,0,0);
  Mm('head',G('brw',()=>svLump(.1,0,.1,66)),skin,0,.19,.13,0,0,0,1.6,.3,.45);
  [-1,1].forEach(s=>{Mm('head',G('chk',()=>svLump(.045,0,.15,67)),skin,s*.085,.1,.12,0,0,0,1,.8,.8);
    Mm('head',G('ear',()=>svHorn(.035,.17,0,.05,4,3)),skin,s*.14,.16,-.02,-.35,s*(Math.PI/2+.35),0);
    Mm('head',G('fng',()=>svHorn(.013,.06,0,0,4,1)),hair,s*.028,.04,.135,Math.PI/2,0,0);
    Mm('head',G('ey',()=>new THREE.SphereGeometry(.025,5,4)),eye,s*.06,.15,.15);svSpr(R,'head',VLR.col,.2,s*.06,.15,.17)});
  Mm('head',G('mth',()=>new THREE.BoxGeometry(.07,.012,.02)),plate,0,.06,.142);
  Mm('head',G('hr',()=>svLoft([[-.25,.12,.1,0,-.12],[.05,.19,.18,0,-.05],[.3,.18,.18],[.36,.1,.1]],8)),hair,0,0,-.02);
  for(let k=0;k<9;k++){const u=(k-4)/4;Mm('head',G('hs'+(k%3),()=>svBlade([[-.045,0],[.045,0],[.035,-.42-(k%3)*.06],[0,-.56-(k%3)*.06],[-.03,-.42]],.014)),hair,u*.15,.02,-.13+Math.abs(u)*.05,.22,u*.4,-u*.1)}
  [-1,1].forEach(s=>Mm('head',G('hl',()=>svBlade([[-.03,0],[.03,0],[.02,-.36],[0,-.44],[-.02,-.34]],.012)),hair,s*.15,.13,.04,.05,0,s*.08));
  Mm('head',G('cr',()=>svLoft([[0,.18,.18],[.07,.19,.19]],9,{cap:false})),gold,0,.3,0);
  for(let k=0;k<9;k++){const a=k/9*6.283;Mm('head',G('thn',()=>svHorn(.025,k%2?.18:.26,0,-.05,4,2)),gold,Math.sin(a)*.18,.34,Math.cos(a)*.18,-Math.PI/2+.3*Math.cos(a),a,0)}
  Mm('head',G('crg',()=>new THREE.OctahedronGeometry(.045,0)),rune,0,.36,.2,0,0,0,1,1.5,.7);
  // ---------------- arms: shoulder ball, three-lame pauldron with spikes and rivets, mail sleeve and rerebrace, couter,
  //                  vambrace with a rune line and a gold cuff, gauntlet (right: a fist round the grip; left: an open claw) ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*.55,.5,0,0,0,s*.1);
    Mm('sh'+L,ball(.135),plate2);
    Mm('sh'+L,G('pd',()=>svLump(.24,1,.15,52)),plate2,s*.05,.08,0,0,0,0,1.25,.85,1.1);
    Mm('sh'+L,G('pd2',()=>svLump(.22,1,.12,53)),plate,s*.1,-.06,0,0,0,s*.25,1.15,.6,1.05);
    Mm('sh'+L,G('pd3',()=>svLump(.2,1,.12,54)),plate2,s*.13,-.18,0,0,0,s*.35,1.0,.45,.95);
    for(let k=0;k<3;k++)Mm('sh'+L,G('ps',()=>svHorn(.05,.32,0,-.1,4,2)),gold,s*.12,.22,-.12+k*.12,-1.3,0,s*-.4);
    for(let k=0;k<5;k++){const a=(k-2)*.5;rv('sh'+L,s*(.13+.17*Math.abs(Math.sin(a))*0)+s*.2*Math.cos(a)*.55,-.02,Math.sin(a)*.24)}
    if(s>0){Mm('sh'+L,G('pskl',()=>svLump(.085,0,.12,68)),hair,s*.24,.02,.16,0,0,0,1,1.1,1);[-1,1].forEach(q=>Mm('sh'+L,G('psko',()=>new THREE.OctahedronGeometry(.018,0)),eye,s*.24+q*.03,.04,.24))}
    Mm('sh'+L,G('ua',()=>svLoft([[.06,.11,.11],[-.63,.09,.09]],8)),plate2);
    Mm('sh'+L,G('rb',()=>svLoft([[-.16,.118,.118],[-.34,.122,.122],[-.52,.105,.105]],8)),plate);
    J('el'+L,'sh'+L,0,-.6,0,-.15);Mm('el'+L,ball(.105),plate);
    Mm('el'+L,G('ctr',()=>svBlade([[-.1,0],[.1,0],[.06,.14],[0,.2],[-.06,.14]],.025)),plate2,0,0,-.09,Math.PI/2+.3,0,0);
    Mm('el'+L,G('cts',()=>svHorn(.035,.16,0,-.04,4,2)),gold,0,0,-.11,Math.PI,0,0);
    Mm('el'+L,G('fa',()=>svLoft([[.05,.09,.09],[-.44,.112,.102],[-.57,.088,.088]],8)),plate2);
    Mm('el'+L,G('cuf',()=>svLoft([[-.53,.12,.11],[-.4,.125,.115]],8)),gold);
    Mm('el'+L,G('far',()=>svHorn(.04,.3,0,.02,4,2)),plate,s*.09,-.05,0,Math.PI/2,0,0,1,1,1);
    Mm('el'+L,G('frn',()=>svTube([[0,-.08,.096],[0,-.2,.104],[0,-.33,.108]],.012,4)),rune);
    J('hd'+L,'el'+L,0,-.58,0);Mm('hd'+L,ball(.085),plate);
    Mm('hd'+L,G('hn',()=>svLump(.08,0,.2,53)),plate,0,-.07,0,0,0,0,1,1.4,.8);
    Mm('hd'+L,G('knk',()=>svLoft([[-.1,.07,.05],[-.06,.075,.055]],6)),gold,0,0,.01);
    if(s<0){Mm('hd'+L,G('fst',()=>svLump(.075,0,.15,69)),plate,0,-.12,.03,0,0,0,1.05,.85,1.2);Mm('hd'+L,G('thb',()=>svHorn(.025,.09,0,0,4,2)),plate,-.06,-.1,.06,0,-.4,0)}
    else{for(let k=0;k<4;k++)Mm('hd'+L,G('cw',()=>svHorn(.022,.2,0,-.08,4,4)),plate,-.045+k*.03,-.14,.02,Math.PI/2+.1,0,0);
      Mm('hd'+L,G('cwt',()=>svHorn(.024,.15,0,-.05,4,3)),plate,-.05,-.08,.06,Math.PI/2-.5,-.6,0)}});
  // the sword (right hand): a long blood-steel flamberge with a glowing fuller, a swept gold guard and a ruby pommel
  const sw=J('swd','hdR',0,-.1,.02,0,0,0);
  Mm(sw,G('gp',()=>svLoft([[-.32,.04,.04],[.02,.04,.04]],6)),leath,0,0,0,Math.PI/2,0,0);
  [-.27,-.18,-.09].forEach(z=>Mm(sw,G('gw',()=>svLoft([[-.015,.047,.047],[.015,.047,.047]],6)),gold,0,0,z,Math.PI/2,0,0));
  Mm(sw,G('pm',()=>svLump(.07,0,.2,70)),gold,0,0,-.36);Mm(sw,G('pmg',()=>new THREE.OctahedronGeometry(.05,0)),rune,0,0,-.42);
  Mm(sw,G('gd',()=>svBlade([[-.38,.12],[-.3,0],[.3,0],[.38,.12],[.22,.06],[0,.15],[-.22,.06]],.05)),gold,0,.02,0,Math.PI/2,0,0);
  [-1,1].forEach(s=>Mm(sw,G('qt',()=>svHorn(.03,.14,0,.05,4,2)),gold,s*.37,0,.12,0,0,0));
  Mm(sw,G('ggm',()=>new THREE.OctahedronGeometry(.045,0)),rune,0,.0,.1);
  Mm(sw,G('bl',()=>svBlade([[-.075,0],[.075,0],[.065,1.25],[.092,1.42],[.062,1.6],[.03,2.2],[0,2.42],[-.03,2.2],[-.062,1.6],[-.092,1.42],[-.065,1.25]],.025)),steel,0,.06,0,Math.PI/2,0,0);
  Mm(sw,G('fl',()=>svBlade([[-.016,.12],[.016,.12],[.012,1.5],[0,1.62],[-.012,1.5]],.05)),rune,0,.06,0,Math.PI/2,0,0);
  Mm(sw,G('lng',()=>svBlade([[-.09,0],[.09,0],[.04,.2],[0,.26],[-.04,.2]],.045)),gold,0,.08,0,Math.PI/2,0,0);
  // ---------------- legs: hip ball, mail thigh with a cuisse, front tassets that follow the leg, a strap; knee ball and
  //                  poleyn with a side fan; greave with a gold ridge; ankle ball and a pointed sabaton with lames and a spur ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('th'+L,'hips',s*.18,-.1,0);
    Mm('th'+L,ball(.15),plate2);
    Mm('th'+L,G('tg',()=>svLoft([[.1,.15,.16],[-.4,.152,.162],[-.88,.105,.115]],8)),plate2);
    Mm('th'+L,G('cui',()=>svLump(.16,0,.14,55)),plate,0,-.36,.07,0,0,0,.95,1.6,.62);
    Mm('th'+L,G('tf1',()=>svBlade([[-.16,0],[.16,0],[.14,-.3],[-.14,-.3]],.03)),plate,s*.02,.1,.19,-.22,0,0);
    Mm('th'+L,G('tf2',()=>svBlade([[-.15,0],[.15,0],[.12,-.26],[0,-.33],[-.12,-.26]],.025)),plate2,s*.02,-.14,.2,-.16,0,0);
    [-1,1].forEach(q=>rv('th'+L,s*.02+q*.11,.06,.215));
    Mm('th'+L,G('stp',()=>svLoft([[-.6,.128,.138],[-.54,.13,.14]],8)),leath);rv('th'+L,s*.12,-.57,.06,1.2);
    J('kn'+L,'th'+L,0,-.84,0);Mm('kn'+L,ball(.115),plate);
    Mm('kn'+L,G('kp',()=>svLump(.1,0,.2,54)),plate2,0,0,.09);Mm('kn'+L,G('kps',()=>svHorn(.035,.12,0,.03,4,2)),gold,0,.02,.17,0,0,0);
    Mm('kn'+L,G('kf',()=>svBlade([[0,.1],[.12,.03],[.14,-.06],[0,-.1]],.02)),gold,s*.11,0,.02,0,s>0?0:Math.PI,0);
    Mm('kn'+L,G('sh',()=>svLoft([[.06,.1,.11],[-.3,.112,.125,0,.01],[-.86,.086,.096]],8)),plate2);
    Mm('kn'+L,G('srd',()=>svBlade([[-.018,0],[.018,0],[.012,-.62],[-.012,-.62]],.025)),gold,0,-.12,.128,.03,0,0);
    J('ft'+L,'kn'+L,0,-.82,0);Mm('ft'+L,ball(.095),plate);
    Mm('ft'+L,G('ft',()=>svLoftZ([[-.13,.085,.085,0,.035],[0,.095,.09,0,.04],[.12,.085,.065,0,.015],[.24,.07,.045,0,-.005],[.34,.035,.025,0,-.025]],7)),plate,0,0,0);
    [.06,.15].forEach(z=>Mm('ft'+L,G('fl'+z,()=>svLoftZ([[z-.035,.093,.08,0,.03],[z+.035,.088,.07,0,.02]],7,{cap:false})),gold,0,0,0));
    Mm('ft'+L,G('toe',()=>svHorn(.03,.14,0,-.03,4,2)),plate2,0,-.03,.32);Mm('ft'+L,G('spr',()=>svHorn(.02,.14,0,.03,4,2)),gold,0,.02,-.12,0,Math.PI,0)});
  // ---------------- cape: a rolled collar, three panels (lined) with a ragged hem ----------------
  J('cp0','chest',0,.62,-.3,.06);J('cp1','cp0',0,-.85,0);J('cp2','cp1',0,-.85,0);
  Mm('cp0',G('crl',()=>svLump(.2,0,.1,71)),capeIn,0,.02,.02,0,0,0,2.6,.5,.6);
  [['cp0',.5,.64,0],['cp1',.64,.76,0],['cp2',.76,.86,1]].forEach(([n,w0,w1,rg],q)=>{Mm(n,G('c'+n,()=>vlrCloth(w0,w1,.92,rg,5,0)),cape);Mm(n,G('ci'+n,()=>vlrCloth(w0-.02,w1-.02,.9,rg,5,.025)),capeIn);
    [-1,1].forEach(s=>Mm(n,G('ct'+n+s,()=>svTube([[s*w0,.06,0],[s*w1,-.88,0]],.016,4)),gold))});
  Mm('cp0',G('cem',()=>svBlade([[0,.16],[.1,.04],[.34,.14],[.26,-.04],[.12,-.06],[0,-.24],[-.12,-.06],[-.26,-.04],[-.34,.14],[-.1,.04]],.015)),gold,0,-.5,-.075,0,Math.PI,0);
  Mm('cp0',G('cemg',()=>new THREE.OctahedronGeometry(.05,0)),rune,0,-.48,-.09,0,0,0,1,1.4,.6);
  // ---------------- bat wings (Phase II): arm bone, wrist knuckle and thumb claw, four finger bones, scalloped membranes ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R';const w=J('wg'+L,'chest',s*.2,.45,-.3,0,s*.35,0),E=[s*1.15,.55,0];
    Mm(w,G('wb'+L,()=>svTube([[0,0,0],[s*.6,.36,-.04],E],[.075,.06,.05],5)),leath);
    Mm(w,G('wk',()=>svLump(.075,0,.15,72)),leath,E[0],E[1],E[2]);Mm(w,G('wt'+L,()=>svHorn(.035,.22,0,.08,4,3)),hair,E[0],E[1]+.04,E[2],-1.2,s*.3,0);
    Mm(w,G('wm'+L,()=>vlrPoly([[0,0,0],E,[E[0],-.75,0],[s*.75,-.52,0],[s*.38,-.78,0],[s*.12,-.6,0]])),mem);
    const f=J('wf'+L,w,E[0],E[1],E[2]),T=[[s*1.25,.35,-.04],[s*1.0,-.55,-.04],[s*.55,-1.1,-.02],[0,-1.3,0]];
    T.forEach((t,k)=>Mm(f,G('wfb'+L+k,()=>svTube([[0,0,0],[t[0]*.5,t[1]*.5+.05,t[2]*.5],t],[.045,.03,.012],4)),leath));
    Mm(f,G('wcl'+L,()=>svHorn(.025,.16,0,-.06,4,3)),hair,T[0][0],T[0][1],T[0][2],0,s*Math.PI/2,0);
    const P=[[0,0,0]];T.forEach((t,k)=>{P.push(t);if(k<T.length-1){const n=T[k+1];P.push([(t[0]+n[0])*.36,(t[1]+n[1])*.36,(t[2]+n[2])*.5])}});
    Mm(f,G('wfm'+L,()=>vlrPoly(P)),mem);
    w.scale.setScalar(.01);R['wing'+L]=w});
}
function vlrWings(R,k){['L','R'].forEach(s=>{const w=R['wing'+s];w.scale.setScalar(Math.max(.01,k));w.visible=k>.02})}
function vlrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.2);S.gp=(S.gp||0)+dt*(2+S.spd*2.3);const g=S.gp;
  O.hips[4]+=.03*Math.sin(t*1.4)+.05*Math.abs(Math.sin(g))*a;O.chest[0]+=.015*Math.sin(t*1.4);O.head[1]+=.08*Math.sin(t*.5);
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.6*a,lf=Math.max(0,Math.cos(ph))*.8*a;O['th'+s][0]+=-sw;O['kn'+s][0]+=lf;O['ft'+s][0]+=-lf*.2});
  // guard stance: sword held low and forward, left claw open
  O.shR[0]+=-.45+.04*Math.sin(t*1.2);O.shR[2]+=-.15;O.elR[0]+=-.75;O.hdR[0]+=.25;O.shL[0]+=.15*Math.sin(g)*a+.1;O.shL[2]+=.18;O.elL[0]+=-.3;O.hdL[0]+=.1+.05*Math.sin(t*1.7);
  O.cp0[0]+=.15+.06*Math.sin(t*1.6)+.4*a;O.cp1[0]+=.05+.05*Math.sin(t*1.6-.8)+.15*a;O.cp2[0]+=.04*Math.sin(t*1.6-1.6)+.1*a;O.tab[0]+=.03*Math.sin(t*1.6+.5)-.12*a;
  if(S.ph>1){const fl=S.mv&&S.mv.id==='skyfall'?Math.sin(t*9)*.45:.12*Math.sin(t*1.8);O.wgL[1]+=fl;O.wgR[1]-=fl;O.wgL[2]+=fl*.5;O.wgR[2]-=fl*.5;
    const fo=.15+.12*Math.sin(t*1.8-.6);O.wfL[1]+=fo;O.wfR[1]-=fo}}
function vlrPost(e,S,dt,now){const R=S.R,on=S.ph>1,O=S.O;S.wk=Math.min(1,(S.wk||0)+(on?dt*1.2:-dt*3));vlrWings(R,on?svEase.o(Math.max(0,S.wk)):0);
  const pu=.5+.5*Math.sin(now/260);R.rune.color.setHex(on?0xff3050:0x8a1020);if(on)R.rune.color.lerp(SVX.vlW||(SVX.vlW=new THREE.Color(0xff9aa8)),pu*.35);
  // cloth follows the body: the tabard lifts with a raised thigh, the cape clears the floor when he crouches
  const J=R.J,lift=Math.max(0,-O.thL[0],-O.thR[0]);J.tab.rotation.x+=-Math.min(1.3,lift*.85)-Math.max(0,-O.hips[0])*.5;
  J.cp0.rotation.x+=Math.min(.7,Math.max(0,-O.hips[4]-.15)*.7+Math.max(0,O.spine[0]+O.chest[0]-.1)*.4);
  e.m.visible=!S.gone&&e.m.visible;
  if(on&&Math.random()<dt*10){const p=svWP(e,'chest',(Math.random()-.5)*.8,(Math.random()-.5)*1.2,0);burst(p,VLR.blood,1,.4,.6,.7)}}
var VLRP={
  // crimson combo: slash (right to left), backhand (left to right), thrust
  s1Up:{hips:[0,-.35,0],chest:[0,-.45,0],shR:[-1.2,0,-1.25],elR:[-.6,0,0],hdR:[1.25,0,0],shL:[-.4,0,.4],head:[0,.3,0],thL:[-.4,0,0],knL:[.4,0,0]},
  s1Hit:{hips:[0,.45,0,0,-.05,.25],chest:[.1,.55,0],shR:[-1.45,0,.55],elR:[-.1,0,0],hdR:[1.3,0,0],shL:[-.2,0,.8],head:[0,-.3,0],thL:[-.6,0,0],knL:[.5,0,0],thR:[.3,0,0]},
  s2Hit:{hips:[0,-.5,0,0,-.05,.3],chest:[.1,-.6,0],shR:[-1.0,0,-1.45],elR:[-.2,0,0],hdR:[1.3,0,0],shL:[-.4,0,.3],head:[0,.35,0],thR:[-.6,0,0],knR:[.5,0,0],thL:[.3,0,0]},
  thUp:{hips:[0,.4,0,0,0,-.25],chest:[0,.55,0],shR:[-.35,0,-.25],elR:[-1.9,0,0],hdR:[.5,0,0],shL:[-1.3,0,.6],elL:[-.3,0,0],head:[0,-.4,0],thR:[.3,0,0],thL:[-.4,0,0],knL:[.5,0,0]},
  thHit:{hips:[.1,-.15,0,0,-.15,.55],chest:[.15,-.2,0],shR:[-1.55,0,-.05],elR:[0,0,0],hdR:[0,0,0],shL:[.3,0,.4],head:[0,.1,0],thL:[-1.0,0,0],knL:[.7,0,0],thR:[.55,0,0],knR:[.1,0,0]},
  cRec:{hips:[0,0,0],shR:[-.8,0,-.2],elR:[-.6,0,0],hdR:[.2,0,0]},
  // lunge: sword drawn back level with the eyes
  lDraw:{hips:[0,.6,0,0,-.15,-.2],chest:[0,.5,0],shR:[-1.5,0,-.6],elR:[-1.8,0,0],hdR:[.9,0,0],shL:[-1.4,0,.1],elL:[-.2,0,0],head:[0,-.5,0],thL:[-.8,0,0],knL:[1.0,0,0],thR:[.4,0,0],knR:[.6,0,0]},
  lGo:{hips:[.2,-.1,0,0,-.35,.3],chest:[.15,-.15,0],shR:[-1.6,0,0],elR:[0,0,0],hdR:[0,0,0],shL:[.5,0,.5],head:[-.1,.1,0],thL:[-1.2,0,0],knL:[.6,0,0],thR:[.8,0,0],knR:[.3,0,0],cp0:[.9,0,0],cp1:[.3,0,0]},
  // blood wave: overhead cut
  wUp:{chest:[-.2,0,0],shR:[-2.9,0,-.15],elR:[-.4,0,0],hdR:[-.4,0,0],shL:[-2.7,0,.2],elL:[-.5,0,0],head:[-.2,0,0],thR:[.2,0,0],thL:[-.3,0,0]},
  wDn:{hips:[.1,0,0,0,-.2,.2],chest:[.4,0,0],shR:[-1.0,0,-.1],elR:[0,0,0],hdR:[.3,0,0],shL:[-.9,0,.2],head:[.25,0,0],thL:[-.6,0,0],knL:[.6,0,0],thR:[.3,0,0]},
  // rising slash (after the bat step)
  rLow:{hips:[0,.3,0,0,-.35,0],chest:[.3,.3,0],shR:[.4,0,-.4],elR:[-.3,0,0],hdR:[.4,0,0],shL:[-.3,0,.4],thL:[-.8,0,0],knL:[1.3,0,0],thR:[-.2,0,0],knR:[.9,0,0],head:[.1,-.2,0]},
  rHigh:{hips:[0,-.3,0,0,.1,0],chest:[-.25,-.4,0],shR:[-2.6,0,-.4],elR:[0,0,0],hdR:[-.2,0,0],shL:[-.3,0,.6],head:[-.3,.2,0],thR:[.2,0,0]},
  // sanguine nova: plant and kneel
  kneel:{hips:[0,0,0,0,-.85,0],spine:[.2,0,0],chest:[.15,0,0],shR:[-.9,0,-.05],elR:[-.3,0,0],hdR:[1.5,0,0],shL:[-.9,0,.05],elL:[-.3,0,0],thL:[-1.6,0,0],knL:[1.6,0,0],thR:[.3,0,0],knR:[1.9,0,0],ftR:[-.3,0,0],head:[.3,0,0]},
  rise:{hips:[0,0,0,0,.05,0],chest:[-.35,0,0],shR:[-1.8,0,-1.0],elR:[0,0,0],shL:[-1.8,0,1.0],head:[-.5,0,0],cp0:[.4,0,0]},
  // skyfall
  sUp:{root:[0,0,0,0,7,0],hips:[-.2,0,0],shR:[-1.8,0,-.4],elR:[-.2,0,0],shL:[-1.4,0,.8],thL:[-.4,0,0],knL:[.8,0,0],thR:[.1,0,0],knR:[.5,0,0],cp0:[.6,0,0]},
  sDive:{root:[0,0,0,0,0,0],hips:[.4,0,0,0,-.4,0],chest:[.4,0,0],shR:[-.5,0,-.05],elR:[0,0,0],hdR:[1.4,0,0],shL:[-.6,0,.4],thL:[-1.4,0,0],knL:[1.5,0,0],thR:[.2,0,0],knR:[1.6,0,0]},
  roar:{chest:[-.35,0,0],head:[-.55,0,0],shR:[-1.6,0,-1.1],elR:[-.2,0,0],shL:[-1.6,0,1.1],elL:[-.2,0,0],cp0:[.7,0,0],cp1:[.3,0,0]},
  bow:{hips:[0,0,0,0,-.05,0],chest:[.35,0,0],head:[.4,0,0],shR:[-.4,0,-.5],elR:[-.5,0,0],shL:[.3,0,.3],elL:[-1.3,0,0]},
  stag:{hips:[.1,0,.1,0,-.55,0],spine:[.3,0,.1],chest:[.3,0,0],head:[.5,0,.3],shR:[.3,0,-.3],elR:[-.2,0,0],hdR:[1.2,0,0],shL:[.1,0,.4],thL:[-1.3,0,0],knL:[1.6,0,0],thR:[-.2,0,0],knR:[1.2,0,0]},
  dead:{root:[0,0,0,0,-1.5,0],hips:[-.3,0,0,0,0,0],spine:[-.2,0,0],chest:[-.4,0,0],head:[-.4,.4,0],shR:[-.4,0,-1.2],shL:[-.3,0,1.3],thL:[-1.5,0,0],knL:[1.8,0,0],thR:[-1.4,0,0],knR:[1.9,0,0]},
  // ---- v112: Hemorrhage Grasp — draw the claw back, thrust it out, yank it home ----
  gReach:{hips:[0,.4,0,0,-.12,0],spine:[-.08,.1,0],chest:[-.12,.25,0],head:[0,-.55,0],shL:[.75,0,.55],elL:[-1.3,0,0],hdL:[.4,0,-.3],shR:[-.35,0,-.55],elR:[-.45,0,0],hdR:[.7,0,0],
    thL:[-.55,0,0],knL:[.65,0,0],ftL:[-.1,0,0],thR:[.35,0,0],knR:[.35,0,0],cp0:[.3,0,0]},
  gThrust:{hips:[.08,-.3,0,0,-.22,.3],spine:[.08,-.05,0],chest:[.12,-.15,0],head:[-.05,.3,0],shL:[-1.6,0,.05],elL:[.1,0,0],hdL:[-.5,0,0],shR:[.35,0,-.45],elR:[-.3,0,0],hdR:[.5,0,0],
    thL:[-1.0,0,0],knL:[.75,0,0],ftL:[.2,0,0],thR:[.55,0,0],knR:[.25,0,0],cp0:[.6,0,0],cp1:[.2,0,0]},
  gYank:{hips:[0,.3,0,0,-.08,-.1],chest:[-.15,.4,0],head:[-.1,-.35,0],shL:[-.5,0,.35],elL:[-1.9,0,0],hdL:[.7,0,0],shR:[-1.1,0,-1.15],elR:[-.7,0,0],hdR:[1.0,0,0],
    thL:[-.3,0,0],knL:[.4,0,0],thR:[.2,0,0],knR:[.2,0,0]},
  // ---- v112: Danse Macabre — a low coil, the blade held out flat for the spin, a sweeping finish ----
  dmCoil:{hips:[0,-.75,0,0,-.42,0],spine:[.1,-.25,0],chest:[.15,-.45,0],head:[.05,.95,0],shR:[.55,0,-.75],elR:[-.55,0,0],hdR:[1.1,0,0],shL:[-1.35,0,.35],elL:[-.35,0,0],
    thL:[-.85,0,0],knL:[1.4,0,0],ftL:[-.45,0,0],thR:[-.3,0,0],knR:[1.3,0,0],ftR:[-.6,0,0],cp0:[.2,0,0],cp1:[.15,0,0]},
  dmOut:{hips:[0,0,0,0,-.1,0],chest:[-.05,0,0],head:[0,0,0],shR:[-.1,0,-1.5],elR:[0,0,0],hdR:[1.57,0,0],shL:[-.1,0,1.35],elL:[-.2,0,0],hdL:[0,0,0],
    thL:[-.3,0,0],knL:[.6,0,0],ftL:[-.2,0,0],thR:[-.2,0,0],knR:[.55,0,0],ftR:[-.2,0,0],cp0:[1.1,0,0],cp1:[.35,0,0],cp2:[.2,0,0],tab:[-.6,0,0]},
  dmEnd:{hips:[.05,.55,0,0,-.35,.2],spine:[.05,.15,0],chest:[.15,.4,0],head:[0,-.6,0],shR:[-1.1,0,.75],elR:[-.15,0,0],hdR:[1.2,0,0],shL:[.3,0,.7],elL:[-.4,0,0],
    thL:[-.9,0,0],knL:[1.0,0,0],thR:[.4,0,0],knR:[.6,0,0],cp0:[.4,0,0]},
  // ---- v112: Thorned Procession — the sword raised point-down overhead in both hands, then driven into the floor ----
  tpRaise:{hips:[0,0,0,0,.08,0],spine:[-.1,0,0],chest:[-.25,0,0],head:[-.35,0,0],shR:[-2.5,0,.6],elR:[-.3,0,0],hdR:[1.6,-.5,0],shL:[-2.5,0,-.6],elL:[-.3,0,0],hdL:[1.3,0,0],
    thL:[-.15,0,0],knL:[.15,0,0],ftL:[.25,0,0],thR:[.1,0,0],ftR:[.3,0,0],wgL:[0,-.35,.25],wgR:[0,.35,-.25],cp0:[.35,0,0]},
  tpPlunge:{hips:[0,0,0,0,-.8,.15],spine:[.25,0,0],chest:[.3,0,0],head:[-.4,0,0],shR:[-.85,0,.6],elR:[-.05,0,0],hdR:[1.17,-.5,0],shL:[-.85,0,-.6],elL:[-.05,0,0],hdL:[.8,0,0],
    thL:[-1.45,0,0],knL:[1.35,0,0],ftL:[.1,0,0],thR:[.2,0,0],knR:[1.75,0,0],ftR:[-.35,0,0],cp0:[.7,0,0],cp1:[.25,0,0],wgL:[0,-.2,.45],wgR:[0,.2,-.45]}};
function vlrWave(c,a0,spd,L,dm){const e=c.e,o=c.m.position.clone(),a=c.m.rotation.y+a0;const g=svG('vl_cres',()=>{const q=new THREE.RingGeometry(1.0,1.6,14,1,-1.1+Math.PI/2,2.2);q.rotateX(-Math.PI/2);return q});
  const m=new THREE.MeshBasicMaterial({color:VLR.col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,m);ms.renderOrder=24;ms.userData.lpsSkip=1;scene.add(ms);
  let t=0,hit=false;const T=L/spd;svSnd('blood',.9,1.2);
  kqFx({tick(dt){t+=dt||0;const d=1+spd*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+1.0,p.z);ms.rotation.y=a+Math.PI;ms.scale.set(1.3,1,1);
    if(Math.random()<.9)burst(gY(p,1),VLR.blood,3,1,.8,.5);if(!hit&&AF&&!e.dead&&svIn({k:'l',w:3.4,l:1.6,b:.8},{x:p.x,z:p.z,a},pl.position,.3)){hit=true;svHitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a},dm,{flash:false})}
    return t<T&&!e.dead},end(){scene.remove(ms);m.dispose()}})}
function vlrSpear(c,q,T){const e=c.e,S2={k:'c',r:1.5},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const m=new THREE.Mesh(svG('vl_sp',()=>{const g=new THREE.ConeGeometry(.16,2.6,5);g.rotateX(Math.PI/2);return g}),kqBas(VLR.blood));
  svShot(new THREE.Vector3(q.x+(c.rnd()-.5)*3,GH(q.x,q.z)+14,q.z+(c.rnd()-.5)*3),new THREE.Vector3(q.x,GH(q.x,q.z)+.4,q.z),T,VLR.col,1.1,0,P=>{if(e.dead||!AF)return;burst(P,VLR.blood,20,2.2,2.5,.5);svDecal(P,0x4a0008,1.4,3,.6);svSnd('crack',.6,1.4);svHitNow(e,S2,an,.85,{col:VLR.col})},m)}
function vlrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;const p=e.m.position;for(let k=0;k<24;k++)burst(gY(p,1+Math.random()*2.2),0x1a0408,2,2.5,1.5,.9);burst(gY(p,1.8),VLR.blood,30,2,2,.6);svSnd('whoosh',.8,1.4)}
// ---- v112 effects ----
// Hemorrhage Grasp: five barbed blood tendrils shoot from the left claw along the cone; a caught hero is reeled in by the middle one
function vlrTendrils(c,an,hit){const e=c.e,o=svWP(e,'hdL',0,-.16,.04),N=5,L=9.2,mat=new THREE.MeshBasicMaterial({color:0xb0102a,fog:false}),
  g=svG('vl2_tnd',()=>{const P=[],r=[];for(let k=0;k<=7;k++){const u=k/7;P.push([Math.sin(u*9)*.06*(1-u),Math.cos(u*7)*.05*(1-u),u]);r.push(.11*(1-u*.9))}return svTube(P,r,5)}),T=[];
  for(let k=0;k<N;k++){const a=an.a+(k-(N-1)/2)*.15,l=L*(k===2?1:.82+.06*Math.abs(k-2)),ms=new THREE.Mesh(g,mat);ms.position.copy(o);ms.userData.lpsSkip=1;ms.renderOrder=19;ms.frustumCulled=false;scene.add(ms);
    const tip=new THREE.Vector3(an.x+Math.sin(a)*l,GH(an.x,an.z)+1.0,an.z+Math.cos(a)*l);T.push({ms,tip})}
  let t=0;svSnd('blood',1,.8);svSnd('hiss',.7,.7);
  kqFx({tick(dt){t+=dt||0;const p=svWP(e,'hdL',0,-.16,.04);
    const ext=t<.13?svEase.o(t/.13):t<(hit?.62:.4)?1:Math.max(0,1-svEase.io((t-(hit?.62:.4))/.28));
    T.forEach((q,k)=>{let tip=q.tip;if(hit&&k===2){tip=gY(pl.position,1.0)}q.ms.position.copy(p);const d=tip.clone().sub(p),len=Math.max(.01,d.length()*ext);q.ms.lookAt(tip);q.ms.scale.set(1,1,len);
      if(ext>.9&&Math.random()<.25){const b=p.clone().addScaledVector(d,Math.random()*ext);burst(b,VLR.blood,1,.5,.4,.4)}});
    return t<(hit?.95:.72)&&!e.dead},end(){T.forEach(q=>scene.remove(q.ms));mat.dispose()}})}
// Danse Macabre: a crescent of blood that trails the blade round the spin
function vlrCrescent(c,T){const e=c.e,m=c.m,g=svG('vl2_dmc',()=>{const q=new THREE.RingGeometry(1.1,4.5,22,1,-Math.PI/2-1.1,1.1);q.rotateX(-Math.PI/2);return q}),
  mt=new THREE.MeshBasicMaterial({color:VLR.col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,mt);ms.renderOrder=24;ms.userData.lpsSkip=1;scene.add(ms);let t=0;
  kqFx({tick(dt){t+=dt||0;const k=t/T;ms.position.set(m.position.x,GH(m.position.x,m.position.z)+1.55,m.position.z);ms.rotation.y=m.rotation.y-Math.PI/2;mt.opacity=.75*Math.sin(Math.min(1,k)*Math.PI);
    if(Math.random()<.7)burst(svWP(e,'swd',0,0,2.2),VLR.blood,2,2.5,.6,.5);return t<T&&!e.dead},end(){scene.remove(ms);mt.dispose()}})}
// Thorned Procession: a lane of blood thorns erupting one after another away from the sword; hits once per lane
function vlrThorns(c,an,dm){const e=c.e,A=c.A,N=12,step=1.35,mat=vlrSpkMat(),sa=Math.sin(an.a),ca=Math.cos(an.a);let t=0,k=0,hit=false;
  kqFx({tick(dt){t+=dt||0;while(k<N&&t>=k*.055){const d=k*step,x=an.x+sa*d,z=an.z+ca*d;k++;if(A&&Math.hypot(x-A.cx,z-A.cz)>ARENA_R-1){k=N;break}
      const p=new THREE.Vector3(x,0,z);svSpike(p,mat,1.6+(k%3)*.25,.3,.9,.5);const sd=(k%2?1:-1)*.5;svSpike(new THREE.Vector3(x+ca*sd,0,z-sa*sd),mat,.9,.18,.75,.7);
      if(k%2)svDecal(p,0x3a0008,1.1,1.6,.5);burst(gY(p,.4),VLR.blood,4,2,2,.4);if(k%3===1)svSnd('crack',.5,1.1+k*.04);
      if(!hit&&AF&&!e.dead&&svIn({k:'c',r:.75},{x,z,a:0},pl.position,.3)){hit=true;svHitNow(e,{k:'c',r:99},{x,z,a:0},dm,{flash:false})}}
    return k<N&&!e.dead},end(){}})}
var VLRM={
  intro:{dur:3.0,trk:[[.5,'bow','io'],[1.3,'bow','l',.005],[1.9,'rise','o'],[2.6,'rise','l'],[3.0,'cRec','io']],trn:[[0,3,1]],
    ev:[[.4,c=>svSnd('bell',.7,.8)],[1.85,c=>{svSnd('blood',1,.6);svSnd('shriek',.5,1.4);shake(.3);svShock(c.m.position,VLR.col,8,.7);flash('rgba(200,20,40,.25)')}]]},
  combo:{wt:10,cd:2.5,r:[0,6.2],a:'f',mel:1,dur:2.35,lock:.38,trn:[[0,.38,5],[.75,.85,5],[1.2,1.5,4]],
    trk:[[.38,'s1Up','io'],[.5,'s1Up','l',.01],[.62,'s1Hit','s'],[.82,'s1Hit','l'],[.98,'s2Hit','s'],[1.3,'thUp','io'],[1.55,'thUp','l',.012],[1.68,'thHit','s'],[2.0,'cRec','io'],[2.35,'cRec','l']],
    rm:[[.55,.66,1,'o'],[.9,1.0,.8,'o'],[1.6,1.72,2.5,'o']],
    hit:[{t:.61,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:.97,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:1.68,s:{k:'l',w:1.6,l:6.5,b:0},f:.4,dm:1.3,w:.38}],
    tr:[[.52,.7,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[1.58,1.75,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.55,c=>svSnd('swing',.8,1.3)],[.9,c=>svSnd('swing',.8,1.4)],[1.62,c=>svSnd('whoosh',.8,1.6)]],nx:[['lunge',.25,9]],rec:.25},
  lunge:{wt:8,cd:5,r:[4.5,15],a:'f',dur:1.9,lock:.7,armor:1,trn:[[0,.7,5]],trk:[[.55,'lDraw','io'],[.8,'lDraw','l',.012],[.95,'lGo','s'],[1.3,'lGo','l'],[1.9,'cRec','io']],
    rm:[[.86,1.1,'tgt','o',-1.5,14]],hit:[{t:1.0,s:{k:'l',w:2.2,l:15,b:0},f:0,dm:1.4,w:.6}],tr:[[.86,1.15,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],
    ev:[[.3,c=>svSnd('hum',.4,1.6)],[.86,c=>{svSnd('whoosh',1.1,1.1);burst(gY(c.m.position,1),VLR.blood,30,3,1,.6)}]],rec:.4},
  wave:{wt:8,cd:5,r:[6.5,40],a:'f',dur:1.9,lock:.75,trn:[[0,.75,4]],trk:[[.6,'wUp','io'],[.85,'wUp','l',.015],[.98,'wDn','s'],[1.4,'wDn','l'],[1.9,'cRec','io']],
    hit:[{t:.96,s:{k:'l',w:3.4,l:22,b:0},f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,0,16,22,1.2)}],tr:[[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.88,c=>svSnd('swing',1,1)]],rec:.35},
  batstep:{wt:7,cd:10,r:[0,40],a:'any',dur:2.6,armor:1,inv:[.35,1.35],trn:[[0,.1,1]],trk:[[.3,'bow','io'],[1.35,'rLow','io'],[1.65,'rLow','l',.012],[1.8,'rHigh','s'],[2.2,'cRec','io'],[2.6,'cRec','l']],
    ev:[[.32,c=>vlrGone(c.e,true)],[1.3,c=>{const e=c.e,m=e.m,a=svYawTo(m,pl.position)+(c.rnd()<.5?1.4:-1.4),q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.sin(a)*3.2,0,Math.cos(a)*3.2)),2);
      m.position.set(q.x,0,q.z);m.rotation.y=svYawTo(m,pl.position);vlrGone(e,false);svSnd('bell',.9,1.3)}]],
    hit:[{t:1.78,s:{k:'a',r:5.2,h:.9},f:0,dm:1.3,w:.45}],tr:[[1.68,1.88,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],end(c){if(c.S.gone)vlrGone(c.e,false)},rec:.35},
  nova:{wt:6,cd:7,r:[0,6],a:'any',dur:2.2,armor:1,trn:[[0,.4,2]],trk:[[.5,'kneel','io'],[1.25,'kneel','l',.01],[1.4,'rise','s'],[2.2,'cRec','io']],
    hit:[{t:1.38,s:{k:'c',r:7},dm:1.5,w:1.2,kb:3,fx:c=>{svShock(c.m.position,VLR.col,8,.5);burst(gY(c.m.position,1),VLR.blood,70,6,4,.8);svDecal(c.m.position,0x3a0008,6,4,.55);shake(.4);svSnd('blood',1.2,.7)}}],
    ev:[[.25,c=>{svSnd('charge',.6,.7);svDecal(c.m.position,0x8a0018,7,1.4,.35)}]],rec:.4},
  // ---- v112: Hemorrhage Grasp (both phases): a narrow red cone; caught = dragged in, often followed by a combo ----
  grasp:{wt:8,cd:9,r:[3.5,9.5],a:'f',dur:2.4,lock:.75,trn:[[0,.75,4]],
    trk:[[.5,'gReach','io'],[1.0,'gReach','l',.012],[1.12,'gThrust','s'],[1.5,'gThrust','l'],[1.78,'gYank','b'],[2.2,'cRec','io'],[2.4,'cRec','l']],
    hit:[{t:1.12,s:{k:'a',r:9.4,h:.34},f:0,dm:1.0,w:.9,on:(c)=>{const m=c.m,a=m.rotation.y,q=c.inA(new THREE.Vector3(m.position.x+Math.sin(a)*2.6,0,m.position.z+Math.cos(a)*2.6),1),
        dx=q.x-pl.position.x,dz=q.z-pl.position.z,L=Math.hypot(dx,dz);if(L>.3)pl.step={x:dx/L,z:dz/L,t:.32,sp:L/.32};c.M.an.caught=1;svSnd('squelch',1,.9);flash('rgba(160,0,20,.25)')},
      fx:(c,an,hit)=>{vlrTendrils(c,an,hit);burst(c.wp('hdL',0,-.15,0),VLR.blood,25,3,1.5,.5)}}],
    ev:[[.35,c=>{svSnd('hiss',.6,.6);svCharge(c.e,'hdL',VLR.col,.9,.75,0,-.15,0);svDecal(c.m.position,0x6a0010,2.2,2.2,.4)}],[1.1,c=>svSnd('whoosh',.9,.8)]],
    nx:[['combo5',.6,6.5],['combo',.6,6.5]],rec:.3},
  // ---- v112: Danse Macabre (both phases): coil, then two full spins — a close circle, then a wide ring ----
  spin:{wt:(e,L,side)=>side==='f'?7:12,cd:8,r:[0,5.8],a:'any',dur:3.0,trn:[[0,.9,4]],
    trk:[[.55,'dmCoil','io'],[1.05,'dmCoil','l',.012],[1.2,'dmOut','s'],[2.05,'dmOut','l'],[2.3,'dmEnd','o'],[2.75,'cRec','io'],[3.0,'cRec','l']],
    hit:[{t:1.5,s:{k:'c',r:4.6},dm:1.1,w:.85,fx:c=>{svShock(c.m.position,VLR.col,4.8,.35);burst(gY(c.m.position,1.5),VLR.blood,30,5,1,.5);svSnd('swing',1,.9)}},
      {t:1.98,s:{k:'r',r0:2.6,r:6.8},dm:1.2,w:.6,kb:2.5,fx:c=>{svShock(c.m.position,VLR.col,7,.45,.5);svDecal(c.m.position,0x3a0008,6.5,2.5,.45);burst(gY(c.m.position,1.5),VLR.blood,50,7,1.4,.6);shake(.25);svSnd('blood',1,1.1)}}],
    tr:[[1.15,2.12,'swd',[0,0,2.3],[0,0,.5],0xff5060,.3]],
    ev:[[.3,c=>{svSnd('hum',.5,.9);svCharge(c.e,'swd',VLR.col,1.1,.8,0,0,2.2)}],[1.12,c=>{c.M.an.y0=c.m.rotation.y;vlrCrescent(c,1.0);svSnd('whoosh',1.1,.9)}],[1.6,c=>svSnd('whoosh',1.1,1.1)]],
    tk(c){const M=c.M;if(M.an.y0==null||M.an.yd)return;const k=Math.min(1,(c.t-1.12)/.95);c.m.rotation.y=M.an.y0+Math.PI*4*svEase.o(k);if(k>=1){c.m.rotation.y=svAng(M.an.y0);M.an.yd=1}},
    end(c){const M=c.M;if(M&&M.an.y0!=null&&!M.an.yd){c.m.rotation.y=svAng(c.m.rotation.y);M.an.yd=1}},rec:.4},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'bow','io'],[1.2,'bow','l',.02],[1.7,'roar','o'],[2.9,'roar','l',.02],[3.4,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,VLR.col,10,.8);burst(gY(c.m.position,2),VLR.blood,90,6,4,1)}}],
    ev:[[.05,c=>{banner('THE BLOOD MOON','Vaelric casts off his mortal shape','');svSnd('bell',.9,.6)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(220,20,50,.4)');svSnd('shriek',1,.8);svSnd('roar',.8,1.3);shake(.5)}]]},
  skyfall:{wt:8,cd:14,ph:2,r:[0,40],a:'any',dur:4.2,armor:1,inv:[.7,3.1],trn:[[0,4.2,2.5]],trk:[[.45,'kneel','io'],[1.0,'sUp','o'],[2.95,'sUp','l'],[3.25,'sDive','i'],[3.8,'sDive','l'],[4.2,'cRec','io']],
    ev:[[.5,c=>svSnd('whoosh',1.2,.6)],[.9,c=>{c.S.ghost=1}]].concat([0,1,2,3,4,5].map(i=>[1.15+i*.28,c=>{const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0},q=c.inA(pl.position.clone().add(new THREE.Vector3(d.x*2.2,0,d.z*2.2)),.8);vlrSpear(c,q,.62)}])),
    rm:[[2.85,3.25,'tgt','i',0,40]],hit:[{t:3.25,s:{k:'c',r:4.6},o:'tgt',dm:1.7,w:.75,kb:3.5,fx:(c,an)=>{c.S.ghost=0;const p=new THREE.Vector3(an.x,0,an.z);svShock(p,VLR.col,7,.6);burst(gY(p,.5),VLR.blood,80,5,4,.8);svDecal(p,0x3a0008,4,4,.6);shake(.55);svSnd('heavy',1.2,1.1)}}],
    end(c){c.S.ghost=0},rec:.5},
  waves:{wt:7,cd:7,ph:2,r:[5,40],a:'f',dur:2.3,lock:.8,trn:[[0,.8,4]],trk:[[.6,'wUp','io'],[.88,'wUp','l',.015],[1.0,'wDn','s'],[1.5,'wDn','l'],[2.3,'cRec','io']],
    hit:[{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:-.45,f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,-.45,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},f:1,nohit:1,w:.75,fx:c=>vlrWave(c,0,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:.45,f:1,nohit:1,w:.75,fx:c=>vlrWave(c,.45,15,20,1.1)}],
    tr:[[.9,1.06,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.9,c=>svSnd('swing',1,.8)]],rec:.4},
  combo5:{wt:9,cd:3.5,ph:2,r:[0,6.5],a:'f',mel:1,dur:3.1,lock:.3,trn:[[0,.3,5],[.6,.7,5],[1.0,1.1,5],[1.4,1.5,5],[2.0,2.25,4]],
    trk:[[.3,'s1Up','io'],[.45,'s1Hit','s'],[.62,'s1Hit','l'],[.78,'s2Hit','s'],[.95,'s1Up','io'],[1.12,'s1Hit','s'],[1.3,'s1Up','io'],[1.48,'s2Hit','s'],[1.9,'thUp','io'],[2.2,'thUp','l',.012],[2.33,'thHit','s'],[2.7,'cRec','io'],[3.1,'cRec','l']],
    rm:[[.4,.5,.8,'o'],[.72,.82,.6,'o'],[1.05,1.15,.6,'o'],[1.42,1.52,.6,'o'],[2.25,2.38,2.6,'o']],
    hit:[{t:.44,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:.77,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.11,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.47,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:2.33,s:{k:'l',w:1.8,l:7,b:0},f:.4,dm:1.4,w:.4}],
    tr:[[.38,.52,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[.7,.84,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.04,1.18,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.4,1.55,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[2.22,2.4,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.38,c=>svSnd('swing',.8,1.3)],[.72,c=>svSnd('swing',.8,1.4)],[1.05,c=>svSnd('swing',.8,1.3)],[1.42,c=>svSnd('swing',.8,1.5)],[2.25,c=>svSnd('whoosh',.9,1.6)]],rec:.4},
  // ---- v112: Thorned Procession (Phase II): five lanes of thorns race out toward you, then four more in the gaps ----
  thorns:{wt:9,cd:12,ph:2,r:[5,28],a:'fs',dur:3.3,armor:1,trn:[[0,.35,4]],
    trk:[[.6,'tpRaise','io'],[1.05,'tpRaise','l',.012],[1.2,'tpPlunge','s'],[2.6,'tpPlunge','l',.006],[3.1,'cRec','io'],[3.3,'cRec','l']],
    hit:[-.64,-.32,0,.32,.64].map(ay=>({t:1.22,s:{k:'l',w:1.6,l:16,b:0},f:2.4,ay,nohit:1,w:.85,fx:(c,an)=>vlrThorns(c,an,.95)}))
      .concat([-.48,-.16,.16,.48].map(ay=>({t:2.05,s:{k:'l',w:1.6,l:16,b:0},f:2.4,ay,nohit:1,w:.7,fx:(c,an)=>vlrThorns(c,an,.95)}))),
    ev:[[.4,c=>{svSnd('charge',.6,.6);svCharge(c.e,'swd',VLR.col,1.3,.8,0,0,2.3)}],[1.2,c=>{const p=c.at(2.5);svShock(p,VLR.col,5,.45);svDecal(p,0x3a0008,2.5,3.5,.6);burst(gY(p,.3),VLR.blood,50,4,3,.6);shake(.45);svSnd('heavy',1.2,.9)}],
      [2.0,c=>{svSnd('blood',.9,.8);burst(gY(c.at(2.5),.3),VLR.blood,30,3,2,.5)}]],rec:.45}};
VLRM.combo.ph1only=1;
svReg(5,{name:'Vaelric',col:VLR.col,body:1.3,ph2:.55,poise:.17,headJ:'head',turnA:5,
  ai:{pref:4,walk:2.8,run:5.2,turn:3.4,rest:[.6,1.2],ph2r:.7,strafe:.65,back:1},
  build:vlrBuild,loco:vlrLoco,post:vlrPost,P:VLRP,M:VLRM,
  stag:[[.25,'stag','o'],[2.0,'stag','l',.02],[2.5,'cRec','io']],stagT:2.5,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dqA!=null?A.dqA:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){const S=e.sv;if(S.gone)vlrGone(e,false);S.ghost=0;S.wk=0},
  dying(e,t){if(Math.random()<.6)burst(gY(e.m.position,1+Math.random()*2),0x1a0408,2,2,1.5,.9)}});
// ---- v112: the den's warning sign describes the current fight ----
DSTXT[5]={den:'The Crimson Throne Hall',zone:'The Citadel',
  atk:[['⚔ Crimson Combo','Up close: a slash, a backhand, a pause… then a long thrust. Phase II: four slashes, then the thrust.','Dodge each slash as it comes; the thrust is late — dash through it or step to the side, then strike.'],
   ['🗡 Crimson Lunge','He draws the blade back level with his eyes, then lunges far along a red line.','Sidestep the line as he lunges; once committed he cannot turn.'],
   ['🖐 Hemorrhage Grasp','He draws his left claw back, then thrusts it: blood tendrils lash a narrow red cone. Caught, you are dragged to his feet — often straight into a combo.','Step sideways out of the cone, or dash through it as he thrusts. If you are caught, dodge at once.'],
   ['🌊 Blood Wave','From afar: an overhead cut sends a crescent of blood down a long red line. Phase II: Triple Wave, three crescents fanning out.','Step out of the line; against three, stand in a gap or close in.'],
   ['🦇 Bat Step','He bursts into bats (untouchable) and re-forms at your side with a bell toll and a rising slash.','When the bell tolls, dash away from where he reappears.'],
   ['🩸 Sanguine Nova','He plants the sword and kneels; a blood circle bursts around him and throws you back.','Leave the red circle before he rises — then punish him.'],
   ['🌀 Danse Macabre','He coils low and trembles, then spins twice with the blade out: first a red circle close around him, then a wider red ring.','Be beyond the outer ring — or step in close right after the first cut: the second ring misses the inside.'],
   ['🌕 The Blood Moon','At 55% health he roars (immune) and a shockwave throws you back; bat wings tear free and he rests less between attacks.','Back off while he roars.'],
   ['☄ Skyfall','Phase II: he rises out of reach, blood spears rain on red circles where you are heading, then he plunges onto you.','Keep changing direction under the spears, then dash out of the plunge circle.'],
   ['🌹 Thorned Procession','Phase II: he raises the sword point-down and drives it into the floor: five lanes of blood thorns race out toward you, then four more burst in the gaps.','Stand between the first lanes, then step into a lane that has just sunk — or leave the fan to the side.']],
  weak:['Posture: your hits fill the yellow bar under his health. When it breaks he is STAGGERED for about 2 seconds and takes +35% damage.',
   'Lunge, Bat Step, Nova, Skyfall and Thorned Procession have armour: a posture break waits until the move ends.',
   'Every move ends with a recovery — the third hit of a combo, the end of a spin and the plunged sword are your openings.',
   'Red on the ground marks area attacks for their whole wind-up; sword swings only flash faint just before they land, so watch the blade.']};
