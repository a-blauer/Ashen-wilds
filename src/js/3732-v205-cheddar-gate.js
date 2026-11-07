// ================= v205 The Citadel I · Cheddar at the Great Gate: his window, the four ingredients, the ritual circle =================
// Cheddar (the quest-giving mouse of Duskhold, chd132Model) has come ahead to the Citadel and stands before the Great Gate, reading
// the seal. Talking to him (F, window XR.ch205) explains it: a seal woven in the court's blood unwinds only with the court's own.
//  * The ingredients (CH205.ING): one from each kind of creature of The Citadel I. Once he has asked for them (CQ205.c1.st 1), each
//    kill of that kind drops its ingredient (CH205.drop, while it is not carried and none lies on the ground); walk over it to take
//    it (kind 'cq205' through take). They show in the bag's Materials tab under Quest items and on the tracker.
//  * With all four, F gives them to him (st 2): he sets one in each bowl of his ritual circle (four iron braziers round a circle of
//    wards painted on the flagstones), and each burns with its own fire. "Begin the unbinding" starts 3733 (US205).
//  * His poses on top of the model's own (chd132's idle / alert): 'read' (paw at chin, peering up at the seal), 'cast' (both paws
//    raised, a floating tome, threads of light), 'hurt' (a flinch), 'down' (collapsed), and a walk (legs and arms swinging) when he
//    moves between his spot by the gate and the circle (CH205.to).
var CH205={C:null,g:null,ring:null,brz:[],pose:'read',w:{},to:null,sp:0,hit:0,err:0,tab:'hi',drop:.3,
  ING:[{k:'ash',n:'Grave Ash',from:'Vampire Thrall',en:'vamp',ic:'🏺',col:0xd8d0c8,fl:0xcfd8e8,d:'the dust a thrall leaves when the blood runs out of it'},
       {k:'heart',n:'Nightwing Heart',from:'Blood Bat',en:'bloodbat',ic:'🦇',col:0x8a1020,fl:0xff2a3a,d:'a blood bat’s heart: still beating, slowly'},
       {k:'signet',n:'Crimson Signet',from:'Blood Knight',en:'vampk',ic:'💍',col:0xc8a040,fl:0xffc860,d:'the ring each Blood Knight swears on'},
       {k:'ink',n:'Sanguine Ink',from:'Blood Magister',en:'vampm',ic:'🩸',col:0x6a1430,fl:0xc050ff,d:'the blood-ink the magisters write their seals in'}]};
// where he stands: by the gate (reading the seal) and at the centre of his circle (casting); the circle's bowls
function ch205Spots(){if(ch205Spots.c)return ch205Spots.c;const S=gg205Spot(),G={W0:14.5,fz:.6};const W=(lx,lz)=>{const [x,z]=cq205GW(S,lx,lz);return {x,z,y:GH(x,z)}};
  const c=W(0,G.fz+8.4),R={read:W(-3.2,G.fz+5.4),circ:c,r:3.0,face:Math.atan2(S.x-c.x,S.z-c.z),bowls:[]};
  for(let i=0;i<4;i++){const a=S.ry+Math.PI/4+i*Math.PI/2,x=c.x+Math.sin(a)*3.0,z=c.z+Math.cos(a)*3.0;R.bowls.push({x,z,y:GH(x,z),a})}
  return ch205Spots.c=R}
// ---------------- the models: Cheddar, the circle, the bowls, the ingredients ----------------
function ch205Ing(i){const key='CQ205|ing'+i;return dt168Group(key,k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    if(i===0){P(dt168Lathe([[0,0],[.09,0],[.13,.06],[.14,.14],[.1,.22],[.06,.25],[.08,.29],[0,.29]],8),'c',0x3a3436,0,0,0);P(dt168Geo('cq_ashp',()=>svLump(.07,0,.4,2091)),'g',0xb8b0a8,0,.27,0,0,0,0,1,.6,1)}
    else if(i===1){P(dt168Geo('cq_hrt',()=>svLump(.13,1,.25,2092)),'c',0x6a0c18,0,.13,0,0,0,0,1,1.15,.9);for(let v=0;v<4;v++)P(dt168Geo('cq_hv',()=>new THREE.BoxGeometry(.012,.16,.012)),'g',0xff2a3a,Math.sin(v*1.6)*.11,.13,Math.cos(v*1.6)*.1,0,v*1.6,.3);
      P(dt168Geo('cq_hao',()=>new THREE.CylinderGeometry(.03,.04,.08,6)),'c',0x5a0a14,.03,.28,0,0,0,.4)}
    else if(i===2){P(dt168Geo('cq_sig',()=>new THREE.TorusGeometry(.1,.028,5,14)),'m',0xc8a040,0,.12,0);P(dt168Geo('cq_sgm',()=>new THREE.OctahedronGeometry(.05,0)),'g',0xff2a30,0,.235,0);P(dt168Geo('cq_sgb',()=>new THREE.CylinderGeometry(.045,.05,.03,6)),'m',0xa08030,0,.21,0)}
    else{P(dt168Lathe([[0,0],[.06,0],[.08,.05],[.08,.16],[.03,.21],[.03,.26],[0,.26]],8),'c',0x3a2a34,0,0,0);P(dt168Lathe([[0,0],[.07,0],[.07,.14],[0,.14]],8),'g',0xc01848,0,.02,0,0,0,0,.98,1,.98);P(dt168Geo('cq_cork',()=>new THREE.CylinderGeometry(.032,.028,.05,6)),'c',0x6a4a2a,0,.28,0)}},
    {c:{n:.12,sd:210+i},m:{n:.1,sd:214}})}
function ch205Bowl(){return dt168Group('CQ205|bowl',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;P(dt168Geo('cq_tl',()=>new THREE.CylinderGeometry(.035,.05,1.0,5)),'m',0x2a2628,Math.sin(a)*.22,.48,Math.cos(a)*.22,-.22*Math.cos(a),0,.22*Math.sin(a))}
    P(dt168Lathe([[0,0],[.12,0],[.32,.12],[.4,.22],[.37,.24],[.28,.15],[0,.12]],10),'m',0x34302e,0,.92,0);P(dt168Geo('cq_bwc',()=>svLump(.26,0,.35,2093)),'c',0x1a1410,0,1.04,0,0,0,0,1,.25,1)},{m:{g:[1,.3],n:.14,sd:215}})}
// the wards on the flagstones: a ring of pale runes (canvas), lit as he casts
function ch205RingTex(){if(CH205.rt)return CH205.rt;const N=512,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C=N/2,rn=svRng(2095);x.strokeStyle='#fff';x.lineCap='round';
  const circ=(r,w)=>{x.lineWidth=w;x.beginPath();x.arc(C,C,r,0,Math.PI*2);x.stroke()};circ(244,6);circ(228,2);circ(150,3);circ(138,2);
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;x.save();x.translate(C+Math.cos(a)*188,C+Math.sin(a)*188);x.rotate(a);x.lineWidth=3;x.beginPath();const q=Math.floor(rn()*4);
    if(q==0){x.moveTo(-8,0);x.lineTo(8,0);x.moveTo(0,-9);x.lineTo(0,9)}else if(q==1){x.arc(0,0,7,0,Math.PI*1.5)}else if(q==2){x.moveTo(-8,-8);x.lineTo(0,8);x.lineTo(8,-8)}else{x.moveTo(-7,6);x.lineTo(0,-8);x.lineTo(7,6);x.lineTo(-7,6)}x.stroke();x.restore()}
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;x.lineWidth=4;x.beginPath();x.moveTo(C+Math.cos(a)*140,C+Math.sin(a)*140);x.lineTo(C+Math.cos(a)*236,C+Math.sin(a)*236);x.stroke()}
  x.lineWidth=3;x.beginPath();for(let i=0;i<=4;i++){const a=i/4*Math.PI*2+Math.PI/4;const px=C+Math.cos(a)*138,py=C+Math.sin(a)*138;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
  const t=new THREE.CanvasTexture(c);return CH205.rt=t}
function ch205Build(){if(CH205.g)return CH205;const R=ch205Spots();const g=new THREE.Group();g.name='CQ205Cheddar';scene.add(g);CH205.g=g;
  let C=null;try{C=chd132Model({game:true})}catch(e){console.error('v205 cheddar model',e)}
  if(C){C.root.scale.setScalar((typeof CHQ132_SC!='undefined'?CHQ132_SC:1.1)*1.12);C.root.userData.psNo=1;C.root.userData.noFarCull=1;g.add(C.root);C.setPose&&C.setPose('idle');CH205.C=C}
  // his tome, floating in front of him while he casts (open pages, a glow)
  const tm=new THREE.Group();const pg=new THREE.MeshStandardMaterial({color:0xd8ccaa,roughness:.9,flatShading:true}),cv=new THREE.MeshStandardMaterial({color:0x4a1a12,roughness:.8,flatShading:true});
  [-1,1].forEach(s=>{const c=new THREE.Mesh(new THREE.BoxGeometry(.17,.01,.22),cv);c.position.set(s*.085,0,0);c.rotation.z=-s*.18;tm.add(c);const p=new THREE.Mesh(new THREE.BoxGeometry(.15,.02,.2),pg);p.position.set(s*.075,.012,0);p.rotation.z=-s*.14;tm.add(p)});
  const tg=kqSpr(0xffe8b0,.6);tg.position.y=.08;tm.add(tg);tm.visible=false;g.add(tm);CH205.tome=tm;
  // the ward dome round him while he casts (his health shows in its glow)
  const dm=new THREE.Mesh(new THREE.SphereGeometry(1.25,18,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
  dm.userData.lpsSkip=1;dm.renderOrder=3;g.add(dm);CH205.dome=dm;
  // the circle and its four bowls
  const rg=new THREE.Mesh(new THREE.CircleGeometry(R.r+.5,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ch205RingTex(),color:0xffd890,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,fog:true,polygonOffset:true,polygonOffsetFactor:-4}));
  rg.position.set(R.circ.x,R.circ.y+.06,R.circ.z);rg.userData.lpsSkip=1;rg.renderOrder=2;scene.add(rg);CH205.ring=rg;
  const fl=new THREE.Mesh(new THREE.CircleGeometry(R.r+.9,24).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a2428,roughness:.95,flatShading:true,polygonOffset:true,polygonOffsetFactor:-2}));
  fl.position.set(R.circ.x,R.circ.y+.03,R.circ.z);scene.add(fl);CH205.floor=fl;
  CH205.brz=R.bowls.map((b,i)=>{const o=ch205Bowl();o.position.set(b.x,b.y,b.z);scene.add(o);const ing=ch205Ing(i);ing.position.set(0,1.1,0);ing.scale.setScalar(1.6);ing.visible=false;o.add(ing);
    const f=kqSpr(CH205.ING[i].fl,1.2);f.material=f.material.clone();f.material.opacity=0;f.position.y=1.45;o.add(f);const l=new THREE.PointLight(CH205.ING[i].fl,0,7,1.7);l.position.set(b.x,b.y+1.6,b.z);scene.add(l);
    // each bowl is a little solid
    CBLK.add(Math.round(b.z)*W+Math.round(b.x));return {o,ing,f,l,i}});
  g.position.set(R.read.x,R.read.y,R.read.z);g.rotation.y=Math.atan2(gg205Spot().x-R.read.x,gg205Spot().z-R.read.z);ch205Sync();return CH205}
// where he is and what the circle shows, from the quest state
function ch205Sync(){if(!CH205.g)return;const R=ch205Spots(),C=CQ205.c1,ev=typeof US205!='undefined'&&US205.E,done=cq205Done(1);
  const laid=C.st>=2&&!done||!!ev;CH205.brz.forEach(b=>{b.ing.visible=laid;b.f.material.opacity=laid?.9:0;b.l.intensity=laid?1.1:0});
  if(!ev&&!CH205.to){const at=C.st>=3||done?R.circ:R.read;CH205.g.position.set(at.x,at.y,at.z);CH205.g.rotation.y=C.st>=3||done?R.face+Math.PI:Math.atan2(gg205Spot().x-at.x,gg205Spot().z-at.z)}
  CH205.pose=ev?'cast':C.st>=3||done?'idle':C.st>=2?'idle':'read'}
// ---------------- his animation: the model's own idle, plus our layer ----------------
function ch205Anim(dt,now){const C=CH205.C;if(!C||!CH205.g.visible)return;const t=now/1000;try{C.update(t,dt)}catch(_){}
  const J=C.J,w=CH205.w,k=1-Math.exp(-dt*6),want={read:CH205.pose==='read'?1:0,cast:CH205.pose==='cast'?1:0,hurt:CH205.hit>0?1:0,down:CH205.pose==='down'?1:0,walk:CH205.sp>.05?1:0};
  for(const n in want)w[n]=(w[n]||0)+(want[n]-(w[n]||0))*k;CH205.hit=Math.max(0,CH205.hit-dt);
  const add=(o,x,y,z,m)=>{if(!o||!m)return;o.rotation.x+=x*m;o.rotation.y+=y*m;o.rotation.z+=z*m};
  // read: right paw at the chin, head up toward the seal
  add(J.R.sh,-1.25,.2,.55,w.read);add(J.R.el,-1.5,0,0,w.read);add(J.head,-.32,0,.08,w.read);add(J.neck,-.15,0,0,w.read);add(J.L.sh,.15,0,.1,w.read);
  // cast: both paws raised to the sky, a tremble, the tail stiff
  const tr=Math.sin(t*23)*.03;add(J.R.sh,-2.4+tr,.1,-.55,w.cast);add(J.L.sh,-2.4-tr,-.1,.55,w.cast);add(J.R.el,-.35,0,0,w.cast);add(J.L.el,-.35,0,0,w.cast);add(J.head,-.42,0,0,w.cast);add(J.spine,-.12,0,0,w.cast);add(J.chest,-.1,0,0,w.cast);
  // hurt: a flinch
  add(J.spine,.32,0,.15,w.hurt);add(J.head,.3,.2,0,w.hurt);add(J.R.sh,.4,0,-.4,w.hurt*w.cast);add(J.L.sh,.4,0,.4,w.hurt*w.cast);
  // walk: legs and arms swing
  const ph=CH205.wph=(CH205.wph||0)+dt*CH205.sp*7,sw=Math.sin(ph)*.7*w.walk;add(J.LR.th,sw,0,0,1);add(J.LL.th,-sw,0,0,1);add(J.LR.kn,Math.max(0,-Math.sin(ph))*.8*w.walk,0,0,1);add(J.LL.kn,Math.max(0,Math.sin(ph))*.8*w.walk,0,0,1);
  add(J.R.sh,-sw*.5,0,0,1);add(J.L.sh,sw*.5,0,0,1);
  // down: he lies on his side
  C.root.rotation.z=-1.45*svEase.io(Math.min(1,w.down));C.root.position.y=.1*w.down+Math.abs(Math.sin(ph))*.02*w.walk;
  // the tome and the dome
  const tm=CH205.tome;tm.visible=w.cast>.15;if(tm.visible){tm.position.set(0,1.3+.05*Math.sin(t*2),.38);tm.rotation.set(-.6+.05*Math.sin(t*3),0,0);tm.scale.setScalar(Math.min(1,w.cast*1.2))}}
// walk him to a spot (the unbinding: from the gate to his circle), then face it
function ch205Walk(dt){const T=CH205.to;if(!T){CH205.sp=0;return}const g=CH205.g,dx=T.x-g.position.x,dz=T.z-g.position.z,L=Math.hypot(dx,dz);
  if(L<.06){g.position.set(T.x,GH(T.x,T.z),T.z);CH205.to=null;CH205.sp=0;if(T.face!=null)g.rotation.y=T.face;if(T.then)try{T.then()}catch(e){console.error('v205 walk',e)}return}
  const st=Math.min(L,dt*(T.sp||1.6));g.position.x+=dx/L*st;g.position.z+=dz/L*st;g.position.y=GH(g.position.x,g.position.z);CH205.sp=T.sp||1.6;
  const a=Math.atan2(dx,dz),da=svAng(a-g.rotation.y);g.rotation.y+=Math.max(-dt*6,Math.min(dt*6,da))}
// ---------------- the window ----------------
var CH205T={
  hi0:['Oh! A living face — and one with a weapon. Good. Very good.','Look at it. A blood seal, four rings deep, woven by the court’s magisters. I’ve been reading it for an hour and it has been reading me back.'],
  seal:['Blood magic binds to blood. Steel won’t cut it, fire won’t burn it — but the court’s own blood will unpick it, thread by thread, if a scholar holds the needle.','Four threads, four keys: ash from a thrall, the heart of a blood bat, a Blood Knight’s signet and a magister’s ink. Every creature on this road carries one or the other.'],
  go:['Bring me one of each. I’ll prepare the circle while you hunt — and keep your neck covered.'],
  wait:['Still four keys to find. The thralls, the bats, the knights, the magisters — one from each.'],
  have:['That’s all four! Hand them here — carefully, the heart is still beating.'],
  ready:['The keys are in the bowls. When I begin, every fang in the Citadel will feel the seal tearing. It takes two minutes, and I can’t stop once I start.','Keep them off me. If I fall, the seal knits itself back together and we start again.'],
  after:['Through the gate — before it remembers what it was!'],
  fell:['Ow. Ow. That… did not go to plan. The seal is whole again, but the keys still burn — speak to me when you are ready to try again.']};
function ch205Talk(){if(!CH205.C)return;const C=CQ205.c1;if(C.st<1){C.st=1;CQ205.trkK='';CH205.tab='hi0'}else CH205.tab='hi';try{CH205.g.rotation.y=Math.atan2(pl.position.x-CH205.g.position.x,pl.position.z-CH205.g.position.z)}catch(_){}
  CH205.pose='idle';try{CH205.C.setPose('wave');setTimeout(()=>{try{CH205.C.setPose('idle')}catch(_){}},1400)}catch(_){}openX('ch205')}
XR.ch205=()=>{const C=CQ205.c1,t=CH205.tab||'hi',n=cq205Bits(C.ing),ev=typeof US205!='undefined'&&US205.E;$('xwT').textContent='🐭 Cheddar';$('xwS').textContent='Scholar of seals · before the Great Gate';
  let L=CH205T[t]||null;if(!L||t==='hi')L=cq205Done(1)||C.st>=3?CH205T.after:C.st>=2?(CH205.fell?CH205T.fell:CH205T.ready):n>=4?CH205T.have:t==='hi0'?CH205T.hi0:CH205T.wait;
  let list='';if(C.st===1){list='<div class="cq132g" style="margin-top:6px">'+CH205.ING.map((g,i)=>{const got=C.ing&(1<<i);return '<div style="display:flex;gap:8px;align-items:center;margin:3px 0;opacity:'+(got?1:.8)+'"><span>'+(got?'✅':'▫️')+'</span><b style="color:#f0d8a8">'+g.n+'</b><span class="mut">· from a '+g.from+' — '+g.d+'</span></div>'}).join('')+'</div>'}
  $('xwB').innerHTML='<div class="cq132say"><span class="cq132who">Cheddar</span>'+L.map(s=>'“'+s+'”').join('<br><br>')+'</div>'+list;
  const btn=(k,lab,pri)=>'<button class="'+(pri?'pri':'')+'" data-ch205="'+k+'">'+lab+'</button> ';
  $('xwF').innerHTML=ev?'<span class="mut dtl">He is casting. Keep them off him!</span>':cq205Done(1)||C.st>=3?btn('bye','On my way',1):
    C.st>=2?btn('begin','Begin the unbinding',1)+btn('bye','Not yet'):n>=4?btn('give','Hand over the four keys',1):
    t==='hi0'?btn('seal','How do we break it?',1):t==='seal'?btn('go','I’ll bring them',1):btn('seal','Tell me about the keys again')+btn('bye','On my way',1)};
$('xw').addEventListener('click',ev=>{if(xwMode!='ch205')return;const b=ev.target.closest('[data-ch205]');if(!b)return;const k=b.dataset.ch205;
  if(k==='bye'){closeX();return}
  if(k==='begin'){closeX();try{us205Start(true)}catch(err){console.error('v205 unbinding start',err)}return}
  if(k==='give'){ch205Give(true);rX();return}
  CH205.tab=k;rX()});
// all four keys into the bowls
function ch205Give(own){const C=CQ205.c1;if(C.st!==1||cq205Bits(C.ing)<4)return false;C.st=2;C.ing=0;CQ205.trkK='';CH205.fell=0;ch205Sync();
  CH205.brz.forEach((b,i)=>{cq205After(.25*i,()=>{const p=new THREE.Vector3();b.o.getWorldPosition(p);p.y+=1.4;burst(p,CH205.ING[i].fl,26,1.2,1.8,.7);svSnd('blood',.6,1.1+i*.1)})});
  say('🐭 Cheddar sets a key in each bowl of his circle. Ash, heart, signet and ink catch fire, each its own colour.');if(own!==false&&typeof co205Give=='function')co205Give();return true}
// ---------------- the ingredients: drops, the pickup, the bag ----------------
function ch205Need(i){const C=CQ205.c1;if(C.st!==1||cq205Done(1)||(C.ing&(1<<i)))return false;try{for(const d of drops)if(d.kind=='cq205'&&d.data.i===i)return false}catch(_){}return true}
function ch205Drop(i,p){const g=new THREE.Group(),m=ch205Ing(i);m.scale.setScalar(2.2);m.position.y=.32;g.add(m);const beam=new THREE.Mesh(CH205.bG||(CH205.bG=new THREE.CylinderGeometry(.05,.05,1.8,8)),new THREE.MeshBasicMaterial({color:CH205.ING[i].fl,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));
  beam.position.y=.9;g.add(beam);const a=Math.random()*6.28,d=.5+Math.random()*.8;g.position.set(p.x+Math.cos(a)*d,0,p.z+Math.sin(a)*d);scene.add(g);drops.push({g,gem:m,kind:'cq205',data:{i},t:300});
  try{burst(gY(g.position,.45),CH205.ING[i].fl,14,1.6,2,.6)}catch(_){}}
{const f=lootE;lootE=function(e){const r=f.apply(this,arguments);try{if(e&&e.m&&e.c&&!e.boss&&!e.dprop&&!e.us205){const i=CH205.ING.findIndex(g=>g.en===e.c.en);
    if(i>=0&&ch205Need(i)){const P=e.m.position,I=insAt(Math.round(P.x),Math.round(P.z));if(I&&I.g===insG(5,0)&&Math.random()<CH205.drop)ch205Drop(i,P)}}}catch(err){console.warn('v205 drop',err)}return r}}
{const f=take;take=function(d){if(d&&d.kind=='cq205'){const i=d.data.i|0,g=CH205.ING[i];if(g&&!(CQ205.c1.ing&(1<<i))){CQ205.c1.ing|=1<<i;CQ205.trkK='';
      pickup({ic:g.ic,t:g.n,col:'#ffb0a0',sub:'Quest item · '+cq205Bits(CQ205.c1.ing)+' of 4 keys · '+(cq205Bits(CQ205.c1.ing)>=4?'bring them to Cheddar at the gate':g.d)});if(typeof co205Ing=='function')co205Ing(i)}return}return f.apply(this,arguments)}}
{const f=kqmMatTab;kqmMatTab=function(){const h=f.apply(this,arguments);const m=CQ205.c1.ing;if(!m)return h;
  const t=CH205.ING.filter((g,i)=>m&(1<<i)).map(g=>`<div class="kqm-slot mi" title="${g.n} · quest item for The Unsealing: ${g.d}. Cheddar needs one of each of the four keys."><span class="kqm-ic">${g.ic}</span><span class="kqm-ct">1</span><span class="kqm-hold">${g.n}</span></div>`).join('');
  return `<div class="kqm-h">Quest items</div><div class="kqm-grid">${t}${kqmEmpty(8-cq205Bits(m))}</div>`+(/Chop trees, mine rocks/.test(h)?'':h)}}
// ---------------- prompts and the tick ----------------
function ch205Prompt(){if(!cq205Here(0)||!CH205.C||!CH205.g.visible)return null;if(typeof US205!='undefined'&&US205.E)return null;const P=pl.position,g=CH205.g.position;
  if(Math.hypot(P.x-g.x,P.z-g.z)<2.8){const C=CQ205.c1;return {label:C.st===1&&cq205Bits(C.ing)>=4?'F · Give Cheddar the four keys':C.st===2?'F · Speak with Cheddar (begin the unbinding)':'F · Speak with Cheddar',fn:()=>ch205Talk()}}return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=ch205Prompt();if(r)return r}catch(e){if(!CH205.err++)console.warn('v205 cheddar prompt',e)}return f.apply(this,arguments)}}
function ch205Tick(dt,now){const here=cq205Here(0);if(here&&!CH205.g&&GG205.S){try{ch205Build()}catch(e){if(!CH205.err++)console.error('v205 cheddar build',e)}}if(!CH205.g)return;
  const vis=here;CH205.g.visible=vis;CH205.ring.visible=vis;CH205.floor.visible=vis;CH205.brz.forEach(b=>{b.o.visible=vis;if(!vis)b.l.intensity=0;else if(b.ing.visible)b.l.intensity=.9+.3*Math.sin(now/90+b.i)});if(!vis)return;
  ch205Walk(dt);ch205Anim(dt,now);const t=now/1000,ev=typeof US205!='undefined'&&US205.E;
  CH205.ring.material.opacity=ev?.55+.25*Math.sin(t*3):.22;CH205.ring.rotation.y+=dt*(ev?.4:.05);
  CH205.brz.forEach(b=>{if(b.ing.visible){b.ing.rotation.y+=dt*.8;b.ing.position.y=1.1+.05*Math.sin(t*2+b.i);b.f.scale.setScalar(1.1+.2*Math.sin(t*9+b.i*2))}});
  // first sight of him (the tracker's "someone waits there")
  if(!CQ205.c1.fd&&Math.hypot(pl.position.x-CH205.g.position.x,pl.position.z-CH205.g.position.z)<16){CQ205.c1.fd=1;say('🐭 A small figure in a scarf stands before the sealed gate, peering up at it through spectacles. Cheddar? Here?')}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{ch205Tick(dt,now)}catch(e){if(!CH205.err++)console.warn('v205 cheddar tick',e)}return r}}
CQ205L.push(()=>{if(CH205.g){CH205.to=null;ch205Sync()}});
