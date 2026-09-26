import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dabs} from '../fx/Dabs';
import {Filters} from '../fx/Filters';
import {Painted} from '../paint/Painted';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Gravestone} from '../props/Gravestone';
import {Church, GraveRow, SnowGround, Tree} from '../props/Landscape';
import {EPITAPH} from '../text';
import {C, FONT, H, W} from '../theme';
import {ramp} from '../util';

// 00:42 — Godric's Hollow. The snowflake lands on the stone and stays:
// the dead are real, and gone. Push-in ends on the epitaph.
// `push` 0..1 moves in from the wide shot to the epitaph; `flake` 0..1 is
// the one snowflake's fall — at 1 it has landed on the stone, and stays;
// `reveal` 0..1 brings up the carving and its gloss.
export const SF03Gravestone: React.FC<{frame?: number; push?: number; flake?: number; reveal?: number}> = ({frame = 80, push = 0, flake = 1, reveal = 1}) => {
  const stone: [number, number] = [830, 1010];
  const z = 1 + 0.95 * push;
  const fx = 960 + (830 - 960) * push, fy = 540 + (700 - 540) * push;
  const camT = `translate(${W / 2 - fx * z} ${H / 2 - fy * z}) scale(${z})`;
  const landY = stone[1] - 40 - 700 - 34;
  const flakePos: [number, number] = [stone[0] + 70 + Math.sin(flake * 6) * 18 * (1 - flake), -60 + (landY + 60) * flake];
  const skyAt = (u: number, v: number) => {
    const warm = Math.max(0, 1 - Math.hypot((u - 0.82) * 1.4, (v - 0.72) * 2.2));
    const base = ramp([[0, '#101724'], [0.5, '#25304a'], [0.75, '#3d4863'], [1, '#56566a']], v);
    return ramp([[0, base], [0.6, '#6d5a5c'], [1, '#a47b62']], warm * 0.9);
  };
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Filters />
      <Painted renderKey={`sf03-${frame}-${push.toFixed(3)}`} under={<g transform={camT}>
        <defs>
          <linearGradient id="sf3-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d131e" />
            <stop offset="0.6" stopColor="#2a3450" />
            <stop offset="1" stopColor="#4d4d62" />
          </linearGradient>
          <radialGradient id="sf3-warm" cx="0.8" cy="0.66" r="0.3">
            <stop offset="0" stopColor={C.amber} stopOpacity="0.55" />
            <stop offset="1" stopColor={C.amber} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sf3-moon" cx="0.2" cy="0.12" r="0.25">
            <stop offset="0" stopColor="#dfe6f2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#dfe6f2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sf3-snowfield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8f9bb4" />
            <stop offset="1" stopColor="#5e6a86" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sf3-sky)" />
        <Dabs x={-60} y={-60} w={W + 120} h={760} count={2000} colorAt={skyAt} size={[10, 48]} aspect={4} angle={-6} angleJitter={12} opacity={[0.2, 0.5]} soften={3} seed="sf3-sky" jitter={0.18} jitterColor="#0a0f18" />
        <rect width={W} height={H} fill="url(#sf3-moon)" />
        <rect width={W} height={H} fill="url(#sf3-warm)" />

        {/* far layer: church, trees, a row of stones — all in atmosphere */}
        <Church x={1480} y={700} k={0.95} color="#1a2030" />
        <Tree x={1180} y={705} h={420} seed="sf3-t3" lean={0.05} color="#1c2231" snow="#aab4c6" snowAmt={0.5} depth={6} />
        <Tree x={1850} y={715} h={520} seed="sf3-t4" lean={-0.08} color="#181e2c" snow="#aab4c6" snowAmt={0.5} />
        <SnowGround y={700} amp={10} seed="sf3-g1" fill="#6d7891" edge="#b9c3d6" />
        <GraveRow y={720} x0={40} x1={1880} count={26} k={0.8} seed="sf3-r1" color="#2c3448" snow="#9aa5ba" />

        {/* mid layer */}
        <SnowGround y={790} amp={16} seed="sf3-g2" fill="url(#sf3-snowfield)" edge="#dfe5ef" />
        <GraveRow y={830} x0={-40} x1={1960} count={9} k={1.6} seed="sf3-r2" color="#141926" snow="#dfe5ef" />
        <Tree x={250} y={880} h={1050} seed="sf3-t1" lean={0.1} color="#080b12" snow="#e4e9f1" snowAmt={0.8} depth={7} />

        {/* near snow + the stone's cold shadow falling right, away from the moon */}
        <SnowGround y={930} amp={12} seed="sf3-g3" fill="#9aa6be" edge={C.snowLight} />
        <path d={`M${stone[0] - 250},${stone[1] - 30} L${stone[0] + 520},${stone[1] - 50} L${stone[0] + 640},${stone[1] + 40} L${stone[0] - 200},${stone[1] + 40}Z`} fill="#2b3550" opacity={0.45} filter="url(#blur-12)" />
        <Dabs x={0} y={900} w={W} h={180} count={500} colorAt={(u) => (u < 0.5 ? '#c9d2e2' : '#aab5ca')} size={[4, 16]} aspect={5} angle={-2} angleJitter={6} opacity={[0.2, 0.5]} seed="sf3-snowdabs" jitter={0.25} jitterColor="#5b6784" />

        <g transform={`translate(${stone[0]} ${stone[1]})`}>
          <Gravestone k={1} layer="stone" />
        </g>
        {/* drift piled against the plinth, lit from the left, blue in the dips */}
        <defs>
          <linearGradient id="sf3-drift" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="#eef2f7" />
            <stop offset="0.6" stopColor="#c3cddd" />
            <stop offset="1" stopColor="#8d9ab4" />
          </linearGradient>
        </defs>
        <path d={`M-100,${H + 20} L-100,${stone[1] + 50} Q${stone[0] - 480},${stone[1] - 10} ${stone[0] - 300},${stone[1] - 14} Q${stone[0] - 120},${stone[1] - 36} ${stone[0] + 60},${stone[1] - 20} Q${stone[0] + 300},${stone[1] - 34} ${stone[0] + 480},${stone[1] + 6} Q${stone[0] + 800},${stone[1] + 30} ${W + 100},${stone[1] + 20} L${W + 100},${H + 20}Z`} fill="url(#sf3-drift)" filter="url(#paint)" />
        <path d={`M${stone[0] - 300},${stone[1] - 14} Q${stone[0] - 120},${stone[1] - 36} ${stone[0] + 60},${stone[1] - 20} Q${stone[0] + 300},${stone[1] - 34} ${stone[0] + 480},${stone[1] + 6}`} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.75} filter="url(#rough-m)" />
        <Dabs x={0} y={stone[1] - 10} w={W} h={H - stone[1] + 10} count={260} colorAt={(u) => (u < 0.45 ? '#f3f6fa' : '#9eabc3')} size={[3, 12]} aspect={6} angle={-3} angleJitter={5} opacity={[0.25, 0.6]} seed="sf3-drift" jitter={0.2} jitterColor="#6b7896" />
      </g>} />

      {/* the carving stays crisp: it is the one thing in the shot that must be read */}
      <svg width={W} height={H} style={{position: 'absolute', filter: 'blur(0.4px)'}}>
        <g transform={camT}>
          <g transform={`translate(${stone[0]} ${stone[1]})`} opacity={reveal}>
            <Gravestone k={1} layer="text" />
          </g>
          {/* the one flake that lands on the stone — and stays */}
          <g transform={`translate(${flakePos[0]} ${flakePos[1]})`}>
            <circle r={14} fill="#ffffff" opacity={0.35} filter="url(#blur-6)" />
            <circle r={4} fill="#ffffff" />
          </g>
        </g>
      </svg>
      <Snow frame={frame} layer="far" count={260} seed="sf3" wind={0.25} color="#dfe5ef" />
      <Snow frame={frame} layer="mid" count={70} seed="sf3" wind={0.25} />
      <Snow frame={frame} layer="near" count={9} seed="sf3" wind={0.25} opacity={0.6} />

      {/* the Chinese gloss, set small and vertical beside the stone */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${W / 2 - fx * z}px, ${H / 2 - fy * z}px) scale(${z})`, opacity: reveal}}>
      <div
        style={{
          position: 'absolute',
          left: stone[0] + 350,
          top: 330,
          writingMode: 'vertical-rl',
          fontFamily: FONT.zh,
          fontSize: 24,
          letterSpacing: '0.36em',
          color: '#e7e2d6',
          textShadow: '0 0 12px rgba(0,0,0,0.85)',
          borderRight: '1px solid rgba(231,226,214,0.45)',
          paddingRight: 14,
        }}
      >
        {EPITAPH.gloss}
      </div>
      </div>
      <Surface grainSeed={frame} vignette={0.62} />
    </AbsoluteFill>
  );
};
