import type {Pose} from './pose';

export const standing: Pose = {
  torso: 0,
  head: 0,
  shoulderWidth: 34,
  shoulderDrop: 4,
  leftArm: {upper: -14, lower: -8},
  rightArm: {upper: 14, lower: 8},
  leftLeg: {upper: -9, lower: -6},
  rightLeg: {upper: 9, lower: 6},
};

// In bed, with the head on the pillow to the left and legs under the blanket.
const legsInBed = {
  leftLeg: {upper: 90, lower: 90},
  rightLeg: {upper: 88, lower: 88},
};

export const asleep: Pose = {
  torso: -82,
  head: -90,
  shoulderWidth: 6,
  shoulderDrop: 2,
  leftArm: {upper: 66, lower: 80},
  rightArm: {upper: 70, lower: 84},
  ...legsInBed,
};

export const startled: Pose = {
  ...asleep,
  torso: -72,
  head: -60,
};

export const sittingInBed: Pose = {
  torso: -6,
  head: -4,
  shoulderWidth: 30,
  shoulderDrop: 8,
  leftArm: {upper: -22, lower: 10},
  rightArm: {upper: 30, lower: 62},
  ...legsInBed,
};

export const reachingForClock: Pose = {
  torso: -18,
  head: -22,
  shoulderWidth: 26,
  shoulderDrop: 4,
  leftArm: {upper: -128, lower: -142},
  rightArm: {upper: 30, lower: 62},
  ...legsInBed,
};

export const stretching: Pose = {
  torso: 2,
  head: 6,
  shoulderWidth: 38,
  shoulderDrop: 0,
  leftArm: {upper: -150, lower: -176},
  rightArm: {upper: 150, lower: 176},
  ...legsInBed,
};

export const holdingPhone: Pose = {
  ...standing,
  head: 10,
  shoulderDrop: 6,
  rightArm: {upper: 38, lower: 148},
};

export const slumped: Pose = {
  ...standing,
  torso: 6,
  head: 26,
  shoulderWidth: 28,
  shoulderDrop: 38,
  leftArm: {upper: -4, lower: -1},
  rightArm: {upper: 10, lower: 30},
};

export const typing: Pose = {
  torso: 10,
  head: 18,
  shoulderWidth: 8,
  shoulderDrop: 6,
  leftArm: {upper: 54, lower: 84},
  rightArm: {upper: 51, lower: 88},
  leftLeg: {upper: 86, lower: 3},
  rightLeg: {upper: 80, lower: -4},
};

export const crouching: Pose = {
  torso: 12,
  head: 6,
  shoulderWidth: 34,
  shoulderDrop: 12,
  leftArm: {upper: -38, lower: -18},
  rightArm: {upper: 42, lower: 28},
  leftLeg: {upper: -56, lower: 22},
  rightLeg: {upper: 56, lower: -22},
};

export const leaping: Pose = {
  torso: 0,
  head: -2,
  shoulderWidth: 38,
  shoulderDrop: 0,
  leftArm: {upper: -140, lower: -168},
  rightArm: {upper: 140, lower: 168},
  leftLeg: {upper: -38, lower: 14},
  rightLeg: {upper: 38, lower: -14},
};

export const celebrating: Pose = {
  ...leaping,
  leftLeg: {upper: -13, lower: -8},
  rightLeg: {upper: 13, lower: 8},
};
