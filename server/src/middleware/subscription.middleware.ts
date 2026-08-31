import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { sendApiError } from '../utils/apiError.js';

export type QuotaResource = 'clients' | 'users' | 'orders' | 'storage';

export const checkSubscriptionLimit = (resource: QuotaResource) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const atelierId = req.atelierId || req.body?.atelierId || 'atl-1787175204484';

    try {
      const featureMap: Record<QuotaResource, 'CREATE_ORDER' | 'CREATE_CLIENT' | 'ADD_USER'> = {
        clients: 'CREATE_CLIENT',
        orders: 'CREATE_ORDER',
        users: 'ADD_USER',
        storage: 'CREATE_ORDER'
      };

      await SubscriptionService.assertEntitlement(String(atelierId), featureMap[resource]);
      next();
    } catch (err: any) {
      const isQuota = err.message.startsWith('QUOTA_EXCEEDED');
      const isExpired = err.message.startsWith('SUBSCRIPTION_EXPIRED');

      return sendApiError(
        res,
        403,
        isQuota ? 'SUBSCRIPTION_LIMIT_REACHED' : isExpired ? 'SUBSCRIPTION_EXPIRED' : 'FORBIDDEN',
        err.message
      );
    }
  };
};
