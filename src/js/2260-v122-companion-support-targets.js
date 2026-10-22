// ---------- v122 companion support spells pick their target ----------
// Heal, shield and buff spells (CSP k 'heal' / 'shield' / 'buff') used to land only on the hero. Now the casting companion
// looks at the hero and every companion on the field (itself included) and casts on whoever needs it most:
//   heal   → the ally with the lowest health share, once someone is below 70% (the hero gets a small tie-break bonus)
//   shield → the ally under the most pressure (enemies attacking it, recently hurt, low health) without a strong shield already
//   buff   → attack buffs go to an ally that is fighting (hero first), defence buffs to the ally under the most pressure;
//            an ally that already has this buff is skipped
// supPick122 (called from compSpells, 0870) returns the target's model (pl or a follower); compCast (0130) hands a companion
// target to compSup122, and the v105 effect recipes (1930) draw at x.hp, the target's position.
// Companion shields and buffs live in SUP122 (a Map keyed by the companion object), so they are never saved with the companion.
var SUP122=new Map(),SUP122H={hp:0,hitT:0},HT122=null,ABS122=0;
function sup122(c){let o=SUP122.get(c);if(!o){o={sh:0,shT:0,bf:[],hp:c.h,hitT:0};SUP122.set(c,o)}return o}
// total of one buff stat on a companion right now (e.g. 'paP', 'as', 'dr')
function sup122Bf(c,k){const o=SUP122.get(c);if(!o||!o.bf.length)return 0;const now=performance.now();let v=0;for(const b of o.bf)if(b.t>now&&b.s[k])v+=b.s[k];return v}
function sup122Shield(c){const o=SUP122.get(c);return o&&o.sh>0&&o.shT>performance.now()?o.sh:0}
// everyone a support spell could land on: the hero, then each companion on the field near the caster
function sup122Allies(f0){
  const L=[];if(!(typeof AWD!='undefined'&&AWD.dead))L.push({m:pl,c:null,fr:hero.hp/Math.max(1,heroMax())});
  fols.forEach((f,i)=>{const c=party[i];if(!f||!c||c.h<=0||c.emp||!f.visible)return;if(f0&&d2(f.position,f0.position)>14)return;
    L.push({m:f,c,fr:c.h/Math.max(1,M(c))})});
  return L}
// how much an ally is being pressed: enemies winding up on it, enemies next to it, damage taken in the last 3s
function sup122Threat(a){
  const P=a.m.position,now=performance.now();let s=0;
  enemies.forEach(e=>{if(e.dead||!e.agg||!e.m)return;if(e.atk&&e.atk.tg===a.m)s+=1;else if(d2(e.m.position,P)<3.5)s+=.35});
  const ht=a.c?(SUP122.get(a.c)||{}).hitT||0:SUP122H.hitT;if(now-ht<3000)s+=.8;
  return s}
function sup122Fight(){return enemies.some(e=>e.agg&&!e.dead&&e.m&&d2(e.m.position,pl.position)<10)}
function sup122HasBuff(a,sp){const now=performance.now();
  if(!a.c)return (hero.buffs||[]).some(b=>b&&b.s===sp.buff&&b.t>now);
  const o=SUP122.get(a.c);return !!(o&&o.bf.some(b=>b.s===sp.buff&&b.t>now))}
var SUP122_OFF={paP:1,maP:1,as:1,crit:1,cdm:1,mspd:1};
function supPick122(c,f,sp){
  const A=sup122Allies(f);if(!A.length)return null;
  let best=null,bs=-1e9;const take=(a,s)=>{if(s>bs){bs=s;best=a}};
  if(sp.k=='heal'){
    A.forEach(a=>{if(a.fr<.7)take(a,(1-a.fr)+(a.c?0:.05))});
    return best&&best.m}
  if(!sup122Fight())return null;
  if(sp.k=='shield'){
    const now=performance.now();
    A.forEach(a=>{const mx=a.c?M(a.c):heroMax(),val=mx*(sp.v||.15),cur=a.c?sup122Shield(a.c):(hero.shT>now?hero.sh||0:0);
      if(cur>=val*.5)return;take(a,sup122Threat(a)+(1-a.fr)*1.5+(a.c?0:.1))});
    return best&&best.m}
  if(sp.k=='buff'){
    const off=Object.keys(sp.buff||{}).some(k=>SUP122_OFF[k]);
    A.forEach(a=>{if(sup122HasBuff(a,sp))return;
      if(off){const P=a.m.position,eng=enemies.some(e=>e.agg&&!e.dead&&e.m&&d2(e.m.position,P)<4.5);if(!eng&&a.c)return;
        take(a,(eng?1:0)+(a.c?0:.5)+sup122Threat(a)*.2)}
      else take(a,sup122Threat(a)+(1-a.fr)+(a.c?0:.1))});
    return best&&best.m}
  return null}
// the spell lands on a companion (returns false when that companion can no longer take it: compCast then falls back to the hero)
function compSup122(c,sp,ally){
  const i=fols.indexOf(ally),tc=i>=0?party[i]:null;if(!tc||tc.h<=0||tc.emp)return false;
  const P=ally.position,col=sp.col,mx=M(tc),now=performance.now(),o=sup122(tc);
  if(sp.k=='heal'){const h=Math.max(1,Math.round(Math.min(mx-tc.h,mx*sp.v)));tc.h=Math.min(mx,tc.h+mx*sp.v);o.hp=tc.h;
    dn(P,'+'+h,'#7dffa0',-10);ring(P,col,2.4,600)}
  else if(sp.k=='shield'){const v=mx*sp.v*(1+(HS().shieldP||0));o.sh=Math.max(sup122Shield(tc),v);o.shT=now+(sp.dur||8)*1000;
    ring(P,col,2.2,600);burst(gY(P,1),col,24,1.4,2,.6);dn(P,'🛡 '+Math.round(v),'#c8d8ff',-10);
    if(sp.nova)enemies.forEach(e=>{if(!e.dead&&e.m&&d2(e.m.position,P)<2.8)compHit(c,e,sp.nova)})}
  else if(sp.k=='buff'){o.bf=o.bf.filter(b=>b.t>now&&b.s!==sp.buff);o.bf.push({s:sp.buff,t:now+(sp.dur||8)*1000,i:sp.i});
    ring(P,col,2.6,600);dn(P,sp.i||'✦','#ffe8a0',-10)}
  return true}
// companion stats: attack / defence buffs (paP maP pdP mdP) raise the matching stat while they last
{const f=cStat;cStat=function(c,k){const v=f.apply(this,arguments);if(!SUP122.size||!c||c.st)return v;const b=sup122Bf(c,k+'P');return b?v*(1+b):v}}
// damage to a companion: its damage-reduction buff, then its shield soaks the hit
{const f=hitTarget;hitTarget=function(e,tg){const i=fols.indexOf(tg),me=i>=0?party[i]:null,h0=me?me.h:0;HT122=me?tg:null;ABS122=0;
  try{return f.apply(this,arguments)}finally{HT122=null;if(me&&ABS122){me.h=h0;ABS122=0}}}}
{const f=dmgCE;dmgCE=function(a,b){let d=f.apply(this,arguments);if(!HT122||!b||!SUP122.has(b))return d;
  const i=fols.indexOf(HT122);if(i<0||party[i]!==b)return d;const o=SUP122.get(b),dr=sup122Bf(b,'dr');
  if(dr)d=Math.max(1,Math.round(d*(1-Math.min(.75,dr))));
  if(sup122Shield(b)>0){const s=Math.min(o.sh,d);o.sh-=s;d-=s;if(o.sh<=0)o.sh=0;if(d<=0){ABS122=1;dn(HT122.position,'Absorbed','#c8d8ff',-20,600);return 0}}
  return d}}
// every frame: attack-speed buffs speed up a companion's attacks, note who just took damage, drop what has run out
function sup122Tick(dt){
  const now=performance.now();
  if(hero.hp<SUP122H.hp-.5)SUP122H.hitT=now;SUP122H.hp=hero.hp;
  fols.forEach((f,i)=>{const c=party[i];if(!f||!c)return;const o=SUP122.get(c);
    if(!o){if(c.h>0)sup122(c);return}
    if(c.h<o.hp-.5)o.hitT=now;o.hp=c.h;
    if(c.h<=0||c.emp){o.sh=0;o.bf.length=0;return}
    if(o.sh>0&&o.shT<=now)o.sh=0;
    if(o.bf.length)o.bf=o.bf.filter(b=>b.t>now);
    const as=sup122Bf(c,'as');if(as&&f.cdA>0)f.cdA-=dt*as;
    if(f.visible&&(o.sh>0||o.bf.length)&&Math.random()<dt*2.5)burst(gY(f.position,.8),o.sh>0?0xc8d8ff:0xffe08a,1,.4,.6,.4)});
  if(SUP122.size>8)for(const c of SUP122.keys())if(!party.includes(c))SUP122.delete(c)}
{const f=compSpells;compSpells=function(dt){f.apply(this,arguments);try{sup122Tick(dt)}catch(e){console.warn('v122 support',e)}}}
// spell text: say who the spell helps now
(function(){const D={
  'Stone Ward':'Wraps the ally who needs it most (you or a companion) in stone that absorbs 22% of their max health.',
  "Mountain's Embrace":'A mountain of stone shields the ally under the most pressure for 25% of their max health.',
  'Spectral Ward':'Shields the ally under the most pressure for 26% of their max health and blasts enemies near them.',
  'Earthen Bulwark':'Shields the ally under the most pressure for 20% of their max health.',
  'Radiance':'Heals the most wounded ally (you or a companion) for 12% of their max health.',
  'Mend':'Heals the most wounded ally (you or a companion) for 20% of their max health.',
  'Regrowth':'Heals the most wounded ally (you or a companion) for 15% of their max health.',
  'Pack Howl':'Rallies a fighting ally (you first): +15% physical attack for 8s.',
  'Tailwind':'Gives a fighting ally (you first) +20% attack speed for 8s.',
  'Scale Armor':'Gives the ally under the most pressure 15% damage reduction for 8s.'};
  for(const n in D){const sp=CSP[n];if(!sp||!/^(heal|shield|buff)$/.test(sp.k))continue;
    // keep the live numbers in the text if an earlier balance pass changed them
    const pct=sp.k=='buff'?null:Math.round((sp.v||0)*100);sp.d=pct!=null?D[n].replace(/\d+% of their max health/,pct+'% of their max health'):D[n]}})();
