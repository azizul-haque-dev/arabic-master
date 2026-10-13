import rateLimit from 'express-rate-limit';

const base = { windowMs: 60_000, standardHeaders: true, legacyHeaders: false } as const;

export const globalLimiter = rateLimit({ ...base, limit: 100 });
export const limit = (max: number) => rateLimit({ ...base, limit: max });
