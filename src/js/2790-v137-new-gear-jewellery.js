// ================= v137: the 20 new amulets and rings =================
// Each has a kit of its own (J137). The picture and the drop show the kit; worn, the amulet's pendant is the same kit made
// small and hung on the chain at the breast, and the ring is the same kit fitted round the paw's finger.
// Amulet kits: the bail at the origin, the pendant hanging down to about -.2. Ring kits: the band in x-y round the z axis
// (radius .1), the setting on top (+y).
var J137={};
function j7Bail(k,col){k.p('','ring','m',col,0,.03,0,.03,.2,.03,Math.PI/2)}
function j7Band(k,col,r,th){k.p('','ring','m',col,0,0,0,r||.1,th||.16,r||.1,Math.PI/2)}
// ---- amulets ----
J137.am_knot=(k,c)=>{const R=0xa89a70;j7Bail(k,0x5a4a32);for(let i=0;i<5;i++)k.p('','cyl','c',R,0,-.02-i*.016,0,.022,.012,.022);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2;k.L('','c',R,[Math.sin(a)*.05,-.15+Math.cos(a)*.06,0],[Math.sin(b)*.05,-.15+Math.cos(b)*.06,0],.012,.012,4)}k.p('','oct','g',c.gl||0xc8a060,0,-.16,.01,.01)};
J137.am_crow=(k,c)=>{j7Bail(k,0x3a3a40);k.L('','c',0x3a2618,[0,.0,0],[0,-.04,0],.004,.004,3);k.p('','sph2','c',0xd8ccb0,0,-.07,0,.04,.035,.04);k.L('','c',0xc8bca0,[0,-.08,.03],[0,-.16,.07],.016,.002,4);
  [-1,1].forEach(s=>{k.p('','sph','c',0x0a0a0a,s*.018,-.065,.03,.01);gkFeather(k,'',[s*.03,-.07,-.01],[s*.6,-1,-.3],.1,.014,0x14141a,null)});if(c.gl)k.p('','sph','g',c.gl,.018,-.065,.035,.005)};
J137.am_eye=(k,c)=>{const G=0x9a7838;j7Bail(k,G);k.p('','cyl','m',G,0,-.08,0,.05,.014,.05,Math.PI/2);k.p('','hem','c',0xe8e0d0,0,-.08,.006,.04,.04,.03,Math.PI/2);k.p('','cyl','g',c.gl||0x5ab8ff,0,-.08,.035,.018,.006,.018,Math.PI/2);k.p('','box','c',0x050505,0,-.08,.04,.004,.022,.002);
  for(let i=0;i<3;i++)k.L('','g',c.gl||0x5ab8ff,[(i-1)*.02,-.12,.02],[(i-1)*.022,-.19-i%2*.02,.02],.005,.002,3)};
J137.am_nail=(k,c)=>{j7Bail(k,0x4a3a2a);k.L('','m',0x5a5450,[0,-.01,0],[0,-.2,0],.01,.003,4);k.p('','cyl','m',0x5a5450,0,-.01,0,.022,.01,.022);
  k.L('','m',0x4a4440,[-.03,-.06,0],[.03,-.12,0],.008,.002,4);k.L('','m',0x4a4440,[.03,-.06,0],[-.03,-.12,0],.008,.002,4);k.L('','c',0x6a1a1a,[0,-.04,.012],[0,-.1,.012],.012,.012,4)};
J137.am_phial=(k,c)=>{const G=0xc8a040;j7Bail(k,G);k.p('','cyl','m',G,0,-.02,0,.02,.02,.02);k.p('','cyl','g',c.gl||0xff3a5a,0,-.07,0,.03,.07,.03);k.p('','sph','g',c.gl||0xff3a5a,0,-.12,0,.04);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2;k.L('','m',G,[Math.cos(a)*.032,-.03,Math.sin(a)*.032],[Math.cos(a)*.042,-.13,Math.sin(a)*.042],.004,.004,3)}k.p('','cone4','m',G,0,-.18,0,.016,.03,.016,Math.PI)};
J137.am_heart=(k,c)=>{j7Bail(k,0x3a3a40);k.p('','sph2','c',0x8a1424,-.02,-.08,0,.035,.04,.03);k.p('','sph2','c',0x8a1424,.02,-.08,0,.035,.04,.03);k.p('','cone4','c',0x8a1424,0,-.13,0,.05,.06,.03,Math.PI,Math.PI/4);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.L('','c',0x2a3a1e,[Math.cos(a)*.05,-.09+Math.sin(a)*.05,0],[Math.cos(a+.6)*.05,-.09+Math.sin(a+.6)*.05,i%2?.02:-.02],.006,.006,3);k.p('','cone4','c',0x4a3a24,Math.cos(a)*.058,-.09+Math.sin(a)*.058,0,.004,.02,.004,0,0,a-Math.PI/2)}if(c.gl)k.p('','sph','g',c.gl,0,-.08,.03,.01)};
J137.am_moth=(k,c)=>{const G=0xb8bec8;j7Bail(k,G);k.p('','cyl','c',0x4a3a30,0,-.08,0,.012,.08,.012);[-1,1].forEach(s=>{const W=[[0,0],[.06,.04],[.11,.03],[.12,-.02],[.07,-.03],[.09,-.07],[.05,-.09],[0,-.03]];
  k.p('',lgSlab('j7mw',W,.006),'c',0x8a7a6a,0,-.06,0,s,1,1);k.p('','sph','g',c.gl||0xffd080,s*.07,-.05,.006,.012,.012,.004);k.L('','c',0x3a2a20,[s*.004,-.04,0],[s*.03,.0,0],.002,.001,3)})};
J137.am_lich=(k,c)=>{const G=0x5a5a64;j7Bail(k,G);k.p('','box','m',G,0,-.09,0,.06,.11,.04);k.p('','box','g',c.gl||0x5affd8,0,-.09,0,.046,.09,.044);[-1,1].forEach(s=>[-1,1].forEach(q=>k.p('','box','m',G,s*.03,-.09+q*.055,0,.012,.012,.046)));
  gkSkull(k,'',0,-.02,0,1.1,0xd8ccb0,0,null);for(let i=0;i<3;i++)k.p('','box','c',0x14100c,0,-.06-i*.025,.024,.03,.004,.002)};
J137.am_moon=(k,c)=>{const S=0xc8ccd4;k.p('','ring','m',S,0,-.02,0,.08,.3,.08,0);for(let i=0;i<5;i++){const a=i/5*Math.PI-.0;k.p('','oct','m',S,Math.cos(a+Math.PI)*.08,-.02+Math.sin(a+Math.PI)*.08,0,.01)}
  k.p('','cyl','c',0x14121a,0,-.12,0,.05,.014,.05,Math.PI/2);k.p('','ring','g',c.gl||0xb05aff,0,-.12,0,.052,.08,.052,Math.PI/2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.L('','g',c.gl||0xb05aff,[Math.cos(a)*.055,-.12+Math.sin(a)*.055,0],[Math.cos(a)*.075,-.12+Math.sin(a)*.075,0],.005,.001,3)}};
J137.am_king=(k,c)=>{const G=0xd8b050;j7Bail(k,G);k.p('','sph2','c',0x3a1a24,0,-.1,0,.05,.06,.04);k.p('','sph','g',c.gl||0xff2a3a,0,-.1,.02,.024,.03,.02);
  for(let i=0;i<5;i++){const x=(i-2)*.02;k.p('','cone4','m',G,x,-.03+(i%2?0:.012),0,.008,.03+(i==2?.02:0),.008)}k.p('','box','m',G,0,-.045,0,.1,.016,.03);
  [-1,1].forEach(s=>k.L('','m',G,[s*.045,-.06,0],[s*.03,-.16,0],.006,.002,4));k.p('','cone4','m',G,0,-.17,0,.014,.04,.014,Math.PI)};
// ---- rings ----
J137.rg_coil=(k,c)=>{for(let i=0;i<14;i++){const a=i/14*Math.PI*2;k.p('','sph','m',0x4a4a50,Math.sin(a)*.1,Math.cos(a)*.1,(i%2?.012:-.012),.022)}k.p('','box','m',0x3a3a40,0,.12,0,.08,.03,.05);for(let i=0;i<3;i++)k.p('','cone4','m',0x5a5a60,(i-1)*.03,.14,0,.008,.03,.008)};
J137.rg_dirt=(k,c)=>{j7Band(k,0x5a4a3a,.1,.2);k.p('','dod','c',0x3a2a1a,0,.11,0,.03,.024,.03);k.p('','oct','c',0x6a6a5a,-.012,.13,.01,.008);k.p('','cone4','c',0x3a5a22,.01,.14,0,.004,.02,.004)};
J137.rg_snake=(k,c)=>{for(let i=0;i<16;i++){const a=i/16*Math.PI*2-.3;k.p('','sph','c',i%2?0x3a6a2a:0x2a5a1e,Math.sin(a)*.1,Math.cos(a)*.1,0,.022-i*.0006)}k.p('','sph2','c',0x3a6a2a,-.03,.105,0,.03,.022,.026);
  k.p('','sph','g',c.gl||0xffd040,-.045,.115,.02,.007);k.p('','sph','g',c.gl||0xffd040,-.045,.115,-.02,.007)};
J137.rg_fang=(k,c)=>{j7Band(k,0x8a8a92);[-1,1].forEach(s=>k.p('','cone4','c',0xe8e0c8,s*.025,.13,0,.012,.06,.01,0,0,s*.3));k.p('','box','m',0x5a5a60,0,.1,0,.07,.02,.03)};
J137.rg_web=(k,c)=>{j7Band(k,0x2a2a30);const n0=k.P.length;l7Web(k,.9,0xc8c8d0,6);l7Spider(k,1.2,0x14141a,c.gl||0xff2a3a);k7Shift(k,n0,0,.11,0)};
J137.rg_ash=(k,c)=>{j7Band(k,0x6a6a70);k.p('','cyl','m',0x3a3a40,0,.115,0,.035,.02,.035);k.p('','cone4','g',c.gl||0xff8a30,0,.14,0,.012,.04,.012);k.p('','cone4','g',0xffd080,0,.135,0,.006,.025,.006)};
J137.rg_skull=(k,c)=>{j7Band(k,0xc8a040);gkSkull(k,'',0,.13,0,1.4,0xd8ccb0,0,null)};
J137.rg_thorn=(k,c)=>{j7Band(k,0x2a3a1e,.1,.14);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.p('','cone4','c',0x4a3a24,Math.sin(a)*.115,Math.cos(a)*.115,0,.006,.03,.006,0,0,-a)}k.p('','sph','c',0x8a1424,0,.12,0,.022);if(c.gl)k.p('','sph','g',c.gl,0,.12,.016,.008)};
J137.rg_eclipse=(k,c)=>{j7Band(k,0x1a1820);k.p('','cyl','g',c.gl||0xffc060,0,.13,0,.04,.01,.04,Math.PI/2);k.p('','cyl','c',0x0a0a0e,0,.13,.008,.034,.008,.034,Math.PI/2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.L('','g',c.gl||0xffc060,[Math.cos(a)*.042,.13+Math.sin(a)*.042,0],[Math.cos(a)*.06,.13+Math.sin(a)*.06,0],.004,.001,3)}};
J137.rg_drown=(k,c)=>{const B=0x5a7a6a;j7Band(k,B);k.p('','box','m',B,0,.115,0,.07,.024,.06);for(let i=0;i<5;i++)k.p('','cone4','m',B,(i-2)*.016,.14,0,.007,.03,.007);k.p('','oct','g',c.gl||0x5ac8b0,0,.14,.03,.014);
  [[.03,.09,.04],[-.04,.08,.03]].forEach(([x,y,z])=>k.p('','sph','c',0xc8c0a8,x,y,z,.008))};
// ---------------- hooking in ----------------
function j7C(it){return {gl:(it.r|0)>=3?v89Rc(it.r):null,r:it.r|0}}
{const f=v89Kit;v89Kit=function(k,it){const t=v137T(it),J=t&&J137[t.v7];if(!J||it.u)return f.apply(this,arguments);try{J(k,j7C(it))}catch(e){console.warn('v137 jewel',e);k.P.length=0;return f.apply(this,arguments)}}}
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);try{const t=d&&v137T(it);if(t&&J137[t.v7]&&!it.u){d.j7=t.v7;d.j7c=j7C(it)}}catch(_){}return d}}
// transplant a kit onto a bone: kit (x, y, z) → p + X·x + Y·y + Z·z
function j7Put(k,bn,J,c,p,X,Y,Z,s){const t=dkKit();J(t,c);const M=new THREE.Matrix4().makeBasis(new THREE.Vector3(...X).multiplyScalar(s),new THREE.Vector3(...Y).multiplyScalar(s),new THREE.Vector3(...Z).multiplyScalar(s)).setPosition(p[0],p[1],p[2]);
  t.P.forEach(q=>k.P.push({bn,geo:q.geo,t:q.t,col:q.col,m:M.clone().multiply(q.m)}))}
// the worn amulet: the beast chain (as v114), the item's own pendant at the breast
{const f=mdAmulet;mdAmulet=function(B,P,d){if(!BR.on||!d||!d.j7)return f.apply(this,arguments);
  const k=mdKP(),ti=d.ti,gold=ti==0?0x7a6a4a:ti>=3?0xd8b050:0xa88848,off=(P.tOff||0)+.008,y=.87,top=mdTorsoAt(P,.975),rc=top.rx*.62+off;let yc=.965;for(let yy=.9;yy<=1.03;yy+=.004){if(mdTorsoAt(P,yy).rx<=rc){yc=yy;break}}
  const q=mdTorsoAt(P,yc);k.p('chest','ring','m',gold,0,yc+.004,(q.z||0)+.004,q.rx+off,.22,(q.f+q.b)/2+off,-.12);
  [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=4;i++){const t=i/4,yy=yc-(yc-y-.02)*t,qq=mdTorsoAt(P,yy),x=s*(q.rx*.55)*(1-t),zz=(qq.z||0)+qq.f*Math.sqrt(Math.max(0,1-(x/qq.rx)**2))+off+.004;pts.push([x,yy,zz])}
    for(let i=0;i<4;i++)k.L('chest','m',gold,pts[i],pts[i+1],.005,.005,3)});
  // the pendant: hung from the strands' meeting point, lying on the chest (pushed out by its own depth), as tall as about 7 cm
  const f0=mdTorsoAt(P,y-.03),fz=(f0.z||0)+f0.f+off+.016;j7Put(k,'chest',J137[d.j7],d.j7c||{},[0,y+.02,fz],[1,0,0],[0,1,0],[0,0,1],.36);mdKit(B,k)}}
// the worn ring: the item's ring round the first joint of the paw's last finger (as v114)
{const f=mdRingW;mdRingW=function(B,P,d){if(!BR.on||!d||!d.j7||!BR.R||!BR.R.paw)return f.apply(this,arguments);
  const k=mdKP(),n=BR.R.paw.n,F=brFinger(P,1,n-1),V=THREE.Vector3,c0=F.pts[2].clone().lerp(F.pts[3],.5),dir=F.dirs[2].clone().normalize(),r=(F.rad[2]+F.rad[3])/2*1.3;
  const up=new V(0,0,1).sub(dir.clone().multiplyScalar(dir.z)).normalize(),X=new V().crossVectors(up,dir).normalize();
  j7Put(k,F.bone,J137[d.j7],d.j7c||{},c0.toArray(),X.toArray(),up.toArray(),dir.toArray(),r*1.12/.1);mdKit(B,k)}}
