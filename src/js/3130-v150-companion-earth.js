// ================= v150: Cragback, Titanshell and Bogmaw get bodies of their own =================
// The owner: "Some of our companions are just reskinned versions of lower tiered companions. Redo those ones and give them
// original models." Cragback (tier 3) and Titanshell (tier 5) were the Stoneshell tortoise in grey and brown, and Bogmaw
// (tier 4) was the Mossfrog toad in dark green. Each now has its own body on the same skeleton (the v137 rig variants,
// RV137 in 2600: same bones, same walk / hop / bite animation, same gameplay; the base species look exactly as before):
//  * Cragback — a crag tortoise: a long, low, chunky 8-sided shell of chipped stone with a tall jagged ridge of slanted
//    stone blades down its spine, shorter blades on the flanks, a serrated rim of stone spikes and pale-blue crystal
//    outcrops; a wedge head on a thick neck with a hooked snapping beak, back-swept horns and a heavy brow; thick legs
//    with stone knee plates and big claws; a tail ending in a spiked stone club.
//  * Titanshell — an ancient titan turtle carrying a ruined mountain fortress: a tall domed shell of big scutes raised on
//    four pillar legs (stone bands, toe nails), a stone platform on the dome with a keep (broken spire, dark windows),
//    a turret, crumbled curtain walls, a shrine gate with steps, a crag spire and a dead tree; vines hang from the rim;
//    a massive low head with great curving horns, tusks, a heavy brow and a moss beard.
//  * Bogmaw — a bloated swamp horror toad: a huge wide sagging body with no neck, an enormous maw across the whole front
//    (crooked needle teeth, a pendulous throat-jaw on the jaw bone, so bites open it wide), three pairs of small sunken
//    eyes, an angler lure on the brow, barbel tendrils hanging from the jaw, warts, pustules, mushrooms and bracket fungi
//    on its back, weed hanging from its flanks, short sprawled legs with big webbed feet.
// Colours still come from the species colour (c.cl → lpMain). The evolution looks (EVO100.D.Stoneshell / .Mossfrog) keep
// the old designs for Stoneshell and Mossfrog and get new ones drawn for each new body (levels 1–5), and the trait anchors
// (lpExtras: Spiked, Armored, Horned, Ember…) follow each body.
RV137.var.Stoneshell=['Stoneshell','Cragback','Titanshell'];RV137.var.Mossfrog=['Mossfrog','Bogmaw'];
if(EVO100.surf){delete EVO100.surf.Stoneshell;delete EVO100.surf.Mossfrog}
var ER150={};
// ---------------- helpers ----------------
function er150Nz(i,s,c){const v=Math.sin(i*12.9898+s*78.233+c*37.719)*43758.5453;return v-Math.floor(v)}
// interpolated profile of a loft table [[z,y,rx,ryT,ryB],…] (any z order) at z
function er150Prof(T,z){const A=T.slice().sort((a,b)=>a[0]-b[0]);if(z<=A[0][0])return A[0].slice(1);if(z>=A[A.length-1][0])return A[A.length-1].slice(1);
  for(let i=0;i<A.length-1;i++)if(z<=A[i+1][0]){const a=A[i],b=A[i+1],t=(z-a[0])/(b[0]-a[0]);return a.slice(1).map((v,j)=>v+(b[j+1]-v)*t)}}
// top of that loft at (x,z) (elliptic section)
function er150Top(T,x,z){const P=er150Prof(T,z);return P[0]+P[2]*Math.sqrt(Math.max(0,1-(x/P[1])**2))}
// rows → loft rings; b = bones array or a function of z
function er150Rows(T,b,o){return T.map((r,i)=>Object.assign({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4]==null?r[3]:r[4],b:typeof b=='function'?b(r[0],i):(r[5]||b),z:r[0],i},o?o(r,i):{}))}
// four legs: F / H rows [x, y, z, r, bones (with # = fl/fr/hl/hr), foot flag]; mirrored
function er150Legs(F,H,paint,seg){const out=[];[-1,1].forEach(s=>{[[F,s<0?'fl':'fr'],[H,s<0?'hl':'hr']].forEach(([L,k])=>out.push({rings:L.map(r=>({p:[s*r[0],r[1],r[2]],rx:r[3],ryT:r[3],ryB:r[3],
  b:[r[4][0].replace('#',k),r[4][1].replace('#',k),r[4][2]],d:r[5]||0,y:r[1]})),seg:seg||7,ref:[1,0,0],capB:1,paint}))});return out}
// a species-specific value for the current variant
function er150Sp(rig,c){return rv137(rig,c)}
// =====================================================================================================================
// Stoneshell rig: Cragback and Titanshell
// =====================================================================================================================
// shell tables [z, centre y, half width, dome height, underside depth]
ER150.CR={shell:[[.42,.22,.15,.05,.04],[.37,.225,.27,.11,.07],[.27,.23,.36,.18,.08],[.14,.235,.4,.22,.09],[0,.235,.41,.23,.09],[-.14,.235,.4,.22,.09],[-.28,.23,.37,.19,.08],[-.4,.225,.3,.13,.07],[-.49,.22,.17,.06,.04]],
  head:[[.28,.235,.09,.085,.075],[.36,.255,.088,.08,.07],[.43,.285,.1,.085,.07],[.5,.305,.115,.085,.07],[.57,.31,.1,.07,.055],[.63,.3,.075,.055,.042],[.67,.29,.045,.035,.03],[.69,.285,.012,.012,.012]],
  jaw:[[.47,.255,.085,.02,.035],[.55,.25,.08,.018,.03],[.62,.255,.055,.014,.022],[.665,.262,.02,.01,.01]],
  tail:[[-.4,.2,.075],[-.5,.205,.066],[-.59,.21,.056],[-.66,.215,.05],[-.7,.215,.036]]};
ER150.TI={shell:[[.46,.29,.16,.06,.05],[.41,.295,.29,.15,.08],[.31,.3,.39,.26,.09],[.18,.3,.44,.33,.1],[.03,.3,.46,.36,.1],[-.12,.3,.45,.35,.1],[-.27,.3,.42,.3,.1],[-.4,.295,.34,.2,.08],[-.5,.29,.19,.08,.05]],
  head:[[.3,.29,.12,.11,.1],[.39,.3,.12,.11,.1],[.47,.315,.13,.11,.095],[.54,.335,.16,.12,.09],[.62,.34,.155,.105,.075],[.7,.325,.125,.085,.055],[.76,.305,.075,.055,.04],[.795,.295,.025,.02,.02]],
  jaw:[[.53,.265,.13,.03,.06],[.62,.255,.12,.022,.05],[.71,.26,.09,.016,.035],[.775,.27,.035,.01,.018]],
  tail:[[-.46,.27,.085],[-.55,.26,.065],[-.62,.245,.04],[-.66,.235,.012]]};
ER150.TI.Y=er150Top(ER150.TI.shell,0,-.02)+.005;   // the fortress platform's top
ER150.CR.top=(x,z)=>er150Top(ER150.CR.shell,x,z)-.012;
ER150.TI.top=(x,z)=>er150Top(ER150.TI.shell,x,z)-.008;
{const B=LPR.Stoneshell,g0=B.geo,k0=B.kit,A0={head:B.head,back:B.back,up:B.up};
  // trait / variant anchors (lpExtras) follow each body
  const AN={Cragback:{head:['head',0,.36,.55],up:.14,back:[['spine',0,.52,.14],['spine',0,.56,-.06],['spine',0,.53,-.26]]},
    Titanshell:{head:['head',0,.45,.6],up:.16,back:[['spine',.3,.6,.05],['spine',-.3,.6,.05],['spine',.28,.58,-.25],['spine',-.28,.58,-.25]]}};
  ['head','back','up'].forEach(f=>Object.defineProperty(B,f,{configurable:true,enumerable:true,get(){const s=RV137.cur.Stoneshell;return AN[s]?AN[s][f]:A0[f]},set(v){A0[f]=v}}));
  B.geo=function(C,c){const sp=er150Sp('Stoneshell',c);if(sp=='Cragback')return er150CragGeo(C);if(sp=='Titanshell')return er150TitanGeo(C);return g0.apply(this,arguments)};
  B.kit=function(k,c,C,red){const sp=er150Sp('Stoneshell',c);if(sp=='Cragback')return er150CragKit(k,C,red);if(sp=='Titanshell')return er150TitanKit(k,C,red);return k0.apply(this,arguments)};
}
// ---------------- Cragback body ----------------
function er150CragGeo(C){const T=ER150.CR,nz=er150Nz;
  const stone=lpMain(C,.16).multiplyScalar(.72),light=stone.clone().multiplyScalar(1.25),dark=stone.clone().multiplyScalar(.55),lichen=new THREE.Color(0x7a8466),
    plast=new THREE.Color(C).lerp(new THREE.Color(0x8a8268),.55).multiplyScalar(.7),skin=new THREE.Color(C).lerp(new THREE.Color(0x2a2c2c),.62),skinL=skin.clone().lerp(new THREE.Color(0x9a9680),.35),horn=new THREE.Color(0x1e1c18);
  const shell={rings:er150Rows(T.shell,['spine','spine',0],(r,i)=>({j:i&&i<T.shell.length-1?.26:.06})),seg:8,capA:1,capB:1,paint:(o,r,s,c,i)=>{
    if(s<-.35){o.copy(plast);if((i+Math.round(c*2))%2)o.multiplyScalar(.82);return}
    o.copy(stone);const n=nz(i+5,c,s);if(n>.62)o.copy(light);else if(n<.25)o.multiplyScalar(.8);if(s>.9)o.copy(dark);if(Math.abs(s)<.2)o.copy(dark).multiplyScalar(1.2);if(s>.4&&nz(i,s,c)>.84)o.lerp(lichen,.6)}};
  const bh=(z,i)=>i<1?['neck','neck',0]:i<2?['neck','head',.5]:['head','head',0];
  const head={rings:er150Rows(T.head,bh,(r,i)=>({k:r[0]>.63?'beak':''})),seg:7,capA:1,capB:1,paint:(o,r,s)=>{o.copy(r.k?horn:skin);if(!r.k&&s>.5)o.multiplyScalar(.75);if(!r.k&&s<-.4)o.copy(skinL)}};
  const jaw={rings:er150Rows(T.jaw,(z,i)=>i<1?['head','jaw',.7]:['jaw','jaw',0],(r)=>({k:r[0]>.6?'beak':''})),seg:7,capB:1,paint:(o,r,s)=>{o.copy(r.k?horn:skinL);if(s>.5)o.copy(new THREE.Color(0x2a0e0c))}};
  const tb=['tail0',['tail0','tail1',.5],['tail1','tail2',.5],['tail2','tail3',.6],'tail3'];
  const tail={rings:T.tail.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[2]*.9,ryB:q[2]*.8,b:typeof tb[i]=='string'?[tb[i],tb[i],0]:tb[i]})),seg:7,capB:1,paint:(o,r,s)=>{o.copy(skin);if(s>.4)o.multiplyScalar(.75)}};
  const legP=(o,r,sn,c,i)=>{o.copy(skin);if(r.d)o.copy(skin).multiplyScalar(.55);else if(nz(i,c,sn)>.7)o.multiplyScalar(.8)};
  const legs=er150Legs(
    [[.15,.22,.17,.085,['chest','#0',.5]],[.168,.13,.19,.08,['#0','#1',.7]],[.178,.065,.185,.074,['#1','#1',0]],[.182,.026,.19,.084,['#2','#2',0],1],[.182,.004,.2,.09,['#2','#2',0],1]],
    [[.16,.22,-.21,.09,['pelvis','#0',.5]],[.176,.13,-.18,.085,['#0','#1',.7]],[.184,.065,-.2,.077,['#1','#1',0]],[.188,.026,-.215,.085,['#2','#2',0],1],[.188,.004,-.215,.09,['#2','#2',0],1]],legP,7);
  return lpGeo('ER150|Cragback|'+C,'Stoneshell',[shell,head,jaw,tail].concat(legs),151)}
function er150CragKit(k,C,red){const T=ER150.CR,top=T.top,nz=er150Nz;
  const stone=dkShade(lpMain(C,.12).getHex(),.7),st2=dkShade(stone,.72),st3=dkShade(stone,1.18),blade=dkShade(lpMain(C,.1).getHex(),.5),bone=0x8a8678,horn=0x1e1c18,
    cry=0x9ad8ff,cryD=0x3a5a70,eye=red?0xff2a2a:0x9ae0ff,skin=new THREE.Color(C).lerp(new THREE.Color(0x2a2c2c),.62).getHex();
  // the spine ridge: tall slanted stone blades, each with a smaller shard beside it
  const R=[[.3,.11],[.19,.17],[.07,.22],[-.05,.23],[-.17,.2],[-.29,.15],[-.39,.09]];
  R.forEach(([z,h],i)=>{const y=top(0,z);k.p('spine','cone4','c',i%2?blade:st2,0,y+h*.42,z,.04,h,.1,-.42,0,(i%2?.06:-.06));
    k.p('spine','cone4','c',st2,(i%2?.035:-.035),y+h*.22,z-.04,.03,h*.55,.06,-.5,0,(i%2?-.3:.3));
    k.p('spine','dod','c',stone,0,y-.005,z,.05,.03,.06,i,i*.7,0)});
  // flank blades in two rows, leaning out
  [-1,1].forEach(s=>{[[.18,.17,.08],[.05,.21,.11],[-.08,.2,.11],[-.21,.18,.09],[-.33,.15,.07]].forEach(([z,x,h],i)=>{const y=top(x,z);
      k.p('spine','cone4','c',i%2?st2:blade,s*x,y+h*.38,z,.03,h,.065,-.3,0,-s*.55)});
    [[.1,.31,.05],[-.12,.32,.05],[-.3,.27,.04]].forEach(([z,x,h])=>{const y=top(x,z);k.p('spine','cone4','c',st2,s*x,y+h*.3,z,.025,h,.05,-.2,0,-s*.95)})});
  // serrated rim: stone spikes jutting out and down all round the shell
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2,z=Math.cos(a)*.47-.03,P=er150Prof(T.shell,Math.max(-.48,Math.min(.41,z))),x=Math.sin(a)*P[1];if(Math.abs(Math.sin(a))<.25&&Math.cos(a)>0)continue;
    const h=i%2?.07:.1,rx=Math.cos(a)*1.75,rz=-Math.sin(a)*1.75,d=new THREE.Vector3(0,1,0).applyEuler(new THREE.Euler(rx,0,rz)),q=lk173Near(er150CragGeo(C),[x,P[0]+.005,z]).p; // v173: on the shell (they stood off its flanks)
    k.p('spine','cone4','c',i%2?st2:stone,q[0]+d.x*(h*.5-.018),q[1]+d.y*(h*.5-.018),q[2]+d.z*(h*.5-.018),.03,h,.03,rx,0,rz)}
  // crystal outcrops between the blades (glowing cores, dark shards)
  [[.22,.12,.13],[-.24,-.08,.15],[.18,-.27,.11],[-.14,.22,.09]].forEach(([x,z,h],j)=>{const y=top(x,z);for(let i=0;i<4;i++){const a=i*1.7+j,dx=i?Math.cos(a)*.03:0,dz=i?Math.sin(a)*.03:0,hh=i?h*.6:h,lx=Math.sign(x)*(i?.4:.25)+dx*4,lz=dz*4;
      k.L('spine',i%2?'c':'g',i%2?cryD:cry,[x+dx,y-.02,z+dz],[x+dx+lx*hh*.5,y+hh,z+dz+lz*hh*.3],i?.022:.032,.003,4)}
    k.p('spine','dod','c',st2,x,y-.01,z,.045,.025,.045,j,j,0)});
  // the face: sunken glowing eyes under a heavy brow, back-swept horns, a hooked snapping beak
  [-1,1].forEach(s=>{
    k.p('head','sph','c',0x080806,s*.09,.335,.55,.03,.018,.026,0,s*.5,-s*.2);k.p('head','box','g',eye,s*.1,.337,.558,.026,.008,.008,0,s*.5,-s*.25);
    k.p('head','box','c',st2,s*.075,.358,.55,.07,.02,.07,0,s*.45,-s*.3);
    k.L('head','c',bone,[s*.065,.372,.49],[s*.13,.435,.38],.03,.003,5);k.L('head','c',dkShade(bone,.8),[s*.09,.352,.475],[s*.17,.385,.4],.02,.002,4);
    k.p('head','dod','c',st2,s*.1,.3,.5,.03,.02,.03,s,0,0);
    for(let i=0;i<3;i++)k.p('neck','cone4','c',st2,s*.07,.315-i*.005,.4-i*.05,.014,.04,.014,0,0,-s*.9)});
  k.p('head','cone4','c',horn,0,.315,.645,.055,.11,.045,Math.PI/2,0,0);
  k.L('head','c',horn,[0,.305,.67],[0,.24,.72],.032,.004,4);
  k.p('jaw','cone4','c',horn,0,.262,.64,.042,.09,.026,Math.PI/2,0,0);
  [0,1,2].forEach(i=>k.p('head','dod','c',st2,0,.392-i*.006,.47+i*.05,.03,.018,.03,i,0,0));
  for(let i=0;i<4;i++)k.p(i<2?'neck':'chest','cone4','c',st2,0,.33+i*.004,.4-i*.05,.018,.05,.03,-.4,0,0);
  // legs: stone knee plates, big claws
  [['fl1',-.172,.12,.265],['fr1',.172,.12,.265]].forEach(q=>{k.p(q[0],'dod','c',st3,q[1],q[2],q[3],.05,.04,.028,.2,0,0);k.p(q[0],'dod','c',stone,q[1],q[2]+.06,q[3]-.01,.04,.03,.024,.3,0,0)});
  [['hl1',-.26,.12,-.18],['hr1',.26,.12,-.18]].forEach(q=>k.p(q[0],'dod','c',st3,q[1],q[2],q[3],.026,.045,.05,0,0,0));
  [['fl2',-.182,.2],['fr2',.182,.2],['hl2',-.188,-.215],['hr2',.188,-.215]].forEach(f=>[-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0x1a1812,f[1]+i*.04,.016,f[2]+.088,.016,.06,.016,Math.PI/2,0,0)));
  // tail plates and the spiked stone club
  [[-.44,.27,'tail0'],[-.53,.27,'tail1'],[-.61,.27,'tail2']].forEach((q,i)=>k.p(q[2],'cone4','c',st2,0,q[1]-i*.004,q[0],.02,.05,.03,-.5,0,0));
  k.p('tail3','dod','c',stone,0,.215,-.735,.08,.065,.09,.3,.2,0);k.p('tail3','dod','c',st3,0,.24,-.72,.05,.04,.06,.7,0,0);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2,x=Math.cos(a)*.08,y=.215+Math.sin(a)*.065;k.p('tail3','cone4','c',st2,x,y,-.735,.02,.07,.02,0,0,Math.atan2(-x,y-.215))}
  k.p('tail3','cone4','c',st2,0,.215,-.82,.024,.08,.024,-Math.PI/2,0,0);
  void skin;
}
// ---------------- Titanshell body ----------------
function er150TitanGeo(C){const T=ER150.TI,nz=er150Nz;
  const stone=lpMain(C,.15).multiplyScalar(.78),seam=stone.clone().multiplyScalar(.45),light=stone.clone().lerp(new THREE.Color(0xb8ac90),.25),moss=new THREE.Color(0x3e5428),
    plast=new THREE.Color(C).lerp(new THREE.Color(0x9a8c6a),.5).multiplyScalar(.72),skin=new THREE.Color(C).lerp(new THREE.Color(0x4a4640),.6).multiplyScalar(.8),skinD=skin.clone().multiplyScalar(.7),skinL=skin.clone().lerp(new THREE.Color(0xa89a80),.35);
  const shell={rings:er150Rows(T.shell,['spine','spine',0],(r,i)=>({j:i&&i<T.shell.length-1?.1:.03})),seg:16,capA:1,capB:1,paint:(o,r,s,c,i)=>{
    if(s<-.3){o.copy(plast);if((i+Math.round(c*3))%2)o.multiplyScalar(.85);return}
    const a=Math.atan2(s,c),band=Math.round(a*2.2),sc=(i+band)%2;o.copy(sc?stone:light);
    if(Math.abs(s)<.18)o.copy(seam).multiplyScalar(1.4);else if(nz(i,c,s)>.78)o.multiplyScalar(.82);if(s>.55&&nz(i+3,s,c)>.66)o.lerp(moss,.7)}};
  const bh=(z,i)=>i<1?['chest','neck',.6]:i<2?['neck','neck',0]:i<3?['neck','head',.6]:['head','head',0];
  const head={rings:er150Rows(T.head,bh),seg:10,capA:1,capB:1,paint:(o,r,s,c,i)=>{o.copy(skin);if(s>.55)o.copy(skinD);if(s<-.35)o.copy(skinL);if(r.z<.47&&i%2)o.multiplyScalar(.85)}};
  const jaw={rings:er150Rows(T.jaw,(z,i)=>i<1?['head','jaw',.7]:['jaw','jaw',0]),seg:9,capB:1,paint:(o,r,s)=>{o.copy(skinL);if(s>.5)o.copy(new THREE.Color(0x2a0e0c))}};
  const tb=[['pelvis','tail0',.6],['tail0','tail1',.5],['tail1','tail2',.6],['tail2','tail2',0]];
  const tail={rings:T.tail.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[2]*.85,ryB:q[2]*.8,b:tb[i]})),seg:8,capB:1,paint:(o,r,s)=>{o.copy(skin);if(s>.4)o.copy(skinD)}};
  const legP=(o,r,sn,c,i)=>{o.copy(skin);if(r.d)o.copy(skinD).multiplyScalar(.8);else if(i%2)o.multiplyScalar(.88)};
  const legs=er150Legs(
    [[.2,.31,.17,.12,['chest','#0',.6]],[.2,.21,.18,.115,['#0','#0',0]],[.205,.125,.19,.108,['#0','#1',.6]],[.205,.065,.185,.108,['#1','#2',.5]],[.205,.026,.19,.122,['#2','#2',0],1],[.205,.003,.19,.128,['#2','#2',0],1]],
    [[.21,.31,-.21,.125,['pelvis','#0',.6]],[.21,.21,-.2,.12,['#0','#0',0]],[.215,.125,-.18,.112,['#0','#1',.6]],[.215,.065,-.2,.112,['#1','#2',.5]],[.215,.026,-.215,.126,['#2','#2',0],1],[.215,.003,-.215,.132,['#2','#2',0],1]],legP,9);
  return lpGeo('ER150|Titanshell|'+C,'Stoneshell',[shell,head,jaw,tail].concat(legs),152)}
function er150TitanKit(k,C,red){const T=ER150.TI,top=T.top,Y=T.Y,nz=er150Nz;
  const stone=dkShade(lpMain(C,.12).getHex(),.75),st2=dkShade(stone,.7),wall=0x7a7468,wall2=0x5e5a52,wallD=0x46423c,roof=0x3a3430,dark=0x0c0a08,wood=0x2a2018,moss=0x3e5a2a,moss2=0x2e4420,
    horn=0x8a8070,horn2=0x6a6254,ivory=0xb8ae94,eye=red?0xff2a2a:0xffb040,skin=new THREE.Color(C).lerp(new THREE.Color(0x4a4640),.6).multiplyScalar(.8).getHex();
  // the crag mound and the stone platform on top of the dome
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.2,r=.2+(i%3)*.02,x=Math.sin(a)*r,z=Math.cos(a)*r-.02;k.p('spine','dod','c',i%2?stone:st2,x,Math.min(Y-.03,top(x,z)+.02),z,.08,.05,.08,i,i*.7,0)}
  k.p('spine','cyl','c',wall2,0,Y-.025,-.02,.215,.05,.215,0,.2,0);k.p('spine','cyl','c',wall,0,Y-.002,-.02,.2,.012,.2,0,.2,0);
  // the keep: a square tower with dark windows, a broken crenellated top and a leaning spire
  const kx=-.05,kz=-.08;k.p('spine','box','c',wall,kx,Y+.115,kz,.13,.23,.13);k.p('spine','box','c',wallD,kx,Y+.012,kz,.15,.024,.15);
  [[1,1],[1,-1],[-1,-1]].forEach(([a,b])=>k.p('spine','box','c',wall2,kx+a*.05,Y+.25,kz+b*.05,.035,.04,.035));
  k.p('spine','box','c',wall2,kx+.02,Y+.235,kz,.09,.02,.13);
  k.p('spine','cone4','c',roof,kx-.01,Y+.31,kz,.07,.12,.07,0,Math.PI/4,.16);
  [[.1,0],[.17,-.02],[.17,.03]].forEach(([h,dx])=>k.p('spine','box','c',dark,kx+dx,Y+h,kz+.066,.022,.034,.008));
  k.p('spine','box','c',dark,kx,Y+.035,kz+.066,.04,.06,.008);
  [-1,1].forEach(s=>k.p('spine','box','c',dark,kx+s*.066,Y+.16,kz,.008,.035,.02));
  // a round turret with a cone roof
  k.p('spine','cyl','c',wall2,.12,Y+.065,-.13,.045,.13,.045);k.p('spine','cone','c',roof,.12,Y+.165,-.13,.06,.08,.06);k.p('spine','box','c',dark,.12,Y+.09,-.084,.014,.026,.006);
  // crumbled curtain walls round the platform, with crenels; two gaps are broken through
  for(let i=0;i<10;i++){if(i==0||i==4||i==7)continue;const a=i/10*Math.PI*2,x=Math.sin(a)*.19,z=Math.cos(a)*.19-.02,h=[0,.08,.06,.09,0,.05,.085,0,.07,.06][i];
    k.p('spine','box','c',i%2?wall:wall2,x,Y+h/2,z,.115,h,.03,0,a,0);
    if(h>.065)[-1,1].forEach(s=>k.p('spine','box','c',wall2,x+Math.cos(a)*s*.035,Y+h+.012,z-Math.sin(a)*s*.035,.025,.024,.032,0,a,0))}
  // rubble where the walls fell
  [[.11,.11],[.19,-.1],[-.17,-.12],[-.02,.08],[.06,-.2]].forEach(([x,z],i)=>k.p('spine','dod','c',i%2?wall2:wallD,x,Y+.012,z,.025,.018,.025,i,i,0));
  // the shrine gate at the front: two pillars and a cracked, sagging lintel, steps down onto the shell
  [-1,1].forEach(s=>{k.p('spine','cyl','c',wall,s*.065,Y+.08,.17,.02,.16,.02);k.p('spine','box','c',wallD,s*.065,Y+.006,.17,.05,.014,.05)});
  k.p('spine','box','c',wall2,-.02,Y+.17,.17,.12,.028,.04,0,0,.1);k.p('spine','box','c',wall2,.06,Y+.155,.17,.06,.026,.038,0,0,-.35);
  k.p('spine','box','c',wall2,0,Y-.03,.225,.12,.06,.05);k.p('spine','box','c',wallD,0,Y-.07,.27,.12,.07,.05);
  // a crag spire behind the keep and a dead tree in the court
  k.p('spine','cone4','c',st2,.07,Y+.09,-.2,.065,.2,.065,-.1,.4,-.1);k.p('spine','dod','c',stone,.1,Y+.03,-.2,.07,.06,.07);
  {const t=[[-.14,Y,.06],[-.15,Y+.07,.055],[-.13,Y+.13,.07],[-.155,Y+.19,.05]];for(let i=0;i<3;i++)k.L('spine','c',wood,t[i],t[i+1],.02-i*.005,.015-i*.004,5);
    [[1,[-.09,Y+.17,.1]],[2,[-.2,Y+.23,.09]],[2,[-.11,Y+.24,.02]],[1,[-.21,Y+.14,.03]]].forEach(([i,b])=>k.L('spine','c',wood,t[i],b,.008,.002,4))}
  // moss on the platform, vines and roots hanging from the shell rim, big rim scutes
  [[.1,.05],[-.1,.12],[.08,-.05]].forEach(([x,z],i)=>k.p('spine','ico','c',i%2?moss:moss2,x,Y+.004,z,.04,.008,.035));
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2,z=Math.cos(a)*.5-.02,P=er150Prof(T.shell,Math.max(-.49,Math.min(.45,z))),x=Math.sin(a)*P[1];
    k.p('spine','box','c',i%2?stone:st2,x*.985,P[0]-.005,z,.09,.035,.05,Math.cos(a)*.6,a,-Math.sin(a)*.25);
    if(i%2&&Math.abs(Math.sin(a))>.3){const L=.07+nz(i,1,2)*.08;k.L('spine','c',i%4==1?moss:0x3a3022,[x*.92,P[0]+.02,z],[x*1.02,P[0]-.01-L,z+.01],.012,.004,3)}}
  [[.24,.12],[-.27,-.06],[.2,-.3],[-.18,.28],[.33,-.12],[-.33,.12]].forEach(([x,z],i)=>k.p('spine','ico','c',i%2?moss:moss2,x,top(x,z)+.002,z,.06,.014,.05,0,i,0));
  // the head: heavy brow, glowing deep-set eyes, great curving horns, tusks, stone plates on the crown, a moss beard
  [-1,1].forEach(s=>{
    k.p('head','sph','c',dark,s*.118,.37,.63,.03,.024,.026,0,s*.55,0);k.p('head','sph','g',eye,s*.124,.371,.636,.018,.014,.014);
    k.p('head','box','c',st2,s*.1,.405,.62,.08,.026,.07,0,s*.4,s*.28);
    const H=[[s*.12,.41,.52],[s*.2,.44,.47],[s*.27,.49,.47],[s*.31,.55,.51],[s*.3,.6,.57]];
    for(let i=0;i<H.length-1;i++)k.L('head','c',i%2?horn2:horn,H[i],H[i+1],.05-i*.01,i==3?.003:.04-i*.01,6);
    for(let i=1;i<4;i++)k.p('head','tor','c',horn2,H[i][0],H[i][1],H[i][2],.05-i*.01,.012,.05-i*.01,0,0,s*(.6+i*.25));
    k.p('jaw','cone4','c',ivory,s*.085,.3,.69,.016,.07,.016,-.25,0,s*.2);
    for(let i=0;i<4;i++){const x=.02+i*.025,z=.6+i*.03,J=er150Prof(T.jaw,z),y0=J[0]-J[3]*Math.sqrt(Math.max(0,1-(x/J[1])**2))+.008; // v173: rooted in the jaw
      k.L('jaw','c',i%2?moss:moss2,[s*x,y0,z],[s*(.025+i*.028),.13+i*.01,z-.01],.016,.004,3)}
    k.p('head','sph','c',dark,s*.03,.33,.79,.01,.008,.008)});
  [[0,.46,.55],[0,.455,.62],[.06,.44,.58],[-.06,.44,.58],[0,.44,.48]].forEach((q,i)=>k.p('head','dod','c',i%2?st2:stone,q[0],q[1],q[2],.04,.022,.04,i,0,0));
  k.p('head','cone4','c',0x1e1c18,0,.3,.785,.035,.05,.03,Math.PI*.85,0,0);
  // pillar legs: stone bands and toe nails
  [['fl0',.205,.19,.21],['fr0',-.205,.19,.21],['hl0',.215,-.215,.21],['hr0',-.215,-.215,.21]].forEach(q=>{const x=q[0][1]=='l'?-Math.abs(q[1]):Math.abs(q[1]);k.p(q[0],'tor','c',st2,x,q[3],q[2]-.01,.122,.03,.122)});
  [['fl2',-.205,.19],['fr2',.205,.19],['hl2',-.215,-.215],['hr2',.215,-.215]].forEach(f=>[-.7,-.25,.25,.7].forEach(a=>k.p(f[0],'box','c',ivory,f[1]+Math.sin(a)*.125,.022,f[2]+Math.cos(a)*.125,.04,.036,.022,0,a,0)));
  // tail: a stone plate on top
  k.p('tail0','dod','c',st2,0,.33,-.5,.05,.025,.06);
  void skin;
}
// =====================================================================================================================
// Mossfrog rig: Bogmaw
// =====================================================================================================================
ER150.BG={body:[[.555,.265,.08,.025,.012],[.52,.27,.18,.055,.016],[.46,.275,.26,.09,.02],[.38,.275,.31,.13,.026],[.3,.265,.34,.17,.045],[.22,.25,.36,.2,.12],[.12,.24,.38,.23,.18],[0,.23,.38,.24,.19],[-.12,.22,.35,.22,.18],[-.24,.21,.28,.17,.16],[-.32,.2,.17,.1,.11],[-.36,.2,.04,.03,.03]],
  jaw:[[.24,.235,.33,.025,.14],[.32,.235,.32,.02,.12],[.4,.24,.29,.018,.09],[.47,.245,.24,.015,.062],[.53,.25,.16,.012,.036],[.565,.255,.07,.01,.016]]};
ER150.BG.top=(x,z)=>er150Top(ER150.BG.body,x,z)-.01;
// underside of the lower jaw at (x,z), and the tips of the barbel tendrils hanging from it
ER150.BG.bot=(x,z)=>{const P=er150Prof(ER150.BG.jaw,z);return P[0]-P[3]*Math.sqrt(Math.max(0,1-(x/P[1])**2))+.006};
ER150.BG.barb=[[.07,.48],[.15,.44],[.22,.38]];
{const B=LPR.Mossfrog,g0=B.geo,k0=B.kit,A0={head:B.head,back:B.back,up:B.up};
  const AN={Bogmaw:{head:['head',0,.42,.36],up:.1,back:[['chest',0,.47,.14],['spine',0,.48,.02],['spine',0,.47,-.1],['pelvis',0,.42,-.22]]}};
  ['head','back','up'].forEach(f=>Object.defineProperty(B,f,{configurable:true,enumerable:true,get(){const s=RV137.cur.Mossfrog;return AN[s]?AN[s][f]:A0[f]},set(v){A0[f]=v}}));
  B.geo=function(C,c){if(er150Sp('Mossfrog',c)=='Bogmaw')return er150BogGeo(C);return g0.apply(this,arguments)};
  B.kit=function(k,c,C,red){if(er150Sp('Mossfrog',c)=='Bogmaw')return er150BogKit(k,C,red);return k0.apply(this,arguments)};
}
function er150BogGeo(C){const T=ER150.BG,nz=er150Nz;
  const skin=lpMain(C,.3).multiplyScalar(.8),back=skin.clone().multiplyScalar(.6),blot=skin.clone().lerp(new THREE.Color(0x14180e),.65),sick=new THREE.Color(0x8a8a4a),
    belly=new THREE.Color(0xa8a27a),bellyD=new THREE.Color(0x7a7456),mouth=new THREE.Color(0x4a1418),gum=new THREE.Color(0x7a2a2a);
  const bb=z=>z>.3?['head','head',0]:z>.22?['neck','head',.5]:z>.15?['chest','neck',.4]:z>.06?['spine','chest',.6]:z>-.06?['spine','spine',0]:z>-.18?['pelvis','spine',.4]:['pelvis','pelvis',0];
  const body={rings:er150Rows(T.body,bb),seg:14,capA:1,capB:1,paint:(o,r,s,c,i)=>{
    if(r.z>.28&&s<-.5){o.copy(mouth);return}
    o.copy(skin);if(s>.55)o.lerp(back,.65);const n=nz(i,s,c);if(s>-.1&&n>.7)o.copy(blot);else if(s>-.2&&n<.12)o.lerp(sick,.5);
    if(s<-.35){o.copy(belly);if(n>.6)o.copy(bellyD)}}};
  const jaw={rings:er150Rows(T.jaw,(z,i)=>i<1?['chest','jaw',.3]:i<2?['head','jaw',.65]:['jaw','jaw',0]),seg:12,capB:1,paint:(o,r,s,c,i)=>{
    if(s>.6){o.copy(i%2?gum:mouth);return}o.copy(belly);if(s>.1)o.copy(skin).lerp(blot,.3);if(er150Nz(i,c,s)>.7)o.multiplyScalar(.82)}};
  const legP=(o,r,sn,c,i)=>{o.copy(skin);if(er150Nz(i,sn,c)>.72)o.copy(blot);if(r.y<.06)o.multiplyScalar(.8)};
  const legs=er150Legs(
    [[.25,.18,.15,.07,['chest','#0',.5]],[.29,.11,.17,.06,['#0','#1',.6]],[.305,.055,.18,.05,['#1','#2',.6]],[.31,.022,.2,.044,['#2','#2',0]]],
    [[.24,.21,-.16,.11,['pelvis','#0',.5]],[.32,.16,-.1,.095,['#0','#0',0]],[.35,.1,-.05,.07,['#0','#1',.6]],[.335,.055,-.15,.056,['#1','#1',0]],[.32,.032,-.22,.044,['#1','#2',.5]],[.31,.018,-.25,.034,['#2','#2',0]]],legP,7);
  return lpGeo('ER150|Bogmaw|'+C,'Mossfrog',[body,jaw].concat(legs),153)}
function er150BogKit(k,C,red){const T=ER150.BG,top=T.top,nz=er150Nz;
  const skin=lpMain(C,.3).multiplyScalar(.8).getHex(),dk=dkShade(skin,.55),lid=dkShade(skin,.75),wart=dkShade(skin,1.2),eye=red?0xff2a2a:0xd8e040,tooth=0xd8ceb0,toothD=0xa89c7c,
    lure=0xc8ff6a,fun=0x6a5238,fun2=0x4a3a28,cap=0x7a6a4a,glow=0x9aff5a,weed=0x2e3a1e,bel=0xa8a27a;
  const bn=z=>z>.28?'head':z>.12?'chest':z>-.1?'spine':'pelvis';
  // three pairs of small sunken eyes: two set wide on the brow, two smaller pairs behind
  [-1,1].forEach(s=>{[[.19,.37,.035],[.11,.33,.022],[.25,.3,.02]].forEach(([x,z,r],i)=>{const y=ER150.BG.top(x,z)+.006,a=s*(.35+x),f=[Math.sin(a),.3,Math.cos(a)];
      k.p('head','sph','c',0x0a0806,s*x,y,z,r*1.3,r*.9,r*1.2,0,a,0);
      k.p('head','sph','g',eye,s*x+f[0]*r*.55,y+r*.3,z+f[2]*r*.55,r*.9,r*.7,r*.75,0,a,0);
      k.p('head','box','c',0x050505,s*x+f[0]*r*1.28,y+r*.3,z+f[2]*r*1.28,r*.14,r*.66,r*.1,0,a,0);
      k.p('head','dod','c',lid,s*x-f[0]*r*.2,y+r*1.0,z-f[2]*r*.25,r*1.4,r*.38,r*1.1,0,a,s*.3)})});
  // the maw: a dark seam, crooked needle teeth top and bottom across the whole front
  const lip=a=>[Math.sin(a)*.33,.28+Math.cos(a)*.275];
  for(let i=0;i<14;i++){const a=-1.32+i/13*2.64,[x,z]=lip(a),[x2,z2]=lip(a+2.64/13);k.L('head','c',0x1a0a0a,[x,.248,z],[x2,.248,z2],.01,.01,3)}
  for(let i=0;i<17;i++){const a=-1.25+i/16*2.5,[x,z]=lip(a),L=.028+nz(i,2,3)*.03;k.p('head','cone4','c',i%3?tooth:toothD,x*.97,.25-L*.4,z-.01,.008,L,.008,Math.PI+(nz(i,1,1)-.5)*.5,0,(nz(i,3,1)-.5)*.5)}
  for(let i=0;i<14;i++){const a=-1.18+i/13*2.36,[x,z]=lip(a),L=.022+nz(i,5,3)*.026;k.p('jaw','cone4','c',i%2?tooth:toothD,x*.94,.255+L*.35,z-.015,.007,L,.007,(nz(i,4,4)-.5)*.5,0,(nz(i,6,2)-.5)*.4)}
  k.p('jaw','sph','c',0x8a2a3a,0,.255,.38,.13,.018,.12);
  // the angler lure on the brow: a bony stalk arching forward with a glowing bulb and a little hook of flesh
  {const P=[[0,.41,.34],[0,.5,.36],[0,.57,.42],[0,.585,.5],[0,.55,.57]];for(let i=0;i<P.length-1;i++)k.L('head','c',i%2?dk:dkShade(skin,.7),P[i],P[i+1],.02-i*.003,.017-i*.003,5);
    k.p('head','sph','g',lure,0,.525,.585,.032,.034,.032);k.p('head','sph','c',dk,0,.555,.58,.018,.01,.018);k.L('head','c',dk,[0,.495,.59],[.008,.47,.6],.006,.002,3)}
  // barbel tendrils hanging from the lower jaw, and two long feelers from the mouth corners
  const jb=ER150.BG.bot;
  [-1,1].forEach(s=>{ER150.BG.barb.forEach(([x,z],i)=>{const y0=jb(x,z),a=[s*x,y0,z],b=[s*(x+.01),y0-.035-i*.004,z+.02],c=[s*(x+.025),y0-.06-i*.006,z+.012];
      k.L('jaw','c',i%2?dk:lid,a,b,.014,.008,4);k.L('jaw','c',i%2?dk:lid,b,c,.008,.003,4)});
    {const a=[s*.31,.25,.33],b=[s*.37,.2,.37],c=[s*.41,.15,.36],d=[s*.43,.12,.31];k.L('head','c',dk,a,b,.016,.011,4);k.L('head','c',dk,b,c,.011,.007,4);k.L('head','c',dk,c,d,.007,.002,4)}});
  // warts and pustules all over the back and flanks
  for(let i=0;i<36;i++){const z=-.3+nz(i,1,7)*.66,a=(nz(i,3,9)-.5)*2.6,P=er150Prof(T.body,z),x=Math.sin(a)*P[1]*.97,y=P[0]+Math.cos(a)*P[2]*.95,r=.014+nz(i,5,6)*.022;
    if(z>.3&&Math.abs(x)<.28&&y>.33)continue;k.p(bn(z),i%4?'ico':'sph','c',i%3?wart:lid,x,y,z,r,r*.6,r)}
  [[.12,.06],[-.15,-.04],[.06,-.16],[-.05,.13],[.2,-.12],[-.22,.1]].forEach(([x,z],i)=>{const y=top(x,z);k.p(bn(z),'sph','c',0x8a8a50,x,y+.006,z,.028,.018,.028);k.p(bn(z),'sph','c',0xb0a860,x,y+.018,z,.012,.008,.012)});
  // fungal growths: a cluster of toadstools on the back, shelf fungi on the flanks, glowing spore dots
  [[.08,-.05,.08],[.02,-.09,.06],[.12,-.11,.05],[-.12,.0,.07],[-.08,.04,.05]].forEach(([x,z,h],i)=>{const y=top(x,z),b=bn(z),tp=[x+(i%2?.01:-.01),y+h,z];
    k.L(b,'c',0x9a9078,[x,y-.01,z],tp,.012,.009,5);k.p(b,'hem','c',i%2?cap:fun,tp[0],tp[1]-.004,tp[2],.035+h*.15,.026,.035+h*.15);k.p(b,'cyl','c',0xb8a888,tp[0],tp[1]-.003,tp[2],(.035+h*.15)*.96,.004,(.035+h*.15)*.96);k.p(b,'sph','g',glow,tp[0]+.012,tp[1]+.018,tp[2],.006)});
  [-1,1].forEach(s=>{[[.05,.06],[-.08,.05],[-.2,.04]].forEach(([z,dy],i)=>{const P=er150Prof(T.body,z),y=P[0]+dy,xx=s*(P[1]*Math.sqrt(Math.max(0,1-(dy/P[2])**2))-.02);
      for(let j=0;j<2;j++)k.p(bn(z),'hem','c',j?fun:fun2,xx+s*.02,y-j*.035,z+j*.02,.055-j*.012,.018,.045-j*.01,0,0,-s*.25)});
    // weed strands hanging off the flanks
    [.15,0,-.15].forEach((z,i)=>{const P=er150Prof(T.body,z),x=s*P[1]*.96,y=P[0]-.02;k.L(bn(z),'c',weed,[x,y,z],[x+s*.015,y-.09-i*.01,z-.01],.014,.003,3)})});
  // webbed feet: three splayed toes with knobbed tips
  [['fl2',-.31,.2,1.1],['fr2',.31,.2,1.1],['hl2',-.31,-.25,1.35],['hr2',.31,-.25,1.35]].forEach(f=>{
    k.p(f[0],'box','c',dkShade(skin,.75),f[1],.012,f[2]+.03*f[3],.09*f[3],.012,.065*f[3]);
    [-1,0,1].forEach(i=>{const a=i*.55+(f[1]<0?-.3:.3),L=.075*f[3],x=f[1]+Math.sin(a)*L,z=f[2]+Math.cos(a)*L;
      k.L(f[0],'c',dkShade(skin,.85),[f[1],.014,f[2]],[x,.012,z],.016,.011,4);k.p(f[0],'sph','c',bel,x,.014,z,.015,.011,.015)})});
}
// =====================================================================================================================
// evolution looks for the new bodies (the base species keep their v100 designs)
// =====================================================================================================================
{const D=EVO100.D.Stoneshell,b0=D.build;D.build=function(E,L,P,c){const sp=RV137.cur.Stoneshell;if(sp=='Cragback')return er150CragEvo(E,L,P);if(sp=='Titanshell')return er150TitanEvo(E,L,P);return b0.apply(this,arguments)}}
{const D=EVO100.D.Mossfrog,b0=D.build;D.build=function(E,L,P,c){if(RV137.cur.Mossfrog=='Bogmaw')return er150BogEvo(E,L,P);return b0.apply(this,arguments)}}
// Cragback (levels 1, 2, 3, 5): moss in the crevices → glowing rune rim and lit crystal tips → knee spikes, glowing moss,
// a second horn pair → a crystal crown on the brow and glowing veins down the ridge
function er150CragEvo(E,L,P){const R=E.R,moss=0x4a6a2a,moss2=0x3a5a22,T=ER150.CR,hb={bn:'head'},sb={bn:'spine'};
  [[.15,.2],[-.16,.05],[.1,-.18],[-.08,-.32],[.25,-.06]].slice(0,L>=2?5:3).forEach((q,i)=>{const t=E.top(q[0],q[1]);if(!t)return;E.pd('ico','c',i%2?moss:moss2,t.p,t.n,[.06,.018,.05]);
    for(let j=0;j<3;j++){const a=j*2.1+i;E.L(t.p,E.add(t.p,E.nrm([t.n[0]+Math.cos(a)*.6,1,t.n[2]+Math.sin(a)*.6]),.04+.01*L),.01,.002,'c',0x5a8a3a,3)}});
  if(L>=2){// glowing runes round the rim, glowing tips on the tallest ridge blades
    for(let i=0;i<8;i++){const a=i/8*6.283+.2,h=E.on([Math.sin(a)*.8,.25,Math.cos(a)*.9-.02],[-Math.sin(a),0,-Math.cos(a)]);if(h&&h.p[1]>.18&&h.p[1]<.3)E.rune(h,[0,1,0],.04,P.glow)}
    [[.07,.22],[-.05,.23],[-.17,.2]].forEach(([z,h])=>{const y=T.top(0,z)+h*.42,tip=[0,y+h*.42*Math.cos(.42),z-h*.42*Math.sin(.42)];E.pd('oct','g',P.glow,tip,[0,1,-.4],[.016,.036,.016],null,sb)})}
  if(L>=3){// spiked knee plates, glowing moss, a second pair of horns
    [['fl1',-.172,.17,.26],['fr1',.172,.17,.26]].forEach(q=>E.L([q[1],q[2],q[3]],[q[1]*1.15,q[2]+.03,q[3]+.06],.02,.002,'c',P.mainD,4,{bn:q[0]}));
    [[.12,.08],[-.15,-.18]].forEach(q=>{const t=E.top(q[0],q[1]);if(t)E.pd('ico','g',P.glowD,E.add(t.p,t.n,.006),t.n,[.045,.01,.035])});
    [-1,1].forEach(s=>E.horn([s*.05,.38,.53],[s*.3,.7,-.6],[0,-.02,-.03],.12,.022,'c',0x8a8678,5,hb,0x5a5850))}
  if(L>=4){// glowing cracks in the ridge base
    for(let i=0;i<6;i++){const z=.25-i*.11,t=E.top(.05,z),t2=E.top(.05,z-.11);if(t&&t2)E.L(E.add(t.p,t.n,.004),E.add(t2.p,t2.n,.004),.008,.008,'g',P.glowD,3,{vs:1})}}
  if(L>=5){// crystal crown on the brow, more crystals on the flanks
    for(let i=-2;i<=2;i++)E.L([i*.026,.39,.53],[i*.045,.47-Math.abs(i)*.022,.5],.012,.002,'g',P.glow,4,hb);
    [[.3,.05],[-.3,-.2]].forEach(q=>{const t=E.top(q[0],q[1]);if(!t)return;for(let i=0;i<3;i++){const a=i*2.1;E.L(E.add(t.p,t.n,-.02),E.add(t.p,E.nrm([t.n[0]+Math.cos(a)*.4,1,t.n[2]+Math.sin(a)*.4]),.1-i*.02),.024,.003,i%2?'c':'g',i%2?0x2a4a5a:P.glow,4)}})}
}
// Titanshell (levels 2, 3, 4, 5): lit windows and wall braziers → glowing runes round the rim and tattered banners →
// a floating heart crystal in the shrine gate and glowing cracks down the dome → a beacon on the keep, glowing horn tips
function er150TitanEvo(E,L,P){const Y=ER150.TI.Y,sb={bn:'spine'},hb={bn:'head'},kx=-.05,kz=-.08;
  // L2: lit windows in the keep and turret, braziers on the walls
  [[.1,0],[.17,-.02],[.17,.03]].forEach(([h,dx])=>E.p('box','g',P.glow,[kx+dx,Y+h,kz+.068],[.016,.026,.006],null,sb));
  E.p('box','g',P.glowD,[kx,Y+.035,kz+.068],[.03,.045,.006],null,sb);E.p('box','g',P.glow,[.12,Y+.09,-.082],[.01,.02,.006],null,sb);
  [[3,.09],[6,.085]].forEach(([i,h])=>{const a=i/10*Math.PI*2,x=Math.sin(a)*.19,z=Math.cos(a)*.19-.02;E.p('cyl','m',P.metal,[x,Y+h+.008,z],[.018,.02,.018],null,sb);E.p('oct','g',P.glow2,[x,Y+h+.032,z],[.014,.03,.014],null,sb)});
  if(L>=3){// runes round the shell rim, banners on the keep and the turret
    for(let i=0;i<10;i++){const a=i/10*6.283+.3,h=E.on([Math.sin(a)*.9,.36,Math.cos(a)*1-.02],[-Math.sin(a),0,-Math.cos(a)]);if(h&&h.p[1]>.3&&h.p[1]<.45)E.rune(h,[0,1,0],.045,P.glow)}
    [[kx+.05,Y+.25,kz+.05,.15],[.12,Y+.19,-.13,.1]].forEach(([x,y,z,hh])=>{E.L([x,y,z],[x,y+hh,z],.004,.004,'m',P.metal,4,sb);
      E.fan([x,y+hh,z],[[x,y+hh-.005,z],[x+.075,y+hh-.02,z+.01],[x+.06,y+hh-.06,z+.012],[x+.08,y+hh-.09,z+.01],[x,y+hh-.08,z]],P.mainD,P.glowD,'c',sb)})}
  if(L>=4){// a heart crystal floating in the gate, glowing cracks down the dome from the platform
    E.pd('oct','g',P.glow,[0,Y+.08,.17],[0,1,0],[.03,.055,.03],null,sb);E.L([0,Y+.166,.17],[0,Y+.12,.17],.003,.003,'m',P.metal,4,sb);E.pd('oct','g',P.glow2,[0,Y+.08,.17],[0,1,0],[.015,.03,.015],null,sb);
    for(let k=0;k<8;k++){const a=k/8*6.283+.2;let pr=null;for(let i=0;i<5;i++){const r=.23+i*.045,w=Math.sin(i*1.7+k)*.06,t=E.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=E.add(t.p,t.n,.004);
      if(pr)E.L(pr,q,.009-i*.001,.008-i*.001,'g',i<2?P.glow:P.glowD,3,{vs:1});pr=q}}}
  if(L>=5){// a beacon flame on the keep, glowing horn tips, a gilded band on the brow
    E.pd('oct','g',P.glow,[kx-.02,Y+.4,kz],[0,1,0],[.028,.05,.028],null,sb);E.pd('oct','g',P.glow2,[kx-.02,Y+.4,kz],[0,1,0],[.014,.03,.014],null,sb);
    [-1,1].forEach(s=>E.pd('oct','g',P.glow,[s*.3,.6,.57],[s*-.1,.5,.6],[.012,.026,.012],null,hb));
    E.L([-.11,.43,.6],[.11,.43,.6],.008,.008,'m',P.trim,5,hb)}
}
// Bogmaw (levels 1, 2, 3, 5): glowing pustules → a moss cloak with glowing spore caps → bone charms on the jaw tendrils,
// bony brow spurs → a crown of glowing spines down the back, more lures and glowing eye rims
function er150BogEvo(E,L,P){const M=EVO100_M,moss=0x4a6a2a,hb={bn:'head'},jb={bn:'jaw'};
  [[.1,.02],[-.12,-.08],[.16,-.18],[-.04,.16],[.0,-.12],[-.2,.06],[.24,.04],[-.18,-.2]].slice(0,L>=2?8:5).forEach(q=>{const t=E.top(q[0],q[1]);if(t)E.pd('sph','g',P.glow,E.add(t.p,t.n,.006),t.n,[.02,.014,.02])});
  [-1,1].forEach(s=>{const h=E.on([s*.8,.3,-.02],[-s,0,0]);if(h)E.rune(h,[0,0,1],.055,P.glowD)});
  if(L>=2){// moss cloak over the back with hanging strands, glowing spore caps
    E.shell((x,y,z,nx,ny)=>ny>.55&&z<.12&&z>-.3&&Math.abs(x)>.12,.01,'c',(x,y,z,i)=>i%3?0x2e3e1c:0x26341a,{rimCol:0x1e2a14});
    [-1,1].forEach(s=>[.08,-.08,-.2].forEach(z=>{const h=E.on([s*.8,.4,z],[-s,-.4,0]);if(h)E.L(h.p,E.add(h.p,[s*.02,-.09,-.01]),.012,.002,'c',moss,3)}));
    [[.2,-.04],[-.16,.1],[.06,.12]].forEach(q=>{const t=E.top(q[0],q[1]);if(!t)return;const tp=E.add(t.p,t.n,.05);E.L(t.p,tp,.009,.007,'c',0xc8bc98,4);E.pd('hem','g',P.glowD,tp,t.n,[.026,.018,.026]);E.pd('cyl','c',0xb8a888,E.add(tp,t.n,.001),t.n,[.025,.003,.025])})}
  if(L>=3){// bone charms on the barbels, bony spurs over the eyes
    [-1,1].forEach(s=>ER150.BG.barb.forEach(([x,z],i)=>{if(i==1)return;M.charm(E,[s*(x+.025),ER150.BG.bot(x,z)-.06-i*.006,z+.012],.045,P.bone,'tooth',jb)}));
    [-1,1].forEach(s=>E.horn([s*.2,.43,.36],[s*.5,.8,-.3],[0,0,-.02],.075,.018,'c',P.boneD,4,hb))}
  if(L>=4){// glowing rims round the main eyes
    [-1,1].forEach(s=>{const c=[s*.21,.39,.39];for(let k=0;k<8;k++){const a=k/8*6.283,a2=(k+1)/8*6.283,r=.05;E.L([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r*.8,c[2]+.01],[c[0]+Math.cos(a2)*r,c[1]+Math.sin(a2)*r*.8,c[2]+.01],.005,.005,'g',P.glow,3,hb)}})}
  if(L>=5){// a crown of glowing spines down the back, two more lure bulbs
    for(let i=-1;i<=1;i++)[.1,-.04,-.18].forEach(z=>{const t=E.top(i*.12,z);if(t)E.L(E.add(t.p,t.n,-.005),E.add(t.p,E.nrm([i*.3,1,-.5]),.09),.016,.002,'g',P.glow2,4)});
    [-1,1].forEach(s=>{const P0=[s*.13,.44,.31],P1=[s*.2,.53,.38],P2=[s*.24,.5,.45];E.L(P0,P1,.009,.007,'c',P.mainD,4,hb);E.L(P1,P2,.007,.005,'c',P.mainD,4,hb);E.pd('ico','g',P.glow,P2,[0,1,0],.018,null,hb)})}
}
