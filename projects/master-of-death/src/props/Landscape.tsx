import React, {useMemo} from 'react';
import {C} from '../theme';
import {Pt, rng, smooth} from '../util';

// Bare winter tree, grown recursively. Snow sits on the upper side of limbs.
export const Tree: React.FC<{
  x: number; y: number; h: number; seed?: string; lean?: number; depth?: number;
  color?: string; snow?: string; snowAmt?: number;
}> = ({x, y, h, seed = 'tree', lean = 0, depth = 6, color = '#0b0e15', snow = C.snow, snowAmt = 0.7}) => {
  const limbs = useMemo(() => {
    const r = rng(seed);
    const out: {a: Pt; b: Pt; wa: number; wb: number; d: number}[] = [];
    // each limb is two kinked segments; children leave at uneven points
    const grow = (a: Pt, ang: number, len: number, w: number, d: number) => {
      const kink = (r() - 0.5) * 0.5;
      const m: Pt = [a[0] + Math.cos(ang) * len * 0.5, a[1] + Math.sin(ang) * len * 0.5];
      const b: Pt = [m[0] + Math.cos(ang + kink) * len * 0.5, m[1] + Math.sin(ang + kink) * len * 0.5];
      const wm = w * 0.84;
      out.push({a, b: m, wa: w, wb: wm, d}, {a: m, b, wa: wm, wb: w * 0.66, d});
      if (d >= depth) return;
      const n = d < 1 ? 3 : r() < 0.35 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1;
        const from = i === 2 ? m : b;
        // branches drift upward: pull the angle toward vertical as they spread
        let na = ang + kink + side * (0.3 + r() * 0.6);
        na = na * 0.85 + (-Math.PI / 2) * 0.15;
        grow(from, na, len * (0.55 + r() * 0.3), (i === 2 ? wm : w) * 0.62, d + 1);
      }
    };
    grow([x, y], -Math.PI / 2 + lean, h * 0.36, h * 0.03, 0);
    return out;
  }, [x, y, h, seed, lean, depth]);
  return (
    <g filter="url(#rough-s)">
      {limbs.map((l, i) => (
        <line key={i} x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke={color} strokeWidth={(l.wa + l.wb)} strokeLinecap="round" />
      ))}
      {limbs.filter((l) => l.d >= 1 && l.d <= 4 && Math.abs(l.b[0] - l.a[0]) > Math.abs(l.b[1] - l.a[1]) * 0.6).map((l, i) => (
        <line key={`s${i}`} x1={l.a[0] + (l.b[0] - l.a[0]) * 0.1} y1={l.a[1] - l.wa * 0.75} x2={l.b[0] - (l.b[0] - l.a[0]) * 0.15} y2={l.b[1] - l.wb * 0.75} stroke={snow} strokeWidth={Math.max(1, l.wb * 0.45)} strokeLinecap="round" opacity={snowAmt * 0.8} />
      ))}
    </g>
  );
};

// Village church silhouette with a steeple and warm lancet windows.
export const Church: React.FC<{x: number; y: number; k?: number; color?: string; window?: string; snow?: string}> = ({
  x, y, k = 1, color = '#121722', window = C.candle, snow = '#c9d1de',
}) => {
  const lancet = (cx: number, cy: number, w: number, h: number) =>
    `M${cx - w / 2},${cy} L${cx - w / 2},${cy - h + w / 2} Q${cx - w / 2},${cy - h} ${cx},${cy - h - w * 0.3} Q${cx + w / 2},${cy - h} ${cx + w / 2},${cy - h + w / 2} L${cx + w / 2},${cy}Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <g filter="url(#rough-s)">
        {/* nave */}
        <path d="M-40,0 L-40,-130 L110,-210 L260,-130 L260,0Z" fill={color} />
        {/* tower + spire */}
        <path d="M-150,0 L-150,-260 L-40,-260 L-40,0Z" fill={color} />
        <path d="M-160,-258 L-95,-470 L-30,-258Z" fill={color} />
        <path d="M-160,-258 L-30,-258 L-30,-246 L-160,-246Z" fill={color} />
        {/* snow on roof slopes */}
        <path d="M-40,-132 L110,-212 L260,-132" fill="none" stroke={snow} strokeWidth={6} opacity={0.8} />
        <path d="M-160,-260 L-95,-470" fill="none" stroke={snow} strokeWidth={4} opacity={0.6} />
      </g>
      <g filter="url(#glow-m)">
        <path d={lancet(30, -40, 22, 60)} fill={window} opacity={0.9} />
        <path d={lancet(110, -40, 22, 60)} fill={window} opacity={0.75} />
        <path d={lancet(190, -40, 22, 60)} fill={window} opacity={0.85} />
        <path d={lancet(-95, -150, 18, 44)} fill={window} opacity={0.6} />
      </g>
    </g>
  );
};

// Distant headstones and crosses, snow-capped, as a single dark band.
export const GraveRow: React.FC<{y: number; x0: number; x1: number; count: number; k?: number; seed?: string; color?: string; snow?: string}> = ({
  y, x0, x1, count, k = 1, seed = 'graves', color = '#161b26', snow = '#b8c1d0',
}) => {
  const stones = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, (_, i) => {
      const x = x0 + ((i + r() * 0.6) / count) * (x1 - x0);
      const kind = r() < 0.3 ? 'cross' : 'stone';
      return {x, kind, h: (40 + r() * 50) * k, w: (26 + r() * 20) * k, tilt: (r() - 0.5) * 10, dy: (r() - 0.5) * 16 * k};
    });
  }, [y, x0, x1, count, k, seed]);
  return (
    <g filter="url(#rough-s)">
      {stones.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${y + s.dy}) rotate(${s.tilt})`}>
          {s.kind === 'cross' ? (
            <>
              <rect x={-s.w * 0.14} y={-s.h * 1.3} width={s.w * 0.28} height={s.h * 1.3} fill={color} />
              <rect x={-s.w * 0.5} y={-s.h * 1.02} width={s.w} height={s.w * 0.26} fill={color} />
              <line x1={-s.w * 0.45} y1={-s.h * 1.03} x2={s.w * 0.45} y2={-s.h * 1.03} stroke={snow} strokeWidth={2 * k} opacity={0.8} />
            </>
          ) : (
            <>
              <path d={`M${-s.w / 2},0 L${-s.w / 2},${-s.h + s.w / 2} A${s.w / 2},${s.w / 2} 0 0 1 ${s.w / 2},${-s.h + s.w / 2} L${s.w / 2},0Z`} fill={color} />
              <path d={`M${-s.w * 0.42},${-s.h + s.w * 0.35} A${s.w / 2},${s.w / 2} 0 0 1 ${s.w * 0.42},${-s.h + s.w * 0.35}`} fill="none" stroke={snow} strokeWidth={2.4 * k} opacity={0.75} />
            </>
          )}
        </g>
      ))}
    </g>
  );
};

// Rolling snow ground: a filled band whose top edge undulates.
export const SnowGround: React.FC<{y: number; amp?: number; seed?: string; fill?: string; edge?: string; w?: number; h?: number}> = ({
  y, amp = 20, seed = 'ground', fill = C.snowShade, edge = C.snowLight, w = 1920, h = 1080,
}) => {
  const d = useMemo(() => {
    const r = rng(seed);
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) pts.push([-100 + (i / 12) * (w + 200), y + (r() - 0.5) * 2 * amp]);
    const top = smooth(pts, false);
    return {top, full: `${top} L${w + 100},${h + 50} L-100,${h + 50}Z`};
  }, [y, amp, seed, w, h]);
  return (
    <g>
      <path d={d.full} fill={fill} filter="url(#brush)" />
      <path d={d.top} fill="none" stroke={edge} strokeWidth={3} opacity={0.6} filter="url(#rough-m)" />
    </g>
  );
};
