import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Hand} from '../characters/Hand';
import {HarryPaint} from '../characters/HarryPaint';
import {LilyPaint} from '../characters/LilyPaint';
import {PEOPLE, Person} from '../characters/Person';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {Painted} from '../paint/Painted';
import {ResurrectionStone, Snitch} from '../props/Magic';
import {FPS} from '../theme';
import {voidBackdrop} from './backdrop';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
export const SNITCH_AT: [number, number] = [720, 540];

// The dead who stand around him, out of focus — only Lily comes close.
export const GhostCrowd: React.FC<{o: number}> = ({o}) => (
  <g opacity={o} filter="url(#ghost)">
    {[['james', 90, 3.0], ['dumbledore', 470, 2.7], ['sirius', 1560, 2.8], ['lupin', 1820, 2.9]].map(([who, x, k]) => (
      <g key={who as string} transform={`translate(${x} 1060)`}><Person spec={PEOPLE[who as string]} k={k as number} id={`g-${who}`} /></g>
    ))}
  </g>
);

// 00:31–00:37. He reaches; the Snitch opens; the stone inside begins to
// glow, and in its light Lily is there — and the others, blurred, around.
// His face catches the warm light; his eyes open to it.
export const REVEAL_FRAMES = 144;

export const StoneReveal: React.FC<{frame: number}> = ({frame}) => {
  const s = frame / FPS;
  const t = s + 60;
  const open = interpolate(s, [0.6, 1.2], [0, 1], {...clamp, easing: ease});
  const glow = interpolate(s, [1.0, 2.4], [0, 1], {...clamp, easing: ease});
  const lily = interpolate(s, [2.2, 3.8], [0, 1], {...clamp, easing: ease});
  const others = interpolate(s, [2.8, 4.2], [0, 1], {...clamp, easing: ease});
  const reach1 = interpolate(s, [0, 1.0], [0, 1], {...clamp, easing: ease});
  const reach2 = interpolate(s, [4.3, 6.0], [0, 1], {...clamp, easing: ease});
  const wx = 1200 - 150 * reach1 - 230 * reach2;
  const wy = 960 - 190 * reach1 - 20 * reach2;
  const hover = Math.sin(s * 3) * 6;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Filters />
      <Painted
        renderKey={`sr-${frame}`}
        before={(ctx, noise) => voidBackdrop(ctx, noise, t, glow, SNITCH_AT)}
        under={
          <>
            <GhostCrowd o={others * 0.8} />
            <g opacity={lily} transform="translate(650 110) scale(-1.7 1.7)"><LilyPaint smile={0.35 + 0.2 * lily} look={2} /></g>
            <g transform="translate(1000 150) scale(1.85)">
              <HarryPaint id="hp-sr" look={-6} brow={0.6 - 0.45 * glow} lid={0} warm={glow} />
            </g>
            <g transform={`translate(${wx} ${wy}) scale(-1 1) rotate(${-28 + 14 * reach2})`}>
              <Hand k={1.45} curl={0.25 - 0.2 * reach2} id="hand-sr" />
            </g>
          </>
        }
      />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(${SNITCH_AT[0]} ${SNITCH_AT[1] + hover})`}>
          <Snitch r={38} flap={s * (26 - 18 * open)} open={open} id="sn-sr">
            <g transform={`translate(0 ${-6 - 4 * glow})`}><ResurrectionStone r={22} glow={glow} id="rs-sr" /></g>
          </Snitch>
        </g>
      </svg>
      <Snow frame={frame + 400} layer="far" count={80} seed="sr" wind={0.15} color="#f2e6d4" opacity={0.6} />
      <Surface grainSeed={frame} vignette={0.66} />
    </AbsoluteFill>
  );
};
