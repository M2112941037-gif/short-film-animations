import {random} from 'remotion';

export const rng = (seed: string | number) => {
  let i = 0;
  return () => random(`${seed}-${i++}`);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const hex = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const f = (x: number, y: number) => Math.round(lerp(x, y, clamp(t))).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
};

export const rgba = (c: string, a: number) => {
  const [r, g, b] = hex(c);
  return `rgba(${r},${g},${b},${a})`;
};

// Multi-stop colour ramp: stops as [t, colour], t ascending in 0..1.
export const ramp = (stops: [number, string][], t: number) => {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i];
    const [t0, c0] = stops[i - 1];
    if (t <= t1) return mix(c0, c1, (t - t0) / (t1 - t0));
  }
  return stops[stops.length - 1][1];
};

export type Pt = [number, number];

// Smooth closed/open path through points (Catmull-Rom → cubic Bézier).
export const smooth = (pts: Pt[], closed = true, tension = 0.5) => {
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
};

// Tapered capsule between two points — used for bones, twigs, fingers.
export const capsule = (a: Pt, b: Pt, wa: number, wb: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const f = (p: Pt, w: number, s: number): string => `${(p[0] + nx * w * s).toFixed(1)},${(p[1] + ny * w * s).toFixed(1)}`;
  return `M${f(a, wa, 1)} L${f(b, wb, 1)} A${wb},${wb} 0 0 1 ${f(b, wb, -1)} L${f(a, wa, -1)} A${wa},${wa} 0 0 1 ${f(a, wa, 1)}Z`;
};

// Sample a smooth open curve (Catmull-Rom) through control points.
export const curve = (pts: Pt[], per = 10): Pt[] => {
  const out: Pt[] = [];
  const n = pts.length;
  const get = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let j = 0; j < per; j++) {
      const t = j / per, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[n - 1]);
  return out;
};

// An inked brush line: a filled shape along a curve, thick in the middle and
// tapering at both ends (`taper` 0 = blunt, 1 = needle-sharp), the way a pen
// or brush stroke swells and lifts. Returns SVG path data.
export const ink = (pts: Pt[], w: number, taper = 0.8, bias = 0.5): string => {
  const c = curve(pts, 8);
  const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    const s = i / (c.length - 1);
    // pressure peaks at `bias` along the stroke
    const u = s < bias ? s / bias : (1 - s) / (1 - bias);
    const hw = (w / 2) * ((1 - taper) + taper * Math.sin((Math.PI / 2) * Math.min(1, u)));
    L.push([c[i][0] - (dy / m) * hw, c[i][1] + (dx / m) * hw]);
    R.push([c[i][0] + (dy / m) * hw, c[i][1] - (dx / m) * hw]);
  }
  const f = (p: Pt) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  return `M${L.map(f).join(' L')} L${R.reverse().map(f).join(' L')}Z`;
};
