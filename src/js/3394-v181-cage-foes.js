// ================= v181: the humanoid foes on cage bodies =================
// Each foe is the Vampire Thrall's cage (3393) re-proportioned: cgHuman(o) scales the torso rings region by region (groin,
// hips, waist, ribs, chest, socket, shoulders, trapezius), the limbs' thickness and length, the leg length (the whole upper
// body rides up or down with it), the head (size, height, width, depth) and the neck, and moves the skeleton's rest joints
// with it. The face is sculpted in the base head's coordinates (S.face / S.sculpt), so one face recipe fits any head size.
// Gear is built from the body surface (cgShell), hung from it (cgSkirt robes and tassets, cgCape, cgCollar), or placed on it
// with a ray (cgRay).
function cgHuman(o){const T=CG181.base,h=o.h||1,w=o.w||1,d=o.d||1,hs=o.hs||1,hy=o.hy||1,hw=o.hw||1,hd=o.hd||1,legL=o.legL||1,armL=o.armL||1,at=o.at||1,lt=o.lt||1;
  const hipY=T.J.lh0[1],dy=hipY*h*(legL-1),U=y=>y*h+dy,one=[1,1,1,1,1,1,1,1],rw=o.rw||one,rf=o.rf||rw,rb=o.rb||rw;
  const torso=T.torso.map((q,i)=>[U(q[0]),q[1]*w*rw[i],q[2]*d*rf[i],q[3]*d*rb[i],(q[4]||0)*d]);
  const hb=T.head[0][0],nb=U(hb)+(o.neckL||0),H=y=>nb+(y-hb)*hs*hy,hz=o.hz||0;
  const head=(o.head||T.head).map(q=>[H(q[0]),q[1]*hs*hw,q[2]*hs*hd,q[3]*hs*hd,(q[4]||0)*hs+hz]);
  const ty=T.torso[T.torso.length-1][0],y0=torso[torso.length-1][0],nw=o.nw||1;
  const neck=T.neck.map(q=>{const t=(q[0]-ty)/(hb-ty);return [y0+(nb-y0)*t,q[1]*nw,q[2]*nw,q[3]*nw,(q[4]||0)+hz*t]});
  const J={},TJ=T.J;
  ['pelvis','spine','chest'].forEach(n=>J[n]=[0,U(TJ[n][1]),TJ[n][2]*d]);J.neck=[0,(y0+nb)/2,TJ.neck[2]+hz*.5];J.head=[0,H(TJ.head[1]),TJ.head[2]*hs+hz];
  ['l','r'].forEach(c=>{const L=c+'h';J[L+'0']=[TJ[L+'0'][0]*w*rw[1],TJ[L+'0'][1]*h*legL,TJ[L+'0'][2]];J[L+'1']=[TJ[L+'1'][0]*w*rw[1]*(o.knee||1),TJ[L+'1'][1]*h*legL,TJ[L+'1'][2]];J[L+'2']=[TJ[L+'2'][0]*w*rw[1]*(o.knee||1),TJ[L+'2'][1]*(o.ankle||1),TJ[L+'2'][2]]});
  ['L','R'].forEach(c=>{const A='a'+c,a0=TJ[A+'0'],a1=TJ[A+'1'],a2=TJ[A+'2'],s0=[a0[0]*w*rw[6],U(a0[1]),a0[2]],k=(p,q)=>[(q[0]-p[0])*(o.armX||1),(q[1]-p[1])*h*armL,(q[2]-p[2])];
    J[A+'0']=s0;J[A+'1']=add3(s0,k(a0,a1));J[A+'2']=add3(J[A+'1'],k(a1,a2))});
  ['cp0','cp1','cp2'].forEach(n=>J[n]=[0,U(TJ[n][1]),TJ[n][2]*d]);
  const ar=o.arm||T.arm,lg=o.leg||T.leg;
  const S={J,armRing:4,torso,neck,head,n:24,
    push:(i,j,a)=>(o.push||T.push)(i,j,a)*w,
    face:o.facePush||((i,j,a)=>T.face(i,j,a)*hs),
    arm:ar.map((q,i)=>({t:q.t,r:q.r*at*((o.armR||[])[i]||1),rf:q.rf&&q.rf*at*((o.armR||[])[i]||1),rb:q.rb&&q.rb*at*((o.armR||[])[i]||1),o:q.o&&q.o*at})),
    leg:lg.map((q,i)=>({t:q.t,r:q.r*lt*((o.legR||[])[i]||1),rf:q.rf&&q.rf*lt*((o.legR||[])[i]||1),rb:q.rb&&q.rb*lt*((o.legR||[])[i]||1),o:q.o&&q.o*lt})),
    foot:{len:T.foot.len*(o.foot||1)*Math.sqrt(h),w:(o.footW||1)*Math.sqrt(lt),h:o.footH||1},
    // base head coordinates ↔ model space
    hp:(x,y,z)=>[x*hs*hw,nb+(y-hb)*hs*hy,(z||0)*hs*hd+hz],
    sculpt:fn=>(x,y,z,n)=>fn(x/(hs*hw),(y-nb)/(hs*hy)+hb,(z-hz)/(hs*hd),n)*hs,
    U,hs,nb,h};
  return S}
// ---------------- gear helpers (model space) ----------------
// eyes burning in the sockets (base head coordinates ex, ey), slightly in front of the surface
function cgEyes(k,M,S,col,ex,ey,r,out){[-1,1].forEach(s=>{const q=S.hp(s*ex,ey,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','sph','g',col,p[0],p[1],p[2]+(out||.001),.009*S.hs*(r||1),.0062*S.hs*(r||1),.005,0,0,s*.25)})}
// fangs / teeth hanging from the mouth line
function cgTeeth(k,M,S,list,col){list.forEach(([x,y,len,up])=>{const q=S.hp(x,y,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','cone4','c',col||0xe8e0d0,p[0],p[1]+(up?.004:-.006)*S.hs,p[2]-.002,.0052*S.hs,len*S.hs,.0052*S.hs,up?0:Math.PI)})}
// pointed ears from the sides of the head (base y), length len, swept up / back
function cgEars(k,M,S,col,y,len,up,back,r,inner){[-1,1].forEach(s=>{const q=S.hp(s*.3,y,0),p=cgRay(M,[q[0],q[1],q[2]],[-s,0,0]);if(!p)return;const L=len*S.hs;
  k.L('head','c',col,[p[0]-s*.006,p[1]-.01,p[2]],[p[0]+s*L*.55,p[1]+L*up,p[2]-L*back],(r||.017)*S.hs,.002,4);k.L('head','c',col,[p[0]-s*.006,p[1]-.024,p[2]+.004],[p[0]+s*L*.5,p[1]+L*up*.7,p[2]-L*back*.85],(r||.017)*.65*S.hs,.002,4);
  if(inner!=null)k.p('head','sph','c',inner,p[0]+s*L*.18,p[1]+L*up*.3,p[2]-L*back*.25,.006*S.hs,L*.3,.014*S.hs,0,0,-s*.7)})}
// fingers from the knuckles: kind 'open' | 'claw' | 'fist', len, nail colour, claw tip
function cgFingers(k,S,s,col,kind,len,nail,tip,t){const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),kn=add3(a2,mul3(d,.08*(S.hand||1))),L=(len||1)*.08;
  for(let i=0;i<4;i++){const z=(1.5-i)*.016,p=[kn[0]-s*.004,kn[1],kn[2]+z];if(kind=='fist')a181Digit(k,bn+'2',col,p,[d[0]-s*.45,d[1],d[2]+.05],L*.7,.0095,2,1.15,[0,0,s],0,null,t);
    else a181Digit(k,bn+'2',col,p,[d[0]-s*.15,d[1],d[2]+z*.6],L*(i==3?.82:1),.0085,3,kind=='claw'?.26:.14,[0,0,s],tip||0,nail,t)}
  const tb=add3(a2,mul3(d,.03));a181Digit(k,bn+'2',col,[tb[0]-s*.01,tb[1],tb[2]+.026],[d[0]-s*.3,d[1]*.6,.75],L*.62,.009,2,.3,[0,1,0],tip?tip*.6:0,nail,t)}
function cgToes(k,S,s,col,claw,nail){const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,W=S.foot.w;for(let i=0;i<5;i++){const tx=A[0]+(i-2)*.018*W,tz=A[2]+.16*L;k.L(l,'c',col,[tx,.018,tz-.02],[tx+(i-2)*.004,.012,tz+.012],.009*W,.007*W,4);if(claw)k.L(l,'c',nail||0x1a1214,[tx+(i-2)*.004,.012,tz+.012],[tx+(i-2)*.006,.004,tz+.012+claw],.006*W,.001,4)}}
// the torso ring of the cage spec at height y (rx, f, b, z)
function cgTAt(S,y){const q=cgAt(S.torso,y);return {rx:q[1],f:q[2],b:q[3],z:q[4]||0}}
// a skirt / robe / coat tail / tasset band from the torso at y0 down to y1: flares by fl, follows the hips and then the legs
function cgSkirt(B,S,y0,y1,fl,off,col,o){o=o||{};const n=o.n||7,q=cgTAt(S,y0),J=S.J,hy=J.lh0[1],ky=J.lh1[1],R=[];
  for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t,e=Math.min(1,t*2.4),wx=Math.max(q.rx,(J.rh0[0]+.09*(o.lw||1)));R.push({p:[0,y,q.z-(o.dz||0)*t*t],rx:q.rx+(wx-q.rx)*e+fl*t+off,f:q.f+fl*.7*t+off,b:q.b+fl*.9*t+off,w:[['pelvis',1]]})}
  const wf=(x,y)=>{const d=Math.max(0,Math.min(1,(hy+.04-y)/Math.max(.05,hy+.04-ky))),kk=Math.max(0,Math.min(1,(ky-y)/(ky*.6))),l=Math.max(0,Math.min(1,.5-x/(Math.abs(J.rh0[0])*2.2)));
    if(d<=0)return [['pelvis',1]];const a=d*(1-kk*.5)*.85,b=d*kk*.45;return [['pelvis',1-a-b],['lh0',a*l],['rh0',a*(1-l)],[x<0?'lh1':'rh1',b]]};
  mdLoft(B,R,{seg:o.seg||24,wf,col,keep:o.keep,t:o.t||'c'});return R}
// a cape hanging from the shoulders on the cape bones: folds, ragged hem
function cgCape(B,S,o){const J=S.J,top=S.torso[6][0],len=o.len||.4,w=o.w||1,off=o.off||.03,rag=o.rag==null?.5:o.rag,col=o.col,ins=o.ins==null?mdSh(col,.5):o.ins;
  const at=(y,wt,rx)=>{const q=cgTAt(S,Math.min(top,y));return {p:[0,y,q.z-(q.b+off+Math.max(0,top-y)*.1)],rx:rx*w,f:.014,b:.014,w:wt}};
  const Y=[top+.01,top-.1,top-.25,top-.42,J.cp1[1]-.1,J.cp2[1],len],cw=y=>y>J.cp0[1]-.04?[['chest',.6],['cp0',.4]]:y>J.cp1[1]?mdWb('cp0','cp1',(J.cp0[1]-y)/(J.cp0[1]-J.cp1[1])):y>J.cp2[1]?mdWb('cp1','cp2',(J.cp1[1]-y)/(J.cp1[1]-J.cp2[1])):[['cp2',1]];
  const R=Y.map((y,i)=>at(y,cw(y),.18+i*.022));R[0].p[2]=-(cgTAt(S,top).b+off*.4);
  mdLoft(B,R,{seg:24,capA:true,col:m=>m.s>.2?ins:(o.trim!=null&&m.i<.6?o.trim:Math.round(Math.atan2(m.c,-m.s)*9)%2?col:mdSh(col,.82)),keep:m=>!(m.i>R.length-2.2&&a181H(Math.round(Math.atan2(m.c,m.s)*6),2)<rag*(m.i-(R.length-2.2))*.9)})}
// a tall flared collar round the back of the neck (open in front)
function cgCollar(B,k,S,o){const top=S.hp(0,o.top||1.66,0)[1],y0=S.torso[6][0]-.01,q=cgTAt(S,y0),w=o.w||1,R=[],n=6;for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(top-y0)*t,r=(q.rx*.62+t*t*.16+t*.02)*w;
    R.push({p:[0,y,q.z-.01-t*t*.07],rx:r,f:r*.8,b:r*.78,w:y<S.J.neck[1]-.02?[['chest',1]]:[['chest',.45],['neck',.55]]})}
  const cut=o.cut||.36;mdLoft(B,R,{seg:24,col:m=>m.s>-.1&&m.i>.5?o.ins:o.col,keep:m=>{const a=Math.abs(Math.atan2(m.c,m.s));if(a<Math.PI*cut+m.i*.1)return false;if(o.rag&&m.i>n-2.2&&a181H(Math.round(a*9),4)<o.rag)return false;return true}});
  if(o.rib!=null)for(let i=0;i<4;i++){const a=Math.PI*(.62+i*.25)*(i%2?1:-1),x=Math.sin(a),z=Math.cos(a),p0=R[1],p1=R[n-1];k.L('neck','m',o.rib,[x*p0.rx,p0.p[1],p0.p[2]+z*p0.b],[x*p1.rx*1.02,p1.p[1]+.01,p1.p[2]+z*p1.b*1.02],.007,.004,4)}}
// a hair shell: crown and back of the head down to the nape, with a hairline (peak = widow's peak depth, base y of the line)
function cgHair(B,M,S,o){const line=o.line||1.672,peak=o.peak||0,nape=S.hp(0,o.nape||1.56,0)[1];
  cgShell(B,M,m=>{if(m.part!='head'&&!(o.neck&&m.part=='neck'&&m.s<-.2))return false;const by=(m.y-S.nb)/(S.hs*1)+1.52,bx=m.x/S.hs;if(m.y<nape)return false;
    return m.s<(o.side==null?.1:o.side)||by>line-peak*Math.exp(-(bx/.022)*(bx/.022))+(Math.abs(bx)>.05?-.004:0)},v=>(o.thick||.016)*Math.min(1,Math.max(.35,(v[1]-nape)/(.12*S.hs))),m=>a181Nz(o.col,m,.4,24))}
// a tube along points (bell sleeves, straps, braids): rings of radius r_i, weights w_i
function cgTube(B,pts,r,w,col,o){mdLoft(B,pts.map((p,i)=>({p,rx:r[i],f:r[i],b:r[i],w:w[i]})),Object.assign({seg:10,col},o||{}))}

// ===================================================================== Blood Knight =====================================================================
(function(){const S=cgHuman({h:1.06,w:1.1,d:1.08,rw:[1.12,1.18,1.12,1.16,1.22,1.22,1.28,1.3],rf:[1,1.05,1.15,1.2,1.25,1.2,1.15,1.1],at:1.32,lt:1.28,hs:.96,legL:1.04,nw:1.25,foot:1.05,footW:1.1});
  const pl=0x2a1419,pl2=0x40202a,ed=0x5a262c,gd=0x6e5230,ml=0x26262c,un=0x161012,cl=0x4e0a14,glow=0xff2a30,T=S.torso,J=S.J;
  cg181Reg('vampk',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],ey=J.aR1[1],wr=J.aR2[1],kn=J.rh1[1],an=J.rh2[1];
    cgEmit(B,M,un);
    // cuirass (fluted, a centre ridge, banded lames over the belly, a gilded rim), gorget
    cgShell(B,M,m=>m.part=='torso'&&m.y>wy-.02,.034,m=>m.y<wy+.03||m.y>sh+.02?gd:m.y<wy+.12?(Math.round(m.y*34)%2?pl:pl2):Math.abs(m.x)<.025&&m.s>0?pl2:Math.round(Math.atan2(m.x,m.z)*7)%2?pl:mdSh(pl,.84),{t:'m'});
    cgShell(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh)||(m.part=='head'&&m.y<S.hp(0,1.535,0)[1]),.05,m=>m.y>S.hp(0,1.5,0)[1]?gd:pl2,{t:'m'});
    // mail skirt and banded tassets, a belt with a winged buckle
    cgSkirt(B,S,wy-.04,J.lh0[1]-.24,.05,.03,m=>Math.round(m.y*60)%3==0?0x18181c:ml,{n:5});
    cgSkirt(B,S,wy-.04,J.lh0[1]-.15,.05,.052,m=>m.y<J.lh0[1]-.13?gd:Math.round(m.y*30)%2?pl:pl2,{n:5,t:'m',keep:m=>Math.abs(m.c)>.25||m.s<-.2});
    mdLoft(B,[wy-.035,wy+.005].map(y=>{const q=cgTAt(S,y);return {p:[0,y,q.z],rx:q.rx+.058,f:q.f+.058,b:q.b+.058,w:cgTorsoW(S,y)}}),{seg:24,t:'m',col:0x1a1012});
    const bz=cgTAt(S,wy-.015).f+.065;k.p('pelvis','sph','m',gd,0,wy-.015,bz,.03,.028,.014);[-1,1].forEach(s=>k.p('pelvis','cone4','m',gd,s*.04,wy-.01,bz-.004,.012,.05,.006,0,0,s*1.25));
    const cz=cgTAt(S,J.chest[1]+.04).f+.042;k.p('chest','oct','g',glow,0,J.chest[1]+.04,cz,.022,.03,.012);[-1,1].forEach(s=>{for(let i=0;i<3;i++)k.p('chest','cone4','m',gd,s*(.035+i*.022),J.chest[1]+.05-i*.012,cz-.006-i*.003,.012,.06-i*.012,.005,0,0,s*(1.0+i*.25))});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],L=s<0?'lh':'rh';
      // pauldrons: three dome lames, a swept fin of blades
      [[.05,.15,.11,.16,pl],[.0,.14,.09,.15,pl2],[-.05,.13,.075,.135,ed]].forEach(([dy,sx,sy,sz,c],j)=>{k.p(A+'0','hem','m',c,a[0]+s*(.03+j*.014),a[1]+dy,a[2],sx,sy,sz,0,0,s*(.42+j*.12));k.p(A+'0','tor','m',gd,a[0]+s*(.03+j*.014),a[1]+dy-.004,a[2],sx,.012,sz,0,0,s*(.42+j*.12))});
      for(let j=0;j<3;j++)k.p(A+'0','cone4','m',j==1?pl2:pl,a[0]+s*(.03+j*.028),a[1]+.1+j*.015,a[2]-.03-j*.03,.026,.17-j*.035,.009,-.55-j*.12,0,-s*(.3+j*.15));
      // rerebrace, couter, vambrace, gauntlet; cuisse, poleyn, greave, sabaton
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<a[1]-.08&&m.y>ey+.035,.022,m=>Math.round(m.y*28)%2?pl:pl2,{t:'m'});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<ey-.03&&m.y>wr-.03,.022,m=>m.y<wr+.02?gd:pl,{t:'m'});
      cgShell(B,M,m=>(m.part=='hand'||(m.part=='arm'&&m.y<wr-.03))&&Math.sign(m.x)==s,.012,pl,{t:'m'});cgFingers(k,S,s,pl,'fist',1.1,null,0,'m');
      const e=J[A+'1'],eb=e[2]-.06;k.p(A+'1','sph','m',pl2,e[0],e[1],eb,.05,.05,.04);k.L(A+'1','m',ed,[e[0],e[1],eb-.02],[e[0]+s*.02,e[1]+.03,eb-.09],.02,.002,4);
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn+.05&&m.y<J.lh0[1]-.1,.024,m=>Math.round(m.y*24)%2?pl:pl2,{t:'m'});
      const kq=J[L+'1'];k.p(L+'1','hem','m',pl2,kq[0],kq[1],kq[2]+.075,.075,.055,.06,Math.PI/2,0,0);k.L(L+'1','m',ed,[kq[0],kq[1]+.01,kq[2]+.12],[kq[0],kq[1]+.07,kq[2]+.18],.02,.002,4);
      cgShell(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<kn-.04&&m.y>an-.02,.022,m=>m.y<an+.04?gd:m.s>.6?pl2:pl,{t:'m'});
      cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.016,pl,{t:'m'});k.L(L+'2','m',pl2,[kq[0],.03,J[L+'2'][2]+.16*S.foot.len],[kq[0],.02,J[L+'2'][2]+.25*S.foot.len],.02,.003,4)});
    // the helm: closed, a T-slit with burning eyes, a crest blade and two horns sweeping back
    const sy=S.hp(0,1.629,0)[1];cgShell(B,M,m=>m.part=='head',.03,m=>{if(m.s>.55&&Math.abs(m.y-sy)<.009*S.hs&&Math.abs(m.x)<.07)return 0x080404;if(m.s>.7&&Math.abs(m.x)<.012&&m.y<sy&&m.y>S.hp(0,1.55,0)[1])return 0x080404;return m.y>S.hp(0,1.69,0)[1]&&Math.abs(m.x)<.03?pl2:pl},{t:'m',rim:1});
    [-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','sph','g',glow,p[0],p[1],p[2]+.032,.013,.006,.006)});
    const ht=S.hp(0,1.74,0);k.L('head','m',pl2,[0,ht[1],ht[2]+.06],[0,ht[1]+.03,ht[2]-.06],.016,.012,4);k.L('head','m',pl2,[0,ht[1]+.03,ht[2]-.06],[0,ht[1]-.02,ht[2]-.2],.012,.002,4);
    [-1,1].forEach(s=>{const q=S.hp(s*.1,1.68,-.02);let p=[q[0],q[1],q[2]];[[s*.06,.03,-.05],[s*.04,.05,-.06],[s*.01,.06,-.06],[-s*.005,.05,-.05]].forEach((d,j)=>{const n=[p[0]+d[0],p[1]+d[1],p[2]+d[2]];k.L('head','m',j<2?pl:ed,p,n,.028-j*.006,.022-j*.006,5);p=n})});
    cgCape(B,S,{len:.32,w:1.25,col:cl,ins:0x1a0408,trim:gd,rag:.7})});
  ST179.vampk={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};})();

// ===================================================================== Blood Magister =====================================================================
(function(){const S=cgHuman({h:1.1,w:.96,d:.96,rw:[.95,1,.92,.96,1,1,1.02,1],at:.86,lt:.9,hs:.96,armL:1.03,legL:1.06});
  const sk=0x6e646c,sk2=0x544a52,rb=0x560c18,rb2=0x3a0610,un=0x160a0e,gd=0x5a4226,glow=0xff2a3a,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;d+=.02*cgG(x,y,0,1.598,.009,.014)+.012*cgG(x,y,0,1.616,.007,.012);
    [-1,1].forEach(s=>{d-=.013*cgG(x,y,s*.036,1.629,.016,.01);d+=.007*cgG(x,y,s*.056,1.602,.014,.01);d-=.006*cgG(x,y,s*.047,1.568,.016,.014);d+=.003*cgG(x,y,s*.01,1.587,.006,.004)});
    d+=.008*cgG(x,y,0,1.648,.05,.006);d-=.004*cgG(x,y,0,1.558,.02,.003);d+=.008*cgG(x,y,0,1.538,.016,.012);return d*f};
  cg181Reg('vampm',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0];cgSculpt(M,{head:1},S.sculpt(FACE));
    const ey=S.hp(0,1.629,0)[1],skin=m=>{if(m.part=='head'&&m.s>.3){const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-.036)<.02&&Math.abs(m.y-ey)<.012*S.hs)return 0x2a1a22;if(Math.abs(m.y-S.hp(0,1.558,0)[1])<.004&&Math.abs(bx)<.024)return 0x3a1a22}return m.s<-.3?sk2:a181Nz(sk,m,.15,20)};
    cgEmit(B,M,m=>m.part=='torso'||m.part=='leg'||m.part=='foot'?un:skin(m));
    cgEyes(k,M,S,glow,.036,1.629);cgTeeth(k,M,S,[[-.013,1.556,.018],[.013,1.556,.018]]);cgEars(k,M,S,sk,1.63,.07,.5,.85,.015);
    cgHair(B,M,S,{col:0x0c080a,line:1.674,peak:.026,neck:true,thick:.014});
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk,s>0?'fist':'open',1.25,0x1a0a10,.02);a181Boot(B,{bones:{lh2:['',...J.lh2],rh2:['',...J.rh2]}},s,{col:0x120a0c,toe:.04})});
    // robes: the under-robe to the floor, the over-robe open down the front, gilded edges, a sash, a blood vial
    cgSkirt(B,S,wy,.02,.16,.02,m=>m.y<.06?gd:un,{n:8});
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.03&&Math.abs(Math.atan2(m.x,m.z))>.3)||(m.part=='arm'&&m.y>J.aR1[1]-.02),.02,m=>Math.abs(Math.atan2(m.x,m.z))<.45&&m.part=='torso'?gd:Math.round(m.y*24)%2?rb:mdSh(rb,.9));
    cgSkirt(B,S,wy,.03,.2,.042,m=>m.y<.07||Math.abs(Math.atan2(m.c,m.s))<.55?gd:Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,{n:8,dz:.06,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.42});
    mdLoft(B,[wy-.04,wy+.03].map(y=>{const q=cgTAt(S,y);return {p:[0,y,q.z],rx:q.rx+.055,f:q.f+.055,b:q.b+.055,w:cgTorsoW(S,y)}}),{seg:24,col:rb2});
    const sz=cgTAt(S,wy).f+.062;k.p('pelvis','oct','m',gd,0,wy,sz,.03,.035,.014);k.L('pelvis','c',rb2,[.05,wy-.02,sz-.01],[.08,wy-.24,sz-.02],.022,.016,4);
    k.L('pelvis','m',gd,[-.07,wy-.02,sz-.01],[-.08,wy-.08,sz-.004],.004,.004,3);k.p('pelvis','cyl','g',glow,-.08,wy-.11,sz-.004,.014,.05,.014);k.p('pelvis','cyl','m',gd,-.08,wy-.08,sz-.004,.016,.008,.016);
    // bell sleeves from the elbow
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',e=J[A+'1'],w=J[A+'2'],d=sub3(w,e),pt=t=>add3(e,mul3(d,t)),r0=.05*S.h;
      cgTube(B,[pt(-.05),pt(.4),pt(.85),pt(1.18)],[r0,r0+.025,r0+.06,r0+.085],[[[A+'0',.3],[A+'1',.7]],[[A+'1',1]],[[A+'1',.6],[A+'2',.4]],[[A+'2',1]]],m=>m.i>2.3?gd:rb)});
    cgCollar(B,k,S,{top:1.69,w:1.05,col:rb2,ins:0x1a0408,rib:gd});
    const cz=cgTAt(S,J.chest[1]+.03).f+.024;k.p('chest','oct','g',glow,0,J.chest[1]+.03,cz,.02,.032,.01);for(let i=0;i<7;i++){const a=(i-3)*.16,y=sh-.03-Math.abs(i-3)*.02,q=cgTAt(S,y);k.p('chest','sph','m',gd,Math.sin(a)*(q.rx+.02),y,q.z+Math.cos(a)*(q.f+.026),.009)}});
  ST179.vampm={sx:.08,hx:-.06,lk:.08,rk:.08,lz:-.06,le:-.25};})();

// ===================================================================== Nosferatu =====================================================================
(function(){const S=cgHuman({h:1.0,w:.9,d:.9,rw:[.9,.95,.82,.88,.94,.94,.96,.92],at:.76,lt:.8,hs:1.04,hy:1.16,hw:.9,armL:1.12,legL:1.03,neckL:.02});
  const sk=0x5e6058,sk2=0x464a40,vein=0x2e2a28,co=0x14100e,co2=0x221a18,glow=0xff2a20,nail=0x2a2018,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
    d+=.034*cgG(x,y,0,1.588,.011,.016)+.02*cgG(x,y,0,1.612,.008,.016)-.01*cgG(x,y,0,1.574,.012,.006);   // a long hooked nose
    [-1,1].forEach(s=>{d-=.022*cgG(x,y,s*.037,1.63,.017,.012);d+=.01*cgG(x,y,s*.06,1.6,.012,.01);d-=.016*cgG(x,y,s*.05,1.566,.016,.016)});
    d+=.016*cgG(x,y,0,1.652,.05,.007);d-=.005*cgG(x,y,0,1.553,.018,.003);d-=.006*cgG(x,y,0,1.536,.025,.01);return d*f};
  cg181Reg('nosferatu',S,function(B,P,k,C){const M=C.M,wy=T[2][0];cgSculpt(M,{head:1},S.sculpt(FACE));
    const ey=S.hp(0,1.63,0)[1],skin=m=>{if(m.part=='head'&&m.s>.3){const bx=m.x/S.hs;if(Math.abs(Math.abs(bx)-.037)<.022&&Math.abs(m.y-ey)<.015*S.hs)return 0x0a0806}
      const v=n3Sn(m.x,m.y,m.z,22,4);return v>.74?vein:m.s<-.3?sk2:mdSh(sk,1-v*.15)};
    cgEmit(B,M,m=>m.part=='leg'?co:skin(m));
    cgEyes(k,M,S,glow,.037,1.63,1.15,-.002);cgTeeth(k,M,S,[[-.005,1.553,.03],[.005,1.553,.03],[-.017,1.553,.012],[.017,1.553,.012]]);
    cgEars(k,M,S,sk,1.64,.17,.75,.55,.03,0x5a3a3a);
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk,'claw',1.9,nail,.07);cgToes(k,S,s,sk2,.03,nail)});
    // ribs and the spine's knuckles, painted by the coat's gap; the long coat, open, shredded at the hem; a torn standing collar
    for(let i=0;i<8;i++){const y=T[6][0]-i*.06,q=cgTAt(S,y),p=cgRay(M,[0,y,q.z-.4],[0,0,1]);if(p)k.p(n3TB?'chest':'chest','sph','c',sk,p[0],p[1],p[2]-.004,.016,.012,.012)}
    cgShell(B,M,m=>(m.part=='torso'&&m.y>wy-.04&&Math.abs(Math.atan2(m.x,m.z))>.7)||(m.part=='arm'&&m.y>J.aR2[1]+.08),.016,m=>Math.round(m.y*26)%3==0?co2:co);
    cgSkirt(B,S,wy-.02,J.lh1[1]-.25,.16,.035,m=>Math.round(Math.atan2(m.c,m.s)*7)%2?co:co2,{n:8,dz:.1,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.8&&!(m.y<J.lh1[1]-.05&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<(J.lh1[1]-.05-m.y)*3.5)});
    mdLoft(B,[wy-.04,wy-.005].map(y=>{const q=cgTAt(S,y);return {p:[0,y,q.z],rx:q.rx+.042,f:q.f+.042,b:q.b+.042,w:cgTorsoW(S,y)}}),{seg:24,col:0x2a1e16});
    cgCollar(B,k,S,{top:1.64,w:1.1,col:co,ins:0x2a0a0a,rag:.5,cut:.4})});})();

// ---------------- fur and fringes on cage bodies ----------------
// hanging tufts round the body at height y: rays from outside find the surface (or the shell's height), each tuft hangs down
// and out by len; bone by height (torso) or the given bone
function cgTufts(k,M,S,y,n,len,col,col2,o){o=o||{};const c=o.c||[0,y,cgTAt(S,y).z],off=o.off||0,bn=o.bn||(y>S.J.chest[1]-.04?'chest':y>S.J.spine[1]?'spine':'pelvis');
  for(let i=0;i<n;i++){const a=(o.a0||0)+i/n*((o.a1==null?Math.PI*2:o.a1)-(o.a0||0))+a181H(i,y*40)*.2,dx=Math.sin(a),dz=Math.cos(a),p=cgRay(M,[c[0]+dx*.8,c[1],c[2]+dz*.8],[-dx,0,-dz]);if(!p)continue;
    const L=len*(.7+a181H(i,y*30,3)*.6),q=[p[0]+dx*off,p[1],p[2]+dz*off];k.L(bn,'c',a181H(i,5,y*20)<.35?(col2||col):col,[q[0]-dx*.01,q[1]+.01,q[2]-dz*.01],[q[0]+dx*L*.35,q[1]-L,q[2]+dz*L*.35],(o.r||.03),.003,4)}}
// tufts round a limb at the point t along a bone pair (a → b), around its axis
function cgLimbTufts(k,M,a,b,t,n,len,col,col2,bn,o){o=o||{};const c=lerp3(a,b,t),d=nrm3(sub3(b,a)),u=nrm3(cross3(d,[0,0,1])),v=nrm3(cross3(d,u));
  for(let i=0;i<n;i++){const an=i/n*Math.PI*2+a181H(i,t*20)*.3,r=add3(mul3(u,Math.cos(an)),mul3(v,Math.sin(an))),p=cgRay(M,add3(c,mul3(r,.5)),mul3(r,-1),o.parts||{arm:1,leg:1,hand:1,foot:1});if(!p)continue;
    const L=len*(.7+a181H(i,t*30,7)*.6),q=add3(p,mul3(r,o.off||0));k.L(bn,'c',a181H(i,9,t*10)<.35?(col2||col):col,sub3(q,mul3(r,.01)),add3(add3(q,mul3(r,L*.3)),mul3(d,L)),o.r||.026,.003,4)}}

// ===================================================================== Crimson Executioner =====================================================================
(function(){const S=cgHuman({h:.92,w:1.3,d:1.28,rw:[1.15,1.22,1.4,1.32,1.26,1.26,1.3,1.42],rf:[1.1,1.3,1.8,1.6,1.32,1.2,1.15,1.2],rb:[1.05,1.15,1.15,1.12,1.15,1.15,1.15,1.25],at:1.55,lt:1.45,hs:.96,nw:1.7,legL:.95,foot:1.1,footW:1.3});
  const sk=0x8a7468,sk2=0x6a564c,scar=0x5a2a26,hd=0x22160f,hd2=0x341f14,ap=0x2e1c12,bl=0x2a0808,ir=0x3a3a3e,ir2=0x56565c,lt=0x2a1a10,T=S.torso,J=S.J;
  cg181Reg('executioner',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],wr=J.aR2[1],kn=J.rh1[1];
    cgEmit(B,M,m=>m.part=='leg'||m.part=='foot'?lt:m.s<-.4?sk2:a181Nz(sk,m,.18,16));
    // the hood over the whole head: two eye holes, a crown seam, a drawstring at the throat
    const ey=S.hp(0,1.629,0)[1];cgShell(B,M,m=>m.part=='head'||(m.part=='neck'&&m.y>S.J.neck[1]),.016,m=>{const bx=m.x/S.hs;if(m.s>.45&&Math.abs(Math.abs(bx)-.04)<.017&&Math.abs(m.y-ey)<.013*S.hs)return 0x050303;return Math.abs(m.x)<.008&&m.y>ey?hd2:a181Nz(hd,m,.35,18)},{rim:1});
    cgEyes(k,M,S,0xff6a3a,.04,1.629,.8,.014);const nt=S.hp(0,1.505,0);mdLoft(B,[nt[1]-.01,nt[1]+.01].map(y=>({p:[0,y,nt[2]],rx:.072*S.hs*1.25,f:.075*S.hs*1.25,b:.072*S.hs*1.25,w:[['neck',1]]})),{seg:16,col:0x5a4a32});
    k.L('neck','c',0x5a4a32,[.02,nt[1],nt[2]+.09],[.03,nt[1]-.08,nt[2]+.1],.006,.004,3);
    // the apron (chest to knees), straps, the belt with hooks, a cleaver and a chain
    cgShell(B,M,m=>m.part=='torso'&&m.s>.25&&m.y<sh-.05,.03,m=>n3Sn(m.x,m.y,m.z,11,3)>.68?bl:a181Nz(ap,m,.35,14));
    cgSkirt(B,S,wy-.02,kn+.06,.06,.06,m=>n3Sn(m.x,m.y,m.z,11,5)>.7?bl:a181Nz(ap,m,.35,14),{n:5,keep:m=>m.s>.35});
    [-1,1].forEach(s=>{const f=cgTAt(S,sh-.06),b=cgTAt(S,sh-.08);cgTube(B,[[s*.09*S.h,sh-.06,f.z+f.f+.032],[s*.15,sh+.03,0],[s*.08,sh-.1,b.z-b.b-.02]],[.016,.016,.016],[[['chest',1]],[['chest',1]],[['chest',1]]],0x1e120c,{seg:6})});
    mdLoft(B,[wy-.05,wy+.02].map(y=>{const q=cgTAt(S,y);return {p:[0,y,q.z],rx:q.rx+.07,f:q.f+.07,b:q.b+.07,w:cgTorsoW(S,y)}}),{seg:24,col:0x1a100a});
    const bq=cgTAt(S,wy-.015);k.p('pelvis','box','m',ir2,0,wy-.015,bq.z+bq.f+.075,.06,.05,.012);k.p('pelvis','box','m',ir,bq.rx+.07,wy-.12,bq.z+.04,.012,.14,.09,0,0,.08);k.L('pelvis','c',0x3a2414,[bq.rx+.07,wy-.02,bq.z+.04],[bq.rx+.07,wy-.05,bq.z+.04],.012,.012,4);
    for(let i=0;i<7;i++)k.p('pelvis','tor','m',ir2,-bq.rx-.07-i*.004,wy-.03-i*.03,bq.z+.06-i*.004,.014,.006,.014,i%2?0:Math.PI/2,0,i%2?Math.PI/2:0);
    // scars on the back and arms; forearm wraps; manacles with a broken link; breeches, heavy boots
    [[sh-.06,2.4],[wy+.12,-2.6],[sh-.12,Math.PI]].forEach(([y,a])=>{const q=cgTAt(S,y),o=[Math.sin(a)*.6,y,q.z+Math.cos(a)*.6],p=cgRay(M,o,nrm3([-o[0],0,q.z-o[2]]));if(!p)return;const e=[p[0]+.05,p[1]-.08,p[2]];
      k.L('chest','c',scar,p,e,.006,.005,3);for(let i=0;i<4;i++){const c=lerp3(p,e,i/3);k.p('chest','box','c',0x1a1010,c[0],c[1],c[2],.016,.003,.003,0,a,.5)}});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>wr+.03,.012,m=>Math.round(m.y*50)%2?0x3a2a1c:0x2a1e14);
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<wr+.035&&m.y>wr-.03,.024,ir,{t:'m'});const w=J[A+'2'];k.p(A+'2','tor','m',ir2,w[0],w[1]+.005,w[2]+.06,.014,.006,.016,Math.PI/2,0,0);
      cgFingers(k,S,s,sk,s>0?'fist':'open',1,sk2,0);
      cgShell(B,M,m=>(m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn-.12)||(m.part=='torso'&&m.y<wy),.012,m=>a181Nz(lt,m,.3,16));
      cgShell(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<kn-.14))&&Math.sign(m.x)==s,.02,m=>m.part=='foot'&&m.y<.03?ir:a181Nz(0x1a120c,m,.3,16))})});})();

// ===================================================================== Stormborn Jotun =====================================================================
(function(){const S=cgHuman({h:.88,w:1.26,d:1.18,rw:[1.1,1.15,1.15,1.2,1.3,1.32,1.42,1.5],rf:[1,1.1,1.25,1.3,1.38,1.28,1.2,1.2],at:1.62,lt:1.5,hs:.95,nw:1.6,foot:1.12,footW:1.35});
  const sk=0x5e7388,sk2=0x485a6e,rune=0x8ae0ff,wh=0xd8e0e8,wh2=0xb0bcc8,pe=0x5a4e40,pe2=0x3e342a,lt=0x2e2218,ir=0x3a3e46,ir2=0x52565e,hn=0xb8ac90,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;d+=.022*cgG(x,y,0,1.594,.016,.014)+.012*cgG(x,y,0,1.614,.011,.012);
    [-1,1].forEach(s=>{d-=.014*cgG(x,y,s*.038,1.629,.017,.01);d+=.008*cgG(x,y,s*.058,1.6,.016,.012);d+=.006*cgG(x,y,s*.016,1.584,.008,.005)});d+=.018*cgG(x,y,0,1.65,.055,.008);return d*f};
  cg181Reg('jotun',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],wr=J.aR2[1],kn=J.rh1[1];cgSculpt(M,{head:1},S.sculpt(FACE));
    const skin=m=>m.s<-.4?sk2:a181Nz(sk,m,.18,16);cgEmit(B,M,m=>m.part=='leg'||m.part=='foot'?lt:skin(m));
    cgEyes(k,M,S,rune,.038,1.629,.95,.002);
    // beard: over the jaw, a broad mass to the chest, two braids with iron rings; the mane
    const bc=m=>a181Nz(wh,m,.3,26),my=S.hp(0,1.562,0)[1];
    cgFur(B,M,m=>m.part=='head'&&m.s>-.15&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-my)<.01*S.hs),{off:.016,len:.24,col:wh,col2:wh2,seed:21,jag:.55});
    [-1,1].forEach(s=>{const p=S.hp(s*.024,1.574,0),r=cgRay(M,[p[0],p[1],p[2]+.4],[0,0,-1]);if(r)k.L('head','c',wh,[r[0]-s*.018,r[1]+.004,r[2]+.006],[r[0]+s*.03,r[1]-.03,r[2]+.012],.011,.006,4)});
    [-1,1].forEach(s=>{const p=S.hp(s*.05,1.545,.07);const q=[p[0]*1.15,p[1]-.13,p[2]+.02],r=[p[0]*1.1,p[1]-.27,p[2]+.0];cgTube(B,[p,q,r],[.017,.015,.006],[[['head',1]],[['neck',1]],[['chest',1]]],bc,{seg:6,capB:true});
      for(let i=0;i<3;i++){const c=lerp3(p,r,.25+i*.22);k.p(i<1?'neck':'chest','sph','c',wh2,c[0],c[1],c[2],.017,.012,.017)}k.p('chest','tor','m',ir2,q[0],q[1]-.05,q[2],.022,.02,.022)});
    cgHair(B,M,S,{col:wh,line:1.69,neck:true,thick:.02,side:.15});
    // horned helm (iron cap with a nasal), heavy curling horns
    cgShell(B,M,m=>m.part=='head'&&m.y>S.hp(0,1.662,0)[1],.034,m=>Math.round(Math.atan2(m.x,m.z)*4)%2?ir:mdSh(ir,.85),{t:'m',rim:.5});
    const np=S.hp(0,1.64,0),nr=cgRay(M,[0,np[1],np[2]+.4],[0,0,-1]);if(nr)k.p('head','box','m',ir2,0,np[1]-.01,nr[2]+.03,.026,.075,.014);
    [-1,1].forEach(s=>{const q=S.hp(s*.088,1.68,0);let p=q;[[s*.07,.02,.0],[s*.06,.04,.03],[s*.02,.05,.05],[-s*.01,.04,.05]].forEach((d,j)=>{const n=add3(p,d);k.L('head','c',j<3?hn:mdSh(hn,.8),p,n,.04-j*.009,.031-j*.009,6);p=n})});
    // the wolf-pelt mantle with a ragged fur edge and the wolf's head on one shoulder; storm runes; rune-bracers
    cgFur(B,M,m=>(m.part=='torso'&&m.y>J.chest[1]-.04)||(m.part=='arm'&&m.y>J.aR0[1]-.12),{off:.05,len:.2,col:pe,col2:pe2,seed:2,jag:.6});
    [[J.chest[1]+.06,0,.09],[J.chest[1],-.4,.07],[J.chest[1],.4,.07],[J.spine[1]+.06,0,.07],[J.chest[1]+.1,-.62,.05],[J.chest[1]+.1,.62,.05]].forEach(([y,a,l],i)=>{const q=cgTAt(S,y),o=[Math.sin(a)*.6,y,q.z+Math.cos(a)*.6],p=cgRay(M,o,nrm3([-o[0],0,q.z-o[2]]));if(p)k.p(y>J.chest[1]-.04?'chest':'spine','box','g',rune,p[0],p[1],p[2],.009,l,.003,0,a,i%2?.6:-.6)});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.05&&m.y>wr+.02,.024,m=>Math.round(m.y*30)%2?ir:ir2,{t:'m'});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'1'][1]+wr)/2)<.012,.03,rune,{t:'g'});cgFingers(k,S,s,sk,s>0?'fist':'open',1.05,sk2,0)});
    // war-kilt of leather panels, a studded belt, fur-wrapped boots
    cgSkirt(B,S,wy-.02,kn+.04,.07,.03,m=>a181Nz(Math.round(Math.atan2(m.c,m.s)*6)%2?lt:mdSh(lt,.85),m,.3,10),{n:6,keep:m=>Math.round(Math.atan2(m.c,m.s)*6)%3!=0||m.y>J.lh0[1]-.06});
    mdLoft(B,[wy-.05,wy+.025].map(y=>{const q=cgTAt(S,y);return {p:[0,y,q.z],rx:q.rx+.06,f:q.f+.06,b:q.b+.06,w:cgTorsoW(S,y)}}),{seg:24,col:0x1e160e});
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,q=cgTAt(S,wy-.012);k.p('pelvis','sph','m',ir2,Math.sin(a)*(q.rx+.062),wy-.012,q.z+Math.cos(a)*((Math.cos(a)>0?q.f:q.b)+.062),.012)}
    [-1,1].forEach(s=>{cgShell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.03,m=>a181Nz(pe2,m,.35,16));cgFur(B,M,m=>m.part=='leg'&&m.y<kn-.04&&Math.sign(m.x)==s,{off:.035,len:.08,col:pe,col2:pe2,seed:5+s,jag:.5})})});})();

// ===================================================================== Yeti =====================================================================
(function(){const S=cgHuman({h:.86,w:1.36,d:1.3,rw:[1.2,1.26,1.26,1.32,1.42,1.46,1.5,1.62],rf:[1.1,1.15,1.35,1.4,1.4,1.3,1.2,1.3],rb:[1.15,1.25,1.25,1.32,1.42,1.48,1.55,1.7],at:1.75,lt:1.62,hs:1.02,hw:1.1,hd:1.05,armL:1.3,legL:.8,nw:1.9,neckL:-.02,foot:1.25,footW:1.45,hz:.03});
  const f1=0x9c9e9c,f2=0x84888c,f3=0xb2b4b0,sk=0x30343c,sk2=0x22262c,cl=0x101214,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<0)return 0;const f=Math.min(1,n[2]*1.4+.2);let d=0;
    d+=.04*cgG(x,y,0,1.56,.045,.03);                                         // the jutting muzzle
    d+=.014*cgG(x,y,0,1.598,.022,.012);[-1,1].forEach(s=>d-=.008*cgG(x,y,s*.012,1.592,.006,.005));   // a flat, wide nose with flared nostrils
    [-1,1].forEach(s=>d-=.02*cgG(x,y,s*.036,1.629,.014,.009));d+=.03*cgG(x,y,0,1.65,.06,.009);    // small eyes deep under a heavy brow
    d-=.008*cgG(x,y,0,1.547,.035,.004);return d*f};
  cg181Reg('yeti',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],kn=J.rh1[1];cgSculpt(M,{head:1},S.sculpt(FACE));
    const face=m=>m.part=='head'&&m.s>.3&&m.y<S.hp(0,1.67,0)[1]&&Math.abs(m.x)<.08*S.hs*1.1,fur=m=>a181Nz(f1,m,.35,12);
    cgEmit(B,M,m=>face(m)||m.part=='hand'||m.part=='foot'?sk:m.part=='torso'&&m.s>.5&&m.y<J.chest[1]?mdMix(sk,f2,.5):fur(m));
    cgEyes(k,M,S,0x9ad8ff,.036,1.629,.75,-.004);cgTeeth(k,M,S,[[-.03,1.547,.03,1],[.03,1.547,.03,1],[-.024,1.55,.02],[.024,1.55,.02]],0xd8d0b8);
    [-1,1].forEach(s=>{cgFingers(k,S,s,sk,'claw',.9,cl,.035);cgToes(k,S,s,sk,.025,cl)});
    // the coat: overlapping fur layers, each breaking into ragged clumps over the next (head mane, shoulder mantle, chest and
    // back, hips and thighs; upper arms, forearms to the wrist cuffs, shins to the ankles)
    const ch=J.chest[1],sp=J.spine[1],F=(sel,off,len,col,col2,seed)=>cgFur(B,M,sel,{off,len,col,col2,seed,jag:.6}),E=(m,y,a,sd)=>m.y>cgEdge(m,y,a,sd);
    F(m=>(m.part=='head'&&!face(m))||(m.part=='neck'&&E(m,S.J.neck[1]-.02,.03,1)),.03,.13,f1,f2,1);
    F(m=>((m.part=='torso'||m.part=='neck')&&E(m,ch-.05,.05,2))||(m.part=='arm'&&E(m,J.aR0[1]-.17,.04,12)),.05,.2,f3,f2,2);
    F(m=>m.part=='torso'&&E(m,sp-.07,.05,3)&&!E(m,ch-.02,.05,2),.04,.17,f1,f2,3);
    F(m=>(m.part=='torso'&&!E(m,sp-.05,.05,3))||(m.part=='leg'&&E(m,kn+.03,.04,4)),.04,.17,f1,f2,4);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',side=m=>Math.sign(m.x)==s;
      F(m=>m.part=='arm'&&side(m)&&!E(m,J.aR0[1]-.15,.04,12)&&E(m,J[A+'1'][1]-.03,.03,5+s),.034,.15,f3,f2,5+s);
      F(m=>m.part=='arm'&&side(m)&&!E(m,J[A+'1'][1]-.01,.03,5+s)&&E(m,J[A+'2'][1]+.04,.02,7+s),.03,.13,f1,f2,7+s);
      F(m=>m.part=='leg'&&side(m)&&!E(m,kn+.05,.04,4)&&E(m,J[L+'2'][1]+.05,.02,9+s),.03,.12,f3,f2,9+s)});
    // icicles frozen into the shoulder fur, an old scar across the face
    [[-.18,0],[.16,-.02],[-.06,.03],[.22,-.05]].forEach(([x,dy],i)=>{const y=sh+dy,p=cgRay(M,[x*S.h,y,-.6],[0,0,1]);if(p)k.p('chest','cone4','g',0xbfe6ff,p[0],p[1]-.05,p[2]-.03,.01,.07+i*.01,.01,Math.PI)})});
  ST179.yeti={sx:.5,hx:-.45,lk:.3,rk:.3,ax:-.2,lx:-.2,az:.18,lz:-.18,ex:-.35,le:-.35};})();
