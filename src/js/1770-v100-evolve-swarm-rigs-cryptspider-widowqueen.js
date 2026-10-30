// ================= v100 evolve: Swarm rigs (Cryptspider → Widowqueen, Hivemother; Gloomcap → Sporelord) =================
// ---------------- Cryptspider: crypt spider — carapace crest, venom glow, bone armour, egg sac, crown of horns ----------------
EVO100.D.Cryptspider={glow:0xff3a5a,build(E,L,P){
  // L1: a carapace crest (spiked ridge) on the cephalothorax, glowing venom drops on the fangs, a second glowing eye row
  [[.3,.05,.018],[.22,.07,.022],[.14,.06,.02]].forEach(q=>{const h=E.top(0,q[0]);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([0,1,-.8]),q[1]+.01*L),q[2],.002,'c',P.dark,4)});
  [-1,1].forEach(s=>{E.pd('sph','g',P.glow,[s*.02,.27,.5],[0,1,0],.012,null,{bn:'jaw'});[[.05,.49,.4],[.03,.5,.37]].forEach(q=>E.pd('sph','g',P.glow,[s*q[0],q[1],q[2]],[0,1,0],.01,null,{vs:1}))}); // v179: the eye gems follow the head's skin (they drifted off it in the bite)
  if(L>=2){// a glowing venom sigil on the abdomen and venom veins along it, bony spurs on the knees
    const ab=E.top(0,-.36);if(ab){E.rune({p:E.add(ab.p,ab.n,.006),n:ab.n},[0,0,1],.07,P.glow)}
    [-1,1].forEach(s=>{for(let k=0;k<3;k++){const z=-.26-k*.1,h=E.on([s*.6,.6,z],[-s,-.3,0]);if(h)E.L(E.add(h.p,h.n,.004),E.add(E.add(h.p,h.n,.004),[0,.05,-.04]),.006,.006,'g',P.glowD,3,{vs:1})}
      [0,1,2,3].forEach(i=>{const L1=spidLeg(s,i);E.L(L1.p1,E.add(L1.p1,[s*.02,.07,0]),.016,.002,'c',P.bone,4,{bn:L1.k+'1'})})})}
  if(L>=3){// bone plate armour over the abdomen in rings, a glowing hourglass, a bone mantle on the thorax
    [[-.18,-.28],[-.3,-.42],[-.44,-.56]].forEach((q,k)=>E.shell((x,y,z,nx,ny)=>z<q[0]&&z>q[1]&&ny>.35&&Math.abs(x)<.26&&y>.5,.016,'c',k%2?0x5a5048:0x40383a,{rimCol:P.boneD}));
    E.shell((x,y,z,nx,ny)=>z>.08&&z<.34&&ny>.5&&Math.abs(x)<.13&&y>.47,.014,'c',0x4a4240,{rimCol:P.boneD});
    const h=E.top(0,-.36);if(h){const c=E.add(h.p,h.n,.015);E.pd('cone4','g',P.glow,E.add(c,[0,0,.03]),[0,0,-1],[.03,.05,.012],[0,1,0],{vs:1});E.pd('cone4','g',P.glow,E.add(c,[0,0,-.03]),[0,0,1],[.03,.05,.012],[0,1,0],{vs:1})}} // v179: the hourglass sits in the bone plate (was 3 cm up, a few mm proud of it)
  if(L>=4){// a crown of curved horns, a glowing egg-sac cluster at the spinnerets, gold-banded legs
    for(let i=-2;i<=2;i++){const h=E.top(i*.04,.38);if(h)E.horn(E.add(h.p,h.n,-.005),[i*.3,1,-.3],[0,0,-.05],.12-Math.abs(i)*.015,.014,'c',P.bone,4,null,P.trim)}
    [[0,.47,-.68],[.03,.45,-.7],[-.03,.45,-.7],[0,.43,-.72]].forEach((q,i)=>E.pd('sph','g',i%2?P.glowD:P.glow,q,[0,1,0],.03,null,{bn:'tail3'}));
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const L1=spidLeg(s,i),p=spidLerp(L1.p1,L1.p2,.3);E.band(p,[L1.p2[0]-L1.p1[0],L1.p2[1]-L1.p1[1],L1.p2[2]-L1.p1[2]],.004,.006,'m',P.trim,6,{bn:L1.k+'1'})}))}
  if(L>=5){// spectral webs strung between the horns, venom mist rising from the abdomen
    for(let i=0;i<4;i++){const h=E.top((i-1.5)*.08,-.3-i%2*.1);if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,[0,.12,-.03]),.025,.002,'g',P.glow2,4,{vs:1})}} // v179: rooted in the abdomen, following it
}};
// ---------------- Gloomcap: walking toadstool — glowing gills, bracket fungi, sprouting caps, a root mantle, a spore crown ----------------
EVO100.D.Gloomcap={glow:0xb8ff6a,build(E,L,P){
  const cap=P.main,shelf=0xb89a6a,shelfD=0x7a5a3a,stalk=0xc8b99c,hb={bn:'head'};
  const bracket=(a,y,sz)=>{const h=E.on([Math.sin(a)*.5,y,Math.cos(a)*.5],[-Math.sin(a),0,-Math.cos(a)]);if(!h)return;
    E.pd('hem','c',shelfD,E.add(h.p,h.n,sz*.2),[0,1,0],[sz,sz*.4,sz*.85]);E.pd('hem','c',shelf,E.add(E.add(h.p,h.n,sz*.15),[0,sz*.25,0]),[0,1,0],[sz*.8,sz*.3,sz*.7])};
  // L1: glowing gill veins under the cap, a glowing rim of spots, bracket fungi on the stalk
  for(let i=0;i<10;i++){const a=i/10*6.283+.22;E.L([Math.sin(a)*.07,.729,Math.cos(a)*.07],[Math.sin(a)*.28,.743,Math.cos(a)*.28],.008,.005,'g',P.glow,3,hb)}
  bracket(-2.2,.4,.06);bracket(2.6,.3,.05);
  if(L>=2){// small toadstools sprouting from the cap, a ring of glowing spots, more brackets
    [[.15,.06],[-.13,-.1],[.04,-.2],[-.17,.12]].forEach((q,i)=>{const t=E.top(q[0],q[1]);if(!t)return;const tp=E.add(t.p,E.nrm([q[0],1,q[1]]),.06+i%2*.02);
      E.L(t.p,tp,.014,.011,'c',stalk,4,hb);E.pd('hem','c',i%2?P.mainD:cap,tp,E.nrm([q[0],1,q[1]]),[.04,.03,.04],null,hb);E.pd('sph','c',0xd8cbb2,E.add(tp,[0,.022,0]),[0,1,0],[.01,.005,.01],null,hb)});
    for(let i=0;i<12;i++){const a=i/12*6.283,t=E.top(Math.sin(a)*.25,Math.cos(a)*.25);if(t)E.pd('sph','g',P.glowD,E.add(t.p,t.n,.003),t.n,[.016,.005,.016],null,hb)}
    bracket(1.6,.48,.055);bracket(-.9,.26,.05)}
  if(L>=3){// a mantle of roots and moss hanging from under the cap rim (behind and beside the face), root tendrils down the back
    for(let i=0;i<16;i++){const a=Math.PI*.35+i/15*Math.PI*1.3,r=.27,p=[Math.sin(a)*r,.76,Math.cos(a)*r];const len=.1+((i*7)%4)*.03;
      E.L(p,E.add(p,[Math.sin(a)*.03,-len,Math.cos(a)*.03]),.03,.004,'c',i%3?0x3a4a26:0x4a3a26,4,hb);if(i%4==1)E.pd('sph','g',P.glow,E.add(p,[Math.sin(a)*.03,-len,Math.cos(a)*.03]),[0,1,0],.012,null,hb)}
    [-1,1].forEach(s=>E.chain([[s*.05,.62,-.08],[s*.07,.48,-.13],[s*.06,.34,-.14],[s*.08,.2,-.12]],.016,.006,'c',0x3a2c20,4))}
  if(L>=4){// a crown of tall spore stalks with glowing bulbs, drifting glow motes, gold-ringed stalk
    for(let i=0;i<5;i++){const a=i/5*6.283,t=E.top(Math.sin(a)*.09,Math.cos(a)*.09);if(!t)continue;const tip=E.add(t.p,E.nrm([Math.sin(a)*.35,1,Math.cos(a)*.35]),.14+(i%2)*.05);
      E.L(t.p,tip,.014,.008,'c',stalk,4,hb);E.pd('sph','g',i%2?P.glow:P.glow2,tip,[0,1,0],[.028,.022,.028],null,hb)}
    for(let i=0;i<8;i++){const a=i*.8+.4,r=.14+(i%3)*.055,t=E.top(Math.cos(a)*r,Math.sin(a)*r);if(t)E.pd('ico','g',P.glow,E.add(t.p,t.n,.008),t.n,.014,null,hb)}
    E.band([0,.38,0],[0,1,0],.006,.009,'m',P.trim,10)}
  if(L>=5){// the cap rim glows, a second ring of tiny caps
    for(let i=0;i<18;i++){const a=i/18*6.283,a2=(i+1)/18*6.283,r=.335;E.L([Math.sin(a)*r,.775,Math.cos(a)*r],[Math.sin(a2)*r,.775,Math.cos(a2)*r],.011,.011,'g',P.glow,3,hb)}
    [[.2,-.05],[-.05,.2],[-.2,-.12]].forEach(q=>{const t=E.top(q[0],q[1]);if(t){E.L(t.p,E.add(t.p,t.n,.035),.008,.006,'c',stalk,4,hb);E.pd('hem','g',P.glowD,E.add(t.p,t.n,.035),t.n,[.022,.016,.022],null,hb)}})}
}};

