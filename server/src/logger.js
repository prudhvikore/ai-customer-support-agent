import pino from "pino";
import config from "./config.js";

const logger = pino({
  level: config.logLevel || "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "SYS:standard" },
  },
});

export default logger;
