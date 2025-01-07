/// <reference lib="dom" />

import { sleep } from 'bun';
import type { Cookie } from 'puppeteer';
import { useContext } from './browser.ts';
import * as logger from './logger.ts';

export interface UploadVideoOptions {
  readonly browser: 'chrome' | 'firefox';
  readonly cookies: Cookie[];
  readonly video: Uint8Array;
  readonly description?: string;
  /** @default false */
  readonly disposeContext?: boolean;
}

export async function uploadVideo({
  cookies,
  video,
  description,
  browser,
  disposeContext = false,
}: UploadVideoOptions) {
  await using context = await useContext({ cookies, browser, disposeContext });

  logger.log('opened the browser');

  const page = (await context.targets()?.[0]?.asPage()) ?? (await context.newPage());
  await page.goto('https://www.tiktok.com');

  logger.log('loaded TikTok website');

  // Preventing TikTok from showing tooltips, which may interrupt clicking 'Post' button
  await page.evaluate(() => {
    localStorage.setItem('tiktok_studio_music_lib_tooltip', 'true');
    localStorage.setItem('tiktok_studio_tooltip_shown', 'true');
  });

  await sleep(1_300);

  await page.goto('https://www.tiktok.com/tiktokstudio/upload?from=upload');
  await page.waitForSelector('input[type=file][accept^=video]');
  await sleep(500);

  logger.log('found video input');

  await page.evaluate((video) => {
    const input = document.querySelector<HTMLInputElement>('input[type=file][accept^=video]');

    if (!input) throw new Error('Not found video input');

    function base64ToArrayBuffer(base64: string) {
      const binaryString = atob(base64);
  
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
  
      for (let i = 0; i < length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
  
      return bytes.buffer;
  }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([base64ToArrayBuffer(video)], '.mp4', { type: 'video/mp4' }));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, Buffer.from(video.buffer).toString('base64'));

  logger.log('passed the video to the input');

  await sleep(750);

  if (description) {
    const descriptionContainer = await page.waitForSelector('div[contenteditable]');

    if (!descriptionContainer) {
      throw new Error('Not found description input');
    }

    await descriptionContainer.type(description, { delay: 75 });
    logger.log('typed the description');

    await sleep(750);
  }

  const postButton = await page.waitForSelector(
    'button[data-e2e=post_video_button][aria-disabled=false]'
  );

  await sleep(700);

  await postButton?.click({ delay: 700 });

  logger.log('posted the form');
}
