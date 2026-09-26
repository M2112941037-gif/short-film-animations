import React from 'react';
import {C} from '../theme';
import {ink, Pt, smooth} from '../util';

// Harry, head and shoulders, three-quarter view facing left: drawn the way a
// graphic-novel artist would — tapered ink lines, flat colour, halftone in
// the shadows. Local box 0..400 × 0..500. Key light from upper left.
const INK = '#120f16';
const SKIN = '#e9cfb8';
const SKIN_SH = '#b68d78';
const HAIR = '#14131a';
const HAIR_HI = '#3b4a6c';
const COAT = '#26314a';
const COAT_SH = '#161d2f';
const SCARF = '#a8262c';
const SCARF_SH = '#6c161b';

const P = (pts: Pt[]) => smooth(pts, true, 0.42);

export const HarryInk: React.FC<{id?: string; mood?: number}> = ({id = 'h'}) => {
  const dots = `${id}-dots`;
  const dotsFine = `${id}-dots-fine`;
  // three-quarter view: the face's midline runs left of centre (x≈172 at the
  // eyes, ≈160 at the mouth); the far eye is foreshortened against the nose
  // bridge and the nose stays inside the far cheek's contour
  const face: Pt[] = [
    [176, 90], [224, 86], [258, 102], [278, 138], [284, 176], [281, 212], [270, 246], [254, 272], [228, 292], [200, 303], [174, 302],
    [156, 292], [144, 276], [137, 258], [133, 238], [130, 214], [132, 192], [131, 172], [134, 150], [144, 124], [158, 104],
  ];
  const faceShadow: Pt[] = [[250, 96], [280, 130], [291, 176], [286, 212], [272, 246], [254, 272], [228, 292], [206, 300], [232, 268], [246, 232], [250, 190], [246, 150], [236, 118]];
  const hair: Pt[] = [
    [124, 178], [112, 156], [114, 128], [124, 104], [138, 84], [132, 66], [152, 72], [164, 52], [182, 62], [200, 46], [214, 58],
    [236, 42], [246, 60], [270, 58], [284, 70], [300, 84], [312, 106], [324, 118], [312, 132], [320, 158], [308, 176], [312, 204],
    [298, 224], [296, 246], [284, 232], [282, 204], [280, 170], [272, 140], [262, 122],
    // the fringe: a few heavy locks swept toward the far side, one falling low
    [248, 130], [238, 116], [222, 142], [212, 122], [196, 150], [186, 124], [168, 156], [160, 130], [146, 166], [140, 140], [130, 170],
  ];
  const neck: Pt[] = [[210, 292], [256, 262], [264, 314], [272, 352], [214, 362], [206, 330]];
  const coat: Pt[] = [[-20, 520], [10, 440], [70, 392], [150, 364], [206, 372], [276, 366], [330, 378], [384, 410], [420, 470], [430, 520]];
  const scarf: Pt[] = [[146, 322], [204, 302], [262, 296], [306, 312], [314, 340], [292, 364], [240, 376], [186, 374], [148, 358], [136, 338]];
  const tail: Pt[] = [[178, 356], [216, 360], [226, 438], [214, 474], [178, 472], [168, 424]];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fall`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="#0a0f1c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#0a0f1c" stopOpacity="0.28" />
          <stop offset="1" stopColor="#05070d" stopOpacity="0.72" />
        </linearGradient>
        <pattern id={dots} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="3.5" cy="3.5" r="1.6" fill={INK} />
        </pattern>
        <pattern id={dotsFine} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="2.5" cy="2.5" r="0.9" fill={INK} />
        </pattern>
      </defs>

      {/* shoulders: dark jacket, halftone shadow side */}
      <path d={P(coat)} fill={COAT} />
      <path d={P([[206, 372], [276, 366], [330, 378], [384, 410], [420, 470], [430, 520], [240, 520], [250, 440]])} fill={COAT_SH} />
      <path d={ink([[-10, 470], [30, 420], [90, 384], [150, 364]], 5, 0.7)} fill={INK} />
      <path d={ink([[300, 374], [360, 398], [404, 444], [424, 500]], 6, 0.6)} fill={INK} />
      <path d={ink([[118, 380], [140, 430], [150, 500]], 3.2, 0.9)} fill={INK} />

      {/* neck in shadow under the jaw */}
      <path d={P(neck)} fill={SKIN} />
      <path d={P([[210, 292], [256, 262], [262, 300], [236, 318], [212, 318]])} fill={SKIN_SH} />
      <path d={ink([[256, 266], [262, 310], [272, 352]], 3.4, 0.8)} fill={INK} />

      {/* the face */}
      <path d={P(face)} fill={SKIN} />
      <path d={P(faceShadow)} fill={SKIN_SH} />
      {/* soft shadows: eye sockets, under the nose, under the lip */}
      <path d={P([[182, 186], [206, 178], [230, 186], [228, 196], [206, 190], [184, 196]])} fill={SKIN_SH} opacity={0.6} />
      <path d={P([[150, 246], [166, 246], [170, 252], [154, 254]])} fill={SKIN_SH} opacity={0.9} />
      <path d={P([[172, 196], [182, 230], [170, 244], [166, 222]])} fill={SKIN_SH} opacity={0.55} />
      <path d={P([[154, 278], [182, 278], [174, 286], [160, 285]])} fill={SKIN_SH} opacity={0.7} />
      {/* cheek warmth */}
      <ellipse cx={176} cy={236} rx={20} ry={11} fill="#d98f7e" opacity={0.1} />

      {/* ear */}
      <path d={P([[268, 188], [284, 192], [292, 212], [284, 234], [268, 238], [272, 212]])} fill={SKIN_SH} />
      <path d={ink([[270, 190], [288, 196], [292, 216], [282, 234], [268, 238]], 3, 0.8)} fill={INK} />
      <path d={ink([[276, 204], [282, 214], [276, 226]], 2, 0.9)} fill={INK} />

      {/* face contour: heavier on the shadow side, light on the lit brow */}
      <path d={ink([[144, 124], [134, 150], [131, 172], [132, 192], [130, 214], [133, 238], [137, 258]], 2.6, 0.9, 0.6)} fill={INK} />
      <path d={ink([[137, 258], [144, 276], [156, 292], [174, 302], [200, 303], [228, 292], [254, 272], [270, 250]], 4.2, 0.8, 0.55)} fill={INK} />
      {/* nose: bridge on the near side, rounded tip, the near nostril's wing */}
      <path d={ink([[174, 186], [168, 206], [158, 226], [150, 236]], 2.2, 0.9, 0.7)} fill={INK} />
      <path d={ink([[146, 240], [152, 245], [160, 244]], 2.4, 0.7)} fill={INK} />
      <path d={ink([[162, 236], [170, 240], [166, 246]], 2.2, 0.8)} fill={INK} />

      {/* mouth: closed, the corners pulled down — a boy trying not to cry */}
      <path d={ink([[146, 268], [158, 270], [172, 269], [188, 272]], 3, 0.85, 0.4)} fill={INK} />
      <path d={ink([[160, 280], [176, 280]], 1.6, 0.9)} fill={INK} opacity={0.6} />

      {/* eyes: the far one small, the near one wide and wet */}
      <path d={P([[140, 194], [148, 188], [160, 190], [156, 198], [146, 199]])} fill="#f3eee6" />
      <ellipse cx={150} cy={194} rx={3.6} ry={4.8} fill={C.harryGreen} />
      <ellipse cx={150} cy={194} rx={1.6} ry={2.2} fill={INK} />
      <path d={ink([[139, 193], [148, 187], [161, 189]], 2.8, 0.7)} fill={INK} />
      <path d={P([[186, 194], [198, 185], [214, 184], [228, 192], [216, 202], [198, 203]])} fill="#f4efe8" />
      <circle cx={206} cy={194} r={8.4} fill={C.harryGreen} />
      <circle cx={206} cy={194} r={8.4} fill="none" stroke="#1c4d33" strokeWidth={1.4} />
      <circle cx={206.5} cy={194.5} r={3.6} fill={INK} />
      <circle cx={202.5} cy={190} r={2.2} fill="#fff" />
      <circle cx={211} cy={198.5} r={1} fill="#fff" opacity={0.8} />
      <path d={ink([[184, 195], [196, 185], [212, 182], [229, 191]], 3.6, 0.7, 0.45)} fill={INK} />
      <path d={ink([[192, 203], [208, 204], [222, 200]], 1.4, 0.9)} fill={INK} opacity={0.7} />
      {/* brows lifted at the inner ends: worry */}
      <path d={ink([[137, 174], [148, 169], [161, 169]], 4, 0.7, 0.35)} fill={HAIR} />
      <path d={ink([[182, 167], [198, 163], [216, 166], [234, 175]], 5, 0.7, 0.3)} fill={HAIR} />

      {/* the scar */}
      <path d={ink([[198, 116], [189, 131], [198, 133], [187, 150]], 2.4, 0.5)} fill="#9d4a47" />

      {/* hair: one dark mass, a few cold highlights along its clumps */}
      <path d={P(hair)} fill={HAIR} />
      {[
        [[150, 96], [170, 76], [196, 66]],
        [[206, 70], [230, 60], [254, 66]],
        [[132, 124], [144, 104], [160, 94]],
        [[270, 84], [292, 100], [304, 124]],
        [[176, 104], [196, 94], [214, 96]],
      ].map((c, i) => (
        <path key={i} d={ink(c as Pt[], 3.4, 0.9)} fill={HAIR_HI} opacity={0.9} />
      ))}
      <path d={ink(hair.slice(0, 29), 3, 0.3)} fill={INK} opacity={0.9} />
      {/* cold key light catching the top of the hair and the brow edge */}
      <path d={ink([[118, 150], [120, 118], [136, 90], [160, 70], [190, 58]], 3.2, 0.9)} fill="#9fb0cf" opacity={0.55} />
      <path d={ink([[146, 124], [136, 146], [129, 170]], 2.2, 0.9)} fill="#f6e8da" opacity={0.6} />

      {/* round glasses */}
      <ellipse cx={149} cy={196} rx={13} ry={22} fill="#dfe7f2" opacity={0.08} />
      <circle cx={206} cy={195} r={27} fill="#dfe7f2" opacity={0.08} />
      <ellipse cx={149} cy={196} rx={13} ry={22} fill="none" stroke={INK} strokeWidth={2.8} />
      <circle cx={206} cy={195} r={27} fill="none" stroke={INK} strokeWidth={3.4} />
      <path d={ink([[162, 192], [171, 187], [180, 191]], 3, 0.3)} fill={INK} />
      <path d={ink([[233, 190], [252, 194], [272, 200]], 3, 0.4)} fill={INK} />
      <path d={ink([[186, 180], [194, 172], [204, 169]], 2.6, 0.9)} fill="#ffffff" opacity={0.75} />

      {/* Gryffindor scarf: chunky knit, the one warm thing in the frame */}
      <path d={P(tail)} fill={SCARF} />
      {[398, 420].map((y) => (
        <path key={y} d={P([[171, y], [222, y + 2], [223, y + 10], [172, y + 9]])} fill={C.gryffGold} />
      ))}
      <path d={P(scarf)} fill={SCARF} />
      <path d={P([[240, 300], [262, 296], [306, 312], [314, 340], [292, 364], [252, 372], [268, 336]])} fill={SCARF_SH} />
      <path d={P([[152, 334], [210, 318], [270, 314], [306, 328], [305, 338], [270, 326], [210, 330], [154, 346]])} fill={C.gryffGold} />
      <path d={ink([[140, 330], [180, 306], [230, 298], [280, 300], [312, 318]], 3.4, 0.6)} fill={INK} />
      <path d={ink([[146, 360], [200, 376], [256, 374], [300, 360]], 3.6, 0.6)} fill={INK} />
      <path d={ink([[172, 360], [168, 420], [178, 470], [214, 474], [226, 440], [218, 362]], 3.2, 0.5)} fill={INK} />
      {[[190, 314, 196, 364], [230, 306, 236, 370], [270, 306, 276, 364]].map(([x1, y1, x2, y2], i) => (
        <path key={i} d={ink([[x1, y1], [x2, y2]], 1.6, 0.9)} fill={SCARF_SH} opacity={0.8} />
      ))}
      <rect x={-40} y={20} width={480} height={500} fill={`url(#${id}-fall)`} />
    </g>
  );
};
