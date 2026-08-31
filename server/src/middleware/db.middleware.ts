import { Request, Response, NextFunction } from 'express';
import { isMySqlConnected, pool } from '../config/database.js';
import { sendApiError } from '../utils/apiError.js';

export const requireDatabase = (req: Request, res: Response, next: NextFunction) => {
  if (!isMySqlConnected || !pool) {
    return sendApiError(
      res,
      503,
      'DATABASE_UNAVAILABLE',
      'La base de données MySQL est indisponible. Aucune donnée factice ne sera générée.'
    );
  }
  next();
};
