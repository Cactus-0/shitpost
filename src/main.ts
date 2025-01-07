import { sleep } from 'bun';
import { uploadVideo } from './uploadVideo.ts';

await uploadVideo({
  cookies: await Bun.file('.data/cookies.json').json(),
  browser: 'firefox',
  video: await Bun.file(process.argv.at(-1)!).bytes(),
  description: '#fyp',
});

await sleep(1_000);

process.exit(0);
