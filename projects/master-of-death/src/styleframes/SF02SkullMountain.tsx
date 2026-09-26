import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HarryMini} from '../characters/Minis';
import {VoldemortTall} from '../characters/Voldemort';
import {Dabs} from '../fx/Dabs';
import {Filters} from '../fx/Filters';
import {Painted} from '../paint/Painted';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Skull, SkullPile} from '../props/Skulls';
import {NARRATION} from '../text';
import {C, H, W} from '../theme';
import {ramp} from '../util';
import {Subtitle} from '../ui/Subtitle';

// 00:12 — skulls keep falling onto Voldemort's pan; he stands on the pile.
// Low angle from his side of the balance. The pan's chains frame a triangle.
export const SF02SkullMountain: React.FC<{frame?: number}> = ({frame = 60}) => {
  const peak: [number, number] = [760, 400];
  const hook: [number, number] = [790, -520];
  const rimL: [number, number] = [-120, 930];
  const rimR: [number, number] = [1700, 930];

  const skyAt = (u: number, v: number) => {
    const glow = Math.hypot((u - 0.4) * 1.2, v - 0.42);
    const base = ramp([[0, '#1b2230'], [0.45, '#3c4760'], [0.75, '#5a5566'], [1, '#6b4b54']], v);
    return ramp([[0, '#9aa5bd'], [0.25, base], [1, base]], glow);
  };

  // distant Harry pan: higher, smaller, alone, outside the triangle
  const hp: [number, number] = [1640, 330];
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Filters />
      <Painted renderKey={`sf02-${frame}`} options={{radii: [20, 10, 5, 2.6], threshold: 20}} under={<>
        <defs>
          <linearGradient id="sf2-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141a25" />
            <stop offset="0.55" stopColor="#3a4459" />
            <stop offset="0.85" stopColor="#56505e" />
            <stop offset="1" stopColor="#5e4450" />
          </linearGradient>
          <radialGradient id="sf2-glow" cx="0.4" cy="0.36" r="0.35">
            <stop offset="0" stopColor="#b5bfd3" stopOpacity="0.75" />
            <stop offset="1" stopColor="#b5bfd3" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sf2-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.brass} />
            <stop offset="0.4" stopColor="#5a4630" />
            <stop offset="1" stopColor="#15110d" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sf2-sky)" />
        <rect width={W} height={H} fill="url(#sf2-glow)" />
        <Dabs x={-60} y={-60} w={W + 120} h={H * 0.9} count={2600} colorAt={skyAt} size={[10, 50]} aspect={4.2} angle={-8} angleJitter={14} opacity={[0.18, 0.45]} soften={3} seed="sf2-sky" jitter={0.2} jitterColor="#0d1119" />

        {/* distant Harry pan with its own chains, rising out of frame */}
        <g opacity={0.9}>
          {[-1, 0, 1].map((s) => (
            <line key={s} x1={hp[0] + s * 70} y1={hp[1]} x2={hp[0] + 6} y2={-40} stroke="#1b1d22" strokeWidth={2} />
          ))}
          {[-1, 1].map((s) => (
            <line key={`l${s}`} x1={hp[0] + s * 70} y1={hp[1]} x2={hp[0] + 6} y2={-40} stroke={C.brass} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          ))}
          <path d={`M${hp[0] - 74},${hp[1]} Q${hp[0]},${hp[1] + 40} ${hp[0] + 74},${hp[1]}Z`} fill="#16181d" />
          <ellipse cx={hp[0]} cy={hp[1]} rx={74} ry={8} fill="#1a1b1f" stroke={C.brass} strokeWidth={1.5} />
          <g transform={`translate(${hp[0]} ${hp[1]})`}>
            <HarryMini k={0.62} rim="#b9c2d4" />
          </g>
        </g>

        {/* the pan's own chains frame the pile in a triangle */}
        {[rimL, rimR].map((p, i) => (
          <g key={i}>
            <line x1={p[0]} y1={p[1]} x2={hook[0]} y2={hook[1]} stroke="#0e0f13" strokeWidth={14} />
            <line x1={p[0]} y1={p[1]} x2={hook[0]} y2={hook[1]} stroke={C.brass} strokeWidth={5} strokeDasharray="16 10" opacity={0.55} />
          </g>
        ))}

        {/* skulls still falling onto the pile */}
        {[
          {x: 560, y: 150, k: 0.5, rot: 30},
          {x: 980, y: 40, k: 0.42, rot: -20},
          {x: 700, y: -10, k: 0.36, rot: 60},
        ].map((s, i) => (
          <g key={i}>
            <line x1={s.x} y1={s.y - 30} x2={s.x} y2={s.y - 200} stroke="#cfd5e0" strokeWidth={s.k * 60} opacity={0.16} strokeLinecap="round" filter="url(#blur-6)" />
            <Skull {...s} fill="#9ea2ac" rim={C.snow} rimAmt={0.8} />
          </g>
        ))}

        <SkullPile px={peak[0]} py={peak[1]} baseY={960} spread={820} count={420} seed="sf2" rim="#dfe4ee" top="#6a7080" bottom="#12151c" kTop={0.3} kBottom={1.05} />

        <g transform={`translate(${peak[0] + 6} ${peak[1] + 52})`}>
          <g transform="scale(1 1.08)"><VoldemortTall k={1} rim="#e3e8f2" wind={1} /></g>
        </g>

        {/* a few skulls in front of his hem so he stands IN the pile */}
        {[
          {x: peak[0] - 40, y: peak[1] + 62, k: 0.3, rot: -20, turn: 0.4},
          {x: peak[0] + 26, y: peak[1] + 66, k: 0.34, rot: 15, turn: -0.5},
          {x: peak[0] + 80, y: peak[1] + 70, k: 0.3, rot: 40, turn: 0.2},
          {x: peak[0] - 90, y: peak[1] + 78, k: 0.32, rot: -50, turn: -0.3},
        ].map((s, i) => (
          <Skull key={i} {...s} fill="#646a7a" rim="#dfe4ee" rimAmt={0.5} />
        ))}

        {/* front lip of the giant pan */}
        <path d={`M-200,${rimL[1] + 10} Q${W / 2},${rimL[1] + 170} ${W + 200},${rimR[1] + 10} L${W + 200},${H + 40} L-200,${H + 40}Z`} fill="url(#sf2-rim)" filter="url(#paint)" />
        <path d={`M-200,${rimL[1] + 10} Q${W / 2},${rimL[1] + 170} ${W + 200},${rimR[1] + 10}`} fill="none" stroke="#f0cf8f" strokeWidth={3} opacity={0.7} filter="url(#rough-m)" />
        <path d={`M-200,${rimL[1] + 34} Q${W / 2},${rimL[1] + 194} ${W + 200},${rimR[1] + 34}`} fill="none" stroke="#0b0907" strokeWidth={6} opacity={0.7} />
      </>} />

      <Snow frame={frame} layer="far" count={220} seed="sf2" wind={0.8} color="#d6dbe6" />
      <Snow frame={frame} layer="mid" count={60} seed="sf2" wind={0.8} />
      <Snow frame={frame} layer="near" count={8} seed="sf2" wind={0.8} opacity={0.55} />
      <Surface grainSeed={frame} vignette={0.6} />
      <Subtitle line={NARRATION.feared} />
    </AbsoluteFill>
  );
};
