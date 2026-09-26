import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LilyPaint} from '../characters/LilyPaint';
import {Filters} from '../fx/Filters';
import {Painted} from '../paint/Painted';
import {voidBackdrop} from '../film/backdrop';

// Dev sheet: Lily through the real brush pipeline — not part of the film.
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#1a2130'}}>
    <Filters />
    <Painted renderKey="sheet" before={(ctx, noise) => voidBackdrop(ctx, noise, 1, 0.8, [960, 900])} under={<g transform="translate(1380 0) scale(-2.3 2.3)"><LilyPaint smile={0.7} look={-3} /></g>} />
  </AbsoluteFill>
);
