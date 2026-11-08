// ================= v207: the owner's list (Nov 8 2026) — places and models =================
// Owner: "When walking up to the hilltop in hillside crest II, the camera jerks around a lot because it's colliding with terrain.
// Think of a easy solution for this part of the map" · "The end point where you complete hilltop ascent needs to be redone
// visually. Its just a few rocks and a black square."
//  1. The Pilgrim's Stair camera (SC207): while the hero is on Mistmere's mountain trail (th165's plan box, Hillside Crest II) the
//     v192 edge rule is off (the trail is cut into rock tiles that are all "edge", so the camera was pulled in and let out at
//     every turn of the switchbacks) and the camera simply rides above the ground under its whole line to the hero (the highest
//     ground along it + SC207.clr), eased; houses and rocks between it and the hero are cut away as everywhere (3190).
//  2. The summit crack (ch153Crack, the Ascent's finish, CH207|crack): two great leaning cliff walls meeting overhead, a boulder
//     wedged in the cleft, the passage running back into the mountain in darkening rock slabs to a thin line of daylight (instead of
//     a black slab), worn slabs on its floor, prayer flags across the mouth, cairns, scree and an ember bowl by the way in.
// Co-op: both are local and deterministic (seeded with ch153R; the camera is each player's own).
var SC207={clr:1.25,on:true,n:0};
function sc207On(){if(!SC207.on)return false;try{const I=curIns();if(!I||I.g!==6||typeof th165Plan!='function')return false;const P=th165Plan();if(!P||!P.bb)return false;
  const [x0,z0,x1,z1]=P.bb,p=pl.position;return p.x>x0-3&&p.x<x1+3&&p.z>z0-3&&p.z<z1+3}catch(_){return false}}
{const f=cam172Reach;cam172Reach=function(P,yaw,pitch,d){if(sc207On()){SC207.n++;return d}return f.apply(this,arguments)}}
{const f=cam172Hold;cam172Hold=function(P,c){if(sc207On())return;return f.apply(this,arguments)}}
{const f=cam157Floor;cam157Floor=function(P,c){if(!sc207On())return f.apply(this,arguments);
  const dx=c.x-P.x,dz=c.z-P.z,L=Math.hypot(dx,dz);let g=GH(c.x,c.z);if(L>.3)for(let s=.5;s<=L;s+=.5)g=Math.max(g,GH(P.x+dx*s/L,P.z+dz*s/L));return g+SC207.clr}}

// ---------------- the summit crack ----------------
ch153Crack=function(){return lgGroup('CH207|crack',q=>{const C=CH153M,R=ch153R(2077),rk=C.rock,sh=(c,f)=>dkShade(c,f),pk=()=>rk[Math.floor(R()*rk.length)];
  // the two cliff walls, leaning in so they nearly meet overhead
  [-1,1].forEach(s=>{
    q.p('','box','c',sh(rk[2],.95),s*3.5,4.4,-1.4,3.2,8.8,5.4,0,0,s*.1);
    q.p('','box','c',sh(rk[0],.9),s*5.4,3.2,-.6,2.8,6.4,4.6,0,s*.25,s*.06);
    for(let i=0;i<5;i++){const sz=1.3+R()*1.2;q.p('','dod','c',pk(),s*(2.6+R()*2.4),7.4+R()*2.2,-1.2+(R()-.5)*3,sz,sz*1.3,sz,R()*3,R()*3,R()*3)}   // the jagged crests
    for(let i=0;i<4;i++){const sz=.9+R()*1.0;q.p('','dod','c',pk(),s*(2.3+R()*1.6),sz*.55,.9+R()*1.6,sz,sz*.9,sz,R()*3,R()*3,R()*3)}               // boulders at the foot
    for(let i=0;i<7;i++){const sz=.18+R()*.22;q.p('','dod','c',pk(),s*(1.25+R()*1.1),sz*.4,.4+R()*2.4,sz,sz*.7,sz,R()*3,R()*3,R()*3)}           // scree
    // the passage's walls: slabs stepping back into the mountain, narrowing and darkening with depth
    for(let i=0;i<6;i++){const z=-.4-i*1.15,x=s*(1.32-i*.1+(R()-.5)*.08),k=1-.13*i;
      q.p('','box','c',sh(pk(),k),x+s*.25,3.0-i*.12,z,.55,6.2-i*.35,1.3,(R()-.5)*.06,(R()-.5)*.2,s*(.13+i*.02));
      q.p('','dod','c',sh(pk(),k*.92),x+s*.05,.9+R()*3.4,z+(R()-.5)*.5,.32+R()*.2,.5+R()*.3,.3,R()*3,R()*3,R()*3)}});
  // the wedged boulder high in the cleft, and a smaller one under it
  q.p('','dod','c',rk[1],.1,6.9,-1.7,1.15,.95,1.05,.4,.9,.2);q.p('','dod','c',sh(rk[3],.85),-.25,5.95,-2.4,.55,.48,.5,1.1,.3,.7);
  // the far end: deep shadow, then a thin line of daylight where the crack opens onto the high plains
  q.p('','box','c',0x161411,0,2.6,-7.6,1.6,5.4,.3);
  q.p('','box','g',0x8a9cab,0,2.2,-7.42,.16,3.4,.04,0,0,.03);q.p('','box','g',0x5f6e7a,0,2.3,-7.44,.42,3.9,.03,0,0,.03);
  // the floor of the passage: worn slabs going in
  for(let i=0;i<7;i++){const z=1.2-i*1.2,w=1.9-i*.12;q.p('','box','c',sh(i%2?0x7a7266:0x6a645a,1-.1*i),(R()-.5)*.15,.03,z,w,.08,1.0,0,(R()-.5)*.25,0)}
  // prayer flags strung across the mouth
  q.L('','c',C.rope,[-1.75,5.4,.5],[1.75,5.1,.5],.02,.02,4);
  const FC=[0x8a2a1a,0xb89a50,0x3a5a3a,0x4a4a6a,0xc8bea0];for(let i=0;i<9;i++){const t=(i+.5)/9,x=-1.7+3.4*t,y=5.4-.3*t-.25*Math.sin(t*Math.PI);q.S('',FC[i%5],x,y,.5,.2,.32,0,.1,i)}
  // cairns by the way in, and an ember bowl (a waymark for the last stretch)
  [[-2.1,2.2],[2.25,1.7]].forEach(([x,z],j)=>{for(let k=0;k<5;k++)q.p('','dod','c',pk(),x+(R()-.5)*.08,.14+k*.22,z,.34-k*.05,.15,.3-k*.045,R(),R()*3,R())});
  q.p('','cyl','c',sh(rk[2],.8),-2.75,.32,.6,.42,.5,.42);q.p('','cyl','c',0x2a241e,-2.75,.58,.6,.36,.06,.36);
  for(let i=0;i<5;i++)q.p('','oct','g',i%2?0xff7a2a:0xffb040,-2.75+(R()-.5)*.4,.66+R()*.06,.6+(R()-.5)*.4,.07+R()*.05,.06,.07)},0)};
