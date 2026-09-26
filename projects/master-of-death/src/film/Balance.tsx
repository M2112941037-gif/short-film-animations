import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {PanCrowd} from '../characters/Figures';
import {Riddle} from '../characters/Voldemort';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {noiseField, rampRGB, rgba} from '../paint/canvas';
import {drawDeath, drawSleeve} from '../paint/death';
import {Painted} from '../paint/Painted';
import {SkullPile} from '../props/Skulls';
import {Scale} from '../props/Scale';
import {FPS, H, W} from '../theme';

// The weighing itself, shown plainly: Death's hand holds the balance up in
// front of its robe; on the left pan the skull mountain with Voldemort on
// top, on the right Harry and his people. The beam tips toward Voldemort.
// `tilt` degrees (positive = left pan down), `growth` of the mountain,
// `others` 0..1 for the people with Harry, `harry` 0 when he's been taken.
export const Balance: React.FC<{frame: number; tilt: number; growth: number; others: number; harry?: number; push?: number}> = ({
  frame, tilt, growth, others, harry = 1, push = 0,
}) => {
  const t = frame / FPS + 40;
  const ring: [number, number] = [960, 150];
  const L = 520;
  const py = -200, base = -4;
  const top = py + (1 - growth) * (base - py);
  const z = 1 + 0.06 * push;
  const cy = 560 + 90 * Math.max(0, push - 1); // follow the sinking pan down
  const camT = `translate(${W / 2 - 960 * z} ${H / 2 - cy * z}) scale(${z})`;
  return (
    <AbsoluteFill style={{background: '#05070b'}}>
      <Filters />
      <Painted
        renderKey={`bal-${frame}-${tilt.toFixed(2)}-${growth.toFixed(3)}-${others.toFixed(2)}-${harry}`}
        flow="swirl"
        before={(ctx, noise) => {
          ctx.save();
          ctx.transform(z, 0, 0, z, W / 2 - 960 * z, H / 2 - cy * z);
          noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0015, t: t * 0.05, warp: 0.6}, (x, y, n) => {
            const pool = Math.exp(-(((x - 960) / 640) ** 2 + ((y - 60) / 520) ** 2));
            const v = Math.max(0, Math.min(1, pool * (0.6 + n * 0.5) + n * 0.1 + 0.04));
            const [r, g, b] = rampRGB([[0, '#04060a'], [0.3, '#111723'], [0.6, '#2c3850'], [1, '#8d9cbb']], v);
            return [r, g, b, 1];
          });
          // Death's robe as a dark wall behind the balance, hood out of frame
          drawDeath(ctx, noise, {cx: 960, cy: -330, k: 1.7, t, rim: '#7888aa', glowAmt: 0});
          drawSleeve(ctx, noise, [220, -140], [ring[0] - 318, ring[1] - 34], {w: 160, t, rim: '#7888aa'});
          // the top light falling on the balance
          const g = ctx.createRadialGradient(960, 80, 20, 960, 80, 760);
          g.addColorStop(0, rgba('#a9b8d4', 0.42));
          g.addColorStop(1, rgba('#a9b8d4', 0));
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }}
        under={
          <g transform={camT}>
            <g transform={`translate(${ring[0]} ${ring[1]})`}>
              <Scale
                L={L}
                tilt={tilt}
                left={
                  <g>
                    <SkullPile px={0} py={py} baseY={base} spread={185} count={170} seed="bal" rim="#dfe4ee" top="#6a7080" bottom="#12151c" kTop={0.1} kBottom={0.22} growth={growth} />
                    <g transform={`translate(0 ${top + 12})`}><Riddle k={0.6} age={3 * Math.min(1, growth / 0.95)} rim="#e3e8f2" t={t} flutter={1} /></g>
                  </g>
                }
                right={harry > 0 ? <g opacity={harry}><PanCrowd k={2.6} others={others} rim="#b9c2d4" /></g> : undefined}
              />
            </g>
            <g transform={`translate(${ring[0] - 318} ${ring[1] - 40}) rotate(14)`}>
              <BoneHand k={2.7} curl={0.62} spread={0.75} thumb={0.8} hook={0.7} forearm={20} />
            </g>
          </g>
        }
      />
      <Snow frame={frame} layer="far" count={150} seed="bal" wind={0.2} color="#c9d2e2" />
      <Snow frame={frame} layer="mid" count={36} seed="bal" wind={0.2} />
      <Surface grainSeed={frame} vignette={0.65} />
    </AbsoluteFill>
  );
};
