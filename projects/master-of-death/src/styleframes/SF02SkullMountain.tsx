import React from 'react';
import {SkullMountain} from '../film/SkullMountain';

// Style frame: the skull-mountain shot at the moment of the first narration line.
export const SF02SkullMountain: React.FC<{frame?: number}> = ({frame = 216}) => <SkullMountain frame={frame} />;
