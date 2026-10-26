// ================= v151c: the intro in two halves around the hero creator =================
// Owner's request: a new game starts with part one (the woodland, the earthquake, the fall, the core, the change into an
// upright); when the white light peaks it fades into the hero creator; "Begin your journey" plays part two (the light
// clears on Duskhold: the tour, with the hero and the companion the player just made); then the game.
// IC151.mode: 'p1' | 'p2' | 'all' (the whole film, used by the tests and the video; ic151Cap). Skip in part one goes to
// the creator, in part two to the game. A new game is marked by New Game / Begin on the title, the layout picker without a
// save, or "New game" in the save prompt; part one starts once the creator is the screen on top.
IC151.p1End = 55.8;        // part one ends in the white light, just before the cut to Duskhold
IC151.newGame = false;

// end of part one: the light holds, the layer fades away over the creator, then everything of part one is freed
function ic151P1Out() {
  const S = IC151.S, L = IC151.live; if (!S || !L || L.p1o) return; L.p1o = 1; IC151.on = false;
  try { if (L.out) { L.out.gain.cancelScheduledValues(L.ac.currentTime); L.out.gain.setTargetAtTime(0, L.ac.currentTime, .45) } } catch (_) {}
  const D = S.dom; D.fw.style.opacity = '1'; D.sub.innerHTML = ''; D.skip.style.display = 'none'; S.rd.domElement.style.display = 'none';
  D.el.style.background = 'transparent'; D.el.style.pointerEvents = 'none'; D.el.style.transition = 'opacity 1.4s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => { D.el.style.opacity = '0' }));
  L.timers.push(setTimeout(() => { IC151.p1done = true; ic151End() }, 1500))
}

// part two needs no woodland: just the page layer, the town set-up and the Sovereign faces (made before it starts)
function ic151BuildP2(W, H) {
  const S = { W, H, p2: true }; S.dot = ic151Dot(); const cv = document.createElement('canvas'); cv.style.display = 'none';
  S.rd = { domElement: cv, setSize() {}, dispose() {}, forceContextLoss() {} }; S.cam = new THREE.PerspectiveCamera(45, W / H, .1, 10);
  try { if (typeof sync == 'function') sync() } catch (_) {}   // the companion picked in the creator, before the game loop has run
  ic151DuskInit(S); if (!S.D) throw new Error('intro: no town for part two');
  if (!IC151.SF) try { ic151SovFaces() } catch (e) { console.warn('intro faces', e) }
  return S
}

// what marks a new game
{ const f = awTitleGo; awTitleGo = function (mode) { const r = f.apply(this, arguments); try { const T = $('awT'); if (mode === 'new' && T && T.classList.contains('out')) IC151.newGame = true } catch (_) {} return r } }
try { $('devp').addEventListener('click', e => { if (e.target.closest('[data-dev]') && !saveInfo()) IC151.newGame = true }) } catch (_) {}
try { const b = $('svpN'), f = b.onclick; b.onclick = function () { const r = f && f.apply(this, arguments); if ($('svp').classList.contains('hide')) IC151.newGame = true; return r } } catch (_) {}

// part one starts when the creator is the screen in front (title, layout picker and save prompt gone)
function ic151P1Ready() {
  const st = $('start'), hid = id => { const e = $(id); return !e || e.classList.contains('hide') };
  return !!(st && !st.classList.contains('hide') && st.offsetParent !== null && !$('awT') && hid('devp') && hid('svp') && hid('kqj'))
}
setInterval(() => {
  if (!IC151.newGame || IC151.run) return;
  if (!ic151Want()) { IC151.newGame = false; return }
  if (!ic151P1Ready()) return;
  IC151.newGame = false; try { ic151Play(null, 'p1') } catch (e) { console.warn('intro part one', e) }
}, 250);
