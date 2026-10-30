// ================= v177: dark-fantasy colour grade for heroes' gear =================
// Owner (Oct 30 2026): "keep them looking non-cartoony (this is a dark fantasy game)". The armour and weapon palettes had grown
// bright and toy-like (grass-green robes, royal and sky blue plate, cream tabards, white panels). Every colour a hero's gear is
// built with now goes through gl176Col while it is built:
//  * cloth / leather (c): less saturated, no near-white (whites become aged bone or linen), pulled a little towards soot and umber;
//    coarse weathering patches (a few percent lighter / darker per 6 cm cell) so big panels are not one flat colour.
//  * metal (m): steel loses most of its tint and gets darker; gold and bronze become antique (deeper, less yellow).
//  * glow (g) keeps its colour: runes, gems and rarity glows stay the bright accents.
// Higher tiers keep a little more of their colour (richer dyes, cleaner metal); tier I gear is the grimiest.
// What is graded: everything built inside a hero model or an armour picture (mdHeroB / mdItemKit) except the animal itself
// (head, paws, tail, toes, and in the body shell the fur colours), and every weapon / shield kit (v89WpnKit, uniques).
var GL176={on:0,body:0,ti:0,fur:null,cache:new Map(),
  // grade strength: 1 = the full grade; tests can set 0 to compare
  k:1};
function gl176Col(hex,t,ti,cx,cy,cz){if(t=='g'||!GL176.k)return hex;const key=hex*8+(t=='m'?4:0)+(ti|0);let o=GL176.cache.get(key);
  if(o==null){const C=new THREE.Color(hex),h={};C.getHSL(h);const tf=Math.max(0,Math.min(4,ti|0))/4;let s=h.s,l=h.l,gr=0;
    if(t=='m'){const warm=h.h>.04&&h.h<.17&&s>.3;
      if(warm){s*=.5+.12*tf;l=Math.min(l*.78,.46)}             // antique gold / bronze / copper
      else{s*=.22+.12*tf;l=Math.min(.05+l*.74,.52)}            // steel and iron: cold, dark, little tint
      gr=.1-.06*tf}
    else{s*=.42+.14*tf;if(s>.36)s=.36;l=.04+l*.8;if(l>.44)l=.44+(l-.44)*.35;gr=.16-.1*tf}
    C.setHSL(h.h,s,l);if(gr>0)C.lerp(GL176.grime||(GL176.grime=new THREE.Color(0x2e2620)),gr);o=C.getHex();GL176.cache.set(key,o)}
  if(t=='m'||cx==null)return o;
  // weathering: one value per coarse cell
  const q=((Math.floor(cx*16)*73856093)^(Math.floor(cy*16)*19349663)^(Math.floor(cz*16)*83492791))>>>0,f=1+(((q%1000)/1000)-.5)*.09;
  return mdSh(o,f)}
// the animal's own colours (fur, pads, nose, eyes) are never graded, wherever they are built
function gl176Fur(L){const S=new Set();try{if(BR.on&&BR.C)for(const k in BR.C){const v=BR.C[k];if(typeof v=='number')S.add(v)}if(L&&L.skin!=null)S.add(mdC(L.skin));if(L&&L.eye!=null)S.add(mdC(L.eye))}catch(e){}return S}
{const f=mdTri;mdTri=function(B,t,a,b,c,col){if(GL176.on>0&&!GL176.body&&!(GL176.fur&&GL176.fur.has(col)))col=gl176Col(col,t,GL176.ti,(a.x+b.x+c.x)/3,(a.y+b.y+c.y)/3,(a.z+b.z+c.z)/3);return f.call(this,B,t,a,b,c,col)}}
// builders that make the animal itself: nothing in them is graded
['mdHead','brPaws','brTail','brToes','brShoulders'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(){GL176.body++;try{return f.apply(this,arguments)}finally{GL176.body--}}});
// the tier of the piece being built (armour builders get their descriptor)
['mdHelm','mdChest','mdBoots'].forEach(n=>{const f=window[n];window[n]=function(B,P,d){const o=GL176.ti;GL176.ti=d&&d.ti!=null?d.ti|0:o;try{return f.apply(this,arguments)}finally{GL176.ti=o}}});
{const f=mdHeroB;mdHeroB=function(cls,L){const o={on:GL176.on,fur:GL176.fur,ti:GL176.ti};GL176.on++;GL176.ti=0;
  // the fur set is read inside the race wrapper (BR is set there): mdBody is the first builder, so take it there
  try{return f.apply(this,arguments)}finally{Object.assign(GL176,o)}}}
{const f=mdBody;mdBody=function(B,P){if(GL176.on)GL176.fur=gl176Fur(P&&P.look);return f.apply(this,arguments)}}
// late builds (hoods, motifs) keep the tier of the piece that queued them
{const f=gkLater;gkLater=function(B,fn){const ti=GL176.ti;return f.call(this,B,function(){const o=GL176.ti;GL176.ti=ti;try{return fn.apply(this,arguments)}finally{GL176.ti=o}})}}
{const f=mdItemKit;mdItemKit=function(k,it){const o={on:GL176.on,ti:GL176.ti,fur:GL176.fur};GL176.on++;try{GL176.ti=itT(it).t|0}catch(e){}try{return f.apply(this,arguments)}finally{Object.assign(GL176,o)}}}
// weapon and shield kits: grade the parts the outermost builder added
var GL176_KD=0;
function gl176Kit(k,n0,ti){for(let i=n0;i<k.P.length;i++){const p=k.P[i];if(p.gl176)continue;p.gl176=1;if(p.t=='g')continue;p.col=gl176Col(mdC(p.col),p.t=='m'?'m':'c',ti)}}
['v89WpnKit','unqWpnKit135'].forEach(n=>{const f=window[n];if(typeof f!='function')return;window[n]=function(k,it){const n0=k.P.length;GL176_KD++;try{return f.apply(this,arguments)}finally{GL176_KD--;if(!GL176_KD)try{gl176Kit(k,n0,itT(it).t|0)}catch(e){}}}});
// forged, not polished: hero metal is a little rougher (the copper and steel highlights read as plastic)
{const f=mdMats;mdMats=function(){const M=f.apply(this,arguments);if(M&&M.m&&!M.m.userData.v177){M.m.userData.v177=1;M.m.roughness=.6;M.m.metalness=.55}return M}}
