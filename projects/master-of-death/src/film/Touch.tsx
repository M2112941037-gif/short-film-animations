import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Hand} from '../characters/Hand';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {FPS, H, W} from '../theme';
import {voidBackdrop} from './backdrop';

// 00:37–00:40. Two hands, closer and closer; a finger's breadth apart —
// and a snowflake falls onto hers, and goes straight through.
export const TOUCH_FRAMES = 84;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Touch: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 70;
  const near = interpolate(s, [0, 2.0], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const harryX = 1760 - 330 * near;
  const lilyX = 380 + 30 * near;
  // the flake: falls onto her hand at 2.1 s and keeps on falling, through it
  const flakeY = interpolate(s, [0.6, 2.1, 3.5], [-40, 540, 1140], clamp);
  const flakeX = 800 + Math.sin(s * 2.2) * 14;
  const pass = Math.max(0, 1 - Math.abs(s - 2.15) * 3);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`to-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, t, 0.9, [960, 700])}
        under={
          <>
            <g transform={`translate(${lilyX} 560) rotate(-4)`}><Hand k={2.3} curl={0.08} ghost={1} id="lh" /></g>
            <g transform={`translate(${harryX} 520) scale(-1 1) rotate(-3)`}><Hand k={2.3} curl={0.08} id="hh" /></g>
          </>
        }
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* a faint ring where it passes through her */}
        {pass > 0 && <ellipse cx={flakeX} cy={545} rx={40 * (1.3 - pass)} ry={12 * (1.3 - pass)} fill="none" stroke="#fff4dc" strokeWidth={2} opacity={pass * 0.8} filter="url(#blur-1.5)" />}
        <circle cx={flakeX} cy={flakeY} r={16} fill="#fff" opacity={0.35} filter="url(#blur-6)" />
        <circle cx={flakeX} cy={flakeY} r={5.5} fill="#ffffff" />
      </svg>
      <Snow frame={frame + 500} layer="mid" count={30} seed="to" wind={0.1} speed={0.6} />
      <Snow frame={frame + 500} layer="near" count={6} seed="to" wind={0.1} speed={0.6} opacity={0.5} />
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};
