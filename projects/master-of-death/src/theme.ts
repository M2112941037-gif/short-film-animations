// Palette sampled from public/reference/environment.png, with the story colours
// (Gryffindor red, Harry's green, snitch gold, spell light) pushed brighter on
// purpose: dark colours build the mood, bright colours tell the story.

export const C = {
  // base — ink, slate, cold grey, snow
  void: '#07090d',
  ink: '#0e1218',
  ink2: '#1e242d',
  slate: '#2d3745',
  slate2: '#3f4b5e',
  dusk: '#53607e',
  mist: '#7d879b',
  grey: '#9ea2ac',
  snowShade: '#c3cad6',
  snow: '#e9ecf1',
  snowLight: '#fbfcfd',

  // support — the reference swatches as sampled
  wine: '#652e34',
  brass: '#bf985f',
  pine: '#214842',

  // warm horizon
  ember: '#c98a6b',
  amber: '#e8b27c',
  candle: '#ffcf87',

  // story colours
  gryffRed: '#b3222a',
  gryffGold: '#e0a93c',
  harryGreen: '#3fbf6f',
  snitch: '#f5c542',
  snitchHot: '#fff2b3',
  stoneGlow: '#ffb45e',
  spellRed: '#ff4632',
  spellGreen: '#39ff88',
  bone: '#d9d4c7',
  boneShade: '#8f8a80',
} as const;

export const FONT = {
  zh: "'Noto Serif SC', serif",
  en: "'Cormorant Garamond', serif",
  carve: "'Cinzel', serif",
};

export const W = 1920;
export const H = 1080;
export const FPS = 24;

// Preview renders set REMOTION_RES=0.5: every canvas, rasterized layer and
// brush works at that fraction of the pixels; layout stays in 1920×1080 units.
export const RES = Number(process.env.REMOTION_RES) || 1;
export const px = (n: number) => n * RES;
