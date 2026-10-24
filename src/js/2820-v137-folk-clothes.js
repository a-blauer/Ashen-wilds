// ================= v137: animal townsfolk — clothes and the keepers' costumes =================
// Garments fit the animal body because they are built from the same (beast-scaled) torso / arm / leg rings, or measured
// from what is already built (gkSkirt, gkCollar from the v136 kit): shirts and trousers are painted on the body rings,
// vests / aprons / belts are thin shells over the torso, skirts and coats hang (they never wrap the legs), sleeves follow
// the arm, hats sit on the skull between the ears. Clothes get a hole where the tail comes out (v114 mdLoft hook).
// fkOutfit(name, o, D, C) -> {paint(P, C), build(B, P, C), boots}; FK137.out[label] = {sp, fur, sc} picks each keeper.
var FKG={};
// shirt + trousers painted on the body: o = {shirt, sleeve:'long'|'short'|'none', pants, legs:'long'|'knee'|'none', cuffs, patt(m) → colour or null}
FKG.paint=function(P,C,o){const sh=o.shirt,pt=o.pants==null?sh:o.pants,sl=o.sleeve||'long',lg=o.legs||'long';
  P.paint.torso=m=>m.y>.985?C.FUR:(o.patt&&o.patt(m))||sh;P.paint.torsoLo=m=>o.tunic&&m.y>o.tunic?((o.patt&&o.patt(m))||sh):pt;P.col.torso=sh;P.col.torsoLo=pt;P.col.pants=pt;P.col.belt=null;
  P.paint.sleeve=()=>sl=='none'?C.FUR:sh;P.paint.fore=m=>{const p=m.r.part;if(sl=='long'||(sl=='short'&&m.i<3.7))return p=='wrist'&&o.cuffs?o.cuffs:sh;return p=='wrist'?mdMix(C.FUR,P.col.hand,.3):C.FUR};
  const pl=P.paint.leg;P.paint.leg=(m,s)=>{const p=m.r.part;if(lg=='long'&&p!='ankle')return (o.pattL&&o.pattL(m))||pt;if(lg=='knee'&&(p=='hip'||p=='thigh'||p=='knee'&&m.i<3.5))return pt;return pl?pl(m,s):C.FUR}};
// a band round the torso (belt, sash) with a buckle at the front
FKG.belt=function(B,P,y,col,o){o=o||{};const k=dkKit(),off=(P.tOff||0)+(o.off||.01),h=o.h||.022;mdTS(B,P,y-h,y+h,off,{col});
  if(o.buckle!==false){const p=mdTP(P,y,0,off-.002);k.p(n3TB(y),'box','m',o.buckle||0xb89a4a,p[0],p[1],p[2],.034,.03,.008);k.p(n3TB(y),'box','c',col,p[0],p[1],p[2]+.003,.018,.014,.006)}
  mdKit(B,k)};
// a torso shell (vest, jerkin, bodice) from y0 to y1, open at the front by openA (radians either side) unless 0
FKG.shell=function(B,P,y0,y1,col,o){o=o||{};const op=o.open||0,vn=o.vneck;mdTS(B,P,y0,y1,(P.tOff||0)+(o.off||.01),{col:typeof col=='function'?col:m=>col,keep:m=>{if(op&&m.s>Math.cos(op))return false;if(vn&&m.s>.3&&m.y>vn[0]&&Math.abs(m.c)<(m.y-vn[0])*vn[1])return false;return !o.keep||o.keep(m)},lip:o.lip,lipT:o.lipT})};
// buttons down the front (or two rows: dx)
FKG.buttons=function(B,P,y0,y1,n,col,o){o=o||{};const k=dkKit();for(let i=0;i<n;i++){const y=y0+(y1-y0)*i/Math.max(1,n-1);(o.dx?[-o.dx,o.dx]:[0]).forEach(dx=>{const a=dx?Math.asin(Math.max(-1,Math.min(1,dx/mdTorsoAt(P,y).rx))):0,p=mdTP(P,y,a,(P.tOff||0)+(o.off||.006));k.p(n3TB(y),'sph','m',col,p[0],p[1],p[2],.009,.009,.006)})}mdKit(B,k)};
// a skirt / robe / coat skirt hanging from y0 (gkSkirt): hem(θ) or a number, flare, open front (coats), col / lin
// (v140: the skirt's top sits on what is worn at the waist — the v136 clearance of 16 mm left it hanging in the air above
// the belt; the cloth flares out a little more below instead)
FKG.skirt=function(B,P,o){o=Object.assign({},o);if(o.clear==null)o.clear=.004;o.flare=(o.flare||0)+.012;return gkSkirt(B,P,Object.assign({N:32,rows:8,flow:.3,folds:[9,.01],legW:.85},o))};
// an apron: bib (optional) + front skirt
FKG.apron=function(B,P,col,o){o=o||{};const w=o.w||1.1,hem=o.hem||.3,y0=o.y0||.6;
  if(o.bib!==false)mdTS(B,P,y0,o.bibTop||.93,(P.tOff||0)+.012,{col,keep:m=>m.s>.5});
  const S=gkSkirt(B,P,{y0,hem:()=>hem,col,keep:m=>{const th=m.u*Math.PI*2;return th<w||th>Math.PI*2-w},flare:.03,folds:[7,.006],rows:7,N:32,flow:0,clear:.006});
  // ties at the back and (with a bib) the neck strap
  const k=dkKit();if(o.bib!==false)[-1,1].forEach(s=>{const a=mdTP(P,o.bibTop||.93,s*.55,(P.tOff||0)+.014),b=mdTP(P,1.0,s*1.2,(P.tOff||0)+.006);k.L('chest','c',col,a,b,.008,.008,4)});
  FKG.belt(B,P,y0+.01,mdSh(col,.85),{buckle:false,h:.012,off:.018});mdKit(B,k);return S};
// sleeves of cloth over the arm (gkSleeve): bell / trail for robes, plain for coats
FKG.sleeves=function(B,P,o){[-1,1].forEach(s=>gkSleeve(B,P,s,Object.assign({u0:.4,uw:5.0,off:.012,ext:.01},o)))};
// a cuff / bracer / glove shell on the forearm and hand from ring u0 to u1 (arm ring indices)
FKG.cuff=function(B,P,i0,i1,col,off){[-1,1].forEach(s=>mdAS(B,P,s,i0,i1,off||.012,{col,capB:i1>=7}))};
// boots: shell over the lower leg and foot (no toes then)
FKG.boots=function(B,P,col,o){o=o||{};[-1,1].forEach(s=>{mdLS(B,P,s,o.i0||4,6,o.off||.012,{col:m=>m.i<(o.i0||4)+.6&&o.top?o.top:col});mdFS(B,P,s,o.offF||.004,{col:m=>m.y<.03?mdSh(col,.6):col})})};  // (v140: a thinner foot shell, so the sole stays on the ground)
// a standing / turned-down collar
FKG.collar=function(B,P,col,o){return gkCollar(B,P,Object.assign({col,y0:.95,h:th=>1.0+.03*Math.max(0,-Math.cos(th)),flare:.02,open:.5},o||{}))};
// a scarf / neckerchief: a roll round the neck and a knotted point at the front
FKG.scarf=function(B,P,col,o){o=o||{};const k=dkKit(),y=o.y||.982,T=mdTorsoAt(P,y),n=14;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,a2=(i+1)/n*Math.PI*2,r=(c,an)=>[Math.sin(an)*(T.rx*.92+.018),y+.012*Math.cos(an),T.z+Math.cos(an)*((Math.cos(an)>0?T.f:T.b)*.92+.018)];
    k.L('chest','c',col,r(0,a),r(0,a2),.013,.013,5)}
  const f=[0,y-.01,T.z+T.f+.028];k.p('chest','sph2','c',mdSh(col,.9),f[0],f[1],f[2],.022,.018,.014);k.L('chest','c',col,f,[f[0]-.02,f[1]-.07,f[2]+.012],.018,.004,4);k.L('chest','c',mdSh(col,.85),f,[f[0]+.022,f[1]-.06,f[2]+.01],.016,.004,4);mdKit(B,k)};
// a pouch / bag at the hip (angle a round the waist)
FKG.pouch=function(k,P,y,a,col,s){s=s||1;const p=mdTP(P,y,a,(P.tOff||0)+.017*s);k.p('pelvis','box','c',col,p[0],p[1]-.02*s,p[2],.06*s,.07*s,.04*s,0,a,0);k.p('pelvis','box','c',mdSh(col,.8),p[0],p[1]+.012*s,p[2]+.004*Math.cos(a),.064*s,.024*s,.044*s,.12,a,0);k.p('pelvis','sph','m',0xb89a4a,p[0]+Math.sin(a)*.022*s,p[1]+.004,p[2]+Math.cos(a)*.022*s,.006,.006,.004)};
// a mantle / capelet / lowered cowl draped over the shoulders: measured from what is built (torso, upper arms, collars) so it
// hangs over everything; never narrower going down; weights: chest, and toward the upper arm at the outer lower edge (raised
// arms lift its sides instead of poking through). o: y0 (top at the neck), hem (θ → y, or a number), col, lin, clear, flare,
// open (front gap, radians), dag, roll (a rolled edge at the top: radius), folds [n, amp]
FKG.mantle=function(B,P,o){o=o||{};const N=o.N||32,y0=o.y0||1.0,hem=typeof o.hem=='function'?o.hem:(()=>o.hem||.84),clr=o.clear==null?.018:o.clear,fl=o.flare||0,TH=j=>j/N*Math.PI*2,nt=o.rows||6;
  let ymin=y0;for(let j=0;j<N;j++)ymin=Math.min(ymin,hem(TH(j)));ymin-=o.dag||0;
  const D=BR.on?BR.R:null,pts=gkPts(B,ymin-.02,y0+.02,(x,y,z)=>x*x+z*z<.5*.5&&!(D&&D.TP&&brTailNear(D,x,y,z))&&!(y>1.0&&z>.0),/^(tl\d|cp\d|er[LR]|lh|rh)/);
  const dy=.014,ys=[];for(let y=y0;y>=ymin-.001;y-=dy)ys.push(y);const H=gkRows(pts,ys,dy*.75);
  const cz=ys.map(y=>{const q=mdTorsoAt(P,Math.min(.99,y));return (q.z||0)+(q.f-q.b)*.5*0});
  const RB=H.map((h,i)=>{const r=[];for(let j=0;j<N;j++)r.push(gkHullR(h,0,cz[i],TH(j)));return r});
  for(let i=1;i<RB.length;i++)for(let j=0;j<N;j++)RB[i][j]=Math.max(RB[i][j],RB[i-1][j]);
  const rAt=(y,j)=>{const f=(y0-y)/dy,i=Math.max(0,Math.min(RB.length-1,Math.round(f)));return RB[i][j]},fo=o.folds||[10,.006];
  const G=[];for(let i=0;i<=nt;i++){const t=i/nt,row=[];for(let j=0;j<=N;j++){const jj=j%N,th=TH(j);let y=y0+(hem(th)-y0)*t;if(i==nt&&o.dag&&j%2)y-=o.dag;
      const r=rAt(Math.max(ymin,y),jj)+clr+fl*t*t+fo[1]*t*Math.sin(th*fo[0]),x=Math.sin(th)*r,zc=cz[Math.min(cz.length-1,Math.round((y0-Math.max(ymin,y))/dy))],z=zc+Math.cos(th)*r;
      const sd=Math.abs(Math.sin(th)),a=.55*Math.max(0,sd-.35)/.65*Math.min(1,t*1.4),bn=x>0?'aR0':'aL0',w=y>1.0?mdWb('chest','neck',.3):[['chest',1-a],[bn,a]];
      row.push({x,y,z,w,cz:zc})}G.push(row)}
  const op=o.open||0,keep=m=>{const th=m.u*Math.PI*2;return !(op&&(th<op||th>Math.PI*2-op))};
  gkSurf(B,G,{t:o.t||'c',col:o.col,keep});gkSurf(B,gkInset(G,G.map((r,i)=>r[0].cz),.004),{t:'c',col:o.lin==null?mdSh(typeof o.col=='function'?0x555555:o.col,.6):o.lin,keep});
  if(o.roll){const k=dkKit(),R0=G[0];for(let j=0;j<N;j++){const a=R0[j],b=R0[j+1],th=TH(j+.5);if(op&&(th<op||th>Math.PI*2-op))continue;k.L('chest','c',o.rollCol||o.col,[a.x,a.y,a.z],[b.x,b.y,b.z],o.roll,o.roll,5)}mdKit(B,k)}
  return {G,N,nt}};
// ---------------- hats ----------------
// the crown point and the room between the ears at z
function fkCrown(D,z){const q=brSkullAt(D,z),E=fkEarBase(D),half=E&&D.ear.t!='small'&&D.ear.t!='tuft'?Math.max(.03,E[0]-.012):q.rx*1.05;return {y:q.yc+q.f,half:Math.min(half,q.rx*1.05),q}}
// a head-hugging cap (coif, kerchief, skullcap): the skull rings pushed out, kept above yMin (and above the line yF at the front)
function fkCoif(B,D,col,o){o=o||{};const off=o.off||.008,z0=o.z0==null?D.SN[0][0]:o.z0,z1=o.z1==null?D.EYEP[2]-.02:o.z1,R=[];
  D.SN.forEach(q=>{if(q[0]>=z0-.001&&q[0]<=z1+.001)R.push({p:[0,q[1],q[0]],rx:q[2]+off,f:q[3]+off,b:q[4]+off,w:[['head',1]]})});
  if(R.length<2)return;mdLoft(B,R,{seg:20,ref:[0,1,0],capA:o.capA!==false,col:typeof col=='function'?col:col,keep:m=>m.y>(o.yMin||D.EYEP[1]+.01)+(o.tilt||0)*(m.z-z0)})}
// a soft beret / flat cap on the crown, sized between the ears; brim = peak length at the front
function fkBeret(k,D,col,o){o=o||{};const z=o.z==null?D.crownZ:o.z,c=fkCrown(D,z),r=Math.min(o.r||.09,c.half+.012),y=c.y+(o.dy||.004);
  k.p('head','sph2','c',col,0,y,z,r,o.h||.03,r*(o.d||1.05),o.tx||-.12,0,o.tz||0);k.p('head','sph2','c',mdSh(col,.8),0,y-.012,z,r*.92,.012,r*.97,o.tx||-.12,0,o.tz||0);
  if(o.peak){const pz=z+r*.8;k.p('head','sph2','c',mdSh(col,.75),0,y-.008,pz+.02,r*.8,.008,o.peak,-.2,0,0)}
  if(o.btn)k.p('head','sph','c',mdSh(col,.7),0,y+(o.h||.03)*.95,z,.008,.006,.008);return {y,r,z}}
// a broad-brimmed hat: crown + brim (the ears go through the brim)
function fkBrimHat(k,D,col,o){o=o||{};const z=o.z==null?D.crownZ:o.z,c=fkCrown(D,z),cr=Math.min(o.cr||.08,c.half+.01),y=c.y-(o.sink||.012);
  k.p('head','cyl','c',col,0,y+.002,z,o.brim||.2,.008,o.brim||.2,o.tx||-.05,0,o.tz||0);k.p('head','tor','c',mdSh(col,.92),0,y+(o.ch||.07)/2,z,cr,o.ch||.07,cr*1.05,o.tx||-.05,0,o.tz||0);
  k.p('head','cyl','c',o.band||mdSh(col,.55),0,y+.014,z,cr*1.03,.018,cr*1.08,o.tx||-.05,0,o.tz||0);return {y,cr,z}}
function fkBrimHatB(B,D,col,o){}
// a chef's toque
function fkToque(k,D,o){o=o||{};const z=o.z==null?D.crownZ:o.z,c=fkCrown(D,z),r=Math.min(.075,c.half+.006),y=c.y-.01;
  k.p('head','cyl','c',0xe8e2d6,0,y+.06,z-.005,r,.12,r,-.1,0,0);k.p('head','sph2','c',0xf0ece2,0,y+.13,z-.012,r*1.35,.055,r*1.35,-.1,0,0);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('head','sph2','c',0xf0ece2,Math.sin(a)*r*.9,y+.135,z-.012+Math.cos(a)*r*.9,r*.55,.045,r*.55)}
  k.p('head','cyl','c',0xd8d0c2,0,y+.012,z-.004,r*1.04,.026,r*1.04,-.1,0,0)}
// a tall pointed hat (narrow enough to stand between the ears), bent tip
function fkPointHat(k,D,col,o){o=o||{};const z=o.z==null?D.crownZ:o.z,c=fkCrown(D,z),r=Math.min(o.r||.085,c.half+.004),y=c.y-.016,h=o.h||.26;
  k.p('head','cyl','c',col,0,y+.004,z,o.brim||r*1.9,.008,o.brim||r*1.9,-.08,0,0);
  const P=[[0,y,z],[0,y+h*.45,z-.012],[0,y+h*.78,z-.04],[.02,y+h*.95,z-.09],[.05,y+h,z-.13]];fkPath(P,col,r,.006,k,'head',8);
  k.p('head','tor','c',o.band||mdSh(col,.6),0,y+.016,z,r*1.02,.022,r*1.02,-.08,0,0);if(o.star)k.p('head','oct','g',o.star,0,y+h*.3,z+r*.88,.014,.018,.006);return {y,r,z}}
// ---------------- outfits ----------------
var FKO={};
function fkOutfit(name,o,D,C){const f=FKO[name]||FKO.cit;return f(o,D,C)}
// the keepers: label → species (+ fur variant, scale)
FK137.out={'Stronghold Steward':{sp:'stag',fur:0},'Blacksmith':{sp:'bear',fur:0,sc:1.1},'Merchant':{sp:'raccoon',fur:0},'Magic Vendor':{sp:'lynx',fur:0},
  'Innkeeper':{sp:'boar',fur:0},'Cook':{sp:'otter',fur:0},'Alchemist':{sp:'goat',fur:0},'Stable Master':{sp:'ram',fur:0},
  'Curio Merchant':{sp:'fox',fur:0},'Wandering Merchant':{sp:'fox',fur:0},'Beast Trainer':{sp:'wolf',fur:0},'Bard':{sp:'hare',fur:2},'Traveling Bard':{sp:'hare',fur:2},'Rune Sage':{sp:'owl',fur:0}};
// a plain citizen: tunic + trousers from the npc colours, sometimes a skirt or dress, a hat or a kerchief
FKO.cit=function(o,D,C){const rb=mdC(o.robe||0x6a5a4a),tr=mdC(o.trim||mdSh(rb,.6)),h=fkHash(o.robe+'|'+o.trim+'|'+(o.fkV|0)),dress=(h>>>3)%4,legs=(h>>>6)%3?'long':'knee';
  return {paint(P){FKG.paint(P,C,{shirt:rb,sleeve:(h>>>9)%3==0?'short':'long',pants:mdSh(dress==3?rb:mdMix(rb,0x3a3028,.6),.8),legs,cuffs:tr,tunic:.5})},
    build(B,P){FKG.belt(B,P,.6,tr==rb?mdSh(rb,.5):tr,{h:.016});
      if(dress==1)FKG.skirt(B,P,{y0:.6,hem:th=>.42+.02*Math.cos(th),col:rb,flare:.03,lin:mdSh(rb,.6)});
      else if(dress==2)FKG.skirt(B,P,{y0:.6,hem:th=>.15+.02*Math.max(0,-Math.cos(th)),col:rb,flare:.05,lin:mdSh(rb,.6)});
      if(o.apron)FKG.apron(B,P,0xd8d0bc,{hem:.32,bib:dress!=2});
      if((h>>>12)%2)FKG.scarf(B,P,tr);else FKG.collar(B,P,mdSh(rb,.9),{h:th=>.995+.02*Math.max(0,-Math.cos(th)),flare:.012});
      const k=dkKit();FKG.pouch(k,P,.58,-.9,0x5a3a22,.8);
      const hat=o.hat||'';if(hat=='cap')fkBeret(k,D,mdC(o.hatC||0x3a2a1a),{peak:D.ear&&D.ear.t!='tri'&&D.ear.t!='long'?.05:0,btn:1});
      else if(hat=='chef'||hat=='hood')fkCoif(B,D,mdC(o.hatC||tr),{z1:D.EYEP[2]-.035,yMin:D.EYEP[1]+.03});
      else if(hat=='wiz')fkBeret(k,D,mdC(o.hatC||0x3a2a5a),{h:.04,btn:1});
      mdKit(B,k)}}};
