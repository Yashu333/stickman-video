import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {EndCard} from './scenes/EndCard';
import {NoReplies} from './scenes/NoReplies';
import {Offer} from './scenes/Offer';
import {Typing} from './scenes/Typing';
import {WakeUp} from './scenes/WakeUp';

export const StickmanVideo = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence name="Wake up" from={0} durationInFrames={5 * fps}>
        <WakeUp />
      </Sequence>
      <Sequence name="0 replies" from={5 * fps} durationInFrames={7 * fps}>
        <NoReplies />
      </Sequence>
      <Sequence name="Application #47" from={12 * fps} durationInFrames={8 * fps}>
        <Typing />
      </Sequence>
      <Sequence name="The offer" from={20 * fps} durationInFrames={6 * fps}>
        <Offer />
      </Sequence>
      <Sequence name="End card" from={26 * fps} durationInFrames={4 * fps}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
