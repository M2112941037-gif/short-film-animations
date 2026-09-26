import React from 'react';
import {C} from '../theme';
import {capsule, Pt, smooth} from '../util';

const INK = '#050608';

// ——— Skull face, origin at the bridge of the nose. ~ 250 px tall at k=1.
// Two-tone graphic lighting: key light from upper left, right half in shade.
export const DeathSkull: React.FC<{k?: number; light?: number}> = ({k = 1, light = 1}) => {
  const s = (pts: Pt[]) => pts.map(([x, y]) => [x * k, y * k] as Pt);
  // right half top→chin, then the mirrored left half chin→top
  const half: Pt[] = [[0, -124], [58, -110], [86, -68], [92, -22], [86, 16], [82, 40], [60, 60], [50, 80], [44, 102], [26, 120], [0, 126]];
  const outline: Pt[] = [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y] as Pt)];
  const face = smooth(s(outline), true, 0.4);
  const eye = (sx: number) => smooth(s([[sx * 12, -8], [sx * 14, -20], [sx * 38, -34], [sx * 64, -30], [sx * 70, -12], [sx * 62, 8], [sx * 40, 16], [sx * 20, 10]]), true, 0.35);
  const nose = smooth(s([[0, 22], [9, 32], [12, 46], [5, 54], [0, 50], [-5, 54], [-12, 46], [-9, 32]]), true, 0.4);
  const hollow = (sx: number) => smooth(s([[sx * 84, 34], [sx * 60, 60], [sx * 50, 84], [sx * 56, 58], [sx * 70, 44]]), true, 0.3);
  return (
    <g>
      <defs>
        <linearGradient id="skullShade" x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0.38" stopColor="#141722" stopOpacity="0" />
          <stop offset="0.75" stopColor="#141722" stopOpacity="0.55" />
          <stop offset="1" stopColor="#141722" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="skullLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe9da" />
          <stop offset="0.6" stopColor="#b9b2a3" />
          <stop offset="1" stopColor="#5d5b5c" />
        </linearGradient>
      </defs>
      <g opacity={light}>
        <path d={face} fill="url(#skullLight)" stroke={INK} strokeWidth={3 * k} filter="url(#rough-s)" />
        <path d={face} fill="url(#skullShade)" />
        {[-1, 1].map((sx) => (
          <path key={`h${sx}`} d={hollow(sx)} fill="#0b0c10" opacity={0.75} filter="url(#rough-s)" />
        ))}
        {[-1, 1].map((sx) => (
          <path key={sx} d={eye(sx)} fill="#020203" filter="url(#rough-s)" />
        ))}
        <path d={nose} fill="#050507" filter="url(#rough-s)" />
        {/* teeth, upper and lower rows, set apart by a thin dark gap */}
        <path d={`M${-30 * k},${66 * k} Q0,${71 * k} ${30 * k},${66 * k} L${28 * k},${82 * k} Q0,${86 * k} ${-28 * k},${82 * k}Z`} fill="#a8a293" stroke={INK} strokeWidth={2 * k} />
        <path d={`M${-24 * k},${88 * k} Q0,${92 * k} ${24 * k},${88 * k} L${22 * k},${100 * k} Q0,${104 * k} ${-22 * k},${100 * k}Z`} fill="#8d887c" stroke={INK} strokeWidth={2 * k} />
        {[-20, -10, 0, 10, 20].map((x) => (
          <g key={x}>
            <line x1={x * k} y1={67 * k} x2={x * k * 0.96} y2={84 * k} stroke={INK} strokeWidth={1.5 * k} />
            {Math.abs(x) < 22 && <line x1={x * k * 0.9} y1={89 * k} x2={x * k * 0.86} y2={101 * k} stroke={INK} strokeWidth={1.3 * k} />}
          </g>
        ))}
        {/* key light along the left brow and cheekbone */}
        <path d={`M${-72 * k},${-34 * k} Q${-44 * k},${-50 * k} ${-16 * k},${-26 * k}`} fill="none" stroke="#fffaf0" strokeWidth={3.5 * k} opacity={0.7} strokeLinecap="round" />
        <path d={`M${-86 * k},${22 * k} Q${-70 * k},${30 * k} ${-58 * k},${24 * k}`} fill="none" stroke="#fffaf0" strokeWidth={3 * k} opacity={0.55} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ——— Skeletal hand. Origin at the wrist, pointing along +x.
// `curl` 0..1 closes the fingers; `spread` fans them.
export type HandPose = {curl?: number; spread?: number; thumb?: number};

const bone = (a: Pt, b: Pt, wa: number, wb: number, key: string, k: number) => (
  <g key={key}>
    <path d={capsule(a, b, wa * k, wb * k)} fill="url(#boneFill)" stroke={INK} strokeWidth={1.8 * k} />
    <circle cx={b[0]} cy={b[1]} r={wb * 1.25 * k} fill="url(#boneFill)" stroke={INK} strokeWidth={1.4 * k} />
  </g>
);

export const BoneHand: React.FC<{k?: number; forearm?: number} & HandPose> = ({k = 1, curl = 0.5, spread = 1, thumb = 0.5, forearm = 70}) => {
  const out: React.ReactNode[] = [];
  // metacarpals fan from the carpus; then three phalanges that bend by `curl`
  const fingers = [
    {base: [16, -9], dir: -16, lens: [46, 30, 20, 14], w: 4.2},
    {base: [18, -3], dir: -5, lens: [50, 33, 22, 15], w: 4.4},
    {base: [18, 3], dir: 6, lens: [48, 31, 21, 14], w: 4.2},
    {base: [16, 9], dir: 17, lens: [42, 26, 18, 12], w: 3.8},
  ] as const;
  fingers.forEach((f, fi) => {
    let p: Pt = [f.base[0] * k, f.base[1] * k];
    let ang = (f.dir * spread * Math.PI) / 180;
    f.lens.forEach((len, si) => {
      if (si > 0) ang += (curl * (38 + si * 10) * Math.PI) / 180;
      const q: Pt = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
      const w = f.w * (1 - si * 0.16);
      out.push(bone(p, q, w, w * 0.82, `f${fi}-${si}`, k));
      p = q;
    });
  });
  // thumb: shorter, opposes from the underside
  let p: Pt = [10 * k, 10 * k];
  let ang = ((52 - thumb * 20) * Math.PI) / 180;
  [30, 24, 16].forEach((len, si) => {
    if (si > 0) ang -= (thumb * 34 * Math.PI) / 180;
    const q: Pt = [p[0] + Math.cos(ang) * len * k, p[1] + Math.sin(ang) * len * k];
    out.push(bone(p, q, 4.6 - si * 0.6, 3.8 - si * 0.6, `t${si}`, k));
    p = q;
  });
  return (
    <g>
      <defs>
        <linearGradient id="boneFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece7da" />
          <stop offset="1" stopColor={C.boneShade} />
        </linearGradient>
      </defs>
      {/* radius + ulna */}
      {bone([-forearm * k, -7 * k], [2 * k, -5 * k], 5, 6, 'r', k)}
      {bone([-forearm * k, 7 * k], [2 * k, 6 * k], 4.5, 5.5, 'u', k)}
      {/* carpus */}
      <path d={smooth([[0, -12], [14, -14], [22, -4], [20, 10], [8, 14], [-2, 6]].map(([x, y]) => [x * k, y * k] as Pt))} fill="url(#boneFill)" stroke={INK} strokeWidth={1.8 * k} />
      {out}
    </g>
  );
};

// ——— Hooded upper body. Origin at the face centre; ~1500 px wide at k=1.
// The arm/hand is placed by the scene so it can hold things.
export const DeathBody: React.FC<{k?: number; rim?: string; faceLight?: number}> = ({k = 1, rim = C.dusk, faceLight = 1}) => {
  const s = (pts: Pt[]) => pts.map(([x, y]) => [x * k, y * k] as Pt);
  const robe = smooth(s([
    [8, -330], [70, -300], [160, -230], [225, -120], [250, 10], [262, 150], [320, 230], [470, 330], [640, 480], [760, 700], [820, 900],
    [-820, 900], [-760, 700], [-640, 480], [-470, 330], [-320, 230], [-262, 150], [-246, 10], [-222, -120], [-150, -236], [-60, -300],
  ]), true, 0.45);
  const opening = smooth(s([
    [0, -214], [62, -168], [104, -78], [118, 30], [106, 134], [66, 200], [0, 226], [-66, 200], [-106, 134], [-118, 30], [-104, -78], [-62, -168],
  ]), true, 0.45);
  const folds: Pt[][] = [
    [[-310, 250], [-352, 400], [-380, 560], [-452, 760], [-500, 900]],
    [[-190, 290], [-212, 420], [-200, 600], [-250, 900]],
    [[170, 280], [220, 470], [210, 640], [260, 900]],
    [[330, 260], [410, 430], [470, 640], [560, 900]],
    [[20, 300], [60, 520], [30, 900]],
  ];
  return (
    <g>
      <defs>
        <linearGradient id="robeFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2029" />
          <stop offset="0.35" stopColor="#10131a" />
          <stop offset="1" stopColor="#07080b" />
        </linearGradient>
        <radialGradient id="hoodDark" cx="0.46" cy="0.66" r="0.6">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0.98" />
        </radialGradient>
        <linearGradient id="hoodTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="1" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={robe} fill="url(#robeFill)" filter="url(#paint)" />
      {/* rim light on hood + shoulders */}
      <path d={robe} fill="none" stroke={rim} strokeWidth={3 * k} opacity={0.55} filter="url(#rough-m)" />
      {folds.map((f, i) => (
        <path key={i} d={smooth(s(f), false)} fill="none" stroke={rim} strokeWidth={[3, 1.6, 2.2, 3, 1.2][i] * k} opacity={[0.22, 0.12, 0.16, 0.2, 0.1][i]} filter="url(#rough-m)" />
      ))}
      <path d={opening} fill="#020304" />
      <g transform={`translate(0 ${24 * k})`}>
        <DeathSkull k={0.9 * k} light={faceLight} />
      </g>
      <path d={opening} fill="url(#hoodDark)" />
      <path d={opening} fill="url(#hoodTop)" />
      {/* the hood's thick lip: a lit edge on the key side, shadowed on the other */}
      <path d={smooth(s([[-6, -214], [-62, -168], [-104, -78], [-118, 30], [-106, 134]]), false)} fill="none" stroke={rim} strokeWidth={4 * k} opacity={0.6} filter="url(#rough-m)" />
      <path d={smooth(s([[-10, -236], [-86, -180], [-134, -80], [-148, 40], [-136, 150], [-96, 214]]), false)} fill="none" stroke={rim} strokeWidth={2 * k} opacity={0.25} filter="url(#rough-m)" />
    </g>
  );
};

// ——— Wide ragged sleeve from shoulder to wrist. Coordinates in scene space.
export const Sleeve: React.FC<{from: Pt; to: Pt; width?: number; drape?: number; rim?: string}> = ({
  from, to, width = 150, drape = 260, rim = C.dusk,
}) => {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const P = (t: number, o: number): Pt => [from[0] + dx * t + nx * o, from[1] + dy * t + ny * o];
  // upper edge runs along the arm; the cuff flares and hangs under gravity
  const cuffTop = P(1.02, -width * 0.32);
  const cuffBot = P(1.0, width * 0.45);
  const hangTip: Pt = [cuffBot[0] - 40, cuffBot[1] + drape];
  const pts: Pt[] = [
    P(0, -width * 0.6), P(0.5, -width * 0.42), cuffTop,
    [cuffTop[0] + 6, cuffTop[1] + width * 0.4],
    cuffBot,
    [cuffBot[0] - 8, cuffBot[1] + drape * 0.55],
    hangTip,
    [hangTip[0] - 50, hangTip[1] - drape * 0.18],
    [hangTip[0] - 80, hangTip[1] - drape * 0.05],
    [hangTip[0] - 150, hangTip[1] - drape * 0.35],
    P(0.35, width * 0.9),
    P(0, width * 0.6),
  ];
  return (
    <g>
      <path d={smooth(pts, true, 0.35)} fill="#0c0f14" filter="url(#paint)" />
      <path d={smooth(pts.slice(0, 4), false)} fill="none" stroke={rim} strokeWidth={3} opacity={0.5} filter="url(#rough-m)" />
      <path d={smooth([P(0.45, width * 0.1), P(0.8, width * 0.35), [cuffBot[0] - 30, cuffBot[1] + drape * 0.5]], false)} fill="none" stroke={rim} strokeWidth={2} opacity={0.25} filter="url(#rough-m)" />
      {/* dark inside of the cuff */}
      <ellipse cx={(cuffTop[0] + cuffBot[0]) / 2} cy={(cuffTop[1] + cuffBot[1]) / 2} rx={16} ry={width * 0.36} transform={`rotate(${(Math.atan2(dy, dx) * 180) / Math.PI} ${(cuffTop[0] + cuffBot[0]) / 2} ${(cuffTop[1] + cuffBot[1]) / 2})`} fill="#000" />
    </g>
  );
};

// ——— Just the mouth of a sleeve: dark opening and a lit rim, so a bone hand
// can emerge from the black robe without drawing the whole arm.
export const Cuff: React.FC<{at: Pt; angle?: number; r?: number; rim?: string}> = ({at, angle = 0, r = 46, rim = C.dusk}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`}>
    <path d={`M${-70},${-r * 0.95} Q${-10},${-r * 1.1} 0,${-r * 0.7} Q10,0 0,${r * 0.75} Q${-20},${r * 1.4} ${-90},${r * 2.2} L${-160},${r * 1.4} L${-150},${-r * 0.9}Z`} fill="#0c0f15" filter="url(#paint)" />
    <ellipse cx={-4} cy={0} rx={12} ry={r * 0.72} fill="#000" />
    <path d={`M${-60},${-r * 0.98} Q${-10},${-r * 1.08} 0,${-r * 0.7} Q9,0 1,${r * 0.6}`} fill="none" stroke={rim} strokeWidth={3} opacity={0.6} filter="url(#rough-m)" />
    <path d={`M${-8},${r * 0.8} Q${-24},${r * 1.4} ${-86},${r * 2.1}`} fill="none" stroke={rim} strokeWidth={2} opacity={0.25} filter="url(#rough-m)" />
  </g>
);
