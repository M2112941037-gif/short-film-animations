import React from 'react';
import {C} from '../theme';
import {Pt, smooth} from '../util';

// Harry, head and shoulders, three-quarter view facing left — painted in
// planes rather than drawn in lines: form comes from hard-edged light and
// shadow shapes (cool shadow, warm bounce), hair in big angular chunks.
// Proportions pushed slightly: larger head and eyes. Box 0..400 × 0..500.
const DARK = '#15121a';
const SKIN = '#ecd2bb';
const SKIN_MID = '#d2ab94';
const SKIN_SH = '#9c7c78'; // cool, slightly violet shadow
const WARM = '#e59a7f';    // bounce light on the cheek
const HAIR = '#1a1720';
const HAIR_MID = '#2c3146';
const HAIR_HI = '#3c4764';
const COAT = '#2a3550';
const COAT_SH = '#1a2034';
const SCARF = '#ad2a2e';
const SCARF_SH = '#6e171c';

const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x},${y}`).join(' L')}Z`;
const soft = (pts: Pt[]) => smooth(pts, true, 0.4);

// A soft lock of hair: a tapered, curved leaf from `root` to `tip`,
// bowing sideways by `bend` (px). Messy hair = many of these, overlapping.
const lock = (root: Pt, tip: Pt, w: number, bend: number): string => {
  const dx = tip[0] - root[0], dy = tip[1] - root[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const at = (t: number, off: number): Pt => [root[0] + dx * t + nx * (off + bend * Math.sin(Math.PI * t)), root[1] + dy * t + ny * (off + bend * Math.sin(Math.PI * t))];
  return smooth([at(0, -w / 2), at(0.35, -w * 0.45), at(0.7, -w * 0.25), tip, at(0.7, w * 0.2), at(0.35, w * 0.45), at(0, w / 2)], true, 0.5);
};

// Proportions follow the classic head: eyes on the half-way line, one eye's
// width between them, nose base half-way from eyes to chin, mouth a third
// of the way from nose to chin, ears from brow to nose base. Turned ~25°:
// the midline sits a little left of centre and the far eye is only slightly
// narrower than the near one.
export const HarryPaint: React.FC<{id?: string}> = ({id = 'hp'}) => {
  const mid = 186; // midline x at eye level
  const eyeY = 200;
  const face: Pt[] = [
    [168, 92], [214, 86], [252, 100], [274, 132], [282, 172], [281, 210], [274, 244], [260, 272], [236, 294], [206, 306], [182, 306],
    [160, 296], [146, 278], [138, 252], [134, 222], [134, 192], [137, 162], [145, 132], [154, 108],
  ];
  const far = {x: 157, w: 26};
  const near = {x: 216, w: 30};
  const eye = (cx: number, w: number, key: string) => {
    const h = 13;
    const white: Pt[] = [[cx - w / 2, eyeY + 1], [cx - w * 0.2, eyeY - h * 0.5], [cx + w * 0.25, eyeY - h * 0.5], [cx + w / 2, eyeY], [cx + w * 0.15, eyeY + h * 0.42], [cx - w * 0.25, eyeY + h * 0.4]];
    const ir = w * 0.34;
    const ix = cx - w * 0.06; // both looking a touch to their left, where the others stand
    return (
      <g key={key}>
        <path d={soft(white)} fill="#f3eee7" />
        <circle cx={ix} cy={eyeY} r={ir} fill={C.harryGreen} />
        <path d={`M${ix - ir},${eyeY} A${ir},${ir} 0 0 0 ${ix + ir},${eyeY} Z`} fill="#2f8a57" />
        <circle cx={ix} cy={eyeY + 0.5} r={ir * 0.45} fill={DARK} />
        <circle cx={ix - ir * 0.4} cy={eyeY - ir * 0.45} r={ir * 0.3} fill="#fff" />
        <circle cx={ix + ir * 0.35} cy={eyeY + ir * 0.45} r={ir * 0.12} fill="#fff" opacity={0.8} />
        {/* upper lid: a tapered dark shape, thicker at the outer corner */}
        <path d={soft([[cx - w / 2 - 1, eyeY + 2], [cx - w * 0.2, eyeY - h * 0.56], [cx + w * 0.25, eyeY - h * 0.58], [cx + w / 2 + 2, eyeY - 1], [cx + w / 2 - 1, eyeY + 2], [cx + w * 0.22, eyeY - h * 0.38], [cx - w * 0.2, eyeY - h * 0.36], [cx - w / 2 + 1, eyeY + 3]])} fill={DARK} />
        <path d={soft([[cx - w * 0.3, eyeY + h * 0.46], [cx + w * 0.2, eyeY + h * 0.48], [cx + w * 0.1, eyeY + h * 0.62], [cx - w * 0.25, eyeY + h * 0.58]])} fill={SKIN_SH} opacity={0.6} />
      </g>
    );
  };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fall`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="#0a0f1c" stopOpacity="0" />
          <stop offset="0.55" stopColor="#0a0f1c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#05070d" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      {/* shoulders */}
      <path d={soft([[-20, 520], [10, 440], [70, 392], [150, 366], [206, 374], [276, 368], [330, 380], [384, 412], [420, 470], [430, 520]])} fill={COAT} />
      <path d={poly([[236, 374], [300, 372], [352, 392], [398, 432], [424, 520], [262, 520], [270, 450]])} fill={COAT_SH} />
      <path d={poly([[60, 404], [118, 382], [132, 430], [118, 520], [70, 520]])} fill="#34416a" opacity={0.7} />

      {/* neck, shadowed under the jaw */}
      <path d={soft([[200, 296], [250, 270], [262, 320], [270, 358], [206, 366], [198, 330]])} fill={SKIN_MID} />
      <path d={poly([[200, 298], [252, 268], [258, 306], [230, 322], [202, 318]])} fill={SKIN_SH} />

      {/* ears, between brow and nose base */}
      <path d={soft([[268, 186], [286, 190], [294, 214], [288, 240], [270, 246], [274, 214]])} fill={SKIN_MID} />
      <path d={soft([[276, 200], [286, 208], [284, 230], [276, 234], [279, 214]])} fill={SKIN_SH} />

      {/* face: base, a clean shadow plane, a half-tone between */}
      <path d={soft(face)} fill={SKIN} />
      <path d={soft([[238, 96], [268, 124], [280, 170], [280, 210], [273, 244], [258, 272], [234, 294], [212, 304], [232, 270], [244, 232], [248, 190], [244, 146], [232, 114]])} fill={SKIN_SH} />
      <path d={soft([[228, 112], [240, 146], [244, 190], [240, 232], [228, 266], [214, 290], [220, 250], [228, 206], [228, 164], [222, 128]])} fill={SKIN_MID} />
      {/* brow ridge and eye sockets, softly */}
      <path d={soft([[142, 186], [160, 180], [176, 186], [174, 194], [158, 190], [144, 194]])} fill={SKIN_MID} opacity={0.8} />
      <path d={soft([[198, 186], [218, 178], [238, 184], [236, 194], [216, 190], [200, 194]])} fill={SKIN_MID} opacity={0.8} />
      {/* nose on the midline: lit bridge, shadow toward us, a small cast shadow */}
      <path d={soft([[mid + 4, 206], [mid + 12, 236], [mid + 8, 250], [mid - 4, 252], [mid + 2, 236]])} fill={SKIN_MID} />
      <path d={soft([[mid + 6, 238], [mid + 13, 246], [mid + 6, 253], [mid, 252]])} fill={SKIN_SH} />
      <path d={soft([[mid - 12, 254], [mid + 6, 253], [mid + 10, 259], [mid - 8, 260]])} fill={SKIN_SH} opacity={0.8} />
      <path d={soft([[mid - 8, 244], [mid - 1, 241], [mid + 1, 247], [mid - 6, 249]])} fill="#f7e6d4" opacity={0.9} />
      {/* warm cheeks, very light */}
      <ellipse cx={162} cy={236} rx={15} ry={9} fill={WARM} opacity={0.18} />
      <ellipse cx={228} cy={238} rx={14} ry={8} fill={WARM} opacity={0.14} />
      {/* mouth, a third of the way from nose to chin: small, lips pressed */}
      <path d={soft([[mid - 16, 272], [mid - 5, 269.5], [mid + 2, 271], [mid + 9, 269.5], [mid + 20, 272.5], [mid + 4, 275], [mid - 8, 274.5]])} fill="#7a4644" />
      <path d={soft([[mid - 10, 277], [mid + 12, 277], [mid + 6, 283], [mid - 6, 283]])} fill="#d9998b" opacity={0.55} />
      <path d={soft([[mid - 10, 285], [mid + 14, 285], [mid + 6, 290], [mid - 6, 290]])} fill={SKIN_MID} opacity={0.6} />
      <path d={soft([[168, 300], [206, 306], [232, 296], [218, 312], [186, 314]])} fill={SKIN_SH} />

      {eye(far.x, far.w, 'far')}
      {eye(near.x, near.w, 'near')}
      {/* brows: soft arcs, the inner ends lifted just a little */}
      <path d={soft([[142, 180], [154, 172], [170, 171], [174, 175], [158, 177], [145, 184]])} fill={HAIR} />
      <path d={soft([[198, 175], [214, 170], [232, 172], [244, 180], [232, 178], [214, 176], [200, 180]])} fill={HAIR} />

      {/* the scar, half under the fringe */}
      <path d={poly([[206, 126], [198, 140], [205, 141], [197, 156], [200, 156], [209, 142], [202, 141], [209, 127]])} fill="#a3514c" />

      {/* hair: a dark mass with soft, falling locks — untidy, never spiky */}
      <path d={soft([[132, 184], [120, 152], [124, 116], [140, 88], [166, 66], [200, 56], [236, 60], [266, 74], [290, 100], [302, 132], [306, 168], [300, 200], [292, 228], [282, 206], [280, 170], [272, 138], [256, 118], [226, 108], [196, 110], [168, 122], [148, 146], [138, 170]])} fill={HAIR} />
      {[
        // fringe: locks falling to the brow, sweeping to his right (our left)
        [[236, 96], [214, 150], 26, -8], [[212, 96], [188, 148], 28, -10], [[188, 98], [164, 158], 26, -10], [[166, 104], [146, 168], 22, -8],
        [[256, 104], [246, 146], 20, -6], [[146, 118], [130, 178], 18, -6],
        // crown and back: locks lying over the skull, tips kicking out
        [[196, 70], [150, 76], 24, 8], [[236, 70], [282, 92], 26, -8], [[270, 96], [304, 150], 22, -8], [[286, 150], [298, 212], 18, -6],
        [[214, 62], [184, 50], 16, 6], [[248, 72], [270, 58], 14, -4],
      ].map(([r, t, w, b], i) => (
        <path key={i} d={lock(r as Pt, t as Pt, w as number, b as number)} fill={i % 3 === 0 ? HAIR_MID : HAIR} />
      ))}
      {/* cold light on the top-left of the hair */}
      {[[[150, 96], [132, 132], 10, -3], [[176, 76], [150, 92], 10, 3], [[200, 68], [180, 62], 8, 2]].map(([r, t, w, b], i) => (
        <path key={`h${i}`} d={lock(r as Pt, t as Pt, w as number, b as number)} fill={HAIR_HI} opacity={0.9} />
      ))}

      {/* round glasses sitting on the nose bridge */}
      <ellipse cx={far.x} cy={eyeY} rx={19} ry={22} fill="none" stroke={DARK} strokeWidth={2.6} />
      <circle cx={near.x} cy={eyeY} r={23} fill="none" stroke={DARK} strokeWidth={2.8} />
      <path d={soft([[175, 196], [186, 191], [194, 196], [192, 199], [186, 195], [177, 199]])} fill={DARK} />
      <path d={poly([[239, 195], [276, 200], [276, 204], [239, 199]])} fill={DARK} />
      <path d={soft([[197, 188], [206, 178], [214, 176], [205, 184], [200, 193]])} fill="#ffffff" opacity={0.6} />

      {/* scarf: chunky, planar */}
      <path d={soft([[178, 356], [216, 360], [226, 438], [214, 474], [178, 472], [168, 424]])} fill={SCARF} />
      <path d={poly([[200, 360], [216, 360], [226, 438], [214, 474], [198, 472], [206, 430]])} fill={SCARF_SH} />
      {[398, 422].map((y) => (
        <path key={y} d={poly([[170, y], [222, y + 2], [223, y + 10], [171, y + 9]])} fill={C.gryffGold} />
      ))}
      <path d={soft([[146, 322], [204, 302], [262, 296], [306, 312], [314, 340], [292, 364], [240, 376], [186, 374], [148, 358], [136, 338]])} fill={SCARF} />
      <path d={poly([[238, 300], [262, 296], [306, 312], [314, 340], [292, 364], [252, 374], [268, 338]])} fill={SCARF_SH} />
      <path d={poly([[152, 332], [210, 316], [270, 312], [306, 326], [305, 338], [270, 326], [210, 330], [154, 346]])} fill={C.gryffGold} />
      <path d={poly([[150, 330], [200, 310], [246, 304], [202, 318]])} fill="#d0484a" opacity={0.7} />

      <rect x={-40} y={20} width={480} height={500} fill={`url(#${id}-fall)`} />
    </g>
  );
};
