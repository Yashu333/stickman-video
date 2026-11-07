import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Accent, Caption} from '../components/Caption';
import {Floor, Phone} from '../components/Props';
import {Scene} from '../components/Scene';
import {animatePose, getJoints, hipYOnFloor} from '../stickman/pose';
import {holdingPhone, slumped, standing} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';

const SCALE = 1.35;
const FLOOR = 1540;
const HIP_X = 470;

export const NoReplies = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const base = animatePose(frame, [
    {at: 12, pose: standing},
    {at: 36, pose: holdingPhone},
    {at: 106, pose: holdingPhone},
    {at: 136, pose: slumped},
  ]);

  // Thumb scroll: the hand bobs while refreshing, then goes still on "0 replies".
  const scrollAmount = interpolate(frame, [36, 42, 60, 66], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scroll = Math.sin(frame * 0.7) * 5 * scrollAmount;
  const pose = {
    ...base,
    rightArm: {
      upper: base.rightArm.upper,
      lower: base.rightArm.lower + scroll,
    },
  };

  const hipY = hipYOnFloor(pose, FLOOR, SCALE);
  const hand = getJoints(pose, HIP_X, hipY, SCALE).rightHand;

  const phoneTilt = interpolate(frame, [12, 36, 106, 136], [20, -6, -6, 62], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const face: Face = frame < 70 ? 'neutral' : frame < 100 ? 'surprised' : 'sad';

  return (
    <Scene
      duration={7 * fps}
      overlay={
        <Caption appearAt={66} top={380} fontSize={170}>
          <Accent>0</Accent> replies
        </Caption>
      }
    >
      <Floor y={FLOOR} />
      <Stickman
        x={HIP_X}
        y={hipY}
        scale={SCALE}
        pose={pose}
        face={face}
        gaze={7}
      />
      <Phone x={hand.x + 6} y={hand.y - 44} tilt={phoneTilt} />
    </Scene>
  );
};
