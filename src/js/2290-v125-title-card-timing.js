// ================= v125 title card timing, camp cards show only the name =================
// Zone (area) title cards stay up 1 s longer (5.2 s -> 6.2 s) and the blur that comes with the fade-out starts 2 s later
// (4.16 s -> 6.16 s), so the card fades out sharp. They get their own keyframes (zt125) so camp cards (camp123, 3.8 s, zt116) are unchanged.
// Camp cards drop the description line under the camp name; an empty sub line is left out of every card.
var ZT125_MS=6200;
zt116Show=function(T,kick,title,sub,foot,cls){
  let h=ZT116.el;if(!h){h=ZT116.el=document.createElement('div');h.id='ztc116';($('stage')||document.body).appendChild(h)}
  clearTimeout(ZT116.tm);h.className='';void h.offsetWidth;
  h.style.cssText=`--zc1:${T.c1};--zc2:${T.c2};--zc3:${T.c3};--zf:${T.f}`;
  h.innerHTML=`<div class="ztk">${zt116Esc(kick)}</div><div class="ztt">${zt116Esc(title)}</div>${zt116Orn(T.e)}${sub?`<div class="zts">${zt116Esc(sub)}</div>`:''}${foot?`<div class="ztf">${foot}</div>`:''}`;
  h.className='on '+(cls||'');ZT116.tm=setTimeout(()=>{h.className=''},ZT125_MS)};
// camp cards: cs123Card passes C.des.sub as the line under the name; blank it for that call only
{const f=cs123Card;cs123Card=function(){const s=zt116Show;zt116Show=function(T,kick,title,sub,foot,cls){return s.call(this,T,kick,title,'',foot,cls)};
  try{return f.apply(this,arguments)}finally{zt116Show=s}}}
document.head.insertAdjacentHTML('beforeend',`<style>
#ztc116.on{animation:zt125 6.2s ease forwards}
#ztc116.camp123.on{animation:zt116 3.8s ease forwards}
@keyframes zt125{0%{opacity:0;filter:blur(6px)}8.4%{opacity:1;filter:blur(0)}83.2%{opacity:1}99.3%{filter:blur(0)}100%{opacity:0;filter:blur(2px)}}
</style>`);
