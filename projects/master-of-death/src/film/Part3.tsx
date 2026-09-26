import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile} from 'remotion';
import {NARRATION} from '../text';
import {
  APPROACH_FRAMES, Clash, CLASH_FRAMES, COVER_FRAMES, DeathApproach, FaceOff, FACEOFF_FRAMES, Fingertips, FINGERTIPS_FRAMES,
  POV_VOLD_FRAMES, PovVoldemort, REVEAL_DEATH_FRAMES, WalkAway, WALKAWAY_FRAMES, WandCover, WandFall, WANDFALL_FRAMES,
} from './Duel';
import {ENDCARD_FRAMES, EndCard, FINAL_BALANCE_FRAMES, FinalBalance} from './Ending';
import {HarryFace} from './HarryFace';
import {Boots, BOOTS_FRAMES, HARRY_WALKS_FRAMES, HarryWalks, HEM_FRAMES, HemGlide} from './Walk';
import {Shot, Sub} from './Part1';

// Part 3 (01:00–01:35): the snowfield, the duel, the Elder Wand in the snow,
// Death stepping aside, the empty balance, the Hallows, the last line.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const X = 8;
type Enter = ['fade' | 'black' | 'white', number];
type Spec = {len: number; enter?: Enter; render: (f: number) => React.ReactNode};

const SHOTS: Spec[] = [
  {len: FACEOFF_FRAMES, enter: ['fade', 4], render: (f) => <FaceOff frame={f} />},
  // 一步，一步: his boots press into the snow; then Harry; then Voldemort's hem, marking nothing
  {len: BOOTS_FRAMES, render: (f) => <Boots frame={f} />},
  {len: HARRY_WALKS_FRAMES, render: (f) => <HarryWalks frame={f} />},
  {len: HEM_FRAMES, render: (f) => <HemGlide frame={f} />},
  {len: POV_VOLD_FRAMES, render: (f) => <PovVoldemort frame={f} />},
  {len: CLASH_FRAMES, render: (f) => <Clash frame={f} />},
  {len: WANDFALL_FRAMES, enter: ['white', 14], render: (f) => <WandFall frame={f} />},
  {len: COVER_FRAMES, render: (f) => <WandCover frame={f} />},
  {len: REVEAL_DEATH_FRAMES, render: (f) => <WandCover frame={f + COVER_FRAMES} pull={interpolate(f, [0, 44], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)})} stow={interpolate(f, [40, 66], [0, 1], clamp)} />},
  // Harry meets Death's look, without fear
  {len: 40, render: (f) => <HarryFace frame={f + 90} snow zoom={2.6} expr={{look: -1, brow: 0, lid: 0.12, smile: 0.12, shine: 0}} />},
  {len: APPROACH_FRAMES, render: (f) => <DeathApproach frame={f} />},
  {len: FINGERTIPS_FRAMES, render: (f) => <Fingertips frame={f} />},
  {len: WALKAWAY_FRAMES, render: (f) => <WalkAway frame={f} />},
  {len: FINAL_BALANCE_FRAMES, render: (f) => <FinalBalance frame={f} />},
  {len: ENDCARD_FRAMES, enter: ['white', 2], render: (f) => <EndCard frame={f} />},
];

const starts = SHOTS.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].len - X], []);
export const PART3_FRAMES = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].len;
export const PART3_STARTS = starts;
const QUOTE_AT = starts[11];
const QUOTE_LEN = starts[13] - starts[11] + 10;

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
    <Sequence from={QUOTE_AT} durationInFrames={QUOTE_LEN}>
      <Sub line={NARRATION.arena} len={QUOTE_LEN} />
    </Sequence>
  </AbsoluteFill>
);
