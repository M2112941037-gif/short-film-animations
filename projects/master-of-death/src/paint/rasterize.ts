import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FilterDefs} from '../fx/Filters';
import {H, W} from '../theme';

// Turn any of the vector components into pixels, so they can be part of the
// underpainting and get painted like everything else.
export const rasterize = (children: React.ReactNode, w = W, h = H): Promise<HTMLImageElement> => {
  const markup = renderToStaticMarkup(
    React.createElement('svg', {xmlns: 'http://www.w3.org/2000/svg', width: w, height: h, viewBox: `0 0 ${w} ${h}`},
      React.createElement(FilterDefs),
      children,
    ),
  );
  const url = URL.createObjectURL(new Blob([markup], {type: 'image/svg+xml'}));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};
