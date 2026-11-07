import {interpolate, useCurrentFrame} from 'remotion';
import {Headline, Slam} from '../components/Caption';
import {
  AlarmClock,
  BED,
  BedBlanket,
  BedFrame,
  Burst,
  Floor,
  RingLines,
  ShockRings,
  SleepingZ,
  Window,
} from '../components/Props';
import {Camera, Stage} from '../components/Scene';
import {animatePose} from '../stickman/pose';
import {
  asleep,
  reachingForClock,
  sittingInBed,
  startled,
  stretching,
} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';
import {ALERT, DAY, NIGHT, RED, WHITE} from '../theme';

const SCALE = 1.35;
const HIP_X = 564;
const HIP_Y = 1225;
const CLOCK = {x: 305, y: 880};

const RING_START = 38;
const CLOSE_UP_END = 58;
const SMACK = 92;
const MORNING = 98;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Close-up of the alarm going off, filling the frame. */
const AlarmCloseUp = ({frame}: {frame: number}) => (
  <Stage
    palette={ALERT}
    overlay={
      <>
        <Headline top={170} fontSize={210} color={WHITE}>
          <Slam at={RING_START}>BEEP</Slam>
        </Headline>
        <Headline top={1480} fontSize={210} color={WHITE}>
          <Slam at={RING_START + 8}>BEEP</Slam>
        </Headline>
      </>
    }
  >
    <Camera shakeAmount={16}>
      <ShockRings
        x={540}
        y={960}
        phase={(frame - RING_START) / 5}
        color={WHITE}
      />
      <AlarmClock
        x={540}
        y={960}
        tilt={Math.sin(frame * 2.1) * 11}
        size={3.7}
        color={WHITE}
      />
    </Camera>
  </Stage>
);

export const WakeUp = () => {
  const frame = useCurrentFrame();

  if (frame >= RING_START && frame < CLOSE_UP_END) {
    return <AlarmCloseUp frame={frame} />;
  }

  const pose = animatePose(frame, [
    {at: 44, pose: asleep},
    {at: 50, pose: startled},
    {at: 58, pose: startled},
    {at: 74, pose: sittingInBed},
    {at: 90, pose: reachingForClock},
    {at: 94, pose: reachingForClock},
    {at: 106, pose: sittingInBed},
    {at: 110, pose: sittingInBed},
    {at: 130, pose: stretching},
  ]);

  const face: Face =
    frame < RING_START ? 'asleep' : frame < 96 ? 'surprised' : 'happy';

  const isMorning = frame >= MORNING;
  const ringing = frame >= CLOSE_UP_END && frame < SMACK;
  const clockTilt = ringing ? Math.sin(frame * 2.1) * 9 : 0;
  const clockSquash = interpolate(frame, [SMACK - 2, SMACK + 1, SMACK + 10], [1, 0.8, 1], clamp);
  const blanketLeft = interpolate(frame, [58, 74], [372, 500], clamp);
  const breathing = frame < RING_START ? (Math.sin(frame * 0.1) + 1) * 4 : 0;
  const smackShake = interpolate(frame, [SMACK, SMACK + 8], [26, 0], clamp);

  // Slow push onto the sleeper, tight while panicking, then opening up for the stretch.
  const zoom =
    frame < RING_START
      ? interpolate(frame, [0, RING_START], [1, 1.1])
      : isMorning
        ? interpolate(frame, [MORNING, 150], [1.2, 1.04], clamp)
        : 1.16;

  return (
    <Stage
      palette={isMorning ? DAY : NIGHT}
      overlay={
        frame < RING_START ? (
          <Headline top={190} fontSize={190} color={WHITE}>
            <Slam at={3}>Day 112</Slam>
          </Headline>
        ) : null
      }
    >
      <Camera
        zoom={zoom}
        focusX={500}
        focusY={1010}
        anchorY={1010}
        shakeAmount={ringing ? 7 : smackShake}
      >
        <g transform="translate(0 -60)">
          <Floor y={BED.floor} />
          <Window
            x={650}
            y={640}
            width={300}
            height={320}
            body={isMorning ? 'sun' : 'moon'}
            bodyY={
              isMorning ? interpolate(frame, [MORNING, 150], [980, 780], clamp) : 760
            }
          />
          {/* Wall shelf holding the alarm clock */}
          <line
            x1={170}
            y1={960}
            x2={440}
            y2={960}
            stroke={isMorning ? DAY.ink : NIGHT.ink}
            strokeWidth={13}
            strokeLinecap="round"
          />
          <AlarmClock
            x={CLOCK.x}
            y={CLOCK.y}
            tilt={clockTilt}
            squash={clockSquash}
            color={RED}
          />
          {ringing ? (
            <RingLines
              x={CLOCK.x}
              y={CLOCK.y}
              radius={84}
              phase={(frame - CLOSE_UP_END) / 10}
            />
          ) : null}

          <BedFrame />
          <Stickman x={HIP_X} y={HIP_Y} scale={SCALE} pose={pose} face={face} />
          <BedBlanket left={blanketLeft} rise={breathing} />

          {frame >= SMACK && frame < SMACK + 5 ? (
            <Burst
              x={CLOCK.x + 30}
              y={CLOCK.y - 20}
              radius={interpolate(frame, [SMACK, SMACK + 5], [90, 170])}
              color={WHITE}
            />
          ) : null}

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
                size={64 + index * 16}
                opacity={opacity}
              />
            );
          })}
        </g>
      </Camera>
    </Stage>
  );
};
