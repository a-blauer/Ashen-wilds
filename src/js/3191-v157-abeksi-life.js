// ================= v157 Abeksi alive: the serpent city's people, crafts, shrines and feasts =================
// Owner: "When in the Abeksi city it seems very empty with large areas empty. We need to bring this city to life. The abeksi are
// fierce warriors and mystics. Their culture includes alchemy, art pieces made of steel, fine jewellery, sacrifice, flute music and
// feasting. The Abeksi people breed rats as a food source. They have a large population so the city should feel alive and prosperous.
// (I also noticed some of the torch flames were floating in the city)"
//  * The plan (3151) gains props, lights, a rat pen and the city's folk (ab157Plan, wrapped round ab152Plan): every district's empty
//    ground is filled — the Breach: a sacrificial shrine (idol, altar, offerings, censers, kneeling worshippers, a chanting mystic) and
//    a training yard (sparring warriors, dummies, weapon racks); the Market: a steel sculpture court, jewellers' stalls, shoppers at
//    every stall, a flute player on the fountain; the Dwellings: an alchemists' lane (stills, bubbling vats, shelves of glowing vials,
//    coloured smoke), rooftop feasts and gatherings, rugs and banners on the walls; the Rat Warrens: a rat butchery, roasting spits,
//    tall breeding hutches and a fourth pen; the Great Kitchen: two feasting halls (long tables, diners, servers, a flute and a
//    drum); the Gate Yard: a caravan unloading and steel guardians by the wall.
//  * The props are new AB152_K / AB152KB kinds, so 3155 bakes them into its district meshes and registers their solid tiles (CBLK, the
//    grid) exactly like the old ones; the walls' rugs and banners and the rooftop furniture are baked per district here (ab157Dress).
//  * The folk (P.F) are Abeksi models from ab152MakeActor with the 3154 routines and poses (plus new ones below). They are AMBIENT:
//    absorbed in their work and feasts, they do not watch for the hero (only the 49 snakes of the plan do: the stealth level and its
//    unseen route are unchanged). They stand off the sneaking routes (behind counters, at tables, in workshops and yards, on roofs).
//    Each is only in the scene within AB157V.R tiles of the hero (posed every frame near, every other frame further out).
//  * Placement is a pure function of the plan (no random draws at run time), so partners in co-op see the same city.
//  * Flutes: a soft synthesized flute (breathy sine with vibrato, a hijaz scale) plays near any flute player (AB157V.flR), through
//    the game's sound volume. Coloured smoke and bubbles (two shared Points objects) rise from the vats, stills and censers.
//  * Torch fix: flames flickered by scaling their whole group from the ground, so a flame rose up to 0.3 above its torch; every flame
//    now scales from its own base (a pivot). Torches and lanterns that stood inside house walls are replaced by wall sconces.
var AB157={S:null,err:0};
var AB157V={R:36,far:22,flR:20,flV:.07};
var AB157C={steel:0xc4c8cc,steelM:0x9aa0a8,steelD:0x5a5e66,gold:0xd8a838,goldD:0x9a7424,ruby:0xff2a3a,emer:0x3aff8a,saph:0x4a7aff,amth:0xc06aff,
  velvet:0x5a1018,crim:0x7a1a1a,teal:0x1a5a5a,purp:0x4a2a5a,ink:0x1a1414,wax:0xe8dcc0,blood:0x3a0606,bloodL:0x6a0c0c,bone:0xd8ccb0,glass:0x3a4a44,copper:0xb8683a,
  vial:[0x6aff6a,0xb06aff,0xffb03a,0xff3a5a,0x3ad8ff],tex:[0x7a1a1a,0xb8862a,0x1a5a5a,0x4a2a5a,0x2a2a4a,0x8a3a1a,0x1a1414]};
// footprints (w × d tiles, sight class, solid): see 3151
Object.assign(AB152_K,{feast:[6,1,1,1],alembic:[2,1,1,1],vat:[2,2,1,1],vatV:[2,2,1,1],shelfV:[2,1,2,1],sculptA:[2,2,2,1],sculptB:[2,2,2,1],sculptC:[2,2,2,1],sculptD:[2,2,2,1],
  jewel:[4,2,1,1],altar:[3,2,1,1],idol:[2,2,2,1],offer:[1,1,0,0],bannerP:[1,1,0,1],dummy:[1,1,1,1],wrack:[2,1,1,1],butcher:[3,1,1,1],hutchT:[3,1,2,1],
  carpet:[3,2,0,0],chest:[1,1,1,1],drum:[1,1,0,0],censer:[1,1,1,1]});
Object.assign(AB152L,{alch:[4.5,1.1,0x6aff8a],vio:[4.5,1.1,0xb070ff],altar:[5,1.4,0xff4a2a]});

// ---------------- the props (kit builders; origin on the ground, +z = front) ----------------
function ab157Candle(k,x,y,z,h){k.p('','cyl','c',AB157C.wax,x,y+h/2,z,.03,h,.03);k.p('','cone','g',0xffc060,x,y+h+.03,z,.022,.07,.022)}
AB152KB.feast=(k,C)=>{const A=AB157C;k.p('','box','c',C.woodL,0,.74,0,5.8,.08,1.0);[-2.6,0,2.6].forEach(x=>[-1,1].forEach(s=>k.p('','box','c',C.woodD,x,.35,s*.38,.12,.7,.1)));
  k.p('','box','c',A.crim,0,.785,0,5.9,.012,.5);[-.25,.25].forEach(z=>k.p('','box','m',A.gold,0,.79,z,5.9,.008,.03));
  for(let i=0;i<8;i++){const x=-2.55+i*.73;
    if(i%3==0){k.p('','cyl','m',C.brass,x,.8,0,.26,.02,.2);k.p('','sph','c',C.meat,x,.86,0,.1,.07,.17);k.p('','sph','c',C.meatD,x,.86,.17,.06,.05,.06);k.L('','c',C.meatD,[x,.84,-.16],[x+.04,.81,-.36],.015,.004,3)}
    else if(i%3==1){k.p('','cyl','c',0x6a4a2a,x,.82,0,.2,.06,.2);for(let j=0;j<5;j++)k.p('','sph','c',[0x6a1a3a,0x9a7a2a,0x3a6a2a][j%3],x+Math.sin(j*1.3)*.09,.89,Math.cos(j*1.3)*.09,.06)}
    else{k.p('','sph','c',0xb08a50,x,.82,0,.16,.07,.1);k.p('','sph','c',0xa07a40,x+.12,.82,.05,.1,.06,.08)}
    [-1,1].forEach(sd=>{k.p('','cyl','m',A.gold,x+.2,.86,sd*.36,.035,.13,.035);k.p('','cyl','m',A.gold,x+.2,.8,sd*.36,.06,.01,.06)});
    if(i%2==0)ab157Candle(k,x+.36,.78,0,.16)}
  k.p('','cyl','c',0x7a3a1a,-.3,.92,.05,.12,.3,.12);k.p('','cyl','c',0x6a2a14,1.9,.9,-.05,.1,.26,.1)};
AB152KB.alembic=(k,C)=>{const A=AB157C;k.p('','box','c',C.wood,0,.78,0,1.9,.08,.9);[-.85,.85].forEach(x=>[-.35,.35].forEach(z=>k.p('','box','c',C.woodD,x,.38,z,.08,.76,.08)));k.p('','box','c',C.woodD,0,.25,0,1.8,.05,.8);
  // the still: a copper pot on a burner, a glass head, a long neck to a flask of glowing distillate
  k.p('','cyl','m',C.iron,-.55,.86,0,.16,.08,.16);k.p('','cone','g',0xff8a30,-.55,.95,0,.08,.1,.08);k.p('','sph','m',A.copper,-.55,1.1,0,.22,.2,.22);
  k.p('','sph','c',A.glass,-.55,1.34,0,.13,.12,.13);k.L('','m',A.copper,[-.5,1.4,0],[.12,1.18,.05],.025,.02,4);
  k.p('','sph','g',A.vial[0],.18,.96,.05,.14,.13,.14);k.p('','cyl','c',A.glass,.18,1.13,.05,.04,.14,.04);
  for(let i=0;i<6;i++){const x=.42+(i%3)*.17,z=(i<3?-.25:.25);k.p('','cyl','g',A.vial[i%5],x,.9,z,.04,.16,.04);k.p('','cyl','c',C.woodD,x,1.0,z,.025,.04,.025)}
  k.p('','cyl','c',C.stoneD,-.1,.88,-.3,.1,.12,.1);k.L('','c',C.woodL,[-.1,.9,-.3],[-.02,1.07,-.25],.015,.012,3);
  k.p('','box','c',0x4a1a14,.1,.85,.3,.3,.06,.22,0,.3,0);k.p('','box','c',0x2a3a4a,.12,.9,.3,.28,.05,.2,0,.1,0);k.p('','sph','c',A.bone,-.85,.88,-.3,.06,.05,.08)};
const ab157Vat=col=>(k,C)=>{const A=AB157C;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','box','c',C.stoneD,Math.sin(a)*.8,.2,Math.cos(a)*.8,.4,.4,.3,0,a,0)}
  k.p('','cone','g',0xff7a20,0,.3,0,.45,.3,.45);k.p('','cyl','m',C.iron,0,.85,0,.78,.9,.78);[.5,1.15].forEach(y=>k.p('','ring','m',A.copper,0,y,0,.8,.5,.8));
  k.p('','ring','m',C.ironL,0,1.3,0,.8,.6,.8);k.p('','cyl','g',col,0,1.27,0,.72,.02,.72);for(let i=0;i<6;i++)k.p('','sph','g',lgCol(col,0xffffff,.5),Math.sin(i*2.1)*.4,1.29,Math.cos(i*2.1)*.4,.08,.04,.08);
  k.L('','c',C.woodL,[.3,1.0,.2],[-.25,2.0,-.1],.025,.02,4)};
AB152KB.vat=ab157Vat(0x5aff7a);AB152KB.vatV=ab157Vat(0xb06aff);
AB152KB.shelfV=(k,C)=>{const A=AB157C;[-.9,.9].forEach(x=>k.p('','box','c',C.woodD,x,1.1,0,.08,2.2,.45));k.p('','box','c',C.wood,0,1.1,-.2,1.8,2.2,.04);
  for(let s=0;s<4;s++){const y=.35+s*.55;k.p('','box','c',C.woodL,0,y,0,1.8,.05,.42);for(let i=0;i<6;i++){const x=-.72+i*.29,r=(i*7+s*3)%5;
    if(r<3){k.p('','cyl','g',A.vial[(i+s)%5],x,y+.125,0,.05,.2,.05);k.p('','cyl','c',C.woodD,x,y+.245,0,.03,.04,.03)}else if(r==3)k.p('','sph','c',0x7a5a3a,x,y+.12,0,.1,.12,.1);else k.p('','sph','c',A.bone,x,y+.085,0,.07,.06,.09)}}};
// steel art on stone plinths
function ab157Plinth(k,C,h){k.p('','box','c',C.stoneD,0,.12,0,1.6,.24,1.6);k.p('','box','c',C.stoneL,0,.24+h/2,0,1.2,h,1.2);k.p('','box','c',C.trim,0,.24+h+.05,0,1.35,.1,1.35);k.p('','box','m',AB157C.gold,0,.24+h*.55,.61,.5,.12,.02)}
AB152KB.sculptA=(k,C)=>{const A=AB157C;ab157Plinth(k,C,.8);const y0=1.14;k.L('','m',A.steelD,[0,y0,0],[0,y0+2.4,0],.05,.04,6);    // a spiral of blades round a rod, a steel cobra on top
  for(let i=0;i<14;i++){const a=i*.75,y=y0+.1+i*.16,r=.5-i*.022;k.p('','box','m',i%2?A.steel:A.steelM,Math.sin(a)*r,y,Math.cos(a)*r,.06,.05,.6,0,a+Math.PI/2,.35)}
  k.p('','hood','m',A.steel,0,y0+2.3,.05,.45,.55,.28);k.p('','sph','m',A.steelM,0,y0+2.62,.2,.12,.1,.16);[-1,1].forEach(s=>k.p('','box','g',A.ruby,s*.05,y0+2.66,.33,.03,.02,.02))};
AB152KB.sculptB=(k,C)=>{const A=AB157C;ab157Plinth(k,C,.6);const y0=.94;      // a rearing cobra of steel plates
  k.p('','tor','m',A.steelM,0,y0+.15,0,.7,.3,.7);k.p('','tor','m',A.steel,0,y0+.42,0,.5,.3,.5);
  let p=[0,y0+.5,0];for(let i=1;i<=6;i++){const q=[Math.sin(i*.5)*.12,y0+.5+i*.38,i*.06];k.L('','m',i%2?A.steel:A.steelM,p,q,.2-i*.018,.19-i*.018,6);p=q}
  k.p('','hood','m',A.steel,p[0],p[1]-.35,p[2]-.05,1.0,1.2,.5);k.p('','sph','m',A.steelM,p[0],p[1]+.1,p[2]+.22,.2,.15,.28);
  [-1,1].forEach(s=>{k.p('','cone','m',A.bone,p[0]+s*.07,p[1]-.04,p[2]+.4,.025,.12,.025,Math.PI,0,0);k.p('','box','g',A.emer,p[0]+s*.09,p[1]+.16,p[2]+.38,.04,.025,.02)});
  for(let i=0;i<5;i++)k.p('','box','m',A.gold,i*.02,y0+.8+i*.35,i*.06+.2,.18,.04,.02)};
AB152KB.sculptC=(k,C)=>{const A=AB157C;ab157Plinth(k,C,.7);const y0=1.04,cy=y0+1.45;k.L('','m',A.steelD,[0,y0,0],[0,cy,0],.08,.06,6);   // a sun of swords
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=Math.sin(a),y=Math.cos(a);k.p('','box','m',A.steel,x*.75,cy+y*.75,0,.07,.95,.02,0,0,-a);k.p('','box','m',A.goldD,x*.25,cy+y*.25,0,.22,.05,.05,0,0,-a);k.p('','cone4','m',A.steel,x*1.27,cy+y*1.27,0,.04,.14,.012,0,0,-a)}
  k.p('','oct','g',A.ruby,0,cy,0,.16,.2,.1);k.p('','tor','m',A.gold,0,cy,0,.24,.06,.24,Math.PI/2,0,0)};
AB152KB.sculptD=(k,C)=>{const A=AB157C;ab157Plinth(k,C,1.0);const y0=1.34;    // a twisting spire of blades, a jade orb at the top
  for(let i=0;i<9;i++){const a=i*.7,y=y0+i*.36;[0,1,2].forEach(j=>{const b=a+j*2.09;k.p('','cone4','m',j%2?A.steelM:A.steel,Math.sin(b)*.32,y+.2,Math.cos(b)*.32,.1,.55,.06,Math.cos(b)*.5,0,-Math.sin(b)*.5)})}
  k.L('','m',A.steelD,[0,y0,0],[0,y0+3.4,0],.1,.03,6);k.p('','sph','g',0x3affc0,0,y0+3.5,0,.18);k.p('','tor','m',A.gold,0,y0+3.5,0,.28,.05,.28,Math.PI/2,0,0)};
// a jeweller's stall: a velvet counter, busts with necklaces, trays of rings and stones, chains of gems under the canopy
AB152KB.jewel=(k,C)=>{const A=AB157C,G=[A.ruby,A.emer,A.saph,A.amth];k.p('','box','c',C.woodD,0,.5,0,3.4,1.0,1.0);k.p('','box','c',A.velvet,0,1.02,0,3.5,.04,1.08);k.p('','box','m',A.gold,0,1.0,.55,3.5,.06,.03);
  [-1.7,1.7].forEach(x=>[-.5,.5].forEach(z=>k.p('','box','c',C.woodD,x,1.4,z,.09,2.8,.09)));
  for(let i=0;i<7;i++)k.p('','box','c',i%2?A.crim:A.ink,-1.75+(i+.5)*.5,2.82,0,.5,.05,1.3,.06,0,0);k.p('','box','m',A.gold,0,2.8,.66,3.6,.06,.04);
  for(let i=0;i<7;i++){const x=-1.5+i*.5,y=2.4-(i%2)*.15;k.L('','m',A.gold,[x,2.78,.64],[x,y,.64],.008,.008,3);k.p('','oct','g',G[i%4],x,y-.06,.64,.04,.06,.04)}
  [-1.1,1.1].forEach((x,j)=>{k.p('','cone','c',A.ink,x,1.25,-.1,.16,.42,.12);k.p('','sph','c',A.ink,x,1.5,-.1,.08,.1,.07);k.p('','tor','m',A.gold,x,1.35,-.02,.13,.03,.11,1.2,0,0);k.p('','oct','g',j?A.emer:A.ruby,x,1.29,.07,.05,.07,.03)});
  for(let i=0;i<3;i++){const x=-.55+i*.55;k.p('','box','c',A.velvet,x,1.055,.18,.42,.03,.3);for(let j=0;j<6;j++)k.p('','ring','m',A.gold,x-.14+(j%3)*.14,1.08,.1+Math.floor(j/3)*.15,.04,.25,.04);
    for(let j=0;j<4;j++)k.p('','oct','g',G[(i+j)%4],x+(j-1.5)*.06,1.09,.33,.025)}
  for(let i=0;i<4;i++)k.p('','cyl','m',A.gold,1.45-(i%2)*.12,1.06+Math.floor(i/2)*.04,-.3+(i%2)*.1,.06,.03,.06);
  k.p('','box','c',C.woodD,-1.45,1.15,-.3,.3,.22,.22);k.p('','box','m',A.gold,-1.45,1.15,-.18,.31,.04,.02)};
// the sacrifice: a stepped altar with blood in its runnels and an offering on the slab; the serpent idol behind it
AB152KB.altar=(k,C)=>{const A=AB157C;k.p('','box','c',C.stoneD,0,.1,0,3.0,.2,2.0);k.p('','box','c',C.stone,0,.3,0,2.6,.2,1.6);k.p('','box','c',0x2a2622,0,.7,0,2.2,.6,1.0);
  k.p('','box','c',0x1a1614,0,1.03,0,2.3,.06,1.1);k.p('','box','c',A.blood,0,1.065,0,1.6,.012,.5);k.p('','box','c',A.bloodL,.2,1.07,0,.7,.012,.3);
  [-1,1].forEach(s=>k.p('','box','c',A.blood,s*.6,.7,.505,.08,.58,.012));k.p('','box','c',A.blood,0,.41,.82,1.2,.012,.4);
  k.p('','sph2','c',C.rat,0,1.15,0,.2,.12,.3);k.p('','sph','c',C.ratP,0,1.13,.32,.07,.06,.08);k.L('','c',C.ratP,[0,1.1,-.3],[.15,1.08,-.62],.025,.008,4);
  k.p('','box','m',A.steel,.75,1.08,.25,.04,.02,.42,0,.5,0);k.p('','box','m',A.gold,.66,1.08,.08,.06,.04,.12,0,.5,0);
  [-1,1].forEach(s=>{k.p('','cyl','m',C.brass,s*.95,1.1,-.25,.16,.08,.16);k.p('','cyl','c',A.bloodL,s*.95,1.142,-.25,.13,.01,.13)});
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ab157Candle(k,Math.sin(a)*1.35,.2+(i%2)*.2,Math.cos(a)*.95,.14+(i%3)*.08)}
  for(let i=0;i<3;i++)k.p('','sph','c',A.bone,-1.2+i*.18,.28,.85,.09,.08,.1)};
AB152KB.idol=(k,C)=>{const A=AB157C,S=0x2e2a26,J=C.jade;k.p('','box','c',C.stoneD,0,.25,0,1.8,.5,1.8);
  k.p('','tor','c',S,0,.65,0,.85,.35,.85);k.p('','tor','c',S,0,.95,0,.65,.3,.65);let p=[0,1.0,0];for(let i=1;i<=7;i++){const q=[Math.sin(i*.6)*.15,1.0+i*.4,-.05+i*.03];k.L('','c',i%2?S:0x3a342e,p,q,.3-i*.02,.29-i*.02,7);p=q}
  k.p('','hood','c',S,p[0],p[1]-.4,p[2]-.1,1.4,1.6,.6);k.p('','hood','c',J,p[0],p[1]-.35,p[2]-.06,1.0,1.2,.5);k.p('','sph','c',S,p[0],p[1]+.15,p[2]+.3,.3,.22,.4);
  [-1,1].forEach(s=>{k.p('','box','g',0xff2a10,p[0]+s*.12,p[1]+.25,p[2]+.62,.07,.04,.03);k.p('','cone','c',A.bone,p[0]+s*.2,p[1]+.45,p[2]+.15,.06,.4,.06,-.5,0,s*.4);k.p('','cone','c',A.bone,p[0]+s*.08,p[1]-.02,p[2]+.62,.03,.15,.03,Math.PI,0,0)});
  for(let i=0;i<6;i++)k.p('','box','c',J,Math.sin(i)*.3,1.3+i*.4,.18+i*.03,.12,.12,.02,0,0,Math.PI/4)};
AB152KB.offer=(k,C)=>{const A=AB157C;k.p('','cyl','m',C.brass,0,.05,0,.35,.1,.35);for(let i=0;i<10;i++)k.p('','cyl','m',A.gold,Math.sin(i*2.3)*.22,.12+(i%3)*.03,Math.cos(i*2.3)*.22,.05,.015,.05,.3,i,0);
  k.p('','sph2','c',C.rat,.1,.16,-.05,.08,.06,.14,0,.7,0);k.p('','cyl','c',0x7a3a1a,-.2,.25,.15,.08,.3,.08);k.p('','sph','c',A.bone,-.15,.15,-.2,.07,.06,.08);for(let i=0;i<5;i++)k.p('','sph','c',A.crim,.2+Math.sin(i)*.08,.12,.18+Math.cos(i)*.08,.04)};
AB152KB.bannerP=(k,C)=>{const A=AB157C;k.L('','c',C.woodD,[0,0,0],[0,3.8,0],.05,.04,5);k.p('','box','c',C.woodD,0,3.55,0,1.0,.06,.06);k.p('','cone','m',A.gold,0,3.92,0,.06,.25,.06);
  k.S('',A.crim,0,3.5,.04,.85,2.7,0,0,2);k.p('','box','m',A.gold,0,2.6,.07,.34,.34,.02,0,0,Math.PI/4);k.p('','box','c',C.jade,0,2.6,.085,.2,.2,.02,0,0,Math.PI/4);k.p('','box','m',A.gold,0,3.48,.05,.9,.05,.03)};
AB152KB.dummy=(k,C)=>{k.p('','cyl','c',C.woodD,0,.9,0,.06,1.8,.06);k.p('','cyl','c',0xb8a058,0,1.2,0,.2,.7,.17);k.p('','sph','c',0xa89058,0,1.72,0,.15,.17,.15);k.p('','box','c',C.woodD,0,1.4,0,.9,.06,.06);
  for(let i=0;i<4;i++)k.p('','box','c',0x6a5a2a,(i-1.5)*.08,1.2+i*.1,.17,.12,.02,.02,0,0,.5);k.p('','box','m',C.ironL,.25,1.0,.12,.02,.4,.02,0,0,.6)};
AB152KB.wrack=(k,C)=>{const A=AB157C;[-.85,.85].forEach(x=>k.p('','box','c',C.woodD,x,.8,0,.08,1.6,.12));[.5,1.4].forEach(y=>k.p('','box','c',C.wood,0,y,0,1.8,.06,.1));
  for(let i=0;i<5;i++){const x=-.65+i*.33;if(i%2){k.L('','c',C.woodD,[x,.05,.08],[x+.05,2.0,0],.02,.02,4);k.p('','oct','m',C.ironL,x+.05,2.12,0,.035,.14,.012)}
    else{k.p('','box','m',A.steel,x,1.0,.08,.05,1.1,.015);k.p('','box','m',A.goldD,x,1.55,.08,.18,.04,.04);k.p('','cyl','c',C.woodD,x,1.7,.08,.025,.22,.025)}}
  k.p('','cyl','c',0x3a5a2a,0,.55,.22,.32,.05,.32,Math.PI/2,0,0);k.p('','cyl','m',C.brass,0,.55,.25,.1,.02,.1,Math.PI/2,0,0)};
AB152KB.butcher=(k,C)=>{const A=AB157C;k.p('','box','c',C.woodL,0,.8,0,2.8,.1,.9);[-1.25,1.25].forEach(x=>[-.35,.35].forEach(z=>k.p('','box','c',C.woodD,x,.38,z,.1,.76,.1)));
  for(let i=0;i<4;i++)k.p('','box','c',A.blood,-1+i*.6,.856,(i%2-.5)*.3,.35,.01,.25,0,i,0);
  for(let i=0;i<5;i++){const x=-1.1+i*.5;k.p('','sph2','c',C.ratP,x,.9,0,.09,.06,.18,0,(i%2-.5)*.4,0);k.L('','c',C.ratP,[x,.88,-.17],[x+.05,.86,-.38],.015,.005,3)}
  k.p('','box','m',C.ironL,.9,.87,.3,.2,.015,.1,0,.4,0);k.p('','box','c',C.woodD,1.05,.87,.36,.12,.03,.04,0,.4,0);k.p('','cyl','c',C.wood,-1.55,.3,.1,.22,.6,.22);k.p('','cyl','c',A.blood,-1.55,.605,.1,.2,.01,.2);
  for(let i=0;i<3;i++){const x=-.8+i*.8;k.L('','m',C.iron,[x,1.9,-.4],[x,1.62,-.4],.008,.008,3);k.p('','sph','c',C.ratP,x,1.5,-.4,.07,.14,.06)}k.p('','box','c',C.woodD,0,1.95,-.4,2.8,.06,.06);[-1.4,1.4].forEach(x=>k.p('','box','c',C.woodD,x,1.0,-.42,.06,1.95,.06))};
AB152KB.hutchT=(k,C)=>{for(let r=0;r<3;r++)for(let i=0;i<3;i++){const x=-1+i,y=.4+r*.68;k.p('','box','c',r%2?C.woodD:C.wood,x,y,0,.94,.62,.72);k.p('','box','c',C.dark,x,y,.365,.72,.46,.02);
    for(let j=0;j<4;j++)k.p('','box','m',C.ironL,x-.27+j*.18,y,.375,.02,.46,.02);if((r+i)%2)[-1,1].forEach(s=>k.p('','box','g',0xff3a20,x+s*.05+.1*(i-1),y-.1,.37,.02,.012,.01))}   // rat eyes in the dark
  k.p('','box','c',C.roof,0,2.15,0,3.2,.08,.9,.12,0,0);k.p('','box','c',0x8a7a4a,0,.04,.5,3.0,.04,.3)};
AB152KB.carpet=(k,C)=>{const A=AB157C;k.p('','box','c',A.crim,0,.012,0,2.8,.02,1.8);k.p('','box','c',A.ink,0,.017,0,2.5,.02,1.5);k.p('','box','c',A.crim,0,.022,0,2.3,.02,1.3);
  for(let i=0;i<5;i++)k.p('','box','c',A.gold,-1+i*.5,.028,0,.22,.02,.22,0,Math.PI/4,0);[-1,1].forEach(s=>{k.p('','box','c',A.gold,0,.026,s*.78,2.6,.02,.05);k.p('','box','c',A.gold,s*1.28,.026,0,.05,.02,1.55)})};
AB152KB.chest=(k,C)=>{const A=AB157C;k.p('','box','c',C.woodD,0,.3,0,.9,.6,.6);k.p('','cyl','c',C.wood,0,.6,0,.3,.9,.3,0,0,Math.PI/2);[-.38,.38].forEach(x=>k.p('','box','m',A.gold,x,.45,0,.06,.66,.64));
  k.p('','box','m',A.gold,0,.5,.31,.14,.16,.02);for(let i=0;i<6;i++)k.p('','cyl','m',A.gold,(i%3-1)*.22,.01,.45+Math.floor(i/3)*.12,.05,.02,.05);k.p('','oct','g',A.ruby,.3,.04,.52,.04)};
AB152KB.drum=(k,C)=>{k.p('','cyl','c',0x6a3a1a,0,.32,0,.24,.5,.24);k.p('','cyl','c',0xd8c8a0,0,.575,0,.25,.02,.25);[.12,.5].forEach(y=>k.p('','ring','m',C.brass,0,y,0,.25,.4,.25))};
AB152KB.censer=(k,C)=>{for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','m',C.iron,[Math.sin(a)*.3,0,Math.cos(a)*.3],[0,1.15,0],.025,.02,4)}k.p('','hem','m',C.brass,0,1.25,0,.22,.16,.22,Math.PI,0,0);k.p('','dod','g',0xff5a20,0,1.25,0,.15,.05,.15)};

// ---------------- the plan: what goes where (plan coordinates; yaw 0 faces +v / south, π north, π/2 east) ----------------
function ab157Plan(P){if(P.v157)return P;P.v157=1;const PI=Math.PI,F=[],RF=[];
  const c=(k,u,v,r)=>P.C.push([k,u,v,r||0]),l=(k,u,v)=>P.L.push([k,u,v]);
  const f=(look,pose,u,v,ry,o)=>F.push(['q'+F.length,look,pose,u,v,ry||0,o||{}]);
  // A · the Breach: the sacrificial shrine between the ruined guardhouse and the barracks, and the warriors' training yard
  for(let i=P.C.length-1;i>=0;i--){const q=P.C[i];if(q[0]=='rubble'&&q[1]==56&&q[2]==14)q[1]=50,q[2]=8.4}   // the rubble by the shrine is cleared to the guardhouse wall
  c('idol',57.5,7);c('altar',57.5,10.2);c('offer',54.4,8.2);c('offer',60.6,8.2);c('censer',54.3,11.8);c('censer',60.7,11.8);c('carpet',57.5,14.6);l('altar',57.5,11.2);
  f('s','chant',57.5,12.2,PI);f('a','kneel',55.8,14.4,PI,{tph:0});f('w','kneel',57.5,14.9,PI,{tph:1.6});f('s','kneel',59.2,14.4,PI,{tph:3.1});f('a','offer',55,10.3,PI/2);
  c('dummy',38,14.4);c('dummy',41,14.6);c('wrack',60.6,19,-PI/2);c('wrack',60.6,23,-PI/2);c('bannerP',47.5,26.5);c('bannerP',29.5,26.5);
  f('w','spar',49.7,18.5,PI/2,{tph:0});f('w','spar',51.5,18.5,-PI/2,{tph:.95});f('w','spar',54,23.9,0,{tph:.3});f('a','spar',54,25.6,PI,{tph:1.25});
  f('w','spar',38,16.1,PI,{tph:.5});f('a','admire',47.4,21,2.3);f('w','polish',59.2,21,PI/2,{tool:'sword'});
  // B · the Market: the sculpture court (west), the jewellers (east), shoppers at the stalls, music at the fountain, rest in the arcade
  c('sculptA',12,46.5);c('sculptB',12,55);c('sculptC',12,63.5);c('sculptD',19.5,53.5);c('bannerP',16.5,44.4);c('bannerP',22.5,44.4);l('brazier',17,60.5);
  f('s','polish',19.5,55.4,PI);f('a','admire',14.7,46.6,-PI/2);f('w','admire',14.7,55.2,-PI/2);f('s','admire',15.2,62.8,-2.1);f('a','admire',15.6,64.6,-1.1);
  c('jewel',125,42,-PI/2);c('jewel',125,50,-PI/2);c('jewel',138,45,-PI/2);c('chest',139.6,49.4);c('bannerP',121.5,37.4);c('bannerP',121.5,56.5);
  f('s','haggle',127.3,42,-PI/2);f('a','browse',122.7,41.3,PI/2);f('w','browse',122.8,43,PI/2);f('s','haggle',127.3,50,-PI/2);f('a','browse',122.7,50.4,PI/2);
  f('s','haggle',140.2,45,-PI/2);f('a','browse',135.2,44.4,PI/2);f('w','admire',135.4,46.2,PI/2);
  f('a','haggle',120,44.6,PI);f('s','browse',120.3,41.3,0);f('s','haggle',62,41.4,0);f('a','browse',59.3,43.4,PI/2);
  f('w','browse',95,41.2,0);f('a','browse',97.4,41.4,0);f('s','browse',107,45.4,PI);f('a','browse',109.4,45.6,PI);
  f('a','haggle',38,49.4,0);f('s','browse',37.2,53.4,PI);f('w','browse',39.6,53.5,PI);f('s','haggle',50,52.6,PI);f('a','browse',49.2,49.3,0);f('w','browse',51.4,49.4,0);
  f('a','haggle',108,49.4,0);f('s','browse',110.9,50.6,-PI/2);f('w','browse',119.6,49.2,0);
  f('s','browse',37.4,61.2,PI);f('a','browse',39.6,61.4,PI);f('a','haggle',50,60.6,PI);f('s','browse',49.4,57.2,0);f('w','browse',51.6,57.3,0);
  f('w','haggle',62,57.4,0);f('a','browse',61.2,61.2,PI);f('s','browse',63.4,61.4,PI);f('s','haggle',96,60.6,PI);f('a','browse',95.4,57.2,0);f('w','browse',97.4,57.4,0);
  f('a','haggle',108,57.4,0);f('s','browse',107.4,61.2,PI);f('w','browse',109.4,61.3,PI);f('a','browse',122.6,57.2,0);
  f('s','fluteSit',76.2,47.55,-2.25,{lift:.7});f('a','admire',74.2,45.9,.9);f('w','admire',73.9,48.3,1.9);
  c('bench',46.5,33.4);f('s','sitTalk',45.9,33.4,0);f('a','sitEat',47.2,33.4,0);
  // C · the Dwellings: the alchemists' lane (east), benches and steps in the south lane, life on the roofs (RF)
  for(let i=P.C.length-1;i>=0;i--){const q=P.C[i];if(q[2]==87&&q[1]>=118)P.C.splice(i,1)}   // the yard's washing and crates make way for the workshops
  c('alembic',121,87.2);c('alembic',126,87.2);c('shelfV',130.5,87.2);c('vat',135,88);c('vatV',139,88);l('alch',128,89.5);l('vio',137.5,91);
  f('s','pour',121,88.9,PI);f('a','grind',126,88.9,PI);f('s','stir',135,90.3,PI);f('a','stir',139,90.3,PI);f('s','walker',120,90.7,PI/2,{path:[[120,90.7,3],[140,90.7,4]],spd:.8,carry:'vial'});
  c('bench',80.5,112.7);f('a','sitTalk',79.9,112.7,PI,{tph:0});f('s','sitTalk',81.3,112.7,PI,{tph:3.2});c('stool',92,111.9);f('w','fluteSit',92,111.9,PI);
  f('a','talk',44,112.2,PI/2,{tph:0});f('s','talk',45.8,112.2,-PI/2,{tph:3.2});
  RF.push([34,78,58,86,2,'feast'],[118,78,142,86,2,'talk'],[62,92,86,98,2,'dye'],[90,104,114,107,2,'edge'],[8,92,16,101,3,'lone'],[102,92,114,101,2,'mystic']);
  RF.forEach(([u0,v0,u1,v1,s,kind])=>{const cu=(u0+u1)/2-.5,cv=(v0+v1)/2-.5,y=1.6+2.3*s+.1,o=()=>({roofH:y});
    if(kind=='feast'){[[-1,-.75,0],[1,-.75,0],[-1,.75,PI],[1,.75,PI]].forEach(([du,dv,r],i)=>f('was'[i%3],'feastFloor',cu+du,cv+dv,r,o()));f('s','fluteFloor',cu+3.4,cv-1.2,-PI/2,o())}
    else if(kind=='talk'){f('a','talk',cu-.9,cv,PI/2,Object.assign(o(),{tph:0}));f('s','talk',cu+.9,cv,-PI/2,Object.assign(o(),{tph:3.2}));f('w','lean',cu-4,v0-.1,PI,o())}
    else if(kind=='dye'){f('a','beat',cu-2,cv-.6,PI,o());f('s','beat',cu+2.4,cv-.6,PI,Object.assign(o(),{tph:.7}))}
    else if(kind=='edge'){f('a','eatFloor',cu-1.2,v1-1.6,0,o());f('w','eatFloor',cu+.4,v1-1.6,0,Object.assign(o(),{tph:2}))}
    else if(kind=='lone')f('s','flute',cu,cv,PI/2,o());
    else if(kind=='mystic')f('s','chant',cu,cv+.5,PI,o())});
  // D · the Rat Warrens: the butchery and roasting spit (west), a fourth pen, tall hutches and a roast (east)
  c('butcher',14,132);c('butcher',14,138);c('rack',12,144.5);c('rack',18,144.5);c('block',21.5,131.5);c('cauldron',23,139);c('spit',20,147.2);c('hutchT',12,124.6);c('hutchT',16.5,124.6);
  f('w','chop',14,130.6,0);f('a','skin',14,136.6,0);f('s','chop',21.5,133.1,PI);f('w','spit',20,148.7,PI);f('a','eatStand',17.6,148.9,2.5);f('s','eatStand',22.6,149,-2.5);f('a','feed',14.2,126.2,PI);
  for(let u=126;u<=140;u+=2){c('fence',u,121);if(Math.abs(u-133)>2)c('fence',u,133)}for(let v=123;v<133;v+=2){c('fenceV',126,v);c('fenceV',140,v)}c('trough',130,124);c('trough',136,131);P.PEN.push([126,121,140,133]);
  c('hutchT',133,137.5);c('spit',133,143.5);c('bench',130.5,145.6);c('bench',135.5,145.6);
  f('w','feed',130,127.5,0);f('s','fork',124.2,139.8,PI);f('a','spit',133,141.9,0);f('w','sitEat',130.5,145.6,PI);f('s','sitEat',135.5,145.6,PI,{tph:2});
  // E · the Great Kitchen: the east feasting hall (four long tables, servers, a flute and a drum) and a smaller one in the west
  [[128,163],[137,163],[128,171],[137,171]].forEach(([u,v],i)=>{c('feast',u,v);c('carpet',u-1.5,v);c('carpet',u+1.5,v);[-1.5,1.5].forEach(du=>{c('bench',u+du,v-1.15);c('bench',u+du,v+1.15)});
    [[-1.5,-1.15,0],[1.5,-1.15,0],[-1.5,1.15,PI],[1.5,1.15,PI]].forEach(([du,dv,r],j)=>f('was'[(i+j)%3],'feast',u+du,v+dv,r,{tph:(i*4+j)*1.7}))});
  ['bannerP'].forEach(k=>{c(k,122.5,159);c(k,140.6,159);c(k,122.5,176.6);c(k,140.6,176.6)});l('brazier',122.6,167.2);l('brazier',140.6,167.2);
  f('a','walker',124.2,167.2,PI/2,{path:[[124.2,167.2,2],[139.4,167.2,1],[139.4,175,1],[124.2,175,2]],spd:1.0,carry:'platter'});
  f('s','walker',139.4,175,-PI/2,{path:[[139.4,175,2],[124.2,175,1],[124.2,167.2,1],[139.4,167.2,2]],spd:.9,carry:'platter'});
  c('drum',134,176.1);c('stool',134,177.1);f('w','flute',131.6,176.6,PI);f('a','drumSit',134,177.1,PI);
  c('feast',15,160);c('carpet',13.5,160);c('carpet',16.5,160);[13.5,16.5].forEach(u=>{c('bench',u,158.85);c('bench',u,161.15);c('bench',u,165.35)});c('feast',15,166.5);l('brazier',21.5,163.5);
  f('w','feast',13.5,158.85,0,{tph:1});f('s','feast',16.5,158.85,0,{tph:3});f('a','feast',13.5,161.15,PI,{tph:5});f('w','feast',16.5,161.15,PI,{tph:2});f('s','feast',13.5,165.35,0,{tph:4});f('a','feast',16.5,165.35,0,{tph:6});
  c('stool',20.6,168.6);f('s','fluteSit',20.6,168.6,-PI/2);
  // F · the Gate Yard: a caravan unloading in the west corner, steel guardians against the south wall
  c('cart',15,191.4);c('cstack',10,190.5);c('crate',11,191.8);c('chest',21.5,190.8);c('bannerP',19.5,182.6);c('sculptA',100,192.8);c('sculptC',118,192.8);
  f('a','walker',11.5,186,PI/2,{path:[[11.5,186,2],[20.5,186,2]],spd:.9,carry:'crate'});f('s','haggle',12.2,188.6,PI/2);f('w','browse',14,188.6,-PI/2);
  P.F=F;P.RF=RF;return P}
{const f=ab152Plan;ab152Plan=function(){const P=f.apply(this,arguments);try{if(P&&!P.v157)ab157Plan(P)}catch(e){console.error('v157 plan',e)}return P}}

// ---------------- new poses (3154's conventions: P adds to the rest pose; HB axes) ----------------
function ab157SitL(P){P.dy(-.13);P('lh0',-1.42);P('rh0',-1.42);P('lh1',1.42);P('rh1',1.42)}
function ab157FloorL(P){P.dy(-.44);P('lh0',-1.45,0,-.3);P('rh0',-1.45,0,.3);P('lh1',2.0);P('rh1',2.0);P('lh2',-.3);P('rh2',-.3)}
function ab157FluteA(P,t,S){const T=t+(S.tph||0),s=Math.sin(T*1.4),f=Math.sin(T*9);P('spine',.03,0,.04*s);P('chest',.02,.08*s,0);P('head',.12+.03*Math.sin(T*2.1),.05*s,.04*s);
  P('aR0',-1.2,0,.25);P('aR1',-1.55+.04*f);P('aR2',-.2);P('aL0',-1.05,0,-.08);P('aL1',-1.75+.04*Math.sin(T*7))}
function ab157EatA(P,t,S){const T=4.2,u=((t+(S.tph||0))/T)%1,up=ab152SS(.05,.3,u)*(1-ab152SS(.55,.75,u)),chew=up*Math.max(0,Math.sin(t*14))*.06;
  P('spine',.22,0,0);P('chest',.06,0,0);P('head',.18+.12*up+chew,(S.ht||0)*.4*(1-up),0);P('aR0',-.75-.55*up,0,.12);P('aR1',-.7-1.0*up);P('aR2',-.2*up);P('aL0',-.75,0,-.15);P('aL1',-.65)}
Object.assign(AB152P,{
  // sparring: a wide stance, the blade raised and brought down, the off hand up to guard
  spar(P,t,S){const T=1.9,u=((t+(S.tph||0))/T)%1,up=ab152SS(0,.35,u)*(1-ab152SS(.42,.5,u)),sl=ab152SS(.42,.52,u)*(1-ab152SS(.7,.95,u)),b=Math.sin(t*2.2);
    P.dy(-.07);P('lh0',-.35);P('rh0',.25);P('lh1',.45);P('rh1',.35);P('lh2',-.1);P('spine',.12+.12*sl,.25*up-.35*sl,0);P('chest',.03*b,.15*up-.2*sl,0);P('head',.05,-.2*up+.25*sl,0);
    P('aR0',-.9-1.4*up+.4*sl,0,.25+.2*up);P('aR1',-1.0+.6*up+.5*sl);P('aR2',-.3*sl);P('aL0',-.8+.1*b,0,-.25);P('aL1',-1.25)},
  // worship: down on one knee, bowing to the idol again and again
  kneel(P,t,S){const b=.5+.5*Math.sin((t+(S.tph||0))*1.1);P.dy(-.3);P('lh0',-1.55);P('lh1',1.55);P('rh0',.1);P('rh1',1.6);P('rh2',.5);P('spine',.25+.35*b,0,0);P('chest',.1*b,0,0);
    P('head',.25+.2*b,(S.ht||0)*.2,0);P('aR0',-.7-.5*b,0,.15);P('aR1',-.3);P('aL0',-.7-.5*b,0,-.15);P('aL1',-.3)},
  // the mystic's chant: arms raised, swaying, the head thrown back
  chant(P,t,S){const T=t+(S.tph||0),a=Math.sin(T*1.3),c=Math.sin(T*.7);P('spine',-.05,0,.05*c);P('chest',-.04,.1*c,0);P('head',-.3+.06*a,.1*c,0);
    P('aR0',-2.55+.18*a,0,.4+.08*c);P('aR1',-.25);P('aL0',-2.55+.18*Math.sin(T*1.3+.8),0,-.4-.08*c);P('aL1',-.25)},
  offer(P,t,S){const l=.5+.5*Math.sin((t+(S.tph||0))*.8);P('aR0',-1.35-.35*l,0,.2);P('aR1',-.75+.2*l);P('aL0',-1.35-.35*l,0,-.2);P('aL1',-.75+.2*l);P('spine',.08-.06*l,0,0);P('head',.15-.25*l,0,0)},
  flute(P,t,S){ab157FluteA(P,t,S)},
  fluteSit(P,t,S){ab157SitL(P);ab157FluteA(P,t,S)},
  fluteFloor(P,t,S){ab157FloorL(P);ab157FluteA(P,t,S)},
  drumSit(P,t,S){ab157SitL(P);const a=(t+(S.tph||0))*5.4,r=Math.max(0,Math.sin(a)),l=Math.max(0,Math.sin(a+Math.PI*.9));P('spine',.18,0,0);P('head',.2+.05*Math.sin(a*.5),0,0);
    P('aR0',-.75-.4*r,0,.25);P('aR1',-.9+.3*r);P('aL0',-.75-.4*l,0,-.25);P('aL1',-.9+.3*l)},
  // admiring a sculpture / listening: hands clasped behind the back, the head tilting
  admire(P,t,S){const T=t+(S.tph||0);P('aR0',.38,0,.12);P('aR1',-1.35);P('aL0',.38,0,-.12);P('aL1',-1.35);P('spine',-.03,.08*Math.sin(T*.3),0);P('chest',.02*Math.sin(T*1.4),0,0);
    P('head',-.12+.05*Math.sin(T*.5),(S.ht||0)*.4+.15*Math.sin(T*.25),.1*Math.sin(T*.4))},
  // a shopper at a stall: leaning over the goods, reaching for something, turning it over
  browse(P,t,S){const T=t+(S.tph||0),u=(T/5.5)%1,r=ab152SS(.25,.4,u)*(1-ab152SS(.6,.75,u)),q=ab152SS(.78,.85,u)*(1-ab152SS(.9,.98,u));P('spine',.18+.06*r,0,0);P('chest',.05,.1*Math.sin(T*.6),0);
    P('head',.28-.3*q,.25*Math.sin(T*.45)*(1-r),.1*q);P('aR0',-.5-.7*r,0,.12);P('aR1',-.8+.5*r);P('aR2',.3*r);P('aL0',-.3-.2*q,0,-.1);P('aL1',-.7-.6*q)},
  polish(P,t,S){const a=(t+(S.tph||0))*3.2;P('aR0',-1.15+.18*Math.sin(a),0,.15+.18*Math.cos(a));P('aR1',-.55+.18*Math.cos(a));P('aL0',-.95,0,-.15);P('aL1',-.75);P('spine',.14,.08*Math.sin(a),0);P('head',.2,0,0)},
  pour(P,t,S){const u=((t+(S.tph||0))/4)%1,p=ab152SS(.2,.35,u)*(1-ab152SS(.6,.75,u));P('aR0',-1.25-.2*p,0,.12);P('aR1',-.85);P('aR2',0,0,.9*p);P('aL0',-1.05,0,-.18);P('aL1',-1.2);P('spine',.16,0,0);P('head',.38,0,0)},
  grind(P,t,S){const a=(t+(S.tph||0))*2.8;P('aR0',-.95+.1*Math.sin(a),0,.12+.12*Math.cos(a));P('aR1',-.95);P('aL0',-.75,0,-.12);P('aL1',-1.15);P('spine',.24,.05*Math.sin(a),0);P('head',.4,0,0)},
  // at the feast: eating, then raising the goblet in a toast with the head thrown back
  feast(P,t,S){ab157SitL(P);const T=7.5,u=((t+(S.tph||0))/T)%1,up=ab152SS(.04,.18,u)*(1-ab152SS(.32,.42,u)),ch=up*Math.max(0,Math.sin(t*13))*.06,ts=ab152SS(.55,.65,u)*(1-ab152SS(.78,.88,u));
    P('spine',.2-.22*ts,0,0);P('chest',.05,0,0);P('head',.16+.12*up+ch-.35*ts,(S.ht||0)*.4*(1-up),0);P('aR0',-.75-.55*up,0,.12);P('aR1',-.7-1.0*up);P('aL0',-.75-1.35*ts,0,-.15-.12*ts);P('aL1',-.65+.35*ts)},
  feastFloor(P,t,S){ab157FloorL(P);AB152P.feast(P,t,S);P.dy(.13);P('lh0',1.42);P('rh0',1.42);P('lh1',-1.42);P('rh1',-1.42)},
  eatFloor(P,t,S){ab157FloorL(P);ab157EatA(P,t,S)},
  sitTalk(P,t,S){ab157SitL(P);AB152P.talk(P,t,S)},
  lean(P,t,S){const T=t+(S.tph||0);P('spine',.4,0,0);P('chest',.12,0,0);P('head',-.15,(S.ht||0)*.5+.2*Math.sin(T*.3),0);P('aR0',-1.25,0,.25);P('aR1',-1.0);P('aL0',-1.25,0,-.25);P('aL1',-1.0)},
  beat(P,t,S){const u=((t+(S.tph||0))/1.5)%1,up=u<.6?ab152SS(0,.6,u):1-ab152SS(.6,.7,u);P('aR0',-1.0-1.2*up,0,.3);P('aR1',-.4-.6*up);P('aL0',-.6,0,-.15);P('aL1',-.8);P('spine',.08-.1*up,.15,0);P('head',.1,0,0)},
  skin(P,t,S){const u=((t+(S.tph||0))/2.2)%1,p=ab152SS(.3,.55,u)*(1-ab152SS(.75,.95,u));P('aR0',-1.0,0,.15+.35*p);P('aR1',-1.05+.45*p);P('aL0',-1.0,0,-.15-.35*p);P('aL1',-1.05+.45*p);P('spine',.22,0,0);P('head',.38,0,0)},
  // overlays while walking
  crate(P,t,S){AB152P.carry(P,t,S)},
  vial(P,t,S){P('aR0',-.85,0,.15);P('aR1',-1.3);P('aL0',-.2,0,-.1);P('head',.1,(S.ht||0)*.4,0)}});
// tools in the folk's hands (rigid, on the hand bone); AB157TT: per tool [rotation, position, left hand]
var AB157TT={flute:[[-.3,0,0],[0,-.04,.04]],rag:[[-1,0,0],[0,-.06,.03]],vial:[[-1,0,0],[0,-.03,.03]],pestle:[[-1,0,0],[0,-.03,.02]],knife:[[-1,0,0],[0,-.03,.02]],
  goblet:[[0,0,0],[0,-.06,.04]],bowl:[[0,0,0],[.12,-.08,.12]],stick:[[-1,0,0],[0,-.03,.02]],beater:[[-1,0,0],[0,-.03,.02]],crate:[[0,0,Math.PI/2],[.18,-.05,.24]],sword:[[-1,0,0],[0,-.03,.02]]};
function ab157Tool(k){const C=AB152C,A=AB157C;switch(k){
  case 'flute':return lgGroup('AB157T|flute',q=>{q.L('','c',0x3a2414,[0,0,-.36],[0,0,.16],.017,.013,5);[-.25,-.06,.1].forEach(z=>q.p('','ring','m',C.brass,0,0,z,.02,.4,.02,Math.PI/2,0,0))},0);
  case 'rag':return lgGroup('AB157T|rag',q=>q.p('','box','c',0xd8d0b8,0,-.05,.04,.14,.03,.12,0,0,.3),0);
  case 'vial':return lgGroup('AB157T|vial',q=>{q.p('','cyl','g',A.vial[1],0,-.08,.04,.04,.16,.04);q.p('','cyl','c',C.woodD,0,.01,.04,.025,.04,.025)},0);
  case 'pestle':return lgGroup('AB157T|pestle',q=>{q.L('','c',C.woodL,[0,.04,0],[0,-.22,0],.02,.028,4)},0);
  case 'knife':return lgGroup('AB157T|knife',q=>{q.L('','c',C.woodD,[0,.03,0],[0,-.08,0],.016,.016,4);q.p('','box','m',A.steel,0,-.18,.01,.012,.2,.035)},0);
  case 'goblet':return lgGroup('AB157T|goblet',q=>{q.p('','cyl','m',A.gold,0,.04,.04,.045,.09,.045);q.p('','cyl','m',A.gold,0,-.04,.04,.012,.08,.012);q.p('','cyl','m',A.gold,0,-.08,.04,.035,.01,.035);q.p('','cyl','c',0x5a0a14,0,.083,.04,.04,.005,.04)},0);
  case 'bowl':return lgGroup('AB157T|bowl',q=>{q.p('','hem','m',C.brass,0,0,0,.17,.1,.17,Math.PI,0,0);q.p('','cyl','c',A.bloodL,0,-.012,0,.15,.005,.15)},0);
  case 'stick':return lgGroup('AB157T|stick',q=>{q.L('','c',C.woodL,[0,.03,0],[0,-.3,0],.012,.012,4);q.p('','sph','c',0xd8c8a0,0,-.31,0,.03)},0);
  case 'beater':return lgGroup('AB157T|beater',q=>{q.L('','c',C.woodL,[0,.05,0],[0,-.55,0],.015,.015,4);q.p('','tor','c',0xa89058,0,-.66,0,.13,.03,.13,Math.PI/2,0,0)},0);
  case 'crate':return lgGroup('AB157T|crate',q=>{q.p('','box','c',C.wood,0,0,0,.48,.42,.4);q.p('','box','m',C.ironL,0,0,0,.49,.04,.41)},0);
  case 'sword':return mkWpn('sword',0x9aa0a8,0)}
  return ab152Tool(k)}
// the tool each pose holds (right hand, then left)
var AB157PT={flute:['flute'],fluteSit:['flute'],fluteFloor:['flute'],drumSit:['stick','stick'],polish:['rag'],pour:['vial','vial'],grind:['pestle'],spar:['sword'],offer:['bowl'],
  skin:['knife'],beat:['beater'],feast:['bone','goblet'],feastFloor:['bone','goblet'],eatFloor:['bone']};
function ab157Attach(a,k,left){const t=ab157Tool(k);if(!t)return null;const h=a.h,hand=left?h.bones.aL2:h.bones.aR2;if(!hand)return null;const T=AB157TT[k]||[[-1,0,0],[0,-.03,.02]];
  t.rotation.set(T[0][0],T[0][1],T[0][2]);t.position.set(T[1][0]*(left?-1:1),T[1][1],T[1][2]);hand.add(t);return t}

// ---------------- the walls' rugs and banners, the rooftop furniture (baked per district) ----------------
function ab157Dress(k,P,I,G,B,R){const C=AB152C,A=AB157C,[u0,v0,u1,v1,s,st]=B,x0=I.x0+u0-.5,z0=I.y0+v0-.5,x1=I.x0+u1-.5,z1=I.y0+v1-.5,y0=1.6;
  if(st=='ruin'||st=='barn')return;const H=st=='tower'?2.3*s+.8:st=='hall'?3.4:2.3*s;
  [[[0,-1],(x0+x1)/2,z0,x1-x0],[[0,1],(x0+x1)/2,z1,x1-x0],[[-1,0],x0,(z0+z1)/2,z1-z0],[[1,0],x1,(z0+z1)/2,z1-z0]].forEach(([n,cx,cz,L])=>{if(L<4.5)return;
    // only faces looking onto open ground
    const ou=Math.round(cx+n[0]*1.2-I.x0),ov=Math.round(cz+n[1]*1.2-I.y0);if(ab152Cls(G,ou,ov)>=2)return;
    const ry=Math.atan2(n[0],n[1]),t=[n[1],-n[0]],at=(a,o)=>[cx+t[0]*a+n[0]*o,cz+t[1]*a+n[1]*o];
    const nr=Math.min(3,Math.floor(L/5));for(let i=0;i<nr;i++){if(R()<.45)continue;const a=(R()-.5)*(L-2.4),p=at(a,.07),col=A.tex[(R()*A.tex.length)|0],c2=A.tex[(R()*A.tex.length)|0];
      if(st!='house'||R()<.3){ // a long serpent banner from under the parapet
        const top=y0+H-.35,len=Math.min(H*.62,3.4);k.p('','box','m',A.gold,p[0],top+.03,p[1],.05,.05,.05);k.p('','box','c',C.woodD,p[0],top,p[1],.8,.05,.05,0,ry,0);
        k.S('',i%2?A.crim:0x1a2a2a,p[0],top,p[1],.7,len,ry+Math.PI,0,i);const q=at(a,.1);k.p('','box','m',A.gold,q[0],top-len*.42,q[1],.3,.3,.02,0,ry,Math.PI/4);k.p('','box','c',C.jade,q[0],top-len*.42,q[1]+n[1]*.012,.17,.17,.02,0,ry,Math.PI/4)}
      else{ // a rug hung over a sill to air: a field, a border, a band of pattern
        const fl=Math.min(s,2+(R()<.5?0:1))||1,top=y0+2.3*fl-.45,len=1.1+R()*.6,w=.85+R()*.35;k.p('','box','c',C.trimD,p[0],top+.02,p[1],w+.1,.05,.1,0,ry,0);
        k.S('',col,p[0],top,p[1],w,len,ry+Math.PI,0,i+3);const q=at(a,.085);k.S('',c2,q[0],top-.15,q[1],w*.7,len*.62,ry+Math.PI,0,i+5);const r=at(a,.1);k.S('',A.gold,r[0],top-.35,r[1],w*.25,len*.25,ry+Math.PI,0,i+1)}}})}
// rooftop furniture: carpets, cushions, a low table with food, an awning, jars and plants, a censer, rugs drying on lines
function ab157Roof(k,I,RFk,R){const C=AB152C,A=AB157C,[u0,v0,u1,v1,s,kind]=RFk,cu=(u0+u1)/2-.5,cv=(v0+v1)/2-.5,y=1.6+2.3*s+.1,X=u=>I.x0+u,Z=v=>I.y0+v;
  const carpet=(u,v,w,d,c1,c2)=>{k.p('','box','c',c1,X(u),y+.012,Z(v),w,.02,d);k.p('','box','c',c2,X(u),y+.018,Z(v),w-.3,.02,d-.3);for(let i=0;i<3;i++)k.p('','box','c',A.gold,X(u)+(i-1)*w*.28,y+.024,Z(v),.18,.02,.18,0,Math.PI/4,0)};
  const cushion=(u,v,c)=>k.p('','sph','c',c,X(u),y+.08,Z(v),.32,.1,.32);
  const jar=(u,v)=>{k.p('','cyl','c',0x8a5a32,X(u),y+.3,Z(v),.2,.6,.2);k.p('','cyl','c',0x6a4222,X(u),y+.62,Z(v),.11,.05,.11)};
  const plant=(u,v)=>{k.p('','cyl','c',0x8a4a2a,X(u),y+.25,Z(v),.25,.5,.22);for(let i=0;i<6;i++)k.L('','c',0x3a6a2a,[X(u),y+.45,Z(v)],[X(u)+Math.sin(i)*.4,y+1.0+(i%2)*.2,Z(v)+Math.cos(i)*.4],.05,.01,3)};
  const awn=(u,v,w,d,c)=>{[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.L('','c',C.woodD,[X(u+a*w/2),y,Z(v+b*d/2)],[X(u+a*w/2),y+2.1,Z(v+b*d/2)],.04,.035,4));
    for(let i=0;i<5;i++)k.p('','box','c',i%2?c:A.gold,X(u-w/2+(i+.5)*w/5),y+2.15,Z(v),w/5*.99,.04,d+.1);[-1,1].forEach(b=>{for(let i=0;i<6;i++)k.S('',c,X(u-w/2+(i+.5)*w/6),y+2.13,Z(v+b*(d/2+.05)),w/6*.95,.25,b>0?0:Math.PI,0,i)})};
  const low=(u,v)=>{k.p('','box','c',C.woodL,X(u),y+.32,Z(v),1.1,.06,.7);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.p('','box','c',C.woodD,X(u)+a*.48,y+.15,Z(v)+b*.28,.06,.3,.06));
    k.p('','cyl','m',C.brass,X(u)-.2,y+.36,Z(v),.2,.02,.16);k.p('','sph','c',C.meat,X(u)-.2,y+.41,Z(v),.08,.06,.14);k.p('','cyl','c',0x6a4a2a,X(u)+.25,y+.38,Z(v)+.1,.13,.06,.13);
    for(let j=0;j<4;j++)k.p('','sph','c',[0x6a1a3a,0x9a7a2a,0x3a6a2a][j%3],X(u)+.25+Math.sin(j*1.6)*.06,y+.43,Z(v)+.1+Math.cos(j*1.6)*.06,.05);[-1,1].forEach(b=>k.p('','cyl','m',A.gold,X(u)+.4,y+.4,Z(v)+b*.22,.035,.12,.035));ab157Candle(k,X(u),y+.35,Z(v)-.2,.12)};
  if(kind=='feast'){carpet(cu,cv,3.6,2.6,A.crim,A.ink);low(cu,cv);[[-1,-.75],[1,-.75],[-1,.75],[1,.75]].forEach(([a,b],i)=>cushion(cu+a,cv+b,A.tex[i]));awn(cu,cv,4,3,A.teal);
    carpet(cu+3.4,cv-1.2,1.4,1.4,A.purp,A.gold);jar(cu-4,cv+1.5);jar(cu-4.5,cv+1.2);plant(cu+5,cv+1.6);plant(cu-6,cv-1.6)}
  else if(kind=='talk'){carpet(cu,cv,3,2,A.purp,A.crim);jar(cu+3,cv+1.2);plant(cu-3,cv+1.6);k.L('','c',C.woodD,[X(cu+5),y,Z(cv)],[X(cu+5),y+3.2,Z(cv)],.05,.04,5);k.S('',A.crim,X(cu+5),y+3.1,Z(cv)+.05,.7,1.8,0,0,4)}
  else if(kind=='dye'){[[-.6,0],[1.8,0]].forEach(([du,dv],j)=>{const vv=cv+dv+.6;[-1,1].forEach(a=>k.L('','c',C.woodD,[X(cu+du+a*2.2),y,Z(vv)],[X(cu+du+a*2.2),y+2.2,Z(vv)],.04,.035,4));
      k.L('','c',0x8a7a5a,[X(cu+du-2.2),y+2.15,Z(vv)],[X(cu+du+2.2),y+2.12,Z(vv)],.006,.006,3);for(let i=0;i<3;i++){const c1=A.tex[(i+j*3)%7];k.S('',c1,X(cu+du-1.4+i*1.4),y+2.14,Z(vv),1.2,1.7,0,0,i);k.S('',A.tex[(i+j*3+2)%7],X(cu+du-1.4+i*1.4),y+1.9,Z(vv)+.012,.8,1.0,0,0,i+2)}});
    for(let i=0;i<4;i++)k.p('','cyl','c',[0x6a1a1a,0x1a3a5a,0x8a6a1a,0x3a1a4a][i],X(cu-5+i*.7),y+.3,Z(cv+1.4),.28,.6,.28);for(let i=0;i<4;i++)k.p('','cyl','c',lgCol([0x6a1a1a,0x1a3a5a,0x8a6a1a,0x3a1a4a][i],0xffffff,.15),X(cu-5+i*.7),y+.61,Z(cv+1.4),.25,.02,.25)}
  else if(kind=='edge'){carpet(cu-.4,v1-1.6,3,1.2,A.teal,A.gold);jar(cu+3,cv);k.p('','cyl','m',C.brass,X(cu-.4),y+.04,Z(v1-1.0),.18,.04,.14)}
  else if(kind=='lone'){carpet(cu,cv,1.6,1.6,A.ink,A.crim);plant(cu+1.6,cv-1.6)}
  else if(kind=='mystic'){carpet(cu,cv+.5,2.2,2.2,A.purp,A.ink);k.L('','m',C.iron,[X(cu),y,Z(cv-1.1)],[X(cu),y+1.1,Z(cv-1.1)],.03,.025,4);k.p('','hem','m',C.brass,X(cu),y+1.15,Z(cv-1.1),.2,.14,.2,Math.PI,0,0);
    k.p('','dod','g',0xff5a20,X(cu),y+1.15,Z(cv-1.1),.13,.05,.13);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ab157Candle(k,X(cu)+Math.sin(a)*1.3,y,Z(cv+.5)+Math.cos(a)*1.3,.12+(i%3)*.06)}}}

// ---------------- coloured smoke and bubbles (two shared Points objects) ----------------
function ab157PuffTex(){if(ab157PuffTex.t)return ab157PuffTex.t;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,1,32,32,31);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return ab157PuffTex.t=new THREE.CanvasTexture(c)}
function ab157Points(n,size,op){const pos=new Float32Array(n*3),col=new Float32Array(n*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({size,map:ab157PuffTex(),vertexColors:true,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
  m.frustumCulled=false;m.userData.psNo=1;m.userData.noFarCull=1;return {m,pos,col,n,p:[]}}
function ab157FxTick(dt){const S=AB157.S,H=AB152H,X=S.fx;if(!X)return;const near=S.em.filter(e=>Math.abs(e.u-H.u)<40&&Math.abs(e.v-H.v)<40);
  [[X.sm,'s'],[X.bb,'b']].forEach(([Q,kind])=>{const E=near.filter(e=>kind=='s'||e.b);let j=0;
    for(let i=0;i<Q.n;i++){let p=Q.p[i];if(!p){p=Q.p[i]={t:9,l:1}}p.t+=dt;
      if(p.t>=p.l){if(!E.length){Q.col[i*3]=Q.col[i*3+1]=Q.col[i*3+2]=0;continue}const e=E[(i+j++)%E.length];p.e=e;p.t=Math.random()*-.5*(kind=='s'?2:1);p.l=kind=='s'?2.6+Math.random()*1.8:.5+Math.random()*.4;
        p.x=e.x+(Math.random()-.5)*e.r;p.y=e.y;p.z=e.z+(Math.random()-.5)*e.r;p.vx=(Math.random()-.5)*.2;p.vz=(Math.random()-.5)*.2;p.vy=kind=='s'?.45+Math.random()*.3:.5}
      if(p.t<0){Q.col[i*3]=Q.col[i*3+1]=Q.col[i*3+2]=0;continue}const k=p.t/p.l,f=kind=='s'?Math.sin(Math.PI*k)*.5:Math.sin(Math.PI*k),c=p.e.c;
      Q.pos[i*3]=p.x+p.vx*p.t+Math.sin(p.t*1.3+i)*.12*k;Q.pos[i*3+1]=p.y+p.vy*p.t;Q.pos[i*3+2]=p.z+p.vz*p.t;
      Q.col[i*3]=c.r*f;Q.col[i*3+1]=c.g*f;Q.col[i*3+2]=c.b*f}
    Q.m.geometry.attributes.position.needsUpdate=true;Q.m.geometry.attributes.color.needsUpdate=true})}

// ---------------- the flutes: a soft breathy melody near any flute player ----------------
var AB157F={t:0,deg:0,left:0,on:0};
function ab157FluteNote(){const F=AB157F;if(F.left<=0){F.left=5+((Math.random()*5)|0);F.deg=[0,4,2,0][(Math.random()*4)|0];return {f:0,d:.7+Math.random()*1.2}}
  F.left--;const step=[-2,-1,-1,1,1,2,0][(Math.random()*7)|0];F.deg=Math.max(-2,Math.min(9,F.deg+step+(F.deg>6?-1:F.deg<0?1:0)));
  const M=[0,1,4,5,7,8,10],d=F.deg,n=67+12*Math.floor(d/7)+M[((d%7)+7)%7];return {f:440*Math.pow(2,(n-69)/12),d:F.left==0?1.2+Math.random()*.6:[.28,.28,.42,.56,.84][(Math.random()*5)|0]}}
function ab157FluteTone(a,t,f,d,v,pan){try{const g=a.createGain(),o=a.createOscillator(),o2=a.createOscillator(),g2=a.createGain(),lf=a.createOscillator(),lg=a.createGain(),p=a.createStereoPanner?a.createStereoPanner():null,out=p||a.out;
  if(p){p.pan.value=pan;p.connect(a.out)}
  o.type='sine';o.frequency.setValueAtTime(f,t);o2.type='sine';o2.frequency.setValueAtTime(f*2.003,t);g2.gain.value=.14;lf.frequency.value=5.1;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.007,t+Math.min(.35,d*.6));
  lf.connect(lg);lg.connect(o.frequency);o.connect(g);o2.connect(g2);g2.connect(g);g.connect(out);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.08);g.gain.setValueAtTime(v*.85,t+Math.max(.09,d-.08));g.gain.exponentialRampToValueAtTime(.0004,t+d+.22);
  [o,o2,lf].forEach(x=>{x.start(t);x.stop(t+d+.3)});
  if(typeof NOISE!='undefined'&&NOISE){const s=a.createBufferSource(),bf=a.createBiquadFilter(),ng=a.createGain();s.buffer=NOISE;s.loop=true;bf.type='bandpass';bf.frequency.value=f*1.6;bf.Q.value=1.4;
    ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(v*.3,t+.05);ng.gain.exponentialRampToValueAtTime(.0004,t+d*.6+.12);s.connect(bf);bf.connect(ng);ng.connect(out);s.start(t,Math.random()*.5);s.stop(t+d+.3)}}catch(_){}}
function ab157FluteTick(){const S=AB157.S,F=AB157F;let a=null;try{a=AUD}catch(_){}if(!a||a.state!='running'||SET.sfx===false||!(+SET.sfxV>0)||document.hidden||(typeof uiOpen=='function'&&uiOpen())){F.t=0;return}
  const H=AB152H;let best=null,bd=1e9;for(const q of S.flutes){if(q.dead||q.hid)continue;const d=Math.hypot(q.u-H.u,q.v-H.v);if(d<bd){bd=d;best=q}}
  if(!best||bd>AB157V.flR){F.t=0;return}const ct=a.currentTime;if(F.t<ct)F.t=ct+.05;
  const v=AB157V.flV*Math.pow(1-bd/AB157V.flR,1.6),I=AB152.S.I,dx=I.x0+best.u-cam.position.x,dz=I.y0+best.v-cam.position.z,L=Math.hypot(dx,dz)||1,pan=Math.max(-.8,Math.min(.8,(dx*Math.cos(camYaw)-dz*Math.sin(camYaw))/L));
  while(F.t<ct+.35){const n=ab157FluteNote();if(n.f)ab157FluteTone(a,F.t,n.f,n.d,v,pan);F.t+=n.d+(n.f?.04:0)}}

// ---------------- building it (once, right after 3155 builds the city) ----------------
// a wall sconce: an iron bracket out of the wall, a torch in its cup (or a hanging lantern); local +z = away from the wall
function ab157Sconce(lantern){const C=AB152C,g=new THREE.Group();
  if(lantern){g.add(lgGroup('AB157|sconceL',k=>{k.p('','box','m',C.iron,0,2.55,.02,.16,.32,.04);k.L('','m',C.iron,[0,2.6,.02],[0,2.62,.55],.025,.02,4);k.L('','m',C.iron,[0,2.45,.02],[0,2.6,.3],.018,.015,3);
      k.L('','m',C.iron,[0,2.62,.55],[0,2.42,.55],.006,.006,3);k.p('','box','m',C.brass,0,2.4,.55,.2,.04,.2);k.p('','box','g',C.glow,0,2.27,.55,.15,.22,.15);k.p('','cone4','m',C.brass,0,2.42+.02,.55,.15,.12,.15,0,Math.PI/4,0);k.p('','box','m',C.brass,0,2.14,.55,.17,.03,.17)},0));
    g.userData.flame=null;return g}
  g.add(lgGroup('AB157|sconce',k=>{k.p('','box','m',C.iron,0,2.2,.02,.16,.34,.04);k.L('','m',C.iron,[0,2.1,.02],[0,2.3,.32],.022,.018,4);k.p('','cyl','m',C.iron,0,2.33,.34,.08,.12,.08);
    k.L('','c',C.woodD,[0,2.2,.3],[0,2.48,.36],.035,.03,5);k.p('','dod','c',0x2a1a10,0,2.49,.36,.06)},0));
  const fl=lgGroup('AB157|sconceFlame',k=>{k.p('','cone','g',0xffa040,0,2.71,.36,.12,.38,.12);k.p('','cone','g',0xffe08a,0,2.65,.36,.065,.24,.065)},0);g.add(fl);g.userData.flame=fl;return g}
// flames grow from their base: a pivot at the bottom of the flame, so the flicker (a scale) never lifts it off its torch
function ab157Pivot(q){const m=q.m,par=m&&m.parent;if(q.k!='flame'||!par||q.piv)return;let y=1e9;m.children.forEach(c=>{const g=c.geometry;if(!g)return;if(!g.boundingBox)g.computeBoundingBox();y=Math.min(y,g.boundingBox.min.y)});if(!(y<1e9))return;
  const pv=new THREE.Group();pv.position.copy(m.position);pv.position.y+=y;par.add(pv);m.position.set(0,-y,0);pv.add(m);q.m=pv;q.piv=1}
function ab157FixLights(S){const I=S.I,G=S.G,P=S.P,out=[];
  S.anim.forEach(ab157Pivot);
  P.L.forEach(([k,u,v],li)=>{if(k!='torch'&&k!='lantern')return;const ru=Math.round(u),rv=Math.round(v);if(ab152Cls(G,ru,rv)<2)return;   // only the ones standing in a wall
    const sides=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>ab152Cls(G,ru+a,rv+b)<2);if(!sides.length)return;
    const [a,b]=sides.sort((p,q)=>Math.hypot(ru+p[0]*.5-u,rv+p[1]*.5-v)-Math.hypot(ru+q[0]*.5-u,rv+q[1]*.5-v))[0];
    const fu=a?ru+a*.5:u,fv=b?rv+b*.5:v,x=I.x0+u,z=I.y0+v;
    // the old torch / lantern post at this spot goes
    const old=S.root.children.find(o=>o.userData&&('flame' in o.userData)&&Math.abs(o.position.x-x)<.02&&Math.abs(o.position.z-z)<.02);
    if(old){S.root.remove(old);S.anim=S.anim.filter(q=>q.m!==old.userData.flame&&q.m.parent!==old)}
    const sc=ab157Sconce(k=='lantern'),wx=I.x0+fu,wz=I.y0+fv;sc.position.set(wx,GH(wx,wz),wz);sc.rotation.y=Math.atan2(a,b);S.root.add(sc);
    if(sc.userData.flame){const q={k:'flame',m:sc.userData.flame,ph:(li*1.37)%6.28};ab157Pivot(q);S.anim.push(q)}
    // its light and its pool of light move out of the wall with it (the light level the snakes use stays where the plan has it)
    const L=S.lights[li];if(L){const o=k=='lantern'?.55:.36;L.lt.position.set(wx+a*o,GH(wx,wz)+(k=='lantern'?2.3:2.7),wz+b*o);L.pool.position.set(wx+a*.9,L.pool.position.y,wz+b*.9)}
    out.push([k,u,v,fu,fv])});
  return out}
function ab157Build(S){if(S.v157)return;S.v157=1;const I=S.I,P=S.P,G=S.G,Q={folk:[],flutes:[],em:[],f:0,fx:null,walls:[]};AB157.S=Q;
  try{Q.walls=ab157FixLights(S)}catch(e){console.error('v157 lights',e)}
  // dressing: rugs and banners on the walls facing open ground, the rooftop furniture; one baked set per district
  try{P.D.forEach(([d0],i)=>{const d1=P.D[i+1]?P.D[i+1][0]-4:999,R=ab152R(15700+i*131),L=P.B.filter(B=>{const cv=(B[1]+B[3])/2;return cv>=d0-4&&cv<d1}),RF=(P.RF||[]).filter(B=>{const cv=(B[1]+B[3])/2;return cv>=d0-4&&cv<d1});
    if(!L.length&&!RF.length)return;const g=lgGroup('AB157|dress'+i,k=>{L.forEach(B=>ab157Dress(k,P,I,G,B,R));RF.forEach(B=>ab157Roof(k,I,B,R))},0);g.traverse(o=>{if(o.isMesh)o.castShadow=false});S.root.add(g)})}catch(e){console.error('v157 dress',e)}
  // the folk
  (P.F||[]).forEach(sp=>{const [id,look,pose,u,v,ry,o]=sp;o.pose=pose;let a;try{a=ab152MakeActor([id,look,o.path?'walker':'folk',u,v,ry,o],I)}catch(e){console.error('v157 folk',id,e);return}
    a.folk=1;if(o.tph!=null)a.tph=o.tph;if(o.roofH!=null){const x=I.x0+u,z=I.y0+v;o.lift=o.roofH-GH(x,z)}
    const tk=o.tool?[o.tool]:AB157PT[pose];if(tk){const old=a.g.userData.tool;if(old&&old.parent)old.parent.remove(old);a.g.userData.tool=ab157Attach(a,tk[0]);if(tk[1])ab157Attach(a,tk[1],1)}
    else if(o.carry&&!a.g.userData.tool){a.g.userData.tool=ab157Attach(a,o.carry)}
    a.g.traverse(m=>{if(m.isMesh){m.castShadow=false;m.frustumCulled=true;const g=m.geometry;if(g&&!g.boundingSphere)g.computeBoundingSphere()}});a.on=false;
    Q.folk.push(a);if(/flute/.test(pose))Q.flutes.push(a)});
  // smoke and bubble emitters: vats, stills, censers, the altar's offerings
  const col=c=>new THREE.Color(c);P.C.forEach(([k,u,v])=>{const x=I.x0+u,z=I.y0+v,y=GH(x,z);
    if(k=='vat'||k=='vatV')Q.em.push({u,v,x,y:y+1.35,z,r:.9,c:col(k=='vat'?0x3aff6a:0xa050ff),b:1});
    else if(k=='alembic')Q.em.push({u,v,x:x-.55,y:y+1.45,z,r:.15,c:col(0xffa040)});
    else if(k=='censer')Q.em.push({u,v,x,y:y+1.3,z,r:.2,c:col(0xb02a3a)})});
  (P.RF||[]).forEach(([u0,v0,u1,v1,s,kind])=>{if(kind!='mystic')return;const u=(u0+u1)/2-.5,v=(v0+v1)/2-.5-1.1;Q.em.push({u,v,x:I.x0+u,y:1.6+2.3*s+1.3,z:I.y0+v,r:.2,c:col(0x8a3aff)})});
  Q.fx={sm:ab157Points(150,1.15,.55),bb:ab157Points(60,.16,.9)};S.root.add(Q.fx.sm.m);S.root.add(Q.fx.bb.m);
  return Q}
{const f=ab152Build;ab152Build=function(){const S=f.apply(this,arguments);try{if(S&&!S.v157)ab157Build(S)}catch(e){if(!AB157.err++)console.error('v157 build',e)}return S}}
// ---------------- each frame in the city ----------------
function ab157Tick(dt,now){const Q=AB157.S,S=AB152.S;if(!Q||!S)return;const H=AB152H;Q.f++;
  for(const a of Q.folk){const d=Math.hypot(a.u-H.u,a.v-H.v),near=d<AB157V.R&&!a.hid;
    if(near!==a.on){a.on=near;if(near)S.root.add(a.g);else S.root.remove(a.g)}
    if(!near)continue;const far=d>AB157V.far;if(far&&(Q.f+a.sd)%2)continue;const ddt=far?dt*2:dt;
    if(!a.dead&&!a.halt){a.t+=ddt;ab152Routine(a,ddt)}ab152ActPose(a,now,ddt,true)}
  ab157FxTick(dt);ab157FluteTick()}
{const f=ab152WorldTick;ab152WorldTick=function(dt,now){const r=f.apply(this,arguments);try{ab157Tick(dt,now)}catch(e){if(!AB157.err++)console.error('v157 tick',e)}return r}}
