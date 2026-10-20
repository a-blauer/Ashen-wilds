// ================= v95 (ornate track): ornate worn armour =================
// The v94 armour (zzN_model_gear.js) was clean but plain. Every helm, chest piece and pair of boots is rebuilt here
// with layered pieces, raised trims, rivets, straps, buckles, embroidered borders and a motif per set, still in the
// low-poly v94 style (flat shading, one colour per face, ≤3 merged geometries per hero: cloth / metal / glow).
//  * Same construction as v94: shells of the body's own rings (mdTS torso, mdAS arm, mdLS leg, mdFS foot, skirts that
//    follow both thighs) with the body's bone weights, plus rigid dkKit parts on one bone (or blended ring weights,
//    mdOW), so everything bends with walk / attack / idle / riding and fits every hero look.
//  * New small toolkit: mdTP (a point on the torso surface), mdRAt / mdLB (a band round a limb), mdStrap (a flat strap
//    or sash following any path over the body), mdSk (skirt rings that follow the thighs, for faulds and hem trims),
//    mdEdge (a thin tube along a list of points: hood and mask edges).
//  * Tier: T1 plain but finished (seams, a trim), up to T5 lavish (gilded edges, gems, glow). Trim metal per tier
//    (MD_TRIM: bronze, iron, brass, silver, gold). Rarity: Rare+ a coloured trim (d.R), Epic+ glow inlays (d.G),
//    Legendary bright glow accents (d.GB). The 12 v78 sets get their own palette (MD_SETPAL) and motif.
//  * Class capes: when a chest piece is worn the cape becomes a short half-cape on the left shoulder (the armour's back
//    stays visible); the paladin tabard over armour is a lower tabard below the belt (the chest emblem stays visible).
//  * Icons follow automatically (mdItemKit runs these same builders).
var MD_TRIM=[0x9a7a48,0xa8aeb8,0xb8903e,0xccd0d8,0xe0b850];
// v78 sets: [material, accent, trim]
var MD_SETPAL={Bloodsworn:[0x4a4248,0x8a1420,0xa8803a],Ironwall:[0x5c6268,0x9a6a32,0xb88a44],Warlord:[0x2c2830,0xc89a3a,0xd8ac4a],
  Pathfinder:[0x3e5230,0x8a6a3a,0xb09a6a],Deadeye:[0x5a4026,0x8a2620,0xa88848],Windrunner:[0x3a5560,0xc8ccd0,0xc8ccd4],
  Cutthroat:[0x2e2a2c,0x6a1a1a,0x8a8e96],Venomweave:[0x2c2234,0x5a9a3a,0x6a7462],Duskdancer:[0x24223c,0x4a3a74,0xc0c4d0],
  'Hedge-Witch':[0x4a5236,0x7a5a36,0xc8bca0],Spellbinder:[0x4a1e2e,0x3ab0a0,0x6a6e78],Starweaver:[0x1e2a50,0xd8b050,0xd8b050]};
// descriptor extras: T trim metal, lv ornament level 0..4, R rarity trim (Rare+), GB legendary glow
function mdDX(d,acc){if(!d||d._x)return d;d._x=1;const sp=d.set&&MD_SETPAL[d.set],arm=d.sl=='helm'||d.sl=='chest'||d.sl=='boots';
  if(sp&&arm){d.M=sp[0];acc=sp[1];d.T=sp[2];d.dk=mdSh(d.M,.6)}
  // the accent keeps its own hue (only a hint of the rarity colour); the rarity shows as its own trim (R) and glow (G)
  if(acc!=null&&arm)d.A=d.r>=2?mdMix(acc,v89Rc(d.r),.12):acc;
  if(d.T==null)d.T=MD_TRIM[d.ti|0];if(d.lv==null)d.lv=d.set?Math.min(4,(d.ti|0)+1):(d.ti|0);
  if(d.R===undefined)d.R=d.r>=2?mdSh(v89Rc(d.r),.68):null;d.GB=d.r>=4;return d}
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);if(!d)return d;let acc=null;try{acc=v89Acc(itT(it))}catch(e){}return mdDX(d,acc)}}
// the ornate builders are used while a hero model or an item icon is built; foes and town folk keep the v94 pieces
var MD_ORN=0;
{const c=mdChest,h=mdHelm,b=mdBoots;mdChest=function(B,P,d,cls){return MD_ORN?mdChestO(B,P,d,cls):c.apply(this,arguments)};
  mdHelm=function(B,P,d){return MD_ORN?mdHelmO(B,P,d):h.apply(this,arguments)};mdBoots=function(B,P,d){return MD_ORN?mdBootsO(B,P,d):b.apply(this,arguments)}}
{const f=mdHeroB;mdHeroB=function(){MD_ORN++;try{return f.apply(this,arguments)}finally{MD_ORN--}}}
{const f=mdItemKit;mdItemKit=function(){MD_ORN++;try{return f.apply(this,arguments)}finally{MD_ORN--}}}

// =====================================================================================================
// toolkit
