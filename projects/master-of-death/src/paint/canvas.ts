// Canvas-side helpers shared by painted scenes: offscreen buffers, colour
// parsing, noise fields (fog, light), and tapered ribbons that follow a flow.
import type {Noise} from './noise';

export type Ctx = CanvasRenderingContext2D;
export type P = [number, number];

export const buffer = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', {willReadFrequently: true})!;
  return {c, ctx};
};

export const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

// Colour ramp over stops [t, hex], returning rgb triple.
export const rampRGB = (stops: [number, string][], t: number): [number, number, number] => {
  const s = stops.map(([p, c]) => [p, rgb(c)] as const);
  if (t <= s[0][0]) return [...s[0][1]];
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i][0]) {
      const u = (t - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
      return [0, 1, 2].map((k) => s[i - 1][1][k] + (s[i][1][k] - s[i - 1][1][k]) * u) as [number, number, number];
    }
  }
  return [...s[s.length - 1][1]];
};

// Fill the frame with a noise-driven field, computed at 1/scale resolution
// and smoothly upscaled. `shade(x, y, n)` returns [r, g, b, a] for a full-res
// coordinate and the fBm value there.
export const noiseField = (
  ctx: Ctx, w: number, h: number, noise: Noise,
  opts: {scale?: number; freq?: number; t?: number; oct?: number; warp?: number},
  shade: (x: number, y: number, n: number) => [number, number, number, number],
) => {
  const {scale = 4, freq = 0.0022, t = 0, oct = 5, warp = 0} = opts;
  const lw = Math.ceil(w / scale), lh = Math.ceil(h / scale);
  const {c, ctx: lc} = buffer(lw, lh);
  const img = lc.createImageData(lw, lh);
  for (let y = 0; y < lh; y++) {
    for (let x = 0; x < lw; x++) {
      const X = x * scale, Y = y * scale;
      let fx = X * freq, fy = Y * freq;
      if (warp) {
        fx += warp * noise.fbm(fx + 5.2, fy + 1.3, t, 3);
        fy += warp * noise.fbm(fx + 1.7, fy + 9.2, t, 3);
      }
      const n = noise.fbm(fx, fy, t, oct);
      const [r, g, b, a] = shade(X, Y, n);
      const i = (y * lw + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = a * 255;
    }
  }
  lc.putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, 0, 0, w, h);
  ctx.restore();
};

// Trace a path through a flow: start at p, initial direction d; each step
// blends the current heading with `field(p, s)` (s = 0..1 along the path).
export const trace = (p: P, d: P, steps: number, step: number, field: (p: P, s: number) => P, inertia = 0.75): P[] => {
  const pts: P[] = [[...p]];
  let [x, y] = p;
  let [dx, dy] = d;
  for (let i = 1; i <= steps; i++) {
    const [fx, fy] = field([x, y], i / steps);
    dx = dx * inertia + fx * (1 - inertia);
    dy = dy * inertia + fy * (1 - inertia);
    const m = Math.hypot(dx, dy) || 1;
    dx /= m; dy /= m;
    x += dx * step; y += dy * step;
    pts.push([x, y]);
  }
  return pts;
};

// Fill a tapered ribbon along a centreline. width(s) gives the full width.
export const ribbon = (ctx: Ctx, pts: P[], width: (s: number) => number) => {
  const L: P[] = [], R: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    const nx = -ty / m, ny = tx / m;
    const hw = width(i / (pts.length - 1)) / 2;
    L.push([pts[i][0] + nx * hw, pts[i][1] + ny * hw]);
    R.push([pts[i][0] - nx * hw, pts[i][1] - ny * hw]);
  }
  ctx.beginPath();
  ctx.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < L.length; i++) ctx.lineTo(L[i][0], L[i][1]);
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  return {L, R};
};

export const polyline = (ctx: Ctx, pts: P[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
};

// Sample points evenly along a polyline.
export const resample = (pts: P[], n: number): {p: P; t: P}[] => {
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = seg[seg.length - 1];
  const out: {p: P; t: P}[] = [];
  for (let k = 0; k < n; k++) {
    const d = (k / Math.max(1, n - 1)) * total;
    let i = 1;
    while (i < seg.length - 1 && seg[i] < d) i++;
    const u = (d - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
    const a = pts[i - 1], b = pts[i];
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    out.push({p: [a[0] + tx * u, a[1] + ty * u], t: [tx / m, ty / m]});
  }
  return out;
};
