// ================= v137: plate legs instead of kilts on heavy armour =================
// The heavy chests (Warrior / Paladin) hung a mail skirt and flaring faulds round the hips; as cloth measured round both legs
// it made the waist look far too wide. Inside a heavy chest build (mdChH) now:
//  * every skirt (mdSkirt) becomes plate legs: a cuisse round each thigh made of overlapping lames with trimmed edges, a knee
//    cop (poleyn) with a side wing, and for mail-only chests mail chausses instead of plates; each leg is skinned to its own
//    thigh bone, so it moves with the leg instead of the hips;
//  * the faulds below the belt hug the hips (torso-following bands, no flare).
var HV137={on:0,legs:0,X:null};
{const f=mdChH;mdChH=function(X){const o={on:HV137.on,legs:HV137.legs,X:HV137.X};HV137.on=1;HV137.legs=0;HV137.X=X;try{return f.apply(this,arguments)}finally{Object.assign(HV137,o)}}}
{const f=mdSkirt;mdSkirt=function(B,P){if(!HV137.on||!MD_ORN||!HV137.X)return f.apply(this,arguments);pl137Legs(HV137.X);return null}}
{const f=mdFaulds;mdFaulds=function(X,n,y0,y1,o){if(!HV137.on||!MD_ORN)return f.apply(this,arguments);const {B,P,d}=X,M=d.M,T=d.T,off=(P.tOff||0)+.01,h=(y0-y1)/n;
  for(let i=0;i<n;i++){const a=y0-i*h,b=a-h-.008;mdTS(B,P,Math.max(.44,b),a,off+.004*(n-i),{t:'m',col:m=>m.y<b+.012?(i==n-1||d.lv>=3?T:mdSh(M,.72)):i%2?mdSh(M,.9):M,lip:.004})}}}
function pl137Legs(X){if(HV137.legs)return;HV137.legs=1;const {B,P,d,k}=X,M=d.M,T=d.T,lv=d.lv|0,mailOnly=['mail','hauberk'].includes(d.st);
  const mc=mdMix(M,0x6a6c70,.3),md=mdSh(mc,.78);
  [-1,1].forEach(s=>{const R=mdLeg(P,s),bn=s<0?'lh0':'rh0';
    // the cuisse: lames down the thigh (or mail rows), a little wider than the leg
    const rr=[mdRAt(R,.25),mdRAt(R,.9),R[2],mdRAt(R,2.65)];
    if(mailOnly)mdLoft(B,rr,{seg:9,off:.014,col:m=>Math.round(m.y*48)%2?mc:md});
    else mdLoft(B,rr,{seg:9,off:.018,t:'m',col:m=>{const q=(m.y*26)%1;return q<.18?mdSh(M,.7):q>.86?mdSh(M,1.12):M}});
    // lame edges (trimmed bands) and the top rim
    if(!mailOnly)[.5,1.15,1.8,2.4].forEach((u,i)=>mdLB(B,R,u,.008,.024,i==0?T:mdSh(M,.82),{t:'m'}));
    else mdLB(B,R,.4,.012,.02,mdSh(M,.6),{});
    // the knee cop with a side wing and a rivet
    if(!mailOnly||lv>=1){const r=R[3],z=r.p[2]+r.f;k.p(bn,'sph','m',M,r.p[0],r.p[1]+.004,z+.012,.05,.055,.032);mdOW(k,r.w);
      k.p(bn,'tor','m',T,r.p[0],r.p[1]+.004,z+.012,.05,.012,.034,Math.PI/2,0,0);mdOW(k,r.w);
      k.p(bn,'oct','m',mdSh(M,1.1),r.p[0]+s*(r.rx+.018),r.p[1],r.p[2]+.01,.012,.045,.04,0,0,s*.25);mdOW(k,r.w);
      k.p(bn,'oct','m',T,r.p[0],r.p[1]+.004,z+.045,.009);mdOW(k,r.w)}})}
