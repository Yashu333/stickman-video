import {Easing, interpolate} from 'remotion';

/** A limb is two segments: upper arm + forearm, or thigh + shin. */
export type Limb = {
  upper: number;
  lower: number;
};

/**
 * Every limb angle is absolute, in degrees, measured on screen:
 * 0 points down, 90 points right, -90 points left, 180 (or -180) points up.
 *
 * `torso` and `head` are measured from straight up: 0 is upright,
 * positive leans right, negative leans left, -90 lies flat with the head left.
 */
export type Pose = {
  torso: number;
  head: number;
  /** How far each shoulder sits from the spine. Use a small value in side view. */
  shoulderWidth: number;
  /** How far the shoulders sag below the neck. Raise it for a slump. */
  shoulderDrop: number;
  leftArm: Limb;
  rightArm: Limb;
  leftLeg: Limb;
  rightLeg: Limb;
};

export type Point = {x: number; y: number};

/** Body proportions at scale 1. */
export const BODY = {
  headRadius: 46,
  neck: 6,
  torso: 175,
  upperArm: 80,
  lowerArm: 78,
  thigh: 100,
  shin: 100,
  stroke: 14,
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const limbStep = (from: Point, angle: number, length: number): Point => ({
  x: from.x + Math.sin(toRadians(angle)) * length,
  y: from.y + Math.cos(toRadians(angle)) * length,
});

const upStep = (from: Point, angle: number, length: number): Point => ({
  x: from.x + Math.sin(toRadians(angle)) * length,
  y: from.y - Math.cos(toRadians(angle)) * length,
});

/**
 * Where each joint lands for a pose. The hip is the origin of the figure, so
 * (x, y) is the hip position. Pass x, y and scale for canvas coordinates, for
 * example to put a phone in the stickman's hand.
 */
export const getJoints = (pose: Pose, x = 0, y = 0, scale = 1) => {
  const hip: Point = {x: 0, y: 0};
  const neck = upStep(hip, pose.torso, BODY.torso);
  const head = upStep(neck, pose.head, BODY.neck + BODY.headRadius);

  // Shoulders sit either side of the neck, perpendicular to the spine.
  const across = {
    x: Math.cos(toRadians(pose.torso)) * pose.shoulderWidth,
    y: Math.sin(toRadians(pose.torso)) * pose.shoulderWidth,
  };
  const sag = upStep({x: 0, y: 0}, pose.torso, -(pose.shoulderDrop + 8));
  const leftShoulder = {
    x: neck.x + sag.x - across.x,
    y: neck.y + sag.y - across.y,
  };
  const rightShoulder = {
    x: neck.x + sag.x + across.x,
    y: neck.y + sag.y + across.y,
  };

  const leftElbow = limbStep(leftShoulder, pose.leftArm.upper, BODY.upperArm);
  const leftHand = limbStep(leftElbow, pose.leftArm.lower, BODY.lowerArm);
  const rightElbow = limbStep(rightShoulder, pose.rightArm.upper, BODY.upperArm);
  const rightHand = limbStep(rightElbow, pose.rightArm.lower, BODY.lowerArm);

  const leftKnee = limbStep(hip, pose.leftLeg.upper, BODY.thigh);
  const leftFoot = limbStep(leftKnee, pose.leftLeg.lower, BODY.shin);
  const rightKnee = limbStep(hip, pose.rightLeg.upper, BODY.thigh);
  const rightFoot = limbStep(rightKnee, pose.rightLeg.lower, BODY.shin);

  const place = (point: Point): Point => ({
    x: x + point.x * scale,
    y: y + point.y * scale,
  });

  return {
    hip: place(hip),
    neck: place(neck),
    head: place(head),
    leftShoulder: place(leftShoulder),
    rightShoulder: place(rightShoulder),
    leftElbow: place(leftElbow),
    leftHand: place(leftHand),
    rightElbow: place(rightElbow),
    rightHand: place(rightHand),
    leftKnee: place(leftKnee),
    leftFoot: place(leftFoot),
    rightKnee: place(rightKnee),
    rightFoot: place(rightFoot),
  };
};

/** The hip height that plants the lower foot on the floor, whatever the pose. */
export const hipYOnFloor = (pose: Pose, floorY: number, scale = 1) => {
  const {leftFoot, rightFoot} = getJoints(pose);
  const lowestFoot = Math.max(leftFoot.y, rightFoot.y);
  return floorY - (lowestFoot + BODY.stroke / 2) * scale;
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({
  upper: mix(a.upper, b.upper, t),
  lower: mix(a.lower, b.lower, t),
});

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  torso: mix(a.torso, b.torso, t),
  head: mix(a.head, b.head, t),
  shoulderWidth: mix(a.shoulderWidth, b.shoulderWidth, t),
  shoulderDrop: mix(a.shoulderDrop, b.shoulderDrop, t),
  leftArm: mixLimb(a.leftArm, b.leftArm, t),
  rightArm: mixLimb(a.rightArm, b.rightArm, t),
  leftLeg: mixLimb(a.leftLeg, b.leftLeg, t),
  rightLeg: mixLimb(a.rightLeg, b.rightLeg, t),
});

export const SMOOTH = Easing.bezier(0.45, 0, 0.2, 1);

/**
 * Smoothly moves from one pose to another over a frame range.
 * Holds `from` before the range and `to` after it.
 *
 *   interpolatePose(frame, [30, 60], standing, armsUp)
 */
export const interpolatePose = (
  frame: number,
  [start, end]: readonly [number, number],
  from: Pose,
  to: Pose,
  easing: (t: number) => number = SMOOTH,
): Pose => {
  const t = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  return mixPose(from, to, t);
};

export type PoseKey = {
  /** The frame this pose is fully reached. */
  at: number;
  pose: Pose;
  /** Easing for the move into this pose. */
  easing?: (t: number) => number;
};

/**
 * Chains interpolatePose through a list of poses, in frame order. Repeat a pose
 * at a later frame to hold it.
 */
export const animatePose = (frame: number, keys: readonly PoseKey[]): Pose => {
  const nextIndex = keys.findIndex((key) => frame < key.at);
  if (nextIndex === -1) {
    return keys[keys.length - 1].pose;
  }
  if (nextIndex === 0) {
    return keys[0].pose;
  }
  const previous = keys[nextIndex - 1];
  const next = keys[nextIndex];
  return interpolatePose(
    frame,
    [previous.at, next.at],
    previous.pose,
    next.pose,
    next.easing,
  );
};
