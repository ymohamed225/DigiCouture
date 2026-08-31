import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requireDatabase } from './middleware/db.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { isMySqlConnected } from './config/database.js';
import { logger } from './utils/logger.js';

import { authRouter } from './modules/auth/auth.routes.js';
import { ateliersRouter } from './modules/ateliers/ateliers.routes.js'; // fallback compatibility
import { clientsRouter } from './modules/clients/clients.routes.js';
import { measurementsRouter } from './modules/measurements/measurements.routes.js';
import { ordersRouter, portalRouter } from './modules/orders/orders.routes.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { cinetpayRouter } from './modules/cinetpay/cinetpay.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { productionRouter } from './modules/production/production.routes.js';
import { fittingsRouter } from './modules/fittings/fittings.routes.js';
import { receiptsRouter } from './modules/receipts/receipts.routes.js';
import { uploadsRouter } from './modules/uploads/uploads.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { subscriptionRouter } from './modules/subscription/subscription.routes.js';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes.js';
import { catalogueRouter } from './modules/catalogue/catalogue.routes.js';
import { syncRouter } from './modules/sync/sync.routes.js';
import { superAdminRouter } from './modules/admin/super-admin.routes.js';
import { healthRouter } from './modules/health/health.routes.js';

export const app = express();

// 1. En-têtes de Sécurité HTTP avec Helmet (Anti-XSS, Anti-Sniffing, HSTS)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Configuration CORS sécurisée
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'https://digicouture.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Accès CORS bloqué par la politique de sécurité DigiCouture VIP.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Atelier-Id', 'X-Idempotency-Key']
}));

app.use(express.json({ limit: '10mb' }));

// 3. Rate Limiter Global API (100 requêtes / min par IP)
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: 'TOO_MANY_REQUESTS',
    message: 'Limite globale de requêtes API atteinte (100 req/min). Veuillez patienter.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. Rate Limiter Sensible Authentification & OTP (10 requêtes / min par IP)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'TOO_MANY_AUTH_ATTEMPTS',
    message: 'Trop de tentatives d\'authentification/OTP. Veuillez patienter 60 secondes par sécurité.'
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api', globalApiLimiter);
  app.use('/api/auth', authLimiter);
}

// ── Request Logger structuré (méthode, path, status, durée)
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - t0;
    const lvl = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[lvl](
      { method: req.method, path: req.path, status: res.statusCode, ms },
      `${req.method} ${req.path} ${res.statusCode} (${ms}ms)`
    );
  });
  next();
});

// ── Health Checks (AVANT requireDatabase — doit répondre même si la BDD est down)
app.use('/health', healthRouter);
// Rétrocompatibilité : /api/health redirige vers /health
app.use('/api/health', healthRouter);

// ── Middleware de contrôle strict BDD (RÈGLE ABSOLUE N°2)
app.use('/api', requireDatabase);

// ── Modules de l'Application SaaS Multi-Tenant (RÈGLE ABSOLUE N°3 & RBAC)
app.use('/api/auth', authRouter);
app.use('/api/ateliers', ateliersRouter);
app.use('/api/users', usersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/portal', portalRouter);
app.use('/api/production', productionRouter);
app.use('/api/fittings', fittingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/payments/cinetpay', cinetpayRouter);
app.use('/api/webhooks/cinetpay', cinetpayRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/catalogue', catalogueRouter);
app.use('/api', catalogueRouter);
app.use('/api/sync', syncRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/super-admin', superAdminRouter);
app.use('/api/audit-logs', auditRouter);

// ── Handler global d'erreurs
app.use(errorHandler);

