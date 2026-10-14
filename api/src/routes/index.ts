import { Router } from 'express';
import { pool } from '../database/db.js';
import { authRoutes } from '../modules/auth/auth.routes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;

  try {
    await pool.query('SELECT 1');
  } catch {
    return void res.status(503).json({ status: 'error' });
  }

  const healthy = heapMb < 300;
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? 'ok' : 'error', heapMb: Math.round(heapMb) });
});

router.use("/auth", authRoutes);



export default router;
