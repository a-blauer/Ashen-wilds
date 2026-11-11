// ================= v220 title pop-ups: the name only, and one at a time =================
// Owner (Nov 11 2026): "when titles popup for different areas or events there is a lot of over explaining. Adjust the popups to be
// more simplistic only providing the name and any crucially important info - no text like 'mobs respawn x minutes'" and
// "make sure title popups dont overlap eachother."
//  - Title cards (zt116Show) show the small place line and the name. The flavour line is gone; the last line stays only when it is
//    something you must know right now: a key to press, a count, a checkpoint, or the red "you are under the recommended power".
//  - Banners (banner) show the title and one short line; the third (explaining) line is never shown.
//  - Cards and banners share one queue (TQ220): one is on screen at a time. When another is waiting, the one on screen leaves
//    early (after ~1.5-1.9 s), so warnings in a fight are never held back for long. Camp cards never queue: they are skipped
//    when something else is up. Nothing is shown while a cinematic runs; it comes after.
// Each player sees their own pop-ups (no co-op message: the calls that raise them already run on every screen).
var TQ220={q:[],cur:null,tm:0,end:0,cardMs:4600,campMs:(typeof CC130_MS!="undefined"?CC130_MS:3800),banMs:3550,max:4};
var TQ220_KEEP=/ztlow|\b(F|C|Ctrl|Space|Shift|W\/S|A\/D|Tab)\b\s*(·|or|at|to|picks|beside)|left click|\b\d+ of \d+\b|Checkpoint/;
function tq220Busy(){try{if(typeof IC151!='undefined'&&IC151.on)return true}catch(_){}try{if(typeof KC208!='undefined'&&KC208.on)return true}catch(_){}return false}
function tq220Hide(){try{if(ZT116.el){clearTimeout(ZT116.tm);ZT116.el.className=''}}catch(_){}try{const b=$('banner');if(b)b.innerHTML=''}catch(_){}}
function tq220Run(){const Q=TQ220,n=nowP();
  if(Q.cur){if(!Q.q.length)return;const w=Q.cur.t0+Q.cur.min-n;if(w>0){clearTimeout(Q.tm);Q.tm=setTimeout(tq220Run,w+10);return}
    tq220Hide();clearTimeout(Q.end);Q.cur=null}
  if(!Q.q.length)return;
  if(tq220Busy()){clearTimeout(Q.tm);Q.tm=setTimeout(tq220Run,400);return}
  const it=Q.q.shift();Q.cur={t0:n,min:it.k==='c'?1900:1500,k:it.k};
  try{if(typeof TC163!='undefined'){TC163.zT=0;TC163.wT=0}}catch(_){}
  try{it.fn()}catch(e){console.warn('v220 title',e)}
  clearTimeout(Q.end);Q.end=setTimeout(()=>{Q.cur=null;tq220Run()},it.ms)}
function tq220Push(it){const Q=TQ220;Q.q.push(it);while(Q.q.length>Q.max)Q.q.shift();tq220Run()}
// what stays of a card's last line
function tq220Foot(foot){if(!foot)return '';const s=String(foot);return TQ220_KEEP.test(s)?s:''}
{const f=zt116Show;zt116Show=function(T,kick,title,sub,foot,cls){const s=this,camp=/camp123/.test(cls||''),Q=TQ220;
    if(camp&&(Q.cur||Q.q.length||tq220Busy()))return;
    const ft=camp?'':tq220Foot(foot);
    tq220Push({k:'c',ms:camp?Q.campMs:Q.cardMs,fn:()=>{f.call(s,T,kick,title,'',ft,cls);
      if(!camp){clearTimeout(ZT116.tm);ZT116.tm=setTimeout(()=>{if(ZT116.el)ZT116.el.className=''},Q.cardMs)}}})}}
{const f=banner;banner=function(t,sub,det){const s=this;
    if(typeof ZT116!='undefined'&&(ZT116.mute||t==='🏰 DUSKHOLD'))return f.apply(this,arguments);   // muted arrival banners / the town card (it comes back in as a card)
    let b=sub==null?'':String(sub);if(b.replace(/<[^>]*>/g,'').length>64)b='';
    tq220Push({k:'b',ms:TQ220.banMs,fn:()=>{f.call(s,t,b,'')}})}}
document.head.insertAdjacentHTML('beforeend',`<style>
#ztc116.on{animation-duration:4.6s}
#ztc116 .ztd{margin-bottom:2px}
#banner .bnr .b2:empty{display:none}
</style>`);
