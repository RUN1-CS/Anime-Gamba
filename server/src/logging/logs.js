/**
 * Logging utility for AnimeGamba server.
 *
 * This module provides a simple logging function that writes log messages to files based on their source (e.g., "server", "database", "api").
 * Each log message is timestamped and categorized by type (e.g., "info", "warn", "error").
 * The logs are stored in a "logs" directory, with separate log files for each source.
 *
 * Don't worry, these things don't lie.
 * And remember, "Even if it’s meaningless, it isn't worthless."
 */

const path = require("path");
const fs = require("fs");

// Load logging configuration from log_conf.json, which specifies valid sources and types for logging.
const config = require("./log_conf.json");
const logDir = path.join(__dirname, "logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Main logging function that takes a message, type, and source, and writes it to the appropriate log file.
function log(message, type = "info", source = "server") {
  if (Array.isArray(config.sources) && !config.sources.includes(source)) {
    console.warn(`Unknown log source: ${source}. Defaulting to 'server'.`);
    source = "server";
  }
  if (Array.isArray(config.types) && !config.types.includes(type)) {
    console.warn(`Unknown log type: ${type}. Defaulting to 'info'.`);
    type = "info";
  }
  // Format: [timestamp] [TYPE - SOURCE] message
  const logMessage = `${new Date().toISOString()} [${type.toUpperCase()} - ${source}] ${message}\n`;
  console.log(logMessage.trim()); // Also log to console for real-time monitoring
  const logFile = path.join(logDir, `${source}.log`);
  fs.appendFileSync(logFile, logMessage);
}

// "Everything in this world is just a game. And we are just the players."
module.exports = {
  log,
};
