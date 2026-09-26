import React from 'react';
import {Composition, Still} from 'remotion';
import {loadFonts} from './fonts';
import {SF01Death} from './styleframes/SF01Death';
import {SF02SkullMountain} from './styleframes/SF02SkullMountain';
import {SF03Gravestone} from './styleframes/SF03Gravestone';
import {FPS, H, W} from './theme';
import {Opening, OPENING_FRAMES} from './film/Opening';
import {CharacterSheet} from './styleframes/CharacterSheet';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Opening" component={Opening} durationInFrames={OPENING_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="SF01-Death" component={SF01Death} width={W} height={H} />
    <Still id="SF02-SkullMountain" component={SF02SkullMountain} width={W} height={H} />
    <Still id="SF03-Gravestone" component={SF03Gravestone} width={W} height={H} />
    <Still id="CharacterSheet" component={CharacterSheet} width={W} height={H} />
  </>
);
