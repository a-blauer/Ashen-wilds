// ================= v165 The Dirge III — the Ossuary Prisms and the Reliquary =================
// The gateway to the Sovereign's Den at the end of the Ossuary Fields is sealed: five dark glyphs hang in it. Five prisms of the old
// dead's essence float over bone plinths around the fields (dg165PrismPlan, 3260), each its own colour, and at the middle of the
// map stands the Reliquary, a ring of five rune pillars round a cold altar.
//  * F at a prism siphons its essence into you (OS165.sip seconds; stay close). You can hold the charge of one prism at a time.
//  * Carrying a charge, the dead are drawn to you: they rise around you every OS165.gap seconds (OS165.cap at once) until it is
//    delivered. No mount and no recall while you carry it.
//  * F at the rune of the same colour in the Reliquary pours the charge into it; the rune burns. Fall while carrying and the charge
//    flows back to its prism.
//  * All five runes lit: the altar's flame wakes, the beams meet over the Reliquary, and the Den's gateway opens.
// State DG165Q.o: lit[5] (runes lit), st (1 = the Den open). Saved in x2.dg165 (3268). A prism whose rune is lit stays dark.
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
function os165PrismModel(i){const g=new THREE.Group(),c=OS165.col[i];g.userData.psNo=1;
  g.add(lgGroup('DG165|pplinth',k=>{const R=svRng(8100),b=0xb8b098,b2=0x8a8270,st=0x4a4a46;k.p('','cyl','c',st,0,.15,0,1.5,.3,1.5);k.p('','cyl','c',lgCol(st,0x2a2a28,.3),0,.42,0,1.15,.24,1.15);
    // a drum of stacked skulls and long bones bound under a stone cap
    for(let j=0;j<3;j++)for(let q=0;q<9;q++){const a=q/9*6.283+j*.35,y=.7+j*.32;k.p('','sph','c',lgCol(b,b2,R()),Math.cos(a)*.72,y,Math.sin(a)*.72,.17,.18,.2,0,-a+Math.PI/2,0);[-1,1].forEach(s=>k.p('','sph','c',0x080806,Math.cos(a)*.86+Math.cos(a+Math.PI/2)*s*.06,y+.02,Math.sin(a)*.86+Math.sin(a+Math.PI/2)*s*.06,.04,.04,.03))}
    for(let q=0;q<12;q++){const a=q/12*6.283;k.L('','c',b2,[Math.cos(a)*.95,.4,Math.sin(a)*.95],[Math.cos(a)*.8,1.75,Math.sin(a)*.8],.05,.04,5)}
    k.p('','cyl','c',st,0,1.72,0,.9,.18,.9);k.p('','ring','m',0x5a4a2a,0,1.83,0,.82,.5,.82)},0));
  // the prism: a tall faceted crystal turning above the plinth, a bright core, a halo, a faint pillar of light
  const cr=new THREE.Mesh(svG('os165cr',()=>{const q=new THREE.OctahedronGeometry(1,0);q.scale(.42,1.15,.42);return q}),new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.6,shininess:90,transparent:true,opacity:.82,flatShading:true}));
  cr.position.y=3.2;g.add(cr);const core=kqSpr(c,1.6);core.material=core.material.clone();core.position.y=3.2;g.add(core);
  const halo=new THREE.Mesh(svG('os165ha',()=>new THREE.TorusGeometry(.95,.03,6,40)),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));halo.position.y=3.2;halo.rotation.x=Math.PI/2;g.add(halo);
  const beam=new THREE.Mesh(svG('os165bm',()=>{const q=new THREE.CylinderGeometry(.25,.42,46,10,1,true);q.translate(0,23,0);return q}),new THREE.MeshBasicMaterial({color:c,map:SPR,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=2;g.add(beam);
  const lt=new THREE.PointLight(c,1.8,12,1.6);lt.position.y=3.2;g.add(lt);
  return {g,cr,core,halo,beam,lt,i}}
function os165ReliqModel(){const g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('DG165|reliq',k=>{const R=svRng(8200),st=0x5a5852,st2=0x46443e,b=0xb8b098,b2=0x8a8270;
    // the round floor and its steps, flagged, a bone mosaic ring
    k.p('','cyl','c',st2,0,.12,0,9.4,.24,9.4);k.p('','cyl','c',st,0,.3,0,8.6,.16,8.6);k.p('','cyl','c',lgCol(st,0x2a2a28,.4),0,.42,0,2.4,.1,2.4);
    for(let q=0;q<40;q++){const a=q/40*6.283;k.p('','box','c',lgCol(b,b2,R()),Math.cos(a)*4.4,.39,Math.sin(a)*4.4,.5,.04,.18,0,-a,0)}
    for(let q=0;q<24;q++){const a=q/24*6.283;k.p('','box','c',lgCol(st,st2,R()),Math.cos(a)*7.6,.4,Math.sin(a)*7.6,1.6,.05,.9,0,-a,0)}
    // broken arches all round the rim
    for(let q=0;q<10;q++){const a=q/10*6.283+.31;if(q%3==1)continue;const x=Math.cos(a)*9.6,z=Math.sin(a)*9.6,h=3+R()*2.5;k.p('','box','c',st2,x,h/2,z,.8,h,.8,0,-a,0);if(q%3==0)k.p('','box','c',st,Math.cos(a+.3)*9.6,h,Math.sin(a+.3)*9.6,.7,.5,3.2,0,-a-.3+Math.PI/2,0)}
    // the altar: a stepped block with a basin, skulls round it
    k.p('','box','c',st2,0,.8,0,2.2,.8,2.2);k.p('','box','c',st,0,1.35,0,1.6,.4,1.6);k.p('','cyl','m',0x3a3028,0,1.65,0,.6,.2,.6);
    for(let q=0;q<8;q++){const a=q/8*6.283;k.p('','sph','c',lgCol(b,b2,R()),Math.cos(a)*1.2,1.1,Math.sin(a)*1.2,.16,.17,.19,0,-a+Math.PI/2,0)}
    for(let q=0;q<30;q++){const a=R()*6.283,r=2.6+R()*6;k.L('','c',lgCol(b,b2,R()),[Math.cos(a)*r,.4,Math.sin(a)*r],[Math.cos(a)*r+(R()-.5)*.7,.42,Math.sin(a)*r+(R()-.5)*.7],.03,.025,4)}},0));
  // the five rune pillars: obelisks of bone and stone, each with its rune (a glowing slab facing the altar)
  const runes=[];for(let i=0;i<5;i++){const a=i/5*6.283,pg=new THREE.Group();pg.position.set(Math.sin(a)*6.2,.38,Math.cos(a)*6.2);pg.rotation.y=a+Math.PI;g.add(pg);
    pg.add(lgGroup('DG165|rpillar',k=>{const st=0x4e4c46,b=0xb8b098;k.p('','box','c',st,0,.3,0,1.3,.6,1.3);k.p('','box','c',st,0,2.1,0,.8,3.4,.8);k.p('','cone4','c',st,0,4.2,0,.6,.8,.6,0,Math.PI/4,0);
      for(let q=0;q<4;q++)k.p('','sph','c',b,0,.9+q*.75,-.44,.16,.17,.12);for(let q=0;q<6;q++)k.L('','c',0x8a8270,[-.42+q*.17,.6,-.42],[-.42+q*.17,3.6,-.42],.03,.03,4);
      k.p('','box','c',0x1a1a1c,0,2.3,.41,.6,1.5,.04)},0));
    const rm=new THREE.Mesh(svG('os165rn',()=>new THREE.PlaneGeometry(.55,1.1)),new THREE.MeshBasicMaterial({color:OS165.col[i],map:os165RuneTex(i),transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));rm.position.set(0,2.3,.44);pg.add(rm);
    const beam=new THREE.Mesh(svG('os165bm2',()=>{const q=new THREE.CylinderGeometry(.18,.3,40,8,1,true);q.translate(0,20,0);return q}),new THREE.MeshBasicMaterial({color:OS165.col[i],map:SPR,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=4.4;pg.add(beam);
    const lt=new THREE.PointLight(OS165.col[i],0,10,1.6);lt.position.set(0,2.6,1.2);pg.add(lt);runes.push({g:pg,rm,beam,lt,a,i})}
  const fl=kqSpr(0xd8fff0,1.2);fl.material=fl.material.clone();fl.material.opacity=0;fl.position.y=2.4;g.add(fl);const flL=new THREE.PointLight(0xd8fff0,0,18,1.4);flL.position.y=3;g.add(flL);
  return {g,runes,fl,flL}}
// ---------------- the world ----------------
function os165Build(){if(OS165.S)return OS165.S;const Pl=dg165PrismPlan(),S={pr:[],R:null};OS165.S=S;
  Pl.pr.forEach((o,i)=>{const M=os165PrismModel(i),y=GH(o.x,o.z);M.g.position.set(o.x,y,o.z);scene.add(M.g);M.x=o.x;M.z=o.z;M.y=y;S.pr.push(M);for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++)CBLK.add(Math.round(o.z+dv)*W+Math.round(o.x+du))});
  const c=Pl.ctr,R=os165ReliqModel();R.g.position.set(c.x,GH(c.x,c.z),c.z);R.g.rotation.y=c.ry;scene.add(R.g);R.x=c.x;R.z=c.z;S.R=R;
  R.runes.forEach(q=>{const a=q.a+c.ry,x=c.x+Math.sin(a)*6.2,z=c.z+Math.cos(a)*6.2;q.x=x;q.z=z;CBLK.add(Math.round(z)*W+Math.round(x))});for(let du=-1;du<=1;du++)for(let dv=-1;dv<=1;dv++)CBLK.add(Math.round(c.z+dv)*W+Math.round(c.x+du));
  os165GateSync();return S}
function os165Full(i){return !DG165Q.o.lit[i]&&!(OS165.carry&&OS165.carry.i===i)&&!(OS165.net&&OS165.net[i])}
function os165Tick(dt,now){const in3=os165In(),t=now/1000;if(in3&&!OS165.S)try{os165Build()}catch(e){if(!OS165.err++)console.error('v165 prisms',e)}
  const S=OS165.S;if(!S)return;S.pr.forEach(M=>M.g.visible=in3);S.R.g.visible=in3;
  if(!in3){S.pr.forEach(M=>M.lt.intensity=0);S.R.runes.forEach(q=>q.lt.intensity=0);S.R.flL.intensity=0;if(OS165.carry)os165Return('left');OS165.sipping=null;return}
  const P=pl.position;
  S.pr.forEach((M,i)=>{const full=os165Full(i),sip=OS165.sipping&&OS165.sipping.i===i,k=full?1:.12;M.cr.rotation.y+=dt*(sip?3:.6);M.cr.position.y=3.2+.18*Math.sin(t*1.2+i);M.core.position.y=M.cr.position.y;M.halo.position.y=M.cr.position.y;
    M.cr.material.opacity=.3+.55*k;M.cr.material.emissiveIntensity=.15+.6*k*(1+(sip?.6*Math.sin(t*16):0));M.core.material.opacity=.15+.75*k;M.core.scale.setScalar((1.2+.4*k)*(1+.08*Math.sin(t*3+i)));M.halo.rotation.z+=dt*.8;M.halo.material.opacity=.1+.5*k;
    M.beam.material.opacity=.03+.14*k;M.lt.intensity=(.3+1.6*k)*(.9+.1*Math.sin(t*5+i));
    if(full&&Math.hypot(P.x-M.x,P.z-M.z)<50&&Math.random()<dt*4){const a=Math.random()*6.283;burst(V(M.x+Math.cos(a)*1.2,M.y+2+Math.random()*2,M.z+Math.sin(a)*1.2),OS165.col[i],1,.2,.6,.8)}});
  S.R.runes.forEach(q=>{const lit=DG165Q.o.lit[q.i],want=OS165.carry&&OS165.carry.i===q.i;q.rm.material.opacity=lit?.95:want?.35+.3*Math.sin(t*6):.16;q.beam.material.opacity=lit?.32+.06*Math.sin(t*2+q.i):0;q.lt.intensity=lit?1.6:want?.8:0});
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
function os165Aura(on){const A=OS165.aura;if(on){if(!A){const g=new THREE.Group(),c=OS165.col[OS165.carry.i];for(let i=0;i<3;i++){const s=kqSpr(c,.45);s.material=s.material.clone();g.add(s)}const l=new THREE.PointLight(c,1.6,8,1.6);g.add(l);scene.add(g);OS165.aura={g,l}}
    else{A.g.visible=true;const c=OS165.col[OS165.carry.i];A.l.color.setHex(c);A.g.children.forEach(s=>{if(s.isSprite)s.material.color.setHex(c)})}}else if(A)A.g.visible=false}
function os165CarryTick(dt,now){const C=OS165.carry,P=pl.position,t=now/1000;C.t+=dt;if(riding)try{dismount(true)}catch(_){}
  const A=OS165.aura;if(A){A.g.position.set(P.x,P.y+1.2,P.z);A.g.children.forEach((s,i)=>{if(s.isSprite){const a=t*2.4+i*2.094;s.position.set(Math.cos(a)*.7,.3*Math.sin(t*3+i),Math.sin(a)*.7)}});A.l.intensity=1.4+.3*Math.sin(t*6)}
  if(Math.random()<dt*14)burst(gY(P,.6+Math.random()*.8),OS165.col[C.i],1,.2,.5,.6);
  if(Math.random()<dt*.5)dg165Snd('heart',.35,1);
  // the dead rise around the carrier
  C.live=C.live.filter(e=>!e.dead&&enemies.includes(e));C.sp-=dt;const cap=Math.round(OS165.cap*(1+.35*rf165Mates()));
  if(C.sp<=0&&os165Host()){C.sp=OS165.gap*(.8+Math.random()*.4);C.n++;if(C.live.length<cap){os165Rise(P.x,P.z,C.n%5==0?3:2,C)}}}
function os165Host(){return rf165Host()}
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
function os165Finish(){DG165Q.o.st=1;OS165.trkK='';const S=OS165.S;dg165Snd('choir',1.2,.7);dg165Snd('rumble',1,1);shake(.5);
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
