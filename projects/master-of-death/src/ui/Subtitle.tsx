import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../theme';
import type {Line} from '../text';

// Bilingual subtitle: Chinese above in Noto Serif SC, English below in
// Cormorant italic — quiet, bookish, never louder than the picture.
export const Subtitle: React.FC<{line: Line; opacity?: number; bottom?: number}> = ({line, opacity = 1, bottom = 78}) => (
  <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom, opacity}}>
    <div
      style={{
        fontFamily: FONT.zh,
        fontWeight: 400,
        fontSize: 40,
        letterSpacing: '0.18em',
        color: '#efebe2',
        textShadow: '0 0 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
        maxWidth: 1400,
        textAlign: 'center',
        lineHeight: 1.5,
      }}
    >
      {line.zh}
    </div>
    <div
      style={{
        marginTop: 10,
        fontFamily: FONT.en,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 30,
        letterSpacing: '0.04em',
        color: '#c4c7ce',
        textShadow: '0 0 14px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8)',
        maxWidth: 1400,
        textAlign: 'center',
      }}
    >
      {line.en}
    </div>
  </AbsoluteFill>
);
