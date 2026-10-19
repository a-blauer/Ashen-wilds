// ================= v94 (model track): worn equipment built against the body =================
// Every helm, chest piece, pair of boots, amulet and ring is built from the body's own ring profile (mdTorso, mdArm,
// mdLeg, mdFoot, mdHeadR) pushed out by a small offset, with the body's bone weights, so it sits on the body and bends
// with it in every pose (walk, attacks, idle fidgets, riding). Rigid pieces (pauldrons, horns, buckles, pendants) ride
// the bone they belong to.
//  * Shape: by armour type and tier, and the v78 sets have their own shape (MD_STY). Colour: tier material (V89_ARM),
//    accent per tier or per set (v89Acc), trims pulled toward the rarity colour from Rare, glowing trims/gems from Epic.
//  * The v89 item icons and the gear lying on the ground are rendered from these same builders (v89ArmorKit is replaced
//    below), so the icon shows exactly what the hero wears.
// shape per template: [arm][slot] by tier, and per v78 set (first word of the name)
function mdSty(){return mdSty.c||(mdSty.c={
  heavy:{helm:['nasal','horned','great','visage','winged'],chest:['mail','hauberk','cuirass','warplate','aegis'],boots:['hobnail','sabaton','greave','stomper','tread']},
  medium:{helm:['hood','pelt','cowl','skullhood','galemask'],chest:['padded','brigandine','vest','longcoat','mantle'],boots:['trail','pelt','stalker','strider','gale']},
  light:{helm:['wrap','viper','ashcowl','glassmask','stormhood'],chest:['wraps','scale','garb','shroud','raiment'],boots:['soft','wrapped','ashstep','glass','storm']},
  cloth:{helm:['linen','hat','circlet','diadem','crown'],chest:['robe','moss','pyre','vestments','regalia'],boots:['sandal','slipper','pyre','lich','tempest']},
  set:{Bloodsworn:['barbute','blood','blood'],Ironwall:['bucket','wall','wall'],Warlord:['crowned','warlord','warlord'],Pathfinder:['feather','path','trail'],Deadeye:['deadeye','bandolier','stalker'],
    Windrunner:['wind','tails','gale'],Cutthroat:['bandana','cutthroat','wrapped'],Venomweave:['venom','venom','glass'],Duskdancer:['dusk','scarf','storm'],
    'Hedge-Witch':['witch','witch','slipper'],Spellbinder:['tallcowl','binder','pyre'],Starweaver:['star','star','tempest']}})}
// descriptor of a worn item
function mdGD(it){if(!it||it.tp==null||!ITPL[it.tp])return null;const t=itT(it);if(!t)return null;const sl=t.sl,a=t.arm||'heavy',ti=t.t|0,r=Math.max(0,Math.min(4,it.r|0)),S=mdSty();
  const set=t.nw&&sl!='weapon'?String(t.n).split(' ')[0]:null,si={helm:0,chest:1,boots:2}[sl];
  let st=S[a]&&S[a][sl]?S[a][sl][ti]:null;if(set&&S.set[set]&&si!=null)st=S.set[set][si];
  const acc=v89Acc(t),base0=(V89_ARM[a]||V89_TM)[ti],M=t.nw?mdMix(base0,acc,.22):base0,A=r>=2?mdMix(acc,v89Rc(r),.3):acc,G=r>=3?v89Rc(r):null;
  return {sl,a,ti,r,set,st,M,A,G,gem:v89Gem(t,r),dk:mdSh(M,.6),n:t.n,tp:it.tp,key:it.tp+'.'+r}}
// ---------------- shell helpers ----------------
function mdTRing(P,y){const q=mdTorsoAt(P,y);return {p:[0,y,q.z],rx:q.rx,f:q.f,b:q.b,w:mdTorsoW(y),y}}
// torso shell between heights y0..y1 (o.lip: flare the lower edge)
function mdTS(B,P,y0,y1,off,o){o=o||{};const T=P._T||(P._T=mdTorso(P)),R=[mdTRing(P,y0)];T.forEach(r=>{if(r.y>y0+.006&&r.y<y1-.006)R.push(r)});R.push(mdTRing(P,y1));
  if(o.lip){const r=Object.assign({},R[0]);r.rx+=o.lip;r.f+=o.lip;r.b+=o.lip;r.p=[0,R[0].p[1]-.012,r.p[2]];R.unshift(r)}
  if(o.lipT){const q=R[R.length-1],r=Object.assign({},q);r.rx+=o.lipT;r.f+=o.lipT;r.b+=o.lipT;r.p=[0,q.p[1]+.006,q.p[2]];R.push(r)}
  P.tOff=Math.max(P.tOff||0,off);mdLoft(B,R,Object.assign({seg:12,off,sq:P.sq||0},o))}
function mdAS(B,P,s,i0,i1,off,o){mdLoft(B,mdArm(P,s).slice(i0,i1+1),Object.assign({seg:7,off},o))}
function mdLS(B,P,s,i0,i1,off,o){mdLoft(B,mdLeg(P,s).slice(i0,i1+1),Object.assign({seg:8,off},o))}
function mdFS(B,P,s,off,o){mdLoft(B,mdFoot(P,s),Object.assign({seg:7,off,ref:[0,1,0],capA:true,capB:true},o))}
// skirt / coat / robe from y0 down to y1 that follows the legs (weights: pelvis + each thigh by side)
function mdSkirt(B,P,y0,y1,fl,off,o){o=o||{};const q=mdTorsoAt(P,y0),n=o.n||5,R=[],w0=Math.max(q.rx,.205),f0=Math.max(q.f,.128),b0=Math.max(q.b,.13);
  for(let i=0;i<n;i++){const t=i/(n-1),y=y0+(y1-y0)*t,e=Math.min(1,t*2.2);R.push({p:[0,y,(q.z||0)+(o.dz||0)*t],rx:q.rx+(w0-q.rx)*e+fl*t,f:q.f+(f0-q.f)*e+fl*.75*t,b:q.b+(b0-q.b)*e+fl*.8*t,w:[['pelvis',1]],t})}
  const wf=(x,y,z)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-.32)))*.9,l=Math.max(0,Math.min(1,.5-x/.16));return d<=0?[['pelvis',1]]:[['pelvis',1-d],['lh0',d*l],['rh0',d*(1-l)]]};
  P.sOff=Math.max(P.sOff||0,off);mdLoft(B,R,Object.assign({seg:14,off,wf},o))}
// cape on the cape bones, outside whatever the torso wears
function mdCape(B,P,col,o){o=o||{};const off=(P.tOff||0)+.016,len=o.len||.36,w=o.w||1,ins=mdSh(col,.58),tr=o.trim;
  const at=(y,bn,rx)=>{const q=mdTorsoAt(P,Math.min(.97,y));return {p:[0,y,-(Math.max(q.b,.12)+off+(.97-Math.min(.97,y))*.08)],rx:rx*w,f:.012,b:.012,w:bn}};
  const R=[at(.99,[['chest',.7],['cp0',.3]],.15),at(.86,[['cp0',1]],.19),at(.7,[['cp0',.5],['cp1',.5]],.205),at(.54,[['cp1',.5],['cp2',.5]],.215),at(len,[['cp2',1]],.22)];
  R[0].p[2]+=.012;mdLoft(B,R,{seg:6,capA:true,capB:true,col:m=>tr!=null&&m.i>R.length-1.45?tr:m.s>.3?ins:col})}
function mdKP(){return dkKit()}
// rarity glow strip (Epic+) or accent strip
function mdGlowOr(d,c){return d.G!=null?d.G:c}

// =====================================================================================================
// chest
// =====================================================================================================
function mdChestPre(P,d){P.col.torso=d.M;P.col.sleeve=d.M;P.hasChest=1;if(d.a=='cloth'){P.col.pants=mdSh(d.M,.7)}}
function mdChest(B,P,d,cls){const st=d.st,M=d.M,A=d.A,dk=d.dk,G=d.G,k=mdKP(),gl=mdGlowOr(d,A),lt=0x3a2618,ti=d.ti;
  const mail=(o0)=>{const mc=mdMix(M,0x6a6c70,.3),md=mdSh(mc,.78);mdTS(B,P,.43,.99,.012,{col:m=>(Math.round(m.y*48)%2?mc:md),lip:.012});[-1,1].forEach(s=>mdAS(B,P,s,0,o0||3,.01,{col:m=>(Math.round(m.y*48)%2?mc:md)}));
    mdSkirt(B,P,.5,.36,.03,.014,{col:m=>m.y<.385?dk:(Math.round(m.y*48)%2?mc:md),n:4})};
  const belt=(y,c,bc)=>{mdTS(B,P,y-.022,y+.022,(P.tOff||0)+.008,{col:c||lt});k.p('spine','box','m',bc||A,0,y,mdTorsoAt(P,y).f+(P.tOff||0)+.012,.05,.04,.014)};
  const plate=(lv)=>{const pc=M,ps=mdSh(M,1.18);mdTS(B,P,.6,.985,.03,{t:'m',col:m=>m.s>.55&&m.y>.68&&m.y<.95&&lv>1?ps:m.y<.64?dk:pc,lip:.012,lipT:.006});
    if(G)mdTS(B,P,.6,.62,.034,{t:'g',col:G})};
  const pauld=(n,sz,spk,sq)=>[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',x=s*(P.bones[a][1]*1+s*.012*(mdBuildF(P)-1)*3),W=mdBuildF(P);
    for(let i=0;i<n;i++){const r=(.1+sz*.022-i*.014)*(1+(W-1)*.5);k.p(a,sq?'box':'hem','m',i?M:mdSh(M,1.15),x+s*(.02+i*.012),.985-i*.04,0,r,sq?.035:r*.75,r*1.05,0,0,s*(.3+i*.22))}
    if(G)k.p(a,'oct','g',G,x+s*(.07+sz*.012),1.02+sz*.008,.0,.016,.022,.016,0,0,s*.3);
    for(let i=0;i<spk;i++)k.L(a,'m',mdSh(A,1.1),[x+s*(.05+i*.03),1.02-i*.02,-.02+i*.04],[x+s*(.1+i*.03),1.13-i*.03,-.03+i*.04],.022,.003,5)});
  const tasset=(c)=>[-1,1].forEach(s=>mdLS(B,P,s,0,2,.024,{t:'m',col:m=>m.y<.43?mdSh(c,.8):c,keep:m=>m.s>-.3&&m.y>.4}));
  const vamb=(c)=>[-1,1].forEach(s=>mdAS(B,P,s,4,5,.016,{t:'m',col:c}));
  const gorget=(c)=>mdTS(B,P,.96,1.03,.034,{t:'m',col:c});
  const tabard=(c,tr,sym)=>{const z=m=>Math.abs(m.c)<.36;mdTS(B,P,.62,.97,(P.tOff||0)+.008,{col:m=>Math.abs(m.c)>.3?tr:c,keep:m=>z(m)&&(m.s>0||m.s<0)});
    mdSkirt(B,P,.62,.34,.02,(P.tOff||0)+.012,{col:m=>m.y<.36?tr:Math.abs(m.c)>.28?tr:c,keep:m=>Math.abs(m.c)<.34,n:4});
    if(sym){const f=mdTorsoAt(P,.82).f+(P.tOff||0)+.016;k.p('chest','box','c',sym,0,.82,f,.022,.12,.006).p('chest','box','c',sym,0,.85,f,.08,.022,.006)}};
  const fur=(c)=>{mdTS(B,P,.9,1.0,(P.tOff||0)+.03,{col:m=>Math.round(m.c*6+m.s*3)%2?c:mdSh(c,.82),lip:.03,lipT:.02})};
  const vest=(c,lo)=>{mdTS(B,P,lo||.55,.985,(P.tOff||0)+.014,{col:m=>m.s>.75&&m.y<.95?mdSh(c,.7):c,lip:.006})};
  const sleeves=(c,to,off)=>[-1,1].forEach(s=>mdAS(B,P,s,0,to,off||.008,{col:c}));
  const shirt=(c,lo)=>{mdTS(B,P,lo||.5,.99,.008,{col:c});};
  const coat=(c,y1,fl,split)=>mdSkirt(B,P,.56,y1,fl,(P.tOff||0)+.012,{col:m=>m.y<y1+.03?mdSh(c,.75):c,keep:split?(m=>!(m.s>.86)):null,n:5});
  if(d.a=='heavy'){
    if(st=='mail'){mail(3);belt(.6,lt,A)}
    else if(st=='hauberk'){mail(3);pauld(1,0,0);belt(.6,lt,A);mdTS(B,P,.66,.96,.02,{col:lt,keep:m=>Math.abs(m.c+m.s*.6)<.16})}
    else if(st=='cuirass'){mail(3);plate(1);pauld(2,1,0);tasset(mdSh(M,.9))}
    else if(st=='warplate'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,ti>=3?1:0);tasset(M);vamb(M);gorget(mdSh(M,1.1))}
    else if(st=='aegis'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,3,0);tasset(M);vamb(M);gorget(A);[-1,1].forEach(s=>{const a=s<0?'aL0':'aR0';k.p(a,'box','m',A,s*.29,1.04,-.02,.012,.12,.1,-.2,0,-s*.5)});
      if(!P.noTabard)tabard(mdSh(A,.75),mdMix(A,0xe8e0c8,.4))}
    else if(st=='blood'){mail(3);plate(1);pauld(2,1,2);tabard(0x6a0c14,0x2a0608);vamb(mdSh(M,.9))}
    else if(st=='wall'){shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,0,1);tasset(M);vamb(M);gorget(M);
      const f=mdTorsoAt(P,.8).f+.034;for(let i=0;i<4;i++)k.p('chest','sph','m',A,(i%2?.07:-.07),.72+(i>>1)*.16,f-.01,.012)}
    else{/*warlord*/shirt(mdSh(M,.5));sleeves(dk,3);plate(2);pauld(3,2,2);tasset(M);vamb(M);fur(0x5a4636);const f=mdTorsoAt(P,.84).f+.04;k.p('chest','oct','m',0xd8ccb0,0,.84,f,.035,.04,.02)}}
  else if(d.a=='medium'){
    if(st=='padded'){mdTS(B,P,.48,.99,.012,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.85),lip:.01});sleeves(mdSh(M,.9),3,.01);belt(.6,lt,A)}
    else if(st=='brigandine'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);const f=y=>mdTorsoAt(P,y).f+(P.tOff||0)+.004;for(let r=0;r<3;r++)for(let c=0;c<3;c++)k.p('chest','sph','m',A,-.06+c*.06,.72+r*.08,f(.72+r*.08),.011);belt(.6,lt,A)}
    else if(st=='vest'){shirt(mdSh(M,.65));sleeves(mdSh(M,.65),3);vest(M,.5);mdAS(B,P,-1,0,2,.024,{col:mdSh(M,1.15)});belt(.6,lt,A);k.p('pelvis','box','c',mdSh(lt,1.2),.15,.52,.08,.05,.07,.04,0,.5,0)}
    else if(st=='longcoat'){shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.3,.06,true);belt(.6,lt,A);k.p('aL0','hem','c',0xd8ccb0,-.25,.985,0,.1,.07,.105,0,0,-.4)}
    else if(st=='mantle'){shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.36,.04,true);mdTS(B,P,.86,.99,(P.tOff||0)+.024,{col:m=>Math.round(m.c*7)%2?A:mdSh(A,.8),lip:.05});belt(.6,lt,A)}
    else if(st=='path'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);belt(.6,lt,A);mdTS(B,P,.95,1.0,(P.tOff||0)+.02,{col:A,lipT:.01});k.p('pelvis','box','c',lt,-.16,.5,.06,.06,.08,.05,0,-.5,0)}
    else if(st=='bandolier'){shirt(mdSh(M,.7));sleeves(mdSh(M,.7),3);vest(M);belt(.6,lt,A);mdTS(B,P,.62,.98,(P.tOff||0)+.008,{col:lt,keep:m=>Math.abs(m.c-m.s*.55)<.14||Math.abs(m.c+m.s*.55)<.14});
      for(let i=0;i<4;i++){const y=.7+i*.06;k.p('chest','box','m',A,-.08+i*.05,y,mdTorsoAt(P,y).f+(P.tOff||0)+.006,.014,.03,.008,0,0,.6)}}
    else{/*tails*/shirt(mdSh(M,.6));sleeves(M,5,.012);vest(M,.56);coat(M,.22,.08,true);belt(.6,lt,A)}}
  else if(d.a=='light'){
    if(st=='wraps'){mdTS(B,P,.5,.99,.01,{col:m=>Math.round(m.y*26+m.c*2)%2?M:mdSh(M,.8)});[-1,1].forEach(s=>mdAS(B,P,s,3,5,.01,{col:m=>Math.round(m.y*30)%2?M:mdSh(M,.75)}))}
    else if(st=='scale'){mdTS(B,P,.5,.99,.012,{col:m=>(Math.round(m.y*36)+Math.round((m.c+1)*5))%2?M:mdSh(M,.78)});sleeves(mdSh(M,.6),2);belt(.6,A,A)}
    else if(st=='garb'){shirt(M);sleeves(M,5);mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:mdSh(M,.6),keep:m=>Math.abs(m.c-m.s*.5)<.12||Math.abs(m.c+m.s*.5)<.12});belt(.6,A,mdSh(A,1.2));
      mdSkirt(B,P,.6,.42,.02,(P.tOff||0)+.012,{col:mdSh(M,.75),keep:m=>Math.abs(m.c)<.5,n:3})}
    else if(st=='shroud'){shirt(M);sleeves(M,5);belt(.6,mdSh(M,.6),A);coat(mdSh(M,.85),.3,.05,true);mdTS(B,P,.93,1.03,(P.tOff||0)+.02,{col:mdSh(M,.7),lipT:.02});k.p('aR0','hem','m',A,.25,.985,0,.1,.07,.1,0,0,.4)}
    else if(st=='raiment'){shirt(M);sleeves(M,5);belt(.6,A,A);coat(mdSh(M,.85),.26,.07,true);mdTS(B,P,.94,1.06,(P.tOff||0)+.03,{col:m=>m.s<0?mdSh(M,.6):A,lipT:.04,keep:m=>m.s<.55})}
    else if(st=='cutthroat'){shirt(M);sleeves(M,5);vest(mdSh(M,.75));belt(.6,lt,A);for(let i=0;i<4;i++){const y=.66+i*.07;k.p('chest','box','m',0xb8bec8,.09-i*.04,y,mdTorsoAt(P,y).f+(P.tOff||0)+.006,.012,.05,.006,0,0,-.6)}}
    else if(st=='venom'){shirt(M);sleeves(M,5);belt(.6,lt,A);for(let i=0;i<3;i++)k.p('pelvis','cyl','g',G||0x6ae05a,-.12+i*.06,.55,mdTorsoAt(P,.55).f+.02,.014,.04,.014);mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:A,keep:m=>Math.abs(m.c-m.s*.5)<.1})}
    else{/*scarf*/shirt(M);sleeves(M,5);belt(.6,A,A);mdTS(B,P,.92,1.04,(P.tOff||0)+.03,{col:A,lip:.01,lipT:.01});mdLoft(B,[{p:[.08,.98,-.14],rx:.04,f:.01,b:.01,w:[['chest',1]]},{p:[.1,.7,-.17],rx:.05,f:.01,b:.01,w:[['chest',.4],['cp1',.6]]},{p:[.12,.5,-.2],rx:.045,f:.01,b:.01,w:[['cp2',1]]}],{seg:4,capA:true,capB:true,col:A})}}
  else{ // cloth: robes
    const rb=M,rd=mdSh(M,.78),tr=mdGlowOr(d,A),long=st=='regalia'||st=='vestments'||st=='star'?.06:st=='robe'||st=='witch'?.1:.08;
    shirt(rb,.5);[-1,1].forEach(s=>{mdAS(B,P,s,0,3,.01,{col:rb});mdLoft(B,mdArm(P,s).slice(3,6).map((r,i)=>Object.assign({},r,{rx:r.rx+i*.018,f:r.f+i*.02,b:r.b+i*.018})),{seg:8,off:.012,col:m=>m.i>1.5?tr:rd})});
    mdSkirt(B,P,.6,long,.09,.016,{col:m=>m.y<long+.03?tr:(st=='witch'&&(Math.round(m.c*4+m.y*9)%3==0))?mdMix(rb,0x6a5a3a,.3):rb,n:6});
    belt(.6,st=='pyre'?0x5a1a10:mdSh(A,.6),A);
    if(st=='robe'||st=='witch')mdTS(B,P,.88,1.0,(P.tOff||0)+.02,{col:st=='witch'?0x4a3a2a:rd,lip:.04});
    if(st=='moss')mdTS(B,P,.84,1.0,(P.tOff||0)+.024,{col:m=>Math.round(m.c*6)%2?mdSh(rb,1.15):rd,lip:.06});
    if(st=='pyre'||st=='binder'){mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:tr,keep:m=>Math.abs(m.c)<.1});mdTS(B,P,.95,1.06,(P.tOff||0)+.03,{col:rd,lipT:.035,keep:m=>m.s<.6})}
    if(st=='binder')[-1,1].forEach(s=>k.p('pelvis','box','c',s<0?0x6a3a1a:0xd8ccb0,s*.17,.52,.06,.05,.07,.025,0,s*.6,0));
    if(st=='vestments'||st=='regalia'||st=='star'){mdTS(B,P,.92,1.08,(P.tOff||0)+.034,{col:m=>m.s>0?tr:rd,lipT:.05,keep:m=>m.s<.5});[-1,1].forEach(s=>k.p(s<0?'aL0':'aR0','hem','c',st=='regalia'?A:rd,s*.25,.985,0,.11,.07,.115,0,0,s*.4));
      mdTS(B,P,.66,.98,(P.tOff||0)+.008,{col:tr,keep:m=>Math.abs(m.c)<.12})}
    if(ti>=2||d.set){const f=mdTorsoAt(P,.84).f+(P.tOff||0)+.012;k.p('chest','oct',G?'g':'m',G||d.gem,0,.84,f,.022,.028,.012)}}
  if(G&&d.a!='cloth'){const f=mdTorsoAt(P,.86).f+(P.tOff||0)+.012;k.p('chest','oct','g',G,0,.86,f,.02,.026,.01)}
  mdKit(B,k)}

// =====================================================================================================
// helm (returns how much hair stays: 'none' | 'hang' | 'all')
// =====================================================================================================
function mdHelmHair(d){const s=d.st;if(['circlet','diadem','crown','hat','witch','star','wrap','bandana','galemask','glassmask','venom','viper','feather'].includes(s))return s=='star'?'none':'all';
  if(['nasal','horned','great','visage','winged','barbute','bucket','crowned'].includes(s))return 'hang';return 'none'}
function mdHelm(B,P,d){const H=P._H||(P._H=mdHeadR(P)),M=d.M,A=d.A,G=d.G,dk=d.dk,k=mdKP(),st=d.st,hz=y=>mdHeadZ(P,y),slit=G||0x0a0806,top=H[H.length-1].y;
  const dome=(y0,off,col,t)=>mdLoft(B,H.filter(r=>r.y>=y0),{seg:10,off,t:t||'m',capB:true,col:col||M});
  const full=(off,col,face,sq)=>mdLoft(B,H,{seg:10,off,t:'m',capB:true,capA:false,sq:sq||0,col:m=>face&&face(m)||col||M});
  const rim=(y,off,col,t)=>{const R=H.filter(r=>Math.abs(r.y-y)<.045);if(R.length>=2)mdLoft(B,[R[0],R[R.length-1]],{seg:10,off,t:t||'m',col})};
  const hood=(off,col,open,o)=>{o=o||{};const fy=o.fy||1.21;mdLoft(B,H,{seg:10,off,t:'c',capB:true,col:m=>m.y<1.04?mdSh(col,.85):col,keep:m=>!(m.s>(open||.3)&&m.y<fy&&m.y>1.0)});
    // drape over the neck and shoulders
    mdLoft(B,[{p:[0,1.04,-.005],rx:.1+off,f:.08,b:.1+off,w:[['neck',.5],['head',.5]]},{p:[0,.995,-.01],rx:.15+off,f:.11,b:.13+off,w:[['chest',.5],['neck',.5]]},{p:[0,.95,-.01],rx:.2+off,f:.14,b:.15+off,w:[['chest',1]]}],
      {seg:12,t:'c',col:o.drape||mdSh(col,.9),keep:m=>!(m.s>.7&&m.y>1.0)});
    if(o.tip!==false)k.L('head','c',col,[0,top-.03,-.09],[0,top-.07,-.2],.04,.008,5)};
  const face=(c,y0,y1,s0)=>mdLoft(B,H,{seg:10,off:.012,t:'c',col:c,keep:m=>m.s>(s0==null?-.25:s0)&&m.y>y0&&m.y<y1});
  const horns=(c,sz,up)=>[-1,1].forEach(s=>{const x=mdHeadX(P,1.2)+.01,a=[s*x,1.2,0],b=[s*(x+.07*sz),1.24+.02*sz,-.02],c2=[s*(x+.1*sz),1.3+.06*sz*(up||1),-.03];k.L('head','c',c,a,b,.032*sz,.022*sz,6).L('head','c',mdSh(c,.8),b,c2,.022*sz,.003,6)});
  const crest=(c,n,h)=>{for(let i=0;i<n;i++){const a=-.6+i*(1.6/(n-1)),y=1.17+Math.cos(a)*.12,z=Math.sin(a)*.12;k.p('head','box','m',c,0,y+h*.3,z-.01,.014,h*(1-Math.abs(a+.2)*.3),.05,a)}};
  const visor=m=>m.s>.6&&Math.abs(m.y-1.145)<.014?slit:null;
  const pts=(c,n,h,y,t)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=mdHeadX(P,y)+.016,big=i==0;k.p('head','cone4',t||'m',c,Math.sin(a)*r,y+.03*(big?1.5:1)*h,Math.cos(a)*r*1.05,.018,(.06*(big?1.5:1))*h,.018)}};
  const gemF=(c,y,sz)=>k.p('head','oct',G?'g':'m',G||c,0,y,hz(y)+.016,.02*(sz||1),.026*(sz||1),.012);
  if(d.a=='heavy'){
    if(st=='nasal'){dome(1.13,.022);rim(1.15,.026,A);k.p('head','box','m',A,0,1.12,hz(1.12)+.022,.022,.08,.014)}
    else if(st=='horned'){dome(1.13,.022);rim(1.15,.026,A);k.p('head','box','m',A,0,1.12,hz(1.12)+.022,.022,.08,.014);horns(0xd8ccb0,1)}
    else if(st=='great'){full(.024,M,visor);rim(1.2,.028,A)}
    else if(st=='visage'){full(.024,M,m=>m.s>.5&&m.y>1.12&&m.y<1.16&&Math.abs(m.c)>.06?slit:m.s>.75&&m.y<1.1?mdSh(M,.75):null);crest(A,6,.06)}
    else if(st=='winged'){full(.024,M,visor);rim(1.2,.028,A);crest(A,5,.05);[-1,1].forEach(s=>{const x=mdHeadX(P,1.17)+.03;for(let j=0;j<3;j++)k.p('head','box','m',j%2?M:A,s*(x+j*.012),1.19+j*.04,-.04-j*.02,.012,.1-j*.018,.06,-.35,0,-s*(.5+j*.25))})}
    else if(st=='barbute'){full(.024,M,m=>(m.s>.55&&Math.abs(m.y-1.145)<.016)||(Math.abs(m.c)<.12&&m.s>.6&&m.y<1.15&&m.y>1.05)?slit:null);horns(0x8a1a1a,.8);k.L('head','c',0x8a1a1a,[0,top+.02,-.02],[0,top+.02,-.16],.03,.01,5)}
    else if(st=='bucket'){full(.026,M,m=>m.s>.6&&Math.abs(m.y-1.15)<.012?slit:m.s>.7&&m.y<1.12&&Math.round(m.y*90)%3==0?0x141210:null,.55);rim(1.2,.03,A);rim(1.07,.03,A)}
    else{/*crowned*/full(.024,M,visor);rim(1.2,.03,A);pts(A,8,1.2,1.21);horns(0x2a2420,1.1,1.4)}}
  else if(d.a=='medium'){
    if(st=='hood')hood(.03,M,.3);
    else if(st=='pelt'){hood(.034,M,.3,{tip:false});[-1,1].forEach(s=>k.p('head','cone4','c',mdSh(M,1.1),s*.07,top+.02,-.01,.035,.08,.025,0,0,-s*.25));k.p('head','box','c',mdSh(M,.85),0,top-.01,.07,.07,.04,.08,.3);
      [-1,1].forEach(s=>k.p('head','cone4','c',0xe8e0d0,s*.025,top-.035,.115,.008,.03,.008,Math.PI))}
    else if(st=='cowl'){hood(.03,M,.3);face(A,1.04,1.125,.15)}
    else if(st=='skullhood'){hood(.034,M,.3,{tip:false});k.p('head','sph','c',0xd8ccb0,0,top-.02,.04,.09,.06,.09);[-1,1].forEach(s=>{k.p('head','box','c',0x14100c,s*.03,top-.03,.12,.02,.014,.01);k.L('head','c',0xd8ccb0,[s*.07,top,0],[s*.13,top+.05,-.05],.018,.004,5)})}
    else if(st=='galemask'||st=='wind'){face(mdSh(A,.9),1.125,1.17,.2);[-1,1].forEach(s=>{const x=mdHeadX(P,1.16)+.012;for(let j=0;j<4;j++)k.p('head','cone4','c',j%2?A:0xe8e8f0,s*(x+j*.008),1.16+j*.025,-.02-j*.025,.012,.1-j*.012,.03,-.5-j*.2,0,-s*(.9+j*.15))});if(st=='wind')hood(.032,M,.3,{tip:false})}
    else if(st=='feather'){dome(1.16,.02,M,'c');rim(1.165,.024,mdSh(M,.75),'c');k.L('head','c',A,[.06,1.21,-.02],[.13,1.33,-.1],.012,.002,4)}
    else{/*deadeye*/hood(.03,M,.3);face(mdSh(M,.6),1.04,1.125,.15);k.p('head','box','c',0x14100c,.04,1.145,hz(1.145)+.012,.034,.03,.008);k.p('head','ring','m',A,.04,1.145,hz(1.145)+.014,.02,.15,.02,Math.PI/2)}}
  else if(d.a=='light'){
    if(st=='wrap'){face(M,1.04,1.13,.05);rim(1.19,.016,mdSh(M,.8),'c')}
    else if(st=='viper'){face(M,1.04,1.13,.05);for(let i=0;i<5;i++){const a=-.4+i*.3;k.p('head','cone4','c',A,0,1.17+Math.cos(a)*.115,Math.sin(a)*.115,.016,.05,.02,a)}}
    else if(st=='ashcowl'){hood(.022,M,.32,{tip:false,fy:1.2});face(mdSh(M,.8),1.04,1.13,.1)}
    else if(st=='glassmask'){face(mdSh(M,.55),1.04,1.2,.1);[-1,1].forEach(s=>k.p('head','box',G?'g':'m',G||A,s*.04,1.145,hz(1.145)+.016,.026,.014,.006));rim(1.19,.016,M,'c')}
    else if(st=='stormhood'){hood(.026,M,.32);face(mdSh(M,.6),1.04,1.13,.1);rim(1.2,.034,G||A,G?'g':'m')}
    else if(st=='bandana'){face(M,1.04,1.13,.05);dome(1.18,.016,mdSh(M,.75),'c');k.L('head','c',mdSh(M,.75),[0,1.18,-.11],[.03,1.1,-.18],.02,.01,4)}
    else if(st=='venom'){face(mdSh(M,.7),1.04,1.13,.05);[-1,1].forEach(s=>k.p('head','box',G?'g':'c',G||A,s*.04,1.145,hz(1.145)+.006,.03,.006,.006))}
    else{/*dusk*/hood(.024,M,.32,{tip:false});face(A,1.04,1.13,.05);k.L('head','c',A,[0,1.14,-.13],[.05,.95,-.2],.03,.012,4)}}
  else{ // cloth
    if(st=='linen')hood(.036,M,.25);
    else if(st=='hat'||st=='witch'){const br=st=='witch'?.26:.22,c=st=='witch'?mdSh(M,.6):M;k.p('head','cyl','c',mdSh(c,.85),0,1.235,0,br,.018,br);rim(1.235,.022,A,'c');
      k.L('head','c',c,[0,1.24,0],[.02,1.42,-.04],.11,.06,8).L('head','c',mdSh(c,.92),[.02,1.42,-.04],[.08,1.53,-.12],.06,.025,7).L('head','c',mdSh(c,.82),[.08,1.53,-.12],[.15,1.56,-.18],.025,.004,6);
      k.p('head','cyl','c',A,0,1.26,0,.115,.03,.115);if(G)k.p('head','oct','g',G,0,1.27,.115,.016)}
    else if(st=='circlet'){rim(1.19,.016,A);gemF(d.gem,1.19)}
    else if(st=='diadem'){rim(1.19,.016,A);for(let i=0;i<5;i++){const a=(i-2)*.32,x=Math.sin(a)*(mdHeadX(P,1.19)+.016),z=Math.cos(a)*(hz(1.19)+.016);k.p('head','cone4','m',A,x,1.22+(i==2?.025:0),z,.014,.05+(i==2?.04:0),.01,.0,0,-a*.3)}gemF(d.gem,1.205,1.2)}
    else if(st=='crown'){rim(1.2,.02,A);rim(1.22,.022,A);pts(A,9,1,1.235);gemF(d.gem,1.21,1.3);[-1,1].forEach(s=>k.p('head','oct','m',d.gem,s*.08,1.21,hz(1.21)-.03,.012))}
    else if(st=='tallcowl'){hood(.034,M,.28,{tip:false});k.L('head','c',M,[0,top-.01,-.03],[0,top+.16,-.1],.07,.004,7);rim(1.2,.04,A,'c')}
    else{/*star*/hood(.034,M,.28);rim(1.2,.04,G||A,G?'g':'m');for(let i=0;i<5;i++){const a=(i-2)*.38;k.p('head','oct',G?'g':'m',G||A,Math.sin(a)*.14,1.22,Math.cos(a)*.15,.012)}}}
  mdKit(B,k)}

// =====================================================================================================
// boots
// =====================================================================================================
function mdBootsPre(P,d){P.col.boot=d.M;P.col.shin=d.M}
function mdBoots(B,P,d){const M=d.M,A=d.A,G=d.G,dk=d.dk,st=d.st,k=mdKP(),a=d.a;
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh';
    if(a=='heavy'){const off=.022;mdFS(B,P,s,off,{t:'m',col:m=>m.y<.03?dk:M});mdLS(B,P,s,st=='hobnail'?4:3,6,off,{t:'m',col:m=>m.y>.27?A:M});
      if(st!='hobnail'){const K=P.bones[l+'1'];k.p(l+'1','sph','m',A,K[1],K[2],K[3]+.062,.044,.05,.036);if(st=='stomper'||st=='tread'||st=='wall'||st=='warlord')k.p(l+'1','cone4','m',A,K[1],K[2],K[3]+.105,.016,.05,.016,Math.PI/2)}
      if(st=='tread'||st=='blood'||st=='warlord')k.L(l+'1','m',mdSh(A,1.1),[s*.15,.2,0],[s*.2,.26,-.02],.016,.002,4);
      if(G)mdLS(B,P,s,5,6,off+.006,{t:'g',col:G,keep:m=>m.y>.13})}
    else if(a=='medium'){const off=.016;mdFS(B,P,s,off,{col:m=>m.y<.03?0x1e1610:M});mdLS(B,P,s,st=='trail'?5:4,6,off,{col:M});
      const L=mdLeg(P,s),cuff=Object.assign({},L[st=='trail'?5:4]);cuff.rx+=.012;cuff.f+=.012;cuff.b+=.012;mdLoft(B,[cuff,Object.assign({},cuff,{p:[cuff.p[0],cuff.p[1]+.03,cuff.p[2]]})],{seg:8,off,col:st=='pelt'||st=='path'?0xd8ccb0:mdSh(M,1.15)});
      if(st=='stalker'||st=='strider'||st=='gale')mdLS(B,P,s,4,6,off+.004,{col:A,keep:m=>m.s>.5&&Math.round(m.y*45)%2==0});
      if(G)k.p(l+'1','oct','g',G,P.bones[l+'1'][1],.2,.09,.012)}
    else if(a=='light'){const off=.012;mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='soft'?6:4,6,off,{col:m=>Math.round(m.y*40)%2?M:mdSh(M,.75)});
      if(st=='storm'||st=='glass')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.14});if(st=='wrapped')mdLS(B,P,s,3,4,off,{col:mdSh(M,.8)})}
    else{const off=.01;
      if(st=='sandal'){mdFS(B,P,s,.004,{col:P.col.skin});mdLoft(B,mdFoot(P,s).slice(0,4),{seg:7,off:.008,ref:[0,1,0],col:m=>m.y<.03?0x3a2618:M,keep:m=>m.y<.03||Math.round(m.i*2)%2==0});mdLS(B,P,s,5,6,.008,{col:M,keep:m=>Math.round(m.y*50)%2==0})}
      else{mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='slipper'?6:5,6,off,{col:M});if(st=='tempest'||st=='lich')k.p(l+'2','cone4','c',A,P.bones[l+'2'][1],.05,.19,.022,.06,.018,Math.PI/2-.4);
        if(st!='slipper')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.13})}}});
  mdKit(B,k)}

// =====================================================================================================
// amulet (on the chest, outside whatever the torso wears) and ring (a small glint on the right hand)
// =====================================================================================================
function mdAmulet(B,P,d){const k=mdKP(),ti=d.ti,gold=ti==0?0x7a6a4a:ti>=3?0xd8b050:0xa88848,off=(P.tOff||0)+.008,y=.87,f=mdTorsoAt(P,y).f+off+.008,sh=d.set?mdHash(d.n)%5:ti,gem=d.gem;
  // chain: a ring round the neck base lying on the shoulders
  const top=mdTorsoAt(P,.975);k.p('chest','ring','m',gold,0,.965,(top.z||0)+.005,top.rx*.62+off,.22,(top.f+top.b)/2*.95+off,-.18);
  k.L('chest','m',gold,[-.05,.95,f-.02],[0,y+.02,f],.005,.005,3).L('chest','m',gold,[.05,.95,f-.02],[0,y+.02,f],.005,.005,3);
  if(sh==0){k.p('chest','cone4','c',0xe8e0c8,0,y-.015,f,.014,.05,.01,Math.PI)}
  else if(sh==1){k.p('chest','oct','m',gold,0,y,f,.03,.036,.012);k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,f+.006,.02,.026,.01)}
  else if(sh==2){k.p('chest','cyl','m',gold,0,y,f,.028,.012,.028,Math.PI/2);k.p('chest','sph',d.G?'g':'m',d.G||gem,0,y,f+.008,.012)}
  else if(sh==3){k.p('chest','sph','m',gold,0,y,f,.026,.032,.012);k.p('chest','sph','g',d.G||gem,0,y,f+.01,.012,.014,.006)}
  else{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.p('chest','cone4','m',gold,Math.sin(a)*.02,y+Math.cos(a)*.02,f,.008,.03,.006,0,0,-a)}k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,f+.006,.014)}
  mdKit(B,k)}
function mdRingW(B,P,d){const k=mdKP(),A2=P.bones.aR2,band=[0xb06a3a,0xc8ccd4,0xd8a040,0x3a3a46,0x7ab0d8][d.ti],hand=mdArm(P,1)[7],x=hand.p[0]-.012,y=hand.p[1]+.002,z=hand.p[2]+hand.f*.55;
  k.p('aR2','ring','m',band,x,y,z,.024,.16,.022,0,0,Math.PI/2);k.p('aR2','oct',d.G?'g':'m',d.G||d.gem,x+.004,y,z+.016,.012,.014,.01);mdKit(B,k)}

// =====================================================================================================
// icons and ground loot: the same builders, without the body, as rigid parts (one part per colour)
// =====================================================================================================
// a mannequin-less build of one item in body space → dkKit parts on k (positions centred later by the icon camera)
function mdItemKit(k,it){const d=mdGD(it);if(!d)return false;const P=mdP({look:mdLookN(null,'warrior')}),B=mdB(HB);P._T=mdTorso(P);P._H=mdHeadR(P);
  if(d.sl=='chest'){mdChestPre(P,d);mdChest(B,P,d)}else if(d.sl=='helm')mdHelm(B,P,d);else if(d.sl=='boots')mdBoots(B,P,d);else if(d.sl=='amulet')mdAmulet(B,P,d);else return false; // rings keep the v89 close-up model (the worn ring is a tiny band + gem on the hand)
  const oy=d.sl=='helm'?-1.15:d.sl=='chest'?-.8:d.sl=='amulet'?-.9:d.sl=='ring'?-.58:0,ox=d.sl=='ring'?-.25:0;
  for(const t in B.L){const L=B.L[t];if(!L.p.length)continue;const by=new Map();
    for(let i=0;i<L.p.length;i+=9){const ci=i;const key=Math.round(L.c[ci]*255)<<16|Math.round(L.c[ci+1]*255)<<8|Math.round(L.c[ci+2]*255);let a=by.get(key);if(!a){a=[];by.set(key,a)}
      for(let j=0;j<9;j+=3)a.push(L.p[i+j]+ox,L.p[i+j+1]+oy,L.p[i+j+2])}
    by.forEach((a,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.computeVertexNormals();
      // the boots are both feet: keep one for the picture
      k.p('',g,t=='m'?'m':t=='g'?'g':'c',col,0,0,0,1,1,1)})}
  if(d.sl=='boots'){k.P=k.P.map(p=>{const g=p.geo,pa=g.attributes.position,a=[];for(let i=0;i<pa.count;i+=3){const x=(pa.getX(i)+pa.getX(i+1)+pa.getX(i+2))/3;if(x>0)for(let j=0;j<3;j++)a.push(pa.getX(i+j)-.1,pa.getY(i+j),pa.getZ(i+j))}
    if(!a.length)return null;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(a,3));ng.computeVertexNormals();return Object.assign({},p,{geo:ng})}).filter(Boolean)}
  return true}
{const f=v89ArmorKit;v89ArmorKit=function(k,it){try{if(mdItemKit(k,it))return}catch(e){console.warn('item model',e)}return f.apply(this,arguments)}}
