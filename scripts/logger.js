const logLevels = {
    info: 'info',
    warn: 'warn',
    error: 'error',
    success: 'success',
    debug: 'debug'
  };

function log(level, ...args) {
  const logLevelsMap = {
    info: '\x1b[36m[INFO]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    debug: '\x1b[35m[DEBUG]\x1b[0m'
  };
  const prefix = logLevelsMap[level] || '[LOG]';
   const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${prefix}`, ...args);
}

module.exports = { log, logLevels};