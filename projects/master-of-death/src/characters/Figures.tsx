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
    {/* a weak rim on the far side too, so the light wraps instead of stopping */}
    <path d={d} fill={rim} opacity={0.4} transform={`translate(${-off * 0.7} ${-off * 0.25})`} filter="url(#blur-1.5)" />
    {/* soft spill first, then the thin hard rim */}
    <path d={d} fill={rim} opacity={0.3} transform={`translate(${off * 1.8} ${-off * 0.3})`} filter="url(#blur-3)" />
    <path d={d} fill={rim} transform={`translate(${off} ${-off * 0.2})`} filter={blur ? 'url(#blur-1.5)' : undefined} />
    <path d={d} fill={body} />
  </g>
);

// `wand` 0..1 raises his arm forward with the wand, for the duel.
export const HarrySilhouette: React.FC<Lit & {eye?: number; wand?: number}> = ({k = 5, rim = '#dfe6f4', rimW = 1, body = '#0a0c11', eye = 1, wand = 0}) => {
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
      {wand > 0 && (
        <g>
          <Rimmed d={S([[6, -80], [12 + 10 * wand, -78 - 4 * wand], [18 + 12 * wand, -74 - 6 * wand], [18 + 12 * wand, -70 - 6 * wand], [12 + 6 * wand, -72], [6, -73]], k)} rim={rim} body={body} off={off} />
          <line x1={(18 + 12 * wand) * k} y1={(-72 - 6 * wand) * k} x2={(32 + 14 * wand) * k} y2={(-78 - 8 * wand) * k} stroke="#2a1d16" strokeWidth={0.9 * k} strokeLinecap="round" />
        </g>
      )}
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

// Harry's pan seen from far away: Harry with the seven around him, as tiny
// shapes with one identifying colour each. `others` 0..1 fades the seven.
// Units: feet at 0, Harry ≈ 50 tall × k.
const CROWD: {x: number; h: number; hair?: string; accent?: string; back?: boolean; beard?: boolean}[] = [
  {x: -17, h: 49, accent: '#c9a227'},            // Cedric, Hufflepuff scarf
  {x: -11, h: 56, hair: '#d7d9de', beard: true, back: true}, // Dumbledore
  {x: -6, h: 45, hair: '#8a2a1c'},               // Lily
  {x: 6, h: 50},                                 // James
  {x: 11, h: 51, back: true},                    // Sirius
  {x: 15.5, h: 49, back: true},                  // Lupin
  {x: 19.5, h: 45, hair: '#d9508f'},             // Tonks
];

export const PanCrowd: React.FC<{k?: number; others?: number; color?: string; rim?: string}> = ({k = 1, others = 1, color = '#07080b', rim = '#9aa7c2'}) => {
  const fig = (x: number, h: number, hair?: string, accent?: string, beard?: boolean, key?: string) => (
    <g key={key} transform={`translate(${x * k} 0)`}>
      <path d={smooth([[-3.6, -h + 11], [3.6, -h + 11], [4.2, -h * 0.45], [3, 0], [0.8, 0], [0, -h * 0.35], [-0.8, 0], [-3, 0], [-4.2, -h * 0.45]].map(([a, b]) => [a * k, b * k] as Pt), true, 0.3)} fill={color} />
      <circle cx={0} cy={(-h + 6) * k} r={4.2 * k} fill={color} />
      <path d={`M${-3.8 * k},${(-h + 6) * k} A${4.2 * k},${4.2 * k} 0 0 1 ${3.8 * k},${(-h + 6) * k}`} fill="none" stroke={rim} strokeWidth={0.8 * k} opacity={0.6} />
      {hair && <path d={`M${-4.4 * k},${(-h + 7) * k} A${4.4 * k},${4.6 * k} 0 0 1 ${4.4 * k},${(-h + 7) * k} L${4.6 * k},${(-h + 12) * k} L${-4.6 * k},${(-h + 12) * k}Z`} fill={hair} />}
      {beard && <path d={`M${-2.4 * k},${(-h + 8) * k} L${2.4 * k},${(-h + 8) * k} L0,${(-h + 20) * k}Z`} fill={hair} />}
      {accent && <rect x={-3 * k} y={(-h + 11) * k} width={6 * k} height={1.6 * k} fill={accent} />}
    </g>
  );
  return (
    <g>
      <g opacity={others}>
        {CROWD.filter((c) => c.back).map((c, i) => fig(c.x, c.h, c.hair, c.accent, c.beard, `b${i}`))}
        {CROWD.filter((c) => !c.back).map((c, i) => fig(c.x, c.h, c.hair, c.accent, c.beard, `f${i}`))}
      </g>
      {fig(0, 49, undefined, '#b8352c', false, 'harry')}
    </g>
  );
};

// Death far off: a tall, narrow hooded robe, the hem and a few torn strands
// trailing in the wind. `front` shows the empty hood (no face, ever).
// Origin at the feet; 100 × k px.
export const DeathFar: React.FC<{k?: number; t?: number; rim?: string; front?: boolean}> = ({k = 1, t = 0, rim = '#9aa8c4', front = false}) => {
  const sw = Math.sin(t * Math.PI * 1.5);
  const hem = Array.from({length: 9}, (_, i) => {
    const u = i / 8;
    return [(16 - 32 * u + 3 * sw + 4 * (1 - u)) * k, (-1 + 2.2 * Math.sin(u * 9 + t * 5)) * k] as [number, number];
  });
  const body = `M0,${-100 * k} C${6 * k},${-99 * k} ${8 * k},${-93 * k} ${9 * k},${-88 * k} C${13 * k},${-85 * k} ${13 * k},${-78 * k} ${13 * k},${-70 * k} C${15 * k},${-50 * k} ${18 * k + 2 * sw * k},${-20 * k} ${hem[0][0]},${hem[0][1]} ${hem
    .slice(1)
    .map(([x, y]) => `L${x},${y}`)
    .join(' ')} C${-15 * k},${-22 * k} ${-13 * k},${-50 * k} ${-12 * k},${-70 * k} C${-12 * k},${-78 * k} ${-12 * k},${-85 * k} ${-8 * k},${-88 * k} C${-7 * k},${-93 * k} ${-5 * k},${-99 * k} 0,${-100 * k}Z`;
  return (
    <g transform={`rotate(${1.2 * sw} 0 0)`}>
      <path d={body} fill="#07080b" />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${(14 - i * 2) * k},${(-60 + i * 14) * k} q${(10 + 3 * Math.sin(t * 4 + i)) * k},${(3 + 2 * Math.sin(t * 3 + i)) * k} ${(22 + 4 * Math.sin(t * 5 + i * 2)) * k},${(1 + 3 * Math.sin(t * 6 + i)) * k}`}
          stroke="#07080b"
          strokeWidth={(2.4 - i * 0.4) * k}
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />
      ))}
      <path d={`M${-8 * k},${-88 * k} C${-12 * k},${-84 * k} ${-12 * k},${-76 * k} ${-12 * k},${-70 * k} C${-13 * k},${-50 * k} ${-15 * k},${-22 * k} ${-16 * k},${-4 * k}`} stroke={rim} strokeWidth={0.9 * k} fill="none" opacity={0.35} />
      {front && (
        <g>
          <ellipse cx={0} cy={-89 * k} rx={5.2 * k} ry={7.4 * k} fill="#2a3040" opacity={0.7} />
          <ellipse cx={0.3 * k} cy={-88.4 * k} rx={4.2 * k} ry={6.4 * k} fill="#000" />
        </g>
      )}
    </g>
  );
};
