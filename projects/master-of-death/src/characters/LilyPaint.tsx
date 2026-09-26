import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// Lily, called back by the stone: head and shoulders, three-quarter view.
// Drawn facing left like Harry; mirror it to have her face him. Same head
// proportions as Harry, softer jaw, long dark-red hair. As a shade of the
// dead she is warm, lit from within and a little see-through (`ghost`).
const soft = (pts: Pt[]) => smooth(pts, true, 0.42);

// A curl of hair: a lock whose centreline swings in S-waves as it falls,
// widest near the root, tapering to a soft point.
const wave = (root: Pt, tip: Pt, w: number, waves = 2, amp = 10, phase = 0): string => {
  const dx = tip[0] - root[0], dy = tip[1] - root[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const n = 18;
  const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = amp * Math.sin(t * Math.PI * 2 * waves + phase) * Math.min(1, t * 3);
    const hw = (w / 2) * (1 - t * 0.85) * (0.85 + 0.15 * Math.cos(t * Math.PI * 2 * waves + phase));
    const cx = root[0] + dx * t + nx * off, cy = root[1] + dy * t + ny * off;
    L.push([cx + nx * hw, cy + ny * hw]);
    R.push([cx - nx * hw, cy - ny * hw]);
  }
  return smooth([...L, ...R.reverse()], true, 0.4);
};
const SKIN = '#f6e6d4';
const SKIN_MID = '#e6c9b4';
const SKIN_SH = '#c9a699';
const HAIR = '#8e3320';
const HAIR_MID = '#a9442a';
const HAIR_HI = '#d27048';
const DARK = '#2a1616';

export const LilyPaint: React.FC<{id?: string; smile?: number; look?: number; ghost?: number}> = ({id = 'lily', smile = 0.3, look = 0, ghost = 1}) => {
  const mid = 186, eyeY = 198;
  const face: Pt[] = [
    [172, 96], [218, 90], [252, 104], [272, 136], [278, 174], [276, 208], [266, 238], [250, 262], [226, 282], [202, 293], [182, 293],
    [164, 284], [150, 272], [141, 248], [137, 220], [137, 190], [140, 162], [148, 134], [159, 112],
  ];
  const eye = (cx: number, w: number, key: string) => {
    const h = 12.5;
    const ir = w * 0.33;
    const ix = cx - w * 0.04 + look;
    return (
      <g key={key}>
        <path d={soft([[cx - w / 2, eyeY + 1], [cx - w * 0.2, eyeY - h * 0.5], [cx + w * 0.25, eyeY - h * 0.5], [cx + w / 2, eyeY], [cx + w * 0.15, eyeY + h * 0.42], [cx - w * 0.25, eyeY + h * 0.4]])} fill="#fbf6ee" />
        <circle cx={ix} cy={eyeY} r={ir} fill={C.harryGreen} />
        <circle cx={ix} cy={eyeY + 0.5} r={ir * 0.42} fill={DARK} />
        <circle cx={ix - ir * 0.4} cy={eyeY - ir * 0.45} r={ir * 0.32} fill="#fff" />
        {/* soft, smiling lids: lower lid lifted a little, lashes at the outer corner */}
        <path d={soft([[cx - w / 2 - 1, eyeY + 2], [cx - w * 0.2, eyeY - h * 0.56], [cx + w * 0.25, eyeY - h * 0.58], [cx + w / 2 + 3, eyeY - 3], [cx + w / 2, eyeY + 1], [cx + w * 0.22, eyeY - h * 0.38], [cx - w * 0.2, eyeY - h * 0.36], [cx - w / 2 + 1, eyeY + 3]])} fill={DARK} />
        {[[0.5, -2, 4, -4], [0.36, -5, 3, -6], [0.2, -6.5, 1.6, -7]].map(([u, y0, dx, dy], i) => (
          <path key={i} d={`M${cx + w * u},${eyeY + y0} l${dx},${dy}`} stroke={DARK} strokeWidth={0.9} strokeLinecap="round" />
        ))}
        <path d={soft([[cx - w * 0.35, eyeY + h * 0.36 - smile * 2], [cx + w * 0.3, eyeY + h * 0.4 - smile * 2], [cx + w * 0.1, eyeY + h * 0.6], [cx - w * 0.25, eyeY + h * 0.58]])} fill={SKIN_MID} />
      </g>
    );
  };
  return (
    <g opacity={1 - 0.3 * ghost}>
      <defs>
        <radialGradient id={`${id}-inner`}>
          <stop offset="0" stopColor="#fff1d6" stopOpacity="0.4" />
          <stop offset="0.6" stopColor="#ffcf87" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffcf87" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* back hair: full, wavy, falling behind the shoulders */}
      <path d={soft([[104, 230], [98, 170], [110, 118], [140, 80], [188, 56], [242, 60], [284, 84], [314, 124], [328, 176], [330, 236], [316, 280], [262, 296], [180, 300], [126, 290], [106, 262]])} fill={HAIR} />
      {[
        [[300, 150], [336, 340], 80, 2.2, 12, 0], [[286, 200], [310, 430], 66, 2.6, 10, 1], [[124, 180], [88, 370], 74, 2.2, 12, 2],
        [[128, 240], [104, 440], 64, 2.6, 11, 0.5], [[312, 230], [356, 410], 56, 2.4, 9, 2.4], [[110, 150], [74, 300], 50, 1.8, 10, 1.6],
        [[322, 170], [360, 320], 46, 2.0, 9, 0.9],
      ].map(([r, t, w, n, a, ph], i) => (
        <path key={`b${i}`} d={wave(r as Pt, t as Pt, w as number, n as number, a as number, ph as number)} fill={i % 2 ? '#7a2a1a' : HAIR} />
      ))}
      {/* shoulders: a soft cardigan */}
      <path d={soft([[20, 520], [40, 414], [100, 354], [164, 330], [214, 334], [276, 330], [330, 344], [376, 382], [392, 520]])} fill="#cdbba3" />
      <path d={soft([[240, 334], [276, 330], [330, 344], [376, 382], [392, 520], [270, 520]])} fill="#a8957d" />
      <path d={soft([[176, 334], [206, 372], [236, 334], [226, 330], [206, 352], [186, 330]])} fill={SKIN_MID} />
      {/* neck */}
      <path d={soft([[200, 284], [242, 266], [246, 304], [250, 336], [206, 340], [198, 312]])} fill={SKIN_SH} />
      <path d={soft([[198, 294], [246, 268], [250, 300], [226, 316], [200, 314]])} fill={SKIN_SH} />
      {/* face */}
      <path d={soft(face)} fill={SKIN} />
      <path d={soft([[240, 100], [266, 128], [276, 170], [274, 208], [264, 240], [248, 266], [224, 288], [206, 298], [226, 266], [236, 230], [240, 190], [236, 146], [226, 116]])} fill="#dcb5a4" opacity={0.45} />
      <path d={soft([[196, 210], [200, 234], [196, 244], [186, 246], [191, 232]])} fill={SKIN_MID} opacity={0.8} />
      <path d={soft([[178, 250], [196, 249], [198, 254], [182, 255]])} fill={SKIN_SH} opacity={0.8} />
      <ellipse cx={162} cy={236} rx={15} ry={9} fill="#f0a08a" opacity={0.28} />
      <ellipse cx={230} cy={238} rx={14} ry={8} fill="#f0a08a" opacity={0.22} />
      {eye(158, 28, 'far')}
      {eye(215, 32, 'near')}
      <path d={soft([[143, 180], [156, 173], [172, 173], [158, 176], [146, 183]])} fill={HAIR} />
      <path d={soft([[199, 176], [216, 170], [236, 173], [246, 181], [234, 177], [216, 175], [201, 180]])} fill={HAIR} />
      {/* mouth: a gentle smile */}
      {/* upper lip with a cupid's bow, fuller lower lip, a little sheen */}
      <path d={soft([[mid - 15 - 2 * smile, 268 - 5 * smile], [mid - 6, 263.5], [mid - 1, 265.5], [mid + 3, 263.5], [mid + 19 + 2 * smile, 268.5 - 5 * smile], [mid + 4, 269.5 + smile * 0.5], [mid - 7, 269 + smile * 0.5]])} fill="#c0706a" />
      <path d={soft([[mid - 12 - smile, 269.5 - 3 * smile], [mid + 16 + smile, 270 - 3 * smile], [mid + 10, 278], [mid + 2, 280], [mid - 7, 278]])} fill="#d4847a" />
      <path d={soft([[mid - 3, 273], [mid + 7, 273], [mid + 5, 276], [mid - 1, 276]])} fill="#ffe4d8" opacity={0.55} />
      {/* front hair: a soft side parting, waves over the crown, curls framing
          her face and tumbling past the shoulders */}
      {[
        [[222, 78], [136, 142], 44, 0.8, 4, 0.2], [[214, 84], [150, 132], 40, 0.7, 6, 1.1], [[240, 84], [274, 168], 40, 1.1, 7, 0.6],
        [[200, 80], [140, 128], 40, 0.8, 6, 0], [[206, 80], [266, 118], 36, 0.8, 6, 1.5], [[180, 84], [128, 170], 34, 1.2, 8, 0.4],
        [[144, 120], [120, 260], 32, 1.8, 5, 0], [[134, 220], [112, 380], 34, 2.2, 6, 1.2], [[128, 300], [108, 440], 30, 2.2, 9, 2.1],
        [[262, 110], [286, 240], 30, 1.6, 8, 0.8], [[282, 210], [302, 350], 30, 2.0, 9, 2.6], [[230, 76], [290, 110], 26, 0.9, 5, 0.3],
      ].map(([r, t, w, n, a, ph], i) => (
        <path key={`f${i}`} d={wave(r as Pt, t as Pt, w as number, n as number, a as number, ph as number)} fill={i % 3 === 0 ? HAIR_MID : HAIR} />
      ))}
      {/* light running along the waves */}
      {[
        [[214, 82], [146, 136], 12, 0.9, 6, 0.3], [[244, 90], [270, 160], 9, 1.1, 6, 0.7],
        [[186, 84], [146, 124], 10, 0.8, 5, 0], [[140, 150], [122, 262], 8, 1.8, 5, 0.2], [[136, 250], [118, 380], 9, 2.2, 9, 1.4],
        [[270, 130], [288, 236], 8, 1.6, 7, 1], [[214, 80], [256, 104], 8, 0.8, 4, 1.8],
      ].map(([r, t, w, n, a, ph], i) => (
        <path key={`h${i}`} d={wave(r as Pt, t as Pt, w as number, n as number, a as number, ph as number)} fill={HAIR_HI} opacity={0.8} />
      ))}
      {/* the light she is made of */}
      {ghost > 0 && <ellipse cx={205} cy={250} rx={220} ry={290} fill={`url(#${id}-inner)`} opacity={ghost} />}
    </g>
  );
};
