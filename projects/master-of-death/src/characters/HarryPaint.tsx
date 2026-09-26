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

export const HarryPaint: React.FC<{id?: string}> = ({id = 'hp'}) => {
  const face: Pt[] = [
    [172, 84], [224, 80], [260, 98], [282, 136], [288, 178], [284, 216], [272, 250], [254, 276], [228, 296], [200, 306], [174, 304],
    [155, 293], [143, 276], [136, 256], [132, 234], [129, 210], [130, 188], [129, 168], [133, 146], [143, 120], [156, 98],
  ];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fall`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="#0a0f1c" stopOpacity="0" />
          <stop offset="0.55" stopColor="#0a0f1c" stopOpacity="0.25" />
          <stop offset="1" stopColor="#05070d" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* shoulders */}
      <path d={soft([[-20, 520], [10, 440], [70, 392], [150, 366], [206, 374], [276, 368], [330, 380], [384, 412], [420, 470], [430, 520]])} fill={COAT} />
      <path d={poly([[236, 374], [300, 372], [352, 392], [398, 432], [424, 520], [262, 520], [270, 450]])} fill={COAT_SH} />
      <path d={poly([[60, 404], [118, 382], [132, 430], [118, 520], [70, 520]])} fill="#34416a" opacity={0.7} />

      {/* neck: mostly in the jaw's shadow */}
      <path d={soft([[208, 294], [256, 264], [266, 318], [274, 356], [212, 366], [204, 330]])} fill={SKIN_MID} />
      <path d={poly([[208, 294], [258, 262], [264, 304], [236, 322], [210, 318]])} fill={SKIN_SH} />

      {/* face: base, then planes */}
      <path d={soft(face)} fill={SKIN} />
      {/* big shadow plane on the far-from-light side of the head */}
      <path d={poly([[244, 92], [276, 128], [288, 178], [284, 216], [272, 250], [254, 276], [228, 296], [206, 304], [226, 272], [240, 238], [246, 198], [242, 152], [232, 118]])} fill={SKIN_SH} />
      {/* half-tone between light and shadow */}
      <path d={poly([[232, 118], [242, 152], [246, 198], [240, 238], [226, 272], [212, 290], [218, 252], [226, 212], [228, 170], [222, 132]])} fill={SKIN_MID} />
      {/* eye socket and brow shadow */}
      <path d={poly([[178, 180], [198, 172], [230, 176], [238, 190], [226, 186], [200, 184], [182, 190]])} fill={SKIN_MID} />
      <path d={poly([[134, 180], [150, 176], [166, 180], [168, 190], [152, 186], [136, 190]])} fill={SKIN_MID} />
      {/* nose: a lit wedge with its shadow side toward us, cast shadow below */}
      <path d={poly([[174, 190], [184, 222], [174, 244], [158, 248], [164, 236], [170, 214]])} fill={SKIN_MID} />
      <path d={poly([[176, 222], [182, 234], [174, 246], [166, 246]])} fill={SKIN_SH} />
      <path d={poly([[148, 250], [174, 248], [180, 256], [156, 258]])} fill={SKIN_SH} />
      <path d={poly([[150, 238], [160, 234], [164, 242], [154, 246]])} fill="#f6e2cf" />
      {/* warm bounce on the cheek, cool shadow under the lip and chin */}
      <path d={soft([[150, 222], [178, 214], [200, 226], [186, 244], [158, 246]])} fill={WARM} opacity={0.35} />
      <path d={poly([[158, 278], [186, 278], [180, 288], [164, 288]])} fill={SKIN_SH} opacity={0.8} />
      <path d={poly([[160, 300], [200, 306], [228, 296], [214, 312], [178, 314]])} fill={SKIN_SH} />
      {/* mouth: a shape, not a line — lips pressed, corners down */}
      <path d={poly([[148, 268], [160, 266], [174, 267], [190, 271], [176, 273], [160, 272]])} fill="#6b3d3d" />
      <path d={poly([[156, 274], [178, 275], [172, 280], [160, 279]])} fill="#c9887c" opacity={0.7} />
      {/* ear */}
      <path d={soft([[266, 186], [286, 190], [294, 212], [286, 236], [266, 240], [272, 212]])} fill={SKIN_MID} />
      <path d={poly([[276, 200], [286, 206], [284, 226], [276, 230], [280, 214]])} fill={SKIN_SH} />

      {/* eyes: a little larger than life — the far one foreshortened */}
      <path d={soft([[138, 196], [148, 186], [162, 188], [160, 200], [146, 203]])} fill="#f1ece4" />
      <ellipse cx={151} cy={195} rx={4.6} ry={6.2} fill={C.harryGreen} />
      <ellipse cx={151} cy={195} rx={2.1} ry={2.9} fill={DARK} />
      <path d={poly([[136, 194], [146, 184], [164, 186], [163, 190], [147, 189], [138, 197]])} fill={DARK} />
      <path d={soft([[180, 198], [194, 184], [214, 181], [234, 192], [220, 207], [196, 208]])} fill="#f4efe8" />
      <circle cx={208} cy={195} r={11.5} fill={C.harryGreen} />
      <path d={`M${197},${195} A11.5,11.5 0 0 0 ${219},${195} Z`} fill="#2e8a55" />
      <circle cx={208.5} cy={196} r={4.8} fill={DARK} />
      <circle cx={203} cy={190} r={3} fill="#fff" />
      <circle cx={214} cy={201} r={1.3} fill="#fff" opacity={0.8} />
      {/* upper lid as a heavy dark shape, the way a painter would block it */}
      <path d={poly([[178, 198], [192, 182], [214, 177], [238, 190], [236, 195], [214, 184], [194, 187], [182, 200]])} fill={DARK} />
      <path d={poly([[190, 207], [210, 209], [226, 203], [222, 207], [208, 212], [192, 210]])} fill={SKIN_SH} opacity={0.8} />
      {/* brows: blocky, inner ends lifted */}
      <path d={poly([[134, 176], [148, 168], [164, 166], [162, 172], [148, 174], [136, 180]])} fill={HAIR} />
      <path d={poly([[180, 168], [198, 160], [220, 162], [240, 172], [236, 176], [218, 168], [198, 167], [182, 174]])} fill={HAIR} />
      {/* the scar */}
      <path d={poly([[200, 112], [190, 128], [198, 129], [188, 146], [192, 146], [202, 131], [195, 130], [204, 113]])} fill="#a3514c" />

      {/* hair: three values in big angular chunks */}
      <path d={poly([
        [124, 178], [110, 150], [112, 118], [126, 92], [118, 70], [146, 72], [153, 54], [176, 60], [194, 42], [214, 56], [238, 40],
        [252, 60], [280, 58], [292, 76], [316, 84], [312, 104], [336, 118], [316, 134], [330, 160], [310, 172], [318, 204], [300, 222],
        [302, 250], [284, 236], [284, 204], [280, 170], [270, 142], [262, 124], [248, 136], [240, 116], [224, 146], [212, 120],
        [196, 154], [188, 122], [168, 160], [162, 128], [148, 170], [142, 138], [132, 172],
      ])} fill={HAIR} />
      <path d={poly([[252, 60], [282, 54], [290, 78], [314, 84], [306, 106], [322, 124], [296, 128], [280, 104], [262, 88]])} fill={HAIR_MID} />
      <path d={poly([[196, 40], [212, 58], [236, 38], [246, 62], [226, 72], [204, 74], [184, 66]])} fill={HAIR_MID} />
      <path d={poly([[118, 76], [146, 78], [150, 52], [170, 64], [158, 88], [134, 104], [120, 104]])} fill={HAIR_HI} />
      <path d={poly([[176, 62], [194, 38], [206, 56], [190, 76], [172, 84]])} fill={HAIR_HI} />
      <path d={poly([[114, 120], [128, 98], [140, 110], [124, 136]])} fill={HAIR_HI} opacity={0.8} />
      <path d={poly([[190, 124], [206, 108], [212, 122], [198, 150]])} fill={HAIR_MID} />
      <path d={poly([[160, 134], [176, 112], [184, 124], [168, 156]])} fill={HAIR_MID} />

      {/* round glasses: thin, the near lens catching a slice of light */}
      <circle cx={208} cy={196} r={27} fill="none" stroke={DARK} strokeWidth={3} />
      <ellipse cx={150} cy={196} rx={13} ry={22} fill="none" stroke={DARK} strokeWidth={2.6} />
      <path d={poly([[163, 190], [172, 186], [182, 190], [181, 193], [172, 190], [164, 193]])} fill={DARK} />
      <path d={poly([[234, 190], [276, 198], [276, 202], [234, 195]])} fill={DARK} />
      <path d={poly([[186, 184], [196, 172], [206, 170], [196, 180], [190, 190]])} fill="#ffffff" opacity={0.7} />

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
