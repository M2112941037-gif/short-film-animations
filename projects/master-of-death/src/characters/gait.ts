// A walk cycle, shared by every walking figure so steps, bob and sound agree.
// `phi` is the stride phase in radians: one full turn = two steps. Foot 0
// strikes the ground at phi = 0, foot 1 at phi = π. Each foot stays planted
// (stance) for 57.5 % of the cycle, then swings through.
export const STANCE = 0.575;
// an unhurried, deliberate pace: one step every 16 frames (2/3 s)
export const STEP = 16;
export const RATE = Math.PI / STEP;

export type FootState = {
  a: number;       // fore–aft, −1 (behind the hips) … +1 (ahead)
  lift: number;    // 0 on the ground … 1 at the top of the swing
  stance: boolean;
  pitch: number;   // toe up (+) / heel up (−), −1..1: heel strike, roll, toe-off
  since: number;   // cycle fraction since this foot last struck
};

const smoothstep = (u: number) => u * u * (3 - 2 * u);

export const foot = (phi: number, which: 0 | 1): FootState => {
  const u = ((((phi + (which ? -Math.PI : 0)) / (2 * Math.PI)) % 1) + 1) % 1;
  if (u < STANCE) {
    const s = u / STANCE;
    // just after the strike the toe is still up and slaps down; late in
    // stance the heel peels up and the foot rolls onto its toe
    const pitch = s < 0.12 ? 0.5 * (1 - s / 0.12) : s > 0.72 ? -(((s - 0.72) / 0.28) ** 1.4) : 0;
    return {a: 1 - 2 * s, lift: 0, stance: true, pitch, since: u};
  }
  const s = (u - STANCE) / (1 - STANCE);
  const pitch = s < 0.3 ? -1 + (s / 0.3) * 1.1 : s > 0.75 ? 0.1 + ((s - 0.75) / 0.25) * 0.4 : 0.1;
  return {a: -1 + 2 * smoothstep(s), lift: Math.sin(Math.PI * Math.min(1, s * 1.1)) ** 1.2, stance: false, pitch, since: u};
};

// body: `bob` 0 (lowest, at each strike) … 1 (highest, mid-stance);
// `sway` −1..1 leans over the planted foot (−1 = over foot 0).
export const body = (phi: number) => ({bob: (1 - Math.cos(2 * phi)) / 2, sway: -Math.sin(phi)});
