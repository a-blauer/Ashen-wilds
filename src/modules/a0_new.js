// ================= v56: portal-map monsters (data, rigs and looks) — loaded before every other module =================
// ---- creature-style rigs built from the existing skeletons ----
(function(){
  const cp=(b,o)=>Object.assign({},SPEC[b],o);
  // Caustic goo: a squat blob with pseudopods
  SPEC.Goo={id:'GO',st:'scale',pal:{bel:[150,226,90],dk:[16,50,10],tip:[190,255,110],nz:.35},anim:'waddle',sc:1.1,hd:[0,.7,.1],legs:[],rough:.25,ns:.4,
    bk:[['chest',.6,0],['spine',.5,-.12],['pelvis',.36,-.18]],
    bones:{pelvis:[null,0,.2,0],spine:['pelvis',0,.36,0],chest:['spine',0,.5,0],neck:['chest',0,.6,0],head:['neck',0,.66,.06],jaw:['head',0,.5,.22],
      fl0:['chest',-.28,.3,.1],fl1:['fl0',-.4,.2,.18],fl2:['fl1',-.46,.08,.24],fr0:['chest',.28,.3,.1],fr1:['fr0',.4,.2,.18],fr2:['fr1',.46,.08,.24]},
    lofts:[{c:[[0,.0,0],[0,.14,0],[0,.36,0],[0,.55,0],[0,.68,.03],[0,.76,.05]],r:[[.46,.42],[.5,.46],[.42,.38],[.3,.28],[.16,.15],[.01,.01]],b:['pelvis','pelvis','spine','chest','head','head'],seg:14,N:28,v:[0,.5]},
      {c:[[-.28,.3,.1],[-.4,.2,.18],[-.46,.06,.24]],r:[[.1,.1],[.07,.07],[.03,.03]],b:['fl0','fl1','fl2'],seg:8,N:10,v:[.75,.25]},{c:[[.28,.3,.1],[.4,.2,.18],[.46,.06,.24]],r:[[.1,.1],[.07,.07],[.03,.03]],b:['fr0','fr1','fr2'],seg:8,N:10,v:[.75,.25]}],
    sig:(x,C)=>{for(let i=0;i<10;i++){const a=i/10*6.283;x.axw('pelvis',RC,dkShade(C,.6),Math.cos(a)*.44,.05,Math.sin(a)*.4,.05,.12,.05,Math.PI)}
      [[.2,.5,.2],[-.25,.4,.15],[.1,.62,-.2],[-.15,.3,-.3],[.3,.25,-.1]].forEach(q=>x.axw('spine',RS,0xd8ff6a,q[0],q[1],q[2],.04,.04,.04,0,0,true))},
    ex:x=>{[-1,1].forEach(s=>{x.axw('head',RB,0x050505,s*.07,.7,.2,.06,.026,.03,0,s*.35);x.axw('head',RB,x.red?0xff2a2a:0xe8ff40,s*.072,.7,.215,.04,.008,.008,0,s*.35,true)});
      x.axw('jaw',RS,0x0a1404,0,.56,.24,.12,.05,.05);for(let i=-3;i<=3;i++)x.axw('jaw',RC,0xd8d0b0,i*.03,.585,.27,.008,.035,.008,Math.PI)}};
  // Bloat maggot: a pale segmented grub
  SPEC.Maggot=cp('Gravewyrm',{id:'MG',pal:{bel:[236,226,196],dk:[150,120,90],tip:[220,200,160],nz:.4},sc:.8,rough:.4,
    sig:(x,C)=>{[[.35,'chest'],[.15,'spine'],[-.05,'spine'],[-.25,'pelvis'],[-.5,'tail0'],[-.75,'tail1'],[-1,'tail2']].forEach((a,i)=>x.axw(a[1],RTO,dkShade(C,.7),0,.27,a[0],.17-i*.012,.17-i*.012,.5,0,0))},
    dt:()=>{},ex:x=>{[-1,1].forEach(s=>[0,1,2].forEach(i=>x.axw('head',RS,x.red?0xff2a2a:0x1a0a0a,s*(.05+i*.02),.38-i*.02,.6-i*.03,.012,.012,.012,0,0,!!x.red)));
      x.axw('head',RTO,0x5a1a1a,0,.3,.78,.06,.06,.6,Math.PI/2,0);for(let i=0;i<8;i++){const a=i/8*6.283;x.axw('head',RC,0xe8e0c8,Math.cos(a)*.05,.3+Math.sin(a)*.05,.78,.008,.04,.008,Math.PI/2,0)}}});
  // Dune scorpion: the spider frame with pincers and an arched stinger
  SPEC.Scorpion=cp('Cryptspider',{id:'SC',pal:{bel:[176,130,70],dk:[60,36,20],tip:[220,150,60],nz:.5},sc:1.1,rough:.35,
    sig:(x,C)=>{const t=[[0,.48,-.62],[0,.74,-.7],[0,.98,-.58],[0,1.1,-.36],[0,1.08,-.14]];for(let i=0;i<t.length-1;i++){const a=t[i],b=t[i+1],m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];x.axw('tail3',RS,dkShade(C,1-i*.06),m[0],m[1],m[2],.07-i*.008,.07-i*.008,.08)}
      x.axw('tail3',RC,0x2a1a0a,0,.98,-.06,.03,.14,.03,2.3,0);x.axw('tail3',RS,0xff7a20,0,1.06,-.12,.03,.03,.03,0,0,true);
      [-1,1].forEach(s=>{x.axw('chest',RS,C,s*.15,.38,.42,.05,.04,.1);x.axw('chest',RS,C,s*.22,.38,.58,.045,.04,.09);x.axw('chest',RB,dkShade(C,.8),s*.25,.38,.72,.07,.05,.13);x.axw('chest',RC,dkShade(C,.6),s*.21,.38,.82,.025,.12,.025,Math.PI/2,0);x.axw('chest',RC,dkShade(C,.6),s*.3,.38,.8,.02,.1,.02,Math.PI/2,0)})}});
  // Argus: a wolf covered in staring eyes
  SPEC.EyeWolf=cp('Ashwolf',{id:'EW',pal:{bel:[70,60,70],dk:[16,12,18],tip:[40,30,44],sad:[30,24,32]},sc:1.15,
    sig:(x,C)=>{SPEC.Ashwolf.sig(x,C);[['neck',.6,.36],['chest',.56,.3],['chest',.6,.18],['chest',.5,.25],['spine',.6,.02],['spine',.5,-.05],['spine',.55,.1],['pelvis',.58,-.22],['pelvis',.48,-.3],['neck',.55,.42],['chest',.45,.15],['spine',.45,.05]].forEach((a,i)=>{const s=i%2?1:-1;
      x.ax(a[0],RS,0x050404,s*.12,a[1],a[2],.035,.035,.03);x.ax(a[0],RS,[0xffd040,0xff3a2a,0xe8ff60][i%3],s*.135,a[1],a[2],.02,.02,.012,0,0,true)})}});
  // The Crest Hydra: a serpent with three heads
  SPEC.Hydra=cp('Gravewyrm',{id:'HY',pal:{bel:[200,180,110],dk:[28,52,30],tip:[90,140,70],nz:.5},sc:1.25,
    sig:(x,C)=>{[-1,1].forEach(s=>{const n=[[s*.06,.3,.22],[s*.2,.5,.32],[s*.3,.72,.42],[s*.32,.86,.5]];for(let i=0;i<n.length-1;i++){const a=n[i],b=n[i+1];x.axw('chest',RS,i?C:dkShade(C,.9),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,.08-i*.008,.11,.08)}
      x.axw('chest',RS,C,s*.33,.9,.58,.09,.075,.14);x.axw('chest',RB,dkShade(C,.6),s*.33,.94,.6,.08,.02,.12);x.axw('chest',RS,0x050404,s*.38,.92,.64,.02,.02,.02);x.axw('chest',RS,0xffc020,s*.39,.92,.655,.012,.012,.008,0,0,true);
      for(let k=0;k<3;k++)x.axw('chest',RC,0xe8e0c8,s*(.3+k*.02),.86,.68,.006,.03,.006,Math.PI);x.axw('chest',RC,0x8a6a3a,s*.3,1.0,.5,.02,.1,.02,-.6,-s*.3)})}});
  // The Rime Wraith: an icy ghost with a crown of shards
  SPEC.IceWraith=cp('Wispling',{id:'IW',pal:{tip:[220,245,255],nz:.25},sc:1.25,
    sig:(x,C)=>{for(let i=0;i<7;i++){const a=-1.2+i*.4;x.axw('head',RC,0xd8f4ff,Math.sin(a)*.12,1.08,-.02+Math.cos(a)*.04,.025,.2-Math.abs(i-3)*.03,.025,0,0,true)}
      ['fl2','fr2'].forEach((b,j)=>{const s=j?1:-1;for(let f=0;f<3;f++)x.axw(b,RC,0xbfeaff,s*.22+(f-1)*.02,.56,.1,.01,.12,.01,Math.PI-.3,0,true)});
      [[.35,.9,.1],[-.38,.75,.0],[.3,.55,-.2],[-.25,.4,.15]].forEach(q=>x.axw('chest',RC,0xbfeaff,q[0],q[1],q[2],.04,.16,.04,.4,.3,true))}});
  // Ssith'ra: a vast centipede
  SPEC.Centipede=cp('Gravewyrm',{id:'CP',pal:{bel:[90,40,30],dk:[24,10,8],tip:[150,60,30],nz:.5},sc:1.05,rough:.35,
    sig:(x,C)=>{[[.36,'chest'],[.2,'chest'],[.05,'spine'],[-.1,'spine'],[-.25,'pelvis'],[-.42,'tail0'],[-.6,'tail0'],[-.78,'tail1'],[-.95,'tail1'],[-1.12,'tail2'],[-1.3,'tail3']].forEach((a,i)=>{
      x.axw(a[1],RB,dkShade(C,.8),0,.36-i*.006,a[0],.3-i*.012,.04,.08);[-1,1].forEach(s=>{x.axw(a[1],RC,0x2a1410,s*.22,.18,a[0],.02,.28,.02,0,s*1.1)})});
      [-1,1].forEach(s=>{x.axw('head',RC,0x1a0a08,s*.06,.28,.74,.02,.16,.02,Math.PI/2,s*.5);x.axw('head',RC,0x6a3a20,s*.05,.45,.6,.01,.3,.01,-.7,s*.4)})},dt:()=>{}});
})();
// ---- humanoid looks (kit designs are in dkNewKit, used by mkHumanoid) ----
Object.assign(HUMLOOK,{
 nagaw:{skin:[70,120,70],tunic:0x3a4a2a,cape:[60,80,40],pants:[50,60,40],sc:1.05,wpn:'sword',wcol:0x9aa0a8},
 nagaa:{skin:[90,130,60],tunic:0x4a3a22,cape:[70,60,30],pants:[60,50,30],sc:1,wpn:'bow',wcol:0x6a5a40},
 nagas:{skin:[60,100,90],tunic:0x1a3a3a,cape:[30,70,70],pants:[30,50,50],sc:1,wpn:'staff',wcol:0x7affc0},
 troll:{skin:[120,150,170],tunic:0x3a4a5a,cape:[60,70,90],pants:[60,64,72],sc:1.5,wpn:'club',wcol:0x6a4a2a},
 trollsh:{skin:[110,140,170],tunic:0x2a3a5a,cape:[40,60,110],pants:[50,60,80],sc:1.35,wpn:'staff',wcol:0x9ad8ff},
 yeti:{skin:[214,220,228],tunic:0xd8dce4,cape:[200,206,214],pants:[200,206,214],sc:1.55,wpn:'none'},
 selem:{skin:[200,160,100],tunic:0xb08850,cape:[150,110,60],pants:[150,110,60],sc:1.4,wpn:'none',bone:1},
 ghoul:{skin:[110,122,110],tunic:0x2a2a24,cape:[40,40,34],pants:[40,40,34],sc:1.0,wpn:'none'},
 vamp:{skin:[214,204,210],tunic:0x2a0a10,cape:[80,10,20],pants:[30,20,26],sc:1.0,wpn:'dagger',wcol:0xc0c4cc},
 vampk:{skin:[214,204,210],tunic:0x1a1418,cape:[90,10,20],pants:[26,20,24],sc:1.25,wpn:'gs',wcol:0x8a2030},
 vampm:{skin:[214,204,210],tunic:0x3a0a14,cape:[100,10,24],pants:[40,10,16],sc:1.0,wpn:'staff',wcol:0xff3040},
 abom:{skin:[150,160,120],tunic:0x4a4030,cape:[60,50,40],pants:[60,50,40],sc:1.35,wpn:'axe',wcol:0x8a8a80},
 vlord:{skin:[222,212,218],tunic:0x1a0a10,cape:[110,10,24],pants:[24,16,20],sc:1.1,wpn:'sword',wcol:0xc02030}});
// ---- enemy roster for the portal maps ----
const NEWEN={
 goo:{n:'Caustic Goo',e:'🟢',rig:'Goo',col:0x5ad83a,w:{hp:1.05,pa:.9,ma:.6,pd:.8,md:.9},mt:'p',moves:['strike','spit','slam'],fam:'Earth'},
 spitter:{n:'Acid Spitter',e:'🧪',rig:'Goo',col:0xb8e02a,sc:.8,w:{hp:.75,pa:.5,ma:1.05,pd:.7,md:.9},mt:'m',moves:['spit','bolt'],ranged:1,fam:'Earth'},
 maggot:{n:'Bloat Maggot',e:'🐛',rig:'Maggot',col:0xe0d0a8,w:{hp:.9,pa:1,ma:.4,pd:.8,md:.7},mt:'p',moves:['strike','bite','charge'],fam:'Swarm'},
 nagaw:{n:'Naga Warrior',e:'🐍',hum:'nagaw',w:{hp:1.1,pa:1.1,ma:.4,pd:1.1,md:.8},mt:'p',moves:['strike','spin','charge'],fam:'Dragon'},
 nagaa:{n:'Naga Archer',e:'🏹',hum:'nagaa',w:{hp:.8,pa:1.05,ma:.4,pd:.8,md:.8},mt:'p',moves:['throw','strike'],ranged:1,fam:'Dragon'},
 nagas:{n:'Naga Shaman',e:'🐍',hum:'nagas',w:{hp:.8,pa:.4,ma:1.15,pd:.7,md:1.1},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Spirit'},
 troll:{n:'Frost Troll',e:'🧌',hum:'troll',w:{hp:1.45,pa:1.2,ma:.4,pd:1.1,md:.9},mt:'p',moves:['strike','slam','charge'],fam:'Earth'},
 trollsh:{n:'Troll Rimecaller',e:'🧊',hum:'trollsh',w:{hp:1,pa:.4,ma:1.2,pd:.9,md:1.1},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Spirit'},
 yeti:{n:'Yeti',e:'🦍',hum:'yeti',w:{hp:1.35,pa:1.15,ma:.4,pd:1,md:.9},mt:'p',moves:['strike','slam','pounce'],fam:'Beast'},
 scorp:{n:'Dune Scorpion',e:'🦂',rig:'Scorpion',col:0xc89048,w:{hp:1,pa:1.15,ma:.5,pd:1.1,md:.8},mt:'p',moves:['strike','pounce','spit'],fam:'Swarm'},
 selem:{n:'Sand Elemental',e:'🌪️',hum:'selem',w:{hp:1.3,pa:.6,ma:1.15,pd:1.2,md:1},mt:'m',moves:['bolt','slam','spin'],fam:'Earth'},
 ghoul:{n:'Grave Ghoul',e:'🧟',hum:'ghoul',w:{hp:1,pa:1.2,ma:.4,pd:.85,md:.8},mt:'p',moves:['strike','pounce','bite'],fam:'Spirit'},
 vamp:{n:'Vampire Thrall',e:'🧛',hum:'vamp',w:{hp:1,pa:1.15,ma:.6,pd:.9,md:.9},mt:'p',moves:['strike','spin','charge'],fam:'Spirit'},
 vampk:{n:'Blood Knight',e:'🛡️',hum:'vampk',w:{hp:1.45,pa:1.2,ma:.5,pd:1.35,md:1.1},mt:'p',moves:['strike','slam','charge'],fam:'Spirit'},
 vampm:{n:'Blood Magister',e:'🩸',hum:'vampm',w:{hp:.85,pa:.4,ma:1.25,pd:.8,md:1.2},mt:'m',moves:['bolt','rainfire'],ranged:1,fam:'Spirit'},
 bloodbat:{n:'Blood Bat',e:'🦇',rig:'Batwing',col:0x8a1a2a,w:{hp:.75,pa:1.1,ma:.6,pd:.7,md:.8},mt:'p',moves:['strike','charge'],fam:'Sky'}};
Object.assign(EN,NEWEN);
Object.keys(NEWEN).forEach(k=>{S[k]=S[k]||{e:EN[k].e,c:EN[k].col||0x888888,h:'X',t:'x',hp:20,a:8,d:5};MSET[k]=EN[k].moves});
Object.assign(BIOEN,{'Kindlelight':['goo','spitter','maggot'],'Hillside Crest':['nagaw','nagaa','nagas'],'Burningeye Summit':['troll','yeti','trollsh'],'Searing Sands':['scorp','selem'],'The Dirge':['skeleton','ghoul','bonearcher'],'The Citadel':['vamp','bloodbat','vampk','vampm']});
// camp themes for the portal maps (the outpost style reuses existing camp builders)
var CTH2={
 goopit:{n:'Caustic Pool',mem:[['goo',3],['spitter',1]],b:'bog'},maggots:{n:'Maggot Nest',mem:[['maggot',3]],b:'mire'},spitmire:{n:'Spitter Mire',mem:[['spitter',2],['goo',1]],b:'bog'},
 nagacamp:{n:'Serpent Warcamp',mem:[['nagaw',2],['nagaa',1]],b:'orc'},nagashrine:{n:'Serpent Shrine',mem:[['nagas',2],['nagaw',1]],b:'shrine'},nagaout:{n:'Archer Outpost',mem:[['nagaa',2],['nagaw',1]],b:'brig'},
 trollden:{n:'Troll Den',mem:[['troll',2],['trollsh',1]],b:'mega'},yeticave:{n:'Yeti Cave',mem:[['yeti',3]],b:'wolf'},rime:{n:'Rimecaller Circle',mem:[['trollsh',2],['yeti',1]],b:'ritual'},
 scorpnest:{n:'Scorpion Nest',mem:[['scorp',3]],b:'web'},ruins:{n:'Elemental Ruins',mem:[['selem',2],['scorp',1]],b:'tomb'},bonepit:{n:'Sun-bleached Bones',mem:[['scorp',2],['selem',1]],b:'wyrm'},
 crypt:{n:'Open Crypt',mem:[['skeleton',2],['bonearcher',1]],b:'grave'},ghoulpit:{n:'Ghoul Feasting Pit',mem:[['ghoul',3]],b:'haunt'},ossuary:{n:'Ossuary',mem:[['ghoul',2],['skeleton',1]],b:'fort'},
 coven:{n:'Blood Coven',mem:[['vamp',2],['vampm',1]],b:'ritual'},roost:{n:'Blood Roost',mem:[['bloodbat',4]],b:'bats'},barracks:{n:'Knight Barracks',mem:[['vampk',2],['vamp',1]],b:'fort'}};
var PM_TH=[['goopit','maggots','spitmire'],['nagacamp','nagashrine','nagaout'],['trollden','yeticave','rime'],['scorpnest','ruins','bonepit'],['crypt','ghoulpit','ossuary'],['coven','roost','barracks']];
