import React from 'react';
import {Easing, interpolate} from 'remotion';
import {DeathFar} from '../characters/Figures';
import {RATE} from '../characters/gait';
import {PEOPLE, Person} from '../characters/Person';
import {FPS, H, W} from '../theme';
import {Footprints, SnowWorld} from './Duel';

// 01:12–01:18 — Harry and Death walk toward each other; at the last moment
// Death steps aside and lets him pass, its robe brushing his shoulder, his
// arm, his fingertips. Both are always whole figures: Harry walks, Death
// floats (as Voldemort does), leaving no prints.
//
// A simple ground-plane camera: a point X across, z deep, lands at
// x = 960 + X·620/z, feet y = 560 + 520/z, figure scale 6/z.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HOR = 560;
const at = (X: number, z: number) => ({x: 960 + (X * 620) / z, y: HOR + 520 / z, k: 6 / z});
const smooth = (a: number, b: number, v: number) => interpolate(v, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
// Death hovers a hand above the snow, rising and settling slowly
const hover = (t: number, k: number) => -(4 + 1.5 * Math.sin(t * 2.2)) * k;
const DEATH = 1.25; // Death stands a head taller than Harry

// Behind Harry: he walks away from us, his prints trailing back toward the
// lens; far ahead, Death comes gliding toward him.
export const OVER_HARRY_FRAMES = 60;
export const OverHarry: React.FC<{frame: number}> = ({frame}) => {
  const p = frame / OVER_HARRY_FRAMES, t = frame / FPS;
  const h = at(-0.28, 1.5 + 1.1 * p);
  const d = at(0.55, 9 - 3.5 * p);
  return (
    <SnowWorld
      frame={frame}
      id="oh"
      under={
        <>
          <g transform={`translate(${d.x} ${d.y + hover(t, d.k * DEATH)})`}><DeathFar k={d.k * DEATH} t={t} front /></g>
          <Footprints x={h.x} from={h.y + 14} to={H + 60} />
          <g transform={`translate(${h.x} ${h.y})`}><Person spec={PEOPLE.harry} k={h.k} id="oh-harry" walk={frame * RATE} back /></g>
        </>
      }
    />
  );
};

// Behind Death: Harry comes on toward us. They meet; Death drifts aside; as
// they pass, the camera leans in on the brush of the robe over his shoulder,
// arm and fingertips — and draws back out as they go on, apart.
export const PASS_FRAMES = 132;
export const PASS_BRUSH = [0.7, 0.86]; // fraction of the shot: the robe touching him
export const PassBy: React.FC<{frame: number}> = ({frame}) => {
  const p = frame / PASS_FRAMES, t = frame / FPS;
  const zD = 1.3 + 2.4 * p, zH = 10 - 9 * p;
  const aside = smooth(0.52, 0.8, p);
  const d = at(0.28 + 0.48 * aside, zD);
  const h = at(-0.05, zH);
  const dk = d.k * DEATH;
  // Harry's shoulder and hand (his right, our left of him is away; the near
  // side faces Death), in screen space
  const shoulder = [h.x + 11 * h.k, h.y - 78 * h.k];
  const hand = [h.x + 14.5 * h.k, h.y - 44 * h.k];
  const brush = interpolate(p, PASS_BRUSH, [0, 1], clamp);
  const touching = p > PASS_BRUSH[0] - 0.04 && p < PASS_BRUSH[1] + 0.04;
  // the camera leans in on the brush and back out
  const zoom = 1 + 1.5 * smooth(0.6, 0.7, p) * (1 - smooth(0.86, 0.96, p));
  const fx = (shoulder[0] + d.x - 16 * dk) / 2, fy = (shoulder[1] + hand[1]) / 2;
  const cx = 960 + (fx - 960) * (zoom - 1) / 1.5, cy = 540 + (fy - 540) * (zoom - 1) / 1.5;
  const camT = `translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`;
  const deathG = (
    <g transform={`translate(${d.x} ${d.y + hover(t, dk)})`}><DeathFar k={dk} t={t} flow={-1} /></g>
  );
  const harryG = (
    <>
      <Footprints x={h.x} to={h.y - 6} />
      <g transform={`translate(${h.x} ${h.y})`}><Person spec={PEOPLE.harry} k={h.k} id="pb-harry" walk={frame * RATE} /></g>
    </>
  );
  // torn strands of the robe, blown sideways from Death across him: first
  // his shoulder, then down his arm, then over his fingertips
  const strands = touching && (
    <g filter="url(#blur-1.5)">
      {Array.from({length: 4}, (_, i) => {
        const u = Math.min(1, Math.max(0, brush * 1.25 - i * 0.08));
        const tx = shoulder[0] + (hand[0] - shoulder[0]) * u - 4 * h.k;
        const ty = shoulder[1] + (hand[1] - shoulder[1]) * u + (i - 1.5) * 4 * h.k;
        const sx = d.x - 13 * dk, sy = d.y - (70 - i * 9) * dk;
        const reach = Math.sin(Math.PI * interpolate(p, [PASS_BRUSH[0] - 0.04, PASS_BRUSH[1] + 0.04], [0, 1], clamp));
        const ex = sx + (tx - sx) * reach, ey = sy + (ty - sy) * reach;
        // a torn ribbon of cloth: wide where it leaves the robe, tapering, rippling
        const len = Math.hypot(ex - sx, ey - sy) || 1;
        const nx = -(ey - sy) / len, ny = (ex - sx) / len;
        const w0 = (7 - i) * dk, wob = Math.sin(t * 8 + i * 1.7) * 7 * h.k;
        const m1 = [sx + (ex - sx) * 0.35 + nx * wob, sy + (ey - sy) * 0.35 + ny * wob];
        const m2 = [sx + (ex - sx) * 0.7 - nx * wob, sy + (ey - sy) * 0.7 - ny * wob];
        return (
          <path
            key={i}
            d={`M${sx + nx * w0},${sy + ny * w0} C${m1[0] + nx * w0 * 0.7},${m1[1] + ny * w0 * 0.7} ${m2[0] + nx * w0 * 0.3},${m2[1] + ny * w0 * 0.3} ${ex},${ey} C${m2[0] - nx * w0 * 0.3},${m2[1] - ny * w0 * 0.3} ${m1[0] - nx * w0 * 0.7},${m1[1] - ny * w0 * 0.7} ${sx - nx * w0},${sy - ny * w0}Z`}
            fill={i % 2 ? '#0d1017' : '#07080b'}
            opacity={0.9}
          />
        );
      })}
    </g>
  );
  return (
    <SnowWorld
      frame={frame}
      id="pb"
      horizon={H / 2 + (HOR - cy) * zoom}
      under={
        <g transform={camT}>
          {zD < zH ? <>{harryG}{deathG}</> : <>{deathG}{harryG}</>}
          {strands}
        </g>
      }
    />
  );
};
