// ================= v181: goblins and humans on cage bodies =================
// Owner: "all enemy models that use the old humanoid structure updated to the new one". Batch 1: Hobgoblin, Slinger, Goblin
// Shaman, Bandit, Brigand Captain, Ember Cultist, Hollow Knight, Zealot of the Endless One, Salt Caller. Each keeps its
// look (colours, gear, weapon), rebuilt on the cage body. Shared here: face recipes (cgFaceHuman, cgFaceGoblin), a hood
// (cgHood), a plate harness (cgPlate, the Blood Knight's armour as a reusable kit).

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
function cgHood(B,k,M,S,o){const fy=S.hp(0,1.6,0)[1];cgShell(B,M,m=>{if(m.part=='head'){const bx=m.x/S.hs,by=(m.y-fy)/S.hs;return !(m.s>.35&&(bx*bx)/(.065*.065)+(by*by)/(.075*.075)<1)}
    return m.part=='neck'||(m.part=='torso'&&m.y>S.torso[6][0]-(o.drape||.06))},o.off||.02,o.col,{rim:.2});
  if(o.peak){const t=S.hp(0,1.735,-.03);k.L('head','c',o.peak,t,[t[0],t[1]+o.ph*S.hs,t[2]-o.ph*.5*S.hs],.05*S.hs,.004,6)}}
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
const GOB181=o=>Object.assign({h:.8,w:.9,d:.92,rw:[.95,.95,.9,.95,1,1,1.02,1],at:.86,lt:.86,hs:1.24,hw:1.06,armL:1.12,legL:.86,foot:1.15,footW:1.1},o||{});
function cgGoblinBody(B,k,C,S,K){const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceGoblin()));
  cgEmit(B,M,m=>cgFacePaint(S,m,K.sk,{sock:0x1a1408})||(m.s<-.4?mdSh(K.sk,.82):a181Nz(K.sk,m,.22,18)));
  cgEyes(k,M,S,K.eye,.038,1.628,.95,-.001);cgEars(k,M,S,K.sk,1.63,.15,.25,.45,.03,mdSh(K.sk,.7));cgTeeth(k,M,S,[[-.028,1.556,.022,1],[.028,1.556,.022,1]],0xd8d0b0);
  [-1,1].forEach(s=>{cgFingers(k,S,s,K.sk,K.fist&&K.fist(s)?'fist':'claw',1,0x1a1408,.012);cgToes(k,S,s,mdSh(K.sk,.85),.012)});return M}
// ---------------- Hobgoblin: a wiry brute with a club: loincloth, a shoulder strap, a spiked pauldron, leather bracers, a bone necklace ----------------
(function(){const S=cgHuman(GOB181()),K={sk:0x56603c,eye:0xffc020,fist:s=>s>0},lt=0x3a2618,lo=0x5a4628,T=S.torso,J=S.J;
  cg181Reg('hob',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0];
    cgSkirt(B,S,wy-.02,J.lh1[1]+.06,.05,.02,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*5)%2?lo:mdSh(lo,.8),m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*5)%2==0||m.y>J.lh0[1]-.03});
    cgBelt(B,M,wy-.01,.02,.024,lt);const p0=cgSurf(M,S,T[6][0]-.02,.5,.01),p1=cgSurf(M,S,wy+.02,-.6,.024),p2=cgSurf(M,S,T[6][0]-.04,Math.PI-.5,.01);cgTube(B,[p0,lerp3(p0,p1,.5),p1],[.013,.013,.013],[[['chest',1]],[['spine',.5],['chest',.5]],[['spine',1]]],lt,{seg:6});cgTube(B,[p0,[p0[0]*1.2,T[6][0]+.02,0],p2],[.013,.013,.013],[[['chest',1]],[['chest',1]],[['chest',1]]],lt,{seg:6});
    const a=J.aL0;k.p('aL0','hem','m',0x4a3a26,a[0]-.03,a[1]+.03,a[2],.1,.08,.1,0,0,-.4);for(let i=0;i<3;i++)k.L('aL0','m',0x8a8a90,[a[0]-.05-i*.025,a[1]+.06,a[2]-.02+i*.025],[a[0]-.09-i*.025,a[1]+.14,a[2]-.02+i*.025],.016,.002,5);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.03&&m.y>J[A+'2'][1]+.01,.012,m=>Math.round(m.y*50)%2?lt:mdSh(lt,.75))});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-3)*.012,(i-3)*.26,.006);k.p('chest',i%2?'cone4':'sph','c',i%2?0xd8d0b0:0x5a2a1a,p[0],p[1]-.012,p[2],.011,i%2?.035:.011,.009,Math.PI)}})})();
// ---------------- Hobgoblin Slinger: a ragged hood and cowl, a loincloth, a belt pouch of stones ----------------
(function(){const S=cgHuman(GOB181({h:.78})),K={sk:0x5c6640,eye:0xffc020,fist:s=>s>0},hd=0x4a3a26,lo=0x6a5434,T=S.torso,J=S.J;
  cg181Reg('sling',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0];
    cgHood(B,k,M,S,{col:m=>a181Nz(hd,m,.35,16),off:.018,drape:.1});
    cgSkirt(B,S,wy-.02,J.lh1[1]+.08,.05,.02,m=>a181Nz(lo,m,.3,12),{n:5,keep:m=>Math.round(Math.atan2(m.c,m.s)*4)%2==0||m.y>J.lh0[1]-.03});cgBelt(B,M,wy-.01,.02,.024,0x2a1a10);
    const p=cgSurf(M,S,wy-.03,1.4,.04);k.p('pelvis','sph','c',0x4a3420,p[0],p[1],p[2],.045,.05,.04)})})();
// ---------------- Goblin Shaman: a ragged robe, a skull mask over the brow, a crest of feathers, bead and fang necklaces ----------------
(function(){const S=cgHuman(GOB181({h:.82})),K={sk:0x54644a,eye:0x7aff6a,fist:s=>s>0},rb=0x3a5434,rb2=0x26381e,bone=0xc8bea4,T=S.torso,J=S.J;
  cg181Reg('shaman',S,function(B,P,k,C){const M=cgGoblinBody(B,k,C,S,K),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03&&Math.abs(Math.atan2(m.x,m.z))>.35)||(m.part=='arm'&&m.y>J.aR1[1]),.016,m=>a181Nz(rb,m,.35,14));
    cgSkirt(B,S,wy-.02,J.lh2[1]+.12,.1,.022,m=>a181Nz(rb2,m,.35,12),{n:6,keep:m=>!(m.y<J.lh1[1]&&a181H(Math.round(Math.atan2(m.c,m.s)*9),2)<(J.lh1[1]-m.y)*2.5)});
    const mt=S.hp(0,1.66,0),mp=cgRay(M,[0,mt[1],mt[2]+.5],[0,0,-1],{head:1});if(mp){k.p('head','sph2','c',bone,0,mp[1],mp[2]-.03*S.hs,.085*S.hs,.05*S.hs,.06*S.hs);[-1,1].forEach(s=>k.p('head','sph','c',0x14100c,s*.034*S.hs,mp[1]-.004,mp[2]+.02*S.hs,.017*S.hs,.012*S.hs,.008))}
    for(let i=0;i<5;i++){const t=S.hp(-.06+i*.03,1.72,-.02);k.L('head','c',[0x8a2a1a,0x2a6a8a,0xc8a02a,0x2a2a2a,0x8a2a1a][i],t,[t[0]*2.2,t[1]+.13*S.hs,t[2]-.05],.02,.003,4)}
    for(let j=0;j<2;j++)for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.02-j*.04-Math.abs(i-4)*.01,(i-4)*.2,.018);k.p('chest',i%2?'cone4':'sph','c',i%2?0xe8e0c8:j?0x2a6a3a:0x8a2a1a,p[0],p[1]-.01,p[2],.01,i%2?.03:.01,.009,Math.PI)}})})();
ST179.hob={sx:.22,hx:-.2,lk:.27,rk:.27,az:.08,lz:-.1,le:-.25,ex:-.15};ST179.sling={sx:.2,hx:-.18,lk:.27,rk:.27,lz:-.1,le:-.25};ST179.shaman={sx:.22,hx:-.2,lk:.2,rk:.2,lz:-.08,le:-.3};

// ===================================================================== humans =====================================================================
function cgHumanBody(B,k,C,S,K,o){o=o||{};const M=C.M;cgSculpt(M,{head:1},S.sculpt(cgFaceHuman(o.face)));
  cgEmit(B,M,m=>(o.paint&&o.paint(m))||cgFacePaint(S,m,K.sk)||(m.s<-.4?mdSh(K.sk,.85):a181Nz(K.sk,m,.15,20)));
  if(o.glow)cgEyes(k,M,S,o.glow,.036,1.629,.9,-.001);else[-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.5],[0,0,-1],{head:1});if(p){k.p('head','sph','c',0xd8d0c4,p[0],p[1],p[2]-.003,.011*S.hs,.007*S.hs,.006);k.p('head','sph','c',K.iris||0x2a1a10,p[0]-s*.001,p[1],p[2]+.002,.005*S.hs,.005*S.hs,.003)}});
  if(o.ears!==false)cgEars(k,M,S,mdSh(K.sk,.92),1.625,.05,.15,.6,.02);
  [-1,1].forEach(s=>{if(!(o.noHands&&o.noHands(s)))cgFingers(k,S,s,K.hand||K.sk,K.fist&&K.fist(s)?'fist':'open',1,mdSh(K.sk,.7),0)});return M}
const HUM181=o=>Object.assign({h:1.02,w:1.02,d:1.02,rw:[1,1.05,1,1.02,1.08,1.08,1.1,1.05],at:1.1,lt:1.05,hs:.96,armL:1.0,legL:1.03},o||{});
// ---------------- Bandit: dark leather garb, a hood, a cloth mask over the lower face, a short ragged cape, boots ----------------
(function(){const S=cgHuman(HUM181({w:.98,at:1.0})),K={sk:0x9a7a62,fist:s=>s>0},lt=0x34343c,lt2=0x26262c,bt=0x2a2018,T=S.torso,J=S.J;
  cg181Reg('bandit',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>J.lh0[1]-.06)||(m.part=='arm'&&m.y>J.aR2[1]+.02),.014,m=>a181Nz(m.part=='arm'?lt2:lt,m,.3,16));
    cgShell(B,M,m=>m.part=='leg'&&m.y>J.rh1[1]-.1,.01,m=>a181Nz(0x2e2a30,m,.3,16));cgShell(B,M,m=>m.part=='foot'||(m.part=='leg'&&m.y<J.rh1[1]-.08),.02,m=>a181Nz(bt,m,.3,16));
    cgHood(B,k,M,S,{col:m=>a181Nz(0x2a2a30,m,.3,16),off:.016,drape:.08});cgShell(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<S.hp(0,1.61,0)[1],.012,m=>a181Nz(0x6a2222,m,.3,20),{rim:.1});
    cgBelt(B,M,wy-.01,.02,.024,0x1a1410);[-1,1].forEach(s=>{const p=cgSurf(M,S,wy-.02,s*1.2,.03);k.L('pelvis','m',0x8a8a92,p,add3(p,[s*.01,-.14,.02]),.008,.002,4)});
    cgCape(B,S,{len:J.lh1[1]+.1,w:.9,col:0x2a1c1e,ins:0x160e10,rag:.8})})})();
// ---------------- Brigand Captain: a mail hauberk, a red tabard, a nasal helm, a beard, a spiked pauldron, pelt-cuffed boots, a short cape ----------------
(function(){const S=cgHuman(HUM181({w:1.08,d:1.06,at:1.2,lt:1.12})),K={sk:0x9a7258,fist:s=>s>0},ml=0x5a5c62,ml2=0x44464c,tb=0x6a1e18,tb2=0x3a0e0a,ir=0x4a4e56,T=S.torso,J=S.J;
  cg181Reg('brigand',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K),wy=T[2][0],sh=T[6][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>J.lh0[1]-.1)||(m.part=='arm'&&m.y>J.aR1[1]-.04),.016,m=>Math.round(m.y*70+Math.round(Math.atan2(m.x,m.z)*12)*.5)%2?ml:ml2,{t:'m'});
    cgShell(B,M,m=>m.part=='torso'&&Math.abs(m.x)<.1&&Math.abs(m.s)>.5&&m.y<sh-.02,.03,m=>m.y<wy+.03?tb2:tb,{rim:.3});
    cgSkirt(B,S,wy-.02,J.rh1[1]+.05,.03,.034,m=>m.y<J.rh1[1]+.08?tb2:tb,{n:5,keep:m=>Math.abs(m.c)<.4});cgBelt(B,M,wy-.01,.022,.04,0x2a1a10);
    cgShell(B,M,m=>m.part=='head'&&m.y>S.hp(0,1.655,0)[1],.026,ir,{t:'m',rim:.4});const np=S.hp(0,1.64,0),nr=cgRay(M,[0,np[1],np[2]+.5],[0,0,-1],{head:1});if(nr)k.p('head','box','m',ir,0,np[1]-.012,nr[2]+.026,.022,.07,.012);
    cgFur(B,M,m=>m.part=='head'&&m.s>-.2&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-S.hp(0,1.557,0)[1])<.008*S.hs),{off:.01,len:.05,col:0x3a2414,col2:0x2a180c,seed:61,jag:.5,lump:[.6,.6]});
    const a=J.aL0;k.p('aL0','hem','m',ir,a[0]-.03,a[1]+.03,a[2],.12,.09,.12,0,0,-.4);for(let i=0;i<2;i++)k.L('aL0','m',0x8a8e96,[a[0]-.06-i*.03,a[1]+.07,a[2]-.02+i*.04],[a[0]-.1-i*.03,a[1]+.16,a[2]-.02+i*.04],.018,.002,5);
    [-1,1].forEach(s=>{cgShell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<J.rh1[1]-.06))&&Math.sign(m.x)==s,.022,m=>a181Nz(0x3a2a1c,m,.3,16));cgFur(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&Math.abs(m.y-(J.rh1[1]-.07))<.03,{off:.03,len:.05,col:0x6a5a48,col2:0x4a3a2a,seed:62+s,jag:.5})});
    cgCape(B,S,{len:J.lh1[1]+.15,w:1.0,col:0x4a1410,ins:0x200806,rag:.6})})})();
// ---------------- Ember Cultist: a deep red hood with horns, a face lost in shadow (only the eyes burn), a long robe, a glowing sigil ----------------
(function(){const S=cgHuman(HUM181({w:.96,at:.95})),K={sk:0x1a100c,hand:0x8a6a56,fist:s=>s>0},rb=0x4a100c,rb2=0x2a0806,T=S.torso,J=S.J;
  cg181Reg('cultist',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:0xff6a20,ears:false}),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,m=>a181Nz(rb,m,.3,14));cgSkirt(B,S,wy-.01,.03,.14,.024,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,m,.25,12),{n:7});
    cgHood(B,k,M,S,{col:m=>a181Nz(0x380a08,m,.3,16),off:.022,drape:.12,peak:0x380a08,ph:.06});
    [-1,1].forEach(s=>{const t=S.hp(s*.06,1.7,-.01);let p=t;[[s*.05,.06,-.02],[s*.03,.06,-.04],[0,.05,-.05]].forEach((d,j)=>{const n=add3(p,mul3(d,S.hs));k.L('head','c',0x2a2420,p,n,(.022-j*.006)*S.hs,(.016-j*.006)*S.hs,5);p=n})});
    cgBelt(B,M,wy-.01,.02,.03,0x1e0806);const g=cgSurf(M,S,J.chest[1]+.02,0,.024);k.p('chest','oct','g',0xff6a20,g[0],g[1],g[2],.03,.045,.012)})})();
// ---------------- Hollow Knight: black plate, a great helm with a red slit and bone horns, a dark cape ----------------
(function(){const S=cgHuman(HUM181({h:1.04,w:1.1,d:1.08,rw:[1.12,1.18,1.12,1.16,1.22,1.22,1.28,1.3],at:1.32,lt:1.28,hs:.96,nw:1.25,foot:1.05,footW:1.1})),T=S.torso,J=S.J;
  const pal={pl:0x24262c,pl2:0x34363e,ed:0x4a4c56,gd:0x5a5e68,ml:0x2a2a30,belt:0x141418};
  cg181Reg('knight',S,function(B,P,k,C){const M=C.M;cgEmit(B,M,0x161618);cgPlate(B,k,M,S,pal);
    const sy=S.hp(0,1.629,0)[1];cgShell(B,M,m=>m.part=='head',.03,m=>{if(m.s>.55&&Math.abs(m.y-sy)<.01*S.hs&&Math.abs(m.x)<.07)return 0x050404;return m.y>S.hp(0,1.7,0)[1]&&Math.abs(m.x)<.03?pal.pl2:pal.pl},{t:'m',rim:1});
    [-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','sph','g',0xff2a1a,p[0],p[1],p[2]+.032,.014,.006,.006)});
    [-1,1].forEach(s=>{const q=S.hp(s*.09,1.69,-.01);let p=q;[[s*.04,.05,-.02],[s*.02,.06,-.04],[-s*.005,.05,-.05]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',0x8a8270,p,n,.026-j*.007,.019-j*.007,5);p=n})});
    cgCape(B,S,{len:J.lh1[1]-.05,w:1.2,col:0x18141e,ins:0x0c0a10,trim:0x2a1e30,rag:.6})})})();
ST179.knight={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};
// ---------------- Zealot of the Endless One: bare scarred torso, a bronze viper helm, a rust kilt, wrapped forearms and shins, bone charms ----------------
(function(){const S=cgHuman(HUM181({w:.96,d:.95,at:1.0,lt:.98})),K={sk:0x7a5e48,fist:s=>s>0},rust=0x4a1a0e,rust2=0x30100a,wrap=0x6a5e48,bronze=0x4a3a22,T=S.torso,J=S.J;
  cg181Reg('ss165zealot',S,function(B,P,k,C){const sc=mdSh(K.sk,.65),M=cgHumanBody(B,k,C,S,K,{ears:false,paint:m=>{if(m.part!='torso')return null;const a=Math.atan2(m.x,m.z),w=Math.sin(a*2+m.y*13);return Math.abs(w)<.09&&m.y>T[2][0]&&m.y<T[6][0]-.02?sc:null}}),wy=T[2][0];
    cgShell(B,M,m=>m.part=='head'&&m.y>S.hp(0,1.645,0)[1],.024,bronze,{t:'m',rim:.4});const t=S.hp(0,1.7,.07);k.L('head','m',bronze,t,[0,t[1]+.04,t[2]+.05],.022,.012,5);k.p('head','oct','g',0xffa030,0,t[1]+.04,t[2]+.06,.012,.012,.012);
    [-1,1].forEach(s=>{const p=S.hp(s*.07,1.67,.02);k.L('head','m',rust2,p,[p[0]+s*.04,p[1]-.06,p[2]+.02],.016,.004,4)});
    cgSkirt(B,S,wy-.02,J.rh1[1]+.06,.04,.02,m=>Math.round(Math.atan2(m.c,m.s)*8)%2?rust:rust2,{n:5});cgBelt(B,M,wy-.01,.02,.024,0x2a1a10);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.02&&m.y>J[A+'2'][1],.008,m=>Math.round(m.y*60)%2?wrap:mdSh(wrap,.8));
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<J[L+'1'][1]-.02&&m.y>J[L+'2'][1]+.02,.008,m=>Math.round(m.y*50)%2?wrap:mdSh(wrap,.8));cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.012,0x3a2618)});
    for(let i=0;i<7;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-3)*.014,(i-3)*.24,.008);k.p('chest',i%2?'cone4':'sph','c',i%2?0xe0d4b4:0x6a2412,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}})})();
// ---------------- Salt Caller: a salt-crusted sand robe, a tall blood-red cowl, glowing salt crystals through the shoulders ----------------
(function(){const S=cgHuman(HUM181({w:.96,at:.95})),K={sk:0x7a6450,fist:s=>s>0},robe=0x6e6248,robe2=0x4a3e2c,red=0x4a100c,salt=0xe8e4dc,gl=0x40e0c0,T=S.torso,J=S.J;
  cg181Reg('ss165caller',S,function(B,P,k,C){const M=cgHumanBody(B,k,C,S,K,{glow:gl,ears:false}),wy=T[2][0];
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03)||(m.part=='arm'&&m.y>J.aR2[1]+.03),.016,m=>a181Nz(robe,m,.3,14));cgSkirt(B,S,wy-.01,.04,.13,.024,m=>m.y<.14?salt:a181Nz(robe2,m,.25,12),{n:7});
    cgFur(B,M,m=>m.part=='arm'&&Math.abs(m.y-(J.aR2[1]+.06))<.02,{off:.024,len:.04,col:salt,col2:0xc8c0b0,seed:71,jag:.5,lump:[.8,.4]});
    cgHood(B,k,M,S,{col:m=>a181Nz(red,m,.3,16),off:.022,drape:.1,peak:0x3a0c08,ph:.12});
    [-1,1].forEach(s=>{const a=J[(s<0?'aL':'aR')+'0'];for(let i=0;i<3;i++)k.p(s<0?'aL0':'aR0','oct',i?'c':'g',i?salt:gl,a[0]+s*(.02+i*.03),a[1]+.06+i*.02,a[2]-.02+i*.02,.022-i*.004,.06-i*.012,.022-i*.004,0,0,s*(.4+i*.25))});
    for(let i=0;i<9;i++){const p=cgSurf(M,S,T[6][0]-.03-Math.abs(i-4)*.014,(i-4)*.2,.026);k.p('chest','oct',i==4?'g':'c',i==4?gl:salt,p[0],p[1],p[2],.012)}})})();
