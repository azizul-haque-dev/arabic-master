import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data, message: 'Success' });
}

export function paginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
) {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
