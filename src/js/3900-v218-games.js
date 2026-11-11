// ================= v218: two more games of chance at the Last Lantern — the Ember Wheel and the Four Roads =================
// Owner (Nov 10 2026): "Let's also add a wheel spin gambling game (like the game Rust has)" and "another card game where you bet on a
// card type (using the cards we created). There will be 4 suits available to choose from. The card dealer then flips over cards from a
// deck containing only those 4 suits. Each card flipped stacks onto the corresponding suit. First suit to 5 cards wins. Think of a fair
// payout that makes it worth playing for the risk."
//  * The Ember Wheel (WH218): a big wheel on the Inn's back wall over the fireside bench, 25 segments painted with the deck's emblems:
//    12 × The Lantern (pays 1:1), 6 × The Fang (3:1), 4 × The Raven (5:1), 2 × The Sealed Key (10:1), 1 × The Ashen Crown (20:1). Like
//    Rust's Big Wheel: put chips on as many symbols as you like (1–5 add a chip, the chip size from the panel), Space spins, the
//    stakes stay on for the next spin (Backspace clears). A symbol with n:1 comes up (25 / segments) of the time: every bet returns
//    84–96% over time (Lantern, Fang, Raven .96; Key .88; Crown .84). The pointer's leather flap clacks over the pegs as it slows.
//  * The Four Roads (RC218): a card table in the Inn's front-right corner (it took the place of the third dining table) with its
//    dealer Odile. Pick one of four suits (The Lantern, The Fang, The Raven, The Sealed Key; 1–4), a bet, Space: Odile turns cards
//    from a 36-card deck of those four suits (9 each, shuffled), each laid on its suit's road; the first road to 5 cards reaches the
//    gate and wins. Every suit wins 1 time in 4 (a fair price would be ×4): a win pays ×3.6 (your bet back and 2.6 more), a rout
//    (your suit at the gate while no other road has more than 2 cards, ~14% of wins) pays ×5. ~95% returned over time.
//  * Both: F at the spot opens the game's docked panel (#gm218w, not a pausing window), a seat camera frames the game above it and the
//    hero is hidden while playing (like Fate's Hand, 3850); Esc or walking off leaves. The bet and the gold stay with the player.
//  * Co-op: wh218Show (the spin: segment, turns, start angle) and rc218Show (the order the cards come out) are relayed like
//    cd213Show, so a partner in Duskhold sees the same wheel spin and the same race laid out on their own table.
var GM218={cur:null,root:null,col:[],err:0,camK:0,camT:null,plVis:true,chips:[10,20,50,100],
  // the game spots (lot-local in the Inn): where the player stands and faces, the seat camera [x,y,z, look x,y,z] (y over the floor)
  G:{wheel:{stand:[3.8,-2.3],face:Math.PI,cv:[3.8,2.05,-.95,3.8,1.55,-4.9],r:1.6,label:'F · Spin the Ember Wheel'},
     race:{stand:[3.6,4.3],face:Math.PI,cv:[3.6,2.45,4.7,3.6,.15,2.78],r:1.9,label:'F · Bet on the Four Roads at Odile’s table'}}};
var WH218={busy:false,th:0,st:{lan:0,fang:0,rav:0,key:0,crown:0},chip:20,res:null,stat:{n:0,bet:0,won:0},fx:null,tick:0,flap:0,
  c:[3.8,2.25,-4.74],R:1.0,
  M:{lan:1,fang:3,rav:5,key:10,crown:20},keys:['lan','fang','rav','key','crown'],
  // the 25 segments clockwise from the top: the Lanterns between every other symbol, the Crown alone at the top
  S:null,
  say:{win:['The wheel favours you.','Ha! The embers like you tonight.'],big:['The Crown! The whole wheel burns gold!','Twenty to one — and the wheel pays!'],lose:['Round and round. The Lantern keeps the house warm.','The wheel turns. So does fortune.']}};
(function(){const o=['crown','fang','rav','fang','key','fang','rav','fang','rav','key','fang','rav','fang'];const S=[];o.forEach((k,i)=>{S.push(k);if(i<12)S.push('lan')});WH218.S=S})();
var RC218={busy:false,suits:['lan','fang','rav','key'],pick:0,bet:20,res:null,stat:{n:0,bet:0,won:0},lay:[],heads:[],glow:[],fx:null,
  per:9,goal:5,pay:3.6,rout:5,c:[3.6,2.95],lz:[2.43,2.74,3.05,3.36],x0:2.68,dx:.27,deck:[4.52,2.45],T:{gap:.52,fly:.34},arm:0,armK:'reach',rig:null,dealer:null,
  say:{deal:['Four roads, one gate. Choose.','The cards run the roads. You only pray.','Pick your suit and hold your breath.'],
    near:['%s is one card from the gate!','%s is at the gate’s mouth!'],win:['%s takes the gate — and you with it!','Well picked. %s runs true.'],
    rout:['%s left the others in the dust!','A rout! %s never looked back.'],lose:['%s takes the gate. Not yours, I fear.','The roads were cruel. %s wins.']}};
function gm218L(x,z){return lotW103(DM196I.l,x,z)}
// ---------------- the Ember Wheel: the painted face ----------------
function wh218Face(){if(WH218.tex)return WH218.tex;const N=1024,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),cx=N/2,cy=N/2,R=N/2-6,S=WH218.S,A=6.2832/S.length;
  const F={lan:['#c87a1a','#6a3008'],fang:['#c8b890','#5a2418'],rav:['#6a4ab8','#1a1030'],key:['#2a9a84','#0c3a34'],crown:['#e8501a','#3a0c04']};
  g.fillStyle='#120806';g.beginPath();g.arc(cx,cy,R+6,0,6.2832);g.fill();
  S.forEach((k,i)=>{const a0=-Math.PI/2+(i-.5)*A,a1=a0+A,G=g.createRadialGradient(cx,cy,R*.18,cx,cy,R);G.addColorStop(0,F[k][1]);G.addColorStop(.55,F[k][0]);G.addColorStop(1,F[k][1]);
    g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,R,a0,a1);g.closePath();g.fillStyle=G;g.fill();
    // the emblem, upright toward the rim
    const am=-Math.PI/2+i*A;g.save();g.translate(cx+Math.cos(am)*R*.62,cy+Math.sin(am)*R*.62);g.rotate(am+Math.PI/2);g.scale(.42,.42);
    g.beginPath();g.arc(0,0,92,0,6.2832);g.fillStyle='rgba(10,6,4,.55)';g.fill();g.strokeStyle='#d4a54c';g.lineWidth=5;g.stroke();g.save();g.beginPath();g.arc(0,0,90,0,6.2832);g.clip();g.scale(.82,.82);try{CD213E[k](g)}catch(_){}g.restore();g.restore();
    // the multiplier near the rim
    g.save();g.translate(cx+Math.cos(am)*R*.88,cy+Math.sin(am)*R*.88);g.rotate(am+Math.PI/2);g.fillStyle='#fff0c8';g.strokeStyle='#120806';g.lineWidth=6;g.font='700 44px Cinzel, Georgia, serif';g.textAlign='center';g.textBaseline='middle';
    const t=WH218.M[k]+'';g.strokeText(t,0,0);g.fillText(t,0,0);g.restore()});
  // gold spokes between segments, the rims, the hub
  g.strokeStyle='#d4a54c';g.lineWidth=4;S.forEach((k,i)=>{const a=-Math.PI/2+(i+.5)*A;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.2,cy+Math.sin(a)*R*.2);g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.stroke()});
  [[R,8,'#d4a54c'],[R*.78,3,'rgba(212,165,76,.6)'],[R*.2,8,'#d4a54c']].forEach(([r,w,s])=>{g.beginPath();g.arc(cx,cy,r,0,6.2832);g.strokeStyle=s;g.lineWidth=w;g.stroke()});
  const H=g.createRadialGradient(cx-20,cy-20,4,cx,cy,R*.2);H.addColorStop(0,'#5a1a10');H.addColorStop(1,'#1a0604');g.beginPath();g.arc(cx,cy,R*.19,0,6.2832);g.fillStyle=H;g.fill();
  g.save();g.translate(cx,cy);g.scale(.62,.62);try{CD213E.crown(g)}catch(_){}g.restore();cd213Grain(g,0,0,N,N,.07,9);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;WH218.tex=t;WH218.can=c;return t}
// the stand: a dark board on the wall, a gilt rim, two posts, the pointer's bracket; the turning wheel; the pointer (its flap swings)
function wh218K(k){const [x,y,z]=WH218.c,R=WH218.R,wood=0x3a2416,woodD=0x22140c,gold=0xc9a24a;
  k.as('wood',()=>{k.p('c',woodD,'box',x,y,z-.12,2.5,2.5,.08,0,0,0,.02);[-1.2,1.2].forEach(o=>k.L('c',wood,[x+o,0,z-.05],[x+o,y+1.25,z-.05],.07,'box'));k.p('c',wood,'box',x,y+1.25,z-.06,2.6,.12,.14,0,0,0,.02)});
  for(let i=0;i<16;i++){const a=i/16*6.2832;k.p('m',gold,'box',x+Math.sin(a)*(R+.07),y+Math.cos(a)*(R+.07),z-.04,.12,.06,.06,0,0,-a,0)}
  k.p('m',gold,'cyl8',x,y,z-.03,R+.1,.04,R+.1,Math.PI/2,0,0,0);k.p('m',0x2a2420,'box',x,y+R+.2,z+.02,.22,.16,.12,0,0,0,.02)}
function wh218Build(root){const [x,y,z]=WH218.c,R=WH218.R;let k=null;if(!twHas('WH218FRM')){k=twKit(21801);wh218K(k)}root.add(twGroup(k,'WH218FRM'));
  const w=new THREE.Group();w.position.set(x,y,z+.02);root.add(w);WH218.wheel=w;w.rotation.z=WH218.th;
  const fm=new THREE.MeshBasicMaterial({map:wh218Face(),color:0xe0d8cc});fm.userData.noFade135=1;const face=new THREE.Mesh(WH218.fGeo||(WH218.fGeo=new THREE.CircleGeometry(R,50)),fm);w.add(face);
  const pm=WH218.pMat||(WH218.pMat=new THREE.MeshLambertMaterial({color:0xe8c060,emissive:0x3a2808})),pg=WH218.pGeo||(WH218.pGeo=new THREE.CylinderGeometry(.018,.018,.08,6));
  WH218.S.forEach((_,i)=>{const a=(i+.5)/WH218.S.length*6.2832,p=new THREE.Mesh(pg,pm);p.rotation.x=Math.PI/2;p.position.set(Math.sin(a)*R*.965,Math.cos(a)*R*.965,.04);w.add(p)});
  const hub=new THREE.Mesh(WH218.hGeo||(WH218.hGeo=new THREE.CylinderGeometry(.09,.11,.08,10)),pm);hub.rotation.x=Math.PI/2;hub.position.z=.04;w.add(hub);
  // the pointer: a leather flap hanging from the bracket at the top, its tip between two pegs
  const f=new THREE.Group();f.position.set(x,y+R+.16,z+.1);root.add(f);WH218.flapG=f;
  const lm=WH218.lMat||(WH218.lMat=new THREE.MeshLambertMaterial({color:0x6a2a14,emissive:0x1a0804}));const fl=new THREE.Mesh(WH218.lGeo||(WH218.lGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.07,0);s.lineTo(.07,0);s.lineTo(0,-.24);s.lineTo(-.07,0);return new THREE.ShapeGeometry(s)})()),lm);
  fl.material.side=THREE.DoubleSide;f.add(fl);const gm=new THREE.Mesh(WH218.gGeo||(WH218.gGeo=new THREE.SphereGeometry(.03,8,6)),pm);f.add(gm)}
function wh218Seg(th){const n=WH218.S.length,A=6.2832/n;return ((Math.round(th/A)%n)+n)%n}
// ---------------- the Four Roads: the board painted on the felt ----------------
function rc218Board(){if(RC218.tex)return RC218.tex;const W=1024,H=704,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  // board space: x 2.5…4.4 → 0…W, z 2.28…3.58 → 0…H
  const X=x=>(x-2.5)/1.9*W,Z=z=>(z-2.28)/1.3*H,D=CD213.D;
  g.fillStyle='#0e1a12';g.fillRect(0,0,W,H);const V=g.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.7);V.addColorStop(0,'rgba(40,70,50,.55)');V.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=V;g.fillRect(0,0,W,H);
  cd213Grain(g,0,0,W,H,.1,21);g.strokeStyle='#c9a24a';g.lineWidth=6;cd213RR(g,6,6,W-12,H-12,16);g.stroke();
  RC218.suits.forEach((k,j)=>{const zc=RC218.lz[j],y0=Z(zc-.145),y1=Z(zc+.145);
    g.fillStyle=`rgba(${j%2?'255,240,200,.05':'0,0,0,.18'})`;g.fillRect(X(2.52),y0,X(4.38)-X(2.52),y1-y0);
    g.strokeStyle='rgba(201,162,74,.5)';g.lineWidth=2;g.beginPath();g.moveTo(X(2.52),y1);g.lineTo(X(4.38),y1);g.stroke();
    for(let s=0;s<RC218.goal;s++){const xc=RC218.x0+RC218.dx*(s+1);g.strokeStyle='rgba(240,212,138,.35)';g.setLineDash([8,6]);cd213RR(g,X(xc-.1),Z(zc-.13),X(xc+.1)-X(xc-.1),Z(zc+.13)-Z(zc-.13),8);g.stroke();g.setLineDash([]);
      g.fillStyle='rgba(240,212,138,.4)';g.font='700 30px Cinzel, Georgia, serif';g.textAlign='center';g.textBaseline='middle';g.fillText(['I','II','III','IV','V'][s],X(xc),Z(zc))}});
  // the gate at the end of the roads
  const gx=X(RC218.x0+RC218.dx*(RC218.goal+1)-.12);g.fillStyle='rgba(255,200,90,.18)';g.fillRect(gx-10,Z(2.28),20,H);g.strokeStyle='#ffd24a';g.lineWidth=5;g.beginPath();g.moveTo(gx,14);g.lineTo(gx,H-14);g.stroke();
  g.save();g.translate(gx+26,H/2);g.rotate(Math.PI/2);g.fillStyle='#ffd24a';g.font='700 34px Cinzel, Georgia, serif';g.textAlign='center';g.fillText('THE GATE',0,0);g.restore();
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;RC218.tex=t;return t}
function rc218K(k){const [cx,cz]=RC218.c,wood=0x4a2e1c,woodD=0x2a1a10,gold=0xc9a24a;
  k.as('wood',()=>{k.p('c',wood,'box',cx,.68,cz,2.34,.08,1.5,0,0,0,.03);k.p('c',woodD,'box',cx,.61,cz,2.2,.07,1.38,0,0,0,.02);
    [[-1.02,-.6],[1.02,-.6],[-1.02,.6],[1.02,.6]].forEach(([u,v])=>k.L('c',woodD,[cx+u,0,cz+v],[cx+u,.64,cz+v],.06,'box'))});
  k.p('m',gold,'box',cx,.7,cz,2.38,.03,1.54,0,0,0,0);k.as('board',()=>k.p('c',0x5a0e18,'box',RC218.deck[0],.76,RC218.deck[1],.22,.06,.32,0,0,0,0));
  dc190Candle(k,cx+1.0,.74,cz-.62,.14);[[cx-1.0,cz-.62,4],[cx-.92,cz-.5,2]].forEach(([x,z,n])=>{for(let i=0;i<n;i++)k.p('m',0xd4a54c,'cyl8',x,.76+i*.022,z,.06,.012,.06,0,i*.4,0,0)})}
function rc218Build(root){const l=DM196I.l,T=TOWNS[0];let k=null;if(!twHas('RC218TBL')){k=twKit(21802);rc218K(k)}root.add(twGroup(k,'RC218TBL'));
  const bm=new THREE.MeshBasicMaterial({map:rc218Board(),color:0xd8d0c4});bm.userData.noFade135=1;const b=new THREE.Mesh(RC218.bGeo||(RC218.bGeo=new THREE.PlaneGeometry(1.9,1.3)),bm);
  b.rotation.x=-Math.PI/2;b.position.set(3.45,.723,2.93);b.renderOrder=1;root.add(b);
  // a face-up card at the head of each road (its suit)
  RC218.heads=RC218.suits.map((s,j)=>{const m=cd213CardMesh();m.scale.setScalar(.56);m.userData.face.material.map=cd213Can(s);m.userData.face.material.needsUpdate=true;m.position.set(RC218.x0,.732,RC218.lz[j]);root.add(m);return m});
  // Odile, the dealer, behind the table facing the room
  {const [nx,nz]=gm218L(RC218.c[0],RC218.c[1]-1.22),ng=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};
    try{npc(ng,nx,nz,{robe:0x1e3a2a,trim:0xc9a24a,label:'Odile · Race Dealer',ry:l.ry,fkSp:'doe',fkOut:'cit'})}finally{T_cur=prev}ng.position.y=GH(nx,nz);scene.add(ng);RC218.dealer=ng;RC218.rig=ng.children[0]||null}}
function gm218Build(){try{const l=DM196I.l;if(!l||typeof TOWNS=='undefined'||typeof CD213=='undefined')return;const T=TOWNS[0];
  if(GM218.root)scene.remove(GM218.root);if(RC218.dealer&&RC218.dealer.parent)RC218.dealer.parent.remove(RC218.dealer);RC218.heads.forEach(m=>{m.userData.face.material.dispose();m.userData.back.material.dispose()});
  (WH218.wheel?WH218.wheel.children:[]).forEach(m=>{if(m.material&&m.material.map===WH218.tex)m.material.dispose()});
  const root=new THREE.Group(),[ox,oz]=gm218L(0,0);root.position.set(ox,T.ph,oz);root.rotation.y=l.ry;root.name='gm218';root.userData.lpsSkip=1;scene.add(root);GM218.root=root;
  wh218Build(root);rc218Build(root);
  const C=[];[[RC218.c[0]-.75,RC218.c[1]],[RC218.c[0],RC218.c[1]],[RC218.c[0]+.75,RC218.c[1]]].forEach(([x,z])=>{const [X,Z]=gm218L(x,z);C.push({x:X,z:Z,r:.72})});
  {const [X,Z]=gm218L(RC218.c[0],RC218.c[1]-1.22);C.push({x:X,z:Z,r:.32})}
  kfColSet109(GM218.col,C);DM196S.col=(DM196S.col||[]).filter(c=>GM218.col.indexOf(c)<0).concat(GM218.col)}catch(err){console.warn('v218 games',err)}}
{const f=dm196InnBuild;dm196InnBuild=function(){const r=f.apply(this,arguments);gm218Build();return r}}
gm218Build();
// Odile's dealing arm, set the way Corvin's is (3850): the idle pauses while she poses and her bones go back exactly after
{const f=idlNpc;idlNpc=function(g,now){if(!RC218.rig||g!==RC218.rig||!g.bones)return f.apply(this,arguments);
  const b=g.bones,v=Math.max(0,Math.min(1,RC218.arm||0));
  if(v>0){if(!RC218.S0){RC218.S0={};CD213B.forEach(n=>{if(b[n])RC218.S0[n]=b[n].rotation.clone()})}const P=CD213P[RC218.armK||'reach']||CD213P.reach;
    CD213B.forEach(n=>{const o=b[n],B=RC218.S0[n];if(!o||!B)return;const d=P[n]||[0,0,0];o.rotation.set(B.x+d[0]*v,B.y+d[1]*v,B.z+d[2]*v)});return}
  if(RC218.S0){CD213B.forEach(n=>{if(b[n]&&RC218.S0[n])b[n].rotation.copy(RC218.S0[n])});RC218.S0=null}
  return f.apply(this,arguments)}}
// ---------------- words over a game (the plaque and the dealer's line; 3850's canvas sprites) ----------------
function gm218Plaque(key,L,pos,w){const o=GM218.plq=GM218.plq||{};cd213Drop(o[key]);o[key]=null;if(!L||!GM218.root)return;const sp=cd213Sprite(cd213Text(L,620,L.length*75),w||.84);sp.position.set(...pos);GM218.root.add(sp);o[key]=sp;
  const t0=nowP(),y0=pos[1];kqFx({tick(){if(o[key]!==sp)return false;const a=(nowP()-t0)/1000;sp.material.opacity=Math.min(1,a*4);sp.position.y=y0+Math.min(.05,a*.2);return true}})}
function gm218Say(key,t,pos,sc){try{const o=GM218.bub=GM218.bub||{};cd213Drop(o[key]);o[key]=null;if(!t||!GM218.root)return;const w=Math.min(900,90+t.length*15),sp=cd213Sprite(cd213Text([{t:'“'+t+'”',f:'italic 600 26px Cinzel, Georgia, serif',c:'#f0e2c0'}],w,70),(sc||.0016)*w);
  sp.position.set(...pos);GM218.root.add(sp);o[key]=sp;const t0=nowP();
  kqFx({tick(){if(o[key]!==sp)return false;const a=(nowP()-t0)/1000;sp.material.opacity=a<.2?a*5:a>3.6?Math.max(0,1-(a-3.6)*2.5):1;if(a>4.1){cd213Drop(sp);o[key]=null;return false}return true}})}catch(_){}}
function gm218Pick(L,name){const t=L[Math.floor(Math.random()*L.length)];return name?t.replace('%s',name):t}
function gm218W(x,y,z){const [X,Z]=gm218L(x,z);return new THREE.Vector3(X,TOWNS[0].ph+y,Z)}
// a win's light and coins at a game: tier 1 small … 3 the big one
function gm218Win(p,tier,col){try{col=col||0xffd24a;burst(p,col,10+tier*10,1.2+tier*.5,1.4+tier*.4,.6);if(tier>=2){ring(p.clone().setY(p.y-.05),col,1.2+tier*.5,450);kqFlash(p,0xffe0a0,.9+tier*.3,260)}
  if(tier>=3){burst(p,0xff7a2a,40,3,3,1);kqFlash(p,0xffd890,2.2,450);try{flash('rgba(255,190,80,.2)')}catch(_){}try{if(!(typeof MPV!='undefined'&&MPV.rep)&&SET.shake!==false)shake(.15)}catch(_){}
    setTimeout(()=>{try{ring(p,0xffd24a,3,600);burst(p,0xffd24a,26,2.4,3,.8)}catch(_){}},420)}}catch(_){}}
// ---------------- the Ember Wheel: a spin (relayed: a partner's wheel turns the same way) ----------------
// i: the segment that comes up, n: whole turns, th0: the angle it starts from, dur: seconds, jit: where in the segment it stops (-.35….35)
function wh218Show(i,n,th0,dur,jit){try{if(!WH218.wheel)return;const rep=typeof MPV!='undefined'&&MPV.rep>0;if(rep&&WH218.busy)return;i=(i|0)%WH218.S.length;n=Math.max(2,Math.min(8,n|0));dur=Math.max(3,Math.min(9,+dur||6.5));jit=Math.max(-.35,Math.min(.35,+jit||0));
  if(WH218.fx)WH218.fx.dead=1;gm218Plaque('wh',null);const A=6.2832/WH218.S.length,a0=+th0||0,base=a0-(a0%6.2832+6.2832)%6.2832,th1=base+6.2832*n+(i+jit)*A,w=WH218.wheel;
  let t=0,last=Math.floor((a0+A/2)/A);const o={tick(dt){if(o.dead)return false;t+=dt;const k=Math.min(1,t/dur),e=1-Math.pow(1-k,4);WH218.th=a0+(th1-a0)*e;w.rotation.z=WH218.th;
      const pg=Math.floor((WH218.th+A/2)/A);if(pg!==last){last=pg;WH218.flap=Math.min(1,WH218.flap+.8);wh218Snd('tick',rep?.4:1)}
      WH218.flap*=Math.pow(.0005,dt);if(WH218.flapG)WH218.flapG.rotation.z=-WH218.flap*.55;
      if(k>=1){if(!o.done){o.done=1;if(WH218.flapG)WH218.flapG.rotation.z=0;try{o.end2&&o.end2()}catch(_){}wh218Result(i,o.pay)}return false}return true}};
  WH218.fx=o;kqFx(o);return o}catch(err){if(!GM218.err++)console.warn('v218 wheel',err)}}
// the end of a spin on every screen: the symbol named on a plaque in front of the wheel, a light for a win (pay: what the player won)
function wh218Result(i,pay){try{const k=WH218.S[i],D=CD213.D,m=WH218.M[k],[x,y,z]=WH218.c,p=gm218W(x,y+WH218.R,z+.2);
  const L=[{t:D[k].n.toUpperCase()+'  ·  '+m+' : 1',f:'700 32px Cinzel, Georgia, serif',c:k==='crown'?'#ffb070':'#ffe2a0'}];
  if(pay!=null)L.push(pay>0?{t:'+'+pay+' gold',f:'700 40px Cinzel, Georgia, serif',c:'#ffd24a'}:{t:'the wheel keeps your stakes',f:'600 26px Cinzel, Georgia, serif',c:'#8a8278'});
  gm218Plaque('wh',L,[x+1.8,y-.35,z+.6],1.4);burst(p,0xffd24a,6,.6,.8,.4);
  if(pay>0||k==='crown'&&pay==null)gm218Win(gm218W(x,y,z+.3),k==='crown'?3:m>=5?2:1,k==='crown'?0xff8a3a:0xffd24a);if(k==='crown')wh218Snd('crown',typeof MPV!='undefined'&&MPV.rep>0?.5:1)}catch(err){if(!GM218.err++)console.warn('v218 wheel result',err)}}
function wh218Stake(){return WH218.keys.reduce((s,k)=>s+WH218.st[k],0)}
function wh218Add(k){if(WH218.busy||!WH218.st.hasOwnProperty(k))return;const c=WH218.chip;if(wh218Stake()+c>gold){gm218Say('wh','Your purse can’t cover that chip.',[WH218.c[0]-1.95,2.9,WH218.c[2]+.6],.0024);return}if(WH218.st[k]+c>1000)return;WH218.st[k]+=c;wh218Snd('chip');gm218Render()}
function wh218Clear(){if(WH218.busy)return;WH218.keys.forEach(k=>WH218.st[k]=0);gm218Render()}
function wh218Spin(){if(WH218.busy)return;const tot=wh218Stake();if(!tot){gm218Say('wh','Put a chip on a symbol first.',[WH218.c[0]-1.95,2.9,WH218.c[2]+.6],.0024);return}if(gold<tot){gm218Say('wh','Your purse is lighter than your stakes.',[WH218.c[0]-1.95,2.9,WH218.c[2]+.6],.0024);return}
  gold-=tot;const i=Math.floor(Math.random()*WH218.S.length),k=WH218.S[i],st=Object.assign({},WH218.st),win=st[k]?st[k]*(WH218.M[k]+1):0;WH218.busy=true;WH218.res=null;WH218.stat.n++;WH218.stat.bet+=tot;
  try{hud()}catch(_){}gm218Render();const o=wh218Show(i,4+Math.floor(Math.random()*3),WH218.th,6+Math.random()*1.5,(Math.random()-.5)*.7);
  const fin=()=>{WH218.busy=false;gold+=win;WH218.stat.won+=win;WH218.res={i,k,win,bet:tot,st};if(o)o.pay=win;
    wh218Snd(win>0?(k==='crown'?'none':'win'):'lose');gm218Say('wh',gm218Pick(win>0?(k==='crown'?WH218.say.big:WH218.say.win):WH218.say.lose),[WH218.c[0]-1.95,2.9,WH218.c[2]+.6],.0024);
    if(win>0)try{say('🎡 Ember Wheel: '+CD213.D[k].n+' ('+WH218.M[k]+':1) — you win '+win+' gold.')}catch(_){}
    if(gold<wh218Stake())wh218Clear();try{hud()}catch(_){}gm218Render()};
  if(o)o.end2=fin;else{fin();wh218Result(i,win)}}
// ---------------- the Four Roads: a race (relayed: a partner sees the same cards run the same roads) ----------------
// seq: the suits in the order the cards come out (indices into RC218.suits) up to the winning card; pick: the player's suit (-1 = none)
function rc218Seq(){const d=[];for(let s=0;s<4;s++)for(let i=0;i<RC218.per;i++)d.push(s);for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=d[i];d[i]=d[j];d[j]=t}
  const c=[0,0,0,0],out=[];for(const s of d){out.push(s);if(++c[s]>=RC218.goal)break}return out}
function rc218Count(seq){const c=[0,0,0,0];seq.forEach(s=>c[s]++);const w=seq[seq.length-1],rout=Math.max(...c.filter((v,j)=>j!==w))<=2;return {c,w,rout}}
function rc218Clear(){if(RC218.fx){RC218.fx.dead=1;RC218.fx=null}RC218.lay.forEach(m=>{if(m.parent)m.parent.remove(m);m.userData.face.material.dispose();m.userData.back.material.dispose()});RC218.lay=[];
  RC218.glow.forEach(m=>{if(m.parent)m.parent.remove(m);m.material.dispose()});RC218.glow=[];gm218Plaque('rc',null)}
function rc218Lane(j,col,op){const g=new THREE.Mesh(RC218.gGeo||(RC218.gGeo=new THREE.PlaneGeometry(1.86,.29)),new THREE.MeshBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:op}));
  g.material.userData.noFade135=1;g.rotation.x=-Math.PI/2;g.position.set(3.45,.726,RC218.lz[j]);g.renderOrder=2;GM218.root.add(g);RC218.glow.push(g);return g}
function rc218Show(seq,pick,bet){try{if(!GM218.root||!Array.isArray(seq)||!seq.length||seq.length>40)return;const rep=typeof MPV!='undefined'&&MPV.rep>0;if(rep&&RC218.busy)return;
  seq=seq.map(s=>Math.max(0,Math.min(3,s|0)));pick=pick==null||rep?-1:pick|0; // a partner's replay names no pick of theirs
  bet=+bet||0;rc218Clear();const R=GM218.root,T=RC218.T,L=[],cnt=[0,0,0,0],[dx0,dz0]=RC218.deck;
  if(pick>=0)rc218Lane(pick,0x8ac8ff,.16);
  seq.forEach((s,i)=>{const m=cd213CardMesh();m.scale.setScalar(.56);m.userData.face.material.map=cd213Can(RC218.suits[s]);m.userData.face.material.needsUpdate=true;m.userData.f.rotation.z=Math.PI;
    m.position.set(dx0,.8,dz0);m.visible=false;m.userData.slot=[RC218.x0+RC218.dx*(cnt[s]+1),RC218.lz[s]];cnt[s]++;m.userData.n=cnt[s];m.userData.s=s;R.add(m);L.push(m)});RC218.lay=L;
  const tEnd=seq.length*T.gap+T.fly+.2;let t=0,said4=false;
  const o={tick(dt){if(o.dead)return false;t+=dt;
      for(let i=0;i<L.length;i++){const m=L[i],t0=i*T.gap,k=Math.max(0,Math.min(1,(t-t0)/T.fly));m.visible=t>=t0;if(!m.visible)continue;const [sx,sz]=m.userData.slot,e=haIO(k);
        m.position.set(dx0+(sx-dx0)*e,.74+.06*(1-e)+Math.sin(k*Math.PI)*.16+.001*m.userData.n,dz0+(sz-dz0)*e);m.userData.f.rotation.z=Math.PI*(1-haIO(Math.min(1,k*1.25)));m.rotation.y=(1-e)*.5;
        if(!m.userData.dl){m.userData.dl=1;cd213Snd('flip',rep?.5:1)}
        if(k>=1&&!m.userData.ld){m.userData.ld=1;if(m.userData.n===RC218.goal-1&&!said4&&i<L.length-1){said4=true;rc218Say(gm218Pick(RC218.say.near,CD213.D[RC218.suits[m.userData.s]].n))}}}
      const u=(t%T.gap)/T.gap;RC218.armK='reach';RC218.arm=t<seq.length*T.gap?Math.sin(Math.min(1,u*1.6)*Math.PI)*.8:0;
      if(t>=tEnd){if(!o.done){o.done=1;RC218.arm=0;try{o.end2&&o.end2()}catch(_){}rc218Result(seq,pick,bet)}return false}return true},end(){RC218.arm=0}};
  RC218.fx=o;kqFx(o);return o}catch(err){if(!GM218.err++)console.warn('v218 race',err)}}
function rc218Say(t){gm218Say('rc',t,[RC218.c[0]-.75,2.0,RC218.c[1]-1.15],.0019)}
function rc218Pay(seq,pick){const r=rc218Count(seq);return pick===r.w?(r.rout?RC218.rout:RC218.pay):0}
function rc218Result(seq,pick,bet){try{const r=rc218Count(seq),D=CD213.D,nm=D[RC218.suits[r.w]].n,m=rc218Pay(seq,pick),win=Math.floor(bet*m);
  rc218Lane(r.w,0xffc040,.0);const g=RC218.glow[RC218.glow.length-1],t0=nowP();kqFx({tick(){if(!g.parent)return false;const a=(nowP()-t0)/1000;g.material.opacity=Math.min(.45,a*1.5)*(.75+.25*Math.sin(a*5));return true}});
  const L=[{t:nm.toUpperCase()+(r.rout?' — A ROUT!':' TAKES THE GATE'),f:'700 30px Cinzel, Georgia, serif',c:'#ffe2a0'}];
  if(pick>=0)L.push(m>0?{t:'+'+win+' gold   (×'+m+')',f:'700 40px Cinzel, Georgia, serif',c:'#ffd24a'}:{t:'your '+D[RC218.suits[pick]].n.replace('The ','')+' falls short',f:'600 26px Cinzel, Georgia, serif',c:'#8a8278'});
  gm218Plaque('rc',L,[RC218.c[0]+.15,1.0,RC218.c[1]-.8],.95);RC218.armK='open';rc218Gest(m>0?'open':'sweep');
  rc218Say(gm218Pick(pick<0?RC218.say.win:m>0?(r.rout?RC218.say.rout:RC218.say.win):RC218.say.lose,nm));
  if(m>0)gm218Win(gm218W(RC218.x0+RC218.dx*RC218.goal,.85,RC218.lz[r.w]),r.rout?3:2)}catch(err){if(!GM218.err++)console.warn('v218 race result',err)}}
function rc218Gest(k){const t0=nowP(),ms=k==='open'?1100:900;RC218.armK=k;kqFx({tick(){if(RC218.busy&&RC218.armK!==k)return false;const a=(nowP()-t0)/ms;if(a>=1){if(RC218.armK===k)RC218.arm=0;return false}RC218.armK=k;RC218.arm=Math.sin(Math.min(1,a)*Math.PI);return true}})}
function rc218Deal(){if(RC218.busy)return;const b=RC218.bet,p=RC218.pick;if(gold<b){rc218Say('Your purse is lighter than your courage.');return}
  gold-=b;const seq=rc218Seq(),m=rc218Pay(seq,p),win=Math.floor(b*m);RC218.busy=true;RC218.res=null;RC218.stat.n++;RC218.stat.bet+=b;try{hud()}catch(_){}gm218Render();
  if(Math.random()<.4)rc218Say(gm218Pick(RC218.say.deal));const o=rc218Show(seq,p,b);
  const fin=()=>{RC218.busy=false;gold+=win;RC218.stat.won+=win;const r=rc218Count(seq);RC218.res={seq,pick:p,win,bet:b,w:r.w,rout:r.rout};
    cd213Snd(m>0?(r.rout?'jack':'win'):'lose');if(win>0)try{say('🃏 Four Roads: '+CD213.D[RC218.suits[r.w]].n+(r.rout?' won by a rout':' took the gate')+' — you win '+win+' gold.')}catch(_){}
    try{hud()}catch(_){}gm218Render()};
  if(o)o.end2=fin;else{fin();rc218Result(seq,p,b)}}
(function(){if(typeof MPV=='undefined'||!MPV.FX||typeof MPV_FX=='undefined')return;
  ['wh218Show','rc218Show'].forEach(n=>{const f=window[n];if(typeof f!='function')return;if(MPV_FX[n]==null){MPV_FX[n]=MPV.FX.length;MPV.FX.push(n)}
    window[n]=function(){if(MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
// ---------------- sitting down, the panel, the keys ----------------
function gm218Near(id){if(GM218.cur||CD213.open)return false;try{if(!DM196I.l)return false;const G=GM218.G[id],[sx,sz]=gm218L(...G.stand);return Math.hypot(pl.position.x-sx,pl.position.z-sz)<G.r&&townAt(pl.position.x,pl.position.z,0)===0}catch(_){return false}}
function gm218Open(id){const l=DM196I.l,G=GM218.G[id];if(!l||!G||GM218.cur||CD213.open)return;const [sx,sz]=gm218L(...G.stand);pl.position.x=sx;pl.position.z=sz;pl.rotation.y=l.ry+G.face;
  GM218.cur=id;GM218.camK=0;GM218.plVis=pl.visible;pl.visible=false;gm218Panel().classList.remove('hide');gm218Render();try{GD213&&gd213Up()}catch(_){}
  if(id==='race')rc218Say(gm218Pick(RC218.say.deal))}
function gm218Close(){if(!GM218.cur)return;GM218.cur=null;pl.visible=GM218.plVis!==false;const w=$('gm218w');if(w)w.classList.add('hide')}
function gm218Panel(){let w=$('gm218w');if(w)return w;w=document.createElement('div');w.id='gm218w';w.className='hide';
  w.innerHTML=`<div class="win"><div class="wh"><h2 id="gm218T"></h2><span class="wsub" id="gm218S"></span><button class="x" id="gm218X" title="Leave (Esc)">✕</button></div><div class="wb" id="gm218B"></div></div>`;
  ($('stage')||document.body).appendChild(w);w.addEventListener('pointerdown',e=>e.stopPropagation());
  w.addEventListener('click',e=>{const b=e.target.closest('[data-gc],[data-gs],[data-gw],[data-gp],[data-gb],[data-ga],#gm218X');if(!b||b.disabled)return;if(b.id==='gm218X'){gm218Close();return}const d=b.dataset;
    if(d.gc){WH218.chip=+d.gc;gm218Render()}else if(d.gs)wh218Add(d.gs);else if(d.gw)(d.gw==='clear'?wh218Clear():wh218Spin());
    else if(d.gp){if(!RC218.busy){RC218.pick=+d.gp;gm218Render()}}else if(d.gb){if(!RC218.busy){RC218.bet=+d.gb;gm218Render()}}else if(d.ga)rc218Deal()});return w}
function gm218Render(){if(!GM218.cur)return;gm218Panel();const D=CD213.D,chips=(on,attr,busy)=>GM218.chips.map(c=>`<button class="cd213b${c===on?' on':''}" ${attr}="${c}" ${busy?'disabled':''}>${c} 🪙</button>`).join('');
  if(GM218.cur==='wheel'){$('gm218T').textContent='🎡 The Ember Wheel';$('gm218S').textContent='1–5 add a chip · Space spins · Backspace clears · Esc leaves';const tot=wh218Stake(),n=WH218.S.length;
    const syms=WH218.keys.map((k,i)=>{const c=WH218.S.filter(x=>x===k).length;return `<button class="gm218s${WH218.st[k]?' on':''}" data-gs="${k}" ${WH218.busy?'disabled':''} title="${D[k].n}: ${c} of ${n} segments, pays ${WH218.M[k]}:1"><img src="${cd213Url(k)}"><b>${WH218.M[k]}:1</b><i>${c}/${n}</i><u>${WH218.st[k]?WH218.st[k]+' 🪙':'—'}</u><kbd>${i+1}</kbd></button>`}).join('');
    $('gm218B').innerHTML=`<div class="cd213ctl"><span class="mut">Chip</span>${chips(WH218.chip,'data-gc',WH218.busy)}<button class="cd213d" data-gw="spin" ${WH218.busy||!tot||gold<tot?'disabled':''}>${WH218.busy?'Spinning…':'Spin · '+tot+' 🪙'}</button><button class="cd213b" data-gw="clear" ${WH218.busy||!tot?'disabled':''}>Clear</button><span class="cd213gold">Purse 🪙 ${gold}</span></div>
      <div class="gm218g">${syms}</div><div class="mut cd213pn">Chips on any symbols. Where the pointer stops pays its number : 1 (your chips back too). Stakes stay on.</div>`}
  else{$('gm218T').textContent='🃏 The Four Roads';$('gm218S').textContent='1–4 pick a suit · Space / Enter deal · Esc leaves';
    const su=RC218.suits.map((k,i)=>`<button class="gm218s${RC218.pick===i?' on':''}" data-gp="${i}" ${RC218.busy?'disabled':''} title="${D[k].n}"><img src="${cd213Url(k)}"><b>${D[k].n.replace('The ','')}</b><i>1 in 4</i><kbd>${i+1}</kbd></button>`).join('');
    $('gm218B').innerHTML=`<div class="cd213ctl"><span class="mut">Bet</span>${chips(RC218.bet,'data-gb',RC218.busy)}<button class="cd213d" data-ga="1" ${RC218.busy||gold<RC218.bet?'disabled':''}>${RC218.busy?'The roads are run…':'Deal · '+RC218.bet+' 🪙 on '+D[RC218.suits[RC218.pick]].n}</button><span class="cd213gold">Purse 🪙 ${gold}</span></div>
      <div class="gm218g">${su}</div><div class="mut cd213pn">Odile turns cards from a deck of these four suits; each goes on its suit’s road. First road to ${RC218.goal} cards reaches the gate. Your suit wins: ×${RC218.pay} back. Wins by a rout (no other road past 2): ×${RC218.rout}.</div>`}}
addEventListener('keydown',e=>{if(!GM218.cur)return;const k=String(e.key||'').toLowerCase();if(e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  if(k==='escape'){gm218Close();return}
  if(GM218.cur==='wheel'){if(k===' '||k==='enter')wh218Spin();else if(k==='backspace'||k==='delete')wh218Clear();else if(k>='1'&&k<='5')wh218Add(WH218.keys[+k-1])}
  else{if(k===' '||k==='enter')rc218Deal();else if(k>='1'&&k<='4'&&!RC218.busy){RC218.pick=+k-1;gm218Render()}}},true);
addEventListener('keyup',e=>{if(GM218.cur)e.stopImmediatePropagation()},true);
{const f=swing;swing=function(){if(GM218.cur)return;return f.apply(this,arguments)}}
function gm218Cam(dt){const l=DM196I.l,T=TOWNS[0],G=GM218.G[GM218.cur];if(!l||!G)return;GM218.camK=Math.min(1,(GM218.camK||0)+dt*2.2);const e=haIO(GM218.camK),C=G.cv,[px,pz]=gm218L(C[0],C[2]),[lx,lz]=gm218L(C[3],C[5]);
  const P=new THREE.Vector3(px,T.ph+C[1],pz),Lk=new THREE.Vector3(lx,T.ph+C[4],lz);cam.position.lerp(P,e);look.lerp(Lk,e);cam.lookAt(look);cam.updateMatrixWorld();try{FADE.cam.value.copy(cam.position)}catch(_){}}
{const s=document.createElement('style');s.textContent=`
#gm218w{position:absolute;left:0;right:0;bottom:6px;z-index:6;display:flex;justify-content:center;pointer-events:none}#gm218w.hide{display:none}
#gm218w .win{pointer-events:auto;width:min(720px,98%);max-height:34vh;overflow:auto}#gm218w .wb{padding:6px 10px}
.gm218g{display:flex;gap:6px;justify-content:center;margin-top:7px;flex-wrap:wrap}
.gm218s{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto auto;column-gap:6px;align-items:center;padding:4px 8px!important;position:relative;min-width:92px}
.gm218s img{grid-row:1/4;width:30px;height:45px;border-radius:3px}.gm218s b{color:#f0d48a;font-size:.78rem}.gm218s i{font-style:normal;font-size:.62rem;color:#b8a888}.gm218s u{text-decoration:none;font-size:.7rem;color:#fff0c8}
.gm218s kbd{position:absolute;top:2px;right:4px;font-size:.55rem;color:#8a7a5a}.gm218s.on{box-shadow:0 0 0 1px #ffd24a,0 0 8px rgba(255,210,74,.4);color:#ffe8a8}
body.mob .gm218s img{width:22px;height:33px}body.mob .gm218s{min-width:70px}`;document.head.appendChild(s)}
// the walk-up prompts
{const f=townPortalPrompt;townPortalPrompt=function(T){try{if(T&&T===TOWNS[0]){for(const id of ['wheel','race'])if(gm218Near(id))return {label:GM218.G[id].label,fn:()=>gm218Open(id)}}}catch(_){}return f.apply(this,arguments)}}
// per frame: the seat camera; leave if pulled away; the race's cards go away a while after
{const f=townTick;townTick=function(now,pp){const r=f.apply(this,arguments);try{if(GM218.cur){const n=nowP(),dt=Math.min(.05,(n-(GM218.camT||n))/1000);GM218.camT=n;gm218Cam(dt);
      dp[0]=dp[1]=0;const [sx,sz]=gm218L(...GM218.G[GM218.cur].stand);if(Math.hypot(pl.position.x-sx,pl.position.z-sz)>1.2||hero.hp<=0||uiOpen())gm218Close()}else GM218.camT=null;
    if(RC218.lay.length&&!RC218.busy&&GM218.cur!=='race'){RC218.idle=(RC218.idle||0)+1;if(RC218.idle>60*25){rc218Clear();RC218.idle=0}}else RC218.idle=0}catch(_){}return r}}
// ---------------- sounds ----------------
function wh218Snd(k,vol){try{if(typeof SET!='undefined'&&(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0)))return;const a=typeof snd208Bus=='function'?snd208Bus():null;if(!a||a.state!='running')return;
  const t0=a.currentTime;vol=vol||1;const T=(ty,f0,f1,at,dur,v,o)=>{o=Object.assign({},o||{},{dur,v});const t=t0+at,s=a.createOscillator();s.type=ty;s.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);const e=snd208V(a,s,o,t,vol);s.start(t);s.stop(e)},
    N=(f0,f1,at,dur,v,o)=>{if(typeof NOISE=='undefined'||!NOISE)return;o=Object.assign({bp:f0},o||{},{dur,v,f1});const t=t0+at,s=a.createBufferSource();s.buffer=NOISE;s.loop=true;const e=snd208V(a,s,o,t,vol);s.start(t,Math.random()*.5);s.stop(e)};
  ({tick:()=>{N(2200,1600,0,.03,.09,{q:2,atk:.001});T('square',900,500,0,.02,.012,{atk:.001})},chip:()=>{T('sine',2600,2600,0,.12,.03,{atk:.002});T('sine',3900,3900,.02,.1,.015,{atk:.002})},
    win:()=>cd213Snd('win'),lose:()=>cd213Snd('lose'),crown:()=>cd213Snd('jack'),none:()=>{}})[k]?.()}catch(_){}}
