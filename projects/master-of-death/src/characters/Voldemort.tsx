import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

const INK = '#040507';
const SKIN = '#d8dde0';
const SKIN_SHADE = '#7f8a95';

const sc = (pts: Pt[], k: number, dx = 0, dy = 0) => pts.map(([x, y]) => [x * k + dx, y * k + dy] as Pt);

// Tom Riddle → Lord Voldemort, full figure. Origin at the feet, ~300 px at
// k=1. `age` 0..3 walks through four faces — schoolboy, young man, the
// waxy in-between, the snake — cross-dissolving between neighbours; the robe
// lengthens and starts to stream, the skin drains of warmth.
// `wind` 0..1 streams the robe to the right.
const HEADS = {
  // 0 · Tom at school: neat dark hair with a side parting, warm pale skin
  tom: {
    skin: '#e6d3c3', shade: '#a88f7e', hair: '#141214',
    face: [[0, -300], [15, -296], [19, -282], [18, -266], [14, -252], [6, -244], [0, -243], [-6, -244], [-14, -252], [-18, -266], [-19, -282], [-15, -296]],
    hairPts: [[-20, -276], [-21.5, -292], [-14, -304], [0, -307], [14, -305], [21.5, -294], [20.5, -279], [18, -287], [10, -292], [2, -291], [-5, -295], [-12, -289], [-17.5, -283]],
    eye: '#1a1414', lips: '#9c6f66', nose: 1, red: 0,
  },
  // 1 · the young man: longer, paler face, hair slicked back from a high brow
  man: {
    skin: '#dcd6d0', shade: '#8f8a86', hair: '#19181a',
    face: [[0, -302], [15, -297], [18.5, -282], [17, -264], [12, -250], [5, -242], [0, -241], [-5, -242], [-12, -250], [-17, -264], [-18.5, -282], [-15, -297]],
    hairPts: [[-18.5, -284], [-19.5, -296], [-12, -306], [0, -308], [12, -306], [19.5, -296], [18.5, -284], [15, -293], [6, -298], [-6, -298], [-15, -293]],
    eye: '#2a1414', lips: '#8a6a68', nose: 1, red: 0.35,
  },
  // 2 · halfway: waxy, hair gone to wisps, the nose sinking, eyes reddening
  wax: {
    skin: '#d6d6d0', shade: '#868b8f', hair: '#2a2a2c',
    face: [[0, -301], [15.5, -296], [19.5, -280], [17.5, -263], [11, -249], [4, -243], [-1, -242], [-6, -244], [-12, -251], [-17, -265], [-18.5, -281], [-14.5, -296]],
    hairPts: [[-16, -296], [-11, -304], [-6, -300], [-2, -305], [3, -301], [8, -305], [13, -298], [8, -299], [2, -298], [-5, -297]],
    eye: '#6a1010', lips: '#7d7a7a', nose: 0.4, red: 0.75,
  },
} as const;

const Head: React.FC<{which: keyof typeof HEADS; k: number; opacity: number}> = ({which, k, opacity}) => {
  const h = HEADS[which];
  const face = smooth(sc(h.face as unknown as Pt[], k), true, 0.45);
  return (
    <g opacity={opacity}>
      <path d={`M${-6.5 * k},${-246 * k} L${-6 * k},${-232 * k} L${6 * k},${-232 * k} L${6.5 * k},${-246 * k}Z`} fill={h.shade} />
      <ellipse cx={-19 * k} cy={-272 * k} rx={2.6 * k} ry={5 * k} fill={h.shade} />
      <ellipse cx={19 * k} cy={-272 * k} rx={2.6 * k} ry={5 * k} fill={h.shade} />
      <path d={face} fill={h.skin} />
      {/* shaded side of the face */}
      <path d={smooth(sc([[5, -299], [15, -296], [19, -282], [18, -266], [14, -252], [6, -244], [3, -244], [9, -262], [10, -284]], k), true, 0.4)} fill={h.shade} opacity={0.7} />
      <path d={smooth(sc(h.hairPts as unknown as Pt[], k), true, 0.35)} fill={h.hair} />
      {/* brows, eyes */}
      <path d={`M${-12 * k},${-281 * k} Q${-7.5 * k},${-283.5 * k} ${-3 * k},${-281 * k} M${3 * k},${-281 * k} Q${7.5 * k},${-283.5 * k} ${12 * k},${-281 * k}`} stroke={h.hair} strokeWidth={1.6 * k} fill="none" opacity={1 - h.red * 0.7} />
      {[-7.5, 7.5].map((x) => (
        <g key={x}>
          <ellipse cx={x * k} cy={-275.5 * k} rx={3.4 * k} ry={1.7 * k} fill="#efe9e2" opacity={0.85} />
          <circle cx={x * k} cy={-275.5 * k} r={1.35 * k} fill={h.eye} />
          {h.red > 0 && <circle cx={x * k} cy={-275.5 * k} r={1.35 * k} fill="#ff2a2a" opacity={h.red * 0.8} filter="url(#glow-s)" />}
        </g>
      ))}
      {/* the nose fades with each step toward the snake */}
      <path d={`M${0},${-276 * k} L${1.6 * k},${-264 * k} Q${0},${-261.5 * k} ${-2 * k},${-263 * k}`} fill="none" stroke={INK} strokeWidth={1.1 * k} opacity={h.nose * 0.8} />
      <path d={`M${-5 * k},${-253.5 * k} Q0,${-252 * k} ${5 * k},${-253.5 * k}`} fill="none" stroke={h.lips} strokeWidth={1.4 * k} />
    </g>
  );
};

// `t` (seconds) + `flutter` 0..1 set the cloak billowing in the wind.
export const Riddle: React.FC<{k?: number; rim?: string; wind?: number; eyeGlow?: number; age?: number; t?: number; flutter?: number}> = ({
  k: k0 = 1, rim = C.grey, wind = 1, eyeGlow = 1, age = 3, t = 0, flutter = 0,
}) => {
  const k = k0 * (0.84 + 0.16 * Math.min(1, age / 2));
  const w = wind * Math.min(1, 0.25 + age / 3);
  const skinHand = age < 1.5 ? '#e6d3c3' : SKIN;
  // cloak points further along the trailing edge move more: waves running
  // down the cloth, the tips snapping
  const fl = (i: number, ax: number, ay: number): [number, number] => [
    flutter * ax * Math.sin(t * 3.4 - i * 0.8), flutter * ay * Math.sin(t * 2.9 - i * 1.1 + 0.6),
  ];
  const tail = ([[70, -6, 0], [110 + 30 * w, -22 - 6 * w, 1], [150 + 50 * w + 30 * flutter, -48 - 10 * w - 12 * flutter, 2], [118 + 40 * w + 20 * flutter, -58 - 8 * flutter, 3],
    [170 + 50 * w + 40 * flutter, -96 - 8 * w - 22 * flutter, 4], [120 + 30 * w + 20 * flutter, -104 - 10 * flutter, 5], [140 + 30 * w + 30 * flutter, -140 - 16 * flutter, 6], [80 + 10 * w, -138, 7]] as const)
    .map(([x, y, i]) => { const [dx, dy] = fl(i, 6 + i * 3, 4 + i * 2.5); return [x + dx, y + dy] as Pt; });
  const robe = smooth(sc([
    [-20, -236], [-30, -200], [-38, -150], [-46, -96], [-60, -40], [-74, 0], [-40, 6], [-6, 2], [30, 6],
    ...tail,
    [46, -176], [30, -214], [22, -236],
  ], k), true, 0.35);
  const inner = smooth(sc([[-8, -220], [-16, -160], [-22, -80], [-30, -10], [6, -20], [2, -100], [8, -180]], k), true, 0.4);
  // arm holding the wand, slightly out from the body and angled down
  const armL = smooth(sc([[-24, -226], [-50, -196], [-72, -160], [-86, -132], [-74, -126], [-58, -156], [-34, -186]], k), true, 0.3);
  const armR = smooth(sc([[22, -226], [44, -196], [62, -166], [76, -144], [64, -138], [46, -164], [28, -190]], k), true, 0.3);
  const head = smooth(sc([[0, -300], [15, -294], [20, -276], [17, -258], [10, -246], [0, -242], [-10, -246], [-17, -258], [-20, -276], [-15, -294]], k), true, 0.45);
  const handL: Pt[] = sc([[-86, -132], [-94, -118], [-90, -106], [-80, -118], [-74, -126]], k);
  const handR: Pt[] = sc([[76, -144], [84, -128], [80, -118], [70, -128], [64, -138]], k);
  const stage = Math.min(3, Math.max(0, age));
  const heads: [keyof typeof HEADS | 'snake', number][] = (['tom', 'man', 'wax', 'snake'] as const).map((n, i) => [n, Math.max(0, 1 - Math.abs(stage - i))]);
  const snake = heads[3][1];
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
      {/* the schoolboy's collar and green tie, gone once he grows up */}
      {age < 1 && (
        <g opacity={1 - age}>
          <path d={smooth(sc([[-9, -234], [0, -214], [9, -234], [3, -234], [0, -226], [-3, -234]], k), true, 0.2)} fill="#e7e9ec" />
          <path d={`M${-2 * k},${-228 * k} L${2 * k},${-228 * k} L${3 * k},${-196 * k} L0,${-190 * k} L${-3 * k},${-196 * k}Z`} fill="#1f5a3f" />
          <line x1={-2.6 * k} y1={-212 * k} x2={2.6 * k} y2={-214 * k} stroke="#b9c0c6" strokeWidth={1.2 * k} />
        </g>
      )}
      <path d={armL} fill="#07080b" />
      <path d={armR} fill="#07080b" />
      {/* fingers: a boy's hand, then long and chalk-white */}
      <path d={smooth(handL)} fill={skinHand} />
      <path d={smooth(handR)} fill={skinHand} />
      {[[-92, -112, -100, -94], [-88, -108, -92, -90], [-84, -112, -84, -96]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1 * k} y1={y1 * k} x2={(x1 + (x2 - x1) * (0.6 + 0.13 * stage)) * k} y2={(y1 + (y2 - y1) * (0.6 + 0.13 * stage)) * k} stroke={skinHand} strokeWidth={2.2 * k} strokeLinecap="round" />
      ))}
      {/* the yew wand */}
      <line x1={-94 * k} y1={-114 * k} x2={-150 * k} y2={-64 * k} stroke="#2e2019" strokeWidth={3.2 * k} strokeLinecap="round" />
      <line x1={-94 * k} y1={-114 * k} x2={-150 * k} y2={-64 * k} stroke={C.brass} strokeWidth={0.8 * k} opacity={0.5} strokeLinecap="round" />
      <g transform={`translate(0 ${-238 * k}) scale(0.78) translate(0 ${238 * k})`}>
        {heads.slice(0, 3).map(([n, o]) => o > 0 && <Head key={n} which={n as keyof typeof HEADS} k={k} opacity={o} />)}
        {snake > 0 && (
          <g opacity={snake}>
            <path d={`M${-7 * k},${-246 * k} L${-6 * k},${-232 * k} L${6 * k},${-232 * k} L${7 * k},${-246 * k}Z`} fill={SKIN_SHADE} />
            <path d={head} fill={SKIN} />
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
        )}
      </g>
    </g>
  );
};

export const VoldemortTall: React.FC<{k?: number; rim?: string; wind?: number; eyeGlow?: number}> = (p) => <Riddle {...p} age={3} />;
