import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {Opening, OPENING_FRAMES} from './Opening';
import {SKULL_FRAMES, SkullMountain} from './SkullMountain';

// Part 1 (00:00–00:27), assembled on one timeline. Shots overlap where they
// dissolve into each other, so there are no hard seams to stitch later.
const SKULL_AT = 172;
export const PART1_FRAMES = SKULL_AT + SKULL_FRAMES;

const Dissolve: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, frames], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

const SkullShot: React.FC = () => <SkullMountain frame={useCurrentFrame()} />;

export const Part1: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={OPENING_FRAMES}>
      <Opening />
    </Sequence>
    <Sequence from={SKULL_AT} durationInFrames={SKULL_FRAMES}>
      <Dissolve frames={OPENING_FRAMES - SKULL_AT}>
        <SkullShot />
      </Dissolve>
    </Sequence>
  </AbsoluteFill>
);
