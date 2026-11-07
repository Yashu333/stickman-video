import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Accent, Caption} from '../components/Caption';
import {Desk, Floor, Laptop, Stool} from '../components/Props';
import {Scene} from '../components/Scene';
import {hipYOnFloor} from '../stickman/pose';
import {typing} from '../stickman/poses';
import {Stickman} from '../stickman/Stickman';
import {INK} from '../theme';

const SCALE = 1.35;
const FLOOR = 1540;
const HIP_X = 270;
const DESK_TOP = 1285;

export const Typing = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Hands alternate quickly; the head nods with the rhythm.
  const left = Math.sin(frame * 1.7);
  const right = Math.sin(frame * 1.7 + 2.4);
  const pose = {
    ...typing,
    head: typing.head + Math.sin(frame * 0.5) * 2,
    leftArm: {
      upper: typing.leftArm.upper + left * 2.5,
      lower: typing.leftArm.lower + left * 7,
    },
    rightArm: {
      upper: typing.rightArm.upper + right * 2.5,
      lower: typing.rightArm.lower + right * 7,
    },
  };

  const hipY = hipYOnFloor(pose, FLOOR, SCALE);

  // A slow push-in so the grind builds. The text restarts as each page fills.
  const zoom = interpolate(frame, [0, 8 * fps], [1, 1.05]);
  const written = ((frame + 18) % 72) / 12;

  return (
    <Scene
      duration={8 * fps}
      overlay={
        <Caption appearAt={14} top={300} fontSize={150}>
          Application
          <br />
          <Accent>#47</Accent>
        </Caption>
      }
    >
      <g
        transform={`translate(540 ${FLOOR}) scale(${zoom}) translate(-540 ${-FLOOR})`}
      >
        <Floor y={FLOOR} />
        <Stool x={HIP_X} top={hipY + 22} floor={FLOOR} />
        <Desk top={DESK_TOP} floor={FLOOR} />
        <Laptop deskTop={DESK_TOP} written={written} />
        <Stickman
          x={HIP_X}
          y={hipY}
          scale={SCALE}
          pose={pose}
          face="neutral"
          gaze={14}
        />
        {/* Motion ticks above the keys */}
        {[0, 1, 2].map((index) =>
          (frame + index) % 3 === 0 ? (
            <line
              key={index}
              x1={500 + index * 48}
              y1={DESK_TOP - 74 - index * 8}
              x2={510 + index * 48}
              y2={DESK_TOP - 104 - index * 8}
              stroke={INK}
              strokeWidth={8}
              strokeLinecap="round"
            />
          ) : null,
        )}
      </g>
    </Scene>
  );
};
