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
