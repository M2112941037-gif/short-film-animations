import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {VoldemortPaint} from '../characters/VoldemortPaint';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {Skull} from '../props/Skulls';
import {FPS} from '../theme';
import {snowfield} from './backdrop';

// Close on Voldemort at the top of his mountain, centred: first the shock as
// the balance swings toward Harry, then the smirk when the stone turns to
// snow. Grey storm sky behind, skulls out of focus below.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

export const VoldemortClose: React.FC<{frame: number; expr: 'shock' | 'smirk'}> = ({frame, expr}) => {
  const z = 1.95 + 0.004 * frame;
  const shock = expr === 'shock' ? interpolate(frame, [2, 9], [0, 1], {...clamp, easing: ease}) : 0;
  const smirk = expr === 'smirk' ? interpolate(frame, [4, 16], [0, 1], {...clamp, easing: ease}) : 0;
  // turned toward Harry's side (our right): mirror the painting
  const tx = 930 + 210 * z, ty = 440 - 200 * z;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`vc-${expr}-${frame}`}
        before={(ctx, noise) => snowfield(ctx, noise, frame / FPS + 40, 1300)}
        under={
          <>
            <g filter="url(#blur-6)" opacity={0.9}>
              {[[180, 980, 1.3, 20], [420, 1040, 1.5, -30], [1500, 1000, 1.4, 40], [1760, 950, 1.2, -15], [300, 880, 1.0, 60], [1640, 860, 1.0, -50]].map(([x, y, k, r], i) => (
                <Skull key={i} x={x} y={y} k={k} rot={r} fill="#8d929e" rim="#dfe4ee" rimAmt={0.5} />
              ))}
            </g>
            <g transform={`translate(${tx} ${ty}) scale(${-z} ${z})`}>
              <VoldemortPaint id={`vp-${expr}`} shock={shock} smirk={smirk} look={-2} />
            </g>
          </>
        }
      />
      <Snow frame={frame + 300} layer="mid" count={50} seed={`vc-${expr}`} wind={1.2} />
      <Snow frame={frame + 300} layer="near" count={6} seed={`vc-${expr}`} wind={1.2} opacity={0.5} />
      <Surface grainSeed={frame} vignette={0.66} />
    </AbsoluteFill>
  );
};
