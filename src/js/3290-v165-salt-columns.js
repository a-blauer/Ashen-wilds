// ================= v165 Searing Sands III · The Sandskimmer: the parts locked in the salt =================
// Five great salt columns stand round the Salt Wastes, each grown round one part of the salt-cutters' machine (SK165.parts:
// the Ram Prow, the Runners, the Great Turbine, the Twin Cannons, the Helm), which shows dark through the salt.
//  * F at a column: you mine it with a pick (the gathering pick and motion, like mining ore). Each blow bites into it: the outer
//    crystals crack and break off one by one, salt chips fly, the core shrinks and the part shows more and more. The sixth blow
//    breaks a Salt Golem loose from the column (it fights you); the ninth shatters the column and the part drops free.
//  * Walk over the part (or F) to take it. With all five, the salt-cutters' yard at the end of the Wastes (3292) builds the machine.
//  * The columns stand beside the road (SC165.spots: seeded spots at fifths of the way along it, on open ground off the road).
//  * State (SS165.c3): col (columns broken, mask), got (parts taken, mask), built. A column's own progress is not saved (it heals).
//    Co-op (3285): the columns, the parts and the build are shared.
var SC165={N:9,cols:[],picks:[],on:null,sw:0,pend:null,tool:0,err:0,golem:{}};
// the five spots (after the map exists: open ground 5–9 tiles off the road at 18/34/52/68/84% of the way)
function sc165Spots(){if(SC165.sp)return SC165.sp;const I=ss165I(2),P=I.path,rn=dkRng(16541),out=[];
  const ok=(x,z)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const X=Math.round(x)+i,Z=Math.round(z)+j;if(!MAP[Z]||!MAP[Z][X]||solid(X,Z)||MAP.DW[Z*W+X]>-1.2||insAt(X,Z)!==I)return false}return true};
  [.18,.34,.52,.68,.84].forEach((f,k)=>{const n=P.length,i=Math.floor(f*(n-1)),q=P[i],q2=P[Math.min(n-1,i+3)];let dx=q2[0]-q[0],dz=q2[1]-q[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
    let best=null;for(const d of [6.5,7.5,5.5,8.5,9.5,4.5,11])for(const s of (k%2?[1,-1]:[-1,1])){for(const sl of [0,2,-2,4,-4]){const x=q[0]-dz*s*d+dx*sl,z=q[1]+dx*s*d+dz*sl;if(ok(x,z)&&out.every(o=>Math.hypot(o.x-x,o.z-z)>14)){best={x,z};break}}if(best)break;if(best)break}
    if(!best)best={x:q[0]-dz*4,z:q[1]+dx*4};best.ry=rn()*6.28;best.k=k;out.push(best)});
  return SC165.sp=out}
// which part each column holds (fixed: the road's order)
const SC165P=[2,0,3,1,4];
// ---------------- a column: a cluster of hexagonal salt crystals round a tall core, salt rubble at its foot ----------------
function sc165Mats(){if(SC165.M)return SC165.M;return SC165.M={salt:new THREE.MeshStandardMaterial({color:0xf2ece6,roughness:.35,metalness:.05,flatShading:true,transparent:true,opacity:.86}),
  pink:new THREE.MeshStandardMaterial({color:0xe8c8c0,roughness:.4,flatShading:true,transparent:true,opacity:.86}),core:new THREE.MeshStandardMaterial({color:0xe8f0f4,roughness:.2,flatShading:true,transparent:true,opacity:.42,depthWrite:false}),
  rub:new THREE.MeshStandardMaterial({color:0xe2dad0,roughness:.9,flatShading:true}),beam:new THREE.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide})}}
function sc165Prism(h,r){const g=new THREE.CylinderGeometry(r*.92,r,h,6,1);g.translate(0,h/2,0);const p=new THREE.ConeGeometry(r*.92,r*1.3,6);p.translate(0,h+r*.65,0);
  const m=new THREE.BufferGeometry(),a=g.toNonIndexed(),b=p.toNonIndexed(),A=a.attributes.position.array,B=b.attributes.position.array,P=new Float32Array(A.length+B.length);P.set(A);P.set(B,A.length);m.setAttribute('position',new THREE.BufferAttribute(P,3));m.computeVertexNormals();return m}
function sc165Build(i){const S=sc165Spots()[i],M=sc165Mats(),g=new THREE.Group(),y=GH(S.x,S.z),rn=dkRng(16550+i);g.position.set(S.x,y,S.z);g.rotation.y=S.ry;g.userData.lpsSkip=1;scene.add(g);
  const C={i,x:S.x,z:S.z,y,g,cr:[],hits:0,part:SC165P[i]};
  // the core: one tall prism, the part inside it
  const core=new THREE.Mesh(svG('sc_core',()=>sc165Prism(4.6,.95)),M.core);g.add(core);C.core=core;
  const pm=sk165PartMesh(C.part),sz=pm.userData.sz||new THREE.Vector3(1,1,1),k=Math.min(1.25,1.6/Math.max(sz.x,sz.y,sz.z));pm.scale.setScalar(k);pm.position.set(.55,1.35,.45);pm.rotation.set(.3,.6,.2);g.add(pm);C.pm=pm;C.pk=k;const gl=kqSpr(0xffd070,1.6);gl.position.set(.8,1.5,.7);g.add(gl);C.gl=gl;
  // the crystals round it (each breaks off with a blow)
  for(let c=0;c<14;c++){const a=c/14*Math.PI*2+rn()*.3,r=.7+rn()*.35,h=2.2+rn()*2.6*(c%3?1:.55),w=.34+rn()*.26,m=new THREE.Mesh(svG('sc_pr'+(c%5),()=>sc165Prism(1,1)),c%4?M.salt:M.pink);
    m.position.set(Math.cos(a)*r,-.1,Math.sin(a)*r);m.scale.set(w,h,w);m.rotation.set((rn()-.5)*.12+Math.sin(a)*.12,rn()*3,(rn()-.5)*.12-Math.cos(a)*.12);g.add(m);C.cr.push(m)}
  // salt rubble round the foot
  g.add(lgGroup('SC165|rub'+(i%2),q=>{const r2=dkRng(16560+i);for(let c=0;c<16;c++){const a=r2()*6.28,r=1.3+r2()*1.6,s=.12+r2()*.25;q.p('','dod','c',r2()<.3?0xe8c8c0:0xece6de,Math.cos(a)*r,s*.4,Math.sin(a)*r,s,s*.7,s,r2(),r2()*3,0)}},.1));
  // a pale shaft of light over it so it can be found
  const b=new THREE.Mesh(svG('sc_beam',()=>{const q=new THREE.CylinderGeometry(.6,1.3,26,10,1,true);q.translate(0,13,0);return q}),M.beam);g.add(b);C.beam=b;
  SC165.cols[i]=C;sc165Show(C);return C}
// how far a column is mined (crystals gone, the core shrinks, the part shows)
function sc165Show(C){const n=C.hits,N=SC165.N,f=Math.min(1,n/N);C.cr.forEach((m,j)=>{m.visible=j>=Math.round(f*C.cr.length*1.08)});
  C.core.scale.set(1-f*.45,1-f*.62,1-f*.45);C.pm.position.y=1.35-f*.5;if(C.gl)C.gl.scale.setScalar(1.2+f*1.2);C.beam.visible=!C.done}
// every column standing (or broken, with its part on the ground) from the state
function sc165Sync(){const C3=SS165.c3,I=ss165I(2);SC165.cols.forEach(C=>{if(C&&C.g)scene.remove(C.g)});SC165.cols=[];SC165.picks.slice().forEach(q=>scene.remove(q.g));SC165.picks=[];
  if(C3.built||ss165Done(3))return;
  for(let i=0;i<5;i++){const p=SC165P[i];if(C3.col&(1<<i)){if(!(C3.got&(1<<p))){const S=sc165Spots()[i];sc165Drop(p,S.x,S.z,false)}continue}sc165Build(i)}}
// ---------------- mining ----------------
function sc165Near(){const P=pl.position;let best=null,bd=3.1;SC165.cols.forEach(C=>{if(!C||C.done)return;const d=Math.hypot(P.x-C.x,P.z-C.z);if(d<bd){bd=d;best=C}});return best}
function sc165Start(C){if(SC165.on)return sc165Stop();if(riding)try{dismount()}catch(_){}SC165.on=C;SC165.p0=pl.position.clone();sc165Next()}
function sc165Stop(){if(!SC165.on)return;SC165.on=null;SC165.pend=null;SC165.tool=0;try{sk141Hide()}catch(_){}}
function sc165Next(){const C=SC165.on;if(!C||C.done)return sc165Stop();const M=SK141_T.mine||SK141_T.dig;pl.rotation.y=Math.atan2(C.x-pl.position.x,C.z-pl.position.z);SC165.tool=1;try{sk141Show('pick')}catch(_){}
  try{haPlay(M.ms,M.t,2,null,.2)}catch(_){}SC165.pend={t:M.ms/1000*.5,i:C.i};SC165.sw=M.ms/1000}
{const f=sk141Hide;sk141Hide=function(){if(SC165.tool&&SC165.on)return;return f.apply(this,arguments)}}
// one blow (own: this hero struck it; a partner's blow comes through co165Mine)
function sc165Hit(i,own){const C=SC165.cols[i];if(!C||C.done)return;C.hits++;const top=new THREE.Vector3(C.x,C.y+1.2+Math.random()*1.5,C.z);
  burst(top,0xf4f0ea,14,1.8,1.8,.5);burst(top,0xe8c8c0,5,1.4,1.4,.4);svSnd('crack',.55,1.5+Math.random()*.3);try{sk146Debris(top,sc165Mats().rub,5,.12,3.5,4,1.2)}catch(_){}
  sc165Show(C);if(own&&typeof co165Mine=='function')co165Mine(i);
  if(C.hits===6&&!SC165.golem[i]&&(typeof co151On!='function'||!co151On()||co151Host())){SC165.golem[i]=1;const I=ss165I(2);try{const e=spawnEnemy('saltgolem',C.x+2.2,C.z+1.2,(I.lv&&I.lv[1])||20,{agg:1});if(e){e.agg=1;burst(gY(e.m.position,1),0xf4f0ea,40,2.4,2.4,.7);shake(.2);say('🧂 The column groans — a Salt Golem tears itself loose from it!')}}catch(e){console.warn('v165 golem',e)}}
  if(C.hits>=SC165.N)sc165Break(i,own)}
function sc165Break(i,own){const C=SC165.cols[i],C3=SS165.c3;if(C3.col&(1<<i))return;C3.col|=1<<i;SS165.trkK='';if(SC165.on===C)sc165Stop();
  if(C){C.done=1;const p=new THREE.Vector3(C.x,C.y+1.6,C.z);burst(p,0xf4f0ea,70,3.4,3,.9);burst(p,0xe8c8c0,24,2.6,2.6,.7);svSnd('crack',1,.9);shake(.25);try{sk146Debris(p,sc165Mats().salt,14,.2,5,6,1.6)}catch(_){}scene.remove(C.g)}
  const S=sc165Spots()[i];sc165Drop(SC165P[i],S.x,S.z,true);if(own)say('🧂 The column shatters: the '+SK165.parts[SC165P[i]]+' drops free.');if(own&&typeof co165Col=='function')co165Col(i)}
// ---------------- the parts lying free ----------------
function sc165Drop(p,x,z,fresh){if(SC165.picks.some(q=>q.p===p))return;const g=new THREE.Group(),m=sk165PartMesh(p),sz=m.userData.sz||new THREE.Vector3(1,1,1),k=Math.min(1.1,1.7/Math.max(sz.x,sz.y,sz.z));m.scale.setScalar(k);g.add(m);
  const b=new THREE.Mesh(svG('sc_beam2',()=>{const q=new THREE.CylinderGeometry(.4,.7,9,10,1,true);q.translate(0,4.5,0);return q}),sc165Mats().beam);g.add(b);g.position.set(x,GH(x,z),z);g.userData.lpsSkip=1;scene.add(g);
  SC165.picks.push({p,g,m,x,z,t:Math.random()*6});if(fresh)burst(new THREE.Vector3(x,GH(x,z)+1,z),0xfff0d0,30,1.4,2,.8)}
function sc165Take(p,own){const C3=SS165.c3,i=SC165.picks.findIndex(q=>q.p===p);if(i>=0){const q=SC165.picks[i];scene.remove(q.g);SC165.picks.splice(i,1);burst(new THREE.Vector3(q.x,GH(q.x,q.z)+1,q.z),0xfff0d0,24,1,2,.6)}
  if(C3.got&(1<<p))return;C3.got|=1<<p;SS165.trkK='';if(own){svSnd('bell',.6,1.2);const n=ss165Bits(C3.got);popT(pl.position,SK165.ic[p]+' '+SK165.parts[p]+' ('+n+'/5)','#fff0d0',true);
    say('⚙️ You haul out the <b>'+SK165.parts[p]+'</b> ('+n+'/5).'+(n>=5?' Take them to the salt-cutters’ yard at the end of the Wastes.':''));if(typeof co165Part=='function')co165Part(p)}}
// ---------------- prompts and the tick ----------------
function sc165Prompt(){if(!ss165Here(2))return null;const P=pl.position;for(const q of SC165.picks)if(Math.hypot(P.x-q.x,P.z-q.z)<2)return {label:'F · Take the '+SK165.parts[q.p],fn:()=>sc165Take(q.p,true)};
  const C=sc165Near();if(!C)return null;if(SC165.on===C)return {label:'F · Stop mining · '+Math.round(C.hits/SC165.N*100)+'%',fn:()=>sc165Stop()};
  return {label:'F · Mine the salt column'+(C.hits?' · '+Math.round(C.hits/SC165.N*100)+'%':' · something is locked inside'),fn:()=>sc165Start(C)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=sc165Prompt();if(r)return r}catch(e){if(!SC165.err++)console.warn('v165 salt prompt',e)}return f.apply(this,arguments)}}
function sc165Tick(dt,now){const here=ss165Here(2);if(here&&!SC165.made){SC165.made=1;sc165Sync()}if(!SC165.made)return;
  SC165.cols.forEach(C=>{if(C&&C.g)C.g.visible=here});SC165.picks.forEach(q=>{q.g.visible=here;if(!here)return;q.t+=dt;q.m.rotation.y+=dt*.7;q.m.position.y=.7+Math.sin(q.t*2)*.12;if(hero.hp>0&&Math.hypot(pl.position.x-q.x,pl.position.z-q.z)<1.2)sc165Take(q.p,true)});
  if(!here){if(SC165.on)sc165Stop();return}
  if(SC165.on){const p=pl.position;if(Math.hypot(p.x-SC165.p0.x,p.z-SC165.p0.z)>.6||hero.hp<=0||riding)sc165Stop();
    else{if(SC165.pend){SC165.pend.t-=dt;if(SC165.pend.t<=0){const q=SC165.pend;SC165.pend=null;sc165Hit(q.i,true)}}SC165.sw-=dt;if(SC165.sw<=0&&SC165.on)sc165Next()}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{sc165Tick(dt,now)}catch(e){if(!SC165.err++)console.warn('v165 salt tick',e)}return r}}
{const f=swing;swing=function(){if(SC165.on)sc165Stop();return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(SC165.on)sc165Stop();return f.apply(this,arguments)}}
SS165L.push(()=>{if(SC165.made)sc165Sync()});
