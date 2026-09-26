import {continueRender, delayRender, staticFile} from 'remotion';
import manifest from '../public/fonts/fonts.json';

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    manifest.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        style: f.style,
        weight: f.weight,
      });
      document.fonts.add(face);
      return face.load();
    }),
  ).then(() => continueRender(handle));
};
