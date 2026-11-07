import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Headline, Slam} from '../components/Caption';
import {BigPhone, Confetti, Floor, Phone, Rays, RingLines} from '../components/Props';
import {Camera, Stage} from '../components/Scene';
import {animatePose, getJoints, hipYOnFloor} from '../stickman/pose';
import {
  celebrating,
  crouching,
  holdingPhone,
  leaping,
  slumped,
} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';
import {ALERT, BLACK, FONT_FAMILY, NIGHT, RED, WHITE} from '../theme';

const SCALE = 1.4;
const FLOOR = 1530;
const HIP_X = 540;
const JUMP_HEIGHT = 190;

const PHONE_CLOSE_UP = 40;
const CELEBRATION = 64;
const THROW_AT = 94;

const JUMPS = [
  {start: 92, end: 114},
  {start: 124, end: 148},
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const airborne = (frame: number) => {
  for (const {start, end} of JUMPS) {
    if (frame >= start && frame < end) {
      const t = (frame - start) / (end - start);
      return 4 * t * (1 - t) * JUMP_HEIGHT;
    }
  }
  return 0;
};

/** Shake that spikes on each landing and dies away. */
const landingShake = (frame: number) =>
  JUMPS.reduce(
    (total, {end}) =>
      Math.max(total, interpolate(frame, [end, end + 9], [24, 0], clamp)),
    0,
  );

/** The buzz: same tired stickman, phone going off. */
const Buzz = ({frame}: {frame: number}) => {
  const hipY = hipYOnFloor(slumped, FLOOR, SCALE);
  const hand = getJoints(slumped, HIP_X, hipY, SCALE).rightHand;
  const buzz = Math.sin(frame * 2.4) * 8;
  const phone = {x: hand.x + 6 + buzz, y: hand.y - 44};

  return (
    <Stage palette={NIGHT}>
      <Camera
        zoom={interpolate(frame, [0, PHONE_CLOSE_UP], [1, 1.5], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        })}
        focusX={phone.x}
        focusY={phone.y}
        anchorX={phone.x}
        anchorY={phone.y}
      >
        <Floor y={FLOOR} />
        <Stickman x={HIP_X} y={hipY} scale={SCALE} pose={slumped} face="sad" gaze={7} />
        <Phone x={phone.x} y={phone.y} tilt={62 + buzz} />
        <RingLines x={phone.x} y={phone.y} radius={92} phase={frame / 10} />
      </Camera>
    </Stage>
  );
};

/** The message itself, on the phone filling the frame. */
const Message = ({frame}: {frame: number}) => (
  <Stage palette={NIGHT}>
    <Camera shakeAmount={interpolate(frame, [PHONE_CLOSE_UP, CELEBRATION], [10, 2], clamp)}>
      <BigPhone>
        <rect x={190} y={640} width={700} height={560} rx={46} fill={RED} />
        <text
          fontFamily={FONT_FAMILY}
          fontWeight={700}
          fontSize={108}
          letterSpacing="-0.03em"
          fill={WHITE}
        >
          <tspan x={240} y={790}>We’d like to</tspan>
          <tspan x={240} y={920}>offer you</tspan>
          <tspan x={240} y={1050}>the role</tspan>
        </text>
      </BigPhone>
    </Camera>
  </Stage>
);

export const Offer = () => {
  const frame = useCurrentFrame();

  if (frame < PHONE_CLOSE_UP) {
    return <Buzz frame={frame} />;
  }
  if (frame < CELEBRATION) {
    return <Message frame={frame} />;
  }

  const keys = [
    {at: 74, pose: holdingPhone},
    {at: 92, pose: crouching},
    {at: 98, pose: leaping, easing: Easing.out(Easing.cubic)},
    {at: 110, pose: leaping},
    {at: 116, pose: crouching},
    {at: 124, pose: crouching},
    {at: 130, pose: leaping, easing: Easing.out(Easing.cubic)},
    {at: 144, pose: leaping},
    {at: 152, pose: celebrating},
  ];

  const pose = animatePose(frame, keys);

  // After the last landing, the raised arms wave side to side.
  const wave = interpolate(frame, [152, 160], [0, 1], clamp) * Math.sin(frame * 0.34);
  const posed = {
    ...pose,
    torso: pose.torso + wave * 3,
    leftArm: {upper: pose.leftArm.upper + wave * 9, lower: pose.leftArm.lower + wave * 9},
    rightArm: {upper: pose.rightArm.upper + wave * 9, lower: pose.rightArm.lower + wave * 9},
  };

  const hipY = hipYOnFloor(posed, FLOOR, SCALE) - airborne(frame);
  const joints = getJoints(posed, HIP_X, hipY, SCALE);

  // The phone stays in hand until the first leap, then gets thrown up and away.
  const throwPose = animatePose(THROW_AT, keys);
  const throwHipY = hipYOnFloor(throwPose, FLOOR, SCALE) - airborne(THROW_AT);
  const throwHand = getJoints(throwPose, HIP_X, throwHipY, SCALE).rightHand;
  const airTime = frame - THROW_AT;
  const phone =
    frame < THROW_AT
      ? {x: joints.rightHand.x + 6, y: joints.rightHand.y - 44, tilt: -6}
      : {
          x: throwHand.x + airTime * 13,
          y: throwHand.y - 44 - airTime * 44 + 0.9 * airTime * airTime,
          tilt: airTime * 26,
        };

  const face: Face = frame < 88 ? 'surprised' : 'happy';
  const rays = frame * 0.5;
  const headlineSize = 132;

  return (
    <Stage
      palette={ALERT}
      overlay={
        <Headline top={130} fontSize={headlineSize} color={WHITE}>
          <Slam at={CELEBRATION}>We’d</Slam>{' '}
          <Slam at={CELEBRATION + 3}>like</Slam>{' '}
          <Slam at={CELEBRATION + 6}>to</Slam>
          <br />
          <Slam at={CELEBRATION + 10}>offer</Slam>{' '}
          <Slam at={CELEBRATION + 13}>you</Slam>
          <br />
          <Slam
            at={CELEBRATION + 18}
            style={{
              backgroundColor: BLACK,
              padding: '4px 30px 14px',
              marginTop: 18,
              borderRadius: 8,
            }}
          >
            the role
          </Slam>
        </Headline>
      }
    >
      <Rays x={540} y={1000} rotation={rays} />
      <Camera
        zoom={interpolate(frame, [CELEBRATION, 180], [1, 1.05])}
        focusY={FLOOR}
        anchorY={FLOOR}
        shakeAmount={landingShake(frame)}
      >
        <Floor y={FLOOR} />
        <Confetti frame={frame} at={THROW_AT} x={540} y={960} colors={[WHITE, BLACK]} seed="first" />
        <Confetti frame={frame} at={126} x={540} y={960} colors={[WHITE, BLACK]} seed="second" />
        <Stickman
          x={HIP_X}
          y={hipY}
          scale={SCALE}
          pose={posed}
          face={face}
          gaze={frame < 88 ? 7 : 0}
        />
        <Phone x={phone.x} y={phone.y} tilt={phone.tilt} />
      </Camera>
    </Stage>
  );
};
