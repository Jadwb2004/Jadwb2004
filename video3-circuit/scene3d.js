// Video 3 v2 — "Code Builds a Circuit" — 3D build, no comments, calm.
// Deterministic: setState(t) poses the whole scene for time t; renderFrame(t) draws it.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, DUR = 28;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeOutBack = (x) => { x = clamp(x); const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let r = Math.imul(s ^ (s >>> 15), 1 | s); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

const COL = { teal: 0x19f0dc, gold: 0xffb43a, pink: 0xff3d8b, amber: 0xffa21f, copper: 0xc47a3a };

// ---------------- timeline (9 lines, no comments) ----------------
const R = rng(11);
const LINES = [];
function addLine(text, start, cps) {
  const times = []; let tt = start;
  for (let i = 0; i < text.length; i++) { times.push(tt); let dt = (1 / cps) * (0.7 + 0.6 * R()); if (text[i] === ' ') dt *= 1.3; if (text[i] === '(' || text[i] === '.') dt *= 1.2; tt += dt; }
  const l = { text, start, end: tt, times }; LINES.push(l); return l;
}
addLine('board = Circuit("simple")', -40, 12);
const L_ROUTE = addLine('traces = board.route(count=8)', -1.6, 9);
let t0 = 4.15; const PLACE = [];
for (const n of ['battery', 'resistor', 'capacitor', 'transistor']) { const l = addLine(`board.place("${n}")`, t0, 17); PLACE.push(l.end + 0.06); t0 = l.end + 0.42; }
const L_POW = addLine('board.power()', 11.85, 13);
const POWER_T = L_POW.end + 0.08;
const L_LED = addLine('leds = board.leds(n=6)', 13.95, 15);
const LED_T = L_LED.end + 0.06;
const L_RUN = addLine('board.run()', 18.35, 12);
const RUN_T = L_RUN.end + 0.08;

// ---------------- circuit layout (world units, board top at y=0) ----------------
const X0 = -3.6, X1 = 3.6, Z0 = -4.6, Z1 = 4.6, CX = -0.8;
const BAT = { x: X0, z: 0, half: 1.75 };
const RES = { x: 1.5, z: Z0, half: 1.05 };
const TRN = { x: X1, z: -2.15, half: 0.95 };
const CAP = { x: CX, z: 0, half: 1.05 };
const LEDP = [
  { x: X1, z: -0.05, c: COL.pink }, { x: X1, z: 1.55, c: COL.teal }, { x: X1, z: 3.15, c: COL.amber },
  { x: 2.3, z: Z1, c: COL.pink }, { x: 1.1, z: Z1, c: COL.teal }, { x: -0.1, z: Z1, c: COL.amber },
];
const TRACES = [
  [[X0, -BAT.half], [X0, Z0], [CX, Z0]],
  [[CX, Z0], [RES.x - RES.half, Z0]],
  [[RES.x + RES.half, Z0], [X1, Z0], [X1, TRN.z - TRN.half]],
  [[X1, TRN.z + TRN.half], [X1, Z1]],
  [[X1, Z1], [CX, Z1]],
  [[CX, Z1], [X0, Z1], [X0, BAT.half]],
  [[CX, Z0], [CX, -CAP.half]],
  [[CX, Z1], [CX, CAP.half]],
];
const TRACE_START = [-2.5, -1.95, -1.4, -0.7, 0.55, 1.35, 2.15, 2.95];
const TRACE_DUR = 1.7;
// current loop: out of battery + (far end), clockwise, back into battery −
const LOOP = [[X0, -BAT.half], [X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1], [X0, -BAT.half]];
function poly(pts) { const seg = []; let L = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push({ a, b, l, s0: L }); L += l; } return { pts, seg, L }; }
function at(info, s) { s = ((s % info.L) + info.L) % info.L; for (const g of info.seg) if (s <= g.s0 + g.l) { const k = (s - g.s0) / g.l; return [lerp(g.a[0], g.b[0], k), lerp(g.a[1], g.b[1], k)]; } const g = info.seg[info.seg.length - 1]; return [g.b[0], g.b[1]]; }
const LI = poly(LOOP);
function loopS(x, z) { let best = -1, bd = 1e9; for (let s = 0; s < LI.L; s += 0.02) { const p = at(LI, s); const d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; best = s; } } return bd < 0.05 ? best : -1; }
LEDP.forEach((l) => (l.s = loopS(l.x, l.z)));
const PULSE_SPEED = 7.6, N_PULSE = 3, PULSE_GAP = LI.L / PULSE_SPEED / N_PULSE;
const LED_LIT = LEDP.map((l, i) => {
  // light when the first pulse after the LED has landed reaches it
  const ready = LED_T + 0.25 + 0.1 * i;
  let best = 1e9;
  for (let k = 0; k < N_PULSE; k++) { const emit = POWER_T + k * PULSE_GAP; for (let lap = 0; lap < 6; lap++) { const tt = emit + (l.s + lap * LI.L) / PULSE_SPEED; if (tt >= ready && tt < best) best = tt; } }
  return best;
});

// ---------------- three setup ----------------
let renderer, scene, camera, composer, glCanvas, out2d, outCtx, bufA, bufB;
const chunks = [];      // trace pieces
const comps = [];       // component groups
const leds = [];
const pulses = [];
const revealU = { uReveal: { value: 0 }, uRadius: { value: 0 }, uBase: { value: 0.0 } };
let boardMat, keyLight, warmFill, hemi;
const CAM_A = new THREE.Vector3(0, 21.5, 13.2), CAM_TGT = new THREE.Vector3(0, 0, -3.6);

function boardTexture() {
  const TW = 2048, TH = 4096; const BW = 15, BD = 34, BZ = -5; // board w/d/centre z
  const toPx = (x, z) => [(x + BW / 2) / BW * TW, (z - BZ + BD / 2) / BD * TH];
  const pxU = TW / BW;
  const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d');
  const e = document.createElement('canvas'); e.width = TW; e.height = TH; const ge = e.getContext('2d');
  ge.fillStyle = '#000'; ge.fillRect(0, 0, TW, TH);
  const grd = g.createLinearGradient(0, 0, TW, TH); grd.addColorStop(0, '#0b1a4a'); grd.addColorStop(0.5, '#0a1640'); grd.addColorStop(1, '#081236');
  g.fillStyle = grd; g.fillRect(0, 0, TW, TH);
  const r = rng(21);
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '40,80,160' : '0,0,20'},${0.08 + r() * 0.1})`; g.fillRect(r() * TW, r() * TH, 2, 2); }
  g.strokeStyle = 'rgba(80,130,230,0.09)'; g.lineWidth = 2;
  for (let x = 0; x < TW; x += pxU * 0.5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TH); g.stroke(); }
  for (let y = 0; y < TH; y += pxU * 0.5) { g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y); g.stroke(); }
  // decorative copper routes (dim on the board, bright in the emissive map → glow at run)
  const keepOut = (x, z) => (Math.abs(x - X0) < 0.7 && z > Z0 - 0.7 && z < Z1 + 0.7) || (Math.abs(x - X1) < 0.75 && z > Z0 - 0.7 && z < Z1 + 0.7) || (Math.abs(z - Z0) < 0.7 && x > X0 - 0.7 && x < X1 + 0.7) || (Math.abs(z - Z1) < 0.75 && x > X0 - 0.7 && x < X1 + 0.7) || (Math.abs(x - CX) < 0.95 && z > Z0 && z < Z1) || (Math.abs(x - X0) < 1.4 && Math.abs(z) < 2.2) || (Math.abs(x - X1 + 0.3) < 1.5 && Math.abs(z - TRN.z) < 1.3);
  g.lineCap = ge.lineCap = 'round'; g.lineJoin = ge.lineJoin = 'round';
  for (let i = 0; i < 260; i++) {
    let x = Math.round((r() * 14 - 7) * 4) / 4, z = Math.round((r() * 32 + BZ - 16) * 4) / 4;
    const pts = [[x, z]]; let ok = !keepOut(x, z);
    for (let k = 0; k < 2 + Math.floor(r() * 4) && ok; k++) {
      const len = (1 + Math.floor(r() * 8)) * 0.25; const d = Math.floor(r() * 4);
      const nx = x + (d === 0 ? len : d === 1 ? -len : 0), nz = z + (d === 2 ? len : d === 3 ? -len : 0);
      let bad = false; for (let s = 0; s <= 1; s += 0.1) if (keepOut(lerp(x, nx, s), lerp(z, nz, s))) bad = true;
      if (bad) break; x = nx; z = nz; pts.push([x, z]);
    }
    if (pts.length < 2) continue;
    const w = (0.06 + r() * 0.08) * pxU;
    for (const [ctx, col, ww] of [[g, 'rgba(185,120,55,0.42)', w], [ge, '#ffb040', w * 0.8]]) {
      ctx.strokeStyle = col; ctx.lineWidth = ww; ctx.beginPath(); pts.forEach((p, j) => { const [px, py] = toPx(p[0], p[1]); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
      for (const p of [pts[0], pts[pts.length - 1]]) { const [px, py] = toPx(p[0], p[1]); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, ww * 1.4, 0, 6.283); ctx.fill(); }
    }
    // vias
    for (const p of [pts[0], pts[pts.length - 1]]) { const [px, py] = toPx(p[0], p[1]); g.fillStyle = '#050a1c'; g.beginPath(); g.arc(px, py, w * 0.6, 0, 6.283); g.fill(); }
  }
  // decorative chip footprints (silkscreen) outside the loop
  g.strokeStyle = 'rgba(210,225,255,0.22)'; g.lineWidth = 4;
  for (const [x, z, w, d] of [[-5.6, -9, 1.6, 2.4], [5.2, -10, 1.8, 1.8], [-5.6, 8, 1.4, 1.4], [5.4, 7.5, 1.6, 2.2], [0, -8.2, 3.2, 1.2], [0, 7.6, 2.4, 1]]) {
    const [px, py] = toPx(x - w / 2, z - d / 2); g.strokeRect(px, py, w * pxU, d * pxU);
    g.fillStyle = 'rgba(220,160,70,0.55)'; for (let k = 0; k < 6; k++) { const [qx, qy] = toPx(x - w / 2 + (k + 0.5) * w / 6, z - d / 2 - 0.2); g.fillRect(qx - 6, qy - 10, 12, 20); const [sx, sy] = toPx(x - w / 2 + (k + 0.5) * w / 6, z + d / 2 + 0.2); g.fillRect(sx - 6, sy - 10, 12, 20); }
  }
  // unlit copper footprints of the 8 traces (the route to be lit)
  g.strokeStyle = 'rgba(160,100,45,0.75)'; g.lineWidth = 0.46 * pxU;
  for (const tr of TRACES) { g.beginPath(); tr.forEach((p, j) => { const [px, py] = toPx(p[0], p[1]); j ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); }
  // silkscreen outlines & refs
  g.setLineDash([18, 14]); g.strokeStyle = 'rgba(220,235,255,0.35)'; g.lineWidth = 5;
  const box = (x, z, w, d) => { const [px, py] = toPx(x - w / 2, z - d / 2); g.strokeRect(px, py, w * pxU, d * pxU); };
  box(BAT.x, BAT.z, 1.6, 3.9); box(RES.x, RES.z, 2.5, 1.1); box(CAP.x, CAP.z, 1.9, 2.2); box(TRN.x, TRN.z, 1.8, 2.1);
  for (const l of LEDP) { const [px, py] = toPx(l.x, l.z); g.beginPath(); g.arc(px, py, 0.72 * pxU, 0, 6.283); g.stroke(); }
  g.setLineDash([]);
  g.font = `bold ${0.32 * pxU}px JBM`; g.fillStyle = 'rgba(220,235,255,0.4)';
  const ref = (s, x, z) => { const [px, py] = toPx(x, z); g.fillText(s, px, py); };
  ref('B1', X0 - 0.95, -2.2); ref('R1', RES.x - 0.2, Z0 - 0.75); ref('C1', CX + 0.95, -1.2); ref('Q1', X1 + 0.95, TRN.z - 1.2);
  LEDP.forEach((l, i) => ref('D' + (i + 1), l.x + (l.x === X1 ? 0.8 : -0.25), l.z + (l.x === X1 ? 0.1 : 1.0)));
  // mounting holes
  for (const [x, z] of [[-6.3, -11], [6.3, -11], [-6.3, 9.5], [6.3, 9.5]]) { const [px, py] = toPx(x, z); g.strokeStyle = 'rgba(255,180,70,0.7)'; g.lineWidth = 22; g.beginPath(); g.arc(px, py, 50, 0, 6.283); g.stroke(); g.fillStyle = '#02040c'; g.beginPath(); g.arc(px, py, 36, 0, 6.283); g.fill(); ge.strokeStyle = '#ffb040'; ge.lineWidth = 18; ge.beginPath(); ge.arc(px, py, 50, 0, 6.283); ge.stroke(); }
  // pads at trace ends
  for (const tr of TRACES) for (const p of [tr[0], tr[tr.length - 1]]) { const [px, py] = toPx(p[0], p[1]); g.fillStyle = 'rgba(235,175,80,0.95)'; g.beginPath(); g.arc(px, py, 0.32 * pxU, 0, 6.283); g.fill(); g.fillStyle = '#060b1e'; g.beginPath(); g.arc(px, py, 0.12 * pxU, 0, 6.283); g.fill(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const etex = new THREE.CanvasTexture(e); etex.colorSpace = THREE.SRGBColorSpace;
  return { tex, etex, BW, BD, BZ };
}

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.18, 'rgba(255,255,255,0.75)'); r.addColorStop(0.45, 'rgba(255,255,255,0.22)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); return t;
}
let GLOW;
function sprite(color, scale, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
  const s = new THREE.Sprite(m); s.scale.set(scale, scale, 1); return s;
}
const std = (o) => new THREE.MeshStandardMaterial(o);

function buildTraces() {
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  TRACES.forEach((tr, ti) => {
    const info = poly(tr); const step = 0.25;
    for (const g of info.seg) {
      const n = Math.max(1, Math.round(g.l / step));
      for (let k = 0; k < n; k++) {
        const s0 = g.s0 + (k / n) * g.l, s1 = g.s0 + ((k + 1) / n) * g.l; const sm = (s0 + s1) / 2;
        const p = [lerp(g.a[0], g.b[0], (sm - g.s0) / g.l), lerp(g.a[1], g.b[1], (sm - g.s0) / g.l)];
        const horiz = Math.abs(g.b[0] - g.a[0]) > 1e-6; const len = (s1 - s0) + 0.02;
        const mat = std({ color: 0x0d3a3a, metalness: 0.6, roughness: 0.35, emissive: 0x00e0cc, emissiveIntensity: 0 });
        const m = new THREE.Mesh(geo, mat); m.position.set(p[0], 0, p[1]);
        m.userData = { ti, s: sm, sx: horiz ? len : 0.48, sz: horiz ? 0.48 : len, loopS: loopS(p[0], p[1]) };
        scene.add(m); chunks.push(m);
      }
    }
    // rounded joints at corners/ends
    for (let j = 0; j < tr.length; j++) {
      const s = j === 0 ? 0 : info.seg[j - 1].s0 + info.seg[j - 1].l;
      const mat = std({ color: 0x0d3a3a, metalness: 0.6, roughness: 0.35, emissive: 0x00e0cc, emissiveIntensity: 0 });
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 24).translate(0, 0.5, 0), mat);
      m.position.set(tr[j][0], 0, tr[j][1]); m.userData = { ti, s, sx: 1, sz: 1, joint: true, loopS: loopS(tr[j][0], tr[j][1]) }; scene.add(m); chunks.push(m);
    }
  });
}

function edgeGlowMat(color, k = 2) { return std({ color: 0x111528, emissive: color, emissiveIntensity: k, metalness: 0.3, roughness: 0.4 }); }

function buildComponents() {
  // Battery: big cylinder cell lying along the left trace, + toward the far side
  {
    const g = new THREE.Group(); const L = 2.9, r = 0.62;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 48), std({ color: 0x14182e, metalness: 0.4, roughness: 0.35, emissive: COL.gold, emissiveIntensity: 0.05 }));
    body.rotation.x = Math.PI / 2; g.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.95, 48), std({ color: 0xffb43a, metalness: 0.6, roughness: 0.3, emissive: COL.gold, emissiveIntensity: 0.5 }));
    band.rotation.x = Math.PI / 2; band.material.emissiveIntensity = 0.18; band.position.z = -0.75; g.add(band);
    for (const z of [-L / 2, L / 2]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r - 0.02, 0.05, 12, 48), edgeGlowMat(COL.gold, 2.2)); ring.position.z = z; g.add(ring); }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 32), std({ color: 0xdfe6f0, metalness: 0.95, roughness: 0.2 })); cap.rotation.x = Math.PI / 2; cap.position.z = -L / 2 - 0.1; g.add(cap);
    // "+" mark on the gold band
    const plus = new THREE.Group(); const pm = edgeGlowMat(0xffffff, 1.4);
    plus.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.09), pm)); plus.add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.34), pm));
    plus.position.set(0, r + 0.02, -0.75); g.add(plus);
    const minus = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.09), pm); minus.position.set(0, r + 0.02, 0.95); g.add(minus);
    comps.push({ g, x: BAT.x, z: BAT.z, y: r + 0.02, depth: 2.2, color: COL.gold, body });
  }
  // Resistor: capsule with colour bands + leads, along the top trace
  {
    const g = new THREE.Group(); const r = 0.42, L = 1.25;
    const bodyMat = std({ color: 0x1a8f8a, metalness: 0.1, roughness: 0.45, emissive: COL.teal, emissiveIntensity: 0.12 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 8, 32), bodyMat); body.rotation.z = Math.PI / 2; g.add(body);
    [COL.pink, COL.amber, 0xffe14a, 0xffffff].forEach((c, i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.16, 32), std({ color: c, emissive: c, emissiveIntensity: 0.9, roughness: 0.4 })); b.rotation.z = Math.PI / 2; b.position.x = -0.55 + i * 0.34 + (i === 3 ? 0.12 : 0); g.add(b); });
    for (const s of [-1, 1]) { const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12), std({ color: 0xd9dee8, metalness: 1, roughness: 0.25 })); lead.rotation.z = Math.PI / 2; lead.position.x = s * 0.98; lead.position.y = -0.3; g.add(lead); }
    comps.push({ g, x: RES.x, z: RES.z, y: 0.46, depth: 1.6, color: COL.teal, body });
  }
  // Capacitor: upright electrolytic can, pink sleeve, charge rings that fill
  {
    const g = new THREE.Group(); const r = 0.72, h = 1.55;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), std({ color: 0x3a0f2a, metalness: 0.3, roughness: 0.35, emissive: COL.pink, emissiveIntensity: 0.15 }));
    body.position.y = h / 2; g.add(body);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.05, 48), std({ color: 0xcfd6e2, metalness: 0.95, roughness: 0.22 })); top.position.y = h + 0.02; g.add(top);
    for (const a of [0, Math.PI / 2]) { const groove = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.06), std({ color: 0x555a66, metalness: 0.8, roughness: 0.4 })); groove.position.y = h + 0.05; groove.rotation.y = a; g.add(groove); }
    const rings = [];
    for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.045, 10, 48), std({ color: 0x2a0a1c, emissive: COL.pink, emissiveIntensity: 0.25 })); m.rotation.x = Math.PI / 2; m.position.y = 0.2 + i * 0.29; g.add(m); rings.push(m); }
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 12, 48), edgeGlowMat(COL.pink, 2.2)); rim.rotation.x = Math.PI / 2; rim.position.y = h; g.add(rim);
    comps.push({ g, x: CAP.x, z: CAP.z, y: 0, depth: 1.9, color: COL.pink, body, rings });
  }
  // Transistor: TO-220 — black body, metal tab with hole, three legs; switch bar lights when ON
  {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.25, 0.5), std({ color: 0x15151c, metalness: 0.2, roughness: 0.5, emissive: COL.amber, emissiveIntensity: 0.04 }));
    body.position.set(0, 0.95, 0); g.add(body);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 0.12), std({ color: 0xc9d0dc, metalness: 1, roughness: 0.25 })); tab.position.set(0, 1.95, -0.19); g.add(tab);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 32), std({ color: 0x05060a })); hole.rotation.x = Math.PI / 2; hole.position.set(0, 2.05, -0.18); g.add(hole);
    for (const x of [-0.42, 0, 0.42]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.36, 0.08), std({ color: 0xd9dee8, metalness: 1, roughness: 0.25 })); leg.position.set(x, 0.17, 0); g.add(leg); }
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.06, 0.56), edgeGlowMat(COL.amber, 2.2)); edge.position.set(0, 1.58, 0); g.add(edge);
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.04), std({ color: 0x2a1a05, emissive: COL.amber, emissiveIntensity: 0.15 })); sw.position.set(0, 0.95, 0.27); g.add(sw);
    comps.push({ g, x: TRN.x, z: TRN.z, y: 0, depth: 2.6, color: COL.amber, body, sw });
  }
  comps.forEach((c) => {
    c.g.position.set(c.x, c.y, c.z); scene.add(c.g);
    c.halo = sprite(c.color, 4.5, 0); c.halo.position.set(c.x, 0.4, c.z); scene.add(c.halo);
    c.light = new THREE.PointLight(c.color, 0, 5, 1.6); c.light.position.set(c.x, 1.6, c.z + 0.6); scene.add(c.light);
  });
}

function buildLEDs() {
  LEDP.forEach((p) => {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.18, 40), std({ color: 0x14182a, metalness: 0.5, roughness: 0.35, emissive: p.c, emissiveIntensity: 0.3 })); base.position.y = 0.09; g.add(base);
    const domeMat = std({ color: p.c, emissive: p.c, emissiveIntensity: 0.12, roughness: 0.15, metalness: 0.0, transparent: true, opacity: 0.92 });
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 40), domeMat); cyl.position.y = 0.43; g.add(cyl);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); dome.position.y = 0.68; g.add(dome);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12), std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 })); core.position.y = 0.6; g.add(core);
    g.position.set(p.x, 0, p.z); scene.add(g);
    const halo = sprite(p.c, 5.5, 0); halo.position.set(p.x, 0.75, p.z); scene.add(halo);
    const light = new THREE.PointLight(p.c, 0, 6, 1.5); light.position.set(p.x, 1.3, p.z); scene.add(light);
    leds.push({ p, g, domeMat, core, halo, light });
  });
}

function buildPulses() {
  for (let k = 0; k < N_PULSE; k++) {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), std({ color: 0xffe0a0, emissive: 0xffc860, emissiveIntensity: 2.4 }));
    scene.add(head);
    const halo = sprite(0xff9a1a, 3.2, 1); scene.add(halo);
    const core = sprite(0xfff2c0, 1.1, 1); scene.add(core);
    const trail = []; for (let j = 0; j < 14; j++) { const s = sprite(0xff9020, 1.2, 0.5); scene.add(s); trail.push(s); }
    const light = new THREE.PointLight(0xffc060, 0, 6, 1.4); scene.add(light);
    pulses.push({ head, halo, core, trail, light });
  }
}

function boardMesh(bt) {
  boardMat = std({ map: bt.tex, emissiveMap: bt.etex, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.62, metalness: 0.15 });
  boardMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, revealU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uReveal; uniform float uRadius; uniform float uBase;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat rr = length(vWP.xz - vec2(0.0, 0.0));\nfloat wave = smoothstep(uRadius, uRadius - 4.0, rr);\nfloat edge = smoothstep(uRadius - 1.6, uRadius, rr) * smoothstep(uRadius + 0.4, uRadius, rr);\ntotalEmissiveRadiance *= uBase + uReveal * (wave * 0.9 + edge * 1.8);');
  };
  const m = new THREE.Mesh(new THREE.BoxGeometry(bt.BW, 0.5, bt.BD), [std({ color: 0x0a1230, roughness: 0.6 }), std({ color: 0x0a1230, roughness: 0.6 }), boardMat, std({ color: 0x050810 }), std({ color: 0x0c1636, emissive: COL.teal, emissiveIntensity: 0.25 }), std({ color: 0x0a1230 })]);
  m.position.set(0, -0.25, bt.BZ); scene.add(m);
}

// ---------------- state at time t ----------------
function setState(t) {
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.1);
  const power = easeOut((t - POWER_T) / 1.0);
  const run = easeOut((t - RUN_T) / 1.2);
  // camera: very slow drift always; push-in for the payoff
  const push = easeInOut((t - RUN_T) / 5.0);
  const drift = Math.sin(t / DUR * Math.PI * 2) * 0.12;
  camera.position.set(CAM_A.x + drift, lerp(CAM_A.y, CAM_A.y - 1.4, push), lerp(CAM_A.z, CAM_A.z - 1.3, push));
  camera.lookAt(CAM_TGT.x, CAM_TGT.y, lerp(CAM_TGT.z, CAM_TGT.z + 0.35, push));

  // lights: dark board at start → warm glowing board at run
  keyLight.intensity = 0.95 + 0.15 * run; warmFill.intensity = 0.3 + 0.5 * run + 0.1 * power; hemi.intensity = 0.45 + 0.1 * run;
  revealU.uBase.value = 0.05 + 0.04 * power;
  revealU.uReveal.value = 0.6 * run;
  revealU.uRadius.value = (t > RUN_T) ? Math.min(30, (t - RUN_T) * 7.5) : 0;

  // pulse heads along the loop
  const heads = [];
  for (let k = 0; k < N_PULSE; k++) { const emit = POWER_T + k * PULSE_GAP; if (t >= emit) heads.push((t - emit) * PULSE_SPEED); }

  // traces: grow up out of the board, light teal; brighten as current passes
  for (const m of chunks) {
    const u = m.userData; const info = TRACES[u.ti];
    const L = poly(info).L;
    const prog = easeOut((t - TRACE_START[u.ti]) / TRACE_DUR) * (L + 0.6);
    const k = clamp((prog - u.s) / 0.6);
    if (k <= 0) { m.visible = false; continue; }
    m.visible = true; const e = easeOut(k);
    const hgt = lerp(0.02, 0.2, e);
    if (u.joint) m.scale.set(lerp(0.4, 1, e), hgt, lerp(0.4, 1, e)); else m.scale.set(u.sx * lerp(0.5, 1, e), hgt, u.sz * lerp(0.5, 1, e));
    let em = (0.55 + 0.12 * breathe) * e + 1.1 * (1 - e);
    let col = new THREE.Color(0x00e0cc);
    if (u.loopS >= 0 && heads.length) {
      let boost = 0, passed = false;
      for (const h of heads) { const d = h - u.loopS; if (d >= 0) passed = true; const dd = ((d % LI.L) + LI.L) % LI.L; boost += Math.exp(-dd / 1.1) * 1.6 + (dd > LI.L - 0.4 ? (LI.L - dd) * 0 : 0); }
      if (passed) { em += 0.12 + boost; col.lerp(new THREE.Color(0xffa020), clamp(boost / 1.4) * 0.9 + 0.2 * run); }
    } else if (u.loopS < 0 && t > POWER_T) {
      // capacitor branch: charging glow that settles as it fills
      const ch = 1 - easeOut((t - POWER_T - 0.5) / 3);
      em += 0.5 * ch * (0.5 + 0.5 * Math.sin(t * 5 - u.s * 2.5)) * (t > POWER_T + 0.5 ? 1 : 0);
    }
    em *= 1 + 0.15 * run;
    m.material.emissive.copy(col); m.material.emissiveIntensity = em;
  }

  // components rise from under the board and settle
  comps.forEach((c, i) => {
    const k = clamp((t - PLACE[i]) / 1.05);
    if (k <= 0) { c.g.visible = false; c.halo.material.opacity = 0; c.light.intensity = 0; return; }
    c.g.visible = true; const e = easeOutBack(k);
    c.g.position.y = lerp(c.y - c.depth, c.y, e);
    c.g.rotation.y = (1 - easeOut(k)) * 0.35;
    const landFlash = Math.exp(-Math.max(0, t - PLACE[i] - 0.55) * 2.2) * clamp(k * 3);
    c.halo.material.opacity = 0.55 * landFlash + 0.08 + 0.1 * power + 0.08 * run;
    c.halo.scale.setScalar(3.4 + 1.2 * landFlash);
    c.light.intensity = 3 * landFlash + 0.6 + 0.9 * power + 0.6 * run;
  });
  // battery cell glows when powered; capacitor rings fill with charge; transistor switch turns on
  comps[0].body.material.emissiveIntensity = 0.05 + 0.15 * power;
  const charge = easeOut((t - POWER_T - 0.4) / 3.2);
  comps[2].rings.forEach((r, i) => { r.material.emissiveIntensity = 0.25 + 2.0 * clamp(charge * 5 - i) * (0.85 + 0.15 * breathe); });
  comps[3].sw.material.emissiveIntensity = 0.15 + 2.6 * power;
  comps[3].body.material.emissiveIntensity = 0.04 + 0.12 * power;

  // LEDs rise in, then flare when current reaches them
  leds.forEach((l, i) => {
    const k = clamp((t - (LED_T + 0.1 * i)) / 0.8);
    if (k <= 0) { l.g.visible = false; l.halo.material.opacity = 0; l.light.intensity = 0; return; }
    l.g.visible = true; const e = easeOutBack(k);
    l.g.position.y = lerp(-1.4, 0, e);
    const lit = easeOut((t - LED_LIT[i]) / 0.35);
    let pass = 0; for (const h of heads) { const dd = (((h - l.p.s) % LI.L) + LI.L) % LI.L; pass += Math.exp(-dd / 1.2); }
    const flare = lit > 0 ? Math.exp(-Math.max(0, t - LED_LIT[i]) * 1.6) : 0;
    const b = lit * (1 + 0.25 * pass + 0.25 * run + 0.9 * flare);
    l.domeMat.emissiveIntensity = 0.12 + 0.7 * b;
    l.core.material.emissiveIntensity = 1.0 * b;
    l.halo.material.opacity = clamp(0.32 * b, 0, 0.55) * k;
    l.halo.scale.setScalar(3.2 + 1.6 * flare + 0.5 * run);
    l.light.intensity = 1.8 * b;
  });

  // pulses
  pulses.forEach((p, k) => {
    const emit = POWER_T + k * PULSE_GAP; const on = t >= emit;
    const vis = [p.head, p.halo, p.core, p.light, ...p.trail]; vis.forEach((o) => (o.visible = on));
    if (!on) return;
    const s = (t - emit) * PULSE_SPEED; const fadeIn = clamp((t - emit) / 0.25);
    const [x, z] = at(LI, s); const y = 0.42;
    p.head.position.set(x, y, z); p.halo.position.set(x, y, z); p.core.position.set(x, y, z); p.light.position.set(x, 1.0, z);
    p.halo.material.opacity = 0.75 * fadeIn; p.core.material.opacity = 0.8 * fadeIn; p.head.scale.setScalar(fadeIn);
    p.halo.scale.setScalar(3.0 + 0.3 * run + 0.2 * Math.sin(t * 6 + k));
    p.light.intensity = 3.5 * fadeIn;
    p.trail.forEach((tr, j) => { const ds = (j + 1) * 0.2; const vis2 = s - ds >= 0; tr.visible = vis2; if (!vis2) return; const [tx, tz] = at(LI, s - ds); tr.position.set(tx, y, tz); tr.material.opacity = 0.42 * (1 - j / 14) * fadeIn; tr.scale.setScalar(1.5 * (1 - j / 18)); });
  });
}

// ---------------- 2D overlay: code, labels, hook ----------------
const SYN = { id: '#2af5e0', fn: '#ff4fa8', str: '#ffa53d', param: '#9fdcff', punct: '#e9edff' };
function tokens(text) {
  const out = []; const re = /("[^"]*"?)|(\d+)|([A-Za-z_]\w*)|(\s+)|(.)/g; let m, prevDot = false;
  while ((m = re.exec(text))) {
    const s = m[0]; let c = SYN.punct;
    if (m[1] || m[2]) c = SYN.str;
    else if (m[3]) { const after = text.slice(re.lastIndex); c = s === 'Circuit' || prevDot ? SYN.fn : (/^=[^=]/.test(after) ? SYN.param : SYN.id); }
    out.push({ s, c }); if (!m[4]) prevDot = s === '.';
  }
  return out;
}
const CODE = { x: 66, y0: 150, lh: 72, size: 50 };
let CW = 30;
function drawCode(g, t, alpha) {
  g.save(); g.textBaseline = 'alphabetic'; g.font = `700 ${CODE.size}px JBM`;
  let cur = null;
  LINES.forEach((ln, i) => {
    let n = 0; for (const ct of ln.times) if (ct <= t) n++; else break;
    if (n === 0) return; cur = { ln, n, i };
    const y = CODE.y0 + i * CODE.lh; let x = CODE.x, typed = 0;
    for (const tok of tokens(ln.text)) {
      const s = tok.s.slice(0, Math.max(0, n - typed)); typed += tok.s.length; if (!s) break;
      g.globalAlpha = alpha; g.fillStyle = tok.c; g.shadowColor = tok.c; g.shadowBlur = 18; g.fillText(s, x, y);
      g.shadowBlur = 0; g.fillText(s, x, y); x += s.length * CW;
    }
  });
  if (cur) {
    const typing = t < cur.ln.end + 0.08; const blink = typing ? 1 : (Math.floor((t - cur.ln.end) * 2) % 2 === 0 ? 1 : 0.1);
    g.globalAlpha = alpha * blink; g.fillStyle = '#2af5e0'; g.shadowColor = '#2af5e0'; g.shadowBlur = 16;
    g.fillRect(CODE.x + cur.n * CW + 4, CODE.y0 + cur.i * CODE.lh - 42, 5, 52);
  }
  g.restore();
}
function project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }
function drawLabel(g, pos, align, name, role, color, k) {
  if (k <= 0) return; const [x, y] = pos; const e = easeOut(k);
  g.save(); g.globalAlpha = e; g.textAlign = align; g.textBaseline = 'alphabetic';
  const yy = y + (1 - e) * 12;
  g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = 10;
  g.font = '800 34px JBM'; g.fillStyle = color; for (let i = 0; i < 2; i++) g.fillText(name, x, yy);
  g.font = '600 27px JBM'; g.fillStyle = '#f1f5ff'; for (let i = 0; i < 2; i++) g.fillText(role, x, yy + 34);
  g.restore();
}
function drawOverlay(g, t, codeK) {
  // gentle darkening behind the code (not a box: a soft vertical fade)
  const gr = g.createLinearGradient(0, 0, 0, 820); gr.addColorStop(0, 'rgba(2,4,14,0.82)'); gr.addColorStop(0.72, 'rgba(2,4,14,0.55)'); gr.addColorStop(1, 'rgba(2,4,14,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 820);
  const lk = PLACE.map((p) => clamp((t - p - 0.45) / 0.5));
  drawLabel(g, project(X0 - 0.45, 0.2, -2.6), 'left', 'BATTERY', '— pushes current', '#ffc457', lk[0]);
  drawLabel(g, project(RES.x, 0.2, Z0 + 1.15), 'center', 'RESISTOR', '— slows current', '#5ff8ec', lk[1]);
  drawLabel(g, project(CX + 0.95, 0.2, CAP.z + 0.2), 'left', 'CAPACITOR', '— stores charge', '#ff7fb5', lk[2]);
  drawLabel(g, project(X1 - 0.95, 0.2, TRN.z + 0.35), 'right', 'TRANSISTOR', '— the switch', '#ffb447', lk[3]);
  // hook: plain text, low on screen, fades by 0:02
  const hk = 1 - smooth(1.1, 1.95, t);
  if (hk > 0) {
    g.save(); g.globalAlpha = hk; g.textAlign = 'center'; g.font = '600 40px JBM'; g.fillStyle = '#ffffff';
    g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 14; g.fillText('watch code build a circuit', W / 2, 1610); g.fillText('watch code build a circuit', W / 2, 1610); g.restore();
  }
  drawCode(g, t, codeK * (1 - 0.25 * easeOut((t - RUN_T - 0.8) / 1.5)));
}

function drawFrameTo(ctx, t, codeK) {
  setState(t); composer.render();
  ctx.globalAlpha = 1; ctx.drawImage(glCanvas, 0, 0);
  drawOverlay(ctx, t, codeK);
}

const DIS0 = 25.0;
window.renderFrame = function (t) {
  if (t < DIS0) { drawFrameTo(outCtx, t, 1); return; }
  const a = easeInOut((t - DIS0) / (DUR - DIS0));
  const ga = bufA.getContext('2d'), gb = bufB.getContext('2d');
  drawFrameTo(ga, t, 1 - smooth(DIS0, 26.2, t));
  drawFrameTo(gb, t - DUR, smooth(26.3, 27.7, t));
  outCtx.globalAlpha = 1; outCtx.drawImage(bufA, 0, 0); outCtx.globalAlpha = a; outCtx.drawImage(bufB, 0, 0); outCtx.globalAlpha = 1;
};

window.setupScene = async function () {
  for (const [w, f] of [['800', 'JetBrainsMono-ExtraBold.ttf'], ['700', 'JetBrainsMono-Bold.ttf'], ['600', 'JetBrainsMono-SemiBold.ttf']]) { const ff = new FontFace('JBM', `url(fonts/${f})`, { weight: w }); await ff.load(); document.fonts.add(ff); }
  glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
  renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NoToneMapping;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x030614);
  camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  GLOW = glowTex();
  hemi = new THREE.HemisphereLight(0x6a8cff, 0x0a0f22, 0.55); scene.add(hemi);
  keyLight = new THREE.DirectionalLight(0xcfe0ff, 1.25); keyLight.position.set(-6, 12, 6); scene.add(keyLight);
  warmFill = new THREE.PointLight(0xffa040, 0.4, 30, 1.2); warmFill.position.set(0, 6, 1); scene.add(warmFill);
  const rim = new THREE.DirectionalLight(0x19f0dc, 0.5); rim.position.set(4, 5, -12); scene.add(rim);
  boardMesh(boardTexture());
  buildTraces(); buildComponents(); buildLEDs(); buildPulses();
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.62, 0.42, 0.58));
  composer.addPass(new OutputPass());
  out2d = document.getElementById('c'); outCtx = out2d.getContext('2d');
  bufA = document.createElement('canvas'); bufA.width = W; bufA.height = H; bufB = document.createElement('canvas'); bufB.width = W; bufB.height = H;
  outCtx.font = `700 ${CODE.size}px JBM`; CW = outCtx.measureText('M').width;
  // warm up shaders with everything visible
  setState(21); composer.render();
  return true;
};
window.SCHEDULE = { lines: LINES.map((l) => ({ text: l.text, start: l.start, end: l.end, times: l.times })), place: PLACE, power: POWER_T, ledT: LED_T, ledLit: LED_LIT, run: RUN_T, dur: DUR };
