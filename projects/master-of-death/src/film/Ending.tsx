import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB} from '../paint/canvas';
import {Painted} from '../paint/Painted';
import {Hallows} from '../props/Magic';
import {Scale} from '../props/Scale';
import {NARRATION} from '../text';
import {FONT, FPS, H, W} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 01:25 — the balance again. No one holds it, no one stands on it. Snow
// settles into both pans; both sink together; level. We pull away until
// there is only snow.
export const FINAL_BALANCE_FRAMES = 96;
export const FinalBalance: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const fill = interpolate(s, [0.2, 2.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const pull = interpolate(s, [1.4, 4.0], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const white = interpolate(s, [3.0, 4.0], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const z = 1.25 - 0.95 * pull;
  const camT = `translate(${W / 2 - 960 * z} ${H / 2 - 520 * z}) scale(${z})`;
  const mound = (id: string) => (
    <g>
      <path d={`M${-120},-2 Q0,${-6 - 44 * fill} 120,-2 Z`} fill="#f4f7fb" />
      <path d={`M${-80},${-6 - 10 * fill} Q0,${-10 - 34 * fill} 80,${-6 - 10 * fill}`} fill="none" stroke="#fff" strokeWidth={2} opacity={0.7} key={id} />
    </g>
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`fb-${frame}`}
        before={(ctx, noise) =>
          noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0015, t: s * 0.05 + 30, warp: 0.5}, (x, y, n) => {
            const v = Math.max(0, Math.min(1, 0.45 + n * 0.2 + (y / H) * 0.25));
            const [r, g, b] = rampRGB([[0, '#2a3348'], [0.5, '#6d7894'], [1, '#c9d1e0']], v);
            return [r, g, b, 1];
          })
        }
        under={<g transform={camT}><g transform="translate(960 160)"><Scale L={300} tilt={0} ring={false} stand chain={1.05 + 0.07 * fill} left={mound('l')} right={mound('r')} /></g></g>}
      />
      <Snow frame={frame + 1200} layer="far" count={320} seed="fb" wind={0.1} color="#f4f7fb" />
      <Snow frame={frame + 1200} layer="mid" count={110} seed="fb" wind={0.1} />
      <Snow frame={frame + 1200} layer="near" count={14} seed="fb" wind={0.1} opacity={0.7} />
      <Surface grainSeed={frame} vignette={0.45} />
      {white > 0 && <AbsoluteFill style={{background: '#f4f6f9', opacity: white}} />}
    </AbsoluteFill>
  );
};

// Black. Footsteps (in the score). The sign of the Hallows draws itself, then
// gives way to the last line.
export const ENDCARD_FRAMES = 150;
export const EndCard: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const draw = interpolate(s, [1.1, 2.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const sign = interpolate(s, [1.0, 1.3, 3.6, 4.4], [0, 1, 1, 0], clamp);
  const text = interpolate(s, [3.9, 4.8, 5.8, 6.25], [0, 1, 1, 0], clamp);
  const white = interpolate(s, [0, 0.8], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <Filters />
      <svg width={W} height={H} style={{position: 'absolute', opacity: sign}}>
        <g transform={`translate(${W / 2} ${H / 2 - 20})`}><Hallows size={230} draw={draw} /></g>
      </svg>
      <div style={{opacity: text, textAlign: 'center', transform: `translateY(${(1 - text) * 8}px)`}}>
        <div style={{fontFamily: FONT.zh, fontSize: 54, letterSpacing: '0.24em', color: '#ece8df'}}>{NARRATION.adventure.zh}</div>
        <div style={{fontFamily: FONT.en, fontStyle: 'italic', fontSize: 36, letterSpacing: '0.05em', color: '#b9bcc4', marginTop: 18}}>{NARRATION.adventure.en}</div>
      </div>
      {white > 0 && <AbsoluteFill style={{background: '#f4f6f9', opacity: white}} />}
    </AbsoluteFill>
  );
};
