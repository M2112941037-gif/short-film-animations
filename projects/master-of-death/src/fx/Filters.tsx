import React from 'react';

// Shared SVG filters. Render <Filters/> once per scene; every other SVG in the
// document can reference them by id.
//   rough-*  hand-drawn wobble on edges (turbulence displacement)
//   brush    streaky paint texture inside a fill, alpha preserved
//   paint    rough + brush together — the default look for painted shapes
//   glow-*   additive light bloom
//   blur-*   depth-of-field softening
export const FilterDefs: React.FC = () => (
    <defs>
      {([
        ['rough-s', 0.05, 2.5],
        ['rough-m', 0.025, 6],
        ['rough-l', 0.012, 14],
      ] as const).map(([id, f, s]) => (
        <filter key={id} id={id} colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={3} seed={7} result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale={s} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ))}

      <filter id="brush" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.035" numOctaves={4} seed={3} result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feBlend in="g" in2="SourceGraphic" mode="soft-light" result="b" />
        <feComposite in="b" in2="SourceGraphic" operator="in" />
      </filter>

      <filter id="paint" colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={11} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.004" numOctaves={4} seed={5} result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feBlend in="g" in2="d" mode="soft-light" result="b" />
        <feComposite in="b" in2="d" operator="in" />
      </filter>

      {([
        ['glow-s', 4],
        ['glow-m', 12],
        ['glow-l', 30],
      ] as const).map(([id, sd]) => (
        <filter key={id} id={id} colorInterpolationFilters="sRGB" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={sd} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}

      {([1.5, 3, 6, 12, 24] as const).map((sd) => (
        <filter key={sd} id={`blur-${sd}`} colorInterpolationFilters="sRGB" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={sd} />
        </filter>
      ))}
    </defs>
);

export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <FilterDefs />
  </svg>
);
