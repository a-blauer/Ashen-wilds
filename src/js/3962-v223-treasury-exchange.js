// ================= v223 the Treasury is a stock exchange board =================
// Owner (Nov 12 2026): "Make the treasury look more like a treasury stock market exchange."
// Only the look changes. The market is the v200 one (3706): three ventures whose price moves every 10 minutes, the same for
// everyone (trs200P / trs200Hist give the real price history from the market's start), a 1% fee, the invest cap by level.
// Every number on the board comes from those functions; every Buy / Sell button is the old one (data-trs200b + data-g,
// data-trs200s + data-f), so the 3706 click handler, trs200Buy and trs200Sell do the trading exactly as before.
//  - A ticker tape scrolls across the top: each venture's price and 24 h change, your book, the time to the next price.
//  - Quote tiles (one per venture, a small 24 h line each); the chosen one fills the board: big price with a green / red
//    arrow, a candle chart drawn on a canvas from the real history (1D = hourly candles, 3D = 2 h, 1W = 4 h, 1M = daily;
//    point at a candle to read its open / high / low / close), the 24 h high / low, and your average cost as a dashed line.
//  - The trading ticket beside it: your position (shares, average cost, value, profit / loss), Buy (100 / 500 / 1000 / Max
//    or an amount you type, with the shares it would buy after the fee) and Sell (25% / 50% / All, with the gold it pays).
//  - The portfolio strip: your gold, what you have invested of the Treasury's cap, what it is worth, profit / loss.
// The countdown timer (one interval) stops itself and the canvases are emptied when the window closes or shows something else.
// Your own window: nothing is sent in co-op.
var T223={v:1,rg:'3D',tm:0,sym:['IRWG','SSPC','DCXP'],R:{'1D':[1,6],'3D':[3,12],'1W':[7,24],'1M':[30,144]},hov:-1};
function t223Per(){return 86400000/TRS200.S}
function t223F(v,d){return (+v).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d})}
function t223G(v){return '🪙 '+Math.round(v).toLocaleString()}
function t223Chg(v,cls){const up=v>=0;return `<span class="t223-${up?'up':'dn'}${cls?' '+cls:''}">${up?'▲':'▼'} ${Math.abs(v*100).toFixed(2)}%</span>`}
function t223Next(){const ms=TRS200.T0+(trs200N()+1)*TRS200.S-Date.now();return st200Clock(ms)}
function t223Q(i,n){const per=t223Per(),p=trs200P(i,n),p1=trs200P(i,Math.max(0,n-per)),P=trs200Hist(i,n);let hi=-1e9,lo=1e9;for(let j=Math.max(0,n-per);j<=n;j++){hi=Math.max(hi,P[j]);lo=Math.min(lo,P[j])}
  const H=TRS200.h[TRS200.A[i].k];return {p,p1,chg:p/p1-1,hi,lo,H,val:H?H.s*p:0}}
// candles of the last D days, each B steps (10 min) wide, from the real price history
function t223Candles(i,n){const [D,B]=T223.R[T223.rg]||T223.R['3D'],per=t223Per(),from=Math.max(0,n-D*per),P=trs200Hist(i,n),C=[];
  for(let s=from;s<=n;s+=B){const e=Math.min(n,s+B);let h=-1e9,l=1e9;for(let j=Math.max(0,s-1);j<=e;j++){h=Math.max(h,P[j]);l=Math.min(l,P[j])}C.push({s,e,o:P[Math.max(0,s-1)],c:P[e],h,l});if(e>=n)break}return C}
function t223Time(step,long){const d=new Date(TRS200.T0+step*TRS200.S),hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  const day=d.toLocaleDateString(undefined,{month:'short',day:'numeric'});return long||T223.rg=='3D'?day+' '+hm:(T223.rg=='1D'?hm:day)}
function t223Chart(cv){const i=T223.v,n=trs200N(),C=t223Candles(i,n),dpr=Math.min(2,window.devicePixelRatio||1),W=cv.clientWidth||600,Hh=cv.clientHeight||220;if(W<20)return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(Hh*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(Hh*dpr)}
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,Hh);
  const H=TRS200.h[TRS200.A[i].k],avg=H&&H.s>0?H.c/H.s:null;let hi=-1e9,lo=1e9;C.forEach(c=>{hi=Math.max(hi,c.h);lo=Math.min(lo,c.l)});
  if(avg&&avg<hi*1.15&&avg>lo*.85){hi=Math.max(hi,avg);lo=Math.min(lo,avg)}const pad=(hi-lo)*.08||1;hi+=pad;lo-=pad;
  const L=6,R=W-54,T=10,Bt=Hh-22,y=v=>Bt-(v-lo)/(hi-lo)*(Bt-T),cw=(R-L)/C.length;
  g.font='11px "EB Garamond",Georgia,serif';g.textBaseline='middle';
  for(let k=0;k<=4;k++){const v=lo+(hi-lo)*k/4,yy=Math.round(y(v))+.5;g.strokeStyle='rgba(180,200,170,.12)';g.lineWidth=1;g.beginPath();g.moveTo(L,yy);g.lineTo(R,yy);g.stroke();g.fillStyle='#a8b4a0';g.textAlign='left';g.fillText(v.toFixed(2),R+6,yy)}
  g.textAlign='center';g.fillStyle='#8e9a88';const lab=Math.max(1,Math.round(C.length/5));for(let k=0;k<C.length;k+=lab){const x=L+cw*(k+.5);g.fillText(t223Time(C[k].s),x,Hh-9);g.strokeStyle='rgba(180,200,170,.07)';g.beginPath();g.moveTo(Math.round(x)+.5,T);g.lineTo(Math.round(x)+.5,Bt);g.stroke()}
  // moving average of closes (5 candles)
  g.strokeStyle='rgba(232,195,106,.75)';g.lineWidth=1.3;g.beginPath();C.forEach((c,k)=>{const a=C.slice(Math.max(0,k-4),k+1),m=a.reduce((s,q)=>s+q.c,0)/a.length,x=L+cw*(k+.5);k?g.lineTo(x,y(m)):g.moveTo(x,y(m))});g.stroke();
  C.forEach((c,k)=>{const up=c.c>=c.o,x=L+cw*(k+.5),col=up?'#4ade80':'#f87171';g.strokeStyle=col;g.lineWidth=1;g.beginPath();g.moveTo(Math.round(x)+.5,y(c.h));g.lineTo(Math.round(x)+.5,y(c.l));g.stroke();
    const bw=Math.max(1.5,cw*.62),y1=y(Math.max(c.o,c.c)),y2=y(Math.min(c.o,c.c));g.fillStyle=up?'rgba(74,222,128,.85)':'rgba(248,113,113,.9)';g.fillRect(x-bw/2,y1,bw,Math.max(1,y2-y1))});
  if(avg){const yy=y(avg);if(yy>T&&yy<Bt){g.setLineDash([5,4]);g.strokeStyle='#8ab4ff';g.lineWidth=1.2;g.beginPath();g.moveTo(L,yy);g.lineTo(R,yy);g.stroke();g.setLineDash([]);g.textAlign='left';const lw=g.measureText('your avg '+avg.toFixed(2)).width+8;g.fillStyle='rgba(8,12,10,.85)';g.fillRect(L+2,yy-17,lw,14);g.fillStyle='#8ab4ff';g.fillText('your avg '+avg.toFixed(2),L+6,yy-10)}}
  const last=C[C.length-1],ly=y(last.c),up=last.c>=C[0].o;g.fillStyle=up?'#16a34a':'#dc2626';g.fillRect(R+1,ly-8,53,16);g.fillStyle='#fff';g.textAlign='left';g.fillText(last.c.toFixed(2),R+5,ly);
  const hv=T223.hov;if(hv>=0&&hv<C.length){const c=C[hv],x=L+cw*(hv+.5);g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([3,3]);g.beginPath();g.moveTo(x,T);g.lineTo(x,Bt);g.stroke();g.setLineDash([]);
    const txt=t223Time(c.e,true)+'   O '+c.o.toFixed(2)+'  H '+c.h.toFixed(2)+'  L '+c.l.toFixed(2)+'  C '+c.c.toFixed(2),tw=g.measureText(txt).width+14,bx=Math.min(R-tw,Math.max(L,x-tw/2));
    g.fillStyle='rgba(8,12,10,.92)';g.fillRect(bx,T,tw,18);g.strokeStyle='rgba(232,195,106,.6)';g.strokeRect(bx+.5,T+.5,tw-1,17);g.fillStyle='#f0e6cc';g.textAlign='left';g.fillText(txt,bx+7,T+9)}
  cv._t223={L,cw,n:C.length}}
function t223Spark(cv,i){const n=trs200N(),per=t223Per(),from=Math.max(0,n-per),P=trs200Hist(i,n),dpr=Math.min(2,window.devicePixelRatio||1),W=cv.clientWidth||120,H=cv.clientHeight||30;if(W<10)return;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);let hi=-1e9,lo=1e9;for(let j=from;j<=n;j++){hi=Math.max(hi,P[j]);lo=Math.min(lo,P[j])}
  const sp=(hi-lo)||1,up=P[n]>=P[from],col=up?'#4ade80':'#f87171',X=j=>(j-from)/Math.max(1,n-from)*W,Y=v=>H-2-(v-lo)/sp*(H-4);
  g.beginPath();for(let j=from;j<=n;j++)j==from?g.moveTo(X(j),Y(P[j])):g.lineTo(X(j),Y(P[j]));g.strokeStyle=col;g.lineWidth=1.4;g.stroke();
  g.lineTo(W,H);g.lineTo(0,H);g.closePath();const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,up?'rgba(74,222,128,.28)':'rgba(248,113,113,.28)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fill()}
function t223Tape(n){const it=TRS200.A.map((A,i)=>{const q=t223Q(i,n);return `<span class="t223-ti"><i>${A.i}</i><b>${T223.sym[i]}</b> ${t223F(q.p,2)} ${t223Chg(q.chg)}</span>`});
  const inv=trs200In(),val=trs200Val();it.push(`<span class="t223-ti"><b>YOUR BOOK</b> ${t223G(val)} ${inv>0?t223Chg(val/inv-1):''}</span>`);
  it.push(`<span class="t223-ti"><b>NEXT PRICE</b> in <span class="t223-cd">${t223Next()}</span></span>`,`<span class="t223-ti"><b>FEE</b> 1% per trade</span>`);
  const one=it.join('<span class="t223-sep">◆</span>')+'<span class="t223-sep">◆</span>',dur=40,del=-((performance.now()/1000)%dur);
  return `<div class="t223-tape t223-view"><div class="t223-tk" style="animation-duration:${dur}s;animation-delay:${del.toFixed(2)}s">${one}${one}</div></div>`}
XR.treas200=(f=>function(){const r=f.apply(this,arguments);try{t223Build()}catch(e){console.warn('v223 treasury',e)}return r})(XR.treas200);
function t223Build(){const B=$('xwB');if(!B)return;const n=trs200N(),cap=trs200Cap(),inv=trs200In(),val=trs200Val(),room=Math.max(0,cap-inv),i=T223.v=Math.max(0,Math.min(TRS200.A.length-1,T223.v|0));
  const A=TRS200.A[i],q=t223Q(i,n),H=q.H,can=g=>room>=10&&gold>=10&&g<=Math.min(room,gold),mxB=Math.floor(Math.min(gold,room));
  const head=B.querySelector('.s200-head');if(head){const ex=head.querySelector('.trs200-sum');if(ex)ex.remove()}
  const tiles=TRS200.A.map((a,j)=>{const qq=t223Q(j,n);return `<button class="t223-tile t223-view${j==i?' on':''}" data-t223v="${j}" style="--rc:${a.col}"><span class="t223-tt"><i>${a.i}</i><b>${T223.sym[j]}</b>${qq.H?'<em>held</em>':''}</span>
    <span class="t223-tp">${t223F(qq.p,2)}</span>${t223Chg(qq.chg)}<canvas class="t223-sp" data-t223sp="${j}"></canvas><small>${st200Esc(a.n)}</small></button>`}).join('');
  const range=Object.keys(T223.R).map(k=>`<button data-t223r="${k}" class="${T223.rg==k?'on':''}">${k}</button>`).join('');
  const dAbs=q.p-q.p1,avg=H&&H.s>0?H.c/H.s:0,pl=H?q.val-H.c:0;
  const vol=A.sd<.05?'Steady':A.sd<.1?'Lively':'Wild';
  const pos=H?`<div class="t223-pos"><span><small>Shares</small><b>${t223F(H.s,2)}</b></span><span><small>Avg cost</small><b>🪙 ${t223F(avg,2)}</b></span><span><small>Value</small><b>${t223G(q.val)}</b></span><span><small>Profit / loss</small><b class="${pl>=0?'t223-pu':'t223-pd'}">${pl>=0?'+':'−'}${Math.round(Math.abs(pl)).toLocaleString()} (${H.c>0?(pl>=0?'+':'−')+Math.abs(pl/H.c*100).toFixed(1)+'%':'0%'})</b></span></div>`
    :`<div class="t223-pos t223-none">You hold no ${T223.sym[i]} shares yet.</div>`;
  const sells=[[.25,'25%'],[.5,'50%'],[1,'All']].map(([f,l])=>`<button data-trs200s="${i}" data-f="${f}" ${H?'':'disabled'} title="${H?'pays about '+t223G(Math.floor((f>=1?H.s:H.s*f)*q.p*(1-TRS200.fee))):''}">${l}</button>`).join('');
  const pct=cap>0?Math.min(100,inv/cap*100):0,tpl=val-inv;
  const html=`<div class="t223">${t223Tape(n)}
   <div class="t223-port"><span><small>Your gold</small><b>${t223G(gold)}</b></span><span class="t223-capb"><small>Invested of the cap</small><b>${t223G(inv)} <em>/ ${cap.toLocaleString()}</em></b><i><u style="width:${pct.toFixed(1)}%"></u></i></span>
     <span><small>Book value</small><b>${t223G(val)}</b></span><span><small>Profit / loss</small><b class="${tpl>=0?'t223-pu':'t223-pd'}">${inv>0?(tpl>=0?'+':'−')+Math.round(Math.abs(tpl)).toLocaleString()+' '+t223Chg(val/inv-1,'sm'):'—'}</b></span></div>
   <div class="t223-tiles">${tiles}</div>
   <div class="t223-main">
    <div class="t223-board t223-view"><div class="t223-bh"><div class="t223-nm"><i>${A.i}</i><div><b>${T223.sym[i]} · ${A.n}</b><small>${A.d} · ${vol}</small></div></div>
      <div class="t223-big ${q.chg>=0?'up':'dn'}"><b>${t223F(q.p,2)}</b><span>${q.chg>=0?'▲':'▼'} ${t223F(Math.abs(dAbs),2)} (${Math.abs(q.chg*100).toFixed(2)}%) <small>24 h</small></span></div></div>
      <div class="t223-rg">${range}<span class="t223-nx">next price in <b class="t223-cd">${t223Next()}</b></span></div>
      <canvas class="t223-cv" data-t223cv="1"></canvas>
      <div class="t223-st"><span><small>24 h high</small>${t223F(q.hi,2)}</span><span><small>24 h low</small>${t223F(q.lo,2)}</span><span><small>Yesterday</small>${t223F(q.p1,2)}</span><span><small>Listed at</small>${t223F(A.p,2)}</span></div></div>
    <div class="t223-ticket"><div class="t223-th">Trading ticket · <b>${T223.sym[i]}</b></div>${pos}
      <div class="t223-side t223-buy"><div class="t223-lab">Buy <small>${room>=10?'room to invest '+t223G(room):'the cap is reached: upgrade the Treasury'}</small></div>
        <div class="t223-row">${[100,500,1000].map(g=>`<button data-trs200b="${i}" data-g="${g}" ${can(g)?'':'disabled'}>🪙 ${g}</button>`).join('')}<button data-trs200b="${i}" data-g="max" ${room>=10&&gold>=10?'':'disabled'}>Max</button></div>
        <div class="t223-row t223-amt"><input type="number" min="10" step="10" placeholder="amount" data-t223amt="1" aria-label="Gold to invest"><button class="t223-bb" data-trs200b="${i}" data-g="0" disabled>Buy</button></div>
        <div class="t223-est" data-t223est="1">Max buys about ${t223F(mxB>=10?mxB*(1-TRS200.fee)/q.p:0,2)} shares at ${t223F(q.p,2)} (after the 1% fee).</div></div>
      <div class="t223-side t223-sell"><div class="t223-lab">Sell <small>${H?'all pays about '+t223G(Math.floor(H.s*q.p*(1-TRS200.fee))):'nothing to sell'}</small></div><div class="t223-row">${sells}</div></div></div>
   </div>${head?head.outerHTML:''}</div>`;
  B.innerHTML=html;B.dataset.t223=1;
  const draw=()=>{try{const R=B.querySelector('.t223');if(!R)return;R.querySelectorAll('[data-t223sp]').forEach(c=>t223Spark(c,+c.dataset.t223sp));const cv=R.querySelector('[data-t223cv]');if(cv)t223Chart(cv)}catch(e){console.warn('v223 chart',e)}};
  draw();requestAnimationFrame(draw);   // now (the layout is known) and once more after the first paint (fonts, scrollbar)
  clearInterval(T223.tm);T223.tm=setInterval(t223Tick,1000)}
function t223Tick(){const x=$('xw'),R=$('xwB')&&$('xwB').querySelector('.t223');
  if(xwMode!='treas200'||!x||x.classList.contains('hide')||!R){clearInterval(T223.tm);T223.tm=0;if(R)R.querySelectorAll('canvas').forEach(c=>{c.width=0;c.height=0});return}
  const s=t223Next();R.querySelectorAll('.t223-cd').forEach(e=>{if(e.textContent!==s)e.textContent=s})}
$('xw').addEventListener('click',e=>{if(xwMode!='treas200')return;const t=e.target.closest('[data-t223v],[data-t223r]');if(!t)return;
  if(t.dataset.t223v!=null){T223.v=+t.dataset.t223v;T223.hov=-1;rX()}else{T223.rg=t.dataset.t223r;T223.hov=-1;const cv=$('xwB').querySelector('[data-t223cv]');$('xwB').querySelectorAll('[data-t223r]').forEach(b=>b.classList.toggle('on',b===t));if(cv)t223Chart(cv)}});
$('xw').addEventListener('input',e=>{if(xwMode!='treas200')return;const t=e.target.closest('[data-t223amt]');if(!t)return;const R=$('xwB'),b=R.querySelector('.t223-bb'),est=R.querySelector('[data-t223est]'),i=T223.v;
  const g=Math.floor(+t.value||0),room=Math.max(0,trs200Cap()-trs200In()),ok=g>=10&&g<=Math.min(room,gold),p=trs200P(i);b.dataset.g=String(g);b.disabled=!ok;
  if(est)est.textContent=g>0?(ok?'🪙 '+g.toLocaleString()+' buys about '+t223F(g*(1-TRS200.fee)/p,2)+' shares at '+t223F(p,2)+' (after the 1% fee).':g<10?'The smallest trade is 🪙 10.':'That is more than your gold or the room left under the cap.'):''});
$('xw').addEventListener('keydown',e=>{if(xwMode!='treas200'||e.key!=='Enter')return;const t=e.target.closest&&e.target.closest('[data-t223amt]');if(!t)return;const b=$('xwB').querySelector('.t223-bb');if(b&&!b.disabled)b.click()});
$('xw').addEventListener('pointermove',e=>{if(xwMode!='treas200')return;const cv=e.target.closest&&e.target.closest('[data-t223cv]');if(!cv||!cv._t223)return;const r=cv.getBoundingClientRect(),k=Math.floor((e.clientX-r.left-cv._t223.L)/cv._t223.cw),h=k>=0&&k<cv._t223.n?k:-1;
  if(h!==T223.hov){T223.hov=h;t223Chart(cv)}});
$('xw').addEventListener('pointerleave',e=>{if(xwMode!='treas200'||!(e.target&&e.target.matches&&e.target.matches('[data-t223cv]')))return;if(T223.hov>=0){T223.hov=-1;const cv=$('xwB').querySelector('[data-t223cv]');if(cv)t223Chart(cv)}},true);
addEventListener('resize',()=>{if(xwMode!='treas200')return;const R=$('xwB')&&$('xwB').querySelector('.t223');if(!R)return;R.querySelectorAll('[data-t223sp]').forEach(c=>t223Spark(c,+c.dataset.t223sp));const cv=R.querySelector('[data-t223cv]');if(cv)t223Chart(cv)});
document.head.insertAdjacentHTML('beforeend',`<style id="t223css">
html body.kq .t223{container-type:inline-size;container-name:t223;display:flex;flex-direction:column;gap:10px}
html body.kq .t223 .t223-view{color:#e8eedd}
html body.kq .t223-up{color:#2f6b2a;font-weight:600}html body.kq .t223-dn{color:#9a2a1a;font-weight:600}
html body.kq .t223 .t223-view .t223-up,html body.kq .t223 .t223-pu{color:#4ade80}html body.kq .t223 .t223-view .t223-dn,html body.kq .t223 .t223-pd{color:#f87171}
html body.kq .t223 .t223-ticket .t223-pu,html body.kq .t223 .t223-port .t223-pu,html body.kq .t223 .t223-port .t223-up{color:#2f6b2a}html body.kq .t223 .t223-ticket .t223-pd,html body.kq .t223 .t223-port .t223-pd,html body.kq .t223 .t223-port .t223-dn{color:#9a2a1a}
/* ticker tape */
html body.kq .t223 .t223-tape{overflow:hidden;white-space:nowrap;border-radius:2px;background:linear-gradient(180deg,#14130f,#0a0a08);box-shadow:0 0 0 1px #3a2a1a,inset 0 1px 0 rgba(232,195,106,.25),inset 0 -1px 0 rgba(232,195,106,.25);padding:6px 0;font-family:'Courier New',ui-monospace,monospace;font-size:.92rem;letter-spacing:.03em}
html body.kq .t223 .t223-tk{display:inline-block;animation:t223tape linear infinite;padding-left:0}
html body.kq .t223 .t223-tape:hover .t223-tk{animation-play-state:paused}
@keyframes t223tape{from{transform:translateX(0)}to{transform:translateX(-50%)}}
html body.kq .t223 .t223-ti{display:inline-flex;align-items:center;gap:6px;color:#e8e2c8}html body.kq .t223 .t223-ti i{font-style:normal}html body.kq .t223 .t223-ti b{color:#f0c860;font-weight:700}
html body.kq .t223 .t223-sep{color:#6a5a3a;margin:0 16px;font-size:.7rem}
/* portfolio strip (paper) */
html body.kq .t223 .t223-port{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:6px 4px 8px;border-bottom:1px solid var(--lg-rule,rgba(58,44,28,.5))}
html body.kq .t223 .t223-port small,html body.kq .t223 .t223-pos small,html body.kq .t223 .t223-st small{display:block;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#54473a;font-style:normal}
html body.kq .t223 .t223-port b{font-size:1.12rem;font-weight:600;color:#2a2118}html body.kq .t223 .t223-port b em{font-style:normal;font-weight:400;font-size:.86rem;color:#54473a}
html body.kq .t223 .t223-port .sm{font-size:.84rem}
html body.kq .t223 .t223-capb i{display:block;height:5px;margin-top:4px;border-radius:3px;background:rgba(58,44,28,.15);overflow:hidden}html body.kq .t223 .t223-capb u{display:block;height:100%;background:linear-gradient(90deg,#8a5a12,#c9a24a)}
/* quote tiles */
html body.kq .t223 .t223-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
html body.kq .win .t223 button.t223-tile{display:grid;grid-template-columns:auto 1fr;grid-template-areas:'t t' 'p c' 's s' 'n n';gap:2px 8px;text-align:left;align-items:baseline;padding:8px 10px 7px;border-radius:3px;cursor:pointer;color:#e8eedd;
  background:linear-gradient(180deg,#191c17,#0e100d);border:1px solid #2a2a20;box-shadow:inset 3px 0 0 var(--rc),0 2px 5px rgba(40,24,10,.35);transition:transform .12s,box-shadow .12s}
html body.kq .win .t223 button.t223-tile:hover{transform:translateY(-1px);background:linear-gradient(180deg,#20241d,#121410);border-color:#4a4a36}
html body.kq .win .t223 button.t223-tile.on{border-color:#e8c36a;box-shadow:inset 3px 0 0 var(--rc),0 0 0 1px #e8c36a,0 0 14px rgba(232,195,106,.35)}
html body.kq .t223 .t223-tt{grid-area:t;display:flex;align-items:center;gap:6px;font-family:'Courier New',ui-monospace,monospace;font-size:.86rem;letter-spacing:.06em}html body.kq .t223 .t223-tt i{font-style:normal}html body.kq .t223 .t223-tt b{color:#f0c860}
html body.kq .t223 .t223-tt em{margin-left:auto;font-size:.66rem;font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:#0e100d;background:#8ab4ff;border-radius:2px;padding:0 4px}
html body.kq .t223 .t223-tp{grid-area:p;font-family:'Courier New',ui-monospace,monospace;font-size:1.3rem;font-weight:700;color:#fff}
html body.kq .t223 .t223-tile>.t223-up,html body.kq .t223 .t223-tile>.t223-dn{grid-area:c;font-family:'Courier New',ui-monospace,monospace;font-size:.84rem;justify-self:end}
html body.kq .t223 .t223-sp{grid-area:s;width:100%;height:30px;display:block}
html body.kq .t223 .t223-tile small{grid-area:n;font-size:.74rem;color:#aab3a2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* the board */
html body.kq .t223 .t223-main{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(250px,1fr);gap:12px;align-items:start}
html body.kq .t223 .t223-board{border-radius:3px;padding:10px 12px;background:radial-gradient(ellipse at 50% 0%,#1d231c,#0c0f0b 70%);box-shadow:0 0 0 1px #3a2a1a,0 0 0 4px rgba(58,44,28,.15),inset 0 0 0 1px rgba(232,195,106,.2),0 4px 14px rgba(40,24,10,.45)}
html body.kq .t223 .t223-bh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}
html body.kq .t223 .t223-nm{display:flex;gap:9px;align-items:center;min-width:0;flex:1}html body.kq .t223 .t223-nm i{font-style:normal;font-size:1.6rem}
html body.kq .t223 .t223-nm b{display:block;font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-size:1.2rem;color:#f4ecd4;font-size-adjust:none}html body.kq .t223 .t223-nm small{display:block;font-size:.8rem;color:#aab3a2;font-style:italic;line-height:1.25}
html body.kq .t223 .t223-big{text-align:right;font-family:'Courier New',ui-monospace,monospace}
html body.kq .t223 .t223-big b{display:block;font-size:2.1rem;line-height:1;color:#fff;letter-spacing:-.01em}
html body.kq .t223 .t223-big span{font-size:.95rem;font-weight:700}html body.kq .t223 .t223-big.up span{color:#4ade80}html body.kq .t223 .t223-big.dn span{color:#f87171}html body.kq .t223 .t223-big small{color:#aab3a2;font-weight:400}
html body.kq .t223 .t223-big.up b{text-shadow:0 0 14px rgba(74,222,128,.35)}html body.kq .t223 .t223-big.dn b{text-shadow:0 0 14px rgba(248,113,113,.35)}
html body.kq .t223 .t223-rg{display:flex;gap:4px;align-items:center;margin:8px 0 4px}
html body.kq .win .t223 .t223-rg button{padding:1px 9px;min-height:0;font-family:'Courier New',ui-monospace,monospace;font-size:.8rem;color:#cfd6c4;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.18);border-radius:2px}
html body.kq .win .t223 .t223-rg button:hover{background:rgba(255,255,255,.12);border-color:#e8c36a}
html body.kq .win .t223 .t223-rg button.on{color:#0c0f0b;background:#e8c36a;border-color:#e8c36a}
html body.kq .t223 .t223-nx{margin-left:auto;font-size:.8rem;color:#aab3a2;font-style:italic}html body.kq .t223 .t223-nx b{font-family:'Courier New',ui-monospace,monospace;color:#f0c860;font-style:normal}
html body.kq .t223 .t223-cv{display:block;width:100%;height:230px;cursor:crosshair}
html body.kq .t223 .t223-st{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:6px;font-family:'Courier New',ui-monospace,monospace;font-size:.95rem;color:#f0ead8}
html body.kq .t223 .t223-board .t223-st small{color:#aab3a2}
/* the trading ticket (paper) */
html body.kq .t223 .t223-ticket{display:flex;flex-direction:column;gap:10px;padding:8px 2px 4px 14px;border-left:1px solid var(--lg-rule,rgba(58,44,28,.5))}
html body.kq .t223 .t223-th{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-style:italic;font-size:1.05rem;color:#8c2f1f;font-size-adjust:none}
html body.kq .t223 .t223-pos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px;padding:6px 8px;border:1px dashed rgba(58,44,28,.4);background:rgba(240,228,200,.35)}
html body.kq .t223 .t223-pos b{font-size:1rem;font-weight:600;color:#2a2118}html body.kq .t223 .t223-pos.t223-none{display:block;font-style:italic;color:#54473a}
html body.kq .t223 .t223-side{display:flex;flex-direction:column;gap:5px}
html body.kq .t223 .t223-lab{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-size:1.1rem;color:#2a2118;display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size-adjust:none}
html body.kq .t223 .t223-lab small{font-family:'EB Garamond',Georgia,serif;font-size:.8rem;font-style:italic;color:#54473a;text-align:right}
html body.kq .t223 .t223-row{display:flex;gap:5px;flex-wrap:wrap}
html body.kq .win .t223 .t223-row button{flex:1;min-width:52px;padding:5px 6px;font-size:.92rem;font-weight:600}
html body.kq .win .t223 .t223-buy .t223-row button{color:#1f4a1c;border-color:rgba(47,107,42,.6);background:rgba(47,107,42,.08)}
html body.kq .win .t223 .t223-buy .t223-row button:hover:not(:disabled){background:rgba(47,107,42,.2);border-color:#2f6b2a}
html body.kq .win .t223 .t223-sell .t223-row button{color:#7a1f12;border-color:rgba(154,42,26,.55);background:rgba(154,42,26,.07)}
html body.kq .win .t223 .t223-sell .t223-row button:hover:not(:disabled){background:rgba(154,42,26,.18);border-color:#9a2a1a}
html body.kq .t223 .t223-amt input{flex:2;min-width:0;padding:4px 8px;font-size:.95rem}
html body.kq .win .t223 .t223-amt button.t223-bb{flex:1;color:#f4f0e0;background:linear-gradient(180deg,#3f7a36,#24521e);border-color:#1a3a16}
html body.kq .t223 .t223-est{font-size:.8rem;font-style:italic;color:#54473a;min-height:1.1em}
html body.kq .t223 .s200-head{margin:0}
@container t223 (max-width:700px){
  html body.kq .t223 .t223-main{grid-template-columns:minmax(0,1fr)}
  html body.kq .t223 .t223-ticket{border-left:0;padding-left:2px;border-top:1px solid var(--lg-rule,rgba(58,44,28,.5))}
  html body.kq .t223 .t223-port{grid-template-columns:repeat(2,minmax(0,1fr))}
  html body.kq .t223 .t223-cv{height:180px}html body.kq .t223 .t223-st{grid-template-columns:repeat(2,minmax(0,1fr))}
  html body.kq .t223 .t223-big b{font-size:1.7rem}
}
@container t223 (max-width:470px){
  html body.kq .t223 .t223-tiles{gap:5px}html body.kq .win .t223 button.t223-tile{padding:6px 6px 5px;gap:1px 4px}
  html body.kq .t223 .t223-tp{font-size:1rem}html body.kq .t223 .t223-tile small{display:none}html body.kq .t223 .t223-tile>.t223-up,html body.kq .t223 .t223-tile>.t223-dn{font-size:.72rem;grid-area:s;justify-self:start}
  html body.kq .t223 .t223-sp{display:none}html body.kq .t223 .t223-tt em{display:none}
}
@media (prefers-reduced-motion:reduce){html body.kq .t223 .t223-tk{animation:none}}
</style>`);
