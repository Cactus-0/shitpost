import { $ } from 'bun';
import { Database } from 'bun:sqlite';
import type { Cookie } from 'puppeteer';

const profilesDict = {
  darwin: '~/Library/Application Support/Firefox/Profiles',
  linux: '~/.mozilla/firefox',
  win32: '~/AppData/Roaming/Mozilla/Firefox/Profiles',
};

const firefoxProfiles =
  process.platform in profilesDict
    ? profilesDict[process.platform as never] as string
    : (() => {
        throw new Error(`Unsupported platform: ${process.platform}`);
      })();

const databasePath = await $`find ${firefoxProfiles} -name cookies.sqlite`
  .text()
  .then((text) => text.split(/\r?\n\r?/)[0].trim());

console.log(`Found database at ${databasePath}`);

function readCookies() {
  using db = new Database(databasePath);

  return db.query('select * from moz_cookies where host like "%.tiktok.com"').all();
}

const cookies = readCookies().map(
  ({ id: _id, expiry, value, sameSite, isSecure, isHttpOnly, host, ...data }: any) =>
    ({
      ...data,
      value,
      size: value.length,
      session: false,
      domain: host,
      sameSite: ['None', 'Lax', 'Script'][sameSite],
      expires: expiry * 1_000,
      secure: !!isSecure,
      httpOnly: !!isHttpOnly,
    }) satisfies Cookie
);

const bytesWritten = await Bun.write('./.data/cookies.json', JSON.stringify(cookies, null, '  '));

console.log(`Wrote ${new Intl.NumberFormat().format(bytesWritten)} bytes to ./.data/cookies.json`);
