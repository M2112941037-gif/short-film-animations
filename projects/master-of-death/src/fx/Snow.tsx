import React, {useMemo} from 'react';
import {H, W, C} from '../theme';
import {rng} from '../util';

type Layer = 'far' | 'mid' | 'near';

const SPEC: Record<Layer, {r: [number, number]; v: [number, number]; o: [number, number]; blur?: string; sway: number}> = {
  far: {r: [0.8, 1.8], v: [0.8, 1.5], o: [0.25, 0.55], sway: 6},
  mid: {r: [1.8, 3.4], v: [1.6, 2.6], o: [0.55, 0.85], sway: 14},
  near: {r: [6, 14], v: [4, 7], o: [0.35, 0.7], blur: 'blur-6', sway: 30},
};

// Deterministic falling snow. Position is a pure function of `frame`, so any
// frame can be rendered on its own. `wind` is px/frame sideways drift.
export const Snow: React.FC<{
  frame: number;
  layer: Layer;
  count: number;
  seed?: string;
  wind?: number;
  speed?: number;
  color?: string;
  area?: {x: number; y: number; w: number; h: number};
  opacity?: number;
}> = ({frame, layer, count, seed = 'snow', wind = 0.4, speed = 1, color = C.snowLight, area, opacity = 1}) => {
  const s = SPEC[layer];
  const a = area ?? {x: -60, y: -40, w: W + 120, h: H + 80};
  const flakes = useMemo(() => {
    const r = rng(`${seed}-${layer}`);
    return Array.from({length: count}, () => ({
      x: r() * a.w,
      y: r() * a.h,
      rad: s.r[0] + r() * (s.r[1] - s.r[0]),
      v: s.v[0] + r() * (s.v[1] - s.v[0]),
      o: s.o[0] + r() * (s.o[1] - s.o[0]),
      ph: r() * Math.PI * 2,
      f: 0.02 + r() * 0.03,
    }));
  }, [seed, layer, count, a.w, a.h, s]);

  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity}}>
      <g filter={s.blur ? `url(#${s.blur})` : undefined}>
        {flakes.map((f, i) => {
          const y = (((f.y + f.v * speed * frame) % a.h) + a.h) % a.h + a.y;
          const x = (((f.x + wind * f.v * frame + Math.sin(frame * f.f + f.ph) * s.sway) % a.w) + a.w) % a.w + a.x;
          return <circle key={i} cx={x} cy={y} r={f.rad} fill={color} opacity={f.o} />;
        })}
      </g>
    </svg>
  );
};
