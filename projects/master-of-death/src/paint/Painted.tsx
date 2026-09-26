import React from 'react';
import {H, W} from '../theme';
import type {Ctx} from './canvas';
import {makeNoise, Noise} from './noise';
import {PaintCanvas} from './PaintCanvas';
import {PaintOptions, paintStrokes} from './painter';
import {rasterize} from './rasterize';

// Any vector scene in, an oil-painted frame out. `under` is SVG content used
// as the underpainting; `before` / `after` can add canvas-native passes
// (fog, cloth, glow) under the vector art or over the finished paint.
export const Painted: React.FC<{
  under?: React.ReactNode;
  before?: (ctx: Ctx, noise: Noise) => void;
  after?: (ctx: Ctx, noise: Noise) => void | Promise<void>;
  options?: PaintOptions;
  flow?: 'swirl' | 'horizontal' | 'none';
  renderKey: string;
  background?: string;
  noiseSeed?: number;
}> = ({under, before, after, options = {}, flow = 'horizontal', renderKey, background = '#05070b', noiseSeed = 7}) => {
  const draw = async (out: Ctx) => {
    const noise = makeNoise(noiseSeed);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', {willReadFrequently: true})!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
    before?.(ctx, noise);
    if (under) ctx.drawImage(await rasterize(under), 0, 0);
    const src = ctx.getImageData(0, 0, W, H);
    out.fillStyle = background;
    out.fillRect(0, 0, W, H);
    const flowFn =
      flow === 'swirl'
        ? (x: number, y: number) => noise.fbm(x * 0.0016, y * 0.0016, 3, 3) * Math.PI * 2 - 0.3
        : flow === 'horizontal'
          ? (x: number, y: number) => noise.fbm(x * 0.002, y * 0.002, 5, 3) * 0.9
          : undefined;
    paintStrokes(src, out, {radii: [9, 5, 2.8, 1.6, 1], threshold: 12, maxLen: 14, colorTol: 26, jitter: 0.045, alpha: 0.78, bristles: 4, seed: 11, flow: flowFn, ...options});
    await after?.(out, noise);
  };
  return <PaintCanvas draw={draw} renderKey={renderKey} />;
};
