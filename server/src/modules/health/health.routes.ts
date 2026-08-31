import { Router, Request, Response } from 'express';
import { pool, isMySqlConnected } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export const healthRouter = Router();

const START_TIME = Date.now();

// ─────────────────────────────────────────────────────────────────────────────
// GET /health — État général de l'application (toujours accessible, sans auth)
// ─────────────────────────────────────────────────────────────────────────────
healthRouter.get('/', async (_req: Request, res: Response) => {
  const dbOk = isMySqlConnected && pool !== null;
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  const status = dbOk ? 'healthy' : 'degraded';
  const httpStatus = dbOk ? 200 : 503;

  const payload = {
    status,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbOk ? 'connected' : 'unavailable',
      api: 'online',
    },
  };

  logger.debug({}, `[Health] GET /health → ${status}`);
  return res.status(httpStatus).json(payload);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/database — Probe MySQL avec requête réelle (RÈGLE : pas de fallback fictif)
// ─────────────────────────────────────────────────────────────────────────────
healthRouter.get('/database', async (_req: Request, res: Response) => {
  if (!isMySqlConnected || !pool) {
    logger.warn({}, '[Health] /health/database → pool indisponible');
    return res.status(503).json({
      status: 'unhealthy',
      database: 'DATABASE_UNAVAILABLE',
      latencyMs: null,
      timestamp: new Date().toISOString(),
      message: 'Pool MySQL non initialisé. Aucune donnée fictive ne sera retournée.',
    });
  }

  const t0 = Date.now();
  try {
    // Requête probe légère — SELECT 1 mesure la latence réelle du pool
    await pool.query('SELECT 1 AS probe');
    const latencyMs = Date.now() - t0;

    logger.debug({ latencyMs }, '[Health] /health/database → OK');

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const latencyMs = Date.now() - t0;
    logger.error({ err, latencyMs }, '[Health] /health/database → Erreur requête MySQL');

    return res.status(503).json({
      status: 'unhealthy',
      database: 'DATABASE_UNAVAILABLE',
      latencyMs,
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /health/api — Probe API (retourne toujours 200 si le process tourne)
// ─────────────────────────────────────────────────────────────────────────────
healthRouter.get('/api', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});
