// ================= v222 the Ledger: every menu is a page of ink on paper =================
// Owner (Nov 12 2026): "I'm still not satisfied with the UI for our menus. I want a better looking, cleaner UI ... shops and
// menus to not look like a mobile game", "the background you chose for menus is clearly the same texture repeated - I can see
// the edges", then picked the "Ledger" direction out of four mock-ups: "I like the Ledge one - but lets add more fantasy accents".
// What this file does (styling only: no window's contents or behaviour change):
//  - SURFACE. Every window (.win) is aged paper: two soft washes and one stain layer drawn by an SVG noise filter that is
//    stretched over the whole window (LG222.stain, background-size 100% 100%). Nothing is tiled, so there is no seam to see.
//    The v88 leather tile, the gold frame image, glossy gold buttons and the v221 gem / seal / row plates are gone (3941 removed).
//  - INK. Text is dark ink in EB Garamond; titles in IM Fell English (both added to the page's font link). font-size-adjust
//    keeps the small sizes as readable as the old sans. The theme's colour variables are re-pointed inside .win
//    (--kq-ink, --kq-mut, --kq-gold, --ink, --acc ...), which carries most of the old window CSS over to ink colours.
//  - THE INK PASS (lg222Ink). Hundreds of older rules and inline styles still ask for light text. After a window's content
//    changes, one walk over it works out each element's real background (paper, or a dark plate such as an item slot or a
//    3D preview) and, where light text would sit on paper, sets a dark ink of the same hue (gold -> ochre, green -> forest,
//    rarity colours keep their hue); dark text that ends up on a dark plate is made light again. So nothing is unreadable,
//    whatever window it is. LG222.fix holds what the pass changed (cleared and redone each pass).
//  - FANTASY ACCENTS. A double ruled margin with a knotwork ornament in each corner, a red illuminated first letter on the
//    title, a fleuron rule under it, a faint alchemist's circle drawn into the page, a wax seal for the close button, a red
//    ribbon on the selected line, section headings marked with a hedera leaf.
//  - Dialogue (the talk view) and the keeper's greeting are the same paper; item slots and 3D previews stay dark plates, like
//    illustrations pasted into the book.
// Each player styles their own windows: nothing here is shared in co-op.
var LG222={fix:new Set(),fixB:new Set(),raf:0,paper:[226,212,180],on:true};
LG222.stain="url(\"data:image/svg+xml,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600' preserveAspectRatio='none'><filter id='a' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.006 .009' numOctaves='4' seed='11'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .25  0 0 0 0 .12  0 0 0 1.1 -.52'/></filter><filter id='b' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .5 -.2'/></filter><rect width='100%' height='100%' filter='url(#a)'/><rect width='100%' height='100%' filter='url(#b)' opacity='.5'/></svg>")+"\")";
LG222.knot=r=>"url(\"data:image/svg+xml,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g transform='rotate("+r+" 30 30)' fill='none' stroke='#3a2a1a' stroke-width='1.3' stroke-linecap='round'><path d='M3 57V16C3 8 8 3 16 3h41'/><path d='M8 57V19c0-7 4-11 11-11h38' opacity='.5'/><path d='M3 30c9 0 14-5 14-13S12 6 9 9s0 9 8 9 13-6 13-15'/><path d='M17 17c5 5 13 5 13 13s-8 8-8 3 6-5 12 0' opacity='.8'/><circle cx='9.5' cy='9.5' r='2.2' fill='#8c2f1f' stroke='none'/></g></svg>")+"\")";
LG222.circle="url(\"data:image/svg+xml,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='#3a2a1a' stroke-opacity='.16' stroke-width='.9'><circle cx='100' cy='100' r='96'/><circle cx='100' cy='100' r='88' stroke-dasharray='1.5 4'/><circle cx='100' cy='100' r='60'/><path d='M100 12l76 132H24z'/><path d='M100 188L24 56h152z' opacity='.7'/><circle cx='100' cy='100' r='22'/><path d='M100 4v20M100 176v20M4 100h20M176 100h20M100 78v44M78 100h44'/><circle cx='100' cy='40' r='5'/><circle cx='48' cy='130' r='5'/><circle cx='152' cy='130' r='5'/></svg>")+"\")";
document.head.insertAdjacentHTML('beforeend',`<style>
html body.kq .modal.w{background:radial-gradient(ellipse at 50% 45%,rgba(8,6,4,.5),rgba(3,2,1,.84))}
html body.kq .win{--kq-ink:#2a2118;--kq-ink2:#3a2e20;--kq-mut:#6a5c48;--kq-dim:#8a7a62;--kq-gold:#8a5a12;--kq-gold2:#7a2a1a;--kq-bronze:#6a4a22;--kq-good:#3a6a30;--kq-bad:#9a2a1a;--kq-mana:#2c5484;
  --kq-line:rgba(58,44,28,.22);--kq-line2:rgba(58,44,28,.42);--ink:#2a2118;--mut:#6a5c48;--acc:#8c2f1f;--gold:#8a5a12;--line:rgba(58,44,28,.22);--lg-red:#8c2f1f;--lg-rule:rgba(58,44,28,.5);
  background:${LG222.circle} right -70px bottom -80px/280px 280px no-repeat,${LG222.stain} center/100% 100% no-repeat,radial-gradient(130% 110% at 28% 16%,#eee2c6 0%,#e2d4b4 46%,#cfbc96 100%) no-repeat;background-blend-mode:normal,multiply,normal;
  border:0;border-image:none;border-radius:2px;color:#2a2118;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-size-adjust:.5;
  box-shadow:0 0 0 1px #4a3826,0 0 0 5px #1c140c,0 0 0 6px #6a4e2c,0 26px 64px rgba(0,0,0,.7),inset 0 0 80px rgba(120,88,46,.3)}
html body.kq .win::before{display:none}
html body.kq .modal.w>.win::after{content:'';position:absolute;inset:7px;z-index:3;pointer-events:none;border:1px solid var(--lg-rule);outline:1px solid rgba(58,44,28,.2);outline-offset:-4px;
  background:${LG222.knot(0)} left -1px top -1px/38px 38px no-repeat,${LG222.knot(90)} right -1px top -1px/38px 38px no-repeat,${LG222.knot(180)} right -1px bottom -1px/38px 38px no-repeat,${LG222.knot(270)} left -1px bottom -1px/38px 38px no-repeat}
html body.kq .win .wh,html body.kq .win .wf{background:none;box-shadow:none;border-radius:0}
html body.kq .win .wh{height:auto;min-height:52px;padding:14px 20px 6px 34px;border-bottom:0;margin-bottom:10px}
html body.kq .win .wh::after{content:'❦';left:22px;right:22px;bottom:-11px;height:16px;display:flex;align-items:center;justify-content:center;font-size:.8rem;line-height:1;color:var(--lg-red);
  background:linear-gradient(90deg,transparent,var(--lg-rule) 12%,var(--lg-rule) 46%,transparent 47.5%,transparent 52.5%,var(--lg-rule) 54%,var(--lg-rule) 88%,transparent) center/100% 1px no-repeat}
html body.kq .win .wh h2,html body.kq.psx .win .wh h2#xwT{font:400 1.5rem/1.1 'IM Fell English','EB Garamond',Georgia,serif!important;letter-spacing:0;text-transform:none;color:#2a2118;text-shadow:none;gap:6px;font-size-adjust:none}
html body.kq .win .wh h2::before,html body.kq .win .wh h2::after{display:none}
html body.kq .win .wh h2::first-letter{color:var(--lg-red);font-size:1.32em}
html body.kq .wsub,html body.kq .win .wsub{color:var(--kq-mut);font-style:italic;font-size:.82rem}
html body.kq .win .wh .x{width:32px;height:32px;border-radius:47% 53% 50% 50%/52% 46% 54% 48%;border:0;background:radial-gradient(circle at 36% 30%,#c4553e,#8c2f1f 52%,#5e1a10);color:#f1dfc0;font-size:.78rem;text-shadow:0 1px 0 rgba(0,0,0,.4);
  box-shadow:0 1px 3px rgba(0,0,0,.5),inset 0 0 0 3px rgba(94,26,16,.55),inset 0 2px 2px rgba(255,200,170,.3);position:relative;z-index:4;flex:none}
html body.kq .win .wh .x:hover{background:radial-gradient(circle at 36% 30%,#d9664c,#a03624 52%,#6e2014);color:#fff3dc;border:0}
html body.kq.mob .win .wh .x{width:38px;height:38px}
html body.kq .win .wb{padding:8px 22px 18px;scrollbar-color:#8a7350 transparent}
html body.kq .win .wf{border-top:0;padding:10px 30px 18px;min-height:0;position:relative;color:var(--kq-mut)}
html body.kq .win .wf::before{content:'';position:absolute;left:22px;right:22px;top:0;height:1px;background:var(--lg-rule);opacity:.6}
html body.kq .win .wf:empty{display:none}
html body.kq .win .wf .mut,html body.kq .win .wf .dtl{font-style:italic}
html body.kq .win ::-webkit-scrollbar{width:9px;height:9px}
html body.kq .win ::-webkit-scrollbar-track{background:rgba(58,44,28,.08);border:0}
html body.kq .win ::-webkit-scrollbar-thumb{background:rgba(58,44,28,.42);border:2px solid transparent;background-clip:padding-box;border-radius:5px}
/* type */
html body.kq .win h3,html body.kq .win h4{font-family:'IM Fell English','EB Garamond',Georgia,serif;color:#2a2118;letter-spacing:0;font-weight:400}
html body.kq .win .sec,html body.kq .win .setg,html body.kq .win .hsec,html body.kq .win .ceh{font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-style:italic;font-size:.98rem;letter-spacing:.01em;text-transform:none;color:var(--lg-red);
  background:linear-gradient(90deg,var(--lg-rule),rgba(58,44,28,.12) 70%,transparent) left bottom/100% 1px no-repeat;padding-bottom:2px;font-size-adjust:none}
html body.kq .win .sec::before,html body.kq .win .setg::before{content:'❧';margin-right:6px;font-style:normal;color:var(--lg-red);opacity:.85}
html body.kq .win kbd{font-family:inherit;color:#2a2118;opacity:.8}
html body.kq .win b,html body.kq .win strong{font-weight:600}
/* buttons: ink-ruled labels; the one that matters is a block of red wax */
html :where(body.kq .win) button{background:rgba(58,44,28,.07);border:1px solid rgba(58,44,28,.52);border-radius:2px;color:#2a2118;box-shadow:none;text-shadow:none;font-family:inherit}
html :where(body.kq .win) button:hover:not(:disabled){background:rgba(140,47,31,.12);border-color:var(--lg-red);box-shadow:none}
html :where(body.kq .win) button:active:not(:disabled){box-shadow:inset 0 1px 4px rgba(58,44,28,.45)}
html :where(body.kq .win) button:disabled{opacity:.45;filter:none}
html body.kq .win button.pri{background:linear-gradient(180deg,#a23a27,#7a2416);border:1px solid #4e150c;color:#f6ead0;text-shadow:0 1px 0 rgba(0,0,0,.35);font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;letter-spacing:.03em;
  box-shadow:inset 0 1px 0 rgba(255,200,170,.25),0 1px 3px rgba(58,30,14,.5)}
html body.kq .win button.pri:hover:not(:disabled){background:linear-gradient(180deg,#b6452f,#8a2a1a);box-shadow:inset 0 1px 0 rgba(255,200,170,.3),0 2px 6px rgba(58,30,14,.5)}
html body.kq .win button.pri:disabled{filter:grayscale(.6);opacity:.5}
html body.kq .win button:focus-visible,html body.kq .win .rw:focus-visible{outline:2px solid var(--lg-red);outline-offset:1px}
/* tabs: written headings, the open one underlined in red */
html body.kq .win .tabs{border-bottom:1px solid var(--lg-rule);box-shadow:none;gap:4px 18px;flex-wrap:wrap}
html body.kq .win .tabs button,html body.kq #btabs button{border:0;border-bottom:2px solid transparent;border-radius:0;background:none;color:var(--kq-mut);font-family:'IM Fell English','EB Garamond',Georgia,serif;font-weight:400;font-style:italic;font-size:1rem;
  letter-spacing:0;padding:4px 2px 5px;box-shadow:none;margin-bottom:-1px;font-size-adjust:none}
html body.kq .win .tabs button:hover:not(:disabled){background:none;color:#2a2118}
html body.kq .win .tabs button.on,html body.kq #btabs button.on{color:#2a2118;font-style:normal;border-color:transparent;border-bottom-color:var(--lg-red);background:none;box-shadow:none}
html body.kq .win .tabs button.on::after{display:none}
/* lines of a list: dotted rules, a red ribbon on the chosen one */
html body.kq .win .rw{background:none;border-bottom:1px dotted rgba(58,44,28,.38);color:#2a2118}
html body.kq .win .rw:hover:not(:disabled){background:rgba(140,47,31,.07)}
html body.kq .win .rw.on,html body.kq #xw .rw.on{background:linear-gradient(90deg,rgba(140,47,31,.16),rgba(140,47,31,.03) 80%,transparent);box-shadow:inset 3px 0 0 var(--lg-red);outline:0}
html body.kq .win .rw.on.it{box-shadow:inset 3px 0 0 var(--lg-red)}
html body.kq .win .kv,html body.kq .win .mi,html body.kq .win .df{border-bottom-color:rgba(58,44,28,.2)}
html body.kq .win .panel{background:rgba(58,44,28,.07);border:1px solid rgba(58,44,28,.3);border-radius:2px}
html body.kq .win select,html body.kq .win input[type=text],html body.kq .win input:not([type]),html body.kq .win input[type=number],html body.kq .win textarea{background:rgba(255,250,235,.45);color:#2a2118;border:1px solid rgba(58,44,28,.5);border-radius:2px;font-family:inherit}
html body.kq .win input[type=range],html body.kq .win input[type=checkbox]{accent-color:#8c2f1f}
html body.kq .win details.grp{border-color:rgba(58,44,28,.3);background:rgba(58,44,28,.05);color:#2a2118}
/* plates pasted into the book: item slots and 3D previews stay dark */
html body.kq .win .kqm-slot{background:#1c1611;border-radius:2px;box-shadow:inset 0 0 12px -4px var(--rc,transparent),0 1px 2px rgba(58,30,14,.4);color:#eadfc6}
html body.kq .win .kqm-slot.kqm-empty{background:rgba(58,44,28,.1);border:1px dashed rgba(58,44,28,.3);box-shadow:none}
html body.kq .win .kqm-slot.on{outline:2px solid var(--lg-red);outline-offset:1px}
html body.kq .win .pvbox{border:1px solid #3a2a1a;border-radius:2px;box-shadow:0 0 0 3px rgba(58,44,28,.12),0 2px 6px rgba(58,30,14,.4)}
/* ---- dialogue: the same page, a strip of it ---- */
#xw.dlg220 .win{background:${LG222.stain} center/100% 100% no-repeat,radial-gradient(130% 160% at 28% 0%,#eee2c6 0%,#e0d1b0 55%,#cdb992 100%) no-repeat!important;background-blend-mode:multiply,normal!important;border:0!important;border-radius:2px!important;
  box-shadow:0 0 0 1px #4a3826,0 0 0 5px #1c140c,0 0 0 6px #6a4e2c,0 18px 44px rgba(0,0,0,.75),inset 0 0 60px rgba(120,88,46,.3)!important}
#xw.dlg220>.win::after{inset:6px;background-size:34px 34px,34px 34px,34px 34px,34px 34px}
#xw.dlg220 .wh{min-height:0;margin:0;padding:0}
#xw.dlg220 .wh h2{font-size:1.05rem;padding:5px 20px;color:#f6ead0;background:linear-gradient(180deg,#a23a27,#7a2416);border:1px solid #4e150c;box-shadow:0 2px 8px rgba(0,0,0,.6);letter-spacing:.03em}
#xw.dlg220 .wh h2::first-letter{color:inherit;font-size:1em}
#xw.dlg220 .wsub{color:#eadcb8;text-shadow:0 1px 3px #000,0 0 8px #000}
#xw.dlg220 .wh .x{width:28px;height:28px;margin-top:6px;border:0!important;background:radial-gradient(circle at 36% 30%,#c4553e,#8c2f1f 52%,#5e1a10)!important;color:#f1dfc0}
#xw.dlg220 .cq132say{color:#2a2118;text-shadow:none;font-family:'IM Fell English','EB Garamond',Georgia,serif;font-size:1.22rem;font-size-adjust:none}
#xw.dlg220 .dl220n{color:var(--lg-red);font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:.9rem;letter-spacing:0;text-transform:none}
#xw.dlg220 .dl220n em{color:var(--kq-mut)}
#xw.dlg220 .wf::before{display:none}
#xw.dlg220 .wf button{color:#2a2118!important;background:rgba(58,44,28,.05)!important;border:0!important;border-bottom:1px dotted rgba(58,44,28,.4)!important;border-left:3px solid transparent!important;font-family:'IM Fell English','EB Garamond',Georgia,serif;font-size:1.08rem;font-size-adjust:none}
#xw.dlg220 .wf button::before{color:var(--lg-red);font-family:'IM Fell English',Georgia,serif;font-size:.9rem;content:counter(dl220) '.  '}
#xw.dlg220 .wf button:hover,#xw.dlg220 .wf button:focus-visible{background:rgba(140,47,31,.12)!important;border-left-color:var(--lg-red)!important;color:#2a2118!important}
#xw.dlg220 .wf button.pri{border-left-color:var(--lg-red)!important;color:#2a2118!important}
#sk220say{color:#2a2118;border:0;border-radius:2px;font-family:'IM Fell English','EB Garamond',Georgia,serif;
  background:${LG222.stain} center/100% 100% no-repeat,radial-gradient(130% 160% at 28% 0%,#eee2c6,#d8c7a2) no-repeat;background-blend-mode:multiply,normal;box-shadow:0 0 0 1px #4a3826,0 0 0 4px #1c140c,0 0 0 5px #6a4e2c,0 10px 26px rgba(0,0,0,.6)}
#sk220say b{font-family:'IM Fell English',Georgia,serif;font-size:.86rem;letter-spacing:.04em;text-transform:none;font-style:italic;color:#8c2f1f}
#sk220say i{font-size:1.05rem}
</style>`);

// ---------------- the ink pass ----------------
function lg222Rgb(s){const m=/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?/.exec(s||'');if(!m)return null;let a=m[4]==null?1:(/%$/.test(m[4])?parseFloat(m[4])/100:+m[4]);return [+m[1],+m[2],+m[3],a]}
function lg222Lum(c){return (.2126*c[0]+.7152*c[1]+.0722*c[2])/255}
function lg222Over(b,c){const a=c[3];return [b[0]+(c[0]-b[0])*a,b[1]+(c[1]-b[1])*a,b[2]+(c[2]-b[2])*a]}
// a light colour as ink of the same hue
function lg222ToInk(c){const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;const l=(mx+mn)/2,s=d?d/(1-Math.abs(2*l-1)):0;
  if(d){h=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}
  if(s<.16)return '#2a2118';                                   // greys and creams: plain ink
  const L=(h>38&&h<75)?24:(h>=75&&h<170)?24:(h>=170&&h<255)?30:28;   // yellows and greens need to go darker to read
  return 'hsl('+Math.round(h)+','+Math.round(Math.min(.78,Math.max(.45,s))*100)+'%,'+L+'%)'}
function lg222Ink(){const L=LG222;L.raf=0;if(!L.on)return;
  L.fix.forEach(e=>{try{e.style.color=e._lg0||''}catch(_){}});L.fix.clear();
  L.fixB.forEach(e=>{try{const o=e._lgb;e.style.background=o[0];e.style.borderColor=o[1];e.style.boxShadow=o[2]}catch(_){}});L.fixB.clear();
  document.querySelectorAll('.modal.w:not(.hide)>.win,#cd213w:not(.hide) .win,#gm218w:not(.hide) .win').forEach(w=>{try{lg222Walk(w,L.paper,0)}catch(e){if(!L.err){L.err=1;console.warn('v222 ink',e)}}})}
function lg222Keep(el,cs){const c=el.classList;return c.contains('kqm-slot')||c.contains('pvbox')||c.contains('pri')||c.contains('meter')||c.contains('bar')||c.contains('xpbar')||c.contains('x')||el.tagName==='BUTTON'&&c.contains('on')||/url\(/.test(cs.backgroundImage)||/(^|[\s-_])(pv|prev|preview|view|map)/i.test(el.className||'')||!!el.querySelector(':scope>canvas,:scope>div>canvas')||!!el.closest('.kqm-slot,.pvbox,.wh')}
function lg222Walk(el,bg,depth){if(depth>40)return;const bg0=bg;const tag=el.tagName;if(tag==='CANVAS'||tag==='svg'||tag==='SVG'||tag==='IMG'||tag==='SELECT'||tag==='INPUT'||tag==='TEXTAREA')return;
  const cs=getComputedStyle(el);if(cs.display==='none')return;
  if(depth>0){const bc=lg222Rgb(cs.backgroundColor);if(bc&&bc[3]>0)bg=lg222Over(bg,bc);
    const bi=cs.backgroundImage;if(bi&&bi!=='none'){const m=bi.match(/rgba?\([^)]+\)/g);
      if(m){let r=0,g=0,b=0,a=0;m.forEach(s=>{const c=lg222Rgb(s);if(c){r+=c[0];g+=c[1];b+=c[2];a+=c[3]}});const n=m.length;bg=lg222Over(bg,[r/n,g/n,b/n,Math.min(1,a/n)])}
      else if(/url\(/.test(bi)&&!/gradient/.test(bi))bg=[28,22,17]}}          // a picture behind text: treat as a dark plate
  // an old dark card or panel becomes a pale inset on the page (item slots, previews, bars, wax buttons and pictures stay as they are)
  if(depth>0&&lg222Lum(bg)<.36&&!lg222Keep(el,cs)){const r=el.getBoundingClientRect();if(r.width>110&&r.height>34){if(el._lgb===undefined)el._lgb=[el.style.background||'',el.style.borderColor||'',el.style.boxShadow||''];
      el.style.background='rgba(58,44,28,.075)';el.style.borderColor='rgba(58,44,28,.32)';el.style.boxShadow='none';LG222.fixB.add(el);bg=lg222Over(bg0,[58,44,28,.075])}}
  let txt=false;for(let n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&n.nodeValue.trim()){txt=true;break}}
  if(txt||el.childElementCount===0){const c=lg222Rgb(cs.color);if(c){const lb=lg222Lum(bg),lc=lg222Lum(c);
      if(lb>.42&&lc>.42){if(el._lg0===undefined)el._lg0=el.style.color||'';el.style.color=lg222ToInk(c);LG222.fix.add(el)}
      else if(lb<.3&&lc<.3){if(el._lg0===undefined)el._lg0=el.style.color||'';el.style.color='#eadfc6';LG222.fix.add(el)}}}
  for(let c=el.firstElementChild;c;c=c.nextElementSibling)lg222Walk(c,bg,depth+1)}
function lg222Kick(){if(!LG222.raf)LG222.raf=requestAnimationFrame(lg222Ink)}
try{new MutationObserver(recs=>{for(const r of recs){const t=r.target;if(t&&t.closest&&t.closest('.modal,#cd213w,#gm218w')){lg222Kick();return}}})
  .observe($('stage')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}catch(_){}
addEventListener('pointerup',()=>setTimeout(lg222Kick,30),true);addEventListener('keyup',()=>setTimeout(lg222Kick,30),true);
try{document.fonts.ready.then(lg222Kick)}catch(_){}
// how readable is every piece of text in the open windows? (used by the test: nothing may come out nearly invisible)
function lg222Audit(min){min=min||2.2;const out=[],lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)},rl=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
  const walk=(el,bg,d)=>{const tag=el.tagName;if(d>40||tag==='CANVAS'||tag==='svg'||tag==='IMG'||tag==='SELECT'||tag==='INPUT')return;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.35)return;
    if(d>0){const bc=lg222Rgb(cs.backgroundColor);if(bc&&bc[3]>0)bg=lg222Over(bg,bc);const bi=cs.backgroundImage;if(bi&&bi!=='none'){const m=bi.match(/rgba?\([^)]+\)/g);
        if(m){let r=0,g=0,b=0,a=0;m.forEach(s=>{const c=lg222Rgb(s);if(c){r+=c[0];g+=c[1];b+=c[2];a+=c[3]}});const n=m.length;bg=lg222Over(bg,[r/n,g/n,b/n,Math.min(1,a/n)])}else if(/url\(/.test(bi)&&!/gradient/.test(bi))bg=[28,22,17]}}
    let t='';for(let n=el.firstChild;n;n=n.nextSibling)if(n.nodeType===3)t+=n.nodeValue;t=t.trim();
    if(t&&el.getClientRects().length){const c=lg222Rgb(cs.color);if(c){const a=rl(bg),b=rl(c),k=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(k<min)out.push([t.slice(0,30),+k.toFixed(2),(el.className||tag)+'<'+((el.parentElement||{}).className||''),cs.color,bg.map(Math.round).join(',')])}}
    for(let c=el.firstElementChild;c;c=c.nextElementSibling)walk(c,bg,d+1)};
  document.querySelectorAll('.modal.w:not(.hide)>.win').forEach(w=>walk(w,LG222.paper,0));return out}
