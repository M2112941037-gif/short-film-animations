import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {HarrySilhouette, MiniSilhouette, VoldemortSilhouette} from '../characters/Figures';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB, rgba, type Ctx, type P} from '../paint/canvas';
import {drawDeath, drawSleeve} from '../paint/death';
import {Painted} from '../paint/Painted';
import {Scale} from '../props/Scale';
import {C, H, W} from '../theme';

// A giant pan seen close: brass bowl at the bottom of frame, its chains
// rising and dissolving into the dark — only the lower part is real.
const BigPan: React.FC<{x: number; y: number; rx: number; id: string; children?: React.ReactNode}> = ({x, y, rx, id, children}) => {
  const ry = rx * 0.1;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={x - rx * 1.5} y={y - 700} width={rx * 3} height={720}>
          <rect x={x - rx * 1.5} y={y - 700} width={rx * 3} height={720} fill={`url(#${id}-fade)`} />
        </mask>
        <linearGradient id={`${id}-bowl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5332" />
          <stop offset="1" stopColor="#120e0a" />
        </linearGradient>
      </defs>
      <g mask={`url(#${id}-mask)`} filter="url(#blur-1.5)">
        {[-0.92, 0, 0.92].map((s) => (
          <g key={s}>
            <line x1={x + s * rx} y1={y} x2={x} y2={y - 900} stroke="#16140f" strokeWidth={8} />
            <line x1={x + s * rx} y1={y} x2={x} y2={y - 900} stroke={C.brass} strokeWidth={3} strokeDasharray="12 8" opacity={s === 0 ? 0.4 : 0.8} />
          </g>
        ))}
      </g>
      <path d={`M${x - rx},${y} Q${x},${y + ry * 5} ${x + rx},${y}Z`} fill={`url(#${id}-bowl)`} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#1a1510" stroke="#e2bd78" strokeWidth={3} />
      <g transform={`translate(${x} ${y + ry * 0.2})`}>{children}</g>
      <path d={`M${x - rx},${y} Q${x},${y + ry * 2.2} ${x + rx},${y}`} fill="none" stroke="#f3d696" strokeWidth={2} opacity={0.7} />
    </g>
  );
};

// 00:04 — Death holds the balance; from its two small pans the light throws
// the two people out, large, onto pans of their own at the front of frame.
export const SF01Death: React.FC<{frame?: number; tilt?: number}> = ({frame = 40, tilt = 1.5}) => {
  const t = frame / 24;
  const ring: P = [960, 486];
  const L = 180;
  const glow: P = [960, 600];
  const panL: P = [780, 738];
  const panR: P = [1140, 738];
  const bigL: P = [330, 1046];
  const bigR: P = [1590, 1046];

  const backdrop = (ctx: Ctx, noise: Parameters<NonNullable<React.ComponentProps<typeof Painted>['before']>>[1]) => {
    noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0014, t: t * 0.05, warp: 0.6}, (x, y, n) => {
      const pool = Math.exp(-(((x - 960) / 560) ** 2 + ((y - 40) / 380) ** 2));
      // white mist rolling in low on both sides, where the big figures stand
      const mist = Math.exp(-(((y - 880) / 260) ** 2)) * (0.35 + 0.65 * Math.min(1, Math.abs(x - 960) / 700));
      const v = Math.max(0, Math.min(1, pool * (0.8 + n * 0.5) + mist * (0.55 + n * 1.1) + n * 0.12 + 0.05));
      const [r, g, b] = rampRGB([[0, '#05070b'], [0.25, '#121925'], [0.5, '#2c3850'], [0.75, '#6a7a9c'], [1, '#d4dcea']], v);
      return [r, g, b, 1];
    });
    drawDeath(ctx, noise, {cx: 960, cy: 300, k: 0.9, t, rim: '#7888aa', glow, glowAmt: 1});
    drawSleeve(ctx, noise, [640, 610], [826, 474], {w: 118, t, rim: '#7888aa'});
  };

  // light thrown from each small pan out to its big double
  const beams = (ctx: Ctx, a: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(22px)';
    for (const [from, to, spread] of [[panL, [bigL[0] + 60, 640], 260], [panR, [bigR[0] - 60, 700], 240]] as [P, P, number][]) {
      const g = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
      g.addColorStop(0, rgba('#dfe6f3', 0.75 * a));
      g.addColorStop(0.6, rgba('#cfd8ea', 0.25 * a));
      g.addColorStop(1, rgba('#cfd8ea', 0.08 * a));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(from[0], from[1] - 20);
      ctx.lineTo(to[0], to[1] - spread);
      ctx.lineTo(to[0], to[1] + spread * 1.4);
      ctx.lineTo(from[0], from[1] + 20);
      ctx.closePath();
      ctx.fill();
    }
    const cg = ctx.createRadialGradient(glow[0], glow[1], 10, glow[0], glow[1], 360);
    cg.addColorStop(0, rgba('#e3e9f5', 0.45 * a));
    cg.addColorStop(1, rgba('#e3e9f5', 0));
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  const under = (
    <>
      <g transform={`translate(${ring[0]} ${ring[1]})`}>
        <Scale
          L={L}
          tilt={tilt}
          left={<MiniSilhouette who="voldemort" k={1} />}
          right={<MiniSilhouette who="harry" k={1.05} />}
        />
      </g>
      <g transform={`translate(${ring[0] - 142} ${ring[1] - 18}) rotate(14)`}>
        <BoneHand k={1.22} curl={0.62} spread={0.75} thumb={0.8} hook={0.7} />
      </g>
      <BigPan x={bigL[0]} y={bigL[1]} rx={300} id="panL">
        <VoldemortSilhouette k={5.6} rim="#e8eef8" />
      </BigPan>
      <BigPan x={bigR[0]} y={bigR[1]} rx={280} id="panR">
        <g transform="scale(-1 1)">
          <HarrySilhouette k={5.1} rim="#e8eef8" />
        </g>
      </BigPan>
    </>
  );

  return (
    <AbsoluteFill style={{background: '#05070b'}}>
      <Filters />
      <Painted
        renderKey={`sf01-${frame}`}
        before={(ctx, noise) => {
          backdrop(ctx, noise);
          beams(ctx, 0.6);
        }}
        under={under}
        flow="swirl"
        after={(ctx) => beams(ctx, 0.5)}
      />
      <Snow frame={frame} layer="far" count={160} seed="sf1" wind={0.2} color="#c9d2e2" />
      <Snow frame={frame} layer="mid" count={40} seed="sf1" wind={0.2} color="#dfe5ef" />
      <Snow frame={frame} layer="near" count={7} seed="sf1" wind={0.2} opacity={0.6} />
      <Surface grainSeed={frame} vignette={0.6} paper={0.6} />
    </AbsoluteFill>
  );
};
