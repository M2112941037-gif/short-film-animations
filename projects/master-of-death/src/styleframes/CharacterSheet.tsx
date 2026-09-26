import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BoneHand} from '../characters/BoneHand';
import {HarrySilhouette, MiniSilhouette, VoldemortSilhouette} from '../characters/Figures';
import {Filters} from '../fx/Filters';

// Turnaround sheet for character pieces — not part of the film.
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#3a4458'}}>
    <Filters />
    <svg width={1920} height={1080}>
      <g transform="translate(200 250) rotate(14)"><BoneHand k={2.5} curl={0.72} spread={0.8} thumb={0.8} /></g>
      <g transform="translate(700 1020)"><VoldemortSilhouette k={8} /></g>
      <g transform="translate(1500 1020) scale(-1 1)"><HarrySilhouette k={8.2} /></g>
      <g transform="translate(200 700)"><MiniSilhouette who="voldemort" k={2} /></g>
      <g transform="translate(300 700)"><MiniSilhouette who="harry" k={2} /></g>
    </svg>
  </AbsoluteFill>
);
