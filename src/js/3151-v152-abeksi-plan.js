// ================= v152 Abeksi, the serpent city — where everything stands =================
// A stealth level between Hillside Crest I and II (its own instance, g 30; 3150). The hero comes in through a breach in the north
// wall and has to cross six districts unseen to the drain under the south wall: The Breach → the Market → the Dwellings → the Rat
// Warrens → the Great Kitchen → the Gate Yard. Each district is closed off by a row of buildings with one opening, on alternate
// sides, so the route zig-zags across the city (~550 tiles; ~10 minutes crouched, with the waiting).
// Everything here is in the city's own frame (u across 0..150 west → east, v along 0..200 north → south; world = x0+u, y0+v) and is
// a pure function of the numbers below: ab152Plan() is hoisted and cached, because 0045 (sp152Map) paints the ground from it long
// before this file runs.
//  * B: buildings [u0,v0,u1,v1, storeys, style] — solid ('r' tiles) and tall cover (they block every line of sight).
//  * C: cover and props [kind,u,v,turn] — kinds in AB152_K: footprint (w × d tiles), sight class (1 low: hides a crouched hero,
//    2 tall: hides everyone, 3 cloth: hides everyone but can be walked through) and whether it is solid.
//  * L: lights [kind,u,v] — torches, braziers, lanterns, the hearth. The light level at the hero (ab152Light) sets how far snakes see.
//  * N: the snakes [id, look, role, u, v, turn, options] — roles and poses in 3153/3154.
//  * CP: checkpoints [u,v,turn, name], one per district; EXIT: the drain.
var AB152_K={
  crate:[1,1,1,1],cstack:[1,1,2,1],barrel:[1,1,1,1],barrels:[2,1,1,1],cart:[3,2,1,1],wagon:[4,2,2,1],stall:[4,2,1,1],rubble:[2,2,1,1],
  hay:[2,1,1,1],pillar:[1,1,2,1],fountain:[5,5,2,1],table:[3,1,1,1],trough:[2,1,1,1],hearth:[16,2,2,1],cauldron:[2,2,1,1],block:[2,1,1,1],
  laundry:[4,1,3,0],planter:[1,1,1,1],statue:[2,2,2,1],sacks:[2,1,1,1],hutch:[3,1,1,1],cage:[1,1,1,1],spit:[3,1,1,1],rack:[3,1,2,1],
  well:[2,2,1,1],fence:[2,1,1,1],fenceV:[1,2,1,1],bench:[2,1,0,1],stool:[1,1,0,0],awning:[4,3,0,0],platform:[3,3,1,1],gate:[6,1,2,1],drain:[2,1,0,0]};
function ab152Plan(){if(ab152Plan.c)return ab152Plan.c;
  const B=[],C=[],L=[],N=[],PEN=[];
  const b=(u0,v0,u1,v1,s,st)=>B.push([u0,v0,u1,v1,s||2,st||'house']);
  const c=(k,u,v,r)=>C.push([k,u,v,r||0]);
  const l=(k,u,v)=>L.push([k,u,v]);
  // a row of buildings across the city with one opening [o0,o1) (the district wall), broken into house fronts
  const row=(v0,v1,o0,o1,s)=>{const cut=(a,z)=>{for(let u=a;u<z;){const w=Math.min(z-u,8+((u*7+v0*3)%5));b(u,v0,u+w,v1,s+((u+v0)%3==0?1:0),'house');u+=w}};cut(8,o0);cut(o1,142)};
  // ---------------- the outer wall (built as its own pieces in 3152; here only the ring of solid tiles) ----------------
  // ---------------- A · The Breach (v 6..28): a ruined courtyard behind the north wall ----------------
  b(62,6,142,28,3,'barracks');                                    // the old barracks fill the east half
  b(40,6,52,12,2,'ruin');                                         // a collapsed guardhouse
  c('rubble',16,13);c('rubble',19,18);c('crate',12,20);c('crate',13,21);c('barrels',30,9);c('rubble',34,20);c('cstack',28,24);
  c('crate',45,18);c('hay',52,22);c('rubble',56,14);c('cart',36,25);c('barrel',18,25);
  l('brazier',32,15);l('torch',46,13);l('torch',58,26);
  N.push(['a1','w','sentry',44,22,Math.PI*1.1,{arc:1.2,per:9,rng:9}]);           // watches the courtyard from the ruin's step
  N.push(['a2','w','sit',32,17,Math.PI,{pose:'sitEat',seat:1}]);                 // a guard eating by the brazier, his back to the way through
  row(28,32,20,28,2);
  // ---------------- B · The Market (v 32..70): stalls round a serpent fountain, an arcade on the north side ----------------
  for(let u=32;u<=132;u+=6)c('pillar',u,35);                    // the arcade: pillars, a shaded walk behind them (v 33..35)
  [41,53,65,89,101,113,125].forEach((u,i)=>c(i%2?'barrels':'crate',u,33.6));   // goods stacked in the arcade: somewhere to wait while its guard walks by
  c('awning',40,33);c('awning',64,33);c('awning',100,33);
  [[38,43],[50,43],[62,43],[96,43],[108,43],[120,43],[38,51],[50,51],[108,51],[120,51],[38,59],[50,59],[62,59],[96,59],[108,59],[120,59]].forEach(([u,v],i)=>{c('stall',u,v,(i%2)*Math.PI);c('awning',u,v-.5)});
  c('fountain',78,49);c('cart',70,63);c('cart',88,41.4);c('barrels',27,48);c('crate',26,56);c('crate',27,57);c('sacks',134,47);c('barrels',134,57);
  c('cstack',90,63);c('cstack',91,63);c('planter',75,44);c('planter',85,44);c('planter',75,56);c('planter',85,56);c('crate',128,68);c('crate',129,68.4);
  l('brazier',78,46);l('brazier',78,56);l('lantern',44,47);l('lantern',114,47);l('lantern',44,55);l('lantern',114,55);l('torch',24,40);l('torch',136,62);l('torch',60,36);l('torch',104,36);
  N.push(['b1','w','patrol',30,40,0,{path:[[30,39,2],[132,39,3],[132,66,2],[30,66,3]],spd:1.25}]);
  N.push(['b2','w','sentry',80,46.2,Math.PI,{arc:Math.PI,per:16,rng:10}]);          // on the fountain steps, turning slowly all round
  N.push(['b15','w','patrol',34,36.4,0,{path:[[34,36.4,3],[130,36.4,3]],spd:1.1}]);   // walks the arcade end to end
  N.push(['b3','a','work',38,41.4,0,{pose:'haggle'}]);N.push(['b4','s','work',50,44.6,Math.PI,{pose:'haggle'}]);
  N.push(['b5','a','work',96,44.6,Math.PI,{pose:'hammer'}]);N.push(['b6','s','work',108,41.4,0,{pose:'haggle'}]);
  N.push(['b7','a','work',38,57.4,0,{pose:'haggle'}]);N.push(['b8','s','work',120,60.6,Math.PI,{pose:'eatStand'}]);
  N.push(['b9','a','walker',44,48,0,{path:[[44,48,4],[70,48,1],[70,55,3],[100,55,2],[100,48,4],[70,48,0]],spd:1.1}]);
  N.push(['b10','s','walker',115,55,0,{path:[[115,55,3],[115,64.8,2],[56,64.8,4],[56,55,2]],spd:1.0}]);
  N.push(['b11','a','talk',106,47.4,-Math.PI/2,{with:'b12'}]);N.push(['b12','s','talk',104.2,47.4,Math.PI/2,{with:'b11'}]);
  N.push(['b13','a','talk',58,67,Math.PI*.25,{with:'b14'}]);N.push(['b14','w','talk',59.6,68.4,Math.PI*1.25,{with:'b13'}]);
  row(70,74,118,126,2);
  // ---------------- C · The Dwellings (v 74..114): house blocks and narrow lanes ----------------
  // lanes: north v 74..78, middle v 89..92 and 101..104, south v 110..114; north-south u 30..34, 58..62, 86..90, 114..118
  [[8,78,30,89],[34,78,58,89],[62,78,86,89],[90,78,114,89],[118,78,142,89],
   [8,92,30,101],[34,92,58,101],[62,92,86,101],[90,92,114,101],[118,92,142,101],
   [8,104,30,110],[34,104,58,110],[62,104,86,110],[90,104,114,110],[118,104,142,110]].forEach(([u0,v0,u1,v1],i)=>{
    // each block: two or three houses with a small yard cut out on one side (yards are open ground with clutter)
    const yard=i%3,m=Math.floor((u0+u1)/2);
    if(yard==0){b(u0,v0,m-1,v1,2,'house');b(m+2,v0,u1,v1,3,'house');c('barrel',m,v0+2);c('planter',m+1,v1-2)}
    else if(yard==1){b(u0,v0,u1,v1-3,2,'house');c('laundry',u0+3,v1-2);c('crate',u1-3,v1-2);c('barrel',u1-2,v1-2)}
    else{b(u0,v0,m-3,v1,3,'house');b(m,v0,u1,v1,2,'house');c('cstack',m-2,v0+3);c('sacks',m-2,v1-3)}});
  c('well',74,99.4);c('laundry',44,90.5);c('laundry',96,102.5);c('cart',126,76);c('barrels',36,111);c('crate',64,111);
  l('torch',29.4,80);l('torch',85.4,80);l('torch',117.6,95);l('torch',57.4,95);l('lantern',72,91.6);l('torch',29.4,107);l('torch',85.4,108);l('brazier',124,112);
  N.push(['c1','w','patrol',34,90.5,0,{path:[[34,90.5,2],[114,90.5,3]],spd:1.2}]);
  N.push(['c2','w','patrol',114,102.5,0,{path:[[114,102.5,3],[34,102.5,2]],spd:1.2}]);
  N.push(['c3','w','lantern',60,78,0,{path:[[60,78,3],[60,112,3]],spd:.9,rng:12}]);
  N.push(['c4','a','sit',76,77.2,Math.PI,{pose:'sitEat',seat:1}]);N.push(['c5','s','sit',104,111.6,0,{pose:'sit',seat:1}]);
  N.push(['c6','a','talk',87,96,Math.PI/2,{with:'c7'}]);N.push(['c7','s','talk',88.8,96,-Math.PI/2,{with:'c6'}]);
  N.push(['c8','s','work',131,92.6,0,{pose:'sweep'}]);N.push(['c9','a','walker',116,76,0,{path:[[116,76,2],[140,76,3]],spd:1.0}]);
  N.push(['c10','s','sit',50,101.6,0,{pose:'sitEat',seat:1}]);
  row(114,118,20,28,2);
  // ---------------- D · The Rat Warrens (v 118..150): barns, breeding hutches and pens of rats ----------------
  b(36,120,64,128,2,'barn');b(88,120,118,128,2,'barn');
  [[32,132,54,144],[62,132,84,144],[94,132,116,144]].forEach(([u0,v0,u1,v1],i)=>{PEN.push([u0,v0,u1,v1]);
    // fences (low cover, solid) with a gate gap on the south side; the pen inside is the rats' (walking in makes them squeal)
    for(let u=u0;u<=u1;u+=2){c('fence',u,v0);if(Math.abs(u-(u0+u1)/2)>2)c('fence',u,v1)}for(let v=v0+2;v<v1;v+=2){c('fenceV',u0,v);c('fenceV',u1,v)}
    c('trough',u0+5,v0+3);c('trough',u1-6,v1-3)});
  c('hutch',70,129.5);c('hutch',76,129.5);c('hutch',124,130.5);c('hay',28,126);c('hay',28,128);c('hay',124,138);c('hay',124,141);c('sacks',88,148.8);c('cage',58,148.8);c('cage',59.2,149);
  c('cart',70,148.6);c('barrels',100,148.8);c('cstack',114,148.8);c('crate',56,131);
  l('lantern',50,129);l('lantern',102,129);l('torch',30,140);l('torch',88,138);l('torch',58,148);l('brazier',120,145);
  N.push(['d1','w','sentry',73,138,Math.PI,{arc:1.6,per:12,rng:11,lift:.6}]);   // the overseer on a platform between the pens
  N.push(['d2','a','work',43,136,0,{pose:'feed'}]);N.push(['d3','s','work',104,140,Math.PI,{pose:'feed'}]);N.push(['d4','a','work',66,141,Math.PI/2,{pose:'fork'}]);
  N.push(['d5','w','patrol',26,148,0,{path:[[26,146.5,2],[126,146.5,3]],spd:1.15}]);
  N.push(['d6','s','walker',119,124,0,{path:[[119,124,3],[119,150,1],[122,153,0],[122,156,4],[122,150,0]],spd:1.0,carry:'cage'}]);   // carries rats to the kitchen
  N.push(['d7','a','work',75,128.4,0,{pose:'feed'}]);
  row(150,154,118,126,2);
  // ---------------- E · The Great Kitchen (v 154..178): the hearth, spits of rats, cauldrons, the long tables ----------------
  b(40,154,112,156,1,'hall');
  c('hearth',52,157);c('hearth',76,157);c('spit',58,159);c('spit',70,159);c('spit',84,159);c('cauldron',96,159);c('cauldron',46,159.5);
  c('block',104,161);c('rack',112,158);c('table',52,166);c('table',64,166);c('table',76,166);c('table',88,166);
  for(const u of [51,53,63,65,75,77,87,89]){c('stool',u,165);c('stool',u,167)}
  c('sacks',30,174);c('barrels',34,175);c('cstack',40,175);c('crate',46,175);c('cstack',58,175);c('barrels',70,175);c('crate',82,175);c('cstack',94,175);c('sacks',104,175);c('crate',116,174);c('cage',124,160);c('cage',125,161);
  l('hearth',60,157.5);l('hearth',84,157.5);l('lantern',58,166);l('lantern',82,166);l('torch',128,166);l('torch',24,170);
  N.push(['e1','w','spit',58,160.6,Math.PI,{pose:'spit'}]);N.push(['e2','a','work',84,160.6,Math.PI,{pose:'spit'}]);
  N.push(['e3','s','work',96,161.6,Math.PI,{pose:'stir'}]);N.push(['e4','a','work',104,162.4,Math.PI,{pose:'chop'}]);
  N.push(['e5','w','patrol',40,170,0,{path:[[40,170,3],[118,170,3]],spd:1.0,chef:1}]);    // the head cook walks the hall
  N.push(['e6','s','walker',70,161,0,{path:[[70,161,2],[64,164.6,2],[90,161,2],[88,164.6,2]],spd:1.2,carry:'platter'}]);
  N.push(['e7','a','sit',52,164.4,0,{pose:'sitEat',seat:1}]);N.push(['e8','s','sit',65,167.6,Math.PI,{pose:'sitEat',seat:1}]);
  N.push(['e9','a','sit',77,164.4,0,{pose:'sitEat',seat:1}]);N.push(['e10','w','sit',88,167.6,Math.PI,{pose:'sitEat',seat:1}]);
  N.push(['e11','s','work',46,161.4,Math.PI,{pose:'stir'}]);
  row(178,182,20,28,2);
  // ---------------- F · The Gate Yard (v 182..194): the city gate, its tower, and the drain under the wall ----------------
  b(66,188,84,194,4,'tower');                                    // the gatehouse (the gate itself faces the yard)
  c('gate',75,187);c('wagon',44,186);c('crate',56,190);c('cstack',57,190);c('barrels',94,188);c('cart',106,188.6);c('crate',116,190);c('hay',120,186);c('crate',126,188);c('drain',129,193);
  c('cstack',70,186);c('cstack',80,186);c('crate',69,187);c('barrel',81,187);c('table',74,183.2);c('rack',62,183.6);   // stacks beside the gate to duck behind; the guards' dice table; their spear rack
  l('brazier',62,186);l('brazier',88,186);l('torch',40,192);l('torch',112,192);
  N.push(['f1','w','sit',72.2,183.2,Math.PI/2,{pose:'sit',seat:1}]);N.push(['f2','w','sit',75.8,183.2,-Math.PI/2,{pose:'sit',seat:1}]);   // the gate guards at their dice
  N.push(['f3','w','lantern',75,187,Math.PI,{sweep:1,arc:1.25,per:9,rng:15,lift:3.8}]);  // the tower lamp sweeps the yard
  N.push(['f4','w','patrol',30,183.6,0,{path:[[30,183.6,2],[124,183.6,3],[124,190.5,3],[90,190.5,2],[90,183.6,0]],spd:1.3}]);
  const CP=[[14,10,.7,'The Breach'],[24,34,.8,'The Market'],[122,76,-.7,'The Dwellings'],[24,120,.8,'The Rat Warrens'],[122,156,-.8,'The Great Kitchen'],[24,184,1.4,'The Gate Yard']];
  const EXIT=[129,192.6];
  return ab152Plan.c={W:150,H:200,B,C,L,N,PEN,CP,EXIT,D:[[6,28],[32,70],[74,114],[118,150],[154,178],[182,194]],IN:[8,6,141,193]}}
// v152: the city's ground, called from 0045 (sp152Map) before anything is built from the map: every tile inside the walls is open
// ground (streets 'a', yards '.'), the building footprints are solid 'r' tiles (no mesh of their own), the rest of the rectangle is
// void. DW inside is negative (flat ground at 1.6 where 0045 makes the heights), so the city sits level on its own plateau.
function ab152Map(m,bio,DW,I,bi){const P=ab152Plan(),[a0,b0,a1,b1]=P.IN,X=I.x0,Y=I.y0;
  for(let v=0;v<I.h;v++)for(let u=0;u<I.w;u++){const x=X+u,y=Y+v,k=y*W+x,inn=u>=a0&&u<=a1&&v>=b0&&v<=b1;if(!m[y])continue;bio[y][x]=bi;
    if(inn){m[y][x]=(u+v)%9==0?'a':'.';DW[k]=-Math.max(1,Math.min(u-a0,a1-u,v-b0,b1-v)+1)}else{m[y][x]='';DW[k]=Math.max(1,Math.max(a0-u,u-a1,b0-v,v-b1))}}
  // the streets: every open tile that is not in a yard reads as worn paving
  P.B.forEach(([u0,v0,u1,v1])=>{for(let v=v0;v<v1;v++)for(let u=u0;u<u1;u++){const x=X+u,y=Y+v;if(m[y]&&m[y][x]!=='')m[y][x]='r'}});
  // the breach in the north wall and the drain stay open; the rest of the inner edge is the wall (solid)
}
