import React from 'react';
import {Pt, smooth} from '../util';

const INK = '#07080b';

// One phalanx: flared at both joints, thin in the shaft. A `tip` bone
// narrows to a long hooked point — Death's fingertips.
const phalanx = (a: Pt, b: Pt, w: number, tip: boolean, hook = 0) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const ts = [0, 0.16, 0.45, 0.8, 1];
  const ws = tip ? [1.0, 0.72, 0.5, 0.26, 0.02] : [1.15, 0.7, 0.58, 0.72, 1.05];
  const bend = (t: number) => (tip ? hook * t * t * w * 2.2 : 0);
  const side = (s: 1 | -1) => ts.map((t, i) => [a[0] + dx * t + nx * (ws[i] * w * s + bend(t)), a[1] + dy * t + ny * (ws[i] * w * s + bend(t))] as Pt);
  const L = side(1), R = side(-1).reverse();
  const capA: Pt = [a[0] - ux * w * 0.9, a[1] - uy * w * 0.9];
  const capB: Pt = tip ? L[L.length - 1] : [b[0] + ux * w * 0.8, b[1] + uy * w * 0.8];
  return smooth(tip ? [capA, ...L.slice(0, -1), capB, ...R.slice(1)] : [capA, ...L, capB, ...R], true, 0.35);
};

export type HandPose = {curl?: number; spread?: number; thumb?: number; forearm?: number; hook?: number};

// Skeletal hand, origin at the wrist, pointing along +x.
// Long fingers, knuckles that read as joints, pointed hooked tips.
export const BoneHand: React.FC<{k?: number} & HandPose> = ({k = 1, curl = 0.5, spread = 1, thumb = 0.5, forearm = 20, hook = 0.6}) => {
  const bones: {d: string; key: string}[] = [];
  const knuckles: {p: Pt; r: number; key: string}[] = [];
  const fingers = [
    {base: [20, -11], dir: -15, lens: [56, 40, 28, 26], w: 4.4},
    {base: [22, -3.5], dir: -4, lens: [60, 44, 30, 28], w: 4.6},
    {base: [22, 4], dir: 7, lens: [57, 42, 29, 26], w: 4.4},
    {base: [19, 11], dir: 18, lens: [50, 34, 24, 22], w: 3.9},
  ];
  fingers.forEach((f, fi) => {
    let p: Pt = [f.base[0] * k, f.base[1] * k];
    let ang = (f.dir * spread * Math.PI) / 180;
    f.lens.forEach((len, si) => {
      if (si > 0) ang += (curl * (30 + si * 12) * Math.PI) / 180;
      const q: Pt = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
      const w = f.w * (1 - si * 0.13) * k;
      bones.push({d: phalanx(p, q, w, si === 3, hook), key: `f${fi}${si}`});
      if (si < 3) knuckles.push({p: q, r: w * 1.05, key: `k${fi}${si}`});
      p = q;
    });
  });
  let p: Pt = [12 * k, 12 * k];
  let ang = ((55 - thumb * 22) * Math.PI) / 180;
  [36, 28, 24].forEach((len, si) => {
    if (si > 0) ang -= (thumb * 30 * Math.PI) / 180;
    const q: Pt = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
    const w = (5 - si * 0.7) * k;
    bones.push({d: phalanx(p, q, w, si === 2, -hook), key: `t${si}`});
    if (si < 2) knuckles.push({p: q, r: w * 1.05, key: `tk${si}`});
    p = q;
  });
  const carpus = smooth([[-2, -14], [10, -17], [22, -12], [25, 0], [22, 13], [10, 17], [-2, 12], [-6, 0]].map(([x, y]) => [x * k, y * k] as Pt), true, 0.4);
  return (
    <g>
      <defs>
        <linearGradient id="boneFill2" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f3eee2" />
          <stop offset="0.55" stopColor="#c9c2b2" />
          <stop offset="1" stopColor="#6d685f" />
        </linearGradient>
        <radialGradient id="knuckle" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbf8f0" />
          <stop offset="0.6" stopColor="#bdb6a6" />
          <stop offset="1" stopColor="#5f5a52" />
        </radialGradient>
      </defs>
      {/* radius + ulna disappearing into the sleeve */}
      <path d={phalanx([-forearm * k, -8 * k], [0, -6 * k], 5.5 * k, false)} fill="url(#boneFill2)" stroke={INK} strokeWidth={1.6 * k} />
      <path d={phalanx([-forearm * k, 8 * k], [0, 7 * k], 4.8 * k, false)} fill="url(#boneFill2)" stroke={INK} strokeWidth={1.6 * k} />
      <path d={carpus} fill="url(#boneFill2)" stroke={INK} strokeWidth={1.6 * k} />
      {/* carpal cracks */}
      <path d={`M${6 * k},${-12 * k} L${9 * k},${10 * k} M${15 * k},${-14 * k} L${17 * k},${12 * k}`} stroke={INK} strokeWidth={1 * k} opacity={0.6} />
      {bones.map((b) => (
        <path key={b.key} d={b.d} fill="url(#boneFill2)" stroke={INK} strokeWidth={1.5 * k} />
      ))}
      {knuckles.map((n) => (
        <g key={n.key}>
          <ellipse cx={n.p[0]} cy={n.p[1]} rx={n.r * 1.0} ry={n.r * 0.88} fill="url(#knuckle)" stroke={INK} strokeWidth={1.2 * k} />
        </g>
      ))}
    </g>
  );
};
