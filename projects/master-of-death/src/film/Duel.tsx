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
export const Footprints: React.FC<{x: number; to: number; from?: number; seed?: number}> = ({x, to, from = HORIZON + 30}) => {
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
  />
);


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

// 01:08 — close on the wand lying in the snow; flake by flake it is covered
// until nothing shows. Then the camera draws back low over the snow, the
// buried wand staying in the foreground, until the horizon comes into view —
// and far off on it stands Death, who saw it all, putting the balance away.
// World: horizon at y 470; the wand at (900, 880). The painted snowfield
// is re-laid for each camera so the ground always lies flat.
export const COVER_FRAMES = 60;
export const REVEAL_DEATH_FRAMES = 72;
const WAND: P = [900, 880];
const HORIZON_W = 470;
export const WandCover: React.FC<{frame: number; pull?: number; stow?: number}> = ({frame, pull = 0, stow = 0}) => {
  const s = frame / FPS;
  const snow = pull > 0 ? 1 : interpolate(s, [0.2, 2.2], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const z = 3 - 2 * pull;
  const cx = WAND[0] + (960 - WAND[0]) * pull, cy = WAND[1] + (540 - WAND[1]) * pull;
  const camT = `translate(${W / 2 - cx * z} ${H / 2 - cy * z}) scale(${z})`;
  const horizon = H / 2 + (HORIZON_W - cy) * z;
  const seen = interpolate(pull, [0.55, 0.9], [0, 1], clamp);
  return (
    <SnowWorld
      frame={frame}
      id="wc"
      horizon={horizon}
      under={
        <g transform={camT}>
          {seen > 0 && (
            <g opacity={seen}>
              <g transform={`translate(1010 ${HORIZON_W + 12})`}><DeathFar k={1.5} t={s + 3} front /></g>
              <g transform={`translate(1010 ${HORIZON_W - 64 + stow * 8})`} opacity={1 - stow}><Scale L={9} tilt={0} ring={false} /></g>
            </g>
          )}
          <g transform={`translate(${WAND[0] - 90} ${WAND[1]}) rotate(-8)`}><ElderWand len={180} snow={snow} /></g>
        </g>
      }
    />
  );
};

// 01:18 — neither looks back. Harry walks on toward us, his prints behind
// him; far behind, Death walks away into the snow.
export const WALKAWAY_FRAMES = 64;
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
