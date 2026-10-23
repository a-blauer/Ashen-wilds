// ================= v136: Warrior, Paladin and Ranger armour — hanging skirts and class details =================
// * Every skirt of a hero's armour or outfit (mail skirts, coats, tabards — the v94 mdSkirt) is hung as cloth with gkSkirt:
//   measured round the hips and legs, never narrowing downward, flaring, the back on the cape bones; colour and keep callbacks
//   get the same m.y / m.s (front +1) / m.c (side) they had.
// * Class details over the v95 armour:
//   Warrior (rat): battle-worn and brutal — chains slung across the chest with a trophy skull, leather war-straps and buckles
//     over the plate, scratches and dents, spikes on the shoulders, a narrow red war-banner from the belt, a skull belt buckle.
//   Paladin (badger): holy — purity seals (wax and parchment) on the breast and shoulders, gilded rims, a sun emblem, prayer
//     beads, a chained holy book at the hip, a long embroidered tabard that swings.
//   Ranger (weasel): a hunter — a fur collar, a necklace of teeth and claws, feathers and bone charms at the shoulder, a skinning
//     knife and pouches, a torn hunting skirt.
{const f=mdSkirt;mdSkirt=function(B,P,y0,y1,fl,off,o){if(!MD_ORN)return f.apply(this,arguments);o=o||{};const cf=o.col,kf=o.keep,m2=m=>{const th=m.u*Math.PI*2;m.s=Math.cos(th);m.c=Math.sin(th);return m};
  return gkSkirt(B,P,{y0,hem:y1,flare:fl*1.25+.01,clear:off+.004,rows:Math.max(6,(o.n||5)*2),t:o.t,flow:.35,folds:[9,.008],N:36,
    col:typeof cf=='function'?(m=>cf(m2(m))):cf,keep:kf?(m=>kf(m2(m))):null})}}
function hvScratch(k,P,n,seed,y0,y1){for(let i=0;i<n;i++){const r=((seed*31+i*67)%97)/97,y=y0+(y1-y0)*((i*37+seed*7)%23)/23,a=-1.1+r*2.2+(i%2?Math.PI:0),p=mdTP(P,y,a,(P.tOff||0)+.0015);
  k.p('chest','box','c',0x14100c,p[0],p[1],p[2],.003,.02+r*.02,.002,0,a,(r-.5)*1.6);mdOW(k,mdTorsoW(y))}}
{const f=mdChH;mdChH=function(X){const r=f.apply(this,arguments);try{hvExtra(X)}catch(e){console.warn('v136 heavy',e)}return r}}
{const f=mdChM;mdChM=function(X){const r=f.apply(this,arguments);try{mdExtra(X)}catch(e){console.warn('v136 medium',e)}return r}}
function hvCls(){return BR.on&&BR.R?BR.R.cls:null}
function hvExtra(X){const {B,P,d,k}=X,cls=hvCls(),M=d.M,T=d.T,G=d.G,lv=d.lv|0,st=d.st,off=()=>(P.tOff||0),cf=y=>mdTorsoAt(P,y).f+off(),tw=y=>mdTorsoW(y),plate=['cuirass','warplate','aegis','blood','wall','warlord'].includes(st);
  if(cls=='warrior'){const red=0x4a1010;
    // a narrow torn red war-banner hanging from the belt, front and back (v137: no longer a skirt round the hips)
    mdTabardO(X,red,mdSh(red,.6),{lo:.33,wd:.075,top:.6});
    // war-straps crossing the chest with buckles
    const p1=mdTLoop(B,P,.8,.18,Math.PI/2,off()+.01,.03,0x2a1e18,{n:22});[3,8].forEach(i=>{const q=p1[i];mdBuckle(k,'chest',q.p[0]+q.n[0]*.008,q.p[1],q.p[2]+q.n[2]*.008,.85,T,0x2a1e18,q.w,Math.atan2(q.n[0],q.n[2]))});
    // a chain slung from the left shoulder to the right hip, a trophy skull hanging from it (T3+)
    const pts=[];for(let i=0;i<=8;i++){const t=i/8,y=.96-t*.34,a=-.55+t*1.5;pts.push(mdTP(P,y,a,off()+.02))}gkChain(k,'chest',pts,.008,mdSh(T,.75),p=>tw(p[1]));
    if(lv>=2){const q=pts[4];gkSkull(k,'chest',q[0]+.01,q[1]-.05,q[2]+.02,.9,0xd8ccb0,Math.atan2(q[0],q[2]),tw(q[1]))}
    if(plate)hvScratch(k,P,10+lv*3,d.tp|0,.62,.95);
    // spikes on both shoulders (T2+), a skull belt buckle
    if(lv>=1)[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;for(let i=0;i<2+Math.min(2,lv>>1);i++)gkSpike(k,a,[sp[0]+s*(.04+i*.024),1.02-i*.012,-.04+i*.035],[s*.55,1,-.05],.05+lv*.008,.011,mdSh(T,.8),'m')});
    gkSkull(k,'spine',0,.6,cf(.6)+.032,.85,mdSh(T,1.05),0,tw(.6),'m');
    if(lv>=3&&st!='warlord'){mdFur(X,.92,1.0,0x3a2e24,12)}}
  else if(cls=='paladin'){const tab=mdSh(mdMix(0xc8bc98,d.A,.1),.82),gold=lv>=2?0xd8b050:T,cream=0xe0d4b4;
    // the long holy tabard (front and back panels) with an embroidered border and a sun
    // (v137: a narrow tabard, front and back, with a crimson cross — no longer a skirt round the hips)
    if(!['aegis','blood'].includes(st)){mdTabardO(X,tab,gold,{lo:.2,wd:.12,top:.6,band:.5});
      const q=mdTorsoAt(P,.6),zf=(q.z||0)+Math.max(.135,q.f)+((P.tOff||0)+.012)*1.15+.006,wf=mdSkW(P,.6);
      [[0,.44,.022,.14],[0,.47,.08,.022]].forEach(([x,y,w,h])=>{k.p('pelvis','box','c',0x7a1414,x,y,zf,w,h,.004);mdOW(k,wf(0,y))})}
    // purity seals: red wax with parchment strips, on the breast and both shoulders
    const seal=(bn,x,y,z,w,ry)=>{k.p(bn,'cyl','c',0x8a1414,x,y,z,.02,.008,.02,Math.PI/2,ry||0,0);if(w)mdOW(k,w);k.p(bn,'oct','c',0x6a0c0c,x,y,z+.005,.01,.01,.003,0,ry||0,0);if(w)mdOW(k,w);
      [-1,1].forEach(q=>{k.p(bn,'box','c',cream,x+q*.008,y-.05,z-.002,.008,.08,.002,0,ry||0,q*.12);if(w)mdOW(k,w)})};
    seal('chest',.09,.86,cf(.86)+.014,tw(.86));if(lv>=2)seal('chest',-.1,.72,cf(.72)+.012,tw(.72));
    [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',sp=mdArm(P,s)[1].p;seal(a,sp[0]+s*.05,.97,.07,null,s*.3)});
    // a sun on the breast (T3+), prayer beads, a holy book chained at the hip
    if(lv>=2){const z=cf(.8)+.02;k.p('chest','cyl',G?'g':'m',G||gold,0,.8,z,.026,.006,.026,Math.PI/2);mdOW(k,tw(.8));for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('chest','cone4','m',gold,Math.sin(a)*.04,.8+Math.cos(a)*.04,z,.008,.028,.003,0,0,-a);mdOW(k,tw(.8))}}
    for(let i=0;i<13;i++){const a=-.8+i/12*1.6,y=.95-Math.cos(a*1.7)*.16,p=mdTP(P,Math.max(.76,y),a,off()+.014);k.p('chest','sph','c',i==6?gold:0x3a2a1a,p[0],p[1],p[2],.008);mdOW(k,tw(p[1]))}
    const hp=mdTP(P,.58,1.25,off()+.03);gkChain(k,'pelvis',[[hp[0],.6,hp[2]],[hp[0]+.02,.5,hp[2]+.02]],.006,gold,null);gkBook(k,'pelvis',hp[0]+.02,.45,hp[2]+.03,1.3,0x5a1a14,gold,1.25,null);
    // gilded rims along the breastplate
    if(plate)mdTS(B,P,.6,.615,off()+.004,{t:'m',col:gold})}}
function mdExtra(X){const {B,P,d,k}=X,M=d.M,T=d.T,lv=d.lv|0,st=d.st,off=()=>(P.tOff||0),tw=y=>mdTorsoW(y),bone=0xe0d6bc;
  // a fur collar (T2+), a necklace of teeth and claws, feathers and bone charms on the left shoulder
  const hd=GKX.E&&GKX.E.helm?mdGD(GKX.E.helm):null;if(lv>=1&&!['longcoat','mantle'].includes(st)&&!(hd&&GK_HOOD[hd.st]))mdFur(X,.91,1.0,mdMix(M,0x5a4a3a,.5),12);
  for(let i=0;i<11;i++){const a=-.8+i*.16,y=.95-Math.cos(a*1.5)*.12,p=mdTP(P,Math.max(.8,y),a,off()+.022);
    if(i%3==1)k.p('chest','cone4','c',bone,p[0],p[1]-.016,p[2],.007,.03,.007,Math.PI);else if(i%3==2)k.p('chest','cone4','c',0x2a1e18,p[0],p[1]-.012,p[2],.005,.022,.005,Math.PI,0,.3);else k.p('chest','sph','c',0x6a4a2a,p[0],p[1],p[2],.006);mdOW(k,tw(p[1]))}
  const sp=mdArm(P,-1)[1].p;[[-.02,0x2a2a2a],[.01,0xc8c4b8],[.04,0x8a2a1a]].forEach(([dz,c],i)=>gkFeather(k,'aL0',[sp[0]-.05,.98,dz],[-.2,-1,.1*(i-1)],.11,.014,c,null));
  gkBone(k,'aL0',[sp[0]-.06,.97,-.03],[sp[0]-.07,.92,-.02],.004,bone,null);
  // a skinning knife on the right hip, a torn hunting skirt under the coat (short styles)
  mdKnife(k,P,.95,.56,0x2a1e18,0xb8bec8,.25);
  if(!['longcoat','mantle','tails'].includes(st))gkSkirt(B,P,{y0:.56,hem:.36,flare:.03,clear:Math.max(.02,(P.sOff||0)+.008),folds:[8,.01],dag:[.04],flow:.4,N:32,lin:mdSh(M,.4),
    keep:m=>{const c=Math.cos(m.u*Math.PI*2);return Math.abs(c)<.98},col:m=>m.v>.8?mdSh(M,.6):Math.floor(m.v*4+m.u*24)%4==0?mdSh(M,.82):mdSh(M,.92)})}
// ---- heavy helms: the Warrior's grow spikes and battle scars, the Paladin's a plume and a gilded brow cross ----
{const f=brHelm;brHelm=function(B,P,d){const r=f.apply(this,arguments);try{if(d&&d.a=='heavy'&&BR.R&&['warrior','paladin'].includes(BR.R.cls)){const D=BR.R,k=dkKit(),cz=D.crownZ==null?-.05:D.crownZ,q=brSkullAt(D,cz),top=q.top+.03,lv=d.lv|0,T=d.T==null?MD_TRIM[d.ti|0]:d.T;
    if(BR.R.cls=='warrior'){for(let i=0;i<3+Math.min(2,lv);i++){const z=cz-.05+i*.03;gkSpike(k,'head',[0,brSkullAt(D,z).top+.026,z],[0,1,-.25],.035+(i==1?.02:0)+lv*.004,.009,mdSh(d.M,.8),'m')}
      for(let i=0;i<4+lv;i++){const z=cz-.02+i*.022,s=i%2?1:-1,qq=brSkullAt(D,z);k.p('head','box','c',0x14100c,s*qq.rx*.6,qq.top+.024,z,.003,.004,.022,0,s*.4,0)}}
    else{const pl=lv>=2?0xe8e0d0:0x8a1414,gold=lv>=2?0xd8b050:T;for(let i=0;i<7;i++){const z=cz-.07+i*.02;k.p('head','cone4','c',i%2?pl:mdSh(pl,.85),0,top+.03+Math.sin(i/6*Math.PI)*.03,z-.02,.012,.09,.03,-.9+i*.12,0,0)}
      const fz=D.SN[D.SN.length-1][0]-.06,fq=brSkullAt(D,fz>cz+.06?cz+.07:fz);k.p('head','box','m',gold,0,fq.top+.03,cz+.075,.008,.05,.006,-.5);k.p('head','box','m',gold,0,fq.top+.04,cz+.07,.03,.008,.006,-.5)}
    mdKit(B,k)}}catch(e){console.warn('v136 helm',e)}return r}}
// ---- boots: spiked knee cops (Warrior), gilded knee plates with a cross (Paladin), fur cuffs and a feather (Ranger) ----
{const f=mdBoots;mdBoots=function(B,P,d){const r=f.apply(this,arguments);try{if(BR.on&&BR.R&&d&&d.key&&(d.a=='heavy'||d.a=='medium')){const cls=BR.R.cls,k=dkKit(),lv=d.lv|0,T=d.T==null?MD_TRIM[d.ti|0]:d.T;
    [-1,1].forEach(s=>{const l=s<0?'lh':'rh',L=mdLeg(P,s),q=mdRAt(L,3),w=q.w;
      if(cls=='warrior'){k.p(l+'1','hem','m',mdSh(d.M,1.1),q.p[0],q.p[1],q.p[2]+q.f+.02,.05,.04,.03,Math.PI/2);mdOW(k,w);gkSpike(k,l+'1',[q.p[0],q.p[1],q.p[2]+q.f+.045],[0,.25,1],.035+lv*.006,.01,mdSh(T,.8),'m',w);
        const a=mdRAt(L,4.6);mdLB(B,L,4.6,.006,.04,0x2a1e18,{t:'c'});k.p(l+'1','box','m',T,a.p[0]+s*(a.rx+.04),a.p[1],a.p[2],.004,.014,.012);mdOW(k,a.w)}
      else if(cls=='paladin'){const g=lv>=2?0xd8b050:T;k.p(l+'1','hem','m',g,q.p[0],q.p[1],q.p[2]+q.f+.018,.048,.036,.028,Math.PI/2);mdOW(k,w);
        k.p(l+'1','box','m',mdSh(g,.7),q.p[0],q.p[1],q.p[2]+q.f+.05,.006,.03,.004);mdOW(k,w);k.p(l+'1','box','m',mdSh(g,.7),q.p[0],q.p[1]+.004,q.p[2]+q.f+.05,.02,.006,.004);mdOW(k,w)}
      else if(cls=='ranger'){const top=mdRAt(L,3.7);mdLoft(B,[top,mdRAt(L,3.95)],{seg:9,off:.04,col:m=>Math.floor(m.x*120+m.z*90)%2?mdMix(d.M,0x5a4a3a,.6):mdMix(d.M,0x3a2e24,.6),keep:m=>true});
        if(s<0)gkFeather(k,l+'1',[top.p[0]-.04,top.p[1],top.p[2]],[-.2,-1,-.2],.09,.012,0x2a2a2a,top.w)}});
    mdKit(B,k)}}catch(e){console.warn('v136 boots',e)}return r}}
