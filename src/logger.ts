import chalk from 'chalk';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const formatDate = (date: Date): string => {
  return dateFormatter.format(date);
};

const logTypeColors = {
  log: chalk.blueBright('log'),
  info: chalk.greenBright('info'),
  warn: chalk.yellowBright('warn'),
  error: chalk.redBright('error'),
};

const logWithTimestamp = (method: 'log' | 'info' | 'warn' | 'error', ...args: unknown[]) => {
  const timestamp = chalk.dim(`[${formatDate(new Date())}]`);
  const logType = logTypeColors[method];
  console[method](timestamp, logType, ...args);
};

export const log = logWithTimestamp.bind(null, 'log');
export const info = logWithTimestamp.bind(null, 'info');
export const warn = logWithTimestamp.bind(null, 'warn');
export const error = logWithTimestamp.bind(null, 'error');
