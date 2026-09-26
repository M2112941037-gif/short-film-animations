import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {HarryPaint} from '../characters/HarryPaint';
import {Filters} from '../fx/Filters';
import {Surface} from '../fx/Surface';
import {drawSleeve} from '../paint/death';
import {Painted} from '../paint/Painted';
import {Snitch} from '../props/Magic';
import {FPS, H, W} from '../theme';
import {voidBackdrop} from './backdrop';

// 00:28–00:31. Just as the fingers tighten — the Snitch tears past the lens,
// darts around him, and Harry's eyes chase it. It stops in front of his
// face. The bone hand lets go and he drops back onto his pan.
export const SNITCH_FRAMES = 72;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// where the Snitch is at time s: a close pass across the lens, a darting
// loop around his head, then a slow settle in front of his face
export const snitchAt = (s: number): {x: number; y: number; r: number; blur: number} => {
  if (s < 0.45) {
    const u = s / 0.45;
    return {x: -300 + 2500 * u, y: 380 + 120 * Math.sin(u * 3), r: 170, blur: 14};
  }
  const u = Math.min(1, (s - 0.45) / 2.1);
  const settle = interpolate(s, [2.1, 2.7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const lx = 960 + 520 * Math.sin(u * Math.PI * 3.2) * (1 - u * 0.4);
  const ly = 470 + 220 * Math.sin(u * Math.PI * 5.1 + 1) * (1 - u * 0.5);
  return {x: lx + (720 - lx) * settle, y: ly + (540 - ly) * settle, r: 30 + 8 * settle, blur: 3 * (1 - settle)};
};

export const SnitchChase: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 50;
  const sn = snitchAt(s);
  const release = interpolate(s, [2.3, 2.8], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const drop = interpolate(s, [2.5, 2.8], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const up = -130 * (1 - drop) + Math.sin(Math.max(0, s - 2.8) * 18) * 10 * Math.exp(-Math.max(0, s - 2.8) * 6) * (s > 2.8 ? 1 : 0);
  const shake = s < 2.2 ? Math.sin(s * 47) * 6 : 0;
  const neck: [number, number] = [1034, 716 + up];
  const wrist: [number, number] = [neck[0] - 330 - 260 * release, neck[1] - 30 - 320 * release];
  const faceX = 989;
  const look = Math.max(-6, Math.min(6, (sn.x - faceX) / 60));
  const trail = Array.from({length: 9}, (_, i) => snitchAt(Math.max(0, s - (i + 1) * 0.035)));
  return (
    <AbsoluteFill style={{background: '#000', transform: `translate(${shake}px, ${shake * 0.4}px)`}}>
      <Filters />
      <Painted
        renderKey={`sc-${frame}`}
        before={(ctx, noise) => {
          voidBackdrop(ctx, noise, t, 0.25, [sn.x, sn.y]);
          drawSleeve(ctx, noise, [wrist[0] - 520, wrist[1] - 420], [wrist[0] - 8, wrist[1] - 2], {w: 150, t, rim: '#7888aa'});
        }}
        under={
          <>
            <g transform={`translate(620 ${140 + up}) scale(1.8)`}><HarryPaint id="hp-sc" look={look} brow={0.6} /></g>
            <g transform={`translate(${wrist[0]} ${wrist[1]}) rotate(${6 - 4 * (1 - release)})`}>
              <BoneHand k={2.5} curl={0.95 - 0.7 * release} spread={0.9 + 0.3 * release} thumb={0.8 - 0.5 * release} hook={0.8} forearm={30} />
            </g>
          </>
        }
      />
      {/* the Snitch stays crisp and bright over the paint, with a golden trail */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#f5c542" strokeWidth={sn.r * 0.5} strokeLinecap="round" opacity={0.28} filter="url(#blur-6)" />
        <g transform={`translate(${sn.x} ${sn.y})`} filter={sn.blur > 1 ? `url(#blur-${sn.blur > 8 ? 12 : 3})` : undefined}>
          <Snitch r={sn.r} flap={s * 40} />
        </g>
      </svg>
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};
