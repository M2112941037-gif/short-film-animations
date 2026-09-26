import React from 'react';
import {Pt, smooth} from '../util';

// Voldemort, head and shoulders, for close-ups — painted in planes like
// HarryPaint (same box 0..400 × 0..500, turned ~25° toward our left).
// Bald, long skull, bone-white skin going violet-grey in shadow, no nose
// but two slits, lipless mouth, red eyes with slit pupils.
// `shock` 0..1 widens the eyes, shrinks the pupils, drops the jaw a little;
// `smirk` 0..1 lifts the near corner of the mouth and narrows the eyes.
const SKIN = '#d9dde1';
const SKIN_HI = '#f6f7f8';
const SKIN_MID = '#bcc2cb';
const SKIN_SH = '#838a9a';
const SOCKET = '#5d6273';
const ROBE = '#0d0f15';
const ROBE_HI = '#20263a';

const soft = (pts: Pt[]) => smooth(pts, true, 0.4);

export const VoldemortPaint: React.FC<{id?: string; shock?: number; smirk?: number; look?: number}> = ({
  id = 'vp', shock = 0, smirk = 0, look = 0,
}) => {
  const mid = 186;
  const eyeY = 198;
  const head: Pt[] = [
    [176, 74], [214, 64], [252, 74], [280, 100], [292, 140], [292, 186], [284, 224], [272, 254], [254, 284], [232, 310], [208, 328], [186, 332],
    [167, 320], [153, 298], [145, 268], [139, 236], [136, 204], [137, 170], [141, 136], [152, 104],
  ];
  const eye = (cx: number, w: number, near: boolean) => {
    const h = 12 + 4 * shock - 3 * smirk;
    const ir = w * 0.34;
    const ix = cx - w * 0.05 + look;
    const slit = ir * (0.16 - 0.09 * shock);
    const lower = near ? 2.5 * smirk : 1.2 * smirk;
    return (
      <g>
        {/* the socket: a deep, cool hollow */}
        <ellipse cx={cx + 1} cy={eyeY - 1} rx={w * 0.92} ry={h * 1.65} fill={SOCKET} opacity={0.9} filter="url(#blur-1.5)" />
        <path d={soft([[cx - w / 2, eyeY + 1], [cx - w * 0.2, eyeY - h * 0.5], [cx + w * 0.25, eyeY - h * 0.5], [cx + w / 2, eyeY], [cx + w * 0.15, eyeY + h * 0.42 - lower], [cx - w * 0.25, eyeY + h * 0.4 - lower]])} fill="#e7dfcb" />
        <circle cx={ix} cy={eyeY} r={ir * 1.8} fill="#c2231f" opacity={0.18} filter="url(#blur-3)" />
        <circle cx={ix} cy={eyeY} r={ir} fill="#b71c1c" />
        <path d={`M${ix - ir},${eyeY} A${ir},${ir} 0 0 0 ${ix + ir},${eyeY} Z`} fill="#7c0f12" />
        <ellipse cx={ix} cy={eyeY} rx={slit} ry={ir * 0.82} fill="#0a0506" />
        <circle cx={ix - ir * 0.45} cy={eyeY - ir * 0.45} r={ir * 0.22} fill="#fff" opacity={0.85} />
        {/* lids: thin and lashless; shock pulls the upper lid off the iris */}
        <path d={soft([[cx - w / 2 - 1, eyeY + 2], [cx - w * 0.2, eyeY - h * 0.56], [cx + w * 0.25, eyeY - h * 0.58], [cx + w / 2 + 2, eyeY - 1], [cx + w / 2 - 1, eyeY + 1], [cx + w * 0.22, eyeY - h * 0.44], [cx - w * 0.2, eyeY - h * 0.42], [cx - w / 2 + 1, eyeY + 3]])} fill="#3a3844" />
        {smirk > 0 && <path d={soft([[cx - w / 2 - 2, eyeY - h - 2], [cx + w / 2 + 3, eyeY - h - 2], [cx + w / 2 + 2, eyeY - 1], [cx + w * 0.25, eyeY - h * 0.58 + smirk * h * 0.32], [cx - w * 0.2, eyeY - h * 0.56 + smirk * h * 0.3], [cx - w / 2 - 1, eyeY + 1]])} fill={SKIN_MID} />}
        <path d={`M${cx - w * 0.36},${eyeY + h * 0.5 - lower} Q${cx},${eyeY + h * 0.66 - lower} ${cx + w * 0.34},${eyeY + h * 0.46 - lower}`} fill="none" stroke={SKIN_SH} strokeWidth={2} opacity={0.8} />
      </g>
    );
  };
  const open = 9 * shock;
  const lift = 9 * smirk;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fall`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="#0a0f1c" stopOpacity="0" />
          <stop offset="0.55" stopColor="#0a0f1c" stopOpacity="0.2" />
          <stop offset="1" stopColor="#05070d" stopOpacity="0.6" />
        </linearGradient>
        <filter id={`${id}-white`} colorInterpolationFilters="sRGB"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" /></filter>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={700} height={1100}><use href={`#${id}-body`} filter={`url(#${id}-white)`} /></mask>
      </defs>
      <g id={`${id}-body`}>
        {/* robe: a high black collar standing up around a thin neck */}
        <path d={soft([[-20, 900], [-20, 520], [30, 440], [96, 396], [150, 366], [166, 326], [190, 344], [236, 340], [260, 318], [284, 362], [336, 386], [392, 428], [430, 500], [430, 900]])} fill={ROBE} />
        <path d={soft([[40, 450], [104, 412], [150, 394], [132, 470], [90, 560], [44, 560]])} fill={ROBE_HI} opacity={0.8} />
        <path d={`M${-18},520 Q${10},470 ${40},448 T${150},390`} fill="none" stroke="#8d98b0" strokeWidth={3} opacity={0.5} />
        {[[210, 420, 196, 640], [262, 410, 300, 660], [320, 420, 380, 700]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1},${y1} Q${(x1 + x2) / 2 + 12},${(y1 + y2) / 2} ${x2},${y2}`} stroke="#050608" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.8} />
        ))}
        {/* neck: thin, corded */}
        <path d={soft([[176, 312], [238, 306], [244, 384], [196, 392], [170, 380]])} fill={SKIN_MID} />
        <path d={soft([[214, 314], [238, 306], [244, 384], [220, 388]])} fill={SKIN_SH} />
        <path d={`M${192},330 Q${196},360 ${190},386`} stroke={SKIN_SH} strokeWidth={4} fill="none" opacity={0.7} />

        {/* the head: bone-white, the far side falling into cold shadow */}
        <path d={soft(head)} fill={SKIN} />
        <path d={soft([[252, 80], [283, 108], [295, 150], [294, 196], [286, 232], [273, 262], [253, 290], [229, 314], [209, 328], [227, 292], [245, 256], [253, 212], [255, 168], [250, 124]])} fill={SKIN_SH} />
        <path d={soft([[238, 96], [254, 130], [256, 180], [250, 226], [238, 262], [222, 292], [230, 250], [240, 210], [242, 166], [236, 124]])} fill={SKIN_MID} />
        {/* sunken temple, gaunt cheek under a sharp cheekbone */}
        <path d={soft([[256, 150], [276, 160], [280, 204], [262, 214], [254, 186]])} fill="#747b8c" opacity={0.7} />
        <path d={soft([[146, 232], [176, 226], [196, 236], [178, 242], [150, 244]])} fill={SKIN_HI} />
        <path d={soft([[150, 248], [184, 244], [210, 258], [204, 290], [170, 294], [150, 276]])} fill="#99a0ad" opacity={0.85} />
        {/* key light running over the crown, and faint veins at the temple */}
        <path d={`M${146},${118} Q${160},${76} ${214},${63}`} stroke={SKIN_HI} strokeWidth={6} fill="none" strokeLinecap="round" />
        {[[262, 110, 276, 150], [270, 126, 290, 140], [248, 92, 262, 118]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1},${y1} q${6},${(y2 - y1) / 2} ${x2 - x1},${y2 - y1}`} stroke="#7d8fb8" strokeWidth={1.4} fill="none" opacity={0.45} />
        ))}
        {/* a hairless brow ridge */}
        <path d={soft([[140, 178], [164, 168], [190, 172], [214, 166], [244, 172], [240, 178], [214, 174], [190, 180], [164, 176]])} fill={SKIN_HI} opacity={0.85} />

        {eye(158, 26, false)}
        {eye(223, 31, true)}

        {/* no nose: a flat plane and two slits */}
        <path d={soft([[176, 206], [196, 204], [204, 246], [194, 256], [174, 252], [170, 232]])} fill={SKIN_HI} opacity={0.7} />
        <path d={soft([[174, 250], [184, 246], [186, 254], [178, 258]])} fill="#3b3842" />
        <path d={soft([[194, 248], [205, 244], [206, 252], [198, 256]])} fill="#3b3842" />
        <path d={soft([[170, 258], [208, 256], [200, 266], [178, 266]])} fill={SKIN_SH} opacity={0.6} />

        {/* the mouth: lipless, a thin cut; smirk curls the near corner up */}
        <path d={soft([[mid - 22, 290 + open * 0.2], [mid - 6, 287 - open * 0.3], [mid + 10, 287 - open * 0.3], [mid + 28 + 3 * smirk, 289 - lift], [mid + 10, 291 + open], [mid - 6, 292 + open]])} fill="#433c46" />
        <path d={soft([[mid - 18, 294 + open], [mid + 20, 294 + open - lift * 0.4], [mid + 8, 300 + open], [mid - 8, 300 + open]])} fill="#a39ea8" opacity={0.55} />
        {smirk > 0 && <path d={`M${mid + 30},${270} Q${mid + 36 + 2 * smirk},${282 - lift * 0.5} ${mid + 30 + 3 * smirk},${292 - lift}`} stroke={SKIN_SH} strokeWidth={2.5} fill="none" opacity={smirk} />}
        <path d={soft([[164, 312], [200, 318], [228, 306], [214, 324], [184, 326]])} fill={SKIN_SH} />
      </g>
      <g mask={`url(#${id}-m)`}>
        <rect x={-40} y={20} width={480} height={880} fill={`url(#${id}-fall)`} />
      </g>
    </g>
  );
};
