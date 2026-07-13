// Centralized pino logger, emitting structured JSON in every environment
// so logs can be shipped to any aggregator without extra transports.
import pino from "pino";
import { env, isProd } from "./env.js";

export const logger = pino({
  level: isProd ? "info" : "debug",
  base: { env: env.NODE_ENV },
});
