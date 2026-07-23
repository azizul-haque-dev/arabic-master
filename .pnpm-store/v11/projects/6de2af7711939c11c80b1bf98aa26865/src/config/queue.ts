import { Queue } from "bullmq";
import { queueRedis } from "./redis.js";

export const myQueue = new Queue("myQueue", { connection: queueRedis });
