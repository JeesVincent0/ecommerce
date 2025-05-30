import fs from 'fs';
import path from 'path';

const logFile = path.join('logs', 'app.log');

// Ensure the logs folder exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

function getTime() {
  return new Date().toISOString();
}

function writeToFile(level, message) {
  const logMessage = `[${getTime()}] ${level.toUpperCase()}: ${message}\n`;
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

const logger = {
  debug: (msg) => {
    const formattedMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    const log = `[${getTime()}] DEBUG: ${formattedMsg}`;
    console.warn(log);
    writeToFile('debug', formattedMsg);
  },
  info: (msg) => {
    const formattedMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    const log = `[${getTime()}] INFO: ${formattedMsg}`;
    console.warn(log);
    writeToFile('info', formattedMsg);
  },
  warning: (msg) => {
    const log = `[${getTime()}] WARNING: ${msg}`;
    console.warn(log);
    writeToFile('warning', msg);
  },
  error: (msg) => {
    const log = `[${getTime()}] ERROR: ${msg}`;
    console.error(log);
    writeToFile('error', msg);
  },
  critical: (msg) => {
    const log = `[${getTime()}] CRITICAL: ${msg}`;
    console.error(log);
    writeToFile('critical', msg);
  },
};

export default logger;