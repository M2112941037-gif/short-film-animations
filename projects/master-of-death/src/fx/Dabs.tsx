import React, {useMemo} from 'react';
import {mix, rng} from '../util';

// Painterly brushwork: many short, rotated strokes whose colour is sampled
// from `colorAt`. Gives large fields (sky, snow, rock) the hand-painted
// texture of the reference board without drawing every stroke by hand.
export const Dabs: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  colorAt: (u: number, v: number) => string;
  size?: [number, number];
  aspect?: number;
  angle?: number;
  angleJitter?: number;
  jitter?: number;
  jitterColor?: string;
  opacity?: [number, number];
  seed?: string;
  mask?: (u: number, v: number) => boolean;
  filter?: string;
  soften?: number;
}> = ({
  x, y, w, h, count, colorAt,
  size = [10, 40], aspect = 3.5, angle = -8, angleJitter = 18,
  jitter = 0.18, jitterColor = '#000000', opacity = [0.35, 0.8],
  seed = 'dabs', mask, filter = 'rough-s', soften = 0,
}) => {
  const dabs = useMemo(() => {
    const r = rng(seed);
    const out: {cx: number; cy: number; l: number; t: number; a: number; c: string; o: number}[] = [];
    for (let i = 0; i < count; i++) {
      const u = r(), v = r();
      const sz = size[0] + r() * r() * (size[1] - size[0]);
      const j = (r() - 0.5) * 2 * jitter;
      const c = j > 0 ? mix(colorAt(u, v), '#ffffff', j * 0.6) : mix(colorAt(u, v), jitterColor, -j);
      const keep = !mask || mask(u, v);
      if (!keep) continue;
      out.push({
        cx: x + u * w, cy: y + v * h, l: sz * aspect, t: sz,
        a: angle + (r() - 0.5) * angleJitter * 2,
        c, o: opacity[0] + r() * (opacity[1] - opacity[0]),
      });
    }
    return out;
  }, [x, y, w, h, count, colorAt, size, aspect, angle, angleJitter, jitter, jitterColor, opacity, seed, mask]);

  const strokes = dabs.map((d, i) => (
        <rect
          key={i}
          x={d.cx - d.l / 2}
          y={d.cy - d.t / 2}
          width={d.l}
          height={d.t}
          rx={d.t / 2}
          fill={d.c}
          opacity={d.o}
          transform={`rotate(${d.a} ${d.cx} ${d.cy})`}
        />
      ));
  return (
    <g filter={filter ? `url(#${filter})` : undefined}>
      {soften ? <g filter={`url(#blur-${soften})`}>{strokes}</g> : strokes}
    </g>
  );
};
