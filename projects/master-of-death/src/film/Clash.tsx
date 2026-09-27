import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {P} from '../paint/canvas';
import {C, FPS, H, W} from '../theme';
import {FaceOff} from './Duel';

// 01:03 — wands up; the curses leave the wands as living, spitting light —
// crackling filaments, sparks shearing off — and where they meet they do not
// merge: red and green shove against each other, the join lurching back and
// forth, spraying sparks, until his pushes through. Then white.
export const CLASH_FRAMES = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Y = 560;

// a jagged filament from a to b: offsets shake every frame, pinned at the ends
const bolt = (a: P, b: P, amp: number, seed: number, n = 22): string => {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const off = (hash(seed * 31 + i * 7.3) - 0.5) * 2 * amp * Math.sin(Math.PI * u);
    d += `${i ? 'L' : 'M'}${a[0] + dx * u + nx * off},${a[1] + dy * u + ny * off}`;
  }
  return d;
};

const Beam: React.FC<{a: P; b: P; color: string; hot: string; frame: number; seed: number}> = ({a, b, color, hot, frame, seed}) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const flick = 0.8 + 0.2 * hash(frame * 3 + seed);
  return (
    <g>
      <path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={color} strokeWidth={60 * flick} opacity={0.22} strokeLinecap="round" filter="url(#blur-24)" />
      {[0, 1, 2].map((k) => (
        <path key={k} d={bolt(a, b, 10 + 12 * k, frame * 5 + seed * 13 + k * 101)} stroke={color} strokeWidth={4 - k} fill="none" opacity={0.9 - 0.2 * k} filter="url(#blur-1.5)" strokeLinejoin="round" />
      ))}
      <path d={bolt(a, b, 3, frame * 7 + seed)} stroke={hot} strokeWidth={5 * flick} fill="none" strokeLinecap="round" filter="url(#blur-1.5)" />
      {/* sparks shearing off along its length */}
      {Array.from({length: 34}, (_, i) => {
        const born = frame - Math.floor(hash(i + seed * 50) * 8);
        const age = frame - born;
        const r = (k: number) => hash(born * 17.7 + i * 3.1 + k + seed * 9);
        const u = r(1);
        const side = r(2) > 0.5 ? 1 : -1;
        const v = 6 + 14 * r(3);
        const x = a[0] + dx * u + nx * side * v * age + (dx / len) * 4 * age;
        const y = a[1] + dy * u + ny * side * v * age + 0.9 * age * age;
        const tail = 3 + v * 0.6;
        return <line key={i} x1={x} y1={y} x2={x - nx * side * tail} y2={y - ny * side * tail} stroke={r(4) > 0.5 ? hot : color} strokeWidth={2.2} opacity={1 - age / 8} strokeLinecap="round" />;
      })}
    </g>
  );
};

// where the two meet: tongues of each colour thrust into the other, a ragged
// seam that jitters, crackling arcs, and a spray of sparks up and down
const Struggle: React.FC<{m: P; frame: number; push: number}> = ({m, frame, push}) => {
  const tongue = (side: -1 | 1, color: string, hot: string) =>
    Array.from({length: 6}, (_, i) => {
      const r = (k: number) => hash(frame * 11 + i * 5.7 + k + (side > 0 ? 77 : 0));
      const L = (50 + 70 * r(1)) * (side > 0 ? 1 + 0.6 * push : 1 - 0.4 * push);
      const w = 16 + 26 * r(2);
      const a = (r(3) - 0.5) * 1.1;
      const tip: P = [m[0] - side * 10, m[1]];
      const bx = m[0] + side * L * Math.cos(a), by = m[1] + L * Math.sin(a) * 0.6;
      const pts: P[] = [[bx, by - w], [tip[0] - side * 8 * r(4), tip[1] + (r(5) - 0.5) * 30], [bx, by + w]];
      return (
        <path key={`${side}-${i}`} d={`M${pts[0][0]},${pts[0][1]} Q${pts[1][0]},${pts[1][1] - w * 0.6} ${pts[1][0]},${pts[1][1]} Q${pts[1][0]},${pts[1][1] + w * 0.6} ${pts[2][0]},${pts[2][1]}Z`} fill={i % 2 ? hot : color} opacity={0.55} filter="url(#blur-3)" />
      );
    });
  return (
    <g>
      <ellipse cx={m[0]} cy={m[1]} rx={150} ry={90} fill="#f6e8d8" opacity={0.18} filter="url(#blur-24)" />
      {tongue(-1, C.spellGreen, '#c9ffe0')}
      {tongue(1, C.spellRed, '#ffd2b8')}
      {/* crackling arcs thrown off the seam */}
      {Array.from({length: 9}, (_, i) => {
        const r = (k: number) => hash(Math.floor(frame / 2) * 13 + i * 9.1 + k);
        const ang = r(1) * Math.PI * 2, L = 50 + 120 * r(2);
        const end: P = [m[0] + Math.cos(ang) * L, m[1] + Math.sin(ang) * L * 0.8];
        const col = r(3) < 0.4 ? C.spellGreen : r(3) < 0.8 ? C.spellRed : '#fff6e0';
        return <path key={i} d={bolt(m, end, 14, frame * 3 + i * 41, 8)} stroke={col} strokeWidth={2.4} fill="none" opacity={0.9} filter="url(#blur-1.5)" />;
      })}
      {/* sparks sprayed up and down out of the seam, falling */}
      {Array.from({length: 70}, (_, i) => {
        const born = frame - Math.floor(hash(i * 1.3) * 12);
        const age = frame - born;
        const r = (k: number) => hash(born * 23.3 + i * 4.7 + k);
        const ang = (r(1) > 0.5 ? -1 : 1) * (Math.PI / 2) + (r(2) - 0.5) * 1.6;
        const v = 8 + 18 * r(3);
        const x = m[0] + Math.cos(ang) * v * age;
        const y = m[1] + Math.sin(ang) * v * age + 1.1 * age * age;
        const vx = Math.cos(ang) * v, vy = Math.sin(ang) * v + 2.2 * age;
        const col = r(4) < 0.35 ? '#c9ffe0' : r(4) < 0.7 ? '#ffd2b8' : '#fff8e6';
        return <line key={i} x1={x} y1={y} x2={x - vx * 0.7} y2={y - vy * 0.7} stroke={col} strokeWidth={2.4} opacity={1 - age / 12} strokeLinecap="round" />;
      })}
      {/* the seam itself: a small ragged star, never a round ball */}
      <path
        d={Array.from({length: 14}, (_, i) => {
          const a = (i / 14) * Math.PI * 2, rr = (i % 2 ? 8 : 22 + 18 * hash(frame * 7 + i)) * 1.1;
          return `${i ? 'L' : 'M'}${m[0] + Math.cos(a) * rr * 0.7},${m[1] + Math.sin(a) * rr}`;
        }).join(' ') + 'Z'}
        fill="#fffaf0"
        opacity={0.9}
        filter="url(#blur-1.5)"
      />
    </g>
  );
};

export const Clash: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const raise = interpolate(s, [0, 0.45], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const reach = interpolate(s, [0.5, 0.8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  // the join lurches back and forth; at the end his (red) drives it home
  const push = interpolate(s, [1.75, 2.15], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const mx = 960 + 46 * Math.sin(s * 4.1) + 18 * Math.sin(s * 11.3) - 300 * push;
  const flash = interpolate(s, [2.05, 2.45], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const vTip: P = [400 + 38 * 3.5, 830 - 52 * 3.5];
  const hTip: P = [1520 - (32 + 14) * 3.3, 830 - (78 + 8) * 3.3];
  const green: P = [vTip[0] + (mx - vTip[0]) * reach, vTip[1] + (Y - vTip[1]) * reach];
  const red: P = [hTip[0] + (mx - hTip[0]) * reach, hTip[1] + (Y - hTip[1]) * reach];
  return (
    <AbsoluteFill>
      <FaceOff frame={frame + 60} raise={raise} />
      <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'screen'}}>
        {/* the light they throw on the snow */}
        {reach > 0 && <ellipse cx={mx} cy={820} rx={520} ry={70} fill="#ffe9d0" opacity={0.12 * reach} filter="url(#blur-24)" />}
        {reach > 0 && <Beam a={vTip} b={green} color={C.spellGreen} hot="#d8ffe8" frame={frame} seed={1} />}
        {reach > 0 && <Beam a={hTip} b={red} color={C.spellRed} hot="#ffe0cc" frame={frame} seed={2} />}
        {reach >= 1 && <Struggle m={[mx, Y]} frame={frame} push={push} />}
      </svg>
      {flash > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at ${(mx / W) * 100}% 52%, #ffffff ${flash * 60}%, rgba(246,247,249,${flash}) ${20 + flash * 80}%)`}} />}
    </AbsoluteFill>
  );
};
