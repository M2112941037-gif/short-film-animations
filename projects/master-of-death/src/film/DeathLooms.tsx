import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB} from '../paint/canvas';
import {drawDeath, drawHoodMist} from '../paint/death';
import {Painted} from '../paint/Painted';
import {FPS, H, W} from '../theme';

// 00:21–00:24. Harry's eyes: looking up. The hood comes down over him; no
// face in it, only depth, and black mist spilling from its rim. A hand
// reaches out of the dark toward him.
export const DEATH_LOOMS_FRAMES = 64;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const DeathLooms: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 20;
  const p = interpolate(s, [0, 2.65], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const k = 1.9 * Math.pow(4.6 / 1.9, p);
  const cy = 600 - 80 * p;
  const reach = interpolate(s, [1.55, 2.65], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const hk = 2.2 + reach * 4.5;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`dl-${frame}`}
        flow="swirl"
        before={(ctx, noise) => {
          noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0016, t: t * 0.05, warp: 0.6}, (x, y, n) => {
            const top = Math.exp(-(((x - 960) / 700) ** 2 + (y / 520) ** 2));
            const v = Math.max(0, Math.min(1, top * (0.6 + n * 0.5) + n * 0.1 + 0.03));
            const [r, g, b] = rampRGB([[0, '#030406'], [0.3, '#10151f'], [0.6, '#2c3850'], [1, '#8d9cbb']], v);
            return [r, g, b, 1];
          });
          drawDeath(ctx, noise, {cx: 960, cy, k, t, rim: '#7888aa', glowAmt: 0});
          drawHoodMist(ctx, noise, 960, cy, k, t, 0.35 + 0.65 * p);
        }}
        under={
          reach > 0 ? (
            <g opacity={Math.min(1, reach * 3)} transform={`translate(${260 + 420 * reach} ${-120 + 520 * reach}) rotate(${38 - 8 * reach})`}>
              <BoneHand k={hk} curl={0.25} spread={1.25} thumb={0.3} hook={0.7} forearm={40} />
            </g>
          ) : undefined
        }
      />
      <Snow frame={frame} layer="far" count={120} seed="dl" wind={0.1} speed={1.4} color="#c9d2e2" opacity={1 - p} />
      <Surface grainSeed={frame} vignette={0.75} />
    </AbsoluteFill>
  );
};
