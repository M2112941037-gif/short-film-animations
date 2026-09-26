import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {HarryPaint} from '../characters/HarryPaint';
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
  const neck: [number, number] = [1034, 716 + up];
  const wrist: [number, number] = [neck[0] - 330 - 300 * (1 - come), neck[1] - 30 - 380 * (1 - come)];
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
            <g transform={`translate(620 ${140 + up}) scale(1.8)`}><HarryPaint id="hp-grab" /></g>
            <g transform={`translate(${wrist[0]} ${wrist[1]}) rotate(${10 - 4 * curl})`}>
              <BoneHand k={2.5} curl={curl} spread={0.9} thumb={0.4 + curl * 0.5} hook={0.8} forearm={30} />
            </g>
            {[[-1, -110, 70], [1, 60, 60]].map(([side, dx, dy]) => {
              const hx = neck[0] + (dx as number), hy = neck[1] + (dy as number) + (1 - reach) * 420;
              return (
                <g key={side} transform={`translate(${hx} ${hy}) rotate(${(side as number) * -18})`}>
                  <path d="M-34,40 L-30,-10 Q-26,-40 -12,-46 L-10,-70 Q-6,-80 2,-70 L4,-48 L10,-76 Q16,-84 22,-74 L20,-44 L28,-62 Q36,-66 36,-54 L30,-20 Q34,10 26,40Z" fill="#d9b49b" />
                  <path d="M6,-40 L20,-44 L28,-62 Q36,-66 36,-54 L30,-20 Q34,10 26,40 L4,40Z" fill="#9c7c78" opacity={0.7} />
                  <path d="M-34,40 L26,40 L28,160 L-40,160Z" fill="#2a3550" />
                </g>
              );
            })}
          </>
        }
      />
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};
