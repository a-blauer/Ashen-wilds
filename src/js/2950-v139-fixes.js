// ================= v139: power on a smaller scale, power instead of level ranges, flail trail, live previews =================
// * Power: the number shown is 4·√(the old power) rounded, so it climbs gently (about 100 at level 1, about 600 at level 50
//   with good gear, where the old number read 650 and 23,600). recPower uses the same scale (rounded to 5); compare the two only.
// * Places that showed an instance's enemy level range now show the recommended power (rpTxt139; edits in 0510, 0540, 1190,
//   1350, 1830, 1940, 1981, 2210).
// * Flail: the trail of the two sweeps is drawn where the ball really travels (measured from the weapon model each swing),
//   not at the edge of the hit area (which v127 widened to 3.6 tiles); the overhead crash's ring is sized the same way.
//   The hit area itself is unchanged (balance, v127).
// * The shared 3D preview (PV): reopening the inventory left the preview frozen when its picture was already in place
//   (bagPV returns early and the render loop had stopped when the window closed), so gear changes did not show. bagPV now
//   restarts the loop, and the bag's 400 ms check also watches the hero's look.
function pwr139(x){return Math.round(4*Math.sqrt(Math.max(0,x)))}
function pwrRaw139(s){const off=Math.max(s.pa,s.ma)*(1+(s.crit||0)*(s.cdm||.75))*(1+(s.as||0)),sur=s.hp*(1+(s.pd+s.md)/2/45)*(1+(s.dr||0));return Math.sqrt(off*sur)*10}
pwrOf=function(s){return pwr139(pwrRaw139(s))};
function nakedRaw139(cls,L){const C=CLS[cls],st={};['hp','pa','ma','pd','md'].forEach(k=>st[k]=C.base[k]+C.per[k]*(L-1)/ATR139.flat);st.crit=C.crit;st.cdm=.75;return pwrRaw139(st)}
nakedPwr=function(cls,L){return pwr139(nakedRaw139(cls,L))};
recPower=function(L){let a=RECT[0],b=RECT[RECT.length-1];for(let i=0;i<RECT.length-1;i++)if(L>=RECT[i][0]&&L<=RECT[i+1][0]){a=RECT[i];b=RECT[i+1];break}
  const v=a[1]+(b[1]-a[1])*((L-a[0])/((b[0]-a[0])||1));return Math.round(pwr139(v*nakedRaw139(hero.cls,L)/nakedRaw139('warrior',L))/5)*5};
function rpTxt139(L){let r=0;try{r=recPower(L)}catch(_){}return r?'⚔ Rec. power '+r.toLocaleString():''}
// ---- flail trail at the ball's real reach ----
var FL139={r:1.3,min:.9,max:2,id:null};
function fl139Reach(){try{const W=(pl.gearG||[])[0],id=eq.weapon?eq.weapon.id:null;if(id!==FL139.id){FL139.id=id;FL139.r=1.3}if(!W)return FL139.r;W.updateWorldMatrix(true,true);const v=new THREE.Vector3();let far=0;
  W.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;const P=o.geometry.attributes.position,st=Math.max(1,P.count>>6);
    for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);const h=Math.hypot(v.x-pl.position.x,v.z-pl.position.z);if(h>far)far=h}});
  if(far>0)FL139.r=Math.max(FL139.min,Math.min(FL139.max,Math.max(far,FL139.r)))}catch(_){}return FL139.r}   // the furthest the ball has been seen (per weapon)
flailFx105=function(d,st,rg){try{const col=0xfff0b0,g=new THREE.Group(),a0=Math.atan2(d.x,d.z),half=1.48,R=fl139Reach()+.08;
    const geo=new THREE.RingGeometry(Math.max(.2,R-.38),R,28,1,0,half*2),m=new THREE.Mesh(geo,addMat(col));m.material.side=THREE.DoubleSide;g.add(m);
    m.rotation.x=-Math.PI/2;m.rotation.z=a0-Math.PI/2-half;g.position.copy(gY(pl.position,1.05));
    scene.add(g);const dirS=st==1?1:-1;
    tw(260,k=>{m.material.opacity=.75*(1-k);m.rotation.z+=dirS*.012;g.scale.setScalar(1+k*.08)},()=>{scene.remove(g);geo.dispose()})}catch(_){}};
// the crash (third blow): the default ring spans .42..1.02 of its radius, so hand it the ball's reach
{const f=slashFx;slashFx=function(d,st,rg){if(st==2&&typeof atkWT=='function'&&atkWT()=='flail')return f.call(this,d,st,(fl139Reach()+.15)/1.02);return f.apply(this,arguments)}}
// ---- the shared preview keeps drawing ----
function pvKick139(){try{if(PV.r&&!PV.run&&PV.cv&&PV.cv.isConnected&&PV.cv.offsetParent){PV.run=true;PV.last=0;requestAnimationFrame(pvLoop)}}catch(_){}}
{const f=bagPV;bagPV=function(){const r=f.apply(this,arguments);pvKick139();return r}}
var BAGLK139='';
setInterval(()=>{try{if(!HP||!$('bag')||$('bag').classList.contains('hide'))return;const lk=JSON.stringify(pl.mdLook||{});if(lk!==BAGLK139){const first=!BAGLK139;BAGLK139=lk;
  if(!first){HP.mdLook=Object.assign({},pl.mdLook||{});refreshGear(HP)}}pvKick139()}catch(_){}},400);
// ---- guard: a monster drawn far bigger than its own size, or sunk under the ground, is put right ----
// The owner saw some monsters huge and under the map (Oct 2026). It could not be reproduced in tests (every kind, every field
// instance, fights, deaths, respawns), so twice a second every drawn monster that is not mid-move is checked: a scale above
// 1.6x its body size (m.bs) goes back to its size and a root more than 0.6 tiles under the ground is lifted onto it. Each fix is
// counted in G139 and the first few are logged (kind, scale, height) so a report can say what happened.
var G139={n:0,log:[]};
function g139Note(e,what){G139.n++;if(G139.log.length<12){const m=e.m;G139.log.push({k:e.c&&e.c.en,what,sc:+m.scale.x.toFixed(2),bs:+(m.bs||0).toFixed(2),y:+m.position.y.toFixed(2),g:+GH(m.position.x,m.position.z).toFixed(2)});console.warn('v139 enemy guard',what,G139.log[G139.log.length-1])}}
function g139Tick(){try{if(typeof enemies=='undefined'||(typeof ABX!='undefined'&&ABX.on&&ABX.ctx))return;
  for(const e of enemies){if(!e||e.dead||e.boss||e.ar!=null||e.hid||e.atk||!e.m||!e.m.visible||!e.m.parent)continue;const m=e.m,bs=m.bs||1,sc=m.scale.x;
    if(!(sc<=bs*1.6)){g139Note(e,'scale');m.scale.setScalar(bs)}
    const g=GH(m.position.x,m.position.z);if(isFinite(g)&&m.position.y<g-.6){g139Note(e,'sunk');m.position.y=g}}}catch(_){}}
setInterval(g139Tick,500);
