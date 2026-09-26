// Stroke-based painterly renderer (after Hertzmann, "Painterly Rendering with
// Curved Brush Strokes of Multiple Sizes"). A flat underpainting goes in; an
// oil-painted frame comes out:
//   · big brushes block in everything, smaller brushes only go where the
//     canvas still differs from the underpainting (edges, faces, props);
//   · strokes bend along the image's contours, or follow a flow field where
//     the image is flat (sky, fog);
//   · each stroke is a body plus a few bristle hairlines of shifted value, so
//     the paint has direction and tooth instead of flat fills.
import {mulberry} from './noise';

export type PaintOptions = {
  radii?: number[];
  threshold?: number;
  maxLen?: number;
  minLen?: number;
  alpha?: number;
  jitter?: number;
  bristles?: number;
  seed?: number;
  flow?: (x: number, y: number) => number; // fallback stroke angle (radians)
  gradMin?: number;
  colorTol?: number;
};

type Img = {w: number; h: number; d: Uint8ClampedArray};

const lum = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

const boxBlurLum = (img: Img, r: number) => {
  const {w, h, d} = img;
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = lum(d, i * 4);
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += L[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / (2 * r + 1);
      acc += L[y * w + Math.min(w - 1, x + r + 1)] - L[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1);
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
};

export const paintStrokes = (src: ImageData, ctx: CanvasRenderingContext2D, o: PaintOptions = {}) => {
  const {
    radii = [20, 10, 5, 2.5], threshold = 22, maxLen = 10, minLen = 2, alpha = 0.9,
    jitter = 0.08, bristles = 3, seed = 1, flow, gradMin = 1.2, colorTol = 38,
  } = o;
  const w = src.width, h = src.height;
  const S: Img = {w, h, d: src.data};
  const rand = mulberry(seed);
  const at = (x: number, y: number) => ((Math.min(h - 1, Math.max(0, y | 0)) * w + Math.min(w - 1, Math.max(0, x | 0))) * 4);

  for (let li = 0; li < radii.length; li++) {
    const R = radii[li];
    const Lb = boxBlurLum(S, Math.max(1, Math.round(R * 0.6)));
    const grad = (x: number, y: number): [number, number] => {
      const xi = Math.min(w - 2, Math.max(1, x | 0)), yi = Math.min(h - 2, Math.max(1, y | 0));
      const gx = Lb[yi * w + xi + 1] - Lb[yi * w + xi - 1];
      const gy = Lb[(yi + 1) * w + xi] - Lb[(yi - 1) * w + xi];
      return [gx, gy];
    };
    const cur = li === 0 ? null : ctx.getImageData(0, 0, w, h).data;
    const grid = Math.max(1, Math.round(R));
    const starts: [number, number][] = [];
    for (let gy = 0; gy < h; gy += grid) {
      for (let gx = 0; gx < w; gx += grid) {
        if (!cur) {
          starts.push([gx + rand() * grid, gy + rand() * grid]);
          continue;
        }
        // area error: find the worst point in the cell
        let err = 0, bx = gx, by = gy, maxE = -1;
        const n = 4;
        for (let s = 0; s < n; s++) {
          const x = gx + rand() * grid, y = gy + rand() * grid;
          const i = at(x, y);
          const e = Math.abs(S.d[i] - cur[i]) + Math.abs(S.d[i + 1] - cur[i + 1]) + Math.abs(S.d[i + 2] - cur[i + 2]);
          err += e;
          if (e > maxE) { maxE = e; bx = x; by = y; }
        }
        if (err / n > threshold) starts.push([bx, by]);
      }
    }
    // shuffle so strokes interleave instead of tiling in rows
    for (let i = starts.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [starts[i], starts[j]] = [starts[j], starts[i]];
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [sx, sy] of starts) {
      const i0 = at(sx, sy);
      const v = 1 + (rand() - 0.5) * 2 * jitter;
      const cr = Math.min(255, S.d[i0] * v), cg = Math.min(255, S.d[i0 + 1] * v), cb = Math.min(255, S.d[i0 + 2] * v);
      const pts: [number, number][] = [[sx, sy]];
      let x = sx, y = sy, pdx = 0, pdy = 0;
      for (let k = 1; k < maxLen; k++) {
        const [gx, gy] = grad(x, y);
        const gm = Math.hypot(gx, gy);
        let dx: number, dy: number;
        if (gm < gradMin) {
          if (!flow) { if (k > minLen) break; const a = rand() * Math.PI; dx = Math.cos(a); dy = Math.sin(a); }
          else { const a = flow(x, y); dx = Math.cos(a); dy = Math.sin(a); }
        } else {
          dx = -gy / gm; dy = gx / gm; // along the contour
        }
        if (dx * pdx + dy * pdy < 0) { dx = -dx; dy = -dy; }
        if (k > 1) { dx = 0.6 * dx + 0.4 * pdx; dy = 0.6 * dy + 0.4 * pdy; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m; }
        x += dx * R; y += dy * R;
        if (x < -R || y < -R || x > w + R || y > h + R) break;
        const i = at(x, y);
        const diff = Math.abs(S.d[i] - cr) + Math.abs(S.d[i + 1] - cg) + Math.abs(S.d[i + 2] - cb);
        if (k > minLen && diff > colorTol) break;
        pts.push([x, y]);
        pdx = dx; pdy = dy;
      }
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        if (pts.length === 1) ctx.lineTo(pts[0][0] + 0.1, pts[0][1]);
        for (let k = 1; k < pts.length - 1; k++) {
          const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2;
          ctx.quadraticCurveTo(pts[k][0], pts[k][1], mx, my);
        }
        if (pts.length > 1) ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      };
      ctx.strokeStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha})`;
      ctx.lineWidth = R * 1.9;
      path();
      ctx.stroke();
      // bristle hairlines: slightly lighter / darker streaks inside the stroke
      if (bristles > 0 && R >= 2.5) {
        for (let b = 0; b < bristles; b++) {
          const off = (rand() - 0.5) * R * 1.4;
          const sh = 1 + (rand() - 0.5) * 0.35;
          ctx.save();
          const [ax, ay] = pts[0];
          const [bx2, by2] = pts[pts.length - 1];
          const m = Math.hypot(bx2 - ax, by2 - ay) || 1;
          ctx.translate((-(by2 - ay) / m) * off, ((bx2 - ax) / m) * off);
          ctx.strokeStyle = `rgba(${Math.min(255, cr * sh) | 0},${Math.min(255, cg * sh) | 0},${Math.min(255, cb * sh) | 0},${alpha * 0.45})`;
          ctx.lineWidth = Math.max(0.8, R * (0.18 + rand() * 0.2));
          path();
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
};
