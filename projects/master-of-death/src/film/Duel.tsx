import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Hand} from '../characters/Hand';
import {DeathFar, HarrySilhouette, VoldemortSilhouette} from '../characters/Figures';
import {RATE} from '../characters/gait';
import {PEOPLE, Person} from '../characters/Person';
import {Riddle} from '../characters/Voldemort';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {ribbon, rgba, trace, type Ctx, type P} from '../paint/canvas';
import {drawDeath} from '../paint/death';
import type {Noise} from '../paint/noise';
import {Painted} from '../paint/Painted';
import {ElderWand} from '../props/Magic';
import {Scale} from '../props/Scale';
import {C, FPS, H, W} from '../theme';
import {snowfield} from './backdrop';

// Part 3 (00:55–01:25): the snowfield. No Death, no balance — two people.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const HORIZON = 560;
const RIM = '#c7d2e6';

export const SnowWorld: React.FC<{frame: number; id: string; horizon?: number; before?: (ctx: Ctx, noise: Noise) => void; under?: React.ReactNode; over?: React.ReactNode; snow?: number; wind?: number}> = ({
  frame, id, horizon = HORIZON, before, under, over, snow = 1, wind = 0.6,
}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Filters />
    <Painted
      renderKey={`${id}-${frame}`}
      before={(ctx, noise) => {
        snowfield(ctx, noise, frame / FPS + 200, horizon);
        before?.(ctx, noise);
      }}
      under={under}
    />
    {over && <svg width={W} height={H} style={{position: 'absolute'}}>{over}</svg>}
    <Snow frame={frame + 900} layer="far" count={Math.round(220 * snow)} seed={id} wind={wind} color="#eef2f8" />
    <Snow frame={frame + 900} layer="mid" count={Math.round(60 * snow)} seed={id} wind={wind} />
    <Snow frame={frame + 900} layer="near" count={Math.round(8 * snow)} seed={id} wind={wind} opacity={0.55} />
    <Surface grainSeed={frame} vignette={0.6} />
  </AbsoluteFill>
);

// A trail of footprints receding toward the horizon, up to `to` (screen y).
const Footprints: React.FC<{x: number; to: number; from?: number; seed?: number}> = ({x, to, from = HORIZON + 30}) => {
  const prints: React.ReactNode[] = [];
  let y = from, i = 0;
  while (y < to - 20) {
    const d = (y - HORIZON) / (H - HORIZON);
    const side = i % 2 ? 1 : -1;
    prints.push(
      <g key={i}>
        <ellipse cx={x + side * (6 + 30 * d)} cy={y} rx={4 + 30 * d} ry={1.5 + 9 * d} fill="#5b6784" opacity={0.75} />
        <ellipse cx={x + side * (6 + 30 * d)} cy={y - 1 - 3 * d} rx={3.5 + 26 * d} ry={1 + 6 * d} fill="#3c465f" opacity={0.6} />
      </g>,
    );
    y += 8 + 70 * d * d + 6 * d;
    i++;
  }
  return <g>{prints}</g>;
};

// 00:55 — the snow sweeps the balance away. Two figures at the two ends.
export const FACEOFF_FRAMES = 60;
export const FaceOff: React.FC<{frame: number; raise?: number; beams?: number}> = ({frame, raise = 0}) => (
  <SnowWorld
    frame={frame}
    id="fo"
    wind={1.4}
    under={
      <>
        <g transform="translate(400 830)"><VoldemortSilhouette k={3.5} rim={RIM} /></g>
        <g transform="translate(1520 830) scale(-1 1)"><HarrySilhouette k={3.3} rim={RIM} wand={raise} /></g>
      </>
    }
    over={frame < 26 ? <SweepFlakes frame={frame} /> : undefined}
  />
);

// big flakes whipping across the lens — the transition into the snowfield
const SweepFlakes: React.FC<{frame: number}> = ({frame}) => {
  const a = Math.max(0, 1 - frame / 26);
  return (
    <g filter="url(#blur-6)" opacity={a}>
      {Array.from({length: 70}, (_, i) => {
        const r = (i * 7919) % 97 / 97;
        const y = ((i * 131) % 1080);
        const x = -300 + ((frame * (60 + r * 50) + i * 173) % 2600);
        return <ellipse key={i} cx={x} cy={y} rx={30 + r * 60} ry={10 + r * 16} fill="#f6f8fb" opacity={0.5 + r * 0.4} />;
      })}
    </g>
  );
};

// 00:59 — and Voldemort walks toward Harry (Harry's eyes): behind him the
// snow is untouched. Shards of him drift off and are gone.
export const POV_VOLD_FRAMES = 44;
export const PovVoldemort: React.FC<{frame: number}> = ({frame}) => {
  const p = frame / POV_VOLD_FRAMES;
  const feetY = 640 + 360 * p;
  const k = 0.7 + 0.9 * p;
  return (
    <SnowWorld
      frame={frame}
      id="pv"
      under={
        <g transform={`translate(960 ${feetY})`}>
          <Riddle k={k} rim={RIM} age={3} t={frame / FPS} flutter={0.8} />
          {Array.from({length: 7}, (_, i) => {
            const life = ((frame / FPS) * 0.6 + i / 7) % 1;
            return <path key={i} d={`M0,0 l${6 * k},${-4 * k} l${-2 * k},${8 * k}Z`} fill="#0b0d12" opacity={0.8 * (1 - life)} transform={`translate(${(-60 + i * 22) * k + life * 120 * k} ${(-200 + (i % 3) * 40) * k - life * 90 * k}) rotate(${life * 200})`} />;
          })}
        </g>
      }
    />
  );
};

// 01:03 — wands up; red light, green light; they meet; white.
export const CLASH_FRAMES = 60;
export const Clash: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const raise = interpolate(s, [0, 0.45], [0, 1], {...clamp, easing: ease});
  const reach = interpolate(s, [0.5, 0.85], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const meet = 960 + Math.sin(s * 9) * 30 - interpolate(s, [1.8, 2.2], [0, 260], clamp);
  const flash = interpolate(s, [2.05, 2.45], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const vTip: P = [400 + 38 * 3.5, 830 - 52 * 3.5];
  const hTip: P = [1520 - (32 + 14) * 3.3, 830 - (78 + 8) * 3.3];
  const green: P = [vTip[0] + (meet - vTip[0]) * reach, vTip[1] + (560 - vTip[1]) * reach];
  const red: P = [hTip[0] + (meet - hTip[0]) * reach, hTip[1] + (560 - hTip[1]) * reach];
  const beam = (a: P, b: P, color: string, key: string) => (
    <g key={key}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={34} opacity={0.35} strokeLinecap="round" filter="url(#blur-12)" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={9} strokeLinecap="round" filter="url(#glow-s)" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
    </g>
  );
  return (
    <AbsoluteFill>
      <FaceOff frame={frame + 60} raise={raise} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {reach > 0 && beam(vTip, green, C.spellGreen, 'g')}
        {reach > 0 && beam(hTip, red, C.spellRed, 'r')}
        {reach >= 1 && <circle cx={meet} cy={560} r={46 + Math.sin(s * 30) * 8} fill="#fffbe8" filter="url(#glow-l)" />}
      </svg>
      {flash > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at ${(meet / W) * 100}% 52%, #ffffff ${flash * 60}%, rgba(246,247,249,${flash}) ${20 + flash * 80}%)`}} />}
    </AbsoluteFill>
  );
};

// 01:07 — out of the white: the Elder Wand spins out of his hand into the snow.
export const WANDFALL_FRAMES = 42;
export const WandFall: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const fall = interpolate(s, [0, 1.0], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const x = 700 + 260 * fall, y = -200 + 900 * fall;
  const rot = fall < 1 ? 720 * fall : 708;
  const puff = Math.max(0, s - 1.0);
  return (
    <SnowWorld
      frame={frame}
      id="wf"
      horizon={420}
      under={
        <>
          {puff > 0 && <ellipse cx={960} cy={712} rx={80 + puff * 240} ry={20 + puff * 40} fill="#f4f7fb" opacity={Math.max(0, 0.7 - puff)} filter="url(#blur-6)" />}
          <g transform={`translate(${x} ${y}) rotate(${rot})`}><g transform="translate(-180 0)"><ElderWand len={360} /></g></g>
        </>
      }
    />
  );
};

// 01:08 — close on the wand in the snow; flake by flake it is covered.
// Then back, back — and at the far end of the field, Death, who saw it all,
// puts the balance away.
export const COVER_FRAMES = 72;
export const REVEAL_DEATH_FRAMES = 72;
export const WandCover: React.FC<{frame: number; pull?: number; stow?: number}> = ({frame, pull = 0, stow = 0}) => {
  const s = frame / FPS;
  const snow = pull > 0 ? 1 : interpolate(s, [0.2, 2.8], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const z = 3.2 - 2.2 * pull;
  const cx = 960, cy = 690 - 150 * pull;
  const camT = `translate(${W / 2 - cx * z} ${H / 2 - cy * z}) scale(${z})`;
  return (
    <SnowWorld
      frame={frame}
      id="wc"
      under={
        <g transform={camT}>
          {/* Death at the far end, standing, the balance fading into its robe */}
          {pull > 0.3 && <g transform="translate(960 562)" opacity={interpolate(pull, [0.3, 0.8], [0, 1], clamp)}><DeathFar k={2.6} t={s + 3} front /></g>}
          <g transform="translate(870 712) rotate(-12)"><ElderWand len={180} snow={snow} /></g>
          {pull > 0 && (
            <g transform="translate(960 470)" opacity={1 - stow}>
              <g transform={`translate(0 ${stow * 20})`}><Scale L={24} tilt={0} ring={false} /></g>
            </g>
          )}
        </g>
      }
    />
  );
};

// 01:12 — Death looks at Harry; Harry looks back. Unafraid. They walk toward
// each other; at the last moment Death steps aside and lets him pass, its
// robe brushing his shoulder, his arm, his fingertips.
export const APPROACH_FRAMES = 72;
export const DeathApproach: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const p = interpolate(s, [0, 2.2], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const aside = interpolate(s, [2.0, 3.0], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const k = 0.3 + 0.8 * p;
  return (
    <SnowWorld
      frame={frame}
      id="da"
      before={(ctx, noise) => {
        drawDeath(ctx, noise, {cx: 960 - 900 * aside, cy: 300 + 250 * p, k, t: s + 320, rim: '#9aa8c4', glowAmt: 0, wind: [0.5, -0.1]});
        if (aside > 0) sweep(ctx, noise, s, aside);
      }}
    />
  );
};

// the robe's hem sweeping across the frame as Death passes
const sweep = (ctx: Ctx, noise: Noise, s: number, a: number) => {
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const y0 = 80 + i * 62;
    const start: P = [-200 + 2400 * (1 - a) - i * 30, y0];
    const pts = trace(start, [-1, 0.05], 26, 34, (p) => {
      const [fx, fy] = noise.curl(p[0] * 0.002, p[1] * 0.002, s);
      return [-1 + fx * 0.6, fy * 0.6];
    }, 0.85);
    ctx.fillStyle = rgba(i % 3 ? '#0b0e14' : '#1a2130', (i % 3 ? 0.85 : 0.5) * Math.sin(Math.PI * Math.min(1, a * 1.3)));
    ribbon(ctx, pts, (u) => (70 + (i % 4) * 25) * (1 - u * 0.8));
    ctx.fill();
  }
  ctx.restore();
};

export const FINGERTIPS_FRAMES = 48;
export const Fingertips: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const pass = interpolate(s, [0.1, 1.7], [0, 1], clamp);
  return (
    <SnowWorld
      frame={frame}
      id="ft"
      horizon={200}
      snow={0.6}
      before={(ctx, noise) => {
        ctx.save();
        for (let i = 0; i < 9; i++) {
          const start: P = [-600 + 2800 * pass - i * 90, 380 + i * 40];
          const pts = trace(start, [1, 0.04], 24, 36, (p) => {
            const [fx, fy] = noise.curl(p[0] * 0.0025, p[1] * 0.0025, s + i);
            return [1 + fx * 0.5, fy * 0.5];
          }, 0.85);
          ctx.fillStyle = rgba(i % 3 ? '#0b0e14' : '#232b3c', i % 3 ? 0.8 : 0.5);
          ribbon(ctx, pts, (u) => (60 + (i % 3) * 30) * Math.sin(Math.PI * u));
          ctx.fill();
        }
        ctx.restore();
      }}
      under={<g transform={`translate(1560 ${600 + Math.sin(s * 2) * 4}) scale(-1 1) rotate(${-8 + 4 * Math.sin(s * 1.5)})`}><Hand k={2.3} curl={0.18} id="hand-ft" /></g>}
    />
  );
};

// 01:18 — neither looks back. Harry walks on toward us, his prints behind
// him; far behind, Death walks away into the snow.
export const WALKAWAY_FRAMES = 84;
export const WalkAway: React.FC<{frame: number}> = ({frame}) => {
  const p = frame / WALKAWAY_FRAMES;
  const feetY = 800 + 140 * p;
  const k = 2.6 + 0.9 * p;
  return (
    <SnowWorld
      frame={frame}
      id="wa"
      under={
        <>
          <g transform={`translate(${1180 + 40 * p} ${600 - 14 * p})`}><DeathFar k={1.5 - 0.6 * p} t={frame / FPS} /></g>
          <Footprints x={880} to={feetY} from={HORIZON + 60} />
          <g transform={`translate(880 ${feetY})`}><Person spec={PEOPLE.harry} k={k} id="wa-harry" walk={frame * RATE} /></g>
        </>
      }
    />
  );
};
