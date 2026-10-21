// ---------------- helpers for the new abilities ----------------
var kqsV=(x,z)=>new THREE.Vector3(x,0,z);
function kqsFoes(p,R){return enemies.filter(e=>!e.dead&&d2(e.m.position,p)<R+(e.boss?1.2:e.c.al?.5:0))}
function kqsNear(maxD){return tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<maxD?tgt:nearestFront(maxD)}
function kqsHit(e,raw,c,o){if(!e||e.dead)return 0;return heroHit(e,raw,c.mt,Object.assign({s:c.fx},o||{}))}
function kqsArea(p,R,raw,c,x){return area(p,R,raw,Object.assign({},c.fx,x||{}),null,0)}
function kqsLine(P,d,L,w){return enemies.filter(e=>{if(e.dead)return false;const vx=e.m.position.x-P.x,vz=e.m.position.z-P.z,a=vx*d.x+vz*d.z,pw=Math.abs(vx*d.z-vz*d.x),ex=e.boss?1.2:e.c.al?.4:0;return a>-.6-ex&&a<L+ex&&pw<w/2+.3+ex})}
function kqsDir(a,b){const v=kqsV(b.x-a.x,b.z-a.z),L=v.length();return L>.01?v.multiplyScalar(1/L):kqsV(Math.sin(pl.rotation.y),Math.cos(pl.rotation.y))}
function kqsBuff(n,i,s,ms){const now=performance.now(),b=hero.buffs.find(q=>q.n===n&&q.kqs);if(b){b.t=Math.max(b.t,now+ms);return b}const nb={s,t:now+ms,n,i,kqs:1};hero.buffs.push(nb);hsDirty();return nb}
function kqsUnbuff(n){const L=hero.buffs.length;hero.buffs=hero.buffs.filter(q=>!(q.n===n&&q.kqs));if(hero.buffs.length!=L)hsDirty()}
function kqsRes(v){try{if(typeof resGain=='function')resGain(v)}catch(_){}}
function kqsLand(P,tp){let k=1;const blk=(x,z)=>typeof plBlocked=='function'?plBlocked(x,z):solid(x,z);while(k>0&&blk(P.x+(tp.x-P.x)*k,P.z+(tp.z-P.z)*k))k-=.05;k=Math.max(0,k);return kqsV(P.x+(tp.x-P.x)*k,P.z+(tp.z-P.z)*k)}
function kqsTp(p){pl.position.x=p.x;pl.position.z=p.z;pl.position.y=GH(p.x,p.z);try{if(typeof UNS!='undefined')UNS.air=nowP()+300}catch(_){}}
function kqsObj(o){o.age=0;KQS.objs.push(o);return o}
function kqsRm(m){if(!m)return;if(m.parent)m.parent.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!o.userData.kqsKeep){(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>q.dispose&&q.dispose())}})}
function kqsFade(m,ms,done){if(!m)return done&&done();const mats=[];m.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>{q.transparent=true;mats.push([q,q.opacity])})});tw(ms||300,k=>mats.forEach(([q,o])=>q.opacity=o*(1-k)),()=>{kqsRm(m);done&&done()})}
var kqsAdd=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
var kqsStd=(c,e,op)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:e==null?.5:e,flatShading:true,roughness:.7,metalness:.1,transparent:op!=null,opacity:op==null?1:op});
function kqsMesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.userData.lpsSkip=1;return m}
// a decal draped over the terrain. geo is built in its XY plane; fn(u,v) → [worldX, worldZ]
function kqsDrapeM(geo,mat,ro){const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.renderOrder=ro||28;m.userData.lpsSkip=1;m.userData.b=geo.attributes.position.array.slice();scene.add(m);return m}
function kqsDrape(m,fn,lift){const P=m.geometry.attributes.position,b=m.userData.b,y0=lift==null?.14:lift;for(let i=0;i<P.count;i++){const w=fn(b[i*3],b[i*3+1]);P.setXYZ(i,w[0],(GH(w[0],w[1]))+y0,w[1])}P.needsUpdate=true;m.geometry.computeBoundingSphere()}
var kqsDMat=(c,op,dt)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,depthTest:dt!==false?true:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
// a circle decal (fill + edge) at p; returns {g:[meshes], set(p,R)}
function kqsDecal(p,R,col,op,edge){const f=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),kqsDMat(col,op==null?.2:op)),e=kqsDrapeM(new THREE.RingGeometry(.93,1,48,1),kqsDMat(col,edge==null?.7:edge));
  const D={g:[f,e],p:p.clone(),R,set(q,r){D.p.copy(q);if(r!=null)D.R=r;const fn=(u,v)=>[D.p.x+u*D.R,D.p.z-v*D.R];kqsDrape(f,fn);kqsDrape(e,fn,.15)},op(k){f.material.opacity=(op==null?.2:op)*k;e.material.opacity=(edge==null?.7:edge)*k},rm(ms){D.g.forEach(m=>kqsFade(m,ms||350))}};D.set(p,R);return D}
// warning circle that fills over `delay` s, then calls cb
function kqsWarn(p,R,col,delay,cb){const D=kqsDecal(p,R,col,.12,.8),in_=kqsDrapeM(new THREE.RingGeometry(.001,1,32,2),kqsDMat(col,.3));
  kqsObj({life:delay,tick:(dt,now,o)=>{const k=Math.min(1,o.age/delay);kqsDrape(in_,(u,v)=>[p.x+u*R*k,p.z-v*R*k],.16)},end:o=>{kqsRm(in_);D.rm(200);if(!o.abort)cb&&cb()}})}
function kqsLob(from,to,mesh,ms,h,cb){scene.add(mesh);const a=gY(from,1.2),b=gY(to,.3);tw(ms,k=>{mesh.position.lerpVectors(a,b,k);mesh.position.y+=Math.sin(k*Math.PI)*(h||2.4);mesh.rotation.x+=.3;mesh.rotation.z+=.2},()=>{if(mesh.userData.kqsShared){if(mesh.parent)mesh.parent.remove(mesh)}else kqsRm(mesh);cb&&cb()})}
function kqsPillar(p,col,h,ms,w){const m=kqsMesh(new THREE.CylinderGeometry(w||.5,w||.5,h||8,10,1,true),kqsAdd(col));m.position.copy(gY(p,(h||8)/2));scene.add(m);tw(ms||420,k=>{m.material.opacity=.85*(1-k);m.scale.set(1+k*.6,1,1+k*.6)},()=>kqsRm(m))}
function kqsSpark(a,b,col){try{bolt(a,b,col)}catch(_){}}

// ---------------- simple low-poly models for summons and props ----------------
function kqsWolf(col,sc){const g=new THREE.Group(),m=kqsStd(col,.75,.82),L=[];
  g.add(kqsMesh(new THREE.BoxGeometry(.42,.4,1.0),m,0,.62,0));g.add(kqsMesh(new THREE.BoxGeometry(.46,.46,.38),m,0,.7,.36));
  g.add(kqsMesh(new THREE.BoxGeometry(.3,.28,.34),m,0,.86,.68));const sn=kqsMesh(new THREE.ConeGeometry(.12,.32,4),m,0,.8,.95);sn.rotation.x=Math.PI/2;g.add(sn);
  [-.1,.1].forEach(x=>g.add(kqsMesh(new THREE.ConeGeometry(.07,.2,4),m,x,1.08,.62)));
  [[-.14,.36],[.14,.36],[-.14,-.36],[.14,-.36]].forEach(([x,z])=>{const l=kqsMesh(new THREE.BoxGeometry(.11,.5,.11),m,x,.27,z);l.geometry.translate(0,-.2,0);l.position.y=.47;L.push(l);g.add(l)});
  const t=kqsMesh(new THREE.ConeGeometry(.08,.55,4),m,0,.78,-.62);t.rotation.x=-2.1;g.add(t);g.userData.legs=L;g.userData.tail=t;g.scale.setScalar(sc||1);return g}
function kqsHawk(col){const g=new THREE.Group(),m=kqsStd(col,.7,.85);const b=kqsMesh(new THREE.ConeGeometry(.12,.6,4),m);b.rotation.x=Math.PI/2;g.add(b);
  const w1=kqsMesh(new THREE.BoxGeometry(.8,.03,.26),m,-.42,0,0),w2=kqsMesh(new THREE.BoxGeometry(.8,.03,.26),m,.42,0,0);w1.geometry.translate(-.0,0,0);g.add(w1,w2);g.userData.w=[w1,w2];return g}
function kqsShade(col){const g=new THREE.Group(),m=kqsStd(col,.55,.7);
  g.add(kqsMesh(new THREE.CylinderGeometry(.2,.26,.75,6),m,0,1.05,0));g.add(kqsMesh(new THREE.SphereGeometry(.18,6,5),m,0,1.62,0));
  const hood=kqsMesh(new THREE.ConeGeometry(.24,.34,6),m,0,1.82,-.02);g.add(hood);
  [-.32,.32].forEach((x,i)=>{const a=kqsMesh(new THREE.BoxGeometry(.1,.55,.1),m,x,1.1,.05);a.rotation.x=-.6;g.add(a);const bl=kqsMesh(new THREE.BoxGeometry(.04,.04,.42),kqsAdd(0xd8c8ff),x,.9,.36);g.add(bl)});
  [-.1,.1].forEach(x=>g.add(kqsMesh(new THREE.BoxGeometry(.12,.65,.12),m,x,.36,0)));return g}
function kqsHammer(){const g=new THREE.Group(),m=kqsStd(0xffd860,.8);g.add(kqsMesh(new THREE.BoxGeometry(.34,.2,.2),m,0,.22,0));g.add(kqsMesh(new THREE.CylinderGeometry(.035,.035,.5,5),kqsStd(0xb08040,.3),0,0,0));return g}

// ---------------- channels (Penance, Rapid Fire, Disintegrate, Aimed Shot) ----------------
function kqsChan(o){KQS.ch=Object.assign({ti:0,el:0},o);if(o.slow)kqsBuff('Channelling','🔆',{mspd:-o.slow},o.t*1000+200)}
function kqsChanEnd(cancel){const c=KQS.ch;if(!c)return;KQS.ch=null;kqsUnbuff('Channelling');if(c.end)try{c.end(cancel)}catch(err){console.error(err)}}
{const f=swing;swing=function(){if(KQS.ch||KQS.tg&&KQS.eat)return;return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(KQS.ch&&!((hero.cdD||0)>0)&&(hero.dc||0)>=1)kqsChanEnd(true);return f.apply(this,arguments)}}

// ---------------- the handlers: c = {sk,i,key,s,P,d,mt,A (attack × skill bonus),raw (A × m),R (radius incl. area talents),now,gp,fx,cr,pips} ----------------
var KQH={
 // ===== WARRIOR =====
 w_rush(c){const d=c.d,dist=7,T=dist/14,hit=new Set();hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T+.15);kqsRes(10);kqsSnd('charge');
  kqsObj({life:T+.08,tick:()=>{burst(gY(pl.position,.3),0xc8a070,4,1.2,1,.4);kqsFoes(pl.position,1.8).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);eStatus(e,{stun:.6},0,'h');const s=Math.sign((e.m.position.x-pl.position.x)*d.z-(e.m.position.z-pl.position.z)*d.x)||1;if(!e.boss){e.vx+=d.z*s*5;e.vz+=-d.x*s*5}burst(gY(e.m.position,.8),c.sk.col,14,2,2,.4);shake(.08)})},
   end:()=>{ring(pl.position,c.sk.col,2.2,300);burst(gY(pl.position,.3),0xc8a070,20,2,1.4,.5)}})},
 w_shout(c){const P=c.P.clone(),L=kqsFoes(P,c.R);[0,120,240].forEach((t,j)=>setTimeout(()=>{ring(P,j?0xffa060:c.sk.col,c.R*(1.2+j*.5),420);},t));burst(gY(P,1.6),c.sk.col,40,3,2,.6);popT(P,'RAAAGH!','#ff7a4a',true);shake(.2);kqsSnd('shout');kqsRes(25);
  L.forEach(e=>{if(!e.boss)mCancel(e);eStatus(e,{weak:6,slow:3},0);kqsHit(e,c.raw,c,{proc:false});dn(e.m.position,'Weakened','#fca5a5',-30,900)})},
 w_skull(c){const t=kqsNear(5.2);if(!t)return false;const k=1+Math.min(100,c.cr)/100,lg=kqsLunge(t);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c);eStatus(t,{bleed:6},c.A*.5);burst(gY(t.m.position,1.1),0xd03030,30,2.6,2.5,.5);ring(t.m.position,c.sk.col,1.6,300);hstop=.08;shake(.25);kqsSnd('thud');if(c.cr>=50)popT(t.m.position,'SPLIT! ×'+k.toFixed(1),'#ff7a4a',true)},170+lg)},
 w_rupture(c){const P=c.P.clone(),d=kqsDir(P,c.gp),L=Math.max(3,Math.min(c.sk.L,d2(P,c.gp))),hit=new Set(),n=Math.ceil(L);kqsSnd('quake');
  for(let j=1;j<=n;j++)setTimeout(()=>{const q=kqsV(P.x+d.x*j*(L/n),P.z+d.z*j*(L/n));burst(gY(q,.2),0xb08a60,12,1.6,3,.6);ring(q,c.sk.col,1.3,260);kqsSpike(q,0x8a6a4a,.9+Math.random()*.5);
    kqsFoes(q,c.sk.w*.6).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c)});if(j==n)shake(.3)},j*45)},
 w_banner(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group();g.add(kqsMesh(new THREE.CylinderGeometry(.06,.07,3.2,6),kqsStd(0x6a4a2a,.15),0,1.6,0));g.add(kqsMesh(new THREE.ConeGeometry(.12,.3,5),kqsStd(0xd8b050,.6),0,3.3,0));
  const cl=kqsMesh(new THREE.PlaneGeometry(1,1.3,4,1),new THREE.MeshStandardMaterial({color:0xb01818,emissive:0x400606,side:THREE.DoubleSide,flatShading:true}),.52,2.45,0);g.add(cl);g.add(kqsMesh(new THREE.TorusGeometry(.2,.05,5,10),kqsStd(0xffd060,.7),.52,2.5,.02));
  g.position.copy(gY(p,0));g.scale.set(1,.01,1);scene.add(g);tw(260,k=>g.scale.set(1,k,1));const D=kqsDecal(p,R,c.sk.col,.12,.6);burst(gY(p,.3),0xc8a070,30,2.5,2,.5);shake(.12);kqsSnd('horn');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{cl.rotation.y=Math.sin(now/260)*.25;ti-=dt;if(ti>0)return;ti=.5;if(d2(pl.position,p)<R){kqsBuff('War Banner','🚩',kqrB(c.sk,{paP:.2,dr:.15,regen:.02}),700);burst(gY(pl.position,.2),c.sk.col,4,.6,1.4,.5)}
    kqsFoes(p,R).forEach(e=>eStatus(e,{slow:1},0));if(Math.random()<.5)ring(p,c.sk.col,R*1.9,500)},end:()=>{D.rm(400);kqsFade(g,400);kqsUnbuff('War Banner')}})},
 w_blood(c){const lost=Math.min(hero.hp-1,hero.hp*.15);hero.hp-=Math.max(0,lost);dn(pl.position,'-'+Math.round(lost),'#ff6b5b');hero.cr=100;try{resUI()}catch(_){}
  hero.buffs.push({s:kqrB(c.sk,{as:.25,paP:.1,ls:.1}),t:c.now+c.sk.dur*1000,n:'Bloodrage',i:'🩸'});hsDirty();burst(gY(pl.position,1),0xc0101a,60,2.5,3,.8);ring(pl.position,0xff2020,3,500);popT(pl.position,'BLOODRAGE','#ff4040',true);flash('rgba(200,20,20,.25)');kqsSnd('shout')},
 w_hook(c){const p=c.gp.clone(),P=c.P;kqsChain(gY(P,1.1),gY(p,.5),0xa8a8b8,180);kqsSnd('chain');
  setTimeout(()=>{ring(p,c.sk.col,c.R*1.8,300);burst(gY(p,.5),0xc8c8d8,24,c.R,1.5,.4);const L=kqsFoes(p,c.R);L.forEach(e=>{kqsHit(e,c.raw,c);if(e.boss||e.dead)return;const a=e.m.position.clone(),d=kqsDir(pl.position,a),b=kqsV(pl.position.x+d.x*1.4+(Math.random()-.5)*.6,pl.position.z+d.z*1.4+(Math.random()-.5)*.6);
    kqsChain(gY(pl.position,1.1),gY(a,.8),0x8a8a9a,260);e.vx=e.vz=0;tw(260,k=>{if(e.dead)return;e.m.position.x=a.x+(b.x-a.x)*k;e.m.position.z=a.z+(b.z-a.z)*k})});if(L.length)shake(.15)},180)},
 w_exec(c){const t=kqsNear(5.2);if(!t)return false;const lg=kqsLunge(t);const low=t.c.h/M(t.c)<.3,k=(low?3:1)*(1+Math.min(100,c.cr)/100*.8);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c);burst(gY(t.m.position,1),0xff2a1a,low?50:24,2.6,2.5,.5);hstop=low?.12:.06;shake(low?.35:.18);kqsSnd('thud');
   if(t.dead){hero.cd[c.key]=(hero.cd[c.key]||0)*.3;popT(t.m.position,'EXECUTED','#ff4a3a',true)}},150+lg)},
 w_unbrk(c){KQS.unbrk=c.now+c.sk.dur*1000;hero.buffs.push({s:kqrB(c.sk,{dr:.3}),t:KQS.unbrk,n:'Unbreakable',i:'🗿'});hsDirty();ring(pl.position,0xb0a898,3,600);burst(gY(pl.position,1),0x9a9080,50,2,2.5,.8);popT(pl.position,'UNBREAKABLE','#d6d3d1',true);kqsSnd('thud');
  kqsObj({life:c.sk.dur,tick:()=>{if(Math.random()<.3)burst(gY(pl.position,1),0xb0a898,2,.6,1,.4)},end:o=>{if(!o.abort){healHero(heroMax()*.15*c.rk);ring(pl.position,0x9affb0,2.4,500)}}})},
 w_titan(c){const o=c.P.clone(),tp=kqsLand(o,c.gp),R=c.R;hero.iv=Math.max(hero.iv||0,.9);try{UNS.air=nowP()+760}catch(_){}kqsSnd('whoosh');
  tw(650,k=>{pl.position.x=o.x+(tp.x-o.x)*k;pl.position.z=o.z+(tp.z-o.z)*k;if(pl.children[0])pl.children[0].position.y=Math.sin(k*Math.PI)*4.2;if(k>.2&&k<.9)burst(gY(pl.position,1+Math.sin(k*Math.PI)*4),0xffb060,2,.3,.2,.3)},
   ()=>{if(pl.children[0])pl.children[0].position.y=0;const p=pl.position.clone();ring(p,c.sk.col,R*2.2,450);ring(p,0xffffff,R*1.4,300);burst(gY(p,.3),0xb08a60,90,R*1.6,4,.9);for(let j=0;j<8;j++){const a=j/8*6.283;kqsSpike(kqsV(p.x+Math.cos(a)*R*.7,p.z+Math.sin(a)*R*.7),0x8a6a4a,1.2)}
    shake(.6);hstop=.12;kqsSnd('boom');kqsArea(p,R,c.raw,c);const D=kqsDecal(p,R,0x8a5a3a,.25,.5);kqsObj({life:4,tick:()=>kqsFoes(p,R).forEach(e=>eStatus(e,{slow:.5},0)),end:()=>D.rm(500)})})},
 // ===== PALADIN =====
 p_bash(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);kqsRes(15);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw,c);burst(gY(t.m.position,1),0xffe8a0,26,2.2,2,.4);ring(t.m.position,0xffe8a0,1.5,260);hstop=.07;shake(.18);sfx('blunt');kqsSnd('bell')},120+lg)},
 p_hammers(c){const H=[0,1,2].map(()=>{const h=kqsHammer();scene.add(h);return h}),last=new Map();kqsSnd('holy');
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const r=1.2+Math.min(1,o.age/.6)*1.7;H.forEach((h,j)=>{const a=o.age*4.2+j*2.094;h.position.set(pl.position.x+Math.cos(a)*r,pl.position.y+1.0,pl.position.z+Math.sin(a)*r);h.rotation.y=-a;h.rotation.z+=dt*12;
    if(Math.random()<.3)burst(h.position,0xffe08a,1,.2,.2,.3);enemies.forEach(e=>{if(e.dead||d2(e.m.position,h.position)>.95+(e.boss?1.2:0))return;const t=last.get(e)||{};if((t[j]||0)>now)return;t[j]=now+500;last.set(e,t);kqsHit(e,c.raw,c,{proc:false});burst(gY(e.m.position,1),0xffe08a,8,1.4,1,.3)})})},
   end:()=>H.forEach(h=>{burst(h.position,0xffe08a,10,1,1,.4);kqsRm(h)})})},
 p_beacon(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),cr=kqsMesh(new THREE.OctahedronGeometry(.42,0),kqsStd(0xffe8a0,1.1),0,1.6,0),col=kqsMesh(new THREE.CylinderGeometry(.32,.32,7,10,1,true),kqsAdd(0xfff0b0),0,3.5,0);col.material.opacity=.35;
  g.add(cr,col,kqsMesh(new THREE.CylinderGeometry(.5,.62,.3,6),kqsStd(0xa8a090,.2),0,.15,0));g.position.copy(gY(p,0));scene.add(g);const D=kqsDecal(p,R,c.sk.col,.12,.55);kqsPillar(p,0xfff0b0,10,500,.9);kqsSnd('holy');let ti=.2;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{cr.rotation.y+=dt*2;cr.position.y=1.6+Math.sin(now/300)*.12;ti-=dt;if(ti>0)return;ti=1;ring(p,c.sk.col,R*1.9,600);kqsArea(p,R,c.raw,c,{proc:false});
    if(d2(pl.position,p)<R){healHero(heroMax()*.025*c.rk);burst(gY(pl.position,1),0x9affb0,10,1,1.5,.6)}},end:()=>{D.rm(400);kqsFade(g,400)}})},
 p_charge(c){const d=c.d,T=8/14,hit=new Set();hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T+.15);kqsSnd('charge');kqsSnd('holy');
  kqsObj({life:T+.08,tick:()=>{burst(gY(pl.position,.8),0xffe080,6,1,1.5,.5);kqsFoes(pl.position,1.9).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);eStatus(e,{weak:4},0);burst(gY(e.m.position,1),0xfff0b0,16,2,2,.4)})},end:()=>ring(pl.position,c.sk.col,2.4,320)})},
 p_sanct(c){const p=c.gp.clone(),R=c.R,dome=kqsMesh(new THREE.SphereGeometry(1,20,10,0,6.283,0,Math.PI/2),kqsAdd(0xfff6c8));dome.material.opacity=.0;dome.position.copy(gY(p,0));scene.add(dome);const D=kqsDecal(p,R,c.sk.col,.16,.7);kqsSnd('holy');let ti=0;
  tw(300,k=>{dome.scale.setScalar(R*k);dome.material.opacity=.22*k});
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{dome.material.opacity=.18+Math.sin(now/220)*.05;ti-=dt;if(ti>0)return;ti=.5;if(d2(pl.position,p)<R)kqsBuff('Sanctuary','⛪',kqrB(c.sk,{dr:.35}),700);kqsFoes(p,R).forEach(e=>eStatus(e,{slow:1},0));kqsArea(p,R,c.raw,c,{proc:false})},end:()=>{D.rm(400);kqsFade(dome,400);kqsUnbuff('Sanctuary')}})},
 p_avenger(c){const t0=kqsNear(12);if(!t0)return false;const L=[t0],seen=new Set([t0]);let cur=t0;for(let j=0;j<4;j++){const nx=enemies.filter(e=>!e.dead&&!seen.has(e)&&d2(e.m.position,cur.m.position)<7).sort((a,b)=>d2(a.m.position,cur.m.position)-d2(b.m.position,cur.m.position))[0];if(!nx)break;L.push(nx);seen.add(nx);cur=nx}
  const disc=new THREE.Group();disc.add(kqsMesh(new THREE.CylinderGeometry(.38,.38,.08,10),kqsStd(0xd8c8a0,.6)));disc.add(kqsMesh(new THREE.TorusGeometry(.38,.05,5,12),kqsStd(0xffd860,.9)));disc.children[1].rotation.x=Math.PI/2;scene.add(disc);
  let from=gY(pl.position,1.1),j=0;kqsSnd('whoosh');const leg=()=>{const e=L[j],to=e&&!e.dead?gY(e.m.position,1):null;if(!to){back();return}const a=from.clone();tw(140,k=>{disc.position.lerpVectors(a,to,k);disc.rotation.y+=.6;burst(disc.position,0xffe8b0,1,.2,.1,.25)},()=>{kqsHit(e,c.raw*(1-.1*j),c);burst(to,0xffe8b0,16,1.6,1.5,.4);sfx('blunt');from=to;j++;if(j<L.length)leg();else back()})};
  const back=()=>{const a=disc.position.clone();tw(200,k=>{disc.position.lerpVectors(a,gY(pl.position,1.1),k);disc.rotation.y+=.6},()=>kqsRm(disc))};leg()},
 p_penance(c){kqsSnd('holy');kqsChan({t:c.sk.dur,iv:.5,slow:.65,tick:()=>{healHero(heroMax()*.03*c.rk);ring(pl.position,c.sk.col,c.R*1.9,420);burst(gY(pl.position,1.6),0xfff0b0,16,1.5,2,.6);kqsArea(pl.position,c.R,c.raw,c,{proc:false});kqsPose('raise',460)}})},
 p_seal(c){hero.buffs.push({s:kqrB(c.sk,{basicP:.35,maP:.15,ls:.06}),t:c.now+c.sk.dur*1000,n:'Seal of Light',i:'🌟'});hsDirty();ring(pl.position,c.sk.col,3,600);burst(gY(pl.position,1.2),c.sk.col,50,2,3,.8);kqsSnd('bell')},
 p_interv(c){const T=c.sk.dur;hero.iv=Math.max(hero.iv||0,T);const sph=kqsMesh(new THREE.SphereGeometry(1.15,16,10),kqsAdd(0xfffbe0));sph.material.opacity=.25;scene.add(sph);popT(pl.position,'DIVINE INTERVENTION','#fde68a',true);flash('rgba(255,240,180,.3)');kqsSnd('holy');kqsSnd('bell');
  kqsObj({life:T,tick:(dt,now)=>{sph.position.copy(gY(pl.position,1));sph.material.opacity=.2+Math.sin(now/120)*.06;healHero(heroMax()*.1*dt*c.rk,true);if(Math.random()<.4)burst(gY(pl.position,1.2),0xfffbe0,2,.8,1.5,.5)},
   end:o=>{kqsRm(sph);if(o.abort)return;const P=pl.position;ring(P,0xfff0a0,c.R*2.2,420);ring(P,0xffffff,c.R*1.4,300);burst(gY(P,.6),0xfff0a0,70,c.R*1.5,3,.8);kqsArea(P,c.R,c.raw,c);shake(.25);kqsSnd('boom')}})},
 p_wrath(c){const p=c.gp.clone(),R=c.R;kqsSnd('holy');const D=kqsDecal(p,R,c.sk.col,.08,.6);
  for(let j=0;j<6;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r);kqsWarn(q,1.6,c.sk.col,.35,()=>{kqsPillar(q,0xfff2a0,12,380,.6);burst(gY(q,.4),0xfff2a0,30,1.8,3,.5);kqsArea(q,1.6,c.raw,c,{stun:0});sfx('zap');shake(.08)})},j*280);
  setTimeout(()=>kqsWarn(p,3,0xffffff,.5,()=>{kqsPillar(p,0xffffff,16,520,1.6);ring(p,c.sk.col,6,450);burst(gY(p,.4),0xfff2a0,80,3,4,.8);kqsArea(p,3,c.A*3.0,c);shake(.35);kqsSnd('boom');D.rm(400)}),1750)},
 // ===== ASSASSIN =====
 a_evisc(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);const k=1+.25*c.pips;
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c,{crit:c.pips>=5});burst(gY(t.m.position,1),0xe04a6a,14+c.pips*8,2,2,.4);if(c.pips)popT(t.m.position,'●'.repeat(c.pips)+' ×'+k.toFixed(2),'#f0abfc',c.pips>=4);hstop=.05;sfx('stab')},90+lg)},
 a_flask(c){const p=c.gp.clone(),R=c.R,fl=kqsMesh(new THREE.SphereGeometry(.16,6,5),kqsStd(0x7ae04a,.8));kqsSnd('whoosh');
  kqsLob(c.P,p,fl,380,2.2,()=>{burst(gY(p,.4),0x7ae04a,40,R,2,.6);ring(p,0x7ae04a,R*1.8,300);sfx('brk',.4);kqsSnd('poison');const D=kqsDecal(p,R,0x6ac03a,.22,.55);let ti=0;
   kqsObj({life:c.sk.dur,tick:dt=>{for(let k=0;k<2;k++){const a=Math.random()*6.283,r=Math.random()*R;burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.3+Math.random()),0x8ad84a,1,.4,.6,.9)}ti-=dt;if(ti>0)return;ti=.5;
    kqsFoes(p,R).forEach(e=>{eStatus(e,{poison:4,slow:1},c.A*.35*(1+(c.s.poisonP||0)));kqsHit(e,c.raw,c,{proc:false})})},end:()=>D.rm(400)})})},
 a_vanish(c){KQS.stealth=c.now+c.sk.dur*kqrD(c.sk)*1000;hero.buffs.push({s:{mspd:.4},t:KQS.stealth,n:'Vanish',i:'🌫️'});hsDirty();burst(gY(pl.position,1),0x3a2a4a,60,2.2,1.6,.9);ring(pl.position,0x6a5a8a,2.4,400);kqsStealthVis(true);kqsSnd('shadow');
  enemies.forEach(e=>{if(!e.dead&&!e.boss&&d2(e.m.position,pl.position)<30){e.agg=0;mCancel(e)}});if(tgt&&!tgt.boss){}},
 a_clone(c){const m=kqsShade(0x3a2a5a),P=c.P;m.position.set(P.x-Math.cos(pl.rotation.y)*1.2,GH(P.x,P.z),P.z+Math.sin(pl.rotation.y)*1.2);burst(gY(m.position,1),0x7a4ae0,30,1.5,2,.5);kqsSnd('shadow');
  kqsSummon({mesh:m,life:c.sk.dur,spd:8,reach:1.5,iv:.55,dmg:c.raw,c,col:0x9a6ae0,hum:1})},
 a_phantom(c){const o=c.P.clone(),tp=kqsLand(o,c.gp);burst(gY(o,1),0x3a2a4a,40,1.6,2,.6);kqsTp(tp);hero.iv=Math.max(hero.iv||0,.3);kqsSnd('shadow');kqsSpark(gY(o,1),gY(tp,1),0x9a6ae0);
  setTimeout(()=>{const P=pl.position;ring(P,c.sk.col,c.R*2,320);burst(gY(P,1),0x9a6ae0,40,c.R*1.2,2,.5);arc(P,kqsV(1,0),0xd8c8ff,c.R,300);arc(P,kqsV(-1,0),0xd8c8ff,c.R,300);kqsArea(P,c.R,c.raw,c);kqsRes(40);sfx('stab');shake(.12)},60)},
 a_caltrops(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),m=kqsStd(0x9a9aa8,.15);for(let j=0;j<18;j++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.92,t=kqsMesh(new THREE.TetrahedronGeometry(.11,0),m);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);t.rotation.set(Math.random()*3,Math.random()*3,0);g.add(t)}
  g.position.set(p.x,0,p.z);g.children.forEach(t=>t.position.y=GH(p.x+t.position.x,p.z+t.position.z)+.06);scene.add(g);burst(gY(p,.3),0xb0b0c0,24,R,1,.4);kqsSnd('chain');const D=kqsDecal(p,R,0x8a8a9a,.08,.4);let ti=0;
  kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=.5;kqsFoes(p,R).forEach(e=>{eStatus(e,{slow:1,bleed:3},c.A*.25);kqsHit(e,c.raw,c,{proc:false})})},end:()=>{D.rm(300);kqsFade(g,300)}})},
 a_garrote(c){const t=kqsNear(5);if(!t)return false;const lg=kqsLunge(t);
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw,c);eStatus(t,{stun:c.sk.stun,bleed:8},c.A*(.6+.25*c.pips),'h');kqsChain(gY(pl.position,1.3),gY(t.m.position,1.3),0xd03a3a,300);burst(gY(t.m.position,1.3),0xd03a3a,20+c.pips*6,1.5,1.5,.5);dn(t.m.position,'Silenced','#fca5a5',-30,900);sfx('stab')},100+lg)},
 a_cuts(c){const L=enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<8).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position)).slice(0,6);if(!L.length)return false;
  hero.iv=Math.max(hero.iv||0,L.length*.18+.3);let j=0;kqsSnd('shadow');const step=()=>{const e=L[j];if(e&&!e.dead){const a=e.m.position,an=Math.random()*6.283,o=pl.position.clone(),q=kqsLand(a,kqsV(a.x+Math.cos(an)*1.1,a.z+Math.sin(an)*1.1));kqsSpark(gY(o,1),gY(q,1),0xff8ac8);kqsTp(q);face(kqsDir(q,a));
    burst(gY(q,1),0xff8ac8,14,1.2,1.5,.4);kqsHit(e,c.raw,c,{crit:true});arc(q,kqsDir(q,a),0xffc8e8,1.6,200);sfx('stab');kqsPose('dash',160)}j++;if(j<L.length)setTimeout(step,180);else ring(pl.position,c.sk.col,2.4,300)};step()},
 a_envenom(c){const P=c.P,L=kqsFoes(P,c.R);if(!L.length)return false;const k=1+.2*c.pips;ring(P,0x8ad84a,c.R*2,420);kqsSnd('poison');let any=0;
  L.forEach(e=>{let rem=0;(e.dots||[]).forEach(q=>{if(q.k=='poison'||q.k=='bleed'){rem+=q.dps*Math.max(0,q.t);q.t=0}});if(rem>0)any=1;kqsSpark(gY(P,1),gY(e.m.position,.8),0x8ad84a);kqsHit(e,(c.raw+rem*1.5)*k,c,{proc:false});burst(gY(e.m.position,1),rem>0?0x8ad84a:0x6a8a4a,rem>0?30:10,2,2,.5)});
  if(any)shake(.12)},
 a_eclipse(c){const p=c.gp.clone(),R=c.R,D=kqsDecal(p,R,0x2a0a4a,.0,.9),dark=kqsDrapeM(new THREE.RingGeometry(.001,1,40,3),new THREE.MeshBasicMaterial({color:0x05000a,transparent:true,opacity:.0,depthWrite:false,side:THREE.DoubleSide}),27);
  kqsDrape(dark,(u,v)=>[p.x+u*R,p.z-v*R],.13);tw(300,k=>dark.material.opacity=.55*k);const orb=kqsMesh(new THREE.SphereGeometry(.42,14,10),new THREE.MeshBasicMaterial({color:0x000000}));const hal=kqsMesh(new THREE.RingGeometry(.42,.62,24),kqsAdd(0x9a6ae0));orb.position.copy(gY(p,3.6));hal.position.copy(orb.position);scene.add(orb,hal);kqsSnd('shadow');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{hal.quaternion.copy(cam.quaternion);if(Math.random()<.5){const a=Math.random()*6.283,r=Math.random()*R;burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.2),0x3a1a5a,1,.2,1.2,.8)}ti-=dt;if(ti>0)return;ti=.5;
    if(d2(pl.position,p)<R)kqsBuff('Eclipse','🌒',kqrB(c.sk,{crit:.25,cdm:.3}),700);kqsFoes(p,R).forEach(e=>{eStatus(e,{weak:1,slow:1},0);kqsHit(e,c.raw,c,{proc:false})})},end:()=>{D.rm(400);kqsFade(dark,400);kqsRm(orb);kqsFade(hal,300);kqsUnbuff('Eclipse')}})},
 // ===== RANGER =====
 r_diseng(c){const d=c.d,o=c.P.clone(),tp=kqsLand(o,kqsV(o.x-d.x*6,o.z-d.z*6));launch(o,d,22,{col:c.sk.col,mt:'p',arrow:1},c.raw,.65);kqsFoes(o,3).forEach(e=>eStatus(e,{slow:3},0));burst(gY(o,.3),0xc8e0a0,20,2,1,.4);hero.iv=Math.max(hero.iv||0,.45);kqsSnd('whoosh');
  try{UNS.air=nowP()+460}catch(_){}tw(380,k=>{pl.position.x=o.x+(tp.x-o.x)*k;pl.position.z=o.z+(tp.z-o.z)*k;if(pl.children[0])pl.children[0].position.y=Math.sin(k*Math.PI)*1.3},()=>{if(pl.children[0])pl.children[0].position.y=0;burst(gY(pl.position,.2),0xc8b090,12,1.2,1,.4)})},
 r_wolf(c){const P=c.P,m=kqsWolf(0x8ac8ff);m.position.set(P.x+1,GH(P.x+1,P.z),P.z);burst(gY(m.position,.8),0x9ad0ff,40,1.6,2,.6);ring(m.position,0x9ad0ff,2,400);kqsSnd('beast');
  kqsSummon({mesh:m,life:c.sk.dur,spd:7.5,reach:1.6,iv:.8,dmg:c.raw,c,col:0x9ad0ff,wolf:1})},
 r_frost(c){const p=c.gp.clone(),R=c.R,tr=new THREE.Group();tr.add(kqsMesh(new THREE.OctahedronGeometry(.28,0),kqsStd(0x9fe3ff,.9,.9),0,.32,0));tr.add(kqsMesh(new THREE.TorusGeometry(.45,.06,5,14),kqsStd(0x6a9ab8,.3),0,.06,0));tr.children[1].rotation.x=Math.PI/2;kqsSnd('whoosh');
  const fl=tr.clone();fl.userData.kqsShared=1;kqsLob(c.P,p,fl,360,2,()=>{tr.position.copy(gY(p,0));scene.add(tr);const D=kqsDecal(p,1.3,0x9fe3ff,.06,.5);burst(gY(p,.3),0x9fe3ff,12,1,1,.4);
   kqsTrap({p,life:20,arm:.4,trig:1.4,mesh:tr,deco:D,fire:()=>{ring(p,0x9fe3ff,R*2.1,420);burst(gY(p,.5),0xdff6ff,70,R*1.4,3,.8);kqsSnd('ice');shake(.15);kqsArea(p,R,c.raw,c,{stun:c.sk.stun});
     for(let j=0;j<7;j++){const a=j/7*6.283;kqsSpike(kqsV(p.x+Math.cos(a)*R*.6,p.z+Math.sin(a)*R*.6),0x9fe3ff,1,1)}}})})},
 r_hawk(c){const t=kqsNear(14);if(!t)return false;const h=kqsHawk(0xe8c890),a=gY(pl.position,3.2);h.position.copy(a);scene.add(h);kqsSnd('beast');
  tw(440,k=>{const b=gY(t.m.position,1);h.position.lerpVectors(a,b,k);h.position.y+=Math.sin(k*Math.PI)*2;h.lookAt(b);h.userData.w.forEach((w,j)=>w.rotation.z=(j?-1:1)*Math.sin(k*30)*.6);if(Math.random()<.5)burst(h.position,0xe8c890,1,.2,.2,.3)},
   ()=>{if(!t.dead){kqsHit(t,c.raw,c);t.mark=Math.max(t.mark||0,6);t.markV=Math.max(t.markV||0,.2);dn(t.m.position,'Hunted','#fde68a',-36,900);burst(gY(t.m.position,1),0xe8c890,30,2,2,.5);sfx('crit')}const b=h.position.clone();tw(400,k=>h.position.set(b.x,b.y+k*5,b.z),()=>kqsFade(h,200))})},
 r_mine(c){const p=c.gp.clone(),R=c.R,tr=new THREE.Group();tr.add(kqsMesh(new THREE.CylinderGeometry(.24,.3,.22,8),kqsStd(0x5a3a22,.1),0,.12,0));tr.add(kqsMesh(new THREE.SphereGeometry(.09,6,4),kqsStd(0xff5a1a,1.2),0,.28,0));kqsSnd('whoosh');
  const mine=KQS.objs.filter(o=>o.kqsMine);if(mine.length>=3){const o=mine[0];o.abort=1;o.life=0}
  const fl=tr.clone();fl.userData.kqsShared=1;kqsLob(c.P,p,fl,360,2,()=>{tr.position.copy(gY(p,0));scene.add(tr);const D=kqsDecal(p,1.3,0xff8a3a,.05,.45);
   const o=kqsTrap({p,life:20,arm:.5,trig:1.3,mesh:tr,deco:D,blink:tr.children[1],fire:()=>{ring(p,0xff8a3a,R*2,420);ring(p,0xffd080,R*1.3,300);burst(gY(p,.6),0xff7a2a,80,R*1.4,4,.8);kqsSnd('boom');shake(.3);kqsArea(p,R,c.raw,c,{burn:1})}});o.kqsMine=1})},
 r_rapid(c){let n=0;kqsSnd('arrow');kqsChan({t:c.sk.dur,iv:.2,slow:.4,tick:()=>{if(n>=10)return;n++;const d=aimDir();face(d);launch(pl.position,d,24,{col:c.sk.col,mt:'p',arrow:1,pierce:c.s.pierce||0},c.raw,.7);try{bowAnim(170)}catch(_){}sfx('arrow')}})},
 r_roots(c){const p=c.gp.clone(),R=c.R,g=new THREE.Group(),m=kqsStd(0x4a8a2a,.25);for(let j=0;j<14;j++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.9,t=kqsMesh(new THREE.ConeGeometry(.12,1.1+Math.random()*.6,4),m);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);t.rotation.set((Math.random()-.5)*.8,0,(Math.random()-.5)*.8);g.add(t)}
  g.position.set(p.x,0,p.z);g.children.forEach(t=>t.position.y=GH(p.x+t.position.x,p.z+t.position.z)+.3);g.scale.set(1,.01,1);scene.add(g);kqsSnd('quake');
  setTimeout(()=>{tw(220,k=>g.scale.set(1,k,1));burst(gY(p,.3),0x6ac04a,50,R,2.5,.6);ring(p,c.sk.col,R*2,400);const L=kqsArea(p,R,c.raw,c);L.forEach(e=>eStatus(e,{root:3,poison:4},c.A*.3));shake(.12);
   kqsObj({life:3,end:()=>tw(300,k=>g.scale.set(1,1-k,1),()=>kqsRm(g))})},250)},
 r_stamp(c){const P=c.P.clone(),d=kqsDir(P,c.gp),L=Math.max(4,Math.min(c.sk.L,d2(P,c.gp)+1.5)),w=c.sk.w,n=kqsV(-d.z,d.x),B=[],hit=new Set(),S=P.clone().addScaledVector(d,-1.5);kqsSnd('beast');kqsSnd('quake');
  [-1,-.35,.35,1].forEach((o,j)=>{const b=kqsWolf(j%2?0xc8b088:0xa89070,1.25+(j%2)*.2);b.userData.o=o*w*.42;b.userData.lag=j%2?.06:0;scene.add(b);B.push(b)});const T=.85;
  kqsObj({life:T+.15,tick:(dt,now,o)=>{const k=Math.min(1,o.age/T);B.forEach(b=>{const kk=Math.max(0,k-b.userData.lag),x=S.x+d.x*kk*(L+1.5)+n.x*b.userData.o,z=S.z+d.z*kk*(L+1.5)+n.z*b.userData.o;b.position.set(x,GH(x,z),z);b.rotation.y=Math.atan2(d.x,d.z);b.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(now/40+i*1.6)*.9);if(Math.random()<.3)burst(gY(b.position,.2),0xb09a70,2,.8,1,.4)});
    const front=k*(L+1.5)-1.5;kqsLine(P,d,Math.max(0,front),w).forEach(e=>{if(hit.has(e))return;hit.add(e);kqsHit(e,c.raw,c);if(!e.boss){const s=Math.sign((e.m.position.x-P.x)*n.x+(e.m.position.z-P.z)*n.z)||1;e.vx+=d.x*7+n.x*s*6;e.vz+=d.z*7+n.z*s*6;eStatus(e,{stun:.5},0)}burst(gY(e.m.position,1),0xc8b088,14,2,2,.4);shake(.06)})},
   end:()=>B.forEach(b=>kqsFade(b,250))})},
 r_aimed(c){const glow=kqsMesh(new THREE.SphereGeometry(.16,8,6),kqsAdd(0xfff6d0));scene.add(glow);try{bowAnim(950)}catch(_){}kqsSnd('draw');
  kqsChan({t:.9,iv:.9,ti:.9,slow:.6,tick:()=>{},upd:()=>{const d=aimDir();face(d);glow.position.copy(gY(pl.position,1.3)).addScaledVector(d,.8);glow.scale.setScalar(.6+(KQS.ch?Math.min(1,KQS.ch.el/.9):1)*1.4)},
   end:cancel=>{kqsRm(glow);if(cancel)return;const d=aimDir(),o=gY(pl.position,1.1);face(d);const e=o.clone().addScaledVector(d,20);kqsSpark(o,e,0xfff6d0);kqsSpark(o,e,0xffffff);kqsBeam(o,e,0xfff6d0,.12,260);kqsSnd('snipe');shake(.15);
    kqsLine(pl.position,d,20,1.6).forEach(q=>{kqsHit(q,c.raw,c);burst(gY(q.m.position,1),0xfff6d0,16,1.6,1.5,.4)})}})},
 r_hunt(c){const P=c.P;kqsSnd('beast');kqsSnd('horn');hero.buffs.push({s:kqrB(c.sk,{mspd:.2,compP:.2}),t:c.now+c.sk.dur*1000,n:'Wild Hunt',i:'🐾'});hsDirty();ring(P,c.sk.col,3.2,500);
  [0,1,2].forEach(j=>{const a=pl.rotation.y+Math.PI+(j-1)*.9,m=kqsWolf(j==1?0xb0e8ff:0x7ab8f0,j==1?1.15:.95);m.position.set(P.x+Math.sin(a)*1.8,0,P.z+Math.cos(a)*1.8);m.position.y=GH(m.position.x,m.position.z);burst(gY(m.position,.8),0xa0e0ff,24,1.4,2,.5);
   kqsSummon({mesh:m,life:c.sk.dur,spd:7.8,reach:1.6,iv:.75,dmg:c.raw,c,col:0xa0e0ff,wolf:1,off:j})})},
 // ===== MAGE =====
 m_blink(c){const o=c.P.clone(),tp=kqsLand(o,c.gp);burst(gY(o,1),0xa08aff,40,1.6,2,.6);ring(o,0xa08aff,2.4,300);kqsArea(o,2,c.raw,c,{proc:false});kqsTp(tp);hero.iv=Math.max(hero.iv||0,.25);kqsSpark(gY(o,1),gY(tp,1),0xc8b8ff);burst(gY(tp,1),0xc8b8ff,30,1.2,2,.5);kqsSnd('portal')},
 m_breath(c){const P=c.P,d=c.d;arc(P,d,0xff6a1a,c.R,360);arc(P,d,0xffc040,c.R*.7,280);for(let j=0;j<26;j++){const a=(Math.random()-.5)*1.3,r=1+Math.random()*c.R,co=Math.cos(a),sn=Math.sin(a),dd=kqsV(d.x*co+d.z*sn,-d.x*sn+d.z*co);burst(gY(kqsV(P.x+dd.x*r,P.z+dd.z*r),.9),j%3?0xff6a1a:0xffd060,2,.8,1.2,.5)}
  area(P,c.R,c.raw,Object.assign({},c.fx,{burn:1}),d,.75);kqsSnd('fire');shake(.1)},
 m_orb(c){const d=c.d,P=c.P,orb=kqsMesh(new THREE.IcosahedronGeometry(.36,0),kqsAdd(0xbfefff));orb.add(kqsMesh(new THREE.IcosahedronGeometry(.22,0),kqsStd(0xe8fbff,1)));orb.position.copy(gY(P,1.1)).addScaledVector(d,.8);scene.add(orb);kqsSnd('ice');let ti=.1;
  kqsObj({life:2.4,tick:(dt)=>{orb.position.addScaledVector(d,4.5*dt);orb.position.y=GH(orb.position.x,orb.position.z)+1.1;orb.rotation.x+=dt*3;orb.rotation.y+=dt*4;if(Math.random()<.6)burst(orb.position,0x9fe3ff,1,.6,.4,.4);if(solid(orb.position.x,orb.position.z))return false;
    ti-=dt;if(ti>0)return;ti=.25;const e=enemies.filter(q=>!q.dead&&d2(q.m.position,orb.position)<4).sort((a,b)=>d2(a.m.position,orb.position)-d2(b.m.position,orb.position))[0];if(!e)return;const sd=kqsDir(orb.position,e.m.position),sp=orb.position.clone().setY(orb.position.y-1);
    shots.push({m:(()=>{const m=shotMesh(0x9fe3ff,0);m.position.copy(orb.position);scene.add(m);return m})(),v:sd.clone().multiplyScalar(16),s:{col:0x9fe3ff,mt:'m'},dm:c.A*.35,t:.4,hit:new Set()});eStatus(e,{slow:1.5},0)},
   end:()=>{const p=orb.position.clone().setY(0);kqsRm(orb);ring(p,0x9fe3ff,5,380);burst(gY(p,1),0xdff6ff,60,2.5,2.5,.6);kqsArea(p,2.5,c.raw,c,{stun:.4});kqsSnd('ice')}})},
 m_rift(c){const a=c.P.clone(),b=kqsLand(a,c.gp),mk=p=>{const g=new THREE.Group(),r=kqsMesh(new THREE.TorusGeometry(.75,.1,6,22),kqsAdd(0xc06aff)),f=kqsMesh(new THREE.CircleGeometry(.72,22),kqsAdd(0x5a2a9a));f.material.opacity=.55;g.add(r,f);g.position.copy(gY(p,1.05));scene.add(g);return g};
  const A=mk(a),B=mk(b),D1=kqsDecal(a,.9,0xc06aff,.2,.8),D2=kqsDecal(b,.9,0xc06aff,.2,.8);kqsTp(b);burst(gY(a,1),0xc06aff,30,1.4,2,.5);burst(gY(b,1),0xc06aff,30,1.4,2,.5);kqsSnd('portal');let inside=1,cd=0;
  kqsObj({life:c.sk.dur*kqrD(c.sk),tick:(dt,now)=>{[A,B].forEach((g,j)=>{g.quaternion.copy(cam.quaternion);g.children[0].rotation.z+=dt*3;if(Math.random()<.3)burst(g.position,0xc06aff,1,.6,.4,.5)});cd-=dt;
    const da=d2(pl.position,a),db=d2(pl.position,b),near=da<.95?a:db<.95?b:null;if(!near){inside=0;return}if(inside||cd>0)return;const to=near===a?b:a;burst(gY(pl.position,1),0xc06aff,30,1.4,2,.5);kqsTp(to);inside=1;cd=.8;kqsSnd('portal');burst(gY(to,1),0xc06aff,30,1.4,2,.5)},
   end:()=>{kqsFade(A,300);kqsFade(B,300);D1.rm(300);D2.rm(300)}})},
 m_warp(c){const p=c.gp.clone(),R=c.R,D=kqsDecal(p,R,c.sk.col,.16,.8),hand=kqsDrapeM(new THREE.PlaneGeometry(.12,1,1,6),kqsDMat(0xdff6ff,.8)),hand2=kqsDrapeM(new THREE.PlaneGeometry(.18,1,1,6),kqsDMat(0xdff6ff,.8));kqsSnd('portal');
  kqsObj({life:c.sk.dur*kqrD(c.sk),tick:(dt,now,o)=>{const a1=o.age*3,a2=o.age*.5;[[hand,a1,.9],[hand2,a2,.6]].forEach(([h,an,len])=>kqsDrape(h,(u,v)=>{const y=(v+.5)*R*len;return [p.x+Math.sin(an)*y+Math.cos(an)*u,p.z-Math.cos(an)*y+Math.sin(an)*u]},.17));
    kqsFoes(p,R).forEach(e=>{e.ch=Math.max(e.ch||0,.4);e.cd=(e.cd||0)+dt*.6;if(e.atk&&e.atk.t!=null)e.atk.t+=dt*.5;if(Math.random()<.05)burst(gY(e.m.position,1.2),0x8ad8ff,2,.4,.4,.6)});
    if(d2(pl.position,p)<R){for(const k in hero.cd)hero.cd[k]=Math.max(0,hero.cd[k]-dt*.5);if(Math.random()<.2)burst(gY(pl.position,1.4),0x8ad8ff,1,.3,.5,.6)}},end:()=>{D.rm(400);kqsFade(hand,300);kqsFade(hand2,300)}})},
 m_disint(c){kqsSnd('beam');let ti=0;kqsChan({t:c.sk.dur,iv:.2,slow:.6,tick:()=>{const d=aimDir();face(d);const o=gY(pl.position,1.15).addScaledVector(d,.6),e=o.clone().addScaledVector(d,10);kqsBeam(o,e,0xc890ff,.18,210);kqsBeam(o,e,0xffffff,.06,210);burst(e,0xc890ff,4,.8,.6,.3);
    kqsLine(pl.position,d,10,1.3).forEach(q=>{kqsHit(q,c.raw,c,{proc:false});burst(gY(q.m.position,1),0xc890ff,4,1,1,.3)});if(Math.random()<.4)kqsPose('cast',220)}})},
 m_wall(c){const p=c.gp.clone(),d=kqsDir(c.P,p),n=kqsV(-d.z,d.x),L=c.sk.L,w=c.sk.w,strip=kqsDrapeM(new THREE.PlaneGeometry(w,L,1,14),kqsDMat(0xff6a1a,.45));kqsDrape(strip,(u,v)=>[p.x+n.x*v+d.x*u,p.z+n.z*v+d.z*u],.15);
  const F=[],fm=kqsAdd(0xff5a10);fm.opacity=.55;for(let j=0;j<12;j++){const t=kqsMesh(new THREE.ConeGeometry(.26,1.5,5),fm);t.userData.kqsKeep=1;const y=(j/11-.5)*L;t.position.set(p.x+n.x*y,0,p.z+n.z*y);t.position.y=GH(t.position.x,t.position.z)+.7;scene.add(t);F.push(t)}kqsSnd('fire');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now)=>{F.forEach((t,j)=>{const s=.8+Math.sin(now/90+j*1.7)*.25;t.scale.set(1,s+.4,1)});for(let k=0;k<3;k++){const y=(Math.random()-.5)*L;burst(gY(kqsV(p.x+n.x*y,p.z+n.z*y),.4+Math.random()),Math.random()<.5?0xff6a1a:0xffd060,1,.3,2,.5)}
    ti-=dt;if(ti>0)return;ti=.4;kqsLine(kqsV(p.x-n.x*L/2,p.z-n.z*L/2),n,L,w+.4).forEach(e=>{kqsHit(e,c.raw,c,{proc:false});eStatus(e,{burn:3},c.A*.3)})},end:()=>{kqsFade(strip,400);F.forEach(t=>kqsRm(t));fm.dispose()}})},
 m_rewind(c){const now=c.now,h=KQS.hist;let q=null;for(let j=0;j<h.length;j++){if(now-h[j].t>=3800){q=h[j]}}if(!q)q=h[0];if(!q||now-q.t<900){say('Nothing to rewind to yet.');return false}
  const o=pl.position.clone();ring(o,c.sk.col,2.6,400);burst(gY(o,1),0x9ad8ff,40,1.6,2,.6);kqsTp(kqsV(q.x,q.z));hero.hp=Math.min(heroMax(),Math.max(hero.hp,q.hp));hero.mp=Math.min(mpMax(),Math.max(hero.mp,q.mp));heroCleanseSlow();
  ring(pl.position,c.sk.col,3,500);burst(gY(pl.position,1),0xdff6ff,50,1.8,2.5,.7);popT(pl.position,'⌛ REWIND','#bae6fd',true);kqsSnd('rewind');hero.iv=Math.max(hero.iv||0,.4)},
 m_sing(c){const p=c.gp.clone(),R=c.R,core=kqsMesh(new THREE.SphereGeometry(.6,14,10),new THREE.MeshBasicMaterial({color:0x000000})),hal=kqsMesh(new THREE.RingGeometry(.65,1.3,28),kqsAdd(0x8a4aff)),D=kqsDecal(p,R,0x8a4aff,.14,.8);core.position.copy(gY(p,1.2));hal.position.copy(core.position);scene.add(core,hal);kqsSnd('portal');let ti=0;
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const k=o.age/c.sk.dur;core.scale.setScalar(.6+k*.9);hal.quaternion.copy(cam.quaternion);hal.rotation.z=now/120;hal.scale.setScalar(1+k);for(let j=0;j<3;j++){const a=Math.random()*6.283,r=R*(.5+Math.random()*.5);burst(gY(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),.6),0xb08aff,1,.2,.2,.5)}
    kqsFoes(p,R+1).forEach(e=>{if(e.boss)return;const v=kqsV(p.x-e.m.position.x,p.z-e.m.position.z),L=v.length();if(L>.6)walkM(e.m,v.x/L*Math.min(L,3.6*dt),v.z/L*Math.min(L,3.6*dt));e.vx=e.vz=0});ti-=dt;if(ti>0)return;ti=.25;kqsArea(p,R,c.raw,c,{proc:false})},
   end:o=>{kqsRm(core);kqsFade(hal,200);D.rm(300);if(o.abort)return;ring(p,0xb08aff,R*2,420);ring(p,0xffffff,R*1.2,300);burst(gY(p,1),0xb08aff,80,R*1.2,3,.7);kqsArea(p,R*.7,c.A*2.5,c,{stun:.6});shake(.3);kqsSnd('boom')}})},
 m_comets(c){const p=c.gp.clone(),R=c.R,E=[[0xff7a2a,{burn:1}],[0x9fe3ff,{stun:.5}],[0xfff06a,{}]];kqsSnd('fire');const D=kqsDecal(p,R,c.sk.col,.06,.55);
  for(let j=0;j<8;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),[col,x]=E[j%3],m=kqsMesh(new THREE.IcosahedronGeometry(.45,0),kqsAdd(col));const s=gY(q,14).add(kqsV(-3,-2));m.position.copy(s);scene.add(m);
    kqsWarn(q,2,col,.45,()=>{});tw(450,k=>{m.position.lerpVectors(s,gY(q,.3),k);burst(m.position,col,2,.4,.3,.4)},()=>{kqsRm(m);ring(q,col,4,320);burst(gY(q,.4),col,40,2,3,.6);kqsArea(q,2,c.raw,c,x);if(j%3==2)kqsFoes(q,2).forEach(e=>kqsSpark(gY(q,4),gY(e.m.position,1),col));shake(.12);sfx(j%3==2?'zap':'boom',.5)})},j*300);
  setTimeout(()=>D.rm(400),2900)}
};
// small shared visuals
// melee single-target abilities step in when the enemy is a little out of reach; returns the extra delay (ms)
function kqsLunge(t){const d=kqsDir(pl.position,t.m.position),L=d2(pl.position,t.m.position)-1.5-(t.boss?1.2:0);face(d);if(L<=.25)return 0;const T=L/16;hero.dash={x:d.x,z:d.z,t:T};hero.iv=Math.max(hero.iv||0,T*.5);return Math.round(T*1000)}
function kqsSpike(p,col,h,ice){const m=kqsMesh(new THREE.ConeGeometry(.28,h||1,5),ice?kqsStd(col,.6,.85):kqsStd(col,.08));m.position.copy(gY(p,-(h||1)/2));scene.add(m);const y0=m.position.y;tw(140,k=>m.position.y=y0+k*(h||1)*.9,()=>setTimeout(()=>tw(380,k=>m.position.y=y0+(1-k)*(h||1)*.9,()=>kqsRm(m)),450))}
function kqsChain(a,b,col,ms){const n=Math.max(3,Math.round(a.distanceTo(b)/.35)),g=new THREE.Group(),m=kqsStd(col,.25);for(let j=0;j<n;j++){const l=kqsMesh(new THREE.TorusGeometry(.1,.03,4,8),m);l.position.lerpVectors(a,b,j/(n-1));l.rotation.y=j%2?Math.PI/2:0;l.lookAt(b);if(j%2)l.rotateZ(Math.PI/2);g.add(l)}scene.add(g);setTimeout(()=>kqsFade(g,200),ms||250)}
function kqsBeam(a,b,col,w,ms){const L=a.distanceTo(b),m=kqsMesh(new THREE.CylinderGeometry(w,w,L,6,1,true),kqsAdd(col));m.position.lerpVectors(a,b,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());scene.add(m);tw(ms||200,k=>{m.material.opacity=.9*(1-k)},()=>kqsRm(m))}
function kqsPose(p,ms){try{const T=kqsPoseT(p);if(T&&T[0]&&typeof haPlay=='function'){haPlay(ms||T[1],T[0],2,null,.15)}}catch(_){}}
// traps: arm, then fire when an enemy steps within `trig`
function kqsTrap(t){let armed=0;return kqsObj({life:t.life,tick:(dt,now,o)=>{if(t.blink)t.blink.material.emissiveIntensity=.6+Math.sin(now/(armed?120:60))*.6;if(o.age<t.arm)return;armed=1;if(kqsFoes(t.p,t.trig).length){t.fire();return false}},end:()=>{kqsFade(t.mesh,250);if(t.deco)t.deco.rm(250)}})}
// summons: chase the nearest enemy near the hero, strike every `iv` seconds
function kqsSummon(S){scene.add(S.mesh);S.ti=.3;S.tgt=null;const m=S.mesh;
  return kqsObj({life:S.life,tick:(dt,now,o)=>{const P=pl.position;if(!S.tgt||S.tgt.dead||d2(S.tgt.m.position,P)>16)S.tgt=enemies.filter(e=>!e.dead&&d2(e.m.position,P)<13&&(e.agg||d2(e.m.position,P)<7)).sort((a,b)=>d2(a.m.position,m.position)-d2(b.m.position,m.position))[0]||null;
    let goal=S.tgt?S.tgt.m.position:kqsV(P.x-Math.sin(pl.rotation.y+(S.off||0))*1.8,P.z-Math.cos(pl.rotation.y+(S.off||0))*1.8),L=d2(goal,m.position),mv=0;const reach=S.tgt?S.reach+(S.tgt.boss?1.2:0):.6;
    if(d2(m.position,P)>22){m.position.set(P.x,0,P.z)}
    if(L>reach){const v=kqsV(goal.x-m.position.x,goal.z-m.position.z).normalize(),sp=Math.min(L-reach+.05,S.spd*dt*(S.tgt?1:Math.min(1.4,L/2)));walk(m,v.x*sp,v.z*sp);m.rotation.y=Math.atan2(v.x,v.z);mv=1}
    else if(S.tgt){const v=kqsV(goal.x-m.position.x,goal.z-m.position.z);m.rotation.y=Math.atan2(v.x,v.z)}
    m.position.y=GH(m.position.x,m.position.z);
    if(S.wolf){(m.userData.legs||[]).forEach((l,i)=>l.rotation.x=mv?Math.sin(now/70+(i%2?0:Math.PI)+(i>1?1.2:0))*.8:0);if(m.userData.tail)m.userData.tail.rotation.x=-2.1+Math.sin(now/120)*.25}
    if(S.hum)m.children.forEach((q,i)=>{if(i>3&&i<8)q.rotation.x=-.6+(mv?Math.sin(now/90+i)*.4:0)});
    if(Math.random()<.25)burst(gY(m.position,.8),S.col,1,.3,.5,.5);
    S.ti-=dt;if(S.tgt&&L<=reach+.15&&S.ti<=0){S.ti=S.iv;const e=S.tgt;heroHit(e,S.dmg,S.c.mt,{s:{col:S.col},proc:false,kqsSum:1});burst(gY(e.m.position,.9),S.col,10,1.4,1.5,.3);const b0=m.position.clone(),v=kqsDir(b0,e.m.position);tw(160,k=>{const q=Math.sin(k*Math.PI)*.5;m.position.x=b0.x+v.x*q;m.position.z=b0.z+v.z*q})}},
   end:()=>{burst(gY(m.position,.8),S.col,24,1.4,2,.5);kqsFade(m,300)}})}
// stealth look: the hero turns translucent
function kqsStealthVis(on){try{pl.traverse(o=>{if(!o.material)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>{if(on){if(q.userData.kqsOp==null)q.userData.kqsOp=[q.transparent,q.opacity];q.transparent=true;q.opacity=Math.min(q.opacity,.28);q.needsUpdate=true}
  else if(q.userData.kqsOp){q.transparent=q.userData.kqsOp[0];q.opacity=q.userData.kqsOp[1];q.userData.kqsOp=null;q.needsUpdate=true}})})}catch(_){}}
{const f=heroHit;heroHit=function(e,raw,mt,o){if(KQS.stealth&&e&&!e.dead&&!(o&&o.kqsSum)){const now=performance.now();if(KQS.stealth>now){o=Object.assign({},o||{},{crit:true});raw*=1.5;try{popT(e.m.position,'AMBUSH!','#c4b5fd',true)}catch(_){}}KQS.stealth=0;kqsUnbuff('Vanish');hero.buffs=hero.buffs.filter(b=>b.n!='Vanish');hsDirty();kqsStealthVis(false)}return f.call(this,e,raw,mt,o)}}
{const f=seeTg;seeTg=function(a,b){if(KQS.stealth>performance.now()&&b&&Math.abs(b.x-pl.position.x)<.01&&Math.abs(b.z-pl.position.z)<.01)return false;return f.apply(this,arguments)}}
{const f=down;down=function(){if(KQS.unbrk>performance.now()){hero.hp=1;dn(pl.position,'🗿 Unbreakable','#d6d3d1',-20,700);return}return f.apply(this,arguments)}}

