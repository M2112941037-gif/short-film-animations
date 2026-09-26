import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {SF01Death} from '../styleframes/SF01Death';

// 00:00–00:07. Black. A bone hand holding a balance, nothing else; the
// balance sways. Then the camera pulls back hard: the balance is a trinket
// in Death's hand, two people stand on its pans — and their larger selves
// are thrown out into the foreground.
export const OPENING_FRAMES = 168;

export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const ease = Easing.bezier(0.7, 0, 0.2, 1);
  const pull = interpolate(f, [86, 104], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const push = interpolate(f, [14, 86], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const closeZ = 2.6 + push * 0.18;
  const z = closeZ + (1 - closeZ) * pull;
  const cx = 960 + (932 - 960) * (1 - pull);
  const cy = 540 + (566 - 540) * (1 - pull);
  // the balance swings from being picked up, then settles toward level
  const sway = 3.2 * Math.sin(f * 0.11) * Math.exp(-f / 120) + 1.2 * interpolate(f, [100, 168], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const proj = interpolate(f, [112, 146], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = interpolate(f, [8, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <SF01Death frame={f} tilt={sway} cam={{z, cx, cy}} proj={proj} fade={fade} />;
};
