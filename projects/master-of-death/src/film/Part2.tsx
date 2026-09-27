import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile} from 'remotion';
import {Balance} from './Balance';
import {LetGo, LETGO_FRAMES, Understand, UNDERSTAND_FRAMES} from './Farewell';
import {HarryFace} from './HarryFace';
import {Shot} from './Part1';
import {SKULL_FRAMES, SkullMountain} from './SkullMountain';
import {SnitchChase, SNITCH_FRAMES} from './SnitchChase';
import {REVEAL_FRAMES, StoneReveal} from './StoneReveal';
import {FLAKE_FRAMES, FLAKE_STONE_FRAMES, FlakeOnStone, FlakeThrough, Touch, TOUCH_FRAMES} from './Touch';
import {VoldemortClose} from './VoldemortClose';
import {SnowWipeRun} from '../fx/SnowWipe';
import {SF03Gravestone} from '../styleframes/SF03Gravestone';

// Part 2 (00:28–01:00): the Snitch, the stone, Lily, the snow, the grave,
// letting go, the balance tipping and the mountain melting — to level.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const X = 8; // frames of overlap between neighbouring shots

type Spec = {len: number; enter?: ['fade' | 'black', number]; render: (f: number) => React.ReactNode};
const vClose = (expr: 'shock' | 'smirk') => (f: number) => <VoldemortClose frame={f} expr={expr} />;

const SHOTS: Spec[] = [
  {len: SNITCH_FRAMES, enter: ['fade', 6], render: (f) => <SnitchChase frame={f} />},
  {len: REVEAL_FRAMES, render: (f) => <StoneReveal frame={f} />},
  {len: TOUCH_FRAMES, render: (f) => <Touch frame={f} />},
  {len: FLAKE_FRAMES, render: (f) => <FlakeThrough frame={f} />},
  // he freezes: the longing in his eyes stops short
  {len: 36, render: (f) => <HarryFace frame={f} eyes expr={{look: interpolate(f, [0, 20], [-4, 0], clamp), brow: interpolate(f, [0, 16], [0.4, 0.95], clamp), warm: 0.8}} />},
  // the grave: a flake lands on the stone and stays; the carving comes up
  // one flake lands on the stone — and stays
  {len: FLAKE_STONE_FRAMES, render: (f) => <FlakeOnStone frame={f} />},
  // (a slow push, then a long hold so the carving and its gloss can be read)
  {len: 108, render: (f) => <SF03Gravestone frame={f + 200} push={interpolate(f, [0, 60], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)})} flake={1} reveal={interpolate(f, [34, 62], [0, 1], clamp)} />},
  // back to his eyes: the wanting softens into understanding
  {len: 40, render: (f) => <HarryFace frame={f + 40} eyes expr={{look: -2, brow: interpolate(f, [0, 36], [0.9, 0.35], clamp), lid: interpolate(f, [8, 38], [0, 0.35], clamp), warm: 0.75}} />},
  {len: UNDERSTAND_FRAMES, render: (f) => <Understand frame={f} />},
  {len: LETGO_FRAMES, render: (f) => <LetGo frame={f} />},
  // the stone lands on his pan — and the balance swings toward him
  {len: 40, render: (f) => <Balance frame={f + 120} growth={1} others={0} tilt={interpolate(f, [8, 20, 28, 40], [25, -14, -8, -9], clamp)} stone={{y: interpolate(f, [0, 9], [-560, -8], {...clamp, easing: Easing.in(Easing.quad)}), glow: 0.45, snow: 0}} />},
  {len: 30, render: vClose('shock')},
  // the stone glows — and turns to snow and drifts away; the beam swings back
  {len: 48, render: (f) => <Balance frame={f + 180} growth={1} others={0} tilt={interpolate(f, [0, 16, 44], [-9, -8, 20], {...clamp, easing: Easing.inOut(Easing.quad)})} stone={{y: -8, glow: interpolate(f, [0, 12], [0.5, 1], clamp), snow: interpolate(f, [12, 44], [0, 1], clamp)}} />},
  {len: 30, render: vClose('smirk')},
  // and then his mountain shakes, melts to snow, blows away; he falls
  {len: 96, render: (f) => <SkullMountain frame={f + SKULL_FRAMES + 30} hold={SKULL_FRAMES} subs={false} flutter={0.8} collapse={interpolate(f, [0, 90], [0, 1], clamp)} />},
  // the balance, level
  {len: 48, render: (f) => <Balance frame={f + 260} growth={0} others={0} tilt={20 * Math.exp(-f / 9) * Math.cos(f / 3.2)} />},
];

const starts = SHOTS.reduce<number[]>((acc, sh, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].len - X], []);
export const WIPE = 20;
export const PART2_FRAMES = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].len;

export const Part2: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('audio/part2.wav')} />
    {SHOTS.map((sh, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={sh.len}>
        <Shot len={sh.len} enter={sh.enter ?? ['fade', X]}>{sh.render}</Shot>
      </Sequence>
    ))}
    {/* the snow comes in across the level balance and buries it — Part 3 uncovers */}
    <Sequence from={PART2_FRAMES - WIPE} durationInFrames={WIPE}>
      <SnowWipeRun from={0} to={1} len={WIPE} />
    </Sequence>
  </AbsoluteFill>
);

export const PART2_STARTS = starts;
