import {interpolate, useCurrentFrame} from 'remotion';
import {StageText} from '../components/Caption';
import {BigPhone, Floor, Phone, RainCloud} from '../components/Props';
import {Camera, Stage} from '../components/Scene';
import {animatePose, getJoints, hipYOnFloor} from '../stickman/pose';
import {holdingPhone, slumped} from '../stickman/poses';
import {Stickman, type Face} from '../stickman/Stickman';
import {BLACK, DAY, NIGHT, RED, WHITE} from '../theme';

const SCALE = 1.5;
const FLOOR = 1390;
const HIP_X = 500;

const REFRESH_END = 48;
const WIDE_SHOT = 78;
const CLOUD_AT = 140;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** What the stickman sees: pull to refresh, spinner, then nothing. */
const InboxCloseUp = ({frame}: {frame: number}) => {
  const pull = interpolate(frame, [0, 16, REFRESH_END - 8, REFRESH_END], [0, 1, 1, 0], clamp);
  const thumbY = interpolate(frame, [0, 16, 26], [760, 1120, 1560], clamp);

  return (
    <Stage palette={NIGHT}>
      <Camera zoom={interpolate(frame, [0, WIDE_SHOT], [1, 1.07])}>
        <BigPhone>
          <StageText x={540} y={330} size={84} color={BLACK}>
            Inbox
          </StageText>
          <line x1={190} y1={380} x2={890} y2={380} stroke={BLACK} strokeWidth={9} />
          {frame < REFRESH_END ? (
            <g
              transform={`translate(540 ${520 + pull * 90}) rotate(${frame * 16})`}
              opacity={pull}
            >
              <path
                d="M 0 -58 A 58 58 0 1 1 -58 0"
                fill="none"
                stroke={RED}
                strokeWidth={17}
                strokeLinecap="round"
              />
            </g>
          ) : null}
          <StageText at={REFRESH_END} y={1120} size={720} color={RED}>
            0
          </StageText>
          <StageText at={REFRESH_END + 4} y={1320} size={170} color={BLACK}>
            replies
          </StageText>
          <g fill="none" strokeLinecap="round">
            <line x1={1180} y1={1900} x2={760} y2={thumbY} stroke={BLACK} strokeWidth={118} />
            <line x1={1180} y1={1900} x2={760} y2={thumbY} stroke={WHITE} strokeWidth={92} />
          </g>
        </BigPhone>
      </Camera>
    </Stage>
  );
};

export const NoReplies = () => {
  const frame = useCurrentFrame();

  if (frame < WIDE_SHOT) {
    return <InboxCloseUp frame={frame} />;
  }

  const pose = animatePose(frame, [
    {at: 106, pose: holdingPhone},
    {at: 136, pose: slumped},
  ]);

  const hipY = hipYOnFloor(pose, FLOOR, SCALE);
  const joints = getJoints(pose, HIP_X, hipY, SCALE);
  const phoneTilt = interpolate(frame, [106, 136], [-6, 62], clamp);
  const face: Face = frame < 100 ? 'surprised' : 'sad';
  const zoom = interpolate(frame, [WIDE_SHOT, 210], [1.02, 1.1]);
  const cloudDrop = interpolate(frame, [CLOUD_AT, CLOUD_AT + 8], [-420, 0], {
    ...clamp,
  });

  return (
    <Stage palette={DAY}>
      <Camera zoom={zoom} focusY={1050} anchorY={1050}>
        <StageText at={WIDE_SHOT} y={1320} size={1500} color={RED}>
          0
        </StageText>
        <Floor y={FLOOR} />
        <StageText at={WIDE_SHOT + 4} y={1580} size={170} color={WHITE}>
          replies
        </StageText>
        {/* Behind the stickman, so the rain falls past his head rather than across his face */}
        {frame >= CLOUD_AT ? (
          <RainCloud
            x={joints.head.x}
            y={joints.head.y - 230 + cloudDrop}
            size={1.15}
            frame={frame}
            color={BLACK}
          />
        ) : null}
        <Stickman
          x={HIP_X}
          y={hipY}
          scale={SCALE}
          pose={pose}
          face={face}
          gaze={7}
        />
        <Phone x={joints.rightHand.x + 6} y={joints.rightHand.y - 44} tilt={phoneTilt} />
      </Camera>
    </Stage>
  );
};
