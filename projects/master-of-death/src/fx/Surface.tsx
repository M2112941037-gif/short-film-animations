import React from 'react';
import {AbsoluteFill} from 'remotion';
import {H, W} from '../theme';

// Paper tooth + painted mottling over the whole frame, then a vignette.
// `seed` lets film grain shimmer between frames while the paper stays put.
export const Surface: React.FC<{grainSeed?: number; vignette?: number; paper?: number}> = ({
  grainSeed = 1,
  vignette = 0.55,
  paper = 1,
}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'soft-light', opacity: 0.55 * paper}}>
      <filter id="mottle" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.004" numOctaves={5} seed={21} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#mottle)" />
    </svg>
    <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'overlay', opacity: 0.22 * paper}}>
      <filter id="tooth" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.55 0.35" numOctaves={2} seed={4} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#tooth)" />
    </svg>
    <svg width={W} height={H} style={{position: 'absolute', mixBlendMode: 'overlay', opacity: 0.12}}>
      <filter id={`grain-${grainSeed}`} colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={grainSeed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter={`url(#grain-${grainSeed})`} />
    </svg>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 45%, rgba(3,4,8,${vignette}) 100%)`,
      }}
    />
  </AbsoluteFill>
);
