// ================= v88: ui — retro dark-fantasy theme for every window, menu and HUD piece =================
// Aged leather and iron panels with gilded, riveted frames (CSS border-image drawn from inline SVG), a fine grain
// (SVG feTurbulence), Cinzel headings, gold/bronze accents. Layout and ids are untouched: the frames are drawn with
// border-image-width larger than the 1px border, so nothing moves. Colours live on :root as --kq-* tokens and the old
// --ink/--mut/--acc/--gold/--line tokens are remapped to them. The icon layer is zzM_uiicons.js (top of the script).
// The rules carry a body.kq prefix (added below) so they win over the older module styles; generic buttons/inputs use
// :where() so any styled component (rarity slots, rows, tabs) keeps its own look.
var KQUI={};
(function(){
const enc=s=>'url("data:image/svg+xml,'+s.replace(/\s*\n\s*/g,' ').replace(/"/g,"'").replace(/%/g,'%25').replace(/#/g,'%23').replace(/</g,'%3C').replace(/>/g,'%3E')+'")';
const X='xmlns="http://www.w3.org/2000/svg"';
// big window frame: 96x96, slice 32 — dark rim, bronze bevel lit from above, fine gold inner line, gilded corner brackets with a diamond stud
const corner=(k)=>`<g transform="${k}">
  <path d="M1.5 1.5H34l-5 6.5H12.5A4.5 4.5 0 0 0 8 12.5V29l-6.5 5Z" fill="url(#gg)" stroke="#120b05" stroke-width="1.2"/>
  <path d="M5 5H27M5 5V27" stroke="#fff1c4" stroke-opacity=".55" stroke-width=".9"/>
  <path d="M14 7.5l6.2 6.2L14 19.9l-6.2-6.2Z" fill="url(#gg)" stroke="#120b05" stroke-width="1"/>
  <circle cx="14" cy="13.7" r="1.6" fill="#2a1a0c"/>
  <path d="M24 11c4.5 0 5 5.5 1 6.2M11 24c0 4.5 5.5 5 6.2 1" fill="none" stroke="#d9a94e" stroke-width="1.3" stroke-linecap="round"/></g>`;
const defs=`<defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe6a6"/><stop offset=".45" stop-color="#c8963e"/><stop offset="1" stop-color="#6e4518"/></linearGradient>
  <linearGradient id="bb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9ac5c"/><stop offset=".5" stop-color="#8a5e28"/><stop offset="1" stop-color="#4c3014"/></linearGradient></defs>`;
const FL=enc(`<svg ${X} width="96" height="96" viewBox="0 0 96 96">${defs}
  <rect x="2" y="2" width="92" height="92" fill="none" stroke="#0b0704" stroke-width="3"/>
  <rect x="5.2" y="5.2" width="85.6" height="85.6" fill="none" stroke="url(#bb)" stroke-width="3"/>
  <rect x="5.2" y="5.2" width="85.6" height="85.6" fill="none" stroke="#fff0c0" stroke-opacity=".22" stroke-width=".8"/>
  <rect x="9.5" y="9.5" width="77" height="77" fill="none" stroke="#e6bd6a" stroke-opacity=".55" stroke-width="1"/>
  <rect x="11" y="11" width="74" height="74" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.2"/>
  ${corner('')}${corner('translate(96 0) scale(-1 1)')}${corner('translate(0 96) scale(1 -1)')}${corner('translate(96 96) scale(-1 -1)')}</svg>`);
// small plate frame (HUD, tooltips, menus): 48x48, slice 16
const cornerS=(k)=>`<g transform="${k}"><path d="M1 1h15l-3 3.6H6.8A2.2 2.2 0 0 0 4.6 6.8V13L1 16Z" fill="url(#gg)" stroke="#120b05" stroke-width=".8"/>
  <path d="M7.6 4.6l3 3-3 3-3-3Z" fill="url(#gg)" stroke="#120b05" stroke-width=".7"/></g>`;
const FS=enc(`<svg ${X} width="48" height="48" viewBox="0 0 48 48">${defs}
  <rect x="1" y="1" width="46" height="46" fill="none" stroke="#0b0704" stroke-width="2"/>
  <rect x="2.9" y="2.9" width="42.2" height="42.2" fill="none" stroke="url(#bb)" stroke-width="1.8"/>
  <rect x="5.2" y="5.2" width="37.6" height="37.6" fill="none" stroke="#e6bd6a" stroke-opacity=".35" stroke-width=".8"/>
  ${cornerS('')}${cornerS('translate(48 0) scale(-1 1)')}${cornerS('translate(0 48) scale(1 -1)')}${cornerS('translate(48 48) scale(-1 -1)')}</svg>`);
// item / skill slot: 30x30, slice 10 — bevelled bronze square with rivets
const FT=enc(`<svg ${X} width="30" height="30" viewBox="0 0 30 30">${defs}
  <rect x=".7" y=".7" width="28.6" height="28.6" fill="none" stroke="#0b0704" stroke-width="1.4"/>
  <path d="M2 2H28V28H2Z" fill="none" stroke="url(#bb)" stroke-width="1.6"/>
  <path d="M3.4 26.6V3.4H26.6" fill="none" stroke="#fbe2a0" stroke-opacity=".45" stroke-width=".8"/>
  <path d="M3.4 26.6H26.6V3.4" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".8"/>
  ${[[3.6,3.6],[26.4,3.6],[3.6,26.4],[26.4,26.4]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7" fill="url(#gg)" stroke="#120b05" stroke-width=".5"/>`).join('')}</svg>`);
// divider flourish: 240x16
const DV=enc(`<svg ${X} width="240" height="16" viewBox="0 0 240 16">${defs}
  <path d="M6 8H100M140 8H234" stroke="url(#bb)" stroke-width="1.4"/><path d="M30 8H100M140 8H210" stroke="#f3d48a" stroke-opacity=".5" stroke-width=".6"/>
  <path d="M100 8c4-5 8-5 11-1M140 8c-4-5-8-5-11-1M100 8c4 5 8 5 11 1M140 8c-4 5-8 5-11 1" fill="none" stroke="#d9a94e" stroke-width="1.2"/>
  <path d="M120 1.5l6.5 6.5-6.5 6.5-6.5-6.5Z" fill="url(#gg)" stroke="#120b05" stroke-width=".8"/><circle cx="120" cy="8" r="1.6" fill="#2a1a0c"/>
  <circle cx="4" cy="8" r="2" fill="url(#gg)"/><circle cx="236" cy="8" r="2" fill="url(#gg)"/></svg>`);
// small title flourish (left; mirrored with scaleX(-1))
const TF=enc(`<svg ${X} width="34" height="12" viewBox="0 0 34 12">${defs}<path d="M2 6H22" stroke="url(#bb)" stroke-width="1.2"/>
  <path d="M22 6c3-4 6-4 7-1" fill="none" stroke="#d9a94e" stroke-width="1"/><path d="M28 1.4l4.6 4.6L28 10.6 23.4 6Z" fill="url(#gg)" stroke="#120b05" stroke-width=".6"/></svg>`);
// grain: monochrome fractal noise, used at low opacity over the leather/iron gradients
const GR=enc(`<svg ${X} width="160" height="160"><filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 .1  0 0 0 0 .07  0 0 0 0 .04  0 0 0 -2.3 1.22"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>`);
// leather mottling: larger, softer turbulence tinted warm
const LE=enc(`<svg ${X} width="260" height="260"><filter id="m"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="3" seed="7" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 .03  0 0 0 0 .018  0 0 0 0 .008  1.3 0 0 0 -.5"/></filter><rect width="260" height="260" filter="url(#m)"/></svg>`);
// check mark for the custom checkbox
const CK=enc(`<svg ${X} viewBox="0 0 16 16"><path d="M3.2 8.4l3 3 6.6-7" fill="none" stroke="#1c1208" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
// select arrow
const AR=enc(`<svg ${X} viewBox="0 0 12 8"><path d="M1 1l5 5 5-5" fill="none" stroke="#e6bd6a" stroke-width="1.8" stroke-linecap="round"/></svg>`);
KQUI={FL,FS,FT,DV,TF,GR,LE};

const css=`
:root{--kq-ink:#eee1c4;--kq-ink2:#d8c6a2;--kq-mut:#a8957a;--kq-dim:#7d6d58;--kq-gold:#e6bf6a;--kq-gold2:#f8dc98;--kq-bronze:#9a6c34;--kq-bronze2:#5c3d1c;
 --kq-iron:#221d19;--kq-iron2:#332b24;--kq-leather:#2b1d12;--kq-leather2:#1a110a;--kq-blood:#a8261a;--kq-ember:#e07a32;--kq-good:#9ad884;--kq-bad:#ff8068;--kq-mana:#5c8ee8;
 --kq-line:rgba(230,190,110,.2);--kq-line2:rgba(230,190,110,.38);--kq-sh:0 10px 34px rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.6);
 --kq-grain:${GR};--kq-leath:${LE};--kq-fl:${FL};--kq-fs:${FS};--kq-ft:${FT};--kq-dv:${DV};--kq-tf:${TF}}
body.kq,body.kq.psx{--ink:var(--kq-ink);--mut:var(--kq-mut);--acc:#c99a45;--gold:var(--kq-gold);--line:var(--kq-line);--glass:rgba(24,17,11,.9);--glass2:rgba(30,21,13,.96)}
body.kq{background:radial-gradient(1200px 640px at 50% -12%,#2e2016,#0a0806 70%) #0a0806}
body.kq .wrap>h1{font-family:Cinzel,Georgia,serif;color:var(--kq-gold2);letter-spacing:.08em;text-shadow:0 2px 0 #000,0 0 14px rgba(230,170,80,.25)}
body.kq .wrap>.sub{color:var(--kq-dim)}
body.kq .stage{border:1px solid #3a2a18;box-shadow:0 0 0 1px #000,0 20px 60px rgba(0,0,0,.6)}

/* ---------- panels ---------- */
body.kq .glass:not([id=topl]){background:var(--kq-grain),linear-gradient(180deg,rgba(44,31,20,.94),rgba(22,15,10,.94));background-size:160px 160px,auto;
 backdrop-filter:none;-webkit-backdrop-filter:none;border:1px solid transparent;border-radius:2px;
 border-image:var(--kq-fs) 16 / 11px / 2px stretch;box-shadow:0 4px 14px rgba(0,0,0,.55),inset 0 0 18px rgba(0,0,0,.55);color:var(--kq-ink)}
body.kq .modal{backdrop-filter:none;-webkit-backdrop-filter:none;background:radial-gradient(ellipse at 50% 45%,rgba(24,16,10,.88),rgba(5,3,2,.97))}
body.kq .modal.w{background:radial-gradient(ellipse at 50% 45%,rgba(10,7,4,.45),rgba(3,2,1,.82))}
body.kq .win,body.kq .ccw{position:relative;background:var(--kq-grain),var(--kq-leath),radial-gradient(ellipse 120% 70% at 50% 0%,rgba(150,100,50,.16),transparent 60%),linear-gradient(180deg,#271a10 0%,#1b120b 55%,#130c07 100%);
 background-size:160px 160px,260px 260px,auto,auto;border:1px solid transparent;border-radius:3px;border-image:var(--kq-fl) 32 / 21px / 8px stretch;box-shadow:var(--kq-sh);color:var(--kq-ink)}
body.kq .win .wh,body.kq .win .wf,body.kq .cch,body.kq .ccf{background:var(--kq-grain),linear-gradient(180deg,rgba(66,45,26,.85),rgba(34,23,14,.9));background-size:160px 160px,auto;border-radius:0}
body.kq .win .wh{position:relative;height:42px;padding:0 10px 0 18px;border-bottom:0;box-shadow:inset 0 -1px 0 rgba(0,0,0,.7),inset 0 1px 0 rgba(255,220,150,.08)}
body.kq .win .wh::after,body.kq .cch::after{content:'';position:absolute;left:8px;right:8px;bottom:-7px;height:14px;background:var(--kq-dv) center/240px 16px no-repeat,linear-gradient(90deg,transparent,#8a5e28 12%,#d9ac5c 50%,#8a5e28 88%,transparent) center/100% 1.4px no-repeat;pointer-events:none;z-index:1}
body.kq .win .wf{border-top:1px solid #0b0704;box-shadow:inset 0 1px 0 rgba(230,190,110,.22)}
body.kq .win .wh h2,body.kq .cch h2{font:700 .92rem/1 Cinzel,Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:var(--kq-gold2);text-shadow:0 1px 0 #000,0 2px 3px rgba(0,0,0,.8),0 0 12px rgba(230,170,80,.25);display:flex;align-items:center;gap:8px;white-space:nowrap}
body.kq .win .wh h2::before,body.kq .win .wh h2::after{content:'';flex:none;width:26px;height:10px;background:var(--kq-tf) center/contain no-repeat;opacity:.95}
body.kq .win .wh h2::after{transform:scaleX(-1)}
body.kq .wsub{color:var(--kq-mut);font-style:italic}
body.kq .win .wb{scrollbar-color:#7a5428 #140d08}
body.kq .win .wh .x{width:28px;height:28px;border-radius:50%;border:1px solid #6e4a22;background:radial-gradient(circle at 40% 35%,#4a3828,#1a120b 75%);color:#e9cf98;
 box-shadow:0 0 0 1px #000,inset 0 1px 0 rgba(255,220,160,.2),0 2px 4px rgba(0,0,0,.6);font-size:.8rem;text-shadow:0 1px 0 #000}
body.kq .win .wh .x:hover{background:radial-gradient(circle at 40% 35%,#8a2a1a,#3a0c06 75%);color:#ffe2c0;border-color:#e0703a}
body.kq .panel{background:rgba(0,0,0,.22);border:1px solid var(--kq-line);border-radius:3px}
body.kq ::-webkit-scrollbar{width:10px;height:10px}
body.kq ::-webkit-scrollbar-track{background:rgba(0,0,0,.35);border-left:1px solid rgba(230,190,110,.08)}
body.kq ::-webkit-scrollbar-thumb{background:linear-gradient(90deg,#5c3d1c,#9a6c34,#5c3d1c);border:2px solid rgba(0,0,0,.5);border-radius:6px}

/* ---------- type ---------- */
body.kq h2,body.kq h3{font-family:Cinzel,Georgia,serif;color:var(--kq-gold2);letter-spacing:.06em}
body.kq .sec,body.kq .setg,body.kq .hsec,body.kq .ceh{font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.14em;color:#c9a466;padding-bottom:3px;
 background:linear-gradient(90deg,rgba(201,154,69,.55),rgba(201,154,69,.15) 60%,transparent) left bottom/100% 1px no-repeat;border-bottom:0}
body.kq .setg{color:var(--kq-gold)}
body.kq .mut{color:var(--kq-mut)}
body.kq .gp{color:var(--kq-gold)}
body.kq .warn{color:var(--kq-bad)}
body.kq kbd{font-family:Cinzel,Georgia,serif;font-weight:700;opacity:.7;color:var(--kq-gold)}

/* ---------- buttons ---------- */
:where(body.kq) button{background:linear-gradient(180deg,#4a3520 0%,#2e2014 50%,#21170d 100%);border:1px solid #6e4e28;border-radius:3px;color:var(--kq-ink);
 box-shadow:inset 0 1px 0 rgba(255,225,160,.2),inset 0 -2px 0 rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.6);text-shadow:0 1px 0 rgba(0,0,0,.75);transition:background .15s,border-color .15s,box-shadow .15s,transform .1s}
:where(body.kq) button:hover:not(:disabled){background:linear-gradient(180deg,#5e4428 0%,#3c2a18 50%,#2a1d11 100%);border-color:#c99a4a;box-shadow:inset 0 1px 0 rgba(255,225,160,.28),inset 0 -2px 0 rgba(0,0,0,.35),0 0 8px rgba(230,170,80,.25)}
:where(body.kq) button:active:not(:disabled){box-shadow:inset 0 2px 5px rgba(0,0,0,.7)}
:where(body.kq) button:disabled{opacity:.5;filter:saturate(.4)}
body.kq button.pri,body.kq .win button.pri{background:linear-gradient(180deg,#f6dc94 0%,#d4a24c 42%,#a06c26 100%);border:1px solid #fbe3a2;color:#22160a;text-shadow:0 1px 0 rgba(255,240,200,.55);
 font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.05em;box-shadow:0 0 0 1px #3a240c,inset 0 1px 0 rgba(255,255,230,.6),inset 0 -2px 0 rgba(90,50,10,.45),0 2px 6px rgba(0,0,0,.6)}
body.kq button.pri:hover:not(:disabled){background:linear-gradient(180deg,#fff0b8 0%,#e4b45a 42%,#b07a2c 100%);box-shadow:0 0 0 1px #3a240c,inset 0 1px 0 rgba(255,255,230,.7),0 0 12px rgba(250,200,100,.45)}
body.kq button.pri:disabled{filter:grayscale(.75);opacity:.5}
body.kq button:focus-visible{outline:2px solid var(--kq-gold);outline-offset:2px}

/* ---------- tabs ---------- */
body.kq .win .tabs,body.kq .tabs{border-bottom:1px solid #0b0704;box-shadow:0 1px 0 rgba(230,190,110,.18);gap:2px}
body.kq .win .tabs button,body.kq .tabs button,body.kq #btabs button{position:relative;border:1px solid #3e2b17;border-bottom:0;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#2c1f13,#1a120b);color:var(--kq-mut);
 font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.05em;padding:6px 11px 5px;box-shadow:inset 0 1px 0 rgba(255,220,150,.1);outline:0;margin-bottom:-1px}
body.kq .win .tabs button:hover:not(:disabled),body.kq .tabs button:hover:not(:disabled){color:var(--kq-ink);background:linear-gradient(180deg,#3c2a18,#22170d)}
body.kq .win .tabs button.on,body.kq .tabs button.on,body.kq #btabs button.on{color:var(--kq-gold2);border-color:#8a6230;background:linear-gradient(180deg,#5a3e22,#2e2013 70%,#24180e);
 box-shadow:inset 0 1px 0 rgba(255,230,170,.3),0 -2px 8px rgba(230,170,80,.15);outline:0}
body.kq .win .tabs button.on::after,body.kq .tabs button.on::after{content:'';position:absolute;left:50%;bottom:-4px;width:7px;height:7px;transform:translateX(-50%) rotate(45deg);background:linear-gradient(135deg,#fbe6a6,#a8742c);border:1px solid #120b05}

/* ---------- rows ---------- */
body.kq .win .rw{border-bottom:0;background:linear-gradient(90deg,transparent,rgba(230,190,110,.14) 20%,rgba(230,190,110,.14) 80%,transparent) left bottom/100% 1px no-repeat}
body.kq .win .rw.it{border-left:3px solid var(--rc,transparent);box-shadow:inset 6px 0 10px -6px var(--rc,transparent)}
body.kq .win .rw:hover:not(:disabled){background:linear-gradient(90deg,rgba(230,170,80,.16),rgba(230,170,80,.04) 70%,transparent),linear-gradient(90deg,transparent,rgba(230,190,110,.14) 20%,rgba(230,190,110,.14) 80%,transparent) left bottom/100% 1px no-repeat}
body.kq .win .rw.on{background:linear-gradient(90deg,rgba(230,170,80,.28),rgba(230,170,80,.08) 75%,transparent);box-shadow:inset 0 0 0 1px rgba(230,190,110,.35)}
body.kq .win .rw.on.it{box-shadow:inset 0 0 0 1px rgba(230,190,110,.35),inset 6px 0 10px -6px var(--rc,transparent)}
body.kq .rn small,body.kq .dh small{color:var(--kq-mut)}
body.kq .ra em{color:var(--kq-gold)}
body.kq .kv,body.kq .mi,body.kq .df{border-bottom:0;background:linear-gradient(90deg,transparent,rgba(230,190,110,.12) 15%,rgba(230,190,110,.12) 85%,transparent) left bottom/100% 1px no-repeat}
body.kq details.grp{border:1px solid var(--kq-line);border-radius:3px;background:rgba(0,0,0,.2)}
body.kq details.grp>summary{font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.04em;color:var(--kq-ink2)}

/* ---------- cards, talents, tiles ---------- */
body.kq .card,body.kq .talc,body.kq .ctn,body.kq .skr,body.kq .dexC,body.kq .mpbox,body.kq .fdet,body.kq .ccc,body.kq .kqs-slot,body.kq .kqs-det{background:linear-gradient(180deg,rgba(60,42,26,.42),rgba(16,10,6,.55));border:1px solid #4a3420;border-radius:3px;box-shadow:inset 0 1px 0 rgba(255,220,150,.07),inset 0 0 14px rgba(0,0,0,.4)}
body.kq .talc{border-image:var(--kq-fs) 16 / 10px / 0 stretch}
body.kq .talh{font-family:Cinzel,Georgia,serif;color:var(--kq-gold2);letter-spacing:.06em}
body.kq .taln{background:linear-gradient(180deg,#2c1f13,#1a120b);border:1px solid #4a3420;border-radius:3px}
body.kq .taln.has{border-color:#a8742c;background:linear-gradient(180deg,#4a3218,#24180c)}
body.kq .taln.mx{border-color:#f0cc72;box-shadow:0 0 8px rgba(240,204,114,.3),inset 0 0 8px rgba(240,204,114,.15)}
body.kq .taln.on{outline:2px solid var(--kq-gold);outline-offset:-1px}
body.kq .ctn.on,body.kq .kqs-slot.on,body.kq .ccc.on{border-color:var(--cc,#c99a45);box-shadow:0 0 0 1px var(--cc,#c99a45) inset,0 0 10px rgba(230,170,80,.2)}
body.kq .mod,body.kq .kqs-tag,body.kq .kqs-stats span,body.kq .kqs-req span{border-radius:2px}
body.kq .mod{background:rgba(201,154,69,.14);border-color:rgba(201,154,69,.45)}
body.kq .tpn{background:linear-gradient(180deg,#6a4a20,#3a280e)!important;border-color:#f0cc72!important;color:#ffe9a8}

/* ---------- inventory / shop slots (zzM_menus.js) ---------- */
body.kq .kqm-slot,body.kq .ico,body.kq .bpc{background:radial-gradient(circle at 50% 38%,#3a2a1c,#120c08 78%);border:1px solid var(--rc,#5a3e1e);border-radius:2px;
 box-shadow:inset 0 0 0 1px rgba(0,0,0,.85),inset 0 0 14px -2px var(--rc,rgba(0,0,0,.9)),0 1px 0 rgba(255,220,150,.06)}
body.kq .kqm-slot:not(.kqm-empty):hover{box-shadow:inset 0 0 0 1px rgba(0,0,0,.85),inset 0 0 16px -2px var(--rc,rgba(230,170,80,.5)),0 0 8px rgba(230,170,80,.35);border-color:var(--rc,#c99a4a)}
body.kq .kqm-cell.kqm-sel .kqm-slot::after{content:'';width:13px;height:13px;-webkit-mask:${typeof kqUrl=='function'?kqUrl('check'):'none'} center/contain no-repeat;mask:${typeof kqUrl=='function'?kqUrl('check'):'none'} center/contain no-repeat;background:linear-gradient(#e8ffb0,#5aa830)}
body.kq .kqm-slot.kqm-empty{background:radial-gradient(circle at 50% 40%,#21170e,#0d0805 80%);border:1px dashed #3a2a18}
body.kq .kqm-tip,body.kq #mhint,body.kq .kqtip{background:var(--kq-grain),linear-gradient(180deg,rgba(40,28,18,.98),rgba(16,11,7,.98));background-size:160px 160px,auto;
 border:1px solid transparent;border-image:var(--kq-fs) 16 / 11px / 3px stretch;border-radius:2px;box-shadow:0 8px 24px rgba(0,0,0,.75);color:var(--kq-ink)}
body.kq .kqm-tip .kqm-tn,body.kq #mhint b{font-family:Cinzel,Georgia,serif}

/* ---------- inputs ---------- */
:where(body.kq) select,:where(body.kq) input[type=text],:where(body.kq) input[type=number],:where(body.kq) input:not([type]),body.kq .ccf input,body.kq #mpChatIn,body.kq .mpq input{
 background:linear-gradient(180deg,#0e0905,#1c140c);color:var(--kq-ink);border:1px solid #5a3e1e;border-radius:2px;box-shadow:inset 0 2px 4px rgba(0,0,0,.7),0 1px 0 rgba(255,220,150,.08)}
:where(body.kq) select{appearance:none;-webkit-appearance:none;padding-right:26px;background:${AR} right 8px center/11px 8px no-repeat,linear-gradient(180deg,#2c1f13,#1a120b)}
:where(body.kq) select:focus,:where(body.kq) input:focus{outline:1px solid var(--kq-gold);border-color:#c99a4a}
body.kq option{background:#1c140c;color:var(--kq-ink)}
body.kq input[type=checkbox]{appearance:none;-webkit-appearance:none;width:17px;height:17px;flex:none;margin:0;border:1px solid #8a6230;border-radius:2px;background:linear-gradient(180deg,#0e0905,#241a10);box-shadow:inset 0 1px 3px rgba(0,0,0,.8);cursor:pointer;vertical-align:middle}
body.kq input[type=checkbox]:checked{background:${CK} center/13px no-repeat,linear-gradient(180deg,#f6dc94,#b07a2c);border-color:#fbe3a2}
body.kq input[type=range]{-webkit-appearance:none;appearance:none;height:16px;background:transparent;accent-color:var(--kq-gold)}
body.kq input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(180deg,#0b0704,#2a1c10);border:1px solid #5a3e1e;box-shadow:inset 0 1px 2px #000}
body.kq input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;margin-top:-6px;transform:rotate(45deg);border:1px solid #120b05;border-radius:2px;background:linear-gradient(135deg,#fbe6a6,#c8963e 55%,#6e4518);box-shadow:0 1px 3px #000}
body.kq input[type=range]::-moz-range-track{height:6px;border-radius:3px;background:#1a110a;border:1px solid #5a3e1e}
body.kq input[type=range]::-moz-range-thumb{width:13px;height:13px;border:1px solid #120b05;border-radius:2px;background:linear-gradient(135deg,#fbe6a6,#c8963e 55%,#6e4518)}

/* ---------- bars ---------- */
body.kq .meter,body.kq .cbar .chp,body.kq .xpbar,body.kq .hpm,body.kq .cebar,body.kq .bar,body.kq #resb .rbar,body.kq .sbr i{background:linear-gradient(180deg,#050302,#1a120b);border:1px solid #4c3418;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.6),inset 0 1px 3px rgba(0,0,0,.9)}
body.kq .meter i,body.kq .xpbar i,body.kq .cbar .chp i,body.kq .hpm i,body.kq .cebar i{border-radius:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -2px 0 rgba(0,0,0,.25)}
body.kq .meter span,body.kq .xpbar span,body.kq .cbar .chp span{font-weight:800;color:#fbf2dc;text-shadow:0 1px 0 #000,0 0 3px #000}
body.kq .xpbar{height:12px;margin-top:5px}
body.kq .xpbar i{background:linear-gradient(180deg,#d8b4ff,#8a52d8 55%,#5a2ca0)}
body.kq .xpbar span{line-height:11px;font-size:.58rem;letter-spacing:.06em;background:repeating-linear-gradient(90deg,transparent 0 calc(10% - 1px),rgba(0,0,0,.55) calc(10% - 1px) 10%)}
body.kq .tgm i,body.kq .meter.tgm i{background:linear-gradient(180deg,#ff7a5a,#b8261a 55%,#6a0e08)}
body.kq .meter.boss{height:14px}
body.kq .meter.boss i{background:linear-gradient(180deg,#ff6a4a,#a8180e 50%,#4a0604)}
body.kq .cbar .chp i{background:linear-gradient(180deg,#9af07a,#3a9a2a 55%,#1c5a14)}

/* ---------- HUD ---------- */
body.kq #hot{position:relative;padding:7px 8px}
body.kq #hot::before,body.kq #hot::after{content:'';position:absolute;top:50%;width:14px;height:22px;margin-top:-11px;background:linear-gradient(135deg,#fbe6a6,#c8963e 55%,#6e4518);clip-path:polygon(0 50%,100% 0,70% 50%,100% 100%);filter:drop-shadow(0 1px 0 #000);pointer-events:none}
body.kq #hot::before{left:-12px}body.kq #hot::after{right:-12px;transform:scaleX(-1)}
body.kq .hs{background:radial-gradient(circle at 50% 36%,#3e2c1c,#120c07 76%);border:1px solid transparent;border-radius:2px;border-image:var(--kq-ft) 10 / 7px / 0 stretch;box-shadow:inset 0 0 12px rgba(0,0,0,.9)}
body.kq .hs:hover:not(:disabled){background:radial-gradient(circle at 50% 36%,#5a4026,#1c130b 76%);box-shadow:inset 0 0 12px rgba(0,0,0,.8),0 0 10px rgba(230,170,80,.35)}
body.kq .hs .kb{font:700 .58rem/1 Cinzel,Georgia,serif;color:#d9b878;left:6px;top:5px;text-shadow:0 1px 0 #000}
body.kq .hs .sb{color:var(--kq-gold2);font-weight:800;right:6px;bottom:4px;text-shadow:0 1px 0 #000,0 0 3px #000}
body.kq .hs .cdv{background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.8));box-shadow:inset 0 1px 0 rgba(230,190,110,.5)}
body.kq .hs:disabled{opacity:1}
body.kq .hs:disabled .ic{opacity:.55}
body.kq #pwrB{background:var(--kq-grain),linear-gradient(180deg,#2c1f13,#140d08);background-size:160px,auto;border:1px solid transparent;border-image:var(--kq-ft) 10 / 7px / 0 stretch;border-radius:2px;color:#c9a466;font-family:Cinzel,Georgia,serif}
body.kq #pwrB b{color:var(--kq-gold2);text-shadow:0 1px 0 #000}
body.kq .orb{border:3px solid #24170c;box-shadow:0 0 0 1px #000,0 0 0 3px #a8742c,0 0 0 4px #3a240c,0 0 0 6px #6e4a22,0 0 0 7px #0b0704,0 6px 16px rgba(0,0,0,.8),inset 0 0 20px #000}
body.kq .orb span{font-family:Cinzel,Georgia,serif;color:#fff4dc}
body.kq #chInfo{border-image:var(--kq-fs) 16 / 10px / 2px stretch;font-family:Cinzel,Georgia,serif;letter-spacing:.03em;color:var(--kq-ink)}
body.kq #chInfo #goldT{color:var(--kq-gold2)}
body.kq .bf{background:linear-gradient(180deg,#3a2816,#1a110a);border:1px solid #6e4a22;border-radius:2px;color:var(--kq-gold2);box-shadow:inset 0 1px 0 rgba(255,220,150,.15),0 1px 2px rgba(0,0,0,.6);text-shadow:0 1px 0 #000}
body.kq .bf.fd{border-color:#b86a2a;color:#ffd0a0}body.kq .bf.ex{border-color:#7a5ab8;color:#dccaff}
body.kq #locBox{padding:6px 26px;font:700 .8rem/1.1 Cinzel,Georgia,serif;letter-spacing:.08em;color:var(--kq-gold2);text-shadow:0 1px 0 #000,0 0 10px rgba(230,170,80,.25);border-image:var(--kq-fs) 16 / 11px / 2px stretch}
body.kq .cbar{position:relative;border-radius:2px}
body.kq .cbar .cpic{border:2px solid #c8963e;box-shadow:0 0 0 1px #000,0 0 0 3px #4c3014,0 0 0 4px #0b0704,inset 0 0 10px #000;background:radial-gradient(circle at 50% 35%,#3e3226,#120d08)}
body.kq .cbar .cnm{font-family:Cinzel,Georgia,serif;letter-spacing:.03em;color:var(--kq-ink)}
body.kq .cbar button{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a3828,#170f09 75%);border:1px solid #8a6230;box-shadow:0 0 0 1px #000,inset 0 1px 0 rgba(255,220,160,.2)}
body.kq .cbar button.on{background:radial-gradient(circle at 40% 35%,#f6c860,#9a5a12 75%);border-color:#fde38a}
body.kq .cbar.emp{box-shadow:0 0 0 1px #fbbf24,0 0 14px rgba(251,191,36,.4),inset 0 0 18px rgba(0,0,0,.55)}
body.kq #tgt .tgpw{border:2px solid #c8963e;box-shadow:0 0 0 1px #000,0 0 0 3px #4c3014,0 0 0 4px #0b0704,inset 0 0 12px #000}
body.kq #tgt.al .tgpw{border-color:#c06ae8}body.kq #tgt.bs .tgpw{border-color:#e85a3a}
body.kq .tgn b,body.kq #bossN{font-family:Cinzel,Georgia,serif;letter-spacing:.04em;color:var(--kq-ink)}
body.kq #boss{border-image:var(--kq-fs) 16 / 11px / 2px stretch;background:var(--kq-grain),linear-gradient(180deg,rgba(60,16,10,.94),rgba(22,8,6,.95));background-size:160px,auto}
body.kq #bossN{color:#ffcfb8;text-shadow:0 1px 0 #000,0 0 10px rgba(220,60,30,.4)}
body.kq #mini{border:2px solid #24170c;border-radius:3px;box-shadow:0 0 0 1px #000,0 0 0 3px #a8742c,0 0 0 4px #2a1a0a,0 0 0 5px #6e4a22,0 0 0 6px #0b0704,0 6px 16px rgba(0,0,0,.7)}
body.kq .ib{border-radius:2px;color:var(--kq-gold2);font-size:1.25rem}
body.kq #sysmenu{gap:1px;padding:10px 8px}
body.kq #sysmenu button{border:1px solid transparent;border-radius:2px;background:transparent;box-shadow:none;font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.03em;color:var(--kq-ink)}
body.kq #sysmenu button:hover:not(:disabled){background:linear-gradient(90deg,rgba(230,170,80,.25),rgba(230,170,80,.04));border-color:rgba(230,190,110,.25)}
body.kq #prompt{padding:9px 22px;font-size:.86rem}
body.kq #glog div{padding:1px 8px 1px 7px;background:linear-gradient(90deg,rgba(14,9,5,.62),rgba(14,9,5,.3) 70%,transparent);border-left:2px solid rgba(201,154,69,.65);width:fit-content;max-width:100%}
body.kq .pku .pt{font-family:Cinzel,Georgia,serif;letter-spacing:.03em}
body.kq .bnr .b1{background:none;color:#f6dc98;text-shadow:0 2px 0 #2a1606,0 0 20px rgba(230,150,50,.55),0 4px 10px #000}
body.kq .bnr .b2{font-family:Cinzel,Georgia,serif;letter-spacing:.06em;color:#fbefd6;padding-top:14px;background:var(--kq-dv) center top/240px 16px no-repeat}
body.kq .bnr .b3{color:#cfe8b0}
body.kq #btrk,body.kq #evtk{font-size:.72rem}
body.kq #evtk{border-left-width:1px}
body.kq #instQ h3{font-family:Cinzel,Georgia,serif;color:var(--kq-gold2)}
body.kq #resb .rt{font-family:Cinzel,Georgia,serif}
body.kq #mpBtnH{background:linear-gradient(180deg,#3a2816,#1a110a);border:1px solid #8a6230;color:var(--kq-gold2);font-family:Cinzel,Georgia,serif;border-radius:2px}
body.kq #mpToast{background:linear-gradient(180deg,#2c1f13,#140d08);border:1px solid transparent;border-image:var(--kq-fs) 16 / 11px / 2px stretch;border-radius:2px;color:var(--kq-ink);font-family:Inter,sans-serif}
body.kq .lpbox,body.kq .setbox,body.kq #cheatBox,body.kq .rempty{border-radius:3px}
body.kq .shb{border-radius:2px;font-family:Cinzel,Georgia,serif}
body.kq .sellbar{background:linear-gradient(180deg,rgba(40,28,17,.98),rgba(20,13,8,.98));border-top:1px solid #6e4a22}

body.kq #wmc{border:1px solid #6e4a22!important;box-shadow:0 0 0 1px #000,0 0 0 4px rgba(0,0,0,.35),0 6px 18px rgba(0,0,0,.6);border-radius:2px!important}
body.kq .pvbox{border:1px solid #4c3418;box-shadow:inset 0 0 30px rgba(0,0,0,.75),0 0 0 1px #000;border-radius:2px}
/* ---------- start / device / continue screens ---------- */
body.kq #start,body.kq #devp,body.kq #svp{background:var(--kq-grain),radial-gradient(ellipse at 50% 40%,rgba(60,36,18,.6),rgba(6,4,2,.97) 70%);background-size:160px,auto}
body.kq #devp h2,body.kq #svp h2{font-size:1.6rem;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 2px 0 #000,0 0 16px rgba(230,170,80,.3)}
body.kq #devp .devb button,body.kq #svp .devb button:not(.pri){border:1px solid transparent;border-image:var(--kq-fs) 16 / 11px / 0 stretch;font-family:Cinzel,Georgia,serif;font-weight:700;letter-spacing:.06em}
body.kq #devp .devb button small{font-family:Inter,sans-serif;letter-spacing:0}
body.kq .ccl{border-right-color:var(--kq-line)}body.kq .ccr{border-left-color:var(--kq-line)}
body.kq .ccm{background:radial-gradient(circle at 50% 58%,#3d2e1f,#0e0a07 70%);box-shadow:inset 0 0 40px #000}
body.kq .ccst span.on{color:var(--kq-gold2);font-family:Cinzel,Georgia,serif}

/* ---------- title + death screens: gilded frames on their menus ---------- */
body.kq #awT .awm button{border:1px solid transparent;border-image:var(--kq-fs) 16 / 11px / 0 stretch;border-radius:0;background:var(--kq-grain),linear-gradient(180deg,rgba(48,24,12,.88),rgba(18,8,4,.92));background-size:160px,auto}
body.kq #awT .awm button:hover,body.kq #awT .awm button:focus-visible{background:var(--kq-grain),linear-gradient(180deg,rgba(124,52,20,.9),rgba(40,14,6,.94));background-size:160px,auto}
body.kq #dth button{border:1px solid transparent;border-image:var(--kq-fs) 16 / 11px / 0 stretch;border-radius:0}

/* ---------- small screens / mobile ---------- */
@media (max-width:620px){body.kq .glass:not([id=topl]){border-image-width:9px}body.kq .win{border-image-width:16px;border-image-outset:4px}}
body.kq.mob .win{border-image-width:16px;border-image-outset:3px}
body.kq.mob .glass:not([id=topl]){border-image-width:9px}
body.kq.mob .hs{border-image-width:5px}
body.kq.mob .win .tabs button,body.kq.mob .tabs button{padding:5px 8px 4px;font-size:.7rem;letter-spacing:.02em}
body.kq.mob .win .wh h2::before,body.kq.mob .win .wh h2::after{display:none}
body.kq.mob #mbtn button{background:radial-gradient(circle at 40% 35%,rgba(74,56,40,.85),rgba(20,13,8,.85) 75%);border:2px solid #a8742c;box-shadow:0 0 0 1px #000,0 0 0 3px rgba(60,38,14,.8),inset 0 1px 0 rgba(255,220,160,.2);color:var(--kq-gold2)}
body.kq.mob #mbtn button.on{background:radial-gradient(circle at 40% 35%,#f6c860,#9a5a12 75%)}
body.kq.mob #joy{background:radial-gradient(circle,rgba(10,6,3,.2),rgba(10,6,3,.5));border:2px solid #a8742c;box-shadow:0 0 0 1px #000,0 0 0 4px rgba(60,38,14,.5),inset 0 0 18px rgba(0,0,0,.6)}
body.kq.mob #joy i{background:radial-gradient(circle at 35% 30%,#fbe6a6,#c8963e 50%,#6e4518);box-shadow:0 0 0 1px #120b05,0 2px 8px #000a}
`;
const st=document.createElement('style');st.id='kqUiCss';st.textContent=css;document.head.appendChild(st);
document.body.classList.add('kq');
// keep the theme last in <head> so it wins ties with styles other modules add later
const keepLast=()=>{if(document.head.lastElementChild!==st)document.head.appendChild(st)};
new MutationObserver(keepLast).observe(document.head,{childList:true});
setTimeout(keepLast,0);addEventListener('load',keepLast);
})();
