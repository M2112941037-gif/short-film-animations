import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Hand} from '../characters/Hand';
import {HarryPaint} from '../characters/HarryPaint';
import {LilyPaint} from '../characters/LilyPaint';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {drawDeath} from '../paint/death';
import {Painted} from '../paint/Painted';
import {ResurrectionStone} from '../props/Magic';
import {FPS, H, W} from '../theme';
import {voidBackdrop} from './backdrop';
import {GhostCrowd} from './StoneReveal';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

// 00:44–00:48. The longing turns to understanding. He draws his hand back.
// He and Lily look at each other and smile; then she goes back into light,
// and the light goes back into the stone.
export const UNDERSTAND_FRAMES = 96;
export const Understand: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const back = interpolate(s, [0.2, 1.5], [0, 1], {...clamp, easing: ease});
  const calm = interpolate(s, [0.1, 1.6], [0, 1], {...clamp, easing: ease});
  const smile = interpolate(s, [1.2, 2.3], [0, 1], {...clamp, easing: ease});
  const gone = interpolate(s, [2.6, 3.9], [0, 1], {...clamp, easing: ease});
  const orb = interpolate(s, [2.8, 3.9], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const orbX = 440 + (900 - 440) * orb, orbY = 420 + (960 - 420) * orb;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`un-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, s + 90, 0.9 - 0.3 * gone, [900, 960])}
        under={
          <>
            <GhostCrowd o={0.7 * (1 - gone)} />
            <g opacity={1 - gone} transform="translate(760 110) scale(-1.6 1.6)"><LilyPaint smile={0.5 + 0.45 * smile} look={-3} /></g>
            <g transform="translate(1060 150) scale(1.6)">
              <HarryPaint id="hp-un" look={-6} brow={0.7 - 0.6 * calm} lid={0.4 * calm} smile={0.6 * smile} warm={0.85} shine={s} />
            </g>
            <g transform={`translate(${1080 + 240 * back} ${760 + 360 * back}) scale(-1 1) rotate(-6)`}><Hand k={1.4} curl={0.08 + 0.3 * back} id="hand-un" /></g>
          </>
        }
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform="translate(900 960)"><ResurrectionStone r={24} glow={0.7 + 0.3 * orb} id="rs-un" /></g>
        {gone > 0 && gone < 1 && <circle cx={orbX} cy={orbY} r={60 * (1 - orb * 0.7)} fill="#ffd9a0" opacity={0.6 * Math.sin(gone * Math.PI)} filter="url(#blur-24)" />}
      </svg>
      <Snow frame={frame + 700} layer="far" count={80} seed="un" wind={0.15} color="#f2e6d4" opacity={0.6} />
      <Surface grainSeed={frame} vignette={0.66} />
    </AbsoluteFill>
  );
};

// 00:48–00:50. The stone settles back into his palm. He looks at it — and
// tips his hand, and lets it fall.
export const LETGO_FRAMES = 60;
export const LetGo: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const settle = interpolate(s, [0, 0.6], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const tip = interpolate(s, [1.1, 1.6], [0, 1], {...clamp, easing: ease});
  const drop = Math.max(0, s - 1.45);
  const k = 2.6;
  const rot = -8 + 48 * tip;
  // the stone rides in the hand until it slides off, then falls free
  const a = (rot * Math.PI) / 180;
  const local: [number, number] = [84 * k, -40 * k];
  const inHand: [number, number] = [380 + local[0] * Math.cos(a) - local[1] * Math.sin(a), 620 + local[0] * Math.sin(a) + local[1] * Math.cos(a)];
  const stone: [number, number] = drop > 0 ? [inHand[0] + 140 * drop, inHand[1] + 1600 * drop * drop] : [inHand[0], inHand[1] - (1 - settle) * 520];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`lg-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, s + 100, 0.7 - 0.4 * tip, [stone[0], stone[1]])}
        under={<g transform={`translate(380 620) rotate(${rot})`}><Hand k={k} curl={0.35 - 0.3 * tip} id="hand-lg" /></g>}
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform={`translate(${stone[0]} ${stone[1]}) rotate(${drop * 200})`}><ResurrectionStone r={40} glow={0.6 - 0.3 * tip} id="rs-lg" /></g>
      </svg>
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};

// A beat: Death bows its hood to look down at the pans.
export const GLANCE_FRAMES = 22;
export const DeathGlance: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const bow = interpolate(s, [0, 0.8], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`dg-${frame}`}
        flow="swirl"
        before={(ctx, noise) => {
          voidBackdrop(ctx, noise, s + 110);
          ctx.save();
          ctx.translate(960, 900);
          ctx.rotate((-6 - 10 * bow) * (Math.PI / 180));
          ctx.translate(-960, -900);
          drawDeath(ctx, noise, {cx: 960, cy: 430 + 30 * bow, k: 1.25, t: s + 110, rim: '#7888aa', glowAmt: 0});
          ctx.restore();
        }}
      />
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};
