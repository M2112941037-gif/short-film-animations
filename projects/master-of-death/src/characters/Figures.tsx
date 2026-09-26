import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// Large silhouettes for the foreground, lit only from the side that faces
// the light. Rim light = the shape in the light colour, covered by the same
// shape in shadow, nudged away from the light; what peeks out is the rim.
// Units: feet at 0, ~100 tall; `k` = px per unit. Both are drawn facing +x.

const S = (pts: Pt[], k: number) => smooth(pts.map(([x, y]) => [x * k, y * k] as Pt), true, 0.35);

type Lit = {k?: number; rim?: string; rimW?: number; body?: string};

const Rimmed: React.FC<{d: string; rim: string; body: string; off: number; blur?: boolean}> = ({d, rim, body, off, blur = true}) => (
  <g>
    {/* soft spill first, then the thin hard rim */}
    <path d={d} fill={rim} opacity={0.3} transform={`translate(${off * 1.8} ${-off * 0.3})`} filter="url(#blur-3)" />
    <path d={d} fill={rim} transform={`translate(${off} ${-off * 0.2})`} filter={blur ? 'url(#blur-1.5)' : undefined} />
    <path d={d} fill={body} />
  </g>
);

export const HarrySilhouette: React.FC<Lit & {eye?: number}> = ({k = 5, rim = '#dfe6f4', rimW = 1, body = '#0a0c11', eye = 1}) => {
  const off = 0.55 * k * rimW;
  const bodyD = S([
    [11, 0], [3, 0], [2.5, -36], [-0.5, -36], [-2, 0], [-10, 0], [-9.5, -20], [-9.5, -40], [-12, -42], [-14, -44], [-15, -50],
    [-14.5, -62], [-13.5, -72], [-11.5, -78], [-6, -81.5], [-2.5, -83], [-2, -85.5], [3.5, -86], [4.5, -82.5], [9, -80.5], [12, -76.5],
    [13, -66], [14, -55], [14.5, -46], [12.5, -44], [11, -42], [6.5, -40], [5.5, -22], [7.5, -4],
  ], k);
  const head = S([[-6.5, -91.5], [-5, -97.5], [0, -100.5], [5.5, -98], [7.8, -95], [8.4, -92.6], [9.8, -89.8], [8.5, -88.9], [8.8, -87.6], [7.8, -85.2], [4, -83.8], [0, -84.6], [-4.5, -87.5]], k);
  // untidy, not spiky: soft clumps, a fringe hanging over the brow
  const hair = S([
    [-5, -86.5], [-7.8, -88.6], [-8.2, -91.2], [-9.4, -92.8], [-8.4, -95.4], [-9, -97.8], [-6.6, -99.6], [-5.4, -101.8], [-2.4, -101.6],
    [-0.6, -103], [2.2, -101.8], [4.6, -102.2], [5.8, -100.4], [8.2, -99.8], [8.4, -97.8], [9.8, -96.6], [8.6, -95.6], [8.9, -94.2],
    [7.2, -94.6], [6.4, -93.4], [5.4, -94.8], [3.6, -94.4], [2, -95.6], [0, -94.6], [-2.2, -92.8], [-3.8, -90],
  ], k);
  return (
    <g>
      <Rimmed d={bodyD} rim={rim} body={body} off={off} />
      <Rimmed d={head} rim={rim} body={body} off={off} />
      <Rimmed d={hair} rim={rim} body="#06070a" off={off} />
      {/* Gryffindor scarf: the warm note, lit on the inner side */}
      <path d={S([[-3, -85.5], [4.8, -86.2], [5.6, -81.2], [-3, -80.4]], k)} fill="#7d141a" />
      <path d={S([[3, -83], [6.2, -83], [7.4, -66], [3.6, -66]], k)} fill="#7d141a" />
      <path d={S([[4.6, -85.5], [5.6, -81.2], [6.4, -83], [7.4, -66], [6.4, -66], [5.4, -80]], k)} fill={C.gryffRed} />
      {[-72, -69].map((y) => (
        <line key={y} x1={3.8 * k} y1={y * k} x2={7.1 * k} y2={y * k} stroke={C.gryffGold} strokeWidth={0.9 * k} />
      ))}
      <path d={S([[3.6, -66], [7.4, -66], [7.6, -64], [3.4, -64]], k)} fill={C.gryffGold} opacity={0.8} />
      {/* round glasses catching the light, and the green eye behind them */}
      <line x1={1.5 * k} y1={-91.8 * k} x2={7 * k} y2={-92 * k} stroke={rim} strokeWidth={0.4 * k} opacity={0.7} />
      <ellipse cx={8.1 * k} cy={-91.5 * k} rx={1.2 * k} ry={2.1 * k} fill="none" stroke="#f4f6fb" strokeWidth={0.45 * k} />
      <g filter="url(#glow-s)" opacity={eye}>
        <ellipse cx={7.7 * k} cy={-91.4 * k} rx={0.55 * k} ry={0.5 * k} fill={C.harryGreen} />
      </g>
    </g>
  );
};

export const VoldemortSilhouette: React.FC<Lit & {eye?: number}> = ({k = 5, rim = '#dfe6f4', rimW = 1, body = '#07080b', eye = 1}) => {
  const off = 0.55 * k * rimW;
  // robe streams back (−x), away from the light
  const robe = S([
    [-1.5, -94], [-8.5, -92.5], [-11.5, -80], [-13.5, -62], [-17, -46], [-26, -36], [-40, -24], [-52, -16], [-40, -13], [-48, -6],
    [-30, -3], [-14, 0], [0, 1], [14, 0], [11, -30], [9.5, -58], [11, -80], [8.5, -92], [2.5, -95],
  ], k);
  const sleeve = S([[5, -90], [12, -82], [16, -72], [21, -64], [19, -60], [13, -64], [8, -72], [4, -82]], k);
  const head = S([[-5, -101], [-4.8, -106.5], [-1, -110.5], [3.8, -109.6], [6.8, -106], [8.2, -102], [8.6, -99.2], [8.3, -97.4], [7.6, -96], [6, -94.2], [2, -93.6], [-1.5, -95], [-4, -97.5]], k);
  const collar = S([[-3, -95], [-6, -99], [-3, -94], [2, -92], [6, -93.5], [8, -97], [7, -93], [3, -91]], k);
  return (
    <g>
      <Rimmed d={robe} rim={rim} body={body} off={off} />
      <Rimmed d={sleeve} rim={rim} body={body} off={off} />
      {/* chalk-white head: lit side glows, the rest sinks to grey */}
      <g transform={`translate(${1 * k} ${-94 * k}) scale(0.8) translate(${-1 * k} ${94 * k})`}>
      <defs>
        <linearGradient id="vHead" x1="1" y1="0" x2="0" y2="0.2">
          <stop offset="0" stopColor={rim} />
          <stop offset="0.12" stopColor="#b4bcc2" />
          <stop offset="0.45" stopColor="#4a5158" />
          <stop offset="1" stopColor="#101317" />
        </linearGradient>
      </defs>
      <path d={head} fill="url(#vHead)" />
      {/* long pale fingers and the yew wand */}
      <path d={S([[19.5, -63.5], [23.5, -62], [26, -60], [23, -59.4], [20, -60]], k)} fill="#dfe3e6" />
      <line x1={23 * k} y1={-60.8 * k} x2={38 * k} y2={-52 * k} stroke="#2a1d16" strokeWidth={0.9 * k} strokeLinecap="round" />
      <line x1={23 * k} y1={-61.2 * k} x2={38 * k} y2={-52.4 * k} stroke={rim} strokeWidth={0.3 * k} opacity={0.6} strokeLinecap="round" />
      {/* slit nostril, lipless mouth, red eye */}
      <line x1={8.1 * k} y1={-99.4 * k} x2={7.5 * k} y2={-98.4 * k} stroke="#1a1d22" strokeWidth={0.35 * k} />
      <line x1={7.8 * k} y1={-96.3 * k} x2={5.8 * k} y2={-96.5 * k} stroke="#2a2e34" strokeWidth={0.3 * k} />
      <path d={S([[3.5, -103.6], [8, -103.2], [7.8, -102.2], [3.5, -102.4]], k)} fill="#8a939c" opacity={0.7} />
      <g filter="url(#glow-s)" opacity={eye}>
        <ellipse cx={6.2 * k} cy={-101.4 * k} rx={0.95 * k} ry={0.4 * k} fill="#ff2a2a" />
      </g>
      </g>
      <path d={collar} fill={body} />
    </g>
  );
};

// Tiny figures on the hand-held balance: just shapes, enough to say
// "two people" — tall robed one, and one with a mop of hair.
export const MiniSilhouette: React.FC<{who: 'harry' | 'voldemort'; k?: number; color?: string; rim?: string}> = ({who, k = 1, color = '#050608', rim = '#9aa7c2'}) => {
  const d =
    who === 'voldemort'
      ? S([[-3, -52], [-2, -49], [-4.5, -46], [-6, -30], [-9, 0], [9, 0], [6, -30], [4.5, -46], [2, -49], [3, -52], [0, -55]], k)
      : S([[-4.5, -44], [-3, -48], [0, -49.5], [3.5, -48], [4.5, -44], [2.5, -40.5], [5.5, -38], [5.5, -22], [4, -22], [3.5, 0], [0.8, 0], [0, -18], [-0.8, 0], [-3.5, 0], [-4, -22], [-5.5, -22], [-5.5, -38], [-2.5, -40.5]], k);
  return (
    <g>
      <path d={d} fill={rim} filter="url(#blur-1.5)" opacity={0.7} />
      <path d={d} fill={color} transform={`scale(0.94) translate(0 ${-1 * k})`} />
    </g>
  );
};
