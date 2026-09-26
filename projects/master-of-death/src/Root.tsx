import React from 'react';
import {Composition, Still} from 'remotion';
import {loadFonts} from './fonts';
import {SF01Death} from './styleframes/SF01Death';
import {SF02SkullMountain} from './styleframes/SF02SkullMountain';
import {SF03Gravestone} from './styleframes/SF03Gravestone';
import {FPS, H, RES, W} from './theme';
import {Opening, OPENING_FRAMES} from './film/Opening';
import {CharacterSheet} from './styleframes/CharacterSheet';

loadFonts();

// Lay every composition out in 1920×1080 units and scale the whole stage,
// so preview renders (RES < 1) keep the exact framing of the final.
const staged = <P extends object>(C: React.ComponentType<P>): React.FC<P> => (props) => (
  <div style={{position: 'absolute', width: W, height: H, transform: `scale(${RES})`, transformOrigin: '0 0'}}>
    <C {...props} />
  </div>
);
const size = {width: Math.round(W * RES), height: Math.round(H * RES)};
const OpeningS = staged(Opening);
const SF01S = staged(SF01Death);
const SF02S = staged(SF02SkullMountain);
const SF03S = staged(SF03Gravestone);
const SheetS = staged(CharacterSheet);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Opening" component={OpeningS} durationInFrames={OPENING_FRAMES} fps={FPS} {...size} />
    <Still id="SF01-Death" component={SF01S} {...size} />
    <Still id="SF02-SkullMountain" component={SF02S} {...size} />
    <Still id="SF03-Gravestone" component={SF03S} {...size} />
    <Still id="CharacterSheet" component={SheetS} {...size} />
  </>
);
