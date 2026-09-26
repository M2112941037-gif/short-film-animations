import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// Tiny full-figure silhouettes for the balance pans. Origin at the feet,
// ~90 px tall at k=1. Recognised by shape and one colour accent each.

const sc = (pts: Pt[], k: number) => pts.map(([x, y]) => [x * k, y * k] as Pt);

export const HarryMini: React.FC<{k?: number; rim?: string; facing?: 1 | -1}> = ({k = 1, rim = C.grey, facing = -1}) => {
  const body = smooth(sc([
    [-7, 0], [-6, -30], [-9, -44], [-11, -62], [-6, -68], [6, -68], [11, -62], [9, -44], [6, -30], [7, 0], [2, 0], [0, -28], [-2, 0],
  ], k), true, 0.3);
  const hair = smooth(sc([[-9, -80], [-10, -88], [-6, -93], [-1, -95], [5, -94], [10, -90], [10, -82], [7, -86], [3, -84], [-2, -87], [-5, -83]], k), true, 0.4);
  return (
    <g transform={`scale(${facing * -1} 1)`}>
      <path d={body} fill="#0d1016" />
      <path d={body} fill="none" stroke={rim} strokeWidth={1.2 * k} opacity={0.6} />
      {/* arms */}
      <path d={smooth(sc([[-10, -62], [-13, -46], [-12, -34]], k), false)} stroke="#0d1016" strokeWidth={4.5 * k} fill="none" strokeLinecap="round" />
      <path d={smooth(sc([[10, -62], [13, -46], [12, -34]], k), false)} stroke="#0d1016" strokeWidth={4.5 * k} fill="none" strokeLinecap="round" />
      {/* head */}
      <ellipse cx={0} cy={-80 * k} rx={7.5 * k} ry={9 * k} fill="#c9a88f" />
      <ellipse cx={-2 * k} cy={-78 * k} rx={7.5 * k} ry={9 * k} fill="#6b5448" opacity={0.5} />
      <path d={hair} fill="#0a0a0c" />
      {/* glasses glint */}
      <circle cx={-3.5 * k} cy={-80 * k} r={2.4 * k} fill="none" stroke="#f1f3f5" strokeWidth={0.9 * k} opacity={0.9} />
      <circle cx={3 * k} cy={-80 * k} r={2.4 * k} fill="none" stroke="#f1f3f5" strokeWidth={0.9 * k} opacity={0.9} />
      {/* Gryffindor scarf — the one warm note */}
      <path d={`M${-8 * k},${-69 * k} Q0,${-64 * k} ${8 * k},${-69 * k} L${8 * k},${-65 * k} Q0,${-60 * k} ${-8 * k},${-65 * k}Z`} fill={C.gryffRed} />
      <path d={`M${3 * k},${-65 * k} L${6 * k},${-46 * k} L${1 * k},${-46 * k} L${0},${-64 * k}Z`} fill={C.gryffRed} />
      <line x1={1.5 * k} y1={-55 * k} x2={5.6 * k} y2={-55 * k} stroke={C.gryffGold} strokeWidth={1.3 * k} />
      <line x1={1 * k} y1={-50 * k} x2={5.8 * k} y2={-50 * k} stroke={C.gryffGold} strokeWidth={1.3 * k} />
    </g>
  );
};

export const VoldemortMini: React.FC<{k?: number; rim?: string; facing?: 1 | -1}> = ({k = 1, rim = C.grey, facing = 1}) => {
  const robe = smooth(sc([
    [-17, 0], [-12, -30], [-9, -60], [-11, -76], [-6, -82], [6, -82], [11, -76], [9, -60], [11, -30], [20, 0], [8, 3], [-4, 2],
  ], k), true, 0.35);
  return (
    <g transform={`scale(${facing} 1)`}>
      <path d={robe} fill="#07080b" />
      <path d={robe} fill="none" stroke={rim} strokeWidth={1.1 * k} opacity={0.5} />
      {/* wand arm, raised slightly forward */}
      <path d={smooth(sc([[8, -76], [15, -64], [22, -58]], k), false)} stroke="#07080b" strokeWidth={4 * k} fill="none" strokeLinecap="round" />
      <circle cx={23 * k} cy={-57.5 * k} r={1.8 * k} fill="#d9dde0" />
      <line x1={24 * k} y1={-58 * k} x2={34 * k} y2={-64 * k} stroke="#2a1d17" strokeWidth={1.3 * k} strokeLinecap="round" />
      {/* bald, chalk-white head */}
      <path d={smooth(sc([[0, -103], [6, -100], [7, -92], [5, -85], [0, -83], [-5, -85], [-7, -92], [-6, -100]], k))} fill="#d7dcdf" />
      <path d={smooth(sc([[-7, -94], [-5, -85], [0, -83], [-2, -92]], k))} fill="#7e8790" opacity={0.6} />
      <circle cx={3 * k} cy={-93 * k} r={1.1 * k} fill="#e0242a" />
      <circle cx={-1.5 * k} cy={-93 * k} r={1.1 * k} fill="#e0242a" />
    </g>
  );
};
