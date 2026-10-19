// ================= v89 world: bigger zones, themed decorations, old-layout saves =================
// The zone layout itself is in w0_world.js (v97: PMS=1.82, zones 473x491, 8 camps each) and build/pN_world.py (W/H);
// the v97 changes (ground textures, dungeons, realm, mob count) are in build/pN_world2.py and zzN_world2.js.
// Decorations: wdDeco() runs at load just before buildVI() (it is a hoisted function, so nothing here may rely on module-level
// vars being set yet). It places themed props per zone into WD.list and their collider tiles into WDCOL (CBLK starts from it).
// wdBuild() runs right after buildVI(): it builds one InstancedMesh per part per 64x64 chunk and hands the chunks to chunkVis
// (far props in c.ms, small ones in c.ns so they only draw within NEARR). Placement is seeded, so co-op partners agree.
var WD,WDCOL;
function wdDeco(){const T0=performance.now();
  const {fin,tr,merge}=NK,G=THREE;let SD=500;
  const C=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
  // painter: base colour shaded by height and face noise; o.top paints upward faces (snow, moss), o.lo/o.hi the gradient
  const P=(hex,o)=>{const c=C(hex),t=o&&o.top!=null?C(o.top):null,lo=o&&o.lo!=null?o.lo:.72,hi=o&&o.hi!=null?o.hi:.38,tt=o&&o.tt!=null?o.tt:.55;
    return (h,ny,r)=>{if(t&&ny>tt){const v=.9+.2*r;return [t[0]*v,t[1]*v,t[2]*v]}let v=(lo+hi*h)*(.84+.32*r);if(ny<-.35)v*=.6;return [c[0]*v,c[1]*v,c[2]*v]}};
  // F(geometry, colour, options, x,y,z, rx,ry,rz, [sx,sy,sz]) -> painted, placed part
  const F=(g,hex,o,x,y,z,rx,ry,rz,s)=>fin(tr(g,x,y,z,rx,ry,rz,s),{j:(o&&o.j)||0,jy:o&&o.jy,sd:SD++,f:o&&o.f,paint:P(hex,o)});
  const cyl=(a,b,h,n)=>new G.CylinderGeometry(a,b,h,n||6,1),box=(w,h,d)=>new G.BoxGeometry(w,h,d),ico=(r,d)=>new G.IcosahedronGeometry(r,d||0),
    dod=r=>new G.DodecahedronGeometry(r,0),cone=(r,h,n)=>new G.ConeGeometry(r,h,n||6,1),oct=r=>new G.OctahedronGeometry(r,0),
    tor=(R,t,arc,n)=>new G.TorusGeometry(R,t,4,n||8,arc||Math.PI),dome=(r,n)=>new G.SphereGeometry(r,n||7,3,0,Math.PI*2,0,Math.PI/2),
    disc=(r,n)=>new G.CircleGeometry(r,n||8),pln=(w,h)=>new G.PlaneGeometry(w,h);
  const M=a=>merge(a.filter(Boolean));
  // ---------- shared shapes ----------
  const twig=(x,y,z,len,rz,ry,hex,th)=>F(cyl(th*.4,th,len,4),hex,{j:.02},0,len/2,0,0,0,0).rotateZ(rz).rotateY(ry).translate(x,y,z);
  const deadTree=(bark,moss,o)=>{o=o||{};const p=[F(cyl(.09,.24,2.6,6),bark,{j:.05,lo:.6,hi:.4,f:(x,y,z)=>{const a=y*.9;return [x*Math.cos(a)-z*Math.sin(a)+y*y*.05,y,x*Math.sin(a)+z*Math.cos(a)]}},0,1.3,0)];
    [[.9,2.1,.3],[-.8,1.7,2.4],[.7,2.4,4.1],[-.5,2.6,5.3]].forEach(([s,y,a])=>{p.push(twig(0,y,0,1.1,s,a,bark,.06));p.push(twig(Math.cos(a)*s*.45,y+.45,-Math.sin(a)*s*.45,.6,s*1.3,a+.6,bark,.035))});
    p.push(F(cyl(.25,.38,.25,6),bark,{j:.04},0,.1,0));
    if(moss)[[.35,2.0,.2],[-.32,1.65,2.5],[.3,2.35,4],[-.2,2.55,5.2],[.1,2.6,1.2]].forEach(([s,y,a],i)=>{const L=.6+i%3*.25;p.push(F(cone(.07,L,4),moss,{j:.03,lo:.9,hi:.3},Math.cos(a)*s*1.5,y-L/2+.1,-Math.sin(a)*s*1.5,Math.PI))});
    if(o.snow)p.push(F(dome(.3,6),0xf4f8ff,{j:.04},0,2.62,0,0,0,0,[1,.4,1]));return M(p)};
  const rockG=(hex,top,sx,sy,sd)=>F(dod(1),hex,{j:.25,top,tt:.5},0,sy*.55,0,0,sd||0,0,[sx,sy,sx*.85]);
  const stump=(bark,inner)=>M([F(cyl(.3,.4,.5,7),bark,{j:.05},0,.25,0),F(disc(.29,7),inner,{lo:1,hi:0},0,.505,0,-Math.PI/2),F(cyl(.06,.12,.5,4),bark,{},.35,.12,0,0,0,1.2),F(cyl(.05,.1,.4,4),bark,{},-.3,.1,.15,0,0,-1.3)]);
  const logG=(bark,moss)=>M([F(cyl(.28,.32,2.6,7),bark,{j:.05,top:moss,tt:.6},0,.26,0,0,0,Math.PI/2),F(disc(.27,7),0x8a6a48,{lo:1,hi:0},1.31,.26,0,0,Math.PI/2),F(cyl(.08,.1,.5,4),bark,{},.4,.5,.1,.6,0,.4)]);
  const bonesRib=(c)=>{const p=[F(cyl(.07,.07,3,5),c,{j:.02},0,.25,0,0,0,Math.PI/2)];for(let i=0;i<6;i++){const x=-1.1+i*.42,R=.75-Math.abs(i-2)*.08;p.push(F(tor(R,.05,Math.PI*.9,6),c,{},x,.2,0,0,Math.PI/2,0));}
    p.push(F(ico(.3,0),c,{j:.05},1.75,.3,0,0,0,0,[1.3,.9,.9]),F(cone(.05,.5,4),c,{},1.9,.65,.18,.5,0,-.6),F(cone(.05,.5,4),c,{},1.9,.65,-.18,-.5,0,-.6));return M(p)};
  const skull=c=>M([F(ico(.22,0),c,{j:.04},0,.18,0,0,0,0,[1.2,.9,1]),F(box(.2,.1,.18),c,{},.2,.08,0),F(cone(.04,.4,4),c,{},-.05,.35,.18,.7,0,.3),F(cone(.04,.4,4),c,{},-.05,.35,-.18,-.7,0,.3),F(cyl(.03,.03,.4,4),c,{},-.3,.04,.1,0,.6,Math.PI/2)]);
  const pillarG=(hex,h,top)=>M([F(cyl(.36,.4,h,7),hex,{j:.05,top,tt:.6,f:(x,y,z)=>y>h-.01?[x,y-((x*7+z*13)%1+1)%1*.4,z]:[x,y,z]},0,h/2,0),F(cyl(.5,.55,.3,7),hex,{j:.04},0,.15,0),F(cyl(.32,.36,.5,7),hex,{j:.06},.9,.25,.3,0,.4,Math.PI/2)]);
  const wallG=(hex,top,len,hh)=>{const p=[];for(let i=0;i<4;i++){const w=len/4,h0=hh*(.55+((i*37)%10)/22);p.push(F(box(w*.98,h0,.7),hex,{j:.08,top,tt:.6},-len/2+w*(i+.5),h0/2,0))}
    p.push(F(box(.6,.4,.5),hex,{j:.1},len*.4,.2,.8,0,.5,0),F(box(.5,.35,.45),hex,{j:.1},-len*.3,.17,-.85,0,1.1,0));return M(p)};
  const grave=(hex,lean)=>M([F(box(.42,.6,.12),hex,{j:.03},0,.28,0,lean,0,lean*.5),F(cyl(.21,.21,.12,6,1),hex,{},0,.6,0,Math.PI/2,0,0,[1,1,1]),F(box(.55,.08,.8),0x3a3428,{j:.04},0,.04,.42)]);
  const crossG=(hex)=>M([F(box(.12,1.1,.1),hex,{j:.02},0,.55,0),F(box(.6,.12,.1),hex,{j:.02},0,.82,0),F(dome(.35,6),0x3e3428,{j:.06},0,0,.5,0,0,0,[1,.35,1.6])]);
  const fenceG=(wood)=>M([F(box(.12,.95,.12),wood,{j:.02},-1.15,.47,0),F(box(.12,.85,.12),wood,{j:.02},1.15,.42,0),F(box(2.5,.1,.06),wood,{j:.02},0,.7,0,0,0,.03),F(box(2.5,.1,.06),wood,{j:.02},0,.38,0,0,0,-.04)]);
  const ironFence=()=>{const p=[F(box(2.4,.08,.06),0x2a2a30,{},0,.9,0),F(box(2.4,.08,.06),0x2a2a30,{},0,.3,0)];for(let i=0;i<7;i++){p.push(F(box(.05,1.1,.05),0x2a2a30,{},-1.1+i*.367,.55,0),F(cone(.06,.18,4),0x3a3a40,{},-1.1+i*.367,1.18,0))}return M(p)};
  const reeds=(st,hd)=>{const p=[];for(let i=0;i<9;i++){const a=i*2.4,r=.1+(i%3)*.12,h=.8+((i*53)%10)/14;p.push(F(cyl(.012,.025,h,3),st,{},Math.cos(a)*r,h/2,Math.sin(a)*r,(i%2-.5)*.25,0,(i%3-1)*.2));if(i%3==0)p.push(F(cyl(.04,.04,.22,5),hd,{},Math.cos(a)*r,h-.05,Math.sin(a)*r,(i%2-.5)*.25,0,(i%3-1)*.2))}
    for(let i=0;i<5;i++){const a=i*1.3;p.push(F(cone(.05,.9,3),st,{lo:.6},Math.cos(a)*.15,.4,Math.sin(a)*.15,Math.cos(a)*.35,0,Math.sin(a)*.35))}return M(p)};
  const fern=(c)=>{const p=[];for(let i=0;i<7;i++){const a=i/7*6.283;p.push(F(cone(.13,.9,3),c,{lo:.55,hi:.6},0,.45,0,0,0,0,[1,1,.25]).rotateZ(1.05).rotateY(a))}return M(p)};
  const flowers=(cols)=>{const p=[];for(let i=0;i<11;i++){const a=i*2.39,r=.15+Math.sqrt(i)*.18,h=.22+((i*31)%10)/40,x=Math.cos(a)*r,z=Math.sin(a)*r;p.push(F(cyl(.01,.014,h,3),0x3a6a2a,{},x,h/2,z),F(disc(.07,5),cols[i%cols.length],{lo:1,hi:0},x,h,z,-Math.PI/2),F(oct(.025),0xffe070,{lo:1,hi:0},x,h+.015,z))}return M(p)};
  const tallGrass=(c)=>{const p=[];for(let i=0;i<10;i++){const a=i*2.1,r=.08+(i%4)*.09,h=.6+((i*41)%10)/18;p.push(F(cone(.05,h,3),c,{lo:.5,hi:.7},Math.cos(a)*r,h/2,Math.sin(a)*r,0,a,.25+(i%3)*.08))}return M(p)};
  const shrub=(c,sd)=>{const p=[];for(let i=0;i<8;i++){const a=i*.8+sd,l=.35+(i%3)*.15;p.push(twig(0,0,0,l,.6+(i%2)*.4,a,c,.03),twig(Math.cos(a)*.15,l*.6,-Math.sin(a)*.15,l*.6,.9,a+.5,c,.02))}return M(p)};
  const mushC=(stem,cap,n)=>{const p=[];for(let i=0;i<n;i++){const a=i*2.3,r=i?.15+i*.07:0,h=.12+((i*37)%10)/40;p.push(F(cyl(.02,.03,h,4),stem,{},Math.cos(a)*r,h/2,Math.sin(a)*r),F(cone(.08+((i*13)%5)/60,.07,6),cap,{lo:1,hi:.2},Math.cos(a)*r,h+.02,Math.sin(a)*r))}return M(p)};
  const lilies=()=>{const p=[];for(let i=0;i<5;i++){const a=i*2.6,r=i?.35+i*.18:0;p.push(F(new G.CircleGeometry(.22+(i%2)*.08,7,.4,5.6),0x3a7a2a,{lo:.9,hi:.2},Math.cos(a)*r,0,Math.sin(a)*r,-Math.PI/2,0,0));if(i==1)p.push(F(oct(.07),0xf0d0e8,{lo:1,hi:.1},Math.cos(a)*r,.05,Math.sin(a)*r))}return M(p)};
  const cairn=(c)=>M([F(dod(.4),c,{j:.12},0,.25,0,0,0,0,[1.2,.6,1.1]),F(dod(.3),c,{j:.1},.05,.62,0,0,.7,0,[1,.6,1]),F(dod(.22),c,{j:.08},0,.88,.03,0,1.5,0,[1,.7,1]),F(dod(.14),c,{j:.05},0,1.08,0)]);
  const banner=(pole,cloth)=>M([F(cyl(.05,.07,3.4,5),pole,{},0,1.7,0),F(box(.9,.06,.06),pole,{},.35,3.2,0),F(box(.8,1.5,.04),cloth,{lo:.8,hi:.4,j:.03,f:(x,y,z)=>[x,y<1.7?y-(x-.42)*(x-.42)*.6:y,z+Math.sin(y*4)*.04]},.42,2.4,0),F(cone(.08,.2,4),0xc8a040,{},0,3.5,0)]);
  const brazier=()=>M([F(cyl(.04,.04,1,4),0x24222a,{},.25,.5,0,0,0,-.25),F(cyl(.04,.04,1,4),0x24222a,{},-.13,.5,.22,.22,0,.13),F(cyl(.04,.04,1,4),0x24222a,{},-.13,.5,-.22,-.22,0,.13),F(cyl(.42,.24,.3,7),0x2e2a30,{j:.03},0,1.05,0)]);
  const flame=(h)=>M([F(cone(.26,h,5),0xffffff,{lo:1,hi:0},0,1.2+h/2,0),F(cone(.14,h*1.3,4),0xffffff,{lo:1,hi:0},.08,1.2+h*.6,.05,0,.5,0)]);
  const lanternPost=()=>M([F(cyl(.06,.09,2.4,5),0x2e241c,{j:.02},0,1.2,0),F(box(.7,.07,.07),0x2e241c,{},.3,2.3,0),F(cyl(.01,.01,.25,3),0x1a1a1a,{},.6,2.15,0),F(box(.24,.04,.24),0x1e1a18,{},.6,2.02,0),F(box(.24,.04,.24),0x1e1a18,{},.6,1.7,0),F(cone(.17,.14,4),0x1e1a18,{},.6,2.09,0,0,.78,0)]);
  const lanternGlow=()=>F(box(.18,.28,.18),0xffffff,{lo:1,hi:0},.6,1.86,0);
  const statueG=(stone,o)=>{o=o||{};const p=[F(box(1.1,.7,1.1),stone,{j:.05},0,.35,0),F(box(1.25,.12,1.25),stone,{},0,.72,0),F(cyl(.22,.38,1.3,6),stone,{j:.04},0,1.43,0),F(ico(.2,0),stone,{j:.03},0,2.25,0),F(box(.62,.18,.3),stone,{},0,1.95,0)];
    if(o.wings)[-1,1].forEach(s=>p.push(F(cone(.35,1.2,3),stone,{j:.04},s*.35,2.1,-.12,0,0,s*.7,[1,1,.25])));
    if(o.sword)p.push(F(box(.08,1.3,.04),stone,{},.28,1.5,.2),F(box(.36,.06,.06),stone,{},.28,2.0,.2));
    if(o.snake){p.push(F(tor(.38,.12,Math.PI*1.8,10),stone,{j:.02},0,.95,0,Math.PI/2,0,0),F(tor(.26,.1,Math.PI*1.6,8),stone,{},0,1.2,0,Math.PI/2,0,1),F(cyl(.08,.1,.7,5),stone,{},.2,1.55,0,0,0,-.3),F(cone(.16,.3,4),stone,{},.35,1.95,0,0,0,-1.3));p.splice(2,3)}
    if(o.broken)p.splice(3,2);return M(p)};
  const mausoleum=(st,roof)=>M([F(box(2.6,.25,3),st,{j:.04},0,.12,0),F(box(2.2,1.9,2.6),st,{j:.06},0,1.2,0),F(cyl(.16,.18,1.9,6),st,{},-.95,1.2,1.4),F(cyl(.16,.18,1.9,6),st,{},.95,1.2,1.4),
    F(box(2.5,.2,3),st,{},0,2.2,0),F(cone(1.85,.9,4),roof,{j:.05},0,2.75,0,0,Math.PI/4,0,[1,1,1.25]),F(box(.9,1.3,.06),0x141218,{lo:1,hi:0},0,.95,1.31),F(cyl(.04,.04,.6,4),0x8a8a90,{},0,3.35,0),F(box(.4,.06,.06),0x8a8a90,{},0,3.5,0)]);
  const coffin=(w)=>M([F(dome(.5,6),0x3a3026,{j:.06},0,0,0,0,0,0,[1.4,.45,2.2]),F(box(.62,.22,1.6),w,{j:.02},.15,.25,.5,.1,.3,.15)]);
  const archG=(st,top)=>M([F(box(.9,3.2,1),st,{j:.1,top,tt:.6},-1.7,1.6,0),F(box(.9,3.2,1),st,{j:.1,top,tt:.6},1.7,1.6,0),F(tor(1.7,.5,Math.PI,8),st,{j:.08,top,tt:.6},0,3.0,0,0,0,0,[1,.6,1.2]),F(box(1.2,.5,1.1),st,{j:.1},-1.7,.25,0),F(box(1.2,.5,1.1),st,{j:.1},1.7,.25,0)]);
  const duneG=(c)=>F(dome(1,9),c,{j:.12,jy:.5,lo:.86,hi:.24,f:(x,y,z)=>[x*(1+.25*Math.sign(x)),y*(1-.35*Math.max(0,x)),z]},0,0,0);
  const cartG=()=>M([F(box(2.0,.12,1.1),0x6a4a2e,{j:.03},0,.75,0,0,0,.15),F(box(2.0,.4,.06),0x5a3e26,{j:.03},0,.98,.53,0,0,.15),F(box(2.0,.4,.06),0x5a3e26,{j:.03},0,.98,-.53,0,0,.15),
    F(tor(.42,.06,Math.PI*2,9),0x4a3420,{},-.3,.45,.62,0,0,0),F(cyl(.04,.04,1.4,4),0x4a3420,{},-.3,.45,0,Math.PI/2,0,0),F(tor(.42,.06,Math.PI*2,9),0x4a3420,{},.2,.15,-.75,Math.PI/2.4,0,0),
    F(box(1.4,.06,.06),0x5a3e26,{},1.5,.65,.2,0,.2,.3),F(dome(.9,7),0xd2a868,{j:.1},-.4,0,.1,0,0,0,[1.6,.5,1.2])]);
  const mesa=(c,b)=>{const p=[];for(let i=0;i<4;i++){const r=1.3-i*.22;p.push(F(cyl(r*.92,r,.75,7),i%2?c:b,{j:.15,jy:.3},((i*7)%3-1)*.08,.375+i*.72,0))}return M(p)};
  const basalt=(c,top)=>{const p=[];for(let i=0;i<6;i++){const a=i*1.05,r=i?.42:0,h=1.4+((i*53)%10)/5;p.push(F(cyl(.24,.26,h,6),c,{j:.02,top,tt:.8},Math.cos(a)*r,h/2,Math.sin(a)*r))}return M(p)};
  const crystals=(c)=>{const p=[];for(let i=0;i<6;i++){const a=i*1.1,r=i?.32+i*.05:0,h=i?.9+((i*31)%10)/10:2.2;p.push(F(oct(.25),c,{j:.04,lo:.8,hi:.5},Math.cos(a)*r,h*.45,Math.sin(a)*r,Math.cos(a)*.35*(i?1:0),0,Math.sin(a)*.35*(i?1:0),[1,h*1.6,1]))}return M(p)};
  const icicles=(c)=>{const p=[];for(let i=0;i<7;i++){const a=i*2.2,r=i?.2+i*.06:0,h=.4+((i*29)%10)/14;p.push(F(cone(.08,h,4),c,{lo:.8,hi:.5},Math.cos(a)*r,h/2,Math.sin(a)*r,Math.cos(a)*.3,0,Math.sin(a)*.3))}return M(p)};
  const rubble=(c)=>{const p=[];for(let i=0;i<7;i++){const a=i*2.5,r=i?.3+i*.15:0,s=.18+((i*17)%6)/20;p.push(F(box(s*1.4,s,s),c,{j:.06},Math.cos(a)*r,s/2,Math.sin(a)*r,0,a,(i%2)*.3))}return M(p)};
  const candles=()=>{const p=[];for(let i=0;i<5;i++){const a=i*1.9,r=i?.12+i*.04:0,h=.12+((i*23)%10)/50;p.push(F(cyl(.03,.035,h,5),0xe8dcc0,{lo:.9,hi:.2},Math.cos(a)*r,h/2,Math.sin(a)*r))}return M(p)};
  const candleGlow=()=>{const p=[];for(let i=0;i<5;i++){const a=i*1.9,r=i?.12+i*.04:0,h=.12+((i*23)%10)/50;p.push(F(cone(.025,.07,4),0xffffff,{lo:1,hi:0},Math.cos(a)*r,h+.04,Math.sin(a)*r))}return M(p)};
  const candelabra=()=>M([F(cyl(.05,.18,1.6,5),0x1e1c22,{},0,.8,0),F(tor(.35,.03,Math.PI,6),0x1e1c22,{},0,1.6,0,0,0,Math.PI),F(cyl(.04,.04,.25,5),0xe8dcc0,{},-.35,1.72,0),F(cyl(.04,.04,.25,5),0xe8dcc0,{},.35,1.72,0),F(cyl(.04,.04,.25,5),0xe8dcc0,{},0,1.82,0)]);
  const candelaGlow=()=>M([F(cone(.04,.12,4),0xffffff,{lo:1,hi:0},-.35,1.9,0),F(cone(.04,.12,4),0xffffff,{lo:1,hi:0},.35,1.9,0),F(cone(.04,.12,4),0xffffff,{lo:1,hi:0},0,2.0,0)]);
  const rootsG=(bark)=>{const p=[];for(let i=0;i<4;i++){const a=i*1.6;p.push(F(tor(.9+i*.15,.13-i*.015,Math.PI*.85,7),bark,{j:.04},0,-.25,0,0,a,0,[1.3,1,1]))}p.push(F(cyl(.3,.45,.7,6),bark,{j:.05},.2,.1,0,0,0,.6));return M(p)};
  const hay=()=>M([F(cyl(.55,.55,.9,8),0xd8b860,{j:.04,lo:.75,hi:.35},0,.55,0,Math.PI/2,0,0),F(tor(.56,.03,Math.PI*2,8),0x8a6a30,{},.2,.55,0,0,Math.PI/2,0),F(tor(.56,.03,Math.PI*2,8),0x8a6a30,{},-.2,.55,0,0,Math.PI/2,0)]);
  const totem=(w,c1,c2)=>M([F(cyl(.18,.22,2.6,6),w,{j:.03},0,1.3,0),F(cone(.3,.5,5),c1,{},0,2.85,0),F(box(.5,.3,.42),c2,{j:.02},0,2.2,.08),F(box(.12,.06,.1),0xffd060,{lo:1,hi:0},.12,2.25,.3),F(box(.12,.06,.1),0xffd060,{lo:1,hi:0},-.12,2.25,.3),F(box(.9,.12,.12),w,{},0,1.6,0),F(box(.04,.7,.3),c1,{},.42,1.25,0),F(box(.04,.7,.3),c2,{},-.42,1.25,0)]);
  // ---------- canvas textures: spider web, soft mist ----------
  const webT=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.strokeStyle='rgba(235,240,245,.85)';g.lineWidth=1.3;
    for(let i=0;i<10;i++){const a=i/10*6.283;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(a)*62,64+Math.sin(a)*62);g.stroke()}
    for(let r=8;r<60;r+=6){g.beginPath();for(let i=0;i<=10;i++){const a=i/10*6.283,rr=r+((i*7)%3);i?g.lineTo(64+Math.cos(a)*rr,64+Math.sin(a)*rr):g.moveTo(64+Math.cos(a)*rr,64+Math.sin(a)*rr)}g.stroke()}return new G.CanvasTexture(c)})();
  const mistT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,255,255,.55)');r.addColorStop(.6,'rgba(255,255,255,.2)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new G.CanvasTexture(c)})();
  const plain=g=>{if(g.index)g=g.toNonIndexed();g.computeVertexNormals();g.userData.lps=1;return g};
  // ---------- deco types: parts (geometry, glow = unlit, mat = special material), scale range, collider ----------
  // col: collider radius (scaled) or cp: [[lx,lz,r],...] local collider points; near: only drawn within NEARR; y: ground offset (scaled)
  const T={};
  const def=(k,o)=>{T[k]=Object.assign({k,s:[.85,1.25],near:false,cast:false,sway:0,j:.12,y:0},o);T[k].parts=T[k].parts.map(p=>p.isBufferGeometry?{g:p}:p)};
  // Kindlelight: a drowned, misty bog-forest lit by old lanterns
  def('k_tree',{parts:[deadTree(0x3a3228,0x5a7a34)],s:[1.1,1.7],cast:true,col:.45,sway:.008});
  def('k_roots',{parts:[rootsG(0x3a3026)],s:[.9,1.4],cast:true});
  def('k_fern',{parts:[fern(0x4a8a3a)],near:true,s:[.8,1.4],sway:.12});
  def('k_reeds',{parts:[reeds(0x6a8a3a,0x5a3a22)],near:true,s:[.8,1.3],sway:.18});
  def('k_lily',{parts:[lilies()],near:true,abs:.035,s:[.8,1.4]});
  def('k_log',{parts:[logG(0x3e3428,0x5a8a3a)],cast:true,cp:[[-.9,0,.45],[0,0,.45],[.9,0,.45]],s:[.9,1.2]});
  def('k_stump',{parts:[M([stump(0x3e3428,0x8a6a48),mushC(0xd8d0b8,0xb85a3a,4).scale(.55,.8,.55).translate(.04,.5,.02)])],near:true,s:[.8,1.3]});
  def('k_glow',{parts:[{g:mushC(0x8ad8c0,0xffffff,7),glow:1}],near:true,s:[.9,1.8],tint:[0x6affc0,0x9ae8ff,0xc8ff6a]});
  def('k_web',{parts:[{g:plain(pln(1.8,1.8)),mat:'web'}],near:true,y:1.3,s:[.8,1.3],j:0});
  def('k_lamp',{parts:[lanternPost(),{g:lanternGlow(),glow:1}],cast:true,s:[.95,1.1],tint:[0xffffff],gt:[0xffc870]});
  def('k_stone',{parts:[rockG(0x4a5048,0x5a7a3a,1,.5)],s:[.5,1.1],y:-.15});
  def('k_mist',{parts:[{g:plain(pln(1,1).rotateX(-Math.PI/2)),mat:'mist'}],near:false,y:.35,s:[4,8],j:0,tint:[0x9ac8a0]});
  // Hillside Crest: windswept meadows of the serpent folk
  def('h_flowers',{parts:[flowers([0xf0e060,0xe86a9a,0xffffff,0x9a7aff,0xff8a4a])],near:true,s:[.9,1.6],sway:.12});
  def('h_flowers2',{parts:[flowers([0xff5a7a,0xffd84a,0xfff4e0])],near:true,s:[.9,1.6],sway:.12});
  def('h_grass',{parts:[tallGrass(0x8aaa4a)],near:true,s:[.9,1.5],sway:.3});
  def('h_fence',{parts:[fenceG(0x6a5236)],cast:true,s:[.95,1.1]});
  def('h_stone',{parts:[F(box(.9,2.6,.5),0x8a8a82,{j:.12,top:0x6a8a4a,tt:.7},0,1.3,0)],cast:true,col:.55,s:[.8,1.3]});
  def('h_boulder',{parts:[rockG(0x8a8478,0x6a8a42,1.1,.8)],cast:true,col:.95,s:[1,1.6]});
  def('h_shrine',{parts:[statueG(0xa89a70,{snake:1})],cast:true,col:.7,s:[.9,1.1]});
  def('h_hay',{parts:[hay()],cast:true,col:.6,s:[.9,1.15]});
  def('h_cairn',{parts:[cairn(0x9a9488)],cast:true,s:[.8,1.2]});
  def('h_totem',{parts:[totem(0x6a4a2e,0x3a8a5a,0xc8a040)],cast:true,col:.35,s:[.9,1.1]});
  def('h_bush',{parts:[M([F(ico(.45,0),0x4a8a3a,{j:.12},0,.35,0),F(ico(.35,0),0x5a9a42,{j:.1},.35,.3,.1),F(ico(.3,0),0x3e7a32,{j:.1},-.3,.25,-.15)])],near:true,s:[.8,1.4],sway:.04});
  // Burningeye Summit: a frozen peak under a burning sky
  def('b_crystal',{parts:[{g:crystals(0xffffff),glow:1}],cast:false,col:.6,s:[.8,1.5],tint:[0x9ad8ff,0xbfe8ff,0x7ab8ff]});
  def('b_rock',{parts:[rockG(0x6a7280,0xf4f8ff,1.1,.75)],cast:true,col:.95,s:[1,1.7]});
  def('b_tree',{parts:[deadTree(0x4a4448,null,{snow:1})],cast:true,col:.45,s:[1.1,1.6]});
  def('b_ice',{parts:[icicles(0xc8e8ff)],near:true,s:[.8,1.4]});
  def('b_drift',{parts:[F(dome(1,8),0xf4f8ff,{j:.15,jy:.4,lo:.9,hi:.15},0,0,0,0,0,0,[1.6,.45,1])],s:[1,2.2],y:-.05});
  def('b_cairn',{parts:[M([cairn(0x7a8090),banner(0x3a2e24,0xb83a2a).scale(.5,.5,.5)])],cast:true,s:[.9,1.2]});
  def('b_column',{parts:[basalt(0x3a3a44,0xf4f8ff)],cast:true,col:.85,s:[.9,1.4]});
  def('b_bones',{parts:[skull(0xe8e8f0)],near:true,s:[.9,1.4]});
  def('b_pine',{parts:[M([F(cyl(.08,.14,1.2,5),0x3a2a1e,{},0,.6,0),F(cone(.8,1.4,7),0x2a4a40,{j:.08,top:0xf4f8ff,tt:.3},0,1.4,0),F(cone(.6,1.1,7),0x2e5244,{j:.06,top:0xf4f8ff,tt:.3},0,2.1,0),F(cone(.38,.9,7),0x335a48,{j:.05,top:0xf4f8ff,tt:.3},0,2.7,0)])],cast:true,col:.45,s:[1,1.6],sway:.02});
  // Searing Sands: dunes, bleached bones and the ruins of a buried city
  def('s_dune',{parts:[duneG(0xe0b878)],s:[3,6.5],y:-.3,j:.06,cast:false});
  def('s_ripple',{parts:[duneG(0xe6c084)],s:[1.2,2.4],y:-.12,j:.06,sc:[1,.35,1]});
  def('s_arch',{parts:[archG(0xc88a58,0xe6c084)],cast:true,cp:[[-1.7,0,.75],[1.7,0,.75]],s:[1,1.3]});
  def('s_rib',{parts:[bonesRib(0xeee6d4)],cast:true,cp:[[-.6,0,.6],[.6,0,.6]],s:[1.1,1.6]});
  def('s_skull',{parts:[skull(0xeee6d4)],near:true,s:[1,1.8]});
  def('s_wall',{parts:[wallG(0xc8956a,0xe6c084,3.6,1.8)],cast:true,cp:[[-1.3,0,.6],[0,0,.6],[1.3,0,.6]],s:[.9,1.2]});
  def('s_pillar',{parts:[pillarG(0xd0a070,2.6,0xe6c084)],cast:true,col:.5,s:[.9,1.3]});
  def('s_shrub',{parts:[shrub(0x7a5a3a,0)],near:true,s:[.8,1.4],sway:.03});
  def('s_cart',{parts:[cartG()],cast:true,col:1.1,s:[.95,1.1]});
  def('s_mesa',{parts:[mesa(0xc0825a,0xd89a68)],cast:true,s:[1.8,3.2]});
  def('s_cactus',{parts:[M([F(cyl(.2,.24,1.8,8),0x4a7a3a,{j:.03,lo:.65,hi:.5},0,.9,0),F(cyl(.11,.13,.7,7),0x4a7a3a,{j:.02},.32,1.0,0,0,0,-.5),F(cyl(.1,.12,.6,7),0x4a7a3a,{},.48,1.45,0),F(cyl(.1,.12,.8,7),0x4a7a3a,{},-.3,1.15,0,0,0,.4),F(oct(.05),0xff6a8a,{lo:1,hi:0},0,1.83,0)])],cast:true,col:.3,s:[.9,1.5]});
  def('s_barrel',{parts:[M([F(ico(.38,1),0x5a8a3a,{j:.05,lo:.6,hi:.5},0,.3,0,0,0,0,[1,.85,1]),F(oct(.06),0xffd84a,{lo:1,hi:0},0,.62,0)])],near:true,s:[.7,1.3]});
  // The Dirge: a haunted graveyard on the marsh that never sleeps
  def('d_graves',{parts:[M([grave(0x6a6a72,.12).translate(-.8,0,0),grave(0x5a5a64,-.2).translate(.6,0,.2),crossG(0x5a5048).translate(0,0,-1.6)])],cast:true,s:[.9,1.2]});
  def('d_cross',{parts:[crossG(0x6a6a70)],cast:true,s:[.9,1.3]});
  def('d_crypt',{parts:[mausoleum(0x6a6872,0x3a3a46)],cast:true,cp:[[0,0,1.4],[0,.8,1]],s:[1,1.25]});
  def('d_fence',{parts:[ironFence()],cast:true,s:[.95,1.1]});
  def('d_tree',{parts:[deadTree(0x2e2c30,0x5a6a5a)],cast:true,col:.45,s:[1.1,1.8],sway:.008});
  def('d_skulls',{parts:[M([skull(0xd8d0b8),skull(0xc8c0a8).translate(.35,0,.25),skull(0xd0c8b0).translate(-.2,.22,.05)])],near:true,s:[.9,1.3]});
  def('d_candles',{parts:[candles(),{g:candleGlow(),glow:1}],near:true,s:[1,1.6],gt:[0xffd890]});
  def('d_coffin',{parts:[coffin(0x3a2a22)],cast:true,s:[.9,1.1]});
  def('d_angel',{parts:[statueG(0x8a8a90,{wings:1})],cast:true,col:.7,s:[.95,1.15]});
  def('d_reeds',{parts:[reeds(0x5a6a4a,0x3a2a22)],near:true,s:[.8,1.3],sway:.18});
  def('d_lamp',{parts:[lanternPost(),{g:lanternGlow(),glow:1}],cast:true,s:[.95,1.1],gt:[0x8affd0]});
  def('d_mist',{parts:[{g:plain(pln(1,1).rotateX(-Math.PI/2)),mat:'mist'}],y:.3,s:[4,8],j:0,tint:[0x8ab8b0]});
  // The Citadel: the ruined courts of the vampire king
  def('c_wall',{parts:[wallG(0x4a4248,0x3a3438,3.8,2.6)],cast:true,cp:[[-1.35,0,.6],[0,0,.6],[1.35,0,.6]],s:[.9,1.2]});
  def('c_statue',{parts:[statueG(0x5a5258,{sword:1})],cast:true,col:.7,s:[1,1.25]});
  def('c_gargoyle',{parts:[statueG(0x4a444c,{wings:1,broken:0})],cast:true,col:.7,s:[.9,1.1]});
  def('c_banner',{parts:[banner(0x2a2026,0x8a0e1e)],cast:true,col:.3,s:[1,1.3],sway:.01});
  def('c_brazier',{parts:[brazier(),{g:flame(.55),glow:1}],cast:true,col:.45,s:[.95,1.15],gt:[0xff7a2a,0xff9a3a]});
  def('c_rubble',{parts:[rubble(0x4e464c)],near:true,s:[.8,1.5]});
  def('c_column',{parts:[pillarG(0x5a5058,3.2,null)],cast:true,col:.5,s:[.95,1.3]});
  def('c_graves',{parts:[M([grave(0x3e3a42,.15).translate(-.7,0,0),grave(0x46404a,-.1).translate(.7,0,.1)])],cast:true,s:[.9,1.2]});
  def('c_candela',{parts:[candelabra(),{g:candelaGlow(),glow:1}],cast:true,s:[.9,1.1],gt:[0xffc870]});
  def('c_blood',{parts:[F(disc(1,9),0x4a0610,{lo:1,hi:0,j:.15,jy:0},0,0,0,-Math.PI/2)],near:true,y:.04,s:[.6,1.4],j:.05});
  def('c_coffin',{parts:[M([F(box(.7,.35,1.8),0x2a1a1a,{j:.03},0,.18,0),F(box(.76,.08,1.86),0x3a2222,{},.1,.4,.15,0,.25,.12)])],cast:true,s:[.9,1.1]});
  // ---------- where each zone puts them: w = in (walkable, off the road) | edge (walkable near the cliff) | bank (the raised rim, out of reach) | lane (beside the road) | water ----------
  // n = items per 1000 tiles of that kind, c = [min,max] per cluster, r = cluster radius
  const Z=[
   [{k:'k_tree',w:'in',n:4,c:[2,4],r:5},{k:'k_tree',w:'bank',n:7,c:[2,5],r:6},{k:'k_roots',w:'in',n:1.6,c:[1,2],r:4},{k:'k_fern',w:'in',n:9,c:[3,7],r:3},{k:'k_fern',w:'edge',n:12,c:[3,7],r:3},
    {k:'k_reeds',w:'edge',n:10,c:[3,6],r:3},{k:'k_reeds',w:'shore',n:60,c:[2,4],r:2},{k:'k_lily',w:'water',n:110,c:[1,2],r:1.5},{k:'k_log',w:'in',n:1,c:[1,1],r:1},{k:'k_stump',w:'in',n:2.5,c:[1,3],r:4},
    {k:'k_glow',w:'in',n:4,c:[2,5],r:3},{k:'k_glow',w:'edge',n:4,c:[2,4],r:3},{k:'k_web',w:'edge',n:1.4,c:[1,2],r:3},{k:'k_lamp',w:'lane',n:6,c:[1,1],r:1},{k:'k_stone',w:'in',n:1.8,c:[2,4],r:3},{k:'k_stone',w:'shore',n:20,c:[1,2],r:2},{k:'k_mist',w:'in',n:1.3,c:[1,3],r:6}],
   [{k:'h_flowers',w:'in',n:8,c:[3,8],r:4},{k:'h_flowers2',w:'in',n:6,c:[3,7],r:4},{k:'h_grass',w:'in',n:8,c:[3,7],r:3},{k:'h_grass',w:'edge',n:12,c:[3,6],r:3},{k:'h_fence',w:'fence',n:1.1,c:[3,5],r:1},
    {k:'h_stone',w:'circle',n:.25,c:[5,6],r:4.4},{k:'h_boulder',w:'in',n:1,c:[1,2],r:4},{k:'h_boulder',w:'bank',n:3,c:[1,3],r:5},{k:'h_shrine',w:'in',n:.25,c:[1,1],r:1},{k:'h_hay',w:'in',n:.6,c:[1,3],r:3},
    {k:'h_cairn',w:'in',n:.8,c:[1,1],r:1},{k:'h_cairn',w:'bank',n:1.5,c:[1,1],r:1},{k:'h_totem',w:'lane',n:3,c:[1,1],r:1},{k:'h_bush',w:'edge',n:5,c:[2,4],r:3},{k:'h_bush',w:'bank',n:5,c:[2,4],r:4}],
   [{k:'b_crystal',w:'in',n:1.2,c:[1,3],r:4},{k:'b_crystal',w:'bank',n:3,c:[1,3],r:5},{k:'b_rock',w:'in',n:.9,c:[1,2],r:4},{k:'b_rock',w:'bank',n:3.5,c:[1,3],r:5},{k:'b_tree',w:'in',n:1.2,c:[1,3],r:5},{k:'b_tree',w:'bank',n:3,c:[2,4],r:6},
    {k:'b_pine',w:'bank',n:3,c:[2,5],r:6},{k:'b_ice',w:'in',n:4,c:[2,5],r:3},{k:'b_ice',w:'edge',n:8,c:[2,5],r:3},{k:'b_drift',w:'edge',n:7,c:[1,3],r:3},{k:'b_drift',w:'in',n:1.5,c:[1,2],r:3},{k:'b_cairn',w:'lane',n:3,c:[1,1],r:1},
    {k:'b_column',w:'in',n:.5,c:[1,2],r:4},{k:'b_column',w:'bank',n:2,c:[1,3],r:5},{k:'b_bones',w:'in',n:1.3,c:[1,2],r:3}],
   [{k:'s_dune',w:'bank',n:5,c:[1,3],r:7},{k:'s_dune',w:'edge',n:2.5,c:[1,2],r:4},{k:'s_ripple',w:'in',n:3,c:[2,4],r:5},{k:'s_arch',w:'in',n:.2,c:[1,1],r:1},{k:'s_rib',w:'in',n:.5,c:[1,1],r:1},{k:'s_skull',w:'in',n:2,c:[1,3],r:3},
    {k:'s_wall',w:'in',n:.5,c:[1,3],r:5},{k:'s_wall',w:'bank',n:1,c:[1,3],r:6},{k:'s_pillar',w:'in',n:.6,c:[1,3],r:4},{k:'s_pillar',w:'bank',n:1.2,c:[2,4],r:5},{k:'s_shrub',w:'in',n:4,c:[1,4],r:4},{k:'s_shrub',w:'edge',n:6,c:[1,4],r:3},
    {k:'s_cart',w:'in',n:.15,c:[1,1],r:1},{k:'s_mesa',w:'bank',n:1.8,c:[1,2],r:6},{k:'s_cactus',w:'in',n:1,c:[1,3],r:4},{k:'s_cactus',w:'bank',n:2.5,c:[1,4],r:5},{k:'s_barrel',w:'in',n:2,c:[2,4],r:3}],
   [{k:'d_graves',w:'in',n:2,c:[3,7],r:5},{k:'d_cross',w:'in',n:1.5,c:[2,4],r:4},{k:'d_crypt',w:'in',n:.2,c:[1,1],r:1},{k:'d_fence',w:'fence',n:1,c:[3,5],r:1},{k:'d_tree',w:'in',n:1.6,c:[1,3],r:5},{k:'d_tree',w:'bank',n:6,c:[2,5],r:6},
    {k:'d_skulls',w:'in',n:1.5,c:[1,2],r:3},{k:'d_candles',w:'in',n:1.8,c:[1,3],r:3},{k:'d_coffin',w:'in',n:.5,c:[1,2],r:3},{k:'d_angel',w:'in',n:.3,c:[1,1],r:1},{k:'d_reeds',w:'edge',n:8,c:[3,6],r:3},{k:'d_reeds',w:'shore',n:50,c:[2,4],r:2},
    {k:'d_lamp',w:'lane',n:5,c:[1,1],r:1},{k:'d_mist',w:'in',n:1.2,c:[1,3],r:6},{k:'d_graves',w:'bank',n:2,c:[2,5],r:6},{k:'d_cross',w:'bank',n:2,c:[2,5],r:5}],
   [{k:'c_wall',w:'in',n:.5,c:[1,3],r:5},{k:'c_wall',w:'edge',n:1.4,c:[1,2],r:4},{k:'c_statue',w:'in',n:.3,c:[1,2],r:4},{k:'c_gargoyle',w:'edge',n:.6,c:[1,1],r:1},{k:'c_banner',w:'lane',n:5,c:[1,1],r:1},{k:'c_banner',w:'edge',n:1.2,c:[1,2],r:3},
    {k:'c_brazier',w:'lane',n:4,c:[1,1],r:1},{k:'c_rubble',w:'in',n:4,c:[1,3],r:4},{k:'c_rubble',w:'edge',n:7,c:[1,3],r:3},{k:'c_column',w:'in',n:.5,c:[1,3],r:5},{k:'c_column',w:'edge',n:1.2,c:[1,2],r:4},{k:'c_graves',w:'in',n:.9,c:[2,5],r:5},
    {k:'c_candela',w:'in',n:.6,c:[1,2],r:3},{k:'c_blood',w:'in',n:1.2,c:[1,2],r:3},{k:'c_coffin',w:'in',n:.4,c:[1,2],r:3}]];
  // ---------- placement ----------
  const DM=2.2,ZM=[1,1,1.3,1.4,1.5,1.9],DW=MAP.DW,out=[],col=new Set(),stats={zones:[],kinds:{}};let sd=89;
  const rnd=()=>(sd=sd*16807%2147483647)/2147483647,ri=(a,b)=>a+rnd()*(b-a);
  const ptile=new Set();MAP.props.forEach(q=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)ptile.add((q[1]+j)*W+q[0]+i)});
  const hsh=(x,y,s)=>{const k=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return k-Math.floor(k)},
    vn=(x,y,s)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (hsh(i,j,s)*(1-u)+hsh(i+1,j,s)*u)*(1-v)+(hsh(i,j+1,s)*(1-u)+hsh(i+1,j+1,s)*u)*v};
  PMAP.forEach((p,r)=>{
    const x0=p.x0,y0=p.y0,w=PMW,h=PMH,RD=new Float32Array(w*h).fill(99);
    // distance to the road centre line (and the side branches)
    const st=(cx,cy,R)=>{for(let y=Math.max(y0,Math.floor(cy-R));y<=Math.min(y0+h-1,cy+R);y++)for(let x=Math.max(x0,Math.floor(cx-R));x<=Math.min(x0+w-1,cx+R);x++){const d=Math.hypot(x-cx,y-cy),k=(y-y0)*w+x-x0;if(d<RD[k])RD[k]=d}};
    p.path.forEach((q,i)=>{if(i%2==0)st(q[0],q[1],12)});
    p.br.forEach(l=>{for(let k=0;k<l.length-1;k++){const [ax,ay]=l[k],[bx,by]=l[k+1],n=Math.ceil(Math.hypot(bx-ax,by-ay)/2);for(let q=0;q<=n;q++)st(ax+(bx-ax)*q/n,ay+(by-ay)*q/n,6)}});
    const rd=(x,y)=>{x=Math.round(x);y=Math.round(y);return x<x0||y<y0||x>=x0+w||y>=y0+h?99:RD[(y-y0)*w+x-x0]};
    const camps=CAMPS_PRE(r);
    // the entrance (and its home portal) moves to path[16] later at load (zz_portal), so keep both clear
    const e1=p.path[16]||p.en;
    const away=(x,y,m)=>Math.hypot(x-p.ba[0],y-p.ba[1])>PM_DENR+3+m&&Math.hypot(x-p.wa[0],y-p.wa[1])>21+m&&Math.hypot(x-p.en[0],y-p.en[1])>12+m&&Math.hypot(x-e1[0],y-e1[1])>14+m&&camps.every(c=>Math.hypot(x-c[0],y-c[1])>16+m);
    const t=(x,y)=>{const X=Math.round(x),Y=Math.round(y);return MAP[Y]&&MAP[Y][X]};
    const cit=BIOMES[p.bi].n=='The Citadel';
    // tile classes
    const cls={in:[],edge:[],bank:[],lane:[],water:[],shore:[]};
    for(let y=y0+2;y<y0+h-2;y++)for(let x=x0+2;x<x0+w-2;x++){const k=y*W+x,d=DW[k],tt=MAP[y][x],R=RD[(y-y0)*w+x-x0];
      if(tt=='~'){cls.water.push(k);continue}
      if(d<0){if(tt=='r'||ptile.has(k))continue;if(d<-4&&R>4)cls.in.push(k);else if(d>=-4&&d<-.8&&R>4)cls.edge.push(k);if(R>6.5&&R<9.5&&d<-1.5)cls.lane.push(k);
        if((MAP[y][x+1]=='~'||MAP[y][x-1]=='~'||MAP[y+1][x]=='~'||MAP[y-1][x]=='~')&&R>3)cls.shore.push(k)}
      else if(!cit&&d>2.8&&d<9)cls.bank.push(k)}
    cls.fence=cls.in;cls.circle=cls.in;
    const big=[],zstat={};let zn=0;
    const free=(x,y,r0)=>big.every(b=>Math.hypot(b[0]-x,b[1]-y)>b[2]+r0+2.6);
    const place=(S,x,y,ry,s,bank)=>{
      const it={k:S.k,x,z:y,ry,s,col:0};
      // collider tiles: every tile whose centre is within the radius of a collider point
      const cp=bank?null:S.cp?S.cp:S.col?[[0,0,S.col]]:null;
      if(cp){const c=Math.cos(ry),sn=Math.sin(ry),pts=cp.map(([lx,lz,rr])=>[x+(lx*c+lz*sn)*s,y+(-lx*sn+lz*c)*s,rr*s]);
        for(const [px,pz,rr] of pts){if(DW[Math.round(pz)*W+Math.round(px)]>-(rr+2.2)||t(px,pz)=='~'||rd(px,pz)<6+rr)return false}
        const R0=Math.max(...pts.map(q=>Math.hypot(q[0]-x,q[1]-y)+q[2]));if(!free(x,y,R0)||rd(x,y)<5.75+R0)return false; // v97: the whole prop stays 5 tiles off the road centre (rd is per tile: +.75)
        const tl=[];pts.forEach(([px,pz,rr])=>{for(let j=Math.floor(pz-rr-1);j<=Math.ceil(pz+rr+1);j++)for(let i=Math.floor(px-rr-1);i<=Math.ceil(px+rr+1);i++)if(Math.hypot(i-px,j-pz)<=rr+.3)tl.push(j*W+i);tl.push(Math.round(pz)*W+Math.round(px))});
        if(tl.some(k=>ptile.has(k)))return false;
        tl.forEach(k=>col.add(k));big.push([x,y,R0]);it.col=R0;it.tl=tl}
      else if(S.cast&&!S.near&&!S.flat){if(!free(x,y,.6*s))return false;big.push([x,y,.6*s-2.2])}
      out.push(it);zstat[S.k]=(zstat[S.k]||0)+1;zn++;return true};
    Z[r].forEach((E,ei)=>{const S=T[E.k],L=cls[E.w];if(!L||!L.length)return;
      const want=Math.round(L.length/1000*E.n*(E.w=='in'||E.w=='edge'||E.w=='bank'?DM*ZM[r]:1));let got=0,tries=0;
      while(got<want&&tries++<want*12){const k=L[Math.floor(rnd()*L.length)],cx=k%W,cy=Math.floor(k/W);
        // density varies across the zone: clusters are rare where the noise is low
        const nz=vn(cx/38,cy/38,r*7+ei);if(rnd()>.15+1.3*nz*nz)continue;
        if(!away(cx,cy,0))continue;
        const n=E.c[0]+Math.floor(rnd()*(E.c[1]-E.c[0]+1)),a0=rnd()*6.283;
        if(E.w=='circle'){for(let q=0;q<n;q++){const a=a0+q/n*6.283,x=cx+Math.cos(a)*E.r,y=cy+Math.sin(a)*E.r;if(DW[Math.round(y)*W+Math.round(x)]<-2&&away(x,y,0))if(place(S,x,y,-a+Math.PI/2,ri(S.s[0],S.s[1])))got++}continue}
        if(E.w=='fence'){const L0=2.5;for(let q=0;q<n;q++){const x=cx+Math.cos(a0)*L0*q,y=cy+Math.sin(a0)*L0*q;if(DW[Math.round(y)*W+Math.round(x)]>-2||rd(x,y)<4||!away(x,y,0))break;if(place(S,x,y,-a0,1))got++}continue}
        if(E.w=='lane'){// face the road
          let bx=0,by=0,bd=1e9;for(let i=0;i<p.path.length;i+=3){const q=p.path[i],d=Math.hypot(q[0]-cx,q[1]-cy);if(d<bd){bd=d;bx=q[0];by=q[1]}}
          if(place(S,cx+.5,cy+.5,Math.atan2(bx-cx,by-cy)-Math.PI/2,ri(S.s[0],S.s[1])))got++;continue}
        for(let q=0;q<n&&got<want;q++){const a=rnd()*6.283,d=q?E.r*Math.sqrt(rnd()):0,x=cx+Math.cos(a)*d+rnd()-.5,y=cy+Math.sin(a)*d+rnd()-.5,X=Math.round(x),Y=Math.round(y),kk=Y*W+X;
          if(L!==cls.water&&L!==cls.shore){const dd=DW[kk],tt=MAP[Y]&&MAP[Y][X];
            if(E.w=='bank'?(dd<2.8||dd>9.5):(dd>-.6||tt=='~'||tt=='r'||ptile.has(kk)||rd(x,y)<(S.near?3:4.5)))continue}
          else if(!MAP[Y]||E.w=='water'?!MAP[Y]||MAP[Y][X]!='~':(MAP[Y][X]=='~'||DW[kk]>-.5||rd(x,y)<3))continue;
          if(!away(x,y,0))continue;
          if(place(S,x,y,rnd()*6.283,ri(S.s[0],S.s[1]),E.w=='bank'))got++}}
      (stats.dbg=stats.dbg||[]).push([r,E.k,E.w,L.length,want,got])});
    stats.zones.push(zn);stats[p.n]=zstat});
  Object.keys(T).forEach(k=>stats.kinds[k]=out.filter(d=>d.k==k).length);
  stats.ms=Math.round(performance.now()-T0);WD={list:out,T,stats,webT,mistT,ms:[]};WDCOL=[...col];
}
// camp centres for the placement (CAMPS is built later, from the same PMAP.cl)
function CAMPS_PRE(r){return PMAP[r].cl.map(c=>[Math.round(c[0]),Math.round(c[1])])}
// ---------- instancing into 64x64 chunks (added to the chunk list after buildVI) ----------
function wdBuild(){if(!WD)return;const T0=performance.now(),CN=64,mats={},d0=new THREE.Object3D(),cc=new THREE.Color(),groups={};
  const mat=(S,pi,p)=>{const key=S.k+':'+pi;if(mats[key])return mats[key];let m;
    if(p.mat=='web')m=new THREE.MeshBasicMaterial({map:WD.webT,transparent:true,alphaTest:.2,side:THREE.DoubleSide,depthWrite:false,fog:true});
    else if(p.mat=='mist')m=new THREE.MeshBasicMaterial({map:WD.mistT,transparent:true,opacity:.42,depthWrite:false,fog:true});
    else if(p.glow)m=new THREE.MeshBasicMaterial({vertexColors:true});
    else{m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});m.userData.lps=1}
    if(p.g.attributes.position.count<3e4)windMat(m,S.sway||0,0);return mats[key]=m};
  WD.list.forEach((d,i)=>{const S=WD.T[d.k],k=Math.floor(d.z/CN)*1000+Math.floor(d.x/CN);(groups[k]=groups[k]||{})[d.k]=(groups[k][d.k]||[]);groups[k][d.k].push(d)});
  const H0=(x,z)=>GH(x,z);
  for(const k in groups){const cx=k%1000,cz=Math.floor(k/1000),c={ms:[],ns:[],on:false,non:false,wd:1,box:new THREE.Box3(new THREE.Vector3(cx*CN-3,-4,cz*CN-3),new THREE.Vector3((cx+1)*CN+3,30,(cz+1)*CN+3))};
    for(const kk in groups[k]){const S=WD.T[kk],L=groups[k][kk];
      S.parts.forEach((p,pi)=>{const m=new THREE.InstancedMesh(p.g,mat(S,pi,p),L.length),col=new Float32Array(L.length*3);
        L.forEach((d,j)=>{const s=d.s,sc=S.sc||[1,1,1];d0.position.set(d.x,(S.abs!=null?S.abs:H0(d.x,d.z)+S.y*(S.y>.2?1:s)),d.z);d0.rotation.set(0,d.ry,0);d0.scale.set(s*sc[0],s*sc[1],s*sc[2]);d0.updateMatrix();m.setMatrixAt(j,d0.matrix);
          const h=((d.x*73.13+d.z*37.7)%1+1)%1,tl=p.glow?(S.gt||S.tint):S.tint;cc.setHex(tl?tl[Math.floor(h*tl.length)%tl.length]:0xffffff);if(!p.glow&&!p.mat){const v=1-S.j/2+S.j*h;cc.multiplyScalar(v)}col.set([cc.r,cc.g,cc.b],j*3)});
        m.instanceColor=new THREE.InstancedBufferAttribute(col,3);m.instanceMatrix.needsUpdate=true;m.frustumCulled=false;m.visible=false;m.castShadow=false;m.receiveShadow=!p.glow&&!p.mat;m.userData.cast=!!S.cast&&!p.glow&&!p.mat;
        if(p.mat)m.renderOrder=3;scene.add(m);WD.ms.push(m);(S.near?c.ns:c.ms).push(m)})}
    CHL.push(c)}
  // the desert's ridge boulders are sandstone instead of grey, mossy rock
  try{const v=window.WD_RK;if(v)for(let i=0;i<v.n;i++){const x=v.M[i*16+12],z=v.M[i*16+14];if(regionAt(Math.round(x),Math.round(z))!==3)continue;
    const q=((x*12.9898+z*78.233)%1+1)%1;cc.setHex(0xd09060).multiplyScalar(.82+.3*q);v.C.set([cc.r,cc.g,cc.b],i*3);const m=v.cm[i];if(m&&m.instanceColor){m.instanceColor.setXYZ(v.cl[i],cc.r,cc.g,cc.b);m.instanceColor.needsUpdate=true}}}catch(err){console.warn('sand rocks',err)}
  WD.stats.buildMs=Math.round(performance.now()-T0);WD.stats.meshes=WD.ms.length}
// ---------- old saves: the zone layout changed in v89 and again in v97 ----------
// x2 carries wl (layout version, WD_WL). A save from another layout: a position in a zone goes to that zone's entrance
// (the old zone is found on that layout's grid, WD_OLDG: v89 saves carry wl:89, older ones none), a saved zone run (INST)
// is dropped, treasure maps keep their zone (m.r; maps from before v89 get the zone they were in) and are re-placed on a
// reachable spot in it (zzN_loot.js tmMigrate). Duskhold, the Portal Court and the Courtyard never moved (x < 110).
var WD_WL=97;
var WD_OLDG={88:{x0:[110,380,650,110,380,650],y0:[8,8,8,288,288,288],w:260,h:270},89:{x0:[110,458,806,110,458,806],y0:[8,8,8,369,369,369],w:338,h:351}};
var WD_OLD=WD_OLDG[88];
function wdOldZone(x,z,wl){const G=WD_OLDG[wl===89?89:88];for(let i=0;i<6;i++)if(x>=G.x0[i]&&x<G.x0[i]+G.w&&z>=G.y0[i]&&z<G.y0[i]+G.h)return i;return -1}
{const f=x2Save;x2Save=function(){const s=f.apply(this,arguments)||{};try{s.wl=WD_WL;if(s.inst)s.inst=Object.assign({},s.inst,{wl:WD_WL})}catch(_){}return s}}
var WD_LOADOLD=false;
{const f=x2Load;x2Load=function(s){const wl=s&&s.wl;WD_LOADOLD=wl!==WD_WL;
  // other-layout treasure maps: keep (or find, on the old grid) the zone, forget the spot; the loot module's migration
  // (inside f) then picks a reachable spot in that same zone on the new grid
  try{if(WD_LOADOLD&&s&&Array.isArray(s.tmaps))s.tmaps.forEach(m=>{if(!m)return;if(m.r==null){const oz=wdOldZone(Math.round(m.x),Math.round(m.z),wl);if(oz<0)return;m.r=oz}m.x=-1;m.z=-1})}catch(_){}
  const r=f.apply(this,arguments);try{
  if(typeof INST!='undefined'&&INST&&INST.wl!==WD_WL)INST=null;
  if(WD_LOADOLD&&Array.isArray(tmaps)&&typeof tmMigrate!='function')tmaps=tmaps.map(m=>{if(freeSpot(Math.round(m.x),Math.round(m.z),1)&&tierAt(m.x,m.z)==m.T)return m;
    for(let k=0;k<400;k++){const x=8+Math.floor(Math.random()*(W-16)),y=8+Math.floor(Math.random()*(H-16));if(tierAt(x,y)==m.T&&regionAt(x,y)>=0&&freeSpot(x,y,1))return Object.assign({},m,{x,z:y})}return null}).filter(Boolean)}catch(err){console.warn('world load',err)}return r}}
{const f=loadGame;loadGame=function(){const s=saveInfo&&saveInfo();const r=f.apply(this,arguments);try{
  const wl=s&&s.x2&&s.x2.wl,old=wl!==WD_WL;if(old&&s&&s.pos&&!s.pos.realm&&!inRealm&&!inDun){const oz=wdOldZone(s.pos.x,s.pos.z,wl);
    if(oz>=0){const p=PMAP[oz],n=p.path[30];toPos(p.en[0],p.en[1],Math.atan2(p.en[0]-n[0],p.en[1]-n[1]))}
    else{const x=Math.round(pl.position.x),z=Math.round(pl.position.z);if(x>=110||MAP.DW[z*W+x]>=0)toPos(START[0],START[1])}}}catch(err){console.warn('world load pos',err)}return r}}
// the Citadel's castle walls only draw while you are in the Citadel (they were drawn from every zone and Duskhold)
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);try{if(window.CITW){const on=!inRealm&&!inDun&&regionAt(Math.round(pl.position.x),Math.round(pl.position.z))===5;if(CITW[0].visible!==on)CITW.forEach(m=>m.visible=on)}}catch(_){}}}
