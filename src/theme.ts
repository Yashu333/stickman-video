import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const BLACK = '#000000';
export const WHITE = '#FFFFFF';
export const RED = '#EB1C2D';
export const RED_DEEP = '#C8101F';
export const CHARCOAL = '#1C1C1C';

export const FONT_FAMILY = 'Instrument Sans';

export type Palette = {
  /** Canvas colour. */
  bg: string;
  /** Lines and the stickman. */
  ink: string;
  /** Fill inside shapes, so props hide what is behind them. */
  paper: string;
  /** The solid block below the floor line. */
  floor: string;
};

export const NIGHT: Palette = {bg: BLACK, ink: WHITE, paper: BLACK, floor: CHARCOAL};
export const DAY: Palette = {bg: WHITE, ink: BLACK, paper: WHITE, floor: BLACK};
export const ALERT: Palette = {bg: RED, ink: WHITE, paper: RED, floor: BLACK};

// loadFont holds the render with delayRender until the bundled file is ready.
loadFont({
  family: FONT_FAMILY,
  url: staticFile('fonts/instrument-sans-latin-700-normal.woff2'),
  weight: '700',
});
