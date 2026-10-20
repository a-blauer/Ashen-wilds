// ================= v100 evolve: Spirit rigs (Boneling → Lichbone; Wispling → Lumenwisp, Soulwarden) =================
// ---------------- Boneling: grave-hound — soul-fire, grave-iron, rune-etched skull, lich crown, phylactery ----------------
EVO100.D.Boneling={glow:0x6aff9a,ownGlow:1,build(E,L,P){
  const B=boneP,M=EVO100_M,iron=P.metal,bone=P.bone;
  // L1: soul-fire wisps rising from the eye sockets, a grave chain collar with a lantern charm
  [-1,1].forEach(s=>{const e=B([s*.055,.625,.575]);E.L(e,E.add(e,[s*.02,.06,-.07]),.016,.002,'g',P.glow,4,{bn:'head'});if(L>=3)E.L(E.add(e,[0,.01,0]),E.add(e,[s*.035,.1,-.14]),.012,.001,'g',P.glow2,3,{bn:'head'})});
  const nk=B([0,.56,.38]);const ring=[];for(let i=0;i<10;i++){const a=i/10*6.283;ring.push(E.add(nk,[Math.cos(a)*.06,Math.sin(a)*.06,0]))}
  for(let i=0;i<10;i++)E.pd('ring','m',P.iron,ring[i],E.nrm([ring[(i+1)%10][0]-ring[i][0],ring[(i+1)%10][1]-ring[i][1],0]),[.016,.03,.016],null,{bn:'neck'});
  M.charm(E,E.add(nk,[0,-.06,0]),.08,P.glow,'gem',{bn:'neck'});
  if(L>=2){// ghostly flame ribbon along the spine, bigger back-swept horns, soul-fire in the ribcage
    for(let i=0;i<6;i++){const p=B([0,.6,.34-i*.1]);E.L(p,E.add(p,[0,.07-i*.004,-.06]),.018,.002,'g',i%2?P.glow:P.glowD,4)}
    [-1,1].forEach(s=>E.horn(B([s*.1,.71,.38]),[s*.3,.5,-1],[0,-.05,-.03],.16,.018,'c',P.boneD,5,{bn:'head'}));
    E.pd('ico','g',P.glow2,B([0,.47,.12]),[0,1,0],.05,null,{bn:'chest'})}
  if(L>=3){// grave-iron armour: a skull plate with rivets, shoulder guards, spiked spine plates
    E.shell((x,y,z,nx,ny)=>z>B([0,0,.46])[2]&&z<B([0,0,.6])[2]&&ny>.45,.012,'m',iron,{rimCol:P.trim});
    [-1,1].forEach(s=>{const h=E.on([s*.4,B([0,.53,0])[1],B([0,0,.24])[2]],[-s,0,0]);if(h){E.plate(h.p,h.n,[0,1,0],.07,.1,.014,'m',iron,'box');E.pd('cone4','m',P.trim,E.add(h.p,h.n,.03),h.n,[.012,.04,.012])}});
    [.2,.06,-.08,-.22].forEach(z=>{const p=B([0,.6,z]);E.pd('box','m',iron,E.add(p,[0,.01,0]),[0,1,0],[.08,.012,.05]);E.pd('cone4','m',P.trim,E.add(p,[0,.045,0]),[0,1,-.4],[.012,.05,.012])})}
  if(L>=4){// lich crown of bone spikes banded in gold, rune etched on the skull, a phylactery at the tail tip
    for(let i=-2;i<=2;i++){const p=B([i*.03,.69,.48]);E.L(p,E.add(p,[i*.015,.07-Math.abs(i)*.012,-.03]),.01,.002,'c',bone,4,{bn:'head'})}
    E.band(B([0,.66,.48]),[0,1,-.3],.003,.006,'m',P.gold,10,{bn:'head'});
    const sk=E.top(0,B([0,0,.55])[2]);if(sk)E.rune({p:E.add(sk.p,sk.n,.012),n:sk.n},[0,0,1],.04,P.glow);
    const tp=B([0,.47,-.98]);E.pd('cyl','m',P.trim,tp,[0,1,0],[.022,.05,.022],null,{bn:'tail3'});E.pd('oct','g',P.glow,E.add(tp,[0,-.04,0]),[0,1,0],[.028,.045,.028],null,{bn:'tail3'})}
  if(L>=5){// spectral flames wreathing the ribcage and legs
    [-1,1].forEach(s=>[.2,.06,-.08].forEach(z=>{const p=B([s*.15,.46,z]);E.L(p,E.add(p,[s*.03,.1,-.05]),.02,.002,'g',P.glow,4)}))}
}};
// ---------------- Wispling: hooded spirit — rune hood, soul-lanterns, mantle, ghost chains, rune halo, flame crown ----------------
// The hood is a kit part (not body geometry), so its ornaments are placed on a circle around it: centre (0,.98,-.01), radius ~.18.
EVO100.D.Wispling={glow:0x9ff0ff,build(E,L,P){
  const hood=P.dark,trim=P.trim,H=(a,y,r)=>[Math.sin(a)*(r||.185),y,-.01+Math.cos(a)*(r||.185)],hb={bn:'head'};
  const lantern=(bn,hand,col)=>{E.L(hand,E.add(hand,[0,-.08,0]),.004,.004,'m',P.iron,3,{bn});E.pd('cyl','m',P.iron,E.add(hand,[0,-.085,0]),[0,1,0],[.028,.012,.028],null,{bn});
    E.pd('oct','g',col,E.add(hand,[0,-.12,0]),[0,1,0],[.024,.04,.024],null,{bn});E.pd('cone','m',P.iron,E.add(hand,[0,-.165,0]),[0,-1,0],[.022,.02,.022],null,{bn})};
  // L1: glowing runes around the back of the hood, a soul-lantern hanging from the right hand
  for(let i=0;i<7;i++){const a=Math.PI*.45+i/6*Math.PI*1.1,p=H(a,1.0,.19);E.pd('box','g',P.glow,p,[Math.sin(a),0,Math.cos(a)],[.02,.004,.035],[0,1,0],hb)}
  lantern('fr2',[.225,.55,.1],P.glow);
  if(L>=2){// a ragged mantle over the shoulders (body shell), ghost chains trailing from the wrists
    E.shell((x,y,z,nx,ny)=>y>.68&&y<.9&&ny>-.25,.016,'c',(x,y,z,i)=>i%2?hood:0x26222c,{rimCol:trim});
    [-1,1].forEach(s=>{let p=[s*.215,.6,.06];for(let i=0;i<4;i++){const q=E.add(p,[s*.008,-.045,-.03]);E.pd('ring','m',P.iron,q,E.nrm(i%2?[1,0,0]:[0,0,1]),[.018,.04,.018],null,{bn:s<0?'fl2':'fr2'});p=q}})}
  if(L>=3){// a halo of runes over the hood, glowing bands in the cloak tails
    const c=[0,1.22,-.05];for(let i=0;i<14;i++){const a=i/14*6.283,a2=(i+1)/14*6.283,r=.16;E.L(E.add(c,[Math.cos(a)*r,0,Math.sin(a)*r]),E.add(c,[Math.cos(a2)*r,0,Math.sin(a2)*r]),.007,.007,'g',P.glow,3,hb);
      if(i%2==0)E.pd('oct','g',P.glow2,E.add(c,[Math.cos(a)*r,0,Math.sin(a)*r]),[0,1,0],[.012,.024,.012],null,hb)}
    E.band([0,.36,-.07],[0,1,-.3],.006,.007,'g',P.glowD,8);E.band([0,.24,-.13],[0,1,-.5],.005,.006,'g',P.glow,8)}
  if(L>=4){// a silver circlet on the hood with a brow gem, orbiting motes, a second lantern in the left hand
    for(let i=0;i<12;i++){const a=i/12*6.283,a2=(i+1)/12*6.283;if(Math.cos(a)>.8&&Math.cos(a2)>.8)continue;E.L(H(a,1.05,.19),H(a2,1.05,.19),.01,.01,'m',trim,4,hb)}
    E.pd('cone4','m',trim,H(0,1.1,.175),[0,1,.3],[.02,.06,.02],null,hb);E.pd('oct','g',P.glow,H(0,1.07,.2),[0,0,1],[.02,.026,.014],null,hb);
    [0,1,2,3,4].forEach(i=>{const a=i/5*6.283;E.pd('ico','g',P.glow,[Math.cos(a)*.3,.7+Math.sin(a*2)*.08,Math.sin(a)*.3-.04],[0,1,0],.018,null,{bn:'chest'})});
    lantern('fl2',[-.225,.55,.1],P.glow2)}
  if(L>=5){// a crown of spectral flames rising from the hood
    for(let i=-3;i<=3;i++){const a=i/3*1.3+Math.PI,p=H(a,1.08,.16);E.L(p,E.add(p,E.nrm([Math.sin(a)*.3,1,Math.cos(a)*.3]),.14-Math.abs(i)*.018),.022,.002,'g',i%2?P.glow:P.glow2,4,hb)}}
}};

