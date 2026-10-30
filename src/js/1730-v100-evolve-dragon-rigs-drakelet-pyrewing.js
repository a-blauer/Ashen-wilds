// ================= v100 evolve: Dragon rigs (Drakelet → Pyrewing, Elderdrake; Gravewyrm → Venomcoil) =================
// ---------------- Drakelet: longer horns, ember vents, back spines, patterned wings, horn crown, molten seams ----------------
EVO100.D.Drakelet={glow:0xff6a1a,wing:{grow:.06},build(E,L,P){
  const M=EVO100_M,bone=P.bone,boneD=P.boneD;
  // L1: a second, longer pair of swept horns behind the first, glowing ember vents on the throat and flanks
  [-1,1].forEach(s=>{E.horn([s*.07,.775,.56],[s*.35,.5,-1],[s*.02,-.04,-.05],.2+.03*L,.026,'c',bone,5,null,L>=4?P.trim:boneD);
    [[.5,.15],[.46,.06],[.47,-.04]].slice(0,L>=3?3:2).forEach(q=>{const h=E.on([s*.5,q[0],q[1]],[-s,0,0]);if(h)E.L(E.add(E.add(h.p,h.n,.003),[0,.03,0]),E.add(E.add(h.p,h.n,.003),[0,-.03,-.03]),.009,.006,'g',P.glow,3,{vs:1})})});
  const th=E.on([0,.55,1.5],[0,-.3,-1]);if(th)E.rune(th,[0,1,0],.035,P.glow);
  if(L>=2){// tall dorsal sail-spines with glowing tips, cheek frills, jaw spikes, tail blade
    M.ridge(E,[[.4,.07,.022],[.3,.1,.03],[.2,.13,.036],[.1,.14,.038],[0,.14,.038],[-.1,.13,.034],[-.2,.11,.03],[-.3,.08,.024]],'c',P.mainD,.9,0,L>=3?P.glow:null);
    [-1,1].forEach(s=>{for(let i=0;i<3;i++)E.L([s*.09,.71-i*.02,.56-i*.025],[s*(.2+i*.02),.72-i*.04,.47-i*.04],.022,.002,'c',i%2?P.mainD:boneD,4,{bn:'head'});
      E.L([s*.035,.636,.66],[s*.13,.6,.58],.016,.002,'c',bone,4,{bn:'jaw'})});
    E.pd('cone4','c',P.mainD,[0,.57,-1.27],[0,0,-1],[.1,.16,.022],[0,1,0],{bn:'tail3'})}
  if(L>=3){// scale armour across chest and shoulders (darker plates with bone rims), ember vents along the spine
    E.shell((x,y,z,nx,ny,nz)=>z>.12&&z<.4&&ny>-.2&&nz>-.3&&y>.45,.016,'c',(x,y,z,i)=>i%3?P.mainD:P.dark,{rimCol:boneD});
    [.15,.05,-.05,-.15,-.25].forEach(z=>{const h=E.top(0,z);if(h)[-1,1].forEach(s=>E.L(E.add(h.p,[s*.04,-.01,.03]),E.add(h.p,[s*.05,-.012,-.03]),.007,.007,'g',P.glow,3,{vs:1}))});
    for(let i=0;i<4;i++){const z=-.5-i*.17,h=E.top(0,z);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([0,1,-.8]),.06-i*.008),.02,.002,'c',bone,4,{only:['tail0','tail1','tail2','tail3']})}}
  if(L>=4){// crown of four horns banded in gold, a gem on the brow, molten seams on the belly, glowing tail blade
    [-1,1].forEach(s=>{E.horn([s*.03,.79,.6],[s*.2,1,-.25],[0,0,-.06],.16,.016,'c',bone,4,null,P.trim);E.band([s*.075,.8,.52],[s*.35,.5,-1],.02,.006,'m',P.trim,6)});
    const hb=E.top(0,.64);if(hb)E.gem({p:E.add(hb.p,hb.n,.008),n:hb.n},.02,P.glow);
    E.shell((x,y,z,nx,ny)=>ny<-.6&&z>-.3&&z<.35,.006,'g',P.glowD,{rim:false});
    E.pd('cone4','g',P.glow,[0,.57,-1.28],[0,0,-1],[.05,.11,.03],[0,1,0],{bn:'tail3'})}
  if(L>=5){// flame crest: glowing spines down the neck, ember horns, burning eyes
    for(let i=0;i<5;i++){const z=.5-i*.06,h=E.top(0,z);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([0,1,-1]),.1-i*.01),.022,.002,'g',i%2?P.glow:P.glow2,4)}
    [-1,1].forEach(s=>E.L([s*.082,.733,.665],[s*.12,.745,.55],.01,.001,'g',P.glow2,3,{bn:'head'}))}
}};
// ---------------- Gravewyrm: horns, hood frills, venom, bone armour, rune bands, horn crown, glowing rattle ----------------
EVO100.D.Gravewyrm={glow:0x8aff4a,build(E,L,P){
  const M=EVO100_M,bone=P.bone,boneD=P.boneD,seg=['tail1','tail0','pelvis','spine','chest','neck'];
  // L1: longer back-swept horns, venom drip on the fangs, glowing scale lines behind the eyes
  [-1,1].forEach(s=>{E.horn([s*.09,.37,.52],[s*.5,.45,-1],[s*.03,-.03,-.03],.18+.03*L,.026,'c',bone,5,null,L>=4?P.trim:boneD);
    {const ft=RV137.cur.Gravewyrm=='Venomcoil'?.27:.282;E.L([s*.05,ft+.008,.793],[s*.05,ft-.03,.797],.006,.002,'g',P.glow,3,{bn:'head'})} // v177: the drip hangs from the fang tip (the v137 head moved the fangs)
    E.L([s*.118,.335,.55],[s*.13,.33,.44],.006,.006,'g',P.glow,3,{bn:'head'})});
  if(L>=2){// cobra hood frills on the neck with bony struts, bigger ridge plates
    // cobra hood: two upright membranes flaring from the neck behind the head, ribbed with bone, eye-spots
    [-1,1].forEach(s=>{const base=[s*.04,.34,.36],pts=[[s*.05,.47,.43],[s*.14,.54,.41],[s*.23,.52,.38],[s*.29,.44,.35],[s*.29,.34,.32],[s*.22,.25,.3],[s*.1,.22,.32]];
      E.fan(base,pts,P.mainD,L>=4?P.glowD:P.mainL,'c',{bn:'neck'});
      [1,2,3,4,5].forEach(i=>E.L(base,pts[i],.01,.003,'c',bone,4,{bn:'neck'}));
      E.pd('sph','c',P.dark,[s*.19,.42,.37],[0,0,1],[.035,.035,.006],null,{bn:'neck'});E.pd('sph',L>=3?'g':'c',L>=3?P.glow:P.bone,[s*.19,.42,.375],[0,0,1],[.018,.018,.006],null,{bn:'neck'})});
    M.ridge(E,[[.2,.07,.03],[.0,.09,.035],[-.2,.09,.035],[-.45,.08,.03],[-.7,.06,.025],[-.95,.05,.02]],'c',bone,.9,0,null)}
  if(L>=3){// segmented bone armour over the back, glowing rune bands around the coils
    [[.25,.1],[.05,-.12],[-.18,-.36],[-.42,-.6]].forEach((q,k)=>E.shell((x,y,z,nx,ny)=>z<q[0]&&z>q[1]&&ny>.55&&y>.15,.014,'c',k%2?P.mainD:P.dark,{rimCol:boneD}));
    [.12,-.3,-.75].forEach(z=>{const h=E.top(0,z);if(h)E.band([0,h.p[1]*.55,z],[0,0,1],.004,.006,'g',P.glow,10)})}
  if(L>=4){// a crown of horns, glowing frill veins, a bone rattle-blade on the tail tip
    [-2,-1,0,1,2].forEach(i=>{const h=E.top(i*.04,.5);if(h)E.horn(E.add(h.p,h.n,-.005),[i*.25,1,-.6],[0,0,-.04],.1-Math.abs(i)*.012,.014,'c',bone,4,null,P.trim)});
    [-1,1].forEach(s=>{[[.12,.5,.405],[.25,.47,.36],[.26,.3,.32]].forEach(q=>E.L([s*.04,.34,.36],[s*q[0],q[1],q[2]],.005,.003,'g',P.glow,3,{bn:'neck'}))});
    E.pd('oct','c',bone,[.054,.018,-1.655],[0,0,-1],[.05,.1,.02],[0,1,0],{bn:'tail3'});E.pd('oct','g',P.glow,[.054,.018,-1.7],[0,0,-1],[.025,.05,.026],[0,1,0],{bn:'tail3'})}
  if(L>=5){// spirit flames along the spine
    [.3,.1,-.1,-.3,-.5].forEach((z,i)=>{const h=E.top(0,z);if(h)E.L(E.add(h.p,h.n,.02),E.add(h.p,E.nrm([0,1,-.7]),.14),.025,.002,'g',i%2?P.glow:P.glow2,4)})}
}};

