// Rate limiters tuned per use case. Auth endpoints get a tighter limit
// since they're the most common target for brute-force/credential
// stuffing attacks; general API traffic gets a more relaxed one.
import rateLimit from "express-rate-limit";
import { RATE_LIMITS } from "@/shared/constants.js";

export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_LIMITER.windowMs,
  limit: RATE_LIMITS.GENERAL_LIMITER.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH_LIMITER.windowMs,
  limit: RATE_LIMITS.AUTH_LIMITER.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});
