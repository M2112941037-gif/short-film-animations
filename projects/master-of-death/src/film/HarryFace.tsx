import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HarryPaint, type HarryExpr} from '../characters/HarryPaint';
import {Filters} from '../fx/Filters';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {FPS} from '../theme';
import {snowfield, voidBackdrop} from './backdrop';

// A close shot on Harry's face — where the film's turn happens in his eyes.
// `eyes` frames just the eyes and glasses; the catchlights keep moving.
export const HarryFace: React.FC<{frame: number; expr: HarryExpr; zoom?: number; eyes?: boolean; snow?: boolean}> = ({frame, expr, zoom: z0 = 3, eyes = false, snow = false}) => {
  const zoom = eyes ? 9.5 : z0;
  const [bx, by] = eyes ? [188, 192] : [205, 205];
  return (
  <AbsoluteFill style={{background: '#000'}}>
    <Filters />
    <Painted
      renderKey={`hf-${frame}-${JSON.stringify(expr)}-${zoom}-${eyes}-${snow}`}
      before={(ctx, noise) => (snow ? snowfield(ctx, noise, frame / FPS + 80, 700) : voidBackdrop(ctx, noise, frame / FPS + 80, expr.warm ?? 0, [200, 900]))}
      under={<g transform={`translate(${960 - bx * zoom} ${540 - by * zoom}) scale(${zoom})`}><HarryPaint id="hp-face" shine={frame / FPS} {...expr} /></g>}
    />
    <Surface grainSeed={frame} vignette={0.7} />
  </AbsoluteFill>
  );
};
