import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {PEOPLE, Person} from '../characters/Person';
import {Dabs} from '../fx/Dabs';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {C, FPS, H, W} from '../theme';
import {ramp} from '../util';

// 00:17–00:21. Harry's side. The people he loves stand with him on the pan;
// one by one they are simply gone. Each time, the pan lifts a little — he
// gets lighter, lonelier — and Voldemort's pan sinks away below.
export const HARRYS_PAN_FRAMES = 120;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// order from the script: Lily, James, Cedric, Sirius, Dumbledore, Lupin, Tonks
const CAST: {who: keyof typeof PEOPLE; x: number; y: number; k: number}[] = [
  {who: 'lily', x: 700, y: 935, k: 4.4},
  {who: 'james', x: 1230, y: 935, k: 4.4},
  {who: 'cedric', x: 450, y: 935, k: 4.4},
  {who: 'sirius', x: 1350, y: 880, k: 4.0},
  {who: 'dumbledore', x: 570, y: 880, k: 4.0},
  {who: 'lupin', x: 1590, y: 880, k: 4.0},
  {who: 'tonks', x: 1470, y: 935, k: 4.4},
];
const FIRST = 0.5;
const STEP = 0.55;

export const HarrysPan: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const gone = (i: number) => interpolate(s, [FIRST + i * STEP, FIRST + i * STEP + 0.32], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  // the pan climbs one notch after each departure
  const rise = CAST.reduce((acc, _, i) => acc + interpolate(s, [FIRST + i * STEP + 0.2, FIRST + i * STEP + 0.55], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}), 0);
  const drop = rise * 95; // everything far away sinks as we rise
  const z = interpolate(s, [0, 5], [1, 1.28], {...clamp, easing: Easing.inOut(Easing.quad)});
  const cx = 960, cy = interpolate(s, [0, 5], [600, 690], clamp);
  const camT = `translate(${W / 2 - cx * z} ${H / 2 - cy * z}) scale(${z})`;
  const skyAt = (u: number, v: number) => ramp([[0, '#151b28'], [0.5, '#34405a'], [0.85, '#4f5770'], [1, '#5b5566']], Math.min(1, v + drop / 2400));
  const rimY = 945;
  const hookY = -700;
  const people = CAST.map((c, i) => ({...c, i})).sort((a, b) => a.y - b.y);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Filters />
      <Painted
        renderKey={`hp-${frame}`}
        under={
          <g transform={camT}>
            <defs>
              <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#10151f" />
                <stop offset="0.6" stopColor="#303a52" />
                <stop offset="1" stopColor="#4a4c60" />
              </linearGradient>
              <radialGradient id="hp-top" cx="0.5" cy="0" r="0.7">
                <stop offset="0" stopColor="#a9b8d4" stopOpacity="0.45" />
                <stop offset="1" stopColor="#a9b8d4" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="hp-rim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.brass} />
                <stop offset="0.4" stopColor="#5a4630" />
                <stop offset="1" stopColor="#15110d" />
              </linearGradient>
            </defs>
            <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#hp-sky)" />
            <Dabs x={-200} y={-200} w={W + 400} h={H + 300} count={2400} colorAt={skyAt} size={[10, 50]} aspect={4.2} angle={-6} angleJitter={12} opacity={[0.18, 0.42]} soften={3} seed="hp-sky" jitter={0.2} jitterColor="#0d1119" />
            <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#hp-top)" />

            {/* far below: Voldemort's pan and its mountain, sinking as we climb */}
            <g transform={`translate(0 ${drop}) translate(420 690) scale(0.7) translate(-420 -690)`} opacity={0.6}>
              <path d="M300,690 Q420,470 540,690Z" fill="#0f1218" />
              <path d="M300,690 Q420,470 540,690" fill="none" stroke="#9aa6bf" strokeWidth={1.5} opacity={0.4} />
              <path d="M410,520 L416,486 L424,520Z" fill="#07080b" />
              <ellipse cx={420} cy={690} rx={150} ry={12} fill="#16140f" stroke={C.brass} strokeWidth={1.5} opacity={0.9} />
              {[-1, 0, 1].map((k) => (
                <line key={k} x1={420 + k * 140} y1={690} x2={430} y2={-900} stroke="#141619" strokeWidth={2} />
              ))}
            </g>

            {/* our pan's chains */}
            {[-1, 1].map((k) => (
              <g key={k}>
                <line x1={960 + k * 1020} y1={rimY - 10} x2={960} y2={hookY} stroke="#0e0f13" strokeWidth={14} />
                <line x1={960 + k * 1020} y1={rimY - 10} x2={960} y2={hookY} stroke={C.brass} strokeWidth={5} strokeDasharray="16 10" opacity={0.5} />
              </g>
            ))}
            {/* the pan's floor, a dark bronze disc seen from just above */}
            <ellipse cx={960} cy={rimY - 40} rx={1000} ry={120} fill="#1b1712" />
            <ellipse cx={960} cy={rimY - 40} rx={1000} ry={120} fill="url(#hp-top)" opacity={0.4} />

            {people.map((p) => (
              <g key={p.who} transform={`translate(${p.x} ${p.y})`}>
                <ellipse cx={0} cy={0} rx={p.k * 11} ry={p.k * 2} fill="#000" opacity={0.35 * (1 - gone(p.i))} filter="url(#blur-3)" />
                <Person spec={PEOPLE[p.who]} k={p.k} id={p.who} opacity={1 - gone(p.i)} />
              </g>
            ))}
            <g transform="translate(960 948)">
              <ellipse cx={0} cy={0} rx={50} ry={9} fill="#000" opacity={0.35} filter="url(#blur-3)" />
              <Person spec={PEOPLE.harry} k={4.5} id="harry" />
            </g>

            {/* front lip of the pan */}
            <path d={`M-200,${rimY} Q960,${rimY + 150} ${W + 200},${rimY} L${W + 200},${H + 400} L-200,${H + 400}Z`} fill="url(#hp-rim)" filter="url(#paint)" />
            <path d={`M-200,${rimY} Q960,${rimY + 150} ${W + 200},${rimY}`} fill="none" stroke="#f0cf8f" strokeWidth={3} opacity={0.7} filter="url(#rough-m)" />
          </g>
        }
      />
      <Snow frame={frame} layer="far" count={160} seed="hp" wind={0.3} color="#d6dbe6" speed={1 + rise * 0.15} />
      <Snow frame={frame} layer="mid" count={40} seed="hp" wind={0.3} speed={1 + rise * 0.15} />
      <Surface grainSeed={frame} vignette={0.62} />
    </AbsoluteFill>
  );
};
