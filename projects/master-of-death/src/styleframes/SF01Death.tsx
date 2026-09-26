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
import {rasterize} from '../paint/rasterize';
import {Scale} from '../props/Scale';
import {C, H, px, RES, W} from '../theme';

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
// Rim colours: the duel's two lights, worn by the two who will cast them.
const RIM_V = '#2f9a64';
const RIM_H = '#b8352c';

export type Camera = {z: number; cx: number; cy: number};

// `cam` frames the world (zoom z around world point cx, cy); `proj` 0..1
// brings in the two big projected figures; `fade` 0..1 lifts from black.
export const SF01Death: React.FC<{frame?: number; tilt?: number; cam?: Camera; proj?: number; fade?: number}> = ({
  frame = 40, tilt = 1.5, cam = {z: 1, cx: W / 2, cy: H / 2}, proj = 1, fade = 1,
}) => {
  const t = frame / 24;
  const {z} = cam;
  const tx = W / 2 - cam.cx * z, ty = H / 2 - cam.cy * z;
  const camT = `translate(${tx} ${ty}) scale(${z})`;
  const withCam = (ctx: Ctx, fn: () => void) => {
    ctx.save();
    ctx.transform(z, 0, 0, z, tx, ty);
    fn();
    ctx.restore();
  };
  const ring: P = [960, 486];
  const L = 180;
  const glow: P = [960, 600];
  const panL: P = [780, 738];
  const panR: P = [1140, 738];
  const bigL: P = [330, 1046];
  const bigR: P = [1590, 1046];

  // A top light falling on Death from far above the frame: one soft column
  // with a few faint shafts drifting inside it. The source is off-screen, so
  // the hood crown is lit and the face stays in darkness.
  const rays = (ctx: Ctx, noise: {n3: (x: number, y: number, z: number) => number}, amt = 1) => {
    // drawn at quarter resolution, then scaled up: the upscale is the blur
    const q = 4;
    const off = document.createElement('canvas');
    off.width = W / q;
    off.height = H / q;
    const rc = off.getContext('2d')!;
    rc.scale(1 / q, 1 / q);
    const cone = (x0: number, w0: number, x1: number, w1: number, y1: number, a: number) => {
      const g = rc.createLinearGradient(0, -60, 0, y1);
      g.addColorStop(0, rgba('#a9b8d4', a));
      g.addColorStop(0.55, rgba('#a9b8d4', a * 0.45));
      g.addColorStop(1, rgba('#a9b8d4', 0));
      rc.fillStyle = g;
      rc.beginPath();
      rc.moveTo(x0 - w0, -60);
      rc.lineTo(x0 + w0, -60);
      rc.lineTo(x1 + w1, y1);
      rc.lineTo(x1 - w1, y1);
      rc.closePath();
      rc.fill();
    };
    cone(960, 150, 960, 430, 760, 0.22 * amt);
    for (let i = 0; i < 9; i++) {
      const u = (i / 8) * 2 - 1;
      const drift = noise.n3(i * 0.9, 1, t * 0.12) * 18;
      const a = Math.max(0, noise.n3(i * 0.53, 2, t * 0.1) + 0.3) * 0.16 * amt;
      cone(960 + u * 110 + drift, 10 + (i % 3) * 6, 960 + u * 330 + drift * 2, 26 + (i % 3) * 14, 700, a);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, H);
    ctx.restore();
  };

  const backdrop = (ctx: Ctx, noise: Parameters<NonNullable<React.ComponentProps<typeof Painted>['before']>>[1]) => {
    noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0014, t: t * 0.05, warp: 0.6}, (x, y, n) => {
      const pool = 0.75 * Math.exp(-(((x - 960) / 620) ** 2 + ((y - 120) / 420) ** 2));
      // white mist rolling in low on both sides, where the big figures stand
      const mist = Math.exp(-(((y - 900) / 220) ** 2)) * (0.2 + 0.3 * Math.min(1, Math.abs(x - 960) / 700));
      const v = Math.max(0, Math.min(1, pool * (0.7 + n * 0.5) + mist * (0.4 + n * 0.9) + n * 0.1 + 0.04));
      const [r, g, b] = rampRGB([[0, '#05070b'], [0.25, '#121925'], [0.5, '#2c3850'], [0.75, '#6a7a9c'], [1, '#d4dcea']], v);
      return [r, g, b, 1];
    });
    rays(ctx, noise);
    drawDeath(ctx, noise, {cx: 960, cy: 300, k: 0.9, t, rim: '#7888aa', glow, glowAmt: 0.35});
    drawSleeve(ctx, noise, [640, 610], [826, 474], {w: 118, t, rim: '#7888aa'});
  };

  const under = (
    <g transform={camT}>
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
      <g opacity={proj}>
      <BigPan x={bigL[0]} y={bigL[1]} rx={300} id="panL">
        <VoldemortSilhouette k={5.6} rim={RIM_V} rimW={1.3} />
      </BigPan>
      <BigPan x={bigR[0]} y={bigR[1]} rx={280} id="panR">
        <g transform="scale(-1 1)">
          <HarrySilhouette k={5.1} rim={RIM_H} rimW={1.3} />
        </g>
      </BigPan>
      </g>
    </g>
  );

  // The painter dulls thin saturated edges, so the rims go back on top:
  // figures rendered with black bodies, added with 'screen' (black adds
  // nothing), once sharp and once blurred for a soft halo — no light source.
  const rimBloom = async (ctx: Ctx, noise: Parameters<typeof rays>[1]) => {
    withCam(ctx, () => rays(ctx, noise, 0.45));
    if (proj <= 0) return;
    const layers: [React.ReactNode, number][] = [
      [<g transform={`translate(${bigL[0]} ${bigL[1]})`}><VoldemortSilhouette k={5.6} rim={RIM_V} rimW={1.3} body="#000000" /></g>, 1],
      [<g transform={`translate(${bigR[0]} ${bigR[1]}) scale(-1 1)`}><HarrySilhouette k={5.1} rim={RIM_H} rimW={1.3} body="#000000" /></g>, -1],
    ];
    for (const [i, [el, dir]] of layers.entries()) {
      const img = await rasterize(<g transform={camT}>{el}</g>);
      // the glow breathes slowly, each figure on its own rhythm
      const breath = 0.72 + 0.28 * Math.sin(t * 1.25 + i * 2.1);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      // wide spill leaning toward the light — the rim radiates, the back stays dim
      ctx.filter = `blur(${px(28 * z)}px)`;
      ctx.globalAlpha = 0.55 * breath * proj;
      ctx.drawImage(img, dir * 14 * z, 0, W, H);
      ctx.filter = `blur(${px(10 * z)}px)`;
      ctx.globalAlpha = 0.45 * breath * proj;
      ctx.drawImage(img, dir * 5 * z, 0, W, H);
      // a band of brighter light travels up the rim, over and over
      const feetY = ty + 1046 * z, headY = ty + 440 * z;
      const phase = (t * 0.32 + i * 0.5) % 1;
      const bandY = feetY + (headY - 160 * z - feetY) * phase;
      const flow = document.createElement('canvas');
      flow.width = ctx.canvas.width;
      flow.height = ctx.canvas.height;
      const fc = flow.getContext('2d')!;
      fc.setTransform(RES, 0, 0, RES, 0, 0);
      fc.drawImage(img, 0, 0, W, H);
      fc.globalCompositeOperation = 'destination-in';
      const band = fc.createLinearGradient(0, bandY + 200 * z, 0, bandY - 200 * z);
      band.addColorStop(0, 'rgba(0,0,0,0)');
      band.addColorStop(0.5, 'rgba(0,0,0,1)');
      band.addColorStop(1, 'rgba(0,0,0,0)');
      fc.fillStyle = band;
      fc.fillRect(0, 0, W, H);
      ctx.filter = `blur(${px(6 * z)}px)`;
      ctx.globalAlpha = 0.7 * proj;
      ctx.drawImage(flow, 0, 0, W, H);
      ctx.filter = 'none';
      ctx.globalAlpha = 0.45 * proj;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();
    }
  };

  return (
    <AbsoluteFill style={{background: '#05070b'}}>
      <Filters />
      <Painted
        renderKey={`sf01-${frame}-${z}-${cam.cx}-${cam.cy}-${proj}-${tilt}`}
        before={(ctx, noise) => withCam(ctx, () => backdrop(ctx, noise))}
        under={under}
        flow="swirl"
        after={rimBloom}
      />
      <Snow frame={frame} layer="far" count={160} seed="sf1" wind={0.2} color="#c9d2e2" />
      <Snow frame={frame} layer="mid" count={40} seed="sf1" wind={0.2} color="#dfe5ef" />
      <Snow frame={frame} layer="near" count={7} seed="sf1" wind={0.2} opacity={0.6} />
      <Surface grainSeed={frame} vignette={0.6} paper={0.6} />
      {fade < 1 && <AbsoluteFill style={{background: '#000', opacity: 1 - fade}} />}
    </AbsoluteFill>
  );
};
