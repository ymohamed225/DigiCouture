import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export const requireIdempotency = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Extraire la clé d'idempotence depuis l'en-tête X-Idempotency-Key ou le corps de la requête
  const rawKey = (
    req.headers['x-idempotency-key'] ||
    req.headers['idempotency-key'] ||
    req.body?.idempotencyKey ||
    req.body?.reference ||
    req.body?.cpay_transaction_id
  )?.toString();

  // Si aucune clé fournie ou déduisible (ex: GET), continuer directement
  if (!rawKey && req.method === 'GET') {
    return next();
  }

  // Clé d'idempotence finale (nommée avec préfixe du chemin d'accès pour isolation)
  const idempotencyKey = rawKey 
    ? `${req.path}:${rawKey}`
    : `${req.path}:${req.body?.orderId || 'ord'}:${req.body?.amount || '0'}:${req.body?.clientId || 'cli'}`;

  const atelierId = req.atelierId || null;

  try {
    // 2. Vérification dans la base de données si cette opération a déjà été exécutée
    const [rows]: any = await pool!.query(
      'SELECT statusCode, responseBody FROM idempotency_keys WHERE idempotencyKey = ?',
      [idempotencyKey]
    );

    if (rows && rows.length > 0) {
      const cached = rows[0];
      console.log(`⚡ [Idempotency] Requête doublon détectée (Key: ${idempotencyKey}). Renvoi du résultat existant sans re-traitement.`);
      
      res.setHeader('X-Idempotent-Replay', 'true');
      const responseData = typeof cached.responseBody === 'string' ? JSON.parse(cached.responseBody) : cached.responseBody;
      return res.status(cached.statusCode).json(responseData);
    }

    // 3. Interception de la réponse originale pour la sauvegarder après exécution
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      const statusCode = res.statusCode || 200;
      const createdAt = new Date().toISOString().split('T')[0];

      // Sauvegarde asynchrone du résultat d'idempotence si le statut est un succès (2xx / 3xx)
      if (statusCode >= 200 && statusCode < 400) {
        const id = `idem-${Date.now()}`;
        pool!.query(
          `INSERT INTO idempotency_keys (id, idempotencyKey, atelierId, statusCode, responseBody, createdAt)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE statusCode=VALUES(statusCode), responseBody=VALUES(responseBody)`,
          [id, idempotencyKey, atelierId, statusCode, JSON.stringify(body), createdAt]
        ).catch(err => {
          console.error('⚠️ [Idempotency Error] Échec sauvegarde de la clé :', err.message);
        });
      }

      return originalJson(body);
    };

    next();
  } catch (err: any) {
    console.error('⚠️ [Idempotency Middleware] Erreur de vérification :', err.message);
    next();
  }
};
