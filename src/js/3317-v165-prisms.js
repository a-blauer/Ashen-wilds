// ================= v165 The Dirge III — the Ossuary Prisms and the Reliquary =================
// The gateway to the Sovereign's Den at the end of the Ossuary Fields is sealed: five dark glyphs hang in it. Five prisms of the old
// dead's essence float over bone plinths around the fields (dg165PrismPlan, 3310), each its own colour, and at the middle of the
// map stands the Reliquary, a ring of five rune pillars round a cold altar.
//  * F at a prism siphons its essence into you (OS165.sip seconds; stay close). You can hold the charge of one prism at a time.
//  * Carrying a charge, the dead are drawn to you: they rise around you every OS165.gap seconds (OS165.cap at once) until it is
//    delivered. No mount and no recall while you carry it.
//  * F at the rune of the same colour in the Reliquary pours the charge into it; the rune burns. Fall while carrying and the charge
//    flows back to its prism.
//  * All five runes lit: the altar's flame wakes, the beams meet over the Reliquary, and the Den's gateway opens.
// State DG165Q.o: lit[5] (runes lit), st (1 = the Den open). Saved in x2.dg165 (3318). A prism whose rune is lit stays dark.
var OS165={sip:2.2,gap:2.7,first:.6,cap:11,lv:null,S:null,carry:null,sipping:null,err:0,trkK:'',
  col:[0x5af0e0,0xb48aff,0xffc050,0xff5a5a,0x8aff6a],cs:['#5af0e0','#b48aff','#ffc050','#ff5a5a','#8aff6a'],nm:['Pale','Violet','Amber','Crimson','Verdant']};
function os165In(){return dg165InG(22)}
function os165N(){return DG165Q.o.lit.filter(Boolean).length}
// ---------------- models ----------------
function os165RuneTex(i){const k='os'+i;OS165.tx=OS165.tx||{};if(OS165.tx[k])return OS165.tx[k];const cv=document.createElement('canvas');cv.width=128;cv.height=256;const g=cv.getContext('2d');g.strokeStyle='#fff';g.lineCap='round';g.lineJoin='round';g.shadowColor='#fff';g.shadowBlur=10;g.lineWidth=11;
  g.beginPath();const P=[[[64,30],[64,226]],[[30,70],[64,110],[98,70]],[[34,180],[64,140],[94,180]],[[40,60],[88,200]],[[88,60],[40,200]]];
  [[0,1],[0,2],[3,4],[0,1,2],[0,3]][i].forEach(j=>{const L=P[j];g.moveTo(...L[0]);for(let q=1;q<L.length;q++)g.lineTo(...L[q])});
  if(i==2){g.moveTo(30,128);g.lineTo(98,128)}if(i==4){g.arc(64,128,34,0,6.283)}if(i==1){g.moveTo(40,226);g.lineTo(88,226)}g.stroke();
  return OS165.tx[k]=new THREE.CanvasTexture(cv)}
// v168: the plinth and the Reliquary sculpted (3345's kit): turned and moulded stone, real skulls and long bones, columns and lintels
// that stand (a broken arch's lintel lies on the ground), bases that run down into the ground on a slope
var OS165W={c:{g:[.6,.4],n:.16,s:.25,m:[0x3e4a36,.9,.35],l:[0xa8a488,.5],sd:21},m:{n:.2,sd:4}};
function os165PrismModel(i){const g=new THREE.Group(),c=OS165.col[i];g.userData.psNo=1;
  g.add(dt168Group('DG165|pplinth168',k=>{const R=svRng(8100),b=0xb8b098,b2=0x8a8270,st=0x4a4a46;
    dt168P(k,dt168Lathe([[0,-.6],[1.55,-.6],[1.55,.22],[1.5,.28],[1.22,.3],[1.2,.4],[1.16,.48],[1.1,.52],[0,.52]],40),'c',st,new THREE.Matrix4());
    // a drum of stacked skulls and long bones bound under a stone cap
    dt168P(k,dt168Lathe([[0,.5],[.72,.5],[.72,1.62],[0,1.62]],24),'c',0x2a2620,new THREE.Matrix4());
    for(let j=0;j<3;j++)for(let q=0;q<11;q++){const a=q/11*6.283+j*.29,y=.72+j*.34;dt168Skull(k,Math.sin(a)*.8,y,Math.cos(a)*.8,a,.3,dt168Mix(b,b2,R()),0,0)}
    for(let q=0;q<14;q++){const a=q/14*6.283+.1,x0=Math.sin(a),z0=Math.cos(a);k.L('','c',dt168Mix(b2,b,R()*.4),[x0*1.0,.5,z0*1.0],[x0*.9,1.62,z0*.9],.035,.03,8);
      [[1.0,.5],[.9,1.62]].forEach(([r,y])=>dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,0],[.8,.6],[0,1]],8),'c',b2,dt168Mx(x0*r,y,z0*r,0,a,0,.05,.045,.06)))}
    dt168P(k,dt168Lathe([[0,1.6],[.98,1.6],[1.02,1.64],[1.02,1.72],[.96,1.78],[.9,1.8],[.88,1.84],[0,1.84]],40),'c',st,new THREE.Matrix4());
    dt168P(k,dt168Geo('ppring',()=>new THREE.TorusGeometry(.9,.035,8,64).rotateX(Math.PI/2)),'m',0x5a4a2a,dt168Mx(0,1.7,0));
    for(let q=0;q<6;q++){const a=q/6*6.283;dt168P(k,dt168BBox(.08,.26,.04,.012),'m',0x5a4a2a,dt168Mx(Math.sin(a)*.97,1.7,Math.cos(a)*.97,0,a,0))}
    for(let q=0;q<8;q++){const a=R()*6.283,r=1.25+R()*.5;k.L('','c',dt168Mix(b,b2,R()),[Math.sin(a)*r,.01,Math.cos(a)*r],[Math.sin(a)*r+(R()-.5)*.4,.03,Math.cos(a)*r+(R()-.5)*.4],.02,.018,6)}},OS165W,.04));
  // the prism: a tall faceted crystal turning above the plinth, a bright core, a halo, a faint pillar of light
  const cr=new THREE.Mesh(svG('os165cr168',()=>{const q=new THREE.LatheGeometry([[0,-1.75],[.5,-1.05],[.62,-.25],[.6,.55],[.48,1.1],[0,1.75]].map(p=>new THREE.Vector2(p[0],p[1])),6);q.computeVertexNormals();return q}),new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.6,shininess:90,transparent:true,opacity:.82,flatShading:true}));
  cr.position.y=3.6;g.add(cr);const core=kqSpr(c,2.4);core.material=core.material.clone();core.position.y=3.2;g.add(core);
  const halo=new THREE.Mesh(svG('os165ha',()=>new THREE.TorusGeometry(1.3,.04,6,48)),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));halo.position.y=3.2;halo.rotation.x=Math.PI/2;g.add(halo);
  const beam=new THREE.Mesh(svG('os165bm',()=>{const q=new THREE.CylinderGeometry(.35,.6,46,10,1,true);q.translate(0,23,0);return q}),new THREE.MeshBasicMaterial({color:c,map:SPR,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=2;g.add(beam);
  const lt=new THREE.PointLight(c,2.2,14,1.5);lt.position.y=3.4;g.add(lt);
  const pool=new THREE.Mesh(svG('dec',()=>new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:c,map:SPR,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));pool.scale.setScalar(3.2);pool.position.y=.54;g.add(pool);
  return {g,cr,core,halo,beam,lt,pool,i}}
// c: the Reliquary's spot {x, z, ry} (the ground under the rim and the columns is sampled so nothing floats)
function os165ReliqModel(c){const g=new THREE.Group();g.userData.psNo=1;c=c||{x:0,z:0,ry:0};const y0=GH(c.x,c.z),ca=Math.cos(c.ry),sa=Math.sin(c.ry);
  const gy=(lx,lz)=>{try{return GH(c.x+ca*lx+sa*lz,c.z-sa*lx+ca*lz)-y0}catch(_){return 0}};let lo=0;for(let q=0;q<24;q++){const a=q/24*6.283;lo=Math.min(lo,gy(Math.sin(a)*9.5,Math.cos(a)*9.5))}
  g.add(dt168Group('DG165|reliq168',k=>{const R=svRng(8200),st=0x5a5852,st2=0x46443e,b=0xb8b098,b2=0x8a8270,bot=Math.min(-.6,lo-.4);
    // the round floor and its two steps, run down into the ground; flagstones in rings, a bone mosaic ring
    dt168P(k,dt168Lathe([[0,bot],[9.5,bot],[9.5,.1],[9.42,.18],[9.3,.22],[8.75,.22],[8.7,.28],[8.62,.36],[0,.36]],64),'c',st2,new THREE.Matrix4());
    [[2.6,3.9,12],[5.0,6.4,22],[6.5,8.5,30]].forEach(([r0,r1,n],j)=>{for(let q=0;q<n;q++){const a=(q+j*.5)/n*6.283,r=(r0+r1)/2,w=2*Math.PI*r/n-.07;
      dt168P(k,dt168BBox(w,.06,r1-r0-.06,.018),'c',dt168Mix(st,st2,R()*.7),dt168Mx(Math.sin(a)*r,.37+R()*.012,Math.cos(a)*r,(R()-.5)*.012,a,(R()-.5)*.012))}});
    for(let q=0;q<48;q++){const a=q/48*6.283,r=4.45;k.L('','c',dt168Mix(b,b2,R()),[Math.sin(a-.05)*r,.39,Math.cos(a-.05)*r],[Math.sin(a+.05)*r,.39,Math.cos(a+.05)*r],.04,.04,6);
      if(q%4==0)dt168Skull(k,Math.sin(a)*4.45,.42,Math.cos(a)*4.45,a+Math.PI,.16,dt168Mix(b,b2,R()))}
    // broken arches round the rim: pairs of columns with a lintel across; on the ruined ones a column snapped and its lintel lies in the grass
    // a column h tall from its foot (a buried footing, a moulded base, the shaft, a capital); broken: snapped off at h, a jagged top
    const colP=(h,brk)=>{const b=[[0,-1.2],[.68,-1.2],[.68,.12],[.64,.16],[.58,.18],[.56,.26],[.5,.3],[.47,.38]];
      return brk?b.concat([[.45,h-.12],[.36,h],[.2,h-.14],[.08,h+.04],[0,h-.06]]):b.concat([[.43,h-.42],[.48,h-.38],[.6,h-.3],[.66,h-.2],[.72,h-.14],[.72,h],[0,h]])};
    for(let q=0;q<10;q++){if(q%3==1)continue;const a=q/10*6.283+.31,h=3+R()*2.5,ruin=q%3==2,a1=a-.17,a2=a+.17,P=[a1,a2].map(t=>[Math.sin(t)*9.85,Math.cos(t)*9.85]);
      const G=P.map(([x,z])=>gy(x,z)),top=Math.max(G[0],G[1])+h;
      P.forEach(([x,z],j)=>{const g0=G[j],hh=+(ruin&&j?h*(.35+R()*.15):top-g0).toFixed(2);dt168P(k,dt168Lathe(colP(hh,ruin&&j),16),'c',st2,dt168Mx(x,g0,z,0,R()*6,0));
        if(ruin&&j)for(let r=0;r<3;r++)dt168P(k,dt168Rock(90+r,1,.5),'c',st2,dt168Mx(x+(R()-.5)*1.6,g0+.05,z+(R()-.5)*1.6,R()*3,R()*3,0,.25,.16,.22))});
      const [x1,z1]=P[0],[x2,z2]=P[1],mx=(x1+x2)/2,mz=(z1+z2)/2,L=Math.hypot(x2-x1,z2-z1)+1.3,ty=Math.atan2(x2-x1,z2-z1);
      if(!ruin)dt168P(k,dt168BBox(.8,.55,L,.06),'c',st,dt168Mx(mx,top+.27,mz,0,ty,0));
      else{const ox=Math.sin(a)*1.5,oz=Math.cos(a)*1.5;dt168P(k,dt168BBox(.8,.55,L,.06),'c',dt168Mix(st,0x3a4a30,.2),dt168Mx(mx+ox,gy(mx+ox,mz+oz)+.2,mz+oz,.08,ty+.35,.1))}}
    // the altar: a moulded block on two steps, a bronze basin, skulls round its foot, long bones scattered over the floor
    dt168P(k,dt168Lathe([[0,.3],[1.25,.3],[1.25,.5],[1.2,.54],[1.0,.56],[1.0,.72],[.96,.76],[.82,.8],[.8,.86],[.78,1.38],[.84,1.42],[.9,1.48],[.92,1.56],[0,1.56]],4),'c',st2,new THREE.Matrix4());
    dt168P(k,dt168Lathe([[0,1.5],[.5,1.52],[.6,1.62],[.64,1.74],[.58,1.76],[.5,1.66],[0,1.64]],24),'m',0x4a3a26,new THREE.Matrix4());
    for(let q=0;q<8;q++){const a=q/8*6.283+.39;dt168Skull(k,Math.sin(a)*1.12,.69,Math.cos(a)*1.12,a,.22,dt168Mix(b,b2,R()))}
    for(let q=0;q<30;q++){const a=R()*6.283,r=2.6+R()*5.8,x=Math.sin(a)*r,z=Math.cos(a)*r,t=R()*6.283,L=.3+R()*.3;k.L('','c',dt168Mix(b,b2,R()),[x,.4,z],[x+Math.cos(t)*L,.41,z+Math.sin(t)*L],.022,.018,6);
      [0,1].forEach(e=>dt168P(k,dt168Lathe([[0,-1],[.8,-.6],[1,0],[.8,.6],[0,1]],6),'c',b,dt168Mx(x+e*Math.cos(t)*L,.405,z+e*Math.sin(t)*L,0,0,0,.035,.03,.035)))}},OS165W,.04));
  // the five rune pillars: obelisks of stone faced with bone, each with its rune (a glowing slab facing the altar)
  const runes=[];for(let i=0;i<5;i++){const a=i/5*6.283,pg=new THREE.Group();pg.position.set(Math.sin(a)*6.2,.36,Math.cos(a)*6.2);pg.rotation.y=a+Math.PI;g.add(pg);
    pg.add(dt168Group('DG165|rpillar168',k=>{const st=0x4e4c46,b=0xb8b098,R=svRng(8300);
      dt168P(k,dt168Lathe([[0,0],[.68,0],[.68,.4],[.64,.44],[.56,.46],[.54,.54],[.48,.58],[.44,.62],[.4,3.6],[.46,3.64],[.48,3.72],[.42,3.78],[0,4.6]],4),'c',st,new THREE.Matrix4());
      dt168P(k,dt168BBox(.62,1.55,.05,.02),'c',0x1a1a1c,dt168Mx(0,2.3,.425));dt168P(k,dt168BBox(.72,1.65,.04,.015),'c',dt168Mix(st,b,.25),dt168Mx(0,2.3,.418));
      for(let q=0;q<4;q++)dt168Skull(k,0,.95+q*.72,-.47,Math.PI,.26,dt168Mix(b,0x8a8270,R()));
      for(let q=0;q<6;q++){if(q==2||q==3)continue;k.L('','c',0x8a8270,[-.36+q*.144,.62,-.43],[-.34+q*.136,3.55,-.41],.028,.026,6)}},OS165W,.04));
    const rm=new THREE.Mesh(svG('os165rn',()=>new THREE.PlaneGeometry(.7,1.4)),new THREE.MeshBasicMaterial({color:OS165.col[i],map:os165RuneTex(i),transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));rm.position.set(0,2.3,.46);pg.add(rm);
    const beam=new THREE.Mesh(svG('os165bm2',()=>{const q=new THREE.CylinderGeometry(.18,.3,40,8,1,true);q.translate(0,20,0);return q}),new THREE.MeshBasicMaterial({color:OS165.col[i],map:SPR,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=4.6;pg.add(beam);
    const lt=new THREE.PointLight(OS165.col[i],0,12,1.5);lt.position.set(0,2.6,1.2);pg.add(lt);const fl=kqSpr(OS165.col[i],1.6);fl.material=fl.material.clone();fl.material.opacity=0;fl.position.y=4.9;pg.add(fl);runes.push({g:pg,rm,beam,lt,fl,a,i})}
  const fl=kqSpr(0xd8fff0,1.2);fl.material=fl.material.clone();fl.material.opacity=0;fl.position.y=2.2;g.add(fl);const flL=new THREE.PointLight(0xd8fff0,0,18,1.4);flL.position.y=3;g.add(flL);
  return {g,runes,fl,flL}}
// ---------------- the world ----------------
function os165Build(){if(OS165.S)return OS165.S;const Pl=dg165PrismPlan(),S={pr:[],R:null};OS165.S=S;
  Pl.pr.forEach((o,i)=>{const M=os165PrismModel(i),y=GH(o.x,o.z);M.g.position.set(o.x,y,o.z);scene.add(M.g);M.x=o.x;M.z=o.z;M.y=y;S.pr.push(M);for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++)CBLK.add(Math.round(o.z+dv)*W+Math.round(o.x+du))});
  const c=Pl.ctr,R=os165ReliqModel(c);R.g.position.set(c.x,GH(c.x,c.z),c.z);R.g.rotation.y=c.ry;scene.add(R.g);R.x=c.x;R.z=c.z;S.R=R;
  R.runes.forEach(q=>{const a=q.a+c.ry,x=c.x+Math.sin(a)*6.2,z=c.z+Math.cos(a)*6.2;q.x=x;q.z=z;CBLK.add(Math.round(z)*W+Math.round(x))});for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++)CBLK.add(Math.round(c.z+dv)*W+Math.round(c.x+du));
  os165GateSync();return S}
function os165Full(i){if(OS165.net&&OS165.net[i]&&!(typeof dg165CoOn=='function'&&dg165CoOn()))delete OS165.net[i];return !DG165Q.o.lit[i]&&!(OS165.carry&&OS165.carry.i===i)&&!(OS165.net&&OS165.net[i])}
function os165Tick(dt,now){const in3=os165In(),t=now/1000;if(in3&&!OS165.S)try{os165Build()}catch(e){if(!OS165.err++)console.error('v165 prisms',e)}
  const S=OS165.S;if(!S)return;S.pr.forEach(M=>M.g.visible=in3);S.R.g.visible=in3;
  if(!in3){S.pr.forEach(M=>M.lt.intensity=0);S.R.runes.forEach(q=>q.lt.intensity=0);S.R.flL.intensity=0;if(OS165.carry)os165Return('left');OS165.sipping=null;return}
  const P=pl.position;
  S.pr.forEach((M,i)=>{const full=os165Full(i),sip=OS165.sipping&&OS165.sipping.i===i,k=full?1:.12;M.cr.rotation.y+=dt*(sip?3:.6);M.cr.position.y=3.6+.18*Math.sin(t*1.2+i);M.core.position.y=M.cr.position.y;M.halo.position.y=M.cr.position.y;
    M.cr.material.opacity=.3+.55*k;M.cr.material.emissiveIntensity=.15+.6*k*(1+(sip?.6*Math.sin(t*16):0));M.core.material.opacity=.15+.75*k;M.core.scale.setScalar((1.2+.4*k)*(1+.08*Math.sin(t*3+i)));M.halo.rotation.z+=dt*.8;M.halo.material.opacity=.1+.5*k;
    M.beam.material.opacity=.04+.26*k;M.pool.material.opacity=.08+.42*k;M.lt.intensity=(.3+1.6*k)*(.9+.1*Math.sin(t*5+i));
    if(full&&Math.hypot(P.x-M.x,P.z-M.z)<50&&Math.random()<dt*4){const a=Math.random()*6.283;burst(V(M.x+Math.cos(a)*1.2,M.y+2+Math.random()*2,M.z+Math.sin(a)*1.2),OS165.col[i],1,.2,.6,.8)}});
  S.R.runes.forEach(q=>{const lit=DG165Q.o.lit[q.i],want=OS165.carry&&OS165.carry.i===q.i;q.rm.material.opacity=lit?.95:want?.35+.3*Math.sin(t*6):.16;q.beam.material.opacity=lit?.5+.08*Math.sin(t*2+q.i):0;q.lt.intensity=lit?2.4:want?1:0;q.fl.material.opacity=lit?.9:0;q.fl.scale.setScalar(1.5+.25*Math.sin(t*5+q.i))});
  const done=dg165ODone();S.R.fl.material.opacity=done?.85:0;S.R.fl.scale.setScalar(done?2.2+.3*Math.sin(t*4):1);S.R.flL.intensity=done?2.2:0;
  if(OS165.sipping)os165SipTick(dt,now);if(OS165.carry)os165CarryTick(dt,now);
  if(now-(OS165.tt||0)>400){OS165.tt=now;if(!OS165.gs){OS165.gs=1;os165GateSync()}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{os165Tick(dt,now)}catch(e){if(!OS165.err++)console.error('v165 prisms tick',e)}return r}}
// ---------------- siphoning ----------------
function os165SipStart(i){if(OS165.carry||OS165.sipping||!os165Full(i))return;try{if(riding)dismount(true)}catch(_){}const M=OS165.S.pr[i];
  OS165.sipping={i,t:0,x:pl.position.x,z:pl.position.z,hp:hero.hp};dg165Snd('choir',.5,.8+i*.08);svSnd('charge',.6,.6);say('◆ You draw the '+OS165.nm[i]+' essence out of the prism…')}
function os165SipTick(dt,now){const Q=OS165.sipping,M=OS165.S.pr[Q.i],P=pl.position;if(Math.hypot(P.x-Q.x,P.z-Q.z)>1.2||hero.hp<Q.hp-1||!os165Full(Q.i)){OS165.sipping=null;say('◆ The siphon breaks.');return}
  Q.t+=dt;if(Math.random()<dt*30){const k=Math.random(),a=V(M.x,M.y+3.2,M.z),b=gY(P,1.1);burst(a.lerp(b,k),OS165.col[Q.i],1,.15,.2,.35)}
  if(Q.t>=OS165.sip){OS165.sipping=null;os165Take(Q.i,true)}}
function os165Take(i,mine){const M=OS165.S&&OS165.S.pr[i];if(mine){OS165.carry={i,t:0,sp:OS165.first,n:0,live:[]};os165Aura(true);
    dg165Snd('chime',.8,.7+i*.1);dg165Snd('wail',.6,.8);shake(.15);dg165Fear(.4);if(M)svShock(V(M.x,0,M.z),OS165.col[i],4,.5);
    dg165Title('The '+OS165.nm[i]+' Essence','The dead feel it in you. They are coming.','Carry it to its rune in the Reliquary','The Ossuary Fields');dg165Co('take',i)}
  OS165.trkK=''}
// ---------------- carrying: the aura and the dead it draws ----------------
function os165Aura(on){const A=OS165.aura;if(on){if(!A){const g=new THREE.Group(),c=OS165.col[OS165.carry.i];for(let i=0;i<3;i++){const s=kqSpr(c,.7);s.material=s.material.clone();g.add(s)}const core=kqSpr(c,1.4);core.material=core.material.clone();core.material.opacity=.45;g.add(core);const l=new THREE.PointLight(c,2,9,1.5);g.add(l);scene.add(g);OS165.aura={g,l}}
    else{A.g.visible=true;const c=OS165.col[OS165.carry.i];A.l.color.setHex(c);A.g.children.forEach(s=>{if(s.isSprite)s.material.color.setHex(c)})}}else if(A)A.g.visible=false}
function os165CarryTick(dt,now){const C=OS165.carry,P=pl.position,t=now/1000;C.t+=dt;if(riding)try{dismount(true)}catch(_){}
  const A=OS165.aura;if(A){A.g.position.set(P.x,P.y+1.2,P.z);A.g.children.forEach((s,i)=>{if(s.isSprite){const a=t*2.4+i*2.094;s.position.set(Math.cos(a)*.7,.3*Math.sin(t*3+i),Math.sin(a)*.7)}});A.l.intensity=1.4+.3*Math.sin(t*6)}
  if(Math.random()<dt*14)burst(gY(P,.6+Math.random()*.8),OS165.col[C.i],1,.2,.5,.6);
  if(Math.random()<dt*.5)dg165Snd('heart',.35,1);
  // the dead rise around the carrier
  C.live=C.live.filter(e=>!e.dead&&enemies.includes(e));C.sp-=dt;const cap=Math.round(OS165.cap*(1+.35*rt165Mates()));
  if(C.sp<=0&&os165Host()){C.sp=OS165.gap*(.8+Math.random()*.4);C.n++;if(C.live.length<cap){os165Rise(P.x,P.z,C.n%5==0?3:2,C)}}}
function os165Host(){return rt165Host()}
var OS165K=['bonehound','bonehound','skeleton','bonearcher','bonehound'];
function os165Rise(x,z,n,C,peer){const lv=dg165Lv(22),ok=dg165PrismPlan().ok;for(let k=0;k<n;k++){let px=x,pz=z;for(let tr=0;tr<14;tr++){const a=Math.random()*6.283,r=8+Math.random()*6;const qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(ok(qx,qz,.4)){px=qx;pz=qz;break}}
  const big=C&&C.n%7==0&&k==0,key=big?'colossus':OS165K[(Math.random()*OS165K.length)|0];
  setTimeout(()=>{let e=null;try{e=spawnEnemy(key,px,pz,lv[0]+((Math.random()*3)|0),{agg:1})}catch(err){console.warn('v165 rise',err)}if(!e)return;e.agg=1;e.hunt=1;e.os165=1;if(C&&C.live)C.live.push(e);
    burst(gY(V(px,0,pz),.3),0xc8c0a8,22,2,2.5,.8);svDecal(V(px,0,pz),0x1a1814,1.4,2.4,.8);if(Math.hypot(px-pl.position.x,pz-pl.position.z)<20)dg165Snd('gasp',.5,.7+Math.random()*.3)},k*260)}}
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return e&&e.os165?k*.4:k}}
{const f=lootE;lootE=function(e){if(e&&e.os165&&Math.random()>=.3)return;return f.apply(this,arguments)}}
// ---------------- delivering, or losing it ----------------
function os165Give(i,mine){if(DG165Q.o.lit[i])return;DG165Q.o.lit[i]=1;if(mine){OS165.carry=null;os165Aura(false);dg165Co('lit',i)}OS165.trkK='';const S=OS165.S,q=S&&S.R.runes[i];
  if(q){svShock(V(q.x,0,q.z),OS165.col[i],5,.6);burst(V(q.x,GH(q.x,q.z)+3,q.z),OS165.col[i],60,3,4,1)}dg165Snd('chime',1,.6+i*.1);svSnd('bell',.8,.8+i*.1);shake(.2);
  const n=os165N();if(n<5){dg165Title('The '+OS165.nm[i]+' Rune Burns',n+' of 5 runes lit','Siphon another prism','The Ossuary Fields');say('◆ The '+OS165.nm[i]+' rune drinks the essence and burns ('+n+'/5).')}
  else setTimeout(os165Finish,1200);os165GateSync()}
function os165Return(why){const C=OS165.carry;if(!C)return;OS165.carry=null;os165Aura(false);OS165.trkK='';const i=C.i,S=OS165.S,M=S&&S.pr[i];
  if(M&&os165In()){const s=kqSpr(OS165.col[i],.9),a=gY(pl.position,1.2),b=V(M.x,M.y+3.2,M.z),mid=a.clone().lerp(b,.5);mid.y+=6;s.position.copy(a);scene.add(s);let t=0;
    kqFx({tick(dt){t+=(dt||.016)/1.4;const k=Math.min(1,t),u=1-k;s.position.set(u*u*a.x+2*u*k*mid.x+k*k*b.x,u*u*a.y+2*u*k*mid.y+k*k*b.y,u*u*a.z+2*u*k*mid.z+k*k*b.z);if(Math.random()<.6)burst(s.position.clone(),OS165.col[i],1,.15,.2,.5);if(k>=1){scene.remove(s);burst(b,OS165.col[i],20,1.5,1.5,.6);return false}return true},end(){if(s.parent)scene.remove(s)}})}
  say(why=='dead'?'◆ As you fall, the '+OS165.nm[i]+' essence tears free of you and streams back to its prism.':'◆ The '+OS165.nm[i]+' essence slips away from you, back to its prism.');dg165Co('ret',i)}
{const f=down;down=function(){const r=f.apply(this,arguments);try{if(OS165.carry&&((typeof AWD!='undefined'&&AWD.dead)||(typeof RV148!='undefined'&&RV148.down)||hero.hp<=0))os165Return('dead')}catch(_){}return r}}
function os165Finish(){if(OS165.fin)return;OS165.fin=1;DG165Q.o.st=1;OS165.trkK='';const S=OS165.S;dg165Snd('choir',1.2,.7);dg165Snd('rumble',1,1);shake(.5);
  if(S){S.R.runes.forEach(q=>{svShock(V(q.x,0,q.z),OS165.col[q.i],7,.8)});svShock(V(S.R.x,0,S.R.z),0xd8fff0,12,1.2);burst(V(S.R.x,GH(S.R.x,S.R.z)+3,S.R.z),0xd8fff0,120,5,6,1.2)}
  os165GateSync();const r=RPORT.find(q=>q.k=='next'&&q.ig===22);if(r)setTimeout(()=>{svShock(V(r.x,0,r.z),0xd8fff0,6,.7);burst(gY(V(r.x,0,r.z),1.2),0xd8fff0,70,3,3,1)},900);
  setTimeout(()=>{dg165Title('The Den Is Open','Five runes burn as one. The gateway to '+PMAP[4].ins[3].n+' opens.','Face '+BOSSES[4].name+' at the end of the road');try{mSfx('victory')}catch(_){}say('🌀 All five runes burn: the gateway at the end of '+INSL[22].n+' now leads to the Den.')},1000);dg165Co('ofin',0)}
// ---------------- the gateway to the Den: sealed until the runes burn ----------------
function os165GateSync(){const r=RPORT.find(q=>q.k=='next'&&q.ig===22);if(!r||!r.disc)return;if(OS165.gc==null)OS165.gc=r.disc.material.color.getHex();const on=dg165ODone(),m=r.disc.material;
  m.color.copy(new THREE.Color(0x101014).lerp(new THREE.Color(OS165.gc),on?1:0));m.opacity=on?.8:.3;
  if(!OS165.gg){const G=new THREE.Group();G.position.set(0,1.2,.05);r.g.add(G);OS165.gg=G;for(let i=0;i<5;i++){const s=new THREE.Mesh(svG('os165gg',()=>new THREE.PlaneGeometry(.28,.56)),new THREE.MeshBasicMaterial({color:OS165.col[i],map:os165RuneTex(i),transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));s.position.set((i-2)*.42,1.0,0);G.add(s)}}
  OS165.gg.children.forEach((s,i)=>{s.material.opacity=DG165Q.o.lit[i]||on?.9:.2})}
function os165AtGate(){const P=pl.position;for(const r of RPORT)if(r.k=='next'&&r.ig===22&&Math.hypot(P.x-r.x,P.z-r.z)<2.8)return true;return false}
{const f=portalPrompt;portalPrompt=function(){const r=f.apply(this,arguments);try{if(r&&!dg165ODone()&&os165AtGate())return {label:'🔒 The way to the Den is sealed · light the five runes of the Reliquary ('+os165N()+'/5)',fn:()=>say('🌀 Five dark glyphs hang in the arch. Carry the essence of the five prisms to the Reliquary at the heart of '+INSL[22].n+'.')}}catch(_){}return r}}
// ---------------- prompts ----------------
function os165Prompt(){if(!os165In()||!OS165.S)return null;const P=pl.position,S=OS165.S;
  if(OS165.sipping)return {label:'◆ Siphoning… '+Math.round(OS165.sipping.t/OS165.sip*100)+'%',fn:()=>{OS165.sipping=null}};
  for(const M of S.pr){if(Math.hypot(P.x-M.x,P.z-M.z)>2.9)continue;const i=M.i;
    if(DG165Q.o.lit[i])return {label:'◆ The '+OS165.nm[i]+' prism · its essence burns in the Reliquary',fn:()=>{}};
    if(OS165.carry)return OS165.carry.i===i?{label:'◆ You carry this prism’s essence · take it to the Reliquary',fn:()=>{}}:{label:'◆ You can hold only one charge · deliver the '+OS165.nm[OS165.carry.i]+' essence first',fn:()=>{}};
    if(!os165Full(i))return {label:'◆ Someone carries this prism’s essence',fn:()=>{}};
    return {label:'F · Siphon the '+OS165.nm[i]+' prism',fn:()=>os165SipStart(i)}}
  for(const q of S.R.runes){if(Math.hypot(P.x-q.x,P.z-q.z)>2.7)continue;const i=q.i;
    if(DG165Q.o.lit[i])return {label:'◆ The '+OS165.nm[i]+' rune burns',fn:()=>{}};
    if(OS165.carry&&OS165.carry.i===i)return {label:'F · Pour the '+OS165.nm[i]+' essence into its rune',fn:()=>os165Give(i,true)};
    return {label:'◆ The '+OS165.nm[i]+' rune is cold · it wants the '+OS165.nm[i]+' prism’s essence',fn:()=>{}}}
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=os165Prompt();if(r)return r}catch(e){if(!OS165.err++)console.warn('v165 prism prompt',e)}return f.apply(this,arguments)}}
// no mount, no recall with a charge
{const f=toggleMount;toggleMount=function(){if(OS165.carry&&!riding)return say('◆ The essence would scatter at a gallop. Carry it on foot.');return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){if(OS165.carry)return say('◆ Not with the essence in you: it would be lost. Deliver it first.');return f.apply(this,arguments)}}
// ---------------- the tracker (Dirge III) ----------------
SP152.trk.dirgeIII=I=>{if(I.g!==22||(dg165ODone()&&insReach(4)>=3))return null;const n=os165N();
  if(dg165ODone())return {name:'The Five Runes',lines:[['Step through the gateway to the Den',null,1]]};
  const C=OS165.carry,L=[['Runes lit',n+'/5']];if(C)L.unshift(['Carrying the '+OS165.nm[C.i]+' essence'],['Take it to its rune in the Reliquary',null,1]);else L.unshift(['Siphon a prism (look for the pillars of light)'],['Carry its essence to the Reliquary']);
  return {name:'The Five Runes',lines:L}};
// ---------------- the minimap: the prisms and the Reliquary ----------------
function os165Marks(g,P,k){if(!os165In())return;const Pl=dg165PrismPlan();Pl.pr.forEach((o,i)=>{const q=P(o.x,o.z);if(!q)return;g.save();g.translate(q[0],q[1]);g.scale(k,k);const lit=DG165Q.o.lit[i];
    g.beginPath();g.moveTo(0,-5);g.lineTo(3.4,0);g.lineTo(0,5);g.lineTo(-3.4,0);g.closePath();g.fillStyle=lit?'#2a2a2a':OS165.cs[i];g.globalAlpha=lit?.5:1;g.fill();g.lineWidth=1.2/k;g.strokeStyle='#101010';g.stroke();g.restore()});
  const c=Pl.ctr,q=P(c.x,c.z);if(q){g.save();g.translate(q[0],q[1]);g.scale(k,k);g.beginPath();g.arc(0,0,5.5,0,6.283);g.fillStyle='#14161a';g.fill();g.lineWidth=1.6/k;g.strokeStyle='#d8fff0';g.stroke();
    for(let i=0;i<5;i++){const a=i/5*6.283;g.beginPath();g.arc(Math.sin(a)*3.4,-Math.cos(a)*3.4,1.1,0,6.283);g.fillStyle=DG165Q.o.lit[i]?OS165.cs[i]:'#3a3a3a';g.fill()}g.restore()}}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{os165Marks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
