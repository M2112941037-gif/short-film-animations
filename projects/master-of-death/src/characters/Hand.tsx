import React from 'react';
import {Pt, smooth} from '../util';

// A real hand, painted in planes like Harry's face. Seen from the thumb
// side, reaching along +x; origin at the wrist. ~260 px long at k=1.
// `curl` 0..1 closes the fingers; `palmUp` shows the open palm from above
// (for holding the stone). `ghost` turns it into a pale, lit, see-through
// hand — the dead, called back by the stone.
export const Hand: React.FC<{k?: number; curl?: number; ghost?: number; sleeve?: string; id?: string}> = ({
  k = 1, curl = 0, ghost = 0, sleeve = '#2a3550', id = 'hand',
}) => {
  const skin = ghost ? '#f6e7cf' : '#e6c7ae';
  const mid = ghost ? '#e9d2b0' : '#c9a18a';
  const shade = ghost ? '#c8b495' : '#9c7c78';
  const S = (pts: Pt[]) => smooth(pts.map(([x, y]) => [x * k, y * k] as Pt), true, 0.42);
  // four fingers, each a chain of three segments bending by `curl`
  // proportions: middle finger ≈ 0.9 × palm length; fingers taper a little
  const fingers = [
    {y: -21, len: [38, 25, 19], w: 15},
    {y: -7, len: [42, 27, 20], w: 15.5},
    {y: 7, len: [39, 25, 19], w: 14.5},
    {y: 19, len: [32, 21, 16], w: 12.5},
  ];
  const fingerPath = (f: (typeof fingers)[number], i: number) => {
    let x = 104, y = f.y, a = (-3 + i * 3) * (Math.PI / 180);
    const top: Pt[] = [], bot: Pt[] = [];
    const push = () => { top.push([x - Math.sin(a) * f.w * 0.5, y + Math.cos(a) * -f.w * 0.5]); bot.push([x + Math.sin(a) * f.w * 0.5, y + Math.cos(a) * f.w * 0.5]); };
    push();
    f.len.forEach((len, s) => {
      a += curl * (0.5 + s * 0.35);
      x += Math.cos(a) * len;
      y += Math.sin(a) * len;
      push();
    });
    const tip: Pt = [x + Math.cos(a) * f.w * 0.45, y + Math.sin(a) * f.w * 0.45];
    return S([...top, tip, ...bot.reverse()]);
  };
  const palm = S([[0, -19], [40, -25], [100, -29], [112, -8], [109, 26], [64, 30], [20, 25], [0, 17]]);
  const thumb = S([[28, -22], [56, -38], [82, -44], [97, -43], [99, -35], [84, -30], [62, -22], [42, -10]]);
  return (
    <g opacity={ghost ? 0.62 : 1}>
      {ghost > 0 && <ellipse cx={130 * k} cy={0} rx={190 * k} ry={80 * k} fill={`url(#${id}-glow)`} />}
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* sleeve */}
      <path d={S([[-90, -40], [4, -34], [10, 34], [-90, 44]])} fill={ghost ? '#d8cab0' : sleeve} opacity={ghost ? 0.5 : 1} />
      <path d={S([[-90, 14], [8, 12], [10, 34], [-90, 44]])} fill="#000" opacity={0.25} />
      {fingers.slice().reverse().map((f, i) => (
        <path key={i} d={fingerPath(f, 3 - i)} fill={i === 0 ? shade : i === 1 ? mid : skin} />
      ))}
      <path d={palm} fill={skin} />
      <path d={S([[20, 6], [70, 9], [108, 6], [109, 26], [64, 30], [20, 25]])} fill={mid} />
      <path d={thumb} fill={skin} />
      <path d={S([[56, -26], [80, -36], [96, -38], [84, -31], [62, -22]])} fill={mid} opacity={0.8} />
      {/* knuckle highlights */}
      {[-21, -7, 7].map((y) => (
        <ellipse key={y} cx={108 * k} cy={(y - 2) * k} rx={5 * k} ry={3 * k} fill="#fff" opacity={ghost ? 0.4 : 0.18} />
      ))}
    </g>
  );
};
