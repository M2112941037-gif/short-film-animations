# 死亡的主人 · The Master of Death

Script: `master_of_death_script.md` · art reference: `public/reference/environment.png`

Everything on screen is drawn in code (Remotion + Canvas 2D). No image generation, no external art.

## How a frame is made

1. **Underpainting**: the vector scene (React SVG components in `src/characters`, `src/props`) is rasterized, and canvas-native passes add fog and cloth (`src/paint/canvas.ts`, `src/paint/death.ts`).
2. **Painting**: `src/paint/painter.ts` re-paints the underpainting with curved, multi-size brush strokes that follow the contours, with bristle streaks. This follows Hertzmann's layered painterly rendering.
3. **Overlays**: things that must stay sharp or read cleanly go on top: carved text, subtitles, falling snow, paper grain and vignette.

Death's robe is not a fixed shape. Its tattered tongues and smoke are traced through a curl-noise wind field (`src/paint/noise.ts`), so they move when `t` changes.

## Commands

```bash
npm install
npm run fonts      # re-subset fonts after changing any Chinese text in src/
npm run stills     # render style frames to out/stills/
npm run studio     # preview
```

Style frames for review live in `styleframes/`.

## Design decisions (agreed with the director)

- **Red/green rim light belongs to SF01 only** (Death holding the balance, Voldemort green, Harry red). It was designed for that composition. Do not reuse it in other shots.
- Death has no face. The hood holds only darkness.
- No visible light sources or lens-flare hot spots. Light shows up as rims and rays whose origin is hidden.
- Brushwork stays fine and layered, never blocky.
