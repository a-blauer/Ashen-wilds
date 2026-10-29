// ================= Detail test page, part 2: the test (owner's request, Oct 29 2026) =================
// Runs ONLY on the detail test page (tools/build_detail.sh puts this file after the game script). It makes a level-30 hero
// in full rare gear with six abilities and two fully evolved companions, takes them to Kindlelight I, and shows how fast the
// computer draws it: frames per second, the slowest frames, triangles and draw calls per frame, and the game's own work per
// frame. "Measure 20 s" keeps the result in a table (per detail level), so 1×, 2× and 4× can be compared on one computer.
// Nothing is ever saved: the page never touches a real game.
var KDT = { god: true, fight: [], fr: [], rec: null, cpu: 0, cpuA: [], last: 0, ui: 0, el: null };

function kdtGet() { try { return JSON.parse(localStorage.getItem('kqd') || '{}') || {} } catch (_) { return {} } }
function kdtPut(o) { try { localStorage.setItem('kqd', JSON.stringify(Object.assign(kdtGet(), o))) } catch (_) {} }
function kdtRes() { try { return JSON.parse(localStorage.getItem('kqdR') || '[]') || [] } catch (_) { return [] } }
function kdtFmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)) }
function kdtGpu() { try { const gl = ren.getContext(), x = gl.getExtension('WEBGL_debug_renderer_info'); return String(x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).replace(/^ANGLE \((.*)\)$/, '$1') } catch (_) { return 'unknown' } }
function kdtMode() { return KQD.m === 1 ? '1× (the game as it is)' : KQD.m + '× detail, smooth look' }

function kdtCss() {
  const s = document.createElement('style'); s.textContent = `
  #kdtB{position:fixed;inset:0;z-index:99999;background:#0c0d10;color:#e8e2d4;display:flex;flex-direction:column;align-items:center;justify-content:center;font:600 22px Georgia,serif;gap:14px}
  #kdtB small{font:14px system-ui,sans-serif;color:#a8a294}#kdtB .bar{width:min(420px,80vw);height:8px;background:#26282e;border-radius:4px;overflow:hidden}#kdtB .bar i{display:block;height:100%;width:0;background:#c89a3c}
  #kdtP{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(12,13,16,.86);color:#e8e2d4;border:1px solid rgba(200,154,60,.45);border-radius:8px;
    font:12px/1.35 system-ui,sans-serif;padding:8px 10px;width:min(560px,calc(100vw - 32px));box-sizing:border-box;box-shadow:0 4px 18px rgba(0,0,0,.5)}
  #kdtP.min .x{display:none}#kdtP h4{margin:0 0 4px;font:600 13px Georgia,serif;color:#e6c27a;display:flex;justify-content:space-between;gap:8px;align-items:center}
  #kdtP .big{display:flex;gap:14px;flex-wrap:wrap;margin:2px 0 6px}#kdtP .big b{font-size:19px;color:#fff}#kdtP .big span{color:#a8a294}
  #kdtP .row{display:flex;flex-wrap:wrap;gap:5px;margin:5px 0}#kdtP button{font:12px system-ui,sans-serif;background:#26282e;color:#e8e2d4;border:1px solid #444852;border-radius:5px;padding:4px 8px;cursor:pointer}
  #kdtP button:hover{border-color:#c89a3c}#kdtP button.on{background:#6b4f1c;border-color:#c89a3c;color:#fff}#kdtP button:disabled{opacity:.5;cursor:default}
  #kdtP table{width:100%;border-collapse:collapse;margin-top:4px;font-size:11.5px}#kdtP td,#kdtP th{padding:2px 4px;text-align:right;border-top:1px solid #2c2f36;white-space:nowrap}#kdtP th{color:#a8a294;font-weight:500}
  #kdtP td:first-child,#kdtP th:first-child{text-align:left}#kdtP .mut{color:#8d887c}#kdtP .good{color:#8fd18a}#kdtP .ok{color:#e6c27a}#kdtP .bad{color:#ef7d6b}
  #kdtP textarea{width:100%;height:70px;margin-top:4px;background:#16171b;color:#e8e2d4;border:1px solid #444852;font:11px monospace}`;
  document.head.appendChild(s)
}

// ---------------- start-up: the hero, the gear, the companions, Kindlelight I, then the detail warm-up ----------------
function kdtBoot() {
  kdtCss(); const B = document.createElement('div'); B.id = 'kdtB'; B.innerHTML = 'Kill Quest · detail test<small class="s">Making the hero…</small><div class="bar"><i></i></div>'; document.body.appendChild(B);
  const say = (s, p) => { B.querySelector('.s').textContent = s; if (p != null) B.querySelector('.bar i').style.width = Math.round(p * 100) + '%' };
  const vis = id => { const e = $(id); return e && !e.classList.contains('hide') };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const wait = (f, ms) => new Promise((res, rej) => { const t0 = performance.now(), k = () => { let v = false; try { v = f() } catch (_) {} if (v) return res(); if (performance.now() - t0 > ms) return rej(new Error('timed out')); setTimeout(k, 100) }; k() });
  (async () => {
    try {
      const st = kdtGet();
      await wait(() => vis('devp'), 30000); document.querySelector('#devp [data-dev=desktop]').click();
      await wait(() => vis('start'), 20000);
      const c = CLSK.includes(st.cls) ? st.cls : 'warrior', sp = STARTERS[0];
      const cb = document.querySelector('#ccList [data-c="' + c + '"]'); if (cb) cb.click(); else ccCls = c;
      $('ccNext').click(); await sleep(300);
      const sb = document.querySelector('#ccList [data-s="' + sp + '"]'); if (sb) sb.click(); else ccSp = sp;
      await sleep(200); $('ccNext').click();
      await wait(() => typeof party != 'undefined' && party.length > 0 && !vis('start'), 20000);
      say('Gearing up…'); kdtSetup(); await sleep(1500);
      say('Travelling to Kindlelight I…'); insArrive(INSL[insG(0, 0)]); try { rosterTick() } catch (_) {} await sleep(2500);
      if (KQD.m > 1) await kdtWarm(say);
      B.remove(); kdtPanel(); requestAnimationFrame(kdtTick); window.KDT_READY = 1
    } catch (e) { console.warn('detail test', e); say('Could not start the test: ' + (e && e.message || e)); window.KDT_ERR = String(e && e.stack || e) }
  })()
}
function kdtSetup() {
  // the same gear and companions on every load (a fixed random sequence), so 1×, 2× and 4× measure the same scene
  const R0 = Math.random; let sd = 20261029; Math.random = () => { sd = (sd + 0x6D2B79F5) | 0; let t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
  try { kdtSetup0() } finally { Math.random = R0 }
}
function kdtSetup0() {
  hero.lvl = 30; hero.tal = hero.tal || {};
  // six abilities: the strongest the class has by level 30
  try { const all = kqsAll(hero.cls).filter(s => s.lv <= 30), pick = all.slice(-KQS_SLOTS); pick.forEach(s => { hero.tal['ab:' + s.n] = 1 }); kqsSetLd(pick.map(s => s.n)) } catch (e) { console.warn('detail abilities', e) }
  // a full set of rare-or-better level-30 gear, so the armour models are on the hero
  SLOTS.forEach(sl => { try { for (let i = 0; i < 6; i++) { const it = genItem(30, { cls: hero.cls, sl, minR: 3 }); if (eqSlot135(it) === sl) { eq[sl] = it; break } } } catch (_) {} });
  try { refreshGear() } catch (e) { console.warn('detail gear', e) }
  // two companions, both at their final evolution: the starter and a Hivemother (the most detailed body)
  try { party.forEach(c => { c.l = 30; c.evo = 3 }); hero.tal.__cs2 = 1;
    if (party.length < 2) { const c = mkC(party[0].n === 'Hivemother' ? 'Sporelord' : 'Hivemother', 30); c.evo = 3; party.push(c) } } catch (e) { console.warn('detail companions', e) }
  hero.hp = heroMax(); try { hero.mp = mpMax() } catch (_) {}
  try { sync(); ui(); hud() } catch (_) {}   // the companion models and the hotbar follow the new party and abilities
  // the game lowers its resolution and view distance when frames get slow: off here, so the numbers show the real cost
  try { QL.auto = false; setQ(0) } catch (_) {}
}
// make the detailed copies of everything in Kindlelight I up front (behind a loading bar), not while you play
async function kdtWarm(say) {
  const I = INSL[insG(0, 0)], M = 40, x0 = I.x0 - M, x1 = I.x0 + I.w + M, z0 = I.y0 - M, z1 = I.y0 + I.h + M, set = new Set(), v = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o.isMesh || !o.geometry || KQD.map.has(o.geometry)) return; const g = o.geometry;
    if (o.isInstancedMesh) { set.add(g); return }
    try { if (!g.boundingSphere) g.computeBoundingSphere() } catch (_) { return } const bs = g.boundingSphere; if (!bs || !isFinite(bs.radius)) return;
    v.copy(bs.center).applyMatrix4(o.matrixWorld); if (v.x > x0 && v.x < x1 && v.z > z0 && v.z < z1) set.add(g)
  });
  scene.traverseVisible(o => { if (o.isMesh && o.geometry && !KQD.map.has(o.geometry)) set.add(o.geometry) });   // and whatever is in view (sky, far hills)
  KQD.q.forEach(g => set.add(g)); KQD.q.clear();
  const L = [...set], n = L.length, t0 = performance.now(); let i = 0;
  while (i < L.length) {
    const s = performance.now(); while (i < L.length && performance.now() - s < 60) { const g = L[i++]; if (!KQD.map.has(g)) kdBuild(g) }
    say('Building the detailed models… ' + kdtFmt(KQD.st.tout) + ' triangles', i / n); await new Promise(r => setTimeout(r, 0))
  }
  KQD.st.warmMs = performance.now() - t0; KQD.st.warmN = n
}

// ---------------- every frame: the counters, god mode, the remaining detail work ----------------
{ const f = loop; loop = function () { const t0 = performance.now(); try { return f.apply(this, arguments) } finally { KDT.cpu = performance.now() - t0 } } }
function kdtTick(now) {
  requestAnimationFrame(kdtTick);
  const dt = KDT.last ? now - KDT.last : 0; KDT.last = now;
  const ri = ren.info.render, tris = ri.triangles, calls = ri.calls; KDT.lt = [tris, calls];
  if (dt > 0 && dt < 2000) { KDT.fr.push([now, dt, tris, calls, KDT.cpu]); while (KDT.fr.length && now - KDT.fr[0][0] > 1000) KDT.fr.shift() }
  if (KDT.rec && dt > 0 && dt < 2000) { const R = KDT.rec; R.dt.push(dt); R.tris += tris; R.calls += calls; R.cpu += KDT.cpu; R.n++; if (now - R.t0 > 20000) kdtStop() }
  if (KDT.god) { try { hero.hp = heroMax(); hero.mp = mpMax(); hero.dead = false } catch (_) {} }
  if (KQD.m > 1 && KQD.q.size) kdWork(KQD.q.size > 40 ? 2 * KQD.budget : KQD.budget);   // new things in view (monsters, spells) get their detail within a frame or two
  if (now - KDT.ui > 250) { KDT.ui = now; kdtUi() }
}

// ---------------- the panel ----------------
function kdtPanel() {
  const P = document.createElement('div'); P.id = 'kdtP'; KDT.el = P; document.body.appendChild(P);
  P.innerHTML = `<h4><span>Detail test · <span id="kdtMode"></span></span><button id="kdtMin" title="Show or hide the panel">–</button></h4>
  <div class="big"><span><b id="kdtFps">–</b> fps</span><span>slowest <b id="kdtLow">–</b> ms</span><span><b id="kdtTri">–</b> triangles</span><span><b id="kdtCal">–</b> draw calls</span></div>
  <div class="x">
   <div class="mut" id="kdtSub"></div>
   <div class="row"><span class="mut" style="align-self:center">Detail:</span>${[1, 2, 4].map(m => `<button data-m="${m}" class="${KQD.m === m ? 'on' : ''}">${m}×</button>`).join('')}
    <span class="mut" style="align-self:center;margin-left:6px">Class:</span><select id="kdtCls" style="font:12px system-ui;background:#26282e;color:#e8e2d4;border:1px solid #444852;border-radius:5px">${CLSK.map(c => `<option value="${c}" ${c === hero.cls ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
   <div class="row"><button id="kdtFight">⚔️ Big fight (+20 monsters)</button><button id="kdtClear">Clear fight</button><button id="kdtGod" class="on">🛡️ Can't die</button><button id="kdtRec">⏱️ Measure 20 s</button></div>
   <div id="kdtTab"></div>
   <div class="row"><button id="kdtCopy">📋 Copy results</button><button id="kdtWipe">Clear results</button></div>
   <div class="mut">Walk and fight as usual. 60 fps (or your screen's refresh rate) is smooth; "slowest" is the slowest frame in the last second (above ~33 ms you feel a stutter). Changing detail or class reloads the page.</div>
  </div>`;
  $('kdtMode').textContent = kdtMode();
  $('kdtMin').onclick = () => { P.classList.toggle('min'); $('kdtMin').textContent = P.classList.contains('min') ? '+' : '–' };
  P.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { if (+b.dataset.m === KQD.m) return; kdtPut({ m: +b.dataset.m }); location.reload() });
  $('kdtCls').onchange = e => { kdtPut({ cls: e.target.value }); location.reload() };
  $('kdtFight').onclick = kdtFight; $('kdtClear').onclick = kdtClear;
  $('kdtGod').onclick = () => { KDT.god = !KDT.god; $('kdtGod').classList.toggle('on', KDT.god) };
  $('kdtRec').onclick = () => { if (KDT.rec) return; KDT.rec = { t0: performance.now(), dt: [], tris: 0, calls: 0, cpu: 0, n: 0 }; kdtUi() };
  $('kdtCopy').onclick = kdtCopy; $('kdtWipe').onclick = () => { try { localStorage.removeItem('kqdR') } catch (_) {} kdtTable() };
  // keys typed into the panel's controls stay out of the game
  ['keydown', 'keyup'].forEach(t => P.addEventListener(t, e => e.stopPropagation()));
  kdtTable()
}
function kdtUi() {
  if (!KDT.el) return; const F = KDT.fr; if (!F.length) return;
  const span = (F[F.length - 1][0] - F[0][0]) + F[0][1], fps = F.length / (span / 1000), low = Math.max(...F.map(x => x[1]));
  const avg = k => F.reduce((s, x) => s + x[k], 0) / F.length;
  $('kdtFps').textContent = fps.toFixed(0); $('kdtFps').className = fps >= 55 ? 'good' : fps >= 30 ? 'ok' : 'bad';
  $('kdtLow').textContent = low.toFixed(0); $('kdtLow').className = low <= 25 ? 'good' : low <= 40 ? 'ok' : 'bad';
  $('kdtTri').textContent = kdtFmt(avg(2)); $('kdtCal').textContent = Math.round(avg(3));
  const live = enemies.filter(e => !e.dead).length, near = kdtNear();
  $('kdtSub').textContent = `Game work ${avg(4).toFixed(1)} ms/frame · ${live} monsters loaded, ${near} near you · ${ren.domElement.width}×${ren.domElement.height} px · ${kdtGpu()}`
    + (KQD.m > 1 ? ` · detailed models: ${KQD.st.geo}${KQD.q.size ? ', ' + KQD.q.size + ' still to build' : ''}` : '');
  const r = $('kdtRec'); if (KDT.rec) { r.disabled = true; r.textContent = '⏱️ Measuring… ' + Math.max(0, 20 - (performance.now() - KDT.rec.t0) / 1000).toFixed(0) + ' s' } else { r.disabled = false; r.textContent = '⏱️ Measure 20 s' }
}
function kdtNear() { const p = pl.position; return enemies.filter(e => !e.dead && e.m && Math.hypot(e.m.position.x - p.x, e.m.position.z - p.z) < 25).length }
function kdtStop() {
  const R = KDT.rec; KDT.rec = null; if (!R || !R.n) return;
  const tot = R.dt.reduce((a, b) => a + b, 0), s = R.dt.slice().sort((a, b) => b - a), p1 = s[Math.max(0, Math.floor(s.length * .01) - 1)] || s[0];
  const res = { m: KQD.m, cls: hero.cls, near: kdtNear(), fps: +(R.n / (tot / 1000)).toFixed(1), low: +(1000 / p1).toFixed(1), worst: +s[0].toFixed(0),
    tris: Math.round(R.tris / R.n), calls: Math.round(R.calls / R.n), cpu: +(R.cpu / R.n).toFixed(1), px: ren.domElement.width + '×' + ren.domElement.height, gpu: kdtGpu(), at: new Date().toLocaleString() };
  const L = kdtRes(); L.push(res); while (L.length > 20) L.shift(); try { localStorage.setItem('kqdR', JSON.stringify(L)) } catch (_) {}
  kdtTable(); kdtUi()
}
function kdtTable() {
  const L = kdtRes(), el = $('kdtTab'); if (!el) return;
  if (!L.length) { el.innerHTML = '<div class="mut">No measurements yet: press ⏱️ Measure 20 s and keep playing (try one standing still and one in a big fight, at each detail level).</div>'; return }
  el.innerHTML = `<table><tr><th>Detail</th><th>Monsters near</th><th>Avg fps</th><th>1% low fps</th><th>Triangles</th><th>Draw calls</th><th>Game work</th></tr>` +
    L.slice(-8).map(r => `<tr><td>${r.m}×</td><td>${r.near}</td><td class="${r.fps >= 55 ? 'good' : r.fps >= 30 ? 'ok' : 'bad'}">${r.fps}</td><td class="${r.low >= 45 ? 'good' : r.low >= 25 ? 'ok' : 'bad'}">${r.low}</td><td>${kdtFmt(r.tris)}</td><td>${r.calls}</td><td>${r.cpu} ms</td></tr>`).join('') + '</table>'
}
function kdtCopy() {
  const L = kdtRes(); const txt = 'Kill Quest detail test · ' + kdtGpu() + '\n' + (L.length ? L.map(r => `${r.m}× · ${r.near} monsters near · ${r.fps} fps avg · ${r.low} fps 1% low · worst ${r.worst} ms · ${kdtFmt(r.tris)} triangles · ${r.calls} draw calls · game work ${r.cpu} ms · ${r.px} · ${r.cls}`).join('\n') : 'no measurements yet');
  const done = () => { const b = $('kdtCopy'); b.textContent = '✓ Copied'; setTimeout(() => b.textContent = '📋 Copy results', 1500) };
  const fallback = () => { let t = KDT.el.querySelector('textarea'); if (!t) { t = document.createElement('textarea'); KDT.el.querySelector('.x').appendChild(t) } t.value = txt; t.focus(); t.select(); try { document.execCommand('copy'); done() } catch (_) {} };
  try { navigator.clipboard.writeText(txt).then(done, fallback) } catch (_) { fallback() }
}
// a big fight: 20 Kindlelight I monsters around the hero, all coming for you
function kdtFight() {
  const I = INSL[insG(0, 0)], keys = BIOEN[PMAP[0].n] || ['hobgoblin'], p = pl.position, lv = I.lv[1];
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, r = 7 + (i % 3) * 2;
    try { const e = spawnEnemy(keys[i % keys.length], p.x + Math.cos(a) * r, p.z + Math.sin(a) * r, lv, { agg: 1 }); if (e) { e.agg = 1; KDT.fight.push(e) } } catch (err) { console.warn('detail fight', err) } }
}
function kdtClear() { KDT.fight.forEach(e => { try { if (!e.dead) removeE(e) } catch (_) {} }); KDT.fight = [] }

if (window.KQ_DETAIL) {
  try { localStorage.removeItem(SAVE_KEY) } catch (_) {}   // the test never keeps or loads a game
  { const f = saveGame; saveGame = function () { if (window.KQ_DETAIL) return false; return f.apply(this, arguments) } }
  try { document.title = 'Kill Quest Detail Test' } catch (_) {}
  if (KQD.smooth) {   // the low-poly look: the shared round props get their full segment counts back (the v83 style pass cut them)
    try { G_SPH.copy(new THREE.SphereGeometry(1, 14, 10)); G_CYL.copy(new THREE.CylinderGeometry(1, 1, 1, 16)); G_CONE.copy(new THREE.ConeGeometry(1, 1, 16));
      [G_SPH, G_CYL, G_CONE].forEach(g => { g.computeBoundingSphere(); delete g.userData.lps }) } catch (e) { console.warn('detail shapes', e) }
    // the ground: its shader paints every ground triangle in one colour, from the tile map at the triangle's centre, with a
    // per-triangle shade and the triangle's own flat slope. Here it samples the tile map where each pixel is (blended between
    // tiles), shades with smooth noise and uses the smooth ground normal, so the ground is no longer cut into facets.
    try { GTX.list.forEach(T => { const m = T.mat; if (!m || m.userData.kqd) return; m.userData.kqd = 1; const f = m.onBeforeCompile;
      m.onBeforeCompile = function (sh, r) { if (f) f.call(this, sh, r);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vKqdN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvKqdN=objectNormal;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vKqdN;')
          .replace('vec2 fc=fi+co;', 'vec2 fc=vWP.xz;').replace('float fh=hs3(fc*1.731+.37);', 'float fh=fb3(vWP.xz*1.3+.37);')
          .replace('vec3 fn=normalize(cross(dFdx(vWP),dFdy(vWP)));', 'vec3 fn=normalize(vKqdN);') };
      m.needsUpdate = true }) } catch (e) { console.warn('detail ground', e) }
  }
  if (document.readyState === 'complete') setTimeout(kdtBoot, 0); else addEventListener('load', () => setTimeout(kdtBoot, 0))
}
