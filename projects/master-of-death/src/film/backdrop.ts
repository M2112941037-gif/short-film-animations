import {noiseField, rampRGB, rgba, type Ctx, type P} from '../paint/canvas';
import type {Noise} from '../paint/noise';
import {H, W} from '../theme';

// The balance-world void: dark fog with a cold top light. `warm` > 0 adds
// the Resurrection Stone's light pooling around `at`.
export const voidBackdrop = (ctx: Ctx, noise: Noise, t: number, warm = 0, at: P = [760, 560]) => {
  noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0015, t: t * 0.05, warp: 0.6}, (x, y, n) => {
    const top = Math.exp(-(((x - 960) / 760) ** 2 + ((y + 60) / 620) ** 2));
    const v = Math.max(0, Math.min(1, top * (0.55 + n * 0.5) + n * 0.1 + 0.04));
    const [r, g, b] = rampRGB([[0, '#04060a'], [0.35, '#131a27'], [0.7, '#3a4660'], [1, '#8d9cbb']], v);
    return [r, g, b, 1];
  });
  if (warm > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(at[0], at[1], 10, at[0], at[1], 900);
    g.addColorStop(0, rgba('#ffb45e', 0.55 * warm));
    g.addColorStop(0.35, rgba('#ff9a4a', 0.2 * warm));
    g.addColorStop(1, rgba('#ff9a4a', 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};

// Open snowfield at dusk: dark blue sky, a pale cold glow low on the
// horizon, distant drifts, a wide plane of snow toward us.
export const snowfield = (ctx: Ctx, noise: Noise, t: number, horizon = 560) => {
  noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0016, t: t * 0.04, warp: 0.5}, (x, y, n) => {
    if (y < horizon) {
      const v = Math.max(0, Math.min(1, (y / horizon) ** 1.6 * 0.75 + n * 0.12 + Math.exp(-(((x - 960) / 900) ** 2)) * ((y / horizon) ** 4) * 0.35));
      const [r, g, b] = rampRGB([[0, '#0c111c'], [0.4, '#243049'], [0.75, '#5d6782'], [1, '#c9c3c4']], v);
      return [r, g, b, 1];
    }
    const d = (y - horizon) / (H - horizon);
    const v = Math.max(0, Math.min(1, 0.55 + d * 0.3 + n * 0.12 - Math.abs(x - 960) / 4000));
    const [r, g, b] = rampRGB([[0, '#56627e'], [0.5, '#9aa6be'], [0.8, '#cdd5e3'], [1, '#eef2f7']], v);
    return [r, g, b, 1];
  });
  // soft far drifts along the horizon
  ctx.save();
  ctx.fillStyle = rgba('#7d89a4', 0.6);
  ctx.beginPath();
  ctx.moveTo(0, horizon + 4);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, horizon - 10 - 16 * (noise.n3(x * 0.004, 3, 0) + 1));
  ctx.lineTo(W, horizon + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
