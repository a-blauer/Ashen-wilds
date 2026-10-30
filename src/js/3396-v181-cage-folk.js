// ================= v181: goblins and humans on cage bodies =================
// Owner: "all enemy models that use the old humanoid structure updated to the new one". Batch 1: Hobgoblin, Slinger, Goblin
// Shaman, Bandit, Brigand Captain, Ember Cultist, Hollow Knight, Zealot of the Endless One, Salt Caller. Each keeps its
// look (colours, gear, weapon), rebuilt on the cage body. Shared here: face recipes (cgFaceHuman, cgFaceGoblin), a hood
// (cgHood), a plate harness (cgPlate, the Blood Knight's armour as a reusable kit).
// Restore pass (Oct 30 2026): each foe got back what made it itself in the old models (stocky goblins with big tusks, the
// slinger's draped hood and cross strap, the shaman's glowing eyes under its skull, the bandit's black mask and red sash, the
// brigand's light-grey mail and fur-cuffed boots, the knight's burning visor slit, the zealot's hood, mask and eye patch, the
// salt caller's spine crystals) and its old height; skin under clothes is no longer drawn (f6_reg), to stay near 15k triangles.

// ---------------- faces (base head coordinates) ----------------
function cgFaceHuman(o){o=o||{};const nz=o.nose||1,br=o.brow||1,ch=o.cheek||1;return (x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;
  d+=.02*nz*cgG(x,y,0,1.597,.01*(o.nw||1),.013)+.012*nz*cgG(x,y,0,1.615,.008*(o.nw||1),.012);
  [-1,1].forEach(s=>{d-=.013*cgG(x,y,s*.036,1.629,.016,.01);d+=.007*ch*cgG(x,y,s*.056,1.602,.014,.01);d-=(o.hollow||.004)*cgG(x,y,s*.047,1.568,.016,.014);d+=.003*cgG(x,y,s*.01,1.587,.006,.004)});
  d+=.009*br*cgG(x,y,0,1.648,.05,.006);d-=.004*cgG(x,y,0,1.558,.02,.003);d+=.009*(o.chin||1)*cgG(x,y,0,1.538,.018,.012);return d*f}}
function cgFaceGoblin(o){o=o||{};return (x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
  d+=.04*cgG(x,y,0,1.588,.013,.014)+.02*cgG(x,y,0,1.61,.01,.014)-.01*cgG(x,y,0,1.575,.012,.006);       // a long hooked nose
  [-1,1].forEach(s=>{d-=.016*cgG(x,y,s*.038,1.628,.016,.011);d+=.008*cgG(x,y,s*.06,1.6,.014,.01);d+=.005*cgG(x,y,s*.012,1.585,.007,.005)});
  d+=.016*cgG(x,y,0,1.647,.055,.008);d-=.006*cgG(x,y,0,1.556,.035,.004);d+=.006*cgG(x,y,0,1.54,.03,.012);return d*f}}
// a dark mouth line and sockets painted over the skin (base head coordinates)
function cgFacePaint(S,m,skin,o){o=o||{};if(m.part=='head'&&m.s>.3){const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-(o.ex||.036))<.02&&Math.abs(m.y-S.hp(0,o.ey||1.629,0)[1])<.012*S.hs)return o.sock==null?mdSh(skin,.45):o.sock;
  if(Math.abs(m.y-S.hp(0,o.my||1.557,0)[1])<.0042*S.hs&&Math.abs(bx)<(o.mw||.026))return o.lip==null?0x2a1210:o.lip}return null}
// a hood: a shell over the crown, back and sides of the head, the neck and the shoulders, open round the face; peak = a cone on top
// (restore pass) o.arm: the drape also runs down over the shoulder caps by that much; o.tip: a limp point hanging off the back
function cgHood(B,k,M,S,o){const fy=S.hp(0,1.6,0)[1];cgShell(B,M,m=>{if(m.part=='head'){const bx=m.x/S.hs,by=(m.y-fy)/S.hs;return !(m.s>.35&&(bx*bx)/(.065*.065)+(by*by)/(.075*.075)<1)}
    return m.part=='neck'||(m.part=='torso'&&m.y>S.torso[6][0]-(o.drape||.06))||(o.arm&&m.part=='arm'&&m.y>S.torso[6][0]-o.arm)},o.off||.02,o.col,{rim:.2});
  if(o.peak){const t=S.hp(0,1.735,-.03);k.L('head','c',o.peak,t,[t[0],t[1]+o.ph*S.hs,t[2]-o.ph*.5*S.hs],.05*S.hs,.004,6)}
  if(o.tip!=null){const t=S.hp(0,1.69,-.04);k.L('head','c',o.tip,t,S.hp(0,1.63,-.2),.04*S.hs,.008,6)}}
// ---------------- restore-pass helpers (f6_) ----------------
// tusks jutting up from the lower jaw (base head coordinates: x either side of the middle), long and thick like the old goblins',
// tilted forward clear of the upper lip; their roots are set into the chin by hand (no seating: that pushed them back into the lip)
function f6_tusks(k,M,S,col,x,len,w){[-1,1].forEach(s=>{const q=S.hp(s*x,1.556,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1});if(p){k.p('head','cone4','c',col,p[0],p[1]+len*.2*S.hs,p[2]+.004,w*S.hs,len*S.hs,w*.85*S.hs,.32,0,-s*.16);k.P[k.P.length-1].noSeat=1}})}
// a belt: a band of the body's surface pushed out by off, its rim tucked down to just above what lies under it (under: the
// offset of the shirt or robe beneath; 0 on bare skin), so a narrow belt keeps its full height instead of sinking into the cloth
function f6_belt(B,M,y,h,off,col,under){cgShell(B,M,m=>m.part=='torso'&&Math.abs(m.y-y)<h,off,col,{rim:Math.min(.85,((under||0)+.003)/off)})}
// a strap of points on the torso surface ([y, angle round the body (0 front, π/2 right), offset]…), bending with the skin under it
function f6_strap(B,M,S,L,r,col){const pts=L.map(([y,a,o])=>cgSurf(M,S,y,a,o));cgTube(B,pts,pts.map(()=>r),pts.map(p=>cgWAt(M,p)),col,{seg:6})}
// the cape of 3394's cgCape, its rows spaced with the body's height (short bodies too), with an optional trim along the hem
function f6_cape(B,S,o){const J=S.J,h=S.h||1,top=S.torso[6][0],len=o.len||.4,w=o.w||1,off=o.off||.03,rag=o.rag==null?.5:o.rag,col=o.col,ins=o.ins==null?mdSh(col,.5):o.ins;
  const at=(y,wt,rx)=>{const q=cgTAt(S,Math.min(top,y));return {p:[0,y,q.z-(q.b+off+Math.max(0,top-y)*.1)],rx:rx*w,f:.014,b:.014,w:wt}};
  const Y=[top+.01,top-.1*h,top-.25*h,top-.4*h,Math.min(top-.46*h,J.cp1[1]-.1*h),Math.min(top-.6*h,J.cp2[1]),len],cw=y=>y>J.cp0[1]-.04?[['chest',.6],['cp0',.4]]:y>J.cp1[1]?mdWb('cp0','cp1',(J.cp0[1]-y)/(J.cp0[1]-J.cp1[1])):y>J.cp2[1]?mdWb('cp1','cp2',(J.cp1[1]-y)/(J.cp1[1]-J.cp2[1])):[['cp2',1]];
  const R=Y.map((y,i)=>at(y,cw(y),.18+i*.022));R[0].p[2]=-(cgTAt(S,top).b+off*.4);
  mdLoft(B,R,{seg:24,capA:true,col:m=>m.s>.2?ins:(o.hem!=null&&m.i>R.length-1.55?o.hem:o.trim!=null&&m.i<.6?o.trim:Math.round(Math.atan2(m.c,-m.s)*9)%2?col:mdSh(col,.82)),keep:m=>!(m.i>R.length-2.2&&a181H(Math.round(Math.atan2(m.c,m.s)*6),2)<rag*(m.i-(R.length-2.2))*.9)})}
// skin hidden under clothes is not drawn (restore pass: keeps each model near 15k triangles). f6_reg registers a cage foe
// like cg181Reg; while its builder runs, every shell grown from the body (cgShell, and cgBelt / cgHood / cgHair through it)
// is noted, and the body's skin (C.f6skin, set by cgGoblinBody / cgHumanBody) is drawn last, leaving out the faces that lie
// under a shell, except the ring of faces along each shell's edge (so no gap can show under a shell's tucked rim). Shells with
// an untucked rim (rim 1: a helm) hide nothing. Shells bend with the same weights as the skin, so nothing shows through in motion.
function f6_keep(M,L){const F=M.F,cov=F.map(f=>{const m=cgInfo(M,f);return L.some(s=>s(m))}),open=new Uint8Array(M.V.length);F.forEach((f,i)=>{if(!cov[i])f.v.forEach(v=>open[v]=1)});
  const keep=F.map((f,i)=>!cov[i]||f.v.some(v=>open[v]));return (m,fi)=>keep[fi]}
function f6_reg(key,S,fn){cg181Reg(key,S,function(B,P,k,C,S2){const L=[],sh=cgShell;
  cgShell=function(B2,M2,sel,off,col,o){if(M2===C.M&&!(o&&o.rim===1))L.push(sel);return sh.apply(this,arguments)};
  try{fn(B,P,k,C,S2)}finally{cgShell=sh}cgEmit(B,C.M,C.f6skin,{keep:f6_keep(C.M,L)})})}
// a plate harness (the Blood Knight's kit): cuirass, gorget, mail skirt and tassets, belt, pauldrons, arm and leg plates,
// gauntlets, sabatons; pal {pl, pl2, ed, gd, ml, belt}; o.pauldron 'dome' | 'spiked', o.spikes
function cgPlate(B,k,M,S,pal,o){o=o||{};const T=S.torso,J=S.J,wy=T[2][0],sh=T[6][0],ey=J.aR1[1],wr=J.aR2[1],kn=J.rh1[1],an=J.rh2[1],{pl,pl2,ed,gd,ml}=pal;
  cgShell(B,M,m=>m.part=='torso'&&m.y>wy-.02,.034,m=>m.y<wy+.03||m.y>sh+.02?gd:m.y<wy+.12?(Math.round(m.y*34)%2?pl:pl2):Math.abs(m.x)<.025&&m.s>0?pl2:Math.round(Math.atan2(m.x,m.z)*7)%2?pl:mdSh(pl,.84),{t:'m'});
  cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh)||(m.part=='head'&&m.y<S.hp(0,1.535,0)[1]),.05,m=>m.y>S.hp(0,1.5,0)[1]?gd:pl2,{t:'m'});
  cgSkirt(B,S,wy-.04,J.lh0[1]-.24,.05,.03,m=>Math.round(m.y*60)%3==0?mdSh(ml,.7):ml,{n:5});
  cgSkirt(B,S,wy-.04,J.lh0[1]-.15,.05,.052,m=>m.y<J.lh0[1]-.13?gd:Math.round(m.y*30)%2?pl:pl2,{n:5,t:'m',keep:m=>Math.abs(m.c)>.25||m.s<-.2});
  cgBelt(B,M,wy-.015,.022,.058,pal.belt||0x1a1012,'m');const bk=cgSurf(M,S,wy-.015,0,.062);k.p('pelvis','sph','m',gd,bk[0],bk[1],bk[2],.03,.028,.014);
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],L=s<0?'lh':'rh';
    [[.05,.15,.11,.16,pl],[.0,.14,.09,.15,pl2],[-.05,.13,.075,.135,ed]].forEach(([dy,sx,sy,sz,c],j)=>{k.p(A+'0','hem','m',c,a[0]+s*(.03+j*.014),a[1]+dy,a[2],sx,sy,sz,0,0,s*(.42+j*.12));k.p(A+'0','tor','m',gd,a[0]+s*(.03+j*.014),a[1]+dy-.004,a[2],sx,.012,sz,0,0,s*(.42+j*.12))});
    if(o.spikes)for(let j=0;j<3;j++)k.L(A+'0','m',o.spikes,[a[0]+s*(.06+j*.03),a[1]+.08,a[2]-.04+j*.04],[a[0]+s*(.11+j*.03),a[1]+.2,a[2]-.05+j*.04],.022,.002,5);
    cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<a[1]-.08&&m.y>ey+.035,.022,m=>Math.round(m.y*28)%2?pl:pl2,{t:'m'});
    cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<ey-.03&&m.y>wr-.03,.022,m=>m.y<wr+.02?gd:pl,{t:'m'});
    cgShell(B,M,m=>(m.part=='hand'||(m.part=='arm'&&m.y<wr-.03))&&Math.sign(m.x)==s,.012,pl,{t:'m'});cgFingers(k,S,s,pl,'fist',1.1,null,0,'m');
    const e=J[A+'1'],eb=e[2]-.06;k.p(A+'1','sph','m',pl2,e[0],e[1],eb,.05,.05,.04);k.L(A+'1','m',ed,[e[0],e[1],eb-.02],[e[0]+s*.02,e[1]+.03,eb-.09],.02,.002,4);
    cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn+.05&&m.y<J.lh0[1]-.1,.024,m=>Math.round(m.y*24)%2?pl:pl2,{t:'m'});
    const kq=J[L+'1'];k.p(L+'1','hem','m',pl2,kq[0],kq[1],kq[2]+.075,.075,.055,.06,Math.PI/2,0,0);k.L(L+'1','m',ed,[kq[0],kq[1]+.01,kq[2]+.12],[kq[0],kq[1]+.07,kq[2]+.18],.02,.002,4);
    cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<kn-.04&&m.y>an-.02,.022,m=>m.y<an+.04?gd:m.s>.6?pl2:pl,{t:'m'});
    cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.016,pl,{t:'m'})})}

// ===================================================================== goblins =====================================================================
// (restore pass) the old goblins were stocky: a broad, deep chest, thick arms and legs, a big head on a thick neck, short
// legs; tusks long and thick. GOB181 now builds that bulk (it used to be a thin, tall body).
const GOB181=o=>Object.assign({h:.74,w:1.18,d:1.12,rw:[1,1.06,1.02,1.08,1.14,1.14,1.16,1.12],rf:[1,1.04,1.1,1.12,1.12,1.1,1.05,1],at:1.42,lt:1.36,hs:1.18,hw:1.06,armL:1.04,legL:.88,foot:1.15,footW:1.2,nw:1.35},o||{});
function cgGoblinBody(B,k,C,S,K){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceGoblin()));
  C.f6skin=m=>cgFacePaint(S,m,K.sk,{sock:0x1a1408})||(m.s<-.4?mdSh(K.sk,.82):a181Nz(K.sk,m,.22,18));   // the skin is drawn by f6_reg, after the clothes
  cgEyes(k,M,S,K.eye,.038,1.628,K.er||.95,K.eo==null?-.001:K.eo);cgEars(k,M,S,K.sk,1.63,.15,.25,.45,.03,mdSh(K.sk,.7));f6_tusks(k,M,S,0xe0d8b8,.027,.036,.0095);
  [-1,1].forEach(s=>{cgFingers(k,S,s,K.sk,K.fist&&K.fist(s)?'fist':'claw',1,0x1a1408,.012);cgToes(k,S,s,mdSh(K.sk,.85),.012)});return M}
// the old goblins' dark hide breeches over the hips, and a loincloth: one flap in front, one behind, over a belt
function f6_gobLoin(B,M,S,lo,belt,pa){const T=S.torso,J=S.J,wy=T[2][0],hy=J.lh0[1];
  cgShell(B,M,m=>(m.part=='torso'&&m.y<wy+.01)||(m.part=='leg'&&m.y>J.lh1[1]+.1),.01,m=>a181Nz(pa,m,.3,14));
  cgSkirt(B,S,wy-.02,J.lh1[1]+.02,.03,.03,m=>a181Nz(m.y<J.lh1[1]+.07?mdSh(lo,.78):lo,m,.25,12),{n:5,keep:m=>Math.abs(m.c)<.42||m.y>hy-.01});
  f6_belt(B,M,wy-.01,.024,.034,belt,.01)}
// ---------------- Hobgoblin: a stocky brute with a club: breeches and a loincloth, a shoulder strap, a spiked pauldron, leather bracers, a bone necklace ----------------
(function(){const S=cgHuman(GOB181()),K={sk:0x56603c,eye:0xffc020,fist:s=>s>0},lt=0x3a2618,lo=0x5a4628,T=S.torso,J=S.J;
  f6_reg('hob',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    f6_gobLoin(B,M,S,lo,lt,0x4a3a22);
    // the strap: from the right shoulder down across the chest to the left hip, and over the shoulder down the back
    f6_strap(B,M,S,[[wy+.02,-.75,.012],[(wy+sh)/2,-.1,.012],[sh-.05,.42,.012],[sh+.015,1.2,.014],[sh-.05,Math.PI-.45,.012],[(wy+sh)/2,Math.PI+.15,.012],[wy+.02,Math.PI+.75,.012]],.013,lt);
    const a=J.aL0;k.p('aL0','hem','m',0x4a3a26,a[0]-.03,a[1]+.03,a[2],.12,.09,.12,0,0,-.4);for(let i=0;i<3;i++)k.L('aL0','m',0x8a8a90,[a[0]-.06-i*.028,a[1]+.07,a[2]-.025+i*.028],[a[0]-.1-i*.028,a[1]+.16,a[2]-.025+i*.028],.018,.002,5);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.012,m=>Math.round(m.y*50)%2?lt:mdSh(lt,.75))});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,sh-.035-Math.abs(i-3)*.012,(i-3)*.26,.006);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x6a3a2a,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
// ---------------- Hobgoblin Slinger: a hood that drapes over the shoulders, a cross strap, breeches and a loincloth, a belt pouch of stones ----------------
(function(){const S=cgHuman(GOB181({h:.72})),K={sk:0x5c6640,eye:0xffc020,fist:s=>s>0},hd=0x5a4630,lo=0x6a5434,lt=0x3a2618,T=S.torso,J=S.J;
  f6_reg('sling',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    f6_gobLoin(B,M,S,lo,0x2a1a10,0x4a3a22);
    // the cross strap: left shoulder to right hip (the sling's), front and back
    f6_strap(B,M,S,[[wy+.02,.75,.012],[(wy+sh)/2,.1,.012],[sh-.05,-.42,.012],[sh+.015,-1.2,.014],[sh-.05,-Math.PI+.45,.012],[(wy+sh)/2,-Math.PI-.15,.012],[wy+.02,-Math.PI-.75,.012]],.012,lt);
    // the hood: open round the face, its cowl draped down over the shoulders and the tops of the arms, a limp point behind
    cgHood(B,k,M,S,{col:m=>a181Nz(m.part=='head'||m.part=='neck'?hd:mdSh(hd,.9),m,.3,16),off:.02,drape:.09,arm:.07,tip:mdSh(hd,.9)});
    const p=cgSurf(M,S,wy-.03,1.4,.04);k.p('pelvis','sph','c',0x4a3420,p[0],p[1],p[2],.045,.055,.042)})})();
// ---------------- Goblin Shaman: a long robe, a skull worn over the brow (the green eyes glow beneath it), a crest of feathers, bead and fang necklaces ----------------
(function(){const S=cgHuman(GOB181({h:.8,legL:.92})),K={sk:0x54644a,eye:0x7aff6a,er:1.2,eo:.001,fist:s=>s>0},rb=0x3a5434,rb2=0x2e4628,bone=0xc8bea4,T=S.torso,J=S.J;
  f6_reg('shaman',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03&&Math.abs(Math.atan2(m.x,m.z))>.35)||(m.part=='arm'&&m.y>J.aR2[1]+.04),.016,m=>a181Nz(rb,m,.3,14));
    cgSkirt(B,S,wy-.02,J.lh2[1]+.1,.1,.024,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,m,.25,12),{n:6,keep:m=>!(m.y<J.lh1[1]-.08&&a181H(Math.round(Math.atan2(m.c,m.s)*9),2)<(J.lh1[1]-.08-m.y)*2)});
    f6_belt(B,M,wy-.01,.024,.03,0x5a4a2a,.016);
    // the skull: a bone cap over the brow and crown (its own dark eye holes above the real ones), the glowing eyes left bare
    const bx=m=>m.x/(S.hs*1.06),by=m=>(m.y-S.nb)/S.hs+1.52;
    cgShell(B,M,m=>m.part=='head'&&by(m)>1.645&&m.s>-.25,.012,m=>{const x=bx(m),y=by(m);if(Math.abs(Math.abs(x)-.03)<.014&&Math.abs(y-1.676)<.009)return 0x14100c;
      if(m.s>.5&&Math.abs(x)<.006&&y>1.651&&y<1.664)return 0x14100c;return Math.abs(x+.012-(y-1.66)*.4)<.003&&y>1.685?0x6a6050:a181Nz(bone,m,.2,30)},{rim:.35});
    for(let i=0;i<5;i++){const t=S.hp(-.06+i*.03,1.72,-.02);k.L('head','c',[0x8a2a1a,0x2a6a8a,0xc8a02a,0x2a2a2a,0x8a2a1a][i],t,[t[0]*2.2,t[1]+.13*S.hs,t[2]-.05],.02,.003,4)}
    for(let j=0;j<2;j++)for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.02-j*.04-Math.abs(i-4)*.01,(i-4)*.2,.018);k.p('chest',i%2?'cone4':'sph','c',i%2?0xe8e0c8:j?0x2a6a3a:0x8a2a1a,p[0],p[1]-.01,p[2],.01,i%2?.03:.01,.009,Math.PI)}})})();
ST179.hob={sx:.22,hx:-.2,lk:.27,rk:.27,az:.08,lz:-.1,le:-.25,ex:-.15};ST179.sling={sx:.2,hx:-.18,lk:.27,rk:.27,lz:-.1,le:-.25};ST179.shaman={sx:.22,hx:-.2,lk:.2,rk:.2,lz:-.08,le:-.3};

// ===================================================================== humans =====================================================================
function cgHumanBody(B,k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman(o.face)));
  C.f6skin=m=>(o.paint&&o.paint(m))||cgFacePaint(S,m,K.sk)||(m.s<-.4?mdSh(K.sk,.85):a181Nz(K.sk,m,.15,20));   // the skin is drawn by f6_reg, after the clothes
  if(o.glow)cgEyes(k,M,S,o.glow,.036,1.629,.9,-.001);else[-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p){k.p('head','sph','c',0xd8d0c4,p[0],p[1],p[2]-.003,.011*S.hs,.007*S.hs,.006);k.p('head','sph','c',K.iris||0x2a1a10,p[0]-s*.001,p[1],p[2]+.002,.005*S.hs,.005*S.hs,.003)}});
  if(o.ears!==false)cgEars(k,M,S,mdSh(K.sk,.92),1.625,.05,.15,.6,.02);
  [-1,1].forEach(s=>{if(!(o.noHands&&o.noHands(s)))cgFingers(k,S,s,K.hand||K.sk,K.fist&&K.fist(s)?'fist':'open',1,mdSh(K.sk,.7),0)});return M}
const HUM181=o=>Object.assign({h:1.02,w:1.02,d:1.02,rw:[1,1.05,1,1.02,1.08,1.08,1.1,1.05],at:1.1,lt:1.05,hs:.96,armL:1.0,legL:1.03},o||{});
// (restore pass) the old human foes stood about 15–20% shorter than the first cage versions (their heights are matched again
// with h below); the head keeps its size, so they read sturdier, like the old ones.
// ---------------- Bandit: dark leather garb with crossed straps, a hood, a black cloth mask over the lower face, a red sash, a short ragged cape with a red hem, boots ----------------
(function(){const S=cgHuman(HUM181({h:.8,w:.98,at:1.02,lt:1.04,hs:.94})),K={sk:0x9a7a62,fist:s=>s>0},lt=0x34343c,lt2=0x26262c,bt=0x2a2018,red=0x6a2222,T=S.torso,J=S.J;
  f6_reg('bandit',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{ears:false}),wy=T[2][0],sh=T[6][0],yc=(wy+sh)/2;
    cgShell(B,M,m=>(m.part=='torso'&&m.y>J.lh0[1]-.06)||(m.part=='arm'&&m.y>J.aR2[1]+.02),.014,m=>a181Nz(m.part=='arm'?lt2:lt,m,.3,16));
    [-1,1].forEach(s=>f6_strap(B,M,S,[[sh-.03,s*.62,.02],[(sh+yc)/2,s*.3,.02],[yc,0,.02],[(wy+yc)/2,-s*.3,.022],[wy+.02,-s*.6,.02]],.009,mdSh(lt,.55)));
    cgShell(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.01,m=>a181Nz(0x2e2a30,m,.3,16));
    // boots with a turned-down cuff
    const bt0=J.rh1[1]-.08;cgShell(B,M,m=>m.part=='foot'||(m.part=='leg'&&m.y<bt0),.02,m=>m.part=='foot'&&m.y<.025?0x1e1610:a181Nz(bt,m,.3,16));
    cgShell(B,M,m=>m.part=='leg'&&m.y<bt0+.005&&m.y>bt0-.04,.032,m=>a181Nz(0x4a3020,m,.25,16),{rim:.5});
    // the hood, and the black cloth mask over the mouth and nose
    cgHood(B,k,M,S,{col:m=>a181Nz(0x2a2a30,m,.3,16),off:.016,drape:.08});const my=S.hp(0,1.612,0)[1];
    cgShell(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<my,.012,m=>m.y>my-.006*S.hs?0x2c2c32:a181Nz(0x1c1c20,m,.25,20),{rim:.1});
    // a red sash, its knot and two tails on the left hip; daggers at both hips
    f6_belt(B,M,wy-.01,.026,.028,m=>a181Nz(red,m,.25,20),.014);const kn=cgSurf(M,S,wy-.012,-.9,.03);k.p('pelvis','sph','c',mdSh(red,.85),kn[0],kn[1],kn[2],.02,.018,.014);
    [0,1].forEach(i=>k.L('pelvis','c',i?mdSh(red,.8):red,[kn[0],kn[1]-.008,kn[2]],[kn[0]-.012+i*.02,kn[1]-.11+i*.02,kn[2]+.012],.012,.008,4));
    [-1,1].forEach(s=>{const p=cgSurf(M,S,wy-.02,s*1.2,.03);k.L('pelvis','m',0x8a8a92,p,add3(p,[s*.01,-.14,.02]),.008,.002,4)});
    f6_cape(B,S,{len:J.lh1[1]+.06,w:.9,col:0x2a1c1e,ins:0x160e10,hem:0x4a1a1a,rag:.35})})})();
// ---------------- Brigand Captain: a light-grey mail hauberk with short sleeves and a skirt, a red tabard, a nasal helm with cheek guards, a beard,
// round pauldrons (spiked on the left), leather bracers, brown leather legs, boots with white fur cuffs, a short cape ----------------
(function(){const S=cgHuman(HUM181({h:.84,w:1.08,d:1.06,at:1.2,lt:1.12})),K={sk:0x9a7258,fist:s=>s>0},ml=0x80828a,ml2=0x74767e,tb=0x6a1e18,tb2=0x3a0e0a,ir=0x6a6c72,ir2=0x4a4e56,T=S.torso,J=S.J;
  f6_reg('brigand',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0],kn=J.rh1[1];
    // the hauberk: chest and back, short sleeves to above the elbow, and its skirt to mid-thigh with a darker hem
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.04)||(m.part=='arm'&&m.y>J.aR1[1]+.04),.016,m=>a181Nz(Math.round(m.y*60)%2?ml:ml2,m,.12,20),{t:'m'});
    cgSkirt(B,S,wy-.02,kn+.13,.05,.03,m=>m.y<kn+.17?mdSh(ml,.7):Math.round(m.y*60)%2?ml:ml2,{n:5,t:'m'});
    // the tabard: front and back panels over the hauberk, hanging to the knees
    cgShell(B,M,m=>m.part=='torso'&&Math.abs(m.x)<.1&&Math.abs(m.s)>.5&&m.y<sh-.02&&m.y>wy-.04,.03,m=>a181Nz(tb,m,.2,16),{rim:.3});
    cgSkirt(B,S,wy-.02,kn+.04,.05,.05,m=>m.y<kn+.07?tb2:a181Nz(tb,m,.2,16),{n:5,keep:m=>Math.abs(m.c)<.38});f6_belt(B,M,wy-.01,.026,.042,0x2a1a10,.03);
    // the helm: a dome with a brow band, cheek guards down the sides of the face, a nasal bar
    const hb=m=>(m.y-S.nb)/S.hs+1.52;cgShell(B,M,m=>m.part=='head'&&(hb(m)>1.655||(Math.abs(m.x)>.046*S.hs&&m.s>-.35&&m.s<.8&&hb(m)>1.585)),.026,m=>Math.abs(hb(m)-1.662)<.007?ir:a181Nz(ir2,m,.15,20),{t:'m',rim:.4});
    const np=S.hp(0,1.64,0),nr=cgRay(M,[0,np[1],np[2]+.5],[0,0,-1],{head:1});if(nr)k.p('head','box','m',ir,0,np[1]-.012,nr[2]+.026,.022,.07,.012);
    cgFur(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-S.hp(0,1.557,0)[1])<.008*S.hs),{off:.01,len:.05,col:0x3a2414,col2:0x2a180c,seed:61,jag:.5,lump:[.6,.6]});
    // round pauldrons, the left one spiked
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A];k.p(A,'hem','m',ir,a[0]+s*.03,a[1]+.03,a[2],.115,.09,.12,0,0,s*.4);k.p(A,'tor','m',ir2,a[0]+s*.03,a[1]+.026,a[2],.115,.012,.12,0,0,s*.4);
      if(s<0)for(let i=0;i<2;i++)k.L(A,'m',0x9a9ea6,[a[0]-.06-i*.03,a[1]+.07,a[2]-.02+i*.04],[a[0]-.1-i*.03,a[1]+.16,a[2]-.02+i*.04],.018,.002,5)});
    // leather bracers, brown leather legs, boots with white fur cuffs
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.07&&m.y>J[A+'2'][1]+.01,.012,m=>Math.round(m.y*50)%2?0x4a3020:0x3a2618)});
    cgShell(B,M,m=>(m.part=='leg'&&m.y>kn-.08)||(m.part=='torso'&&m.y<J.lh0[1]-.06),.01,m=>a181Nz(0x4a3426,m,.3,16));
    [-1,1].forEach(s=>{cgShell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<kn-.06))&&Math.sign(m.x)==s,.022,m=>m.part=='foot'&&m.y<.025?0x1e1610:a181Nz(0x4a3220,m,.3,16));
      cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&Math.abs(m.y-(kn-.075))<.028,{off:.032,len:.045,col:0xd8ccb0,col2:0xb4a88c,seed:62+s,jag:.5,lump:[.8,.4]})});
    f6_cape(B,S,{len:J.lh1[1]+.12,w:1.0,col:0x4a1410,ins:0x200806,rag:.5})})})();
// ---------------- Ember Cultist: a deep red hood with horns, a face lost in shadow (only the eyes burn), a long robe, a glowing sigil ----------------
(function(){const S=cgHuman(HUM181({h:.9,w:.96,at:.95})),K={sk:0x140c0a,hand:0x8a6a56,fist:s=>s>0},rb=0x4a100c,rb2=0x2a0806,T=S.torso,J=S.J;
  f6_reg('cultist',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:0xff6a20,ears:false}),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,m=>a181Nz(rb,m,.3,14));cgSkirt(B,S,wy-.01,.03,.14,.024,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,m,.25,12),{n:7});
    cgHood(B,k,M,S,{col:m=>a181Nz(0x380a08,m,.3,16),off:.022,drape:.12,peak:0x380a08,ph:.06});
    [-1,1].forEach(s=>{const t=S.hp(s*.06,1.7,-.01);let p=t;[[s*.05,.06,-.02],[s*.03,.06,-.04],[0,.05,-.05]].forEach((d,j)=>{const n=add3(p,mul3(d,S.hs));k.L('head','c',0x2a2420,p,n,(.022-j*.006)*S.hs,(.016-j*.006)*S.hs,5);p=n})});
    // the sigil: a burning diamond on the breast, set into the robe (it touches the robe's surface, so it is not seated in the skin)
    f6_belt(B,M,wy-.01,.024,.03,0x1e0806,.016);const g=cgSurf(M,S,J.chest[1]+.03,0,.016),n0=k.P.length;k.p('chest','oct','g',0xff6a20,g[0],g[1],g[2]+.003,.032,.05,.01);k.p('chest','oct','c',0x1e0806,g[0],g[1],g[2]-.001,.044,.066,.01);
    for(let i=n0;i<k.P.length;i++)k.P[i].noSeat=1})})();
// ---------------- Hollow Knight: black plate, a great helm with a glowing red visor slit and breathing holes, bone horns, a dark cape ----------------
(function(){const S=cgHuman(HUM181({h:.9,w:1.1,d:1.08,rw:[1.12,1.18,1.12,1.16,1.22,1.22,1.28,1.3],at:1.32,lt:1.28,hs:.96,nw:1.25,foot:1.05,footW:1.1})),T=S.torso,J=S.J;
  const pal={pl:0x24262c,pl2:0x34363e,ed:0x4a4c56,gd:0x5a5e68,ml:0x2a2a30,belt:0x141418};
  f6_reg('knight',S,function(B,P,k,C){const M=C.M;C.f6skin=0x161618;cgPlate(B,k,M,S,pal);
    // the great helm: the visor slit is part of the helm's own surface, burning red (the glow layer); a band of lighter steel
    // above it, and breathing holes punched in the right cheek plate
    const hb=m=>(m.y-S.nb)/S.hs+1.52,bx=m=>m.x/S.hs,slit=m=>m.s>.42&&Math.abs(hb(m)-1.629)<.0115&&Math.abs(bx(m))<.072;
    const holes=m=>m.s>.45&&[[.03,1.585],[.045,1.585],[.03,1.571],[.045,1.571],[.06,1.578]].some(([x,y])=>Math.abs(bx(m)-x)<.0055&&Math.abs(hb(m)-y)<.0045);
    cgShell(B,M,m=>m.part=='head'&&!slit(m),.03,m=>{if(holes(m))return 0x050404;const y=hb(m);if(m.s>.3&&(Math.abs(y-1.629)<.017))return 0x0e0e10;if(Math.abs(y-1.664)<.007)return pal.gd;return y>1.7&&Math.abs(bx(m))<.03?pal.pl2:pal.pl},{t:'m',rim:1});
    cgShell(B,M,m=>m.part=='head'&&slit(m),.03,m=>Math.abs(hb(m)-1.629)<.006?0xff3a20:0xd01a10,{t:'g',rim:1});
    [-1,1].forEach(s=>{const q=S.hp(s*.09,1.69,-.01);let p=q;[[s*.04,.05,-.02],[s*.02,.06,-.04],[-s*.005,.05,-.05]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',0x8a8270,p,n,.026-j*.007,.019-j*.007,5);p=n})});
    cgCape(B,S,{len:J.lh1[1]-.05,w:1.2,col:0x18141e,ins:0x0c0a10,trim:0x2a1e30,rag:.6})})})();
ST179.knight={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};
// ---------------- Zealot of the Endless One: a bronze hood draped on the shoulders, a dark mask over the lower face, a patch with a red lens over
// one eye, a crest of five viper spines and three plumes, a bare scarred torso, a rust kilt, a dagger sheath on the hip, wrapped forearms and shins, bone charms ----------------
(function(){const S=cgHuman(HUM181({h:.8,w:.96,d:.95,at:1.0,lt:.98})),K={sk:0x664a38,fist:s=>s>0},rust=0x4a1a0e,rust2=0x30100a,wrap=0x6a5e48,bronze=0x4e3e24,T=S.torso,J=S.J;
  f6_reg('ss165zealot',S,function(B,P,k,C){const sc=mdSh(K.sk,.65),M=cgHumanBody(B,k,C,S,K,{ears:false,paint:m=>{if(m.part!='torso')return null;const a=Math.atan2(m.x,m.z),w=Math.sin(a*2+m.y*13);return Math.abs(w)<.09&&m.y>T[2][0]&&m.y<T[6][0]-.02?sc:null}}),wy=T[2][0];
    const hb=m=>(m.y-S.nb)/S.hs+1.52;
    cgHood(B,k,M,S,{col:m=>a181Nz(m.part=='torso'&&m.y<T[6][0]-.04?mdSh(bronze,.82):bronze,m,.25,16),off:.02,drape:.1,arm:.06});
    // the mask over the mouth and nose, edged in rust
    cgShell(B,M,m=>m.part=='head'&&m.s>.1&&hb(m)<1.611,.012,m=>hb(m)>1.604?rust2:a181Nz(mdSh(bronze,.55),m,.2,20),{rim:.1});
    // the eye patch over the left eye: a dark plate, a ring, a red glass lens
    const e=S.hp(.036,1.629,0),ep=cgRay(M,[e[0],e[1],e[2]+.4],[0,0,-1],{head:1});
    if(ep){k.p('head','box','c',0x14100c,ep[0],ep[1],ep[2]+.001,.034*S.hs,.03*S.hs,.012);k.p('head','ring','m',0x6a5a3a,ep[0],ep[1],ep[2]+.006,.016*S.hs,.12,.016*S.hs,Math.PI/2);k.p('head','cyl','g',0xc03020,ep[0],ep[1],ep[2]+.006,.009,.006,.009,Math.PI/2)}
    // five viper spines down the crown of the hood, three plumes from the back of it
    const n0=k.P.length;for(let i=0;i<5;i++){const a=-.45+i*.32,o=S.hp(0,1.625+Math.cos(a)*.11,Math.sin(a)*.115+.005),p=cgRay(M,[0,o[1]+Math.cos(a)*.3,o[2]+Math.sin(a)*.3],[0,-Math.cos(a),-Math.sin(a)],{head:1});
      if(p)k.p('head','cone4','c',rust2,p[0],p[1]+Math.cos(a)*.03,p[2]+Math.sin(a)*.03,.014,.05-Math.abs(i-1.5)*.006,.02,a)}
    for(let i=n0;i<k.P.length;i++)k.P[i].noSeat=1;
    for(let i=0;i<3;i++){const t=S.hp(-.04,1.69,-.06);k.L('head','c',i==1?0xe8e0d0:rust2,t,S.hp(-.09-i*.02,1.76-i*.02,-.15),.012,.002,4)}
    cgSkirt(B,S,wy-.02,J.rh1[1]+.06,.04,.02,m=>Math.round(Math.atan2(m.c,m.s)*8)%2?rust:rust2,{n:5});f6_belt(B,M,wy-.01,.024,.024,0x2a1a10,0);
    // the curved dagger's sheath on the right hip
    const sp=cgSurf(M,S,J.lh0[1]-.03,-1.5,.03);k.p('pelvis','box','c',0x2a1a10,sp[0]-.006,sp[1]-.05,sp[2]+.01,.03,.15,.045,0,0,.25);k.p('pelvis','box','m',0x6a5a3a,sp[0]-.004,sp[1]+.02,sp[2]+.01,.034,.016,.05,0,0,.25);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.02&&m.y>J[A+'2'][1],.008,m=>Math.round(m.y*60)%2?wrap:mdSh(wrap,.8));
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.02&&m.y>J[L+'2'][1]+.02,.008,m=>Math.round(m.y*50)%2?wrap:mdSh(wrap,.8));cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.012,0x3a2618)});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-3)*.014,(i-3)*.24,.008);k.p('chest',i%2?'cone4':'sph','c',i%2?0xe0d4b4:0x6a2412,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
// ---------------- Salt Caller: a salt-crusted sand robe, a tall blood-red cowl, glowing salt crystals through the shoulders and down the spine ----------------
(function(){const S=cgHuman(HUM181({h:.9,w:.96,at:.95})),K={sk:0x7a6450,fist:s=>s>0},robe=0x6e6248,robe2=0x5e5238,red=0x4a100c,salt=0xe8e4dc,gl=0x40e0c0,T=S.torso,J=S.J;
  f6_reg('ss165caller',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:gl,ears:false}),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,m=>a181Nz(robe,m,.3,14));
    cgSkirt(B,S,wy-.01,.04,.13,.024,m=>m.y<.1?mdMix(salt,0xc8c0b0,.5):m.y<.14?mdMix(robe,salt,.45):a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?robe:robe2,m,.25,12),{n:7});
    cgFur(B,M,m=>m.part=='arm'&&Math.abs(m.y-(J.aR2[1]+.06))<.02,{off:.024,len:.04,col:salt,col2:0xc8c0b0,seed:71,jag:.5,lump:[.8,.4]});
    cgHood(B,k,M,S,{col:m=>a181Nz(red,m,.3,16),off:.022,drape:.1,peak:0x3a0c08,ph:.15});
    [-1,1].forEach(s=>{const A=s<0?'aL0':'aR0',a=J[A];for(let i=0;i<3;i++){const x=a[0]+s*(i*.025),z=a[2]-.02+i*.02,p=cgRay(M,[x,a[1]+.5,z],[0,-1,0],{arm:1,torso:1});if(p)k.p(A,'oct',i?'c':'g',i?salt:gl,p[0],p[1]+.02,p[2],.022-i*.004,.06-i*.012,.022-i*.004,0,0,s*(.4+i*.25))}});   /* grown out of the shoulder's skin */
    // salt crystals breaking through the robe down the spine, leaning out of the back
    for(let i=0;i<4;i++){const y=T[6][0]-.05-i*.075*S.h,p=cgSurf(M,S,y,Math.PI,.01);k.p('chest','oct','c',i%2?0xd8d2c6:salt,p[0],p[1],p[2]-.004,.02-i*.002,.055-i*.005,.02-i*.002,-.55)}
    for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-4)*.014,(i-4)*.2,.026);k.p('chest','oct',i==4?'g':'c',i==4?gl:salt,p[0],p[1],p[2],.012)}})})();
