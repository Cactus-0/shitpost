import puppeteer, { BrowserContext, type Cookie, type SupportedBrowser } from 'puppeteer';
import { cache } from './utils';

const getBrowser = cache((browser: SupportedBrowser) => {
  return puppeteer.launch({
    browser,
    downloadBehavior: { policy: 'deny' },
  })
});

export interface UseContextOptions {
  readonly cookies: Cookie[];
  readonly disposeContext: boolean;
  readonly browser: SupportedBrowser;
}

export async function useContext({
  cookies,
  disposeContext,
  browser: browserIdentifier,
}: UseContextOptions): Promise<BrowserContext & AsyncDisposable> {
  const browser = await getBrowser(browserIdentifier);
  const context = await browser.createBrowserContext({
    downloadBehavior: { policy: 'deny' },
  });
  await context.setCookie(...cookies);

  if (!disposeContext) {
    Object.defineProperty(context, Symbol.dispose, { value: () => {} });
    Object.defineProperty(context, Symbol.asyncIterator, {
      value: Promise.resolve,
    });
  }

  return context as BrowserContext & AsyncDisposable;
}
