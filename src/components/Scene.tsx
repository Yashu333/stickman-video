import type {ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const FADE_FRAMES = 7;

/** Full-canvas scene: a short dip through white at each cut, with an SVG stage. */
export const Scene = ({
  duration,
  fadeIn = true,
  fadeOut = true,
  overlay,
  children,
}: {
  duration: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  /** HTML drawn above the SVG stage, such as captions. */
  overlay?: ReactNode;
  children?: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const opacity = Math.min(
    fadeIn
      ? interpolate(frame, [0, FADE_FRAMES], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1,
    fadeOut
      ? interpolate(frame, [duration - FADE_FRAMES, duration], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1,
  );

  return (
    <AbsoluteFill style={{opacity}}>
      {children ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          style={{position: 'absolute', inset: 0}}
        >
          {children}
        </svg>
      ) : null}
      {overlay}
    </AbsoluteFill>
  );
};
