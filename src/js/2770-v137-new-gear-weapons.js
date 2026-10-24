// ================= v137: the 50 new weapons — a recipe each =================
// v141: the four greatsword grips reach down to the guard (they ended 0.04–0.08 above the hand, which closed on empty air).
// Same frame as every weapon (lgWpnKit): the grip at the origin, the head / blade pointing down -y, the flat of a blade in
// x-y, and the same footprint per type (a greatsword ~1.3 long, a dagger ~.5, a staff 1.7…), so hands, poses, attack
// animations, the bow's drawn string and the clip tests work unchanged. Bows, crossbows and slings keep the v83/v135 frame
// (string, riser, prod, pouch) and are dressed up around it. Rarity: brass fittings from Rare, glowing inlays from Epic.
var W137={};
// move the parts added since n0
function k7Shift(k,n0,dx,dy,dz){const T=new THREE.Matrix4().makeTranslation(dx,dy,dz);for(let i=n0;i<k.P.length;i++)k.P[i].m.premultiply(T)}
function w7N(v){const L=Math.hypot(v[0],v[1])||1;return [v[0]/L,v[1]/L]}
// polygon (x, y) moved inward by d along the corner bisectors (CCW or CW)
function w7Inset(P,d){const n=P.length;let A=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1]}const g=A>0?1:-1;
  return P.map((p,i)=>{const a=P[(i-1+n)%n],b=P[(i+1)%n],e1=w7N([p[0]-a[0],p[1]-a[1]]),e2=w7N([b[0]-p[0],b[1]-p[1]]),n1=[-e1[1]*g,e1[0]*g],n2=[-e2[1]*g,e2[0]*g];
    let m=w7N([n1[0]+n2[0],n1[1]+n2[1]]);const c=Math.max(.4,m[0]*n1[0]+m[1]*n1[1]);return [p[0]+m[0]*d/c,p[1]+m[1]*d/c]})}
// a bevelled flat blade: a thin edge slab (the outline) round a thicker core (inset), at (x,y,z) turned rz
function w7Blade(k,key,P,th,core,edge,x,y,z,rz,ins){k.p('',lgSlab('w7'+key,P,th*.5),'m',edge,x||0,y||0,z||0,1,1,1,0,0,rz||0);k.p('',lgSlab('w7'+key+'i',w7Inset(P,ins||.014),th),'m',core,x||0,y||0,z||0,1,1,1,0,0,rz||0)}
function w7Grip(k,y0,len,r,a,b){k.p('','cyl','c',LGW.woodD,0,y0-len/2,0,r,len,r);const n=Math.max(3,Math.round(len/.032));for(let i=0;i<n;i++)k.p('','cyl','c',i%2?(b||LGW.wrap):(a||LGW.leather),0,y0-.012-i*len/n,0,r+.006,len/n*.62,r+.006,0,i*.3)}
function w7Haft(k,y0,y1,r,col,seed){const R=dkRng(seed||9);let p=[0,y0,0];const n=Math.max(2,Math.round((y0-y1)/.25));for(let i=1;i<=n;i++){const q=[(R()-.5)*.01,y0+(y1-y0)*i/n,(R()-.5)*.01];k.L('','c',col||LGW.wood,p,q,r*(1+(R()-.5)*.12),r*(1+(R()-.5)*.12),6);p=q}}
function w7Bands(k,ys,r,col){ys.forEach(y=>k.p('','cyl','m',col,0,y,0,r,.022,r))}
function w7Wavy(len,w0,w1,amp,waves,tip,y0){const L=[],R=[],n=waves*4;for(let i=0;i<=n;i++){const t=i/n,y=y0-len*t,w=w0+(w1-w0)*t,o=Math.sin(t*waves*Math.PI*2)*amp;R.push([w+o,y]);L.push([-w+o,y])}
  return R.concat([[(R[n][0]+L[n][0])/2,y0-len-tip]]).concat(L.reverse())}
// colours of an item: rarity picks fittings and glow
function w7C(it,o){const r=it.r|0,t=itT(it);return Object.assign({r,ti:t.t|0,fit:r>=2?LGW.brass:LGW.iron,gl:r>=3?v89Rc(r):null,steel:LGW.steel,dark:0x2a2a30,bone:0xd8ccb0,wood:LGW.wood,woodD:LGW.woodD,leather:LGW.leather,wrap:LGW.wrap},o||{})}
// ---------------- greatswords (grip .37….05, guard ≈ -.14, blade to ≈ -1.3) ----------------
W137.gs_grave=(k,c)=>{w7Grip(k,.34,.45,.034,0x8a7a5a,0x6a5a40);k.p('','ring','m',c.dark,0,.37,0,.04,.25,.04,Math.PI/2);
  k.L('','m',0x4a4440,[-.2,-.13,0],[.2,-.13,0],.022,.022,5);[-1,1].forEach(s=>k.L('','m',0x4a4440,[s*.2,-.13,0],[s*.23,-.09,0],.022,.012,5));
  const P=[[-.06,-.15],[.06,-.15],[.075,-.6],[.1,-1.0],[.11,-1.12],[.09,-1.22],[.04,-1.28],[0,-1.3],[-.04,-1.28],[-.09,-1.22],[-.11,-1.12],[-.1,-1.0],[-.075,-.6]];
  w7Blade(k,'gsg',P,.024,0x6a5a4c,0x8a7a6a);for(let i=0;i<6;i++){const y=-.35-i*.14,s=i%2?1:-1;k.p('','cone4','m',0x1a1410,s*(.078+i*.004),y,0,.012,.03,.016,0,0,s*Math.PI/2)}
  k.p('','box','c',0x3a2a1a,0,-.55,0,.03,.6,.026);if(c.gl)k.p('','box','g',c.gl,0,-.9,0,.012,.2,.028)};
W137.gs_flame=(k,c)=>{w7Grip(k,.34,.45,.033,0x6a1a1a,0x2a1010);k.p('','oct','m',c.fit,0,.39,0,.045,.055,.045);k.p('','oct','g',c.gl||0xff6a20,0,.39,.03,.018);
  k.p('','box','m',c.fit,0,-.13,0,.32,.04,.06);[-1,1].forEach(s=>{k.L('','m',c.fit,[s*.16,-.13,0],[s*.2,-.2,0],.018,.012,5);k.L('','m',c.fit,[s*.2,-.2,0],[s*.17,-.26,0],.012,.004,5);k.L('','m',c.dark,[s*.05,-.22,0],[s*.1,-.26,0],.01,.003,4)});
  k.p('','box','c',0x4a1a14,0,-.22,0,.08,.12,.034);w7Blade(k,'gsf',w7Wavy(1.0,.05,.035,.022,4,.12,-.28),.022,0x3a3438,0x8a8a92);
  k.p('','box','g',c.gl||0xff7a2a,0,-.75,0,.008,.85,.026);for(let i=0;i<4;i++)k.p('','oct','g',0xffb060,(i%2?.01:-.01),-.4-i*.2,.014,.006,.012,.004)};
W137.gs_exec=(k,c)=>{w7Grip(k,.35,.46,.036,0x2a2a2a,0x1a1a1a);gkSkull(k,'',0,.4,0,1.1,c.bone,0,null);
  k.p('','box','m',c.dark,0,-.13,0,.4,.06,.08);k.p('','box','m',c.fit,0,-.13,0,.42,.025,.085);
  const P=[[-.1,-.16],[.1,-.16],[.12,-1.24],[-.12,-1.24]];w7Blade(k,'gse',P,.026,0x5a5e66,0x9aa0aa,0,0,0,0,.016);
  k.p('','cyl','c',0x14100c,0,-1.08,0,.035,.03,.035,Math.PI/2);k.p('','ring','m',c.steel,0,-1.08,0,.04,.2,.04,Math.PI/2);
  for(let i=0;i<3;i++)gkRunes(k,'',[[-.05,-.4-i*.18,.015,0],[.05,-.45-i*.18,.015,0]],c.gl||0x5a5e66,null,1.4);
  gkChain(k,'',[[-.11,-.2,.02],[0,-.25,.03],[.11,-.2,.02],[.1,-.32,.02],[0,-.36,.03],[-.1,-.32,.02]],.009,0x4a4a50,null)};
W137.gs_ruin=(k,c)=>{w7Grip(k,.36,.39,.036,0x1a1418,0x3a1018);[-1,1].forEach(s=>k.L('','m',c.dark,[0,.39,0],[s*.04,.47,0],.02,.002,4));k.p('','oct','m',c.dark,0,.4,0,.045);
  // bat-wing guard with an eye
  [-1,1].forEach(s=>{const P=[[0,.02],[.1,.04],[.2,.1],[.26,.02],[.22,-.02],[.18,.0],[.14,-.04],[.1,-.01],[.06,-.05],[0,-.04]];k.p('',lgSlab('w7rw',P,.02),'m',0x1e1a20,0,-.14,0,s,1,1)});
  k.p('','sph','m',0x2a1a20,0,-.14,0,.05,.05,.04);k.p('','sph','g',c.gl||0xff2a2a,0,-.14,.03,.026,.026,.016);k.p('','box','c',0x050505,0,-.14,.045,.006,.03,.004);
  const P=[[-.07,-.18],[.08,-.18],[.09,-.4],[.13,-.45],[.1,-.55],[.14,-.62],[.11,-.72],[.15,-.8],[.11,-.9],[.14,-.98],[.09,-1.1],[.1,-1.2],[.02,-1.38],[-.06,-1.22],[-.09,-1.0],[-.085,-.6]];
  w7Blade(k,'gsr',P,.03,0x18161c,0x4a4650,0,0,0,0,.018);[[.0,-.5],[.02,-.75],[-.01,-1.0]].forEach(([x,y],i)=>k.L('','g',c.gl||0xff3a2a,[x-.02,y,.016],[x+.03,y-.12,.016],.004,.002,3));
  for(let i=0;i<3;i++)k.L('','g',c.gl||0xff3a2a,[.0,-.3-i*.3,-.016],[.02,-.42-i*.3,-.016],.004,.002,3)};
// ---------------- greataxes (haft .15…-.88, head ≈ -.78) ----------------
W137.ga_wood=(k,c)=>{w7Haft(k,.15,-.9,.032,c.wood,21);w7Bands(k,[.1,-.62,-.86],.038,c.dark);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?c.wrap:c.leather,0,.04-i*.04,0,.037,.03,.037);
  const P=[[0,.08],[.08,.08],[.16,.12],[.3,.16],[.33,.0],[.3,-.18],[.25,-.32],[.17,-.3],[.12,-.15],[.06,-.08],[0,-.08]];// the bit faces forward (the -x side in the kit, as the other single-bladed axes): the profile turned half round
  k.p('',lgSlab('w7gaw',P,.017),'m',0x9a9aa0,-.03,-.76,0,1,1,1,0,Math.PI,0);k.p('',lgSlab('w7gawi',w7Inset(P,.014),.034),'m',0x5a5a5e,-.03,-.76,0,1,1,1,0,Math.PI,0);
  for(let i=0;i<4;i++)k.p('','cone4','m',0x1a1410,-(.33-i*.01),-.66-i*.08,0,.012,.03,.02,0,0,-Math.PI/2);k.p('','box','m',c.dark,0,-.76,0,.075,.2,.06);k.L('','m',c.dark,[.03,-.76,0],[.14,-.78,0],.03,.008,5)};
W137.ga_moon=(k,c)=>{w7Haft(k,.15,-.9,.03,c.woodD,22);w7Bands(k,[.12,-.55,-.86],.037,0xb8bec8);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?0x2a2a3a:0x4a4a6a,0,.04-i*.04,0,.036,.03,.036);
  [-1,1].forEach(s=>{const P=[];for(let i=0;i<=12;i++){const a=-1.25+i/12*2.5;P.push([Math.cos(a)*.3,Math.sin(a)*.3])}for(let i=12;i>=0;i--){const a=-1.05+i/12*2.1;P.push([Math.cos(a)*.24+.03,Math.sin(a)*.22])}
    k.p('',lgSlab('w7gam',P,.02),'m',0xc8ccd4,s*.0,-.76,0,s,1,1);k.L('','m',0xb8bec8,[0,-.76,0],[s*.26,-.76,0],.024,.02,6);k.L('','m',0xb8bec8,[0,-.7,0],[s*.25,-.68,0],.012,.01,5);k.L('','m',0xb8bec8,[0,-.82,0],[s*.25,-.84,0],.012,.01,5);k.p('',lgSlab('w7gami',w7Inset(P,.012),.03),'m',0x8a92a0,0,-.76,0,s,1,1);
    if(c.gl)for(let i=0;i<3;i++){const a=-.6+i*.6;k.p('','oct','g',c.gl,s*Math.cos(a)*.27,-.76+Math.sin(a)*.27,0,.008,.012,.02)}});
  k.p('','cyl','m',0xb8bec8,0,-.76,0,.05,.18,.05);k.p('','oct','g',c.gl||0x9ad8ff,0,-.62,0,.02,.03,.02);k.p('','cone4','m',0xb8bec8,0,-.9,0,.03,.08,.03,Math.PI)};
W137.ga_maw=(k,c)=>{w7Haft(k,.15,-.9,.034,0x2a1a14,23);w7Bands(k,[.12,-.5],.04,c.dark);for(let i=0;i<5;i++)k.p('','cyl','c',i%2?0x3a1010:0x1a1010,0,.04-i*.035,0,.038,.026,.038);
  // the head is a beast's skull with open jaws: the upper jaw the top blade, the lower jaw the bottom one, teeth on both
  k.p('','sph2','c',0xc8bca0,0,-.76,0,.08,.09,.07);[-1,1].forEach(s=>{k.p('','sph','g',c.gl||0xff3a1a,s*.032,-.73,.05,.016,.012,.01);k.L('','c',0xb8ac90,[s*.05,-.7,-.02],[s*.12,-.6,-.06],.03,.012,5);k.L('','c',0xb8ac90,[s*.12,-.6,-.06],[s*.1,-.5,-.1],.012,.002,5)});
  [-1,1].forEach(s=>{const Pu=[[0,.04],[.14,.08],[.28,.06],[.36,-.0],[.3,-.02],[.14,0],[0,-.03]];k.p('',lgSlab('w7gmu',Pu,.03),'m',0x3a3438,s*.04,-.72,0,s,1,1);
    const Pl=[[0,.02],[.14,-.02],[.3,-.06],[.34,-.12],[.26,-.12],[.12,-.08],[0,-.06]];k.p('',lgSlab('w7gml',Pl,.03),'m',0x3a3438,s*.04,-.82,0,s,1,1);
    for(let i=0;i<5;i++){const x=.08+i*.05,yu=-.72+(x<.14?-.03+x/.14*.03:-(x-.14)/.16*.02),yl=-.82+.02-(x/.3)*.08;k.p('','cone4','c',0xe8e0c8,s*(x+.04),yu-.014,0,.01,.035,.01,Math.PI);k.p('','cone4','c',0xe8e0c8,s*(x+.04),yl+.013,0,.01,.03,.01)}});
  k.p('','cone4','m',c.dark,0,-.92,0,.03,.1,.03,Math.PI)};
// ---------------- twin axes (haft .05…-.74, head ≈ -.62; one in each hand) ----------------
W137.ax_tomb=(k,c)=>{w7Haft(k,.05,-.74,.026,c.wood,24);for(let i=0;i<3;i++)k.p('','cyl','c',i%2?c.wrap:0x6a5a40,0,.0-i*.035,0,.031,.026,.031);
  const P=[[0,.05],[.1,.06],[.2,.11],[.22,-.02],[.2,-.14],[.1,-.08],[0,-.05]];w7Blade(k,'axt',P,.028,0x5a5450,0x8a847c,.02,-.6,0);
  k.L('','m',c.dark,[-.02,-.6,0],[-.15,-.64,0],.022,.008,5);k.L('','m',c.dark,[-.15,-.64,0],[-.17,-.7,0],.008,.002,4);k.p('','box','m',c.dark,0,-.6,0,.06,.13,.05);
  k.S('',0x6a5a40,0,-.52,.03,.025,.12,.3,.2,1);k.p('','ring','m',0xc8a040,0,-.54,.03,.014,.2,.014,Math.PI/2)};
W137.ax_raven=(k,c)=>{w7Haft(k,.05,-.74,.026,c.woodD,25);for(let i=0;i<3;i++)k.p('','cyl','c',i%2?0x1a1a22:0x2a2a36,0,.0-i*.035,0,.03,.026,.03);
  const P=[[0,.04],[.08,.06],[.16,.04],[.24,-.02],[.26,-.1],[.2,-.06],[.12,-.07],[.06,-.1],[0,-.06]];w7Blade(k,'axr',P,.03,0x2a2a32,0x6a6a78,.02,-.6,0);
  // the back is a raven's head: skull, beak spike, a glinting eye
  k.p('','sph2','c',0x14141a,-.04,-.6,0,.04,.04,.035);k.L('','m',0x3a3a40,[-.07,-.6,0],[-.2,-.63,0],.022,.002,5);k.p('','sph','g',c.gl||0xffd040,-.05,-.585,.03,.008);
  for(let i=0;i<3;i++)gkFeather(k,'',[-.01,-.52-i*.02,0],[-.4,1,(i-1)*.4],.1,.012,i%2?0x14141a:0x2a2a36,null)};
W137.ax_widow=(k,c)=>{w7Haft(k,.05,-.74,.026,0x1a1418,26);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?0x3a0a10:0x14100c,0,.0-i*.03,0,.03,.022,.03);
  const P=[];for(let i=0;i<=10;i++){const a=-1.1+i*.22;P.push([.04+Math.cos(a)*.2,Math.sin(a)*.2])}P.push([.06,-.08],[.0,-.04],[0,.04],[.06,.08]);w7Blade(k,'axw',P,.026,0x1e1c22,0x5a5660,.0,-.6,0);
  [-1,1].forEach(s=>{for(let i=0;i<2;i++){const y=-.6+s*(.03+i*.04);k.L('','m',0x1e1c22,[-.03,y,0],[-.12,y+s*.06,0],.008,.006,4);k.L('','m',0x1e1c22,[-.12,y+s*.06,0],[-.14,y-s*.02,0],.006,.001,4)}});
  k.p('','oct','g',c.gl||0xd01030,.05,-.6,.016,.016,.024,.006);k.p('','oct','g',c.gl||0xd01030,.05,-.6,-.016,.016,.024,.006)};
// ---------------- halberds (haft .3…-1.4, head ≈ -1.28) ----------------
W137.hb_watch=(k,c)=>{w7Haft(k,.3,-1.42,.03,c.wood,27);w7Bands(k,[.25,-.9,-1.38],.036,c.dark);for(let i=0;i<4;i++)k.p('','cyl','c',c.leather,0,.04-i*.035,0,.036,.025,.036);
  const P=[[0,-.0],[.06,.02],[.14,-.02],[.2,-.14],[.22,-.32],[.2,-.5],[.12,-.6],[.05,-.56],[.04,-.46],[0,-.42]];w7Blade(k,'hbw',P,.026,0x5a5a60,0x9aa0a8,.03,-.98,0);
  k.p('','box','m',c.dark,0,-1.0,0,.06,.06,.05);k.p('','box','m',c.dark,0,-1.38,0,.06,.06,.05);k.L('','m',c.dark,[-.02,-1.2,0],[-.1,-1.18,0],.01,.01,4);k.p('','ring','m',c.dark,-.11,-1.2,0,.02,.2,.02);
  k.p('','cone4','m',c.steel,0,-1.5,0,.025,.16,.02,Math.PI)};
W137.hb_reaper=(k,c)=>{// a vertebra haft and a scythe blade
  k.p('','cyl','c',0xa89c80,0,-.48,0,.024,1.56,.024); // v141: a solid core through the vertebrae, so the hand always closes on the haft
  for(let i=0;i<14;i++){const y=.28-i*.11;k.p('','cyl','c',i%2?0xd0c4a8:0xb8ac90,0,y,0,.032,.08,.032);k.p('','cone4','c',0xc8bca0,0,y,-.03,.012,.03,.02,Math.PI/2+.4)}
  k.p('','sph2','c',c.bone,0,-1.3,0,.05,.05,.045);[-1,1].forEach(s=>k.p('','sph','g',c.gl||0x7affc8,s*.018,-1.3,.04,.009));
  const P=[[0,.03],[.1,.06],[.22,.04],[.34,-.02],[.44,-.1],[.5,-.22],[.42,-.14],[.32,-.08],[.2,-.04],[.08,-.03],[0,-.03]];w7Blade(k,'hbr',P,.024,0x4a4a54,0xb0b4bc,.03,-1.26,0,0,.01);
  k.p('','cone4','c',c.bone,0,-1.42,0,.02,.12,.02,Math.PI)};
W137.hb_pale=(k,c)=>{w7Haft(k,.3,-1.3,.03,0xb8b0a0,28);w7Bands(k,[.2,-.6,-1.25],.036,0xb8bec8);for(let i=0;i<4;i++)k.p('','cyl','c',0x8a8a90,0,.04-i*.035,0,.036,.025,.036);
  const P=[[-.03,-1.28],[.03,-1.28],[.06,-1.36],[.14,-1.33],[.11,-1.42],[.06,-1.46],[.05,-1.6],[0,-1.74],[-.05,-1.6],[-.06,-1.46],[-.11,-1.42],[-.14,-1.33],[-.06,-1.36]];
  w7Blade(k,'hbp',P,.026,0xa8aeb8,0xe0e4ea,0,0,0,0,.012);k.p('','cyl','m',0xb8bec8,0,-1.29,0,.04,.05,.04);
  // a tattered pale banner below the head
  for(let i=0;i<4;i++)k.S('',i%2?0xd8d4c8:0xc8c4b8,.03,-1.15,0,.06,.32-i*.03,Math.PI/2,0,i+1);k.L('','m',0xb8bec8,[0,-1.15,0],[.22,-1.15,0],.006,.006,4);if(c.gl)k.p('','oct','g',c.gl,0,-1.42,.016,.012,.02,.006)};
// ---------------- maces (haft .05…-.62, head -.6…-.88) ----------------
W137.mc_pilgrim=(k,c)=>{const R=dkRng(31);let p=[0,.06,0];for(let i=0;i<4;i++){const q=[(R()-.5)*.02,-.12-i*.17,(R()-.5)*.02];k.L('','c',i<1?c.woodD:0x5a4028,p,q,.03+i*.008,.034+i*.01,7);p=q}
  k.p('','dod','c',0x5a4028,0,-.74,0,.075,.09,.075);w7Bands(k,[-.66,-.8],.07,c.dark);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','oct','m',c.dark,Math.cos(a)*.07,-.73+(i%2)*.03,Math.sin(a)*.07,.014)}
  k.p('','cyl','c',c.wrap,0,0,0,.036,.12,.036);k.L('','c',0x8a7a5a,[0,-.05,.036],[.04,-.15,.05],.003,.003,3);k.p('','cone','c',0xe8d8b0,.045,-.17,.05,.03,.012,.03,Math.PI/2)};
W137.mc_censer=(k,c)=>{w7Haft(k,.05,-.55,.028,c.woodD,32);w7Bands(k,[.03,-.5],.034,c.fit);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?c.wrap:0x6a1a1a,0,.0-i*.035,0,.034,.028,.034);
  // a censer cage on the head: ribs round a glowing coal, a cap, smoke vents
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,pts=[];for(let j=0;j<=6;j++){const t=j/6*Math.PI;pts.push([Math.cos(a)*Math.sin(t)*.09,-.62-.09-Math.cos(t)*.09,Math.sin(a)*Math.sin(t)*.09])}
    for(let j=0;j<6;j++)k.L('','m',c.fit,pts[j],pts[j+1],.008,.008,4)}
  k.p('','ring','m',c.fit,0,-.71,0,.092,.25,.092);k.p('','ico','g',c.gl||0xff8a30,0,-.71,0,.05);k.p('','cone','m',c.fit,0,-.6,0,.05,.04,.05);k.p('','cone4','m',c.fit,0,-.82,0,.03,.06,.03,Math.PI);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','box','c',0x14100c,Math.cos(a)*.05,-.645,Math.sin(a)*.05,.012,.006,.012)}};
W137.mc_relic=(k,c)=>{const G=0xc8a040;w7Haft(k,.05,-.6,.03,0xe8e0d0,33);w7Bands(k,[.04,-.2,-.4,-.58],.036,G);for(let i=0;i<3;i++)k.p('','cyl','c',0xd8d4c8,0,-.04-i*.035,0,.035,.025,.035);
  // a gilded reliquary: a glass case with a relic bone, wing flanges, a halo
  k.p('','box','m',G,0,-.74,0,.09,.16,.09);k.p('','box','g',c.gl||0xfff0b0,0,-.74,0,.07,.12,.095);gkBone(k,'',[0,-.69,.05],[0,-.79,.05],.008,0xe8e0c8,null);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const P=[[0,.08],[.06,.06],[.12,.02],[.14,-.06],[.08,-.04],[.04,-.08],[0,-.08]];k.p('',lgSlab('w7mrw',P,.014),'m',G,Math.cos(a)*.06,-.74,Math.sin(a)*.06,1,1,1,0,-a,0)}
  k.p('','ring','m',0xffe8a0,0,-.6,0,.08,.15,.08);for(let i=0;i<4;i++){const a=i/4*Math.PI*2;k.L('','m',G,[Math.cos(a)*.03,-.6,Math.sin(a)*.03],[Math.cos(a)*.075,-.6,Math.sin(a)*.075],.006,.006,4)}k.p('','cone4','m',G,0,-.86,0,.03,.08,.03,Math.PI);k.p('','oct','m',G,0,.07,0,.03)};
// ---------------- warhammers (haft .08…-.6, head ≈ -.74) ----------------
W137.hm_grave=(k,c)=>{w7Haft(k,.08,-.62,.034,c.woodD,34);w7Bands(k,[.04,-.2],.04,c.dark);for(let i=0;i<3;i++)k.p('','cyl','c',c.leather,0,.06-i*.03,0,.04,.02,.04);
  // a gravestone for a head: a slab with a rounded top lying across, a carved cross, moss
  const P=[[-.18,-.1],[.18,-.1],[.18,.06],[.14,.1],[.08,.12],[0,.125],[-.08,.12],[-.14,.1],[-.18,.06]];k.p('',lgSlab('w7hgs',P,.13),'c',0x7a7a74,0,-.74,0,1,1,1,0,0,-Math.PI/2);
  [-1,1].forEach(s=>{k.p('','box','c',0x4a4a46,.0,-.74,s*.066,.05,.012,.004);k.p('','box','c',0x4a4a46,-.02,-.74,s*.066,.012,.012,.004);k.p('','box','c',0x4a4a46,0,-.74,s*.066,.012,.08,.004,0,0,Math.PI/2)});
  k.p('','dod','c',0x4a6a2a,-.08,-.66,.04,.03,.02,.02);k.p('','box','m',c.dark,0,-.6,0,.06,.04,.06)};
W137.hm_anvil=(k,c)=>{w7Haft(k,.08,-.62,.034,0x2a2420,35);w7Bands(k,[.04,-.15,-.35],.04,c.fit);
  k.p('','box','m',0x34343a,0,-.76,0,.24,.12,.16);k.p('','box','m',0x2a2a30,0,-.68,0,.3,.05,.16);k.p('','box','m',0x2a2a30,0,-.84,0,.18,.06,.14);
  k.L('','m',0x34343a,[.15,-.68,0],[.3,-.7,0],.06,.01,6);k.p('','box','m',0x2a2a30,-.17,-.7,0,.05,.06,.14);
  for(let i=0;i<4;i++)k.p('','box','g',c.gl||0xff8a3a,-.09+i*.06,-.66,.0,.014,.006,.12);gkChain(k,'',[[-.15,-.82,.08],[-.1,-.9,.09],[0,-.92,.09],[.08,-.86,.08]],.008,0x4a4a50,null)};
W137.hm_bell=(k,c)=>{const BZ=0xa8783a;w7Haft(k,.08,-.62,.034,0x3a2618,36);w7Bands(k,[.04,-.2,-.4],.04,BZ);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?0x6a1a1a:0x3a1010,0,.06-i*.03,0,.04,.02,.04);
  // a bronze bell on its side: crown toward -x, mouth toward +x, a clapper inside, a holy inscription band
  k.p('','skirt','m',BZ,.02,-.74,0,.16,.26,.16,0,0,-Math.PI/2);k.p('','hem','m',BZ,-.11,-.74,0,.09,.06,.09,0,0,Math.PI/2);k.p('','ring','m',mdSh(BZ,1.2),.15,-.74,0,.16,.2,.16,0,0,Math.PI/2);
  k.p('','sph','m',0x4a3a2a,.12,-.74,0,.035);k.p('','ring','g',c.gl||0xffe08a,-.02,-.74,0,.115,.15,.115,0,0,Math.PI/2);k.p('','box','m',BZ,0,-.62,0,.05,.06,.05)};
// ---------------- flails (haft .08…-.28, chain to ≈ -.62, head ≈ -.76) ----------------
W137.fl_thresh=(k,c)=>{w7Haft(k,.08,-.28,.032,c.wood,37);for(let i=0;i<3;i++)k.p('','cyl','c',c.leather,0,.04-i*.04,0,.037,.03,.037);k.p('','oct','m',c.dark,0,-.29,0,.04);
  gkChain(k,'',[[0,-.31,0],[0,-.62,0]],.012,c.dark,null);
  k.p('','cyl','c',0x6a4a2c,0,-.78,0,.045,.32,.045);w7Bands(k,[-.66,-.78,-.9],.05,c.dark);for(let i=0;i<9;i++){const a=i*2.4,y=-.68-i*.025;k.p('','cone4','m',c.steel,Math.cos(a)*.048,y,Math.sin(a)*.048,.008,.03,.008,Math.sin(a)*1.57,0,-Math.cos(a)*1.57)}};
W137.fl_skulls=(k,c)=>{w7Haft(k,.08,-.28,.032,c.woodD,38);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?c.wrap:0x3a2a20,0,.04-i*.04,0,.037,.03,.037);k.p('','oct','m',c.dark,0,-.29,0,.045);
  [[-1,-.68],[0,-.78],[1,-.7]].forEach(([s,y],i)=>{const pts=[[0,-.31,0],[s*.04,(y-.31)/2-.15,0],[s*.07,y+.05,0]];gkChain(k,'',pts,.01,0x3a3a40,null);gkSkull(k,'',s*.075,y,0,2.2,i==1?c.bone:0x5a5a5e,0,null,'m');if(c.gl)[-1,1].forEach(q=>k.p('','sph','g',c.gl,s*.075+q*.026,y+.005,.066,.008))})};
W137.fl_halo=(k,c)=>{const G=0xd8b050;w7Haft(k,.08,-.28,.032,0xe8e0d0,39);w7Bands(k,[.06,-.1,-.26],.037,G);k.p('','oct','m',G,0,-.29,0,.04);
  gkChain(k,'',[[0,-.31,0],[0,-.66,0]],.012,G,null);
  k.p('','ico','m',G,0,-.76,0,.1);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i%3-1)*.5;k.p('','cone4','m',0xf0e0a0,Math.cos(a)*Math.cos(b)*.1,-.76+Math.sin(b)*.1,Math.sin(a)*Math.cos(b)*.1,.016,.07,.016,Math.sin(a)*1.57-b*Math.cos(a),0,-Math.cos(a)*1.57+b*Math.sin(a))}
  k.p('','ring','g',c.gl||0xfff0b0,0,-.76,0,.17,.12,.17,.4,0,.2);k.p('','oct','g',0xfff8d0,0,-.76,.1,.02)};
// ---------------- daggers (grip .06…-.06, blade to ≈ -.47) ----------------
W137.dg_rat=(k,c)=>{k.p('','cyl','c',0x6a5a48,0,0,0,.022,.13,.022);for(let i=0;i<5;i++)k.p('','cyl','c',i%2?0x8a7a60:0x5a4a38,0,.05-i*.025,0,.026,.014,.026,0,i*.6);k.p('','cone4','c',0xe8e0c8,0,.09,0,.01,.04,.01);
  const P=[[-.025,-.07],[.028,-.07],[.03,-.2],[.022,-.3],[.026,-.34],[.006,-.46],[-.02,-.36],[-.024,-.2]];w7Blade(k,'dgr',P,.012,0x5a544c,0x8a847a,0,0,0,0,.008);
  k.p('','box','m',0x3a3430,0,-.07,0,.07,.016,.03)};
W137.dg_kris=(k,c)=>{w7Grip(k,.06,.12,.022,0x2a1a2a,0x4a2a4a);// moon pommel
  k.p('','oct','m',0xc8ccd4,0,.07,0,.016);for(let i=0;i<7;i++){const st=(Math.PI-.5)/7,a0=Math.PI+.25+i*st,a1=a0+st,w=.004+.004*Math.sin((i+.5)/7*Math.PI);k.L('','m',0xc8ccd4,[Math.cos(a0)*.035,.112+Math.sin(a0)*.035,0],[Math.cos(a1)*.035,.112+Math.sin(a1)*.035,0],w,w,4)}
  const P=[[-.04,-.06],[.036,-.06],[.03,-.08]].concat(w7Wavy(.32,.024,.012,.012,3,.06,-.09).slice(1,-1));w7Blade(k,'dgk',P,.012,0x3a3a46,0x9a9aa8,0,0,0,0,.008);
  k.p('','box','m',c.fit,0,-.065,0,.08,.016,.032);if(c.gl)k.p('','box','g',c.gl,0,-.25,0,.004,.2,.014)};
W137.dg_veil=(k,c)=>{w7Grip(k,.06,.13,.02,0x1a1a22,0x3a3a4a);k.p('','oct','m',0xb8bec8,0,.09,0,.022,.03,.022);k.S('',0x6a1a3a,0,.1,0,.012,.1,0,.2,3);
  [-1,1].forEach(s=>{const P=[[0,0],[.03,.02],[.07,.035],[.06,.0],[.04,-.012],[0,-.01]];k.p('',lgSlab('w7dvw',P,.008),'m',0xb8bec8,0,-.07,0,s,1,1)});
  k.L('','m',0xc8ccd4,[0,-.08,0],[0,-.5,0],.012,.002,4);k.L('','g',c.gl||0xc890ff,[0,-.1,0],[0,-.42,0],.0045,.001,4)};
// ---------------- claws (a gauntlet at the grip, blades to ≈ -.43) ----------------
W137.cl_ghoul=(k,c)=>{k.p('','box','c',0x4a3a2a,0,.02,0,.1,.15,.085);k.S('',0x5a4a3a,.04,.08,.04,.03,.12,.3,.2,2);for(let i=0;i<3;i++)k.p('','box','c',0x3a2a1a,0,.06-i*.04,0,.106,.014,.09);
  [-.035,0,.035].forEach((x,i)=>{const d=i==1?.03:0;let p=[x,-.06,0];const pts=[[x*1.2,-.2-d,.02],[x*1.4,-.33-d,.07],[x*1.4,-.4-d,.14],[x*1.3,-.42-d,.19]];pts.forEach((q,j)=>{k.L('','c',j<2?0xd8ccb0:0xc8bca0,p,q,.014-j*.003,.011-j*.003,5);p=q})})};
W137.cl_mantis=(k,c)=>{k.p('','box','m',0x3a5a2a,0,.02,0,.1,.15,.09);k.p('','box','m',0x2a4a1e,0,-.05,0,.11,.04,.1);
  [-1,1].forEach(s=>{const P=[[0,0],[.03,-.02],[.06,-.15],[.07,-.3],[.05,-.42],[.0,-.5],[.03,-.38],[.02,-.2],[-.01,-.04]];w7Blade(k,'clm',P,.014,0x4a6a2a,0x9ac85a,s*.035,-.04,0,0,.008);
    for(let i=0;i<6;i++)k.p('','cone4','m',0x9ac85a,s*.035+.0,-.12-i*.05,0,.006,.02,.004,0,0,Math.PI/2+.3)});if(c.gl)k.p('','oct','g',c.gl,0,-.02,.05,.014,.02,.006)};
W137.cl_night=(k,c)=>{k.p('','box','m',0x1a1820,0,.02,0,.1,.15,.09);for(let i=0;i<4;i++)k.p('','cone4','m',0x2a2832,-.045+i*.03,-.04,.05,.008,.03,.008,Math.PI/2);
  [-.045,-.015,.015,.045].forEach((x,i)=>{let p=[x,-.06,0];const d=i==1||i==2?.03:0,pts=[[x*1.1,-.22-d,.03],[x*1.2,-.36-d,.08],[x*1.2,-.45-d,.16]];pts.forEach((q,j)=>{k.L('','m',j<2?0x2a2632:0x4a4656,p,q,.012-j*.003,.009-j*.003,4);if(j<2)k.L('','g',c.gl||0xa05aff,[p[0],p[1],p[2]+.008],[q[0],q[1],q[2]+.008],.0025,.0025,3);p=q})})};
// ---------------- throwing knives (held like a dagger) ----------------
W137.kn_crow=(k,c)=>{k.p('','cyl','c',0x2a2a30,0,0,0,.014,.12,.014);for(let i=0;i<3;i++)gkFeather(k,'',[0,.06,0],[(i-1)*.25,1,((i+1)%2)*.3],.09,.014,i%2?0x14141a:0x2a2a36,null);
  const P=[[-.014,-.06],[.014,-.06],[.012,-.25],[0,-.34],[-.012,-.25]];w7Blade(k,'knc',P,.008,0x4a4a52,0x9aa0a8,0,0,0,0,.005)};
W137.kn_star=(k,c)=>{k.p('','ring','m',c.dark,0,.075,0,.026,.12,.026,Math.PI/2);k.L('','m',c.dark,[0,-.06,0],[0,-.17,0],.011,.011,6);k.p('','cyl','c',0x1a1a1a,0,-.0,0,.014,.12,.014);for(let i=0;i<4;i++)k.p('','cyl','c',0x3a1010,0,.04-i*.025,0,.017,.012,.017);
  const P=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=i%2?.03:.11;P.push([Math.sin(a)*r,Math.cos(a)*r])}w7Blade(k,'kns',P,.01,0x1e1e24,0x6a6a74,0,-.17,0,Math.PI/8,.008);
  k.p('','cyl','m',c.fit,0,-.17,0,.018,.014,.018,Math.PI/2);if(c.gl)k.p('','cyl','g',c.gl,0,-.17,0,.01,.016,.01,Math.PI/2)};
W137.kn_asp=(k,c)=>{k.p('','ring','m',0x3a3a40,0,.085,0,.022,.12,.022,Math.PI/2);k.p('','cyl','c',0x2a3a2a,0,.0,0,.015,.13,.015);
  for(let i=0;i<10;i++){const a=i*1.2,y=.05-i*.011;k.p('','sph','c',i%2?0x3a6a2a:0x2a5a1e,Math.cos(a)*.019,y,Math.sin(a)*.019,.008)}k.p('','sph2','c',0x3a6a2a,0,-.065,.02,.014,.01,.02);k.p('','sph','g',c.gl||0x9aff5a,.007,-.06,.032,.003);
  const P=[[-.018,-.07],[.018,-.07],[.03,-.16],[.024,-.26],[0,-.36],[-.024,-.26],[-.03,-.16]];w7Blade(k,'kna',P,.012,0x2a3a2e,0x7a9a7a,0,0,0,0,.008);k.L('','g',c.gl||0x9aff5a,[0,-.1,0],[0,-.3,0],.003,.001,3)};
// ---------------- bows / crossbows / slings: the v83/v135 frame, dressed ----------------
function w7Bow(k,it){lgWpnKit(k,'bow',v89WCol(it),it.r|0)}
function w7BowPts(){const pts=[],K=BOW_K,sq=(x,y)=>[-.555+(x+.555)*BOW_KX,y*K,0];for(let i=0;i<=10;i++){const a=Math.PI*(.55+i*.09),rr=.55+(i==0||i==10?.04:0),rc=(i==0||i==10)?.03:0;pts.push(sq(Math.cos(a)*rr+rc,Math.sin(a)*rr*1.02))}return pts}
W137.bw_briar=(k,c,it)=>{w7Bow(k,it);const P=w7BowPts();for(let i=0;i<10;i++){if(i>3&&i<6)continue;const a=P[i],b=P[i+1];for(let j=0;j<3;j++){const t=(j+.5)/3,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,0];
    k.p('','cone4','c',0x4a3a24,p[0]-.016,p[1],(j%2?.012:-.012),.005,.022,.005,0,0,Math.PI/2+(j-1)*.4);if(j==1&&i%2)k.p('','oct','c',0x3a5a22,p[0]-.01,p[1]+.01,.012,.012,.02,.003,0,0,.6)}}
  k.p('','sph','c',0x8a1a2a,P[2][0]-.02,P[2][1],.014,.012);k.p('','sph','c',0x8a1a2a,P[8][0]-.02,P[8][1],-.014,.012)};
W137.bw_antler=(k,c,it)=>{w7Bow(k,it);const P=w7BowPts(),A=0xd8c8a0;[[P[0],1],[P[10],-1]].forEach(([q,s])=>{k.L('','c',A,q,[q[0]-.03,q[1]+s*.08,0],.012,.008,5);k.L('','c',A,[q[0]-.02,q[1]+s*.04,0],[q[0]-.09,q[1]+s*.07,0],.007,.002,4);k.L('','c',A,[q[0]-.03,q[1]+s*.08,0],[q[0]-.01,q[1]+s*.14,0],.007,.002,4)});
  k.p('','box','c',0x6a4a2a,-.555,0,0,.05,.12,.05);for(let i=0;i<3;i++)k.p('','box','c',0x3a2618,-.555,-.04+i*.04,0,.054,.01,.054);gkFeather(k,'',[-.53,-.05,.03],[.3,-1,.2],.09,.012,0x8a6a4a,null)};
W137.bw_wyrm=(k,c,it)=>{w7Bow(k,it);const P=w7BowPts();for(let i=0;i<10;i++){if(i>3&&i<6)continue;const p=P[i],q=P[i+1],m=[(p[0]+q[0])/2,(p[1]+q[1])/2,0];k.L('','c',c.bone,m,[m[0]-.05,m[1]+(i<5?.02:-.02),.0],.008,.002,4)}
  gkSkull(k,'',-.59,0,0,1.6,c.bone,-Math.PI/2,null);k.p('','sph','g',c.gl||0xff6a2a,-.62,.004,.02,.006);k.p('','sph','g',c.gl||0xff6a2a,-.62,.004,-.02,.006);
  [P[0],P[10]].forEach((q,i)=>k.L('','c',0x3a3438,q,[q[0]-.02,q[1]+(i?-.09:.09),0],.012,.002,5))};
W137.xb_trap=(k,c,it)=>{lgWpnKit(k,'crossbow',v89WCol(it),it.r|0);// trap jaws on the nose, a fur wrap on the stock
  [-1,1].forEach(s=>{for(let i=0;i<5;i++){const a=(i/4-.5)*1.6;k.p('','cone4','m',0x5a5a60,s*.025+Math.sin(a)*.05,-.69-Math.cos(a)*.02,.03,.006,.02,.006,0,0,s*.5)}k.L('','m',0x4a4a50,[s*.02,-.66,.03],[s*.07,-.7,.03],.006,.006,4)});
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','cone4','c',i%2?0x6a5a40:0x5a4a32,Math.cos(a)*.04,.05,Math.sin(a)*.04,.016,.06,.012,Math.PI,a,0)}};
W137.xb_skull=(k,c,it)=>{lgWpnKit(k,'crossbow',v89WCol(it),it.r|0);gkSkull(k,'',0,.02,.02,1.7,c.bone,0,null);if(c.gl)[-1,1].forEach(q=>k.p('','sph','g',c.gl,q*.02,.026,.075,.007));
  // a crank wheel on the side
  k.p('','cyl','m',0x3a3a40,.06,-.18,0,.05,.012,.05,0,0,Math.PI/2);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.L('','m',0x4a4a50,[.066,-.18,0],[.066,-.18+Math.cos(a)*.06,Math.sin(a)*.06],.004,.004,3)}k.L('','m',0x4a4a50,[.07,-.18,0],[.12,-.18,.04],.006,.006,4)};
W137.xb_watch=(k,c,it)=>{lgWpnKit(k,'crossbow',v89WCol(it),it.r|0);// a bolt magazine on top, black iron plates, a lantern
  k.p('','box','m',0x24242a,0,-.3,.075,.07,.22,.07);for(let i=0;i<4;i++)k.p('','box','c',0x3a3a40,0,-.22-i*.05,.112,.05,.01,.004);k.L('','m',0x3a3a40,[0,-.18,.05],[0,-.2,.14],.008,.008,4);
  k.p('','box','m',0x24242a,0,-.5,0,.18,.08,.09);k.p('','cyl','m',0x24242a,.06,-.06,.06,.022,.04,.022);k.p('','cyl','g',c.gl||0xffc860,.06,-.06,.06,.016,.03,.016)};
W137.sl_wolf=(k,c,it)=>{lgWpnKit(k,'sling',v89WCol(it),it.r|0);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;k.p('','cone4','c',i%2?0x6a6a66:0x4a4a46,Math.cos(a)*.05,-.41,Math.sin(a)*.04,.014,.05,.01,Math.PI/2,a,0)}
  [-1,1].forEach(s=>k.p('','cone4','c',0xe8e0c8,s*.018,.02,.02,.006,.03,.006,Math.PI))};
W137.sl_jaw=(k,c,it)=>{lgWpnKit(k,'sling',v89WCol(it),it.r|0);// a jawbone grip with teeth
  k.L('','c',c.bone,[0,.06,0],[0,-.03,.0],.022,.018,5);k.L('','c',c.bone,[0,-.03,0],[.03,-.06,0],.016,.01,5);for(let i=0;i<5;i++)k.p('','cone4','c',0xf0e8d0,.012,.05-i*.018,.014,.005,.016,.005,0,0,-Math.PI/2)};
W137.sl_comet=(k,c,it)=>{lgWpnKit(k,'sling',v89WCol(it),it.r|0);const g=c.gl||0x9ad8ff;k.p('','ico','g',g,0,-.41,0,.03);for(let i=0;i<4;i++)k.L('','g',lgCol(g,0xffffff,.4),[0,-.41,0],[(i-1.5)*.012,-.36+i*.0,-.06-i*.02],.012,.001,4);
  [-1,1].forEach(s=>k.p('','oct','g',g,s*.02,-.1,.0,.006,.01,.004))};
// ---------------- staves (.55…-1.17, head ≈ -1.06) ----------------
W137.st_hang=(k,c)=>{const R=dkRng(41);let p=[0,.55,0];for(let i=0;i<5;i++){const q=[(R()-.5)*.06,.55-(i+1)*.27,(R()-.5)*.06];k.L('','c',i%2?0x3a2a1e:0x2e2016,p,q,.028,.033,6);if(i%2)k.p('','dod','c',0x3a2a1e,q[0],q[1],q[2],.038);p=q}
  // a forked crown of twigs and a hangman's noose
  [[-.08,-1.2,.02],[.07,-1.22,-.02],[0,-1.25,.06]].forEach((t,i)=>{k.L('','c',0x2e2016,p,t,.022,.006,5);k.L('','c',0x2e2016,t,[t[0]*1.6,t[1]-.08,t[2]*1.5],.006,.002,4)});
  k.L('','c',0xa89a70,[.03,-1.15,0],[.12,-1.0,0],.007,.007,4);k.L('','c',0xa89a70,[.12,-1.0,0],[.12,-.86,0],.007,.007,4);k.p('','ring','c',0xa89a70,.12,-.8,0,.04,.25,.05,0,0,Math.PI/2);
  for(let i=0;i<3;i++)k.p('','cyl','c',0xa89a70,.12,-.88-i*.012,0,.011,.008,.011);k.p('','oct','g',c.gl||0x9a7aff,0,-1.17,0,.035,.05,.035)};
W137.st_candle=(k,c)=>{const G=c.fit;let p=[0,.55,0];for(let i=0;i<5;i++){const q=[0,.55-(i+1)*.3,0];k.L('','c',i%2?c.woodD:0x4a3020,p,q,.026,.028,6);p=q}w7Bands(k,[.3,-.2,-.7,-.95],.034,G);
  // a crook bending over, a lantern with a candle hanging from it
  const crook=[[0,-.95,0],[0,-1.08,0],[.03,-1.17,0],[.09,-1.2,0],[.15,-1.16,0],[.17,-1.08,0]];for(let i=0;i<crook.length-1;i++)k.L('','m',G,crook[i],crook[i+1],.022,.022,6);
  gkChain(k,'',[[.17,-1.09,0],[.17,-1.0,0]],.007,0x3a3a40,null);k.p('','cone4','m',0x2a2a30,.17,-.98,0,.04,.04,.04,0,Math.PI/4);k.p('','box','g',c.gl||0xffc060,.17,-.92,0,.045,.07,.045);
  [-1,1].forEach(s=>[-1,1].forEach(q=>k.L('','m',0x2a2a30,[.17+s*.024,-.96,q*.024],[.17+s*.024,-.88,q*.024],.004,.004,3)));k.p('','box','m',0x2a2a30,.17,-.87,0,.05,.012,.05);k.p('','box','c',0xe8e0c8,.17,-.92,0,.016,.04,.016)};
W137.st_eye=(k,c)=>{const R=dkRng(43);let p=[0,.55,0];for(let i=0;i<5;i++){const q=[(R()-.5)*.03,.55-(i+1)*.29,(R()-.5)*.03];k.L('','c',i%2?0x2a1e24:0x1e161a,p,q,.028,.032,6);p=q}
  // claws holding a great eye
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;const b=[Math.cos(a)*.05,-1.0,Math.sin(a)*.05],t=[Math.cos(a)*.1,-1.08,Math.sin(a)*.1],tt=[Math.cos(a)*.06,-1.2,Math.sin(a)*.06];k.L('','c',0x2a1e24,[0,-.95,0],b,.016,.014,5);k.L('','c',0x2a1e24,b,t,.014,.01,5);k.L('','m',0x14100c,t,tt,.01,.002,4)}
  k.p('','sph2','c',0xe8e0d0,0,-1.1,0,.075);k.p('','sph','g',c.gl||0xff3a2a,0,-1.1,.06,.035,.035,.022);k.p('','box','c',0x050505,0,-1.1,.08,.008,.04,.006);
  for(let i=0;i<5;i++){const a=i*1.3;k.L('','c',0xc83a3a,[Math.cos(a)*.06,-1.1+Math.sin(a)*.04,-.03],[Math.cos(a)*.072,-1.1+Math.sin(a)*.05,.02],.002,.002,3)}};
W137.st_thorn=(k,c)=>{let p=[0,.55,0];for(let i=0;i<5;i++){const q=[0,.55-(i+1)*.29,0];k.L('','c',0x1e2418,p,q,.026,.03,6);p=q}
  for(let i=0;i<26;i++){const a=i*.75,y=.4-i*.055;k.p('','sph','c',0x2a3a1e,Math.cos(a)*.032,y,Math.sin(a)*.032,.009);if(i%2)k.p('','cone4','c',0x4a3a24,Math.cos(a)*.045,y,Math.sin(a)*.045,.004,.02,.004,0,-a,Math.PI/2)}
  // the crown of thorns round a glowing crystal
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2;k.L('','c',0x2a3a1e,[Math.cos(a)*.1,-1.06+Math.sin(i*2)*.015,Math.sin(a)*.1],[Math.cos(b)*.1,-1.06+Math.sin(i*2+2)*.015,Math.sin(b)*.1],.012,.012,4);
    k.L('','c',0x4a3a24,[Math.cos(a)*.1,-1.06,Math.sin(a)*.1],[Math.cos(a)*.15,-1.06+(i%2?.04:-.04),Math.sin(a)*.15],.008,.001,4)}
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','c',0x2a3a1e,[0,-.9,0],[Math.cos(a)*.1,-1.06,Math.sin(a)*.1],.012,.01,4)}
  k.p('','oct','g',c.gl||0xff3a5a,0,-1.08,0,.05,.09,.05);k.p('','oct','g',0xffe0e8,0,-1.08,0,.022,.04,.022)};
// ---------------- wands (.12…-.42, tip ≈ -.42) ----------------
W137.wd_finger=(k,c)=>{const B=c.bone;[[.12,.0],[0,-.14],[-.14,-.26],[-.26,-.36]].forEach(([a,b],i)=>{k.L('','c',B,[0,a,0],[0,b,0],.016-i*.002,.014-i*.002,5);k.p('','sph','c',mdSh(B,1.05),0,b,0,.02-i*.002)});
  k.p('','cone4','c',0x3a3438,0,-.38,0,.012,.04,.012,Math.PI);k.p('','oct','g',c.gl||0x7affc8,0,-.43,0,.02,.03,.02);for(let i=0;i<3;i++)k.p('','ring','m',c.fit,0,.08-i*.03,0,.02,.12,.02)};
W137.wd_snake=(k,c)=>{k.L('','c',0x2a3a22,[0,.12,0],[0,-.36,0],.014,.01,6);for(let i=0;i<16;i++){const a=i*.9,y=.08-i*.026;k.p('','sph','c',i%2?0x4a7a2a:0x3a6a22,Math.cos(a)*.018,y,Math.sin(a)*.018,.011,.012,.011)}
  k.p('','sph2','c',0x4a7a2a,0,-.38,.0,.022,.018,.03,.3);k.p('','cone4','c',0x4a7a2a,0,-.4,.025,.016,.03,.01,Math.PI/2);[-1,1].forEach(s=>k.p('','sph','g',c.gl||0xffd040,s*.012,-.372,.018,.005));
  k.L('','c',0xc83a3a,[0,-.41,.04],[0,-.43,.06],.002,.001,3)};
W137.wd_void=(k,c)=>{const g=c.gl||0xb05aff;k.L('','c',0x1a1820,[0,.12,0],[0,-.1,0],.018,.016,6);for(let i=0;i<3;i++)k.p('','ring','m',0x3a3446,0,.08-i*.07,0,.022,.12,.022);
  k.p('','oct','m',0x14121a,0,-.25,0,.03,.15,.03);k.p('','oct','g',g,0,-.25,0,.012,.12,.012);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','m',0x3a3446,[Math.cos(a)*.012,-.1,Math.sin(a)*.012],[Math.cos(a)*.03,-.17,Math.sin(a)*.03],.005,.002,4)}[[.026,-.3,.01,.5],[-.024,-.34,-.008,-.5]].forEach((q,i)=>k.p('','oct','g',g,q[0],q[1],q[2],.006,.03,.006,0,0,q[3]))};
// ---------------- orbs (the orb centred on the grip) ----------------
W137.ob_jar=(k,c)=>{const g=c.gl||0x9affc8;k.p('','cyl','m',0x3a3a40,0,.1,0,.075,.02,.075);k.p('','cyl','c',0x8a6a40,0,.12,0,.05,.03,.05);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.L('','m',0x3a3a40,[Math.cos(a)*.08,.09,Math.sin(a)*.08],[Math.cos(a)*.08,-.09,Math.sin(a)*.08],.006,.006,3)}
  k.p('','cyl','m',0x3a3a40,0,-.1,0,.085,.02,.085);k.p('','ico','g',g,0,0,0,.05);k.p('','oct','g',0xffffff,0,0,0,.02);for(let i=0;i<3;i++)k.p('','sph','g',lgCol(g,0xffffff,.3),Math.cos(i*2)*.04,.04-i*.03,Math.sin(i*2)*.04,.008);
  k.p('','cyl','m',0x3a3a40,0,-.14,0,.03,.06,.03);k.p('','cone4','c',LGW.woodD,0,-.2,0,.04,.07,.04,Math.PI)};
W137.ob_seer=(k,c)=>{gkSkull(k,'',0,0,-.06,3.6,c.bone,0,null);k.p('','oct','g',c.gl||0x9a7aff,0,.06,.06,.014,.02,.008);[-1,1].forEach(s=>k.p('','sph','g',c.gl||0x9a7aff,s*.043,.006,.05,.014));
  const n0=k.P.length;l7Candle(k,1.5);k7Shift(k,n0,0,.15,-.07);k.p('','cyl','m',c.fit,0,-.14,0,.05,.03,.05);k.p('','cone4','c',LGW.woodD,0,-.2,0,.04,.08,.04,Math.PI)};
W137.ob_sun=(k,c)=>{const g=c.gl||0xff8a2a;k.p('','sph2','m',0x0c0a10,0,0,0,.09);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;k.L('','g',i%2?g:lgCol(g,0xffe0a0,.5),[Math.cos(a)*.1,Math.sin(a)*.1,0],[Math.cos(a)*(i%2?.15:.19),Math.sin(a)*(i%2?.15:.19),0],.012,.001,4)}
  k.p('','ring','g',g,0,0,0,.1,.08,.1,Math.PI/2);[0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.L('','m',0x3a3446,[Math.cos(a)*.03,-.15,Math.sin(a)*.03],[Math.cos(a)*.08,-.07,Math.sin(a)*.08],.012,.008,4)});
  k.p('','cyl','m',0x3a3446,0,-.15,0,.05,.03,.05);k.p('','cone4','c',LGW.woodD,0,-.21,0,.04,.08,.04,Math.PI)};
// ---------------- hooking in: the item's own recipe for the weapon in hand, the picture and the drop ----------------
{const f=v89WpnKit;v89WpnKit=function(k,it){const t=v137T(it),R=t&&(W137[t.v7]||(typeof SH137!='undefined'&&SH137[t.v7]));if(!R)return f.apply(this,arguments);
  try{R(k,w7C(it),it)}catch(e){console.warn('v137 weapon',t.v7,e);k.P.length=0;return f.apply(this,arguments)}}}
