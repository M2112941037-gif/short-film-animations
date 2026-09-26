import React, {useMemo} from 'react';
import {C} from '../theme';
import {capsule, mix, Pt, rng, smooth} from '../util';

const INK = '#06070a';

// A small skull for piles and falling debris. ~100 px wide at k=1.
// `turn` −1..1 swings the face sideways; `rim` is the back-light colour.
export const Skull: React.FC<{
  x?: number; y?: number; k?: number; rot?: number; turn?: number;
  fill?: string; rim?: string; rimAmt?: number; jaw?: boolean;
}> = ({x = 0, y = 0, k = 1, rot = 0, turn = 0, fill = C.bone, rim = C.snow, rimAmt = 0.6, jaw = true}) => {
  const t = turn * 14;
  const sq = (px: number) => (px * (1 - Math.abs(turn) * 0.18)) + (px * turn > 0 ? -Math.abs(turn) * 4 : 0);
  const outline: Pt[] = [
    [0, -62], [38, -54], [52, -24], [50, 6], [42, 22], [32, 34], [26, 50], [12, 60], [0, 62],
    [-12, 60], [-26, 50], [-32, 34], [-42, 22], [-50, 6], [-52, -24], [-38, -54],
  ].map(([px, py]) => [sq(px), py] as Pt);
  const eye = (sx: number) => {
    const cx = sx * 20 + t, far = sx * turn < 0 ? 1 - Math.abs(turn) * 0.45 : 1;
    const inner = sx > 0 ? -1 : 1;
    return smooth([[cx + inner * 11 * far, -6], [cx - inner * 2 * far, -14], [cx - inner * 13 * far, -10], [cx - inner * 15 * far, 4], [cx - inner * 4 * far, 12], [cx + inner * 9 * far, 8]], true, 0.3);
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <path d={smooth(outline, true, 0.4)} fill={fill} stroke={INK} strokeWidth={3} />
      {/* shade the lower-right mass so each skull reads as a volume */}
      <path d={smooth([[sq(30), -40], [sq(50), -10], [sq(40), 24], [sq(24), 52], [sq(6), 60], [sq(18), 26], [sq(26), -8]], true, 0.4)} fill={INK} opacity={0.35} />
      <path d={eye(-1)} fill={INK} />
      <path d={eye(1)} fill={INK} />
      <path d={`M${t},16 L${t + 6},30 L${t - 6},30Z`} fill={INK} />
      {jaw && <path d={`M${-18 + t},38 Q${t},44 ${18 + t},38 L${14 + t},46 Q${t},50 ${-14 + t},46Z`} fill={INK} opacity={0.85} />}
      <path d={smooth([[sq(-44), -34], [sq(-26), -56], [sq(4), -62], [sq(28), -56]], false)} fill="none" stroke={rim} strokeWidth={4} opacity={rimAmt} strokeLinecap="round" />
    </g>
  );
};

// A mound of skulls: peak at (px, py), spreading to half-width `spread` at
// baseY. Skulls are laid back-to-front; those near the silhouette catch the
// back light, the rest sink into shadow — a dark mass with a glittering edge.
// A long bone (femur-ish) with knobbed ends.
export const LongBone: React.FC<{x: number; y: number; len: number; rot: number; w?: number; fill?: string; rim?: string; rimAmt?: number}> = ({
  x, y, len, rot, w = 9, fill = C.bone, rim = C.snow, rimAmt = 0.4,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={capsule([-len / 2, 0], [len / 2, 0], w * 0.7, w * 0.7)} fill={fill} stroke={INK} strokeWidth={2.5} />
    {[-1, 1].map((s) => (
      <g key={s}>
        <circle cx={s * len / 2} cy={-w * 0.6} r={w * 0.95} fill={fill} stroke={INK} strokeWidth={2.5} />
        <circle cx={s * len / 2} cy={w * 0.6} r={w * 0.95} fill={fill} stroke={INK} strokeWidth={2.5} />
      </g>
    ))}
    <line x1={-len / 2 + w} y1={-w * 0.55} x2={len / 2 - w} y2={-w * 0.55} stroke={rim} strokeWidth={2.5} opacity={rimAmt} strokeLinecap="round" />
  </g>
);

export const SkullPile: React.FC<{
  px: number; py: number; baseY: number; spread: number; count: number;
  seed?: string; rim?: string; top?: string; bottom?: string; kTop?: number; kBottom?: number;
  growth?: number; // 0..1: how much of the pile exists (it grows bottom-up)
  fallBand?: number; // skulls within this band above the growth front are still falling in
}> = ({px, py, baseY, spread, count, seed = 'pile', rim = C.snow, top = '#7c8292', bottom = '#1c2029', kTop = 0.32, kBottom = 0.95, growth = 1, fallBand = 0}) => {
  const halfAt = (v: number) => spread * Math.pow(v, 0.8);
  const skulls = useMemo(() => {
    const r = rng(seed);
    const out = [] as {x: number; y: number; k: number; rot: number; turn: number; fill: string; rimAmt: number; v: number}[];
    for (let i = 0; i < count; i++) {
      const v = Math.pow(r(), 0.75); // denser toward the base
      const h = halfAt(v);
      const u = (r() * 2 - 1);
      const x = px + u * h;
      const y = py + v * (baseY - py) + (r() - 0.5) * 20;
      const edge = Math.pow(Math.abs(u), 3);
      const lit = r() < 0.07 ? 0.45 : 0;
      out.push({
        x, y, v,
        k: kTop + (kBottom - kTop) * v * (0.75 + r() * 0.5),
        rot: (r() - 0.5) * 70,
        turn: (r() - 0.5) * 1.6,
        fill: mix(mix(top, bottom, v * 0.9 + r() * 0.15), C.bone, lit * (1 - v)),
        rimAmt: Math.min(1, 0.04 + edge * 0.95 + Math.pow(1 - v, 3) * 0.6),
      });
    }
    return out.sort((a, b) => a.y - b.y);
  }, [px, py, baseY, spread, count, seed, top, bottom, kTop, kBottom]);

  const bones = useMemo(() => {
    const r = rng(`${seed}-bones`);
    return Array.from({length: Math.round(count / 9)}, () => {
      const v = 0.12 + Math.pow(r(), 0.8) * 0.85;
      const u = r() * 2 - 1;
      const k = kTop + (kBottom - kTop) * v;
      return {
        x: px + u * halfAt(v), y: py + v * (baseY - py), v,
        len: 150 * k * (0.8 + r() * 0.5), rot: (r() - 0.5) * 150, w: 11 * k,
        fill: mix(top, bottom, v * 0.95), rimAmt: 0.1 + Math.pow(Math.abs(u), 3) * 0.7,
      };
    });
  }, [px, py, baseY, spread, count, seed, top, bottom, kTop, kBottom]);
  // interleave bones with skulls by depth
  const items = [
    ...skulls.map((s) => ({y: s.y, v: s.v, el: <Skull x={s.x} y={s.y} k={s.k} rot={s.rot} turn={s.turn} fill={s.fill} rim={rim} rimAmt={s.rimAmt} />})),
    ...bones.map((b) => ({y: b.y, v: b.v, el: <LongBone x={b.x} y={b.y} len={b.len} rot={b.rot} w={b.w} fill={b.fill} rim={rim} rimAmt={b.rimAmt} />})),
  ].sort((a, b) => a.y - b.y);

  const mound = smooth([
    [px, py + 20], [px + halfAt(0.3), py + 0.3 * (baseY - py)], [px + halfAt(0.7), py + 0.7 * (baseY - py)], [px + spread * 1.05, baseY + 40],
    [px - spread * 1.05, baseY + 40], [px - halfAt(0.7), py + 0.7 * (baseY - py)], [px - halfAt(0.3), py + 0.3 * (baseY - py)],
  ], true, 0.3);
  const cut = 1 - growth;

  return (
    <g filter="url(#rough-s)">
      <clipPath id={`grown-${seed}`}>
        <rect x={px - spread * 1.2} y={py + cut * (baseY - py) + 20} width={spread * 2.4} height={baseY - py + 200} />
      </clipPath>
      <path d={mound} fill="#0a0c11" clipPath={`url(#grown-${seed})`} />
      {items.filter((it) => it.v >= cut).map((it, i) => {
        const p = fallBand > 0 ? (it.v - cut) / fallBand : 1;
        const dy = p < 1 ? -Math.pow(1 - p, 2) * 1100 : 0;
        return dy ? <g key={i} transform={`translate(0 ${dy})`}>{it.el}</g> : <React.Fragment key={i}>{it.el}</React.Fragment>;
      })}
    </g>
  );
};
