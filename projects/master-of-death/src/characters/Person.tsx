import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// A standing person, front-on, lit by a cold key light from upper left.
// Origin at the feet, 100 units tall × k px. Everyone on Harry's pan is
// built from this, so they read as one family of solid, living people.
export type PersonSpec = {
  h?: number;         // height factor
  build?: number;     // width factor
  coat: string;       // outer layer
  coatLen?: number;   // 0 jacket at hip … 1 robe to the ankle
  under?: string;     // shirt / jumper showing at the open front
  legs?: string;
  skin?: string;
  hair: {color: string; back?: Pt[]; front: Pt[]};
  beard?: {color: string; pts: Pt[]};
  glasses?: 'round' | 'halfmoon';
  eyes?: string;
  scarf?: [string, string];
  scars?: boolean;
};

const INK = '#07080b';
const S = (pts: Pt[], k: number, tension = 0.35) => smooth(pts.map(([x, y]) => [x * k, y * k] as Pt), true, tension);

// `reach` 0..1 brings both hands up to the throat.
export const Person: React.FC<{spec: PersonSpec; k?: number; id: string; opacity?: number; rim?: string; reach?: number}> = ({spec, k: k0 = 3, id, opacity = 1, rim = '#c7d2e6', reach = 0}) => {
  const {h = 1, build = 1, coat, coatLen = 0.4, under = '#2a2f3a', legs = '#1c212b', skin = '#dcc0aa', hair, beard, glasses, eyes = '#2a2622', scarf, scars} = spec;
  const k = k0 * h;
  const bw = build;
  const hem = -46 + (1 - coatLen) * 0 - coatLen * 40; // y of the coat's hem
  const shade = `${id}-shade`;
  const coatD = S([
    [-11 * bw, -79], [-4, -81.5], [4, -81.5], [11 * bw, -79], [13 * bw, -70], [12.5 * bw, -56], [13 * bw + coatLen * 4, hem],
    [2, hem + 1], [0, -56], [-2, hem + 1], [-13 * bw - coatLen * 4, hem], [-12.5 * bw, -56], [-13 * bw, -70],
  ], k, 0.25);
  const legsD = S([[-8 * bw, hem + 2], [-7.6 * bw, 0], [-1.5, 0], [-0.8, -30], [0.8, -30], [1.5, 0], [7.6 * bw, 0], [8 * bw, hem + 2]], k, 0.15);
  // arms: shoulder → elbow → hand; the hands travel from the hips to the throat
  const hand = (sx: number): Pt => [sx * (14.2 * bw + (3.6 - 14.2 * bw) * reach), -44.5 + (-79.5 + 44.5) * reach];
  const elbow = (sx: number): Pt => [sx * (15 * bw + 3 * reach), -60 + 4 * reach];
  const arm = (sx: number) => [[sx * 11.5 * bw, -77.5], elbow(sx), hand(sx)] as Pt[];
  const face = S([[0, -100], [6.3, -98], [7.6, -92], [6.8, -86], [4.4, -82], [0, -80.8], [-4.4, -82], [-6.8, -86], [-7.6, -92], [-6.3, -98]], k, 0.45);
  return (
    <g opacity={opacity}>
      <defs>
        {/* key light from upper left: every form turns darker toward the right */}
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.15" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {hair.back && <path d={S(hair.back, k)} fill={hair.color} />}
      <path d={legsD} fill={legs} />
      <path d={legsD} fill={`url(#${shade})`} />
      <path d={S([[-8 * bw, -1.5], [-1.2, -1.5], [-1.2, 0.8], [-8.6 * bw, 0.8]], k, 0.2)} fill="#0b0c0f" />
      <path d={S([[1.2, -1.5], [8 * bw, -1.5], [8.6 * bw, 0.8], [1.2, 0.8]], k, 0.2)} fill="#0b0c0f" />
      {[-1, 1].map((sx) => (
        <path key={sx} d={smooth(arm(sx).map(([x, y]) => [x * k, y * k] as Pt), false)} fill="none" stroke={coat} strokeWidth={5.2 * k * bw} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <path d={smooth(arm(1).map(([x, y]) => [x * k, y * k] as Pt), false)} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={5.2 * k * bw} strokeLinecap="round" />
      <path d={coatD} fill={coat} />
      {/* open front shows what's underneath */}
      <path d={S([[-3, -80], [3, -80], [2, hem + 2], [-2, hem + 2]], k, 0.2)} fill={under} opacity={0.9} />
      <path d={coatD} fill={`url(#${shade})`} />
      {/* rim of key light along the left edge */}
      <path d={S([[-11 * bw, -79], [-13 * bw, -70], [-12.5 * bw, -56], [-13 * bw - coatLen * 4, hem], [-12 * bw - coatLen * 4, hem], [-11.6 * bw, -56], [-12 * bw, -70], [-10.4 * bw, -78.5]], k, 0.3)} fill={rim} opacity={0.5} />

      {/* neck + head */}
      <path d={S([[-2.6, -82], [2.6, -82], [2.8, -78.5], [-2.8, -78.5]], k, 0.2)} fill={skin} />
      <path d={S([[-2.6, -82], [2.6, -82], [2.8, -78.5], [-2.8, -78.5]], k, 0.2)} fill="#000" opacity={0.3} />
      <path d={face} fill={skin} />
      <path d={face} fill={`url(#${shade})`} />
      <path d={S([[-7.4, -94], [-6.4, -86], [-4.6, -82.6], [-6, -85], [-7, -90]], k)} fill="#fff" opacity={0.18} />
      {/* features */}
      <path d={`M${-4.6 * k},${-93.6 * k} L${-1.4 * k},${-94 * k} M${1.4 * k},${-94 * k} L${4.6 * k},${-93.6 * k}`} stroke={hair.color} strokeWidth={0.7 * k} strokeLinecap="round" />
      {[-2.9, 2.9].map((x) => (
        <g key={x}>
          <ellipse cx={x * k} cy={-91.6 * k} rx={1.3 * k} ry={0.75 * k} fill="#ece7df" />
          <circle cx={x * k} cy={-91.6 * k} r={0.6 * k} fill={eyes} />
        </g>
      ))}
      <path d={`M${0},${-91 * k} L${0.8 * k},${-87.3 * k} L${-0.6 * k},${-86.8 * k}`} fill="none" stroke="#6b4f44" strokeWidth={0.45 * k} opacity={0.8} />
      <path d={`M${-1.9 * k},${-84.4 * k} Q0,${-83.7 * k} ${1.9 * k},${-84.4 * k}`} fill="none" stroke="#7a4f48" strokeWidth={0.55 * k} />
      {scars && <path d={`M${-4.6 * k},${-90 * k} L${-1.6 * k},${-86.5 * k} M${2.6 * k},${-96.5 * k} L${5 * k},${-93 * k}`} stroke="#9b7468" strokeWidth={0.35 * k} />}
      {beard && <path d={S(beard.pts, k)} fill={beard.color} />}
      <path d={S(hair.front, k)} fill={hair.color} />
      {/* glasses catch the light */}
      {glasses === 'round' && (
        <g fill="none" stroke="#0c0c0e" strokeWidth={0.45 * k}>
          <circle cx={-2.9 * k} cy={-91.6 * k} r={1.95 * k} />
          <circle cx={2.9 * k} cy={-91.6 * k} r={1.95 * k} />
          <path d={`M${-0.95 * k},${-91.8 * k} Q0,${-92.5 * k} ${0.95 * k},${-91.8 * k}`} />
          <path d={`M${-4.2 * k},${-93 * k} A${1.95 * k},${1.95 * k} 0 0 1 ${-2.2 * k},${-93.5 * k}`} stroke="#eef2f8" strokeWidth={0.35 * k} />
        </g>
      )}
      {glasses === 'halfmoon' && (
        <g fill="none" stroke="#b9a36a" strokeWidth={0.4 * k}>
          <path d={`M${-4.8 * k},${-91 * k} A${1.9 * k},${1.9 * k} 0 0 0 ${-1 * k},${-91 * k} Z`} />
          <path d={`M${1 * k},${-91 * k} A${1.9 * k},${1.9 * k} 0 0 0 ${4.8 * k},${-91 * k} Z`} />
        </g>
      )}
      {/* scarf: house colours, the brightest thing on each of them */}
      {scarf && (
        <g>
          <path d={S([[-5, -82.5], [5, -82.5], [5.5, -78], [-5.5, -78]], k, 0.2)} fill={scarf[0]} />
          <path d={S([[1.5, -79], [4.8, -79], [5.5, -62], [2.3, -62]], k, 0.2)} fill={scarf[0]} />
          {[-73, -69, -65].map((y) => (
            <line key={y} x1={2 * k} y1={y * k} x2={5.2 * k} y2={y * k} stroke={scarf[1]} strokeWidth={0.9 * k} />
          ))}
          <path d={S([[1.5, -79], [4.8, -79], [5.5, -62], [2.3, -62]], k, 0.2)} fill="#000" opacity={0.25} />
        </g>
      )}
      {[-1, 1].map((sx) => (
        <g key={sx}>
          <ellipse cx={hand(sx)[0] * k} cy={hand(sx)[1] * k} rx={1.8 * k} ry={2.4 * k} fill={skin} />
          {sx > 0 && <ellipse cx={hand(sx)[0] * k} cy={hand(sx)[1] * k} rx={1.8 * k} ry={2.4 * k} fill="#000" opacity={0.3} />}
        </g>
      ))}
    </g>
  );
};

// ——— the people on Harry's pan ————————————————————————————————————————
const messy: Pt[] = [[-8.6, -89], [-9.6, -94], [-8, -99.5], [-4, -103], [0, -104], [4.5, -103], [8.6, -99.5], [9.6, -94], [8.6, -89], [7.2, -93], [5, -95.8], [3.5, -93], [1.5, -95.8], [-0.5, -93.2], [-2.5, -96], [-4.5, -93], [-6.5, -95.2], [-7.5, -91]];
const parted = (depth = 96.5): Pt[] => [[-7.6, -91], [-7.2, -98.5], [-3.6, -102], [0, -100.6], [3.6, -102], [7.2, -98.5], [7.6, -91], [5.6, -95.8], [1.2, -98], [-1.2, -98], [-5.6, -depth + 0.7]];

export const PEOPLE: Record<string, PersonSpec> = {
  harry: {
    h: 0.97, coat: '#1f2636', under: '#3a3f4a', legs: '#26324a', coatLen: 0.25, skin: '#dcbfa8',
    hair: {color: '#0d0c0e', front: messy}, glasses: 'round', eyes: C.harryGreen, scarf: [C.gryffRed, C.gryffGold],
  },
  lily: {
    h: 0.92, build: 0.9, coat: '#2e3a3a', under: '#51606a', legs: '#2a2d36', coatLen: 0.75, skin: '#e3c8b5', eyes: C.harryGreen,
    hair: {
      color: '#7a2418',
      back: [[-8.5, -86], [-9.4, -95], [-7, -101], [0, -103.5], [7, -101], [9.4, -95], [8.8, -86], [9.8, -76], [10.4, -68], [6.4, -69], [6.4, -80], [-6.4, -80], [-6.4, -69], [-10.4, -68], [-9.8, -76]],
      front: parted(),
    },
  },
  james: {
    h: 1.02, coat: '#2a2a33', under: '#6d5a44', legs: '#23262e', coatLen: 0.35, skin: '#d8b9a0',
    hair: {color: '#0f0d0e', front: messy}, glasses: 'round', eyes: '#4a3a2a',
  },
  cedric: {
    h: 1.05, coat: '#23252c', under: '#3c3f46', legs: '#22252c', coatLen: 0.3, skin: '#dcbfa6', eyes: '#3b2e22',
    hair: {color: '#5a3d26', front: [[-7.8, -91], [-7.6, -99], [-3, -103], [3, -103], [7.6, -99], [7.8, -91], [6.2, -96], [2, -97.6], [-3, -97], [-6.4, -94.5]]},
    scarf: ['#c9a227', '#141414'],
  },
  sirius: {
    h: 1.04, build: 0.95, coat: '#1d1b20', under: '#4d4640', legs: '#1b1c20', coatLen: 0.85, skin: '#cfb4a0', eyes: '#2a2a30',
    hair: {
      color: '#121014',
      back: [[-8.4, -86], [-9.3, -95], [-7, -101], [0, -103], [7, -101], [9.3, -95], [8.6, -86], [9.6, -78], [7, -77], [6.6, -86], [-6.6, -86], [-7, -77], [-9.6, -78]],
      front: parted(),
    },
    beard: {color: '#1a1719', pts: [[-6.2, -87], [-4.5, -82.6], [0, -80.9], [4.5, -82.6], [6.2, -87], [4, -84.8], [0, -83.2], [-4, -84.8]]},
  },
  dumbledore: {
    h: 1.12, build: 0.95, coat: '#3a2d44', under: '#5a4a62', legs: '#2a2230', coatLen: 1, skin: '#dcc3b1', eyes: '#3e5f86',
    hair: {
      color: '#d7d9de',
      back: [[-8.4, -88], [-9, -96], [-6.5, -101.5], [0, -103.5], [6.5, -101.5], [9, -96], [8.6, -88], [10, -74], [10.6, -62], [6, -64], [6.4, -84], [-6.4, -84], [-6, -64], [-10.6, -62], [-10, -74]],
      front: [[-7.6, -93], [-6.6, -99.5], [-2, -102.5], [2, -102.5], [6.6, -99.5], [7.6, -93], [5.4, -97.6], [0, -99.4], [-5.4, -97.6]],
    },
    beard: {color: '#dfe1e6', pts: [[-6.6, -88], [-5, -82], [-3.6, -70], [-1.4, -56], [0, -52], [1.4, -56], [3.6, -70], [5, -82], [6.6, -88], [4, -85.6], [0, -84.2], [-4, -85.6]]},
    glasses: 'halfmoon',
  },
  lupin: {
    h: 1.0, build: 0.94, coat: '#4a3c2f', under: '#6b5d4a', legs: '#2f2b28', coatLen: 0.6, skin: '#d4b8a2', eyes: '#5a4a32', scars: true,
    hair: {color: '#6d5b47', front: [[-7.8, -90], [-7.8, -99], [-3.4, -102.6], [3.4, -102.6], [7.8, -99], [7.8, -90], [6, -96], [-1, -98.2], [-6.2, -96.5]]},
  },
  tonks: {
    h: 0.93, build: 0.92, coat: '#2a2130', under: '#3b3444', legs: '#231d2a', coatLen: 0.2, skin: '#e1c4b1', eyes: '#4a3a4a',
    hair: {color: '#d9508f', front: [[-8.4, -90], [-9.8, -96], [-7.2, -100], [-8, -103], [-3.6, -102], [-2, -105.5], [1, -102], [4, -105], [5.4, -101.2], [9, -102], [8.2, -97.6], [9.8, -93], [8.2, -90], [6.4, -95.4], [3.4, -94], [0.6, -96], [-2.6, -94.2], [-5.6, -95.8]]},
  },
};
