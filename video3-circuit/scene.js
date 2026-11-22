// Video 3 — "Code Builds a Circuit"
// Deterministic renderer: renderFrame(t) draws the scene at time t (seconds).
// 1080x1920, 28 s seamless loop. Every visual is triggered by a typed line.
(function () {
  'use strict';
  const W = 1080, H = 1920, DUR = 28;

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let r = Math.imul(s ^ (s >>> 15), 1 | s); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- palette ----------
  const C = {
    teal: '#19f0dc', tealSoft: '#5ff8ec', gold: '#ffb43a', goldHot: '#ffe2a0',
    pink: '#ff3d8b', amber: '#ffa21f', code: { id: '#2af5e0', fn: '#ff4fa8', str: '#ffa53d', param: '#9fdcff', punct: '#e6ebff', comment: '#7fae8e' },
  };

  // ---------- circuit geometry ----------
  const TOP = 830, BOT = 1680, LEFT = 170, RIGHT = 910, CAPX = 540;
  const BAT = { x: LEFT, y: 1255, w: 124, h: 240 };      // vertical, + on top
  const RES = { x: 700, y: TOP, w: 168, h: 60 };          // horizontal
  const TRN = { x: RIGHT, y: 1010, w: 128, h: 130 };      // vertical
  const CAP = { x: CAPX, y: 1255, w: 108, h: 120 };       // vertical branch
  const LEDS = [
    { x: RIGHT, y: 1200, c: C.pink }, { x: RIGHT, y: 1360, c: C.teal }, { x: RIGHT, y: 1520, c: C.amber },
    { x: 810, y: BOT, c: C.pink }, { x: 720, y: BOT, c: C.teal }, { x: 630, y: BOT, c: C.amber },
  ];
  const TRACES = [
    [[LEFT, BAT.y - BAT.h / 2], [LEFT, TOP], [CAPX, TOP]],
    [[CAPX, TOP], [RES.x - RES.w / 2, TOP]],
    [[RES.x + RES.w / 2, TOP], [RIGHT, TOP], [RIGHT, TRN.y - TRN.h / 2]],
    [[RIGHT, TRN.y + TRN.h / 2], [RIGHT, BOT]],
    [[RIGHT, BOT], [CAPX, BOT]],
    [[CAPX, BOT], [LEFT, BOT], [LEFT, BAT.y + BAT.h / 2]],
    [[CAPX, TOP], [CAPX, CAP.y - CAP.h / 2]],
    [[CAPX, BOT], [CAPX, CAP.y + CAP.h / 2]],
  ];
  // The current loop (clockwise, conventional current, out of battery +, back into −)
  const LOOP = [[LEFT, BAT.y - BAT.h / 2], [LEFT, TOP], [RIGHT, TOP], [RIGHT, BOT], [LEFT, BOT], [LEFT, BAT.y - BAT.h / 2]];

  function polyInfo(pts) {
    const seg = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1]; const l = Math.hypot(dx, dy); seg.push({ a: pts[i - 1], b: pts[i], l, s0: L }); L += l; }
    return { pts, seg, L };
  }
  function pointAt(info, s) {
    s = clamp(s, 0, info.L);
    for (const g of info.seg) { if (s <= g.s0 + g.l || g === info.seg[info.seg.length - 1]) { const k = g.l ? (s - g.s0) / g.l : 0; return { x: lerp(g.a[0], g.b[0], k), y: lerp(g.a[1], g.b[1], k), dx: (g.b[0] - g.a[0]) / g.l, dy: (g.b[1] - g.a[1]) / g.l }; } }
  }
  function partialPath(ctx, info, d) {
    ctx.beginPath(); ctx.moveTo(info.pts[0][0], info.pts[0][1]);
    for (const g of info.seg) { if (d >= g.s0 + g.l) ctx.lineTo(g.b[0], g.b[1]); else { const k = clamp((d - g.s0) / g.l); ctx.lineTo(lerp(g.a[0], g.b[0], k), lerp(g.a[1], g.b[1], k)); break; } }
  }
  const TI = TRACES.map(polyInfo);
  const LI = polyInfo(LOOP);
  // distance along the loop of each LED
  function loopDist(x, y) { let best = 0, bd = 1e9; for (let s = 0; s <= LI.L; s += 2) { const p = pointAt(LI, s); const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = s; } } return best; }
  LEDS.forEach((l) => (l.s = loopDist(l.x, l.y)));

  // ---------- code timeline ----------
  // Each entry: text, kind ('code'|'comment'), start time, chars/sec.
  const LINES = [];
  const R = rng(7);
  function addLine(text, kind, start, cps) {
    const times = []; let tt = start;
    for (let i = 0; i < text.length; i++) {
      times.push(tt);
      const ch = text[i];
      let dt = (1 / cps) * (0.72 + 0.56 * R());
      if (ch === ' ') dt *= 1.25;
      tt += dt;
    }
    const line = { text, kind, start, end: tt, times };
    LINES.push(line); return line;
  }
  const L0 = addLine('board = Circuit("simple")', 'code', -30, 20);           // typed before the video
  const L1 = addLine('traces = board.route(count=8)', 'code', -1.55, 9.2);   // half-typed at t=0
  const L1c = addLine('# traces are the wires — current flows through them', 'comment', L1.end + 0.12, 31);
  let t0 = L1c.end + 0.45;
  const PLACE = [];
  const comps = [
    ['battery', '# the battery pushes current around the loop'],
    ['resistor', '# the resistor slows current so nothing burns out'],
    ['capacitor', '# the capacitor stores charge'],
    ['transistor', '# the transistor is the switch'],
  ];
  for (const [name, cm] of comps) {
    const a = addLine(`board.place("${name}")`, 'code', t0, 30);
    const b = addLine(cm, 'comment', a.end + 0.08, 44);
    PLACE.push(a.end + 0.04);
    t0 = b.end + 0.14;
  }
  const LP = addLine('board.power()', 'code', t0 + 0.1, 22);
  const POWER_T = LP.end + 0.05;
  const LPc = addLine('# current flows in a loop — out and back', 'comment', LP.end + 0.1, 34);
  const LL = addLine('leds = board.leds(n=6)', 'code', Math.max(LPc.end + 0.7, 14.9), 24);
  const LED_T = LL.end + 0.05;
  const LLc = addLine('# LEDs light up when current flows through them', 'comment', LL.end + 0.1, 38);
  const LR = addLine('board.run()', 'code', Math.max(LLc.end + 0.6, 18.7), 18);
  const RUN_T = LR.end + 0.05;

  // trace lighting schedule (eight traces, one by one)
  const TRACE_START = [-2.3, -1.8, -1.3, -0.75, 0.6, 1.5, 2.4, 3.3];
  const TRACE_DUR = 1.55;
  const LED_ON = LEDS.map((_, i) => LED_T + 0.35 + 0.42 * i);

  // code layout (document coords)
  const CODE_X = 62, CODE_TOP = 104, CODE_BOTTOM = 648;
  const LH = { code: 62, comment: 48 }, GAP = 18;
  const FS = { code: 46, comment: 31 };
  let yy = 0;
  LINES.forEach((ln, i) => {
    ln.y = yy; yy += LH[ln.kind];
    const next = LINES[i + 1];
    if (!next || next.kind === 'code') yy += GAP;
  });
  // scroll keyframes: when a line starts, scroll so it fits in the window
  const SCROLL = LINES.map((ln) => ({ t: ln.start, o: Math.max(0, ln.y + LH[ln.kind] + 10 - (CODE_BOTTOM - CODE_TOP)) }));
  function scrollAt(t) {
    let o = 0;
    for (const k of SCROLL) { if (k.o <= o) continue; const p = easeInOut((t - (k.t - 0.25)) / 0.6); o = lerp(o, k.o, p); }
    return o;
  }

  // tokenizer for syntax colouring
  function tokens(text, kind) {
    if (kind === 'comment') return [{ s: text, c: C.code.comment }];
    const out = []; const re = /("[^"]*"?)|(\d+)|([A-Za-z_]\w*)|(\s+)|(.)/g; let m; let prevDot = false;
    while ((m = re.exec(text))) {
      const s = m[0]; let c = C.code.punct;
      if (m[1]) c = C.code.str; else if (m[2]) c = C.code.str;
      else if (m[3]) { const after = text.slice(re.lastIndex); if (s === 'Circuit') c = C.code.fn; else if (prevDot) c = C.code.fn; else if (/^=/.test(after) && !/^==/.test(after)) c = C.code.param; else c = C.code.id; }
      out.push({ s, c }); if (!m[4]) prevDot = s === '.';
    }
    // a variable followed by " =" is an assignment target, colour teal (handled above: only "x=" w/o space is param)
    return out;
  }

  // ---------- static layers (board texture) ----------
  let bgCanvas = null;
  function buildBackground() {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#050a1c'); grd.addColorStop(0.5, '#071331'); grd.addColorStop(1, '#040918');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // radial lift behind the circuit
    const rg = g.createRadialGradient(540, 1250, 50, 540, 1250, 900); rg.addColorStop(0, 'rgba(20,60,120,0.55)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    // dot grid
    g.fillStyle = 'rgba(90,140,220,0.10)';
    for (let y = 20; y < H; y += 30) for (let x = 15; x < W; x += 30) g.fillRect(x, y, 2, 2);
    // decorative dim copper routes (the board's etching)
    const r = rng(42);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 70; i++) {
      let x = Math.round(r() * 36) * 30 + 15, y = Math.round(r() * 64) * 30 + 20;
      const inCircuit = x > 120 && x < 960 && y > 780 && y < 1730; if (inCircuit) continue;
      const pts = [[x, y]]; const steps = 2 + Math.floor(r() * 4);
      for (let k = 0; k < steps; k++) { const len = (2 + Math.floor(r() * 6)) * 30; const dir = Math.floor(r() * 4); if (dir === 0) x += len; else if (dir === 1) x -= len; else if (dir === 2) y += len; else y -= len; x = clamp(x, 15, W - 15); y = clamp(y, 20, H - 20); pts.push([x, y]); }
      const codeZone = y < 680; const a = codeZone ? 0.10 : 0.22;
      g.strokeStyle = `rgba(190,130,50,${a})`; g.lineWidth = 5; g.beginPath(); pts.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      g.fillStyle = `rgba(230,170,80,${a + 0.08})`; for (const p of [pts[0], pts[pts.length - 1]]) { g.beginPath(); g.arc(p[0], p[1], 7, 0, 6.283); g.fill(); g.fillStyle = 'rgba(5,10,28,0.9)'; g.beginPath(); g.arc(p[0], p[1], 3, 0, 6.283); g.fill(); g.fillStyle = `rgba(230,170,80,${a + 0.08})`; }
    }
    // board outline
    g.save(); g.strokeStyle = 'rgba(25,240,220,0.22)'; g.lineWidth = 3; g.shadowColor = C.teal; g.shadowBlur = 18;
    roundRect(g, 40, 700, 1000, 1100, 34); g.stroke(); g.restore();
    g.fillStyle = 'rgba(6,14,40,0.55)'; roundRect(g, 42, 702, 996, 1096, 32); g.fill();
    // mounting holes
    for (const [hx, hy] of [[84, 744], [996, 744], [84, 1756], [996, 1756]]) { g.strokeStyle = 'rgba(255,180,60,0.45)'; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 14, 0, 6.283); g.stroke(); g.fillStyle = '#02050f'; g.beginPath(); g.arc(hx, hy, 9, 0, 6.283); g.fill(); }
    // un-lit copper for the 8 circuit traces + footprints (silkscreen)
    g.strokeStyle = 'rgba(150,100,40,0.55)'; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const tr of TRACES) { g.beginPath(); tr.forEach((p, j) => (j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
    g.setLineDash([8, 8]); g.strokeStyle = 'rgba(200,220,255,0.28)'; g.lineWidth = 2;
    for (const b of [BAT, CAP, TRN]) { roundRect(g, b.x - b.w / 2 - 10, b.y - b.h / 2 - 10, b.w + 20, b.h + 20, 14); g.stroke(); }
    roundRect(g, RES.x - RES.w / 2 - 10, RES.y - RES.h / 2 - 10, RES.w + 20, RES.h + 20, 14); g.stroke();
    for (const l of LEDS) { g.beginPath(); g.arc(l.x, l.y, 34, 0, 6.283); g.stroke(); }
    g.setLineDash([]);
    // pads
    const pads = []; TRACES.forEach((tr) => { pads.push(tr[0], tr[tr.length - 1]); });
    for (const p of pads) { g.fillStyle = 'rgba(220,160,70,0.75)'; g.beginPath(); g.arc(p[0], p[1], 11, 0, 6.283); g.fill(); g.fillStyle = '#030716'; g.beginPath(); g.arc(p[0], p[1], 4.5, 0, 6.283); g.fill(); }
    // soft dark band behind code for legibility
    const cg = g.createLinearGradient(0, 60, 0, 700); cg.addColorStop(0, 'rgba(2,5,16,0.55)'); cg.addColorStop(0.85, 'rgba(2,5,16,0.35)'); cg.addColorStop(1, 'rgba(2,5,16,0)');
    g.fillStyle = cg; g.fillRect(0, 60, W, 640);
    return c;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  // ---------- particles ----------
  const SPARKS = (() => { const r = rng(99); const out = []; for (let i = 0; i < 520; i++) { out.push({ b: r() * 18, burst: i % 3 === 0, s: r() * LI.L, v: 30 + r() * 70, ang: (r() - 0.5) * 2.2, life: 0.8 + r() * 1.2, sz: 1.5 + r() * 2.8, gold: r() < 0.6 }); } return out; })();
  const MOTES = (() => { const r = rng(5); const out = []; for (let i = 0; i < 46; i++) out.push({ x: r() * W, y: r() * H, a: r() * 6.28, sp: 0.15 + r() * 0.35, r: 1 + r() * 2, ph: r() * 6.28 }); return out; })();

  // ---------- drawing primitives ----------
  function glowStroke(ctx, path, color, core, k) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const layers = [[48, 0.08], [30, 0.15], [19, 0.28]];
    for (const [w, a] of layers) { ctx.strokeStyle = color; ctx.globalAlpha = a * k; ctx.lineWidth = w; path(); ctx.stroke(); }
    ctx.globalAlpha = Math.min(1, 0.95 * k); ctx.strokeStyle = color; ctx.lineWidth = 11; path(); ctx.stroke();
    ctx.globalAlpha = Math.min(1, 0.85 * k); ctx.strokeStyle = core; ctx.lineWidth = 4.5; path(); ctx.stroke();
    ctx.restore();
  }
  function radial(ctx, x, y, r, color, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(a, 0, 1);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  function shell(ctx, b, edge, glowA) {
    ctx.save();
    ctx.shadowColor = edge; ctx.shadowBlur = 26 * glowA;
    ctx.fillStyle = '#0b1026'; roundRect(ctx, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 16); ctx.fill();
    ctx.shadowBlur = 0;
    const gg = ctx.createLinearGradient(0, b.y - b.h / 2, 0, b.y + b.h / 2); gg.addColorStop(0, 'rgba(255,255,255,0.07)'); gg.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = gg; roundRect(ctx, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 16); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = 3.5; ctx.globalAlpha = 0.65 + 0.35 * glowA; roundRect(ctx, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 16); ctx.stroke();
    ctx.restore();
  }

  function drawBattery(ctx, b, on) {
    shell(ctx, b, C.gold, 0.6 + 0.4 * on);
    ctx.save();
    // terminal cap
    ctx.fillStyle = C.gold; roundRect(ctx, b.x - 22, b.y - b.h / 2 - 12, 44, 14, 4); ctx.fill();
    // charge cells
    for (let i = 0; i < 4; i++) { const yy = b.y - 78 + i * 52; ctx.fillStyle = hexA(C.gold, 0.25 + 0.6 * on * (0.6 + 0.4 * Math.sin(i))); roundRect(ctx, b.x - 36, yy, 72, 36, 6); ctx.fill(); }
    ctx.font = 'bold 40px JBM'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff4d6';
    ctx.fillText('+', b.x, b.y - b.h / 2 + 30); ctx.fillText('−', b.x, b.y + b.h / 2 - 28);
    ctx.restore();
  }
  function drawResistor(ctx, b, on) {
    shell(ctx, b, C.tealSoft, 0.6 + 0.4 * on);
    ctx.save();
    const bands = ['#ff3d8b', '#ffa21f', '#ffe14a', '#19f0dc'];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = 0.85; ctx.fillRect(b.x - 54 + i * 30, b.y - b.h / 2 + 6, 13, b.h - 12); });
    ctx.restore();
  }
  function drawCapacitor(ctx, b, on, charge) {
    shell(ctx, b, C.pink, 0.6 + 0.4 * on);
    ctx.save();
    // fill = stored charge
    const fh = (b.h - 24) * charge; ctx.fillStyle = hexA(C.pink, 0.35); roundRect(ctx, b.x - b.w / 2 + 10, b.y + b.h / 2 - 12 - fh, b.w - 20, fh, 8); ctx.fill();
    // plates symbol
    ctx.strokeStyle = '#ffd0e4'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.x, b.y - b.h / 2); ctx.lineTo(b.x, b.y - 12); ctx.moveTo(b.x - 32, b.y - 12); ctx.lineTo(b.x + 32, b.y - 12);
    ctx.moveTo(b.x - 32, b.y + 12); ctx.lineTo(b.x + 32, b.y + 12); ctx.moveTo(b.x, b.y + 12); ctx.lineTo(b.x, b.y + b.h / 2); ctx.stroke();
    if (charge > 0) radial(ctx, b.x, b.y, 90, C.pink, 0.45 * charge);
    ctx.restore();
  }
  function drawTransistor(ctx, b, on) {
    shell(ctx, b, C.amber, 0.6 + 0.4 * on);
    ctx.save();
    ctx.strokeStyle = '#ffe1b0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(b.x, b.y, 38, 0, 6.283); ctx.stroke();
    // switch blade: open when off, closed when on
    const ang = lerp(-0.75, 0, on);
    ctx.beginPath(); ctx.moveTo(b.x, b.y - b.h / 2 + 6); ctx.lineTo(b.x, b.y - 22);
    ctx.lineTo(b.x + Math.sin(ang) * 44, b.y - 22 + Math.cos(ang) * 44); ctx.moveTo(b.x, b.y + 22); ctx.lineTo(b.x, b.y + b.h / 2 - 6); ctx.stroke();
    ctx.fillStyle = '#ffe1b0'; for (const yy of [b.y - 22, b.y + 22]) { ctx.beginPath(); ctx.arc(b.x, yy, 6, 0, 6.283); ctx.fill(); }
    if (on > 0) radial(ctx, b.x, b.y, 80, C.amber, 0.55 * on);
    ctx.restore();
  }
  function drawLED(ctx, l, placeK, lit) {
    const sc = lerp(1.25, 1, easeOut(placeK)); const a = easeOut(placeK);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(l.x, l.y - (1 - easeOut(placeK)) * 26); ctx.scale(sc, sc);
    if (lit > 0) { ctx.globalAlpha = a; radial(ctx, 0, 0, 150, hexA(l.c, 0.9), 0.75 * lit); radial(ctx, 0, 0, 60, '#ffffff', 0.35 * lit); }
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0b1026'; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 6.283); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = l.c; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 6.283); ctx.stroke();
    const lens = ctx.createRadialGradient(-6, -8, 2, 0, 0, 24);
    lens.addColorStop(0, lit > 0 ? '#ffffff' : hexA(l.c, 0.55)); lens.addColorStop(0.45, hexA(l.c, 0.35 + 0.65 * lit)); lens.addColorStop(1, hexA(l.c, 0.15 + 0.5 * lit));
    ctx.fillStyle = lens; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function drawLabel(ctx, x, y, align, name, role, color, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = easeOut(k); ctx.translate(0, (1 - easeOut(k)) * 10);
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.font = '700 29px JBM'; const w1 = ctx.measureText(name).width; ctx.font = '500 24px JBM'; const w2 = ctx.measureText(role).width;
    const w = Math.max(w1, w2) + 24; const bx = align === 'left' ? x - 12 : align === 'right' ? x - w + 12 : x - w / 2;
    ctx.fillStyle = 'rgba(3,6,20,0.72)'; roundRect(ctx, bx, y - 32, w, 74, 10); ctx.fill();
    ctx.strokeStyle = hexA(color, 0.45); ctx.lineWidth = 1.5; roundRect(ctx, bx, y - 32, w, 74, 10); ctx.stroke();
    ctx.font = '700 29px JBM'; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fillText(name, x, y);
    ctx.shadowBlur = 0; ctx.font = '500 24px JBM'; ctx.fillStyle = 'rgba(235,242,255,0.92)'; ctx.fillText(role, x, y + 31);
    ctx.restore();
  }

  // ---------- the scene at time t ----------
  function drawScene(ctx, t, codeK = 1) {
    ctx.drawImage(bgCanvas, 0, 0);
    const breathe = 0.9 + 0.1 * Math.sin(t * 2.4);
    const power = easeOut((t - POWER_T) / 0.9);
    const run = easeOut((t - RUN_T) / 0.8);
    const flash = t > RUN_T ? Math.exp(-(t - RUN_T) * 2.2) : 0;
    const front = (t - POWER_T) * 820; // current front along loop (px)

    // camera push-in for the payoff
    const zoom = 1 + 0.045 * easeInOut((t - RUN_T) / 5.2);
    ctx.save(); ctx.translate(540, 1255); ctx.scale(zoom, zoom); ctx.translate(-540, -1255);

    // motes (gentle constant motion)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const m of MOTES) { const x = (m.x + Math.cos(m.a) * t * 14 * m.sp + W) % W; const y = (m.y - t * 22 * m.sp + H * 4) % H; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 1.3 + m.ph); ctx.fillStyle = '#7fe8ff'; ctx.beginPath(); ctx.arc(x, y, m.r, 0, 6.283); ctx.fill(); }
    ctx.restore();

    // traces
    TI.forEach((info, i) => {
      const p = easeOut((t - TRACE_START[i]) / TRACE_DUR);
      if (p <= 0) return;
      const d = p * info.L;
      const k = (0.85 + 0.15 * breathe) * (1 + 0.12 * power + 0.12 * run + 0.4 * flash);
      glowStroke(ctx, () => partialPath(ctx, info, d), C.teal, '#d9fffb', k);
      if (p < 1) { const tip = pointAt(info, d); radial(ctx, tip.x, tip.y, 46, '#bffff8', 0.9); radial(ctx, tip.x, tip.y, 16, '#ffffff', 1); }
    });

    // powered loop: gold overlay where the current front has passed
    if (t > POWER_T) {
      const reach = Math.min(front, LI.L);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = C.gold; ctx.globalAlpha = (0.16 + 0.08 * run) * breathe; ctx.lineWidth = 24; partialPath(ctx, LI, reach); ctx.stroke();
      ctx.globalAlpha = 0.22 + 0.1 * run; ctx.lineWidth = 5; ctx.strokeStyle = C.goldHot; partialPath(ctx, LI, reach); ctx.stroke();
      ctx.restore();
      // direction chevrons
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = C.goldHot; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      const off = (t * 70) % 120;
      for (let s = off; s < reach; s += 120) {
        const p = pointAt(LI, s); const nx = -p.dy, ny = p.dx; const near = [BAT, RES, TRN].some((b) => Math.abs(p.x - b.x) < b.w / 2 + 14 && Math.abs(p.y - b.y) < b.h / 2 + 14) || LEDS.some((l) => Math.hypot(p.x - l.x, p.y - l.y) < 44);
        if (near) continue;
        const ox = p.x + nx * 28, oy = p.y + ny * 28; ctx.globalAlpha = 0.6 * power;
        ctx.beginPath(); ctx.moveTo(ox - p.dx * 9 + nx * 7, oy - p.dy * 9 + ny * 7); ctx.lineTo(ox + p.dx * 5, oy + p.dy * 5); ctx.lineTo(ox - p.dx * 9 - nx * 7, oy - p.dy * 9 - ny * 7); ctx.stroke();
      }
      ctx.restore();
    }

    // board comes alive inside the loop once current flows
    if (power > 0) { const g = ctx.createRadialGradient(540, 1255, 60, 540, 1255, 620); g.addColorStop(0, hexA(C.teal, 0.10 * power + 0.10 * run)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOT - TOP); ctx.restore(); }
    // components (settle in gently: drop + scale + fade)
    const placeK = PLACE.map((pt) => clamp((t - pt) / 0.75));
    const comp = [
      [BAT, (on) => drawBattery(ctx, BAT, on)],
      [RES, (on) => drawResistor(ctx, RES, on)],
      [CAP, (on) => drawCapacitor(ctx, CAP, on, easeOut((t - POWER_T - 0.4) / 2.6))],
      [TRN, (on) => drawTransistor(ctx, TRN, on)],
    ];
    comp.forEach(([b, fn], i) => {
      const k = placeK[i]; if (k <= 0) return;
      const e = easeOut(k);
      ctx.save(); ctx.globalAlpha = e; ctx.translate(b.x, b.y - (1 - e) * 40); ctx.scale(lerp(1.18, 1, e), lerp(1.18, 1, e)); ctx.translate(-b.x, -b.y);
      if (k < 1) radial(ctx, b.x, b.y, 140, hexA(C.teal, 0.8), 0.5 * (1 - k));
      fn(power); ctx.restore();
    });

    // current pulses travelling the loop
    if (t > POWER_T) {
      const spacing = 150; ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; ; k++) {
        const s = front - k * spacing; if (s < 0) break; if (k > 200) break;
        if (front > LI.L && s < front - LI.L) break; // keep ~one loop of pulses
        const ss = s % LI.L; const p = pointAt(LI, ss);
        // comet tail follows the trace (around corners too)
        ctx.fillStyle = '#ffa526';
        for (let j = 1; j <= 9; j++) { const d = ss - j * 12; if (d < 0 || s - j * 12 < 0) break; const q = pointAt(LI, d); ctx.globalAlpha = 0.75 * (1 - j / 10); ctx.beginPath(); ctx.arc(q.x, q.y, 7.5 * (1 - j / 14), 0, 6.283); ctx.fill(); }
        ctx.globalAlpha = 1;
        radial(ctx, p.x, p.y, 48 + 10 * run, '#ffa526', 1); radial(ctx, p.x, p.y, 15, '#fff3d0', 1);
      }
      // charging pulses into the capacitor branch (fade as it fills)
      const ch = 1 - easeOut((t - POWER_T - 0.4) / 3.0);
      if (ch > 0.02 && t > POWER_T + 0.4) {
        for (let k = 0; k < 6; k++) {
          const u = (((t - POWER_T) * 1.4 + k / 3) % 2) / 2; if (u > 1) continue;
          for (const [info, dir] of [[TI[6], 1], [TI[7], 1]]) { const p = pointAt(info, (dir ? u : 1 - u) * info.L); radial(ctx, p.x, p.y, 26, '#ff9ccc', 0.8 * ch); radial(ctx, p.x, p.y, 8, '#ffffff', ch); }
        }
      }
      ctx.restore();
    }

    // LEDs
    LEDS.forEach((l, i) => {
      const pk = clamp((t - (LED_T + 0.08 * i)) / 0.55); if (pk <= 0) return;
      let lit = easeOut((t - LED_ON[i]) / 0.45);
      if (lit > 0) {
        // brighten as a pulse reaches it
        let boost = 0; const spacing = 150; const rel = ((front - l.s) % spacing + spacing) % spacing; boost = Math.exp(-rel / 45);
        lit = lit * (0.78 + 0.22 * boost) * (1 + 0.25 * run);
      }
      drawLED(ctx, l, pk, clamp(lit, 0, 1.25));
    });

    // sparks of current drifting off the loop
    if (t > POWER_T) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const sp of SPARKS) {
        const born = sp.burst ? RUN_T + sp.b * 0.33 : POWER_T + sp.b; const age = t - born; if (age < 0 || age > sp.life) continue;
        const s0 = (sp.s); if (s0 > front) continue; const p = pointAt(LI, s0); const nx = -p.dy, ny = p.dx;
        const dist = sp.v * age * (1 + run * 0.6); const x = p.x + (nx * Math.cos(sp.ang) + p.dx * Math.sin(sp.ang)) * dist; const y = p.y + (ny * Math.cos(sp.ang) + p.dy * Math.sin(sp.ang)) * dist - age * 12;
        const a = Math.sin(Math.PI * age / sp.life);
        ctx.globalAlpha = a; ctx.fillStyle = sp.gold ? '#ffd27a' : '#7ffff2'; ctx.beginPath(); ctx.arc(x, y, sp.sz, 0, 6.283); ctx.fill();
      }
      ctx.restore();
    }

    // labels (stay once placed)
    const lk = PLACE.map((pt) => clamp((t - pt - 0.3) / 0.5));
    drawLabel(ctx, 248, BAT.y - 10, 'left', 'BATTERY', 'pushes current', C.gold, lk[0]);
    drawLabel(ctx, RES.x, TOP + 82, 'center', 'RESISTOR', 'slows current', C.tealSoft, lk[1]);
    drawLabel(ctx, CAPX + 74, CAP.y - 10, 'left', 'CAPACITOR', 'stores charge', '#ff7fb5', lk[2]);
    drawLabel(ctx, RIGHT - 86, TRN.y - 10, 'right', 'TRANSISTOR', 'the switch', C.amber, lk[3]);

    // run flash
    if (flash > 0.001) radial(ctx, 540, 1255, 900, 'rgba(120,255,240,1)', 0.22 * flash);
    ctx.restore(); // camera

    // hook text
    const hk = 1 - smooth(1.15, 1.95, t);
    if (hk > 0) {
      ctx.save(); ctx.globalAlpha = hk; ctx.font = '600 36px JBM'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText('watch code build a circuit').width;
      ctx.fillStyle = 'rgba(2,5,16,0.78)'; roundRect(ctx, 540 - tw / 2 - 26, 1452, tw + 52, 64, 32); ctx.fill();
      ctx.strokeStyle = 'rgba(25,240,220,0.5)'; ctx.lineWidth = 2; roundRect(ctx, 540 - tw / 2 - 26, 1452, tw + 52, 64, 32); ctx.stroke();
      ctx.fillStyle = '#f2fbff'; ctx.fillText('watch code build a circuit', 540, 1485); ctx.restore();
    }

    drawCode(ctx, t, codeK * (1 - 0.3 * easeOut((t - RUN_T - 0.6) / 1.2)));
  }

  let CW = 0, CWc = 0;
  function drawCode(ctx, t, alpha) {
    const off = scrollAt(t);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, CODE_TOP - 62, W, CODE_BOTTOM - CODE_TOP + 70); ctx.clip();
    ctx.textBaseline = 'alphabetic';
    let active = null;
    for (const ln of LINES) {
      let n = 0; for (const ct of ln.times) if (ct <= t) n++; else break;
      if (n === 0) continue;
      if (n < ln.text.length || t < ln.end + 0.12) active = { ln, n };
      else active = active || null;
      const y = CODE_TOP + ln.y - off + (ln.kind === 'code' ? 46 : 34);
      if (y < CODE_TOP - 70 || y > CODE_BOTTOM + 60) continue;
      const fade = clamp((y - (CODE_TOP - 20)) / 70);
      ctx.globalAlpha = alpha * fade;
      ctx.font = ln.kind === 'code' ? '700 46px JBM' : '500 31px JBM';
      const cw = ln.kind === 'code' ? CW : CWc;
      let x = CODE_X; let typed = 0;
      for (const tok of tokens(ln.text, ln.kind)) {
        const s = tok.s.slice(0, Math.max(0, n - typed)); typed += tok.s.length;
        if (!s) break;
        ctx.fillStyle = tok.c; ctx.shadowColor = tok.c; ctx.shadowBlur = ln.kind === 'code' ? 14 : 4;
        ctx.fillText(s, x, y); x += s.length * cw;
      }
      ln._cursor = { x: CODE_X + n * cw, y, kind: ln.kind };
    }
    // cursor: on the last line that has started typing
    let cur = null; for (const ln of LINES) { if (ln.times[0] <= t) cur = ln; }
    if (cur && cur._cursor) {
      const typing = t < cur.end + 0.1; const blink = typing ? 1 : (Math.floor((t - cur.end) * 2.2) % 2 === 0 ? 1 : 0.15);
      const h = cur.kind === 'code' ? 50 : 34; const cx = cur._cursor.x + 3, cy = cur._cursor.y - h + 8;
      ctx.globalAlpha = alpha * blink; ctx.shadowColor = C.teal; ctx.shadowBlur = 16; ctx.fillStyle = C.teal; ctx.fillRect(cx, cy, cur.kind === 'code' ? 5 : 4, h);
    }
    ctx.restore();
  }

  // ---------- public ----------
  let ctxMain, offA, offB;
  window.setupScene = async function () {
    await document.fonts.load('700 46px JBM'); await document.fonts.load('500 30px JBM'); await document.fonts.load('600 36px JBM');
    const cv = document.getElementById('c'); ctxMain = cv.getContext('2d');
    bgCanvas = buildBackground();
    offA = document.createElement('canvas'); offA.width = W; offA.height = H;
    offB = document.createElement('canvas'); offB.width = W; offB.height = H;
    const m = ctxMain; m.font = '700 46px JBM'; CW = m.measureText('M').width; m.font = '500 31px JBM'; CWc = m.measureText('M').width;
    return true;
  };
  // Loop: 25.0–28.0 the finished board dissolves into the opening state (t-28 ⇒ 0 at the wrap).
  const DIS0 = 25.0;
  window.renderFrame = function (t) {
    if (t < DIS0) { drawScene(ctxMain, t); return; }
    const a = easeInOut((t - DIS0) / (DUR - DIS0));
    const ga = offA.getContext('2d'), gb = offB.getContext('2d');
    drawScene(ga, t, 1 - smooth(DIS0, 26.3, t)); drawScene(gb, t - DUR, smooth(26.2, 27.7, t));
    ctxMain.globalAlpha = 1; ctxMain.drawImage(offA, 0, 0);
    ctxMain.globalAlpha = a; ctxMain.drawImage(offB, 0, 0); ctxMain.globalAlpha = 1;
  };
  window.SCHEDULE = {
    lines: LINES.map((l) => ({ text: l.text, kind: l.kind, start: l.start, end: l.end, times: l.times })),
    place: PLACE, power: POWER_T, ledT: LED_T, ledOn: LED_ON, run: RUN_T, traceStart: TRACE_START, dur: DUR,
  };
})();
