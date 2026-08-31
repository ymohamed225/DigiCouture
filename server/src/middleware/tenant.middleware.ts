import { Request, Response, NextFunction } from 'express';

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const atelierId = req.query.atelierId || req.headers['x-atelier-id'] || req.body.atelierId;
  if (!atelierId) {
    return res.status(400).json({
      error: 'ATELIER_ID_REQUIRED',
      message: 'Accès refusé : atelierId est obligatoire pour le cloisonnement multi-tenant (RÈGLE ABSOLUE N°3).'
    });
  }
  req.atelierId = String(atelierId);
  next();
};

declare global {
  namespace Express {
    interface Request {
      atelierId?: string;
    }
  }
}
