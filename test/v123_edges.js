// v123 clean edges: run with `python3 probe.py v123_edges.js`. Prints ok:true when every check passes.
() => {
  const bad = [], D = MAP.DW, st = window.V123 || {};
  if (!(st.stones > 1000)) bad.push('few edge stones ' + st.stones);
  if (!(st.back > 300)) bad.push('few back-row pieces ' + st.back);
  const per = {};
  for (const I of INSL) {
    const o = per[I.n] = { rimNode: 0, rimRock: 0, grove: 0, groveNode: 0, adj: 0, nearRoad: 0, stones: 0 };
    for (let y = I.y0; y < I.y0 + I.h; y++) for (let x = I.x0; x < I.x0 + I.w; x++) {
      const t = MAP[y][x], k = y * W + x;
      if (t == '#' && D[k] >= 0 && NODE[k]) o.rimNode++;
      if (t == '#' && D[k] < 0) {
        o.grove++; if (NODE[k]) o.groveNode++;
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && MAP[y + j][x + i] == '#' && D[(y + j) * W + x + i] < 0) o.adj++;
        if (I.path.some(q => Math.hypot(q[0] - x, q[1] - y) < (I.g % 5 == 1 && [0, 2, 4].includes(I.z) ? 4.5 : 7))) o.nearRoad++;
      }
    }
    if (o.rimNode) bad.push(I.n + ': choppable rim trees ' + o.rimNode);
    if (I.fld && I.z !== 5 && o.grove < 15) bad.push(I.n + ': few grove trees ' + o.grove);
    if (o.grove !== o.groveNode) bad.push(I.n + ': grove trees without a node ' + (o.grove - o.groveNode));
    if (o.adj) bad.push(I.n + ': grove trees touching ' + o.adj);
    if (o.nearRoad) bad.push(I.n + ': grove trees by the road ' + o.nearRoad);
  }
  // the edge pieces: stones never overlap each other badly, back pieces never stand on the walkable ground
  const E = WD.list.filter(d => /^e_/.test(d.k) || d.e123);
  let close = 0, onWalk = 0;
  const g = new Map(), key = (x, z) => Math.floor(z / 3) * 4096 + Math.floor(x / 3);
  WD.list.forEach(d => { if (D[Math.round(d.z) * W + Math.round(d.x)] >= 0) { const k = key(d.x, d.z); (g.get(k) || g.set(k, []).get(k)).push(d) } });
  E.forEach(d => {
    if (D[Math.round(d.z) * W + Math.round(d.x)] < -.6) onWalk++;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) (g.get(key(d.x + i * 3, d.z + j * 3)) || []).forEach(q => { if (q !== d && Math.hypot(q.x - d.x, q.z - d.z) < 1.2) close++ })
  });
  if (close) bad.push('edge pieces overlapping: ' + close / 2);
  if (onWalk) bad.push('edge pieces on walkable ground: ' + onWalk);
  // chopping a grove tree works, and the tree comes back as a choppable tree
  const I = PMAP[1].ins[0]; insArrive(I);
  let tk = -1; for (let y = I.y0; y < I.y0 + I.h && tk < 0; y++) for (let x = I.x0; x < I.x0 + I.w; x++) if (MAP[y][x] == '#' && D[y * W + x] < 0) { tk = y * W + x; break }
  const tx = tk % W, ty = Math.floor(tk / W); toPos(tx + 1, ty, 0); const tg = gTarget();
  if (!tg || tg.kind != 'tree') bad.push('grove tree not choppable: ' + JSON.stringify(tg));
  // a rim tile next to the walkable edge is not a target
  let rk = -1; for (let y = I.y0 + 2; y < I.y0 + I.h - 2 && rk < 0; y++) for (let x = I.x0 + 2; x < I.x0 + I.w - 2; x++) if (MAP[y][x] == '#' && D[y * W + x] >= 0 && D[y * W + x] < .6) { rk = y * W + x; break }
  if (rk >= 0) { const x = rk % W, y = Math.floor(rk / W); let wx = x, wy = y; for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (D[(y + j) * W + x + i] < 0) { wx = x + i; wy = y + j } toPos(wx, wy, 0); const t2 = gTarget(); if (t2 && t2.kind == 'tree' && t2.k == rk) bad.push('rim tree still choppable') }
  return { ok: !bad.length, bad: bad.slice(0, 30), st, edges: E.length, groves: Object.fromEntries(Object.entries(per).filter(([n, o]) => o.grove).map(([n, o]) => [n, o.grove])) };
}
