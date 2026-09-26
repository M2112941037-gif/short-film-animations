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
