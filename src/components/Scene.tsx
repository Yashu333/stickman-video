import {createContext, useContext, type ReactNode} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {DAY, type Palette} from '../theme';

const PaletteContext = createContext<Palette>(DAY);
export const usePalette = () => useContext(PaletteContext);

/** New wobble every 4 frames, which reads as redrawn-by-hand animation. */
const BOIL_HOLD = 4;

/** Full-canvas shot: a colour field, an SVG stage with hand-drawn wobble, and HTML on top. */
export const Stage = ({
  palette,
  overlay,
  children,
}: {
  palette: Palette;
  /** HTML drawn above the stage, such as captions. */
  overlay?: ReactNode;
  children?: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <PaletteContext.Provider value={palette}>
      <AbsoluteFill style={{backgroundColor: palette.bg}}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          style={{position: 'absolute', inset: 0}}
        >
          <defs>
            <filter
              id="boil"
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={width}
              height={height}
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={0.009}
                numOctaves={1}
                seed={Math.floor(frame / BOIL_HOLD)}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={9}
                xChannelSelector="R"
                yChannelSelector="G"
              />
              {/* Displacement leaves jagged edges; a tiny blur smooths them back out. */}
              <feGaussianBlur stdDeviation={0.7} />
            </filter>
          </defs>
          <g filter="url(#boil)">{children}</g>
        </svg>
        {overlay}
      </AbsoluteFill>
    </PaletteContext.Provider>
  );
};

/** Moves the point (focusX, focusY) to (anchorX, anchorY) on screen and zooms around it. */
export const Camera = ({
  zoom = 1,
  focusX = 540,
  focusY = 960,
  anchorX = 540,
  anchorY = 960,
  shakeAmount = 0,
  children,
}: {
  zoom?: number;
  focusX?: number;
  focusY?: number;
  anchorX?: number;
  anchorY?: number;
  shakeAmount?: number;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const shakeX = (random(`shake-x-${frame}`) - 0.5) * 2 * shakeAmount;
  const shakeY = (random(`shake-y-${frame}`) - 0.5) * 2 * shakeAmount;
  return (
    <g
      transform={`translate(${anchorX + shakeX} ${anchorY + shakeY}) scale(${zoom}) translate(${-focusX} ${-focusY})`}
    >
      {children}
    </g>
  );
};
