import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {SF01Death} from '../styleframes/SF01Death';

// 00:00–00:07. Black. A bone hand holding a balance, nothing else; the
// balance sways. Then the camera pulls back hard: the balance is a trinket
// in Death's hand, two people stand on its pans — and their larger selves
// are thrown out into the foreground.
// Runs 180 frames; the last 12 overlap the skull mountain as it dissolves in.
export const OPENING_FRAMES = 180;

export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  const ease = Easing.bezier(0.7, 0, 0.2, 1);
  const pull = interpolate(f, [70, 86], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const push = interpolate(f, [14, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // then dive toward Voldemort's small pan: the next shot opens on it
  const dive = interpolate(f, [140, 176], [0, 1], {easing: Easing.in(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const closeZ = 2.6 + push * 0.18;
  const z0 = closeZ + (1 - closeZ) * pull;
  const z = z0 * Math.pow(7, dive);
  const cx = 960 + (932 - 960) * (1 - pull) + (780 - 960) * dive;
  const cy = 540 + (566 - 540) * (1 - pull) + (705 - 540) * dive;
  // the balance swings from being picked up, then settles toward level
  const sway = 3.2 * Math.sin(f * 0.11) * Math.exp(-f / 120) + 1.2 * interpolate(f, [86, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const proj = interpolate(f, [92, 122], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = interpolate(f, [8, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <SF01Death frame={f} tilt={sway} cam={{z, cx, cy}} proj={proj} fade={fade} />;
};
