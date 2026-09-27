import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile} from 'remotion';
import {SnowWipeRun} from '../fx/SnowWipe';
import {NARRATION} from '../text';
import {Clash, CLASH_FRAMES} from './Clash';
import {COVER_FRAMES, FaceOff, FACEOFF_FRAMES, POV_VOLD_FRAMES, PovVoldemort, REVEAL_DEATH_FRAMES, WalkAway, WALKAWAY_FRAMES, WandCover, WandFall, WANDFALL_FRAMES} from './Duel';
import {ENDCARD_FRAMES, EndCard, FINAL_BALANCE_FRAMES, FinalBalance} from './Ending';
import {OVER_HARRY_FRAMES, OverHarry, PASS_FRAMES, PassBy} from './Meet';
import {Shot, Sub} from './Part1';
import {WIPE} from './Part2';
import {Boots, BOOTS_FRAMES, HARRY_WALKS_FRAMES, HarryWalks, HEM_FRAMES, HemGlide} from './Walk';

// Part 3 (01:00–01:35): the snowfield, the duel, the Elder Wand in the snow,
// Death stepping aside, the empty balance, the Hallows, the last line.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const X = 8;
type Enter = ['fade' | 'black' | 'white', number];
type Spec = {len: number; enter?: Enter; render: (f: number) => React.ReactNode};

const SHOTS: Spec[] = [
  // uncovered by the snow that buried Part 2's last frame
  {len: FACEOFF_FRAMES, enter: ['fade', 1], render: (f) => <FaceOff frame={f} />},
  // 一步，一步: his boots press into the snow; then Harry; then Voldemort's hem, marking nothing
  {len: BOOTS_FRAMES, render: (f) => <Boots frame={f} />},
  {len: HARRY_WALKS_FRAMES, render: (f) => <HarryWalks frame={f} />},
  {len: HEM_FRAMES, render: (f) => <HemGlide frame={f} />},
  {len: POV_VOLD_FRAMES, render: (f) => <PovVoldemort frame={f} />},
  {len: CLASH_FRAMES, render: (f) => <Clash frame={f} />},
  {len: WANDFALL_FRAMES, enter: ['white', 14], render: (f) => <WandFall frame={f} />},
  {len: COVER_FRAMES, render: (f) => <WandCover frame={f} />},
  {len: REVEAL_DEATH_FRAMES, render: (f) => <WandCover frame={f + COVER_FRAMES} pull={interpolate(f, [0, 50], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)})} stow={interpolate(f, [50, 70], [0, 1], clamp)} />},
  // 相向而行: from behind Harry, Death coming; Harry, unafraid; from behind Death — and they pass
  {len: OVER_HARRY_FRAMES, render: (f) => <OverHarry frame={f} />},
  {len: HARRY_WALKS_FRAMES, render: (f) => <HarryWalks frame={f + 6} calm />},
  {len: PASS_FRAMES, render: (f) => <PassBy frame={f} />},
  {len: WALKAWAY_FRAMES, render: (f) => <WalkAway frame={f} />},
  {len: FINAL_BALANCE_FRAMES, render: (f) => <FinalBalance frame={f} />},
  {len: ENDCARD_FRAMES, enter: ['white', 2], render: (f) => <EndCard frame={f} />},
];

const starts = SHOTS.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].len - X], []);
export const PART3_FRAMES = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].len;
export const PART3_STARTS = starts;
const QUOTE_AT = starts[11] + 24;
const QUOTE_LEN = starts[13] - QUOTE_AT + 10;

export const Part3: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('audio/part3.wav')} />
    {SHOTS.map((sh, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={sh.len}>
        <Shot len={sh.len} enter={sh.enter ?? ['fade', X]}>{sh.render}</Shot>
      </Sequence>
    ))}
    {/* over Voldemort's hem and the unmarked snow behind him */}
    <Sequence from={starts[3] + 2} durationInFrames={starts[5] - starts[3] + 2}>
      <Sub line={NARRATION.torn} len={starts[5] - starts[3] + 2} />
    </Sequence>
    <Sequence durationInFrames={WIPE}>
      <SnowWipeRun from={1} to={2} len={WIPE} />
    </Sequence>
    <Sequence from={QUOTE_AT} durationInFrames={QUOTE_LEN}>
      <Sub line={NARRATION.arena} len={QUOTE_LEN} />
    </Sequence>
  </AbsoluteFill>
);
