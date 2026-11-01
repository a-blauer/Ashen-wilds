// ================= v186: every companion grows grander with each evolution (owner, Nov 1 2026) =================
// Owner: "It also seems the evolution physical appearance upgrade was lost on many companions. Evolutions should be like
// foxlet- they become a cooler, more upgraded version of themself visually with each evolution."
// The Foxlet is the model: at each stage the creature itself grows (more tails, a fur crest, a harness and chest plate,
// flame tips, a gold circlet, a spirit-flame mane), so its outline gets bigger and grander, in its own theme.
// Two rounds of clutter cuts (EVO186 in 3430, the removals in 3431) left many companions with almost the same look at
// every stage. Here each species gets a clear step at every stage it can show (stage 0 = not evolved, 3 = the last):
// horns, crests, spines, tails and fins that grow longer and more numerous, armour or regalia shaped to the body, bone
// and crystal growths, glowing veins and eyes that burn brighter, and one crowning feature at the last stage.
// Still no dangling charms, nothing floating, no cuffs on the legs, no rune stickers, no candy colours.
// How: the evolution kit E gets a second kit E.raw without the EVO186 limits (its parts are baked with E's); a species
// design here draws with it and keeps its own restraint. Designs are written per stage, not per level: a species only ever
// shows four of the five levels (tier 1-2: 0 1 2 4, tier 3-4: 1 2 3 5, tier 5: 2 3 4 5; evo100Lv in 1710).
var EV38={on:true};
// the stage (0-3) a level shows for a species
function ev38St(L,sp){const t=typeof tierSp=='function'?tierSp(sp):1,V=t<=2?[0,1,2,4]:t<=4?[1,2,3,5]:[2,3,4,5];let s=0;V.forEach((v,i)=>{if(L>=v)s=i});return s}
{const f=evo100Kit;evo100Kit=function(n,L,P,seed){const E=f.apply(this,arguments);if(!EV38.on||typeof EVO186=='undefined')return E;
  const o=EVO186.on;EVO186.on=false;try{E.raw=f.call(this,n,L,P,(seed|0)+386)}finally{EVO186.on=o}return E}}
{const f=evo100Bake;evo100Bake=function(E){if(E&&E.raw&&E.raw.parts.length){E.raw.parts.forEach(q=>{if(q.j!=null)q.j=0;E.parts.push(q)});E.raw.parts.length=0}return f.apply(this,arguments)}}
// ---------------------------------------------------------------- shared tools (positions in the rig's model space) ----------------------------------------------------------------
var EV38T={
  // box of the body vertices whose main bone matches re: {mn,mx,c}
  box(E,re){const S=E.S,P=S.P,SI=S.SI,SW=S.SW,O=S.O,mn=[9,9,9],mx=[-9,-9,-9],c=[0,0,0];let n=0;
    for(let v=0;v<P.length/3;v++){let bi=0;for(let k=1;k<4;k++)if(SW[v*4+k]>SW[v*4+bi])bi=k;if(!re.test(O[SI[v*4+bi]]||''))continue;n++;
      for(let k=0;k<3;k++){const x=P[v*3+k];if(x<mn[k])mn[k]=x;if(x>mx[k])mx[k]=x;c[k]+=x}}
    return n?{mn,mx,c:c.map(x=>x/n),n}:null},
  // a spike / horn / fin from a root sunk into the body at hit h, along d, length ln, base radius r; tip in glow from tk (0-1)
  spike(R,h,d,ln,r,col,tipCol,tk,o,seg){const a=R.add(h.p,h.n,-r*.7),D=R.nrm(d),b=R.add(h.p,D,ln);o=Object.assign({at:a},o);
    if(tipCol!=null&&tk!=null&&tk<1){const m=R.add(h.p,D,ln*tk);R.L(a,m,r,r*(1-tk)+.002,'c',col,seg||4,o);R.L(m,b,r*(1-tk)+.002,.001,'g',tipCol,seg||4,o)}
    else R.L(a,b,r,.001,'c',col,seg||4,o);return b},
  // curved horn from a root sunk at hit h: dir, bend, length, radius, colour, glowing tip colour (last quarter)
  horn(R,h,dir,bend,len,r,col,tipCol,o){const base=R.add(h.p,h.n,-r*.8);return R.horn(base,dir,bend,len,r,'c',col,5,o,tipCol)},
  // points along the top line at x from z0 to z1 (n points)
  top(R,x,z0,z1,n){const out=[];for(let i=0;i<n;i++){const z=z0+(z1-z0)*(n>1?i/(n-1):0),h=R.top(typeof x=='function'?x(i):x,z);if(h)out.push(h)}return out},
  // flank hit at side s, height y, z
  side(R,s,y,z){return R.on([s*3,y,z],[-s,0,0])},
  // a glowing vein laid on the surface through flank points [[y,z],…] on side s
  vein(R,s,yz,r,col,lift){let pr=null;yz.forEach(q=>{const h=R.on([s*3,q[0],q[1]],[-s,0,0]);if(!h){pr=null;return}const p=R.add(h.p,h.n,lift==null?.003:lift);if(pr)R.L(pr,p,r,r,'g',col,3,{vs:1});pr=p})},
  // a vein over the top through [[x,z],…]
  veinT(R,xz,r,col,lift){let pr=null;xz.forEach(q=>{const h=R.top(q[0],q[1]);if(!h){pr=null;return}const p=R.add(h.p,h.n,lift==null?.003:lift);if(pr)R.L(pr,p,r,r,'g',col,3,{vs:1});pr=p})},
  // a fur tuft (tapered cone) from hit h
  tuft(R,h,dir,len,r,col,t){const d=R.nrm([h.n[0]+dir[0],h.n[1]+dir[1],h.n[2]+dir[2]]);return R.L(R.add(h.p,h.n,-r*.6),R.add(h.p,d,len),r,.002,t||'c',col,4)},
  mix(a,b,t){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex()},
  dim(a,k){return new THREE.Color(a).multiplyScalar(k).getHex()}};
