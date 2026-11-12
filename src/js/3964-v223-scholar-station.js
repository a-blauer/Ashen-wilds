// ================= v223: the Scholar's Tower gets a reading desk to walk up to =================
// Owner (Nov 12 2026): "Make the scholar's tower have a little station to interact with instead of just walking up to a blank
// tower." The tower (KDU.tower, 1030; v196 corner dressing) had nothing in front of its door: the F prompt (st200Prompt, 3700)
// simply came up near the door spot. Now a scholar's lectern stands on the paved front of the lot, left of the door (lot-local
// ST223.x / ST223.z, its reading side turned toward the path to the door), and the prompt comes up there too (ST223.r); the old
// door spot still works.
// The lectern: a stone plinth, a turned dark-wood pedestal with an iron collar, a slanted reading board with a ledge, a great
// open book (leather boards, page block, ink lines, a red ribbon, a faint glowing sigil), a brass candle tray with two
// candles and wax drips, an ink pot with a quill, a stack of closed books, a scroll rack with rolled scrolls and a skull
// with a candle on the plinth. It is built into the tower's own kit (one merged mesh per material, like the tower itself:
// no new draw calls), so it follows the tower's lot, its quarter turns (SH.rot) and every level; one round collider.
// The tower is baked under its own cache key (KDU|tower223|n) and gets the v190 decoration shading (dc190Shade).
// Co-op: scenery from the shared kingdom (tower level and lot), fixed numbers only; the prompt is local, as before.
var ST223={on:true,x:-1.5,z:2.3,ry:.72,s:1.15,r:1.7,col:.45,k:null};
function st223Lect(k){const W=0x3a281c,WD=0x2a1d14,ST=0x5e5a66,IR=0x2c2c32,BR=0xa8843a,PG=0xd9cba6,LE=0x4a1a1c;
  const at=(M0,x,y,z,rx,ry,rz,sx,sy,sz)=>M0.clone().multiply(dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
  // plinth: two stepped octagonal stones
  dc190L(k,'c',ST,[[0,0],[.36,0],[.37,.06],[.34,.1],[0,.1]],8,0,0,0,Math.PI/8,1,'stone');
  dc190L(k,'c',0x6a6672,[[0,.1],[.25,.1],[.26,.15],[.24,.18],[0,.18]],8,0,0,0,0,1,'stone');
  // the pedestal: a turned column, an iron collar under the top
  dc190L(k,'c',W,[[0,.18],[.13,.18],[.135,.22],[.09,.27],[.065,.34],[.075,.45],[.06,.6],[.07,.72],[.1,.76],[.11,.8],[.07,.84],[0,.84]],10,0,0,0,0,1,'wood');
  dc190L(k,'m',IR,[[.072,.7],[.088,.71],[.088,.75],[.072,.76]],10,0,0,0,0,1,'iron');
  // three carved feet round the foot of the column
  for(let i=0;i<3;i++){const a=i/3*6.283+.5,c=Math.cos(a),s=Math.sin(a);dc190Beam(k,'c',WD,[c*.09,.32,s*.09],[c*.24,.19,s*.24],.05,.07,'wood');dc190L(k,'c',WD,[[0,0],[.035,0],[.04,.03],[0,.05]],6,c*.24,.18,s*.24,0,1,'wood')}
  // the slanted reading board (front edge toward the reader, +z, lower)
  const T=dt168Mx(0,.98,0,.42,0,0);
  dc190P(k,'c',W,dt168BBox(.66,.04,.5,.012,1),at(T,0,0,0),'board');
  dc190P(k,'c',WD,dt168BBox(.7,.07,.035,.01,1),at(T,0,.02,.265),'wood');                // the ledge the book rests on
  [-1,1].forEach(s=>dc190P(k,'c',WD,dt168BBox(.03,.05,.5,.008,1),at(T,s*.34,.015,0),'wood'));
  dc190Beam(k,'c',WD,[0,.84,0],[0,.97,-.08],.08,.06,'wood');                              // the bracket under the board
  // the open book: leather boards, two page blocks bowed up to the spine, ink lines, a ribbon, a sigil
  dc190P(k,'c',LE,dt168BBox(.56,.018,.38,.006,1),at(T,0,.03,.01),'plain');
  [-1,1].forEach(s=>{dc190P(k,'c',PG,dt168BBox(.26,.03,.35,.006,1),at(T,s*.135,.052,.01,0,0,-s*.07),'plain');
    for(let i=0;i<7;i++){const w=i==6?.1:.17+((i*7)%3)*.012;dc190P(k,'c',0x2a2018,dt168Geo('dcCube',()=>new THREE.BoxGeometry(1,1,1)),at(T,s*.135,.069,-.13+i*.038,0,0,-s*.07,w,.002,.008),'plain')}});
  dc190P(k,'c',0x8a1a22,dt168BBox(.02,.006,.2,.002,1),at(T,.012,.07,.27,-.9,0,0),'plain');      // the ribbon hangs over the ledge
  dc190P(k,'g',0x8ad8ff,dt168Geo('dcCube',()=>new THREE.BoxGeometry(1,1,1)),at(T,-.135,.07,-.1,0,.785,-.07,.045,.003,.045),'plain');
  // the candle tray at the back of the board
  dc190B(k,'c',WD,.7,.05,.12,0,1.09,-.25,0,'wood',.012);
  [-.27,.27].forEach((x,i)=>{dc190L(k,'m',BR,[[0,0],[.06,0],[.065,.012],[.03,.018],[0,.02]],8,x,1.115,-.25,0,1,'brass');dc190Candle(k,x,1.135,-.25,i?.13:.19,0xd8ccb0);
    dc190L(k,'c',0xd8ccb0,[[0,0],[.045,0],[.035,.012],[0,.014]],7,x+.01,1.13,-.24,0,1,'plain')});
  // an ink pot and a quill on the tray
  dc190L(k,'c',0x1a1820,[[0,0],[.032,0],[.036,.03],[.022,.05],[.018,.06],[0,.06]],8,.11,1.115,-.25,0,1,'glass');
  dc190P(k,'c',0xe8e0cc,dc190Oct(),dt168Mx(.13,1.24,-.25,.0,0,-.35,.012,.13,.03),'plain');
  dc190Rod(k,'c',0x2a2018,[.11,1.15,-.25],[.13,1.13,-.25],.003,'plain',4);
  // on the plinth: a stack of closed books, a scroll rack, a skull with a candle stub
  [[.0,0x3a2a4a,0],[.045,0x2a3a2a,.3],[.085,0x5a2a1a,-.2]].forEach(([y,c,r],i)=>{dc190B(k,'c',c,.2-i*.02,.04,.15-i*.01,.2,.2+y,.12,r,'plain',.008);dc190B(k,'c',PG,.18-i*.02,.03,.13-i*.01,.205,.2+y,.12,r,'plain',.004)});
  k.at(-.2,.18,.1,()=>{dc190B(k,'c',WD,.2,.16,.16,0,.08,0,0,'wood',.01);
    [[-.05,.04],[.03,.03],[0,-.04],[.06,-.03]].forEach(([x,z],i)=>{const h=.24+(i%2)*.06,lean=(i-1.5)*.08;dc190Rod(k,'c',PG,[x,.04,z],[x+lean,.04+h,z+lean*.5],.024,'plain',8);
      dc190Rod(k,'c',0x6a4a2a,[x+lean*1.02,.04+h*1.02,z+lean*.51],[x+lean*1.06,.04+h*1.06,z+lean*.53],.03,'wood',8)})},.3);
  k.at(.06,.18,-.2,()=>{dc190P(k,'c',0xcfc4a8,dc190Ball(),dt168Mx(0,.06,0,0,0,0,.06,.055,.07),'plain');dc190B(k,'c',0xbcb090,.07,.03,.05,0,.02,.04,0,'plain',.008);
    [-1,1].forEach(s=>dc190P(k,'c',0x1a1414,dc190Ball(),dt168Mx(s*.022,.065,.055,0,0,0,.014,.016,.01),'plain'));dc190Candle(k,0,.11,0,.06,0xc8bc98)},.6)}
// the lectern into the tower's kit (lot-local spot, turned toward the path) and its collider
if(typeof KDU!='undefined'&&KDU.tower&&KDU.tower.b&&!KDU.tower.b.v223){const b0=KDU.tower.b;
  KDU.tower.b=function(k,l){const c=b0.apply(this,arguments)||[];if(!ST223.on)return c;
    try{k.at(ST223.x,0,ST223.z,()=>{const n0=k.P.length;st223Lect(k);const M=new THREE.Matrix4().makeScale(ST223.s,ST223.s,ST223.s);for(let i=n0;i<k.P.length;i++)k.P[i].m.premultiply(M)},ST223.ry);c.push([ST223.x,ST223.z,ST223.col]);ST223.k=k}catch(e){console.warn('v223 tower station',e)}return c};
  KDU.tower.b.v223=1;Object.keys(b0).forEach(p=>{if(KDU.tower.b[p]==null)KDU.tower.b[p]=b0[p]});
  // shading pass once the kit is baked (only when it was just built), then whatever ring the tower had
  {const r0=KDU.tower.ring;KDU.tower.ring=function(g,l){try{if(ST223.k){dc190Shade(ST223.k,'KDU|tower223|'+l);ST223.k=null}}catch(e){console.warn('v223 tower shade',e)}return r0?r0.apply(this,arguments):undefined}}
  // its own bake key: the tower was cached without the lectern (KDU|tower|n)
  {const f=kdUp;kdUp=function(T,key,l){if(key!=='tower'||!ST223.on)return f.apply(this,arguments);const hk=twHas,gk=twGroup,mp=x=>typeof x=='string'&&x.indexOf('KDU|tower|')==0?'KDU|tower223|'+x.slice(10):x;
    twHas=function(x){return hk(mp(x))};twGroup=function(k,x,ao){return gk(k,mp(x),ao)};try{return f.apply(this,arguments)}finally{twHas=hk;twGroup=gk}}}
  try{const K=kdState();if(K.up&&K.up.tower&&K.up.tower.l>0){K.up.tower.l=-9;kdSync()}}catch(e){console.warn('v223 tower',e)}}
// where the lectern stands (world x, z), or null when the tower is not built
function st223Spot(){const l=typeof lotOf103=='function'&&lotOf103('u:tower');if(!l||!(kdLv('tower')>0))return null;return lotW103(l,ST223.x,ST223.z)}
// the tower's walk-up prompt also comes up at the lectern (the door spot keeps working)
{const f=st200Near;st200Near=function(k){if(f.apply(this,arguments))return true;if(k!=='tower'||!ST223.on)return false;
  try{const s=st223Spot();return !!s&&Math.hypot(pl.position.x-s[0],pl.position.z-s[1])<ST223.r}catch(_){return false}}}
