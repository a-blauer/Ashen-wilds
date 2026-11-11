// ================= v220 menus: a second pass, leaning into the fantasy =================
// Owner (Nov 11 2026): "improve our ui menus and do a second pass on them to make sure their UX is cleanly and optimally
// displayed and easy to navigate. Our ui menus are also a little barbones so I want you to lean into the fantasy elements."
// Styling only (no window's contents or behaviour change), on top of the v88 theme (1080):
//  - every window: a gold gem set into the top of the frame, a faint arcane seal worked into the leather, a soft candle glow
//    under the title, and the title's rule drawn longer;
//  - lists in the shared window (#xw: shops, the Steward, portals, stations): each entry is its own inset plate with a gold
//    edge that lights when pointed at, so it is clear what one click covers; section headings carry a ❖ mark;
//  - easier to use: the close button is larger (and larger still on touch screens); the footer hint
//    text reads as a scribe's note; the keyboard focus ring is a clear gold line; scroll areas keep a little space at the end.
// Each player styles their own windows: nothing here is shared in co-op.
document.head.insertAdjacentHTML('beforeend',`<style>
:root{--im220-seal:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none' stroke='%23e8c36a' stroke-width='1.1'%3E%3Ccircle cx='100' cy='100' r='96'/%3E%3Ccircle cx='100' cy='100' r='84' stroke-dasharray='2 5'/%3E%3Ccircle cx='100' cy='100' r='58'/%3E%3Cpath d='M100 4 L156 180 L10 70 L190 70 L44 180 Z'/%3E%3Cpath d='M100 42 L158 100 L100 158 L42 100 Z'/%3E%3Ccircle cx='100' cy='100' r='14'/%3E%3Cpath d='M100 4v24M100 172v24M4 100h24M172 100h24'/%3E%3C/svg%3E")}
body.kq .win{background:var(--im220-seal) right -70px bottom -70px/300px 300px no-repeat,radial-gradient(ellipse 60% 90px at 50% 0,rgba(255,196,110,.13),transparent 70%),var(--kq-grain),var(--kq-leath),radial-gradient(ellipse 120% 70% at 50% 0%,rgba(150,100,50,.16),transparent 60%),linear-gradient(180deg,#271a10 0%,#1b120b 55%,#130c07 100%);
  background-size:300px 300px,auto,160px 160px,260px 260px,auto,auto;background-blend-mode:soft-light,normal,normal,normal,normal,normal}
body.kq .modal.w>.win::before{content:'';position:absolute;top:-13px;left:50%;width:18px;height:18px;transform:translateX(-50%) rotate(45deg);z-index:4;pointer-events:none;
  background:radial-gradient(circle at 35% 35%,#fff3c8,#e0b050 45%,#7a4e18 100%);border:1px solid #120b05;box-shadow:0 0 0 2px #8a6230,0 0 0 3px #120b05,0 0 14px rgba(240,190,90,.55)}
#xw.dlg220>.win::before{display:none}
body.kq .win .wh .x{width:32px;height:32px}
body.kq.mob .win .wh .x{width:38px;height:38px;font-size:.95rem}
body.kq .win .wf .mut,body.kq .win .wf .dtl{font-style:italic}
body.kq .win .wb{padding-bottom:16px}
body.kq .win button:focus-visible,body.kq .win .rw:focus-visible{outline:2px solid #f0d48a;outline-offset:1px}
body.kq .win .sec::before,body.kq .win .setg::before{content:'❖';margin-right:7px;font-size:.62em;color:#e0b660;vertical-align:1px}
/* list entries in the shared window: inset plates */
body.kq #xw:not(.dlg220) .wb .rw{margin:0 0 5px;padding:7px 10px;border:1px solid rgba(138,98,48,.38);border-radius:3px;
  background:linear-gradient(180deg,rgba(255,220,150,.05),rgba(0,0,0,.16));box-shadow:inset 0 1px 0 rgba(255,225,160,.06),0 1px 2px rgba(0,0,0,.35);transition:border-color .12s,background .12s,box-shadow .12s}
body.kq #xw:not(.dlg220) .wb .rw:hover:not(:disabled){border-color:#c99a4a;background:linear-gradient(180deg,rgba(240,180,90,.14),rgba(0,0,0,.14));box-shadow:inset 0 1px 0 rgba(255,225,160,.12),0 0 10px rgba(230,170,80,.18)}
body.kq #xw:not(.dlg220) .wb .rw.on{border-color:#f0d48a;background:linear-gradient(180deg,rgba(240,190,100,.22),rgba(60,36,10,.2));box-shadow:inset 0 0 0 1px rgba(240,212,138,.3),0 0 12px rgba(230,170,80,.22)}
</style>`);
