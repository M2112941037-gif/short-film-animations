import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Hand} from '../characters/Hand';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {FPS, H, W} from '../theme';
import {voidBackdrop} from './backdrop';

// 00:37–00:40. Two hands, closer and closer — a finger's breadth apart. Framed
// tight on the hands; a single flake starts to fall toward hers.
export const TOUCH_FRAMES = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CAM = {z: 1.6, cx: 910, cy: 545};
const camT = `translate(${W / 2 - CAM.cx * CAM.z} ${H / 2 - CAM.cy * CAM.z}) scale(${CAM.z})`;

// One snowflake, drawn properly: six feathered arms, a hexagonal heart.
export const Flake: React.FC<{r: number; rot?: number; opacity?: number; soft?: boolean}> = ({r, rot = 0, opacity = 1, soft = false}) => {
  const q = Math.sin(Math.PI / 3), h = Math.cos(Math.PI / 3);
  const arm = (
    <>
      <line x1={0} y1={0} x2={0} y2={-r} />
      {[[0.3, 0.32], [0.52, 0.27], [0.72, 0.18], [0.88, 0.09]].map(([u, l]) => (
        <path key={u} d={`M${-q * l * r},${-u * r - h * l * r} L0,${-u * r} L${q * l * r},${-u * r - h * l * r}`} />
      ))}
    </>
  );
  const star = (stroke: string, w: number) => (
    <g stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {[0, 60, 120, 180, 240, 300].map((a) => <g key={a} transform={`rotate(${a})`}>{arm}</g>)}
      <path d={[0, 1, 2, 3, 4, 5].map((i) => `${i ? 'L' : 'M'}${0.17 * r * Math.sin((i * Math.PI) / 3)},${-0.17 * r * Math.cos((i * Math.PI) / 3)}`).join(' ') + 'Z'} />
    </g>
  );
  return (
    <g transform={`rotate(${rot})`} opacity={opacity} filter={soft ? 'url(#blur-3)' : undefined}>
      <g filter="url(#blur-6)" opacity={0.7}>{star('#e8f0ff', r * 0.16)}</g>
      <g transform={`translate(${r * 0.02} ${r * 0.03})`}>{star('#8ea6cc', r * 0.07)}</g>
      {star('#ffffff', r * 0.055)}
    </g>
  );
};

export const Touch: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 70;
  const near = interpolate(s, [0, 1.9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const harryX = 1760 - 330 * near;
  const lilyX = 380 + 30 * near;
  const flakeY = interpolate(s, [1.0, 2.5], [-60, 250], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`to-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, t, 0.9, [960, 700])}
        under={
          <g transform={camT}>
            <g transform={`translate(${lilyX} 560) rotate(-4)`}><Hand k={2.3} curl={0.08} ghost={1} id="lh" /></g>
            <g transform={`translate(${harryX} 520) scale(-1 1) rotate(-3)`}><Hand k={2.3} curl={0.08} id="hh" /></g>
          </g>
        }
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {s > 1.0 && <g transform={`translate(${780 + Math.sin(s * 2.2) * 14} ${flakeY})`}><Flake r={16} rot={s * 20} /></g>}
      </svg>
      <Snow frame={frame + 500} layer="mid" count={30} seed="to" wind={0.1} speed={0.6} />
      <Snow frame={frame + 500} layer="near" count={6} seed="to" wind={0.1} speed={0.6} opacity={0.5} />
      <Surface grainSeed={frame} vignette={0.7} />
    </AbsoluteFill>
  );
};

// 00:40 — close on her hand: the flake drifts down onto it and passes
// straight through, as if nothing were there.
export const FLAKE_FRAMES = 64;
export const FLAKE_PASS = [24, 40]; // frames it spends inside her hand (for the soundtrack)
export const FlakeThrough: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 74;
  const y = interpolate(frame, [0, 22, 44, 64], [-80, 440, 760, 1160], clamp);
  const x = 720 + Math.sin(s * 1.8) * 20;
  const inside = y > 470 && y < 730;
  const ring = interpolate(frame, [FLAKE_PASS[0], FLAKE_PASS[0] + 18], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`ft-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, t, 0.9, [900, 640])}
        under={<g transform="translate(40 610) rotate(-5)"><Hand k={4.4} curl={0.1} ghost={1} id="lh-cu" /></g>}
      />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* where it enters, a faint warm ripple spreads across her skin — and that is all */}
        {ring > 0 && ring < 1 && <ellipse cx={x} cy={478} rx={30 + 150 * ring} ry={8 + 30 * ring} fill="none" stroke="#fff1d6" strokeWidth={3} opacity={0.7 * (1 - ring)} filter="url(#blur-1.5)" />}
        <g transform={`translate(${x} ${y})`}><Flake r={92} rot={s * 16} opacity={inside ? 0.5 : 1} soft={inside} /></g>
      </svg>
      <Snow frame={frame + 700} layer="far" count={40} seed="fl" wind={0.1} speed={0.5} color="#f2e6d4" opacity={0.5} />
      <Surface grainSeed={frame} vignette={0.72} />
    </AbsoluteFill>
  );
};
