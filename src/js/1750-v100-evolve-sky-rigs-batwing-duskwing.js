// ================= v100 evolve: Sky rigs (Batwing → Duskwing; Skyhawk → Stormtalon, Rocsovereign) =================
// ---------------- Batwing: night bat — ear tufts, blood runes, patterned wings, fang charms, crescent crown ----------------
EVO100.D.Batwing={glow:0xc04aff,wing:{grow:.07},build(E,L,P){
  const M=EVO100_M,fur=P.mainL;
  // L1: long tufts at the ear bases, glowing blood-rune on the brow, a pale throat mane
  [-1,1].forEach(s=>{[0,1,2].forEach(k=>E.L([s*.075,.47-k*.025,.38],[s*(.15+k*.03),.55-k*.05,.3],.026,.002,'c',k%2?P.mainD:fur,4,{bn:'head'}))});
  const br=E.top(0,.43);if(br)E.rune({p:E.add(br.p,br.n,.004),n:br.n},[0,0,1],.035,P.glow);
  for(let i=-2;i<=2;i++){const h=E.on([i*.06,.26,1],[0,0,-1]);if(h)M.tuft(E,h,[0,-.6,0],.06+.01*L,.025,i%2?fur:P.main)}
  if(L>=2){// a mohawk crest of dark fur, nose-leaf spikes, fang charms on a cord
    for(let i=0;i<7;i++){const z=.36-i*.075,h=E.top(0,z);if(h)[-1,1].forEach(s=>E.L(E.add(h.p,[s*.015,-.005,0]),E.add(h.p,E.nrm([s*.25,1,-.9]),.1+.012*L-i*.008),.03,.002,'c',i%2?P.mainD:P.dark,4))}
    E.L([0,.45,.51],[0,.5,.5],.01,.002,'c',P.mainD,4,{bn:'head'});
    const pts=[];for(let i=-2;i<=2;i++){const a=i/2*1.1,h=E.on([Math.sin(a)*.5,.3,.28+Math.cos(a)*.3],[-Math.sin(a),0,-Math.cos(a)]);if(h)pts.push(E.add(h.p,h.n,.006))}
    for(let i=0;i<pts.length-1;i++)E.L(pts[i],pts[i+1],.004,.004,'c',P.leather,3);pts.forEach((p,i)=>{if(i%2==0)M.charm(E,p,.06,P.bone,'tooth')})}
  if(L>=3){// a bone face mask on the brow with glowing eye rims, shoulder spikes, glowing veins on the belly
    E.L([0,.47,.5],[0,.53,.47],.012,.002,'c',P.bone,4,{bn:'head'});
    [-1,1].forEach(s=>{E.band([s*.074,.432,.468],[s*.5,0,1],.01,.004,'g',P.glow,7,{bn:'head'});const h=E.on([s*.4,.42,.12],[-s,0,0]);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([h.n[0],1,-.5]),.08),.02,.002,'c',P.boneD,4)})}
  if(L>=4){// a crescent-moon crown between the ears, a gem on the chest, glowing tail tip
    const ct=E.top(.067,.36),c=[0,ct?ct.p[1]-.024:.53,.36]; // v173: the crown stands on the head (it rested only on the ears)
    for(let i=0;i<8;i++){const a=-1.3+i/7*2.6,a2=-1.3+(i+1)/7*2.6;if(i<7)E.L(E.add(c,[Math.sin(a)*.07,Math.cos(a)*.07,0]),E.add(c,[Math.sin(a2)*.07,Math.cos(a2)*.07,0]),.01-Math.abs(a)*.003,.01-Math.abs(a2)*.003,'m',P.trim,4,{bn:'head'})}
    E.pd('oct','g',P.glow,E.add(c,[0,.07,0]),[0,1,0],[.014,.024,.014],null,{bn:'head'});
    const cp=E.on([0,.3,1],[0,0,-1]);if(cp)E.gem({p:E.add(cp.p,cp.n,.008),n:cp.n},.022,P.glow)}
  if(L>=5){// shadow flames rising from the shoulders
    [-1,1].forEach(s=>[0,1,2].forEach(k=>{const h=E.top(s*.07,.16-k*.08);if(h)E.L(h.p,E.add(h.p,E.nrm([s*.3,1,-.6]),.1-k*.02),.018,.002,'g',k%2?P.glow:P.glow2,4)}))}
}};
// ---------------- Skyhawk: storm raptor — plumed crest, war paint, feather mantle, talon bands, breastplate, sun crown ----------------
EVO100.D.Skyhawk={glow:0x9ae8ff,wing:{grow:.06,claws:false},build(E,L,P){
  const M=EVO100_M,hb={bn:'head'};
  // L1: a tall swept crest of long plumes, a glowing lightning stripe under each eye, two long tail streamers
  for(let i=-2;i<=2;i++){const a=[i*.024,.925,.4],b=[i*.05,.99+.012*L-Math.abs(i)*.014,.24-Math.abs(i)*.03];E.L(a,b,.024,.004,'c',Math.abs(i)%2?P.mainD:P.dark,4,hb);
    if(L>=3)E.L(b,E.add(b,[i*.01,.01,-.05]),.008,.001,'g',P.glow,3,hb)}
  [-1,1].forEach(s=>{const h=E.on([s*.5,.875,.43],[-s,0,0]);if(h){const o=E.add(h.p,h.n,.003);E.chain([o,E.add(o,[0,-.03,-.022]),E.add(o,[0,-.028,-.035]),E.add(o,[0,-.06,-.05])],.006,.003,'g',P.glow,3,{vs:1})}});
  [-1,1].forEach(s=>E.chain([[s*.03,.52,-.5],[s*.06,.5,-.75],[s*.08,.47,-.95-.05*L]],.016,.004,'c',P.dark,4,{bn:'tail3'}));
  if(L>=2){// a feather mantle over the shoulders, bronze talon bands, a bead cord in the crest
    for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=-1.25+i/8*2.5,h=E.on([Math.sin(a)*.5,.8-k*.05,.25+Math.cos(a)*.1-k*.04],[-Math.sin(a),-.2,-.3]);
      if(h)E.L(E.add(h.p,h.n,-.008),E.add(h.p,E.nrm([h.n[0]*1.2,-.3,-1]),.11-k*.02),.032,.002,'c',(i+k)%2?P.mainD:P.dark,4)}
    [-1,1].forEach(s=>{E.band([s*.075,.2,.0],[0,1,0],.004,.009,'m',P.trim,8);E.band([s*.075,.27,.012],[0,1,0],.004,.007,'m',P.trim,8)});
    E.L([0,.96,.3],[0,.89,.21],.003,.003,'c',P.leather,3,hb);[0,1,2].forEach(k=>E.pd('sph',k==1?'g':'c',k==1?P.glow:P.bone,[0,.94-k*.022,.27-k*.02],[0,1,0],.012,null,hb))}
  if(L>=3){// a breastplate with a storm rune, a metal-capped beak, glowing plume tips (above)
    E.shell((x,y,z,nx,ny,nz)=>nz>.35&&y>.6&&y<.8&&z>.15,.014,'m',P.metal,{rimCol:P.trim});
    const cp=E.on([0,.7,1],[0,0,-1]);if(cp)E.rune({p:E.add(cp.p,cp.n,.016),n:cp.n},[0,1,0],.05,P.glow);
    E.L([0,.865,.555],[0,.835,.6],.02,.004,'m',P.trim,4,hb)}
  if(L>=4){// a sun crown of golden rays above the crest with a storm gem, glowing tail streamers
    for(let i=-3;i<=3;i++){const a=i/3*1.25;E.L([0,.95,.36],[Math.sin(a)*.13,.95+Math.cos(a)*.13,.33],.009,.002,'m',P.gold,4,hb)}
    E.pd('oct','g',P.glow,[0,.965,.37],[0,0,1],[.022,.032,.014],null,hb);
    [-1,1].forEach(s=>E.L([s*.072,.481,-1.0],[s*.079,.472,-1.13],.012,.002,'g',P.glow,4,{bn:'tail3'}))}
  if(L>=5){// lightning arcs crackling around the wing roots
    [-1,1].forEach(s=>{const sh=E.on([s*.5,.74,.14],[-s,-.3,0]),b=sh?E.add(sh.p,sh.n,-.004):[s*.15,.64,.14];E.chain([b,E.add(b,[s*.05,.06,-.02]),E.add(b,[s*.03,.1,-.06]),E.add(b,[s*.08,.15,-.08])],.008,.003,'g',P.glow2,3,{at:b})})}
}};

