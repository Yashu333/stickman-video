import {Composition} from 'remotion';
import {StickmanVideo} from './StickmanVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="StickmanVideo"
      component={StickmanVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
