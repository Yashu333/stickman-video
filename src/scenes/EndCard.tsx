import {interpolate, useCurrentFrame} from 'remotion';
import {Headline, Slam} from '../components/Caption';
import {Stage} from '../components/Scene';
import {hipYOnFloor} from '../stickman/pose';
import {walking} from '../stickman/poses';
import {Stickman} from '../stickman/Stickman';
import {NIGHT, RED, WHITE} from '../theme';

const GROUND = 1490;
const WALKER_SCALE = 0.62;

export const EndCard = () => {
  const frame = useCurrentFrame();
  const pose = walking(frame * 0.34);
  const hipY = hipYOnFloor(pose, GROUND, WALKER_SCALE);
  const walkerX = interpolate(frame, [18, 119], [90, 930], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stage
      palette={NIGHT}
      overlay={
        <Headline top={430} fontSize={208} color={WHITE} align="left">
          <Slam at={4} style={{transformOrigin: 'left center'}}>Don’t</Slam>
          <br />
          <Slam at={13} style={{transformOrigin: 'left center'}}>stop</Slam>
          <br />
          <Slam at={22} style={{color: RED, transformOrigin: 'left center'}}>applying.</Slam>
        </Headline>
      }
    >
      <line
        x1={-20}
        y1={GROUND}
        x2={1100}
        y2={GROUND}
        stroke={WHITE}
        strokeWidth={10}
      />
      <Stickman
        x={walkerX}
        y={hipY}
        scale={WALKER_SCALE}
        pose={pose}
        face="happy"
        gaze={12}
      />
    </Stage>
  );
};
