// Death, painted. The body is only the core; its presence comes from what
// streams off it — long tattered cloth tongues lifted by a slow, curling
// wind, thinning into smoke. Nothing about the silhouette is fixed: pass a
// different `t` and the robe breathes.
import {capsule, Pt, smooth} from '../util';
import {buffer, Ctx, P, polyline, ribbon, rgba, resample, trace} from './canvas';
import {mulberry, Noise} from './noise';

const path = (d: string) => new Path2D(d);

export type DeathOpts = {
  cx: number; cy: number; k?: number; t?: number;
  rim?: string; robe?: string; wind?: P; seed?: number; faceLight?: number;
};

// Robe outline in local units (face centre = 0,0). Left side, top → bottom.
const SIDE: P[] = [[8, -330], [-60, -300], [-150, -236], [-222, -120], [-246, 10], [-262, 150], [-320, 232], [-470, 330], [-640, 480], [-760, 700], [-820, 900]];

export const drawDeath = (ctx: Ctx, noise: Noise, o: DeathOpts) => {
  const {cx, cy, k = 1, t = 0, rim = '#6d7d9c', robe = '#0b0e14', wind = [0.1, -0.12], seed = 3, faceLight = 1} = o;
  const X = (p: P): P => [cx + p[0] * k, cy + p[1] * k];
  const rand = mulberry(seed);
  const left = SIDE.map(X);
  const right = SIDE.map(([x, y]) => X([-x + 16, y]));
  const outline = [...left, ...right.slice().reverse()];

  // ——— the wind: mostly outward from the body and slowly rising, with a
  // broad, gentle curl that grows toward the free ends (tips move most)
  const flow = (p: P, s: number, outward: P): P => {
    const [fx, fy] = noise.curl(p[0] * 0.0011, p[1] * 0.0011, t * 0.25);
    const c = 0.3 + s * 0.55;
    return [outward[0] * 0.9 + wind[0] + fx * c, outward[1] * 0.3 + wind[1] + 0.15 + fy * c];
  };
  const edgeL = resample(left.slice(3), 40);
  const edgeR = resample(right.slice(3), 40);
  const edges = [
    ...edgeL.map((e) => ({...e, out: [-e.t[1], e.t[0]] as P})),
    ...edgeR.map((e) => ({...e, out: [e.t[1], -e.t[0]] as P})),
  ];

  // smoke: soft, wide, translucent — the robe dissolving at its edges
  ctx.save();
  ctx.filter = `blur(${12 * k}px)`;
  for (let i = 0; i < 70; i++) {
    const e = edges[Math.floor(rand() * edges.length)];
    const pts = trace(e.p, e.out, 30, 16 * k, (p, s) => flow(p, s, e.out), 0.9);
    ctx.fillStyle = rgba('#7282a4', 0.05 + rand() * 0.07);
    const w0 = (40 + rand() * 70) * k;
    ribbon(ctx, pts, (u) => w0 * (0.4 + u) * (1 - u * 0.6));
    ctx.fill();
  }
  ctx.restore();

  // ——— tattered tongues streaming from the robe edge (behind the body)
  const tongue = (e: (typeof edges)[number], len: number, w0: number, col: string, a: number, lit: number) => {
    const steps = 30;
    const pts = trace(e.p, [e.t[0] * 0.3 + e.out[0], e.t[1] * 0.3 + e.out[1]], steps, (len / steps) * k, (p, s) => flow(p, s, e.out), 0.9);
    const ph = rand() * 10;
    // ragged taper: narrows unevenly, with a torn, forked-looking end
    const width = (s: number) => w0 * k * Math.pow(1 - s, 1.1) * (0.78 + 0.22 * noise.n3(s * 2.5 + ph, ph, t * 0.4));
    ctx.fillStyle = rgba(col, a);
    const {L} = ribbon(ctx, pts, width);
    ctx.fill();
    if (lit > 0) {
      ctx.save();
      ctx.filter = `blur(${2.5 * k}px)`;
      ctx.strokeStyle = rgba(rim, lit);
      ctx.lineWidth = 3 * k;
      polyline(ctx, L.slice(0, Math.floor(L.length * 0.55)));
      ctx.stroke();
      ctx.restore();
    }
  };
  // gauze layer: wide, translucent, a shade lighter than the cloth
  for (const e of edges) if (rand() < 0.3) tongue(e, 320 + rand() * 360, 130 + rand() * 80, '#222a3a', 0.35, 0);
  // cloth layer: dark, opaque, long; only the upper ones catch light
  for (const e of edges) if (rand() < 0.38) tongue(e, 260 + rand() * 360, 80 + rand() * 60, robe, 0.96, e.p[1] < cy + 350 * k ? 0.22 : 0.06);

  // ——— the body mass
  const body = new Path2D(smooth(outline, true, 0.45));
  const g = ctx.createLinearGradient(0, cy - 330 * k, 0, cy + 900 * k);
  g.addColorStop(0, '#1d2330');
  g.addColorStop(0.3, '#10141b');
  g.addColorStop(1, '#06070a');
  ctx.fillStyle = g;
  ctx.fill(body);
  // drapery: long soft light & dark folds inside the body
  ctx.save();
  ctx.clip(body);
  ctx.filter = `blur(${10 * k}px)`;
  const folds: Pt[][] = [
    [[-300, 240], [-360, 420], [-420, 640], [-500, 900]],
    [[-170, 280], [-210, 500], [-230, 900]],
    [[160, 280], [220, 500], [250, 900]],
    [[320, 240], [400, 440], [520, 900]],
    [[30, 300], [50, 600], [20, 900]],
  ];
  folds.forEach((f, i) => {
    ctx.strokeStyle = rgba(i % 2 ? '#02030a' : rim, i % 2 ? 0.7 : 0.18);
    ctx.lineWidth = (i % 2 ? 40 : 22) * k;
    ctx.stroke(path(smooth(f.map(X), false)));
  });
  // top light on the hood crown and shoulders
  const tl = ctx.createRadialGradient(cx, cy - 300 * k, 10, cx, cy - 300 * k, 520 * k);
  tl.addColorStop(0, rgba('#8fa0c0', 0.45));
  tl.addColorStop(1, rgba('#8fa0c0', 0));
  ctx.filter = 'none';
  ctx.fillStyle = tl;
  ctx.fillRect(cx - 900 * k, cy - 400 * k, 1800 * k, 900 * k);
  ctx.restore();
  // rim only across hood and shoulders — below that the edge is torn cloth
  ctx.save();
  ctx.filter = `blur(${2 * k}px)`;
  ctx.strokeStyle = rgba(rim, 0.55);
  ctx.lineWidth = 4 * k;
  ctx.stroke(path(smooth([...left.slice(0, 7).reverse(), ...right.slice(1, 7)], false, 0.45)));
  ctx.restore();
  for (const e of edges) {
    if (e.p[1] < cy + 250 * k || rand() < 0.5) continue;
    const inset: typeof e = {...e, p: [e.p[0] - e.out[0] * 60 * k, e.p[1] - e.out[1] * 60 * k]};
    tongue(inset, 160 + rand() * 220, 70 + rand() * 50, robe, 0.97, 0.05);
  }

  // ——— hood opening + skull
  const opening = new Path2D(smooth([
    [0, -214], [62, -168], [104, -78], [118, 30], [106, 134], [66, 200], [0, 226], [-66, 200], [-106, 134], [-118, 30], [-104, -78], [-62, -168],
  ].map((p) => X(p as P)), true, 0.45));
  ctx.fillStyle = '#020304';
  ctx.fill(opening);
  ctx.save();
  ctx.clip(opening);
  drawSkull(ctx, cx, cy + 24 * k, 0.9 * k, faceLight);
  // hood shadow from above and around
  const hs = ctx.createLinearGradient(0, cy - 214 * k, 0, cy + 60 * k);
  hs.addColorStop(0, 'rgba(0,0,0,1)');
  hs.addColorStop(0.45, 'rgba(0,0,0,0.85)');
  hs.addColorStop(0.75, 'rgba(0,0,0,0.25)');
  hs.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hs;
  ctx.fill(opening);
  const rs = ctx.createRadialGradient(cx - 10 * k, cy + 70 * k, 40 * k, cx, cy + 20 * k, 150 * k);
  rs.addColorStop(0, 'rgba(0,0,0,0)');
  rs.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = rs;
  ctx.fill(opening);
  ctx.restore();
  // thick hood lip catching the top light on the key side
  ctx.save();
  ctx.filter = `blur(${1.5 * k}px)`;
  ctx.strokeStyle = rgba(rim, 0.6);
  ctx.lineWidth = 5 * k;
  ctx.stroke(path(smooth([[-6, -214], [-62, -168], [-104, -78], [-118, 30], [-106, 134]].map((p) => X(p as P)), false)));
  ctx.strokeStyle = rgba(rim, 0.25);
  ctx.lineWidth = 3 * k;
  ctx.stroke(path(smooth([[8, -214], [62, -168], [104, -78], [118, 30]].map((p) => X(p as P)), false)));
  ctx.restore();
};

// ——— skull, painted with soft shading
export const drawSkull = (ctx: Ctx, cx: number, cy: number, k: number, light = 1) => {
  const T = (pts: P[]) => pts.map(([x, y]) => [cx + x * k, cy + y * k] as Pt);
  const half: P[] = [[0, -124], [58, -110], [86, -68], [92, -22], [86, 16], [82, 40], [60, 60], [50, 80], [44, 102], [26, 120], [0, 126]];
  const outline: P[] = [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y] as P)];
  const face = path(smooth(T(outline), true, 0.4));
  ctx.save();
  ctx.globalAlpha = light;
  const g = ctx.createLinearGradient(cx - 80 * k, cy - 120 * k, cx + 60 * k, cy + 120 * k);
  g.addColorStop(0, '#f1ebdc');
  g.addColorStop(0.5, '#b4ad9e');
  g.addColorStop(1, '#3e3d44');
  ctx.fillStyle = g;
  ctx.fill(face);
  ctx.clip(face);
  ctx.filter = `blur(${6 * k}px)`;
  // cheek hollows + temple shadow
  ctx.fillStyle = 'rgba(10,11,16,0.75)';
  for (const sx of [-1, 1]) {
    ctx.fill(path(smooth(T([[sx * 88, 30], [sx * 62, 62], [sx * 50, 92], [sx * 56, 58], [sx * 72, 40]]), true, 0.3)));
  }
  ctx.fillStyle = 'rgba(10,11,16,0.45)';
  ctx.fill(path(smooth(T([[30, -120], [92, -60], [92, 20], [60, 64], [40, 120], [70, 130], [110, 0], [100, -120]]), true, 0.4)));
  ctx.filter = `blur(${2 * k}px)`;
  for (const sx of [-1, 1]) {
    ctx.fillStyle = '#020203';
    ctx.fill(path(smooth(T([[sx * 12, -8], [sx * 14, -20], [sx * 38, -34], [sx * 64, -30], [sx * 70, -12], [sx * 62, 8], [sx * 40, 16], [sx * 20, 10]]), true, 0.35)));
  }
  ctx.fill(path(smooth(T([[0, 22], [9, 32], [12, 46], [5, 54], [0, 50], [-5, 54], [-12, 46], [-9, 32]]), true, 0.4)));
  ctx.filter = 'none';
  // teeth
  ctx.fillStyle = '#9d978a';
  ctx.fill(path(`M${cx - 30 * k},${cy + 66 * k} Q${cx},${cy + 71 * k} ${cx + 30 * k},${cy + 66 * k} L${cx + 28 * k},${cy + 82 * k} Q${cx},${cy + 86 * k} ${cx - 28 * k},${cy + 82 * k}Z`));
  ctx.fillStyle = '#6f6b62';
  ctx.fill(path(`M${cx - 24 * k},${cy + 90 * k} Q${cx},${cy + 94 * k} ${cx + 24 * k},${cy + 90 * k} L${cx + 22 * k},${cy + 102 * k} Q${cx},${cy + 106 * k} ${cx - 22 * k},${cy + 102 * k}Z`));
  ctx.strokeStyle = 'rgba(5,5,8,0.9)';
  ctx.lineWidth = 1.6 * k;
  for (const x of [-20, -10, 0, 10, 20]) {
    ctx.beginPath(); ctx.moveTo(cx + x * k, cy + 67 * k); ctx.lineTo(cx + x * 0.96 * k, cy + 84 * k); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + x * 0.9 * k, cy + 90 * k); ctx.lineTo(cx + x * 0.86 * k, cy + 102 * k); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(cx - 30 * k, cy + 83 * k, 60 * k, 6 * k);
  // key light on brow + cheekbone
  ctx.strokeStyle = 'rgba(255,250,238,0.75)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 4 * k;
  ctx.stroke(path(`M${cx - 72 * k},${cy - 34 * k} Q${cx - 44 * k},${cy - 52 * k} ${cx - 16 * k},${cy - 26 * k}`));
  ctx.lineWidth = 3 * k;
  ctx.stroke(path(`M${cx - 86 * k},${cy + 22 * k} Q${cx - 70 * k},${cy + 30 * k} ${cx - 58 * k},${cy + 24 * k}`));
  ctx.restore();
};

// ——— bone hand, origin at the wrist pointing along +x
export const drawBoneHand = (ctx: Ctx, x: number, y: number, rot: number, k: number, pose: {curl?: number; spread?: number; thumb?: number; forearm?: number} = {}) => {
  const {curl = 0.5, spread = 1, thumb = 0.5, forearm = 20} = pose;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  const g = ctx.createLinearGradient(0, -20 * k, 0, 30 * k);
  g.addColorStop(0, '#efe9dc');
  g.addColorStop(1, '#7d786f');
  const bone = (a: P, b: P, wa: number, wb: number) => {
    ctx.fillStyle = g;
    ctx.strokeStyle = '#08090c';
    ctx.lineWidth = 1.6 * k;
    const p = path(capsule(a, b, wa * k, wb * k));
    ctx.fill(p); ctx.stroke(p);
    ctx.beginPath(); ctx.arc(b[0], b[1], wb * 1.25 * k, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  bone([-forearm * k, -7 * k], [2 * k, -5 * k], 5, 6);
  bone([-forearm * k, 7 * k], [2 * k, 6 * k], 4.5, 5.5);
  ctx.fillStyle = g;
  ctx.fill(path(smooth([[0, -12], [14, -14], [22, -4], [20, 10], [8, 14], [-2, 6]].map(([a, b]) => [a * k, b * k] as Pt))));
  const fingers = [
    {base: [16, -9], dir: -16, lens: [46, 30, 20, 14], w: 4.2},
    {base: [18, -3], dir: -5, lens: [50, 33, 22, 15], w: 4.4},
    {base: [18, 3], dir: 6, lens: [48, 31, 21, 14], w: 4.2},
    {base: [16, 9], dir: 17, lens: [42, 26, 18, 12], w: 3.8},
  ];
  for (const f of fingers) {
    let p: P = [f.base[0] * k, f.base[1] * k];
    let ang = (f.dir * spread * Math.PI) / 180;
    f.lens.forEach((len, si) => {
      if (si > 0) ang += (curl * (38 + si * 10) * Math.PI) / 180;
      const q: P = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
      const w = f.w * (1 - si * 0.16);
      bone(p, q, w, w * 0.82);
      p = q;
    });
  }
  let p: P = [10 * k, 10 * k];
  let ang = ((52 - thumb * 20) * Math.PI) / 180;
  [30, 24, 16].forEach((len, si) => {
    if (si > 0) ang -= (thumb * 34 * Math.PI) / 180;
    const q: P = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
    bone(p, q, 4.6 - si * 0.6, 3.8 - si * 0.6);
    p = q;
  });
  ctx.restore();
};

// ——— a sleeve that is also cloth in the wind: its lower edge sheds tongues
export const drawSleeve = (ctx: Ctx, noise: Noise, from: P, to: P, o: {w?: number; t?: number; rim?: string; wind?: P; seed?: number} = {}) => {
  const {w = 150, t = 0, rim = '#6d7d9c', wind = [0.25, -0.35], seed = 9} = o;
  const rand = mulberry(seed);
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const Pn = (s: number, off: number): P => [from[0] + dx * s + nx * off, from[1] + dy * s + ny * off];
  // hanging folds of the sleeve's underside, drifting in the same wind
  for (let i = 0; i < 9; i++) {
    const s = 0.25 + (i / 8) * 0.75;
    const start = Pn(s, w * 0.35);
    const pts = trace(start, [0.1, 1], 22, 12, (p) => {
      const [fx, fy] = noise.curl(p[0] * 0.003, p[1] * 0.003, t * 0.6);
      return [wind[0] * 0.8 + fx * 1.2, 0.8 + wind[1] * 0.5 + fy * 1.2];
    }, 0.8);
    ctx.fillStyle = rgba(i % 3 === 0 ? '#1a2130' : '#0b0e14', i % 3 === 0 ? 0.45 : 0.92);
    const ph = rand() * 9;
    ribbon(ctx, pts, (u) => (46 + rand() * 20) * Math.pow(1 - u, 0.8) * (0.7 + 0.3 * noise.n3(u * 5 + ph, 1, t)));
    ctx.fill();
  }
  const body = new Path2D(smooth([Pn(0, -w * 0.55), Pn(0.5, -w * 0.42), Pn(1, -w * 0.3), Pn(1.03, 0), Pn(1, w * 0.42), Pn(0.5, w * 0.6), Pn(0, w * 0.6)], true, 0.4));
  ctx.fillStyle = '#0c0f15';
  ctx.fill(body);
  ctx.save();
  ctx.filter = 'blur(1.5px)';
  ctx.strokeStyle = rgba(rim, 0.55);
  ctx.lineWidth = 3;
  ctx.stroke(path(smooth([Pn(0, -w * 0.55), Pn(0.5, -w * 0.42), Pn(1, -w * 0.3), Pn(1.03, 0)], false)));
  ctx.restore();
  // dark mouth of the cuff
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(to[0], to[1], 12, w * 0.34, Math.atan2(dy, dx), 0, Math.PI * 2);
  ctx.fill();
};

export {buffer};
