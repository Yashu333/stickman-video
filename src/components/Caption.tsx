import type {CSSProperties, ReactNode} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONT_FAMILY} from '../theme';

const slamEase = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.bezier(0.16, 1, 0.3, 1),
} as const;

/** One word or phrase that drops in hard from oversized. */
export const Slam = ({
  at,
  style,
  children,
}: {
  /** Frame within the scene that it lands. */
  at: number;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: frame < at ? 0 : 1,
        scale: interpolate(frame, [at, at + 6], [1.7, 1], slamEase),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Positioned block of big bold type. Fill it with Slam words. */
export const Headline = ({
  top,
  fontSize,
  color,
  align = 'center',
  children,
}: {
  top: number;
  fontSize: number;
  color: string;
  align?: 'center' | 'left';
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 80,
      right: 80,
      textAlign: align,
      fontFamily: FONT_FAMILY,
      fontWeight: 700,
      fontSize,
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      color,
    }}
  >
    {children}
  </div>
);

/** Oversized type drawn inside the SVG stage, so props can stand in front of it. */
export const StageText = ({
  x = 540,
  y,
  size,
  color,
  at = 0,
  children,
}: {
  x?: number;
  y: number;
  size: number;
  color: string;
  at?: number;
  children: string;
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [at, at + 7], [1.4, 1], slamEase);
  return frame < at ? null : (
    <text
      transform={`translate(${x} ${y}) scale(${scale})`}
      textAnchor="middle"
      fontFamily={FONT_FAMILY}
      fontWeight={700}
      fontSize={size}
      letterSpacing="-0.03em"
      fill={color}
    >
      {children}
    </text>
  );
};
