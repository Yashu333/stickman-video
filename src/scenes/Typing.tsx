import {interpolate, random, useCurrentFrame} from 'remotion';
import {Headline, Slam} from '../components/Caption';
import {Cup, Desk, Floor, Laptop, Stool} from '../components/Props';
import {Camera, Stage} from '../components/Scene';
import {hipYOnFloor} from '../stickman/pose';
import {typing} from '../stickman/poses';
import {Stickman} from '../stickman/Stickman';
import {BLACK, NIGHT, RED, WHITE} from '../theme';

const SCALE = 1.35;
const FLOOR = 1560;
const HIP_X = 270;
const DESK_TOP = 1305;
const CAPTION_BOTTOM = 770;

const CUPS = [
  {at: 150, x: 945, y: 0},
  {at: 168, x: 995, y: 0},
  {at: 186, x: 970, y: -62},
  {at: 204, x: 1045, y: 0},
  {at: 220, x: 1020, y: -62},
];

/** The four camera set-ups, in order. */
const shotFor = (frame: number) => {
  if (frame < 72) {
    return {zoom: interpolate(frame, [0, 72], [1, 1.07]), focusX: 540, focusY: 1300, shake: 2};
  }
  if (frame < 112) {
    return {zoom: 2.7, focusX: 520, focusY: 1250, shake: 7};
  }
  if (frame < 150) {
    return {zoom: 2.9, focusX: 810, focusY: 1140, shake: 4};
  }
  return {zoom: interpolate(frame, [150, 240], [1, 1.17]), focusX: 610, focusY: 1300, shake: 3};
};

const Typist = ({frame}: {frame: number}) => {
  const left = Math.sin(frame * 1.7);
  const right = Math.sin(frame * 1.7 + 2.4);
  const pose = {
    ...typing,
    head: typing.head + Math.sin(frame * 0.5) * 2,
    leftArm: {
      upper: typing.leftArm.upper + left * 2.5,
      lower: typing.leftArm.lower + left * 8,
    },
    rightArm: {
      upper: typing.rightArm.upper + right * 2.5,
      lower: typing.rightArm.lower + right * 8,
    },
  };
  const hipY = hipYOnFloor(pose, FLOOR, SCALE);
  return (
    <>
      <Stool x={HIP_X} top={hipY + 24} floor={FLOOR} />
      <Stickman x={HIP_X} y={hipY} scale={SCALE} pose={pose} gaze={14} />
    </>
  );
};

/** Little key caps that fly off the keyboard while typing. */
const FlyingKeys = ({frame}: {frame: number}) => (
  <g fill={WHITE}>
    {Array.from({length: 9}, (_, index) => {
      const cycle = (frame + index * 5) % 18;
      const generation = Math.floor((frame + index * 5) / 18);
      const startX = 480 + random(`key-x-${index}-${generation}`) * 210;
      const drift = (random(`key-d-${index}-${generation}`) - 0.5) * 7;
      return (
        <rect
          key={index}
          x={-8}
          y={-8}
          width={16}
          height={16}
          rx={3}
          transform={`translate(${startX + drift * cycle} ${DESK_TOP - 40 - cycle * 8 + 0.3 * cycle * cycle}) rotate(${cycle * 24})`}
        />
      );
    })}
  </g>
);

export const Typing = () => {
  const frame = useCurrentFrame();
  const shot = shotFor(frame);
  const written = ((frame + 18) % 54) / 9;

  return (
    <Stage
      palette={NIGHT}
      overlay={
        <>
          <Headline top={150} fontSize={142} color={WHITE}>
            <Slam at={6}>Application</Slam>
          </Headline>
          <Headline top={276} fontSize={470} color={RED}>
            <Slam at={13}>#47</Slam>
          </Headline>
        </>
      }
    >
      <Camera
        zoom={shot.zoom}
        focusX={shot.focusX}
        focusY={shot.focusY}
        anchorY={1340}
        shakeAmount={shot.shake}
      >
        <Floor y={FLOOR} />
        <Desk top={DESK_TOP} floor={FLOOR} />
        <Laptop deskTop={DESK_TOP} written={written} />
        {CUPS.filter((cup) => frame >= cup.at).map((cup) => (
          <Cup key={cup.at} x={cup.x} y={DESK_TOP - 9 + cup.y} size={1} />
        ))}
        <Typist frame={frame} />
        <FlyingKeys frame={frame} />
      </Camera>
      {/* Keeps close-ups clear of the caption block */}
      <rect x={-20} y={-20} width={1120} height={CAPTION_BOTTOM + 20} fill={BLACK} />
    </Stage>
  );
};
