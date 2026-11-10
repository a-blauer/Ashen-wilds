// ================= v213: Fate's Hand — the card table at the Last Lantern =================
// Owner (Nov 9 2026): "add a gambling table that functions similar to a slot machine but the npc lays down cards to function as the
// symbols. Make the cards completely custom and themed for our fantasy world."
//  * The table stands in the Inn (DM196I.card, lot-local; 3640 made the room bigger for it), the dealer Corvin behind it on the left
//    wall's side, the player's spot on the room side. F at the table opens the card panel (#cd213w, docked at the bottom; not one of
//    the pausing windows, so the room and the dealing keep moving; keys go to the panel: Space / Enter deal, Esc leaves) and a table
//    camera (cd213Cam, set over the follow camera in the townTick that runs after it) frames the table above the panel.
//  * A hand: pick a bet (CD213.bets), Deal. Corvin lays three cards face down from the deck, then turns them one by one (the reels).
//    Three alike pay CD213.D[k].p × the bet; The Wanderer stands in for any card (three Wanderers pay the most); The Hollow stands
//    in for nothing; any two alike (a Wanderer counts) give 1.5× back. Card weights CD213.D[k].w: ~41% of hands pay something, the
//    house keeps ~12% over time (a gold sink: loot and gold are tuned down on purpose, ECON96).
//  * The deck is painted here (cd213Paint): nine cards of Duskhold's own tarot — I The Lantern, II The Fang, III The Goblet,
//    IV The Raven, V The Sealed Key, VI The Hundred Eyes, VII The Ashen Crown, 0 The Wanderer (wild), XIII The Hollow — and a back.
//    The same canvases are the 3D cards' faces and the window's pictures.
//  * Co-op: cd213Show (the dealing, plain card keys) is relayed, so a partner sees Corvin lay the same cards on their table; the bet
//    and the gold stay with the player.
var CD213={bets:[10,20,50,100],bet:20,busy:false,cards:null,res:null,line:'',stat:{n:0,won:0,bet:0},tex:{},url:{},root:null,dealer:null,col:[],cam:null,arm:0,fx:null,own:false,err:0,
  stand:[-2.3,1.8],cv:[-.9,3.6,2.2,-3.75,-1.15,1.8],deck:[-4.2,1.62],T:{deal:.38,gap:.34,flip:.3,fgap:.36},
  D:{lan:{n:'The Lantern',num:'I',w:20,p:5,c:['#ffcf7a','#7a3a10'],d:'A light kept burning against the dark.'},
     fang:{n:'The Fang',num:'II',w:18,p:6,c:['#f0e2c4','#5a1a14'],d:'What hunts in Kindlelight leaves its teeth behind.'},
     gob:{n:'The Goblet',num:'III',w:15,p:8,c:['#ff6a6a','#4a0810'],d:'Drink deep; the Citadel always does.'},
     rav:{n:'The Raven',num:'IV',w:13,p:10,c:['#b89aff','#1a1030'],d:'It carries word between the living and the not.'},
     key:{n:'The Sealed Key',num:'V',w:10,p:15,c:['#7ae8d0','#0c3a34'],d:'Every gate in Duskhold has one. Most are lost.'},
     eye:{n:'The Hundred Eyes',num:'VI',w:7,p:25,c:['#ffd25a','#5a2a04'],d:'Argus sees the hand before it is dealt.'},
     crown:{n:'The Ashen Crown',num:'VII',w:4,p:50,c:['#ff8a3a','#3a0c04'],d:'A Sovereign’s crown, still warm from the pyre.'},
     wild:{n:'The Wanderer',num:'0',w:5,p:100,c:['#9ad0ff','#0a1a34'],d:'Wild: stands in for any card.'},
     hol:{n:'The Hollow',num:'XIII',w:16,p:0,c:['#b8c4b0','#141a14'],d:'Pays nothing, and stands in for nothing.'}},
  order:['crown','eye','key','rav','gob','fang','lan','wild','hol'],
  say:{deal:['The cards remember every hand.','Fate deals. Fools pay. Let us see which you are.','Cut the deck? No. Corvin cuts the deck.','Three cards. One fortune.'],
    win:['The Lantern smiles on you tonight.','Hm. The deck likes you.','Take it before the deck changes its mind.'],
    big:['The house weeps!','By the Ashen Crown — again!','Drinks are on you, friend.'],
    lose:['The Hollow takes its due.','The deck is hungry tonight.','Another hand? Fortune turns.'],
    pair:['A pair — your coin comes home with a friend.','Two of a kind. Small mercies.']}};
// ---------------- the deck: paintings ----------------
function cd213RR(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function cd213Grain(g,x,y,w,h,a,seed){let s=seed||7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let i=0;i<w*h/22;i++){g.fillStyle=R()<.5?`rgba(0,0,0,${a*R()})`:`rgba(255,240,210,${a*.6*R()})`;g.fillRect(x+R()*w,y+R()*h,1+R()*1.5,1+R()*1.5)}}
function cd213Ink(g,w){g.lineJoin='round';g.lineCap='round';g.strokeStyle='#120a06';g.lineWidth=w||3;g.stroke()}
function cd213Glow(g,x,y,r,col,a){const G=g.createRadialGradient(x,y,0,x,y,r);G.addColorStop(0,col);G.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a==null?1:a;g.fillStyle=G;g.fillRect(x-r,y-r,2*r,2*r);g.globalAlpha=1}
function cd213Lin(g,x0,y0,x1,y1,stops){const G=g.createLinearGradient(x0,y0,x1,y1);stops.forEach((c,i)=>G.addColorStop(i/(stops.length-1),c));return G}
// the emblems, each in a 200×200 box centred on (0,0)
var CD213E={
 lan(g){g.strokeStyle='#2a2420';g.lineWidth=4;g.beginPath();g.moveTo(0,-92);g.lineTo(0,-72);g.stroke();g.beginPath();g.arc(0,-66,8,0,6.283);cd213Ink(g,4);
  cd213Glow(g,0,8,95,'rgba(255,190,90,.9)',.85);
  g.beginPath();g.moveTo(-34,-58);g.lineTo(34,-58);g.lineTo(26,-44);g.lineTo(-26,-44);g.closePath();g.fillStyle=cd213Lin(g,-34,0,34,0,['#3a3430','#8a7e70','#3a3430']);g.fill();cd213Ink(g);
  g.beginPath();g.moveTo(-26,-44);g.lineTo(26,-44);g.lineTo(32,50);g.lineTo(-32,50);g.closePath();g.fillStyle=cd213Lin(g,0,-44,0,50,['#fff2b0','#ffb040','#d0600c']);g.fill();cd213Ink(g);
  g.save();g.clip();g.beginPath();g.moveTo(0,36);g.bezierCurveTo(-22,18,-6,-4,0,-26);g.bezierCurveTo(6,-4,22,18,0,36);g.fillStyle='#fffbe8';g.fill();g.restore();
  g.strokeStyle='#2a2420';g.lineWidth=5;[-12,12].forEach(x=>{g.beginPath();g.moveTo(x*1.05,-44);g.lineTo(x*1.4,50);g.stroke()});
  g.beginPath();g.moveTo(-40,50);g.lineTo(40,50);g.lineTo(30,64);g.lineTo(-30,64);g.closePath();g.fillStyle=cd213Lin(g,-40,0,40,0,['#2a2420','#7a6e60','#2a2420']);g.fill();cd213Ink(g)},
 fang(g){cd213Glow(g,0,0,90,'rgba(160,30,20,.5)');
  g.beginPath();g.moveTo(-30,-78);g.bezierCurveTo(-46,-20,-20,40,26,82);g.bezierCurveTo(10,40,24,-10,34,-74);g.bezierCurveTo(14,-86,-14,-88,-30,-78);g.closePath();
  g.fillStyle=cd213Lin(g,-40,-60,40,80,['#fffaf0','#e6d6b0','#a89068','#6a5034']);g.fill();cd213Ink(g,4);
  g.save();g.clip();g.beginPath();g.moveTo(26,82);g.bezierCurveTo(14,62,16,40,22,24);g.lineTo(40,30);g.lineTo(40,90);g.closePath();g.fillStyle=cd213Lin(g,0,20,0,90,['rgba(150,10,10,0)','#a01010','#5a0408']);g.fill();
  g.strokeStyle='rgba(60,40,20,.5)';g.lineWidth=2;[[-14,-60,-4,-20],[2,-50,8,-6],[-6,0,4,30]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()});g.restore();
  g.beginPath();g.moveTo(-30,-78);g.bezierCurveTo(-14,-88,14,-86,34,-74);g.lineTo(30,-62);g.bezierCurveTo(10,-70,-12,-70,-28,-64);g.closePath();g.fillStyle='#5a3a24';g.fill();cd213Ink(g,3);
  for(let i=0;i<3;i++){g.beginPath();g.arc(30-i*3,92+i*9,4-i,0,6.283);g.fillStyle='#8a0a0a';g.fill()}},
 gob(g){cd213Glow(g,0,-30,80,'rgba(255,60,60,.45)');
  g.beginPath();g.moveTo(-46,-62);g.lineTo(46,-62);g.bezierCurveTo(44,-10,24,12,8,18);g.lineTo(8,56);g.lineTo(34,70);g.lineTo(-34,70);g.lineTo(-8,56);g.lineTo(-8,18);g.bezierCurveTo(-24,12,-44,-10,-46,-62);g.closePath();
  g.fillStyle=cd213Lin(g,-46,0,46,0,['#3a3a44','#c8ccd8','#6a6e7c','#2a2a34']);g.fill();cd213Ink(g,4);
  g.beginPath();g.ellipse(0,-62,46,10,0,0,6.283);g.fillStyle=cd213Lin(g,0,-72,0,-52,['#ff4a4a','#8a0a14']);g.fill();cd213Ink(g,3);
  g.beginPath();g.moveTo(30,-60);g.bezierCurveTo(40,-40,44,-20,40,6);g.bezierCurveTo(38,16,32,16,32,6);g.bezierCurveTo(34,-20,28,-40,22,-58);g.closePath();g.fillStyle='#a00c18';g.fill();
  g.beginPath();g.arc(36,22,6,0,6.283);g.fill();g.beginPath();g.arc(30,44,4,0,6.283);g.fill();
  g.fillStyle='#d8b060';[-24,0,24].forEach(x=>{g.beginPath();g.arc(x,-34,5,0,6.283);g.fill();cd213Ink(g,2)});
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();g.moveTo(-34,-48);g.bezierCurveTo(-30,-20,-20,0,-10,8);g.stroke()},
 rav(g){cd213Glow(g,10,-30,70,'rgba(180,150,255,.35)');g.beginPath();g.arc(28,-44,38,0,6.283);g.fillStyle='rgba(230,226,250,.18)';g.fill();
  g.beginPath();g.moveTo(-70,70);g.lineTo(-30,40);g.bezierCurveTo(-60,10,-70,-30,-40,-50);g.bezierCurveTo(-20,-62,0,-58,8,-44);g.lineTo(44,-34);g.lineTo(10,-26);
  g.bezierCurveTo(30,0,30,40,0,58);g.lineTo(10,86);g.lineTo(-6,62);g.lineTo(-18,90);g.lineTo(-20,60);g.closePath();g.fillStyle=cd213Lin(g,-60,-60,40,80,['#3a2a5a','#141020','#06040c']);g.fill();cd213Ink(g,4);
  g.beginPath();g.moveTo(-40,-14);g.bezierCurveTo(-10,-30,40,-10,70,30);g.bezierCurveTo(40,20,10,16,-20,30);g.closePath();g.fillStyle=cd213Lin(g,-40,-20,70,30,['#1a1428','#4a3a78']);g.fill();cd213Ink(g,3);
  g.strokeStyle='rgba(170,140,255,.55)';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-20+i*16,8-i*2);g.lineTo(6+i*16,22+i*3);g.stroke()}
  g.beginPath();g.moveTo(8,-44);g.lineTo(46,-34);g.lineTo(10,-30);g.closePath();g.fillStyle='#2a2430';g.fill();cd213Ink(g,2);
  cd213Glow(g,-12,-40,12,'rgba(255,40,40,.9)');g.beginPath();g.arc(-12,-40,4,0,6.283);g.fillStyle='#ff4030';g.fill()},
 key(g){cd213Glow(g,0,-44,60,'rgba(90,240,200,.6)');
  g.beginPath();g.arc(0,-44,34,0,6.283);g.arc(0,-44,18,0,6.283,true);g.fillStyle=cd213Lin(g,-34,-80,34,-10,['#f2c897','#bb7c45','#4a2a12']);g.fill('evenodd');cd213Ink(g,4);
  g.strokeStyle='#7affe0';g.lineWidth=3;g.beginPath();g.moveTo(-8,-52);g.lineTo(0,-36);g.lineTo(8,-52);g.moveTo(0,-36);g.lineTo(0,-30);g.stroke();
  g.beginPath();g.rect(-7,-10,14,92);g.fillStyle=cd213Lin(g,-7,0,7,0,['#4a2a12','#d49a60','#4a2a12']);g.fill();cd213Ink(g,3);
  g.beginPath();g.moveTo(7,46);g.lineTo(30,46);g.lineTo(30,58);g.lineTo(20,58);g.lineTo(20,66);g.lineTo(30,66);g.lineTo(30,78);g.lineTo(7,78);g.closePath();g.fillStyle='#9a6030';g.fill();cd213Ink(g,3);
  g.beginPath();g.ellipse(0,-6,16,6,0,0,6.283);g.fillStyle='#7f4c27';g.fill();cd213Ink(g,2)},
 eye(g){cd213Glow(g,0,0,95,'rgba(255,180,40,.45)');g.strokeStyle='rgba(255,200,90,.6)';g.lineWidth=3;for(let i=0;i<16;i++){const a=i/16*6.283;g.beginPath();g.moveTo(Math.cos(a)*64,Math.sin(a)*48);g.lineTo(Math.cos(a)*88,Math.sin(a)*72);g.stroke()}
  g.beginPath();g.moveTo(-74,0);g.bezierCurveTo(-40,-50,40,-50,74,0);g.bezierCurveTo(40,50,-40,50,-74,0);g.closePath();g.fillStyle='#f0e4d0';g.fill();g.save();g.clip();
  g.strokeStyle='rgba(170,20,20,.6)';g.lineWidth=1.5;[[-70,-6,-36,4],[-66,10,-34,8],[70,-4,38,2],[64,12,36,10]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a,b);g.quadraticCurveTo((a+c)/2,b-8,c,d);g.stroke()});
  const G=g.createRadialGradient(0,0,4,0,0,32);G.addColorStop(0,'#ffe680');G.addColorStop(.6,'#e09010');G.addColorStop(1,'#5a2a04');g.beginPath();g.arc(0,0,32,0,6.283);g.fillStyle=G;g.fill();cd213Ink(g,3);
  g.beginPath();g.ellipse(0,0,6,26,0,0,6.283);g.fillStyle='#0a0604';g.fill();g.beginPath();g.arc(-10,-12,6,0,6.283);g.fillStyle='rgba(255,255,255,.8)';g.fill();g.restore();
  g.beginPath();g.moveTo(-74,0);g.bezierCurveTo(-40,-50,40,-50,74,0);g.bezierCurveTo(40,50,-40,50,-74,0);g.closePath();cd213Ink(g,5)},
 crown(g){cd213Glow(g,0,10,95,'rgba(255,110,30,.6)');
  g.beginPath();g.moveTo(-70,46);g.lineTo(-74,-30);g.lineTo(-44,4);g.lineTo(-30,-62);g.lineTo(-10,-2);g.lineTo(0,-84);g.lineTo(10,-2);g.lineTo(30,-62);g.lineTo(44,4);g.lineTo(74,-30);g.lineTo(70,46);g.closePath();
  g.fillStyle=cd213Lin(g,0,-84,0,46,['#a89c90','#5a524a','#2a2420']);g.fill();cd213Ink(g,4);
  g.beginPath();g.rect(-72,30,144,26);g.fillStyle=cd213Lin(g,0,30,0,56,['#6a6058','#2a2420']);g.fill();cd213Ink(g,3);
  [[-44,43],[0,43],[44,43]].forEach(([x,y],i)=>{cd213Glow(g,x,y,16,'rgba(255,120,30,.9)');g.beginPath();g.moveTo(x,y-9);g.lineTo(x+7,y);g.lineTo(x,y+9);g.lineTo(x-7,y);g.closePath();g.fillStyle=i==1?'#ff3a1a':'#ff8a2a';g.fill();cd213Ink(g,2)});
  g.strokeStyle='rgba(255,150,60,.85)';g.lineWidth=2;[[-60,20,-50,-6],[-20,10,-14,-30],[22,14,16,-26],[56,22,52,-4]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a,b);g.lineTo((a+c)/2+4,(b+d)/2);g.lineTo(c,d);g.stroke()});
  for(let i=0;i<9;i++){g.beginPath();g.arc(-60+i*15,-70-((i*37)%30),2+(i%3),0,6.283);g.fillStyle='rgba(255,150,60,.8)';g.fill()}},
 wild(g){g.beginPath();g.arc(0,-34,56,0,6.283);g.fillStyle=cd213Lin(g,0,-90,0,22,['#e8f4ff','#7aa8d8']);g.fill();g.beginPath();g.arc(20,-44,50,0,6.283);g.fillStyle='rgba(10,26,52,.92)';g.fill();
  cd213Glow(g,-20,-34,70,'rgba(150,200,255,.35)');
  g.beginPath();g.moveTo(0,-62);g.bezierCurveTo(-26,-60,-30,-30,-26,-14);g.bezierCurveTo(-44,10,-50,50,-58,88);g.lineTo(52,88);g.bezierCurveTo(44,50,40,10,24,-14);g.bezierCurveTo(30,-30,26,-60,0,-62);g.closePath();
  g.fillStyle=cd213Lin(g,-50,-60,50,88,['#3a4a68','#1a2236','#0a0e18']);g.fill();cd213Ink(g,4);
  g.beginPath();g.moveTo(0,-50);g.bezierCurveTo(-16,-48,-18,-28,-14,-16);g.lineTo(14,-16);g.bezierCurveTo(18,-28,16,-48,0,-50);g.closePath();g.fillStyle='#04060c';g.fill();
  [-6,6].forEach(x=>{cd213Glow(g,x,-28,8,'rgba(150,220,255,1)');g.beginPath();g.arc(x,-28,2,0,6.283);g.fillStyle='#d8f4ff';g.fill()});
  g.strokeStyle='#5a4a3a';g.lineWidth=6;g.beginPath();g.moveTo(40,-70);g.lineTo(52,92);g.stroke();g.strokeStyle='#120a06';g.lineWidth=2;g.stroke();
  cd213Glow(g,40,-74,22,'rgba(150,210,255,1)');g.beginPath();g.arc(40,-74,6,0,6.283);g.fillStyle='#e8f8ff';g.fill();
  g.strokeStyle='rgba(150,200,255,.5)';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-40+i*24,40+i*6);g.lineTo(-30+i*24,80);g.stroke()}},
 hol(g){cd213Glow(g,0,0,90,'rgba(120,150,110,.35)');
  g.beginPath();g.moveTo(0,-74);g.bezierCurveTo(52,-74,64,-26,52,8);g.bezierCurveTo(46,24,40,30,34,34);g.lineTo(30,58);g.lineTo(-30,58);g.lineTo(-34,34);g.bezierCurveTo(-40,30,-46,24,-52,8);g.bezierCurveTo(-64,-26,-52,-74,0,-74);g.closePath();
  g.fillStyle=cd213Lin(g,-50,-74,50,58,['#f2ead6','#c8bc9c','#7a6e54']);g.fill();cd213Ink(g,4);
  [-22,22].forEach(x=>{g.beginPath();g.ellipse(x,-6,15,18,x<0?.2:-.2,0,6.283);g.fillStyle='#0c0e0a';g.fill()});
  g.beginPath();g.moveTo(0,14);g.lineTo(-7,28);g.lineTo(7,28);g.closePath();g.fillStyle='#1a1c16';g.fill();
  g.fillStyle='#e8e0c8';for(let i=0;i<6;i++){g.fillRect(-26+i*9,40,7,16)}g.strokeStyle='#120a06';g.lineWidth=2;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-27+i*9,40);g.lineTo(-27+i*9,56);g.stroke()}
  g.strokeStyle='rgba(40,30,20,.75)';g.lineWidth=2.5;g.beginPath();g.moveTo(10,-72);g.lineTo(18,-50);g.lineTo(10,-38);g.lineTo(20,-26);g.stroke();
  cd213Glow(g,-22,-6,10,'rgba(140,220,120,.6)');cd213Glow(g,22,-6,10,'rgba(140,220,120,.6)')}};
function cd213Paint(k){const W=256,H=384,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  if(k==='back'){// the back: wine-dark lacquer, gold filigree, the lantern sigil of Duskhold in a diamond
    cd213RR(g,2,2,W-4,H-4,18);g.fillStyle='#120806';g.fill();cd213RR(g,12,12,W-24,H-24,12);g.fillStyle=cd213Lin(g,0,0,W,H,['#5a0e18','#2a0610','#4a0a14']);g.fill();
    g.save();g.clip();g.strokeStyle='rgba(212,165,76,.22)';g.lineWidth=2;for(let i=-H;i<W+H;i+=18){g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.moveTo(i,H);g.lineTo(i+H,0);g.stroke()}g.restore();
    g.strokeStyle='#d4a54c';g.lineWidth=3;cd213RR(g,22,22,W-44,H-44,10);g.stroke();g.lineWidth=1.5;cd213RR(g,30,30,W-60,H-60,8);g.stroke();
    const cx=W/2,cy=H/2;g.beginPath();g.moveTo(cx,cy-92);g.lineTo(cx+62,cy);g.lineTo(cx,cy+92);g.lineTo(cx-62,cy);g.closePath();g.fillStyle='#1a0408';g.fill();g.lineWidth=4;g.stroke();
    cd213Glow(g,cx,cy,60,'rgba(255,190,90,.55)');g.save();g.translate(cx,cy);g.scale(.5,.5);CD213E.lan(g);g.restore();
    [[40,40],[W-40,40],[40,H-40],[W-40,H-40]].forEach(([x,y])=>{g.beginPath();g.moveTo(x,y-10);g.lineTo(x+10,y);g.lineTo(x,y+10);g.lineTo(x-10,y);g.closePath();g.fillStyle='#d4a54c';g.fill()});
    cd213Grain(g,0,0,W,H,.12,3);return c}
  const D=CD213.D[k];
  // frame: dark iron, a gold rule, parchment inside
  cd213RR(g,2,2,W-4,H-4,18);g.fillStyle=cd213Lin(g,0,0,W,H,['#2a2018','#0e0a08','#241a12']);g.fill();
  cd213RR(g,12,12,W-24,H-24,12);g.fillStyle=cd213Lin(g,0,12,0,H-12,['#efe2c2','#d8c49a','#b89c70']);g.fill();
  g.save();cd213RR(g,12,12,W-24,H-24,12);g.clip();cd213Grain(g,12,12,W-24,H-24,.16,k.length*31);
  const V=g.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.62);V.addColorStop(0,'rgba(0,0,0,0)');V.addColorStop(1,'rgba(60,30,10,.55)');g.fillStyle=V;g.fillRect(0,0,W,H);g.restore();
  g.strokeStyle='#9a6c26';g.lineWidth=3;cd213RR(g,20,20,W-40,H-40,9);g.stroke();g.strokeStyle='rgba(90,60,20,.6)';g.lineWidth=1;cd213RR(g,26,26,W-52,H-52,7);g.stroke();
  // the numeral on a little shield at the top
  g.beginPath();g.moveTo(W/2-34,22);g.lineTo(W/2+34,22);g.lineTo(W/2+30,56);g.lineTo(W/2,66);g.lineTo(W/2-30,56);g.closePath();g.fillStyle=cd213Lin(g,0,22,0,66,['#3a2a1a','#1a120a']);g.fill();g.strokeStyle='#d4a54c';g.lineWidth=2;g.stroke();
  g.fillStyle='#f0d48a';g.font='700 24px Cinzel, Georgia, serif';g.textAlign='center';g.textBaseline='middle';g.fillText(D.num,W/2,43);
  // the medallion behind the emblem, in the card's own colours
  const cx=W/2,cy=176;const M=g.createRadialGradient(cx,cy-20,8,cx,cy,104);M.addColorStop(0,D.c[0]);M.addColorStop(.55,D.c[1]);M.addColorStop(1,'#0a0604');
  g.beginPath();g.arc(cx,cy,100,0,6.283);g.fillStyle=M;g.globalAlpha=.9;g.fill();g.globalAlpha=1;g.strokeStyle='#9a6c26';g.lineWidth=3;g.stroke();
  g.strokeStyle='rgba(240,212,138,.35)';g.lineWidth=1.5;for(let i=0;i<24;i++){const a=i/24*6.283;g.beginPath();g.moveTo(cx+Math.cos(a)*92,cy+Math.sin(a)*92);g.lineTo(cx+Math.cos(a)*99,cy+Math.sin(a)*99);g.stroke()}
  g.save();g.beginPath();g.arc(cx,cy,98,0,6.283);g.clip();g.translate(cx,cy);g.scale(.88,.88);try{CD213E[k](g)}catch(err){console.warn('v213 card',k,err)}g.restore();
  // the name on a ribbon
  const ry=306;g.beginPath();g.moveTo(26,ry-20);g.lineTo(W-26,ry-20);g.lineTo(W-40,ry);g.lineTo(W-26,ry+20);g.lineTo(26,ry+20);g.lineTo(40,ry);g.closePath();g.fillStyle=cd213Lin(g,0,ry-20,0,ry+20,['#4a1a14','#2a0a08']);g.fill();g.strokeStyle='#d4a54c';g.lineWidth=2;g.stroke();
  g.fillStyle='#f4e2b0';let fs=20;g.font=`700 ${fs}px Cinzel, Georgia, serif`;const nm=D.n.toUpperCase();while(g.measureText(nm).width>W-90&&fs>12){fs--;g.font=`700 ${fs}px Cinzel, Georgia, serif`}g.fillText(nm,W/2,ry+1);
  // the pay, small at the foot
  g.fillStyle='#4a2a14';g.font='600 14px Cinzel, Georgia, serif';g.fillText(k==='wild'?'WILD · three pay ×'+D.p:k==='hol'?'— PAYS NOTHING —':'THREE PAY ×'+D.p,W/2,346);
  return c}
function cd213Can(k){if(!CD213.tex[k]){const c=cd213Paint(k);const t=new THREE.CanvasTexture(c);t.anisotropy=4;CD213.tex[k]=t;CD213.url[k]=c.toDataURL('image/png')}return CD213.tex[k]}
function cd213Url(k){cd213Can(k);return CD213.url[k]}
// ---------------- the rules ----------------
function cd213Roll(){const L=Object.keys(CD213.D),tot=L.reduce((s,k)=>s+CD213.D[k].w,0);let r=Math.random()*tot;for(const k of L){r-=CD213.D[k].w;if(r<0)return k}return 'hol'}
// → {m: multiplier of the bet, kind: 'three' | 'pair' | '', k: the card that made it}
function cd213Pay(c){const D=CD213.D;if(c.every(x=>x==='wild'))return {m:D.wild.p,kind:'three',k:'wild'};
  const nw=c.filter(x=>x!=='wild'&&x!=='hol'),nh=c.filter(x=>x==='hol').length,w=3-nw.length-nh;
  if(!nh&&nw.length&&nw.every(x=>x===nw[0]))return {m:D[nw[0]].p,kind:'three',k:nw[0]};
  // two alike among the cards that are not The Hollow (a Wanderer makes a pair with anything)
  const cnt={};nw.forEach(x=>cnt[x]=(cnt[x]||0)+1);const best=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]||D[b].p-D[a].p)[0];
  if(best&&cnt[best]+w>=2||w>=2)return {m:1.5,kind:'pair',k:best||'wild'};return {m:0,kind:'',k:''}}
// ---------------- the table, the dealer, the deck ----------------
function cd213L(x,z){return lotW103(DM196I.l,x,z)}
function cd213TableK(k,R){const [cx,cz]=DM196I.card,wood=0x4a2e1c,woodD=0x2a1a10,gold=0xc9a24a;
  k.as('wood',()=>{k.p('c',wood,'cyl8',cx,.66,cz,1.0,.08,.78,0,0,0,.02);k.p('c',woodD,'cyl8',cx,.6,cz,.92,.06,.72,0,0,0,.02);
    k.L('c',woodD,[cx,.08,cz],[cx,.6,cz],.13,'cyl6');k.p('c',woodD,'cyl8',cx,.12,cz,.42,.06,.42,0,0,0,.02);[0,1,2,3].forEach(i=>{const a=i*1.571+.785;k.L('c',woodD,[cx,.14,cz],[cx+Math.sin(a)*.5,.06,cz+Math.cos(a)*.5],.05,'box')})});
  k.as('cloth',()=>{k.p('c',0x3a0a14,'cyl8',cx,.705,cz,.88,.012,.66,0,0,0,0);k.p('c',0x2a0610,'cyl8',cx+.15,.712,cz,.42,.008,.5,0,0,0,0)});
  k.p('m',gold,'cyl8',cx,.7,cz,1.01,.012,.79,0,0,0,0);
  // the deck, a few coin stacks, a candle at the dealer's corner, a dice cup
  k.as('board',()=>k.p('c',0x5a0e18,'box',CD213.deck[0],.75,CD213.deck[1],.32,.07,.22,0,0,0,0));
  [[-4.0,2.3,5],[-3.85,2.42,3],[-3.2,1.15,4]].forEach(([x,z,n])=>{for(let i=0;i<n;i++)k.p('m',0xd4a54c,'cyl8',x,.72+i*.022,z,.07,.012,.07,0,i*.4,0,0)});
  dc190Candle(k,-4.2,.71,2.42,.14);k.p('c',0x3a2414,'cyl8',-4.05,.78,1.08,.09,.14,.09,0,0,0,.02);k.p('c',0xe8e0c8,'box',-4.2,.725,1.3,.06,.06,.06,.2,.4,0,0)}
function cd213Build(){try{const l=DM196I.l;if(!l||typeof TOWNS=='undefined')return;const T=TOWNS[0];
  if(CD213.root)scene.remove(CD213.root);if(CD213.dealer&&CD213.dealer.parent)CD213.dealer.parent.remove(CD213.dealer);
  const root=new THREE.Group();const [ox,oz]=cd213L(0,0);root.position.set(ox,T.ph,oz);root.rotation.y=l.ry;root.name='cd213';root.userData.lpsSkip=1;scene.add(root);CD213.root=root;
  let k=null;if(!twHas('CD213TBL')){k=twKit(21201);cd213TableK(k,k.R)}const tg=twGroup(k,'CD213TBL');root.add(tg);
  // Corvin, the dealer, behind the table on the wall side, facing the room
  {const [nx,nz]=cd213L(DM196I.card[0]-1.2,DM196I.card[1]),ng=new THREE.Group(),prev=T_cur,nc=[];T_cur={col:nc,cx:0,cy:0};
    try{npc(ng,nx,nz,{robe:0x2a1838,trim:0xc9a24a,label:'Corvin · Dealer',ry:l.ry+Math.PI/2,fkSp:'lynx',fkOut:'cit'})}finally{T_cur=prev}ng.position.y=GH(nx,nz);scene.add(ng);CD213.dealer=ng;CD213.rig=ng.children[0]||null}
  const C=[],[tx,tz]=cd213L(...DM196I.card),[dx,dz]=cd213L(DM196I.card[0]-1.2,DM196I.card[1]);C.push({x:tx,z:tz,r:.82},{x:dx,z:dz,r:.34});
  kfColSet109(CD213.col,C);DM196S.col=(DM196S.col||[]).filter(c=>CD213.col.indexOf(c)<0).concat(CD213.col)}catch(err){console.warn('v213 card table',err)}}
{const f=dm196InnBuild;dm196InnBuild=function(){const r=f.apply(this,arguments);cd213Build();return r}}
cd213Build();
// the dealer's dealing arm: a reach toward the table laid over the idle pose (removed again if the idle did not reset it)
function cd213Arm(){const g=CD213.rig,b=g&&g.bones;if(!b||!b.aR0)return;const S=CD213.armS||(CD213.armS={});
  const v=CD213.arm;[['aR0','x',-1.15],['aR0','z',.25],['aR1','x',-.55],['chest','y',.18],['chest','x',.12]].forEach(([n,ax,d],i)=>{const o=b[n];if(!o)return;const key=n+ax;
    if(S[key]&&o.rotation[ax]===S[key].set)o.rotation[ax]-=S[key].add;const add=d*v;o.rotation[ax]+=add;S[key]={add,set:o.rotation[ax]}})}
// ---------------- a hand on the table (relayed: the partner sees the same cards laid) ----------------
function cd213CardMesh(){const g=new THREE.Group(),f=new THREE.Group();g.add(f);const geo=CD213.geo||(CD213.geo=new THREE.PlaneGeometry(.32,.48));
  const mk=(tex,rx,y)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0xd8d0c4,transparent:true}));m.material.userData.noFade135=1;m.rotation.x=rx;m.position.y=y;m.renderOrder=3;f.add(m);return m};
  g.userData.face=mk(null,-Math.PI/2,.003);g.userData.back=mk(cd213Can('back'),Math.PI/2,-.003);g.userData.f=f;return g}
function cd213Clear(){if(CD213.fx){CD213.fx.dead=1;CD213.fx=null}(CD213.lay||[]).forEach(m=>{if(m.parent)m.parent.remove(m);m.userData.face.material.dispose();m.userData.back.material.dispose()});CD213.lay=[]}
function cd213Show(cards,big){try{if(!CD213.root||!Array.isArray(cards)||cards.length!==3)return;const rep=typeof MPV!='undefined'&&MPV.rep>0;if(rep&&CD213.busy)return;
  cards=cards.map(k=>CD213.D[k]?k:'hol');cd213Clear();const R=CD213.root,[cx,cz]=DM196I.card,y0=.725,T=CD213.T,L=[];
  for(let i=0;i<3;i++){const m=cd213CardMesh();m.userData.face.material.map=cd213Can(cards[i]);m.userData.face.material.needsUpdate=true;m.rotation.y=Math.PI/2;m.userData.f.rotation.z=Math.PI;
    m.position.set(CD213.deck[0],y0+.06,CD213.deck[1]);m.visible=false;R.add(m);L.push(m)}CD213.lay=L;
  const slot=i=>[cx+.3,cz+(i-1)*.46],tEnd=3*T.deal+T.gap*.5+2*T.fgap+T.flip+.15;let t=0;
  const o={tick(dt){if(o.dead)return false;t+=dt;
      for(let i=0;i<3;i++){const m=L[i],t0=i*T.deal,k=Math.max(0,Math.min(1,(t-t0)/T.deal));m.visible=t>=t0;const [sx,sz]=slot(i),e=haIO(k);
        m.position.set(CD213.deck[0]+(sx-CD213.deck[0])*e,y0+.06*(1-e)+Math.sin(k*Math.PI)*.18+.002*i,CD213.deck[1]+(sz-CD213.deck[1])*e);m.rotation.y=Math.PI/2+(1-e)*(i-1)*.6;
        const f0=3*T.deal+T.gap*.5+i*T.fgap,fk=Math.max(0,Math.min(1,(t-f0)/T.flip));m.userData.f.rotation.z=Math.PI*(1-haIO(fk));m.userData.f.position.y=Math.sin(fk*Math.PI)*.1;
        if(fk>0&&!m.userData.fl){m.userData.fl=1;cd213Snd('flip',rep?.5:1)}if(t>=t0&&!m.userData.dl){m.userData.dl=1;cd213Snd('deal',rep?.5:1)}}
      // the dealer's arm: a reach for each card dealt, a tap for each turned
      const dPh=t<3*T.deal?Math.sin(((t%T.deal)/T.deal)*Math.PI):0,fPh=(()=>{const f0=3*T.deal+T.gap*.5,u=t-f0;if(u<0||u>2*T.fgap+T.flip)return 0;const j=Math.floor(u/T.fgap),r=(u-j*T.fgap)/T.flip;return r>=0&&r<=1?Math.sin(r*Math.PI)*.7:0})();
      CD213.arm=Math.max(dPh,fPh);
      if(t>=tEnd){CD213.arm=0;if(!o.done){o.done=1;try{o.end2&&o.end2()}catch(_){}if(big)cd213Win(big)}}return t<tEnd+.05},end(){CD213.arm=0}};
  CD213.fx=o;kqFx(o);return o}catch(err){if(!CD213.err++)console.warn('v213 deal',err)}}
// a win on the table: coins leap from the cards (big: the jackpot's ember burst); relayed with the deal's end
function cd213Win(big){try{const R=CD213.root;if(!R)return;const [cx,cz]=DM196I.card,[wx,wz]=cd213L(cx+.32,cz),p=new THREE.Vector3(wx,R.position.y+.85,wz);
  burst(p,0xffd24a,big>1?40:16,big>1?2.6:1.6,big>1?2.6:1.6,.7);if(big>1){burst(p,0xff7a2a,30,3,3,.9);kqFlash(p,0xffd890,3,400);ring(new THREE.Vector3(wx,R.position.y+.75,wz),0xffd24a,2.2,500)}}catch(_){}}
(function(){if(typeof MPV=='undefined'||!MPV.FX||typeof MPV_FX=='undefined')return;
  ['cd213Show'].forEach(n=>{const f=window[n];if(typeof f!='function')return;if(MPV_FX[n]==null){MPV_FX[n]=MPV.FX.length;MPV.FX.push(n)}
    window[n]=function(){if(MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
// ---------------- playing ----------------
function cd213Near(){if(CD213.open)return false;try{if(!DM196I.l)return false;const [tx,tz]=cd213L(...DM196I.card);return Math.hypot(pl.position.x-tx,pl.position.z-tz)<2.5&&townAt(pl.position.x,pl.position.z,0)===0}catch(_){return false}}
function cd213Open(){const l=DM196I.l;if(!l||CD213.open)return;const [sx,sz]=cd213L(...CD213.stand);pl.position.x=sx;pl.position.z=sz;pl.rotation.y=l.ry-Math.PI/2;
  CD213.open=true;CD213.camK=0;CD213.line=cd213Pick('deal');cd213Panel().classList.remove('hide');cd213Render();try{GD213&&gd213Up()}catch(_){}}
function cd213Close(){CD213.open=false;const w=$('cd213w');if(w)w.classList.add('hide')}
function cd213Pick(k){const L=CD213.say[k];return L[Math.floor(Math.random()*L.length)]}
function cd213Deal(){if(CD213.busy)return;const b=CD213.bet;if(gold<b){CD213.line='“Your purse is lighter than your courage.”';cd213Render();return}
  gold-=b;const c=[cd213Roll(),cd213Roll(),cd213Roll()],r=cd213Pay(c),win=Math.floor(b*r.m);CD213.busy=true;CD213.cards=c;CD213.res=null;CD213.line=cd213Pick('deal');
  CD213.stat.n++;CD213.stat.bet+=b;cd213Render();try{hud()}catch(_){}
  const big=r.kind==='three'?(r.m>=25?2:1):r.kind==='pair'?1:0;const o=cd213Show(c,big);
  const fin=()=>{CD213.busy=false;gold+=win;CD213.stat.won+=win;CD213.res={c,r,win,bet:b};
    CD213.line=r.kind==='three'?(r.m>=25?cd213Pick('big'):cd213Pick('win')):r.kind==='pair'?cd213Pick('pair'):cd213Pick('lose');
    cd213Snd(r.kind==='three'?(r.m>=25?'jack':'win'):r.kind==='pair'?'pair':'lose');
    if(win>0)try{say('🃏 Fate’s Hand: '+(r.kind==='three'?'three × '+CD213.D[r.k].n:'a pair')+' — you win '+win+' gold.')}catch(_){}
    try{hud()}catch(_){}CD213.anim=1;cd213Render();CD213.anim=0};
  if(o)o.end2=fin;else fin()}
function cd213Panel(){let w=$('cd213w');if(w)return w;w=document.createElement('div');w.id='cd213w';w.className='hide';
  w.innerHTML=`<div class="win"><div class="wh"><h2 id="cd213T">🃏 Fate’s Hand</h2><span class="wsub" id="cd213S"></span><button class="x" id="cd213X" title="Leave the table (Esc)">✕</button></div><div class="wb" id="cd213B"></div><div class="wf" id="cd213F"></div></div>`;
  ($('stage')||document.body).appendChild(w);w.addEventListener('pointerdown',e=>e.stopPropagation());
  w.addEventListener('click',e=>{const b=e.target.closest('[data-cdb],[data-cdd],#cd213X');if(!b||b.disabled)return;if(b.id==='cd213X'){cd213Close();return}
    if(b.dataset.cdb){CD213.bet=+b.dataset.cdb;cd213Render()}else if(b.dataset.cdd)cd213Deal()});return w}
function cd213Render(){if(!CD213.open)return;cd213Panel();const D=CD213.D,R=CD213.res,c=CD213.busy?null:(CD213.cards||null);
  $('cd213S').textContent='Corvin’s card table at the Last Lantern';
  const card=(k,i)=>{const show=c&&k,win=R&&!CD213.busy&&R.r.kind&&(R.r.kind==='three'||(R.r.kind==='pair'&&(k===R.r.k||k==='wild')));
    return `<div class="cd213c${win?' cd213w':''}${CD213.anim&&show?' cd213a':''}" style="animation-delay:${i*.12}s"><img src="${show?cd213Url(k):cd213Url('back')}" alt="${show?D[k].n:'face down'}" title="${show?D[k].n+' — '+D[k].d:''}"></div>`};
  const cs=(CD213.busy||!c)?[null,null,null]:c;
  let res='';if(R&&!CD213.busy)res=R.win>0?`<b class="cd213g">+${R.win} 🪙</b> ${R.r.kind==='three'?'Three × '+D[R.r.k].n+' pays ×'+R.r.m:'A pair pays ×1.5'}`:`<span class="mut">No match — the ${R.bet} gold stays on the table.</span>`;
  else if(CD213.busy)res='<span class="mut">Corvin deals…</span>';else res='<span class="mut">Choose your bet and deal.</span>';
  const bets=CD213.bets.map(b=>`<button class="cd213b${b===CD213.bet?' on':''}" data-cdb="${b}" ${gold<b||CD213.busy?'disabled':''}>${b} 🪙</button>`).join('');
  const pt=CD213.order.map(k=>`<div class="cd213p" title="${D[k].d}"><img src="${cd213Url(k)}"><span>${D[k].n}</span><b>${k==='hol'?'—':'×'+D[k].p}</b></div>`).join('');
  $('cd213B').innerHTML=`<div class="cd213">
    <div class="cd213row">${cs.map(card).join('')}</div>
    <div class="cd213R"><div class="cd213q">“${st200Esc(CD213.line)}” <span class="mut">— Corvin</span></div>
      <div class="cd213r">${res}</div>
      <div class="cd213ctl"><span class="mut">Bet</span>${bets}</div>
      <div class="cd213ctl"><button class="cd213d" data-cdd="1" ${CD213.busy||gold<CD213.bet?'disabled':''}>${CD213.busy?'Dealing…':'Deal · '+CD213.bet+' 🪙'}</button><span class="cd213gold">Purse 🪙 ${gold}</span></div></div></div>
    <details class="cd213pt"${CD213.ptOpen?' open':''}><summary>The deck and what it pays</summary><div class="cd213pg">${pt}</div><div class="mut" style="margin-top:4px">Any two alike (a Wanderer counts, The Hollow never does) give 1.5× your bet back.</div></details>`;
  const d=$('cd213B').querySelector('.cd213pt');if(d)d.addEventListener('toggle',()=>{CD213.ptOpen=d.open});
  $('cd213F').innerHTML=`<span class="mut dtl">Space / Enter deal · Esc leaves the table · hands played ${CD213.stat.n} · won ${CD213.stat.won} 🪙 of ${CD213.stat.bet} 🪙 bet this visit. The house always keeps a little.</span>`};
// while at the table the keys belong to the panel (no walking off mid-hand, no swings at the dealer)
addEventListener('keydown',e=>{if(!CD213.open)return;const k=String(e.key||'').toLowerCase();if(e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  if(k==='escape')cd213Close();else if(k===' '||k==='enter')cd213Deal();else if(k>='1'&&k<='4'&&!CD213.busy){const b=CD213.bets[+k-1];if(b&&gold>=b){CD213.bet=b;cd213Render()}}},true);
addEventListener('keyup',e=>{if(CD213.open)e.stopImmediatePropagation()},true);
{const f=swing;swing=function(){if(CD213.open)return;return f.apply(this,arguments)}}
// the table camera: over the player's shoulder, the table above the panel (eased in; the follow camera takes over again on leaving)
function cd213Cam(dt){const l=DM196I.l,T=TOWNS[0];if(!l)return;CD213.camK=Math.min(1,(CD213.camK||0)+dt*2.2);const e=haIO(CD213.camK),C=CD213.cv,[px,pz]=cd213L(C[0],C[2]),[lx,lz]=cd213L(C[3],C[5]);
  const P=new THREE.Vector3(px,T.ph+C[1],pz),Lk=new THREE.Vector3(lx,T.ph+C[4],lz);cam.position.lerp(P,e);look.lerp(Lk,e);cam.lookAt(look);cam.updateMatrixWorld();try{FADE.cam.value.copy(cam.position)}catch(_){}}
{const s=document.createElement('style');s.textContent=`
#cd213w{position:absolute;left:0;right:0;bottom:6px;z-index:6;display:flex;justify-content:center;pointer-events:none}#cd213w.hide{display:none}
#cd213w .win{pointer-events:auto;width:min(760px,98%);max-height:48vh;overflow:auto}#cd213w .wb{padding:6px 10px}
.cd213{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap}.cd213R{display:flex;flex-direction:column;gap:6px;align-items:center;min-width:250px}.cd213q{font-style:italic;color:#e8d8b0;text-align:center;max-width:300px}
.cd213row{display:flex;gap:8px;justify-content:center}.cd213c img{width:70px;height:105px;border-radius:7px;box-shadow:0 4px 14px rgba(0,0,0,.7);display:block}
.cd213a{animation:cd213in .35s ease-out both}.cd213w img{box-shadow:0 0 0 2px #ffd24a,0 0 18px rgba(255,200,80,.85)}
@keyframes cd213in{from{transform:translateY(-8px) rotateY(80deg);opacity:.2}to{transform:none;opacity:1}}
.cd213r{min-height:1.3em;text-align:center}.cd213g{color:#ffd24a;font-size:1.05rem}
.cd213ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center}.cd213b.on{box-shadow:0 0 0 1px #ffd24a;color:#ffe8a8}
.cd213d{font-weight:700;padding:6px 16px;background:linear-gradient(#7a2a18,#4a140c)!important;color:#ffe8c0!important}.cd213gold{color:#f0d48a;margin-left:6px}
.cd213pt{width:100%}.cd213pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px;margin-top:6px}
.cd213p{display:flex;flex-direction:column;align-items:center;font-size:.66rem;text-align:center}.cd213p img{width:44px;height:66px;border-radius:3px}.cd213p b{color:#f0d48a}
body.mob .cd213c img{width:60px;height:90px}`;document.head.appendChild(s)}
// the walk-up prompt at the table
{const f=townPortalPrompt;townPortalPrompt=function(T){try{if(T&&T===TOWNS[0]&&cd213Near())return {label:'F · Play Fate’s Hand at Corvin’s card table',fn:()=>cd213Open()}}catch(_){}return f.apply(this,arguments)}}
// per frame: the dealer's arm; leave the table if pulled away; take the cards away a while after
{const f=townTick;townTick=function(now,pp){const r=f.apply(this,arguments);try{cd213Arm();if(CD213.open){const n=nowP(),dt=Math.min(.05,(n-(CD213.camT||n))/1000);CD213.camT=n;cd213Cam(dt)}else CD213.camT=null;
    if(CD213.open){dp[0]=dp[1]=0;const [sx,sz]=cd213L(...CD213.stand);if(Math.hypot(pl.position.x-sx,pl.position.z-sz)>1.2||hero.hp<=0||uiOpen())cd213Close()}
    if(CD213.lay&&CD213.lay.length&&!CD213.busy&&!CD213.open){CD213.idle=(CD213.idle||0)+1;if(CD213.idle>60*20){cd213Clear();CD213.idle=0}}else CD213.idle=0}catch(_){}return r}}
// ---------------- sounds ----------------
function cd213Snd(k,vol){try{if(typeof SET!='undefined'&&(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0)))return;const a=typeof snd208Bus=='function'?snd208Bus():null;if(!a||a.state!='running')return;
  const t0=a.currentTime;vol=vol||1;
  const T=(ty,f0,f1,at,dur,v,o)=>{o=Object.assign({},o||{},{dur,v});const t=t0+at,s=a.createOscillator();s.type=ty;s.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);const e=snd208V(a,s,o,t,vol);s.start(t);s.stop(e)},
    N=(f0,f1,at,dur,v,o)=>{if(typeof NOISE=='undefined'||!NOISE)return;o=Object.assign({bp:f0},o||{},{dur,v,f1});if(o.lp){o.lp=f0;delete o.bp}if(o.hp){o.hp=f0;delete o.bp}const t=t0+at,s=a.createBufferSource();s.buffer=NOISE;s.loop=true;const e=snd208V(a,s,o,t,vol);s.start(t,Math.random()*.5);s.stop(e)},
    coin=(at,f)=>{[[1,1],[2.4,.4],[3.9,.2]].forEach(([r,w])=>T('sine',f*r,f*r,at,.25,.03*w,{atk:.002,wet:.4}))};
  ({deal:()=>N(3000,1400,0,.12,.1,{q:.8,atk:.01,wet:.1}),
    flip:()=>{N(2400,1800,0,.05,.12,{q:1.2,atk:.002});T('sine',320,180,0,.06,.06,{atk:.002})},
    lose:()=>{T('sine',140,80,0,.4,.15,{atk:.01,wet:.3})},
    pair:()=>{coin(0,2600);coin(.08,3100)},
    win:()=>{for(let i=0;i<6;i++)coin(i*.07,2400+((i*530)%900));T('sine',523,523,0,.5,.04,{atk:.02,wet:.6});T('sine',784,784,.1,.6,.035,{atk:.02,wet:.6})},
    jack:()=>{for(let i=0;i<16;i++)coin(i*.06,2200+((i*730)%1300));[392,523,659,784].forEach((f,i)=>T('sine',f,f,i*.09,1.2,.04,{atk:.03,wet:.7}));try{mSfx('lvl',.6)}catch(_){}}})[k]?.()}catch(_){}}
