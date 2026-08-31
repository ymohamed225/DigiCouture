import { Request, Response, NextFunction } from 'express';
import { sendApiError, ApiErrorCode } from '../utils/apiError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ [API Error Handler]:', err.message || err);
  const statusCode = err.statusCode || err.status || 500;
  const code: ApiErrorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Une erreur interne est survenue sur le serveur.';

  return sendApiError(res, statusCode, code, message, err.details);
};
