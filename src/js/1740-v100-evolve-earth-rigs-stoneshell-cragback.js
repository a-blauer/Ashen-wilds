// ================= v100 evolve: Earth rigs (Stoneshell → Cragback, Titanshell; Mossfrog → Bogmaw) =================
// ---------------- Stoneshell: crystal spires, moss garden, stone horns, rune-carved shell, a shrine on its back ----------------
EVO100.D.Stoneshell={glow:0x5ae8d0,ownGlow:1,build(E,L,P){
  const moss=0x4a6a2a,moss2=0x3a5a22,stone=P.mainD,R=E.R;
  const dome=(x,z)=>E.top(x,z);
  // a crystal cluster on the shell (glowing core spire + dark shards around it)
  const cluster=(x,z,h,n)=>{const t=dome(x,z);if(!t)return;for(let i=0;i<n;i++){const a=i/n*6.283+R(),r=i?.03:0,hh=i?h*(.45+R()*.3):h,p=E.add(t.p,[Math.cos(a)*r,0,Math.sin(a)*r]),d=E.nrm([t.n[0]+Math.cos(a)*(i?.5:.1),1,t.n[2]+Math.sin(a)*(i?.5:.1)]);
    E.L(E.add(p,t.n,-.02),E.add(p,d,hh),i?.022:.032,.003,i%2?'c':'g',i%2?0x2a5a54:P.glow,4)}};
  // L1: moss tufts and ferns sprouting from the shell, a stone brow ridge, two new crystal shards
  [[.15,.1],[-.18,-.05],[.05,-.25],[-.08,.22],[.22,-.18]].slice(0,L>=2?5:3).forEach((q,i)=>{const t=dome(q[0],q[1]);if(!t)return;E.pd('ico','c',i%2?moss:moss2,t.p,t.n,[.07,.02,.06]);
    for(let k=0;k<3;k++){const a=k*2.1+i;E.L(t.p,E.add(t.p,E.nrm([t.n[0]+Math.cos(a)*.6,1,t.n[2]+Math.sin(a)*.6]),.05+.01*L),.012,.002,'c',0x5a8a3a,3)}});
  cluster(-.12,.06,.1,3);
  [-1,1].forEach(s=>E.L([s*.03,.36,.55],[s*.1,.37,.5],.016,.01,'c',stone,4,{bn:'head'}));
  if(L>=2){// big crystal spires, rune lines carved into the shell rim, stone knuckle plates on the legs
    cluster(.16,-.12,.16,4);cluster(-.2,-.2,.12,3);
    for(let i=0;i<8;i++){const a=i/8*6.283+.2,h=E.on([Math.sin(a)*.8,.25,Math.cos(a)*.9-.02],[-Math.sin(a),0,-Math.cos(a)]);if(h&&h.p[1]>.18&&h.p[1]<.32)E.rune(h,[0,1,0],.04,P.glow)}
    [['fl',.16,.19],['fr',.16,.19],['hl',.17,-.21],['hr',.17,-.21]].forEach(q=>{const s=q[0][1]=='l'?-1:1;const h=E.on([s*.5,.14,q[2]],[-s,0,0]);if(h)E.pd('dod','c',stone,E.add(h.p,h.n,.01),h.n,[.04,.03,.05])})}
  if(L>=3){// stone horns sweeping back from the head, a ring of tall rim spikes, glowing moss
    [-1,1].forEach(s=>E.horn([s*.05,.36,.5],[s*.4,.6,-.7],[0,-.03,-.04],.16,.03,'c',stone,5,null,0x8a8a7a));
    for(let i=0;i<10;i++){const a=i/10*6.283,h=E.on([Math.sin(a)*.8,.3,Math.cos(a)*.9-.02],[-Math.sin(a),-.2,-Math.cos(a)]);if(h&&Math.abs(Math.cos(a))<.95)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([h.n[0],.6,h.n[2]]),.07),.03,.003,'c',i%2?stone:P.mainD,4)}
    [[.1,.15],[-.15,-.15]].forEach(q=>{const t=dome(q[0],q[1]);if(t)E.pd('ico','g',P.glowD,E.add(t.p,t.n,.01),t.n,[.05,.012,.04])})}
  if(L>=4){// a ruined shrine: two standing stones with a lintel and a glowing heart crystal on top of the shell
    const t=dome(0,-.02);if(t){[-1,1].forEach(s=>E.pd('box','c',0x6a6a62,E.add(t.p,[s*.07,.06,0]),[0,1,0],[.035,.13,.035],[0,0,1]));E.pd('box','c',0x5a5a52,E.add(t.p,[0,.135,0]),[0,1,0],[.2,.03,.05],[0,0,1]);
      E.pd('oct','g',P.glow,E.add(t.p,[0,.06,0]),[0,1,0],[.035,.06,.035]);E.pd('oct','g',P.glow2,E.add(t.p,[0,.18,0]),[0,1,0],[.018,.03,.018])}
    // glowing cracks running down the shell from the shrine
    for(let k=0;k<7;k++){const a=k/7*6.283+.3;let pr=null;for(let i=1;i<=6;i++){const r=.06+i*.045,w=Math.sin(i*1.7+k)*.05,t=dome(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=E.add(t.p,t.n,.004);
      if(pr)E.L(pr,q,.009-i*.0008,.008-i*.0008,'g',i<3?P.glow:P.glowD,3,{vs:1});pr=q}}}
  if(L>=5){// crystal crown on the brow, more spires
    for(let i=-2;i<=2;i++)E.L([i*.03,.37,.52],[i*.05,.45-Math.abs(i)*.02,.5],.012,.002,'g',P.glow,4,{bn:'head'});
    cluster(.24,.12,.12,3);cluster(-.26,.1,.1,3)}
}};
// ---------------- Mossfrog: bog toad — glowing pustules, moss cloak, reed crown, bone charms, lantern lure ----------------
EVO100.D.Mossfrog={glow:0xb8ff4a,build(E,L,P){
  const M=EVO100_M,moss=0x4a6a2a,reed=0x7a8a3a;
  // L1: glowing pustules on the back, darker toxic stripes
  [[.08,.46,.05],[-.1,.45,-.06],[.13,.42,-.14],[-.04,.47,.12],[.0,.46,-.1],[-.15,.4,.08]].slice(0,L>=2?6:4).forEach(q=>{const t=E.top(q[0],q[2]);if(t)E.pd('sph','g',P.glow,E.add(t.p,t.n,.006),t.n,[.018,.012,.018])});
  [-1,1].forEach(s=>{const h=E.on([s*.6,.36,0],[-s,0,0]);if(h)E.rune(h,[0,0,1],.05,P.glowD)});
  if(L>=2){// moss cloak over the back with hanging strands, a reed crown between the eyes
    E.shell((x,y,z,nx,ny)=>ny>.55&&z<.22&&z>-.25,.012,'c',(x,y,z,i)=>i%3?moss:0x3a5222,{rimCol:0x2a3a1a});
    [-1,1].forEach(s=>[.1,-.05,-.18].forEach(z=>{const h=E.on([s*.6,.42,z],[-s,-.3,0]);if(h)E.L(h.p,E.add(h.p,[s*.02,-.08,-.01]),.012,.002,'c',moss,3)}));
    for(let i=-2;i<=2;i++)E.L([i*.025,.44,.3],[i*.04,.52+Math.abs(i)*.0,.27-Math.abs(i)*.01],.007,.002,'c',reed,3,{bn:'head'})}
  if(L>=3){// bone charm necklace across the throat, bony brow spurs, warty knuckle bands
    const pts=[];for(let i=-3;i<=3;i++){const a=i/3*1.2,h=E.on([Math.sin(a)*.5,.2,.32+Math.cos(a)*.3],[-Math.sin(a),.2,-Math.cos(a)]);if(h)pts.push(E.add(h.p,h.n,.008))}
    for(let i=0;i<pts.length-1;i++)E.L(pts[i],pts[i+1],.005,.005,'c',P.leather,3);pts.forEach((p,i)=>{if(i%2)M.charm(E,p,.07,P.bone,'tooth');else E.pd('sph','c',P.bone,p,[0,1,0],.012)});
    [-1,1].forEach(s=>E.horn([s*.12,.47,.33],[s*.4,.7,-.5],[0,0,-.02],.07,.018,'c',P.boneD,4,{bn:'head'}))}
  if(L>=4){// an angler lure on a bony stalk with a glowing lantern bulb, glowing eye rims, moss beard
    E.chain([[0,.45,.33],[0,.53,.36],[0,.57,.42],[0,.55,.48]],.016,.007,'c',P.mainD,5,{bn:'head'});E.pd('ico','g',P.glow,[0,.525,.5],[0,1,0],.026,null,{bn:'head'});E.pd('ico','g',P.glow2,[0,.525,.5],[0,1,0],.014,null,{bn:'head'});
    [0,1,2].forEach(i=>E.L([0,.5+i*.025,.35+i*.03],[0,.53+i*.025,.33+i*.03],.006,.001,'c',P.boneD,3,{bn:'head'}));
    [-1,1].forEach(s=>E.band([s*.12,.42,.34],[s*.4,.9,.5],.004,.005,'g',P.glow,8,{bn:'head'}));
    for(let i=-2;i<=2;i++)E.L([i*.04,.25,.36],[i*.05,.18,.36],.012,.002,'c',moss,3,{bn:'jaw'})}
  if(L>=5){// toxic spines along the back with glowing tips
    for(let i=-1;i<=1;i++)[.12,.0,-.12].forEach(z=>{const t=E.top(i*.1,z);if(t)E.L(E.add(t.p,t.n,-.005),E.add(t.p,E.nrm([i*.3,1,-.5]),.08),.015,.002,'g',P.glow2,4)})}
}};

