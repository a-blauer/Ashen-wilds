// ================= v177: armour grows more ornate with every tier =================
// Owner (Oct 30 2026): "I want all armor and weapons to look very cool and unique. Getting even more elaborate and ornate as you
// level up." Every helm, chest piece and pair of boots gets a tier layer on top of what it already has (its base shape, the v95
// trims, the v136 class details and the v137 motif), measured onto what is built, like the v137 motifs:
//   tier I    plain, worn gear: nothing added
//   tier II   rivets and stitched straps: the piece looks made, not grown
//   tier III  raised trim bands, a centre ridge, buckles, bone toggles, small studs on the helm
//   tier IV   filigree scrollwork, a gem, pauldron flanges and spikes, a crest
//   tier V    the full regalia: a crown of spikes or a tall collar behind the head, chains between the shoulders, glowing runes
// Each class reads differently: the Warrior brutal (jagged spikes, iron), the Paladin gothic-holy (fluted blades, gold, a halo of
// thin spikes), the Assassin sleek (blades, silver filigree, violet sigils), the Ranger a hunter (bone, antler, feathers, green
// charms), the Mage arcane (gold filigree, a tall collar, rune discs, blue light).
// All pieces are laid on the measured surface (a7Ring sections, the shoulder tops, the head top), ride the bone (or blended
// torso weights) of what is under them, and anything left loose is attached by gf176Snap afterwards.
var O176={on:1,
  // per class: trim metal by tier, accent cloth / leather, glow
  cls:{warrior:{T:[0x6a5a4a,0x6e7076,0x7a6a4a,0x8a8e96,0x9a7a4a],acc:0x4a1a14,gl:0xff5a1a,bone:0xc8bca0},
       paladin:{T:[0x7a6a50,0x9a8a60,0xb08a48,0xc8a050,0xd8b050],acc:0x5a1a1a,gl:0xffd890,bone:0xd8ccb0},
       assassin:{T:[0x4a4a50,0x6a6a72,0x8a8e98,0xa8aeb8,0xc0c6d0],acc:0x2a1a2e,gl:0xa060ff,bone:0xb8b0a0},
       ranger:{T:[0x5a4a38,0x6a5a40,0x7a6a48,0x9a7a4a,0xa88850],acc:0x3a2a1a,gl:0x7aff8a,bone:0xd0c4a4},
       mage:{T:[0x6a5a40,0x8a7a50,0xa88a48,0xc0a050,0xd8b858],acc:0x2a1e3a,gl:0x6ab8ff,bone:0xd0c8b8}}};
function o176C(d){const cls=BR.on&&BR.R&&BR.R.cls?BR.R.cls:({heavy:'warrior',medium:'ranger',light:'assassin',cloth:'mage'})[d.a]||'warrior',K=O176.cls[cls]||O176.cls.warrior,ti=Math.max(0,Math.min(4,d.ti|0));
  return {cls,ti,r:d.r|0,T:K.T[ti],T2:mdSh(K.T[ti],.7),acc:K.acc,bone:K.bone,gl:d.G!=null?d.G:(ti>=4||d.r>=3?K.gl:null),dk:0x16120e,steel:0x5a5e66,leather:0x3a2618}}
// ---------------- measuring, with a cache per build (sections are costly) ----------------
function o176Sec(B,key,fn){const M=B.__o176||(B.__o176={});return M[key]||(M[key]=fn())}
function o176TorsoS(B,P,y){y=Math.round(y/.006)*.006;return o176Sec(B,'t'+y.toFixed(3),()=>{const tf=(x,yy,z)=>{const q=mdTorsoAt(P,Math.max(.5,Math.min(1,yy)));return Math.abs(x)<q.rx+.07};return a7Ring(B,y,.012,A7X.torso,tf)})}
// points over the torso: [y, angle] → surface points (clearance clr)
function o176Path(B,P,yt,clr){const pts=yt.map(([y,th])=>{const S=o176TorsoS(B,P,y);return S.ok?S.at(th,clr).p:null}).filter(Boolean);
  // smoothed (ends kept): a line over straps and seams follows the armour's shape, not each bump of it; never pulled inward
  for(let it=0;it<3;it++)for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1],r0=Math.hypot(b[0],b[2]),m=[(a[0]+c[0])/2,(a[2]+c[2])/2],r1=Math.hypot(m[0],m[1]),r=Math.max(r0*.97,(r0+r1)/2),an=Math.atan2(b[0]*.5+m[0]*.5,b[2]*.5+m[1]*.5);
    pts[i]=[Math.sin(an)*r,b[1],Math.cos(an)*r]}
  return pts}
// a filigree scroll on the torso: a spiral from (y0, th0), turning `turns` times, radius r (m), mirrored by s; laid on the one section at
// its middle (so it is a clean curve), each point at its own height
function o176Scroll(B,P,y0,th0,r,turns,s,clr){const S=o176TorsoS(B,P,y0);if(!S.ok)return [];const R0=S.at(th0,0).r||.17,pts=[];
  for(let i=0;i<=22;i++){const t=i/22,rr=r*(1-t*.82),a=t*turns*Math.PI*2,q=S.at(th0+s*rr*Math.cos(a)/R0,clr);pts.push([q.p[0],y0+rr*Math.sin(a),q.p[2]])}return pts}
function o176Tube(k,bn,pts,r0,r1,col,t,wf,sides){if(pts.length>1){const n0=k.P.length;a7Tube(k,bn,pts,r0,r1,col,t||'m',wf,sides||4);gf176Group(k,n0)}}
function o176Stud(k,bn,p,n,r,col,t,w){const q=k.p(bn,'oct',t||'m',col,p[0]+n[0]*r*.3,p[1]+n[1]*r*.3,p[2]+n[2]*r*.3,r,r,r*.6,0,Math.atan2(n[0],n[2]),0);if(w)mdOW(k,w);return q}
// a spike from a surface point p along n (tilted by up)
function o176Spike(k,bn,p,n,len,r,col,w,t){const tip=[p[0]+n[0]*len,p[1]+n[1]*len,p[2]+n[2]*len];k.L(bn,t||'m',col,[p[0]-n[0]*.004,p[1]-n[1]*.004,p[2]-n[2]*.004],tip,r,r*.06,5);if(w)mdOW(k,w)}
// ---------------- chest ----------------
function o176Chest(B,P,d){const C=o176C(d),ti=C.ti;if(ti<1)return;const k=dkKit(),cls=C.cls,a=d.a,W=A7W,T=C.T;
  const S=y=>o176TorsoS(B,P,y),ring=(y,th0,th1,n,clr)=>{const s=S(y);if(!s.ok)return [];const o=[];for(let i=0;i<=n;i++){const th=th0+(th1-th0)*i/n,q=s.at(th,clr);o.push(q)}return o};
  const sh=s=>{const t=a7ShTop(B,s);return t?{p:t,bn:s<0?'aL0':'aR0'}:null};
  const metal=a=='heavy'||a=='light'?'m':'m';
  // ---- tier II: rivets / stitching rows at the collar and the hem of the piece ----
  if(a=='heavy'){[.955,.645].forEach((y,j)=>ring(y,-2.9,2.9,18+ti*2,.002).forEach((q,i)=>{if(i%2==j%2||ti>=2)o176Stud(k,'chest',q.p,q.n,.0065,T,'m',W(q.p))}))}
  else if(a=='medium'||a=='light'){const lt=a=='light'?0x1e1a1e:C.leather;[-1,1].forEach(s=>{const pts=o176Path(B,P,[[.97,s*.55],[.9,s*.3],[.82,s*.05],[.74,-s*.2],[.66,-s*.4]],.006);o176Tube(k,'chest',pts,.0075,.0075,lt,'c',W,4);
      const q=pts[2];if(q)o176Stud(k,'chest',q,[q[0],0,q[2]].map(v=>v/Math.hypot(q[0],q[2])),.011,T,'m',W(q))})}
  else{// cloth: an embroidered stole down the front, both sides
    [-1,1].forEach(s=>{const pts=o176Path(B,P,[[.98,s*.38],[.92,s*.3],[.84,s*.26],[.76,s*.24],[.68,s*.24],[.62,s*.24]],.006);o176Tube(k,'chest',pts,.012,.012,C.acc,'c',W,4);if(ti>=2)o176Tube(k,'chest',pts.map(p=>[p[0],p[1],p[2]+.004]),.004,.004,T,'m',W,4)})}
  if(ti<2){if(k.P.length)mdKit(B,k);return}
  // ---- tier III: trim bands and a centre ridge; class marks ----
  if(a=='heavy'){[.95,.65].forEach(y=>{const R=ring(y,-3.1,3.1,30,.004);o176Tube(k,'chest',R.map(q=>q.p),.0055,.0055,T,'m',W,4)});
    o176Tube(k,'chest',o176Path(B,P,[[.94,0],[.88,0],[.82,0],[.76,0],[.7,0],[.66,0]],.004),.007,.004,mdSh(T,.9),'m',W,4)}
  else if(a=='cloth'){// a clasp chain across the chest between two gem clasps
    const L=o176Path(B,P,[[.93,-.42],[.9,-.2],[.89,0],[.9,.2],[.93,.42]],.012);gkChain(k,'chest',L,.006,T,W);[L[0],L[L.length-1]].forEach(p=>{if(p){o176Stud(k,'chest',p,[p[0],0,p[2]].map(v=>v/Math.hypot(p[0],p[2])),.016,T,'m',W(p));k.p('chest','oct',C.gl?'g':'c',C.gl||C.acc,p[0]*1.04,p[1],p[2]*1.04,.008);mdOW(k,W(p))}})}
  else if(a=='medium'){// bone toggles and claws along the collar
    ring(.94,-1.2,1.2,8,.008).forEach((q,i)=>{const p=q.p;if(i%2)k.L('chest','c',C.bone,p,[p[0]+q.n[0]*.01,p[1]-.03,p[2]+q.n[2]*.01],.006,.0008,4);else k.p('chest','cyl','c',C.bone,p[0],p[1],p[2],.006,.026,.006,0,0,Math.PI/2);mdOW(k,W(p))})}
  else{// light: throwing knives in a bandolier over the right breast
    const L=o176Path(B,P,[[.95,.5],[.88,.32],[.8,.16],[.72,0]],.01);L.forEach((p,i)=>{if(!i)return;const n=[p[0],0,p[2]],l=Math.hypot(n[0],n[2])||1;a7Put(k,'chest',p,[n[0]/l,0,n[2]/l],[0,1,0],.8,t=>l7Knife(t,1,0x9aa2ae,0x1a1418),W(p))})}
  if(ti<3){if(k.P.length)mdKit(B,k);return}
  // ---- tier IV: filigree, a gem at the breast, shoulder flanges ----
  const fil=cls=='ranger'?C.bone:T,fr=a=='light'?.0028:.0035;
  [-1,1].forEach(s=>{o176Tube(k,'chest',o176Scroll(B,P,.86,s*.16,.045,1.15,s,.004),fr,fr*.7,fil,cls=='ranger'?'c':'m',W,4);o176Tube(k,'chest',o176Scroll(B,P,.75,s*.2,.035,1.05,-s,.004),fr,fr*.7,fil,cls=='ranger'?'c':'m',W,4)});
  {const q=S(.84);if(q.ok){const at=q.at(0,.006);a7Put(k,'chest',at.p,at.n,[0,1,0],1,t=>{t.p('','oct','m',T,0,0,.004,.026,.032,.01);t.p('','oct',C.gl?'g':'m',C.gl||mdSh(C.acc,1.6),0,0,.011,.013,.017,.008);
      for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;t.p('','cone4','m',T,Math.cos(a)*.026,Math.sin(a)*.026,.004,.006,.02,.004,0,0,a-Math.PI/2)}},W(at.p))}}
  [-1,1].forEach(s=>{const q=sh(s);if(!q)return;const w=[[q.bn,1]];
    if(cls=='warrior')for(let i=0;i<3;i++)o176Spike(k,q.bn,[q.p[0]+s*(.02+i*.02),q.p[1]-i*.012,q.p[2]-.03+i*.03],[s*.45,.9,(i-1)*.15],.05+ti*.01-i*.008,.011,mdSh(T,.85),w);
    else if(cls=='paladin')for(let i=0;i<5;i++){const a=-.6+i*.3;k.p(q.bn,'cone4','m',i%2?T:mdSh(T,.8),q.p[0]+s*.01,q.p[1]+.03,q.p[2]+Math.sin(a)*.05,.008,.07-Math.abs(i-2)*.012,.016,a*.6,0,-s*.35);mdOW(k,w)}
    else if(cls=='assassin')for(let i=0;i<3;i++){k.L(q.bn,'m',0x9aa2ae,[q.p[0],q.p[1],q.p[2]-.03+i*.03],[q.p[0]+s*.05,q.p[1]+.03-i*.006,q.p[2]-.05+i*.04],.006,.0006,4);mdOW(k,w)}
    else if(cls=='ranger'){for(let i=0;i<2;i++){const b=[q.p[0]+s*.01,q.p[1],q.p[2]-.02+i*.04];k.L(q.bn,'c',C.bone,b,[b[0]+s*.03,b[1]+.05,b[2]+(i-.5)*.03],.007,.003,5);k.L(q.bn,'c',C.bone,[b[0]+s*.03,b[1]+.05,b[2]+(i-.5)*.03],[b[0]+s*.055,b[1]+.07,b[2]+(i-.5)*.05],.004,.001,4)}mdOW(k,w)}
    else{// mage: a rune disc on each shoulder
      a7Put(k,q.bn,[q.p[0],q.p[1]+.002,q.p[2]],[s*.35,1,0],[0,0,1],1,t=>l7Rune(t,1,C.gl||0x6ab8ff,T),w)}});
  if(ti<4){if(k.P.length)mdKit(B,k);return}
  // ---- tier V: the regalia ----
  const top=S(.975);
  if(cls=='warrior'&&top.ok){// a crown of jagged spikes round the back of the collar, chains between the pauldrons
    for(let i=0;i<9;i++){const th=Math.PI+(i-4)*.32,q=top.at(th,.004),len=.06+(4-Math.abs(i-4))*.012;o176Spike(k,'chest',q.p,[q.n[0]*.5,1,q.n[2]*.5].map(v=>v/Math.hypot(q.n[0]*.5,1,q.n[2]*.5)),len,.012,i%2?T:mdSh(T,.7),W(q.p))}}
  else if(cls=='paladin'&&top.ok){// a gothic halo of thin gilded blades fanning up behind the head
    for(let i=0;i<11;i++){const th=Math.PI+(i-5)*.26,q=top.at(th,.004),up=1.2,dir=[q.n[0]*.25,up,q.n[2]*.25-.12],l=Math.hypot(...dir);o176Spike(k,'chest',q.p,dir.map(v=>v/l),.09+(5-Math.abs(i-5))*.016,.008,i%2?T:mdSh(T,1.1),W(q.p))}
}
  else if(cls=='mage'&&top.ok){// a tall standing collar of tapering plates behind the head
    for(let i=0;i<7;i++){const th=Math.PI+(i-3)*.36,q=top.at(th,.003),h=.1+(3-Math.abs(i-3))*.025;a7Put(k,'chest',q.p,[q.n[0],0,q.n[2]],[0,1,0],1,t=>{t.p('','cone4','c',C.acc,0,h/2,0,.03,h,.006,0,Math.PI/4,0);t.L('','m',T,[0,0,.006],[0,h*.95,.003],.0035,.001,4)},W(q.p))}}
  else if(cls=='assassin'&&top.ok){// a high blade collar at the back
    for(let i=0;i<7;i++){const th=Math.PI+(i-3)*.3,q=top.at(th,.004);o176Spike(k,'chest',q.p,[q.n[0]*.35,1,q.n[2]*.35].map(v=>v/Math.hypot(q.n[0]*.35,1,q.n[2]*.35)),.05+(3-Math.abs(i-3))*.012,.007,0x9aa2ae,W(q.p))}}
  else if(cls=='ranger'&&top.ok){// a mantle of dark feathers round the back of the shoulders
    for(let i=0;i<13;i++){const th=Math.PI+(i-6)*.24,q=top.at(th,.006);gkFeather(k,'chest',q.p,[q.n[0]*.6,-1,q.n[2]*.6],.1+(i%3)*.02,.016,i%2?0x2a2622:0x3a3028,W(q.p))}}
  // chains slung between the shoulders with a medallion (all but the ranger and assassin, who wear charms / a sigil)
  if(cls=='warrior'||cls=='paladin'||cls=='mage'){const L=o176Path(B,P,[[.96,-.62],[.9,-.42],[.86,-.2],[.845,0],[.86,.2],[.9,.42],[.96,.62]],.016);gkChain(k,'chest',L,.006,T,W)}
  else if(cls=='assassin'){const q=S(.8);if(q.ok){const at=q.at(-.3,.006);a7Put(k,'chest',at.p,at.n,[0,1,0],1.1,t=>l7Rune(t,1,C.gl||0xa060ff,T),W(at.p))}}
  else{const L=o176Path(B,P,[[.96,-.5],[.9,-.3],[.86,-.05],[.87,.2],[.92,.45]],.014);o176Tube(k,'chest',L,.003,.003,0x2a1e14,'c',W,3);[1,3].forEach(i=>{const p=L[i];if(p)gkVial(k,'chest',p[0]*1.06,p[1]-.03,p[2]*1.06,1,C.gl||0x7aff8a,T,W(p))})}
  if(C.gl){// glowing runes along the trims
    [-1,1].forEach(s=>o176Tube(k,'chest',o176Path(B,P,[[.93,s*.12],[.86,s*.1],[.79,s*.1],[.72,s*.12]],.009),.0022,.0022,C.gl,'g',W,3))}
  if(k.P.length)mdKit(B,k)}
// ---------------- helm ----------------
// the head is measured by rays from the middle of the skull: dir(th, ph) (th = 0 forward, π/2 the hero's right; ph = up from level)
// hits the outermost surface built there by the helm (and what came after it: hood, hat), never the animal's own head (a circlet
// leaves most of the head bare: rays that miss the band find no spot); a hit in an ear is no spot
function o176HeadTris(B,c,n0){return o176Sec(B,'htri',()=>{const T=[];for(const t in B.L){const L=B.L[t].p;for(let i=(n0&&n0[t])||0;i+8<L.length;i+=9){const x=(L[i]+L[i+3]+L[i+6])/3-c[0],y=(L[i+1]+L[i+4]+L[i+7])/3-c[1],z=(L[i+2]+L[i+5]+L[i+8])/3-c[2];if(x*x+y*y+z*z<.09)T.push(L.slice(i,i+9))}}return T})}
function o176HeadAt(B,c,th,ph,clr,ear,n0){const d=[Math.sin(th)*Math.cos(ph),Math.sin(ph),Math.cos(th)*Math.cos(ph)];let best=-1;for(const t of o176HeadTris(B,c,n0)){const h=gf176Ray(c,d,t);if(h>best&&h<.26)best=h}
  if(best<=0)return null;const p=[c[0]+d[0]*(best+(clr||0)),c[1]+d[1]*(best+(clr||0)),c[2]+d[2]*(best+(clr||0))];if(ear&&ear(p))return null;return {p,n:d}}
function o176Helm(B,P,d,n0){const C=o176C(d),ti=C.ti;if(ti<1)return;
  // circlets, diadems and crowns are jewellery already: they stay as they are (studs on them would sit on the bare head)
  if(['circlet','diadem','crown'].includes(d.st))return;
  // the raven's nape feathers lie over the back of anything on his head: nothing goes behind the ears' line there
  const rv=BR.on&&BR.R&&BR.R.key=='raven',back=th=>rv&&Math.cos(th)<.2;const H=a7Head(B);if(!H)return;const k=dkKit(),cls=C.cls,a=d.a,T=C.T,hw=[['head',1]],D=BR.on&&BR.R;
  const ear=p=>D&&D.earE&&brEarIn(D,p[0],p[1],p[2],[1.6,1.45,2.6]),c=[0,H.y-.085,H.top[2]+.015],at=(th,ph,clr)=>back(th)&&ph<1.2?null:o176HeadAt(B,c,th,ph,clr,ear,n0);
  // a line of spots round the head at one elevation (runs broken where an ear is)
  const band=(ph,th0,th1,n,clr)=>{const R=[];let cur=[];for(let i=0;i<=n;i++){const q=at(th0+(th1-th0)*i/n,ph,clr);if(q)cur.push(q);else{if(cur.length>1)R.push(cur);cur=[]}}if(cur.length>1)R.push(cur);return R};
  // (the raven: his cheek and nape feathers cover the low band, the studs and the temple filigree; he keeps the gem, crest and crown)
  const studs=rv?[]:band(.32,-2.7,2.7,18,.002);studs.forEach(R=>R.forEach((q,i)=>{if(i%2==0||ti>=2)o176Stud(k,'head',q.p,q.n,.0055,T,'m',hw)}));
  if(ti>=2&&!rv){band(.42,-2.9,2.9,30,.004).forEach(R=>o176Tube(k,'head',R.map(q=>q.p),.0045,.0045,T,'m',null,4));
    // a ridge over the crown, front to back
    if(a=='heavy'||a=='light'){const L=[];for(let i=0;i<=10;i++){const q=at(0,.5+i*.2,.002);if(q)L.push(q.p)}o176Tube(k,'head',L,.006,.004,mdSh(T,.9),'m',null,4)}}
  if(ti>=3){// filigree at the temples and a brow gem
    if(!rv)[-1,1].forEach(s=>{const pts=[];for(let i=0;i<=14;i++){const t=i/14,r=.32*(1-t*.8),an=t*2.2*Math.PI,q=at(s*(1.5+r*Math.cos(an)),.2+r*Math.sin(an)*.8,.003);if(q)pts.push(q.p)}o176Tube(k,'head',pts,.003,.002,cls=='ranger'?C.bone:T,cls=='ranger'?'c':'m',null,4)});
    {const q=rv?null:at(0,.62,.004);if(q)a7Put(k,'head',q.p,q.n,[0,1,0],.9,t=>{t.p('','oct','m',T,0,0,.004,.02,.026,.008);t.p('','oct',C.gl?'g':'m',C.gl||mdSh(C.acc,1.7),0,0,.009,.01,.014,.006)},hw)}
    // class crest
    [-1,1].forEach(s=>{const q=at(s*1.65,.55,.002);if(!q)return;const p=q.p,o=[p[0]+s*.004,p[1],p[2]];
      if(cls=='warrior'){k.L('head','c',C.bone,o,[p[0]+s*.05,p[1]+.035,p[2]-.01],.012,.008,5);k.L('head','c',C.bone,[p[0]+s*.05,p[1]+.035,p[2]-.01],[p[0]+s*.06,p[1]+.1,p[2]+.01],.008,.001,5)}
      else if(cls=='paladin'){for(let i=0;i<4;i++){k.p('head','cone4','m',i%2?T:mdSh(T,.8),p[0]+s*.008,p[1]+.02+i*.006,p[2]-.01-i*.014,.006,.06-i*.008,.014,-.5-i*.2,0,-s*.5);mdOW(k,hw)}}
      else if(cls=='ranger'){k.L('head','c',C.bone,o,[p[0]+s*.03,p[1]+.06,p[2]-.02],.008,.005,5);k.L('head','c',C.bone,[p[0]+s*.03,p[1]+.06,p[2]-.02],[p[0]+s*.06,p[1]+.1,p[2]-.05],.005,.001,4);k.L('head','c',C.bone,[p[0]+s*.03,p[1]+.06,p[2]-.02],[p[0]+s*.015,p[1]+.1,p[2]],.004,.001,4)}
      else if(cls=='assassin'){k.L('head','m',0x9aa2ae,o,[p[0]+s*.03,p[1]+.045,p[2]-.03],.006,.0006,4)}
      else{k.p('head','oct',C.gl?'g':'m',C.gl||T,p[0],p[1],p[2],.008,.012,.006);mdOW(k,hw)}});
    if(cls=='assassin')for(let i=0;i<3;i++){const q=at(Math.PI,.9+i*.2,.002);if(q)k.L('head','m',0x9aa2ae,q.p,[q.p[0],q.p[1]+.035,q.p[2]-.025],.006,.0006,4)}}
  if(ti>=4){// the crown: spikes standing on the band round the back half of the head
    const n=cls=='warrior'?7:cls=='paladin'?11:9,sp=cls=='warrior'?.36:.26;
    for(let i=0;i<n;i++){const th=Math.PI+(i-(n-1)/2)*sp,q=at(th,cls=='mage'||cls=='paladin'?.5:.42,.003);if(!q)continue;const len=(cls=='warrior'?.07:.06)+((n-1)/2-Math.abs(i-(n-1)/2))*.012,dir=[q.n[0]*.35,1,q.n[2]*.35],l=Math.hypot(...dir);
      o176Spike(k,'head',q.p,dir.map(v=>v/l),len,cls=='warrior'?.011:.007,i%2?T:mdSh(T,cls=='paladin'?1.1:.75),null,cls=='ranger'?'c':'m')}
    if(C.gl&&cls!='warrior'){const q=at(Math.PI,.9,.004);if(q){k.p('head','oct','g',C.gl,q.p[0],q.p[1]+.01,q.p[2],.01,.016,.006);mdOW(k,hw)}}
    if(cls=='ranger')for(let i=0;i<5;i++){const q=at(Math.PI+(i-2)*.3,.25,.004);if(q)gkFeather(k,'head',q.p,[q.n[0]*.4,-.6,q.n[2]-.4],.09,.014,i%2?0x2a2622:0x4a3a2a,null)}}
  if(k.P.length)mdKit(B,k)}
// ---------------- boots ----------------
function o176Boots(B,P,d,R){const C=o176C(d),ti=C.ti;if(ti<1)return;const k=dkKit(),cls=C.cls,a=d.a,T=C.T;
  let top=.32;const Lc={'-1':[0,0,0],'1':[0,0,0]};if(R){const p=a7PtsR(B,-1,.6,R);let m=0;for(let i=0;i<p.length;i+=3){m=Math.max(m,p[i+1]);const q=Lc[p[i]<0?'-1':'1'];q[0]+=p[i];q[1]+=p[i+2];q[2]++}if(m>.08)top=m}
  if(BR.on&&BR.R&&BR.R.key=='raven')top=Math.min(top,.2);
  [-1,1].forEach(s=>{const q0=Lc[s<0?'-1':'1'],cx=q0[2]?q0[0]/q0[2]:s*.09,cz=q0[2]?q0[1]/q0[2]:.02,side=(x,yy,z)=>s*x>0&&(x-cx)*(x-cx)+(z-cz)*(z-cz)<.0144,bn=s<0?'lh1':'rh1',
    Sx=(y,h)=>o176Sec(B,'b'+s+y.toFixed(3),()=>R?a7RingP(a7PtsR(B,y-(h||.015),y+(h||.015),R),y,side):a7Ring(B,y,h||.015,s<0?A7X.legL:A7X.legR,side)),nw=p=>a7NearW(B,p),Y=y=>y*top/.32;
    const cuff=Sx(top-.025);if(!cuff.ok)return;
    // tier II: studs round the cuff
    for(let i=0;i<10;i++){const at=cuff.at(i/10*Math.PI*2,.002);if(i%2==0||ti>=2)o176Stud(k,bn,at.p,at.n,.0055,T,'m',nw(at.p))}
    if(ti>=2){const R2=[];for(let i=0;i<=20;i++)R2.push(cuff.at(i/20*Math.PI*2,.004).p);o176Tube(k,bn,R2,.0045,.0045,T,'m',nw,4);
      const an=Sx(Y(.07));if(an.ok){const R3=[];for(let i=0;i<=16;i++)R3.push(an.at(i/16*Math.PI*2,.004).p);o176Tube(k,bn,R3,a=='cloth'?.003:.004,a=='cloth'?.003:.004,a=='heavy'?T:C.leather,a=='heavy'?'m':'c',nw,4)}}
    if(ti>=3){// a shin plate / bone splint with filigree, by class
      const pts=[];for(let i=0;i<=10;i++){const y=Y(.1)+(top-.05-Y(.1))*i/10,q=Sx(y);if(q.ok)pts.push(q.at(Math.sin(i*1.4)*.25,.005).p)}o176Tube(k,bn,pts,.0035,.0025,cls=='ranger'?C.bone:T,cls=='ranger'?'c':'m',nw,4);
      const kq=Sx(top-.06);if(kq.ok){const at=kq.at(0,.004);a7Put(k,bn,at.p,at.n,[0,1,0],.8,t=>{t.p('','oct','m',T,0,0,.004,.02,.026,.008);t.p('','oct',C.gl?'g':'m',C.gl||mdSh(C.acc,1.7),0,0,.009,.009,.012,.005)},nw(at.p))}}
    if(ti>=4){// spikes / blades / claws at the cuff
      const n=cls=='paladin'?5:3;for(let i=0;i<n;i++){const th=(i-(n-1)/2)*.45,at=cuff.at(th,.003),dir=[at.n[0],.55,at.n[2]],l=Math.hypot(...dir);
        if(cls=='ranger')k.L(bn,'c',C.bone,at.p,[at.p[0]+at.n[0]*.03,at.p[1]+.03,at.p[2]+at.n[2]*.03],.006,.0008,4),mdOW(k,nw(at.p));else o176Spike(k,bn,at.p,dir.map(v=>v/l),cls=='warrior'?.05:.035,cls=='warrior'?.01:.006,i%2?T:mdSh(T,.8),nw(at.p),'m')}
      if(cls=='ranger'){for(let i=0;i<8;i++){const at=cuff.at(Math.PI*.4+i*.3,.006);gkFeather(k,bn,at.p,[at.n[0]*.5,-1,at.n[2]*.5],.05,.01,i%2?0x2a2622:0x4a3a2a,nw(at.p))}}}});
  if(k.P.length)mdKit(B,k)}
// ---------------- hooks: after the piece (in a hero, after everything: gkLater) ----------------
{const c=mdChest,h=mdHelm,b=mdBoots,run=(fn,B,P,d,x)=>{if(!O176.on||!d||!MD_ORN||!(BR.on&&BR.R))return;const o=GL176.ti;GL176.ti=d.ti|0;try{gkLater(B,B2=>{try{fn(B2,P,d,x)}catch(e){console.warn('v177 ornate',e)}})}finally{GL176.ti=o}};
  mdChest=function(B,P,d){const r=c.apply(this,arguments);run(o176Chest,B,P,d);return r};
  mdHelm=function(B,P,d){const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;const r=h.apply(this,arguments);run(o176Helm,B,P,d,n0);return r};
  mdBoots=function(B,P,d){const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;const r=b.apply(this,arguments);const n1={};for(const t in B.L)n1[t]=B.L[t].p.length;
    // the class outfit's boots (no item) stay plain
    if(d&&d.key)run(o176Boots,B,P,d,{n0,n1});return r}}
