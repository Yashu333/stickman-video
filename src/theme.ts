import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const PAPER = '#FFFFFF';
export const INK = '#000000';
export const ACCENT = '#E0142A';

export const FONT_FAMILY = 'Instrument Sans';

// loadFont holds the render with delayRender until the bundled file is ready.
loadFont({
  family: FONT_FAMILY,
  url: staticFile('fonts/instrument-sans-latin-700-normal.woff2'),
  weight: '700',
});
