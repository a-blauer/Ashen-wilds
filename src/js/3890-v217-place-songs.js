// ================= v215: a song for every instance =================
// Owner, Nov 10 2026: "When we made the soundtrack there was only 1 instance per zone. Now we have multiple per zone. I need a
// new song for each instance - carrying the same vibe from the overarching zone that its in."
// Field I of every zone keeps the zone's v79 song (z0..z5). Fields II and III, the Sovereign's Den and the special levels
// (Abeksi, the Hilltop Ascent, the Sandstorm Run, the Hidden Sanctum, the Black Channel) each get a song of their own: 23 new
// themes in MTH. Each keeps its zone's scale (mode) so it sounds like the same land, with its own tempo, chords, instruments
// and a written melody.
//   keys: 'z<zone>b' = field II, 'z<zone>c' = field III, 'z<zone>d' = the Den, 'sp_<key>' = a special level (I.sp)
//   tune: a written melody on top of the v79 parts (no random lead). {k:instrument, kb:instrument of the B part, oct, v,
//         ob = the B part's octave when it differs, dbl:1 = doubled an octave down by a horn,
//         form:'AB-' one letter per pass of the chords (A / B = that part, - = no melody), A:'...', B:'...'}
//         notes are 'degree,length' (degree of the theme's scale, 0 = the root, 7 = an octave up; length in sixteenths;
//         '_' = a rest), bars split by '|'; each part must be as long as the chord list (prog.length bars of 16).
//   toll: {n,v,oct} a bell on the home note every n bars · stab / boom: see the fight songs
//   fx:   {wind:v} gusts of wind · {drip:p} echoing water drops · {chime:p} high glassy bells
// Music follows the place each player stands in, so co-op partners each hear the song of their own instance: nothing to relay.
var MU215={names:{},K:null,err:0};
MODES.maj=[0,2,4,5,7,9,11];MODES.mix=[0,2,4,5,7,9,10];   // v215d: major, and major with a flat seventh
(function(){
const S=(key,name,th)=>{MTH[key]=th;MU215.names[key]=name};
// ---------------- Kindlelight (B phrygian; low, sparse, cold) ----------------
S('z0b','The Glowmire Hollows',{bpm:56,root:47,mode:'phr',prog:[0,0,5,0,0,1,6,0],pad:{v:.024,cut:480,form:1},drone:.13,bell:{p:.1,v:.035,oct:2},
  arp:{e:4,p:[0,2,1,3],oct:1,v:.04,w:'sine'},bass:{v:.14,c:'x...............',f:'x.....x.x.......'},
  drums:{f:{taiko:'X.......x.....x.',tek:'....g.......g..g'}},fx:{drip:.07},
  tune:{k:'cel',oct:2,v:.1,form:'A-B-',A:'4,8 2,8|0,12 _,4|2,8 0,8|-3,16|4,8 5,4 4,4|3,8 1,8|1,8 -1,8|0,16',
    B:'7,4 4,4 2,8|4,4 2,4 0,8|5,8 7,8|4,12 _,4|0,4 2,4 4,4 7,4|8,8 5,8|6,8 3,8|4,16'}});
S('z0c','The Rotwood',{bpm:66,root:45,mode:'phr',prog:[0,6,3,0,0,6,1,0],pad:{v:.022,cut:600,form:1},drone:.1,
  arp:{e:2,p:[0,2,1,2,0,3,1,2],oct:0,v:.04},bass:{v:.14,c:'x.........x.....',f:'x.....x.x.....x.'},
  drums:{c:{dum:'x.........g.....'},f:{taiko:'X.....x.x.......',tek:'....g.......g.g.'}},fx:{wind:.012},
  tune:{k:'cello',oct:1,v:.09,form:'AB-',A:'0,4 2,8 1,4|-1,4 1,8 0,4|3,4 5,8 4,4|2,4 0,12|4,4 2,8 4,4|3,4 1,8 3,4|5,4 3,8 1,4|0,10 _,6',
    B:'4,4 5,8 4,4|6,4 8,8 6,4|7,4 5,8 3,4|4,4 2,12|7,4 5,8 4,4|3,4 1,8 -1,4|1,4 3,8 1,4|0,10 _,6'}});
S('z0d',"Argus's Den",{bpm:50,root:47,mode:'phr',prog:[0,1,0,1,0,6,1,0],pad:{v:.026,cut:420,form:1},drone:.12,bell:{p:.12,v:.04,oct:1},
  bass:{v:.15,c:'x...............'},drums:{c:{taiko:'x.g.............'}},
  tune:{k:'choir',oct:0,v:.05,form:'A-B-',A:'0,16|1,12 _,4|0,8 2,8|1,16|4,16|3,8 1,8|1,16|0,16',
    B:'7,8 5,8|5,16|4,8 2,8|3,16|2,8 4,8|6,16|5,8 1,8|0,16'}});
// ---------------- Hillside Crest (G dorian; open, windswept) ----------------
S('z1b','Mistmere',{bpm:76,root:55,mode:'dor',prog:[0,2,3,0,0,2,6,4],pad:{v:.02,cut:1000},drone:.05,bell:{p:.08,v:.03},
  arp:{e:2,p:[0,1,2,3,2,1,2,1],oct:0,v:.06},bass:{v:.12,c:'x.......x.......',f:'x.x.x.x.x.x.x.x.'},
  drums:{f:{taiko:'X.....x.x...x...',hat:'..x...x...x...x.',tek:'....x.......x...'}},
  tune:{k:'flute',oct:1,v:.06,form:'AB-',A:'4,8 2,4 0,4|4,8 6,8|7,8 5,4 3,4|4,12 _,4|4,8 2,4 0,4|2,4 4,4 6,8|8,8 6,8|4,16',
    B:'7,8 9,4 7,4|6,8 4,8|5,4 7,4 10,8|9,12 _,4|7,4 4,4 2,4 0,4|2,8 4,8|6,4 8,4 6,8|4,8 1,8'}});
S('z1c','The Galecliffs',{bpm:96,root:57,mode:'dor',prog:[0,3,6,0,0,3,4,4],pad:{v:.018,cut:1200},drone:.06,
  arp:{e:2,p:[0,2,1,3,0,2,1,2],oct:0,v:.06},bass:{v:.13,c:'x.......x...x...',f:'x.x.x.x.x.x.x.x.'},
  drums:{c:{dum:'x.......x.......'},f:{taiko:'X..x..x.X..x..x.',hat:'..x...x...x...x.',tek:'....x.......x...'}},fx:{wind:.016},
  tune:{k:'whistle',oct:1,v:.06,form:'AB-',A:'0,4 4,4 7,8|7,4 5,4 3,8|6,4 8,4 10,8|9,4 7,12|0,4 4,4 7,8|10,8 7,8|8,8 6,4 4,4|4,12 _,4',
    B:'9,6 7,2 4,8|5,6 7,2 3,8|6,8 8,8|7,16|9,6 7,2 4,8|5,4 7,4 10,8|11,8 8,8|8,4 6,4 4,8'}});
S('z1d',"The Hydra's Den",{bpm:70,root:55,mode:'dor',prog:[0,0,5,0,0,6,5,4],pad:{v:.024,cut:700,form:1},drone:.11,bell:{p:.1,v:.035,oct:1},
  bass:{v:.14,c:'x...............'},drums:{c:{taiko:'x.g.............'}},
  tune:{k:'choir',oct:0,v:.05,form:'A-B-',A:'0,16|2,12 _,4|5,8 7,8|4,16|0,16|6,8 8,8|7,8 5,8|4,16',
    B:'7,8 9,8|7,16|9,8 7,8|4,16|7,8 4,8|6,16|5,8 9,8|8,16'}});
S('sp_abeksi','Abeksi',{bpm:80,root:55,mode:'dor',prog:[0,5,0,3,0,5,6,4],pad:{v:.014,cut:700},drone:.07,
  bass:{v:.13,c:'x..x......x.....'},drums:{c:{shak:'..g...g...g...g.',tek:'............g...'}},
  tune:{k:'pluck',kb:'reed',oct:1,v:.11,vb:.03,form:'A-AB',A:'0,2 _,2 2,2 _,2 4,4 _,4|5,2 _,2 7,2 _,2 5,4 _,4|4,2 _,2 2,2 _,2 0,4 _,4|3,4 5,4 3,8|0,2 _,2 2,2 _,2 4,4 _,4|9,2 _,2 7,2 _,2 5,4 _,4|6,4 8,4 6,8|4,8 _,8',
    B:'4,8 5,2 4,2 2,4|5,12 _,4|4,4 2,4 0,8|3,12 _,4|4,8 5,2 4,2 2,4|7,12 _,4|6,4 8,4 10,8|8,16'}});
S('sp_ascent','The Hilltop Ascent',{bpm:152,root:55,mode:'dor',prog:[0,0,6,6,3,3,4,0],pad:{v:.014,cut:1500},fight:1,boom:.8,
  arp:{e:1,p:[0,1,2,1,0,1,2,3,0,1,2,1,0,2,1,0],oct:0,v:.034,w:'sawtooth'},bass:{v:.1,c:'x.xxx.xxx.xxx.xx'},stab:{c:'x.....x...x.....',v:.022},
  drums:{c:{taiko:'X.g.x.g.X.g.x.gg',snare:'....X.......X.gg',hat:'xgxgxgxgxgxgxgxg'}},fx:{wind:.012},
  tune:{k:'brass',oct:1,v:.04,dbl:1,form:'AB',A:'0,6 2,2 4,8|7,12 4,4|6,6 8,2 10,8|8,12 6,4|7,6 5,2 3,8|5,8 7,8|8,6 6,2 4,8|4,12 _,4',
    B:'7,4 9,4 11,8|9,4 7,4 4,8|10,8 8,8|6,12 _,4|3,4 5,4 7,8|10,12 7,4|8,8 11,8|11,4 9,4 7,8'}});
// ---------------- Burningeye Summit (E phrygian; frozen peak, burning sky) ----------------
S('z2b','The Rimecaverns',{bpm:72,root:52,mode:'phr',prog:[0,5,1,0,0,5,6,0],pad:{v:.022,cut:700,form:1},drone:.1,
  arp:{e:2,p:[0,2,3,2,1,2,3,2],oct:1,v:.035,w:'sine'},bass:{v:.13,c:'x...............',f:'x.xxx.xxx.xxx.x.'},
  drums:{f:{taiko:'X..x..x.X..x..x.',snare:'....x.......x..g',hat:'x.x.x.x.x.x.x.x.'}},fx:{drip:.05,chime:.06},
  tune:{k:'cel',oct:2,v:.09,form:'AB-',A:'7,4 4,4 2,8|5,4 7,4 9,8|8,8 5,8|4,12 _,4|7,4 4,4 2,8|9,8 7,8|8,8 6,8|7,16',
    B:'0,4 2,4 4,4 7,4|5,8 2,8|1,4 3,4 5,4 8,4|7,12 _,4|4,4 7,4 9,8|7,8 5,8|3,8 1,8|0,16'}});
S('z2c','Stormcrown',{bpm:100,root:52,mode:'phr',prog:[0,5,6,0,0,5,1,0],pad:{v:.024,cut:850},drone:.09,
  arp:{e:2,p:[0,2,1,2,0,2,1,3],oct:0,v:.04},bass:{v:.14,c:'x.......x.......',f:'x.xxx.xxx.xxx.x.'},
  drums:{c:{taiko:'x.......g.......'},f:{taiko:'X..x..x.X..x..x.',snare:'....x.......x..g',hat:'x.x.x.x.x.x.x.x.'}},fx:{wind:.03},
  tune:{k:'horn',oct:0,v:.07,form:'AB-',A:'0,3 0,1 4,12|5,3 5,1 7,8 5,4|6,3 6,1 8,12|7,8 4,8|0,3 0,1 4,8 7,4|9,3 9,1 7,12|8,6 5,6 3,4|4,3 2,1 0,12',
    B:'7,12 4,3 4,1|5,12 7,3 7,1|8,12 6,3 6,1|7,16|4,12 7,3 7,1|9,12 7,4|5,8 8,8|7,3 4,1 0,12'}});
S('z2d',"The Rime Wraith's Den",{bpm:60,root:52,mode:'phr',prog:[0,1,0,1,0,5,1,0],pad:{v:.026,cut:560,form:1},drone:.11,bell:{p:.16,v:.04,oct:2},
  bass:{v:.14,c:'x...............'},drums:{c:{taiko:'x.g.............'}},fx:{wind:.014},
  tune:{k:'choir',oct:0,v:.05,form:'A-B-',A:'4,16|5,12 _,4|4,8 2,8|1,16|0,8 4,8|7,8 5,8|5,8 3,8|4,16',
    B:'7,16|8,12 _,4|7,8 4,8|5,16|4,8 2,8|2,16|1,8 3,8|0,16'}});
// ---------------- Searing Sands (D hijaz; reed and oud) ----------------
S('z3b','The Sunken Temple',{bpm:78,root:50,mode:'hij',prog:[0,0,3,3,0,0,1,0],pad:{v:.02,cut:700,form:1},drone:.11,
  arp:{e:2,p:[0,1,2,1,0,2,1,0],oct:0,v:.05,w:'square'},bass:{v:.12,c:'x.....x.........',f:'x..x..x.x..x..x.'},
  drums:{c:{dum:'x.....x...x.....',tek:'....g.......g.g.'},f:{dum:'X..x..x.x..x....',tek:'..x...x...x.x.xx',shak:'g.g.g.g.g.g.g.g.'}},
  tune:{k:'flute',kb:'reed',oct:1,v:.06,vb:.035,form:'AB-',A:'4,4 4,2 4,2 4,4 5,4|4,12 _,4|5,4 5,2 5,2 5,4 7,4|5,12 _,4|4,4 4,2 4,2 4,4 2,4|4,4 2,4 1,4 2,4|3,4 5,4 3,4 1,4|0,16',
    B:'7,4 7,2 7,2 7,4 8,4|7,8 4,8|7,4 7,2 7,2 7,4 5,4|3,12 _,4|2,4 2,2 2,2 2,4 4,4|2,8 0,8|1,4 3,4 5,4 3,4|2,6 0,10'}});
// The Salt Wastes: D phrygian (bleaker than the other desert songs: no bright third). A bare leap D-A that hangs, a rest, then an answer.
S('z3c','The Salt Wastes',{bpm:70,root:50,mode:'phr',prog:[0,3,5,0,0,6,5,0],pad:{v:.016,cut:1200},drone:.12,
  bass:{v:.11,c:'x...............',f:'x..x..x.x..x..x.'},
  drums:{c:{shak:'......g.......g.'},f:{dum:'X..x..x.x..x....',tek:'..x...x...x.x.xx',shak:'g.g.g.g.g.g.g.g.'}},fx:{wind:.008},
  tune:{k:'reed',oct:1,v:.04,form:'A-B-',A:'0,4 4,12|_,4 3,4 4,4 6,4|5,12 4,4|3,4 2,4 0,8|0,4 4,12|_,4 6,4 7,4 8,4|7,8 5,4 4,4|2,4 1,4 0,8',
    B:'4,4 7,12|_,4 6,4 5,4 4,4|5,12 3,4|4,16|4,4 7,12|_,4 8,4 7,4 6,4|5,8 4,4 2,4|1,4 0,12'}});
S('z3d',"Ssith'ra's Den",{bpm:64,root:50,mode:'hij',prog:[0,1,0,1,0,6,1,0],pad:{v:.024,cut:560,form:1},drone:.12,
  bass:{v:.14,c:'x...............'},drums:{c:{taiko:'x.g.............',shak:'......g.......g.'}},
  tune:{k:'choir',oct:0,v:.05,form:'A-B-',A:'0,16|1,12 _,4|2,8 4,8|3,16|4,16|6,8 8,8|8,8 5,8|4,16',
    B:'7,16|8,12 _,4|7,8 4,8|5,8 3,8|2,16|3,8 1,8|1,16|0,16'}});
S('sp_sandrun','The Sandstorm Run',{bpm:140,root:50,mode:'hij',prog:[0,0,1,1,0,0,1,0],pad:{v:.016,cut:900},fight:1,boom:.7,
  arp:{e:1,p:[0,1,2,1,0,2,1,0,0,1,2,1,0,2,1,3],oct:0,v:.03,w:'square'},bass:{v:.11,c:'x.xx..x.x.xx..x.'},stab:{c:'x.....x.....x...',v:.018},
  drums:{c:{taiko:'x.......g.......',dum:'X..g..x.x..x..g.',tek:'..x.x.x...x.x.xx',shak:'xgxgxgxgxgxgxgxg'}},fx:{wind:.03},
  tune:{k:'reed',oct:1,v:.04,dbl:1,form:'AB',A:'0,2 0,2 0,2 2,2 4,4 2,4|0,2 0,2 0,2 2,2 4,8|1,2 1,2 1,2 3,2 5,4 3,4|1,2 1,2 1,2 3,2 5,8|4,2 4,2 4,2 5,2 7,4 5,4|4,2 4,2 4,2 2,2 0,8|5,4 3,4 1,4 3,4|2,4 1,4 0,8',
    B:'7,2 7,2 7,2 5,2 4,4 5,4|7,2 7,2 7,2 5,2 4,8|8,2 8,2 8,2 5,2 3,4 5,4|8,2 8,2 8,2 5,2 3,8|4,2 4,2 4,2 5,2 7,4 9,4|7,2 7,2 7,2 5,2 4,8|5,4 3,4 1,4 3,4|2,4 1,4 0,8'}});
// ---------------- The Dirge (C locrian; bells, hollow choir) ----------------
S('z4b','The Drowned Crypts',{bpm:54,root:48,mode:'phr',prog:[0,5,3,0,0,5,1,0],pad:{v:.026,cut:520,form:1},drone:.1,toll:{n:4,v:.04,oct:1},
  arp:{e:4,p:[0,2,1,2],oct:1,v:.03,w:'sine'},bass:{v:.14,c:'x...............',f:'x..x....x..x....'},
  drums:{f:{taiko:'X...x...X...x...',tek:'..g...g...g...gg',snare:'............x...'}},
  tune:{k:'cel',oct:1,v:.1,form:'A-B-',A:'7,2 _,6 4,2 _,6|9,2 _,6 7,2 _,2 5,4|7,2 _,6 5,2 _,6|4,2 _,2 2,2 _,2 0,8|7,2 _,6 4,2 _,6|5,2 _,6 7,2 _,2 9,4|8,2 _,6 5,2 _,2 3,4|2,2 _,2 1,2 _,2 0,8',
    B:'0,2 _,2 2,2 _,2 4,8|5,2 _,2 7,2 _,2 9,8|10,2 _,2 7,2 _,2 5,8|4,12 _,4|7,2 _,2 4,2 _,2 2,8|5,2 _,2 2,2 _,2 0,8|1,2 _,2 3,2 _,2 5,8|4,4 0,12'}});
S('z4c','The Ossuary Fields',{bpm:72,root:48,mode:'aeo',prog:[0,2,6,0,3,5,6,0],pad:{v:.024,cut:650,form:1},drone:.08,toll:{n:4,v:.035,oct:2},
  bass:{v:.14,c:'x.......x.......',f:'x..x....x..x....'},
  drums:{c:{tek:'....g.......g..g',shak:'g.......g.......'},f:{taiko:'X...x...X...x...',tek:'..g...g...g...gg',snare:'............x...'}},fx:{wind:.01},
  tune:{k:'cello',oct:1,v:.09,form:'AB-',A:'4,12 2,4|4,4 2,12|3,12 1,4|2,4 0,12|5,12 3,4|7,4 5,12|3,12 1,4|0,16',
    B:'7,12 4,4|6,4 4,12|8,12 6,4|7,4 4,12|7,12 5,4|5,4 2,12|1,12 -1,4|0,16'}});
S('z4d',"The Bloated One's Den",{bpm:52,root:48,mode:'phr',prog:[0,0,1,0,0,3,1,0],pad:{v:.024,cut:480,form:1},drone:.1,toll:{n:2,v:.045,oct:1},
  bass:{v:.15,c:'x...............'},drums:{c:{taiko:'x.g.............'}},
  tune:{k:'choir',oct:1,v:.045,form:'A-B-',A:'0,24 2,8|1,16|0,12 _,4|4,24 3,8|1,16|0,16',
    B:'7,24 4,8|5,16|4,12 _,4|7,16|5,16|3,8 1,8|0,16'}});
S('sp_sanctum','The Hidden Sanctum',{bpm:58,root:48,mode:'aeo',prog:[0,5,6,0,3,0,6,0],pad:{v:.026,cut:800,form:1},drone:.07,toll:{n:4,v:.03,oct:2},
  bass:{v:.12,c:'x...............'},
  tune:{k:'flute',kb:'choir',oct:1,v:.06,vb:.05,form:'AB-',A:'0,4 1,4 2,4 0,4|2,4 0,4 2,8|3,4 2,4 1,4 3,4|2,8 0,8|3,4 4,4 5,4 3,4|4,4 2,4 4,8|3,4 2,4 1,4 -1,4|0,16',
    B:'4,4 5,4 4,4 2,4|5,4 7,4 5,8|6,4 5,4 3,4 1,4|2,8 4,8|7,4 6,4 5,4 3,4|4,4 5,4 4,8|3,4 1,4 -1,4 1,4|0,16'}});
// The Black Channel: v215f rewrote it (random notes out, C minor); v215g gives it a rocking, boat-like tune in even steps.
S('sp_channel','The Black Channel',{bpm:68,root:48,mode:'aeo',prog:[0,4,5,0,3,6,4,0],pad:{v:.022,cut:650,form:1},
  arp:{e:4,p:[0,2,1,2],oct:0,v:.04},bass:{v:.14,c:'x.......x.......',f:'x..x....x..x....'},
  drums:{f:{taiko:'X...x...X...x...',tek:'..g...g...g...gg',snare:'............x...'}},
  tune:{k:'cello',oct:1,v:.09,form:'AB-',A:'0,6 2,2 4,6 2,2|4,6 6,2 8,6 6,2|9,6 7,2 5,6 7,2|7,6 4,2 0,8|3,6 5,2 7,6 5,2|6,6 8,2 10,6 8,2|8,6 6,2 4,6 1,2|0,16',
    B:'4,6 7,2 9,6 7,2|8,6 6,2 4,8|5,6 7,2 9,6 7,2|7,16|10,6 7,2 5,8|8,6 6,2 3,8|4,6 6,2 1,6 -1,2|0,16'}});
// ---------------- The Citadel (C harmonic minor; organ, brass, harpsichord) ----------------
S('z5b','The Outer Ramparts',{bpm:84,root:48,mode:'hmin',prog:[0,0,5,4,0,3,4,4],pad:{v:.022,cut:1000,form:1},drone:.09,
  bass:{v:.14,c:'x.......x.......',f:'x.x.x.x.x.x.x.x.'},
  drums:{c:{taiko:'x.......x.......',snare:'....g.g.....g.gg'},f:{taiko:'X.......X.....x.',snare:'....x.......x.gg',hat:'x.x.x.x.x.x.x.x.'}},
  tune:{k:'horn',oct:1,v:.05,form:'AB-',A:'0,8 2,4 4,4|4,12 2,4|5,8 7,8|6,12 _,4|0,8 2,4 4,4|7,8 5,8|4,8 6,8|8,12 _,4',
    B:'7,6 9,2 7,8|4,8 2,8|5,4 7,4 9,8|8,12 _,4|7,4 4,4 2,4 0,4|3,8 5,8|6,8 4,8|4,16'}});
S('z5c','The Inner Keep',{bpm:66,root:48,mode:'hmin',prog:[0,3,4,0,5,1,4,0],pad:{v:.02,cut:1100,form:1},drone:.06,
  arp:{e:1,p:[0,1,2,3,2,1,2,1,0,1,2,3,2,1,2,1],oct:1,v:.028,w:'square'},bass:{v:.13,c:'x.......x.......',f:'x.x.x.x.x.x.x.x.'},
  drums:{f:{taiko:'X.......X.....x.',snare:'....x.......x.gg',hat:'x.x.x.x.x.x.x.x.'}},
  tune:{k:'cello',oct:1,v:.075,form:'AB-',A:'4,4 7,4 6,2 5,2 4,2 2,2|5,4 7,4 5,2 4,2 3,2 2,2|4,4 8,4 6,2 5,2 4,2 1,2|2,6 1,2 0,8|9,4 7,4 5,2 4,2 2,2 0,2|1,4 5,4 3,2 2,2 1,2 0,2|-1,4 1,4 4,4 6,4|7,16',
    B:'7,8 9,4 7,4|10,8 7,4 5,4|8,8 6,4 4,4|7,12 _,4|9,2 7,2 5,2 7,2 9,8|8,2 5,2 3,2 5,2 8,8|6,2 4,2 1,2 4,2 6,8|7,16'}});
S('z5d',"Lord Vaelric's Den",{bpm:60,root:48,mode:'hmin',prog:[0,1,0,4,0,5,1,4],pad:{v:.03,cut:1000,form:1},drone:.1,bell:{p:.1,v:.04,oct:1},
  bass:{v:.15,c:'x...............'},drums:{c:{taiko:'x.g.............'}},
  tune:{k:'choir',oct:0,v:.05,form:'A-B-',A:'0,16|1,12 _,4|2,8 4,8|6,16|7,16|5,8 7,8|8,8 5,8|4,16',
    B:'4,16|3,12 _,4|4,8 7,8|8,16|9,8 7,8|7,8 5,8|3,8 1,8|-1,16'}});
// ---------------- v215b: fight songs (owner, Nov 10 2026: "high intensity moments like fighting the sovereigns, minibosses or
// the hilltop ascent should have more intense music due to the stressful scenario") ----------------
// 'z<zone>x' = the zone's Sovereign fight, 'z<zone>m' = a mini boss fight in that zone. In the zone's scale, drums and bass all
// the time (fight:1); parts they may use: a melody doubled an octave down (tune.dbl), chord stabs (stab), a boom every 4 bars (boom).
const DM={taiko:'x..g..g.x..g..g.',snare:'....x.......x..g',hat:'x.x.x.x.x.x.x.x.'};
const Mi=(z,name,root,mode,bpm,prog,A,o)=>{S('z'+z+'m',name,Object.assign({bpm,root,mode,prog,fight:1,boom:.7,pad:{v:.022,cut:1000,form:1},
  arp:{e:2,p:[0,2,1,2,0,3,1,2],oct:0,v:.045,w:'sawtooth'},bass:{v:.1,c:'x.x.x.xxx.x.x.xx'},stab:{c:'x.....x...x.....',v:.02},drums:{c:DM},
  tune:{k:'horn',oct:0,v:.06,form:'AA-'}},o||{}));MTH['z'+z+'m'].tune.A=A};
// v215c (owner: "for the boss songs it seems like its using the same melody as the others"): every Sovereign song is built on its own,
// not from one template: its own rhythm, drums, bass, lead instrument and shape of melody.
// v215d (owner: "I also dont like how the boss songs kind of droned on and didn't have a resolution at the end of each bar. Write more
// in major keys"): no drone under a fight song; every 4-bar phrase ends with a cadence onto the home chord (… V → I) and the melody
// lands on the home note there.
// v215e (owner: "The boss songs seem too happy. Disregard my note about just using major chords and try again"): minor keys again
// (harmonic minor, so the phrase ends still pull home; natural minor for the Bloated One); the cadences and the missing drone stay.
// Argus (B minor): stalking. Short stabbing notes with gaps (the eyes blinking open), a 3+3+2 bass, then long brass.
S('z0x','Argus, the Hundred-Eyed',{bpm:138,root:47,mode:'phr',prog:[0,0,1,0,0,5,1,0],fight:1,boom:1.1,pad:{v:.024,cut:800,form:1},toll:{n:2,v:.04,oct:1},
  bass:{v:.11,c:'x.x.x.x.x.x.x.x.'},stab:{c:'X...............',v:.02},drums:{c:{taiko:'X...x...X...x.x.',snare:'........X.......',hat:'x.x.x.x.x.x.x.x.'}},
  tune:{k:'brass',kb:'brass',oct:1,v:.045,dbl:1,form:'AB',A:'0,12 1,4|0,8 -1,4 0,4|1,12 3,4|2,4 1,4 0,8|4,12 5,4|5,8 7,8|8,4 5,4 3,4 1,4|0,16',
    B:'7,12 8,4|7,8 4,8|8,12 10,4|9,4 8,4 7,8|11,12 12,4|12,8 9,8|8,4 5,4 3,4 1,4|0,16'}});
// The Crest Hydra (G minor): many heads. Fast rising calls that leave a gap for the next head to answer, over a gallop; then a whistle.
S('z1x','The Crest Hydra',{bpm:144,root:55,mode:'hmin',prog:[0,5,4,0,3,0,4,0],fight:1,boom:.8,pad:{v:.02,cut:1300},
  arp:{e:1,p:[0,1,2,3,2,1,0,1,2,3,2,1,0,1,2,3],oct:0,v:.032,w:'sawtooth'},bass:{v:.1,c:'x.xxx.xxx.xxx.xx'},
  drums:{c:{taiko:'X..xx..xX..xx..x',snare:'....X.......X...',hat:'..x...x...x...x.'}},
  tune:{k:'brass',kb:'whistle',oct:0,v:.05,vb:.07,dbl:1,form:'AB',A:'0,2 2,2 4,2 7,2 9,8|_,8 9,4 7,4|4,2 6,2 8,2 11,2 13,8|11,4 9,4 7,8|3,2 5,2 7,2 10,2 12,8|_,8 11,4 9,4|8,2 11,2 13,2 15,2 13,8|14,12 _,4',
    B:'11,4 9,4 7,8|12,4 9,4 7,8|11,4 8,4 6,8|7,12 _,4|10,8 12,8|11,8 9,8|8,4 11,4 13,8|14,16'}});
// The Rime Wraith (E minor): a ghost in a storm. A slow, cold choir held over frantic drums; then shards of ice fall.
S('z2x','The Rime Wraith',{bpm:148,root:52,mode:'hmin',prog:[0,5,4,0,3,0,4,0],fight:1,boom:.8,pad:{v:.024,cut:900,form:1},fx:{wind:.03,chime:.1},
  arp:{e:1,p:[0,2,0,2,1,2,1,2,0,2,0,2,1,3,1,3],oct:2,v:.016,w:'sine'},bass:{v:.075,c:'xgxgxgxgxgxgxgxg'},
  drums:{c:{taiko:'X.g.g.g.x.g.g.g.',snare:'g.g.X.g.g.g.X.gg',hat:'xgxgxgxgxgxgxgxg'}},
  tune:{k:'choir',kb:'cel',oct:1,ob:2,v:.06,vb:.08,form:'AB',A:'4,16|5,16|6,8 8,8|7,16|10,16|9,16|8,8 6,8|7,16',
    B:'7,2 4,2 2,2 0,2 7,2 4,2 2,2 0,2|9,2 7,2 5,2 2,2 9,2 7,2 5,2 2,2|8,2 6,2 4,2 1,2 8,2 6,2 4,2 1,2|7,4 4,4 0,8|10,2 7,2 5,2 3,2 10,2 7,2 5,2 3,2|9,2 7,2 4,2 2,2 9,2 7,2 4,2 2,2|8,2 6,2 4,2 1,2 6,8|7,16'}});
// Ssith'ra (D, the desert scale: its home chord is major): a reed pipe winding in fast runs, hand drums, then a lurching 3+3+2 answer.
S('z3x',"Ssith'ra the Endless",{bpm:142,root:50,mode:'hij',prog:[0,3,1,0,6,3,1,0],fight:1,boom:.7,pad:{v:.018,cut:900},
  bass:{v:.1,c:'x..x..x.x..x..x.'},stab:{c:'x..x..x.........',v:.014},
  drums:{c:{taiko:'x.......g.......',dum:'X..g..x.x..x..g.',tek:'..x.x.x...x.x.xx',shak:'xgxgxgxgxgxgxgxg'}},
  tune:{k:'reed',oct:1,v:.04,dbl:1,form:'AB',A:'0,2 1,2 2,2 1,2 0,2 1,2 2,2 4,2|5,2 4,2 3,2 4,2 5,2 7,2 5,2 3,2|1,2 3,2 5,2 3,2 1,2 3,2 2,2 1,2|0,12 _,4|6,2 8,2 10,2 8,2 6,2 8,2 10,2 8,2|7,2 5,2 3,2 5,2 7,2 10,2 7,2 5,2|8,2 5,2 3,2 1,2 3,2 2,2 1,4|0,12 _,4',
    B:'4,6 5,6 4,4|3,6 5,6 7,4|8,6 5,6 1,4|0,12 _,4|10,6 8,6 6,4|7,6 5,6 3,4|5,6 3,6 1,4|0,16'}});
// The Bloated One (C natural minor): sheer weight. The slowest fight: a huge stomping drum, bells and a low horn; then a choir.
S('z4x','The Bloated One',{bpm:104,root:48,mode:'aeo',prog:[0,6,3,0,5,3,6,0],fight:1,boom:1.2,pad:{v:.028,cut:800,form:1},bell:{p:.35,v:.045,oct:2},
  bass:{v:.12,c:'x.....x.x...x...'},stab:{c:'X.......x.......',v:.02},drums:{c:{taiko:'X.....x.X...x...',snare:'........X.......',tek:'..g...g...g...gg'}},
  tune:{k:'horn',kb:'choir',oct:0,ob:1,v:.07,vb:.06,dbl:1,form:'AB',A:'0,12 2,4|1,8 -1,8|3,8 5,4 3,4|4,4 2,4 0,8|5,12 7,4|7,8 5,8|6,8 8,4 6,4|7,16',
    B:'4,8 7,8|8,16|7,8 5,8|4,16|9,8 7,8|7,8 10,8|8,8 10,8|9,4 7,12'}});
// Lord Vaelric (C minor): the court. A furious harpsichord and a violin running in quick patterns down the chords; then the brass, grand.
// Lord Vaelric: C minor, 16 bars, a a' b a''. The hook leaps G C' and leans on Eb' D' C' B (the leading note that wants to go home);
// the middle hammers repeated notes up the chords; the last phrase turns the hook upside down from the top G and comes home.
S('z5x','Lord Vaelric',{bpm:138,root:48,mode:'hmin',prog:[0,0,5,4,0,4,0,0,5,4,0,1,0,5,4,0],fight:1,boom:1,pad:{v:.026,cut:1000,form:1},
  arp:{e:1,p:[0,2,1,2,0,2,1,2,0,2,1,2,0,2,1,3],oct:0,v:.026,w:'sawtooth'},bass:{v:.11,c:'x.x.x.x.x.x.x.x.'},stab:{c:'X...............',v:.018},
  drums:{c:{taiko:'X.g.x.g.X.g.x.gg',snare:'....X.......X.gg',hat:'x.x.x.x.x.x.x.x.'}},
  tune:{k:'brass',oct:1,v:.045,dbl:1,form:'A',A:'4,4 7,4 9,6 8,2|7,4 6,4 7,8|5,4 7,4 9,6 8,2|7,4 6,4 4,8|4,4 7,4 9,6 8,2|10,4 9,4 8,8|9,4 8,4 7,4 6,4|7,12 _,4|5,6 5,2 7,4 9,4|8,6 8,2 6,4 4,4|7,6 7,2 9,4 11,4|10,8 8,8|11,4 9,4 7,6 8,2|9,4 8,4 7,4 5,4|4,4 6,4 8,4 6,4|7,16'}});
// the mini bosses: one shape of song, but each with its own key, lead instrument, bass and drums; the same cadences
Mi(0,'Mini boss: Vorraxis',47,'hmin',126,[0,5,4,0,3,0,4,0],'0,3 2,3 4,10|5,3 7,3 9,10|8,3 6,3 4,10|4,3 2,3 0,10|3,3 5,3 7,10|7,3 4,3 2,10|1,3 4,3 6,10|7,16',{bass:{v:.11,c:'x..x..x.x..x..x.'},fx:{drip:.08}});
Mi(1,'Mini boss: Hillside Crest',55,'hmin',128,[0,3,4,0,5,3,4,0],'0,4 4,4 7,8|7,8 5,8|6,6 4,2 8,8|7,12 _,4|9,8 7,8|10,8 7,8|8,4 6,4 4,8|7,16',
  {tune:{k:'whistle',oct:1,v:.07,dbl:1,form:'AA-'},bass:{v:.1,c:'x.xxx.xxx.xxx.xx'},drums:{c:{taiko:'x..xx..xx..xx..x',hat:'..x...x...x...x.',tek:'....x.......x...'}}});
Mi(2,'Mini boss: Gorthrak',52,'hmin',130,[0,3,4,0,5,3,4,0],'0,2 _,2 0,2 _,2 2,8|3,2 _,2 3,2 _,2 5,8|4,2 _,2 4,2 _,2 6,8|7,4 4,4 0,8|5,2 _,2 5,2 _,2 7,8|7,2 _,2 5,2 _,2 3,8|4,2 _,2 6,2 _,2 8,8|7,16',
  {fx:{wind:.014},tune:{k:'brass',oct:0,v:.05,dbl:1,form:'AA-'},bass:{v:.12,c:'x.......x.x.....'},drums:{c:{taiko:'X.......x.x.....',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.'}}});
S('z3m','Mini boss: Qarsul',{bpm:126,root:50,mode:'hij',prog:[0,0,1,0,0,3,1,0],fight:1,boom:.6,pad:{v:.022,cut:900,form:1},
  bass:{v:.12,c:'x..x..x.x..x..x.'},stab:{c:'x...............',v:.016},drums:{c:{taiko:'x.....g.g...g...',dum:'x..g..x.g..x..g.',shak:'g.g.g.g.g.g.g.g.',snare:'............x...'}},
  tune:{k:'brass',oct:0,v:.06,dbl:1,form:'AA-',A:'0,6 0,6 1,4|0,12 _,4|1,6 1,6 3,4|2,4 1,4 0,8|0,6 0,6 1,4|3,6 3,6 5,4|5,6 3,6 1,4|0,16'}});
Mi(4,'Mini boss: The Dirge',48,'aeo',118,[0,6,3,0,0,6,3,0],'0,8 2,8|1,8 -1,8|0,8 3,8|2,4 0,12|4,8 7,8|8,8 6,8|5,8 3,8|4,4 2,4 0,8',
  {bell:{p:.25,v:.04,oct:2},tune:{k:'cello',oct:0,v:.11,dbl:1,form:'AA-'},bass:{v:.11,c:'x.....x.x...x...'},drums:{c:{taiko:'x.....x.x...x...',snare:'............x...',tek:'..g...g...g...gg'}}});
// Vharog: a beast prowling. C with the dark half-step above it: a low figure that paces and stops, pounces down from G, then paces a fifth higher.
S('z5m','Mini boss: Vharog',{bpm:128,root:48,mode:'phr',prog:[0,0,0,0,0,0,1,0],fight:1,boom:.9,pad:{v:.024,cut:900,form:1},
  bass:{v:.1,c:'x..x..x.x..x..x.'},stab:{c:'X.......x.......',v:.018},drums:{c:{taiko:'X..g..x.X..g..x.',snare:'....x.......x..g',hat:'x.x.x.x.x.x.x.x.'}},
  tune:{k:'brass',oct:0,v:.06,dbl:1,form:'AA-',A:'0,4 0,2 1,2 0,4 _,4|0,4 0,2 1,2 3,4 2,4|0,4 0,2 1,2 0,4 _,4|4,4 3,4 2,2 1,2 0,4|4,4 4,2 5,2 4,4 _,4|4,4 4,2 5,2 7,4 6,4|5,4 4,4 3,4 2,4|1,4 0,12'}});
// v215g (owner, Nov 11 2026: several melodies "seem too random", "lack cohesion"; bass "overpowering" on some songs; the desert songs
// "too similar melodically"; the Dirge songs except its two fights disliked; Vaelric, the Citadel mini boss and Argus not dark
// enough): every tune named is rewritten around one short idea that is stated, repeated on the next chord and answered, with the
// phrase ending on the home note; the first songs of Kindlelight, Searing Sands and The Dirge get a written tune in place of v79's
// improvised one (MTH.z0 / z3 / z4, their other parts kept; z4 leaves the locrian scale); bells toll on a fixed bar (toll)
// instead of at random; every bass is turned down (BASS215).
MTH.z0=Object.assign({},MTH.z0,{lead:null,bell:null,toll:{n:4,v:.035,oct:2},
  tune:{k:'hollow',oct:1,v:.05,form:'A-B-',A:'_,4 0,2 2,2 4,8|_,4 4,2 2,2 0,8|_,4 1,2 3,2 5,8|4,10 2,2 0,4|_,4 0,2 2,2 4,8|_,4 3,2 1,2 -1,8|1,6 3,6 5,4|4,4 0,12',
    B:'7,10 4,2 2,4|4,10 2,2 0,4|8,10 5,2 3,4|4,14 _,2|7,10 4,2 2,4|6,10 3,2 1,4|5,6 3,6 1,4|0,14 _,2'}});
// v215i (owner: "Field 1 searing sands and salt wastes seem like ai wrote them. there's no substance or intelligence to the melody";
// Vaelric's and Vharog's fights "need work"): these four are written tune first — a line with a hook, a rise to a high point and a
// return — and the chords are then fitted under it (before, the notes were picked to fit the chords).
// Searing Sands I: 16 bars, a a' b a''. The hook falls A G F# Eb D (the desert scale's wide step) and rests on D; the middle climbs to the high D.
// Almost all of it sits over the home chord, as this kind of tune does over a drone; one bar of C minor under the high point.
MTH.z3=Object.assign({},MTH.z3,{lead:null,prog:[0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0],
  tune:{k:'reed',oct:1,v:.045,form:'A-',A:'4,6 3,2 2,4 1,4|0,12 _,4|2,2 3,2 4,4 4,2 5,2 4,4|3,4 2,8 _,4|4,6 3,2 2,4 1,4|0,12 _,4|2,2 3,2 4,4 4,2 3,2 2,4|1,4 0,12|4,4 5,2 6,2 7,8|8,4 7,4 6,4 5,4|4,4 5,2 6,2 7,8|6,4 5,4 4,8|4,6 3,2 2,4 1,4|0,8 2,4 3,4|4,4 3,2 2,2 2,4 1,4|0,16'}});
MTH.z4=Object.assign({},MTH.z4,{mode:'aeo',prog:[0,5,6,0,0,3,6,0],lead:null,bell:null,toll:{n:2,v:.045,oct:2},
  tune:{k:'choir',oct:1,v:.05,form:'AB-',A:'0,6 0,2 2,8|2,6 2,2 0,8|1,6 1,2 3,8|2,6 1,2 0,8|4,6 4,2 2,8|3,6 3,2 5,8|3,6 1,2 -1,8|0,16',
    B:'4,6 4,2 7,8|7,6 5,2 2,8|8,6 6,2 3,8|4,12 2,4|4,6 2,2 0,8|5,6 3,2 0,8|1,6 -1,2 1,8|0,16'}});
var BASS215=.62;for(const k in MTH){const th=MTH[k];if(th&&th.bass&&(MU215.names[k]||/^z\d$/.test(k)))th.bass=Object.assign({},th.bass,{v:th.bass.v*(MU215.names[k]?BASS215:.8)})}
})();

// ---------- the melody's instruments (v79's and the title's, 3580) ----------
MU215.K={
  cel:(f,t,d,v)=>muCelesta(f,t,v),
  bell:(f,t,d,v)=>muBell(f,t,v),
  pluck:(f,t,d,v)=>muPluck(f,t,v),
  flute:(f,t,d,v)=>muFlute(f,t,d,v),
  cello:(f,t,d,v)=>muCello(f,t,d,v),
  hollow:(f,t,d,v)=>muLead(f,t,d,v,{w:'square',cut:900,bp:1,vib:1,at:.1}),
  reed:(f,t,d,v)=>muLead(f,t,d,v,{w:'square',cut:1500,bp:1,vib:1.4,at:.05,slide:1}),
  horn:(f,t,d,v)=>muLead(f,t,d,v,{w:'sawtooth',cut:1100,vib:.5,at:.09,sub:1}),
  brass:(f,t,d,v)=>{muLead(f,t,d,v,{w:'sawtooth',cut:2100,vib:.4,at:.03,sub:0});muLead(f,t,d,v*.6,{w:'square',cut:1300,vib:.4,at:.03,sub:0})},
  whistle:(f,t,d,v)=>muLead(f,t,d,v,{w:'sine',cut:3000,vib:1,at:.04,sub:1}),
  choir:(f,t,d,v)=>{muLead(f,t,d,v,{w:'sine',cut:1800,vib:1.2,at:.3,sub:1});muLead(f*2,t,d,v*.45,{w:'triangle',cut:1400,vib:1.2,at:.35,sub:0})}};
// 'deg,len deg,len|…' → {start step: [degree, length]}; null when the part is not exactly `bars` bars long
function mu215Parse(str,bars){const on={};let at=0;for(const tok of str.replace(/\|/g,' ').split(/\s+/)){if(!tok)continue;const q=tok.split(','),l=+q[1];if(!(l>0))return null;
    if(q[0]!='_'){const d=+q[0];if(!isFinite(d))return null;on[at]=[d,l]}at+=l}
  return at===bars*16?on:null}
function mu215Tune(th){const T=th.tune;if(T.on)return T;T.on={};for(const k of ['A','B'])if(T[k]){T.on[k]=mu215Parse(T[k],th.prog.length);if(!T.on[k])console.warn('v215 tune length',k)}return T}
function mu215Step(th,t,bar,s){const sp=60/th.bpm/4,n=th.prog.length,T=th.tune,X=th.fx;
  if(T){mu215Tune(th);const ch=T.form[Math.floor(bar/n)%T.form.length],on=T.on[ch],e=on&&on[(bar%n)*16+s];
    if(e){const B=ch=='B'&&T.kb;(MU215.K[B?T.kb:T.k]||MU215.K.whistle)(muF(muNote(th,e[0],B&&T.ob!=null?T.ob:T.oct)),t,sp*e[1]*.95,B?T.vb||T.v:T.v);if(T.dbl&&!(B&&T.ob!=null))MU215.K.horn(muF(muNote(th,e[0],T.oct-1)),t,sp*e[1]*.95,T.v*.6)}}
  const St=th.stab;if(St){const c=St.c[s];if(c&&c!='.'){const dg=muChord(th,bar);[0,2,4].forEach(k=>muLead(muF(muNote(th,dg+k,St.oct||0)),t,sp*1.4,St.v*(c=='X'?1.3:1),{w:'sawtooth',cut:2400,at:.008}))}}
  if(th.toll&&s==0&&bar%th.toll.n==0)muBell(muF(muNote(th,0,th.toll.oct||1)),t,th.toll.v);
  if(th.boom&&s==0&&bar%4==0){MUDR.taiko(t,.45*th.boom);muNz(t,1.4,'lowpass',1400,120,.7,.06*th.boom,2)}
  if(X){const deg=muChord(th,bar);
    if(X.wind&&s==0&&bar%2==0){const up=Math.random()<.5,a=300+Math.random()*250,b=700+Math.random()*700;muNz(t,sp*30,'bandpass',up?a:b,up?b:a,1.6,X.wind,2,sp*(8+Math.random()*8))}
    if(X.drip&&s%2==0&&Math.random()<X.drip)muCelesta(muF(muNote(th,deg+[0,2,4,7][Math.random()*4|0],3)),t,.035+Math.random()*.03);
    if(X.chime&&s%4==2&&Math.random()<X.chime)muBell(muF(muNote(th,deg+[0,4,7][Math.random()*3|0],3)),t,.014)}}
{const f=muStep;muStep=function(t){const r=f.apply(this,arguments),th=MU.th;
  if(th&&(th.tune||th.fx||th.stab||th.toll)){try{mu215Step(th,t,MU.bar,MU.s)}catch(e){if(!MU215.err){MU215.err=1;console.warn('v215 song',e)}}}return r}}

// ---------- which song plays where ----------
function mu215Key(I){if(!I)return null;if(I.sp)return 'sp_'+I.sp;if(I.den)return 'z'+I.z+'d';return I.fld&&I.k==1?'z'+I.z+'b':I.fld&&I.k==2?'z'+I.z+'c':null}
// a Sovereign (e.boss) or a mini boss (a Sovereign-style fighter e.sv that is no Sovereign) fighting near the hero → the zone's fight song
function mu215Foe(){const P=pl.position;let r=0;for(const e of enemies){if(!e||e.dead||!e.agg||!e.m||!(e.boss||e.sv))continue;if(e.m.position.distanceTo(P)<45){if(e.boss)return 2;r=1}}return r}
{const f=muWant;muWant=function(){const w=f.apply(this,arguments);
  if(typeof w=='string'&&(w=='boss'||/^z\d+$/.test(w))){try{const P=pl.position,I=insAt(Math.round(P.x),Math.round(P.z)),fo=mu215Foe();
      if(fo&&I){const k='z'+I.z+(fo==2?'x':'m');if(MTH[k])return k}
      if(w!='boss'){const k=mu215Key(I);if(k&&MTH[k])return k}}catch(_){}}
  return w}}
// fight songs come in fast, like v79's 'boss'
{const f=muSwitch;muSwitch=function(now){const r=f.apply(this,arguments);try{if(MU.th&&MU.th.fight&&MU.cur!='boss'){MU.xg.gain.cancelScheduledValues(now);MU.xg.gain.setValueAtTime(0,now);MU.xg.gain.setTargetAtTime(1,now+.05,.3)}}catch(_){}return r}}
