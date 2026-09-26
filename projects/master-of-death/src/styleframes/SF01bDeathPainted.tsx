import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoneHand} from '../characters/Death';
import {HarryMini, VoldemortMini} from '../characters/Minis';
import {Filters} from '../fx/Filters';
import {Snow} from '../fx/Snow';
import {Surface} from '../fx/Surface';
import {buffer, noiseField, rampRGB, rgba} from '../paint/canvas';
import {rasterize} from '../paint/rasterize';
import {drawDeath, drawSleeve} from '../paint/death';
import {makeNoise} from '../paint/noise';
import {PaintCanvas} from '../paint/PaintCanvas';
import {paintStrokes} from '../paint/painter';
import {Scale} from '../props/Scale';
import {H, W} from '../theme';

// 00:04, painted: Death in a column of cold light, robe lifting into smoke.
export const SF01bDeathPainted: React.FC<{frame?: number; tilt?: number}> = ({frame = 40, tilt = 1.5}) => {
  const ring: [number, number] = [980, 548];
  const t = frame / 24;
  const draw = async (out: CanvasRenderingContext2D) => {
    const noise = makeNoise(7);
    const {c: uc, ctx} = buffer(W, H);

    // backdrop: fog lit from above, a pale column falling behind the hood
    noiseField(ctx, W, H, noise, {scale: 4, freq: 0.0013, t: t * 0.05, warp: 0.5}, (x, y, n) => {
      const pool = Math.exp(-(((x - 960) / 520) ** 2 + ((y - 60) / 420) ** 2));
      const shaft = Math.exp(-(((x - 960) / (170 + y * 0.35)) ** 2)) * (1 - y / H) * 0.8;
      const light = Math.min(1, pool * 0.9 + shaft * 0.6);
      const v = Math.max(0, Math.min(1, light * (0.75 + n * 0.6) + n * 0.1 + 0.06));
      const [r, g, b] = rampRGB([[0, '#05070b'], [0.25, '#121925'], [0.5, '#2a3548'], [0.75, '#56668a'], [1, '#aab7d0']], v);
      return [r, g, b, 1];
    });

    drawDeath(ctx, noise, {cx: 960, cy: 330, k: 1, t, rim: '#7888aa', faceLight: 0.92});
    drawSleeve(ctx, noise, [600, 650], [836, 540], {w: 130, t, rim: '#7888aa'});
    // the balance, the two people and the hand join the underpainting
    const props = await rasterize(
      <>
        <g transform={`translate(${ring[0]} ${ring[1]})`}>
          <Scale L={235} tilt={tilt} left={<VoldemortMini k={1.05} rim="#8a97b0" />} right={<HarryMini k={1} rim="#8a97b0" />} />
        </g>
        <g transform="translate(848 534) rotate(14)">
          <BoneHand k={1.25} curl={0.72} spread={0.8} thumb={0.8} forearm={14} />
        </g>
      </>,
    );
    ctx.drawImage(props, 0, 0);

    // paint it
    const src = ctx.getImageData(0, 0, W, H);
    out.fillStyle = '#05070b';
    out.fillRect(0, 0, W, H);
    paintStrokes(src, out, {
      radii: [18, 9, 4.5, 2.2, 1.3],
      threshold: 18,
      maxLen: 12,
      colorTol: 34,
      jitter: 0.07,
      seed: 11,
      flow: (x, y) => noise.fbm(x * 0.0016, y * 0.0016, 3, 3) * Math.PI * 2 - 0.3,
    });
    // bring back the glow the strokes flattened
    out.save();
    out.globalCompositeOperation = 'screen';
    const gl = out.createRadialGradient(960, 40, 20, 960, 40, 620);
    gl.addColorStop(0, rgba('#9fb0d0', 0.35));
    gl.addColorStop(1, rgba('#9fb0d0', 0));
    out.fillStyle = gl;
    out.fillRect(0, 0, W, H);
    out.restore();
    void uc;
  };

  return (
    <AbsoluteFill style={{background: '#05070b'}}>
      <Filters />
      <PaintCanvas draw={draw} renderKey={`sf01b-${frame}`} />
      <Snow frame={frame} layer="far" count={140} seed="sf1" wind={0.2} color="#c9d2e2" />
      <Snow frame={frame} layer="mid" count={36} seed="sf1" wind={0.2} color="#dfe5ef" />
      <Snow frame={frame} layer="near" count={6} seed="sf1" wind={0.2} opacity={0.6} />
      <Surface grainSeed={frame} vignette={0.65} paper={0.6} />
    </AbsoluteFill>
  );
};
