// ================= v136: the Assassin's gear, redesigned (the cat) =================
// The v95 light armour was a tight shirt with a sash. Every Assassin piece is now built for a hunter of the dark:
//  * chest: a fitted jerkin (quilted, scaled or wrapped), an asymmetric shoulder (layered leather lames, a black-iron plate,
//    spikes or nightglass shards) or a half-cape thrown over one shoulder, a harness of straps with throwing knives, a slung
//    hip belt with pouches, vials and sheathed knives, bracers with a hidden blade, and below the belt either torn front and
//    back flaps or long coat tails split for the tail (gkSkirt: they swing with the legs and lift behind when running);
//  * the sets keep their signature: an oxblood sash with trailing tails and trophies (Cutthroat), a vial bandolier and a
//    serpent coiled round the arm (Venomweave), a long scarf streaming behind and silver crescents (Duskdancer);
//  * masks over the muzzle (stitched, buckled, scaled, a respirator), goggles of nightglass, a bandana knotted over the crown,
//    and hoods (gkHood) that settle over the ears;
//  * footwraps: the shank and the arch wrapped and strapped, toes and claws left free for silent feet.
// palette: d.M leather, d.A accent, d.T trim metal; dark iron for blades and plates
var AS_IRON=0x3a3c42,AS_STEEL=0xb8bec8,AS_LEA=0x2a1e18;
var AS_ST={
  wraps:   {jer:'wrap',  lower:'flaps', flapL:.36, sh:'none',   harness:1, belts:1, bracer:'wrap', scarf:1},
  scale:   {jer:'scale', lower:'flaps', flapL:.33, sh:'scaleR', harness:1, belts:1, bracer:'lea',  fangs:1},
  garb:    {jer:'quilt', lower:'flaps', flapL:.28, sh:'capeL',  harness:2, belts:2, bracer:'blade',pad:'R'},
  shroud:  {jer:'quilt', lower:'coat',  coatL:.3,  sh:'shards', harness:1, belts:1, bracer:'blade',collar:1},
  raiment: {jer:'quilt', lower:'coat',  coatL:.24, sh:'layerL', harness:2, belts:2, bracer:'blade2',collar:1,glow:1},
  cutthroat:{jer:'quilt',lower:'flaps', flapL:.3,  sh:'capeR',  harness:3, belts:2, bracer:'blade',sash:1,trophy:1},
  venom:   {jer:'scale', lower:'flaps', flapL:.3,  sh:'fangL',  harness:'vials',belts:1,bracer:'lea',serpent:1},
  scarf:   {jer:'quilt', lower:'coat',  coatL:.32, sh:'none',   harness:1, belts:1, bracer:'blade',longScarf:1,moons:1}};
function asAng(m){return Math.atan2(m.x,m.z)}
mdChL=function(X){const {B,P,d,k}=X,st=AS_ST[d.st]?d.st:'wraps',S=AS_ST[st],M=d.M,A=d.A,T=d.T,G=d.G,lv=d.lv|0;
  const off=()=>(P.tOff||0),dk=mdSh(M,.6),lt=mdSh(M,1.25),acc=st=='cutthroat'?0x6a1218:st=='venom'?0x4a8a32:st=='scarf'?0x5a4a8a:A,glow=G||(st=='venom'?0x7ae040:null);
  const tw=y=>mdTorsoW(y),cf=y=>mdTorsoAt(P,y).f;
  // ---- the jerkin ----
  const jc=m=>{const a=asAng(m),fr=m.s>0&&Math.abs(m.c)<.06;if(fr&&m.y>.62)return dk;           // the front seam / lacing line
    if(S.jer=='quilt'){const q=(Math.floor(m.y*24+a*3)+Math.floor(m.y*24-a*3))%2;return q?M:mdSh(M,.9)}
    if(S.jer=='scale'){const q=(Math.round(m.y*40)+Math.round((a+4)*7))%2;return q?M:mdSh(M,.82)}
    return Math.floor(m.y*26+a*1.2)%2?M:mdSh(M,.8)};                                               // diagonal bandages
  mdTS(B,P,.5,.995,.01,{col:jc,lipT:.004});
  // the lacing up the front
  for(let i=0;i<6;i++){const y=.66+i*.05,z=cf(y)+off()+.004;[-1,1].forEach(s=>{k.L('chest','c',AS_LEA,[s*.018,y,z],[-s*.018,y+.026,z],.0025,.0025,3);mdOW(k,tw(y))})}
  // collar: a low leather collar, or a high one (Nightglass, Stormshade)
  if(S.collar)gkCollar(B,P,{y0:.94,h:th=>1.005+.06*Math.pow(Math.max(0,-Math.cos(th)*.5+.5),1.3),open:.5,flare:.025,clear:.01,col:m=>m.v>.7?(lv>=3?T:dk):M,lin:mdSh(M,.4)});
  else if(!S.scarf&&!S.longScarf)mdTS(B,P,.95,1.0,off()+.012,{col:dk,lipT:.004});
  // ---- arms ----
  [-1,1].forEach(s=>{const R=mdArm(P,s),a1=s<0?'aL1':'aR1';mdAS(B,P,s,0,3,.01,{col:m=>Math.round(m.y*40)%2?M:mdSh(M,.9)});
    if(S.bracer=='wrap'){mdAS(B,P,s,3,5,.012,{col:m=>Math.floor(m.y*44+m.c*1.5)%2?mdSh(M,.75):mdSh(M,.55)});mdLB(B,R,5.05,.006,.02,AS_LEA,{t:'c'})}
    else{mdAS(B,P,s,4,5,.012,{col:m=>m.s>.3?mdSh(AS_LEA,1.3):AS_LEA});mdLB(B,R,4.1,.005,.018,mdSh(AS_LEA,1.6),{t:'c'});mdLB(B,R,4.95,.005,.018,mdSh(AS_LEA,1.6),{t:'c'});
      // three straps with buckles across the bracer, a black-iron plate on top
      for(let i=0;i<3;i++){const r=mdRAt(R,4.2+i*.26);k.p(a1,'box','m',T,r.p[0]+s*(r.rx+.015),r.p[1],r.p[2]+.006,.004,.01,.009);mdOW(k,r.w)}
      const r=mdRAt(R,4.5);k.p(a1,'box','m',AS_IRON,r.p[0],r.p[1],r.p[2]+r.f+.016,.026,.075,.006);mdOW(k,r.w);if(lv>=2){k.p(a1,'oct','m',T,r.p[0],r.p[1]+.03,r.p[2]+r.f+.026,.008);mdOW(k,r.w)}
      // hidden blade along the outside of the forearm, point toward the elbow
      if(S.bracer=='blade2'||(S.bracer=='blade'&&s>0)){const r0=mdRAt(R,4.9),r1=mdRAt(R,3.6),x0=r0.p[0]+s*(r0.rx+.026),x1=r1.p[0]+s*(r1.rx+.03);
        k.L(a1,'m',AS_STEEL,[x0,r0.p[1],r0.p[2]-.004],[x1,r1.p[1]+.02,r1.p[2]-.01],.008,.001,4);mdOW(k,r0.w);k.p(a1,'box','m',AS_IRON,x0,r0.p[1]-.008,r0.p[2]-.004,.01,.02,.016);mdOW(k,r0.w);
        if(glow&&lv>=3){k.L(a1,'g',glow,[x0,r0.p[1]+.01,r0.p[2]-.004],[x1,r1.p[1]+.03,r1.p[2]-.01],.002,.001,3);mdOW(k,r0.w)}}}});
  // ---- below the belt: torn flaps or coat tails ----
  const H=mdTorsoAt(P,.6);
  if(S.lower=='flaps'){const L=S.flapL,hem=th=>{const c=Math.cos(th);return c>0?L+.06*(1-c):L-.02+.04*(1+c)};
    gkSkirt(B,P,{y0:.585,hem,flare:.035,clear:.02,folds:[7,.01],dag:[.045],flow:.45,lin:mdSh(M,.35),N:36,
      keep:m=>{const th=m.u*Math.PI*2,c=Math.cos(th);return c>.8||c<-.78},col:m=>m.v>.82?(st=='cutthroat'?acc:dk):Math.floor(m.v*5+m.u*30)%7==0?mdSh(M,.75):mdSh(M,.92)});
    // side tassets of hardened leather over the hips
    [-1,1].forEach(s=>{const R=mdLeg(P,s),rr=[mdRAt(R,.45),mdRAt(R,1.25)];mdLoft(B,rr,{seg:8,off:.03,t:'c',col:m=>m.i>.6?dk:mdSh(AS_LEA,1.4),keep:m=>m.s>-.1});
      const r=rr[0];k.p(s<0?'lh0':'rh0','oct','m',T,r.p[0]+s*(r.rx+.034),r.p[1]-.01,r.p[2],.008);mdOW(k,r.w)})}
  else{const L=S.coatL;
    gkSkirt(B,P,{y0:.6,hem:th=>L+.05*Math.max(0,Math.cos(th))-.03*Math.max(0,-Math.cos(th)),flare:.05,clear:.024,folds:[8,.012],dag:st=='shroud'?[.05]:[.025],flow:.6,backF:.3,
      open:.36,slit:.2,lin:mdSh(M,.32),N:40,col:m=>{const th=m.u*Math.PI*2,e=Math.min(Math.abs(th-.36),Math.abs(Math.PI*2-.36-th),Math.abs(Math.abs(th-Math.PI)-.2));
        if(e<.17)return mdSh(M,.55);if(m.v>.86)return dk;return M}})}
  // ---- belts ----
  const belt=(y,tilt,c,studs)=>{const pts=mdTLoop(B,P,y,tilt,Math.PI*.5,off()+.012,.034,c,{n:22});
    for(let i=0;i<studs;i++){const q=pts[Math.round(2+i*(18/studs))];k.p('pelvis','oct','m',T,q.p[0]+q.n[0]*.006,q.p[1],q.p[2]+q.n[2]*.006,.006);mdOW(k,q.w)}return pts};
  belt(.6,0,AS_LEA,lv>=1?8:0);mdBuckle(k,'spine',0,.6,cf(.6)+off()+.03,1,T,AS_LEA,tw(.6));
  if(S.belts>=2){const p2=belt(.55,.035,mdSh(AS_LEA,1.3),0);const q=p2[5];mdBuckle(k,'pelvis',q.p[0]+q.n[0]*.01,q.p[1],q.p[2]+q.n[2]*.01,.9,T,AS_LEA,q.w,Math.atan2(q.n[0],q.n[2]))}
  mdPouch(k,P,-1.1,.56,mdSh(AS_LEA,1.3),T,1);mdPouch(k,P,1.55,.56,mdSh(AS_LEA,1.1),T,.85);mdKnife(k,P,1.05,.56,AS_LEA,AS_STEEL,.3);if(lv>=2)mdKnife(k,P,-1.5,.56,AS_LEA,AS_STEEL,-.3);
  if(lv>=1){const p=mdTP(P,.57,-.75,off()+.035);gkVial(k,'pelvis',p[0],p[1],p[2],1,glow||0x8a2020,T,null);const p2=mdTP(P,.57,-.55,off()+.035);gkVial(k,'pelvis',p2[0],p2[1],p2[2],.85,glow||0x6a6a9a,T,null)}
  // ---- harness of straps with throwing knives ----
  const knifeOn=(q,c)=>{const a=Math.atan2(q.n[0],q.n[2]);k.p('chest','box','c',AS_LEA,q.p[0]+q.n[0]*.008,q.p[1],q.p[2]+q.n[2]*.008,.016,.03,.008,0,a,0);mdOW(k,q.w);
    k.p('chest','box','m',c||AS_STEEL,q.p[0]+q.n[0]*.012,q.p[1]+.03,q.p[2]+q.n[2]*.012,.008,.03,.003,0,a,0);mdOW(k,q.w);k.p('chest','cone4','m',c||AS_STEEL,q.p[0]+q.n[0]*.012,q.p[1]+.052,q.p[2]+q.n[2]*.012,.006,.014,.002,0,a+Math.PI/4,0);mdOW(k,q.w)};
  if(S.harness=='vials'){const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.034,AS_LEA);[1,2,3,4,5].forEach(i=>{const q=p1[i];gkVial(k,'chest',q.p[0]+q.n[0]*.018,q.p[1],q.p[2]+q.n[2]*.018,1.1,glow,T,q.w)})}
  else if(S.harness){const p1=mdTLoop(B,P,.78,.2,Math.PI/2,off()+.01,.032,AS_LEA);mdBuckle(k,'chest',...mdTP(P,.86,.6,off()+.02),.8,T,AS_LEA,tw(.86),.6);
    if(S.harness>=2){const p2=mdTLoop(B,P,.78,.2,-Math.PI/2,off()+.014,.032,AS_LEA);mdBuckle(k,'chest',...mdTP(P,.86,-.6,off()+.024),.8,T,AS_LEA,tw(.86),-.6);[17,18].forEach(i=>knifeOn(p2[i]))}
    (S.harness>=3?[1,2,3,4]:S.harness>=2?[2,3]:[2]).forEach(i=>knifeOn(p1[i]))}
  // ---- shoulders ----
  const lames=(s,n,c,cc)=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<n;i++){const x=sp[0]+s*(.012+i*.02),y=1.0-i*.04,rz=-s*(.3+i*.28),r=.1-i*.012;
      k.p(a,'box','c',i%2?mdSh(c,.85):c,x,y,0,r,.018,r*1.08,0,0,rz);k.p(a,'box','m',T,x+s*.002,y-.011,0,r*1.02,.005,r*1.1,0,0,rz);
      for(let j=0;j<3;j++){const q=mdRotZ(s*(-r*.4+j*r*.4),.011,rz);k.p(a,'oct','m',T,x+q[0],y+q[1],r*.6,.005)}}
    if(cc)k.p(a,'hem','m',cc,sp[0]+s*.01,1.012,0,.075,.03,.08,0,0,-s*.25)};
  if(S.sh=='scaleR'||S.sh=='fangL'){const s=S.sh=='scaleR'?1:-1,a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let r=0;r<3;r++)for(let i=0;i<7;i++){const t=(i-3)/3,x=sp[0]+s*(.01+r*.022+Math.abs(t)*.01),y=1.0-r*.035-Math.abs(t)*.02,z=t*.07;
      k.p(a,'oct','c',(r+i)%2?M:mdSh(M,1.2),x,y,z,.022,.006,.02,0,0,-s*(.4+r*.3))}
    if(S.sh=='fangL')for(let i=0;i<3;i++)k.p(a,'cone4','c',0xe8e0d0,sp[0]+s*(.06+i*.01),.95-i*.02,-.03+i*.03,.007,.04,.007,Math.PI,0,s*.3)}
  if(S.sh=='layerL'||S.pad=='R'){const s=S.sh=='layerL'?-1:1;lames(s,S.sh=='layerL'?4:3,mdSh(AS_LEA,1.4),S.sh=='layerL'?AS_IRON:null);
    if(S.sh=='layerL'){const a='aL0',sp=mdArm(P,-1)[1].p;for(let i=0;i<3;i++)gkSpike(k,a,[sp[0]-.03-i*.022,1.03-i*.018,-.03+i*.03],[-.45,1,0],.05-i*.008,.008,AS_IRON,'m');
      if(glow)k.p(a,'oct','g',glow,sp[0]-.02,1.035,.0,.012,.016,.012)}}
  if(S.sh=='shards'){const sp=mdArm(P,1)[1].p;lames(1,2,dk,null);for(let i=0;i<6;i++)k.p('aR0','cone4',glow?'g':'m',glow||mdMix(A,0x6a5aa0,.5),sp[0]+.02+i*.012,1.03+(i%3)*.012,-.05+i*.02,.012,.06+(i%2)*.035,.008,(i%2?.2:-.2),0,-.3-i*.15)}
  if(S.sh=='capeL'||S.sh=='capeR'){const s=S.sh=='capeL'?-1:1,cc=st=='cutthroat'?mdSh(acc,.62):mdSh(M,.75);
    // a half-cape thrown over one shoulder, falling down the back and the arm, tied across the chest
    gkCape(B,P,{yHem:.74,hemF:.04,dag:[.05],open:0,arm:.55,lin:mdSh(cc,.45),col:m=>m.v>.8?mdSh(cc,.7):cc,
      keep:m=>{const th=m.u*Math.PI*2,x=Math.sin(th)*s;return x>-.25&&!(Math.cos(th)>.35)}});
    k.L('chest','c',AS_LEA,mdTP(P,.97,s*.6,off()+.03),mdTP(P,.82,-s*.35,off()+.025),.006,.006,4);mdOW(k,tw(.9));k.p('chest','oct','m',T,...mdTP(P,.84,-s*.32,off()+.03),.012,.014,.008);mdOW(k,tw(.84))}
  // ---- scarves and sashes ----
  if(S.scarf||S.longScarf){const sc=S.longScarf?acc:mdSh(M,.7);mdTS(B,P,.93,1.055,off()+.026,{col:m=>Math.floor(m.y*60+asAng(m)*2)%2?sc:mdSh(sc,.8),lip:.012,lipT:.012});
    const n=S.longScarf?5:3;[[.07,.99,-.13],[-.05,.98,-.14]].forEach((s0,j)=>{const pts=[];for(let i=0;i<n;i++){const t=i/(n-1),y=s0[1]-t*(S.longScarf?.62:.28),bn=y>.8?[['chest',1-t*2],['cp0',t*2]]:y>.55?[['cp1',1]]:[['cp2',1]];
        pts.push({p:[s0[0]+t*.03*(j?-1:1),y,s0[2]-.03-t*.1-(S.longScarf?t*t*.12:0)],n:[0,0,-1],w:bn.filter(q=>q[1]>0)})}
      mdRib(B,pts,(S.longScarf?.055:.042)-j*.01,.004,j?mdSh(sc,.75):sc,{capB:true})})}
  if(S.sash){mdTS(B,P,.57,.63,off()+.02,{col:m=>Math.abs(m.y-.6)<.012?mdSh(acc,1.2):acc});
    [0,1].forEach(j=>{const p=mdTP(P,.6,-1.15,off()+.03);mdRib(B,[{p:[p[0],.6,p[2]],n:[-.9,0,.4],w:[['pelvis',1]]},{p:[p[0]-.01,.46,p[2]+.01],n:[-.9,0,.4],w:[['pelvis',.6],['lh0',.4]]},{p:[p[0]-.02+j*.03,.3,p[2]+j*.02],n:[-.9,0,.4],w:[['pelvis',.3],['lh0',.7]]}],.045,.004,j?mdSh(acc,.75):acc,{capB:true})});
    const p=mdTP(P,.6,-1.15,off()+.04);k.p('pelvis','sph','c',mdSh(acc,.85),p[0],.6,p[2],.03,.026,.024)}
  if(S.trophy){// a cord of teeth and finger bones round the neck
    for(let i=0;i<11;i++){const a=-.85+i*.17,y=.96-Math.cos(a*1.3)*.12,p=mdTP(P,Math.max(.8,y),a,off()+.02);if(i%2)k.p('chest','cone4','c',0xe8e0d0,p[0],p[1]-.012,p[2],.006,.026,.006,Math.PI);else k.p('chest','sph','c',0x3a2a1a,p[0],p[1],p[2],.006);mdOW(k,tw(p[1]))}}
  if(S.fangs){[-1,1].forEach(s=>{const p=mdTP(P,.94,s*.22,off()+.024);k.p('chest','cone4','c',0xe8e0d0,p[0],p[1]-.024,p[2],.008,.036,.008,Math.PI);mdOW(k,tw(.94))})}
  if(S.serpent){// a serpent coiled round the left upper arm, its head on the shoulder
    const R=mdArm(P,-1);for(let i=0;i<16;i++){const u=1.2+i*.12,r=mdRAt(R,u),a=i*1.1,x=r.p[0]+Math.sin(a)*(r.rx+.02),z=r.p[2]+Math.cos(a)*(r.f+.02);k.p('aL0','sph','c',i%2?acc:mdSh(acc,.6),x,r.p[1],z,.016-i*.0004,.013,.016);mdOW(k,r.w)}
    const sp=mdArm(P,-1)[1].p;k.p('aL0','oct','c',acc,sp[0]-.02,1.03,.05,.022,.016,.03,0,0,0);[-1,1].forEach(q=>k.p('aL0','box','g',glow||0xd0e040,sp[0]-.02+q*.01,1.04,.072,.004,.004,.004))}
  if(S.moons){const moon=(x,y,z,r,bn,w)=>{for(let i=0;i<5;i++){const a=-1.1+i*.55;k.p(bn,'box','m',AS_STEEL,x+Math.cos(a)*r,y+Math.sin(a)*r,z,.008,r*.7,.004,0,0,a);if(w)mdOW(k,w)}};
    moon(-.01,.82,cf(.82)+off()+.008,.03,'chest',tw(.82));moon(-.01,.6,cf(.6)+off()+.04,.022,'spine',tw(.6))}
  if(glow&&d.GB)[-1,1].forEach(s=>{const p=mdTP(P,.7,s*.4,off()+.02);k.p('spine','oct','g',glow,p[0],p[1],p[2],.012);mdOW(k,tw(.7))})};
// ---- the Assassin's class outfit (no chest piece): dark wraps of the trade ----
{const f=mdOutfit;mdOutfit=function(cls){const O=f.apply(this,arguments);if(cls!='assassin'||!O||O.as136)return O;
  return Object.assign({},O,{as136:1,extra:null,col:Object.assign({},O.col,{torso:0x2e2834,sleeve:0x2e2834}),
    base:(B,P)=>mdChest(B,P,{a:'light',sl:'chest',st:'wraps',ti:0,r:0,M:0x34303a,A:0x6a3a8a,G:null,dk:mdSh(0x34303a,.6),gem:0x8a5ac0})})}}
// ---- footwraps (toes and claws free) ----
function asBoots(B,P,d){mdDX(d);const M=d.M,A=d.A,G=d.G,st=d.st,T=d.T==null?MD_TRIM[d.ti|0]:d.T,lv=d.lv|0,k=dkKit();brToes(B,P);
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh',L=mdLeg(P,s),F=mdFoot(P,s);
    // the arch and heel wrapped, the toes left out
    mdLoft(B,F.slice(0,3),{seg:8,off:.008,ref:[0,1,0],capA:true,col:m=>m.y<.02?0x14100c:Math.floor(m.z*80+m.y*40)%2?M:mdSh(M,.75)});
    mdLS(B,P,s,st=='soft'?5:4,6,.01,{col:m=>Math.floor(m.y*44+m.c*1.4)%2?M:mdSh(M,.72)});
    // straps crossing the shank, a buckle, an iron shin guard and a knife in the right boot
    [4.3,4.8,5.4].forEach((u,i)=>{if(st=='soft'&&i<1)return;mdLB(B,L,u,.005,.02,AS_LEA,{t:'c'})});
    const q=mdRAt(L,4.8);k.p(l+'1','box','m',T,q.p[0]+s*(q.rx+.022),q.p[1],q.p[2]+.01,.004,.014,.012);mdOW(k,q.w);
    if(st!='soft'){mdLoft(B,[mdRAt(L,4.15),mdRAt(L,5.35)],{seg:8,off:.024,t:'m',col:st=='glass'||st=='storm'?mdSh(M,.9):AS_IRON,keep:m=>m.s>.4});
      if(st=='storm'||st=='glass'){const r=mdRAt(L,4.6);k.p(l+'1','oct',G?'g':'m',G||A,r.p[0],r.p[1],r.p[2]+r.f+.03,.01,.016,.006);mdOW(k,r.w)}}
    if(st=='wrapped'||lv>=3){mdLS(B,P,s,3,4,.012,{col:m=>Math.floor(m.y*44)%2?mdSh(M,.85):mdSh(M,.65)})}
    if(lv>=2&&s>0){const r=mdRAt(L,4.6);k.p(l+'1','box','m',AS_STEEL,r.p[0]+(r.rx+.026),r.p[1]+.03,r.p[2]-.01,.004,.06,.01);mdOW(k,r.w);k.p(l+'1','box','c',AS_LEA,r.p[0]+(r.rx+.026),r.p[1]-.01,r.p[2]-.01,.009,.03,.014);mdOW(k,r.w)}
    // a strap round the instep between the toes and the arch
    mdLoft(B,[mdRAt(F,1.75),mdRAt(F,2.05)],{seg:8,off:.014,ref:[0,1,0],col:AS_LEA,keep:m=>m.y>.012});
    if(st=='storm'||st=='glass'||lv>=4){const r=F[0];k.p(l+'2','cone4','m',AS_IRON,r.p[0],r.p[1]+.01,r.p[2]-.05,.01,.04,.01,-Math.PI/2+.3)}});
  mdKit(B,k)}
{const f=mdBoots;mdBoots=function(B,P,d){if(BR.on&&BR.R&&BR.R.key=='cat'&&d&&d.key&&d.a=='light')return asBoots(B,P,d);return f.apply(this,arguments)}}
