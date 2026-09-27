import React from 'react';
import {useCurrentFrame} from 'remotion';
import {H, W} from '../theme';
import {Flake} from './Flake';

// The Part 2 → Part 3 transition: a drift of real snowflakes sweeps across
// the screen corner to corner (top-left → bottom-right), burying the old
// picture in white; the same drift keeps going and uncovers the new one
// behind it along the same diagonal. `p` 0 → 1 covers, 1 → 2 uncovers, so
// the two halves live at the end of one part and the start of the next.
const A = (38 * Math.PI) / 180;
const ax = Math.cos(A), ay = Math.sin(A);
const SPAN = W * ax + H * ay; // the diagonal's length across the frame
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const edgeAt = (q: number) => -260 + q * (SPAN + 520);

export const SnowWipe: React.FC<{p: number}> = ({p}) => {
  const covering = p <= 1;
  const e = edgeAt(covering ? p : p - 1);
  // covered side: behind the leading edge while covering, ahead of the
  // trailing edge while uncovering
  const o0 = Math.max(0, Math.min(1, (e - 90) / SPAN)), o1 = Math.max(0, Math.min(1, (e + 40) / SPAN));
  const stops = covering
    ? [[0, 1], [o0, 1], [o1, 0], [1, 0]]
    : [[0, 0], [o0, 0], [o1, 1], [1, 1]];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="snowwipe" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={SPAN * ax} y2={SPAN * ay}>
          {stops.map(([o, a], i) => <stop key={i} offset={o} stopColor="#eef2f8" stopOpacity={a} />)}
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#snowwipe)" />
      {/* flakes of every size riding the edge, tumbling as they go */}
      {Array.from({length: 150}, (_, i) => {
        const t = -1300 + hash(i) * 2400; // across the edge
        const lag = (hash(i + 400) - 0.6) * 260; // ahead of / behind it
        const d = e + lag + Math.sin(p * 6 + i) * 20;
        const x = d * ax - t * ay, y = d * ay + t * ax;
        if (x < -120 || x > W + 120 || y < -120 || y > H + 120) return null;
        const r = 8 + 52 * hash(i + 90) ** 2;
        const near = r > 40;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={0.75 + 0.25 * hash(i + 7)}>
            <Flake r={r} rot={i * 37 + p * 160 * (hash(i + 3) - 0.5)} soft={near} />
          </g>
        );
      })}
    </svg>
  );
};

// inside a <Sequence>: runs the wipe from `from` to `to` over `len` frames
export const SnowWipeRun: React.FC<{from: number; to: number; len: number}> = ({from, to, len}) => {
  const f = useCurrentFrame();
  return <SnowWipe p={from + ((to - from) * Math.min(f, len)) / len} />;
};
