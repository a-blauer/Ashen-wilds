// ================= v208: the fountain of essence (owner, Nov 9 2026) =================
// "Lets revise the fountain to be an elaborate and ornate fountain of essence — an iridescent flowing mist liquid. (Make sure villager
// sitting animation still works properly on updated fountain model)."
// The v83 fountain (0820: octagonal stone basin, two tiers of blue water, falling drops) is replaced in place (T.ftnG, the same group
// at the plaza's centre, so the collider tiles 'B' r < 2.5, the plaza and every decoration ring round it stay where they were):
//  * stone (polished violet-grey, painted with the v190 decoration shading): an octagonal two-step plinth, a moulded round basin with an
//    overhanging lip (top at y .745, outer edge r 2.52: the rim seats of 3650 stay at r 2.42, h .74, facing out), eight buttresses and
//    eight carved panels with a violet rune each (buttresses between the seats, panels behind them), a turned pedestal with four fins,
//    a wide middle bowl with hanging brass drops, a slender shaft with four curled supports, an upper bowl, and a brass cage of four
//    arched ribs holding a floating orb of essence;
//  * the essence (3795's iridescent shader: thin-film colours over a milky violet mist): three pools, overflow sheets falling from the
//    upper bowl (4) and the middle bowl's scallops (8) with streaks that run down, low mist rolling over the pools and up from the orb;
//  * every Sovereign whose essence has been poured circles the orb as a small mote in its colour (ftn208Sync), and a pour makes the
//    whole fountain flare toward that colour (ftn208Flare).
// The Gilded Fountain decoration is refitted to this shape (gold rim band, bowl bands, plinth finials, a crown over the cage).
// Co-op: the fountain is scenery, built the same on every screen (no Math.random); the motes follow each player's own progress.
var FTN208={g:null,ess:[],mot:[],flare:0,fc:new THREE.Color(0xb8a8ff),tint0:new THREE.Color(0xb8a8ff),
  C:{st:0x625d6e,stL:0x7c7690,stD:0x46424f,obs:0x26232e,brass:0xa8843a,rune:0xc8b4ff}};
function ftn208Rot(pts,a){const c=Math.cos(a),s=Math.sin(a);return pts.map(p=>[p[0]*s,p[1],p[0]*c])}   // a profile [r, y] turned to angle a (x = sin, z = cos)
function ftn208Torus(k,t,col,r,tube,y,mt){return dc190P(k,t,col,dt168Geo('ftn208T'+r+'_'+tube,()=>new THREE.TorusGeometry(r,tube,5,72).rotateX(Math.PI/2)),dt168Mx(0,y,0),mt)}
function ftn208Kit(k){const C=FTN208.C,P=Math.PI;
  // plinth: two octagonal steps
  dc190L(k,'c',C.stD,[[0,0],[2.92,0],[2.92,.07],[2.86,.09],[2.7,.09],[2.7,.16],[0,.16]],8,0,0,0,0,1,'stone');
  // the basin: moulded foot, belly, overhanging lip (top y .745, outer r 2.52), inner wall down to the floor
  dc190L(k,'c',C.st,[[0,.16],[2.24,.16],[2.36,.2],[2.36,.26],[2.26,.3],[2.24,.34],[2.28,.52],[2.34,.56],[2.46,.6],[2.52,.66],[2.5,.72],[2.44,.745],[2.16,.745],[2.1,.72],[2.06,.6],[2.04,.32],[0,.32]],32,0,0,0,0,1,'plain');
  ftn208Torus(k,'c',C.obs,2.47,.022,.6);ftn208Torus(k,'c',C.stL,2.3,.03,.3);
  for(let i=0;i<8;i++){
    // buttresses between the rim seats (seats at (i+.5)/8 of a turn, x = sin a, z = -cos a): a scrolled block with a brass knob
    const a=i/8*2*P,x=Math.sin(a),z=-Math.cos(a),ry=Math.atan2(x,z);
    dc190B(k,'c',C.stL,.24,.36,.22,x*2.38,.4,z*2.38,ry,'plain',.05);
    dc190P(k,'c',C.stL,dt168Geo('ftn208Vol',()=>new THREE.TorusGeometry(.085,.035,5,10,P*1.5)),dt168Mx(x*2.5,.52,z*2.5,0,ry+P/2,0),'plain');
    dc190L(k,'m',C.brass,[[0,0],[.05,0],[.06,.04],[.03,.08],[0,.09]],8,x*2.47,.22,z*2.47,0,1,'brass');
    // a carved panel behind each seat, a rune glowing in it
    const b=(i+.5)/8*2*P,bx=Math.sin(b),bz=-Math.cos(b),br=Math.atan2(bx,bz);
    dc190B(k,'c',C.stD,1.05,.17,.04,bx*2.275,.43,bz*2.275,br,'plain',.015);
    dc190B(k,'c',C.stL,1.12,.025,.05,bx*2.285,.525,bz*2.285,br,'plain',.008);dc190B(k,'c',C.stL,1.12,.025,.05,bx*2.285,.335,bz*2.285,br,'plain',.008);
    dc190P(k,'g',C.rune,dc190Oct(),dt168Mx(bx*2.3,.43,bz*2.3,0,br,0,.05,.07,.012));
    [-1,1].forEach(s=>dc190P(k,'g',C.rune,dc190Oct(),dt168Mx(bx*2.3+Math.cos(br)*s*.22,.43,bz*2.3-Math.sin(br)*s*.22,0,br,0,.025,.035,.01)))}
  // the pedestal and its four fins
  dc190L(k,'c',C.stL,[[0,.3],[.86,.3],[.9,.38],[.72,.46],[.6,.5],[.52,.7],[.46,1.0],[.44,1.2],[.5,1.27],[0,1.27]],16,0,0,0,0,1,'plain');
  for(let i=0;i<4;i++){const a=(i+.5)/4*2*P;dc190Tube(k,'c',C.st,ftn208Rot([[.82,.36],[.72,.5],[.56,.72],[.5,.95],[.56,1.18],[.74,1.36]],a),.05,7,'plain')}
  // the middle bowl, its brass lip band and the drops under its scallops
  dc190L(k,'c',C.stL,[[0,1.24],[.5,1.26],[.9,1.34],[1.2,1.44],[1.36,1.52],[1.38,1.58],[1.32,1.61],[1.22,1.6],[1.12,1.52],[0,1.5]],32,0,0,0,0,1,'plain');
  ftn208Torus(k,'m',C.brass,1.375,.026,1.585,'brass');ftn208Torus(k,'c',C.obs,1.2,.025,1.44);
  for(let i=0;i<16;i++){const a=i/16*2*P;dc190L(k,'m',C.brass,[[0,-.12],[.026,-.075],[.03,-.025],[0,0]],6,Math.sin(a)*1.31,1.5,Math.cos(a)*1.31,0,1,'brass')}
  // the shaft, four curled supports under the upper bowl
  dc190L(k,'c',C.st,[[0,1.5],[.3,1.5],[.26,1.62],[.2,1.7],[.17,1.95],[.21,2.0],[.15,2.06],[.14,2.22],[.18,2.27],[0,2.27]],12,0,0,0,0,1,'plain');
  for(let i=0;i<4;i++){const a=i/4*2*P;dc190Tube(k,'c',C.stL,ftn208Rot([[.16,1.92],[.3,1.98],[.4,2.1],[.44,2.24],[.4,2.33],[.32,2.34]],a),.04,6,'plain');
    dc190L(k,'m',C.brass,[[0,-.03],[.045,0],[0,.03]],6,Math.sin(a)*.3,1.98,Math.cos(a)*.3,0,1,'brass')}
  // the upper bowl
  dc190L(k,'c',C.stL,[[0,2.24],[.3,2.26],[.52,2.32],[.66,2.4],[.7,2.45],[.64,2.475],[.56,2.43],[0,2.41]],24,0,0,0,0,1,'plain');
  ftn208Torus(k,'m',C.brass,.69,.02,2.455,'brass');
  // the cage of four arched brass ribs over the orb, a finial under it, a knob and a gem on top
  dc190L(k,'m',C.brass,[[0,2.41],[.09,2.41],[.07,2.58],[.11,2.64],[0,2.68]],8,0,0,0,0,1,'brass');
  for(let i=0;i<4;i++){const a=(i+.5)/4*2*P;dc190Tube(k,'m',C.brass,ftn208Rot([[.6,2.46],[.67,2.74],[.57,3.06],[.32,3.3],[.05,3.4]],a),.026,6,'brass');
    dc190L(k,'m',C.brass,[[0,-.03],[.04,0],[0,.03]],6,Math.sin(a)*.67,2.76,Math.cos(a)*.67,0,1,'brass')}
  dc190L(k,'m',C.brass,[[0,3.36],[.07,3.38],[.08,3.44],[.04,3.5],[0,3.52]],8,0,0,0,0,1,'brass');
  dc190P(k,'g',C.rune,dc190Oct(),dt168Mx(0,3.6,0,0,.4,0,.06,.1,.06))}
// the essence: pools, falling sheets, mist, the orb
function ftn208Ess(f){const L=FTN208.ess,add=(m,o)=>{L.push(m);m.renderOrder=o==null?4:o;f.add(m);return m},P=Math.PI;
  const pool=(r0,r1,y,o)=>{const g=new THREE.RingGeometry(r0,r1,64,2);g.rotateX(-P/2);const m=new THREE.Mesh(g,se208Iri(Object.assign({op:.86,glow:.35,side:THREE.FrontSide},o||{})));m.position.y=y;return add(m,3)};
  pool(.5,2.075,.62,{op:.88});pool(.25,1.172,1.555,{op:.9});pool(.08,.6,2.442,{op:.92,glow:.5});
  // sheets: the middle bowl overflows at eight scallops, the upper bowl at four
  const sheet=(rt,rb,h,y,n,w,a0,o)=>{for(let i=0;i<n;i++){const a=a0+i/n*2*P-w/2,g=new THREE.CylinderGeometry(rt,rb,h,8,6,true,a,w);const m=new THREE.Mesh(g,se208Iri(Object.assign({op:.62,flow:.55,strk:1,glow:.3},o||{})));m.position.y=y;add(m,5)}};
  sheet(1.392,1.62,.94,1.1,8,.42,(.5/8)*2*P,{});
  sheet(.705,.86,.88,2.0,4,.62,(.5/4)*2*P,{flow:.6});
  // the orb in the cage, its halo
  const orb=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.25,3),se208Iri({op:.95,glow:1.2,side:THREE.FrontSide})),6);orb.position.y=2.98;
  const halo=add(new THREE.Mesh(new THREE.IcosahedronGeometry(.42,2),se208Iri({op:.22,glow:.8,add:1,side:THREE.FrontSide})),6);halo.position.y=2.98;
  FTN208.orb=orb;FTN208.halo=halo;
  // mist: low over the basin pool, a splash veil where the sheets land, a thin column off the upper bowl, sparkles round the orb
  const mi=(n,o,y)=>{const p=se208Mist(n,o);p.position.y=y;f.add(p);L.push(p);return p};
  mi(150,{r:2.05,h:.55,sz:.85,op:.3,spd:.05,seed:2081,up:.05},.6);
  mi(80,{r:1.58,h:.9,sz:.5,op:.32,spd:.11,seed:2082,up:.25},.62);
  mi(60,{r:.55,h:1.9,sz:.42,op:.34,spd:.08,seed:2083,up:.9},2.45);
  mi(36,{r:.4,h:1.0,sz:.16,op:.9,spd:.16,seed:2084,up:.4,add:1},2.6);
  // an iridescent glow on the plinth round the basin
  const d=se208Disc(3.3,0xb8a8ff,.16);d.position.y=.17;f.add(d);L.push(d)}
function ftn208Build(){const T=TOWNS[0],f=T&&T.ftnG;if(!f||FTN208.g===f)return;FTN208.g=f;
  f.children.slice().forEach(o=>f.remove(o));   // the v83 basin, water and drops (their shapes stay in the bake cache)
  const key='FTN208';let k=null;if(!twHas(key)){k=twKit(2081);ftn208Kit(k)}const s=twGroup(k,key);if(k)dc190Shade(k,key);s.name='ftn208stone';f.add(s);
  ftn208Ess(f);se208Skip(f);f.userData.psNo=1;
  if(T.ftnA)T.ftnA.f=now=>ftn208Anim(now);else TANIM.push({x:T.cx,z:T.cy,f:now=>ftn208Anim(now)});
  ftn208Sync()}
// one mote per poured Sovereign, circling the orb in its colour
function ftn208Sync(){const f=FTN208.g;if(!f)return;FTN208.mot.forEach(o=>{f.remove(o);o.material.dispose()});FTN208.mot=[];
  const G=FTN208.mg||(FTN208.mg=new THREE.OctahedronGeometry(.065,0));
  BOSSES.forEach((B,i)=>{if(typeof bossDone=='undefined'||!bossDone.has(i))return;const m=new THREE.Mesh(G,new THREE.MeshBasicMaterial({color:se208Col(i),transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.userData.i=i;m.renderOrder=7;f.add(m);FTN208.mot.push(m)})}
function ftn208Flare(col){FTN208.flare=1;FTN208.fc.set(col==null?0xffffff:col)}
function ftn208Anim(now){const t=now/1000,n=FTN208.mot.length,fl=FTN208.flare;
  FTN208.mot.forEach((m,j)=>{const a=t*.7+j/Math.max(1,n)*6.283,r=.36+.03*Math.sin(t*2+j);m.position.set(Math.sin(a)*r,2.98+.09*Math.sin(t*1.3+j*1.7),Math.cos(a)*r);m.rotation.y=t*2})
  if(FTN208.orb){FTN208.orb.rotation.y=t*.4;FTN208.halo.scale.setScalar(1+.08*Math.sin(t*1.9)+fl*.6)}
  if(fl>0||FTN208.fl0){FTN208.flare=Math.max(0,fl-.006);FTN208.fl0=FTN208.flare>0;const c=FTN208.tint0.clone().lerp(FTN208.fc,Math.min(1,fl*1.2));
    FTN208.ess.forEach(m=>{const U=m.material&&m.material.uniforms;if(!U)return;if(U.tint)U.tint.value.copy(c);if(U.glow){const d=m.material.userData;if(d.g0==null)d.g0=U.glow.value;U.glow.value=d.g0+fl*1.4}})}}
ftn208Build();
// the Gilded Fountain decoration, refitted: gold rim band under the lip, gold bands on both bowls, finials on the plinth's corners
// (between the rim seats) and a crown with a gem over the cage
dc190Def('gild',{b(k){const B=0xb08c40;ftn208Torus(k,'m',B,2.515,.035,.69,'brass');ftn208Torus(k,'m',B,2.45,.03,.6,'brass');
    ftn208Torus(k,'m',B,1.39,.032,1.6,'brass');ftn208Torus(k,'m',B,.705,.026,2.47,'brass');
    for(let i=0;i<8;i++){const a=i/8*2*Math.PI;dc190L(k,'m',B,[[0,0],[.07,0],[.07,.03],[.045,.06],[.06,.13],[.028,.2],[.01,.32],[0,.36]],8,Math.sin(a)*2.8,.09,Math.cos(a)*2.8,0,1,'brass')}
    dc190L(k,'m',B,[[.1,0],[.19,0],[.19,.07],[.1,.07],[.1,0]],16,0,3.48,0,0,1,'brass');
    for(let i=0;i<8;i++){const a=i/8*2*Math.PI;dc190L(k,'m',B,[[0,0],[.03,0],[0,.14]],4,Math.sin(a)*.165,3.55,Math.cos(a)*.165,0,1,'brass')}
    dc190P(k,'g',0xd8c8ff,dc190Oct(),dt168Mx(0,3.8,0,0,.4,0,.08,.14,.08))}});
