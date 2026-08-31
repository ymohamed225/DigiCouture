import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';

export const checkSubscription = (feature: 'CREATE_ORDER' | 'CREATE_CLIENT' | 'ADD_USER') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const atelierId = req.body?.atelierId || req.query?.atelierId || (req as any).user?.atelierId || 'atl-1787175204484';
      
      await SubscriptionService.assertEntitlement(String(atelierId), feature);
      next();
    } catch (err: any) {
      const isQuota = err.message.startsWith('QUOTA_EXCEEDED');
      const isExpired = err.message.startsWith('SUBSCRIPTION_EXPIRED');
      const isSuspended = err.message.startsWith('ACCOUNT_SUSPENDED');

      return res.status(403).json({
        success: false,
        error: isQuota ? 'QUOTA_EXCEEDED' : isExpired ? 'SUBSCRIPTION_EXPIRED' : isSuspended ? 'ACCOUNT_SUSPENDED' : 'FORBIDDEN',
        message: err.message,
        isExpired,
        isQuota,
        isSuspended
      });
    }
  };
};
