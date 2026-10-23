// ================= v137 evolved abilities: small helpers for the per-class files (2720-2740) =================
// c is the ability's cast context: the KQH handler's c for the new abilities, or the same shape built by ev137Ctx for the old
// kinds (raw = the cast's hit value, A = attack value per 1.0 damage, R = radius, P = where you stood, d = aim, gp = ground point).
// Extra hits made here never proc on-hit effects twice (proc:false) and use the ability's own damage type and status effects.
function evC(){return EV137.cur||ev137Cur({col:0xffffff})}
function evHit(c,e,raw,o){if(!e||e.dead)return 0;return kqsHit(e,raw,c,Object.assign({proc:false},o||{}))}
function evArea(c,p,R,raw,o){return kqsArea(p,R,raw,c,Object.assign({proc:false},o||{}))}
// enemies whose distance from p lies in [r0, r1)
function evRing(p,r0,r1){return enemies.filter(e=>{if(e.dead)return false;const d=d2(e.m.position,p),x=e.boss?1.2:0;return d+x>=r0&&d<r1+x})}
function evRot(d,a){const c=Math.cos(a),s=Math.sin(a);return kqsV(d.x*c+d.z*s,-d.x*s+d.z*c)}
function evAt(P,d,t){return kqsV(P.x+d.x*t,P.z+d.z*t)}
// a wave that runs from P along d for L tiles at sp tiles/s, hitting each enemy within w/2 of the line once; draw(q,j) draws step j
function evWave(c,P,d,L,w,raw,sp,draw,o){const hit=new Set(),n=Math.max(2,Math.ceil(L/.9));
  for(let j=1;j<=n;j++)setTimeout(()=>{const q=evAt(P,d,j*L/n);if(draw)draw(q,j);kqsFoes(q,w*.5+.3).forEach(e=>{if(hit.has(e))return;hit.add(e);evHit(c,e,raw,o)})},j*L/n/sp*1000)}
// the buff the handler just added (by name), made stronger / longer
function evBuff(n,s,dur){for(let i=hero.buffs.length-1;i>=0;i--){const b=hero.buffs[i];if(b.n===n){if(s)b.s=s;if(dur)b.t=performance.now()+dur*1000;hsDirty();return b}}return null}
// stretch what a dash handler set up (hero.dash and the ability objects it made since pre) by k
function evStretch(c,k){if(hero.dash)hero.dash.t*=k;hero.iv=Math.max(hero.iv||0,(hero.dash?hero.dash.t:0)+.15);const n0=c.evN0|0;for(let j=n0;j<KQS.objs.length;j++){const o=KQS.objs[j];if(o&&o.life!=null)o.life=(o.life-.08)*k+.08}}
function evNearest(p,R,not){return enemies.filter(e=>!e.dead&&(!not||!not.has(e))&&d2(e.m.position,p)<R).sort((a,b)=>d2(a.m.position,p)-d2(b.m.position,p))}
// lunge timing of the melee single-target handlers (kqsLunge), to land extra effects with the blow
function evLungeMs(t){if(!t)return 0;const L=d2(pl.position,t.m.position)-1.5-(t.boss?1.2:0);return L<=.25?0:Math.round(L/16*1000)}
// a heavy ground hit: shock + glyph + spikes (visual)
function evSlam(p,col,R){ev137Shock(p,col,R,520);ev137Shards(p,col,Math.round(6+R*2),R*.75,1+R*.12,760);ev137Flare(evxGY(p,.8),col,1.2+R*.25,300)}
