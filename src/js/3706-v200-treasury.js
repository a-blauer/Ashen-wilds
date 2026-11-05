// ================= v200: the Treasury is a gold market =================
// Owner (Nov 5 2026): "make the treasury an interactable station where you can deposit gold and trade it like a stock market. The
// market should fluctuate in a reasonable way providing risk and reward but rise very slightly over time so that it's a safe
// long term investment. Upgrades to it allow you to invest more."
//  * Three ventures (TRS200.A), from steady to wild. A price moves every TRS200.S (10 minutes of real time) and is the same
//    for every player at the same moment (seeded by time, no Math.random): log price = base + a slow upward drift (mu per day)
//    + a slow swing that wanders and is pulled back toward the trend (sd, over about a day and a half) + a small fast wobble (fs).
//    Buy low in a dip and sell in a swell for a quick profit, or hold: the trend only goes up.
//  * Buying costs gold and gives shares; selling turns shares back into gold. Every trade costs a 1% fee.
//  * How much you may have invested (the gold you put in and haven't taken out) is capped by the Treasury's level:
//    5,000 / 20,000 / 75,000 (ST200_TR in 3700). Holdings TRS200.h = {venture: {s: shares, c: gold put in}}, saved (x2.trs200).
// Co-op: prices are the same on every page; holdings are your own.
var TRS200={S:10*60000,T0:Date.UTC(2026,10,1),fee:.01,h:{},cache:{},A:[
  {k:'iron',n:'Ironwrights\' Guild',i:'⚒️',d:'Duskhold\'s smiths and their ore contracts. Slow and steady.',p:20,mu:.0004,sd:.03,fs:.005,col:'#9aa4b4'},
  {k:'caravan',n:'Sunspice Caravans',i:'🐪',d:'Trade runs through the Searing Sands. Good years and bad ones.',p:50,mu:.0006,sd:.07,fs:.012,col:'#e0a84a'},
  {k:'crystal',n:'Deepcrystal Expedition',i:'💎',d:'Crystal diggers beneath the Citadel. Wild swings, the best long-run rise.',p:100,mu:.0008,sd:.13,fs:.022,col:'#8ab4ff'}]};
// deterministic noise: a standard normal number for (venture, step)
function trs200H(a,n){let h=(Math.imul(n+1,2654435761)^Math.imul(a+7,40503))>>>0;h^=h>>>16;h=Math.imul(h,2246822507)>>>0;h^=h>>>13;h=Math.imul(h,3266489909)>>>0;h^=h>>>16;return (h>>>0)/4294967296}
function trs200Z(a,n){const u=Math.max(1e-9,trs200H(a*3+1,n)),v=trs200H(a*3+2,n);return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v)}
function trs200N(t){return Math.max(0,Math.floor(((t==null?Date.now():t)-TRS200.T0)/TRS200.S))}
// price history of venture ai up to step n (cached, grows step by step)
function trs200Hist(ai,n){const A=TRS200.A[ai],C=TRS200.cache[A.k]||(TRS200.cache[A.k]={x:0,y:0,p:new Float64Array(4096),n:-1});
  if(n>=C.p.length){const q=new Float64Array(Math.max(n+1,C.p.length*2));q.set(C.p);C.p=q}
  const per=86400000/TRS200.S,th=1/(1.5*per),sg=A.sd*Math.sqrt(2*th),thf=.25,sgf=A.fs*Math.sqrt(2*thf),mu=A.mu/per;
  for(let i=C.n+1;i<=n;i++){C.x=C.x*(1-th)+sg*trs200Z(ai,i);C.y=C.y*(1-thf)+sgf*trs200Z(ai+7,i);C.p[i]=A.p*Math.exp(mu*i+C.x+C.y);C.n=i}return C.p}
function trs200P(ai,n){n=n==null?trs200N():n;return trs200Hist(ai,n)[n]}
function trs200Cap(){return ST200_TR[kdLv('treas')]||0}
function trs200In(){return TRS200.A.reduce((s,A)=>s+((TRS200.h[A.k]||{}).c||0),0)}
function trs200Val(){return TRS200.A.reduce((s,A,i)=>s+((TRS200.h[A.k]||{}).s||0)*trs200P(i),0)}
function trs200Buy(ai,g){const A=TRS200.A[ai];g=Math.floor(Math.min(g,gold,trs200Cap()-trs200In()));if(g<10)return say(gold<10?'Not enough gold.':'💰 You have invested as much as the Treasury allows (🪙 '+trs200Cap().toLocaleString()+'). Upgrade it to invest more.');
  const p=trs200P(ai),sh=g*(1-TRS200.fee)/p,H=TRS200.h[A.k]||(TRS200.h[A.k]={s:0,c:0});gold-=g;H.s+=sh;H.c+=g;
  say('💰 Bought '+sh.toFixed(2)+' shares of '+A.n+' at 🪙 '+p.toFixed(2)+' for 🪙 '+g.toLocaleString()+'.');try{sfx('chime')}catch(_){}try{hud();saveGame(true)}catch(_){}rX()}
function trs200Sell(ai,fr){const A=TRS200.A[ai],H=TRS200.h[A.k];if(!H||!(H.s>0))return;fr=Math.max(0,Math.min(1,fr));const sh=fr>=1?H.s:H.s*fr,p=trs200P(ai),g=Math.floor(sh*p*(1-TRS200.fee));
  const cb=fr>=1?H.c:H.c*fr;gold+=g;H.s-=sh;H.c-=cb;if(H.s<1e-6||fr>=1){delete TRS200.h[A.k]}
  const pr=g-cb;say('💰 Sold '+sh.toFixed(2)+' shares of '+A.n+' for 🪙 '+g.toLocaleString()+' ('+(pr>=0?'+':'')+Math.round(pr).toLocaleString()+' '+(pr>=0?'profit':'loss')+').');try{sfx(pr>=0?'power':'chime')}catch(_){}try{hud();saveGame(true)}catch(_){}rX()}
// a small line chart of the last three days
function trs200Spark(ai,col){const n=trs200N(),days=3,per=86400000/TRS200.S,from=Math.max(0,n-days*per),P=trs200Hist(ai,n),W=260,H=56;let lo=1e9,hi=-1e9;
  for(let i=from;i<=n;i++){lo=Math.min(lo,P[i]);hi=Math.max(hi,P[i])}const sp=(hi-lo)||1,pts=[],step=Math.max(1,Math.floor((n-from)/130));
  for(let i=from;i<=n;i+=step)pts.push(((i-from)/Math.max(1,n-from)*W).toFixed(1)+','+(H-3-(P[i]-lo)/sp*(H-6)).toFixed(1));pts.push(W+','+(H-3-(P[n]-lo)/sp*(H-6)).toFixed(1));
  return `<svg class="trs200-sp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg><div class="trs200-ax"><span>3 days ago</span><span>low ${lo.toFixed(1)} · high ${hi.toFixed(1)}</span><span>now</span></div>`}
function trs200Pct(v){return `<span class="${v>=0?'trs200-up':'trs200-dn'}">${v>=0?'▲':'▼'} ${Math.abs(v*100).toFixed(1)}%</span>`}
XR.treas200=function(){const n=trs200N(),per=86400000/TRS200.S,cap=trs200Cap(),inv=trs200In(),val=trs200Val(),room=Math.max(0,cap-inv);
  $('xwT').textContent='💰 Treasury';$('xwS').innerHTML='🪙 <b>'+gold.toLocaleString()+'</b> · invested 🪙 '+Math.round(inv).toLocaleString()+' of '+cap.toLocaleString()+' · worth now 🪙 '+Math.round(val).toLocaleString();
  let h=st200Head('treas',`<div class="trs200-sum"><small>Your holdings</small><b>🪙 ${Math.round(val).toLocaleString()}</b> ${inv>0?trs200Pct(val/inv-1):''}</div>`);
  h+='<div class="trs200-grid">'+TRS200.A.map((A,i)=>{const p=trs200P(i,n),p1=trs200P(i,Math.max(0,n-per)),H=TRS200.h[A.k],sv=H?H.s*p:0;
    const amt=[100,500,1000],can=g=>room>=10&&gold>=10&&g<=Math.min(room,gold);
    return `<div class="trs200-c" style="--rc:${A.col}"><div class="trs200-t"><span class="trs200-i">${A.i}</span><div><b>${A.n}</b><small>${A.d}</small></div></div>
      <div class="trs200-pr"><b>🪙 ${p.toFixed(2)}</b> <small>per share</small> ${trs200Pct(p/p1-1)} <small>24 h</small></div>${trs200Spark(i,A.col)}
      <div class="trs200-h">${H?`You hold <b>${H.s.toFixed(2)}</b> shares · worth 🪙 <b>${Math.floor(sv).toLocaleString()}</b> · paid 🪙 ${Math.round(H.c).toLocaleString()} ${trs200Pct(sv/H.c-1)}`:'<span class="mut">You hold no shares.</span>'}</div>
      <div class="trs200-b"><span class="mut">Buy</span>${amt.map(g=>`<button data-trs200b="${i}" data-g="${g}" ${can(g)?'':'disabled'}>🪙 ${g}</button>`).join('')}<button data-trs200b="${i}" data-g="max" ${room>=10&&gold>=10?'':'disabled'}>Max</button></div>
      <div class="trs200-b"><span class="mut">Sell</span>${[[.25,'25%'],[.5,'50%'],[1,'All']].map(([f,l])=>`<button data-trs200s="${i}" data-f="${f}" ${H?'':'disabled'}>${l}</button>`).join('')}</div></div>`}).join('')+'</div>';
  $('xwB').innerHTML=h;
  $('xwF').innerHTML='<span class="mut dtl">Prices change every 10 minutes and are the same for everyone. They swing up and down, but every venture rises slowly over time. Each trade costs a 1% fee. Upgrade the Treasury at the Stronghold Steward to invest more.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='treas200')return;const t=e.target.closest('[data-trs200b],[data-trs200s]');if(!t||t.disabled)return;
  if(t.dataset.trs200b!=null){const g=t.dataset.g=='max'?Math.min(gold,trs200Cap()-trs200In()):+t.dataset.g;trs200Buy(+t.dataset.trs200b,g)}else trs200Sell(+t.dataset.trs200s,+t.dataset.f)});
// a new price every 10 minutes: redraw an open window when the step changes
var TRS200_LAST=-1;setInterval(()=>{try{if(xwMode!='treas200'||$('xw').classList.contains('hide'))return;const n=trs200N();if(n!==TRS200_LAST){TRS200_LAST=n;rX()}}catch(_){}},5000);
ST200.open.treas=()=>{TRS200_LAST=trs200N();openX('treas200')};
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.trs200=JSON.parse(JSON.stringify(TRS200.h));return o}}
{const f=x2Load;x2Load=function(s){TRS200.h={};try{const q=s&&s.trs200;if(q&&typeof q=='object')TRS200.A.forEach(A=>{const H=q[A.k];if(H&&+H.s>0)TRS200.h[A.k]={s:+H.s,c:Math.max(0,+H.c||0)}})}catch(_){}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style id="trs200css">
#xw .trs200-sum{text-align:right}#xw .trs200-sum small{display:block;text-transform:uppercase;letter-spacing:.08em;font-size:.6rem;color:#c9a24a}#xw .trs200-sum b{font-size:1.05rem}
#xw .trs200-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(270px,1fr))}
#xw .trs200-c{padding:10px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--rc) 45%,var(--line));background:linear-gradient(160deg,color-mix(in srgb,var(--rc) 12%,transparent),rgba(0,0,0,.3) 60%);display:flex;flex-direction:column;gap:6px}
#xw .trs200-t{display:flex;gap:10px;align-items:center}#xw .trs200-i{font-size:1.6rem}#xw .trs200-t small{display:block;color:var(--mut);font-size:.7rem;line-height:1.3}
#xw .trs200-pr b{font-size:1.05rem}#xw .trs200-pr small{color:var(--mut);font-size:.66rem}
#xw .trs200-sp{width:100%;height:56px;background:rgba(0,0,0,.3);border-radius:6px;display:block}
#xw .trs200-ax{display:flex;justify-content:space-between;font-size:.6rem;color:var(--mut);margin-top:-3px}
#xw .trs200-h{font-size:.74rem}#xw .trs200-b{display:flex;gap:4px;align-items:center;flex-wrap:wrap}#xw .trs200-b>span{width:30px;font-size:.68rem}
#xw .trs200-b button{padding:2px 8px;font-size:.72rem;min-height:0}
#xw .trs200-up{color:#6ee7b7;font-size:.74rem;font-weight:700}#xw .trs200-dn{color:#f87171;font-size:.74rem;font-weight:700}
@media(max-width:640px){#xw .trs200-grid{grid-template-columns:1fr}}
</style>`);
