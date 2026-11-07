import {
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Accent, Caption} from '../components/Caption';
import {Floor, Phone, RingLines} from '../components/Props';
import {Scene} from '../components/Scene';
import {animatePose, getJoints, hipYOnFloor} from '../stickman/pose';
import {
  celebrating,
  crouching,
  holdingPhone,
  leaping,
  slumped,
} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';
import {ACCENT, INK} from '../theme';

const SCALE = 1.2;
const FLOOR = 1580;
const HIP_X = 500;
const JUMP_HEIGHT = 240;

const BUZZ_START = 8;
const BUZZ_STOP = 52;
const CAPTION_AT = 54;

const JUMPS = [
  {start: 90, end: 112},
  {start: 122, end: 146},
];

const CONFETTI_AT = 94;
const CONFETTI = Array.from({length: 44}, (_, index) => ({
  angle: random(`angle-${index}`) * Math.PI * 2,
  speed: 10 + random(`speed-${index}`) * 18,
  spin: (random(`spin-${index}`) - 0.5) * 30,
  width: 12 + random(`width-${index}`) * 12,
  height: 22 + random(`height-${index}`) * 14,
  color: index % 3 === 2 ? INK : ACCENT,
}));

const airborne = (frame: number) => {
  for (const {start, end} of JUMPS) {
    if (frame >= start && frame < end) {
      const t = (frame - start) / (end - start);
      return 4 * t * (1 - t) * JUMP_HEIGHT;
    }
  }
  return 0;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Offer = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const pose = animatePose(frame, [
    {at: 28, pose: slumped},
    {at: 46, pose: holdingPhone, easing: Easing.bezier(0.2, 0.9, 0.3, 1)},
    {at: 74, pose: holdingPhone},
    {at: 90, pose: crouching},
    {at: 96, pose: leaping, easing: Easing.out(Easing.cubic)},
    {at: 108, pose: leaping},
    {at: 114, pose: crouching},
    {at: 122, pose: crouching},
    {at: 128, pose: leaping, easing: Easing.out(Easing.cubic)},
    {at: 142, pose: leaping},
    {at: 150, pose: celebrating},
  ]);

  // After the last landing, the raised arms wave side to side.
  const wave = interpolate(frame, [150, 158], [0, 1], clamp) * Math.sin(frame * 0.32);
  const posed = {
    ...pose,
    torso: pose.torso + wave * 3,
    leftArm: {upper: pose.leftArm.upper + wave * 8, lower: pose.leftArm.lower + wave * 8},
    rightArm: {upper: pose.rightArm.upper + wave * 8, lower: pose.rightArm.lower + wave * 8},
  };

  const hipY = hipYOnFloor(posed, FLOOR, SCALE) - airborne(frame);
  const hand = getJoints(posed, HIP_X, hipY, SCALE).rightHand;

  const buzzing = frame >= BUZZ_START && frame < BUZZ_STOP;
  const buzz = buzzing ? Math.sin(frame * 2.4) * 7 : 0;
  const phoneTilt = interpolate(frame, [28, 46], [62, -6], clamp) + buzz;
  const phone = {x: hand.x + 6 + buzz, y: hand.y - 44};

  const face: Face = frame < 28 ? 'sad' : frame < CAPTION_AT ? 'neutral' : frame < 86 ? 'surprised' : 'happy';

  return (
    <Scene
      duration={6 * fps}
      overlay={
        <Caption appearAt={CAPTION_AT} top={210} fontSize={126}>
          We’d like to
          <br />
          offer you
          <br />
          <Accent>the role</Accent>
        </Caption>
      }
    >
      <Floor y={FLOOR} />
      {frame >= CONFETTI_AT
        ? CONFETTI.map((piece, index) => {
            const t = frame - CONFETTI_AT;
            const x = HIP_X + Math.cos(piece.angle) * piece.speed * t;
            const y =
              1040 + Math.sin(piece.angle) * piece.speed * t + 0.42 * t * t;
            return y < FLOOR ? (
              <rect
                key={index}
                x={-piece.width / 2}
                y={-piece.height / 2}
                width={piece.width}
                height={piece.height}
                fill={piece.color}
                transform={`translate(${x} ${y}) rotate(${piece.spin * t})`}
              />
            ) : null;
          })
        : null}
      <Stickman
        x={HIP_X}
        y={hipY}
        scale={SCALE}
        pose={posed}
        face={face}
        gaze={frame < 86 ? 7 : 0}
      />
      <Phone x={phone.x} y={phone.y} tilt={phoneTilt} />
      {buzzing ? (
        <RingLines
          x={phone.x}
          y={phone.y}
          radius={84}
          phase={(frame - BUZZ_START) / 12}
        />
      ) : null}
    </Scene>
  );
};
