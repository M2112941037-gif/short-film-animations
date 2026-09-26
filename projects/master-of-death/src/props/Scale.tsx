import React from 'react';
import {C} from '../theme';

// The balance. Local origin = the suspension ring at the top (where Death's
// fingers hold it). `tilt` in degrees: positive lowers the LEFT pan.
// Pan contents are drawn standing on the pan rim, origin at rim centre.
export const Scale: React.FC<{
  L?: number;
  tilt?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  chain?: number;
  ring?: boolean;
  metal?: string;
  lit?: string;
  stand?: boolean; // a free-standing balance on a pillar and foot, held by no one
}> = ({L = 200, tilt = 0, left, right, chain = 1.05, ring = true, metal = '#15171c', lit = C.brass, stand = false}) => {
  const k = L / 200;
  const pivotY = 64 * k;
  const th = (-tilt * Math.PI) / 180;
  const hang = (side: -1 | 1): [number, number] => {
    const bx = side * L, by = 4 * k;
    return [bx * Math.cos(th) - by * Math.sin(th), pivotY + bx * Math.sin(th) + by * Math.cos(th)];
  };
  const panW = 0.78 * L, panD = 0.13 * L;
  const chainLen = chain * L;

  const pan = (side: -1 | 1, content: React.ReactNode) => {
    const [hx, hy] = hang(side);
    const rimY = hy + chainLen;
    const hookY = hy + 18 * k;
    return (
      <g>
        {/* chains: three strands converge on a small hook ring */}
        <line x1={hx} y1={hy} x2={hx} y2={hookY} stroke={metal} strokeWidth={3 * k} />
        <circle cx={hx} cy={hookY} r={5 * k} fill="none" stroke={lit} strokeWidth={1.6 * k} />
        {[-1, 0, 1].map((s) => (
          <g key={s}>
            <line x1={hx} y1={hookY} x2={hx + s * panW * 0.48} y2={rimY} stroke={metal} strokeWidth={2.6 * k} />
            <line
              x1={hx}
              y1={hookY}
              x2={hx + s * panW * 0.48}
              y2={rimY}
              stroke={lit}
              strokeWidth={1.4 * k}
              strokeDasharray={`${4 * k} ${3 * k}`}
              opacity={s === 0 ? 0.35 : 0.7}
            />
          </g>
        ))}
        {/* bowl */}
        <path
          d={`M${hx - panW / 2},${rimY} Q${hx},${rimY + panD * 2.1} ${hx + panW / 2},${rimY} Z`}
          fill={metal}
          stroke={lit}
          strokeWidth={1.5 * k}
          strokeOpacity={0.55}
        />
        <path
          d={`M${hx - panW * 0.36},${rimY + panD * 0.55} Q${hx - panW * 0.1},${rimY + panD * 1.05} ${hx + panW * 0.18},${rimY + panD * 0.95}`}
          fill="none"
          stroke={lit}
          strokeWidth={2 * k}
          strokeLinecap="round"
          opacity={0.45}
        />
        <ellipse cx={hx} cy={rimY} rx={panW / 2} ry={panD * 0.28} fill={mixDark(metal)} stroke={lit} strokeWidth={1.8 * k} />
        {/* centre drop finial under the bowl */}
        <path d={`M${hx - 5 * k},${rimY + panD * 1.02} L${hx},${rimY + panD * 1.5} L${hx + 5 * k},${rimY + panD * 1.02}Z`} fill={lit} opacity={0.8} />
        <g transform={`translate(${hx} ${rimY})`}>{content}</g>
      </g>
    );
  };

  // beam, drawn in its own rotated frame around the pivot
  const scroll = (s: -1 | 1) =>
    `M${s * (L - 4 * k)},${2 * k} C${s * (L + 14 * k)},${-2 * k} ${s * (L + 16 * k)},${-20 * k} ${s * (L + 4 * k)},${-22 * k} C${s * (L - 6 * k)},${-23 * k} ${s * (L - 6 * k)},${-12 * k} ${s * (L + 2 * k)},${-12 * k}`;

  const footY = pivotY + chainLen + L * 0.42;
  return (
    <g>
      {stand && (
        <g>
          <path d={`M${-5 * k},${pivotY} L${-9 * k},${footY - 22 * k} L${9 * k},${footY - 22 * k} L${5 * k},${pivotY}Z`} fill={metal} />
          <line x1={-3 * k} y1={pivotY + 20 * k} x2={-6 * k} y2={footY - 26 * k} stroke={lit} strokeWidth={1.4 * k} opacity={0.6} />
          <ellipse cx={0} cy={footY} rx={L * 0.34} ry={L * 0.06} fill={metal} stroke={lit} strokeWidth={1.8 * k} />
          <path d={`M${-L * 0.34},${footY} L${-L * 0.3},${footY - 22 * k} L${L * 0.3},${footY - 22 * k} L${L * 0.34},${footY}Z`} fill={metal} />
          <ellipse cx={0} cy={footY - 22 * k} rx={L * 0.3} ry={L * 0.05} fill={metal} stroke={lit} strokeWidth={1.4 * k} />
        </g>
      )}
      {pan(-1, left)}
      {pan(1, right)}
      {ring && (
        <g>
          <circle cx={0} cy={0} r={14 * k} fill="none" stroke={metal} strokeWidth={7 * k} />
          <circle cx={0} cy={0} r={14 * k} fill="none" stroke={lit} strokeWidth={1.6 * k} opacity={0.8} />
        </g>
      )}
      <path
        d={`M${-4 * k},${14 * k} L${-6 * k},${pivotY} L${6 * k},${pivotY} L${4 * k},${14 * k}Z`}
        fill={metal}
      />
      <circle cx={0} cy={30 * k} r={7 * k} fill={metal} stroke={lit} strokeWidth={1.4 * k} />
      <g transform={`rotate(${-tilt} 0 ${pivotY})`}>
        <g transform={`translate(0 ${pivotY})`}>
          <path
            d={`M${-L},${2 * k} Q0,${-16 * k} ${L},${2 * k} L${L},${7 * k} Q0,${-3 * k} ${-L},${7 * k}Z`}
            fill={metal}
            stroke={lit}
            strokeWidth={1.4 * k}
            strokeOpacity={0.75}
          />
          <path d={scroll(-1)} fill="none" stroke={metal} strokeWidth={5 * k} strokeLinecap="round" />
          <path d={scroll(1)} fill="none" stroke={metal} strokeWidth={5 * k} strokeLinecap="round" />
          <path d={scroll(-1)} fill="none" stroke={lit} strokeWidth={1.3 * k} strokeLinecap="round" opacity={0.8} />
          <path d={scroll(1)} fill="none" stroke={lit} strokeWidth={1.3 * k} strokeLinecap="round" opacity={0.8} />
          {[-0.55, 0.55].map((u) => (
            <circle key={u} cx={u * L} cy={-3 * k} r={5 * k} fill={metal} stroke={lit} strokeWidth={1.2 * k} />
          ))}
          {/* pointer */}
          <path d={`M${-4 * k},0 L0,${54 * k} L${4 * k},0Z`} fill={lit} opacity={0.9} />
          <circle cx={0} cy={0} r={13 * k} fill={metal} stroke={lit} strokeWidth={2 * k} />
          <circle cx={0} cy={0} r={4 * k} fill={lit} />
        </g>
      </g>
    </g>
  );
};

const mixDark = (c: string) => c;
