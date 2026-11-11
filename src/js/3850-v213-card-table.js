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
  free:0,freeBet:0,FREE:5,stand:[-2.3,1.8],cv:[-2.15,2.1,1.8,-4.1,.25,1.8],deck:[-4.2,1.62],T:{deal:.38,gap:.34,flip:.3,fgap:.36},
  D:{lan:{n:'The Lantern',num:'I',w:20,p:5,p2:1,c:['#ffcf7a','#7a3a10'],d:'A light kept burning against the dark.'},
     fang:{n:'The Fang',num:'II',w:18,p:6,p2:1,c:['#f0e2c4','#5a1a14'],d:'What hunts in Kindlelight leaves its teeth behind.'},
     gob:{n:'The Goblet',num:'III',w:15,p:8,p2:1,c:['#ff6a6a','#4a0810'],d:'Drink deep; the Citadel always does.'},
     rav:{n:'The Raven',num:'IV',w:13,p:10,p2:1.2,c:['#b89aff','#1a1030'],d:'It carries word between the living and the not.'},
     key:{n:'The Sealed Key',num:'V',w:10,p:15,p2:1.5,c:['#7ae8d0','#0c3a34'],d:'Every gate in Duskhold has one. Most are lost.'},
     eye:{n:'The Hundred Eyes',num:'VI',w:7,p:25,p2:2,c:['#ffd25a','#5a2a04'],d:'Argus sees the hand before it is dealt.'},
     crown:{n:'The Ashen Crown',num:'VII',w:4,p:50,p2:3,c:['#ff8a3a','#3a0c04'],d:'A Sovereign’s crown, still warm from the pyre.'},
     wild:{n:'The Wanderer',num:'0',w:5,p:100,p2:2.5,c:['#9ad0ff','#0a1a34'],d:'Wild: stands in for any card.'},
     hol:{n:'The Hollow',num:'XIII',w:18,p:0,p2:0,c:['#b8c4b0','#141a14'],d:'Stands in for nothing, alone it pays nothing. Three of them wake the dead.'}},
  // v218: the special hands (c: the cards, any order unless ord; m: × the bet; t: how big the show is, 1–5)
  SP:{rise:{n:'The Hollow Rises',c:['hol','hol','hol'],m:13,t:5,d:'Three Hollows: the dead deal themselves in.'},
     road:{n:'The Wanderer’s Road',c:['wild','wild','wild'],m:100,t:5,d:'Three Wanderers: ×100 and 5 free hands, every win doubled.'},
     court:{n:'The Sovereign’s Court',c:['crown','eye','key'],m:15,t:3,d:'The Ashen Crown, the Hundred Eyes and the Sealed Key, in any order.'},
     hunt:{n:'The Hunt',c:['fang','rav','eye'],m:6,t:2,d:'The Fang, the Raven and the Hundred Eyes, in any order.'},
     asc:{n:'The Ascent',c:['lan','fang','gob'],m:4,t:2,ord:1,d:'Three numerals climbing by one, left to right (I II III … V VI VII).'},
     dead:{n:'Among the Dead',c:['hol','hol','wild'],m:3,t:1,d:'Two Hollows and a Wanderer, in any order.'}},
  spOrder:['road','rise','court','hunt','asc','dead'],
  order:['crown','eye','key','rav','gob','fang','lan','wild','hol'],
  say:{deal:['The cards remember every hand.','Fate deals. Fools pay. Let us see which you are.','Cut the deck? No. Corvin cuts the deck.','Three cards. One fortune.'],
    win:['The Lantern smiles on you tonight.','Hm. The deck likes you.','Take it before the deck changes its mind.'],
    big:['The house weeps!','By the Ashen Crown — again!','Drinks are on you, friend.'],
    lose:['The Hollow takes its due.','The deck is hungry tonight.','Another hand? Fortune turns.'],
    pair:['A pair — your coin comes home with a friend.','Two of a kind. Small mercies.'],
    rise:['The dead have dealt themselves in.','Thirteen... the Hollow’s own number. Take it and go.','Do you hear them? Under the floor?'],
    road:['The Wanderer walks with you. The road is free.','Three Wanderers... I have not seen this in a hundred hands.'],
    court:['The Court is seated. Kneel and collect.','Crown, Eyes and Key. The old Sovereigns smile.'],
    hunt:['The Hunt is up!','Fang, Raven, Eyes — the hunter’s omens.'],
    asc:['The Ascent. Each card a step higher.','Up the stair, one card at a time.'],
    dead:['The Wanderer walks among the dead, and pays you for it.']}};
// v218 (owner, Nov 10 2026: "Getting 2 of a kind and getting the same payout for all of them isn't exciting. Let's vary the amount paid
// depending on value of the card. Let's also make special bonus event if you get all 3 skulls or 3 wilds as well as other special
// combinations"): a pair pays by its card (CD213.D[k].p2: The Lantern ×1 … The Ashen Crown ×3, two Wanderers ×2.5); special hands
// (CD213.SP, checked before three alike): three Hollows = The Hollow Rises (×13, spectral skulls), three Wanderers = The Wanderer's Road
// (×100 and CD213.FREE free hands at the same bet with every win doubled, CD213.free, saved), The Sovereign's Court (Crown, Eyes, Key in
// any order), The Hunt (Fang, Raven, Eyes), The Ascent (three numerals rising by one, left to right as dealt), Among the Dead (two
// Hollows and a Wanderer). Cards are now laid left to right as the player sees them. ~91% returned (tools: test/v218_games.py).
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
  g.fillStyle='#4a2a14';g.font='600 14px Cinzel, Georgia, serif';g.fillText(k==='wild'?'WILD · THREE ×'+D.p:k==='hol'?'THREE WAKE THE DEAD':'PAIR ×'+D.p2+' · THREE ×'+D.p,W/2,346);
  return c}
function cd213Can(k){if(!CD213.tex[k]){const c=cd213Paint(k);const t=new THREE.CanvasTexture(c);t.anisotropy=4;CD213.tex[k]=t;CD213.url[k]=c.toDataURL('image/png')}return CD213.tex[k]}
function cd213Url(k){cd213Can(k);return CD213.url[k]}
// ---------------- the rules ----------------
function cd213Roll(){const L=Object.keys(CD213.D),tot=L.reduce((s,k)=>s+CD213.D[k].w,0);let r=Math.random()*tot;for(const k of L){r-=CD213.D[k].w;if(r<0)return k}return 'hol'}
// → {m: multiplier of the bet, kind: 'sp' | 'three' | 'pair' | '', k: the card that made it, sp: the special hand's key, free: free hands won}
// v218: the special hands first (they never mix with a Wanderer standing in, except the Wanderers' own), then three alike (a Wanderer
// stands in), then the best pair (each card pays its own p2; two Wanderers and a Hollow are a pair of Wanderers).
var CD213N={lan:1,fang:2,gob:3,rav:4,key:5,eye:6,crown:7};
function cd213Sp(c){const S=CD213.SP,srt=a=>a.slice().sort().join();for(const id of CD213.spOrder){const P=S[id];
    if(P.ord){if(c.every(x=>CD213N[x])&&CD213N[c[1]]===CD213N[c[0]]+1&&CD213N[c[2]]===CD213N[c[1]]+1)return id;continue}
    if(srt(c)===srt(P.c))return id}return ''}
function cd213Pay(c){const D=CD213.D,sp=cd213Sp(c);if(sp){const P=CD213.SP[sp];return {m:P.m,kind:'sp',sp,k:sp==='road'?'wild':sp==='rise'?'hol':'',free:sp==='road'?CD213.FREE:0}}
  const nw=c.filter(x=>x!=='wild'&&x!=='hol'),nh=c.filter(x=>x==='hol').length,w=3-nw.length-nh;
  if(!nh&&nw.length&&nw.every(x=>x===nw[0]))return {m:D[nw[0]].p,kind:'three',k:nw[0]};
  // two alike among the cards that are not The Hollow (a Wanderer makes a pair with anything)
  const cnt={};nw.forEach(x=>cnt[x]=(cnt[x]||0)+1);const best=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]||D[b].p2-D[a].p2)[0];
  if(best&&cnt[best]+w>=2)return {m:D[best].p2,kind:'pair',k:best};if(w>=2)return {m:D.wild.p2,kind:'pair',k:'wild'};return {m:0,kind:'',k:''}}
// the plural name of a card for the plaque ('A PAIR OF RAVENS')
var CD213PL={lan:'LANTERNS',fang:'FANGS',gob:'GOBLETS',rav:'RAVENS',key:'SEALED KEYS',eye:'HUNDRED EYES',crown:'ASHEN CROWNS',wild:'WANDERERS'};
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
// the dealer's dealing arm (v213b): while Corvin poses (CD213.arm > 0) his idle is paused and his bones are set outright from where
// they stood when the pose began; when it ends they go back exactly there and the idle carries on (the old code added the pose on top
// of the idle's own running offsets, which piled up frame after frame and spun him round). CD213.arm 0…1 blends the pose in;
// CD213.armK picks it: 'reach' to lay a card, 'tap' to turn one, 'sweep' to take a losing stake, 'open' for a win.
var CD213P={reach:{aR0:[-1.0,0,-.25],aR1:[0,0,0],aR2:[.2,0,0],chest:[.16,0,0],head:[.2,0,0]},
  tap:{aR0:[-.8,0,-.15],aR2:[.4,0,0],chest:[.14,0,0],head:[.25,0,0]},
  sweep:{aR0:[-.85,0,.3],aR2:[.2,0,0],chest:[.12,0,0]},
  open:{aR0:[-.6,0,-.45],aL0:[-.6,0,.45],head:[-.1,0,0]}};
var CD213B=['aR0','aR1','aR2','aL0','chest','head'];
{const f=idlNpc;idlNpc=function(g,now){if(!CD213.rig||g!==CD213.rig||!g.bones)return f.apply(this,arguments);
  const b=g.bones,v=Math.max(0,Math.min(1,CD213.arm||0));
  if(v>0){if(!CD213.S0){CD213.S0={};CD213B.forEach(n=>{if(b[n])CD213.S0[n]=b[n].rotation.clone()})}const P=CD213P[CD213.armK||'reach']||CD213P.reach;
    CD213B.forEach(n=>{const o=b[n],B=CD213.S0[n];if(!o||!B)return;const d=P[n]||[0,0,0];o.rotation.set(B.x+d[0]*v,B.y+d[1]*v,B.z+d[2]*v)});return}
  if(CD213.S0){CD213B.forEach(n=>{if(b[n]&&CD213.S0[n])b[n].rotation.copy(CD213.S0[n])});CD213.S0=null}
  return f.apply(this,arguments)}}
// ---------------- a hand on the table (relayed: the partner sees the same cards laid) ----------------
function cd213CardMesh(){const g=new THREE.Group(),f=new THREE.Group();g.add(f);const geo=CD213.geo||(CD213.geo=new THREE.PlaneGeometry(.32,.48));
  const mk=(tex,rx,y)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0xd8d0c4,transparent:true}));m.material.userData.noFade135=1;m.rotation.x=rx;m.position.y=y;m.renderOrder=3;f.add(m);return m};
  g.userData.face=mk(null,-Math.PI/2,.003);g.userData.back=mk(cd213Can('back'),Math.PI/2,-.003);g.userData.f=f;return g}
function cd213Clear(){if(CD213.fx){CD213.fx.dead=1;CD213.fx=null}(CD213.lay||[]).forEach(m=>{if(m.parent)m.parent.remove(m);m.userData.face.material.dispose();m.userData.back.material.dispose()});CD213.lay=[];
  cd213Plaque(null);(CD213.glow||[]).forEach(m=>{if(m.parent)m.parent.remove(m);m.material.dispose()});CD213.glow=[]}
// ---------------- words over the table: the result plaque and Corvin's lines (canvas sprites; what the old panel used to show) ----------------
function cd213Text(lines,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  cd213RR(g,4,4,w-8,h-8,18);g.fillStyle='rgba(16,8,6,.82)';g.fill();g.strokeStyle='#c9a24a';g.lineWidth=3;g.stroke();g.textAlign='center';g.textBaseline='middle';
  const n=lines.length;lines.forEach((L,i)=>{g.font=L.f;g.fillStyle=L.c;g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=6;g.fillText(L.t,w/2,h*(i+.5)/n+(n>1?(i?-4:6):0))});return c}
function cd213Sprite(canvas,sw){const t=new THREE.CanvasTexture(canvas);t.anisotropy=4;const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,depthWrite:false});m.userData.noFade135=1;
  const sp=new THREE.Sprite(m);sp.scale.set(sw,sw*canvas.height/canvas.width,1);sp.renderOrder=40;sp.userData.lpsSkip=1;return sp}
function cd213Drop(sp){if(!sp)return;if(sp.parent)sp.parent.remove(sp);sp.material.map.dispose();sp.material.dispose()}
// the result: a plaque over the dealt cards ({kind,k,m,win,bet,sp,dbl,free}; null takes it away)
function cd213Plaque(r){cd213Drop(CD213.plq);CD213.plq=null;if(!r||!CD213.root)return;const D=CD213.D,G='700 40px Cinzel, Georgia, serif',X=r.dbl?'  ×'+r.m+' ×2':'   (×'+r.m+')';
  const L=r.kind==='sp'?[{t:CD213.SP[r.sp].n.toUpperCase(),f:'700 32px Cinzel, Georgia, serif',c:r.sp==='rise'?'#b8ffb0':r.sp==='road'?'#bfe4ff':'#ffe2a0'},{t:'+'+r.win+' gold'+X,f:G,c:'#ffd24a'}]
    :r.kind==='three'?[{t:'THREE × '+D[r.k].n.toUpperCase(),f:'700 30px Cinzel, Georgia, serif',c:'#ffe2a0'},{t:'+'+r.win+' gold'+X,f:G,c:'#ffd24a'}]
    :r.kind==='pair'?[{t:'A PAIR OF '+CD213PL[r.k],f:'700 30px Cinzel, Georgia, serif',c:'#f0e2c0'},{t:(r.m===1&&!r.dbl?'your '+r.win+' back':'+'+r.win+' gold'+X),f:'700 36px Cinzel, Georgia, serif',c:'#ffd24a'}]
    :[{t:'NO MATCH',f:'700 34px Cinzel, Georgia, serif',c:'#b8b0a4'},{t:r.dbl?'a free hand':'the house takes '+r.bet,f:'600 26px Cinzel, Georgia, serif',c:'#8a8278'}];
  if(r.free)L.push({t:r.free+' FREE HANDS · EVERY WIN DOUBLED',f:'700 28px Cinzel, Georgia, serif',c:'#9ad0ff'});
  const big=r.kind==='sp'&&r.m>=13||r.kind==='three'&&r.m>=25,sp=cd213Sprite(cd213Text(L,620,L.length*75),big?1.04:.84),[cx,cz]=DM196I.card;sp.position.set(cx-.42,.95+(L.length>2?.08:0),cz);CD213.root.add(sp);CD213.plq=sp;
  const t0=nowP(),y0=sp.position.y;kqFx({tick(){if(CD213.plq!==sp)return false;const a=(nowP()-t0)/1000;sp.material.opacity=Math.min(1,a*4);sp.position.y=y0+Math.min(.05,a*.2)+(big?Math.sin(a*6)*.012:0);return true}})}
// Corvin speaks: a line over his head for a few seconds
function cd213Say(t){try{cd213Drop(CD213.bub);CD213.bub=null;if(!t||!CD213.root)return;const sp=cd213Sprite(cd213Text([{t:'“'+t+'”',f:'italic 600 26px Cinzel, Georgia, serif',c:'#f0e2c0'}],Math.min(900,90+t.length*15),70),.0016*Math.min(900,90+t.length*15));
  const [cx,cz]=DM196I.card;sp.position.set(cx-1.0,1.42,cz+.95);CD213.root.add(sp);CD213.bub=sp;const t0=nowP();
  kqFx({tick(){if(CD213.bub!==sp)return false;const a=(nowP()-t0)/1000;sp.material.opacity=a<.2?a*5:a>3.6?Math.max(0,1-(a-3.6)*2.5):1;if(a>4.1){cd213Drop(sp);CD213.bub=null;return false}return true}})}catch(_){}}
function cd213Show(cards,big,bet,dbl){try{if(!CD213.root||!Array.isArray(cards)||cards.length!==3)return;const rep=typeof MPV!='undefined'&&MPV.rep>0;if(rep&&CD213.busy)return;
  cards=cards.map(k=>CD213.D[k]?k:'hol');cd213Clear();const R=CD213.root,[cx,cz]=DM196I.card,y0=.725,T=CD213.T,L=[],r=cd213Pay(cards);bet=+bet||0;
  for(let i=0;i<3;i++){const m=cd213CardMesh();m.userData.face.material.map=cd213Can(cards[i]);m.userData.face.material.needsUpdate=true;m.rotation.y=Math.PI/2;m.userData.f.rotation.z=Math.PI;
    m.position.set(CD213.deck[0],y0+.06,CD213.deck[1]);m.visible=false;R.add(m);L.push(m)}CD213.lay=L;
  const slot=i=>[cx+.05,cz+(1-i)*.46],tEnd=3*T.deal+T.gap*.5+2*T.fgap+T.flip+.15;let t=0;
  const o={tick(dt){if(o.dead)return false;t+=dt;
      for(let i=0;i<3;i++){const m=L[i],t0=i*T.deal,k=Math.max(0,Math.min(1,(t-t0)/T.deal));m.visible=t>=t0;const [sx,sz]=slot(i),e=haIO(k);
        m.position.set(CD213.deck[0]+(sx-CD213.deck[0])*e,y0+.06*(1-e)+Math.sin(k*Math.PI)*.18+.002*i,CD213.deck[1]+(sz-CD213.deck[1])*e);m.rotation.y=Math.PI/2+(1-e)*(i-1)*.6;
        const f0=3*T.deal+T.gap*.5+i*T.fgap,fk=Math.max(0,Math.min(1,(t-f0)/T.flip));m.userData.f.rotation.z=Math.PI*(1-haIO(fk));m.userData.f.position.y=Math.sin(fk*Math.PI)*.1;
        if(fk>0&&!m.userData.fl){m.userData.fl=1;cd213Snd('flip',rep?.5:1)}if(t>=t0&&!m.userData.dl){m.userData.dl=1;cd213Snd('deal',rep?.5:1)}}
      // the dealer's arm: a reach for each card dealt, a tap on each one turned
      const dPh=t<3*T.deal?Math.sin(((t%T.deal)/T.deal)*Math.PI):0,fPh=(()=>{const f0=3*T.deal+T.gap*.5,u=t-f0;if(u<0||u>2*T.fgap+T.flip)return 0;const j=Math.floor(u/T.fgap),q=(u-j*T.fgap)/T.flip;return q>=0&&q<=1?Math.sin(q*Math.PI):0})();
      CD213.armK=t<3*T.deal?'reach':'tap';CD213.arm=Math.max(dPh,fPh);
      if(t>=tEnd){if(!o.done){o.done=1;CD213.arm=0;try{o.end2&&o.end2()}catch(_){}cd213Result(r,bet,cards,dbl)}}return t<tEnd+.05},end(){CD213.arm=0}};
  CD213.fx=o;kqFx(o);return o}catch(err){if(!CD213.err++)console.warn('v213 deal',err)}}
// the end of a hand, on every screen that saw it dealt: the plaque, the winning cards lit, Corvin's gesture and the win's effect
function cd213Result(r,bet,cards,dbl){try{const win=Math.floor(bet*r.m*(dbl?2:1));cd213Plaque({kind:r.kind,k:r.k,m:r.m,win,bet,sp:r.sp,dbl:!!dbl,free:r.free||0});
  if(r.kind){const col=r.sp==='rise'?0x7aff8a:r.sp==='road'?0x8ac8ff:0xffc040;CD213.lay.forEach((m,i)=>{const k=cards[i];if(!(r.kind!=='pair'||k===r.k||k==='wild'))return;const g=new THREE.Mesh(CD213.gGeo||(CD213.gGeo=new THREE.PlaneGeometry(.44,.6)),new THREE.MeshBasicMaterial({map:fx186Tex?fx186Tex('soft'):null,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.0}));
    g.material.userData.noFade135=1;g.rotation.x=-Math.PI/2;g.position.set(m.position.x,.718,m.position.z);g.renderOrder=2;CD213.root.add(g);CD213.glow.push(g);const t0=nowP(),d0=r.sp==='asc'?i*.35:0;
    kqFx({tick(){if(!g.parent)return false;const a=(nowP()-t0)/1000-d0;g.material.opacity=Math.max(0,Math.min(.9,a*3))*(.75+.25*Math.sin(a*5));return true}})})}
  cd213Gest(r.kind?'open':'sweep');cd213Say(r.kind==='sp'?cd213Pick(r.sp):r.kind==='three'?(r.m>=25?cd213Pick('big'):cd213Pick('win')):r.kind==='pair'?cd213Pick('pair'):cd213Pick('lose'));
  cd213Win(cd213Tier(r));if(r.sp==='rise')cd213Rise();if(r.sp==='road')cd213Road()}catch(err){if(!CD213.err++)console.warn('v213 result',err)}}
// how big a win is: 0 nothing, 1 a pair, 2 a small three (×5–×10) or a small special, 3 a fine three (×15–×25) or the Court,
// 4 the Crown (×50) or a great special (the Hollow Rises, the Wanderer's Road: their own shows on top, cd213Rise / cd213Road)
function cd213Tier(r){return !r.kind?0:r.kind==='pair'?1:r.kind==='sp'?Math.min(4,CD213.SP[r.sp].t):r.m>=50?4:r.m>=15?3:2}
// v218: The Hollow Rises: green grave-light over the table, three spectral skulls rise from the cards, circle the table and fade
function cd213Skull(){if(CD213.skullC)return CD213.skullC;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  cd213Glow(g,128,128,124,'rgba(110,255,130,.55)');g.save();g.translate(128,132);g.scale(1.05,1.05);g.globalAlpha=.92;try{CD213E.hol(g)}catch(_){}g.restore();
  g.globalCompositeOperation='source-atop';g.fillStyle='rgba(120,255,140,.28)';g.fillRect(0,0,256,256);CD213.skullC=c;return c}
function cd213Rise(){try{const R=CD213.root;if(!R)return;const [cx,cz]=DM196I.card,[wx,wz]=cd213L(cx+.05,cz),Y=R.position.y,p=new THREE.Vector3(wx,Y+.8,wz),rep=typeof MPV!='undefined'&&MPV.rep>0;
  kqFlash(p,0x6aff7a,2.0,900);burst(p,0x7aff8a,40,2.2,2.6,.8);ring(new THREE.Vector3(wx,Y+.74,wz),0x5aff6a,3.2,900);try{flash('rgba(80,255,110,.18)')}catch(_){}cd213Snd('rise',rep?.5:1);
  const tex=new THREE.CanvasTexture(cd213Skull());(CD213.lay||[]).forEach((m,i)=>{const mat=new THREE.SpriteMaterial({map:tex,color:0x9affa8,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});mat.userData.noFade135=1;
    const sp=new THREE.Sprite(mat);sp.scale.set(.5,.5,1);sp.renderOrder=41;sp.userData.lpsSkip=1;sp.position.copy(m.position);R.add(sp);const t0=nowP(),a0=i*2.094;
    kqFx({tick(){const a=(nowP()-t0)/1000;if(a>4.6)return false;const up=Math.min(1,a/1.1),orb=Math.max(0,a-1.1),r=.75*Math.min(1,orb);
      sp.position.set(cx+.05+Math.cos(a0+orb*2.2)*r+(m.position.x-cx-.05)*(1-Math.min(1,orb)),.75+up*.8+Math.sin(a*3+i)*.05+(a>3.6?(a-3.6)*.6:0),cz+Math.sin(a0+orb*2.2)*r+(m.position.z-cz)*(1-Math.min(1,orb)));
      const s=.26+up*.16;sp.scale.set(s,s,1);mat.opacity=Math.min(.7,a*2)*(a>3.6?Math.max(0,1-(a-3.6)):1);mat.rotation=Math.sin(a*2+i)*.25;
      if(Math.random()<.3)burst(sp.getWorldPosition(new THREE.Vector3()),0x8aff9a,1,.2,.8,.4);return true},end(){R.remove(sp);mat.dispose();if(!R.children.some(o=>o.material&&o.material.map===tex))tex.dispose()}})});
  }catch(err){if(!CD213.err++)console.warn('v218 rise',err)}}
// v218: The Wanderer's Road: starlight rises from the table and the free hands are announced
function cd213Road(){try{const R=CD213.root;if(!R)return;const [cx,cz]=DM196I.card,[wx,wz]=cd213L(cx+.05,cz),Y=R.position.y,p=new THREE.Vector3(wx,Y+.8,wz);
  setTimeout(()=>{try{ring(new THREE.Vector3(wx,Y+.74,wz),0x8ac8ff,3.6,800);burst(p,0x9ad0ff,36,2.6,3,.7);kqFlash(p,0x9ad0ff,1.8,500)}catch(_){}},900);const t0=nowP();
  kqFx({tick(){const a=(nowP()-t0)/1000;if(a>3.4)return false;if(Math.random()<.7)burst(new THREE.Vector3(wx+(Math.random()-.5)*1.6,Y+.75+Math.random()*.4,wz+(Math.random()-.5)*1.6),0xbfe4ff,1,.25,2.2,.5);return true}})}catch(err){if(!CD213.err++)console.warn('v218 road',err)}}
// a one-off gesture of Corvin's arms after the hand (an open-palmed flourish for a win, a sweep of the stake for a loss)
function cd213Gest(k){const t0=nowP(),ms=k==='open'?1100:900;CD213.armK=k;kqFx({tick(){if(CD213.busy&&CD213.armK!==k)return false;const a=(nowP()-t0)/ms;if(a>=1){if(CD213.armK===k)CD213.arm=0;return false}CD213.armK=k;CD213.arm=Math.sin(Math.min(1,a)*Math.PI);return true}})}
// coins: little gold discs thrown up from the cards that bounce and settle on the felt, then fade (one shared geometry and material)
function cd213Coins(n,rain){const R=CD213.root;if(!R)return;const [cx,cz]=DM196I.card,G=CD213.cGeo||(CD213.cGeo=new THREE.CylinderGeometry(.034,.034,.008,10)),
  M=CD213.cMat||(CD213.cMat=new THREE.MeshLambertMaterial({color:0xe0b050,emissive:0x5a3a08}));M.userData.noFade135=1;
  for(let i=0;i<n;i++){const m=new THREE.Mesh(G,M.clone());m.material.transparent=true;m.userData.lpsSkip=1;
    const p=rain?{x:cx-.35+Math.random()*1.1,y:1.6+Math.random()*1.2,z:cz-.75+Math.random()*1.5}:{x:cx+.05+(Math.random()-.5)*.3,y:.76,z:cz+(Math.random()-.5)*1.0},
      v=rain?{x:0,y:-Math.random(),z:0}:{x:(Math.random()-.3)*1.2,y:1.4+Math.random()*1.6,z:(Math.random()-.5)*1.4};let sp=(Math.random()-.5)*20;
    m.position.set(p.x,p.y,p.z);R.add(m);let t=-(rain?Math.random()*.9:Math.random()*.25),rest=0;m.visible=false;
    kqFx({tick(dt){t+=dt;if(t<0)return true;m.visible=true;if(!rest){v.y-=9.8*dt;m.position.x+=v.x*dt;m.position.y+=v.y*dt;m.position.z+=v.z*dt;m.rotation.x+=sp*dt;m.rotation.z+=sp*.7*dt;
        const onT=Math.hypot((m.position.x-(cx))/1.0,(m.position.z-cz)/.78)<1,fl=onT?.722:.05;
        if(m.position.y<fl){m.position.y=fl;if(Math.abs(v.y)<.9){rest=1;m.rotation.set(0,m.rotation.y,0)}else{v.y=-v.y*.35;v.x*=.6;v.z*=.6;sp*=.5}}}
      if(t>3.2)m.material.opacity=Math.max(0,1-(t-3.2)/.6);return t<3.8},end(){R.remove(m);m.material.dispose()}})}}
// the win's effect, growing with the win
function cd213Win(tier){try{const R=CD213.root;if(!R||!tier)return;const [cx,cz]=DM196I.card,[wx,wz]=cd213L(cx+.05,cz),Y=R.position.y,p=new THREE.Vector3(wx,Y+.8,wz);
  if(tier>=1){burst(p,0xffd24a,8+tier*8,1.2+tier*.5,1.2+tier*.4,.6);cd213Coins([0,4,10,18,28][tier])}
  if(tier>=2){ring(new THREE.Vector3(wx,Y+.74,wz),0xffd24a,1.2+tier*.5,450);kqFlash(p,0xffe0a0,.9+tier*.3,260)}
  if(tier>=3){// a column of gold light over the table and sparks climbing it
    const mat=new THREE.MeshBasicMaterial({color:0xffc84a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});mat.userData.noFade135=1;
    const col=new THREE.Mesh(CD213.pGeo||(CD213.pGeo=new THREE.CylinderGeometry(.55,.75,3.2,20,1,true)),mat);col.position.set(cx+.05,.72+1.6,cz);col.userData.lpsSkip=1;R.add(col);const t0=nowP(),dur=tier>3?2600:1800;
    kqFx({tick(){const a=(nowP()-t0)/dur;if(a>=1)return false;mat.opacity=(a<.15?a/.15:1-(a-.15)/.85)*(tier>3?.2:.14);col.rotation.y+=.02;col.scale.set(1+a*.3,1,1+a*.3);
      if(Math.random()<.5)burst(new THREE.Vector3(wx+(Math.random()-.5)*.8,Y+.8+Math.random()*1.6,wz+(Math.random()-.5)*.8),0xffe08a,1,.3,1.6,.6);return true},end(){R.remove(col);mat.dispose()}})}
  if(tier>=4){// the jackpot: an ember blast, coins raining from the rafters, the room flashes gold, the floor shakes
    burst(p,0xff7a2a,46,3.4,3.2,1);burst(p,0xffd890,18,2.6,2.4,.5);kqFlash(p,0xffd890,2.2,450);ring(new THREE.Vector3(wx,Y+.74,wz),0xff9a3a,4,700);cd213Coins(40,true);
    try{flash('rgba(255,190,80,.22)')}catch(_){}try{if(!(typeof MPV!='undefined'&&MPV.rep)&&SET.shake!==false)shake(.18)}catch(_){}
    setTimeout(()=>{try{ring(new THREE.Vector3(wx,Y+.74,wz),0xffd24a,3,600);burst(p,0xffd24a,30,2.4,3,.8)}catch(_){}},450)}}catch(err){if(!CD213.err++)console.warn('v213 win',err)}}
(function(){if(typeof MPV=='undefined'||!MPV.FX||typeof MPV_FX=='undefined')return;
  ['cd213Show'].forEach(n=>{const f=window[n];if(typeof f!='function')return;if(MPV_FX[n]==null){MPV_FX[n]=MPV.FX.length;MPV.FX.push(n)}
    window[n]=function(){if(MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
// ---------------- playing ----------------
function cd213Near(){if(CD213.open)return false;try{if(!DM196I.l)return false;const [tx,tz]=cd213L(...DM196I.card);return Math.hypot(pl.position.x-tx,pl.position.z-tz)<2.5&&townAt(pl.position.x,pl.position.z,0)===0}catch(_){return false}}
function cd213Open(){const l=DM196I.l;if(!l||CD213.open)return;const [sx,sz]=cd213L(...CD213.stand);pl.position.x=sx;pl.position.z=sz;pl.rotation.y=l.ry-Math.PI/2;
  CD213.open=true;CD213.camK=0;CD213.plVis=pl.visible;pl.visible=false;cd213Panel().classList.remove('hide');cd213Render();cd213Say(cd213Pick('deal'));try{GD213&&gd213Up()}catch(_){}}
function cd213Close(){if(!CD213.open)return;CD213.open=false;pl.visible=CD213.plVis!==false;const w=$('cd213w');if(w)w.classList.add('hide')}
function cd213Pick(k){const L=CD213.say[k];return L[Math.floor(Math.random()*L.length)]}
// v218: a free hand (CD213.free > 0, won on the Wanderer's Road) costs nothing, plays at the bet that won it and doubles its win
function cd213Deal(){if(CD213.busy)return;const fr=CD213.free>0,b=fr?(CD213.freeBet||CD213.bet):CD213.bet;if(!fr&&gold<b){cd213Say('Your purse is lighter than your courage.');return}
  if(fr)CD213.free--;else gold-=b;const c=[cd213Roll(),cd213Roll(),cd213Roll()],r=cd213Pay(c),win=Math.floor(b*r.m*(fr?2:1));CD213.busy=true;CD213.cards=c;CD213.res=null;
  CD213.stat.n++;if(!fr)CD213.stat.bet+=b;cd213Render();try{hud()}catch(_){}if(Math.random()<.35)cd213Say(cd213Pick('deal'));
  const o=cd213Show(c,cd213Tier(r),b,fr?1:0);
  const fin=()=>{CD213.busy=false;gold+=win;CD213.stat.won+=win;if(r.free){CD213.free+=r.free;CD213.freeBet=b}CD213.res={c,r,win,bet:b,free:fr};
    cd213Snd(r.kind==='sp'?(cd213Tier(r)>=3?'jack':'win'):r.kind==='three'?(r.m>=25?'jack':'win'):r.kind==='pair'?'pair':'lose');
    if(win>0)try{say('🃏 Fate’s Hand: '+(r.kind==='sp'?CD213.SP[r.sp].n:r.kind==='three'?'three × '+CD213.D[r.k].n:'a pair of '+CD213PL[r.k].toLowerCase())+(fr?' (free hand, doubled)':'')+' — you win '+win+' gold.'+(r.free?' '+r.free+' free hands!':''))}catch(_){}
    try{hud()}catch(_){}cd213Render()};
  if(o)o.end2=fin;else{fin();cd213Result(r,b,c,fr?1:0)}}
function cd213Panel(){let w=$('cd213w');if(w)return w;w=document.createElement('div');w.id='cd213w';w.className='hide';
  w.innerHTML=`<div class="win"><div class="wh"><h2 id="cd213T">🃏 Fate’s Hand</h2><span class="wsub" id="cd213S"></span><button class="x" id="cd213X" title="Leave the table (Esc)">✕</button></div><div class="wb" id="cd213B"></div><div class="wf" id="cd213F"></div></div>`;
  ($('stage')||document.body).appendChild(w);w.addEventListener('pointerdown',e=>e.stopPropagation());
  w.addEventListener('click',e=>{const b=e.target.closest('[data-cdb],[data-cdd],#cd213X');if(!b||b.disabled)return;if(b.id==='cd213X'){cd213Close();return}
    if(b.dataset.cdb){CD213.bet=+b.dataset.cdb;cd213Render()}else if(b.dataset.cdd)cd213Deal()});return w}
function cd213Render(){if(!CD213.open)return;cd213Panel();const D=CD213.D,fr=CD213.free>0;
  $('cd213S').textContent='Space / Enter deal · 1–4 bet · Esc leaves';
  const bets=CD213.bets.map(b=>`<button class="cd213b${b===CD213.bet?' on':''}" data-cdb="${b}" ${gold<b||CD213.busy||fr?'disabled':''}>${b} 🪙</button>`).join('');
  const pt=CD213.order.map(k=>`<div class="cd213p" title="${D[k].n} — ${D[k].d}"><img src="${cd213Url(k)}"><b>${k==='hol'?'—':'×'+D[k].p}</b><i>${k==='hol'?'&nbsp;':'pair ×'+D[k].p2}</i></div>`).join('');
  const sp=CD213.spOrder.map(id=>{const P=CD213.SP[id],cs=id==='asc'?['lan','fang','gob']:P.c;return `<div class="cd218s" title="${P.n} — ${P.d}">${cs.map(k=>`<img src="${cd213Url(k)}">`).join('')}<span>${P.n}${id==='asc'?' (in order)':''}</span><b>×${P.m}${id==='road'?' + 5 free':''}</b></div>`}).join('');
  const deal=CD213.busy?'Dealing…':fr?'Free hand · '+CD213.freeBet+' 🪙 ×2 ('+CD213.free+' left)':'Deal · '+CD213.bet+' 🪙';
  $('cd213B').innerHTML=`<div class="cd213ctl"><span class="mut">Bet</span>${bets}<button class="cd213d${fr?' cd218f':''}" data-cdd="1" ${CD213.busy||!fr&&gold<CD213.bet?'disabled':''}>${deal}</button><span class="cd213gold">Purse 🪙 ${gold}</span></div>
    <div class="cd213pg">${pt}</div><div class="cd218sg">${sp}</div><div class="mut cd213pn">Three alike pay the big number, two alike the pair number. The Wanderer stands in for any card; The Hollow for none.</div>`;
  $('cd213F').innerHTML=''};
// while at the table the keys belong to the panel (no walking off mid-hand, no swings at the dealer)
addEventListener('keydown',e=>{if(!CD213.open)return;const k=String(e.key||'').toLowerCase();if(e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  if(k==='escape')cd213Close();else if(k===' '||k==='enter')cd213Deal();else if(k>='1'&&k<='4'&&!CD213.busy&&!(CD213.free>0)){const b=CD213.bets[+k-1];if(b&&gold>=b){CD213.bet=b;cd213Render()}}},true);
addEventListener('keyup',e=>{if(CD213.open)e.stopImmediatePropagation()},true);
{const f=swing;swing=function(){if(CD213.open)return;return f.apply(this,arguments)}}
// the table camera (v213b): head on from the player's seat, Corvin across the table, like a blackjack table (the hero is hidden
// while seated; eased in; the follow camera takes over again on leaving)
function cd213Cam(dt){const l=DM196I.l,T=TOWNS[0];if(!l)return;CD213.camK=Math.min(1,(CD213.camK||0)+dt*2.2);const e=haIO(CD213.camK),C=CD213.cv,[px,pz]=cd213L(C[0],C[2]),[lx,lz]=cd213L(C[3],C[5]);
  const P=new THREE.Vector3(px,T.ph+C[1],pz),Lk=new THREE.Vector3(lx,T.ph+C[4],lz);cam.position.lerp(P,e);look.lerp(Lk,e);cam.lookAt(look);cam.updateMatrixWorld();try{FADE.cam.value.copy(cam.position)}catch(_){}}
{const s=document.createElement('style');s.textContent=`
#cd213w{position:absolute;left:0;right:0;bottom:6px;z-index:6;display:flex;justify-content:center;pointer-events:none}#cd213w.hide{display:none}
#cd213w .win{pointer-events:auto;width:min(720px,98%);max-height:34vh;overflow:auto}#cd213w .wb{padding:6px 10px}#cd213w .wf:empty{display:none}
.cd213ctl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center}.cd213b.on{box-shadow:0 0 0 1px #ffd24a;color:#ffe8a8}
.cd213d{font-weight:700;padding:6px 16px;background:linear-gradient(#7a2a18,#4a140c)!important;color:#ffe8c0!important}.cd213gold{color:#f0d48a;margin-left:6px}
.cd213pg{display:flex;gap:5px;justify-content:center;margin-top:7px;flex-wrap:wrap}.cd213pn{text-align:center;font-size:.68rem;margin-top:3px}
.cd213p{display:flex;flex-direction:column;align-items:center;font-size:.7rem}.cd213p img{width:38px;height:57px;border-radius:3px}.cd213p b{color:#f0d48a}
.cd213p i{font-style:normal;font-size:.6rem;color:#c8b48a}.cd218sg{display:flex;gap:4px 10px;justify-content:center;flex-wrap:wrap;margin-top:6px}
.cd218s{display:flex;align-items:center;gap:2px;font-size:.66rem;color:#e8d8b8}.cd218s img{width:15px;height:22px;border-radius:2px}.cd218s span{margin:0 3px}.cd218s b{color:#ffd24a}
.cd218f{background:linear-gradient(#2a4a7a,#142a4a)!important;box-shadow:0 0 8px #8ac8ff}body.mob .cd218s img{width:11px;height:16px}
body.mob .cd213p img{width:28px;height:42px}`;document.head.appendChild(s)}
// the walk-up prompt at the table
{const f=townPortalPrompt;townPortalPrompt=function(T){try{if(T&&T===TOWNS[0]&&cd213Near())return {label:'F · Play Fate’s Hand at Corvin’s card table',fn:()=>cd213Open()}}catch(_){}return f.apply(this,arguments)}}
// per frame: the table camera; leave the table if pulled away; take the cards away a while after
{const f=townTick;townTick=function(now,pp){const r=f.apply(this,arguments);try{if(CD213.open){const n=nowP(),dt=Math.min(.05,(n-(CD213.camT||n))/1000);CD213.camT=n;cd213Cam(dt)}else CD213.camT=null;
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
    rise:()=>{[110,138.6,164.8,207.7].forEach((f,i)=>T('sawtooth',f,f*.98,i*.12,2.2,.018,{atk:.4,wet:.85,lp:900}));N(500,200,0,2.4,.08,{q:.6,atk:.5,wet:.8});T('sine',55,40,0,2.6,.12,{atk:.3,wet:.5})},
    jack:()=>{for(let i=0;i<16;i++)coin(i*.06,2200+((i*730)%1300));[392,523,659,784].forEach((f,i)=>T('sine',f,f,i*.09,1.2,.04,{atk:.03,wet:.7}));try{mSfx('lvl',.6)}catch(_){}}})[k]?.()}catch(_){}}
// v218: free hands won on the Wanderer's Road are kept with the save
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{if(CD213.free>0)o.cd218={n:CD213.free,b:CD213.freeBet}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.cd218;CD213.free=q&&q.n>0?Math.min(50,q.n|0):0;CD213.freeBet=q&&q.b>0?+q.b:0}catch(_){CD213.free=0}return r}}
