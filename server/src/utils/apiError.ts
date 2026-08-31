import { Response } from 'express';

export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'ORDER_NOT_FOUND'
  | 'CLIENT_NOT_FOUND'
  | 'PAYMENT_ALREADY_PROCESSED'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_LIMIT_REACHED'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR';

export interface StandardApiErrorPayload {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
  };
}

export function sendApiError(
  res: Response,
  statusCode: number,
  code: ApiErrorCode,
  message: string,
  details?: any
) {
  const payload: StandardApiErrorPayload = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(payload);
}
