import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { uploadVideo } from './uploadVideo';
import { error } from './logger';

const options = await yargs(hideBin(process.argv))
  .scriptName('shitpost')
  .usage('$0 [options] <video>')
  .option('cookies', {
    alias: 'c',
    default: '.data/cookies.json',
    description:
      "Path to cookies file (must satisfy import('puppeteer').Cookie[] interface)." +
      ' Use bun run get-firefox-cookies for getting cookies from Firefox in the necessary format.',
    string: true,
  })
  .option('browser', {
    alias: 'b',
    default: 'firefox',
    string: true,
    choices: ['chrome', 'firefox'],
    description: 'The browser to use',
  })
  .option('description', {
    alias: 'd',
    string: true,
    description: 'Description for the video on TikTok',
  })
  .option('video', {
    alias: 'v',
    requiresArg: true,
    string: true,
    demandOption: true,
  })
  .requiresArg('video')
  .help(true)
  .parse();

await uploadVideo({
  cookies: await Bun.file(options.cookies).json(),
  browser: options.browser as import('puppeteer').SupportedBrowser,
  video: URL.canParse(options.video)
    ? await fetch(options.video).then((response) => response.bytes())
    : await Bun.file(options.video).bytes(),
  description: options.description,
}).catch((reason) => {
  error('failed to post video because of\n', reason);
  process.exit(1);
});

process.exit(0);
