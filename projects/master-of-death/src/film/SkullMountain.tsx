import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {PanCrowd} from '../characters/Figures';
import {Riddle} from '../characters/Voldemort';
import {Dabs} from '../fx/Dabs';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {Skull, SkullPile} from '../props/Skulls';
import {NARRATION} from '../text';
import {C, FPS, H, W} from '../theme';
import {ramp} from '../util';
import {Subtitle} from '../ui/Subtitle';

// 00:07–00:17. Voldemort's pan, low angle. One skull falls. Another. Another.
// Then they pour down, the pile rises, and the boy standing on it becomes
// the man, then the thing. The far pan with Harry lifts as the balance tips.
export const SKULL_FRAMES = 240;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PEAK: [number, number] = [760, 400];
const BASE_Y = 960;

// `hold` freezes the story at that frame (pile, age, tilt) while wind and
// snow keep moving; `cam` overrides the framing.
// How much of the pile exists at shot time s (seconds) — shared with the
// balance cutaway so both show the same mountain.
export const skullGrowth = (s: number) => interpolate(s, [2.2, 8.2], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

// `collapse` 0..1 (00:52): the pile shakes, a skull or two turns to snow,
// then all of it does and blows away; he falls back down to his pan.
export const SkullMountain: React.FC<{frame: number; hold?: number; cam?: {z: number; cx: number; cy: number}; subs?: boolean; flutter?: number; expr?: 'none' | 'shock' | 'smirk'; collapse?: number}> = ({frame, hold, cam, subs = true, flutter = 0.35, expr = 'none', collapse = 0}) => {
  const s = (hold ?? frame) / FPS;
  const g = skullGrowth(s);
  const age = 3 * interpolate(g, [0.08, 0.95], [0, 1], clamp);
  const top = PEAK[1] + (1 - g) * (BASE_Y - PEAK[1]);
  const fall = interpolate(collapse, [0.45, 0.8], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const feetY = top + 52 * g + 18 * (1 - g) + fall * (BASE_Y - 30 - top - 52 * g);
  const quake = collapse > 0 && collapse < 0.6 ? Math.sin(frame * 2.1) * 7 * (1 - collapse / 0.6) : 0;
  // camera starts low and close on the boy, then opens up as the pile climbs
  const open = interpolate(s, [1.8, 8.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const z = cam?.z ?? 1.55 + (1 - 1.55) * open;
  const cx = cam?.cx ?? 760 + (960 - 760) * open;
  const cy = cam?.cy ?? 780 + (540 - 780) * open;
  const camT = `translate(${W / 2 - cx * z} ${H / 2 - cy * z}) scale(${z})`;
  // the far pan rises as the beam tips toward Voldemort
  const tip = interpolate(s, [6.0, 9.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hp: [number, number] = [1640, 640 - 400 * tip];
  // and Voldemort's own pan sinks under the weight, a little with every skull
  const sink = 60 * g + 70 * tip;

  // the first three skulls, alone, each landing with a thud
  const heroes = [
    {t: 0.55, x: 560, k: 0.55, rot: 25},
    {t: 1.25, x: 910, k: 0.5, rot: -35},
    {t: 1.85, x: 520, k: 0.58, rot: 60},
  ];

  const skyAt = (u: number, v: number) => {
    const glow = Math.hypot((u - 0.4) * 1.2, v - 0.42);
    const base = ramp([[0, '#1b2230'], [0.45, '#3c4760'], [0.75, '#5a5566'], [1, '#6b4b54']], v);
    return ramp([[0, '#9aa5bd'], [0.25, base], [1, base]], glow);
  };
  const hook: [number, number] = [790, -520];
  const rimL: [number, number] = [-120, 930];
  const rimR: [number, number] = [1700, 930];

  const line = s > 3.4 && s < 6.0 ? NARRATION.feared : s > 6.4 && s < 9.6 ? NARRATION.conquer : null;
  const lineOp = line === NARRATION.feared
    ? interpolate(s, [3.4, 3.8, 5.6, 6.0], [0, 1, 1, 0], clamp)
    : interpolate(s, [6.4, 6.8, 9.2, 9.6], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Filters />
      <Painted
        renderKey={`skull-${frame}`}
        under={
          <g transform={camT}>
            <defs>
              <linearGradient id="sm-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#141a25" />
                <stop offset="0.55" stopColor="#3a4459" />
                <stop offset="0.85" stopColor="#56505e" />
                <stop offset="1" stopColor="#5e4450" />
              </linearGradient>
              <radialGradient id="sm-glow" cx="0.4" cy="0.36" r="0.35">
                <stop offset="0" stopColor="#b5bfd3" stopOpacity="0.75" />
                <stop offset="1" stopColor="#b5bfd3" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sm-rim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.brass} />
                <stop offset="0.4" stopColor="#5a4630" />
                <stop offset="1" stopColor="#15110d" />
              </linearGradient>
            </defs>
            <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#sm-sky)" />
            <rect width={W} height={H} fill="url(#sm-glow)" />
            <Dabs x={-60} y={-60} w={W + 120} h={H * 0.9} count={2600} colorAt={skyAt} size={[10, 50]} aspect={4.2} angle={-8} angleJitter={14} opacity={[0.18, 0.45]} soften={3} seed="sf2-sky" jitter={0.2} jitterColor="#0d1119" />

            {/* the far pan with Harry, climbing as the balance tips */}
            <g opacity={0.9}>
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={hp[0] + k * 70} y1={hp[1]} x2={hp[0] + 6} y2={-400} stroke="#1b1d22" strokeWidth={2} />
              ))}
              {[-1, 1].map((k) => (
                <line key={`l${k}`} x1={hp[0] + k * 70} y1={hp[1]} x2={hp[0] + 6} y2={-400} stroke={C.brass} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
              ))}
              <path d={`M${hp[0] - 74},${hp[1]} Q${hp[0]},${hp[1] + 40} ${hp[0] + 74},${hp[1]}Z`} fill="#16181d" />
              <ellipse cx={hp[0]} cy={hp[1]} rx={74} ry={8} fill="#1a1b1f" stroke={C.brass} strokeWidth={1.5} />
              <g transform={`translate(${hp[0]} ${hp[1]})`}>
                <PanCrowd k={1.15} rim="#b9c2d4" />
              </g>
            </g>

            {[rimL, rimR].map((p, i) => (
              <g key={i}>
                <line x1={p[0]} y1={p[1] + sink} x2={hook[0]} y2={hook[1]} stroke="#0e0f13" strokeWidth={14} />
                <line x1={p[0]} y1={p[1] + sink} x2={hook[0]} y2={hook[1]} stroke={C.brass} strokeWidth={5} strokeDasharray="16 10" opacity={0.55} />
              </g>
            ))}

            <g transform={`translate(0 ${sink})`}>
            {/* the first skulls: falling, then lying where they landed */}
            {heroes.map((h, i) => {
              const dt = s - h.t;
              if (dt < -0.6) return null;
              const fall = Math.min(1, Math.max(0, (dt + 0.6) / 0.6));
              const y = BASE_Y - 30 - (1 - fall * fall) * 1100;
              const landed = dt >= 0;
              return (
                <g key={i}>
                  {!landed && <line x1={h.x} y1={y - 30} x2={h.x} y2={y - 260} stroke="#cfd5e0" strokeWidth={h.k * 60} opacity={0.16} strokeLinecap="round" filter="url(#blur-6)" />}
                  {landed && dt < 0.5 && <ellipse cx={h.x} cy={BASE_Y - 10} rx={60 + dt * 160} ry={14 + dt * 30} fill="#cfd6e2" opacity={0.35 * (1 - dt / 0.5)} filter="url(#blur-6)" />}
                  <Skull x={h.x} y={y} k={h.k} rot={h.rot * fall} fill="#9ea2ac" rim={C.snow} rimAmt={0.8} />
                </g>
              );
            })}

            <g transform={`translate(${quake} ${quake * 0.3})`}><SkullPile px={PEAK[0]} py={PEAK[1]} baseY={BASE_Y} spread={820} count={420} seed="sf2" rim="#dfe4ee" top="#6a7080" bottom="#12151c" kTop={0.3} kBottom={1.05} growth={g} fallBand={0.06} melt={collapse} /></g>

            <g transform={`translate(${PEAK[0] + 6} ${feetY})`}>
              <g transform="scale(1 1.08)"><Riddle k={1} rim="#e3e8f2" wind={1} age={age} t={frame / FPS} flutter={flutter} expr={expr} /></g>
            </g>

            {/* front lip of the giant pan */}
            <path d={`M-200,${rimL[1] + 10} Q${W / 2},${rimL[1] + 170} ${W + 200},${rimR[1] + 10} L${W + 200},${H + 400} L-200,${H + 400}Z`} fill="url(#sm-rim)" filter="url(#paint)" />
            <path d={`M-200,${rimL[1] + 10} Q${W / 2},${rimL[1] + 170} ${W + 200},${rimR[1] + 10}`} fill="none" stroke="#f0cf8f" strokeWidth={3} opacity={0.7} filter="url(#rough-m)" />
            </g>
          </g>
        }
      />
      <Snow frame={frame} layer="far" count={220} seed="sf2" wind={0.8} color="#d6dbe6" />
      <Snow frame={frame} layer="mid" count={60} seed="sf2" wind={0.8} />
      <Snow frame={frame} layer="near" count={8} seed="sf2" wind={0.8} opacity={0.55} />
      <Surface grainSeed={frame} vignette={0.6} />
      {subs && line && <Subtitle line={line} opacity={lineOp} />}
    </AbsoluteFill>
  );
};
