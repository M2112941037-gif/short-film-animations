import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {PEOPLE, Person} from '../characters/Person';
import {Filters} from '../fx/Filters';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB} from '../paint/canvas';
import {drawSleeve} from '../paint/death';
import {Painted} from '../paint/Painted';
import {FPS, H, W} from '../theme';

// 00:24–00:26. The bone hand closes on Harry's throat and lifts him off
// his feet; his own hands fly up to it.
export const GRAB_FRAMES = 48;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Grab: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 30;
  const come = interpolate(s, [0, 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const curl = interpolate(s, [0.4, 0.75], [0.25, 0.95], {...clamp, easing: Easing.inOut(Easing.quad)});
  const lift = interpolate(s, [0.75, 1.7], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const reach = interpolate(s, [0.6, 1.0], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const up = -130 * lift;
  const neck: [number, number] = [960, 640 + up];
  const wrist: [number, number] = [neck[0] - 250 - 300 * (1 - come), neck[1] + 6 - 380 * (1 - come)];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`grab-${frame}`}
        before={(ctx, noise) => {
          noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0016, t: t * 0.05, warp: 0.6}, (x, y, n) => {
            const top = Math.exp(-(((x - 900) / 600) ** 2 + ((y + 100) / 600) ** 2));
            const v = Math.max(0, Math.min(1, top * (0.55 + n * 0.5) + n * 0.1 + 0.04));
            const [r, g, b] = rampRGB([[0, '#040509'], [0.35, '#141a26'], [0.7, '#3a4660'], [1, '#8d9cbb']], v);
            return [r, g, b, 1];
          });
          drawSleeve(ctx, noise, [wrist[0] - 520, wrist[1] - 420], [wrist[0] - 8, wrist[1] - 2], {w: 150, t, rim: '#7888aa'});
        }}
        under={
          <>
            <g transform={`translate(960 ${1160 + up})`}>
              <Person spec={PEOPLE.harry} k={6.5} id="harry-grab" reach={reach} />
            </g>
            <g transform={`translate(${wrist[0]} ${wrist[1]}) rotate(${8 - 4 * curl})`}>
              <BoneHand k={1.7} curl={curl} spread={0.9} thumb={0.4 + curl * 0.5} hook={0.8} forearm={30} />
            </g>
          </>
        }
      />
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};
