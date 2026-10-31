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
  // (o.sock) a shoulder socket as tall as the arm is thick: the armpit / mid / shoulder-line rings set round the shoulder joint
  if(o.sock){const ay=U(T.J.aR0[1]),r0=(o.arm||T.arm)[0].r*(o.at||1)*((o.armR||[])[0]||1)*o.sock;torso[4][0]=Math.max(torso[3][0]+.03,ay-r0);torso[5][0]=ay;torso[6][0]=ay+r0*.8;
    if(torso[7][0]<torso[6][0]+.03)torso[7][0]=torso[6][0]+.03}
  const ty=T.torso[T.torso.length-1][0],y0=torso[torso.length-1][0],nw=o.nw||1;
  const neck=T.neck.map(q=>{const t=(q[0]-ty)/(hb-ty);return [y0+(nb-y0)*t,q[1]*nw,q[2]*nw,q[3]*nw,(q[4]||0)+hz*t]});
  const J={},TJ=T.J;
  ['pelvis','spine','chest'].forEach(n=>J[n]=[0,U(TJ[n][1]),TJ[n][2]*d]);J.neck=[0,(y0+nb)/2,TJ.neck[2]+hz*.5];J.head=[0,H(TJ.head[1]),TJ.head[2]*hs+hz];
  ['l','r'].forEach(c=>{const L=c+'h';J[L+'0']=[TJ[L+'0'][0]*w*rw[1],TJ[L+'0'][1]*h*legL,TJ[L+'0'][2]];J[L+'1']=[TJ[L+'1'][0]*w*rw[1]*(o.knee||1),TJ[L+'1'][1]*h*legL,TJ[L+'1'][2]];J[L+'2']=[TJ[L+'2'][0]*w*rw[1]*(o.knee||1),TJ[L+'2'][1]*(o.ankle||1),TJ[L+'2'][2]]});
  ['L','R'].forEach(c=>{const A='a'+c,a0=TJ[A+'0'],a1=TJ[A+'1'],a2=TJ[A+'2'],s0=[a0[0]*w*rw[6],U(a0[1]),a0[2]],k=(p,q)=>[(q[0]-p[0])*(o.armX||1),(q[1]-p[1])*h*armL,(q[2]-p[2])];
    J[A+'0']=s0;J[A+'1']=add3(s0,k(a0,a1));J[A+'2']=add3(J[A+'1'],k(a1,a2))});
  ['cp0','cp1','cp2'].forEach(n=>J[n]=[0,U(TJ[n][1]),TJ[n][2]*d]);
  const ar=o.arm||T.arm,lg=o.leg||T.leg;
  // (o.snug) arms that hang against the body instead of out from it: the shoulder joint sits a little inside the shoulder line
  // by the arm's thickness, the elbow just clears the widest part of the torso beside the upper arm, the wrist just clears the
  // hips — so a thick-armed, wide-bodied foe's arms rest along its sides (the "arms too far from the body" fix). Keep the
  // stance's az / lz small (≤ .06) with it. o.snug can be a number (>1 lets the arms hang a little further out).
  if(o.snug){const at=o.at||1,sn=+o.snug||1,rU=ar[0].r*at*((o.armR||[])[0]||1),rM=(ar[Math.min(2,ar.length-1)].r)*at,rF=(ar[Math.min(5,ar.length-1)].r)*at,
      half=y=>{const q=cgAt(torso,y);return q[1]},maxHalf=(y0,y1)=>{let m=0;for(let i=0;i<=8;i++)m=Math.max(m,half(y0+(y1-y0)*i/8));return m};
    ['L','R'].forEach(c=>{const s=c=='L'?-1:1,A='a'+c,a0=J[A+'0'],a1=J[A+'1'],a2=J[A+'2'];
      const x0=half(a0[1])+rU*.3;
      const x1=Math.max(x0-.03,maxHalf(a1[1],a0[1]-rU)+rM*.7*sn);
      const x2=Math.max(x1-.02,maxHalf(Math.max(a2[1],torso[0][0]),a1[1])+rF*.75*sn);
      J[A+'0']=[s*x0,a0[1],a0[2]];J[A+'1']=[s*x1,a1[1],a1[2]];J[A+'2']=[s*x2,a2[1],a2[2]]})}
  const S={J,armRing:4,torso,neck,head,n:o.n||24,j2:!!o.j2,at:o.at||1,
    push:(i,j,a)=>(o.push||T.push)(i,j,a)*w,
    face:o.facePush||((i,j,a)=>T.face(i,j,a)*hs),
    arm:ar.map((q,i)=>({t:q.t,r:q.r*at*((o.armR||[])[i]||1),rf:q.rf&&q.rf*at*((o.armR||[])[i]||1),rb:q.rb&&q.rb*at*((o.armR||[])[i]||1),o:q.o&&q.o*at})),
    leg:lg.map((q,i)=>({t:q.t,r:q.r*lt*((o.legR||[])[i]||1),rf:q.rf&&q.rf*lt*((o.legR||[])[i]||1),rb:q.rb&&q.rb*lt*((o.legR||[])[i]||1),o:q.o&&q.o*lt})),
    foot:{len:T.foot.len*(o.foot||1)*Math.sqrt(h),w:(o.footW||1)*Math.sqrt(lt),h:o.footH||1,lite:!!o.footLite},
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
// ears grown out of the head: a flat, tapering loft whose root starts inside the skull (so no gap can show round its base),
// swept up / back; len, r (base half width), inner = the inside colour
function cgEars(k,M,S,col,y,len,up,back,r,inner){const B=k.B181;[-1,1].forEach(s=>{const q=S.hp(s*.3,y,0),p=cgRay(M,[q[0],q[1],q[2]],[-s,0,0],{head:1});if(!p)return;const L=len*S.hs,w=(r||.017)*S.hs*1.6,
    d=nrm3([s*.55,up,-back]),root=sub3(p,[s*.02*S.hs,0,0]),P=t=>add3(add3(p,mul3(d,L*t)),[0,0,0]);
  const R=[{p:root,rx:w*.9,f:.006,b:.006,w:[['head',1]]},{p:P(0),rx:w,f:.006,b:.006,w:[['head',1]]},{p:P(.45),rx:w*.72,f:.005,b:.005,w:[['head',1]]},{p:P(.8),rx:w*.3,f:.004,b:.004,w:[['head',1]]},{p:P(1),rx:.002,f:.002,b:.002,w:[['head',1]]}];
  if(B)mdLoft(B,R,{seg:8,ref:[s,0,0],capA:true,capB:true,col:m=>inner!=null&&m.s<-.2&&m.i>.8&&m.i<3.2?inner:col});
  else k.L('head','c',col,root,P(1),w,.002,4)})}
// fingers from the knuckles: kind 'open' | 'claw' | 'fist', len, nail colour, claw tip
function cgFingers(k,S,s,col,kind,len,nail,tip,t){const bn=s<0?'aL':'aR',a1=S.J[bn+'1'],a2=S.J[bn+'2'],d=nrm3(sub3(a2,a1)),kn=add3(a2,mul3(d,.08*(S.hand||1))),L=(len||1)*.08;
  // the hand's frame: u = the back of the hand, f = across the knuckles (thumb side), turned by S.pron like the cage's hand
  const u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d));   // the curl axis: each joint turns the finger toward the palm (−u)
  const P=(b,x,y)=>add3(add3(b,mul3(f,x)),mul3(u,y)),D=(a,b,c)=>nrm3(add3(add3(mul3(d,a),mul3(u,b)),mul3(f,c)));
  for(let i=0;i<4;i++){const z=(1.5-i)*.016,p=P(kn,z,-.004);if(kind=='fist')a181Digit(k,bn+'2',col,p,D(1,-.45,.05),L*.7,.0095,2,1.15,ax,0,null,t);
    else a181Digit(k,bn+'2',col,p,D(1,-.15,z*.6),L*(i==3?.82:1),.0085,3,kind=='claw'?.26:.14,ax,tip||0,nail,t)}
  const tb=add3(a2,mul3(d,.03));a181Digit(k,bn+'2',col,P(tb,.026,-.01),D(.6,-.3,.75),L*.62,.009,2,.3,nrm3(cross3(u,f)),tip?tip*.6:0,nail,t)}   // the thumb curls across the palm
function cgToes(k,S,s,col,claw,nail){const l=s<0?'lh2':'rh2',A=S.J[l],L=S.foot.len,W=S.foot.w;for(let i=0;i<5;i++){const tx=A[0]+(i-2)*.018*W,tz=A[2]+.16*L;k.L(l,'c',col,[tx,.018,tz-.02],[tx+(i-2)*.004,.012,tz+.012],.009*W,.007*W,4);if(claw)k.L(l,'c',nail||0x1a1214,[tx+(i-2)*.004,.012,tz+.012],[tx+(i-2)*.006,.004,tz+.012+claw],.006*W,.001,4)}}
// a point on the body surface at height y, angle a round the body (0 front, π/2 right side), pushed out by off (rays from
// outside find the smoothed surface; parts limits which faces count)
function cgSurf(M,S,y,a,off,parts){const q=cgTAt(S,y),d=[Math.sin(a),0,Math.cos(a)],p=cgRay(M,[d[0]*.9,y,q.z+d[2]*.9],[-d[0],0,-d[2]],parts||{torso:1,tail:1});return p?add3(p,mul3(d,off||0)):[d[0]*(q.rx+(off||0)),y,q.z+d[2]*((d[2]>=0?q.f:q.b)+(off||0))]}
// the bone weights of the body's surface nearest to p (for parts hung on a shell: they bend exactly as the shell there)
function cgWAt(M,p){let b=-1,bd=1e9;M.V.forEach((v,i)=>{const d=(v[0]-p[0])**2+(v[1]-p[1])**2+(v[2]-p[2])**2;if(d<bd){bd=d;b=i}});const v=M.V[b],L=[];for(let j=3;j<v.length;j++)if(v[j]>.01)L.push([M.B.O[j-3],v[j]]);L.sort((a,c)=>c[1]-a[1]);return L.slice(0,4)}
// a belt / sash: a band of the body's own surface (torso, or the tail top for a naga) between y−h and y+h, pushed out by off
function cgBelt(B,M,y,h,off,col,t){cgShell(B,M,m=>(m.part=='torso'||m.part=='tail')&&Math.abs(m.y-y)<h,off,col,{t,rim:0})}
// the torso ring of the cage spec at height y (rx, f, b, z)
function cgTAt(S,y){const q=cgAt(S.torso,y);return {rx:q[1],f:q[2],b:q[3],z:q[4]||0}}
// a skirt / robe / coat tail / tasset band from the torso at y0 down to y1: flares by fl, follows the hips and then the legs
function cgSkirt(B,S,y0,y1,fl,off,col,o){o=o||{};const n=o.n||7,q=cgTAt(S,y0),J=S.J,hy=J.lh0[1],ky=J.lh1[1],R=[];
  for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t,e=Math.min(1,t*2.4),wx=Math.max(q.rx,(J.rh0[0]+.09*(o.lw||1)));R.push({p:[0,y,q.z-(o.dz||0)*t*t],rx:q.rx+(wx-q.rx)*e+fl*t+off,f:q.f+fl*.7*t+off,b:q.b+fl*.9*t+off,w:[['pelvis',1]]})}
  R.unshift({p:[0,y0+.03,q.z],rx:Math.max(.02,q.rx-.012),f:Math.max(.02,q.f-.012),b:Math.max(.02,q.b-.012),w:[['pelvis',1]]});   // the top starts just inside the body, so the skirt is attached
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
  R.unshift({p:[0,y0-.02,q.z],rx:q.rx*.75,f:q.f*.75,b:q.b*.75,w:[['chest',1]]});const cut=o.cut||.36;mdLoft(B,R,{seg:24,col:m=>m.s>-.1&&m.i>1.5?o.ins:o.col,keep:m=>{const a=Math.abs(Math.atan2(m.c,m.s));if(a<Math.PI*cut+m.i*.1)return false;if(o.rag&&m.i>n-1.2&&a181H(Math.round(a*9),4)<o.rag)return false;return true}});
  if(o.rib!=null)for(let i=0;i<4;i++){const a=Math.PI*(.62+i*.25)*(i%2?1:-1),x=Math.sin(a),z=Math.cos(a),p0=R[2],p1=R[n];k.L('neck','m',o.rib,[x*p0.rx,p0.p[1],p0.p[2]+z*p0.b],[x*p1.rx*1.02,p1.p[1]+.01,p1.p[2]+z*p1.b*1.02],.007,.004,4)}}
// a hair shell: crown and back of the head down to the nape, with a hairline (peak = widow's peak depth, base y of the line)
function cgHair(B,M,S,o){const line=o.line||1.672,peak=o.peak||0,nape=S.hp(0,o.nape||1.56,0)[1];
  cgShell(B,M,m=>{if(m.part!='head'&&!(o.neck&&m.part=='neck'&&m.s<-.2))return false;const by=(m.y-S.nb)/(S.hs*1)+1.52,bx=m.x/S.hs;if(m.y<nape)return false;
    return m.s<(o.side==null?.1:o.side)||by>line-peak*Math.exp(-(bx/.022)*(bx/.022))+(Math.abs(bx)>.05?-.004:0)},v=>(o.thick||.016)*Math.min(1,Math.max(.35,(v[1]-nape)/(.12*S.hs))),m=>a181Nz(o.col,m,.4,24))}
// a tube along points (bell sleeves, straps, braids): rings of radius r_i, weights w_i
function cgTube(B,pts,r,w,col,o){mdLoft(B,pts.map((p,i)=>({p,rx:r[i],f:r[i],b:r[i],w:w[i]})),Object.assign({seg:10,col},o||{}))}

// ===================================================================== Blood Knight =====================================================================
// (v181 refine) seated limbs (16 columns, shoulder sockets as tall as the arm, arms and thighs grown out of the body), a
// light head cage under the closed helm, every plate a shell that replaces the skin under it (plates that meet overlap a little,
// so no crease shows where they join), the plates shaded by the body's baked creases; armoured fingers lofted out of the gauntlet
(function(){const S=cgHuman({h:1.06,w:1.1,d:1.08,rw:[1.12,1.18,1.12,1.16,1.22,1.22,1.28,1.3],rf:[1,1.05,1.15,1.2,1.25,1.2,1.15,1.1],at:1.32,lt:1.28,hs:.96,legL:1.04,nw:1.25,foot:1.05,footW:1.1,
    n:16,sock:1,j2:1,footLite:1,head:CG181.base.head.filter((q,i)=>[0,2,4,7,9,11,14].indexOf(i)>=0) /* 7 rings: the face is never seen */,facePush:()=>0,arm:CG181.base.arm.filter((q,i)=>i!=2&&i!=5) /* all under plate */,leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)});
  const pl=0x2a1419,pl2=0x40202a,ed=0x5a262c,gd=0x6e5230,ml=0x26262c,un=0x161012,cl=0x4e0a14,glow=0xff2a30,T=S.torso,J=S.J;
  cg181Reg('vampk',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],ey=J.aR1[1],wr=J.aR2[1],kn=J.rh1[1],an=J.rh2[1];
    M.shade=cgShade(M,{cav:1,y0:0,y1:sh+.3,hk:.24});
    // cuirass (fluted, a centre ridge, banded lames over the belly, a gilded rim), gorget
    va_Sh(B,M,m=>m.part=='torso'&&m.y>wy-.02&&m.y<sh+.03,.034,m=>m.y<wy+.03||m.y>sh?gd:m.y<wy+.12?(Math.round(m.y*34)%2?pl:pl2):Math.abs(m.x)<.025&&m.s>0?pl2:Math.round(Math.atan2(m.x,m.z)*7)%2?pl:mdSh(pl,.84),{t:'m'});
    va_Sh(B,M,m=>m.part=='neck'||(m.part=='torso'&&m.y>sh)||(m.part=='head'&&m.y<S.hp(0,1.535,0)[1]),.05,m=>m.y>S.hp(0,1.5,0)[1]?gd:pl2,{t:'m'});
    // mail skirt and banded tassets, a belt with a winged buckle
    cgSkirt(B,S,wy-.04,J.lh0[1]-.24,.05,.03,m=>Math.round(m.y*60)%3==0?0x18181c:ml,{n:5,seg:16});
    cgSkirt(B,S,wy-.04,J.lh0[1]-.15,.05,.052,m=>m.y<J.lh0[1]-.13?gd:Math.round(m.y*30)%2?pl:pl2,{n:5,t:'m',seg:16,keep:m=>Math.abs(m.c)>.25||m.s<-.2});
    va_Belt(B,M,wy-.015,.022,.058,0x1a1012,'m');
    const bk=cgSurf(M,S,wy-.015,0,.062);k.p('pelvis','sph','m',gd,bk[0],bk[1],bk[2],.03,.028,.014);[-1,1].forEach(s=>k.p('pelvis','cone4','m',gd,s*.04,bk[1]+.005,bk[2]-.004,.012,.05,.006,0,0,s*1.25));
    const cz=cgTAt(S,J.chest[1]+.04).f+.036;k.p('chest','oct','g',glow,0,J.chest[1]+.04,cz,.022,.03,.012);[-1,1].forEach(s=>{for(let i=0;i<3;i++)k.p('chest','cone4','m',gd,s*(.035+i*.022),J.chest[1]+.05-i*.012,cz-.006-i*.003,.012,.06-i*.012,.005,0,0,s*(1.0+i*.25))});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',a=J[A+'0'],L=s<0?'lh':'rh';
      // pauldrons: two dome lames with gilded rims, a swept fin of blades
      [[.05,.15,.11,.16,pl],[-.03,.135,.085,.145,ed]].forEach(([dy,sx,sy,sz,c],j)=>{k.p(A+'0','hem','m',c,a[0]+s*(.03+j*.014),a[1]+dy,a[2],sx,sy,sz,0,0,s*(.42+j*.12));k.p(A+'0','tor','m',gd,a[0]+s*(.03+j*.014),a[1]+dy-.004,a[2],sx,.012,sz,0,0,s*(.42+j*.12))});
      for(let j=0;j<3;j++)k.p(A+'0','cone4','m',j==1?pl2:pl,a[0]+s*(.03+j*.028),a[1]+.1+j*.015,a[2]-.03-j*.03,.026,.17-j*.035,.009,-.55-j*.12,0,-s*(.3+j*.15));
      // rerebrace, couter, vambrace, gauntlet; cuisse, poleyn, greave, sabaton
      va_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<a[1]-.08&&m.y>ey+.035,.022,m=>Math.round(m.y*28)%2?pl:pl2,{t:'m'});
      va_Sh(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<ey-.03&&m.y>wr-.03,.022,m=>m.y<wr+.02?gd:pl,{t:'m'});
      va_Sh(B,M,m=>(m.part=='hand'||(m.part=='arm'&&m.y<wr))&&Math.sign(m.x)==s,.012,pl,{t:'m'});va_Hand(B,S,s,{col:pl,nail:pl2,kind:'fist',len:1.1,r:.0095});
      const e=J[A+'1'],eb=e[2]-.06;k.p(A+'1','dod','m',pl2,e[0],e[1],eb,.05,.05,.04);k.L(A+'1','m',ed,[e[0],e[1],eb-.02],[e[0]+s*.02,e[1]+.03,eb-.09],.02,.002,4);
      va_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y>kn+.05&&m.y<J.lh0[1]-.1,.024,m=>Math.round(m.y*24)%2?pl:pl2,{t:'m'});
      const kq=J[L+'1'];k.p(L+'1','hem','m',pl2,kq[0],kq[1],kq[2]+.075,.075,.055,.06,Math.PI/2,0,0);k.L(L+'1','m',ed,[kq[0],kq[1]+.01,kq[2]+.12],[kq[0],kq[1]+.07,kq[2]+.18],.02,.002,4);
      va_Sh(B,M,m=>m.part=='leg'&&Math.sign(m.x)==s&&m.y<kn-.04&&m.y>an-.02,.022,m=>m.y<an+.04?gd:m.s>.6?pl2:pl,{t:'m'});
      va_Sh(B,M,m=>(m.part=='foot'||(m.part=='leg'&&m.y<an+.02))&&Math.sign(m.x)==s,.016,pl,{t:'m'});k.L(L+'2','m',pl2,[kq[0],.03,J[L+'2'][2]+.16*S.foot.len],[kq[0],.02,J[L+'2'][2]+.25*S.foot.len],.02,.003,4)});
    // the helm: closed, a T-slit with burning eyes, a crest blade and two horns sweeping back
    const sy=S.hp(0,1.629,0)[1];va_Sh(B,M,m=>m.part=='head',.03,m=>{if(m.s>.55&&Math.abs(m.y-sy)<.01*S.hs&&Math.abs(m.x)<.07)return 0x080404;if(m.s>.7&&Math.abs(m.x)<.012&&m.y<sy&&m.y>S.hp(0,1.55,0)[1])return 0x080404;return m.y>S.hp(0,1.69,0)[1]&&Math.abs(m.x)<.03?pl2:pl},{t:'m'});
    va_Body(B,M,m=>m.part=='head'?0x080404:un);
    [-1,1].forEach(s=>{const q=S.hp(s*.036,1.629,0),p=cgRay(M,[q[0],q[1],q[2]+.4],[0,0,-1]);if(p)k.p('head','sph','g',glow,p[0],p[1],p[2]+.034,.014,.0065,.006)});
    const ht=S.hp(0,1.74,0);k.L('head','m',pl2,[0,ht[1],ht[2]+.06],[0,ht[1]+.03,ht[2]-.06],.016,.012,4);k.L('head','m',pl2,[0,ht[1]+.03,ht[2]-.06],[0,ht[1]-.02,ht[2]-.2],.012,.002,4);
    [-1,1].forEach(s=>{const q=S.hp(s*.1,1.68,-.02);let p=[q[0],q[1],q[2]];[[s*.06,.03,-.05],[s*.04,.05,-.06],[s*.01,.06,-.06],[-s*.005,.05,-.05]].forEach((d,j)=>{const n=[p[0]+d[0],p[1]+d[1],p[2]+d[2]];k.L('head','m',j<2?pl:ed,p,n,.028-j*.006,.022-j*.006,5);p=n})});
    cgCape(B,S,{len:.32,w:1.25,col:cl,ins:0x1a0408,trim:gd,rag:.7})});
  ST179.vampk={sx:.06,hx:-.04,lk:.12,rk:.12,az:.06,lz:-.08,le:-.15};})();

// ===================================================================== Blood Magister =====================================================================
// (v181 refine) a tall, gaunt aristocrat: seated limbs (16 columns, sock, j2), 10 head rings, the robes and hair shells that
// replace the skin under them; the face's sockets, bruised under-eyes and hollow cheeks painted as smooth colour on a pale
// skin; the deep red robes shaded smoothly (no stripes), gold kept for the trims; lofted fingers
(function(){const S=cgHuman(Object.assign({h:1.1,w:.96,d:.96,rw:[.95,1,.88,.94,1,1,1.02,1],at:.86,lt:.9,hs:.96,armL:1.03,legL:1.06,
    n:16,sock:1,j2:1,footLite:1,arm:CG181.base.arm.filter((q,i)=>i!=5),leg:CG181.base.leg.filter((q,i)=>i==0||i==1||i==3||i==7) /* under the robes */},va_Head(va_HY,.96)));
  const sk=0x6e646c,sk2=0x544a52,rb=0x560c18,rb2=0x3a0610,un=0x160a0e,gd=0x5a4226,glow=0xff2a3a,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;d+=.02*cgG(x,y,0,1.598,.009,.014)+.012*cgG(x,y,0,1.616,.007,.012);
    [-1,1].forEach(s=>{d-=.013*cgG(x,y,s*.036,1.629,.016,.01);d+=.007*cgG(x,y,s*.056,1.602,.014,.01);d-=.006*cgG(x,y,s*.047,1.568,.016,.014);d+=.003*cgG(x,y,s*.01,1.587,.006,.004)});
    d+=.008*cgG(x,y,0,1.648,.05,.006);d-=.004*cgG(x,y,0,1.558,.02,.003);d+=.008*cgG(x,y,0,1.538,.016,.012);return d*f};
  S.pron={'-1':.7};
  cg181Reg('vampm',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],cl=va_C,hs=S.hs;cgSculpt(M,{head:1},S.sculpt(FACE));
    M.shade=va_Shade(M,{cav:1,blur:3,y0:0,y1:sh+.3,hk:.22},{head:.35,neck:.6});
    const ey=S.hp(0,1.629,0)[1],my=S.hp(0,1.558,0)[1],
      skinV=m=>{let c=mdMix(sk,0x5e5460,cl((n3Sn(m.x,m.y,m.z,7,3)-.45)*1.2,0,.5));if(m.nz<-.2)c=mdMix(c,sk2,cl((-m.nz-.2)*1.2,0,.7));
        if(m.part=='head'||m.part=='neck'){const bx=m.x/hs,by=(m.y-S.nb)/hs+1.52;[-1,1].forEach(s=>{c=mdMix(c,0x463a48,.25*cgG(bx,by,s*.05,1.57,.015,.013));
          c=mdMix(c,0x4a2a3e,.32*cgG(bx,by,s*.04,1.614,.016,.006));if(m.nz>.2)c=mdMix(c,0x2a1a22,cl(1.2*cgG(bx,by,s*.036,1.629,.02,.012),0,.95))})}return c},
      col=m=>{if(m.part=='head'&&m.s>.3&&Math.abs(m.y-my)<.005*hs&&Math.abs(m.x/hs)<.024)return 0x3a1a22;return m.part=='torso'||m.part=='leg'||m.part=='foot'?un:null};
    // the robe over the chest, back and upper arms, open down the front with a gold edge; deep red shaded smoothly
    const robeV=m=>{const n=n3Sn(m.x*1.4,m.y*.3,m.z*1.4,20,5);return mdMix(rb,rb2,cl(.15+(n-.5)*.9+(m.nz<-.3?.25:0)+(m.y<wy+.05?.2:0),0,.8))};
    va_Sh(B,M,m=>(m.part=='torso'&&m.y>wy-.03&&Math.abs(Math.atan2(m.x,m.z))>.3)||(m.part=='arm'&&m.y>J.aR1[1]-.02),.02,m=>Math.abs(Math.atan2(m.x,m.z))<.45&&m.part=='torso'?gd:null,{vcol:robeV});
    va_Hair(B,M,S,{col:0x0c080a,line:1.674,peak:.026,neck:true,thick:.014});
    M.vaHide.push(M.F.map(f=>f.part=='foot'));   // the feet are inside the boots
    va_Body(B,M,col,skinV);
    cgEyes(k,M,S,glow,.036,1.629);cgTeeth(k,M,S,[[-.013,1.556,.018],[.013,1.556,.018]]);cgEars(k,M,S,sk,1.63,.07,.5,.85,.015,0x5a4048);
    [-1,1].forEach(s=>{va_Hand(B,S,s,s>0?{col:sk,nail:0x1a0a10,kind:'fist',len:1.05}:{col:sk,nail:0x1a0a10,kind:'open',len:1.35,claw:.02});a181Boot(B,{bones:{lh2:['',...J.lh2],rh2:['',...J.rh2]}},s,{col:0x120a0c,toe:.04})});
    // robes: the under-robe to the floor, the over-robe open down the front, gilded edges, a sash, a blood vial
    cgSkirt(B,S,wy,.02,.16,.02,m=>m.y<.06?gd:un,{n:6,seg:18});
    cgSkirt(B,S,wy,.03,.2,.042,m=>m.y<.07||Math.abs(Math.atan2(m.c,m.s))<.55?gd:Math.round(Math.atan2(m.c,m.s)*8)%2?rb:rb2,{n:7,seg:20,dz:.06,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.42});
    va_Belt(B,M,wy-.005,.035,.055,rb2);
    const sz=cgSurf(M,S,wy,0,.058)[2];k.p('pelvis','oct','m',gd,0,wy,sz,.03,.035,.014);k.L('pelvis','c',rb2,[.05,wy-.02,sz-.01],[.08,wy-.24,sz-.02],.022,.016,4);
    k.L('pelvis','m',gd,[-.07,wy-.02,sz-.01],[-.08,wy-.08,sz-.004],.004,.004,3);k.p('pelvis','cyl','g',glow,-.08,wy-.11,sz-.004,.014,.05,.014);k.p('pelvis','cyl','m',gd,-.08,wy-.08,sz-.004,.016,.008,.016);
    // bell sleeves from the elbow
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',e=J[A+'1'],w=J[A+'2'],d=sub3(w,e),pt=t=>add3(e,mul3(d,t)),r0=.05*S.h;
      cgTube(B,[pt(-.05),pt(.4),pt(.85),pt(1.18)],[r0,r0+.025,r0+.06,r0+.085],[[[A+'0',.3],[A+'1',.7]],[[A+'1',1]],[[A+'1',.6],[A+'2',.4]],[[A+'2',1]]],m=>m.i>2.3?gd:m.i<.5?rb:mdSh(rb,.88))});
    cgCollar(B,k,S,{top:1.69,w:1.05,col:rb2,ins:0x1a0408,rib:gd});
    const cz=cgTAt(S,J.chest[1]+.03).f+.024;k.p('chest','oct','g',glow,0,J.chest[1]+.03,cz,.02,.032,.01);for(let i=0;i<7;i++){const a=(i-3)*.16,y=sh-.03-Math.abs(i-3)*.02,q=cgTAt(S,y);k.p('chest','ico','m',gd,Math.sin(a)*(q.rx+.02),y,q.z+Math.cos(a)*(q.f+.026),.009)}});
  ST179.vampm={sx:.08,hx:-.06,lk:.08,rk:.08,lz:-.06,le:-.25};})();

// ===================================================================== Nosferatu =====================================================================
// (v181 refine) the most bestial of them: a hunched back (a curve in the spine, below the shoulders), a tall bald skull with
// bat ears grown out of it, long spidery arms and fingers with long dark nails; seated limbs (16 columns, sock, j2), the coat a
// shell that replaces the skin under it; the skin painted smoothly (sunken temples and cheeks, a dark mask round the eyes,
// faint blotches), no blocky patches; 14 head rings where the face's features turn, so its facets don't form bands; clawed toes lofted from the feet
(function(){const S=cgHuman(Object.assign({h:1.0,w:.88,d:.9,rw:[.9,.95,.78,.86,.94,.94,.96,.92],at:.74,lt:.78,hs:1.04,hy:1.16,hw:.9,armL:1.14,legL:1.03,neckL:.02,
    n:16,sock:1,j2:1,footLite:1,arm:CG181.base.arm.filter((q,i)=>i!=5),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)},va_Head(va_HYF,1.04,{cheek:.8})));
  const sk=0x5e6058,sk2=0x464a40,co=0x14100e,co2=0x221a18,glow=0xff2a20,nail=0x2a2018,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.05)return 0;const f=Math.min(1,n[2]*1.5);let d=0;
    d+=.034*cgG(x,y,0,1.588,.012,.017)+.02*cgG(x,y,0,1.612,.009,.016)-.008*cgG(x,y,0,1.574,.014,.009);   // a long hooked nose
    // deep sockets, cheekbones, sunken cheeks (wide, smooth dents: still gaunter than the Thrall's, without sharp creases)
    [-1,1].forEach(s=>{d-=.022*cgG(x,y,s*.037,1.63,.019,.013);d+=.009*cgG(x,y,s*.06,1.6,.017,.013);d-=.012*cgG(x,y,s*.052,1.566,.022,.022);d-=.003*cgG(x,y,s*.03,1.57,.008,.02)});
    d+=.015*cgG(x,y,0,1.652,.05,.009);d-=.004*cgG(x,y,0,1.553,.022,.005);d-=.005*cgG(x,y,0,1.536,.028,.012);return d*f};
  S.pron={'-1':1.1,'1':1.1};
  cg181Reg('nosferatu',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],cl=va_C,hs=S.hs;
    // the hunch: the upper back curves out between the shoulder blades (kept below the shoulder line, so no groove round the neck)
    cgSculpt(M,{torso:1},(x,y,z,n)=>n[2]<-.1?.075*cgG(x,y,0,(J.chest[1]+sh)/2-.03,.13,.11)*Math.min(1,(-.1-n[2])*1.6):0);
    // the knuckles of the spine standing out down the hunch (sculpted, so the coat over them shows them too)
    cgSculpt(M,{torso:1},(x,y,z,n)=>{if(n[2]>-.5)return 0;let d=0;for(let i=0;i<7;i++)d+=cgG(x,y,0,sh-.04-i*.038,.013,.011);return .012*d});
    cgSculpt(M,{head:1},S.sculpt(FACE));
    M.shade=va_Shade(M,{cav:1.1,blur:3,y0:0,y1:sh+.35,hk:.26},{head:.1,neck:.35});   /* crease darkening almost off on the face */
    const ey=S.hp(0,1.63,0)[1],
      skinV=m=>{const n=n3Sn(m.x,m.y,m.z,6,4),n2=n3Sn(m.x,m.y,m.z,13,7);let c=mdMix(sk,0x6a6c5e,cl((n-.5)*1.2,0,.45));c=mdMix(c,0x4a4438,cl((n2-.66)*3,0,.5));
        if(m.nz<-.2)c=mdMix(c,sk2,cl((-m.nz-.2)*1.2,0,.75));
        if(m.part=='torso'&&m.nz>.2){const f=cl((m.y-(wy+.04))/.04,0,1)*cl((sh-.06-m.y)/.04,0,1),ph=(((m.y+1.8*m.x*m.x-wy)/.04)%1+1)%1;c=mdSh(c,1-.26*Math.exp(-Math.pow((ph-.5)/.17,2))*f*cl((Math.abs(m.x)-.01)/.02,0,1))}
        if(m.part=='head'||m.part=='neck'){const bx=m.x/(hs*.9),by=(m.y-S.nb)/(hs*1.16)+1.52;[-1,1].forEach(s=>{c=mdMix(c,0x3e3a30,.3*cgG(bx,by,s*.052,1.566,.016,.014));c=mdMix(c,0x423c34,.4*cgG(bx,by,s*.075,1.66,.018,.03));
          if(m.nz>.15)c=mdMix(c,0x0e0a08,cl(1.35*cgG(bx,by,s*.037,1.63,.022,.015),0,1))})}
        if(m.part=='hand')c=mdSh(c,.9);return c},
      col=m=>m.part=='leg'?mdSh(co,m.s<-.3?.85:1):m.part=='head'&&m.s>.3&&Math.abs((m.y-S.nb)/(hs*1.16)+1.52-1.553)<.0045&&Math.abs(m.x/hs)<.03?0x1a0e0c:null;
    // the long coat, open in front (the coat body, a shell replacing the skin; the skirt and a torn standing collar hung from it)
    va_Sh(B,M,m=>(m.part=='torso'&&m.y>wy-.04&&Math.abs(Math.atan2(m.x,m.z))>.7)||(m.part=='arm'&&m.y>J.aR2[1]+.08),.016,null,{vcol:m=>mdMix(co,co2,cl(.25+(n3Sn(m.x*1.6,m.y*.25,m.z*1.6,22,3)-.5)*1.6,0,.9))});
    va_Body(B,M,col,skinV);
    cgEyes(k,M,S,glow,.037,1.63,1.15,-.002);cgTeeth(k,M,S,[[-.005,1.553,.03],[.005,1.553,.03],[-.017,1.553,.012],[.017,1.553,.012]]);
    // big bat ears grown out of the skull, swept up and back, a raw pink inside
    cgEars(k,M,S,sk,1.645,.17,.75,.55,.032,0x5a3a3a);
    [-1,1].forEach(s=>{va_Hand(B,S,s,{col:sk,nail,kind:'claw',len:1.9,r:.0066,claw:.06});va_Toes(B,S,s,sk2,.026,nail)});
    cgSkirt(B,S,wy-.02,J.lh1[1]-.25,.16,.035,m=>Math.round(Math.atan2(m.c,m.s)*7)%2?co:co2,{n:7,seg:18,dz:.1,keep:m=>Math.abs(Math.atan2(m.c,m.s))>.8&&!(m.y<J.lh1[1]-.05&&a181H(Math.round(Math.atan2(m.c,m.s)*9),3)<(J.lh1[1]-.05-m.y)*3.5)});
    va_Belt(B,M,wy-.022,.018,.042,0x2a1e16);
    cgCollar(B,k,S,{top:1.64,w:1.1,col:co,ins:0x2a0a0a,rag:.5,cut:.4})});
})();

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
// (v181 refine, Oct 31 2026) the Executioner, the Jotun and the Yeti on the lean cage (16 columns, seated shoulders and hips,
// fewer head and limb rings), with baked shading, smooth colour, clean one-piece fingers and their identities pushed:
// a massive human headsman, a heavy storm giant of the north, a stooped ape-like beast. Helpers for the three (ej_):
// the head rings kept from the base head (idx) and the base face push mapped onto them
function ej_Head(idx){const T=CG181.base;return {head:T.head.filter((q,i)=>idx.indexOf(i)>=0),face:hs=>(i,j,a)=>T.face(idx[i],j,a)*hs}}
// the arm rings: the base arm without the rings in drop (0 and 1 stay: j2 grows them out of the socket), then the hand as part
// of the arm's own surface: the palm swelling to the knuckle line and closing (sizes in model space; H.w = half width across
// the knuckles, H.th = half thickness, H.len = palm length factor); the fingers grow from its knuckle line (ej_Hand)
function ej_ArmR(at,drop,H,R){const a=at||1,L=H.len||1;return CG181.base.arm.filter((q,i)=>i<7&&drop.indexOf(i)<0).map((q,i)=>R&&R[i]?Object.assign({},q,R[i]):q)
  .concat([{t:2+.08*L,r:H.th*.86/a,rf:H.w*.84/a,rb:H.w*.8/a},{t:2+.25*L,r:H.th/a,rf:H.w/a,rb:H.w*.94/a},{t:2+.39*L,r:H.th*.78/a,rf:H.w*.9/a,rb:H.w*.84/a}])}
// fingers and thumb as rounded tapering lofts rooted inside the hand's knuckle line: one smooth piece each (no balls on sticks).
// The hand's frame is the cage arm's (S.pron turns the back of the hand forward), so the fingers always point out of the hand
// and curl toward the palm. o: {col, w (half width across the knuckles), r (finger radius), len, curl (per joint), pre (lean
// toward the palm), fan (spread), kn (knuckle line from the wrist), lift (toward the back of the hand), n, claw (length), nail,
// thumb (false: none), tcurl, tlen}
function ej_Hand(B,S,s,o){const A=s<0?'aL':'aR',a1=S.J[A+'1'],a2=S.J[A+'2'],d=nrm3(sub3(a2,a1)),u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,
    tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d)),W=[[A+'2',1]],
    rot=(v,k,t)=>{const c=Math.cos(t),si=Math.sin(t),kd=k[0]*v[0]+k[1]*v[1]+k[2]*v[2];return add3(add3(mul3(v,c),mul3(cross3(k,v),si)),mul3(k,kd*(1-c)))},
    n=o.n||4,r=o.r,col=o.col,nail=o.nail==null?mdSh(col,.55):o.nail,kn=add3(a2,mul3(d,o.kn||.072));
  const digit=(p0,dir,len,rr,curl,cax,c0)=>{const R=[];let dd=dir,p=sub3(p0,mul3(dir,rr*1.6));R.push({p,rx:rr*.85});R.push({p:p0,rx:rr});p=p0;
      [.42,.33,.25].forEach((l,j)=>{dd=rot(dd,cax,curl*(j?1:c0));p=add3(p,mul3(dd,len*l));R.push({p,rx:rr*(.9-j*.1)})});
      if(o.claw){dd=rot(dd,cax,curl*.7);R.push({p:add3(p,mul3(dd,o.claw*.3)),rx:rr*.62,col:nail});R.push({p:add3(p,mul3(rot(dd,cax,curl*.5),o.claw)),rx:.0016,col:nail})}
      else R.push({p:add3(p,mul3(dd,rr*.6)),rx:rr*.45,col:o.nail!=null?nail:null});
      R.forEach(q=>{q.f=q.b=q.rx;q.w=W;if(q.col==null)q.col=col});mdLoft(B,R,{seg:5,ref:u,capB:true})};
  for(let i=0;i<n;i++){const z=n>1?(1-2*i/(n-1))*o.w*.7:0,p=add3(add3(kn,mul3(f,z)),mul3(u,o.lift||0)),dir=nrm3(add3(add3(d,mul3(u,-(o.pre==null?.12:o.pre))),mul3(f,z*(o.fan==null?1.4:o.fan))));
    digit(p,dir,o.len*(n>3&&i==n-1?.8:i==0?.94:1),r*(n>3&&i==n-1?.86:1),o.curl,ax,o.c0==null?.5:o.c0)}
  if(o.thumb!==false){const tb=add3(add3(add3(a2,mul3(d,.032)),mul3(f,o.w*.8)),mul3(u,-o.w*.22)),td=nrm3(add3(add3(mul3(d,.62),mul3(u,-.4)),mul3(f,.68)));
    digit(tb,td,o.len*(o.tlen||.66),r*1.12,o.tcurl==null?.3:o.tcurl,nrm3(cross3(u,f)),1)}}
// a closed fist: in a fist the fingers don't change the outline, so they are ONE rounded mitten mass that grows from inside the
// palm, over a knuckle ridge (a little proud) and curls round the grip toward the palm; the finger separations are painted as
// thin dark lines along it, and the thumb is its own rounded loft crossing in front. o: {col, w (half width across the
// knuckles), r (half thickness of the fingers), len, turn ([per-step turns toward the palm]), kn, lift, tlen}
function ej_Fist(B,S,s,o){const A=s<0?'aL':'aR',a1=S.J[A+'1'],a2=S.J[A+'2'],d=nrm3(sub3(a2,a1)),u0=nrm3(sub3([s,0,0],mul3(d,d[0]*s))),fv=nrm3(cross3(d,u0)),f0=fv[2]<0?mul3(fv,-1):fv,
    tw=(S.pron&&S.pron[s])||0,u=add3(mul3(u0,Math.cos(tw)),mul3(f0,Math.sin(tw))),f=sub3(mul3(f0,Math.cos(tw)),mul3(u0,Math.sin(tw))),ax=nrm3(cross3(u,d)),Wt=mdW(B,[[A+'2',1]]),
    rot=(v,k,t)=>{const c=Math.cos(t),si=Math.sin(t),kd=k[0]*v[0]+k[1]*v[1]+k[2]*v[2];return add3(add3(mul3(v,c),mul3(cross3(k,v),si)),mul3(k,kd*(1-c)))},
    col=o.col,dark=mdSh(col,.42),w=o.w,r=o.r,L=o.len,kn=add3(add3(a2,mul3(d,o.kn||.072)),mul3(u,o.lift||0)),turns=o.turn||[1.05,1.0,1.0,.55],lens=[.42,.33,.25,.0];
  // the spine of the mitten: from inside the palm, through the knuckles, curling toward the palm (−u) round the grip
  const SP=[];let p=sub3(kn,mul3(d,.024)),dir=d,th=0;SP.push({p,dir,th});p=kn;SP.push({p,dir,th});
  turns.forEach((t,i)=>{th+=t;dir=rot(d,ax,th);p=add3(p,mul3(dir,i<3?L*lens[i]:r*.55));SP.push({p,dir,th})});
  // across the knuckles (t ∈ [-1,1] × w): stations either side of each finger separation (the dark lines), rounded ends
  const T=[-1,-.54,-.46,-.04,.04,.46,.54,1],sepQ=j=>j==1||j==3||j==5,ht=t=>r*Math.pow(Math.max(.08,1-t*t*.92),.4);
  const ring=k=>{const q=SP[k],n=rot(u,ax,q.th),out=[];
    T.forEach(t=>out.push(add3(add3(q.p,mul3(ax,t*w*(k?1:.9))),mul3(n,ht(t)*(k==2?1.08:1)))));   /* the back (knuckle) side */
    for(let j=T.length-1;j>=0;j--){const t=T[j];out.push(add3(add3(q.p,mul3(ax,t*w*(k?1:.9))),mul3(n,-ht(t)*.9)))}return out};   /* the palm side */
  const R=SP.map((q,k)=>ring(k)),N=R[0].length,V=x=>({x:x[0],y:x[1],z:x[2],w:Wt}),
    tri=(a,b,c,ctr,cl)=>{const n=cross3(sub3(b,a),sub3(c,a)),m=mul3(add3(add3(a,b),c),1/3);if(n[0]*(m[0]-ctr[0])+n[1]*(m[1]-ctr[1])+n[2]*(m[2]-ctr[2])<0){const x=b;b=c;c=x}mdTri(B,'c',V(a),V(b),V(c),mdC(cl))};
  // quad colour: the separation columns dark, the palm side a shade darker
  const qc=j=>{const top=j<T.length-1,jj=top?j:N-2-j;return (jj>=0&&jj<T.length-1&&sepQ(jj)&&top)||(!top&&jj>=0&&sepQ(jj))?dark:top?col:mdSh(col,.86)};
  for(let k=0;k<R.length-1;k++){const ctr=SP[k].p,c2=SP[k+1].p,mid=lerp3(ctr,c2,.5);for(let j=0;j<N;j++){const a=R[k][j],b=R[k][(j+1)%N],c=R[k+1][(j+1)%N],e=R[k+1][j],cl=j==T.length-1||j==N-1?col:qc(j);tri(a,b,c,mid,cl);tri(a,c,e,mid,cl)}}
  [[0,-1],[R.length-1,1]].forEach(([k,sg])=>{const q=SP[k],cp=add3(q.p,mul3(q.dir,sg*r*.35)),ctr=sub3(q.p,mul3(q.dir,sg*r));for(let j=0;j<N;j++)tri(R[k][j],R[k][(j+1)%N],cp,ctr,col)});
  // the thumb: a rounded loft from the side of the palm, crossing in front of the curled fingers
  const tb=add3(add3(add3(a2,mul3(d,.03)),mul3(f,w*.85)),mul3(u,-w*.15)),tl=L*(o.tlen||.62),TR=[];let tp=sub3(tb,mul3(d,.012)),td=nrm3(add3(add3(mul3(d,.55),mul3(u,-.75)),mul3(f,-.1)));
  const k2=nrm3(cross3(td,mul3(f,-1)));TR.push({p:tp,rx:r*.95});tp=tb;TR.push({p:tp,rx:r*1.05});[.45,.35,.2].forEach((l,i)=>{td=rot(td,k2,.6);tp=add3(tp,mul3(td,tl*l));TR.push({p:tp,rx:r*(.98-i*.1)})});
  TR.push({p:add3(tp,mul3(td,r*.5)),rx:r*.5});TR.forEach(q=>{q.f=q.b=q.rx;q.w=[[A+'2',1]];q.col=col});mdLoft(B,TR,{seg:6,ref:u,capB:true})}
// cgShell with smooth colour: col(m) returning null hands the face to o.vcol (a colour per corner, as cgEmit); o.rim as cgShell
function ej_Shell(B,M,sel,off,col,o){o=o||{};const N=M.N||(M.N=cgNormals(M)),pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map();
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1)}});
  const rim=new Set();M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;if(cnt.get(k)==1){rim.add(a);rim.add(b)}}});
  const P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=M.V[i],n=N[i],d=(typeof off=='function'?off(v):off)*(rim.has(i)?(o.rim==null?.12:o.rim):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  cgEmit(B,M,col,{t:o.t,pos,keep:(m,fi)=>pick[fi],vcol:o.vcol});if(o.hide)(M.ejHide||(M.ejHide=[])).push(sel)}
// the body's own faces, leaving out what shells registered with hide:1 cover completely (no skin emitted under clothes)
function ej_Body(B,M,col,o){const H=M.ejHide||[];cgEmit(B,M,col,Object.assign({},o||{},{keep:m=>!H.some(f=>f(m))&&(!o||!o.keep||o.keep(m))}))}
function ej_cl(v,a,b){return Math.max(a,Math.min(b,v))}
// cgFur with smooth colour (the same layered shell and ragged clumps): the shell's colour flows corner to corner, light and
// dark locks running down with the fall of the fur, instead of a colour per face (no "pixel camouflage"); o.hide also keeps
// the skin under the layer from being emitted (ej_Body); o.lenAt(p) / o.offAt(v) scale the clumps' length and the
// layer's thickness by where they are
function ej_Fur(B,M,sel,o){const N=M.N||(M.N=cgNormals(M)),V=M.V,pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map(),ef=new Map(),seed=o.seed||0;
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1);ef.set(k,[fi,a,b])}});
  const rim=new Set(),low=[];cnt.forEach((c,k)=>{if(c!=1)return;const [fi,a,b]=ef.get(k),m=cgInfo(M,M.F[fi]),my=(V[a][1]+V[b][1])/2;rim.add(a);rim.add(b);if(m.y>my+.002)low.push([a,b])});
  const lowV=new Set();low.forEach(([a,b])=>{lowV.add(a);lowV.add(b)});
  const lb=o.lump||[.35,1.3],lf=o.freq||24,lump=v=>{const n=n3Sn(v[0]*1.6,v[1]*.3,v[2]*1.6,lf,seed);return lb[0]+lb[1]*n*n},P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=V[i],n=N[i],d=o.off*lump(v)*(o.offAt?o.offAt(v):1)*(rim.has(i)?(lowV.has(i)?1:.1):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  const c2=o.col2==null?mdSh(o.col,.8):o.col2,vcol=o.vcol||(m=>{const g=n3Sn(m.x*1.4,m.y*.35,m.z*1.4,22,seed),b=n3Sn(m.x,m.y,m.z,6,seed+1);
    return mdMix(mdSh(o.col,.94+(b-.5)*.16),c2,ej_cl((.5-g)*3.2,0,.85))});
  cgEmit(B,M,null,{t:o.t,pos,keep:(m,fi)=>pick[fi],vcol});if(o.hide)(M.ejHide||(M.ejHide=[])).push(sel);
  const W=new Map(),wOf=i=>{let w=W.get(i);if(w)return w;const a=V[i],L=[];for(let j=3;j<a.length;j++)if(a[j]>1e-4)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let s=0;for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];s+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=s||1;w=[si,sw];W.set(i,w);return w};
  const vx=(p,i)=>({x:p[0],y:p[1],z:p[2],w:wOf(i)}),t=o.t||'c',nx=new Map();low.forEach(([a,b])=>{nx.set(a,b)});const used=new Set();let ci=0;
  low.forEach(([a0])=>{if(used.has(a0))return;const loop=[];let v=a0;while(v!=null&&!used.has(v)){used.add(v);loop.push(v);v=nx.get(v)}
    for(let i=0;i<loop.length-1;){const n=Math.min(loop.length-1-i,(o.run||2)+Math.floor(a181H(ci,seed,7)*(o.runV||3))),run=loop.slice(i,i+n+1);i+=n;ci++;
      const h=a181H(ci,seed,3),mid=lerp3(pos(run[0]),pos(run[run.length-1]),.5),L=o.len*(1-(o.jag==null?.6:o.jag)*h)*(o.lenAt?o.lenAt(mid):1),nn=nrm3(run.reduce((q,j)=>add3(q,N[j]),[0,0,0]));
      const tip=[mid[0]+nn[0]*L*.35,mid[1]-L,mid[2]+nn[2]*L*.35],c=mdC(h<.25?c2:mdSh(o.col,.84+a181H(ci,9,seed)*.2)),T=vx(tip,run[Math.floor(run.length/2)]);
      for(let j=0;j<run.length-1;j++){const p=run[j],q=run[j+1];mdTri(B,t,vx(pos(p),p),T,vx(pos(q),q),c);mdTri(B,t,vx(V[q],q),T,vx(V[p],p),c)}
      const f=run[0],l=run[run.length-1];mdTri(B,t,vx(V[f],f),T,vx(pos(f),f),c);mdTri(B,t,vx(pos(l),l),T,vx(V[l],l),c)}})}
// is this face of the arm past the wrist (the palm grown from the arm's own rings)? hands get the hand's colour
function ej_isHand(S,m){if(m.part=='hand')return true;if(m.part!='arm')return false;const A=m.x<0?'aL':'aR',a1=S.J[A+'1'],a2=S.J[A+'2'],d=nrm3(sub3(a2,a1));return (m.x-a2[0])*d[0]+(m.y-a2[1])*d[1]+(m.z-a2[2])*d[2]>.012}
// a huge, brutal human headsman: human proportions, massive and imposing (broad shoulders, a thick neck, a barrel chest and a
// gut, heavy arms with big hands, a small hooded head on top of it all). Leather hood with eye holes and glowing eyes, a
// blood-soaked apron, shoulder straps, a heavy belt with iron rings, stitched scars, forearm wraps, manacles with a broken
// link, breeches and heavy boots; dried blood on the hands and forearms
(function(){const HD=ej_Head([0,3,6,9,12,14]),
    S=cgHuman({snug:1,h:.97,w:1.32,d:1.28,rw:[1.15,1.22,1.4,1.34,1.32,1.36,1.44,1.4],rf:[1.1,1.3,1.8,1.6,1.32,1.2,1.15,1.2],rb:[1.05,1.15,1.15,1.12,1.15,1.18,1.2,1.25],at:1.66,lt:1.6,hs:.92,nw:1.7,legL:.95,foot:1.1,footW:1.3,
      n:16,sock:1,j2:1,footLite:1,head:HD.head,facePush:HD.face(.92),arm:ej_ArmR(1.66,[2,5],{w:.052,th:.025}),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)});
  const sk=0x8a7468,sk2=0x6a564c,flush=0x9a6656,scar=0x5a2a26,hd=0x22160f,hd2=0x341f14,ap=0x2e1c12,bl=0x2a0808,bl2=0x4a0e0c,ir=0x3a3a3e,ir2=0x56565c,lt=0x2a1a10,T=S.torso,J=S.J;
  S.pron={'-1':.9};
  cg181Reg('executioner',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],wr=J.aR2[1],kn=J.rh1[1],ch=J.chest[1],WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)};
    // big masses that show in the outline: a heavy chest, a broad thick back, the gut over the belt
    cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]>.2)[-1,1].forEach(s=>d+=.016*cgG(x,y,s*.085,ch+.03,.06,.045)*n[2]);if(n[2]<-.2)d+=.018*cgG(x,y,0,ch-.02,.15,.09)*-n[2];return d});
    M.shade=cgShade(M,{cav:1,y0:0,y1:sh+.2,hk:.26});   // baked creases, ridges and height light
    // dried blood: smooth stains (and runs down from them) on the hands and forearms, splashes on the chest
    const blood=m=>{if(m.part!='hand'&&!(m.part=='arm'&&m.y<J.aR1[1])&&!(m.part=='torso'&&m.s>.3))return 0;const n=n3Sn(m.x,m.y,m.z,9,4);
      return m.part=='torso'?ej_cl((n-.72)*4,0,1)*.7:ej_cl((n-.45)*3,0,1)};
    const skin=m=>{const n=n3Sn(m.x,m.y,m.z,6,3);let c=mdMix(sk,sk2,ej_cl(.2+(n-.5)*.7+(m.nz<-.35?.3:0),0,1));
      if(m.ny>.35)c=mdMix(c,flush,ej_cl((m.ny-.35)*.6,0,.22));   // weathered, ruddy tops of the shoulders and arms
      const b=blood(m);if(b>0)c=mdMix(c,b>.6?bl:bl2,b*.75);return c};
    // the hood over the whole head: two eye holes, a crown seam, darker lower edge, worn crown
    const ey=S.hp(0,1.629,0)[1],hood=m=>m.part=='head'||(m.part=='neck'&&m.y>J.neck[1]);
    ej_Shell(B,M,hood,.016,m=>{const bx=m.x/S.hs;if(m.s>.45&&Math.abs(Math.abs(bx)-.04)<.017&&Math.abs(m.y-ey)<.013*S.hs)return 0x050303;return Math.abs(m.x)<.008&&m.y>ey&&m.s<.9?hd2:null},
      {rim:0,vcol:m=>{const n=n3Sn(m.x,m.y,m.z,12,2);let c=mdMix(hd,0x140c08,ej_cl(.3+(n-.5)*.8,0,1));if(m.ny>.5)c=mdMix(c,hd2,(m.ny-.5)*.8);return c}});
    M.ejHide=[m=>hood(m)&&m.y>J.neck[1]+.02];   // the head under the hood is never seen
    cgEyes(k,M,S,0xff6a3a,.04,1.629,.8,.019);const nt=S.hp(0,1.505,0);mdLoft(B,[nt[1]-.01,nt[1]+.01].map(y=>({p:[0,y,nt[2]],rx:.072*S.hs*1.25,f:.075*S.hs*1.25,b:.072*S.hs*1.25,w:[['neck',1]]})),{seg:12,col:0x5a4a32});
    k.L('neck','c',0x5a4a32,[.02,nt[1],nt[2]+.09],[.03,nt[1]-.08,nt[2]+.1],.006,.004,3);WS([.02,nt[1],nt[2]+.07]);
    // the apron (chest to knees): soaked with blood that ran down it, darker toward the hem
    const apC=m=>{const n=n3Sn(m.x,m.y,m.z,8,3),st=n3Sn(m.x*2.4,m.y*.3,m.z*2.4,16,5);let c=mdMix(ap,0x1c100a,ej_cl(.25+(n-.5)*.6,0,1));
      const b=Math.max(ej_cl((n-.55)*2.2,0,1),ej_cl((st-.6)*2,0,1)*ej_cl((sh-.1-m.y)*3,0,1));if(b>0)c=mdMix(c,mdMix(bl2,bl,b),b*.8);return c};
    ej_Shell(B,M,m=>m.part=='torso'&&m.s>.25&&m.y<sh-.05,.03,null,{vcol:apC,rim:0,hide:1});
    cgSkirt(B,S,wy-.02,kn+.06,.06,.06,m=>{const n=n3Sn(m.x,m.y,m.z,5,3);return mdMix(mdMix(ap,0x1c100a,ej_cl(.25+(n-.5)*.5,0,1)),bl,ej_cl((wy-.05-m.y)*1.6+(n-.5)*.6,0,.7))},{n:5,seg:16,keep:m=>m.s>.35});
    // the apron's straps over the shoulders: tubes laid on the skin (points found on the body), both ends sunk into it
    [-1,1].forEach(s=>{const top=cgRay(M,[s*.1,sh+.5,cgTAt(S,sh).z],[0,-1,0],{torso:1,neck:1}),pts=[cgSurf(M,S,sh-.09,s*.42,-.004),cgSurf(M,S,sh-.04,s*.42,.012),top?add3(top,[0,.012,0]):[s*.1,sh+.05,0],cgSurf(M,S,sh-.06,s*(Math.PI-.42),.012),cgSurf(M,S,sh-.16,s*(Math.PI-.42),-.006)];
      cgTube(B,pts,[.014,.015,.015,.015,.014],pts.map(p=>cgWAt(M,p)),0x1e120c,{seg:5})});
    // the heavy belt rides on the hips, an iron buckle and two iron rings at the sides
    const hy=T[1][0]+.03;ej_Shell(B,M,m=>m.part=='torso'&&Math.abs(m.y-hy)<.032,.07,0x1a100a,{rim:0,hide:1});
    const bf=cgSurf(M,S,hy,0,.074);k.p('pelvis','box','m',ir2,bf[0],bf[1],bf[2],.06,.05,.012);WS(sub3(bf,[0,0,.074]));
    [-1,1].forEach(s=>{const p=cgSurf(M,S,hy-.02,s*1.25,.07);k.p('pelvis','tor','m',ir,p[0],p[1]-.03,p[2],.022,.022,.007,0,s*1.25,0);WS(sub3(p,mul3([Math.sin(s*1.25),0,Math.cos(s*1.25)],.07)))});
    // stitched scars on the back and the arm
    [[sh-.06,2.4],[wy+.12,-2.6],[sh-.12,Math.PI]].forEach(([y,a])=>{const q=cgTAt(S,y),o=[Math.sin(a)*.6,y,q.z+Math.cos(a)*.6],p=cgRay(M,o,nrm3([-o[0],0,q.z-o[2]]));if(!p)return;const e=[p[0]+.05,p[1]-.08,p[2]];
      k.L('chest','c',scar,p,e,.006,.005,3);WS(p);for(let i=0;i<4;i++){const c=lerp3(p,e,i/3);k.p('chest','box','c',0x1a1010,c[0],c[1],c[2],.016,.003,.003,0,a,.5);WS(c)}});
    // forearm wraps, manacles with a broken link; big hands (the right one a fist round the haft); breeches, heavy boots
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';ej_Shell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.04&&m.y>wr+.03,.012,m=>Math.round(m.y*50)%2?0x3a2a1c:0x2a1e14,{rim:0,hide:1});
      ej_Shell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<wr+.035&&m.y>wr-.03,.024,ir,{t:'m',rim:0,hide:1});const w=J[A+'2'];k.p(A+'2','tor','m',ir2,w[0],w[1]+.005,w[2]+.06,.014,.006,.016,Math.PI/2,0,0);
      const hc=mdMix(sk,bl2,.35);(s>0?ej_Fist:ej_Hand)(B,S,s,s>0?{col:hc,w:.05,r:.0135,len:.072,lift:.012}:{col:hc,w:.052,r:.0125,len:.085,curl:.28,pre:.15});
      // breeches and boots as one shell (no pinch where they meet): the boot stands farther off, its top a cuff
      const bt=kn-.13;ej_Shell(B,M,m=>((m.part=='leg'||m.part=='foot')&&Math.sign(m.x)==s)||(m.part=='torso'&&m.y<wy&&Math.sign(m.x||s)==s),v=>v[1]<bt?.022:.012,
        m=>m.part=='foot'&&m.y<.03?ir:m.part=='foot'||m.y<bt?mdMix(0x1a120c,0x2e2016,ej_cl((m.ny+.3)*.6+(m.y>bt-.03?.25:0),0,1)):null,{rim:0,hide:1,vcol:m=>mdMix(lt,0x1a100a,ej_cl(.3+(n3Sn(m.x,m.y,m.z,9,s+4)-.5)*.6,0,1))})});
    ej_Body(B,M,null,{vcol:skin})});})();

// ===================================================================== Stormborn Jotun =====================================================================
// a storm giant of the north: giant proportions (a huge barrel chest and shoulders, long thick arms with great hands, heavy
// legs, a smallish head low between the shoulders), blue-grey skin rimed with frost on everything that faces the sky and
// pale lightning veins; a great white beard with braids and iron rings, a white mane, a horned iron helm with a nasal and two
// heavy ridged horns, a wolf-pelt mantle with a ragged fur edge, glowing storm runes, rune-bracers, a leather war-kilt, a
// studded belt, fur-wrapped boots
(function(){const HD=ej_Head([0,2,4,6,8,9,11,14]),
    S=cgHuman({h:.9,w:1.3,d:1.22,rw:[1.1,1.15,1.15,1.22,1.34,1.4,1.5,1.5],rf:[1,1.1,1.25,1.36,1.46,1.32,1.2,1.2],at:1.72,lt:1.58,hs:.9,nw:1.65,armL:1.08,legL:.94,foot:1.15,footW:1.4,
      n:16,sock:1,j2:1,footLite:1,head:HD.head,facePush:HD.face(.9),arm:ej_ArmR(1.72,[2,5],{w:.062,th:.03,len:1.1},{3:{r:.038}}),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)});
  const sk=0x5e7388,sk2=0x485a6e,rime=0xa8c0d4,vein=0x9ad8f0,rune=0x8ae0ff,wh=0xd8e0e8,wh2=0xb0bcc8,pe=0x5a4e40,pe2=0x3e342a,lt=0x2e2218,ir=0x3a3e46,ir2=0x52565e,hn=0xb8ac90,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<.1)return 0;const f=Math.min(1,n[2]*1.6);let d=0;d+=.022*cgG(x,y,0,1.594,.016,.014)+.012*cgG(x,y,0,1.614,.011,.012);
    [-1,1].forEach(s=>{d-=.014*cgG(x,y,s*.038,1.629,.017,.01);d+=.008*cgG(x,y,s*.058,1.6,.016,.012);d+=.006*cgG(x,y,s*.016,1.584,.008,.005)});d+=.018*cgG(x,y,0,1.65,.055,.008);return d*f};
  S.pron={'-1':.9};
  cg181Reg('jotun',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],wr=J.aR2[1],kn=J.rh1[1],ch=J.chest[1],WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)};cgSculpt(M,{head:1},S.sculpt(FACE));
    // the giant's masses: a deep chest, heavy pectorals, a broad back
    cgSculpt(M,{torso:1},(x,y,z,n)=>{let d=0;if(n[2]>.2)[-1,1].forEach(s=>d+=.018*cgG(x,y,s*.09,ch+.02,.065,.05)*n[2]);if(n[2]<-.2)d+=.016*cgG(x,y,0,ch,.16,.1)*-n[2];return d});
    M.shade=cgShade(M,{cav:1,y0:0,y1:sh+.25,hk:.26});
    // skin: blue-grey, darker on the back, frost rime on what faces up, pale lightning veins; leather breeches
    const skin=m=>{if(m.part=='leg'||m.part=='foot')return mdMix(lt,0x1e160e,ej_cl(.3+(n3Sn(m.x,m.y,m.z,9,3)-.5)*.7,0,1));const n=n3Sn(m.x,m.y,m.z,6,3);
      let c=mdMix(sk,sk2,ej_cl(.2+(n-.5)*.7+(m.nz<-.35?.3:0),0,1));if(m.ny>.45&&(m.part=='arm'||Math.abs(m.x)>.14))c=mdMix(c,rime,ej_cl((m.ny-.45)*1.2,0,.4));
      const v=Math.abs(n3Sn(m.x,m.y*.6,m.z,10,7)-.5);if(v<.035&&m.part!='head')c=mdMix(c,vein,(1-v/.035)*.45);return c};
    cgEyes(k,M,S,rune,.038,1.629,.95,.002);
    // beard: over the jaw, a broad mass to the chest, two braids with iron rings; moustache; the mane
    const bc=m=>a181Nz(wh,m,.22,20),my=S.hp(0,1.562,0)[1];
    const H=sel=>(M.ejHide=M.ejHide||[]).push(sel),beard=m=>(m.part=='head'&&m.s>-.15&&m.y<S.hp(0,1.585,0)[1]&&!(m.s>.55&&Math.abs(m.x)<.028*S.hs&&Math.abs(m.y-my)<.01*S.hs))||(m.part=='neck'&&m.s>.3);
    // the beard: a solid mass grown from the jaw and chin (thickest at the chin), white with grey locks running down it and
    // darker toward the roots; over it fewer, thick, tapering locks that sway and overlap; a drooping moustache (the fur,
    // the beard and the helm hide the skin under them)
    const b0=S.hp(0,1.585,0)[1],chin=S.hp(0,1.54,0)[1],bmass=v=>.01+.032*Math.exp(-((v[0]/(.055*S.hs))**2))*ej_cl((b0-v[1])/(.05*S.hs),0,1)*(v[2]>S.hp(0,0,0)[2]?1:.3);
    ej_Shell(B,M,beard,bmass,null,{rim:0,hide:1,vcol:m=>mdMix(mdMix(wh,wh2,ej_cl(.3+(n3Sn(m.x*1.4,m.y*.4,m.z*1.4,24,21)-.5)*1.5,0,1)),0x8a909a,ej_cl((m.y-chin)/(.05*S.hs),0,1)*.5)});
    [-1.05,-.7,-.35,0,.35,.7,1.05].forEach((a,i)=>{const n=[Math.sin(a),0,Math.cos(a)],side=[Math.cos(a),0,-Math.sin(a)],z0=S.hp(0,0,0)[2],yb=S.hp(0,1.55-Math.abs(a)*.012,0)[1],p=cgRay(M,[n[0]*.4,yb,z0+n[2]*.4],mul3(n,-1),{head:1,neck:1});if(!p)return;
      const L=(.27-Math.abs(a)*.075)*(1+((i*7)%3-1)*.07),RR=[];
      for(let j=0;j<6;j++){const t=j/5,q=add3(add3(add3(p,mul3(n,j?.012+.026*Math.sin(t*Math.PI*.8):-.006)),[0,-L*t,0]),mul3(side,.014*Math.sin(t*3.2+i*1.9)));
        RR.push({p:q,rx:.026*(1-t*.84)+.002,f:.017*(1-t*.8)+.002,b:.017*(1-t*.8)+.002,w:j<2?cgWAt(M,p):j<4?[['neck',.5],['chest',.5]]:[['chest',1]],col:j<2?mdMix(wh2,0x8a909a,.4):j<4?wh:mdMix(wh,wh2,.6)})}
      mdLoft(B,RR,{seg:5,ref:n,capB:true})});
    [-1,1].forEach(s=>{const p=S.hp(s*.02,1.574,0),r=cgRay(M,[p[0],p[1],p[2]+.4],[0,0,-1]);if(!r)return;const w=cgWAt(M,r);
      const RR=[[-s*.012,.004,-.008],[0,0,.006],[s*.02,-.012,.012],[s*.03,-.042,.012],[s*.032,-.062,.008]].map((d,j)=>({p:add3(r,d),rx:[.008,.011,.01,.007,.002][j],w,col:j<2?mdMix(wh,0x8a909a,.35):wh}));RR.forEach(q=>{q.f=q.b=q.rx});mdLoft(B,RR,{seg:5,capB:true})});
    [-1,1].forEach(s=>{const p=S.hp(s*.05,1.545,.07);const q=[p[0]*1.15,p[1]-.13,p[2]+.02],r=[p[0]*1.1,p[1]-.27,p[2]+.0];cgTube(B,[p,q,r],[.017,.015,.006],[[['head',1]],[['neck',1]],[['chest',1]]],bc,{seg:6,capB:true});
      for(let i=0;i<3;i++){const c=lerp3(p,r,.25+i*.22);k.p(i<1?'neck':'chest','oct','c',wh2,c[0],c[1],c[2],.018,.013,.018)}k.p('chest','tor','m',ir2,q[0],q[1]-.05,q[2],.022,.02,.022)});
    cgHair(B,M,S,{col:wh,line:1.69,neck:true,thick:.02,side:.15,nape:1.505});{const nape=S.hp(0,1.505,0)[1];H(m=>(m.part=='head'||(m.part=='neck'&&m.s<-.2))&&m.y>=nape+.01&&(m.s<.1||(m.y-S.nb)/S.hs+1.52>1.7))}   /* the skin under the mane */
    // horned helm (iron cap with a nasal); the head under it is never seen
    const hy0=S.hp(0,1.662,0)[1];cgShell(B,M,m=>m.part=='head'&&m.y>hy0,.034,m=>Math.round(Math.atan2(m.x,m.z)*4)%2?ir:mdSh(ir,.85),{t:'m',rim:.5});H(m=>m.part=='head'&&m.y>hy0+.03);
    const np=S.hp(0,1.64,0),nr=cgRay(M,[0,np[1],np[2]+.4],[0,0,-1]);if(nr)k.p('head','box','m',ir2,0,np[1]-.01,nr[2]+.03,.026,.075,.014);
    // two heavy curling horns, each one smooth tapering piece grown from inside the helm, with ridges painted round it
    [-1,1].forEach(s=>{const q=S.hp(s*.088,1.68,0),R=[{p:add3(q,[-s*.03,0,0]),rx:.036}];let p=q;R.push({p,rx:.04});
      [[s*.07,.02,0],[s*.06,.04,.03],[s*.02,.05,.05],[-s*.01,.04,.05],[-s*.012,.02,.03]].forEach((d,j)=>{p=add3(p,d);R.push({p,rx:[.033,.025,.017,.009,.003][j]})});
      R.forEach((r,i)=>{r.f=r.b=r.rx;r.w=[['head',1]];r.col=i>=R.length-2?mdSh(hn,.7):i%2?hn:mdSh(hn,.84)});mdLoft(B,R,{seg:6,ref:[0,1,0],capB:true})});
    // the wolf-pelt mantle with a ragged fur edge over the shoulders and back, open in a V down the chest (the runes show)
    const mantle=m=>(m.part=='torso'&&m.y>ch-.04&&!(m.s>.55&&Math.abs(m.x)<(sh-m.y)*.7+.02))||(m.part=='neck'&&m.s<=.3)||(m.part=='arm'&&m.y>J.aR0[1]-.12);ej_Fur(B,M,mantle,{off:.05,len:.2,col:pe,col2:pe2,seed:2,jag:.6,hide:1});
    // storm runes glowing on the bare chest, belly and upper arms
    [[ch-.01,0,.07],[ch-.04,-.38,.05],[ch-.04,.38,.05],[J.spine[1]+.05,0,.06],[J.spine[1]+.02,-.5,.04],[J.spine[1]+.02,.5,.04]].forEach(([y,a,l],i)=>{const q=cgTAt(S,y),o=[Math.sin(a)*.6,y,q.z+Math.cos(a)*.6],p=cgRay(M,o,nrm3([-o[0],0,q.z-o[2]]),{torso:1});
      if(p){k.p(y>ch-.04?'chest':'spine','box','g',rune,p[0],p[1],p[2],.009,l,.003,0,a,i%2?.6:-.6);WS(p)}});
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR';ej_Shell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&m.y<J[A+'1'][1]-.05&&m.y>wr+.02,.024,m=>Math.round(m.y*30)%2?ir:ir2,{t:'m',rim:0,hide:1});
      cgShell(B,M,m=>m.part=='arm'&&Math.sign(m.x)==s&&Math.abs(m.y-(J[A+'1'][1]+wr)/2)<.012,.03,rune,{t:'g'});
      ej_Fist(B,S,s,s>0?{col:mdSh(sk,.92),w:.06,r:.017,len:.088,lift:.014,kn:.08}:{col:mdSh(sk,.92),w:.06,r:.017,len:.095,lift:.012,kn:.08,turn:[.7,.75,.75,.45]})});
    // war-kilt of leather panels, a studded belt, fur-wrapped boots
    cgSkirt(B,S,wy-.02,kn+.04,.07,.03,m=>Math.round(Math.atan2(m.c,m.s)*6)%2?lt:mdSh(lt,.85),{n:6,seg:14,keep:m=>Math.round(Math.atan2(m.c,m.s)*6)%3!=0||m.y>J.lh0[1]-.06});
    ej_Shell(B,M,m=>m.part=='torso'&&Math.abs(m.y-(wy-.012))<.036,.06,0x1e160e,{rim:0,hide:1});
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,p=cgSurf(M,S,wy-.012,a,.05);k.p('pelvis','oct','m',ir2,p[0],p[1],p[2],.016,.016,.012);WS(sub3(p,[Math.sin(a)*.05,0,Math.cos(a)*.05]))}   /* studs half sunk in the belt */
    [-1,1].forEach(s=>{ej_Shell(B,M,m=>m.part=='foot'&&Math.sign(m.x)==s,.03,null,{rim:0,hide:1,vcol:m=>mdMix(pe2,0x2a2219,ej_cl(n3Sn(m.x,m.y,m.z,12,s+2)-.3,0,1))});const lg=m=>m.part=='leg'&&m.y<kn-.04&&Math.sign(m.x)==s;ej_Fur(B,M,lg,{off:.035,len:.08,col:pe,col2:pe2,seed:5+s,jag:.5,hide:1})});
    ej_Body(B,M,null,{vcol:skin})});})();

// ===================================================================== Yeti =====================================================================
// a beast, not a man in a fur suit: a stooped, ape-like mass (a high hump of shoulder and back, a deep chest and a pot belly,
// the head low and forward between the shoulders), very long heavy arms with gorilla forearms and big clawed hands that hang
// to the knees, short thick legs on broad feet. A coat of overlapping shaggy fur layers that break into ragged clumps, dark
// skin on the face, palms and soles, a jutting muzzle, small pale eyes deep under a heavy brow, fangs, black claws, icicles
// frozen into the shoulder fur
(function(){const HD=ej_Head([0,2,4,6,7,8,9,10,12,14]),
    S=cgHuman({h:.86,w:1.4,d:1.34,rw:[1.18,1.26,1.3,1.4,1.52,1.58,1.64,1.62],rf:[1.1,1.15,1.42,1.46,1.42,1.3,1.2,1.3],rb:[1.15,1.25,1.25,1.36,1.5,1.6,1.68,1.75],at:1.9,lt:1.66,hs:1.02,hw:1.1,hd:1.05,armL:1.42,legL:.72,nw:2.1,neckL:-.03,foot:1.25,footW:1.45,
      n:16,sock:1,j2:1,footLite:1,head:HD.head,facePush:HD.face(1.02),arm:ej_ArmR(1.9,[2,5],{w:.066,th:.032,len:1.1},{1:{r:.044},3:{r:.04,rb:.044},4:{r:.03,rf:.032}}),leg:CG181.base.leg.filter((q,i)=>i!=2&&i!=5&&i!=6)});
  const f1=0x9c9e9c,f2=0x84888c,f3=0xb2b4b0,sk=0x30343c,sk2=0x22262c,cl=0x101214,T=S.torso,J=S.J;
  const FACE=(x,y,z,n)=>{if(n[2]<0)return 0;const f=Math.min(1,n[2]*1.4+.2);let d=0;
    d+=.032*cgG(x,y,0,1.566,.038,.024)+.02*cgG(x,y,0,1.536,.032,.012);          // the muzzle pushed out over a heavy, jutting jaw
    d+=.006*cgG(x,y,0,1.614,.014,.012)+.018*cgG(x,y,0,1.594,.03,.009);           // a low flat bridge and a broad, flat nose
    [-1,1].forEach(s=>{d-=.022*cgG(x,y,s*.034,1.628,.013,.01);d+=.016*cgG(x,y,s*.054,1.6,.016,.014)});   // deep-set sockets, cheek pads
    d+=.036*cgG(x,y,0,1.652,.065,.011);                                          // a heavy brow ridge overhanging the eyes
    d-=.009*cgG(x,y,0,1.549,.034,.004);return d*f};
  S.pron={'-1':1.2,'1':1.2};
  cg181Reg('yeti',S,function(B,P,k,C){const M=C.M,wy=T[2][0],sh=T[6][0],kn=J.rh1[1],hy=T[1][0],WS=p=>{k.P[k.P.length-1].w=cgWAt(M,p)};cgSculpt(M,{head:1},S.sculpt(FACE));
    // the ape's masses: a high hump of muscle over the shoulders and upper back (low enough on the back not to ring the
    // head), a pot belly; the base of the head filled so the shoulders flow up into it (no groove round the neck)
    cgSculpt(M,{torso:1,neck:1},(x,y,z,n)=>{let d=0;if(n[2]<-.1)d+=.075*cgG(x,y,0,sh-.11,.2,.11)*Math.min(1,(-.1-n[2])*1.6);if(n[2]>0)d+=.035*cgG(x,y,0,hy+.05,.15,.08)*n[2];return d});
    {const hb=S.hp(0,1.58,0)[1];cgSculpt(M,{neck:1,head:1,torso:1},(x,y,z,n)=>.03*cgG(0,y,0,(T[7][0]+hb)/2,1,(hb-T[7][0])*.75+.02)*Math.max(0,1-Math.abs(n[1])*1.2))}
    M.shade=cgShade(M,{cav:1.1,y0:0,y1:sh+.25,hk:.28});
    const face=m=>m.part=='head'&&m.s>.38&&m.y<S.hp(0,1.664,0)[1]&&Math.abs(m.x)<.07*S.hs*1.1,fur=m=>mdMix(f1,f2,ej_cl(.35+(n3Sn(m.x,m.y,m.z,7,2)-.5)*.9+(m.nz<-.4?.2:0),0,1));
    const skin=m=>mdMix(sk,sk2,ej_cl(.3+(n3Sn(m.x,m.y,m.z,9,5)-.5)*.6,0,1));
    cgEyes(k,M,S,0xaee4ff,.034,1.629,1.25,.01);{const n0=k.P.length;cgTeeth(k,M,S,[[-.03,1.547,.03,1],[.03,1.547,.03,1],[-.024,1.55,.02],[.024,1.55,.02]],0xd8d0b8);for(let i=n0;i<k.P.length;i++){const P=k.P[i];P.m.premultiply(new THREE.Matrix4().makeTranslation(0,0,-.0012));const c=new THREE.Vector3().setFromMatrixPosition(P.m);P.w=cgWAt(M,[c.x,c.y,c.z])}}   /* fangs a little deeper in the gums, moving with the skin of the mouth */
    // big hands: thick fingers grown from the knuckles, curling toward the palm, black claws; clawed toes
    [-1,1].forEach(s=>{ej_Hand(B,S,s,{col:sk,w:.066,r:.0155,len:.08,curl:.26,c0:0,pre:.15,fan:.3,claw:.034,nail:cl,kn:.074,tlen:.6});cgToes(k,S,s,sk,.025,cl)});
    // the coat: overlapping fur layers, each breaking into ragged clumps over the next (head mane, shoulder mantle, chest and
    // back, hips and thighs; upper arms, forearms to the wrist cuffs, shins to the ankles)
    // (every layer also hides the skin under it: no body faces are emitted where fur covers them)
    const ch=J.chest[1],sp=J.spine[1],FO=(sel,o)=>ej_Fur(B,M,sel,Object.assign({hide:1},o)),F=(sel,off,len,col,col2,seed)=>FO(sel,{off,len,col,col2,seed,jag:.6}),E=(m,y,a,sd)=>m.y>cgEdge(m,y,a,sd);
    const brow=S.hp(0,1.668,0)[1];FO(m=>m.part=='head'&&E(m,brow,.015,31),{off:.034,len:.08,col:f1,col2:f2,seed:31,jag:.65,lump:[.25,1.9],freq:34,lenAt:p=>{const q=S.hp(0,1.65,0);return p[2]>q[2]+.03&&Math.abs(p[0])<.085*S.hs*1.1?.3:1},offAt:v=>{const q=S.hp(0,1.65,0),fz=ej_cl((v[2]-q[2]-.02)/.05,0,1),fx=ej_cl(1-(Math.abs(v[0])-.05*S.hs*1.1)/.04,0,1);return 1-.8*fz*fx}}   /* thin and short over the brow, so the face shows; full on the crown, sides and back */);
    FO(m=>((m.part=='head'&&!face(m)&&!E(m,brow-.004,.015,31)&&m.s<.7)||(m.part=='neck'&&E(m,S.J.neck[1]-.02,.03,1))),{off:.03,len:.13,col:f1,col2:f2,seed:1,jag:.6,lump:[.25,1.7],freq:30});
    F(m=>((m.part=='torso'||m.part=='neck')&&E(m,ch-.05,.05,2))||(m.part=='arm'&&E(m,J.aR0[1]-.17,.04,12)),.05,.2,f3,f2,2);
    F(m=>m.part=='torso'&&E(m,sp-.07,.05,3)&&!E(m,ch-.02,.05,2),.04,.17,f1,f2,3);
    F(m=>(m.part=='torso'&&!E(m,sp-.05,.05,3))||(m.part=='leg'&&E(m,kn+.03,.04,4)),.04,.17,f1,f2,4);
    [-1,1].forEach(s=>{const A=s<0?'aL':'aR',L=s<0?'lh':'rh',side=m=>Math.sign(m.x)==s;
      F(m=>m.part=='arm'&&side(m)&&!E(m,J.aR0[1]-.15,.04,12)&&E(m,J[A+'1'][1]-.03,.03,5+s),.034,.15,f3,f2,5+s);
      F(m=>m.part=='arm'&&side(m)&&!E(m,J[A+'1'][1]-.01,.03,5+s)&&E(m,J[A+'2'][1]+.04,.02,7+s),.03,.13,f1,f2,7+s);
      F(m=>m.part=='leg'&&side(m)&&!E(m,kn+.05,.04,4)&&E(m,J[L+'2'][1]+.05,.02,9+s),.03,.12,f3,f2,9+s)});
    // icicles frozen into the shoulder fur
    [[-.18,0],[.16,-.02],[-.06,.03],[.22,-.05]].forEach(([x,dy],i)=>{const y=sh+dy,p=cgRay(M,[x*S.h,y,-.6],[0,0,1]);if(p){k.p('chest','cone4','g',0xbfe6ff,p[0],p[1]-.05,p[2]-.03,.01,.07+i*.01,.01,Math.PI);WS(p)}})
    // the skin left bare: face, hands, soles, wrists and ankles
    // the face painted: a lighter muzzle, dark sockets; the mouth line and nostrils crisp
    const fb=m=>[m.x/(S.hs*1.1),(m.y-S.nb)/S.hs+1.52],fcol=m=>{const [x,y]=fb(m);let c=mdMix(skin(m),0x767a84,.8*Math.max(cgG(x,y,0,1.575,.03,.02),cgG(x,y,0,1.61,.012,.012),cgG(x,y,-.054,1.6,.016,.014),cgG(x,y,.054,1.6,.016,.014)));
      return mdMix(c,0x08090c,.85*Math.max(cgG(x,y,-.034,1.628,.014,.011),cgG(x,y,.034,1.628,.014,.011),cgG(x,y,0,1.594,.026,.007)*.8))};
    ej_Body(B,M,m=>{if(!face(m))return null;const [x,y]=fb(m);return (Math.abs(y-1.549)<.0035&&Math.abs(x)<.032)||Math.hypot(Math.abs(x)-.013,y-1.592)<.0055?0x08080a:null},{vcol:m=>face(m)?fcol(m):ej_isHand(S,m)||m.part=='foot'?skin(m):fur(m)})});
  ST179.yeti={sx:.58,hx:-.52,lk:.32,rk:.32,ax:-.24,lx:-.24,az:.18,lz:-.18,ex:-.35,le:-.35};})();
