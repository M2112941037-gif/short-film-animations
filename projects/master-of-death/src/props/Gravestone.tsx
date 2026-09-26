import React from 'react';
import {EPITAPH} from '../text';
import {C, FONT} from '../theme';
import {Pt, smooth} from '../util';
import {Dabs} from '../fx/Dabs';

// The Potters' white marble headstone at Godric's Hollow.
// Origin: centre of the base at ground level. ~640 × 760 px at k=1.
// `snowCap` 0..1 grows the snow on the arch; `textReveal` 0..1 fades the carving in.
export const Gravestone: React.FC<{k?: number; snowCap?: number; textReveal?: number; warmRim?: number; layer?: 'all' | 'stone' | 'text'}> = ({
  k = 1, snowCap = 1, textReveal = 1, warmRim = 1, layer = 'all',
}) => {
  const w = 560, h = 700, arch = 150;
  const slab = `M${-w / 2},0 L${-w / 2},${-h + arch} C${-w / 2},${-h - arch * 0.25} ${w / 2},${-h - arch * 0.25} ${w / 2},${-h + arch} L${w / 2},0Z`;
  const inset = 26;
  const border = `M${-w / 2 + inset},${-40} L${-w / 2 + inset},${-h + arch + 6} C${-w / 2 + inset},${-h - arch * 0.12 + inset} ${w / 2 - inset},${-h - arch * 0.12 + inset} ${w / 2 - inset},${-h + arch + 6} L${w / 2 - inset},${-40}Z`;
  // snow cap hugging the arch, thicker at the crown, with drips over the edge
  const capPts: Pt[] = [
    [-w / 2 - 8, -h + arch + 14], [-w / 2 + 10, -h + arch - 60], [-w / 4, -h - 14], [0, -h - 26 - 20 * snowCap], [w / 4, -h - 12],
    [w / 2 - 6, -h + arch - 64], [w / 2 + 10, -h + arch + 20], [w / 2 - 6, -h + arch + 4], [w / 2 - 30, -h + arch - 30],
    [w / 4, -h + 18], [0, -h + 8], [-w / 4, -h + 20], [-w / 2 + 30, -h + arch - 26], [-w / 2 + 4, -h + arch + 26],
  ];
  const eng = (x: number, y: number, text: string, size: number, spacing = 0.14, weight = 600) => (
    <g>
      <text x={x + 1.6} y={y + 1.8} fontFamily={FONT.carve} fontWeight={weight} fontSize={size} letterSpacing={`${spacing}em`} textAnchor="middle" fill="#ffffff" opacity={0.65}>{text}</text>
      <text x={x} y={y} fontFamily={FONT.carve} fontWeight={weight} fontSize={size} letterSpacing={`${spacing}em`} textAnchor="middle" fill="#4b5263">{text}</text>
    </g>
  );
  const carving = (
      <g opacity={textReveal}>
          {eng(0, -h + 170, EPITAPH.names[0].name, 40)}
          {eng(0, -h + 206, EPITAPH.names[0].dates, 15, 0.12, 400)}
          {eng(0, -h + 290, EPITAPH.names[1].name, 40)}
          {eng(0, -h + 326, EPITAPH.names[1].dates, 15, 0.12, 400)}
          {/* small carved divider */}
          <path d={`M-60,${-h + 380} L-10,${-h + 380} M10,${-h + 380} L60,${-h + 380}`} stroke="#5b6272" strokeWidth={2} />
          <path d={`M0,${-h + 372} L8,${-h + 380} L0,${-h + 388} L-8,${-h + 380}Z`} fill="#5b6272" />
          {eng(0, -h + 450, 'THE LAST ENEMY THAT SHALL', 25, 0.16)}
          {eng(0, -h + 490, 'BE DESTROYED IS DEATH', 25, 0.16)}
        </g>
  );
  if (layer === 'text') return <g transform={`scale(${k})`}><g transform="translate(0 -40)">{carving}</g></g>;

  return (
    <g transform={`scale(${k})`}>
      <defs>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#eef0f3" />
          <stop offset="0.55" stopColor="#c9ced8" />
          <stop offset="1" stopColor="#7d8698" />
        </linearGradient>
        <linearGradient id="marbleFoot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1b2233" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id="slabClip"><path d={slab} /></clipPath>
      </defs>
      {/* plinth */}
      <path d={`M${-w / 2 - 40},30 L${-w / 2 - 30},-40 L${w / 2 + 30},-40 L${w / 2 + 40},30Z`} fill="#aab2c1" filter="url(#paint)" />
      <path d={`M${-w / 2 - 30},-40 L${w / 2 + 30},-40`} stroke="#f2f4f7" strokeWidth={3} opacity={0.6} />
      <g transform="translate(0 -40)">
        <path d={slab} fill="url(#marble)" filter="url(#paint)" />
        <g clipPath="url(#slabClip)">
          {/* weathering + faint veins */}
          <Dabs x={-w / 2} y={-h - arch} w={w} h={h + arch} count={420} colorAt={() => '#8a93a5'} size={[3, 14]} aspect={2} opacity={[0.05, 0.22]} seed="marble" jitter={0.1} />
          {[[[-240, -560], [-120, -470], [-150, -360], [-40, -260]], [[120, -640], [200, -520], [160, -420], [260, -300]], [[-200, -200], [-60, -150], [40, -60]]].map((v, i) => (
            <path key={i} d={smooth(v as Pt[], false)} fill="none" stroke="#6f7888" strokeWidth={1.4} opacity={0.35} filter="url(#rough-m)" />
          ))}
          <path d={slab} fill="url(#marbleFoot)" />
          {/* warm rim from the church windows behind, on the right edge */}
          <path d={`M${w / 2 - 4},0 L${w / 2 - 4},${-h + arch}`} stroke={C.amber} strokeWidth={10} opacity={0.35 * warmRim} filter="url(#blur-6)" />
        </g>
        <path d={border} fill="none" stroke="#838c9d" strokeWidth={3} opacity={0.7} />
        <path d={border} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.5} transform="translate(1.5 1.5)" />
        {layer !== 'stone' && carving}
        {/* snow resting on the arch — it does not pass through */}
        <g opacity={snowCap > 0 ? 1 : 0}>
          <path d={smooth(capPts, true, 0.4)} fill={C.snowLight} filter="url(#paint)" />
          <path d={smooth(capPts.slice(7), false, 0.4)} fill="none" stroke="#9fb0cc" strokeWidth={5} opacity={0.6} filter="url(#rough-s)" />
        </g>
      </g>
    </g>
  );
};

