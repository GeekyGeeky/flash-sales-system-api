import winston from "winston";
import env from "./environment";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  return env.NODE_ENV === "development" ? "debug" : "info";
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Add colors to winston
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define where to store logs
const transports = [
  // Console output
  new winston.transports.Console(),

  // Save all logs to logs/all.log
  new winston.transports.File({
    filename: "logs/all.log",
  }),

  // Save error logs to logs/error.log
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
