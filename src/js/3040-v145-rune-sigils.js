// ================= v145 The Three Sigils — Kindlelight III main quest: find three rune sigils, survive their rituals, open the Den =================
// Chapter 3 of Kindlelight's main quest line (1 The Lantern Road v143 · 2 The Glowmire Crystal v144). In Kindlelight III the gateway to
// the Sovereign's Den is sealed until three rune sigils hidden around the instance are attuned.
//  * Layout (mq145Plan, a pure function of the map data like mq143Plan, so 1680's place() can keep decorations off the sigils at load
//    time): one sigil off the road at 30%, 56% and 82% of III's road, alternating sides, 9–18 tiles out, on open ground with room for
//    a fight around it, away from the entrance, the gateway, the camps and each other. A faint pillar of light over each shows from afar.
//  * Coming within MQ145.see of a sigil finds it (title card, map mark). F at a found, dark sigil starts the essence charging ritual:
//    ghost wolves (dark, shadowy Ashwolves, EN.ghostwolf) rise round it in MQ145.waves waves MQ145.gap seconds apart, MQ145.total in all
//    (split evenly over the waves: 25 a wave). Their level is MQ145.lv0 + the number of sigils already attuned (4 · 5 · 6, in the order you do them).
//    Each wolf's essence streams into the sigil as it dies; when every wolf of every wave is dead the sigil is attuned.
//  * The ritual fails if you fall, wander more than MQ145.leash from the sigil or leave the instance: the wolves dissolve and the sigil
//    goes dark again (try again any time).
//  * All three attuned: the pillars flare, the gateway at the end of III opens to the Den (its F prompt is locked until then).
// State MQ145: at[3] (0 dark, 1 attuned), fd[3] (found). Done when all attuned, or the Den has been reached (mq145Done). Saved as
// x2.mq145 {at, fd}. Co-op: local to each player (the wolves are minions: never shared).
var MQ145={name:'The Three Sigils',at:[0,0,0],fd:[0,0,0],total:100,waves:4,gap:5,first:2,lv0:4,see:22,leash:30,R:null,S:null,trkK:'',t:0,err:0,fin:0,
  names:['the Fang Sigil','the Moon Sigil','the Howl Sigil']};
function mq145N(){return MQ145.at.filter(Boolean).length}
function mq145Done(){return mq145N()>=3||insReach(0)>=3}
function mq145In3(){try{const I=curIns();return !!I&&I.g===2}catch(_){return false}}
function mq145Den(){try{return PMAP[0].ins[3].n}catch(_){return 'the Den'}}
function mq145Boss(){try{return BOSSES[0].name}catch(_){return 'the Sovereign'}}
// wolves per wave: MQ145.total split over the waves, the remainder to the first ones (100 over 4 → 25 each)
function mq145Per(w){const T=MQ145.total,n=MQ145.waves,b=Math.floor(T/n);return b+(w<T-b*n?1:0)}

// ---------------- where the sigils stand (hoisted: 1680 place() calls mq145Keep while the world is decorated) ----------------
function mq145Plan(){if(mq145Plan.c)return mq145Plan.c;
  const I=INSL[2],P=I.path,N=P.length,DW=MAP.DW;
  const props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const ok=(x,z,m)=>{const X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const t=MAP[Z]&&MAP[Z][X];
    if(!t||t=='#'||t=='r'||t=='~'||t=='H'||props.has(Z*W+X))return false;const J=insAt(X,Z);if(!J||J.g!==2)return false;return DW[Z*W+X]<-(m==null?1.2:m)};
  const tan=i=>{const a=P[Math.max(0,i-3)],b=P[Math.min(N-1,i+3)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;return [dx/L,dz/L]};
  const ring=(x,z,r,need)=>{let n=0;for(let k=0;k<12;k++){const a=k/12*6.283;if(ok(x+Math.cos(a)*r,z+Math.sin(a)*r,.5))n++}return n>=need};
  const PR=(MAP.props||[]).filter(q=>Math.abs(q[0]-I.x0-I.w/2)<I.w&&Math.abs(q[1]-I.y0-I.h/2)<I.h),clear=(x,z)=>!PR.some(q=>Math.hypot(q[0]-x,q[1]-z)<5.4);
  const roadD=(x,z)=>{let d=1e9;for(let i=0;i<N;i+=2){const q=P[i];d=Math.min(d,Math.hypot(x-q[0],z-q[1]))}return d};
  const avoid=[[I.en[0],I.en[1],22],[I.ba[0],I.ba[1],18]].concat((I.cl||[]).map(c=>[c[0],c[1],15]));
  const R={sig:[null,null,null],keep:[],ok},fr=[.3,.56,.82];
  const tries=[{m:3,ring:10,road:8,sep:30,av:1,cl:1},{m:2.2,ring:9,road:7,sep:24,av:1,cl:1},{m:1.6,ring:8,road:6,sep:18,av:.7,cl:1},{m:1.2,ring:6,road:5,sep:12,av:.5}];
  for(const T of tries)for(let j=0;j<3;j++){if(R.sig[j])continue;const ix=Math.round((N-1)*fr[j]),sd=j%2?-1:1;let got=null;
    for(const b of [12,10,14,16,9,18,7])for(const side of [sd,-sd])for(const da of [0,5,-5,10,-10,15,-15]){if(got)break;
      const k=Math.max(0,Math.min(N-1,ix+da)),q=P[k],t=tan(k),x=q[0]-t[1]*b*side,z=q[1]+t[0]*b*side;
      if(!ok(x,z,T.m)||!ring(x,z,7,T.ring)||roadD(x,z)<T.road||(T.cl&&!clear(x,z)))continue;
      if(!avoid.every(([px,pz,r])=>Math.hypot(x-px,z-pz)>=r*T.av))continue;
      if(!R.sig.every(o=>!o||Math.hypot(x-o.x,z-o.z)>=T.sep))continue;
      got={x:Math.round(x*2)/2,z:Math.round(z*2)/2,i:j,ix:k,ry:Math.atan2(q[0]-x,q[1]-z)}}
    if(got)R.sig[j]=got}
  for(let j=0;j<3;j++)if(!R.sig[j]){const ix=Math.round((N-1)*fr[j]),q=P[ix],t=tan(ix);R.sig[j]={x:q[0]-t[1]*5,z:q[1]+t[0]*5,i:j,ix,ry:0,fb:1}}
  R.sig.forEach(o=>R.keep.push([o.x,o.z,5.2]));
  return mq145Plan.c=R}
function mq145Keep(g,x,z){if(g!==2)return false;try{for(const k of mq145Plan().keep)if(Math.hypot(x-k[0],z-k[1])<k[2])return true}catch(e){if(!mq145Keep.e){mq145Keep.e=1;console.warn('v145 keep',e)}}return false}
// roaming groups stay away from the sigils (the ritual is the fight there)
{const f=rosterBuild;rosterBuild=function(r){const o=f.apply(this,arguments);try{if(r===2&&ROST.r===2){const S=mq145Plan().sig;
    ROST.slots=ROST.slots.filter(s=>!(s.wild&&S.some(q=>Math.hypot((s.hx==null?s.x:s.hx)-q.x,(s.hz==null?s.z:s.hz)-q.z)<15)))}}catch(e){console.warn('v145 roster',e)}return o}}

// ---------------- the ghost wolf ----------------
EN.ghostwolf={n:'Ghost Wolf',e:'🐺',rig:'Ashwolf',col:0x3a3458,w:{hp:.8,pa:1.15,ma:.6,pd:.7,md:.9},mt:'p',moves:['strike','bite','pounce'],fam:'Beast'};
try{S.ghostwolf=S.ghostwolf||{e:'🐺',c:0x3a3458,h:'X',t:'x',hp:20,a:8,d:5};MSET.ghostwolf=EN.ghostwolf.moves}catch(_){}
var GW145={m:{}};
function gw145Mat(m){const k=m.uuid;if(GW145.m[k])return GW145.m[k];const c=m.clone();
  if(c.isMeshBasicMaterial){c.color=new THREE.Color(0xd8c0ff);c.transparent=true;c.opacity=.95}
  else{c.color=new THREE.Color(0x5a4c86);if(c.emissive)c.emissive=new THREE.Color(0x1e1240);c.emissiveIntensity=1;c.transparent=true;c.opacity=.8;if('roughness' in c)c.roughness=.55}
  c.userData.gw145=1;return GW145.m[k]=c}
function gw145Look(g){try{g.traverse(o=>{if(o.isMesh&&o.material&&!o.material.userData.gw145)o.material=Array.isArray(o.material)?o.material.map(gw145Mat):gw145Mat(o.material);if(o.isMesh)o.castShadow=false});
    // glowing eyes on the head bone and a smoky aura that the tick puffs
    const sk=g.b&&g.b.children.find(o=>o.isSkinnedMesh&&o.skeleton),S=SPEC.Ashwolf,ks=Object.keys(S.bones),hi=ks.indexOf('head');
    const hb=sk&&hi>=0?sk.skeleton.bones[hi]:null,ha=hi>=0?S.bones.head:[0,0,0,0],hd=S.hd;
    g.eyes145=[];[-1,1].forEach(s=>{const e=kqSpr(0xb898ff,.16);g.eyes145.push(e);if(hb){e.position.set(hd[0]+s*.075-ha[1],hd[1]+.05-ha[2],hd[2]+.1-ha[3]);hb.add(e)}else{e.position.set(s*.075,hd[1]+.05,hd[2]+.1);g.b.add(e)}});
    const aura=kqSpr(0x4a2a8a,1.6);aura.material=aura.material.clone();aura.material.opacity=.28;aura.position.y=.5;g.b.add(aura);g.aura145=aura}catch(e){if(!GW145.e){GW145.e=1;console.warn('v145 ghost look',e)}}
  return g}
{const f=cr;cr=function(c){const g=f.apply(this,arguments);try{if(c&&c.g&&c.g[0]==='ghostwolf')gw145Look(g)}catch(_){}return g}}

// ---------------- models ----------------
var MS145={};
function ms145Glyph(g,i,s,col,w){g.save();g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();const P=(x,y)=>[x*s,y*s];
  const M=(x,y)=>g.moveTo(...P(x,y)),L=(x,y)=>g.lineTo(...P(x,y));
  if(i===0){M(0,-.85);L(0,.85);M(-.5,-.55);L(0,-.05);L(.5,-.55);M(-.38,.2);L(0,.62);L(.38,.2);M(-.6,-.85);L(-.25,-.85);M(.6,-.85);L(.25,-.85)}       // Fang
  else if(i===1){g.arc(0,0,.62*s,-2.4,2.4);M(-.15,-.9);L(-.15,.9);M(-.15,-.3);L(.45,-.62);M(-.15,.3);L(.45,.62)}                                   // Moon
  else{M(0,.9);L(0,-.9);for(let k=0;k<3;k++){const y=-.55+k*.42;M(-.5,y+.3);L(0,y);L(.5,y+.3)}M(-.35,.9);L(.35,.9)}                                    // Howl
  g.stroke();g.restore()}
function ms145Tex(i){const k='d'+i;if(MS145[k])return MS145[k];const cv=document.createElement('canvas');cv.width=cv.height=512;const g=cv.getContext('2d'),rn=svRng(1450+i);
  g.translate(256,256);g.strokeStyle='#fff';g.fillStyle='#fff';
  const circ=(r,w)=>{g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,6.283);g.stroke()};circ(246,6);circ(232,2.5);circ(176,4);circ(164,2);circ(92,3);
  for(let k=0;k<24;k++){const a=k/24*6.283;g.save();g.rotate(a);g.translate(0,-204);g.lineWidth=3;g.beginPath();const n=2+(rn()*3|0);
    for(let q=0;q<n;q++){const x0=(rn()-.5)*16,y0=(rn()-.5)*18,x1=(rn()-.5)*16,y1=(rn()-.5)*18;g.moveTo(x0,y0);g.lineTo(x1,y1)}g.stroke();g.restore()}
  g.lineWidth=3;g.beginPath();for(let k=0;k<7;k++){const a=k*3/7*6.283-Math.PI/2;g[k?'lineTo':'moveTo'](Math.cos(a)*164,Math.sin(a)*164)}g.closePath();g.stroke();
  for(let k=0;k<6;k++){const a=k/6*6.283;g.beginPath();g.arc(Math.cos(a)*134,Math.sin(a)*134,7,0,6.283);g.fill()}
  ms145Glyph(g,i,74,'#fff',12);
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return MS145[k]=t}
function ms145GlyphTex(i){const k='g'+i;if(MS145[k])return MS145[k];const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');g.translate(128,128);
  g.shadowColor='#fff';g.shadowBlur=18;ms145Glyph(g,i,100,'#fff',16);g.shadowBlur=0;ms145Glyph(g,i,100,'#fff',8);return MS145[k]=new THREE.CanvasTexture(cv)}
function ms145RuneTex(i){const k='r'+i;if(MS145[k])return MS145[k];const cv=document.createElement('canvas');cv.width=64;cv.height=128;const g=cv.getContext('2d'),rn=svRng(1460+i);
  g.strokeStyle='#fff';g.lineWidth=5;g.lineCap='round';g.beginPath();for(let q=0;q<3;q++){const y=22+q*38;g.moveTo(16+rn()*10,y);g.lineTo(48-rn()*10,y+10+rn()*12);g.moveTo(32,y-6);g.lineTo(32+(rn()-.5)*24,y+22)}g.stroke();
  return MS145[k]=new THREE.CanvasTexture(cv)}
var MS145C={dark:0x8a6aff,live:0xb48aff,done:0xb8ff7a};
function ms145Sigil(i){const g=new THREE.Group();g.userData.psNo=1;const add=m=>{g.add(m);return m};
  const stone=new THREE.MeshStandardMaterial({color:0x4a4a52,roughness:.9,flatShading:true}),moss=new THREE.MeshStandardMaterial({color:0x3a4a30,roughness:.95,flatShading:true});
  // the floor: a worn flagstone disc, the carved sigil, its glow layer
  const flag=add(new THREE.Mesh(svG('s145f',()=>new THREE.CylinderGeometry(3.05,3.25,.18,9).toNonIndexed()),stone));flag.position.y=.02;flag.receiveShadow=true;
  const carve=add(new THREE.Mesh(svG('s145c',()=>new THREE.CircleGeometry(2.85,48).rotateX(-Math.PI/2)),new THREE.MeshStandardMaterial({color:0x1a1a20,roughness:.6,transparent:true,alphaMap:ms145Tex(i),alphaTest:.3,polygonOffset:true,polygonOffsetFactor:-2})));
  carve.position.y=.115;carve.material.userData.noFade135=1;
  const glow=add(new THREE.Mesh(svG('s145c',()=>new THREE.CircleGeometry(2.85,48).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:MS145C.dark,map:ms145Tex(i),transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,fog:false})));
  glow.position.y=.12;glow.userData.lpsSkip=1;
  // the charge ring: fills as the essence comes in
  const fill=add(new THREE.Mesh(svG('s145r0',()=>new THREE.RingGeometry(3.1,3.45,64,1,0,.001).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:MS145C.live,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})));
  fill.position.y=.13;fill.visible=false;fill.userData.lpsSkip=1;
  // six standing stones, leaning, each with a glowing rune
  const runes=[],SD=svRng(1470+i);for(let k=0;k<6;k++){const a=k/6*6.283+.26,h=1.5+SD()*.7,sg=new THREE.Group();sg.position.set(Math.sin(a)*3.7,0,Math.cos(a)*3.7);sg.rotation.set(-.08-SD()*.08,a,(SD()-.5)*.12);g.add(sg);
    const st=new THREE.Mesh(svG('s145s'+(k%3),()=>{const q=new THREE.BoxGeometry(.62,1,.36,1,3,1);const p=q.attributes.position,r=svRng(80+k);for(let v=0;v<p.count;v++){const y=p.getY(v);p.setXYZ(v,p.getX(v)*(1-.25*(y+.5))+(r()-.5)*.06,y+.5,p.getZ(v)*(1-.2*(y+.5))+(r()-.5)*.05)}q.computeVertexNormals();return q.toNonIndexed()}),stone);
    st.scale.y=h;st.castShadow=true;st.receiveShadow=true;sg.add(st);const mc=new THREE.Mesh(svG('s145m',()=>svLump(.3,0,.4,7)),moss);mc.position.set(0,.12,0);mc.scale.set(1.3,.4,1);sg.add(mc);
    const rn=new THREE.Mesh(svG('s145rn',()=>new THREE.PlaneGeometry(.34,.68)),new THREE.MeshBasicMaterial({color:MS145C.dark,map:ms145RuneTex(k),transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    rn.position.set(0,h*.58,-.19);rn.rotation.y=Math.PI;rn.userData.lpsSkip=1;sg.add(rn);runes.push(rn)}
  // the plinth and the floating glyph with its halo
  const pl0=add(new THREE.Mesh(svG('s145p',()=>new THREE.CylinderGeometry(.42,.55,.7,6).toNonIndexed()),stone));pl0.position.y=.45;pl0.castShadow=true;
  const pl1=add(new THREE.Mesh(svG('s145p2',()=>new THREE.CylinderGeometry(.55,.42,.14,6).toNonIndexed()),stone));pl1.position.y=.86;
  const gly=new THREE.Group();gly.position.y=2.1;g.add(gly);
  const glm=new THREE.MeshBasicMaterial({color:MS145C.dark,map:ms145GlyphTex(i),transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const gp=new THREE.Mesh(svG('s145g',()=>new THREE.PlaneGeometry(1.15,1.15)),glm);gp.userData.lpsSkip=1;gly.add(gp);
  const halo=new THREE.Mesh(svG('s145h',()=>new THREE.TorusGeometry(.78,.025,6,48)),new THREE.MeshBasicMaterial({color:MS145C.dark,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));halo.userData.lpsSkip=1;gly.add(halo);
  const core=kqSpr(MS145C.dark,1.4);core.material=core.material.clone();core.material.opacity=.5;gly.add(core);
  // the pillar of light (faint while dark, so it can be found from afar; bright once attuned)
  const beam=add(new THREE.Mesh(svG('s145b',()=>{const q=new THREE.CylinderGeometry(.32,.5,40,12,1,true);q.translate(0,20,0);return q}),new THREE.MeshBasicMaterial({color:MS145C.dark,map:SPR,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})));
  beam.position.y=.9;beam.userData.lpsSkip=1;beam.renderOrder=20;
  return {g,glow,fill,runes,gly,glm,halo,core,beam,i}}

// ---------------- the world: build, sync, tick ----------------
function mq145Build(){if(MQ145.S)return MQ145.S;const R=mq145Plan(),S={sig:[],lights:[]};MQ145.S=S;
  R.sig.forEach((o,i)=>{const M=ms145Sigil(i),y=GH(o.x,o.z);M.g.position.set(o.x,y,o.z);M.g.rotation.y=o.ry;scene.add(M.g);M.x=o.x;M.z=o.z;M.y=y;
    const lt=new THREE.PointLight(MS145C.dark,0,10,1.6);lt.position.set(o.x,y+2.2,o.z);scene.add(lt);M.lt=lt;S.lights.push(lt);
    for(let k=0;k<6;k++){const a=k/6*6.283+.26+o.ry;CBLK.add(Math.round(o.z+Math.cos(a)*3.7)*W+Math.round(o.x+Math.sin(a)*3.7))}CBLK.add(Math.round(o.z)*W+Math.round(o.x));
    S.sig.push(M)});
  mq145Sync();return S}
function mq145Col(i){const R=MQ145.R;return MQ145.at[i]?MS145C.done:R&&R.i===i?MS145C.live:MS145C.dark}
function mq145Sync(){const S=MQ145.S;if(!S)return;S.sig.forEach((M,i)=>{const c=mq145Col(i);[M.glow,M.halo,M.beam].forEach(o=>o.material.color.setHex(c));M.glm.color.setHex(c);M.core.material.color.setHex(c);M.runes.forEach(r=>r.material.color.setHex(c));
  M.lt.color.setHex(c);M.fill.visible=!!(MQ145.R&&MQ145.R.i===i)});mq145GateSync()}
// the gateway at the end of III: dark until the sigils are attuned
function mq145GateSync(){const r=RPORT.find(q=>q.k=='next'&&q.ig===2);if(!r)return;if(MQ145.gc==null)MQ145.gc=r.disc.material.color.getHex();const on=mq145Done(),m=r.disc.material;
  m.color.copy(new THREE.Color(0x141218).lerp(new THREE.Color(MQ145.gc),on?1:0));m.opacity=on?.8:.3;
  if(!MQ145.gg){const G=new THREE.Group();G.position.set(0,1.2,.05);r.g.add(G);MQ145.gg=G;for(let i=0;i<3;i++){const s=new THREE.Mesh(svG('s145gg',()=>new THREE.PlaneGeometry(.42,.42)),new THREE.MeshBasicMaterial({color:MS145C.dark,map:ms145GlyphTex(i),transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    s.position.set((i-1)*.55,1.0,0);G.add(s)}}
  MQ145.gg.children.forEach((s,i)=>{s.material.color.setHex(MQ145.at[i]||on?MS145C.done:MS145C.dark);s.material.opacity=MQ145.at[i]||on?.9:.25})}
function mq145Tick(dt,now){const in3=mq145In3(),t=now/1000;
  if(in3&&!MQ145.S)try{mq145Build()}catch(err){console.error('v145 build',err);MQ145.err++}
  const S=MQ145.S;
  if(S){S.sig.forEach(M=>{M.g.visible=in3});S.lights.forEach((l,i)=>{l.intensity=in3?(MQ145.at[i]?1.4:MQ145.R&&MQ145.R.i===i?2.2+.6*Math.sin(t*7):.6):0})}
  if(in3&&S){const P=pl.position;
    S.sig.forEach((M,i)=>{const d=Math.hypot(P.x-M.x,P.z-M.z),done=MQ145.at[i],live=MQ145.R&&MQ145.R.i===i;
      if(!MQ145.fd[i]&&d<MQ145.see){MQ145.fd[i]=1;MQ145.trkK='';if(!done)try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','A Rune Sigil','You have found '+MQ145.names[i]+' ('+MQ145.fd.filter(Boolean).length+' of 3)','Attune it: F at the sigil','z0')}catch(_){};svSnd('hum',.7,.8)}
      // the glyph floats and turns; faster while the ritual charges
      M.gly.position.y=2.1+.12*Math.sin(t*1.4+i)+(live?.25:0);M.gly.rotation.y+=dt*(live?2.6:done?.5:.8);M.halo.rotation.x=Math.PI/2+.3*Math.sin(t*.9+i);M.halo.rotation.z+=dt*(live?3:.4);
      M.core.scale.setScalar((live?2.2:done?1.8:1.3)*(1+.08*Math.sin(t*(live?8:2)+i)));
      M.glow.material.opacity=done?.75:live?.55+.25*Math.sin(t*6):.28+.08*Math.sin(t*1.3+i);M.beam.material.opacity=done?.38:live?.3+.1*Math.sin(t*9):.1+.03*Math.sin(t+i);
      M.runes.forEach((r,k)=>r.material.opacity=done?.85:live?.5+.45*Math.max(0,Math.sin(t*5-k)):.35);
      if(d<60&&Math.random()<dt*(live?14:done?3:1.2)){const a=Math.random()*6.283,rr=Math.random()*2.6;burst(new THREE.Vector3(M.x+Math.cos(a)*rr,M.y+.2,M.z+Math.sin(a)*rr),mq145Col(i),1,.15,live?2.4:1.1,.9)}})
    if(!MQ145.gs){MQ145.gs=1;mq145GateSync()}}
  if(MQ145.R)try{mq145RTick(dt,now)}catch(err){if(!MQ145.err++)console.error('v145 ritual',err)}
  // ghost wolves: puffs of shadow
  enemies.forEach(e=>{if(e.gw145&&!e.dead&&e.m.visible&&Math.random()<dt*6)burst(gY(e.m.position,.5+Math.random()*.4),0x6a4ab8,1,.35,.5,.7);if(e.gw145&&e.m.aura145){e.m.aura145.material.opacity=e.dead?0:.22+.08*Math.sin(t*5+e.m.position.x);if(e.dead&&e.m.eyes145)e.m.eyes145.forEach(q=>q.visible=false)}});
  if(now-MQ145.t>400){MQ145.t=now;try{mq143Trk()}catch(_){}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{mq145Tick(dt,now)}catch(err){if(!MQ145.err++)console.warn('v145 tick',err)}return r}}

// ---------------- the ritual ----------------
function mq145Start(i){if(MQ145.R||MQ145.at[i]||!MQ145.S)return;const M=MQ145.S.sig[i],lv=MQ145.lv0+mq145N();
  MQ145.R={i,t:0,w:0,lv,live:[],n:0,dead:0,tot:MQ145.total,nextT:MQ145.first};MQ145.trkK='';mq145Sync();
  svShock(new THREE.Vector3(M.x,0,M.z),MS145C.live,5,.6);burst(new THREE.Vector3(M.x,M.y+2,M.z),MS145C.live,50,3,3,.9);shake(.18);svSnd('charge',1,.6);svSnd('hum',1,.6);
  try{zt116Show(ZT116.Z[0],'Kindlelight · '+MQ145.names[i].replace(/^the /,'The '),'Essence Charging','The sigil drinks the dark. Ghost wolves rise to stop it.',MQ145.waves+' waves · '+MQ145.total+' ghost wolves · Lv '+lv,'z0')}catch(_){}
  say('🐺 The essence charging ritual begins at '+MQ145.names[i]+'. Hold the sigil until every ghost wolf has fallen.')}
function mq145Spawn(R,n){const M=MQ145.S.sig[R.i],ok=mq145Plan().ok,P=pl.position;let made=0;
  svSnd('roar',.6,1.6);
  for(let k=0;k<n;k++){let x=M.x,z=M.z;for(let tr=0;tr<12;tr++){const a=Math.random()*6.283,r=6.5+Math.random()*4;const qx=M.x+Math.cos(a)*r,qz=M.z+Math.sin(a)*r;if(ok(qx,qz,.4)&&Math.hypot(qx-P.x,qz-P.z)>3){x=qx;z=qz;break}}
    const at=k*70;setTimeout(()=>{if(MQ145.R!==R)return;let e=null;try{e=spawnEnemy('ghostwolf',x,z,R.lv,{agg:1,minion:1})}catch(err){console.error('v145 wolf',err)}
      if(!e){R.tot--;return}e.gw145=1;e.mq145=R;e.agg=1;e.wx=M.x;e.wz=M.z;e.m.rotation.y=Math.atan2(P.x-x,P.z-z);R.live.push(e);
      const p=new THREE.Vector3(x,0,z);svDecal(p,0x1a1030,1.3,2.2,.8);svShock(p,0x7a5aff,1.6,.4);burst(gY(p,.3),0x3a2a6a,16,1.2,2,.8)},at);made++}
  R.n+=made}
function mq145RTick(dt,now){const R=MQ145.R,M=MQ145.S&&MQ145.S.sig[R.i];if(!M){MQ145.R=null;return}R.t+=dt;
  const P=pl.position,far=Math.hypot(P.x-M.x,P.z-M.z)>MQ145.leash;
  if(hero.hp<=0||!mq145In3()||far)return mq145Fail(far?'far':hero.hp<=0?'dead':'left');
  while(R.w<MQ145.waves&&R.t>=R.nextT){mq145Spawn(R,mq145Per(R.w));R.w++;R.nextT+=MQ145.gap;MQ145.trkK='';
    if(R.w>1)try{banner('🐺 Wave '+R.w+' of '+MQ145.waves,'More ghost wolves rise round the sigil','')}catch(_){}}
  // the dead feed the sigil
  for(let k=R.live.length-1;k>=0;k--){const e=R.live[k];if(e.dead||!enemies.includes(e)){R.live.splice(k,1);if(e.dead){R.dead++;MQ145.trkK='';mq145Wisp(e.m.position.clone(),M)}}}
  const prog=R.tot>0?R.dead/R.tot:0;if(R.prog!==prog){R.prog=prog;const g=new THREE.RingGeometry(3.1,3.45,64,1,0,Math.max(.001,prog*Math.PI*2));g.rotateX(-Math.PI/2);M.fill.geometry.dispose&&M.fill.geometry.userData.s145&&M.fill.geometry.dispose();g.userData.s145=1;M.fill.geometry=g}
  if(R.w>=MQ145.waves&&R.dead>=R.tot&&!R.live.length&&R.t>MQ145.first+(MQ145.waves-1)*MQ145.gap+1.2)mq145Attune(R.i)}
function mq145Wisp(p,M){const s=kqSpr(MS145C.live,.6);s.position.copy(gY(p,.7));scene.add(s);const a=s.position.clone(),b=new THREE.Vector3(M.x,M.y+2.2,M.z),mid=a.clone().lerp(b,.5);mid.y+=2.5;let t=0;
  kqFx({tick(dt){t+=(dt||.016)/.7;const k=Math.min(1,t),u=1-k;s.position.set(u*u*a.x+2*u*k*mid.x+k*k*b.x,u*u*a.y+2*u*k*mid.y+k*k*b.y,u*u*a.z+2*u*k*mid.z+k*k*b.z);if(Math.random()<.5)burst(s.position.clone(),MS145C.live,1,.1,.2,.4);
    if(k>=1){scene.remove(s);burst(b,MS145C.live,8,1,1,.5);return false}return true},end(){if(s.parent)scene.remove(s)}})}
function mq145Fail(why){const R=MQ145.R;if(!R)return;MQ145.R=null;MQ145.trkK='';
  R.live.slice().forEach(e=>{if(!e.dead){burst(gY(e.m.position,.5),0x3a2a6a,14,1.5,1.5,.6);try{removeE(e)}catch(_){}}});
  enemies.slice().forEach(e=>{if(e.mq145===R&&!e.dead)try{removeE(e)}catch(_){}});
  const M=MQ145.S&&MQ145.S.sig[R.i];if(M){M.fill.visible=false;svShock(new THREE.Vector3(M.x,0,M.z),0x3a2a6a,4,.5)}mq145Sync();svSnd('hiss',1,.6);
  say(why==='far'?'🌑 You strayed too far: the ritual at '+MQ145.names[R.i]+' collapses. The sigil goes dark.':why==='dead'?'🌑 The ritual collapses as you fall. The sigil goes dark: try again.':'🌑 The ritual at '+MQ145.names[R.i]+' collapses.')}
function mq145Attune(i){const R=MQ145.R;MQ145.R=null;MQ145.at[i]=1;MQ145.trkK='';const M=MQ145.S.sig[i],n=mq145N();mq145Sync();
  const p=new THREE.Vector3(M.x,0,M.z);svShock(p,MS145C.done,7,.8);burst(new THREE.Vector3(M.x,M.y+2.2,M.z),MS145C.done,90,4,4,1.1);shake(.25);svSnd('bell',1,1);svSnd('gong',.6,1.2);try{mSfx('rare')}catch(_){}
  if(n<3){try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','Sigil Attuned',MQ145.names[i].replace(/^the /,'The ')+' burns with gathered essence',n+' of 3 sigils attuned','z0')}catch(_){}say('✨ '+MQ145.names[i].replace(/^the /,'The ')+' is attuned ('+n+'/3).')}
  else setTimeout(mq145Finish,1400)}
function mq145Finish(){MQ145.trkK='';mq145GateSync();const S=MQ145.S;if(S)S.sig.forEach(M=>{svShock(new THREE.Vector3(M.x,0,M.z),MS145C.done,9,1);burst(new THREE.Vector3(M.x,M.y+6,M.z),MS145C.done,40,3,6,1.2)});
  const r=RPORT.find(q=>q.k=='next'&&q.ig===2);if(r){const p=new THREE.Vector3(r.x,0,r.z);setTimeout(()=>{svShock(p,MS145C.done,6,.7);burst(gY(p,1.2),MS145C.done,70,3,3,1)},600)}
  shake(.35);svSnd('roar',.7,.7);svSnd('bell',1,.8);
  setTimeout(()=>{try{zt116Show(ZT116.Z[0],'Kindlelight · Main Quest','The Den Is Open','The three sigils sing as one. The gateway to '+mq145Den()+' opens.','Face '+mq145Boss()+' at the end of the road','z0');mSfx('victory')}catch(_){}
    say('🌀 All three sigils are attuned: the gateway at the end of '+PMAP[0].ins[2].n+' now leads to '+mq145Den()+'.')},900)}

// ---------------- prompts ----------------
function mq145Prompt(){if(!mq145In3()||!MQ145.S)return null;const P=pl.position;
  for(const M of MQ145.S.sig){const i=M.i,d=Math.hypot(P.x-M.x,P.z-M.z);if(d>3.2)continue;
    if(MQ145.at[i])return {label:'✨ '+MQ145.names[i].replace(/^the /,'The ')+' · attuned',fn:()=>say('✨ This sigil is attuned ('+mq145N()+'/3).')};
    if(MQ145.R)return MQ145.R.i===i?{label:'🐺 The ritual is under way · slay the ghost wolves',fn:()=>{}}:{label:'⏳ Another ritual is under way',fn:()=>{}};
    return {label:'F · Begin the essence charging ritual ('+MQ145.names[i]+')',fn:()=>mq145Start(i)}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=mq145Prompt();if(r)return r}catch(e){if(!MQ145.err++)console.warn('v145 prompt',e)}return f.apply(this,arguments)}}
function mq145AtGate(){const P=pl.position;for(const r of RPORT)if(r.k=='next'&&r.ig===2&&Math.hypot(P.x-r.x,P.z-r.z)<2.8)return true;return false}
{const f=portalPrompt;portalPrompt=function(){const r=f.apply(this,arguments);try{if(r&&!mq145Done()&&mq145AtGate())return {label:'🔒 The way to the Den is sealed · attune the three rune sigils ('+mq145N()+'/3)',fn:()=>say('🌀 Three dark glyphs hang in the arch. Find the rune sigils hidden around '+PMAP[0].ins[2].n+' and attune them.')}}catch(_){}return r}}

// ---------------- the tracker (the main-quest box, in Kindlelight III) ----------------
{const f=mq143Trk;mq143Trk=function(){try{if(mq145In3()){MQ143.trkK='';MQ144.trkK='';return mq145Trk()}}catch(err){if(!MQ145.err++)console.warn('v145 trk',err)}MQ145.trkK='';return f.apply(this,arguments)}}
function mq145Trk(){const el=$('mqt143');if(!el)return;const hide=(typeof uiOpen=='function'&&uiOpen())||(mq145Done()&&insReach(0)>=3),R=MQ145.R,n=mq145N(),fd=MQ145.fd.filter(Boolean).length;
  const key=(hide?'h':'s')+n+'|'+fd+'|'+(R?R.i+'.'+R.w+'.'+R.dead+'.'+R.tot:'-')+'|'+mq145Done();if(key===MQ145.trkK)return;MQ145.trkK=key;
  if(hide){el.classList.add('hide');mq143TrkPos();return}
  const o=(a,b)=>`<div class="o"><span>${a}</span>${b!=null?'<b>'+b+'</b>':''}</div>`;let h='<div class="k">⚜ Main quest</div><div class="h">'+MQ145.name+'</div>';
  if(mq145Done())h+='<div class="o d"><span>Step through the gateway to '+mq145Den()+'</span></div>';
  else if(R){h+=o('Essence charging · '+MQ145.names[R.i].replace(/^the /,''))+o('Wave',Math.max(1,R.w)+'/'+MQ145.waves)+o('Ghost wolves slain',R.dead+'/'+R.tot);
    h+=`<div style="height:4px;margin-top:3px;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden"><i style="display:block;height:100%;width:${(R.tot?R.dead/R.tot*100:0).toFixed(1)}%;background:linear-gradient(90deg,#8a6aff,#d0b8ff)"></i></div>`}
  else h+=o('Attune the rune sigils',n+'/3')+o(fd<3?'Sigils found (look for pillars of light)':'Sigils found',fd+'/3');
  el.innerHTML=h;el.classList.remove('hide');mq143TrkPos()}

// ---------------- the minimap and the N map: found sigils ----------------
function mq145Marks(g,P,k){if(!mq145In3())return;mq145Plan().sig.forEach((o,i)=>{if(!MQ145.fd[i])return;const q=P(o.x,o.z);if(!q)return;g.save();g.translate(q[0],q[1]);g.scale(k,k);
  const c=MQ145.at[i]?'#b8ff7a':'#b48aff';g.beginPath();for(let s=0;s<6;s++){const a=s/6*6.283;g[s?'lineTo':'moveTo'](Math.cos(a)*5,Math.sin(a)*5)}g.closePath();g.fillStyle='#1a1424';g.fill();g.lineWidth=1.6/k;g.strokeStyle=c;g.stroke();
  g.beginPath();g.arc(0,0,2,0,6.283);g.fillStyle=c;g.fill();g.restore()})}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{mq145Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{const I=INSL[2];if(mq145In3()){const c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h),T=(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k];
  mq145Marks(g,T,1.5);g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';
  mq145Plan().sig.forEach((o,i)=>{if(!MQ145.fd[i])return;const [x,y]=T(o.x,o.z),t=MQ145.names[i].replace(/^the /,'')+(MQ145.at[i]?' ✓':'');g.strokeText(t,x,y-14);g.fillStyle=MQ145.at[i]?'#b8ff7a':'#d0b8ff';g.fillText(t,x,y-14)})}}catch(e){console.warn('v145 wmap',e)}return r0}}

// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.mq145={v:145,at:MQ145.at.slice(),fd:MQ145.fd.slice()}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.mq145,arr=(a)=>[0,1,2].map(i=>a&&a[i]?1:0);if(MQ145.R)mq145Fail('left');
    MQ145.at=arr(q&&q.at);MQ145.fd=arr(q&&q.fd);MQ145.trkK='';MQ145.fin=0;mq145Sync();mq145GateSync()}catch(err){console.warn('v145 load',err)}return r}}
