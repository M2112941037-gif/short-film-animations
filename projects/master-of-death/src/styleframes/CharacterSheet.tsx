import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HarryPaint} from '../characters/HarryPaint';
import {Filters} from '../fx/Filters';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB} from '../paint/canvas';
import {Painted} from '../paint/Painted';
import {W, H} from '../theme';

// Character style test — ink-drawn Harry over the painted world. Dev tool.
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#05070b'}}>
    <Filters />
    <Painted
      renderKey="sheet"
      before={(ctx, noise) =>
        noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0015, warp: 0.6}, (x, y, n) => {
          const top = Math.exp(-(((x - 700) / 700) ** 2 + ((y + 100) / 650) ** 2));
          const v = Math.max(0, Math.min(1, top * (0.6 + n * 0.5) + n * 0.1 + 0.05));
          const [r, g, b] = rampRGB([[0, '#05070b'], [0.35, '#161d2b'], [0.7, '#3d4a66'], [1, '#9aa8c4']], v);
          return [r, g, b, 1];
        })
      }
      under={<g transform="translate(700 20) scale(2.1)"><HarryPaint /></g>}
    />
    <Surface grainSeed={3} vignette={0.6} paper={0.8} />
  </AbsoluteFill>
);
