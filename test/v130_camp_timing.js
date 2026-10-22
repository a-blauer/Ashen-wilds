// v130: camp cards 4.7 s with the zone-card timing; zone cards stay 6.2 s (python3 probe.py v130_camp_timing.js)
(()=>{const R={};
  const I=INSL.find(x=>x&&!x.den&&!x.tri&&x.k===0);zt116Ins(I);const h=ZT116.el;
  R.zoneAnim=getComputedStyle(h).animationName+' '+getComputedStyle(h).animationDuration;R.zoneSub=!!h.querySelector('.zts');
  const C=CAMPS.find(c=>c.des&&c.g)||CAMPS.find(c=>c.des);const hadG=C.g;if(!C.g)C.g=1;CS123.card.C=undefined;CS123.card.seen={};h.className='';
  const p=pl.position,ox=p.x,oz=p.z;p.x=C.x;p.z=C.z;cs123Card(1e9);p.x=ox;p.z=oz;if(hadG!==C.g)C.g=hadG;
  R.campCls=h.className;R.campTitle=(h.querySelector('.ztt')||{}).textContent;R.campSub=!!h.querySelector('.zts');R.campDes=C.des.sub;
  R.campAnim=getComputedStyle(h).animationName+' '+getComputedStyle(h).animationDuration;return new Promise(ok=>setTimeout(()=>{R.onAt4500=/\bon\b/.test(h.className);setTimeout(()=>{R.offAt6200=!/\bon\b/.test(h.className);ok(R)},1700)},4500))})()
