import type {ReactNode} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {ACCENT, FONT_FAMILY, INK} from '../theme';

/** Highlights part of a caption in the accent colour. */
export const Accent = ({children}: {children: ReactNode}) => (
  <span style={{color: ACCENT}}>{children}</span>
);

export const Caption = ({
  appearAt,
  top,
  fontSize,
  children,
}: {
  /** Frame within the scene that the caption enters. */
  appearAt: number;
  top: number;
  fontSize: number;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const entrance = {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  } as const;

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 80,
        right: 80,
        textAlign: 'center',
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.04,
        letterSpacing: '-0.02em',
        color: INK,
        opacity: interpolate(frame, [appearAt, appearAt + 6], [0, 1], entrance),
        scale: interpolate(frame, [appearAt, appearAt + 14], [0.88, 1], entrance),
        translate: `0px ${interpolate(frame, [appearAt, appearAt + 14], [36, 0], entrance)}px`,
      }}
    >
      {children}
    </div>
  );
};
