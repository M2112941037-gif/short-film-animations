import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Riddle} from '../characters/Voldemort';
import {Filters} from '../fx/Filters';

// Turnaround sheet for character pieces — a dev tool, not part of the film.
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#3a4458'}}>
    <Filters />
    <svg width={1920} height={1080}>
      {[0, 1, 2, 3].map((a) => (
        <g key={a} transform={`translate(${260 + a * 460} 1000)`}><Riddle k={2.6} age={a} rim="#e3e8f2" /></g>
      ))}
    </svg>
  </AbsoluteFill>
);
