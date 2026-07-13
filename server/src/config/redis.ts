import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisClient = new Redis(`${env.REDIS_URL}`);
