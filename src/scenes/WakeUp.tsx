import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  AlarmClock,
  BED,
  BedBlanket,
  BedFrame,
  Floor,
  RingLines,
  SleepingZ,
} from '../components/Props';
import {Scene} from '../components/Scene';
import {animatePose} from '../stickman/pose';
import {
  asleep,
  reachingForClock,
  sittingInBed,
  startled,
  stretching,
} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';
import {INK} from '../theme';

const SCALE = 1.35;
const HIP_X = 564;
const HIP_Y = 1225;
const CLOCK = {x: 305, y: 880};

const RING_START = 38;
const RING_STOP = 92;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const WakeUp = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pose = animatePose(frame, [
    {at: 44, pose: asleep},
    {at: 50, pose: startled},
    {at: 58, pose: startled},
    {at: 76, pose: sittingInBed},
    {at: 90, pose: reachingForClock},
    {at: 94, pose: reachingForClock},
    {at: 106, pose: sittingInBed},
    {at: 112, pose: sittingInBed},
    {at: 132, pose: stretching},
  ]);

  const face: Face =
    frame < 46 ? 'asleep' : frame < 94 ? 'surprised' : frame < 108 ? 'neutral' : 'happy';

  const ringing = frame >= RING_START && frame < RING_STOP;
  const clockTilt = ringing ? Math.sin(frame * 2.1) * 8 : 0;
  const clockSquash = interpolate(frame, [90, 93, 104], [1, 0.86, 1], clamp);

  const blanketLeft = interpolate(frame, [58, 76], [372, 500], clamp);
  const breathing = frame < RING_START ? (Math.sin((frame / fps) * 3) + 1) * 4 : 0;

  // The torso sways slowly once the stretch reaches the top.
  const sway = interpolate(frame, [132, 150], [0, 1], clamp);

  return (
    <Scene duration={5 * fps} fadeIn={false}>
      <g transform="translate(0 -170)">
        <Floor y={BED.floor} />
        {/* Wall shelf holding the alarm clock */}
        <line
          x1={170}
          y1={960}
          x2={440}
          y2={960}
          stroke={INK}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <AlarmClock
          x={CLOCK.x}
          y={CLOCK.y}
          tilt={clockTilt}
          squash={clockSquash}
        />
        {ringing ? (
          <RingLines
            x={CLOCK.x}
            y={CLOCK.y}
            radius={84}
            phase={(frame - RING_START) / 14}
          />
        ) : null}

        <BedFrame />
        <Stickman
          x={HIP_X}
          y={HIP_Y}
          scale={SCALE}
          pose={{...pose, torso: pose.torso + sway * 1.5}}
          face={face}
        />
        <BedBlanket left={blanketLeft} rise={breathing} />

        {[0, 1, 2].map((index) => {
          const cycle = (frame + index * 14) % 42;
          const opacity =
            frame < RING_START
              ? interpolate(cycle, [0, 8, 32, 42], [0, 1, 1, 0], clamp)
              : 0;
          return (
            <SleepingZ
              key={index}
              x={372 + cycle * 3}
              y={1150 - cycle * 4}
              size={54 + index * 14}
              opacity={opacity}
            />
          );
        })}
      </g>
    </Scene>
  );
};
