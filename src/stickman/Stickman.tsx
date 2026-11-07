import {usePalette} from '../components/Scene';
import {BODY, getJoints, type Point, type Pose} from './pose';

export type Face = 'none' | 'asleep' | 'neutral' | 'sad' | 'happy' | 'surprised';

export type StickmanProps = {
  /** Hip position on the canvas. */
  x: number;
  y: number;
  scale?: number;
  pose: Pose;
  face?: Face;
  /** Slides the face sideways so the stickman looks left (-) or right (+). */
  gaze?: number;
};

const toPoints = (...points: Point[]) =>
  points.map((point) => `${point.x},${point.y}`).join(' ');

const FaceMarks = ({face, gaze}: {face: Face; gaze: number}) => {
  const {ink} = usePalette();
  if (face === 'none') {
    return null;
  }

  const leftEye = gaze - 15;
  const rightEye = gaze + 15;
  const eyes =
    face === 'asleep' ? (
      <>
        <line x1={leftEye - 7} y1={-6} x2={leftEye + 7} y2={-6} strokeWidth={5} />
        <line x1={rightEye - 7} y1={-6} x2={rightEye + 7} y2={-6} strokeWidth={5} />
      </>
    ) : (
      <>
        <circle cx={leftEye} cy={-7} r={5} fill={ink} stroke="none" />
        <circle cx={rightEye} cy={-7} r={5} fill={ink} stroke="none" />
      </>
    );

  return (
    <g strokeWidth={5}>
      {eyes}
      {face === 'neutral' ? (
        <line x1={gaze - 9} y1={18} x2={gaze + 9} y2={18} />
      ) : null}
      {face === 'sad' ? (
        <path d={`M ${gaze - 13} 24 Q ${gaze} 10 ${gaze + 13} 24`} />
      ) : null}
      {face === 'happy' ? (
        <path d={`M ${gaze - 18} 10 Q ${gaze} 36 ${gaze + 18} 10`} />
      ) : null}
      {face === 'surprised' ? (
        <ellipse cx={gaze} cy={20} rx={8} ry={10} />
      ) : null}
    </g>
  );
};

export const Stickman = ({
  x,
  y,
  scale = 1,
  pose,
  face = 'neutral',
  gaze = 0,
}: StickmanProps) => {
  const joints = getJoints(pose);
  const {ink, paper} = usePalette();

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke={ink}
      strokeWidth={BODY.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={toPoints(joints.hip, joints.leftKnee, joints.leftFoot)} />
      <polyline points={toPoints(joints.hip, joints.rightKnee, joints.rightFoot)} />
      <polyline points={toPoints(joints.hip, joints.neck)} />
      <polyline
        points={toPoints(joints.leftShoulder, joints.neck, joints.rightShoulder)}
      />
      <polyline
        points={toPoints(joints.leftShoulder, joints.leftElbow, joints.leftHand)}
      />
      <polyline
        points={toPoints(joints.rightShoulder, joints.rightElbow, joints.rightHand)}
      />
      <circle
        cx={joints.head.x}
        cy={joints.head.y}
        r={BODY.headRadius}
        fill={paper}
      />
      <g
        transform={`translate(${joints.head.x} ${joints.head.y}) rotate(${pose.head})`}
      >
        <FaceMarks face={face} gaze={gaze} />
      </g>
    </g>
  );
};
