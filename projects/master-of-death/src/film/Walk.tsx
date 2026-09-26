import React from 'react';
import {VoldemortSilhouette} from '../characters/Figures';
import {body, foot, RATE, STANCE, STEP} from '../characters/gait';
import {HarryPaint} from '../characters/HarryPaint';
import {ribbon, rgba, trace, type Ctx, type P} from '../paint/canvas';
import type {Noise} from '../paint/noise';
import {FPS, H, W} from '../theme';
import {Pt, smooth} from '../util';
import {SnowWorld} from './Duel';

// 00:57–01:01 — "一步，一步": the walk toward each other, cut close.
// Harry's boots press into the snow and leave prints; then Harry himself,
// walking; then Voldemort's hem gliding over snow it never marks.
const RIM = '#c7d2e6';
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Snow sliding past a tracking camera: soft drifts and glints at every
// depth, nearer ones faster. `v` px/frame at the row y = `feet`.
const groundTrack = (ctx: Ctx, f: number, v: number, horizon: number, feet: number) => {
  ctx.save();
  for (let i = 0; i < 110; i++) {
    const y = horizon + 6 + (H - horizon) * hash(i) ** 1.4;
    const depth = (y - horizon) / (feet - horizon);
    const span = W + 800;
    const x = ((((hash(i + 500) * span + v * depth * f) % span) + span) % span) - 400;
    const glint = i % 3 === 0;
    ctx.fillStyle = rgba(glint ? '#f3f6fb' : '#6f7c99', (glint ? 0.3 : 0.2) * Math.min(1, depth + 0.25));
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + 240 * depth * hash(i + 90), 2 + 11 * depth, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// ——— Harry's boots —————————————————————————————————————————————————————
// A still, low camera; he walks through it from right to left, and the
// prints stay behind. Lengths are at scale 1; each leg has its own depth
// scale `s` (the near leg is bigger and lower).
export const BOOTS_FRAMES = 36;
const D = 294; // how far the planted foot travels either side of the hips
const V = (2 * D) / (STANCE * 2 * STEP); // walking speed: 32 px/frame at scale 1
const PHI0 = Math.PI - 6 * RATE; // the near foot strikes on frame 6 (the far one on 22)
const SINK = 18;

type Leg = {i: 0 | 1; ground: number; s: number; hipDx: number};
const LEGS: Leg[] = [
  {i: 0, ground: 790, s: 1.38, hipDx: 30},
  {i: 1, ground: 880, s: 1.55, hipDx: 0},
];
// the hips' screen x: the near foot comes down around x = 1350
const hipX = (leg: Leg, f: number) => 960 + (478 - V * (f - 6)) * leg.s;

// boot in side view, toe to the left; origin at the bottom of the heel
const BOOT: Pt[] = [[12, -2], [16, -40], [20, -100], [22, -172], [-64, -176], [-70, -120], [-108, -80], [-165, -62], [-212, -44], [-230, -22], [-226, -4], [-205, 2], [-100, 3], [0, 2]];
const SOLE: Pt[] = [[15, 1], [15, -14], [-100, -10], [-205, -8], [-229, -12], [-232, -2], [-212, 7], [-100, 8], [0, 7]];
const ANKLE: P = [-40, -100];
const TOE = -215;

const poseOf = (leg: Leg, f: number) => {
  const st = foot(PHI0 + f * RATE, leg.i);
  const {s} = leg;
  const sink = st.stance ? SINK * s * Math.min(1, st.since / 0.05) : SINK * s * Math.max(0, 1 - (st.since - STANCE) / 0.06);
  const x = hipX(leg, f) - st.a * D * s + 70 * s;
  const y = leg.ground + sink - st.lift * 84 * s;
  const deg = st.pitch * 26;
  const pivot = st.pitch >= 0 ? 0 : TOE;
  const local = (p: P): P => {
    const r = (deg * Math.PI) / 180, dx = p[0] - pivot, dy = p[1];
    return [x + s * (pivot + dx * Math.cos(r) - dy * Math.sin(r)), y + s * (dx * Math.sin(r) + dy * Math.cos(r))];
  };
  return {st, x, y, deg, pivot, sink, ankle: local(ANKLE)};
};

// two-bone reach from hip to ankle; the knee bends forward (to the left)
const knee = (h: P, a: P, T: number, S: number): P => {
  const dx = a[0] - h[0], dy = a[1] - h[1];
  const d = Math.min(Math.hypot(dx, dy), T + S - 1);
  const ang = Math.atan2(dy, dx);
  const A = Math.acos(Math.max(-1, Math.min(1, (T * T + d * d - S * S) / (2 * T * d))));
  const k1: P = [h[0] + T * Math.cos(ang + A), h[1] + T * Math.sin(ang + A)];
  const k2: P = [h[0] + T * Math.cos(ang - A), h[1] + T * Math.sin(ang - A)];
  return k1[0] < k2[0] ? k1 : k2;
};

// a polyline with widths → a closed, smoothed outline; `shift` slides it
// sideways (−1 toward the front edge) for painting light/shadow planes
const limb = (pts: P[], ws: number[], shift = 0) => {
  const L: Pt[] = [], R: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = (b[1] - a[1]) / n, ny = -(b[0] - a[0]) / n;
    const c: P = [p[0] + nx * shift * ws[i], p[1] + ny * shift * ws[i]];
    L.push([c[0] + (nx * ws[i]) / 2, c[1] + (ny * ws[i]) / 2]);
    R.push([c[0] - (nx * ws[i]) / 2, c[1] - (ny * ws[i]) / 2]);
  });
  return smooth([...L, ...R.reverse()], true, 0.3);
};

const lerp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

const Trouser: React.FC<{hip: P; kn: P; ankle: P; s: number; id: string}> = ({hip, kn, ankle, s, id}) => {
  const dir = [ankle[0] - kn[0], ankle[1] - kn[1]];
  const dl = Math.hypot(dir[0], dir[1]) || 1;
  const hem: P = [ankle[0] + (dir[0] / dl) * 34 * s, ankle[1] + (dir[1] / dl) * 34 * s];
  const pts: P[] = [hip, lerp(hip, kn, 0.55), kn, lerp(kn, ankle, 0.5), ankle, hem];
  const ws = [168, 150, 122, 112, 114, 126].map((w) => w * s);
  const base = limb(pts, ws);
  return (
    <g>
      <clipPath id={id}><path d={base} /></clipPath>
      <path d={base} fill="#26324a" />
      <g clipPath={`url(#${id})`}>
        {/* cold key from the upper left: a lit plane down the front, shadow down the back */}
        <path d={limb(pts, ws.map((w) => w * 0.42), -0.42)} fill="#3d4d6e" />
        <path d={limb(pts, ws.map((w) => w * 0.16), -0.47)} fill="#56688c" opacity={0.7} />
        <path d={limb(pts, ws.map((w) => w * 0.4), 0.42)} fill="#161d2d" />
        {/* folds behind the knee and bunching over the boot */}
        {[-0.08, 0.04, 0.14].map((u, i) => {
          const c = lerp(kn, ankle, u);
          return <path key={i} d={`M${c[0] + 8 * s},${c[1] - 6 * s} q${30 * s},${10 * s} ${56 * s},${-4 * s}`} stroke="#0f1420" strokeWidth={7 * s} fill="none" strokeLinecap="round" opacity={0.7} />;
        })}
        {[0.72, 0.84, 0.94].map((u, i) => {
          const c = lerp(kn, hem, u);
          return <path key={i} d={`M${c[0] - 58 * s},${c[1] - 4 * s} q${40 * s},${14 * s} ${96 * s},${-2 * s}`} stroke={i % 2 ? '#141a28' : '#4a5b7e'} strokeWidth={6 * s} fill="none" strokeLinecap="round" opacity={0.75} />;
        })}
        <path d={`M${hem[0] - 60 * s},${hem[1] - 6 * s} q${60 * s},${16 * s} ${120 * s},0`} stroke="#e6ecf3" strokeWidth={6 * s} fill="none" opacity={0.55} />
      </g>
    </g>
  );
};

const Boot: React.FC<{x: number; y: number; s: number; deg: number; pivot: number; lifted: boolean}> = ({x, y, s, deg, pivot, lifted}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${deg} ${pivot} 0)`}>
    <path d={smooth(BOOT, true, 0.25)} fill="#3b2a22" />
    <path d={smooth([[-212, -44], [-165, -62], [-108, -80], [-86, -104], [-100, -70], [-160, -46], [-214, -30]], true, 0.3)} fill="#6d4f3d" />
    <path d={smooth([[-205, -40], [-172, -54], [-178, -46]], true, 0.3)} fill="#a88468" opacity={0.6} />
    <path d={smooth([[12, -2], [16, -40], [20, -100], [22, -172], [2, -170], [-2, -100], [-6, -40], [-8, -4]], true, 0.25)} fill="#1f1612" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${-112 + i * 11},${-76 - i * 12} l${-16},${-6} M${-112 + i * 11},${-76 - i * 12} l${14},${-10}`} stroke="#15100d" strokeWidth={3} strokeLinecap="round" />
    ))}
    <path d={smooth(SOLE, true, 0.2)} fill="#17120f" />
    <path d={`M${-228},${-10} Q${-120},${-12} ${14},${-14}`} stroke="#5a4538" strokeWidth={2.4} fill="none" />
    {/* snow packed into the tread shows as the foot comes up */}
    {lifted && <path d={smooth([[12, 5], [-100, 7], [-210, 5], [-222, 1], [-100, 2], [10, 1]], true, 0.3)} fill="#e6ecf3" opacity={0.85} />}
    {/* snow caked on the toe */}
    <path d={smooth([[-228, -12], [-214, -30], [-196, -24], [-204, -8]], true, 0.4)} fill="#e9eef5" opacity={0.7} />
  </g>
);

// a footprint seen from low down: a pressed hollow, a bright crumbled lip
const Print: React.FC<{x: number; g: number; s: number}> = ({x, g, s}) => (
  <g transform={`translate(${x} ${g}) scale(${s})`}>
    <ellipse cx={-108} cy={2} rx={150} ry={22} fill="#dfe6ef" opacity={0.7} />
    <path d={smooth([[12, 0], [2, -9], [-60, -11], [-120, -13], [-190, -14], [-226, -6], [-230, 3], [-200, 11], [-130, 10], [-70, 8], [-8, 7]], true, 0.35)} fill="#7f8ca9" />
    <path d={smooth([[8, -2], [-60, -10], [-190, -13], [-222, -5], [-190, -6], [-60, -4]], true, 0.35)} fill="#56627f" />
    {[-30, -70, -110, -150, -185].map((tx) => (
      <path key={tx} d={`M${tx},${-5} l${-12},${8}`} stroke="#6a7794" strokeWidth={4} strokeLinecap="round" />
    ))}
    <path d={`M${-228},${6} Q${-110},${22} ${14},${8}`} stroke="#f6f9fc" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// the snow in front of a planted boot, heaped up: it hides the sunk sole
const Lip: React.FC<{x: number; g: number; s: number; amt: number}> = ({x, g, s, amt}) => (
  <g transform={`translate(${x} ${g}) scale(${s})`} opacity={amt}>
    <path d={smooth([[60, 30], [40, 2], [0, -3], [-60, 1], [-120, -4], [-180, 0], [-240, -2], [-280, 30]], true, 0.35)} fill="#cdd5e3" />
    <path d={`M${-262},${4} Q${-200},${-6} ${-140},${0} T${-10},${-2} T${48},${6}`} stroke="#f4f7fb" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

const strikesOf = (leg: Leg, upTo: number) => {
  const out: number[] = [];
  for (let n = -3; n < 4; n++) {
    const f = (2 * Math.PI * n + leg.i * Math.PI - PHI0) / RATE;
    if (f <= upTo && f > -60) out.push(f);
  }
  return out;
};

// snow kicked up at each strike, and flicked back off the toe as it leaves
const Spray: React.FC<{leg: Leg; frame: number}> = ({leg, frame}) => (
  <g>
    {strikesOf(leg, frame).flatMap((fs) =>
      [0, 1].flatMap((kind) => {
        const f0 = kind ? fs + STANCE * 2 * STEP : fs;
        const age = frame - f0;
        if (age < 0 || age > 15) return [];
        const x0 = hipX(leg, f0) + (kind ? D : -D) * leg.s + 70 * leg.s;
        return Array.from({length: kind ? 12 : 26}, (_, j) => {
          const r = (k: number) => hash(fs * 13.1 + j * 7.7 + k + kind * 50 + leg.i * 90);
          const vx = (kind ? 5 + 9 * r(1) : -8 + 13 * r(1)) * leg.s;
          const vy = -(kind ? 4 + 6 * r(2) : 3 + 9 * r(2)) * leg.s;
          const x = x0 + (kind ? TOE : -230 * r(4)) * leg.s + vx * age;
          const y = leg.ground + (vy * age + 0.75 * age * age) * leg.s;
          if (y > leg.ground + 20) return [];
          const sz = (2.5 + 6 * r(3)) * leg.s;
          return [<ellipse key={`${fs}-${kind}-${j}`} cx={x} cy={y} rx={sz * 1.3} ry={sz} fill="#f4f7fb" opacity={0.9 * (1 - age / 15)} />];
        });
      }),
    )}
  </g>
);

const LegView: React.FC<{leg: Leg; frame: number; hipY: number}> = ({leg, frame, hipY}) => {
  const {s} = leg;
  const pz = poseOf(leg, frame);
  const hip: P = [hipX(leg, frame) + 30 * s + leg.hipDx, hipY];
  const kn = knee(hip, pz.ankle, 500 * s, 500 * s);
  return (
    <g>
      <Boot x={pz.x} y={pz.y} s={s} deg={pz.deg} pivot={pz.pivot} lifted={!pz.st.stance && pz.st.lift > 0.1} />
      <Trouser hip={hip} kn={kn} ankle={pz.ankle} s={s} id={`tr-${leg.i}`} />
      {pz.sink > 1 && <Lip x={pz.x + 10 * s} g={leg.ground} s={s} amt={Math.min(1, pz.sink / (SINK * s * 0.6))} />}
    </g>
  );
};

export const Boots: React.FC<{frame: number}> = ({frame}) => {
  const phi = PHI0 + frame * RATE;
  const hipOf = (leg: Leg) => leg.ground - leg.s * 1040 + (1 - body(phi).bob) * 22 * leg.s;
  const prints = (leg: Leg) =>
    strikesOf(leg, frame).map((fs) => <Print key={fs} x={hipX(leg, fs) - D * leg.s + 70 * leg.s} g={leg.ground} s={leg.s} />);
  return (
    <SnowWorld
      frame={frame}
      id="bt"
      horizon={250}
      wind={1.2}
      snow={0.7}
      before={(ctx) => groundTrack(ctx, frame, 0, 250, 880)}
      under={
        <>
          {prints(LEGS[0])}
          <LegView leg={LEGS[0]} frame={frame} hipY={hipOf(LEGS[0])} />
          <rect x={0} y={0} width={W} height={H} fill="#8d9ab4" opacity={0.12} />
          <Spray leg={LEGS[0]} frame={frame} />
          {prints(LEGS[1])}
          <LegView leg={LEGS[1]} frame={frame} hipY={hipOf(LEGS[1])} />
          <Spray leg={LEGS[1]} frame={frame} />
        </>
      }
    />
  );
};

// ——— Harry, walking ————————————————————————————————————————————————————
// Head and shoulders, turned toward where Voldemort is coming from (our
// left). The whole body rises over each planted foot and settles at each
// strike; the shoulders roll a little; the snow streams past.
export const HARRY_WALKS_FRAMES = 38;
const PHI_W = 0.3;
export const HARRY_WALK_STRIKES = [1, 2].map((n) => (n * Math.PI - PHI_W) / RATE);

const farDrifts = (ctx: Ctx, noise: Noise, f: number, v: number, horizon: number) => {
  ctx.save();
  for (const [dy, a, sp, c] of [[0, 0.55, 0.4, '#7a87a3'], [18, 0.5, 1, '#9aa6be']] as [number, number, number, string][]) {
    ctx.fillStyle = rgba(c, a);
    ctx.beginPath();
    ctx.moveTo(0, horizon + 60);
    for (let x = 0; x <= W; x += 30) ctx.lineTo(x, horizon + dy - 14 - 20 * (noise.n3((x - v * sp * f) * 0.003, 7 + dy, 0) + 1));
    ctx.lineTo(W, horizon + 60);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

export const HarryWalks: React.FC<{frame: number}> = ({frame}) => {
  const phi = PHI_W + frame * RATE;
  const {bob, sway} = body(phi);
  const z = 1.55;
  const x = 800 + sway * 6;
  const y = 36 + (1 - bob) * 14;
  const roll = -2.2 + 0.9 * Math.sin(phi);
  return (
    <SnowWorld
      frame={frame}
      id="hw"
      horizon={660}
      wind={7}
      before={(ctx, noise) => {
        farDrifts(ctx, noise, frame, 5, 660);
        groundTrack(ctx, frame, 12, 660, 1000);
      }}
      under={
        <>
          <g transform={`translate(330 ${672 - frame * 0.1})`}><VoldemortSilhouette k={0.42 + frame * 0.002} rim={RIM} /></g>
          <g transform={`translate(${x} ${y}) scale(${z}) rotate(${roll} 200 460)`}>
            <HarryPaint id="hw-harry" shine={frame / FPS} look={-3} brow={0.4} lid={0.2} smile={0} />
          </g>
        </>
      }
    />
  );
};

// ——— Voldemort's hem ————————————————————————————————————————————————————
// He moves the other way (to the right); his robe trails and ripples a hand
// above the snow — and the snow under it stays smooth.
export const HEM_FRAMES = 30;
const HEM_V = -24;

// one heavy fall of black cloth, trailing left; the hem hangs in scallops
// (the folds) and ripples, and never touches the snow
const robe = (ctx: Ctx, noise: Noise, t: number) => {
  const hemY = (x: number) => 790 + 16 * Math.sin(x * 0.03 + t * 5) + 8 * noise.n3(x * 0.01 + t * 2, 0.5, 3);
  const edge = (x0: number, lean: number) =>
    trace([x0, -60], [lean, 1], 30, 30, (p) => {
      const [fx] = noise.curl(p[0] * 0.002, p[1] * 0.002, t * 0.9);
      return [lean * (0.4 + p[1] / 700) + fx * 0.35 * (p[1] / 800), 1];
    }, 0.85).filter((p) => p[1] < hemY(p[0]));
  const back = edge(640, -0.45);
  const front = edge(1240, -0.12);
  const b0 = back[back.length - 1], f0 = front[front.length - 1];
  const hem: P[] = [];
  for (let x = f0[0]; x >= b0[0]; x -= 12) hem.push([x, hemY(x)]);
  ctx.save();
  ctx.beginPath();
  [...front, ...hem, ...back.slice().reverse()].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = '#090b10';
  ctx.fill();
  ctx.clip();
  // folds: long soft ribbons of light and deeper dark running down the cloth
  for (let i = 0; i < 16; i++) {
    const x0 = 600 + i * 42;
    const pts = trace([x0, -60], [-0.2, 1], 30, 30, (p) => {
      const [fx] = noise.curl(p[0] * 0.002, p[1] * 0.002, t * 0.9 + i * 0.01);
      return [-0.25 * (0.4 + p[1] / 700) + fx * 0.3 * (p[1] / 800), 1];
    }, 0.85);
    ctx.fillStyle = rgba(i % 3 === 0 ? '#2b3549' : i % 3 === 1 ? '#161b26' : '#030406', i % 3 === 0 ? 0.55 : 0.8);
    ribbon(ctx, pts, (u) => (i % 3 === 0 ? 10 : 22) * (0.6 + 0.9 * u));
    ctx.fill();
  }
  ctx.restore();
  // the ragged edge frays into dark air
  ctx.save();
  hem.forEach(([x, y], j) => {
    if (j % 4) return;
    ctx.fillStyle = rgba('#0b0d12', 0.16);
    ctx.beginPath();
    ctx.ellipse(x - 26, y + 6, 34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

export const HemGlide: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / FPS;
  return (
    <SnowWorld
      frame={frame}
      id="hg"
      horizon={250}
      wind={-7}
      snow={0.7}
      before={(ctx, noise) => {
        groundTrack(ctx, frame, HEM_V, 250, 860);
        robe(ctx, noise, t);
      }}
      under={
        <g>
          {/* loose flakes lifted in his wake — but not one mark in the snow */}
          {Array.from({length: 18}, (_, j) => {
            const life = (t * 0.9 + hash(j)) % 1;
            const x = 520 + hash(j + 30) * 700 - life * 260;
            const y = 836 - life * (60 + 120 * hash(j + 60));
            return <circle key={j} cx={x} cy={y} r={2 + 3 * hash(j + 7)} fill="#eef2f8" opacity={0.7 * Math.sin(Math.PI * life)} />;
          })}
          {/* and shards of him, flaking off */}
          {Array.from({length: 8}, (_, j) => {
            const life = (t * 0.7 + j / 8) % 1;
            const x = 700 + hash(j + 3) * 500 - life * 380;
            const y = 780 - life * 420 - hash(j + 9) * 200;
            return <path key={`s${j}`} d="M0,0 l14,-9 l-4,18Z" fill="#0b0d12" opacity={0.8 * (1 - life)} transform={`translate(${x} ${y}) rotate(${life * 240 + j * 40})`} />;
          })}
        </g>
      }
    />
  );
};
