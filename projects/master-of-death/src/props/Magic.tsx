import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// The Golden Snitch: a bright gold ball, fine engraving, two thin silver
// wings. `flap` is the wing angle phase; `open` 0..1 lifts the upper half
// like a lid to show what it holds (children, drawn inside).
export const Snitch: React.FC<{r?: number; flap?: number; open?: number; id?: string; children?: React.ReactNode}> = ({
  r = 40, flap = 0, open = 0, id = 'sn', children,
}) => {
  const wingAngle = 18 + 42 * Math.sin(flap);
  const wing = (side: 1 | -1) => {
    const pts: Pt[] = [[0, 0], [side * r * 1.2, -r * 0.9], [side * r * 2.8, -r * 1.25], [side * r * 3.4, -r * 0.8], [side * r * 3.0, -r * 0.35], [side * r * 2.2, -r * 0.2], [side * r * 1.2, r * 0.1]];
    return (
      <g transform={`translate(${side * r * 0.85} ${-r * 0.1}) rotate(${-side * wingAngle})`}>
        <path d={smooth(pts, true, 0.35)} fill="#f3efe4" opacity={0.82} />
        <path d={smooth(pts, true, 0.35)} fill={`url(#${id}-wing)`} opacity={0.6} />
        {[0.5, 0.7, 0.9].map((u, i) => (
          <path key={i} d={`M0,0 Q${side * r * 1.6 * u * 1.6},${-r * 0.9 * u} ${side * r * 3.1 * u},${-r * (0.5 + 0.5 * u)}`} fill="none" stroke="#c9b27a" strokeWidth={r * 0.03} opacity={0.7} />
        ))}
      </g>
    );
  };
  const lid = open * 70;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-gold`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor={C.snitchHot} />
          <stop offset="0.35" stopColor={C.snitch} />
          <stop offset="0.8" stopColor="#b8860b" />
          <stop offset="1" stopColor="#6e4a08" />
        </radialGradient>
        <linearGradient id={`${id}-wing`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9c6dc" />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={C.snitch} stopOpacity="0.55" />
          <stop offset="1" stopColor={C.snitch} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={r * 3} fill={`url(#${id}-halo)`} />
      {wing(-1)}
      {wing(1)}
      {/* lower half + whatever sits inside, then the lid swinging up */}
      <path d={`M${-r},0 A${r},${r} 0 0 0 ${r},0 Z`} fill={`url(#${id}-gold)`} />
      {open > 0 && <g>{children}</g>}
      <g transform={`translate(${-r} 0) rotate(${-lid}) translate(${r} 0)`}>
        <path d={`M${-r},0 A${r},${r} 0 0 1 ${r},0 Z`} fill={`url(#${id}-gold)`} />
        <path d={`M${-r * 0.7},${-r * 0.1} Q0,${-r * 0.55} ${r * 0.7},${-r * 0.1}`} fill="none" stroke="#8a6512" strokeWidth={r * 0.04} opacity={0.8} />
        <path d={`M${-r * 0.35},${-r * 0.85} Q${-r * 0.1},${-r * 0.4} ${-r * 0.4},${-r * 0.05}`} fill="none" stroke="#8a6512" strokeWidth={r * 0.035} opacity={0.6} />
        <ellipse cx={-r * 0.35} cy={-r * 0.55} rx={r * 0.22} ry={r * 0.12} fill="#fffbe6" opacity={0.85} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.55})`} />
      </g>
      <line x1={-r} y1={0} x2={r} y2={0} stroke="#7a5a10" strokeWidth={r * 0.05} />
    </g>
  );
};

// The Resurrection Stone: a small black stone, cracked, the Hallows sign cut
// into its face. When `glow` rises, warm light seeps from the sign and cracks.
export const ResurrectionStone: React.FC<{r?: number; glow?: number; id?: string}> = ({r = 30, glow = 0, id = 'rs'}) => {
  const body: Pt[] = [[-r * 0.95, r * 0.1], [-r * 0.8, -r * 0.55], [-r * 0.2, -r * 0.9], [r * 0.55, -r * 0.75], [r * 0.95, -r * 0.2], [r * 0.85, r * 0.45], [r * 0.3, r * 0.8], [-r * 0.5, r * 0.72]];
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-aura`}>
          <stop offset="0" stopColor={C.stoneGlow} stopOpacity={0.75 * glow} />
          <stop offset="0.4" stopColor={C.stoneGlow} stopOpacity={0.25 * glow} />
          <stop offset="1" stopColor={C.stoneGlow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-body`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#4a4a52" />
          <stop offset="0.6" stopColor="#1c1c22" />
          <stop offset="1" stopColor="#0a0a0d" />
        </radialGradient>
      </defs>
      {glow > 0 && <circle r={r * 5} fill={`url(#${id}-aura)`} />}
      <path d={smooth(body, true, 0.3)} fill={`url(#${id}-body)`} />
      <path d={smooth([[-r * 0.6, -r * 0.5], [-r * 0.1, -r * 0.8], [r * 0.4, -r * 0.65], [0, -r * 0.45]], true, 0.3)} fill="#8c8c96" opacity={0.35} />
      {/* the sign: triangle, circle, line — and a crack running through it */}
      <g stroke={glow > 0 ? '#ffd9a0' : '#5a5a64'} strokeWidth={r * 0.06} fill="none" opacity={0.55 + 0.45 * glow} filter={glow > 0 ? 'url(#glow-s)' : undefined}>
        <path d={`M0,${-r * 0.5} L${r * 0.46},${r * 0.35} L${-r * 0.46},${r * 0.35} Z`} />
        <circle cx={0} cy={r * 0.07} r={r * 0.25} />
        <line x1={0} y1={-r * 0.5} x2={0} y2={r * 0.35} />
      </g>
      <path d={`M${r * 0.7},${-r * 0.5} L${r * 0.35},${-r * 0.1} L${r * 0.5},${r * 0.2} L${r * 0.2},${r * 0.6}`} fill="none" stroke={glow > 0 ? C.stoneGlow : '#050507'} strokeWidth={r * 0.05} opacity={0.4 + 0.6 * glow} />
    </g>
  );
};
