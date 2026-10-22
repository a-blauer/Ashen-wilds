// ================= v127 camp title card timing =================
// Camp cards use the same timing as zone cards (zt126) but stay on screen 1.5 s less: 4.7 s instead of 6.2 s.
// Same 0.52 s fade-in, same 1.04 s fade-out (from 3.66 s), and the blur only comes in over the last 0.04 s, as on zone cards.
var CC127_MS=4700;
{const f=cs123Card;cs123Card=function(){const tm=ZT116.tm,r=f.apply(this,arguments);
  if(ZT116.tm!==tm&&ZT116.el&&/camp123/.test(ZT116.el.className)){clearTimeout(ZT116.tm);ZT116.tm=setTimeout(()=>{if(ZT116.el)ZT116.el.className=''},CC127_MS)}return r}}
document.head.insertAdjacentHTML('beforeend',`<style>
#ztc116.camp123.on{animation:zt127c 4.7s ease forwards}
@keyframes zt127c{0%{opacity:0;filter:blur(6px)}11.06%{opacity:1;filter:blur(0)}77.87%{opacity:1}99.15%{filter:blur(0)}100%{opacity:0;filter:blur(2px)}}
</style>`);
