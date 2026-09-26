import React, {useLayoutEffect, useRef} from 'react';
import {continueRender, delayRender} from 'remotion';
import {H, RES, W} from '../theme';
import type {Ctx} from './canvas';

// A full-frame canvas whose content is produced by `draw`. Rendering is
// synchronous and deterministic for a given `renderKey` (usually the frame).
export const PaintCanvas: React.FC<{draw: (ctx: Ctx, w: number, h: number) => void | Promise<void>; renderKey: string | number}> = ({draw, renderKey}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const handle = delayRender(`paint ${renderKey}`, {timeoutInMilliseconds: 120000});
    const ctx = ref.current!.getContext('2d')!;
    ctx.clearRect(0, 0, W * RES, H * RES);
    Promise.resolve(draw(ctx, W, H)).then(() => continueRender(handle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderKey]);
  return <canvas ref={ref} width={Math.round(W * RES)} height={Math.round(H * RES)} style={{position: 'absolute', inset: 0, width: W, height: H}} />;
};
