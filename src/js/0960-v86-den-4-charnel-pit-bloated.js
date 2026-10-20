// ================= v86 den 4: The Charnel Pit — The Bloated One, Rot-King of the Dirge =================
// A sunken mass grave: crypt retaining walls full of skull niches, an embankment of leaning graves and iron fences,
// gibbet cages over the pit, three bubbling rot vats, four corpse piles and a rusted portcullis that slams shut.
// Mechanics (all on top of its slow brawler move pool):
//  • Rot pools  — bile globs (rotspit), the belch and every burst leave rot that stays for the fight and slowly
//                 spreads; standing in it burns and slows (Rotting). Older pools dry up once there are too many.
//  • Corpse piles — a pile swells (green ring + pulsing sac): destroy the sac before it bursts into Bloat Maggots.
//  • Bile pustules (phase 2+) — pustules grow on his hide; pop them for burst damage and a stagger
//                 (all three: he reels and takes extra damage); left alone they erupt into a rain of bile.
//  • Belch      — a wide cone of rot gas in front of him (red cone warning; dash out or step behind him).
//  • Rot Tide (phase 3) — the vats burst and rot creeps in from the walls, shrinking the clean ground.
// The first half of this file is a small toolkit shared with zzK_den5.js (props you can hit, cancelable warnings,
// a per-den scheduler, co-op relay helpers). Prefix dq*.

// ---------------- shared den toolkit (dens 4 & 5) ----------------
var DQ={v:new THREE.Vector3(),v2:new THREE.Vector3(),q:new THREE.Quaternion(),up:new THREE.Vector3(0,1,0),geo:{},TAU:Math.PI*2};
// the player whose game simulates the boss (solo: always you). Only they start den mechanics; peers get them relayed.
function dqAuth(A){return !(typeof MP!='undefined'&&MP.on)||mpBossAuth(A.i)===MP.me}
// cast a BMV move from den code so it is relayed to co-op peers exactly like a move picked by the boss AI
function dqCast(e,A,k,en){if(!dqAuth(A)||!BMV[k])return null;const w=MP.inAI;MP.inAI=1;try{return BMV[k](e,A,en)}finally{MP.inAI=w}}
// a small index (0-9) rides on the relayed move speed so every peer picks the same pile / chalice set
const dqEnc=(en,i)=>Math.round(en*100)/100+(i%10)/1000,dqDec=en=>Math.round(en*1000)%10;
const dqAng=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
// the road reaches the den from this angle (the gate goes here)
function dqEntry(A){const P=PMAP[A.i].path;for(let i=P.length-1;i>=0;i--){const dx=P[i][0]-A.cx,dz=P[i][1]-A.cz;if(Math.hypot(dx,dz)>17)return Math.atan2(dz,dx)}return Math.PI/4}
// den state: scheduler + effect list; tok changes every start/clear so stale callbacks die
function dqState(A){return A.dq||(A.dq={tok:0,q:[],fx:[],props:[]})}
function dqAfter(S,sec,fn){const tok=S.tok;S.q.push({t:sec,fn,tok})}
function dqRun(S,dt){for(let i=S.q.length-1;i>=0;i--){const q=S.q[i];if(q.tok!==S.tok){S.q.splice(i,1);continue}q.t-=dt;if(q.t<=0){S.q.splice(i,1);try{q.fn()}catch(err){console.error('den q',err)}}}
  const L=S.fx;for(let i=L.length-1;i>=0;i--){const f=L[i];let keep=false;try{keep=f.tick(dt)}catch(err){console.error('den fx',err)}if(!keep){const j=L.indexOf(f);if(j>=0)L.splice(j,1)}}}
function dqReset(S){S.tok++;S.q.length=0;S.fx.slice().forEach(f=>{try{f.end&&f.end()}catch(err){}});S.fx.length=0;S.props.slice().forEach(p=>dqPropGone(p,false));S.props.length=0}
// ---- warnings that can be cancelled (circle {r}, line {d,l,w}, cone {a,half,l}); same red as tele() ----
function dqFan(half){const k='fan'+half.toFixed(2);if(DQ.geo[k])return DQ.geo[k];const P=[],n=18;for(let i=0;i<n;i++){const a0=-half+2*half*i/n,a1=-half+2*half*(i+1)/n;P.push(0,0,0,Math.sin(a1),0,Math.cos(a1),Math.sin(a0),0,Math.cos(a0))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeBoundingSphere();return DQ.geo[k]=g}
function dqG(k){const G=DQ.geo;if(G[k])return G[k];let g;
  if(k=='disc'){g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2)}else if(k=='edge'){g=new THREE.RingGeometry(.93,1,48);g.rotateX(-Math.PI/2)}
  else if(k=='line'){g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);g.translate(0,0,.5)}else if(k=='ico'){g=new THREE.IcosahedronGeometry(1,1)}else if(k=='ico0'){g=new THREE.IcosahedronGeometry(1,0)}
  return G[k]=g}
// ---- props: lightweight den objects that hero attacks, projectiles, skills and companions can hit (they live in `enemies`)
// o: {n name, frac (share of the boss's max health), mesh, hbY, hbS, tick(e,dt,now), die(e,killed)}. They never move or
// attack, give no XP or loot, and are removed by the den's clear() (and by arenaClear as minions).
function dqProp(A,x,z,o){const S=dqState(A),B=bossEnt(A.i),l=B?B.c.l:(A.b.lvl||40),c=enemyC('ghoul',l,{});c.n=o.n;
  const bs=B?B.c.st:c.st;c.st=Object.assign({},c.st,{hp:Math.max(40,Math.round((B?paceM0(B.c):c.st.hp*12)*o.frac)),pd:bs.pd*.8,md:bs.md*.8});c.h=Math.round(c.st.hp);
  const m=new THREE.Group();m.position.set(x,GH(x,z),z);m.bs=1;if(o.mesh)m.add(o.mesh);scene.add(m);
  const e={c,m,hb:bar(false),cd:99,ch:0,vx:0,vz:0,tier:3,wx:x,wz:z,wt:0,agg:1,minion:1,dots:[],dprop:o,boss4:B};if(o.hbS)e.hb.scale.setScalar(o.hbS);
  enemies.unshift(e);S.props.push(e);return e}
function dqPropGone(e,killed){if(e._gone)return;e._gone=1;e.dead=1;if(e.hb)e.hb.visible=false;if(typeof tgt!='undefined'&&tgt===e)setTarget(null);
  try{e.dprop.die&&e.dprop.die(e,killed)}catch(err){console.error('den prop',err)}removeE(e);for(const A of ARN){const S=A.dq;if(S&&S.props){const i=S.props.indexOf(e);if(i>=0)S.props.splice(i,1)}}}
{const f=kill;kill=function(e){if(e&&e.dprop){dqPropGone(e,true);return}return f.apply(this,arguments)}}
{const f=eTick;eTick=function(e,dt,now){if(e&&e.dprop){const o=e.dprop;if(o.hbY!=null)e.hb.position.y=e.m.position.y+o.hbY;e.vx=e.vz=0;e.dots.length=0;if(o.tick&&dt>0)o.tick(e,dt,now);return true}return f.apply(this,arguments)}}
// immunity (e.dqImm = text shown) and vulnerability windows (e.dqVul = until, e.dqVulK = multiplier)
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&!e.dead){if(e.dqImm){if(!dot&&nowP()-(e.dqImT||0)>450){e.dqImT=nowP();dn(e.m.position,e.dqImm,'#ffb0c0',-30,700)}return 0}
  if(e.dqVul&&e.dqVul>nowP())d=Math.round(d*(e.dqVulK||1.5))}return f.call(this,e,d,s,crit,dot)}}
// e.dqOnHit(e) fires when the hero (not a companion) strikes e — attacks, skills and projectiles all go through heroHit
{const f=heroHit;heroHit=function(e){if(e&&!e.dead&&!e.hid&&e.dqOnHit){try{e.dqOnHit(e)}catch(err){console.error(err)}}return f.apply(this,arguments)}}
// slows / debuffs ride on hero.buffs like the Crypt Matriarch's 'Webbed'
function dqDebuff(n,i,s,ms,d){const t=nowP()+ms,b=hero.buffs.find(q=>q.n==n);if(b){b.t=Math.max(b.t,t);return}hero.buffs.push({n,i,s,t,d});hsDirty()}
function dqUndebuff(n){const k=hero.buffs.length;hero.buffs=hero.buffs.filter(b=>b.n!=n);if(hero.buffs.length!=k)hsDirty()}
// drive a humanoid attack pose on a humanoid boss (zzI_anim's g.ak: wind-up → strike → recover)
function dqPose(e,n,wind,act){const m=e&&e.m;if(!m)return;const id=(m._dqp=(m._dqp|0)+1);m.ak={n,ph:0,k:0};
  tw(wind*1000,k=>{if(m._dqp==id&&m.ak)m.ak.k=k},()=>{if(m._dqp!=id)return;m.ak={n,ph:1,k:0};
    tw((act||.3)*1000,k=>{if(m._dqp==id&&m.ak)m.ak.k=k},()=>{if(m._dqp!=id)return;m.ak={n,ph:2,k:1};tw(320,k=>{if(m._dqp==id&&m.ak)m.ak.k=1-k},()=>{if(m._dqp==id)m.ak=null})})})}
// cutaway: den geometry beyond radius rIn and higher than yMin above the floor dissolves (dithered) on the camera's side
// whenever the camera is outside the den, so walls never hide the fight (the game's default camera sits low and far back)
function dqCut(base,A,rIn,yMin){rIn*=DK;yMin*=DKY;const m=base.clone();m.userData.lps=1;const U={value:new THREE.Vector4(A.cx,A.cz,GH(A.cx,A.cz),1)},Q={value:new THREE.Vector2(rIn,yMin)};
  m.onBeforeCompile=sh=>{sh.uniforms.uCam=FADE.cam;sh.uniforms.uCut=U;sh.uniforms.uCutR=Q;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPc;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWPc=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uCam;uniform vec4 uCut;uniform vec2 uCutR;varying vec3 vWPc;').replace('void main() {',`void main() {
    {vec2 cp=uCam.xz-uCut.xy,fp=vWPc.xz-uCut.xy;float lc=length(cp),lf=length(fp);
     if(uCut.w>.5&&lc>uCutR.x-3.&&lf>uCutR.x&&vWPc.y>uCut.z+uCutR.y){float c=dot(fp/lf,cp/lc);float f=1.-smoothstep(.15,.5,c)*smoothstep(uCutR.x-3.,uCutR.x+1.,lc);
       float dh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(f<dh)discard;}}`)};
  m.customProgramCacheKey=()=>'dqcut'+base.type;return m}
// static den meshes: one soup per material
function dqMesh(A,S,mat,shadow){const m=S.mesh(mat);m.castShadow=shadow!==false;m.receiveShadow=true;A.g.add(m);return m}
// block a band of tiles (the den's walls) except the gate
function dqWall(A,r0,r1,ea,gap){for(let z=Math.floor(A.cz-r1-1);z<=A.cz+r1+1;z++)for(let x=Math.floor(A.cx-r1-1);x<=A.cx+r1+1;x++){const d=Math.hypot(x-A.cx,z-A.cz);if(d<r0||d>r1)continue;if(dqAng(Math.atan2(z-A.cz,x-A.cx),ea)<gap/(d/15))continue;denBlock(x,z)}}
function dqDisc(x,z,r){const L=[];for(let j=Math.floor(z-r);j<=z+r;j++)for(let i=Math.floor(x-r);i<=x+r;i++)if(Math.hypot(i-x,j-z)<=r)L.push([i,j]);return L}
// a skull: faceted cranium, jaw, two dark eye sockets facing angle a
function dqSkull(S,x,y,z,a,s,col){S.geo(ARK.rock[1],arkM4(x,y+s*.55,z,s*.5,s*.46,s*.56,0,a),col||0xd8cfb4);S.geo(ARKG.box,arkM4(x+Math.sin(a)*s*.18,y+s*.22,z+Math.cos(a)*s*.18,s*.42,s*.18,s*.36,0,a),arkShade(col||0xd8cfb4,.85));
  [-1,1].forEach(q=>{const ex=x+Math.sin(a)*s*.42+Math.cos(a)*q*s*.17,ez=z+Math.cos(a)*s*.42-Math.sin(a)*q*s*.17;S.geo(ARKG.oct,arkM4(ex,y+s*.56,ez,s*.11),0x0a0806)})}
function dqBone(S,x,y,z,a,l,col){S.geo(ARKG.cyl5,arkM4(x,y,z,.045,l,.045,Math.PI/2,a,0),col||0xcfc6ae);[-1,1].forEach(q=>S.geo(ARKG.oct,arkM4(x+Math.sin(a)*q*l/2,y,z+Math.cos(a)*q*l/2,.07),arkShade(col||0xcfc6ae,.95)))}
// tower of a fading glow curtain (bottom bright, top black — invisible in additive blending)
function dqCurtain(r,h,col){const g=new THREE.CylinderGeometry(r,r,h,72,1,true),p=g.attributes.position,c=[],cc=new THREE.Color(col);for(let i=0;i<p.count;i++){const k=p.getY(i)>0?0:1;c.push(cc.r*k,cc.g*k,cc.b*k)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.userData.lps=1;const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.material.userData.lps=1;m.visible=false;m.renderOrder=8;return m}

// ---------------- den 4: the Charnel Pit ----------------
var D4={};
function d4Build(A){
  const cx=A.cx,cz=A.cz,y0=GH(cx,cz),TAU=DQ.TAU,R=ARK.rng(4400),ea=dqEntry(A),GAP=.23;A.dqA=ea;
  const S=arkSoup(4401),I=arkSoup(4402),G=arkSoup(4403),P=(a,r)=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
  const mud=[0x2e2a22,0x26231d,0x34302a,0x2f3826,0x3a3428],bone=0xcfc6ae,stone=0x4c4a44,dirt=[0x3a3226,0x2e2a20,0x342e24,0x2c3426];
  const W0=14.9,W1=15.7,WH=2.9,inGap=a=>dqAng(a,ea)<GAP;
  // ---- floor: trampled grave mud with crypt flagstone remnants, bones, open graves and green rot puddles ----
  // one continuous faceted sheet (jittered grid), painted in patches: mud, grave dirt, rot-stained earth, old crypt paving near the middle
  {const st=1.25,N=Math.ceil(15.6/st),VX={},nz=(x,z)=>Math.sin(x*.41+z*.17)*.55+Math.sin(z*.37-x*.29+1.3)*.45+Math.sin((x+z)*.9)*.18,
    vt=(i,j)=>{const k=i+','+j;if(VX[k])return VX[k];const h=((i*73856093)^(j*19349663))>>>0,jx=((h%1000)/1000-.5)*.62,jz=(((h>>10)%1000)/1000-.5)*.62,x=cx+i*st+jx,z=cz+j*st+jz;return VX[k]=[x,GH(x,z)+.035+((h>>20)%100)/100*.04,z]};
    for(let j=-N;j<N;j++)for(let i=-N;i<N;i++){const a=vt(i,j),b=vt(i+1,j),c=vt(i+1,j+1),d=vt(i,j+1);
      [[a,c,b],[a,d,c]].forEach(T=>{const mx=(T[0][0]+T[1][0]+T[2][0])/3,mz=(T[0][2]+T[1][2]+T[2][2])/3,r=Math.hypot(mx-cx,mz-cz);if(r>15.3)return;
        const n=nz(mx,mz),k=.82+R()*.3;let col=n>.55?0x2f3a24:n>.1?mud[0]:n>-.45?mud[2]:mud[1];if(r<6.5&&nz(mx*1.7,mz*1.7)>.15)col=0x4a4840;if(r>13)col=arkMix(col,0x1c1a16,.35);S.tri(T[0],T[1],T[2],arkShade(col,k),.08)})}}
  // tilted, cracked flagstones and scattered bones
  for(let k=0;k<26;k++){const a=R()*TAU,r=2+R()*10.5,[x,z]=P(a,r),w=.5+R()*.5,d=.4+R()*.4,ry=R()*3;S.geo(ARKG.box,arkM4(x,y0+.06,z,w,.08,d,(R()-.5)*.12,ry,(R()-.5)*.12),arkShade(0x56544a,.7+R()*.35))}
  for(let k=0;k<44;k++){const a=R()*TAU,r=1.5+R()*12.6,[x,z]=P(a,r);dqBone(S,x,y0+.08,z,R()*6,.3+R()*.35,arkShade(bone,.8+R()*.25))}
  for(let k=0;k<14;k++){const a=R()*TAU,r=2+R()*12,[x,z]=P(a,r);dqSkull(S,x,y0+.03,z,R()*6,.32+R()*.12,arkShade(bone,.85+R()*.2))}
  // open graves: a dark hole and a heap of dug earth
  [[ea+1.45,10.9],[ea-1.5,10.6],[ea+Math.PI+.55,9.4]].forEach(([a,r])=>{const [x,z]=P(a,r),ta=a+Math.PI/2,c=Math.cos(ta),s=Math.sin(ta),Q=(u,v)=>[x+c*u-s*v,z+s*u+c*v];
    const pts=[Q(-1,-.45),Q(1,-.45),Q(1,.45),Q(-1,.45)];S.slab(pts,pts.map(()=>y0+.07),y0-.2,0x0b0a08,0x1a1612);
    const [mx,mz]=P(a,r+1.1);S.geo(ARK.rock[2],arkM4(mx,y0+.12,mz,1.1,.3,.55,0,-ta),0x3a3022);S.geo(ARKG.box,arkM4(mx+.3,y0+.6,mz,.06,1.1,.06,.3,0,.2),0x4a3424);S.geo(ARKG.box,arkM4(mx+.42,y0+.12,mz,.26,.06,.34,.3,0,.2),0x6a6660)});
  // rot puddles (glow)
  for(let k=0;k<9;k++){const a=R()*TAU,r=3+R()*10,[x,z]=P(a,r),s=.5+R()*.8;for(let q=0;q<7;q++){const a0=q/7*TAU,a1=(q+1)/7*TAU,p=(aa,rr)=>[x+Math.cos(aa)*rr,y0+.085,z+Math.sin(aa)*rr];G.tri(p(0,0),p(a1,s*(.8+R()*.4)),p(a0,s*(.8+R()*.4)),0x2e5a14,.2)}}
  // ---- retaining wall of crypt stone with skull niches; collapsed stretches spill rubble ----
  const NW=64;for(let k=0;k<NW;k++){const a0=k/NW*TAU,a1=(k+1)/NW*TAU,am=(a0+a1)/2;if(dqAng(am,ea)<GAP+.02)continue;
    const brk=R()<.16,h=brk?WH*(.4+R()*.25):WH*(.94+R()*.12),ry=Math.PI/2-am,wd=2*Math.PI*15.3/NW;
    for(let c=0;c<3;c++){const yb=y0+c*h/3,ch=h/3-.04;if(ch<=.05)break;const nb=c%2?2:1;for(let b=0;b<nb;b++){const aa=nb==1?am:am+(b-.5)*(a1-a0)/2,[x,z]=P(aa,15.3+(R()-.5)*.08);
      S.geo(ARKG.box,arkM4(x,yb+ch/2,z,wd/nb-.06,ch,.85+R()*.1,0,ry+(R()-.5)*.04,0),arkMix(arkShade(stone,.72+R()*.4),0x3a4a2a,c==2?.25*R():0))}}
    S.geo(ARKG.box,arkM4(...(([x,z])=>[x,y0+h+.06,z])(P(am,15.35)),wd+.04,.12,1.05,0,ry,0),arkShade(stone,.6));
    if(!brk&&k%2==1){const [x,z]=P(am,14.84);const c=Math.cos(ry),s=Math.sin(ry),Q=(u,v)=>[x+c*u,y0+v,z-s*u];[.55,1.55].forEach((ny,row)=>{if(row&&R()<.35)return;S.quad(Q(-.38,ny),Q(.38,ny),Q(.38,ny+.52),Q(-.38,ny+.52),0x0b0a08,.05);
      const [sx,sz]=P(am+(row?.012:-.01),14.95);dqSkull(S,sx,y0+ny+.02,sz,am+Math.PI,.34,0xc8bfa4);if(R()<.4){const [bx,bz]=P(am+.03,14.9);dqBone(S,bx,y0+ny+.06,bz,ry,.3,0xbab09a)}
      if(R()<.45){const [fx,fz]=P(am-.016,14.82);G.geo(ARKG.cyl5,arkM4(fx,y0+ny+.08,fz,.05,.16,.05),0xd8d0b0);G.geo(ARKG.cone4,arkM4(fx,y0+ny+.27,fz,.055,.2,.055),0x9aff6a);G.geo(ARKG.cone4,arkM4(fx,y0+ny+.24,fz,.03,.12,.03),0xe8ffd0)}})}
    if(brk){for(let q=0;q<4;q++){const [x,z]=P(am+(R()-.5)*.08,14.3+R()*.5),s=.18+R()*.25;S.geo(ARK.rock[q],arkM4(x,y0+s*.4,z,s,s*.7,s,0,R()*6),arkShade(stone,.6+R()*.3))}if(R()<.6){const [x,z]=P(am,14.5);dqSkull(S,x,y0+.02,z,am+Math.PI,.34,0xc8bfa4)}}
    // roots and moss hanging over the wall top
    if(R()<.3){const [x,z]=P(am,14.95);S.geo(ARKG.cone4,arkM4(x,y0+h-.35,z,.08,.7,.08,Math.PI,R()),0x2a2418)}}
  // gate pillars and lintel (skull keystone)
  const gpt=[-1,1].map(s=>P(ea+s*(GAP+.035),15.3));gpt.forEach(([x,z],q)=>{S.geo(ARKG.box,arkM4(x,y0+2.5,z,1.15,5,1.15,0,Math.PI/2-ea),arkShade(stone,.8));S.geo(ARKG.box,arkM4(x,y0+5.1,z,1.35,.3,1.35,0,Math.PI/2-ea),arkShade(stone,.6));
    S.geo(ARKG.cone4,arkM4(x,y0+5.65,z,.5,.8,.5,0,Math.PI/4-ea),arkShade(stone,.7));dqSkull(S,x+Math.cos(ea)*-.6,y0+3.6,z+Math.sin(ea)*-.6,ea+Math.PI,.5)});
  {const [x,z]=P(ea,15.3),L=Math.hypot(gpt[0][0]-gpt[1][0],gpt[0][1]-gpt[1][1]);S.geo(ARKG.box,arkM4(x,y0+4.6,z,L,.55,.9,0,Math.PI/2-ea),arkShade(stone,.7));dqSkull(S,x-Math.cos(ea)*.5,y0+4.35,z-Math.sin(ea)*.5,ea+Math.PI,.6,0xe0d6bc)}
  // green-fire skull braziers on the wall top light the pit
  for(let k=0;k<7;k++){const a=ea+GAP+.45+k*(TAU-2*GAP-.9)/6,[x,z]=P(a,15.3),y=y0+WH+.12;
    for(let l=0;l<3;l++){const la=l*2.094;I.geo(ARKG.box,arkM4(x+Math.cos(la)*.16,y+.3,z+Math.sin(la)*.16,.05,.6,.05,Math.sin(la)*.3,0,-Math.cos(la)*.3),0x2a2622)}
    I.geo(ARKG.cone5,arkM4(x,y+.72,z,.42,.32,.42,Math.PI),0x2e2a26);dqSkull(S,x-Math.cos(a)*.42,y+.5,z-Math.sin(a)*.42,a+Math.PI,.3);
    G.geo(ARKG.cone5,arkM4(x,y+1.15,z,.32,.75,.32,0,R()),0x6aff3a);G.geo(ARKG.cone4,arkM4(x,y+1.05,z,.17,.48,.17,0,R()),0xd8ffb0)}
  // ---- the embankment of graves above the wall, sloping up to the hills ----
  const emb=(a,r)=>{const t=Math.max(0,Math.min(1,(r-W1)/(20.6-W1))),xo=cx+Math.cos(a)*20.8,zo=cz+Math.sin(a)*20.8,yt=y0+WH,yo=Math.max(yt,GH(xo,zo)+.05),s=t*t*(3-2*t);return yt+(yo-yt)*s+Math.sin(a*9+r*1.7)*.1*Math.sin(Math.PI*t)};
  const RS=[W1-.1,16.6,17.6,18.7,19.7,20.6],NE=96;for(let k=0;k<NE;k++){const a0=k/NE*TAU,a1=(k+1)/NE*TAU;if(dqAng((a0+a1)/2,ea)<GAP+.06)continue;
    for(let j=0;j<RS.length-1;j++){const p=(a,r)=>{const [x,z]=P(a,r);return [x,emb(a,r),z]};S.quad(p(a0,RS[j]),p(a0,RS[j+1]),p(a1,RS[j+1]),p(a1,RS[j]),arkShade(dirt[(R()*4)|0],.75+R()*.3),.14)}
    const po=(a,y)=>{const [x,z]=P(a,20.6);return [x,y,z]};S.quad(po(a0,emb(a0,20.6)),po(a1,emb(a1,20.6)),po(a1,GH(...P(a1,20.6))-.3),po(a0,GH(...P(a0,20.6))-.3),0x2a241c,.1)}
  [-1,1].forEach(s=>{const a=ea+s*(GAP+.06),p=(r,y)=>{const [x,z]=P(a,r);return [x,y,z]};for(let j=0;j<RS.length-1;j++)S.quad(p(RS[j],emb(a,RS[j])),p(RS[j+1],emb(a,RS[j+1])),p(RS[j+1],y0-.2),p(RS[j],y0-.2),0x2c261c,.1)});
  // leaning headstones and crosses on the embankment
  for(let k=0;k<46;k++){const a=R()*TAU;if(dqAng(a,ea)<GAP+.12)continue;const r=16.1+R()*3.6,[x,z]=P(a,r),y=emb(a,r),ry=Math.PI/2-a+(R()-.5)*.5,lx=(R()-.5)*.35,lz=(R()-.5)*.25,col=arkShade(0x6a6860,.6+R()*.45);
    if(R()<.65){const h=.6+R()*.5;S.geo(ARKG.box,arkM4(x,y+h/2-.1,z,.55,h,.15,lx,ry,lz),col);S.geo(ARKG.cyl6,arkM4(x,y+h-.1,z,.27,.15,.27,Math.PI/2,ry,lz),col)}
    else{S.geo(ARKG.box,arkM4(x,y+.5,z,.12,1.1,.12,lx,ry,lz),col);S.geo(ARKG.box,arkM4(x,y+.72,z,.6,.12,.12,lx,ry,lz),col)}}
  // iron fence along the wall top
  {let a=0;const st=.55/15.9;while(a<TAU){const am=a;a+=st;if(dqAng(am,ea)<GAP+.03)continue;if(Math.sin(am*5.3)>.82)continue;const [x,z]=P(am,15.9),y=y0+WH;
    I.geo(ARKG.box,arkM4(x,y+.55,z,.05,1.1,.05,(R()-.5)*.15,0,(R()-.5)*.15),0x2a2622);I.geo(ARKG.cone4,arkM4(x,y+1.18,z,.06,.18,.06),0x34302a);
    const [x2,z2]=P(am+st,15.9);if(dqAng(am+st,ea)>=GAP+.03&&Math.sin((am+st)*5.3)<=.82)[.35,.9].forEach(h=>I.geo(ARKG.box,arkM4((x+x2)/2,y+h,(z+z2)/2,.55,.04,.04,0,Math.PI/2-am-st/2),0x2a2622))}}
  // gibbets with hanging cages leaning over the pit (one still holds its prisoner)
  [ea+Math.PI*.55,ea-Math.PI*.6,ea+Math.PI*1.02,ea+Math.PI*1.38].forEach((a,q)=>{const [px,pz]=P(a,16.4),py=emb(a,16.4),top=py+4.6,[cx2,cz2]=P(a,13.7),ry=Math.PI/2-a;
    S.geo(ARKG.box,arkM4(px,py+2.3,pz,.26,4.7,.26,0,ry),0x3a2a1c);const ax=(px+cx2)/2,az=(pz+cz2)/2;S.geo(ARKG.box,arkM4(ax,top,az,2.9,.22,.22,0,ry+Math.PI/2),0x3a2a1c);
    const cy=top-2.3;for(let l=0;l<5;l++)I.geo(ARKG.oct,arkM4(cx2,top-.2-l*.22,cz2,.06,.11,.06,0,l*1.57),0x3a3632);
    for(let b=0;b<8;b++){const ba=b/8*TAU;I.geo(ARKG.cyl5,arkM4(cx2+Math.cos(ba)*.45,cy,cz2+Math.sin(ba)*.45,.025,1.5,.025),0x2e2a26)}
    I.geo(ARKG.cyl6,arkM4(cx2,cy+.75,cz2,.5,.06,.5),0x2e2a26);I.geo(ARKG.cone5,arkM4(cx2,cy+.95,cz2,.5,.35,.5),0x2a2622);I.geo(ARKG.cyl6,arkM4(cx2,cy-.75,cz2,.5,.06,.5),0x2e2a26);
    if(q==0){dqSkull(S,cx2,cy-.1,cz2,a+Math.PI,.32);for(let i=0;i<4;i++)S.geo(ARKG.box,arkM4(cx2,cy-.3-i*.1,cz2+.04,.32-i*.03,.03,.18,0,ry),bone);dqBone(S,cx2+.1,cy-.68,cz2,ry,.4)}});
  // ---- three rot vats (solid): staved wood, iron bands, glowing sludge spilling over ----
  D4.vats=[];[ea+Math.PI,ea+Math.PI-1.25,ea+Math.PI+1.25].forEach((a,q)=>{const [x,z]=P(a,12.3);D4.vats.push([x,z]);dqDisc(x,z,1.5).forEach(([i,j])=>denBlock(i,j));
    for(let s=0;s<10;s++){const sa=s/10*TAU,sx=x+Math.cos(sa)*1.18,sz=z+Math.sin(sa)*1.18;S.geo(ARKG.box,arkM4(sx,y0+.78,sz,.74,1.56,.12,0,Math.PI/2-sa,0),arkShade(0x4a3a28,.7+R()*.4))}
    [.28,1.22].forEach(h=>I.geo(ARKG.cyl6,arkM4(x,y0+h,z,1.28,.12,1.28,0,.3),0x2a2826));I.geo(ARKG.cyl6,arkM4(x,y0+1.52,z,1.3,.08,1.3,0,.3),0x34302c);
    G.geo(ARKG.cyl6,arkM4(x,y0+1.42,z,1.14,.05,1.14,0,.3),0x8aef3a);
    const ia=Math.atan2(cz-z,cx-x);for(let d=-1;d<=1;d++){const da=ia+d*.5,dx=x+Math.cos(da)*1.25,dz=z+Math.sin(da)*1.25,c=Math.cos(Math.PI/2-da),s2=Math.sin(Math.PI/2-da),Q=(u,v)=>[dx+c*u,y0+v,dz-s2*u];
      const w=.14+R()*.1,len=.5+R()*.8;G.quad(Q(-w,1.5),Q(w,1.5),Q(w*.6,1.5-len),Q(-w*.6,1.5-len),0x6ad02a,.1)}
    for(let p=0;p<8;p++){const a0=p/8*TAU,a1=(p+1)/8*TAU,px=x+Math.cos(ia)*1.6,pz=z+Math.sin(ia)*1.6,pp=(aa,rr)=>[px+Math.cos(aa)*rr,y0+.09,pz+Math.sin(aa)*rr];G.tri(pp(0,0),pp(a1,.9+R()*.3),pp(a0,.9+R()*.3),0x3a7a18,.15)}});
  // ---- four corpse piles (solid) ----
  D4.piles=[];[ea+.95,ea+2.45,ea-.95,ea-2.45].forEach((a,q)=>{const [x,z]=P(a,7.8);D4.piles.push([x,z,a]);dqDisc(x,z,.8).forEach(([i,j])=>denBlock(i,j));
    S.geo(ARK.rock[q],arkM4(x,y0+.15,z,1.5,.42,1.3,0,R()*6),0x2e2820);
    const body=[0xb8b496,0xa8b08a,0x9aa47e,0xc0b498,0x8a9a72],rag=[0x4a3a2a,0x3a2a26,0x5a4a36,0x2e3a2a];
    for(let p=0;p<9;p++){const a0=p/9*TAU,a1=(p+1)/9*TAU,pp=(aa,rr)=>[x+Math.cos(aa)*rr,y0+.08,z+Math.sin(aa)*rr];S.tri(pp(0,0),pp(a1,1.7+R()*.5),pp(a0,1.7+R()*.5),0x3a1410,.2)}
    for(let b=0;b<14;b++){const ba=R()*TAU,br=R()*1.0,bx=x+Math.cos(ba)*br,bz=z+Math.sin(ba)*br,by=y0+.3+(1-br)*.62+R()*.12,ry2=R()*6,cl=b%3==2;
      S.geo(ARK.rock[b%4],arkM4(bx,by,bz,.66+R()*.2,.21,.25,(R()-.5)*.5,ry2,(R()-.5)*.4),cl?arkShade(rag[(R()*4)|0],.9+R()*.3):arkShade(body[(R()*body.length)|0],.85+R()*.25));
      if(!cl&&R()<.5){const la=ry2+(R()<.5?1.4:-1.4);S.geo(ARKG.cyl5,arkM4(bx+Math.cos(la)*.3,by+.12,bz-Math.sin(la)*.3,.05,.5,.05,(R()-.5)*1.4,la,(R()-.5)*1.4),arkShade(body[0],.9))}}
    for(let b=0;b<3;b++){const ba=R()*TAU;dqSkull(S,x+Math.cos(ba)*.7,y0+.35+R()*.3,z+Math.sin(ba)*.7,R()*6,.3,0xd0c6a8)}
    S.geo(ARKG.cyl5,arkM4(x+.2,y0+1.15,z-.1,.06,.7,.06,.5,R(),.3),0x8a8a6a);dqBone(S,x-.5,y0+.9,z+.3,R()*6,.45)});
  // ---- two broken sarcophagi (solid) ----
  [ea+1.42,ea-1.38].forEach(a=>{const [x,z]=P(a,10.6),ry=Math.PI/2-a;S.geo(ARKG.box,arkM4(x,y0+.4,z,2.3,.8,1.05,0,ry),arkShade(stone,.95));S.geo(ARKG.box,arkM4(x,y0+.85,z,1.1,.1,.8,0,ry),0x141210);
    S.geo(ARKG.box,arkM4(x+Math.cos(a)*.35,y0+.95,z+Math.sin(a)*.35,2.35,.18,1.1,.18,ry+.35,.1),arkShade(stone,1.1));S.geo(ARKG.box,arkM4(x+Math.cos(a)*.6,y0+.9,z+Math.sin(a)*.6,.6,.12,.4,.1,ry+.2,0),arkShade(stone,.8));
    const c=Math.cos(ry),s=Math.sin(ry);[-1,0,1].forEach(u=>denBlock(x+c*u*.9,z-s*u*.9))});
  dqWall(A,14.95,18.6,ea,GAP*1.05);
  // ---- build static meshes ----
  dqMesh(A,S,dqCut(arkMat('std'),A,14.2,.5));dqMesh(A,I,dqCut(arkMat('iron'),A,14.2,.5));const gm=dqMesh(A,G,dqCut(arkMat('glow'),A,14.2,.5),false);gm.receiveShadow=false;
  // ---- live pieces: portcullis, miasma seal, vat bubbles, ghost lights ----
  const PC=arkSoup(4404),[gx,gz]=P(ea,15.3),gL=Math.hypot(gpt[0][0]-gpt[1][0],gpt[0][1]-gpt[1][1])-1.1,tx=-Math.sin(ea),tz=Math.cos(ea);
  for(let b=0;b<=9;b++){const u=-gL/2+gL*b/9,x=gx+tx*u,z=gz+tz*u;PC.geo(ARKG.cyl5,arkM4(x,y0+2.05,z,.06,4.1,.06),0x2a2622);PC.geo(ARKG.cone4,arkM4(x,y0-.08,z,.08,.3,.08,Math.PI),0x34302c)}
  [.5,1.7,2.9,3.9].forEach(h=>PC.geo(ARKG.box,arkM4(gx,y0+h,gz,gL+.1,.1,.08,0,Math.PI/2-ea),0x2a2622));
  const pcm=PC.mesh(dqCut(arkMat('iron'),A,14.2,.5));const pcg=new THREE.Group();pcg.add(pcm);pcg.position.y=3.9;A.g.add(pcg);D4.gate=pcg;
  const cur=dqCurtain(14.4,3.4,0x5aff2a);cur.position.set(cx,y0+1.7,cz);A.g.add(cur);D4.cur=cur;
  const bub=[],bm=new THREE.MeshBasicMaterial({color:0xaaff60});D4.vats.forEach(([x,z],q)=>{for(let i=0;i<3;i++){const b=new THREE.Mesh(dqG('ico0'),bm);b.position.set(x+(R()-.5)*1.3,y0+1.45,z+(R()-.5)*1.3);b.userData.ph=R()*10;A.g.add(b);bub.push(b)}});
  const wl=[];for(let k=0;k<7;k++){const s=kqSpr(0x9affc8,.7);s.userData={a:R()*TAU,r:4+R()*9,h:1.4+R()*2,ph:R()*10};A.g.add(s);wl.push(s)}
  TANIM.push({x:cx,z:cz,f:now=>{const t=now/1000;bub.forEach((b,i)=>{const k=((t*.7+b.userData.ph)%1);b.scale.setScalar(.04+.16*Math.sin(Math.PI*k));b.position.y=y0+1.45*DKY+k*.12});
    wl.forEach(s=>{const u=s.userData,a=u.a+t*.08;s.position.set(cx+Math.cos(a)*u.r,y0+u.h+Math.sin(t*.9+u.ph)*.35,cz+Math.sin(a)*u.r);s.material.opacity=.55+.3*Math.sin(t*2+u.ph)})}});
  // shared rot pool meshes (irregular blob + a frothy rim)
  const blob=(n,j,ri,ro)=>{const R2=ARK.rng(4500+n),pos=[],idx=[],rr=[...Array(n)].map(()=>1+(R2()-.5)*j);pos.push(0,0,0);for(let i=0;i<n;i++){const a=i/n*TAU;pos.push(Math.cos(a)*rr[i]*ro,0,Math.sin(a)*rr[i]*ro)}
    if(ri==null){for(let i=0;i<n;i++)idx.push(0,1+(i+1)%n,1+i)}else{for(let i=0;i<n;i++){const a=i/n*TAU;pos.push(Math.cos(a)*rr[i]*ri,0,Math.sin(a)*rr[i]*ri)}for(let i=0;i<n;i++){const a=1+i,b=1+(i+1)%n,c=1+n+i,d=1+n+(i+1)%n;idx.push(c,b,a,c,d,b)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeBoundingSphere();g.userData.lps=1;return g};
  D4.pg=blob(22,.28,null,1);D4.fg=blob(22,.28,.8,1.04);
  D4.pm=new THREE.MeshBasicMaterial({color:0x2a4a12,transparent:true,opacity:.86,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:THREE.DoubleSide});
  D4.fm=new THREE.MeshBasicMaterial({color:0x7aff3a,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-5,side:THREE.DoubleSide});
  [D4.pm,D4.fm].forEach(m=>m.userData.lps=1);
  // the rot tide: a ring whose inner edge is rewritten in place each frame
  {const N=80,pos=new Float32Array((N+1)*2*3),idx=[];for(let i=0;i<N;i++){const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;idx.push(a,c,b,b,c,d)}
    const mk=(mat)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));g.setIndex(idx);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,y0,cz),20);g.userData.lps=1;const m=new THREE.Mesh(g,mat);m.visible=false;m.frustumCulled=false;A.g.add(m);return m};
    D4.tide=mk(D4.pm);D4.tideF=mk(D4.fm);D4.tideN=N}
  A.b.ult=0;   // the Rot Tide replaces the generic Cataclysm
}
// ---- rot pools ----
function d4Pool(A,x,z,r0){const S=A.dq;if(!S||!A.f)return;const y=GH(x,z)+.1+(S.pn%9)*.003;S.pn++;
  const p={x,z,r:.15,r0,rMax:Math.min(4.2,r0*1.6),age:0,dry:0,ms:new THREE.Mesh(D4.pg,D4.pm),fr:new THREE.Mesh(D4.fg,D4.fm)};
  p.ms.position.set(x,y,z);p.fr.position.set(x,y+.002,z);p.ms.rotation.y=p.fr.rotation.y=Math.random()*6.28;p.ms.renderOrder=17;p.fr.renderOrder=18;p.ms.scale.setScalar(.15);p.fr.scale.setScalar(.15);scene.add(p.ms,p.fr);S.pools.push(p);
  const cap=[0,5,7,9][S.ph]||7;const live=S.pools.filter(q=>!q.dry);if(live.length>cap)live[0].dry=1;burst(V(x,y+.2,z),0x7aff3a,10,2,2,.5)}
function d4InRot(A,p){const S=A.dq;for(const q of S.pools)if(!q.dry&&Math.hypot(p.x-q.x,p.z-q.z)<q.r*.88)return true;if(S.tide&&Math.hypot(p.x-A.cx,p.z-A.cz)>S.tide.r+.25)return true;return false}
function d4TideDraw(A,now){const S=A.dq,T=S.tide,N=D4.tideN,y=GH(A.cx,A.cz)+.11,t=now/1000;
  [[D4.tide,0,15.6*DK],[D4.tideF,-.12,.55]].forEach(([m,o,w],q)=>{const p=m.geometry.attributes.position.array;for(let i=0;i<=N;i++){const a=i/N*DQ.TAU,wob=Math.sin(a*6+t*1.3)*.28+Math.sin(a*11-t*.9)*.14,ri=Math.max(.5,T.r+wob+o),ro=q?ri+w:w;
    p[i*6]=A.cx+Math.cos(a)*ri;p[i*6+1]=y+q*.003;p[i*6+2]=A.cz+Math.sin(a)*ri;p[i*6+3]=A.cx+Math.cos(a)*ro;p[i*6+4]=y+q*.003;p[i*6+5]=A.cz+Math.sin(a)*ro}m.geometry.attributes.position.needsUpdate=true;m.visible=true})}
// ---- pustules on the Rot-King's hide ----
function d4Pustules(e,A,en){const S=A.dq,B=e;if(!S||S.pus.some(p=>!p._gone))return;const n=3,mat=new THREE.MeshStandardMaterial({color:0xc8e86a,emissive:0x6a9a10,emissiveIntensity:.8,roughness:.4,flatShading:true});mat.userData.lps=1;
  S.pusMat=mat;S.pusT=S.ph>=3?9:11;S.pusMax=S.pusT;S.pusPop=0;
  for(let i=0;i<n;i++){const g=new THREE.Group(),b=new THREE.Mesh(dqG('ico'),mat),gl=kqSpr(0xb8ff4a,.6);g.add(b,gl);
    const ang=[.0,2.1,-2.1][i]+(Math.random()-.5)*.3,h=[1.75,2.35,1.45][i],off=[.8,.72,.76][i];
    const p=dqProp(A,B.m.position.x,B.m.position.z,{n:'Bile Pustule',frac:.022,mesh:g,hbY:h+.9,hbS:.6,
      tick(pe,dt,now){if(B.dead){dqPropGone(pe,false);return}const s=B.m.bs/2.5,ry=B.m.rotation.y+ang;pe.m.position.x=B.m.position.x+Math.sin(ry)*off*s;pe.m.position.z=B.m.position.z+Math.cos(ry)*off*s;
        pe.m.visible=!B.hid;const k=1-S.pusT/S.pusMax,pul=1+.12*Math.sin(now/(140-60*k));b.position.y=h*s;gl.position.y=h*s;b.scale.setScalar((.32+.3*k)*pul*s);gl.scale.setScalar((.6+.6*k)*pul*s);mat.emissiveIntensity=.7+.8*k},
      die(pe,killed){const q=gY(pe.m.position,b.position.y);burst(q,0xc8ff4a,40,4,3,.7);burst(q,0x6aaa20,20,2,4,.6);kqFlash&&kqFlash(q,0xb8ff4a,3,220);if(!killed||B.dead||!A.f)return;
        sfx&&sfx('brk',.6);S.pusPop++;hurt(B,Math.round(M(B.c)*.03),{col:0xc8ff4a},false);popT(B.m.position,'💥 POP!','#c8ff4a');
        B.bs.lock=Math.max(B.bs.lock,1.2);B.bs.t=Math.max(B.bs.t,1.6);B.bs.dash=null;shake(.12);
        if(S.pusPop>=n){B.dqVul=nowP()+5000;B.dqVulK=1.35;banner('🤢 THE ROT-KING REELS','Every pustule burst — strike now!','+35% damage for 5 seconds');B.bs.lock=Math.max(B.bs.lock,2.4);B.bs.t=Math.max(B.bs.t,2.8);ring(B.m.position,0xc8ff4a,6,500)}}});
    S.pus.push(p)}
  if(!S.pusSeen){S.pusSeen=1;banner('🟢 BILE PUSTULES','Pop them for burst damage and a stagger','Left alone, they erupt into a rain of bile')}else say('🟢 Bile pustules swell on the Rot-King — pop them!')}
function d4Erupt(e,A){const S=A.dq,L=S.pus.filter(p=>!p._gone);if(!L.length)return;say('⚠ The pustules erupt!');const en=1.2*PACE.W;
  L.forEach((p,i)=>{const from=gY(p.m.position,2.6);dqPropGone(p,false);for(let k=0;k<3;k++){const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*7,0,(Math.random()-.5)*7)));if(k==0&&i==0)q.copy(inArena(A,pl.position.clone()));
    const dl=(1.0+k*.18+i*.1)*en;kqLob(A,from,q,dl,0xb8ff4a,1.6);tele(q,1.8,dl,()=>{if(!A.f)return;burst(gY(q,.3),0x9aff6a,16,2,2,.5);if(d2(pl.position,q)<1.8&&hero.iv<=0)bossHit(e,.75);d4Pool(A,q.x,q.z,1.3)})}});S.pus.length=0}
// ---- corpse piles swell into maggot swarms ----
function d4Swell(e,A,idx,en){const S=A.dq,pile=D4.piles[idx],st=S.pileS[idx];if(!pile||st.on)return;st.on=1;const [x,z]=pile,y=GH(x,z),T=S.ph>=3?5.2:S.ph>=2?5.8:6.4;
  const mat=new THREE.MeshStandardMaterial({color:0x9ac85a,emissive:0x3a7a10,emissiveIntensity:.6,roughness:.5,flatShading:true});mat.userData.lps=1;
  const g=new THREE.Group(),sac=new THREE.Mesh(dqG('ico'),mat),gl=kqSpr(0x9aff6a,1.6);sac.position.y=1.15;gl.position.y=1.2;g.add(sac,gl);
  for(let v=0;v<4;v++){const vn=new THREE.Mesh(ARKG.box,new THREE.MeshBasicMaterial({color:0x3a5a12}));vn.scale.set(.04,.9,.04);vn.position.set(Math.cos(v*1.57)*.42,1.15,Math.sin(v*1.57)*.42);vn.rotation.set(Math.sin(v*1.57)*.5,0,-Math.cos(v*1.57)*.5);g.add(vn)}
  let t=0;const w=dqWarn(S,{x,z,r:2.8,t:T,fn:()=>{if(!p._gone){dqPropGone(p,false);d4Burst(e,A,idx)}}});
  const p=dqProp(A,x,z,{n:'Swelling Corpse Pile',frac:S.ph>=3?.04:.034,mesh:g,hbY:2.4,hbS:.9,
    tick(pe,dt,now){t+=dt;const k=Math.min(1,t/T),pul=1+(.06+.14*k)*Math.sin(now/(160-90*k));sac.scale.setScalar((.45+.5*k)*pul);gl.scale.setScalar((1.2+1.6*k)*pul);mat.emissiveIntensity=.5+k;if(Math.random()<dt*6)burst(gY(pe.m.position,1.4),0x9aff6a,1,.6,.8,.5)},
    die(pe,killed){mat.dispose();st.on=0;if(killed){w.kill();burst(gY(pe.m.position,1),0x9aff6a,30,3,3,.6);burst(gY(pe.m.position,1),0x6a1a10,16,2,2,.5);popT(pe.m.position,'☠ PURGED','#c8ff9a')}}});
  burst(V(x,y+1,z),0x9aff6a,24,2,3,.6);say('🪱 A corpse pile swells — destroy it before it bursts into maggots!');popT(V(x,y,z),'SWELLING!','#b8ff6a')}
function d4Burst(e,A,idx){const S=A.dq,[x,z]=D4.piles[idx],o=V(x,0,z),st=S.pileS[idx];st.on=0;if(!A.f||e.dead)return;
  ring(o,0x9aff6a,5,400);burst(gY(o,1),0x9aff6a,60,5,4,.9);burst(gY(o,.8),0x7a2a18,30,4,3,.7);shake(.2);if(d2(pl.position,o)<2.8&&hero.iv<=0)bossHit(e,.9);
  d4Pool(A,x,z,2.0);const live=enemies.filter(q=>q.minion&&!q.dead&&!q.dprop&&q.c.g[0]=='maggot'&&d2(q.m.position,V(A.cx,0,A.cz))<ARENA_R).length,n=Math.min([0,2,3,4][S.ph]||3,9-live);
  for(let k=0;k<n;k++){const a=k/n*6.283+Math.random(),mx=x+Math.cos(a)*1.9,mz=z+Math.sin(a)*1.9;if(solid(mx,mz))continue;const m=spawnEnemy('maggot',mx,mz,Math.max(1,e.c.l-4),{minion:1,agg:1});if(m){m.agg=1;burst(gY(m.m.position,.4),0x9aff6a,10,2,2,.4)}}
  if(n>0)say('🪱 Bloat maggots spill from the pile!')}
// ---- BMV moves (relayed to co-op peers) ----
kqBmv('rotspit',function(e,A,en){const S=A.dq,N=[0,3,4,5][S?S.ph:1]||4,mo=kqMouth(e);kqBossCast(e,0x9aff6a,300);dqPose(e,'throw',.35*en,.3);
  for(let i=0;i<N;i++){const q=inArena(A,pl.position.clone().add(V((Math.random()-.5)*7,0,(Math.random()-.5)*7)));if(i==0)q.copy(inArena(A,pl.position.clone()));const dl=(.95+i*.16)*en;
    kqLob(A,mo,q,dl,0x9aff6a,1.9);tele(q,1.9,dl,()=>{if(!A.f)return;burst(gY(q,.3),0x9aff6a,18,2,2,.5);if(d2(pl.position,q)<1.9&&hero.iv<=0)bossHit(e,.75);d4Pool(A,q.x,q.z,1.6)})}
  return {d:1.4*en,lock:0}});
kqBmv('belch',function(e,A,en){const S=A.dq;if(!S)return {d:.5,lock:0};const o=e.m.position.clone(),a=Math.atan2(pl.position.x-o.x,pl.position.z-o.z),half=.62,L=9.5,T=1.1*en;
  e.m.rotation.y=a;e.bs.face=1;kqBossCast(e,0x9aff6a,T*1000);dqPose(e,'slam',T*.85,.35);
  dqWarn(S,{x:o.x,z:o.z,a,half,l:L,t:T,fn:()=>{e.bs.face=0;if(!A.f||e.dead)return;const s=Math.sin(a),c=Math.cos(a);
    for(let k=0;k<26;k++){const r=1.5+Math.random()*(L-1.5),aa=a+(Math.random()-.5)*2*half*.9;burst(V(o.x+Math.sin(aa)*r,GH(o.x,o.z)+.6+Math.random(),o.z+Math.cos(aa)*r),k%3?0x9aff6a:0x5a8a2a,4,2,1.5,.8)}
    shake(.18);const dx=pl.position.x-o.x,dz=pl.position.z-o.z,dd=Math.hypot(dx,dz);
    if(dd<L&&dqAng(Math.atan2(dx,dz),a)<half&&hero.iv<=0){bossHit(e,1.25);dqDebuff('Rotting','🤢',{mspd:-.35},3000,'Slowed by rot');dn(pl.position,'Rotting!','#9aff6a',-20,800)}
    d4Pool(A,o.x+s*4.2,o.z+c*4.2,1.5)}});
  return {d:1.9*en,lock:1}});
kqBmv('corpsecall',function(e,A,en){const S=A.dq;if(S)d4Swell(e,A,dqDec(en)%4,en);return {d:.8*en,lock:0}});
kqBmv('pustules',function(e,A,en){const S=A.dq;if(S){kqBossCast(e,0xc8ff4a,600);d4Pustules(e,A,en)}return {d:1.1*en,lock:1}});
kqBmv('rottide',function(e,A,en){const S=A.dq;if(!S||S.tide)return {d:.5,lock:0};S.tide={r:15.2*DK,min:8.4*DK,sp:.16*DK};
  banner('☣ THE PIT FLOODS','The rot vats burst — the tide creeps in from the walls','Kill the Rot-King before clean ground runs out');shake(.35);
  D4.vats.forEach(([x,z])=>{burst(V(x,GH(x,z)+1.6,z),0x9aff6a,60,4,5,1);ring(V(x,0,z),0x9aff6a,4,500);d4Pool(A,x+(A.cx-x)*.18,z+(A.cz-z)*.18,2.2)});return {d:1.6*en,lock:1}});
// ---- den hooks ----
DEN[4]={
  build:d4Build,
  start(A,e){const S=dqState(A);dqReset(S);Object.assign(S,{ph:1,pools:S.pools||[],pn:0,cT:8,pT:0,pus:[],pusT:0,tide:null,hz:0,pileS:[0,1,2,3].map(()=>({on:0})),hint:0});
    BSTY[4]=Object.assign(BSTY[4]||{m:'slow',sp:1},{m:'slow',sp:1.0,pool:[['slam','rotspit','belch'],['belch','rotspit','slam','sporering'],['quake','belch','rotspit','sporering']]});
    setTimeout(()=>{if(A.f)say('☣ The Charnel Pit: rot burns and slows you and keeps spreading. Smash swelling corpse piles before they burst.')},2200)},
  tick(A,e,dt,now){const S=A.dq;if(!S||!S.pools)return;dqRun(S,dt);
    const ph=e.bs.ph||1;if(ph>S.ph){S.ph=ph;if(ph==2){S.pT=3}if(ph==3){S.cT=Math.min(S.cT,4);dqAfter(S,1.5,()=>{if(A.f&&!e.dead)dqCast(e,A,'rottide',1.2)})}}
    if(dqAuth(A)&&!e.dead){S.cT-=dt;if(S.cT<=0){S.cT=[0,15,12,9][S.ph]*PACE.I;const free=[0,1,2,3].filter(i=>!S.pileS[i].on);if(free.length){const i=free[(Math.random()*free.length)|0];dqCast(e,A,'corpsecall',dqEnc(1.2,i))}}
      if(S.ph>=2&&!S.pus.some(p=>!p._gone)){S.pT-=dt;if(S.pT<=0){S.pT=[0,0,18,13][S.ph]*PACE.I;dqCast(e,A,'pustules',1.2)}}}
    if(S.pus.length){S.pusT-=dt;if(S.pus.every(p=>p._gone)){S.pus.length=0}else if(S.pusT<=0)d4Erupt(e,A)}
    // pools grow, the oldest dry up
    for(let i=S.pools.length-1;i>=0;i--){const p=S.pools[i];p.age+=dt;if(p.dry){p.r-=dt*.9;if(p.r<=.05){scene.remove(p.ms,p.fr);S.pools.splice(i,1);continue}}
      else if(p.r<p.r0)p.r=Math.min(p.r0,p.r+dt*p.r0*2.5);else p.r=Math.min(p.rMax,p.r+dt*(p.rMax-p.r0)/22);
      p.ms.scale.setScalar(p.r);p.fr.scale.setScalar(p.r*(1+.03*Math.sin(now/300+i)));if(Math.random()<dt*1.2)burst(V(p.x+(Math.random()-.5)*p.r,GH(p.x,p.z)+.15,p.z+(Math.random()-.5)*p.r),0x9aff6a,1,.4,1,.5)}
    if(S.tide){S.tide.r=Math.max(S.tide.min,S.tide.r-S.tide.sp*dt);d4TideDraw(A,now);if(Math.random()<dt*8){const a=Math.random()*6.283;burst(V(A.cx+Math.cos(a)*S.tide.r,GH(A.cx,A.cz)+.2,A.cz+Math.sin(a)*S.tide.r),0x9aff6a,2,.5,1,.5)}}
    // standing in rot burns and slows
    S.hz-=dt;if(d4InRot(A,pl.position)){dqDebuff('Rotting','🤢',{mspd:-.3},700,'Slowed by rot');if(S.hz<=0&&hero.iv<=0){S.hz=.5;bossHit(e,S.ph>=3?.2:.16);if(!S.hint){S.hint=1;say('🤢 The rot burns and slows you — keep to clean ground.')}}}
    if(D4.cur.visible)D4.cur.material.opacity=(Math.hypot(cam.position.x-A.cx,cam.position.z-A.cz)>14.2*DK?.16:.5)+.1*Math.sin(now/260)},
  clear(A,won){const S=A.dq;if(!S)return;dqReset(S);(S.pools||[]).forEach(p=>scene.remove(p.ms,p.fr));S.pools=[];S.pus=[];S.tide=null;D4.tide.visible=D4.tideF.visible=false;
    dqUndebuff('Rotting');const e=bossEnt(A.i);if(e){e.dqVul=0;e.bs.face=0;if(e.m)e.m.ak=null}
    enemies.slice().forEach(q=>{if(q.minion&&!q.dprop&&q.c.g[0]=='maggot'&&d2(q.m.position,V(A.cx,0,A.cz))<ARENA_R+4)removeE(q)});
    if(won){D4.vats.forEach(([x,z])=>burst(V(x,GH(x,z)+1.5,z),0x9aff6a,30,3,4,.8))}},
  seal(A,on){const g=D4.gate,c=D4.cur,gx=A.cx+Math.cos(A.dqA)*15.3*DK,gz=A.cz+Math.sin(A.dqA)*15.3*DK;if(on){c.visible=true;tw(500,k=>{g.position.y=3.9*(1-k*k)},()=>{shake(.25);burst(V(gx,GH(A.cx,A.cz)+.2,gz),0x8a8070,30,3,2,.6)});tw(700,k=>c.material.opacity=.5*k)}
    else{tw(1400,k=>{g.position.y=3.9*k});tw(800,k=>c.material.opacity=.5*(1-k),()=>{if(!A.f)c.visible=false})}}
};

