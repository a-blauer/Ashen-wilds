// ================= Detail test page, part 1 (owner's request, Oct 29 2026) =================
// Runs ONLY on the detail test page (tools/build_detail.sh puts this file in front of the game script); the game never has it.
// Question it answers: how much more detailed can the game be and still run smoothly? The page plays Kindlelight I with
// everything the renderer draws at more detail, and shows frames per second, triangles and draw calls.
//
// Detail levels (Settings on the page, kept in localStorage 'kqd' {m}):
//   1× = the game exactly as it is (low-poly look, same models): the baseline to compare against.
//   2× = every triangle of every model, the ground, scenery, gear and effects is split in two; 4× = split in four.
//        Also the "low-poly look" is off: no flat shading, round shapes keep their full segment counts (the v83 style
//        pass 0750 is skipped), procedural normal maps stay, and faceted normals / per-face colours are smoothed
//        (within a 55° crease, so hard edges such as blades, boxes and walls stay sharp). Split points on smooth,
//        rounded surfaces are pushed out onto the curve (PN-triangle edge midpoints), so silhouettes get rounder.
//
// How: the game's own geometry is never changed. Before each render, every visible mesh is handed a refined copy of its
// geometry (made once and cached per geometry, a few milliseconds of work per frame at most) and given back right after,
// so game code (ground heights, ray casts, animation) never sees the swap. Geometry the game rewrites every frame
// (trails and the like) is left as it is. Skinned meshes (hero, companions, monsters) keep their bone weights.
var KQD = (function () {
  let cfg = {}; try { cfg = JSON.parse(localStorage.getItem('kqd') || '{}') || {} } catch (_) {}
  const m = [1, 2, 4].includes(+cfg.m) ? +cfg.m : 2;
  return { m, smooth: m > 1, cfg, crease: Math.cos(55 * Math.PI / 180), keepN: Math.cos(3 * Math.PI / 180),
    map: new WeakMap(), q: new Set(), budget: 4, st: { geo: 0, skip: 0, dyn: 0, tin: 0, tout: 0, ms: 0, swapMs: 0 } }
})();

// ---------------- the refinement: one geometry in, a more detailed copy out (or null when it can't be done) ----------------
// a small open-addressing table from a pair of non-negative ints to an int (no allocations per entry)
function kdMix(h) { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); return h ^ (h >>> 16) }
function kdTab(n) { let s = 16; while (s < n * 2) s *= 2; const a = new Int32Array(s).fill(-1), b = new Int32Array(s), c = new Int32Array(s);
  return { get(x, y) { let h = kdMix(Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) & (s - 1); while (a[h] !== -1) { if (a[h] === x && b[h] === y) return c[h]; h = (h + 1) & (s - 1) } return -1 },
    set(x, y, v) { let h = kdMix(Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) & (s - 1); while (a[h] !== -1) { if (a[h] === x && b[h] === y) { c[h] = v; return } h = (h + 1) & (s - 1) } a[h] = x; b[h] = y; c[h] = v } } }
function kdRefine(g) {
  const A = g.attributes, P = A.position;
  if (!P || P.itemSize !== 3 || P.isInterleavedBufferAttribute) return null;
  for (const k in A) if (A[k].isInterleavedBufferAttribute) return null;
  const MA = g.morphAttributes; if (MA) for (const k in MA) if (MA[k] && MA[k].length) return null;
  const I = g.index, nIdx = I ? I.count : P.count, nT = Math.floor(nIdx / 3); if (nT < 1) return null;
  const dr = g.drawRange; if (dr.start > 0 || (dr.count !== Infinity && dr.count < nIdx)) return null;
  const V = P.count, K = KQD.m === 4 ? 4 : 2, n3 = nT * 3;
  const pos = new Float32Array(V * 3); for (let v = 0; v < V; v++) { pos[v * 3] = P.getX(v); pos[v * 3 + 1] = P.getY(v); pos[v * 3 + 2] = P.getZ(v) }
  const tv = new Uint32Array(n3); if (I) { const ia = I.array; for (let i = 0; i < n3; i++) tv[i] = ia[i] } else for (let i = 0; i < n3; i++) tv[i] = i;
  // weld vertices that sit at the same spot (non-indexed models repeat every corner)
  let x0 = 1e30, y0 = 1e30, z0 = 1e30, x1 = -1e30, y1 = -1e30, z1 = -1e30;
  for (let v = 0; v < V; v++) { const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z }
  const eps = Math.max(x1 - x0, y1 - y0, z1 - z0, 1e-3) * 2e-5;
  const wid = new Int32Array(V), rep = new Int32Array(V); let W = 0;
  { let s = 16; while (s < V * 2) s *= 2; const H = new Int32Array(s).fill(-1), qx = new Int32Array(V), qy = new Int32Array(V), qz = new Int32Array(V);
    for (let v = 0; v < V; v++) {
      const a = Math.round(pos[v * 3] / eps), b = Math.round(pos[v * 3 + 1] / eps), c = Math.round(pos[v * 3 + 2] / eps);
      let h = kdMix(Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) & (s - 1), id = -1;
      while (H[h] !== -1) { const w = H[h]; if (qx[w] === a && qy[w] === b && qz[w] === c) { id = w; break } h = (h + 1) & (s - 1) }
      if (id < 0) { id = W++; H[h] = id; qx[id] = a; qy[id] = b; qz[id] = c; rep[id] = v } wid[v] = id } }
  // face normals (length = 2 × area) and unit face normals
  const fn = new Float32Array(n3), fu = new Float32Array(n3);
  for (let t = 0; t < nT; t++) {
    const a = tv[t * 3] * 3, b = tv[t * 3 + 1] * 3, c = tv[t * 3 + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.sqrt(nx * nx + ny * ny + nz * nz);
    fn[t * 3] = nx; fn[t * 3 + 1] = ny; fn[t * 3 + 2] = nz; if (l > 0) { fu[t * 3] = nx / l; fu[t * 3 + 1] = ny / l; fu[t * 3 + 2] = nz / l }
  }
  // faces around each welded vertex
  const fc = new Int32Array(W + 1); for (let i = 0; i < n3; i++) fc[wid[tv[i]] + 1]++; for (let w = 0; w < W; w++) fc[w + 1] += fc[w];
  const fl = new Int32Array(n3), fp = fc.slice(0, W); for (let i = 0; i < n3; i++) fl[fp[wid[tv[i]]]++] = (i / 3) | 0;
  // corner normals (and colours): authored smooth normals are kept; flat / missing ones are smoothed within the crease
  const N = A.normal, C = A.color, cs = C ? C.itemSize : 0, ca = C ? C.array : null, cn = new Float32Array(n3 * 3), cc = C ? new Float32Array(n3 * cs) : null;
  const cr = KQD.crease, kn = KQD.keepN;
  for (let t = 0; t < nT; t++) { const fx = fu[t * 3], fy = fu[t * 3 + 1], fz = fu[t * 3 + 2];
    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k, v = tv[i]; let keep = false;
      if (N) { const x = N.getX(v), y = N.getY(v), z = N.getZ(v), l = Math.sqrt(x * x + y * y + z * z);
        if (l > 0 && ((x * fx + y * fy + z * fz) / l < kn || (fx === 0 && fy === 0 && fz === 0))) { keep = true; cn[i * 3] = x / l; cn[i * 3 + 1] = y / l; cn[i * 3 + 2] = z / l } }
      if (keep) { if (C) for (let j = 0; j < cs; j++) cc[i * cs + j] = ca[v * cs + j]; continue }
      const w = wid[v]; let sx = 0, sy = 0, sz = 0, nc = 0;
      for (let p = fc[w]; p < fc[w + 1]; p++) { const f = fl[p];
        if (f !== t && fu[f * 3] * fx + fu[f * 3 + 1] * fy + fu[f * 3 + 2] * fz < cr) continue;
        sx += fn[f * 3]; sy += fn[f * 3 + 1]; sz += fn[f * 3 + 2];
        if (C) { let u = tv[f * 3]; if (wid[tv[f * 3 + 1]] === w) u = tv[f * 3 + 1]; else if (wid[tv[f * 3 + 2]] === w) u = tv[f * 3 + 2]; for (let j = 0; j < cs; j++) cc[i * cs + j] += ca[u * cs + j]; nc++ } }
      const l = Math.sqrt(sx * sx + sy * sy + sz * sz);
      if (l > 0) { cn[i * 3] = sx / l; cn[i * 3 + 1] = sy / l; cn[i * 3 + 2] = sz / l } else if (fx || fy || fz) { cn[i * 3] = fx; cn[i * 3 + 1] = fy; cn[i * 3 + 2] = fz } else cn[i * 3 + 1] = 1;
      if (C) { if (nc) for (let j = 0; j < cs; j++) cc[i * cs + j] /= nc; else for (let j = 0; j < cs; j++) cc[i * cs + j] = ca[v * cs + j] }
    } }
  // edges: which faces share them, which get split (2×: each face's longest edge; 4×: all three)
  const ET = kdTab(n3), eA = new Int32Array(n3), eB = new Int32Array(n3), eN = new Uint16Array(n3), eS = new Uint16Array(n3), eF0 = new Int32Array(n3), eF1 = new Int32Array(n3), te = new Int32Array(n3), sk = new Uint8Array(nT);
  let nE = 0;
  for (let t = 0; t < nT; t++) {
    let best = 0, bl = -1;
    for (let k = 0; k < 3; k++) { const a = tv[t * 3 + k], b = tv[t * 3 + (k + 1) % 3], wa = wid[a], wb = wid[b], lo = wa < wb ? wa : wb, hi = wa < wb ? wb : wa;
      let e = ET.get(lo, hi); if (e < 0) { e = nE++; ET.set(lo, hi, e); eA[e] = lo; eB[e] = hi }
      if (eN[e] === 0) eF0[e] = t; else if (eN[e] === 1) eF1[e] = t; if (eN[e] < 65535) eN[e]++; te[t * 3 + k] = e;
      const dx = pos[b * 3] - pos[a * 3], dy = pos[b * 3 + 1] - pos[a * 3 + 1], dz = pos[b * 3 + 2] - pos[a * 3 + 2], L = dx * dx + dy * dy + dz * dz; if (L > bl) { bl = L; best = k } }
    sk[t] = best; if (K === 4) { for (let k = 0; k < 3; k++) eS[te[t * 3 + k]]++ } else eS[te[t * 3 + best]]++
  }
  // the bulge of a split point on a smooth edge: the cubic (PN) curve through both ends with their normals; the same on every
  // face that shares the edge, so the surface stays closed. Hard edges, edges the faces don't all split, and odd edges stay straight.
  const ed = new Float32Array(nE * 3), eDone = new Uint8Array(nE);
  const edgeDisp = e => {
    if (eDone[e]) return; eDone[e] = 1; const n = eN[e]; if (n !== eS[e] || n > 2) return;
    const t1 = eF0[e], t2 = n === 2 ? eF1[e] : -1;
    if (t2 >= 0 && fu[t1 * 3] * fu[t2 * 3] + fu[t1 * 3 + 1] * fu[t2 * 3 + 1] + fu[t1 * 3 + 2] * fu[t2 * 3 + 2] < cr) return;
    const wa = eA[e], wb = eB[e], pa = rep[wa] * 3, pb = rep[wb] * 3; let ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0;
    for (let q = 0; q < 2; q++) { const t = q ? t2 : t1; if (t < 0) continue;
      for (let k = 0; k < 3; k++) { const i = t * 3 + k, w = wid[tv[i]]; if (w === wa) { ax += cn[i * 3]; ay += cn[i * 3 + 1]; az += cn[i * 3 + 2] } else if (w === wb) { bx += cn[i * 3]; by += cn[i * 3 + 1]; bz += cn[i * 3 + 2] } } }
    const la = Math.sqrt(ax * ax + ay * ay + az * az), lb = Math.sqrt(bx * bx + by * by + bz * bz); if (!la || !lb) return;
    ax /= la; ay /= la; az /= la; bx /= lb; by /= lb; bz /= lb;
    const dx = pos[pb] - pos[pa], dy = pos[pb + 1] - pos[pa + 1], dz = pos[pb + 2] - pos[pa + 2], w01 = dx * ax + dy * ay + dz * az, w10 = -(dx * bx + dy * by + dz * bz);
    let x = -(w01 * ax + w10 * bx) / 8, y = -(w01 * ay + w10 * by) / 8, z = -(w01 * az + w10 * bz) / 8;
    const L = Math.sqrt(dx * dx + dy * dy + dz * dz), d = Math.sqrt(x * x + y * y + z * z), cap = .25 * L; if (d > cap) { x *= cap / d; y *= cap / d; z *= cap / d }
    ed[e * 3] = x; ed[e * 3 + 1] = y; ed[e * 3 + 2] = z
  };
  // output vertices: every attribute is carried over; split points take the average (bone weights merged, strongest four kept)
  const MX = n3 + (K === 4 ? n3 : nT) + 8;   // corners + split points, at most
  const names = Object.keys(A).filter(k => !A[k].isInstancedBufferAttribute && k !== 'position' && k !== 'normal' && !(k === 'color' && C));
  const ar = names.map(k => { const a = A[k]; return { k, a, s: a.itemSize, src: a.array, int: !(a.array instanceof Float32Array || a.array instanceof Float64Array), o: new a.array.constructor(MX * a.itemSize) } });
  const si = ar.find(x => x.k === 'skinIndex'), sw = ar.find(x => x.k === 'skinWeight'), skin = si && sw && si.s === 4 && sw.s === 4;
  const oP = new Float32Array(MX * 3), oN = new Float32Array(MX * 3), oC = C ? new Float32Array(MX * cs) : null, first = new Int32Array(V).fill(-1), next = new Int32Array(MX).fill(-1);
  let nOut = 0;
  const corner = i => {   // the output vertex for one face corner (shared with other corners of the same vertex, normal and colour)
    const v = tv[i], nx = cn[i * 3], ny = cn[i * 3 + 1], nz = cn[i * 3 + 2];
    for (let o = first[v]; o >= 0; o = next[o]) {
      if (Math.abs(oN[o * 3] - nx) < 1e-4 && Math.abs(oN[o * 3 + 1] - ny) < 1e-4 && Math.abs(oN[o * 3 + 2] - nz) < 1e-4) {
        let same = true; if (C) for (let c = 0; c < cs; c++) if (Math.abs(oC[o * cs + c] - cc[i * cs + c]) > 1e-3) { same = false; break } if (same) return o } }
    const o = nOut++; next[o] = first[v]; first[v] = o;
    oP[o * 3] = pos[v * 3]; oP[o * 3 + 1] = pos[v * 3 + 1]; oP[o * 3 + 2] = pos[v * 3 + 2]; oN[o * 3] = nx; oN[o * 3 + 1] = ny; oN[o * 3 + 2] = nz;
    if (C) for (let c = 0; c < cs; c++) oC[o * cs + c] = cc[i * cs + c];
    for (let j = 0; j < ar.length; j++) { const x = ar[j], s = x.s; for (let c = 0; c < s; c++) x.o[o * s + c] = x.src[v * s + c] }
    return o
  };
  const MT = kdTab(n3 + 8), bI = new Float64Array(8), bW = new Float64Array(8);
  const mid = (o1, o2, e) => {
    const lo = o1 < o2 ? o1 : o2, hi = o1 < o2 ? o2 : o1; let o = MT.get(lo, hi); if (o >= 0) return o;
    edgeDisp(e); o = nOut++; MT.set(lo, hi, o);
    for (let c = 0; c < 3; c++) oP[o * 3 + c] = (oP[o1 * 3 + c] + oP[o2 * 3 + c]) / 2 + ed[e * 3 + c];
    const nx = oN[o1 * 3] + oN[o2 * 3], ny = oN[o1 * 3 + 1] + oN[o2 * 3 + 1], nz = oN[o1 * 3 + 2] + oN[o2 * 3 + 2], l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    oN[o * 3] = nx / l; oN[o * 3 + 1] = ny / l; oN[o * 3 + 2] = nz / l;
    if (C) for (let c = 0; c < cs; c++) oC[o * cs + c] = (oC[o1 * cs + c] + oC[o2 * cs + c]) / 2;
    for (let j = 0; j < ar.length; j++) { const x = ar[j]; if (skin && (x === si || x === sw)) continue; const s = x.s;
      for (let c = 0; c < s; c++) { const v = (x.o[o1 * s + c] + x.o[o2 * s + c]) / 2; x.o[o * s + c] = x.int ? Math.round(v) : v } }
    if (skin) {   // bone influences of both ends, half each, the strongest four renormalised
      let n = 0; const ws = sw.int ? 1 / (sw.a.normalized ? (sw.src instanceof Uint8Array ? 255 : 65535) : 1) : 1;
      for (let q = 0; q < 2; q++) { const s = q ? o2 : o1; for (let c = 0; c < 4; c++) { const b = si.o[s * 4 + c], w = sw.o[s * 4 + c] * ws / 2; if (!(w > 0)) continue;
        let j = 0; while (j < n && bI[j] !== b) j++; if (j === n) { bI[n] = b; bW[n] = 0; n++ } bW[j] += w } }
      for (let a = 1; a < n; a++) { const b = bI[a], w = bW[a]; let j = a - 1; while (j >= 0 && bW[j] < w) { bI[j + 1] = bI[j]; bW[j + 1] = bW[j]; j-- } bI[j + 1] = b; bW[j + 1] = w }
      let tot = 0; for (let c = 0; c < 4 && c < n; c++) tot += bW[c]; tot = tot || 1;
      for (let c = 0; c < 4; c++) { si.o[o * 4 + c] = c < n ? bI[c] : 0; const w = c < n ? bW[c] / tot : 0; sw.o[o * 4 + c] = sw.int ? Math.round(w / ws) : w }
    }
    return o
  };
  const idx = new Uint32Array(nT * K * 3); let ni = 0;
  for (let t = 0; t < nT; t++) {
    const c0 = corner(t * 3), c1 = corner(t * 3 + 1), c2 = corner(t * 3 + 2);
    if (K === 4) { const m01 = mid(c0, c1, te[t * 3]), m12 = mid(c1, c2, te[t * 3 + 1]), m20 = mid(c2, c0, te[t * 3 + 2]);
      idx[ni++] = c0; idx[ni++] = m01; idx[ni++] = m20; idx[ni++] = m01; idx[ni++] = c1; idx[ni++] = m12; idx[ni++] = m20; idx[ni++] = m12; idx[ni++] = c2; idx[ni++] = m01; idx[ni++] = m12; idx[ni++] = m20 }
    else { const k = sk[t], a = k === 0 ? c0 : k === 1 ? c1 : c2, b = k === 0 ? c1 : k === 1 ? c2 : c0, c = k === 0 ? c2 : k === 1 ? c0 : c1, m = mid(a, b, te[t * 3 + k]);
      idx[ni++] = a; idx[ni++] = m; idx[ni++] = c; idx[ni++] = m; idx[ni++] = b; idx[ni++] = c }
  }
  const G = g.isInstancedBufferGeometry ? new THREE.InstancedBufferGeometry() : new THREE.BufferGeometry();
  if (g.isInstancedBufferGeometry) G.instanceCount = g.instanceCount;
  for (const k in A) if (A[k].isInstancedBufferAttribute) G.setAttribute(k, A[k]);
  G.setAttribute('position', new THREE.BufferAttribute(oP.slice(0, nOut * 3), 3)); G.setAttribute('normal', new THREE.BufferAttribute(oN.slice(0, nOut * 3), 3));
  if (C) { const out = new ca.constructor(nOut * cs), fl32 = ca instanceof Float32Array || ca instanceof Float64Array; for (let i = 0; i < nOut * cs; i++) out[i] = fl32 ? oC[i] : Math.round(oC[i]); G.setAttribute('color', new THREE.BufferAttribute(out, cs, C.normalized)) }
  for (const x of ar) G.setAttribute(x.k, new THREE.BufferAttribute(x.o.slice(0, nOut * x.s), x.s, x.a.normalized));
  G.setIndex(new THREE.BufferAttribute(nOut > 65535 ? idx : new Uint16Array(idx), 1));
  (g.groups || []).forEach(gr => G.addGroup(gr.start * K, gr.count === Infinity ? Infinity : gr.count * K, gr.materialIndex));
  G.computeBoundingSphere(); G.computeBoundingBox(); G.userData = g.userData; G.name = g.name;
  KQD.st.tin += nT; KQD.st.tout += nT * K;
  return G
}

// ---------------- the cache: refined copies by geometry, rebuilt when the game changes a geometry, dropped when it frees it ----------------
function kdSig(g) { const s = [g.index, g.index && g.index.version]; for (const k in g.attributes) s.push(g.attributes[k], g.attributes[k].version); return s }
function kdSame(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true }
function kdBuild(g) {
  const t0 = performance.now(); let r = null; try { r = kdRefine(g) } catch (e) { console.warn('detail refine', e); r = null }
  KQD.st.ms += performance.now() - t0;
  const old = KQD.map.get(g); if (old && old.g) old.g.dispose();
  if (!r) { KQD.map.set(g, null); KQD.st.skip++; return }
  const rec = { g: r, sig: kdSig(g), ch: old ? old.ch : 0, t: old ? old.t : performance.now() }; KQD.map.set(g, rec); KQD.st.geo++;
  if (!old) g.addEventListener('dispose', () => { const x = KQD.map.get(g); if (x && x.g) x.g.dispose(); KQD.map.delete(g) })
}
function kdWork(ms) {   // refine waiting geometry for up to ms milliseconds
  const t0 = performance.now(); let n = 0;
  for (const g of KQD.q) { KQD.q.delete(g); kdBuild(g); n++; if (performance.now() - t0 > ms) break }
  return n
}
// one pass over what is about to be drawn: swap in the refined copies (listed in L, to give back afterwards)
function kdSwap(sc, L) {
  sc.traverseVisible(o => {
    if (!o.isMesh || !o.geometry) return; const g = o.geometry, r = KQD.map.get(g);
    if (r === undefined) { KQD.q.add(g); return }
    if (r === null) { kdNorm(o); return }
    if (r.stale) { KQD.q.add(g); return }   // waiting for its rebuild: drawn as it is meanwhile
    if (!kdSame(r.sig, kdSig(g))) {   // the game changed this geometry: rebuild it, unless it keeps changing (an animated trail…)
      const now = performance.now(); r.ch = now - r.t < 3000 ? r.ch + 1 : 1; r.t = now;
      if (r.ch >= 2) { r.g.dispose(); KQD.map.set(g, null); KQD.st.dyn++; kdNorm(o); return }
      r.stale = 1; KQD.q.add(g); return
    }
    L.push(o, g); o.geometry = r.g
  })
}
// with flat shading off, a lit mesh needs normals: give the few that never had any a set (their own geometry, once)
function kdNorm(o) { const g = o.geometry; if (!KQD.smooth || g.attributes.normal || !g.attributes.position || g.userData.kqdN) return; g.userData.kqdN = 1; try { g.computeVertexNormals() } catch (_) {} }

if (KQD.m > 1) {
  // every renderer (the game view and its shadow map, the preview windows) draws the refined copies. three r128 gives each
  // renderer its own render function (made in the constructor), so each new renderer gets the wrapper as it is made.
  const WR = THREE.WebGLRenderer;
  const KqdRenderer = function (p) {
    const r = new WR(p), R0 = r.render; KQD.rens = (KQD.rens || 0) + 1;
    r.render = function (sc, cam) {
      if (!sc || !sc.traverseVisible || KQD.off) return R0.apply(this, arguments);
      const L = [], t0 = performance.now(); try { kdSwap(sc, L) } catch (e) { console.warn('detail swap', e) } KQD.st.swapMs += performance.now() - t0;
      try { return R0.apply(this, arguments) } finally { for (let i = 0; i < L.length; i += 2) L[i].geometry = L[i + 1] }
    };
    return r
  };
  KqdRenderer.prototype = WR.prototype; THREE.WebGLRenderer = KqdRenderer;
  // smooth look: no material is flat shaded (three reads this property when it builds a shader)
  Object.defineProperty(THREE.Material.prototype, 'flatShading', { configurable: true, get() { return false }, set(_) {} });
}
// the v83 low-poly style pass (0750: low-segment round shapes, flat shading, no normal maps) never runs here
if (KQD.smooth) lpsObj = function () {};
