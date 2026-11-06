// ================= v202 Lord Vaelric rebuilt on the humanoid cage body (owner, Nov 6 2026) =================
// Owner: "The proportions of the citadel boss are all wrong. His legs are too short and his torso is too long … make him more
// refined. Refit his armor after updating his form." Then: "his model needs an upgrade to our current humanoid skeleton and
// structure with our new modeling methods."
// The v110/v146 Vaelric was rigid pieces hung on joints (a loft per bone, balls in the joints, ~400 parts merged per joint).
// v202 builds him like the v181 cage foes (docs/MODEL_DETAIL_RECIPE.md): one connected, smoothed body from the humanoid cage
// (`cgHuman` → `cg181Body`: the torso rings with the arms grown out of shoulder sockets, the thighs out of the hips, the neck
// and a sculpted head out of the top), skinned to the humanoid skeleton's bones (HB names) with smoothed weights, so the
// shoulders, hips, elbows and knees bend as one surface. His armour is the body's own surface pushed out (`va_Sh` shells that
// replace the skin under them, so the plates fit exactly and bend with him), hung from it (mail skirt, tassets, tabard,
// cape, high collar) or set on it (pauldrons, poleyns, crown, spikes: kit parts on one bone, seated by `cgSeat`). Detail is
// paint (kit laid on a plate opts out of cgSeat, which would sink it to the skin under the plate): the face (sockets, bruised under-eyes, lips, brows), plate flutes, banding, gold trims and rivets are vertex colour
// with the body's baked creases and height light (`va_Shade`); runes glow on the g layer.
// Proportions (heroic, ≈ 8 heads): legs 53% of his height (hip joints ~2.15 m of ~4.0 m), a short waist under a deep chest,
// broad shoulders, a smaller head. The cage is built at human scale and baked ×VLR202.K.
// The skeleton is the humanoid one (pelvis, spine, chest, neck, head, aL0-2 / aR0-2, lh0-2 / rh0-2, cp0-2) under the
// Sovereign joint names his poses and moves use (`VLR202_JM`: HB → joint; HB 'aL' is the -x arm = his right, 'R' joints):
// the joints are the bones of the SkinnedMesh, so every pose, spring and move drives the skin directly. Extra bones: tab
// (tabard), hr0-2 (his long hair). Rigid pieces stay on joints: the flamberge (swd), the eyes, the bat wings (Phase II), the
// halo and the floor glyph.
var VLR202={on:1,K:2.25,geo:null,ms:0,tris:0};
var VLR202_JM={pelvis:'hips',spine:'spine',chest:'chest',neck:'neck',head:'head',aR0:'shL',aR1:'elL',aR2:'hdL',aL0:'shR',aL1:'elR',aL2:'hdR',
  rh0:'thL',rh1:'knL',rh2:'ftL',lh0:'thR',lh1:'knR',lh2:'ftR',cp0:'cp0',cp1:'cp1',cp2:'cp2',tab:'tab',hr0:'hr0',hr1:'hr1',hr2:'hr2'};
// palette (linear hex, like every md model): black plate, crimson plate, crimson edge, gold, leather, mail, cape
var VLR202C={pl:0x1e1418,pl2:0x4a0c18,ed:0x6a1420,gd:0x8a6a32,gd2:0x5a4422,lt:0x24140f,ml:0x2c2a30,cl:0x420812,cl2:0x2a0510,cin:0x160810,
  sk:0x9a8e9c,sk2:0x6e6274,sock:0x160a10,lip:0x4a0a16,hr:0xc4c0cc,hr2:0x8a8694,glow:0xff3050,bone:0xc8bca8};
// the sculpted face (base head coordinates): a long aristocratic nose, deep sockets under a hard brow, high cheekbones over
// hollow cheeks, a thin mouth and a strong chin
function vlr202Face(x,y,z,n){if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;
  d+=.023*cgG(x,y,0,1.598,.009,.014)+.012*cgG(x,y,0,1.616,.007,.012);
  [-1,1].forEach(s=>{d-=.014*cgG(x,y,s*.036,1.629,.017,.011);d+=.008*cgG(x,y,s*.056,1.602,.017,.012);d-=.006*cgG(x,y,s*.048,1.568,.024,.022);d+=.0025*cgG(x,y,s*.011,1.586,.009,.006)});
  d+=.011*cgG(x,y,0,1.648,.05,.007);d-=.003*cgG(x,y,0,1.558,.024,.005);d+=.011*cgG(x,y,0,1.536,.02,.013);return d*f}
// a point on a shell of the body (the smoothed body pushed out along its normals by off(v), as va_Sh lays it): kit placed
// with this sits on the plate itself, not on the skin under it
function vlr202ShellRay(M,off,o,d,parts){const N=M.N||(M.N=cgNormals(M)),S2={V:M.V.map((v,i)=>{const k=typeof off=='function'?off(v):off,w=v.slice();w[0]+=N[i][0]*k;w[1]+=N[i][1]*k;w[2]+=N[i][2]*k;return w}),F:M.F};return cgRay(S2,o,d,parts)}
// the body spec: heroic proportions on the 16-column cage with seated limbs
function vlr202Spec(){const hs=.92,H=va_Head(va_HYF,hs,{cheek:.7,jaw:1.2});
  const S=cgHuman(Object.assign({h:1,w:1.12,d:1.06,hs,legL:1.09,armL:1.03,at:1.28,lt:1.2,nw:1.18,foot:1.12,footW:1.15,
    // groin, hips, waist, lower ribs, chest (armpit), mid socket, shoulder line, trapezius: a narrow waist under a deep chest
    rw:[.98,1.06,.84,.98,1.16,1.24,1.32,1.28],rf:[1,1.04,.96,1.1,1.22,1.2,1.12,1.06],rb:[1,1.06,.96,1.04,1.1,1.1,1.08,1.04],
    n:16,sock:1,j2:1,footLite:1,arm:CG181.base.arm.filter((q,i)=>i!=2&&i!=5),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},H));
  S.pron={'-1':0,'1':0};S.grip={'-1':va_Grip(S,-1,.0098)};return S}
// the armour, the face, the hair, the cape (human scale; baked ×K)
function vlr202Dress(B,k,C,S){const M=C.M,T=S.torso,J=S.J,c=VLR202C,cl=va_C,wy=T[2][0],sh=T[6][0],ch=J.chest[1],hy=J.lh0[1],kn=J.rh1[1],an=J.rh2[1],ey=J.aR1[1],wr=J.aR2[1];
  const P=(bn,...a)=>{k.p(bn,...a);return k.P[k.P.length-1]},L=(bn,...a)=>{k.L(bn,...a);return k.P[k.P.length-1]},ns=p=>{p.noSeat=1;return p};
  cgSculpt(M,{head:1},S.sculpt(vlr202Face));
  M.shade=va_Shade(M,{cav:1,blur:3,y0:0,y1:T[7][0]+.3,hk:.24,dk:.1},{head:.1,neck:.3});
  // ---- the cuirass: a breastplate proud of the chest (the outline), fluted, a gilded ridge and rims; three lames over the
  //      belly, banded black and crimson; the back plate darker ----
  const pec=v=>{if(v[2]<0)return 0;const ax=Math.abs(v[0]);return .012*cgG(ax,v[1],.075,ch+.06,.06,.06)};
  va_Sh(B,M,m=>m.part=='torso'&&m.y>wy-.03&&m.y<sh+.03,v=>.036+pec(v),m=>{if(m.y<wy-.005||m.y>sh+.005)return c.gd;
    if(m.y<ch-.03){const b=Math.floor((m.y-wy)/.034);return b%2?c.pl:(m.y-wy)%.034<.006?c.gd2:c.pl2}
    if(m.s>.2&&Math.abs(m.x)<.011)return c.gd;if(m.s<-.3)return mdSh(c.pl,.8);return null},{t:'m',vcol:m=>{const f=cl(m.s*1.4,0,1)*cl(1-Math.abs(m.x)/.16,0,1);return mdMix(c.pl,c.pl2,.75*f*f)}});
  // the gorget and the high collar (crimson, flared, open in front, gilded ribs): the vampire lord's silhouette
  va_Sh(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh)||(m.part=='head'&&m.y<S.hp(0,1.532,0)[1]&&m.s<.6),.05,m=>m.y>S.hp(0,1.5,0)[1]?c.gd:c.pl2,{t:'m'});
  cgCollar(B,k,S,{top:1.71,w:1.16,col:c.pl2,ins:c.cin,cut:.34,rib:c.gd});
  // ---- belt, buckle, rivets; the mail skirt and plate tassets (sides and back); the crimson tabard in front ----
  // the belt: a band lofted round the waist over the cuirass's rim and the skirt's top (a one-row shell lies flush on the
  // skin), its rivets and the buckle set on the band's own surface
  const bY=wy-.012,bq=cgTAt(S,bY),bo=.062,bR=[-.024,.024].map(d=>({p:[0,bY+d,bq.z],rx:bq.rx+bo,f:bq.f+bo,b:bq.b+bo,w:[['pelvis',.7],['spine',.3]]}));
  mdLoft(B,bR,{seg:20,t:'m',col:m=>Math.abs(m.y-bY)>.018?mdSh(c.lt,.7):c.lt});
  const bP=(a,d)=>[Math.sin(a)*(bq.rx+bo+d),bY,bq.z+Math.cos(a)*((Math.cos(a)>0?bq.f:bq.b)+bo+d)];
  for(let i=0;i<14;i++){const a=(i+.5)/14*Math.PI*2;if(Math.cos(a)>.9)continue;const p=bP(a,.002);ns(P('pelvis','sph','m',c.gd,p[0],p[1],p[2],.0065,.0065,.0065))}
  const bk=bP(0,.006);ns(P('pelvis','dod','m',c.gd,bk[0],bk[1],bk[2],.03,.03,.014));ns(P('pelvis','oct','g',c.glow,bk[0],bk[1],bk[2]+.012,.012,.017,.008));
  cgSkirt(B,S,wy-.04,hy-.2,.03,.03,m=>Math.round(m.y*70)%3==0?mdSh(c.ml,.62):c.ml,{n:5,seg:16});
  cgSkirt(B,S,wy-.04,hy-.14,.035,.05,m=>m.y<hy-.125?c.gd:Math.round(m.y*28)%2?c.pl:c.pl2,{n:5,t:'m',seg:16,keep:m=>Math.abs(m.c)>.3||m.s<-.35});
  {const z0=cgTAt(S,wy-.03).f+.045,R=[],y0=wy+.01,y1=kn+.27,n=6;for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t;R.push({p:[0,y,z0+.03*t+.03*t*t],rx:.066+.01*t,f:.005,b:.005,w:null})}
    const wf=(x,y)=>{const t=cl((y0-.02-y)/(y0-y1),0,1);return t<=0?[['pelvis',1]]:[['pelvis',1-t],['tab',t]]};
    mdLoft(B,R,{seg:12,ref:[0,0,1],wf,col:m=>{if(Math.abs(Math.abs(m.x)-.062)<.008)return c.gd;if(m.y<y1+.03)return c.gd2;return m.s<0?c.cl2:c.cl}});
    const tz=y=>{const t=(y0-y)/(y0-y1);return z0+.03*t+.03*t*t+.005},em=[0,wy-.12,tz(wy-.12)];ns(P('pelvis','oct','m',c.gd,em[0],em[1],em[2],.03,.042,.008));ns(P('pelvis','oct','g',c.glow,em[0],em[1],em[2]+.006,.012,.018,.006))}
  // a small skull hanging from the belt on his left hip
  {const p=cgSurf(M,S,wy-.05,1.25,.075);ns(P('pelvis','sph','c',c.bone,p[0],p[1]-.04,p[2],.026,.03,.026));ns(P('pelvis','sph','c',mdSh(c.bone,.8),p[0],p[1]-.064,p[2]+.006,.018,.012,.017));
    [-1,1].forEach(q=>ns(P('pelvis','sph','g',c.glow,p[0]+q*.009,p[1]-.038,p[2]+.022,.005,.005,.004)));ns(L('pelvis','m',c.gd,[p[0],p[1]+.02,p[2]-.01],[p[0],p[1]-.012,p[2]],.004,.004,4))}
  // ---- the blood ruby at the sternum, the sigil ring round it, blood-rune veins across the breastplate (glow) ----
  {const cu=v=>.036+pec(v),sp=(y,a)=>{const d=[Math.sin(a),0,Math.cos(a)],q=cgTAt(S,y);return vlr202ShellRay(M,cu,[d[0]*.9,y,q.z+d[2]*.9],[-d[0],0,-d[2]],{torso:1})};
    const r0=sp(ch+.02,0);if(r0){ns(P('chest','tor','m',c.gd,0,r0[1],r0[2]-.002,.034,.012,.034,Math.PI/2,0,0));ns(P('chest','oct','g',c.glow,0,r0[1],r0[2]+.006,.016,.026,.01));
      [-1,1].forEach(s=>{let p=[s*.018,r0[1]-.015,r0[2]+.001];for(let i=0;i<4;i++){const q=sp(ch-.01-i*.03,s*(.25+i*.22));if(!q)continue;const nn=[q[0],q[1],q[2]];ns(L('chest','g',c.glow,p,nn,.0035-i*.0006,.003-i*.0006,4));p=nn}})}}
  // ---- pauldrons: three dome lames (black, crimson, black) with gilded rims, a row of rivets, three gold spikes; a skull
  //      trophy on the left; couters with a spike; rerebrace and vambrace shells, gilded cuffs, a rune line ----
  [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],Lg=s<0?'lh':'rh';
    [[.055,.17,.12,.18,c.pl],[.0,.16,.1,.17,c.pl2],[-.05,.145,.08,.155,c.pl]].forEach(([dy,sx,sy,sz,col],j)=>{P(A+'0','hem','m',col,a[0]+s*(.035+j*.016),a[1]+dy,a[2],sx,sy,sz,0,0,s*(.42+j*.13));
      P(A+'0','tube','m',c.gd,a[0]+s*(.035+j*.016),a[1]+dy+.003,a[2],sx*1.012,.014,sz*1.012,0,0,s*(.42+j*.13))});
    for(let j=0;j<3;j++)L(A+'0','m',c.gd,[a[0]+s*(.05+j*.03),a[1]+.12-j*.012,a[2]-.06+j*.06],[a[0]+s*(.1+j*.035),a[1]+.25-j*.02,a[2]-.08+j*.07],.022,.002,4);
    if(s>0){const p=[a[0]+s*.16,a[1]+.02,a[2]+.11];ns(P(A+'0','sph','c',c.bone,p[0],p[1],p[2],.034,.038,.034));ns(P(A+'0','sph','c',mdSh(c.bone,.8),p[0],p[1]-.03,p[2]+.01,.024,.014,.022));
      [-1,1].forEach(q=>ns(P(A+'0','sph','g',c.glow,p[0]+q*.012,p[1]+.004,p[2]+.03,.006,.006,.005)))}
    va_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<a[1]-.07&&m.y>ey+.035,.022,m=>Math.round(m.y*26)%2?c.pl:c.pl2,{t:'m'});
    va_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<ey-.03&&m.y>wr-.03,.024,m=>m.y<wr+.025?c.gd:m.s>.5&&Math.abs(m.y-(ey+wr)/2)<.07?c.ed:c.pl2,{t:'m'});
    va_Sh(B,M,m=>(m.part=='hand'||(m.part=='arm'&&m.y<wr-.03))&&Math.sign(m.x)==s,.012,c.pl,{t:'m'});
    const e=J[A+'1'],eb=e[2]-.06;P(A+'1','dod','m',c.pl2,e[0]+s*.008,e[1],eb,.052,.05,.04);L(A+'1','m',c.gd,[e[0]+s*.008,e[1],eb],[e[0]+s*.03,e[1]+.03,eb-.1],.018,.002,4);
    // the rune line down the forearm (outer side)
    {const pts=[0,.33,.66,1].map(t=>{const y=ey-.05+(wr+.05-(ey-.05))*t,q=lerp3(J[A+'1'],J[A+'2'],(y-ey)/(wr-ey)),o=[q[0]+s*.3,y,q[2]+.12],p=vlr202ShellRay(M,.024,o,nrm3(sub3(q,o)),{arm:1});return p?add3(p,mul3(nrm3(sub3(o,q)),.002)):null}).filter(Boolean);
      for(let i=0;i<pts.length-1;i++)ns(L(A+'1','g',c.glow,pts[i],pts[i+1],.0032,.0026,4))}
    // ---- legs: cuisses, poleyns with a gold spike and a side fan, greaves with a gilded ridge, pointed sabatons and spurs ----
    va_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn+.05&&m.y<hy-.12,.024,m=>Math.round(m.y*24)%2?c.pl:c.pl2,{t:'m'});
    const kq=J[Lg+'1'];P(Lg+'1','hem','m',c.pl2,kq[0],kq[1],kq[2]+.075,.078,.06,.062,Math.PI/2,0,0);L(Lg+'1','m',c.gd,[kq[0],kq[1]+.01,kq[2]+.12],[kq[0],kq[1]+.07,kq[2]+.19],.018,.002,4);
    P(Lg+'1','cone4','m',c.gd,kq[0]+s*.07,kq[1],kq[2]+.03,.04,.1,.01,0,0,-s*1.4);
    va_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<kn-.04&&m.y>an-.02,.024,m=>m.y<an+.04?c.gd:m.s>.6&&Math.abs(m.x-kq[0])<.012?c.gd:m.s>.5?c.pl2:c.pl,{t:'m'});
    va_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<an+.02))&&Math.sign(m.x)==s,.016,m=>m.y<.012?mdSh(c.pl,.7):m.s>.6?c.pl2:c.pl,{t:'m'});
    const fz=J[Lg+'2'][2]+.16*S.foot.len;L(Lg+'2','m',c.pl2,[kq[0],.026,fz],[kq[0],.014,fz+.09],.018,.002,4);
    L(Lg+'2','m',c.gd,[kq[0],.05,J[Lg+'2'][2]-.06],[kq[0],.05,J[Lg+'2'][2]-.13],.008,.001,4)});
  // ---- hands: the right closed round the sword's grip, the left an open claw ----
  va_Hand(B,S,-1,{col:c.pl,kind:'fist',len:1.1,r:.0098});va_Hand(B,S,1,{col:c.pl,nail:c.gd2,kind:'claw',len:1.4,r:.0085,claw:.034});
  // ---- the head: pale, cool in the shadows, bruised under the eyes, dark sockets, thin dark lips; white hair swept back ----
  const HLT=[[0,1.694],[.6,1.692],[1.1,1.676],[1.7,1.66],[2.2,1.594],[2.6,1.56],[3.2,1.556]],HL=(x,y,z)=>{const a=Math.abs(Math.atan2(x,z-.01));let h=1.556;
      for(let i=0;i<HLT.length-1;i++)if(a<=HLT[i+1][0]){const t=(a-HLT[i][0])/(HLT[i+1][0]-HLT[i][0]);h=HLT[i][1]+(HLT[i+1][1]-HLT[i][1])*t*t*(3-2*t);break}
      return h-.02*Math.exp(-(x/.02)*(x/.02))*(z>0?1:0)},
    bx=m=>m.x/S.hs,by=m=>(m.y-S.nb)/S.hs+1.52,hairC=m=>mdMix(c.hr2,c.hr,cl(n3Sn(m.x*.4,m.y*3,m.z*.4,30,1)*1.3-.1,0,1));
  const skinV=m=>{let col=mdMix(c.sk,mdSh(c.sk2,.9),cl(-m.nz*.8+.1,0,.7));const x=bx(m),y=by(m);
    if(m.part=='head'||m.part=='neck'){[-1,1].forEach(s=>{col=mdMix(col,0x3a2a3a,.22*cgG(x,y,s*.05,1.57,.02,.018));col=mdMix(col,0x4a2840,.4*cgG(x,y,s*.04,1.614,.016,.006));
        if(m.nz>.2)col=mdMix(col,c.sock,cl(1.3*cgG(x,y,s*.036,1.629,.02,.013),0,1));col=mdMix(col,0x2a1a22,.6*cgG(x,y,s*.04,1.648,.026,.004))});
      col=mdSh(col,1+.4*Math.max(0,-m.ny));const t=cl((y-HL(x,y,m.z/S.hs)+.016)/.009,0,1);if(t>0)col=mdMix(col,hairC(m),t*t*(3-2*t))}
    if(m.part!='head'&&m.part!='neck')return mdSh(mdMix(c.ml,0x140c10,.5),.8+.2*cl(m.ny*.5+.5,0,1));return col};
  va_Sh(B,M,m=>m.part=='head'&&by(m)>HL(bx(m),by(m),m.z/S.hs),v=>(v[2]<0?.016:.009)*cl((((v[1]-S.nb)/S.hs+1.52)-HL(v[0]/S.hs,0,v[2]/S.hs))/.025,0,1)*S.hs,null,{vcol:hairC});
  va_Body(B,M,m=>{if(m.part=='head'&&m.s>.3&&Math.abs(by(m)-1.558)<.005&&Math.abs(bx(m))<.024)return c.lip;return null},skinV);
  [-1,1].forEach(s=>{const q=S.hp(s*.013,1.554,0),f=cgRay(M,[q[0],q[1],q[2]+.3],[0,0,-1],{head:1});if(f)P('head','cone4','c',0xe0d8cc,f[0],f[1]-.008,f[2]-.003,.0045,.02,.0045,Math.PI)});
  cgEars(k,M,S,c.sk,1.632,.075,.5,.85,.014,0x5a4450);
  S.eyes=[-1,1].map(s=>{const q=S.hp(s*.036,1.629,0);return cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1],{head:1})});
  // long white locks down the back, on the three hair bones (they sway on springs)
  {const h0=J.hr0,h1=J.hr1,h2=J.hr2;for(let i=0;i<11;i++){const u=(i-5)/5,a=Math.PI+u*1.05,o=S.hp(Math.sin(a)*.3,1.66-Math.abs(u)*.04,Math.cos(a)*.3),p=cgRay(M,o,nrm3(sub3(S.hp(0,1.63,0),o)),{head:1});if(!p)continue;
    const r=.011-.002*Math.abs(u),sw=Math.sin(a),b=[p[0]+sw*.004,p[1],p[2]+.004],m1=[p[0]*1.18+sw*.01,h1[1]+.03,h1[2]-.012-Math.abs(sw)*.01],m2=[p[0]*1.3+sw*.02,h2[1]+.02,h2[2]-.02],tip=[p[0]*1.32+sw*.02,h2[1]-.13-a181H(i,7)*.04,h2[2]-.03];
    const R=[{p:b,rx:r,f:r*.45,b:r*.45,w:[['head',1]]},{p:lerp3(b,m1,.4),rx:r*1.1,f:r*.5,b:r*.5,w:[['head',.4],['hr0',.6]]},{p:m1,rx:r*1.05,f:r*.45,b:r*.45,w:[['hr0',.5],['hr1',.5]]},
      {p:m2,rx:r*.85,f:r*.4,b:r*.4,w:[['hr1',.5],['hr2',.5]]},{p:tip,rx:r*.15,f:r*.1,b:r*.1,w:[['hr2',1]]}];
    mdLoft(B,R,{seg:6,ref:nrm3([sw,0,Math.cos(a)]),capB:true,col:m=>mdMix(c.hr2,c.hr,cl(.7-m.i*.08+(i%2)*.15,0,1))})}}
  // ---- the thorned crown: a gold band, nine thorns (long and short), a blood ruby in front ----
  {const y=S.hp(0,1.704,0)[1],q=cgAt(S.head,y),rz=(q[2]+q[3])/2*1.04,rx=q[1]*1.06,zc=(q[4]||0)+(q[2]-q[3])/2;ns(P('head','tube','m',c.gd,0,y,zc,rx,.018,rz));
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2,x=Math.sin(a)*rx,z=zc+Math.cos(a)*rz,l=i%2?.05:.075;ns(L('head','m',i%2?c.gd2:c.gd,[x,y+.004,z],[x*1.25,y+l,zc+(z-zc)*1.25],.009,.0015,4))}}
  // ---- the cape: heavy, wide, ragged at the hem, gilded at the shoulders, down to the shins ----
  cgCape(B,S,{len:.33,w:1.3,off:.05,col:c.cl,ins:c.cin,rag:.8})}
// the cached geometry (built once a page): skinned layers c (cloth, skin), m (metal), g (glow), baked ×K
function vlr202Geo(){if(VLR202.geo)return VLR202.geo;const t0=performance.now(),S=vlr202Spec(),J=S.J;
  J.tab=[0,S.torso[2][0]-.05,cgTAt(S,S.torso[2][0]-.05).f+.07];
  const hd=J.head;J.hr0=[0,hd[1]+.05,hd[2]-.075];J.hr1=[0,hd[1]-.1,hd[2]-.1];J.hr2=[0,hd[1]-.25,hd[2]-.13];
  const bones=Object.assign({},HB,{tab:0,hr0:0,hr1:0,hr2:0}),B=mdB(bones),k=dkKit(),C=cg181Body(B,S);
  vlr202Dress(B,k,C,S);cgSeat(k,C.M,0);mdKit(B,k);const G=mdBake(B),K=VLR202.K;let tri=0;
  for(const t in G){const p=G[t].attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*K,p.getY(i)*K,p.getZ(i)*K);p.needsUpdate=true;G[t].computeVertexNormals();G[t].computeBoundingSphere();tri+=p.count/3}
  VLR202.tris=Math.round(tri);VLR202.ms=Math.round(performance.now()-t0);
  // poses lower the hips by offsets made for the v110 legs (hip joint 1.7 m over the ankle 0.04 m): scale them to these legs,
  // so a kneel still puts the knee on the floor and a crouch keeps the feet down
  if(!VLR202.kl){const kl=VLR202.kl=(J.lh0[1]-J.lh2[1])*K/1.66;for(const n in VLRP){const h=VLRP[n].hips;if(h&&h.length>4&&h[4]){if(h.y202==null)h.y202=h[4];h[4]=h.y202*kl}}}
  return VLR202.geo={G,S,O:B.O}}
// the Sovereign build: joints at the cage's bones (×K), the skinned body bound to them, rigid sword / eyes / wings / halo / glyph
function vlr202Build(R,e){const V=VLR202,Q=vlr202Geo(),S=Q.S,J=S.J,K=V.K,W=n=>J[n].map(v=>v*K),PW={};
  const jt=(name,parent,w,rx,ry,rz)=>{const pw=parent?PW[parent]:[0,0,0];PW[name]=w;return svJ(R,name,parent,w[0]-pw[0],w[1]-pw[1],w[2]-pw[2],rx,ry,rz)};
  PW.root=[0,0,0];svJ(R,'root',null,0,0,0);
  jt('hips','root',W('pelvis'));jt('spine','hips',W('spine'));jt('chest','spine',W('chest'));jt('neck','chest',W('neck'));jt('head','neck',W('head'));
  [['L','aR','rh'],['R','aL','lh']].forEach(([s,a,l])=>{jt('sh'+s,'chest',W(a+'0'));jt('el'+s,'sh'+s,W(a+'1'));jt('hd'+s,'el'+s,W(a+'2'));jt('th'+s,'hips',W(l+'0'));jt('kn'+s,'th'+s,W(l+'1'));jt('ft'+s,'kn'+s,W(l+'2'))});
  jt('cp0','chest',W('cp0'));jt('cp1','cp0',W('cp1'));jt('cp2','cp1',W('cp2'));jt('tab','hips',W('tab'));jt('hr0','head',W('hr0'));jt('hr1','hr0',W('hr1'));jt('hr2','hr1',W('hr2'));
  const gp=S.grip['-1'];jt('swd','hdR',add3(W('aL2'),mul3(gp,K)));
  // the skinned body
  R.root.updateMatrixWorld(true);const sk=new THREE.Skeleton(Q.O.map(n=>R.J[VLR202_JM[n]]));
  const mc=svMat(R,0xffffff,{vertexColors:true,skinning:true,roughness:.9,metalness:.04,side:THREE.DoubleSide}),mm=svMat(R,0xffffff,{vertexColors:true,skinning:true,roughness:.62,metalness:.4,side:THREE.DoubleSide}),
    mg=new THREE.MeshBasicMaterial({vertexColors:true,skinning:true,fog:false,side:THREE.DoubleSide});mg.userData.c0=0xff3050;R.glow.push(mg);R.rune=mg;
  [['c',mc],['m',mm],['g',mg]].forEach(([t,mat])=>{const G=Q.G[t];if(!G)return;const sm=new THREE.SkinnedMesh(G,mat);sm.bind(sk);sm.userData.noMerge=1;sm.userData.lpsSkip=1;sm.frustumCulled=false;sm.castShadow=t!=='g';sm.receiveShadow=false;R.root.add(sm);(R.v202m||(R.v202m=[])).push(sm)});
  R.v202=1;R.ftY0=PW.ftL[1];R.no179=1;   /* every rigid piece is placed on purpose: no v179 snapping onto the skin's bind pose */
  // ---- rigid pieces on joints (real units) ----
  const G=(k,f)=>svG('v202'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),gold=svMat(R,0xb08a3a,{roughness:.35,metalness:.8}),
    steel=svMat(R,0x8a1424,{roughness:.2,metalness:.7,emissive:0x5a0614}),leath=svMat(R,0x24140f,{roughness:.85,metalness:.1}),hair=svMat(R,0xe8e4ec,{roughness:.7}),
    mem=svMat(R,0x2a0810,{roughness:.7,side:THREE.DoubleSide,emissive:0x0a0004}),eye=svGlowMat(R,0xff3050),rune=svGlowMat(R,0xff2040);
  // eyes burning in the sockets
  {const hw=PW.head;(S.eyes||[]).forEach(p=>{if(!p)return;const x=p[0]*K-hw[0],y=p[1]*K-hw[1],z=p[2]*K-hw[2]+.004;Mm('head',G('ey',()=>new THREE.SphereGeometry(.022,6,4)),eye,x,y,z,0,0,0,1.15,.62,.55);svSpr(R,'head',VLR.col,.08,x,y,z+.02)})}
  // the flamberge: a long blood-steel blade with a glowing fuller and rune glyphs, a swept gold guard, a ruby pommel
  const sw='swd';
  Mm(sw,G('gp',()=>svLoft([[-.32,.04,.04],[.02,.04,.04]],6)),leath,0,0,0,Math.PI/2,0,0);
  [-.27,-.18,-.09].forEach(z=>Mm(sw,G('gw',()=>svLoft([[-.015,.047,.047],[.015,.047,.047]],6)),gold,0,0,z,Math.PI/2,0,0));
  Mm(sw,G('pm',()=>svLump(.07,0,.2,70)),gold,0,0,-.36);Mm(sw,G('pmg',()=>new THREE.OctahedronGeometry(.05,0)),rune,0,0,-.42);
  Mm(sw,G('gd',()=>svBlade([[-.38,.12],[-.3,0],[.3,0],[.38,.12],[.22,.06],[0,.15],[-.22,.06]],.05)),gold,0,.02,0,Math.PI/2,0,0);
  [-1,1].forEach(s=>Mm(sw,G('qt',()=>svHorn(.03,.14,0,.05,4,2)),gold,s*.37,0,.12,0,0,0));Mm(sw,G('ggm',()=>new THREE.OctahedronGeometry(.045,0)),rune,0,0,.1);
  Mm(sw,G('bl',()=>svBlade([[-.075,0],[.075,0],[.065,1.25],[.092,1.42],[.062,1.6],[.03,2.2],[0,2.42],[-.03,2.2],[-.062,1.6],[-.092,1.42],[-.065,1.25]],.025)),steel,0,.06,0,Math.PI/2,0,0);
  Mm(sw,G('fl',()=>svBlade([[-.016,.12],[.016,.12],[.012,1.5],[0,1.62],[-.012,1.5]],.05)),rune,0,.06,0,Math.PI/2,0,0);
  Mm(sw,G('lng',()=>svBlade([[-.09,0],[.09,0],[.04,.2],[0,.26],[-.04,.2]],.045)),gold,0,.08,0,Math.PI/2,0,0);
  for(let i=0;i<6;i++)Mm(sw,G('bg',()=>new THREE.OctahedronGeometry(.028,0)),rune,0,.095,.35+i*.24,0,0,0,1,.4,1.6);
  Mm(sw,G('be',()=>svBlade([[-.006,.1],[.006,.1],[.004,2.25],[-.004,2.25]],.06)),gold,.07,.06,0,Math.PI/2,0,0);
  // the bat wings (Phase II): arm bone, wrist knuckle and thumb claw, four finger bones, scalloped membranes
  [-1,1].forEach(s=>{const Ls=s>0?'L':'R',cw=PW.chest,w=svJ(R,'wg'+Ls,'chest',s*.24,.36,-.34,0,s*.35,0),E=[s*1.15,.55,0];
    Mm(w,G('wb'+Ls,()=>svTube([[0,0,0],[s*.6,.36,-.04],E],[.075,.06,.05],5)),leath);
    Mm(w,G('wk',()=>svLump(.075,0,.15,72)),leath,E[0],E[1],E[2]);Mm(w,G('wt'+Ls,()=>svHorn(.035,.22,0,.08,4,3)),hair,E[0],E[1]+.04,E[2],-1.2,s*.3,0);
    Mm(w,G('wm'+Ls,()=>vlrPoly([[0,0,0],E,[E[0],-.75,0],[s*.75,-.52,0],[s*.38,-.78,0],[s*.12,-.6,0]])),mem);
    const f=svJ(R,'wf'+Ls,w,E[0],E[1],E[2]),T=[[s*1.25,.35,-.04],[s*1.0,-.55,-.04],[s*.55,-1.1,-.02],[0,-1.3,0]];
    T.forEach((t,i)=>Mm(f,G('wfb'+Ls+i,()=>svTube([[0,0,0],[t[0]*.5,t[1]*.5+.05,t[2]*.5],t],[.045,.03,.012],4)),leath));
    Mm(f,G('wcl'+Ls,()=>svHorn(.025,.16,0,-.06,4,3)),hair,T[0][0],T[0][1],T[0][2],0,s*Math.PI/2,0);
    const Pp=[[0,0,0]];T.forEach((t,i)=>{Pp.push(t);if(i<T.length-1){const n=T[i+1];Pp.push([(t[0]+n[0])*.36,(t[1]+n[1])*.36,(t[2]+n[2])*.5])}});
    Mm(f,G('wfm'+Ls,()=>vlrPoly(Pp)),mem);w.scale.setScalar(.01);R['wing'+Ls]=w});
  // Phase II: a halo of blood over the crown, a blood glyph under his feet (v146)
  {const top=(S.hp(0,1.73,0)[1]+.06)*K-PW.head[1];const halo=Mm('head',G('hal',()=>new THREE.TorusGeometry(.26,.018,5,32)),rune,0,top+.22,-.02,Math.PI/2,0,0);halo.visible=false;halo.userData.noMerge=1;R.v146halo=halo;
    const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');g.translate(128,128);g.strokeStyle='#fff';g.lineWidth=4;[120,100,60].forEach(r=>{g.beginPath();g.arc(0,0,r,0,6.283);g.stroke()});
    g.lineWidth=3;g.beginPath();for(let i=0;i<6;i++){const a=i*2/6*6.283;g[i?'lineTo':'moveTo'](Math.cos(a)*100,Math.sin(a)*100)}g.closePath();g.stroke();for(let i=0;i<12;i++){g.save();g.rotate(i/12*6.283);g.fillStyle='#fff';g.fillRect(-3,-116,6,12);g.restore()}
    const gl=new THREE.Mesh(G('gly',()=>new THREE.PlaneGeometry(4.4,4.4).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:VLR146.col,map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    gl.position.y=.06;gl.userData.noMerge=1;gl.userData.lpsSkip=1;gl.renderOrder=17;R.root.add(gl);R.v146gly=gl;R.v202gly=gl}}
// feet on the floor: in a grounded crouch (the hips lowered, the body not lifted off the floor) the lower ankle is brought
// back to its rest height by moving the hips, so kneels, coils and lunges plant the feet instead of hovering or sinking
// (blended in as the crouch deepens). h = the pose's hip drop, r = the root's lift.
var VLR202V=new THREE.Vector3();
function vlr202Plant(R,h,r){if(!R.v202||!isFinite(R.ftY0)||!(h<-.04)||Math.abs(r||0)>.01)return 0;R.root.updateMatrixWorld(true);const v=VLR202V;let mn=1e9;
  ['ftL','ftR'].forEach(n=>{R.J[n].getWorldPosition(v);R.root.worldToLocal(v);mn=Math.min(mn,v.y)});const d=(mn-R.ftY0)*Math.min(1,(-h-.04)/.21);R.J.hips.position.y-=d;return d}
if(VLR202.on&&SVB[5]){vlrBuild=vlr202Build;SVB[5].build=vlr202Build;
  const p0=SVB[5].post;SVB[5].post=function(e,S,dt,now){p0&&p0.apply(this,arguments);try{const O=S.O;vlr202Plant(S.R,O.hips[4],O.root&&O.root[4])}catch(_){}}}
// the floor glyph's canvas texture and material belong to this boss alone: freed with him (the shared geometries stay cached)
{const f=removeE;removeE=function(e){const r=f.apply(this,arguments);try{const R=e&&e.sv&&e.sv.R;if(R&&R.v202gly){const m=R.v202gly.material;if(m.map)m.map.dispose();m.dispose();R.v202gly=null}}catch(_){}return r}}
// ---------------- v202 strikes that land where and when they are warned ----------------
// On the new frame (and already on the old one) the v110 strike poses swung the blade 3.5–5 m up, over a hero's head, and the
// thrust pointed it at the sky; the slashes' contact came ~0.1 s before the hit. Each sword strike is now three keys: the
// wind-up, a CONTACT pose (the blade crossing the middle of the warned area at a hero's height, ~1.4–1.9 m, reached with an
// accelerating ease exactly at the hit's time) and a follow-through (decelerating). The arm angles were solved for a grip
// point and a blade direction (shoulder, elbow, wrist; the torso and legs keep the v110 pose), so the tip lands in the warned
// arc / line / cone. The guard stance holds the sword low and forward (tip at chest height, pointing at the hero), and the
// recovery pose (cRec) is that guard, so every move eases back into the walk without a jump. Reach-matched shapes: the rising
// slash's cone and the first Danse Macabre circle are cut to the blade's real reach (they were 0.8 m / 0.4 m beyond it).
var VLR202S={on:1};
if(VLR202.on&&VLR202S.on&&typeof VLRP!='undefined'&&typeof VLRM!='undefined'){const A=(n,o)=>{VLRP[n]=Object.assign({},VLRP[n]||{},o)},
    G={shR:[-.579,.109,.023],elR:[-.087,0,0],hdR:[.852,.087,-.098]};
  A('s1Up',{shR:[-1.607,-.073,-.443],elR:[-1.529,0,0],hdR:[1.573,-.615,.266]});
  A('s1Cut',{hips:[0,.05,0,0,-.12,.1],chest:[.12,.05,0],shL:[-.3,0,.6],head:[0,0,0],thL:[-.5,0,0],knL:[.45,0,0],thR:[.15,0,0],shR:[-1.07,-.227,.081],elR:[-.041,0,0],hdR:[1.349,-.134,.147]});
  A('s1Hit',{shR:[-.979,.035,.318],elR:[.052,0,0],hdR:[1.171,-.21,.009]});
  A('s2Cut',{hips:[0,-.05,0,0,-.12,.15],chest:[.12,-.05,0],shL:[-.4,0,.4],head:[0,0,0],thR:[-.45,0,0],knR:[.45,0,0],thL:[.15,0,0],shR:[-.811,-.473,.552],elR:[.024,0,0],hdR:[1.124,-.242,.17]});
  A('s2Hit',{shR:[-.812,-.41,.397],elR:[.017,0,0],hdR:[1.044,-.178,.115]});
  A('thUp',{shR:[1.242,-.096,.368],elR:[-1.256,0,0],hdR:[.212,-.547,-.128]});
  A('thHit',{shR:[-1.275,.012,.499],elR:[.056,0,0],hdR:[1.223,-.104,.039]});
  A('lDraw',{shR:[-3.008,-.107,1.065],elR:[-1.571,0,0],hdR:[-.426,-.379,.218]});
  A('lGo',{shR:[-1.392,-.122,.442],elR:[.056,0,0],hdR:[1.199,-.162,.081]});
  A('rLow',{shR:[-.138,-.381,-.295],elR:[-.186,0,0],hdR:[.824,-.414,.105]});
  A('rCut',{hips:[0,0,0,0,-.15,0],chest:[.1,0,0],shL:[-.3,0,.5],thL:[-.5,0,0],knL:[.6,0,0],shR:[-1.01,-.23,.243],elR:[-.091,0,0],hdR:[1.162,-.122,.057]});
  A('rHigh',{shR:[-2.125,-.147,1.094],elR:[.052,0,0],hdR:[1.059,-.287,.36]});
  A('wDn',{shR:[-1.252,-.294,.202],elR:[.054,0,0],hdR:[1.281,-.161,.135]});
  A('dmOut',{shR:[-.427,-.19,-.641],elR:[.05,0,0],hdR:[1.31,-.624,.566]});
  A('cRec',{shR:G.shR,elR:G.elR,hdR:G.hdR});
  const M=VLRM;
  M.combo.trk=[[.38,'s1Up','io'],[.5,'s1Up','l',.01],[.61,'s1Cut','i'],[.71,'s1Hit','o'],[.86,'s1Hit','l'],[.97,'s2Cut','i'],[1.07,'s2Hit','o'],[1.3,'thUp','io'],[1.55,'thUp','l',.012],[1.68,'thHit','i'],[2.0,'cRec','io'],[2.35,'cRec','l']];
  M.combo5.trk=[[.3,'s1Up','io'],[.44,'s1Cut','i'],[.54,'s1Hit','o'],[.66,'s1Hit','l'],[.77,'s2Cut','i'],[.87,'s2Hit','o'],[.98,'s1Up','io'],[1.11,'s1Cut','i'],[1.21,'s1Hit','o'],[1.36,'s1Hit','l'],
    [1.47,'s2Cut','i'],[1.57,'s2Hit','o'],[1.9,'thUp','io'],[2.2,'thUp','l',.012],[2.33,'thHit','i'],[2.7,'cRec','io'],[3.1,'cRec','l']];
  M.lunge.trk=[[.55,'lDraw','io'],[.8,'lDraw','l',.012],[1.0,'lGo','i'],[1.3,'lGo','l'],[1.9,'cRec','io']];
  M.batstep.trk=[[.3,'bow','io'],[1.35,'rLow','io'],[1.65,'rLow','l',.012],[1.78,'rCut','i'],[1.9,'rHigh','o'],[2.25,'cRec','io'],[2.6,'cRec','l']];M.batstep.hit[0].s.r=4.4;
  M.wave.trk=[[.6,'wUp','io'],[.85,'wUp','l',.015],[.96,'wDn','i'],[1.4,'wDn','l'],[1.9,'cRec','io']];
  M.waves.trk=[[.6,'wUp','io'],[.88,'wUp','l',.015],[.98,'wDn','i'],[1.5,'wDn','l'],[2.3,'cRec','io']];
  M.spin.hit[0].s.r=4.3;
  // his walk (replaces vlrLoco for the new frame): the stride is matched to his speed on the longer legs, so the planted foot
  // stays put instead of sliding (v110: ~1.8× too many steps for the ground covered), with a knee lift on the swinging leg, a
  // heel-toe roll, a slight forward lean and hip / shoulder counter-turn while moving; the guard holds the sword low and
  // forward; breathing, the cape and the Phase II wings as before
  const l0=SVB[5]&&SVB[5].loco;if(l0)SVB[5].loco=function(e,S,O,dt,now){if(!S.R||!S.R.v202)return l0.apply(this,arguments);vlr202Loco(e,S,O,dt,now)}}
function vlr202Loco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.2);S.gp=(S.gp||0)+dt*(.4+S.spd*1.62);const g=S.gp;
  O.hips[4]+=.03*Math.sin(t*1.4)+(.07*Math.abs(Math.sin(g))-.05)*a;O.hips[1]+=.07*Math.sin(g)*a;O.spine[0]+=.05*a;O.chest[0]+=.015*Math.sin(t*1.4)+.04*a;O.chest[1]-=.09*Math.sin(g)*a;O.head[1]+=.08*Math.sin(t*.5)+.05*Math.sin(g)*a;
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.45*a,lf=Math.max(0,Math.cos(ph))*.8*a;O['th'+s][0]+=-sw-lf*.22;O['kn'+s][0]+=lf+.06*a;O['ft'+s][0]+=-lf*.3+Math.max(0,-Math.sin(ph))*.18*a});
  // the guard: sword low and forward, the tip at a hero's chest, pointing at them; the left claw open, swinging a little
  O.shR[0]+=-.579+.04*Math.sin(t*1.2);O.shR[1]+=.109;O.shR[2]+=.023;O.elR[0]+=-.087;O.hdR[0]+=.852;O.hdR[1]+=.087;O.hdR[2]+=-.098;
  O.shL[0]+=.16*Math.sin(g)*a+.1;O.shL[2]+=.18;O.elL[0]+=-.3-.12*a;O.hdL[0]+=.1+.05*Math.sin(t*1.7);
  O.cp0[0]+=.15+.06*Math.sin(t*1.6)+.4*a;O.cp1[0]+=.05+.05*Math.sin(t*1.6-.8)+.15*a;O.cp2[0]+=.04*Math.sin(t*1.6-1.6)+.1*a;O.tab[0]+=.03*Math.sin(t*1.6+.5)-.12*a;
  if(S.ph>1){const fl=S.mv&&S.mv.id==='skyfall'?Math.sin(t*9)*.45:.12*Math.sin(t*1.8);O.wgL[1]+=fl;O.wgR[1]-=fl;O.wgL[2]+=fl*.5;O.wgR[2]-=fl*.5;
    const fo=.15+.12*Math.sin(t*1.8-.6);O.wfL[1]+=fo;O.wfR[1]-=fo}}
