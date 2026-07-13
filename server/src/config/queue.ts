import { Queue } from "bullmq";
import { redisClient } from "./redis.js";

export const myQueue = new Queue("myQueue", { connection: redisClient });
