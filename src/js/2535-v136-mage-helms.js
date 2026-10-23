// ================= v136: the Mage's head pieces, redesigned =================
// Hoods (Linen Hood, Spellbinder Cowl, Starweaver Cowl) are gkHoods; hats and circlets are fitted to the raven's skull with
// rvEll (v134) like before, but built anew:
//  * hats: a crumpled crown that leans back and flops over at the tip, a wavy drooping brim with a cut (dagged) edge, a band
//    with a buckle, patches and stitching, a crow feather in the band (Mossweave Hat); the Hedge-Witch's is taller and crooked,
//    bones and a little bottle hang from its brim and a charm from its tip;
//  * Pyre Circlet: an iron band of upswept flame blades round an ember; Lich Diadem: a band of bone with finger-bone spikes,
//    a small skull at the brow and a ragged veil hanging behind; Tempest Crown: a jagged crown of lightning spikes with storm
//    crystals.
function mgHat(X,o){const {B,k,A,G,d}=X,D=BRD[3],yb=1.214,c=o.col,br=o.br,N=28,TH=j=>j/N*Math.PI*2,T=d.T==null?MD_TRIM[d.ti|0]:d.T;
  const e0=rvEll(D,yb-.004,.014),e1=rvEll(D,yb+.016,.015);
  const at=(e,th,r)=>{const ca=Math.cos(th);return {x:Math.sin(th)*e.rx*r,z:e.zc+ca*(ca>0?e.f:e.b)*r}};
  // brim: rows from the head out to the rim, drooping and waving; a top and an underside (darker)
  const BR2=[];for(let i=0;i<=4;i++){const t=i/4,row=[];for(let j=0;j<=N;j++){const th=TH(j),p=at(e0,th,1),wv=Math.sin(th*5+.6)*.012+Math.sin(th*3)*.008,rr=br+wv;
      const L=Math.hypot(p.x,p.z-e0.zc)||1,ex=p.x/L,ez=(p.z-e0.zc)/L,R0=L,R=R0+(rr-R0)*t+(o.dag&&i==4&&j%2?-.018:0),droop=-(o.droop||.03)*t*t*(1+.5*Math.cos(th*2))+wv*t*.6;
      row.push({x:ex*R,y:yb+droop,z:e0.zc+ez*R,w:[['head',1]]})}BR2.push(row)}
  gkSurf(B,BR2,{t:'c',col:m=>m.i>=3?mdSh(c,.8):c});gkSurf(B,BR2.map(r=>r.map(v=>({x:v.x,y:v.y-.005,z:v.z,w:v.w}))),{t:'c',col:mdSh(c,.45)});
  // crown: rings rising from the band, leaning back, dented, the last ones flopping over backward
  const H=o.h,S=o.S||[[.0,1,0],[.05,.96,.01],[.1,.84,.03],[.15,.68,.06],[.2,.5,.1],[.24,.34,.15],[.27,.2,.21],[.27,.1,.27],[.24,.03,.31]];
  const CR=[];S.forEach(([h,r,dz],i)=>{const y=yb+.014+h*H,eh=rvEll(D,y,.016),row=[];for(let j=0;j<=N;j++){const th=TH(j),dent=1-(i>1&&i<6?.07*Math.max(0,Math.cos(th-.9))+.05*Math.max(0,Math.cos(th+2.2)):0);
      // the crown is wider than the head (it sits loose) and always clears the skull at its height
      const p=at(e1,th,1.18*r*dent),q=at(eh,th,1),use=eh.rx>.02&&Math.hypot(q.x,q.z-eh.zc)>Math.hypot(p.x,p.z-e1.zc)?q:p,flop=i>5?(i-5)*.02*H:0;
      row.push({x:use.x+(o.lean2||0)*h,y:y-flop,z:use.z-dz*(o.lean||1),w:[['head',1]]})}CR.push(row)});
  {const L=CR[CR.length-1];let cx=0,cy=0,cz=0;L.forEach(v=>{cx+=v.x;cy+=v.y;cz+=v.z});const n=L.length;CR.push(L.map(()=>({x:cx/n,y:cy/n-.006,z:cz/n-.01,w:[['head',1]]})))}
  gkSurf(B,CR,{t:'c',col:m=>m.i==0?mdSh(c,.7):o.patch&&m.i>=2&&m.i<=3&&m.j>=3&&m.j<=5?mdMix(c,0x6a5030,.45):o.patch&&m.i==4&&m.j>=18&&m.j<=20?mdMix(c,0x3a3a2a,.5):c});
  // the band and its buckle
  const bR=[0,1].map(q=>CR[q].map(v=>{const dx=v.x,dz=v.z-e1.zc,L=Math.hypot(dx,dz)||1,k2=(L+.005)/L;return {x:dx*k2,y:yb+.016+q*.022,z:e1.zc+dz*k2,w:v.w}}));
  gkSurf(B,bR,{t:'c',col:o.band||0x3a2618});
  const fp=bR[0][0];k.p('head','box','m',T,fp.x,yb+.028,fp.z+.006,.026,.024,.006);k.p('head','box','c',o.band||0x3a2618,fp.x,yb+.028,fp.z+.009,.016,.014,.004);
  if(G)k.p('head','oct','g',G,fp.x,yb+.028,fp.z+.012,.008,.01,.005);
  // stitches round the brim root
  for(let j=0;j<N;j+=2){const v=BR2[1][j];k.p('head','box','c',mdSh(c,.5),v.x,v.y+.003,v.z,.003,.002,.008,0,TH(j),0)}
  return {brim:BR2,crown:CR,band:bR,tip:CR[CR.length-2][Math.round(N/2)]}}
function mgBand(X,o){const {B,k,G,d}=X,D=BRD[3],yb=o.y||1.222,lo=rvEll(D,yb,.005),hi=rvEll(D,yb+.018,.005),lo2=rvEll(D,yb,.013),hi2=rvEll(D,yb+.018,.013);
  const r=(e,y)=>({p:[0,y,e.zc],rx:e.rx,f:e.f,b:e.b,w:[['head',1]]});mdLoft(B,[r(lo,yb),r(lo2,yb),r(hi2,yb+.018),r(hi,yb+.018)],{seg:24,t:o.t||'m',ref:[0,0,1],col:o.col});
  const at=(ang,e)=>{const ca=Math.cos(ang);return [Math.sin(ang)*e.rx,e.zc+ca*(ca>0?e.f:e.b)]};return {at,hi2,lo2,yb}}
{const D=BRD[3],f=D.helmSet.cloth;D.helmSet.cloth=function(X){const {k,st,M,A,G,d}=X,T=d.T==null?MD_TRIM[d.ti|0]:d.T;
  if(st=='hat'){const H=mgHat(X,{col:mdSh(M,.8),br:.17,h:.95,lean:1,droop:.03,dag:1,patch:1});
    // a crow feather tucked into the band, a bead
    const b=H.band[1][Math.round(28*.82)];gkFeather(k,'head',[b.x,b.y,b.z],[-.5,1,-.6],.13,.016,0x14141a,null);gkFeather(k,'head',[b.x+.004,b.y-.004,b.z+.004],[-.3,1,-.75],.1,.012,0x2a2a36,null);
    k.p('head','sph','c',0xa87a40,b.x,b.y-.01,b.z+.008,.008)}
  else if(st=='witch'){const H=mgHat(X,{col:mdSh(M,.6),br:.215,h:1.3,lean:1.35,lean2:.15,droop:.05,dag:1,patch:1,band:0x2a1e18,
      S:[[0,1,0],[.05,.95,.01],[.1,.82,.035],[.15,.64,.07],[.2,.46,.12],[.24,.32,.17],[.27,.2,.23],[.28,.12,.29],[.26,.06,.34],[.22,.02,.37]]});
    // charms on cords from the brim, one from the drooping tip
    const N=28;[[3,0xd8ccb0,'bone'],[8,0x7ac83a,'vial'],[20,0xd8ccb0,'skull'],[24,0x6a8a3a,'herb']].forEach(([j,c,t])=>{const v=H.brim[4][j],e=[v.x,v.y-.06,v.z];k.L('head','c',0x2a1e14,[v.x,v.y,v.z],e,.0025,.0025,3);
      if(t=='bone')gkBone(k,'head',[e[0]-.01,e[1],e[2]],[e[0]+.01,e[1]-.016,e[2]],.0035,c,null);else if(t=='vial')gkVial(k,'head',e[0],e[1]-.01,e[2],.75,G||c,T,null);
      else if(t=='skull')gkSkull(k,'head',e[0],e[1]-.016,e[2],.45,c,Math.atan2(v.x,v.z),null);else for(let q=0;q<3;q++)k.p('head','box','c',q%2?c:0x4a6a2a,e[0]+q*.004,e[1]-.016,e[2],.003,.032,.003,0,0,(q-1)*.3)});
    const tp=H.tip;k.L('head','c',0x2a1e14,[tp.x,tp.y,tp.z],[tp.x,tp.y-.07,tp.z-.01],.0025,.0025,3);k.p('head','oct',G?'g':'c',G||0xa83a2a,tp.x,tp.y-.08,tp.z-.01,.012,.016,.012)}
  else if(st=='circlet'){const Bd=mgBand(X,{col:mdSh(T,.75)}),ember=0xff7a20;
    for(let i=0;i<9;i++){const ang=(i-4)*.33,[x,z]=Bd.at(ang,Bd.hi2),h=.05+(4-Math.abs(i-4))*.012;k.L('head','m',i%2?mdSh(T,.9):T,[x,Bd.yb+.012,z],[x*1.12-(i-4)*.004,Bd.yb+.018+h,z+.008],.01,.001,4);
      if(i%2==0)k.p('head','cone4','g',ember,x*1.04,Bd.yb+.018+h*.45,z+.004,.004,h*.5,.003,0,ang,0)}
    const [gx,gz]=Bd.at(0,Bd.hi2);k.p('head','oct','m',T,gx,Bd.yb+.01,gz+.004,.02,.024,.01);k.p('head','oct','g',G||ember,gx,Bd.yb+.01,gz+.01,.012,.015,.008)}
  else if(st=='diadem'){const bone=0xd8ccb0,Bd=mgBand(X,{col:bone,t:'c'});
    for(let i=0;i<11;i++){const ang=(i-5)*.3,[x,z]=Bd.at(ang,Bd.hi2),h=.035+(5-Math.abs(i-5))*.009;gkBone(k,'head',[x,Bd.yb+.022,z],[x*1.05,Bd.yb+.02+h,z+.004],.0045,i%2?bone:0xc8bca0,null)}
    const [gx,gz]=Bd.at(0,Bd.hi2);gkSkull(k,'head',gx,Bd.yb+.006,gz+.012,.62,0xe0d6bc,0,null);if(G)[-1,1].forEach(q=>k.p('head','oct','g',G,gx+q*.0075,Bd.yb+.008,gz+.034,.004));
    // a ragged veil hanging from the back of the band
    const V=[];for(let i=0;i<=4;i++){const row=[];for(let j=0;j<=10;j++){const ang=Math.PI*.62+j/10*Math.PI*.76,[x,z]=Bd.at(ang,Bd.hi2),t=i/4,lw=1+t*.25;let y=Bd.yb+.01-t*.16;if(i==4&&j%2)y+=.03;
        row.push({x:x*lw,y,z:Bd.hi2.zc+(z-Bd.hi2.zc)*lw-t*.02,w:y>1.1?[['head',1]]:mdWb('neck','head',Math.max(0,(y-1.03)/.07))})}V.push(row)}
    gkSurf(X.B,V,{t:'c',col:m=>m.i>=3?0x2e2a3a:0x423c52})}
  else if(st=='crown'){const Bd=mgBand(X,{col:T}),glow=G||0x9ad8ff;
    for(let i=0;i<12;i++){const ang=i/12*Math.PI*2,[x,z]=Bd.at(ang,Bd.hi2),h=(i%3==0?.085:.05)*(Math.cos(ang)>.5?1.2:1),q=1.03;
      // a jagged lightning spike: two kinked segments
      const p1=[x,Bd.yb+.016,z],p2=[x*q+Math.cos(ang)*.008,Bd.yb+.016+h*.55,z*q-Math.sin(ang)*.008+Bd.hi2.zc*(1-q)],p3=[x*q*1.04,Bd.yb+.016+h,z*q*1.02+Bd.hi2.zc*(1-q)];
      k.L('head','m',T,p1,p2,.01,.006,4).L('head','m',mdSh(T,1.15),p2,p3,.007,.001,4);if(i%3==0)k.p('head','oct','g',glow,p2[0],p2[1],p2[2],.008,.014,.008)}
    const [gx,gz]=Bd.at(0,Bd.hi2);k.p('head','oct','g',glow,gx,Bd.yb+.012,gz+.008,.015,.022,.01);
}
  else return f.apply(this,arguments)}}
// ---------------- the Mage's hoods ----------------
GK_HOOD.linen={hood:X=>gkHoodBase(X,{col:mdSh(X.M,.8),lin:mdSh(X.M,.3),trim:mdSh(X.M,.6),dag:[.035],tip:{len:.2,r:.03,drop:1}}),
  post:(X,Hd)=>{const {k}=X;// a rope tie at the throat
    const a=gkHoodAt(Hd,.97,.5),b=gkHoodAt(Hd,.97,Math.PI*2-.5);if(a&&b){k.L('chest','c',0x6a5a3a,[a.x,a.y,a.z],[0,.94,(a.z+b.z)/2+.03],.005,.005,4);mdOW(k,a.w);k.L('chest','c',0x6a5a3a,[b.x,b.y,b.z],[0,.94,(a.z+b.z)/2+.03],.005,.005,4);mdOW(k,b.w);
      k.p('chest','sph','c',0x7a6a4a,0,.94,(a.z+b.z)/2+.03,.01);[-.012,.012].forEach(x=>{k.L('chest','c',0x6a5a3a,[x*.5,.94,(a.z+b.z)/2+.03],[x,.87,(a.z+b.z)/2+.04],.004,.003,3)})}}};
GK_HOOD.tallcowl={hood:X=>gkHoodBase(X,{col:X.M,lin:0x14101a,trim:mdSh(X.A,.8),peak:{h:.2,back:.13},crown:.02,dag:[.03],tip:false,clear:.02}),
  post:(X,Hd)=>{const {k,A,G,d}=X,T=X.T;// runes round the face, a chain from the peak with a padlock
    const I=[];Hd.ys.forEach((y,i)=>{if((Hd.phi[i]||0)>.05)I.push(i)});I.forEach((i,n)=>{if(n%2)return;const v=Hd.G[i][1];k.p('head','box',G?'g':'m',G||mdSh(A,1.2),v.x,v.y,v.z,.004,.012,.004,0,Math.atan2(v.x,v.z-Hd.cz[i]),0);mdOW(k,v.w)});
    const top=Hd.G[Hd.G.length-1][0],b=gkHoodAt(Hd,1.0,Math.PI);gkChain(k,'head',[[top.x,top.y,top.z],[top.x,top.y-.06,top.z-.03],[b.x,b.y+.05,b.z-.012]],.006,mdSh(T,1.1),p=>p[1]>1.1?[['head',1]]:[['neck',1]]);
    k.p('head','box','m',mdSh(T,.8),b.x,b.y+.04,b.z-.014,.02,.024,.01)}};
GK_HOOD.star={hood:X=>gkHoodBase(X,{col:X.M,lin:0x0e0e1e,trim:mdSh(X.A,.9),dag:0,tip:{len:.14,r:.03},over:.045}),
  post:(X,Hd)=>{const {k,G,A}=X,sc=0xe8dcb0;// stars on the cowl, a crescent at the brow
    for(let i=0;i<18;i++){const y=.92+((i*37)%19)/19*.34,th=.9+((i*53)%29)/29*(Math.PI*2-1.8),v=gkHoodAt(Hd,y,th);if(!v)continue;const a=Math.atan2(v.x,v.z-(v.cz||0)),sz=i%4==0?.012:.007;
      k.p('head','box',G&&i%5==0?'g':'m',G&&i%5==0?G:sc,v.x,v.y,v.z,sz*.3,sz*2,.003,0,a,Math.PI/4);mdOW(k,v.w);k.p('head','box',G&&i%5==0?'g':'m',G&&i%5==0?G:sc,v.x,v.y,v.z,sz*2,sz*.3,.003,0,a,Math.PI/4);mdOW(k,v.w)}
    const I=[];Hd.ys.forEach((y,i)=>{if((Hd.phi[i]||0)>.05)I.push(i)});const it=I[I.length-1];if(it!=null){const v=Hd.G[Math.min(Hd.G.length-1,it+1)][Math.round(Hd.N/2)]||Hd.G[it][0];
      const f=Hd.G[it][0],g=Hd.G[it][Hd.N],cx=(f.x+g.x)/2,cy=(f.y+g.y)/2+.012,cz=(f.z+g.z)/2;for(let q=0;q<5;q++){const a=-1.1+q*.55;k.p('head','box','m',sc,cx+Math.cos(a)*.02,cy+Math.sin(a)*.02,cz,.006,.016,.005,0,0,a)}
      k.p('head','oct',G?'g':'m',G||sc,cx+.004,cy,cz+.004,.006)}}};
