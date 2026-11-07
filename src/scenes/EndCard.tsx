import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../components/Scene';
import {ACCENT, FONT_FAMILY, INK} from '../theme';

export const EndCard = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ease = {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  } as const;

  return (
    <Scene
      duration={4 * fps}
      fadeIn={false}
      fadeOut={false}
      overlay={
        <div
          style={{
            position: 'absolute',
            top: 700,
            left: 80,
            right: 80,
            textAlign: 'center',
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 172,
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            color: INK,
            opacity: interpolate(frame, [4, 14], [0, 1], ease),
            translate: `0px ${interpolate(frame, [4, 26], [60, 0], ease)}px`,
          }}
        >
          Don’t stop
          <br />
          applying.
          <div
            style={{
              height: 20,
              marginTop: 34,
              borderRadius: 10,
              backgroundColor: ACCENT,
              transformOrigin: 'left center',
              scale: `${interpolate(frame, [20, 48], [0, 1], ease)} 1`,
            }}
          />
        </div>
      }
    />
  );
};
