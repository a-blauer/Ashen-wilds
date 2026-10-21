// ---------- world state ----------
const fols=[null,null],leadK=['',''];let rmb=false,atkCd=0,atkHeld=false,mOn=false,spT=3,hudT=0,incSel=0,inited=false;
const K={},dp=[0,0],mg=V(),enemies=[],shots=[],drops=[],rc=new THREE.Raycaster(),pln=new THREE.Plane(V(0,1,0),0),look=V(START[0],.5,START[1]);
const hero={hp:100,sp:['Power Strike'],known:['Power Strike'],last:{},cd:{},sl:{'Power Strike':{l:1,x:0}}},CR=[[.3,.3],[-.3,.3],[.3,-.3],[-.3,-.3]],MAXMOB=70;
const mpMax=()=>Math.round(HS().mp),spCost=n=>{const s=MOVES[n];return Math.round(4+s.m*3.5+s.cd*.8)},kills={};
const gs=k=>0;
const heroMax=()=>Math.round(HS().hp),heroAtk=()=>atkOf(heroMt()),df=()=>Math.round(HS().pd);
// is any window open? (runs every frame: the 13 window elements are looked up once, after all of them exist)
var UIO_IDS=['fz','bag','inc','cmp','shop','mshop','wmap','setw','tal','hatch','start','xw','dth'],UIO_EL=null;
const uiOpen=()=>{if(typeof KQMENU!='undefined'&&KQMENU.on)return true;
  if(!UIO_EL){const L=UIO_IDS.map(i=>$(i));if(L.some(x=>!x))return UIO_IDS.some(i=>$(i)&&!$(i).classList.contains('hide'));UIO_EL=L}
  for(let i=0;i<UIO_EL.length;i++)if(!UIO_EL[i].classList.contains('hide'))return true;return false};
const solid_old=(x,z)=>{const t=MAP[Math.round(z)]&&MAP[Math.round(z)][Math.round(x)];return !t||t=='#'||t=='~'||t=='r'||t=='R'||t=='W'||t=='B'};
function walkM(o,dx,dz){const p=o.position,bx=p.x,bz=p.z,od=tDist(bx,bz);walk(o,dx,dz);const nd=tDist(p.x,p.z);if(nd<TS+4&&nd<od){p.x=bx;p.z=bz}}
function tcHit(x,z){const t=townAt(x,z,0);if(t<0)return false;for(const c of TOWNS[t].col){if(c.r!=null){const dx=x-c.x,dz=z-c.z,rr=c.r+.28;if(dx*dx+dz*dz<rr*rr)return true}else if(Math.abs(x-c.x)<c.hx+.28&&Math.abs(z-c.z)<c.hz+.28)return true}return false}
cam.position.set(START[0],4.5,START[1]+8.2);
const bossT=BOSSES.map(()=>0);
const mmB=document.createElement('canvas');mmB.width=W;mmB.height=H;
{const c=mmB.getContext('2d'),id=c.createImageData(W,H),cl={'.':[130,108,80],g:[64,108,60],a:[116,112,124],'#':[24,44,30],'~':[44,88,140],H:[210,180,100],r:[96,96,104]};
 MAP.forEach((r,y)=>r.forEach((t,x)=>{const bm=BIOMES[MAP.bio[y][x]],b=t=='R'?[96,92,88]:t=='W'?[196,188,170]:t=='B'?[168,126,92]:t=='P'?[200,190,164]:t=='p'?[168,140,96]:t=='#'?bm.frs.map(v=>v*.8):t=='~'?bm.wat:t=='g'?bm.grs:t=='a'?bm.acc:bm.gnd;id.data.set([b[0],b[1],b[2],255],(y*W+x)*4)}));c.putImageData(id,0,0)}
const mmC=$('mini'),mmX=mmC.getContext('2d');
function mini_base(){
  const w=mmC.width,h=mmC.height,vw=64,vh=48,cx=Math.max(vw/2,Math.min(W-vw/2,pl.position.x)),cy=Math.max(vh/2,Math.min(H-vh/2,pl.position.z));
  mmX.imageSmoothingEnabled=false;mmX.clearRect(0,0,w,h);mmX.drawImage(mmB,cx-vw/2+.5,cy-vh/2+.5,vw,vh,0,0,w,h);
  const kx=w/vw,ky=h/vh,P=(x,z)=>[(x-(cx-vw/2)+.5)*kx,(z-(cy-vh/2)+.5)*ky];
  enemies.forEach(e=>{if(e.dead)return;const [x,y]=P(e.m.position.x,e.m.position.z);if(x<0||y<0||x>w||y>h)return;const z=e.boss?7:e.c.al?5:3;mmX.fillStyle=e.boss?'#c084fc':e.c.al?'#f0abfc':'#f87171';mmX.fillRect(x-z/2,y-z/2,z,z)});
  TOWNS.forEach(t=>{const [mx,my]=P(t.cx,t.cy);if(mx<-8||my<-8||mx>w+8||my>h+8)return;mmX.fillStyle='#fbbf24';mmX.fillRect(mx-4,my-4,8,8);mmX.strokeStyle='#000';mmX.lineWidth=1;mmX.strokeRect(mx-4,my-4,8,8)});
  const [qx,qy]=P(pl.position.x,pl.position.z);mmX.fillStyle='#fff';mmX.beginPath();mmX.arc(qx,qy,3.5,0,6.28);mmX.fill();
}
// ---- wild creature movesets: telegraphed attacks that can be side-stepped or dashed through ----
const MSET={Foxlet:['bite','pounce'],Ashwolf:['bite','pounce','charge'],Mossfrog:['spit','pounce','bite'],Stoneshell:['slam','charge','bite'],Skyhawk:['charge','bite'],Drakelet:['spit','bite','charge'],Batwing:['bite','charge'],Cryptspider:['spit','pounce','bite'],Gloomcap:['spin','spit'],Boneling:['bite','spin'],Wispling:['spit','slam'],Gravewyrm:['charge','spin','bite']};
const MV={
 bite:{rmin:0,rmax:1.9,wind:.5,act:.24,rec:.45,cd:1.4,dmg:1,sh:'cone',r:2.1,ang:.75},
 pounce:{rmin:2.6,rmax:6,wind:.75,act:.48,rec:.65,cd:2.8,dmg:1.3,sh:'circle',r:1.5,at:'tg'},
 charge:{rmin:2.4,rmax:7,wind:.85,act:.5,rec:.75,cd:3.2,dmg:1.4,sh:'line',w:1.4,l:7},
 spin:{rmin:0,rmax:2.1,wind:.7,act:.42,rec:.55,cd:2.6,dmg:1.2,sh:'circle',r:2.4,at:'self'},
 slam:{rmin:0,rmax:2.7,wind:1,act:.26,rec:.75,cd:3.2,dmg:1.6,sh:'circle',r:3.1,at:'self'},
 spit:{rmin:2.4,rmax:9,wind:.6,act:.22,rec:.5,cd:2.4,dmg:1,sh:'line',w:.55,l:9}};
const SPITC={Drakelet:0xff7a2a,Mossfrog:0x9aff5a,Cryptspider:0xe8e8ff,Gloomcap:0xc08aff,Wispling:0x9fe8ff};
const eshots=[];
function telMake(a,e){
  const M0=a.M,s=a.sz,g=new THREE.Group();let geo;
  if(M0.sh=='cone')geo=()=>new THREE.CircleGeometry(M0.r*s,28,-Math.PI/2-M0.ang,M0.ang*2);
  else if(M0.sh=='line')geo=()=>new THREE.PlaneGeometry(M0.w*s,M0.l).translate(0,-M0.l/2,0);
  else geo=()=>new THREE.CircleGeometry(M0.r*s,36);
  const tm=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,fog:false}),o=new THREE.Mesh(geo(),tm(0xd0200a,.42)),f=new THREE.Mesh(geo(),tm(0xff2a0a,.3));
  [o,f].forEach(q=>{q.rotation.x=-Math.PI/2;g.add(q)});f.position.y=.01;
  const at=M0.at=='tg'?a.tp:e.m.position;g.position.copy(gY(at,.12));g.rotation.y=Math.atan2(a.d.x,a.d.z);
  scene.add(g);g.f=f;g.o=o;return g}
function mCancel(e){const a=e&&e.atk;if(!a)return;if(a.tel){scene.remove(a.tel);a.tel.traverse(o=>o.geometry&&o.geometry.dispose())}e.atk=null;if(e.m){e.m.pose=null;e.m.atk=0;e.m.ak=null}}
function mStart(e,tg,n){
  const M0=MV[n],m=e.m,d=V(tg.position.x-m.position.x,0,tg.position.z-m.position.z),L=d.length()||1;d.multiplyScalar(1/L);
  const al=e.c.al?.8:1,a={n,M:M0,ph:0,T:M0.wind*al,t:M0.wind*al,d,tg,o:m.position.clone(),tp:tg.position.clone(),sz:e.c.al?1.25:1,hit:0};
  if(n=='pounce'){const q=a.tp;let k=1;while(k>0&&solid(m.position.x+(q.x-m.position.x)*k,m.position.z+(q.z-m.position.z)*k))k-=.1;a.tp.set(m.position.x+(q.x-m.position.x)*Math.max(0,k),0,m.position.z+(q.z-m.position.z)*Math.max(0,k))}
  m.rotation.y=Math.atan2(d.x,d.z);a.tel=telMake(a,e);e.atk=a;m.pose={};
}
const d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function mTick(e,dt,now){
  const a=e.atk,M0=a.M,m=e.m,P=m.pose||(m.pose={}),ib=1/(m.bs||1),tg=a.tg;
  a.t-=dt;{const kk=a.ph==0?1-a.t/a.T:a.ph==1?1-a.t/(a.A||1):a.t/(a.R||1);m.ak={n:a.n,ph:a.ph,k:Math.max(0,Math.min(1,kk))}}
  if(a.ph==0){
    const k=Math.min(1,1-a.t/a.T),q=1-Math.pow(1-k,2);
    if(a.tel){if(M0.sh=='line')a.tel.f.scale.set(1,q,1);else a.tel.f.scale.setScalar(.08+.92*q);a.tel.f.material.opacity=.3+.4*q;a.tel.o.material.opacity=.42+(k>.8?.25*Math.sin(now/40):0);if(M0.at=='self')a.tel.position.copy(gY(m.position,.12))}
    if(a.n=='bite'||a.n=='strike'){P.rx=-.32*q;P.z=-.18*q}
    else if(a.n=='pounce'){P.rx=.22*q;P.y=-.07*q*ib;P.ry=Math.sin(now/45)*.04*q}
    else if(a.n=='charge'){P.rx=.28*q;P.z=-.28*q;P.ry=Math.sin(now/38)*.09*q}
    else if(a.n=='spin'){P.ry=-.75*q}
    else if(a.n=='slam'){P.y=.65*q*ib;P.rx=-.45*q}
    else if(a.n=='spit'||a.n=='throw'||a.n=='bolt'||a.n=='rainfire'){P.rx=-.45*q;m.atk=k>.5?1:0}
    if(a.t<=0){a.ph=1;a.t=M0.act;a.A=M0.act;if(a.tel){a.tel.o.material.opacity=.6;a.tel.f.material.color.setHex(0xffd0a0)}
      if(a.n=='spit'||M0.proj){const c=(M0.proj&&M0.proj.col)||SPITC[rigOf(e.c.g[0])]||(e.c.mt=='m'?0xff7a2a:0xb0ff6a),o=new THREE.Mesh(new THREE.SphereGeometry(.2*a.sz,10,8),addMat(c)),dd=V(a.tp.x-m.position.x,0,a.tp.z-m.position.z).normalize();
        o.position.copy(gY(m.position,.7)).addScaledVector(dd,.6);scene.add(o);eshots.push({m:o,v:dd.multiplyScalar((M0.proj&&M0.proj.spd)||7.5),t:1.6,e,c,mult:M0.dmg*(e.enr?1.3:1),mt:M0.mt||e.c.mt});burst(gY(m.position,.7),c,10,1.2,1,.3)}
      if(a.n=='charge'||a.n=='bite')m.atk=1}
  }else if(a.ph==1){
    const k=Math.min(1,1-a.t/a.A),s=Math.sin(k*Math.PI);
    if(a.n=='bite'||a.n=='strike'){P.rx=.4*s;P.z=.75*s;m.atk=1;
      if(!a.hit&&k>=.45){a.hit=1;const v=V(tg.position.x-a.o.x,0,tg.position.z-a.o.z),L=v.length();if(L<M0.r*a.sz+.35&&(L<.5||Math.acos(Math.min(1,v.dot(a.d)/L))<M0.ang+.2))hitTarget(e,tg,M0.dmg)}}
    else if(a.n=='pounce'){const p=a.o.clone().lerp(a.tp,k);m.position.x=p.x;m.position.z=p.z;P.y=Math.sin(k*Math.PI)*1.5*ib;P.rx=-.4+.8*k;P.ry=0;
      if(a.t<=0&&!a.hit){a.hit=1;ring(a.tp,0xffb070,2.2,300);burst(gY(a.tp,.2),0xc8b090,16,2,1.2,.45);if(d2(tg.position,a.tp)<M0.r*a.sz+.3)hitTarget(e,tg,M0.dmg)}}
    else if(a.n=='charge'){const sp=M0.l/M0.act,bx=m.position.x,bz=m.position.z;walkM(m,a.d.x*sp*dt,a.d.z*sp*dt);P.rx=.32;P.z=0;P.ry=0;
      if(Math.random()<.6)burst(gY(m.position,.2),0xc8b090,2,.6,.6,.35);
      if(!a.hit&&d2(tg.position,m.position)<1.15*a.sz){a.hit=1;hitTarget(e,tg,M0.dmg)}
      if(Math.hypot(m.position.x-bx,m.position.z-bz)<sp*dt*.3)a.t=0}
    else if(a.n=='spin'){P.ry=-.75+(Math.PI*2+.75)*(1-Math.pow(1-k,2));m.atk=1;if(Math.random()<.5)burst(gY(m.position,.4),0xd8d0b8,2,2,.5,.3);
      if(!a.hit&&k>=.5){a.hit=1;if(d2(tg.position,m.position)<M0.r*a.sz+.3)hitTarget(e,tg,M0.dmg)}}
    else if(a.n=='slam'){P.y=.65*(1-k*k)*ib;P.rx=-.45+.95*k;
      if(a.t<=0&&!a.hit){a.hit=1;ring(m.position,0xffc080,M0.r*a.sz*1.4,380);burst(gY(m.position,.2),0xc8b090,30,3.2,1.6,.6);if(d2(pl.position,m.position)<8)shake(.12);if(d2(tg.position,m.position)<M0.r*a.sz+.3)hitTarget(e,tg,M0.dmg)}}
    else if(a.n=='spit'||a.n=='throw'||a.n=='bolt'){P.rx=-.45+.85*s}
    else if(a.n=='rainfire'){P.rx=-.3+.6*s;if(a.t<=0&&!a.hit){a.hit=1;ring(a.tp,0xff6a2a,M0.r*a.sz*1.6,380);burst(gY(a.tp,.3),0xff6a2a,30,2.4,2.5,.6);if(d2(tg.position,a.tp)<M0.r*a.sz+.3)hitTarget(e,tg,M0.dmg*(e.enr?1.3:1),'m')}}
    if(a.t<=0){a.ph=2;a.t=M0.rec;a.R=M0.rec;m.atk=0;if(a.tel){scene.remove(a.tel);a.tel.traverse(o=>o.geometry&&o.geometry.dispose());a.tel=null}
      if(a.n=='spin')P.ry=0;a.P0=Object.assign({rx:0,ry:0,z:0,y:0},P)}
  }else{
    const r=Math.max(0,a.t/a.R);for(const k in a.P0)P[k]=a.P0[k]*r*r;
    if(a.n=='pounce'||a.n=='charge')P.rx=(P.rx||0)+.12*Math.sin((1-r)*Math.PI);
    if(a.t<=0){e.atk=null;m.pose=null;m.atk=0;m.ak=null;e.cd=M0.cd*(e.c.al?.8:1)*(e.enr?.65:1)*(.75+Math.random()*.5)}
  }
}
// ---- tab targeting ----
let tgt=null;
const tgRing=new THREE.Mesh(new THREE.RingGeometry(.62,.78,40),new THREE.MeshBasicMaterial({color:0xff4a2a,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,fog:false}));tgRing.rotation.x=-Math.PI/2;tgRing.visible=false;tgRing.renderOrder=3;scene.add(tgRing);
const camFwd=()=>V(-Math.sin(camYaw),0,-Math.cos(camYaw));
function selectTarget(){
  const f=camFwd(),p=pl.position;
  const c=enemies.filter(e=>!e.dead&&Math.hypot(e.m.position.x-p.x,e.m.position.z-p.z)<20).map(e=>{const v=V(e.m.position.x-p.x,0,e.m.position.z-p.z),L=v.length()||.01,an=Math.acos(Math.max(-1,Math.min(1,v.dot(f)/L)));return {e,L,an,s:L*(1+an*1.8)}}).filter(o=>o.an<1.3||o.L<3).sort((a,b)=>a.s-b.s);
  if(!c.length){if(tgt)setTarget(null);else say('No enemy in front of you.');return}
  const i=c.findIndex(o=>o.e===tgt);setTarget(c[(i+1)%c.length].e);
}
const TPV={};
function setTarget(e){
  tgt=e;$('tgt').classList.toggle('hide',!e);tgRing.visible=!!e;
  if(!e){if(TPV.m){TPV.sc.remove(TPV.m);TPV.m=null}return}
  $('tgt').classList.toggle('al',!!e.c.al);$('tgt').classList.toggle('bs',!!e.boss);
  try{
    if(!TPV.r){TPV.r=new THREE.WebGLRenderer({canvas:$('tgP'),antialias:true,alpha:true,preserveDrawingBuffer:true});TPV.r.setPixelRatio(1);TPV.r.setSize(112,112,false);TPV.r.setClearColor(0,0);TPV.sc=new THREE.Scene();TPV.cam=new THREE.PerspectiveCamera(28,1,.05,60);
      const hl=new THREE.HemisphereLight(0xfff0dd,0x40352a,1.1),dl=new THREE.DirectionalLight(0xffe8c8,1.1),rl=new THREE.DirectionalLight(0x88aaff,.5);dl.position.set(2,3,4);rl.position.set(-3,1,-2);TPV.sc.add(hl,dl,rl)}
    if(TPV.m)TPV.sc.remove(TPV.m);
    const m=cr(e.c);m.scale.setScalar(1);m.rotation.y=.55;m.updateMatrixWorld(true);TPV.sc.add(m);TPV.m=m;
    const bb=new THREE.Box3().setFromObject(m),c=bb.getCenter(V()),sz=bb.getSize(V()),r=Math.max(sz.x,sz.y,sz.z);
    TPV.cam.position.set(c.x+r*.3,c.y+r*.32,c.z+r*1.45);TPV.cam.lookAt(c.x,c.y+sz.y*.12,c.z);portraitDraw(performance.now());
  }catch(err){console.warn('portrait',err)}
  tgtHud();
}
function portraitDraw(now){if(TPV.m&&TPV.r){animC0(TPV.m,now,false,0);TPV.r.render(TPV.sc,TPV.cam)}}
const MVN={bite:'Bite',pounce:'Pounce',charge:'Charge',spin:'Spin',slam:'Slam',spit:'Spit'};
function tgtTick(now,dt){
  if(!tgt)return;const e=tgt;
  if(e.dead||!enemies.includes(e)||Math.hypot(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z)>32){setTarget(null);return}
  tgRing.position.copy(gY(e.m.position,.1));tgRing.scale.setScalar((e.m.bs||1)*(e.boss?1.6:1)*(1+.06*Math.sin(now/180)));tgRing.rotation.z+=dt*1.5;
}
function drink(){
  if(!pots||(hero.cdP||0)>0||hero.hp>=heroMax())return;
  pots--;hero.cdP=9;const h=Math.round(heroMax()*.4);hero.hp=Math.min(heroMax(),hero.hp+h);dn(pl.position,'+'+h,'#6ee7b7');burst(gY(pl.position,.8),0x6ee7b7,24,2,2.5,.7);hud();
}
