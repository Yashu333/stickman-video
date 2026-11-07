import {Config} from '@remotion/cli/config';

// One render thread keeps an 8GB laptop cool. Slower, but it will not overheat.
Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
