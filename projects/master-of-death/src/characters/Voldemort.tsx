import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

const INK = '#040507';
const SKIN = '#d8dde0';
const SKIN_SHADE = '#7f8a95';

const sc = (pts: Pt[], k: number, dx = 0, dy = 0) => pts.map(([x, y]) => [x * k + dx, y * k + dy] as Pt);

// Final, snake-like Voldemort, full figure. Origin at the feet, ~300 px at k=1.
// `wind` 0..1 streams the robe to the right.
export const VoldemortTall: React.FC<{k?: number; rim?: string; wind?: number; eyeGlow?: number}> = ({
  k = 1, rim = C.grey, wind = 1, eyeGlow = 1,
}) => {
  const w = wind;
  const robe = smooth(sc([
    [-20, -236], [-30, -200], [-38, -150], [-46, -96], [-60, -40], [-74, 0], [-40, 6], [-6, 2], [30, 6], [70, -6],
    [110 + 30 * w, -22 - 6 * w], [150 + 50 * w, -48 - 10 * w], [118 + 40 * w, -58], [170 + 50 * w, -96 - 8 * w], [120 + 30 * w, -104],
    [140 + 30 * w, -140], [80 + 10 * w, -138], [46, -176], [30, -214], [22, -236],
  ], k), true, 0.35);
  const inner = smooth(sc([[-8, -220], [-16, -160], [-22, -80], [-30, -10], [6, -20], [2, -100], [8, -180]], k), true, 0.4);
  // arm holding the wand, slightly out from the body and angled down
  const armL = smooth(sc([[-24, -226], [-50, -196], [-72, -160], [-86, -132], [-74, -126], [-58, -156], [-34, -186]], k), true, 0.3);
  const armR = smooth(sc([[22, -226], [44, -196], [62, -166], [76, -144], [64, -138], [46, -164], [28, -190]], k), true, 0.3);
  const head = smooth(sc([[0, -300], [15, -294], [20, -276], [17, -258], [10, -246], [0, -242], [-10, -246], [-17, -258], [-20, -276], [-15, -294]], k), true, 0.45);
  const handL: Pt[] = sc([[-86, -132], [-94, -118], [-90, -106], [-80, -118], [-74, -126]], k);
  const handR: Pt[] = sc([[76, -144], [84, -128], [80, -118], [70, -128], [64, -138]], k);
  return (
    <g>
      {/* back light — a cold rim around the whole silhouette */}
      <g filter="url(#rough-s)">
        <path d={robe} fill="none" stroke={rim} strokeWidth={5 * k} opacity={0.55} filter="url(#blur-1.5)" />
        <path d={armL} fill="none" stroke={rim} strokeWidth={4 * k} opacity={0.5} />
        <path d={armR} fill="none" stroke={rim} strokeWidth={4 * k} opacity={0.5} />
      </g>
      <path d={robe} fill="#06070a" filter="url(#paint)" />
      <path d={inner} fill="#12151c" opacity={0.8} />
      <path d={armL} fill="#07080b" />
      <path d={armR} fill="#07080b" />
      {/* long chalk-white fingers */}
      <path d={smooth(handL)} fill={SKIN} stroke={INK} strokeWidth={1.4 * k} />
      <path d={smooth(handR)} fill={SKIN} stroke={INK} strokeWidth={1.4 * k} />
      {[[-92, -112, -100, -94], [-88, -108, -92, -90], [-84, -112, -84, -96]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1 * k} y1={y1 * k} x2={x2 * k} y2={y2 * k} stroke={SKIN} strokeWidth={2.2 * k} strokeLinecap="round" />
      ))}
      {/* the yew wand */}
      <line x1={-94 * k} y1={-114 * k} x2={-150 * k} y2={-64 * k} stroke="#2e2019" strokeWidth={3.2 * k} strokeLinecap="round" />
      <line x1={-94 * k} y1={-114 * k} x2={-150 * k} y2={-64 * k} stroke={C.brass} strokeWidth={0.8 * k} opacity={0.5} strokeLinecap="round" />
      {/* neck + bald head, drawn a touch small: the body reads taller, less human */}
      <g transform={`translate(0 ${-238 * k}) scale(0.78) translate(0 ${238 * k})`}>
      <path d={`M${-7 * k},${-246 * k} L${-6 * k},${-232 * k} L${6 * k},${-232 * k} L${7 * k},${-246 * k}Z`} fill={SKIN_SHADE} />
      <path d={head} fill={SKIN} stroke={INK} strokeWidth={1.6 * k} />
      <path d={smooth(sc([[4, -298], [15, -294], [20, -276], [17, -258], [10, -246], [2, -242], [8, -262], [9, -282]], k), true, 0.4)} fill={SKIN_SHADE} opacity={0.75} />
      {/* heavy brow shadow over the eyes */}
      <path d={`M${-17 * k},${-282 * k} Q0,${-277 * k} ${17 * k},${-282 * k} L${16 * k},${-270 * k} Q0,${-266 * k} ${-16 * k},${-270 * k}Z`} fill={SKIN_SHADE} opacity={0.7} />
      {/* snake face: no bridge, two slits, red eyes */}
      <path d={`M${-12 * k},${-276 * k} Q${-7 * k},${-280 * k} ${-3 * k},${-275 * k}`} fill="none" stroke={INK} strokeWidth={2.4 * k} />
      <path d={`M${3 * k},${-275 * k} Q${7 * k},${-280 * k} ${12 * k},${-276 * k}`} fill="none" stroke={INK} strokeWidth={2.4 * k} />
      <g filter="url(#glow-s)" opacity={eyeGlow}>
        <ellipse cx={-7.5 * k} cy={-273.5 * k} rx={3 * k} ry={1.5 * k} fill="#ff2a2a" />
        <ellipse cx={7.5 * k} cy={-273.5 * k} rx={3 * k} ry={1.5 * k} fill="#ff2a2a" />
      </g>
      <line x1={-2.2 * k} y1={-264 * k} x2={-1 * k} y2={-259 * k} stroke={INK} strokeWidth={1.4 * k} />
      <line x1={2.2 * k} y1={-264 * k} x2={1 * k} y2={-259 * k} stroke={INK} strokeWidth={1.4 * k} />
      <line x1={-7 * k} y1={-251 * k} x2={7 * k} y2={-251 * k} stroke={INK} strokeWidth={1.2 * k} opacity={0.8} />
      </g>
    </g>
  );
};
