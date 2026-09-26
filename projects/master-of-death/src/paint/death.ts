// Death, painted. The body is only the core; its presence comes from what
// streams off it — long tattered cloth tongues lifted by a slow, curling
// wind, thinning into smoke. Nothing about the silhouette is fixed: pass a
// different `t` and the robe breathes.
import {smooth} from '../util';
import {Ctx, P, polyline, ribbon, rgba, resample, trace} from './canvas';
import {mulberry, Noise} from './noise';

const path = (d: string) => new Path2D(d);

export type DeathOpts = {
  cx: number; cy: number; k?: number; t?: number;
  rim?: string; robe?: string; wind?: P; seed?: number;
  glow?: P; glowAmt?: number; glowCol?: string; // the light inside the robe, in scene space
};

// Robe outline in local units (face centre = 0,0). Left side, top → bottom.
const SIDE: P[] = [[8, -330], [-60, -300], [-150, -236], [-222, -120], [-246, 10], [-262, 150], [-320, 232], [-470, 330], [-640, 480], [-760, 700], [-820, 900]];

export const drawDeath = (ctx: Ctx, noise: Noise, o: DeathOpts) => {
  const {cx, cy, k = 1, t = 0, rim = '#6d7d9c', robe = '#0b0e14', wind = [0.1, -0.12], seed = 3, glowAmt = 0, glowCol = '#c9d4ea'} = o;
  const glow = o.glow ?? [cx, cy + 300 * k];
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
  g.addColorStop(0, '#1f2633');
  g.addColorStop(0.3, '#11151d');
  g.addColorStop(1, '#07080b');
  ctx.fillStyle = g;
  ctx.fill(body);

  // ——— drapery. Each fold is a dark valley with a lit ridge beside it; the
  // ridge takes the top light on the hood and the inner glow lower down.
  const [gx, gy] = glow;
  const lightAt = (p: P) => {
    const d = Math.hypot(p[0] - gx, p[1] - gy);
    return Math.min(1, glowAmt * Math.exp(-((d / (520 * k)) ** 2)) + Math.max(0, (cy - p[1]) / (420 * k)) * 0.5);
  };
  type Fold = {pts: P[]; ridge: P; w: number};
  const folds: Fold[] = [
    // hood: long folds sweeping from the peak around the face
    {pts: [[-30, -300], [-110, -210], [-160, -80], [-182, 60], [-220, 200]], ridge: [-9, -3], w: 1},
    {pts: [[40, -300], [118, -210], [168, -80], [188, 60], [226, 200]], ridge: [9, -3], w: 1},
    {pts: [[-6, -326], [-74, -270], [-140, -170]], ridge: [-7, -4], w: 0.7},
    {pts: [[14, -326], [84, -266], [146, -170]], ridge: [7, -4], w: 0.7},
    {pts: [[-60, -250], [-150, -130], [-196, -10]], ridge: [-6, 0], w: 0.6},
    {pts: [[66, -250], [156, -130], [202, -10]], ridge: [6, 0], w: 0.6},
    // cowl: heavy cloth hanging in loops beneath the hood
    {pts: [[-230, 236], [-120, 290], [0, 306], [120, 290], [236, 236]], ridge: [0, 9], w: 1.1},
    {pts: [[-300, 296], [-160, 380], [0, 404], [160, 380], [306, 296]], ridge: [0, 10], w: 1.2},
    {pts: [[-380, 380], [-200, 490], [0, 522], [200, 490], [386, 380]], ridge: [0, 10], w: 1.3},
    {pts: [[-190, 250], [-230, 330], [-300, 400]], ridge: [5, 4], w: 0.8},
    {pts: [[196, 250], [236, 330], [306, 400]], ridge: [-5, 4], w: 0.8},
    // long falling folds
    {pts: [[-440, 440], [-480, 640], [-540, 920]], ridge: [8, 0], w: 1.2},
    {pts: [[-290, 520], [-310, 700], [-330, 920]], ridge: [8, 0], w: 1},
    {pts: [[-150, 560], [-140, 740], [-160, 920]], ridge: [7, 0], w: 0.9},
    {pts: [[20, 580], [40, 760], [30, 920]], ridge: [-7, 0], w: 0.9},
    {pts: [[170, 560], [190, 740], [200, 920]], ridge: [-7, 0], w: 1},
    {pts: [[310, 520], [340, 700], [370, 920]], ridge: [-8, 0], w: 1},
    {pts: [[450, 440], [500, 640], [560, 920]], ridge: [-8, 0], w: 1.2},
  ];
  ctx.save();
  ctx.clip(body);
  for (const f of folds) {
    const pts = f.pts.map(X);
    ctx.filter = `blur(${14 * k}px)`;
    ctx.strokeStyle = 'rgba(0,0,2,0.75)';
    ctx.lineWidth = 36 * k * f.w;
    ctx.stroke(path(smooth(pts, false)));
    // the ridge catches light unevenly: broken into lit stretches, brightest near the light
    const ridge = pts.map(([x, y]) => [x + f.ridge[0] * k * 1.6, y + f.ridge[1] * k * 1.6] as P);
    const samples = resample(ridge, 24);
    ctx.filter = `blur(${5 * k}px)`;
    ctx.lineCap = 'round';
    for (let i = 0; i < samples.length - 1; i++) {
      const on = noise.n3(i * 0.35, f.pts[0][0] * 0.01, 3) > -0.15;
      if (!on) continue;
      const L = lightAt(samples[i].p);
      ctx.strokeStyle = rgba(glowCol, 0.05 + 0.3 * L);
      ctx.lineWidth = 6 * k * f.w * (0.6 + 0.6 * Math.abs(noise.n3(i * 0.2, 7, 1)));
      ctx.beginPath();
      ctx.moveTo(samples[i].p[0], samples[i].p[1]);
      ctx.lineTo(samples[i + 1].p[0], samples[i + 1].p[1]);
      ctx.stroke();
    }
  }
  ctx.filter = 'none';
  // top light on the hood crown and shoulders
  const tl = ctx.createRadialGradient(cx, cy - 300 * k, 10, cx, cy - 300 * k, 520 * k);
  tl.addColorStop(0, rgba('#8fa0c0', 0.4));
  tl.addColorStop(1, rgba('#8fa0c0', 0));
  ctx.fillStyle = tl;
  ctx.fillRect(cx - 900 * k, cy - 400 * k, 1800 * k, 900 * k);
  // the inner glow washing up the front of the robe
  const ig = ctx.createRadialGradient(gx, gy, 10, gx, gy, 460 * k);
  ig.addColorStop(0, rgba(glowCol, 0.22 * glowAmt));
  ig.addColorStop(1, rgba(glowCol, 0));
  ctx.fillStyle = ig;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

  // ——— the hood: no face, only depth
  const openPts: P[] = [[0, -214], [62, -168], [104, -78], [118, 30], [106, 134], [66, 200], [0, 226], [-66, 200], [-106, 134], [-118, 30], [-104, -78], [-62, -168]];
  const opening = new Path2D(smooth(openPts.map(X), true, 0.45));
  ctx.fillStyle = '#000000';
  ctx.fill(opening);
  ctx.save();
  ctx.clip(opening);
  // faint cold haze at the inner edge so the void has depth, not a hole
  ctx.filter = `blur(${16 * k}px)`;
  ctx.strokeStyle = rgba('#26324a', 0.55);
  ctx.lineWidth = 26 * k;
  ctx.stroke(opening);
  ctx.restore();
  // the rolled hood lip: thick, lit along its outer curve, shadowed inside
  const lipAt = (sc: number) => (pts: P[]) => smooth(pts.map(([x, y]) => X([x * sc, y * sc + 4])), false);
  ctx.save();
  ctx.filter = `blur(${6 * k}px)`;
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 22 * k;
  ctx.stroke(path(smooth(openPts.map(([x, y]) => X([x * 1.1, y * 1.1 + 2])), true, 0.45)));
  ctx.filter = `blur(${2 * k}px)`;
  ctx.strokeStyle = rgba(rim, 0.65);
  ctx.lineWidth = 5 * k;
  ctx.stroke(path(lipAt(1.2)([...openPts.slice(7), openPts[0], openPts[1], openPts[2]])));
  ctx.strokeStyle = rgba(rim, 0.3);
  ctx.lineWidth = 3 * k;
  ctx.stroke(path(lipAt(1.2)(openPts.slice(2, 5))));
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

