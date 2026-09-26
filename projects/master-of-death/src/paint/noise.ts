// Seeded simplex noise (after Gustavson), fBm and curl — the wind that moves
// Death's robe, the fog, and the direction field for brush strokes.

const G3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1],
  [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

export const makeNoise = (seed = 1) => {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed * 9301 + 49297;
  for (let i = 255; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const F3 = 1 / 3, G3c = 1 / 6;
  const n3 = (x: number, y: number, z: number) => {
    const s0 = (x + y + z) * F3;
    const i = Math.floor(x + s0), j = Math.floor(y + s0), k = Math.floor(z + s0);
    const t = (i + j + k) * G3c;
    const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else {
      if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
      else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
    }
    const x1 = x0 - i1 + G3c, y1 = y0 - j1 + G3c, z1 = z0 - k1 + G3c;
    const x2 = x0 - i2 + 2 * G3c, y2 = y0 - j2 + 2 * G3c, z2 = z0 - k2 + 2 * G3c;
    const x3 = x0 - 1 + 0.5, y3 = y0 - 1 + 0.5, z3 = z0 - 1 + 0.5;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    const c = (tx: number, ty: number, tz: number, g: number) => {
      let tt = 0.6 - tx * tx - ty * ty - tz * tz;
      if (tt < 0) return 0;
      const gr = G3[g % 12];
      tt *= tt;
      return tt * tt * (gr[0] * tx + gr[1] * ty + gr[2] * tz);
    };
    return 32 * (
      c(x0, y0, z0, perm[ii + perm[jj + perm[kk]]]) +
      c(x1, y1, z1, perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]]) +
      c(x2, y2, z2, perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]]) +
      c(x3, y3, z3, perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]])
    );
  };

  const fbm = (x: number, y: number, z = 0, oct = 5, lac = 2, gain = 0.5) => {
    let a = 0.5, f = 1, sum = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      sum += a * n3(x * f, y * f, z + o * 17.3);
      norm += a;
      a *= gain;
      f *= lac;
    }
    return sum / norm;
  };

  // divergence-free 2D flow from the noise potential
  const curl = (x: number, y: number, z = 0): [number, number] => {
    const e = 0.01;
    const dy = (n3(x, y + e, z) - n3(x, y - e, z)) / (2 * e);
    const dx = (n3(x + e, y, z) - n3(x - e, y, z)) / (2 * e);
    return [dy, -dx];
  };

  return {n3, fbm, curl};
};

export type Noise = ReturnType<typeof makeNoise>;

// Small deterministic PRNG for stroke placement.
export const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
