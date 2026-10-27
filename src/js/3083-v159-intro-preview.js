// ================= v159: the intro preview page (owner's request) =================
// A separate private page (tools/build_preview.sh → dist/preview/) where the owner plays and scrubs the intro on his own
// computer instead of waiting for a video render. Everything here runs only when the page sets window.KQ_PREVIEW; the
// game itself never runs it. It makes a hero (the class and companion picked in the panel), builds the whole intro in
// capture mode (ic151Cap: part one is a pure function of t, the town part drives the real game scene) and draws the
// frame for the current time. Controls: Space play/pause, ←/→ one frame (Shift: 1 s), [ ] previous/next shot,
// L loop the shot, M sound, H hide the panel. "Copy time" copies the time and shot name, to send in a message.
var KQPV = { on: false, t: 0, play: false, spd: 1, loop: false, snd: false, buf: null, src: null, ac: null, ex: null, tok: 0, drag: false, a0: null };
// part one's shots (times as in 3080's camera); the town's come from IC151D so they follow any retiming there
function kqpvShots() {
  const D = IC151D, P = [[0, 'Treeline: the rat'], [15, 'The forest shakes'], [17.4, 'Low by the rat'], [19.6, 'Across the meadow'], [21, 'The cave-in'],
    [22.6, 'The rat flees'], [25.45, 'Clinging on'], [29.6, 'The fall'], [35, 'The core'], [47.6, 'The change'], [51.9, 'The upright']];
  const N = ['Steward', 'Innkeeper', 'Blacksmith', 'Merchant'];
  P.push([D.arr[0], 'Duskhold: arrival']);
  D.walks.slice(0, 4).forEach((w, i) => { P.push([w[0], 'Walk to the ' + N[i]]); P.push([D.meets[i][0], 'The ' + N[i]]) });
  P.push([D.walks[4][0], 'Walk to Cheddar'], [D.ched[0], 'Cheddar'], [D.walks[5][0], 'Through the gate'], [D.walks[6][0], 'Down Portal Road'],
    [D.v1[0], 'Voice: greetings'], [D.v2[0], 'Voice: rebuild']);
  for (let i = 0; i < 6; i++) P.push([D.v3 + i * D.v3d, 'Portal ' + (i + 1)]);
  P.push([D.v4[0], 'Voice: claim the essence'], [D.v5[0], 'Voice: the bounty'], [D.v6[0], 'Go forth']);
  return P.sort((a, b) => a[0] - b[0])
}
function kqpvEnd() { return IC151.dEnd - .01 }   // never reach the hand-back to the game
function kqpvShot(t) { const P = KQPV.shots; let i = 0; while (i + 1 < P.length && t >= P[i + 1][0] - 1e-6) i++; return i }
function kqpvFmt(t) { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2) }
function kqpvGet() { try { return JSON.parse(localStorage.getItem('kqpv') || '{}') || {} } catch (_) { return {} } }
function kqpvPut(o) { try { localStorage.setItem('kqpv', JSON.stringify(Object.assign(kqpvGet(), o))) } catch (_) {} }

// the town part runs the real game (companions follow, smoke drifts): a jump there replays it without drawing, from the
// cut (or from the last exact time when moving forward), so the frame matches what the video and the game show
function kqpvFols(save) {
  try {
    if (save) KQPV.fs = (typeof fols != 'undefined' ? fols : []).map(f => f ? [f, f.position.clone(), f.rotation.y] : null);
    else (KQPV.fs || []).forEach(x => { if (x) { x[0].position.copy(x[1]); x[0].rotation.y = x[2] } })
  } catch (_) {}
}
function kqpvGo(t, exact) {
  t = Math.max(0, Math.min(kqpvEnd(), t)); KQPV.t = t; const S = IC151.S; if (!S) return;
  const tok = ++KQPV.tok;
  if (t < IC151.cut || !exact) {   // a direct seek (part one, or dragging): the town keeps its state, good enough close to the last exact time
    ic151Seek(t); KQPV.ex = t >= IC151.cut && KQPV.ex != null && Math.abs(t - KQPV.ex) < .5 ? t : null; kqpvUi(); return }
  // exact town frame: replay
  const f = 24, k1 = Math.floor(t * f);
  let k = Math.ceil(IC151.cut * f);
  if (KQPV.ex != null && KQPV.ex <= t) k = Math.ceil(KQPV.ex * f) + 1;
  else { kqpvFols(false); if (S.D) S.D.lt = null }
  const k0 = k, n = Math.max(1, k1 - k0);
  const step = () => {
    if (tok !== KQPV.tok) { IC151.noDraw = 0; return }
    const t0 = performance.now(); IC151.noDraw = 1;
    try { while (k < k1 && performance.now() - t0 < 24) ic151Seek(k++ / f) } finally { IC151.noDraw = 0 }
    if (k < k1) { kqpvBusy('Catching up the town… ' + Math.round((k - k0) / n * 100) + '%'); requestAnimationFrame(step); return }
    kqpvBusy(''); ic151Seek(t); KQPV.ex = t; kqpvUi()
  };
  step()
}

// sound: the whole score rendered once (the same score the game plays), then played from the current time
async function kqpvSound() {
  if (KQPV.buf || KQPV.mk) return; KQPV.mk = 1; kqpvBusy('Preparing the sound…');
  try {
    const sr = 44100, ac = new OfflineAudioContext(2, Math.ceil(sr * (IC151.len + .5)), sr), out = ac.createGain(), cp = ac.createDynamicsCompressor();
    out.gain.value = .9; out.connect(cp); cp.connect(ac.destination); ic151Score(ac, out, 0); KQPV.buf = await ac.startRendering()
  } catch (e) { console.warn('preview sound', e); KQPV.sndErr = String(e) }
  KQPV.mk = 0; kqpvBusy(''); kqpvAudio()
}
function kqpvAudio() {
  try { if (KQPV.src) { KQPV.src.onended = null; KQPV.src.stop() } } catch (_) {} KQPV.src = null;
  if (!KQPV.snd || !KQPV.play || !KQPV.buf || !KQPV.ac) return;
  const s = KQPV.ac.createBufferSource(); s.buffer = KQPV.buf; s.playbackRate.value = KQPV.spd; s.connect(KQPV.ac.destination);
  try { s.start(0, Math.min(KQPV.t, KQPV.buf.duration - .01)) } catch (_) { return } KQPV.src = s
}

function kqpvPlay(on) {
  KQPV.play = on == null ? !KQPV.play : on; KQPV.a0 = null;
  if (KQPV.play && KQPV.t >= kqpvEnd() - .02) kqpvGo(0, true);
  if (KQPV.play && KQPV.t >= IC151.cut && KQPV.ex == null) kqpvGo(KQPV.t, true);   // start from an exact town state
  kqpvAudio(); kqpvUi()
}
function kqpvLoop(now) {
  requestAnimationFrame(kqpvLoop);
  if (!KQPV.play || KQPV.drag || KQPV.busy) { KQPV.a0 = null; return }
  if (KQPV.a0 == null || KQPV.at !== KQPV.t) { KQPV.a0 = now; KQPV.aT = KQPV.t }   // (re)anchor after a jump, a pause or a speed change
  // the film keeps real time, like the game: a slow frame skips ahead instead of slowing the film (and the sound) down
  let t = KQPV.aT + (now - KQPV.a0) / 1000 * KQPV.spd; const P = KQPV.shots, i = kqpvShot(KQPV.t);
  if (KQPV.loop) { const a = P[i][0], b = i + 1 < P.length ? P[i + 1][0] : kqpvEnd(); if (t >= b) { kqpvGo(a, true); kqpvAudio(); return } }
  if (t >= kqpvEnd()) { kqpvGo(kqpvEnd(), false); kqpvPlay(false); return }
  const t0 = KQPV.t; KQPV.t = t;
  if (t0 < IC151.cut && t >= IC151.cut) { kqpvFols(false); if (IC151.S.D) IC151.S.D.lt = null; KQPV.ex = t }   // into the town from its start
  ic151Seek(t); if (t >= IC151.cut && KQPV.ex != null) KQPV.ex = t; KQPV.at = t; kqpvUi()
}

// ---------------- the panel ----------------
function kqpvCss() {
  const s = document.createElement('style'); s.id = 'kqpvcss'; s.textContent = `
#ic151{cursor:default!important}
#kqpv{position:fixed;left:max(12px,env(safe-area-inset-left,0px));right:max(12px,env(safe-area-inset-right,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:2147483600;
  background:rgba(14,11,9,.86);border:1px solid rgba(236,200,130,.22);border-radius:10px;padding:10px 12px 12px;color:#eadfc6;font:13px/1.35 Inter,system-ui,sans-serif;
  box-shadow:0 10px 30px rgba(0,0,0,.55);backdrop-filter:blur(6px);user-select:none}
#kqpv.hid{display:none}
#kqpv .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#kqpv .now{font:600 15px/1.2 Cinzel,Georgia,serif;letter-spacing:.04em;color:#f0cc72;min-width:0;flex:1}
#kqpv .now small{font:12px Inter,system-ui,sans-serif;color:#a39378;letter-spacing:0;margin-left:8px}
#kqpv .tc{font:20px VT323,ui-monospace,monospace;color:#eadfc6;letter-spacing:.04em}
#kqpv button,#kqpv select{background:rgba(34,26,18,.95);color:#eadfc6;border:1px solid rgba(236,200,130,.25);border-radius:6px;font:600 12px/1 Inter,system-ui,sans-serif;padding:7px 10px;cursor:pointer}
#kqpv button:hover{border-color:#c9a24a;color:#f0cc72}#kqpv button.on{background:#c9a24a;color:#1a120a;border-color:#f0cc72}
#kqpv button.big{font-size:15px;padding:7px 14px;min-width:46px}
#kqpv label{color:#a39378;font-size:12px;display:flex;align-items:center;gap:5px}
#kqpv .tl{position:relative;height:34px;margin:10px 0 8px;cursor:pointer;touch-action:none}
#kqpv .tl .seg{position:absolute;top:8px;height:18px;border-right:1px solid rgba(14,11,9,.9);background:rgba(201,162,74,.18)}
#kqpv .tl .seg.p2{background:rgba(120,150,200,.18)}#kqpv .tl .seg.cur{background:rgba(240,204,114,.45)}
#kqpv .tl .seg:hover{background:rgba(240,204,114,.32)}
#kqpv .tl .cut{position:absolute;top:2px;bottom:2px;width:2px;background:#eadfc6;opacity:.7}
#kqpv .tl .cut i{position:absolute;bottom:100%;left:4px;white-space:nowrap;font:10px Inter,system-ui,sans-serif;color:#a39378;font-style:normal;transform:translateY(10px)}
#kqpv .tl .ph{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 6px #f0cc72;pointer-events:none}
#kqpv .tl .tip{position:absolute;bottom:100%;transform:translateX(-50%);background:#000;color:#eadfc6;padding:3px 6px;border-radius:4px;font-size:11px;white-space:nowrap;pointer-events:none;display:none}
#kqpv .msg{color:#f0cc72;font-size:12px}#kqpv .err{color:#ff8a7a;font:11px ui-monospace,monospace;white-space:pre-wrap;max-height:5em;overflow:auto}
#kqpv .help{color:#a39378;font-size:11px}
#kqpvB{position:fixed;inset:0;z-index:2147483500;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:#07060a;color:#f0cc72;font:600 20px Cinzel,Georgia,serif;letter-spacing:.06em}
#kqpvB small{font:13px Inter,system-ui,sans-serif;color:#a39378;letter-spacing:0}
#kqpvShow{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147483600;display:none;background:rgba(14,11,9,.7);color:#eadfc6;border:1px solid rgba(236,200,130,.25);border-radius:6px;font:600 12px Inter,system-ui,sans-serif;padding:7px 10px;cursor:pointer}
@media (max-width:700px){#kqpv .help{display:none}#kqpv .now{flex-basis:100%}}`;
  document.head.appendChild(s)
}
function kqpvPanel() {
  const el = document.createElement('div'); el.id = 'kqpv';
  const C = (typeof CLSK != 'undefined' ? CLSK : ['warrior']).map(k => `<option value="${k}">${(CLS[k] && CLS[k].n) || k}</option>`).join('');
  const PO = (typeof STARTERS != 'undefined' ? STARTERS : ['Foxlet']).map(k => `<option value="${k}">${k}</option>`).join('');
  el.innerHTML = `<div class="row"><div class="now"><span class="sn"></span><small class="sk"></small></div><span class="tc"></span></div>
<div class="tl"><div class="tip"></div><div class="ph"></div></div>
<div class="row">
 <button class="b-ps" title="Previous shot ( [ )">‹ Shot</button><button class="b-s1" title="Back 1 s (Shift+←)">−1s</button><button class="b-f1" title="Back 1 frame (←)">◀︎</button>
 <button class="big b-pl" title="Play / pause (Space)">▶︎</button>
 <button class="b-f2" title="Forward 1 frame (→)">▶︎|</button><button class="b-s2" title="Forward 1 s (Shift+→)">+1s</button><button class="b-ns" title="Next shot ( ] )">Shot ›</button>
 <label>Speed <select class="b-sp"><option value=".25">¼×</option><option value=".5">½×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>
 <button class="b-lp" title="Play the current shot over and over (L)">Loop shot</button>
 <button class="b-snd" title="Sound on / off (M)">Sound off</button>
 <button class="b-cp" title="Copy the time and shot name">Copy time</button>
 <span style="flex:1"></span>
 <label>Hero <select class="b-cls">${C}</select></label><label>Companion <select class="b-com">${PO}</select></label>
 <button class="b-hd" title="Hide this panel (H)">Hide</button>
</div>
<div class="row"><span class="msg"></span><span class="help">Space play · ←/→ frame (Shift: 1 s) · [ ] shot · L loop · M sound · H hide</span></div>
<div class="err"></div>`;
  document.body.appendChild(el); KQPV.el = el;
  const sh = document.createElement('button'); sh.id = 'kqpvShow'; sh.textContent = 'Show controls (H)'; sh.onclick = () => kqpvHide(false); document.body.appendChild(sh);
  const q = c => el.querySelector(c), F = 1 / 24, ex = t => kqpvGo(t, true);
  q('.b-pl').onclick = () => kqpvPlay();
  q('.b-f1').onclick = () => { kqpvPlay(false); kqpvGo(KQPV.t - F, false) }; q('.b-f2').onclick = () => { kqpvPlay(false); kqpvGo(KQPV.t + F, true) };
  q('.b-s1').onclick = () => { kqpvPlay(false); ex(KQPV.t - 1) }; q('.b-s2').onclick = () => { kqpvPlay(false); ex(KQPV.t + 1) };
  q('.b-ps').onclick = () => kqpvJumpShot(-1); q('.b-ns').onclick = () => kqpvJumpShot(1);
  q('.b-sp').onchange = e => { KQPV.spd = +e.target.value; KQPV.a0 = null; kqpvAudio() };
  q('.b-lp').onclick = () => { KQPV.loop = !KQPV.loop; kqpvUi() };
  q('.b-snd').onclick = () => kqpvSnd();
  q('.b-cp').onclick = () => kqpvCopy();
  q('.b-hd').onclick = () => kqpvHide(true);
  const st = kqpvGet(); q('.b-cls').value = st.cls || 'warrior'; q('.b-com').value = st.sp || (typeof STARTERS != 'undefined' && STARTERS[0]) || 'Foxlet';
  const re = () => { kqpvPut({ cls: q('.b-cls').value, sp: q('.b-com').value, t: KQPV.t }); kqpvMsg('Making the new hero…'); setTimeout(() => { try { location.reload() } catch (_) { kqpvMsg('Reload the page to see the new hero.') } }, 60) };
  q('.b-cls').onchange = re; q('.b-com').onchange = re;
  // the timeline: one block per shot, the cut to Duskhold marked (in the game the hero creator comes there)
  const tl = q('.tl'), E = kqpvEnd(), P = KQPV.shots;
  P.forEach((s, i) => {
    const b = document.createElement('div'), a = s[0], z = i + 1 < P.length ? P[i + 1][0] : E;
    b.className = 'seg' + (a >= IC151.cut - .01 ? ' p2' : ''); b.style.left = (a / E * 100) + '%'; b.style.width = ((z - a) / E * 100) + '%'; b.dataset.i = i; tl.appendChild(b)
  });
  const cut = document.createElement('div'); cut.className = 'cut'; cut.style.left = (IC151.p1End / E * 100) + '%'; cut.innerHTML = '<i>hero creator</i>'; tl.appendChild(cut);
  KQPV.segs = [...tl.querySelectorAll('.seg')];
  const tAt = e => { const r = tl.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * E }, tip = q('.tip');
  tl.addEventListener('pointerdown', e => { tl.setPointerCapture(e.pointerId); KQPV.drag = true; KQPV.wasPlay = KQPV.play; kqpvPlay(false); kqpvGo(tAt(e), false) });
  tl.addEventListener('pointermove', e => {
    const t = tAt(e), r = tl.getBoundingClientRect(); tip.style.display = 'block'; tip.style.left = (e.clientX - r.left) + 'px'; tip.textContent = kqpvFmt(t) + ' · ' + P[kqpvShot(t)][1];
    if (KQPV.drag) kqpvGo(t, false)
  });
  tl.addEventListener('pointerleave', () => { tip.style.display = 'none' });
  const up = e => { if (!KQPV.drag) return; KQPV.drag = false; kqpvGo(tAt(e), true); if (KQPV.wasPlay) kqpvPlay(true) };
  tl.addEventListener('pointerup', up); tl.addEventListener('pointercancel', up);
  ['pointerdown', 'click', 'mousedown', 'wheel', 'touchstart'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));
}
function kqpvJumpShot(d) {
  const P = KQPV.shots; let i = kqpvShot(KQPV.t);
  if (d < 0 && KQPV.t - P[i][0] > .4) d = 0;   // first press goes back to the start of this shot
  i = Math.max(0, Math.min(P.length - 1, i + d)); kqpvGo(P[i][0] + 1e-4, true); kqpvAudio()
}
function kqpvSnd() {
  KQPV.snd = !KQPV.snd;
  if (KQPV.snd) { try { if (!KQPV.ac) KQPV.ac = new (window.AudioContext || window.webkitAudioContext)(); if (KQPV.ac.resume) KQPV.ac.resume() } catch (_) {} kqpvSound() }
  kqpvAudio(); kqpvUi()
}
function kqpvCopy() {
  const s = 't = ' + KQPV.t.toFixed(2) + ' s (' + kqpvFmt(KQPV.t) + ') · ' + KQPV.shots[kqpvShot(KQPV.t)][1] + ' · ' + ((CLS[hero.cls] && CLS[hero.cls].n) || hero.cls) + ' with ' + ((party[0] && party[0].n) || '');
  const ok = () => kqpvMsg('Copied: ' + s), no = () => kqpvMsg(s + '  (select and copy this)');
  try { navigator.clipboard.writeText(s).then(ok, no) } catch (_) { no() }
}
function kqpvHide(h) { KQPV.el.classList.toggle('hid', h); $('kqpvShow').style.display = h ? 'block' : 'none' }
function kqpvMsg(s) { const m = KQPV.el && KQPV.el.querySelector('.msg'); if (m) m.textContent = s; clearTimeout(KQPV.mt); if (s) KQPV.mt = setTimeout(() => { if (m) m.textContent = KQPV.busy || '' }, 4000) }
function kqpvBusy(s) { KQPV.busy = s || ''; const m = KQPV.el && KQPV.el.querySelector('.msg'); if (m) m.textContent = s || '' }
function kqpvUi() {
  const el = KQPV.el; if (!el) return; const q = c => el.querySelector(c), t = KQPV.t, i = kqpvShot(t), P = KQPV.shots;
  q('.sn').textContent = P[i][1]; q('.sk').textContent = 'shot ' + (i + 1) + ' of ' + P.length + (t >= IC151.cut ? ' · part two (after the hero creator)' : ' · part one');
  q('.tc').textContent = kqpvFmt(t) + ' / ' + kqpvFmt(kqpvEnd()) + '  ·  ' + t.toFixed(2) + ' s';
  q('.ph').style.left = (t / kqpvEnd() * 100) + '%';
  if (KQPV.ci !== i) { KQPV.segs.forEach((b, k) => b.classList.toggle('cur', k === i)); KQPV.ci = i }
  q('.b-pl').textContent = KQPV.play ? 'II' : '▶︎'; q('.b-lp').classList.toggle('on', KQPV.loop);
  q('.b-snd').classList.toggle('on', KQPV.snd); q('.b-snd').textContent = KQPV.snd ? 'Sound on' : 'Sound off';
  const e = IC151.err || KQPV.sndErr || ''; if (q('.err').textContent !== e) q('.err').textContent = e ? 'Frame error: ' + e.slice(0, 600) : ''
}
function kqpvKeys(e) {
  if (!KQPV.on) return; const tg = e.target; if (tg && /^(SELECT|INPUT|TEXTAREA)$/.test(tg.tagName)) return;
  e.stopImmediatePropagation(); if (e.type !== 'keydown') return; const k = e.key, F = 1 / 24;
  if (k === ' ' || k === 'Spacebar') { e.preventDefault(); kqpvPlay() }
  else if (k === 'ArrowLeft') { e.preventDefault(); kqpvPlay(false); e.shiftKey ? kqpvGo(KQPV.t - 1, true) : kqpvGo(KQPV.t - F, false) }
  else if (k === 'ArrowRight') { e.preventDefault(); kqpvPlay(false); kqpvGo(KQPV.t + (e.shiftKey ? 1 : F), true) }
  else if (k === '[') kqpvJumpShot(-1); else if (k === ']') kqpvJumpShot(1);
  else if (k === 'l' || k === 'L') { KQPV.loop = !KQPV.loop; kqpvUi() }
  else if (k === 'm' || k === 'M') kqpvSnd();
  else if (k === 'h' || k === 'H') kqpvHide(!KQPV.el.classList.contains('hid'))
}

// ---------------- start-up: make the hero, then build the film ----------------
function kqpvBoot() {
  const B = document.createElement('div'); B.id = 'kqpvB'; B.innerHTML = 'Kill Quest · intro preview<small class="s">Making the hero…</small>'; kqpvCss(); document.body.appendChild(B);
  const say = s => { B.querySelector('.s').textContent = s }, st = kqpvGet();
  const vis = id => { const e = $(id); return e && !e.classList.contains('hide') };
  const wait = (f, ms) => new Promise((res, rej) => { const t0 = performance.now(), k = () => { let v = false; try { v = f() } catch (_) {} if (v) return res(); if (performance.now() - t0 > ms) return rej(new Error('timed out')); setTimeout(k, 100) }; k() });
  (async () => {
    try {
      await wait(() => vis('devp'), 30000); document.querySelector('#devp [data-dev=desktop]').click();
      await wait(() => vis('start'), 20000);
      const c = CLSK.includes(st.cls) ? st.cls : 'warrior', sp = STARTERS.includes(st.sp) ? st.sp : STARTERS[0];
      const cb = document.querySelector('#ccList [data-c="' + c + '"]'); if (cb) cb.click(); else ccCls = c;
      $('ccNext').click(); await new Promise(r => setTimeout(r, 300));
      const sb = document.querySelector('#ccList [data-s="' + sp + '"]'); if (sb) sb.click(); else ccSp = sp;
      await new Promise(r => setTimeout(r, 200)); $('ccNext').click();
      await wait(() => typeof party != 'undefined' && party.length > 0 && !vis('start'), 20000);
      say('Building the intro… (a few seconds: the earthquake is simulated first)'); await new Promise(r => setTimeout(r, 1600));
      KQPV.cap = ic151Cap(innerWidth, innerHeight); const S = IC151.S;
      try { S.rd.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); S.rd.setSize(innerWidth, innerHeight) } catch (_) {}
      kqpvFols(true); KQPV.shots = kqpvShots(); KQPV.on = true;
      if (!window.KQPV_K) { addEventListener('keydown', kqpvKeys, true); addEventListener('keyup', kqpvKeys, true) }   // the page normally adds it first (tools/preview_page.py)
      addEventListener('resize', () => { try { S.rd.setSize(innerWidth, innerHeight); S.cam.aspect = innerWidth / innerHeight; S.cam.updateProjectionMatrix() } catch (_) {} setTimeout(() => ic151Seek(KQPV.t), 50) });
      kqpvPanel(); ic151Seek(0); B.remove();
      const t0 = Math.max(0, Math.min(kqpvEnd(), +st.t || 0)); kqpvPut({ t: 0 }); kqpvGo(t0, true);
      requestAnimationFrame(kqpvLoop);
      window.KQPV_READY = 1
    } catch (e) { console.warn('preview', e); say('Could not start the preview: ' + (e && e.message || e)); window.KQPV_ERR = String(e && e.stack || e) }
  })()
}
if (window.KQ_PREVIEW) {
  try { localStorage.removeItem(SAVE_KEY) } catch (_) {}   // the preview never keeps or loads a game
  { const f = saveGame; saveGame = function () { if (window.KQ_PREVIEW) return false; return f.apply(this, arguments) } }
  try { document.title = 'Kill Quest Intro Preview' } catch (_) {}
  if (document.readyState === 'complete') setTimeout(kqpvBoot, 0); else addEventListener('load', () => setTimeout(kqpvBoot, 0))
}
