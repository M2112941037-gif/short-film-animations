import React from 'react';

// One snowflake, drawn properly: six feathered arms, a hexagonal heart.
export const Flake: React.FC<{r: number; rot?: number; opacity?: number; soft?: boolean}> = ({r, rot = 0, opacity = 1, soft = false}) => {
  const q = Math.sin(Math.PI / 3), h = Math.cos(Math.PI / 3);
  const arm = (
    <>
      <line x1={0} y1={0} x2={0} y2={-r} />
      {[[0.3, 0.32], [0.52, 0.27], [0.72, 0.18], [0.88, 0.09]].map(([u, l]) => (
        <path key={u} d={`M${-q * l * r},${-u * r - h * l * r} L0,${-u * r} L${q * l * r},${-u * r - h * l * r}`} />
      ))}
    </>
  );
  const star = (stroke: string, w: number) => (
    <g stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {[0, 60, 120, 180, 240, 300].map((a) => <g key={a} transform={`rotate(${a})`}>{arm}</g>)}
      <path d={[0, 1, 2, 3, 4, 5].map((i) => `${i ? 'L' : 'M'}${0.17 * r * Math.sin((i * Math.PI) / 3)},${-0.17 * r * Math.cos((i * Math.PI) / 3)}`).join(' ') + 'Z'} />
    </g>
  );
  return (
    <g transform={`rotate(${rot})`} opacity={opacity} filter={soft ? 'url(#blur-3)' : undefined}>
      <g filter="url(#blur-6)" opacity={0.7}>{star('#e8f0ff', r * 0.16)}</g>
      <g transform={`translate(${r * 0.02} ${r * 0.03})`}>{star('#8ea6cc', r * 0.07)}</g>
      {star('#ffffff', r * 0.055)}
    </g>
  );
};
